-- Update admin management functions to respect role hierarchy

-- Update create_admin_credential function to prevent superadmin from creating super_super_admin
CREATE OR REPLACE FUNCTION public.create_admin_credential(_username text, _password text, _role app_role DEFAULT 'admin'::app_role)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_id UUID;
  current_admin_role TEXT;
BEGIN
  -- Check if request has admin bypass or is from super_super_admin/superadmin using reliable method
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can create admin credentials';
  END IF;
  
  -- Get current admin role
  current_admin_role := current_setting('app.current_admin_role', true);
  
  -- Role hierarchy checks
  IF current_admin_role = 'superadmin' AND _role IN ('super_super_admin', 'superadmin') THEN
    RAISE EXCEPTION 'Superadmins cannot create super_super_admin or superadmin credentials';
  END IF;
  
  IF current_admin_role NOT IN ('super_super_admin', 'superadmin') THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can create admin credentials';
  END IF;
  
  INSERT INTO public.admin_credentials (username, password_hash, role)
  VALUES (_username, crypt(_password, gen_salt('bf')), _role)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$function$;

-- Update update_admin_username to respect hierarchy
CREATE OR REPLACE FUNCTION public.update_admin_username(_admin_id uuid, _new_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  current_admin_role TEXT;
  target_admin_role TEXT;
BEGIN
  -- Check if request has admin bypass or is from super_super_admin/superadmin using reliable method
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can update admin usernames';
  END IF;
  
  current_admin_role := current_setting('app.current_admin_role', true);
  
  -- Get the role of the admin being updated
  SELECT role INTO target_admin_role 
  FROM public.admin_credentials 
  WHERE id = _admin_id;
  
  -- Role hierarchy checks
  IF current_admin_role = 'superadmin' AND target_admin_role IN ('super_super_admin', 'superadmin') THEN
    RAISE EXCEPTION 'Superadmins cannot modify super_super_admin or superadmin accounts';
  END IF;
  
  IF current_admin_role NOT IN ('super_super_admin', 'superadmin') THEN
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

-- Update update_admin_password to respect hierarchy
CREATE OR REPLACE FUNCTION public.update_admin_password(_admin_id uuid, _new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  current_admin_role TEXT;
  target_admin_role TEXT;
BEGIN
  -- Check if request has admin bypass or is from super_super_admin/superadmin using reliable method
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can update admin passwords';
  END IF;
  
  current_admin_role := current_setting('app.current_admin_role', true);
  
  -- Get the role of the admin being updated
  SELECT role INTO target_admin_role 
  FROM public.admin_credentials 
  WHERE id = _admin_id;
  
  -- Role hierarchy checks
  IF current_admin_role = 'superadmin' AND target_admin_role IN ('super_super_admin', 'superadmin') THEN
    RAISE EXCEPTION 'Superadmins cannot modify super_super_admin or superadmin accounts';
  END IF;
  
  IF current_admin_role NOT IN ('super_super_admin', 'superadmin') THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can update admin passwords';
  END IF;
  
  UPDATE public.admin_credentials 
  SET password_hash = crypt(_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = _admin_id;
  
  RETURN FOUND;
END;
$function$;