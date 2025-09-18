-- Migration to ensure superadmin cannot manage super_super_admin accounts
-- This enforces strict role hierarchy and prevents privilege escalation

-- 1) Update get_admin_credentials to filter out super_super_admin for superadmin users
CREATE OR REPLACE FUNCTION public.get_admin_credentials()
RETURNS TABLE(id uuid, username text, role app_role, is_active boolean, created_at timestamp with time zone, last_login timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_admin_role app_role;
BEGIN
  -- Check if current admin has permission
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Only super super admins and superadmins can view admin credentials';
  END IF;
  
  -- Get current admin role
  SELECT ac.role INTO current_admin_role
  FROM public.admin_credentials ac
  JOIN public.admin_sessions s ON s.admin_id = ac.id
  WHERE s.session_token = current_setting('request.headers', true)::json->>'x-admin-session'
    AND s.expires_at > now()
    AND ac.is_active = true
  LIMIT 1;
  
  IF current_admin_role IS NULL THEN
    RAISE EXCEPTION 'Invalid admin session';
  END IF;
  
  -- Set secure context
  PERFORM set_config('app.function_context', 'admin_auth', true);
  PERFORM set_config('app.admin_auth_active', 'true', true);
  
  -- Return filtered results based on role hierarchy
  RETURN QUERY
  SELECT 
    ac.id,
    ac.username,
    ac.role,
    ac.is_active,
    ac.created_at,
    ac.last_login
  FROM public.admin_credentials ac
  WHERE 
    -- super_super_admin can see all accounts
    (current_admin_role = 'super_super_admin')
    OR
    -- superadmin can only see admin and superadmin accounts (NOT super_super_admin)
    (current_admin_role = 'superadmin' AND ac.role != 'super_super_admin')
    OR
    -- admin can only see admin accounts
    (current_admin_role = 'admin' AND ac.role = 'admin')
  ORDER BY ac.created_at DESC;
  
  -- Clear security context
  PERFORM set_config('app.function_context', null, true);
  PERFORM set_config('app.admin_auth_active', null, true);
END;
$function$;

-- 2) Update create_admin_credential with stricter role checks
CREATE OR REPLACE FUNCTION public.create_admin_credential(_username text, _password text, _role app_role DEFAULT 'admin'::app_role)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  new_id UUID;
  current_admin_role app_role;
  current_admin_id UUID;
BEGIN
  -- Verify the current user has a valid admin session
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Access denied: Admin authentication required';
  END IF;
  
  -- Get current admin info
  SELECT ac.id, ac.role INTO current_admin_id, current_admin_role
  FROM public.admin_credentials ac
  JOIN public.admin_sessions s ON s.admin_id = ac.id
  WHERE s.session_token = current_setting('request.headers', true)::json->>'x-admin-session'
    AND s.expires_at > now()
    AND ac.is_active = true
  LIMIT 1;
  
  IF current_admin_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired admin session';
  END IF;
  
  -- Enforce strict role hierarchy for creation
  CASE current_admin_role
    WHEN 'admin' THEN
      RAISE EXCEPTION 'Access denied: Admins cannot create other admin accounts';
    WHEN 'superadmin' THEN
      -- Superadmins can ONLY create admin accounts, NOT superadmin or super_super_admin
      IF _role != 'admin' THEN
        RAISE EXCEPTION 'Access denied: Superadmins can only create admin accounts';
      END IF;
    WHEN 'super_super_admin' THEN
      -- Super super admin can create any account type
      NULL; -- Allow all roles
    ELSE
      RAISE EXCEPTION 'Access denied: Unknown admin role';
  END CASE;
  
  -- Validate username doesn't already exist
  IF EXISTS (SELECT 1 FROM public.admin_credentials WHERE username = _username) THEN
    RAISE EXCEPTION 'Username already exists';
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

