import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  Users,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Eye,
  MessageSquare,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
} from 'lucide-react';
import { campaignsService } from '../../services/campaignsService';

export default function RetargetCampaignModal({
  isOpen,
  onClose,
  campaign,
  statusCounts = {},
  onSuccess,
}) {
  const [cohort, setCohort] = useState('read_no_reply');
  const [campaignName, setCampaignName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [metaTemplates, setMetaTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Calculate cohort counts from live statusCounts / campaign data
  const totalRead = statusCounts?.read ?? campaign?.read ?? 0;
  const totalReplied = statusCounts?.replied ?? campaign?.replied ?? 0;
  const totalDelivered = statusCounts?.delivered ?? campaign?.delivered ?? 0;
  const totalFailed = statusCounts?.failed ?? campaign?.failureCount ?? campaign?.failed ?? 0;

  const readNoReplyCount = Math.max(0, totalRead - totalReplied);
  const deliveredUnreadCount = Math.max(0, totalDelivered - totalRead);

  // Load approved Meta templates on mount
  useEffect(() => {
    if (!isOpen) return;

    // Prefill initial campaign name based on default cohort
    const baseName = campaign?.name || 'Campaign';
    setCampaignName(`[Retarget] ${baseName} - Read No Reply`);
    setError('');

    async function loadMetaTpls() {
      setLoadingTemplates(true);
      try {
        const res = await campaignsService.getMetaTemplates();
        const approved = res?.approved || res?.data?.filter((t) => t.status === 'APPROVED') || [];
        setMetaTemplates(approved);
        if (approved.length > 0) {
          // Default to a follow-up template if available or first template
          const followUpTpl = approved.find(
            (t) =>
              t.name.toLowerCase().includes('follow') ||
              t.name.toLowerCase().includes('followup') ||
              t.name.toLowerCase().includes('gujarat')
          );
          setSelectedTemplate(followUpTpl ? followUpTpl.name : approved[0].name);
        }
      } catch (err) {
        console.warn('Failed to load Meta templates for retargeting:', err);
      } finally {
        setLoadingTemplates(false);
      }
    }

    loadMetaTpls();
  }, [isOpen, campaign?.name]);

  // Update suggested campaign name when cohort changes
  const handleCohortChange = (newCohort) => {
    setCohort(newCohort);
    const baseName = campaign?.name || 'Campaign';
    let label = 'Read No Reply';
    if (newCohort === 'delivered_no_read') label = 'Delivered Unread';
    else if (newCohort === 'failed') label = 'Failed Retry';
    else if (newCohort === 'replied') label = 'Engaged Leads';
    setCampaignName(`[Retarget] ${baseName} - ${label}`);
  };

  const currentTemplateObj = metaTemplates.find((t) => t.name === selectedTemplate);

  const getTemplateBodyText = (tpl) => {
    if (!tpl) return '';
    const bodyComp = tpl.components?.find((c) => c.type === 'BODY');
    return bodyComp?.text || tpl.body_text || 'No preview available';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!campaign?.id) return;
    if (!campaignName.trim()) {
      setError('Please provide a name for the retargeted campaign.');
      return;
    }
    if (!selectedTemplate) {
      setError('Please select a WhatsApp message template.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await campaignsService.retargetCampaign(campaign.id, {
        cohort,
        name: campaignName.trim(),
        templateName: selectedTemplate,
        templateLanguage: currentTemplateObj?.language || 'en_US',
        templateCategory: currentTemplateObj?.category || 'MARKETING',
      });

      if (res?.success) {
        onSuccess?.(res.data);
        onClose();
      } else {
        setError(res?.error || res?.message || 'Failed to create retargeted campaign.');
      }
    } catch (err) {
      setError(err?.message || 'An unexpected error occurred while creating retargeted campaign.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">1-Click Campaign Retargeting</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Interakt Style
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 truncate max-w-md">
                Source: <span className="text-white font-semibold">{campaign?.name}</span>
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Select Target Cohort */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Select Audience Cohort to Retarget
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Cohort 1: Read No Reply */}
              <div
                onClick={() => handleCohortChange('read_no_reply')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  cohort === 'read_no_reply'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Read, Did Not Reply
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                    {readNoReplyCount.toLocaleString()} Contacts
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Prospects who opened and viewed your catalog message, but haven't responded yet. (Highest conversion potential)
                </p>
              </div>

              {/* Cohort 2: Delivered Unread */}
              <div
                onClick={() => handleCohortChange('delivered_no_read')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  cohort === 'delivered_no_read'
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Delivered, Unread
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                    {deliveredUnreadCount.toLocaleString()} Contacts
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Messages received on customer phones but not opened. Send a short, catchy reminder.
                </p>
              </div>

              {/* Cohort 3: Failed / Bounced */}
              <div
                onClick={() => handleCohortChange('failed')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  cohort === 'failed'
                    ? 'border-amber-600 bg-amber-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Failed Delivery
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                    {totalFailed.toLocaleString()} Contacts
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Numbers that failed or timed out. Re-attempt delivery with an approved Utility template.
                </p>
              </div>

              {/* Cohort 4: Replied / Engaged */}
              <div
                onClick={() => handleCohortChange('replied')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  cohort === 'replied'
                    ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Engaged / Replied
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800">
                    {totalReplied.toLocaleString()} Contacts
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Hot leads who sent a response. Send quotation, payment link, or dispatch timeline.
                </p>
              </div>

            </div>
          </div>

          {/* STEP 2: Campaign Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Retargeted Campaign Title
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g. [Retarget] Optical Expo - Read No Reply"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* STEP 3: Choose Follow-Up Template */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Select Follow-Up WhatsApp Template
              </label>
              {loadingTemplates && (
                <span className="text-[11px] text-slate-400">Loading Meta templates...</span>
              )}
            </div>

            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {metaTemplates.map((t) => (
                <option key={t.id || t.name} value={t.name}>
                  {t.name} ({t.language?.toUpperCase()}) — {t.category}
                </option>
              ))}
            </select>

            {/* Template Live Preview Card */}
            {currentTemplateObj && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    Template Body Preview
                  </span>
                  <span className="text-slate-400 uppercase font-semibold">
                    {currentTemplateObj.language} • {currentTemplateObj.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed font-sans">
                  {getTemplateBodyText(currentTemplateObj)}
                </p>
              </div>
            )}
          </div>

          {/* SAFETY PROTOCOL NOTICE (STRICT USER COMPLIANCE) */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-emerald-900 space-y-0.5 leading-relaxed">
              <p className="font-bold">🔒 Strict Safety Mode (Draft Only)</p>
              <p className="text-emerald-700">
                This retargeted campaign will be generated in <strong>DRAFT</strong> mode. Zero messages will be dispatched automatically. You can review the filtered contacts and template in peace, and launch manually whenever you choose.
              </p>
            </div>
          </div>

          {/* Modal Footer Buttons */}
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
              disabled={submitting || !selectedTemplate}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Preparing Audience...</span>
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  <span>Create Retargeted Campaign (Draft)</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
