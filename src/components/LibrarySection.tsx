import React from 'react';
import { Clock, MapPin, MessageCircle, BookOpen, ShieldCheck, Sun, CheckCircle2 } from 'lucide-react';
import { BUSINESS_INFO, getWhatsAppUrl } from '../constants/data';

interface LibrarySectionProps {
  onOpenEnquiry: (program: string) => void;
}

export const LibrarySection: React.FC<LibrarySectionProps> = ({ onOpenEnquiry }) => {
  return (
    <section id="library" className="relative min-h-screen flex items-center py-24 px-4 sm:px-6 lg:px-12 z-10 pointer-events-none scroll-mt-24">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Main Library Showcase Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pointer-events-auto">
          
          {/* Information & Details Column */}
          <div className="lg:col-span-7 space-y-6 bg-[#07111F]/90 border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-md">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D5B06C]/10 border border-[#D5B06C]/30 text-xs font-semibold uppercase tracking-widest text-[#D5B06C]">
              <Clock className="w-4 h-4" />
              <span>DEDICATED FACILITY · 15 HOURS DAILY</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F7F7F4] font-display">
              YOUR SPACE <br />
              <span className="text-[#D5B06C]">TO FOCUS.</span>
            </h2>

            <p className="text-lg text-[#F7F7F4]/90 font-medium">
              A dedicated place to sit, study and concentrate.
            </p>

            <p className="text-sm sm:text-base text-[#A9B3C1] leading-relaxed">
              Achieving academic excellence in board examinations, NEET, and JEE requires continuous hours of undisturbed concentration. Our student library provides a quiet, disciplined sanctuary designed specifically for prolonged study sessions away from domestic distractions.
            </p>

            {/* Key Facility Highlights Box */}
            <div className="p-5 rounded-2xl bg-[#101923] border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs uppercase tracking-wider text-[#A9B3C1] font-mono">Facility</span>
                <span className="text-sm font-bold text-[#F7F7F4] font-display">STUDENT LIBRARY SEATING</span>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs uppercase tracking-wider text-[#A9B3C1] font-mono">Operating Hours</span>
                <span className="text-sm font-bold text-[#D5B06C]">7:00 AM TO 10:00 PM</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#A9B3C1] font-mono">Location</span>
                <span className="text-xs sm:text-sm text-[#F7F7F4]">01 Sarvashree Nagar, Nagpur</span>
              </div>
            </div>

            {/* Priority Features Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-[#F7F7F4]/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D5B06C] shrink-0" />
                <span>Individual study carrels with desk lighting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D5B06C] shrink-0" />
                <span>Strict silence & focus discipline</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D5B06C] shrink-0" />
                <span>Open 7 days a week for self-study</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D5B06C] shrink-0" />
                <span>Walking distance in Sarvashree Nagar</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href={getWhatsAppUrl('Hello Sarvadnya Tuition Classes, I would like to enquire about student library seating availability, hours, and access.')}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3.5 rounded-xl font-semibold text-xs sm:text-sm text-[#07111F] bg-[#D5B06C] hover:bg-[#e4c284] shadow-lg shadow-[#D5B06C]/20 transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Ask About Library Seating</span>
              </a>

              <button
                onClick={() => onOpenEnquiry('Library Seating')}
                className="px-6 py-3.5 rounded-xl font-semibold text-xs sm:text-sm text-[#F7F7F4] bg-white/5 hover:bg-white/10 border border-white/15 transition-all cursor-pointer"
              >
                Reserve / Enquire Online
              </button>
            </div>

            {/* Architectural Illustrative Visualization Disclaimer */}
            <p className="text-[11px] text-[#A9B3C1]/60 pt-2 italic">
              Note: The real-time 3D environment in this section is an illustrative architectural visualization representing the focused study atmosphere at Sarvadnya Tuition Classes in Nagpur.
            </p>

          </div>

          {/* Right Highlight Callout Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl bg-[#07111F]/80 border border-[#D5B06C]/25 p-8 text-center space-y-4 shadow-xl backdrop-blur-sm">
              <div className="w-16 h-16 rounded-2xl bg-[#D5B06C]/10 border border-[#D5B06C]/30 mx-auto flex items-center justify-center text-[#D5B06C]">
                <Clock className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-[#A9B3C1] font-mono">Daily Operational Span</span>
                <div className="text-4xl font-extrabold text-[#D5B06C] font-display mt-1">
                  15 HOURS
                </div>
                <div className="text-sm font-semibold text-[#F7F7F4] mt-0.5">
                  7:00 AM – 10:00 PM
                </div>
              </div>

              <p className="text-xs text-[#A9B3C1] leading-relaxed">
                Consistency is the differentiator in entrance examinations. A dedicated seat waiting for you early in the morning and accessible until late evening ensures uninterrupted study routines.
              </p>

              <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-[#76D9EF]">
                <MapPin className="w-4 h-4" />
                <span>01 Sarvashree Nagar, Nagpur</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
