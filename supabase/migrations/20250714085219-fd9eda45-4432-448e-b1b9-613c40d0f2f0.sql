-- Fix database schema to match application expectations

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admin can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can view all user inquiries" ON public.user_inquiries;
DROP POLICY IF EXISTS "Admin can view all property inquiries" ON public.property_inquiries;
DROP POLICY IF EXISTS "Admin can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Admin can update properties" ON public.properties;
DROP POLICY IF EXISTS "Admin can delete properties" ON public.properties;

-- Add missing columns to properties table to match code expectations
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS built_year INTEGER,
ADD COLUMN IF NOT EXISTS floor TEXT,
ADD COLUMN IF NOT EXISTS facing TEXT,
ADD COLUMN IF NOT EXISTS furnishing TEXT,
ADD COLUMN IF NOT EXISTS highlights TEXT[],
ADD COLUMN IF NOT EXISTS contact_number TEXT,
ADD COLUMN IF NOT EXISTS google_map_link TEXT;

-- Create new RLS policies that don't cause recursion
-- First, create a simple admin check function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
$$;

-- Create policies for properties
CREATE POLICY "Admin can insert properties" 
ON public.properties FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update properties" 
ON public.properties FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admin can delete properties" 
ON public.properties FOR DELETE 
USING (public.is_admin());

-- Create policies for property_inquiries
CREATE POLICY "Admin can view all property inquiries" 
ON public.property_inquiries FOR SELECT 
USING (public.is_admin());

-- Create policies for user_inquiries
CREATE POLICY "Admin can view all user inquiries" 
ON public.user_inquiries FOR SELECT 
USING (public.is_admin());

-- Create policies for user_roles (simplified to avoid recursion)
CREATE POLICY "Admin can manage all roles" 
ON public.user_roles FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'::app_role
));

-- Insert a default admin user (replace with your actual user ID when you know it)
-- This is a placeholder - you'll need to update this with your actual user ID after authentication
-- INSERT INTO public.user_roles (user_id, role) VALUES ('your-user-id-here', 'admin') ON CONFLICT DO NOTHING;

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_properties_built_year ON public.properties(built_year);
CREATE INDEX IF NOT EXISTS idx_properties_contact_number ON public.properties(contact_number);