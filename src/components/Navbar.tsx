import React, { useState } from 'react';
import { ShoppingBag, Search, ShieldCheck, Menu, X, Sparkles, LogOut, Heart, User as UserIcon } from 'lucide-react';
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

  const navItems = [
    { label: 'Home', view: 'home' as const },
    { label: 'Our Crafts Collection', view: 'shop' as const },
    { label: 'AI Design Studio', view: 'ai-studio' as const },
    { label: 'Meet the Artist', view: 'about' as const },
  ];

  return (
    <nav id="vlaksha-navbar" className="bg-[var(--theme-bg)] border-b border-[var(--theme-primary)]/20 sticky top-0 z-40 shadow-xs">
      {/* Tiny Auspicious Welcome Bar with navy and gold themed text */}
      <div className="bg-[var(--theme-announcement-bg)] text-[var(--theme-announcement-text)] text-center py-1.5 text-[10px] tracking-[0.25em] font-sans font-medium uppercase px-4 flex items-center justify-center gap-2 border-b border-[var(--theme-primary)]/20">
        <Sparkles className="w-3.5 h-3.5 text-[var(--theme-primary)] animate-pulse" />
        <span>{announcementText || "Handcrafted Mud-Mirror Lippan Art & Mandalas by Laksha Kandpal"}</span>
        <Sparkles className="w-3.5 h-3.5 text-[var(--theme-primary)] animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          
          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-stone-700 hover:bg-stone-50 hover:text-[var(--theme-primary)] focus:outline-hidden"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo / Brand Wordmark in Editorial style */}
          <div
            onClick={() => {
              onNavigate('home');
              setIsMobileMenuOpen(false);
            }}
            className="cursor-pointer select-none"
          >
            <VlakshaLogo size="md" showText={true} theme="light" />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-10 font-sans text-[11px] uppercase tracking-[0.2em] font-medium">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`transition-all py-1.5 border-b border-transparent hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)] ${
                  currentView === item.view
                    ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] font-semibold'
                    : 'text-[#1a1a1a]/80'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:block relative max-w-xs w-48 xl:w-56">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-stone-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search crafts, materials..."
              className="block w-full pl-8 pr-7 py-1.5 text-[11px] bg-[#f8f5ef]/50 border border-[var(--theme-primary)]/15 focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] placeholder-stone-400 font-sans tracking-wide transition-all rounded-xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Utility Tools: Search + Cart + Admin Gateway */}
          <div className="flex items-center gap-1.5 sm:gap-3 font-sans text-[11px] uppercase tracking-[0.12em]">
            
            {/* User Account gateway indicator */}
            {currentUser ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onNavigate('user-account')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] rounded-sm border border-[var(--theme-primary)]/30 bg-white text-stone-700 font-medium hover:bg-[var(--theme-bg)] transition-all hover:border-[var(--theme-primary)] ${
                    currentView === 'user-account' ? 'ring-1 ring-[var(--theme-primary)] border-[var(--theme-primary)]' : ''
                  }`}
                  title="My Auspicious Account"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                  <span className="hidden sm:inline truncate max-w-[75px]">{currentUser.name.split(' ')[0]}</span>
                </button>
                <button
                  onClick={onLogoutUser}
                  title="Sign Out"
                  className="p-1.5 rounded-sm text-stone-400 hover:text-red-600 hover:bg-stone-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenUserAuth('login')}
                className="p-1.5 rounded-sm text-stone-500 hover:text-[var(--theme-primary)] hover:bg-stone-50 transition-all flex items-center gap-1 text-[10px]"
                title="Sign In / Register"
              >
                <UserIcon className="w-4 h-4 text-[var(--theme-primary)]/70" />
                <span className="hidden lg:inline text-stone-600 font-medium">Log In</span>
              </button>
            )}

            <div className="h-4 w-[1px] bg-[var(--theme-primary)]/20" />

            {/* Admin gateway indicator */}
            {isAdmin && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] rounded-sm border border-[var(--theme-primary)]/40 bg-white text-[var(--theme-primary)] font-medium hover:bg-[var(--theme-bg)] transition-colors ${
                    currentView === 'admin' ? 'ring-1 ring-[var(--theme-primary)] font-semibold bg-[var(--theme-bg)]' : ''
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Laksha Panel</span>
                </button>
                <button
                  onClick={onAdminLogout}
                  title="Logout Admin"
                  className="p-1.5 rounded-sm text-stone-400 hover:text-red-600 hover:bg-stone-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="h-4 w-[1px] bg-[var(--theme-primary)]/20" />

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="p-2.5 rounded-full hover:bg-stone-50 text-stone-700 hover:text-red-500 transition-all relative flex items-center justify-center border border-transparent hover:border-red-200/20"
              aria-label="Open Wishlist"
              title="Saved Crafts"
            >
              <Heart className="w-5 h-5 stroke-[1.8]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold font-mono w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart button */}
            <button
              onClick={onOpenCart}
              className="p-2.5 rounded-full hover:bg-stone-50 text-stone-700 hover:text-[var(--theme-primary)] transition-all relative flex items-center justify-center border border-transparent hover:border-[var(--theme-primary)]/20"
              aria-label="Open Shopping Basket"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--theme-accent)] text-white text-[9px] font-bold font-mono w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile/Tablet Search Row */}
        <div className="block lg:hidden pb-4 pt-1 px-1">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-stone-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search crafts by name, category, or materials..."
              className="block w-full pl-8 pr-7 py-2 text-xs bg-[#f8f5ef]/50 border border-[var(--theme-primary)]/15 focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] placeholder-stone-400 font-sans tracking-wide transition-all rounded-xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Drawer Navigation overlay menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-amber-900/10 bg-[var(--theme-bg)] py-3 px-4 space-y-2 shadow-inner">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => {
                onNavigate(item.view);
                setIsMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-none text-sm font-serif font-medium ${
                currentView === item.view
                  ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-accent)] font-semibold'
                  : 'text-[#1a1a1a]/80 hover:bg-[#f8f5ef] hover:text-[var(--theme-primary)]'
              }`}
            >
              {item.label}
            </button>
          ))}
          {isAdmin && (
            <button
              onClick={() => {
                onNavigate('admin');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-none text-sm font-sans font-medium text-[var(--theme-primary)] hover:bg-[#f8f5ef] flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Artist Admin Dashboard</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
