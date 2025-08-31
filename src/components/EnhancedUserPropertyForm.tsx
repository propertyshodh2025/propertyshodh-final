import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleSignInDialog } from '@/components/auth/GoogleSignInDialog';
import PropertyVerificationForm from './PropertyVerificationForm';
import { ImageUpload } from '@/components/ui/image-upload';

interface EnhancedUserPropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
}

// Enhanced property categories based on Google form
const PROPERTY_CATEGORIES = {
  residential: {
    label: 'Residential / निवासी',
    types: [
      'Flat/Apartment / फ्लॅट/अपार्टमेंट',
      'House/Bungalow / घर/बंगला', 
      'Villa / व्हिला',
      'Plot/Land / प्लॉट/जमीन'
    ]
  },
  commercial: {
    label: 'Commercial / व्यावसायिक', 
    types: [
      'Office Space / कार्यालय जागा',
      'Shop/Showroom / दुकान/शोरूम',
      'Warehouse / गोदाम',
      'Building / इमारत'
    ]
  },
  agricultural: {
    label: 'Agricultural / कृषी',
    types: [
      'Farmland / शेतजमीन',
      'Orchard / बाग', 
      'Plantation / लागवड'
    ]
  },
  industrial: {
    label: 'Industrial / औद्योगिक',
    types: [
      'Factory / कारखाना',
      'Manufacturing Unit / उत्पादन युनिट',
      'Industrial Plot / औद्योगिक प्लॉट'
    ]
  }
};

const TRANSACTION_TYPES = [
  'For Sale / विक्रीसाठी',
  'For Rent / भाड्याने', 
  'For Lease / पट्ट्याने'
];

const BHK_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4+ BHK'];
const BATHROOM_OPTIONS = ['1 Bathroom / १ स्नानगृह', '2 Bathrooms / २ स्नानगृह', '3+ Bathrooms / ३+ स्नानगृह'];
const PARKING_OPTIONS = ['Car Parking / कार पार्किंग', 'Bike Parking / बाईक पार्किंग', 'No Parking / पार्किंग नाही'];
const FURNISHING_OPTIONS = ['Furnished / सुसज्ज', 'Semi-Furnished / अर्ध-सुसज्ज', 'Unfurnished / असुसज्ज'];
const FLOOR_OPTIONS = ['Ground Floor / भूतल', '1st Floor / पहिला मजला', '2nd Floor / दुसरा मजला', '3rd+ Floor / तिसरा+ मजला'];
const PROPERTY_AGE_OPTIONS = [
  'New Construction / नवीन बांधकाम',
  '1-5 Years / १-५ वर्षे', 
  '5-10 Years / ५-१० वर्षे',
  '10+ Years / १०+ वर्षे'
];

const AURANGABAD_LOCATIONS = [
  'CIDCO', 'Osmanpura', 'Garkheda', 'Beed Bypass', 'Waluj', 'Paithan Road',
  'Kanchanwadi', 'Jalna Road', 'Samarth Nagar', 'Aurangpura', 'Shahgunj',
  'Gulmandi', 'Ulkanagari', 'Jyoti Nagar', 'Bansilal Nagar', 'Shreya Nagar',
  'Satara Parisar', 'Padegaon', 'Harsul', 'Mukundwadi', 'Naregaon',
  'Chikalthana', 'Shendra MIDC', 'Begumpura', 'Jadhavwadi', 'Pundlik Nagar',
  'Deolai', 'Chishtiya Colony', 'Jawahar Colony', 'Station Road', 'Vedant Nagar',
  'Bajaj Nagar', 'Nakshatrawadi', 'Mondha Naka', 'Bhavsinghpura', 'MGM',
  'Nirala Bazar', 'Town Centre', 'Mayur Park', 'Khadkeshwar', 'Padampura',
  'Dashmesh Nagar', 'Shahanurwadi', 'Kotla Colony', 'Itkheda', 'New Usmanpura',
  'Seven Hills', 'Tilak Nagar', 'Kranti Chowk', 'Sillod Road'
];

