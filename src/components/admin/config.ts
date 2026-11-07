import { ReminderTemplates } from './types';

export const ADMIN_CONFIG = {
  className: "Sarvadnya Tuition Classes",
  classTagline: "Tuition Classes & Dedicated Study Library",
  classPhone: "7020035514",
  classPhoneFormatted: "+91 70200 35514",
  classAddress: "01 Sarvashree Nagar, Nagpur, Maharashtra",
  feeDueDay: 25,
  defaultTotalSeats: 200,
  floor1SeatsCount: 100,
  floor2SeatsCount: 100,
  currencySymbol: "₹",
  whatsappCountryCode: "91",
  allowedPrograms: [
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12",
    "NEET Batch",
    "JEE Batch",
    "Library Seating",
    "General Enquiry"
  ],
  standards: [
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12",
    "NEET Batch",
    "JEE Batch",
    "Library Only"
  ],
  batches: [
    "Std 9 - Morning",
    "Std 9 - Evening",
    "Std 10 - Morning",
    "Std 10 - Evening",
    "Std 11 - Science Regular",
    "Std 12 - Board Mastery",
    "NEET - Intensive Medical",
    "JEE - Advanced Engineering",
    "Library 7AM-10PM Shift"
  ],
  defaultMonthlyFees: {
    "Class 9": 2000,
    "Class 10": 2500,
    "Class 11": 3500,
    "Class 12": 4000,
    "NEET Batch": 4500,
    "JEE Batch": 4500,
    "Library Seating": 800
  }
};

export const DEFAULT_REMINDER_TEMPLATES: ReminderTemplates = {
  friendly: "Namaste {parentName}! Gentle reminder that the monthly tuition fee of {amount} for {studentName} ({className}) for {month} is upcoming and due on {customDueDate}. Kindly process at your convenience. Thank you!",
  dueDate: "Namaste {parentName}! Today is the {dueDate}th, the monthly fee due date for {studentName} at {className}. Amount due for {month}: {amount}. Due date: {customDueDate}. You can pay via UPI to 7020035514 or cash at our Sarvashree Nagar desk.",
  overdue: "Namaste {parentName}! Monthly tuition fee of {amount} for {studentName} for the month of {month} was due on {customDueDate} and is now overdue. Kindly arrange payment at the earliest. For queries, call 7020035514.",
  libraryRenewal: "Hello {studentName}! Your library study desk (Seat #{seatNumber}) renewal fee of {amount} for {month} is due on {customDueDate}. Kindly renew to retain your reserved carrel at Sarvadnya Library.",
  paymentReceived: "Dear {parentName}, we have received payment of {amount} for {studentName} for {month}. Thank you for partnering with Sarvadnya Tuition Classes!"
};

/**
 * Formats a given due date string/day and determines ordinals and full month representations.
 * Handles:
 * - Empty/undefined: falls back to defaultDay (e.g. 25)
 * - "YYYY-MM-DD" e.g. "2026-11-28" -> day: 28, ordinal: "28th", formattedFull: "28th November"
 * - Numeric string e.g. "28" -> day: 28, ordinal: "28th", formattedFull: "28th"
 * - Custom string e.g. "28th Nov"
 */
export function formatDueDateHelper(dateInput: string | undefined, defaultDay: number = 25) {
  const getOrdinal = (n: number) => {
    if (n >= 11 && n <= 13) return `${n}th`;
    switch (n % 10) {
      case 1: return `${n}st`;
      case 2: return `${n}nd`;
      case 3: return `${n}rd`;
      default: return `${n}th`;
    }
  };

  if (!dateInput || !dateInput.trim()) {
    const defaultOrdinal = getOrdinal(defaultDay);
    return {
      dayNumber: String(defaultDay),
      dayOrdinal: defaultOrdinal,
      formattedFull: defaultOrdinal,
      isCustom: false
    };
  }

  const trimmed = dateInput.trim();

  // If it's a date string like "YYYY-MM-DD" e.g. "2026-11-28"
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [yearStr, monthStr, dayStr] = trimmed.split('-');
    const day = parseInt(dayStr, 10);
    const dateObj = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, day);
    const ordinal = getOrdinal(day);
    const monthName = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleString('en-IN', { month: 'long' })
      : '';
    const formattedFull = monthName ? `${ordinal} ${monthName}` : ordinal;

    return {
      dayNumber: String(day),
      dayOrdinal: ordinal,
      formattedFull,
      isCustom: true
    };
  }

  // If numeric string like "28"
  if (/^\d{1,2}$/.test(trimmed)) {
    const day = parseInt(trimmed, 10);
    const ordinal = getOrdinal(day);
    return {
      dayNumber: String(day),
      dayOrdinal: ordinal,
      formattedFull: ordinal,
      isCustom: true
    };
  }

  // Custom text string e.g. "28th Nov", "28th", "End of month"
  const digitsMatch = trimmed.match(/\d{1,2}/);
  const dayNum = digitsMatch ? digitsMatch[0] : String(defaultDay);
  return {
    dayNumber: dayNum,
    dayOrdinal: trimmed,
    formattedFull: trimmed,
    isCustom: true
  };
}

/**
 * Normalizes phone numbers: strips spaces, +91, leading 0, non-digit chars
 * Returns 10-digit phone number if valid, or clean digits.
 */
export function normalizePhone(input: string): string {
  if (!input) return '';
  const digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

/**
 * Constructs a clean WhatsApp click-to-chat URL
 */
export function buildWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = normalizePhone(phone);
  const countryCode = ADMIN_CONFIG.whatsappCountryCode;
  return `https://wa.me/${countryCode}${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Plays a soft, non-intrusive notification chime using Web Audio API
 */
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play warm dual-tone chime (E5 -> G#5)
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(830.61, now + 0.12); // G#5
    gain2.gain.setValueAtTime(0.09, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

/**
 * Formats a Firestore timestamp or date object into a human readable string
 */
export function formatTimestamp(raw: unknown): string {
  if (!raw) return 'Recently';
  try {
    if (typeof raw === 'object' && raw !== null && 'toDate' in raw && typeof (raw as { toDate: () => Date }).toDate === 'function') {
      return (raw as { toDate: () => Date }).toDate().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    if (raw instanceof Date) {
      return raw.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    if (typeof raw === 'string' || typeof raw === 'number') {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
  } catch {
    return 'Recently';
  }
  return 'Recently';
}

/**
 * Exports JSON array to browser CSV download
 */
export function exportToCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(field => {
        const val = row[field];
        const stringVal = val === null || val === undefined ? '' : String(val);
        // Escape quotes
        return `"${stringVal.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
