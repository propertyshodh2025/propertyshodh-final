-- Add verification fields to properties table
ALTER TABLE public.properties 
ADD COLUMN verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
ADD COLUMN verification_score INTEGER DEFAULT 0,
ADD COLUMN verification_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN verification_completed_at TIMESTAMP WITH TIME ZONE;

-- Create property verification details table
CREATE TABLE public.property_verification_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  
  -- Personal Information
  full_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email_address TEXT NOT NULL,
  
  -- Property ownership and documentation
  ownership_type TEXT, -- 'owner', 'authorized_agent', 'power_of_attorney'
  title_clear BOOLEAN DEFAULT false,
  legal_issues TEXT,
  construction_status TEXT, -- 'completed', 'under_construction', 'approved_plan'
  
  -- Property condition and features
  property_age TEXT,
  actual_photos_uploaded BOOLEAN DEFAULT false,
  property_condition TEXT, -- 'excellent', 'good', 'fair', 'needs_repair'
  
  -- Contact preferences
  preferred_contact_time TEXT[], -- ['morning', 'afternoon', 'evening', 'anytime']
  additional_notes TEXT,
  
  -- Verification scoring
  completeness_score INTEGER DEFAULT 0,
  accuracy_score INTEGER DEFAULT 0,
  documentation_score INTEGER DEFAULT 0,
  
  -- Metadata
  language_preference TEXT DEFAULT 'english', -- 'english', 'marathi'
  submitted_by_user_id UUID,
  verified_by_admin_id UUID,
  verification_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on verification details
ALTER TABLE public.property_verification_details ENABLE ROW LEVEL SECURITY;

-- Create policies for verification details
CREATE POLICY "Property verification details are viewable by everyone" 
ON public.property_verification_details 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can submit verification details" 
ON public.property_verification_details 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can update verification details" 
ON public.property_verification_details 
FOR UPDATE 
USING (is_admin_authenticated());

-- Create trigger for automatic timestamp updates on verification details
CREATE TRIGGER update_property_verification_details_updated_at
BEFORE UPDATE ON public.property_verification_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing properties to have default verification status
UPDATE public.properties SET verification_status = 'unverified' WHERE verification_status IS NULL;