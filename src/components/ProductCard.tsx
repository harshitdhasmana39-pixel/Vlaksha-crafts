import React from 'react';
import { Product } from '../types';
import { Star, Sparkles, Settings, Heart } from 'lucide-react';
import { getResponsiveImageProps } from '../utils/imageUtils';

interface ProductCardProps {
  key?: string;
  product: Product;
  onViewDetails: (productId: string) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string, e: React.MouseEvent) => void;
}

export default function ProductCard({
  product,
  onViewDetails,
  isWishlisted = false,
  onToggleWishlist
}: ProductCardProps) {
  // Pull primary image with responsive props
  const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop';
  const imageProps = getResponsiveImageProps(primaryImage, 400);
  const displayCategory = product.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onViewDetails(product.id)}
      className="group bg-[var(--theme-bg)] rounded-sm overflow-hidden border border-[var(--theme-primary)]/20 hover:border-[var(--theme-primary)]/50 transition-all duration-300 hover:shadow-md cursor-pointer flex flex-col relative"
    >
      {/* Product Image Stage with Custom Rope-Trim Border styling */}
      <div className="relative aspect-square w-full bg-[#f8f5ef] overflow-hidden flex items-center justify-center p-3">
        {/* Absolute Decorative Corner gold-dots */}
        <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)]/40" />
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)]/40" />
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)]/40" />
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)]/40" />

        {/* Visual rope/twist trim as a border style */}
        <div className="absolute inset-2 border border-dashed border-[var(--theme-primary)]/30 rounded-xs pointer-events-none group-hover:scale-[1.02] transition-transform duration-300" />

        {/* The Art Frame circle */}
        <div className="w-full h-full rounded-full overflow-hidden border-[6px] border-white/80 group-hover:scale-105 transition-transform duration-500 ease-out shadow-xs relative">
          <img
            src={imageProps.src}
            srcSet={imageProps.srcSet}
            sizes="(max-width: 640px) 150px, (max-width: 1024px) 250px, 300px"
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
          />
          {/* Shimmer light overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
        </div>

        {/* Floating Customizability / Lead Time badge */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1 z-10">
          {product.isPersonalizable ? (
            <span className="flex items-center gap-1 bg-[var(--theme-primary)] text-white text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-xs shadow-xs font-sans font-medium">
              <Settings className="w-3 h-3 animate-spin-slow" /> Custom
            </span>
          ) : product.isReadyMade ? (
            <span className="flex items-center gap-1 bg-[var(--theme-accent)] text-white text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-xs shadow-xs font-sans font-medium">
              Ready Made
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-white/90 border border-[var(--theme-primary)]/20 text-[#1a1a1a] text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-xs font-sans font-medium">
              Made-to-Order
            </span>
          )}
        </div>

        {/* Floating Wishlist Heart Toggle Button */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id, e);
            }}
            className={`absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full backdrop-blur-xs transition-all duration-300 shadow-xs border ${
              isWishlisted
                ? 'bg-white border-red-200 text-red-500 scale-105'
                : 'bg-white/85 border-[var(--theme-primary)]/25 text-stone-500 hover:text-red-500 hover:bg-white hover:border-red-200 hover:scale-105'
            }`}
            title={isWishlisted ? "Remove from Saved" : "Save for Later"}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Rating overlay floating bottom right */}
        <div className="absolute bottom-3.5 right-3.5 bg-[var(--theme-bg)]/90 backdrop-blur-xs text-[#1a1a1a] px-2 py-0.5 rounded-xs flex items-center gap-1 shadow-xs border border-[var(--theme-primary)]/20">
          <Star className="w-3 h-3 fill-[var(--theme-primary)] text-[var(--theme-primary)]" />
          <span className="text-[11px] font-medium font-mono">{product.rating}</span>
        </div>
      </div>

      {/* Product Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[9px] font-sans tracking-[0.2em] text-[var(--theme-primary)] uppercase font-semibold">
            {displayCategory}
          </span>
          <h3 className="font-serif font-light text-[#1a1a1a] group-hover:text-[var(--theme-primary)] transition-colors line-clamp-1 mt-0.5 text-base">
            {product.name}
          </h3>
          <p className="text-xs text-stone-600 line-clamp-2 mt-1 font-sans">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--theme-primary)]/10 flex items-center justify-between">
          <span className="text-base font-light font-mono text-[#1a1a1a]">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product.id);
            }}
            className="text-[10px] uppercase tracking-widest font-sans text-[var(--theme-primary)] font-semibold group-hover:text-[var(--theme-accent)] flex items-center gap-1.5"
          >
            <span>View Craft</span>
            <Sparkles className="w-3.5 h-3.5 text-[var(--theme-primary)] animate-pulse" />
          </button>
        </div>
      </div>
    </div>
  );
}
