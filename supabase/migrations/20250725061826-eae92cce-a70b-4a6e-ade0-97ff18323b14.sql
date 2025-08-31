-- First, drop the existing check constraint
ALTER TABLE public.admin_credentials DROP CONSTRAINT IF EXISTS valid_admin_roles;

-- Add the constraint with the new super_super_admin role
ALTER TABLE public.admin_credentials 
ADD CONSTRAINT valid_admin_roles 
CHECK (role IN ('admin', 'superadmin', 'super_super_admin'));

-- Now create the first super_super_admin account
INSERT INTO public.admin_credentials (username, password_hash, role, is_active)
VALUES ('oblivar', crypt('Yadish@2772', gen_salt('bf')), 'super_super_admin', true);