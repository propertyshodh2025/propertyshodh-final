import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChatInput } from '@/components/chat/ChatInput';
import { QuickReplyButtons } from '@/components/chat/QuickReplyButtons';
import { ImageUpload } from '@/components/ui/image-upload';
import { Combobox } from '@/components/ui/combobox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { X, CheckCircle } from 'lucide-react';
import { translateAndCache } from '@/lib/translator';
import { TranslatableText } from '@/components/TranslatableText';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { LAND_MEASUREMENT_UNITS, convertToSquareFeet, getAreaDisplayText, validateAreaValue } from '@/lib/landUnits';
import { AURANGABAD_AREAS } from '@/lib/aurangabadAreas';
import { createMinimalPropertyData } from '@/lib/safePropertySubmission';

interface EnhancedConversationalUserPropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatStep {
  question: string;
  type: 'select' | 'multi-select' | 'text' | 'number' | 'images' | 'location-dropdown';
  key: string;
  options?: any[];
  required: boolean;
  validation?: (value: any) => string | null;
}

interface FormData {
  // Basic Information
  property_category: string;
  primary_category: string;
  secondary_category: string;
  agricultural_land_type: string;
  property_type: string;
  transaction_type: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  locality: string;
  pincode: string;
  
  // Property-Specific Details
  bhk?: number;
  bathrooms?: number;
  carpet_area?: number;
  built_up_area?: number;
  super_built_up_area?: number;
  plot_area?: number;
  
  // New Enhanced Fields - Residential Apartment
  floor_number?: number;
  total_floors?: number;
  lift_available?: boolean;
  society_name?: string;
  society_maintenance?: number;
  building_age?: number;
  floor_plan_type?: string;
  balconies?: number;
  view_description?: string;
  modular_kitchen?: boolean;
  wardrobes_count?: number;
  
  // New Enhanced Fields - Plot/Land
  plot_length?: number;
  plot_width?: number;
  plot_shape?: string;
  boundary_wall?: boolean;
  plot_corner?: boolean;
  development_permissions?: string[];
  zone_classification?: string;
  
  // New Enhanced Fields - Commercial
  office_type?: string;
  cabin_count?: number;
  conference_rooms?: number;
  reception_area?: boolean;
  it_infrastructure?: string[];
  building_grade?: string;
  front_footage?: number;
  display_windows?: number;
  foot_traffic_rating?: string;
  business_licenses?: string[];
  
  // Construction & Quality
  construction_materials?: string[];
  construction_grade?: string;
  structural_warranty?: string;
  bathroom_fittings?: string;
  
  // Utilities & Infrastructure
  water_connection_type?: string;
  electricity_load?: number;
  sewerage_connection?: boolean;
  broadband_ready?: boolean;
  backup_power?: string;
  
  // Legal & Documentation
  title_deed_clear?: boolean;
  approvals_obtained?: string[];
  survey_number?: string;
  khata_number?: string;
  revenue_records?: string;
  
  // Investment & Financial
  ready_to_move?: boolean;
  possession_timeline?: string;
  investment_potential?: string;
  appreciation_forecast?: string;
  
  // Agricultural (for Agricultural land)
  soil_type?: string;
  water_source?: string[];
  irrigation_type?: string;
  crop_history?: string[];
  farm_equipment_included?: boolean;
  
  // Accessibility & Connectivity
  public_transport_distance?: number;
  highway_connectivity?: string;
  airport_distance?: number;
  metro_connectivity?: string;
  
  // Security & Safety
  security_features?: string[];
  cctv_surveillance?: boolean;
  fire_safety_features?: string[];
  earthquake_resistant?: boolean;
  
  amenities?: string[];
  custom_amenity?: string;
  highlights?: string[];
  images?: string[];
  furnishing?: string;
  parking_spaces?: number;
  parking_type?: string;
  built_year?: number;
  property_age?: string;
  facing?: string;
  
  // Contact Info
  ownership_type?: string;
  full_name: string;
  contact_number: string;
  email_address: string;
  full_address?: string;
  detailed_description?: string;
  preferred_contact_time?: string[];
  language_preference?: string;
}

