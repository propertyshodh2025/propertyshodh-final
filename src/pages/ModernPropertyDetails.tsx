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

// Lazy load heavy components
const PropertyVerificationDetails = React.lazy(() => import('@/components/PropertyVerificationDetails'));

const ModernPropertyDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [verificationDetails, setVerificationDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError('Property ID not found');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const { data, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .eq('listing_status', 'Active')
          .maybeSingle();
        
        if (propertyError) {
          console.error('Error fetching property:', propertyError);
          setError('Failed to fetch property details');
          return;
        }

        if (!data) {
          setError('Property not found');
          return;
        }
        
        setProperty(data);
        
        // Fetch verification details if property is verified
        if (data.verification_status === 'verified') {
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
    
    fetchProperty();
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
        title: "Property details copied!",
        description: "Property details and link have been copied to your clipboard",
      });
    }
  };

  const createPropertyShareText = (property: Property) => {
    const highlights = property.highlights?.slice(0, 3).join('\n✓ ') || '';
    const amenities = property.amenities?.slice(0, 4).join(', ') || '';
    
    return `🏠 ${property.title}

💰 Price: ₹${(property.price / 100000).toFixed(1)}L
📍 Location: ${property.location}, ${property.city}
🏢 Type: ${property.property_type}
${property.bhk ? `🛏️ BHK: ${property.bhk}` : ''}
${property.carpet_area ? `📐 Area: ${property.carpet_area} sq ft` : ''}
${property.built_year ? `📅 Built: ${property.built_year}` : ''}
${property.facing ? `🧭 Facing: ${property.facing}` : ''}
${property.furnishing ? `🪑 Furnishing: ${property.furnishing}` : ''}

${highlights ? `✨ Highlights:\n✓ ${highlights}` : ''}

${amenities ? `🎯 Amenities: ${amenities}` : ''}

${property.contact_number ? `📞 Contact: ${property.contact_number}` : ''}

${property.description ? `📋 Description:\n${property.description.slice(0, 150)}${property.description.length > 150 ? '...' : ''}` : ''}`;
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
            <h2 className="text-3xl font-bold text-foreground mb-2">Property Not Found</h2>
            <p className="text-muted-foreground text-lg">
              {error || "The property you're looking for doesn't exist or has been removed."}
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => navigate('/search')}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              Browse Properties
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="border-white/20 hover:bg-white/10"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const propertyStats = [
    { 
      icon: Bed, 
      label: 'BHK', 
      value: property.bhk ? `${formatNumberWithLocale(property.bhk, language)} BHK` : 'N/A',
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      icon: Square, 
      label: 'Area', 
      value: property.carpet_area ? `${formatNumberWithLocale(property.carpet_area, language)} sq ft` : 'N/A',
      gradient: 'from-green-500 to-green-600'
    },
    { 
      icon: Home, 
      label: 'Type', 
      value: property.property_type,
      gradient: 'from-purple-500 to-purple-600'
    },
    { 
      icon: Calendar, 
      label: 'Built', 
      value: property.built_year ? formatNumberWithLocale(property.built_year, language) : 'N/A',
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
              Back
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
                    <span className="ml-2 text-sm">4.0 (24 reviews)</span>
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
                  ₹{formatNumberWithLocale(Math.round(property.price / property.carpet_area), language)}/sq ft
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
                    Property Highlights
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
                <CardTitle className="text-xl md:text-2xl text-foreground">About This Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed text-sm md:text-lg">
                  <TranslatableText text={property.description || 'No description available for this property.'} context={`property.description:${property.id}`} />
                </p>
                
                <Separator className="bg-white/10" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Floor', value: property.floor || 'N/A' },
                    { label: 'Facing', value: property.facing || 'N/A' },
                    { label: 'Furnishing', value: property.furnishing || 'N/A' },
                    { label: 'Possession', value: property.possession_status || 'N/A' },
                    { label: 'Transaction Type', value: property.transaction_type || 'Buy' },
                    { label: 'Property Category', value: property.property_category || 'Residential' }
                  ].map((spec, index) => (
                    <div key={index} className="flex justify-between py-2 md:py-3 border-b border-border/30 last:border-b-0">
                      <span className="font-medium text-muted-foreground text-sm md:text-base">{spec.label}:</span>
                      <span className="text-foreground font-semibold text-sm md:text-base">
                        {spec.label === 'Transaction Type' || spec.label === 'Property Category' ? translateEnum(spec.value, language) : spec.value}
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
                  <CardTitle className="text-xl md:text-2xl text-foreground">Amenities</CardTitle>
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernPropertyDetails;