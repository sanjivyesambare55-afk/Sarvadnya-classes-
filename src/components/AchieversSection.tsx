import React, { useState, useEffect, useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  FACULTY_MEMBERS, 
  TOPPERS_OF_THE_MONTH, 
  SUCCESS_METRICS 
} from '../constants/data';
import { Award, Activity, Compass, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { ToppersBatch } from '../types';

// Smooth cubic ease-out counter for quantifiable metrics
const AnimatedCounter: React.FC<{ target: number; duration?: number; isVisible: boolean }> = ({ 
  target, 
  duration = 1800, 
  isVisible 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCount(0);
      return;
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration, isVisible]);

  return <span>{count}</span>;
};

// 1. Metrics Grid Stagger Variants
const metricsContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05
    }
  }
};

const metricCardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// 2. Faculty Stagger Variants (sequential cascade as user scrolls into view)
const facultyContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const facultyCardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 35,
    scale: 0.96
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// 3. Toppers Grid & List Item Stagger Variants
const toppersGridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.1
    }
  }
};

const topperCardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 35,
    scale: 0.97
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// Sequential cascade for individual student entries inside each cohort
const studentListVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
};

const studentItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -16 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// Section Header Reveal Variants
const sectionHeaderVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

interface AchieversSectionProps {
  toppers?: ToppersBatch[];
  showToppers?: boolean;
}

