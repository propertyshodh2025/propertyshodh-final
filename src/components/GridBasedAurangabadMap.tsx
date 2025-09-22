import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateEnum } from '@/lib/staticTranslations';

interface GridMapProps {
  selectedAreas: string[];
  onAreaSelection: (areas: string[]) => void;
  onLocationSelect: (location: string) => void;
}

// Define a 10x8 grid system for Aurangabad map
const GRID_ROWS = 8;
const GRID_COLS = 10;

// Map grid coordinates to location names
const gridLocationMap: Record<string, string> = {
  // Row 2
  '2-3': 'Ansar Colony', '2-5': 'Seeda Colony', '2-6': 'Jahagir Colony', '2-7': 'Roshan Gate',
  
  // Row 3
  '3-3': 'Ramgopal Nagar', '3-4': 'Bismillah Colony', '3-5': 'Delhi Gate', '3-6': 'Kat Kat Gate', '3-7': 'Hudco', '3-8': 'Naregaon',
  
  // Row 4 (Central)
  '4-3': 'Aurangabad Cantonment', '4-4': 'Nirala Bazaar', '4-5': 'Chelipura', '4-6': 'Baijipura', '4-7': 'CIDCO N5', '4-8': 'Cidco N1', '4-9': 'chikhalthana',
  
  // Row 5
  '5-2': 'Tisgaon', '5-3': 'Aurangabad Cantonment', '5-4': 'New Osmanpura', '5-5': 'Ulkanagri /MondhaNaka', '5-6': 'Pundalik nagar', '5-7': 'Sector N4', '5-8': 'Jai bhawani Nagar',
  
  // Row 6 (South-Central)
  '6-1': 'Shahajapur', '6-2': 'Dharmapura', '6-3': 'Golwadi', '6-4': 'Hamid Colony/Silk mill Colony', '6-5': 'Satar /Deolai Parisar', '6-6': 'Garkheda', '6-7': 'Mukundwadi', '6-8': 'Airport',
  
  // Row 7
  '7-1': 'Ranjangaon', '7-2': 'Waluj', '7-5': 'Jijau Nagar', '7-6': 'Mahada Colony', '7-7': 'Deolai', '7-8': 'Chikalthana Railway Station',
  
  // Row 8 (South)
  '8-1': 'Jogeshwari', '8-2': 'Pandharpaur', '8-3': 'Kanchanwadi', '8-6': 'Satara Tanda',
};

export const GridBasedAurangabadMap: React.FC<GridMapProps> = ({
  selectedAreas,
  onAreaSelection,
  onLocationSelect
}) => {
  const [hoveredGrid, setHoveredGrid] = useState<string | null>(null);
  const { language } = useLanguage();

  const handleGridClick = (gridId: string) => {
    const location = gridLocationMap[gridId];
    if (!location) return;

    // Update selected areas
    const newAreas = selectedAreas.includes(location)
      ? selectedAreas.filter(area => area !== location)
      : [...selectedAreas, location];
    
    onAreaSelection(newAreas);
    
    // Update the dropdown to reflect the change
    if (!selectedAreas.includes(location)) {
      // Set the dropdown to show this location when adding
      onLocationSelect(location);
    } else {
      // Reset to 'all' when removing the last location or multiple locations exist
      const remainingAreas = newAreas.length;
      if (remainingAreas === 0) {
        onLocationSelect('all');
      } else if (remainingAreas === 1) {
        onLocationSelect(newAreas[0]);
      }
      // Don't change dropdown if multiple areas are selected
    }
  };

  const isGridSelected = (gridId: string) => {
    const location = gridLocationMap[gridId];
    return location && selectedAreas.includes(location);
  };

  const hasLocation = (gridId: string) => {
    return gridLocationMap[gridId] !== undefined;
  };

  const getGridColor = (gridId: string) => {
    if (!hasLocation(gridId)) return 'transparent';
    
    const location = gridLocationMap[gridId];
    const isSelected = selectedAreas.includes(location);
    const isHovered = hoveredGrid === gridId;
    
    if (isSelected) return 'hsl(var(--primary))';
    if (isHovered) return 'hsl(var(--primary)/50)';
    return 'hsl(var(--muted))';
  };

  return (
    <div className="relative w-full h-96 bg-muted/10 rounded-lg border overflow-hidden">
      {/* Static Map Background */}
      <img 
        src="/uploads/4403114e-88fe-4a66-adf0-361fde09a0e5.png"
        alt="Aurangabad City Map"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-8 gap-0 p-2">
        {Array.from({ length: GRID_ROWS }, (_, row) =>
          Array.from({ length: GRID_COLS }, (_, col) => {
            const gridId = `${row + 1}-${col + 1}`;
            const location = gridLocationMap[gridId];
            
            return (
              <div
                key={gridId}
                className={`relative border border-white/10 transition-all duration-200 ${
                  hasLocation(gridId) ? 'cursor-pointer hover:border-white/40 hover:bg-primary/20' : 'cursor-default'
                }`}
                style={{ 
                  backgroundColor: isGridSelected(gridId) ? 'rgba(59, 130, 246, 0.3)' : 'transparent'
                }}
                onClick={() => hasLocation(gridId) && handleGridClick(gridId)}
                onMouseEnter={() => hasLocation(gridId) && setHoveredGrid(gridId)}
                onMouseLeave={() => setHoveredGrid(null)}
                title={location ? translateEnum(location, language as any) : ''}
              >
                {/* Location marker for grids with locations */}
                {hasLocation(gridId) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full border-2 transition-all duration-200 ${
                      isGridSelected(gridId) 
                        ? 'bg-white border-primary shadow-lg' 
                        : 'bg-primary/80 border-white/60'
                    }`} />
                  </div>
                )}
                
                {/* Location name on hover/selection */}
                {(hoveredGrid === gridId || isGridSelected(gridId)) && location && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                    {translateEnum(location, language as any)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 text-xs border shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-primary/80 border-2 border-white/60"></div>
          <span>Available Areas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white border-2 border-primary"></div>
          <span>Selected Areas</span>
        </div>
      </div>
      
      {/* Selection Counter */}
      <div className="absolute bottom-4 right-4 bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-primary-foreground border shadow-lg">
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3" />
          <span className="font-medium">
            {selectedAreas.length > 0 ? `${selectedAreas.length} selected` : 'Click grid to select'}
          </span>
        </div>
      </div>
    </div>
  );
};