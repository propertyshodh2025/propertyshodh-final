import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Property, PropertyFormData } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';
import { validatePropertyTitle, cleanPropertyTitle } from '@/lib/propertyUtils';
import { useLanguage } from '@/contexts/LanguageContext';

interface PropertyFormProps {
  property?: Property | null;
  onSave: () => void;
  onCancel: () => void;
}

// Comprehensive property categories and types
const PROPERTY_CATEGORIES = ['Residential', 'Commercial', 'Agricultural', 'Industrial'];

// Property types based on category
const PROPERTY_TYPES = {
  residential: [
    'plot_land', 'house', 'flat_apartment', 'villa', 'row_house', 'townhouse', 'bungalow',
    'penthouse', 'studio_apartment', 'farmhouse', 'condominium', 'duplex_triplex',
    'mansion', 'cottage', 'serviced_apartment', 'garden_flat', 'loft_apartment', 'holiday_home'
  ],
  commercial: [
    'shop_retail', 'office_space', 'showroom', 'warehouse_godown', 'hotel_motel',
    'restaurant_cafe', 'shopping_mall', 'clinic_hospital', 'coworking_space',
    'industrial_shed', 'commercial_land', 'it_park', 'school_college',
    'cinema_multiplex', 'banquet_hall', 'petrol_pump', 'bank', 'gymnasium',
    'cold_storage', 'resort'
  ],
  agricultural: [
    'farmland', 'orchard', 'plantation', 'agricultural_land', 'farm'
  ],
  industrial: [
    'factory', 'manufacturing_unit', 'industrial_plot', 'commercial_plot'
  ]
};

const BHK_OPTIONS = [1, 2, 3, 4, 5, 6];
const FURNISHING_OPTIONS = ['Unfurnished', 'Semi Furnished', 'Fully Furnished'];
const AMENITIES_LIST = [
  'Lift', 'Parking', 'Garden', 'Swimming Pool', 'Gym', 'Club House',
  'Security', 'Power Backup', 'Playground', 'Internet/Wi-Fi',
  'Air Conditioning', 'Balcony', 'Terrace', 'Store Room'
];

// Function to determine if a property type should have BHK
const shouldShowBHK = (propertyCategory: string, propertyType: string) => {
  if (!propertyCategory) return true;
  
  const normalizedCategory = propertyCategory.toLowerCase();
  
  // Land/agricultural properties don't have BHK
  if (normalizedCategory === 'agricultural') return false;
  
  // Some commercial properties might have BHK-like concepts
  if (normalizedCategory === 'commercial') {
    const bhkCommercialTypes = ['serviced_apartment', 'hotel_motel', 'resort'];
    return bhkCommercialTypes.includes(propertyType);
  }
  
  // Residential properties have BHK except land/plots
  if (normalizedCategory === 'residential') {
    const noBhkResidentialTypes = ['plot_land'];
    return !noBhkResidentialTypes.includes(propertyType);
  }
  
  // Industrial properties generally don't have BHK
  if (normalizedCategory === 'industrial') return false;
  
  return true; // Default to showing BHK
};

// Function to get available property types based on category
const getPropertyTypesByCategory = (category: string) => {
  if (!category) return [];
  const normalizedCategory = category.toLowerCase();
  return PROPERTY_TYPES[normalizedCategory as keyof typeof PROPERTY_TYPES] || [];
};

