-- Create a simple policy that allows reading property inquiries and user inquiries for admin access
-- Remove the restrictive policies and create permissive ones for admin dashboard

-- Update property_inquiries policies
DROP POLICY IF EXISTS "Admin can view all property inquiries" ON public.property_inquiries;
DROP POLICY IF EXISTS "Anyone can create property inquiries" ON public.property_inquiries;

-- Allow anyone to view property inquiries (for admin dashboard)
CREATE POLICY "Anyone can view property inquiries" 
ON public.property_inquiries 
FOR SELECT 
USING (true);

-- Keep the insert policy
CREATE POLICY "Anyone can create property inquiries" 
ON public.property_inquiries 
FOR INSERT 
WITH CHECK (true);

-- Update user_inquiries policies  
DROP POLICY IF EXISTS "Admin can view all user inquiries" ON public.user_inquiries;
DROP POLICY IF EXISTS "Anyone can create user inquiries" ON public.user_inquiries;

-- Allow anyone to view user inquiries (for admin dashboard)
CREATE POLICY "Anyone can view user inquiries" 
ON public.user_inquiries 
FOR SELECT 
USING (true);

-- Keep the insert policy
CREATE POLICY "Anyone can create user inquiries" 
ON public.user_inquiries 
FOR INSERT 
WITH CHECK (true);

-- Update user_activities policies
DROP POLICY IF EXISTS "Admin can view all user activities" ON public.user_activities;
DROP POLICY IF EXISTS "Users can create their own activities" ON public.user_activities;

-- Allow anyone to view user activities (for admin dashboard)  
CREATE POLICY "Anyone can view user activities" 
ON public.user_activities 
FOR SELECT 
USING (true);

-- Keep the insert policy for authenticated users
CREATE POLICY "Users can create their own activities" 
ON public.user_activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);