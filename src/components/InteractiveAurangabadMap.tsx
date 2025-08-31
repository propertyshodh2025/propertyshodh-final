import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateEnum } from '@/lib/staticTranslations';

interface InteractiveAurangabadMapProps {
  selectedAreas: string[];
  onAreaSelection: (areas: string[]) => void;
}

// Enhanced area data with polygon coordinates for better precision
const areaPolygons: Record<string, { 
  name: string; 
  points: string; 
  center: { x: number; y: number };
  category: 'residential' | 'commercial' | 'mixed';
}> = {
  // Central Business District
  'town-centre': { 
    name: 'Town Centre', 
    points: '48,42 52,42 52,46 48,46', 
    center: { x: 50, y: 44 },
    category: 'commercial'
  },
  'station-road': { 
    name: 'Station Road', 
    points: '46,40 50,40 50,44 46,44', 
    center: { x: 48, y: 42 },
    category: 'mixed'
  },
  'kranti-chowk': { 
    name: 'Kranti Chowk', 
    points: '50,38 54,38 54,42 50,42', 
    center: { x: 52, y: 40 },
    category: 'commercial'
  },
  
  // CIDCO Area
  'cidco': { 
    name: 'CIDCO', 
    points: '62,58 68,58 68,62 62,62', 
    center: { x: 65, y: 60 },
    category: 'residential'
  },
  'cidco-n1': { 
    name: 'CIDCO N-1', 
    points: '60,56 64,56 64,60 60,60', 
    center: { x: 62, y: 58 },
    category: 'residential'
  },
  'cidco-n2': { 
    name: 'CIDCO N-2', 
    points: '64,56 68,56 68,60 64,60', 
    center: { x: 66, y: 58 },
    category: 'residential'
  },
  
  // Old City Areas
  'osmanpura': { 
    name: 'Osmanpura', 
    points: '43,36 47,36 47,40 43,40', 
    center: { x: 45, y: 38 },
    category: 'residential'
  },
  'new-usmanpura': { 
    name: 'New Usmanpura', 
    points: '45,38 49,38 49,42 45,42', 
    center: { x: 47, y: 40 },
    category: 'residential'
  },
  'aurangpura': { 
    name: 'Aurangpura', 
    points: '47,35 51,35 51,39 47,39', 
    center: { x: 49, y: 37 },
    category: 'mixed'
  },
  'shahgunj': { 
    name: 'Shahgunj', 
    points: '44,33 48,33 48,37 44,37', 
    center: { x: 46, y: 35 },
    category: 'commercial'
  },
  
  // Eastern Development
  'beed-bypass': { 
    name: 'Beed Bypass', 
    points: '70,46 74,46 74,50 70,50', 
    center: { x: 72, y: 48 },
    category: 'mixed'
  },
  'chikalthana': { 
    name: 'Chikalthana MIDC', 
    points: '73,50 77,50 77,54 73,54', 
    center: { x: 75, y: 52 },
    category: 'commercial'
  },
  'seven-hills': { 
    name: 'Seven Hills', 
    points: '76,53 80,53 80,57 76,57', 
    center: { x: 78, y: 55 },
    category: 'residential'
  },
  
  // Southern Areas
  'garkheda': { 
    name: 'Garkheda', 
    points: '56,50 60,50 60,54 56,54', 
    center: { x: 58, y: 52 },
    category: 'residential'
  },
  'kanchanwadi': { 
    name: 'Kanchanwadi', 
    points: '38,53 42,53 42,57 38,57', 
    center: { x: 40, y: 55 },
    category: 'residential'
  },
  'satara-parisar': { 
    name: 'Satara Parisar', 
    points: '40,56 44,56 44,60 40,60', 
    center: { x: 42, y: 58 },
    category: 'residential'
  },
  
  // Western Development
  'waluj': { 
    name: 'Waluj MIDC', 
    points: '16,70 22,70 22,74 16,74', 
    center: { x: 19, y: 72 },
    category: 'commercial'
  },
  'shendra-midc': { 
    name: 'Shendra MIDC', 
    points: '80,38 84,38 84,42 80,42', 
    center: { x: 82, y: 40 },
    category: 'commercial'
  },
  'paithan-road': { 
    name: 'Paithan Road', 
    points: '23,43 27,43 27,47 23,47', 
    center: { x: 25, y: 45 },
    category: 'mixed'
  },
  
  // Northern Areas
  'jalna-road': { 
    name: 'Jalna Road', 
    points: '53,23 57,23 57,27 53,27', 
    center: { x: 55, y: 25 },
    category: 'mixed'
  },
  'harsul': { 
    name: 'Harsul', 
    points: '56,20 60,20 60,24 56,24', 
    center: { x: 58, y: 22 },
    category: 'residential'
  },
  'mondha-naka': { 
    name: 'Mondha Naka', 
    points: '60,26 64,26 64,30 60,30', 
    center: { x: 62, y: 28 },
    category: 'mixed'
  },
  
  // Premium Residential
  'samarth-nagar': { 
    name: 'Samarth Nagar', 
    points: '53,46 57,46 57,50 53,50', 
    center: { x: 55, y: 48 },
    category: 'residential'
  },
  'jyoti-nagar': { 
    name: 'Jyoti Nagar', 
    points: '58,48 62,48 62,52 58,52', 
    center: { x: 60, y: 50 },
    category: 'residential'
  },
  'vedant-nagar': { 
    name: 'Vedant Nagar', 
    points: '68,43 72,43 72,47 68,47', 
    center: { x: 70, y: 45 },
    category: 'residential'
  },
  'bajaj-nagar': { 
    name: 'Bajaj Nagar', 
    points: '61,45 65,45 65,49 61,49', 
    center: { x: 63, y: 47 },
    category: 'residential'
  }
};

