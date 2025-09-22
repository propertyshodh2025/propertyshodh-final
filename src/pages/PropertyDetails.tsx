
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Calendar, Eye, Star, Phone, MessageCircle, Heart, Share2, ChevronLeft, ChevronRight, ArrowLeft, Shield, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { InterestButton } from '@/components/InterestButton';
import VerificationBadge from '@/components/VerificationBadge';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/database';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatNumberWithLocale, formatINRShort } from '@/lib/locale';
import { translateEnum } from '@/lib/staticTranslations';

const PropertyDetails = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const [property, setProperty] = useState<Property | null>(null);
  const [verificationDetails, setVerificationDetails] = useState<any>(null);
  const [listedBy, setListedBy] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showVerificationDetails, setShowVerificationDetails] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching property:', error);
        return;
      }
      
      setProperty(data);
      
      // Set listed by information
      if (data) {
        if (data.submitted_by_user && data.user_id) {
          // Fetch user profile separately
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', data.user_id)
            .maybeSingle();
          
          setListedBy(profile?.full_name || 'User');
        } else {
          setListedBy('Admin');
        }
        
        // Fetch verification details if property exists
        const { data: verificationData, error: verificationError } = await supabase
          .from('property_verification_details')
          .select('*')
          .eq('property_id', id)
          .maybeSingle();
        
        if (!verificationError && verificationData) {
          setVerificationDetails(verificationData);
        }
      }
    };
    
    fetchProperty();
  }, [id]);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Property Not Found</h2>
          <p className="text-muted-foreground text-lg mb-6">The property you're looking for doesn't exist.</p>
          <Link to="/search">
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
              Back to Search
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    const images = property.images || [];
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    const images = property.images || [];
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50/30 to-blue-50 dark:from-orange-950/20 dark:via-purple-950/10 dark:to-blue-950/20">
      {/* Modern Header */}
      <div className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-8">
            <Link to="/search">
              <Button variant="outline" size="sm" className="rounded-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-200">
                <ArrowLeft size={16} className="mr-2" />
                Back to Search
              </Button>
            </Link>
            <ThemeToggle />
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-4 leading-tight">
                  <TranslatableText text={property.title} context={`property.title:${property.id}`} />
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin size={20} className="mr-2 text-primary" />
                    <span className="font-medium">{translateEnum(property.location, language)}</span>
                  </div>
                  {(property as any).full_address && (
                    <div className="w-full mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <div className="flex items-start">
                        <MapPin size={16} className="mr-2 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-primary text-sm">Complete Address:</span>
                          <p className="text-muted-foreground text-sm mt-1">{(property as any).full_address}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={16} 
                        className="text-yellow-400 cursor-pointer hover:scale-110 transition-transform" 
                        fill={star <= 4 ? "currentColor" : "none"}
                        onClick={() => alert(`You rated this property ${star} star${star > 1 ? 's' : ''}!`)}
                      />
                    ))}
                    <span className="ml-2 text-sm">4.0 (24 reviews)</span>
                  </div>
                  {/* Verification Badge */}
                  {(property as any).verification_status && (
                    <VerificationBadge
                      status={(property as any).verification_status as 'unverified' | 'pending' | 'verified' | 'rejected'}
                      score={(property as any).verification_score || 0}
                      showScore={(property as any).verification_status === 'verified'}
                      size="md"
                    />
                  )}
                </div>
              </div>
            </div>
            
            <div className="lg:text-right space-y-4">
              <div className="text-4xl lg:text-5xl font-light text-primary">
                {formatINRShort(property.price, language)}
              </div>
              <div className="flex gap-3 justify-start lg:justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-200"
                    onClick={() => {
                      const saved = localStorage.getItem('savedProperties') ? JSON.parse(localStorage.getItem('savedProperties') as string) : [];
                      if (!saved.includes(property.id)) {
                        saved.push(property.id);
                        localStorage.setItem('savedProperties', JSON.stringify(saved));
                        alert('Property saved to your favorites!');
                      } else {
                        alert('Property already saved!');
                      }
                    }}
                  >
                  <Heart size={16} className="mr-2" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-200"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: property.title,
                        text: `Check out this property: ${property.title}`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Property link copied to clipboard!');
                    }
                  }}
                >
                  <Share2 size={16} className="mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Image Gallery */}
            <Card className="overflow-hidden border-0 bg-white/20 dark:bg-black/20 backdrop-blur-xl shadow-2xl animate-fade-in">
              <div className="relative">
                {property.images && property.images.length > 0 ? (
                  <>
                    <img
                      src={property.images[currentImageIndex]}
                      alt={property.title}
                      className="w-full h-[500px] object-cover cursor-pointer transition-transform hover:scale-[1.02] duration-700"
                      onClick={() => setIsImageModalOpen(true)}
                    />
                    
                    {property.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-4 rounded-full transition-all shadow-lg hover:scale-110"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-4 rounded-full transition-all shadow-lg hover:scale-110"
                        >
                          <ChevronRight size={24} />
                        </button>
                      </>
                    )}
                    
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
                      {property.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentImageIndex ? 'bg-white shadow-lg scale-125' : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-[500px] bg-muted/50 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin size={48} className="mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-lg">No images available</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: Bed, label: 'BHK', value: property.bhk ? `${formatNumberWithLocale(property.bhk, language)} BHK` : 'N/A', gradient: 'from-blue-500 to-blue-600' },
                  { icon: Square, label: 'Area', value: property.carpet_area ? `${formatNumberWithLocale(property.carpet_area, language)} sq ft` : 'N/A', gradient: 'from-green-500 to-green-600' },
                  { icon: MapPin, label: 'Type', value: property.property_type, gradient: 'from-purple-500 to-purple-600' },
                  { icon: Calendar, label: 'Built Year', value: property.built_year ? formatNumberWithLocale(property.built_year, language) : 'N/A', gradient: 'from-orange-500 to-orange-600' }
                ].map((stat, index) => (
                <Card key={index} className="border-0 bg-white/20 dark:bg-black/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group animate-scale-in">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <stat.icon size={24} className="text-white" />
                    </div>
                    <div className="font-medium text-lg text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Property Highlights */}
            {property.highlights && property.highlights.length > 0 && (
              <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border-white/10 shadow-lg animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Property Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-4 shadow-sm"></div>
                        <span className="text-green-800 dark:text-green-300 font-medium">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border-white/10 shadow-lg animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">About This Property</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-6 text-lg"><TranslatableText text={property.description || 'No description available.'} context={`property.description:${property.id}`} /></p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Listed by', value: listedBy },
                    { label: 'Floor', value: property.floor || 'N/A' },
                    { label: 'Facing', value: property.facing || 'N/A' },
                    { label: 'Furnishing', value: property.furnishing || 'N/A' },
                    { label: 'Possession Status', value: property.possession_status || 'N/A' },
                    { label: 'Built Year', value: property.built_year || 'N/A' },
                    { label: 'Contact Number', value: property.contact_number || 'N/A' }
                  ].map((spec, index) => (
                    <div key={index} className="flex justify-between py-3 border-b border-border/50 last:border-b-0">
                      <span className="font-medium text-muted-foreground">{spec.label}:</span>
                      <span className="text-foreground font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Verification Details */}
            {verificationDetails && (property as any).verification_status === 'verified' && (
              <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border-white/10 shadow-lg animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground flex items-center gap-3">
                    <Shield className="text-green-500" size={24} />
                    Property Verification Details
                    <VerificationBadge
                      status="verified"
                      score={verificationDetails.completeness_score}
                      showScore={true}
                      size="sm"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Collapsible open={showVerificationDetails} onOpenChange={setShowVerificationDetails}>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full mb-4 flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <FileText size={16} />
                          View Verification Details
                        </span>
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                          Verified by Admin
                        </span>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between py-2 border-b border-border/30">
                            <span className="font-medium text-muted-foreground">Ownership Type:</span>
                            <span className="text-foreground">{verificationDetails.ownership_type || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-border/30">
                            <span className="font-medium text-muted-foreground">Construction Status:</span>
                            <span className="text-foreground">{verificationDetails.construction_status || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-border/30">
                            <span className="font-medium text-muted-foreground">Property Condition:</span>
                            <span className="text-foreground">{verificationDetails.property_condition || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between py-2 border-b border-border/30">
                            <span className="font-medium text-muted-foreground">Title Clear:</span>
                            <span className="flex items-center gap-1">
                              {verificationDetails.title_clear ? (
                                <>
                                  <CheckCircle2 size={16} className="text-green-500" />
                                  <span className="text-green-600 dark:text-green-400">Yes</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">Not specified</span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-border/30">
                            <span className="font-medium text-muted-foreground">Actual Photos:</span>
                            <span className="flex items-center gap-1">
                              {verificationDetails.actual_photos_uploaded ? (
                                <>
                                  <CheckCircle2 size={16} className="text-green-500" />
                                  <span className="text-green-600 dark:text-green-400">Verified</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">Not verified</span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-border/30">
                            <span className="font-medium text-muted-foreground">Verification Score:</span>
                            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                              {verificationDetails.completeness_score}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {verificationDetails.verification_notes && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                          <h4 className="font-medium text-foreground mb-2">Admin Verification Notes:</h4>
                          <p className="text-muted-foreground text-sm">{verificationDetails.verification_notes}</p>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border-white/10 shadow-lg animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="inline-flex items-center justify-start px-4 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition-colors font-medium shadow-sm border border-border/50">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mr-3 shadow-sm">
                          <span className="text-primary-foreground text-xs font-bold">✓</span>
                        </div>
                        <span className="text-sm">{translateEnum(String(amenity).replace(/_/g, ' '), language)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Agent */}
            <Card className="sticky top-6 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Contact Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {property.agent_name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-xl text-foreground">{property.agent_name || 'Agent'}</h3>
                  <p className="text-muted-foreground font-medium">Property Consultant</p>
                </div>
                
                <div className="space-y-3">
                  <InterestButton 
                    propertyId={property.id}
                    propertyTitle={property.title}
                    className="w-full font-semibold py-3 shadow-md hover:shadow-lg transition-all"
                  />
                  
                  {property.agent_phone && (
                    <Button 
                      variant="outline"
                      className="w-full border-border/50 py-3 font-semibold"
                      onClick={() => window.open(`tel:${property.agent_phone}`, '_self')}
                    >
                      <Phone size={18} className="mr-2" />
                      Call Now
                    </Button>
                  )}
                  {property.agent_phone && (
                    <Button 
                      variant="outline" 
                      className="w-full border-border/50 py-3 font-semibold"
                      onClick={() => window.open(`https://wa.me/${property.agent_phone.replace(/[^0-9]/g, '')}`, '_blank')}
                    >
                      <MessageCircle size={18} className="mr-2" />
                      WhatsApp
                    </Button>
                  )}
                  {property.contact_number && !property.agent_phone && (
                    <Button 
                      variant="outline"
                      className="w-full border-border/50 py-3 font-semibold"
                      onClick={() => window.open(`tel:${property.contact_number}`, '_self')}
                    >
                      <Phone size={18} className="mr-2" />
                      Call Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Quick Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground font-medium">Property ID:</span>
                  <span className="font-semibold text-foreground">PRS{property.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground font-medium">Posted:</span>
                  <span className="font-semibold text-foreground">2 days ago</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground font-medium">Status:</span>
                  <span className={`font-semibold ${
                    property.listing_status === 'Active' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {property.listing_status}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground font-medium">Furnishing:</span>
                  <span className="font-semibold text-foreground">{property.furnishing || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
