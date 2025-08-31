import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Settings } from 'lucide-react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { QuickReplyButtons } from '@/components/chat/QuickReplyButtons';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ChatProgress } from '@/components/chat/ChatProgress';
import { ImageUpload } from '@/components/ui/image-upload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Property } from '@/types/database';
import { translateAndCache } from '@/lib/translator';
import { TranslatableText } from '@/components/TranslatableText';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { AURANGABAD_AREAS } from '@/lib/aurangabadAreas';

interface ConversationalAdminPropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
  onSave: () => void;
}

interface AdminFormData {
  title?: string;
  property_category?: string;
  property_type?: string;
  transaction_type?: string;
  location?: string;
  locality?: string;
  pincode?: string;
  city?: string;
  price?: number;
  bhk?: number;
  carpet_area?: number;
  built_up_area?: number;
  plot_area?: number;
  bathrooms?: number;
  balconies?: number;
  parking?: string;
  furnishing?: string;
  property_age?: string;
  description?: string;
  amenities?: string[];
  custom_amenity?: string;
  images?: string[];
  google_map_link?: string;
  additional_details?: string;
  agent_name?: string;
  agent_phone?: string;
  approval_status?: string;
  listing_status?: string;
  is_featured?: boolean;
  highlights?: string[];
  ownership_type?: string;
  // legal & readiness
  title_deed_clear?: boolean;
  ready_to_move?: boolean;
  // contact (map to agent fields on save)
  full_name?: string;
  contact_number?: string;
  // extras
  floor_number?: number;
  total_floors?: number;
  lift_available?: boolean;
  // Security and infrastructure features
  cctv_surveillance?: boolean;
  earthquake_resistant?: boolean;
  sewerage_connection?: boolean;
  broadband_ready?: boolean;
}


