-- 🚨 RUN THESE QUERIES IN SUPABASE SQL EDITOR TO FIX ONBOARDING ISSUE

-- Step 1: Ensure onboarding_completed column exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Step 2: Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
ON public.profiles(onboarding_completed);

-- Step 3: CRITICAL - Set ALL existing users as onboarding completed
-- This ensures NO EXISTING USER will see the popup again
UPDATE public.profiles 
SET onboarding_completed = TRUE;

-- Step 4: Alternative - Only mark users with some verification as completed
-- Uncomment this instead of step 3 if you want to be more selective
-- UPDATE public.profiles 
-- SET onboarding_completed = TRUE 
-- WHERE mobile_verified = TRUE 
--   OR terms_accepted = TRUE 
--   OR phone_number IS NOT NULL;

-- Step 5: Check results - see which users are marked as completed
SELECT 
  user_id, 
  email, 
  mobile_verified, 
  terms_accepted, 
  privacy_policy_accepted, 
  onboarding_completed,
  created_at
FROM public.profiles 
ORDER BY created_at DESC;

-- Step 6: If you want to force ALL users to never see popup again (NUCLEAR OPTION)
-- Uncomment this line to mark everyone as completed
-- UPDATE public.profiles SET onboarding_completed = TRUE WHERE onboarding_completed = FALSE OR onboarding_completed IS NULL;