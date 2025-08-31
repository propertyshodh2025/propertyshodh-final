import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Home, Building, Warehouse, TreePine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GoogleSignInDialog } from '@/components/auth/GoogleSignInDialog';
import { LocationSelector } from '@/components/LocationSelector';
import { AnimatedCityName } from '@/components/AnimatedCityName';

interface HeroSectionProps {
  totalProperties: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ totalProperties }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedLocations, setSelectedLocations] = React.useState<string[]>([]);
  const [transactionType, setTransactionType] = React.useState('buy');
  const [propertyCategory, setPropertyCategory] = React.useState('');
  const [propertySubtype, setPropertySubtype] = React.useState('');
  const [bhkType, setBhkType] = React.useState('');
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    // Add the transaction type (buy/rent/lease) to search
    searchParams.set('transactionType', transactionType);
    
    // Add property category if selected
    if (propertyCategory) {
      searchParams.set('propertyCategory', propertyCategory);
    }
    
    // Add property subtype if selected
    if (propertySubtype) {
      searchParams.set('propertySubtype', propertySubtype);
    }
    
    // Add BHK type if selected
    if (bhkType) {
      searchParams.set('bhkType', bhkType);
    }
    
    // Add selected locations if any
    if (selectedLocations.length > 0) {
      searchParams.set('locations', selectedLocations.join(','));
    }
    
    navigate(`/search?${searchParams.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden smooth-transform">
      {/* Modern gradient background with enhanced parallax */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-200 via-purple-200 to-blue-300 dark:from-orange-900/20 dark:via-purple-900/20 dark:to-blue-900/20 parallax-slow">
        <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent dark:from-black/40 animate-fade-in"></div>
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-orange-300/30 dark:bg-orange-600/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-300/30 dark:bg-purple-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Title Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 text-center smooth-transform overflow-visible">
        <div className="max-w-5xl mx-auto overflow-visible">
          {/* Aggressive Layout Isolation - Fixed Grid */}
          <div className="grid grid-rows-[auto_auto_auto] gap-0 reveal-on-scroll revealed overflow-hidden will-change-transform">
            <div className="row-start-1 py-8"></div>
            
            {/* Fixed height title container - completely isolated */}
            <div className="row-start-2 relative h-80 sm:h-auto overflow-hidden">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-foreground leading-[1.2] md:leading-[1.3] lg:leading-[1.4] animate-fade-in overflow-visible">
                {t('hero.title')}
                <br />
                <span className="font-normal bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent animate-scale-in text-base sm:text-xl md:text-2xl lg:text-3xl">
                  {t('hero.subtitle')}
                </span>
              </h1>
              
              {/* Absolutely positioned city name - completely isolated from layout flow */}
              <div className="absolute left-1/2 transform -translate-x-1/2 top-[65%] sm:relative sm:left-0 sm:top-0 sm:transform-none sm:inline sm:ml-2">
                <AnimatedCityName />
              </div>
            </div>
            
            <div className="row-start-3 pt-6">
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {t('hero.description').replace('{{count}}', totalProperties.toLocaleString())}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section - Independent container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16 text-center smooth-transform mt-8">
        <div className="max-w-5xl mx-auto">
          {/* Enhanced search interface with smooth animations */}
          <div className="max-w-4xl mx-auto animate-fade-in fixed-layout" style={{ animationDelay: '0.4s' }}>
            <div className="bg-white/10 dark:bg-black/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-black/10 w-full max-w-4xl mx-auto">
              <Tabs value={transactionType} onValueChange={setTransactionType} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/10 dark:bg-black/10 backdrop-blur-sm h-auto sm:h-14 p-1 rounded-2xl border border-white/10 smooth-transform">
                  <TabsTrigger value="buy" className="text-foreground/70 data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-sm data-[state=active]:text-primary data-[state=active]:shadow-sm text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 rounded-xl font-medium flex items-center justify-center gap-1 sm:gap-2 transition-all duration-300 hover:scale-105">
                    <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{t('search.buy')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="rent" className="text-foreground/70 data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-sm data-[state=active]:text-primary data-[state=active]:shadow-sm text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 rounded-xl font-medium flex items-center justify-center gap-1 sm:gap-2 transition-all duration-300 hover:scale-105">
                    <Building className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{t('search.rent')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="lease" className="text-foreground/70 data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-sm data-[state=active]:text-primary data-[state=active]:shadow-sm text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 rounded-xl font-medium flex items-center justify-center gap-1 sm:gap-2 transition-all duration-300 hover:scale-105">
                    <Warehouse className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{t('search.lease')}</span>
                  </TabsTrigger>
                </TabsList>

                {/* Filter dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Property Category Dropdown */}
                  <Select value={propertyCategory} onValueChange={setPropertyCategory}>
                    <SelectTrigger className="bg-white/5 backdrop-blur-sm text-foreground border border-white/10 h-12 rounded-xl hover:bg-white/10 transition-all duration-300">
                      <SelectValue placeholder={t('search.category')} />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-sm border border-border/50">
                      <SelectItem value="residential">{t('property.residential')}</SelectItem>
                      <SelectItem value="commercial">{t('property.commercial')}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Property Subtype Dropdown */}
                  <Select value={propertySubtype} onValueChange={setPropertySubtype}>
                    <SelectTrigger className="bg-white/5 backdrop-blur-sm text-foreground border border-white/10 h-12 rounded-xl hover:bg-white/10 transition-all duration-300">
                      <SelectValue placeholder={t('search.propertyType')} />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-sm border border-border/50">
                      {propertyCategory === 'residential' ? (
                        <>
                          <SelectItem value="flat">{t('property.flat')}</SelectItem>
                          <SelectItem value="villa">{t('property.villa')}</SelectItem>
                          <SelectItem value="bungalow">{t('property.bungalow')}</SelectItem>
                          <SelectItem value="row_house">{t('property.rowHouse')}</SelectItem>
                          <SelectItem value="plot">{t('property.plot')}</SelectItem>
                        </>
                      ) : propertyCategory === 'commercial' ? (
                        <>
                          <SelectItem value="office">{t('property.office')}</SelectItem>
                          <SelectItem value="shop">{t('property.shop')}</SelectItem>
                          <SelectItem value="warehouse">{t('property.warehouse')}</SelectItem>
                          <SelectItem value="plot">{t('property.plot')}</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="flat">{t('property.flat')}</SelectItem>
                          <SelectItem value="villa">{t('property.villa')}</SelectItem>
                          <SelectItem value="bungalow">{t('property.bungalow')}</SelectItem>
                          <SelectItem value="row_house">{t('property.rowHouse')}</SelectItem>
                          <SelectItem value="plot">{t('property.plot')}</SelectItem>
                          <SelectItem value="office">{t('property.office')}</SelectItem>
                          <SelectItem value="shop">{t('property.shop')}</SelectItem>
                          <SelectItem value="warehouse">{t('property.warehouse')}</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>

                  {/* BHK Type Dropdown */}
                  <Select value={bhkType} onValueChange={setBhkType}>
                    <SelectTrigger className="bg-white/5 backdrop-blur-sm text-foreground border border-white/10 h-12 rounded-xl hover:bg-white/10 transition-all duration-300">
                      <SelectValue placeholder={t('search.bhk')} />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-sm border border-border/50">
                      <SelectItem value="1">{t('property.bhkCount.1')}</SelectItem>
                      <SelectItem value="2">{t('property.bhkCount.2')}</SelectItem>
                      <SelectItem value="3">{t('property.bhkCount.3')}</SelectItem>
                      <SelectItem value="4">{t('property.bhkCount.4')}</SelectItem>
                      <SelectItem value="5+">{t('property.bhkCount.5plus')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Selector */}
                <div className="mb-6">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                    <LocationSelector
                      selectedLocations={selectedLocations}
                      onLocationChange={setSelectedLocations}
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button 
                    onClick={handleSearch}
                    className="bg-primary/90 backdrop-blur-sm hover:bg-primary text-primary-foreground h-14 px-12 rounded-2xl text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 smooth-transform"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    {t('hero.searchProperties')}
                  </Button>
                </div>
              </Tabs>
            </div>
          </div>

          {/* Enhanced call to action with smooth animations */}
          <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="bg-background/70 rounded-2xl p-6 border border-border max-w-md mx-auto mt-12">
              <p className="text-sm text-muted-foreground mb-4">
                {t('hero.propertyOwner')}
              </p>
              <Button 
                variant="outline" 
                className="border border-muted-foreground/40 text-muted-foreground hover:bg-muted/20 hover:text-foreground rounded-xl font-medium"
                onClick={() => {
                  if (!user) {
                    setShowAuthDialog(true);
                  } else {
                    navigate('/dashboard?tab=properties');
                  }
                }}
              >
                {t('hero.postPropertyAd')}
              </Button>
            </div>

            {/* Property count indicator with pulse animation */}
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground smooth-transform">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="animate-fade-in" style={{ animationDelay: '0.8s' }}>{totalProperties.toLocaleString()} {t('hero.verifiedProperties')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <GoogleSignInDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={() => setShowAuthDialog(false)}
      />
    </section>
  );
};