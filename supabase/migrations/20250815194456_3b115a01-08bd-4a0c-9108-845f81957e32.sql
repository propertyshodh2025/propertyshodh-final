-- Fix admin credentials security vulnerability - clean approach
-- First, drop ALL existing policies on admin_credentials
DROP POLICY IF EXISTS "Allow authentication functions" ON public.admin_credentials;
DROP POLICY IF EXISTS "Secure admin credentials access" ON public.admin_credentials;
DROP POLICY IF EXISTS "Block all direct access to admin credentials" ON public.admin_credentials;
DROP POLICY IF EXISTS "Allow only secure authentication functions" ON public.admin_credentials;

-- Create the most restrictive RLS policies possible
-- Policy 1: Block ALL direct client access completely
CREATE POLICY "admin_credentials_no_direct_access" 
ON public.admin_credentials 
FOR ALL 
TO public
USING (false) 
WITH CHECK (false);

-- Policy 2: Allow ONLY through security definer functions with proper context
CREATE POLICY "admin_credentials_function_access_only"
ON public.admin_credentials
FOR ALL
TO service_role
USING (
  -- Triple security check:
  -- 1. Function context must be admin_auth
  -- 2. Must be running as service_role  
  -- 3. Additional auth flag must be set
  current_setting('app.function_context', true) = 'admin_auth' 
  AND current_setting('app.admin_auth_active', true) = 'true'
  AND current_user = 'service_role'
)
WITH CHECK (
  current_setting('app.function_context', true) = 'admin_auth'
  AND current_setting('app.admin_auth_active', true) = 'true' 
  AND current_user = 'service_role'
);

-- Update ALL admin management functions to use proper security context
CREATE OR REPLACE FUNCTION public.update_admin_username(_admin_id uuid, _new_username text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_admin_role TEXT;
  target_admin_role TEXT;
BEGIN
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can update admin usernames';
  END IF;
  
  current_admin_role := current_setting('app.current_admin_role', true);
  
  -- Set secure context before accessing admin_credentials
  PERFORM set_config('app.function_context', 'admin_auth', true);
  PERFORM set_config('app.admin_auth_active', 'true', true);
  
  SELECT role INTO target_admin_role 
  FROM public.admin_credentials 
  WHERE id = _admin_id;
  
  IF current_admin_role = 'superadmin' AND target_admin_role IN ('super_super_admin', 'superadmin') THEN
    PERFORM set_config('app.function_context', null, true);
    PERFORM set_config('app.admin_auth_active', null, true);
    RAISE EXCEPTION 'Superadmins cannot modify super_super_admin or superadmin accounts';
  END IF;
  
  IF current_admin_role NOT IN ('super_super_admin', 'superadmin') THEN
    PERFORM set_config('app.function_context', null, true);
    PERFORM set_config('app.admin_auth_active', null, true);
    RAISE EXCEPTION 'Only super super admins and superadmins can update admin usernames';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM public.admin_credentials 
    WHERE username = _new_username AND id != _admin_id
  ) THEN
    PERFORM set_config('app.function_context', null, true);
    PERFORM set_config('app.admin_auth_active', null, true);
    RAISE EXCEPTION 'Username already exists';
  END IF;
  
  UPDATE public.admin_credentials 
  SET username = _new_username,
      updated_at = now()
  WHERE id = _admin_id;
  
  -- Clear security context
  PERFORM set_config('app.function_context', null, true);
  PERFORM set_config('app.admin_auth_active', null, true);
  
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_admin_password(_admin_id uuid, _new_password text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_admin_role TEXT;
  target_admin_role TEXT;
BEGIN
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can update admin passwords';
  END IF;
  
  current_admin_role := current_setting('app.current_admin_role', true);
  
  -- Set secure context
  PERFORM set_config('app.function_context', 'admin_auth', true);
  PERFORM set_config('app.admin_auth_active', 'true', true);
  
  SELECT role INTO target_admin_role 
  FROM public.admin_credentials 
  WHERE id = _admin_id;
  
  IF current_admin_role = 'superadmin' AND target_admin_role IN ('super_super_admin', 'superadmin') THEN
    PERFORM set_config('app.function_context', null, true);
    PERFORM set_config('app.admin_auth_active', null, true);
    RAISE EXCEPTION 'Superadmins cannot modify super_super_admin or superadmin accounts';
  END IF;
  
  IF current_admin_role NOT IN ('super_super_admin', 'superadmin') THEN
    PERFORM set_config('app.function_context', null, true);
    PERFORM set_config('app.admin_auth_active', null, true);
    RAISE EXCEPTION 'Only super super admins and superadmins can update admin passwords';
  END IF;
  
  UPDATE public.admin_credentials 
  SET password_hash = crypt(_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = _admin_id;
  
  -- Clear security context
  PERFORM set_config('app.function_context', null, true);
  PERFORM set_config('app.admin_auth_active', null, true);
  
  RETURN FOUND;
END;
$function$;