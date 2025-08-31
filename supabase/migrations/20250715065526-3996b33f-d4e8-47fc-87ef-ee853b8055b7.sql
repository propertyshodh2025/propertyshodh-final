-- Ensure pgcrypto is enabled and create a working authentication function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop and recreate the authenticate_admin function
DROP FUNCTION IF EXISTS public.authenticate_admin(text, text);

CREATE OR REPLACE FUNCTION public.authenticate_admin(_username text, _password text)
RETURNS TABLE(id uuid, username text, role app_role, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
    
  -- Update last_login if authentication successful
  IF FOUND THEN
    UPDATE public.admin_credentials 
    SET last_login = now(),
        updated_at = now()
    WHERE admin_credentials.username = _username;
  END IF;
END;
$$;