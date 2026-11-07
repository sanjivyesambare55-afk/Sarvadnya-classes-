import React, { useState } from 'react';
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Send, 
  Clock, 
  CheckCircle2, 
  Navigation, 
  Database, 
  Loader2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { BUSINESS_INFO, getWhatsAppUrl } from '../constants/data';
import { EnquiryFormData } from '../types';
import { saveAdmissionEnquiry } from '../firebase';

interface ContactSectionProps {
  onOpenEnquiry?: (program?: string) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = () => {
  const [formData, setFormData] = useState<EnquiryFormData>({
    studentName: '',
    phoneNumber: '',
    program: 'Class 10',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{
    submitted: boolean;
    firestoreSaved: boolean;
    docId?: string;
    error?: string;
  }>({
    submitted: false,
    firestoreSaved: false
  });

  const programsList = [
    'Class 9',
    'Class 10',
    'Class 11',
    'Class 12',
    'NEET',
    'JEE',
    'Library Seating',
    'General Enquiry'
  ];

  const getFormattedWhatsAppText = () => {
    return `Hello Sarvadnya Tuition Classes,\n\nI would like to submit an admission enquiry:\n• Student Name: ${formData.studentName}\n• Contact Number: ${formData.phoneNumber}\n• Program/Facility of Interest: ${formData.program}\n${formData.message ? `• Note: ${formData.message}\n` : ''}\nPlease let me know about batch timings and enrollment details.`;
  };

  // Direct WhatsApp Submission (preserves original instant option)
  const handleWhatsAppSubmit = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!formData.studentName || !formData.phoneNumber) return;

    const whatsappUrl = `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(getFormattedWhatsAppText())}`;
    window.open(whatsappUrl, '_blank');
  };

  // Online Firestore submission handler
  const handleFirestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName || !formData.phoneNumber) return;

    setIsSubmitting(true);

    // Save directly to Firestore "enquiries" collection
    const result = await saveAdmissionEnquiry({
      studentName: formData.studentName,
      phoneNumber: formData.phoneNumber,
      program: formData.program,
      message: formData.message,
      source: 'website_contact_form'
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubmissionStatus({
        submitted: true,
        firestoreSaved: true,
        docId: result.id
      });
    } else {
      // Handled gracefully (e.g., if using default placeholder config)
      setSubmissionStatus({
        submitted: true,
        firestoreSaved: false,
        error: result.error
      });
    }
  };

  return (
    <section id="contact" className="relative min-h-screen flex items-center py-24 px-4 sm:px-6 lg:px-12 z-10 pointer-events-none scroll-mt-24">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D5B06C]/10 border border-[#D5B06C]/25 text-xs font-semibold uppercase tracking-widest text-[#D5B06C] mb-4">
            <Send className="w-3.5 h-3.5" />
            <span>ADMISSIONS & CONTACT</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F7F7F4] font-display">
            YOUR NEXT CHAPTER <br />
            <span className="text-[#D5B06C]">STARTS HERE.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#A9B3C1] leading-relaxed">
            Connect with Sarvadnya Tuition Classes to learn more about our programs and student library facility.
          </p>
        </div>

