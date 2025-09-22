import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Home } from 'lucide-react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { QuickReplyButtons } from '@/components/chat/QuickReplyButtons';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ChatProgress } from '@/components/chat/ChatProgress';
import { ImageUpload } from '@/components/ui/image-upload';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GoogleSignInDialog } from '@/components/auth/GoogleSignInDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslatableText } from '@/components/TranslatableText';
import { LanguageToggle } from '@/components/LanguageToggle';
import { translateAndCache } from '@/lib/translator';
import { AURANGABAD_AREAS } from '@/lib/aurangabadAreas';
interface ConversationalUserPropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatStep {
  id: string;
  question: string;
  type: 'select' | 'input' | 'textarea' | 'images' | 'complete';
  options?: { id: string; label: string; value: any; description?: string }[];
  validation?: (value: any) => string | null;
  inputType?: 'text' | 'number' | 'email' | 'tel';
  placeholder?: string;
  followUp?: string;
}

interface FormData {
  property_category: string | null;
  property_type: string | null;
  transaction_type: string | null;
  bhk_bedrooms: string | null;
  bathrooms: string | null;
  balconies: string | null;
  carpet_area: string | null;
  built_up_area: string | null;
  super_built_up_area: string | null;
  plot_area: string | null;
  price: string | null;
  location: string | null;
  amenities: string[];
  listing_status: string | null;
  agent_name: string | null;
  agent_phone: string | null;
  google_map_link: string | null;
  images: string[];
  furnishing: string | null;
  parking_type: string | null;
  property_age: string | null;
  full_name: string | null;
  email_address: string | null;
  additional_notes: string | null;
  title: string | null;
  description: string | null;
  full_address: string | null;
  detailed_description: string | null;
  custom_amenity: string | null;
  // Security and infrastructure features
  cctv_surveillance: boolean | null;
  earthquake_resistant: boolean | null;
  sewerage_connection: boolean | null;
  broadband_ready: boolean | null;
}

