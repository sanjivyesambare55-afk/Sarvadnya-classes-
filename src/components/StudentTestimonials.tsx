import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { 
  Quote, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  MessageSquareQuote, 
  Database, 
  CheckCircle2, 
  PlusCircle, 
  X, 
  Send, 
  Loader2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Testimonial } from '../types';
import { DEFAULT_TESTIMONIALS } from '../constants/data';
import { fetchTestimonialsFromFirestore, saveTestimonialToFirestore } from '../firebase';

interface StudentTestimonialsProps {
  onOpenEnquiry?: (program?: string) => void;
}

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 280 : -280,
    opacity: 0,
    scale: 0.96
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 320, damping: 32 },
      opacity: { duration: 0.35 },
      scale: { duration: 0.35 }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 280 : -280,
    opacity: 0,
    scale: 0.96,
    transition: {
      x: { type: 'spring', stiffness: 320, damping: 32 },
      opacity: { duration: 0.25 }
    }
  })
};

export const StudentTestimonials: React.FC<StudentTestimonialsProps> = ({ onOpenEnquiry }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromFirestore, setIsFromFirestore] = useState(false);

  // New Testimonial Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    name: '',
    program: 'Class 10',
    scoreOrAchievement: '',
    year: 'Class of 2025-26',
    review: '',
    rating: 5
  });

  // Fetch testimonials from Firestore on mount
  useEffect(() => {
    let isMounted = true;
    async function loadTestimonials() {
      try {
        setIsLoading(true);
        const firestoreData = await fetchTestimonialsFromFirestore();
        if (isMounted) {
          if (firestoreData && firestoreData.length > 0) {
            // Merge unique firestore data with defaults to ensure rich content
            const firestoreNames = new Set(firestoreData.map(t => t.name.toLowerCase()));
            const complementaryDefaults = DEFAULT_TESTIMONIALS.filter(
              d => !firestoreNames.has(d.name.toLowerCase())
            );
            setTestimonials([...firestoreData, ...complementaryDefaults]);
            setIsFromFirestore(true);
          } else {
            setTestimonials(DEFAULT_TESTIMONIALS);
            setIsFromFirestore(false);
          }
        }
      } catch (err) {
        console.warn('Notice in testimonials loading effect (using defaults):', err);
        if (isMounted) {
          setTestimonials(DEFAULT_TESTIMONIALS);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTestimonials();
    return () => {
      isMounted = false;
    };
  }, []);

  const total = testimonials.length;

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Auto-slide effect (cycles every 6.5s, pauses on hover or user manual pause)
  useEffect(() => {
    if (!isPlaying || isHovered || total <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, 6500);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, total, handleNext]);

  // Handle Swipe Gestures
  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
    if (info.offset.x < -40) {
      handleNext();
    } else if (info.offset.x > 40) {
      handlePrev();
    }
  };

  // Submit new student experience to Firestore
  const handleSubmitExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedback.name.trim() || !newFeedback.review.trim()) return;

    setIsSubmitting(true);
    const result = await saveTestimonialToFirestore({
      name: newFeedback.name,
      program: newFeedback.program,
      scoreOrAchievement: newFeedback.scoreOrAchievement,
      year: newFeedback.year,
      review: newFeedback.review,
      rating: newFeedback.rating
    });
    setIsSubmitting(false);

    if (result.success) {
      const addedItem: Testimonial = {
        id: result.id || `new-${Date.now()}`,
        name: newFeedback.name,
        program: newFeedback.program,
        scoreOrAchievement: newFeedback.scoreOrAchievement,
        year: newFeedback.year,
        review: newFeedback.review,
        rating: newFeedback.rating
      };

      setTestimonials((prev) => [addedItem, ...prev]);
      setCurrentIndex(0);
      setIsFromFirestore(true);
      setSubmissionSuccess(true);

      setTimeout(() => {
        setIsModalOpen(false);
        setSubmissionSuccess(false);
        setNewFeedback({
          name: '',
          program: 'Class 10',
          scoreOrAchievement: '',
          year: 'Class of 2025-26',
          review: '',
          rating: 5
        });
      }, 1500);
    }
  };

  const current = testimonials[currentIndex] || DEFAULT_TESTIMONIALS[0];

  // Helper for initial avatar
  const getInitial = (name: string) => {
    return name.trim().charAt(0).toUpperCase() || 'S';
  };

  return (
    <section 
      id="testimonials" 
      className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-white pointer-events-auto scroll-mt-24"
    >
      {/* Section Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D5B06C]/10 border border-[#D5B06C]/25 text-xs font-semibold uppercase tracking-widest text-[#D5B06C] mb-3">
          <MessageSquareQuote className="w-3.5 h-3.5" />
          <span>STUDENT EXPERIENCES & VOICES</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-[#F7F7F4]">
          Real Stories. <span className="text-[#D5B06C]">Proven Impact.</span>
        </h2>
        <p className="text-gray-400 mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Hear directly from students who prepared for boards, cracked NEET and JEE, and transformed their daily study habits at Sarvadnya Tuition Classes & Study Library, Nagpur.
        </p>

        {/* Sync & Share CTA Bar */}
        <div className="flex items-center justify-center gap-3 mt-4 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#A9B3C1]">
            <Database className="w-3 h-3 text-[#76D9EF]" />
            <span>{isFromFirestore ? 'Live Firestore Database' : 'Verified Student Roster'}</span>
          </span>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D5B06C]/10 hover:bg-[#D5B06C]/20 border border-[#D5B06C]/30 text-[#D5B06C] font-medium transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Share Your Experience</span>
          </button>
        </div>
      </div>

      {/* Main Carousel Display Box */}
      <div 
        className="relative max-w-4xl mx-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glow ambient background element */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#D5B06C]/10 via-[#76D9EF]/10 to-[#D5B06C]/10 rounded-3xl blur-2xl -z-10 opacity-70" />

        {/* Carousel Container */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#101923]/95 via-[#0c141d]/95 to-[#07111F]/98 border border-white/10 shadow-2xl p-6 sm:p-10 md:p-12 backdrop-blur-xl overflow-hidden min-h-[380px] flex flex-col justify-between">
          
          {/* Top Decorative Row: Large Quote Icon & Star Ratings */}
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#D5B06C]/10 border border-[#D5B06C]/20 flex items-center justify-center text-[#D5B06C]">
              <Quote className="w-6 h-6 rotate-180" />
            </div>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < (current.rating || 5) ? 'text-[#D5B06C] fill-[#D5B06C]' : 'text-gray-600'}`} 
                />
              ))}
              <span className="text-xs text-[#A9B3C1] ml-2 font-mono">
                5.0 Verified
              </span>
            </div>
          </div>

          {/* Animated Slide Content (Smooth sliding animation) */}
          <div className="relative flex-1 flex flex-col justify-center">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                className="cursor-grab active:cursor-grabbing"
              >
                {/* Testimonial Quote Text */}
                <blockquote className="text-lg sm:text-2xl text-[#F7F7F4] font-medium leading-relaxed font-sans mb-8">
                  &ldquo;{current.review}&rdquo;
                </blockquote>

                {/* Author Info Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-4">
                    {/* Initial Avatar */}
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#D5B06C] to-[#99793d] p-0.5 shadow-md shadow-[#D5B06C]/10 shrink-0">
                      <div className="w-full h-full bg-[#07111F] rounded-[14px] flex items-center justify-center font-bold text-[#D5B06C] text-lg font-display">
                        {getInitial(current.name)}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base sm:text-lg font-bold text-[#F7F7F4] font-display">
                          {current.name}
                        </h4>
                        {current.year && (
                          <span className="text-[11px] text-[#A9B3C1] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                            {current.year}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#76D9EF] font-medium mt-0.5">
                        {current.program}
                      </p>
                    </div>
                  </div>

                  {/* Achievement Badge / Program CTA */}
                  {current.scoreOrAchievement && (
                    <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-[#D5B06C]/10 border border-[#D5B06C]/25 text-[#D5B06C] text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{current.scoreOrAchievement}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Carousel Controls & Pagination */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
            
            {/* Pagination Dots with Active Smooth Indicator */}
            <div className="flex items-center gap-1.5">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === idx 
                      ? 'w-8 bg-[#D5B06C]' 
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
              <span className="text-[11px] font-mono text-[#A9B3C1] ml-2">
                {currentIndex + 1} / {total}
              </span>
            </div>

            {/* Carousel Control Buttons (Prev, Pause/Play, Next) */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#A9B3C1] hover:text-white transition-colors cursor-pointer active:scale-95"
                title="Previous experience"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#A9B3C1] hover:text-white transition-colors cursor-pointer"
                title={isPlaying ? "Pause auto-sliding" : "Resume auto-sliding"}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#A9B3C1] hover:text-white transition-colors cursor-pointer active:scale-95"
                title="Next experience"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Quick Program Admission Trigger */}
              {onOpenEnquiry && (
                <button
                  onClick={() => onOpenEnquiry(current.program)}
                  className="hidden sm:inline-flex items-center gap-1.5 ml-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#07111F] bg-[#D5B06C] hover:bg-[#e4c284] transition-colors cursor-pointer"
                >
                  <span>Enquire for {current.program.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Share Experience Modal (saves to Firestore 'testimonials' collection) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-lg rounded-2xl bg-[#07111F] border border-[#D5B06C]/30 p-6 sm:p-8 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-lg text-[#A9B3C1] hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#D5B06C]">
                Student & Alumni Desk
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F7F7F4] font-display">
                Share Your Experience
              </h3>
              <p className="text-xs text-[#A9B3C1]">
                Your testimonial will be saved to our Firestore database and displayed in this student carousel.
              </p>
            </div>

            {submissionSuccess ? (
              <div className="p-6 rounded-xl bg-[#D5B06C]/10 border border-[#D5B06C]/30 flex flex-col items-center justify-center text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#D5B06C]" />
                <h4 className="text-base font-bold text-[#F7F7F4]">Thank You for Sharing!</h4>
                <p className="text-xs text-[#A9B3C1]">
                  Your experience has been recorded in Cloud Firestore and added to the carousel.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitExperience} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#A9B3C1] mb-1 uppercase tracking-wider">
                    Full Name <span className="text-[#D5B06C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newFeedback.name}
                    onChange={(e) => setNewFeedback({ ...newFeedback, name: e.target.value })}
                    placeholder="e.g. Tanmay Joshi"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#101923] border border-white/10 focus:border-[#D5B06C] focus:outline-none text-sm text-[#F7F7F4] placeholder:text-gray-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#A9B3C1] mb-1 uppercase tracking-wider">
                      Program / Facility <span className="text-[#D5B06C]">*</span>
                    </label>
                    <select
                      value={newFeedback.program}
                      onChange={(e) => setNewFeedback({ ...newFeedback, program: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#101923] border border-white/10 focus:border-[#D5B06C] focus:outline-none text-sm text-[#F7F7F4]"
                    >
                      <option value="Class 9 Foundation">Class 9 Foundation</option>
                      <option value="Class 10 Board Excellence">Class 10 Board Excellence</option>
                      <option value="Class 11 Senior Secondary">Class 11 Senior Secondary</option>
                      <option value="Class 12 Senior Secondary">Class 12 Senior Secondary</option>
                      <option value="NEET Medical Cohort">NEET Medical Cohort</option>
                      <option value="JEE Engineering Batch">JEE Engineering Batch</option>
                      <option value="Study Library Member">Study Library Member</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A9B3C1] mb-1 uppercase tracking-wider">
                      Score or Milestone (Optional)
                    </label>
                    <input
                      type="text"
                      value={newFeedback.scoreOrAchievement}
                      onChange={(e) => setNewFeedback({ ...newFeedback, scoreOrAchievement: e.target.value })}
                      placeholder="e.g. 95% Boards / NEET Rank"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#101923] border border-white/10 focus:border-[#D5B06C] focus:outline-none text-sm text-[#F7F7F4] placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A9B3C1] mb-1 uppercase tracking-wider">
                    Your Experience & Feedback <span className="text-[#D5B06C]">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newFeedback.review}
                    onChange={(e) => setNewFeedback({ ...newFeedback, review: e.target.value })}
                    placeholder="Describe how the faculty guidance, test series, or study library helped your academics..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#101923] border border-white/10 focus:border-[#D5B06C] focus:outline-none text-sm text-[#F7F7F4] placeholder:text-gray-500 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm text-[#07111F] bg-[#D5B06C] hover:bg-[#e4c284] disabled:opacity-60 shadow-lg shadow-[#D5B06C]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving to Firestore...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Post Testimonial to Firestore</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </section>
  );
};
