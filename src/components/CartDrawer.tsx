import React, { useState, useRef, useEffect } from 'react';
import { CartItem } from '../types';
import { X, Trash2, ShoppingBag, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartDrawerProps) {
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

  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

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
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-container">
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
            <div className="w-1 h-8 bg-[var(--theme-primary)]/40 rounded-full" />
            <span className="text-[7px] text-[var(--theme-primary)] font-sans font-semibold tracking-wider uppercase [writing-mode:vertical-lr] mt-1.5 opacity-60">
              SWIPE
            </span>
          </div>
          
          {/* Header */}
          <div className="px-4 py-4 border-b border-[var(--theme-primary)]/15 flex items-center justify-between bg-stone-50">
            <h2 className="text-xs font-sans font-semibold uppercase tracking-widest text-[#1a1a1a] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[var(--theme-primary)]" />
              <span>Shopping Basket</span>
              <span className="text-xs bg-[var(--theme-accent)]/5 border border-[var(--theme-primary)]/20 text-[var(--theme-accent)] font-bold font-mono px-2 py-0.5 rounded-none">
                {cart.length}
              </span>
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-none hover:bg-[#f8f5ef] text-stone-500 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <ShoppingBag className="w-16 h-16 text-[var(--theme-primary)] stroke-[1.2] mb-3" />
                <h3 className="font-serif text-base font-semibold text-stone-800">Your basket is empty</h3>
                <p className="text-xs mt-1 max-w-[240px] font-sans">
                  Add hand-painted plates, clocks, or nameplates from our boutique catalog.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 py-3 px-6 rounded-none font-sans text-xs font-semibold uppercase tracking-widest bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-primary)] transition-colors shadow-xs"
                >
                  Browse Crafts
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[var(--theme-primary)]/10 rounded-none p-3 flex gap-3 relative hover:shadow-xs transition-shadow"
                >
                  {/* Thumbnail circular image */}
                  <div className="w-16 h-16 rounded-full border border-[var(--theme-primary)]/20 overflow-hidden shrink-0 shadow-inner p-1 bg-white">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm font-semibold text-stone-900 truncate">
                      {item.product.name}
                    </h4>
                    
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="text-[10px] bg-stone-50 border border-stone-200/50 text-stone-600 px-1.5 py-0.5 rounded-none font-mono">
                        Size: {item.size}
                      </span>
                      <span
                        className="text-[10px] bg-stone-50 border border-stone-200/50 text-stone-600 px-1.5 py-0.5 rounded-none flex items-center gap-1 font-sans"
                      >
                        Color:
                        <span
                          className="w-2 h-2 rounded-full border border-stone-300 inline-block"
                          style={{ backgroundColor: item.color.value }}
                        />
                        {item.color.name}
                      </span>
                    </div>

                    {/* Personalization specifications badge */}
                    {item.personalization && (
                      <div className="mt-2 bg-[#f8f5ef] border border-[var(--theme-primary)]/15 rounded-none p-2.5 text-[10px] text-stone-700 font-sans">
                        <p className="font-semibold uppercase tracking-wider text-[9px] text-[var(--theme-primary)] mb-1">
                          Personalization ({item.personalization.language}):
                        </p>
                        <p className="italic font-serif font-medium bg-white py-1 px-1.5 rounded-none border border-[var(--theme-primary)]/10 select-all leading-normal text-stone-800">
                          &ldquo;{item.personalization.text}&rdquo;
                        </p>
                        {item.personalization.photoUrl && (
                          <p className="text-[9px] text-[var(--theme-primary)] font-semibold mt-1 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 shrink-0" /> Photo attached for photo-inset work
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Toggles */}
                      <div className="flex items-center border border-stone-200 rounded-none bg-stone-50">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="px-2 py-1 text-xs hover:bg-stone-200 text-stone-600 font-bold rounded-none"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-mono font-bold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="px-2 py-1 text-xs hover:bg-stone-200 text-stone-600 font-bold rounded-none"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Price subtotal */}
                      <span className="text-xs font-bold font-mono text-stone-900">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="absolute top-2 right-2 p-1 rounded-none text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer block */}
          {cart.length > 0 && (
            <div className="border-t border-[var(--theme-primary)]/20 p-4 bg-stone-50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-sans text-[var(--theme-primary)] font-semibold">
                  Subtotal Price
                </span>
                <span className="text-lg font-bold font-mono text-stone-950">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Delivery Lead Time Notice */}
              <div className="flex gap-2 p-2.5 rounded-none bg-[var(--theme-primary)]/5 border border-[var(--theme-primary)]/15 text-[10px] text-stone-700">
                <AlertCircle className="w-4 h-4 text-[var(--theme-primary)] shrink-0 mt-0.5" />
                <p className="leading-normal font-sans">
                  Products are custom made-to-order by hand. Standard painting and curing process will take{' '}
                  <strong className="font-bold text-stone-900">7–12 days</strong> before dispatch.
                </p>
              </div>

              <button
                onClick={onCheckout}
                className="w-full py-3.5 rounded-none bg-[var(--theme-accent)] hover:bg-[var(--theme-primary)] text-white font-sans text-xs uppercase tracking-widest font-semibold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <p className="text-center text-[10px] text-stone-400 mt-1 font-sans">
                UPI • Netbanking • Cards • Razorpay Security Guaranteed
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
