-- Fix CRM lead access by creating proper RPC functions

-- Function to get all leads for superadmin
CREATE OR REPLACE FUNCTION public.get_all_leads_for_superadmin()
RETURNS SETOF public.leads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_role_result app_role;
BEGIN
  -- Check if current user is a superadmin or super_super_admin
  SELECT role INTO admin_role_result FROM public.get_admin_from_session() LIMIT 1;
  
  IF admin_role_result IS NULL OR admin_role_result NOT IN ('superadmin', 'super_super_admin') THEN
    RAISE EXCEPTION 'Only superadmins and super super admins can access all leads';
  END IF;
  
  -- Return all leads for superadmin
  RETURN QUERY
  SELECT * FROM public.leads
  ORDER BY created_at DESC;
END;
$$;

-- Function to get leads assigned to the current admin
CREATE OR REPLACE FUNCTION public.get_admin_assigned_leads()
RETURNS SETOF public.leads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_session_record record;
BEGIN
  -- Get current admin session
  SELECT * INTO admin_session_record FROM public.get_admin_from_session() LIMIT 1;
  
  IF admin_session_record.admin_id IS NULL OR admin_session_record.role IS NULL THEN
    RAISE EXCEPTION 'No valid admin session found';
  END IF;
  
  -- For superadmins, return all leads (they can see everything)
  IF admin_session_record.role IN ('superadmin', 'super_super_admin') THEN
    RETURN QUERY
    SELECT * FROM public.leads
    ORDER BY created_at DESC;
  ELSE
    -- For regular admins, return only leads assigned to them
    RETURN QUERY
    SELECT * FROM public.leads
    WHERE assigned_admin_id = admin_session_record.admin_id
    ORDER BY created_at DESC;
  END IF;
END;
$$;

-- Function to get admin credentials (fixed to work with new session system)
CREATE OR REPLACE FUNCTION public.get_admin_credentials()
RETURNS TABLE(id uuid, username text, role app_role, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_session_record record;
BEGIN
  -- Get current admin session
  SELECT * INTO admin_session_record FROM public.get_admin_from_session() LIMIT 1;
  
  IF admin_session_record.admin_id IS NULL OR admin_session_record.role IS NULL THEN
    RAISE EXCEPTION 'No valid admin session found';
  END IF;
  
  -- Only superadmins and super_super_admins can see all admin credentials
  IF admin_session_record.role NOT IN ('superadmin', 'super_super_admin') THEN
    -- Regular admins can only see themselves
    RETURN QUERY
    SELECT ac.id, ac.username, ac.role, ac.is_active
    FROM public.admin_credentials ac
    WHERE ac.id = admin_session_record.admin_id
    AND ac.is_active = true;
  ELSE
    -- Superadmins can see all admin credentials
    RETURN QUERY
    SELECT ac.id, ac.username, ac.role, ac.is_active
    FROM public.admin_credentials ac
    WHERE ac.is_active = true
    ORDER BY ac.role, ac.username;
  END IF;
END;
$$;