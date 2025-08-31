import React from 'react';
import { Card } from '@/components/ui/card';
import { Search, Home, TrendingUp, Shield, MapPin, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';


export const ModernServicesSection: React.FC = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Search,
      title: t('smart_property_search'),
      description: t('ai_powered_search'),
      color: 'text-blue-500',
      gradient: 'from-blue-500/10 to-blue-600/5'
    },
    {
      icon: Home,
      title: t('property_valuation'),
      description: t('get_accurate_market'),
      color: 'text-green-500',
      gradient: 'from-green-500/10 to-green-600/5'
    },
    {
      icon: TrendingUp,
      title: t('market_analytics'),
      description: t('real_time_insights'),
      color: 'text-purple-500',
      gradient: 'from-purple-500/10 to-purple-600/5'
    },
    {
      icon: Shield,
      title: t('verified_listings'),
      description: t('all_properties_verified'),
      color: 'text-orange-500',
      gradient: 'from-orange-500/10 to-orange-600/5'
    },
    {
      icon: MapPin,
      title: t('location_intelligence'),
      description: t('detailed_area_insights'),
      color: 'text-red-500',
      gradient: 'from-red-500/10 to-red-600/5'
    },
    {
      icon: Users,
      title: t('expert_consultation'),
      description: t('connect_with_verified'),
      color: 'text-teal-500',
      gradient: 'from-teal-500/10 to-teal-600/5'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <svg 
          className="absolute bottom-0 left-0 w-full h-32" 
          viewBox="0 0 1000 100" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,0 Q250,100 500,50 T1000,25 L1000,100 L0,100 Z" 
            fill="hsl(var(--muted))"
            fillOpacity="0.3"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {t('premium_services')}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('experience_the_future')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card 
              key={service.title}
              className="group p-8 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl rounded-3xl"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className={`h-8 w-8 ${service.color}`} />
              </div>
              
              <h3 className="text-xl font-semibold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                {service.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-primary/10 rounded-full border border-primary/20">
            <span className="text-sm font-medium text-primary">{t('all_services_included')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};