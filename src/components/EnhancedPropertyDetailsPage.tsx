import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { MapPin, Building, Home, Ruler, Car, Zap, Droplets, Shield, Wifi, ArrowLeft, Star, Bed, Square, Calendar, CheckCircle2, TrendingUp, Bath, Heart, Share2, Phone, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PropertyImageGallery } from '@/components/PropertyImageGallery';
import { PropertyContactCard } from '@/components/PropertyContactCard';
import VerificationBadge from '@/components/VerificationBadge';
import { InterestButton } from '@/components/InterestButton';
import { useToast } from '@/hooks/use-toast';
import { Property as DatabaseProperty } from '@/types/database';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatNumberWithLocale } from '@/lib/locale';
import { LanguageToggle } from '@/components/LanguageToggle';
import { translateEnum } from '@/lib/staticTranslations';
import { supabase } from '@/integrations/supabase/client';

// Use the database property type but with extended interface for additional fields
interface Property extends DatabaseProperty {
  
  // Enhanced apartment fields
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
  
  // Enhanced plot fields
  plot_length?: number;
  plot_width?: number;
  plot_shape?: string;
  boundary_wall?: boolean;
  plot_corner?: boolean;
  development_permissions?: string[];
  zone_classification?: string;
  
  // Enhanced commercial fields
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
  
  // Construction & quality
  construction_materials?: string[];
  construction_grade?: string;
  construction_status?: string;
  structural_warranty?: string;
  bathroom_fittings?: string;
  facing_direction?: string;
  facing_direction_detailed?: string;
  
  // Utilities & infrastructure
  water_connection_type?: string;
  electricity_load?: number;
  sewerage_connection?: boolean;
  broadband_ready?: boolean;
  backup_power?: string;
  
  // Legal & documentation
  title_deed_clear?: boolean;
  approvals_obtained?: string[];
  survey_number?: string;
  khata_number?: string;
  revenue_records?: string;
  
  // Investment & financial
  ready_to_move?: boolean;
  possession_timeline?: string;
  investment_potential?: string;
  appreciation_forecast?: string;
  
  // Agricultural
  soil_type?: string;
  water_source?: string[];
  irrigation_type?: string;
  crop_history?: string[];
  farm_equipment_included?: boolean;
  
  // Accessibility & connectivity
  public_transport_distance?: number;
  highway_connectivity?: string;
  airport_distance?: number;
  metro_connectivity?: string;
  
  // Security & safety
  security_features?: string[];
  cctv_surveillance?: boolean;
  fire_safety_features?: string[];
  earthquake_resistant?: boolean;
  
  amenities?: string[];
  highlights?: string[];
  images?: string[];
  furnishing?: string;
  parking_spaces?: number;
  parking_type?: string;
  full_address?: string;
}

interface EnhancedPropertyDetailsPageProps {
  property: Property;
}

