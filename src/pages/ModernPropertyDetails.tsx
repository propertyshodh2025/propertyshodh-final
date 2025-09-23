import React, { useState, useEffect, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Bed, Square, Calendar, Shield, CheckCircle2, Home, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PropertyImageGallery } from '@/components/PropertyImageGallery';
import { PropertyContactCard } from '@/components/PropertyContactCard';
import { PropertyDetailsSkeleton } from '@/components/PropertyDetailsSkeleton';
import VerificationBadge from '@/components/VerificationBadge';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatNumberWithLocale } from '@/lib/locale';
import { translateEnum } from '@/lib/staticTranslations';
import { shouldPropertyHaveBHK } from '@/lib/propertyUtils';
import { useSimpleCentralContact, getContactWithFallback } from '@/hooks/useSimpleCentralContact';
import SimilarPropertiesSection from '@/components/SimilarPropertiesSection'; // Import SimilarPropertiesSection

// Lazy load heavy components
const PropertyVerificationDetails = React.lazy(() => import('@/components/PropertyVerificationDetails'));

const ModernPropertyDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, t } = useLanguage();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [verificationDetails, setVerificationDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { contactNumber } = useSimpleCentralContact();
  
  console.log('🏠 PROPERTY DETAILS: Contact number:', contactNumber);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Property ID not found');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch property details
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .in('listing_status', ['Active', 'active']) // Handle case variations
          .maybeSingle();
        
        if (propertyError) {
          console.error('Error fetching property:', propertyError);
          setError('Failed to fetch property details');
          return;
        }

        if (!propertyData) {
          setError('Property not found');
          return;
        }
        
        setProperty(propertyData);
        
        // Fetch verification details if property is verified
        if (propertyData.verification_status === 'verified') {
          const { data: verificationData, error: verificationError } = await supabase
            .from('property_verification_details')
            .select('*')
            .eq('property_id', id)
            .maybeSingle();
          
          if (!verificationError && verificationData) {
            setVerificationDetails(verificationData);
          }
        }


      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleShare = () => {
    if (!property) {
      console.log('Property is null, cannot share');
      return;
    }
    
    console.log('Share button clicked, property:', property.title);
    const shareText = createPropertyShareText(property);
    console.log('Generated share text:', shareText);
    
    if (navigator.share) {
      console.log('Using native share');
      navigator.share({
        title: property.title,
        text: shareText,
        url: window.location.href,
      });
    } else {
      console.log('Using clipboard share');
      const fullShareText = `${shareText}\n\n🔗 View Property: ${window.location.href}`;
      navigator.clipboard.writeText(fullShareText);
      toast({
        title: t('property_details_copied'),
        description: t('property_details_link_copied_to_clipboard'),
      });
    }
  };

  const createPropertyShareText = (property: Property) => {
    const highlights = property.highlights?.slice(0, 3).join('\n✓ ') || '';
    const amenities = property.amenities?.slice(0, 4).join(', ') || '';
    
    return `🏠 ${property.title}

💰 ${t('price')}: ₹${(property.price / 100000).toFixed(1)}L
📍 ${t('location')}: ${translateEnum(property.location, language)}, ${translateEnum(property.city, language)}
🏢 ${t('type')}: ${translateEnum(property.property_type as any, language)}
${(property.bhk && shouldPropertyHaveBHK(property.property_type, property.property_category)) ? `🛏️ ${t('bhk_label')}: ${formatNumberWithLocale(property.bhk, language)} BHK` : ''}
${property.carpet_area ? `📐 ${t('area')}: ${formatNumberWithLocale(property.carpet_area, language)} sq ft` : ''}
${property.built_year ? `📅 ${t('built')}: ${formatNumberWithLocale(property.built_year, language)}` : ''}
${property.facing ? `🧭 ${t('facing')}: ${translateEnum(property.facing as any, language)}` : ''}
${property.furnishing ? `🪑 ${t('furnishing')}: ${translateEnum(property.furnishing as any, language)}` : ''}

${highlights ? `✨ ${t('highlights')}:\n✓ ${highlights}` : ''}

${amenities ? `🎯 ${t('amenities')}: ${amenities}` : ''}

${getContactWithFallback(contactNumber) ? `📞 ${t('contact')}: ${getContactWithFallback(contactNumber)}` : ''}
${property.id ? `🆔 ${t('property_id')}: ${property.id.slice(-8).toUpperCase()}` : ''}

${property.description ? `📋 ${t('description')}:\n${property.description.slice(0, 150)}${property.description.length > 150 ? '...' : ''}` : ''}`;
  };

  if (loading) {
    return <PropertyDetailsSkeleton />;
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <Home size={32} className="text-destructive" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">{t('property_not_found')}</h2>
            <p className="text-muted-foreground text-lg">
              {error || t('property_not_exist_or_removed')}
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => navigate('/search')}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {t('browse_properties')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="border-white/20 hover:bg-white/10"
            >
              {t('back_to_home')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const propertyStats = [
    ...(shouldPropertyHaveBHK(property.property_type, property.property_category) ? [{ 
      icon: Bed, 
      label: t('bhk_label'), 
      value: property.bhk ? `${formatNumberWithLocale(property.bhk, language)} BHK` : t('not_available'),
      gradient: 'from-blue-500 to-blue-600'
    }] : []),
    { 
      icon: Square, 
      label: t('area'), 
      value: property.carpet_area ? `${formatNumberWithLocale(property.carpet_area, language)} sq ft` : t('not_available'),
      gradient: 'from-green-500 to-green-600'
    },
    { 
      icon: Home, 
      label: t('type'), 
      value: translateEnum(property.property_type as any, language),
      gradient: 'from-purple-500 to-purple-600'
    },
    { 
      icon: Calendar, 
      label: t('built'), 
      value: property.built_year ? formatNumberWithLocale(property.built_year, language) : t('not_available'),
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Curved Background Elements */}
      <div className="absolute inset-0 opacity-30 overflow-hidden">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="detailsGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d="M0,200 Q250,50 500,150 T1000,100 L1000,0 L0,0 Z" fill="url(#detailsGradient1)" />
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/10 dark:bg-black/10 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between mb-8">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline" 
              size="sm" 
              className="rounded-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <ArrowLeft size={16} className="mr-2" />
              {t('back')}
            </Button>
            <ThemeToggle />
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground leading-tight">
                  <TranslatableText text={property.title} context={`property.title:${property.id}`} />
                </h1>
                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin size={18} className="mr-2 text-primary" />
                    <span className="font-medium">{translateEnum(property.location, language)}, {translateEnum(property.city, language)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={14} 
                        className="text-yellow-400" 
                        fill={star <= 4 ? "currentColor" : "none"}
                      />
                    ))}
                    <span className="ml-2 text-sm">4.0 ({t('reviews', { count: 24 })})</span>
                  </div>
                  {property.verification_status && (
                    <VerificationBadge
                      status={property.verification_status as 'unverified' | 'pending' | 'verified' | 'rejected'}
                      score={property.verification_score || 0}
                      showScore={property.verification_status === 'verified'}
                      size="md"
                    />
                  )}
                </div>
              </div>
            </div>
            
            <div className="lg:text-right space-y-4">
              <div className="text-3xl md:text-4xl lg:text-5xl font-light bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ₹{formatNumberWithLocale((property.price / 100000).toFixed(1), language)}L
              </div>
              {property.carpet_area && (
                <div className="text-sm text-muted-foreground">
                  ₹{formatNumberWithLocale(Math.round(property.price / property.carpet_area), language)}/{t('sq_ft')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8 md:space-y-12">
            {/* Image Gallery */}
            <PropertyImageGallery 
              images={property.images || []} 
              title={property.title}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {propertyStats.map((stat, index) => (
                <Card 
                  key={index} 
                  className="border-0 bg-white/20 dark:bg-black/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group rounded-2xl"
                >
                  <CardContent className="p-4 md:p-6 text-center">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <stat.icon size={20} className="text-white" />
                    </div>
                    <div className="font-medium text-sm md:text-lg text-foreground mb-1">{stat.value}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Property Highlights */}
            {property.highlights && property.highlights.length > 0 && (
              <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl text-foreground flex items-center gap-2">
                    <TrendingUp size={24} className="text-primary" />
                    <TranslatableText text="Property Highlights" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {property.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center p-3 md:p-4 bg-primary/5 rounded-xl border border-primary/20 hover:bg-primary/10 transition-colors">
                        <CheckCircle2 size={16} className="text-primary mr-3 flex-shrink-0" />
                        <span className="text-foreground font-medium text-sm md:text-base">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl text-foreground">
                  <TranslatableText text="About This Property" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed text-sm md:text-lg">
                  <TranslatableText text={property.description || t('no_description_available')} context={`property.description:${property.id}`} />
                </p>
                
                <Separator className="bg-white/10" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: t('floor'), value: property.floor || t('not_available') },
                    { label: t('facing'), value: translateEnum((property.facing || property.facing_direction || property.facing_direction_detailed) as any, language) || t('not_available') },
                    { label: t('furnishing'), value: translateEnum(property.furnishing as any, language) || t('not_available') },
                    { label: t('possession'), value: translateEnum(property.possession_status as any, language) || t('not_available') },
                    { label: t('transaction_type'), value: translateEnum(property.transaction_type as any, language) || t('buy') },
                    { label: t('property_category'), value: translateEnum(property.property_category as any, language) || t('residential') }
                  ].map((spec, index) => (
                    <div key={index} className="flex justify-between py-2 md:py-3 border-b border-border/30 last:border-b-0">
                      <span className="font-medium text-muted-foreground text-sm md:text-base">{spec.label}:</span>
                      <span className="text-foreground font-semibold text-sm md:text-base">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl text-foreground">
                    <TranslatableText text="Amenities" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="justify-start p-3 bg-accent/10 hover:bg-accent/20 transition-colors rounded-xl text-sm"
                      >
                        {translateEnum(String(amenity).replace(/_/g, ' '), language)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Verification Details */}
            {verificationDetails && property.verification_status === 'verified' && (
              <Suspense fallback={
                <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-muted/30 rounded w-1/3"></div>
                      <div className="h-4 bg-muted/30 rounded w-full"></div>
                      <div className="h-4 bg-muted/30 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              }>
                <PropertyVerificationDetails verificationDetails={verificationDetails} />
              </Suspense>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <PropertyContactCard 
              property={property}
              onShare={handleShare}
              globalContactNumber={getContactWithFallback(contactNumber)} // Pass the central contact number
            />
          </div>
        </div>

        {/* Similar Properties Section at the end */}
        {id && property && (
          <div className="mt-12 md:mt-16">
            <SimilarPropertiesSection
              currentPropertyId={id}
              propertyType={property.property_type || undefined}
              propertyCategory={property.property_category || undefined}
              transactionType={property.transaction_type || undefined}
              location={property.location || undefined}
              city={property.city || undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernPropertyDetails;