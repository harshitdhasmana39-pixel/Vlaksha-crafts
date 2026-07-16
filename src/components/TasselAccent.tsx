import React from 'react';

interface TasselAccentProps {
  className?: string;
  colors?: string[]; // e.g., ['#EA580C', '#DC2626'] (saffron & marigold)
  length?: 'sm' | 'md' | 'lg';
}

export default function TasselAccent({
  className = '',
  colors = ['#EA580C', '#991B1B'],
  length = 'md'
}: TasselAccentProps) {
  const heightClass = length === 'sm' ? 'h-6' : length === 'md' ? 'h-10' : 'h-16';

  return (
    <div
      id="tassel-accent"
      className={`flex flex-col items-center select-none cursor-pointer ${className}`}
      style={{ transformOrigin: 'top center' }}
    >
      {/* Thread/Hanger */}
      <div className="w-[1.5px] h-4 bg-amber-600/60" />

      {/* Pearl / Bead Strand */}
      <div className="flex flex-col items-center gap-0.5 my-0.5">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-100 border border-amber-500/30 shadow-xs flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-amber-400" />
        </div>
        {length !== 'sm' && (
          <div className="w-2 h-2 rounded-full bg-slate-100 border border-amber-500/20 shadow-xs" />
        )}
        <div className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600/50 shadow-xs" />
      </div>

      {/* Tassel Cap (metallic gold dome) */}
      <div className="w-4 h-2.5 rounded-t-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 border border-amber-500 shadow-xs" />

      {/* Tassel Fringe Threads */}
      <div className={`relative w-4 ${heightClass} overflow-hidden flex justify-center`}>
        {/* We can stack absolute thin lines of varying shades to create a rich thread texture */}
        <div
          className="w-full h-full rounded-b-sm"
          style={{
            background: `linear-gradient(90deg, 
              ${colors[0] || '#EA580C'} 0%, 
              ${colors[1] || '#991B1B'} 25%, 
              ${colors[0] || '#EA580C'} 50%, 
              ${colors[1] || '#991B1B'} 75%, 
              ${colors[0] || '#EA580C'} 100%)`,
            boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.15)'
          }}
        />
        {/* Individual thread lines overlay */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[size:3px_100%]" />
      </div>

      {/* Little gold band wrap */}
      <div className="w-4 h-1 bg-amber-500/80 -mt-[calc(100%-4px)] shadow-xs" />
    </div>
  );
}
