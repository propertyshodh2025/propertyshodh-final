-- Fix RLS policies for admin_credentials table to work with admin session system

-- Drop existing policies
DROP POLICY IF EXISTS "Superadmins can manage all admin credentials" ON public.admin_credentials;
DROP POLICY IF EXISTS "Admins can view their own credentials" ON public.admin_credentials;

-- Create new policies that work with admin session system
CREATE POLICY "Superadmins can manage all admin credentials" 
ON public.admin_credentials 
FOR ALL 
USING (
  current_setting('app.current_admin_role', true) = 'superadmin'
);

CREATE POLICY "Admins can view their own credentials" 
ON public.admin_credentials 
FOR SELECT 
USING (
  username = current_setting('app.current_admin_username', true)
  OR current_setting('app.current_admin_role', true) = 'superadmin'
);

-- Also fix the admin_login_attempts policy
DROP POLICY IF EXISTS "Superadmins can view all login attempts" ON public.admin_login_attempts;

CREATE POLICY "Superadmins can view all login attempts" 
ON public.admin_login_attempts 
FOR SELECT 
USING (
  current_setting('app.current_admin_role', true) = 'superadmin'
);

-- Fix admin_sessions policy  
DROP POLICY IF EXISTS "Admins can view their own sessions" ON public.admin_sessions;

CREATE POLICY "Admins can view their own sessions" 
ON public.admin_sessions 
FOR SELECT 
USING (
  admin_id = (
    SELECT id FROM admin_credentials 
    WHERE username = current_setting('app.current_admin_username', true)
  )
  OR current_setting('app.current_admin_role', true) = 'superadmin'
);