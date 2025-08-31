-- Force enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto CASCADE;

-- Test that pgcrypto works
DO $$
BEGIN
  PERFORM crypt('test', gen_salt('bf'));
  RAISE NOTICE 'pgcrypto extension is working correctly';
END;
$$;

-- Drop existing admin credential and recreate with working password
DELETE FROM public.admin_credentials WHERE username = 'oblivar';

-- Create admin credential with proper password hash
INSERT INTO public.admin_credentials (username, password_hash, role, is_active)
VALUES ('oblivar', crypt('Yadish@2772', gen_salt('bf')), 'super_super_admin', true);

-- Recreate the authenticate_admin function with proper permissions
DROP FUNCTION IF EXISTS public.authenticate_admin(text, text);

CREATE OR REPLACE FUNCTION public.authenticate_admin(_username text, _password text)
RETURNS TABLE(id uuid, username text, role app_role, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempt_id uuid;
BEGIN
  -- Check rate limiting
  IF (
    SELECT COUNT(*) FROM public.admin_login_attempts 
    WHERE admin_login_attempts.username = _username 
    AND admin_login_attempts.success = false
    AND admin_login_attempts.created_at > NOW() - INTERVAL '1 hour'
  ) >= 5 THEN
    RAISE EXCEPTION 'Too many failed login attempts. Please try again later.';
  END IF;

  -- Log attempt
  INSERT INTO public.admin_login_attempts (username, ip_address, success)
  VALUES (_username, inet_client_addr()::text, false)
  RETURNING id INTO attempt_id;

  -- Authenticate
  RETURN QUERY
  SELECT 
    ac.id,
    ac.username,
    ac.role,
    ac.is_active
  FROM public.admin_credentials ac
  WHERE ac.username = _username 
    AND ac.password_hash = crypt(_password, ac.password_hash)
    AND ac.is_active = true;
    
  -- Update on success
  IF FOUND THEN
    UPDATE public.admin_credentials 
    SET last_login = now(), updated_at = now()
    WHERE admin_credentials.username = _username;
    
    UPDATE public.admin_login_attempts 
    SET success = true 
    WHERE id = attempt_id;
  END IF;
END;
$$;