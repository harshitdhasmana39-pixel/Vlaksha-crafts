import React from 'react';
import logoImg from '../assets/vlaksha-logo.jpg';

interface VlakshaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

export default function VlakshaLogo({
  size = 'md',
  showText = true,
  theme = 'light',
  className = '',
}: VlakshaLogoProps) {
  // Dimensions based on size preset
  const dimensions = {
    sm: { img: 38, textClass: 'text-lg', subtextClass: 'text-[7.5px] tracking-[0.22em]' },
    md: { img: 50, textClass: 'text-xl sm:text-2xl', subtextClass: 'text-[9px] tracking-[0.3em]' },
    lg: { img: 72, textClass: 'text-3xl', subtextClass: 'text-[10px] tracking-[0.35em]' },
    xl: { img: 120, textClass: 'text-5xl', subtextClass: 'text-xs tracking-[0.4em]' },
  }[size];

  const textColor = theme === 'light' ? 'text-[#22304F]' : 'text-white';
  const subtextColor = theme === 'light' ? 'text-[#C4703B]' : 'text-[#C9A24B]';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Authentic Circular Logo Emblem */}
      <div
        className="relative shrink-0 rounded-full overflow-hidden shadow-md border-2 border-[#C9A24B]/40 p-0.5 bg-white transition-transform duration-300 hover:scale-105"
        style={{ width: dimensions.img, height: dimensions.img }}
      >
        <img
          src="/vlaksha-logo.jpg"
          alt="Vlaksha Crafts Logo"
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            // Fallback to imported asset if path varies
            (e.currentTarget as HTMLImageElement).src = logoImg;
          }}
        />
        {/* Subtle gold ring highlight */}
        <div className="absolute inset-0 rounded-full border border-amber-400/20 pointer-events-none" />
      </div>

      {/* Typography Label */}
      {showText && (
        <div className="flex flex-col items-start leading-none">
          <span className={`font-serif ${dimensions.textClass} font-light tracking-tight ${textColor}`}>
            VLAKSHA <span className="text-[#C9A24B] font-normal">CRAFTS</span>
          </span>
          <span className={`font-sans uppercase opacity-90 mt-1 font-semibold ${dimensions.subtextClass} ${subtextColor}`}>
            Handmade With Passion
          </span>
        </div>
      )}
    </div>
  );
}
