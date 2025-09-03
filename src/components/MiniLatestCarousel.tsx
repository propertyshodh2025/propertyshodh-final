import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatINRShort } from '@/lib/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { TranslatableText } from '@/components/TranslatableText'; // Import TranslatableText

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
}

export const MiniLatestCarousel = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage(); // Destructure t from useLanguage
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchLatestProperties = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        console.log('MiniLatestCarousel: Attempting to fetch latest properties...');
        const { data, error: supabaseError } = await supabase
          .from('properties')
          .select('id, title, price, location, city, bhk, bathrooms, carpet_area, property_type, transaction_type, images')
          .eq('approval_status', 'approved')
          .eq('listing_status', 'Active') // Changed to 'Active' (capital A)
          .order('created_at', { ascending: false }) // Order by creation date for latest properties
          .limit(10); // Fetch a reasonable number of latest properties

        if (supabaseError) {
          console.error('MiniLatestCarousel: Supabase error fetching latest properties:', supabaseError);
          if (isMounted) setError(supabaseError.message);
          throw supabaseError;
        }

        console.log('MiniLatestCarousel: Fetched raw properties data:', data);

        if (isMounted) {
          setProperties(data || []);
          console.log('MiniLatestCarousel: Properties set, count:', (data || []).length);
        }
      } catch (e) {
        console.error('MiniLatestCarousel: Failed to load latest properties in catch block:', e);
        if (isMounted && !error) setError('Failed to load properties.'); // Set a generic error if not already set by Supabase
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLatestProperties();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || properties.length === 0) return;

    let animationFrameId: number;
    let currentPosition = 0;
    const speed = 0.5; // pixels per frame

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
        <h2 className="text-2xl font-bold mb-4">{t('latest_properties')}</h2>
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
        <h2 className="text-2xl font-bold mb-4">{t('latest_properties')}</h2>
        <p>{t('error_loading_properties')}: {error}</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="w-full py-4 px-4 sm:px-6 lg:px-8 text-muted-foreground">
        <h2 className="text-2xl font-bold mb-4">{t('latest_properties')}</h2>
        <p>{t('no_latest_properties_available')}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden py-4 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-4 text-white">{t('latest_properties')}</h2>
      <style jsx>{`
        .marquee {
          animation: marquee-scroll linear infinite;
          animation-duration: ${properties.length * 5}s; /* Adjust speed based on number of items */
        }
        @keyframes marquee-scroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div
        ref={trackRef}
        className="marquee flex flex-nowrap items-stretch gap-4 will-change-transform"
        style={{ width: `${properties.concat(properties).length * 280}px` }} // Approximate width for duplicated items
      >
        {properties.concat(properties).map((property, index) => ( // Duplicate for seamless loop
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
                {/* Added 'New' badge for visual distinction */}
                <Badge 
                  variant="default" 
                  className="absolute top-2 right-2 bg-green-500/80 backdrop-blur-sm text-white"
                >
                  {t('new')}
                </Badge>
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