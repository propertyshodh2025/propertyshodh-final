import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Home, TrendingUp, ChevronDown, Map } from 'lucide-react';
import { AnimatedCityName } from '@/components/AnimatedCityName';
import { GoogleSignInDialog } from '@/components/auth/GoogleSignInDialog';
import { GridBasedAurangabadMap } from '@/components/GridBasedAurangabadMap';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import MiniFeaturedCarousel from '@/components/MiniFeaturedCarousel'; // Reverted import
import { MiniLatestCarousel } from '@/components/MiniLatestCarousel'; // Reverted import
import { AURANGABAD_AREAS } from '@/lib/aurangabadAreas';
import { translateEnum } from '@/lib/staticTranslations';

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
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (selectedLocation !== 'all') searchParams.set('location', selectedLocation);
    if (selectedAreas.length > 0) searchParams.set('areas', selectedAreas.join(','));
    if (transactionType !== 'buy') searchParams.set('transaction', transactionType);
    if (propertyCategory !== 'residential') searchParams.set('category', propertyCategory);
    if (propertySubtype !== 'all') searchParams.set('subtype', propertySubtype);
    if (bhkType !== 'all') searchParams.set('bedrooms', bhkType);
    navigate(`/search?${searchParams.toString()}`);
  };
  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    // Also add to selected areas if not already there
    if (!selectedAreas.includes(location)) {
      setSelectedAreas(prev => [...prev, location]);
    }
  };
  const handleAreaSelection = (areas: string[]) => {
    setSelectedAreas(areas);
    // Update dropdown to show first selected area
    if (areas.length > 0) {
      setSelectedLocation(areas[0]);
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
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: "url('/uploads/city_ai.jpg')" }}
      >
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
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
              <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="00.08" />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
          {/* Featured mini-carousel above title */}
          <div className="w-full max-w-5xl mx-auto">
            <MiniFeaturedCarousel />
          </div>

          {/* Hero Title */}
          <br />
          <br />
          <br />
          <br />
          <div className="relative space-y-4 max-w-4xl mx-auto">
            <div className="relative z-10">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
                  {t('find_your_perfect')}
                </span>
                <span className="text-white"> {t('property_in')}</span>
              </h1>
              <AnimatedCityName />
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white max-w-2xl mx-auto font-light leading-relaxed">
            {t('discover_premium_real_estate')}
          </p>

          {/* Modern Search Interface */}
          <div className="w-full max-w-4xl mx-auto mt-12">
            <div className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-3xl p-6 shadow-xl">
              
              {/* Transaction Type Tabs */}
              <div className="flex justify-center mb-6">
                <div className="bg-muted/50 rounded-2xl p-1 flex">
                  {['buy', 'rent', 'lease'].map(type => <button key={type} onClick={() => setTransactionType(type)} className={`px-6 py-3 rounded-xl font-medium capitalize transition-all duration-300 ${transactionType === type ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}>
                      {t(type)}
                    </button>)}
                </div>
              </div>

              {/* Search Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">{t('property_type_label')}</label>
                  <select value={propertyCategory} onChange={e => setPropertyCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="residential">{t('residential')}</option>
                    <option value="commercial">{t('commercial')}</option>
                    <option value="land">{t('land')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">{t('category_label')}</label>
                  <select value={propertySubtype} onChange={e => setPropertySubtype(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="all">{t('all_types')}</option>
                    <option value="apartment">{t('apartment')}</option>
                    <option value="villa">{t('villa')}</option>
                    <option value="house">{t('house')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">{t('bhk_label')}</label>
                  <select value={bhkType} onChange={e => setBhkType(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="all">{t('any')}</option>
                    <option value="1bhk">{t('1_bhk')}</option>
                    <option value="2bhk">{t('2_bhk')}</option>
                    <option value="3bhk">{t('3_bhk')}</option>
                    <option value="4bhk">{t('4_bhk')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">{t('location_label')}</label>
                  <div className="relative">
                    <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} className="w-full px-4 py-3 pr-10 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent appearance-none">
                      <option value="all">{t('all_locations')}</option>
                      {AURANGABAD_AREAS.map(area => (
                        <option key={area} value={area}>
                          {translateEnum(area, language as any)}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
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
                    {selectedAreas.map(area => <span key={area} className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                        {translateEnum(area, language as any)}
                        <button onClick={() => setSelectedAreas(prev => prev.filter(a => a !== area))} className="ml-1 hover:text-destructive">
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

          {/* Recently Posted Properties Carousel */}
          <div className="w-full max-w-5xl mx-auto mt-8">
            <MiniLatestCarousel />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button onClick={handlePostProperty} size="lg" className="relative px-8 py-4 text-lg font-semibold rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all duration-300 border-2 border-primary/20 hover:border-primary/40 shadow-lg hover:shadow-xl before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-primary/10 before:via-accent/10 before:to-primary/10 before:animate-pulse before:-z-10">
              <Home className="mr-2 h-5 w-5" />
              {t('post_free_property_ad')}
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center space-x-2 mt-8">
            <div className="flex items-center space-x-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-full border border-border/50 text-white">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                <span className="text-primary font-bold animate-pulse">{totalProperties.toLocaleString()}</span> {t('verified_properties')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <GoogleSignInDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
};