-- Add social media link columns to site_settings table
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Update the updated_at timestamp trigger to handle new columns
-- (The trigger already exists and will handle these new columns automatically)

-- Add comments for documentation
COMMENT ON COLUMN public.site_settings.facebook_url IS 'Facebook page URL for the company';
COMMENT ON COLUMN public.site_settings.instagram_url IS 'Instagram profile URL for the company';
COMMENT ON COLUMN public.site_settings.linkedin_url IS 'LinkedIn profile URL for the company';
COMMENT ON COLUMN public.site_settings.twitter_url IS 'Twitter profile URL for the company';
COMMENT ON COLUMN public.site_settings.youtube_url IS 'YouTube channel URL for the company';