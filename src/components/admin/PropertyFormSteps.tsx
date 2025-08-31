import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Property, PropertyFormData } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';

interface PropertyFormStepsProps {
  property?: Property | null;
  onSave: () => void;
  onCancel: () => void;
}

// Enhanced property categories based on comprehensive form
const PROPERTY_CATEGORIES = {
  residential: {
    label: 'Residential / निवासी',
    types: ['Flat/Apartment', 'House/Bungalow', 'Villa', 'Plot/Land']
  },
  commercial: {
    label: 'Commercial / व्यावसायिक', 
    types: ['Office Space', 'Shop/Showroom', 'Warehouse', 'Building']
  },
  agricultural: {
    label: 'Agricultural / कृषी',
    types: ['Farmland', 'Orchard', 'Plantation']
  },
  industrial: {
    label: 'Industrial / औद्योगिक',
    types: ['Factory', 'Manufacturing Unit', 'Industrial Plot']
  }
};

const TRANSACTION_TYPES = ['For Sale', 'For Rent', 'For Lease'];
const BHK_OPTIONS = [1, 2, 3, 4, 5, 6];
const BATHROOM_OPTIONS = [1, 2, 3, 4, 5];
const PARKING_OPTIONS = ['Car Parking', 'Bike Parking', 'No Parking'];
const FURNISHING_OPTIONS = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const PROPERTY_AGE_OPTIONS = ['New Construction', '1-5 Years', '5-10 Years', '10+ Years'];
const AMENITIES_LIST = [
  'Lift', 'Swimming Pool', 'Gym', 'Garden', 'Security', 'Power Backup', 
  'Water Supply', 'Parking', 'Club House', 'Playground', 'Internet/Wi-Fi',
  'Air Conditioning', 'Balcony', 'Terrace', 'Store Room'
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

const STEPS = [
  { id: 1, title: 'Personal & Property Info', subtitle: 'Contact details and property type' },
  { id: 2, title: 'Property Details', subtitle: 'Location, size and price' },
  { id: 3, title: 'Property Features', subtitle: 'BHK, furnishing and specifications' },
  { id: 4, title: 'Utilities & Legal', subtitle: 'Infrastructure and documentation' },
  { id: 5, title: 'Security & Safety', subtitle: 'Safety features and amenities' },
  { id: 6, title: 'Property Images', subtitle: 'Upload property photos' },
  { id: 7, title: 'Additional Information', subtitle: 'Extra details and notes' },
];

export const PropertyFormSteps = ({ property, onSave, onCancel }: PropertyFormStepsProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    property_type: '',
    bhk: undefined,
    price: 0,
    location: '',
    city: 'Aurangabad',
    carpet_area: undefined,
    amenities: [],
    possession_status: '',
    listing_status: 'Active',
    contact_number: '',
    google_map_link: '',
    images: [],
    furnishing: '',
    highlights: [],
    built_year: undefined,
    floor: '',
    facing: '',
    agent_name: '',
    agent_phone: '',
    // Utilities & Infrastructure
    sewerage_connection: false,
    broadband_ready: false,
    lift_available: false,
    society_maintenance: undefined,
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
    earthquake_resistant: false
  });
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title,
        description: property.description || '',
        property_type: property.property_type,
        bhk: property.bhk,
        price: property.price,
        location: property.location,
        city: property.city,
        carpet_area: property.carpet_area,
        amenities: property.amenities || [],
        possession_status: property.possession_status || '',
        listing_status: property.listing_status,
        contact_number: property.contact_number || '',
        google_map_link: property.google_map_link || '',
        images: property.images || [],
        furnishing: property.furnishing || '',
        highlights: property.highlights || [],
        built_year: property.built_year,
        floor: property.floor || '',
        facing: property.facing || '',
        agent_name: property.agent_name || '',
        agent_phone: property.agent_phone || '',
        // Utilities & Infrastructure
        sewerage_connection: (property as any).sewerage_connection || false,
        broadband_ready: (property as any).broadband_ready || false,
        lift_available: (property as any).lift_available || false,
        society_maintenance: (property as any).society_maintenance,
        electricity_backup: (property as any).electricity_backup || '',
        water_supply: (property as any).water_supply || '',
        // Legal & Documentation
        title_deed_clear: (property as any).title_deed_clear || false,
        title_clear: (property as any).title_clear || false,
        documentation_status: (property as any).documentation_status || '',
        // Investment & Financial Details
        ready_to_move: (property as any).ready_to_move || false,
        under_construction: (property as any).under_construction || false,
        // Security & Safety
        cctv_surveillance: (property as any).cctv_surveillance || false,
        earthquake_resistant: (property as any).earthquake_resistant || false
      });
      setUploadedImages(property?.images || []);
    }
  }, [property]);

  const generateTitle = () => {
    const { bhk, property_type } = formData;
    if (!bhk || !property_type) return '';
    
    const typeMap: Record<string, string> = {
      'Flat': 'Luxurious Flat',
      'Row House': 'Premium Row House',
      'Plot': 'Prime Plot',
      'Commercial': 'Commercial Space',
      'Bungalow': 'Beautiful Bungalow',
      'Villa': 'Elegant Villa'
    };
    
    if (property_type === 'Plot' || property_type === 'Commercial') {
      return typeMap[property_type] || property_type;
    }
    
    return `${bhk}BHK ${typeMap[property_type] || property_type}`;
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Generate title automatically
      const autoTitle = generateTitle();
      
      const finalFormData = {
        ...formData,
        title: autoTitle,
        images: uploadedImages // Images are already uploaded URLs from ImageUpload component
      };

      if (property) {
        const { error } = await supabase
          .from('properties')
          .update(finalFormData)
          .eq('id', property.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Property updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('properties')
          .insert([finalFormData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Property created successfully",
        });
      }

      onSave();
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: "Error",
        description: "Failed to save property",
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
        ? [...(prev.amenities || []), amenity]
        : (prev.amenities || []).filter(a => a !== amenity)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.property_type && formData.location);
      case 2:
        return !!(formData.price > 0);
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

const getStorageKeyFromUrl = (url: string): string | null => {
  const marker = '/object/public/property-images/';
  const idx = url.indexOf(marker);
  return idx !== -1 ? url.substring(idx + marker.length) : null;
};

const handleDeleteImage = async (url: string) => {
  try {
    const key = getStorageKeyFromUrl(url);
    if (key) {
      await supabase.storage.from('property-images').remove([key]);
    }
    const updated = uploadedImages.filter(u => u !== url);
    setUploadedImages(updated);
    if (property?.id) {
      await supabase.from('properties').update({ images: updated }).eq('id', property.id);
    }
    toast({ title: 'Image removed', description: 'The image has been deleted.' });
  } catch (error) {
    console.error('Failed to delete image:', error);
    toast({ title: 'Delete failed', description: 'Could not delete image', variant: 'destructive' });
  }
};

const progress = (currentStep / STEPS.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-700 text-sm">
                📝 <strong>Note:</strong> Property title will be automatically generated based on type and configuration (e.g., "3BHK Luxurious Flat")
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_type">Property Type *</Label>
              <Select
                value={formData.property_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, property_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PROPERTY_CATEGORIES).flatMap(category => 
                    category.types.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location/Area *</Label>
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

            {formData.property_type && formData.location && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-700 text-sm">
                  🏠 <strong>Preview Title:</strong> {generateTitle() || 'Select BHK configuration in next step to see title'}
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
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
              <Label htmlFor="bhk">BHK Configuration</Label>
              <Select
                value={formData.bhk?.toString() || ''}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  bhk: value ? parseInt(value) : undefined 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select BHK" />
                </SelectTrigger>
                <SelectContent>
                  {BHK_OPTIONS.map(bhk => (
                    <SelectItem key={bhk} value={bhk.toString()}>{bhk} BHK</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="carpet_area">Carpet Area (sq ft)</Label>
              <Input
                id="carpet_area"
                type="number"
                value={formData.carpet_area || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  carpet_area: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                placeholder="Enter carpet area in sq ft"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number</Label>
              <Input
                id="contact_number"
                value={formData.contact_number}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                placeholder="Enter contact number"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">Property Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={6}
                placeholder="Describe the property features, location benefits, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="possession_status">Possession Status</Label>
                <Select
                  value={formData.possession_status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, possession_status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select possession status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ready to Move">Ready to Move</SelectItem>
                    <SelectItem value="Under Construction">Under Construction</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="listing_status">Listing Status</Label>
                <Select
                  value={formData.listing_status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, listing_status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Hidden">Hidden</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Utilities & Infrastructure</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sewerage_connection"
                    checked={formData.sewerage_connection}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sewerage_connection: checked as boolean }))}
                  />
                  <Label htmlFor="sewerage_connection">Sewerage Connection</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="broadband_ready"
                    checked={formData.broadband_ready}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, broadband_ready: checked as boolean }))}
                  />
                  <Label htmlFor="broadband_ready">Broadband Ready</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lift_available"
                    checked={formData.lift_available}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lift_available: checked as boolean }))}
                  />
                  <Label htmlFor="lift_available">Lift Available</Label>
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
                  <Label>Electricity Backup</Label>
                  <Select
                    value={formData.electricity_backup}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, electricity_backup: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select electricity backup" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Backup">Full Backup</SelectItem>
                      <SelectItem value="Partial Backup">Partial Backup</SelectItem>
                      <SelectItem value="No Backup">No Backup</SelectItem>
                      <SelectItem value="Generator">Generator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Water Supply</Label>
                  <Select
                    value={formData.water_supply}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, water_supply: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select water supply" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24 Hours">24 Hours</SelectItem>
                      <SelectItem value="Limited Hours">Limited Hours</SelectItem>
                      <SelectItem value="Tanker Supply">Tanker Supply</SelectItem>
                      <SelectItem value="Borewell">Borewell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Legal & Documentation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="title_deed_clear"
                    checked={formData.title_deed_clear}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, title_deed_clear: checked as boolean }))}
                  />
                  <Label htmlFor="title_deed_clear">Title Deed Clear</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="title_clear"
                    checked={formData.title_clear}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, title_clear: checked as boolean }))}
                  />
                  <Label htmlFor="title_clear">Clear Title</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Documentation Status</Label>
                <Select
                  value={formData.documentation_status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, documentation_status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select documentation status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clear Title">Clear Title</SelectItem>
                    <SelectItem value="Under Construction">Under Construction</SelectItem>
                    <SelectItem value="Legal Issues">Legal Issues</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Investment & Financial Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ready_to_move"
                    checked={formData.ready_to_move}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ready_to_move: checked as boolean }))}
                  />
                  <Label htmlFor="ready_to_move">Ready to Move</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="under_construction"
                    checked={formData.under_construction}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, under_construction: checked as boolean }))}
                  />
                  <Label htmlFor="under_construction">Under Construction</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Security & Safety</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cctv_surveillance"
                    checked={formData.cctv_surveillance}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, cctv_surveillance: checked as boolean }))}
                  />
                  <Label htmlFor="cctv_surveillance">CCTV Surveillance</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="earthquake_resistant"
                    checked={formData.earthquake_resistant}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, earthquake_resistant: checked as boolean }))}
                  />
                  <Label htmlFor="earthquake_resistant">Earthquake Resistant</Label>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Available Amenities</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Select all amenities available with this property
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {AMENITIES_LIST.map(amenity => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={(formData.amenities || []).includes(amenity)}
                      onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                    />
                    <Label
                      htmlFor={amenity}
                      className="flex-1 text-sm font-normal rounded-md border bg-background px-3 py-2 cursor-pointer transition-colors hover:bg-accent"
                    >
                      {amenity}
                    </Label>
                  </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">📸 Upload Property Images</h3>
              <p className="text-blue-700 text-sm mb-4">
                Add high-quality images to attract more buyers. Good images can increase inquiries by up to 300%!
              </p>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="text-blue-600 text-sm font-medium mb-1">💡 Pro Tips:</p>
                <ul className="text-blue-600 text-xs space-y-1">
                  <li>• Upload well-lit, clear photos</li>
                  <li>• Include living room, bedrooms, kitchen & bathroom</li>
                  <li>• Show unique features and amenities</li>
                  <li>• Avoid blurry or dark images</li>
                </ul>
              </div>
            </div>

<div className="space-y-2">
  <Label>Property Images</Label>
  {uploadedImages.length > 0 && (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
      {uploadedImages.map((url, idx) => (
        <div key={url} className="relative group">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <img src={url} alt={`Existing image ${idx + 1}`} className="w-full h-full object-cover" />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleDeleteImage(url)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ))}
    </div>
  )}
  <ImageUpload
    value={[]}
    onChange={(urls) => setUploadedImages(prev => [...prev, ...urls])}
    maxImages={8}
    disabled={loading}
    uploadMode="immediate"
    pathPrefix={`properties/${property?.id || 'admin'}`}
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
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="furnishing">Furnishing Status</Label>
                <Select
                  value={formData.furnishing}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, furnishing: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select furnishing status" />
                  </SelectTrigger>
                  <SelectContent>
                    {FURNISHING_OPTIONS.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="built_year">Built Year</Label>
                <Input
                  id="built_year"
                  type="number"
                  value={formData.built_year || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    built_year: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="e.g., 2020"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  value={formData.floor}
                  onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                  placeholder="e.g., 5th of 8"
                />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="agent_name">Agent/Contact Name</Label>
                <Input
                  id="agent_name"
                  value={formData.agent_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, agent_name: e.target.value }))}
                  placeholder="e.g., Rajesh Sharma"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent_phone">Agent Phone/WhatsApp</Label>
                <Input
                  id="agent_phone"
                  value={formData.agent_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, agent_phone: e.target.value }))}
                  placeholder="e.g., +91 9876543210"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Property Highlights (Key Selling Points)</Label>
              <div className="space-y-3">
                {[0, 1, 2, 3].map(index => (
                  <Input
                    key={index}
                    placeholder={`Highlight ${index + 1} (e.g., Prime Location, Spacious Rooms)`}
                    value={formData.highlights[index] || ''}
                    onChange={(e) => {
                      const newHighlights = [...(formData.highlights || [])];
                      newHighlights[index] = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        highlights: newHighlights.filter(h => h.trim() !== '') 
                      }));
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">
            {property ? 'Edit Property' : 'Add New Property'}
          </h1>
        </div>

        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">{STEPS[currentStep - 1].title}</h2>
              <p className="text-muted-foreground">{STEPS[currentStep - 1].subtitle}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </div>
          </div>
          
          <Progress value={progress} className="h-2 mb-4" />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mb-1 ${
                  step.id < currentStep 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : step.id === currentStep 
                    ? 'border-primary text-primary' 
                    : 'border-muted-foreground text-muted-foreground'
                }`}>
                  {step.id < currentStep ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className={`text-center max-w-16 ${
                  step.id === currentStep ? 'text-foreground font-medium' : ''
                }`}>
                  {step.title.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>

            {currentStep === STEPS.length ? (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {property ? 'Update Property' : 'Create Property'}
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
      </div>
    </div>
  );
};