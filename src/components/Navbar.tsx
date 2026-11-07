import React, { useState } from 'react';
import { Phone, MessageCircle, Clock, Menu, X, Compass, ArrowUpRight } from 'lucide-react';
import { BUSINESS_INFO, getWhatsAppUrl } from '../constants/data';
import { scrollToSection } from '../utils/navigation';

interface NavbarProps {
  onOpenEnquiry: (program?: string) => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenEnquiry, activeSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Foundations', href: '#foundations' },
    { label: 'Senior (11-12)', href: '#senior-secondary' },
    { label: 'NEET', href: '#neet' },
    { label: 'JEE', href: '#jee' },
    { label: 'Library', href: '#library' },
    { label: 'Faculty', href: '#faculty' },
    { label: 'Toppers', href: '#toppers' },
    { label: 'Reviews', href: '#testimonials' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' }
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    scrollToSection(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-[#07111F]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand identity */}
        <a 
          href="#hero" 
          onClick={(e) => { e.preventDefault(); handleNavClick('#hero'); }}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D5B06C] to-[#99793d] flex items-center justify-center shadow-lg shadow-[#D5B06C]/10 border border-[#D5B06C]/40 group-hover:scale-105 transition-transform">
            <span className="font-bold text-[#07111F] text-xl font-display tracking-wider">S</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-[#F7F7F4] font-display">
                SARVADNYA
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-widest text-[#D5B06C] px-2 py-0.5 rounded bg-[#D5B06C]/10 border border-[#D5B06C]/20">
                Nagpur
              </span>
            </div>
            <p className="text-[11px] text-[#A9B3C1] tracking-wider uppercase">
              Tuition Classes · Library
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className={`px-3 py-1.5 text-xs font-medium tracking-wide rounded-md transition-all duration-200 ${
                  isActive
                    ? 'text-[#D5B06C] bg-[#D5B06C]/10 border border-[#D5B06C]/30'
                    : 'text-[#A9B3C1] hover:text-[#F7F7F4] hover:bg-white/5'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Library Timings Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#A9B3C1]">
            <Clock className="w-3.5 h-3.5 text-[#D5B06C]" />
            <span>Library: 7 AM – 10 PM</span>
          </div>

          {/* Direct Phone Call */}
          <a
            href={`tel:${BUSINESS_INFO.phone}`}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-[#F7F7F4] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            title="Call Sarvadnya Tuition Classes"
          >
            <Phone className="w-3.5 h-3.5 text-[#76D9EF]" />
            <span className="hidden md:inline">{BUSINESS_INFO.phoneFormatted}</span>
          </a>

          {/* WhatsApp CTA */}
          <a
            href={getWhatsAppUrl('Hello Sarvadnya Tuition Classes, I would like to enquire about your coaching programs.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-[#07111F] bg-[#D5B06C] hover:bg-[#e4c284] shadow-md shadow-[#D5B06C]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-[#A9B3C1] hover:text-white bg-white/5 border border-white/10"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#07111F] border-b border-white/10 px-4 pt-3 pb-6 space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-white/5 text-xs text-[#D5B06C]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Library Seating: 7 AM – 10 PM
            </span>
            <span>Nagpur</span>
          </div>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#A9B3C1] hover:text-[#F7F7F4] hover:bg-white/5 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-medium text-[#F7F7F4] bg-white/5 border border-white/10"
            >
              <Phone className="w-4 h-4 text-[#76D9EF]" />
              Call {BUSINESS_INFO.phoneFormatted}
            </a>
            <a
              href={getWhatsAppUrl('Hello Sarvadnya Tuition Classes, I would like to enquire about your coaching programs.')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-semibold text-[#07111F] bg-[#D5B06C]"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
