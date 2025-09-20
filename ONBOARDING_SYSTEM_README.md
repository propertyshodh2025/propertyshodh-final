# PropertyShodh One-Time Onboarding System

## Overview

This document describes the new simplified one-time onboarding system that replaces the previous complex authentication guards and verification flows.

## Key Features

✅ **One-Time Setup**: Users complete onboarding only once during account creation  
✅ **Never Repeats**: Once completed, the onboarding dialog never appears again, even after logout/login  
✅ **Cost Effective**: Mobile verification happens only once, reducing SMS service costs  
✅ **Clean UI/UX**: Streamlined 4-step process with clear visual indicators  
✅ **Secure**: All verification is server-side validated  
✅ **Legacy Compatible**: Existing users are automatically migrated  

## User Flow

### 1. Welcome Step
- Introduction to the one-time setup process
- Clear explanation that this only happens once
- Overview of what will be required

### 2. Terms & Privacy Step  
- Terms of Service acceptance (mandatory)
- Privacy Policy acceptance (mandatory)
- Full-text viewing of both documents
- Cannot proceed without accepting both

### 3. Mobile Verification Step
- Enter 10-digit Indian mobile number (+91)
- OTP sent via Fast2SMS service
- Input validation and error handling

### 4. OTP Verification Step
- 6-digit OTP input interface
- Server-side verification
- Complete profile setup on success

### 5. Success Step
- Confirmation of successful setup
- Auto-close after 2 seconds
- User is fully onboarded

## Technical Implementation

### Components

#### `OneTimeOnboardingDialog.tsx`
- Main onboarding dialog component
- Handles all 5 steps in a single component
- Uses purpose `'onboarding'` for OTP verification
- Immediately marks completion in localStorage

#### `OnboardingGuard.tsx`  
- Replaces all previous authentication guards
- Single point of onboarding check
- Checks localStorage first for performance
- Falls back to database verification
- Handles legacy user migration

### Database Schema

```sql
-- profiles table includes:
onboarding_completed BOOLEAN DEFAULT FALSE
-- Set to TRUE once user completes the flow
-- Never reset, permanent completion flag
```

### Backend Functions

#### `verify-otp` Function (Updated)
```typescript
// For purpose: 'onboarding'
// Sets ALL fields in one operation:
{
  mobile_verified: true,
  terms_accepted: true,
  privacy_policy_accepted: true,
  terms_accepted_at: now(),
  privacy_policy_accepted_at: now(),
  onboarding_completed: true
}
```

## File Structure

```
src/components/auth/
├── OneTimeOnboardingDialog.tsx     # New: Main onboarding dialog
├── OnboardingGuard.tsx             # New: Simple onboarding guard
├── EnhancedMobileVerificationDialog.tsx  # Legacy: Can be removed
├── PhoneVerificationGate.tsx       # Legacy: Can be removed  
├── MobileVerificationGuard.tsx     # Legacy: Can be removed
└── withTermsProtection.tsx         # Legacy: Can be removed
```

## Key Benefits

### 1. Cost Reduction
- Mobile verification only happens once during signup
- No repeated SMS costs for returning users
- Google authentication handles security for logins

### 2. Better User Experience  
- No repetitive verification dialogs
- Clear, guided onboarding process
- Never interrupts returning users

### 3. Simplified Codebase
- Single onboarding component vs multiple complex guards
- Easier to maintain and debug
- Clear separation of concerns

### 4. Performance
- localStorage check is instant
- Minimal database queries
- No complex state management

## Migration Strategy

### Existing Users
- Users with `mobile_verified=true`, `terms_accepted=true`, and `privacy_policy_accepted=true` are automatically migrated
- Their `onboarding_completed` flag is set to `true`
- They never see the onboarding dialog

### New Users
- Go through the complete onboarding flow once
- All verification completed in single session
- Immediately marked as completed

## Usage

### In App.tsx
```tsx
import { OnboardingGuard } from '@/components/auth/OnboardingGuard';

// Add this once in your app:
<OnboardingGuard />

// Remove old guards from individual routes
```

### Testing
- Use `TermsAcceptanceTest` component for testing
- Clear localStorage to test flow again: `localStorage.clear()`
- Check browser console for detailed logging

## Security Considerations

1. **Server-side Validation**: All OTP verification happens server-side
2. **Terms Acceptance**: Cannot be bypassed client-side  
3. **Phone Verification**: Uses secure hashing for OTP storage
4. **Data Integrity**: All profile updates are atomic operations

## Monitoring & Debugging

### Console Logs
- `[ONBOARDING CHECK]`: Initial status checking
- `[ONBOARDING NEEDED]`: User requires onboarding  
- `[ONBOARDING COMPLETE]`: User has completed onboarding
- `[ONBOARDING SKIP]`: User bypassed due to completion

### Database Queries
Monitor these queries for performance:
```sql
-- Check completion status
SELECT onboarding_completed FROM profiles WHERE user_id = ?

-- Mark as completed
UPDATE profiles SET onboarding_completed = true WHERE user_id = ?
```

## Environment Variables

Ensure these are set in your Supabase Edge Function environment:
- `FAST2SMS_API_KEY`: For SMS delivery (optional for dev)
- `OTP_PEPPER`: For secure OTP hashing
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: For database operations

## Future Enhancements

1. **Analytics**: Track onboarding completion rates
2. **A/B Testing**: Test different onboarding flows  
3. **Internationalization**: Multi-language support
4. **Skip Options**: Emergency skip for special cases
5. **Bulk Migration**: Tools for migrating large user bases

---

## Support

For questions or issues with the onboarding system:
1. Check browser console logs
2. Verify database schema is up to date
3. Test with development OTP mode
4. Review Supabase Edge Function logs