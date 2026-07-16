import React, { useState } from 'react';
import TasselAccent from './TasselAccent';
import { Mail, Phone, MapPin, Instagram, Sparkles, Heart, Palette, ShieldCheck, Award } from 'lucide-react';
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
    <footer id="vlaksha-footer" className="bg-[#1C1613] text-[#FAF9F5]/80 relative overflow-hidden pt-12 pb-6 border-t border-[var(--theme-primary)]/30">
      
      {/* Decorative Golden Pattern Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-[var(--theme-primary)]/30" />

      {/* Swaying decorative tassels hanging from the footer header top! */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-12 -mt-1 opacity-60">
        <TasselAccent colors={['var(--theme-primary)', 'var(--theme-accent)']} length="sm" />
        <TasselAccent colors={['#991B1B', 'var(--theme-primary)']} length="md" className="hidden sm:flex" />
        <TasselAccent colors={['var(--theme-accent)', 'var(--theme-primary)']} length="sm" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-[var(--theme-primary)]/10">
          
          {/* Brand Intro Column */}
          <div className="space-y-4">
            <div className="select-none">
              <VlakshaLogo size="sm" showText={true} theme="dark" />
            </div>
            <p className="text-xs text-[#FAF9F5]/60 leading-relaxed font-sans">
              Authentic hand-painted Indian mud-mirror (Lippan) reliefs and intricate mandala home decor. Each piece is crafted carefully on custom wood bases using authentic premium glass, clay, and jewel tones.
            </p>
            <div className="flex gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--theme-accent)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--theme-primary)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-rose-700" />
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h3 className="font-serif text-sm font-light text-white tracking-wide uppercase">
              Boutique Explore
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[var(--theme-primary)] transition-colors text-left"
                >
                  Home Stage
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="hover:text-[var(--theme-primary)] transition-colors text-left"
                >
                  Shop the Handcrafted Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ai-studio')}
                  className="hover:text-[var(--theme-primary)] transition-colors text-left font-semibold text-[var(--theme-primary)]"
                >
                  AI Artisanal Design Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[var(--theme-primary)] transition-colors text-left"
                >
                  About Artist Laksha Kandpal
                </button>
              </li>
            </ul>
          </div>

          {/* Crafting Techniques */}
          <div className="space-y-4">
            <h3 className="font-serif text-sm font-light text-white tracking-wide uppercase">
              Materials & Authenticity
            </h3>
            <p className="text-xs text-[#FAF9F5]/60 leading-relaxed font-sans">
              Our art utilizes thick MDF backing panels, high-grade fine clay mud mixtures, heavy coverage acrylic paints, and hand-cut precision mirror chips. Standard painting process takes 5–12 days depending on complexity.
            </p>
            <p className="text-xs text-[#FAF9F5]/60 flex items-center gap-1 italic">
              <Sparkles className="w-3.5 h-3.5 text-[var(--theme-primary)]" /> 100% Sourced & Painted in India
            </p>
          </div>

          {/* Artisanal Updates Newsletter */}
          <div className="space-y-4">
            <h3 className="font-serif text-sm font-light text-white tracking-wide uppercase">
              Artisanal Updates
            </h3>
            <p className="text-xs text-[#FAF9F5]/60 leading-relaxed font-sans">
              Receive preview invitations for new mud-mirror collections, traditional art stories, and custom booking slots.
            </p>
            {subscribed ? (
              <div className="bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 p-3 text-[11px] text-[var(--theme-primary)] font-sans leading-relaxed animate-fadeIn">
                <span className="font-bold block mb-0.5">Namaste & Thank You!</span>
                You have successfully joined Laksha's studio updates.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex gap-1">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-white/5 border border-[var(--theme-primary)]/25 focus:border-[#FAF9F5] focus:outline-hidden text-xs text-white px-3 py-2 placeholder:text-white/30 rounded-none w-full"
                  />
                  <button
                    type="submit"
                    className="bg-[var(--theme-primary)] hover:bg-[#FAF9F5] text-[#1C1613] font-sans text-[10px] uppercase tracking-wider font-bold px-3.5 transition-colors rounded-none whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="font-serif text-sm font-light text-white tracking-wide uppercase">
              Contact & Requests
            </h3>
            <ul className="space-y-3 text-xs text-[#FAF9F5]/60">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[var(--theme-primary)] shrink-0" />
                <a href={`mailto:${settings.contactEmail || 'harshitdhasmana39@gmail.com'}`} className="hover:text-[var(--theme-primary)] transition-all select-all">
                  {settings.contactEmail || 'harshitdhasmana39@gmail.com'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[var(--theme-primary)] shrink-0" />
                <span className="select-all">{settings.contactPhone || '+91 95481 23456'}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[var(--theme-primary)] shrink-0 mt-0.5" />
                <span>{settings.contactAddress || 'Noida, National Capital Region (NCR), India'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-[var(--theme-primary)] shrink-0" />
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[var(--theme-primary)] transition-colors">
                  @vlaksha_crafts
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Trust & Quality Strip */}
        <div className="py-6 border-b border-[var(--theme-primary)]/10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5 text-[var(--theme-primary)]" />
            </div>
            <div>
              <h4 className="text-white text-xs font-serif font-medium tracking-wide uppercase">100% Hand-Painted</h4>
              <p className="text-[11px] text-[#FAF9F5]/50 font-sans mt-0.5 leading-relaxed">Every piece crafted with genuine clay & precision mirrors by Artist Laksha.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[var(--theme-primary)]" />
            </div>
            <div>
              <h4 className="text-white text-xs font-serif font-medium tracking-wide uppercase">Secure Payment</h4>
              <p className="text-[11px] text-[#FAF9F5]/50 font-sans mt-0.5 leading-relaxed">Fully encrypted transactions with trusted gateways (Razorpay/UPI).</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-[var(--theme-primary)]" />
            </div>
            <div>
              <h4 className="text-white text-xs font-serif font-medium tracking-wide uppercase">Artisanal Guarantee</h4>
              <p className="text-[11px] text-[#FAF9F5]/50 font-sans mt-0.5 leading-relaxed">Strict quality-check of clay bonding and mirror sets before shipping.</p>
            </div>
          </div>
        </div>

        {/* Beautiful Editorial Bottom Ribbon */}
        <div className="py-4 border-b border-[var(--theme-primary)]/10 flex flex-wrap justify-between items-center text-[10px] font-sans uppercase tracking-[0.2em] opacity-80 gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span>Free Shipping Pan-India</span>
            <span className="text-[var(--theme-primary)]">●</span>
            <span>Authentic Lippan Technique</span>
            <span className="text-[var(--theme-primary)]">●</span>
            <span>Made to Order (7-10 Days)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="italic normal-case font-serif tracking-normal">Instagram</span>
            <span className="text-[var(--theme-primary)]">@vlaksha.crafts</span>
          </div>
        </div>

        {/* Copywrite / Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF9F5]/40 font-sans">
          <p>© 2026 Vlaksha Crafts. All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            <span>Handpainted with love</span>
            <Heart className="w-3 h-3 text-[var(--theme-primary)] fill-[var(--theme-primary)]" />
            <span>by Laksha Kandpal</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
