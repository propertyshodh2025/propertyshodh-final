import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Square, ArrowRight, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { TranslatableText } from '@/components/TranslatableText';
import { translateEnum } from '@/lib/staticTranslations';
import { formatNumberWithLocale } from '@/lib/locale';
import { shouldPropertyHaveBHK } from '@/lib/propertyUtils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import styles from './FeaturedPropertiesSection.module.css';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  property_type: string;
  images?: string[];
}

export const FeaturedPropertiesSection: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Custom hook to check if we're on mobile view
  const isMobile = useMediaQuery('(max-width: 640px)');

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('listing_status', 'Active')
          .limit(6)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProperties(data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  // Add scroll event listener for mobile carousel
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    
    if (!scrollContainer || !isMobile) return;

    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      const containerWidth = scrollContainer.offsetWidth;
      const newIndex = Math.round(scrollLeft / containerWidth);
      
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < properties.length) {
        setActiveIndex(newIndex);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, activeIndex, properties.length]);

  const formatPrice = (price: number) => {
    const format = (n: number) => {
      if (n >= 10000000) return { num: (n / 10000000).toFixed(1), unit: language === 'marathi' ? 'कोटी' : 'Cr' };
      if (n >= 100000) return { num: (n / 100000).toFixed(1), unit: language === 'marathi' ? 'लाख' : 'L' };
      return { num: n.toLocaleString(), unit: '' };
    };
    const { num, unit } = format(price);
    const localizedNum = formatNumberWithLocale(num, language as any);
    return `₹${localizedNum}${unit ? (language === 'marathi' ? ' ' : '') + unit : ''}`;
  };

  // Scroll functions for mobile carousel - one property at a time
  const scrollToNext = () => {
    if (scrollRef.current && isMobile) {
      const scrollAmount = scrollRef.current.offsetWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setActiveIndex(prev => Math.min(prev + 1, properties.length - 1));
    }
  };

  const scrollToPrev = () => {
    if (scrollRef.current && isMobile) {
      const scrollAmount = scrollRef.current.offsetWidth;
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setActiveIndex(prev => Math.max(prev - 1, 0));
    }
  };

  // Function to scroll to specific index
  const scrollToIndex = (index: number) => {
    if (scrollRef.current && isMobile) {
      const scrollAmount = scrollRef.current.offsetWidth * index;
      scrollRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
      setActiveIndex(index);
    }
  };

  if (loading) {
    return (
      <section className="py-8 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{t('featured.loadingTitle')}</h2>
            <p className="text-sm sm:text-base text-muted-foreground">{t('featured.loadingSubtitle')}</p>
          </div>
          {isMobile ? (
            <div className="overflow-x-auto pb-6">
              <div className="flex space-x-4 w-max">
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="animate-pulse min-w-[280px] w-[85vw] sm:w-auto">
                    <div className="aspect-[4/3] bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-6 bg-muted rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="aspect-[4/3] bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white dark:text-gray-200 mb-1 sm:mb-2">{t('featured.title')}</h2>
            <p className="text-sm sm:text-base text-muted-foreground">{t('featured.subtitle')}</p>
          </div>
          <Button 
            variant="outline" 
            className="hidden lg:flex items-center gap-2 flex-shrink-0"
            onClick={() => navigate('/properties')}
          >
            {t('featured.viewAll')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile View - One Property at a Time */}
        {isMobile ? (
          <div className="mb-6">
            <div 
              ref={scrollRef}
              className={`flex overflow-x-auto pb-6 snap-x snap-mandatory ${styles.hideScrollbar} ${styles.mobileCarousel}`}
            >
              {properties.map((property, index) => (
                <div 
                  key={property.id}
                  className={`flex-none snap-center px-2 w-full ${styles.mobileCard}`}
                  style={{ minWidth: '100%' }}
                >
                  <Card 
                    className={`h-full group hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-800 overflow-hidden ${styles.propertyCard} max-w-md mx-auto`}
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    {/* Property Image */}
                    <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                      {property.images && property.images.length > 0 ? (
                        <img 
                          src={property.images[0]} 
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <Square className="w-10 h-10 mx-auto mb-1" />
                            <span className="text-xs">{t('property.noImage')}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Property Type Badge */}
                      <Badge className="absolute top-2 left-2 bg-background/90 text-foreground hover:bg-background capitalize text-xs">
                        {translateEnum(property.property_type, language as any)}
                      </Badge>
                      
                      {/* Featured Badge */}
                      <Badge className="absolute top-2 right-2 bg-yellow-500 text-white hover:bg-yellow-600 text-xs px-2 py-0.5">
                        <Star className="w-3 h-3 mr-1" />
                        {t('property.featured')}
                      </Badge>

                      {/* Price overlay for mobile */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-background/80 backdrop-blur-sm text-foreground rounded-lg px-3 py-2 shadow-md">
                          <div className="text-base font-bold text-primary">
                            {formatPrice(property.price)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-3 space-y-3">
                      {/* Property Title */}
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors text-base">
                        <TranslatableText text={property.title} context="property.title" />
                      </h3>

                      {/* Location */}
                      <div className="flex items-center text-muted-foreground text-sm">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{translateEnum(property.location, language as any)}</span>
                      </div>

                      {/* Property Details - More spacious for mobile */}
                      <div className={`flex flex-wrap gap-3 text-sm text-muted-foreground ${styles.propertyDetails}`}>
                        {property.bedrooms && shouldPropertyHaveBHK(property.property_type, (property as any).property_category) && (
                          <div className="flex items-center gap-1 bg-muted/30 rounded-full px-2 py-1">
                            <Bed className="w-3 h-3" />
                            <span>{formatNumberWithLocale(property.bedrooms, language as any)} {translateEnum('bhk', language as any)}</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1 bg-muted/30 rounded-full px-2 py-1">
                            <Bath className="w-3 h-3" />
                            <span>{formatNumberWithLocale(property.bathrooms, language as any)}</span>
                          </div>
                        )}
                        {property.area && (
                          <div className="flex items-center gap-1 bg-muted/30 rounded-full px-2 py-1">
                            <Square className="w-3 h-3" />
                            <span>{formatNumberWithLocale(property.area, language as any)} {translateEnum('sq ft', language as any)}</span>
                          </div>
                        )}
                      </div>

                      {/* View Details Button - Full width for better tap target */}
                      <Button 
                        variant="default" 
                        size="sm" 
                        className={`w-full mt-2 text-primary-foreground text-sm font-medium flex items-center justify-center gap-1 ${styles.mobileButton}`}
                      >
                        <span>{t('property.viewDetails')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Mobile Carousel Navigation Controls */}
            <div className="flex justify-center items-center gap-6 mt-6">
              <Button 
                variant="outline" 
                size="lg" 
                className={`rounded-full h-12 w-12 p-0 bg-background/90 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-lg ${styles.mobileButton}`}
                onClick={scrollToPrev}
                disabled={activeIndex === 0}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <div className="flex flex-col items-center gap-2">
                <div className="flex space-x-2">
                  {properties.slice(0, Math.min(properties.length, 6)).map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeIndex === idx 
                          ? 'w-6 bg-primary' 
                          : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {activeIndex + 1} / {properties.length}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="lg" 
                className={`rounded-full h-12 w-12 p-0 bg-background/90 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-lg ${styles.mobileButton}`}
                onClick={scrollToNext}
                disabled={activeIndex >= properties.length - 1}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
          ) : (
          // Desktop View - Grid Layout (2 columns for tablet, 3 for desktop)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {properties.map((property) => (
            <Card 
              key={property.id} 
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 overflow-hidden"
              onClick={() => navigate(`/property/${property.id}`)}
            >
              {/* Property Image */}
              <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                {property.images && property.images.length > 0 ? (
                  <img 
                    src={property.images[0]} 
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Square className="w-12 h-12 mx-auto mb-2" />
                      <span className="text-sm">{t('property.noImage')}</span>
                    </div>
                  </div>
                )}
                
                {/* Property Type Badge */}
                <Badge className="absolute top-3 left-3 bg-background/90 text-foreground hover:bg-background capitalize">
                  {translateEnum(property.property_type, language as any)}
                </Badge>
                
                {/* Featured Badge */}
                <Badge className="absolute top-3 right-3 bg-yellow-500 text-white hover:bg-yellow-600">
                  <Star className="w-3 h-3 mr-1" />
                  {t('property.featured')}
                </Badge>
              </div>

              <CardContent className="p-3 sm:p-4 space-y-3">
                {/* Property Title */}
                <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm sm:text-base">
                  <TranslatableText text={property.title} context="property.title" />
                </h3>

                {/* Location */}
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{translateEnum(property.location, language as any)}</span>
                  </div>

                {/* Property Details */}
                <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground flex-wrap">
                  {property.bedrooms && shouldPropertyHaveBHK(property.property_type, (property as any).property_category) && (
                    <div className="flex items-center gap-1">
                      <Bed className="w-3 h-3" />
                      <span>{formatNumberWithLocale(property.bedrooms, language as any)} {translateEnum('bhk', language as any)}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-1">
                      <Bath className="w-3 h-3" />
                      <span>{formatNumberWithLocale(property.bathrooms, language as any)}</span>
                    </div>
                  )}
                  {property.area && (
                    <div className="flex items-center gap-1">
                      <Square className="w-3 h-3" />
                      <span>{formatNumberWithLocale(property.area, language as any)} {translateEnum('sq ft', language as any)}</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="text-lg sm:text-xl font-bold text-primary">
                    {formatPrice(property.price)}
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-0 text-xs sm:text-sm">
                    {t('property.viewDetails')}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>

        {/* "View All" button for both mobile and tablet */}
        <div className="text-center mt-8 lg:hidden">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto px-6 py-2 text-base font-medium"
            onClick={() => navigate('/properties')}
          >
            {t('featured.viewAll')}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};