const PROPERTY_CATEGORIES = {
  residential: {
    label: 'Residential',
    types: {
      apartment: { label: 'Apartment/Flat', icon: '🏢' },
      house: { label: 'Independent House/Villa', icon: '🏠' },
      plot: { label: 'Residential Plot', icon: '🏞️' },
      farmhouse: { label: 'Farm House', icon: '🌾' }
    }
  },
  commercial: {
    label: 'Commercial',
    types: {
      office: { label: 'Office Space', icon: '🏢' },
      shop: { label: 'Shop/Showroom', icon: '🏪' },
      warehouse: { label: 'Warehouse/Godown', icon: '🏭' },
      commercial_plot: { label: 'Commercial Plot', icon: '🏗️' }
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
} as const;



const AMENITIES_LIST = [
  'Lift', 'Swimming Pool', 'Gym', 'Garden', 'Security', 'Power Backup',
  'Water Supply', 'Parking', 'Club House', 'Playground', 'Internet/Wi-Fi',
  'Air Conditioning', 'Fire Safety', 'CCTV Surveillance', 'Sewerage Connection',
  'Broadband Ready', 'Earthquake Resistant', 'Other (Custom)'
];

export const ConversationalAdminPropertyForm = ({ 
  isOpen, 
  onClose, 
  property, 
  onSave 
}: ConversationalAdminPropertyFormProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadAllImages, setUploadAllImages] = useState<(() => Promise<string[]>) | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminFormData>>({
    amenities: [],
    images: [],
    highlights: [],
    // Initialize new fields
    balconies: 0,
    cctv_surveillance: false,
    earthquake_resistant: false,
    sewerage_connection: false,
    broadband_ready: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  const getPropertyPriceQuestion = () => {
    if (formData.transaction_type === 'buy') return "What's your expected selling price? (in ₹)";
    if (formData.transaction_type === 'rent') return "What's your expected monthly rent? (in ₹)";
    return "What's your expected lease amount? (in ₹)";
  };

  const generateChatSteps = (currentFormData = formData) => {
    const steps: any[] = [
      {
        id: 'ownership_type',
        question: 'Before we begin, are you the property owner or an agent (broker)?',
        type: 'select' as const,
        options: [
          { id: 'owner', label: '👤 Owner', value: 'owner' },
          { id: 'agent', label: '🧑‍💼 Agent/Broker', value: 'authorized_agent' }
        ]
      },
      {
        id: 'property_category',
        question: "Hi! Let's help you list your property. What type of property do you want to list?",
        type: 'select' as const,
        options: Object.entries(PROPERTY_CATEGORIES).map(([key, category]) => ({
          id: key,
          label: category.label,
          value: key
        }))
      }
    ];

    if (currentFormData.property_category) {
      const categoryKey = currentFormData.property_category as keyof typeof PROPERTY_CATEGORIES;
      const types = PROPERTY_CATEGORIES[categoryKey].types as Record<string, { label: string; icon: string }>;
      steps.push({
        id: 'property_type',
        question: `Great! What specific type of ${PROPERTY_CATEGORIES[categoryKey].label.toLowerCase()} property is it?`,
        type: 'select' as const,
        options: Object.entries(types).map(([key, type]) => ({ id: key, label: `${type.icon} ${type.label}`, value: key }))
      });
    }

    if (currentFormData.property_type) {
      steps.push({
        id: 'transaction_type',
        question: 'Are you looking to sell, rent, or lease your property?',
        type: 'select' as const,
        options: [
          { id: 'buy', label: '💰 Sell', value: 'buy' },
          { id: 'rent', label: '🏠 Rent', value: 'rent' },
          { id: 'lease', label: '📄 Lease', value: 'lease' }
        ]
      });
    }

    if (currentFormData.transaction_type) {
      steps.push(
        {
          id: 'location',
          question: 'Where is your property located in Aurangabad?',
          type: 'select' as const,
          options: AURANGABAD_AREAS.map(area => ({ id: area.toLowerCase().replace(/\s+/g, '-'), label: area, value: area }))
        },
        {
          id: 'locality',
          question: 'Please provide the specific locality/society name:',
          type: 'input' as const,
          inputType: 'text' as const,
          placeholder: 'e.g., XYZ Society'
        },
        {
          id: 'pincode',
          question: "What's the pincode of your property?",
          type: 'input' as const,
          inputType: 'text' as const,
          placeholder: '6-digit pincode',
          validation: (value: string) => /^\d{6}$/.test(value) ? null : 'Please enter a valid 6-digit pincode'
        }
      );
    }

    if (currentFormData.property_type) {
      const pt = currentFormData.property_type;
      if (pt === 'apartment' || pt === 'house') {
        steps.push(
          {
            id: 'bhk',
            question: `How many BHK is your ${pt === 'apartment' ? 'apartment' : 'house'}?`,
            type: 'select' as const,
            options: [1,2,3,4,5].map(n => ({ id: String(n), label: `${n} BHK`, value: n }))
          },
          {
            id: 'bathrooms',
            question: "How many bathrooms does your property have?",
            type: 'select' as const,
            options: [1,2,3,4,5].map(n => ({ id: String(n), label: `${n} Bathroom${n > 1 ? 's' : ''}`, value: n }))
          },
          {
            id: 'balconies',
            question: "How many balconies does your property have?",
            type: 'select' as const,
            options: [
              { id: '0', label: 'No Balcony', value: 0 },
              { id: '1', label: '1 Balcony', value: 1 },
              { id: '2', label: '2 Balconies', value: 2 },
              { id: '3', label: '3+ Balconies', value: 3 }
            ]
          },
          {
            id: 'carpet_area',
            question: "What's the carpet area? (in sq ft)",
            type: 'input' as const,
            inputType: 'number' as const
          }
        );
      } else if (pt === 'plot' || pt === 'commercial_plot' || pt === 'farm' || pt === 'farmhouse' || pt === 'land' || pt === 'agricultural_land') {
        steps.push({ 
          id: 'plot_area', 
          question: `What's the total area of the ${pt === 'farm' || pt === 'farmhouse' || pt === 'agricultural_land' ? 'farm/land' : 'plot'}? (in sq ft)`, 
          type: 'input' as const, 
          inputType: 'number' as const 
        });
      } else if (pt === 'office' || pt === 'shop') {
        steps.push(
          { id: 'carpet_area', question: "What's the carpet area? (in sq ft)", type: 'input' as const, inputType: 'number' as const },
          { id: 'floor_number', question: 'Which floor is it on?', type: 'input' as const, inputType: 'number' as const },
          { id: 'lift_available', question: 'Is there a lift/elevator?', type: 'select' as const, options: [ {id:'yes', label:'✅ Yes', value: true}, {id:'no', label:'❌ No', value:false} ] }
        );
      } else {
        // Fallback for any other property type - ask for general area
        steps.push({ 
          id: 'plot_area', 
          question: "What's the total area of your property? (in sq ft)", 
          type: 'input' as const, 
          inputType: 'number' as const 
        });
      }
    }

    // Ensure price question always appears after area/bhk is provided
    if ((currentFormData.carpet_area && Number(currentFormData.carpet_area) > 0) || 
        (currentFormData.plot_area && Number(currentFormData.plot_area) > 0) || 
        currentFormData.bhk || 
        currentFormData.property_type) {
      steps.push({ id: 'price', question: getPropertyPriceQuestion(), type: 'input' as const, inputType: 'number' as const });
    }

    if (currentFormData.price && Number(currentFormData.price) > 0) {
      steps.push({
        id: 'amenities',
        question: 'What amenities/features does your property have? (Select all that apply)',
        type: 'select' as const,
        options: AMENITIES_LIST.map(a => ({ id: a.toLowerCase(), label: a, value: a }))
      });
      
      // Add custom amenity input step if 'Other (Custom)' is selected
      if (currentFormData.amenities && currentFormData.amenities.includes('Other (Custom)')) {
        steps.push({
          id: 'custom_amenity',
          question: 'Please specify the custom amenity/feature:',
          type: 'input' as const,
          inputType: 'text' as const,
          placeholder: 'Enter custom amenity name',
          validation: (value: string) => {
            if (!value || value.trim().length < 3) {
              return 'Please enter a valid amenity name (at least 3 characters)';
            }
            return null;
          }
        });
      }

      steps.push(
        {
          id: 'title_deed_clear',
          question: 'Is the title of the property clear and marketable?',
          type: 'select' as const,
          options: [ {id:'yes', label:'✅ Yes', value:true}, {id:'no', label:'❌ No', value:false} ]
        },
        {
          id: 'ready_to_move',
          question: 'Is the property ready to move in?',
          type: 'select' as const,
          options: [ {id:'yes', label:'✅ Yes', value:true}, {id:'no', label:'🚧 Under construction', value:false} ]
        }
      );

      // Security and infrastructure questions for non-plot properties
      if (currentFormData.property_type !== 'plot' && currentFormData.property_category !== 'agricultural') {
        steps.push(
          {
            id: 'cctv_surveillance',
            question: 'Does your property have CCTV surveillance?',
            type: 'select' as const,
            options: [ {id:'yes', label:'✅ Yes', value:true}, {id:'no', label:'❌ No', value:false} ]
          },
          {
            id: 'sewerage_connection',
            question: 'Does your property have proper sewerage connection?',
            type: 'select' as const,
            options: [ {id:'yes', label:'✅ Yes', value:true}, {id:'no', label:'❌ No', value:false} ]
          },
          {
            id: 'broadband_ready',
            question: 'Is your property broadband/internet ready?',
            type: 'select' as const,
            options: [ {id:'yes', label:'✅ Yes', value:true}, {id:'no', label:'❌ No', value:false} ]
          },
          {
            id: 'earthquake_resistant',
            question: 'Is your property earthquake resistant?',
            type: 'select' as const,
            options: [ {id:'yes', label:'✅ Yes', value:true}, {id:'no', label:'❌ No', value:false} ]
          }
        );
      }

      steps.push({ id: 'images', question: 'Please upload some high-quality photos of your property:', type: 'images' as const });

      steps.push({ id: 'complete', question: 'Perfect! Ready to save this property listing?', type: 'complete' as const });
    }

    return steps;
  };

  // Keep chatSteps stable during conversation to prevent regeneration on every answer
  const [chatSteps, setChatSteps] = useState(() => generateChatSteps());

  useEffect(() => {
    if (!isOpen || language !== 'marathi') return;
    const tasks = chatSteps.map((step: any) =>
      translateAndCache(step.question, { target_lang: 'mr', context: `form:admin:question:${step.id}` })
    );
    Promise.allSettled(tasks);
  }, [isOpen, language, chatSteps]);

  // Initialize form data with existing property data and reset current step
  useEffect(() => {
    if (isOpen) {
      if (property) {
        const initialFormData = {
          title: property.title || '',
          property_category: property.property_category || '',
          property_type: property.property_type || '',
          transaction_type: property.transaction_type || '',
          location: property.location || '',
          price: property.price || 0,
          bhk: property.bhk || 1,
          carpet_area: property.carpet_area || 0,
          bathrooms: property.bathrooms || 1,
          parking: property.parking_type || '',
          furnishing: property.furnishing || '',
          property_age: property.property_age || '',
          description: property.description || '',
          amenities: property.amenities || [],
          images: property.images || [],
          google_map_link: property.google_map_link || '',
          additional_details: property.additional_notes || '',
          agent_name: property.agent_name || '',
          agent_phone: property.agent_phone || '',
          approval_status: property.approval_status || 'pending',
          listing_status: property.listing_status || 'active',
          is_featured: false, // Will be handled separately if needed
          highlights: property.highlights || []
        };
        setFormData(initialFormData);
        // Generate steps based on existing property data
        setChatSteps(generateChatSteps(initialFormData));
        setCurrentStep(0);
      } else {
        // Reset form and step when creating new property
        const initialFormData = {
          amenities: [],
          images: [],
          highlights: []
        };
        setFormData(initialFormData);
        setChatSteps(generateChatSteps(initialFormData));
        setCurrentStep(0);
      }
    }
  }, [property, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentStep, isTyping]);

  const simulateTyping = (callback: () => void, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleStepAnswer = (value: any) => {
    const step = chatSteps[currentStep];
    if (!step) {
      console.log('No step found for current step:', currentStep);
      return;
    }
    
    console.log('Processing answer for step:', step.id, 'value:', value, 'currentStep:', currentStep);
    
    let updatedFormData = {
      ...formData,
      [step.id]: value
    };
    
    // Handle custom amenity input
    if (step.id === 'custom_amenity' && value) {
      // Add the custom amenity to the amenities array and remove 'Other (Custom)'
      const currentAmenities = (formData.amenities || []).filter(a => a !== 'Other (Custom)');
      updatedFormData = {
        ...updatedFormData,
        amenities: [...currentAmenities, value.trim()]
      };
    }
    
    setFormData(updatedFormData);
    console.log('Updated form data:', updatedFormData);

    simulateTyping(() => {
      // Check if this step might trigger new questions (regenerate chatSteps)
      const shouldRegenerateSteps = ['property_category', 'property_type', 'transaction_type', 'carpet_area', 'plot_area', 'bhk', 'price', 'amenities'].includes(step.id);
      
      console.log('Should regenerate steps:', shouldRegenerateSteps, 'for step:', step.id);
      
      if (shouldRegenerateSteps) {
        // Generate new steps with the updated form data
        const newSteps = generateChatSteps(updatedFormData);
        console.log('Generated new steps:', newSteps.length, 'previous steps:', chatSteps.length);
        setChatSteps(newSteps);
        
        // Move to next step if it exists in new flow
        if (currentStep < newSteps.length - 1) {
          console.log('Moving to next step in regenerated flow:', currentStep + 1);
          setCurrentStep(prev => prev + 1);
        }
      } else {
        // Normal step progression - ensure we actually progress
        const nextStep = currentStep + 1;
        console.log('Normal progression from step', currentStep, 'to step', nextStep, 'total steps:', chatSteps.length);
        console.log('Current step details:', step.id, 'Next step exists:', nextStep < chatSteps.length);
        
        // Force progression for critical steps like pincode that might get stuck
        if (step.id === 'pincode' || step.id === 'location' || step.id === 'locality') {
          console.log('FORCING progression for critical step:', step.id);
          setCurrentStep(nextStep);
        } else if (nextStep < chatSteps.length) {
          console.log('Moving to next step:', nextStep);
          setCurrentStep(nextStep);
        } else {
          console.log('Already at last step or beyond, total steps:', chatSteps.length);
        }
      }
    });
  };

  const handlePrevious = () => {
    setIsTyping(false);
    setCurrentStep(prev => Math.max(0, prev - 1));
    setTimeout(() => {
      scrollToBottom();
    }, 50);
  };

  const handleMultiSelectAnswer = (value: string) => {
    const currentAmenities = formData.amenities || [];
    const isSelected = currentAmenities.includes(value);
    
    const updatedAmenities = isSelected
      ? currentAmenities.filter(a => a !== value)
      : [...currentAmenities, value];
    
    setFormData(prev => ({
      ...prev,
      amenities: updatedAmenities
    }));
  };

  const handleImagesUpdate = (images: string[]) => {
    // For deferred upload mode, we don't store URLs in formData
    // Images will be uploaded during form submission
    setFormData(prev => ({
      ...prev,
      images: []  // Keep empty until actual submission
    }));
  };

  const handleUploadAllImagesCallback = (uploadFn: () => Promise<string[]>) => {
    setUploadAllImages(() => uploadFn);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // First, upload all images
      let imageUrls: string[] = [];
      if (uploadAllImages) {
        toast({
          title: "Uploading images...",
          description: "Please wait while we upload the property images."
        });
        
        try {
          imageUrls = await uploadAllImages();
          console.log('Images uploaded successfully:', imageUrls);
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          throw new Error('Failed to upload images. Please try again.');
        }
      }

      // Generate title/description similar to user flow
      const generatedTitle = (formData.title && formData.title.trim()) || `${formData.bhk || ''} BHK ${formData.property_type || ''} in ${formData.location || ''}`.replace(/\s+/g, ' ').trim();
      const generatedDescription = (formData.description && formData.description.trim()) || `Beautiful ${formData.property_type || 'property'} for ${formData.transaction_type || 'sale/rent'}`;

      const propertyData = {
        title: generatedTitle,
        description: generatedDescription,
        property_type: formData.property_type || '',
        bhk: formData.bhk || 1,
        price: formData.price || 0,
        location: formData.location || '',
        city: 'Aurangabad',
        carpet_area: formData.carpet_area || 0,
        amenities: formData.amenities || [],
        listing_status: formData.listing_status || 'active',
        agent_name: (formData.agent_name && formData.agent_name.trim()) || (formData.full_name || ''),
        agent_phone: (formData.agent_phone && formData.agent_phone.trim()) || (formData.contact_number || ''),
        google_map_link: formData.google_map_link || '',
        images: imageUrls,
        furnishing: formData.furnishing || '',
        bathrooms: formData.bathrooms || 1,
        balconies: formData.balconies || 0,
        parking_type: formData.parking || '',
        property_age: formData.property_age || '',
        transaction_type: formData.transaction_type || '',
        property_category: formData.property_category || '',
        additional_notes: formData.additional_details || '',
        approval_status: formData.approval_status || 'pending',
        highlights: formData.highlights || [],
        submitted_by_user: false,
        updated_at: new Date().toISOString(),
        // Security and infrastructure features
        cctv_surveillance: formData.cctv_surveillance || false,
        earthquake_resistant: formData.earthquake_resistant || false,
        sewerage_connection: formData.sewerage_connection || false,
        broadband_ready: formData.broadband_ready || false,
        ...(property ? {} : { created_at: new Date().toISOString() })
      };

      if (property) {
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', property.id);
        
        if (error) throw error;

        // Translate and cache updated free-text fields (title/description)
        const tasks: Promise<any>[] = [];
        if (formData.title) {
          tasks.push(translateAndCache(formData.title, { context: `property:${property.id}:title` }));
        }
        if (formData.description) {
          tasks.push(translateAndCache(formData.description, { context: `property:${property.id}:description` }));
        }
        await Promise.allSettled(tasks);
        
        toast({
          title: "Success!",
          description: "Property updated successfully!",
        });
      } else {
        const { data: inserted, error } = await supabase
          .from('properties')
          .insert([propertyData])
          .select('id, title, description')
          .single();
        
        if (error) throw error;

        // Translate and cache free-text fields for the new listing
        const propId = inserted?.id as string;
        const tasks: Promise<any>[] = [];
        if (inserted?.title) tasks.push(translateAndCache(inserted.title, { context: `property:${propId}:title` }));
        if (inserted?.description) tasks.push(translateAndCache(inserted.description, { context: `property:${propId}:description` }));
        await Promise.allSettled(tasks);
        
        toast({
          title: "Success!",
          description: "Property added successfully!",
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: "Error",
        description: "Failed to save property. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentStep = () => {
    const step = chatSteps[currentStep];
    if (step && step.id === 'property_type' && formData.property_category) {
      const categoryKey = formData.property_category as keyof typeof PROPERTY_CATEGORIES;
      const types = PROPERTY_CATEGORIES[categoryKey]?.types;
      if (types && !Array.isArray(types)) {
        step.options = Object.entries(types).map(([key, type]) => ({
          id: key,
          label: `${(type as any).icon} ${(type as any).label}`,
          value: key
        }));
      }
    }
    return step;
  };

  const renderStepContent = (step: any) => {
    switch (step.type) {
      case 'select':
        if (step.id === 'amenities') {
          return (
            <div className="space-y-2">
              <QuickReplyButtons
                options={step.options || []}
                onSelect={(option) => handleMultiSelectAnswer(option.value)}
                selectedValue={formData.amenities}
                columns={2}
              />
              <div className="mt-4">
                <Button 
                  onClick={() => handleStepAnswer(formData.amenities)}
                  className="w-full"
                >
                  Continue with {(formData.amenities || []).length} amenities selected
                </Button>
              </div>
            </div>
          );
        }
        
        if (step.id === 'location') {
          return (
            <div className="space-y-4">
              <Select onValueChange={(value) => handleStepAnswer(value)} value={formData.location || ''}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose your area in Aurangabad" />
                </SelectTrigger>
                <SelectContent>
                  {AURANGABAD_AREAS.map((area) => (
                    <SelectItem key={area.toLowerCase().replace(/\s+/g, '-')} value={area}>
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
            onSubmit={(value) => {
              console.log('ChatInput submission for step:', step.id, 'value:', value);
              if (step.validation) {
                const validationResult = step.validation(value);
                console.log('Validation result for', step.id, ':', validationResult);
                if (validationResult) {
                  toast({
                    title: "Validation Error",
                    description: validationResult,
                    variant: "destructive"
                  });
                  return;
                }
              }
              handleStepAnswer(value);
            }}
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
              <p><strong>Location:</strong> {formData.location}</p>
              <p><strong>Price:</strong> ₹{formData.price?.toLocaleString()}</p>
              <p><strong>Status:</strong> {formData.approval_status} | {formData.listing_status}</p>
              <p><strong>Featured:</strong> {formData.is_featured ? 'Yes' : 'No'}</p>
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Saving...' : property ? 'Update Property' : 'Add Property'}
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] p-0 flex flex-col bg-background rounded-xl shadow-xl border">
        <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              {property ? 'Update Property' : 'Add New Property'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ChatProgress 
          currentStep={currentStep + 1}
          totalSteps={chatSteps.length}
          stepTitles={chatSteps.map(step => step.id)}
        />

        <div className={`flex-1 overflow-y-auto p-6 space-y-4 bg-muted/30 ${currentStep > 0 ? 'pb-20' : 'pb-6'}`}>
          {chatSteps.slice(0, currentStep + 1).map((step, index) => (
            <div key={index}>
              <ChatMessage
                message={<TranslatableText text={step.question} context={`form:admin:question:${step.id}`} />}
                isBot={true}
                timestamp={new Date()}
              />
              
              {index === currentStep && (
                <>
                  {isTyping && <TypingIndicator />}
                  {!isTyping && (
                    <ChatMessage
                      message=""
                      isBot={true}
                    >
                      {renderStepContent(getCurrentStep())}
                    </ChatMessage>
                  )}
                </>
              )}
              
              {index < currentStep && formData[step.id as keyof AdminFormData] && (
                <ChatMessage
                  message={Array.isArray(formData[step.id as keyof AdminFormData]) 
                    ? `Selected: ${(formData[step.id as keyof AdminFormData] as string[]).join(', ')}`
                    : `${formData[step.id as keyof AdminFormData]}`}
                  isBot={false}
                  timestamp={new Date()}
                />
              )}
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>
        
        {currentStep > 0 && (
          <div className="border-t bg-background/95 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
            <Button variant="outline" onClick={handlePrevious} className="flex items-center gap-2">
              ← Previous
            </Button>
            <div className="text-xs text-muted-foreground font-medium">
              Step {currentStep + 1} of {chatSteps.length}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};