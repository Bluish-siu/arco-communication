import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Sparkles,
  Info,
  Check,
  Search,
  ChevronDown,
  Smile,
  Bold,
  Italic,
  Strikethrough,
  Paperclip,
  PlusCircle,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';

const EMOJIS = ['👋', '🚀', '💬', '✨', '🎁', '💼', '📞', '🌟', '🛒', '🏷️', '🤝', '👍', '🔥', '🎉'];

const VARIABLES = [
  { key: '{{first_name}}', label: "Customer's First Name", example: 'Alex' },
  { key: '{{full_name}}', label: "Customer's Full Name", example: 'Alex Morgan' },
  { key: '{{phone_number}}', label: 'WhatsApp Phone Number', example: '+91 98765 43210' },
  { key: '{{email}}', label: 'Customer Email', example: 'alex@company.com' },
  { key: '{{company_name}}', label: 'Company / Business Name', example: 'ARCO Communication' },
];

const DEFAULT_PRODUCT_COLLECTIONS = [
  { id: 'col_software_bundles', name: 'Software & Cloud Solutions', count: 12 },
  { id: 'col_ai_agents', name: 'Autonomous AI Agents', count: 8 },
  { id: 'col_api_integrations', name: 'Enterprise API & Webhooks', count: 15 },
  { id: 'col_omnichannel', name: 'Omnichannel WhatsApp Hubs', count: 6 },
];