const AMENITIES_LIST = [
  'Lift / लिफ्ट',
  'Swimming Pool / जलतरण तलाव', 
  'Gym / व्यायामशाला',
  'Garden / बाग',
  'Security / सुरक्षा',
  'Power Backup / वीज बॅकअप',
  'Water Supply / पाणी पुरवठा',
  'Parking',
  'Club House',
  'Playground',
  'Internet/Wi-Fi',
  'Air Conditioning',
  'Balcony',
  'Terrace',
  'Store Room'
];

const CONTACT_TIME_OPTIONS = [
  'Morning / सकाळ',
  'Afternoon / दुपार',
  'Evening / संध्याकाळ', 
  'Anytime / कधीही'
];

const DOCUMENTATION_OPTIONS = [
  'Clear Title / स्पष्ट मालकी',
  'Under Construction / बांधकाम सुरू',
  'Legal Issues / कायदेशीर समस्या'
];

const STEPS = [
  { id: 1, title: 'Personal Information / व्यक्तिगत माहिती', subtitle: 'Contact details' },
  { id: 2, title: 'Property Type / प्रॉपर्टी प्रकार', subtitle: 'Category and purpose' },
  { id: 3, title: 'Property Details / प्रॉपर्टी तपशील', subtitle: 'Area, location & price' },
  { id: 4, title: 'Property Features / प्रॉपर्टी वैशिष्ट्ये', subtitle: 'BHK, furnishing & floor' },
  { id: 5, title: 'Utilities & Legal / उपयोगिता आणि कायदेशीर', subtitle: 'Infrastructure and documentation' },
  { id: 6, title: 'Security & Safety / सुरक्षा', subtitle: 'Safety features' },
  { id: 7, title: 'Amenities / सुविधा', subtitle: 'Available facilities' },
  { id: 8, title: 'Additional Information / अतिरिक्त माहिती', subtitle: 'Photos & notes' },
];

