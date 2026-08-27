import { useState } from 'react';
import { X, BellRing, Sparkles, Check, RefreshCw, Send, ShieldCheck } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';

export default function AutomatedAlertsModal({ isOpen, onClose, currentConfig, onConfigChange, showToast }) {
  const [selectedEvents, setSelectedEvents] = useState(
    currentConfig?.events || ['Order Shipped', 'Payment Received', 'Project Milestone']
  );
  const [alertTemplate, setAlertTemplate] = useState(
    '📦 Hi {{customer_name}}, your order #{{order_id}} has been shipped via {{courier}}! Track live updates here: {{tracking_link}}'
  );
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const toggleEvent = (event) => {
    if (selectedEvents.includes(event)) {
      setSelectedEvents(selectedEvents.filter((e) => e !== event));
    } else {
      setSelectedEvents([...selectedEvents, event]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (selectedEvents.length === 0) {
      showToast('Please select at least one automated trigger event', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        configured: true,
        events: selectedEvents,
        template: alertTemplate,
      };

      const res = await dashboardService.saveAutomatedAlerts(payload);
      if (res.success || res.data) {
        showToast('Automated WhatsApp Notifications configured!', 'success');
        onConfigChange(payload);
        onClose();
      } else {
        showToast(res.message || 'Failed to save alerts', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error configuring alerts', 'error');
    } finally {
      setSaving(false);
    }
  };

  const allEvents = [
    'Order Shipped & In Transit',
    'Payment Received & Invoicing',
    'Project Milestone Completed',
    'Technical Support Ticket Resolved',
    'Subscription Renewal Reminder',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200/80">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Send Project Updates & Technical Alerts</h3>
              <p className="text-[11px] text-slate-500">Automated transactional notifications via WhatsApp Cloud API</p>
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
          <div className="space-y-2">
            <label className="font-bold text-slate-800 block">Trigger Events to Automate <span className="text-red-500">*</span></label>
            <div className="space-y-2">
              {allEvents.map((evt, idx) => {
                const isSelected = selectedEvents.includes(evt) || selectedEvents.some((s) => evt.startsWith(s));
                return (
                  <label
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-medium text-xs">🔔 {evt}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleEvent(evt)}
                      className="sr-only"
                    />
                    {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">WhatsApp Template Text with Dynamic Variables</label>
            <textarea
              rows={3}
              value={alertTemplate}
              onChange={(e) => setAlertTemplate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-slate-800 resize-none font-mono text-[11px]"
            />
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
              <span>{saving ? 'Activating...' : 'Activate Automated Alerts'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
