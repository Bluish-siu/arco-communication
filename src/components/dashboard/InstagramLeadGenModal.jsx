import { useState } from 'react';
import {
  X,
  Rocket,
  Sparkles,
  Check,
  CheckCircle2,
  Users,
  FileSpreadsheet,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export default function InstagramLeadGenModal({
  isOpen,
  onClose,
  showToast,
}) {
  const [flowName, setFlowName] = useState('24/7 Inbound DM Lead Capture');
  const [triggerWords, setTriggerWords] = useState('hi, hello, interested, info, buy');
  const [collectName, setCollectName] = useState(true);
  const [collectPhone, setCollectPhone] = useState(true);
  const [collectEmail, setCollectEmail] = useState(true);
  const [syncToSheets, setSyncToSheets] = useState(true);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!flowName.trim()) {
      showToast('Please enter a flow name', 'error');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Instagram LeadGen flow activated! Leads will sync automatically.', 'success');
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Setup LeadGen Flow
              </h3>
              <p className="text-xs text-slate-500">
                Collect and qualify high-intent leads 24/7 inside Instagram Direct
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lead Flow Name
              </label>
              <input
                type="text"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trigger Keywords (comma separated)
              </label>
              <input
                type="text"
                value={triggerWords}
                onChange={(e) => setTriggerWords(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800">
              Information to Collect from Instagram Prospects:
            </div>
            <div className="space-y-2.5">
              <label className="flex items-center justify-between text-xs text-slate-700 p-2.5 bg-white border border-slate-200/80 rounded-xl">
                <span className="font-semibold">1. Prospect Full Name</span>
                <input
                  type="checkbox"
                  checked={collectName}
                  onChange={(e) => setCollectName(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-700 p-2.5 bg-white border border-slate-200/80 rounded-xl">
                <span className="font-semibold">2. WhatsApp / Phone Number (10 digits)</span>
                <input
                  type="checkbox"
                  checked={collectPhone}
                  onChange={(e) => setCollectPhone(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-700 p-2.5 bg-white border border-slate-200/80 rounded-xl">
                <span className="font-semibold">3. Work Email Address</span>
                <input
                  type="checkbox"
                  checked={collectEmail}
                  onChange={(e) => setCollectEmail(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
              </label>
            </div>
          </div>

          <div className="p-4 bg-sky-50/70 border border-sky-200/80 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-950">
              <FileSpreadsheet className="w-4 h-4 text-sky-600" />
              Real-time Lead Export & Notifications
            </div>
            <label className="flex items-center gap-2.5 text-xs text-sky-800 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={syncToSheets}
                onChange={(e) => setSyncToSheets(e.target.checked)}
                className="rounded text-sky-600 focus:ring-sky-500"
              />
              <span>Automatically append newly captured leads to Google Sheets</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#0f4a3c] hover:bg-[#0c3c31] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
          >
            {saving ? (
              <span>Activating...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Launch LeadGen Flow</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
