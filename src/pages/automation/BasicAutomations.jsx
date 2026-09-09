import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Edit2,
  CheckCircle2,
  X,
  Play,
  Share2,
  ChevronRight,
  ChevronDown,
  Info,
  Mail,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Save,
  Check,
  ExternalLink,
  ShoppingBag,
  ListFilter,
  FileText,
  Search,
} from 'lucide-react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import AutomationSubNav from '../../components/automation/AutomationSubNav';
import AutomationSimulatorDrawer from '../../components/automation/AutomationSimulatorDrawer';
import GreetingFlowModal from '../../components/dashboard/GreetingFlowModal';
import { automationService } from '../../services/automationService';

const DEFAULT_OOO_MESSAGE = `Hello! 👋 You've reached D'Crypt Code outside of business hours. Our dedicated team is currently unavailable to assist you but worry not!

We look forward to connecting with you during our business hours. Please visit our website at https://www.dcryptcode.com/ to learn more about our services and offerings.

You can also call us at +919653646411 for urgent inquiries. We'll respond as soon as we're back! Thank you for your understanding! 🤝`;

const DEFAULT_DELAYED_MESSAGE = `Thank you for reaching out to D'Crypt Code! 🙏 We appreciate your patience as we handle high volumes of inquiries. Rest assured, we're dedicated to providing you with the best digital solutions tailored to enhance your business operations.

Your message is important to us, and we'll get back to you as soon as possible. For urgent matters, please call us at +919653646411.

Thank you for your understanding!`;

const PRODUCT_COLLECTIONS = [
  { id: 'col_all', name: 'All Product Categories & Catalog' },
  { id: 'col_software', name: 'Software & Cloud Solutions' },
  { id: 'col_ai', name: 'Autonomous AI Agents' },
  { id: 'col_omni', name: 'Omnichannel WhatsApp Hubs' },
];

const FLOW_TOKENS = [
  { id: 'contact_phone', label: 'contact.phone_number', token: '{{contact.phone}}', desc: 'WhatsApp phone number of customer' },
  { id: 'contact_name', label: 'contact.full_name', token: '{{contact.name}}', desc: 'Full name of customer' },
  { id: 'user_id', label: 'user.customer_id', token: '{{user.id}}', desc: 'Unique account or CRM customer ID' },
  { id: 'conversation_id', label: 'conversation.session_id', token: '{{conversation.id}}', desc: 'Current active conversation session token' },
  { id: 'custom_flow_token', label: 'flow.initial_token', token: 'flow_token_init_wa', desc: 'Custom unique flow token identifier' },
];

const FLOW_DATA_PRESETS = [
  { id: 'default_inquiry', label: 'Default Inquiry Context', value: '{\n  "source": "delayed_reply",\n  "channel": "whatsapp"\n}' },
  { id: 'user_profile', label: 'Customer User Profile', value: '{\n  "user_id": "{{user.id}}",\n  "name": "{{contact.name}}"\n}' },
  { id: 'lead_capture', label: 'Lead Capture Flow Init', value: '{\n  "lead_status": "new",\n  "trigger": "delayed_bot"\n}' },
  { id: 'empty_json', label: 'Empty JSON Object', value: '{}' },
];

