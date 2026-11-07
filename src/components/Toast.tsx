import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X, 
  ExternalLink,
  MessageCircle,
  Database,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { BUSINESS_INFO } from '../constants/data';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastProps {
  isOpen: boolean;
  type?: ToastType;
  title: string;
  message: string;
  studentName?: string;
  program?: string;
  phoneNumber?: string;
  duration?: number; // ms, default 5000
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Toast: React.FC<ToastProps> = ({
  isOpen,
  type = 'success',
  title,
  message,
  studentName,
  program,
  phoneNumber,
  duration = 5000,
  onClose,
  action
}) => {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle auto-dismiss and progress bar
  useEffect(() => {
    if (!isOpen) {
      setProgress(100);
      setIsExiting(false);
      return;
    }

    remainingTimeRef.current = duration;
    startTimeRef.current = Date.now();
    setProgress(100);
    setIsExiting(false);

    const updateInterval = 50; // update progress every 50ms

    intervalRef.current = setInterval(() => {
      if (!isHovered) {
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - updateInterval);
        const percent = (remainingTimeRef.current / duration) * 100;
        setProgress(percent);

        if (remainingTimeRef.current <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          handleTriggerClose();
        }
      }
    }, updateInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, duration, isHovered]);

  const handleTriggerClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      onClose();
    }, 250);
  };

  if (!mounted || !isOpen) return null;

  const typeConfig = {
    success: {
      borderColor: 'border-emerald-500/40',
      glowColor: 'shadow-emerald-500/10',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      progressBarBg: 'bg-gradient-to-r from-emerald-400 via-[#D5B06C] to-emerald-300',
      Icon: CheckCircle2,
      label: 'Submission Success'
    },
    info: {
      borderColor: 'border-[#76D9EF]/40',
      glowColor: 'shadow-cyan-500/10',
      badgeBg: 'bg-[#76D9EF]/15 text-[#76D9EF] border-[#76D9EF]/30',
      iconBg: 'bg-[#76D9EF]/20 text-[#76D9EF] border border-[#76D9EF]/30',
      progressBarBg: 'bg-gradient-to-r from-[#76D9EF] to-[#D5B06C]',
      Icon: Info,
      label: 'Notification'
    },
    warning: {
      borderColor: 'border-amber-500/40',
      glowColor: 'shadow-amber-500/10',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      progressBarBg: 'bg-gradient-to-r from-amber-400 to-[#D5B06C]',
      Icon: AlertCircle,
      label: 'Notice'
    },
    error: {
      borderColor: 'border-rose-500/40',
      glowColor: 'shadow-rose-500/10',
      badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      progressBarBg: 'bg-gradient-to-r from-rose-500 to-rose-400',
      Icon: AlertCircle,
      label: 'Error'
    }
  };

  const currentConfig = typeConfig[type];
  const { Icon } = currentConfig;

  const content = (
    <aside
      role="alert"
      aria-live="polite"
      className="fixed top-5 right-5 sm:top-6 sm:right-6 z-[9999] max-w-md w-[calc(100%-2.5rem)] pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`relative overflow-hidden rounded-2xl bg-[#07111F]/95 backdrop-blur-md border ${currentConfig.borderColor} shadow-2xl ${currentConfig.glowColor} transition-all duration-300 transform ${
          isExiting 
            ? 'opacity-0 translate-y-[-8px] scale-95' 
            : 'opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-top-4'
        }`}
      >
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D5B06C]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="p-4 sm:p-5 relative z-10">
          
          {/* Header Row: Badge, Status, and Close Button */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold border ${currentConfig.badgeBg}`}>
                <Sparkles className="w-2.5 h-2.5" />
                <span>{currentConfig.label}</span>
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-[#76D9EF]">
                <Database className="w-3 h-3 text-[#76D9EF]" />
                <span>Firestore Synced</span>
              </span>
            </div>

            <button
              onClick={handleTriggerClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-xl shrink-0 ${currentConfig.iconBg}`}>
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[#F7F7F4] leading-snug font-display">
                {title}
              </h4>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                {message}
              </p>

              {/* Student Application Metadata Pill/Card */}
              {(studentName || program || phoneNumber) && (
                <div className="mt-3 p-2.5 rounded-xl bg-[#101923]/90 border border-white/10 text-xs space-y-1 font-mono">
                  {studentName && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-[#D5B06C]" />
                        <span>Student:</span>
                      </span>
                      <span className="font-semibold text-white truncate max-w-[200px]">
                        {studentName}
                      </span>
                    </div>
                  )}

                  {program && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 text-[11px]">Program:</span>
                      <span className="text-[#D5B06C] font-semibold">
                        {program}
                      </span>
                    </div>
                  )}

                  {phoneNumber && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 text-[11px]">Contact:</span>
                      <span className="text-[#76D9EF]">
                        {phoneNumber}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Direct Quick WhatsApp Action if needed */}
              <div className="mt-3 flex items-center justify-between gap-2 text-[11px]">
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat directly on WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {action && (
                  <button
                    onClick={action.onClick}
                    className="font-semibold text-[#D5B06C] hover:underline cursor-pointer"
                  >
                    {action.label}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hairline Progress Timer Bar */}
        <div className="h-1 w-full bg-slate-800/80 overflow-hidden">
          <div 
            className={`h-full transition-all duration-75 ease-linear ${currentConfig.progressBarBg}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </aside>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
};
