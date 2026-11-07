import React, { useState } from 'react';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { ReminderTemplates } from './types';
import { ADMIN_CONFIG, DEFAULT_REMINDER_TEMPLATES } from './config';
import { 
  Settings, 
  Save, 
  MessageCircle, 
  Building, 
  Phone, 
  Calendar, 
  BookOpen, 
  ShieldCheck, 
  RotateCcw,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface SettingsTabProps {
  templates: ReminderTemplates;
  onUpdateTemplates: (templates: ReminderTemplates) => void;
  onShowToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  templates,
  onUpdateTemplates,
  onShowToast
}) => {
  const [localTemplates, setLocalTemplates] = useState<ReminderTemplates>(templates);
  const [classPhone, setClassPhone] = useState(ADMIN_CONFIG.classPhone);
  const [feeDueDay, setFeeDueDay] = useState(ADMIN_CONFIG.feeDueDay);
  const [totalSeats, setTotalSeats] = useState(ADMIN_CONFIG.defaultTotalSeats);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Save templates to settings/reminderTemplates
      await setDoc(doc(db, 'settings', 'reminderTemplates'), {
        ...localTemplates,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 2. Save general institute settings to settings/general
      await setDoc(doc(db, 'settings', 'general'), {
        className: ADMIN_CONFIG.className,
        classPhone,
        feeDueDay: Number(feeDueDay),
        totalLibrarySeats: Number(totalSeats),
        updatedAt: serverTimestamp()
      }, { merge: true });

      onUpdateTemplates(localTemplates);
      onShowToast('success', 'Admin settings & reminder templates updated in Firestore!');
    } catch (err) {
      console.error('Error saving settings:', err);
      onShowToast('error', 'Failed to save settings to Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetTemplates = () => {
    setLocalTemplates(DEFAULT_REMINDER_TEMPLATES);
    onShowToast('info', 'Reset templates to default templates (click Save to persist).');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <h2 className="text-xl font-bold text-white font-display">Institute & System Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure fees cycle parameters, desk capacities, and WhatsApp reminder automation templates
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Institute Parameters */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-[#6c3df4]" />
            <span>Operational Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Admin WhatsApp / Phone
              </label>
              <input
                type="text"
                value={classPhone}
                onChange={(e) => setClassPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-[#6c3df4]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Monthly Fee Due Day
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={feeDueDay}
                onChange={(e) => setFeeDueDay(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-[#6c3df4]"
              />
              <span className="text-[10px] text-slate-500">Default: 25th of every month</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Total Library Desks
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={totalSeats}
                onChange={(e) => setTotalSeats(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-[#6c3df4]"
              />
              <span className="text-[10px] text-slate-500">Physical desk count in Nagpur</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Reminder Templates */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Message Templates</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure personalized reminder message templates sent to parents &amp; students.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetTemplates}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          {/* Dynamic Variable Tags Documentation Box */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#6c3df4]" />
                <span>Supported Dynamic Variable Tags</span>
              </span>
              <span className="text-[10px] text-purple-300 font-mono">
                Auto-replaced during WhatsApp dispatch
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Use <code className="text-emerald-300 font-mono bg-slate-900 px-1 py-0.5 rounded">&#123;customDueDate&#125;</code> and <code className="text-purple-300 font-mono bg-slate-900 px-1 py-0.5 rounded">&#123;dueDate&#125;</code> to dynamically reference either the admin-selected custom due date from the broadcast modal or the default 25th fee cycle.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold">&#123;customDueDate&#125;</span>
                  <span className="text-[9px] text-emerald-500/80 uppercase font-semibold">New Tag</span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  Outputs the selected custom due date (e.g. <em>28th November</em> or <em>28th</em>). Defaults to <em>25th</em> when no custom date is picked.
                </p>
              </div>

              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 font-bold">&#123;dueDate&#125;</span>
                  <span className="text-[9px] text-slate-500 uppercase font-semibold">Standard Tag</span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  Outputs the due day number (e.g. <em>25</em> or <em>25th</em>). Automatically replaced by custom date when selected in broadcast.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono text-slate-300">
              {[
                { tag: '{studentName}', label: 'Student Name' },
                { tag: '{parentName}', label: 'Parent Name' },
                { tag: '{amount}', label: 'Fee with ₹' },
                { tag: '{month}', label: 'Billing Month' },
                { tag: '{seatNumber}', label: 'Library Desk #' },
                { tag: '{className}', label: 'Institute Name' }
              ].map(item => (
                <span
                  key={item.tag}
                  className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1"
                >
                  <strong className="text-slate-200">{item.tag}</strong>
                  <span className="text-slate-500 font-sans text-[9px]">({item.label})</span>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  1. Friendly Reminder (Upcoming / Before Due Date)
                </label>
                <span className="text-[10px] font-mono text-emerald-400">
                  Tag: &#123;customDueDate&#125; &amp; &#123;dueDate&#125;
                </span>
              </div>
              <textarea
                rows={2}
                value={localTemplates.friendly}
                onChange={(e) => setLocalTemplates({ ...localTemplates, friendly: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-[#6c3df4] font-mono leading-relaxed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  2. Due-Date Notice (On Due Date)
                </label>
                <span className="text-[10px] font-mono text-emerald-400">
                  Tag: &#123;customDueDate&#125; &amp; &#123;dueDate&#125;
                </span>
              </div>
              <textarea
                rows={2}
                value={localTemplates.dueDate}
                onChange={(e) => setLocalTemplates({ ...localTemplates, dueDate: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-[#6c3df4] font-mono leading-relaxed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  3. Overdue Notice (After Due Date)
                </label>
                <span className="text-[10px] font-mono text-emerald-400">
                  Tag: &#123;customDueDate&#125; &amp; &#123;dueDate&#125;
                </span>
              </div>
              <textarea
                rows={2}
                value={localTemplates.overdue}
                onChange={(e) => setLocalTemplates({ ...localTemplates, overdue: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-[#6c3df4] font-mono leading-relaxed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  4. Library Subscription Renewal
                </label>
                <span className="text-[10px] font-mono text-emerald-400">
                  Tag: &#123;customDueDate&#125; &amp; &#123;dueDate&#125;
                </span>
              </div>
              <textarea
                rows={2}
                value={localTemplates.libraryRenewal}
                onChange={(e) => setLocalTemplates({ ...localTemplates, libraryRenewal: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-[#6c3df4] font-mono leading-relaxed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  5. Payment Received Thank-You
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  Receipt confirmation
                </span>
              </div>
              <textarea
                rows={2}
                value={localTemplates.paymentReceived}
                onChange={(e) => setLocalTemplates({ ...localTemplates, paymentReceived: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-[#6c3df4] font-mono leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#6c3df4] hover:bg-[#5b2ce3] disabled:opacity-60 flex items-center gap-2 shadow-lg shadow-[#6c3df4]/25 transition-all cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save All Settings</span>
          </button>
        </div>

      </form>
    </div>
  );
};
