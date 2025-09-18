import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check, X, Home, Star, CheckCircle, Languages, Phone, MapPin, Building2, IndianRupee, Camera, Shield, Clock, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleSignInDialog } from '@/components/auth/GoogleSignInDialog';
import { ImageUpload } from '@/components/ui/image-upload';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { generatePropertyTitle } from '@/lib/propertyUtils';

interface ComprehensivePropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
}

// Property type hierarchy based on your flow
const PROPERTY_CATEGORIES = {
  residential: {
    label: 'Residential / निवासी',
    types: [
      { id: 'flat', label: 'Flat/Apartment / फ्लॅट/अपार्टमेंट' },
      { id: 'house', label: 'House/Bungalow / घर/बंगला' },
      { id: 'villa', label: 'Villa / व्हिला' },
      { id: 'plot', label: 'Plot/Land / प्लॉट/जमीन' }
    ]
  },
  commercial: {
    label: 'Commercial / व्यावसायिक',
    types: [
      { id: 'office', label: 'Office Space / कार्यालय जागा' },
      { id: 'shop', label: 'Shop/Showroom / दुकान/शोरूम' },
      { id: 'warehouse', label: 'Warehouse / गोदाम' },
      { id: 'building', label: 'Building / इमारत' }
    ]
  },
  agricultural: {
    label: 'Agricultural / कृषी',
    types: [
      { id: 'farmland', label: 'Farmland / शेतजमीन' },
      { id: 'orchard', label: 'Orchard / बाग' },
      { id: 'plantation', label: 'Plantation / लागवड' }
    ]
  },
  industrial: {
    label: 'Industrial / औद्योगिक',
    types: [
      { id: 'factory', label: 'Factory / कारखाना' },
      { id: 'manufacturing', label: 'Manufacturing Unit / उत्पादन युनिट' },
      { id: 'industrial_plot', label: 'Industrial Plot / औद्योगिक प्लॉट' }
    ]
  }
};

const TRANSACTION_TYPES = [
  { id: 'sale', label: 'For Sale / विक्रीसाठी' },
  { id: 'rent', label: 'For Rent / भाड्याने' },
  { id: 'lease', label: 'For Lease / पट्ट्याने' }
];

const BHK_OPTIONS = [
  { id: '1', label: '1 BHK' },
  { id: '2', label: '2 BHK' },
  { id: '3', label: '3 BHK' },
  { id: '4', label: '4+ BHK' }
];

const PROPERTY_AGE_OPTIONS = [
  { id: 'new', label: 'New Construction / नवीन बांधकाम' },
  { id: '1-5', label: '1-5 Years / १-५ वर्षे' },
  { id: '5-10', label: '5-10 Years / ५-१० वर्षे' },
  { id: '10+', label: '10+ Years / १०+ वर्षे' }
];

const AURANGABAD_LOCATIONS = [
  'CIDCO', 'Osmanpura', 'Garkheda', 'Beed Bypass', 'Waluj', 'Paithan Road',
  'Kanchanwadi', 'Jalna Road', 'Samarth Nagar', 'Aurangpura', 'Shahgunj',
  'Gulmandi', 'Ulkanagari', 'Jyoti Nagar', 'Bansilal Nagar', 'Shreya Nagar',
  'Satara Parisar', 'Padegaon', 'Harsul', 'Mukundwadi', 'Naregaon',
  'Chikalthana', 'Shendra MIDC', 'Begumpura', 'Jadhavwadi', 'Pundlik Nagar',
  'Deolai', 'Chishtiya Colony', 'Jawahar Colony', 'Station Road', 'Vedant Nagar',
  'Bajaj Nagar', 'Nakshatrawadi', 'Mondha Naka', 'Bhavsinghpura', 'MGM',
  'Nirala Bazar', 'Town Centre', 'Mayur Park', 'Khadkeshwar', 'Padampura'
];

const AMENITIES_LIST = [
  { id: 'lift', label: 'Lift / लिफ्ट', icon: '🛗' },
  { id: 'swimming_pool', label: 'Swimming Pool / जलतरण तलाव', icon: '🏊' },
  { id: 'gym', label: 'Gym / व्यायामशाला', icon: '🏋️' },
  { id: 'garden', label: 'Garden / बाग', icon: '🌳' },
  { id: 'security', label: 'Security / सुरक्षा', icon: '🔒' },
  { id: 'power_backup', label: 'Power Backup / वीज बॅकअप', icon: '🔋' },
  { id: 'water_supply', label: 'Water Supply / पाणी पुरवठा', icon: '💧' },
  { id: 'parking', label: 'Parking / पार्किंग', icon: '🚗' },
  { id: 'club_house', label: 'Club House / क्लब हाउस', icon: '🏛️' },
  { id: 'playground', label: 'Playground / खेळाचे मैदान', icon: '⚽' }
];

