-- Add terms acceptance columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS privacy_policy_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_terms_accepted ON public.profiles(terms_accepted);
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_policy_accepted ON public.profiles(privacy_policy_accepted);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.terms_accepted IS 'Indicates whether user has accepted the Terms of Service';
COMMENT ON COLUMN public.profiles.privacy_policy_accepted IS 'Indicates whether user has accepted the Privacy Policy';
COMMENT ON COLUMN public.profiles.terms_accepted_at IS 'Timestamp when user accepted the Terms of Service';
COMMENT ON COLUMN public.profiles.privacy_policy_accepted_at IS 'Timestamp when user accepted the Privacy Policy';