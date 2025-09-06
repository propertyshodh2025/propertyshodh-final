"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Users, Handshake, Lightbulb, ShieldCheck, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Home className="h-8 w-8 text-primary" />,
      title: t('extensive_listings_title'),
      description: t('extensive_listings_description'),
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-green-500" />,
      title: t('verified_properties_title'),
      description: t('verified_properties_description'),
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
      title: t('market_insights_title'),
      description: t('market_insights_description'),
    },
    {
      icon: <Handshake className="h-8 w-8 text-purple-500" />,
      title: t('expert_guidance_title'),
      description: t('expert_guidance_description'),
    },
    {
      icon: <Users className="h-8 w-8 text-orange-500" />,
      title: t('community_focus_title'),
      description: t('community_focus_description'),
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-yellow-500" />,
      title: t('innovative_technology_title'),
      description: t('innovative_technology_description'),
    },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">{t('about_us_title')}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {t('about_us_tagline')}
        </p>
      </header>

      <section className="mb-12">
        <Card className="p-6 sm:p-8 shadow-lg border-0">
          <CardHeader className="text-center mb-6">
            <CardTitle className="text-3xl font-semibold text-primary">{t('our_mission')}</CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-muted-foreground leading-relaxed text-center">
            <p>{t('our_mission_description_p1')}</p>
            <p className="mt-4">{t('our_mission_description_p2')}</p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center text-foreground mb-8">{t('why_choose_us')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-center shadow-md border-0 hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <CardTitle className="text-xl font-semibold mb-2">{feature.title}</CardTitle>
              <CardContent className="text-muted-foreground p-0">
                {feature.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <Card className="p-6 sm:p-8 shadow-lg border-0">
          <CardHeader className="text-center mb-6">
            <CardTitle className="text-3xl font-semibold text-primary">{t('our_values')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg text-muted-foreground leading-relaxed">
            <div>
              <h3 className="font-semibold text-foreground mb-2">{t('transparency')}</h3>
              <p>{t('transparency_description')}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">{t('integrity')}</h3>
              <p>{t('integrity_description')}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">{t('customer_centricity')}</h3>
              <p>{t('customer_centricity_description')}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">{t('innovation')}</h3>
              <p>{t('innovation_description')}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">{t('join_us_title')}</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
          {t('join_us_description')}
        </p>
        <a href="/contact" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors duration-300 shadow-md">
          {t('contact_us')}
        </a>
      </section>
    </div>
  );
};

export default About;