export default function BasicAutomations() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Active accordion card: 'out_of_office' | 'welcome' | 'delayed' | null
  const [expandedCard, setExpandedCard] = useState('delayed');

  // Working hours edit modal state
  const [isWorkingHoursModalOpen, setIsWorkingHoursModalOpen] = useState(false);
  const [workingDays, setWorkingDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [isWorkingHoursEnabled, setIsWorkingHoursEnabled] = useState(true);

  // ==========================================
  // CARD 1: Out of office edit state
  // ==========================================
  const [oooTitle, setOooTitle] = useState('Out of Office Message');
  const [isEditingOooTitle, setIsEditingOooTitle] = useState(false);
  const [oooMessage, setOooMessage] = useState(DEFAULT_OOO_MESSAGE);
  const [oooEnabled, setOooEnabled] = useState(true);
  const [oooActionType, setOooActionType] = useState('whatsapp_form');
  const [oooCollectionId, setOooCollectionId] = useState('col_all');
  
  // WhatsApp Form sub-options for OOO
  const [oooFormButtonText, setOooFormButtonText] = useState('');
  const [oooSelectedFormId, setOooSelectedFormId] = useState('');
  const [oooFormAction, setOooFormAction] = useState('first_screen'); // 'first_screen' | 'data_exchange'
  const [oooFlowToken, setOooFlowToken] = useState('');
  const [oooFlowData, setOooFlowData] = useState('{}');

  // Token and data dropdowns for OOO
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [showDataDropdown, setShowDataDropdown] = useState(false);
  const [tokenSearch, setTokenSearch] = useState('');
  const [dataSearch, setDataSearch] = useState('');

  // ==========================================
  // CARD 2: Welcome message edit state
  // ==========================================
  const [welcomeTitle, setWelcomeTitle] = useState('Welcome Message');
  const [welcomeEnabled, setWelcomeEnabled] = useState(true);
  const [welcomeSendWithOoo, setWelcomeSendWithOoo] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome to ARCO Communication! How can our team assist your business today?');
  const [isGreetingFlowModalOpen, setIsGreetingFlowModalOpen] = useState(false);

  // ==========================================
  // CARD 3: Delayed response edit state (Matching 3rd reference screenshot)
  // ==========================================
  const [delayedTitle, setDelayedTitle] = useState('Delayed Response Message');
  const [isEditingDelayedTitle, setIsEditingDelayedTitle] = useState(false);
  const [delayedHours, setDelayedHours] = useState(0);
  const [delayedMinutes, setDelayedMinutes] = useState(10);
  const [delayedMessage, setDelayedMessage] = useState(DEFAULT_DELAYED_MESSAGE);
  const [delayedEnabled, setDelayedEnabled] = useState(true);
  // actionType: 'product_collections' | 'interactive_list' | 'whatsapp_form' | 'none'
  const [delayedActionType, setDelayedActionType] = useState('interactive_list');
  const [delayedCollectionId, setDelayedCollectionId] = useState('col_all');

  // WhatsApp Form sub-options for Delayed Response
  const [delayedFormButtonText, setDelayedFormButtonText] = useState('');
  const [delayedSelectedFormId, setDelayedSelectedFormId] = useState('');
  const [delayedFormAction, setDelayedFormAction] = useState('first_screen');
  const [delayedFlowToken, setDelayedFlowToken] = useState('');
  const [delayedFlowData, setDelayedFlowData] = useState('{}');

  // Token and data dropdowns for Delayed Response
  const [showDelayedTokenDropdown, setShowDelayedTokenDropdown] = useState(false);
  const [showDelayedDataDropdown, setShowDelayedDataDropdown] = useState(false);
  const [delayedTokenSearch, setDelayedTokenSearch] = useState('');
  const [delayedDataSearch, setDelayedDataSearch] = useState('');

  // WhatsApp Forms available in the workspace
  const [availableForms, setAvailableForms] = useState([
    { id: 'flow_lead_qualification', title: 'Lead Qualification & Requirements Flow' },
    { id: 'flow_csat_feedback', title: 'Customer Feedback & Rating Survey' },
    { id: 'flow_support_ticket', title: 'Urgent Support Inquiry Form' },
    { id: 'flow_appointment_booking', title: 'Schedule Consultation Appointment' },
  ]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await automationService.getSettings();
      if (res?.data) {
        setSettings(res.data);
        const wh = res.data.working_hours || {};
        setWorkingDays(wh.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
        setStartTime(wh.startTime || '09:00');
        setEndTime(wh.endTime || '18:00');
        setIsWorkingHoursEnabled(wh.enabled !== false);

        // 1. OOO
        const ooo = res.data.out_of_office || {};
        setOooTitle(ooo.title || 'Out of Office Message');
        setOooMessage(ooo.message || DEFAULT_OOO_MESSAGE);
        setOooEnabled(ooo.enabled !== false);
        setOooActionType(ooo.actionType || 'whatsapp_form');
        setOooCollectionId(ooo.collectionId || 'col_all');
        setOooFormButtonText(ooo.formButtonText || '');
        setOooSelectedFormId(ooo.formId || '');
        setOooFormAction(ooo.formAction || 'first_screen');
        setOooFlowToken(ooo.flowToken || '');
        setOooFlowData(ooo.flowData || '{}');

        // 2. Welcome
        const wm = res.data.welcome_message || {};
        setWelcomeTitle(wm.title || 'Welcome Message');
        setWelcomeMessage(wm.message || 'Welcome to ARCO Communication! How can our team assist your business today?');
        setWelcomeEnabled(wm.enabled !== false);
        setWelcomeSendWithOoo(wm.sendWithOoo !== false);

        // 3. Delayed Response
        const dr = res.data.delayed_response || {};
        setDelayedTitle(dr.title || 'Delayed Response Message');
        setDelayedHours(dr.delayHours !== undefined ? dr.delayHours : 0);
        setDelayedMinutes(dr.delayMinutes !== undefined ? dr.delayMinutes : 10);
        setDelayedMessage(dr.message || DEFAULT_DELAYED_MESSAGE);
        setDelayedEnabled(dr.enabled !== false);
        setDelayedActionType(dr.actionType || 'interactive_list');
        setDelayedCollectionId(dr.collectionId || 'col_all');
        setDelayedFormButtonText(dr.formButtonText || '');
        setDelayedSelectedFormId(dr.formId || '');
        setDelayedFormAction(dr.formAction || 'first_screen');
        setDelayedFlowToken(dr.flowToken || '');
        setDelayedFlowData(dr.flowData || '{}');
      }

      // Also load real WhatsApp forms if available
      try {
        const formsRes = await automationService.getWhatsAppForms();
        if (formsRes?.forms && Array.isArray(formsRes.forms) && formsRes.forms.length > 0) {
          setAvailableForms(formsRes.forms.map((f) => ({ id: f.form_id || f.id, title: f.title || f.name })));
        }
      } catch (e) {
        console.warn('Using default WhatsApp forms list');
      }

    } catch (err) {
      console.error('Failed to load automation settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Save Working Hours Schedule
  const handleSaveWorkingHours = async () => {
    try {
      const updated = {
        ...settings,
        workingHours: {
          enabled: isWorkingHoursEnabled,
          timezone: 'Asia/Kolkata',
          days: workingDays,
          startTime,
          endTime,
        },
      };
      await automationService.updateSettings(updated);
      showToast('Working hours schedule saved successfully!');
      setIsWorkingHoursModalOpen(false);
      loadSettings();
    } catch (err) {
      alert(err.message || 'Failed to update working hours');
    }
  };

  // ==========================================
  // Card 1 Handlers (Out of Office)
  // ==========================================
  const handleSaveOutOfOffice = async (explicitEnabled) => {
    const isNowEnabled = explicitEnabled !== undefined ? explicitEnabled : oooEnabled;
    try {
      const updated = {
        ...settings,
        outOfOffice: {
          ...settings?.out_of_office,
          title: oooTitle,
          enabled: isNowEnabled,
          message: oooMessage,
          actionType: oooActionType,
          collectionId: oooCollectionId,
          collectionName: PRODUCT_COLLECTIONS.find((c) => c.id === oooCollectionId)?.name || 'Product Catalog',
          formButtonText: oooFormButtonText,
          formId: oooSelectedFormId,
          formName: availableForms.find((f) => f.id === oooSelectedFormId)?.title || '',
          formAction: oooFormAction,
          flowToken: oooFlowToken,
          flowData: oooFlowData,
        },
      };
      await automationService.updateSettings(updated);
      showToast(isNowEnabled ? 'Out of Office settings saved!' : 'Out of Office auto reply disabled');
      loadSettings();
    } catch (err) {
      alert(err.message || 'Failed to save Out of Office settings');
    }
  };

  const handleSaveFormSubSettings = () => {
    if (!oooFormButtonText.trim()) {
      showToast('Please enter Form Button Text', 'error');
      return;
    }
    if (!oooSelectedFormId) {
      showToast('Please select a WhatsApp Form', 'error');
      return;
    }

    if (oooFormAction === 'data_exchange' && oooFlowData && oooFlowData.trim() !== '') {
      try {
        JSON.parse(oooFlowData);
      } catch (e) {
        showToast('Invalid JSON in flow_data. Please provide valid JSON like {}', 'error');
        return;
      }
    }

    handleSaveOutOfOffice();
    showToast(
      oooFormAction === 'first_screen'
        ? 'WhatsApp Form (Navigate to first screen) configured & saved!'
        : 'WhatsApp Form (Data Exchange) configured & saved!'
    );
  };

  const handleToggleOooStatus = async () => {
    const nextState = !oooEnabled;
    setOooEnabled(nextState);
    await handleSaveOutOfOffice(nextState);
  };

  // ==========================================
  // Card 2 Handlers (Welcome Message)
  // ==========================================
  const handleSaveWelcome = async (explicitEnabled, explicitSendWithOoo) => {
    const isNowEnabled = explicitEnabled !== undefined ? explicitEnabled : welcomeEnabled;
    const isNowSendWithOoo = explicitSendWithOoo !== undefined ? explicitSendWithOoo : welcomeSendWithOoo;
    try {
      const updated = {
        ...settings,
        welcomeMessage: {
          ...settings?.welcome_message,
          title: welcomeTitle,
          enabled: isNowEnabled,
          sendWithOoo: isNowSendWithOoo,
          message: welcomeMessage,
        },
      };
      await automationService.updateSettings(updated);
      showToast(isNowEnabled ? 'Welcome message settings saved!' : 'Welcome greeting disabled');
      loadSettings();
    } catch (err) {
      alert(err.message || 'Failed to save Welcome message');
    }
  };

  const handleToggleWelcomeStatus = async () => {
    const nextState = !welcomeEnabled;
    setWelcomeEnabled(nextState);
    await handleSaveWelcome(nextState);
  };

  const handleToggleSendWithOoo = async (val) => {
    setWelcomeSendWithOoo(val);
    await handleSaveWelcome(undefined, val);
  };

  // ==========================================
  // Card 3 Handlers (Delayed Response Message)
  // ==========================================
  const handleSaveDelayed = async (explicitEnabled) => {
    const isNowEnabled = explicitEnabled !== undefined ? explicitEnabled : delayedEnabled;
    try {
      const updated = {
        ...settings,
        delayedResponse: {
          ...settings?.delayed_response,
          title: delayedTitle,
          enabled: isNowEnabled,
          delayHours: Number(delayedHours),
          delayMinutes: Number(delayedMinutes),
          message: delayedMessage,
          actionType: delayedActionType,
          collectionId: delayedCollectionId,
          collectionName: PRODUCT_COLLECTIONS.find((c) => c.id === delayedCollectionId)?.name || 'Product Catalog',
          formButtonText: delayedFormButtonText,
          formId: delayedSelectedFormId,
          formName: availableForms.find((f) => f.id === delayedSelectedFormId)?.title || '',
          formAction: delayedFormAction,
          flowToken: delayedFlowToken,
          flowData: delayedFlowData,
        },
      };
      await automationService.updateSettings(updated);
      showToast(isNowEnabled ? 'Delayed response settings saved!' : 'Delayed response auto reply disabled');
      loadSettings();
    } catch (err) {
      alert(err.message || 'Failed to save Delayed response settings');
    }
  };

  const handleSaveDelayedFormSubSettings = () => {
    if (!delayedFormButtonText.trim()) {
      showToast('Please enter Form Button Text', 'error');
      return;
    }
    if (!delayedSelectedFormId) {
      showToast('Please select a WhatsApp Form', 'error');
      return;
    }

    if (delayedFormAction === 'data_exchange' && delayedFlowData && delayedFlowData.trim() !== '') {
      try {
        JSON.parse(delayedFlowData);
      } catch (e) {
        showToast('Invalid JSON in flow_data. Please provide valid JSON like {}', 'error');
        return;
      }
    }

    handleSaveDelayed();
    showToast(
      delayedFormAction === 'first_screen'
        ? 'WhatsApp Form (Navigate to first screen) configured & saved!'
        : 'WhatsApp Form (Data Exchange) configured & saved!'
    );
  };

  const handleToggleDelayedStatus = async () => {
    const nextState = !delayedEnabled;
    setDelayedEnabled(nextState);
    await handleSaveDelayed(nextState);
  };

  const toggleDay = (day) => {
    const fullDay = day.length === 3 ? {
      Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday'
    }[day] : day;

    setWorkingDays((prev) =>
      prev.includes(fullDay) || prev.includes(day)
        ? prev.filter((d) => d !== fullDay && d !== day)
        : [...prev, fullDay]
    );
  };

  const formatDaysString = () => {
    if (!workingDays || workingDays.length === 0) return 'Mon, Tue, Wed, Thu, Fri';
    return workingDays
      .map((d) => d.slice(0, 3))
      .join(', ');
  };

  const formatTimeString = (t) => {
    if (!t) return '9am';
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    if (hour === 12) return `12pm`;
    if (hour > 12) return `${hour - 12}${m !== '00' ? ':' + m : ''}pm`;
    return `${hour}${m !== '00' ? ':' + m : ''}am`;
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
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Page Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mt-0.5">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h1 className="text-base font-bold text-slate-900 leading-tight">Basic Automations</h1>
                  <p className="text-xs text-slate-500">
                    Set up Welcome, OOO & Delayed autoreplies. Know more{' '}
                    <a href="#help" className="text-blue-600 hover:underline">here</a>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSimulatorOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Play className="w-3 h-3 fill-slate-700" />
                <span>Test Simulation</span>
              </button>
            </div>

            {/* Setup Your Working Hours Header Block */}
            <div className="pt-2 space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-900">Setup your working hours</span>
                <button
                  type="button"
                  onClick={() => setIsWorkingHoursModalOpen(true)}
                  className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  title="Edit working hours"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 pl-6">
                {formatDaysString()} {formatTimeString(startTime)} to {formatTimeString(endTime)}
              </p>
            </div>

            {/* 3 Full-Width Stacked Automation Cards */}
            <div className="space-y-5 pt-1">
              
              {/* ========================================================================= */}
              {/* CARD 1: OUT OF OFFICE MESSAGE */}
              {/* ========================================================================= */}
              <div
                className={`rounded-xl overflow-hidden transition-all duration-200 ${
                  expandedCard === 'out_of_office'
                    ? 'border-2 border-emerald-600 shadow-sm bg-white'
                    : 'border border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Summary Header Card */}
                <div
                  onClick={() => setExpandedCard(expandedCard === 'out_of_office' ? null : 'out_of_office')}
                  className="p-4 space-y-2 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900">Out of Office Message</h3>
                      {expandedCard === 'out_of_office' ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Editing
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          oooEnabled ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {oooEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Set up your working hours and Out Of Office Message. Please note that the Auto Reply gets triggered for new users and users whose conversation is marked closed.
                  </p>
                </div>

                {/* Sent Counter Bar */}
                <div
                  onClick={() => setExpandedCard(expandedCard === 'out_of_office' ? null : 'out_of_office')}
                  className="bg-[#eef9f5] border-t border-emerald-100/70 py-2 px-4 text-center text-xs text-emerald-800 font-medium cursor-pointer hover:bg-emerald-100/60 transition-colors flex items-center justify-center gap-2"
                >
                  <span>{settings?.out_of_office?.sentCount || 0} Out of Office Messages sent</span>
                </div>

                {/* EXPANDED INTERAKT-STYLE INLINE CONFIGURATION PANEL */}
                {expandedCard === 'out_of_office' && (
                  <div className="border-t border-emerald-200/80 p-5 md:p-6 bg-white space-y-5 animate-in fade-in duration-150">
                    
                    {/* 1. Header with Editable Title */}
                    <div className="flex items-center gap-2 pb-1 text-slate-900">
                      <Mail className="w-4 h-4 text-slate-700" />
                      {isEditingOooTitle ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={oooTitle}
                            onChange={(e) => setOooTitle(e.target.value)}
                            className="px-2 py-1 text-xs font-bold border border-slate-300 rounded"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setIsEditingOooTitle(false)}
                            className="p-1 rounded text-emerald-700 hover:bg-emerald-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <span>{oooTitle}</span>
                          <button
                            type="button"
                            onClick={() => setIsEditingOooTitle(true)}
                            className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Edit Title"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 2. Message Textarea */}
                    <div>
                      <textarea
                        rows={7}
                        value={oooMessage}
                        onChange={(e) => setOooMessage(e.target.value)}
                        placeholder="Enter your out of office message..."
                        className="w-full p-3.5 rounded-lg border border-slate-400 focus:border-slate-600 focus:ring-1 focus:ring-slate-500 outline-none text-xs text-slate-800 leading-relaxed resize-y font-normal bg-white shadow-2xs"
                      />
                    </div>

                    {/* 3. Yellow Notice Banner for Interaktive List */}
                    <div className="bg-[#fff9e6] border border-[#ffe58f] text-[#ad6800] p-3 rounded-lg text-xs flex items-center gap-2">
                      <span className="text-amber-500 font-bold">💡</span>
                      <span>
                        Click{' '}
                        <Link
                          to="/automation/interactive-list"
                          className="text-blue-600 underline font-semibold hover:text-blue-800"
                        >
                          here
                        </Link>{' '}
                        to enable Interaktive List for auto replies
                      </span>
                    </div>

                    {/* 4. Interactive Action Radio Buttons */}
                    <div className="space-y-3.5 pt-1 text-xs text-slate-800">
                      
                      {/* Option 1: Product Collections */}
                      <div className="space-y-1">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="oooActionType"
                            value="product_collections"
                            checked={oooActionType === 'product_collections'}
                            onChange={(e) => setOooActionType(e.target.value)}
                            className="w-4 h-4 mt-0.5 accent-emerald-700 cursor-pointer"
                          />
                          <div>
                            <span className="font-semibold text-slate-900">
                              Add list of Product Collections (
                              <Link
                                to="/commerce/catalog"
                                className="text-blue-600 underline font-semibold hover:text-blue-800"
                              >
                                set here
                              </Link>
                              ) to the catalog
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              If customer selects a collection, corresponding Product Catalog will be sent.
                            </p>
                          </div>
                        </label>

                        {oooActionType === 'product_collections' && (
                          <div className="ml-6.5 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 max-w-md space-y-2">
                            <label className="block text-[11px] font-bold text-slate-700">
                              Select Product Collection:
                            </label>
                            <select
                              value={oooCollectionId}
                              onChange={(e) => setOooCollectionId(e.target.value)}
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
                      </div>

                      {/* Option 2: Enable Interaktive List Message */}
                      <div>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="oooActionType"
                            value="interactive_list"
                            checked={oooActionType === 'interactive_list'}
                            onChange={(e) => setOooActionType(e.target.value)}
                            className="w-4 h-4 accent-emerald-700 cursor-pointer"
                          />
                          <span className="font-semibold text-slate-900">
                            Enable Interaktive List Message
                          </span>
                        </label>
                      </div>

                      {/* Option 3: Add WhatsApp Form */}
                      <div className="space-y-3">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="oooActionType"
                            value="whatsapp_form"
                            checked={oooActionType === 'whatsapp_form'}
                            onChange={(e) => setOooActionType(e.target.value)}
                            className="w-4 h-4 accent-emerald-700 cursor-pointer"
                          />
                          <span className="font-semibold text-slate-900">
                            Add WhatsApp Form
                          </span>
                        </label>

                        {/* WhatsApp Form Configuration Sub-panel */}
                        {oooActionType === 'whatsapp_form' && (
                          <div className="ml-6.5 p-4 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs animate-in fade-in duration-150">
                            
                            <div className="space-y-1">
                              <label className="block text-[11px] font-bold text-slate-700">
                                Form Button Text
                              </label>
                              <input
                                type="text"
                                value={oooFormButtonText}
                                onChange={(e) => setOooFormButtonText(e.target.value)}
                                placeholder="Enter text for the button"
                                className="w-full p-2 bg-white rounded border border-slate-400 focus:border-slate-600 text-xs font-medium outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[11px] font-bold text-slate-700">
                                Select Form
                              </label>
                              <select
                                value={oooSelectedFormId}
                                onChange={(e) => setOooSelectedFormId(e.target.value)}
                                className="w-full p-2 bg-white rounded border border-slate-400 focus:border-slate-600 text-xs font-medium cursor-pointer outline-none"
                              >
                                <option value="">Select Form Name</option>
                                {availableForms.map((form) => (
                                  <option key={form.id} value={form.id}>
                                    {form.title}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-3 pt-1">
                              <label className="block text-[11px] font-bold text-slate-700">
                                Action on Opening Form
                              </label>
                              
                              <div className="flex items-center gap-6 text-xs">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="oooFormAction"
                                    value="first_screen"
                                    checked={oooFormAction === 'first_screen'}
                                    onChange={() => setOooFormAction('first_screen')}
                                    className="w-3.5 h-3.5 accent-emerald-700 cursor-pointer"
                                  />
                                  <span className="font-medium text-slate-800">Navigate to first screen</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="oooFormAction"
                                    value="data_exchange"
                                    checked={oooFormAction === 'data_exchange'}
                                    onChange={() => setOooFormAction('data_exchange')}
                                    className="w-3.5 h-3.5 accent-emerald-700 cursor-pointer"
                                  />
                                  <span className="font-medium text-slate-800">Data Exchange</span>
                                </label>
                              </div>

                              {/* CASE A: NAVIGATE TO FIRST SCREEN */}
                              {oooFormAction === 'first_screen' && (
                                <div className="pt-2 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={handleSaveFormSubSettings}
                                    className="px-6 py-1.5 rounded bg-[#008069] hover:bg-[#075e54] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Save</span>
                                  </button>
                                </div>
                              )}

                              {/* CASE B: DATA EXCHANGE */}
                              {oooFormAction === 'data_exchange' && (
                                <div className="space-y-3 pt-2 animate-in fade-in duration-150">
                                  
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                    <div className="w-28 shrink-0">
                                      <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-center text-[11px] font-mono font-medium text-slate-700">
                                        flow_token
                                      </div>
                                      <span className="text-[10px] text-slate-400 block text-center mt-0.5">(optional)</span>
                                    </div>

                                    <div className="relative flex-1 min-w-[180px] w-full sm:w-auto">
                                      <div
                                        onClick={() => {
                                          setShowTokenDropdown(!showTokenDropdown);
                                          setShowDataDropdown(false);
                                        }}
                                        className="flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-500 cursor-pointer hover:border-slate-400 shadow-2xs"
                                      >
                                        <div className="flex items-center gap-1.5 text-slate-400 truncate">
                                          <Search className="w-3.5 h-3.5 shrink-0" />
                                          <span className="text-slate-600 text-xs truncate">
                                            {tokenSearch || 'Enter flow token'}
                                          </span>
                                        </div>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      </div>

                                      {showTokenDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-30 p-2 space-y-1 text-xs animate-in fade-in">
                                          <input
                                            type="text"
                                            placeholder="Search token variable..."
                                            value={tokenSearch}
                                            onChange={(e) => setTokenSearch(e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs mb-1"
                                            autoFocus
                                          />
                                          <div className="max-h-36 overflow-y-auto space-y-1">
                                            {FLOW_TOKENS.filter(
                                              (t) =>
                                                t.label.toLowerCase().includes(tokenSearch.toLowerCase()) ||
                                                t.token.toLowerCase().includes(tokenSearch.toLowerCase())
                                            ).map((t) => (
                                              <div
                                                key={t.id}
                                                onClick={() => {
                                                  setOooFlowToken(t.token);
                                                  setTokenSearch(t.label);
                                                  setShowTokenDropdown(false);
                                                }}
                                                className="p-1.5 rounded hover:bg-emerald-50 cursor-pointer flex items-center justify-between"
                                              >
                                                <span className="font-mono text-emerald-800 font-bold text-[11px]">{t.token}</span>
                                                <span className="text-[10px] text-slate-500">{t.label}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex-1 w-full sm:w-auto">
                                      <input
                                        type="text"
                                        value={oooFlowToken}
                                        onChange={(e) => setOooFlowToken(e.target.value)}
                                        placeholder="Enter flow data"
                                        className="w-full px-3 py-1.5 bg-white border border-slate-400 focus:border-slate-600 rounded text-xs font-mono text-slate-800 outline-none"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                    <div className="w-28 shrink-0">
                                      <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-center text-[11px] font-mono font-medium text-slate-700">
                                        flow_data
                                      </div>
                                      <span className="text-[9px] text-slate-400 block text-center mt-0.5 leading-tight">
                                        (optional, only JSON values allowed)
                                      </span>
                                    </div>

                                    <div className="relative flex-1 min-w-[180px] w-full sm:w-auto">
                                      <div
                                        onClick={() => {
                                          setShowDataDropdown(!showDataDropdown);
                                          setShowTokenDropdown(false);
                                        }}
                                        className="flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-500 cursor-pointer hover:border-slate-400 shadow-2xs"
                                      >
                                        <div className="flex items-center gap-1.5 text-slate-400 truncate">
                                          <Search className="w-3.5 h-3.5 shrink-0" />
                                          <span className="text-slate-600 text-xs truncate">
                                            {dataSearch || 'Enter flow token'}
                                          </span>
                                        </div>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      </div>

                                      {showDataDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-30 p-2 space-y-1 text-xs animate-in fade-in">
                                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                                            Select JSON Preset:
                                          </div>
                                          <div className="max-h-36 overflow-y-auto space-y-1">
                                            {FLOW_DATA_PRESETS.map((p) => (
                                              <div
                                                key={p.id}
                                                onClick={() => {
                                                  setOooFlowData(p.value);
                                                  setDataSearch(p.label);
                                                  setShowDataDropdown(false);
                                                }}
                                                className="p-1.5 rounded hover:bg-emerald-50 cursor-pointer flex items-center justify-between"
                                              >
                                                <span className="font-semibold text-slate-800 text-[11px]">{p.label}</span>
                                                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100 px-1 rounded">JSON</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex-1 w-full sm:w-auto">
                                      <input
                                        type="text"
                                        value={oooFlowData}
                                        onChange={(e) => setOooFlowData(e.target.value)}
                                        placeholder="{}"
                                        className="w-full px-3 py-1.5 bg-white border border-slate-400 focus:border-slate-600 rounded text-xs font-mono text-slate-800 outline-none"
                                      />
                                    </div>
                                  </div>

                                  <div className="pt-2 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={handleSaveFormSubSettings}
                                      className="px-6 py-1.5 rounded bg-[#008069] hover:bg-[#075e54] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                                    >
                                      <Save className="w-3.5 h-3.5" />
                                      <span>Save</span>
                                    </button>
                                  </div>

                                </div>
                              )}

                            </div>

                          </div>
                        )}
                      </div>

                      {/* Option 4: None */}
                      <div>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="oooActionType"
                            value="none"
                            checked={oooActionType === 'none'}
                            onChange={(e) => setOooActionType(e.target.value)}
                            className="w-4 h-4 accent-emerald-700 cursor-pointer"
                          />
                          <span className="font-semibold text-slate-900">None</span>
                        </label>
                      </div>

                    </div>

                    {/* 5. Bottom Action Controls */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleToggleOooStatus}
                        className={`px-5 py-1.5 rounded-md text-white font-bold text-xs transition-colors cursor-pointer shadow-xs ${
                          oooEnabled
                            ? 'bg-[#ff4d4f] hover:bg-[#d9363e]'
                            : 'bg-[#008069] hover:bg-[#075e54]'
                        }`}
                      >
                        {oooEnabled ? 'Disable' : 'Enable'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveOutOfOffice()}
                        className="px-5 py-1.5 rounded-md bg-[#0d3b30] hover:bg-[#154d3f] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>

              {/* ========================================================================= */}
              {/* CARD 2: WELCOME MESSAGE */}
              {/* ========================================================================= */}
              <div
                className={`rounded-xl overflow-hidden transition-all duration-200 ${
                  expandedCard === 'welcome'
                    ? 'border-2 border-emerald-600 shadow-sm bg-white'
                    : 'border border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Summary Header */}
                <div
                  onClick={() => setExpandedCard(expandedCard === 'welcome' ? null : 'welcome')}
                  className="p-4 space-y-2 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900">Welcome Message</h3>
                      {expandedCard === 'welcome' && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Editing
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        welcomeEnabled ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {welcomeEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Configure Greeting message to be triggered when new customers reach out to your business for the first time or existing customers reach out after a period of 24 hours.
                  </p>
                </div>

                {/* Sent Counter Bar */}
                <div
                  onClick={() => setExpandedCard(expandedCard === 'welcome' ? null : 'welcome')}
                  className="bg-[#eef9f5] border-t border-emerald-100/70 py-2 px-4 text-center text-xs text-emerald-800 font-medium cursor-pointer hover:bg-emerald-100/60 transition-colors flex items-center justify-center gap-2"
                >
                  <span>{settings?.welcome_message?.sentCount || 0} Welcome Messages sent</span>
                </div>

                {/* EXPANDED WELCOME MESSAGE SECTION */}
                {expandedCard === 'welcome' && (
                  <div className="border-t border-emerald-600 p-5 md:p-6 bg-white space-y-5 animate-in fade-in duration-150">
                    
                    {/* Header with Title and Edit Pencil */}
                    <div className="flex items-center gap-2 text-slate-900">
                      <Mail className="w-4 h-4 text-slate-700" />
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <span>{welcomeTitle}</span>
                        <button
                          type="button"
                          onClick={() => setIsGreetingFlowModalOpen(true)}
                          className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Configure Greeting Flow"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Disable / Enable Button */}
                    <div>
                      <button
                        type="button"
                        onClick={handleToggleWelcomeStatus}
                        className={`px-6 py-2 rounded-md text-white font-bold text-xs transition-colors cursor-pointer shadow-xs ${
                          welcomeEnabled
                            ? 'bg-[#ff4d4f] hover:bg-[#d9363e]'
                            : 'bg-[#008069] hover:bg-[#075e54]'
                        }`}
                      >
                        {welcomeEnabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>

                    {/* Send along with OOO reply container */}
                    <div className="border border-slate-300 rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white text-xs">
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <span className="font-medium">Send along with OOO reply during OOO hours?</span>
                        <div className="relative group inline-block">
                          <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-56 p-2 bg-slate-900 text-white text-[10px] rounded shadow-lg z-20">
                            When enabled, customers messaging outside working hours will receive both the Welcome Greeting and Out of Office message.
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="welcomeSendWithOoo"
                            checked={welcomeSendWithOoo === true}
                            onChange={() => handleToggleSendWithOoo(true)}
                            className="w-3.5 h-3.5 accent-emerald-700 cursor-pointer"
                          />
                          <span className="font-medium text-slate-800">Yes</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="welcomeSendWithOoo"
                            checked={welcomeSendWithOoo === false}
                            onChange={() => handleToggleSendWithOoo(false)}
                            className="w-3.5 h-3.5 accent-emerald-700 cursor-pointer"
                          />
                          <span className="font-medium text-slate-800">No</span>
                        </label>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* ========================================================================= */}
              {/* CARD 3: DELAYED RESPONSE MESSAGE (EXACT MATCHING 3RD SCREENSHOT) */}
              {/* ========================================================================= */}
              <div
                className={`rounded-xl overflow-hidden transition-all duration-200 ${
                  expandedCard === 'delayed'
                    ? 'border-2 border-emerald-600 shadow-sm bg-white'
                    : 'border border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Summary Header */}
                <div
                  onClick={() => setExpandedCard(expandedCard === 'delayed' ? null : 'delayed')}
                  className="p-4 space-y-2 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900">Delayed Response Message</h3>
                      {expandedCard === 'delayed' && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Editing
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        delayedEnabled ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {delayedEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Configure Auto Replies when you are delayed in responding to customer messages. Setup your delay time and the message to be triggered.
                  </p>
                </div>

                {/* Sent Counter Bar */}
                <div
                  onClick={() => setExpandedCard(expandedCard === 'delayed' ? null : 'delayed')}
                  className="bg-[#eef9f5] border-t border-emerald-100/70 py-2 px-4 text-center text-xs text-emerald-800 font-medium cursor-pointer hover:bg-emerald-100/60 transition-colors flex items-center justify-center gap-2"
                >
                  <span>{settings?.delayed_response?.sentCount || 0} Delayed Messages sent</span>
                </div>

                {/* EXPANDED DELAYED RESPONSE SECTION (3rd Screenshot Exact Match) */}
                {expandedCard === 'delayed' && (
                  <div className="border-t border-emerald-600 p-5 md:p-6 bg-white space-y-5 animate-in fade-in duration-150">
                    
                    {/* 1. Delayed Response Time Selector (Hours & Minutes) */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-slate-800 text-xs font-bold">
                        <span>Delayed Response Time</span>
                        <div className="relative group inline-block">
                          <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                          <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block w-56 p-2 bg-slate-900 text-white text-[10px] font-normal rounded shadow-lg z-20">
                            Set the duration of customer inactivity or agent delay after which this auto reply triggers.
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                        {/* Hours selector */}
                        <div className="flex items-center gap-1.5">
                          <select
                            value={delayedHours}
                            onChange={(e) => setDelayedHours(Number(e.target.value))}
                            className="px-2.5 py-1 bg-white border border-slate-400 rounded text-xs font-medium cursor-pointer focus:border-slate-600 outline-none"
                          >
                            {[0, 1, 2, 3, 4, 5, 6, 8, 12, 24].map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                          <span>Hrs</span>
                        </div>

                        {/* Minutes selector */}
                        <div className="flex items-center gap-1.5">
                          <select
                            value={delayedMinutes}
                            onChange={(e) => setDelayedMinutes(Number(e.target.value))}
                            className="px-2.5 py-1 bg-white border border-slate-400 rounded text-xs font-medium cursor-pointer focus:border-slate-600 outline-none"
                          >
                            {[1, 2, 5, 10, 15, 20, 30, 45, 60].map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                          <span>Mins</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Message Title and Textarea */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2 text-slate-900">
                        <Mail className="w-4 h-4 text-slate-700" />
                        {isEditingDelayedTitle ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={delayedTitle}
                              onChange={(e) => setDelayedTitle(e.target.value)}
                              className="px-2 py-1 text-xs font-bold border border-slate-300 rounded"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => setIsEditingDelayedTitle(false)}
                              className="p-1 rounded text-emerald-700 hover:bg-emerald-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <span>{delayedTitle}</span>
                            <button
                              type="button"
                              onClick={() => setIsEditingDelayedTitle(true)}
                              className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Edit Title"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      <textarea
                        rows={7}
                        value={delayedMessage}
                        onChange={(e) => setDelayedMessage(e.target.value)}
                        placeholder="Enter your delayed response message..."
                        className="w-full p-3.5 rounded-lg border border-slate-400 focus:border-slate-600 focus:ring-1 focus:ring-slate-500 outline-none text-xs text-slate-800 leading-relaxed resize-y font-normal bg-white shadow-2xs"
                      />
                    </div>

                    {/* 3. Yellow Notice Banner */}
                    <div className="bg-[#fff9e6] border border-[#ffe58f] text-[#ad6800] p-3 rounded-lg text-xs flex items-center gap-2">
                      <span className="text-amber-500 font-bold">💡</span>
                      <span>
                        Click{' '}
                        <Link
                          to="/automation/interactive-list"
                          className="text-blue-600 underline font-semibold hover:text-blue-800"
                        >
                          here
                        </Link>{' '}
                        to enable Interaktive List for auto replies
                      </span>
                    </div>

                    {/* 4. Action Radio Options (Matching Interakt Screenshot 3) */}
                    <div className="space-y-3.5 pt-1 text-xs text-slate-800">
                      
                      {/* Option 1: Product Collections */}
                      <div className="space-y-1">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="delayedActionType"
                            value="product_collections"
                            checked={delayedActionType === 'product_collections'}
                            onChange={(e) => setDelayedActionType(e.target.value)}
                            className="w-4 h-4 mt-0.5 accent-emerald-700 cursor-pointer"
                          />
                          <div>
                            <span className="font-semibold text-slate-900">
                              Add list of Product Collections (
                              <Link
                                to="/commerce/catalog"
                                className="text-blue-600 underline font-semibold hover:text-blue-800"
                              >
                                set here
                              </Link>
                              ) to the Delayed Message
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              If customer selects a collection, corresponding Product Catalog will be sent.
                            </p>
                          </div>
                        </label>

                        {delayedActionType === 'product_collections' && (
                          <div className="ml-6.5 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 max-w-md space-y-2">
                            <label className="block text-[11px] font-bold text-slate-700">
                              Select Product Collection:
                            </label>
                            <select
                              value={delayedCollectionId}
                              onChange={(e) => setDelayedCollectionId(e.target.value)}
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
                      </div>

                      {/* Option 2: Enable Interaktive List Message */}
                      <div>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="delayedActionType"
                            value="interactive_list"
                            checked={delayedActionType === 'interactive_list'}
                            onChange={(e) => setDelayedActionType(e.target.value)}
                            className="w-4 h-4 accent-emerald-700 cursor-pointer"
                          />
                          <span className="font-semibold text-slate-900">
                            Enable Interaktive List Message
                          </span>
                        </label>
                      </div>

                      {/* Option 3: Add WhatsApp Form */}
                      <div className="space-y-3">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="delayedActionType"
                            value="whatsapp_form"
                            checked={delayedActionType === 'whatsapp_form'}
                            onChange={(e) => setDelayedActionType(e.target.value)}
                            className="w-4 h-4 accent-emerald-700 cursor-pointer"
                          />
                          <span className="font-semibold text-slate-900">
                            Add WhatsApp Form
                          </span>
                        </label>

                        {/* WhatsApp Form Configuration Sub-panel for Delayed Message */}
                        {delayedActionType === 'whatsapp_form' && (
                          <div className="ml-6.5 p-4 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs animate-in fade-in duration-150">
                            
                            <div className="space-y-1">
                              <label className="block text-[11px] font-bold text-slate-700">
                                Form Button Text
                              </label>
                              <input
                                type="text"
                                value={delayedFormButtonText}
                                onChange={(e) => setDelayedFormButtonText(e.target.value)}
                                placeholder="Enter text for the button"
                                className="w-full p-2 bg-white rounded border border-slate-400 focus:border-slate-600 text-xs font-medium outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[11px] font-bold text-slate-700">
                                Select Form
                              </label>
                              <select
                                value={delayedSelectedFormId}
                                onChange={(e) => setDelayedSelectedFormId(e.target.value)}
                                className="w-full p-2 bg-white rounded border border-slate-400 focus:border-slate-600 text-xs font-medium cursor-pointer outline-none"
                              >
                                <option value="">Select Form Name</option>
                                {availableForms.map((form) => (
                                  <option key={form.id} value={form.id}>
                                    {form.title}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-3 pt-1">
                              <label className="block text-[11px] font-bold text-slate-700">
                                Action on Opening Form
                              </label>
                              
                              <div className="flex items-center gap-6 text-xs">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="delayedFormAction"
                                    value="first_screen"
                                    checked={delayedFormAction === 'first_screen'}
                                    onChange={() => setDelayedFormAction('first_screen')}
                                    className="w-3.5 h-3.5 accent-emerald-700 cursor-pointer"
                                  />
                                  <span className="font-medium text-slate-800">Navigate to first screen</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="delayedFormAction"
                                    value="data_exchange"
                                    checked={delayedFormAction === 'data_exchange'}
                                    onChange={() => setDelayedFormAction('data_exchange')}
                                    className="w-3.5 h-3.5 accent-emerald-700 cursor-pointer"
                                  />
                                  <span className="font-medium text-slate-800">Data Exchange</span>
                                </label>
                              </div>

                              {/* CASE A: NAVIGATE TO FIRST SCREEN */}
                              {delayedFormAction === 'first_screen' && (
                                <div className="pt-2 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={handleSaveDelayedFormSubSettings}
                                    className="px-6 py-1.5 rounded bg-[#008069] hover:bg-[#075e54] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Save</span>
                                  </button>
                                </div>
                              )}

                              {/* CASE B: DATA EXCHANGE */}
                              {delayedFormAction === 'data_exchange' && (
                                <div className="space-y-3 pt-2 animate-in fade-in duration-150">
                                  
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                    <div className="w-28 shrink-0">
                                      <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-center text-[11px] font-mono font-medium text-slate-700">
                                        flow_token
                                      </div>
                                      <span className="text-[10px] text-slate-400 block text-center mt-0.5">(optional)</span>
                                    </div>

                                    <div className="relative flex-1 min-w-[180px] w-full sm:w-auto">
                                      <div
                                        onClick={() => {
                                          setShowDelayedTokenDropdown(!showDelayedTokenDropdown);
                                          setShowDelayedDataDropdown(false);
                                        }}
                                        className="flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-500 cursor-pointer hover:border-slate-400 shadow-2xs"
                                      >
                                        <div className="flex items-center gap-1.5 text-slate-400 truncate">
                                          <Search className="w-3.5 h-3.5 shrink-0" />
                                          <span className="text-slate-600 text-xs truncate">
                                            {delayedTokenSearch || 'Enter flow token'}
                                          </span>
                                        </div>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      </div>

                                      {showDelayedTokenDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-30 p-2 space-y-1 text-xs animate-in fade-in">
                                          <input
                                            type="text"
                                            placeholder="Search token variable..."
                                            value={delayedTokenSearch}
                                            onChange={(e) => setDelayedTokenSearch(e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs mb-1"
                                            autoFocus
                                          />
                                          <div className="max-h-36 overflow-y-auto space-y-1">
                                            {FLOW_TOKENS.filter(
                                              (t) =>
                                                t.label.toLowerCase().includes(delayedTokenSearch.toLowerCase()) ||
                                                t.token.toLowerCase().includes(delayedTokenSearch.toLowerCase())
                                            ).map((t) => (
                                              <div
                                                key={t.id}
                                                onClick={() => {
                                                  setDelayedFlowToken(t.token);
                                                  setDelayedTokenSearch(t.label);
                                                  setShowDelayedTokenDropdown(false);
                                                }}
                                                className="p-1.5 rounded hover:bg-emerald-50 cursor-pointer flex items-center justify-between"
                                              >
                                                <span className="font-mono text-emerald-800 font-bold text-[11px]">{t.token}</span>
                                                <span className="text-[10px] text-slate-500">{t.label}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex-1 w-full sm:w-auto">
                                      <input
                                        type="text"
                                        value={delayedFlowToken}
                                        onChange={(e) => setDelayedFlowToken(e.target.value)}
                                        placeholder="Enter flow data"
                                        className="w-full px-3 py-1.5 bg-white border border-slate-400 focus:border-slate-600 rounded text-xs font-mono text-slate-800 outline-none"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                    <div className="w-28 shrink-0">
                                      <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-center text-[11px] font-mono font-medium text-slate-700">
                                        flow_data
                                      </div>
                                      <span className="text-[9px] text-slate-400 block text-center mt-0.5 leading-tight">
                                        (optional, only JSON values allowed)
                                      </span>
                                    </div>

                                    <div className="relative flex-1 min-w-[180px] w-full sm:w-auto">
                                      <div
                                        onClick={() => {
                                          setShowDelayedDataDropdown(!showDelayedDataDropdown);
                                          setShowDelayedTokenDropdown(false);
                                        }}
                                        className="flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-500 cursor-pointer hover:border-slate-400 shadow-2xs"
                                      >
                                        <div className="flex items-center gap-1.5 text-slate-400 truncate">
                                          <Search className="w-3.5 h-3.5 shrink-0" />
                                          <span className="text-slate-600 text-xs truncate">
                                            {delayedDataSearch || 'Enter flow token'}
                                          </span>
                                        </div>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      </div>

                                      {showDelayedDataDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-30 p-2 space-y-1 text-xs animate-in fade-in">
                                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                                            Select JSON Preset:
                                          </div>
                                          <div className="max-h-36 overflow-y-auto space-y-1">
                                            {FLOW_DATA_PRESETS.map((p) => (
                                              <div
                                                key={p.id}
                                                onClick={() => {
                                                  setDelayedFlowData(p.value);
                                                  setDelayedDataSearch(p.label);
                                                  setShowDelayedDataDropdown(false);
                                                }}
                                                className="p-1.5 rounded hover:bg-emerald-50 cursor-pointer flex items-center justify-between"
                                              >
                                                <span className="font-semibold text-slate-800 text-[11px]">{p.label}</span>
                                                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100 px-1 rounded">JSON</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex-1 w-full sm:w-auto">
                                      <input
                                        type="text"
                                        value={delayedFlowData}
                                        onChange={(e) => setDelayedFlowData(e.target.value)}
                                        placeholder="{}"
                                        className="w-full px-3 py-1.5 bg-white border border-slate-400 focus:border-slate-600 rounded text-xs font-mono text-slate-800 outline-none"
                                      />
                                    </div>
                                  </div>

                                  <div className="pt-2 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={handleSaveDelayedFormSubSettings}
                                      className="px-6 py-1.5 rounded bg-[#008069] hover:bg-[#075e54] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                                    >
                                      <Save className="w-3.5 h-3.5" />
                                      <span>Save</span>
                                    </button>
                                  </div>

                                </div>
                              )}

                            </div>

                          </div>
                        )}
                      </div>

                      {/* Option 4: None */}
                      <div>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="delayedActionType"
                            value="none"
                            checked={delayedActionType === 'none'}
                            onChange={(e) => setDelayedActionType(e.target.value)}
                            className="w-4 h-4 accent-emerald-700 cursor-pointer"
                          />
                          <span className="font-semibold text-slate-900">None</span>
                        </label>
                      </div>

                    </div>

                    {/* 5. Bottom Action Controls */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleToggleDelayedStatus}
                        className={`px-5 py-1.5 rounded-md text-white font-bold text-xs transition-colors cursor-pointer shadow-xs ${
                          delayedEnabled
                            ? 'bg-[#ff4d4f] hover:bg-[#d9363e]'
                            : 'bg-[#008069] hover:bg-[#075e54]'
                        }`}
                      >
                        {delayedEnabled ? 'Disable' : 'Enable'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveDelayed()}
                        className="px-5 py-1.5 rounded-md bg-[#0d3b30] hover:bg-[#154d3f] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: EDIT WORKING HOURS */}
      {/* ========================================================================= */}
      {isWorkingHoursModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0d3b30]" />
                Setup Your Working Hours
              </h3>
              <button
                type="button"
                onClick={() => setIsWorkingHoursModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Active Days of Week</label>
                <div className="flex flex-wrap gap-1.5">
                  {daysOfWeek.map((day) => {
                    const isSelected = workingDays.some((d) => d.startsWith(day));
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0d3b30] text-white font-bold shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0d3b30] outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-800">Enforce Out of Office Outside These Hours</span>
                <input
                  type="checkbox"
                  checked={isWorkingHoursEnabled}
                  onChange={(e) => setIsWorkingHoursEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#0d3b30] rounded-xs cursor-pointer"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsWorkingHoursModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveWorkingHours}
                className="px-4 py-1.5 rounded-lg bg-[#0d3b30] hover:bg-[#092b23] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Save Schedule
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

      {/* Greeting Flow Builder Modal */}
      {isGreetingFlowModalOpen && (
        <GreetingFlowModal
          isOpen={isGreetingFlowModalOpen}
          onClose={() => {
            setIsGreetingFlowModalOpen(false);
            loadSettings();
          }}
          currentFlow={settings?.welcome_message || { message: welcomeMessage }}
          onSaved={() => {
            setIsGreetingFlowModalOpen(false);
            showToast('Welcome Greeting Flow updated!');
            loadSettings();
          }}
          showToast={showToast}
        />
      )}

    </div>
  );
}
