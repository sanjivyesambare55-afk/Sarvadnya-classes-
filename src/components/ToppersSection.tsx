import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { TOPPERS_OF_THE_MONTH } from '../constants/data';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { ToppersBatch } from '../types';

interface ToppersSectionProps {
  onOpenEnquiry: (program?: string) => void;
}

export const ToppersSection: React.FC<ToppersSectionProps> = ({ onOpenEnquiry }) => {
  const [selectedBatch, setSelectedBatch] = useState<string>('All');
  const [toppersList, setToppersList] = useState<ToppersBatch[]>(TOPPERS_OF_THE_MONTH);

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'toppers'), (snapshot) => {
        const batchesMap = new Map<string, ToppersBatch>();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (Array.isArray(data.students) && data.students.length > 0 && data.class) {
            batchesMap.set(data.class, {
              id: docSnap.id,
              class: data.class,
              students: data.students,
              month: data.month,
              order: data.order ?? 99,
              updatedAt: data.updatedAt
            });
          }
        });

        if (batchesMap.size > 0) {
          const classOrder = ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'NEET Batch', 'JEE Batch'];
          const sortedBatches: ToppersBatch[] = [];

          classOrder.forEach((cls) => {
            if (batchesMap.has(cls)) {
              sortedBatches.push(batchesMap.get(cls)!);
            }
          });

          batchesMap.forEach((batch, cls) => {
            if (!classOrder.includes(cls)) {
              sortedBatches.push(batch);
            }
          });

          setToppersList(sortedBatches);
        } else {
          setToppersList(TOPPERS_OF_THE_MONTH);
        }
      }, (error) => {
        console.warn('ToppersSection listener error:', error);
        setToppersList(TOPPERS_OF_THE_MONTH);
      });

      return () => unsub();
    } catch (err) {
      console.warn('Could not initialize toppers listener:', err);
    }
  }, []);

  const batchList = ['All', ...toppersList.map((b) => b.class)];

  const displayedBatches = selectedBatch === 'All'
    ? toppersList
    : toppersList.filter((b) => b.class === selectedBatch);

  return (
    <section id="toppers" className="relative min-h-screen flex items-center py-24 sm:py-32 pb-36 sm:pb-48 px-4 sm:px-6 lg:px-12 z-20 pointer-events-none">
      <div className="max-w-7xl mx-auto w-full relative z-20">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-10 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D5B06C]/10 border border-[#D5B06C]/25 text-xs font-semibold uppercase tracking-widest text-[#D5B06C] mb-4">
            <Trophy className="w-3.5 h-3.5" />
            <span>MONTHLY ACADEMIC ROLL OF HONOR</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F7F7F4] font-display">
            TOPPERS OF <br />
            <span className="text-[#D5B06C]">THE MONTH.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#A9B3C1] leading-relaxed">
            Celebrating consistent diligence, chapter test performance, and academic discipline across our school foundation cohorts and competitive medical & engineering batches.
          </p>
        </div>

        {/* Batch Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 pointer-events-auto no-scrollbar">
          {batchList.map((batch) => {
            const isActive = selectedBatch === batch;
            return (
              <button
                key={batch}
                onClick={() => setSelectedBatch(batch)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#D5B06C] text-[#07111F] shadow-lg shadow-[#D5B06C]/20 scale-[1.02]'
                    : 'bg-[#0a1628]/95 text-[#A9B3C1] hover:text-[#F7F7F4] border border-white/10 hover:border-white/20'
                }`}
              >
                {batch}
              </button>
            );
          })}
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pointer-events-auto relative z-20">
          {displayedBatches.map((batch) => {
            const isCompetitive = batch.class.includes('NEET') || batch.class.includes('JEE');
            const accentColor = isCompetitive ? 'text-[#76D9EF]' : 'text-[#D5B06C]';
            const badgeBg = isCompetitive 
              ? 'bg-[#76D9EF]/10 border-[#76D9EF]/20 text-[#76D9EF]' 
              : 'bg-[#D5B06C]/10 border-[#D5B06C]/20 text-[#D5B06C]';

            return (
              <div
                key={batch.class}
                className="relative z-20 rounded-2xl bg-[#0a1628]/95 border border-slate-800/90 hover:border-[#D5B06C]/40 p-6 sm:p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-[#D5B06C]/10 flex flex-col justify-between backdrop-blur-md"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <Medal className={`w-4 h-4 ${accentColor}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#F7F7F4] font-display">
                          {batch.class}
                        </h3>
                        <span className="text-[11px] text-[#A9B3C1] uppercase tracking-wider font-mono">
                          Monthly Distinction
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${badgeBg}`}>
                      Top 5
                    </span>
                  </div>

                  {/* Student List */}
                  <div className="space-y-3">
                    {batch.students.map((student, idx) => {
                      const rank = idx + 1;
                      const isTopRank = rank === 1;
                      const isSecondRank = rank === 2;
                      const isThirdRank = rank === 3;

                      return (
                        <div
                          key={student}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                            isTopRank
                              ? 'bg-[#D5B06C]/10 border-[#D5B06C]/30'
                              : isSecondRank
                              ? 'bg-white/5 border-white/15'
                              : 'bg-transparent border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold ${
                                isTopRank
                                  ? 'bg-[#D5B06C] text-[#07111F]'
                                  : isSecondRank
                                  ? 'bg-slate-300 text-[#07111F]'
                                  : isThirdRank
                                  ? 'bg-amber-700 text-white'
                                  : 'bg-white/10 text-[#A9B3C1]'
                              }`}
                            >
                              {rank}
                            </span>
                            <span className="text-sm font-medium text-[#F7F7F4]">
                              {student}
                            </span>
                          </div>

                          {isTopRank && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#D5B06C]">
                              <Star className="w-3 h-3 fill-current" />
                              <span>Rank 1</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[#A9B3C1] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D5B06C]" />
                    <span>Regular chapter assessments</span>
                  </span>
                  <button
                    onClick={() => onOpenEnquiry(batch.class.includes('NEET') ? 'NEET' : batch.class.includes('JEE') ? 'JEE' : batch.class)}
                    className="text-[#D5B06C] hover:text-[#F7F7F4] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Join cohort</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivational Banner */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-[#07111F]/90 via-[#101c2c]/90 to-[#07111F]/90 border border-[#D5B06C]/25 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto text-center sm:text-left">
          <div>
            <h4 className="text-base font-bold text-[#F7F7F4] font-display">
              Aiming for academic excellence in your next school or competitive exam?
            </h4>
            <p className="text-xs sm:text-sm text-[#A9B3C1] mt-0.5">
              Consistent study discipline at Sarvadnya tuition classes and the dedicated 7 AM – 10 PM student library paves the path.
            </p>
          </div>
          <button
            onClick={() => onOpenEnquiry('General Enquiry')}
            className="px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm text-[#07111F] bg-[#D5B06C] hover:bg-[#e4c284] transition-all whitespace-nowrap cursor-pointer shadow-md"
          >
            Start Your Preparation
          </button>
        </div>

      </div>
    </section>
  );
};
