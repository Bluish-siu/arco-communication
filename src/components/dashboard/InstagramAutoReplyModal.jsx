import { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  CheckCircle2,
  HelpCircle,
  Tag,
  DollarSign,
  MessageSquareText,
  Send,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';

const DEFAULT_PP_REPLY = `Hey there! 👋 Thanks for asking about our pricing.

✨ Our featured catalog is available with exclusive discounts today:
🏷️ Best Price: ₹999 (Special limited-time deal)
📦 Free Shipping & COD available across India!

Tap the link below to view all variants and place your order instantly:
👉 https://arco.store/catalog`;

export default function InstagramAutoReplyModal({
  isOpen,
  onClose,
  showToast,
}) {
  const [triggers, setTriggers] = useState(['pp', 'price', 'how much', 'cost', 'rate', 'price please']);
  const [newTrigger, setNewTrigger] = useState('');
  const [replyMessage, setReplyMessage] = useState(DEFAULT_PP_REPLY);
  const [autoIncludeCatalog, setAutoIncludeCatalog] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddTrigger = (e) => {
    e.preventDefault();
    const clean = newTrigger.trim().toLowerCase();
    if (!clean) return;
    if (triggers.includes(clean)) {
      showToast('Trigger keyword already exists', 'error');
      return;
    }
    setTriggers([...triggers, clean]);
    setNewTrigger('');
  };

  const handleRemoveTrigger = (index) => {
    setTriggers(triggers.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (triggers.length === 0) {
      showToast('Please add at least one trigger keyword', 'error');
      return;
    }
    if (!replyMessage.trim()) {
      showToast('Please enter an automated reply message', 'error');
      return;
    }

    setSaving(true);
    try {
      // Save trigger rule via dashboardService
      await dashboardService.saveFaqReply({
        trigger: triggers.join(', '),
        response: replyMessage.trim(),
        category: 'Instagram PP Queries',
      });
      showToast('Auto-reply to PP queries enabled successfully!', 'success');
      onClose();
    } catch (err) {
      showToast(err.message || 'Error saving PP auto-reply', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-rose-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquareText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Auto-reply to PP Queries
              </h3>
              <p className="text-xs text-slate-500">
                Answer pricing and "Price Please" questions on Instagram instantly
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status banner */}
          <div className="flex items-center justify-between p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
              <div>
                <div className="text-xs font-bold text-purple-950">
                  Instant Response Engine
                </div>
                <div className="text-[11px] text-purple-700">
                  Triggered automatically when followers DM or comment pricing inquiries
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Trigger Keywords */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Trigger Keywords (Matches incoming DMs & Comments)
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl min-h-[50px] items-center">
              {triggers.map((keyword, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-purple-200 text-purple-900 shadow-2xs"
                >
                  <span>"{keyword}"</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTrigger(idx)}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add keyword form */}
            <form onSubmit={handleAddTrigger} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add another keyword (e.g. rate, details, dm price)"
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Add Keyword
              </button>
            </form>
          </div>

          {/* Automated Response Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Automated DM Response
              </label>
              <button
                type="button"
                onClick={() => setReplyMessage(DEFAULT_PP_REPLY)}
                className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                Reset Template
              </button>
            </div>
            <textarea
              rows={5}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          {/* Realistic Instagram DM Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Instagram DM Preview
            </label>
            <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-3 font-sans">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[1.5px] flex items-center justify-center">
                  <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-[10px] font-bold">
                    A
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold">Your Brand Official</div>
                  <div className="text-[10px] text-slate-400">Active Now</div>
                </div>
              </div>

              {/* Customer inquiry */}
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-200 text-xs px-3.5 py-2 rounded-2xl max-w-xs">
                  PP please? How much for this dress?
                </div>
              </div>

              {/* Automated reply */}
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs p-3.5 rounded-2xl max-w-sm whitespace-pre-line shadow-xs">
                  {replyMessage}
                </div>
              </div>
            </div>
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
            className="px-6 py-2.5 rounded-xl bg-[#0f4a3c] hover:bg-[#0c3c31] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save & Activate Auto-reply</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
