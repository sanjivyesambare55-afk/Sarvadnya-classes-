import React, { useState } from 'react';
import { 
  setDoc, 
  updateDoc, 
  doc, 
  writeBatch, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  AdminLibrarySeat, 
  SeatShift, 
  PaymentStatus, 
  SeatStatus, 
  StudentClassification,
  AdminStudent 
} from './types';
import { 
  ADMIN_CONFIG, 
  buildWhatsAppUrl, 
  exportToCSV, 
  normalizePhone 
} from './config';
import { 
  BookOpen, 
  Grid, 
  List, 
  Search, 
  Plus, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  MessageCircle, 
  Clock, 
  X, 
  Loader2, 
  ArrowRightLeft, 
  UserCheck, 
  Trash2,
  Sparkles,
  Layers,
  GraduationCap,
  Building2,
  RotateCcw,
  User,
  Filter,
  Check,
  CreditCard
} from 'lucide-react';

interface LibrarySeatsTabProps {
  seats: AdminLibrarySeat[];
  students: AdminStudent[];
  isLoading: boolean;
  onShowToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const LibrarySeatsTab: React.FC<LibrarySeatsTabProps> = ({
  seats,
  students,
  isLoading,
  onShowToast
}) => {
  // Floor switcher: 1 = Floor 1 (1-100), 2 = Floor 2 (101-200), 'all' = Both floors
  const [activeFloor, setActiveFloor] = useState<1 | 2 | 'all'>(1);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'Available' | 'Occupied'>('all');
  const [filterClassification, setFilterClassification] = useState<'all' | 'Internal Student' | 'Outsider Student'>('all');
  const [filterFeeStatus, setFilterFeeStatus] = useState<'all' | 'Paid' | 'Pending'>('all');
  const [filterShift, setFilterShift] = useState<string>('all');

  // Selected seat for assignment / edit modal
  const [selectedSeat, setSelectedSeat] = useState<AdminLibrarySeat | null>(null);
  const [assignForm, setAssignForm] = useState({
    studentId: '',
    studentName: '',
    phone: '',
    classification: 'Internal Student' as StudentClassification,
    shift: 'Full day' as SeatShift,
    monthlyFee: 800,
    feeStatus: 'Paid' as PaymentStatus,
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Move seat modal state
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [targetSeatNumber, setTargetSeatNumber] = useState<number>(1);
  const [isMoving, setIsMoving] = useState(false);

  // Batch seat generation (200 seats across 2 floors)
  const [isGeneratingSeats, setIsGeneratingSeats] = useState(false);

  // Derive full 200 seats array ensuring all numbers 1..200 exist even before Firestore seeds
  const completeSeatsList: AdminLibrarySeat[] = React.useMemo(() => {
    const map = new Map<number, AdminLibrarySeat>();
    seats.forEach(s => map.set(s.seatNumber, s));

    const result: AdminLibrarySeat[] = [];
    for (let i = 1; i <= 200; i++) {
      if (map.has(i)) {
        const existing = map.get(i)!;
        result.push({
          ...existing,
          floor: (existing.floor || (i > 100 ? 2 : 1)) as 1 | 2
        });
      } else {
        // Virtual placeholder before sync
        result.push({
          id: String(i),
          seatNumber: i,
          floor: (i > 100 ? 2 : 1) as 1 | 2,
          status: 'Vacant',
          shift: 'Full day',
          monthlyFee: 800,
          paymentStatus: 'Pending',
          feeStatus: 'Pending'
        });
      }
    }
    return result;
  }, [seats]);

  // Counts & Metrics
  const floor1Seats = completeSeatsList.filter(s => s.seatNumber <= 100);
  const floor2Seats = completeSeatsList.filter(s => s.seatNumber > 100);

  const totalSeatsCount = completeSeatsList.length; // 200
  const occupiedSeats = completeSeatsList.filter(s => s.status === 'Occupied');
  const availableSeats = completeSeatsList.filter(s => s.status === 'Vacant');

  const internalStudentsCount = occupiedSeats.filter(s => (s.classification || s.studentClassification) === 'Internal Student').length;
  const outsiderStudentsCount = occupiedSeats.filter(s => (s.classification || s.studentClassification) === 'Outsider Student').length;

  const paidSeatsCount = occupiedSeats.filter(s => (s.feeStatus || s.paymentStatus) === 'Paid').length;
  const pendingSeatsCount = occupiedSeats.filter(s => (s.feeStatus || s.paymentStatus) === 'Pending').length;

  const floor1Occupied = floor1Seats.filter(s => s.status === 'Occupied').length;
  const floor2Occupied = floor2Seats.filter(s => s.status === 'Occupied').length;

  // Filter seats based on active floor and filters
  const displayedSeats = completeSeatsList.filter((seat) => {
    // 1. Floor filter
    if (activeFloor !== 'all' && seat.floor !== activeFloor) {
      return false;
    }

    // 2. Search term
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      const matchSeat = String(seat.seatNumber).includes(term);
      const matchName = seat.studentName?.toLowerCase().includes(term);
      const matchPhone = seat.phone?.includes(term) || seat.phoneNumber?.includes(term);
      if (!matchSeat && !matchName && !matchPhone) return false;
    }

    // 3. Availability filter
    if (filterAvailability === 'Available' && seat.status !== 'Vacant') return false;
    if (filterAvailability === 'Occupied' && seat.status !== 'Occupied') return false;

    // 4. Classification filter
    if (filterClassification !== 'all') {
      if (seat.status !== 'Occupied') return false;
      const classif = seat.classification || seat.studentClassification;
      if (classif !== filterClassification) return false;
    }

    // 5. Fee Status filter
    if (filterFeeStatus !== 'all') {
      if (seat.status !== 'Occupied') return false;
      const feeSt = seat.feeStatus || seat.paymentStatus || 'Pending';
      if (feeSt !== filterFeeStatus) return false;
    }

    // 6. Shift filter
    if (filterShift !== 'all' && seat.shift !== filterShift) {
      return false;
    }

    return true;
  });

  // Open Modal for Assignment
  const handleOpenSeatModal = (seat: AdminLibrarySeat) => {
    setSelectedSeat(seat);
    const existingClassif = seat.classification || seat.studentClassification || 'Internal Student';

    setAssignForm({
      studentId: seat.studentId || '',
      studentName: seat.studentName || '',
      phone: seat.phone || seat.phoneNumber || '',
      classification: existingClassif,
      shift: seat.shift || 'Full day',
      monthlyFee: seat.monthlyFee || 800,
      feeStatus: (seat.feeStatus || seat.paymentStatus || 'Paid') as PaymentStatus,
      notes: seat.notes || ''
    });
  };

  // Student dropdown selector helper
  const handleSelectEnrolledStudent = (studentId: string) => {
    const st = students.find(s => s.id === studentId);
    if (st) {
      setAssignForm(prev => ({
        ...prev,
        studentId: st.id,
        studentName: st.studentName || st.name,
        phone: st.phoneNumber || st.phone,
        classification: 'Internal Student' // Enrolled student is automatically Internal
      }));
    }
  };

  // Save Seat Assignment directly to "library_seats"
  const handleSaveSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeat) return;

    if (!assignForm.studentName.trim() || !assignForm.phone.trim()) {
      onShowToast('error', 'Student name and phone number are required.');
      return;
    }

    const cleanPhone = normalizePhone(assignForm.phone);
    if (cleanPhone.length < 10) {
      onShowToast('error', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSaving(true);
    const seatIdStr = String(selectedSeat.seatNumber);
    const floorNumber: 1 | 2 = selectedSeat.seatNumber > 100 ? 2 : 1;
    const nowMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    const normalizedClassif = assignForm.classification.includes('Internal') ? 'Internal Student' : 'Outsider Student';
    const shortClassif = assignForm.classification.includes('Internal') ? 'Internal' : 'Outsider';

    const seatPayload = {
      seatNumber: selectedSeat.seatNumber,
      seatId: seatIdStr,
      floor: floorNumber,
      status: 'Occupied',
      studentName: assignForm.studentName.trim(),
      phone: cleanPhone,
      phoneNumber: cleanPhone,
      studentId: assignForm.studentId || null,
      classification: normalizedClassif,
      studentClassification: normalizedClassif,
      studentType: shortClassif,
      type: shortClassif,
      shift: assignForm.shift,
      monthlyFee: Number(assignForm.monthlyFee),
      feeStatus: assignForm.feeStatus,
      paymentStatus: assignForm.feeStatus,
      lastPaidMonth: assignForm.feeStatus === 'Paid' ? nowMonth : (selectedSeat.lastPaidMonth || null),
      startDate: selectedSeat.startDate || new Date().toISOString().slice(0, 10),
      notes: assignForm.notes.trim(),
      updatedAt: serverTimestamp()
    };

    try {
      // 1. Primary write to "library_seats" collection as requested
      await setDoc(doc(db, 'library_seats', seatIdStr), seatPayload, { merge: true });

      // 2. Also mirror to legacy "librarySeats" collection so other modules remain synchronized
      try {
        await setDoc(doc(db, 'librarySeats', seatIdStr), seatPayload, { merge: true });
      } catch (mirrorErr) {
        // non-blocking
      }

      onShowToast('success', `Seat #${selectedSeat.seatNumber} (Floor ${floorNumber}) assigned to ${assignForm.studentName} as [${assignForm.classification}]!`);
      alert(`✅ Success: Seat #${selectedSeat.seatNumber} (Floor ${floorNumber}) successfully saved to Firestore ("library_seats")!\n\nAssigned to: ${assignForm.studentName}\nClassification: ${assignForm.classification}\nPhone: ${cleanPhone}\nFee Status: ${assignForm.feeStatus}`);
      setSelectedSeat(null);
    } catch (err: unknown) {
      console.error('Error saving library seat:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      onShowToast('error', `Failed to save library seat assignment: ${errorMsg}`);
      alert(`⚠️ Firestore Sync Error:\nCould not assign Seat #${selectedSeat.seatNumber}.\n\nReason: ${errorMsg}\n\nPlease check network connection or verify admin permissions.`);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Fee Status (Paid <-> Pending)
  const handleTogglePayment = async (seat: AdminLibrarySeat, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (seat.status !== 'Occupied') return;

    const currentStatus = seat.feeStatus || seat.paymentStatus || 'Pending';
    const newStatus: PaymentStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    const nowMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const seatIdStr = String(seat.seatNumber);

    try {
      await updateDoc(doc(db, 'library_seats', seatIdStr), {
        feeStatus: newStatus,
        paymentStatus: newStatus,
        lastPaidMonth: newStatus === 'Paid' ? nowMonth : seat.lastPaidMonth,
        updatedAt: serverTimestamp()
      });

      // mirror
      try {
        await updateDoc(doc(db, 'librarySeats', seatIdStr), {
          paymentStatus: newStatus,
          feeStatus: newStatus,
          updatedAt: serverTimestamp()
        });
      } catch {}

      onShowToast('success', `Seat #${seat.seatNumber} fee status updated to ${newStatus}`);
    } catch (err: unknown) {
      console.error('Error updating fee status:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      onShowToast('error', `Could not update fee status: ${errorMsg}`);
      alert(`⚠️ Firestore Sync Error:\nCould not update fee status for Seat #${seat.seatNumber}.\nReason: ${errorMsg}`);
    }
  };

  // Vacate Seat
  const handleVacateSeat = async (seatNumber: number) => {
    const seatIdStr = String(seatNumber);
    const floorNumber: 1 | 2 = seatNumber > 100 ? 2 : 1;

    try {
      const vacantData = {
        seatNumber,
        floor: floorNumber,
        status: 'Vacant',
        studentName: null,
        phone: null,
        phoneNumber: null,
        studentId: null,
        classification: null,
        studentClassification: null,
        feeStatus: 'Pending',
        paymentStatus: 'Pending',
        notes: '',
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'library_seats', seatIdStr), vacantData, { merge: true });
      try {
        await setDoc(doc(db, 'librarySeats', seatIdStr), vacantData, { merge: true });
      } catch {}

      onShowToast('info', `Seat #${seatNumber} vacated and set to Available.`);
      alert(`✅ Seat #${seatNumber} (Floor ${floorNumber}) has been vacated and marked as Available in "library_seats".`);
      setSelectedSeat(null);
    } catch (err: unknown) {
      console.error('Error vacating seat:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      onShowToast('error', `Failed to vacate seat: ${errorMsg}`);
      alert(`⚠️ Firestore Sync Error:\nCould not vacate Seat #${seatNumber}.\nReason: ${errorMsg}`);
    }
  };

  // Move Student to Another Vacant Seat
  const handleMoveSeat = async () => {
    if (!selectedSeat) return;
    const targetSeat = completeSeatsList.find(s => s.seatNumber === targetSeatNumber);

    if (targetSeat && targetSeat.status === 'Occupied') {
      onShowToast('error', `Seat #${targetSeatNumber} is already occupied by ${targetSeat.studentName}.`);
      return;
    }

    setIsMoving(true);
    const sourceSeatIdStr = String(selectedSeat.seatNumber);
    const targetSeatIdStr = String(targetSeatNumber);
    const targetFloor: 1 | 2 = targetSeatNumber > 100 ? 2 : 1;

    try {
      const batch = writeBatch(db);

      // 1. Assign to new seat
      const targetRef = doc(db, 'library_seats', targetSeatIdStr);
      batch.set(targetRef, {
        seatNumber: targetSeatNumber,
        floor: targetFloor,
        studentId: selectedSeat.studentId || null,
        studentName: selectedSeat.studentName,
        phone: selectedSeat.phone || selectedSeat.phoneNumber,
        phoneNumber: selectedSeat.phone || selectedSeat.phoneNumber,
        classification: selectedSeat.classification || selectedSeat.studentClassification || 'Internal Student',
        studentClassification: selectedSeat.classification || selectedSeat.studentClassification || 'Internal Student',
        shift: selectedSeat.shift,
        monthlyFee: selectedSeat.monthlyFee,
        feeStatus: selectedSeat.feeStatus || selectedSeat.paymentStatus || 'Paid',
        paymentStatus: selectedSeat.paymentStatus || selectedSeat.feeStatus || 'Paid',
        lastPaidMonth: selectedSeat.lastPaidMonth || null,
        startDate: selectedSeat.startDate || null,
        status: 'Occupied',
        notes: selectedSeat.notes || '',
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 2. Vacate old seat
      const sourceRef = doc(db, 'library_seats', sourceSeatIdStr);
      batch.set(sourceRef, {
        seatNumber: selectedSeat.seatNumber,
        floor: selectedSeat.floor,
        studentId: null,
        studentName: null,
        phone: null,
        phoneNumber: null,
        classification: null,
        studentClassification: null,
        status: 'Vacant',
        feeStatus: 'Pending',
        paymentStatus: 'Pending',
        notes: '',
        updatedAt: serverTimestamp()
      }, { merge: true });

      await batch.commit();

      onShowToast('success', `Moved ${selectedSeat.studentName} from Seat #${selectedSeat.seatNumber} to Seat #${targetSeatNumber} (Floor ${targetFloor})`);
      alert(`✅ Success: Student ${selectedSeat.studentName} moved from Seat #${selectedSeat.seatNumber} to Seat #${targetSeatNumber} (Floor ${targetFloor}) and updated in "library_seats"!`);
      setIsMoveModalOpen(false);
      setSelectedSeat(null);
    } catch (err: unknown) {
      console.error('Error moving student seat:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      onShowToast('error', `Failed to move student: ${errorMsg}`);
      alert(`⚠️ Firestore Sync Error:\nFailed to move student.\nReason: ${errorMsg}`);
    } finally {
      setIsMoving(false);
    }
  };

  // Seed / Initialize 200 Total Seats (Floor 1: 1-100, Floor 2: 101-200)
  const handleSeed200Seats = async () => {
    if (!window.confirm('Do you want to initialize/sync all 200 library study carrels across Floor 1 (1-100) and Floor 2 (101-200) in the "library_seats" Firestore collection?')) {
      return;
    }

    setIsGeneratingSeats(true);
    try {
      // Predefined sample occupancies matching requirements
      const sampleOccupancies: Record<number, { name: string; phone: string; classif: StudentClassification; shift: SeatShift; feeStatus: PaymentStatus }> = {
        // Floor 1 Internal (Blue)
        2: { name: 'Pooja Nandanwar', phone: '9890678123', classif: 'Internal Student', shift: 'Full day', feeStatus: 'Paid' },
        3: { name: 'Kalyani Kale', phone: '9822345678', classif: 'Internal Student', shift: 'Full day', feeStatus: 'Paid' },
        5: { name: 'Vedant Thakre', phone: '7020035514', classif: 'Internal Student', shift: 'Full day', feeStatus: 'Paid' },
        8: { name: 'Shruti Deshmukh', phone: '9890123456', classif: 'Internal Student', shift: 'Morning', feeStatus: 'Paid' },
        11: { name: 'Yash Raut', phone: '9822987123', classif: 'Internal Student', shift: 'Evening', feeStatus: 'Pending' },
        14: { name: 'Sahil Sheikh', phone: '9823345123', classif: 'Internal Student', shift: 'Evening', feeStatus: 'Paid' },
        15: { name: 'Riya Patil', phone: '9890345901', classif: 'Internal Student', shift: 'Full day', feeStatus: 'Paid' },

        // Floor 1 Outsider (Purple)
        12: { name: 'Aditi Kulkarni', phone: '9822019901', classif: 'Outsider Student', shift: 'Full day', feeStatus: 'Paid' },
        18: { name: 'Amit Deshpande', phone: '9822019902', classif: 'Outsider Student', shift: 'Evening', feeStatus: 'Paid' },
        25: { name: 'Priyanka Joshi', phone: '9822019903', classif: 'Outsider Student', shift: 'Morning', feeStatus: 'Pending' },
        30: { name: 'Naveen Shahu', phone: '9822019904', classif: 'Outsider Student', shift: 'Full day', feeStatus: 'Paid' },

        // Floor 2 Internal (Blue)
        101: { name: 'Karan Mehra', phone: '9823789012', classif: 'Internal Student', shift: 'Full day', feeStatus: 'Paid' },
        102: { name: 'Kunal Meshram', phone: '9823567890', classif: 'Internal Student', shift: 'Morning', feeStatus: 'Paid' },
        106: { name: 'Aditya Wankhade', phone: '9890456123', classif: 'Internal Student', shift: 'Full day', feeStatus: 'Paid' },
        109: { name: 'Pratiksha Patil', phone: '9890789012', classif: 'Internal Student', shift: 'Full day', feeStatus: 'Pending' },
        112: { name: 'Tanvi Barde', phone: '9823901234', classif: 'Internal Student', shift: 'Morning', feeStatus: 'Paid' },
        115: { name: 'Siddharth More', phone: '9822678901', classif: 'Internal Student', shift: 'Full day', feeStatus: 'Paid' },

        // Floor 2 Outsider (Purple)
        105: { name: 'Sanket Bawankule', phone: '9822019905', classif: 'Outsider Student', shift: 'Full day', feeStatus: 'Paid' },
        120: { name: 'Rupali Gadre', phone: '9822019906', classif: 'Outsider Student', shift: 'Evening', feeStatus: 'Paid' },
        135: { name: 'Vikramaditya Rao', phone: '9822019907', classif: 'Outsider Student', shift: 'Full day', feeStatus: 'Pending' }
      };

      // Firestore batches have max 500 operations. We split 200 into 4 batches of 50
      const chunkSize = 50;
      for (let start = 1; start <= 200; start += chunkSize) {
        const batch = writeBatch(db);
        const end = Math.min(start + chunkSize - 1, 200);

        for (let i = start; i <= end; i++) {
          const floor: 1 | 2 = i > 100 ? 2 : 1;
          const assigned = sampleOccupancies[i];
          const seatRef = doc(db, 'library_seats', String(i));

          if (assigned) {
            batch.set(seatRef, {
              seatNumber: i,
              floor,
              status: 'Occupied',
              studentName: assigned.name,
              phone: assigned.phone,
              phoneNumber: assigned.phone,
              classification: assigned.classif,
              studentClassification: assigned.classif,
              shift: assigned.shift,
              monthlyFee: 800,
              feeStatus: assigned.feeStatus,
              paymentStatus: assigned.feeStatus,
              startDate: '2025-06-01',
              lastPaidMonth: assigned.feeStatus === 'Paid' ? '2026-11' : null,
              notes: assigned.classif === 'Internal Student' ? 'Tuition enrolled student' : 'Self-study library subscriber',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }, { merge: true });
          } else {
            batch.set(seatRef, {
              seatNumber: i,
              floor,
              status: 'Vacant',
              studentName: null,
              phone: null,
              phoneNumber: null,
              classification: null,
              studentClassification: null,
              shift: 'Full day',
              monthlyFee: 800,
              feeStatus: 'Pending',
              paymentStatus: 'Pending',
              notes: '',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }, { merge: true });
          }
        }
        await batch.commit();
      }

      onShowToast('success', 'Successfully synchronized 200 seats across Floor 1 & Floor 2 in "library_seats"!');
      alert('✅ Success: All 200 seats across Floor 1 (1-100) and Floor 2 (101-200) have been synchronized into the "library_seats" Firestore collection!');
    } catch (err: unknown) {
      console.error('Error seeding 200 seats:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      onShowToast('error', `Failed to seed 200 library seats: ${errorMsg}`);
      alert(`⚠️ Firestore Sync Error:\nFailed to seed 200 library seats.\nReason: ${errorMsg}`);
    } finally {
      setIsGeneratingSeats(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const rows = displayedSeats.map(s => ({
      'Seat #': s.seatNumber,
      'Floor': `Floor ${s.floor}`,
      'Status': s.status === 'Occupied' ? 'Occupied' : 'Available',
      'Student Classification': s.status === 'Occupied' ? (s.classification || 'Internal Student') : 'N/A',
      'Student Name': s.studentName || 'Available Desk',
      'Phone': s.phone || s.phoneNumber || '',
      'Shift': s.shift,
      'Monthly Fee (INR)': s.monthlyFee,
      'Fee Status': s.status === 'Occupied' ? (s.feeStatus || s.paymentStatus || 'Pending') : 'N/A',
      'Last Paid Month': s.lastPaidMonth || '',
      'Start Date': s.startDate || '',
      'Notes': s.notes || ''
    }));

    const filename = `Sarvadnya_Library_Seats_${activeFloor === 'all' ? 'AllFloors' : `Floor${activeFloor}`}`;
    exportToCSV(filename, rows);
    onShowToast('info', `Exported ${rows.length} library desk records to CSV`);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Actions Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-[#6c3df4] p-0.5 shadow-md flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-display">Library Seat Management</h2>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30">
                  200 Total Desks
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                2-Floor matrix at Sarvashree Nagar with Internal vs. Outsider student classifications & 7 AM – 10 PM access
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#6c3df4] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Visual Seat Matrix"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-[#6c3df4] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {/* Seed 200 Seats */}
          <button
            onClick={handleSeed200Seats}
            disabled={isGeneratingSeats}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Initialize 200 seats into library_seats collection"
          >
            {isGeneratingSeats ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6c3df4]" /> : <RotateCcw className="w-3.5 h-3.5 text-amber-400" />}
            <span>Sync 200 Seats</span>
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

      {/* 2. PROMINENT 2-FLOOR SWITCHER TABS & SUMMARY CARDS */}
      <div className="space-y-4">
        
        {/* Floor Navigation Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Floor 1 Tab (Seats 1-100) */}
          <button
            type="button"
            onClick={() => setActiveFloor(1)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between shadow-lg ${
              activeFloor === 1
                ? 'bg-gradient-to-r from-slate-900 to-[#6c3df4]/20 border-[#6c3df4] shadow-[#6c3df4]/15 ring-1 ring-[#6c3df4]'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm font-display ${
                activeFloor === 1 ? 'bg-[#6c3df4] text-white shadow-md' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}>
                F1
              </div>
              <div>
                <div className="text-sm font-bold text-white font-display">Floor 1</div>
                <div className="text-xs text-slate-400">Seats 1 – 100 (Ground Floor)</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-400">{floor1Occupied} Occupied</span>
              <div className="text-[10px] text-slate-500">{100 - floor1Occupied} Available</div>
            </div>
          </button>

          {/* Floor 2 Tab (Seats 101-200) */}
          <button
            type="button"
            onClick={() => setActiveFloor(2)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between shadow-lg ${
              activeFloor === 2
                ? 'bg-gradient-to-r from-slate-900 to-[#6c3df4]/20 border-[#6c3df4] shadow-[#6c3df4]/15 ring-1 ring-[#6c3df4]'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm font-display ${
                activeFloor === 2 ? 'bg-[#6c3df4] text-white shadow-md' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}>
                F2
              </div>
              <div>
                <div className="text-sm font-bold text-white font-display">Floor 2</div>
                <div className="text-xs text-slate-400">Seats 101 – 200 (Quiet Zone)</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-400">{floor2Occupied} Occupied</span>
              <div className="text-[10px] text-slate-500">{100 - floor2Occupied} Available</div>
            </div>
          </button>

          {/* Both Floors Tab (1-200) */}
          <button
            type="button"
            onClick={() => setActiveFloor('all')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between shadow-lg ${
              activeFloor === 'all'
                ? 'bg-gradient-to-r from-slate-900 to-[#6c3df4]/20 border-[#6c3df4] shadow-[#6c3df4]/15 ring-1 ring-[#6c3df4]'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm font-display ${
                activeFloor === 'all' ? 'bg-[#6c3df4] text-white shadow-md' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}>
                ALL
              </div>
              <div>
                <div className="text-sm font-bold text-white font-display">All Floors</div>
                <div className="text-xs text-slate-400">Full 200 Carrels Overview</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-[#14b8a6]">{occupiedSeats.length} / 200 Total</span>
              <div className="text-[10px] text-slate-500">{availableSeats.length} Available</div>
            </div>
          </button>

        </div>

        {/* Counters & Classification Breakdown Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          
          {/* Total Capacity */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-md">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Total Capacity</span>
            <div className="text-2xl font-black text-white font-display mt-0.5">{totalSeatsCount}</div>
            <span className="text-[10px] text-slate-500">100 Seats Per Floor</span>
          </div>

          {/* Internal Students (BLUE) */}
          <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-center shadow-md">
            <div className="flex items-center justify-center gap-1.5 text-blue-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Internal Students</span>
            </div>
            <div className="text-2xl font-black text-blue-300 font-display mt-0.5">{internalStudentsCount}</div>
            <span className="text-[10px] text-blue-400/80">Sarvadnya Tuition Enrolled</span>
          </div>

          {/* Outsider Students (PURPLE) */}
          <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-center shadow-md">
            <div className="flex items-center justify-center gap-1.5 text-purple-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Outsider Students</span>
            </div>
            <div className="text-2xl font-black text-purple-300 font-display mt-0.5">{outsiderStudentsCount}</div>
            <span className="text-[10px] text-purple-400/80">Library-Only Users</span>
          </div>

          {/* Available Seats (GREEN) */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center shadow-md">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Available Desks</span>
            </div>
            <div className="text-2xl font-black text-emerald-300 font-display mt-0.5">{availableSeats.length}</div>
            <span className="text-[10px] text-emerald-400/80">Ready to Assign</span>
          </div>

          {/* Fees Status */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center col-span-2 sm:col-span-1 shadow-md">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Fee Collection</span>
            <div className="text-xl font-black font-display mt-0.5 flex items-baseline justify-center gap-1">
              <span className="text-emerald-400">{paidSeatsCount} Paid</span>
              <span className="text-xs text-slate-500">/</span>
              <span className="text-[#ff7a3d]">{pendingSeatsCount} Due</span>
            </div>
            <span className="text-[10px] text-amber-400 font-mono">₹{(occupiedSeats.length * 800).toLocaleString('en-IN')} Monthly</span>
          </div>

        </div>

      </div>

      {/* 3. Color Legend & Advanced Search / Filters */}
      <div className="space-y-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
        
        {/* Color Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Seat Color Key:
            </span>

            {/* Blue: Internal */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-semibold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.6)]" />
              <span>Blue: Internal Student</span>
            </div>

            {/* Purple: Outsider */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.6)]" />
              <span>Purple: Outsider Student</span>
            </div>

            {/* Green: Available */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              <span>Green: Available Desk</span>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Showing <span className="font-bold text-white">{displayedSeats.length}</span> of {totalSeatsCount} desks
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search seat #, student name, or phone..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] focus:outline-none text-xs text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Availability */}
            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value as 'all' | 'Available' | 'Occupied')}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            >
              <option value="all">All Desks</option>
              <option value="Available">Available Only (Green)</option>
              <option value="Occupied">Occupied Only</option>
            </select>

            {/* Classification */}
            <select
              value={filterClassification}
              onChange={(e) => setFilterClassification(e.target.value as 'all' | 'Internal Student' | 'Outsider Student')}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            >
              <option value="all">All Classifications</option>
              <option value="Internal Student">Internal Students (Blue)</option>
              <option value="Outsider Student">Outsider Students (Purple)</option>
            </select>

            {/* Fee Status */}
            <select
              value={filterFeeStatus}
              onChange={(e) => setFilterFeeStatus(e.target.value as 'all' | 'Paid' | 'Pending')}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            >
              <option value="all">All Fee Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending (Due)</option>
            </select>

            {/* Shift */}
            <select
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            >
              <option value="all">All Shifts</option>
              <option value="Full day">Full Day (7AM - 10PM)</option>
              <option value="Morning">Morning (7AM - 2PM)</option>
              <option value="Evening">Evening (2PM - 10PM)</option>
            </select>
          </div>

        </div>

      </div>

      {/* 4. VISUAL SEAT MAP GRID VIEW */}
      {viewMode === 'grid' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {displayedSeats.map((seat) => {
              const isOccupied = seat.status === 'Occupied';
              const classif = seat.classification || seat.studentClassification || 'Internal Student';
              const isInternal = isOccupied && classif === 'Internal Student';
              const isOutsider = isOccupied && classif === 'Outsider Student';
              const isAvailable = !isOccupied;

              const isFeePaid = isOccupied && (seat.feeStatus || seat.paymentStatus) === 'Paid';
              const studentDisplayName = seat.studentName || 'Available Desk';
              const studentPhone = seat.phone || seat.phoneNumber || '';

              // Dynamic color scheme based on user requirements:
              // Blue for Internal, Purple for Outsider, Green for Available
              let cardStyle = '';
              let badgeStyle = '';

              if (isAvailable) {
                cardStyle = 'bg-slate-950/90 border-emerald-500/30 hover:border-emerald-400 text-emerald-200 hover:shadow-emerald-500/10';
                badgeStyle = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
              } else if (isInternal) {
                cardStyle = 'bg-gradient-to-b from-blue-950/40 to-slate-950 border-blue-500/50 hover:border-blue-400 text-blue-200 shadow-blue-500/5 hover:shadow-blue-500/15';
                badgeStyle = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
              } else {
                cardStyle = 'bg-gradient-to-b from-purple-950/40 to-slate-950 border-purple-500/50 hover:border-purple-400 text-purple-200 shadow-purple-500/5 hover:shadow-purple-500/15';
                badgeStyle = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
              }

              return (
                <div
                  key={seat.seatNumber}
                  onClick={() => handleOpenSeatModal(seat)}
                  className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[160px] hover:-translate-y-1 shadow-lg ${cardStyle}`}
                >
                  {/* Top Bar: Seat Number + Floor + Classification Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-mono font-black text-white">
                          #{String(seat.seatNumber).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          F{seat.floor}
                        </span>
                      </div>

                      {/* Status indicator glow dot */}
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        isAvailable
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
                          : isInternal
                          ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.7)]'
                          : 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.7)]'
                      }`} />
                    </div>

                    {/* Classification Tag */}
                    <div className="mb-2">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border inline-block ${badgeStyle}`}>
                        {isAvailable ? 'Available' : classif === 'Internal Student' ? 'Internal' : 'Outsider'}
                      </span>
                    </div>

                    {/* Student Info or Available Prompt */}
                    {isOccupied ? (
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white truncate font-display" title={studentDisplayName}>
                          {studentDisplayName}
                        </h4>
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          {studentPhone}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{seat.shift}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2.5">
                        <span className="text-xs font-semibold text-emerald-400/90 block">
                          Vacant Desk
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block group-hover:text-amber-400 transition-colors">
                          + Tap to allocate
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Bar: Fee Status (1-Tap Toggle) & Monthly Rate */}
                  <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    {isOccupied ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleTogglePayment(seat, e)}
                          className={`font-mono font-bold px-2 py-0.5 rounded transition-transform active:scale-95 cursor-pointer border ${
                            isFeePaid 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                          }`}
                          title="Click to toggle Paid/Pending fee"
                        >
                          {isFeePaid ? 'PAID' : 'PENDING'}
                        </button>
                        <span className="font-mono text-slate-400 font-bold">
                          ₹{seat.monthlyFee || 800}
                        </span>
                      </>
                    ) : (
                      <div className="w-full text-center text-[10px] text-emerald-500/80 font-mono">
                        Floor {seat.floor} · Ready
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-4">Seat #</th>
                  <th className="p-4">Floor</th>
                  <th className="p-4">Classification</th>
                  <th className="p-4">Student Details</th>
                  <th className="p-4">Shift</th>
                  <th className="p-4">Fee Status (1-Tap)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {displayedSeats.map((seat) => {
                  const isOccupied = seat.status === 'Occupied';
                  const classif = seat.classification || seat.studentClassification || 'Internal Student';
                  const isInternal = isOccupied && classif === 'Internal Student';
                  const isOutsider = isOccupied && classif === 'Outsider Student';
                  const isFeePaid = isOccupied && (seat.feeStatus || seat.paymentStatus) === 'Paid';

                  return (
                    <tr key={seat.seatNumber} className="hover:bg-slate-950/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-white">#{seat.seatNumber}</td>
                      <td className="p-4 font-mono text-slate-300">Floor {seat.floor}</td>
                      <td className="p-4">
                        {isOccupied ? (
                          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                            isInternal ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          }`}>
                            {classif}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Available
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {isOccupied ? (
                          <div>
                            <div className="font-semibold text-white">{seat.studentName}</div>
                            <div className="text-[11px] font-mono text-slate-400">{seat.phone || seat.phoneNumber}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Vacant Desk</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-300">{seat.shift}</td>
                      <td className="p-4">
                        {isOccupied ? (
                          <button
                            onClick={() => handleTogglePayment(seat)}
                            className={`font-mono font-bold px-2.5 py-1 rounded-lg text-[10px] cursor-pointer ${
                              isFeePaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#ff7a3d]/20 text-[#ff7a3d]'
                            }`}
                          >
                            {isFeePaid ? 'Paid' : 'Pending'}
                          </button>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenSeatModal(seat)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 cursor-pointer"
                        >
                          {isOccupied ? 'Manage' : 'Assign'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SEAT ALLOCATION / EDIT MODAL */}
      {selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl text-left max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedSeat(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/25">
                  Seat #{selectedSeat.seatNumber} · Floor {selectedSeat.floor}
                </span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-lg border ${
                  selectedSeat.status === 'Occupied' ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}>
                  {selectedSeat.status === 'Occupied' ? 'Currently Occupied' : 'Vacant Desk'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white font-display">
                {selectedSeat.status === 'Occupied' ? 'Manage Desk Assignment' : 'Allocate Study Carrel'}
              </h3>
            </div>

            <form onSubmit={handleSaveSeat} className="space-y-4">
              
              {/* STUDENT CLASSIFICATION (Internal vs Outsider) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Student Classification <span className="text-[#ff7a3d]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAssignForm({ ...assignForm, classification: 'Internal Student' })}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      assignForm.classification === 'Internal Student'
                        ? 'bg-blue-500/20 border-blue-500 text-white shadow-md shadow-blue-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">Internal Student</div>
                      <div className="text-[10px] text-blue-300/80 mt-0.5">Sarvadnya Tuition Enrolled</div>
                    </div>
                    {assignForm.classification === 'Internal Student' && (
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssignForm({ ...assignForm, classification: 'Outsider Student', studentId: '' })}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      assignForm.classification === 'Outsider Student'
                        ? 'bg-purple-500/20 border-purple-500 text-white shadow-md shadow-purple-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">Outsider Student</div>
                      <div className="text-[10px] text-purple-300/80 mt-0.5">Library-Only Subscriber</div>
                    </div>
                    {assignForm.classification === 'Outsider Student' && (
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Fast choose from enrolled tuition students if Internal */}
              {assignForm.classification === 'Internal Student' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Select Enrolled Tuition Student
                  </label>
                  <select
                    value={assignForm.studentId}
                    onChange={(e) => handleSelectEnrolledStudent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-xs text-white"
                  >
                    <option value="">-- Choose from Directory or enter below --</option>
                    {students.filter(s => s.status === 'Active').map(st => (
                      <option key={st.id} value={st.id}>
                        {st.studentName || st.name} ({st.class || st.standard}) · {st.phoneNumber || st.phone}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Student Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Student Full Name <span className="text-[#ff7a3d]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={assignForm.studentName}
                    onChange={(e) => setAssignForm({ ...assignForm, studentName: e.target.value })}
                    placeholder="e.g. Vedant Thakre"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Phone Number (10 digits) <span className="text-[#ff7a3d]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={assignForm.phone}
                    onChange={(e) => setAssignForm({ ...assignForm, phone: e.target.value })}
                    placeholder="e.g. 7020035514"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-sm text-white"
                  />
                </div>
              </div>

              {/* Shift, Fee & Fee Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Daily Shift
                  </label>
                  <select
                    value={assignForm.shift}
                    onChange={(e) => setAssignForm({ ...assignForm, shift: e.target.value as SeatShift })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-xs text-white"
                  >
                    <option value="Full day">Full day (7AM - 10PM)</option>
                    <option value="Morning">Morning (7AM - 2PM)</option>
                    <option value="Evening">Evening (2PM - 10PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Monthly Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={assignForm.monthlyFee}
                    onChange={(e) => setAssignForm({ ...assignForm, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Fee Status
                  </label>
                  <select
                    value={assignForm.feeStatus}
                    onChange={(e) => setAssignForm({ ...assignForm, feeStatus: e.target.value as PaymentStatus })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-xs text-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending (Due)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Notes / Study Timetable
                </label>
                <textarea
                  rows={2}
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  placeholder="Targeting NEET 2026, requires corner desk..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-sm text-white resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  {selectedSeat.status === 'Occupied' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetSeatNumber(selectedSeat.seatNumber <= 100 ? 101 : 1);
                          setIsMoveModalOpen(true);
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Move to another vacant seat on Floor 1 or Floor 2"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                        <span>Move Desk</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleVacateSeat(selectedSeat.seatNumber)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors cursor-pointer"
                        title="Vacate seat"
                      >
                        Vacate
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSeat(null)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#6c3df4] hover:bg-[#5b2ce3] disabled:opacity-60 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#6c3df4]/25"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Desk</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 6. MOVE SEAT DIALOG ACROSS FLOORS */}
      {isMoveModalOpen && selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Move {selectedSeat.studentName}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Moving from Seat #{selectedSeat.seatNumber} (Floor {selectedSeat.floor}). Select destination seat:
            </p>
            <select
              value={targetSeatNumber}
              onChange={(e) => setTargetSeatNumber(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white mb-4"
            >
              {completeSeatsList
                .filter(s => s.status === 'Vacant' && s.seatNumber !== selectedSeat.seatNumber)
                .sort((a, b) => a.seatNumber - b.seatNumber)
                .map(s => (
                  <option key={s.seatNumber} value={s.seatNumber}>
                    Seat #{s.seatNumber} (Floor {s.floor}) — Available
                  </option>
                ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsMoveModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 bg-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={isMoving}
                onClick={handleMoveSeat}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 flex items-center gap-1.5 cursor-pointer"
              >
                {isMoving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Move</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
