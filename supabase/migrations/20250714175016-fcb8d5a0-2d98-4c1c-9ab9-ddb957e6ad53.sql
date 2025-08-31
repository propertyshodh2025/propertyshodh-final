-- Add verification status field to property_inquiries table
ALTER TABLE public.property_inquiries 
ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false;

-- Update RLS policy to allow unauthenticated users to create inquiries
DROP POLICY IF EXISTS "Authenticated users can create property inquiries" ON public.property_inquiries;

-- Create new policy allowing anyone to create inquiries
CREATE POLICY "Anyone can create property inquiries" 
ON public.property_inquiries 
FOR INSERT 
WITH CHECK (true);

-- Add verification status field to user_inquiries table 
ALTER TABLE public.user_inquiries 
ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false;

-- Update RLS policy to allow unauthenticated users to create user inquiries
DROP POLICY IF EXISTS "Authenticated users can create user inquiries" ON public.user_inquiries;

-- Create new policy allowing anyone to create user inquiries
CREATE POLICY "Anyone can create user inquiries" 
ON public.user_inquiries 
FOR INSERT 
WITH CHECK (true);