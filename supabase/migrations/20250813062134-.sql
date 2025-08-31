-- Phase 1: Database hardening
-- 1) Create secure admin session helpers

-- Return current admin (id, role) derived from request header x-admin-session if valid;
-- fallback to session variable app.current_admin_role for backward compatibility
CREATE OR REPLACE FUNCTION public.get_admin_from_session()
RETURNS TABLE(admin_id uuid, role app_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  headers_text text;
  headers_json jsonb;
  token text;
BEGIN
  headers_text := current_setting('request.headers', true);
  IF headers_text IS NOT NULL AND headers_text <> '' THEN
    headers_json := headers_text::jsonb;
    token := headers_json ->> 'x-admin-session';

    IF token IS NOT NULL AND token <> '' THEN
      RETURN QUERY
      SELECT c.id, c.role
      FROM public.admin_sessions s
      JOIN public.admin_credentials c ON s.admin_id = c.id
      WHERE s.session_token = token
        AND s.expires_at > now()
        AND c.is_active = true
      LIMIT 1;
      IF FOUND THEN
        RETURN; -- already returned valid row
      END IF;
    END IF;
  END IF;

  -- Backward compatible fallback: use session variable set by set_admin_session()
  -- Note: admin_id is unknown in this path
  BEGIN
    IF current_setting('app.current_admin_role', true) IN ('admin','superadmin','super_super_admin') THEN
      RETURN QUERY
      SELECT NULL::uuid, current_setting('app.current_admin_role', true)::app_role;
      RETURN;
    END IF;
  EXCEPTION WHEN others THEN
    -- ignore if setting not present
    NULL;
  END;

  -- No valid admin session
  RETURN; 
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_session_valid(min_role app_role DEFAULT 'admin')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  r record;
  ok boolean := false;
BEGIN
  SELECT * INTO r FROM public.get_admin_from_session();
  IF r.role IS NULL THEN
    RETURN false;
  END IF;

  IF min_role = 'admin'::app_role THEN
    ok := (r.role IN ('admin','superadmin','super_super_admin'));
  ELSIF min_role = 'superadmin'::app_role THEN
    ok := (r.role IN ('superadmin','super_super_admin'));
  ELSIF min_role = 'super_super_admin'::app_role THEN
    ok := (r.role = 'super_super_admin');
  END IF;

  RETURN ok;
END;
$$;

-- Replace insecure admin checks
CREATE OR REPLACE FUNCTION public.is_admin_request()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_admin_session_valid('admin'::app_role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_admin_session_valid('admin'::app_role)
$$;

-- 2) Tighten RLS to protect PII and fix privilege escalation

-- property_inquiries: remove public SELECT and restrict to admins + owners
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'property_inquiries' AND policyname = 'Anyone can view property inquiries'
  ) THEN
    EXECUTE 'DROP POLICY "Anyone can view property inquiries" ON public.property_inquiries';
  END IF;
END $$;

CREATE POLICY IF NOT EXISTS "Admins can view all property inquiries"
ON public.property_inquiries
FOR SELECT
USING (public.is_admin_session_valid('admin'));

CREATE POLICY IF NOT EXISTS "Owners can view inquiries for their properties"
ON public.property_inquiries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties p 
    WHERE p.id = property_inquiries.property_id 
      AND p.user_id = auth.uid()
  )
);

-- user_activities: remove public SELECT; allow admins and owners
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_activities' AND policyname = 'Anyone can view user activities'
  ) THEN
    EXECUTE 'DROP POLICY "Anyone can view user activities" ON public.user_activities';
  END IF;
END $$;

CREATE POLICY IF NOT EXISTS "Admins can view all user activities"
ON public.user_activities
FOR SELECT
USING (public.is_admin_session_valid('admin'));

CREATE POLICY IF NOT EXISTS "Users can view their own activities"
ON public.user_activities
FOR SELECT
USING (auth.uid() = user_id);

-- property_verification_details: remove public SELECT; allow admins + owners; tighten INSERT
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'property_verification_details' AND policyname = 'Property verification details are viewable by everyone'
  ) THEN
    EXECUTE 'DROP POLICY "Property verification details are viewable by everyone" ON public.property_verification_details';
  END IF;
END $$;

CREATE POLICY IF NOT EXISTS "Admins can view all verification details"
ON public.property_verification_details
FOR SELECT
USING (public.is_admin_session_valid('admin'));

CREATE POLICY IF NOT EXISTS "Owners can view their verification details"
ON public.property_verification_details
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties p 
    WHERE p.id = property_verification_details.property_id 
      AND p.user_id = auth.uid()
  )
);

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'property_verification_details' AND policyname = 'Authenticated users can submit verification details'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated users can submit verification details" ON public.property_verification_details';
  END IF;
END $$;

CREATE POLICY IF NOT EXISTS "Owners can submit verification details"
ON public.property_verification_details
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties p 
    WHERE p.id = property_verification_details.property_id 
      AND p.user_id = auth.uid()
  )
);

-- user_roles: remove self-managed ALL policy; allow only superadmins to manage roles
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Authenticated users can manage roles'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated users can manage roles" ON public.user_roles';
  END IF;
