"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { MapPin, Bed, Bath, Ruler, Car, Building, Calendar, Compass, DollarSign, CheckCircle, XCircle, Clock, Phone, Mail, User, MessageSquare, ShieldCheck, Lightbulb, Zap, Droplet, Home, SquareGanttChart, Factory, LandPlot, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatINR, formatNumberWithLocale, translateEnum } from '@/lib/staticTranslations';
import { PropertyInterestForm } from '@/components/PropertyInterestForm';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  useEffect(() => {
    if (!id) {
      setError("Property ID is missing.");
      setLoading(false);
      return;
    }

    const fetchProperty = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) {
          setError("Property not found.");
        } else {
          setProperty(data);
        }
      } catch (err: any) {
        console.error("Error fetching property:", err);
        setError(err.message || "Failed to load property details.");
        toast({
          title: "Error",
          description: err.message || "Failed to load property details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-lg" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate('/')} className="mt-4">Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Property Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">The property you are looking for does not exist or is no longer available.</p>
            <Button onClick={() => navigate('/')} className="mt-4">Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'residential': return <Home className="h-5 w-5 text-primary" />;
      case 'commercial': return <Factory className="h-5 w-5 text-primary" />;
      case 'land': return <LandPlot className="h-5 w-5 text-primary" />;
      default: return <SquareGanttChart className="h-5 w-5 text-primary" />;
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success" className="bg-green-500 text-white"><ShieldCheck className="h-3 w-3 mr-1" /> {t('verified')}</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500 text-white"><Clock className="h-3 w-3 mr-1" /> {t('pending_verification')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-500 text-white"><XCircle className="h-3 w-3 mr-1" /> {t('rejected')}</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground"><XCircle className="h-3 w-3 mr-1" /> {t('unverified')}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 flex items-center text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-2" /> {t('back_to_results')}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Image Carousel */}
          {property.images && property.images.length > 0 ? (
            <Card className="overflow-hidden shadow-lg border-0">
              <Carousel className="w-full">
                <CarouselContent>
                  {property.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative h-80 sm:h-96 lg:h-[500px] w-full">
                        <img
                          src={image}
                          alt={`${property.title} - ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-image.jpg'; // Fallback image
                          }}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="ml-12" />
                <CarouselNext className="mr-12" />
              </Carousel>
            </Card>
          ) : (
            <Card className="h-80 sm:h-96 lg:h-[500px] flex items-center justify-center bg-muted rounded-lg shadow-lg border-0">
              <p className="text-muted-foreground text-lg">{t('no_images_available')}</p>
            </Card>
          )}

          {/* Property Header */}
          <Card className="p-6 shadow-lg border-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">{property.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground text-lg">
                  <MapPin className="h-5 w-5" />
                  <span>{property.location}, {property.city}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-extrabold text-primary">{formatINR(property.price, language)}</p>
                <div className="flex flex-wrap justify-end gap-2 mt-2">
                  <Badge variant="outline" className="capitalize">{t(property.transaction_type)}</Badge>
                  <Badge variant="outline" className="capitalize">{t(property.property_category)}</Badge>
                  {property.property_subtype && <Badge variant="outline" className="capitalize">{t(property.property_subtype)}</Badge>}
                  {getVerificationBadge(property.verification_status || 'unverified')}
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
              {property.bhk && (
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-secondary-foreground" />
                  <span>{property.bhk} {t('bhk')}</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-2">
                  <Bath className="h-4 w-4 text-secondary-foreground" />
                  <span>{property.bathrooms} {t('bathrooms')}</span>
                </div>
              )}
              {property.carpet_area && (
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-secondary-foreground" />
                  <span>{formatNumberWithLocale(property.carpet_area, language)} {t('sq_ft')}</span>
                </div>
              )}
              {property.parking_spaces && property.parking_spaces > 0 && (
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-secondary-foreground" />
                  <span>{property.parking_spaces} {t('parking')}</span>
                </div>
              )}
              {property.floor_number && property.total_floors && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-secondary-foreground" />
                  <span>{t('floor')} {property.floor_number} {t('of')} {property.total_floors}</span>
                </div>
              )}
              {property.age_of_property && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-secondary-foreground" />
                  <span>{property.age_of_property} {t('years_old')}</span>
                </div>
              )}
              {property.facing_direction && (
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-secondary-foreground" />
                  <span>{t('facing')}: {t(property.facing_direction)}</span>
                </div>
              )}
              {property.possession_status && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary-foreground" />
                  <span>{t('possession')}: {t(property.possession_status)}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
          {property.description && (
            <Card className="p-6 shadow-lg border-0">
              <CardTitle className="text-xl mb-4">{t('description')}</CardTitle>
              <CardDescription className="text-muted-foreground leading-relaxed">
                {property.description}
              </CardDescription>
            </Card>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <Card className="p-6 shadow-lg border-0">
              <CardTitle className="text-xl mb-4">{t('amenities')}</CardTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{t(amenity)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Security Features */}
          {property.security_features && property.security_features.length > 0 && (
            <Card className="p-6 shadow-lg border-0">
              <CardTitle className="text-xl mb-4">{t('security_features')}</CardTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {property.security_features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                    <span>{t(feature)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Highlights */}
          {property.highlights && property.highlights.length > 0 && (
            <Card className="p-6 shadow-lg border-0">
              <CardTitle className="text-xl mb-4">{t('highlights')}</CardTitle>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {property.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-1" />
                    <span>{t(highlight)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Additional Details (if available) */}
          <Card className="p-6 shadow-lg border-0">
            <CardTitle className="text-xl mb-4">{t('additional_details')}</CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
              {property.furnishing_status && (
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-secondary-foreground" />
                  <span>{t('furnishing')}: {t(property.furnishing_status)}</span>
                </div>
              )}
              {property.water_supply && (
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-secondary-foreground" />
                  <span>{t('water_supply')}: {t(property.water_supply)}</span>
                </div>
              )}
              {property.electricity_backup && (
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-secondary-foreground" />
                  <span>{t('electricity_backup')}: {t(property.electricity_backup)}</span>
                </div>
              )}
              {property.google_map_link && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-secondary-foreground" />
                  <a href={property.google_map_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {t('view_on_map')}
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar for Contact Form and Agent Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 shadow-lg border-0">
            <CardTitle className="text-xl mb-4">{t('interested_in_this_property')}</CardTitle>
            <PropertyInterestForm propertyId={property.id} propertyTitle={property.title} />
          </Card>

          {(property.agent_name || property.full_name || property.contact_number || property.email_address) && (
            <Card className="p-6 shadow-lg border-0">
              <CardTitle className="text-xl mb-4">{t('contact_agent')}</CardTitle>
              <div className="space-y-3 text-muted-foreground">
                {(property.agent_name || property.full_name) && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-secondary-foreground" />
                    <p className="font-medium text-foreground">{property.agent_name || property.full_name}</p>
                  </div>
                )}
                {(property.agent_phone || property.contact_number) && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-secondary-foreground" />
                    <a href={`tel:${property.agent_phone || property.contact_number}`} className="hover:underline text-blue-500">
                      {property.agent_phone || property.contact_number}
                    </a>
                  </div>
                )}
                {property.email_address && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-secondary-foreground" />
                    <a href={`mailto:${property.email_address}`} className="hover:underline text-blue-500">
                      {property.email_address}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-secondary-foreground" />
                  <p>{t('available_9am_6pm')}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;