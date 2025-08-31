import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { aurangabadLocalities } from '@/data/propertyData';
import { AurangabadMap } from './AurangabadMap';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateEnum } from '@/lib/staticTranslations';

interface LocationSelectorProps {
  selectedLocations: string[];
  onLocationChange: (locations: string[]) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocations,
  onLocationChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  const handleLocationToggle = (locationId: string) => {
    if (locationId === 'all') {
      if (selectedLocations.includes('all')) {
        onLocationChange([]);
      } else {
        onLocationChange(['all']);
      }
      return;
    }

    let newLocations = [...selectedLocations];
    
    // Remove 'all' if it's selected and we're selecting specific locations
    if (newLocations.includes('all')) {
      newLocations = newLocations.filter(id => id !== 'all');
    }

    if (newLocations.includes(locationId)) {
      newLocations = newLocations.filter(id => id !== locationId);
    } else {
      newLocations.push(locationId);
    }

    onLocationChange(newLocations);
  };

  const handleMapAreaClick = (areaId: string) => {
    handleLocationToggle(areaId);
  };

  const getDisplayText = () => {
    if (selectedLocations.length === 0) return language === 'marathi' ? 'क्षेत्र निवडा...' : 'Select areas...';
    if (selectedLocations.includes('all')) return language === 'marathi' ? 'सर्व ठिकाणे' : 'All Locations';
    if (selectedLocations.length === 1) {
      const location = aurangabadLocalities.find(l => l.id === selectedLocations[0]);
      return translateEnum(location?.label || '', language) || (language === 'marathi' ? '१ ठिकाण निवडले' : '1 area selected');
    }
    return language === 'marathi' ? `${selectedLocations.length} ठिकाणे निवडली` : `${selectedLocations.length} areas selected`;
  };

  return (
    <div className="space-y-6">
      {/* Dropdown */}
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between h-12 text-left bg-background border-border hover:bg-muted/50"
        >
          <span className="text-foreground">{getDisplayText()}</span>
          <ChevronDown 
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-background border border-border rounded-md shadow-lg">
            <ScrollArea className="h-64">
              <div className="bg-blue-50 p-4 border-b">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all"
                    checked={selectedLocations.includes('all')}
                    onCheckedChange={() => handleLocationToggle('all')}
                  />
                  <label htmlFor="all" className="text-sm font-bold cursor-pointer text-blue-700">
                    ⭐ All Locations
                  </label>
                </div>
              </div>
              <div className="p-2 space-y-1">
                {aurangabadLocalities.filter(location => location.id !== 'all').map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-sm cursor-pointer"
                    onClick={() => handleLocationToggle(location.id)}
                  >
                    <Checkbox
                      checked={selectedLocations.includes(location.id)}
                      onChange={() => {}} // Handled by parent click
                      className="pointer-events-none"
                    />
                    <span className="text-sm text-foreground flex-1">
                      {translateEnum(location.label, language)}
                    </span>
                    {selectedLocations.includes(location.id) && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-border">
        <AurangabadMap
          selectedAreas={selectedLocations}
          onAreaClick={handleMapAreaClick}
        />
      </div>
    </div>
  );
};