-- 3) Update delete_admin_credential with stricter permissions
CREATE OR REPLACE FUNCTION public.delete_admin_credential(_admin_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_admin_role app_role;
  current_admin_id UUID;
  target_admin_role app_role;
  target_username text;
BEGIN
  -- Verify admin session
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Access denied: Admin authentication required';
  END IF;
  
  -- Get current admin info
  SELECT ac.id, ac.role INTO current_admin_id, current_admin_role
  FROM public.admin_credentials ac
  JOIN public.admin_sessions s ON s.admin_id = ac.id
  WHERE s.session_token = current_setting('request.headers', true)::json->>'x-admin-session'
    AND s.expires_at > now()
    AND ac.is_active = true
  LIMIT 1;
  
  IF current_admin_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired admin session';
  END IF;
  
  -- Get target admin info
  SELECT role, username INTO target_admin_role, target_username 
  FROM public.admin_credentials 
  WHERE id = _admin_id;
  
  IF target_admin_role IS NULL THEN
    RAISE EXCEPTION 'Target admin account not found';
  END IF;
  
  -- Prevent self-deletion
  IF current_admin_id = _admin_id THEN
    RAISE EXCEPTION 'Cannot delete your own admin account';
  END IF;
  
  -- Enforce strict role hierarchy for deletion
  CASE current_admin_role
    WHEN 'admin' THEN
      RAISE EXCEPTION 'Access denied: Admins cannot delete other admin accounts';
    WHEN 'superadmin' THEN
      -- Superadmins can ONLY delete admin accounts, NOT superadmin or super_super_admin
      IF target_admin_role != 'admin' THEN
        RAISE EXCEPTION 'Access denied: Superadmins cannot delete % accounts', target_admin_role;
      END IF;
    WHEN 'super_super_admin' THEN
      -- Super super admin can delete any account (except restrictions below)
      NULL; -- Allow deletion
    ELSE
      RAISE EXCEPTION 'Access denied: Unknown admin role';
  END CASE;
  
  -- Set secure function context
  PERFORM set_config('app.function_context', 'admin_auth', true);
  PERFORM set_config('app.admin_auth_active', 'true', true);
  
  -- Delete the admin account and associated sessions
  DELETE FROM public.admin_sessions WHERE admin_id = _admin_id;
  DELETE FROM public.admin_credentials WHERE id = _admin_id;
  
  -- Clear function context
  PERFORM set_config('app.function_context', null, true);
  PERFORM set_config('app.admin_auth_active', null, true);
  
  RETURN FOUND;
END;
$function$;

-- 4) Update toggle_admin_status with stricter permissions
CREATE OR REPLACE FUNCTION public.toggle_admin_status(_admin_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_admin_role app_role;
  current_admin_id UUID;
  target_admin_role app_role;
  current_status boolean;
BEGIN
  -- Verify admin session
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Access denied: Admin authentication required';
  END IF;
  
  -- Get current admin info
  SELECT ac.id, ac.role INTO current_admin_id, current_admin_role
  FROM public.admin_credentials ac
  JOIN public.admin_sessions s ON s.admin_id = ac.id
  WHERE s.session_token = current_setting('request.headers', true)::json->>'x-admin-session'
    AND s.expires_at > now()
    AND ac.is_active = true
  LIMIT 1;
  
  IF current_admin_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired admin session';
  END IF;
  
  -- Get target admin info
  SELECT role, is_active INTO target_admin_role, current_status 
  FROM public.admin_credentials 
  WHERE id = _admin_id;
  
  IF target_admin_role IS NULL THEN
    RAISE EXCEPTION 'Target admin account not found';
  END IF;
  
  -- Prevent self-modification
  IF current_admin_id = _admin_id THEN
    RAISE EXCEPTION 'Cannot modify your own admin account status';
  END IF;
  
  -- Enforce strict role hierarchy for status modification
  CASE current_admin_role
    WHEN 'admin' THEN
      RAISE EXCEPTION 'Access denied: Admins cannot modify other admin accounts';
    WHEN 'superadmin' THEN
      -- Superadmins can ONLY modify admin accounts, NOT superadmin or super_super_admin
      IF target_admin_role != 'admin' THEN
        RAISE EXCEPTION 'Access denied: Superadmins cannot modify % accounts', target_admin_role;
      END IF;
    WHEN 'super_super_admin' THEN
      -- Super super admin can modify any account status
      NULL; -- Allow modification
    ELSE
      RAISE EXCEPTION 'Access denied: Unknown admin role';
  END CASE;
  
  -- Set secure function context
  PERFORM set_config('app.function_context', 'admin_auth', true);
  PERFORM set_config('app.admin_auth_active', 'true', true);
  
  -- Toggle the status
  UPDATE public.admin_credentials 
  SET is_active = NOT current_status,
      updated_at = now()
  WHERE id = _admin_id;
  
  -- If deactivating, remove all sessions for that admin
  IF current_status = true THEN
    DELETE FROM public.admin_sessions WHERE admin_id = _admin_id;
  END IF;
  
  -- Clear function context
  PERFORM set_config('app.function_context', null, true);
  PERFORM set_config('app.admin_auth_active', null, true);
  
  RETURN FOUND;
END;
$function$;

-- 5) Update update_admin_username with stricter permissions
CREATE OR REPLACE FUNCTION public.update_admin_username(_admin_id uuid, _new_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_admin_role app_role;
  current_admin_id UUID;
  target_admin_role app_role;
BEGIN
  -- Verify admin session
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Access denied: Admin authentication required';
  END IF;
  
  -- Get current admin info
  SELECT ac.id, ac.role INTO current_admin_id, current_admin_role
  FROM public.admin_credentials ac
  JOIN public.admin_sessions s ON s.admin_id = ac.id
  WHERE s.session_token = current_setting('request.headers', true)::json->>'x-admin-session'
    AND s.expires_at > now()
    AND ac.is_active = true
  LIMIT 1;
  
  IF current_admin_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired admin session';
  END IF;
  
  -- Get target admin info
  SELECT role INTO target_admin_role 
  FROM public.admin_credentials 
  WHERE id = _admin_id;
  
  IF target_admin_role IS NULL THEN
    RAISE EXCEPTION 'Target admin account not found';
  END IF;
  
  -- Enforce strict role hierarchy for username updates
  CASE current_admin_role
    WHEN 'admin' THEN
      -- Admins can only update their own username
      IF current_admin_id != _admin_id THEN
        RAISE EXCEPTION 'Access denied: Admins can only update their own username';
      END IF;
    WHEN 'superadmin' THEN
      -- Superadmins can update their own username and admin accounts, NOT super_super_admin
      IF current_admin_id != _admin_id AND target_admin_role != 'admin' THEN
        RAISE EXCEPTION 'Access denied: Superadmins cannot modify % accounts', target_admin_role;
      END IF;
    WHEN 'super_super_admin' THEN
      -- Super super admin can update any username
      NULL; -- Allow modification
    ELSE
      RAISE EXCEPTION 'Access denied: Unknown admin role';
  END CASE;
  
  -- Validate new username doesn't already exist
  IF EXISTS (SELECT 1 FROM public.admin_credentials WHERE username = _new_username AND id != _admin_id) THEN
    RAISE EXCEPTION 'Username already exists';
  END IF;
  
  -- Set secure function context
  PERFORM set_config('app.function_context', 'admin_auth', true);
  PERFORM set_config('app.admin_auth_active', 'true', true);
  
  -- Update the username
  UPDATE public.admin_credentials 
  SET username = _new_username,
      updated_at = now()
  WHERE id = _admin_id;
  
  -- Clear function context
  PERFORM set_config('app.function_context', null, true);
  PERFORM set_config('app.admin_auth_active', null, true);
  
  RETURN FOUND;
END;
$function$;

-- 6) Create a function to update admin password with role restrictions
CREATE OR REPLACE FUNCTION public.update_admin_password(_admin_id uuid, _new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  current_admin_role app_role;
  current_admin_id UUID;
  target_admin_role app_role;
BEGIN
  -- Verify admin session
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Access denied: Admin authentication required';
  END IF;
  
  -- Get current admin info
  SELECT ac.id, ac.role INTO current_admin_id, current_admin_role
  FROM public.admin_credentials ac
  JOIN public.admin_sessions s ON s.admin_id = ac.id
  WHERE s.session_token = current_setting('request.headers', true)::json->>'x-admin-session'
    AND s.expires_at > now()
    AND ac.is_active = true
  LIMIT 1;
  
  IF current_admin_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired admin session';
  END IF;
  
  -- Get target admin info
  SELECT role INTO target_admin_role 
  FROM public.admin_credentials 
  WHERE id = _admin_id;
  
  IF target_admin_role IS NULL THEN
    RAISE EXCEPTION 'Target admin account not found';
  END IF;
  
  -- Enforce strict role hierarchy for password updates
  CASE current_admin_role
    WHEN 'admin' THEN
      -- Admins can only update their own password
      IF current_admin_id != _admin_id THEN
        RAISE EXCEPTION 'Access denied: Admins can only update their own password';
      END IF;
    WHEN 'superadmin' THEN
      -- Superadmins can update their own password and admin passwords, NOT super_super_admin
      IF current_admin_id != _admin_id AND target_admin_role != 'admin' THEN
        RAISE EXCEPTION 'Access denied: Superadmins cannot modify % account passwords', target_admin_role;
      END IF;
    WHEN 'super_super_admin' THEN
      -- Super super admin can update any password
      NULL; -- Allow modification
    ELSE
      RAISE EXCEPTION 'Access denied: Unknown admin role';
  END CASE;
  
  -- Set secure function context
  PERFORM set_config('app.function_context', 'admin_auth', true);
  PERFORM set_config('app.admin_auth_active', 'true', true);
  
  -- Update the password
  UPDATE public.admin_credentials 
  SET password_hash = crypt(_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = _admin_id;
  
  -- Invalidate all sessions for the target admin (force re-login with new password)
  DELETE FROM public.admin_sessions WHERE admin_id = _admin_id;
  
  -- Clear function context
  PERFORM set_config('app.function_context', null, true);
  PERFORM set_config('app.admin_auth_active', null, true);
  
  RETURN FOUND;
END;
$function$;

-- 7) Add a function to check if current user can access super_super_admin features
CREATE OR REPLACE FUNCTION public.can_access_super_super_admin_features()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_admin_role app_role;
BEGIN
  -- Check if current admin has permission
  IF NOT public.is_admin_request() THEN
    RETURN false;
  END IF;
  
  -- Get current admin role
  SELECT ac.role INTO current_admin_role
  FROM public.admin_credentials ac
  JOIN public.admin_sessions s ON s.admin_id = ac.id
  WHERE s.session_token = current_setting('request.headers', true)::json->>'x-admin-session'
    AND s.expires_at > now()
    AND ac.is_active = true
  LIMIT 1;
  
  RETURN current_admin_role = 'super_super_admin';
END;
$function$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_admin_credentials() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_credential(text, text, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_admin_credential(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_admin_status(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_admin_username(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_admin_password(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_super_super_admin_features() TO authenticated;