-- Clear all user data and property listings for fresh start
-- Delete in order to avoid foreign key constraint violations

-- Clear user-related data
DELETE FROM public.lead_notes;
DELETE FROM public.leads;
DELETE FROM public.user_activities;
DELETE FROM public.property_feature_requests;
DELETE FROM public.property_verification_details;
DELETE FROM public.property_inquiries;
DELETE FROM public.user_inquiries;
DELETE FROM public.user_secondary_contacts;
DELETE FROM public.notifications;

-- Clear property listings
DELETE FROM public.properties;

-- Clear user profiles and roles
DELETE FROM public.user_roles;
DELETE FROM public.profiles;

-- Clear OTP records
DELETE FROM public.phone_otps;

-- Clear admin session data (keep admin credentials intact)
DELETE FROM public.admin_sessions;
DELETE FROM public.admin_login_attempts;

-- Clear admin activity logs (optional - keeping for audit trail)
-- DELETE FROM public.admin_activities;

-- Note: auth.users table is managed by Supabase Auth
-- To delete auth users, use the Supabase dashboard or Auth API