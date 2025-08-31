-- Phase 1: Add new property type fields for better search organization

-- Add new columns to properties table
ALTER TABLE public.properties 
ADD COLUMN transaction_type TEXT DEFAULT 'buy' CHECK (transaction_type IN ('buy', 'rent', 'lease')),
ADD COLUMN property_category TEXT DEFAULT 'residential' CHECK (property_category IN ('residential', 'commercial')),
ADD COLUMN property_subtype TEXT,
ADD COLUMN bhk_type TEXT;

-- Update existing data based on current property_type values
UPDATE public.properties 
SET 
  transaction_type = CASE 
    WHEN property_type ILIKE '%rent%' THEN 'rent'
    WHEN property_type ILIKE '%lease%' THEN 'lease'
    ELSE 'buy'
  END,
  property_category = CASE 
    WHEN property_type ILIKE '%commercial%' OR property_type ILIKE '%office%' OR property_type ILIKE '%shop%' THEN 'commercial'
    ELSE 'residential'
  END,
  property_subtype = CASE 
    WHEN property_type ILIKE '%flat%' OR property_type ILIKE '%apartment%' THEN 'flat'
    WHEN property_type ILIKE '%villa%' THEN 'villa'
    WHEN property_type ILIKE '%bungalow%' THEN 'bungalow'
    WHEN property_type ILIKE '%row house%' OR property_type ILIKE '%rowhouse%' THEN 'row_house'
    WHEN property_type ILIKE '%plot%' OR property_type ILIKE '%land%' THEN 'plot'
    WHEN property_type ILIKE '%office%' THEN 'office'
    WHEN property_type ILIKE '%shop%' THEN 'shop'
    WHEN property_type ILIKE '%warehouse%' THEN 'warehouse'
    ELSE 'flat'
  END,
  bhk_type = CASE 
    WHEN bhk = 1 THEN '1'
    WHEN bhk = 2 THEN '2'
    WHEN bhk = 3 THEN '3'
    WHEN bhk = 4 THEN '4'
    WHEN bhk >= 5 THEN '5+'
    ELSE NULL
  END;

-- Add indexes for better search performance
CREATE INDEX idx_properties_transaction_type ON public.properties(transaction_type);
CREATE INDEX idx_properties_category ON public.properties(property_category);
CREATE INDEX idx_properties_subtype ON public.properties(property_subtype);
CREATE INDEX idx_properties_bhk_type ON public.properties(bhk_type);

-- Create composite index for common search patterns
CREATE INDEX idx_properties_search_combo ON public.properties(transaction_type, property_category, property_subtype, city);

-- Add constraints after data migration
ALTER TABLE public.properties 
ADD CONSTRAINT chk_property_subtype 
CHECK (property_subtype IN ('flat', 'villa', 'bungalow', 'row_house', 'plot', 'office', 'shop', 'warehouse'));

ALTER TABLE public.properties 
ADD CONSTRAINT chk_bhk_type 
CHECK (bhk_type IN ('1', '2', '3', '4', '5+'));

-- Make transaction_type and property_category NOT NULL after setting defaults
ALTER TABLE public.properties 
ALTER COLUMN transaction_type SET NOT NULL,
ALTER COLUMN property_category SET NOT NULL;