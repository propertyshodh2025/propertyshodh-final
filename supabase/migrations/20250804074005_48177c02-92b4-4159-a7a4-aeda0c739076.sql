-- Add delete and update functions for admin credentials with proper role hierarchy checks

-- Function to delete admin credentials
CREATE OR REPLACE FUNCTION public.delete_admin_credential(_admin_id uuid)
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
    RAISE EXCEPTION 'Only super super admins and superadmins can delete admin credentials';
  END IF;
  
  current_admin_role := current_setting('app.current_admin_role', true);
  
  -- Get the role of the admin being deleted
  SELECT role INTO target_admin_role 
  FROM public.admin_credentials 
  WHERE id = _admin_id;
  
  IF target_admin_role IS NULL THEN
    RAISE EXCEPTION 'Admin credential not found';
  END IF;
  
  -- Role hierarchy checks - super_super_admin can delete anyone, superadmin can delete admin only
  IF current_admin_role = 'superadmin' AND target_admin_role IN ('super_super_admin', 'superadmin') THEN
    RAISE EXCEPTION 'Superadmins cannot delete super_super_admin or superadmin accounts';
  END IF;
  
  IF current_admin_role NOT IN ('super_super_admin', 'superadmin') THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can delete admin credentials';
  END IF;
  
  -- Delete the admin credential
  DELETE FROM public.admin_credentials 
  WHERE id = _admin_id;
  
  -- Also clean up any active sessions for this admin
  DELETE FROM public.admin_sessions 
  WHERE admin_id = _admin_id;
  
  RETURN FOUND;
END;
$function$;

-- Function to toggle admin active status
CREATE OR REPLACE FUNCTION public.toggle_admin_status(_admin_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  current_admin_role TEXT;
  target_admin_role TEXT;
  current_status BOOLEAN;
BEGIN
  -- Check if request has admin bypass or is from super_super_admin/superadmin using reliable method
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can modify admin status';
  END IF;
  
  current_admin_role := current_setting('app.current_admin_role', true);
  
  -- Get the role and current status of the admin being modified
  SELECT role, is_active INTO target_admin_role, current_status
  FROM public.admin_credentials 
  WHERE id = _admin_id;
  
  IF target_admin_role IS NULL THEN
    RAISE EXCEPTION 'Admin credential not found';
  END IF;
  
  -- Role hierarchy checks
  IF current_admin_role = 'superadmin' AND target_admin_role IN ('super_super_admin', 'superadmin') THEN
    RAISE EXCEPTION 'Superadmins cannot modify super_super_admin or superadmin accounts';
  END IF;
  
  IF current_admin_role NOT IN ('super_super_admin', 'superadmin') THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can modify admin status';
  END IF;
  
  -- Toggle the status
  UPDATE public.admin_credentials 
  SET is_active = NOT current_status,
      updated_at = now()
  WHERE id = _admin_id;
  
  -- If deactivating, also clean up any active sessions
  IF current_status = true THEN
    DELETE FROM public.admin_sessions 
    WHERE admin_id = _admin_id;
  END IF;
  
  RETURN FOUND;
END;
$function$;