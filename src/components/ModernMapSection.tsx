import React, { useState } from 'react';
import { AurangabadMap } from './AurangabadMap';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, Building } from 'lucide-react';

export const ModernMapSection: React.FC = () => {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const handleAreaClick = (areaId: string) => {
    setSelectedAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  const mapStats = [
    { icon: Building, label: 'Total Properties', value: '2,500+', color: 'text-primary' },
    { icon: TrendingUp, label: 'Active Listings', value: '1,800+', color: 'text-accent' },
    { icon: MapPin, label: 'Verified Areas', value: '45+', color: 'text-secondary' }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern id="mapPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="hsl(var(--primary))" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mapPattern)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Explore Aurangabad
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover prime locations across the city with our interactive map
          </p>
        </div>

        {/* Map Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {mapStats.map((stat, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-0 hover:bg-card/80 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-2xl bg-primary/10">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Interactive Map */}
        <Card className="overflow-hidden rounded-3xl border-0 bg-card/50 backdrop-blur-sm shadow-xl">
          <CardContent className="p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-2">Interactive City Map</h3>
              <p className="text-muted-foreground">Click on areas to explore properties in different localities</p>
              {selectedAreas.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedAreas.map(area => (
                    <Badge key={area} variant="secondary" className="capitalize">
                      {area.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="rounded-2xl overflow-hidden border border-border/50">
              <AurangabadMap
                selectedAreas={selectedAreas}
                onAreaClick={handleAreaClick}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};