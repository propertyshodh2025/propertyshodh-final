-- 🚨 COPY AND PASTE THIS INTO SUPABASE SQL EDITOR
-- This will permanently fix the popup issue at the database level

-- Step 1: Add the onboarding_completed column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Step 2: Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
ON public.profiles(onboarding_completed);

-- Step 3: Add comment for documentation
COMMENT ON COLUMN public.profiles.onboarding_completed 
IS 'Indicates whether user has completed the one-time onboarding process. Once true, popup never shows again.';

-- Step 4: Mark ALL existing users who have completed verification as onboarding_completed = TRUE
-- This prevents the popup from showing for existing users
UPDATE public.profiles 
SET onboarding_completed = TRUE 
WHERE mobile_verified = TRUE 
  AND terms_accepted = TRUE 
  AND privacy_policy_accepted = TRUE 
  AND phone_number IS NOT NULL;

-- Step 5: Also mark users who have any verification as completed (more lenient)
-- Uncomment this if you want to be more aggressive about stopping popups
-- UPDATE public.profiles 
-- SET onboarding_completed = TRUE 
-- WHERE mobile_verified = TRUE OR terms_accepted = TRUE;

-- Verification query - check if it worked
SELECT user_id, email, mobile_verified, terms_accepted, privacy_policy_accepted, onboarding_completed 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;