const PROPERTY_CATEGORIES = {
  residential: {
    label: 'Residential / निवासी',
    types: [
      // 🏡 Residential Properties
      { id: 'plot_land', label: 'Plot / Land', value: 'Plot / Land' },
      { id: 'house', label: 'House', value: 'House' },
      { id: 'flat_apartment', label: 'Flat / Apartment', value: 'Flat / Apartment' },
      { id: 'villa', label: 'Villa', value: 'Villa' },
      { id: 'row_house', label: 'Row House', value: 'Row House' },
      { id: 'townhouse', label: 'Townhouse', value: 'Townhouse' },
      { id: 'bungalow', label: 'Bungalow', value: 'Bungalow' },
      { id: 'penthouse', label: 'Penthouse', value: 'Penthouse' },
      { id: 'studio_apartment', label: 'Studio Apartment', value: 'Studio Apartment' },
      { id: 'farmhouse', label: 'Farmhouse', value: 'Farmhouse' },
      { id: 'condominium', label: 'Condominium (Condo)', value: 'Condominium (Condo)' },
      { id: 'duplex_triplex', label: 'Duplex / Triplex', value: 'Duplex / Triplex' },
      { id: 'mansion', label: 'Mansion', value: 'Mansion' },
      { id: 'cottage', label: 'Cottage', value: 'Cottage' },
      { id: 'serviced_apartment', label: 'Serviced Apartment', value: 'Serviced Apartment' },
      { id: 'garden_flat', label: 'Garden Flat', value: 'Garden Flat' },
      { id: 'loft_apartment', label: 'Loft Apartment', value: 'Loft Apartment' },
      { id: 'holiday_home', label: 'Holiday Home', value: 'Holiday Home' }
    ]
  },
  commercial: {
    label: 'Commercial / व्यावसायिक',
    types: [
      // 🏢 Commercial Properties
      { id: 'shop_retail_store', label: 'Shop / Retail Store', value: 'Shop / Retail Store' },
      { id: 'office_space', label: 'Office Space', value: 'Office Space' },
      { id: 'showroom', label: 'Showroom', value: 'Showroom' },
      { id: 'warehouse_godown', label: 'Warehouse / Godown', value: 'Warehouse / Godown' },
      { id: 'hotel_motel', label: 'Hotel / Motel', value: 'Hotel / Motel' },
      { id: 'restaurant_cafe', label: 'Restaurant / Café', value: 'Restaurant / Café' },
      { id: 'shopping_mall_plaza', label: 'Shopping Mall / Plaza', value: 'Shopping Mall / Plaza' },
      { id: 'clinic_hospital', label: 'Clinic / Hospital', value: 'Clinic / Hospital' },
      { id: 'coworking_space', label: 'Co-working Space', value: 'Co-working Space' },
      { id: 'industrial_shed_factory', label: 'Industrial Shed / Factory', value: 'Industrial Shed / Factory' },
      { id: 'commercial_land_plot', label: 'Commercial Land / Plot', value: 'Commercial Land / Plot' },
      { id: 'it_park_business_center', label: 'IT Park / Business Center', value: 'IT Park / Business Center' },
      { id: 'school_college', label: 'School / College', value: 'School / College' },
      { id: 'cinema_multiplex', label: 'Cinema / Multiplex', value: 'Cinema / Multiplex' },
      { id: 'banquet_hall', label: 'Banquet Hall', value: 'Banquet Hall' },
      { id: 'petrol_pump', label: 'Petrol Pump', value: 'Petrol Pump' },
      { id: 'bank', label: 'Bank', value: 'Bank' },
      { id: 'gymnasium_fitness_center', label: 'Gymnasium / Fitness Center', value: 'Gymnasium / Fitness Center' },
      { id: 'cold_storage', label: 'Cold Storage', value: 'Cold Storage' },
      { id: 'resort', label: 'Resort', value: 'Resort' }
    ]
  },
  agricultural: {
    label: 'Agricultural / कृषी',
    types: [
      { id: 'farmland', label: 'Farmland', value: 'Farmland' },
      { id: 'orchard', label: 'Orchard', value: 'Orchard' },
      { id: 'plantation', label: 'Plantation', value: 'Plantation' }
    ]
  }
};


const AMENITIES_LIST = [
  'Lift', 'Swimming Pool', 'Gym', 'Garden', 'Security', 'Power Backup',
  'Water Supply', 'Parking', 'Club House', 'Playground', 'Internet/Wi-Fi',
  'Air Conditioning', 'Fire Safety', 'CCTV Surveillance', 'Sewerage Connection',
  'Broadband Ready', 'Earthquake Resistant', 'Other (Custom)'
];

