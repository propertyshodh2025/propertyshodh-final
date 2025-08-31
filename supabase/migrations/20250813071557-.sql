-- Secure leads table: ensure only request-bound admins can access
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Replace any broad admin policy with request-bound admin check
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'leads' AND policyname = 'Admin can manage all leads'
  ) THEN
    EXECUTE 'DROP POLICY "Admin can manage all leads" ON public.leads';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'leads' AND policyname = 'Admins can manage all leads (request-bound)'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage all leads (request-bound)" ON public.leads FOR ALL USING (public.is_admin_request()) WITH CHECK (public.is_admin_request())';
  END IF;
END $$;
