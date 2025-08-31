-- Fix critical security vulnerability in admin_credentials table RLS policy
-- The current policy allows bypass via x-admin-bypass header which can be spoofed

-- Drop the existing insecure policy
DROP POLICY IF EXISTS "Admin bypass for admin credentials management" ON public.admin_credentials;

-- Create a more secure policy that only allows access via authenticated admin sessions
-- or through security definer functions (needed for authentication flow)
CREATE POLICY "Secure admin credentials access"
ON public.admin_credentials
FOR ALL
TO authenticated
USING (
  -- Only allow access if there's a valid admin session
  EXISTS (
    SELECT 1 
    FROM public.admin_sessions s 
    WHERE s.admin_id = (
      SELECT ac.id 
      FROM public.admin_credentials ac 
      JOIN public.admin_sessions s2 ON s2.admin_id = ac.id
      WHERE s2.expires_at > now() 
      AND s2.session_token IS NOT NULL
      LIMIT 1
    )
    AND s.expires_at > now()
  )
)
WITH CHECK (
  -- Same check for modifications
  EXISTS (
    SELECT 1 
    FROM public.admin_sessions s 
    WHERE s.admin_id = (
      SELECT ac.id 
      FROM public.admin_credentials ac 
      JOIN public.admin_sessions s2 ON s2.admin_id = ac.id
      WHERE s2.expires_at > now() 
      AND s2.session_token IS NOT NULL
      LIMIT 1
    )
    AND s.expires_at > now()
  )
);

-- Create a separate policy to allow the authentication functions to work
-- This is needed for the initial login process
CREATE POLICY "Allow authentication functions"
ON public.admin_credentials
FOR SELECT
TO anon, authenticated
USING (
  -- Only allow access from security definer functions
  -- This ensures only the authenticate_admin function can read credentials for login
  current_setting('app.function_context', true) = 'admin_auth'
);

-- Update the authenticate_admin function to set the function context
-- This allows it to bypass the RLS during authentication
CREATE OR REPLACE FUNCTION public.authenticate_admin(_username text, _password text)
 RETURNS TABLE(id uuid, username text, role app_role, is_active boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  attempt_id uuid;
BEGIN
  -- Set function context to allow RLS bypass for authentication
  PERFORM set_config('app.function_context', 'admin_auth', true);
  
  -- Check rate limiting
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

  -- Authenticate and return results
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
  
  -- Clear function context
  PERFORM set_config('app.function_context', null, true);
END;
$function$;

-- Also update other admin management functions to work with the new RLS
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
  -- Verify the current user has a valid admin session
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
  
  -- Set function context for RLS bypass
  PERFORM set_config('app.function_context', 'admin_auth', true);
  
  INSERT INTO public.admin_credentials (username, password_hash, role, created_by)
  VALUES (_username, crypt(_password, gen_salt('bf')), _role, current_admin_id)
  RETURNING id INTO new_id;
  
  -- Clear function context
  PERFORM set_config('app.function_context', null, true);
  
  RETURN new_id;
END;
$function$;