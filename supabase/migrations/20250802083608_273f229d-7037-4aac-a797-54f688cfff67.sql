-- Add enhanced property-specific fields to properties table

-- Floor and building specific fields
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS lift_available boolean DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS society_name text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS society_maintenance numeric;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS building_age integer;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS floor_plan_type text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS balconies integer DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS view_description text;

-- Plot and land specific fields  
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS plot_length numeric;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS plot_width numeric;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS plot_shape text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS boundary_wall boolean DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS plot_corner boolean DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS development_permissions text[];
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS zone_classification text;

-- Commercial specific fields
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS office_type text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS cabin_count integer DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS conference_rooms integer DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS reception_area boolean DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS it_infrastructure text[];
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS building_grade text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS front_footage numeric;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS display_windows integer DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS foot_traffic_rating text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS business_licenses text[];

-- Construction and quality fields
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS construction_materials text[];
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS construction_grade text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS structural_warranty text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS modular_kitchen boolean DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS wardrobes_count integer DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS bathroom_fittings text;

-- Utilities and infrastructure
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS water_connection_type text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS electricity_load numeric;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS sewerage_connection boolean DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS broadband_ready boolean DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS backup_power text;

-- Legal and documentation
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS title_deed_clear boolean DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS approvals_obtained text[];
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS survey_number text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS khata_number text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS revenue_records text;

-- Investment and financial
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS ready_to_move boolean DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS possession_timeline text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS investment_potential text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS appreciation_forecast text;

-- Agricultural specific fields
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS soil_type text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS water_source text[];
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS irrigation_type text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS crop_history text[];
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS farm_equipment_included boolean DEFAULT false;

-- Accessibility and connectivity
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS public_transport_distance numeric;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS highway_connectivity text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS airport_distance numeric;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS metro_connectivity text;

-- Security and safety
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS security_features text[];
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS cctv_surveillance boolean DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS fire_safety_features text[];
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS earthquake_resistant boolean DEFAULT false;