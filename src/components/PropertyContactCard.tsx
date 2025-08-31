import React, { useState } from 'react';
import { Phone, MessageCircle, Star, Heart, Share2, MapPin, Calendar, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Property } from '@/types/database';
import { InterestButton } from '@/components/InterestButton';
import { useSavedProperties } from '@/contexts/SavedPropertiesContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatNumberWithLocale, formatINRShort } from '@/lib/locale';
import { translateEnum } from '@/lib/staticTranslations';

interface PropertyContactCardProps {
  property: Property;
  onSave?: () => void;
  onShare?: () => void;
}

export const PropertyContactCard: React.FC<PropertyContactCardProps> = ({
  property,
  onSave,
  onShare
}) => {
  const { saveProperty, removeSavedProperty, isPropertySaved } = useSavedProperties();
  const { toast } = useToast();
  const isSaved = isPropertySaved(property.id);
  const { language, t } = useLanguage();
  const handleCall = () => {
    if (property.contact_number) {
      window.open(`tel:${property.contact_number}`, '_self');
    }
  };

  const handleWhatsApp = () => {
    if (property.contact_number) {
      const message = `Hi! I'm interested in your property "${property.title}" listed for ₹${(property.price / 100000).toFixed(1)}L. Can you please provide more details?`;
      const whatsappUrl = `https://wa.me/91${property.contact_number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        await removeSavedProperty(property.id);
        toast({
          title: "Property removed",
          description: "Property removed from your saved list"
        });
      } else {
        await saveProperty(property.id);
        toast({
          title: "Property saved",
          description: "Property added to your saved list"
        });
      }
      onSave?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save property. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShareClick = () => {
    if (onShare) {
      onShare();
    }
  };

  return (
    <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl sticky top-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">{t('contact_details')}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Price */}
        <div className="text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {formatINRShort(property.price, language)}
          </div>
          <div className="text-sm text-muted-foreground">
            {property.carpet_area && `₹${formatNumberWithLocale(Math.round(property.price / property.carpet_area), language)}/sq ft`}
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Contact Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleCall}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 rounded-xl h-12 font-medium transition-all duration-300 hover:scale-105 shadow-lg"
            disabled={!property.contact_number}
          >
            <Phone size={18} className="mr-2" />
            {t('call_now')}
          </Button>
          
          <Button 
            onClick={handleWhatsApp}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 rounded-xl h-12 font-medium transition-all duration-300 hover:scale-105 shadow-lg"
            disabled={!property.contact_number}
          >
            <MessageCircle size={18} className="mr-2" />
            {t('whatsapp')}
          </Button>
        </div>

        <Separator className="bg-white/10" />

        {/* Interest Button */}
        <InterestButton
          propertyId={property.id}
          propertyTitle={property.title}
          className="w-full"
        />

        <Separator className="bg-white/10" />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            className="flex-1 bg-white/5 border-white/20 hover:bg-white/10 rounded-xl transition-all duration-300"
          >
            <Heart size={16} className={`mr-2 ${isSaved ? 'fill-current text-red-500' : ''}`} />
            {isSaved ? t('saved') : t('save')}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleShareClick}
            className="flex-1 bg-white/5 border-white/20 hover:bg-white/10 rounded-xl transition-all duration-300"
          >
            <Share2 size={16} className="mr-2" />
            {t('share')}
          </Button>
        </div>

        <Separator className="bg-white/10" />

        {/* Quick Details */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{t('quick_details')}</h4>
          <div className="space-y-2 text-sm">
            {[
              { label: t('property_type'), value: translateEnum(property.property_type as any, language) },
              { label: t('bhk_label'), value: property.bhk ? `${formatNumberWithLocale(property.bhk, language)} BHK` : (property.bhk_type || t('not_available')) },
              { label: t('area_size'), value: property.carpet_area ? `${formatNumberWithLocale(property.carpet_area, language)} sq ft` : (property.built_up_area ? `${formatNumberWithLocale(property.built_up_area, language)} sq ft` : (property.super_built_up_area ? `${formatNumberWithLocale(property.super_built_up_area, language)} sq ft` : (property.plot_area ? `${formatNumberWithLocale(property.plot_area, language)} sq ft` : t('not_available')))) },
              { label: t('built_year'), value: property.built_year || (property.property_age ? property.property_age : (property.construction_status === 'ready_to_move' ? t('ready_to_move') : property.construction_status || t('not_available'))) },
              { label: t('facing'), value: translateEnum((property.facing || property.facing_direction || property.facing_direction_detailed) as any, language) || t('not_available') },
              { label: t('floor_label'), value: property.floor || (property.floor_number ? `${formatNumberWithLocale(property.floor_number, language)}${property.total_floors ? ` of ${formatNumberWithLocale(property.total_floors, language)}` : ''}` : t('not_available')) }
            ].filter(detail => detail.value && detail.value !== t('not_available')).map((detail, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">{detail.label}:</span>
                <span className="font-medium text-foreground">{detail.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Info */}
        {property.agent_name && (
          <>
            <Separator className="bg-white/10" />
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{t('listed_by')}</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {property.agent_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{property.agent_name}</div>
                  <div className="text-xs text-muted-foreground">Property Agent</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Map Link */}
        {property.google_map_link && (
          <>
            <Separator className="bg-white/10" />
            <Button
              variant="outline"
              onClick={() => window.open(property.google_map_link, '_blank')}
              className="w-full bg-white/5 border-white/20 hover:bg-white/10 rounded-xl"
            >
              <MapPin size={16} className="mr-2" />
              {t('view_on_map')}
            </Button>
          </>
        )}

        {/* Property ID */}
        <div className="text-center text-xs text-muted-foreground">
        {t('property_id')}: {property.id.slice(-8).toUpperCase()}
        </div>
      </CardContent>
    </Card>
  );
};