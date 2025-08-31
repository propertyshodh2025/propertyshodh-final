-- Create admin_activities table for tracking all admin actions
CREATE TABLE public.admin_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES public.admin_credentials(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_activities
CREATE POLICY "Superadmins can view all admin activities" 
ON public.admin_activities 
FOR SELECT 
USING (
  current_setting('app.current_admin_role', true) = 'superadmin'
);

CREATE POLICY "Admins can view their own activities" 
ON public.admin_activities 
FOR SELECT 
USING (
  admin_id = (
    SELECT id FROM admin_credentials 
    WHERE username = current_setting('app.current_admin_username', true)
  )
  OR current_setting('app.current_admin_role', true) = 'superadmin'
);

-- Create function to log admin activities
CREATE OR REPLACE FUNCTION public.log_admin_activity(
  _admin_id UUID,
  _action_type TEXT,
  _target_type TEXT DEFAULT NULL,
  _target_id UUID DEFAULT NULL,
  _details JSONB DEFAULT NULL,
  _ip_address TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.admin_activities (
    admin_id,
    action_type,
    target_type,
    target_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    _admin_id,
    _action_type,
    _target_type,
    _target_id,
    _details,
    _ip_address,
    _user_agent
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

-- Create function to get admin activities with filtering
CREATE OR REPLACE FUNCTION public.get_admin_activities(
  _admin_id UUID DEFAULT NULL,
  _action_type TEXT DEFAULT NULL,
  _target_type TEXT DEFAULT NULL,
  _start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  _end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  _limit INTEGER DEFAULT 50,
  _offset INTEGER DEFAULT 0
) RETURNS TABLE(
  id UUID,
  admin_id UUID,
  admin_username TEXT,
  action_type TEXT,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aa.id,
    aa.admin_id,
    ac.username as admin_username,
    aa.action_type,
    aa.target_type,
    aa.target_id,
    aa.details,
    aa.ip_address,
    aa.user_agent,
    aa.created_at
  FROM public.admin_activities aa
  JOIN public.admin_credentials ac ON aa.admin_id = ac.id
  WHERE 
    (_admin_id IS NULL OR aa.admin_id = _admin_id)
    AND (_action_type IS NULL OR aa.action_type = _action_type)
    AND (_target_type IS NULL OR aa.target_type = _target_type)
    AND (_start_date IS NULL OR aa.created_at >= _start_date)
    AND (_end_date IS NULL OR aa.created_at <= _end_date)
  ORDER BY aa.created_at DESC
  LIMIT _limit
  OFFSET _offset;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_admin_activities_admin_id ON public.admin_activities(admin_id);
CREATE INDEX idx_admin_activities_action_type ON public.admin_activities(action_type);
CREATE INDEX idx_admin_activities_created_at ON public.admin_activities(created_at DESC);
CREATE INDEX idx_admin_activities_target_type ON public.admin_activities(target_type);

-- Add trigger to update last_activity in admin_sessions when activities are logged
CREATE OR REPLACE FUNCTION public.update_admin_session_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update last_activity for the admin's current session
  UPDATE public.admin_sessions 
  SET last_activity = now()
  WHERE admin_id = NEW.admin_id 
  AND expires_at > now();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_admin_session_activity
  AFTER INSERT ON public.admin_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_admin_session_activity();