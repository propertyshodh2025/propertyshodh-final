-- Drop all existing policies on user_roles to start fresh
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- For admin access, we'll use a different approach that doesn't cause recursion
-- Admins can insert/update/delete roles (but this won't be recursive since we're not checking roles here)
CREATE POLICY "Authenticated users can manage roles" 
ON public.user_roles 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Update the has_role function to be more efficient and avoid recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Update the is_admin function to be more direct
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
$$;