-- Add sold functionality to properties
-- Update listing_status to include 'Sold' option
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_listing_status_check;

-- Add new constraint with Sold option
ALTER TABLE properties ADD CONSTRAINT properties_listing_status_check 
CHECK (listing_status IN ('Active', 'Inactive', 'Sold'));