import React, { useEffect, useState } from 'react';
import { adminSupabase } from '@/lib/adminSupabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink, Trash2, X } from 'lucide-react';
import { Property } from '@/types/database';
import { formatINRShort } from '@/lib/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const FeaturePropertiesManager: React.FC = () => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminSupabase
        .from('properties')
        .select('*')
        .eq('is_featured', true)
        .order('featured_at', { ascending: false });

      if (error) throw error;
      setFeaturedProperties(data || []);
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch featured properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnfeatureProperty = async (propertyId: string) => {
    try {
      const { error } = await adminSupabase
        .from('properties')
        .update({ is_featured: false, featured_at: null, featured_until: null })
        .eq('id', propertyId);

      if (error) throw error;
      
      fetchFeaturedProperties();
      toast({
        title: "Success",
        description: "Property unfeatured successfully",
      });
    } catch (error) {
      console.error('Error unfeaturing property:', error);
      toast({
        title: "Error",
        description: "Failed to unfeature property",
        variant: "destructive",
      });
    }
  };

  const openPropertyInNewTab = (propertyId: string) => {
    window.open(`/property/${propertyId}`, '_blank');
  };

  const filteredFeaturedProperties = featuredProperties.filter(property => {
    const searchLower = searchTerm.toLowerCase();
    return (
      property.title.toLowerCase().includes(searchLower) ||
      property.location.toLowerCase().includes(searchLower) ||
      property.city.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Manage Featured Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search featured properties by title, location, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading featured properties...</p>
            </div>
          ) : filteredFeaturedProperties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No properties currently featured</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeaturedProperties.map((property) => (
                <Card key={property.id} className="border border-border/80 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex gap-4 items-center">
                      {/* Property Image Thumbnail */}
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        {property.images && property.images.length > 0 ? (
                          <img 
                            src={property.images[0]} 
                            alt={property.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">No Image</div>';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Property Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="text-lg font-semibold line-clamp-1">{property.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{property.location}, {property.city}</p>
                        <p className="text-sm font-medium">{formatINRShort(property.price, language)}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> Featured
                          {property.featured_until && (
                            <span>until {new Date(property.featured_until).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPropertyInNewTab(property.id)}
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              title="Remove from featured"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Unfeature</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-red-50/90 border-red-200">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-red-800">Remove Featured Status</AlertDialogTitle>
                              <AlertDialogDescription className="text-red-700">
                                Are you sure you want to remove "{property.title}" from featured listings?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-red-200 text-red-800 hover:bg-red-100">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleUnfeatureProperty(property.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remove Feature
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturePropertiesManager;