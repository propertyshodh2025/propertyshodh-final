-- Ensure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop and recreate the authenticate_admin function to ensure it works properly
DROP FUNCTION IF EXISTS public.authenticate_admin(text, text);

CREATE OR REPLACE FUNCTION public.authenticate_admin(_username text, _password text)
RETURNS TABLE(id uuid, username text, role app_role, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check for too many failed attempts
  IF (
    SELECT COUNT(*) FROM public.admin_login_attempts 
    WHERE admin_login_attempts.username = _username 
    AND admin_login_attempts.success = false
    AND admin_login_attempts.created_at > NOW() - INTERVAL '1 hour'
  ) >= 5 THEN
    RAISE EXCEPTION 'Too many failed login attempts. Please try again later.';
  END IF;

  -- Log the attempt as failed initially
  INSERT INTO public.admin_login_attempts (username, ip_address, success)
  VALUES (_username, inet_client_addr()::text, false);

  -- Try to authenticate
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
    
  -- If authentication successful, update records
  IF FOUND THEN
    UPDATE public.admin_credentials 
    SET last_login = now(),
        updated_at = now()
    WHERE admin_credentials.username = _username;
    
    UPDATE public.admin_login_attempts 
    SET success = true 
    WHERE admin_login_attempts.username = _username 
    AND admin_login_attempts.created_at = (
      SELECT MAX(ala.created_at) FROM public.admin_login_attempts ala
      WHERE ala.username = _username
    );
  END IF;
END;
$$;