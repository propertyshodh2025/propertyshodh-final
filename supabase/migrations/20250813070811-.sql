-- Harden translations table RLS: restrict writes to admin requests only, keep public read
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'translations' AND policyname = 'Anyone can insert translations'
  ) THEN
    EXECUTE 'DROP POLICY "Anyone can insert translations" ON public.translations';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'translations' AND policyname = 'Anyone can update translations'
  ) THEN
    EXECUTE 'DROP POLICY "Anyone can update translations" ON public.translations';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'translations' AND policyname = 'Admin can insert translations'
  ) THEN
    EXECUTE 'CREATE POLICY "Admin can insert translations" ON public.translations FOR INSERT WITH CHECK (public.is_admin_request())';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'translations' AND policyname = 'Admin can update translations'
  ) THEN
    EXECUTE 'CREATE POLICY "Admin can update translations" ON public.translations FOR UPDATE USING (public.is_admin_request()) WITH CHECK (public.is_admin_request())';
  END IF;
END $$;
