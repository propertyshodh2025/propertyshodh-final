-- Fix admin credentials security vulnerability
-- Remove existing vulnerable RLS policies
DROP POLICY IF EXISTS "Allow authentication functions" ON public.admin_credentials;
DROP POLICY IF EXISTS "Secure admin credentials access" ON public.admin_credentials;

-- Create a highly restrictive RLS policy that ONLY allows access through security definer functions
-- This completely blocks direct access to admin_credentials from the API/client
CREATE POLICY "Block all direct access to admin credentials" 
ON public.admin_credentials 
FOR ALL 
USING (false) 
WITH CHECK (false);

-- Create a separate policy that ONLY allows our specific authentication functions to access the table
-- This policy checks that the request is coming from our secure functions AND has proper context
CREATE POLICY "Allow only secure authentication functions"
ON public.admin_credentials
FOR ALL
USING (
  -- Only allow access if ALL of these conditions are met:
  -- 1. The function context is set to admin_auth (our authentication functions set this)
  -- 2. The current role is the service role (only our functions run with service role)
  -- 3. We're in a security definer function context
  current_setting('app.function_context', true) = 'admin_auth' 
  AND current_setting('role', false) = 'service_role'
)
WITH CHECK (
  current_setting('app.function_context', true) = 'admin_auth'
  AND current_setting('role', false) = 'service_role'
);

-- Ensure the authenticate_admin function properly sets all required context
CREATE OR REPLACE FUNCTION public.authenticate_admin(_username text, _password text)
 RETURNS TABLE(id uuid, username text, role app_role, is_active boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  attempt_id uuid;
BEGIN
  -- Set multiple security contexts to ensure maximum protection
  PERFORM set_config('app.function_context', 'admin_auth', true);
  PERFORM set_config('app.admin_auth_active', 'true', true);
  
  -- Check rate limiting first
  IF (
    SELECT COUNT(*) FROM public.admin_login_attempts ala
    WHERE ala.username = _username 
    AND ala.success = false
    AND ala.created_at > NOW() - INTERVAL '1 hour'
  ) >= 5 THEN
    RAISE EXCEPTION 'Too many failed login attempts. Please try again later.';
  END IF;

  -- Log attempt
  INSERT INTO public.admin_login_attempts (username, ip_address, success)
  VALUES (_username, inet_client_addr()::text, false)
  RETURNING admin_login_attempts.id INTO attempt_id;

  -- Authenticate and return results - this is the ONLY place admin_credentials should be queried
  RETURN QUERY
  SELECT 
    ac.id,
    ac.username,
    ac.role,
    ac.is_active
  FROM public.admin_credentials ac
  WHERE ac.username = _username 
    AND ac.password_hash = crypt(_password, ac.password_hash)
    AND ac.is_active = true;
    
  -- Update on success
  IF FOUND THEN
    UPDATE public.admin_credentials 
    SET last_login = now(), updated_at = now()
    WHERE admin_credentials.username = _username;
    
    UPDATE public.admin_login_attempts 
    SET success = true 
    WHERE admin_login_attempts.id = attempt_id;
  END IF;
  
  -- Clear function context for security
  PERFORM set_config('app.function_context', null, true);
  PERFORM set_config('app.admin_auth_active', null, true);
END;
$function$;

-- Update other admin management functions to use the same security pattern
CREATE OR REPLACE FUNCTION public.create_admin_credential(_username text, _password text, _role app_role DEFAULT 'admin'::app_role)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_id UUID;
  current_admin_role TEXT;
  current_admin_id UUID;
BEGIN
  -- Verify the current user has a valid admin session with proper authorization
  SELECT ac.id, ac.role INTO current_admin_id, current_admin_role
  FROM public.admin_credentials ac
  JOIN public.admin_sessions s ON s.admin_id = ac.id
  WHERE s.expires_at > now()
  AND ac.is_active = true
  AND (ac.role = 'super_super_admin' OR ac.role = 'superadmin')
  LIMIT 1;
  
  IF current_admin_id IS NULL THEN
    RAISE EXCEPTION 'Only authenticated super admins and superadmins can create admin credentials';
  END IF;
  
  IF current_admin_role = 'superadmin' AND _role IN ('super_super_admin', 'superadmin') THEN
    RAISE EXCEPTION 'Superadmins cannot create super_super_admin or superadmin credentials';
  END IF;
  
  -- Set secure function context
  PERFORM set_config('app.function_context', 'admin_auth', true);
  
  INSERT INTO public.admin_credentials (username, password_hash, role, created_by)
  VALUES (_username, crypt(_password, gen_salt('bf')), _role, current_admin_id)
  RETURNING id INTO new_id;
  
  -- Clear function context
  PERFORM set_config('app.function_context', null, true);
  
  RETURN new_id;
END;
$function$;