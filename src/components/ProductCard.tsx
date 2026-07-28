import React, { useState, useRef } from 'react';
import { Product, ColorVariant } from '../types';
import { Star, Settings, Heart, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import CraftImage from './CraftImage';

interface ProductCardProps {
  key?: string;
  product: Product;
  onViewDetails: (productId: string) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string, e: React.MouseEvent) => void;
}

export function SkeletonProductCard() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft-gallery space-y-4 animate-pulse">
      <div className="aspect-square w-full bg-[#FAF7F2] rounded-full" />
      <div className="space-y-2">
        <div className="h-3 w-1/3 bg-[#F2EBDC] rounded-full" />
        <div className="h-4 w-3/4 bg-[#F2EBDC] rounded-full" />
        <div className="h-3 w-full bg-[#F2EBDC] rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-5 w-1/3 bg-[#F2EBDC] rounded-full" />
        <div className="h-7 w-20 bg-[#F2EBDC] rounded-full" />
      </div>
    </div>
  );
}

export default function ProductCard({
  product,
  onViewDetails,
  isWishlisted = false,
  onToggleWishlist
}: ProductCardProps) {
  const [activeColor, setActiveColor] = useState<ColorVariant | null>(null);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  // 3D Card Parallax Tilt State
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 6; // gentle tilt max 6 deg
    const rotateY = ((x - centerX) / centerX) * 6;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-5px)`,
      boxShadow: `0 24px 48px -12px rgba(34, 48, 79, 0.12)`,
      transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out'
    });

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlareStyle({
      opacity: 0.2,
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 65%)`,
      transition: 'opacity 0.2s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
      transition: 'transform 0.5s ease-out, box-shadow 0.5s ease-out'
    });
    setGlareStyle({ opacity: 0, transition: 'opacity 0.4s ease-out' });
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 450);
    if (onToggleWishlist) onToggleWishlist(product.id, e);
  };

  // Determine active display image
  const displayImage = activeColor?.image || product.images[0] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=85&w=800&auto=format&fit=crop';
  const displayCategory = product.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div
      ref={cardRef}
      id={`product-card-${product.id}`}
      onClick={() => onViewDetails(product.id)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className="group bg-white rounded-3xl overflow-hidden cursor-pointer flex flex-col relative preserve-3d transition-all duration-300 shadow-soft-gallery"
    >
      {/* Specular Glare Layer */}
      <div
        className="absolute inset-0 pointer-events-none z-30 transition-opacity rounded-3xl"
        style={glareStyle}
      />

      {/* Product Image Stage */}
      <div className="relative aspect-square w-full bg-white overflow-hidden flex items-center justify-center p-5">
        
        {/* Circle Art Frame */}
        <div
          className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md group-hover:scale-[1.03] transition-transform duration-500 ease-out relative"
          style={{ transform: 'translateZ(15px)' }}
        >
          <CraftImage
            src={displayImage}
            alt={product.name}
            defaultWidth={500}
            aspectRatio="aspect-square"
            className="w-full h-full object-contain rounded-full transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 200px, (max-width: 1024px) 300px, 400px"
          />
          {/* Subtle light shimmer sweep */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
        </div>

        {/* Soft-Filled Rounded Badge Tags (No Hard Borders) */}
        <div className="absolute top-4 left-4 flex flex-col gap-1 z-20">
          {product.isPersonalizable ? (
            <span className="flex items-center gap-1 bg-[#F2EBDC] text-[#C4703B] text-[8.5px] uppercase tracking-widest px-3 py-1 rounded-full font-sans font-semibold">
              <Settings className="w-2.5 h-2.5 animate-spin-slow text-[#C4703B]" /> Custom
            </span>
          ) : product.isReadyMade ? (
            <span className="flex items-center gap-1 bg-[#E6F4EA] text-[#047857] text-[8.5px] uppercase tracking-widest px-3 py-1 rounded-full font-sans font-semibold">
              Ready Made
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-[#FAF7F2] text-stone-700 text-[8.5px] uppercase tracking-widest px-3 py-1 rounded-full font-sans font-medium">
              Made-to-Order
            </span>
          )}
        </div>

        {/* Floating Animated Wishlist Heart Button */}
        {onToggleWishlist && (
          <motion.button
            onClick={handleHeartClick}
            animate={isHeartAnimating ? { scale: [1, 1.4, 0.9, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.45 }}
            className={`absolute top-4 right-4 z-20 p-2.5 rounded-full backdrop-blur-md transition-all shadow-xs ${
              isWishlisted
                ? 'bg-white text-red-500'
                : 'bg-white/80 text-stone-400 hover:text-red-500 hover:bg-white'
            }`}
            title={isWishlisted ? "Remove from Saved" : "Save for Later"}
          >
            <Heart className={`w-4 h-4 stroke-[1.5] ${isWishlisted ? 'fill-current' : ''}`} />
          </motion.button>
        )}

        {/* Interactive Color Swatches Row */}
        {product.colors && product.colors.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-1 bg-white/90 backdrop-blur-sm shadow-xs rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
            {product.colors.slice(0, 5).map((col, idx) => {
              const isSelected = activeColor?.name === col.name;
              return (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveColor(col);
                  }}
                  onMouseEnter={() => setActiveColor(col)}
                  className={`w-3 h-3 rounded-full transition-transform ${
                    isSelected ? 'scale-125 ring-2 ring-[#C9A24B]' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: col.value }}
                  title={col.name}
                />
              );
            })}
            {product.colors.length > 5 && (
              <span className="text-[8px] font-mono font-bold text-stone-500 pl-0.5">
                +{product.colors.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product Details Section (p-6) */}
      <div className="p-6 flex-1 flex flex-col justify-between bg-white rounded-b-3xl">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-sans tracking-[0.22em] text-[#C4703B] uppercase font-semibold">
              {displayCategory}
            </span>
            {/* De-emphasized muted rating */}
            <div className="flex items-center gap-1 text-stone-400 text-[10px] font-sans">
              <Star className="w-3 h-3 text-stone-300 stroke-[1.5]" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Product Title (Clear Focal Point) */}
          <h3 className="font-serif font-normal text-[#22304F] group-hover:text-[#C9A24B] transition-colors line-clamp-1 mt-1 text-lg sm:text-xl">
            {product.name}
          </h3>
          <p className="text-xs text-stone-500 line-clamp-2 mt-1.5 font-sans font-light leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Footer with Price and Slide-up 3D View Button */}
        <div className="mt-5 pt-3 flex items-center justify-between relative overflow-hidden">
          <div className="flex flex-col">
            <span className="text-[8.5px] uppercase tracking-widest text-stone-400 font-sans font-medium">Price</span>
            <span className="text-lg font-serif font-light text-[#22304F]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Slide-Up 3D View CTA Button */}
          <div className="transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(product.id);
              }}
              className="text-[9.5px] uppercase tracking-widest font-sans bg-[#22304F] hover:bg-[#C9A24B] text-white font-medium py-2 px-4 rounded-full transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>3D View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
