import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { PropertyFilters } from '@/components/PropertyFilters';

const Properties = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedBHK, setSelectedBHK] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('listing_status', 'Active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === 'all' || !selectedCity || property.city === selectedCity;
    const matchesType = selectedType === 'all' || !selectedType || property.property_type === selectedType;
    const matchesBHK = selectedBHK === 'all' || !selectedBHK || property.bhk?.toString() === selectedBHK;
    const matchesTransaction = selectedTransaction === 'all' || !selectedTransaction || property.transaction_type === selectedTransaction;
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || property.property_category === selectedCategory;
    
    let matchesPrice = true;
    if (priceRange && priceRange !== 'all') {
      const price = property.price;
      switch (priceRange) {
        case 'under-50':
          matchesPrice = price < 5000000;
          break;
        case '50-100':
          matchesPrice = price >= 5000000 && price <= 10000000;
          break;
        case '100-200':
          matchesPrice = price >= 10000000 && price <= 20000000;
          break;
        case 'above-200':
          matchesPrice = price > 20000000;
          break;
      }
    }

    return matchesSearch && matchesCity && matchesType && matchesBHK && matchesPrice && matchesTransaction && matchesCategory;
  });

  const uniqueCities = Array.from(new Set(properties.map(p => p.city).filter(Boolean))).sort();
  const uniqueTypes = Array.from(new Set(properties.map(p => p.property_type).filter(Boolean))).sort();
  const uniqueTransactions = Array.from(new Set(properties.map(p => p.transaction_type).filter(Boolean))).sort();
  const uniqueCategories = Array.from(new Set(properties.map(p => p.property_category).filter(Boolean))).sort();

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  const handleWhatsApp = (contactNumber?: string) => {
    if (contactNumber) {
      const cleanNumber = contactNumber.replace(/\D/g, '');
      window.open(`https://wa.me/91${cleanNumber}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 pt-28">
        <Header />
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center py-12">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <p className="text-muted-foreground text-lg animate-pulse">Loading amazing properties...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 pt-28">
      <Header />
      <div className="max-w-7xl mx-auto px-4">

        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            {t('properties_page.title')}
          </h1>
          <p className="text-muted-foreground text-lg">{t('properties_page.description')}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {filteredProperties.length} properties available • All categories: Residential, Commercial, Buy, Rent, Lease
          </div>
        </div>

        {/* Filters */}
        <PropertyFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedBHK={selectedBHK}
          setSelectedBHK={setSelectedBHK}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          selectedTransaction={selectedTransaction}
          setSelectedTransaction={setSelectedTransaction}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          uniqueCities={uniqueCities}
          uniqueTypes={uniqueTypes}
          uniqueTransactions={uniqueTransactions}
          uniqueCategories={uniqueCategories}
        />

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property, index) => (
            <Card 
              key={property.id} 
              className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border-border/50 animate-fade-in group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-0">
                {/* Image Display */}
                <div className="h-48 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
                  {property.images && property.images.length > 0 ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280">Property Image</text></svg>';
                      }}
                    />
                  ) : (
                    <span className="text-muted-foreground">Property Image</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold line-clamp-2">{property.title}</h3>
                    <div className="flex gap-1 flex-col">
                      <Badge variant="secondary" className="text-xs">{property.property_type}</Badge>
                      <Badge variant="outline" className="text-xs">{property.transaction_type}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.location}, {property.city}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <span className="font-semibold text-lg">{formatPrice(property.price)}</span>
                    </div>
                    
                    {property.bhk && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">BHK:</span>
                        <span>{property.bhk} BHK</span>
                      </div>
                    )}
                    
                    {property.carpet_area && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Area:</span>
                        <span>{property.carpet_area} sq ft</span>
                      </div>
                    )}

                    {property.possession_status && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Possession:</span>
                        <span>{property.possession_status}</span>
                      </div>
                    )}
                  </div>

                  {property.amenities && property.amenities.length > 0 && (
                    <div className="mb-4">
                      <span className="text-sm text-muted-foreground mb-2 block">Amenities:</span>
                      <div className="flex flex-wrap gap-1">
                        {property.amenities.slice(0, 3).map(amenity => (
                          <Badge key={amenity} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {property.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{property.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {property.contact_number && (
                      <Button
                        size="sm"
                        onClick={() => handleWhatsApp(property.contact_number)}
                        className="flex-1"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                    )}
                    
                    {property.google_map_link && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(property.google_map_link, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/property/${property.id}`)}
                      className="flex-1"
                    >
                      {t('view_details')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No properties found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;