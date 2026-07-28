import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, ShieldCheck, Menu, X, LogOut, Heart, User as UserIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import VlakshaLogo from './VlakshaLogo';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  onNavigate: (view: 'home' | 'shop' | 'about' | 'admin' | 'ai-studio' | 'user-account') => void;
  currentView: string;
  isAdmin: boolean;
  onAdminLogout: () => void;
  currentUser: User | null;
  onOpenUserAuth: (mode?: 'login' | 'register') => void;
  onLogoutUser: () => void;
  announcementText?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Navbar({
  cartCount,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  onNavigate,
  currentView,
  isAdmin,
  onAdminLogout,
  currentUser,
  onOpenUserAuth,
  onLogoutUser,
  announcementText,
  searchQuery,
  onSearchChange
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartPopping, setIsCartPopping] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const prevCartCountRef = useRef(cartCount);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchExpanded) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchExpanded]);

  useEffect(() => {
    if (cartCount > prevCartCountRef.current) {
      setIsCartPopping(true);
      const timer = setTimeout(() => {
        setIsCartPopping(false);
      }, 650);
      return () => clearTimeout(timer);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  const navItems = [
    { label: 'Home', view: 'home' as const, isPrimary: false },
    { label: 'Our Crafts Collection', view: 'shop' as const, isPrimary: true },
    { label: 'AI Design Studio', view: 'ai-studio' as const, isPrimary: false },
    { label: 'Meet the Artist', view: 'about' as const, isPrimary: false },
  ];

  return (
    <nav 
      id="vlaksha-navbar" 
      className={`sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md transition-all duration-300 ${
        isScrolled ? 'shadow-soft-gallery border-b border-[#C9A24B]/15' : 'border-b border-[#C9A24B]/10'
      }`}
    >
      {/* Slim, elegant utility announcement bar */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div 
            initial={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden bg-[#1B2438] text-[#EAD8B1] text-center py-1 text-[9.5px] tracking-[0.28em] font-sans uppercase px-4 flex items-center justify-center gap-3 border-b border-[#C9A24B]/15"
          >
            <span className="inline-block w-1 h-1 rounded-full bg-[#C9A24B]/80" />
            <span className="font-medium opacity-90">{announcementText || "Handcrafted Mud-Mirror Lippan Art & Mandalas by Laksha Kandpal"}</span>
            <span className="inline-block w-1 h-1 rounded-full bg-[#C9A24B]/80" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16 md:h-18' : 'h-20 md:h-24'}`}>
          
          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="touch-target p-2 rounded-full text-stone-700 hover:bg-[#F2EBDC] hover:text-[#22304F] transition-colors focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo / Brand Wordmark */}
          <div
            onClick={() => {
              onNavigate('home');
              setIsMobileMenuOpen(false);
            }}
            className="cursor-pointer select-none flex items-center"
          >
            <VlakshaLogo size={isScrolled ? "sm" : "md"} showText={true} theme="light" />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10 font-sans text-[11px] uppercase tracking-[0.22em]">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`relative py-1.5 transition-colors cursor-pointer ${
                    isActive 
                      ? 'text-[#22304F] font-semibold' 
                      : item.isPrimary 
                        ? 'text-[#22304F] font-medium hover:text-[#C9A24B]' 
                        : 'text-stone-600/80 hover:text-[#22304F]'
                  }`}
                >
                  {item.label}
                  {/* Subtle underline hover / active animation */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9A24B] rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Utility Tools Group: Search + Wishlist + Cart + Account */}
          <div className="flex items-center gap-4 lg:gap-5 font-sans text-[11px]">
            
            {/* Search Icon button */}
            <button
              onClick={() => setIsSearchExpanded(true)}
              className="p-2 rounded-full text-stone-700 hover:text-[#C9A24B] hover:bg-[#F2EBDC]/60 transition-all cursor-pointer relative"
              title="Search Crafts"
              aria-label="Search"
            >
              <Search className="w-4.5 h-4.5 stroke-[1.8]" />
              {searchQuery && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#C9A24B] rounded-full" />
              )}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="p-2.5 rounded-full hover:bg-[#F2EBDC]/60 text-stone-700 hover:text-red-600 transition-all relative flex items-center justify-center cursor-pointer"
              aria-label="Open Wishlist"
              title="Saved Crafts"
            >
              <Heart className="w-4.5 h-4.5 stroke-[1.8]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#C4703B] text-white text-[9px] font-bold font-mono w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart button with Pop animation */}
            <motion.button
              onClick={onOpenCart}
              animate={isCartPopping ? { scale: [1, 1.25, 0.92, 1.1, 1], rotate: [0, -8, 8, -3, 0] } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
              className="p-2.5 rounded-full hover:bg-[#F2EBDC]/60 text-stone-700 hover:text-[#C9A24B] transition-colors relative flex items-center justify-center cursor-pointer"
              aria-label="Open Shopping Basket"
              title="View Basket"
            >
              <ShoppingBag className={`w-4.5 h-4.5 stroke-[1.8] ${isCartPopping ? 'text-[#C9A24B]' : ''}`} />
              
              {/* Expanding aura on item added */}
              {isCartPopping && (
                <motion.span
                  initial={{ scale: 0.6, opacity: 0.9 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border-2 border-[#C9A24B] pointer-events-none"
                />
              )}

              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={`cart-count-${cartCount}`}
                    initial={{ scale: 0 }}
                    animate={isCartPopping ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute -top-0.5 -right-0.5 bg-[#22304F] text-white text-[9px] font-bold font-mono w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <div className="h-4 w-[1px] bg-[#C9A24B]/20 hidden sm:block" />

            {/* User Account / Auth gateway */}
            {currentUser ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onNavigate('user-account')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded-full border border-[#C9A24B]/30 bg-white/80 text-stone-800 font-medium hover:bg-[#F2EBDC] transition-all ${
                    currentView === 'user-account' ? 'ring-1 ring-[#C9A24B] border-[#C9A24B] bg-[#F2EBDC]' : ''
                  }`}
                  title="My Account"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#C9A24B]" />
                  <span className="hidden sm:inline truncate max-w-[70px] uppercase tracking-wider">{currentUser.name.split(' ')[0]}</span>
                </button>
                <button
                  onClick={onLogoutUser}
                  title="Sign Out"
                  className="p-1.5 rounded-full text-stone-400 hover:text-red-600 hover:bg-[#F2EBDC]/50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenUserAuth('login')}
                className="p-1.5 px-3 rounded-full border border-stone-300/80 bg-white/70 hover:border-[#C9A24B] text-stone-700 hover:text-[#22304F] transition-all flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider font-medium cursor-pointer"
                title="Sign In"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#C9A24B]" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Admin gateway indicator */}
            {isAdmin && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[9.5px] uppercase tracking-wider rounded-full border border-[#C9A24B]/50 bg-[#22304F] text-[#EAD8B1] font-medium hover:bg-[#1B2438] transition-colors ${
                    currentView === 'admin' ? 'ring-1 ring-[#C9A24B]' : ''
                  }`}
                >
                  <ShieldCheck className="w-3 h-3 text-[#C9A24B]" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Expandable Full-Width Search Overlay */}
      <AnimatePresence>
        {isSearchExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-0 bg-[#FAF7F2] border-b border-[#C9A24B]/30 shadow-soft-gallery z-50 py-4 px-4 sm:px-8"
          >
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <Search className="w-5 h-5 text-[#C9A24B] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Lippan craft titles, techniques, materials, or motifs..."
                className="w-full text-sm md:text-base bg-transparent border-b border-stone-300 focus:border-[#C9A24B] focus:outline-none py-1 font-serif text-stone-800 placeholder:text-stone-400 placeholder:font-sans"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsSearchExpanded(false);
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="text-stone-400 hover:text-stone-700 text-xs uppercase tracking-wider font-sans"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsSearchExpanded(false)}
                className="p-1.5 rounded-full text-stone-500 hover:bg-[#F2EBDC] text-stone-700 transition-colors"
                title="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden absolute top-full left-0 right-0 bg-[#FDFBF7] shadow-xl overflow-hidden flex flex-col z-50 border-t border-[#C9A24B]/20"
          >
            <div className="flex flex-col h-full px-8 py-10 space-y-6">
              {navItems.map((item, idx) => (
                <motion.button
                  key={item.view}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 + 0.1, duration: 0.4 }}
                  onClick={() => {
                    onNavigate(item.view);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left py-4 text-lg font-sans uppercase tracking-[0.15em] transition-colors ${
                    currentView === item.view
                      ? 'text-[#17223B] font-bold border-l-4 border-[#C9A24B] pl-4'
                      : 'text-stone-500 hover:text-[#17223B] pl-4'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
              
              <div className="flex-1" />

              {isAdmin && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navItems.length * 0.1 + 0.2 }}
                  onClick={() => {
                    onNavigate('admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-4 text-sm font-sans uppercase tracking-[0.2em] text-[#B95B30] font-semibold flex items-center gap-3 border-t border-stone-200 pt-6"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Artist Admin Panel</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
