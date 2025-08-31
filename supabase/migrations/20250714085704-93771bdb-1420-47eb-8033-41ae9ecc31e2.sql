-- Temporarily disable RLS to allow admin functionality without authentication
-- We'll make all admin operations accessible for now

-- Disable RLS on all tables to allow direct access
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_inquiries DISABLE ROW LEVEL SECURITY; 
ALTER TABLE public.user_inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;