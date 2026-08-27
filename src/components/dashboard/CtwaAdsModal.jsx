import { useState } from 'react';
import { X, TrendingUp, Check, RefreshCw, Sparkles, ExternalLink, Shield } from 'lucide-react';
import { ctwaService } from '../../services/ctwaService';

// Facebook Contextual SVG Icon
const FacebookIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function CtwaAdsModal({ isOpen, onClose, currentConfig, onConfigChange, showToast }) {
  const [pageName, setPageName] = useState(currentConfig?.pageName || 'ARCO Communication Official');
  const [adAccountId, setAdAccountId] = useState('act_9102938475');
  const [adHeadline, setAdHeadline] = useState('Boost Conversions with Custom Software & AI Bots');
  const [welcomeMessage, setWelcomeMessage] = useState('Hi! I saw your Meta ad for software development services and would like a quote.');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!pageName.trim() || !adAccountId.trim()) {
      showToast('Facebook Page Name and Meta Ad Account ID are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await ctwaService.connectAdAccount({
        metaAdAccountId: adAccountId.trim(),
        accountName: `${pageName.trim()} Ads`,
        currency: 'INR',
        timezone: 'Asia/Kolkata',
      });

      if (res.success || res.data) {
        showToast('Click-to-WhatsApp Ads connected successfully!', 'success');
        onConfigChange({
          configured: true,
          pageName: pageName.trim(),
        });
        onClose();
      } else {
        showToast(res.message || 'Failed to connect Meta Ads', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error connecting Click-to-WhatsApp Ads', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/80">
              <FacebookIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Setup Click to WhatsApp Ads</h3>
              <p className="text-[11px] text-slate-500">Route Facebook & Instagram Ad traffic straight to WhatsApp conversations</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Facebook Business Page Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              placeholder="e.g. ARCO Retail Official"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Meta Ads Manager Account ID <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={adAccountId}
              onChange={(e) => setAdAccountId(e.target.value)}
              placeholder="act_1234567890"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ad Campaign Headline</label>
            <input
              type="text"
              value={adHeadline}
              onChange={(e) => setAdHeadline(e.target.value)}
              placeholder="e.g. Get 30% Off Custom Software"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pre-filled WhatsApp Inbound Message</label>
            <textarea
              rows={2}
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 resize-none font-medium leading-relaxed"
            />
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-blue-950 flex items-center gap-2">
            <span className="font-bold">🎯 Meta Ad Attribution:</span>
            <span>Automatically captures Ad ID, Placement, and Referrer upon incoming chat.</span>
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{saving ? 'Connecting...' : 'Connect Click to WhatsApp Ads'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
