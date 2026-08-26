import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Edit2,
  Trash2,
  Copy,
  CheckCircle2,
  X,
  RefreshCw,
  MoreVertical,
  Info,
  Play,
} from 'lucide-react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import AutomationSubNav from '../../components/automation/AutomationSubNav';
import AutomationSimulatorDrawer from '../../components/automation/AutomationSimulatorDrawer';
import { automationService } from '../../services/automationService';

export default function CustomAutoReply() {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('whatsapp'); // 'whatsapp' | 'instagram'
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [masterToggle, setMasterToggle] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Modal State: null | { mode: 'create' } | { mode: 'edit', data: item } | { mode: 'delete', data: item }
  const [modalState, setModalState] = useState(null);

  // Form inputs
  const [formTrigger, setFormTrigger] = useState('');
  const [formAdditionalTriggers, setFormAdditionalTriggers] = useState('');
  const [formMatchType, setFormMatchType] = useState('contains');
  const [formActionType, setFormActionType] = useState('auto_reply');
  const [formResponse, setFormResponse] = useState('');
  const [formChannel, setFormChannel] = useState('whatsapp');
  const [formStatus, setFormStatus] = useState('active');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadReplies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab) params.channel = activeTab;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await automationService.getCustomReplies(params);
      if (res?.data) {
        setReplies(res.data);
      }
    } catch (err) {
      console.error('Failed to load custom auto-replies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReplies();
  }, [activeTab, searchQuery]);

  const handleOpenCreateModal = () => {
    setFormTrigger('');
    setFormAdditionalTriggers('');
    setFormMatchType('contains');
    setFormActionType('auto_reply');
    setFormResponse('');
    setFormChannel(activeTab || 'whatsapp');
    setFormStatus('active');
    setModalState({ mode: 'create' });
  };

  const handleOpenEditModal = (item) => {
    setFormTrigger(item.trigger_keyword || '');
    const addTriggers = Array.isArray(item.additional_triggers)
      ? item.additional_triggers.join(', ')
      : '';
    setFormAdditionalTriggers(addTriggers);
    setFormMatchType(item.match_type || 'contains');
    setFormActionType(item.action_type || 'auto_reply');
    setFormResponse(item.response_message || '');
    setFormChannel(item.channel || 'whatsapp');
    setFormStatus(item.status || 'active');
    setModalState({ mode: 'edit', data: item });
    setActiveMenuId(null);
  };

  const handleSaveSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formTrigger.trim()) {
      alert('Please enter a trigger keyword');
      return;
    }
    if (!formResponse.trim()) {
      alert('Please enter a response message');
      return;
    }

    const additionalArr = formAdditionalTriggers
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (modalState.mode === 'create') {
        await automationService.createCustomReply({
          trigger_keyword: formTrigger.trim(),
          additional_triggers: additionalArr,
          match_type: formMatchType,
          action_type: formActionType,
          response_message: formResponse.trim(),
          channel: formChannel,
          status: formStatus,
        });
        showToast('Custom auto-reply created successfully!');
      } else if (modalState.mode === 'edit') {
        await automationService.updateCustomReply(modalState.data.id, {
          trigger_keyword: formTrigger.trim(),
          additional_triggers: additionalArr,
          match_type: formMatchType,
          action_type: formActionType,
          response_message: formResponse.trim(),
          channel: formChannel,
          status: formStatus,
        });
        showToast('Custom auto-reply updated!');
      }

      setModalState(null);
      loadReplies();
    } catch (err) {
      alert(err.message || 'Failed to save auto-reply');
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await automationService.toggleCustomReply(item.id);
      showToast(`Toggled status for "${item.trigger_keyword}"`);
      setActiveMenuId(null);
      loadReplies();
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDuplicate = async (item) => {
    try {
      await automationService.duplicateCustomReply(item.id);
      showToast(`Duplicated "${item.trigger_keyword}"`);
      setActiveMenuId(null);
      loadReplies();
    } catch (err) {
      alert(err.message || 'Failed to duplicate');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await automationService.deleteCustomReply(modalState.data.id);
      showToast('Custom auto-reply deleted successfully');
      setModalState(null);
      setActiveMenuId(null);
      loadReplies();
    } catch (err) {
      alert(err.message || 'Failed to delete reply');
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
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-slate-900 leading-tight">Custom Auto Replies</h1>
                  <p className="text-xs text-slate-500">Auto-reply to specific questions</p>
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
                  onClick={handleOpenCreateModal}
                  className="px-3.5 py-2 rounded-lg bg-[#0d3b30] hover:bg-[#092b23] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Custom Reply</span>
                </button>
              </div>
            </div>

            {/* Top Information Banner (AI Intent Matching Promotion) */}
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

            {/* Channel Tabs & Search */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('whatsapp')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'whatsapp'
                      ? 'bg-[#0d3b30] text-white shadow-2xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Whatsapp
                </button>
                <button
                  onClick={() => setActiveTab('instagram')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'instagram'
                      ? 'bg-[#0d3b30] text-white shadow-2xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Instagram
                </button>
              </div>

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

            {/* Main Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
              {loading ? (
                <div className="py-16 text-center space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#0d3b30] mx-auto" />
                  <p className="text-xs text-slate-400">Loading custom auto replies...</p>
                </div>
              ) : replies.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-xs text-slate-500">No custom auto replies found for this channel.</p>
                  <button
                    onClick={handleOpenCreateModal}
                    className="px-3 py-1 rounded bg-[#0d3b30] text-white text-xs font-bold cursor-pointer"
                  >
                    + Add New
                  </button>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                      <th className="py-3 px-4 font-bold">Trigger</th>
                      <th className="py-3 px-4 font-bold">Action Type</th>
                      <th className="py-3 px-4 font-bold">Action Preview</th>
                      <th className="py-3 px-4 font-bold text-center">Conversation Sent</th>
                      <th className="py-3 px-4 font-bold">Created/Updated</th>
                      <th className="py-3 px-4 text-right w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {replies.map((reply) => {
                      const additional = Array.isArray(reply.additional_triggers) ? reply.additional_triggers : [];
                      const isMenuOpen = activeMenuId === reply.id;
                      return (
                        <tr key={reply.id} className="hover:bg-slate-50/50 transition-colors relative">
                          
                          {/* Trigger */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-900 truncate">{reply.trigger_keyword}</span>
                              {additional.length > 0 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#e8f6f0] text-[#0d3b30] border border-emerald-200">
                                  +{additional.length}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Action Type */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                              <span>Auto replies</span>
                            </div>
                          </td>

                          {/* Action Preview */}
                          <td className="py-3.5 px-4 max-w-sm">
                            <p className="text-slate-600 truncate font-normal">
                              {reply.response_message}
                            </p>
                          </td>

                          {/* Conversation Sent */}
                          <td className="py-3.5 px-4 text-center font-medium text-slate-800">
                            {reply.conversations_sent || 0}
                          </td>

                          {/* Created/Updated */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-500 leading-tight">
                            <div>Created on {new Date(reply.created_at || Date.now()).toLocaleDateString('en-GB')}</div>
                            <div>Updated on {new Date(reply.updated_at || Date.now()).toLocaleDateString('en-GB')}</div>
                          </td>

                          {/* 3-Dot Actions Menu */}
                          <td className="py-3.5 px-4 text-right relative">
                            <button
                              onClick={() => setActiveMenuId(isMenuOpen ? null : reply.id)}
                              className="text-slate-400 hover:text-slate-700 p-1 rounded-sm cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Popup Action Dropdown */}
                            {isMenuOpen && (
                              <div className="absolute right-4 top-10 w-36 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-20 text-xs text-left animate-in fade-in zoom-in-95">
                                <button
                                  onClick={() => handleOpenEditModal(reply)}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDuplicate(reply)}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Duplicate</span>
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(reply)}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <span>{reply.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setModalState({ mode: 'delete', data: reply });
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

            {/* Bottom Toggle Bar */}
            <div className="flex items-center gap-3 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={masterToggle}
                  onChange={(e) => setMasterToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
              <span className="text-xs font-semibold text-slate-700">
                Custom Auto Replies are switched on
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT CUSTOM AUTO REPLY */}
      {/* ========================================================================= */}
      {(modalState?.mode === 'create' || modalState?.mode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-xs text-slate-900">
                {modalState.mode === 'create' ? 'Add New Custom Auto Reply' : 'Edit Custom Auto Reply'}
              </h3>
              <button onClick={() => setModalState(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-5 space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Channel</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormChannel('whatsapp')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${
                      formChannel === 'whatsapp' ? 'bg-[#e8f6f0] border-emerald-500 text-[#0d3b30]' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormChannel('instagram')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${
                      formChannel === 'instagram' ? 'bg-pink-50 border-pink-500 text-pink-700' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Instagram
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Primary Trigger Phrase / Question *</label>
                <input
                  type="text"
                  required
                  value={formTrigger}
                  onChange={(e) => setFormTrigger(e.target.value)}
                  placeholder="e.g. What digital solutions do you provide?"
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Additional Triggers <span className="text-slate-400 font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={formAdditionalTriggers}
                  onChange={(e) => setFormAdditionalTriggers(e.target.value)}
                  placeholder="e.g. services, pricing, plans, solutions"
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Response Message Text *</label>
                <textarea
                  rows={4}
                  required
                  value={formResponse}
                  onChange={(e) => setFormResponse(e.target.value)}
                  placeholder="Enter auto response text..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d3b30] outline-hidden resize-none font-medium"
                />
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
                  {modalState.mode === 'create' ? 'Add Reply' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {modalState?.mode === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-bold text-xs text-slate-900">Delete Custom Auto Reply?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete trigger "{modalState.data.trigger_keyword}"?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalState(null)}
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
