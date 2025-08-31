-- Fix update_admin_password function to check admin session role instead of auth.uid()
CREATE OR REPLACE FUNCTION public.update_admin_password(_admin_id uuid, _new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Check if current admin has superadmin role (from admin session)
  IF current_setting('app.current_admin_role', true) != 'superadmin' THEN
    RAISE EXCEPTION 'Only superadmins can update admin passwords';
  END IF;
  
  UPDATE public.admin_credentials 
  SET password_hash = crypt(_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = _admin_id;
  
  RETURN FOUND;
END;
$function$