// Enhanced property category definitions with detailed subtypes
const PRIMARY_PROPERTY_CATEGORIES = {
  residential: {
    label: 'Residential',
    types: {
      // 🏡 Residential Properties
      plot_land: { label: 'Plot / Land', icon: '🌞️' },
      house: { label: 'House', icon: '🏠' },
      flat_apartment: { label: 'Flat / Apartment', icon: '🏢' },
      villa: { label: 'Villa', icon: '🏡' },
      row_house: { label: 'Row House', icon: '🏘️' },
      townhouse: { label: 'Townhouse', icon: '🏘️' },
      bungalow: { label: 'Bungalow', icon: '🏠' },
      penthouse: { label: 'Penthouse', icon: '🏙️' },
      studio_apartment: { label: 'Studio Apartment', icon: '🏠' },
      farmhouse: { label: 'Farmhouse', icon: '🌾' },
      condominium: { label: 'Condominium (Condo)', icon: '🏢' },
      duplex_triplex: { label: 'Duplex / Triplex', icon: '🏠' },
      mansion: { label: 'Mansion', icon: '🏰' },
      cottage: { label: 'Cottage', icon: '🏡' },
      serviced_apartment: { label: 'Serviced Apartment', icon: '🏨' },
      garden_flat: { label: 'Garden Flat', icon: '🌳' },
      loft_apartment: { label: 'Loft Apartment', icon: '🏠' },
      holiday_home: { label: 'Holiday Home', icon: '🏖️' }
    }
  },
  commercial: {
    label: 'Commercial',
    types: {
      // 🏢 Commercial Properties
      shop_retail_store: { label: 'Shop / Retail Store', icon: '🏪' },
      office_space: { label: 'Office Space', icon: '🏢' },
      showroom: { label: 'Showroom', icon: '🏬' },
      warehouse_godown: { label: 'Warehouse / Godown', icon: '🏭' },
      hotel_motel: { label: 'Hotel / Motel', icon: '🏨' },
      restaurant_cafe: { label: 'Restaurant / Café', icon: '🍽️' },
      shopping_mall_plaza: { label: 'Shopping Mall / Plaza', icon: '🛍️' },
      clinic_hospital: { label: 'Clinic / Hospital', icon: '🏥' },
      coworking_space: { label: 'Co-working Space', icon: '💼' },
      industrial_shed_factory: { label: 'Industrial Shed / Factory', icon: '🏭' },
      commercial_land_plot: { label: 'Commercial Land / Plot', icon: '🏗️' },
      it_park_business_center: { label: 'IT Park / Business Center', icon: '🏢' },
      school_college: { label: 'School / College', icon: '🏫' },
      cinema_multiplex: { label: 'Cinema / Multiplex', icon: '🎬' },
      banquet_hall: { label: 'Banquet Hall', icon: '🏛️' },
      petrol_pump: { label: 'Petrol Pump', icon: '⛽' },
      bank: { label: 'Bank', icon: '🏦' },
      gymnasium_fitness_center: { label: 'Gymnasium / Fitness Center', icon: '💪' },
      cold_storage: { label: 'Cold Storage', icon: '❄️' },
      resort: { label: 'Resort', icon: '🏖️' }
    }
  },
  land: {
    label: 'Land',
    types: {}
  }
};

// Secondary categories that appear when "Land" is selected
const LAND_SECONDARY_CATEGORIES = {
  residential: {
    label: 'Residential',
    types: {
      plot_land: { label: 'Plot / Land', icon: '🌞️' }
    }
  },
  commercial: {
    label: 'Commercial',
    types: {
      commercial_land_plot: { label: 'Commercial Land / Plot', icon: '🏧' }
    }
  },
  agricultural: {
    label: 'Agricultural',
    types: {
      farmland: { label: 'Farm Land', icon: '🌾' },
      orchard: { label: 'Orchard', icon: '🍎' },
      poultry_farm: { label: 'Poultry Farm', icon: '🐓' }
    }
  }
};

// Agricultural land types that appear when Agricultural is selected under Land
const AGRICULTURAL_LAND_TYPES = ['koradwahu', 'bagayti'];

// Using comprehensive AURANGABAD_AREAS from lib - converted to format expected by form
const AURANGABAD_LOCATIONS = AURANGABAD_AREAS.map(area => ({
  id: area.toLowerCase().replace(/[^a-z0-9]/g, '_'),
  label: area,
  value: area
}));

// Helper function to get display value for user responses
const getDisplayValue = (key: string, value: any, step: ChatStep): string => {
  if (value === null || value === undefined) return '';
  
  // For select and location-dropdown type steps, find the option with matching value and return its label
  if ((step.type === 'select' || step.type === 'location-dropdown') && step.options) {
    const option = step.options.find(opt => opt.value === value);
    if (option) {
      // Remove emoji from label for cleaner display
      return option.label.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '').trim();
    }
  }
  
  return String(value);
};

