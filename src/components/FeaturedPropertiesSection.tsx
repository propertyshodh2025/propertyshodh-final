import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Square, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { TranslatableText } from '@/components/TranslatableText';
import { translateEnum } from '@/lib/staticTranslations';
import { formatNumberWithLocale } from '@/lib/locale';
import { shouldPropertyHaveBHK } from '@/lib/propertyUtils';

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

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-2">{t('featured.loadingTitle')}</h2>
            <p className="text-muted-foreground">{t('featured.loadingSubtitle')}</p>
          </div>
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
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{t('featured.title')}</h2>
            <p className="text-muted-foreground">{t('featured.subtitle')}</p>
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

        <div className="text-center mt-8 lg:hidden">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/properties')}
          >
            {t('featured.viewAll')}
          </Button>
        </div>
      </div>
    </section>
  );
};