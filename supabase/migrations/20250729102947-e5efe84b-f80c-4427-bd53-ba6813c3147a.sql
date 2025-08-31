-- Add new columns to properties table for comprehensive property listing form
-- Based on the detailed flow provided and Google form reference

-- Add area-related columns (carpet, built-up, super built-up, plot)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS built_up_area numeric,
ADD COLUMN IF NOT EXISTS super_built_up_area numeric,
ADD COLUMN IF NOT EXISTS plot_area numeric,

-- Add detailed property information
ADD COLUMN IF NOT EXISTS property_subtype text, -- Already exists
ADD COLUMN IF NOT EXISTS bhk_type text, -- Already exists  
ADD COLUMN IF NOT EXISTS total_floors integer, -- Already exists
ADD COLUMN IF NOT EXISTS floor_number integer, -- Already exists
ADD COLUMN IF NOT EXISTS facing_direction text, -- Already exists
ADD COLUMN IF NOT EXISTS age_of_property integer, -- Already exists
ADD COLUMN IF NOT EXISTS parking_spaces integer, -- Already exists

-- Add verification and documentation fields
ADD COLUMN IF NOT EXISTS title_clear boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS under_construction boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS legal_issues text,

-- Add contact preferences
ADD COLUMN IF NOT EXISTS preferred_contact_time text[],
ADD COLUMN IF NOT EXISTS language_preference text DEFAULT 'english',

-- Add additional location details
ADD COLUMN IF NOT EXISTS pincode text,
ADD COLUMN IF NOT EXISTS locality text,

-- Add ownership and financial details
ADD COLUMN IF NOT EXISTS ownership_type text,
ADD COLUMN IF NOT EXISTS maintenance_charges numeric,
ADD COLUMN IF NOT EXISTS security_deposit numeric,

-- Add construction and property condition details
ADD COLUMN IF NOT EXISTS construction_status text,
ADD COLUMN IF NOT EXISTS property_condition text,
ADD COLUMN IF NOT EXISTS water_supply text,
ADD COLUMN IF NOT EXISTS electricity_backup text,

-- Add verification status enhancement
ADD COLUMN IF NOT EXISTS verification_documentation jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS additional_notes text;