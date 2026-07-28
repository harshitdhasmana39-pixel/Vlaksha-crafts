import React from 'react';

interface MandalaDividerProps {
  className?: string;
  color?: string;
  dotColor?: string;
}

export default function MandalaDivider({
  className = 'my-8',
  color = 'text-[var(--theme-primary)]/40',
  dotColor = 'bg-[var(--theme-accent)]/40'
}: MandalaDividerProps) {
  return (
    <div id="mandala-divider" className={`flex items-center justify-center gap-4 ${className}`}>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[var(--theme-primary)]/20 max-w-[120px]" />
      <div className={`relative flex items-center justify-center ${color}`}>
        {/* Intricate Mandala Outline Svg */}
        <svg
          className="w-8 h-8 animate-spin-slow"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {/* Inner circle */}
          <circle cx="50" cy="50" r="10" />
          {/* Petals */}
          <path d="M50 20 C45 35, 55 35, 50 20 Z" />
          <path d="M50 80 C45 65, 55 65, 50 80 Z" />
          <path d="M20 50 C35 45, 35 55, 20 50 Z" />
          <path d="M80 50 C65 45, 65 55, 80 50 Z" />
          
          <path d="M29 29 C40 35, 45 30, 29 29 Z" />
          <path d="M71 71 C60 65, 55 70, 71 71 Z" />
          <path d="M29 71 C40 65, 45 70, 29 71 Z" />
          <path d="M71 29 C60 35, 55 30, 71 29 Z" />
          
          {/* Dots */}
          <circle cx="50" cy="12" r="2.5" fill="currentColor" />
          <circle cx="50" cy="88" r="2.5" fill="currentColor" />
          <circle cx="12" cy="50" r="2.5" fill="currentColor" />
          <circle cx="88" cy="50" r="2.5" fill="currentColor" />
        </svg>
        <div className={`absolute w-1.5 h-1.5 rounded-full ${dotColor}`} />
      </div>
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[var(--theme-primary)]/20 max-w-[120px]" />
    </div>
  );
}