export const EnhancedPropertyDetailsPage = ({ property }: EnhancedPropertyDetailsPageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...');
      const { data, error } = await supabase
        .from('properties')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
      } else {
        console.log('Database connection test successful');
        
        // Try to get total count of properties
        const { count, error: countError } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error('Count query failed:', countError);
        } else {
          console.log('Total properties in database:', count);
        }
      }
    } catch (error) {
      console.error('Database connection test error:', error);
    }
  };

  // Fetch similar properties when component mounts
  useEffect(() => {
    if (property && property.id) {
      console.log('Property changed, fetching similar properties for:', property.id);
      fetchSimilarProperties();
      
      // Also test database connection
      testDatabaseConnection();
    }
  }, [property?.id]); // Only depend on property.id to avoid infinite loops

  const fetchSimilarProperties = async () => {
    try {
      setLoadingSimilar(true);
      console.log('=== SIMILAR PROPERTIES DEBUG START ===');
      console.log('Fetching similar properties for property:', property.id);
      console.log('Property data:', {
        id: property.id,
        transaction_type: property.transaction_type,
        property_category: property.property_category,
        property_subtype: property.property_subtype,
        approval_status: property.approval_status,
        listing_status: property.listing_status
      });
      
      // Validate property data
      if (!property.id) {
        console.error('Property ID is missing');
        setSimilarProperties([]);
        return;
      }
      
      const transactionType = property.transaction_type || 'buy';
      const propertyCategory = property.property_category;
      const propertySubtype = property.property_subtype;
      
      console.log('Similar properties filters:', {
        transactionType,
        propertyCategory,
        propertySubtype,
        currentPropertyId: property.id
      });

      // Start with a simple query and gradually add filters
      let similarQuery = supabase
        .from('properties')
        .select('*')
        .neq('id', property.id) // Exclude current property
        .limit(12)
        .order('created_at', { ascending: false });

      // Add filters only if they exist and are meaningful
      if (transactionType && transactionType !== 'all') {
        similarQuery = similarQuery.eq('transaction_type', transactionType);
      }
      
      if (propertyCategory && propertyCategory !== 'all') {
        similarQuery = similarQuery.eq('property_category', propertyCategory);
      }

      console.log('Executing similar properties query...');
      let { data: similarData, error: similarError } = await similarQuery;
      
      if (similarError) {
        console.error('Error fetching similar properties:', similarError);
        // Try a fallback query without any filters
        console.log('Trying fallback query without filters...');
        const fallbackQuery = supabase
          .from('properties')
          .select('*')
          .neq('id', property.id)
          .limit(12)
          .order('created_at', { ascending: false });
          
        const fallbackResult = await fallbackQuery;
        similarData = fallbackResult.data;
        similarError = fallbackResult.error;
        
        if (similarError) {
          console.error('Fallback query also failed:', similarError);
        }
      }
      
      console.log('Query results:', similarData?.length || 0);
      if (similarData && similarData.length > 0) {
        console.log('Sample similar properties:', similarData.slice(0, 3).map(p => ({ 
          id: p.id, 
          title: p.title, 
          category: p.property_category, 
          subtype: p.property_subtype,
          approval_status: p.approval_status,
          listing_status: p.listing_status
        })));
      }

      // If still no results, try to get any properties at all to test database connection
      if (!similarData || similarData.length === 0) {
        console.log('No similar properties found, testing database connection...');
        const testQuery = supabase
          .from('properties')
          .select('*')
          .limit(1);
          
        const testResult = await testQuery;
        console.log('Database test result:', testResult);
        
        if (testResult.data && testResult.data.length > 0) {
          console.log('Database has properties, but our filters are too restrictive');
          console.log('Sample property from database:', testResult.data[0]);
        } else {
          console.log('Database appears to be empty or has permission issues');
        }
      }

      if (similarError) {
        console.error('Final error fetching similar properties:', similarError);
        setSimilarProperties([]);
        return;
      }

      // Filter and prioritize similar properties
      let filteredSimilar = similarData || [];
      
      // For better variety, prioritize different subtypes if we have them
      if (propertySubtype && propertySubtype !== 'all') {
        const differentSubtypes = filteredSimilar.filter(prop => 
          prop.property_subtype && prop.property_subtype !== propertySubtype
        );
        const sameSubtypes = filteredSimilar.filter(prop => 
          !prop.property_subtype || prop.property_subtype === propertySubtype
        );
        
        // Prioritize different subtypes but include some same subtypes too
        filteredSimilar = [...differentSubtypes.slice(0, 4), ...sameSubtypes.slice(0, 2)];
      }
      
      console.log('Final filtered similar properties:', filteredSimilar.length);
      console.log('Sample similar properties:', filteredSimilar.slice(0, 3).map(p => ({ 
        id: p.id, 
        title: p.title, 
        category: p.property_category, 
        subtype: p.property_subtype 
      })));
      console.log('=== SIMILAR PROPERTIES DEBUG END ===');
      
      setSimilarProperties(filteredSimilar.slice(0, 6)); // Show max 6 similar properties
    } catch (error) {
      console.error('Error fetching similar properties:', error);
      setSimilarProperties([]);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleWhatsApp = (contactNumber?: string) => {
    if (contactNumber) {
      const cleanNumber = contactNumber.replace(/\D/g, '');
      window.open(`https://wa.me/91${cleanNumber}`, '_blank');
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${formatNumberWithLocale((price / 10000000).toFixed(1), language)} Cr`;
    } else if (price >= 100000) {
      return `₹${formatNumberWithLocale((price / 100000).toFixed(1), language)} L`;
    } else {
      return `₹${formatNumberWithLocale(price.toLocaleString(), language)}`;
    }
  };

  // PropertyCard component for similar properties
  const PropertyCard = ({ property: cardProperty }: { property: Property }) => {
    return (
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card border-border/50 hover:border-primary/20">
        <div className="relative">
          {/* Property Image */}
          {cardProperty.images && cardProperty.images.length > 0 ? (
            <img 
              src={cardProperty.images[0]} 
              alt={cardProperty.title} 
              className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105" 
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }} 
            />
          ) : (
            <div className="h-48 bg-muted flex items-center justify-center">
              <Home className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            <div className="rounded-full bg-background/90 backdrop-blur-sm shadow-md">
              <InterestButton 
                propertyId={cardProperty.id} 
                propertyTitle={cardProperty.title} 
                variant="outline" 
                size="sm" 
                className="p-2 rounded-full hover:bg-background/50" 
              />
            </div>
            <button 
              className="p-2 bg-background/90 backdrop-blur-sm rounded-full hover:bg-background transition-colors shadow-md" 
              onClick={() => {
                const propertyUrl = `${window.location.origin}/property/${cardProperty.id}`;
                if (navigator.share) {
                  navigator.share({
                    title: cardProperty.title,
                    text: `Check out this property: ${cardProperty.title}`,
                    url: propertyUrl
                  });
                } else {
                  navigator.clipboard.writeText(propertyUrl);
                  toast({
                    title: "Link Copied!",
                    description: "Property link copied to clipboard"
                  });
                }
              }}
            >
              <Share2 size={16} className="text-blue-500" />
            </button>
          </div>
          <div className="absolute top-3 left-3">
            <Badge variant={cardProperty.listing_status === 'Active' ? 'default' : 'secondary'}>
              {cardProperty.listing_status}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-5">
          <div className="mb-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent dark:from-green-400 dark:to-green-500">
              {formatPrice(cardProperty.price)}
            </span>
          </div>
          
          <h3 className="font-semibold text-lg mb-3 line-clamp-2 text-foreground hover:text-primary transition-colors">
            {cardProperty.title}
          </h3>
          
          <div className="flex items-center text-muted-foreground mb-4">
            <MapPin size={16} className="mr-2 text-primary" />
            <span className="text-sm font-medium">{cardProperty.location}, {cardProperty.city}</span>
          </div>
          
          <div className="flex items-center justify-between mb-4 text-sm">
            {cardProperty.bhk && (
              <div className="flex items-center text-muted-foreground">
                <Bed size={16} className="mr-1 text-blue-500" />
                <span className="font-medium">{cardProperty.bhk} BHK</span>
              </div>
            )}
            {cardProperty.carpet_area && (
              <div className="flex items-center text-muted-foreground">
                <Square size={16} className="mr-1 text-purple-500" />
                <span className="font-medium">{cardProperty.carpet_area} sq ft</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mb-4">
            <Badge variant="outline" className="text-xs">
              {cardProperty.property_type}
            </Badge>
            {cardProperty.possession_status && (
              <Badge variant="outline" className="text-xs">
                {cardProperty.possession_status}
              </Badge>
            )}
          </div>

          {cardProperty.amenities && cardProperty.amenities.length > 0 && (
            <div className="mb-4">
              <span className="text-sm text-muted-foreground mb-2 block">Amenities:</span>
              <div className="flex flex-wrap gap-1">
                {cardProperty.amenities.slice(0, 3).map((amenity) => (
                  <Badge key={amenity} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
                {cardProperty.amenities.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{cardProperty.amenities.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {cardProperty.contact_number && (
              <Button size="sm" onClick={() => handleWhatsApp(cardProperty.contact_number)} className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            )}
            
            {cardProperty.google_map_link && (
              <Button size="sm" variant="outline" onClick={() => window.open(cardProperty.google_map_link, '_blank')}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}

            <Link to={`/property/${cardProperty.id}`} className="flex-1">
              <Button size="sm" variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleShare = () => {
    const shareText = createPropertyShareText(property);
    
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: shareText,
        url: window.location.href,
      });
    } else {
      const fullShareText = `${shareText}\n\n🔗 View Property: ${window.location.href}`;
      navigator.clipboard.writeText(fullShareText);
      toast({
        title: "Property details copied!",
        description: "Property details and link have been copied to your clipboard",
      });
    }
  };

  const createPropertyShareText = (property: Property) => {
    const highlights = property.highlights?.slice(0, 3).join('\n✓ ') || '';
    const amenities = property.amenities?.slice(0, 4).join(', ') || '';
    
    return `🏠 ${property.title}

💰 Price: ${formatPrice(property.price)}
📍 Location: ${property.location}, ${property.city}
🏢 Type: ${property.property_type}
${property.bhk ? `🛏️ BHK: ${property.bhk}` : ''}
${property.carpet_area ? `📐 Area: ${property.carpet_area} sq ft` : ''}
${property.built_year ? `📅 Built Year: ${property.built_year}` : property.construction_status ? `📅 Status: ${property.construction_status}` : ''}
${(property.facing || property.facing_direction || property.facing_direction_detailed) ? `🧭 Facing: ${property.facing || property.facing_direction || property.facing_direction_detailed}` : ''}
${property.furnishing ? `🪑 Furnishing: ${property.furnishing}` : ''}

${highlights ? `✨ Highlights:\n✓ ${highlights}` : ''}

${amenities ? `🎯 Amenities: ${amenities}` : ''}

${property.contact_number ? `📞 Contact: ${property.contact_number}` : ''}

${property.description ? `📋 Description:\n${property.description.slice(0, 150)}${property.description.length > 150 ? '...' : ''}` : ''}`;
  };

  const renderApartmentSpecificDetails = () => {
    if (!['apartment', 'flat'].includes(property.property_type.toLowerCase())) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Apartment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(property.floor || property.floor_number) && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{property.floor || property.floor_number}</div>
                <div className="text-sm text-muted-foreground">Floor</div>
              </div>
            )}
            {property.total_floors && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{property.total_floors}</div>
                <div className="text-sm text-muted-foreground">Total Floors</div>
              </div>
            )}
            {property.bhk && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{property.bhk}</div>
                <div className="text-sm text-muted-foreground">Bedrooms</div>
              </div>
            )}
            {property.bathrooms && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{property.bathrooms}</div>
                <div className="text-sm text-muted-foreground">Bathrooms</div>
              </div>
            )}
            {property.balconies !== undefined && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{property.balconies}</div>
                <div className="text-sm text-muted-foreground">Balconies</div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {property.society_name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Society Name:</span>
                <span className="font-medium">{property.society_name}</span>
              </div>
            )}
            {property.society_maintenance && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maintenance:</span>
                <span className="font-medium">₹{property.society_maintenance}/month</span>
              </div>
            )}
            {property.building_age && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Building Age:</span>
                <span className="font-medium">{property.building_age} years</span>
              </div>
            )}
            {property.lift_available !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lift Available:</span>
                <Badge variant={property.lift_available ? "default" : "secondary"}>
                  {property.lift_available ? t('yes') : t('no')}
                </Badge>
              </div>
            )}
            {property.modular_kitchen !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modular Kitchen:</span>
                <Badge variant={property.modular_kitchen ? "default" : "secondary"}>
                  {property.modular_kitchen ? t('yes') : t('no')}
                </Badge>
              </div>
            )}
            {property.wardrobes_count && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wardrobes:</span>
                <span className="font-medium">{property.wardrobes_count}</span>
              </div>
            )}
          </div>

          {property.view_description && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">View Description</h4>
              <p className="text-blue-700">{property.view_description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderHouseSpecificDetails = () => {
    if (!['house', 'villa', 'bungalow', 'independent house'].includes(property.property_type.toLowerCase())) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            House Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {property.plot_area && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{property.plot_area}</div>
                <div className="text-sm text-muted-foreground">Plot Area (sq ft)</div>
              </div>
            )}
            {property.built_up_area && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{property.built_up_area}</div>
                <div className="text-sm text-muted-foreground">Built-up Area (sq ft)</div>
              </div>
            )}
            {property.total_floors && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{property.total_floors}</div>
                <div className="text-sm text-muted-foreground">Floors</div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {property.boundary_wall !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Boundary Wall:</span>
                <Badge variant={property.boundary_wall ? "default" : "secondary"}>
                  {property.boundary_wall ? t('yes') : t('no')}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPlotSpecificDetails = () => {
    if (!['plot', 'land'].includes(property.property_type.toLowerCase())) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Plot Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {property.plot_area && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{property.plot_area}</div>
                <div className="text-sm text-muted-foreground">Total Area (sq ft)</div>
              </div>
            )}
            {property.plot_length && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{property.plot_length}</div>
                <div className="text-sm text-muted-foreground">Length (ft)</div>
              </div>
            )}
            {property.plot_width && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{property.plot_width}</div>
                <div className="text-sm text-muted-foreground">Width (ft)</div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {property.plot_corner !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Corner Plot:</span>
                <Badge variant={property.plot_corner ? "default" : "secondary"}>
                  {property.plot_corner ? "Yes" : "No"}
                </Badge>
              </div>
            )}
            {property.plot_shape && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plot Shape:</span>
                <span className="font-medium">{property.plot_shape}</span>
              </div>
            )}
            {property.zone_classification && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zone:</span>
                <Badge variant="outline">{property.zone_classification}</Badge>
              </div>
            )}
            {property.highway_connectivity && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Road Width:</span>
                <span className="font-medium">{property.highway_connectivity}</span>
              </div>
            )}
          </div>

          {property.development_permissions && property.development_permissions.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Development Permissions</h4>
              <div className="flex flex-wrap gap-2">
                {property.development_permissions.map((permission, index) => (
                  <Badge key={index} variant="outline">{permission}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCommercialSpecificDetails = () => {
    if (!['office', 'shop', 'commercial'].includes(property.property_type.toLowerCase())) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Commercial Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {property.property_type === 'office' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.cabin_count && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{property.cabin_count}</div>
                  <div className="text-sm text-muted-foreground">Cabins</div>
                </div>
              )}
              {property.conference_rooms && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{property.conference_rooms}</div>
                  <div className="text-sm text-muted-foreground">Conference Rooms</div>
                </div>
              )}
              {property.floor_number && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{property.floor_number}</div>
                  <div className="text-sm text-muted-foreground">Floor</div>
                </div>
              )}
            </div>
          )}

          {property.property_type === 'shop' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.front_footage && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{property.front_footage}</div>
                  <div className="text-sm text-muted-foreground">Front Footage (ft)</div>
                </div>
              )}
              {property.display_windows && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{property.display_windows}</div>
                  <div className="text-sm text-muted-foreground">Display Windows</div>
                </div>
              )}
              {property.foot_traffic_rating && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-xl font-bold text-primary capitalize">{property.foot_traffic_rating}</div>
                  <div className="text-sm text-muted-foreground">Foot Traffic</div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            {property.reception_area !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reception Area:</span>
                <Badge variant={property.reception_area ? "default" : "secondary"}>
                  {property.reception_area ? "Yes" : "No"}
                </Badge>
              </div>
            )}
            {property.building_grade && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Building Grade:</span>
                <Badge variant="outline">{property.building_grade}</Badge>
              </div>
            )}
          </div>

          {property.it_infrastructure && property.it_infrastructure.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">IT Infrastructure</h4>
              <div className="flex flex-wrap gap-2">
                {property.it_infrastructure.map((item, index) => (
                  <Badge key={index} variant="outline">{item}</Badge>
                ))}
              </div>
            </div>
          )}

          {property.business_licenses && property.business_licenses.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Business Licenses</h4>
              <div className="flex flex-wrap gap-2">
                {property.business_licenses.map((license, index) => (
                  <Badge key={index} variant="outline">{license}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderUtilitiesAndInfrastructure = () => {
    const hasUtilities = property.water_connection_type || property.electricity_load || 
                        property.sewerage_connection !== undefined || property.broadband_ready !== undefined ||
                        property.backup_power;

    if (!hasUtilities) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t('utilities_infrastructure')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.water_connection_type && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Droplets className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm text-blue-800 font-medium">{t('water_connection')}</div>
                  <div className="text-blue-700">{property.water_connection_type}</div>
                </div>
              </div>
            )}
            {property.electricity_load && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Zap className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="text-sm text-yellow-800 font-medium">{t('electricity_load')}</div>
                  <div className="text-yellow-700">{property.electricity_load} KW</div>
                </div>
              </div>
            )}
            {property.sewerage_connection !== undefined && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Droplets className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-sm text-green-800 font-medium">{t('sewerage_connection')}</div>
                  <div className="text-green-700">{property.sewerage_connection ? t('available') : t('not_available')}</div>
                </div>
              </div>
            )}
            {property.broadband_ready !== undefined && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Wifi className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-sm text-purple-800 font-medium">{t('broadband_ready')}</div>
                  <div className="text-purple-700">{property.broadband_ready ? t('yes') : t('no')}</div>
                </div>
              </div>
            )}
          </div>
          {property.backup_power && (
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-sm text-orange-800 font-medium">Power Backup</div>
              <div className="text-orange-700">{property.backup_power}</div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderLegalAndDocumentation = () => {
    const hasLegalInfo = property.title_deed_clear !== undefined || property.approvals_obtained?.length ||
                        property.survey_number || property.khata_number || property.revenue_records;

    if (!hasLegalInfo) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('legal_documentation')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {property.title_deed_clear !== undefined && (
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-800">{t('title_deed_clear')}</span>
                <Badge variant={property.title_deed_clear ? "default" : "destructive"}>
                  {property.title_deed_clear ? t('yes') : t('no')}
                </Badge>
              </div>
            )}
            {property.survey_number && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('survey_number')}:</span>
                <span className="font-medium">{property.survey_number}</span>
              </div>
            )}
            {property.khata_number && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('khata_number')}:</span>
                <span className="font-medium">{property.khata_number}</span>
              </div>
            )}
            {property.revenue_records && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('revenue_records')}:</span>
                <span className="font-medium">{property.revenue_records}</span>
              </div>
            )}
          </div>

          {property.approvals_obtained && property.approvals_obtained.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">{t('approvals_obtained')}</h4>
              <div className="flex flex-wrap gap-2">
                {property.approvals_obtained.map((approval, index) => (
                  <Badge key={index} variant="outline">{approval}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderInvestmentAndFinancial = () => {
    const hasFinancialInfo = property.ready_to_move !== undefined || property.possession_timeline ||
                            property.investment_potential || property.appreciation_forecast;

    if (!hasFinancialInfo) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('investment_financial_details')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {property.ready_to_move !== undefined && (
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-800">{t('ready_to_move')}</span>
                <Badge variant={property.ready_to_move ? "default" : "secondary"}>
                  {property.ready_to_move ? t('yes') : t('under_construction')}
                </Badge>
              </div>
            )}
            {property.possession_timeline && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('possession_timeline')}:</span>
                <span className="font-medium">{property.possession_timeline}</span>
              </div>
            )}
            {property.investment_potential && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-800 font-medium">{t('investment_potential')}</div>
                <div className="text-green-700">{property.investment_potential}</div>
              </div>
            )}
            {property.appreciation_forecast && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-800 font-medium">{t('appreciation_forecast')}</div>
                <div className="text-purple-700">{property.appreciation_forecast}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderConnectivityAndAccessibility = () => {
    const hasConnectivity = property.public_transport_distance || property.highway_connectivity ||
                           property.airport_distance || property.metro_connectivity;

    if (!hasConnectivity) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('connectivity_accessibility')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.public_transport_distance && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{property.public_transport_distance}</div>
                <div className="text-sm text-muted-foreground">{t('km_to_public_transport')}</div>
              </div>
            )}
            {property.airport_distance && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{property.airport_distance}</div>
                <div className="text-sm text-muted-foreground">{t('km_to_airport')}</div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {property.metro_connectivity && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('metro_connectivity')}:</span>
                <span className="font-medium">{property.metro_connectivity}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSecurityAndSafety = () => {
    const hasSecurity = property.security_features?.length || property.cctv_surveillance !== undefined ||
                       property.fire_safety_features?.length || property.earthquake_resistant !== undefined;

    if (!hasSecurity) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('security_safety')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {property.cctv_surveillance !== undefined && (
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-800">{t('cctv_surveillance')}</span>
                <Badge variant={property.cctv_surveillance ? "default" : "secondary"}>
                  {property.cctv_surveillance ? t('yes') : t('no')}
                </Badge>
              </div>
            )}
            {property.earthquake_resistant !== undefined && (
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-800">{t('earthquake_resistant')}</span>
                <Badge variant={property.earthquake_resistant ? "default" : "secondary"}>
                  {property.earthquake_resistant ? t('yes') : t('no')}
                </Badge>
              </div>
            )}
          </div>

          {property.security_features && property.security_features.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">{t('security_features')}</h4>
              <div className="flex flex-wrap gap-2">
                {property.security_features.map((feature, index) => (
                  <Badge key={index} variant="outline">{feature}</Badge>
                ))}
              </div>
            </div>
          )}

          {property.fire_safety_features && property.fire_safety_features.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">{t('fire_safety_features')}</h4>
              <div className="flex flex-wrap gap-2">
                {property.fire_safety_features.map((feature, index) => (
                  <Badge key={index} variant="outline">{feature}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const propertyStats = [
    { 
      icon: Bed, 
      label: t('bhk_label'), 
      value: property.bhk ? `${formatNumberWithLocale(property.bhk, language)} BHK` : 'N/A',
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      icon: Square, 
      label: t('carpet_area'), 
      value: property.carpet_area ? `${formatNumberWithLocale(property.carpet_area, language)} sq ft` : 'N/A',
      gradient: 'from-green-500 to-green-600'
    },
    { 
      icon: Home, 
      label: t('property_type'), 
      value: translateEnum(property.property_type as any, language),
      gradient: 'from-purple-500 to-purple-600'
    },
    { 
      icon: Calendar, 
      label: t('built_year'), 
      value: property.built_year ? `${formatNumberWithLocale(property.built_year, language)}` : property.construction_status || 'N/A',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Curved Background Elements */}
      <div className="absolute inset-0 opacity-30 overflow-hidden">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="detailsGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d="M0,200 Q250,50 500,150 T1000,100 L1000,0 L0,0 Z" fill="url(#detailsGradient1)" />
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/10 dark:bg-black/10 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between mb-8">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline" 
              size="sm" 
              className="rounded-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <ArrowLeft size={16} className="mr-2" />
              {t('back')}
            </Button>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground leading-tight">
                  <TranslatableText text={property.title} context={`property.title:${property.id}`} />
                </h1>
                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin size={18} className="mr-2 text-primary" />
                    <span className="font-medium">{translateEnum(property.location, language)}, {translateEnum(property.city, language)}</span>
                  </div>
                  {property.full_address && (
                    <div className="flex items-start mt-2">
                      <MapPin size={16} className="mr-2 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <span className="font-medium text-primary">Full Address:</span>
                        <p className="text-muted-foreground mt-1 leading-relaxed">{property.full_address}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={14} 
                        className="text-yellow-400" 
                        fill={star <= 4 ? "currentColor" : "none"}
                      />
                    ))}
                    <span className="ml-2 text-sm">4.0 (24 reviews)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:text-right space-y-4">
              <div className="text-3xl md:text-4xl lg:text-5xl font-light bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {formatPrice(property.price)}
              </div>
                {property.carpet_area && (
                  <div className="text-sm text-muted-foreground">
                    ₹{formatNumberWithLocale(Math.round(property.price / property.carpet_area), language)}/sq ft
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8 md:space-y-12">
            {/* Image Gallery */}
            <PropertyImageGallery 
              images={property.images || []} 
              title={property.title}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {propertyStats.map((stat, index) => (
                <Card 
                  key={index} 
                  className="border-0 bg-white/20 dark:bg-black/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group rounded-2xl"
                >
                  <CardContent className="p-4 md:p-6 text-center">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <stat.icon size={20} className="text-white" />
                    </div>
                    <div className="font-medium text-sm md:text-lg text-foreground mb-1">{stat.value}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Property Highlights */}
            {property.highlights && property.highlights.length > 0 && (
              <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl text-foreground flex items-center gap-2">
                    <TrendingUp size={24} className="text-primary" />
                    {t('property_highlights')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {property.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center p-3 md:p-4 bg-primary/5 rounded-xl border border-primary/20 hover:bg-primary/10 transition-colors">
                        <CheckCircle2 size={16} className="text-primary mr-3 flex-shrink-0" />
                        <span className="text-foreground font-medium text-sm md:text-base">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Property Details */}
            <div className="space-y-6">
              {/* About This Property */}
              <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl text-foreground">{t('about_property')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-lg">
                      <TranslatableText text={property.description || 'No description available for this property.'} context={`property.description:${property.id}`} />
                    </p>
                    
                    {/* Display full address if available */}
                    {property.full_address && (
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <h4 className="font-semibold text-primary mb-2 flex items-center">
                          <MapPin size={18} className="mr-2" />
                          Complete Address
                        </h4>
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                          {property.full_address}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="bg-white/10" />
                  
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[
                       { label: t('built_year'), value: property.built_year ? `${formatNumberWithLocale(property.built_year, language)}` : (property.construction_status === 'ready_to_move' ? t('ready_to_move') : property.construction_status) },
                       { label: t('property_age'), value: property.property_age },
                       { label: t('facing'), value: translateEnum((property.facing || property.facing_direction || property.facing_direction_detailed) as any, language) },
                       { label: t('floor_label'), value: property.floor || (property.floor_number ? `${formatNumberWithLocale(property.floor_number, language)}${property.total_floors ? ` of ${formatNumberWithLocale(property.total_floors, language)}` : ''}` : null) },
                       { label: t('bathrooms_label'), value: property.bathrooms ? `${formatNumberWithLocale(property.bathrooms, language)}` : null },
                       { label: t('furnishing'), value: property.furnishing ? translateEnum(property.furnishing as any, language) : (property.furnishing_detailed || null) },
                       { label: t('parking_type'), value: property.parking_type },
                       { label: t('parking_spaces'), value: property.parking_spaces !== null && property.parking_spaces !== undefined ? `${formatNumberWithLocale(property.parking_spaces, language)}` : null },
                       { label: t('transaction_type_label'), value: property.transaction_type || 'For Sale' },
                       { label: t('property_category_label'), value: property.property_category || 'Residential' },
                       { label: t('locality'), value: property.locality },
                       { label: t('pincode'), value: property.pincode ? formatNumberWithLocale(property.pincode, language) : null },
                       { label: t('construction_status'), value: property.construction_status },
                       { label: t('possession_status'), value: property.possession_status },
                       { label: t('property_condition'), value: property.property_condition },
                       { label: t('ownership_type'), value: property.ownership_type }
                     ].filter(spec => spec.value && spec.value !== 'N/A' && spec.value !== null && spec.value !== undefined).map((spec, index) => (
                      <div key={index} className="flex justify-between py-2 md:py-3 border-b border-border/30 last:border-b-0">
                        <span className="font-medium text-muted-foreground text-sm md:text-base">{spec.label}:</span>
                        <span className="text-foreground font-semibold text-sm md:text-base capitalize">{typeof spec.value === 'string' ? translateEnum(spec.value as any, language) : spec.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Property-specific details */}
              {renderApartmentSpecificDetails()}
              {renderHouseSpecificDetails()}
              {renderPlotSpecificDetails()}
              {renderCommercialSpecificDetails()}

              {/* Additional details */}
              {renderUtilitiesAndInfrastructure()}
              {renderLegalAndDocumentation()}
              {renderInvestmentAndFinancial()}
              {renderConnectivityAndAccessibility()}
              {renderSecurityAndSafety()}

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl text-foreground">{t('amenities_features')}</CardTitle>
                  </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {property.amenities.map((amenity, index) => (
                          <div 
                            key={index} 
                            className="inline-flex items-center justify-start px-4 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition-colors font-medium shadow-sm border border-border/50"
                          >
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center mr-3 shadow-sm">
                              <span className="text-primary-foreground text-xs font-bold">✓</span>
                            </div>
                            <span className="text-sm capitalize">{translateEnum(String(amenity).replace(/_/g, ' '), language)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <PropertyContactCard 
              property={property}
              onShare={handleShare}
            />
          </div>
        </div>

        {/* Similar Properties Section */}
        <div className="mt-16">
          <div className="border-t border-border/50 pt-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-semibold mb-2 text-foreground">Similar Properties</h3>
              <p className="text-muted-foreground">
                Properties you might also be interested in
              </p>
            </div>
            
            {loadingSimilar ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="h-48 bg-muted animate-pulse"></div>
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div className="h-6 bg-muted animate-pulse rounded"></div>
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                        <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : similarProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarProperties.map((similarProperty) => (
                  <PropertyCard key={similarProperty.id} property={similarProperty} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">
                  No similar properties found at the moment.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Check back later for new listings or browse all properties.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/search')}
                >
                  Browse All Properties
                </Button>
                
                {/* Test section to verify PropertyCard rendering */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-6 p-4 bg-muted/20 rounded-lg border border-border/30">
                    <p className="text-sm text-muted-foreground mb-3">
                      Test: Rendering a sample property card to verify component works
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <PropertyCard property={{
                        id: 'test-123',
                        title: 'Test Property',
                        price: 5000000,
                        location: 'Test Location',
                        city: 'Aurangabad',
                        property_type: 'flat',
                        transaction_type: 'buy',
                        property_category: 'residential',
                        property_subtype: 'flat',
                        listing_status: 'active',
                        approval_status: 'approved',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      } as Property} />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Debug information - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-muted/20 rounded-lg border border-border/30">
                <details className="text-sm text-muted-foreground">
                  <summary className="cursor-pointer font-medium">Debug Info</summary>
                  <div className="mt-2 space-y-1">
                    <div>Loading: {loadingSimilar ? 'Yes' : 'No'}</div>
                    <div>Similar Properties Count: {similarProperties.length}</div>
                    <div>Current Property ID: {property.id}</div>
                    <div>Transaction Type: {property.transaction_type}</div>
                    <div>Property Category: {property.property_category}</div>
                    <div>Property Subtype: {property.property_subtype}</div>
                    <div className="mt-3 space-y-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={fetchSimilarProperties}
                        disabled={loadingSimilar}
                      >
                        {loadingSimilar ? 'Loading...' : 'Refresh Similar Properties'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={async () => {
                          console.log('Testing database with minimal query...');
                          const { data, error } = await supabase
                            .from('properties')
                            .select('*')
                            .limit(5);
                          console.log('Minimal query result:', { data, error });
                          if (data && data.length > 0) {
                            console.log('Sample properties found:', data.slice(0, 2));
                          }
                        }}
                        className="ml-2"
                      >
                        Test DB Connection
                      </Button>
                    </div>
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};