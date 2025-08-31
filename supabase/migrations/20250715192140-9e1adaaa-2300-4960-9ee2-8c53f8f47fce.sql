-- Drop existing RLS policies for properties table
DROP POLICY IF EXISTS "Admin can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Admin can update properties" ON public.properties;
DROP POLICY IF EXISTS "Admin can delete properties" ON public.properties;

-- Create new function to check admin credentials
CREATE OR REPLACE FUNCTION public.is_admin_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_sessions s
    JOIN public.admin_credentials c ON s.admin_id = c.id
    WHERE s.expires_at > now()
    AND c.is_active = true
    AND (c.role = 'admin' OR c.role = 'superadmin')
  );
$$;

-- Create new RLS policies using the admin credentials system
CREATE POLICY "Admin can insert properties" 
ON public.properties 
FOR INSERT 
WITH CHECK (is_admin_authenticated() OR submitted_by_user = true);

CREATE POLICY "Admin can update properties" 
ON public.properties 
FOR UPDATE 
USING (is_admin_authenticated());

CREATE POLICY "Admin can delete properties" 
ON public.properties 
FOR DELETE 
USING (is_admin_authenticated());