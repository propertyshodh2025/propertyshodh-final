
import React, { useState, useEffect } from 'react';
import { Radar, MapPin, Crosshair, Zap, Settings, ChevronDown, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RadarInterfaceProps {
  onInitiateScan: () => void;
  onListProperty: () => void;
  totalProperties: number;
}

const rangeOptions = [
  { value: 15, label: '15 KM' },
  { value: 25, label: '25 KM' },
  { value: 35, label: '35 KM' },
  { value: 50, label: '50 KM' }
];

const detectionModes = [
  { value: 'residential', label: 'RESIDENTIAL' },
  { value: 'commercial', label: 'COMMERCIAL' },
  { value: 'industrial', label: 'INDUSTRIAL' },
  { value: 'all', label: 'ALL TYPES' }
];

export const RadarInterface: React.FC<RadarInterfaceProps> = ({ onInitiateScan, onListProperty, totalProperties }) => {
  const [scannerAngle, setScannerAngle] = useState(0);
  const [isScanning, setIsScanning] = useState(true);
  const [selectedRange, setSelectedRange] = useState(15);
  const [selectedMode, setSelectedMode] = useState('residential');

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScannerAngle(prev => (prev + 2) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const handleInitiateScan = () => {
    setIsScanning(false);
    setTimeout(() => {
      onInitiateScan();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-background flex flex-col items-center justify-center p-4 relative">
      {/* Theme Toggle - Fixed positioning for mobile */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Header */}
      <div className="text-center mb-8 mt-16 md:mt-8">
        <h1 className="text-3xl md:text-6xl font-bold text-green-400 mb-2 font-mono tracking-wider">
          PROPERTY<span className="text-blue-400">SHODH</span>
        </h1>
        <p className="text-green-300 text-lg md:text-xl font-mono mb-2">REAL ESTATE DETECTION SYSTEM</p>
        <div className="flex items-center justify-center">
          <div className="bg-green-400/10 backdrop-blur-sm border border-green-400/20 rounded-full px-3 py-1">
            <span className="text-green-300 text-xs md:text-sm font-mono">
              Aurangabad (Chhatrapati Sambhaji Nagar)
            </span>
          </div>
        </div>
      </div>

      {/* Radar Display - Reduced size further */}
      <div className="relative mb-8 md:mb-12">
        <div className="relative w-48 h-48 md:w-64 md:h-64">
          {/* Concentric Circles */}
          {[1, 2, 3, 4, 5].map((ring, index) => (
            <div
              key={ring}
              className="absolute border border-green-400 rounded-full animate-pulse"
              style={{
                width: `${ring * 20}%`,
                height: `${ring * 20}%`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.8 - (index * 0.15),
                animation: `pulse ${2 + index * 0.5}s infinite`
              }}
            />
          ))}

          {/* Crosshair Lines */}
          <div className="absolute w-full h-0.5 bg-green-400 top-1/2 transform -translate-y-1/2 opacity-50" />
          <div className="absolute h-full w-0.5 bg-green-400 left-1/2 transform -translate-x-1/2 opacity-50" />

          {/* Center Dot */}
          <div className="absolute w-3 h-3 md:w-4 md:h-4 bg-green-400 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-green-400/50 animate-pulse" />

          {/* Scanning Beam - Fixed to rotate from center */}
          <div
            className="absolute w-1/2 h-0.5 bg-gradient-to-r from-green-400 via-green-400 to-transparent origin-left opacity-80"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${scannerAngle}deg)`,
              transition: isScanning ? 'none' : 'transform 0.5s ease-out'
            }}
          />

          {/* Property Dots */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30) + (scannerAngle * 0.1);
            const radius = 30 + (i * 4);
            const x = Math.cos(angle * Math.PI / 180) * radius;
            const y = Math.sin(angle * Math.PI / 180) * radius;
            
            return (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-400 rounded-full animate-ping"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '2s'
                }}
              />
            );
          })}

          {/* Radar Overlay */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/30 rounded-full pointer-events-none" />
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-card/50 backdrop-blur-md border border-border/30 rounded-lg p-4 md:p-6 max-w-md w-full">
        {/* Status Indicators */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6 text-center">
          <div className="bg-muted/50 rounded p-2 md:p-3">
            <div className="text-green-400 font-mono text-xs">STATUS</div>
            <div className="text-green-300 font-bold text-sm">ONLINE</div>
          </div>
          <div className="bg-muted/50 rounded p-2 md:p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto flex flex-col items-center hover:bg-transparent">
                  <div className="text-blue-400 font-mono text-xs">RANGE</div>
                  <div className="text-blue-300 font-bold text-sm flex items-center">
                    {selectedRange} KM <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-border">
                {rangeOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSelectedRange(option.value)}
                    className="text-foreground hover:bg-accent"
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="bg-muted/50 rounded p-2 md:p-3">
            <div className="text-yellow-400 font-mono text-xs">TARGETS</div>
            <div className="text-yellow-300 font-bold text-sm">{totalProperties}</div>
          </div>
        </div>

        {/* System Info */}
        <div className="space-y-2 mb-4 md:mb-6 font-mono text-xs md:text-sm">
          <div className="flex justify-between text-green-300">
            <span>RADAR SWEEP:</span>
            <span>{isScanning ? 'ACTIVE' : 'STANDBY'}</span>
          </div>
          <div className="flex justify-between text-blue-300">
            <span>DETECTION MODE:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto text-blue-300 hover:text-blue-200 hover:bg-transparent">
                  <span className="flex items-center">
                    {detectionModes.find(m => m.value === selectedMode)?.label} <ChevronDown className="ml-1 h-3 w-3" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-border">
                {detectionModes.map((mode) => (
                  <DropdownMenuItem
                    key={mode.value}
                    onClick={() => setSelectedMode(mode.value)}
                    className="text-foreground hover:bg-accent"
                  >
                    {mode.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex justify-between text-yellow-300">
            <span>COORDINATE:</span>
            <span>19.876°N, 75.343°E</span>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleInitiateScan}
            className="w-full h-10 md:h-12 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white font-bold text-sm md:text-lg border-0 shadow-lg shadow-green-400/25 transition-all duration-300 hover:shadow-green-400/40 font-mono"
          >
            <Zap className="mr-2 h-4 w-4" />
            INITIATE PROPERTY SCAN
          </Button>

          <Button
            onClick={onListProperty}
            variant="outline"
            className="w-full h-10 md:h-12 border-orange-400/30 bg-orange-400/10 hover:bg-orange-400/20 text-orange-300 hover:text-orange-200 font-bold text-sm md:text-base font-mono transition-all duration-300"
          >
            <Home className="mr-2 h-4 w-4" />
            LIST YOUR PROPERTY
          </Button>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-3 font-mono">
          SCAN FOR PROPERTIES OR LIST YOUR OWN
        </p>
      </div>
    </div>
  );
};
