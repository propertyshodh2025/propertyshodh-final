/**
 * Safe Property Submission Utility
 * 
 * This utility ensures that only existing database columns are included
 * in property submissions to prevent column not found errors.
 */

// Core fields that should always exist in the properties table
const CORE_PROPERTY_FIELDS = [
  'title',
  'description',
  'property_type',
  'property_category',
  'bhk',
  'price',
  'location',
  'city',
  'carpet_area',
  'built_up_area',
  'super_built_up_area',
  'plot_area',
  'amenities',
  'possession_status',
  'listing_status',
  'contact_number',
  'google_map_link',
  'images',
  'furnishing',
  'highlights',
  'built_year',
  'floor',
  'facing',
  'agent_name',
  'agent_phone',
  'submitted_by_user',
  'approval_status',
  'verification_status',
  'verification_score',
  'transaction_type',
  'bathrooms',
  'parking_spaces',
  'parking_type',
  'property_age',
  'ownership_type',
  'created_at',
  'updated_at',
  'user_id',
  'full_name',
  'email_address',
  'preferred_contact_time',
  'language_preference',
  'pincode',
  'locality'
];

// Fields that might exist but should be included conditionally
const OPTIONAL_PROPERTY_FIELDS = [
  'agricultural_land_type',
  'full_address',
  'floor_number',
  'total_floors',
  'lift_available',
  'society_name',
  'society_maintenance',
  'building_age',
  'floor_plan_type',
  'balconies',
  'view_description',
  'modular_kitchen',
  'wardrobes_count',
  'plot_length',
  'plot_width',
  'plot_shape',
  'boundary_wall',
  'plot_corner',
  'development_permissions',
  'zone_classification',
  'office_type',
  'cabin_count',
  'conference_rooms',
  'reception_area',
  'it_infrastructure',
  'building_grade',
  'front_footage',
  'display_windows',
  'foot_traffic_rating',
  'business_licenses',
  'construction_materials',
  'construction_grade',
  'structural_warranty',
  'bathroom_fittings',
  'water_connection_type',
  'electricity_load',
  'sewerage_connection',
  'broadband_ready',
  'backup_power',
  'title_deed_clear',
  'approvals_obtained',
  'survey_number',
  'khata_number',
  'revenue_records',
  'ready_to_move',
  'possession_timeline',
  'investment_potential',
  'appreciation_forecast',
  'soil_type',
  'water_source',
  'irrigation_type',
  'crop_history',
  'farm_equipment_included',
  'public_transport_distance',
  'highway_connectivity',
  'airport_distance',
  'metro_connectivity',
  'security_features',
  'cctv_surveillance',
  'fire_safety_features',
  'earthquake_resistant'
];

/**
 * Creates a safe property data object that only includes fields that exist in the database
 */
export function createSafePropertyData(formData: any): any {
  const safeData: any = {};
  
  // Add core fields (these should always exist)
  CORE_PROPERTY_FIELDS.forEach(field => {
    if (formData.hasOwnProperty(field) && formData[field] !== undefined) {
      safeData[field] = formData[field];
    }
  });
  
  // Add optional fields only if they have meaningful values
  OPTIONAL_PROPERTY_FIELDS.forEach(field => {
    const value = formData[field];
    if (value !== undefined && value !== null && value !== '') {
      // For arrays, only include if not empty
      if (Array.isArray(value)) {
        if (value.length > 0) {
          safeData[field] = value;
        }
      } else {
        safeData[field] = value;
      }
    }
  });
  
  return safeData;
}

/**
 * Minimal property data for basic submissions
 * Use this when you want to ensure maximum compatibility
 */
export function createMinimalPropertyData(formData: any): any {
  return {
    title: formData.title || 'Property',
    description: formData.description || '',
    property_type: formData.property_type || '',
    property_category: formData.property_category || '',
    transaction_type: formData.transaction_type || 'sale',
    bhk: formData.bhk || null,
    price: formData.price || 0,
    location: formData.location || '',
    city: formData.city || 'Aurangabad',
    listing_status: formData.listing_status || 'active',
    approval_status: formData.approval_status || 'pending',
    verification_status: formData.verification_status || 'unverified',
    submitted_by_user: formData.submitted_by_user !== undefined ? formData.submitted_by_user : true,
    user_id: formData.user_id || null,
    created_at: formData.created_at || new Date().toISOString(),
    updated_at: formData.updated_at || new Date().toISOString(),
    
    // Optional fields with fallbacks
    ...(formData.amenities && formData.amenities.length > 0 && { amenities: formData.amenities }),
    ...(formData.images && formData.images.length > 0 && { images: formData.images }),
    ...(formData.highlights && formData.highlights.length > 0 && { highlights: formData.highlights }),
    ...(formData.contact_number && { contact_number: formData.contact_number }),
    ...(formData.agent_name && { agent_name: formData.agent_name }),
    ...(formData.agent_phone && { agent_phone: formData.agent_phone }),
    ...(formData.full_name && { full_name: formData.full_name }),
    ...(formData.email_address && { email_address: formData.email_address }),
    ...(formData.carpet_area && { carpet_area: formData.carpet_area }),
    ...(formData.built_up_area && { built_up_area: formData.built_up_area }),
    ...(formData.plot_area && { plot_area: formData.plot_area }),
    ...(formData.bathrooms && { bathrooms: formData.bathrooms }),
    ...(formData.parking_spaces && { parking_spaces: formData.parking_spaces }),
    ...(formData.built_year && { built_year: formData.built_year }),
    ...(formData.furnishing && { furnishing: formData.furnishing }),
    ...(formData.facing && { facing: formData.facing }),
    ...(formData.ownership_type && { ownership_type: formData.ownership_type }),
    ...(formData.property_age && { property_age: formData.property_age }),
    ...(formData.parking_type && { parking_type: formData.parking_type }),
    ...(formData.locality && { locality: formData.locality }),
    ...(formData.pincode && { pincode: formData.pincode }),
    ...(formData.language_preference && { language_preference: formData.language_preference }),
    ...(formData.preferred_contact_time && formData.preferred_contact_time.length > 0 && { preferred_contact_time: formData.preferred_contact_time })
  };
}