// Function to format property type for display
const formatPropertyTypeLabel = (propertyType: string) => {
  // Use translation keys for display
  return propertyType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const PropertyForm = ({ property, onSave, onCancel }: PropertyFormProps) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    property_type: '',
    property_category: '',
    bhk: undefined,
    price: 0,
    location: '',
    city: '',
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
    agent_phone: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Check if BHK should be shown based on current form data
  const showBHKField = shouldShowBHK(formData.property_category || '', formData.property_type || '');
  
  // Get available property types for current category
  const availablePropertyTypes = getPropertyTypesByCategory(formData.property_category || '');

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title,
        description: property.description || '',
        property_type: property.property_type,
        property_category: property.property_category || '',
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
        agent_phone: property.agent_phone || ''
      });
    }
  }, [property]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate and clean the property title
      const titleValidation = validatePropertyTitle(
        formData.title,
        formData.property_type,
        formData.property_category
      );
      
      if (!titleValidation.isValid && titleValidation.suggestedTitle) {
        toast({
          title: "Title Updated",
          description: `Property title cleaned: BHK removed from ${formData.property_type.toLowerCase()} property`,
        });
        
        formData.title = titleValidation.suggestedTitle;
      }
      
      if (property) {
        // Update existing property
        const { error } = await supabase
          .from('properties')
          .update(formData)
          .eq('id', property.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Property updated successfully",
        });
      } else {
        // Create new property
        const { error } = await supabase
          .from('properties')
          .insert([formData]);

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
      const updated = (formData.images || []).filter(u => u !== url);
      setFormData(prev => ({ ...prev, images: updated }));
      if (property?.id) {
        await supabase.from('properties').update({ images: updated }).eq('id', property.id);
      }
      toast({ title: 'Image removed', description: 'The image has been deleted.' });
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast({ title: 'Delete failed', description: 'Could not delete image', variant: 'destructive' });
    }
  };
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">
            {property ? 'Edit Property' : 'Add New Property'}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_category">Property Category *</Label>
                  <Select
                    value={formData.property_category}
                    onValueChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        property_category: value,
                        property_type: '', // Reset property type when category changes
                        bhk: undefined // Reset BHK when category changes
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_type">Property Type *</Label>
                  <Select
                    value={formData.property_type}
                    onValueChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        property_type: value,
                        bhk: !shouldShowBHK(formData.property_category || '', value) ? undefined : prev.bhk
                      }));
                    }}
                    disabled={!formData.property_category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.property_category ? "Select property type" : "Select category first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePropertyTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {t(type) || formatPropertyTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label 
                    htmlFor="bhk" 
                    className={`${!showBHKField ? 'text-muted-foreground/50' : ''}`}
                  >
                    BHK {!showBHKField && '(Not Applicable)'}
                  </Label>
                  <Select
                    value={formData.bhk?.toString() || ''}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      bhk: value ? parseInt(value) : undefined 
                    }))}
                    disabled={!showBHKField}
                  >
                    <SelectTrigger className={!showBHKField ? 'bg-muted cursor-not-allowed opacity-50' : ''}>
                      <SelectValue placeholder={showBHKField ? "Select BHK" : "N/A"} />
                    </SelectTrigger>
                    <SelectContent>
                      {showBHKField && BHK_OPTIONS.map(bhk => (
                        <SelectItem key={bhk} value={bhk.toString()}>{bhk} BHK</SelectItem>
                      ))}
                      {!showBHKField && (
                        <SelectItem value="" disabled>Not Applicable</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {!showBHKField && (
                    <p className="text-xs text-muted-foreground">
                      BHK is not applicable for this property type
                    </p>
                  )}
                </div>

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
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location/Area *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    required
                  />
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    id="contact_number"
                    value={formData.contact_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              {/* Status and Possession */}
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

              {/* Image Upload Section */}
              <div className="space-y-4">
                <Label>Property Images</Label>
                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    {formData.images.map((url, idx) => (
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
                  onChange={(urls) => setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }))}
                  maxImages={12}
                  disabled={loading}
                  uploadMode="immediate"
                  pathPrefix={`properties/${property?.id || 'admin'}`}
                />
                <p className="text-sm text-muted-foreground">Upload new images or delete existing ones above.</p>
              </div>

              {/* Google Map Link */}
              <div className="space-y-2">
                <Label htmlFor="google_map_link">Google Map Link</Label>
                <Input
                  id="google_map_link"
                  value={formData.google_map_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, google_map_link: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              {/* Additional Property Details */}
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

              {/* Agent Information */}
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

              {/* Property Highlights */}
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

              {/* Amenities */}
              <div className="space-y-4">
                <Label>Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {AMENITIES_LIST.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={(formData.amenities || []).includes(amenity)}
                        onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                      />
                      <Label
                        htmlFor={amenity}
                        className="flex-1 text-sm rounded-md border bg-background px-3 py-2 cursor-pointer transition-colors hover:bg-accent peer-data-[state=checked]:bg-accent peer-data-[state=checked]:border-primary"
                      >
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-6">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : property ? 'Update Property' : 'Create Property'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};