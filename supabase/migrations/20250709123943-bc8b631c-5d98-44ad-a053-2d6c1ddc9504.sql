-- Create user_inquiries table to store question flow data
CREATE TABLE public.user_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  purpose TEXT,
  property_type TEXT,
  budget_range TEXT,
  location TEXT,
  bedrooms TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing all inquiries (for admin)
CREATE POLICY "Allow all operations for admin" 
ON public.user_inquiries 
FOR ALL 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_user_inquiries_updated_at
BEFORE UPDATE ON public.user_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();