const CONTACT_TIME_OPTIONS = [
  { id: 'morning', label: 'Morning / सकाळ (9 AM - 12 PM)' },
  { id: 'afternoon', label: 'Afternoon / दुपार (12 PM - 5 PM)' },
  { id: 'evening', label: 'Evening / संध्याकाळ (5 PM - 8 PM)' },
  { id: 'anytime', label: 'Anytime / कधीही' }
];

const STEPS = [
  { id: 1, title: 'Personal Information', subtitle: 'व्यक्तिगत माहिती', icon: Phone },
  { id: 2, title: 'Property Type & Purpose', subtitle: 'प्रॉपर्टी प्रकार आणि उद्देश', icon: Building2 },
  { id: 3, title: 'Property Details', subtitle: 'प्रॉपर्टी तपशील', icon: MapPin },
  { id: 4, title: 'Area & Pricing', subtitle: 'क्षेत्रफळ आणि किंमत', icon: IndianRupee },
  { id: 5, title: 'Property Features', subtitle: 'प्रॉपर्टी वैशिष्ट्ये', icon: Home },
  { id: 6, title: 'Amenities', subtitle: 'सुविधा', icon: Star },
  { id: 7, title: 'Documentation', subtitle: 'कागदपत्रे', icon: FileText },
  { id: 8, title: 'Additional Information', subtitle: 'अतिरिक्त माहिती', icon: Camera },
  { id: 9, title: 'Verification', subtitle: 'प्रमाणीकरण', icon: Shield }
];

