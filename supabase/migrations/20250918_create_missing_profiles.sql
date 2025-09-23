-- Create missing profiles for existing auth users
-- This handles the case where users exist in auth.users but don't have corresponding profiles

DO $$
BEGIN
  -- Insert profiles for any auth users that don't have a profile yet
  INSERT INTO public.profiles (user_id, email, created_at, updated_at)
  SELECT 
    au.id as user_id,
    au.email,
    au.created_at,
    au.updated_at
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.user_id
  WHERE p.user_id IS NULL;
  
  -- Log how many profiles were created
  GET DIAGNOSTICS rowcount = ROW_COUNT;
  RAISE NOTICE 'Created % missing profiles', rowcount;
END $$;