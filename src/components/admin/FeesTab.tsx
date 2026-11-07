import React, { useState } from 'react';
import { 
  setDoc, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  AdminStudent, 
  AdminLibrarySeat, 
  AdminFeeRecord, 
  PaymentMode, 
  PaymentStatus, 
  ReminderTemplates 
} from './types';
import { 
  ADMIN_CONFIG, 
  DEFAULT_REMINDER_TEMPLATES, 
  buildWhatsAppUrl, 
  exportToCSV,
  formatDueDateHelper 
} from './config';
import { 
  IndianRupee, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MessageCircle, 
  Send, 
  Download, 
  Check, 
  X, 
  Loader2, 
  Sparkles, 
  Eye, 
  ChevronRight, 
  ListOrdered,
  Layers,
  BookOpen,
  Edit2
} from 'lucide-react';

interface FeesTabProps {
  students: AdminStudent[];
  librarySeats: AdminLibrarySeat[];
  feeRecords: AdminFeeRecord[];
  templates: ReminderTemplates;
  onUpdateTemplates?: (templates: ReminderTemplates) => void;
  isLoading: boolean;
  onShowToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const FeesTab: React.FC<FeesTabProps> = ({
  students,
  librarySeats,
  feeRecords,
  templates,
  isLoading,
  onShowToast
}) => {
  const now = new Date();
  const currentMonthInitial = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthInitial);
  
  // Active sub-section: 'class' | 'library' | 'templates'
  const [activeSection, setActiveSection] = useState<'class' | 'library' | 'templates'>('class');

