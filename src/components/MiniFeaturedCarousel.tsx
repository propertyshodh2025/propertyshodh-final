import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatINRShort } from '@/lib/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { TranslatableText } from '@/components/TranslatableText';

interface Property {
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
  is_featured: boolean; // Ensure this is part of the interface
}

export const MiniFeaturedCarousel = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchFeaturedProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('MiniFeaturedCarousel: Attempting to fetch featured properties...');
        const { data, error: supabaseError } = await supabase
          .from('properties')
          .select('id, title, price, location, city, bhk, bathrooms, carpet_area, property_type, transaction_type, images, is_featured')
          .eq('is_featured', true) // Filter for featured properties
          .eq('approval_status', 'approved')
          .eq('listing_status', 'Active') // Changed to 'Active' (capital A)
          .order('created_at', { ascending: false })
          .limit(10);

        if (supabaseError) {
          console.error('MiniFeaturedCarousel: Supabase error fetching featured properties:', supabaseError);
          if (isMounted) setError(supabaseError.message);
          throw supabaseError;
        }

        console.log('MiniFeaturedCarousel: Fetched raw featured properties data:', data);

        if (isMounted) {
          setProperties(data || []);
          console.log('MiniFeaturedCarousel: Featured properties set, count:', (data || []).length);
        }
      } catch (e) {
        console.error('MiniFeaturedCarousel: Failed to load featured properties in catch block:', e);
        if (isMounted && !error) setError('Failed to load featured properties.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFeaturedProperties();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll effect with 3-second delay
  useEffect(() => {
    if (properties.length <= 2) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = Math.max(0, properties.length - 2);
        return prevIndex >= maxIndex ? 0 : prevIndex + 1;
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [properties.length]);

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, properties.length - 2);
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, properties.length - 2);
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  if (loading) {
    return (
      <div className="w-full py-4 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-4 text-foreground">{t('featured_properties')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-80 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-4 px-4 sm:px-6 lg:px-8 text-red-500">
        <h2 className="text-2xl font-bold mb-4 text-foreground">{t('featured_properties')}</h2>
        <p className="text-muted-foreground">{t('error_loading_properties')}: {error}</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="w-full py-4 px-4 sm:px-6 lg:px-8 text-muted-foreground">
        <h2 className="text-2xl font-bold mb-4 text-foreground">{t('featured_properties')}</h2>
        <p className="text-muted-foreground">{t('no_featured_properties_available')}</p>
      </div>
    );
  }

  // Get current visible properties (2 at a time)
  const visibleProperties = properties.slice(currentIndex, currentIndex + 2);

  return (
    <div className="w-full py-4 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">{t('featured_properties')}</h2>
        {properties.length > 2 && (
          <div className="flex gap-2">
            <button
              onClick={goToPrevious}
              className="p-2 rounded-full bg-background border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Previous properties"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 rounded-full bg-background border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Next properties"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleProperties.map((property) => (
          <Card
            key={property.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden w-full"
            onClick={() => handlePropertyClick(property.id)}
          >
            <CardContent className="p-0">
              <div className="flex flex-col h-full">
                {/* Image Section */}
                <div className="relative h-48">
                  <img
                    src={property.images?.[0] || '/placeholder.svg'}
                    alt={property.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <Badge
                    variant="secondary"
                    className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm border-0"
                  >
                    <TranslatableText text={property.transaction_type} context="property.transaction_type" />
                  </Badge>
                  {property.is_featured && (
                    <Badge
                      variant="default"
                      className="absolute top-3 right-3 bg-yellow-500/90 backdrop-blur-sm text-white flex items-center gap-1 border-0"
                    >
                      <Star className="h-3 w-3 fill-current" />
                      {t('featured')}
                    </Badge>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 text-foreground">
                      <TranslatableText text={property.title} context="property.title" />
                    </h3>
                    <p className="text-xl font-bold text-primary mb-3">
                      {formatINRShort(property.price, language)}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        <TranslatableText text={property.location} context="property.location" />, 
                        <TranslatableText text={property.city} context="property.city" />
                      </span>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{property.bhk} {t('bhk')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span>{property.bathrooms} {t('bath')}</span>
                      </div>
                      {property.carpet_area && (
                        <div className="flex items-center gap-1">
                          <Square className="h-4 w-4" />
                          <span>{property.carpet_area} {t('sq_ft')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Indicators */}
      {properties.length > 2 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: Math.max(0, properties.length - 1) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};