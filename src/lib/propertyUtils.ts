// Property type validation and title generation utilities

export interface PropertyTypeInfo {
  shouldHaveBHK: boolean;
  isResidential: boolean;
  isCommercial: boolean;
  isAgricultural: boolean;
  isIndustrial: boolean;
}

// Property types that should include BHK in titles (when in residential category)
const RESIDENTIAL_PROPERTY_TYPES_WITH_BHK = [
  // 🏡 Residential Properties
  'plot_land', 'house', 'flat_apartment', 'villa', 'row_house', 'townhouse', 'bungalow',
  'penthouse', 'studio_apartment', 'farmhouse', 'condominium', 'duplex_triplex',
  'mansion', 'cottage', 'serviced_apartment', 'garden_flat', 'loft_apartment', 'holiday_home',
  // Legacy support
  'flat', 'apartment', 'duplex', 'studio', 'plot'
];

// Property types that NEVER have BHK (regardless of category)
const NEVER_BHK_PROPERTY_TYPES = [
  'parking', 'garage', 'plot_land', 'commercial_land_plot', 'agricultural_land', 'farmland', 'orchard', 'plantation', 'industrial_plot'
];

// Commercial property types
const COMMERCIAL_PROPERTY_TYPES = [
  // 🏢 Commercial Properties
  'shop_retail_store', 'office_space', 'showroom', 'warehouse_godown', 'hotel_motel',
  'restaurant_cafe', 'shopping_mall_plaza', 'clinic_hospital', 'coworking_space',
  'industrial_shed_factory', 'commercial_land_plot', 'it_park_business_center', 'school_college',
  'cinema_multiplex', 'banquet_hall', 'petrol_pump', 'bank', 'gymnasium_fitness_center',
  'cold_storage', 'resort',
  // Legacy support
  'office', 'shop', 'warehouse', 'building', 'retail_space', 'commercial_space', 'godown'
];

// Agricultural property types
const AGRICULTURAL_PROPERTY_TYPES = [
  'farmland', 'orchard', 'plantation', 'agricultural_land', 'farm'
];

// Industrial property types
const INDUSTRIAL_PROPERTY_TYPES = [
  'factory', 'manufacturing_unit', 'industrial_plot', 'commercial_plot',
  // Legacy support
  'manufacturing'
];

// Property categories
const PROPERTY_CATEGORIES = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial', 
  AGRICULTURAL: 'agricultural',
  INDUSTRIAL: 'industrial'
} as const;

/**
 * Determines if a property type should have BHK mentioned in its title
 * Rule: Only Agricultural and Commercial properties should NOT have BHK
 * Everything else can have BHK
 */
export function shouldPropertyHaveBHK(propertyType: string, propertyCategory?: string): boolean {
  if (!propertyType) return false;
  
  const normalizedType = propertyType.toLowerCase().trim();
  
  // Check category first (most reliable)
  if (propertyCategory) {
    const normalizedCategory = propertyCategory.toLowerCase().trim();
    
    // AGRICULTURAL and COMMERCIAL properties should NEVER have BHK
    if (normalizedCategory === 'agricultural' || normalizedCategory === 'commercial') {
      return false;
    }
    
    // All other categories (residential, industrial, etc.) can have BHK
    return true;
  }
  
  // Fallback: If no category, check property type
  // Agricultural property types
  if (AGRICULTURAL_PROPERTY_TYPES.includes(normalizedType)) {
    return false;
  }
  
  // Commercial property types
  if (COMMERCIAL_PROPERTY_TYPES.includes(normalizedType)) {
    return false;
  }
  
  // Everything else can have BHK (residential, industrial, etc.)
  return true;
}

/**
 * Gets property type information
 */
export function getPropertyTypeInfo(propertyType: string, propertyCategory?: string): PropertyTypeInfo {
  const normalizedType = propertyType.toLowerCase().trim();
  const normalizedCategory = propertyCategory?.toLowerCase().trim();
  
  const isResidential = normalizedCategory === PROPERTY_CATEGORIES.RESIDENTIAL || 
    (!normalizedCategory && RESIDENTIAL_PROPERTY_TYPES_WITH_BHK.includes(normalizedType));
  
  const isCommercial = normalizedCategory === PROPERTY_CATEGORIES.COMMERCIAL || 
    (!normalizedCategory && COMMERCIAL_PROPERTY_TYPES.includes(normalizedType));
  
  const isAgricultural = normalizedCategory === PROPERTY_CATEGORIES.AGRICULTURAL || 
    (!normalizedCategory && AGRICULTURAL_PROPERTY_TYPES.includes(normalizedType));
  
  const isIndustrial = normalizedCategory === PROPERTY_CATEGORIES.INDUSTRIAL || 
    (!normalizedCategory && INDUSTRIAL_PROPERTY_TYPES.includes(normalizedType));
  
  return {
    shouldHaveBHK: shouldPropertyHaveBHK(propertyType, propertyCategory),
    isResidential,
    isCommercial,
    isAgricultural,
    isIndustrial
  };
}

