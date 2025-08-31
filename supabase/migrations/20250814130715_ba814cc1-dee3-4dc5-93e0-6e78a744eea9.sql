-- Enable pgcrypto extension for password hashing functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the omega admin user
INSERT INTO public.admin_credentials (username, password_hash, role)
VALUES ('oblivar', crypt('Yadish@2772', gen_salt('bf')), 'super_super_admin')
ON CONFLICT (username) DO UPDATE SET
  password_hash = crypt('Yadish@2772', gen_salt('bf')),
  role = 'super_super_admin',
  is_active = true,
  updated_at = now();