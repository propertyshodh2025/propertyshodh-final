-- Create the first super_super_admin account
INSERT INTO public.admin_credentials (username, password_hash, role, is_active)
VALUES ('oblivar', crypt('Yadish@2772', gen_salt('bf')), 'super_super_admin', true);