/**
 * Generates a property title based on type, location, and BHK appropriateness
 */
export function generatePropertyTitle(
  propertyType: string,
  location: string,
  bhk?: number | null,
  propertyCategory?: string,
  customTitle?: string
): string {
  // If custom title is provided and valid, use it
  if (customTitle && customTitle.trim()) {
    return customTitle.trim();
  }
  
  if (!propertyType || !location) return '';
  
  const shouldIncludeBHK = shouldPropertyHaveBHK(propertyType, propertyCategory);
  const bhkText = (shouldIncludeBHK && bhk) ? `${bhk}BHK ` : '';
  
  // Format property type for display
  const typeText = propertyType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
  
  return `${bhkText}${typeText} in ${location}`.trim();
}

/**
 * Validates if a property title is appropriate for its type
 */
export function validatePropertyTitle(
  title: string,
  propertyType: string,
  propertyCategory?: string
): { isValid: boolean; issues: string[]; suggestedTitle?: string } {
  const issues: string[] = [];
  const shouldIncludeBHK = shouldPropertyHaveBHK(propertyType, propertyCategory);
  const containsBHK = /\d+\s*BHK/i.test(title);
  
  // Check if BHK is inappropriately included
  if (containsBHK && !shouldIncludeBHK) {
    const typeInfo = getPropertyTypeInfo(propertyType, propertyCategory);
    let propertyTypeDescription = 'this property type';
    
    if (typeInfo.isCommercial) {
      propertyTypeDescription = 'commercial properties';
    } else if (typeInfo.isAgricultural) {
      propertyTypeDescription = 'agricultural/farm properties';
    } else if (typeInfo.isIndustrial) {
      propertyTypeDescription = 'industrial properties';
    }
    
    issues.push(`BHK should not be mentioned in titles for ${propertyTypeDescription}`);
    
    // Suggest a corrected title
    const suggestedTitle = title.replace(/\d+\s*BHK\s*/gi, '').trim();
    return {
      isValid: false,
      issues,
      suggestedTitle: suggestedTitle || undefined
    };
  }
  
  return { isValid: true, issues: [] };
}

/**
 * Cleans a property title by removing inappropriate BHK mentions
 */
export function cleanPropertyTitle(
  title: string,
  propertyType: string,
  propertyCategory?: string
): string {
  const validation = validatePropertyTitle(title, propertyType, propertyCategory);
  if (!validation.isValid && validation.suggestedTitle) {
    return validation.suggestedTitle;
  }
  return title;
}

/**
 * Formats property type for display by converting underscores to spaces and capitalizing
 */
export function formatPropertyTypeForDisplay(propertyType: string): string {
  if (!propertyType) return '';
  
  return propertyType
    .replace(/_/g, ' ')                    // Replace underscores with spaces
    .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize first letter of each word
    .trim();
}

/**
 * Gets the display name for property types (maps internal IDs to user-friendly names)
 */
export function getPropertyTypeDisplayName(propertyType: string): string {
  // Mapping for specific property types that need special formatting
  const displayNameMap: Record<string, string> = {
    // Residential
    'plot_land': 'Plot / Land',
    'flat_apartment': 'Flat / Apartment',
    'row_house': 'Row House',
    'studio_apartment': 'Studio Apartment',
    'duplex_triplex': 'Duplex / Triplex',
    'condominium': 'Condominium (Condo)',
    'serviced_apartment': 'Serviced Apartment',
    'garden_flat': 'Garden Flat',
    'loft_apartment': 'Loft Apartment',
    'holiday_home': 'Holiday Home',
    
    // Commercial
    'shop_retail_store': 'Shop / Retail Store',
    'office_space': 'Office Space',
    'warehouse_godown': 'Warehouse / Godown',
    'hotel_motel': 'Hotel / Motel',
    'restaurant_cafe': 'Restaurant / Café',
    'shopping_mall_plaza': 'Shopping Mall / Plaza',
    'clinic_hospital': 'Clinic / Hospital',
    'coworking_space': 'Co-working Space',
    'industrial_shed_factory': 'Industrial Shed / Factory',
    'commercial_land_plot': 'Commercial Land / Plot',
    'it_park_business_center': 'IT Park / Business Center',
    'school_college': 'School / College',
    'cinema_multiplex': 'Cinema / Multiplex',
    'banquet_hall': 'Banquet Hall',
    'petrol_pump': 'Petrol Pump',
    'gymnasium_fitness_center': 'Gymnasium / Fitness Center',
    'cold_storage': 'Cold Storage',
    
    // Agricultural/Industrial
    'manufacturing_unit': 'Manufacturing Unit',
    'industrial_plot': 'Industrial Plot'
  };
  
  // Return mapped name if exists, otherwise format the property type
  return displayNameMap[propertyType] || formatPropertyTypeForDisplay(propertyType);
}
