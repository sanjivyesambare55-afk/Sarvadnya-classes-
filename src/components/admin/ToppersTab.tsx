import React, { useState, useEffect } from 'react';
import { 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  doc, 
  collection, 
  writeBatch, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { AdminTopper } from './types';
import { ADMIN_CONFIG } from './config';
import { TOPPERS_OF_THE_MONTH } from '../../constants/data';
import { ToppersBatch } from '../../types';
import { 
  Trophy, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  X, 
  Loader2, 
  CheckCircle2, 
  Star, 
  Camera,
  Medal,
  Save,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  Layers,
  GraduationCap
} from 'lucide-react';

interface ToppersTabProps {
  toppers: AdminTopper[];
  isLoading: boolean;
  onShowToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

// Cohort definition for the 6 supported classes
interface CohortConfig {
  id: string;
  key: string;
  className: string;
  order: number;
  category: 'Foundation' | 'Senior Secondary' | 'Competitive';
  badgeColor: string;
}

const CLASS_COHORTS: CohortConfig[] = [
  { id: 'class_9', key: 'class9', className: 'Class 9', order: 1, category: 'Foundation', badgeColor: 'text-[#14b8a6] bg-[#14b8a6]/10 border-[#14b8a6]/25' },
  { id: 'class_10', key: 'class10', className: 'Class 10', order: 2, category: 'Foundation', badgeColor: 'text-[#6c3df4] bg-[#6c3df4]/10 border-[#6c3df4]/25' },
  { id: 'class_11', key: 'class11', className: 'Class 11', order: 3, category: 'Senior Secondary', badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
  { id: 'class_12', key: 'class12', className: 'Class 12', order: 4, category: 'Senior Secondary', badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/25' },
  { id: 'neet_batch', key: 'neet', className: 'NEET Batch', order: 5, category: 'Competitive', badgeColor: 'text-[#76D9EF] bg-[#76D9EF]/10 border-[#76D9EF]/25' },
  { id: 'jee_batch', key: 'jee', className: 'JEE Batch', order: 6, category: 'Competitive', badgeColor: 'text-[#ff7a3d] bg-[#ff7a3d]/10 border-[#ff7a3d]/25' },
];

export const ToppersTab: React.FC<ToppersTabProps> = ({
  toppers,
  isLoading,
  onShowToast
}) => {
  // Active sub-view: 'monthly_toppers' (Top 5 cohorts) or 'hall_of_fame' (individual star portraits)
  const [activeView, setActiveView] = useState<'monthly_toppers' | 'hall_of_fame'>('monthly_toppers');

  // Selected class for monthly editor
  const [selectedClass, setSelectedClass] = useState<string>('Class 10');
  
  // Dynamic monthly cohorts loaded from Firestore
  const [cohorts, setCohorts] = useState<Record<string, ToppersBatch>>({});
  const [isLoadingCohorts, setIsLoadingCohorts] = useState<boolean>(true);
  const [isPublishingCohort, setIsPublishingCohort] = useState<boolean>(false);
  const [isSeedingCohorts, setIsSeedingCohorts] = useState<boolean>(false);

  // State holding your toppers by class
  const [toppersData, setToppersData] = useState<Record<string, string[]>>({
    class9: ["Aarav Joshi", "Rohan Mehta", "Priya Sharma", "Ananya Verma", "Kunal Shah"],
    class10: ["Vedant Thakre", "Tanvi Deshmukh", "Aditya Kulkarni", "Siddhi Patil", "Pranav Shahu"],
    class11: ["Sahil Sheikh", "Isha Agrawal", "Yash Raut", "Sneha Rao", "Harsh Vardhan"],
    class12: ["Kalyani Kale", "Omkar Joshi", "Pooja Nandanwar", "Saurabh Gadre", "Neha Kapse"],
    neet: ["Shruti Deshmukh", "Devendra Patil", "Manasi Kulkarni", "Pratiksha Barde", "Gaurav More"],
    jee: ["Rohan Kulkarni", "Sanket Bawankule", "Tejaswini Rao", "Karthik Pillai", "Mayur Wankhade"]
  });

  // Form state for current selected class
  const [activeMonth, setActiveMonth] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  const [studentNames, setStudentNames] = useState<string[]>([
    '', '', '', '', ''
  ]);

  // 1. Listen in real-time to doc("toppers", "current_month") and collection("toppers")
  useEffect(() => {
    let unsubCollection: (() => void) | null = null;

    try {
      // Primary: listen to doc("toppers", "current_month")
      const unsubDoc = onSnapshot(
        doc(db, 'toppers', 'current_month'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const cohortMap: Record<string, ToppersBatch> = {};

            if (data.classes && typeof data.classes === 'object') {
              const loadedToppers: Record<string, string[]> = {};
              Object.entries(data.classes).forEach(([rawKey, studentsArr]) => {
                if (Array.isArray(studentsArr) && studentsArr.length > 0) {
                  loadedToppers[rawKey] = studentsArr as string[];
                  const k = rawKey.toLowerCase().replace(/[\s_-]+/g, '');
                  const cls = 
                    k === 'class9' ? 'Class 9' :
                    k === 'class10' ? 'Class 10' :
                    k === 'class11' ? 'Class 11' :
                    k === 'class12' ? 'Class 12' :
                    k.includes('neet') ? 'NEET Batch' :
                    k.includes('jee') ? 'JEE Batch' :
                    rawKey;
                  cohortMap[cls] = {
                    class: cls,
                    students: (studentsArr as string[]).slice(0, 5),
                    month: data.month || 'Current Month',
                    order: CLASS_COHORTS.find(c => c.className === cls)?.order ?? 99
                  };
                }
              });
              if (Object.keys(loadedToppers).length > 0) {
                setToppersData(prev => ({ ...prev, ...loadedToppers }));
              }
            }

            if (Array.isArray(data.cohorts)) {
              data.cohorts.forEach((c: { class?: string; students?: string[]; month?: string; order?: number }) => {
                if (c.class && Array.isArray(c.students)) {
                  cohortMap[c.class] = {
                    class: c.class,
                    students: c.students,
                    month: c.month || data.month,
                    order: c.order ?? 99
                  };
                }
              });
            }

            CLASS_COHORTS.forEach((c) => {
              const fromKey = data[c.className] || data[c.id];
              if (Array.isArray(fromKey) && fromKey.length > 0 && !cohortMap[c.className]) {
                cohortMap[c.className] = {
                  class: c.className,
                  students: fromKey,
                  month: data.month,
                  order: c.order
                };
              }
            });

            setCohorts(cohortMap);
            setIsLoadingCohorts(false);
          } else if (!unsubCollection) {
            // Fallback collection listener if current_month not created yet
            unsubCollection = onSnapshot(
              collection(db, 'toppers'),
              (snapshot) => {
                const cohortMap: Record<string, ToppersBatch> = {};
                snapshot.forEach((snap) => {
                  if (snap.id === 'current_month' || snap.id === 'monthly_cohorts') return;
                  const data = snap.data();
                  if (Array.isArray(data.students) && data.class) {
                    cohortMap[data.class] = {
                      id: snap.id,
                      class: data.class,
                      students: data.students,
                      month: data.month,
                      order: data.order,
                      updatedAt: data.updatedAt
                    };
                  }
                });
                setCohorts(cohortMap);
                setIsLoadingCohorts(false);
              },
              (err) => {
                console.warn('Fallback collection listener error:', err);
                setIsLoadingCohorts(false);
              }
            );
          }
        },
        (err) => {
          console.warn('Error listening to toppers doc current_month:', err);
          setIsLoadingCohorts(false);
        }
      );

      return () => {
        unsubDoc();
        if (unsubCollection) unsubCollection();
      };
    } catch (e) {
      console.warn('Could not initialize toppers listener:', e);
      setIsLoadingCohorts(false);
    }
  }, []);

  // 2. Synchronize form when selectedClass or cohorts change
  useEffect(() => {
    const activeKey = CLASS_COHORTS.find(c => c.className === selectedClass)?.key || 'class10';
    const namesFromToppersData = toppersData[activeKey];
    const existing = cohorts[selectedClass];

    if (Array.isArray(namesFromToppersData) && namesFromToppersData.length > 0) {
      const names = [...namesFromToppersData];
      while (names.length < 5) names.push('');
      setStudentNames(names.slice(0, 5));
    } else if (existing && Array.isArray(existing.students) && existing.students.length > 0) {
      const names = [...existing.students];
      while (names.length < 5) names.push('');
      setStudentNames(names.slice(0, 5));
      if (existing.month) {
        setActiveMonth(existing.month);
      }
    } else {
      // Look up fallback defaults from TOPPERS_OF_THE_MONTH
      const defaultGroup = TOPPERS_OF_THE_MONTH.find(b => b.class === selectedClass);
      if (defaultGroup && Array.isArray(defaultGroup.students)) {
        const names = [...defaultGroup.students];
        while (names.length < 5) names.push('');
        setStudentNames(names.slice(0, 5));
      } else {
        setStudentNames(['', '', '', '', '']);
      }
    }
  }, [selectedClass, cohorts, toppersData]);

  // Update specific student rank name
  const handleStudentNameChange = (index: number, value: string) => {
    const activeKey = CLASS_COHORTS.find(c => c.className === selectedClass)?.key || 'class10';
    setStudentNames(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
    setToppersData(prev => {
      const currentList = prev[activeKey] ? [...prev[activeKey]] : ['', '', '', '', ''];
      while (currentList.length < 5) currentList.push('');
      currentList[index] = value;
      return {
        ...prev,
        [activeKey]: currentList
      };
    });
  };

  // Function triggered when Admin clicks "Save & Publish Toppers"
  const handleSaveToppers = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsPublishingCohort(true);

    try {
      const activeKey = CLASS_COHORTS.find(c => c.className === selectedClass)?.key || 'class10';
      const currentNames = studentNames.map(n => n.trim()).slice(0, 5);

      const updatedToppersData: Record<string, string[]> = {
        ...toppersData,
        [activeKey]: currentNames
      };

      const cohortInfo = CLASS_COHORTS.find(c => c.className === selectedClass);
      const docId = cohortInfo ? cohortInfo.id : selectedClass.toLowerCase().replace(/\s+/g, '_');
      const monthStr = activeMonth.trim() || new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

      // Build comprehensive 6-cohorts array for backward compatibility
      const updatedCohorts = CLASS_COHORTS.map((c) => {
        const cNames = c.key === activeKey ? currentNames : (updatedToppersData[c.key] || cohorts[c.className]?.students || []);
        return {
          class: c.className,
          students: cNames.length > 0 ? cNames : ['Rank 1 Student', 'Rank 2 Student', 'Rank 3 Student', 'Rank 4 Student', 'Rank 5 Student'],
          month: monthStr,
          order: c.order
        };
      });

      // Saves directly to the 'toppers' collection -> 'current_month' document
      await setDoc(doc(db, "toppers", "current_month"), {
        classes: updatedToppersData,
        month: monthStr,
        cohorts: updatedCohorts,
        [selectedClass]: currentNames,
        [docId]: currentNames,
        updatedAt: new Date()
      }, { merge: true });

      // Also save individual class document doc(db, 'toppers', docId) for maximum compatibility
      await setDoc(doc(db, 'toppers', docId), {
        class: selectedClass,
        students: currentNames,
        month: monthStr,
        order: cohortInfo?.order || 99,
        updatedAt: new Date()
      }, { merge: true });

      setToppersData(updatedToppersData);

      setCohorts(prev => ({
        ...prev,
        [selectedClass]: {
          id: docId,
          class: selectedClass,
          students: currentNames,
          month: monthStr,
          order: cohortInfo?.order || 99
        }
      }));

      alert("Toppers published successfully to live website!");
      onShowToast('success', "Toppers published successfully to live website!");
    } catch (error: any) {
      console.error("Error saving toppers: ", error);
      alert("Failed to publish: " + (error?.message || String(error)));
      onShowToast('error', "Failed to publish: " + (error?.message || String(error)));
    } finally {
      setIsPublishingCohort(false);
    }
  };

  // Seed / Reset all 6 cohorts to Firestore
  const handleSeedAllDefaults = async () => {
    if (!window.confirm('Do you want to initialize all 6 class cohorts with standard verified topper names in Firestore?')) {
      return;
    }

    setIsSeedingCohorts(true);
    const currentMonthStr = activeMonth.trim() || new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    try {
      const allCohorts = CLASS_COHORTS.map(c => {
        const defaultData = TOPPERS_OF_THE_MONTH.find(t => t.class === c.className);
        return {
          class: c.className,
          students: defaultData ? defaultData.students : ['Rank 1 Student', 'Rank 2 Student', 'Rank 3 Student', 'Rank 4 Student', 'Rank 5 Student'],
          month: currentMonthStr,
          order: c.order
        };
      });

      const classesMap: Record<string, string[]> = {};
      const newToppersData: Record<string, string[]> = {};
      allCohorts.forEach((c) => {
        classesMap[c.class] = c.students;
        const config = CLASS_COHORTS.find(cfg => cfg.className === c.class);
        if (config) {
          classesMap[config.key] = c.students;
          newToppersData[config.key] = c.students;
        }
      });

      // Write master document toppers/current_month with classes map
      await setDoc(doc(db, 'toppers', 'current_month'), {
        classes: newToppersData,
        month: currentMonthStr,
        cohorts: allCohorts,
        updatedAt: new Date()
      }, { merge: true });

      // Also write each individual doc
      const batch = writeBatch(db);
      for (const cohort of allCohorts) {
        const cConfig = CLASS_COHORTS.find(c => c.className === cohort.class);
        const docId = cConfig ? cConfig.id : cohort.class.toLowerCase().replace(/\s+/g, '_');
        const docRef = doc(db, 'toppers', docId);
        batch.set(docRef, {
          ...cohort,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      await batch.commit();

      const newMap: Record<string, ToppersBatch> = {};
      allCohorts.forEach(c => {
        newMap[c.class] = c;
      });
      setCohorts(newMap);
      setToppersData(newToppersData);

      onShowToast('success', 'All 6 class cohorts initialized live in Firestore!');
      alert(`✅ Success: All 6 class cohorts (Class 9, 10, 11, 12, NEET, JEE) have been saved to Firestore toppers/current_month!`);
    } catch (err: unknown) {
      console.error('Error seeding cohorts:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      onShowToast('error', `Failed to seed cohorts: ${errorMsg}`);
      alert(`⚠️ Firestore Sync Error:\nFailed to seed toppers: ${errorMsg}\n\nPlease check network or admin permissions.`);
    } finally {
      setIsSeedingCohorts(false);
    }
  };

  // Reset current class form to default mock names
  const handleResetToDefault = () => {
    const defaultGroup = TOPPERS_OF_THE_MONTH.find(b => b.class === selectedClass);
    if (defaultGroup) {
      setStudentNames([...defaultGroup.students]);
      onShowToast('info', `Reset ${selectedClass} names to institute standard defaults.`);
    }
  };

  // ==========================================
  // HALL OF FAME / INDIVIDUAL TOPPER STATE
  // ==========================================
  const [filterYear, setFilterYear] = useState('all');
  const [filterStandard, setFilterStandard] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopperId, setEditingTopperId] = useState<string | null>(null);
  const [topperForm, setTopperForm] = useState({
    name: '',
    standard: 'Class 10',
    percentage: '',
    year: '2025-2026',
    examName: 'SSC Board Exam',
    rank: '',
    quote: '',
    photoUrl: '',
    isVisible: true,
    featured: false
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingTopper, setDeletingTopper] = useState<AdminTopper | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter individual star rankers (records with percentage and without students array)
  const starToppers = toppers.filter(t => (t as unknown as { students?: string[] }).students === undefined && t.percentage);
  const sortedToppers = [...starToppers].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  const filteredToppers = sortedToppers.filter(t => {
    const matchesYear = filterYear === 'all' || t.year === filterYear;
    const matchesStandard = filterStandard === 'all' || t.standard === filterStandard;
    return matchesYear && matchesStandard;
  });

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const maxWidth = 800;
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else resolve(file);
          }, 'image/jpeg', 0.85);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      onShowToast('error', 'File size exceeds 2 MB limit. Please select a smaller photo.');
      return;
    }
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleOpenAdd = () => {
    setEditingTopperId(null);
    setSelectedFile(null);
    setImagePreview(null);
    setTopperForm({
      name: '',
      standard: 'Class 10',
      percentage: '',
      year: '2025-2026',
      examName: 'SSC Board Exam',
      rank: '',
      quote: '',
      photoUrl: '',
      isVisible: true,
      featured: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (topper: AdminTopper) => {
    setEditingTopperId(topper.id);
    setSelectedFile(null);
    setImagePreview(topper.photoUrl || null);
    setTopperForm({
      name: topper.name,
      standard: topper.standard,
      percentage: topper.percentage,
      year: topper.year,
      examName: topper.examName || '',
      rank: topper.rank || '',
      quote: topper.quote || '',
      photoUrl: topper.photoUrl || '',
      isVisible: topper.isVisible !== false,
      featured: topper.featured || false
    });
    setIsModalOpen(true);
  };

  const handleSaveTopper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topperForm.name.trim() || !topperForm.percentage.trim()) {
      onShowToast('error', 'Student name and marks/percentage are required.');
      return;
    }

    setIsSaving(true);
    let finalPhotoUrl = topperForm.photoUrl;

    try {
      if (selectedFile) {
        setIsUploadingPhoto(true);
        try {
          const compressedBlob = await compressImage(selectedFile);
          const fileId = editingTopperId || `topper_${Date.now()}`;
          const storageRef = ref(storage, `toppers/${fileId}.jpg`);
          const uploadResult = await uploadBytes(storageRef, compressedBlob, {
            contentType: 'image/jpeg'
          });
          finalPhotoUrl = await getDownloadURL(uploadResult.ref);
        } catch (uploadErr) {
          console.warn('Storage upload encountered issue (continuing):', uploadErr);
        } finally {
          setIsUploadingPhoto(false);
        }
      }

      if (editingTopperId) {
        await updateDoc(doc(db, 'toppers', editingTopperId), {
          ...topperForm,
          photoUrl: finalPhotoUrl,
          updatedAt: serverTimestamp()
        });
        onShowToast('success', `${topperForm.name} updated on public website!`);
      } else {
        const nextOrder = toppers.length > 0 ? Math.max(...toppers.map(t => t.order || 0)) + 1 : 1;
        await addDoc(collection(db, 'toppers'), {
          ...topperForm,
          photoUrl: finalPhotoUrl,
          order: nextOrder,
          createdAt: serverTimestamp()
        });
        onShowToast('success', `${topperForm.name} added to website Wall of Fame!`);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving individual topper:', err);
      onShowToast('error', 'Failed to save topper record.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVisibility = async (topper: AdminTopper) => {
    try {
      await updateDoc(doc(db, 'toppers', topper.id), {
        isVisible: !topper.isVisible,
        updatedAt: serverTimestamp()
      });
      onShowToast('info', `${topper.name} is now ${!topper.isVisible ? 'Visible' : 'Hidden'} on website.`);
    } catch (err) {
      console.error('Error toggling visibility:', err);
      onShowToast('error', 'Could not update visibility.');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedToppers.length) return;

    const currentTopper = sortedToppers[index];
    const swapTopper = sortedToppers[targetIndex];

    try {
      const batch = writeBatch(db);
      const currentRef = doc(db, 'toppers', currentTopper.id);
      const swapRef = doc(db, 'toppers', swapTopper.id);

      batch.update(currentRef, { order: swapTopper.order || targetIndex });
      batch.update(swapRef, { order: currentTopper.order || index });

      await batch.commit();
      onShowToast('success', 'Topper order re-aligned.');
    } catch (err) {
      console.error('Error reordering toppers:', err);
      onShowToast('error', 'Failed to update order.');
    }
  };

  const confirmDelete = async () => {
    if (!deletingTopper) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'toppers', deletingTopper.id));
      onShowToast('success', `${deletingTopper.name} removed from website.`);
      setDeletingTopper(null);
    } catch (err) {
      console.error('Error deleting topper:', err);
      onShowToast('error', 'Failed to delete topper.');
    } finally {
      setIsDeleting(false);
    }
  };

  const years = Array.from(new Set(starToppers.map(t => t.year).filter(Boolean)));
  const standards = Array.from(new Set(starToppers.map(t => t.standard).filter(Boolean)));

  const activeCohortConfig = CLASS_COHORTS.find(c => c.className === selectedClass) || CLASS_COHORTS[0];

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Header & Navigation Switcher */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6c3df4] to-amber-400 p-0.5 shadow-md flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">Manage Toppers</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                  Live Firestore Sync Active
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Updates reflect instantly on public homepage
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveView('monthly_toppers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'monthly_toppers'
                ? 'bg-[#6c3df4] text-white shadow-md shadow-[#6c3df4]/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Toppers of the Month (Top 5)</span>
          </button>
          <button
            onClick={() => setActiveView('hall_of_fame')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'hall_of_fame'
                ? 'bg-[#6c3df4] text-white shadow-md shadow-[#6c3df4]/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Wall of Fame Portraits</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. TOPPERS OF THE MONTH (TOP 5 COHORTS FOR THE 6 CLASSES) */}
      {/* ======================================================== */}
      {activeView === 'monthly_toppers' && (
        <div className="space-y-6">
          
          {/* Action Bar: Quick Seed & Category Switcher */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white font-display">
                  Select Class Category to Edit
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Top 5 student names for each class published directly to the public &ldquo;Toppers of the Month&rdquo; section.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSeedAllDefaults}
                disabled={isSeedingCohorts}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                title="Initialize all 6 cohorts in Firestore with standard default names"
              >
                {isSeedingCohorts ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6c3df4]" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 text-[#14b8a6]" />
                )}
                <span>Seed / Reset All 6 Cohorts in Firestore</span>
              </button>
            </div>

            {/* 6 Class Category Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {CLASS_COHORTS.map((cohort) => {
                const isSelected = selectedClass === cohort.className;
                const hasLiveDoc = Boolean(cohorts[cohort.className]);

                return (
                  <button
                    key={cohort.id}
                    type="button"
                    onClick={() => setSelectedClass(cohort.className)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#6c3df4] border-[#6c3df4] text-white shadow-lg shadow-[#6c3df4]/25 scale-[1.02]'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : cohort.badgeColor
                      }`}>
                        {cohort.category}
                      </span>
                      {hasLiveDoc && (
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-400'}`} title="Published to Firestore" />
                      )}
                    </div>
                    <div className="font-bold text-sm font-display tracking-tight">
                      {cohort.className}
                    </div>
                    <div className={`text-[10px] mt-1 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                      {hasLiveDoc ? `${cohorts[cohort.className].students.length} Ranked` : 'Default Ready'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main 2-Column Workspace: Form Editor (Left) + Live Public Card Preview (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Form Editor (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#6c3df4] bg-[#6c3df4]/10 px-2.5 py-0.5 rounded-full border border-[#6c3df4]/25">
                      Editing
                    </span>
                    <h3 className="text-lg font-bold text-white font-display">
                      {selectedClass} · Top 5 Rankers
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter the full names of the 5 students in order from Rank 1 to Rank 5.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="p-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center gap-1 cursor-pointer"
                  title="Reset to default institute names"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset Defaults</span>
                </button>
              </div>

              <form onSubmit={handleSaveToppers} className="space-y-4">
                
                {/* Month / Year Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Month of Recognition
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={activeMonth}
                      onChange={(e) => setActiveMonth(e.target.value)}
                      placeholder="e.g. November 2026"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-sm text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveMonth(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }))}
                      className="px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-950 border border-slate-800 hover:text-white whitespace-nowrap cursor-pointer"
                    >
                      Current Month
                    </button>
                  </div>
                </div>

                {/* 5 Student Name Rows */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Student Names (Ranks 1 – 5)
                  </label>

                  {studentNames.map((name, idx) => {
                    const rank = idx + 1;
                    const isRank1 = rank === 1;
                    const isRank2 = rank === 2;
                    const isRank3 = rank === 3;

                    return (
                      <div 
                        key={idx}
                        className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all ${
                          isRank1 
                            ? 'bg-amber-500/5 border-amber-500/30' 
                            : 'bg-slate-950/80 border-slate-800 focus-within:border-[#6c3df4]'
                        }`}
                      >
                        {/* Rank Badge */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs font-mono shrink-0 shadow-sm ${
                          isRank1 
                            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950' 
                            : isRank2
                            ? 'bg-slate-300 text-slate-950'
                            : isRank3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {rank}
                        </div>

                        {/* Input */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => handleStudentNameChange(idx, e.target.value)}
                            placeholder={`Rank ${rank} Student Name (e.g. Vedant Thakre)`}
                            className="w-full bg-transparent border-0 text-sm text-white placeholder:text-slate-600 focus:outline-none font-medium"
                          />
                        </div>

                        {/* Rank 1 Crown / Star */}
                        {isRank1 && (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/25 flex items-center gap-1 shrink-0">
                            <Star className="w-3 h-3 fill-current" />
                            <span>Rank 1</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Submit / Publish Button */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Saves directly to Firestore document <code className="text-[#14b8a6] bg-slate-950 px-1.5 py-0.5 rounded font-mono">&ldquo;toppers/current_month&rdquo;</code>
                  </div>

                  <button
                    type="submit"
                    disabled={isPublishingCohort}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#6c3df4] hover:bg-[#5b2ce3] active:scale-95 disabled:opacity-60 flex items-center gap-2 shadow-lg shadow-[#6c3df4]/30 transition-all cursor-pointer"
                  >
                    {isPublishingCohort ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save &amp; Publish Toppers</span>
                  </button>
                </div>

              </form>
            </div>

            {/* Right Column: Live Website Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white font-display">Live Website Preview</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Theme: #07111F / Gold
                  </span>
                </div>

                {/* Card mimicking public AchieversSection / ToppersSection appearance */}
                <div className="rounded-2xl bg-[#07111F] border border-white/10 p-5 shadow-2xl relative overflow-hidden text-white">
                  
                  {/* Subtle top glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#D5B06C]/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <div>
                      <h4 className="text-base font-bold text-[#D5B06C] font-display flex items-center gap-1.5">
                        <Medal className="w-4 h-4" />
                        <span>{selectedClass}</span>
                      </h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {activeMonth || 'Current Month'}
                      </p>
                    </div>
                    <span className="text-[10px] bg-[#D5B06C]/20 text-[#D5B06C] px-2.5 py-0.5 rounded font-mono font-bold border border-[#D5B06C]/30">
                      Top 5
                    </span>
                  </div>

                  {/* Student Rows */}
                  <div className="space-y-2">
                    {studentNames.map((name, sIdx) => {
                      const rank = sIdx + 1;
                      const displayName = name.trim() || `(Empty Rank ${rank})`;
                      const isRank1 = rank === 1;

                      return (
                        <div 
                          key={sIdx}
                          className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-colors ${
                            isRank1 
                              ? 'bg-[#D5B06C]/10 border border-[#D5B06C]/25 text-[#F7F7F4]' 
                              : 'border-b border-white/5 text-gray-300 last:border-0'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 text-[11px] text-gray-400 font-mono">
                              0{rank}
                            </span>
                            <span className={`font-medium ${name.trim() ? 'text-[#F7F7F4]' : 'text-gray-500 italic'}`}>
                              {displayName}
                            </span>
                          </div>

                          {isRank1 && (
                            <span className="text-[10px] uppercase font-mono tracking-wider text-[#D5B06C] font-semibold flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span>Rank 1</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer note */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#D5B06C]" />
                      <span>Verified institute records</span>
                    </span>
                    <span className="text-[#D5B06C] font-mono">Sarvadnya</span>
                  </div>

                </div>

                <p className="text-[11px] text-slate-400 mt-3 text-center">
                  Changes hit Firestore instantly via real-time listeners.
                </p>
              </div>

              {/* Quick Guidance Box */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Admin Tips</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                  <li>You can update any of the 6 classes at any time.</li>
                  <li>Click &ldquo;Publish Toppers&rdquo; to push that specific class live.</li>
                  <li>If Firestore is ever blank, the website automatically falls back to default topper records.</li>
                </ul>
              </div>

            </div>

          </div>

          {/* Published Cohorts Overview Grid */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  All 6 Published Cohorts Overview
                </h3>
                <p className="text-xs text-slate-400">
                  Current Top 5 rosters across all classes
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {Object.keys(cohorts).length} / 6 Live in Firestore
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CLASS_COHORTS.map((cohort) => {
                const liveBatch = cohorts[cohort.className];
                const defaultBatch = TOPPERS_OF_THE_MONTH.find(b => b.class === cohort.className);
                const studentsToShow = liveBatch?.students || defaultBatch?.students || [];
                const isLive = Boolean(liveBatch);

                return (
                  <div
                    key={cohort.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${cohort.badgeColor}`}>
                            {cohort.className}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isLive 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isLive ? 'Live in Firestore' : 'Default Fallback'}
                        </span>
                      </div>

                      <div className="space-y-1.5 my-3">
                        {studentsToShow.slice(0, 5).map((st, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-900 last:border-0">
                            <span className="text-slate-400 font-mono text-[10px]">0{i + 1}</span>
                            <span className="font-medium text-slate-200 truncate max-w-[170px]">{st}</span>
                            {i === 0 && <span className="text-[10px] font-bold text-amber-400">Rank 1</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClass(cohort.className);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="mt-3 w-full py-1.5 rounded-xl text-xs font-semibold text-[#6c3df4] bg-[#6c3df4]/10 hover:bg-[#6c3df4]/20 border border-[#6c3df4]/20 transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit {cohort.className}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 2. WALL OF FAME PORTRAITS / INDIVIDUAL STAR RANKERS */}
      {/* ======================================================== */}
      {activeView === 'hall_of_fame' && (
        <div className="space-y-6">
          
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-display">Individual Star Rankers Wall</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 font-semibold border border-teal-500/30">
                  Photo Portraits & Percentages
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage board exam percentages, NEET/JEE scores, and photo cards displayed on the Wall of Fame
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#6c3df4] hover:bg-[#5b2ce3] flex items-center gap-1.5 shadow-lg shadow-[#6c3df4]/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Star Topper</span>
              </button>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterStandard}
                onChange={(e) => setFilterStandard(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-xs text-white"
              >
                <option value="all">All Standards</option>
                {ADMIN_CONFIG.standards.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] text-xs text-white"
              >
                <option value="all">All Academic Years</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-400">
              Showing {filteredToppers.length} records
            </div>
          </div>

          {/* Toppers Cards Grid */}
          {isLoading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-400" />
              <p className="text-sm mt-3">Loading topper records from Firestore...</p>
            </div>
          ) : filteredToppers.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-3">
              <Trophy className="w-10 h-10 mx-auto text-slate-600" />
              <h4 className="text-base font-bold text-slate-300">No Star Toppers Added Yet</h4>
              <p className="text-xs max-w-sm mx-auto">
                Click &ldquo;Add New Star Topper&rdquo; to publish student portrait photos and marks.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredToppers.map((topper, index) => {
                const isVisible = topper.isVisible !== false;

                return (
                  <div
                    key={topper.id}
                    className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-lg ${
                      !isVisible 
                        ? 'bg-slate-950/60 border-slate-800/60 opacity-60' 
                        : 'bg-slate-900 border-slate-800 hover:border-teal-500/40'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Standard & Visibility */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#14b8a6] bg-[#14b8a6]/10 px-2.5 py-0.5 rounded-full border border-[#14b8a6]/20">
                          {topper.standard} · {topper.year}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {topper.featured && (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              <span>Featured</span>
                            </span>
                          )}
                          <button
                            onClick={() => handleToggleVisibility(topper)}
                            className={`p-1 rounded-lg text-xs transition-colors cursor-pointer ${
                              isVisible ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-500 hover:text-white'
                            }`}
                            title={isVisible ? 'Visible on website' : 'Hidden from website'}
                          >
                            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Student Avatar + Big Percentage */}
                      <div className="flex items-center gap-3.5 my-3">
                        {topper.photoUrl ? (
                          <img
                            src={topper.photoUrl}
                            alt={topper.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shadow-md"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6c3df4] to-[#ff7a3d] p-0.5 shadow-md">
                            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-white text-xl font-display">
                              {topper.name.charAt(0)}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="text-base font-bold text-white font-display">
                            {topper.name}
                          </h4>
                          <div className="text-xl font-extrabold text-[#ff7a3d] font-display">
                            {topper.percentage}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {topper.examName || 'Board Examination'}
                            {topper.rank ? ` · ${topper.rank}` : ''}
                          </span>
                        </div>
                      </div>

                      {topper.quote && (
                        <p className="text-xs text-slate-300 italic p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 line-clamp-2 my-2">
                          &ldquo;{topper.quote}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Bottom Bar: Reordering & Action buttons */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveOrder(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                          title="Move up in display order"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(index, 'down')}
                          disabled={index === sortedToppers.length - 1}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                          title="Move down in display order"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-mono text-slate-500 ml-1">
                          Order: {topper.order || index + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(topper)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingTopper(topper)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-red-500/10 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Add / Edit Topper Modal (For individual portrait card) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl text-left max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold text-white font-display mb-1">
              {editingTopperId ? 'Edit Topper Entry' : 'Publish Star Academic Topper'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Live updates will reflect on the website Wall of Fame.
            </p>

            <form onSubmit={handleSaveTopper} className="space-y-4">
              
              {/* Photo Upload & Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Student Portrait / Photo (Max 2MB)
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-dashed border-slate-700 flex items-center justify-center text-slate-500">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#6c3df4] file:text-white cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">Auto-compressed to ~800px on upload.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Student Name <span className="text-[#ff7a3d]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={topperForm.name}
                    onChange={(e) => setTopperForm({ ...topperForm, name: e.target.value })}
                    placeholder="e.g. Kalyani Kale"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Score / Percentage <span className="text-[#ff7a3d]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={topperForm.percentage}
                    onChange={(e) => setTopperForm({ ...topperForm, percentage: e.target.value })}
                    placeholder="e.g. 96.8% or 665/720"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Standard
                  </label>
                  <select
                    value={topperForm.standard}
                    onChange={(e) => setTopperForm({ ...topperForm, standard: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="NEET Batch">NEET Batch</option>
                    <option value="JEE Batch">JEE Batch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={topperForm.year}
                    onChange={(e) => setTopperForm({ ...topperForm, year: e.target.value })}
                    placeholder="2025-2026"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Rank / Distinction
                  </label>
                  <input
                    type="text"
                    value={topperForm.rank}
                    onChange={(e) => setTopperForm({ ...topperForm, rank: e.target.value })}
                    placeholder="e.g. Rank 1 / City Top 10"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Exam Title
                </label>
                <input
                  type="text"
                  value={topperForm.examName}
                  onChange={(e) => setTopperForm({ ...topperForm, examName: e.target.value })}
                  placeholder="e.g. Class 10 State Board / NEET-UG"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Student Quote (Optional)
                </label>
                <textarea
                  rows={2}
                  value={topperForm.quote}
                  onChange={(e) => setTopperForm({ ...topperForm, quote: e.target.value })}
                  placeholder="The daily test series and library environment gave me immense focus..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white resize-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={topperForm.isVisible}
                    onChange={(e) => setTopperForm({ ...topperForm, isVisible: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-[#6c3df4]"
                  />
                  <span>Visible on Public Website</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={topperForm.featured}
                    onChange={(e) => setTopperForm({ ...topperForm, featured: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-amber-500"
                  />
                  <span>Featured Badge</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#6c3df4] hover:bg-[#5b2ce3] disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingTopperId ? 'Save Changes' : 'Publish Topper'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingTopper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h4 className="text-base font-bold text-white">Delete Topper?</h4>
            <p className="text-xs text-slate-400 mt-1">
              Remove <span className="font-semibold text-white">{deletingTopper.name}</span> from the website Wall of Fame?
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDeletingTopper(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 cursor-pointer"
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
