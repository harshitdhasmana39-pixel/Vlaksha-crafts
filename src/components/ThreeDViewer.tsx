import React, { useState, useRef, useEffect } from 'react';
import { Product, ColorVariant } from '../types';
import TasselAccent from './TasselAccent';
import CraftImage from './CraftImage';
import { Sparkles, Maximize2, Minimize2, RefreshCw, Eye, Palette, Compass, Move, Clock } from 'lucide-react';
import { getHueRotateFilterForColor } from '../utils/colorUtils';

interface ThreeDViewerProps {
  product: Product;
  selectedColor?: ColorVariant;
  onSelectColor?: (color: ColorVariant) => void;
}

export default function ThreeDViewer({ product, selectedColor, onSelectColor }: ThreeDViewerProps) {
  const [rotationX, setRotationX] = useState<number>(12); // subtle baseline 3D tilt
  const [rotationY, setRotationY] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'3d' | '360'>('3d');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showClockHands, setShowClockHands] = useState<boolean>(false);

  // 360 photo rig state
  const [frameIndex, setFrameIndex] = useState<number>(0);

  // Active gallery image state
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Clock hands state (for wall clocks)
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (product.category === 'wall-clocks') {
      const timer = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(timer);
    }
  }, [product.category]);

  // Reset active image index when product changes
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
      // Parallax 3D tilt on hover
      if (containerRef.current && activeTab === '3d') {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const tiltX = -(y / rect.height) * 22;
        const tiltY = (x / rect.width) * 22;

        setRotationX(12 + tiltX);
        setRotationY(tiltY);
      }
      return;
    }

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    if (activeTab === '3d') {
      setRotationY(rotationStartRef.current.y + deltaX * 0.55);
      setRotationX(Math.max(-50, Math.min(50, rotationStartRef.current.x - deltaY * 0.55)));
    } else {
      const framesCount = 12;
      const scrubThreshold = 18;
      const frameDelta = Math.floor(deltaX / scrubThreshold);
      let nextFrame = (frameIndex + frameDelta) % framesCount;
      if (nextFrame < 0) nextFrame += framesCount;
      setFrameIndex(nextFrame);
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile devices
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
      setRotationY(rotationStartRef.current.y + deltaX * 0.65);
      setRotationX(Math.max(-50, Math.min(50, rotationStartRef.current.x - deltaY * 0.65)));
    } else {
      const scrubThreshold = 15;
      const frameDelta = Math.floor(deltaX / scrubThreshold);
      let nextFrame = (frameIndex + frameDelta) % 12;
      if (nextFrame < 0) nextFrame += 12;
      setFrameIndex(nextFrame);
    }
  };

  useEffect(() => {
    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * -0.001;
      setZoom(prev => Math.max(0.8, Math.min(2.5, prev + zoomDelta)));
    };
    
    const element = containerRef.current;
    if (element) {
      element.addEventListener('wheel', handleWheelNative, { passive: false });
    }
    return () => {
      if (element) {
        element.removeEventListener('wheel', handleWheelNative);
      }
    };
  }, []);

  const resetView = () => {
    setRotationX(12);
    setRotationY(0);
    setZoom(1);
    setFrameIndex(0);
  };

  // Dynamic light reflection coordinates based on 3D rotation
  const reflectionX = Math.max(0, Math.min(100, 50 + (rotationY * 0.95)));
  const reflectionY = Math.max(0, Math.min(100, 50 - (rotationX * 0.95)));

  // Clock hands rotation calculation
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

  // Determine active display image:
  // 1. If color variant has a specific image, use that
  // 2. Otherwise use gallery image
  const variantImage = selectedColor?.image;
  const galleryImage = product.images[activeImageIndex] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=85&w=800&auto=format&fit=crop';
  const activeImage = variantImage || galleryImage;

  // Fallback CSS hue rotation filter if color does not have a unique image
  const fallbackHueFilter = !variantImage && selectedColor?.value ? getHueRotateFilterForColor(selectedColor.value) : 'none';

  return (
    <div
      id="three-d-viewer"
      className={`flex flex-col bg-[#FAF7F2] border border-[#C9A24B]/15 rounded-3xl overflow-hidden shadow-soft-gallery relative transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl bg-stone-900 border-[#C9A24B]/50 flex flex-col justify-between' : ''
      }`}
    >
      {/* Main 3D Canvas Stage */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUpOrLeave}
        className={`w-full relative flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none transition-all ${
          isFullscreen ? 'h-[80vh]' : 'h-[380px] md:h-[460px]'
        }`}
        style={{ perspective: '1100px' }}
      >
        {/* Floating Minimal Glass Toolbar (Top-Right) */}
        <div className="absolute top-4 right-4 z-40 flex items-center gap-1.5 p-1.5 bg-white/80 backdrop-blur-md border border-[#C9A24B]/20 rounded-full shadow-xs">
          <button
            onClick={() => setActiveTab(activeTab === '3d' ? '360' : '3d')}
            title={activeTab === '3d' ? 'Switch to 360° Rig' : 'Switch to 3D Depth'}
            className="p-1.5 rounded-full text-[#22304F] hover:bg-[#F2EBDC] transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-sans font-semibold px-2.5"
          >
            {activeTab === '3d' ? <Move className="w-3.5 h-3.5 text-[#C9A24B] stroke-[1.5]" /> : <Compass className="w-3.5 h-3.5 text-[#C9A24B] stroke-[1.5]" />}
            <span>{activeTab === '3d' ? '3D' : '360°'}</span>
          </button>

          <div className="h-3 w-[1px] bg-stone-200" />

          {product.category === 'wall-clocks' && (
            <button
              onClick={() => setShowClockHands(!showClockHands)}
              title={showClockHands ? "Hide Simulated Ticking Hands" : "Show Simulated Ticking Hands"}
              className={`p-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-sans font-semibold px-2.5 ${
                showClockHands ? 'text-[#C9A24B] bg-[#F2EBDC]/80' : 'text-stone-400 hover:bg-stone-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>{showClockHands ? 'Hands ON' : 'Hands OFF'}</span>
            </button>
          )}

          <button
            onClick={resetView}
            title="Reset Angle"
            className="p-1.5 rounded-full text-stone-600 hover:bg-[#F2EBDC] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Inspection"}
            className="p-1.5 rounded-full text-stone-600 hover:bg-[#F2EBDC] transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 stroke-[1.5]" /> : <Maximize2 className="w-3.5 h-3.5 stroke-[1.5]" />}
          </button>
        </div>

        {/* Selected Colorway Badge Overlay (Top-Left) */}
        {selectedColor && (
          <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md border border-[#C9A24B]/20 text-[#22304F] text-[10px] px-3 py-1 rounded-full font-sans font-medium flex items-center gap-2 shadow-xs z-30">
            <span
              className="w-2.5 h-2.5 rounded-full border border-stone-300 shadow-xs"
              style={{ backgroundColor: selectedColor.value }}
            />
            <span>{selectedColor.name}</span>
          </div>
        )}

        {/* Zoom Level Badge */}
        {zoom !== 1 && (
          <div className="absolute bottom-4 right-4 bg-[#22304F]/90 text-white text-[9.5px] px-2.5 py-1 rounded-full font-mono shadow-xs z-30">
            {Math.round(zoom * 100)}%
          </div>
        )}

        {/* Selected Colorway Badge Overlay */}
        {selectedColor && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs border border-[var(--theme-primary)]/30 text-stone-900 text-[10px] px-3 py-1 rounded-none font-sans font-semibold flex items-center gap-2 shadow-xs z-30">
            <span
              className="w-2.5 h-2.5 rounded-full border border-stone-300 shadow-xs"
              style={{ backgroundColor: selectedColor.value }}
            />
            <span>{selectedColor.name}</span>
          </div>
        )}

        {/* 3D Tilted Plane & Multilayer Depth Stage */}
        {activeTab === '3d' && (
          <div
            className="relative transition-transform duration-100 ease-out flex items-center justify-center"
            style={{
              transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${zoom})`,
              transformStyle: 'preserve-3d',
              width: '290px',
              height: '290px'
            }}
          >
            {/* LAYER -1: Shadow cast onto wall/floor behind craft */}
            <div
              className="absolute w-full h-full rounded-full pointer-events-none"
              style={{
                transform: 'translateZ(-28px) scale(0.98)',
                boxShadow: `
                  ${-rotationY * 1.2}px ${20 + rotationX * 1.2}px 45px rgba(0, 0, 0, 0.35),
                  0 0 100px rgba(0, 0, 0, 0.15)
                `
              }}
            />

            {/* LAYER 0: MDF Engineered Wood Backing Rim Thickness */}
            <div
              className="absolute w-full h-full rounded-full border-2 border-stone-900/80 overflow-hidden"
              style={{
                backgroundColor: '#382219', // Deep dark wood brown edge
                transform: 'translateZ(-10px)',
                boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)'
              }}
            />

            {/* LAYER 1: Base Circular Plate & Handpainted Artwork */}
            <div
              className="absolute w-full h-full rounded-full bg-white border-2 border-white/60 overflow-hidden flex items-center justify-center shadow-xl transition-all duration-500"
              style={{
                transform: 'translateZ(0px)'
              }}
            >
              {/* Ultra-HD Craft Image with progressive blur-up */}
              <CraftImage
                src={activeImage}
                alt={product.name}
                defaultWidth={800}
                aspectRatio="aspect-square"
                containerClassName="w-full h-full rounded-full"
                className="w-full h-full object-contain rounded-full"
                style={{ filter: fallbackHueFilter }}
              />

              {/* Dynamic Lacquer Gloss / Varnish Specular Highlight */}
              <div
                className="absolute inset-0 mix-blend-overlay pointer-events-none transition-all duration-75 rounded-full"
                style={{
                  background: `radial-gradient(circle at ${reflectionX}% ${reflectionY}%, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0) 55%)`
                }}
              />

              {/* LAYER 2: Embossed Clay Lippan Relief Ring Shadow */}
              <div
                className="absolute inset-2 border-[4px] border-white/20 rounded-full pointer-events-none shadow-inner"
                style={{ transform: 'translateZ(6px)' }}
              />

              {/* LAYER 3: Working Clock Movement Hands (If Wall Clock and enabled) */}
              {product.category === 'wall-clocks' && showClockHands && (
                <div className="absolute inset-0 rounded-full flex items-center justify-center z-20" style={{ transform: 'translateZ(14px)' }}>
                  {/* Ticking seconds hand */}
                  <div
                    className="absolute w-[1.5px] h-[42%] bg-red-600 origin-bottom rounded-full shadow-md"
                    style={{
                      transform: `rotate(${clockRot.second}deg) translateY(-50%)`,
                      transition: 'transform 0.1s cubic-bezier(0.4, 2.08, 0.55, 1)'
                    }}
                  />
                  {/* Minute hand */}
                  <div
                    className="absolute w-[3.5px] h-[36%] bg-stone-900 origin-bottom rounded-full shadow-md"
                    style={{
                      transform: `rotate(${clockRot.minute}deg) translateY(-50%)`
                    }}
                  />
                  {/* Hour hand */}
                  <div
                    className="absolute w-1.5 h-[25%] bg-stone-900 origin-bottom rounded-full shadow-md"
                    style={{
                      transform: `rotate(${clockRot.hour}deg) translateY(-50%)`
                    }}
                  />
                  {/* Brass Center Cap */}
                  <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-700 border border-amber-900 shadow-md z-30" />

                  {/* Hour tick markers */}
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-3 bg-stone-900/20"
                      style={{
                        transform: `rotate(${i * 30}deg) translateY(-120px)`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* LAYER 5: Swaying Silk Tassels & Pearl Strands (Nameplates / Accents) */}
            {(product.category === 'personalized-name-plates' || product.id === 'p6' || product.id === 'p3') && (
              <div
                className="absolute"
                style={{
                  top: '100%',
                  left: '50%',
                  transform: `translateX(-50%) translateZ(12px) rotate(${rotationY * -0.25}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.45s ease-out',
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

        {/* 360° Rotate Rig Mode */}
        {activeTab === '360' && (
          <div
            className="relative flex flex-col items-center justify-center"
            style={{ transform: `scale(${zoom})` }}
          >
            <div
              className="w-[290px] h-[290px] rounded-full border-4 border-[#fdfbf7] bg-white overflow-hidden shadow-2xl relative"
              style={{ borderColor: selectedColor ? selectedColor.value : '#fdfbf7' }}
            >
              <CraftImage
                src={activeImage}
                alt={product.name}
                defaultWidth={800}
                aspectRatio="aspect-square"
                className="w-full h-full object-contain transition-transform duration-100 ease-out"
                style={{
                  transform: `rotate(${frameIndex * 30}deg)`,
                  filter: fallbackHueFilter
                }}
              />

              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/75 text-white text-[9px] px-2.5 py-1 rounded-none font-mono tracking-wider">
                Frame {frameIndex + 1} / 12 ({frameIndex * 30}°)
              </div>
            </div>

            {/* Display Stand Base */}
            <div className="w-36 h-5 bg-[var(--theme-primary)]/15 rounded-full blur-md -mt-2 -z-10" />
          </div>
        )}
      </div>

      {/* Interactive Color Variant Swatches Bar */}
      {product.colors && product.colors.length > 0 && (
        <div id="craft-color-swatches-bar" className="px-4 py-2 bg-stone-50 border-t border-[var(--theme-primary)]/15 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <Palette className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
            <span className="text-[10px] font-sans uppercase font-bold text-stone-600 tracking-wider">
              Artisan Colors:
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-0.5 pr-2">
            {product.colors.map((colorObj, idx) => {
              const isSelected = selectedColor?.name === colorObj.name || (!selectedColor && idx === 0);
              return (
                <button
                  key={idx}
                  onClick={() => onSelectColor && onSelectColor(colorObj)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-none text-[10px] font-sans transition-all duration-200 shrink-0 border ${
                    isSelected
                      ? 'bg-white border-[var(--theme-primary)] font-bold text-stone-900 shadow-xs ring-1 ring-[var(--theme-primary)]/30'
                      : 'bg-white/60 border-stone-200 text-stone-600 hover:border-stone-400 hover:bg-white'
                  }`}
                  title={colorObj.name}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-stone-300 shadow-2xs shrink-0"
                    style={{ backgroundColor: colorObj.value }}
                  />
                  <span className="truncate max-w-[120px]">{colorObj.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Multi-Angle Gallery Thumbnails (if multiple images present) */}
      {product.images && product.images.length > 1 && (
        <div id="product-gallery-thumbnails" className="flex items-center justify-center gap-3 px-4 py-2 bg-[var(--theme-bg)] border-t border-[var(--theme-primary)]/10">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 font-sans font-semibold mr-1">
            Photo Angles:
          </span>
          <div className="flex items-center gap-2">
            {product.images.map((imgUrl, idx) => {
              const isActive = idx === activeImageIndex && !selectedColor?.image;
              return (
                <button
                  key={idx}
                  id={`gallery-thumb-${idx}`}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-11 h-11 rounded-xs overflow-hidden border transition-all duration-300 ${
                    isActive
                      ? 'border-[var(--theme-primary)] ring-1 ring-[var(--theme-primary)] scale-105 shadow-xs'
                      : 'border-stone-200 hover:border-[var(--theme-primary)]/50'
                  }`}
                  title={`Angle ${idx + 1}`}
                >
                  <CraftImage
                    src={imgUrl}
                    alt={`Angle ${idx + 1}`}
                    defaultWidth={120}
                    aspectRatio="aspect-square"
                    className="w-full h-full object-contain"
                    showShimmer={false}
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-[var(--theme-primary)]/15 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Viewer Bottom Caption */}
      <div className="flex items-center justify-between border-t border-[#C9A24B]/15 px-5 py-2.5 bg-white/70 backdrop-blur-xs text-[10.5px] font-sans text-stone-500">
        <span className="font-light tracking-wide text-stone-400">
          {product.materials[0] || 'MDF Wood Base'} • {product.materials[1] || 'Handpainted Clay'}
        </span>
        <span className="font-medium tracking-widest uppercase text-[9.5px] text-[#22304F]">
          Drag to orbit • Scroll to zoom
        </span>
      </div>
    </div>
  );
}
