-- Add 'agricultural' to the allowed property categories
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_property_category_check;

-- Create a new check constraint that includes agricultural
ALTER TABLE properties ADD CONSTRAINT properties_property_category_check 
CHECK (property_category IN ('residential', 'commercial', 'agricultural'));