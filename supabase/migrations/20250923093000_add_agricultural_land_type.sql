-- Add agricultural_land_type field to properties table
-- This supports the new Land > Agricultural > Type selection flow

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS agricultural_land_type TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.properties.agricultural_land_type IS 'Type of agricultural land (koradwahu, bagayti, etc.) when property_category is agricultural';

-- Create index for better performance when filtering by agricultural land type
CREATE INDEX IF NOT EXISTS idx_properties_agricultural_land_type 
ON public.properties(agricultural_land_type) 
WHERE agricultural_land_type IS NOT NULL;