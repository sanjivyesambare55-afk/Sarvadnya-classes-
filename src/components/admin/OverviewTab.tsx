import React from 'react';
import { 
  AdminEnquiry, 
  AdminStudent, 
  AdminLibrarySeat, 
  AdminFeeRecord, 
  AdminTab 
} from './types';
import { ADMIN_CONFIG, buildWhatsAppUrl, formatTimestamp } from './config';
import { 
  Users, 
  MessageSquare, 
  BookOpen, 
  IndianRupee, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  Calendar, 
  CheckCircle2, 
  Phone, 
  MessageCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface OverviewTabProps {
  enquiries: AdminEnquiry[];
  students: AdminStudent[];
  librarySeats: AdminLibrarySeat[];
  feeRecords: AdminFeeRecord[];
  onNavigateTab: (tab: AdminTab) => void;
  onOpenAddStudent?: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  enquiries,
  students,
  librarySeats,
  feeRecords,
  onNavigateTab
}) => {
  const now = new Date();
  const currentDay = now.getDate();
  const feeDueDay = ADMIN_CONFIG.feeDueDay;

  // 1. Fee due countdown calculation
  let daysUntilDue = feeDueDay - currentDay;
  let dueStatus: 'normal' | 'soon' | 'dueToday' | 'overdue' = 'normal';
  if (daysUntilDue < 0) {
    dueStatus = 'overdue';
  } else if (daysUntilDue === 0) {
    dueStatus = 'dueToday';
  } else if (daysUntilDue <= 5) {
    dueStatus = 'soon';
  }

  // 2. Enquiries metrics
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const getEnquiryDate = (e: AdminEnquiry): Date => {
    if (!e.createdAt) return new Date(0);
    if (typeof e.createdAt === 'object' && e.createdAt !== null && 'toDate' in e.createdAt) {
      return (e.createdAt as { toDate: () => Date }).toDate();
    }
    return new Date(e.createdAt as string | number);
  };

  const enquiriesToday = enquiries.filter(e => getEnquiryDate(e) >= oneDayAgo).length;
  const enquiriesThisWeek = enquiries.filter(e => getEnquiryDate(e) >= sevenDaysAgo).length;
  const totalEnquiries = enquiries.length;
  const newUncontacted = enquiries.filter(e => e.status === 'New').length;

  // 3. Students metrics
  const activeStudents = students.filter(s => s.status === 'Active');
  const totalActiveStudents = activeStudents.length;

  // 4. Library seats metrics
  const occupiedSeats = librarySeats.filter(s => s.status === 'Occupied');
  const vacantSeats = librarySeats.filter(s => s.status === 'Vacant');
  const libraryPendingPayments = occupiedSeats.filter(s => s.paymentStatus === 'Pending');

  // 5. Fees metrics (current month)
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Class fee pending: active students who haven't paid this month's fee
  const pendingClassFees = activeStudents.filter(student => {
    const feeDoc = feeRecords.find(f => f.studentId === student.id && f.month === currentMonthStr);
    return !feeDoc || feeDoc.status === 'Pending';
  });

  const totalClassFeePendingAmount = pendingClassFees.reduce((acc, s) => acc + (s.monthlyFee || 0), 0);
  const totalLibraryPendingAmount = libraryPendingPayments.reduce((acc, s) => acc + (s.monthlyFee || 800), 0);

  // Latest 5 enquiries
  const latestEnquiries = [...enquiries].slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* 25th Fee Due Countdown Banner */}
      <div className={`rounded-2xl p-5 sm:p-6 border transition-all ${
        dueStatus === 'overdue'
          ? 'bg-red-950/40 border-red-500/40 text-red-100'
          : dueStatus === 'dueToday'
          ? 'bg-[#ff7a3d]/20 border-[#ff7a3d]/60 text-orange-100'
          : dueStatus === 'soon'
          ? 'bg-[#ff7a3d]/15 border-[#ff7a3d]/40 text-orange-200'
          : 'bg-[#6c3df4]/10 border-[#6c3df4]/30 text-purple-100'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              dueStatus === 'overdue' 
                ? 'bg-red-500/20 text-red-400' 
                : dueStatus === 'dueToday' || dueStatus === 'soon'
                ? 'bg-[#ff7a3d]/20 text-[#ff7a3d]' 
                : 'bg-[#6c3df4]/20 text-[#6c3df4]'
            }`}>
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider opacity-80">
                  Monthly Fee Cycle · 25th of Every Month
                </span>
                {dueStatus === 'overdue' && (
                  <span className="text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">
                    OVERDUE
                  </span>
                )}
                {dueStatus === 'dueToday' && (
                  <span className="text-[10px] bg-[#ff7a3d] text-slate-950 font-bold px-2 py-0.5 rounded-full">
                    DUE TODAY
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display mt-0.5">
                {dueStatus === 'overdue' && `${Math.abs(daysUntilDue)} day(s) Past Fee Due Date (25th)`}
                {dueStatus === 'dueToday' && `Today is the 25th: Fee Collection Day`}
                {dueStatus === 'soon' && `${daysUntilDue} day(s) until Fee Due Date (25th)`}
                {dueStatus === 'normal' && `${daysUntilDue} days remaining until 25th Fee Due Date`}
              </h2>
              <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
                {pendingClassFees.length} students have pending tuition fees ({ADMIN_CONFIG.currencySymbol}{totalClassFeePendingAmount.toLocaleString('en-IN')}) and {libraryPendingPayments.length} library desk subscriptions are due.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('fees')}
            className="self-start sm:self-center px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-950 hover:bg-slate-100 flex items-center gap-2 shrink-0 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>Open WhatsApp Reminders</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Website Enquiries */}
        <div 
          onClick={() => onNavigateTab('enquiries')}
          className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-[#6c3df4]/50 transition-all cursor-pointer shadow-lg hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Enquiries
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#6c3df4]/15 text-[#6c3df4] flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-display">
              {totalEnquiries}
            </span>
            {newUncontacted > 0 && (
              <span className="text-xs font-bold text-[#ff7a3d] bg-[#ff7a3d]/15 px-2 py-0.5 rounded-full">
                {newUncontacted} New
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>+{enquiriesToday} today · +{enquiriesThisWeek} this week</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
          </p>
        </div>

        {/* Metric 2: Active Students */}
        <div 
          onClick={() => onNavigateTab('students')}
          className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-[#14b8a6]/50 transition-all cursor-pointer shadow-lg hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#14b8a6]/15 text-[#14b8a6] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-display">
              {totalActiveStudents}
            </span>
            <span className="text-xs text-slate-400">
              of {students.length} enrolled
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Across 9 batches in Nagpur</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
          </p>
        </div>

        {/* Metric 3: Library Seats */}
        <div 
          onClick={() => onNavigateTab('library')}
          className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer shadow-lg hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Library Desks (7AM-10PM)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-display">
              {occupiedSeats.length}
            </span>
            <span className="text-xs text-slate-400">
              / {librarySeats.length || ADMIN_CONFIG.defaultTotalSeats} occupied
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span className="text-emerald-400 font-medium">{vacantSeats.length} vacant seats available</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
          </p>
        </div>

        {/* Metric 4: Monthly Fee Dues */}
        <div 
          onClick={() => onNavigateTab('fees')}
          className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-[#ff7a3d]/50 transition-all cursor-pointer shadow-lg hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Fees ({now.toLocaleString('default', { month: 'short' })})
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#ff7a3d]/15 text-[#ff7a3d] flex items-center justify-center group-hover:scale-105 transition-transform">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#ff7a3d] font-display">
              {ADMIN_CONFIG.currencySymbol}{(totalClassFeePendingAmount + totalLibraryPendingAmount).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>{pendingClassFees.length} class + {libraryPendingPayments.length} library pending</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
          </p>
        </div>

      </div>

      {/* Quick Action Bar + Latest Leads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Website Inquiries (5 latest) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#6c3df4]" />
                <span>Latest Website Enquiries</span>
              </h3>
              <p className="text-xs text-slate-400">Recent student admission and library seat inquiries</p>
            </div>
            <button
              onClick={() => onNavigateTab('enquiries')}
              className="text-xs font-semibold text-[#6c3df4] hover:text-[#7f52ff] flex items-center gap-1 transition-colors"
            >
              <span>View All ({totalEnquiries})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {latestEnquiries.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No enquiries recorded yet. Submissions from the website will appear here in real-time.
            </div>
          ) : (
            <div className="space-y-3">
              {latestEnquiries.map((enq) => {
                const isNew = enq.status === 'New';
                const whatsappMsg = `Hello ${enq.studentName}, thank you for contacting ${ADMIN_CONFIG.className} regarding ${enq.program}. We would be happy to share batch schedules and guide you with enrollment.`;
                const whatsappUrl = buildWhatsAppUrl(enq.phoneNumber, whatsappMsg);

                return (
                  <div
                    key={enq.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">
                          {enq.studentName}
                        </span>
                        <span className="text-[11px] font-mono text-[#14b8a6] bg-[#14b8a6]/10 px-2 py-0.5 rounded border border-[#14b8a6]/20">
                          {enq.program}
                        </span>
                        {isNew && (
                          <span className="text-[10px] uppercase font-bold text-[#ff7a3d] bg-[#ff7a3d]/15 px-1.5 py-0.5 rounded">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Ph: {enq.phoneNumber}</span>
                        <span>·</span>
                        <span>{formatTimestamp(enq.createdAt)}</span>
                      </div>
                      {enq.message && (
                        <p className="text-xs text-slate-300 italic line-clamp-1">
                          &ldquo;{enq.message}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${enq.phoneNumber}`}
                        className="p-2 rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                        title="Call student"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Institute Snapshot & Short Links */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Quick Nav Shortcuts */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => onNavigateTab('students')}
                className="w-full text-left p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-[#6c3df4] transition-colors flex items-center justify-between text-xs text-slate-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#6c3df4]" />
                  <span className="font-semibold">Manage Student Roster</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => onNavigateTab('attendance')}
                className="w-full text-left p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-[#14b8a6] transition-colors flex items-center justify-between text-xs text-slate-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#14b8a6]" />
                  <span className="font-semibold">Daily Attendance & Monthly Report</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => onNavigateTab('library')}
                className="w-full text-left p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 transition-colors flex items-center justify-between text-xs text-slate-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">Library Seat Matrix ({occupiedSeats.length}/{librarySeats.length || ADMIN_CONFIG.defaultTotalSeats})</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => onNavigateTab('fees')}
                className="w-full text-left p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-[#ff7a3d] transition-colors flex items-center justify-between text-xs text-slate-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <IndianRupee className="w-4 h-4 text-[#ff7a3d]" />
                  <span className="font-semibold">25th Fee Reminders & Broadcast</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => onNavigateTab('toppers')}
                className="w-full text-left p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500 transition-colors flex items-center justify-between text-xs text-slate-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span className="font-semibold">Update Website Toppers Wall</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Institute Info Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-xs space-y-2 text-slate-400">
            <p className="font-bold text-white text-sm">{ADMIN_CONFIG.className}</p>
            <p>{ADMIN_CONFIG.classAddress}</p>
            <p>Admin Helpline: {ADMIN_CONFIG.classPhoneFormatted}</p>
            <p className="pt-2 text-[11px] text-slate-500 border-t border-slate-800/80">
              Live synchronized Firestore database. Realtime listeners active.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
