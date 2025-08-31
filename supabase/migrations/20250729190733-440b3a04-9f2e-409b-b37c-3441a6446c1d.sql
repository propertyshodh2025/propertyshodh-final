-- Create table for property feature requests
CREATE TABLE public.property_feature_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by_admin_id UUID,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_feature_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own feature requests" 
ON public.property_feature_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create feature requests for their own properties" 
ON public.property_feature_requests 
FOR INSERT 
WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
        SELECT 1 FROM public.properties 
        WHERE id = property_id AND user_id = auth.uid()
    )
);

CREATE POLICY "Admin can manage all feature requests" 
ON public.property_feature_requests 
FOR ALL 
USING (is_admin_authenticated());

-- Add featured status to properties table
ALTER TABLE public.properties 
ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN featured_at TIMESTAMP WITH TIME ZONE;

-- Create trigger for updated_at
CREATE TRIGGER update_property_feature_requests_updated_at
BEFORE UPDATE ON public.property_feature_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_property_feature_requests_status ON public.property_feature_requests(status);
CREATE INDEX idx_property_feature_requests_property_id ON public.property_feature_requests(property_id);
CREATE INDEX idx_properties_featured ON public.properties(is_featured) WHERE is_featured = true;