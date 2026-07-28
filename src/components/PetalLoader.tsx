import React from 'react';

interface PetalLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function PetalLoader({ size = 'md', text }: PetalLoaderProps) {
  const dimensions = size === 'sm' ? 'w-12 h-12' : size === 'md' ? 'w-20 h-20' : 'w-32 h-32';
  const textClass = size === 'sm' ? 'text-[9px]' : 'text-[10px]';

  return (
    <div id="petal-loader" className="flex flex-col items-center justify-center p-6 text-[var(--theme-primary)]">
      <div className={`relative ${dimensions} animate-spin-slow`}>
        {/* Render 8 overlapping delicate mandala petals in a circle */}
        {[...Array(8)].map((_, i) => {
          const rotation = i * 45;
          return (
            <div
              key={i}
              className="absolute top-0 left-1/2 w-1/4 h-1/2 origin-bottom -translate-x-1/2"
              style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
            >
              {/* Petal Shape */}
              <div
                className="w-full h-[80%] rounded-[50%_50%_50%_50%/_60%_60%_40%_40%] border border-[var(--theme-primary)]/40 bg-gradient-to-tr from-[var(--theme-primary)]/10 via-[var(--theme-primary)]/5 to-[var(--theme-primary)]/20 shadow-xs"
                style={{
                  boxShadow: 'inset 0 0 4px rgba(197, 160, 89, 0.15)'
                }}
              />
              {/* Little inner gold dot at the center-point edge */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)]" />
            </div>
          );
        })}
        {/* Core Jewel */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22%] h-[22%] rounded-full bg-gradient-to-br from-[var(--theme-primary)] via-[var(--theme-primary)] to-[var(--theme-accent)] border border-[var(--theme-primary)] shadow-sm flex items-center justify-center">
          <div className="w-[40%] h-[40%] rounded-full bg-white shadow-xs" />
        </div>
      </div>
      
      {text && (
        <p className={`mt-4 font-sans tracking-[0.2em] uppercase text-stone-600 animate-pulse text-center ${textClass}`}>
          {text}
        </p>
      )}
    </div>
  );
}
