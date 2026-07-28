import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Sparkles, Heart, Palette, ShieldCheck, Award, Truck, Hammer, Clock } from 'lucide-react';
import { dbService } from '../services/db';
import VlakshaLogo from './VlakshaLogo';

interface FooterProps {
  onNavigate: (view: 'home' | 'shop' | 'about' | 'admin' | 'ai-studio') => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const settings = dbService.getSettings();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer id="vlaksha-footer" className="bg-[#181D28] text-stone-300 relative overflow-hidden pt-16 pb-24 lg:pb-8 border-t border-[#C9A24B]/15">
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-16">
        
        {/* ROW 1: Brand Intro + Newsletter (2-Column Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-12 border-b border-white/10">
          <div className="lg:col-span-6 space-y-3">
            <div className="select-none">
              <VlakshaLogo size="sm" showText={true} theme="dark" />
            </div>
            <p className="text-xs text-stone-400 max-w-lg leading-relaxed font-sans font-light">
              Authentic hand-painted Indian mud-mirror (Lippan) reliefs and sacred mandala home decor. Masterfully crafted on custom wood bases by artist Laksha Kandpal using fine clay and pure glass mirrors.
            </p>
          </div>

          <div className="lg:col-span-6 space-y-3 lg:pl-8">
            <h3 className="font-serif text-sm font-light text-white tracking-wide uppercase">
              Artisanal Studio Updates
            </h3>
            <p className="text-xs text-stone-400 font-sans font-light">
              Receive preview invitations for new handcrafted collections, art stories, and custom commission slots.
            </p>

            {subscribed ? (
              <div className="bg-[#C9A24B]/10 border border-[#C9A24B]/30 p-3 rounded-xl text-xs text-[#EAD8B1] font-sans">
                <span className="font-semibold">Namaste & Thank You!</span> You have successfully joined Laksha's studio updates.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/15 focus:border-[#C9A24B] focus:outline-none text-xs text-white px-4 py-2.5 rounded-full placeholder:text-stone-500 font-sans"
                />
                <button
                  type="submit"
                  className="bg-[#C9A24B] hover:bg-white hover:text-[#181D28] text-white font-sans text-[10.5px] uppercase tracking-widest font-semibold px-5 py-2.5 rounded-full transition-all cursor-pointer whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ROW 2: Link Columns (3 Slim Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-12 sm:gap-x-8 pb-12 border-b border-white/10 font-sans text-xs">
          
          {/* Column 1: Explore */}
          <div className="space-y-3">
            <h4 className="text-[10.5px] uppercase tracking-[0.25em] font-semibold text-[#C9A24B]">
              Explore
            </h4>
            <ul className="space-y-2.5 text-stone-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">
                  Home Stage
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors cursor-pointer">
                  Shop Handcrafted Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ai-studio')} className="hover:text-[#C9A24B] transition-colors cursor-pointer font-medium text-stone-300">
                  AI Artisanal Design Studio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">
                  About Artist Laksha Kandpal
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Support */}
          <div className="space-y-3">
            <h4 className="text-[10.5px] uppercase tracking-[0.25em] font-semibold text-[#C9A24B]">
              Support & Inquiries
            </h4>
            <ul className="space-y-2.5 text-stone-400">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C9A24B] shrink-0 stroke-[1.5]" />
                <a href={`mailto:${settings.contactEmail || 'harshitdhasmana39@gmail.com'}`} className="hover:text-white transition-colors select-all">
                  {settings.contactEmail || 'harshitdhasmana39@gmail.com'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C9A24B] shrink-0 stroke-[1.5]" />
                <span className="select-all">{settings.contactPhone || '+91 95481 23456'}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C9A24B] shrink-0 mt-0.5 stroke-[1.5]" />
                <span>{settings.contactAddress || 'Noida, National Capital Region (NCR), India'}</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Connect */}
          <div className="space-y-3">
            <h4 className="text-[10.5px] uppercase tracking-[0.25em] font-semibold text-[#C9A24B]">
              Connect
            </h4>
            <ul className="space-y-2.5 text-stone-400">
              <li className="flex items-center gap-2">
                <Instagram className="w-3.5 h-3.5 text-[#C9A24B] shrink-0 stroke-[1.5]" />
                <a 
                  href={settings.instagramUrl || "https://www.instagram.com/vlaksha_crafts?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white transition-colors underline decoration-[#C9A24B]/40 underline-offset-4"
                >
                  @vlaksha_crafts on Instagram
                </a>
              </li>
              <li className="flex items-center gap-2 text-stone-400">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A24B] shrink-0 stroke-[1.5]" />
                <span>100% Handpainted in India</span>
              </li>
            </ul>
          </div>

        </div>

        {/* ROW 3: Unified Trust Strip (6 Signals in Single Row on Desktop, 2x3 Grid on Mobile) */}
        <div className="pb-10 border-b border-white/10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-8 gap-x-4 text-xs text-stone-400 font-sans">
          
          <div className="flex items-center gap-2.5">
            <Palette className="w-4 h-4 text-[#C9A24B] shrink-0 stroke-[1.5]" />
            <span className="text-[11px] font-medium text-stone-300">100% Hand-Painted</span>
          </div>

          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#C9A24B] shrink-0 stroke-[1.5]" />
            <span className="text-[11px] font-medium text-stone-300">Secure Razorpay / UPI</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Award className="w-4 h-4 text-[#C9A24B] shrink-0 stroke-[1.5]" />
            <span className="text-[11px] font-medium text-stone-300">Artisanal Guarantee</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-[#C9A24B] shrink-0 stroke-[1.5]" />
            <span className="text-[11px] font-medium text-stone-300">Free Shipping Pan-India</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Hammer className="w-4 h-4 text-[#C9A24B] shrink-0 stroke-[1.5]" />
            <span className="text-[11px] font-medium text-stone-300">Authentic Lippan Clay</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-[#C9A24B] shrink-0 stroke-[1.5]" />
            <span className="text-[11px] font-medium text-stone-300">Made-to-Order Crafts</span>
          </div>

        </div>

        {/* ROW 4: Legal & Credit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500 font-sans">
          <p>© 2026 Vlaksha Crafts. All Rights Reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Handpainted with love</span>
            <Heart className="w-3.5 h-3.5 text-[#C4703B] fill-current" />
            <span>by Laksha Kandpal</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
