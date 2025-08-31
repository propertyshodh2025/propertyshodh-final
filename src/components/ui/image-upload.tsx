import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Progress } from './progress';
import { compressImage, generateThumbnail, validateImageFile, formatFileSize, type CompressedImage } from '@/lib/imageUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
  className?: string;
  uploadMode?: 'immediate' | 'deferred';
  pathPrefix?: string;
  onUploadStart?: () => void;
  onUploadComplete?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  onUploadAllImages?: (uploadFn: () => Promise<string[]>) => void;
}

interface UploadingImage {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'compressing' | 'uploading' | 'complete' | 'error';
  compressedData?: CompressedImage;
}

interface LocalImage {
  id: string;
  file: File;
  preview: string;
  compressedData?: CompressedImage;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  maxImages = 5,
  disabled = false,
  className,
  uploadMode = 'deferred',
  pathPrefix,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  onUploadAllImages,
}) => {
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

const uploadImageToSupabase = async (compressedImage: CompressedImage): Promise<string> => {
  const fileExt = compressedImage.file.name.split('.').pop();
  const baseFolder = pathPrefix || 'uploads';
  const fileName = `${baseFolder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('property-images')
    .upload(fileName, compressedImage.file);

  if (error) throw error;

  const { data } = supabase.storage
    .from('property-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

  const processAndUploadImage = async (file: File, id: string) => {
    try {
      // Update status to compressing
      setUploadingImages(prev => 
        prev.map(img => img.id === id ? { ...img, status: 'compressing', progress: 25 } : img)
      );

      // Compress image
      const compressedImage = await compressImage(file);

      // Update with compressed data
      setUploadingImages(prev => 
        prev.map(img => img.id === id ? { 
          ...img, 
          compressedData: compressedImage, 
          status: 'uploading', 
          progress: 50 
        } : img)
      );

// Upload to Supabase
const publicUrl = await uploadImageToSupabase(compressedImage);

      // Update status to complete
      setUploadingImages(prev => 
        prev.map(img => img.id === id ? { ...img, status: 'complete', progress: 100 } : img)
      );

      // Add to final URLs
      onChange([...value, publicUrl]);

      // Remove from uploading list after a short delay
      setTimeout(() => {
        setUploadingImages(prev => prev.filter(img => img.id !== id));
      }, 1000);

      toast.success(`Image compressed by ${compressedImage.compressionRatio}% and uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadingImages(prev => 
        prev.map(img => img.id === id ? { ...img, status: 'error', progress: 0 } : img)
      );
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleFiles = useCallback(async (files: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const totalImages = value.length + uploadingImages.length + localImages.length + fileArray.length;

    if (totalImages > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    for (const file of fileArray) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        continue;
      }

      const id = `${Date.now()}-${Math.random()}`;
      const preview = URL.createObjectURL(file);

      if (uploadMode === 'immediate') {
        // Add to uploading list for immediate upload
        setUploadingImages(prev => [...prev, {
          id,
          file,
          preview,
          progress: 0,
          status: 'compressing'
        }]);

        // Start processing
        processAndUploadImage(file, id);
      } else {
        // Store locally for deferred upload
        const compressedImage = await compressImage(file);
        setLocalImages(prev => [...prev, {
          id,
          file,
          preview,
          compressedData: compressedImage
        }]);
        
        toast.success(`Image compressed by ${compressedImage.compressionRatio}% and ready for upload!`);
      }
    }
  }, [value, uploadingImages, localImages, maxImages, disabled, onChange, uploadMode]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeUploadedImage = (urlToRemove: string) => {
    onChange(value.filter(url => url !== urlToRemove));
  };

  const removeUploadingImage = (id: string) => {
    setUploadingImages(prev => prev.filter(img => img.id !== id));
  };

  const removeLocalImage = (id: string) => {
    setLocalImages(prev => prev.filter(img => img.id !== id));
  };

  // Method to upload all local images to Supabase
  const uploadAllImages = async (): Promise<string[]> => {
    if (localImages.length === 0) return [];

    onUploadStart?.();
    const uploadedUrls: string[] = [];
    
    try {

      for (let i = 0; i < localImages.length; i++) {
        const localImage = localImages[i];
        
        // Move to uploading state
        setUploadingImages(prev => [...prev, {
          id: localImage.id,
          file: localImage.file,
          preview: localImage.preview,
          progress: 0,
          status: 'uploading',
          compressedData: localImage.compressedData
        }]);

        // Remove from local images
        setLocalImages(prev => prev.filter(img => img.id !== localImage.id));

        // Update progress
        setUploadingImages(prev => 
          prev.map(img => img.id === localImage.id ? { ...img, progress: 50 } : img)
        );

// Upload to Supabase
const publicUrl = await uploadImageToSupabase(localImage.compressedData!);
        uploadedUrls.push(publicUrl);

        // Update to complete
        setUploadingImages(prev => 
          prev.map(img => img.id === localImage.id ? { ...img, status: 'complete', progress: 100 } : img)
        );

        // Remove from uploading after delay
        setTimeout(() => {
          setUploadingImages(prev => prev.filter(img => img.id !== localImage.id));
        }, 1000);
      }

      onUploadComplete?.(uploadedUrls);
      return uploadedUrls;
    } catch (error) {
      console.error('Batch upload error:', error);
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
      throw error;
    }
  };

  const canAddMore = value.length + uploadingImages.length + localImages.length < maxImages;

  // Expose uploadAllImages method to parent component
  React.useEffect(() => {
    if (onUploadAllImages) {
      onUploadAllImages(uploadAllImages);
    }
  }, [onUploadAllImages]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {canAddMore && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary hover:bg-primary/5"
          )}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => !disabled && document.getElementById('image-upload')?.click()}
        >
          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-1">
            Drop images here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WebP • Max 10MB each • {value.length + uploadingImages.length + localImages.length}/{maxImages} images
          </p>
        </div>
      )}

      {/* Local Images (Ready to Upload) */}
      {localImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">
            Ready to Upload {uploadMode === 'deferred' ? '(will upload when you submit)' : ''}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {localImages.map((img) => (
              <div key={img.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={img.preview}
                    alt="Ready to upload"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Ready
                    </div>
                  </div>
                </div>
                
                {img.compressedData && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/75 text-white text-xs">
                    <div className="text-[10px] text-green-300">
                      Compressed: {formatFileSize(img.compressedData.originalSize)} → {formatFileSize(img.compressedData.compressedSize)}
                      ({img.compressedData.compressionRatio}% saved)
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 w-6 h-6"
                  onClick={() => removeLocalImage(img.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploading Images */}
      {uploadingImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Uploading Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {uploadingImages.map((img) => (
              <div key={img.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={img.preview}
                    alt="Uploading"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    {img.status === 'error' ? (
                      <X className="w-6 h-6 text-red-500" />
                    ) : (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    )}
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/75 text-white text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span>{img.status}</span>
                    <span>{img.progress}%</span>
                  </div>
                  <Progress value={img.progress} className="h-1" />
                  {img.compressedData && (
                    <div className="mt-1 text-[10px] text-green-300">
                      {formatFileSize(img.compressedData.originalSize)} → {formatFileSize(img.compressedData.compressedSize)}
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 w-6 h-6"
                  onClick={() => removeUploadingImage(img.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Images */}
      {value.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Uploaded Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {value.map((url, index) => (
              <div key={url} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={url}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeUploadedImage(url)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && uploadingImages.length === 0 && localImages.length === 0 && !canAddMore && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
};