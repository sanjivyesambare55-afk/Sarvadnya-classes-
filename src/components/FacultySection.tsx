import React from 'react';
import { GraduationCap, Award, BookOpen, MessageCircle, Sparkles, UserCheck } from 'lucide-react';
import { FACULTY_MEMBERS, getWhatsAppUrl } from '../constants/data';

interface FacultySectionProps {
  onOpenEnquiry: (program?: string) => void;
}

export const FacultySection: React.FC<FacultySectionProps> = ({ onOpenEnquiry }) => {
  return (
    <section id="faculty" className="relative min-h-screen flex items-center py-24 px-4 sm:px-6 lg:px-12 z-10 pointer-events-none">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D5B06C]/10 border border-[#D5B06C]/25 text-xs font-semibold uppercase tracking-widest text-[#D5B06C] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ACADEMIC LEADERSHIP & MENTORSHIP</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F7F7F4] font-display">
            LEARN FROM <br />
            <span className="text-[#D5B06C]">EXPERIENCED MINDS.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#A9B3C1] leading-relaxed">
            Our faculty combines decades of conceptual rigor, doctoral research, and specialized mentoring from premier institutions including VNIT Nagpur and IIT Bombay.
          </p>
        </div>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pointer-events-auto">
          {FACULTY_MEMBERS.map((faculty, idx) => {
            const isGold = idx % 2 === 0;
            return (
              <div
                key={faculty.name}
                className="group relative rounded-2xl bg-[#07111F]/90 border border-white/10 hover:border-[#D5B06C]/50 p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#D5B06C]/10 flex flex-col justify-between backdrop-blur-md"
              >
                {/* Top Badge & Monogram */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-[#101923] to-[#07111F] border border-white/15 group-hover:border-[#D5B06C]/50 flex items-center justify-center shadow-lg transition-colors">
                      <span className="font-display font-bold text-lg text-[#D5B06C]">
                        {faculty.name.split(' ').slice(1).map(n => n[0]).join('') || faculty.name.slice(0, 2)}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#76D9EF] px-2.5 py-1 rounded-md bg-[#76D9EF]/10 border border-[#76D9EF]/20">
                      {faculty.experience}
                    </span>
                  </div>

                  {/* Name & Academic Role */}
                  <div>
                    <h3 className="text-xl font-bold text-[#F7F7F4] font-display group-hover:text-[#D5B06C] transition-colors">
                      {faculty.name}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-[#D5B06C] mt-1">
                      {faculty.role}
                    </p>
                  </div>

                  {/* Qualification Detail */}
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <div className="flex items-start gap-2 text-xs text-[#A9B3C1]">
                      <GraduationCap className="w-4 h-4 text-[#76D9EF] shrink-0 mt-0.5" />
                      <span className="font-medium text-[#F7F7F4]/90">{faculty.qualification}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#A9B3C1]/80">
                      <UserCheck className="w-3.5 h-3.5 text-[#D5B06C] shrink-0" />
                      <span>Direct classroom coaching & doubt resolution</span>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-6 mt-4 border-t border-white/5">
                  <a
                    href={getWhatsAppUrl(`Hello Sarvadnya Tuition Classes, I would like to enquire about classes and guidance under ${faculty.name} (${faculty.role}).`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-[#F7F7F4] bg-white/5 hover:bg-[#D5B06C] hover:text-[#07111F] border border-white/10 hover:border-[#D5B06C] transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-md"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Consult with Faculty</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mentorship Philosophy Callout */}
        <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-[#101923]/90 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 pointer-events-auto">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base sm:text-lg font-bold text-[#F7F7F4] font-display flex items-center justify-center md:justify-start gap-2">
              <Award className="w-5 h-5 text-[#D5B06C]" />
              <span>Personalized Doubt Clearing & Direct Student Mentorship</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#A9B3C1] max-w-2xl">
              At Sarvadnya, faculty members remain accessible beyond lecture hours. Students can discuss complex derivations, numerical hurdles, and exam strategy directly one-on-one.
            </p>
          </div>

          <button
            onClick={() => onOpenEnquiry('General Enquiry')}
            className="px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm text-[#07111F] bg-[#D5B06C] hover:bg-[#e4c284] transition-all shrink-0 cursor-pointer shadow-md"
          >
            Meet Our Faculty in Nagpur
          </button>
        </div>

      </div>
    </section>
  );
};
