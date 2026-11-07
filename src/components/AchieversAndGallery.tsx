import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { AchieversSection } from './AchieversSection';
import { GallerySection } from './GallerySection';
import { 
  Trophy, 
  Medal, 
  Star, 
  Sparkles, 
  Award, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';

interface AchieversAndGalleryProps {
  onOpenEnquiry?: (program?: string) => void;
  children?: React.ReactNode;
}

const DEFAULT_TOPPERS: Record<string, string[]> = {
  class9: ["Aarav Joshi", "Rohan Mehta", "Priya Sharma", "Ananya Verma", "Kunal Shah"],
  class10: ["Vedant Thakre", "Tanvi Deshmukh", "Aditya Kulkarni", "Siddhi Patil", "Pranav Shahu"],
  class11: ["Sahil Sheikh", "Isha Agrawal", "Yash Raut", "Sneha Rao", "Harsh Vardhan"],
  class12: ["Kalyani Kale", "Omkar Joshi", "Pooja Nandanwar", "Saurabh Gadre", "Neha Kapse"],
  neet: ["Shruti Deshmukh", "Devendra Patil", "Manasi Kulkarni", "Pratiksha Barde", "Gaurav More"],
  jee: ["Rohan Kulkarni", "Sanket Bawankule", "Tejaswini Rao", "Karthik Pillai", "Mayur Wankhade"]
};

const formatClassName = (name: string): string => {
  const n = name.toLowerCase().replace(/[\s_-]+/g, '');
  if (n === 'class9') return 'Class 9';
  if (n === 'class10') return 'Class 10';
  if (n === 'class11') return 'Class 11';
  if (n === 'class12') return 'Class 12';
  if (n === 'neet' || n === 'neetbatch') return 'NEET Batch';
  if (n === 'jee' || n === 'jeebatch') return 'JEE Batch';
  return name;
};

interface ParsedTopper {
  name: string;
  scoreOrPercentage?: string;
  rank?: string;
}

const parseStudentDetails = (item: unknown, defaultIndex: number): ParsedTopper => {
  if (!item) return { name: `Student ${defaultIndex + 1}` };
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;
    return {
      name: String(obj.name || obj.studentName || `Student ${defaultIndex + 1}`),
      scoreOrPercentage: obj.percentage ? String(obj.percentage) : obj.score ? String(obj.score) : undefined,
      rank: obj.rank ? String(obj.rank) : (defaultIndex === 0 ? 'Rank 1' : defaultIndex === 1 ? 'Rank 2' : defaultIndex === 2 ? 'Rank 3' : undefined)
    };
  }
  const str = String(item).trim();
  // Check if string contains score/percentage like "Name (98.4%)" or "Name - 98.4%"
  const bracketMatch = str.match(/^(.*?)\s*[\(\[]\s*([0-9\.\%\/\s]+(?:marks|pts)?)\s*[\)\]]$/i);
  if (bracketMatch) {
    return {
      name: bracketMatch[1].trim(),
      scoreOrPercentage: bracketMatch[2].trim(),
      rank: defaultIndex === 0 ? 'Rank 1' : defaultIndex === 1 ? 'Rank 2' : defaultIndex === 2 ? 'Rank 3' : undefined
    };
  }
  const dashMatch = str.match(/^(.*?)\s*[-–—:]\s*([0-9\.\%\/\s]+(?:marks|pts)?)$/i);
  if (dashMatch) {
    return {
      name: dashMatch[1].trim(),
      scoreOrPercentage: dashMatch[2].trim(),
      rank: defaultIndex === 0 ? 'Rank 1' : defaultIndex === 1 ? 'Rank 2' : defaultIndex === 2 ? 'Rank 3' : undefined
    };
  }
  return {
    name: str,
    rank: defaultIndex === 0 ? 'Rank 1' : defaultIndex === 1 ? 'Rank 2' : defaultIndex === 2 ? 'Rank 3' : undefined
  };
};