export const EnhancedConversationalUserPropertyForm = ({ isOpen, onClose }: EnhancedConversationalUserPropertyFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    property_category: '',
    primary_category: '',
    secondary_category: '',
    agricultural_land_type: '',
    property_type: '',
    transaction_type: '',
    title: '',
    description: '',
    price: 0,
    location: '',
    city: 'Aurangabad',
    locality: '',
    pincode: '',
    full_name: user?.user_metadata?.full_name || '',
    contact_number: '',
    email_address: user?.email || '',
    amenities: [],
    highlights: [],
    images: []
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [uploadAllImagesCallback, setUploadAllImagesCallback] = useState<(() => Promise<string[]>) | null>(null);
  const { language } = useLanguage();

  const draftKey = (user?.id ? `ps_user_form_draft_${user.id}` : 'ps_user_form_draft_guest');

  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.formData) setFormData(saved.formData);
        if (typeof saved.currentStep === 'number') setCurrentStep(saved.currentStep);
      }
    } catch (e) {
      console.warn('Failed to load draft form data', e);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify({ formData, currentStep }));
    } catch (e) {
      console.warn('Failed to save draft form data', e);
    }
  }, [formData, currentStep, isOpen]);

  // Generate dynamic chat steps based on property type
  const generateChatSteps = (): ChatStep[] => {
    const baseSteps: ChatStep[] = [
      {
        question: "Before we begin, are you the property owner or an agent (broker)?",
        type: 'select',
        key: 'ownership_type',
        options: [
          { id: 'owner', label: '👤 Owner', value: 'owner' },
          { id: 'agent', label: '🧑‍💼 Agent/Broker', value: 'authorized_agent' }
        ],
        required: true
      },
      {
        question: "Hi! Let's help you list your property. What type of property do you want to list?",
        type: 'select',
        key: 'primary_category',
        options: Object.entries(PRIMARY_PROPERTY_CATEGORIES).map(([key, category]) => ({
          id: key,
          label: category.label,
          value: key
        })),
        required: true
      }
    ];

    // Secondary category step - show when "Land" is selected
    if (formData.primary_category === 'land') {
      baseSteps.push({
        question: "What type of land is it?",
        type: 'select',
        key: 'secondary_category',
        options: Object.entries(LAND_SECONDARY_CATEGORIES).map(([key, category]) => ({
          id: key,
          label: category.label,
          value: key
        })),
        required: true
      });
    }
    
    // Agricultural land type step - show when "Agricultural" is selected under "Land"
    if (formData.primary_category === 'land' && formData.secondary_category === 'agricultural') {
      baseSteps.push({
        question: "What type of agricultural land is it?",
        type: 'select',
        key: 'agricultural_land_type',
        options: AGRICULTURAL_LAND_TYPES.map(type => ({
          id: type,
          label: type.charAt(0).toUpperCase() + type.slice(1),
          value: type
        })),
        required: true
      });
    }

    // Property type step - depends on effective category
    const effectiveCategory = formData.primary_category === 'land' 
      ? formData.secondary_category 
      : formData.primary_category;
      
    if (effectiveCategory) {
      let categoryTypes: Record<string, { label: string; icon: string }> = {};
      
      // Get types based on the effective category
      if (formData.primary_category === 'land' && formData.secondary_category) {
        const secondaryCategoryData = LAND_SECONDARY_CATEGORIES[formData.secondary_category as keyof typeof LAND_SECONDARY_CATEGORIES];
        categoryTypes = secondaryCategoryData?.types || {};
      } else if (PRIMARY_PROPERTY_CATEGORIES[effectiveCategory as keyof typeof PRIMARY_PROPERTY_CATEGORIES]) {
        categoryTypes = (PRIMARY_PROPERTY_CATEGORIES[effectiveCategory as keyof typeof PRIMARY_PROPERTY_CATEGORIES] as any).types || {};
      }
      
      if (Object.keys(categoryTypes).length > 0) {
        baseSteps.push({
          question: `Great! What specific type of ${effectiveCategory} property is it?`,
          type: 'select',
          key: 'property_type',
          options: Object.entries(categoryTypes).map(([key, type]) => ({
            id: key,
            label: `${type.icon} ${type.label}`,
            value: key
          })),
          required: true
        });
      }
    }

    // Transaction type
    if (formData.property_type) {
      baseSteps.push({
        question: "Are you looking to sell, rent, or lease your property?",
        type: 'select',
        key: 'transaction_type',
        options: [
          { id: 'buy', label: '💰 Sell', value: 'buy' },
          { id: 'rent', label: '🏠 Rent', value: 'rent' },
          { id: 'lease', label: '📄 Lease', value: 'lease' }
        ],
        required: true
      });
    }

    // Location details
    if (formData.transaction_type) {
      baseSteps.push(
        {
          question: "Where is your property located in Aurangabad?",
          type: 'location-dropdown',
          key: 'location',
          options: AURANGABAD_LOCATIONS,
          required: true
        },
        {
          question: "Please provide the specific locality/society name:",
          type: 'text',
          key: 'locality',
          required: true
        } as ChatStep,
        {
          question: "Please provide the complete address of your property (optional):",
          type: 'text',
          key: 'full_address',
          required: false
        } as ChatStep,
        {
          question: "What's the pincode of your property?",
          type: 'text',
          key: 'pincode',
          required: true,
          validation: (value: string) => /^\d{6}$/.test(value) ? null : "Please enter a valid 6-digit pincode"
        } as ChatStep
      );
    }

    // Property-specific questions based on type
    if (formData.property_type) {
      baseSteps.push(...getPropertySpecificSteps());
    }

    // Price
    if (shouldShowPriceStep()) {
      baseSteps.push({
        question: getPropertyPriceQuestion(),
        type: 'number',
        key: 'price',
        required: true,
        validation: (value: number) => value > 0 ? null : "Please enter a valid price"
      } as ChatStep);
    }

    // Description after price
    if (formData.price > 0) {
      baseSteps.push({
        question: "Please provide a detailed description of your property (optional). What makes it special?",
        type: 'text',
        key: 'detailed_description',
        required: false
      } as ChatStep);
    }

    // Features and amenities
    if (formData.price > 0) {
      baseSteps.push(...getAmenitiesSteps());
    }

    // Legal and documentation
    if (formData.amenities && formData.amenities.length >= 0) {
      baseSteps.push(...getLegalDocumentationSteps());
    }

    // Images
    if (shouldShowImagesStep()) {
      baseSteps.push({
        question: "Please upload some high-quality photos of your property:",
        type: 'images',
        key: 'images',
        required: true
      } as ChatStep);
    }

    // Contact details
    if (formData.images && formData.images.length > 0) {
      baseSteps.push(...getContactSteps());
    }

    return baseSteps;
  };

  const getPropertySpecificSteps = (): ChatStep[] => {
    const steps: ChatStep[] = [];
    
    if (formData.property_type === 'apartment') {
      steps.push(
        {
          question: "How many BHK is your apartment?",
          type: 'select' as const,
          key: 'bhk',
          options: [
            { id: '1', label: '1 BHK', value: 1 },
            { id: '2', label: '2 BHK', value: 2 },
            { id: '3', label: '3 BHK', value: 3 },
            { id: '4', label: '4 BHK', value: 4 },
            { id: '5', label: '5+ BHK', value: 5 }
          ],
          required: true
        },
        {
          question: "Which floor is your apartment on?",
          type: 'number' as const,
          key: 'floor_number',
          required: true
        },
        {
          question: "How many total floors are there in the building?",
          type: 'number' as const,
          key: 'total_floors',
          required: true
        },
        {
          question: "Is there a lift/elevator in the building?",
          type: 'select' as const,
          key: 'lift_available',
          options: [
            { id: 'yes', label: '✅ Yes', value: true },
            { id: 'no', label: '❌ No', value: false }
          ],
          required: true
        },
        {
          question: "What's the carpet area of your apartment? (in sq ft)",
          type: 'number' as const,
          key: 'carpet_area',
          required: true
        },
        {
          question: "What's the name of your society/building?",
          type: 'text' as const,
          key: 'society_name',
          required: true
        },
        {
          question: "What's the monthly maintenance charge?",
          type: 'number' as const,
          key: 'society_maintenance',
          required: false
        },
        {
          question: "How many balconies does the apartment have?",
          type: 'select' as const,
          key: 'balconies',
          options: [
            { id: '0', label: 'No balcony', value: 0 },
            { id: '1', label: '1 balcony', value: 1 },
            { id: '2', label: '2 balconies', value: 2 },
            { id: '3', label: '3+ balconies', value: 3 }
          ],
          required: true
        },
        {
          question: "Does it have a modular kitchen?",
          type: 'select' as const,
          key: 'modular_kitchen',
          options: [
            { id: 'yes', label: '✅ Yes', value: true },
            { id: 'no', label: '❌ No', value: false }
          ],
          required: true
        }
      );
    }

    if (formData.property_type === 'house') {
      steps.push(
        {
          question: "How many BHK is your house?",
          type: 'select',
          key: 'bhk',
          options: [
            { id: '2', label: '2 BHK', value: 2 },
            { id: '3', label: '3 BHK', value: 3 },
            { id: '4', label: '4 BHK', value: 4 },
            { id: '5', label: '5+ BHK', value: 5 }
          ],
          required: true
        },
        {
          question: "What's the plot area? (in sq ft)",
          type: 'number',
          key: 'plot_area',
          required: true
        },
        {
          question: "What's the built-up area? (in sq ft)",
          type: 'number',
          key: 'built_up_area',
          required: true
        },
        {
          question: "How many floors does your house have?",
          type: 'select',
          key: 'total_floors',
          options: [
            { id: '1', label: 'Ground floor only', value: 1 },
            { id: '2', label: 'Ground + 1st floor', value: 2 },
            { id: '3', label: 'Ground + 2 floors', value: 3 },
            { id: '4', label: '3+ floors', value: 4 }
          ],
          required: true
        },
        {
          question: "Is there a boundary wall around the property?",
          type: 'select',
          key: 'boundary_wall',
          options: [
            { id: 'yes', label: '✅ Yes', value: true },
            { id: 'no', label: '❌ No', value: false }
          ],
          required: true
        }
      );
    }

    if (formData.property_type === 'plot') {
      steps.push(
        {
          question: "What's the total area of the plot? (in sq ft)",
          type: 'number',
          key: 'plot_area',
          required: true
        },
        {
          question: "What are the plot dimensions? Length (in feet)",
          type: 'number',
          key: 'plot_length',
          required: true
        },
        {
          question: "What's the width of the plot? (in feet)",
          type: 'number',
          key: 'plot_width',
          required: true
        },
        {
          question: "Is it a corner plot?",
          type: 'select',
          key: 'plot_corner',
          options: [
            { id: 'yes', label: '✅ Yes, corner plot', value: true },
            { id: 'no', label: '❌ No, internal plot', value: false }
          ],
          required: true
        },
        {
          question: "What's the road width facing your plot?",
          type: 'select',
          key: 'highway_connectivity',
          options: [
            { id: '10ft', label: '10 feet', value: '10 feet' },
            { id: '15ft', label: '15 feet', value: '15 feet' },
            { id: '20ft', label: '20 feet', value: '20 feet' },
            { id: '30ft', label: '30 feet', value: '30 feet' },
            { id: '40ft', label: '40+ feet', value: '40+ feet' }
          ],
          required: true
        }
      );
    }

    if (formData.property_type === 'office') {
      steps.push(
        {
          question: "What's the carpet area of the office? (in sq ft)",
          type: 'number',
          key: 'carpet_area',
          required: true
        },
        {
          question: "How many cabins/rooms are there?",
          type: 'number',
          key: 'cabin_count',
          required: true
        },
        {
          question: "Is there a reception area?",
          type: 'select',
          key: 'reception_area',
          options: [
            { id: 'yes', label: '✅ Yes', value: true },
            { id: 'no', label: '❌ No', value: false }
          ],
          required: true
        },
        {
          question: "Which floor is the office on?",
          type: 'number',
          key: 'floor_number',
          required: true
        },
        {
          question: "Is there a lift/elevator?",
          type: 'select',
          key: 'lift_available',
          options: [
            { id: 'yes', label: '✅ Yes', value: true },
            { id: 'no', label: '❌ No', value: false }
          ],
          required: true
        }
      );
    }

    if (formData.property_type === 'shop') {
      steps.push(
        {
          question: "What's the carpet area of the shop? (in sq ft)",
          type: 'number',
          key: 'carpet_area',
          required: true
        },
        {
          question: "What's the front footage of the shop? (in feet)",
          type: 'number',
          key: 'front_footage',
          required: true
        },
        {
          question: "How many display windows are there?",
          type: 'number',
          key: 'display_windows',
          required: true
        },
        {
          question: "How would you rate the foot traffic in this area?",
          type: 'select',
          key: 'foot_traffic_rating',
          options: [
            { id: 'high', label: '🚶‍♂️🚶‍♀️🚶 High', value: 'high' },
            { id: 'medium', label: '🚶‍♂️🚶‍♀️ Medium', value: 'medium' },
            { id: 'low', label: '🚶‍♂️ Low', value: 'low' }
          ],
          required: true
        }
      );
    }

    // Common details for all property types
    const commonDetails: ChatStep[] = [
      {
        question: "What's the age of your property?",
        type: 'select' as const,
        key: 'property_age',
        options: [
          { id: 'new', label: '🆕 Under Construction', value: 'Under Construction' },
          { id: '1-2', label: '🏠 1-2 Years', value: '1-2 Years' },
          { id: '3-5', label: '🏡 3-5 Years', value: '3-5 Years' },
          { id: '6-10', label: '🏘️ 6-10 Years', value: '6-10 Years' },
          { id: '10+', label: '🏚️ 10+ Years', value: '10+ Years' }
        ],
        required: true
      },
      {
        question: "In which year was your property built? (Optional - for exact year)",
        type: 'number' as const,
        key: 'built_year',
        required: false,
        validation: (value: number) => !value || (value >= 1950 && value <= new Date().getFullYear()) ? null : "Please enter a valid year"
      },
      {
        question: "How many bathrooms does your property have?",
        type: 'number' as const,
        key: 'bathrooms',
        required: true,
        validation: (value: number) => value > 0 ? null : "Please enter a valid number of bathrooms"
      },
      {
        question: "What type of parking is available?",
        type: 'select' as const,
        key: 'parking_type',
        options: [
          { id: 'covered', label: '🏠 Covered Parking', value: 'Covered Parking' },
          { id: 'open', label: '🚗 Open Parking', value: 'Open Parking' },
          { id: 'stilt', label: '🏢 Stilt Parking', value: 'Stilt Parking' },
          { id: 'none', label: '❌ No Parking', value: 'No Parking' }
        ],
        required: true
      },
      {
        question: "How many parking spaces are available?",
        type: 'number' as const,
        key: 'parking_spaces',
        required: true,
        validation: (value: number) => value >= 0 ? null : "Please enter a valid number of parking spaces"
      }
    ];

    if (formData.property_type !== 'plot' && formData.property_type !== 'commercial_plot' && formData.property_category !== 'agricultural') {
      commonDetails.push({
        question: "What's the furnishing status of your property?",
        type: 'select' as const,
        key: 'furnishing',
        options: [
          { id: 'fully', label: '🛋️ Fully Furnished', value: 'Fully Furnished' },
          { id: 'semi', label: '🪑 Semi Furnished', value: 'Semi Furnished' },
          { id: 'unfurnished', label: '🏠 Unfurnished', value: 'Unfurnished' }
        ],
        required: true
      });
    }

    commonDetails.push({
      question: "Which direction does your property face?",
      type: 'select' as const,
      key: 'facing',
      options: [
        { id: 'north', label: '🧭 North', value: 'North' },
        { id: 'south', label: '🧭 South', value: 'South' },
        { id: 'east', label: '🧭 East', value: 'East' },
        { id: 'west', label: '🧭 West', value: 'West' },
        { id: 'northeast', label: '🧭 North-East', value: 'North-East' },
        { id: 'northwest', label: '🧭 North-West', value: 'North-West' },
        { id: 'southeast', label: '🧭 South-East', value: 'South-East' },
        { id: 'southwest', label: '🧭 South-West', value: 'South-West' }
      ],
      required: true
    });

    steps.push(...commonDetails);

    return steps;
  };

  const getAmenitiesSteps = (): ChatStep[] => {
    const amenitiesOptions = formData.property_type === 'apartment' ? [
      { id: 'gym', label: '🏋️ Gym', value: 'gym' },
      { id: 'swimming_pool', label: '🏊 Swimming Pool', value: 'swimming_pool' },
      { id: 'playground', label: '🎯 Playground', value: 'playground' },
      { id: 'clubhouse', label: '🏛️ Clubhouse', value: 'clubhouse' },
      { id: 'security', label: '🛡️ 24x7 Security', value: 'security' },
      { id: 'parking', label: '🚗 Covered Parking', value: 'parking' },
      { id: 'power_backup', label: '⚡ Power Backup', value: 'power_backup' },
      { id: 'water_supply', label: '💧 24x7 Water', value: 'water_supply' },
      { id: 'other', label: '➕ Other (Custom)', value: 'other' }
    ] : formData.property_type === 'house' ? [
      { id: 'garden', label: '🌳 Garden', value: 'garden' },
      { id: 'garage', label: '🚗 Garage', value: 'garage' },
      { id: 'security', label: '🛡️ Security', value: 'security' },
      { id: 'bore_well', label: '💧 Bore Well', value: 'bore_well' },
      { id: 'servant_room', label: '🏠 Servant Room', value: 'servant_room' },
      { id: 'terrace', label: '🏔️ Terrace', value: 'terrace' },
      { id: 'other', label: '➕ Other (Custom)', value: 'other' }
    ] : [
      { id: 'parking', label: '🚗 Parking', value: 'parking' },
      { id: 'security', label: '🛡️ Security', value: 'security' },
      { id: 'power_backup', label: '⚡ Power Backup', value: 'power_backup' },
      { id: 'elevator', label: '🛗 Elevator', value: 'elevator' },
      { id: 'other', label: '➕ Other (Custom)', value: 'other' }
    ];

    const steps: ChatStep[] = [
      {
        question: "What amenities/features does your property have? (Select all that apply)",
        type: 'multi-select' as const,
        key: 'amenities',
        options: amenitiesOptions,
        required: false
      }
    ];

    // Add custom amenity input step if 'other' is selected
    if (formData.amenities && formData.amenities.includes('other')) {
      steps.push({
        question: "Please specify the custom amenity/feature:",
        type: 'text' as const,
        key: 'custom_amenity',
        required: true,
        validation: (value: string) => {
          if (!value || value.trim().length < 3) {
            return "Please enter a valid amenity name (at least 3 characters)";
          }
          return null;
        }
      } as ChatStep);
    }

    return steps;
  };

  const getLegalDocumentationSteps = (): ChatStep[] => [
    {
      question: "Is the title of the property clear and marketable?",
      type: 'select' as const,
      key: 'title_deed_clear',
      options: [
        { id: 'yes', label: '✅ Yes, clear title', value: true },
        { id: 'no', label: '❌ No, issues present', value: false }
      ],
      required: true
    },
    {
      question: "Is the property ready to move in?",
      type: 'select' as const,
      key: 'ready_to_move',
      options: [
        { id: 'yes', label: '✅ Yes, ready to move', value: true },
        { id: 'no', label: '🚧 Under construction', value: false }
      ],
      required: true
    }
  ];

  const getContactSteps = (): ChatStep[] => [
    {
      question: "What's your full name?",
      type: 'text' as const,
      key: 'full_name',
      required: true
    },
    {
      question: "What's your contact number?",
      type: 'text' as const,
      key: 'contact_number',
      required: true,
      validation: (value: string) => /^[6-9]\d{9}$/.test(value) ? null : "Please enter a valid 10-digit mobile number"
    },
    {
      question: "When is the best time to contact you?",
      type: 'multi-select' as const,
      key: 'preferred_contact_time',
      options: [
        { id: 'morning', label: '🌅 Morning (9 AM - 12 PM)', value: 'morning' },
        { id: 'afternoon', label: '☀️ Afternoon (12 PM - 4 PM)', value: 'afternoon' },
        { id: 'evening', label: '🌆 Evening (4 PM - 8 PM)', value: 'evening' },
        { id: 'night', label: '🌙 Night (8 PM - 10 PM)', value: 'night' }
      ],
      required: false
    }
  ];

  const shouldShowPriceStep = () => {
    return formData.locality && formData.pincode;
  };

  const shouldShowImagesStep = () => {
    return formData.price > 0;
  };

  const getPropertyPriceQuestion = () => {
    if (formData.transaction_type === 'buy') {
      return "What's your expected selling price? (in ₹)";
    } else if (formData.transaction_type === 'rent') {
      return "What's your expected monthly rent? (in ₹)";
    } else {
      return "What's your expected lease amount? (in ₹)";
    }
  };

  const chatSteps = generateChatSteps();

  // Pre-warm translations for all chat questions in Marathi
  useEffect(() => {
    if (!isOpen || language !== 'marathi') return;
    const tasks = chatSteps.map((s, idx) =>
      translateAndCache(s.question, { target_lang: 'mr', context: `form:user-enh:question:${s.key || idx}` })
    );
    Promise.allSettled(tasks);
  }, [isOpen, language, chatSteps.length]);

  const simulateTyping = (delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), delay);
  };

  const handleStepAnswer = (key: string, value: any) => {
    console.log('Processing answer for step:', key, 'value:', value, 'currentStep:', currentStep);
    
    setFormData(prev => {
      let updated = { ...prev, [key]: value };
      
      // Handle custom amenity input
      if (key === 'custom_amenity' && value) {
        // Add the custom amenity to the amenities array and remove 'other'
        const currentAmenities = (prev.amenities || []).filter(a => a !== 'other');
        updated = {
          ...updated,
          amenities: [...currentAmenities, value.trim()]
        };
      }
      
      console.log('Updated form data:', updated);
      return updated;
    });
    
    setTimeout(() => {
      console.log('Step progression check - current:', currentStep, 'total steps:', chatSteps.length);
      if (currentStep < chatSteps.length - 1) {
        const nextStep = currentStep + 1;
        console.log('Moving to next step:', nextStep);
        setCurrentStep(nextStep);
        simulateTyping();
      } else {
        console.log('Reached end of chat, submitting form');
        handleSubmit();
      }
    }, 500);
  };

  const handleMultiSelectAnswer = (key: string, values: any[]) => {
    setFormData(prev => ({ ...prev, [key]: values }));
    
    setTimeout(() => {
      if (currentStep < chatSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
        simulateTyping();
      } else {
        handleSubmit();
      }
    }, 500);
  };

  const handleUploadAllImagesCallback = (urls: string[]) => {
    setFormData(prev => ({ ...prev, images: urls }));
    
    setTimeout(() => {
      if (currentStep < chatSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
        simulateTyping();
      } else {
        handleSubmit();
      }
    }, 500);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to list your property.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first if they exist
      let uploadedImageUrls: string[] = [];
      if (uploadAllImagesCallback) {
        uploadedImageUrls = await uploadAllImagesCallback();
      }

      // Map the new category structure back to the database format
      let finalPropertyCategory = formData.primary_category?.toLowerCase() || '';
      if (formData.primary_category?.toLowerCase() === 'land' && formData.secondary_category) {
        finalPropertyCategory = formData.secondary_category.toLowerCase();
      }
      
      // Generate title if not provided
      const generatedTitle = formData.title || `${formData.bhk || ''} BHK ${formData.property_type} in ${formData.location}`;
      
      // Prepare form data with generated values
      const formDataWithDefaults = {
        ...formData,
        title: generatedTitle,
        description: formData.detailed_description || formData.description || `Beautiful ${formData.property_type} for ${formData.transaction_type}`,
        property_category: finalPropertyCategory,
        images: uploadedImageUrls,
        listing_status: 'active',
        approval_status: 'pending',
        verification_status: 'unverified',
        language_preference: formData.language_preference || 'english',
        user_id: user.id,
        submitted_by_user: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Create safe property data that only includes existing database columns
      const propertyData = createMinimalPropertyData(formDataWithDefaults);

      const { data: inserted, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select('id, title, description')
        .single();

      if (error) throw error;

      // One-time translation + cache for free-text fields
      const propId = inserted?.id as string;
      const tasks: Promise<any>[] = [];
      if (inserted?.title) {
        tasks.push(
          translateAndCache(inserted.title, { context: `property:${propId}:title`, source_lang: 'en', target_lang: 'mr' })
        );
      }
      if (inserted?.description) {
        tasks.push(
          translateAndCache(inserted.description, { context: `property:${propId}:description`, source_lang: 'en', target_lang: 'mr' })
        );
      }
      await Promise.allSettled(tasks);

      toast({
        title: "Property listed successfully!",
        description: "Your property has been submitted for review and translations have been prepared.",
      });

      try { sessionStorage.removeItem(draftKey); } catch {}
      onClose();
    } catch (error) {
      console.error('Error submitting property:', error);
      toast({
        title: "Error",
        description: "Failed to submit property. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const getCurrentStep = () => {
    if (currentStep >= chatSteps.length) return null;
    return chatSteps[currentStep];
  };

  const renderStepContent = (step: any) => {
    switch (step.type) {
      case 'select':
        return (
          <div className="space-y-4">
            <QuickReplyButtons
              options={step.options}
              onSelect={(option) => handleStepAnswer(step.key, option.value)}
              columns={2}
            />
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                size="sm"
                className="mt-4"
              >
                Previous
              </Button>
            )}
          </div>
        );

      case 'multi-select':
        return (
          <div className="space-y-3">
            <QuickReplyButtons
              options={step.options}
              onSelect={(option) => {
                const currentValues = formData[step.key as keyof FormData] as any[] || [];
                const newValues = currentValues.includes(option.value)
                  ? currentValues.filter(v => v !== option.value)
                  : [...currentValues, option.value];
                setFormData(prev => ({ ...prev, [step.key]: newValues }));
              }}
              selectedValue={formData[step.key as keyof FormData]}
              columns={2}
            />
            <div className="flex justify-between items-center pt-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  size="sm"
                >
                  Previous
                </Button>
              )}
              <Button 
                onClick={() => handleMultiSelectAnswer(step.key, formData[step.key as keyof FormData] as any[] || [])}
                className="ml-auto"
                size="sm"
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 'text':
      case 'number':
        return (
          <div className="space-y-4">
            <ChatInput
              type={step.type === 'number' ? 'number' : 'text'}
              placeholder={`Enter ${step.key.replace('_', ' ')}${!step.required ? ' (optional)' : ''}`}
              onSubmit={(value) => {
                const processedValue = step.type === 'number' ? Number(value) : value;
                if (step.validation) {
                  const error = step.validation(processedValue);
                  if (error) {
                    toast({
                      title: "Invalid input",
                      description: error,
                      variant: "destructive"
                    });
                    return;
                  }
                }
                handleStepAnswer(step.key, processedValue);
              }}
            />
            <div className="flex justify-between items-center">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  size="sm"
                >
                  Previous
                </Button>
              )}
              {!step.required && (
                <Button
                  variant="ghost"
                  onClick={() => handleStepAnswer(step.key, '')}
                  size="sm"
                  className="ml-auto text-muted-foreground hover:text-foreground"
                >
                  Skip
                </Button>
              )}
            </div>
          </div>
        );

      case 'images':
        return (
          <div className="space-y-4">
            <ImageUpload
              value={formData.images || []}
              onChange={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
              uploadMode="deferred"
              onUploadAllImages={(uploadFn) => {
                // Just store the upload function, don't auto-trigger
                setUploadAllImagesCallback(() => uploadFn);
              }}
            />
            <div className="flex justify-between items-center pt-4">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  size="sm"
                >
                  Previous
                </Button>
              )}
              <Button
                onClick={() => {
                  handleStepAnswer('images', formData.images || []);
                }}
                className="ml-auto"
                size="sm"
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 'location-dropdown':
        return (
          <div className="space-y-4">
            <Combobox
              options={step.options || []}
              value={formData[step.key as keyof FormData] as string || ''}
              onValueChange={(value) => {
                handleStepAnswer(step.key, value);
              }}
              placeholder="Search and select a location..."
              emptyMessage="No location found."
              className="w-full"
            />
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                size="sm"
                className="mt-4"
              >
                Previous
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentStep, isTyping]);

  const progress = ((currentStep + 1) / chatSteps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>List Your Property</DialogTitle>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {chatSteps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <div className="h-96 overflow-y-auto bg-gradient-to-b from-background to-muted/10 rounded-lg p-4 space-y-4">
            {chatSteps.slice(0, currentStep + 1).map((step, index) => (
              <div key={index} className="space-y-3">
                {/* Bot Message */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                    🤖
                  </div>
                  <div className="flex-1 bg-muted rounded-2xl rounded-tl-sm p-3 shadow-sm">
                    <p className="text-sm">
                      <TranslatableText text={step.question} context={`form:user-enh:question:${step.key || index}`} />
                    </p>
                  </div>
                </div>
                
                {/* User Response */}
                {index < currentStep && (formData[step.key as keyof FormData] || formData.hasOwnProperty(step.key)) && (
                  <div className="flex items-start space-x-3 justify-end">
                    <div className="flex-1 max-w-xs bg-primary rounded-2xl rounded-tr-sm p-3 shadow-sm">
                      <p className="text-sm text-primary-foreground">
                        {formData[step.key as keyof FormData] ? (
                          Array.isArray(formData[step.key as keyof FormData]) 
                            ? (formData[step.key as keyof FormData] as any[]).join(', ')
                            : getDisplayValue(step.key, formData[step.key as keyof FormData], step)
                        ) : (
                          !step.required ? 'Skipped' : ''
                        )}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-medium">
                      👤
                    </div>
                  </div>
                )}
                
                {/* Current Step Input */}
                {index === currentStep && !isTyping && (
                  <div className="ml-11">
                    {renderStepContent(step)}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">Typing...</span>
                </div>
              </div>
            )}

            {isSubmitting && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-800">Submitting your property...</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};