export type AdminTab = 
  | 'overview' 
  | 'enquiries' 
  | 'students' 
  | 'attendance'
  | 'library' 
  | 'fees' 
  | 'toppers' 
  | 'settings';

export type EnquiryStatus = 'New' | 'Contacted' | 'Admitted' | 'Not interested';

export interface AdminEnquiry {
  id: string;
  studentName: string;
  phoneNumber: string;
  program: string;
  message?: string;
  status: EnquiryStatus;
  source?: string;
  createdAt?: unknown; // Firestore Timestamp or Date
}

export type StudentStatus = 'Active' | 'Inactive' | 'Left';

export interface AdminStudent {
  id: string;
  studentName?: string;
  name: string;
  phoneNumber?: string;
  phone: string;
  class?: string;
  parentName?: string;
  parentPhone?: string;
  standard: string; // e.g. "Class 10", "NEET"
  board?: string; // CBSE, State Board, ICSE
  medium?: string; // Semi-English, English, Marathi
  batch: string; // e.g. "Std 10 - Evening"
  joinDate: string; // YYYY-MM-DD
  monthlyFee: number;
  status: StudentStatus;
  feeStatus?: 'Paid' | 'Pending';
  librarySeat?: string;
  attendanceStatus?: 'Present' | 'Absent';
  notes?: string;
  assignedSeatNumber?: number | null;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type SeatShift = 'Morning' | 'Evening' | 'Full day';
export type PaymentStatus = 'Paid' | 'Pending';
export type SeatStatus = 'Occupied' | 'Vacant';
export type StudentClassification = 'Internal Student' | 'Outsider Student';

export interface AdminLibrarySeat {
  id: string; // Seat number as string, e.g. "1", "101"
  seatNumber: number;
  floor: 1 | 2; // Floor 1 (1-100), Floor 2 (101-200)
  studentName?: string;
  phone?: string;
  phoneNumber?: string;
  studentId?: string;
  classification?: StudentClassification; // 'Internal Student' | 'Outsider Student'
  studentClassification?: StudentClassification; // alias
  shift: SeatShift;
  monthlyFee: number;
  paymentStatus: PaymentStatus;
  feeStatus?: PaymentStatus; // alias
  lastPaidMonth?: string; // YYYY-MM
  startDate?: string;
  notes?: string;
  status: SeatStatus;
  updatedAt?: unknown;
}

export type PaymentMode = 'Cash' | 'UPI' | 'Bank Transfer' | 'Other';

export interface AdminFeeRecord {
  id: string; // `${studentId}_${YYYY-MM}`
  studentId: string;
  studentName: string;
  phone: string;
  month: string; // YYYY-MM
  amount: number;
  status: PaymentStatus;
  paidDate?: string;
  paymentMode?: PaymentMode;
  note?: string;
  reminderSentAt?: string;
  reminderCount?: number;
  createdAt?: unknown;
}

export interface AdminTopper {
  id: string;
  name: string;
  standard: string;
  percentage: string; // e.g. "96.4%" or "658/720"
  year: string; // e.g. "2025-2026"
  examName: string; // e.g. "Class 10 SSC Board"
  rank?: string; // e.g. "Rank 1"
  photoUrl?: string;
  quote?: string;
  isVisible: boolean;
  order: number;
  featured?: boolean;
  createdAt?: unknown;
}

export interface ReminderTemplates {
  friendly: string;
  dueDate: string;
  overdue: string;
  libraryRenewal: string;
  paymentReceived: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

export interface AttendanceRecord {
  id: string; // `${date}_${studentId}`
  date: string; // YYYY-MM-DD
  studentId: string;
  studentName: string;
  phoneNumber?: string;
  standard: string; // Class / Category
  batch: string; // Specific Batch
  status: 'Present' | 'Absent';
  markedAt?: unknown;
  notes?: string;
}

export interface MonthlyAttendanceSummary {
  studentId: string;
  studentName: string;
  phoneNumber: string;
  parentName?: string;
  parentPhone?: string;
  standard: string;
  batch: string;
  month: string; // YYYY-MM
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendancePercentage: number;
  statusCategory: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical';
}
