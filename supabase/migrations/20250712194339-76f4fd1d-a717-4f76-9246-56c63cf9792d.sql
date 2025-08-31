-- Add field to track who submitted the property and approval status
ALTER TABLE public.properties 
ADD COLUMN submitted_by_user BOOLEAN DEFAULT FALSE;

-- Add approval status for user-submitted properties  
ALTER TABLE public.properties 
ADD COLUMN approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Update existing properties to be admin-submitted and approved
UPDATE public.properties 
SET submitted_by_user = FALSE, approval_status = 'approved';