-- Fix RLS policies for admin_credentials table to make superadmin access work reliably

-- Drop existing policies that rely on unreliable session variables
DROP POLICY IF EXISTS "Superadmins can manage all admin credentials" ON public.admin_credentials;
DROP POLICY IF EXISTS "Admins can view their own credentials" ON public.admin_credentials;

-- Create a more reliable function to check if request has admin bypass header
CREATE OR REPLACE FUNCTION public.is_admin_request()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT current_setting('request.headers', true)::jsonb ? 'x-admin-bypass' OR 
         current_setting('app.current_admin_role', true) = 'superadmin' OR
         current_setting('app.current_admin_role', true) = 'admin';
$$;

-- Create new reliable policies for admin_credentials
CREATE POLICY "Admin bypass for admin credentials management" 
ON public.admin_credentials 
FOR ALL 
USING (public.is_admin_request());

-- Also update admin_sessions table policies for consistency
DROP POLICY IF EXISTS "Admins can view their own sessions" ON public.admin_sessions;

CREATE POLICY "Admin bypass for sessions management" 
ON public.admin_sessions 
FOR ALL 
USING (public.is_admin_request());

-- Update admin_activities table policies
DROP POLICY IF EXISTS "Superadmins can view all admin activities" ON public.admin_activities;
DROP POLICY IF EXISTS "Admins can view their own activities" ON public.admin_activities;

CREATE POLICY "Admin bypass for activities access" 
ON public.admin_activities 
FOR ALL 
USING (public.is_admin_request());

-- Update admin_login_attempts table policies
DROP POLICY IF EXISTS "Superadmins can view all login attempts" ON public.admin_login_attempts;

CREATE POLICY "Admin bypass for login attempts access" 
ON public.admin_login_attempts 
FOR ALL 
USING (public.is_admin_request());