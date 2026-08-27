import { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Check,
  RefreshCw,
  Link as LinkIcon,
  Play,
  ArrowRight,
  ArrowLeft,
  Share2,
  Clock,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';

export default function GoogleSheetsModal({
  isOpen,
  onClose,
  currentConfig,
  onConfigChange,
  showToast,
}) {
  // Step 1: Overview (Exact Interakt Reference UI) | Step 2: Configuration & Column Mapping
  const [step, setStep] = useState(1);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Form State
  const [sheetUrl, setSheetUrl] = useState(
    currentConfig?.sheetUrl ||
      'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
  );
  const [sheetName, setSheetName] = useState(currentConfig?.sheetName || 'Leads & Inquiries');
  const [triggerEvent, setTriggerEvent] = useState(currentConfig?.triggerEvent || 'new_row'); // 'new_row' | 'row_updated' | 'date_reached'
  const [selectedTemplate, setSelectedTemplate] = useState(currentConfig?.selectedTemplate || 'tmpl_sample_01');
  const [autoSync, setAutoSync] = useState(currentConfig?.autoSync !== false);
  const [saving, setSaving] = useState(false);

  // Reset to Step 1 whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsPlayingVideo(false);
      if (currentConfig?.sheetUrl) setSheetUrl(currentConfig.sheetUrl);
      if (currentConfig?.sheetName) setSheetName(currentConfig.sheetName);
      if (currentConfig?.triggerEvent) setTriggerEvent(currentConfig.triggerEvent);
      if (currentConfig?.selectedTemplate) setSelectedTemplate(currentConfig.selectedTemplate);
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!sheetUrl.trim()) {
      showToast('Google Spreadsheet URL is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        connected: true,
        sheetUrl: sheetUrl.trim(),
        sheetName: sheetName.trim(),
        triggerEvent,
        selectedTemplate,
        autoSync,
      };

      const res = await dashboardService.saveGoogleSheets(payload);
      if (res?.success || res?.data) {
        showToast('Google Sheets connected & live automation activated!', 'success');
        if (onConfigChange) onConfigChange(payload);
        onClose();
      } else {
        showToast(res?.message || 'Failed to connect Google Sheets', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error connecting Google Sheets', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs overflow-y-auto animate-in fade-in duration-150 font-sans">
      
      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-[760px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 text-xs">
        
        {/* ========================================================================= */}
        {/* TOP HEADER: Title + Close Button                                          */}
        {/* ========================================================================= */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-between bg-white shrink-0">
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            ARCO - Google Sheets Integration
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: EXACT INTERAKT 2-COLUMN OVERVIEW & VIDEO PREVIEW                  */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="flex-1 flex flex-col md:flex-row min-h-[300px]">
            
            {/* LEFT COLUMN: Integration Explanation */}
            <div className="w-full md:w-1/2 px-6 py-4 flex flex-col justify-between bg-white space-y-4">
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">
                  USE THIS INTEGRATION TO AUTOMATE
                </h3>

                <p className="text-xs text-gray-600 font-medium">
                  Send a WhatsApp notification when:
                </p>

                {/* Bullet Points Matching Interakt */}
                <ul className="space-y-2.5 text-xs text-gray-600 list-disc pl-4 leading-relaxed">
                  <li>
                    A new row is added to a connected sheet
                  </li>
                  <li>
                    An existing row is updated
                  </li>
                  <li>
                    A scheduled date in a sheet column is reached (e.g., birthday, renewal reminder)
                  </li>
                </ul>
              </div>

              {/* Real-time Webhook Callout */}
              <div className="p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-lg text-emerald-950 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="text-[11px] leading-tight">
                  <strong>Real-Time Webhook Engine:</strong> Dispatches WhatsApp messages within seconds of sheet updates.
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: Video Thumbnail / Walkthrough Area */}
            <div className="w-full md:w-1/2 p-6 bg-[#f0fbf6] flex flex-col items-center justify-center">
              
              {/* Video Mockup Frame */}
              <div className="bg-[#0a4739] rounded-lg shadow-md border border-[#0d5947] w-full max-w-[290px] aspect-[16/10] p-3 flex flex-col justify-between text-white relative overflow-hidden select-none group">
                
                {isPlayingVideo ? (
                  <div className="flex-1 flex flex-col justify-center items-center text-center space-y-2 animate-in fade-in">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
                    <div className="font-bold text-white text-[11px]">Connecting Google Sheets...</div>
                    <button
                      type="button"
                      onClick={() => setIsPlayingVideo(false)}
                      className="text-[9px] text-emerald-300 hover:underline cursor-pointer"
                    >
                      Reset Walkthrough
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Video Top Header */}
                    <div className="flex items-start gap-1.5">
                      <div className="w-4 h-4 rounded bg-emerald-600 flex items-center justify-center text-[8px] font-black text-white shrink-0 mt-0.5">
                        A
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[10px] text-white leading-tight truncate">
                          Automate WhatsApp Messages from Google Sheets
                        </div>
                        <div className="text-[8px] text-emerald-200 opacity-90">
                          ARCO for WhatsApp Business
                        </div>
                      </div>
                    </div>

                    {/* Video Center Banner & Play Button */}
                    <div className="flex flex-col items-center justify-center space-y-1.5 my-auto">
                      <div className="bg-[#f7b731] text-[#3d2700] text-[9px] font-bold py-0.5 px-2.5 rounded shadow-2xs text-center">
                        Google Sheet Integration Setup
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPlayingVideo(true)}
                        className="w-9 h-7 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105"
                        title="Play Walkthrough"
                      >
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </button>
                    </div>

                    {/* Video Bottom Details */}
                    <div className="flex items-center justify-between text-[8px] text-white/80">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-3 h-3 hover:text-white cursor-pointer" />
                        <Clock className="w-3 h-3 hover:text-white cursor-pointer" />
                      </div>
                      <div className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] font-medium text-white">
                        Watch Walkthrough
                      </div>
                    </div>
                  </>
                )}

              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: CONFIGURATION & COLUMN MAPPING                                    */}
        {/* ========================================================================= */}
        {step === 2 && (
          <form onSubmit={handleSave} className="p-6 space-y-4 bg-white overflow-y-auto max-h-[60vh]">
            
            {/* Google Account Status Badge */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 shadow-2xs">
                  G
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Google Workspace Account</div>
                  <div className="text-[10px] text-slate-500">Connected as owner@company.com</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Check className="w-2.5 h-2.5 text-emerald-600" /> Authorized
              </span>
            </div>

            {/* Inputs: URL & Sheet Tab */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">
                  Google Spreadsheet URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium text-xs"
                  />
                  <LinkIcon className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">
                  Target Sheet Tab Name
                </label>
                <input
                  type="text"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="e.g. Leads, Orders, Sheet1"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium text-xs"
                />
              </div>
            </div>

            {/* Trigger Event Selection */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block text-xs">Trigger Event Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTriggerEvent('new_row')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    triggerEvent === 'new_row'
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs">New Row Added</div>
                  <div className="text-[10px] text-slate-500 font-normal">Triggers on new entry</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTriggerEvent('row_updated')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    triggerEvent === 'row_updated'
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs">Row Updated</div>
                  <div className="text-[10px] text-slate-500 font-normal">Triggers on modification</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTriggerEvent('date_reached')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    triggerEvent === 'date_reached'
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs">Date Reached</div>
                  <div className="text-[10px] text-slate-500 font-normal">Renewal / Birthday alert</div>
                </button>
              </div>
            </div>

            {/* Template Selection */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block text-xs">WhatsApp Message Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium text-xs cursor-pointer"
              >
                <option value="tmpl_sample_01">🎁 Promotional Offer 01 (Welcome & Deals)</option>
                <option value="tmpl_sample_07">📅 Subscription Renewal Reminder 07</option>
                <option value="tmpl_sample_08">📦 Order Confirmation & Tracking 08</option>
                <option value="tmpl_sample_14">🛠️ Support Ticket Update 14</option>
              </select>
            </div>

            {/* Column Mapping Preview */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 text-[10px] font-bold text-slate-700 flex justify-between">
                <span>Google Sheet Column</span>
                <span>Template Parameter Mapping</span>
              </div>
              <div className="divide-y divide-slate-100 text-[10px] bg-white">
                <div className="px-3 py-1.5 flex justify-between items-center text-slate-700">
                  <span className="font-semibold text-slate-900">Column A (Customer Name)</span>
                  <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{"{{1}}"} (Customer Name)</span>
                </div>
                <div className="px-3 py-1.5 flex justify-between items-center text-slate-700">
                  <span className="font-semibold text-slate-900">Column B (Phone Number)</span>
                  <span className="font-mono text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">WhatsApp Recipient</span>
                </div>
                <div className="px-3 py-1.5 flex justify-between items-center text-slate-700">
                  <span className="font-semibold text-slate-900">Column C (Order / Service Detail)</span>
                  <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{"{{2}}"} (Custom Detail)</span>
                </div>
              </div>
            </div>

            {/* Live Sync Toggle */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-xs">Real-Time Two-Way Lead Sync</div>
                <div className="text-[10px] text-slate-500">Auto-update sheet when WhatsApp customer replies</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#00875a]"></div>
              </label>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* BOTTOM ACTION FOOTER: Cancel & Next Buttons                               */}
        {/* ========================================================================= */}
        <div className="px-6 py-3.5 bg-white border-t border-gray-100 flex items-center justify-start gap-3 shrink-0">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-1.5 rounded border border-[#00875a] bg-white hover:bg-[#eef8f3] text-[#00875a] font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-1.5 rounded bg-[#00875a] hover:bg-[#00704a] text-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
              >
                <span>Next</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-1.5 rounded bg-[#00875a] hover:bg-[#00704a] text-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>{saving ? 'Connecting...' : 'Connect & Save Integration'}</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