export const AchieversSection: React.FC<AchieversSectionProps> = ({ toppers, showToppers = true }) => {
  const [metricsVisible, setMetricsVisible] = useState(false);
  const metricsRef = useRef<HTMLDivElement>(null);

  // Dynamic real-time toppers of the month from Firestore or parent prop
  const [toppersList, setToppersList] = useState<ToppersBatch[]>(() => toppers || TOPPERS_OF_THE_MONTH);

  // Sync if prop changes
  useEffect(() => {
    if (toppers && toppers.length > 0) {
      setToppersList(toppers);
    }
  }, [toppers]);

  // Real-time Firestore subscription on doc "toppers/current_month" (fallback / standalone)
  useEffect(() => {
    if (toppers && toppers.length > 0) return; // Prop takes precedence

    const classOrder = ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'NEET Batch', 'JEE Batch'];
    const classToIdMap: Record<string, string> = {
      'Class 9': 'class_9',
      'Class 10': 'class_10',
      'Class 11': 'class_11',
      'Class 12': 'class_12',
      'NEET Batch': 'neet_batch',
      'JEE Batch': 'jee_batch'
    };

    let unsubCollection: (() => void) | null = null;

    try {
      const unsubDoc = onSnapshot(
        doc(db, 'toppers', 'current_month'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const batchesMap = new Map<string, ToppersBatch>();

            if (data.classes && typeof data.classes === 'object') {
              Object.entries(data.classes).forEach(([rawKey, studentsArr]) => {
                if (Array.isArray(studentsArr) && studentsArr.length > 0) {
                  const k = rawKey.toLowerCase().replace(/[\s_-]+/g, '');
                  const cls = 
                    k === 'class9' ? 'Class 9' :
                    k === 'class10' ? 'Class 10' :
                    k === 'class11' ? 'Class 11' :
                    k === 'class12' ? 'Class 12' :
                    k.includes('neet') ? 'NEET Batch' :
                    k.includes('jee') ? 'JEE Batch' :
                    rawKey;

                  batchesMap.set(cls, {
                    class: cls,
                    students: (studentsArr as string[]).slice(0, 5),
                    month: data.month || 'Current Month',
                    order: classOrder.indexOf(cls) !== -1 ? classOrder.indexOf(cls) + 1 : 99
                  });
                }
              });
            }

            if (Array.isArray(data.cohorts) && data.cohorts.length > 0) {
              data.cohorts.forEach((c: { class?: string; students?: string[]; month?: string; order?: number }) => {
                if (c.class && Array.isArray(c.students)) {
                  batchesMap.set(c.class, {
                    class: c.class,
                    students: c.students.slice(0, 5),
                    month: c.month || data.month,
                    order: c.order ?? 99
                  });
                }
              });
            }

            classOrder.forEach((cls, idx) => {
              const slug = classToIdMap[cls];
              const studentsArr = data[cls] || (slug ? data[slug] : undefined);
              if (Array.isArray(studentsArr) && studentsArr.length > 0) {
                batchesMap.set(cls, {
                  class: cls,
                  students: studentsArr.slice(0, 5),
                  month: data.month,
                  order: idx + 1
                });
              }
            });

            const sortedBatches: ToppersBatch[] = classOrder.map((cls) => {
              if (batchesMap.has(cls)) return batchesMap.get(cls)!;
              return TOPPERS_OF_THE_MONTH.find((b) => b.class === cls)!;
            }).filter(Boolean);

            setToppersList(sortedBatches);
          } else if (!unsubCollection) {
            unsubCollection = onSnapshot(collection(db, 'toppers'), (snapshot) => {
              const batchesMap = new Map<string, ToppersBatch>();
              snapshot.forEach((snap) => {
                if (snap.id === 'current_month' || snap.id === 'monthly_cohorts') return;
                const d = snap.data();
                if (Array.isArray(d.students) && d.students.length > 0 && d.class) {
                  batchesMap.set(d.class, {
                    id: snap.id,
                    class: d.class,
                    students: d.students.slice(0, 5),
                    month: d.month,
                    order: d.order ?? 99
                  });
                }
              });

              if (batchesMap.size > 0) {
                const sortedBatches: ToppersBatch[] = classOrder.map((cls) => {
                  if (batchesMap.has(cls)) return batchesMap.get(cls)!;
                  return TOPPERS_OF_THE_MONTH.find((b) => b.class === cls)!;
                }).filter(Boolean);
                setToppersList(sortedBatches);
              } else {
                setToppersList(TOPPERS_OF_THE_MONTH);
              }
            });
          }
        },
        (error) => {
          console.warn('Toppers listener warning, using default data:', error);
          setToppersList(TOPPERS_OF_THE_MONTH);
        }
      );

      return () => {
        unsubDoc();
        if (unsubCollection) unsubCollection();
      };
    } catch (err) {
      console.warn('Could not initialize toppers listener:', err);
    }
  }, [toppers]);

  // Trigger counter animation on scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMetricsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const currentRef = metricsRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  // Helper to extract clean first initial for teacher avatar circle
  const getInitial = (name: string) => {
    const clean = name.replace(/^(Dr\.|Prof\.)\s*/i, '');
    return clean.charAt(0) || name.charAt(3) || name.charAt(0);
  };

  const metricIcons = [
    <Award key="0" className="w-5 h-5 text-[#D5B06C]" />,
    <Activity key="1" className="w-5 h-5 text-[#76D9EF]" />,
    <Compass key="2" className="w-5 h-5 text-[#D5B06C]" />,
    <Clock key="3" className="w-5 h-5 text-[#76D9EF]" />
  ];

  return (
    <section id="achievers" className="relative py-24 px-4 max-w-7xl mx-auto text-white pointer-events-auto scroll-mt-24">
      
      {/* 1. Success Metrics Section with Counter Animation */}
      <div id="metrics" ref={metricsRef} className="mb-24 scroll-mt-24">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionHeaderVariants}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D5B06C]/10 border border-[#D5B06C]/25 text-xs font-semibold uppercase tracking-widest text-[#D5B06C] mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>QUANTIFIABLE OUTCOMES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold mt-1 font-display tracking-tight text-[#F7F7F4]">
            Our Success <span className="text-[#D5B06C]">Metrics</span>
          </h2>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Quantifiable academic milestones achieved through focused syllabus pacing, comprehensive problem sets, and disciplined daily study hours.
          </p>
        </motion.div>

        {/* Counter Cards Grid with Staggered Fade-in */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={metricsContainerVariants}
        >
          {SUCCESS_METRICS.map((metric, idx) => {
            const isGold = idx % 2 === 0;
            return (
              <motion.div 
                key={metric.label}
                variants={metricCardVariants}
                className="group relative rounded-2xl bg-gradient-to-b from-[#101923]/95 to-[#07111F]/95 border border-white/10 hover:border-[#D5B06C]/40 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#D5B06C]/5 flex flex-col justify-between backdrop-blur-md"
              >
                <div>
                  {/* Category Pill & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#A9B3C1] px-2.5 py-1 rounded bg-white/5 border border-white/10">
                      {metric.category}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {metricIcons[idx % metricIcons.length]}
                    </div>
                  </div>

                  {/* Animated Big Number Counter */}
                  <div className="flex items-baseline gap-1 my-2">
                    <div className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[#F7F7F4] group-hover:text-[#D5B06C] transition-colors">
                      <AnimatedCounter target={metric.value} isVisible={metricsVisible} />
                    </div>
                    <span className={`text-3xl sm:text-4xl font-extrabold ${isGold ? 'text-[#D5B06C]' : 'text-[#76D9EF]'}`}>
                      {metric.suffix}
                    </span>
                  </div>

                  {/* Metric Label */}
                  <h3 className="text-lg font-bold text-[#F7F7F4] font-display mt-2">
                    {metric.label}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                    {metric.description}
                  </p>
                </div>

                {/* Bottom Verified Tick */}
                <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-[#A9B3C1]/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D5B06C] shrink-0" />
                  <span>Verified academic milestone</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* 2. Faculty Section: Staggered Fade-in as the user scrolls into view */}
      <div id="faculty" className="mb-24 scroll-mt-24">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionHeaderVariants}
        >
          <span className="text-[#D5B06C] text-sm uppercase tracking-widest font-semibold">Expert Guidance</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 font-display">Our Distinguished Faculty</h2>
          <p className="text-gray-400 mt-2 max-w-xl mx-auto text-sm sm:text-base">Experienced mentors dedicated to shaping academic excellence.</p>
        </motion.div>

        {/* Sequential Faculty Cards Stagger */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={facultyContainerVariants}
        >
          {FACULTY_MEMBERS.map((fac, idx) => (
            <motion.div 
              key={fac.name}
              variants={facultyCardVariants}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="bg-slate-900/80 border border-slate-800 hover:border-[#D5B06C]/40 p-6 rounded-xl backdrop-blur-md transition-shadow duration-300 hover:shadow-xl hover:shadow-[#D5B06C]/5 flex flex-col justify-between"
            >
              <div>
                <div className="w-16 h-16 bg-[#D5B06C]/10 border border-[#D5B06C]/20 rounded-full flex items-center justify-center text-[#D5B06C] text-2xl font-bold mb-4 font-display">
                  {getInitial(fac.name)}
                </div>
                <h3 className="text-xl font-bold text-[#F7F7F4] font-display">{fac.name}</h3>
                <p className="text-[#D5B06C] text-sm font-medium mt-1">{fac.role}</p>
                <p className="text-gray-300 text-xs mt-3 font-medium">{fac.qualification}</p>
                <p className="text-gray-400 text-xs mt-1">{fac.experience}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* 3. Toppers Section: Staggered Fade-in for Batches and Individual Student Rows */}
      {showToppers && (
      <div id="toppers" className="scroll-mt-24">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionHeaderVariants}
        >
          <span className="text-[#D5B06C] text-sm uppercase tracking-widest font-semibold">Wall of Fame</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 font-display">Toppers of the Month</h2>
          <p className="text-gray-400 mt-2 max-w-xl mx-auto text-sm sm:text-base">Celebrating our top 5 academic performers across all classes.</p>
        </motion.div>

        {/* Sequential Topper Cohort Cards Stagger */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={toppersGridVariants}
        >
          {toppersList.map((group) => (
            <motion.div 
              key={group.class}
              variants={topperCardVariants}
              whileHover={{ y: -3, transition: { duration: 0.25 } }}
              className="bg-slate-900/80 border border-slate-800 hover:border-[#D5B06C]/40 p-6 rounded-xl backdrop-blur-md transition-shadow duration-300 hover:shadow-xl hover:shadow-[#D5B06C]/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="text-lg font-bold text-[#D5B06C] font-display flex items-center gap-2">
                    <span>{group.class}</span>
                  </h3>
                  <div className="flex items-center gap-1.5">
                    {group.month && (
                      <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                        {group.month}
                      </span>
                    )}
                    <span className="text-xs bg-[#D5B06C]/20 text-[#D5B06C] px-2 py-1 rounded font-mono font-semibold">
                      Top 5
                    </span>
                  </div>
                </div>

              {/* Sequential cascade of individual student list entries */}
              <motion.div 
                className="space-y-2"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={studentListVariants}
              >
                {group.students.map((student, sIdx) => (
                  <motion.div 
                    key={student} 
                    variants={studentItemVariants}
                    className="flex items-center text-gray-300 text-sm py-1.5 border-b border-slate-800/50 last:border-0 justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-xs text-gray-400 font-mono">0{sIdx + 1}</span>
                      <span className="font-medium text-[#F7F7F4]">{student}</span>
                    </div>
                    {sIdx === 0 && (
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#D5B06C] bg-[#D5B06C]/10 px-1.5 py-0.5 rounded border border-[#D5B06C]/20">
                        Rank 1
                      </span>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        ))}
        </motion.div>
      </div>
      )}
    </section>
  );
};
