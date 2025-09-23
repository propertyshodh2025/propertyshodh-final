-- Test the current state of the database
-- Run this in Supabase SQL Editor to see what's currently in the database

-- 1. Check current data in site_settings table
SELECT * FROM public.site_settings;

-- 2. Test the RPC function with a new number
SELECT public.update_central_contact_number('+91 9876543210');

-- 3. Check the data again to see if it updated
SELECT * FROM public.site_settings;