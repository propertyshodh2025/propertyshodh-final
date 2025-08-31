-- 1) Enums for lead status & priority
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
    CREATE TYPE public.lead_status AS ENUM (
      'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'archived'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_priority') THEN
    CREATE TYPE public.lead_priority AS ENUM (
      'low', 'medium', 'high', 'urgent'
    );
  END IF;
END $$;

-- 2) Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_type TEXT NOT NULL CHECK (source_type IN ('property_inquiry','user_inquiry','manual')),
  source_id UUID,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  property_id UUID,
  property_title TEXT,
  city TEXT,
  location TEXT,
  budget_range TEXT,
  property_type TEXT,
  purpose TEXT,
  status public.lead_status NOT NULL DEFAULT 'new',
  priority public.lead_priority NOT NULL DEFAULT 'medium',
  tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  assigned_admin_id UUID REFERENCES public.admin_credentials(id),
  next_follow_up_at TIMESTAMPTZ,
  last_contacted_at TIMESTAMPTZ,
  notes TEXT
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Admin can manage all leads
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'leads' AND policyname = 'Admin can manage all leads'
  ) THEN
    CREATE POLICY "Admin can manage all leads"
    ON public.leads
    FOR ALL
    USING (public.is_admin_authenticated())
    WITH CHECK (public.is_admin_authenticated());
  END IF;
END $$;

-- Trigger to maintain updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_leads_updated_at'
  ) THEN
    CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Helpful indexes for Kanban filtering
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_admin ON public.leads(assigned_admin_id);

-- 3) Lead notes table for timeline/comments
CREATE TABLE IF NOT EXISTS public.lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.admin_credentials(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lead_notes' AND policyname = 'Admin can manage all lead notes'
  ) THEN
    CREATE POLICY "Admin can manage all lead notes"
    ON public.lead_notes
    FOR ALL
    USING (public.is_admin_authenticated())
    WITH CHECK (public.is_admin_authenticated());
  END IF;
END $$;

-- 4) Helper function to convert existing inquiries into leads
CREATE OR REPLACE FUNCTION public.create_lead_from_inquiry(_source_type TEXT, _source_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  -- allow only admins
  IF NOT public.is_admin_authenticated() THEN
    RAISE EXCEPTION 'Only admins can create leads from inquiries';
  END IF;

  IF _source_type = 'user_inquiry' THEN
    INSERT INTO public.leads (
      source_type, source_id, name, phone, purpose, property_type, budget_range, location, status, priority, tags
    )
    SELECT 'user_inquiry', ui.id, ui.name, ui.phone, ui.purpose, ui.property_type, ui.budget_range, ui.location,
           'new', 'medium', ARRAY['user_inquiry']
    FROM public.user_inquiries ui WHERE ui.id = _source_id
    RETURNING id INTO new_id;
  ELSIF _source_type = 'property_inquiry' THEN
    INSERT INTO public.leads (
      source_type, source_id, name, phone, purpose, property_id, property_title, status, priority, tags
    )
    SELECT 'property_inquiry', pi.id, pi.user_name, pi.user_phone, pi.inquiry_type, pi.property_id,
           (SELECT title FROM public.properties p WHERE p.id = pi.property_id),
           'new', 'medium', ARRAY['property_inquiry']
    FROM public.property_inquiries pi WHERE pi.id = _source_id
    RETURNING id INTO new_id;
  ELSE
    RAISE EXCEPTION 'Unsupported source_type %', _source_type;
  END IF;

  RETURN new_id;
END;
$$;