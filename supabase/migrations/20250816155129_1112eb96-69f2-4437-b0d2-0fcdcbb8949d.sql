-- Create function to get admin credentials for omega admins
CREATE OR REPLACE FUNCTION public.get_admin_credentials()
RETURNS TABLE(id uuid, username text, role app_role, is_active boolean, created_at timestamp with time zone, last_login timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if current admin has permission
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can view admin credentials';
  END IF;
  
  -- Set secure context
  PERFORM set_config('app.function_context', 'admin_auth', true);
  PERFORM set_config('app.admin_auth_active', 'true', true);
  
  RETURN QUERY
  SELECT 
    ac.id,
    ac.username,
    ac.role,
    ac.is_active,
    ac.created_at,
    ac.last_login
  FROM public.admin_credentials ac
  ORDER BY ac.created_at DESC;
  
  -- Clear security context
  PERFORM set_config('app.function_context', null, true);
  PERFORM set_config('app.admin_auth_active', null, true);
END;
$function$;

-- Fix the existing create_admin_credential function that was missing the proper name
-- (The function exists but might have wrong naming or access issues)
CREATE OR REPLACE FUNCTION public.create_admin_credential(_username text, _password text, _role app_role DEFAULT 'admin'::app_role)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  new_id UUID;
  current_admin_role TEXT;
  current_admin_id UUID;
BEGIN
  -- Verify the current user has a valid admin session with proper authorization
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can create admin credentials';
  END IF;
  
  current_admin_role := current_setting('app.current_admin_role', true);
  
  -- Get current admin ID from session
  SELECT ac.id INTO current_admin_id
  FROM public.admin_credentials ac
  JOIN public.admin_sessions s ON s.admin_id = ac.id
  WHERE s.expires_at > now()
  AND ac.is_active = true
  AND (ac.role = 'super_super_admin' OR ac.role = 'superadmin')
  LIMIT 1;
  
  IF current_admin_id IS NULL THEN
    RAISE EXCEPTION 'Valid admin session required to create credentials';
  END IF;
  
  IF current_admin_role = 'superadmin' AND _role IN ('super_super_admin', 'superadmin') THEN
    RAISE EXCEPTION 'Superadmins cannot create super_super_admin or superadmin credentials';
  END IF;
  
  -- Set secure function context
  PERFORM set_config('app.function_context', 'admin_auth', true);
  PERFORM set_config('app.admin_auth_active', 'true', true);
  
  INSERT INTO public.admin_credentials (username, password_hash, role, created_by)
  VALUES (_username, crypt(_password, gen_salt('bf')), _role, current_admin_id)
  RETURNING id INTO new_id;
  
  -- Clear function context
  PERFORM set_config('app.function_context', null, true);
  PERFORM set_config('app.admin_auth_active', null, true);
  
  RETURN new_id;
END;
$function$;