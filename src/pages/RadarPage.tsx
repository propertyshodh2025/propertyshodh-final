"use client";

import React from 'react';
import ModernHeroSection from '@/components/ModernHeroSection'; // Corrected import
import { PropertyShowcase } from '@/components/PropertyShowcase';
import { MarketInsights } from '@/components/MarketInsights';
import { MarketData } from '@/components/MarketData';
import { Testimonials } from '@/components/Testimonials';
import { CallToAction } from '@/components/CallToAction';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslatableText } from '@/components/TranslatableText';

const RadarPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <ModernHeroSection />
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">
              <TranslatableText text="Featured Properties" />
            </h2>
            <PropertyShowcase />
          </div>
        </section>
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">
              <TranslatableText text="Market Insights" />
            </h2>
            <MarketInsights />
          </div>
        </section>
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">
              <TranslatableText text="Local Market Data" />
            </h2>
            <MarketData />
          </div>
        </section>
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">
              <TranslatableText text="What Our Clients Say" />
            </h2>
            <Testimonials />
          </div>
        </section>
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default RadarPage;