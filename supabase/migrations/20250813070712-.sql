-- Secure sensitive reads: user_activities and property_verification_details

-- Ensure RLS is enabled on both tables
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_verification_details ENABLE ROW LEVEL SECURITY;

-- user_activities: drop public SELECT and add owner/admin SELECT policies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_activities' AND policyname = 'Anyone can view user activities'
  ) THEN
    EXECUTE 'DROP POLICY "Anyone can view user activities" ON public.user_activities';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_activities' AND policyname = 'Users can view their own activities'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own activities" ON public.user_activities FOR SELECT USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_activities' AND policyname = 'Admins can view user activities'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view user activities" ON public.user_activities FOR SELECT USING (public.is_admin_request())';
  END IF;
END $$;

-- property_verification_details: drop public SELECT and add owner/admin SELECT policies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'property_verification_details' AND policyname = 'Property verification details are viewable by everyone'
  ) THEN
    EXECUTE 'DROP POLICY "Property verification details are viewable by everyone" ON public.property_verification_details';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'property_verification_details' AND policyname = 'Owners can view their property verification details'
  ) THEN
    EXECUTE 'CREATE POLICY "Owners can view their property verification details" ON public.property_verification_details FOR SELECT USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_verification_details.property_id AND p.user_id = auth.uid()))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'property_verification_details' AND policyname = 'Admins can view all verification details'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view all verification details" ON public.property_verification_details FOR SELECT USING (public.is_admin_request())';
  END IF;
END $$;
