import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Bed, Square, Share2, Phone, ExternalLink, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InterestButton } from '@/components/InterestButton';
import { Property } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatNumberWithLocale } from '@/lib/locale';
import { translateEnum } from '@/lib/staticTranslations';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${formatNumberWithLocale((price / 10000000).toFixed(1), language)} Cr`;
    } else if (price >= 100000) {
      return `₹${formatNumberWithLocale((price / 100000).toFixed(1), language)} L`;
    } else {
      return `₹${formatNumberWithLocale(price, language)}`;
    }
  };

  const handleWhatsApp = (contactNumber?: string) => {
    if (contactNumber) {
      const cleanNumber = contactNumber.replace(/\D/g, '');
      window.open(`https://wa.me/91${cleanNumber}`, '_blank');
    }
  };

  const handleShare = () => {
    const propertyUrl = `${window.location.origin}/property/${property.id}`;
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: propertyUrl
      });
    } else {
      navigator.clipboard.writeText(propertyUrl);
      toast({
        title: "Link Copied!",
        description: "Property link copied to clipboard"
      });
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card border-border/50 hover:border-primary/20">
      <div className="relative">
        {/* Property Image */}
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
        ) : (
          <div className="h-48 bg-muted flex items-center justify-center">
            <Home className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <div className="rounded-full bg-background/90 backdrop-blur-sm shadow-md">
            <InterestButton propertyId={property.id} propertyTitle={property.title} variant="outline" size="sm" className="p-2 rounded-full hover:bg-background/50" />
          </div>
          <button className="p-2 bg-background/90 backdrop-blur-sm rounded-full hover:bg-background transition-colors shadow-md" onClick={handleShare}>
            <Share2 size={16} className="text-blue-500" />
          </button>
        </div>
        <div className="absolute top-3 left-3">
          <Badge variant={property.listing_status === 'Active' ? 'default' : 'secondary'}>
            {translateEnum(property.listing_status || 'Active', language)}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-5">
        <div className="mb-3">
          <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent dark:from-green-400 dark:to-green-500">
            {formatPrice(property.price)}
          </span>
        </div>
        
        <h3 className="font-semibold text-lg mb-3 line-clamp-2 text-foreground hover:text-primary transition-colors">
          {property.title}
        </h3>
        
        <div className="flex items-center text-muted-foreground mb-4">
          <MapPin size={16} className="mr-2 text-primary" />
          <span className="text-sm font-medium">{translateEnum(property.location, language)}, {translateEnum(property.city, language)}</span>
        </div>
        
        <div className="flex items-center justify-between mb-4 text-sm">
          {property.bhk && (
            <div className="flex items-center text-muted-foreground">
              <Bed size={16} className="mr-1 text-blue-500" />
              <span className="font-medium">{property.bhk} BHK</span>
            </div>
          )}
          {property.carpet_area && (
            <div className="flex items-center text-muted-foreground">
              <Square size={16} className="mr-1 text-purple-500" />
              <span className="font-medium">{formatNumberWithLocale(property.carpet_area, language)} sq ft</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mb-4">
          <Badge variant="outline" className="text-xs">
            {translateEnum(property.property_type, language)}
          </Badge>
          {property.possession_status && (
            <Badge variant="outline" className="text-xs">
              {translateEnum(property.possession_status, language)}
            </Badge>
          )}
        </div>

        {property.amenities && property.amenities.length > 0 && (
          <div className="mb-4">
            <span className="text-sm text-muted-foreground mb-2 block">Amenities:</span>
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 3).map(amenity => (
                <Badge key={amenity} variant="outline" className="text-xs">
                  {translateEnum(String(amenity).replace(/_/g, ' '), language)}
                </Badge>
              ))}
              {property.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{property.amenities.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {property.contact_number && (
            <Button size="sm" onClick={() => handleWhatsApp(property.contact_number)} className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          )}
          
          {property.google_map_link && (
            <Button size="sm" variant="outline" onClick={() => window.open(property.google_map_link, '_blank')}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}

          <Link to={`/property/${property.id}`} className="flex-1">
            <Button size="sm" variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;