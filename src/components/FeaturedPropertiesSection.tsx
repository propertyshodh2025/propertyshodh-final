import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, Star, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslatableText } from '@/components/TranslatableText';
import { translateEnum } from '@/lib/staticTranslations';
import { formatNumberWithLocale } from '@/lib/locale';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  bhk: number;
  carpet_area: number;
  property_type: string;
  transaction_type: string;
  images?: string[];
  featured_at: string; // Added featured_at
}

export const FeaturedPropertiesSection: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  useEffect(() => {
  const fetchFeaturedProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, location, price, bhk, carpet_area, property_type, transaction_type, images, featured_at')
          .eq('is_featured', true)
          .eq('listing_status', 'active')
          .limit(6)
          .order('featured_at', { ascending: false }); // Order by featured_at for featured properties

        console.log('Featured properties query result:', { data, error });

        if (error) throw error;
        setProperties(data || []);
      } catch (error) {
        console.error('Error fetching featured properties:', error);
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
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-3xl">
                <div className="h-64 bg-muted animate-pulse" />
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-6 bg-muted rounded animate-pulse mb-4" />
                  <div className="flex space-x-4">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-4 w-12 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Background Curves */}
      <div className="absolute inset-0 opacity-40">
        <svg
          className="absolute top-0 right-0 w-1/2 h-full"
          viewBox="0 0 500 1000"
          preserveAspectRatio="xMaxYMid slice"
        >
          <path
            d="M500,0 Q300,200 400,400 T500,800 L500,1000 L500,0 Z"
            fill="hsl(var(--primary))"
            fillOpacity="0.03"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {t('featured.title')}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('featured.subtitle')}
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, index) => (
            <Card
              key={property.id}
              className="group overflow-hidden rounded-3xl border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer"
              onClick={() => navigate(`/property/${property.id}`)}
              style={{
                animationDelay: `${index * 150}ms`
              }}
            >
              {/* Property Image */}
              <div className="relative h-64 overflow-hidden">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 flex items-center justify-center">
                    <div className="text-6xl opacity-30">🏠</div>
                  </div>
                )}

                {/* Overlay Elements */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm capitalize">
                    {translateEnum(property.transaction_type, language as any)}
                  </Badge>
                </div>

                <div className="absolute top-4 right-4">
                  <div className="bg-card/90 backdrop-blur-sm rounded-full p-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" /> {/* Kept Star icon */}
                  </div>
                </div>

                {/* Price Overlay */}
                <div className="absolute bottom-4 left-4">
                  <div className="bg-card/95 backdrop-blur-sm rounded-2xl px-4 py-2">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(property.price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                      <TranslatableText text={property.title} context="property.title" />
                    </h3>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{translateEnum(property.location, language as any)}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {translateEnum(property.property_type, language as any)}
                  </Badge>
                </div>

                {/* Property Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span>{formatNumberWithLocale(property.bhk, language as any)} {translateEnum('bhk', language as any)}</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span>{formatNumberWithLocale(property.carpet_area, language as any)} {translateEnum('sq ft', language as any)}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-xs capitalize">{translateEnum(property.property_type, language as any)}</span>
                    </div>
                  </div>
                </div>

                {/* View Details Button */}
                <Button
                  variant="ghost"
                  className="w-full group/btn hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <span>{t('property.viewDetails')}</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <Button
            onClick={() => navigate('/properties')}
            size="lg"
            className="px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transform transition-all duration-300 hover:scale-105 shadow-lg"
          >
            {t('featured.viewAll')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};