import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Building2, TreePine, Home, MapPin, IndianRupee } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface PropertyCounts {
  total: number;
  priceRanges: Record<string, number>;
  locations: Record<string, number>;
}

interface PropertyCounterData {
  residential: PropertyCounts;
  commercial: PropertyCounts;
  agricultural: PropertyCounts;
}

const PropertyCounter: React.FC = () => {
  const { t } = useLanguage();
  const [propertyData, setPropertyData] = useState<PropertyCounterData | null>(null);
  const [loading, setLoading] = useState(true);

  // Price ranges configuration
  const priceRanges = [
    { key: '10L-30L', label: '10L - 30L', min: 1000000, max: 3000000 },
    { key: '30L-50L', label: '30L - 50L', min: 3000000, max: 5000000 },
    { key: '50L-1Cr', label: '50L - 1Cr', min: 5000000, max: 10000000 },
    { key: '1Cr-5Cr', label: '1Cr - 5Cr', min: 10000000, max: 50000000 },
    { key: '5Cr+', label: '5Cr & Above', min: 50000000, max: null }
  ];

  // Top locations for each category
  const locationsByCategory = {
    residential: ['CIDCO', 'Garkheda', 'Osmanpura', 'Bajaj Nagar', 'Kanchanwadi'],
    commercial: ['CIDCO', 'Station Road', 'Jalna Road', 'Town Center', 'Osmanpura'],
    agricultural: ['Beed Road', 'Jalna Road', 'Paithan Road', 'Sillod Road', 'Kannad Road']
  };

  useEffect(() => {
    const fetchPropertyCounts = async () => {
      try {
        const categories = ['residential', 'commercial', 'agricultural'];
        const data: PropertyCounterData = {
          residential: { total: 0, priceRanges: {}, locations: {} },
          commercial: { total: 0, priceRanges: {}, locations: {} },
          agricultural: { total: 0, priceRanges: {}, locations: {} }
        };

        for (const category of categories) {
          // Get total count for this category
          const { count: totalCount } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('property_category', category)
            .eq('listing_status', 'Active');

          data[category as keyof PropertyCounterData].total = totalCount || 0;

          // Get price range counts
          for (const range of priceRanges) {
            let query = supabase
              .from('properties')
              .select('*', { count: 'exact', head: true })
              .eq('property_category', category)
              .eq('listing_status', 'Active')
              .gte('price', range.min);

            if (range.max !== null) {
              query = query.lt('price', range.max);
            }

            const { count } = await query;
            data[category as keyof PropertyCounterData].priceRanges[range.key] = count || 0;
          }

          // Get location counts
          const locations = locationsByCategory[category as keyof typeof locationsByCategory];
          for (const location of locations) {
            const { count } = await supabase
              .from('properties')
              .select('*', { count: 'exact', head: true })
              .eq('property_category', category)
              .eq('listing_status', 'Active')
              .ilike('location', `%${location}%`);

            data[category as keyof PropertyCounterData].locations[location] = count || 0;
          }
        }

        setPropertyData(data);
      } catch (error) {
        console.error('Error fetching property counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyCounts();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'residential':
        return Home;
      case 'commercial':
        return Building2;
      case 'agricultural':
        return TreePine;
      default:
        return Building2;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'residential':
        return 'from-blue-500 to-blue-600';
      case 'commercial':
        return 'from-green-500 to-green-600';
      case 'agricultural':
        return 'from-emerald-500 to-emerald-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'residential':
        return 'Total Residential Property';
      case 'commercial':
        return 'Total Commercial Property';
      case 'agricultural':
        return 'Total Agricultural Property';
      default:
        return 'Total Property';
    }
  };

  const buildSearchUrl = (category: string, filter?: { type?: string; priceRange?: string; location?: string }) => {
    const searchParams = new URLSearchParams();
    searchParams.set('category', category);
    
    if (filter?.priceRange) {
      const range = priceRanges.find(r => r.key === filter.priceRange);
      if (range) {
        searchParams.set('minPrice', range.min.toString());
        if (range.max) {
          searchParams.set('maxPrice', range.max.toString());
        }
      }
    }
    
    if (filter?.location) {
      searchParams.set('location', filter.location);
    }

    return `/search?${searchParams.toString()}`;
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Property Availability</h2>
            <p className="text-muted-foreground mt-2">Loading property data...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm animate-pulse">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-muted rounded-full mb-4"></div>
                  <div className="h-8 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!propertyData) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Live Property Data</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Total Property For Sale
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover available properties across different categories and price ranges in Aurangabad
          </p>
        </div>

        {/* Property Counter Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(propertyData).map(([category, counts], index) => {
            const IconComponent = getCategoryIcon(category);
            const colorClass = getCategoryColor(category);
            const label = getCategoryLabel(category);

            return (
              <Card 
                key={category} 
                className="group bg-card/50 backdrop-blur-sm border-0 hover:bg-card/80 transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <CardContent className="p-6">
                  {/* Icon and Count */}
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colorClass} p-4 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">{counts.total}</div>
                    <div className="text-sm font-semibold text-foreground">{label}</div>
                  </div>

                  {/* Price Ranges and Locations */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {/* Price Ranges Column */}
                    <div className="space-y-2">
                      <div className="font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        Price Range
                      </div>
                      {priceRanges.slice(0, 5).map((range) => (
                        <Link
                          key={range.key}
                          to={buildSearchUrl(category, { priceRange: range.key })}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors group/item"
                        >
                          <span className="text-xs font-medium group-hover/item:text-primary transition-colors">
                            {range.label}
                          </span>
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            {counts.priceRanges[range.key] || 0}
                          </Badge>
                        </Link>
                      ))}
                    </div>

                    {/* Locations Column */}
                    <div className="space-y-2">
                      <div className="font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Top Locations
                      </div>
                      {locationsByCategory[category as keyof typeof locationsByCategory]
                        .slice(0, 5)
                        .map((location) => (
                          <Link
                            key={location}
                            to={buildSearchUrl(category, { location })}
                            className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors group/item"
                          >
                            <span className="text-xs font-medium group-hover/item:text-primary transition-colors truncate">
                              {location}
                            </span>
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 shrink-0">
                              {counts.locations[location] || 0}
                            </Badge>
                          </Link>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            <Building2 className="h-5 w-5" />
            Explore All Properties
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PropertyCounter;