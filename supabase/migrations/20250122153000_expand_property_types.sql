-- Expand Property Types
-- Migration: Add comprehensive property types for residential and commercial properties
-- This migration documents the expanded property types supported in the application

-- Create a documentation table for property types for reference
CREATE TABLE IF NOT EXISTS public.property_type_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  property_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  has_bhk BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_category_type UNIQUE (category, property_type)
);

-- Enable RLS on property type reference
ALTER TABLE public.property_type_reference ENABLE ROW LEVEL SECURITY;

-- Allow public read access to property type reference
CREATE POLICY "Allow public read access to property types"
ON public.property_type_reference
FOR SELECT
USING (true);

-- Allow admin to manage property types
CREATE POLICY "Admin can manage property types"
ON public.property_type_reference
FOR ALL
USING (public.is_admin_authenticated())
WITH CHECK (public.is_admin_authenticated());

-- Insert residential property types
INSERT INTO public.property_type_reference (category, property_type, display_name, has_bhk, description) VALUES
-- 🏡 Residential Properties
('residential', 'plot_land', 'Plot / Land', FALSE, 'Residential plot or land for construction'),
('residential', 'house', 'House', TRUE, 'Independent house or bungalow'),
('residential', 'flat_apartment', 'Flat / Apartment', TRUE, 'Apartment or flat in a building'),
('residential', 'villa', 'Villa', TRUE, 'Luxurious independent villa'),
('residential', 'row_house', 'Row House', TRUE, 'House in a row of similar houses'),
('residential', 'townhouse', 'Townhouse', TRUE, 'Multi-story house sharing walls'),
('residential', 'bungalow', 'Bungalow', TRUE, 'Single-story independent house'),
('residential', 'penthouse', 'Penthouse', TRUE, 'Top-floor luxury apartment'),
('residential', 'studio_apartment', 'Studio Apartment', TRUE, 'Single-room apartment'),
('residential', 'farmhouse', 'Farmhouse', TRUE, 'House with agricultural land'),
('residential', 'condominium', 'Condominium (Condo)', TRUE, 'Privately owned unit in a building'),
('residential', 'duplex_triplex', 'Duplex / Triplex', TRUE, 'Multi-unit residential building'),
('residential', 'mansion', 'Mansion', TRUE, 'Large luxurious house'),
('residential', 'cottage', 'Cottage', TRUE, 'Small house, typically in rural area'),
('residential', 'serviced_apartment', 'Serviced Apartment', TRUE, 'Fully furnished apartment with services'),
('residential', 'garden_flat', 'Garden Flat', TRUE, 'Ground floor flat with garden access'),
('residential', 'loft_apartment', 'Loft Apartment', TRUE, 'Apartment in converted loft space'),
('residential', 'holiday_home', 'Holiday Home', TRUE, 'House for vacation or holidays')
ON CONFLICT (category, property_type) DO NOTHING;

-- Insert commercial property types
INSERT INTO public.property_type_reference (category, property_type, display_name, has_bhk, description) VALUES
-- 🏢 Commercial Properties
('commercial', 'shop_retail_store', 'Shop / Retail Store', FALSE, 'Shop or retail store for business'),
('commercial', 'office_space', 'Office Space', FALSE, 'Office space for business operations'),
('commercial', 'showroom', 'Showroom', FALSE, 'Display area for products or services'),
('commercial', 'warehouse_godown', 'Warehouse / Godown', FALSE, 'Storage facility for goods'),
('commercial', 'hotel_motel', 'Hotel / Motel', TRUE, 'Hospitality accommodation facility'),
('commercial', 'restaurant_cafe', 'Restaurant / Café', FALSE, 'Food and beverage establishment'),
('commercial', 'shopping_mall_plaza', 'Shopping Mall / Plaza', FALSE, 'Large retail complex'),
('commercial', 'clinic_hospital', 'Clinic / Hospital', FALSE, 'Healthcare facility'),
('commercial', 'coworking_space', 'Co-working Space', FALSE, 'Shared workspace facility'),
('commercial', 'industrial_shed_factory', 'Industrial Shed / Factory', FALSE, 'Manufacturing or industrial facility'),
('commercial', 'commercial_land_plot', 'Commercial Land / Plot', FALSE, 'Land for commercial development'),
('commercial', 'it_park_business_center', 'IT Park / Business Center', FALSE, 'Technology or business hub'),
('commercial', 'school_college', 'School / College', FALSE, 'Educational institution'),
('commercial', 'cinema_multiplex', 'Cinema / Multiplex', FALSE, 'Movie theater complex'),
('commercial', 'banquet_hall', 'Banquet Hall', FALSE, 'Event and function venue'),
('commercial', 'petrol_pump', 'Petrol Pump', FALSE, 'Fuel station'),
('commercial', 'bank', 'Bank', FALSE, 'Banking facility'),
('commercial', 'gymnasium_fitness_center', 'Gymnasium / Fitness Center', FALSE, 'Fitness and exercise facility'),
('commercial', 'cold_storage', 'Cold Storage', FALSE, 'Refrigerated storage facility'),
('commercial', 'resort', 'Resort', TRUE, 'Tourist accommodation and recreation facility')
ON CONFLICT (category, property_type) DO NOTHING;

-- Insert agricultural property types
INSERT INTO public.property_type_reference (category, property_type, display_name, has_bhk, description) VALUES
('agricultural', 'farmland', 'Farmland', FALSE, 'Agricultural land for farming'),
('agricultural', 'orchard', 'Orchard', FALSE, 'Land with fruit trees'),
('agricultural', 'plantation', 'Plantation', FALSE, 'Large-scale agricultural estate')
ON CONFLICT (category, property_type) DO NOTHING;

-- Insert industrial property types
INSERT INTO public.property_type_reference (category, property_type, display_name, has_bhk, description) VALUES
('industrial', 'factory', 'Factory', FALSE, 'Manufacturing facility'),
('industrial', 'manufacturing_unit', 'Manufacturing Unit', FALSE, 'Industrial production facility'),
('industrial', 'industrial_plot', 'Industrial Plot', FALSE, 'Land for industrial development')
ON CONFLICT (category, property_type) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_type_ref_category ON public.property_type_reference(category);
CREATE INDEX IF NOT EXISTS idx_property_type_ref_has_bhk ON public.property_type_reference(has_bhk);

-- Add comments for documentation
COMMENT ON TABLE public.property_type_reference IS 'Reference table for all supported property types in the application';
COMMENT ON COLUMN public.property_type_reference.category IS 'Property category: residential, commercial, agricultural, industrial';
COMMENT ON COLUMN public.property_type_reference.property_type IS 'Internal property type identifier used in code';
COMMENT ON COLUMN public.property_type_reference.display_name IS 'Human-readable property type name';
COMMENT ON COLUMN public.property_type_reference.has_bhk IS 'Whether this property type supports BHK configuration';
COMMENT ON COLUMN public.property_type_reference.description IS 'Description of the property type';

-- Grant access to the table
GRANT SELECT ON public.property_type_reference TO authenticated;
GRANT SELECT ON public.property_type_reference TO anon;