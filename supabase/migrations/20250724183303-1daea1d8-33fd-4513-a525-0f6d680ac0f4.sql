-- Ensure admin can access property verification details
CREATE POLICY IF NOT EXISTS "Admin can manage all verification details"
ON public.property_verification_details
FOR ALL
USING (is_admin_authenticated());