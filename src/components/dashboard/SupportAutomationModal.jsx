import { useState } from 'react';
import { X, Headphones, Sparkles, Check, RefreshCw, Bot, UserCheck, Shield } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';

export default function SupportAutomationModal({ isOpen, onClose, currentConfig, onConfigChange, showToast }) {
  const [triagePrompt, setTriagePrompt] = useState(
    currentConfig?.triagePrompt ||
      'Greet the customer politely, identify if the query is Technical Bug, Billing, or Sales, and ask clarifying diagnostic questions.'
  );
  const [escalationToHuman, setEscalationToHuman] = useState(
    currentConfig?.escalationToHuman !== false
  );
  const [resolutionCategory, setResolutionCategory] = useState(
    currentConfig?.category || 'Technical Support'
  );
  const [assignedAgent, setAssignedAgent] = useState('Support Agent 1');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!triagePrompt.trim()) {
      showToast('Support triage guidelines cannot be empty', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        configured: true,
        triagePrompt: triagePrompt.trim(),
        escalationToHuman,
        category: resolutionCategory,
        assignedAgent,
        rulesCount: 4,
      };

      const res = await dashboardService.saveSupportAutomation(payload);
      if (res.success || res.data) {
        showToast('Support Chat Automation configured successfully!', 'success');
        onConfigChange(payload);
        onClose();
      } else {
        showToast(res.message || 'Failed to save support settings', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error saving support automation', 'error');
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
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Setup Support Chat Automation</h3>
              <p className="text-[11px] text-slate-500">Auto-triage technical queries, answer instantly & route to agents</p>
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
            <label className="block font-semibold text-slate-700 mb-1">
              AI Support Bot Diagnostic Instructions <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={triagePrompt}
              onChange={(e) => setTriagePrompt(e.target.value)}
              placeholder="Describe how the AI bot should assist customers and gather issue details..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 resize-none font-medium leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Ticket Category</label>
              <select
                value={resolutionCategory}
                onChange={(e) => setResolutionCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
              >
                <option value="Technical Support">Technical Support</option>
                <option value="Billing & Invoicing">Billing & Invoicing</option>
                <option value="Account Access">Account Access</option>
                <option value="Feature Request">Feature Request</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Escalation Agent Assignee</label>
              <select
                value={assignedAgent}
                onChange={(e) => setAssignedAgent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
              >
                <option value="Support Agent 1">Support Agent 1 (Online)</option>
                <option value="Shraddha (Admin)">Shraddha (Admin)</option>
                <option value="Round Robin Pool">Round Robin Pool</option>
              </select>
            </div>
          </div>

          {/* Human Escalation Toggle */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Seamless Human Agent Handoff</div>
              <p className="text-slate-500 text-[11px]">Transfer conversation to live team inbox when customer types "human" or "agent"</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={escalationToHuman}
                onChange={(e) => setEscalationToHuman(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
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
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{saving ? 'Saving...' : 'Save & Activate Support Automation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
