import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Globe, CheckCircle, Clock, X } from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PropertyVerificationFormProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  existingProperty?: any;
}

interface VerificationFormData {
  // Personal Information
  full_name: string;
  contact_number: string;
  email_address: string;
  
  // Property Type & Purpose
  property_type: string;
  property_subtype: string;
  property_purpose: string;
  
  // Property Details
  area_size: string;
  area_type: string;
  location: string;
  city: string;
  area_locality: string;
  pin_code: string;
  price: string;
  property_age: string;
  
  // Property Features
  bedrooms: string;
  bathrooms: string;
  parking: string;
  furnishing: string;
  floor: string;
  
  // Amenities
  amenities: string[];
  
  // Documentation
  ownership_type: string;
  title_clear: boolean;
  construction_status: string;
  legal_issues: string;
  
  // Additional Information
  property_condition: string;
  actual_photos_uploaded: boolean;
  additional_notes: string;
  preferred_contact_time: string[];
}

const TOTAL_STEPS = 9;

const PropertyVerificationForm: React.FC<PropertyVerificationFormProps> = ({
  isOpen,
  onClose,
  propertyId,
  existingProperty
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<VerificationFormData>({
    full_name: '',
    contact_number: '',
    email_address: '',
    property_type: '',
    property_subtype: '',
    property_purpose: '',
    area_size: '',
    area_type: '',
    location: '',
    city: '',
    area_locality: '',
    pin_code: '',
    price: '',
    property_age: '',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    furnishing: '',
    floor: '',
    amenities: [],
    ownership_type: '',
    title_clear: false,
    construction_status: '',
    legal_issues: '',
    property_condition: '',
    actual_photos_uploaded: false,
    additional_notes: '',
    preferred_contact_time: []
  });

  // Initialize form with existing property data
  useEffect(() => {
    if (existingProperty) {
      setFormData(prev => ({
        ...prev,
        property_type: existingProperty.property_type || '',
        location: existingProperty.location || '',
        city: existingProperty.city || '',
        price: existingProperty.price?.toString() || '',
        area_size: existingProperty.carpet_area?.toString() || '',
        bedrooms: existingProperty.bhk?.toString() || '',
        furnishing: existingProperty.furnishing || '',
        amenities: existingProperty.amenities || []
      }));
    }
  }, [existingProperty]);

  const updateFormData = (field: keyof VerificationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      updateFormData('amenities', [...formData.amenities, amenity]);
    } else {
      updateFormData('amenities', formData.amenities.filter(a => a !== amenity));
    }
  };

  const handleContactTimeChange = (time: string, checked: boolean) => {
    if (checked) {
      updateFormData('preferred_contact_time', [...formData.preferred_contact_time, time]);
    } else {
      updateFormData('preferred_contact_time', formData.preferred_contact_time.filter(t => t !== time));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.full_name && formData.contact_number && formData.email_address);
      case 2:
        return !!(formData.property_type && formData.property_subtype);
      case 3:
        return !!formData.property_purpose;
      case 4:
        return !!(formData.area_size && formData.location && formData.city && formData.price);
      case 5:
        return formData.property_type === 'commercial' || formData.property_type === 'industrial' || !!formData.bedrooms;
      case 6:
        return formData.amenities.length >= 0; // Optional
      case 7:
        return !!(formData.ownership_type && formData.construction_status);
      case 8:
        return !!formData.property_condition;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    } else {
      toast({
        title: "Please fill in all required fields before proceeding",
        variant: "destructive"
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Check if there's already a pending verification for this property
      const { data: existingVerification } = await supabase
        .from('property_verification_details')
        .select('id')
        .eq('property_id', propertyId)
        .eq('submitted_by_user_id', user?.id)
        .single();

      // If editing existing request, delete the old one first
      if (existingVerification) {
        const { error: deleteError } = await supabase
          .from('property_verification_details')
          .delete()
          .eq('id', existingVerification.id);

        if (deleteError) throw deleteError;
      }

      // Calculate completeness score based on filled fields
      const completenessScore = calculateCompletenessScore();
      
      // Only include fields that exist in the property_verification_details table
      const verificationData = {
        property_id: propertyId,
        full_name: formData.full_name,
        contact_number: formData.contact_number,
        email_address: formData.email_address,
        property_age: formData.property_age,
        ownership_type: formData.ownership_type,
        title_clear: formData.title_clear,
        construction_status: formData.construction_status,
        legal_issues: formData.legal_issues,
        property_condition: formData.property_condition,
        actual_photos_uploaded: formData.actual_photos_uploaded,
        additional_notes: formData.additional_notes,
        preferred_contact_time: formData.preferred_contact_time,
        completeness_score: completenessScore,
        language_preference: language,
        submitted_by_user_id: user?.id || null
      };

      const { error } = await supabase
        .from('property_verification_details')
        .insert([verificationData]);

      if (error) throw error;

      // Update property verification status
      await supabase
        .from('properties')
        .update({
          verification_status: 'pending',
          verification_submitted_at: new Date().toISOString(),
          verification_score: completenessScore
        })
         .eq('id', propertyId);

      // Log user activity
      if (user) {
        await supabase.from('user_activities').insert({
          user_id: user.id,
          activity_type: 'verification_submitted',
          property_id: propertyId,
          metadata: {
            property_title: existingProperty?.title,
            completeness_score: completenessScore,
            submission_type: existingVerification ? 'resubmitted' : 'initial'
          }
        });
      }

      toast({
        title: t('verification_success'),
        description: "Your property verification has been submitted successfully"
      });
      onClose();
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast({
        title: t('verification_error'),
        description: "Failed to submit verification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletenessScore = (): number => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values(formData).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return true;
      return value !== '' && value !== null && value !== undefined;
    }).length;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('personal_info')}</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="full_name">{t('full_name')} *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => updateFormData('full_name', e.target.value)}
                  placeholder={t('full_name')}
                />
              </div>
              <div>
                <Label htmlFor="contact_number">{t('contact_number')} *</Label>
                <Input
                  id="contact_number"
                  value={formData.contact_number}
                  onChange={(e) => updateFormData('contact_number', e.target.value)}
                  placeholder={t('contact_number')}
                />
              </div>
              <div>
                <Label htmlFor="email_address">{t('email_address')} *</Label>
                <Input
                  id="email_address"
                  type="email"
                  value={formData.email_address}
                  onChange={(e) => updateFormData('email_address', e.target.value)}
                  placeholder={t('email_address')}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('property_type')}</h3>
            <div className="space-y-4">
              <div>
                <Label>{t('property_type')} *</Label>
                <RadioGroup
                  value={formData.property_type}
                  onValueChange={(value) => {
                    updateFormData('property_type', value);
                    updateFormData('property_subtype', ''); // Reset subtype
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="residential" id="residential" />
                    <Label htmlFor="residential">{t('residential')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="commercial" id="commercial" />
                    <Label htmlFor="commercial">{t('commercial')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="agricultural" id="agricultural" />
                    <Label htmlFor="agricultural">{t('agricultural')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="industrial" id="industrial" />
                    <Label htmlFor="industrial">{t('industrial')}</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.property_type && (
                <div>
                  <Label>{t('select_option')} *</Label>
                  <Select 
                    value={formData.property_subtype} 
                    onValueChange={(value) => updateFormData('property_subtype', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('select_option')} />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.property_type === 'residential' && (
                        <>
                          <SelectItem value="flat_apartment">{t('flat_apartment')}</SelectItem>
                          <SelectItem value="house_bungalow">{t('house_bungalow')}</SelectItem>
                          <SelectItem value="villa">{t('villa')}</SelectItem>
                          <SelectItem value="plot_land">{t('plot_land')}</SelectItem>
                        </>
                      )}
                      {formData.property_type === 'commercial' && (
                        <>
                          <SelectItem value="office_space">{t('office_space')}</SelectItem>
                          <SelectItem value="shop_showroom">{t('shop_showroom')}</SelectItem>
                          <SelectItem value="warehouse">{t('warehouse')}</SelectItem>
                          <SelectItem value="building">{t('building')}</SelectItem>
                        </>
                      )}
                      {formData.property_type === 'agricultural' && (
                        <>
                          <SelectItem value="farmland">{t('farmland')}</SelectItem>
                          <SelectItem value="orchard">{t('orchard')}</SelectItem>
                          <SelectItem value="plantation">{t('plantation')}</SelectItem>
                        </>
                      )}
                      {formData.property_type === 'industrial' && (
                        <>
                          <SelectItem value="factory">{t('factory')}</SelectItem>
                          <SelectItem value="manufacturing_unit">{t('manufacturing_unit')}</SelectItem>
                          <SelectItem value="industrial_plot">{t('industrial_plot')}</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('property_purpose')}</h3>
            <RadioGroup
              value={formData.property_purpose}
              onValueChange={(value) => updateFormData('property_purpose', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="for_sale" id="for_sale" />
                <Label htmlFor="for_sale">{t('for_sale')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="for_rent" id="for_rent" />
                <Label htmlFor="for_rent">{t('for_rent')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="for_lease" id="for_lease" />
                <Label htmlFor="for_lease">{t('for_lease')}</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('property_details')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area_size">{t('area_size')} *</Label>
                <Input
                  id="area_size"
                  value={formData.area_size}
                  onChange={(e) => updateFormData('area_size', e.target.value)}
                  placeholder="Enter area in sq ft"
                />
              </div>
              <div>
                <Label>{t('area_size')} Type</Label>
                <Select value={formData.area_type} onValueChange={(value) => updateFormData('area_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_option')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carpet_area">{t('carpet_area')}</SelectItem>
                    <SelectItem value="built_up_area">{t('built_up_area')}</SelectItem>
                    <SelectItem value="super_built_up">{t('super_built_up')}</SelectItem>
                    <SelectItem value="plot_area">{t('plot_area')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">{t('location_address')} *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder={t('area_locality')}
                />
              </div>
              <div>
                <Label htmlFor="city">{t('city')} *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  placeholder={t('city')}
                />
              </div>
              <div>
                <Label htmlFor="pin_code">{t('pin_code')}</Label>
                <Input
                  id="pin_code"
                  value={formData.pin_code}
                  onChange={(e) => updateFormData('pin_code', e.target.value)}
                  placeholder={t('pin_code')}
                />
              </div>
              <div>
                <Label htmlFor="price">{t('price')} (INR) *</Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={(e) => updateFormData('price', e.target.value)}
                  placeholder="Enter amount in INR"
                />
              </div>
              <div className="md:col-span-2">
                <Label>{t('age_property')}</Label>
                <RadioGroup
                  value={formData.property_age}
                  onValueChange={(value) => updateFormData('property_age', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new_construction" id="new_construction" />
                    <Label htmlFor="new_construction">{t('new_construction')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1_5_years" id="1_5_years" />
                    <Label htmlFor="1_5_years">{t('1_5_years')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5_10_years" id="5_10_years" />
                    <Label htmlFor="5_10_years">{t('5_10_years')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="10_plus_years" id="10_plus_years" />
                    <Label htmlFor="10_plus_years">{t('10_plus_years')}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('property_features')}</h3>
            
            {/* Only show bedrooms/bathrooms for residential properties */}
            {formData.property_type === 'residential' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t('bedrooms')} *</Label>
                  <Select value={formData.bedrooms} onValueChange={(value) => updateFormData('bedrooms', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('select_option')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 BHK</SelectItem>
                      <SelectItem value="2">2 BHK</SelectItem>
                      <SelectItem value="3">3 BHK</SelectItem>
                      <SelectItem value="4">4+ BHK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('bathrooms')}</Label>
                  <Select value={formData.bathrooms} onValueChange={(value) => updateFormData('bathrooms', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('select_option')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t('1_bathroom')}</SelectItem>
                      <SelectItem value="2">{t('2_bathrooms')}</SelectItem>
                      <SelectItem value="3">{t('3_plus_bathrooms')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t('parking')}</Label>
                <Select value={formData.parking} onValueChange={(value) => updateFormData('parking', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_option')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car_parking">{t('car_parking')}</SelectItem>
                    <SelectItem value="bike_parking">{t('bike_parking')}</SelectItem>
                    <SelectItem value="no_parking">{t('no_parking')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('furnishing')}</Label>
                <Select value={formData.furnishing} onValueChange={(value) => updateFormData('furnishing', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_option')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="furnished">{t('furnished')}</SelectItem>
                    <SelectItem value="semi_furnished">{t('semi_furnished')}</SelectItem>
                    <SelectItem value="unfurnished">{t('unfurnished')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(formData.property_subtype === 'flat_apartment' || formData.property_type === 'commercial') && (
              <div>
                <Label>{t('floor')}</Label>
                <Select value={formData.floor} onValueChange={(value) => updateFormData('floor', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_option')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ground_floor">{t('ground_floor')}</SelectItem>
                    <SelectItem value="1st_floor">{t('1st_floor')}</SelectItem>
                    <SelectItem value="2nd_floor">{t('2nd_floor')}</SelectItem>
                    <SelectItem value="3rd_plus_floor">{t('3rd_plus_floor')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('amenities')}</h3>
            <p className="text-sm text-muted-foreground">{t('multiple_selection_possible')}</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                'lift', 'swimming_pool', 'gym', 'garden', 
                'security', 'power_backup', 'water_supply'
              ].map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                  />
                  <Label htmlFor={amenity}>{t(amenity)}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('documentation')}</h3>
            <div className="space-y-4">
              <div>
                <Label>Ownership Type *</Label>
                <RadioGroup
                  value={formData.ownership_type}
                  onValueChange={(value) => updateFormData('ownership_type', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="owner" id="owner" />
                    <Label htmlFor="owner">Owner</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="authorized_agent" id="authorized_agent" />
                    <Label htmlFor="authorized_agent">Authorized Agent</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="power_of_attorney" id="power_of_attorney" />
                    <Label htmlFor="power_of_attorney">Power of Attorney</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="title_clear"
                  checked={formData.title_clear}
                  onCheckedChange={(checked) => updateFormData('title_clear', checked as boolean)}
                />
                <Label htmlFor="title_clear">{t('clear_title')}</Label>
              </div>

              <div>
                <Label>Construction Status *</Label>
                <RadioGroup
                  value={formData.construction_status}
                  onValueChange={(value) => updateFormData('construction_status', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="completed" id="completed" />
                    <Label htmlFor="completed">Completed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="under_construction" id="under_construction" />
                    <Label htmlFor="under_construction">{t('under_construction')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="approved_plan" id="approved_plan" />
                    <Label htmlFor="approved_plan">Approved Plan</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="legal_issues">{t('legal_issues')}</Label>
                <Textarea
                  id="legal_issues"
                  value={formData.legal_issues}
                  onChange={(e) => updateFormData('legal_issues', e.target.value)}
                  placeholder="Describe any legal issues or leave blank if none"
                />
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('additional_info')}</h3>
            <div className="space-y-4">
              <div>
                <Label>Property Condition *</Label>
                <RadioGroup
                  value={formData.property_condition}
                  onValueChange={(value) => updateFormData('property_condition', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excellent" id="excellent" />
                    <Label htmlFor="excellent">Excellent</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="good" id="good" />
                    <Label htmlFor="good">Good</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fair" id="fair" />
                    <Label htmlFor="fair">Fair</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="needs_repair" id="needs_repair" />
                    <Label htmlFor="needs_repair">Needs Repair</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="actual_photos"
                  checked={formData.actual_photos_uploaded}
                  onCheckedChange={(checked) => updateFormData('actual_photos_uploaded', checked as boolean)}
                />
                <Label htmlFor="actual_photos">I have uploaded actual property photos</Label>
              </div>

              <div>
                <Label htmlFor="additional_notes">{t('additional_notes')}</Label>
                <Textarea
                  id="additional_notes"
                  value={formData.additional_notes}
                  onChange={(e) => updateFormData('additional_notes', e.target.value)}
                  placeholder={t('additional_notes')}
                />
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Preferences</h3>
            <div>
              <Label>{t('preferred_contact_time')}</Label>
              <p className="text-sm text-muted-foreground">{t('multiple_selection_possible')}</p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {['morning', 'afternoon', 'evening', 'anytime'].map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox
                      id={time}
                      checked={formData.preferred_contact_time.includes(time)}
                      onCheckedChange={(checked) => handleContactTimeChange(time, checked as boolean)}
                    />
                    <Label htmlFor={time}>{t(time)}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Form Summary</h4>
              <p className="text-sm">Completeness Score: {calculateCompletenessScore()}%</p>
              <p className="text-sm text-muted-foreground">
                {t('complete_verification')}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{t('property_verification')}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === 'english' ? 'marathi' : 'english')}
              >
                <Globe className="w-4 h-4 mr-1" />
                {language === 'english' ? 'मराठी' : 'English'}
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('step')} {currentStep} {t('of')} {TOTAL_STEPS}</span>
              <span>{Math.round((currentStep / TOTAL_STEPS) * 100)}%</span>
            </div>
            <Progress value={(currentStep / TOTAL_STEPS) * 100} className="w-full" />
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              {t('previous')}
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                {t('cancel')}
              </Button>
              
              {currentStep === TOTAL_STEPS ? (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('submit_form')}
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={nextStep}>
                  {t('next')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyVerificationForm;