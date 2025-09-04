import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const AnimatedCityName: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const spanRef = useRef<HTMLSpanElement>(null);
  const { language } = useLanguage();
  
  const cityNames = language === 'marathi'
    ? ['छत्रपती संभाजीनगर', 'औरंगाबाद']
    : ['Aurangabad', 'Chhatrapati Sambhaji Nagar'];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % cityNames.length);
        setIsAnimating(false);
      }, 250); // Quick fade duration
    }, 3000);

    return () => clearInterval(interval);
  }, [cityNames.length]);

  return (
    <div className="inline-block">
      {/* Fixed height container for desktop */}
      <span 
        ref={spanRef}
        className={`hidden sm:inline-block whitespace-nowrap transition-all duration-500 ease-in-out transform bg-gradient-to-r from-primary via-purple-600 to-primary dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent text-2xl md:text-3xl lg:text-4xl leading-[1.35] pb-1 overflow-visible ${
          isAnimating 
            ? 'opacity-0 scale-95 blur-[1px]' 
            : 'opacity-100 scale-100 blur-0'
        }`}
      >
        {cityNames[currentIndex]}
      </span>
      
      {/* Fixed height container for mobile - accommodates both single and two-line text */}
      <div className="sm:hidden inline-block min-h-[5rem] flex items-center justify-center overflow-visible py-1">
        <span 
          className={`text-2xl leading-[1.35] text-center bg-gradient-to-r from-primary via-purple-600 to-primary dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent transition-all duration-500 ease-in-out transform pb-1 ${
            isAnimating 
              ? 'opacity-0 scale-95 blur-[1px]' 
              : 'opacity-100 scale-100 blur-0'
          }`}
        >
          {(() => {
            const parts = cityNames[currentIndex].split(' ');
            if (parts.length > 1) {
              return (
                <>
                  {parts[0]}<br />
                  {parts.slice(1).join(' ')}<br />
                </>
              );
            }
            return (
              <>
                {cityNames[currentIndex]}<br />
              </>
            );
          })()}
        </span>
      </div>
    </div>
  );
};