export const InteractiveAurangabadMap: React.FC<InteractiveAurangabadMapProps> = ({
  selectedAreas,
  onAreaSelection
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [filterCategory, setFilterCategory] = useState<'all' | 'residential' | 'commercial' | 'mixed'>('all');
  const { language } = useLanguage();

  const handleAreaClick = (areaId: string) => {
    const newAreas = selectedAreas.includes(areaId)
      ? selectedAreas.filter(id => id !== areaId)
      : [...selectedAreas, areaId];
    onAreaSelection(newAreas);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.8));
  const handleReset = () => {
    setZoomLevel(1);
    onAreaSelection([]);
  };

  const getAreaColor = (area: typeof areaPolygons[string], areaId: string) => {
    const isSelected = selectedAreas.includes(areaId);
    
    if (isSelected) return 'hsl(var(--primary))';
    
    switch (area.category) {
      case 'residential': return '#10B981';
      case 'commercial': return '#F59E0B';
      case 'mixed': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const filteredAreas = Object.entries(areaPolygons).filter(([_, area]) => 
    filterCategory === 'all' || area.category === filterCategory
  );

  return (
    <div className="relative w-full h-[500px] bg-muted/10 rounded-lg border overflow-hidden">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          className="bg-background/95 backdrop-blur-sm"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          className="bg-background/95 backdrop-blur-sm"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="bg-background/95 backdrop-blur-sm"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLabels(!showLabels)}
          className="bg-background/95 backdrop-blur-sm"
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>

      {/* Category Filter */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        {(['all', 'residential', 'commercial', 'mixed'] as const).map((category) => (
          <Button
            key={category}
            variant={filterCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(category)}
            className="bg-background/95 backdrop-blur-sm capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Map Background */}
      <img 
        src="/uploads/4403114e-88fe-4a66-adf0-361fde09a0e5.png"
        alt="Aurangabad City Map"
        className="w-full h-full object-cover"
        style={{ transform: `scale(${zoomLevel})` }}
      />
      
      {/* Interactive Overlay */}
      <svg
        viewBox="0 0 100 80"
        className="absolute inset-0 w-full h-full cursor-pointer"
        preserveAspectRatio="xMidYMid meet"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* Area Polygons */}
        {filteredAreas.map(([areaId, area]) => {
          const isSelected = selectedAreas.includes(areaId);
          const color = getAreaColor(area, areaId);
          
          return (
            <g key={areaId}>
              {/* Area Polygon */}
              <polygon
                points={area.points}
                fill={isSelected ? color : `${color}40`}
                stroke={color}
                strokeWidth="0.3"
                className="cursor-pointer transition-all duration-200 hover:opacity-80"
                onClick={() => handleAreaClick(areaId)}
              />
              
              {/* Selection Effect */}
              {isSelected && (
                <polygon
                  points={area.points}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.5"
                  opacity="0.8"
                  className="animate-pulse"
                />
              )}
              
              {/* Area Labels */}
              {showLabels && (isSelected || zoomLevel > 1.2) && (
                <text
                  x={area.center.x}
                  y={area.center.y}
                  textAnchor="middle"
                  fontSize={zoomLevel > 1.2 ? "1.2" : "1"}
                  fill="white"
                  className="font-bold pointer-events-none drop-shadow-md"
                  style={{ textShadow: '0 0 3px rgba(0,0,0,0.8)' }}
                >
                  {translateEnum(area.name, language as any)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Enhanced Legend */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 text-sm border shadow-lg max-w-xs">
        <h4 className="font-semibold mb-2">Area Categories</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
            <span>Residential</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
            <span>Commercial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8B5CF6' }}></div>
            <span>Mixed Use</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2" style={{ borderColor: 'hsl(var(--primary))' }}></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
      
      {/* Selection Counter */}
      <div className="absolute bottom-4 right-4 bg-primary/90 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-primary-foreground border shadow-lg">
        <span className="font-medium">
          {selectedAreas.length > 0 
            ? `${selectedAreas.length} area${selectedAreas.length > 1 ? 's' : ''} selected` 
            : 'Click areas to select'
          }
        </span>
      </div>
    </div>
  );
};