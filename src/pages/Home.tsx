import React from 'react';
import { HeroSection } from '@/components/HeroSection';
import { LatestPropertiesSection } from '@/components/LatestPropertiesSection';
import { FeaturedPropertiesSection } from '@/components/FeaturedPropertiesSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { CallToActionSection } from '@/components/CallToActionSection';
import { MarketInsightsSection } from '@/components/MarketInsightsSection';
import { MarketDataSection } from '@/components/MarketDataSection';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturedPropertiesSection /> {/* Render the new Featured Properties section */}
      <LatestPropertiesSection />   {/* Render the renamed Latest Properties section */}
      <MarketInsightsSection />
      <MarketDataSection />
      <TestimonialsSection />
      <CallToActionSection />
    </div>
  );
};

export default Home;