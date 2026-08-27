import { useState } from 'react';
import { X, Bot, Sparkles, Check, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';

export default function AiAgentModal({ isOpen, onClose, currentAgent, onAgentCreated, showToast }) {
  const [agentName, setAgentName] = useState(currentAgent?.name || 'ARCO Autonomous AI Agent');
  const [model, setModel] = useState('ARCO-v2.0-IntentEngine');
  const [personalityTone, setPersonalityTone] = useState('consultative');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a helpful, professional AI customer assistant for ARCO. Greet visitors, explain our WhatsApp marketing & API automation features, answer pricing questions accurately, and collect customer contact details.'
  );
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!agentName.trim()) {
      showToast('Agent Name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await dashboardService.createAiAgent({
        name: agentName.trim(),
        model,
        personalityTone,
        systemPrompt: systemPrompt.trim(),
      });

      if (res.success || res.data) {
        showToast(`AI Agent "${agentName.trim()}" is now live!`, 'success');
        onAgentCreated({
          created: true,
          name: agentName.trim(),
          status: 'live',
          accuracyRate: '98.4%',
        });
        onClose();
      } else {
        showToast(res.message || 'Failed to create AI agent', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error creating AI agent', 'error');
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
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Build Your Autonomous AI Agent</h3>
              <p className="text-[11px] text-slate-500">24/7 AI-driven customer replies, intent matching & lead qualification</p>
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
            <label className="block font-semibold text-slate-700 mb-1">AI Agent Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="e.g. ARCO Sales & Support Assistant"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Intent & LLM Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
              >
                <option value="ARCO-v2.0-IntentEngine">ARCO-v2.0 (High Precision)</option>
                <option value="Claude-3.5-Sonnet">Claude-3.5-Sonnet (Deep Context)</option>
                <option value="GPT-4o-Mini">GPT-4o-Mini (Sub-second Speed)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tone of Voice</label>
              <select
                value={personalityTone}
                onChange={(e) => setPersonalityTone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
              >
                <option value="consultative">Consultative & Helpful</option>
                <option value="enthusiastic">Enthusiastic & Friendly</option>
                <option value="concise">Concise & Direct</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">System Instructions & Behavior Rules <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              required
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 resize-none font-medium leading-relaxed"
            />
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-emerald-950 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Autonomous agent handles up to 98% of routine support & inbound inquiries with 0 latency.</span>
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
              <span>{saving ? 'Deploying...' : 'Deploy AI Agent'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
