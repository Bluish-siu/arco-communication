import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Wallet,
  AlertCircle,
  Smile,
  Bold,
  Italic,
  Strikethrough,
  Paperclip,
  Check,
} from 'lucide-react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import AutomationSubNav from '../../components/automation/AutomationSubNav';
import AutomationSimulatorDrawer from '../../components/automation/AutomationSimulatorDrawer';
import { automationService } from '../../services/automationService';

const EMOJIS = ['👋', '🚀', '💬', '✨', '🎁', '💼', '📞', '🌟', '🛒', '🏷️', '🤝', '👍'];
const VARIABLES = [
  { key: '{{first_name}}', label: "Customer's First Name" },
  { key: '{{full_name}}', label: "Customer's Full Name" },
  { key: '{{phone_number}}', label: 'WhatsApp Phone Number' },
  { key: '{{company_name}}', label: 'Company / Business Name' },
];

export default function CustomAutoReply() {
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('whatsapp'); // 'whatsapp' | 'instagram'
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [masterToggle, setMasterToggle] = useState(true);
  const [savingMasterToggle, setSavingMasterToggle] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Modal State: null | { mode: 'create' } | { mode: 'edit', data: item } | { mode: 'delete', data: item } | { mode: 'wallet' }
  const [modalState, setModalState] = useState(null);

  // Form inputs
  const [formTrigger, setFormTrigger] = useState('');
  const [formAdditionalTriggers, setFormAdditionalTriggers] = useState('');
  const [formMatchType, setFormMatchType] = useState('contains');
  const [formActionType, setFormActionType] = useState('auto_reply');
  const [formResponse, setFormResponse] = useState('');
  const [formChannel, setFormChannel] = useState('whatsapp');
  const [formStatus, setFormStatus] = useState('active');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form variable & emoji popovers
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Wallet top-up state
  const [walletAmount, setWalletAmount] = useState(1000);
  const [walletSaving, setWalletSaving] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Load Custom Replies & Settings
  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab) params.channel = activeTab;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [repliesRes, settingsRes] = await Promise.all([
        automationService.getCustomReplies(params),
        automationService.getSettings(),
      ]);

      if (repliesRes?.data) {
        setReplies(repliesRes.data);
      }

      if (settingsRes?.data?.custom_replies_enabled !== undefined) {
        setMasterToggle(settingsRes.data.custom_replies_enabled !== false);
      }
    } catch (err) {
      console.error('Failed to load custom auto-replies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, searchQuery]);

  // Close 3-dot menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // 2. Master Toggle Switcher
  const handleMasterToggle = async () => {
    const nextState = !masterToggle;
    setMasterToggle(nextState);
    setSavingMasterToggle(true);
    try {
      await automationService.updateSettings({ customRepliesEnabled: nextState });
      showToast(
        nextState
          ? 'Custom Auto Replies have been switched ON'
          : 'Custom Auto Replies have been switched OFF',
        nextState ? 'success' : 'info'
      );
    } catch (err) {
      setMasterToggle(!nextState); // revert
      showToast('Failed to update toggle setting', 'error');
    } finally {
      setSavingMasterToggle(false);
    }
  };

  // 3. Form Modal Openers
  const handleOpenCreateModal = () => {
    setFormTrigger('');
    setFormAdditionalTriggers('');
    setFormMatchType('contains');
    setFormActionType('auto_reply');
    setFormResponse('');
    setFormChannel(activeTab || 'whatsapp');
    setFormStatus('active');
    setFormError('');
    setModalState({ mode: 'create' });
  };

  const handleOpenEditModal = (item) => {
    setFormTrigger(item.trigger_keyword || '');
    let addTriggers = '';
    if (Array.isArray(item.additional_triggers)) {
      addTriggers = item.additional_triggers.join(', ');
    } else if (typeof item.additional_triggers === 'string') {
      try {
        const parsed = JSON.parse(item.additional_triggers);
        if (Array.isArray(parsed)) addTriggers = parsed.join(', ');
      } catch {
        addTriggers = item.additional_triggers;
      }
    }
    setFormAdditionalTriggers(addTriggers);
    setFormMatchType(item.match_type || 'contains');
    setFormActionType(item.action_type || 'auto_reply');
    setFormResponse(item.response_message || '');
    setFormChannel(item.channel || 'whatsapp');
    setFormStatus(item.status || 'active');
    setFormError('');
    setModalState({ mode: 'edit', data: item });
    setActiveMenuId(null);
  };

  // 4. Cursor Text Insertion & Formatting
  const insertTextAtCursor = (insertion) => {
    const el = textareaRef.current;
    if (!el) {
      if (formResponse.length + insertion.length <= 1024) {
        setFormResponse((prev) => prev + insertion);
      }
      return;
    }

    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const newText = formResponse.slice(0, start) + insertion + formResponse.slice(end);

    if (newText.length <= 1024) {
      setFormResponse(newText);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + insertion.length, start + insertion.length);
      }, 0);
    } else {
      showToast('Maximum 1024 characters allowed', 'error');
    }
  };

  const applyFormat = (wrapper) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const selected = formResponse.slice(start, end);

    if (selected) {
      const formatted = `${wrapper}${selected}${wrapper}`;
      insertTextAtCursor(formatted);
    } else {
      insertTextAtCursor(`${wrapper}text${wrapper}`);
    }
  };

  // 5. Submit Form (Create / Edit)
  const handleSaveSubmit = async (e) => {
    if (e) e.preventDefault();
    setFormError('');

    if (!formTrigger.trim()) {
      setFormError('Please enter a trigger keyword/question');
      showToast('Trigger keyword is required', 'error');
      return;
    }
    if (!formResponse.trim()) {
      setFormError('Please enter an auto-reply response message');
      showToast('Response message is required', 'error');
      return;
    }

    const additionalArr = formAdditionalTriggers
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    setFormSaving(true);
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
        showToast('Custom auto-reply updated successfully!');
      }

      setModalState(null);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to save auto-reply');
      showToast(err.message || 'Failed to save auto-reply', 'error');
    } finally {
      setFormSaving(false);
    }
  };

  // 6. Action Menu Handlers
  const handleToggleStatus = async (item) => {
    try {
      await automationService.toggleCustomReply(item.id);
      showToast(
        item.status === 'active'
          ? `Deactivated "${item.trigger_keyword}"`
          : `Activated "${item.trigger_keyword}"`
      );
      setActiveMenuId(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to toggle status', 'error');
    }
  };

  const handleDuplicate = async (item) => {
    try {
      await automationService.duplicateCustomReply(item.id);
      showToast(`Duplicated "${item.trigger_keyword}"`);
      setActiveMenuId(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to duplicate reply', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await automationService.deleteCustomReply(modalState.data.id);
      showToast('Custom auto-reply deleted successfully');
      setModalState(null);
      setActiveMenuId(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete reply', 'error');
    }
  };

  // 7. Wallet Top-up Simulator
  const handleAddBalance = async () => {
    setWalletSaving(true);
    setTimeout(() => {
      setWalletSaving(false);
      setModalState(null);
      showToast(`₹${walletAmount} added to ARCO Wallet successfully!`, 'success');
      setIsBannerVisible(false);
    }, 800);
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
            {/* Toast Feedback */}
            {toast && (
              <div
                className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold transition-all animate-in slide-in-from-top-2 ${
                  toast.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : toast.type === 'info'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                {toast.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>{toast.message}</span>
              </div>
            )}

            {/* TOP HEADER MATCHING INTERAKT SCREENSHOT */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0d3b30] flex items-center justify-center text-white shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900 leading-tight">
                    Custom Auto Replies
                  </h1>
                  <p className="text-xs text-slate-500">Auto-reply to specific questions</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSimulatorOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Play className="w-3 h-3 fill-slate-700" />
                  <span>Test Simulator</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 rounded-xl bg-[#00875a] hover:bg-[#00704a] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Custom Reply</span>
                </button>
              </div>
            </div>

            {/* LOW BALANCE / AI INTENT MATCH WARNING BANNER */}
            {isBannerVisible && (
              <div className="border border-emerald-200 rounded-xl p-4 bg-[#f4faf7] space-y-2 relative animate-in fade-in">
                <button
                  type="button"
                  onClick={() => setIsBannerVisible(false)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pr-6">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-bold text-slate-900">
                        AI Intent Match Paused - Insufficient wallet balance
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        Your AI matching is temporarily paused due to low balance. Top up your wallet to reactivate.{' '}
                        <Link
                          to="/automation/ai-intent-matching"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Learn how it works?
                        </Link>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setModalState({ mode: 'wallet' })}
                    className="px-4 py-1.5 rounded-lg border border-slate-700 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shrink-0 cursor-pointer shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <Wallet className="w-3.5 h-3.5 text-slate-700" />
                    <span>Add Balance</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1 border-t border-emerald-100/80">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    ₹0.2 per successful intent match will be deducted from ARCO wallet.{' '}
                    <Link to="/pricing" className="text-blue-600 hover:underline">
                      Know how pricing works?
                    </Link>
                  </span>
                </div>
              </div>
            )}

            {/* CHANNEL TABS (WHATSAPP / INSTAGRAM) & SEARCH */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('whatsapp')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'whatsapp'
                      ? 'bg-[#0d3b30] text-white shadow-2xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
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

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Trigger"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-[#0d3b30] focus:border-[#0d3b30] outline-none placeholder:text-slate-400 bg-white"
                />
              </div>
            </div>

            {/* CUSTOM AUTO REPLIES TABLE */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              {loading ? (
                <div className="py-16 text-center space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#0d3b30] mx-auto" />
                  <p className="text-xs text-slate-400">Loading custom auto replies...</p>
                </div>
              ) : replies.length === 0 ? (
                <div className="py-14 text-center space-y-3">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">
                    No custom auto replies yet for {activeTab === 'whatsapp' ? 'WhatsApp' : 'Instagram'}.
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Create automated replies to instantly answer frequently asked questions from your customers.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className="px-4 py-2 rounded-xl bg-[#00875a] hover:bg-[#00704a] text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Custom Reply</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                        <th className="py-3 px-4 font-bold">Trigger</th>
                        <th className="py-3 px-4 font-bold">Action Type</th>
                        <th className="py-3 px-4 font-bold">Action Preview</th>
                        <th className="py-3 px-4 font-bold text-center">Conversation Sent</th>
                        <th className="py-3 px-4 font-bold">Created/Updated</th>
                        <th className="py-3 px-4 text-right w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {replies.map((reply) => {
                        let additional = [];
                        if (Array.isArray(reply.additional_triggers)) {
                          additional = reply.additional_triggers;
                        } else if (typeof reply.additional_triggers === 'string') {
                          try {
                            const parsed = JSON.parse(reply.additional_triggers);
                            if (Array.isArray(parsed)) additional = parsed;
                          } catch {
                            // ignore
                          }
                        }

                        const isMenuOpen = activeMenuId === reply.id;
                        return (
                          <tr
                            key={reply.id}
                            className="hover:bg-slate-50/60 transition-colors relative"
                          >
                            {/* 1. Trigger */}
                            <td className="py-3.5 px-4 max-w-xs">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-slate-900 truncate">
                                  {reply.trigger_keyword}
                                </span>
                                {additional.length > 0 && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#e8f6f0] text-[#0d3b30] border border-emerald-200">
                                    +{additional.length}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* 2. Action Type */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-slate-700">
                                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                                <span>Auto replies</span>
                              </div>
                            </td>

                            {/* 3. Action Preview */}
                            <td className="py-3.5 px-4 max-w-sm">
                              <p className="text-slate-600 truncate font-normal" title={reply.response_message}>
                                {reply.response_message}
                              </p>
                            </td>

                            {/* 4. Conversation Sent */}
                            <td className="py-3.5 px-4 text-center font-medium text-slate-800">
                              {reply.conversations_sent || 0}
                            </td>

                            {/* 5. Created/Updated */}
                            <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-500 leading-tight">
                              <div>
                                Created on{' '}
                                {new Date(reply.created_at || Date.now()).toLocaleDateString('en-GB')}
                              </div>
                              <div>
                                Updated on{' '}
                                {new Date(reply.updated_at || Date.now()).toLocaleDateString('en-GB')}
                              </div>
                            </td>

                            {/* 6. 3-Dot Actions Menu */}
                            <td className="py-3.5 px-4 text-right relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(isMenuOpen ? null : reply.id);
                                }}
                                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* Popup Action Dropdown */}
                              {isMenuOpen && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-4 top-10 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs text-left animate-in fade-in zoom-in-95"
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(reply)}
                                    className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDuplicate(reply)}
                                    className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Duplicate</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatus(reply)}
                                    className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                                  >
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        reply.status === 'active' ? 'bg-amber-500' : 'bg-emerald-500'
                                      }`}
                                    />
                                    <span>{reply.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setModalState({ mode: 'delete', data: reply });
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors border-t border-slate-100 mt-1"
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
                </div>
              )}
            </div>

            {/* BOTTOM MASTER TOGGLE BAR MATCHING INTERAKT SCREENSHOT */}
            <div className="flex items-center gap-3 pt-3">
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={masterToggle}
                  onChange={handleMasterToggle}
                  disabled={savingMasterToggle}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00875a]"></div>
                <span className="ml-3 text-xs font-semibold text-slate-800">
                  {masterToggle
                    ? 'Custom Auto Replies are switched on'
                    : 'Custom Auto Replies are switched off'}
                </span>
                {savingMasterToggle && (
                  <RefreshCw className="w-3 h-3 animate-spin text-slate-400 ml-2" />
                )}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT CUSTOM AUTO REPLY */}
      {/* ========================================================================= */}
      {(modalState?.mode === 'create' || modalState?.mode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {modalState.mode === 'create'
                      ? 'Add New Custom Reply'
                      : 'Edit Custom Auto Reply'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Configure trigger questions and responses</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalState(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Channel Switcher */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                  Channel
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="modalChannel"
                      checked={formChannel === 'whatsapp'}
                      onChange={() => setFormChannel('whatsapp')}
                      className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span className="font-semibold text-slate-800">WhatsApp</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="modalChannel"
                      checked={formChannel === 'instagram'}
                      onChange={() => setFormChannel('instagram')}
                      className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span className="font-semibold text-slate-800">Instagram</span>
                  </label>
                </div>
              </div>

              {/* Primary Trigger Keyword */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Primary Trigger Question / Keyword <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTrigger}
                  onChange={(e) => setFormTrigger(e.target.value)}
                  placeholder="e.g. What digital solutions do you offer?"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              {/* Additional Trigger Variations */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">
                    Additional Trigger Variations (Optional)
                  </label>
                  <span className="text-[10px] text-slate-400">Comma separated</span>
                </div>
                <input
                  type="text"
                  value={formAdditionalTriggers}
                  onChange={(e) => setFormAdditionalTriggers(e.target.value)}
                  placeholder="digital solutions, what services, tech stack, software"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs"
                />
              </div>

              {/* Auto Reply Message Textarea */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">
                  Auto Reply Message <span className="text-red-500">*</span>
                </label>
                <div className="border border-slate-200 rounded-2xl p-3 bg-white space-y-2 shadow-2xs">
                  <textarea
                    ref={textareaRef}
                    required
                    maxLength={1024}
                    value={formResponse}
                    onChange={(e) => setFormResponse(e.target.value)}
                    rows={4}
                    placeholder="Enter the automated response message..."
                    className="w-full p-2 bg-transparent text-slate-800 text-xs leading-relaxed resize-none focus:outline-none placeholder:text-slate-400"
                  />

                  {/* Character Counter */}
                  <div className="text-right text-[11px] text-slate-400">
                    <span>{formResponse.length}</span>/1024
                  </div>

                  {/* Toolbar */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 relative">
                    {/* Add Variable */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowVariableMenu(!showVariableMenu)}
                        className="flex items-center gap-1 text-emerald-800 font-bold text-[11px] hover:text-emerald-950 cursor-pointer py-1 px-1.5 rounded-lg hover:bg-emerald-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add variable</span>
                      </button>

                      {showVariableMenu && (
                        <div className="absolute left-0 bottom-8 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in">
                          <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                            Variables
                          </div>
                          {VARIABLES.map((v) => (
                            <button
                              key={v.key}
                              type="button"
                              onClick={() => {
                                insertTextAtCursor(v.key);
                                setShowVariableMenu(false);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer"
                            >
                              <span className="font-mono text-emerald-700 font-bold">{v.key}</span>
                              <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                                {v.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Formatters */}
                    <div className="flex items-center gap-1 text-slate-500">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="p-1 rounded-lg hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                          title="Insert emoji"
                        >
                          <Smile className="w-3.5 h-3.5" />
                        </button>
                        {showEmojiPicker && (
                          <div className="absolute right-0 bottom-8 p-2 bg-white rounded-xl shadow-xl border border-slate-200 grid grid-cols-6 gap-1 z-50 animate-in fade-in">
                            {EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  insertTextAtCursor(` ${emoji} `);
                                  setShowEmojiPicker(false);
                                }}
                                className="p-1 hover:bg-slate-100 rounded text-sm cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => applyFormat('*')}
                        className="p-1 rounded-lg hover:bg-slate-100 hover:text-slate-900 cursor-pointer font-bold"
                        title="Bold"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormat('_')}
                        className="p-1 rounded-lg hover:bg-slate-100 hover:text-slate-900 cursor-pointer italic"
                        title="Italic"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormat('~')}
                        className="p-1 rounded-lg hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                        title="Strikethrough"
                      >
                        <Strikethrough className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-1 pt-1">
                <label className="font-bold text-slate-700 block">Status</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="modalStatus"
                      checked={formStatus === 'active'}
                      onChange={() => setFormStatus('active')}
                      className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span className="font-semibold text-slate-800">Active (Auto-replies On)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="modalStatus"
                      checked={formStatus === 'inactive'}
                      onChange={() => setFormStatus('inactive')}
                      className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span className="font-semibold text-slate-800">Inactive</span>
                  </label>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalState(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-7 py-2.5 rounded-xl bg-[#00875a] hover:bg-[#00704a] text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  {formSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{formSaving ? 'Saving...' : 'Save Custom Reply'}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Delete Custom Auto Reply?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete the auto-reply rule for{' '}
                <span className="font-semibold text-slate-800">
                  "{modalState.data?.trigger_keyword}"
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalState(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
              >
                Delete Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD WALLET BALANCE */}
      {/* ========================================================================= */}
      {modalState?.mode === 'wallet' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Top-up ARCO Wallet</h3>
                  <p className="text-[11px] text-slate-500">Recharge balance for AI Intent Match</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalState(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Amount Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Select Amount (INR)</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[500, 1000, 2500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setWalletAmount(amt)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      walletAmount === amt
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>AI Matches Included:</span>
                <span className="font-bold text-slate-900">{(walletAmount / 0.2).toLocaleString()} matches</span>
              </div>
              <div className="flex justify-between">
                <span>Rate per intent match:</span>
                <span className="font-mono text-emerald-700 font-semibold">₹0.20</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setModalState(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddBalance}
                disabled={walletSaving}
                className="px-7 py-2.5 rounded-xl bg-[#00875a] hover:bg-[#00704a] text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                {walletSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{walletSaving ? 'Processing...' : `Add ₹${walletAmount} Balance`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTOMATION SIMULATOR DRAWER */}
      <AutomationSimulatorDrawer
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </div>
  );
}
