import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateEnum } from '@/lib/staticTranslations';

interface AurangabadMapProps {
  selectedAreas: string[];
  onAreaClick: (areaId: string) => void;
}

// Real coordinates for Aurangabad areas (mapped to actual map positions)
const areaCoordinates: Record<string, { x: number; y: number; name: string }> = {
  // Central areas
  'cidco': { x: 65, y: 60, name: 'CIDCO' },
  'town-centre': { x: 50, y: 45, name: 'Town Centre' },
  'station-road': { x: 48, y: 42, name: 'Station Road' },
  'kranti-chowk': { x: 52, y: 40, name: 'Kranti Chowk' },
  
  // Old city areas
  'osmanpura': { x: 45, y: 38, name: 'Osmanpura' },
  'new-usmanpura': { x: 47, y: 40, name: 'New Usmanpura' },
  'aurangpura': { x: 49, y: 37, name: 'Aurangpura' },
  'shahgunj': { x: 46, y: 35, name: 'Shahgunj' },
  'begumpura': { x: 44, y: 33, name: 'Begumpura' },
  'nirala-bazar': { x: 50, y: 39, name: 'Nirala Bazar' },
  
  // Southern areas  
  'garkheda': { x: 58, y: 52, name: 'Garkheda' },
  'kanchanwadi': { x: 40, y: 55, name: 'Kanchanwadi' },
  'satara-parisar': { x: 42, y: 58, name: 'Satara Parisar' },
  'padegaon': { x: 35, y: 62, name: 'Padegaon' },
  'deolai': { x: 38, y: 65, name: 'Deolai' },
  'jadhavwadi': { x: 45, y: 68, name: 'Jadhavwadi' },
  
  // Eastern areas
  'beed-bypass': { x: 72, y: 48, name: 'Beed Bypass' },
  'naregaon': { x: 68, y: 45, name: 'Naregaon' },
  'chikalthana': { x: 75, y: 52, name: 'Chikalthana' },
  'seven-hills': { x: 78, y: 55, name: 'Seven Hills' },
  'mgm': { x: 74, y: 58, name: 'MGM' },
  'itkheda': { x: 77, y: 50, name: 'Itkheda' },
  
  // Western areas
  'waluj': { x: 18, y: 72, name: 'Waluj' },
  'shendra-midc': { x: 82, y: 40, name: 'Shendra MIDC' },
  'paithan-road': { x: 25, y: 45, name: 'Paithan Road' },
  'sillod-road': { x: 20, y: 35, name: 'Sillod Road' },
  'khadkeshwar': { x: 28, y: 50, name: 'Khadkeshwar' },
  
  // Northern areas
  'jalna-road': { x: 55, y: 25, name: 'Jalna Road' },
  'harsul': { x: 58, y: 22, name: 'Harsul' },
  'mondha-naka': { x: 62, y: 28, name: 'Mondha Naka' },
  'bhavsinghpura': { x: 52, y: 30, name: 'Bhavsinghpura' },
  
  // Residential colonies
  'samarth-nagar': { x: 55, y: 48, name: 'Samarth Nagar' },
  'jyoti-nagar': { x: 60, y: 50, name: 'Jyoti Nagar' },
  'bansilal-nagar': { x: 57, y: 42, name: 'Bansilal Nagar' },
  'shreya-nagar': { x: 65, y: 38, name: 'Shreya Nagar' },
  'vedant-nagar': { x: 70, y: 45, name: 'Vedant Nagar' },
  'bajaj-nagar': { x: 63, y: 47, name: 'Bajaj Nagar' },
  'tilak-nagar': { x: 54, y: 44, name: 'Tilak Nagar' },
  'mayur-park': { x: 61, y: 53, name: 'Mayur Park' },
  
  // Other localities
  'gulmandi': { x: 47, y: 50, name: 'Gulmandi' },
  'ulkanagari': { x: 53, y: 55, name: 'Ulkanagari' },
  'mukundwadi': { x: 56, y: 58, name: 'Mukundwadi' },
  'pundlik-nagar': { x: 59, y: 60, name: 'Pundlik Nagar' },
  'chishtiya-colony': { x: 43, y: 52, name: 'Chishtiya Colony' },
  'jawahar-colony': { x: 46, y: 62, name: 'Jawahar Colony' },
  'nakshatrawadi': { x: 51, y: 57, name: 'Nakshatrawadi' },
  'padampura': { x: 48, y: 54, name: 'Padampura' },
  'dashmesh-nagar': { x: 52, y: 51, name: 'Dashmesh Nagar' },
  'shahanurwadi': { x: 44, y: 48, name: 'Shahanurwadi' },
  'kotla-colony': { x: 41, y: 46, name: 'Kotla Colony' },
};

export const AurangabadMap: React.FC<AurangabadMapProps> = ({
  selectedAreas,
  onAreaClick
}) => {
  const { language } = useLanguage();
  return (
    <div className="relative w-full h-96 bg-muted/10 rounded-lg border overflow-hidden">
      {/* Static Map Image Background */}
      <img 
        src="/uploads/4403114e-88fe-4a66-adf0-361fde09a0e5.png"
        alt="Aurangabad City Map"
        className="w-full h-full object-cover"
      />
      
      {/* Overlay SVG for interactive markers */}
      <svg
        viewBox="0 0 100 80"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Area markers positioned over real map */}
        {Object.entries(areaCoordinates).map(([areaId, area]) => {
          const isSelected = selectedAreas.includes(areaId);
          return (
            <g key={areaId}>
              {/* Area circle */}
              <circle
                cx={area.x}
                cy={area.y}
                r={isSelected ? "1.2" : "0.8"}
                fill={isSelected ? "#3B82F6" : "#10B981"}
                stroke="white"
                strokeWidth="0.3"
                className="cursor-pointer transition-colors duration-200 drop-shadow-lg"
                onClick={() => onAreaClick(areaId)}
              />
              
              {/* Ripple effect for selected areas */}
              {isSelected && (
                <circle
                  cx={area.x}
                  cy={area.y}
                  r="2"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.1"
                  opacity="0.6"
                  className="animate-ping"
                />
              )}
              
              {/* Area label - show when selected */}
              {isSelected && (
                <text
                  x={area.x}
                  y={area.y - 2}
                  textAnchor="middle"
                  fontSize="1.5"
                  fill="white"
                  className="font-bold pointer-events-none drop-shadow-md"
                  style={{ textShadow: '0 0 3px rgba(0,0,0,0.8)' }}
                >
                  {translateEnum(area.name, language)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 text-xs border shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
          <span className="text-foreground">Available Areas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
          <span className="text-foreground">Selected Areas</span>
        </div>
      </div>
      
      {/* Area count indicator */}
      <div className="absolute bottom-4 right-4 bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-primary-foreground border shadow-lg">
        <span className="font-medium">
          {selectedAreas.length > 0 ? `${selectedAreas.length} selected` : 'Click areas to select'}
        </span>
      </div>
    </div>
  );
};