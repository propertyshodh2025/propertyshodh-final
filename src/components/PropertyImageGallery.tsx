import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyImageGalleryProps {
  images: string[];
  title: string;
}

export const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});

  const nextImage = useCallback(() => {
    if (images.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  }, [images.length]);

  const prevImage = useCallback(() => {
    if (images.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  }, [images.length]);

  const handleImageLoad = useCallback((index: number) => {
    setImageLoaded(prev => ({ ...prev, [index]: true }));
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className="relative overflow-hidden bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <div className="w-full h-[400px] md:h-[500px] bg-muted/30 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <ZoomIn size={24} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No images available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl group">
        {/* Main Image */}
        <div className="relative w-full h-[400px] md:h-[500px]">
          <img
            src={images[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-105"
            onClick={() => setIsModalOpen(true)}
            loading="lazy"
            onLoad={() => handleImageLoad(currentIndex)}
          />
          
          {/* Loading Skeleton */}
          {!imageLoaded[currentIndex] && (
            <div className="absolute inset-0 bg-muted/50 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                onClick={prevImage}
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white border-0 rounded-full w-12 h-12 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <ChevronLeft size={20} />
              </Button>
              <Button
                onClick={nextImage}
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white border-0 rounded-full w-12 h-12 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <ChevronRight size={20} />
              </Button>
            </>
          )}

          {/* Image Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-white shadow-lg scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Zoom Indicator */}
          <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Click to expand
          </div>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="p-4 bg-white/10 dark:bg-black/10 backdrop-blur-sm">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    index === currentIndex
                      ? 'border-primary shadow-md scale-105'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full">
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white border-0 rounded-full w-12 h-12"
            >
              <X size={20} />
            </Button>
            
            <img
              src={images[currentIndex]}
              alt={`${title} - Full size`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            
            {images.length > 1 && (
              <>
                <Button
                  onClick={prevImage}
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white border-0 rounded-full w-12 h-12"
                >
                  <ChevronLeft size={20} />
                </Button>
                <Button
                  onClick={nextImage}
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white border-0 rounded-full w-12 h-12"
                >
                  <ChevronRight size={20} />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};