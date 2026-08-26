import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Play,
  Edit3,
  Copy,
  Trash2,
  CheckCircle2,
  Sparkles,
  Search,
  RefreshCw,
  X,
  ArrowDown,
  MessageSquare,
  HelpCircle,
  UserCheck,
  Tag,
  Clock,
  Save,
  CheckSquare,
  MoreVertical,
  Settings,
  Info,
} from 'lucide-react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import AutomationSubNav from '../../components/automation/AutomationSubNav';
import AutomationSimulatorDrawer from '../../components/automation/AutomationSimulatorDrawer';
import { automationService } from '../../services/automationService';

const NODE_TYPES = [
  { type: 'send_message', label: 'Send Message', icon: MessageSquare, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { type: 'buttons', label: 'Interactive Buttons', icon: CheckSquare, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { type: 'ask_question', label: 'Ask Question', icon: HelpCircle, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { type: 'assign_lead', label: 'Assign Lead', icon: UserCheck, color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { type: 'add_tag', label: 'Apply CRM Tag', icon: Tag, color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { type: 'delay', label: 'Delay Wait', icon: Clock, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { type: 'end_workflow', label: 'End Workflow', icon: CheckCircle2, color: 'bg-slate-100 text-slate-700 border-slate-300' },
];

export default function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isTopNoticeVisible, setIsTopNoticeVisible] = useState(true);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Builder Modal State: null | { mode: 'create' } | { mode: 'edit', data: workflow }
  const [builderModal, setBuilderModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Workflow Builder State
  const [wfName, setWfName] = useState('');
  const [wfDescription, setWfDescription] = useState('');
  const [wfTrigger, setWfTrigger] = useState('--');
  const [wfKeywords, setWfKeywords] = useState('start, demo, info, pricing');
  const [wfNodes, setWfNodes] = useState([]);
  const [isPublished, setIsPublished] = useState(true);

  // Live Builder Test Runner
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await automationService.getWorkflows(params);
      if (res?.data) {
        setWorkflows(res.data);
      }
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, [searchQuery]);

  const handleOpenCreate = () => {
    setWfName('ai_lead_qualification_flow');
    setWfDescription('Automated chatbot workflow for qualifying inbound leads');
    setWfTrigger('--');
    setWfKeywords('start, demo, inquiry, price');
    setWfNodes([
      { id: 'node_1', type: 'trigger', data: { label: 'Inbound Trigger' } },
      { id: 'node_2', type: 'send_message', data: { text: 'Welcome to ARCO! Which solution area are you looking to scale?' } },
      { id: 'node_3', type: 'buttons', data: { prompt: 'Select Service', buttons: ['WhatsApp Marketing', 'Sales CRM Chatbots', 'Voice AI Inbound'] } },
      { id: 'node_4', type: 'assign_lead', data: { queue: 'round_robin', tag: 'High Intent Lead' } },
      { id: 'node_5', type: 'end_workflow', data: { message: 'A strategist will connect with your workspace shortly.' } },
    ]);
    setIsPublished(true);
    setTestResult(null);
    setBuilderModal({ mode: 'create' });
  };

  const handleOpenEdit = (wf) => {
    setWfName(wf.name || '');
    setWfDescription(wf.description || '');
    setWfTrigger(wf.trigger || '--');
    const kw = wf.trigger_config?.keywords ? wf.trigger_config.keywords.join(', ') : 'start, demo';
    setWfKeywords(kw);
    setWfNodes(Array.isArray(wf.nodes) && wf.nodes.length > 0 ? wf.nodes : [
      { id: 'node_1', type: 'trigger', data: { label: wf.trigger || 'Trigger' } },
      { id: 'node_2', type: 'send_message', data: { text: 'Hello! Welcome to our automated flow.' } },
      { id: 'node_3', type: 'end_workflow', data: { message: 'Thank you.' } },
    ]);
    setIsPublished(wf.is_published !== false);
    setTestResult(null);
    setBuilderModal({ mode: 'edit', data: wf });
    setActiveMenuId(null);
  };

  const handleAddNode = (type) => {
    const newNodeId = `node_${Date.now()}`;
    let defaultData = {};

    switch (type) {
      case 'send_message':
        defaultData = { text: 'Thank you for connecting with us!' };
        break;
      case 'buttons':
        defaultData = { prompt: 'Please select an option:', buttons: ['Option A', 'Option B', 'Option C'] };
        break;
      case 'ask_question':
        defaultData = { question: 'What is your contact phone number?', format: 'phone' };
        break;
      case 'assign_lead':
        defaultData = { queue: 'round_robin', tag: 'Workflow Qualified' };
        break;
      case 'add_tag':
        defaultData = { tag: 'Lead - High Priority' };
        break;
      case 'delay':
        defaultData = { minutes: 5 };
        break;
      case 'end_workflow':
        defaultData = { message: 'End of automated conversation.' };
        break;
      default:
        defaultData = { text: 'Action step' };
    }

    setWfNodes((prev) => [...prev, { id: newNodeId, type, data: defaultData }]);
  };

  const handleUpdateNodeData = (index, field, value) => {
    setWfNodes((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        data: {
          ...copy[index].data,
          [field]: value,
        },
      };
      return copy;
    });
  };

  const handleRemoveNode = (index) => {
    setWfNodes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveWorkflow = async () => {
    if (!wfName.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    const keywordList = wfKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const payload = {
      name: wfName.trim(),
      description: wfDescription.trim(),
      trigger: wfTrigger.trim() || '--',
      trigger_config: { keywords: keywordList },
      action: 'Workflow',
      nodes: wfNodes,
      edges: [],
      is_published: isPublished,
    };

    try {
      if (builderModal.mode === 'create') {
        await automationService.createWorkflow(payload);
        showToast('Workflow created and activated in PostgreSQL!');
      } else if (builderModal.mode === 'edit') {
        await automationService.updateWorkflow(builderModal.data.id, payload);
        showToast('Workflow structure updated!');
      }

      setBuilderModal(null);
      loadWorkflows();
    } catch (err) {
      alert(err.message || 'Failed to save workflow');
    }
  };

  const handleRunBuilderTest = async () => {
    setIsTesting(true);
    try {
      if (builderModal?.data?.id) {
        const res = await automationService.testWorkflowExecution(builderModal.data.id, {
          message: 'START',
        });
        setTestResult(res);
      } else {
        const steps = wfNodes.map((n, i) => ({
          step: i + 1,
          type: n.type,
          label: n.data?.text || n.data?.prompt || n.data?.label || n.type,
        }));
        setTestResult({
          success: true,
          workflowName: wfName,
          executionSteps: steps,
          finalResponse: wfNodes.find((n) => n.type === 'send_message')?.data?.text || 'Workflow executed cleanly',
        });
      }
    } catch (err) {
      alert(err.message || 'Simulation failed');
    } finally {
      setIsTesting(false);
    }
  };

  const handleDuplicate = async (wf) => {
    try {
      await automationService.duplicateWorkflow(wf.id);
      showToast(`Duplicated "${wf.name}"`);
      setActiveMenuId(null);
      loadWorkflows();
    } catch (err) {
      alert(err.message || 'Failed to duplicate workflow');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await automationService.deleteWorkflow(deleteTarget.id);
      showToast('Workflow deleted successfully');
      setDeleteTarget(null);
      setActiveMenuId(null);
      loadWorkflows();
    } catch (err) {
      alert(err.message || 'Failed to delete workflow');
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
          
          {/* Top Notice Banner */}
          {isTopNoticeVisible && (
            <div className="bg-[#0b382c] text-white px-6 py-2.5 flex items-center justify-between text-xs font-normal">
              <div className="flex items-center gap-2 max-w-5xl leading-relaxed">
                <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Post Free Trial, Workflows are only available on the Sales CRM, Growth and the Advanced plans. • Sales CRM & Growth - Does not include Branching, Set a Condition node, Send a Webhook node & some other advanced nodes. • Advanced plan - Includes all Workflow features.
                </span>
              </div>
              <button
                onClick={() => setIsTopNoticeVisible(false)}
                className="text-white/80 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="p-6 md:p-8 max-w-6xl w-full space-y-5">
            
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
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm font-bold text-slate-900 leading-tight">Workflows</h1>
                    <button
                      onClick={() => alert('Opening Workflow Video Tutorial Walkthrough...')}
                      className="px-2.5 py-0.5 rounded-full bg-[#fdeeed] text-[#e04f44] border border-[#fbd3d0] font-bold text-[11px] flex items-center gap-1 cursor-pointer hover:bg-[#fcdcd9] transition-colors"
                    >
                      <Play className="w-2.5 h-2.5 fill-[#e04f44]" />
                      <span>Watch Tutorial</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">Build multi-step chatbot flows</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsSimulatorOpen(true)}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs"
                  title="Configure Settings / Test Simulator"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  onClick={handleOpenCreate}
                  className="px-3.5 py-2 rounded-lg bg-[#0d3b30] hover:bg-[#092b23] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Workflow</span>
                </button>
              </div>
            </div>

            {/* AI Intent Matching Banner */}
            {isBannerVisible && (
              <div className="border border-emerald-200 rounded-lg p-4 bg-[#f4faf7] space-y-2 relative animate-in fade-in">
                <button
                  onClick={() => setIsBannerVisible(false)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pr-6">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-slate-900">
                        AI Intent Matching for Your WhatsApp Automations
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        AI Intent Matching understands what your customers are asking and automatically triggers the correct auto-reply or workflow that you've already set up. Your existing flows stay exactly the same - they just become smarter.{' '}
                        <Link to="/automation/ai-intent-matching" className="text-blue-600 hover:underline">
                          Learn how it works?
                        </Link>
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/automation/ai-intent-matching"
                    className="px-4 py-1.5 rounded-lg border border-slate-700 hover:bg-white text-slate-800 font-bold text-xs shrink-0 cursor-pointer shadow-2xs transition-colors"
                  >
                    Enable AI Intent Match
                  </Link>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1 border-t border-emerald-100">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    ₹0.2 per successful intent match will be deducted from ARCO wallet.{' '}
                    <a href="#pricing" className="text-blue-600 hover:underline">Know how pricing works?</a>
                  </span>
                </div>
              </div>
            )}

            {/* Channel Pill & Search */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <button
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#0d3b30] text-white shadow-2xs cursor-pointer"
              >
                Whatsapp
              </button>

              <div className="relative w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Trigger"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-[#0d3b30] outline-hidden placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Workflows Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
              {loading ? (
                <div className="py-16 text-center space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#0d3b30] mx-auto" />
                  <p className="text-xs text-slate-400">Loading workflows...</p>
                </div>
              ) : workflows.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-xs text-slate-500">No workflows found.</p>
                  <button
                    onClick={handleOpenCreate}
                    className="px-3 py-1 rounded bg-[#0d3b30] text-white text-xs font-bold cursor-pointer"
                  >
                    + New Workflow
                  </button>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                      <th className="py-3 px-4 font-bold">Trigger</th>
                      <th className="py-3 px-4 font-bold">Action Type</th>
                      <th className="py-3 px-4 font-bold">Workflow Name</th>
                      <th className="py-3 px-4 font-bold text-center">Conversation Sent</th>
                      <th className="py-3 px-4 font-bold">Created/Updated</th>
                      <th className="py-3 px-4 text-right w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {workflows.map((wf) => {
                      const isMenuOpen = activeMenuId === wf.id;
                      return (
                        <tr key={wf.id} className="hover:bg-slate-50/50 transition-colors relative">
                          
                          {/* Trigger */}
                          <td className="py-3.5 px-4 font-medium text-slate-600">
                            {wf.trigger || '--'}
                          </td>

                          {/* Action Type */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                              <Layers className="w-3.5 h-3.5 text-slate-500" />
                              <span>Workflow</span>
                            </div>
                          </td>

                          {/* Workflow Name */}
                          <td className="py-3.5 px-4 max-w-sm">
                            <span className="inline-block px-3 py-1 rounded-md border border-slate-200 bg-slate-50 font-mono text-[11px] text-slate-800">
                              {wf.name}
                            </span>
                          </td>

                          {/* Conversation Sent */}
                          <td className="py-3.5 px-4 text-center font-medium text-slate-800">
                            {wf.executions || 0}
                          </td>

                          {/* Created/Updated */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-500 leading-tight">
                            <div>Created on {new Date(wf.created_at || Date.now()).toLocaleDateString('en-GB')}</div>
                            <div>Updated on {new Date(wf.updated_at || Date.now()).toLocaleDateString('en-GB')}</div>
                          </td>

                          {/* 3-Dot Menu */}
                          <td className="py-3.5 px-4 text-right relative">
                            <button
                              onClick={() => setActiveMenuId(isMenuOpen ? null : wf.id)}
                              className="text-slate-400 hover:text-slate-700 p-1 rounded-sm cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                              <div className="absolute right-4 top-10 w-36 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-20 text-xs text-left animate-in fade-in zoom-in-95">
                                <button
                                  onClick={() => handleOpenEdit(wf)}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit Flow</span>
                                </button>
                                <button
                                  onClick={() => handleDuplicate(wf)}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Duplicate</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteTarget(wf);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* WORKFLOW BUILDER MODAL */}
      {/* ========================================================================= */}
      {builderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Builder Top Bar */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {builderModal.mode === 'create' ? 'Create New Chatbot Workflow' : `Editing: ${wfName}`}
                  </h3>
                  <p className="text-[11px] text-slate-400">Visual node builder with executable step transitions</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleRunBuilderTest}
                  disabled={isTesting}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-emerald-400" />
                  <span>{isTesting ? 'Simulating...' : 'Test Flow'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveWorkflow}
                  className="px-4 py-1.5 rounded-xl bg-[#0d3b30] hover:bg-[#092b23] text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Publish</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBuilderModal(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Builder Body */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Canvas */}
              <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 space-y-4">
                
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Workflow Identifier *</label>
                      <input
                        type="text"
                        value={wfName}
                        onChange={(e) => setWfName(e.target.value)}
                        placeholder="e.g. ai_lead_qualification_bot"
                        className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-[#0d3b30] outline-hidden font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Trigger Keywords</label>
                      <input
                        type="text"
                        value={wfKeywords}
                        onChange={(e) => setWfKeywords(e.target.value)}
                        placeholder="e.g. start, demo, pricing"
                        className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Node Sequence */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Flow Steps ({wfNodes.length})</div>
                  
                  {wfNodes.map((node, index) => (
                    <div key={node.id} className="space-y-2">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative space-y-3 group hover:border-[#0d3b30] transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              {node.type.replace('_', ' ')}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveNode(index)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {node.type === 'send_message' && (
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-500">Message Text</label>
                            <textarea
                              rows={2}
                              value={node.data?.text || ''}
                              onChange={(e) => handleUpdateNodeData(index, 'text', e.target.value)}
                              placeholder="Enter message to send..."
                              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden resize-none"
                            />
                          </div>
                        )}

                        {node.type === 'buttons' && (
                          <div className="space-y-2">
                            <label className="text-[11px] font-semibold text-slate-500">Prompt Question</label>
                            <input
                              type="text"
                              value={node.data?.prompt || ''}
                              onChange={(e) => handleUpdateNodeData(index, 'prompt', e.target.value)}
                              placeholder="e.g. Please choose an option:"
                              className="w-full p-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                            />
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {(node.data?.buttons || ['Option 1', 'Option 2']).map((btn, bIdx) => (
                                <span key={bIdx} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                                  {btn}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {node.type === 'ask_question' && (
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-500">Question Prompt</label>
                            <input
                              type="text"
                              value={node.data?.question || ''}
                              onChange={(e) => handleUpdateNodeData(index, 'question', e.target.value)}
                              placeholder="e.g. What is your contact phone number?"
                              className="w-full p-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                            />
                          </div>
                        )}

                        {node.type === 'assign_lead' && (
                          <div className="p-2.5 rounded-xl bg-orange-50/50 border border-orange-100 text-xs text-orange-900">
                            <span className="font-bold">Queue Assignment:</span> Round Robin (Tag: "{node.data?.tag || 'High Intent Lead'}")
                          </div>
                        )}

                        {node.type === 'end_workflow' && (
                          <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
                            Concludes automated workflow execution gracefully.
                          </div>
                        )}
                      </div>

                      {index < wfNodes.length - 1 && (
                        <div className="flex justify-center py-0.5">
                          <ArrowDown className="w-4 h-4 text-slate-400 animate-bounce" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>

              {/* Right Step Palette */}
              <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-200 bg-white p-5 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Add Step / Node</h4>
                    <p className="text-[11px] text-slate-400">Click to append a new step to the flow</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {NODE_TYPES.map((nt) => {
                      const Icon = nt.icon;
                      return (
                        <button
                          key={nt.type}
                          type="button"
                          onClick={() => handleAddNode(nt.type)}
                          className="p-2.5 rounded-xl border border-slate-200 hover:border-[#0d3b30] hover:bg-emerald-50/40 text-left flex items-center gap-3 transition-all cursor-pointer group"
                        >
                          <div className={`w-8 h-8 rounded-lg ${nt.color} flex items-center justify-center border shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 group-hover:text-[#0d3b30]">{nt.label}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {testResult && (
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0d3b30]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Simulation Passed ({testResult.executionSteps?.length} steps)</span>
                      </div>
                      <p className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-emerald-100">
                        {testResult.finalResponse}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 text-center">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Nodes are saved to PostgreSQL and parsed by the execution engine.
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE MODAL */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-bold text-xs text-slate-900">Delete Workflow?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete workflow "{deleteTarget.name}"?
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
