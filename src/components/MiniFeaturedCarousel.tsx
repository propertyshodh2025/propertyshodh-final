import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatINRShort } from '@/lib/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { TranslatableText } from '@/components/TranslatableText';
import { translateEnum } from '@/lib/staticTranslations';
import { useMediaQuery } from '@/hooks/useMediaQuery';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Check if we're on mobile view
  const isMobile = useMediaQuery('(max-width: 768px)');

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
    const minPropertiesToShow = isMobile ? 1 : 2;
    if (properties.length <= minPropertiesToShow) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = Math.max(0, properties.length - minPropertiesToShow);
        return prevIndex >= maxIndex ? 0 : prevIndex + 1;
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [properties.length, isMobile]);

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => {
      const minPropertiesToShow = isMobile ? 1 : 2;
      const maxIndex = Math.max(0, properties.length - minPropertiesToShow);
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => {
      const minPropertiesToShow = isMobile ? 1 : 2;
      const maxIndex = Math.max(0, properties.length - minPropertiesToShow);
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  if (loading) {
    return (
      <div className="w-full py-4 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">{t('featured_properties')}</h2>
        <div className={`grid gap-6 animate-pulse ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {[...Array(isMobile ? 1 : 2)].map((_, i) => (
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

  const minPropertiesToShow = isMobile ? 1 : 2;

  return (
    <div className="w-full py-4 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{t('featured_properties')}</h2>
        {properties.length > minPropertiesToShow && (
          <div className="flex gap-2">
            <button
              onClick={goToPrevious}
              className={`p-2 rounded-full bg-background border border-border hover:bg-accent hover:text-accent-foreground transition-colors ${
                isMobile ? 'h-10 w-10' : 'h-8 w-8'
              }`}
              aria-label="Previous properties"
            >
              <ChevronLeft className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
            </button>
            <button
              onClick={goToNext}
              className={`p-2 rounded-full bg-background border border-border hover:bg-accent hover:text-accent-foreground transition-colors ${
                isMobile ? 'h-10 w-10' : 'h-8 w-8'
              }`}
              aria-label="Next properties"
            >
              <ChevronRight className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex transition-transform duration-1000 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (isMobile ? 100 : 50)}%)`,
          }}
        >
          {properties.map((property) => (
            <div 
              key={property.id} 
              className={`${isMobile ? 'w-full px-2' : 'w-1/2 px-3'} flex-shrink-0`}
            >
              <Card
                className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden w-full ${
                  isMobile ? 'max-w-md mx-auto' : ''
                }`}
                onClick={() => handlePropertyClick(property.id)}
              >
            <CardContent className="p-0">
              <div className="flex flex-col h-full">
                {/* Image Section */}
                <div className={`relative ${isMobile ? 'h-64' : 'h-80'}`}>
                  <img
                    src={property.images?.[0] || '/placeholder.svg'}
                    alt={property.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <Badge
                    variant="secondary"
                    className={`absolute top-2 left-2 bg-background/90 backdrop-blur-sm border-0 ${
                      isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'
                    }`}
                  >
                    <TranslatableText text={property.transaction_type} context="property.transaction_type" />
                  </Badge>
                  {property.is_featured && (
                    <Badge
                      variant="default"
                      className={`absolute top-2 right-2 bg-yellow-500/90 backdrop-blur-sm text-white flex items-center gap-1 border-0 ${
                        isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'
                      }`}
                    >
                      <Star className="h-3 w-3 fill-current" />
                      {t('featured')}
                    </Badge>
                  )}
                </div>

                {/* Content Section */}
                <div className={`${isMobile ? 'p-4' : 'p-3'} flex-1 flex flex-col justify-between`}>
                  <div>
                    <h3 className={`font-semibold mb-1.5 line-clamp-2 text-foreground ${
                      isMobile ? 'text-lg' : 'text-base'
                    }`}>
                      <TranslatableText text={property.title} context="property.title" />
                    </h3>
                    <p className={`font-bold text-primary mb-2 ${
                      isMobile ? 'text-xl' : 'text-lg'
                    }`}>
                      {formatINRShort(property.price, language)}
                    </p>
                    <div className={`flex items-center gap-1.5 text-muted-foreground mb-2 ${
                      isMobile ? 'text-sm' : 'text-xs'
                    }`}>
                      <MapPin className={`shrink-0 ${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
                      <span className="truncate">
                        {translateEnum(property.location, language)}, {translateEnum(property.city, language)}
                      </span>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className={`flex items-center text-muted-foreground ${
                      isMobile ? 'gap-4 text-sm flex-wrap' : 'gap-3 text-xs'
                    }`}>
                      <div className="flex items-center gap-1">
                        <Bed className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
                        <span>{property.bhk} {t('bhk')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
                        <span>{property.bathrooms} {t('bath')}</span>
                      </div>
                      {property.carpet_area && (
                        <div className="flex items-center gap-1">
                          <Square className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
                          <span>{property.carpet_area} {t('sq_ft')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  </div>

  {/* Progress Indicators */}
  {properties.length > minPropertiesToShow && (
    <div className="flex justify-center mt-6 gap-2">
      {Array.from({ length: Math.max(0, properties.length - (minPropertiesToShow - 1)) }).map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrentIndex(index)}
          className={`rounded-full transition-all duration-300 ${
            isMobile ? 'w-3 h-3' : 'w-2 h-2'
          } ${
            index === currentIndex
              ? `bg-primary ${isMobile ? 'w-8' : 'w-6'}`
              : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
          }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
      {/* Counter for mobile */}
      {isMobile && (
        <span className="ml-3 text-xs text-muted-foreground font-medium">
          {currentIndex + 1} / {properties.length}
        </span>
      )}
    </div>
  )}
</div>
);
};