export const ComprehensivePropertyForm = ({ isOpen, onClose }: ComprehensivePropertyFormProps) => {
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submittedPropertyId, setSubmittedPropertyId] = useState<string | null>(null);

  // Personal Information
  const [personalInfo, setPersonalInfo] = useState({
    full_name: '',
    contact_number: '',
    email_address: '',
    language_preference: 'english'
  });

  // Property Basic Info
  const [propertyBasics, setPropertyBasics] = useState({
    property_category: '',
    property_type: '',
    transaction_type: '',
    title: ''
  });

  // Property Details
  const [propertyDetails, setPropertyDetails] = useState({
    location: '',
    locality: '',
    city: 'Aurangabad',
    pincode: '',
    price: 0,
    age_of_property: ''
  });

  // Area Information
  const [areaInfo, setAreaInfo] = useState({
    carpet_area: undefined as number | undefined,
    built_up_area: undefined as number | undefined,
    super_built_up_area: undefined as number | undefined,
    plot_area: undefined as number | undefined
  });

  // Property Features
  const [propertyFeatures, setPropertyFeatures] = useState({
    bhk: undefined as number | undefined,
    bathrooms: 1,
    parking_spaces: 0,
    furnishing: '',
    floor_number: undefined as number | undefined,
    total_floors: undefined as number | undefined,
    facing_direction: ''
  });

  // Amenities
  const [amenities, setAmenities] = useState<string[]>([]);

  // Documentation
  const [documentation, setDocumentation] = useState({
    title_clear: false,
    under_construction: false,
    legal_issues: '',
    ownership_type: ''
  });

  // Additional Information
  const [additionalInfo, setAdditionalInfo] = useState({
    description: '',
    images: [] as string[],
    google_map_link: '',
    additional_notes: '',
    preferred_contact_time: [] as string[]
  });

  // Verification Details
  const [verificationDetails, setVerificationDetails] = useState({
    construction_status: '',
    property_condition: '',
    water_supply: '',
    electricity_backup: '',
    maintenance_charges: undefined as number | undefined,
    security_deposit: undefined as number | undefined
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const progress = (currentStep / STEPS.length) * 100;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(personalInfo.full_name && personalInfo.contact_number && personalInfo.email_address);
      case 2:
        return !!(propertyBasics.property_category && propertyBasics.property_type && propertyBasics.transaction_type);
      case 3:
        return !!(propertyDetails.location && propertyDetails.city);
      case 4:
        return !!(propertyDetails.price > 0);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateTitle = () => {
    const { bhk } = propertyFeatures;
    const { property_type, property_category } = propertyBasics;
    const { location } = propertyDetails;
    
    if (!property_type || !location) return '';
    
    return generatePropertyTitle(
      property_type,
      location,
      bhk,
      property_category,
      propertyBasics.title
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    setLoading(true);

    try {
      const autoTitle = generateTitle() || propertyBasics.title;
      
      const propertyData = {
        // Basic info
        title: autoTitle,
        description: additionalInfo.description,
        property_category: propertyBasics.property_category,
        property_type: propertyBasics.property_type,
        transaction_type: propertyBasics.transaction_type,
        
        // Location
        location: propertyDetails.location,
        locality: propertyDetails.locality,
        city: propertyDetails.city,
        pincode: propertyDetails.pincode,
        
        // Pricing
        price: propertyDetails.price,
        maintenance_charges: verificationDetails.maintenance_charges,
        security_deposit: verificationDetails.security_deposit,
        
        // Areas
        carpet_area: areaInfo.carpet_area,
        built_up_area: areaInfo.built_up_area,
        super_built_up_area: areaInfo.super_built_up_area,
        plot_area: areaInfo.plot_area,
        
        // Features
        bhk: propertyFeatures.bhk,
        parking_spaces: propertyFeatures.parking_spaces,
        furnishing: propertyFeatures.furnishing,
        floor_number: propertyFeatures.floor_number,
        total_floors: propertyFeatures.total_floors,
        facing_direction: propertyFeatures.facing_direction,
        
        // Other details
        age_of_property: propertyDetails.age_of_property ? parseInt(propertyDetails.age_of_property) : undefined,
        amenities: amenities,
        images: additionalInfo.images,
        google_map_link: additionalInfo.google_map_link,
        additional_notes: additionalInfo.additional_notes,
        
        // Contact & preferences
        contact_number: personalInfo.contact_number,
        agent_name: personalInfo.full_name,
        language_preference: personalInfo.language_preference,
        preferred_contact_time: additionalInfo.preferred_contact_time,
        
        // Documentation
        title_clear: documentation.title_clear,
        under_construction: documentation.under_construction,
        legal_issues: documentation.legal_issues,
        ownership_type: documentation.ownership_type,
        
        // Verification details
        construction_status: verificationDetails.construction_status,
        property_condition: verificationDetails.property_condition,
        water_supply: verificationDetails.water_supply,
        electricity_backup: verificationDetails.electricity_backup,
        
        // Status fields
        submitted_by_user: true,
        approval_status: 'pending',
        listing_status: 'Inactive',
        verification_status: 'pending',
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select()
        .single();

      if (error) throw error;

      // Log user activity
      await supabase.from('user_activities').insert({
        user_id: user.id,
        activity_type: 'property_listed',
        property_id: data.id,
        metadata: {
          property_title: autoTitle,
          property_type: propertyBasics.property_type,
          location: propertyDetails.location,
          price: propertyDetails.price
        }
      });

      toast({
        title: "Property Submitted Successfully! 🎉",
        description: "Your comprehensive property listing has been submitted for review.",
      });

      setSubmittedPropertyId(data.id);
    } catch (error) {
      console.error('Error submitting property:', error);
      toast({
        title: "Error",
        description: "Failed to submit property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Phone className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Personal Information</h3>
              <p className="text-muted-foreground">व्यक्तिगत माहिती</p>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name / पूर्ण नाव *</Label>
                <Input
                  id="full_name"
                  value={personalInfo.full_name}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_number">Contact Number / संपर्क क्रमांक *</Label>
                <Input
                  id="contact_number"
                  value={personalInfo.contact_number}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, contact_number: e.target.value }))}
                  placeholder="+91 9876543210"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_address">Email Address / ईमेल पत्ता *</Label>
                <Input
                  id="email_address"
                  type="email"
                  value={personalInfo.email_address}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, email_address: e.target.value }))}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Language Preference / भाषा प्राधान्य</Label>
                <RadioGroup
                  value={personalInfo.language_preference}
                  onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, language_preference: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="english" id="english" />
                    <Label htmlFor="english">English</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="marathi" id="marathi" />
                    <Label htmlFor="marathi">Marathi / मराठी</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hindi" id="hindi" />
                    <Label htmlFor="hindi">Hindi / हिंदी</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Building2 className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Property Type & Purpose</h3>
              <p className="text-muted-foreground">प्रॉपर्टी प्रकार आणि उद्देश</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Property Category / प्रॉपर्टी श्रेणी *</Label>
                <RadioGroup
                  value={propertyBasics.property_category}
                  onValueChange={(value) => {
                    setPropertyBasics(prev => ({ ...prev, property_category: value, property_type: '' }));
                  }}
                >
                  {Object.entries(PROPERTY_CATEGORIES).map(([key, category]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <RadioGroupItem value={key} id={key} />
                      <Label htmlFor={key}>{category.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {propertyBasics.property_category && (
                <div className="space-y-2">
                  <Label>Property Type / प्रॉपर्टी प्रकार *</Label>
                  <RadioGroup
                    value={propertyBasics.property_type}
                    onValueChange={(value) => setPropertyBasics(prev => ({ ...prev, property_type: value }))}
                  >
                    {PROPERTY_CATEGORIES[propertyBasics.property_category as keyof typeof PROPERTY_CATEGORIES]?.types.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={type.id} id={type.id} />
                        <Label htmlFor={type.id}>{type.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <div className="space-y-2">
                <Label>Property Purpose / प्रॉपर्टी उद्देश *</Label>
                <RadioGroup
                  value={propertyBasics.transaction_type}
                  onValueChange={(value) => setPropertyBasics(prev => ({ ...prev, transaction_type: value }))}
                >
                  {TRANSACTION_TYPES.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.id} id={type.id} />
                      <Label htmlFor={type.id}>{type.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Property Details</h3>
              <p className="text-muted-foreground">प्रॉपर्टी तपशील</p>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">City / शहर *</Label>
                <Input
                  id="city"
                  value={propertyDetails.city}
                  onChange={(e) => setPropertyDetails(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Aurangabad"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Area/Locality / परिसर/भाग *</Label>
                <Select
                  value={propertyDetails.location}
                  onValueChange={(value) => setPropertyDetails(prev => ({ ...prev, location: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location in Aurangabad" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {AURANGABAD_LOCATIONS.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="locality">Specific Locality / विशिष्ट परिसर</Label>
                <Input
                  id="locality"
                  value={propertyDetails.locality}
                  onChange={(e) => setPropertyDetails(prev => ({ ...prev, locality: e.target.value }))}
                  placeholder="Enter specific locality or society name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pin Code / पिन कोड</Label>
                <Input
                  id="pincode"
                  value={propertyDetails.pincode}
                  onChange={(e) => setPropertyDetails(prev => ({ ...prev, pincode: e.target.value }))}
                  placeholder="431001"
                />
              </div>

              <div className="space-y-2">
                <Label>Age of Property / प्रॉपर्टी वय</Label>
                <RadioGroup
                  value={propertyDetails.age_of_property}
                  onValueChange={(value) => setPropertyDetails(prev => ({ ...prev, age_of_property: value }))}
                >
                  {PROPERTY_AGE_OPTIONS.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <IndianRupee className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Area & Pricing</h3>
              <p className="text-muted-foreground">क्षेत्रफळ आणि किंमत</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">📐 Area Information / क्षेत्रफळ माहिती</h4>
              <p className="text-blue-700 text-sm">
                Please provide all applicable area measurements. Different areas serve different purposes in property evaluation.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) / किंमत *</Label>
                <Input
                  id="price"
                  type="number"
                  value={propertyDetails.price}
                  onChange={(e) => setPropertyDetails(prev => ({ 
                    ...prev, 
                    price: parseFloat(e.target.value) || 0 
                  }))}
                  placeholder="e.g., 5000000"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carpet_area">Carpet Area (sq ft) / कार्पेट एरिया</Label>
                  <Input
                    id="carpet_area"
                    type="number"
                    value={areaInfo.carpet_area || ''}
                    onChange={(e) => setAreaInfo(prev => ({ 
                      ...prev, 
                      carpet_area: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="Usable floor area"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="built_up_area">Built-up Area (sq ft) / बिल्ट-अप एरिया</Label>
                  <Input
                    id="built_up_area"
                    type="number"
                    value={areaInfo.built_up_area || ''}
                    onChange={(e) => setAreaInfo(prev => ({ 
                      ...prev, 
                      built_up_area: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="Including walls & balcony"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="super_built_up_area">Super Built-up Area (sq ft) / सुपर बिल्ट-अप</Label>
                  <Input
                    id="super_built_up_area"
                    type="number"
                    value={areaInfo.super_built_up_area || ''}
                    onChange={(e) => setAreaInfo(prev => ({ 
                      ...prev, 
                      super_built_up_area: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="Including common areas"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plot_area">Plot Area (sq ft) / प्लॉट एरिया</Label>
                  <Input
                    id="plot_area"
                    type="number"
                    value={areaInfo.plot_area || ''}
                    onChange={(e) => setAreaInfo(prev => ({ 
                      ...prev, 
                      plot_area: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="Total plot/land area"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Home className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Property Features</h3>
              <p className="text-muted-foreground">प्रॉपर्टी वैशिष्ट्ये</p>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label>Bedrooms / शयनकक्ष</Label>
                <RadioGroup
                  value={propertyFeatures.bhk?.toString() || ''}
                  onValueChange={(value) => setPropertyFeatures(prev => ({ 
                    ...prev, 
                    bhk: value ? parseInt(value) : undefined 
                  }))}
                >
                  {BHK_OPTIONS.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={`bhk-${option.id}`} />
                      <Label htmlFor={`bhk-${option.id}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parking_spaces">Parking Spaces / पार्किंग जागा</Label>
                  <Input
                    id="parking_spaces"
                    type="number"
                    min="0"
                    value={propertyFeatures.parking_spaces}
                    onChange={(e) => setPropertyFeatures(prev => ({ 
                      ...prev, 
                      parking_spaces: parseInt(e.target.value) || 0 
                    }))}
                    placeholder="Number of parking spaces"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floor_number">Floor Number / मजला क्रमांक</Label>
                  <Input
                    id="floor_number"
                    type="number"
                    min="0"
                    value={propertyFeatures.floor_number || ''}
                    onChange={(e) => setPropertyFeatures(prev => ({ 
                      ...prev, 
                      floor_number: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="Which floor?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_floors">Total Floors / एकूण मजले</Label>
                  <Input
                    id="total_floors"
                    type="number"
                    min="1"
                    value={propertyFeatures.total_floors || ''}
                    onChange={(e) => setPropertyFeatures(prev => ({ 
                      ...prev, 
                      total_floors: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="Total floors in building"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facing_direction">Facing Direction / दिशा</Label>
                  <Select
                    value={propertyFeatures.facing_direction}
                    onValueChange={(value) => setPropertyFeatures(prev => ({ ...prev, facing_direction: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select facing direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="north">North / उत्तर</SelectItem>
                      <SelectItem value="south">South / दक्षिण</SelectItem>
                      <SelectItem value="east">East / पूर्व</SelectItem>
                      <SelectItem value="west">West / पश्चिम</SelectItem>
                      <SelectItem value="north-east">North-East / ईशान्य</SelectItem>
                      <SelectItem value="north-west">North-West / वायव्य</SelectItem>
                      <SelectItem value="south-east">South-East / आग्नेय</SelectItem>
                      <SelectItem value="south-west">South-West / नैऋत्य</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Furnishing Status / सुसज्जता स्थिती</Label>
                <RadioGroup
                  value={propertyFeatures.furnishing}
                  onValueChange={(value) => setPropertyFeatures(prev => ({ ...prev, furnishing: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="furnished" id="furnished" />
                    <Label htmlFor="furnished">Furnished / सुसज्ज</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="semi-furnished" id="semi-furnished" />
                    <Label htmlFor="semi-furnished">Semi-Furnished / अर्ध-सुसज्ज</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unfurnished" id="unfurnished" />
                    <Label htmlFor="unfurnished">Unfurnished / असुसज्ज</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Star className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Amenities</h3>
              <p className="text-muted-foreground">सुविधा</p>
            </div>

            <div className="space-y-4">
              <Label>Available Amenities / उपलब्ध सुविधा (Multiple selections allowed)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AMENITIES_LIST.map(amenity => (
                  <div key={amenity.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent">
                    <Checkbox
                      id={amenity.id}
                      checked={amenities.includes(amenity.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAmenities(prev => [...prev, amenity.id]);
                        } else {
                          setAmenities(prev => prev.filter(a => a !== amenity.id));
                        }
                      }}
                    />
                    <span className="text-lg">{amenity.icon}</span>
                    <Label htmlFor={amenity.id} className="text-sm font-medium">{amenity.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Documentation</h3>
              <p className="text-muted-foreground">कागदपत्रे</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Documentation Status / कागदपत्र स्थिती</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="title_clear"
                      checked={documentation.title_clear}
                      onCheckedChange={(checked) => setDocumentation(prev => ({ 
                        ...prev, 
                        title_clear: checked as boolean 
                      }))}
                    />
                    <Label htmlFor="title_clear">Clear Title / स्पष्ट मालकी</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="under_construction"
                      checked={documentation.under_construction}
                      onCheckedChange={(checked) => setDocumentation(prev => ({ 
                        ...prev, 
                        under_construction: checked as boolean 
                      }))}
                    />
                    <Label htmlFor="under_construction">Under Construction / बांधकाम सुरू</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownership_type">Ownership Type / मालकी प्रकार</Label>
                <Select
                  value={documentation.ownership_type}
                  onValueChange={(value) => setDocumentation(prev => ({ ...prev, ownership_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ownership type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="freehold">Freehold / फ्रीहोल्ड</SelectItem>
                    <SelectItem value="leasehold">Leasehold / लीजहोल्ड</SelectItem>
                    <SelectItem value="cooperative">Cooperative / सहकारी</SelectItem>
                    <SelectItem value="power_of_attorney">Power of Attorney / पॉवर ऑफ अटॉर्नी</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="legal_issues">Legal Issues (if any) / कायदेशीर समस्या (असल्यास)</Label>
                <Textarea
                  id="legal_issues"
                  value={documentation.legal_issues}
                  onChange={(e) => setDocumentation(prev => ({ ...prev, legal_issues: e.target.value }))}
                  rows={3}
                  placeholder="Mention any legal issues or disputes"
                />
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Camera className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Additional Information</h3>
              <p className="text-muted-foreground">अतिरिक्त माहिती</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Property Description / प्रॉपर्टी वर्णन</Label>
                <Textarea
                  id="description"
                  value={additionalInfo.description}
                  onChange={(e) => setAdditionalInfo(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  placeholder="Describe your property features, nearby facilities, unique selling points..."
                />
              </div>

              <div className="space-y-4">
                <Label>Property Photos / प्रॉपर्टी फोटो</Label>
                <ImageUpload
                  value={additionalInfo.images}
                  onChange={(urls) => setAdditionalInfo(prev => ({ ...prev, images: urls }))}
                  maxImages={8}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Upload high-quality images to attract more buyers. Include exterior, interior, and nearby amenities.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_map_link">Google Map Link / गूगल मॅप लिंक</Label>
                <Input
                  id="google_map_link"
                  value={additionalInfo.google_map_link}
                  onChange={(e) => setAdditionalInfo(prev => ({ ...prev, google_map_link: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div className="space-y-4">
                <Label>Preferred Contact Time / संपर्काची योग्य वेळ</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CONTACT_TIME_OPTIONS.map(option => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={additionalInfo.preferred_contact_time.includes(option.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAdditionalInfo(prev => ({
                              ...prev,
                              preferred_contact_time: [...prev.preferred_contact_time, option.id]
                            }));
                          } else {
                            setAdditionalInfo(prev => ({
                              ...prev,
                              preferred_contact_time: prev.preferred_contact_time.filter(t => t !== option.id)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={option.id} className="text-sm">{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional_notes">Additional Notes / अतिरिक्त टिप्पणी</Label>
                <Textarea
                  id="additional_notes"
                  value={additionalInfo.additional_notes}
                  onChange={(e) => setAdditionalInfo(prev => ({ ...prev, additional_notes: e.target.value }))}
                  rows={3}
                  placeholder="Any additional information about the property"
                />
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Verification Details</h3>
              <p className="text-muted-foreground">प्रमाणीकरण तपशील</p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2">🏆 Get Verified Badge!</h4>
              <p className="text-yellow-700 text-sm">
                Complete these details to get your property verified and increase inquiries by 3x!
              </p>
            </div>

            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="construction_status">Construction Status / बांधकाम स्थिती</Label>
                  <Select
                    value={verificationDetails.construction_status}
                    onValueChange={(value) => setVerificationDetails(prev => ({ ...prev, construction_status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed / पूर्ण</SelectItem>
                      <SelectItem value="under_construction">Under Construction / बांधकाम सुरू</SelectItem>
                      <SelectItem value="ready_to_move">Ready to Move / राहण्यास तयार</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_condition">Property Condition / प्रॉपर्टी स्थिती</Label>
                  <Select
                    value={verificationDetails.property_condition}
                    onValueChange={(value) => setVerificationDetails(prev => ({ ...prev, property_condition: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent / उत्कृष्ट</SelectItem>
                      <SelectItem value="good">Good / चांगली</SelectItem>
                      <SelectItem value="average">Average / सरासरी</SelectItem>
                      <SelectItem value="needs_repair">Needs Repair / दुरुस्तीची गरज</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="water_supply">Water Supply / पाणी पुरवठा</Label>
                  <Select
                    value={verificationDetails.water_supply}
                    onValueChange={(value) => setVerificationDetails(prev => ({ ...prev, water_supply: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select water supply" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="municipal">Municipal / नगरपालिका</SelectItem>
                      <SelectItem value="borewell">Borewell / बोअरवेल</SelectItem>
                      <SelectItem value="both">Both / दोन्ही</SelectItem>
                      <SelectItem value="tanker">Tanker / टॅंकर</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="electricity_backup">Electricity Backup / वीज बॅकअप</Label>
                  <Select
                    value={verificationDetails.electricity_backup}
                    onValueChange={(value) => setVerificationDetails(prev => ({ ...prev, electricity_backup: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select backup" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="generator">Generator / जनरेटर</SelectItem>
                      <SelectItem value="inverter">Inverter / इन्व्हर्टर</SelectItem>
                      <SelectItem value="both">Both / दोन्ही</SelectItem>
                      <SelectItem value="none">None / नाही</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenance_charges">Maintenance Charges (₹/month) / देखभाल शुल्क</Label>
                  <Input
                    id="maintenance_charges"
                    type="number"
                    value={verificationDetails.maintenance_charges || ''}
                    onChange={(e) => setVerificationDetails(prev => ({ 
                      ...prev, 
                      maintenance_charges: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="Monthly maintenance cost"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="security_deposit">Security Deposit (₹) / सिक्युरिटी डिपॉझिट</Label>
                  <Input
                    id="security_deposit"
                    type="number"
                    value={verificationDetails.security_deposit || ''}
                    onChange={(e) => setVerificationDetails(prev => ({ 
                      ...prev, 
                      security_deposit: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="Security deposit amount"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Comprehensive Property Listing</h2>
              <p className="text-muted-foreground">संपूर्ण प्रॉपर्टी लिस्टिंग</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {submittedPropertyId ? (
          // Success screen
          <div className="p-6 text-center space-y-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Property Listed Successfully! 🎉</h3>
              <p className="text-muted-foreground">आपली प्रॉपर्टी यशस्वीरित्या सबमिट झाली आहे!</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">
                Your comprehensive property listing has been submitted for review. Our team will contact you soon!
              </p>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button onClick={() => {
                setSubmittedPropertyId(null);
                setCurrentStep(1);
              }}>List Another Property</Button>
            </div>
          </div>
        ) : (
          <>
            {/* Progress Section */}
            <div className="p-6 border-b">
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Step {currentStep} of {STEPS.length}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              {/* Step indicators */}
              <div className="flex items-center justify-between overflow-x-auto pb-2">
                {STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex flex-col items-center min-w-0 px-2 ${
                        currentStep === step.id 
                          ? 'text-primary' 
                          : currentStep > step.id 
                          ? 'text-green-600' 
                          : 'text-muted-foreground'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                          currentStep === step.id 
                            ? 'bg-primary text-primary-foreground' 
                            : currentStep > step.id 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {currentStep > step.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <StepIcon className="h-4 w-4" />
                          )}
                        </div>
                        <span className="text-xs font-medium text-center">{step.title}</span>
                        <span className="text-xs text-center hidden md:block">{step.subtitle}</span>
                      </div>
                      {index < STEPS.length - 1 && (
                        <div className={`h-px w-8 mx-2 ${
                          currentStep > step.id ? 'bg-green-300' : 'bg-muted'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <Card>
                <CardContent className="p-6">
                  {renderStepContent()}
                </CardContent>
              </Card>
            </div>

            {/* Navigation */}
            <div className="sticky bottom-0 bg-background border-t p-6 flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                
                {currentStep === STEPS.length ? (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Property
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {showAuthDialog && (
        <GoogleSignInDialog 
          open={showAuthDialog} 
          onOpenChange={(open) => setShowAuthDialog(open)} 
        />
      )}
    </div>
  );
};
