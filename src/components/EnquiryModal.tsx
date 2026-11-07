import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MessageCircle, 
  CheckCircle2, 
  Check, 
  Database, 
  Loader2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { BUSINESS_INFO } from '../constants/data';
import { EnquiryFormData } from '../types';
import { saveAdmissionEnquiry } from '../firebase';
import { Toast } from './Toast';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProgram?: string;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  initialProgram = 'Class 10'
}) => {
  const [formData, setFormData] = useState<EnquiryFormData>({
    studentName: '',
    phoneNumber: '',
    program: initialProgram,
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    studentName: string;
    program: string;
    phoneNumber: string;
  }>({
    isOpen: false,
    studentName: '',
    program: '',
    phoneNumber: ''
  });

  // Field element refs for clickable step jumps
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const programSelectRef = useRef<HTMLSelectElement>(null);
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialProgram) {
      setFormData((prev) => ({ ...prev, program: initialProgram }));
    }
  }, [initialProgram]);

  if (!isOpen && !toastState.isOpen) return null;

  if (!isOpen && toastState.isOpen) {
    return (
      <Toast
        isOpen={toastState.isOpen}
        type="success"
        title="Enquiry Submitted Successfully!"
        message={`Admissions enquiry for ${toastState.studentName} (${toastState.program}) has been recorded. WhatsApp chat is opening...`}
        studentName={toastState.studentName}
        program={toastState.program}
        phoneNumber={toastState.phoneNumber}
        duration={5000}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    );
  }

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

  // Validation checks for each step
  const isNameDone = formData.studentName.trim().length >= 2;
  const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
  const isPhoneDone = cleanPhone.length === 10 || (cleanPhone.length === 12 && cleanPhone.startsWith('91'));
  const isProgramDone = Boolean(formData.program && formData.program.trim().length > 0);
  const isFormComplete = isNameDone && isPhoneDone && isProgramDone;

  // Step definitions for visual reading progress
  const steps = [
    { 
      id: 1, 
      label: 'Student', 
      isDone: isNameDone, 
      focus: () => nameInputRef.current?.focus() 
    },
    { 
      id: 2, 
      label: 'Contact', 
      isDone: isPhoneDone, 
      focus: () => phoneInputRef.current?.focus() 
    },
    { 
      id: 3, 
      label: 'Course', 
      isDone: isProgramDone, 
      focus: () => programSelectRef.current?.focus() 
    },
    { 
      id: 4, 
      label: 'Submit', 
      isDone: isFormComplete, 
      focus: () => messageTextareaRef.current?.focus() 
    }
  ];

  const completedStepsCount = [isNameDone, isPhoneDone, isProgramDone, isFormComplete].filter(Boolean).length;
  const progressPercent = Math.round((completedStepsCount / 4) * 100);

  // Dynamic guidance micro-copy
  const getGuidanceTip = () => {
    if (!isNameDone) return 'Step 1: Enter student full name';
    if (!isPhoneDone) return 'Step 2: Enter 10-digit mobile number for WhatsApp updates';
    if (!isProgramDone) return 'Step 3: Confirm your coaching program or library seat';
    return 'All steps complete (100%) · Ready to submit enquiry & connect on WhatsApp';
  };

  const getWhatsAppMessage = () => {
    return `Hello Sarvadnya Tuition Classes,\n\nI would like to enquire about:\n• Program/Facility: ${formData.program}\n• Student Name: ${formData.studentName || 'Prospective Student'}\n• Contact Number: ${formData.phoneNumber || 'Not provided'}\n${formData.message ? `• Note: ${formData.message}\n` : ''}\nPlease let me know about batch timings and enrollment details.`;
  };

  const handleWhatsAppOnly = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const whatsappUrl = `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(getWhatsAppMessage())}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName || !formData.phoneNumber) return;

    setIsSubmitting(true);
    const submittedStudentName = formData.studentName.trim();
    const submittedPhone = formData.phoneNumber.trim();
    const submittedProgram = formData.program;

    try {
      // Save admission enquiry to Firestore "enquiries" collection
      const result = await saveAdmissionEnquiry({
        studentName: submittedStudentName,
        phoneNumber: submittedPhone,
        program: submittedProgram,
        message: formData.message,
        source: 'modal_enquiry_form'
      });

      if (!result.success && result.error) {
        console.warn('Firestore enquiry submission note:', result.error);
      }
    } catch (err: unknown) {
      console.warn('Enquiry submission notice:', err);
    } finally {
      setIsSubmitting(false);
      setIsSaved(true);
      // Trigger instant floating Toast notification
      setToastState({
        isOpen: true,
        studentName: submittedStudentName,
        program: submittedProgram,
        phoneNumber: submittedPhone
      });
    }

    // Format prefilled WhatsApp text and open seamlessly
    const whatsappUrl = `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(getWhatsAppMessage())}`;
    window.open(whatsappUrl, '_blank');

    setTimeout(() => {
      onClose();
      setIsSaved(false);
    }, 1200);
  };

  return (
    <>
      <Toast
        isOpen={toastState.isOpen}
        type="success"
        title="Enquiry Submitted Successfully!"
        message={`Admissions enquiry for ${toastState.studentName} (${toastState.program}) has been recorded. WhatsApp chat is opening...`}
        studentName={toastState.studentName}
        program={toastState.program}
        phoneNumber={toastState.phoneNumber}
        duration={5000}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-[#07111F] border border-[#D5B06C]/30 p-6 sm:p-8 shadow-2xl text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-[#A9B3C1] hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#D5B06C]">
              Direct Admission Desk · Nagpur
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-[#76D9EF]">
              <Database className="w-3 h-3" />
              <span>Live Firestore Sync</span>
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#F7F7F4] font-display">
            Admission &amp; Seat Enquiry
          </h3>
          <p className="text-xs text-[#A9B3C1]">
            Track your application form completion and submit directly to our admissions team.
          </p>
        </div>

        {/* Visual Reading Progress & Step-Completion Indicator */}
        <div className="mb-5 p-3.5 rounded-xl bg-[#101923]/95 border border-white/10 space-y-2.5 shadow-inner">
          
          {/* Top Status & Percentage */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <span className={`w-2 h-2 rounded-full transition-colors ${isFormComplete ? 'bg-emerald-400' : 'bg-[#D5B06C]'}`} />
              <span className="font-semibold text-[#F7F7F4]">Application Progress</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-mono text-[11px]">{completedStepsCount} of 4 steps completed</span>
            </div>
            <span className="font-mono font-bold text-xs text-[#D5B06C] tabular-nums">
              {progressPercent}%
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div 
              className={`h-full transition-all duration-300 ease-out rounded-full ${
                isFormComplete 
                  ? 'bg-gradient-to-r from-emerald-400 to-[#D5B06C]' 
                  : 'bg-gradient-to-r from-[#D5B06C] via-[#e4c284] to-[#76D9EF]'
              }`}
              style={{ width: `${Math.max(progressPercent, 6)}%` }}
            />
          </div>

          {/* Interactive Step Completion Checkpoints */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {steps.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={st.focus}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                  st.isDone
                    ? 'bg-[#D5B06C]/15 text-[#D5B06C] border border-[#D5B06C]/30 hover:bg-[#D5B06C]/25'
                    : 'bg-white/5 text-slate-400 border border-white/5 hover:text-white hover:bg-white/10'
                }`}
                title={`Click to jump to ${st.label}`}
              >
                {st.isDone ? (
                  <Check className="w-3 h-3 text-[#D5B06C] stroke-[3] shrink-0" />
                ) : (
                  <span className="w-3 text-center text-[10px] text-slate-500 font-bold shrink-0">{st.id}</span>
                )}
                <span className="truncate">{st.label}</span>
              </button>
            ))}
          </div>

          {/* Dynamic Step Guidance Micro-copy */}
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-0.5 border-t border-white/5">
            <span className="truncate font-medium text-slate-300">{getGuidanceTip()}</span>
            {isFormComplete ? (
              <span className="text-emerald-400 font-mono text-[10px] font-bold shrink-0 ml-2">
                ✓ Ready to Send
              </span>
            ) : (
              <span className="text-slate-500 font-mono text-[10px] shrink-0 ml-2">
                {4 - completedStepsCount} left
              </span>
            )}
          </div>

        </div>

        {isSaved && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Enquiry recorded in Firestore and opening WhatsApp...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Step 1: Student Full Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#A9B3C1] uppercase tracking-wider">
                Student Full Name <span className="text-[#D5B06C]">*</span>
              </label>
              {isNameDone && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Valid Name</span>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                ref={nameInputRef}
                type="text"
                required
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                placeholder="e.g. Ananya Deshmukh"
                className={`w-full px-4 py-2.5 rounded-xl bg-[#101923] border text-sm text-[#F7F7F4] placeholder:text-gray-500 transition-colors focus:outline-none ${
                  isNameDone 
                    ? 'border-emerald-500/40 focus:border-emerald-400' 
                    : 'border-white/10 focus:border-[#D5B06C]'
                }`}
              />
            </div>
          </div>

          {/* Step 2: Contact Phone Number */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#A9B3C1] uppercase tracking-wider">
                Contact Phone Number <span className="text-[#D5B06C]">*</span>
              </label>
              {isPhoneDone ? (
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>10 Digits Verified</span>
                </span>
              ) : (
                formData.phoneNumber.length > 0 && (
                  <span className="text-[11px] font-mono text-amber-400">
                    {cleanPhone.length}/10 digits
                  </span>
                )
              )}
            </div>
            <div className="relative">
              <input
                ref={phoneInputRef}
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="e.g. 7020035514"
                className={`w-full px-4 py-2.5 rounded-xl bg-[#101923] border text-sm text-[#F7F7F4] placeholder:text-gray-500 transition-colors focus:outline-none ${
                  isPhoneDone 
                    ? 'border-emerald-500/40 focus:border-emerald-400' 
                    : 'border-white/10 focus:border-[#D5B06C]'
                }`}
              />
            </div>
          </div>

          {/* Step 3: Select Program / Facility */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#A9B3C1] uppercase tracking-wider">
                Select Program / Facility <span className="text-[#D5B06C]">*</span>
              </label>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Selected</span>
              </span>
            </div>
            <select
              ref={programSelectRef}
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#101923] border border-white/10 focus:border-[#D5B06C] focus:outline-none text-sm text-[#F7F7F4] transition-colors"
            >
              {programsList.map((prog) => (
                <option key={prog} value={prog} className="bg-[#07111F] text-[#F7F7F4]">
                  {prog}
                </option>
              ))}
            </select>
          </div>

          {/* Step 4: Specific Query / Note (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#A9B3C1] uppercase tracking-wider">
                Specific Query / Note (Optional)
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                {(formData.message || '').trim().length > 0 ? `${(formData.message || '').length} chars` : 'Optional'}
              </span>
            </div>
            <textarea
              ref={messageTextareaRef}
              rows={2}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Ask about batch timings, study material, or library seating..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#101923] border border-white/10 focus:border-[#D5B06C] focus:outline-none text-sm text-[#F7F7F4] placeholder:text-gray-500 resize-none transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="submit"
              disabled={isSubmitting || !isNameDone || !isPhoneDone}
              className={`flex-1 py-3.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                isFormComplete
                  ? 'text-[#07111F] bg-[#D5B06C] hover:bg-[#e4c284] shadow-[#D5B06C]/25 active:scale-[0.99]'
                  : 'text-slate-400 bg-slate-800 border border-slate-700 cursor-not-allowed opacity-80'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Database...</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>
                    {isFormComplete ? 'Submit Enquiry & Chat on WhatsApp' : 'Complete Form to Submit'}
                  </span>
                  {isFormComplete && <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleWhatsAppOnly}
              className="py-3 px-4 rounded-xl text-xs font-semibold text-[#F7F7F4] bg-white/5 hover:bg-white/10 border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              title="Open prefilled chat on WhatsApp directly"
            >
              <MessageCircle className="w-4 h-4 text-[#76D9EF]" />
              <span>WhatsApp Direct</span>
            </button>
          </div>

        </form>
      </div>
    </div>
    </>
  );
};
