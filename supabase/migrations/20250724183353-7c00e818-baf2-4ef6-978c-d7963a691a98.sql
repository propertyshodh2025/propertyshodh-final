-- Drop and recreate admin policy for property verification details
DROP POLICY IF EXISTS "Admin can manage all verification details" ON public.property_verification_details;

CREATE POLICY "Admin can manage all verification details"
ON public.property_verification_details
FOR ALL
USING (is_admin_authenticated());