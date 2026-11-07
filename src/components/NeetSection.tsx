import React from 'react';
import { ArrowUpRight, Activity, BookOpen, Repeat, Layers, MessageCircle } from 'lucide-react';
import { getWhatsAppUrl } from '../constants/data';

interface NeetSectionProps {
  onOpenEnquiry: (program: string) => void;
}

export const NeetSection: React.FC<NeetSectionProps> = ({ onOpenEnquiry }) => {
  return (
    <section id="neet" className="relative min-h-screen flex items-center py-24 px-4 sm:px-6 lg:px-12 z-10 pointer-events-none scroll-mt-24">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#76D9EF]/10 border border-[#76D9EF]/25 text-xs font-semibold uppercase tracking-widest text-[#76D9EF] mb-4">
            <Activity className="w-3.5 h-3.5" />
            <span>MEDICAL ENTRANCE FOCUS · NEET</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F7F7F4] font-display">
            PREPARE WITH <span className="text-[#76D9EF]">PURPOSE.</span>
          </h2>
          <p className="mt-2 text-xl font-semibold text-[#F7F7F4]/90 font-display">
            Your Medical Entrance Journey Starts Here.
          </p>
          <p className="mt-3 text-base text-[#A9B3C1] leading-relaxed">
            Explore NEET preparation at Sarvadnya Tuition Classes and discover the academic support available for your preparation.
          </p>
        </div>

        {/* 3 Learning Priority Pillars Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pointer-events-auto mb-10">
          
          {/* Pillar 1: Conceptual Understanding */}
          <div className="rounded-2xl bg-[#07111F]/85 border border-white/10 p-6 space-y-3 hover:border-[#76D9EF]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#76D9EF]/10 border border-[#76D9EF]/20 flex items-center justify-center text-[#76D9EF]">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#F7F7F4] font-display">
              1. Conceptual Understanding
            </h3>
            <p className="text-xs sm:text-sm text-[#A9B3C1] leading-relaxed">
              Deep, line-by-line grasp of Physics mechanics and electromagnetism, Chemistry reaction thermodynamics, and Biology physiological principles.
            </p>
          </div>

          {/* Pillar 2: Academic Preparation */}
          <div className="rounded-2xl bg-[#07111F]/85 border border-white/10 p-6 space-y-3 hover:border-[#76D9EF]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#D5B06C]/10 border border-[#D5B06C]/20 flex items-center justify-center text-[#D5B06C]">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#F7F7F4] font-display">
              2. Academic Preparation
            </h3>
            <p className="text-xs sm:text-sm text-[#A9B3C1] leading-relaxed">
              Systematic curriculum pacing aligned with school timetables and competitive timelines, ensuring timely syllabus completion without panic.
            </p>
          </div>

          {/* Pillar 3: Practice and Revision */}
          <div className="rounded-2xl bg-[#07111F]/85 border border-white/10 p-6 space-y-3 hover:border-[#76D9EF]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#76D9EF]/10 border border-[#76D9EF]/20 flex items-center justify-center text-[#76D9EF]">
              <Repeat className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#F7F7F4] font-display">
              3. Practice & Revision
            </h3>
            <p className="text-xs sm:text-sm text-[#A9B3C1] leading-relaxed">
              Routine multiple-choice question drills, negative marking awareness, error log analysis, and continuous spaced repetition cycles.
            </p>
          </div>

        </div>

        {/* Action Panel */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-[#07111F]/90 via-[#0a1626]/90 to-[#07111F]/90 border border-[#76D9EF]/30 flex flex-col sm:flex-row items-center justify-between gap-6 pointer-events-auto">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold text-[#F7F7F4] font-display">
              Ready to begin your medical entrance preparation?
            </h4>
            <p className="text-xs sm:text-sm text-[#A9B3C1]">
              Consult with Sarvadnya faculty in Nagpur to discuss batch schedules and student library access.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onOpenEnquiry('NEET')}
              className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl font-semibold text-xs sm:text-sm text-[#07111F] bg-[#76D9EF] hover:bg-[#8de2f5] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#76D9EF]/15"
            >
              <span>Enquire About NEET</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <a
              href={getWhatsAppUrl('Hello Sarvadnya Tuition Classes, I would like to enquire about NEET preparation programs.')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-5 py-3.5 rounded-xl font-medium text-xs sm:text-sm text-[#F7F7F4] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#76D9EF]" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
