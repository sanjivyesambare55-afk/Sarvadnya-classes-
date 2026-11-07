import React from 'react';
import { Sparkles, Layers, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { WHY_US_BLOCKS } from '../constants/data';

interface WhySarvadnyaProps {
  onOpenEnquiry: (program?: string) => void;
}

export const WhySarvadnya: React.FC<WhySarvadnyaProps> = ({ onOpenEnquiry }) => {
  return (
    <section id="why-us" className="relative min-h-screen flex items-center py-24 px-4 sm:px-6 lg:px-12 z-10 pointer-events-none scroll-mt-24">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D5B06C]/10 border border-[#D5B06C]/25 text-xs font-semibold uppercase tracking-widest text-[#D5B06C] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE SARVADNYA ADVANTAGE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F7F7F4] font-display">
            SPACE TO LEARN. <br />
            <span className="text-[#D5B06C]">SUPPORT TO GROW.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#A9B3C1] leading-relaxed">
            A cohesive educational ecosystem combining classroom conceptual instruction, structured testing discipline, and peaceful individual study space.
          </p>
        </div>

        {/* 4 Content Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pointer-events-auto">
          {WHY_US_BLOCKS.map((block) => (
            <div
              key={block.number}
              className="group rounded-2xl bg-[#07111F]/90 border border-white/10 hover:border-[#D5B06C]/40 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#D5B06C]/5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-[#D5B06C]/50 group-hover:text-[#D5B06C] font-mono transition-colors">
                    {block.number}
                  </span>
                  <span className="text-[11px] uppercase tracking-widest text-[#76D9EF] font-semibold">
                    {block.subtitle}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#F7F7F4] font-display">
                  {block.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#A9B3C1] leading-relaxed">
                  {block.description}
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xs text-[#D5B06C] group-hover:translate-x-1 transition-transform">
                <span>Learn more</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
