-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL CHECK (property_type IN ('Flat', 'Row House', 'Plot', 'Commercial', 'Bungalow', 'Villa')),
  bhk INTEGER,
  price DECIMAL(15,2) NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  carpet_area INTEGER, -- in sq ft
  amenities TEXT[], -- array of amenities
  possession_status TEXT CHECK (possession_status IN ('Ready to Move', 'Under Construction')),
  listing_status TEXT NOT NULL DEFAULT 'Active' CHECK (listing_status IN ('Active', 'Sold', 'Hidden')),
  contact_number TEXT,
  google_map_link TEXT,
  images TEXT[], -- array of image URLs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (even though we're not using auth yet, good practice)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy for now (since no auth yet)
CREATE POLICY "Allow all operations for now" 
ON public.properties 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_properties_listing_status ON public.properties(listing_status);
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_property_type ON public.properties(property_type);
CREATE INDEX idx_properties_price ON public.properties(price);