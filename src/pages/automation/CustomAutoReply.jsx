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
  Paperclip,
  Check,
  FileText,
  ShoppingBag,
  Layers,
  ChevronDown,
  File,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import AutomationSubNav from '../../components/automation/AutomationSubNav';
import AutomationSimulatorDrawer from '../../components/automation/AutomationSimulatorDrawer';
import { automationService } from '../../services/automationService';

const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
  '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘',
  '🤩', '😎', '🥳', '🤗', '🤔', '🤐', '🤫', '🤭',
  '👋', '🙌', '👏', '🤝', '👍', '👎', '👊', '✌️',
  '👌', '🤙', '👈', '👉', '👆', '👇', '✋', '🙏',
  '🔥', '✨', '⭐', '🌟', '💥', '💯', '❤️', '🧡',
  '💼', '📞', '📱', '💬', '📢', '🚀', '🎁', '🎉',
  '🛒', '🛍️', '🏷️', '💰', '💳', '📦', '🚚', '✅',
];

const VARIABLE_OPTIONS = [
  { value: 'contact.name', label: 'Customer Full Name' },
  { value: 'contact.first_name', label: 'Customer First Name' },
  { value: 'contact.phone', label: 'Phone Number' },
  { value: 'contact.email', label: 'Email Address' },
  { value: 'contact.company', label: 'Company Name' },
  { value: 'order.id', label: 'Order ID' },
  { value: 'user.id', label: 'User / Account ID' },
];

const PRODUCT_COLLECTIONS = [
  { id: 'col_all', name: 'All Product Categories & Catalog' },
  { id: 'col_software', name: 'Software & Cloud Solutions' },
  { id: 'col_ai', name: 'Autonomous AI Agents' },
  { id: 'col_omni', name: 'Omnichannel WhatsApp Hubs' },
];

const WORKFLOWS_LIST = [
  { id: 'wf_lead_capture', name: '⚡ Auto Lead Capture & Qualification' },
  { id: 'wf_csat_feedback', name: '⭐ Post-Purchase CSAT Feedback Flow' },
  { id: 'wf_support_ticket', name: '🎫 Urgent Support Ticket Escalation' },
];

// Helper: Convert HTML from rich contenteditable into WhatsApp Markdown
const htmlToWhatsAppMarkdown = (html) => {
  if (!html) return '';
  let text = html;
  text = text.replace(/<strike[^>]*>(.*?)<\/strike>/gi, '~$1~');
  text = text.replace(/<s[^>]*>(.*?)<\/s>/gi, '~$1~');
  text = text.replace(/<del[^>]*>(.*?)<\/del>/gi, '~$1~');
  text = text.replace(/<span style="[^"]*text-decoration:[^"]*line-through[^"]*"[^>]*>(.*?)<\/span>/gi, '~$1~');
  text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, '*$1*');
  text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '*$1*');
  text = text.replace(/<i[^>]*>(.*?)<\/i>/gi, '_$1_');
  text = text.replace(/<em[^>]*>(.*?)<\/em>/gi, '_$1_');
  text = text.replace(/<div><br><\/div>/gi, '\n');
  text = text.replace(/<div>(.*?)<\/div>/gi, '\n$1');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/&nbsp;/gi, ' ');
  text = text.replace(/&lt;/gi, '<');
  text = text.replace(/&gt;/gi, '>');
  text = text.replace(/&amp;/gi, '&');
  return text.trim();
};

// Helper: Convert WhatsApp Markdown into HTML for rich contenteditable
const whatsAppMarkdownToHtml = (markdown) => {
  if (!markdown) return '';
  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  html = html.replace(/~([^~\n]+)~/g, '<strike>$1</strike>');
  html = html.replace(/\*([^*\n]+)\*/g, '<b>$1</b>');
  html = html.replace(/_([^_\n]+)_/g, '<i>$1</i>');
  html = html.replace(/\n/g, '<br>');
  return html;
};

