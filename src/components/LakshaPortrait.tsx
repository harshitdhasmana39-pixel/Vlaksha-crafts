import React, { useState } from 'react';
import { dbService } from '../services/db';

interface LakshaPortraitProps {
  className?: string;
  variant?: 'circle' | 'square';
}

export default function LakshaPortrait({ className = '', variant = 'circle' }: LakshaPortraitProps) {
  const [imgError, setImgError] = useState(false);
  const borderRadiusClass = variant === 'circle' ? 'rounded-full' : 'rounded-xs';
  const settings = dbService.getSettings();
  const imageUrl = settings.founderImageUrl;

  if (imageUrl && !imgError) {
    return (
      <div id="laksha-portrait" className={`relative overflow-hidden w-full h-full bg-[#fcfbfa] ${borderRadiusClass} ${className}`}>
        <img
          src={imageUrl}
          alt="Founder Laksha Kandpal"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div id="laksha-portrait" className={`relative overflow-hidden w-full h-full bg-[#fcfbfa] ${borderRadiusClass} ${className}`}>
      {/* High-fidelity vector illustration of Founder Laksha Kandpal */}
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 400 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Background & Sky Gradient */}
          <linearGradient id="skyGrad" x1="200" y1="0" x2="200" y2="500" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#dcebf2" />
            <stop offset="35%" stopColor="#f7f5ee" />
            <stop offset="70%" stopColor="#f3e6d3" />
            <stop offset="100%" stopColor="#e5d0ba" />
          </linearGradient>

          {/* Wooden Log Gradients */}
          <linearGradient id="woodGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7a5530" />
            <stop offset="50%" stopColor="#966d42" />
            <stop offset="100%" stopColor="#634120" />
          </linearGradient>
          <linearGradient id="woodGradVert" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a3794d" />
            <stop offset="100%" stopColor="#57381b" />
          </linearGradient>

          {/* Hair & Coat Gradients */}
          <linearGradient id="hairGrad" x1="200" y1="50" x2="200" y2="350" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2c2018" />
            <stop offset="50%" stopColor="#1c130e" />
            <stop offset="100%" stopColor="#0a0705" />
          </linearGradient>
          <linearGradient id="coatGrad" x1="200" y1="200" x2="200" y2="500" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3d3f47" />
            <stop offset="50%" stopColor="#2b2d33" />
            <stop offset="100%" stopColor="#17181c" />
          </linearGradient>

          {/* Beige Dress Gradient */}
          <linearGradient id="dressGrad" x1="200" y1="220" x2="200" y2="450" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f5ebe0" />
            <stop offset="60%" stopColor="#e3d5ca" />
            <stop offset="100%" stopColor="#d5bdaf" />
          </linearGradient>

          {/* Suede/Leather Bag Gradients */}
          <linearGradient id="bagGrad" x1="200" y1="250" x2="200" y2="330" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#d48a37" />
            <stop offset="50%" stopColor="#b56a1b" />
            <stop offset="100%" stopColor="#8d4b0a" />
          </linearGradient>
          <linearGradient id="bootsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cfa170" />
            <stop offset="100%" stopColor="#966e42" />
          </linearGradient>

          {/* Shading, Shadows & Highlights */}
          <radialGradient id="sunGlow" cx="300" cy="80" r="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fff3d1" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ffe6aa" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* 1. BACKGROUND SKY & ENVIRONMENT */}
        <rect width="400" height="500" fill="url(#skyGrad)" />
        <circle cx="300" cy="80" r="150" fill="url(#sunGlow)" />

        {/* 2. BACKGROUND TREES & GREENERY (SOFT VECTOR STYLE) */}
        {/* Soft forest backdrop */}
        <path d="M-50 200 C30 180, 100 160, 150 180 C200 200, 250 170, 320 190 C380 210, 420 180, 450 190 L450 350 L-50 350 Z" fill="#b9cbaf" opacity="0.4" />
        <path d="M-50 220 C40 210, 90 200, 160 215 C230 230, 280 200, 340 220 C390 235, 420 220, 450 230 L450 350 L-50 350 Z" fill="#91aa83" opacity="0.6" />
        <path d="M-50 250 L450 250 L450 500 L-50 500 Z" fill="#6c805c" opacity="0.3" />

        {/* Autumn warm trees background */}
        <path d="M-20 130 C-10 110, 30 100, 50 120 C70 140, 60 170, 40 180 C20 190, -10 170, -20 130 Z" fill="#d29062" opacity="0.5" />
        <path d="M350 120 C370 100, 410 110, 420 135 C430 160, 400 180, 380 180 C360 180, 340 150, 350 120 Z" fill="#e5b15c" opacity="0.5" />

        {/* 3. RUSTIC WOODEN LOG FENCE (AS SEEN IN HER PHOTO) */}
        {/* Left vertical background log */}
        <path d="M12 250 L45 230 L55 500 L18 500 Z" fill="url(#woodGradVert)" stroke="#4d3218" strokeWidth="0.5" />
        {/* Left main angled supporting fence log */}
        <path d="M0 290 Q25 240 60 380 L35 390 Z" fill="url(#woodGrad)" stroke="#4d3218" strokeWidth="0.5" />

        {/* Diagonal log fence railing going across behind the figure */}
        <path d="M-20 280 C60 320, 150 340, 240 380 C250 385, 300 410, 420 460 L410 495 C290 440, 240 415, 230 410 C140 370, 50 350, -20 315 Z" fill="url(#woodGrad)" stroke="#4d3218" strokeWidth="0.75" />
        
        {/* Horizontal background log beam */}
        <path d="M-20 385 C80 405, 180 430, 420 500 L420 530 C180 460, 80 435, -20 415 Z" fill="url(#woodGrad)" stroke="#412912" strokeWidth="0.5" opacity="0.9" />

        {/* Right vertical log post behind shoulder */}
        <path d="M305 320 L335 315 L345 500 L315 500 Z" fill="url(#woodGradVert)" stroke="#4d3218" strokeWidth="0.5" />
        <path d="M305 320 C305 315, 335 310, 335 315 C335 320, 305 325, 305 320 Z" fill="#57381b" stroke="#4d3218" strokeWidth="0.5" />

        {/* 4. MAIN CHARACTER BODY & COAT */}
        {/* Shadow behind her body on the fence */}
        <path d="M100 240 Q150 200 250 230 L320 500 L80 500 Z" fill="#1e222b" opacity="0.25" />

        {/* Leggings (Tights) in Black */}
        <path d="M160 440 L240 440 L250 500 L150 500 Z" fill="#141416" />

        {/* Suede/Ugg boots peaking from bottom */}
        {/* Left Boot */}
        <path d="M135 485 L180 480 C185 490, 182 505, 150 505 L135 500 Z" fill="url(#bootsGrad)" stroke="#5c4328" strokeWidth="0.5" />
        <path d="M135 485 C145 485, 175 480, 180 480 L180 484 C175 484, 145 489, 135 489 Z" fill="#fcfcfc" opacity="0.8" /> {/* Boot fur trim */}
        {/* Right Boot */}
        <path d="M220 480 L265 485 C265 495, 255 505, 230 505 L220 500 Z" fill="url(#bootsGrad)" stroke="#5c4328" strokeWidth="0.5" />
        <path d="M220 480 C230 481, 260 485, 265 485 L265 489 C260 489, 230 485, 220 484 Z" fill="#fcfcfc" opacity="0.8" /> {/* Boot fur trim */}

        {/* Warm Beige/Cream Dress Body */}
        <path d="M140 240 Q200 220 260 240 Q280 340 265 440 L135 440 Q120 340 140 240 Z" fill="url(#dressGrad)" filter="url(#softShadow)" />

        {/* Dress Fold Lines */}
        <path d="M165 245 Q200 280 185 360" stroke="#c0b3a9" strokeWidth="1" strokeLinecap="round" />
        <path d="M235 245 Q200 290 215 380" stroke="#c0b3a9" strokeWidth="1" strokeLinecap="round" />
        <path d="M180 380 L170 435" stroke="#b5a69b" strokeWidth="1" />
        <path d="M220 380 L230 435" stroke="#b5a69b" strokeWidth="1" />

        {/* Dark Charcoal Trench Coat / Overcoat */}
        {/* Left Sleeve and side of coat */}
        <path d="M100 220 Q125 190 150 220 Q120 310 112 370 Q110 390 125 400 L130 440 L90 430 Q70 330 100 220 Z" fill="url(#coatGrad)" />
        {/* Right Sleeve and side of coat */}
        <path d="M300 220 Q275 190 250 220 Q280 310 288 370 Q290 390 275 400 L270 440 L310 430 Q330 330 300 220 Z" fill="url(#coatGrad)" />

        {/* Collar Lapels of the coat */}
        {/* Left Lapel */}
        <path d="M148 200 L115 240 L155 260 L145 220 Z" fill="#2d2f36" stroke="#1d1e22" strokeWidth="0.5" />
        {/* Right Lapel */}
        <path d="M252 200 L285 240 L245 260 L255 220 Z" fill="#2d2f36" stroke="#1d1e22" strokeWidth="0.5" />

        {/* Coat cuffs/sleeves detail */}
        <path d="M110 370 Q118 368 128 372 L125 382 Q117 378 108 380 Z" fill="#4d4f59" />
        <path d="M290 370 Q282 368 272 372 L275 382 Q283 378 292 380 Z" fill="#4d4f59" />

        {/* Wide metallic gold/brown belt at the waist */}
        <path d="M145 320 Q200 328 255 320 L252 334 Q200 342 148 334 Z" fill="#8c7a43" stroke="#66562b" strokeWidth="0.5" />
        {/* Shiny belt metal plate decoration */}
        <path d="M175 322 Q200 329 225 322 L223 331 Q200 338 177 331 Z" fill="#ffd700" opacity="0.8" />
        <line x1="185" y1="324" x2="185" y2="331" stroke="#8c7a43" strokeWidth="1" />
        <line x1="195" y1="325" x2="195" y2="333" stroke="#8c7a43" strokeWidth="1" />
        <line x1="205" y1="325" x2="205" y2="333" stroke="#8c7a43" strokeWidth="1" />
        <line x1="215" y1="324" x2="215" y2="331" stroke="#8c7a43" strokeWidth="1" />

        {/* 5. PORTRAIT HEAD & FACE */}
        {/* Neck */}
        <path d="M180 160 L180 195 C180 205, 220 205, 220 195 L220 160 Z" fill="#eac09d" />
        <path d="M180 180 C190 190, 210 190, 220 180" stroke="#cfa180" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

        {/* Beautiful Face Oval */}
        <path d="M165 110 C165 70, 235 70, 235 110 C235 155, 200 175, 200 175 C200 175, 165 155, 165 110 Z" fill="#f3ceaf" filter="url(#softShadow)" />

        {/* Cheeks blush & shading */}
        <ellipse cx="178" cy="135" rx="8" ry="5" fill="#f2a893" opacity="0.4" />
        <ellipse cx="222" cy="135" rx="8" ry="5" fill="#f2a893" opacity="0.4" />

        {/* Gentle, Warm Smile */}
        <path d="M188 152 Q200 162 212 152" stroke="#bf4343" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Soft upper lip shadow */}
        <path d="M192 150 Q200 153 208 150" stroke="#a03232" strokeWidth="1" strokeLinecap="round" fill="none" />

        {/* Cute nose path */}
        <path d="M196 138 Q200 141 204 138" stroke="#d59a73" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* STYLISH AVIATOR SUNGLASSES (HER TRADEMARK IN THE PHOTO) */}
        {/* Golden wire bridge */}
        <path d="M190 115 H210" stroke="#cca45c" strokeWidth="2" strokeLinecap="round" />
        <path d="M193 111 H207" stroke="#cca45c" strokeWidth="1.5" />

        {/* Left lens & frame */}
        <path d="M168 116 C168 111, 191 111, 192 116 C193 125, 188 135, 178 135 C170 135, 168 125, 168 116 Z" fill="#1e1f22" stroke="#cca45c" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M171 119 Q180 119 181 126" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.4" /> {/* Highlight */}

        {/* Right lens & frame */}
        <path d="M208 116 C208 111, 231 111, 232 116 C233 125, 231 135, 222 135 C213 135, 208 125, 208 116 Z" fill="#1e1f22" stroke="#cca45c" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M211 119 Q220 119 221 126" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.4" /> {/* Highlight */}

        {/* Gold hanging earrings */}
        <circle cx="163" cy="144" r="2" fill="#cca45c" />
        <line x1="163" y1="144" x2="163" y2="152" stroke="#cca45c" strokeWidth="1" />
        <circle cx="163" cy="154" r="3" fill="#cca45c" />

        <circle cx="237" cy="144" r="2" fill="#cca45c" />
        <line x1="237" y1="144" x2="237" y2="152" stroke="#cca45c" strokeWidth="1" />
        <circle cx="237" cy="154" r="3" fill="#cca45c" />

        {/* 6. HAIR BACKDROP & FLOWING FOREGROUND WAVES */}
        {/* Massive background hair */}
        <path d="M150 70 C120 100, 110 160, 130 220 Q140 240, 150 200 C150 200, 152 140, 170 100 C185 70, 215 70, 230 100 C248 140, 250 200, 250 200 Q260 240, 270 220 C290 160, 280 100, 250 70 C220 40, 180 40, 150 70 Z" fill="url(#hairGrad)" />

        {/* Left side locks draping down over her shoulders */}
        <path d="M165 100 C145 120, 140 180, 152 230 C158 260, 168 280, 155 310 C148 325, 135 340, 145 360 C150 370, 160 365, 162 350 C165 320, 155 300, 168 260 C175 220, 170 160, 180 110 Z" fill="url(#hairGrad)" />
        {/* Right side locks draping down over her shoulders */}
        <path d="M235 100 C255 120, 260 180, 248 230 C242 260, 232 280, 245 310 C252 325, 265 340, 255 360 C250 370, 240 365, 238 350 C235 320, 245 300, 232 260 C225 220, 230 160, 220 110 Z" fill="url(#hairGrad)" />

        {/* Detailed hair wave strands & highlights */}
        <path d="M148 120 C138 140, 142 180, 150 200" stroke="#523d30" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        <path d="M152 160 C148 190, 153 220, 160 240" stroke="#523d30" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        <path d="M252 120 C262 140, 258 180, 250 200" stroke="#523d30" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        <path d="M248 160 C252 190, 247 220, 240 240" stroke="#523d30" strokeWidth="1" strokeLinecap="round" opacity="0.7" />

        {/* 7. HANDS & LEATHER SHOULDER BAG (HELD BEAUTIFULLY) */}
        {/* Leather Bag Strap - Double golden/leather link chain over her arm/shoulder */}
        <path d="M145 225 C140 230, 120 280, 122 340" stroke="#cca45c" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <path d="M148 228 C144 233, 125 282, 127 341" stroke="#8d4b0a" strokeWidth="1.5" strokeLinecap="round" />

        {/* Leather Bag body */}
        {/* Curved, designer baguette shape bag in rich tan brown leather */}
        <path d="M125 340 C145 338, 215 338, 235 340 C245 341, 248 355, 245 370 C240 382, 225 390, 180 390 C135 390, 120 382, 115 370 C112 355, 115 341, 125 340 Z" fill="url(#bagGrad)" filter="url(#softShadow)" stroke="#7a3e05" strokeWidth="0.75" />

        {/* Gold metal plate details and zipper */}
        <path d="M160 348 H200" stroke="#cca45c" strokeWidth="2.5" />
        <path d="M175 358 Q180 361 185 358" stroke="#ffd700" strokeWidth="1" fill="#ffd700" /> {/* Small golden brand badge */}

        {/* Hands holding the bag handle */}
        {/* Left hand details (tan skin) */}
        <path d="M136 340 C132 340, 128 344, 131 350 C134 354, 140 354, 142 348 C144 344, 140 340, 136 340 Z" fill="#eac09d" stroke="#cfa180" strokeWidth="0.5" />
        {/* Right hand details */}
        <path d="M224 340 C220 340, 216 344, 219 350 C222 354, 228 354, 230 348 C232 344, 228 340, 224 340 Z" fill="#eac09d" stroke="#cfa180" strokeWidth="0.5" />

        {/* 8. ARTISTIC VIBE/GLOW ACCENTS */}
        {/* Sparkles / Magic stars for the Vlaksha Crafts artist look */}
        <path d="M320 120 L323 125 L328 126 L323 129 L322 134 L319 129 L314 128 L319 125 Z" fill="#ffeaa7" opacity="0.8" />
        <path d="M70 170 L72 173 L75 174 L72 176 L71 179 L69 176 L66 175 L69 173 Z" fill="#ffeaa7" opacity="0.8" />
        <circle cx="110" cy="130" r="1.5" fill="#ffd700" opacity="0.6" />
        <circle cx="280" cy="160" r="1" fill="#ffd700" opacity="0.6" />
        <circle cx="100" cy="210" r="2" fill="#ffd700" opacity="0.5" />
        <circle cx="300" cy="260" r="1.5" fill="#ffd700" opacity="0.5" />
      </svg>
    </div>
  );
}
