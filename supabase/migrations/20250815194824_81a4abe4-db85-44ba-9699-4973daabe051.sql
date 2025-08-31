-- Complete the admin credentials security fix by updating remaining functions
-- Update remaining admin management functions to use proper security context

CREATE OR REPLACE FUNCTION public.toggle_admin_status(_admin_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_admin_role TEXT;
  target_admin_role TEXT;
  current_status BOOLEAN;
BEGIN
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can modify admin status';
  END IF;
  
  current_admin_role := current_setting('app.current_admin_role', true);
  
  -- Set secure context
  PERFORM set_config('app.function_context', 'admin_auth', true);
  PERFORM set_config('app.admin_auth_active', 'true', true);
  
  SELECT role, is_active INTO target_admin_role, current_status
  FROM public.admin_credentials 
  WHERE id = _admin_id;
  
  IF target_admin_role IS NULL THEN
    PERFORM set_config('app.function_context', null, true);
    PERFORM set_config('app.admin_auth_active', null, true);
    RAISE EXCEPTION 'Admin credential not found';
  END IF;
  
  IF current_admin_role = 'superadmin' AND target_admin_role IN ('super_super_admin', 'superadmin') THEN
    PERFORM set_config('app.function_context', null, true);
    PERFORM set_config('app.admin_auth_active', null, true);
    RAISE EXCEPTION 'Superadmins cannot modify super_super_admin or superadmin accounts';
  END IF;
  
  IF current_admin_role NOT IN ('super_super_admin', 'superadmin') THEN
    PERFORM set_config('app.function_context', null, true);
    PERFORM set_config('app.admin_auth_active', null, true);
    RAISE EXCEPTION 'Only super super admins and superadmins can modify admin status';
  END IF;
  
  UPDATE public.admin_credentials 
  SET is_active = NOT current_status,
      updated_at = now()
  WHERE id = _admin_id;
  
  IF current_status = true THEN
    DELETE FROM public.admin_sessions 
    WHERE admin_id = _admin_id;
  END IF;
  
  -- Clear security context
  PERFORM set_config('app.function_context', null, true);
  PERFORM set_config('app.admin_auth_active', null, true);
  
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_admin_credential(_admin_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_admin_role TEXT;
  target_admin_role TEXT;
BEGIN
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can delete admin credentials';
  END IF;
  
  current_admin_role := current_setting('app.current_admin_role', true);
  
  -- Set secure context
  PERFORM set_config('app.function_context', 'admin_auth', true);
  PERFORM set_config('app.admin_auth_active', 'true', true);
  
  SELECT role INTO target_admin_role 
  FROM public.admin_credentials 
  WHERE id = _admin_id;
  
  IF target_admin_role IS NULL THEN
    PERFORM set_config('app.function_context', null, true);
    PERFORM set_config('app.admin_auth_active', null, true);
    RAISE EXCEPTION 'Admin credential not found';
  END IF;
  
  IF current_admin_role = 'superadmin' AND target_admin_role IN ('super_super_admin', 'superadmin') THEN
    PERFORM set_config('app.function_context', null, true);
    PERFORM set_config('app.admin_auth_active', null, true);
    RAISE EXCEPTION 'Superadmins cannot delete super_super_admin or superadmin accounts';
  END IF;
  
  IF current_admin_role NOT IN ('super_super_admin', 'superadmin') THEN
    PERFORM set_config('app.function_context', null, true);
    PERFORM set_config('app.admin_auth_active', null, true);
    RAISE EXCEPTION 'Only super super admins and superadmins can delete admin credentials';
  END IF;
  
  DELETE FROM public.admin_credentials 
  WHERE id = _admin_id;
  
  DELETE FROM public.admin_sessions 
  WHERE admin_id = _admin_id;
  
  -- Clear security context
  PERFORM set_config('app.function_context', null, true);
  PERFORM set_config('app.admin_auth_active', null, true);
  
  RETURN FOUND;
END;
$function$;