END $$;

CREATE POLICY IF NOT EXISTS "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.is_admin_session_valid('superadmin'))
WITH CHECK (public.is_admin_session_valid('superadmin'));

-- 3) Update admin management functions to use new session model and role hierarchy

CREATE OR REPLACE FUNCTION public.create_admin_credential(_username text, _password text, _role app_role DEFAULT 'admin'::app_role)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_id UUID;
  caller_role app_role;
BEGIN
  SELECT role INTO caller_role FROM public.get_admin_from_session() LIMIT 1;
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can create admin credentials';
  END IF;
  IF caller_role NOT IN ('super_super_admin','superadmin') THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can create admin credentials';
  END IF;
  IF caller_role = 'superadmin' AND _role IN ('super_super_admin','superadmin') THEN
    RAISE EXCEPTION 'Superadmins cannot create super_super_admin or superadmin credentials';
  END IF;

  INSERT INTO public.admin_credentials (username, password_hash, role)
  VALUES (_username, crypt(_password, gen_salt('bf')), _role)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_admin_credential(_admin_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  caller_role app_role;
  target_admin_role app_role;
BEGIN
  SELECT role INTO caller_role FROM public.get_admin_from_session() LIMIT 1;
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can delete admin credentials';
  END IF;

  SELECT role INTO target_admin_role FROM public.admin_credentials WHERE id = _admin_id;
  IF target_admin_role IS NULL THEN
    RAISE EXCEPTION 'Admin credential not found';
  END IF;

  IF caller_role = 'superadmin' AND target_admin_role IN ('super_super_admin','superadmin') THEN
    RAISE EXCEPTION 'Superadmins cannot delete super_super_admin or superadmin accounts';
  END IF;
  IF caller_role NOT IN ('super_super_admin','superadmin') THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can delete admin credentials';
  END IF;

  DELETE FROM public.admin_credentials WHERE id = _admin_id;
  DELETE FROM public.admin_sessions WHERE admin_id = _admin_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_admin_status(_admin_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  caller_role app_role;
  target_admin_role app_role;
  current_status boolean;
BEGIN
  SELECT role INTO caller_role FROM public.get_admin_from_session() LIMIT 1;
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can modify admin status';
  END IF;

  SELECT role, is_active INTO target_admin_role, current_status FROM public.admin_credentials WHERE id = _admin_id;
  IF target_admin_role IS NULL THEN
    RAISE EXCEPTION 'Admin credential not found';
  END IF;

  IF caller_role = 'superadmin' AND target_admin_role IN ('super_super_admin','superadmin') THEN
    RAISE EXCEPTION 'Superadmins cannot modify super_super_admin or superadmin accounts';
  END IF;
  IF caller_role NOT IN ('super_super_admin','superadmin') THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can modify admin status';
  END IF;

  UPDATE public.admin_credentials 
  SET is_active = NOT current_status,
      updated_at = now()
  WHERE id = _admin_id;

  IF current_status = true THEN
    DELETE FROM public.admin_sessions WHERE admin_id = _admin_id;
  END IF;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_admin_username(_admin_id uuid, _new_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  caller_role app_role;
  target_admin_role app_role;
BEGIN
  SELECT role INTO caller_role FROM public.get_admin_from_session() LIMIT 1;
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can update admin usernames';
  END IF;

  SELECT role INTO target_admin_role FROM public.admin_credentials WHERE id = _admin_id;
  IF target_admin_role IS NULL THEN
    RAISE EXCEPTION 'Admin credential not found';
  END IF;

  IF caller_role = 'superadmin' AND target_admin_role IN ('super_super_admin','superadmin') THEN
    RAISE EXCEPTION 'Superadmins cannot modify super_super_admin or superadmin accounts';
  END IF;
  IF caller_role NOT IN ('super_super_admin','superadmin') THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can update admin usernames';
  END IF;

  IF EXISTS (SELECT 1 FROM public.admin_credentials WHERE username = _new_username AND id != _admin_id) THEN
    RAISE EXCEPTION 'Username already exists';
  END IF;

  UPDATE public.admin_credentials 
  SET username = _new_username,
      updated_at = now()
  WHERE id = _admin_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_admin_password(_admin_id uuid, _new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  caller_role app_role;
  target_admin_role app_role;
BEGIN
  SELECT role INTO caller_role FROM public.get_admin_from_session() LIMIT 1;
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can update admin passwords';
  END IF;

  SELECT role INTO target_admin_role FROM public.admin_credentials WHERE id = _admin_id;
  IF target_admin_role IS NULL THEN
    RAISE EXCEPTION 'Admin credential not found';
  END IF;

  IF caller_role = 'superadmin' AND target_admin_role IN ('super_super_admin','superadmin') THEN
    RAISE EXCEPTION 'Superadmins cannot modify super_super_admin or superadmin accounts';
  END IF;
  IF caller_role NOT IN ('super_super_admin','superadmin') THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can update admin passwords';
  END IF;

  UPDATE public.admin_credentials 
  SET password_hash = crypt(_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = _admin_id;
  RETURN FOUND;
END;
$$;
