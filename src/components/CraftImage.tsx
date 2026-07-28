import React, { useState } from 'react';
import { getResponsiveImageProps } from '../utils/imageUtils';

export interface CraftImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  defaultWidth?: number;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string; // e.g., 'aspect-square', 'aspect-4/3'
  colorOverlayHex?: string; // Optional color variant tint overlay
  showShimmer?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
}

export default function CraftImage({
  src,
  alt,
  defaultWidth = 600,
  className = '',
  containerClassName = '',
  aspectRatio = 'aspect-square',
  colorOverlayHex,
  showShimmer = true,
  loading = 'lazy',
  sizes,
  style,
  ...props
}: CraftImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Fallback high quality craft image
  const fallbackSrc = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=85&w=800&auto=format&fit=crop';
  const effectiveSrc = hasError || !src ? fallbackSrc : src;
  const imageProps = getResponsiveImageProps(effectiveSrc, defaultWidth);

  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${containerClassName}`}>
      {/* Skeleton Shimmer Loader */}
      {showShimmer && !isLoaded && (
        <div className="absolute inset-0 bg-stone-200/70 animate-pulse flex items-center justify-center z-0">
          <div className="w-full h-full bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 animate-shimmer" />
        </div>
      )}

      {/* Main Craft Image */}
      <img
        {...props}
        src={imageProps.src}
        srcSet={imageProps.srcSet}
        sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        alt={alt}
        loading={loading}
        style={style}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-contain transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-xs'
        } ${className}`}
      />

      {/* Optional Color Variant Tint Overlay */}
      {colorOverlayHex && isLoaded && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-500 opacity-25 mix-blend-color"
          style={{ backgroundColor: colorOverlayHex }}
        />
      )}
    </div>
  );
}
