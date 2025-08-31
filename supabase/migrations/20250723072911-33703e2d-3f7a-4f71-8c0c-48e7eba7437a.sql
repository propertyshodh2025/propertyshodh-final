-- Fix admin functions to use reliable admin request checking instead of unreliable session variables

-- Update create_admin_credential function
CREATE OR REPLACE FUNCTION public.create_admin_credential(_username text, _password text, _role app_role DEFAULT 'admin'::app_role)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Check if request has admin bypass or is from superadmin using reliable method
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Only superadmins can create admin credentials';
  END IF;
  
  -- Additional check specifically for superadmin role for creating credentials
  IF current_setting('app.current_admin_role', true) != 'superadmin' THEN
    RAISE EXCEPTION 'Only superadmins can create admin credentials';
  END IF;
  
  INSERT INTO public.admin_credentials (username, password_hash, role)
  VALUES (_username, crypt(_password, gen_salt('bf')), _role)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Update update_admin_password function
CREATE OR REPLACE FUNCTION public.update_admin_password(_admin_id uuid, _new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if request has admin bypass or is from superadmin using reliable method
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Only superadmins can update admin passwords';
  END IF;
  
  -- Additional check specifically for superadmin role for password updates
  IF current_setting('app.current_admin_role', true) != 'superadmin' THEN
    RAISE EXCEPTION 'Only superadmins can update admin passwords';
  END IF;
  
  UPDATE public.admin_credentials 
  SET password_hash = crypt(_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = _admin_id;
  
  RETURN FOUND;
END;
$$;

-- Update update_admin_username function
CREATE OR REPLACE FUNCTION public.update_admin_username(_admin_id uuid, _new_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if request has admin bypass or is from superadmin using reliable method
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Only superadmins can update admin usernames';
  END IF;
  
  -- Additional check specifically for superadmin role for username updates
  IF current_setting('app.current_admin_role', true) != 'superadmin' THEN
    RAISE EXCEPTION 'Only superadmins can update admin usernames';
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
$$;