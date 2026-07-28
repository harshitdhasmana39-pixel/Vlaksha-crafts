import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { X, Heart, ShoppingBag, Sparkles, Trash2, ArrowRight } from 'lucide-react';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: string[];
  products: Product[];
  onToggleWishlist: (productId: string, e?: React.MouseEvent) => void;
  onViewProduct: (productId: string) => void;
  onAddToCartDirect: (productId: string) => void;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlist,
  products,
  onToggleWishlist,
  onViewProduct,
  onAddToCartDirect
}: WishlistDrawerProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      setTranslateX(0);
      setIsSwiping(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter products to find the saved ones
  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    const diffX = currentX - startXRef.current;
    const diffY = currentY - startYRef.current;

    // Horizontally swiping to the right (positive diffX)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      if (diffX > 0) {
        if (e.cancelable) {
          e.preventDefault();
        }
        setTranslateX(diffX);
      } else {
        setTranslateX(0);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    // If swiped more than 100px or 30% of typical drawer width, close
    if (translateX > 100) {
      onClose();
    }
    setTranslateX(0);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="wishlist-drawer-container">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: translateX > 0 ? `translateX(${translateX}px)` : undefined,
          }}
          className={`w-screen max-w-md bg-[var(--theme-bg)] border-l border-[var(--theme-primary)]/25 flex flex-col shadow-2xl relative select-none ${
            isSwiping ? 'transition-none' : 'transition-transform duration-300 ease-out'
          }`}
        >
          {/* Subtle visual drag/swipe handle indicator for mobile devices */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3.5 z-40 md:hidden flex flex-col items-center justify-center bg-[var(--theme-bg)] border border-[var(--theme-primary)]/25 border-r-0 rounded-l-lg py-4 px-1.5 shadow-md">
            <div className="w-1 h-8 bg-red-400/50 rounded-full" />
            <span className="text-[7px] text-[var(--theme-primary)] font-sans font-semibold tracking-wider uppercase [writing-mode:vertical-lr] mt-1.5 opacity-60">
              SWIPE
            </span>
          </div>
          
          {/* Header */}
          <div className="px-4 py-4 border-b border-[var(--theme-primary)]/15 flex items-center justify-between bg-stone-50">
            <h2 className="text-xs font-sans font-semibold uppercase tracking-widest text-[#1a1a1a] flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-current" />
              <span>My Saved Crafts</span>
              <span className="text-xs bg-red-500/5 border border-red-500/20 text-red-600 font-bold font-mono px-2 py-0.5 rounded-none">
                {wishlistedProducts.length}
              </span>
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-none hover:bg-[#f8f5ef] text-stone-500 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Wishlist Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {wishlistedProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <div className="relative w-20 h-20 mb-4 flex items-center justify-center text-[var(--theme-primary)]/30">
                  {/* Outer spinning mandala line */}
                  <div className="absolute inset-0 border border-dashed border-[var(--theme-primary)]/30 rounded-full animate-spin-slow" />
                  <Heart className="w-10 h-10 stroke-[1.2]" />
                </div>
                <h3 className="font-serif text-base font-semibold text-stone-800">Your wishlist is empty</h3>
                <p className="text-xs mt-1 max-w-[240px] font-sans">
                  Keep track of Laksha's gorgeous wall plates, nameplates, and mandalas by tapping the heart icon.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 py-3 px-6 rounded-none font-sans text-xs font-semibold uppercase tracking-widest bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-primary)] transition-colors shadow-xs"
                >
                  Explore Artworks
                </button>
              </div>
            ) : (
              wishlistedProducts.map((product) => {
                const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop';
                const displayCategory = product.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

                return (
                  <div
                    key={product.id}
                    className="bg-white border border-[var(--theme-primary)]/10 rounded-none p-3.5 flex gap-3.5 relative hover:shadow-xs transition-all duration-300 group"
                  >
                    {/* Thumbnail circular image with customized look */}
                    <div className="w-16 h-16 rounded-full border border-[var(--theme-primary)]/20 overflow-hidden shrink-0 shadow-inner p-1 bg-white relative">
                      <img
                        src={primaryImage}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-sans tracking-[0.2em] text-[var(--theme-primary)] uppercase font-semibold">
                          {displayCategory}
                        </span>
                        <h4 className="font-serif text-sm font-semibold text-stone-900 truncate pr-6">
                          {product.name}
                        </h4>
                        <p className="text-[11px] font-mono font-medium text-stone-900 mt-0.5">
                          ₹{product.price.toLocaleString('en-IN')}
                        </p>
                      </div>

                      {/* Action buttons inside item */}
                      <div className="flex gap-2.5 mt-3 pt-2.5 border-t border-[var(--theme-primary)]/5">
                        <button
                          onClick={() => {
                            onClose();
                            onViewProduct(product.id);
                          }}
                          className="text-[10px] uppercase tracking-widest font-sans text-[var(--theme-primary)] font-bold hover:text-[var(--theme-accent)] transition-colors flex items-center gap-1"
                        >
                          <span>View Craft</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <span className="text-stone-300 text-xs">|</span>

                        <button
                          onClick={() => {
                            onAddToCartDirect(product.id);
                          }}
                          className="text-[10px] uppercase tracking-widest font-sans text-stone-600 font-bold hover:text-[var(--theme-accent)] transition-colors flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Quick Add</span>
                        </button>
                      </div>
                    </div>

                    {/* Remove/Wishlist Heart Toggle Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product.id, e);
                      }}
                      className="absolute top-2.5 right-2.5 p-1 rounded-none text-red-400 hover:text-stone-400 transition-colors"
                      title="Remove from Saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer view */}
          {wishlistedProducts.length > 0 && (
            <div className="border-t border-[var(--theme-primary)]/20 p-4 bg-stone-50 space-y-3">
              <div className="flex gap-2 p-2.5 rounded-none bg-[#f8f5ef]/50 border border-[var(--theme-primary)]/15 text-[10px] text-stone-600">
                <Sparkles className="w-4 h-4 text-[var(--theme-primary)] shrink-0 mt-0.5" />
                <p className="leading-normal font-sans">
                  Each mud-mirror plate or clock is custom-shaped and polished individually by hand. Saved items are persistent and remain stored on this device.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 px-4 rounded-none border border-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-white text-[var(--theme-accent)] font-sans text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <span>Continue Browsing Catalog</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