export default function CustomAutoReply() {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

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

  // ==========================================
  // Form state for Setup / Update Custom Auto Reply Modal (Matching Interakt Screenshots)
  // ==========================================
  const [formMatchType, setFormMatchType] = useState('exact'); // 'exact' | 'contains' | 'any'
  const [keywordTags, setKeywordTags] = useState([]);
  const [currentKeywordInput, setCurrentKeywordInput] = useState('');
  
  // Response type: 'custom_message' | 'multi_product' | 'workflow' | 'product_collection' | 'whatsapp_form'
  const [formResponseType, setFormResponseType] = useState('custom_message');
  const [formResponse, setFormResponse] = useState('');
  
  // Variable Mapping List: [ { id: 1, token: '{{1}}', value: '', fallback: '' } ]
  const [formVariables, setFormVariables] = useState([]);

  // Attachment state (triggers native OS file browser)
  const [formAttachment, setFormAttachment] = useState(null); // { name, size, type, previewUrl }

  // Buttons (Optional) state for Custom Message: [ { id: 1, text: '' }, { id: 2, text: '' } ]
  const [messageButtons, setMessageButtons] = useState([]);

  // Additional Response Type Options
  const [formWorkflowId, setFormWorkflowId] = useState('wf_lead_capture');
  const [formCollectionId, setFormCollectionId] = useState('col_all');
  const [formButtonText, setFormButtonText] = useState('Open Form');
  const [formSelectedFormId, setFormSelectedFormId] = useState('');
  const [formActionOpening, setFormActionOpening] = useState('first_screen');
  const [formFlowToken, setFormFlowToken] = useState('');
  const [formFlowData, setFormFlowData] = useState('{}');

  const [formChannel, setFormChannel] = useState('whatsapp');
  const [formStatus, setFormStatus] = useState('active');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form emoji popovers
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // WhatsApp Forms available in the workspace
  const [availableForms, setAvailableForms] = useState([
    { id: 'flow_lead_qualification', title: 'Lead Qualification & Requirements Flow' },
    { id: 'flow_csat_feedback', title: 'Customer Feedback & Rating Survey' },
    { id: 'flow_support_ticket', title: 'Urgent Support Inquiry Form' },
    { id: 'flow_appointment_booking', title: 'Schedule Consultation Appointment' },
  ]);

  // Wallet top-up state
  const [walletAmount, setWalletAmount] = useState(1000);
  const [walletSaving, setWalletSaving] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync editor content when modal opens or state updates
  useEffect(() => {
    if (modalState && (modalState.mode === 'create' || modalState.mode === 'edit')) {
      const timer = setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = whatsAppMarkdownToHtml(formResponse);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [modalState?.mode, modalState?.data?.id]);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleEmojiOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleEmojiOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleEmojiOutside);
    };
  }, [showEmojiPicker]);

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

      // Load forms
      try {
        const formsRes = await automationService.getWhatsAppForms();
        if (formsRes?.forms && Array.isArray(formsRes.forms) && formsRes.forms.length > 0) {
          setAvailableForms(formsRes.forms.map((f) => ({ id: f.form_id || f.id, title: f.title || f.name })));
        }
      } catch (e) {
        // use default
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
          ? 'Custom Auto Replies are switched on'
          : 'Custom Auto Replies are switched off',
        nextState ? 'success' : 'info'
      );
    } catch (err) {
      setMasterToggle(!nextState);
      showToast('Failed to update toggle setting', 'error');
    } finally {
      setSavingMasterToggle(false);
    }
  };

  // 3. Form Modal Openers
  const handleOpenCreateModal = () => {
    setFormMatchType('exact');
    setKeywordTags([]);
    setCurrentKeywordInput('');
    setFormResponseType('custom_message');
    setFormResponse('');
    setFormVariables([]);
    setFormAttachment(null);
    setMessageButtons([]);
    setFormWorkflowId('wf_lead_capture');
    setFormCollectionId('col_all');
    setFormButtonText('Open Form');
    setFormSelectedFormId(availableForms[0]?.id || '');
    setFormActionOpening('first_screen');
    setFormFlowToken('');
    setFormFlowData('{}');
    setFormChannel(activeTab || 'whatsapp');
    setFormStatus('active');
    setFormError('');
    setModalState({ mode: 'create' });

    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }, 50);
  };

  const handleOpenEditModal = (item) => {
    setFormMatchType(item.match_type || 'exact');
    
    // Parse keywords
    let all = [];
    if (item.trigger_keyword && item.trigger_keyword !== 'Any Keyword (Catch-all)') {
      all.push(item.trigger_keyword);
    }
    if (Array.isArray(item.additional_triggers)) {
      all = [...all, ...item.additional_triggers];
    } else if (typeof item.additional_triggers === 'string') {
      try {
        const parsed = JSON.parse(item.additional_triggers);
        if (Array.isArray(parsed)) all = [...all, ...parsed];
      } catch {
        if (item.additional_triggers) all.push(item.additional_triggers);
      }
    }
    setKeywordTags(all.filter(Boolean));
    setCurrentKeywordInput('');
    
    const msg = item.response_message || '';
    setFormResponseType(item.response_type || (item.action_type === 'whatsapp_form' ? 'whatsapp_form' : 'custom_message'));
    setFormResponse(msg);
    setFormVariables(Array.isArray(item.variables) ? item.variables : []);
    setFormAttachment(item.attachment || null);
    setMessageButtons(Array.isArray(item.buttons) ? item.buttons : []);
    setFormWorkflowId(item.workflow_id || 'wf_lead_capture');
    setFormCollectionId(item.collection_id || 'col_all');
    setFormButtonText(item.form_button_text || 'Open Form');
    setFormSelectedFormId(item.form_id || (availableForms[0]?.id || ''));
    setFormActionOpening(item.form_action || 'first_screen');
    setFormFlowToken(item.flow_token || '');
    setFormFlowData(item.flow_data || '{}');
    
    setFormChannel(item.channel || 'whatsapp');
    setFormStatus(item.status || 'active');
    setFormError('');
    setModalState({ mode: 'edit', data: item });

    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = whatsAppMarkdownToHtml(msg);
      }
    }, 50);
  };

  // Tag keyword handling
  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = currentKeywordInput.trim().replace(/^,|,$/g, '');
      if (val && !keywordTags.includes(val)) {
        setKeywordTags([...keywordTags, val]);
        setCurrentKeywordInput('');
      }
    } else if (e.key === 'Backspace' && !currentKeywordInput && keywordTags.length > 0) {
      setKeywordTags(keywordTags.slice(0, -1));
    }
  };

  const handleRemoveKeywordTag = (index) => {
    setKeywordTags(keywordTags.filter((_, i) => i !== index));
  };

  // Handle rich editor input
  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const markdown = htmlToWhatsAppMarkdown(html);
      setFormResponse(markdown);
    }
  };

  // Variable handling (Clicking + Add variable)
  const handleAddVariable = () => {
    const nextIndex = formVariables.length + 1;
    const token = `{{${nextIndex}}}`;
    
    // Insert into editor at cursor
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertText', false, token);
      handleEditorInput();
    } else {
      setFormResponse((prev) => prev + token);
    }

    setFormVariables((prev) => [
      ...prev,
      { id: nextIndex, token, value: '', fallback: '' },
    ]);
  };

  const handleUpdateVariable = (index, field, value) => {
    const updated = [...formVariables];
    updated[index] = { ...updated[index], [field]: value };
    setFormVariables(updated);
  };

  const handleRemoveVariable = (index) => {
    setFormVariables(formVariables.filter((_, i) => i !== index));
  };

  // Native File Upload Handler (Paperclip click)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      showToast('File size must be less than 25MB', 'error');
      return;
    }

    const previewUrl = file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : null;

    setFormAttachment({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
      previewUrl,
    });
    showToast(`Attached "${file.name}"`);
  };

  // Button handlers (Matching screenshot)
  const handleAddButton = () => {
    if (messageButtons.length < 3) {
      setMessageButtons((prev) => [
        ...prev,
        { id: prev.length + 1, text: '' },
      ]);
    }
  };

  const handleUpdateButtonText = (index, text) => {
    const updated = [...messageButtons];
    updated[index] = { ...updated[index], text };
    setMessageButtons(updated);
  };

  const handleRemoveButton = (index) => {
    setMessageButtons(messageButtons.filter((_, i) => i !== index));
  };

  // Formatting execution (Bold, Italic, Strikethrough)
  const executeFormat = (command) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, null);
      handleEditorInput();
    }
  };

  const insertEmoji = (emoji) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertText', false, emoji);
      handleEditorInput();
    }
    setShowEmojiPicker(false);
  };

  // 5. Submit Form (Create / Edit)
  const handleSaveSubmit = async (e) => {
    if (e) e.preventDefault();
    setFormError('');

    let primaryTrigger = '';
    let additionalArr = [];

    if (formMatchType === 'any') {
      primaryTrigger = 'Any Keyword (Catch-all)';
      additionalArr = [];
    } else {
      const allKeywords = [...keywordTags];
      if (currentKeywordInput.trim() && !allKeywords.includes(currentKeywordInput.trim())) {
        allKeywords.push(currentKeywordInput.trim());
      }

      if (allKeywords.length === 0) {
        setFormError('Please enter at least one trigger keyword');
        showToast('Please enter at least one trigger keyword', 'error');
        return;
      }

      primaryTrigger = allKeywords[0];
      additionalArr = allKeywords.slice(1);
    }

    const finalMessage = formResponse.trim();
    if (formResponseType === 'custom_message' && !finalMessage) {
      setFormError('Please enter a response message body');
      showToast('Response message body is required', 'error');
      return;
    }

    setFormSaving(true);
    try {
      const payload = {
        trigger_keyword: primaryTrigger,
        additional_triggers: additionalArr,
        match_type: formMatchType,
        response_type: formResponseType,
        action_type: formResponseType === 'whatsapp_form' ? 'whatsapp_form' : 'auto_reply',
        response_message:
          formResponseType === 'custom_message'
            ? finalMessage
            : formResponseType === 'workflow'
            ? `[Workflow] ${WORKFLOWS_LIST.find((w) => w.id === formWorkflowId)?.name || 'Active Workflow'}`
            : formResponseType === 'product_collection' || formResponseType === 'multi_product'
            ? `[Product Collection] ${PRODUCT_COLLECTIONS.find((c) => c.id === formCollectionId)?.name || 'Catalog'}`
            : `[WhatsApp Form] ${availableForms.find((f) => f.id === formSelectedFormId)?.title || 'WhatsApp Flow Form'}`,
        variables: formVariables,
        attachment: formAttachment,
        buttons: messageButtons,
        channel: formChannel,
        status: formStatus,
        workflow_id: formWorkflowId,
        collection_id: formCollectionId,
        form_id: formSelectedFormId,
        form_button_text: formButtonText,
        form_action: formActionOpening,
        flow_token: formFlowToken,
        flow_data: formFlowData,
      };

      if (modalState.mode === 'create') {
        await automationService.createCustomReply(payload);
        showToast('Custom auto-reply created successfully!');
      } else if (modalState.mode === 'edit') {
        await automationService.updateCustomReply(modalState.data.id, payload);
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

            {/* Page Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mt-0.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h1 className="text-base font-bold text-slate-900 leading-tight">
                    Custom Auto Replies
                  </h1>
                  <p className="text-xs text-slate-500">
                    Auto-reply to specific questions or trigger workflows. Know more{' '}
                    <a href="#help" className="text-blue-600 hover:underline">
                      here
                    </a>
                    .
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="px-3.5 py-1.5 rounded-lg bg-[#00875a] hover:bg-[#00704a] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Custom Reply</span>
                </button>
              </div>
            </div>

            {/* AI INTENT MATCH BANNER */}
            {isBannerVisible && (
              <div className="p-3.5 rounded-xl bg-[#fff9e6] border border-[#ffe58f] flex items-center justify-between text-xs text-[#ad6800] relative">
                <div className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold mt-0.5">💡</span>
                  <div>
                    <span className="font-bold text-slate-900 block">
                      AI Intent Match Paused
                    </span>
                    <span className="text-slate-600 text-[11px]">
                      Your AI matching is temporarily paused because of insufficient balance. Please top up your wallet to resume smart AI auto-replies.{' '}
                      <button
                        type="button"
                        onClick={() => setModalState({ mode: 'wallet' })}
                        className="text-blue-600 font-bold underline hover:text-blue-800"
                      >
                        Learn how it works?
                      </button>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalState({ mode: 'wallet' })}
                    className="px-3 py-1 rounded bg-[#9254de] hover:bg-[#722ed1] text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    Add Balance
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBannerVisible(false)}
                    className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* CHANNELS PILLS & SEARCH BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('whatsapp')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'whatsapp'
                      ? 'bg-[#0d3b30] text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Whatsapp
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('instagram')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'instagram'
                      ? 'bg-[#0d3b30] text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Instagram
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Trigger"
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {/* CUSTOM REPLIES LIST TABLE */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              {loading ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                  <span>Loading custom auto-replies...</span>
                </div>
              ) : replies.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No Custom Auto-Replies Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                            onClick={() => handleOpenEditModal(reply)}
                            className="hover:bg-slate-50/80 transition-colors cursor-pointer relative"
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

            {/* BOTTOM MASTER TOGGLE BAR */}
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
      {/* MODAL: SETUP / UPDATE CUSTOM AUTO REPLY (EXACT REPRODUCTION OF SCREENSHOTS) */}
      {/* ========================================================================= */}
      {(modalState?.mode === 'create' || modalState?.mode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  {modalState?.mode === 'edit' ? 'Update Custom Auto Reply' : 'Setup Custom Auto Reply'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalState(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveSubmit} className="p-6 overflow-y-auto space-y-6 text-xs bg-white">
              
              {/* ========================================== */}
              {/* SECTION 1: TRIGGER */}
              {/* ========================================== */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Trigger</h4>

                {/* AI Intent Match line */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-800">
                    How would you like to trigger the automation?
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#e6f7ff] text-[#0958d9] border border-[#91caff] text-[10px] font-medium inline-flex items-center">
                    AI Intent Match is enabled for all autoreplies / workflows.
                  </span>
                </div>

                {/* Radio Buttons for Match Type */}
                <div className="flex items-center gap-6 text-xs text-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="matchType"
                      checked={formMatchType === 'exact'}
                      onChange={() => setFormMatchType('exact')}
                      className="w-3.5 h-3.5 accent-emerald-700 cursor-pointer"
                    />
                    <span className="font-medium">Exact Match</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="matchType"
                      checked={formMatchType === 'contains'}
                      onChange={() => setFormMatchType('contains')}
                      className="w-3.5 h-3.5 accent-emerald-700 cursor-pointer"
                    />
                    <span className="font-medium">Contains</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="matchType"
                      checked={formMatchType === 'any'}
                      onChange={() => setFormMatchType('any')}
                      className="w-3.5 h-3.5 accent-emerald-700 cursor-pointer"
                    />
                    <span className="font-medium">Any Keyword</span>
                  </label>
                </div>

                {/* Keyword Input with Badges / Tags (EXACT MATCHING 1ST REFERENCE SCREENSHOT) */}
                {formMatchType !== 'any' && (
                  <div className="p-3.5 bg-[#f8fafc] border border-slate-200/80 rounded-xl space-y-2.5 animate-in fade-in duration-150">
                    <label className="block text-xs font-semibold text-slate-800">
                      Enter the keywords that trigger this flow
                    </label>
                    
                    {/* Separate Text Input Box */}
                    <div className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-300 rounded-lg focus-within:border-slate-500 shadow-2xs">
                      <input
                        type="text"
                        value={currentKeywordInput}
                        maxLength={100}
                        onChange={(e) => setCurrentKeywordInput(e.target.value)}
                        onKeyDown={handleKeywordKeyDown}
                        placeholder="Type a keyword and press Enter"
                        className="flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 font-normal"
                      />
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 ml-auto shrink-0 select-none">
                        <span className="text-blue-600 font-medium">↵ Press Enter</span>
                        <span>{currentKeywordInput.length}/100</span>
                      </div>
                    </div>

                    {/* Chips Rendered Below the Input Field (Matching 1st Image) */}
                    {keywordTags.length > 0 && (
                      <div className="flex items-center flex-wrap gap-2 pt-0.5 animate-in fade-in">
                        {keywordTags.map((tag, idx) => (
                          <div
                            key={idx}
                            className="px-2.5 py-1 rounded bg-white border border-[#0d3b30] text-[#0d3b30] text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveKeywordTag(idx);
                              }}
                              className="text-[#0d3b30] hover:text-red-600 cursor-pointer font-bold leading-none select-none text-xs"
                              title="Remove keyword"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ========================================== */}
              {/* SECTION 2: CUSTOM AUTO REPLY */}
              {/* ========================================== */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900">Custom Auto Reply</h4>

                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-slate-800">
                    Select response type
                  </span>

                  {/* 5 Response Type Radio Options */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-xs text-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="responseType"
                        checked={formResponseType === 'custom_message'}
                        onChange={() => setFormResponseType('custom_message')}
                        className="w-3.5 h-3.5 accent-emerald-700 cursor-pointer"
                      />
                      <span className="font-medium">Custom Message</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="responseType"
                        checked={formResponseType === 'multi_product'}
                        onChange={() => setFormResponseType('multi_product')}
                        className="w-3.5 h-3.5 accent-emerald-700 cursor-pointer"
                      />
                      <span className="font-medium">Multi Product Message</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="responseType"
                        checked={formResponseType === 'workflow'}
                        onChange={() => setFormResponseType('workflow')}
                        className="w-3.5 h-3.5 accent-emerald-700 cursor-pointer"
                      />
                      <span className="font-medium">Workflow</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="responseType"
                        checked={formResponseType === 'product_collection'}
                        onChange={() => setFormResponseType('product_collection')}
                        className="w-3.5 h-3.5 accent-emerald-700 cursor-pointer"
                      />
                      <span className="font-medium">Product Collection List</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="responseType"
                        checked={formResponseType === 'whatsapp_form'}
                        onChange={() => setFormResponseType('whatsapp_form')}
                        className="w-3.5 h-3.5 accent-emerald-700 cursor-pointer"
                      />
                      <span className="font-medium">WhatsApp Form</span>
                    </label>
                  </div>
                </div>

                {/* OPTION A: CUSTOM MESSAGE (RICH WYSIWYG EDITOR EXACTLY MATCHING SCREENSHOT 2) */}
                {formResponseType === 'custom_message' && (
                  <div className="space-y-4 pt-1 animate-in fade-in duration-150">
                    
                    {/* Message Body Input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-800">
                        Message body
                      </label>
                      <div className="border border-slate-300 rounded-lg p-3 bg-white space-y-2 shadow-2xs focus-within:border-slate-500">
                        {/* Rich Contenteditable Editor (Allows real-time visual strikethrough line across characters!) */}
                        <div
                          ref={editorRef}
                          contentEditable
                          onInput={handleEditorInput}
                          data-placeholder="Add your message here"
                          className="w-full min-h-[100px] text-xs text-slate-800 leading-relaxed focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 font-sans break-words"
                        />

                        {/* Active File Attachment Preview inside Composer */}
                        {formAttachment && (
                          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs animate-in fade-in">
                            <div className="flex items-center gap-2 truncate">
                              {formAttachment.type === 'image' ? (
                                formAttachment.previewUrl ? (
                                  <img
                                    src={formAttachment.previewUrl}
                                    alt="attachment preview"
                                    className="w-8 h-8 rounded object-cover border border-emerald-200 shrink-0"
                                  />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                                )
                              ) : formAttachment.type === 'video' ? (
                                <Video className="w-5 h-5 text-emerald-600 shrink-0" />
                              ) : (
                                <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                              )}
                              <div className="truncate">
                                <span className="font-semibold text-slate-800 block truncate">
                                  {formAttachment.name}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {formAttachment.size} • {formAttachment.type.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFormAttachment(null)}
                              className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                              title="Remove attachment"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        <div className="text-right text-[11px] text-slate-400">
                          {formResponse.length}/1024
                        </div>

                        {/* Toolbar */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 relative">
                          {/* Add Variable Button */}
                          <div>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={handleAddVariable}
                              className="flex items-center gap-1.5 text-slate-700 font-medium text-xs hover:text-slate-900 cursor-pointer py-1 px-1.5 rounded hover:bg-slate-100 transition-colors"
                            >
                              <span className="text-emerald-700 font-bold text-sm">⊕</span>
                              <span>Add variable</span>
                              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                            </button>
                          </div>

                          {/* Formatters & Attachment */}
                          <div className="flex items-center gap-2 text-slate-500">
                            {/* Hidden Native File Input Triggered by Paperclip */}
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx"
                              className="hidden"
                            />

                            {/* Emoji Picker */}
                            <div className="relative" ref={emojiPickerRef}>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="p-1 hover:text-slate-800 cursor-pointer transition-colors"
                                title="Insert Emoji"
                              >
                                <Smile className="w-3.5 h-3.5" />
                              </button>

                              {showEmojiPicker && (
                                <div className="absolute right-0 bottom-9 w-72 p-3 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
                                  <div className="text-[11px] font-bold text-slate-500 mb-2 px-1 flex items-center justify-between">
                                    <span>Pick an Emoji</span>
                                    <span className="text-[10px] text-slate-400 font-normal">WhatsApp Emojis</span>
                                  </div>
                                  <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto p-1">
                                    {EMOJI_LIST.map((emoji, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => insertEmoji(emoji)}
                                        className="w-7 h-7 flex items-center justify-center text-base hover:bg-slate-100 rounded-lg transition-transform hover:scale-125 cursor-pointer select-none"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Bold */}
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => executeFormat('bold')}
                              className="px-1.5 py-0.5 text-xs font-bold hover:text-slate-900 cursor-pointer"
                              title="Bold"
                            >
                              B
                            </button>

                            {/* Italic */}
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => executeFormat('italic')}
                              className="px-1.5 py-0.5 text-xs italic font-serif hover:text-slate-900 cursor-pointer"
                              title="Italic"
                            >
                              I
                            </button>

                            {/* Strikethrough (Real native strikethrough line in the middle matching Screenshot 2!) */}
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => executeFormat('strikeThrough')}
                              className="px-1.5 py-0.5 text-xs line-through hover:text-slate-900 cursor-pointer font-medium"
                              title="Strikethrough"
                            >
                              S
                            </button>

                            {/* Paperclip Attachment Trigger (Opens OS File Browser) */}
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => fileInputRef.current?.click()}
                              className="p-1 hover:text-slate-900 cursor-pointer transition-colors"
                              title="Attach file (Images, Videos, PDFs, Documents)"
                            >
                              <Paperclip className="w-3.5 h-3.5 text-slate-500 hover:text-slate-800" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ========================================== */}
                    {/* VARIABLES MAPPING TABLE (EXACT CLOSE-UP SCREENSHOT MATCH) */}
                    {/* ========================================== */}
                    {formVariables.length > 0 && (
                      <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                        {/* Table Column Headers */}
                        <div className="grid grid-cols-12 gap-3 text-xs font-bold text-slate-900 px-0.5">
                          <div className="col-span-3 sm:col-span-2">Variable</div>
                          <div className="col-span-5 sm:col-span-5">Value</div>
                          <div className="col-span-4 sm:col-span-5 flex items-center gap-1">
                            <span>Fallback value</span>
                            <Info className="w-3 h-3 text-slate-400" />
                          </div>
                        </div>

                        {/* Variable Rows */}
                        <div className="space-y-2">
                          {formVariables.map((vItem, index) => (
                            <div key={vItem.id || index} className="grid grid-cols-12 gap-3 items-center">
                              {/* 1. Variable Pill */}
                              <div className="col-span-3 sm:col-span-2">
                                <div className="w-full px-2.5 py-1.5 bg-[#f0f2f5] border border-slate-300 rounded text-center font-mono text-slate-500 font-semibold text-xs select-none">
                                  {vItem.token || `{{${index + 1}}}`}
                                </div>
                              </div>

                              {/* 2. Value Dropdown */}
                              <div className="col-span-5 sm:col-span-5">
                                <select
                                  value={vItem.value}
                                  onChange={(e) => handleUpdateVariable(index, 'value', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white border border-slate-400 rounded text-xs font-medium cursor-pointer focus:border-slate-600 outline-none"
                                >
                                  <option value="">Select Option</option>
                                  {VARIABLE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* 3. Fallback Value Input */}
                              <div className="col-span-4 sm:col-span-5 flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={vItem.fallback || ''}
                                  onChange={(e) => handleUpdateVariable(index, 'fallback', e.target.value)}
                                  placeholder="Fallback value"
                                  className="w-full px-3 py-1.5 bg-white border border-slate-400 rounded text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-600 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariable(index)}
                                  className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer shrink-0 font-bold"
                                  title="Remove variable"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ========================================== */}
                    {/* BUTTONS (OPTIONAL) SECTION (EXACT CLOSE-UP SCREENSHOT MATCH) */}
                    {/* ========================================== */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-xs font-bold text-slate-900">
                        Buttons(Optional)
                      </label>

                      {/* Stacked Button Inputs */}
                      {messageButtons.length > 0 && (
                        <div className="space-y-2 max-w-sm">
                          {messageButtons.map((btn, index) => (
                            <div
                              key={btn.id || index}
                              className="w-full flex items-center justify-between px-3 py-1.5 bg-white border border-slate-300 rounded focus-within:border-slate-500 shadow-2xs"
                            >
                              <input
                                type="text"
                                maxLength={20}
                                value={btn.text}
                                onChange={(e) => handleUpdateButtonText(index, e.target.value)}
                                placeholder={`Button text ${index + 1}`}
                                className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none font-normal"
                              />
                              <div className="flex items-center gap-2 shrink-0 text-slate-400 text-[11px] select-none">
                                <span>{(btn.text || '').length}/20</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveButton(index)}
                                  className="text-slate-400 hover:text-red-500 cursor-pointer font-bold ml-1"
                                  title="Remove button"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* + Add Button Box (Matching close-up screenshot) */}
                      {messageButtons.length < 3 && (
                        <div className="max-w-sm">
                          <button
                            type="button"
                            onClick={handleAddButton}
                            className="w-full px-4 py-2 bg-white border border-slate-400 hover:border-slate-600 rounded text-xs font-semibold text-slate-800 text-left transition-colors cursor-pointer shadow-2xs"
                          >
                            + Add Button
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* OPTION B: MULTI PRODUCT MESSAGE */}
                {formResponseType === 'multi_product' && (
                  <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg animate-in fade-in">
                    <label className="block text-xs font-bold text-slate-700">
                      Select Multi-Product Catalog Collection:
                    </label>
                    <select
                      value={formCollectionId}
                      onChange={(e) => setFormCollectionId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-medium"
                    >
                      {PRODUCT_COLLECTIONS.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* OPTION C: WORKFLOW */}
                {formResponseType === 'workflow' && (
                  <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg animate-in fade-in">
                    <label className="block text-xs font-bold text-slate-700">
                      Select Active Workflow to Trigger:
                    </label>
                    <select
                      value={formWorkflowId}
                      onChange={(e) => setFormWorkflowId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-medium font-mono"
                    >
                      {WORKFLOWS_LIST.map((wf) => (
                        <option key={wf.id} value={wf.id}>
                          {wf.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* OPTION D: PRODUCT COLLECTION LIST */}
                {formResponseType === 'product_collection' && (
                  <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg animate-in fade-in">
                    <label className="block text-xs font-bold text-slate-700">
                      Select Product Collection to Display:
                    </label>
                    <select
                      value={formCollectionId}
                      onChange={(e) => setFormCollectionId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-medium"
                    >
                      {PRODUCT_COLLECTIONS.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* OPTION E: WHATSAPP FORM */}
                {formResponseType === 'whatsapp_form' && (
                  <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-lg animate-in fade-in">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Form Button Text
                      </label>
                      <input
                        type="text"
                        value={formButtonText}
                        onChange={(e) => setFormButtonText(e.target.value)}
                        placeholder="Enter text for the button"
                        className="w-full p-2 bg-white rounded border border-slate-300 text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Select Form
                      </label>
                      <select
                        value={formSelectedFormId}
                        onChange={(e) => setFormSelectedFormId(e.target.value)}
                        className="w-full p-2 bg-white rounded border border-slate-300 text-xs font-medium"
                      >
                        <option value="">Select Form Name</option>
                        {availableForms.map((form) => (
                          <option key={form.id} value={form.id}>
                            {form.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Action on Opening Form
                      </label>
                      <div className="flex items-center gap-5 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="formOpeningActionModal"
                            checked={formActionOpening === 'first_screen'}
                            onChange={() => setFormActionOpening('first_screen')}
                            className="w-3.5 h-3.5 accent-emerald-700"
                          />
                          <span>Navigate to first screen</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="formOpeningActionModal"
                            checked={formActionOpening === 'data_exchange'}
                            onChange={() => setFormActionOpening('data_exchange')}
                            className="w-3.5 h-3.5 accent-emerald-700"
                          />
                          <span>Data Exchange</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Modal Footer Submit */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-6 py-2 rounded-md font-bold text-xs transition-colors shadow-xs cursor-pointer bg-[#008069] hover:bg-[#075e54] text-white"
                >
                  {formSaving ? 'Submitting...' : 'Submit'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {modalState?.mode === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Delete Custom Auto Reply?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete the reply for &quot;{modalState.data?.trigger_keyword}&quot;?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalState(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Delete
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
