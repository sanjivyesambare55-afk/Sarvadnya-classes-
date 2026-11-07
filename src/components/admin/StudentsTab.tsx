import React, { useState } from 'react';
import { 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  doc, 
  collection, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { AdminStudent, StudentStatus, AdminFeeRecord, AdminLibrarySeat } from './types';
import { 
  ADMIN_CONFIG, 
  buildWhatsAppUrl, 
  exportToCSV, 
  normalizePhone 
} from './config';
import { INITIAL_STUDENTS, STUDENT_CLASSES } from '../../constants/initialStudents';
import { 
  Search, 
  Plus, 
  Download, 
  Filter, 
  Phone, 
  MessageCircle, 
  Edit3, 
  Trash2, 
  UserMinus, 
  X, 
  Check, 
  Loader2, 
  BookOpen, 
  IndianRupee, 
  Calendar, 
  CheckCircle2, 
  ChevronRight,
  ShieldAlert,
  Users,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Clock,
  Send,
  Eye,
  CheckSquare,
  Square,
  UserCheck,
  UserX,
  CreditCard
} from 'lucide-react';

interface StudentsTabProps {
  students: AdminStudent[];
  feeRecords: AdminFeeRecord[];
  librarySeats: AdminLibrarySeat[];
  isLoading: boolean;
  onShowToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  feeRecords,
  librarySeats,
  isLoading,
  onShowToast
}) => {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterFeeStatus, setFilterFeeStatus] = useState<string>('all');
  const [filterAttendance, setFilterAttendance] = useState<string>('all');
  const [filterLibrary, setFilterLibrary] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('Active');

  // Selected student for detail drawer
  const [detailStudent, setDetailStudent] = useState<AdminStudent | null>(null);

  // Add / Edit Modal state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentForm, setStudentForm] = useState({
    studentName: '',
    class: 'Class 10 Board',
    phoneNumber: '',
    parentName: '',
    parentPhone: '',
    feeStatus: 'Paid' as 'Paid' | 'Pending',
    librarySeat: 'None',
    attendanceStatus: 'Present' as 'Present' | 'Absent',
    monthlyFee: 2500,
    board: 'State Board',
    medium: 'Semi-English',
    status: 'Active' as StudentStatus,
    joinDate: new Date().toISOString().slice(0, 10),
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Bulk Selection
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isBulkBatchModalOpen, setIsBulkBatchModalOpen] = useState(false);
  const [bulkTargetBatch, setBulkTargetBatch] = useState<string>(STUDENT_CLASSES[0]);

  // Delete modal state
  const [deletingStudent, setDeletingStudent] = useState<AdminStudent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter students based on all criteria
  const filteredStudents = students.filter((s) => {
    const sName = (s.studentName || s.name || '').toLowerCase();
    const sPhone = s.phoneNumber || s.phone || '';
    const pName = (s.parentName || '').toLowerCase();
    const pPhone = s.parentPhone || '';
    const sClass = s.class || s.standard || '';

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !term ||
      sName.includes(term) ||
      sPhone.includes(term) ||
      pName.includes(term) ||
      pPhone.includes(term) ||
      sClass.toLowerCase().includes(term);

    // Class filter (matches either specific or general category)
    const matchesClass = 
      filterClass === 'all' || 
      sClass.toLowerCase().includes(filterClass.toLowerCase()) ||
      (s.standard && s.standard.toLowerCase().includes(filterClass.toLowerCase()));

    // Fee Status filter
    const currentFeeStatus = s.feeStatus || 'Paid';
    const matchesFeeStatus = filterFeeStatus === 'all' || currentFeeStatus === filterFeeStatus;

    // Attendance filter
    const currentAttendance = s.attendanceStatus || 'Present';
    const matchesAttendance = filterAttendance === 'all' || currentAttendance === filterAttendance;

    // Library Seat filter
    const hasSeat = s.librarySeat && s.librarySeat !== 'None';
    const matchesLibrary = 
      filterLibrary === 'all' ||
      (filterLibrary === 'assigned' && hasSeat) ||
      (filterLibrary === 'none' && !hasSeat);

    // Status filter
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;

    return matchesSearch && matchesClass && matchesFeeStatus && matchesAttendance && matchesLibrary && matchesStatus;
  });

  // Calculate Metrics
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'Active');
  const paidCount = activeStudents.filter(s => (s.feeStatus || 'Paid') === 'Paid').length;
  const pendingCount = activeStudents.filter(s => (s.feeStatus || 'Paid') === 'Pending').length;
  const pendingAmount = activeStudents
    .filter(s => (s.feeStatus || 'Paid') === 'Pending')
    .reduce((sum, s) => sum + (Number(s.monthlyFee) || 2500), 0);
  
  const presentCount = activeStudents.filter(s => (s.attendanceStatus || 'Present') === 'Present').length;
  const absentCount = activeStudents.filter(s => (s.attendanceStatus || 'Present') === 'Absent').length;
  const attendanceRate = activeStudents.length > 0 ? Math.round((presentCount / activeStudents.length) * 100) : 0;

  const libraryAssignedCount = activeStudents.filter(s => s.librarySeat && s.librarySeat !== 'None').length;

  // Class badge color resolver
  const getClassBadgeStyle = (cls: string = '') => {
    const c = cls.toLowerCase();
    if (c.includes('9')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25';
    if (c.includes('10')) return 'bg-[#6c3df4]/15 text-purple-300 border-[#6c3df4]/30';
    if (c.includes('11')) return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
    if (c.includes('12')) return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
    if (c.includes('neet')) return 'bg-[#76D9EF]/15 text-[#76D9EF] border-[#76D9EF]/30';
    if (c.includes('jee')) return 'bg-[#ff7a3d]/15 text-[#ff7a3d] border-[#ff7a3d]/30';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  // Toggle Fee Status (Paid <-> Pending)
  const handleToggleFeeStatus = async (student: AdminStudent, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus: 'Paid' | 'Pending' = (student.feeStatus || 'Paid') === 'Paid' ? 'Pending' : 'Paid';
    try {
      await updateDoc(doc(db, 'students', student.id), {
        feeStatus: newStatus,
        updatedAt: serverTimestamp()
      });

      // If student has an assigned library seat, synchronize the seat's feeStatus too
      const seatMatch = student.librarySeat?.match(/(\d+)/);
      if (seatMatch) {
        const seatNum = parseInt(seatMatch[1], 10);
        if (seatNum >= 1 && seatNum <= 200) {
          try {
            await updateDoc(doc(db, 'library_seats', String(seatNum)), {
              feeStatus: newStatus,
              paymentStatus: newStatus,
              updatedAt: serverTimestamp()
            });
          } catch {}
        }
      }

      onShowToast('success', `${student.studentName || student.name}'s fee status updated to ${newStatus}`);
    } catch (err: unknown) {
      console.error('Error toggling fee status:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      onShowToast('error', `Failed to update fee status: ${errorMsg}`);
      alert(`⚠️ Firestore Sync Error:\nCould not update fee status for ${student.studentName || student.name}.\nReason: ${errorMsg}`);
    }
  };

  // Toggle Attendance Status (Present <-> Absent)
  const handleToggleAttendance = async (student: AdminStudent, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus: 'Present' | 'Absent' = (student.attendanceStatus || 'Present') === 'Present' ? 'Absent' : 'Present';
    try {
      await updateDoc(doc(db, 'students', student.id), {
        attendanceStatus: newStatus,
        updatedAt: serverTimestamp()
      });
      onShowToast('info', `${student.studentName || student.name} marked as ${newStatus}`);
    } catch (err: unknown) {
      console.error('Error toggling attendance:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      onShowToast('error', `Failed to update attendance: ${errorMsg}`);
      alert(`⚠️ Firestore Sync Error:\nCould not update attendance for ${student.studentName || student.name}.\nReason: ${errorMsg}`);
    }
  };

  // Build Personalized WhatsApp Fee Reminder
  const getFeeReminderWhatsAppUrl = (student: AdminStudent) => {
    const studentName = student.studentName || student.name;
    const studentClass = student.class || student.standard || 'Classes';
    const amount = Number(student.monthlyFee) || 2500;
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    const message = `Namaste ${student.parentName || studentName}! This is an official reminder from ${ADMIN_CONFIG.className}.\n\nThe monthly tuition fee for *${studentName}* (${studentClass}) for *${currentMonth}* of *₹${amount.toLocaleString('en-IN')}* is currently pending.\n\nFee cycle due date is the *${ADMIN_CONFIG.feeDueDay}th*. Kindly complete payment via UPI to *${ADMIN_CONFIG.classPhone}* or at our institute desk (01 Sarvashree Nagar, Nagpur).\n\nThank you for choosing Sarvadnya!`;

    const phoneToSend = student.parentPhone || student.phoneNumber || student.phone;
    return buildWhatsAppUrl(phoneToSend, message);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingStudentId(null);
    setStudentForm({
      studentName: '',
      class: 'Class 10 Board',
      phoneNumber: '',
      parentName: '',
      parentPhone: '',
      feeStatus: 'Paid',
      librarySeat: 'None',
      attendanceStatus: 'Present',
      monthlyFee: 2500,
      board: 'State Board',
      medium: 'Semi-English',
      status: 'Active',
      joinDate: new Date().toISOString().slice(0, 10),
      notes: ''
    });
    setIsAddEditOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (student: AdminStudent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingStudentId(student.id);
    setStudentForm({
      studentName: student.studentName || student.name || '',
      class: student.class || student.standard || 'Class 10 Board',
      phoneNumber: student.phoneNumber || student.phone || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      feeStatus: student.feeStatus || 'Paid',
      librarySeat: student.librarySeat || 'None',
      attendanceStatus: student.attendanceStatus || 'Present',
      monthlyFee: Number(student.monthlyFee) || 2500,
      board: student.board || 'State Board',
      medium: student.medium || 'Semi-English',
      status: student.status || 'Active',
      joinDate: student.joinDate || new Date().toISOString().slice(0, 10),
      notes: student.notes || ''
    });
    setIsAddEditOpen(true);
  };

  // Save Student (Create or Update)
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = normalizePhone(studentForm.phoneNumber);
    if (cleanPhone.length < 10) {
      onShowToast('error', 'Please enter a valid 10-digit mobile number for the student.');
      alert('⚠️ Please enter a valid 10-digit mobile number for the student.');
      return;
    }

    setIsSaving(true);
    const standardName = studentForm.class.includes('9') ? 'Class 9'
      : studentForm.class.includes('10') ? 'Class 10'
      : studentForm.class.includes('11') ? 'Class 11'
      : studentForm.class.includes('12') ? 'Class 12'
      : studentForm.class.includes('NEET') ? 'NEET Batch'
      : studentForm.class.includes('JEE') ? 'JEE Batch'
      : studentForm.class;

    const payload = {
      ...studentForm,
      name: studentForm.studentName,
      phone: cleanPhone,
      phoneNumber: cleanPhone,
      parentPhone: normalizePhone(studentForm.parentPhone),
      standard: standardName,
      batch: studentForm.class,
      monthlyFee: Number(studentForm.monthlyFee),
      updatedAt: serverTimestamp()
    };

    try {
      let savedStudentId = editingStudentId;
      if (editingStudentId) {
        await updateDoc(doc(db, 'students', editingStudentId), payload);
        onShowToast('success', `${studentForm.studentName}'s record updated successfully!`);
      } else {
        const docRef = await addDoc(collection(db, 'students'), {
          ...payload,
          createdAt: serverTimestamp()
        });
        savedStudentId = docRef.id;
        onShowToast('success', `${studentForm.studentName} enrolled into Students Directory!`);
      }

      // Synchronize library seat assignment directly to "library_seats"
      const prevStudent = editingStudentId ? students.find(s => s.id === editingStudentId) : null;
      const prevSeatMatch = prevStudent?.librarySeat?.match(/(\d+)/);
      const prevSeatNum = prevSeatMatch ? parseInt(prevSeatMatch[1], 10) : null;

      const newSeatMatch = studentForm.librarySeat?.match(/(\d+)/);
      const newSeatNum = newSeatMatch ? parseInt(newSeatMatch[1], 10) : null;

      // If user selected a new seat (1-200), save to library_seats
      if (newSeatNum && newSeatNum >= 1 && newSeatNum <= 200) {
        const floorNum: 1 | 2 = newSeatNum > 100 ? 2 : 1;
        await setDoc(doc(db, 'library_seats', String(newSeatNum)), {
          seatNumber: newSeatNum,
          floor: floorNum,
          status: 'Occupied',
          studentId: savedStudentId || null,
          studentName: studentForm.studentName.trim(),
          phone: cleanPhone,
          phoneNumber: cleanPhone,
          classification: 'Internal Student',
          studentClassification: 'Internal Student',
          feeStatus: studentForm.feeStatus,
          paymentStatus: studentForm.feeStatus,
          shift: 'Full day',
          monthlyFee: 800,
          notes: `Assigned via Students Directory (${studentForm.class})`,
          updatedAt: serverTimestamp()
        }, { merge: true });

        // If moved from another seat, vacate the old seat
        if (prevSeatNum && prevSeatNum !== newSeatNum && prevSeatNum >= 1 && prevSeatNum <= 200) {
          await setDoc(doc(db, 'library_seats', String(prevSeatNum)), {
            seatNumber: prevSeatNum,
            floor: prevSeatNum > 100 ? 2 : 1,
            status: 'Vacant',
            studentName: null,
            phone: null,
            phoneNumber: null,
            studentId: null,
            classification: null,
            studentClassification: null,
            feeStatus: 'Pending',
            paymentStatus: 'Pending',
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      } else if (prevSeatNum && (studentForm.librarySeat === 'None' || !studentForm.librarySeat) && prevSeatNum >= 1 && prevSeatNum <= 200) {
        // Vacate previous seat if set to None
        await setDoc(doc(db, 'library_seats', String(prevSeatNum)), {
          seatNumber: prevSeatNum,
          floor: prevSeatNum > 100 ? 2 : 1,
          status: 'Vacant',
          studentName: null,
          phone: null,
          phoneNumber: null,
          studentId: null,
          classification: null,
          studentClassification: null,
          feeStatus: 'Pending',
          paymentStatus: 'Pending',
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      alert(`✅ Success: ${studentForm.studentName} enrolled/updated successfully in the Students Directory and synchronized with library seating!`);
      setIsAddEditOpen(false);
    } catch (err: unknown) {
      console.error('Error saving student:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      onShowToast('error', `Failed to save student profile: ${errorMsg}`);
      alert(`⚠️ Firestore Sync Error:\nFailed to save student profile for ${studentForm.studentName}.\n\nReason: ${errorMsg}\n\nPlease check network or admin permissions.`);
    } finally {
      setIsSaving(false);
    }
  };

  // Seed / Reset Sample Students in Firestore
  const handleSeedSampleStudents = async () => {
    if (!window.confirm('Do you want to populate all 30 realistic sample students across Class 9, 10, 11, 12, NEET, and JEE batches into Firestore?')) {
      return;
    }

    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      
      for (const sample of INITIAL_STUDENTS) {
        const docRef = doc(collection(db, 'students'));
        batch.set(docRef, {
          ...sample,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();
      onShowToast('success', 'Successfully populated 30 sample students across all batches into Firestore!');
      alert('✅ Success: Successfully populated 30 realistic sample students across Class 9, 10, 11, 12, NEET, and JEE into the Firestore "students" collection!');
    } catch (err: unknown) {
      console.error('Error seeding sample students:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      onShowToast('error', `Failed to seed sample students: ${errorMsg}`);
      alert(`⚠️ Firestore Sync Error:\nFailed to seed sample students.\nReason: ${errorMsg}\n\nPlease check network or admin permissions.`);
    } finally {
      setIsSeeding(false);
    }
  };

  // Mark as Left
  const handleMarkLeft = async (studentId: string, name: string) => {
    try {
      await updateDoc(doc(db, 'students', studentId), {
        status: 'Left',
        leftDate: new Date().toISOString().slice(0, 10),
        updatedAt: serverTimestamp()
      });
      onShowToast('info', `${name} marked as "Left"`);
      if (detailStudent?.id === studentId) {
        setDetailStudent(prev => prev ? { ...prev, status: 'Left' } : null);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      onShowToast('error', 'Could not update status.');
    }
  };

  // Hard Delete
  const confirmDelete = async () => {
    if (!deletingStudent) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'students', deletingStudent.id));
      onShowToast('success', `${deletingStudent.studentName || deletingStudent.name} permanently removed`);
      if (detailStudent?.id === deletingStudent.id) {
        setDetailStudent(null);
      }
      setDeletingStudent(null);
    } catch (err) {
      console.error('Error deleting student:', err);
      onShowToast('error', 'Failed to delete student.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const rows = filteredStudents.map(s => ({
      'Student Name': s.studentName || s.name,
      'Class / Batch': s.class || s.standard,
      'Phone Number': s.phoneNumber || s.phone,
      'Fee Status': s.feeStatus || 'Paid',
      'Attendance': s.attendanceStatus || 'Present',
      'Library Seat': s.librarySeat || 'None',
      'Monthly Tuition Fee (INR)': s.monthlyFee || 2500,
      'Parent Name': s.parentName || '',
      'Parent Phone': s.parentPhone || '',
      'Board': s.board || '',
      'Medium': s.medium || '',
      'Status': s.status,
      'Join Date': s.joinDate || '',
      'Notes': s.notes || ''
    }));
    exportToCSV('Sarvadnya_Students_Directory', rows);
    onShowToast('info', `Exported ${rows.length} student records to CSV`);
  };

  // Bulk selection toggles
  const toggleSelectStudent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Top Header Banner with Live Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6c3df4] to-[#14b8a6] p-0.5 shadow-md flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-display">Students Directory</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#14b8a6]/15 text-[#14b8a6] font-semibold border border-[#14b8a6]/30">
                  {filteredStudents.length} of {totalStudents} Students
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized database tracking student contact, class batches, monthly fees, attendance, and library seat assignments
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Seed Sample Students Button */}
          <button
            onClick={handleSeedSampleStudents}
            disabled={isSeeding}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Populate 30 realistic sample students across all classes into Firestore"
          >
            {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6c3df4]" /> : <RotateCcw className="w-3.5 h-3.5 text-[#14b8a6]" />}
            <span>Seed 30 Sample Students</span>
          </button>

          {/* Add Student Button */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#6c3df4] hover:bg-[#5b2ce3] flex items-center gap-1.5 shadow-lg shadow-[#6c3df4]/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Live Key Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        {/* Total Students */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Total Enrolled</span>
            <div className="text-2xl font-black text-white font-display mt-0.5">{totalStudents}</div>
            <span className="text-[10px] text-emerald-400">{activeStudents.length} Active Records</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#6c3df4] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Fee Status Summary */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Fee Collection</span>
            <div className="text-2xl font-black font-display mt-0.5 flex items-baseline gap-1.5">
              <span className="text-emerald-400">{paidCount} Paid</span>
              <span className="text-xs text-slate-500">/</span>
              <span className="text-amber-400 text-lg">{pendingCount} Due</span>
            </div>
            <span className="text-[10px] text-amber-400 font-mono">₹{pendingAmount.toLocaleString('en-IN')} Pending</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Daily Attendance</span>
            <div className="text-2xl font-black font-display mt-0.5 flex items-baseline gap-1.5">
              <span className="text-emerald-400">{presentCount}</span>
              <span className="text-xs text-slate-500">/</span>
              <span className="text-rose-400 text-base">{absentCount} Abs</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">{attendanceRate}% Present Today</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Library Seats */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Library Desks</span>
            <div className="text-2xl font-black text-[#76D9EF] font-display mt-0.5">{libraryAssignedCount}</div>
            <span className="text-[10px] text-slate-400">Assigned Desks</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#76D9EF]/10 text-[#76D9EF] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 3. Filter Toolbar & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
        
        {/* Search */}
        <div className="relative min-w-[220px] flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student, phone, class, or parent..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] focus:outline-none text-xs text-white placeholder:text-slate-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Class Filter */}
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-xs text-white"
          >
            <option value="all">All Classes</option>
            <option value="Class 9">Class 9</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 11">Class 11</option>
            <option value="Class 12">Class 12</option>
            <option value="NEET">NEET Batch</option>
            <option value="JEE">JEE Batch</option>
          </select>

          {/* Fee Status Filter */}
          <select
            value={filterFeeStatus}
            onChange={(e) => setFilterFeeStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-xs text-white"
          >
            <option value="all">All Fee Statuses</option>
            <option value="Paid">Paid Only (₹)</option>
            <option value="Pending">Pending Only (Due)</option>
          </select>

          {/* Attendance Filter */}
          <select
            value={filterAttendance}
            onChange={(e) => setFilterAttendance(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-xs text-white"
          >
            <option value="all">All Attendance</option>
            <option value="Present">Present Only</option>
            <option value="Absent">Absent Only</option>
          </select>

          {/* Library Seat Filter */}
          <select
            value={filterLibrary}
            onChange={(e) => setFilterLibrary(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-xs text-white"
          >
            <option value="all">All Library Seats</option>
            <option value="assigned">Assigned Seats</option>
            <option value="none">No Library Seat</option>
          </select>

          {/* Active / Inactive / Left */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-xs text-white"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive</option>
            <option value="Left">Left</option>
          </select>
        </div>

        {/* Bulk Action Trigger */}
        {selectedStudentIds.length > 0 && (
          <div className="flex items-center gap-2 bg-[#6c3df4]/10 border border-[#6c3df4]/30 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-bold text-[#6c3df4]">
              {selectedStudentIds.length} Selected
            </span>
            <button
              onClick={() => setSelectedStudentIds([])}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 4. Students Directory Table */}
      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#14b8a6]" />
          <p className="text-sm mt-3">Loading students directory from Firestore...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-4">
          <Users className="w-12 h-12 mx-auto text-slate-600" />
          <div>
            <h3 className="text-base font-bold text-slate-300">No Students Match Selected Filters</h3>
            <p className="text-xs max-w-md mx-auto mt-1 text-slate-400">
              Try adjusting your class, fee status, or search term, or click below to populate the database with 30 sample students.
            </p>
          </div>
          <button
            onClick={handleSeedSampleStudents}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#6c3df4] hover:bg-[#5b2ce3] inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-[#6c3df4]/25"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load 30 Realistic Sample Students</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          
          {/* Desktop Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-3 px-6 py-3.5 border-b border-slate-800 bg-slate-950/70 text-[11px] font-mono uppercase tracking-wider text-slate-400">
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-slate-700 bg-slate-900 text-[#6c3df4] cursor-pointer"
              />
            </div>
            <div className="col-span-3">Student & Phone</div>
            <div className="col-span-2">Class / Batch</div>
            <div className="col-span-2">Fee Status (1-Tap)</div>
            <div className="col-span-2">Attendance (1-Tap)</div>
            <div className="col-span-2 text-right">Quick Actions</div>
          </div>

          {/* Student Rows */}
          <div className="divide-y divide-slate-800/80">
            {filteredStudents.map((student) => {
              const isSelected = selectedStudentIds.includes(student.id);
              const studentDisplayName = student.studentName || student.name || 'Student';
              const studentPhone = student.phoneNumber || student.phone || '';
              const studentClass = student.class || student.standard || 'Class 10';
              const isFeePaid = (student.feeStatus || 'Paid') === 'Paid';
              const isPresent = (student.attendanceStatus || 'Present') === 'Present';
              const hasLibrarySeat = student.librarySeat && student.librarySeat !== 'None';
              const feeAmount = Number(student.monthlyFee) || 2500;

              return (
                <div
                  key={student.id}
                  onClick={() => setDetailStudent(student)}
                  className={`p-4 lg:px-6 lg:py-3.5 transition-colors flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-3 items-start lg:items-center cursor-pointer ${
                    isSelected ? 'bg-[#6c3df4]/5' : 'hover:bg-slate-950/40'
                  }`}
                >
                  {/* Checkbox */}
                  <div className="hidden lg:flex col-span-1 items-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => toggleSelectStudent(student.id, e as unknown as React.MouseEvent)}
                      className="rounded border-slate-700 bg-slate-900 text-[#6c3df4] cursor-pointer"
                    />
                  </div>

                  {/* Student Name & Contact */}
                  <div className="col-span-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white group-hover:text-[#6c3df4] transition-colors">
                        {studentDisplayName}
                      </span>
                      {student.status === 'Left' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-500/15 text-red-400">
                          Left
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <a
                        href={`tel:${studentPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-teal-400 flex items-center gap-1 font-mono"
                      >
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{studentPhone}</span>
                      </a>

                      {student.parentName && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="truncate max-w-[140px] text-[11px]" title={`Parent: ${student.parentName}`}>
                            {student.parentName}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Library Seat tag if assigned */}
                    {hasLibrarySeat && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-[#76D9EF] bg-[#76D9EF]/10 px-2 py-0.5 rounded-md border border-[#76D9EF]/20 w-fit">
                        <BookOpen className="w-3 h-3 shrink-0" />
                        <span>{student.librarySeat}</span>
                      </div>
                    )}
                  </div>

                  {/* Class & Batch */}
                  <div className="col-span-2 space-y-1">
                    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-xl border ${getClassBadgeStyle(studentClass)}`}>
                      {studentClass}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Fee: ₹{feeAmount.toLocaleString('en-IN')} /mo
                    </div>
                  </div>

                  {/* Fee Status (1-Tap Toggle) */}
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={(e) => handleToggleFeeStatus(student, e)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isFeePaid 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20' 
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                      }`}
                      title="Click to toggle between Paid and Pending"
                    >
                      <span className={`w-2 h-2 rounded-full ${isFeePaid ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                      <span>{isFeePaid ? 'Paid' : 'Pending'}</span>
                    </button>
                  </div>

                  {/* Attendance Status (1-Tap Toggle) */}
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={(e) => handleToggleAttendance(student, e)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isPresent 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20' 
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                      }`}
                      title="Click to toggle between Present and Absent"
                    >
                      {isPresent ? <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> : <UserX className="w-3.5 h-3.5 text-rose-400" />}
                      <span>{isPresent ? 'Present' : 'Absent'}</span>
                    </button>
                  </div>

                  {/* Quick Actions */}
                  <div 
                    className="col-span-2 flex items-center justify-end gap-1.5 w-full lg:w-auto mt-2 lg:mt-0 pt-2 lg:pt-0 border-t lg:border-0 border-slate-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* WhatsApp Fee Reminder (Highlighted when Pending) */}
                    {!isFeePaid && (
                      <a
                        href={getFeeReminderWhatsAppUrl(student)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 flex items-center gap-1 text-xs font-semibold transition-colors"
                        title="Send WhatsApp Fee Reminder"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        <span className="hidden xl:inline">Reminder</span>
                      </a>
                    )}

                    {/* General WhatsApp */}
                    {isFeePaid && (
                      <a
                        href={buildWhatsAppUrl(studentPhone, `Hello ${studentDisplayName}, message from ${ADMIN_CONFIG.className}.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                        title="WhatsApp student"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      </a>
                    )}

                    {/* Edit Student */}
                    <button
                      onClick={(e) => handleOpenEdit(student, e)}
                      className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                      title="Edit student record"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* View Details Drawer */}
                    <button
                      onClick={() => setDetailStudent(student)}
                      className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                      title="View student dossier"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete / Left */}
                    {student.status !== 'Left' ? (
                      <button
                        onClick={() => handleMarkLeft(student.id, studentDisplayName)}
                        className="p-2 rounded-xl text-slate-400 hover:text-orange-400 bg-slate-800 hover:bg-orange-500/10 transition-colors"
                        title="Mark as Left"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setDeletingStudent(student)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-red-500/10 transition-colors"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* 5. Add / Edit Student Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl text-left max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAddEditOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white font-display">
                {editingStudentId ? 'Edit Student Record' : 'Enroll New Student in Directory'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage student credentials, cohort batch, fee payment status, library desk, and attendance
              </p>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Student Full Name <span className="text-[#ff7a3d]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentForm.studentName}
                    onChange={(e) => setStudentForm({ ...studentForm, studentName: e.target.value })}
                    placeholder="e.g. Vedant Thakre"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Student Phone (10 digits) <span className="text-[#ff7a3d]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={studentForm.phoneNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, phoneNumber: e.target.value })}
                    placeholder="e.g. 7020035514"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Class / Batch <span className="text-[#ff7a3d]">*</span>
                  </label>
                  <select
                    value={studentForm.class}
                    onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-sm text-white"
                  >
                    {STUDENT_CLASSES.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Monthly Fee (₹) <span className="text-[#ff7a3d]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={studentForm.monthlyFee}
                    onChange={(e) => setStudentForm({ ...studentForm, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Fee Status
                  </label>
                  <select
                    value={studentForm.feeStatus}
                    onChange={(e) => setStudentForm({ ...studentForm, feeStatus: e.target.value as 'Paid' | 'Pending' })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-sm text-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Attendance Status
                  </label>
                  <select
                    value={studentForm.attendanceStatus}
                    onChange={(e) => setStudentForm({ ...studentForm, attendanceStatus: e.target.value as 'Present' | 'Absent' })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-sm text-white"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Library Desk Seat
                  </label>
                  <input
                    type="text"
                    value={studentForm.librarySeat}
                    onChange={(e) => setStudentForm({ ...studentForm, librarySeat: e.target.value })}
                    placeholder="e.g. Floor 1 - Seat 05 or None"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Parent / Guardian Name
                  </label>
                  <input
                    type="text"
                    value={studentForm.parentName}
                    onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                    placeholder="e.g. Ramesh Deshmukh"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Parent Phone Number
                  </label>
                  <input
                    type="tel"
                    value={studentForm.parentPhone}
                    onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                    placeholder="e.g. 9823000000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Academic Notes / Remarks
                </label>
                <textarea
                  rows={2}
                  value={studentForm.notes}
                  onChange={(e) => setStudentForm({ ...studentForm, notes: e.target.value })}
                  placeholder="Targeting top rank in board prelims, attending morning doubt sessions..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-sm text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#6c3df4] hover:bg-[#5b2ce3] disabled:opacity-60 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingStudentId ? 'Update Record' : 'Enroll Student'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 6. Student Dossier Detail Drawer */}
      {detailStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 p-6 sm:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#14b8a6]">
                    Student Dossier
                  </span>
                  <h3 className="text-xl font-bold text-white font-display mt-0.5">
                    {detailStudent.studentName || detailStudent.name}
                  </h3>
                </div>
                <button
                  onClick={() => setDetailStudent(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Personal Dossier Grid */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Class / Cohort:</span>
                    <span className="font-semibold text-white">{detailStudent.class || detailStudent.standard}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Student Phone:</span>
                    <a href={`tel:${detailStudent.phoneNumber || detailStudent.phone}`} className="font-semibold text-teal-400 font-mono">
                      {detailStudent.phoneNumber || detailStudent.phone}
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Fee Status:</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full ${
                      (detailStudent.feeStatus || 'Paid') === 'Paid' ? 'text-emerald-400 bg-emerald-500/15' : 'text-amber-400 bg-amber-500/15'
                    }`}>
                      {detailStudent.feeStatus || 'Paid'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Daily Attendance:</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full ${
                      (detailStudent.attendanceStatus || 'Present') === 'Present' ? 'text-emerald-400 bg-emerald-500/15' : 'text-rose-400 bg-rose-500/15'
                    }`}>
                      {detailStudent.attendanceStatus || 'Present'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Library Desk Seat:</span>
                    <span className="font-semibold text-[#76D9EF]">{detailStudent.librarySeat || 'None'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Monthly Tuition Fee:</span>
                    <span className="font-bold text-[#ff7a3d] font-mono">₹{Number(detailStudent.monthlyFee || 2500).toLocaleString('en-IN')}</span>
                  </div>
                  {detailStudent.parentName && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Parent / Guardian:</span>
                      <span className="font-semibold text-white">{detailStudent.parentName} ({detailStudent.parentPhone || 'No phone'})</span>
                    </div>
                  )}
                </div>

                {/* Direct Communication Buttons */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Instant WhatsApp Channels
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href={getFeeReminderWhatsAppUrl(detailStudent)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-semibold text-amber-300 flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Send Fee Reminder</span>
                    </a>

                    <a
                      href={buildWhatsAppUrl(detailStudent.phoneNumber || detailStudent.phone, `Hello ${detailStudent.studentName || detailStudent.name}, this is ${ADMIN_CONFIG.className}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-semibold text-emerald-300 flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>

                {detailStudent.notes && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    <span className="font-bold text-slate-400 block mb-1">Academic Notes:</span>
                    <p className="italic">&ldquo;{detailStudent.notes}&rdquo;</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Drawer Actions */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  const toEdit = detailStudent;
                  setDetailStudent(null);
                  handleOpenEdit(toEdit);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Full Profile</span>
              </button>

              <button
                onClick={() => setDetailStudent(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#6c3df4] hover:bg-[#5b2ce3] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Permanently Delete Student?</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              This will completely remove <span className="font-semibold text-white">{deletingStudent.studentName || deletingStudent.name}</span> from the database.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
