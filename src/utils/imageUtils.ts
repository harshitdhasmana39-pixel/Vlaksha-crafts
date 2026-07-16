/**
 * Generates responsive image source props (src and srcSet) for a given image URL.
 * Designed to dynamically request optimized sizes for Unsplash images and fall back
 * gracefully for local or custom user-uploaded images.
 */
export interface ResponsiveImageProps {
  src: string;
  srcSet?: string;
}

export function getResponsiveImageProps(imageUrl: string, defaultWidth = 600): ResponsiveImageProps {
  if (!imageUrl) {
    return { src: '' };
  }

  // Check if it is an Unsplash image to apply custom parameter scaling
  if (imageUrl.includes('images.unsplash.com')) {
    try {
      // Split clean URL path from existing query parameters
      const urlParts = imageUrl.split('?');
      const basePath = urlParts[0];
      const existingParamsStr = urlParts[1] || '';
      
      const searchParams = new URLSearchParams(existingParamsStr);
      searchParams.set('auto', 'format');
      searchParams.set('fit', 'crop');

      // Define width steps for srcSet mapping
      const widths = [150, 300, 450, 600, 800, 1000, 1200];
      
      const srcSet = widths
        .map(w => {
          const params = new URLSearchParams(searchParams.toString());
          params.set('w', w.toString());
          // Adjust quality: lower quality for small widths saves bandwidth, standard quality for larger
          const quality = w < 400 ? '70' : '80';
          params.set('q', quality);
          return `${basePath}?${params.toString()} ${w}w`;
        })
        .join(', ');

      // Default source for browsers that don't support srcSet or as fallback
      const defaultParams = new URLSearchParams(searchParams.toString());
      defaultParams.set('w', defaultWidth.toString());
      defaultParams.set('q', '80');
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
