-- Fix property_type constraint to include all valid types
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_property_type_check;

-- Add new constraint with all valid property types
ALTER TABLE properties ADD CONSTRAINT properties_property_type_check 
CHECK (property_type IN ('Flat', 'Row House', 'Plot', 'Commercial', 'Bungalow', 'Villa', 'Apartment', 'House', 'Land'));