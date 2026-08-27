import { useState } from 'react';
import { X, MessageSquare, Sparkles, Plus, Trash2, Check, RefreshCw, HelpCircle } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';

const SAMPLE_FAQS = [
  { trigger: 'pricing', response: 'Our plans start at ₹999/mo for Starter and ₹2,499/mo for Growth with unlimited AI agents.', category: 'Pricing & Plans' },
  { trigger: 'demo', response: 'You can book an interactive 1-on-1 demo with our technical sales team at https://arcocommunication.com/demo.', category: 'Sales' },
  { trigger: 'support', response: 'Our support team is active 24/7 on WhatsApp. Please share your order or query details here!', category: 'Support' },
];

export default function FaqAutoRepliesModal({ isOpen, onClose, currentFaqs, onFaqChange, showToast }) {
  const [faqsList, setFaqsList] = useState(SAMPLE_FAQS);
  const [triggerInput, setTriggerInput] = useState('');
  const [responseInput, setResponseInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Pricing & Plans');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddFaq = async (e) => {
    e.preventDefault();
    if (!triggerInput.trim() || !responseInput.trim()) {
      showToast('Please provide both question keywords and an automated response', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await dashboardService.saveFaqReply({
        trigger: triggerInput.trim(),
        response: responseInput.trim(),
        category: categoryInput,
      });

      if (res.success || res.data) {
        showToast('FAQ Auto-reply added successfully!', 'success');
        const updated = [
          ...faqsList,
          { trigger: triggerInput.trim(), response: responseInput.trim(), category: categoryInput },
        ];
        setFaqsList(updated);
        onFaqChange({
          activated: true,
          aiGenerated: true,
          count: updated.length,
        });
        setTriggerInput('');
        setResponseInput('');
      } else {
        showToast('Failed to save FAQ', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error saving FAQ rule', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFaq = (idx) => {
    const updated = faqsList.filter((_, i) => i !== idx);
    setFaqsList(updated);
    onFaqChange({
      activated: updated.length > 0,
      aiGenerated: true,
      count: updated.length,
    });
    showToast('FAQ rule removed', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/80">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">FAQ Auto-replies</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3" /> Activated
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                  <Sparkles className="w-3 h-3 text-purple-600" /> AI-generated
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Instant AI & keyword answers for frequent customer questions</p>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Add New FAQ Form */}
          <form onSubmit={handleAddFaq} className="p-4 bg-purple-50/40 rounded-xl border border-purple-200/60 space-y-3">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-purple-600" />
              <span>Add New FAQ Auto-Reply Rule</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keywords / Question Trigger <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={triggerInput}
                  onChange={(e) => setTriggerInput(e.target.value)}
                  placeholder="e.g. pricing, cost, plans"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-purple-600"
                >
                  <option value="Pricing & Plans">Pricing & Plans</option>
                  <option value="Product Features">Product Features</option>
                  <option value="Support & Policies">Support & Policies</option>
                  <option value="Sales & Demo">Sales & Demo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Automated WhatsApp Response <span className="text-red-500">*</span></label>
              <textarea
                rows={2}
                required
                value={responseInput}
                onChange={(e) => setResponseInput(e.target.value)}
                placeholder="Enter the automated reply message..."
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-purple-600 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{saving ? 'Adding Rule...' : '+ Add FAQ Auto-Reply Rule'}</span>
            </button>
          </form>

          {/* Existing Rules List */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 px-1">Configured FAQ Auto-Replies ({faqsList.length})</h4>
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {faqsList.map((faq, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">“{faq.trigger}”</span>
                      <span className="text-[10px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded font-semibold">{faq.category}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{faq.response}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(i)}
                    className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
