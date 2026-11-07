import React from 'react';
import { Phone, MessageCircle, MapPin, Clock, ArrowUp } from 'lucide-react';
import { BUSINESS_INFO, getWhatsAppUrl } from '../constants/data';
import { scrollToSection } from '../utils/navigation';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    scrollToSection('hero');
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    scrollToSection(href);
  };

  return (
    <footer className="relative bg-[#050b14] border-t border-white/10 pt-16 pb-28 px-4 sm:px-6 lg:px-12 z-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/5">
          
          {/* Brand Col */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D5B06C] to-[#99793d] flex items-center justify-center font-bold text-[#07111F] text-xl font-display">
                S
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-[#F7F7F4] font-display">
                  SARVADNYA
                </span>
                <p className="text-[11px] text-[#D5B06C] tracking-wider uppercase">
                  Tuition Classes · Nagpur
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#A9B3C1] max-w-sm leading-relaxed">
              {BUSINESS_INFO.tagline} Focused coaching for Class 9, Class 10, Class 11, Class 12, NEET and JEE, combined with dedicated student library seating.
            </p>

            <div className="text-xs text-[#76D9EF] flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Student Library: 7:00 AM – 10:00 PM Daily</span>
            </div>
          </div>

          {/* Programs Col */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#D5B06C]">
              Coaching & Campus
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#A9B3C1]">
              <li><a href="#foundations" onClick={(e) => handleLinkClick(e, '#foundations')} className="hover:text-white transition-colors">Class 9 & 10 Foundation</a></li>
              <li><a href="#senior-secondary" onClick={(e) => handleLinkClick(e, '#senior-secondary')} className="hover:text-white transition-colors">Class 11 & 12 Senior</a></li>
              <li><a href="#neet" onClick={(e) => handleLinkClick(e, '#neet')} className="hover:text-white transition-colors">NEET Medical Prep</a></li>
              <li><a href="#jee" onClick={(e) => handleLinkClick(e, '#jee')} className="hover:text-white transition-colors">JEE Engineering Prep</a></li>
              <li><a href="#library" onClick={(e) => handleLinkClick(e, '#library')} className="hover:text-white transition-colors">Student Library (7 AM – 10 PM)</a></li>
              <li><a href="#faculty" onClick={(e) => handleLinkClick(e, '#faculty')} className="hover:text-[#D5B06C] transition-colors">Experienced Faculty</a></li>
              <li><a href="#toppers" onClick={(e) => handleLinkClick(e, '#toppers')} className="hover:text-[#D5B06C] transition-colors">Toppers of the Month</a></li>
              <li><a href="#testimonials" onClick={(e) => handleLinkClick(e, '#testimonials')} className="hover:text-[#D5B06C] transition-colors">Student Experiences & Reviews</a></li>
              <li><a href="#gallery" onClick={(e) => handleLinkClick(e, '#gallery')} className="hover:text-[#D5B06C] transition-colors">Campus Gallery</a></li>
              <li><a href="#faq" onClick={(e) => handleLinkClick(e, '#faq')} className="hover:text-[#D5B06C] transition-colors">Frequently Asked Questions (FAQ)</a></li>
              <li><a href="#contact" onClick={(e) => handleLinkClick(e, '#contact')} className="hover:text-[#D5B06C] transition-colors">Admissions & Contact</a></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#D5B06C]">
              Institute Address & Contacts
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-[#A9B3C1]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D5B06C] shrink-0 mt-0.5" />
                <span>01 Sarvashree Nagar, Nagpur, Maharashtra, India.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#76D9EF] shrink-0" />
                <a href={`tel:${BUSINESS_INFO.phone}`} className="hover:text-white transition-colors">
                  {BUSINESS_INFO.phoneFormatted}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#D5B06C] shrink-0" />
                <a 
                  href={getWhatsAppUrl('Hello Sarvadnya Tuition Classes, I would like to enquire about coaching admissions.')}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors"
                >
                  WhatsApp: +{BUSINESS_INFO.whatsappNumber}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#A9B3C1]/70">
          <p>© {new Date().getFullYear()} Sarvadnya Tuition Classes. All rights reserved. Nagpur, Maharashtra.</p>
          
          <div className="flex items-center gap-4">
            <a
              href="#admin"
              className="hover:text-[#ff7a3d] transition-colors flex items-center gap-1"
            >
              <span>Admin Desk</span>
            </a>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#D5B06C]" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
