-- Retry: use EXECUTE with single-quoted strings inside DO blocks

-- Ensure RLS is enabled
ALTER TABLE public.property_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop public SELECT policy if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'property_inquiries' AND policyname = 'Anyone can view property inquiries'
  ) THEN
    EXECUTE 'DROP POLICY "Anyone can view property inquiries" ON public.property_inquiries';
  END IF;
END $$;

-- Admins can view all property inquiries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'property_inquiries' AND policyname = 'Admins can view property inquiries'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view property inquiries" ON public.property_inquiries FOR SELECT USING (public.is_admin_request())';
  END IF;
END $$;

-- Property owners can view inquiries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'property_inquiries' AND policyname = 'Property owners can view property inquiries'
  ) THEN
    EXECUTE 'CREATE POLICY "Property owners can view property inquiries" ON public.property_inquiries FOR SELECT USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_inquiries.property_id AND p.user_id = auth.uid()))';
  END IF;
END $$;