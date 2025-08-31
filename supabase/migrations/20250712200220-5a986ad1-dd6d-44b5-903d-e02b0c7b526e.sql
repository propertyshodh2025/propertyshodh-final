-- Create property_inquiries table for tracking user interest in specific properties
CREATE TABLE public.property_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  inquiry_type TEXT NOT NULL DEFAULT 'interest',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.property_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policies for property inquiries
CREATE POLICY "Allow all operations for admin" 
ON public.property_inquiries 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_property_inquiries_updated_at
BEFORE UPDATE ON public.property_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_property_inquiries_property_id ON public.property_inquiries(property_id);
CREATE INDEX idx_property_inquiries_user_phone ON public.property_inquiries(user_phone);
CREATE INDEX idx_property_inquiries_created_at ON public.property_inquiries(created_at DESC);