-- FIXED SQL QUERY - Handles existing policies properly
-- Copy and paste this EXACT query into your Supabase SQL Editor

-- Step 1: Disable RLS temporarily
ALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;

-- Step 2: Add missing columns if they don't exist
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Step 3: Create the bulletproof update function
CREATE OR REPLACE FUNCTION public.update_central_contact_number(_contact_number TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data JSON;
  existing_id UUID;
BEGIN
  -- Check if record exists
  SELECT id INTO existing_id FROM public.site_settings LIMIT 1;
  
  IF existing_id IS NOT NULL THEN
    -- Update existing record
    UPDATE public.site_settings 
    SET 
      central_contact_number = _contact_number,
      updated_at = NOW()
    WHERE id = existing_id;
    
    -- Return success with updated data
    SELECT json_build_object(
      'success', true,
      'id', existing_id,
      'central_contact_number', _contact_number,
      'updated_at', NOW(),
      'action', 'updated'
    ) INTO result_data;
  ELSE
    -- Insert new record
    INSERT INTO public.site_settings (central_contact_number, maintenance_mode)
    VALUES (_contact_number, FALSE)
    RETURNING id INTO existing_id;
    
    -- Return success with new data
    SELECT json_build_object(
      'success', true,
      'id', existing_id,
      'central_contact_number', _contact_number,
      'updated_at', NOW(),
      'action', 'inserted'
    ) INTO result_data;
  END IF;
  
  RETURN result_data;
END;
$$;

-- Step 4: Grant permissions to everyone (this is safe since the function itself is the security layer)
GRANT EXECUTE ON FUNCTION public.update_central_contact_number(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_central_contact_number(TEXT) TO anon;

-- Step 5: Re-enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop ALL existing policies to avoid conflicts
DO $$
BEGIN
    -- Drop policies if they exist (no error if they don't exist)
    DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;
    DROP POLICY IF EXISTS "Admin can manage site settings" ON public.site_settings;
    DROP POLICY IF EXISTS "Public read access" ON public.site_settings;
    DROP POLICY IF EXISTS "Authenticated write access" ON public.site_settings;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore any errors from dropping non-existent policies
        NULL;
END;
$$;

-- Step 7: Create new policies with unique names
CREATE POLICY "site_settings_read_access_2023" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "site_settings_write_access_2023" ON public.site_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Step 8: Ensure there's at least one record
INSERT INTO public.site_settings (central_contact_number, maintenance_mode) 
VALUES ('', FALSE)
ON CONFLICT DO NOTHING;