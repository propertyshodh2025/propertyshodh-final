import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Filter, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateEnum } from '@/lib/staticTranslations';
import { AURANGABAD_AREAS } from '@/lib/aurangabadAreas';

interface SearchFilters {
  searchTerm: string;
  transactionType: string;
  propertyCategory: string;
  propertySubtype: string;
  city: string;
  location: string;
  bhkType: string;
  priceMin: string;
  priceMax: string;
}

interface LocationSuggestion {
  city: string;
  location: string;
  count: number;
}

export const SearchEngine: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { language, t } = useLanguage();
  
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    transactionType: '',
    propertyCategory: '',
    propertySubtype: '',
    city: '',
    location: '',
    bhkType: '',
    priceMin: '',
    priceMax: ''
  });
  
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [cityOptions, setCityOptions] = useState<string[]>([]);

  // Fetch location suggestions and city options
  useEffect(() => {
    fetchLocationData();
  }, []);

  // Initialize filters from URL params
  useEffect(() => {
    const transactionType = searchParams.get('transactionType') || searchParams.get('type') || '';
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const location = searchParams.get('location') || '';
    const propertyCategory = searchParams.get('propertyCategory') || '';
    const propertySubtype = searchParams.get('propertySubtype') || '';
    const bhkType = searchParams.get('bhkType') || searchParams.get('bhk') || '';
    const priceMin = searchParams.get('priceMin') || '';
    const priceMax = searchParams.get('priceMax') || '';

    setFilters({
      searchTerm: search,
      transactionType,
      propertyCategory,
      propertySubtype,
      city,
      location,
      bhkType,
      priceMin,
      priceMax
    });
  }, [searchParams]);

  const fetchLocationData = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('city, location')
        .eq('listing_status', 'active')
        .eq('approval_status', 'approved');

      if (error) throw error;

      // Extract unique cities
      const cities = [...new Set(data?.map(p => p.city).filter(Boolean))].sort();
      setCityOptions(cities);

      // Group by location and count properties
      const locationMap = new Map<string, LocationSuggestion>();
      
      data?.forEach(property => {
        if (property.city && property.location) {
          const key = `${property.city}-${property.location}`;
          if (locationMap.has(key)) {
            locationMap.get(key)!.count++;
          } else {
            locationMap.set(key, {
              city: property.city,
              location: property.location,
              count: 1
            });
          }
        }
      });

      setSuggestions(Array.from(locationMap.values()).sort((a, b) => b.count - a.count));
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  };

  // Debounced search suggestions
  const debouncedSearchSuggestions = useCallback(
    async (searchTerm: string) => {
      if (searchTerm.length < 2) {
        setSearchSuggestions([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('properties')
          .select('title, location, city, amenities')
          .eq('listing_status', 'active')
          .eq('approval_status', 'approved')
          .or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .limit(5);

        if (error) throw error;

        const uniqueSuggestions = new Set<string>();
        data?.forEach(property => {
          // Add location matches
          if (property.location && property.location.toLowerCase().includes(searchTerm.toLowerCase())) {
            uniqueSuggestions.add(property.location);
          }
          // Add city matches
          if (property.city && property.city.toLowerCase().includes(searchTerm.toLowerCase())) {
            uniqueSuggestions.add(property.city);
          }
          // Add title matches
          if (property.title && property.title.toLowerCase().includes(searchTerm.toLowerCase())) {
            uniqueSuggestions.add(property.title);
          }
        });

        setSearchSuggestions(Array.from(uniqueSuggestions).slice(0, 5));
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      }
    },
    []
  );

  // Handle search term changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.searchTerm) {
        debouncedSearchSuggestions(filters.searchTerm);
        setShowSuggestions(true);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters.searchTerm, debouncedSearchSuggestions]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (filters.searchTerm) params.set('search', filters.searchTerm);
    if (filters.transactionType) params.set('transactionType', filters.transactionType);
    if (filters.propertyCategory) params.set('propertyCategory', filters.propertyCategory);
    if (filters.propertySubtype) params.set('propertySubtype', filters.propertySubtype);
    if (filters.city) params.set('city', filters.city);
    if (filters.location) params.set('location', filters.location);
    if (filters.bhkType) params.set('bhkType', filters.bhkType);
    if (filters.priceMin) params.set('priceMin', filters.priceMin);
    if (filters.priceMax) params.set('priceMax', filters.priceMax);

    console.log('Search with filters:', filters);
    console.log('Search URL params:', params.toString());

    // Log user search activity
    if (filters.searchTerm || filters.city || filters.transactionType) {
      const logSearchActivity = async () => {
        try {
          await supabase.from('user_activities').insert({
            user_id: 'anonymous', // For now, using anonymous
            activity_type: 'search',
            search_query: filters.searchTerm,
            metadata: {
              filters: {
                transactionType: filters.transactionType,
                propertyCategory: filters.propertyCategory,
                propertySubtype: filters.propertySubtype,
                city: filters.city,
                location: filters.location,
                bhkType: filters.bhkType,
                priceRange: filters.priceMin && filters.priceMax ? `${filters.priceMin}-${filters.priceMax}` : null
              }
            }
          });
        } catch (error) {
          console.error('Error logging search activity:', error);
        }
      };
      logSearchActivity();
    }

    navigate(`/search?${params.toString()}`);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFilters(prev => ({ ...prev, searchTerm: suggestion }));
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      transactionType: '',
      propertyCategory: '',
      propertySubtype: '',
      city: '',
      location: '',
      bhkType: '',
      priceMin: '',
      priceMax: ''
    });
    navigate('/search');
  };

  const counts: Record<string, number> = {};
  suggestions.forEach(s => { counts[s.location] = s.count; });
  const filteredLocations = AURANGABAD_AREAS.map(loc => ({
    city: 'Aurangabad',
    location: loc,
    count: counts[loc] ?? 0,
  }));

  return (
    <Card className="w-full max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border-border/50">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Main search bar */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by location, property type, or keywords..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10 pr-4 h-12 text-base bg-background/50 border-border/50 focus:border-primary"
                onFocus={() => filters.searchTerm && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
            </div>
            
            {/* Search suggestions dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border/50 rounded-lg shadow-lg">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-2 first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <span>{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Transaction Type Filter */}
            <Select value={filters.transactionType} onValueChange={(value) => setFilters(prev => ({ ...prev, transactionType: value }))}>
              <SelectTrigger className="w-auto min-w-[120px]">
                <SelectValue placeholder="Buy/Rent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="lease">Lease</SelectItem>
              </SelectContent>
            </Select>

            {/* Property Category Filter */}
            <Select value={filters.propertyCategory} onValueChange={(value) => setFilters(prev => ({ ...prev, propertyCategory: value }))}>
              <SelectTrigger className="w-auto min-w-[120px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>

            {/* Property Subtype Filter */}
            <Select value={filters.propertySubtype} onValueChange={(value) => setFilters(prev => ({ ...prev, propertySubtype: value }))}>
              <SelectTrigger className="w-auto min-w-[120px]">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="bungalow">Bungalow</SelectItem>
                <SelectItem value="row_house">Row House</SelectItem>
                <SelectItem value="plot">Plot</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="shop">Shop</SelectItem>
                <SelectItem value="warehouse">Warehouse</SelectItem>
              </SelectContent>
            </Select>

            {/* City Filter */}
            <Select value={filters.city} onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}>
              <SelectTrigger className="w-auto min-w-[120px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Cities</SelectItem>
                {cityOptions.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* BHK Filter */}
            <Select value={filters.bhkType} onValueChange={(value) => setFilters(prev => ({ ...prev, bhkType: value }))}>
              <SelectTrigger className="w-auto min-w-[100px]">
                <SelectValue placeholder="BHK" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any BHK</SelectItem>
                <SelectItem value="1">1 BHK</SelectItem>
                <SelectItem value="2">2 BHK</SelectItem>
                <SelectItem value="3">3 BHK</SelectItem>
                <SelectItem value="4">4 BHK</SelectItem>
                <SelectItem value="5+">5+ BHK</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="border-border/50 bg-background/50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced
            </Button>
          </div>

          {/* Advanced filters */}
          {showAdvancedFilters && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Advanced Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Specific Location</label>
                  <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t('all_locations')}</SelectItem>
                      {filteredLocations.map(loc => (
                        <SelectItem key={`${loc.city}-${loc.location}`} value={loc.location}>
                          <div className="flex items-center justify-between w-full">
                            <span>{translateEnum(loc.location, language as any)}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {loc.count}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Min Price (₹)</label>
                  <Input
                    type="number"
                    placeholder="Min price"
                    value={filters.priceMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Max Price (₹)</label>
                  <Input
                    type="number"
                    placeholder="Max price"
                    value={filters.priceMax}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSearch}
              disabled={isLoading}
              className="flex-1 h-12 text-base font-medium"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Search className="w-5 h-5 mr-2" />
              )}
              Search Properties
            </Button>
            
            <Button
              variant="outline"
              onClick={clearFilters}
              className="h-12 px-6 border-border/50"
            >
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};