        {/* Content & Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pointer-events-auto">
          
          {/* Left: Contact Info & Action Buttons */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="rounded-2xl bg-[#07111F]/90 border border-white/10 p-7 space-y-6">
              
              {/* Telephone */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#76D9EF]/10 border border-[#76D9EF]/20 flex items-center justify-center text-[#76D9EF] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#A9B3C1]">Call Institute Directly</span>
                  <div className="text-xl font-bold text-[#F7F7F4] font-display mt-0.5">
                    {BUSINESS_INFO.phoneFormatted}
                  </div>
                  <span className="text-xs text-[#A9B3C1]">Direct inquiry & consultations</span>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#D5B06C]/10 border border-[#D5B06C]/20 flex items-center justify-center text-[#D5B06C] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#A9B3C1]">Physical Location</span>
                  <div className="text-base font-semibold text-[#F7F7F4] mt-0.5">
                    01 Sarvashree Nagar, Nagpur
                  </div>
                  <span className="text-xs text-[#A9B3C1]">Maharashtra, India</span>
                </div>
              </div>

              {/* Library Timings */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D5B06C] shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#A9B3C1]">Student Library Seating</span>
                  <div className="text-base font-semibold text-[#D5B06C] mt-0.5">
                    7:00 AM – 10:00 PM
                  </div>
                  <span className="text-xs text-[#A9B3C1]">15 daily uninterrupted study hours</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-3 border-t border-white/5">
                <a
                  href={getWhatsAppUrl('Hello Sarvadnya Tuition Classes, I would like to enquire about coaching admissions and library facilities.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl font-semibold text-xs sm:text-sm text-[#07111F] bg-[#D5B06C] hover:bg-[#e4c284] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#D5B06C]/15"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Enquire on WhatsApp</span>
                </a>

                <a
                  href={`tel:${BUSINESS_INFO.phone}`}
                  className="w-full py-3.5 px-4 rounded-xl font-semibold text-xs sm:text-sm text-[#F7F7F4] bg-white/5 hover:bg-white/10 border border-white/15 transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-[#76D9EF]" />
                  <span>Call the Institute</span>
                </a>

                <a
                  href={BUSINESS_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl font-medium text-xs sm:text-sm text-[#A9B3C1] hover:text-[#F7F7F4] bg-transparent hover:bg-white/5 border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4 text-[#D5B06C]" />
                  <span>Get Directions</span>
                </a>
              </div>

            </div>

          </div>

          {/* Right: Admission & Library Enquiry Form with Firestore & WhatsApp */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-[#07111F]/90 border border-white/10 p-8 sm:p-10 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl sm:text-2xl font-bold text-[#F7F7F4] font-display">
                  Send an Admission Enquiry
                </h3>
                <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#76D9EF] px-2.5 py-1 rounded bg-[#76D9EF]/10 border border-[#76D9EF]/20">
                  <Database className="w-3 h-3" />
                  <span>Firestore Integrated</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#A9B3C1] mb-6">
                Submit your details online to record your enquiry in our admissions database, or send directly via WhatsApp.
              </p>

              {/* Success Notification after Firestore write */}
              {submissionStatus.submitted && (
                <div className="mb-6 p-4 rounded-xl bg-[#D5B06C]/10 border border-[#D5B06C]/30 space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#D5B06C] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#D5B06C]">
                        {submissionStatus.firestoreSaved 
                          ? 'Enquiry Recorded in Firestore Database!' 
                          : 'Enquiry Received!'}
                      </h4>
                      <p className="text-xs text-[#F7F7F4]/90 mt-0.5">
                        {submissionStatus.firestoreSaved && submissionStatus.docId
                          ? `Saved to 'enquiries' collection (Doc ID: ${submissionStatus.docId}). Our Nagpur desk will reach out.`
                          : 'Your enquiry is ready. You can also chat directly with our administration on WhatsApp below.'}
                      </p>
                    </div>
                  </div>

                  {/* Immediate WhatsApp Forward CTA */}
                  <div className="pt-2 border-t border-[#D5B06C]/20 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleWhatsAppSubmit()}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-[#07111F] bg-[#D5B06C] hover:bg-[#e4c284] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>Also Open in WhatsApp</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubmissionStatus({ submitted: false, firestoreSaved: false })}
                      className="px-3 py-2 rounded-lg text-xs text-[#A9B3C1] hover:text-[#F7F7F4] transition-colors cursor-pointer"
                    >
                      Submit Another Enquiry
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleFirestoreSubmit} className="space-y-4">
                
                {/* Student Name */}
                <div>
                  <label className="block text-xs font-medium text-[#A9B3C1] mb-1.5 uppercase tracking-wider">
                    Student Full Name <span className="text-[#D5B06C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-4 py-3 rounded-xl bg-[#101923] border border-white/10 focus:border-[#D5B06C] focus:outline-none text-sm text-[#F7F7F4] placeholder:text-gray-500 transition-colors"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-medium text-[#A9B3C1] mb-1.5 uppercase tracking-wider">
                    Phone Number <span className="text-[#D5B06C]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="e.g. 7020035514"
                    className="w-full px-4 py-3 rounded-xl bg-[#101923] border border-white/10 focus:border-[#D5B06C] focus:outline-none text-sm text-[#F7F7F4] placeholder:text-gray-500 transition-colors"
                  />
                </div>

                {/* Program Select */}
                <div>
                  <label className="block text-xs font-medium text-[#A9B3C1] mb-1.5 uppercase tracking-wider">
                    Program or Facility of Interest <span className="text-[#D5B06C]">*</span>
                  </label>
                  <select
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#101923] border border-white/10 focus:border-[#D5B06C] focus:outline-none text-sm text-[#F7F7F4] transition-colors"
                  >
                    {programsList.map((prog) => (
                      <option key={prog} value={prog} className="bg-[#07111F] text-[#F7F7F4]">
                        {prog}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Message */}
                <div>
                  <label className="block text-xs font-medium text-[#A9B3C1] mb-1.5 uppercase tracking-wider">
                    Optional Message / Queries
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Ask about batch timings, syllabus details, library seating, or admission procedure..."
                    className="w-full px-4 py-3 rounded-xl bg-[#101923] border border-white/10 focus:border-[#D5B06C] focus:outline-none text-sm text-[#F7F7F4] placeholder:text-gray-500 transition-colors resize-none"
                  />
                </div>

                {/* Submission Options: Firestore DB + WhatsApp */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  {/* Primary Firestore Submission */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 px-5 rounded-xl font-semibold text-sm text-[#07111F] bg-[#D5B06C] hover:bg-[#e4c284] disabled:opacity-60 shadow-lg shadow-[#D5B06C]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving to Firestore...</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4" />
                        <span>Save Enquiry Online</span>
                      </>
                    )}
                  </button>

                  {/* WhatsApp Submission Option */}
                  <button
                    type="button"
                    onClick={() => handleWhatsAppSubmit()}
                    className="py-3.5 px-5 rounded-xl font-semibold text-sm text-[#F7F7F4] bg-white/5 hover:bg-white/10 border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    title="Send prefilled message directly via WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-[#76D9EF]" />
                    <span>Send via WhatsApp</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#A9B3C1]/70 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <Database className="w-3 h-3 text-[#D5B06C]" />
                    <span>Stored in Cloud Firestore (`enquiries`)</span>
                  </span>
                  <span>WhatsApp 24/7 Desk Available</span>
                </div>

              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
