import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AreaStat {
  areaId: string;
  areaName: string;
  propertyCount: number;
}

interface PropertyStatsPanelProps {
  totalProperties: number;
}

const PropertyStatsPanel: React.FC<PropertyStatsPanelProps> = ({ totalProperties }) => {
  const [areaStats, setAreaStats] = useState<AreaStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAreaStats = async () => {
      try {
        const { data: properties, error } = await supabase
          .from('properties')
          .select('location')
          .eq('listing_status', 'Active');

        if (error) {
          console.error('Error fetching properties:', error);
          return;
        }

        // Count properties by location
        const locationCounts: { [key: string]: number } = {};
        properties?.forEach(property => {
          const location = property.location;
          locationCounts[location] = (locationCounts[location] || 0) + 1;
        });

        // Convert to AreaStat format and sort by count
        const stats: AreaStat[] = Object.entries(locationCounts)
          .map(([location, count]) => ({
            areaId: location.toLowerCase().replace(/\s+/g, '-'),
            areaName: location,
            propertyCount: count
          }))
          .sort((a, b) => b.propertyCount - a.propertyCount);

        setAreaStats(stats);
      } catch (error) {
        console.error('Error fetching area stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAreaStats();
  }, []);

  const topAreas = areaStats.slice(0, 5);
  const hotSpots = areaStats.filter(area => area.propertyCount > 10); // Adjusted threshold

  return (
    <Card className="h-full border-0 bg-card/50 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-light text-foreground">Property Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Total Properties */}
        <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
          <div className="text-3xl font-light text-primary mb-1">
            {totalProperties.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Verified Properties</div>
        </div>

        {/* Hot Spots */}
        <div>
          <h3 className="font-medium mb-4 text-foreground">
            Hot Spots
            <span className="text-xs text-muted-foreground ml-2">(10+ Properties)</span>
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-10 bg-muted/50 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : hotSpots.length > 0 ? (
            <div className="space-y-3">
              {hotSpots.map((area) => (
                <div key={area.areaId} className="flex justify-between items-center p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/50 dark:border-orange-800/20">
                  <span className="text-sm font-medium text-foreground">{area.areaName}</span>
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full font-medium">
                    {area.propertyCount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hot spots available</p>
          )}
        </div>

        {/* Top Areas */}
        <div>
          <h3 className="font-medium mb-4 text-foreground">Top Areas</h3>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-10 bg-muted/50 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : topAreas.length > 0 ? (
            <div className="space-y-2">
              {topAreas.map((area, index) => (
                <div key={area.areaId} className="flex justify-between items-center p-3 rounded-xl hover:bg-muted/30 transition-all duration-200 border border-transparent hover:border-border/30">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-primary bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm text-foreground">{area.areaName}</span>
                  </div>
                  <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full font-medium">
                    {area.propertyCount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No areas data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyStatsPanel;