-- Fix migration: create policies via DO blocks (CREATE POLICY doesn't support IF NOT EXISTS)

-- property_inquiries policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'property_inquiries' AND policyname = 'Admins can view all property inquiries'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Admins can view all property inquiries"
      ON public.property_inquiries
      FOR SELECT
      USING (public.is_admin_session_valid('admin'))
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'property_inquiries' AND policyname = 'Owners can view inquiries for their properties'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Owners can view inquiries for their properties"
      ON public.property_inquiries
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.properties p 
          WHERE p.id = property_inquiries.property_id 
            AND p.user_id = auth.uid()
        )
      )
    $$;
  END IF;
END $$;

-- user_activities policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_activities' AND policyname = 'Admins can view all user activities'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Admins can view all user activities"
      ON public.user_activities
      FOR SELECT
      USING (public.is_admin_session_valid('admin'))
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_activities' AND policyname = 'Users can view their own activities'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Users can view their own activities"
      ON public.user_activities
      FOR SELECT
      USING (auth.uid() = user_id)
    $$;
  END IF;
END $$;

-- property_verification_details policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'property_verification_details' AND policyname = 'Admins can view all verification details'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Admins can view all verification details"
      ON public.property_verification_details
      FOR SELECT
      USING (public.is_admin_session_valid('admin'))
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'property_verification_details' AND policyname = 'Owners can view their verification details'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Owners can view their verification details"
      ON public.property_verification_details
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.properties p 
          WHERE p.id = property_verification_details.property_id 
            AND p.user_id = auth.uid()
        )
      )
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'property_verification_details' AND policyname = 'Owners can submit verification details'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Owners can submit verification details"
      ON public.property_verification_details
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.properties p 
          WHERE p.id = property_verification_details.property_id 
            AND p.user_id = auth.uid()
        )
      )
    $$;
  END IF;
END $$;

-- user_roles policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Admins can manage roles'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Admins can manage roles"
      ON public.user_roles
      FOR ALL
      USING (public.is_admin_session_valid('superadmin'))
      WITH CHECK (public.is_admin_session_valid('superadmin'))
    $$;
  END IF;
END $$;
