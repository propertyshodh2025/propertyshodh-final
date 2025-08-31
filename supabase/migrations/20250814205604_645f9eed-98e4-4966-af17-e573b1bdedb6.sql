-- Standardize listing_status values to be consistent
UPDATE properties 
SET listing_status = 'Active' 
WHERE listing_status = 'active';