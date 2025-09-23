-- Create RPC function to update site settings with admin authentication
CREATE OR REPLACE FUNCTION public.update_site_settings(
  _central_contact_number TEXT DEFAULT NULL,
  _facebook_url TEXT DEFAULT NULL,
  _instagram_url TEXT DEFAULT NULL,
  _linkedin_url TEXT DEFAULT NULL,
  _twitter_url TEXT DEFAULT NULL,
  _youtube_url TEXT DEFAULT NULL,
  _maintenance_mode BOOLEAN DEFAULT NULL,
  _maintenance_message TEXT DEFAULT NULL
)
RETURNS TABLE(id UUID, central_contact_number TEXT, updated_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  existing_id UUID;
  result_record RECORD;
BEGIN
  -- Check if current user has admin privileges
  IF NOT public.is_admin_request() THEN
    RAISE EXCEPTION 'Access denied: Admin authentication required';
  END IF;

  -- Set secure function context
  PERFORM set_config('app.function_context', 'admin_auth', true);
  PERFORM set_config('app.admin_auth_active', 'true', true);

  -- Check if a record exists
  SELECT site_settings.id INTO existing_id 
  FROM public.site_settings 
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    -- Update existing record, only updating non-null parameters
    UPDATE public.site_settings 
    SET 
      central_contact_number = COALESCE(_central_contact_number, central_contact_number),
      facebook_url = COALESCE(_facebook_url, facebook_url),
      instagram_url = COALESCE(_instagram_url, instagram_url),
      linkedin_url = COALESCE(_linkedin_url, linkedin_url),
      twitter_url = COALESCE(_twitter_url, twitter_url),
      youtube_url = COALESCE(_youtube_url, youtube_url),
      maintenance_mode = COALESCE(_maintenance_mode, maintenance_mode),
      maintenance_message = COALESCE(_maintenance_message, maintenance_message),
      updated_at = now()
    WHERE site_settings.id = existing_id
    RETURNING site_settings.id, site_settings.central_contact_number, site_settings.updated_at 
    INTO result_record;
  ELSE
    -- Insert new record
    INSERT INTO public.site_settings (
      central_contact_number,
      facebook_url,
      instagram_url,
      linkedin_url,
      twitter_url,
      youtube_url,
      maintenance_mode,
      maintenance_message
    )
    VALUES (
      _central_contact_number,
      _facebook_url,
      _instagram_url,
      _linkedin_url,
      _twitter_url,
      _youtube_url,
      COALESCE(_maintenance_mode, FALSE),
      _maintenance_message
    )
    RETURNING site_settings.id, site_settings.central_contact_number, site_settings.updated_at 
    INTO result_record;
  END IF;

  -- Clear function context
  PERFORM set_config('app.function_context', null, true);
  PERFORM set_config('app.admin_auth_active', null, true);

  -- Return the result
  RETURN QUERY SELECT result_record.id, result_record.central_contact_number, result_record.updated_at;
END;
$function$;

-- Grant execute permission to authenticated users (admin check is inside the function)
GRANT EXECUTE ON FUNCTION public.update_site_settings(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;

-- Create RPC function to get site settings (public access)
CREATE OR REPLACE FUNCTION public.get_site_settings()
RETURNS TABLE(
  id UUID,
  central_contact_number TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  maintenance_mode BOOLEAN,
  maintenance_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    site_settings.id,
    site_settings.central_contact_number,
    site_settings.facebook_url,
    site_settings.instagram_url,
    site_settings.linkedin_url,
    site_settings.twitter_url,
    site_settings.youtube_url,
    site_settings.maintenance_mode,
    site_settings.maintenance_message,
    site_settings.created_at,
    site_settings.updated_at
  FROM public.site_settings
  LIMIT 1;
END;
$function$;

-- Grant execute permission to everyone (public data)
GRANT EXECUTE ON FUNCTION public.get_site_settings() TO anon, authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.update_site_settings(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) IS 'Update site settings with admin authentication. Only non-null parameters are updated.';
COMMENT ON FUNCTION public.get_site_settings() IS 'Get current site settings (public access).';