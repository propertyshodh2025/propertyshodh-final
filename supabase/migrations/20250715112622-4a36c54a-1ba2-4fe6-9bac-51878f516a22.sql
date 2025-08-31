-- Phase 1: Enterprise Security Improvements

-- First, let's fix the authenticate_admin function to work with proper password hashing
DROP FUNCTION IF EXISTS public.authenticate_admin(text, text);

CREATE OR REPLACE FUNCTION public.authenticate_admin(_username text, _password text)
RETURNS TABLE(id uuid, username text, role app_role, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check rate limiting (max 5 attempts per hour per username)
  IF (
    SELECT COUNT(*) FROM public.admin_login_attempts 
    WHERE username = _username 
    AND created_at > NOW() - INTERVAL '1 hour'
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
    WHERE username = _username 
    AND created_at = (
      SELECT MAX(created_at) FROM public.admin_login_attempts 
      WHERE username = _username
    );
  END IF;
END;
$$;

-- Create admin_login_attempts table for rate limiting
CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  ip_address TEXT,
  success BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_sessions table for server-side session management
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.admin_credentials(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_login_attempts
CREATE POLICY "Superadmins can view all login attempts" 
ON public.admin_login_attempts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_credentials ac 
    WHERE ac.username = current_setting('app.current_admin_username', true)
    AND ac.role = 'superadmin'
  )
);

-- RLS policies for admin_sessions  
CREATE POLICY "Admins can view their own sessions" 
ON public.admin_sessions 
FOR SELECT 
USING (
  admin_id = (
    SELECT id FROM public.admin_credentials 
    WHERE username = current_setting('app.current_admin_username', true)
  )
);

-- Function to create admin session
CREATE OR REPLACE FUNCTION public.create_admin_session(
  _admin_id UUID,
  _ip_address TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _session_token TEXT;
  _expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate secure session token
  _session_token := encode(gen_random_bytes(32), 'hex');
  _expires_at := now() + INTERVAL '2 hours';
  
  -- Clean up old sessions for this admin
  DELETE FROM public.admin_sessions 
  WHERE admin_id = _admin_id 
  AND expires_at < now();
  
  -- Create new session
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

-- Function to validate admin session
CREATE OR REPLACE FUNCTION public.validate_admin_session(_session_token TEXT)
RETURNS TABLE(admin_id UUID, username TEXT, role app_role, is_active BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update last_activity for sliding window
  UPDATE public.admin_sessions 
  SET last_activity = now()
  WHERE session_token = _session_token 
  AND expires_at > now();
  
  -- Return admin details if session is valid
  RETURN QUERY
  SELECT 
    ac.id,
    ac.username,
    ac.role,
    ac.is_active
  FROM public.admin_sessions s
  JOIN public.admin_credentials ac ON s.admin_id = ac.id
  WHERE s.session_token = _session_token 
  AND s.expires_at > now()
  AND ac.is_active = true;
END;
$$;

-- Function to revoke admin session
CREATE OR REPLACE FUNCTION public.revoke_admin_session(_session_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.admin_sessions 
  WHERE session_token = _session_token;
  
  RETURN FOUND;
END;
$$;

-- Function to clean up expired sessions (should be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_admin_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.admin_sessions 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Add some default admin credentials with proper hashing
-- Note: You should change these passwords after deployment
INSERT INTO public.admin_credentials (username, password_hash, role) 
VALUES 
  ('superadmin', crypt('SuperAdmin@123', gen_salt('bf')), 'superadmin'),
  ('admin1', crypt('Admin@123', gen_salt('bf')), 'admin')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at = now();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_username_created ON public.admin_login_attempts(username, created_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON public.admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON public.admin_sessions(admin_id);