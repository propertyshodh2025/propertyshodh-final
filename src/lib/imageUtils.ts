export interface CompressedImage {
  file: File;
  url: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export interface ImageUploadProgress {
  progress: number;
  stage: 'compressing' | 'uploading' | 'complete' | 'error';
  message: string;
}

/**
 * Compresses an image file using HTML5 Canvas
 */
export const compressImage = async (
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<CompressedImage> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;

      // Set canvas dimensions
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          const compressionRatio = ((file.size - compressedFile.size) / file.size) * 100;

          resolve({
            file: compressedFile,
            url: URL.createObjectURL(blob),
            originalSize: file.size,
            compressedSize: compressedFile.size,
            compressionRatio: Math.round(compressionRatio),
          });
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generates a thumbnail from an image file
 */
export const generateThumbnail = async (
  file: File,
  size = 300
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Make square thumbnail
      const minDim = Math.min(img.width, img.height);
      const startX = (img.width - minDim) / 2;
      const startY = (img.height - minDim) / 2;

      canvas.width = size;
      canvas.height = size;

      ctx?.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to generate thumbnail'));
            return;
          }
          resolve(URL.createObjectURL(blob));
        },
        'image/jpeg',
        0.9
      );
    };

    img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validates image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a valid image file (JPEG, PNG, or WebP)' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Image file must be less than 10MB' };
  }

  return { valid: true };
};

/**
 * Formats file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};