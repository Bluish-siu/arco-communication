import React, { useState, useEffect } from 'react';
import {
  X,
  Workflow,
  Clock,
  Layers,
  Send,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Kanban,
  UserCheck,
} from 'lucide-react';
import { campaignsService } from '../../services/campaignsService';

export default function CreateDripSequenceModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('Optical Wholesale 3-Step Follow-Up Sequence');
  const [description, setDescription] = useState(
    'Day 1 Wholesale Catalog -> Day 3 Follow-Up if unreplied -> Day 6 Move to Sales Pipeline CRM'
  );
  const [audienceType, setAudienceType] = useState('optical_retailers');
  const [metaTemplates, setMetaTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Step 1 State (Day 1)
  const [step1Template, setStep1Template] = useState('arco_wholesale');

  // Step 2 State (Day 3)
  const [step2DelayHours, setStep2DelayHours] = useState(48);
  const [step2Condition, setStep2Condition] = useState('if_no_reply');
  const [step2Template, setStep2Template] = useState('gujarat_follow_up');

  // Step 3 State (Day 6)
  const [step3DelayHours, setStep3DelayHours] = useState(72);
  const [step3TargetStage, setStep3TargetStage] = useState('Qualified / Demo');
  const [step3Assignee, setStep3Assignee] = useState('Territory Sales Rep');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    async function loadTpls() {
      setLoadingTemplates(true);
      try {
        const res = await campaignsService.getMetaTemplates();
        const approved = res?.approved || res?.data?.filter((t) => t.status === 'APPROVED') || [];
        setMetaTemplates(approved);
        if (approved.length > 0) {
          if (!step1Template) setStep1Template(approved[0].name);
          if (!step2Template) {
            const followUpTpl = approved.find(
              (t) =>
                t.name.toLowerCase().includes('follow') ||
                t.name.toLowerCase().includes('followup')
            );
            setStep2Template(followUpTpl ? followUpTpl.name : approved[0].name);
          }
        }
      } catch (err) {
        console.warn('Failed to load templates:', err);
      } finally {
        setLoadingTemplates(false);
      }
    }
    loadTpls();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Sequence name is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    const steps = [
      {
        id: 'step_1',
        day: 1,
        delayHours: 0,
        title: 'Day 1: Wholesale Catalog & Welcome',
        actionType: 'send_template',
        templateName: step1Template,
        condition: 'always',
        description: 'Dispatches introductory wholesale catalog and terms to enrolled contacts.',
      },
      {
        id: 'step_2',
        day: 3,
        delayHours: parseInt(step2DelayHours, 10) || 48,
        title: 'Day 3: Automated Follow-Up Reminder',
        actionType: 'send_template',
        templateName: step2Template,
        condition: step2Condition,
        description: 'Sends gentle follow-up checking if they reviewed the catalog (only if no reply received).',
      },
      {
        id: 'step_3',
        day: 6,
        delayHours: parseInt(step3DelayHours, 10) || 72,
        title: 'Day 6: Move to Sales CRM Pipeline',
        actionType: 'move_to_pipeline',
        condition: 'if_replied',
        targetStage: step3TargetStage,
        assignee: step3Assignee,
        fallbackAction: 'tag_cold',
        description: 'Automatically creates deal in Sales Pipeline stage and alerts assigned territory agent.',
      },
    ];

    try {
      const res = await campaignsService.createDripSequence({
        name: name.trim(),
        description: description.trim(),
        audienceType,
        audienceFilter: { audience: audienceType },
        steps,
      });

      if (res?.success) {
        onCreated?.(res.data);
        onClose();
      } else {
        setError(res?.error || 'Failed to create drip sequence.');
      }
    } catch (err) {
      setError(err.message || 'Error creating drip sequence.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Create Drip Follow-Up Sequence</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Multi-Stage
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Automate multi-day follow-ups and route warm leads into your Sales CRM.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Sequence Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-900">Sequence Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                placeholder="e.g. Optical Wholesale Nurture"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-900">Target Audience</label>
              <select
                value={audienceType}
                onChange={(e) => setAudienceType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="optical_retailers">Optical Retailers & Wholesalers</option>
                <option value="all_contacts">All Contacts in CRM</option>
                <option value="surat_leads">Surat Optical Leads</option>
                <option value="ahmedabad_leads">Ahmedabad Optical Leads</option>
                <option value="custom_csv">Uploaded CSV Segment</option>
              </select>
            </div>
          </div>

          {/* VISUAL DRIP JOURNEY BUILDER */}
          <div className="space-y-4">
            <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Configure 3-Step Drip Journey</span>
            </label>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              
              {/* STEP 1: Day 1 Launch */}
              <div className="relative bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2.5">
                <div className="absolute -left-6 top-3.5 w-5 h-5 rounded-full bg-purple-600 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs">
                  1
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-purple-600" />
                    Day 1: Initial Wholesale Catalog
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    Immediate / Day 1
                  </span>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Select Template to Dispatch:</label>
                  <select
                    value={step1Template}
                    onChange={(e) => setStep1Template(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none"
                  >
                    {metaTemplates.map((t) => (
                      <option key={t.id || t.name} value={t.name}>
                        {t.name} ({t.language?.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* STEP 2: Day 3 Follow-up */}
              <div className="relative bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2.5">
                <div className="absolute -left-6 top-3.5 w-5 h-5 rounded-full bg-blue-600 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs">
                  2
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Day 3: Follow-Up Reminder (Conditional)
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Wait 48 Hours
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Condition:</label>
                    <select
                      value={step2Condition}
                      onChange={(e) => setStep2Condition(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none"
                    >
                      <option value="if_no_reply">If Customer Did NOT Reply (Recommended)</option>
                      <option value="if_unread">If Message Was NOT Read</option>
                      <option value="always">Always Send to All</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Follow-up Template:</label>
                    <select
                      value={step2Template}
                      onChange={(e) => setStep2Template(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none"
                    >
                      {metaTemplates.map((t) => (
                        <option key={t.id || t.name} value={t.name}>
                          {t.name} ({t.language?.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* STEP 3: Day 6 CRM Routing */}
              <div className="relative bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2.5">
                <div className="absolute -left-6 top-3.5 w-5 h-5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs">
                  3
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Kanban className="w-3.5 h-3.5 text-emerald-600" />
                    Day 6: Move to Sales CRM Pipeline
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Wait 72 Hours
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Target Pipeline Stage (If Replied):</label>
                    <select
                      value={step3TargetStage}
                      onChange={(e) => setStep3TargetStage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none"
                    >
                      <option value="Qualified / Demo">Qualified Lead / Demo Booked</option>
                      <option value="Proposal / Quote">Proposal / Price Quote Sent</option>
                      <option value="Contacted">Contacted / In Discussion</option>
                      <option value="Won">Closed / Deal Won</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Assign Lead To:</label>
                    <select
                      value={step3Assignee}
                      onChange={(e) => setStep3Assignee(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none"
                    >
                      <option value="Territory Sales Rep">Territory Sales Rep</option>
                      <option value="Owner / Admin">Business Owner / Admin</option>
                      <option value="Round Robin">Round Robin (Distribute Evenly)</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SAFETY PROTOCOL NOTICE (STRICT USER COMPLIANCE) */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-emerald-900 space-y-0.5 leading-relaxed">
              <p className="font-bold">🔒 Strict Safety Mode (Draft / Paused)</p>
              <p className="text-emerald-700">
                This Drip Sequence will be created in <strong>Draft (Paused)</strong> status. ARCO will <strong>NEVER</strong> trigger or dispatch any automated messages to your leads until you explicitly review and click "Activate Sequence".
              </p>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Journey...</span>
                </>
              ) : (
                <>
                  <Workflow className="w-4 h-4" />
                  <span>Save Drip Sequence (Draft)</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
