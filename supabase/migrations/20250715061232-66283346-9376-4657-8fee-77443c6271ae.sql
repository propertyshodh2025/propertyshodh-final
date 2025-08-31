-- First, update the app_role enum to include superadmin
ALTER TYPE public.app_role ADD VALUE 'superadmin';

-- Create admin_credentials table for storing admin login credentials
CREATE TABLE public.admin_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'admin'::app_role,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on admin_credentials
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_credentials
CREATE POLICY "Superadmins can manage all admin credentials" 
ON public.admin_credentials 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = auth.uid() 
  AND ur.role = 'superadmin'::app_role
));

CREATE POLICY "Admins can view their own credentials" 
ON public.admin_credentials 
FOR SELECT 
USING (username = current_setting('app.current_admin_username', true));

-- Create function to authenticate admin
CREATE OR REPLACE FUNCTION public.authenticate_admin(
  _username TEXT,
  _password TEXT
)
RETURNS TABLE(
  id UUID,
  username TEXT,
  role app_role,
  is_active BOOLEAN
)
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
    WHERE username = _username;
  END IF;
END;
$$;

-- Create function to create admin credentials
CREATE OR REPLACE FUNCTION public.create_admin_credential(
  _username TEXT,
  _password TEXT,
  _role app_role DEFAULT 'admin'::app_role
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Check if user has superadmin role
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'superadmin'::app_role
  ) THEN
    RAISE EXCEPTION 'Only superadmins can create admin credentials';
  END IF;
  
  INSERT INTO public.admin_credentials (username, password_hash, role)
  VALUES (_username, crypt(_password, gen_salt('bf')), _role)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Create function to update admin password
CREATE OR REPLACE FUNCTION public.update_admin_password(
  _admin_id UUID,
  _new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has superadmin role
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'superadmin'::app_role
  ) THEN
    RAISE EXCEPTION 'Only superadmins can update admin passwords';
  END IF;
  
  UPDATE public.admin_credentials 
  SET password_hash = crypt(_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = _admin_id;
  
  RETURN FOUND;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_admin_credentials_updated_at
  BEFORE UPDATE ON public.admin_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial superadmin credential (username: superadmin, password: SuperAdmin@123)
INSERT INTO public.admin_credentials (username, password_hash, role)
VALUES ('superadmin', crypt('SuperAdmin@123', gen_salt('bf')), 'superadmin');

-- Insert the existing admin credential  
INSERT INTO public.admin_credentials (username, password_hash, role)
VALUES ('admin1', crypt('Propertyshodh@555', gen_salt('bf')), 'admin');