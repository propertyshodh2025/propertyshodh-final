import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MapPin, Bed, Bath, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatINRShort } from '@/lib/locale';
import { useLanguage } from '@/contexts/LanguageContext';

interface RecentlyViewedProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  city: string;
  bhk: number;
  bathrooms: number;
  carpet_area: number;
  property_type: string;
  transaction_type: string;
  images: string[];
  viewed_at: string;
}

export const RecentlyViewedProperties = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    fetchRecentlyViewed();
  }, []);

  const fetchRecentlyViewed = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('RecentlyViewedProperties: No user logged in');
        setLoading(false);
        return;
      }

      console.log('RecentlyViewedProperties: Fetching activities for user:', user.id);
      
      // Get recently viewed property IDs from user activities
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activities')
        .select('property_id, created_at')
        .eq('user_id', user.id)
        .eq('activity_type', 'property_view')
        .not('property_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) {
        console.error('RecentlyViewedProperties: Error fetching activities:', activitiesError);
        throw activitiesError;
      }

      console.log('RecentlyViewedProperties: Found activities:', activities?.length || 0);
      
      if (!activities || activities.length === 0) {
        console.log('RecentlyViewedProperties: No activities found');
        setLoading(false);
        return;
      }

      // Get unique property IDs (in case of multiple views)
      const uniquePropertyIds = [...new Set(activities.map(a => a.property_id))];
      console.log('RecentlyViewedProperties: Unique property IDs:', uniquePropertyIds);
      
      // Fetch property details
      // Removed client-side filters for approval_status and listing_status
      // Relying on RLS to filter what the user is authorized to see.
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, price, location, city, bhk, bathrooms, carpet_area, property_type, transaction_type, images')
        .in('id', uniquePropertyIds);

      if (propertiesError) {
        console.error('RecentlyViewedProperties: Error fetching properties:', propertiesError);
        throw propertiesError;
      }

      console.log('RecentlyViewedProperties: Found properties:', properties?.length || 0);
      
      // Map properties with their viewed dates and sort by most recent
      const propertiesWithViewDate = properties
        ?.map(property => {
          const activity = activities.find(a => a.property_id === property.id);
          return {
            ...property,
            viewed_at: activity?.created_at || ''
          };
        })
        .sort((a, b) => new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime())
        .slice(0, 6); // Show only 6 most recent

      console.log('RecentlyViewedProperties: Final properties with view dates:', propertiesWithViewDate?.length || 0);
      setRecentlyViewed(propertiesWithViewDate || []);
    } catch (error) {
      console.error('Error fetching recently viewed properties:', error);
      setError((error as Error).message); // Set error state for display if needed
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recently Viewed Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recently Viewed Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <p>Error loading recently viewed properties: {error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={fetchRecentlyViewed}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentlyViewed.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recently Viewed Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              Start exploring properties to see your recently viewed ones here
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/search')}
            >
              Browse Properties
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Recently Viewed Properties
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentlyViewed.map((property) => (
            <Card 
              key={property.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handlePropertyClick(property.id)}
            >
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={property.images?.[0] || '/placeholder.svg'}
                    alt={property.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Badge 
                    variant="secondary" 
                    className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm"
                  >
                    {property.transaction_type}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{property.title}</h3>
                  <p className="text-lg font-bold text-primary mb-2">
                    {formatINRShort(property.price, language)}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{property.location}, {property.city}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      <span>{property.bhk} BHK</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="h-3 w-3" />
                      <span>{property.bathrooms} Bath</span>
                    </div>
                    {property.carpet_area && (
                      <div className="flex items-center gap-1">
                        <Square className="h-3 w-3" />
                        <span>{property.carpet_area} sq ft</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {property.property_type}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePropertyClick(property.id);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Viewed: {new Date(property.viewed_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};