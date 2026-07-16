import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import TasselAccent from './TasselAccent';
import { Sparkles, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { getResponsiveImageProps } from '../utils/imageUtils';

interface ThreeDViewerProps {
  product: Product;
  selectedColor?: { name: string; value: string };
}

export default function ThreeDViewer({ product, selectedColor }: ThreeDViewerProps) {
  const [rotationX, setRotationX] = useState<number>(10); // subtle default tilt
  const [rotationY, setRotationY] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showSparkles, setShowSparkles] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'3d' | '360'>('3d');
  
  // 360 photo rig state (since we use a list of images)
  const [frameIndex, setFrameIndex] = useState<number>(0);
  
  // Active gallery image state
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Clock hands state (for wall clocks!)
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (product.category === 'wall-clocks') {
      const timer = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(timer);
    }
  }, [product.category]);

  // Reset active image when product changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  // Handle dragging/swiping
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    rotationStartRef.current = { x: rotationX, y: rotationY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) {
      // Gentle parallax tilt when hover/move without dragging
      if (containerRef.current && activeTab === '3d') {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Map mouse position to narrow tilt range (e.g., -10 to 10 deg)
        const tiltX = -(y / rect.height) * 20;
        const tiltY = (x / rect.width) * 20;
        
        setRotationX(10 + tiltX); // 10 base tilt
        setRotationY(tiltY);
      }
      return;
    }

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    if (activeTab === '3d') {
      // Free orbit rotation
      setRotationY(rotationStartRef.current.y + deltaX * 0.5);
      setRotationX(Math.max(-45, Math.min(45, rotationStartRef.current.x - deltaY * 0.5)));
    } else {
      // 360 photo-rig drag scrubbing (cycle frames)
      const framesCount = 12; // simulated 12-angle photos
      const scrubThreshold = 20; // px per frame
      const frameDelta = Math.floor(deltaX / scrubThreshold);
      let nextFrame = (frameIndex + frameDelta) % framesCount;
      if (nextFrame < 0) nextFrame += framesCount;
      setFrameIndex(nextFrame);
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      rotationStartRef.current = { x: rotationX, y: rotationY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;

    if (activeTab === '3d') {
      setRotationY(rotationStartRef.current.y + deltaX * 0.6);
      setRotationX(Math.max(-45, Math.min(45, rotationStartRef.current.x - deltaY * 0.6)));
    } else {
      const scrubThreshold = 15;
      const frameDelta = Math.floor(deltaX / scrubThreshold);
      let nextFrame = (frameIndex + frameDelta) % 12;
      if (nextFrame < 0) nextFrame += 12;
      setFrameIndex(nextFrame);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.001;
    setZoom(prev => Math.max(0.8, Math.min(2.5, prev + zoomDelta)));
  };

  const resetView = () => {
    setRotationX(10);
    setRotationY(0);
    setZoom(1);
    setFrameIndex(0);
  };

  // Dynamic light reflection coordinates based on rotation
  const reflectionX = 50 + (rotationY * 0.8);
  const reflectionY = 50 - (rotationX * 0.8);

  // Generate simulated positions for mirror chips that "glint"
  const mirrorChips = [
    { id: 1, top: '25%', left: '25%', shape: 'rhombus' },
    { id: 2, top: '25%', left: '75%', shape: 'rhombus' },
    { id: 3, top: '75%', left: '25%', shape: 'rhombus' },
    { id: 4, top: '75%', left: '75%', shape: 'rhombus' },
    { id: 5, top: '15%', left: '50%', shape: 'diamond' },
    { id: 6, top: '50%', left: '15%', shape: 'diamond' },
    { id: 7, top: '50%', left: '85%', shape: 'diamond' },
    { id: 8, top: '85%', left: '50%', shape: 'diamond' },
    { id: 9, top: '35%', left: '50%', shape: 'circle' },
    { id: 10, top: '65%', left: '50%', shape: 'circle' },
    { id: 11, top: '50%', left: '35%', shape: 'circle' },
    { id: 12, top: '50%', left: '65%', shape: 'circle' },
  ];

  // Helper for clock movement hand rotations
  const getClockHandsRotation = () => {
    const s = time.getSeconds();
    const m = time.getMinutes();
    const h = time.getHours();
    return {
      second: s * 6,
      minute: (m * 6) + (s * 0.1),
      hour: ((h % 12) * 30) + (m * 0.5)
    };
  };
  const clockRot = getClockHandsRotation();

  // Active gallery image
  const activeImage = product.images[activeImageIndex] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop';
  const activeImageProps = getResponsiveImageProps(activeImage, 600);

  return (
    <div id="three-d-viewer" className="flex flex-col bg-[var(--theme-bg)] border border-[var(--theme-primary)]/20 rounded-none overflow-hidden shadow-sm relative">
      {/* Viewer Header Tabs */}
      <div className="flex items-center justify-between border-b border-[var(--theme-primary)]/15 px-4 py-2 bg-[#f8f5ef]/50">
        <div className="flex gap-1.5 font-sans">
          <button
            onClick={() => setActiveTab('3d')}
            className={`px-3 py-1 text-xs font-semibold rounded-none uppercase tracking-wider transition-all ${
              activeTab === '3d'
                ? 'bg-[var(--theme-accent)] text-white shadow-xs'
                : 'text-stone-600 hover:bg-[#f8f5ef]'
            }`}
          >
            3D Shimmer View
          </button>
          <button
            onClick={() => setActiveTab('360')}
            className={`px-3 py-1 text-xs font-semibold rounded-none uppercase tracking-wider transition-all ${
              activeTab === '360'
                ? 'bg-[var(--theme-accent)] text-white shadow-xs'
                : 'text-stone-600 hover:bg-[#f8f5ef]'
            }`}
          >
            360° Rotate Rig
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSparkles(!showSparkles)}
            title="Toggle Mirror Sparkle"
            className={`p-1.5 rounded-none transition-colors ${
              showSparkles ? 'text-[var(--theme-primary)] bg-[var(--theme-primary)]/10' : 'text-stone-400 hover:bg-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            title="Reset View"
            className="p-1.5 rounded-none text-stone-600 hover:bg-stone-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Viewer Canvas Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUpOrLeave}
        onWheel={handleWheel}
        className="w-full h-[400px] md:h-[450px] relative flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{ perspective: '1000px' }}
      >
        {/* Help Overlay Instruction */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[var(--theme-accent)]/90 backdrop-blur-xs text-white text-[9px] tracking-widest px-3.5 py-1.5 rounded-none pointer-events-none uppercase font-sans font-semibold flex items-center gap-1.5 shadow-md">
          <span>Drag to orbit & rotate</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)]" />
          <span>Scroll to zoom</span>
        </div>

        {/* Zoom Level Indicator */}
        {zoom !== 1 && (
          <div className="absolute top-4 right-4 bg-stone-200/80 text-stone-700 text-[10px] px-2 py-0.5 rounded-none font-mono">
            {Math.round(zoom * 100)}%
          </div>
        )}

        {/* 3D Tilted / Shimmering Plane Mode */}
        {activeTab === '3d' && (
          <div
            className="relative transition-transform duration-75 ease-out flex items-center justify-center"
            style={{
              transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${zoom})`,
              transformStyle: 'preserve-3d',
              width: '280px',
              height: '280px'
            }}
          >
            {/* The circular plate base (mimicking fine mud-relief lippan work) */}
            <div
              className="absolute w-full h-full rounded-full bg-[var(--theme-bg)] border-[12px] border-[#f8f5ef] overflow-hidden flex items-center justify-center shadow-2xl transition-colors duration-500"
              style={{
                boxShadow: `
                  0 20px 40px rgba(0,0,0,0.12), 
                  0 4px 10px rgba(0,0,0,0.08),
                  inset 0 0 16px rgba(0,0,0,0.04)
                `,
                borderColor: selectedColor ? selectedColor.value : '#f8f5ef',
                transform: 'translateZ(1px)'
              }}
            >
              {/* Actual hand-painted product image stretched neatly onto the circular plate */}
              <img
                src={activeImageProps.src}
                srcSet={activeImageProps.srcSet}
                sizes="(max-width: 640px) 280px, 350px"
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
                loading="lazy"
              />

              {/* Dynamic light gradient sheet that moves based on tilt */}
              <div
                className="absolute inset-0 mix-blend-overlay pointer-events-none transition-all duration-75"
                style={{
                  background: `radial-gradient(circle at ${reflectionX}% ${reflectionY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 60%)`
                }}
              />

              {/* Real-time working clock face details if it is a wall clock! */}
              {product.category === 'wall-clocks' && (
                <div className="absolute inset-0 rounded-full flex items-center justify-center z-10" style={{ transform: 'translateZ(10px)' }}>
                  {/* Subtle ticking seconds hand */}
                  <div
                    className="absolute w-[1.5px] h-[40%] bg-red-500 origin-bottom rounded-full"
                    style={{
                      transform: `rotate(${clockRot.second}deg) translateY(-50%)`,
                      transition: 'transform 0.1s cubic-bezier(0.4, 2.08, 0.55, 1)'
                    }}
                  />
                  {/* Elegant minute hand */}
                  <div
                    className="absolute w-[3px] h-[35%] bg-stone-900 origin-bottom rounded-full"
                    style={{
                      transform: `rotate(${clockRot.minute}deg) translateY(-50%)`
                    }}
                  />
                  {/* Symmetrical Hour hand */}
                  <div
                    className="absolute w-1.5 h-[24%] bg-stone-900 origin-bottom rounded-full"
                    style={{
                      transform: `rotate(${clockRot.hour}deg) translateY(-50%)`
                    }}
                  />
                  {/* Center Brass Cap */}
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-300 via-amber-500 to-amber-700 border border-amber-800 shadow-xs z-20" />

                  {/* Tick Marks on Border */}
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-3 bg-stone-900/10"
                      style={{
                        transform: `rotate(${i * 30}deg) translateY(-115px)`
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Shimmering mirror-work chips overlaid statically on top but glinting with rotation! */}
              {showSparkles && (
                <div className="absolute inset-0 pointer-events-none z-10" style={{ transform: 'translateZ(3px)' }}>
                  {mirrorChips.map(chip => {
                    // Calculate dynamic glint/reflection intensity based on how aligned the chip is to the reflection point
                    const chipTopPct = parseFloat(chip.top);
                    const chipLeftPct = parseFloat(chip.left);
                    const distToReflection = Math.sqrt(
                      Math.pow(chipLeftPct - reflectionX, 2) + Math.pow(chipTopPct - reflectionY, 2)
                    );
                    // Shimmer peaks when reflection overlaps the chip
                    const glintAlpha = Math.max(0, 1 - distToReflection / 50);

                    return (
                      <div
                        key={chip.id}
                        className="absolute flex items-center justify-center"
                        style={{ top: chip.top, left: chip.left }}
                      >
                        {/* The shiny silver mirror cut-out */}
                        <div
                          className={`
                            border border-white/40 shadow-[0_1px_2px_rgba(255,255,255,0.5)] bg-slate-300/40
                            ${chip.shape === 'rhombus' ? 'w-4 h-4 rotate-45' : ''}
                            ${chip.shape === 'diamond' ? 'w-3 h-5 rotate-12' : ''}
                            ${chip.shape === 'circle' ? 'w-3.5 h-3.5 rounded-full' : ''}
                          `}
                          style={{
                            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8)'
                          }}
                        >
                          {/* Glint sparkle spark flare */}
                          {glintAlpha > 0.4 && (
                            <div
                              className="absolute w-2 h-2 bg-white rounded-full animate-ping opacity-60"
                              style={{ animationDuration: '1.5s' }}
                            />
                          )}
                          <div
                            className="absolute inset-0 bg-white"
                            style={{ opacity: glintAlpha * 0.9 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Simulated 3D Side depth (MDF wood rim thickness) */}
            <div
              className="absolute rounded-full border-stone-800/80"
              style={{
                width: '280px',
                height: '280px',
                borderWidth: '1px',
                backgroundColor: '#3E2723', // deep wood brown rim
                transform: 'translateZ(-4px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.25)'
              }}
            />

            {/* Symmetrical Tassel & Pearl Strand hanging from the bottom edge */}
            {(product.category === 'personalized-name-plates' || product.id === 'p6' || product.id === 'p3') && (
              <div
                className="absolute"
                style={{
                  top: '100%',
                  left: '50%',
                  transform: `translateX(-50%) translateZ(2px) rotate(${rotationY * -0.2}deg)`, // swaying with motion inertia!
                  transition: isDragging ? 'none' : 'transform 0.5s ease-out',
                  transformOrigin: 'top center'
                }}
              >
                <div className="flex gap-4 -mt-2">
                  <TasselAccent colors={['#EA580C', '#991B1B']} length="md" />
                  <TasselAccent colors={['#EAB308', '#D97706']} length="lg" className="scale-110" />
                  <TasselAccent colors={['#EA580C', '#991B1B']} length="md" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 360° Photo-rig simulation scrubbing Mode */}
        {activeTab === '360' && (
          <div
            className="relative flex flex-col items-center justify-center"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* Displaying images. Product can have multiple images. We cycle or rotate based on frame index */}
            <div
              className="w-[280px] h-[280px] rounded-full border-4 border-[#f8f5ef] bg-white overflow-hidden shadow-2xl relative"
              style={{ borderColor: selectedColor ? selectedColor.value : '#f8f5ef' }}
            >
              {/* Loop/rotate angle simulation using CSS filters and shifts */}
              <img
                src={activeImageProps.src}
                srcSet={activeImageProps.srcSet}
                sizes="(max-width: 640px) 280px, 350px"
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-100 ease-out"
                style={{
                  transform: `rotate(${frameIndex * 30}deg)`, // rotates the plate image as standard drag feedback!
                }}
                loading="lazy"
              />

              {/* Angle Frame indicators */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-none font-mono">
                Frame {frameIndex + 1} / 12 (Angle: {frameIndex * 30}°)
              </div>
            </div>

            {/* Little indicator stand */}
            <div className="w-32 h-6 bg-[var(--theme-primary)]/10 rounded-full blur-md -mt-3 -z-10" />
          </div>
        )}
      </div>

      {/* Gallery Thumbnail Selector (for all product gallery images) */}
      {product.images && product.images.length > 1 && (
        <div id="product-gallery-thumbnails" className="flex items-center justify-center gap-3 px-4 py-2.5 bg-[var(--theme-bg)] border-t border-[var(--theme-primary)]/10">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 font-sans font-semibold mr-1">
            Gallery:
          </span>
          <div className="flex items-center gap-2">
            {product.images.map((imgUrl, idx) => {
              const thumbProps = getResponsiveImageProps(imgUrl, 80);
              const isActive = idx === activeImageIndex;
              return (
                <button
                  key={idx}
                  id={`gallery-thumb-${idx}`}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-12 h-12 rounded-sm overflow-hidden border transition-all duration-300 ${
                    isActive
                      ? 'border-[var(--theme-primary)] ring-1 ring-[var(--theme-primary)] scale-105 shadow-xs'
                      : 'border-stone-200 hover:border-[var(--theme-primary)]/50'
                  }`}
                  title={`View Gallery Image ${idx + 1}`}
                >
                  <img
                    src={thumbProps.src}
                    srcSet={thumbProps.srcSet}
                    sizes="48px"
                    alt={`${product.name} Gallery Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-[var(--theme-primary)]/10 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Zoom controls footbar */}
      <div className="flex items-center justify-between border-t border-[var(--theme-primary)]/15 px-4 py-2.5 bg-[#f8f5ef]/50">
        <span className="text-[10px] uppercase tracking-wider text-stone-500 font-sans font-medium">
          {product.materials[0]} • {product.materials[3] || 'Mud-Mirror Art'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(prev => Math.max(0.8, prev - 0.2))}
            className="p-1 border border-stone-200 rounded-none bg-white text-stone-700 hover:bg-[#f8f5ef] transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <input
            type="range"
            min="0.8"
            max="2.2"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-16 accent-[var(--theme-accent)]"
          />
          <button
            onClick={() => setZoom(prev => Math.min(2.2, prev + 0.2))}
            className="p-1 border border-stone-200 rounded-none bg-white text-stone-700 hover:bg-[#f8f5ef] transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
