// Land measurement units commonly used in India and their conversion factors to square feet

export interface LandUnit {
  id: string;
  label: string;
  value: string;
  icon: string;
  description: string;
  sqFeetPerUnit: number; // How many square feet in 1 unit
}

export const LAND_MEASUREMENT_UNITS: LandUnit[] = [
  {
    id: 'sqft',
    label: 'Square Feet',
    value: 'sqft',
    icon: '📐',
    description: 'Square feet (most common for small plots)',
    sqFeetPerUnit: 1
  },
  {
    id: 'acre',
    label: 'Acre',
    value: 'acre',
    icon: '🌾',
    description: 'Acre (43,560 sq ft)',
    sqFeetPerUnit: 43560
  },
  {
    id: 'hectare',
    label: 'Hectare',
    value: 'hectare',
    icon: '🏞️',
    description: 'Hectare (107,639 sq ft)',
    sqFeetPerUnit: 107639
  },
  {
    id: 'guntha',
    label: 'Guntha',
    value: 'guntha',
    icon: '📏',
    description: 'Guntha (1,089 sq ft) - Common in Maharashtra',
    sqFeetPerUnit: 1089
  },
  {
    id: 'bigha',
    label: 'Bigha',
    value: 'bigha',
    icon: '🌱',
    description: 'Bigha (27,225 sq ft) - Common in North India',
    sqFeetPerUnit: 27225
  },
  {
    id: 'katha',
    label: 'Katha/Kattha',
    value: 'katha',
    icon: '📋',
    description: 'Katha (1,361 sq ft) - Common in Bihar, West Bengal',
    sqFeetPerUnit: 1361
  },
  {
    id: 'cent',
    label: 'Cent',
    value: 'cent',
    icon: '💯',
    description: 'Cent (435.6 sq ft) - Common in South India',
    sqFeetPerUnit: 435.6
  },
  {
    id: 'ground',
    label: 'Ground',
    value: 'ground',
    icon: '🏗️',
    description: 'Ground (2,400 sq ft) - Common in South India',
    sqFeetPerUnit: 2400
  }
];

/**
 * Convert area from given unit to square feet
 */
export function convertToSquareFeet(value: number, unit: string): number {
  const unitInfo = LAND_MEASUREMENT_UNITS.find(u => u.value === unit);
  if (!unitInfo) {
    throw new Error(`Unknown unit: ${unit}`);
  }
  return value * unitInfo.sqFeetPerUnit;
}

/**
 * Convert area from square feet to given unit
 */
export function convertFromSquareFeet(sqFeetValue: number, unit: string): number {
  const unitInfo = LAND_MEASUREMENT_UNITS.find(u => u.value === unit);
  if (!unitInfo) {
    throw new Error(`Unknown unit: ${unit}`);
  }
  return sqFeetValue / unitInfo.sqFeetPerUnit;
}

/**
 * Get display text for area with unit
 */
export function getAreaDisplayText(value: number, unit: string): string {
  const unitInfo = LAND_MEASUREMENT_UNITS.find(u => u.value === unit);
  if (!unitInfo) {
    return `${value} ${unit}`;
  }
  
  // Format number nicely
  const formattedValue = value % 1 === 0 ? value.toString() : value.toFixed(2);
  return `${formattedValue} ${unitInfo.label}${value !== 1 ? 's' : ''}`;
}

/**
 * Validate area value based on unit (reasonable ranges)
 */
export function validateAreaValue(value: number, unit: string): string | null {
  if (value <= 0) {
    return 'Area must be greater than 0';
  }

  const unitInfo = LAND_MEASUREMENT_UNITS.find(u => u.value === unit);
  if (!unitInfo) {
    return 'Invalid unit';
  }

  // Set reasonable limits based on unit
  switch (unit) {
    case 'sqft':
      if (value > 10000000) return 'Area seems too large. Consider using a larger unit like acres.';
      break;
    case 'acre':
      if (value > 10000) return 'Area seems too large. Please verify.';
      break;
    case 'hectare':
      if (value > 4000) return 'Area seems too large. Please verify.';
      break;
    case 'guntha':
      if (value > 40000) return 'Area seems too large. Consider using acres.';
      break;
    case 'bigha':
      if (value > 1000) return 'Area seems too large. Please verify.';
      break;
    default:
      // Generic validation for other units
      const sqFeet = convertToSquareFeet(value, unit);
      if (sqFeet > 435600000) return 'Area seems too large. Please verify.'; // ~10,000 acres
  }

  return null;
}