export const AchieversAndGallery: React.FC<AchieversAndGalleryProps> = ({ onOpenEnquiry, children }) => {
  const [toppersList, setToppersList] = useState<Record<string, unknown[]>>({
    class9: [],
    class10: [],
    class11: [],
    class12: [],
    neet: [],
    jee: []
  });

  // Real-time listener to Firestore
  useEffect(() => {
    const docRef = doc(db, "toppers", "current_month");
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.classes) {
          setToppersList(data.classes); // Updates live with admin changes!
        }
      } else {
        // Use initial default institute toppers if document is not yet initialized
        setToppersList(DEFAULT_TOPPERS);
      }
    }, (error) => {
      console.warn("Notice fetching live toppers (using institute defaults):", error);
      setToppersList(DEFAULT_TOPPERS);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="relative">
      {/* 1. Academic Metrics & Faculty */}
      <AchieversSection showToppers={false} />

      {/* 2. Real-time Live Toppers of the Month */}
      <section 
        id="toppers" 
        className="relative z-20 py-20 sm:py-28 pb-36 sm:pb-48 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24 pointer-events-auto"
      >
        {/* Fortress Panel with Solid/Semi-opaque Background to eliminate 3D WebGL bleed-through */}
        <div className="relative z-20 bg-[#0a1628]/95 backdrop-blur-md border border-slate-800/90 hover:border-[#D5B06C]/30 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl shadow-black/80 transition-colors">
          
          {/* Subtle Ambient Radial Highlights */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D5B06C]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#76D9EF]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16 relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D5B06C]/15 border border-[#D5B06C]/40 text-xs font-mono font-bold uppercase tracking-widest text-[#D5B06C] shadow-sm">
              <Trophy className="w-3.5 h-3.5 text-[#D5B06C]" />
              <span>Wall of Fame</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-extrabold mt-3 text-white font-display tracking-tight leading-tight">
              Toppers of the Month
            </h2>

            <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
              Celebrating our top 5 academic performers across school board foundation cohorts and competitive medical &amp; engineering batches.
            </p>

            <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1 rounded-full bg-[#76D9EF]/10 border border-[#76D9EF]/30 text-xs font-mono text-[#76D9EF]">
              <Sparkles className="w-3.5 h-3.5 text-[#76D9EF]" />
              <span>Live Synced from Sarvadnya Admin Desk</span>
            </div>
          </div>

          {/* Render dynamic toppersList Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {Object.entries(toppersList).map(([className, students], idx) => {
              const formattedName = formatClassName(className);
              const isCompetitive = formattedName.includes('NEET') || formattedName.includes('JEE');
              const titleColor = isCompetitive ? 'text-[#76D9EF]' : 'text-[#D5B06C]';
              const badgeClass = isCompetitive 
                ? 'bg-[#76D9EF]/15 border-[#76D9EF]/40 text-[#76D9EF]' 
                : 'bg-[#D5B06C]/15 border-[#D5B06C]/40 text-[#D5B06C]';

              return (
                <div 
                  key={idx} 
                  className="relative z-20 bg-[#0a1628]/95 backdrop-blur-md border border-slate-800/90 hover:border-[#D5B06C]/50 p-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-[#D5B06C]/10 flex flex-col justify-between"
                >
                  <div>
                    {/* Header with Title and Top 5 badge */}
                    <div className="flex items-center justify-between border-b border-slate-800/90 pb-3.5 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCompetitive ? 'bg-[#76D9EF]/15 border border-[#76D9EF]/30 text-[#76D9EF]' : 'bg-[#D5B06C]/15 border border-[#D5B06C]/30 text-[#D5B06C]'}`}>
                          <Medal className="w-4 h-4" />
                        </div>
                        <h3 className={`text-lg sm:text-xl font-bold font-display uppercase tracking-wide ${titleColor}`}>
                          {formattedName}
                        </h3>
                      </div>
                      <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                        Top 5
                      </span>
                    </div>

                    {/* Student List */}
                    <ol className="space-y-2.5">
                      {students && Array.isArray(students) && students.length > 0 ? (
                        students.map((rawStudent: unknown, sIdx: number) => {
                          const topper = parseStudentDetails(rawStudent, sIdx);
                          const isRank1 = sIdx === 0;
                          const isRank2 = sIdx === 1;
                          const isRank3 = sIdx === 2;

                          return (
                            <li 
                              key={sIdx} 
                              className={`flex items-center justify-between py-2.5 px-3 rounded-xl border transition-all ${
                                isRank1 
                                  ? 'bg-[#D5B06C]/15 border-[#D5B06C]/40 shadow-sm' 
                                  : isRank2
                                  ? 'bg-slate-900/80 border-slate-700/60'
                                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 pr-2">
                                <span className={`w-6 text-xs font-mono font-bold shrink-0 ${isRank1 ? 'text-[#D5B06C]' : 'text-slate-400'}`}>
                                  0{sIdx + 1}
                                </span>
                                <span className="font-bold text-white text-sm tracking-tight truncate drop-shadow-sm">
                                  {topper.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {topper.scoreOrPercentage && (
                                  <span className="text-[11px] font-mono font-bold text-[#76D9EF] bg-[#76D9EF]/10 border border-[#76D9EF]/30 px-2 py-0.5 rounded-md">
                                    {topper.scoreOrPercentage}
                                  </span>
                                )}

                                {isRank1 ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#D5B06C] bg-[#D5B06C]/25 px-2 py-0.5 rounded-full border border-[#D5B06C]/45 shadow-sm">
                                    <Trophy className="w-3 h-3 text-[#D5B06C]" />
                                    <span>Rank 1</span>
                                  </span>
                                ) : isRank2 ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-200 bg-slate-700/50 px-2 py-0.5 rounded-full border border-slate-600/50">
                                    <Medal className="w-3 h-3 text-slate-300" />
                                    <span>Rank 2</span>
                                  </span>
                                ) : isRank3 ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-900/35 px-2 py-0.5 rounded-full border border-amber-700/45">
                                    <Star className="w-3 h-3 text-amber-400" />
                                    <span>Rank 3</span>
                                  </span>
                                ) : null}
                              </div>
                            </li>
                          );
                        })
                      ) : (
                        <p className="text-slate-400 text-xs italic py-3 text-center">
                          No toppers added for this class yet.
                        </p>
                      )}
                    </ol>
                  </div>

                  {/* Card Footer with quick join/enquiry action */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D5B06C]" />
                      <span>Monthly Distinction</span>
                    </span>
                    {onOpenEnquiry && (
                      <button
                        onClick={() => onOpenEnquiry(formattedName)}
                        className="text-[#D5B06C] hover:text-white font-semibold flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
                      >
                        <span>Join Batch</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. Nested Testimonials or Child Sections */}
      {children}

      {/* 4. Campus & Facility Gallery */}
      <GallerySection onOpenEnquiry={onOpenEnquiry} />
    </div>
  );
};

export default AchieversAndGallery;
export { AchieversSection, GallerySection };