export const ConversationalUserPropertyForm = ({ isOpen, onClose }: ConversationalUserPropertyFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadAllImages, setUploadAllImages] = useState<(() => Promise<string[]>) | null>(null);
  const [formData, setFormData] = useState<FormData>({
    property_category: null,
    property_type: null,
    transaction_type: null,
    bhk_bedrooms: null,
    bathrooms: null,
    balconies: null,
    carpet_area: null,
    built_up_area: null,
    super_built_up_area: null,
    plot_area: null,
    price: null,
    location: null,
    amenities: [],
    listing_status: 'active',
    agent_name: null,
    agent_phone: null,
    google_map_link: null,
    images: [],
    furnishing: null,
    parking_type: null,
    property_age: null,
    full_name: null,
    email_address: null,
    additional_notes: null,
    title: null,
    description: null,
    full_address: null,
    detailed_description: null,
    custom_amenity: null,
    // Security and infrastructure features
    cctv_surveillance: null,
    earthquake_resistant: null,
    sewerage_connection: null,
    broadband_ready: null,
  });
  const [showSignIn, setShowSignIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  const chatSteps: ChatStep[] = [
    {
      id: 'property_category',
      question: user?.user_metadata?.full_name 
        ? `Hi ${user.user_metadata.full_name}! 👋 I'm PropertyShodh Bot, and I'm here to help you list your property. What type of property are you listing?`
        : "Hi there! 👋 I'm PropertyShodh Bot, and I'm here to help you list your property. What type of property are you listing?",
      type: 'select',
      options: [
        { id: 'residential', label: 'Residential', value: 'residential', description: 'Homes, apartments, plots' },
        { id: 'commercial', label: 'Commercial', value: 'commercial', description: 'Offices, shops, warehouses' },
        { id: 'agricultural', label: 'Agricultural', value: 'agricultural', description: 'Farmland, orchards' }
      ]
    },
    {
      id: 'property_type',
      question: "Excellent choice! Now, what specific type of property is it?",
      type: 'select',
      options: [] // Will be populated based on category
    },
    {
      id: 'transaction_type',
      question: "Are you looking to sell, rent, or lease your property?",
      type: 'select',
      options: [
        { id: 'buy', label: 'For Sale', value: 'buy', description: 'Sell your property' },
        { id: 'rent', label: 'For Rent', value: 'rent', description: 'Rent out monthly' },
        { id: 'lease', label: 'For Lease', value: 'lease', description: 'Long-term lease' }
      ]
    },
    // Conditional step: Only show for residential properties that aren't plots/land
    ...(formData.property_category === 'residential' && formData.property_type !== 'Plot/Land' ? [{
      id: 'bhk_bedrooms',
      question: "How many bedrooms does your property have?",
      type: 'select',
      options: [
        { id: '1bhk', label: '1 BHK', value: '1', description: '1 bedroom apartment' },
        { id: '2bhk', label: '2 BHK', value: '2', description: '2 bedroom apartment' },
        { id: '3bhk', label: '3 BHK', value: '3', description: '3 bedroom apartment' },
        { id: '4bhk', label: '4 BHK', value: '4', description: '4 bedroom apartment' },
        { id: '5plus', label: '5+ BHK', value: '5', description: '5 or more bedrooms' }
      ]
    },
    {
      id: 'bathrooms',
      question: "How many bathrooms does your property have?",
      type: 'select',
      options: [
        { id: '1', label: '1 Bathroom', value: '1' },
        { id: '2', label: '2 Bathrooms', value: '2' },
        { id: '3', label: '3 Bathrooms', value: '3' },
        { id: '4', label: '4 Bathrooms', value: '4' },
        { id: '5plus', label: '5+ Bathrooms', value: '5' }
      ]
    }] as ChatStep[] : []),
    // Add balconies question for residential properties
    ...(formData.property_category === 'residential' && formData.property_type !== 'Plot/Land' ? [{
      id: 'balconies',
      question: "How many balconies does your property have?",
      type: 'select',
      options: [
        { id: '0', label: 'No Balcony', value: '0' },
        { id: '1', label: '1 Balcony', value: '1' },
        { id: '2', label: '2 Balconies', value: '2' },
        { id: '3', label: '3 Balconies', value: '3' },
        { id: '4plus', label: '4+ Balconies', value: '4' }
      ]
    }] as ChatStep[] : []),
    // Area questions based on property type
    ...(formData.property_category === 'residential' && formData.property_type !== 'Plot/Land' ? [{
      id: 'carpet_area',
      question: "What is the carpet area of your property? (in sq ft)",
      type: 'input',
      inputType: 'number',
      placeholder: 'e.g., 1200',
      validation: (value: string) => {
        const num = parseFloat(value);
        return num > 0 ? null : 'Please enter a valid area';
      }
    },
    {
      id: 'built_up_area',
      question: "What is the built-up area of your property? (in sq ft)",
      type: 'input',
      inputType: 'number',
      placeholder: 'e.g., 1400',
      validation: (value: string) => {
        const num = parseFloat(value);
        return num > 0 ? null : 'Please enter a valid area';
      }
    },
    {
      id: 'super_built_up_area',
      question: "What is the super built-up area of your property? (in sq ft)",
      type: 'input',
      inputType: 'number',
      placeholder: 'e.g., 1600',
      validation: (value: string) => {
        const num = parseFloat(value);
        return num > 0 ? null : 'Please enter a valid area';
      }
    }] as ChatStep[] : []),
    // Plot area for land/plots
    ...(formData.property_type === 'Plot/Land' || formData.property_category === 'agricultural' ? [{
      id: 'plot_area',
      question: "What is the plot area? (in sq ft)",
      type: 'input',
      inputType: 'number',
      placeholder: 'e.g., 2400',
      validation: (value: string) => {
        const num = parseFloat(value);
        return num > 0 ? null : 'Please enter a valid area';
      }
    }] as ChatStep[] : []),
    // Built-up area for commercial properties
    ...(formData.property_category === 'commercial' ? [{
      id: 'built_up_area',
      question: "What is the built-up area of your commercial property? (in sq ft)",
      type: 'input',
      inputType: 'number',
      placeholder: 'e.g., 2000',
      validation: (value: string) => {
        const num = parseFloat(value);
        return num > 0 ? null : 'Please enter a valid area';
      }
    }] as ChatStep[] : []),
    {
      id: 'location',
      question: "Where is your property located in Aurangabad?",
      type: 'select',
      options: AURANGABAD_AREAS.map(area => ({ id: area.toLowerCase().replace(/\s+/g, '-'), label: area, value: area }))
    },
    {
      id: 'full_address',
      question: "Please provide the complete address of your property:",
      type: 'textarea',
      placeholder: 'e.g., Flat 301, ABC Apartments, Near XYZ Mall, Main Road, Locality Name, Aurangabad - 431001',
      validation: (value) => {
        if (!value || value.trim().length < 15) {
          return 'Please enter a complete address (at least 15 characters)';
        }
        return null;
      }
    },
    {
      id: 'price',
      question: "What's your asking price? (Enter amount in ₹)",
      type: 'input',
      inputType: 'number',
      placeholder: 'Enter price in rupees',
      validation: (value) => value <= 0 ? 'Please enter a valid price' : null
    },
    {
      id: 'detailed_description',
      question: "Please provide a detailed description of your property. What makes it special?",
      type: 'textarea',
      placeholder: 'e.g., This beautiful property features spacious rooms, modern amenities, great location...',
      validation: (value) => {
        if (!value || value.trim().length < 25) {
          return 'Please provide a detailed description (at least 25 characters)';
        }
        return null;
      }
    },
    // Only show furnishing for non-plot properties
    ...(formData.property_type !== 'Plot/Land' && formData.property_category !== 'agricultural' ? [{
      id: 'furnishing',
      question: "How is your property furnished?",
      type: 'select',
      options: [
        { id: 'furnished', label: 'Fully Furnished', value: 'Furnished', description: 'Ready to move in' },
        { id: 'semi', label: 'Semi-Furnished', value: 'Semi-Furnished', description: 'Partially furnished' },
        { id: 'unfurnished', label: 'Unfurnished', value: 'Unfurnished', description: 'No furniture' }
      ]
    }] as ChatStep[] : []),
    {
      id: 'parking_type',
      question: "What parking facilities are available?",
      type: 'select',
      options: [
        { id: 'car', label: 'Car Parking', value: 'Car Parking' },
        { id: 'bike', label: 'Bike Parking', value: 'Bike Parking' },
        { id: 'both', label: 'Both Car & Bike', value: 'Both Car & Bike' },
        { id: 'none', label: 'No Parking', value: 'No Parking' }
      ]
    },
    {
      id: 'property_age',
      question: "How old is your property?",
      type: 'select',
      options: [
        { id: 'new', label: 'New Construction', value: 'New Construction' },
        { id: '1-5', label: '1-5 Years', value: '1-5 Years' },
        { id: '5-10', label: '5-10 Years', value: '5-10 Years' },
        { id: '10+', label: '10+ Years', value: '10+ Years' }
      ]
    },
    {
      id: 'title',
      question: "Give your property listing a catchy title that buyers will love!",
      type: 'input',
      inputType: 'text',
      placeholder: 'e.g., Beautiful 2BHK Apartment in Cidco',
      validation: (value) => value.length < 10 ? 'Please enter a descriptive title (at least 10 characters)' : null
    },
    {
      id: 'description',
      question: "Tell potential buyers about your property. What makes it special?",
      type: 'textarea',
      placeholder: 'Describe your property, its features, nearby amenities, etc.',
      validation: (value) => value.length < 50 ? 'Please provide a detailed description (at least 50 characters)' : null
    },
    {
      id: 'amenities',
      question: "What amenities does your property offer? Select all that apply:",
      type: 'select',
      options: AMENITIES_LIST.map(amenity => ({ id: amenity.toLowerCase(), label: amenity, value: amenity }))
    },
    // Custom amenity input step - only show if "Other (Custom)" is selected
    ...(formData.amenities?.includes('Other (Custom)') ? [{
      id: 'custom_amenity',
      question: "Please specify your custom amenity:",
      type: 'input',
      inputType: 'text',
      placeholder: 'e.g., Rooftop Garden, Wine Cellar, etc.',
      validation: (value: string) => {
        if (!value || value.trim().length === 0) {
          return 'Please enter a valid amenity name';
        }
        if (value.trim().length < 2) {
          return 'Amenity name must be at least 2 characters long';
        }
        return null;
      }
    }] as ChatStep[] : []),
    // Security and infrastructure questions for non-plot properties
    ...(formData.property_type !== 'Plot/Land' && formData.property_category !== 'agricultural' ? [
      {
        id: 'cctv_surveillance',
        question: "Does your property have CCTV surveillance?",
        type: 'select',
        options: [
          { id: 'yes', label: '✅ Yes', value: true, description: 'CCTV cameras installed' },
          { id: 'no', label: '❌ No', value: false, description: 'No CCTV surveillance' }
        ]
      },
      {
        id: 'sewerage_connection',
        question: "Does your property have proper sewerage connection?",
        type: 'select',
        options: [
          { id: 'yes', label: '✅ Yes', value: true, description: 'Connected to main sewer line' },
          { id: 'no', label: '❌ No', value: false, description: 'No sewerage connection' }
        ]
      },
      {
        id: 'broadband_ready',
        question: "Is your property broadband/internet ready?",
        type: 'select',
        options: [
          { id: 'yes', label: '✅ Yes', value: true, description: 'Broadband infrastructure available' },
          { id: 'no', label: '❌ No', value: false, description: 'No broadband infrastructure' }
        ]
      },
      {
        id: 'earthquake_resistant',
        question: "Is your property earthquake resistant?",
        type: 'select',
        options: [
          { id: 'yes', label: '✅ Yes', value: true, description: 'Built with earthquake resistant features' },
          { id: 'no', label: '❌ No', value: false, description: 'No earthquake resistant features' }
        ]
      }
    ] as ChatStep[] : []),
    {
      id: 'images',
      question: "Great! Now let's add some attractive photos of your property. Good photos get 3x more inquiries!",
      type: 'images'
    },
    {
      id: 'google_map_link',
      question: "Do you have a Google Maps link for your property? (Optional - helps buyers find you)",
      type: 'input',
      inputType: 'text',
      placeholder: 'Paste Google Maps link (optional)',
      validation: () => null // Optional field
    },
    {
      id: 'additional_notes',
      question: "Any additional details you'd like to share about your property? (Optional)",
      type: 'textarea',
      placeholder: 'Any other important information...',
      validation: () => null // Optional field
    },
    {
      id: 'complete',
      question: "🎉 Fantastic! Your property listing is ready to go live. I'll submit it for approval now!",
      type: 'complete'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Restore form data and progress from localStorage when dialog opens
  useEffect(() => {
    if (isOpen) {
      const savedData = localStorage.getItem('propertyFormData');
      const savedStep = localStorage.getItem('propertyFormStep');
      
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData(parsedData);
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
      
      if (savedStep) {
        try {
          const step = parseInt(savedStep);
          if (step >= 0 && step < chatSteps.length) {
            setCurrentStep(step);
          }
        } catch (error) {
          console.error('Error parsing saved step:', error);
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [currentStep, isTyping]);

  // Pre-warm translations for all questions when Marathi is selected
  useEffect(() => {
    if (!isOpen || language !== 'marathi') return;
    const tasks = chatSteps.map(step => translateAndCache(step.question, { target_lang: 'mr', context: `form:user:question:${step.id}` }));
    Promise.allSettled(tasks);
  }, [isOpen, language, chatSteps.length]);

  // Keep sign-in prompt behavior
  useEffect(() => {
    if (!user && currentStep > 5) {
      toast({
        title: "Please Sign In",
        description: "Please sign in to continue with your property listing.",
      });
      setShowSignIn(true);
    }
  }, [user, currentStep]);

  const simulateTyping = (callback: () => void, delay = 1500) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleStepAnswer = (value: any) => {
    const step = chatSteps[currentStep];
    
    // Handle custom amenity input
    if (step.id === 'custom_amenity' && value) {
      const currentAmenities = formData.amenities || [];
      // Remove "Other (Custom)" and add the custom amenity
      const updatedAmenities = currentAmenities
        .filter(amenity => amenity !== 'Other (Custom)')
        .concat(value.trim());
      
      const newFormData = {
        ...formData,
        amenities: updatedAmenities,
        custom_amenity: value.trim()
      };
      setFormData(newFormData);
      localStorage.setItem('propertyFormData', JSON.stringify(newFormData));
    } else {
      // Update form data
      const newFormData = {
        ...formData,
        [step.id]: value
      };
      setFormData(newFormData);
      
      // Save to localStorage
      localStorage.setItem('propertyFormData', JSON.stringify(newFormData));
    }

    // Show typing indicator and move to next step
    simulateTyping(() => {
      if (currentStep < chatSteps.length - 1) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        localStorage.setItem('propertyFormStep', nextStep.toString());
      }
    });
  };

  const handleMultiSelectAnswer = (value: string) => {
    const currentAmenities = formData.amenities || [];
    const isSelected = currentAmenities.includes(value);
    
    const updatedAmenities = isSelected
      ? currentAmenities.filter(a => a !== value)
      : [...currentAmenities, value];
    
    const newFormData = {
      ...formData,
      amenities: updatedAmenities
    };
    setFormData(newFormData);
    
    // Save to localStorage
    localStorage.setItem('propertyFormData', JSON.stringify(newFormData));
  };

  const handleImagesUpdate = (images: string[]) => {
    // For deferred upload mode, we don't store URLs in formData
    // Images will be uploaded during form submission
    const newFormData = {
      ...formData,
      images: []  // Keep empty until actual submission
    };
    setFormData(newFormData);
    
    // Save to localStorage
    localStorage.setItem('propertyFormData', JSON.stringify(newFormData));
  };

  const handleUploadAllImagesCallback = (uploadFn: () => Promise<string[]>) => {
    setUploadAllImages(() => uploadFn);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Please Sign In",
        description: "You need to sign in to submit your property listing.",
        variant: "destructive"
      });
      setShowSignIn(true);
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Form data before submission:', formData);
      
      // First, upload all images
      let imageUrls: string[] = [];
      if (uploadAllImages) {
        toast({
          title: "Uploading images...",
          description: "Please wait while we upload your property images."
        });
        
        try {
          imageUrls = await uploadAllImages();
          console.log('Images uploaded successfully:', imageUrls);
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          throw new Error('Failed to upload images. Please try again.');
        }
      }
      
      const propertyData = {
        title: formData.title || `${formData.property_type} in ${formData.location}`,
        description: formData.description || `Beautiful ${formData.property_type} for ${formData.transaction_type}`,
        property_type: formData.property_type,
        bhk: formData.bhk_bedrooms ? parseInt(formData.bhk_bedrooms) : null,
        price: parseFloat(formData.price || '0'),
        location: formData.location,
        city: 'Aurangabad',
        carpet_area: formData.carpet_area ? parseFloat(formData.carpet_area) : null,
        built_up_area: formData.built_up_area ? parseFloat(formData.built_up_area) : null,
        super_built_up_area: formData.super_built_up_area ? parseFloat(formData.super_built_up_area) : null,
        plot_area: formData.plot_area ? parseFloat(formData.plot_area) : null,
        amenities: formData.amenities,
        listing_status: formData.listing_status,
        agent_name: user?.user_metadata?.full_name || user?.email || '',
        agent_phone: user?.user_metadata?.phone || user?.user_metadata?.phone_number || '',
        google_map_link: formData.google_map_link,
        images: imageUrls,
        furnishing: formData.furnishing,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        balconies: formData.balconies ? parseInt(formData.balconies) : null,
        parking_type: formData.parking_type,
        property_age: formData.property_age,
        transaction_type: formData.transaction_type,
        property_category: formData.property_category,
        additional_notes: formData.additional_notes,
        full_address: formData.full_address,
        description: formData.detailed_description || formData.description || `Beautiful ${formData.property_type} for ${formData.transaction_type}`,
        approval_status: 'pending',
        email_address: user?.email || '',
        full_name: user?.user_metadata?.full_name || user?.email || '',
        user_id: user?.id,
        submitted_by_user: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Security and infrastructure features
        cctv_surveillance: formData.cctv_surveillance,
        earthquake_resistant: formData.earthquake_resistant,
        sewerage_connection: formData.sewerage_connection,
        broadband_ready: formData.broadband_ready,
      };

      console.log('Property data being submitted:', propertyData);

      const { error } = await supabase
        .from('properties')
        .insert([propertyData]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Success! 🎉",
        description: "Your property has been submitted for approval. You'll be notified once it's approved!"
      });

      // Clear saved form data and step progress on successful submission
      localStorage.removeItem('propertyFormData');
      localStorage.removeItem('propertyFormStep');
      
      // Reset form state
      setCurrentStep(0);
      setFormData({
        property_category: null,
        property_type: null,
        transaction_type: null,
        bhk_bedrooms: null,
        bathrooms: null,
        balconies: null,
        carpet_area: null,
        built_up_area: null,
        super_built_up_area: null,
        plot_area: null,
        price: null,
        location: null,
        amenities: [],
        listing_status: 'active',
        agent_name: null,
        agent_phone: null,
        google_map_link: null,
        images: [],
        furnishing: null,
        parking_type: null,
        property_age: null,
        full_name: null,
        email_address: null,
        additional_notes: null,
        title: null,
        description: null,
        custom_amenity: null,
        // Security and infrastructure features
        cctv_surveillance: null,
        earthquake_resistant: null,
        sewerage_connection: null,
        broadband_ready: null,
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting property:', error);
      toast({
        title: "Error",
        description: `Failed to submit property: ${error instanceof Error ? error.message : 'Please try again.'}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentStep = () => {
    const step = chatSteps[currentStep];
    
    // Handle property type options based on category
    if (step.id === 'property_type' && formData.property_category) {
      const categoryTypes = PROPERTY_CATEGORIES[formData.property_category as keyof typeof PROPERTY_CATEGORIES]?.types || [];
      step.options = categoryTypes;
    }
    
    return step;
  };

  const renderStepContent = (step: ChatStep) => {
    switch (step.type) {
      case 'select':
        if (step.id === 'amenities') {
          return (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {(step.options || []).map((option) => (
                  <Button
                    key={option.id}
                    variant={formData.amenities?.includes(option.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleMultiSelectAnswer(option.value)}
                    className="justify-start text-left h-auto p-3 hover:scale-105 transition-all"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        {typeof option.label === 'string' ? <TranslatableText text={option.label} /> : option.label}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
              {formData.amenities && formData.amenities.length > 0 && (
                <div className="mt-4">
                  <Button 
                    onClick={() => handleStepAnswer(formData.amenities)}
                    className="w-full"
                  >
                    Continue with {formData.amenities.length} amenities selected
                  </Button>
                </div>
              )}
            </div>
          );
        }
        if (step.id === 'location') {
          return (
            <div className="space-y-4">
              <Select onValueChange={handleStepAnswer}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose your area in Aurangabad" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {AURANGABAD_AREAS.map(area => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
        return (
          <QuickReplyButtons
            options={step.options || []}
            onSelect={(option) => handleStepAnswer(option.value)}
            columns={step.id === 'property_category' ? 1 : 2}
          />
        );
      
      case 'input':
      case 'textarea':
        return (
          <ChatInput
            placeholder={step.placeholder || ''}
            onSubmit={handleStepAnswer}
            multiline={step.type === 'textarea'}
            type={step.inputType}
            validation={step.validation}
          />
        );
      
      case 'images':
        return (
          <div className="space-y-4">
            <ImageUpload
              value={[]}
              onChange={handleImagesUpdate}
              maxImages={8}
              uploadMode="deferred"
              onUploadAllImages={handleUploadAllImagesCallback}
            />
            <Button 
              onClick={() => handleStepAnswer('images_ready')}
              className="w-full"
            >
              Continue with Photos
            </Button>
          </div>
        );
      
      case 'complete':
        return (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4 text-sm space-y-2">
              <h4 className="font-semibold">Property Summary:</h4>
              <p><strong>Title:</strong> {formData.title}</p>
              <p><strong>Type:</strong> {formData.property_type}</p>
              <p><strong>Category:</strong> {formData.property_category}</p>
              <p><strong>Location:</strong> {formData.location}</p>
              <p><strong>Price:</strong> ₹{formData.price ? parseFloat(formData.price).toLocaleString() : '0'}</p>
              {formData.bhk_bedrooms && <p><strong>Size:</strong> {formData.bhk_bedrooms} BHK</p>}
              {formData.carpet_area && <p><strong>Carpet Area:</strong> {formData.carpet_area} sq ft</p>}
              {formData.built_up_area && <p><strong>Built-up Area:</strong> {formData.built_up_area} sq ft</p>}
              {formData.super_built_up_area && <p><strong>Super Built-up Area:</strong> {formData.super_built_up_area} sq ft</p>}
              {formData.plot_area && <p><strong>Plot Area:</strong> {formData.plot_area} sq ft</p>}
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Property Listing 🚀'}
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  const allMessages = chatSteps.slice(0, currentStep + 1).map((step, index) => ({
    ...step,
    isBot: true,
    timestamp: new Date(),
    step: getCurrentStep(),
    // Add user response if this step has been answered
    userResponse: index < currentStep && formData[step.id as keyof FormData] !== null 
      ? formData[step.id as keyof FormData] 
      : null
  }));

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md h-[80vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between p-4 border-b shrink-0">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">List Your Property</h2>
                <p className="text-sm text-muted-foreground">Quick & Easy Setup</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="px-4 py-2 shrink-0">
            <ChatProgress 
              currentStep={currentStep + 1} 
              totalSteps={chatSteps.length}
              stepTitles={chatSteps.map(step => step.question.slice(0, 30) + '...')}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40">
              {allMessages.map((message, index) => (
                <div key={index}>
                  <ChatMessage
                    message={<TranslatableText text={message.question} context={`form:user:question:${message.id}`} />}
                    isBot={true}
                    timestamp={message.timestamp}
                  />
                  {message.userResponse && (
                    <ChatMessage
                      message={Array.isArray(message.userResponse) 
                        ? message.userResponse.join(', ') 
                        : String(message.userResponse)}
                      isBot={false}
                      timestamp={message.timestamp}
                    />
                  )}
                </div>
              ))}
              
              {isTyping && <TypingIndicator />}
              
              {!isTyping && currentStep < chatSteps.length && (
                <div className="space-y-4">
                  {renderStepContent(getCurrentStep())}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
        </DialogContent>
      </Dialog>

      {showSignIn && (
        <GoogleSignInDialog 
          open={showSignIn} 
          onOpenChange={(open) => setShowSignIn(open)}
        />
      )}
    </>
  );
};