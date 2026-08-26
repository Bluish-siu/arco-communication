import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  X,
  Sliders,
  ArrowRight,
  Info,
  Check,
  MessageSquare,
  Layers,
} from 'lucide-react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import AutomationSubNav from '../../components/automation/AutomationSubNav';
import AutomationSimulatorDrawer from '../../components/automation/AutomationSimulatorDrawer';
import { automationService } from '../../services/automationService';

export default function AiIntentMatching() {
  const [data, setData] = useState({ settings: {}, intents: [] });
  const [loading, setLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(75);
  const [fallbackAction, setFallbackAction] = useState('ai_agent_fallback');
  const [toastMessage, setToastMessage] = useState('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Live Test Phrase Tester
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Modal State: null | { mode: 'create' } | { mode: 'edit', data: intent }
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form Inputs
  const [formIntentName, setFormIntentName] = useState('');
  const [formPhrases, setFormPhrases] = useState('');
  const [formTargetType, setFormTargetType] = useState('workflow');
  const [formTargetName, setFormTargetName] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await automationService.getAiIntentData();
      if (res?.data) {
        setData(res.data);
        setIsEnabled(res.data.settings?.is_enabled !== false);
        setConfidenceThreshold(res.data.settings?.confidence_threshold || 75);
        setFallbackAction(res.data.settings?.fallback_action || 'ai_agent_fallback');
      }
    } catch (err) {
      console.error('Failed to load AI Intent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleEnabled = async () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState);
    try {
      await automationService.updateAiIntentSettings({
        isEnabled: nextState,
        confidenceThreshold,
        fallbackAction,
      });
      showToast(nextState ? 'AI Intent Matching Enabled!' : 'AI Intent Matching Paused');
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await automationService.updateAiIntentSettings({
        isEnabled,
        confidenceThreshold: Number(confidenceThreshold),
        fallbackAction,
      });
      showToast('AI Intent parameters updated!');
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to save settings');
    }
  };

  const handleRunIntentTest = async (e) => {
    if (e) e.preventDefault();
    if (!testInput.trim()) return;

    setIsTesting(true);
    try {
      const res = await automationService.testIntentMatching({
        message: testInput.trim(),
      });
      setTestResult(res);
    } catch (err) {
      alert(err.message || 'Failed to test intent');
    } finally {
      setIsTesting(false);
    }
  };

  const handleOpenCreateModal = () => {
    setFormIntentName('');
    setFormPhrases('');
    setFormTargetType('workflow');
    setFormTargetName('Order Tracking Workflow');
    setModalState({ mode: 'create' });
  };

  const handleOpenEditModal = (intent) => {
    setFormIntentName(intent.intent_name || '');
    const phrasesStr = Array.isArray(intent.training_phrases) ? intent.training_phrases.join(', ') : '';
    setFormPhrases(phrasesStr);
    setFormTargetType(intent.target_type || 'workflow');
    setFormTargetName(intent.target_name || '');
    setModalState({ mode: 'edit', data: intent });
  };

  const handleSaveIntentSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formIntentName.trim()) {
      alert('Please enter an intent name');
      return;
    }

    const phraseList = formPhrases
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    try {
      if (modalState.mode === 'create') {
        await automationService.createAiIntent({
          intent_name: formIntentName.trim(),
          training_phrases: phraseList,
          target_type: formTargetType,
          target_name: formTargetName.trim(),
        });
        showToast('AI Intent mapping registered!');
      } else if (modalState.mode === 'edit') {
        await automationService.updateAiIntent(modalState.data.id, {
          intent_name: formIntentName.trim(),
          training_phrases: phraseList,
          target_type: formTargetType,
          target_name: formTargetName.trim(),
        });
        showToast('AI Intent mapping updated!');
      }

      setModalState(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to save intent');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await automationService.deleteAiIntent(deleteTarget.id);
      showToast('AI Intent deleted');
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete intent');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col text-slate-800 relative font-sans">
      <DashboardSidebar />

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-row pl-14 sm:pl-16 transition-all duration-200">
        
        {/* Secondary Sub Navigation Sidebar */}
        <AutomationSubNav />

        {/* Page Main Work Area */}
        <div className="flex-1 flex flex-col bg-white min-h-[calc(100vh-64px)]">
          
          <div className="p-6 md:p-8 max-w-5xl w-full space-y-6">
            
            {/* Toast Notification */}
            {toastMessage && (
              <div className="p-3 rounded-lg bg-[#0d3b30] text-white text-xs font-bold flex items-center gap-2 shadow-md animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0d3b30] flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-slate-900 leading-tight">AI Intent Matching</h1>
                  <p className="text-xs text-slate-500">Get AI to select your reply to customers</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsSimulatorOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Play className="w-3 h-3 fill-slate-700" />
                  <span>Test Simulator</span>
                </button>

                <button
                  onClick={handleToggleEnabled}
                  className={`px-4 py-1.5 rounded-lg border text-xs font-bold shadow-2xs cursor-pointer transition-all ${
                    isEnabled
                      ? 'bg-white border-slate-700 text-slate-800 hover:bg-slate-50'
                      : 'bg-[#0d3b30] border-[#0d3b30] text-white'
                  }`}
                >
                  {isEnabled ? 'Disable AI Intent Match' : 'Enable AI Intent Match'}
                </button>
              </div>
            </div>

            {/* Main Explanatory Card */}
            <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-2xs space-y-6">
              
              <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                AI Intent Matching understands what your customers are asking and automatically triggers the correct auto-reply or chatbot workflow that you've already set up. Your existing flows stay exactly the same - they just become smarter.
              </p>

              {/* Visual Flow Diagram & Feature Bullets */}
              <div className="bg-[#f7faf8] border border-slate-200/80 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                
                {/* Left: Chat Simulation Visual */}
                <div className="space-y-4 relative">
                  
                  {/* Step 1: Customer Message */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs max-w-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                      <MessageSquare className="w-3 h-3 text-slate-400" />
                      <span>Customer Message</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      I'm unable to track my order. Where is it ...when can I expect it to be delivered?
                    </p>
                    <div className="text-[10px] text-slate-400 text-right">1:54 pm</div>
                  </div>

                  {/* Step 2: AI Analysing Intent Badge */}
                  <div className="flex justify-center -my-1">
                    <div className="px-3 py-1.5 rounded-full bg-[#e8f6f0] border border-emerald-200 text-[#0d3b30] text-[11px] font-bold shadow-2xs flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-600 animate-spin" />
                      <span>AI Analysing Intent... (Order Tracking)</span>
                    </div>
                  </div>

                  {/* Step 3: Triggered Workflow Response */}
                  <div className="bg-[#e8f6f0] p-3.5 rounded-xl border border-emerald-300 shadow-xs max-w-xs ml-auto space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#0d3b30]">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Order Tracking Workflow Triggered</span>
                      </div>
                    </div>
                    <p className="text-xs text-emerald-950 font-medium">
                      I can help you track your order! Please provide your order number...
                    </p>
                    <div className="text-[10px] text-emerald-700 text-right">1:54 pm ✓✓</div>
                  </div>

                </div>

                {/* Right: Feature Bullet Points */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Understands messages</h4>
                      <p className="text-xs text-slate-500">AI understands customer messages even when keywords don't match.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Triggers the right automation</h4>
                      <p className="text-xs text-slate-500">Ensures the correct auto-reply or chatbot flow fires.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Zero setup required</h4>
                      <p className="text-xs text-slate-500">Works instantly with everything you already built.</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Pricing Note */}
            <div className="border border-amber-200/80 rounded-lg p-3 bg-amber-50/40 flex items-center gap-2 text-xs text-slate-700">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                ₹0.2 per successful intent match will be deducted from ARCO wallet.{' '}
                <a href="#pricing" className="text-blue-600 hover:underline">Know how pricing works?</a>
              </span>
            </div>

            {/* Things to Know Card */}
            <div className="bg-[#f0f7fc] border border-sky-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Things to know.</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                <p>• Before enabling AI Intent Matching, make sure you have created sufficient auto-replies & workflows.</p>
                <p>
                  • AI Intent Matching works by intelligently routing customer messages to your existing automations. The agent will be useful only if there are a good number of auto-replies & workflows covering different topics which customers might reach out for.
                </p>
              </div>

              <div className="flex items-center gap-6 pt-2 text-xs font-bold">
                <Link to="/automation/custom-reply" className="text-blue-600 hover:underline flex items-center gap-1">
                  <span>Set up Auto-Replies</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>

                <Link to="/automation/workflows" className="text-blue-600 hover:underline flex items-center gap-1">
                  <span>Create Workflows</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Interactive Intent Tester & Mappings Section */}
            <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Live Phrase Matcher & Intent Mappings</h3>
                  <p className="text-[11px] text-slate-400">Test how customer messages match against your configured intents</p>
                </div>

                <button
                  onClick={handleOpenCreateModal}
                  className="px-3 py-1.5 rounded-lg bg-[#0d3b30] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-[#092b23]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Intent Mapping</span>
                </button>
              </div>

              {/* Phrase Test Box */}
              <form onSubmit={handleRunIntentTest} className="flex gap-2">
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Type any test query (e.g. Can you track my delivery #4592?)..."
                  className="flex-1 p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-[#0d3b30] outline-hidden"
                />
                <button
                  type="submit"
                  disabled={isTesting}
                  className="px-4 py-2 rounded-lg bg-[#0d3b30] text-white font-bold text-xs cursor-pointer hover:bg-[#092b23]"
                >
                  {isTesting ? 'Evaluating...' : 'Score Intent'}
                </button>
              </form>

              {testResult && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#0d3b30]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Confidence Score: {testResult.confidenceScore}% (Threshold: {testResult.threshold}%)</span>
                  </div>
                  <p className="text-slate-700">
                    Matched Intent: <span className="font-bold">{testResult.matchedIntent || 'No direct match'}</span> → Target: <span className="font-bold">{testResult.targetName}</span>
                  </p>
                </div>
              )}

              {/* Intent Mappings List */}
              <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
                {data.intents?.map((intent) => (
                  <div key={intent.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{intent.intent_name}</div>
                      <div className="text-[11px] text-slate-400">
                        {Array.isArray(intent.training_phrases) ? intent.training_phrases.join(', ') : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700">
                        {intent.target_name}
                      </span>
                      <button
                        onClick={() => handleOpenEditModal(intent)}
                        className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(intent)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT INTENT */}
      {/* ========================================================================= */}
      {modalState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-xs text-slate-900">
                {modalState.mode === 'create' ? 'Add AI Intent Mapping' : 'Edit AI Intent Mapping'}
              </h3>
              <button onClick={() => setModalState(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveIntentSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Intent Title / Topic *</label>
                <input
                  type="text"
                  required
                  value={formIntentName}
                  onChange={(e) => setFormIntentName(e.target.value)}
                  placeholder="e.g. Order Tracking Inquiry"
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Sample Training Phrases (comma-separated) *</label>
                <textarea
                  rows={3}
                  required
                  value={formPhrases}
                  onChange={(e) => setFormPhrases(e.target.value)}
                  placeholder="where is my order, track shipment, parcel status, delivery date"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d3b30] outline-hidden resize-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Target Type</label>
                  <select
                    value={formTargetType}
                    onChange={(e) => setFormTargetType(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                  >
                    <option value="workflow">Workflow</option>
                    <option value="custom_reply">Custom Auto Reply</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Target Automation Name</label>
                  <input
                    type="text"
                    value={formTargetName}
                    onChange={(e) => setFormTargetName(e.target.value)}
                    placeholder="e.g. Order Tracking Workflow"
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                  />
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 -mx-5 -mb-5 mt-4">
                <button
                  type="button"
                  onClick={() => setModalState(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0d3b30] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Save Intent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE TARGET MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-bold text-xs text-slate-900">Delete AI Intent?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete intent "{deleteTarget.intent_name}"?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Drawer */}
      <AutomationSimulatorDrawer
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />

    </div>
  );
}
