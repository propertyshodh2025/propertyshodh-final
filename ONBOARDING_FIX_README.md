# Onboarding Popup Fix

## Problem
The terms of service and privacy policy popup (along with mobile verification) was appearing every time a user signed out and signed back in, even after they had already completed the onboarding process once. This was happening because the system only checked current verification status, not whether the user had already gone through the onboarding process.

## Solution
Added a new `onboarding_completed` field to track when a user has completed the one-time onboarding process. Once this field is set to `true`, the onboarding popup will never appear again for that user.

## Changes Made

### Database Changes
1. **Migration**: `supabase/migrations/20250919000000_add_onboarding_completed.sql`
   - Added `onboarding_completed BOOLEAN DEFAULT FALSE` column to `profiles` table
   - Added database index for performance
   - Set existing fully verified users as `onboarding_completed = TRUE`

### Backend Changes
1. **verify-otp function** (`supabase/functions/verify-otp/index.ts`)
   - Now sets `onboarding_completed: true` when user completes mobile verification
   
2. **validate-terms-acceptance function** (`supabase/functions/validate-terms-acceptance/index.ts`)
   - Updated to include `onboarding_completed` in queries
   - Modified logic to prioritize `onboarding_completed` status
   - Added `onboarding_completed` to response details

### Frontend Changes
1. **PhoneVerificationGate.tsx**
   - Added check for `onboarding_completed` before showing verification dialog
   - If `onboarding_completed` is `true`, the dialog will NEVER show again
   - Updated logging to include onboarding status

2. **MobileVerificationGuard.tsx**
   - Updated to check `onboarding_completed` status
   - Users with completed onboarding are automatically verified

3. **useTermsValidation.ts**
   - Updated interface to include `onboarding_completed` field

4. **TermsAcceptanceTest.tsx**
   - Added onboarding status to the test dashboard

## How It Works
1. **New Users**: Go through normal onboarding (terms acceptance + mobile verification)
2. **Onboarding Completion**: When mobile verification is completed, `onboarding_completed` is set to `true`
3. **Subsequent Logins**: System checks `onboarding_completed` first - if `true`, no popup is shown
4. **Existing Users**: Migration automatically sets `onboarding_completed = TRUE` for users who have already completed the process

## Key Benefits
- ✅ One-time onboarding: Popup only appears once in the user's lifetime
- ✅ Persistent across sessions: Works even after sign-out/sign-in
- ✅ Backward compatible: Existing verified users won't see popup again
- ✅ Secure: Server-side validation prevents client-side bypassing
- ✅ Performance: Database indexes for efficient queries

## Testing
1. **New User**: Should see onboarding popup once, then never again
2. **Existing User**: Should not see popup after migration
3. **Sign Out/In**: Popup should not reappear for completed users
4. **Incomplete Onboarding**: Users who didn't complete verification will still see popup

## Deployment Steps
1. Apply database migration: `supabase db push` (or run migration manually)
2. Deploy updated Edge Functions
3. Deploy frontend changes

The fix ensures that the onboarding experience truly happens only once per user, solving the frustrating issue of repeated popups after sign-out/sign-in cycles.