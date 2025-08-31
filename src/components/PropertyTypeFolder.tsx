import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FolderOpen, 
  Folder, 
  Building, 
  Home, 
  Castle,
  MapPin as LandIcon,
  Building2,
  ChevronDown,
  ChevronRight,
  Bed
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PropertyTypeData {
  id: string;
  name: string;
  icon: React.ElementType;
  count: number;
  bedroomBreakdown: { type: string; count: number }[];
}

interface PropertyTypeFolderProps {
  onTypeSelect?: (type: string) => void;
}

const PropertyTypeFolder: React.FC<PropertyTypeFolderProps> = ({ onTypeSelect }) => {
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(['apartment']));
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        const { data: properties, error } = await supabase
          .from('properties')
          .select('property_type, bhk')
          .eq('listing_status', 'Active');

        if (error) {
          console.error('Error fetching properties:', error);
          return;
        }

        // Count properties by type and BHK
        const typeCounts: { [key: string]: { total: number; bhkBreakdown: { [key: string]: number } } } = {};
        
        properties?.forEach(property => {
          const type = property.property_type?.toLowerCase() || 'unknown';
          const bhk = property.bhk;
          
          if (!typeCounts[type]) {
            typeCounts[type] = { total: 0, bhkBreakdown: {} };
          }
          
          typeCounts[type].total++;
          
          if (bhk) {
            const bhkLabel = bhk >= 4 ? '4+ BHK' : `${bhk} BHK`;
            typeCounts[type].bhkBreakdown[bhkLabel] = (typeCounts[type].bhkBreakdown[bhkLabel] || 0) + 1;
          }
        });

        // Map to PropertyTypeData format
        const typeMapping: { [key: string]: { name: string; icon: React.ElementType } } = {
          'apartment': { name: 'Apartments', icon: Building },
          'flat': { name: 'Apartments', icon: Building },
          'villa': { name: 'Villas', icon: Castle },
          'bungalow': { name: 'Bungalows', icon: Home },
          'house': { name: 'Houses', icon: Home },
          'commercial': { name: 'Commercial', icon: Building2 },
          'office': { name: 'Commercial', icon: Building2 },
          'shop': { name: 'Commercial', icon: Building2 },
          'land': { name: 'Land/Plots', icon: LandIcon },
          'plot': { name: 'Land/Plots', icon: LandIcon }
        };

        const processedTypes: PropertyTypeData[] = Object.entries(typeCounts).map(([type, data]) => {
          const mapping = typeMapping[type] || { name: type.charAt(0).toUpperCase() + type.slice(1), icon: Building };
          
          return {
            id: type,
            name: mapping.name,
            icon: mapping.icon,
            count: data.total,
            bedroomBreakdown: Object.entries(data.bhkBreakdown).map(([bhkType, count]) => ({
              type: bhkType,
              count
            })).sort((a, b) => {
              // Sort by BHK order: 1 BHK, 2 BHK, 3 BHK, 4+ BHK
              const order = ['1 BHK', '2 BHK', '3 BHK', '4+ BHK'];
              return order.indexOf(a.type) - order.indexOf(b.type);
            })
          };
        }).sort((a, b) => b.count - a.count);

        setPropertyTypes(processedTypes);
      } catch (error) {
        console.error('Error fetching property data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, []);

  const toggleFolder = (folderId: string) => {
    const newOpenFolders = new Set(openFolders);
    if (newOpenFolders.has(folderId)) {
      newOpenFolders.delete(folderId);
    } else {
      newOpenFolders.add(folderId);
    }
    setOpenFolders(newOpenFolders);
  };

  const getBadgeVariant = (count: number) => {
    if (count > 80) return 'default';
    if (count > 40) return 'secondary';
    return 'outline';
  };

  return (
    <Card className="bg-background/95 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          Property Categories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="text-sm text-muted-foreground p-4 text-center">Loading property categories...</div>
        ) : propertyTypes.length === 0 ? (
          <div className="text-sm text-muted-foreground p-4 text-center">No properties found</div>
        ) : (
          propertyTypes.map((type) => {
          const isOpen = openFolders.has(type.id);
          const IconComponent = type.icon;
          
          return (
            <Collapsible key={type.id} open={isOpen} onOpenChange={() => toggleFolder(type.id)}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-2 h-auto hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    {isOpen ? (
                      <FolderOpen className="w-4 h-4 text-primary" />
                    ) : (
                      <Folder className="w-4 h-4 text-muted-foreground" />
                    )}
                    <IconComponent className="w-4 h-4" />
                    <span className="font-medium">{type.name}</span>
                  </div>
                  <Badge variant={getBadgeVariant(type.count)} className="ml-2">
                    {type.count}
                  </Badge>
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="ml-6 mt-1 space-y-1">
                {type.bedroomBreakdown.map((breakdown, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start p-2 h-auto text-sm hover:bg-muted/30"
                    onClick={() => onTypeSelect?.(breakdown.type)}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-4" /> {/* Spacer for alignment */}
                      <Bed className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{breakdown.type}</span>
                    </div>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {breakdown.count}
                    </Badge>
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyTypeFolder;