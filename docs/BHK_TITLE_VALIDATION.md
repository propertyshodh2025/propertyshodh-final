# BHK Title Validation Solution

## Problem Statement

Property titles for farm/land and commercial properties were incorrectly including "BHK" (Bedroom Hall Kitchen) mentions, which is only appropriate for residential properties. BHK is irrelevant for:

- **Commercial properties**: Offices, shops, warehouses, etc.
- **Agricultural properties**: Farmland, orchards, plantations, etc.  
- **Industrial properties**: Factories, manufacturing units, etc.
- **Land/Plot properties**: Empty land parcels

## Solution Overview

We've implemented a comprehensive solution that:

1. **Prevents** inappropriate BHK inclusion in new property titles
2. **Cleans up** existing property titles with inappropriate BHK mentions
3. **Validates** property titles based on type and category
4. **Updates** display components to conditionally show BHK information

## Implementation Details

### 1. Property Validation Utility (`/src/lib/propertyUtils.ts`)

Created a utility module with the following functions:

#### `shouldPropertyHaveBHK(propertyType, propertyCategory)`
- Determines if a property type should include BHK in titles
- Uses both property type and category for accurate determination
- Returns `false` for commercial, agricultural, and industrial properties

#### `generatePropertyTitle(propertyType, location, bhk, propertyCategory, customTitle)`
- Generates appropriate property titles
- Only includes BHK when appropriate for the property type
- Respects custom titles when provided

#### `validatePropertyTitle(title, propertyType, propertyCategory)`
- Validates existing titles for appropriateness
- Returns validation results with issues and suggested corrections

#### `cleanPropertyTitle(title, propertyType, propertyCategory)`
- Removes inappropriate BHK mentions from titles
- Returns cleaned title or original if no changes needed

### 2. Updated Form Validation

#### ComprehensivePropertyForm
- Updated `generateTitle()` function to use the new utility
- Automatically generates appropriate titles based on property type/category

#### Admin PropertyForm  
- Added property category selection field
- Validates and cleans titles during form submission
- Shows user-friendly messages when titles are cleaned

### 3. Database Migration (`/supabase/migrations/20250117000000_clean_property_titles.sql`)

#### Features:
- Creates a PostgreSQL function `clean_property_title()` for server-side validation
- Backs up original titles before making changes
- Updates existing properties with cleaned titles
- Provides detailed logging of changes made

#### Usage:
```sql
-- The migration runs automatically when applied
-- Manual usage:
SELECT clean_property_title('2BHK Shop in Mumbai', 'shop', 'commercial');
-- Returns: 'Shop in Mumbai'
```

### 4. Updated Display Components

#### PropertyCard Component
- Conditionally shows BHK information only for appropriate property types
- Prevents BHK display for commercial/agricultural properties

#### FeaturedPropertiesSection
- Updated to respect BHK appropriateness in property listings

#### ModernPropertyDetails
- Conditionally includes BHK in property stats and share text
- Dynamic property stats based on property type

### 5. Cleanup Script (`/scripts/clean-property-titles.js`)

A Node.js script for validating and cleaning property titles:

#### Features:
- Validates all properties in the database
- Reports issues found with detailed analysis  
- Supports dry-run mode for safe testing
- Creates backup records before making changes

#### Usage:
```bash
# Validate only (no changes)
node scripts/clean-property-titles.js

# Dry run cleanup (preview changes)
node scripts/clean-property-titles.js --cleanup

# Live cleanup (actually update database)  
node scripts/clean-property-titles.js --cleanup --apply
```

## Property Type Classification

### Residential Properties (Can Have BHK):
- `flat`, `apartment`, `house`, `bungalow`, `villa`, `duplex`, `penthouse`, `studio`

### Non-Residential Properties (Should NOT Have BHK):

#### Commercial:
- `office`, `shop`, `showroom`, `warehouse`, `building`, `retail_space`, `commercial_space`, `godown`

#### Agricultural:
- `farmland`, `orchard`, `plantation`, `agricultural_land`, `farm`, `land`, `plot`

#### Industrial:
- `factory`, `manufacturing`, `industrial_plot`, `commercial_plot`

#### Other:
- `parking`, `garage`

## Benefits

### 1. Data Quality
- Ensures property titles are accurate and appropriate
- Eliminates confusion for users browsing listings
- Maintains professional appearance of property listings

### 2. User Experience  
- Users won't see irrelevant BHK information for commercial properties
- Cleaner, more relevant property displays
- Better search and filtering accuracy

### 3. SEO & Marketing
- More accurate property descriptions for search engines
- Professional presentation builds trust
- Prevents misleading property information

### 4. Maintenance
- Automatic validation prevents future inappropriate entries
- Easy-to-use cleanup script for ongoing maintenance
- Comprehensive backup system for data safety

## Testing & Validation

### Manual Testing Steps:

1. **Create New Properties:**
   - Try creating commercial properties with BHK - should be prevented
   - Create residential properties with BHK - should work normally
   - Verify auto-generated titles are appropriate

2. **View Property Listings:**
   - Commercial properties should not show BHK information
   - Residential properties should show BHK when available
   - Check property cards, details pages, and sharing features

3. **Run Validation Script:**
   ```bash
   node scripts/clean-property-titles.js
   ```

### Database Verification:

```sql
-- Check for remaining inappropriate BHK mentions
SELECT id, title, property_type, property_category 
FROM properties 
WHERE title ~* '\d+\s*BHK' 
  AND (property_category IN ('commercial', 'agricultural', 'industrial')
       OR property_type IN ('office', 'shop', 'warehouse', 'farmland', 'land'));

-- View cleanup history
SELECT * FROM property_title_cleanup_backup ORDER BY cleaned_at DESC LIMIT 10;
```

## Rollback Procedure

If issues arise, you can rollback using the backup table:

```sql
-- Restore original titles from backup
UPDATE properties p
SET title = b.original_title,
    updated_at = NOW()
FROM property_title_cleanup_backup b
WHERE p.id = b.id 
  AND b.cleanup_reason LIKE '%Automatic cleanup%';
```

## Future Enhancements

### 1. Additional Validations
- Validate other property fields based on type/category
- Check for appropriate amenities per property type
- Validate price ranges based on property category

### 2. Admin Interface
- Add admin panel for bulk property title management
- Visual diff tool for title changes
- Batch approval system for title modifications

### 3. API Enhancements
- Add property validation endpoints
- Real-time title suggestions in forms
- Property type recommendation based on title

## Maintenance

### Regular Tasks:
1. Run validation script monthly to catch any edge cases
2. Review backup table for cleanup patterns
3. Update property type classifications as needed
4. Monitor user feedback for any missed scenarios

### Monitoring Queries:
```sql
-- Count properties by category and BHK status
SELECT 
  property_category,
  COUNT(*) as total,
  COUNT(CASE WHEN title ~* '\d+\s*BHK' THEN 1 END) as with_bhk
FROM properties 
WHERE title IS NOT NULL
GROUP BY property_category;

-- Recent title cleanups
SELECT COUNT(*), cleanup_reason
FROM property_title_cleanup_backup 
WHERE cleaned_at > NOW() - INTERVAL '30 days'
GROUP BY cleanup_reason;
```

## Support

For issues or questions about this implementation:

1. Check the validation script output for specific property issues
2. Review the backup table for cleanup history  
3. Test changes in development environment first
4. Monitor user feedback for any edge cases not covered

This solution provides a robust, maintainable approach to ensuring property title accuracy while maintaining data integrity and user experience quality.