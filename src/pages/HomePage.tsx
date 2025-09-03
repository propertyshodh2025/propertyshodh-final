"use client";

import React, { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { TranslatableText } from '@/components/TranslatableText';
import MiniLatestCarousel from '@/components/MiniLatestCarousel';
import MarketInsights from '@/components/MarketInsights';
import MarketData from '@/components/MarketData';
import HeroSection from '@/components/HeroSection';
import PropertySearch from '@/components/PropertySearch';
import Testimonials from '@/components/Testimonials';
import CallToAction from '@/components/CallToAction';
import FeaturedPropertiesSection from '@/components/FeaturedPropertiesSection';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <HeroSection />

      <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <PropertySearch />
      </section>

      <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">
          <TranslatableText text="Explore Our Premium Services" />
        </h2>
        {/* The MiniFeaturedCarousel was here */}
        <FeaturedPropertiesSection />
      </section>

      <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <MiniLatestCarousel />
      </section>

      <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <MarketInsights />
      </section>

      <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <MarketData />
      </section>

      <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Testimonials />
      </section>

      <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <CallToAction />
      </section>

      <div className="fixed bottom-6 right-6 z-50">
        <Link to="/list-property">
          <Button className="rounded-full w-16 h-16 shadow-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center">
            <Plus className="h-8 w-8" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;