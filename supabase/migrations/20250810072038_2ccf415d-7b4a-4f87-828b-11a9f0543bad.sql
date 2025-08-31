-- Leads backfill and triggers for inquiries and saved activities (retry with safe phone fallback)
-- 1) Ensure unique index on source to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS leads_unique_source ON public.leads (source_type, source_id) WHERE source_id IS NOT NULL;

-- 2) Backfill from user_inquiries
INSERT INTO public.leads (
  source_type, source_id, name, phone, purpose, property_type, budget_range, location, status, priority, tags
)
SELECT 
  'user_inquiry', ui.id, ui.name, ui.phone, ui.purpose, ui.property_type, ui.budget_range, ui.location,
  'new', 'medium', ARRAY['user_inquiry']
FROM public.user_inquiries ui
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads l WHERE l.source_type = 'user_inquiry' AND l.source_id = ui.id
);

-- 3) Backfill from property_inquiries
INSERT INTO public.leads (
  source_type, source_id, name, phone, purpose, property_id, property_title, status, priority, tags
)
SELECT 
  'property_inquiry', pi.id, pi.user_name, pi.user_phone, pi.inquiry_type, pi.property_id,
  (SELECT title FROM public.properties p WHERE p.id = pi.property_id),
  'new', 'medium', ARRAY['property_inquiry']
FROM public.property_inquiries pi
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads l WHERE l.source_type = 'property_inquiry' AND l.source_id = pi.id
);

-- 4) Backfill from user_activities: property_saved
INSERT INTO public.leads (
  source_type, source_id, name, phone, email, property_id, property_title, city, location, purpose, property_type, status, priority, tags
)
SELECT 
  'manual', ua.id,
  COALESCE(pf.full_name, 'User') AS name,
  COALESCE(pf.phone_number, '') AS phone,
  pf.email AS email,
  ua.property_id,
  pr.title AS property_title,
  pr.city,
  pr.location,
  pr.property_purpose,
  pr.property_type,
  'new', 'medium', ARRAY['property_saved']
FROM public.user_activities ua
LEFT JOIN public.profiles pf ON pf.user_id = ua.user_id
LEFT JOIN public.properties pr ON pr.id = ua.property_id
WHERE ua.activity_type = 'property_saved'
  AND ua.property_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.leads l WHERE l.source_type = 'manual' AND l.source_id = ua.id
  );

-- 5) Trigger: create lead automatically on new user_inquiries
CREATE OR REPLACE FUNCTION public.trg_create_lead_from_user_inquiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.leads (
    source_type, source_id, name, phone, purpose, property_type, budget_range, location, status, priority, tags
  ) VALUES (
    'user_inquiry', NEW.id, NEW.name, NEW.phone, NEW.purpose, NEW.property_type, NEW.budget_range, NEW.location,
    'new', 'medium', ARRAY['user_inquiry']
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_lead_from_user_inquiry ON public.user_inquiries;
CREATE TRIGGER create_lead_from_user_inquiry
AFTER INSERT ON public.user_inquiries
FOR EACH ROW EXECUTE FUNCTION public.trg_create_lead_from_user_inquiry();

-- 6) Trigger: create lead automatically on new property_inquiries
CREATE OR REPLACE FUNCTION public.trg_create_lead_from_property_inquiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prop_title TEXT;
BEGIN
  SELECT title INTO prop_title FROM public.properties WHERE id = NEW.property_id;
  INSERT INTO public.leads (
    source_type, source_id, name, phone, purpose, property_id, property_title, status, priority, tags
  ) VALUES (
    'property_inquiry', NEW.id, NEW.user_name, NEW.user_phone, NEW.inquiry_type, NEW.property_id, prop_title,
    'new', 'medium', ARRAY['property_inquiry']
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_lead_from_property_inquiry ON public.property_inquiries;
CREATE TRIGGER create_lead_from_property_inquiry
AFTER INSERT ON public.property_inquiries
FOR EACH ROW EXECUTE FUNCTION public.trg_create_lead_from_property_inquiry();

-- 7) Trigger: create lead automatically when a user saves a property
CREATE OR REPLACE FUNCTION public.trg_create_lead_from_saved_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prop_title TEXT;
  uname TEXT;
  uphone TEXT;
  uemail TEXT;
BEGIN
  IF NEW.activity_type = 'property_saved' AND NEW.property_id IS NOT NULL THEN
    SELECT title INTO prop_title FROM public.properties WHERE id = NEW.property_id;
    SELECT full_name, phone_number, email INTO uname, uphone, uemail FROM public.profiles WHERE user_id = NEW.user_id;
    INSERT INTO public.leads (
      source_type, source_id, name, phone, email, property_id, property_title, status, priority, tags
    ) VALUES (
      'manual', NEW.id, COALESCE(uname, 'User'), COALESCE(uphone, ''), uemail, NEW.property_id, prop_title, 'new', 'medium', ARRAY['property_saved']
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_lead_from_saved_activity ON public.user_activities;
CREATE TRIGGER create_lead_from_saved_activity
AFTER INSERT ON public.user_activities
FOR EACH ROW EXECUTE FUNCTION public.trg_create_lead_from_saved_activity();