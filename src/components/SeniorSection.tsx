import React from 'react';
import { ArrowUpRight, Atom, CheckCircle } from 'lucide-react';
import { getWhatsAppUrl } from '../constants/data';

interface SeniorSectionProps {
  onOpenEnquiry: (program: string) => void;
}

export const SeniorSection: React.FC<SeniorSectionProps> = ({ onOpenEnquiry }) => {
  return (
    <section id="senior-secondary" className="relative min-h-screen flex items-center py-24 px-4 sm:px-6 lg:px-12 z-10 pointer-events-none scroll-mt-24">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#76D9EF]/10 border border-[#76D9EF]/25 text-xs font-semibold uppercase tracking-widest text-[#76D9EF] mb-4">
            <Atom className="w-3.5 h-3.5" />
            <span>SENIOR SECONDARY · CLASSES 11 & 12</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F7F7F4] font-display">
            THINK DEEPER. <span className="text-[#76D9EF]">AIM HIGHER.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#A9B3C1] leading-relaxed">
            Build a deeper understanding of senior secondary subjects and prepare for your next academic milestone.
          </p>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pointer-events-auto">
          
          {/* Class 11 Card */}
          <div className="group relative rounded-2xl bg-[#07111F]/85 border border-white/10 hover:border-[#D5B06C]/40 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#D5B06C]/5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#D5B06C] px-2.5 py-1 rounded bg-[#D5B06C]/10 border border-[#D5B06C]/20">
                  Standard 11 · Senior Transition
                </span>
                <span className="text-xs text-[#A9B3C1]">Conceptual Core</span>
              </div>
              <h3 className="text-2xl font-bold text-[#F7F7F4] font-display">
                CLASS 11
              </h3>
              <p className="text-sm sm:text-base text-[#A9B3C1] leading-relaxed">
                Build a strong conceptual foundation for advanced academic study.
              </p>

              <div className="pt-2 space-y-2 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-[#F7F7F4]/80">
                  <CheckCircle className="w-3.5 h-3.5 text-[#D5B06C] shrink-0" />
                  <span>Bridging advanced mechanics, vectors & physical chemistry</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#F7F7F4]/80">
                  <CheckCircle className="w-3.5 h-3.5 text-[#D5B06C] shrink-0" />
                  <span>Calculus fundamentals, trigonometry & analytical geometry</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#F7F7F4]/80">
                  <CheckCircle className="w-3.5 h-3.5 text-[#D5B06C] shrink-0" />
                  <span>Early synchronization with future competitive syllabus requirements</span>
                </div>
              </div>
            </div>

            <div className="pt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenEnquiry('Class 11')}
                className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-[#07111F] bg-[#D5B06C] hover:bg-[#e4c284] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Enquire About Class 11</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <a
                href={getWhatsAppUrl('Hello Sarvadnya Tuition Classes, I would like to enquire about Class 11 coaching.')}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl text-xs sm:text-sm font-medium text-[#F7F7F4] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Class 12 Card */}
          <div className="group relative rounded-2xl bg-[#07111F]/85 border border-white/10 hover:border-[#76D9EF]/40 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#76D9EF]/5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#76D9EF] px-2.5 py-1 rounded bg-[#76D9EF]/10 border border-[#76D9EF]/20">
                  Standard 12 · Milestone Year
                </span>
                <span className="text-xs text-[#A9B3C1]">Board & Milestone</span>
              </div>
              <h3 className="text-2xl font-bold text-[#F7F7F4] font-display">
                CLASS 12
              </h3>
              <p className="text-sm sm:text-base text-[#A9B3C1] leading-relaxed">
                Strengthen subject understanding and prepare for your next academic step.
              </p>

              <div className="pt-2 space-y-2 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-[#F7F7F4]/80">
                  <CheckCircle className="w-3.5 h-3.5 text-[#76D9EF] shrink-0" />
                  <span>Electrodynamics, modern physics, organic reactions & calculus</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#F7F7F4]/80">
                  <CheckCircle className="w-3.5 h-3.5 text-[#76D9EF] shrink-0" />
                  <span>Synchronized board exam answer formatting & revision drills</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#F7F7F4]/80">
                  <CheckCircle className="w-3.5 h-3.5 text-[#76D9EF] shrink-0" />
                  <span>Targeted error log remediation and milestone test series</span>
                </div>
              </div>
            </div>

            <div className="pt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenEnquiry('Class 12')}
                className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-[#07111F] bg-[#76D9EF] hover:bg-[#8de2f5] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Enquire About Class 12</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <a
                href={getWhatsAppUrl('Hello Sarvadnya Tuition Classes, I would like to enquire about Class 12 coaching.')}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl text-xs sm:text-sm font-medium text-[#F7F7F4] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
