import React, { useState, useEffect } from 'react';
import { CinematicCanvas } from './three/CinematicCanvas';
import { Navbar } from './components/Navbar';
import { HeroOverlay } from './components/HeroOverlay';
import { FoundationsSection } from './components/FoundationsSection';
import { SeniorSection } from './components/SeniorSection';
import { NeetSection } from './components/NeetSection';
import { JeeSection } from './components/JeeSection';
import { LibrarySection } from './components/LibrarySection';
import { AchieversAndGallery } from './components/AchieversAndGallery';
import { StudentTestimonials } from './components/StudentTestimonials';
import { WhySarvadnya } from './components/WhySarvadnya';
import { FAQSection } from './components/FAQSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CinematicControls } from './components/CinematicControls';
import { EnquiryModal } from './components/EnquiryModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Phone, MessageCircle } from 'lucide-react';
import { BUSINESS_INFO, getWhatsAppUrl } from './constants/data';

export default function App() {
  const [isAdminView, setIsAdminView] = useState(() => window.location.hash === '#admin');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [isZenMode, setIsZenMode] = useState(false);
  const [lightingPreset, setLightingPreset] = useState<'cinematic' | 'technical' | 'warm'>('cinematic');
  
  // Enquiry Modal state
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('Class 10');

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminView(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenEnquiry = (program = 'Class 10') => {
    setSelectedProgram(program);
    setIsEnquiryModalOpen(true);
  };

  // Scroll listener to calculate normalized scrollProgress (0 to 1)
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const progress = totalScroll > 0 ? Math.min(1, Math.max(0, currentScroll / totalScroll)) : 0;
      setScrollProgress(progress);

      // Section detection
      const sections = ['hero', 'foundations', 'senior-secondary', 'neet', 'jee', 'library', 'achievers', 'faculty', 'toppers', 'testimonials', 'gallery', 'why-us', 'faq', 'contact'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.2) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAdminView) {
    return (
      <AdminDashboard
        onExit={() => {
          window.location.hash = '';
          setIsAdminView(false);
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#07111F] text-[#F7F7F4] font-sans selection:bg-[#D5B06C]/30 selection:text-[#F7F7F4]">
      
      {/* 1. Persistent 3D Three.js Cinematic Canvas */}
      <CinematicCanvas
        scrollProgress={scrollProgress}
        isZenMode={isZenMode}
        lightingPreset={lightingPreset}
      />

      {/* 2. Top Header Navigation */}
      <div className={`transition-opacity duration-500 ${isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <Navbar
          onOpenEnquiry={handleOpenEnquiry}
          activeSection={activeSection}
        />
      </div>

      {/* 3. HTML Content Layers (Scrollable sections positioned along camera journey) */}
      <main className={`relative z-10 transition-opacity duration-500 ${isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <HeroOverlay onOpenEnquiry={handleOpenEnquiry} />
        <FoundationsSection onOpenEnquiry={handleOpenEnquiry} />
        <SeniorSection onOpenEnquiry={handleOpenEnquiry} />
        <NeetSection onOpenEnquiry={handleOpenEnquiry} />
        <JeeSection onOpenEnquiry={handleOpenEnquiry} />
        <LibrarySection onOpenEnquiry={handleOpenEnquiry} />
        <AchieversAndGallery onOpenEnquiry={handleOpenEnquiry}>
          <StudentTestimonials onOpenEnquiry={handleOpenEnquiry} />
        </AchieversAndGallery>
        <WhySarvadnya onOpenEnquiry={handleOpenEnquiry} />
        <FAQSection onOpenEnquiry={handleOpenEnquiry} />
        <ContactSection onOpenEnquiry={handleOpenEnquiry} />
        <Footer />
      </main>

      {/* 4. Ergonomic Bottom 3D Control Dock */}
      <CinematicControls
        isZenMode={isZenMode}
        onToggleZenMode={() => setIsZenMode(!isZenMode)}
        lightingPreset={lightingPreset}
        onChangeLighting={setLightingPreset}
        activeSection={activeSection}
      />

      {/* 5. Mobile Quick Floating WhatsApp & Call Buttons */}
      <div className={`fixed bottom-20 right-4 z-40 sm:hidden flex flex-col gap-2.5 transition-opacity duration-300 ${isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <a
          href={`tel:${BUSINESS_INFO.phone}`}
          className="w-11 h-11 rounded-full bg-[#07111F] border border-white/20 text-[#76D9EF] shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Call institute"
        >
          <Phone className="w-5 h-5" />
        </a>
        <a
          href={getWhatsAppUrl('Hello Sarvadnya Tuition Classes, I would like to enquire about coaching admissions.')}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-[#D5B06C] text-[#07111F] shadow-xl flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-6 h-6 fill-current" />
        </a>
      </div>

      {/* 6. Quick Interactive Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        initialProgram={selectedProgram}
      />

    </div>
  );
}
