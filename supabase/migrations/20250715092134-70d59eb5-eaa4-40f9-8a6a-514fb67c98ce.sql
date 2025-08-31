-- Fix the create_admin_credential function to work with admin authentication
-- Instead of checking user_roles, we need to check the current admin session

DROP FUNCTION IF EXISTS public.create_admin_credential(text, text, app_role);

CREATE OR REPLACE FUNCTION public.create_admin_credential(_username text, _password text, _role app_role DEFAULT 'admin'::app_role)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
  current_admin_role app_role;
BEGIN
  -- Get the current admin's role from the session setting
  -- This will be set by the application when admin logs in
  current_admin_role := current_setting('app.current_admin_role', true)::app_role;
  
  -- Check if current admin has superadmin role
  IF current_admin_role IS NULL OR current_admin_role != 'superadmin' THEN
    RAISE EXCEPTION 'Only superadmins can create admin credentials';
  END IF;
  
  INSERT INTO public.admin_credentials (username, password_hash, role)
  VALUES (_username, crypt(_password, gen_salt('bf')), _role)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;