-- Fix ambiguous column reference in authenticate_admin function
CREATE OR REPLACE FUNCTION public.authenticate_admin(_username text, _password text)
RETURNS TABLE(id uuid, username text, role app_role, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Check rate limiting (max 5 attempts per hour per username)
  IF (
    SELECT COUNT(*) FROM public.admin_login_attempts 
    WHERE admin_login_attempts.username = _username 
    AND admin_login_attempts.created_at > NOW() - INTERVAL '1 hour'
  ) >= 5 THEN
    RAISE EXCEPTION 'Too many login attempts. Please try again later.';
  END IF;

  -- Log the login attempt
  INSERT INTO public.admin_login_attempts (username, ip_address, success)
  VALUES (_username, inet_client_addr()::text, false);

  -- Authenticate using proper password hashing
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
    
  -- Update last_login and mark attempt as successful if authentication passed
  IF FOUND THEN
    UPDATE public.admin_credentials 
    SET last_login = now(),
        updated_at = now()
    WHERE admin_credentials.username = _username;
    
    -- Update the login attempt to mark as successful
    UPDATE public.admin_login_attempts 
    SET success = true 
    WHERE admin_login_attempts.username = _username 
    AND admin_login_attempts.created_at = (
      SELECT MAX(ala.created_at) FROM public.admin_login_attempts ala
      WHERE ala.username = _username
    );
  END IF;
END;
$function$