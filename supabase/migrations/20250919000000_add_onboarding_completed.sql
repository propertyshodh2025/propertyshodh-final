-- Add onboarding completion tracking to profiles table
-- This prevents the terms/privacy popup from showing again after sign out/sign in
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON public.profiles(onboarding_completed);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Indicates whether user has completed the one-time onboarding process (terms acceptance + mobile verification). Once true, the onboarding popup will never show again.';

-- Set existing fully verified users as onboarding completed
-- This ensures existing users who have already gone through the process don't see it again
UPDATE public.profiles 
SET onboarding_completed = TRUE 
WHERE mobile_verified = TRUE 
  AND terms_accepted = TRUE 
  AND privacy_policy_accepted = TRUE 
  AND phone_number IS NOT NULL;