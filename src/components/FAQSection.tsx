import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  Clock, 
  Users, 
  BookOpen, 
  Sparkles, 
  Phone, 
  MessageCircle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { FAQ_ITEMS, BUSINESS_INFO, getWhatsAppUrl } from '../constants/data';
import { FAQItem } from '../types';

interface FAQSectionProps {
  onOpenEnquiry?: (program?: string) => void;
}

type FilterCategory = 'all' | 'batches' | 'timings' | 'syllabus' | 'library' | 'general';

export const FAQSection: React.FC<FAQSectionProps> = ({ onOpenEnquiry }) => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(FAQ_ITEMS[0]?.id || null);

  const categories: { key: FilterCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All Questions', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: 'batches', label: 'Batch Sizes & Attention', icon: <Users className="w-3.5 h-3.5" /> },
    { key: 'timings', label: 'Timings & Schedules', icon: <Clock className="w-3.5 h-3.5" /> },
    { key: 'syllabus', label: 'Syllabus & Tests', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { key: 'library', label: 'Library Facilities', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query || 
        item.question.toLowerCase().includes(query) || 
        item.answer.toLowerCase().includes(query) ||
        item.categoryLabel.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleAccordion = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section 
      id="faq" 
      className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-white pointer-events-auto scroll-mt-24"
    >
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#D5B06C]/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D5B06C]/10 border border-[#D5B06C]/25 text-xs font-semibold uppercase tracking-widest text-[#D5B06C] mb-4">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>HELP & CLARITY FOR PARENTS & STUDENTS</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-[#F7F7F4]">
          Frequently Asked <span className="text-[#D5B06C]">Questions</span>
        </h2>
        <p className="mt-3 text-base sm:text-lg text-gray-400 leading-relaxed">
          Clear answers about our 20–25 student batch sizes, syllabus timelines, test schedules, and the 15-hour daily study library in Nagpur.
        </p>

        {/* Quick Search Bar */}
        <div className="mt-8 max-w-md mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g., batch sizes, timings, NEET, library)..."
            className="w-full pl-11 pr-4 py-3 rounded-full bg-[#101923]/90 border border-white/10 focus:border-[#D5B06C] focus:outline-none text-sm text-[#F7F7F4] placeholder:text-gray-500 shadow-lg shadow-black/20 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#D5B06C] text-[#07111F] font-semibold shadow-md shadow-[#D5B06C]/20'
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion FAQ List */}
      <div className="max-w-4xl mx-auto space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 px-6 rounded-2xl bg-[#101923]/50 border border-white/10 text-gray-400">
            <HelpCircle className="w-8 h-8 text-[#D5B06C] mx-auto mb-3 opacity-60" />
            <p className="text-base font-semibold text-white">No questions found matching your search.</p>
            <p className="text-xs text-gray-400 mt-1">Try searching for other terms or click &ldquo;All Questions&rdquo; to reset.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#D5B06C] border border-[#D5B06C]/30 transition-colors cursor-pointer"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className={`group rounded-2xl border transition-all duration-300 backdrop-blur-md overflow-hidden ${
                  isExpanded
                    ? 'bg-gradient-to-b from-[#101923] to-[#0a1320] border-[#D5B06C]/40 shadow-xl shadow-[#D5B06C]/5'
                    : 'bg-[#101923]/70 hover:bg-[#101923] border-white/10 hover:border-white/20'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  aria-expanded={isExpanded}
                  className="w-full py-5 px-6 sm:px-7 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#D5B06C] bg-[#D5B06C]/10 px-2 py-0.5 rounded border border-[#D5B06C]/20">
                        {faq.categoryLabel}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#F7F7F4] font-display group-hover:text-white transition-colors pt-1">
                      {faq.question}
                    </h3>
                  </div>

                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-1 transition-all duration-300 ${
                    isExpanded 
                      ? 'bg-[#D5B06C] border-[#D5B06C] text-[#07111F] rotate-180' 
                      : 'bg-white/5 border-white/10 text-gray-400 group-hover:text-white'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: 'auto', 
                        opacity: 1,
                        transition: {
                          height: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
                          opacity: { duration: 0.25, delay: 0.05 }
                        }
                      }}
                      exit={{ 
                        height: 0, 
                        opacity: 0,
                        transition: {
                          height: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
                          opacity: { duration: 0.15 }
                        }
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 sm:px-7 pb-6 pt-1 text-sm sm:text-base text-gray-300 leading-relaxed border-t border-white/5 mt-1">
                        <p>{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Still Have Questions CTA Banner */}
      <div className="mt-14 max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-[#101923] via-[#0e1724] to-[#101923] border border-white/10 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#76D9EF]">
            <Clock className="w-3.5 h-3.5" />
            <span>Admissions Desk Open Daily</span>
          </div>
          <h4 className="text-xl sm:text-2xl font-bold text-[#F7F7F4] font-display">
            Have a Specific Academic Query?
          </h4>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md">
            Speak directly with our academic coordinators regarding current seat availability, customized batch timings, or student library membership in Nagpur.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <a
            href={`tel:${BUSINESS_INFO.phone}`}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-white bg-white/5 hover:bg-white/10 border border-white/15 flex items-center gap-2 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#76D9EF]" />
            <span>{BUSINESS_INFO.phoneFormatted}</span>
          </a>

          <a
            href={getWhatsAppUrl('Hello Sarvadnya Tuition Classes, I have a question regarding batch timings and admission enrollment.')}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#07111F] bg-[#D5B06C] hover:bg-[#e4c284] flex items-center gap-2 transition-all shadow-md shadow-[#D5B06C]/20"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>Chat on WhatsApp</span>
          </a>

          {onOpenEnquiry && (
            <button
              onClick={() => onOpenEnquiry('General Enquiry')}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Book Consultation</span>
              <ArrowRight className="w-3 h-3 text-[#D5B06C]" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
