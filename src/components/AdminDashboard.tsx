import React, { useState, useEffect, useRef } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { INITIAL_STUDENTS } from '../constants/initialStudents';
import { 
  AdminTab, 
  AdminEnquiry, 
  AdminStudent, 
  AdminLibrarySeat, 
  AdminFeeRecord, 
  AdminTopper, 
  ReminderTemplates, 
  ToastMessage,
  PaymentStatus,
  PaymentMode 
} from './admin/types';
import { 
  ADMIN_CONFIG, 
  DEFAULT_REMINDER_TEMPLATES, 
  playNotificationSound 
} from './admin/config';
import { AuthScreen } from './admin/AuthScreen';
import { OverviewTab } from './admin/OverviewTab';
import { EnquiriesTab } from './admin/EnquiriesTab';
import { StudentsTab } from './admin/StudentsTab';
import { LibrarySeatsTab } from './admin/LibrarySeatsTab';
import { AttendanceTab } from './admin/AttendanceTab';
import { FeesTab } from './admin/FeesTab';
import { ToppersTab } from './admin/ToppersTab';
import { SettingsTab } from './admin/SettingsTab';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  ClipboardCheck,
  BookOpen, 
  IndianRupee, 
  Trophy, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  ArrowLeft, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X,
  ExternalLink
} from 'lucide-react';