  // Mark Paid Modal State
  const [payingStudent, setPayingStudent] = useState<{
    id: string;
    studentId: string;
    studentName: string;
    phone: string;
    amount: number;
    type: 'class' | 'library';
    seatNumber?: number;
  } | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  // Broadcast Reminder Queue state
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastQueue, setBroadcastQueue] = useState<{
    studentId: string;
    studentName: string;
    parentName?: string;
    phone: string;
    amount: number;
    program: string;
  }[]>([]);
  const [broadcastIndex, setBroadcastIndex] = useState(0);

  // Custom due date states
  const [broadcastCustomDueDate, setBroadcastCustomDueDate] = useState<string>('');
  const [previewCustomDueDate, setPreviewCustomDueDate] = useState<string>('');

  // Template chosen for reminder preview
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<keyof ReminderTemplates>('dueDate');
  const [previewStudentId, setPreviewStudentId] = useState<string>('');

  // 1. Fee due countdown calculation for selected month
  const currentDay = now.getDate();
  const feeDueDay = ADMIN_CONFIG.feeDueDay;
  const isSelectedCurrentMonth = selectedMonth === currentMonthInitial;
  let daysUntilDue = feeDueDay - currentDay;
  let dueStatus: 'normal' | 'soon' | 'dueToday' | 'overdue' = 'normal';

  if (isSelectedCurrentMonth) {
    if (daysUntilDue < 0) dueStatus = 'overdue';
    else if (daysUntilDue === 0) dueStatus = 'dueToday';
    else if (daysUntilDue <= 5) dueStatus = 'soon';
  } else {
    // If historical month, it's overdue
    dueStatus = 'overdue';
  }

  // Active students list for tuition fees
  const activeStudents = students.filter(s => s.status === 'Active');

  // Occupied library seats
  const occupiedSeats = librarySeats.filter(s => s.status === 'Occupied');

  // Compute tuition fee metrics for selected month
  const studentFeeItems = activeStudents.map(student => {
    const feeDocId = `${student.id}_${selectedMonth}`;
    const record = feeRecords.find(f => f.studentId === student.id && f.month === selectedMonth);
    const isPaid = record?.status === 'Paid';
    const amount = record?.amount || student.monthlyFee || 2500;

    return {
      student,
      feeDocId,
      record,
      isPaid,
      amount
    };
  });

  const classTotalExpected = studentFeeItems.reduce((acc, item) => acc + item.amount, 0);
  const classTotalCollected = studentFeeItems.filter(item => item.isPaid).reduce((acc, item) => acc + item.amount, 0);
  const classTotalPending = classTotalExpected - classTotalCollected;

  // Compute library fee metrics
  const libraryFeeItems = occupiedSeats.map(seat => {
    const isPaid = seat.lastPaidMonth === selectedMonth && seat.paymentStatus === 'Paid';
    const amount = seat.monthlyFee || 800;
    return {
      seat,
      isPaid,
      amount
    };
  });

  const libraryTotalExpected = libraryFeeItems.reduce((acc, item) => acc + item.amount, 0);
  const libraryTotalCollected = libraryFeeItems.filter(item => item.isPaid).reduce((acc, item) => acc + item.amount, 0);
  const libraryTotalPending = libraryTotalExpected - libraryTotalCollected;

  // Compile Reminder Message Helper with dynamic {customDueDate} and custom {dueDate} replacement
  const compileMessage = (templateKey: keyof ReminderTemplates, data: {
    studentName: string;
    parentName?: string;
    amount: number;
    seatNumber?: number;
    month?: string;
    customDueDate?: string;
  }) => {
    const rawTemplate = templates[templateKey] || DEFAULT_REMINDER_TEMPLATES[templateKey];
    const monthDisplay = new Date(`${selectedMonth}-01`).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

    // Format custom or default due date info
    const dueInfo = formatDueDateHelper(data.customDueDate, ADMIN_CONFIG.feeDueDay);

    let message = rawTemplate
      .replace(/{studentName}/g, data.studentName)
      .replace(/{parentName}/g, data.parentName || data.studentName)
      .replace(/{amount}/g, `${ADMIN_CONFIG.currencySymbol}${data.amount}`)
      .replace(/{month}/g, monthDisplay)
      .replace(/{seatNumber}/g, String(data.seatNumber || ''))
      .replace(/{className}/g, ADMIN_CONFIG.className);

    // Support dynamic variable tag {customDueDate}:
    // When custom due date is selected, replaces with formatted custom date e.g. "28th November" (or "28th")
    const customDueDisplay = dueInfo.isCustom ? dueInfo.formattedFull : dueInfo.dayOrdinal;
    message = message.replace(/{customDueDate}/g, customDueDisplay);

    // Dynamic variable tag {dueDate}:
    // If a custom due date is selected, it replaces the default 25th date in the generated WhatsApp message text.
    if (dueInfo.isCustom) {
      // If template contains "{dueDate}th", replace whole phrase with ordinal e.g. "28th" to prevent "28thth"
      message = message
        .replace(/{dueDate}th/gi, dueInfo.dayOrdinal)
        .replace(/{dueDate}/g, dueInfo.dayOrdinal);
    } else {
      message = message
        .replace(/{dueDate}th/gi, `${dueInfo.dayNumber}th`)
        .replace(/{dueDate}/g, dueInfo.dayNumber);
    }

    return message;
  };

  // Mark fee as Paid
  const handleConfirmMarkPaid = async () => {
    if (!payingStudent) return;
    setIsMarkingPaid(true);

    try {
      if (payingStudent.type === 'class') {
        const feeDocRef = doc(db, 'fees', `${payingStudent.studentId}_${selectedMonth}`);
        await setDoc(feeDocRef, {
          studentId: payingStudent.studentId,
          studentName: payingStudent.studentName,
          phone: payingStudent.phone,
          month: selectedMonth,
          amount: payingStudent.amount,
          status: 'Paid',
          paidDate: new Date().toISOString().slice(0, 10),
          paymentMode,
          updatedAt: serverTimestamp()
        }, { merge: true });

        onShowToast('success', `Marked ${ADMIN_CONFIG.currencySymbol}${payingStudent.amount} as Paid for ${payingStudent.studentName}`);
      } else {
        // Library seat
        const seatRef = doc(db, 'librarySeats', String(payingStudent.seatNumber));
        await updateDoc(seatRef, {
          paymentStatus: 'Paid',
          lastPaidMonth: selectedMonth,
          updatedAt: serverTimestamp()
        });

        onShowToast('success', `Seat #${payingStudent.seatNumber} subscription marked as Paid!`);
      }
      setPayingStudent(null);
    } catch (err) {
      console.error('Error recording payment:', err);
      onShowToast('error', 'Failed to record payment in database.');
    } finally {
      setIsMarkingPaid(false);
    }
  };

  // Send single reminder
  const handleSendReminder = async (item: {
    studentId: string;
    studentName: string;
    parentName?: string;
    phone: string;
    amount: number;
    seatNumber?: number;
    customDueDate?: string;
  }) => {
    const text = compileMessage(selectedTemplateKey, {
      studentName: item.studentName,
      parentName: item.parentName,
      amount: item.amount,
      seatNumber: item.seatNumber,
      customDueDate: item.customDueDate || broadcastCustomDueDate
    });

    const url = buildWhatsAppUrl(item.phone, text);
    window.open(url, '_blank');

    // Update reminder tracking in fees collection
    try {
      const feeDocRef = doc(db, 'fees', `${item.studentId}_${selectedMonth}`);
      const currentDoc = feeRecords.find(f => f.studentId === item.studentId && f.month === selectedMonth);
      const prevCount = currentDoc?.reminderCount || 0;

      await setDoc(feeDocRef, {
        studentId: item.studentId,
        studentName: item.studentName,
        phone: item.phone,
        month: selectedMonth,
        amount: item.amount,
        status: 'Pending',
        reminderSentAt: new Date().toISOString(),
        reminderCount: prevCount + 1,
        updatedAt: serverTimestamp()
      }, { merge: true });

      onShowToast('info', `Reminder logged for ${item.studentName}`);
    } catch (err) {
      console.warn('Could not update reminder count log:', err);
    }
  };

  // Start Broadcast Queue for all pending students
  const handleStartBroadcast = () => {
    const pendingStudentsList = studentFeeItems
      .filter(i => !i.isPaid)
      .map(i => ({
        studentId: i.student.id,
        studentName: i.student.name,
        parentName: i.student.parentName,
        phone: i.student.parentPhone || i.student.phone,
        amount: i.amount,
        program: i.student.batch
      }));

    if (pendingStudentsList.length === 0) {
      onShowToast('info', 'No pending fee students for this month!');
      return;
    }

    setBroadcastQueue(pendingStudentsList);
    setBroadcastIndex(0);
    setIsBroadcastOpen(true);
  };

  // Next in Broadcast
  const handleBroadcastSendNext = async () => {
    const currentItem = broadcastQueue[broadcastIndex];
    if (!currentItem) return;

    await handleSendReminder({
      ...currentItem,
      customDueDate: broadcastCustomDueDate
    });

    if (broadcastIndex + 1 < broadcastQueue.length) {
      setBroadcastIndex(prev => prev + 1);
    } else {
      onShowToast('success', 'Completed all pending reminders in the broadcast queue!');
      setIsBroadcastOpen(false);
    }
  };

  // Preview target student
  const previewStudent = students.find(s => s.id === previewStudentId) || activeStudents[0];

  return (
    <div className="space-y-6">
      
      {/* Top Header & Month Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white font-display">Fees & Reminders (25th Cycle)</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#ff7a3d]/15 text-[#ff7a3d] font-semibold border border-[#ff7a3d]/30">
              Due Date: 25th
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Track tuition fee collections, library subscriptions, and dispatch personalized WhatsApp reminders
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none"
            />
          </div>

          {/* Broadcast Reminders Trigger */}
          <button
            onClick={handleStartBroadcast}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-[#ff7a3d] to-[#ffa06d] hover:brightness-105 flex items-center gap-1.5 shadow-lg shadow-[#ff7a3d]/25 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast to Pending ({studentFeeItems.filter(i => !i.isPaid).length})</span>
          </button>
        </div>
      </div>

      {/* 25th Fee Due Date Notification Banner */}
      <div className={`p-5 rounded-2xl border transition-all ${
        dueStatus === 'overdue'
          ? 'bg-red-950/40 border-red-500/40 text-red-100'
          : dueStatus === 'dueToday'
          ? 'bg-[#ff7a3d]/20 border-[#ff7a3d]/60 text-orange-100'
          : dueStatus === 'soon'
          ? 'bg-[#ff7a3d]/15 border-[#ff7a3d]/40 text-orange-200'
          : 'bg-[#6c3df4]/10 border-[#6c3df4]/30 text-purple-100'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-current" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display">
                {dueStatus === 'overdue' && `Overdue Fee Collection Notice`}
                {dueStatus === 'dueToday' && `Today is the 25th: Fee Collection Day`}
                {dueStatus === 'soon' && `${daysUntilDue} Days Left Until 25th Fee Due Date`}
                {dueStatus === 'normal' && `${daysUntilDue} Days Until the 25th Monthly Fee Cycle`}
              </h3>
              <p className="text-xs opacity-80 mt-0.5">
                Target collection: {ADMIN_CONFIG.currencySymbol}{(classTotalExpected + libraryTotalExpected).toLocaleString('en-IN')}. Collected so far: {ADMIN_CONFIG.currencySymbol}{(classTotalCollected + libraryTotalCollected).toLocaleString('en-IN')}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-lg bg-black/20 border border-white/10 font-bold">
              Pending: {ADMIN_CONFIG.currencySymbol}{(classTotalPending + libraryTotalPending).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSection('class')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeSection === 'class'
              ? 'bg-[#6c3df4] text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <IndianRupee className="w-3.5 h-3.5" />
          <span>Classroom Tuition Fees</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/30">
            {studentFeeItems.filter(i => !i.isPaid).length} Pending
          </span>
        </button>

        <button
          onClick={() => setActiveSection('library')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeSection === 'library'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Library Desk Subscriptions</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/30">
            {libraryFeeItems.filter(i => !i.isPaid).length} Pending
          </span>
        </button>

        <button
          onClick={() => setActiveSection('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeSection === 'templates'
              ? 'bg-[#14b8a6] text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp Reminder Templates</span>
        </button>
      </div>

      {/* SECTION 1: CLASSROOM TUITION FEES */}
      {activeSection === 'class' && (
        <div className="space-y-4">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400">Total Expected</span>
              <div className="text-xl font-bold text-white font-mono mt-0.5">
                {ADMIN_CONFIG.currencySymbol}{classTotalExpected.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-emerald-400">Collected ({selectedMonth})</span>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                {ADMIN_CONFIG.currencySymbol}{classTotalCollected.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-[#ff7a3d]">Pending Amount</span>
              <div className="text-xl font-bold text-[#ff7a3d] font-mono mt-0.5">
                {ADMIN_CONFIG.currencySymbol}{classTotalPending.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Pending & Paid Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Batch</th>
                    <th className="p-4">Monthly Fee</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Reminder Tracking</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {studentFeeItems.map(({ student, isPaid, amount, record }) => (
                    <tr key={student.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{student.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{student.phone}</div>
                      </td>
                      <td className="p-4 text-slate-300">
                        {student.batch}
                      </td>
                      <td className="p-4 font-mono font-bold text-white">
                        {ADMIN_CONFIG.currencySymbol}{amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                          isPaid 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-[#ff7a3d]/20 text-[#ff7a3d] border border-[#ff7a3d]/30'
                        }`}>
                          {isPaid ? `PAID (${record?.paymentMode || 'Cash'})` : 'PENDING'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-[11px]">
                        {record?.reminderCount ? (
                          <span className="text-[#14b8a6]">
                            Sent {record.reminderCount}x (last: {new Date(record.reminderSentAt || '').toLocaleDateString('en-IN')})
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">No reminder sent</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isPaid ? (
                            <>
                              <button
                                onClick={() => handleSendReminder({
                                  studentId: student.id,
                                  studentName: student.name,
                                  parentName: student.parentName,
                                  phone: student.parentPhone || student.phone,
                                  amount
                                })}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="Open WhatsApp reminder"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                <span>Remind</span>
                              </button>

                              <button
                                onClick={() => setPayingStudent({
                                  id: `${student.id}_${selectedMonth}`,
                                  studentId: student.id,
                                  studentName: student.name,
                                  phone: student.phone,
                                  amount,
                                  type: 'class'
                                })}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#6c3df4] hover:bg-[#5b2ce3] transition-colors cursor-pointer"
                              >
                                Mark Paid
                              </button>
                            </>
                          ) : (
                            <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Received</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SECTION 2: LIBRARY DESK SUBSCRIPTIONS */}
      {activeSection === 'library' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400">Total Expected</span>
              <div className="text-xl font-bold text-white font-mono mt-0.5">
                {ADMIN_CONFIG.currencySymbol}{libraryTotalExpected.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-emerald-400">Collected ({selectedMonth})</span>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                {ADMIN_CONFIG.currencySymbol}{libraryTotalCollected.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-amber-400">Pending Subscriptions</span>
              <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">
                {ADMIN_CONFIG.currencySymbol}{libraryTotalPending.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="p-4">Seat #</th>
                    <th className="p-4">Student Member</th>
                    <th className="p-4">Shift</th>
                    <th className="p-4">Monthly Fee</th>
                    <th className="p-4">Payment Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {libraryFeeItems.map(({ seat, isPaid, amount }) => (
                    <tr key={seat.seatNumber} className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-white">#{seat.seatNumber}</td>
                      <td className="p-4">
                        <div className="font-bold text-white">{seat.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{seat.phone}</div>
                      </td>
                      <td className="p-4 text-slate-300">{seat.shift}</td>
                      <td className="p-4 font-mono font-bold text-white">
                        {ADMIN_CONFIG.currencySymbol}{amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                          isPaid 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {isPaid ? 'PAID' : 'PENDING'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isPaid ? (
                            <>
                              <button
                                onClick={() => handleSendReminder({
                                  studentId: seat.studentId || `seat_${seat.seatNumber}`,
                                  studentName: seat.studentName || 'Member',
                                  phone: seat.phone || '',
                                  amount,
                                  seatNumber: seat.seatNumber
                                })}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                <span>Remind</span>
                              </button>

                              <button
                                onClick={() => setPayingStudent({
                                  id: `library_${seat.seatNumber}_${selectedMonth}`,
                                  studentId: seat.studentId || `seat_${seat.seatNumber}`,
                                  studentName: seat.studentName || 'Member',
                                  phone: seat.phone || '',
                                  amount,
                                  type: 'library',
                                  seatNumber: seat.seatNumber
                                })}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors cursor-pointer"
                              >
                                Mark Paid
                              </button>
                            </>
                          ) : (
                            <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Paid for {selectedMonth}</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: WHATSAPP TEMPLATES & LIVE PREVIEW */}
      {activeSection === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Template Selector & Editor */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#14b8a6]" />
              <span>Reminder WhatsApp Templates</span>
            </h3>
            <p className="text-xs text-slate-400">
              Customize automated wording for pre-due, due date, overdue, and library renewals.
            </p>

            <div className="space-y-2">
              {[
                { key: 'friendly' as const, label: '1. Friendly Reminder (Before 25th)' },
                { key: 'dueDate' as const, label: '2. Due-Date Notice (On the 25th)' },
                { key: 'overdue' as const, label: '3. Overdue Notice (After the 25th)' },
                { key: 'libraryRenewal' as const, label: '4. Library Desk Subscription Renewal' },
                { key: 'paymentReceived' as const, label: '5. Payment Received Thank-You' }
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setSelectedTemplateKey(t.key)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    selectedTemplateKey === t.key
                      ? 'bg-[#6c3df4]/15 border-[#6c3df4] text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{t.label}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Available Placeholders:</p>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                {['{studentName}', '{parentName}', '{amount}', '{month}', '{dueDate}', '{customDueDate}', '{seatNumber}', '{className}'].map(p => (
                  <span key={p} className={`px-1.5 py-0.5 rounded ${p === '{customDueDate}' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-purple-300'}`}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Live Message Preview Card */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Live WhatsApp Message Preview</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                WhatsApp Ready
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
              <div>
                Previewing for: <span className="font-bold text-white">{previewStudent?.name || 'Student'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400">Test Due Date:</span>
                <input
                  type="date"
                  value={previewCustomDueDate}
                  onChange={(e) => setPreviewCustomDueDate(e.target.value)}
                  className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-[11px] text-white focus:outline-none focus:border-[#ff7a3d]"
                />
                {previewCustomDueDate && (
                  <button
                    type="button"
                    onClick={() => setPreviewCustomDueDate('')}
                    className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
                  >
                    Reset (25th)
                  </button>
                )}
              </div>
            </div>

            {/* Smartphone simulated chat bubble */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-100 text-xs sm:text-sm leading-relaxed space-y-2">
              <p className="whitespace-pre-wrap">
                {compileMessage(selectedTemplateKey, {
                  studentName: previewStudent?.name || 'Aarav Sharma',
                  parentName: previewStudent?.parentName || 'Mr. Sharma',
                  amount: previewStudent?.monthlyFee || 2500,
                  seatNumber: 12,
                  customDueDate: previewCustomDueDate
                })}
              </p>
              <div className="text-[10px] text-emerald-400/80 text-right font-mono">
                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              * Note: WhatsApp web/app opens pre-populated with this message. The administrator clicks send in WhatsApp to ensure compliance and avoid bot spam flags.
            </p>
          </div>

        </div>
      )}

      {/* Mark Paid Modal */}
      {payingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 sm:p-7 rounded-3xl">
            <h3 className="text-lg font-bold text-white mb-1">Confirm Payment Collection</h3>
            <p className="text-xs text-slate-400 mb-4">
              Recording fee payment of <span className="text-white font-mono font-bold">{ADMIN_CONFIG.currencySymbol}{payingStudent.amount}</span> for {payingStudent.studentName} for {selectedMonth}.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Cash', 'Bank Transfer'] as PaymentMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        paymentMode === mode
                          ? 'bg-[#6c3df4] border-[#6c3df4] text-white shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayingStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isMarkingPaid}
                  onClick={handleConfirmMarkPaid}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-1.5 transition-colors"
                >
                  {isMarkingPaid && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Queue Panel */}
      {isBroadcastOpen && broadcastQueue[broadcastIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-[#ff7a3d]/50 p-6 sm:p-8 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-[#ff7a3d] bg-[#ff7a3d]/10 px-2.5 py-1 rounded-full border border-[#ff7a3d]/20">
                Broadcast Queue: {broadcastIndex + 1} of {broadcastQueue.length}
              </span>
              <button
                onClick={() => setIsBroadcastOpen(false)}
                className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
                aria-label="Close broadcast modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Next: {broadcastQueue[broadcastIndex].studentName}
                </h3>
                <p className="text-xs text-slate-400">
                  {broadcastQueue[broadcastIndex].program} · Ph: {broadcastQueue[broadcastIndex].phone}
                </p>
              </div>

              {/* 1. Custom Due Date Input / Date Picker */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-[#ff7a3d]" />
                    <span>Fee Due Date (Customizable)</span>
                  </label>
                  {broadcastCustomDueDate ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Custom: {formatDueDateHelper(broadcastCustomDueDate, ADMIN_CONFIG.feeDueDay).dayOrdinal}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      Standard: 25th Cycle
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Select Custom Date (Date Picker)
                    </label>
                    <input
                      type="date"
                      value={broadcastCustomDueDate}
                      onChange={(e) => setBroadcastCustomDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-[#ff7a3d] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Quick Presets
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => setBroadcastCustomDueDate('')}
                        className={`py-2 px-1 rounded-lg text-[10px] font-mono font-semibold border transition-all cursor-pointer truncate ${
                          !broadcastCustomDueDate
                            ? 'bg-[#ff7a3d]/20 border-[#ff7a3d] text-[#ff7a3d]'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title="Use institute default 25th"
                      >
                        Default (25th)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const todayStr = new Date().toISOString().slice(0, 10);
                          setBroadcastCustomDueDate(todayStr);
                        }}
                        className="py-2 px-1 rounded-lg text-[10px] font-mono font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer truncate"
                        title="Set to today's date"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const year = selectedMonth.slice(0, 4);
                          const month = selectedMonth.slice(5, 7);
                          setBroadcastCustomDueDate(`${year}-${month}-28`);
                        }}
                        className="py-2 px-1 rounded-lg text-[10px] font-mono font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer truncate"
                        title="Set to 28th"
                      >
                        28th
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-900 text-[11px] text-slate-400">
                  <span className="truncate">
                    {broadcastCustomDueDate ? (
                      <>Replaces 25th with: <strong className="text-emerald-400">{formatDueDateHelper(broadcastCustomDueDate, ADMIN_CONFIG.feeDueDay).formattedFull}</strong></>
                    ) : (
                      <>Using default: <strong className="text-white">25th of the month</strong></>
                    )}
                  </span>
                  <span className="text-[10px] font-mono text-purple-300 shrink-0">
                    Replaces &#123;dueDate&#125; &amp; &#123;customDueDate&#125;
                  </span>
                </div>
              </div>

              {/* Template selector pills inside modal */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Template:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {[
                    { key: 'dueDate' as const, label: 'Due-Date Notice' },
                    { key: 'friendly' as const, label: 'Friendly Reminder' },
                    { key: 'overdue' as const, label: 'Overdue Notice' }
                  ].map(t => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setSelectedTemplateKey(t.key)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                        selectedTemplateKey === t.key
                          ? 'bg-[#ff7a3d] border-[#ff7a3d] text-slate-950 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live WhatsApp message preview in modal */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-mono">
                {compileMessage(selectedTemplateKey, {
                  studentName: broadcastQueue[broadcastIndex].studentName,
                  parentName: broadcastQueue[broadcastIndex].parentName,
                  amount: broadcastQueue[broadcastIndex].amount,
                  customDueDate: broadcastCustomDueDate
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (broadcastIndex + 1 < broadcastQueue.length) {
                      setBroadcastIndex(i => i + 1);
                    } else {
                      setIsBroadcastOpen(false);
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Skip this student
                </button>

                <button
                  type="button"
                  onClick={handleBroadcastSendNext}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-[#ff7a3d] hover:bg-[#ff8f59] flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Send WhatsApp &amp; Next</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Optional: Firebase Cloud Function snippet documented in comments for automated reminders */}
      {/* 
        // CLOUD FUNCTION REMINDER AUTOMATION (DEPLOY VIA FIREBASE FUNCTIONS):
        // exports.scheduledFeeReminders = functions.pubsub.schedule('0 9 25 * *')
        //   .timeZone('Asia/Kolkata')
        //   .onRun(async (context) => {
        //     const pendingStudents = await db.collection('students').where('status', '==', 'Active').get();
        //     // Dispatch via Meta WhatsApp Business Cloud API
        //   });
      */}

    </div>
  );
};
