import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Home, TrendingUp, ChevronDown, Map } from 'lucide-react';
import { AnimatedCityName } from '@/components/AnimatedCityName';
import { GoogleSignInDialog } from '@/components/auth/GoogleSignInDialog';
import { GridBasedAurangabadMap } from '@/components/GridBasedAurangabadMap';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { MiniFeaturedCarousel } from '@/components/MiniFeaturedCarousel';
import { MiniLatestCarousel } from '@/components/MiniLatestCarousel';
import { AURANGABAD_AREAS } from '@/lib/aurangabadAreas';
import { translateEnum } from '@/lib/staticTranslations';
import { Combobox } from '@/components/ui/combobox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ModernHeroSectionProps {
  totalProperties: number;
}
export const ModernHeroSection: React.FC<ModernHeroSectionProps> = ({
  totalProperties
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [transactionType, setTransactionType] = useState('buy');
  const [propertyCategory, setPropertyCategory] = useState('residential');
  const [propertySubtype, setPropertySubtype] = useState('all');
  const [bhkType, setBhkType] = useState('all');
  
  // Function to determine if a property type should have BHK
  const shouldShowBHK = () => {
    if (propertyCategory === 'land') return false;
    if (propertyCategory === 'commercial') {
      // Only some commercial types might have BHK-like concepts
      const bhkCommercialTypes = ['serviced_apartment', 'hotel_motel', 'resort'];
      return bhkCommercialTypes.includes(propertySubtype);
    }
    if (propertyCategory === 'residential') {
      // Most residential types have BHK, except land/plot
      const noBhkResidentialTypes = ['plot_land'];
      return !noBhkResidentialTypes.includes(propertySubtype);
    }
    return true; // Default to showing BHK for other categories
  };

  // Effect to handle BHK reset when category or subtype changes
  useEffect(() => {
    if (!shouldShowBHK()) {
      setBhkType('all');
    }
  }, [propertyCategory, propertySubtype]);

  // Effect to monitor and clean duplicates from selectedAreas
  useEffect(() => {
    const uniqueAreas = [...new Set(selectedAreas)];
    if (uniqueAreas.length !== selectedAreas.length) {
      // Use a timeout to avoid potential infinite loops
      const timeoutId = setTimeout(() => {
        setSelectedAreas(uniqueAreas);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedAreas]);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { toast } = useToast();

  const ensureProfileExists = useCallback(async () => {
    console.log('ensureProfileExists called. User:', user?.id);
    if (!user) {
      console.log('No user, skipping profile check.');
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile in ensureProfileExists:', error);
        // Do not throw, try to create profile via edge function
      }

      if (!profile) {
        console.log(`Profile not found for user ${user.id}. Attempting to create via Edge Function.`);
        const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('create-missing-profile', {
          body: {
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name,
          },
        });

        if (edgeFunctionError) {
          console.error('Error calling create-missing-profile Edge Function:', edgeFunctionError);
          toast({
            title: "Profile Creation Failed",
            description: "Could not create user profile. Please try logging in again.",
            variant: "destructive",
          });
        } else {
          console.log('Profile creation Edge Function response:', edgeFunctionData);
          toast({
            title: "Welcome!",
            description: "Your profile has been set up.",
            variant: "success",
          });
        }
      } else {
        console.log(`Profile found for user ${user.id}. Profile ID: ${profile.id}`);
      }
    } catch (err) {
      console.error('Unexpected error in ensureProfileExists:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred during profile check.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      ensureProfileExists();
    }
  }, [user, ensureProfileExists]);

  const handleSearch = async () => {
    const searchParams = new URLSearchParams();
    if (selectedLocation !== 'all') searchParams.set('location', selectedLocation);
    if (selectedAreas.length > 0) searchParams.set('areas', selectedAreas.join(','));
    if (transactionType !== 'buy') searchParams.set('transaction', transactionType);
    if (propertyCategory !== 'residential') searchParams.set('category', propertyCategory);
    if (propertySubtype !== 'all') searchParams.set('subtype', propertySubtype);
    if (bhkType !== 'all') searchParams.set('bedrooms', bhkType);

    const searchQueryText = [
      selectedLocation !== 'all' ? selectedLocation : '',
      selectedAreas.length > 0 ? selectedAreas.join(', ') : '',
      transactionType !== 'buy' ? transactionType : '',
      propertyCategory !== 'residential' ? propertyCategory : '',
      propertySubtype !== 'all' ? propertySubtype : '',
      bhkType !== 'all' ? bhkType : '',
    ].filter(Boolean).join(', ');

    if (user) {
      console.log('Attempting to store search activity for user:', user.id);
      try {
        const { error } = await supabase.from('user_activities').insert({
          user_id: user.id,
          activity_type: 'search',
          search_query: searchQueryText || 'General Search',
          metadata: {
            filters: {
              location: selectedLocation,
              areas: selectedAreas,
              transactionType,
              propertyCategory,
              propertySubtype,
              bhkType,
            },
          },
        });
        if (error) {
          console.error('Error storing search activity:', error);
          toast({
            title: "Search History Error",
            description: `Failed to save search: ${error.message}`,
            variant: "destructive",
          });
        } else {
          console.log('Search activity stored successfully!');
          toast({
            title: "Search Saved",
            description: "Your search has been added to history.",
            variant: "success",
          });
        }
      } catch (error) {
        console.error('Exception storing search activity:', error);
        toast({
          title: "Search History Error",
          description: "An unexpected error occurred while saving search.",
          variant: "destructive",
        });
      }
    } else {
      console.log('User not logged in, skipping search activity storage.');
      toast({
        title: "Login Required",
        description: "Log in to save your search history.",
        variant: "info",
      });
    }

    navigate(`/search?${searchParams.toString()}`);
  };

  const locationOptions = [
    { value: 'all', label: t('all_locations') },
    ...AURANGABAD_AREAS.map(area => ({
      value: area,
      label: translateEnum(area, language as any)
    }))
  ];

  const handleLocationSelect = (value: string) => {
    setSelectedLocation(value);
    // Handle dropdown selection
    if (value === 'all') {
      setSelectedAreas([]);
    } else if (value !== 'all' && !selectedAreas.includes(value)) {
      // This is a dropdown selection for a specific location
      // Add it to selectedAreas only if it's not already there
      setSelectedAreas(prev => {
        const newAreas = [...prev, value];
        const uniqueAreas = [...new Set(newAreas)]; // Remove duplicates just in case
        return uniqueAreas;
      });
    }
  };

  const handleAreaSelection = (areas: string[]) => {
    // Remove duplicates from the areas array
    const uniqueAreas = [...new Set(areas)];
    
    setSelectedAreas(uniqueAreas);
    if (uniqueAreas.length > 0) {
      setSelectedLocation(uniqueAreas[0]);
    } else {
      setSelectedLocation('all');
    }
  };

  const handlePostProperty = () => {
    if (!user) {
      setShowAuthDialog(true);
    } else {
      navigate('/dashboard');
    }
  };
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Solid Background Layer */}
      <div className="absolute inset-0 bg-white dark:bg-black"></div>
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-90 dark:opacity-80" 
        style={{ backgroundImage: "url('/uploads/city_ai.jpg')" }}
      >
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/30 dark:bg-black/40"></div>
      </div>

      {/* Curved Background Elements (kept for subtle effect, adjusted opacity) */}
      <div className="absolute inset-0 opacity-20">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="heroGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="heroGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.08" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          <path d="M0,200 Q250,50 500,150 T1000,100 L1000,0 L0,0 Z" fill="url(#heroGradient1)" />
          <path d="M0,400 Q300,250 600,350 T1000,300 L1000,0 L0,0 Z" fill="url(#heroGradient2)" />
        </svg>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-3xl animate-float" style={{
        animationDelay: '2s'
      }} />
        <div className="absolute top-1/2 left-3/4 w-24 h-24 bg-secondary/5 rounded-full blur-3xl animate-float" style={{
        animationDelay: '4s'
      }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full pt-20 pb-16">
        {/* Featured mini-carousel above title */}
        <div className="w-full mb-8 mt-8">
          <MiniFeaturedCarousel />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
          {/* Hero Title */}
          <div className="relative space-y-4 max-w-4xl mx-auto">
            <div className="relative z-10">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
                <span className="text-blue-800 dark:text-blue-300">
                  {t('find_your_perfect')}
                </span>
                <span className="text-foreground"> {t('property_in')}</span>
              </h1>
              <AnimatedCityName />
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-foreground max-w-2xl mx-auto font-light leading-relaxed">
            {t('discover_premium_real_estate')}
          </p>

          {/* Modern Search Interface */}
          <div className="w-full max-w-4xl mx-auto mt-12">
            <div className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-3xl p-6 shadow-xl">
              
              {/* Transaction Type Tabs */}
              <div className="flex justify-center mb-6">
                {/* ... (transaction type buttons) */}
                {['buy', 'rent', 'lease'].map(type => <button key={type} onClick={() => setTransactionType(type)} className={`px-6 py-3 rounded-xl font-medium capitalize transition-all duration-300 ${transactionType === type ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}>
                      {t(type)}
                    </button>)}
                </div>

              {/* Search Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"> {/* Changed to md:grid-cols-3 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">{t('property_type_label')}</label>
                  <select value={propertyCategory} onChange={e => {
                    setPropertyCategory(e.target.value);
                    // Reset subtype and BHK when category changes
                    setPropertySubtype('all');
                    if (e.target.value === 'land') {
                      setBhkType('all'); // Reset BHK for land
                    }
                  }} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="residential">{t('residential')}</option>
                    <option value="commercial">{t('commercial')}</option>
                    <option value="land">{t('land')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">{t('category_label')}</label>
                  <select value={propertySubtype} onChange={e => setPropertySubtype(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="all">{t('all_types')}</option>
                    {propertyCategory === 'land' ? (
                      // Land specific options
                      <>
                        <option value="commercial">{t('commercial')}</option>
                        <option value="residential">{t('residential')}</option>
                        <option value="agricultural">{t('agricultural')}</option>
                      </>
                    ) : propertyCategory === 'residential' ? (
                      // Residential property options
                      <>
                        <option value="plot_land">{t('plot_land')}</option>
                        <option value="house">{t('house')}</option>
                        <option value="flat_apartment">{t('flat_apartment')}</option>
                        <option value="villa">{t('villa')}</option>
                        <option value="row_house">{t('row_house')}</option>
                        <option value="townhouse">{t('townhouse')}</option>
                        <option value="bungalow">{t('bungalow')}</option>
                        <option value="penthouse">{t('penthouse')}</option>
                        <option value="studio_apartment">{t('studio_apartment')}</option>
                        <option value="farmhouse">{t('farmhouse')}</option>
                        <option value="condominium">{t('condominium')}</option>
                        <option value="duplex_triplex">{t('duplex_triplex')}</option>
                        <option value="mansion">{t('mansion')}</option>
                        <option value="cottage">{t('cottage')}</option>
                        <option value="serviced_apartment">{t('serviced_apartment')}</option>
                        <option value="garden_flat">{t('garden_flat')}</option>
                        <option value="loft_apartment">{t('loft_apartment')}</option>
                        <option value="holiday_home">{t('holiday_home')}</option>
                      </>
                    ) : propertyCategory === 'commercial' ? (
                      // Commercial property options
                      <>
                        <option value="shop_retail">{t('shop_retail')}</option>
                        <option value="office_space">{t('office_space')}</option>
                        <option value="showroom">{t('showroom')}</option>
                        <option value="warehouse_godown">{t('warehouse_godown')}</option>
                        <option value="hotel_motel">{t('hotel_motel')}</option>
                        <option value="restaurant_cafe">{t('restaurant_cafe')}</option>
                        <option value="shopping_mall">{t('shopping_mall')}</option>
                        <option value="clinic_hospital">{t('clinic_hospital')}</option>
                        <option value="coworking_space">{t('coworking_space')}</option>
                        <option value="industrial_shed">{t('industrial_shed')}</option>
                        <option value="commercial_land">{t('commercial_land')}</option>
                        <option value="it_park">{t('it_park')}</option>
                        <option value="school_college">{t('school_college')}</option>
                        <option value="cinema_multiplex">{t('cinema_multiplex')}</option>
                        <option value="banquet_hall">{t('banquet_hall')}</option>
                        <option value="petrol_pump">{t('petrol_pump')}</option>
                        <option value="bank">{t('bank')}</option>
                        <option value="gymnasium">{t('gymnasium')}</option>
                        <option value="cold_storage">{t('cold_storage')}</option>
                        <option value="resort">{t('resort')}</option>
                      </>
                    ) : (
                      // Default fallback options
                      <>
                        <option value="apartment">{t('apartment')}</option>
                        <option value="villa">{t('villa')}</option>
                        <option value="house">{t('house')}</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-medium ${
                    !shouldShowBHK() 
                      ? 'text-muted-foreground/50' 
                      : 'text-muted-foreground'
                  }`}>
                    {t('bhk_label')}
                  </label>
                  <select 
                    value={bhkType} 
                    onChange={e => setBhkType(e.target.value)} 
                    disabled={!shouldShowBHK()}
                    className={`w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent ${
                      !shouldShowBHK()
                        ? 'bg-muted cursor-not-allowed opacity-50'
                        : 'bg-background'
                    }`}
                  >
                    <option value="all">{!shouldShowBHK() ? t('not_applicable') : t('any')}</option>
                    {shouldShowBHK() && (
                      <>
                        <option value="1bhk">{t('1_bhk')}</option>
                        <option value="2bhk">{t('2_bhk')}</option>
                        <option value="3bhk">{t('3_bhk')}</option>
                        <option value="4bhk">{t('4_bhk')}</option>
                        <option value="5bhk">{t('5_bhk')}</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Location Dropdown - now spans full width */}
                <div className="space-y-2 md:col-span-3"> {/* Added md:col-span-3 */}
                  <label className="text-sm font-medium text-muted-foreground">{t('location_label')}</label>
                  <Combobox
                    options={locationOptions}
                    value={selectedLocation}
                    onValueChange={handleLocationSelect}
                    placeholder={t('select_location')}
                    emptyMessage={t('no_location_found')}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Interactive Map Section */}
              <div className="mb-6">
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-foreground mb-1">{t('select_area_on_map')}</h4>
                  <p className="text-xs text-muted-foreground">{t('click_on_grid_squares')}</p>
                </div>
                <GridBasedAurangabadMap selectedAreas={selectedAreas} onAreaSelection={handleAreaSelection} onLocationSelect={handleLocationSelect} />
                {selectedAreas.length > 0 && <div className="mt-3 flex flex-wrap gap-1">
                    {[...new Set(selectedAreas)].map((area, index) => <span key={`${area}-${index}`} className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                        {translateEnum(area, language as any)}
                        <button onClick={() => {
                          setSelectedAreas(prev => {
                            const filtered = prev.filter(a => a !== area);
                            const unique = [...new Set(filtered)];
                            return unique;
                          });
                        }} className="ml-1 hover:text-destructive">
                          ×
                        </button>
                      </span>)}
                  </div>}
              </div>

              {/* Search Button */}
              <Button onClick={handleSearch} size="lg" className="w-full md:w-auto px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transform transition-all duration-300 hover:scale-105 shadow-lg">
                <Search className="mr-2 h-5 w-5" />
                {t('search_properties')}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button onClick={handlePostProperty} size="lg" className="relative px-8 py-4 text-lg font-semibold rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all duration-300 border-2 border-primary/20 hover:border-primary/40 shadow-lg hover:shadow-xl hover:shadow-secondary/30 hover:scale-105 hover:-translate-y-0.5 before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-primary/10 before:via-accent/10 before:to-primary/10 before:animate-pulse before:-z-10">
              <Home className="mr-2 h-5 w-5" />
              {t('post_free_property_ad')}
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center space-x-2 mt-8">
            <div className="flex items-center space-x-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-full border border-border/50 text-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                <span className="text-primary font-bold animate-pulse">{totalProperties.toLocaleString()}</span> {t('verified_properties')}
              </span>
            </div>
          </div>
        </div>
        
        {/* Recently Posted Properties Carousel */}
        <div className="w-full mt-8">
          <MiniLatestCarousel />
        </div>
      </div>

      {/* Auth Dialog */}
      <GoogleSignInDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
};