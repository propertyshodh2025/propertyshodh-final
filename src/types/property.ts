
export interface Property {
  id: number;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  type: 'Apartment' | 'Villa' | 'Bungalow' | 'Land' | 'Commercial';
  status: 'Available' | 'Sold' | 'Rented';
  furnishing: 'Fully Furnished' | 'Semi Furnished' | 'Unfurnished';
  images: string[];
  description: string;
  highlights: string[];
  amenities: Array<{name: string, icon: string}>;
  specifications: Array<{label: string, value: string}>;
  coordinates: {lat: number, lng: number};
  agentContact: {
    name: string;
    phone: string;
    whatsapp: string;
  };
}

export interface QuestionOption {
  id: string;
  label: string;
  icon: string;
}

export interface QuestionFlowState {
  purpose: string | null;
  propertyType: string | null;
  budgetRange: string | null;
  location: string | null;
  bedrooms: string | null;
  bathrooms: string | null;
  name: string | null;
  phone: string | null;
  countryCode?: string;
  currentStep: number;
  isComplete: boolean;
}
