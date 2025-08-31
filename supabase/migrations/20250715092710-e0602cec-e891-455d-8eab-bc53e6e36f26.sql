-- Create a function to set admin session variables
CREATE OR REPLACE FUNCTION public.set_admin_session(admin_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set the current admin role in the session
  PERFORM set_config('app.current_admin_role', admin_role, false);
END;
$$;