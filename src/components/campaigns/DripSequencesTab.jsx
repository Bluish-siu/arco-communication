import React, { useState, useEffect } from 'react';
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Clock,
  Layers,
  Send,
  Kanban,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Trash2,
  Edit3,
  RefreshCw,
  Sparkles,
  Users,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { campaignsService } from '../../services/campaignsService';
import CreateDripSequenceModal from './CreateDripSequenceModal';

export default function DripSequencesTab({ showToast }) {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionConfirmModal, setActionConfirmModal] = useState(null); // { seq, targetStatus }
  const [updatingId, setUpdatingId] = useState(null);

  const loadSequences = async () => {
    setLoading(true);
    try {
      const data = await campaignsService.getDripSequences();
      setSequences(data);
    } catch (err) {
      console.warn('Failed to load drip sequences:', err);
      showToast?.('Failed to load drip sequences', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSequences();
  }, []);

  const handleToggleStatus = async (seq, targetStatus) => {
    setUpdatingId(seq.id);
    try {
      const res = await campaignsService.updateDripSequenceStatus(seq.id, targetStatus);
      if (res?.success) {
        showToast?.(
          targetStatus === 'Active'
            ? `Drip Sequence "${seq.name}" is now Active!`
            : `Drip Sequence "${seq.name}" paused safely.`
        );
        loadSequences();
      } else {
        showToast?.(res?.error || 'Failed to update sequence status', 'error');
      }
    } catch (err) {
      showToast?.(err.message || 'Error updating status', 'error');
    } finally {
      setUpdatingId(null);
      setActionConfirmModal(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Drip Sequence?')) return;
    try {
      const res = await campaignsService.deleteDripSequence(id);
      if (res?.success) {
        showToast?.('Drip Sequence deleted.');
        loadSequences();
      }
    } catch (err) {
      showToast?.('Failed to delete sequence', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Workflow className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">
              WhatsApp Drip Sequences & Smart Retargeting
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800">
              Multi-Day Journeys
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Automate multi-day follow-up touchpoints on WhatsApp. Automatically nudge unresponsive contacts on Day 3 and route warm respondents directly into your Sales CRM Pipeline on Day 6.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Drip Sequence</span>
        </button>
      </div>

      {/* Safety Protocol Banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <strong className="font-bold">🔒 Strict Safety Protocol Active: </strong>
          All sequences remain in <strong>Draft / Paused</strong> status by default. ARCO will <strong>NEVER</strong> trigger or dispatch automated messages automatically until you explicitly click "Activate Sequence".
        </div>
      </div>

      {/* Sequences List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
          <span>Loading Drip Sequences...</span>
        </div>
      ) : sequences.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Workflow className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No Drip Sequences Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Create your first multi-day follow-up journey to nurture optical leads and automatically route respondents to your CRM pipeline.
          </p>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl"
          >
            Create Drip Sequence
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sequences.map((seq) => {
            const steps = Array.isArray(seq.steps) ? seq.steps : [];
            const isPaused = seq.status !== 'Active';

            return (
              <div
                key={seq.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Sequence Card Top Bar */}
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900">{seq.name}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          seq.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {seq.status === 'Active' ? '▶ Active' : '⏸ Paused (Draft)'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {steps.length} Steps
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        WhatsApp Cloud API
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                      {seq.description || 'Automated multi-day drip nurture sequence.'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isPaused ? (
                      <button
                        type="button"
                        onClick={() =>
                          setActionConfirmModal({ seq, targetStatus: 'Active' })
                        }
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        title="Activate sequence"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Activate Sequence</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setActionConfirmModal({ seq, targetStatus: 'Paused' })
                        }
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        title="Pause sequence safely"
                      >
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause Sequence</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(seq.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Sequence"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* VISUAL 3-STAGE TIMELINE */}
                <div className="p-5 sm:p-6 bg-slate-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                    
                    {steps.map((step, idx) => (
                      <div
                        key={step.id || idx}
                        className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 font-extrabold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                            Day {step.day || (idx === 0 ? 1 : idx === 1 ? 3 : 6)}
                          </span>
                        </div>

                        <div className="text-xs font-extrabold text-slate-900">
                          {step.title}
                        </div>

                        {step.templateName && (
                          <div className="flex items-center gap-1.5 text-[11px] text-purple-700 font-semibold bg-purple-50/70 px-2.5 py-1 rounded-lg">
                            <Send className="w-3 h-3 shrink-0" />
                            <span className="truncate">Template: {step.templateName}</span>
                          </div>
                        )}

                        {step.actionType === 'move_to_pipeline' && (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
                            <Kanban className="w-3 h-3 shrink-0" />
                            <span className="truncate">Stage: {step.targetStage || 'Qualified'}</span>
                          </div>
                        )}

                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    ))}

                  </div>
                </div>

                {/* STATS COUNTERS */}
                {seq.stats && (
                  <div className="px-6 py-3.5 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex flex-wrap items-center gap-6 text-slate-500 font-medium">
                      <span>
                        Enrolled: <strong className="text-slate-900 font-bold">{seq.stats.enrolled || 0}</strong>
                      </span>
                      <span>
                        Step 1 Sent: <strong className="text-slate-900 font-bold">{seq.stats.step1_sent || 0}</strong>
                      </span>
                      <span>
                        Step 2 Nudged: <strong className="text-slate-900 font-bold">{seq.stats.step2_sent || 0}</strong>
                      </span>
                      <span>
                        Replied: <strong className="text-emerald-600 font-bold">{seq.stats.replied || 0}</strong>
                      </span>
                      <span>
                        Routed to CRM Pipeline: <strong className="text-purple-600 font-bold">{seq.stats.moved_to_crm || 0}</strong>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-medium">
                      Safety: Manual Mode Protected
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal to safely confirm before activating/pausing */}
      {actionConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  actionConfirmModal.targetStatus === 'Active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {actionConfirmModal.targetStatus === 'Active' ? (
                  <Play className="w-5 h-5 fill-current" />
                ) : (
                  <Pause className="w-5 h-5 fill-current" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {actionConfirmModal.targetStatus === 'Active'
                    ? 'Activate Drip Sequence?'
                    : 'Pause Drip Sequence?'}
                </h3>
                <p className="text-xs text-slate-500">
                  {actionConfirmModal.seq.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              {actionConfirmModal.targetStatus === 'Active'
                ? 'Activating this sequence will begin timed WhatsApp dispatches for newly enrolled contacts based on Day 1, Day 3, and Day 6 rules.'
                : 'Pausing will immediately halt all pending follow-up steps. No automated messages will be dispatched while paused.'}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setActionConfirmModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleToggleStatus(
                    actionConfirmModal.seq,
                    actionConfirmModal.targetStatus
                  )
                }
                disabled={updatingId !== null}
                className={`px-4 py-2 text-xs font-bold rounded-xl text-white shadow-xs cursor-pointer ${
                  actionConfirmModal.targetStatus === 'Active'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {updatingId ? 'Updating...' : `Confirm ${actionConfirmModal.targetStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreateDripSequenceModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => {
          showToast?.('Drip Sequence created successfully in Draft mode.');
          loadSequences();
        }}
      />

    </div>
  );
}
