import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, Star } from 'lucide-react'; // Added Star icon
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
  const trackRef = useRef<HTMLDivElement>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    const track = trackRef.current;
    if (!track || properties.length === 0) return;

    let animationFrameId: number;
    let currentPosition = 0;
    const speed = 0.5;

    const animate = () => {
      if (track.scrollWidth > track.clientWidth) {
        currentPosition -= speed;
        if (Math.abs(currentPosition) >= track.scrollWidth / 2) {
          currentPosition = 0;
        }
        track.style.transform = `translateX(${currentPosition}px)`;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [properties]);

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  if (loading) {
    return (
      <div className="w-full overflow-hidden py-4 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-4 text-white">{t('featured_properties')}</h2>
        <div className="flex gap-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="min-w-[280px] h-64 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-4 px-4 sm:px-6 lg:px-8 text-red-500">
        <h2 className="text-2xl font-bold mb-4 text-white">{t('featured_properties')}</h2>
        <p className="text-white/70">{t('error_loading_properties')}: {error}</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="w-full py-4 px-4 sm:px-6 lg:px-8 text-muted-foreground">
        <h2 className="text-2xl font-bold mb-4 text-white">{t('featured_properties')}</h2>
        <p className="text-white/70">{t('no_featured_properties_available')}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden py-4 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-4 text-white">{t('featured_properties')}</h2>
      <style jsx>{`
        .marquee {
          animation: marquee-scroll linear infinite;
          animation-duration: ${properties.length * 5}s;
        }
        @keyframes marquee-scroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div
        ref={trackRef}
        className="marquee flex flex-nowrap items-stretch gap-4 will-change-transform"
        style={{ width: `${properties.concat(properties).length * 280}px` }}
      >
        {properties.concat(properties).map((property, index) => (
          <Card
            key={`${property.id}-${index}`}
            className="min-w-[280px] cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handlePropertyClick(property.id)}
          >
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={property.images?.[0] || '/placeholder.svg'}
                  alt={property.title}
                  loading="lazy"
                  className="w-full h-40 object-cover rounded-t-lg"
                />
                <Badge
                  variant="secondary"
                  className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm"
                >
                  <TranslatableText text={property.transaction_type} context="property.transaction_type" />
                </Badge>
                {property.is_featured && (
                  <Badge
                    variant="default"
                    className="absolute top-2 right-2 bg-yellow-500/80 backdrop-blur-sm text-white flex items-center gap-1"
                  >
                    <Star className="h-3 w-3 fill-current" />
                    {t('featured')}
                  </Badge>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm mb-1 line-clamp-2"><TranslatableText text={property.title} context="property.title" /></h3>
                <p className="text-md font-bold text-primary mb-1">
                  {formatINRShort(property.price, language)}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate"><TranslatableText text={property.location} context="property.location" />, <TranslatableText text={property.city} context="property.city" /></span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Bed className="h-3 w-3" />
                    <span>{property.bhk} {t('bhk')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-3 w-3" />
                    <span>{property.bathrooms} {t('bath')}</span>
                  </div>
                  {property.carpet_area && (
                    <div className="flex items-center gap-1">
                      <Square className="h-3 w-3" />
                      <span>{property.carpet_area} {t('sq_ft')}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};