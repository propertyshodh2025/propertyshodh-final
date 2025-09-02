import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Grid3X3, List, Filter, Search, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { PropertyFilters } from '@/components/PropertyFilters';
import { MiniFeaturedCarousel } from '@/components/MiniFeaturedCarousel';
import PropertyCard from '@/components/PropertyCard'; // Import the new PropertyCard
import SimilarPropertiesSection from '@/components/SimilarPropertiesSection'; // Import the new SimilarPropertiesSection

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('latest');
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
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
      let query = supabase.from('properties').select('*').in('approval_status', ['approved', 'pending']).eq('listing_status', 'Active');

      const transactionType = searchParams.get('transactionType') || searchParams.get('type');
      if (transactionType && transactionType !== 'all') {
        query = query.eq('transaction_type', transactionType);
      }

      const propertyCategory = searchParams.get('propertyCategory') || searchParams.get('category');
      if (propertyCategory && propertyCategory.trim() && propertyCategory !== 'all') {
        query = query.eq('property_category', propertyCategory);
      }

      const propertySubtype = searchParams.get('propertySubtype') || searchParams.get('subtype');
      if (propertySubtype && propertySubtype.trim() && propertySubtype !== 'all') {
        query = query.or(`property_subtype.eq.${propertySubtype},property_subtype.is.null`);
      }

      const bhkType = searchParams.get('bhkType') || searchParams.get('bhk');
      if (bhkType && bhkType.trim() && bhkType !== 'all' && (!propertyCategory || propertyCategory === 'residential')) {
        query = query.or(`bhk_type.eq.${bhkType},bhk_type.is.null,bhk.eq.${bhkType}`);
      }

      const searchTermParam = searchParams.get('search');
      if (searchTermParam && searchTermParam.trim()) {
        const searchValue = searchTermParam.trim().toLowerCase();
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

        const matchingTypes = propertyTypeMap[searchValue];
        if (matchingTypes) {
          const typeConditions = matchingTypes.map(type => `property_type.ilike.%${type}%`).join(',');
          query = query.or(typeConditions);
        } else {
          query = query.or(`location.ilike.%${searchValue}%,city.ilike.%${searchValue}%,title.ilike.%${searchValue}%`);
        }
      }

      const city = searchParams.get('city');
      if (city && city.trim()) {
        query = query.ilike('city', `%${city}%`);
      }

      const location = searchParams.get('location');
      if (location && location.trim()) {
        query = query.ilike('location', `%${location}%`);
      }

      const priceMin = searchParams.get('priceMin');
      const priceMax = searchParams.get('priceMax');
      if (priceMin && !isNaN(Number(priceMin))) {
        query = query.gte('price', Number(priceMin));
      }
      if (priceMax && !isNaN(Number(priceMax))) {
        query = query.lte('price', Number(priceMax));
      }

      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
        break;
    }
    setFilteredProperties(filtered);
  }, [properties, searchParams, searchTerm, selectedCity, selectedType, selectedBHK, selectedTransaction, selectedCategory, priceRange, sortBy]);

  const currentSearchTerm = searchParams.get('search') || '';
  const currentTransactionType = searchParams.get('transactionType') || 'buy';
  const currentPropertyCategory = searchParams.get('propertyCategory') || searchParams.get('category') || '';
  const currentPropertySubtype = searchParams.get('propertySubtype') || searchParams.get('subtype') || '';
  const currentCity = searchParams.get('city') || '';
  const currentLocation = searchParams.get('location') || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-28">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">Loading properties...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-28">
      <Header />
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
              
              <div className="flex bg-muted/50 rounded-lg p-1 border border-border/50">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm border border-border/50' : 'hover:bg-background/50'}`}>
                  <Grid3X3 size={16} className="text-foreground" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-background shadow-sm border border-border/50' : 'hover:bg-background/50'}`}>
                  <List size={16} className="text-foreground" />
                </button>
              </div>
              
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
            uniqueCities={Array.from(new Set(properties.map(p => p.city).filter(Boolean))).sort()}
            uniqueTypes={Array.from(new Set(properties.map(p => p.property_type).filter(Boolean))).sort()}
            uniqueTransactions={Array.from(new Set(properties.map(p => p.transaction_type).filter(Boolean))).sort()}
            uniqueCategories={Array.from(new Set(properties.map(p => p.property_category).filter(Boolean))).sort()}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onClearFilters={() => {
              setSearchTerm('');
              setSelectedCity('all');
              setSelectedType('all');
              setSelectedBHK('all');
              setPriceRange('all');
              setSelectedTransaction('all');
              setSelectedCategory('all');
            }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredProperties.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-6 text-foreground">Search Results</h2>
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        ) : (
          !loading && (
            <div className="text-center py-16">
              <div className="bg-muted/30 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-foreground">No Properties Found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                We couldn't find any properties matching your exact search criteria.
              </p>
              
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
              <div className="mb-12">
                <SimilarPropertiesSection
                  currentPropertyId="" // No specific current property for search results page
                  propertyType={selectedType !== 'all' ? selectedType : undefined}
                  propertyCategory={selectedCategory !== 'all' ? selectedCategory : undefined}
                  transactionType={selectedTransaction !== 'all' ? selectedTransaction : undefined}
                  location={currentLocation || undefined}
                  city={currentCity || undefined}
                />
              </div>

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
            </div>
          )
        )}

        {filteredProperties.length > 0 && (
          <div className="mt-16">
            <div className="border-t border-border/50 pt-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold mb-2 text-foreground">Featured Properties</h3>
                <p className="text-muted-foreground">
                  Explore our handpicked featured properties
                </p>
              </div>
              <MiniFeaturedCarousel />
            </div>
          </div>
        )}

        {filteredProperties.length > 0 && (
          <div className="text-center mt-12 my-[60px] py-[60px]">
            <Link to="/properties">
              <Button variant="outline" size="lg" className="border-border/50 bg-background/80 backdrop-blur-sm hover:bg-background px-8 py-3 text-lg">
                Load More Properties
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;