export default function GreetingFlowModal({
  isOpen,
  onClose,
  currentFlow,
  onFlowChange,
  onSaved,
  showToast,
}) {
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  // 1. Greeting Message State
  const [message, setMessage] = useState(
    currentFlow?.message ||
      'Welcome to ARCO ! 👋 We specialize in crafting innovative digital experiences to engage users and enhance your business operations through tailored technology solutions. From customer experience development to AI integration, we offer a wide range of services designed to meet your unique needs.\n\nExplore our offerings today at https://arco.ai and let\'s elevate your business together! 🚀'
  );
  const [personalized, setPersonalized] = useState(!!currentFlow?.personalized);
  const [interactiveListEnabled, setInteractiveListEnabled] = useState(
    !!currentFlow?.interactiveListEnabled
  );

  // 2. Action Radio Selection: 'product_collections' | 'workflow' | 'whatsapp_form' | 'none'
  const [actionType, setActionType] = useState(currentFlow?.actionType || 'none');

  // Popover menus
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // 3. Product Collections State
  const [selectedCollection, setSelectedCollection] = useState(
    currentFlow?.collectionId
      ? { id: currentFlow.collectionId, name: currentFlow.collectionName || 'Software & Cloud Solutions' }
      : DEFAULT_PRODUCT_COLLECTIONS[0]
  );

  // 4. Workflow Selector State
  const [showWorkflowOverlay, setShowWorkflowOverlay] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [workflowSearch, setWorkflowSearch] = useState('');
  const [loadingWorkflows, setLoadingWorkflows] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(
    currentFlow?.workflowId
      ? { id: currentFlow.workflowId, name: currentFlow.workflowName || 'ai_performance_analytics_dashboard_vf' }
      : null
  );

  // 5. WhatsApp Form Configuration State
  const [forms, setForms] = useState([]);
  const [loadingForms, setLoadingForms] = useState(false);
  const [formButtonText, setFormButtonText] = useState(currentFlow?.formButtonText || '');
  const [selectedFormId, setSelectedFormId] = useState(currentFlow?.formId || '');
  const [formAction, setFormAction] = useState(currentFlow?.formAction || 'first_screen'); // 'first_screen' | 'data_exchange'
  const [flowToken, setFlowToken] = useState(currentFlow?.flowToken || '');
  const [flowData, setFlowData] = useState(
    currentFlow?.flowData || '{\n  "source": "greeting_flow",\n  "status": "new_lead"\n}'
  );
  const [formSavedInFlow, setFormSavedInFlow] = useState(false);
  const [formJsonError, setFormJsonError] = useState('');

  // Main Save Loading & Error
  const [saving, setSaving] = useState(false);
  const [mainError, setMainError] = useState('');

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      if (currentFlow?.message) setMessage(currentFlow.message);
      if (currentFlow?.personalized !== undefined) setPersonalized(!!currentFlow.personalized);
      if (currentFlow?.interactiveListEnabled !== undefined) setInteractiveListEnabled(!!currentFlow.interactiveListEnabled);
      if (currentFlow?.actionType) setActionType(currentFlow.actionType);
      if (currentFlow?.workflowId) {
        setSelectedWorkflow({
          id: currentFlow.workflowId,
          name: currentFlow.workflowName || currentFlow.workflowId,
        });
      }
      if (currentFlow?.formButtonText) setFormButtonText(currentFlow.formButtonText);
      if (currentFlow?.formId) setSelectedFormId(currentFlow.formId);
      if (currentFlow?.formAction) setFormAction(currentFlow.formAction);
      if (currentFlow?.flowToken) setFlowToken(currentFlow.flowToken);
      if (currentFlow?.flowData) {
        setFlowData(
          typeof currentFlow.flowData === 'object'
            ? JSON.stringify(currentFlow.flowData, null, 2)
            : currentFlow.flowData
        );
      }
      loadWorkflows();
      loadWhatsAppForms();
    }
  }, [isOpen, currentFlow]);

  // Load real workflows from backend
  const loadWorkflows = async () => {
    setLoadingWorkflows(true);
    try {
      const data = await dashboardService.getWorkflows();
      if (Array.isArray(data) && data.length > 0) {
        setWorkflows(data);
        if (!selectedWorkflow && currentFlow?.workflowId) {
          const match = data.find((w) => w.id === currentFlow.workflowId || w.name === currentFlow.workflowId);
          if (match) setSelectedWorkflow(match);
        }
      } else {
        // Fallback standard workflows matching screenshot
        const fallback = [
          { id: 'wf_1', name: 'ai_performance_analytics_dashboard_vf' },
          { id: 'wf_2', name: 'ai_ai-powered_customer_support_tg' },
          { id: 'wf_3', name: 'ai_automated_client_onboarding_cw' },
        ];
        setWorkflows(fallback);
      }
    } catch {
      setWorkflows([
        { id: 'wf_1', name: 'ai_performance_analytics_dashboard_vf' },
        { id: 'wf_2', name: 'ai_ai-powered_customer_support_tg' },
        { id: 'wf_3', name: 'ai_automated_client_onboarding_cw' },
      ]);
    } finally {
      setLoadingWorkflows(false);
    }
  };

  // Load real WhatsApp forms from backend
  const loadWhatsAppForms = async () => {
    setLoadingForms(true);
    try {
      const data = await dashboardService.getWhatsAppForms();
      if (Array.isArray(data) && data.length > 0) {
        setForms(data);
        if (!selectedFormId && data.length > 0) {
          setSelectedFormId(data[0].form_id || data[0].id);
        }
      } else {
        const fallbackForms = [
          { id: 'form_tech_req', form_id: 'tech_requirements_flow', title: 'Technical Requirements & Project Details' },
          { id: 'form_feedback', form_id: 'csat_survey_flow', title: 'Customer Satisfaction & Feedback' },
          { id: 'form_demo', form_id: 'demo_booking_flow', title: '1-on-1 Product Demo Schedule' },
        ];
        setForms(fallbackForms);
        if (!selectedFormId) setSelectedFormId(fallbackForms[0].form_id);
      }
    } catch {
      const fallbackForms = [
        { id: 'form_tech_req', form_id: 'tech_requirements_flow', title: 'Technical Requirements & Project Details' },
        { id: 'form_feedback', form_id: 'csat_survey_flow', title: 'Customer Satisfaction & Feedback' },
      ];
      setForms(fallbackForms);
      if (!selectedFormId) setSelectedFormId(fallbackForms[0].form_id);
    } finally {
      setLoadingForms(false);
    }
  };

  if (!isOpen) return null;

  // Insert text at cursor position in textarea
  const insertTextAtCursor = (insertion) => {
    const el = textareaRef.current;
    if (!el) {
      if (message.length + insertion.length <= 1024) {
        setMessage((prev) => prev + insertion);
      }
      return;
    }

    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const newText = message.slice(0, start) + insertion + message.slice(end);

    if (newText.length <= 1024) {
      setMessage(newText);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + insertion.length, start + insertion.length);
      }, 0);
    } else {
      showToast('Maximum 1024 characters allowed', 'error');
    }
  };

  // Formatting helpers
  const applyFormat = (wrapper) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const selected = message.slice(start, end);

    if (selected) {
      const formatted = `${wrapper}${selected}${wrapper}`;
      insertTextAtCursor(formatted);
    } else {
      insertTextAtCursor(`${wrapper}text${wrapper}`);
    }
  };

  // Handle Radio Option Selection
  const handleSelectAction = (type) => {
    setActionType(type);
    if (type === 'workflow') {
      setShowWorkflowOverlay(true);
    }
  };

  // Handle Form Inner Save
  const handleInnerFormSave = () => {
    setFormJsonError('');
    if (!formButtonText.trim()) {
      setFormJsonError('Form button text is required');
      showToast('Please enter text for the form button', 'error');
      return;
    }

    if (formAction === 'data_exchange' && flowData.trim()) {
      try {
        JSON.parse(flowData);
      } catch (e) {
        setFormJsonError('Invalid JSON format for flow_data. Please provide valid JSON.');
        showToast('Invalid JSON in flow_data', 'error');
        return;
      }
    }

    setFormSavedInFlow(true);
    showToast('WhatsApp Form settings saved to Greeting Flow!', 'success');
  };

  // Main Save
  const handleMainSave = async () => {
    setMainError('');

    if (!message.trim()) {
      setMainError('Greeting message cannot be empty');
      showToast('Greeting message cannot be empty', 'error');
      return;
    }

    if (message.length > 1024) {
      setMainError('Greeting message exceeds 1024 characters');
      showToast('Message exceeds 1024 characters', 'error');
      return;
    }

    // Validate WhatsApp Form if selected
    if (actionType === 'whatsapp_form') {
      if (!formButtonText.trim()) {
        setMainError('Form button text is required when WhatsApp Form is selected');
        showToast('Form button text is required', 'error');
        return;
      }
      if (formAction === 'data_exchange' && flowData.trim()) {
        try {
          JSON.parse(flowData);
        } catch {
          setMainError('Invalid JSON format in flow_data. Please correct before saving.');
          showToast('Invalid JSON in WhatsApp Form configuration', 'error');
          return;
        }
      }
    }

    setSaving(true);
    try {
      const payload = {
        message: message.trim(),
        personalized,
        interactiveListEnabled,
        actionType,
        workflowId: actionType === 'workflow' ? selectedWorkflow?.id : null,
        workflowName: actionType === 'workflow' ? selectedWorkflow?.name : null,
        collectionId: actionType === 'product_collections' ? selectedCollection?.id : null,
        collectionName: actionType === 'product_collections' ? selectedCollection?.name : null,
        formButtonText: actionType === 'whatsapp_form' ? formButtonText.trim() : null,
        formId: actionType === 'whatsapp_form' ? selectedFormId : null,
        formName: actionType === 'whatsapp_form' ? forms.find((f) => f.form_id === selectedFormId || f.id === selectedFormId)?.title : null,
        formAction: actionType === 'whatsapp_form' ? formAction : 'first_screen',
        flowToken: actionType === 'whatsapp_form' ? flowToken.trim() : null,
        flowData: actionType === 'whatsapp_form' ? flowData.trim() : '{}',
        buttons: ['Explore Solutions', 'Pricing Plans', 'Chat with Agent'],
        workingHoursEnabled: true,
      };

      await dashboardService.saveGreetingFlow(payload);
      showToast('Greeting Flow updated and activated successfully!', 'success');

      const notify = onSaved || onFlowChange;
      if (notify) {
        notify({
          activated: true,
          aiGenerated: true,
          ...payload,
        });
      }

      onClose();
    } catch (err) {
      setMainError(err.message || 'Failed to save Greeting Flow settings');
      showToast(err.message || 'Error saving Greeting Flow', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredWorkflows = workflows.filter((w) =>
    (w.name || '').toLowerCase().includes(workflowSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] relative">
        {/* ========================================================================= */}
        {/* HEADER MATCHING INTERAKT SCREENSHOT */}
        {/* ========================================================================= */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="text-slate-700">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <path d="M8 10h.01"></path>
                <path d="M12 10h.01"></path>
                <path d="M16 10h.01"></path>
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">Greeting Message</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODAL SCROLLABLE BODY */}
        {/* ========================================================================= */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs">
          {/* Subtitle / Description */}
          <p className="text-slate-600 leading-relaxed">
            Configure Greeting message to be triggered when new customers reach out to your business for the first time or existing customers reach out after a period of 24 hours.
          </p>

          {/* Checkbox: Personalized Welcome Message */}
          <label className="flex items-center gap-2.5 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={personalized}
              onChange={(e) => setPersonalized(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
            />
            <span className="font-semibold text-slate-800 text-xs">
              Set-up personalized welcome message basis new & existing customers
            </span>
          </label>

          {/* ========================================================================= */}
          {/* MESSAGE EDITOR CONTAINER */}
          {/* ========================================================================= */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3 shadow-2xs hover:border-slate-300 transition-all">
            <div className="font-semibold text-slate-700">Message</div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={message}
                maxLength={1024}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Enter your customized WhatsApp greeting message..."
                className="w-full p-3 bg-transparent text-slate-800 text-xs leading-relaxed resize-none focus:outline-none placeholder:text-slate-400 border border-slate-100 rounded-xl focus:border-slate-300"
              />

              {/* Character Counter */}
              <div className="text-right text-[11px] font-medium text-slate-400 mt-1">
                <span className={message.length > 950 ? 'text-amber-600 font-bold' : ''}>
                  {message.length}
                </span>
                /1024
              </div>
            </div>

            {/* Toolbar Below Textbox */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 relative">
              {/* Left: Add Variable */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowVariableMenu(!showVariableMenu)}
                  className="flex items-center gap-1.5 text-emerald-800 hover:text-emerald-950 font-bold text-xs cursor-pointer py-1 px-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-700" />
                  <span>Add variable</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </button>

                {/* Variable Selector Popover */}
                {showVariableMenu && (
                  <div className="absolute left-0 bottom-8 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in">
                    <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                      Contact Variables
                    </div>
                    <div className="space-y-1 mt-1">
                      {VARIABLES.map((v) => (
                        <button
                          key={v.key}
                          type="button"
                          onClick={() => {
                            insertTextAtCursor(v.key);
                            setShowVariableMenu(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer transition-colors"
                        >
                          <span className="font-mono text-emerald-700 font-bold">{v.key}</span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                            {v.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Text Formatting Buttons */}
              <div className="flex items-center gap-1 text-slate-500">
                {/* Emoji Picker Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Insert emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  {/* Emoji Popover */}
                  {showEmojiPicker && (
                    <div className="absolute right-0 bottom-8 p-2 bg-white rounded-xl shadow-xl border border-slate-200 grid grid-cols-7 gap-1 z-50 animate-in fade-in">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            insertTextAtCursor(` ${emoji} `);
                            setShowEmojiPicker(false);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded text-base cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bold */}
                <button
                  type="button"
                  onClick={() => applyFormat('*')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer font-bold text-xs"
                  title="Bold (*text*)"
                >
                  <Bold className="w-4 h-4" />
                </button>

                {/* Italic */}
                <button
                  type="button"
                  onClick={() => applyFormat('_')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer text-xs italic"
                  title="Italic (_text_)"
                >
                  <Italic className="w-4 h-4" />
                </button>

                {/* Strikethrough */}
                <button
                  type="button"
                  onClick={() => applyFormat('~')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer text-xs"
                  title="Strikethrough (~text~)"
                >
                  <Strikethrough className="w-4 h-4" />
                </button>

                {/* Attachment/Link */}
                <button
                  type="button"
                  onClick={() => insertTextAtCursor(' https://arco.ai ')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer text-xs"
                  title="Insert Link"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* YELLOW INFORMATION BANNER */}
          {/* ========================================================================= */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>Click</span>
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  navigate('/automation/custom-reply');
                }}
                className="text-blue-600 hover:underline font-bold cursor-pointer"
              >
                here
              </button>
              <span>to enable Interaktive List for auto replies</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* GREETING FLOW ACTIONS (4 RADIO OPTIONS) */}
          {/* ========================================================================= */}
          <div className="space-y-4 pt-1">
            {/* Option A: Product Collections */}
            <div className="space-y-1">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="radio"
                  name="greetingAction"
                  checked={actionType === 'product_collections'}
                  onChange={() => setActionType('product_collections')}
                  className="w-4 h-4 mt-0.5 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <div className="text-xs">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5 flex-wrap">
                    <span>Add list of Product Collections</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionType('product_collections');
                        setShowProductModal(true);
                      }}
                      className="text-blue-600 hover:underline font-bold cursor-pointer"
                    >
                      (set here)
                    </button>
                    <span>to the Welcome Message</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    If customer selects a collection, corresponding Product Catalog will be sent.
                  </div>
                </div>
              </label>

              {/* Selected Collection Pill when active */}
              {actionType === 'product_collections' && selectedCollection && (
                <div className="ml-7 mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold text-slate-800">{selectedCollection.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProductModal(true)}
                    className="text-[11px] text-blue-600 hover:underline font-bold cursor-pointer"
                  >
                    Change Collection
                  </button>
                </div>
              )}
            </div>

            {/* Option B: Workflow */}
            <div className="space-y-1">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="radio"
                  name="greetingAction"
                  checked={actionType === 'workflow'}
                  onChange={() => handleSelectAction('workflow')}
                  className="w-4 h-4 mt-0.5 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <div className="text-xs">
                  <div className="font-semibold text-slate-900">Workflow</div>
                </div>
              </label>

              {/* Selected Workflow Pill when active */}
              {actionType === 'workflow' && selectedWorkflow && (
                <div className="ml-7 mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-mono text-emerald-800 font-bold truncate max-w-sm">
                    <Layers className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{selectedWorkflow.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWorkflowOverlay(true)}
                    className="text-[11px] text-blue-600 hover:underline font-bold cursor-pointer shrink-0"
                  >
                    Change Workflow
                  </button>
                </div>
              )}
            </div>

            {/* Option C: Add WhatsApp Form */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="radio"
                  name="greetingAction"
                  checked={actionType === 'whatsapp_form'}
                  onChange={() => setActionType('whatsapp_form')}
                  className="w-4 h-4 mt-0.5 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <div className="text-xs">
                  <div className="font-semibold text-slate-900">Add WhatsApp Form</div>
                </div>
              </label>

              {/* WhatsApp Form Config Sub-Panel (Matching media_1787810153273 & media_1787810158409) */}
              {actionType === 'whatsapp_form' && (
                <div className="ml-7 space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs animate-in fade-in">
                  {/* Form Button Text */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Form Button Text</label>
                    <input
                      type="text"
                      value={formButtonText}
                      onChange={(e) => setFormButtonText(e.target.value)}
                      placeholder="Enter text for the button"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* Select Form Dropdown */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Select Form</label>
                    <div className="relative">
                      <select
                        value={selectedFormId}
                        onChange={(e) => setSelectedFormId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 appearance-none focus:outline-none focus:border-emerald-600 cursor-pointer"
                      >
                        {forms.map((f) => (
                          <option key={f.form_id || f.id} value={f.form_id || f.id}>
                            {f.title || f.name || f.form_id}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Action on Opening Form Radio */}
                  <div className="space-y-2 pt-1">
                    <label className="font-bold text-slate-700 block">Action on Opening Form</label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="formOpeningAction"
                          checked={formAction === 'first_screen'}
                          onChange={() => setFormAction('first_screen')}
                          className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span className="font-medium text-slate-700">Navigate to first screen</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="formOpeningAction"
                          checked={formAction === 'data_exchange'}
                          onChange={() => setFormAction('data_exchange')}
                          className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span className="font-medium text-slate-700">Data Exchange</span>
                      </label>
                    </div>
                  </div>

                  {/* Data Exchange Fields (Matching media_1787810158409) */}
                  {formAction === 'data_exchange' && (
                    <div className="space-y-3 pt-2 border-t border-slate-200/60 animate-in fade-in">
                      {/* flow_token Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                        <div className="text-[11px] text-slate-500">
                          <span className="font-mono font-bold text-slate-700">flow_token</span>
                          <span className="text-[10px] block text-slate-400">(optional)</span>
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={flowToken}
                            onChange={(e) => setFlowToken(e.target.value)}
                            placeholder="Enter flow token"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      {/* flow_data Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                        <div className="text-[11px] text-slate-500">
                          <span className="font-mono font-bold text-slate-700">flow_data</span>
                          <span className="text-[10px] block text-slate-400">
                            (optional, only JSON values allowed)
                          </span>
                        </div>
                        <div className="sm:col-span-2">
                          <textarea
                            value={flowData}
                            onChange={(e) => setFlowData(e.target.value)}
                            rows={3}
                            placeholder="{}"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-600 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formJsonError && (
                    <div className="text-[11px] text-red-600 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{formJsonError}</span>
                    </div>
                  )}

                  {/* Inner Save Button for Form */}
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={handleInnerFormSave}
                      className="px-5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Option D: None */}
            <div className="space-y-1">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="radio"
                  name="greetingAction"
                  checked={actionType === 'none'}
                  onChange={() => setActionType('none')}
                  className="w-4 h-4 mt-0.5 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <div className="text-xs">
                  <div className="font-semibold text-slate-900">None</div>
                </div>
              </label>
            </div>
          </div>

          {mainError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{mainError}</span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* FIXED STICKY FOOTER (MATCHING INTERAKT SCREENSHOT) */}
        {/* ========================================================================= */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={handleMainSave}
            disabled={saving}
            className="px-8 py-2.5 rounded-xl bg-[#00875a] hover:bg-[#00704a] text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* WORKFLOW SELECTION OVERLAY / MODAL (MATCHING media_1787810148677.png) */}
        {/* ========================================================================= */}
        {showWorkflowOverlay && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in fade-in duration-150">
            {/* Header: Workflows & Done Button */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Workflows</h3>
              <button
                type="button"
                onClick={() => setShowWorkflowOverlay(false)}
                className="px-5 py-1.5 rounded-xl bg-[#00875a] hover:bg-[#00704a] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={workflowSearch}
                  onChange={(e) => setWorkflowSearch(e.target.value)}
                  placeholder="Search a workflow"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-2xs"
                />
              </div>

              {/* All Workflows Section */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  All Workflows
                </div>

                {loadingWorkflows ? (
                  <div className="py-8 flex items-center justify-center text-slate-400 gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Loading workflows...</span>
                  </div>
                ) : filteredWorkflows.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No workflows match your search query.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredWorkflows.map((wf) => {
                      const isSelected = selectedWorkflow?.id === wf.id || selectedWorkflow?.name === wf.name;
                      return (
                        <div
                          key={wf.id}
                          onClick={() => setSelectedWorkflow(wf)}
                          className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                        >
                          <span className="font-medium text-slate-800 text-xs font-mono">
                            {wf.name}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#00875a] font-bold" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PRODUCT COLLECTIONS PICKER OVERLAY */}
        {/* ========================================================================= */}
        {showProductModal && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in fade-in duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Select Product Collection</h3>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="px-5 py-1.5 rounded-xl bg-[#00875a] hover:bg-[#00704a] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              <p className="text-slate-500 text-xs">
                Select the product catalog collection to trigger when a customer initiates contact.
              </p>

              <div className="divide-y divide-slate-100 pt-2">
                {DEFAULT_PRODUCT_COLLECTIONS.map((col) => {
                  const isSelected = selectedCollection?.id === col.id;
                  return (
                    <div
                      key={col.id}
                      onClick={() => setSelectedCollection(col)}
                      className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 text-xs">{col.name}</div>
                        <div className="text-[11px] text-slate-400">{col.count} products available</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#00875a] font-bold" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
