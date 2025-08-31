-- Add mobile verification status to profiles table
ALTER TABLE public.profiles ADD COLUMN mobile_verified boolean DEFAULT false;