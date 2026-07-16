import React from 'react';
import { motion } from 'motion/react';

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
  // Define dimensions based on size preset
  const dimensions = {
    sm: { svg: 32, textClass: 'text-lg', subtextClass: 'text-[7px] tracking-[0.25em]' },
    md: { svg: 44, textClass: 'text-2xl', subtextClass: 'text-[9px] tracking-[0.35em]' },
    lg: { svg: 64, textClass: 'text-3xl', subtextClass: 'text-[10px] tracking-[0.4em]' },
    xl: { svg: 120, textClass: 'text-5xl', subtextClass: 'text-xs tracking-[0.45em]' },
  }[size];

  const textColor = theme === 'light' ? 'text-[#1a1a1a]' : 'text-white';
  const subtextColor = theme === 'light' ? 'text-stone-500' : 'text-[var(--theme-primary)]/80';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* SVG Lippan Mandala Icon */}
      <div className="relative shrink-0" style={{ width: dimensions.svg, height: dimensions.svg }}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Base Layer / Clay Panel Backing */}
          <circle cx="50" cy="50" r="48" fill={theme === 'light' ? 'var(--theme-bg)' : '#1C1613'} stroke="var(--theme-primary)" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="45" fill={theme === 'light' ? '#FAF9F5' : '#241E1A'} />

          {/* Outer Border Clay Relief lines */}
          <circle cx="50" cy="50" r="41" stroke="var(--theme-primary)" strokeWidth="0.75" opacity="0.6" />
          <circle cx="50" cy="50" r="38" stroke={theme === 'light' ? '#EAE6DF' : '#3E342E'} strokeWidth="1.5" />

          {/* Decorative clay border triangles */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * 360) / 16;
            return (
              <line
                key={`clay-notch-${i}`}
                x1="50"
                y1="10"
                x2="50"
                y2="12"
                stroke="var(--theme-primary)"
                strokeWidth="1.5"
                transform={`rotate(${angle} 50 50)`}
                opacity="0.8"
              />
            );
          })}

          {/* Concentric Mirror Studs (Triangles & Circles) */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8;
            return (
              <g key={`mirrors-${i}`} transform={`rotate(${angle} 50 50)`}>
                {/* Diamond mirrors (Lippan work signature) */}
                <path
                  d="M50 18 L53 23 L50 28 L47 23 Z"
                  fill="#ffffff"
                  stroke="var(--theme-primary)"
                  strokeWidth="0.5"
                  className="shadow-xs"
                />
                {/* Shining effect on the mirror */}
                <polygon points="50,18 51.5,23 50,28" fill="#ffffff" opacity="0.9" />
                <polygon points="50,18 47,23 50,23" fill="#E2E8F0" opacity="0.6" />

                {/* Micro circular mirror beads */}
                <circle cx="50" cy="33" r="1.5" fill="#E5E7EB" stroke="var(--theme-primary)" strokeWidth="0.25" />
              </g>
            );
          })}

          {/* Inner Sacred Geometry Circle */}
          <circle cx="50" cy="50" r="12" fill={theme === 'light' ? 'var(--theme-bg-alt)' : '#171210'} stroke="var(--theme-primary)" strokeWidth="1" />

          {/* Central Flower Petals Clay relief */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8 + 22.5;
            return (
              <path
                key={`petal-${i}`}
                d="M50 50 C51 44, 53 44, 50 40 C47 44, 49 44, 50 50"
                fill="none"
                stroke="var(--theme-primary)"
                strokeWidth="0.75"
                transform={`rotate(${angle} 50 50)`}
              />
            );
          })}

          {/* Central Mirror Medallion with light reflection sparkle */}
          <circle cx="50" cy="50" r="5" fill="#FFFFFF" stroke="var(--theme-primary)" strokeWidth="0.5" className="animate-pulse" />
          
          {/* Sparkle Reflection SVG overlay */}
          <path
            d="M48 50 L52 50 M50 48 L50 52"
            stroke="#ffffff"
            strokeWidth="0.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Shimmer overlay effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Typography Label */}
      {showText && (
        <div className="flex flex-col items-start leading-none">
          <span className={`font-serif ${dimensions.textClass} font-light tracking-tight ${textColor}`}>
            VLAKSHA <span className="text-[var(--theme-primary)] font-normal">CRAFTS</span>
          </span>
          <span className={`font-sans uppercase opacity-75 mt-1 ${dimensions.subtextClass} ${subtextColor}`}>
            Artisanal Lippan Art
          </span>
        </div>
      )}
    </div>
  );
}
