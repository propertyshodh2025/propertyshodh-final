# Simplified Property Verification Workflow Test Plan

## Overview
The property verification process has been simplified to remove the complex form and replace it with a simple "Request Verification" button. This document outlines the test plan for the new workflow.

## Changes Made

### 1. User Dashboard (UserDashboard.tsx)
- ✅ Removed `PropertyVerificationForm` import and usage
- ✅ Removed form-related state variables (`verificationProperty`, `showVerificationForm`)
- ✅ Added `handleRequestVerification` function that creates basic verification requests
- ✅ Updated verification button rendering to use simple buttons
- ✅ Removed complex form dialog component

### 2. Admin Verification Management (VerificationManagement.tsx)  
- ✅ Updated to show request notes and indicate simplified process
- ✅ Updated placeholder text for admin notes
- ✅ Added display of request notes if available

### 3. Database Schema
- ✅ No changes needed - existing schema supports simplified approach with defaults

## Test Workflow

### Step 1: User Requests Verification
1. **Login as a regular user**
2. **Navigate to User Dashboard → Properties tab**
3. **Find an unverified property**
4. **Click "Request Verification" button**
5. **Verify:**
   - Toast notification shows success message
   - Button changes to "Under Review" with "Cancel Request" option
   - Property verification_status updates to 'pending'
   - Record is created in property_verification_details table

### Step 2: Admin Reviews Request
1. **Login as admin**
2. **Navigate to Admin Dashboard → Verification Management**
3. **Check Pending tab**
4. **Verify:**
   - New verification request appears in pending list
   - Shows property details, user contact info
   - Shows "Verification requested through simplified process" note
   - Can click "Review" to see full details

### Step 3: Admin Processes Request
1. **In the Review dialog:**
   - Property information displays correctly
   - Contact information shows user details
   - Additional notes show simplified process message
   - Default values are populated (owner, completed, good condition, etc.)
2. **Admin can:**
   - Add admin notes
   - Approve or Reject the request

### Step 4: User Sees Result
1. **User returns to dashboard**
2. **Verification status updates:**
   - If approved: Shows "✓ Verified Property" badge
   - If rejected: Shows "Request Verification" button again (allows resubmission)

## Key Benefits of Simplified Approach

1. **For Users:**
   - No complex form to fill out
   - Single click to request verification
   - Team contacts them for detailed verification

2. **For Admins:**
   - Still get all necessary contact information
   - Can see property details
   - Can approve/reject with notes
   - Clear indication this is a simplified request

3. **For Team:**
   - Manual process allows for better quality control
   - Direct contact with property owners
   - Can verify documents and details personally
   - Reduces technical complexity

## Expected Data in property_verification_details

When a user requests verification through the simplified process, the following data is stored:

```json
{
  "property_id": "[actual property ID]",
  "full_name": "[from user profile or 'Not provided']",
  "contact_number": "[from user profile or 'Not provided']", 
  "email_address": "[from user profile or user email]",
  "ownership_type": "owner",
  "title_clear": true,
  "construction_status": "completed",
  "property_condition": "good", 
  "actual_photos_uploaded": true,
  "completeness_score": 75,
  "language_preference": "[user's current language]",
  "submitted_by_user_id": "[user ID]",
  "additional_notes": "Verification requested through simplified process. Team will contact for detailed verification."
}
```

## Testing Checklist

- [ ] User can request verification with single click
- [ ] Proper status updates in UI (pending → under review)
- [ ] Admin can see and review requests
- [ ] Admin can approve/reject with notes
- [ ] User sees final status (verified/rejected)
- [ ] Resubmission works for rejected requests
- [ ] Cancel request functionality works
- [ ] Toast notifications work correctly
- [ ] Database records are created properly
- [ ] No form validation errors occur