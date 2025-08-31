-- Fix the create_admin_session function search path to include extensions schema
DROP FUNCTION IF EXISTS public.create_admin_session(uuid, text, text);

CREATE OR REPLACE FUNCTION public.create_admin_session(_admin_id uuid, _ip_address text DEFAULT NULL::text, _user_agent text DEFAULT NULL::text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  _session_token TEXT;
  _expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  _session_token := encode(gen_random_bytes(32), 'hex');
  _expires_at := now() + INTERVAL '2 hours';
  
  DELETE FROM public.admin_sessions 
  WHERE admin_id = _admin_id 
  AND expires_at < now();
  
  INSERT INTO public.admin_sessions (
    admin_id, 
    session_token, 
    expires_at, 
    ip_address, 
    user_agent
  ) VALUES (
    _admin_id, 
    _session_token, 
    _expires_at, 
    _ip_address, 
    _user_agent
  );
  
  RETURN _session_token;
END;
$$;