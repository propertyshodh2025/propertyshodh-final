import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Grid3X3, List, Filter, MapPin, Bed, Bath, Square, Heart, Share2, ArrowUpDown, X, Phone, ExternalLink, Search, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { InterestButton } from '@/components/InterestButton';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { PropertyFilters } from '@/components/PropertyFilters';
import { MiniFeaturedCarousel } from '@/components/MiniFeaturedCarousel';
const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('latest');
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedBHK, setSelectedBHK] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  useEffect(() => {
    fetchProperties();
  }, [searchParams]);
  const fetchProperties = async () => {
    try {
      setLoading(true);
      console.log('=== SEARCH DEBUG START ===');
      console.log('Search params:', Object.fromEntries(searchParams.entries()));
      let query = supabase.from('properties').select('*').in('approval_status', ['approved', 'pending']).eq('listing_status', 'Active');
      console.log('Base query setup - looking for approved/pending & Active properties');

      // Transaction type filter (buy/rent/lease) - this is the primary filter
      const transactionType = searchParams.get('transactionType') || searchParams.get('type');
      if (transactionType && transactionType !== 'all') {
        console.log('Applying transaction type filter:', transactionType);
        query = query.eq('transaction_type', transactionType);
      }

      // Property category filter (residential/commercial)
      const propertyCategory = searchParams.get('propertyCategory') || searchParams.get('category');
      if (propertyCategory && propertyCategory.trim() && propertyCategory !== 'all') {
        console.log('Applying property category filter:', propertyCategory);
        query = query.eq('property_category', propertyCategory);
      }

      // Property subtype filter (flat/villa/bungalow/etc) - handle null values
      const propertySubtype = searchParams.get('propertySubtype') || searchParams.get('subtype');
      if (propertySubtype && propertySubtype.trim() && propertySubtype !== 'all') {
        console.log('Applying property subtype filter:', propertySubtype);
        // Use OR condition to include null values for broader search
        query = query.or(`property_subtype.eq.${propertySubtype},property_subtype.is.null`);
      }

      // BHK filter - only apply for residential properties
      const bhkType = searchParams.get('bhkType') || searchParams.get('bhk');
      if (bhkType && bhkType.trim() && bhkType !== 'all' && (!propertyCategory || propertyCategory === 'residential')) {
        console.log('Applying BHK type filter:', bhkType, 'for residential properties only');
        query = query.or(`bhk_type.eq.${bhkType},bhk_type.is.null,bhk.eq.${bhkType}`);
      }

      // Search term - intelligent search with property type priority
      const searchTerm = searchParams.get('search');
      if (searchTerm && searchTerm.trim()) {
        const searchValue = searchTerm.trim().toLowerCase();
        console.log('Applying search term:', searchValue);

        // Define property type mappings for intelligent search
        const propertyTypeMap: Record<string, string[]> = {
          'house': ['House', 'Villa', 'Bungalow', 'Independent House'],
          'apartment': ['Apartment', 'Flat'],
          'flat': ['Flat', 'Apartment'],
          'villa': ['Villa', 'House', 'Bungalow'],
          'bungalow': ['Bungalow', 'Villa', 'House'],
          'office': ['Office', 'Commercial'],
          'shop': ['Shop', 'Commercial'],
          'plot': ['Plot', 'Land'],
          'land': ['Land', 'Plot']
        };

        // Check if search term matches a property type
        const matchingTypes = propertyTypeMap[searchValue];
        if (matchingTypes) {
          console.log('Property type search detected, filtering by types:', matchingTypes);
          // Create OR conditions for matching property types
          const typeConditions = matchingTypes.map(type => `property_type.ilike.%${type}%`).join(',');
          query = query.or(typeConditions);
        } else {
          // General search in location, city, and title
          query = query.or(`location.ilike.%${searchValue}%,city.ilike.%${searchValue}%,title.ilike.%${searchValue}%`);
        }
      }

      // City filter
      const city = searchParams.get('city');
      if (city && city.trim()) {
        console.log('Applying city filter:', city);
        query = query.ilike('city', `%${city}%`);
      }

      // Location filter
      const location = searchParams.get('location');
      if (location && location.trim()) {
        console.log('Applying location filter:', location);
        query = query.ilike('location', `%${location}%`);
      }

      // Price range filter
      const priceMin = searchParams.get('priceMin');
      const priceMax = searchParams.get('priceMax');
      if (priceMin && !isNaN(Number(priceMin))) {
        console.log('Applying min price filter:', priceMin);
        query = query.gte('price', Number(priceMin));
      }
      if (priceMax && !isNaN(Number(priceMax))) {
        console.log('Applying max price filter:', priceMax);
        query = query.lte('price', Number(priceMax));
      }

      // Order by created_at desc to show newest first
      query = query.order('created_at', {
        ascending: false
      });
      console.log('Executing search query...');
      console.log('Final query before execution - this is critical to debug');
      const {
        data,
        error
      } = await query;
      if (error) {
        console.error('Supabase query error:', error);
        console.log('ERROR DETAILS:', JSON.stringify(error, null, 2));
        throw error;
      }
      console.log('Query executed successfully!');
      console.log('Fetched properties:', data?.length || 0, 'properties');
      console.log('=== SEARCH DEBUG END ===');
      if (data && data.length > 0) {
        console.log('Sample property:', data[0]);
      } else {
        console.log('NO PROPERTIES RETURNED - This is the issue!');
        console.log('Let me test a simple query...');

        // Test simple query to see if any properties exist at all
        const {
          data: testData,
          error: testError
        } = await supabase.from('properties').select('id, title, listing_status, approval_status').limit(3);
        console.log('TEST QUERY - Raw properties:', testData?.length || 0);
        if (testData) {
          console.log('TEST QUERY - Sample properties:', testData);
        }
        if (testError) {
          console.log('TEST QUERY ERROR:', testError);
        }
      }
      setProperties(data || []);

      // Always fetch similar properties to show additional recommendations
      console.log('Fetching similar properties for additional recommendations...');
      await fetchSimilarProperties();
    } catch (error) {
      console.error('Error fetching properties:', error);

      // Try to fetch similar properties even if main query fails
      console.log('Main query failed, attempting to fetch similar properties...');
      await fetchSimilarProperties();
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchSimilarProperties = async () => {
    try {
      console.log('=== SIMILAR PROPERTIES DEBUG START ===');
      console.log('Fetching similar properties...');
      const searchTerm = searchParams.get('search');
      const transactionType = searchParams.get('transactionType') || 'buy';
      const propertyCategory = searchParams.get('propertyCategory') || searchParams.get('category');
      const propertySubtype = searchParams.get('propertySubtype');
      const bhkType = searchParams.get('bhkType');
      
      console.log('Similar properties filters:', {
        searchTerm,
        transactionType,
        propertyCategory,
        propertySubtype,
        bhkType
      });

      // Strategy 1: Try with same category first
      let similarQuery = supabase
        .from('properties')
        .select('*')
        .in('approval_status', ['approved', 'pending'])
        .eq('listing_status', 'Active')
        .eq('transaction_type', transactionType);

      if (propertyCategory && propertyCategory !== 'all') {
        similarQuery = similarQuery.eq('property_category', propertyCategory);
      }

      // Don't apply search term filter for similar properties - be more flexible
      similarQuery = similarQuery.limit(12).order('created_at', { ascending: false });
      
      console.log('Executing similar properties query (Strategy 1)...');
      let { data: similarData, error: similarError } = await similarQuery;
      
      if (similarError) {
        console.error('Error in Strategy 1:', similarError);
      }
      
      console.log('Strategy 1 results:', similarData?.length || 0);

      // Strategy 2: If no results, try without category restriction
      if (!similarData || similarData.length === 0) {
        console.log('Strategy 1 failed, trying Strategy 2 (without category restriction)...');
        similarQuery = supabase
          .from('properties')
          .select('*')
          .in('approval_status', ['approved', 'pending'])
          .eq('listing_status', 'Active')
          .eq('transaction_type', transactionType)
          .limit(12)
          .order('created_at', { ascending: false });
          
        const result = await similarQuery;
        similarData = result.data;
        similarError = result.error;
        console.log('Strategy 2 results:', similarData?.length || 0);
      }

      // Strategy 3: If still no results, try any transaction type
      if (!similarData || similarData.length === 0) {
        console.log('Strategy 2 failed, trying Strategy 3 (any transaction type)...');
        similarQuery = supabase
          .from('properties')
          .select('*')
          .in('approval_status', ['approved', 'pending'])
          .eq('listing_status', 'Active')
          .limit(12)
          .order('created_at', { ascending: false });
          
        const result = await similarQuery;
        similarData = result.data;
        similarError = result.error;
        console.log('Strategy 3 results:', similarData?.length || 0);
      }

      if (similarError) {
        console.error('Final error fetching similar properties:', similarError);
        setSimilarProperties([]);
        return;
      }

      // Filter out exact matches from the main search results
      let filteredSimilar = similarData || [];
      
      // Remove properties that are already in the main results
      const mainPropertyIds = properties.map(p => p.id);
      filteredSimilar = filteredSimilar.filter(prop => !mainPropertyIds.includes(prop.id));
      
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
    }
  };
  useEffect(() => {
    // Apply comprehensive filtering similar to Properties page
    let filtered = properties.filter(property => {
      const matchesSearch = searchTerm === '' || property.title.toLowerCase().includes(searchTerm.toLowerCase()) || property.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = selectedCity === 'all' || !selectedCity || property.location === selectedCity;
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

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'area':
        filtered.sort((a, b) => (Number(b.carpet_area) || 0) - (Number(a.carpet_area) || 0));
        break;
      default:
        // Keep original order for 'latest'
        break;
    }
    setFilteredProperties(filtered);
  }, [properties, searchParams, searchTerm, selectedCity, selectedType, selectedBHK, selectedTransaction, selectedCategory, priceRange, sortBy]);
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

  // Filter similar properties to exclude duplicates from main results
  const uniqueSimilarProperties = similarProperties.filter(similarProp => !filteredProperties.some(mainProp => mainProp.id === similarProp.id));
  const PropertyCard = ({
    property
  }: {
    property: Property;
  }) => {
    return <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card border-border/50 hover:border-primary/20">
        <div className="relative">
          {/* Property Image */}
          {property.images && property.images.length > 0 ? <img src={property.images[0]} alt={property.title} className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105" onError={e => {
          e.currentTarget.src = '/placeholder.svg';
        }} /> : <div className="h-48 bg-muted flex items-center justify-center">
              <Home className="w-12 h-12 text-muted-foreground" />
            </div>}
          <div className="absolute top-3 right-3 flex gap-2">
            <div className="rounded-full bg-background/90 backdrop-blur-sm shadow-md">
              <InterestButton propertyId={property.id} propertyTitle={property.title} variant="outline" size="sm" className="p-2 rounded-full hover:bg-background/50" />
            </div>
            <button className="p-2 bg-background/90 backdrop-blur-sm rounded-full hover:bg-background transition-colors shadow-md" onClick={() => {
            const propertyUrl = `${window.location.origin}/property/${property.id}`;
            if (navigator.share) {
              navigator.share({
                title: property.title,
                text: `Check out this property: ${property.title}`,
                url: propertyUrl
              });
            } else {
              navigator.clipboard.writeText(propertyUrl);
              toast({
                title: "Link Copied!",
                description: "Property link copied to clipboard"
              });
            }
          }}>
              <Share2 size={16} className="text-blue-500" />
            </button>
          </div>
          <div className="absolute top-3 left-3">
            <Badge variant={property.listing_status === 'Active' ? 'default' : 'secondary'}>
              {property.listing_status}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-5">
          <div className="mb-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent dark:from-green-400 dark:to-green-500">
              {formatPrice(property.price)}
            </span>
          </div>
          
          <h3 className="font-semibold text-lg mb-3 line-clamp-2 text-foreground hover:text-primary transition-colors">
            {property.title}
          </h3>
          
          <div className="flex items-center text-muted-foreground mb-4">
            <MapPin size={16} className="mr-2 text-primary" />
            <span className="text-sm font-medium">{property.location}, {property.city}</span>
          </div>
          
          <div className="flex items-center justify-between mb-4 text-sm">
            {property.bhk && <div className="flex items-center text-muted-foreground">
                <Bed size={16} className="mr-1 text-blue-500" />
                <span className="font-medium">{property.bhk} BHK</span>
              </div>}
            {property.carpet_area && <div className="flex items-center text-muted-foreground">
                <Square size={16} className="mr-1 text-purple-500" />
                <span className="font-medium">{property.carpet_area} sq ft</span>
              </div>}
          </div>
          
          <div className="flex gap-2 mb-4">
            <Badge variant="outline" className="text-xs">
              {property.property_type}
            </Badge>
            {property.possession_status && <Badge variant="outline" className="text-xs">
                {property.possession_status}
              </Badge>}
          </div>

          {property.amenities && property.amenities.length > 0 && <div className="mb-4">
              <span className="text-sm text-muted-foreground mb-2 block">Amenities:</span>
              <div className="flex flex-wrap gap-1">
                {property.amenities.slice(0, 3).map(amenity => <Badge key={amenity} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>)}
                {property.amenities.length > 3 && <Badge variant="outline" className="text-xs">
                    +{property.amenities.length - 3} more
                  </Badge>}
              </div>
            </div>}

          <div className="flex gap-2">
            {property.contact_number && <Button size="sm" onClick={() => handleWhatsApp(property.contact_number)} className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>}
            
            {property.google_map_link && <Button size="sm" variant="outline" onClick={() => window.open(property.google_map_link, '_blank')}>
                <ExternalLink className="h-4 w-4" />
              </Button>}

            <Link to={`/property/${property.id}`} className="flex-1">
              <Button size="sm" variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>;
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-28">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">Loading properties...</div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-28">
      <Header />
      {/* Header */}

      <div className="bg-card/80 backdrop-blur-sm shadow-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Home size={16} />
                    Home
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Property Search Results
                  </h1>
                  <p className="text-muted-foreground mt-1 font-medium">
                    {filteredProperties.length} properties found
                  </p>
                </div>
              </div>
              <div className="md:hidden">
                <ThemeToggle />
              </div>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex bg-muted/50 rounded-lg p-1 border border-border/50">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm border border-border/50' : 'hover:bg-background/50'}`}>
                  <Grid3X3 size={16} className="text-foreground" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-background shadow-sm border border-border/50' : 'hover:bg-background/50'}`}>
                  <List size={16} className="text-foreground" />
                </button>
              </div>
              
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-background/80 border-border/50 backdrop-blur-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-sm border-border/50">
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="area">Area</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="flex items-center gap-2 border-border/50 bg-background/80 backdrop-blur-sm hover:bg-background" onClick={() => setShowFilters(!showFilters)}>
                <Filter size={16} />
                Filters
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          <PropertyFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedCity={selectedCity} setSelectedCity={setSelectedCity} selectedType={selectedType} setSelectedType={setSelectedType} selectedBHK={selectedBHK} setSelectedBHK={setSelectedBHK} priceRange={priceRange} setPriceRange={setPriceRange} selectedTransaction={selectedTransaction} setSelectedTransaction={setSelectedTransaction} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} uniqueCities={Array.from(new Set(properties.map(p => p.city).filter(Boolean))).sort()} uniqueTypes={Array.from(new Set(properties.map(p => p.property_type).filter(Boolean))).sort()} uniqueTransactions={Array.from(new Set(properties.map(p => p.transaction_type).filter(Boolean))).sort()} uniqueCategories={Array.from(new Set(properties.map(p => p.property_category).filter(Boolean))).sort()} showFilters={showFilters} onToggleFilters={() => setShowFilters(!showFilters)} onClearFilters={() => {
          setSearchTerm('');
          setSelectedCity('all');
          setSelectedType('all');
          setSelectedBHK('all');
          setPriceRange('all');
          setSelectedTransaction('all');
          setSelectedCategory('all');
        }} />
        </div>
      </div>

      {/* Search Results Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredProperties.length > 0 ? <div>
            <h2 className="text-xl font-semibold mb-6 text-foreground">Search Results</h2>
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredProperties.map(property => <PropertyCard key={property.id} property={property} />)}
            </div>
          </div> : !loading && <div className="text-center py-16">
            <div className="bg-muted/30 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-foreground">No Properties Found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              We couldn't find any properties matching your exact search criteria.
            </p>
            

            {/* Search Suggestions */}
            <div className="space-y-4 mb-8">
              <p className="text-sm text-muted-foreground">Search suggestions:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => window.location.href = '/search?transactionType=buy&search=CIDCO'}>
                  CIDCO Properties
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => window.location.href = '/search?transactionType=buy&category=residential'}>
                  Residential Properties
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => window.location.href = '/search?transactionType=buy&category=commercial'}>
                  Commercial Properties
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => window.location.href = '/search?transactionType=buy&bhkType=2'}>
                  2 BHK
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => window.location.href = '/search?transactionType=buy'}>
                  All Properties
                </Badge>
              </div>
            </div>

            {/* Similar Properties Section */}
            {uniqueSimilarProperties.length > 0 && <div className="mb-12">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold mb-2 text-foreground">Similar Properties</h3>
                  <p className="text-muted-foreground">
                    These properties might interest you based on your search
                  </p>
                </div>
                
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {uniqueSimilarProperties.map(property => <PropertyCard key={property.id} property={property} />)}
                </div>
              </div>}

            {/* Featured Properties Marquee Section */}
            <div className="mb-12 my-[150px]">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold mb-2 text-foreground">Featured Properties</h3>
                <p className="text-muted-foreground">
                  Explore our handpicked featured properties
                </p>
              </div>
              <MiniFeaturedCarousel />
            </div>

            {/* Load More Properties Button */}
            <div className="text-center my-[150px]">
              <Link to="/properties">
                <Button variant="default" size="lg" className="px-8 py-3 text-lg">
                  Load More Properties
                </Button>
              </Link>
            </div>
          </div>}

        
        {/* Featured Properties Section - shown before Load More button */}
        {filteredProperties.length > 0 && <div className="mt-16">
            <div className="border-t border-border/50 pt-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold mb-2 text-foreground">Featured Properties</h3>
                <p className="text-muted-foreground">
                  Explore our handpicked featured properties
                </p>
              </div>
              <MiniFeaturedCarousel />
            </div>
          </div>}

        {filteredProperties.length > 0 && <div className="text-center mt-12 my-[60px] py-[60px]">
            <Link to="/properties">
              <Button variant="outline" size="lg" className="border-border/50 bg-background/80 backdrop-blur-sm hover:bg-background px-8 py-3 text-lg">
                Load More Properties
              </Button>
            </Link>
          </div>}
      </div>
    </div>;
};
export default SearchResults;