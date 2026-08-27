import { useState } from 'react';
import { X, Megaphone, Calendar, Users, FileText, Check, RefreshCw, Send } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';

export default function CampaignSetupModal({ isOpen, onClose, onCampaignCreated, showToast }) {
  const [campaignName, setCampaignName] = useState('Festive 30% Off Software Solutions');
  const [templateName, setTemplateName] = useState('promotional_discount_v1');
  const [audienceSegment, setAudienceSegment] = useState('All Contacts');
  const [scheduledFor, setScheduledFor] = useState(new Date().toISOString().slice(0, 16));
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!campaignName.trim()) {
      showToast('Campaign Name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await dashboardService.createQuickCampaign({
        name: campaignName.trim(),
        templateName,
        audienceSegment,
        scheduledFor,
      });

      if (res.success || res.data) {
        showToast(`Campaign "${campaignName.trim()}" created & scheduled!`, 'success');
        onCampaignCreated();
        onClose();
      } else {
        showToast(res.message || 'Failed to create campaign', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error scheduling campaign', 'error');
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
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200/80">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Setup WhatsApp Bulk Campaign</h3>
              <p className="text-[11px] text-slate-500">Broadcast marketing offers & software updates with 98% open rates</p>
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
            <label className="block font-semibold text-slate-700 mb-1">Campaign Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g. Autumn Product Launch"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-red-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Approved WhatsApp Template</label>
              <select
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-red-600 font-medium"
              >
                <option value="promotional_discount_v1">🎁 30% Off Promotional Banner</option>
                <option value="software_update_alert">🚀 New Release & Feature Alert</option>
                <option value="webinar_invitation">📅 Live Technical Webinar Invite</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Contact Segment</label>
              <select
                value={audienceSegment}
                onChange={(e) => setAudienceSegment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-red-600 font-medium"
              >
                <option value="All Contacts">All Contacts (248 recipients)</option>
                <option value="High Spenders">High Spenders (64 recipients)</option>
                <option value="Repeat Buyers">Repeat Buyers (112 recipients)</option>
                <option value="New Leads">New Leads (72 recipients)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Scheduled Broadcast Time</label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-red-600 font-medium"
            />
          </div>

          <div className="p-3 bg-red-50/60 border border-red-200/80 rounded-xl text-red-950 flex items-center gap-2">
            <span className="font-bold">⚡ Meta Cloud API Broadcast:</span>
            <span>Zero per-contact template delivery lag.</span>
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
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{saving ? 'Scheduling...' : 'Launch WhatsApp Campaign'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
