-- Clean up property titles that incorrectly have BHK for non-residential properties
-- Migration: Clean Property Titles from inappropriate BHK mentions

-- Create a function to clean property titles based on property type and category
CREATE OR REPLACE FUNCTION clean_property_title(
    title TEXT,
    property_type TEXT,
    property_category TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    cleaned_title TEXT;
    should_have_bhk BOOLEAN;
    normalized_type TEXT;
    normalized_category TEXT;
BEGIN
    -- Return empty string if title is null or empty
    IF title IS NULL OR trim(title) = '' THEN
        RETURN title;
    END IF;

    -- Normalize inputs
    normalized_type := lower(trim(property_type));
    normalized_category := lower(trim(COALESCE(property_category, '')));

    -- Determine if this property type should have BHK
    should_have_bhk := FALSE;
    
    -- Check category first (most reliable)
    IF normalized_category != '' THEN
        -- AGRICULTURAL and COMMERCIAL properties should NEVER have BHK
        IF normalized_category IN ('agricultural', 'commercial') THEN
            should_have_bhk := FALSE;
        -- All other categories (residential, industrial, etc.) can have BHK
        ELSE
            should_have_bhk := TRUE;
        END IF;
    ELSE
        -- Fallback: If no category, check property type
        -- Agricultural and Commercial property types should NOT have BHK
        IF normalized_type IN (
            -- Agricultural
            'farmland', 'orchard', 'plantation', 'agricultural_land', 'farm',
            -- Commercial
            'office', 'shop', 'showroom', 'warehouse', 'building', 'retail_space', 'commercial_space', 'godown'
        ) THEN
            should_have_bhk := FALSE;
        -- Everything else can have BHK
        ELSE
            should_have_bhk := TRUE;
        END IF;
    END IF;

    -- If property shouldn't have BHK but title contains it, remove it
    IF NOT should_have_bhk AND title ~* '\d+\s*BHK' THEN
        cleaned_title := regexp_replace(title, '\d+\s*BHK\s*', '', 'gi');
        cleaned_title := trim(cleaned_title);
        -- If the cleaned title is empty or just whitespace, return original
        IF cleaned_title = '' THEN
            cleaned_title := title;
        END IF;
        RETURN cleaned_title;
    END IF;

    -- Return original title if no changes needed
    RETURN title;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a backup table to store original titles before modification
CREATE TABLE IF NOT EXISTS property_title_cleanup_backup (
    id UUID REFERENCES properties(id),
    original_title TEXT,
    cleaned_title TEXT,
    property_type TEXT,
    property_category TEXT,
    cleaned_at TIMESTAMPTZ DEFAULT NOW(),
    cleanup_reason TEXT
);

-- Insert records that will be modified into backup table
INSERT INTO property_title_cleanup_backup (id, original_title, cleaned_title, property_type, property_category, cleanup_reason)
SELECT 
    p.id,
    p.title as original_title,
    clean_property_title(p.title, p.property_type, p.property_category) as cleaned_title,
    p.property_type,
    p.property_category,
    'Automatic cleanup - removed inappropriate BHK from title'
FROM properties p
WHERE p.title IS NOT NULL 
  AND p.title != clean_property_title(p.title, p.property_type, p.property_category)
  AND p.title ~* '\d+\s*BHK';

-- Update properties with cleaned titles
UPDATE properties 
SET 
    title = clean_property_title(title, property_type, property_category),
    updated_at = NOW()
WHERE title IS NOT NULL 
  AND title != clean_property_title(title, property_type, property_category)
  AND title ~* '\d+\s*BHK';

-- Log the number of properties updated
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO updated_count FROM property_title_cleanup_backup WHERE cleanup_reason LIKE 'Automatic cleanup%';
    RAISE NOTICE 'Property titles cleanup completed. % properties were updated.', updated_count;
END
$$;

-- Add helpful comments
COMMENT ON FUNCTION clean_property_title IS 'Cleans property titles by removing inappropriate BHK mentions from non-residential properties';
COMMENT ON TABLE property_title_cleanup_backup IS 'Backup table storing original titles before cleanup migration';