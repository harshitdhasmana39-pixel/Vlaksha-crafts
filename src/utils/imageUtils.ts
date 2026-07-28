/**
 * Generates responsive image source props (src and srcSet) for a given image URL.
 * Designed to dynamically request high-definition optimized sizes for Unsplash images and fall back
 * gracefully for local or custom user-uploaded images.
 */
export interface ResponsiveImageProps {
  src: string;
  srcSet?: string;
}

export function getResponsiveImageProps(imageUrl: string, defaultWidth = 800): ResponsiveImageProps {
  if (!imageUrl) {
    return { src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=85&w=800&auto=format&fit=crop' };
  }

  // Check if it is an Unsplash image to apply custom high-definition parameter scaling
  if (imageUrl.includes('images.unsplash.com')) {
    try {
      // Split clean URL path from existing query parameters
      const urlParts = imageUrl.split('?');
      const basePath = urlParts[0];
      const existingParamsStr = urlParts[1] || '';
      
      const searchParams = new URLSearchParams(existingParamsStr);
      searchParams.set('auto', 'format');
      searchParams.set('fit', 'crop');

      // Define width steps for srcSet mapping up to 1600px for crystal-clear 4K / Retina display
      const widths = [200, 400, 600, 800, 1000, 1200, 1600];
      
      const srcSet = widths
        .map(w => {
          const params = new URLSearchParams(searchParams.toString());
          params.set('w', w.toString());
          // High definition quality for craft mirror-work sharpness
          const quality = w < 400 ? '80' : '88';
          params.set('q', quality);
          return `${basePath}?${params.toString()} ${w}w`;
        })
        .join(', ');

      // Default source for browsers that don't support srcSet or as fallback
      const defaultParams = new URLSearchParams(searchParams.toString());
      defaultParams.set('w', defaultWidth.toString());
      defaultParams.set('q', '88');
      const src = `${basePath}?${defaultParams.toString()}`;

      return {
        src,
        srcSet,
      };
    } catch (e) {
      console.warn("Failed to generate responsive Unsplash props, using fallback:", e);
    }
  }

  // Fallback for non-Unsplash images (data URLs, blobs, or other domain hosting)
  return {
    src: imageUrl,
  };
}

/**
 * Compresses an image file to a base64 string to avoid QuotaExceededError
 * in localStorage and Firestore 1MB limits. Resizes the image to a maximum dimension while maintaining aspect ratio,
 * and iterates to ensure the string length stays under safe limits.
 */
export async function compressImage(file: File, maxWidth = 800, quality = 0.7, maxStringLength = 50000): Promise<string> {
  const validation = validateImageSize(file, 5);
  if (!validation.valid) {
    return Promise.reject(new Error(validation.error));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let currentMaxWidth = maxWidth;
        let currentQuality = quality;
        let compressedBase64 = '';

        const compress = () => {
          let width = img.width;
          let height = img.height;

          if (width > currentMaxWidth) {
            height = Math.round((height * currentMaxWidth) / width);
            width = currentMaxWidth;
          }
          if (height > currentMaxWidth) {
            width = Math.round((width * currentMaxWidth) / height);
            height = currentMaxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return img.src;
          
          ctx.drawImage(img, 0, 0, width, height);
          return canvas.toDataURL('image/jpeg', currentQuality);
        };

        compressedBase64 = compress();

        // Iteratively compress if the payload is huge. Default targets ~50KB per image.
        while (compressedBase64.length > maxStringLength && currentMaxWidth > 100 && currentQuality > 0.1) {
          currentMaxWidth = Math.floor(currentMaxWidth * 0.70);
          currentQuality -= 0.15;
          compressedBase64 = compress();
        }

        resolve(compressedBase64);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Compresses an existing base64 image string to save space.
 */
export async function compressBase64Image(base64Str: string, maxWidth = 800, quality = 0.7, maxStringLength = 50000): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's not a data URL or already heavily compressed, skip
    if (!base64Str.startsWith('data:image/')) {
      return resolve(base64Str);
    }
    
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let currentMaxWidth = maxWidth;
      let currentQuality = quality;
      let compressedBase64 = '';

      const compress = () => {
        let width = img.width;
        let height = img.height;

        if (width > currentMaxWidth) {
          height = Math.round((height * currentMaxWidth) / width);
          width = currentMaxWidth;
        }
        if (height > currentMaxWidth) {
          width = Math.round((width * currentMaxWidth) / height);
          height = currentMaxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return base64Str;
        
        ctx.drawImage(img, 0, 0, width, height);
        return canvas.toDataURL('image/jpeg', currentQuality);
      };

      compressedBase64 = compress();

      // Iteratively compress if the payload is huge
      while (compressedBase64.length > maxStringLength && currentMaxWidth > 100 && currentQuality > 0.1) {
        currentMaxWidth = Math.floor(currentMaxWidth * 0.70);
        currentQuality -= 0.15;
        compressedBase64 = compress();
      }

      resolve(compressedBase64);
    };
    img.onerror = (error) => reject(error);
  });
}

/**
 * Validates an image file before processing to prevent massive files from
 * crashing the browser or hitting storage quotas.
 */
export function validateImageSize(file: File, maxSizeMB = 5): { valid: boolean; error?: string } {
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: `Image must be less than ${maxSizeMB}MB.` };
  }
  return { valid: true };
}

/**
 * Uploads a base64 image string to Firebase Storage if it is a data URL.
 * If it's already an HTTP URL (from a previous upload), it returns it unchanged.
 */
export async function uploadBase64ToStorage(base64Str: string, path: string): Promise<string> {
  if (!base64Str.startsWith('data:image/')) {
    return base64Str;
  }
  
  try {
    const { storage } = await import('../services/firebase');
    const { ref, uploadString, getDownloadURL } = await import('firebase/storage');
    
    // Create a unique filename if path is a directory, or use the path directly
    const isDirectory = path.endsWith('/');
    const finalPath = isDirectory ? `${path}${Date.now()}-${Math.random().toString(36).substring(7)}` : path;
    
    const storageRef = ref(storage, finalPath);
    await uploadString(storageRef, base64Str, 'data_url');
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error(`Failed to upload image to Firebase Storage at ${path}:`, error);
    // If upload fails, fallback to returning the base64 string (or handle differently)
    // To ensure UI doesn't break, returning base64 allows it to save locally if Firestore fails
    return base64Str;
  }
}
