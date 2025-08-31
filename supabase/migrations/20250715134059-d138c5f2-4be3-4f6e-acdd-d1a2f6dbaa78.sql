-- Create function to update admin username (missing functionality)
CREATE OR REPLACE FUNCTION public.update_admin_username(
  _admin_id uuid,
  _new_username text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Check if current admin has superadmin role
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
$function$;