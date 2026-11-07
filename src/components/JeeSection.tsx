import React from 'react';
import { ArrowUpRight, Binary, Target, Cpu, Lightbulb, MessageCircle } from 'lucide-react';
import { getWhatsAppUrl } from '../constants/data';

interface JeeSectionProps {
  onOpenEnquiry: (program: string) => void;
}

export const JeeSection: React.FC<JeeSectionProps> = ({ onOpenEnquiry }) => {
  return (
    <section id="jee" className="relative min-h-screen flex items-center py-24 px-4 sm:px-6 lg:px-12 z-10 pointer-events-none scroll-mt-24">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D5B06C]/10 border border-[#D5B06C]/25 text-xs font-semibold uppercase tracking-widest text-[#D5B06C] mb-4">
            <Binary className="w-3.5 h-3.5" />
            <span>ENGINEERING ENTRANCE FOCUS · JEE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F7F7F4] font-display">
            TURN CURIOSITY INTO <span className="text-[#D5B06C]">CAPABILITY.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#A9B3C1] leading-relaxed">
            Explore JEE preparation with a focus on understanding concepts, developing analytical thinking and approaching challenging problems.
          </p>
        </div>

        {/* Analytical Focus Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pointer-events-auto mb-10">
          
          <div className="rounded-2xl bg-[#07111F]/85 border border-white/10 p-6 space-y-3 hover:border-[#D5B06C]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#D5B06C]/10 border border-[#D5B06C]/20 flex items-center justify-center text-[#D5B06C]">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#F7F7F4] font-display">
              Conceptual Clarity First
            </h3>
            <p className="text-xs sm:text-sm text-[#A9B3C1] leading-relaxed">
              Moving beyond formula memorization to first-principles derivations across rotational mechanics, thermodynamics, electrostatics, and integral calculus.
            </p>
          </div>

          <div className="rounded-2xl bg-[#07111F]/85 border border-white/10 p-6 space-y-3 hover:border-[#D5B06C]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#76D9EF]/10 border border-[#76D9EF]/20 flex items-center justify-center text-[#76D9EF]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#F7F7F4] font-display">
              Analytical Problem Deconstruction
            </h3>
            <p className="text-xs sm:text-sm text-[#A9B3C1] leading-relaxed">
              Structured methodology for breaking down multi-concept problems that intertwine topics, building confidence and methodical reasoning.
            </p>
          </div>

          <div className="rounded-2xl bg-[#07111F]/85 border border-white/10 p-6 space-y-3 hover:border-[#D5B06C]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#D5B06C]/10 border border-[#D5B06C]/20 flex items-center justify-center text-[#D5B06C]">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#F7F7F4] font-display">
              Focused Practice & Review
            </h3>
            <p className="text-xs sm:text-sm text-[#A9B3C1] leading-relaxed">
              Continuous graded problem sets from foundational level to advanced multi-concept questions, supported by personalized error review.
            </p>
          </div>

        </div>

        {/* Action Panel */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-[#07111F]/90 via-[#101b2a]/90 to-[#07111F]/90 border border-[#D5B06C]/30 flex flex-col sm:flex-row items-center justify-between gap-6 pointer-events-auto">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold text-[#F7F7F4] font-display">
              Take the next step in engineering entrance readiness
            </h4>
            <p className="text-xs sm:text-sm text-[#A9B3C1]">
              Discuss JEE cohorts, batch timings, and library access with Sarvadnya in Nagpur.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onOpenEnquiry('JEE')}
              className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl font-semibold text-xs sm:text-sm text-[#07111F] bg-[#D5B06C] hover:bg-[#e4c284] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D5B06C]/15"
            >
              <span>Enquire About JEE</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <a
              href={getWhatsAppUrl('Hello Sarvadnya Tuition Classes, I would like to enquire about JEE coaching programs.')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-5 py-3.5 rounded-xl font-medium text-xs sm:text-sm text-[#F7F7F4] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#D5B06C]" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
