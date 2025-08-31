import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Diamond, Home, Shield, ArrowRight } from 'lucide-react';

export const ServicesSection: React.FC = () => {
  const services = [
    {
      icon: CreditCard,
      title: 'Pay on Credit',
      description: 'Pay your rent using Credit Card',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Diamond,
      title: 'Housing Premium',
      description: 'Instant access to zero brokerage properties',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Home,
      title: 'Home Loans',
      description: 'Lowest Interest rate offers',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Shield,
      title: 'Housing Protect',
      description: 'Protection against cyber frauds',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-foreground">
            Property Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive solutions for all your property needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-500 border-0 bg-card/50 backdrop-blur-sm hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${service.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <service.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-medium text-lg text-card-foreground mb-3">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button variant="outline" className="rounded-full px-8 py-3 hover:bg-accent">
            <span>Explore All Services</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};