export const EnhancedUserPropertyForm = ({ isOpen, onClose }: EnhancedUserPropertyFormProps) => {
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [submittedPropertyId, setSubmittedPropertyId] = useState<string | null>(null);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [submittedProperty, setSubmittedProperty] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadAllImages, setUploadAllImages] = useState<(() => Promise<string[]>) | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    contact_number: '',
    email_address: '',
    
    // Property Type
    property_category: '',
    property_type: '',
    property_purpose: '',
    
    // Property Details
    location: '',
    city: 'Aurangabad',
    pincode: '',
    carpet_area: undefined as number | undefined,
    built_up_area: undefined as number | undefined,
    super_built_up_area: undefined as number | undefined,
    plot_area: undefined as number | undefined,
    price: 0,
    property_age: '',
    
    // Property Features  
    bhk: undefined as number | undefined,
    bathrooms: 1,
    parking_type: '',
    furnishing: '',
    floor: '',
    facing: '',
    
    // Utilities & Infrastructure
    sewerage_connection: false,
    broadband_ready: false,
    lift_available: false,
    society_maintenance: undefined as number | undefined,
    electricity_backup: '',
    water_supply: '',
    
    // Legal & Documentation
    title_deed_clear: false,
    title_clear: false,
    documentation_status: '',
    
    // Investment & Financial Details
    ready_to_move: false,
    under_construction: false,
    
    // Security & Safety
    cctv_surveillance: false,
    earthquake_resistant: false,
    
    // Additional Details
    title: '',
    description: '',
    amenities: [] as string[],
    images: [] as string[],
    google_map_link: '',
    highlights: [] as string[],
    possession_status: '',
    listing_status: 'Inactive',
    preferred_contact_time: [] as string[],
    owner_details: '',
    additional_notes: ''
  });

  const generateTitle = () => {
    const { bhk, property_type, property_category } = formData;
    if (!property_type) return '';
    
    const cleanType = property_type.split(' / ')[0]; // Remove Marathi translation
    
    if (property_category === 'residential' && bhk) {
      return `${bhk} BHK ${cleanType}`;
    }
    
    return cleanType;
  };

  // Map property type display values to database values
  const mapPropertySubtype = (propertyType: string): string => {
    const typeMap: Record<string, string> = {
      'Flat/Apartment / फ्लॅट/अपार्टमेंट': 'flat',
      'House/Bungalow / घर/बंगला': 'bungalow',
      'Villa / व्हिला': 'villa',
      'Plot/Land / प्लॉट/जमीन': 'plot',
      'Office Space / कार्यालय जागा': 'office',
      'Shop/Showroom / दुकान/शोरूम': 'shop',
      'Warehouse / गोदाम': 'warehouse',
      'Building / इमारत': 'office', // Map to closest valid value
      'Farmland / शेतजमीन': 'plot', // Map to closest valid value
      'Orchard / बाग': 'plot', // Map to closest valid value
      'Plantation / लागवड': 'plot', // Map to closest valid value
      'Factory / कारखाना': 'warehouse', // Map to closest valid value
      'Manufacturing Unit / उत्पादन युनिट': 'warehouse', // Map to closest valid value
      'Industrial Plot / औद्योगिक प्लॉट': 'plot', // Map to closest valid value
    };
    
    return typeMap[propertyType] || 'flat'; // Default fallback
  };

  // Map transaction type to valid values
  const mapTransactionType = (purpose: string): string => {
    if (purpose?.toLowerCase().includes('sale') || purpose?.toLowerCase().includes('विक्री')) return 'buy';
    if (purpose?.toLowerCase().includes('rent') || purpose?.toLowerCase().includes('भाडे')) return 'rent';
    if (purpose?.toLowerCase().includes('lease') || purpose?.toLowerCase().includes('पट्टे')) return 'rent';
    return 'buy'; // Default fallback
  };

  const handleUploadAllImagesCallback = (uploadFn: () => Promise<string[]>) => {
    setUploadAllImages(() => uploadFn);
  };

  const handleSubmit = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    setLoading(true);

    try {
      // First, upload all images
      let imageUrls: string[] = [];
      if (uploadAllImages) {
        try {
          imageUrls = await uploadAllImages();
          console.log('Images uploaded successfully:', imageUrls);
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          throw new Error('Failed to upload images. Please try again.');
        }
      }

      // Generate title automatically
      const autoTitle = generateTitle();
      
      const propertyData = {
        ...formData,
        title: autoTitle,
        images: imageUrls,
        submitted_by_user: true,
        approval_status: 'pending',
        listing_status: 'Inactive',
        user_id: user.id,
        transaction_type: mapTransactionType(formData.property_purpose),
        property_category: formData.property_category,
        property_subtype: mapPropertySubtype(formData.property_type)
      };

      const { data, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Property Submitted!",
        description: "Your property has been submitted for review. We'll notify you once it's approved.",
      });

      // Log user activity
      try {
        const { error: activityError } = await supabase.from('user_activities').insert({
          user_id: user.id,
          activity_type: 'property_listed',
          property_id: data.id,
          metadata: {
            property_title: autoTitle,
            property_type: formData.property_type,
            location: formData.location,
            price: formData.price
          }
        });
        
        if (activityError) {
          console.error('Error logging user activity:', activityError);
        }
      } catch (error) {
        console.error('Error in activity logging:', error);
      }

      setSubmittedPropertyId(data.id);
      setSubmittedProperty(data);
      
    } catch (error) {
      console.error('Error submitting property:', error);
      toast({
        title: "Error",
        description: `Failed to submit property: ${error.message}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleContactTimeChange = (time: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferred_contact_time: checked
        ? [...prev.preferred_contact_time, time]
        : prev.preferred_contact_time.filter(t => t !== time)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.full_name && formData.contact_number && formData.email_address);
      case 2:
        return !!(formData.property_category && formData.property_type && formData.property_purpose);
      case 3:
        return !!(formData.location && formData.price > 0);
      case 4:
        return true; // Optional fields
      case 5:
        return true; // Optional amenities
      case 6:
        return true; // Optional additional info
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

  const progress = (currentStep / STEPS.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name / पूर्ण नाव *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number / संपर्क क्रमांक *</Label>
              <Input
                id="contact_number"
                value={formData.contact_number}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                placeholder="Enter your contact number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_address">Email Address / ईमेल पत्ता *</Label>
              <Input
                id="email_address"
                type="email"
                value={formData.email_address}
                onChange={(e) => setFormData(prev => ({ ...prev, email_address: e.target.value }))}
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Property Category / प्रॉपर्टी श्रेणी *</Label>
              <RadioGroup
                value={formData.property_category}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  property_category: value,
                  property_type: '' // Reset property type when category changes
                }))}
              >
                {Object.entries(PROPERTY_CATEGORIES).map(([key, category]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={key} />
                    <Label htmlFor={key}>{category.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {formData.property_category && (
              <div className="space-y-2">
                <Label>Property Type / प्रॉपर्टी प्रकार *</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, property_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_CATEGORIES[formData.property_category]?.types.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Property Purpose / प्रॉपर्टी उद्देश *</Label>
              <Select
                value={formData.property_purpose}
                onValueChange={(value) => setFormData(prev => ({ ...prev, property_purpose: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location">Area/Locality / परिसर/भाग *</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
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
                <Label htmlFor="pincode">Pin Code / पिन कोड</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                  placeholder="e.g., 431001"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Area/Size / क्षेत्रफळ/आकार</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="carpet_area">Carpet Area / कार्पेट एरिया (sq ft)</Label>
                  <Input
                    id="carpet_area"
                    type="number"
                    value={formData.carpet_area || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      carpet_area: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                    placeholder="Enter carpet area"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="built_up_area">Built-up Area / बिल्ट-अप एरिया (sq ft)</Label>
                  <Input
                    id="built_up_area"
                    type="number"
                    value={formData.built_up_area || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      built_up_area: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                    placeholder="Enter built-up area"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="super_built_up_area">Super Built-up / सुपर बिल्ट-अप (sq ft)</Label>
                  <Input
                    id="super_built_up_area"
                    type="number"
                    value={formData.super_built_up_area || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      super_built_up_area: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                    placeholder="Enter super built-up area"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plot_area">Plot Area / प्लॉट एरिया (sq ft)</Label>
                  <Input
                    id="plot_area"
                    type="number"
                    value={formData.plot_area || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      plot_area: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                    placeholder="Enter plot area"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price / किंमत (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    price: parseFloat(e.target.value) || 0 
                  }))}
                  placeholder="Enter price in rupees"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Age of Property / प्रॉपर्टी वय</Label>
                <Select
                  value={formData.property_age}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, property_age: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property age" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_AGE_OPTIONS.map(age => (
                      <SelectItem key={age} value={age}>{age}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Bedrooms / शयनकक्ष</Label>
                <Select
                  value={formData.bhk?.toString() || ''}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    bhk: value ? parseInt(value.split(' ')[0]) : undefined 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select BHK" />
                  </SelectTrigger>
                  <SelectContent>
                    {BHK_OPTIONS.map(bhk => (
                      <SelectItem key={bhk} value={bhk}>{bhk}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Bathrooms / स्नानगृह</Label>
                <Select
                  value={formData.bathrooms?.toString() || ''}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    bathrooms: parseInt(value) 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bathrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    {BATHROOM_OPTIONS.map((bathroom, index) => (
                      <SelectItem key={bathroom} value={(index + 1).toString()}>{bathroom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Parking / पार्किंग</Label>
                <Select
                  value={formData.parking_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, parking_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parking type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PARKING_OPTIONS.map(parking => (
                      <SelectItem key={parking} value={parking}>{parking}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Furnishing / सुसज्जता</Label>
                <Select
                  value={formData.furnishing}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, furnishing: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select furnishing status" />
                  </SelectTrigger>
                  <SelectContent>
                    {FURNISHING_OPTIONS.map(furnishing => (
                      <SelectItem key={furnishing} value={furnishing}>{furnishing}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Floor / मजला</Label>
                <Select
                  value={formData.floor}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, floor: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    {FLOOR_OPTIONS.map(floor => (
                      <SelectItem key={floor} value={floor}>{floor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facing">Facing Direction</Label>
                <Select
                  value={formData.facing}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, facing: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select facing direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="North">North</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                    <SelectItem value="East">East</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                    <SelectItem value="North-East">North-East</SelectItem>
                    <SelectItem value="North-West">North-West</SelectItem>
                    <SelectItem value="South-East">South-East</SelectItem>
                    <SelectItem value="South-West">South-West</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Utilities & Infrastructure / उपयोगिता आणि पायाभूत सुविधा</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sewerage_connection"
                    checked={formData.sewerage_connection}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sewerage_connection: checked as boolean }))}
                  />
                  <Label htmlFor="sewerage_connection">Sewerage Connection / मलवाहिनी कनेक्शन</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="broadband_ready"
                    checked={formData.broadband_ready}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, broadband_ready: checked as boolean }))}
                  />
                  <Label htmlFor="broadband_ready">Broadband Ready / ब्रॉडबँड तयार</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lift_available"
                    checked={formData.lift_available}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lift_available: checked as boolean }))}
                  />
                  <Label htmlFor="lift_available">Lift Available / लिफ्ट उपलब्ध</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="society_maintenance">Society Maintenance (₹/month)</Label>
                  <Input
                    id="society_maintenance"
                    type="number"
                    value={formData.society_maintenance || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      society_maintenance: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                    placeholder="Enter monthly maintenance"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Electricity Backup / वीज बॅकअप</Label>
                  <Select
                    value={formData.electricity_backup}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, electricity_backup: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select electricity backup" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Backup">Full Backup / पूर्ण बॅकअप</SelectItem>
                      <SelectItem value="Partial Backup">Partial Backup / आंशिक बॅकअप</SelectItem>
                      <SelectItem value="No Backup">No Backup / बॅकअप नाही</SelectItem>
                      <SelectItem value="Generator">Generator / जेनेरेटर</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Water Supply / पाणी पुरवठा</Label>
                  <Select
                    value={formData.water_supply}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, water_supply: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select water supply" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24 Hours">24 Hours / २४ तास</SelectItem>
                      <SelectItem value="Limited Hours">Limited Hours / मर्यादित तास</SelectItem>
                      <SelectItem value="Tanker Supply">Tanker Supply / टँकर पुरवठा</SelectItem>
                      <SelectItem value="Borewell">Borewell / बोअरवेल</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Legal & Documentation / कायदेशीर आणि कागदपत्रे</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="title_deed_clear"
                    checked={formData.title_deed_clear}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, title_deed_clear: checked as boolean }))}
                  />
                  <Label htmlFor="title_deed_clear">Title Deed Clear / स्पष्ट मालकी हक्क</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="title_clear"
                    checked={formData.title_clear}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, title_clear: checked as boolean }))}
                  />
                  <Label htmlFor="title_clear">Clear Title / स्पष्ट खिताब</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Documentation Status / कागदपत्र स्थिती</Label>
                <Select
                  value={formData.documentation_status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, documentation_status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select documentation status" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENTATION_OPTIONS.map(doc => (
                      <SelectItem key={doc} value={doc}>{doc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Investment & Financial Details / गुंतवणूक आणि आर्थिक तपशील</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ready_to_move"
                    checked={formData.ready_to_move}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ready_to_move: checked as boolean }))}
                  />
                  <Label htmlFor="ready_to_move">Ready to Move / राहण्यासाठी तयार</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="under_construction"
                    checked={formData.under_construction}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, under_construction: checked as boolean }))}
                  />
                  <Label htmlFor="under_construction">Under Construction / बांधकामाधीन</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Security & Safety / सुरक्षा</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cctv_surveillance"
                    checked={formData.cctv_surveillance}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, cctv_surveillance: checked as boolean }))}
                  />
                  <Label htmlFor="cctv_surveillance">CCTV Surveillance / सीसीटीव्ही निरीक्षण</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="earthquake_resistant"
                    checked={formData.earthquake_resistant}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, earthquake_resistant: checked as boolean }))}
                  />
                  <Label htmlFor="earthquake_resistant">Earthquake Resistant / भूकंपरोधी</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Amenities / सुविधा (Multiple Selection Possible)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AMENITIES_LIST.map(amenity => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                    />
                    <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Property Photos / प्रॉपर्टी फोटो</Label>
              <ImageUpload
                value={[]}
                onChange={() => {}}
                maxImages={8}
                disabled={loading}
                uploadMode="deferred"
                onUploadAllImages={handleUploadAllImagesCallback}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="google_map_link">Google Map Link</Label>
              <Input
                id="google_map_link"
                value={formData.google_map_link}
                onChange={(e) => setFormData(prev => ({ ...prev, google_map_link: e.target.value }))}
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div className="space-y-4">
              <Label>Preferred Contact Time / संपर्काची योग्य वेळ</Label>
              <div className="grid grid-cols-2 gap-3">
                {CONTACT_TIME_OPTIONS.map(time => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox
                      id={time}
                      checked={formData.preferred_contact_time.includes(time)}
                      onCheckedChange={(checked) => handleContactTimeChange(time, checked as boolean)}
                    />
                    <Label htmlFor={time} className="text-sm">{time}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_details">Owner Details / मालकाचे तपशील</Label>
              <Textarea
                id="owner_details"
                value={formData.owner_details}
                onChange={(e) => setFormData(prev => ({ ...prev, owner_details: e.target.value }))}
                rows={3}
                placeholder="Enter owner details"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_notes">Additional Notes / अतिरिक्त टिप्पणी</Label>
              <Textarea
                id="additional_notes"
                value={formData.additional_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, additional_notes: e.target.value }))}
                rows={4}
                placeholder="Any additional information about the property"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {submittedPropertyId ? (
            // Success screen with verification option
            <div className="p-6 text-center space-y-6">
              <Check className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Property Listed Successfully!</h3>
                <p className="text-muted-foreground">Your property has been submitted for review.</p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <span className="font-semibold text-yellow-800">Get Verified Badge!</span>
                </div>
                <p className="text-yellow-700 text-sm mb-3">
                  Complete verification to get 3x more inquiries
                </p>
                <Button 
                  onClick={() => setShowVerificationForm(true)}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Get Verified Now
                </Button>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={onClose}>Close</Button>
                <Button onClick={() => setSubmittedPropertyId(null)}>List Another</Button>
              </div>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">List Your Property</h2>
                  <p className="text-muted-foreground">Submit your property for approval</p>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Progress */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{STEPS[currentStep - 1].title}</h3>
                  <span className="text-sm text-muted-foreground">{currentStep} of {STEPS.length}</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">{STEPS[currentStep - 1].subtitle}</p>
              </div>

              {/* Form Content */}
              <div className="p-6">
                <Card>
                  <CardContent className="p-6">
                    {renderStep()}
                  </CardContent>
                </Card>
              </div>

              {/* Navigation */}
              <div className="sticky bottom-0 bg-background border-t p-6 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={currentStep === 1 ? onClose : prevStep}
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {currentStep === 1 ? 'Cancel' : 'Previous'}
                </Button>

                <div className="flex items-center gap-3">
                  {currentStep < STEPS.length ? (
                    <Button
                      onClick={nextStep}
                      disabled={!validateStep(currentStep) || loading}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? 'Submitting...' : 'Submit Property'}
                      <Check className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auth Dialog */}
      <GoogleSignInDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
      />

      {/* Verification Form */}
      {showVerificationForm && submittedProperty && (
        <PropertyVerificationForm
          isOpen={showVerificationForm}
          onClose={() => setShowVerificationForm(false)}
          propertyId={submittedPropertyId!}
          existingProperty={submittedProperty}
        />
      )}
    </>
  );
};