import React, { useState } from 'react';
import { 
  updateDoc, 
  deleteDoc, 
  doc, 
  addDoc, 
  collection, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { AdminEnquiry, EnquiryStatus } from './types';
import { 
  ADMIN_CONFIG, 
  buildWhatsAppUrl, 
  formatTimestamp, 
  exportToCSV, 
  normalizePhone 
} from './config';
import { 
  Search, 
  Download, 
  Filter, 
  Phone, 
  MessageCircle, 
  UserCheck, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  X, 
  Loader2,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';

interface EnquiriesTabProps {
  enquiries: AdminEnquiry[];
  isLoading: boolean;
  onShowToast: (type: 'success' | 'error' | 'info', text: string) => void;
  onStudentConverted?: () => void;
}

export const EnquiriesTab: React.FC<EnquiriesTabProps> = ({
  enquiries,
  isLoading,
  onShowToast,
  onStudentConverted
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Convert to Student Modal State
  const [convertingEnquiry, setConvertingEnquiry] = useState<AdminEnquiry | null>(null);
  const [convertBatch, setConvertBatch] = useState('Std 10 - Morning');
  const [convertFee, setConvertFee] = useState(2500);
  const [isConverting, setIsConverting] = useState(false);

  // Delete Confirmation State
  const [deletingEnquiry, setDeletingEnquiry] = useState<AdminEnquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status updating indicator
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const getEnquiryDate = (e: AdminEnquiry): Date => {
    if (!e.createdAt) return new Date(0);
    if (typeof e.createdAt === 'object' && e.createdAt !== null && 'toDate' in e.createdAt) {
      return (e.createdAt as { toDate: () => Date }).toDate();
    }
    return new Date(e.createdAt as string | number);
  };

  // Filter and sort enquiries
  const filteredEnquiries = enquiries.filter((item) => {
    const matchesSearch = 
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phoneNumber.includes(searchTerm) ||
      (item.message && item.message.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesProgram = selectedProgram === 'all' || item.program === selectedProgram;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

    return matchesSearch && matchesProgram && matchesStatus;
  }).sort((a, b) => {
    const timeA = getEnquiryDate(a).getTime();
    const timeB = getEnquiryDate(b).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  // Handle status update
  const handleStatusChange = async (enquiryId: string, newStatus: EnquiryStatus) => {
    setUpdatingId(enquiryId);
    try {
      await updateDoc(doc(db, 'enquiries', enquiryId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      onShowToast('success', `Status updated to "${newStatus}"`);
    } catch (err) {
      console.error('Error updating enquiry status:', err);
      onShowToast('error', 'Failed to update status. Check permissions.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle delete enquiry
  const confirmDelete = async () => {
    if (!deletingEnquiry) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'enquiries', deletingEnquiry.id));
      onShowToast('success', `Enquiry from ${deletingEnquiry.studentName} deleted`);
      setDeletingEnquiry(null);
    } catch (err) {
      console.error('Error deleting enquiry:', err);
      onShowToast('error', 'Failed to delete lead.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle convert to student
  const handleConvertStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingEnquiry) return;

    setIsConverting(true);
    try {
      // 1. Create student document
      await addDoc(collection(db, 'students'), {
        name: convertingEnquiry.studentName.trim(),
        phone: normalizePhone(convertingEnquiry.phoneNumber),
        parentName: '',
        parentPhone: '',
        standard: convertingEnquiry.program,
        board: 'State Board',
        medium: 'English',
        batch: convertBatch,
        joinDate: new Date().toISOString().slice(0, 10),
        monthlyFee: Number(convertFee) || 2500,
        status: 'Active',
        notes: `Converted from Website Enquiry: "${convertingEnquiry.message || ''}"`,
        createdAt: serverTimestamp()
      });

      // 2. Update enquiry status to 'Admitted'
      await updateDoc(doc(db, 'enquiries', convertingEnquiry.id), {
        status: 'Admitted',
        admittedAt: serverTimestamp()
      });

      onShowToast('success', `${convertingEnquiry.studentName} enrolled into Student Roster!`);
      if (onStudentConverted) onStudentConverted();
      setConvertingEnquiry(null);
    } catch (err) {
      console.error('Error converting lead to student:', err);
      onShowToast('error', 'Failed to convert lead to student.');
    } finally {
      setIsConverting(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const rows = filteredEnquiries.map(item => ({
      'Student Name': item.studentName,
      'Phone': item.phoneNumber,
      'Program': item.program,
      'Status': item.status,
      'Message': item.message || '',
      'Source': item.source || 'Website',
      'Submitted Date': formatTimestamp(item.createdAt)
    }));
    exportToCSV('Sarvadnya_Website_Enquiries', rows);
    onShowToast('info', 'Exported enquiries to CSV');
  };

  const getStatusBadgeStyle = (status: EnquiryStatus) => {
    switch (status) {
      case 'New':
        return 'bg-[#ff7a3d]/15 text-[#ff7a3d] border-[#ff7a3d]/30';
      case 'Contacted':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Admitted':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Not interested':
        return 'bg-slate-700/30 text-slate-400 border-slate-700/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search / Filters Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white font-display">Website Enquiries</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#6c3df4]/15 text-[#6c3df4] font-semibold border border-[#6c3df4]/30">
              {filteredEnquiries.length} leads
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Realtime leads from admissions form and WhatsApp enquiry modals
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] focus:outline-none text-xs text-white placeholder:text-slate-500"
            />
          </div>

          {/* Program Filter */}
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] focus:outline-none text-xs text-white"
          >
            <option value="all">All Programs</option>
            {ADMIN_CONFIG.allowedPrograms.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] focus:outline-none text-xs text-white"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Admitted">Admitted</option>
            <option value="Not interested">Not interested</option>
          </select>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title={sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Leads Table / Responsive Cards */}
      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#6c3df4]" />
          <p className="text-sm">Connecting to live enquiries stream...</p>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-3">
          <CheckCircle2 className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-slate-300">No Enquiries Found</h3>
          <p className="text-xs max-w-sm mx-auto">
            {searchTerm || selectedProgram !== 'all' || selectedStatus !== 'all'
              ? 'No leads match your current search and filters. Try adjusting your filter parameters.'
              : 'New website visitor admission enquiries will appear here automatically in real time.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEnquiries.map((enq) => {
            const isRecent24h = getEnquiryDate(enq) >= oneDayAgo;
            const whatsappText = `Hello ${enq.studentName}, this is ${ADMIN_CONFIG.className}, Nagpur. We received your admission enquiry regarding our ${enq.program} coaching and library facility. We would be glad to share batch schedules and fee details with you.`;
            const whatsappUrl = buildWhatsAppUrl(enq.phoneNumber, whatsappText);

            return (
              <div
                key={enq.id}
                className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Lead Identity & Query */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-base text-white">
                      {enq.studentName}
                    </span>
                    <span className="text-xs font-mono font-medium text-[#14b8a6] bg-[#14b8a6]/10 px-2.5 py-0.5 rounded-full border border-[#14b8a6]/20">
                      {enq.program}
                    </span>
                    {isRecent24h && (
                      <span className="text-[10px] uppercase font-extrabold text-[#ff7a3d] bg-[#ff7a3d]/15 px-2 py-0.5 rounded-full animate-pulse border border-[#ff7a3d]/30">
                        NEW (Last 24h)
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400">
                    <span className="font-mono text-slate-300">Ph: {enq.phoneNumber}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatTimestamp(enq.createdAt)}</span>
                    </span>
                    {enq.source && (
                      <>
                        <span>·</span>
                        <span className="text-slate-500">{enq.source}</span>
                      </>
                    )}
                  </div>

                  {enq.message ? (
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed max-w-2xl">
                      &ldquo;{enq.message}&rdquo;
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">No custom notes submitted.</span>
                  )}
                </div>

                {/* Right: Actions & Status Dropdown */}
                <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center shrink-0">
                  
                  {/* Status Dropdown */}
                  <div className="relative">
                    <select
                      value={enq.status}
                      disabled={updatingId === enq.id}
                      onChange={(e) => handleStatusChange(enq.id, e.target.value as EnquiryStatus)}
                      className={`text-xs font-bold px-3 py-2 rounded-xl border appearance-none pr-7 cursor-pointer transition-colors focus:outline-none ${getStatusBadgeStyle(enq.status)}`}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Admitted">Admitted</option>
                      <option value="Not interested">Not interested</option>
                    </select>
                  </div>

                  {/* WhatsApp Direct Chat */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 flex items-center gap-1.5 transition-colors"
                    title="Open pre-filled chat in WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Direct Phone Call */}
                  <a
                    href={`tel:${enq.phoneNumber}`}
                    className="p-2 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                    title="Call student directly"
                  >
                    <Phone className="w-4 h-4 text-[#14b8a6]" />
                  </a>

                  {/* Convert to Student Button */}
                  {enq.status !== 'Admitted' && (
                    <button
                      onClick={() => {
                        setConvertingEnquiry(enq);
                        setConvertBatch(ADMIN_CONFIG.batches[0]);
                        setConvertFee(ADMIN_CONFIG.defaultMonthlyFees[enq.program as keyof typeof ADMIN_CONFIG.defaultMonthlyFees] || 2500);
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-[#6c3df4]/15 hover:bg-[#6c3df4]/25 border border-[#6c3df4]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Enrol as student in database"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#6c3df4]" />
                      <span>Convert</span>
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeletingEnquiry(enq)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 transition-colors cursor-pointer"
                    title="Delete lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Convert to Student Modal */}
      {convertingEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setConvertingEnquiry(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#14b8a6] bg-[#14b8a6]/10 px-2 py-0.5 rounded border border-[#14b8a6]/20">
                Admission Confirmation
              </span>
              <h3 className="text-lg font-bold text-white mt-1">Convert Lead to Enrolled Student</h3>
              <p className="text-xs text-slate-400">
                This will create a permanent profile in the active Student Roster and mark this lead as &ldquo;Admitted&rdquo;.
              </p>
            </div>

            <form onSubmit={handleConvertStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  disabled
                  value={convertingEnquiry.studentName}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    disabled
                    value={convertingEnquiry.phoneNumber}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Program
                  </label>
                  <input
                    type="text"
                    disabled
                    value={convertingEnquiry.program}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Assign Classroom Batch <span className="text-[#ff7a3d]">*</span>
                </label>
                <select
                  value={convertBatch}
                  onChange={(e) => setConvertBatch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-sm text-white"
                >
                  {ADMIN_CONFIG.batches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Monthly Tuition Fee (₹) <span className="text-[#ff7a3d]">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={convertFee}
                  onChange={(e) => setConvertFee(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-sm text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setConvertingEnquiry(null)}
                  className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConverting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#6c3df4] hover:bg-[#5b2ce3] disabled:opacity-60 flex items-center gap-1.5 transition-colors"
                >
                  {isConverting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Enroll Student Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Delete Enquiry?</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Are you sure you want to delete the enquiry from <span className="font-semibold text-white">{deletingEnquiry.studentName}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setDeletingEnquiry(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 flex items-center gap-1.5"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