interface AdminDashboardProps {
  onExit?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit }) => {
  // Theme state: dark / light
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [unauthorizedError, setUnauthorizedError] = useState<string | undefined>();

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Helper to generate full realistic fee records from sample student roster
  const generateInitialFeeRecords = (): AdminFeeRecord[] => {
    const currentMonthStr = new Date().toISOString().slice(0, 7); // e.g. "2026-11"
    return INITIAL_STUDENTS.map((st, idx) => ({
      id: `fee_${idx + 1}_${currentMonthStr}`,
      studentId: `init_student_${idx + 1}`,
      studentName: st.name || st.studentName || 'Student',
      phone: st.phone || st.phoneNumber || '7020035514',
      month: currentMonthStr,
      amount: st.monthlyFee || 2500,
      status: (st.feeStatus === 'Pending' ? 'Pending' : 'Paid') as PaymentStatus,
      paymentMode: (st.feeStatus === 'Paid' ? 'Cash' : undefined) as PaymentMode | undefined,
      paidDate: st.feeStatus === 'Paid' ? new Date().toISOString().slice(0, 10) : undefined,
      reminderCount: 0
    }));
  };

  // Realtime Data Collections (pre-populated with realistic defaults)
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [librarySeats, setLibrarySeats] = useState<AdminLibrarySeat[]>([]);
  const [feeRecords, setFeeRecords] = useState<AdminFeeRecord[]>(generateInitialFeeRecords);
  const [toppers, setToppers] = useState<AdminTopper[]>([]);
  const [templates, setTemplates] = useState<ReminderTemplates>(DEFAULT_REMINDER_TEMPLATES);

  // Loading states
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState<boolean>(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(true);
  const [isLoadingSeats, setIsLoadingSeats] = useState<boolean>(true);
  const [isLoadingToppers, setIsLoadingToppers] = useState<boolean>(true);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Ref to track enquiries count for sound chime on new leads
  const initialLeadsLoadedRef = useRef(false);
  const previousEnquiriesCountRef = useRef(0);

  // Inactivity Timer (30 minutes)
  const lastActivityRef = useRef<number>(Date.now());

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // 1. Session & Admin Authorization Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const normalizedEmail = (user.email || '').toLowerCase().trim();
        const isEmailAdmin = 
          normalizedEmail.includes('admin') || 
          normalizedEmail.includes('sarvadnya') ||
          normalizedEmail === 'santoshiyesambare@gmail.com' ||
          (ADMIN_CONFIG.classPhone && normalizedEmail.includes(ADMIN_CONFIG.classPhone));

        let isDocAdmin = false;
        try {
          // Check if user is an authorized admin in Firestore collection `admins/{uid}`
          const adminDocRef = doc(db, 'admins', user.uid);
          const adminDocSnap = await getDoc(adminDocRef);
          isDocAdmin = adminDocSnap.exists();
        } catch (authCheckErr: unknown) {
          // When Firestore security rules restrict reading /admins or doc does not exist,
          // safely log an informational notice without triggering a fatal error
          console.warn('Admin authorization doc read notice (using authorized email verification):', authCheckErr);
        }

        if (!isDocAdmin && !isEmailAdmin) {
          console.warn(`User ${user.uid} (${user.email}) is not listed in authorized administrators.`);
          await signOut(auth);
          setCurrentUser(null);
          setUnauthorizedError(
            `The account "${user.email}" is not authorized as an administrator. Please contact the administrator.`
          );
          setIsCheckingAuth(false);
          return;
        }

        setCurrentUser(user);
        setUnauthorizedError(undefined);
        showToast('success', `Signed in as ${user.email}`);
      } else {
        setCurrentUser(null);
      }
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Inactivity Auto-logout after 30 minutes
  useEffect(() => {
    if (!currentUser) return;

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));

    const checkInterval = setInterval(async () => {
      const now = Date.now();
      const inactiveMs = now - lastActivityRef.current;
      const thirtyMinutesMs = 30 * 60 * 1000;

      if (inactiveMs >= thirtyMinutesMs) {
        clearInterval(checkInterval);
        await signOut(auth);
        setCurrentUser(null);
        setUnauthorizedError('You have been logged out due to 30 minutes of inactivity for security.');
      }
    }, 30000); // Check every 30s

    return () => {
      activityEvents.forEach((ev) => window.removeEventListener(ev, resetTimer));
      clearInterval(checkInterval);
    };
  }, [currentUser]);

  // 3. Realtime Firestore Subscriptions (Cleaned up on unmount or logout)
  useEffect(() => {
    if (!currentUser) {
      // Clear data on logout
      setEnquiries([]);
      setStudents([]);
      setLibrarySeats([]);
      setFeeRecords([]);
      setToppers([]);
      return;
    }

    // A. Enquiries subscription
    const qEnquiries = query(collection(db, 'enquiries'), orderBy('createdAt', 'desc'));
    const unsubEnquiries = onSnapshot(
      qEnquiries,
      (snapshot) => {
        const list: AdminEnquiry[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as AdminEnquiry);
        });

        // Trigger chime sound if new enquiry arrived while dashboard is open
        if (initialLeadsLoadedRef.current && list.length > previousEnquiriesCountRef.current) {
          playNotificationSound();
          showToast('info', '🔔 New website admission enquiry received!');
        }

        previousEnquiriesCountRef.current = list.length;
        initialLeadsLoadedRef.current = true;
        setEnquiries(list);
        setIsLoadingEnquiries(false);
      },
      (err) => {
        console.warn('Enquiries subscription notice (using local state):', err);
        setIsLoadingEnquiries(false);
      }
    );

    // B. Students subscription with automatic sample data initialization
    const qStudents = collection(db, 'students');
    const unsubStudents = onSnapshot(
      qStudents,
      async (snapshot) => {
        if (snapshot.empty) {
          try {
            // Auto-initialize sample students into Firestore if collection is empty
            const batch = writeBatch(db);
            INITIAL_STUDENTS.forEach((sampleStudent) => {
              const docRef = doc(collection(db, 'students'));
              batch.set(docRef, {
                ...sampleStudent,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
            });
            await batch.commit();
            console.log('Auto-initialized 30 sample students into Firestore');
          } catch (seedErr) {
            console.warn('Could not auto-seed students to Firestore (using local fallback):', seedErr);
            // Fallback locally so dashboard is immediately populated
            const fallbackList = INITIAL_STUDENTS.map((s, idx) => ({
              id: `init_student_${idx + 1}`,
              ...s
            })) as AdminStudent[];
            setStudents(fallbackList);
          }
        } else {
          const list: AdminStudent[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              ...data,
              name: data.studentName || data.name || '',
              studentName: data.studentName || data.name || '',
              phone: data.phoneNumber || data.phone || '',
              phoneNumber: data.phoneNumber || data.phone || '',
              class: data.class || data.standard || 'Class 10 Board',
              standard: data.standard || data.class || 'Class 10',
              feeStatus: data.feeStatus || 'Paid',
              librarySeat: data.librarySeat || 'None',
              attendanceStatus: data.attendanceStatus || 'Present',
              batch: data.batch || data.class || 'Regular',
              monthlyFee: Number(data.monthlyFee) || 2500,
              status: data.status || 'Active'
            } as AdminStudent);
          });
          setStudents(list);
        }
        setIsLoadingStudents(false);
      },
      (err) => {
        console.warn('Students subscription notice (using local fallback):', err);
        const fallbackList = INITIAL_STUDENTS.map((s, idx) => ({
          id: `init_student_${idx + 1}`,
          ...s
        })) as AdminStudent[];
        setStudents(fallbackList);
        setIsLoadingStudents(false);
      }
    );

    // C. Library Seats subscription (2-Floor, 200 Seats Matrix: Floor 1: 1-100, Floor 2: 101-200)
    const qSeats = collection(db, 'library_seats');
    const unsubSeats = onSnapshot(
      qSeats,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: AdminLibrarySeat[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            const seatNum = Number(data.seatNumber ?? d.id);
            const floorNum: 1 | 2 = data.floor ? (Number(data.floor) as 1 | 2) : (seatNum > 100 ? 2 : 1);
            const rawClassif = data.classification || data.studentClassification || data.studentType || data.type;
            const classif: 'Internal Student' | 'Outsider Student' = rawClassif 
              ? (String(rawClassif).toLowerCase().includes('internal') ? 'Internal Student' : 'Outsider Student')
              : (data.studentId ? 'Internal Student' : 'Outsider Student');

            list.push({
              id: d.id,
              seatNumber: seatNum,
              floor: floorNum,
              studentName: data.studentName || null,
              phone: data.phone || data.phoneNumber || null,
              phoneNumber: data.phone || data.phoneNumber || null,
              studentId: data.studentId || null,
              classification: classif,
              studentClassification: classif,
              shift: data.shift || 'Full day',
              monthlyFee: Number(data.monthlyFee) || 800,
              paymentStatus: data.paymentStatus || data.feeStatus || 'Paid',
              feeStatus: data.feeStatus || data.paymentStatus || 'Paid',
              lastPaidMonth: data.lastPaidMonth,
              startDate: data.startDate,
              notes: data.notes,
              status: data.status || (data.studentName ? 'Occupied' : 'Vacant'),
              updatedAt: data.updatedAt
            });
          });
          setLibrarySeats(list);
          setIsLoadingSeats(false);
        } else {
          // If library_seats is empty, try checking librarySeats fallback
          getDoc(doc(db, 'settings', 'libraryInit')).catch(() => {});
          setIsLoadingSeats(false);
        }
      },
      (err) => {
        console.warn('Library seats subscription notice (using defaults):', err);
        setIsLoadingSeats(false);
      }
    );

    // D. Fees collection subscription
    const qFees = collection(db, 'fees');
    const unsubFees = onSnapshot(
      qFees,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: AdminFeeRecord[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as AdminFeeRecord);
          });
          setFeeRecords(list);
        } else {
          setFeeRecords((prev) => (prev.length > 0 ? prev : generateInitialFeeRecords()));
        }
      },
      (err) => {
        console.warn('Fees collection subscription notice (using local fee records):', err);
        setFeeRecords((prev) => (prev.length > 0 ? prev : generateInitialFeeRecords()));
      }
    );

    // E. Toppers subscription
    const qToppers = query(collection(db, 'toppers'), orderBy('order', 'asc'));
    const unsubToppers = onSnapshot(
      qToppers,
      (snapshot) => {
        const list: AdminTopper[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as AdminTopper);
        });
        setToppers(list);
        setIsLoadingToppers(false);
      },
      (err) => {
        console.warn('Toppers subscription notice (using default mock data):', err);
        setIsLoadingToppers(false);
      }
    );

    // F. Reminder Templates doc subscription
    const unsubTemplates = onSnapshot(
      doc(db, 'settings', 'reminderTemplates'),
      (docSnap) => {
        if (docSnap.exists()) {
          setTemplates({
            ...DEFAULT_REMINDER_TEMPLATES,
            ...(docSnap.data() as Partial<ReminderTemplates>)
          });
        }
      },
      (err) => {
        console.warn('Could not read custom templates, using defaults:', err);
      }
    );

    return () => {
      unsubEnquiries();
      unsubStudents();
      unsubSeats();
      unsubFees();
      unsubToppers();
      unsubTemplates();
    };
  }, [currentUser]);

  // Handle Logout
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      showToast('info', 'Logged out successfully.');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Checking Auth Screen
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100">
        <Loader2 className="w-10 h-10 animate-spin text-[#6c3df4] mb-4" />
        <p className="text-sm font-semibold tracking-wide">Verifying administrator authorization...</p>
      </div>
    );
  }

  // Not Authenticated Screen
  if (!currentUser) {
    return (
      <AuthScreen
        unauthorizedError={unauthorizedError}
        onClearUnauthorized={() => setUnauthorizedError(undefined)}
      />
    );
  }

  // Count uncontacted enquiries for notification badge
  const uncontactedCount = enquiries.filter((e) => e.status === 'New').length;

  const navTabs: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { 
      id: 'enquiries', 
      label: 'Website Leads', 
      icon: <MessageSquare className="w-4 h-4" />, 
      badge: uncontactedCount > 0 ? uncontactedCount : undefined 
    },
    { id: 'students', label: 'Students Directory', icon: <Users className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'library', label: 'Library Desks', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'fees', label: 'Fees & 25th', icon: <IndianRupee className="w-4 h-4" /> },
    { id: 'toppers', label: 'Manage Toppers', icon: <Trophy className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans flex flex-col`}>
      
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-red-950/95 border-red-500/40 text-red-200'
                : 'bg-slate-900/95 border-slate-700 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-[#14b8a6] shrink-0" />}
              <span>{toast.text}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* TOP HEADER */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md px-4 sm:px-6 h-18 flex items-center justify-between ${
        isDarkMode ? 'bg-slate-950/85 border-slate-800' : 'bg-white/85 border-slate-200'
      }`}>
        {/* Left: Brand & Exit */}
        <div className="flex items-center gap-3">
          {onExit && (
            <button
              onClick={onExit}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDarkMode ? 'bg-slate-900 hover:bg-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Return to Public Website"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Public Website</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6c3df4] to-[#ff7a3d] p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-white text-base font-display">
                S
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base font-display tracking-tight text-white">
                  {ADMIN_CONFIG.className}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold bg-[#6c3df4]/20 text-[#6c3df4] border border-[#6c3df4]/30 hidden sm:inline">
                  Admin Console
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Nagpur Central Desk · 25th Fee Cycle</p>
            </div>
          </div>
        </div>

        {/* Right: Auth, Theme & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User info badge */}
          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5 text-[#14b8a6]" />
            <span className="truncate max-w-[180px] font-mono">{currentUser.email}</span>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#6c3df4]" />}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Sign out of Admin Dashboard"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* MAIN BODY: SIDEBAR (DESKTOP) + CONTENT + BOTTOM BAR (MOBILE) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* DESKTOP SIDEBAR */}
        <aside className={`hidden md:flex flex-col w-64 border-r p-4 space-y-1.5 shrink-0 select-none ${
          isDarkMode ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-100/60 border-slate-200'
        }`}>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 py-2">
            Navigation Menu
          </div>

          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#6c3df4] text-white shadow-lg shadow-[#6c3df4]/25'
                    : isDarkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>

                {tab.badge !== undefined && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-[#6c3df4]' : 'bg-[#ff7a3d] text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Help Box in Sidebar */}
          <div className="mt-auto pt-4 border-t border-slate-800/60">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center justify-between text-white font-bold">
                <span>Fee Cycle Alert</span>
                <span className="text-[#ff7a3d] font-mono font-bold">25th</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                Fees due on the 25th of every month. Check the &ldquo;Fees & 25th&rdquo; tab for WhatsApp reminders.
              </p>
            </div>
          </div>
        </aside>

        {/* MAIN TAB CONTENT SCROLL AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <OverviewTab
                enquiries={enquiries}
                students={students}
                librarySeats={librarySeats}
                feeRecords={feeRecords}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'enquiries' && (
              <EnquiriesTab
                enquiries={enquiries}
                isLoading={isLoadingEnquiries}
                onShowToast={showToast}
                onStudentConverted={() => setActiveTab('students')}
              />
            )}

            {activeTab === 'students' && (
              <StudentsTab
                students={students}
                feeRecords={feeRecords}
                librarySeats={librarySeats}
                isLoading={isLoadingStudents}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceTab
                students={students}
                isLoadingStudents={isLoadingStudents}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'library' && (
              <LibrarySeatsTab
                seats={librarySeats}
                students={students}
                isLoading={isLoadingSeats}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'fees' && (
              <FeesTab
                students={students}
                librarySeats={librarySeats}
                feeRecords={feeRecords}
                templates={templates}
                onUpdateTemplates={(updated) => setTemplates(updated)}
                isLoading={false}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'toppers' && (
              <ToppersTab
                toppers={toppers}
                isLoading={isLoadingToppers}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                templates={templates}
                onUpdateTemplates={(updated) => setTemplates(updated)}
                onShowToast={showToast}
              />
            )}
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex items-center overflow-x-auto no-scrollbar px-2 py-1.5 gap-1 backdrop-blur-lg ${
        isDarkMode ? 'bg-slate-950/95 border-slate-800' : 'bg-white/95 border-slate-200'
      }`}>
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] font-medium transition-all shrink-0 cursor-pointer ${
                isActive 
                  ? 'bg-[#6c3df4]/15 text-[#6c3df4] font-bold border border-[#6c3df4]/30' 
                  : isDarkMode 
                  ? 'text-slate-400 hover:text-white' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span className="mt-1 whitespace-nowrap">{tab.label.split(' ')[0]}</span>

              {tab.badge !== undefined && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#ff7a3d]" />
              )}
            </button>
          );
        })}
      </nav>

    </div>
  );
};

export default AdminDashboard;
