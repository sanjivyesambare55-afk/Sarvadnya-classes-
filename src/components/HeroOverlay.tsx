import React from 'react';
import { ArrowDown, MessageCircle, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { BUSINESS_INFO, getWhatsAppUrl } from '../constants/data';
import { scrollToSection } from '../utils/navigation';

interface HeroOverlayProps {
  onOpenEnquiry: (program?: string) => void;
}

export const HeroOverlay: React.FC<HeroOverlayProps> = ({ onOpenEnquiry }) => {
  const scrollToFoundations = () => {
    scrollToSection('foundations');
  };

  return (
    <section 
      id="hero"
      className="relative min-h-screen flex items-center pt-24 pb-16 px-4 sm:px-6 lg:px-12 z-10 pointer-events-none"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Headlines & CTA (Interactive elements have pointer-events-auto) */}
        <div className="lg:col-span-7 xl:col-span-6 pointer-events-auto space-y-6">
          
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-widest text-[#D5B06C] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D5B06C]" />
            <span>SARVADNYA TUITION CLASSES · NAGPUR</span>
          </div>

          {/* Main Monumental Headline */}
          <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.08] text-[#F7F7F4] font-display">
            THE FUTURE <br />
            IS <span className="text-[#D5B06C] drop-shadow-[0_0_35px_rgba(213,176,108,0.25)]">BUILT HERE.</span>
          </h1>

          {/* Supporting Statement & Tagline */}
          <div className="space-y-2 max-w-xl">
            <p className="text-lg sm:text-xl text-[#F7F7F4]/90 font-medium leading-relaxed">
              Strong academic foundations. Focused preparation. A better space to learn.
            </p>
            <p className="text-sm sm:text-base text-[#76D9EF] font-semibold tracking-wide">
              {BUSINESS_INFO.tagline}
            </p>
          </div>

          {/* Value anchors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#A9B3C1]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D5B06C] shrink-0" />
              <span>Classes 9, 10, 11, 12 Coaching</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D5B06C] shrink-0" />
              <span>Dedicated NEET & JEE Preparation</span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <CheckCircle2 className="w-4 h-4 text-[#76D9EF] shrink-0" />
              <span>Student Library Seating: 7:00 AM – 10:00 PM</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={scrollToFoundations}
              className="px-7 py-3.5 rounded-xl font-semibold text-sm text-[#07111F] bg-[#D5B06C] hover:bg-[#e4c284] shadow-lg shadow-[#D5B06C]/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Our Programs</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <a
              href={getWhatsAppUrl('Hello Sarvadnya Tuition Classes, I would like to enquire about coaching admissions and programs.')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm text-[#F7F7F4] bg-white/5 hover:bg-white/10 border border-white/15 transition-all duration-200 hover:scale-[1.02] flex items-center gap-2.5"
            >
              <MessageCircle className="w-4 h-4 text-[#76D9EF]" />
              <span>Talk to Us</span>
            </a>
          </div>

          {/* Location & Contact Micro-meta */}
          <div className="pt-4 flex items-center gap-2 text-xs text-[#A9B3C1]/80">
            <MapPin className="w-3.5 h-3.5 text-[#D5B06C] shrink-0" />
            <span>01 Sarvashree Nagar, Nagpur, Maharashtra · Ph: {BUSINESS_INFO.phoneFormatted}</span>
          </div>
        </div>

        {/* Right Area: Open viewing window for 3D Monumental Sculpture */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-6 pointer-events-none">
          <div className="relative p-6 max-w-sm ml-auto rounded-2xl bg-[#07111F]/30 border border-white/5 backdrop-blur-sm pointer-events-auto">
            <div className="flex items-center justify-between text-[11px] text-[#A9B3C1] mb-2">
              <span className="font-mono uppercase tracking-wider text-[#D5B06C]">Core Visualization</span>
              <span>Interactive 3D Engine</span>
            </div>
            <p className="text-xs text-[#F7F7F4]/80 leading-relaxed">
              Scroll down to navigate the cinematic learning environment through foundational sciences, senior secondary mastery, NEET & JEE, and the dedicated student library.
            </p>
          </div>
        </div>

      </div>

      {/* Scroll indicator prompt */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto opacity-75 hover:opacity-100 transition-opacity">
        <span className="text-[11px] font-mono tracking-widest uppercase text-[#A9B3C1]">
          Scroll To Journey
        </span>
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
          <div className="w-1.5 h-2 rounded-full bg-[#D5B06C] animate-bounce" />
        </div>
      </div>
    </section>
  );
};
