-- Add super_super_admin to the app_role enum
ALTER TYPE app_role ADD VALUE 'super_super_admin';

-- Update the is_admin_request function to include super_super_admin
CREATE OR REPLACE FUNCTION public.is_admin_request()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT current_setting('request.headers', true)::jsonb ? 'x-admin-bypass' OR 
         current_setting('app.current_admin_role', true) = 'super_super_admin' OR
         current_setting('app.current_admin_role', true) = 'superadmin' OR
         current_setting('app.current_admin_role', true) = 'admin';
$function$;

-- Update create_admin_credential function to allow super_super_admin to create any role
CREATE OR REPLACE FUNCTION public.create_admin_credential(_username text, _password text, _role app_role DEFAULT 'admin'::app_role)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_id UUID;
BEGIN
  -- Check if request has admin bypass or is from super_super_admin/superadmin using reliable method
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can create admin credentials';
  END IF;
  
  -- Additional check: super_super_admin can create any role, superadmin can create admin/moderator only
  IF current_setting('app.current_admin_role', true) = 'superadmin' AND _role IN ('super_super_admin', 'superadmin') THEN
    RAISE EXCEPTION 'Superadmins cannot create super_super_admin or superadmin credentials';
  END IF;
  
  IF current_setting('app.current_admin_role', true) NOT IN ('super_super_admin', 'superadmin') THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can create admin credentials';
  END IF;
  
  INSERT INTO public.admin_credentials (username, password_hash, role)
  VALUES (_username, crypt(_password, gen_salt('bf')), _role)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$function$;

-- Update password and username update functions for super_super_admin
CREATE OR REPLACE FUNCTION public.update_admin_username(_admin_id uuid, _new_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Check if request has admin bypass or is from super_super_admin/superadmin using reliable method
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can update admin usernames';
  END IF;
  
  -- Additional check specifically for super_super_admin/superadmin role for username updates
  IF current_setting('app.current_admin_role', true) NOT IN ('super_super_admin', 'superadmin') THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can update admin usernames';
  END IF;
  
  -- Check if new username already exists
  IF EXISTS (
    SELECT 1 FROM public.admin_credentials 
    WHERE username = _new_username AND id != _admin_id
  ) THEN
    RAISE EXCEPTION 'Username already exists';
  END IF;
  
  UPDATE public.admin_credentials 
  SET username = _new_username,
      updated_at = now()
  WHERE id = _admin_id;
  
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_admin_password(_admin_id uuid, _new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Check if request has admin bypass or is from super_super_admin/superadmin using reliable method
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can update admin passwords';
  END IF;
  
  -- Additional check specifically for super_super_admin/superadmin role for password updates
  IF current_setting('app.current_admin_role', true) NOT IN ('super_super_admin', 'superadmin') THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can update admin passwords';
  END IF;
  
  UPDATE public.admin_credentials 
  SET password_hash = crypt(_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = _admin_id;
  
  RETURN FOUND;
END;
$function$;