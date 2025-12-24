// Image compression utilities

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  thumbnailWidth?: number;
  thumbnailHeight?: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  thumbnailWidth: 300,
  thumbnailHeight: 300,
};

/**
 * Compress a base64 image
 * @param base64 - Base64 string (with or without data URI prefix)
 * @param options - Compression options
 * @returns Compressed base64 string (without data URI prefix)
 */
export async function compressImage(
  base64: string,
  options: CompressionOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Add data URI prefix if not present
  const dataUri = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;

        if (width > opts.maxWidth || height > opts.maxHeight) {
          const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        const compressed = canvas.toDataURL('image/jpeg', opts.quality);

        // Remove data URI prefix
        const base64Data = compressed.split(',')[1];
        resolve(base64Data);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = dataUri;
  });
}

/**
 * Create a thumbnail from base64 image
 * @param base64 - Base64 string (with or without data URI prefix)
 * @param options - Compression options
 * @returns Thumbnail base64 string (without data URI prefix)
 */
export async function createThumbnail(
  base64: string,
  options: CompressionOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Add data URI prefix if not present
  const dataUri = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate thumbnail dimensions (cover mode - crop to square)
        const size = Math.min(opts.thumbnailWidth, opts.thumbnailHeight);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate crop dimensions to maintain aspect ratio
        const scale = Math.max(size / img.width, size / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (size - scaledWidth) / 2;
        const y = (size - scaledHeight) / 2;

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Convert to base64 with high compression for thumbnail
        const thumbnail = canvas.toDataURL('image/jpeg', 0.6);

        // Remove data URI prefix
        const base64Data = thumbnail.split(',')[1];
        resolve(base64Data);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = dataUri;
  });
}

/**
 * Get size of base64 string in bytes
 */
export function getBase64Size(base64: string): number {
  // Remove data URI prefix if present
  const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');

  // Calculate size (base64 adds ~33% overhead)
  return Math.ceil((cleanBase64.length * 3) / 4);
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate image size
 * @param base64 - Base64 string
 * @param maxSizeBytes - Maximum size in bytes (default 5MB)
 */
export function validateImageSize(base64: string, maxSizeBytes: number = 5 * 1024 * 1024): boolean {
  const size = getBase64Size(base64);
  return size <= maxSizeBytes;
}
