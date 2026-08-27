import { useState } from 'react';
import { X, FileText, Plus, Trash2, Check, RefreshCw, Smartphone } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';

export default function WhatsAppFormsModal({ isOpen, onClose, onFormCreated, showToast }) {
  const [title, setTitle] = useState('Software Project Requirements');
  const [description, setDescription] = useState('Collect client scope, budget, and project milestones directly within WhatsApp');
  const [fields, setFields] = useState([
    { label: 'Full Name', type: 'text', required: true },
    { label: 'Project Scope & Technologies', type: 'textarea', required: true },
    { label: 'Estimated Budget Range', type: 'dropdown', options: ['< ₹50,000', '₹50k - ₹2 Lakhs', '> ₹2 Lakhs'], required: true },
    { label: 'Target Timeline', type: 'text', required: false },
  ]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddField = () => {
    if (!newFieldLabel.trim()) return;
    setFields([...fields, { label: newFieldLabel.trim(), type: 'text', required: true }]);
    setNewFieldLabel('');
  };

  const handleRemoveField = (idx) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Form Title is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await dashboardService.createWhatsAppForm({
        title: title.trim(),
        description: description.trim(),
        fields,
      });

      if (res.success || res.data) {
        showToast(`WhatsApp Form "${title.trim()}" published!`, 'success');
        onFormCreated();
        onClose();
      } else {
        showToast(res.message || 'Failed to save form', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error saving WhatsApp Form', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/80">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Setup WhatsApp Interactive Forms</h3>
              <p className="text-[11px] text-slate-500">Native in-chat forms with 3x higher completion rates</p>
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
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Form Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Technical Discovery Form"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Form Subtitle / Intro</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe why the customer should fill this form..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>

          {/* Fields Builder */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 block">Interactive Form Fields ({fields.length})</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {fields.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="font-semibold text-slate-800">{f.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({f.type})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveField(i)}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                placeholder="Add custom question (e.g. 'Company Website')"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={handleAddField}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
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
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{saving ? 'Publishing...' : 'Publish WhatsApp Form'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
