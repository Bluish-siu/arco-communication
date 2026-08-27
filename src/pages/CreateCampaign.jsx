import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Check,
  Plus,
  Search,
  RefreshCw,
  Clock,
  Calendar,
  Layers,
  Users,
  Tag,
  Upload,
  FileText,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Video,
  MoreVertical,
  GripVertical,
  HelpCircle,
  Sparkles,
  Zap,
  Info,
  Radio,
  Sliders,
  Send,
  RotateCw,
  ExternalLink,
  Repeat,
  Megaphone,
} from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { campaignsService } from '../services/campaignsService';
import { segmentsService } from '../services/segmentsService';
import SaveSegmentModal from '../components/contacts/SaveSegmentModal';

// WhatsApp Contextual SVG Icon
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// 14 Exact Interakt Sample Templates in exact order
const EXACT_14_INTERAKT_SAMPLES = [
  {
    id: 'tmpl_sample_01',
    name: 'Promotional Offer 01',
    category: 'MARKETING',
    language: 'en_US',
    headerText: 'Exciting Offers Just for You!',
    bodyText: '🎉 Enjoy exclusive offers at ARCO!\nGet the best experiences with our services. Don\'t miss out!\n\nBook now to avail these deals! 🚀\n\nFor more details, click below:\n📞 Contact us: +919920858396',
    footerText: 'Reply STOP to opt-out',
    buttons: [{ type: 'URL', text: 'View More' }, { type: 'QUICK_REPLY', text: 'STOP' }],
  },
  {
    id: 'tmpl_sample_02',
    name: 'Transactional Confirmation 02',
    category: 'UTILITY',
    language: 'en_US',
    headerText: 'Order Confirmed',
    bodyText: 'Your order with ARCO has been confirmed!\n\nOrder Details:\n- Order ID: {{1}}\n- Delivery Date: {{2}}\n- Amount Paid: {{3}}',
    footerText: 'Thank you for choosing ARCO',
    buttons: [{ type: 'URL', text: 'Track Order' }, { type: 'PHONE_NUMBER', text: 'Customer Support' }],
  },
  {
    id: 'tmpl_sample_03',
    name: 'Service Alert 03',
    category: 'UTILITY',
    language: 'en_US',
    headerText: 'System Service Notice',
    bodyText: 'Dear {{1}}, our technical team will be performing scheduled maintenance on {{2}} between {{3}} and {{4}}. Services will continue with minimal disruption.',
    footerText: 'ARCO Engineering Operations',
    buttons: [{ type: 'URL', text: 'Status Page' }],
  },
  {
    id: 'tmpl_sample_04',
    name: 'Lead Qualification 04',
    category: 'UTILITY',
    language: 'en_US',
    headerText: 'Quick Inquiry Follow-up',
    bodyText: 'Hi {{1}}, thanks for showing interest in ARCO WhatsApp Commerce! Which feature are you most excited to explore for your business?',
    footerText: 'Select an option below',
    buttons: [{ type: 'QUICK_REPLY', text: 'Catalog & Checkout' }, { type: 'QUICK_REPLY', text: 'Broadcast Campaigns' }],
  },
  {
    id: 'tmpl_sample_05',
    name: 'Informative Update 05',
    category: 'UTILITY',
    language: 'en_US',
    headerText: 'Platform Feature Update',
    bodyText: 'Hello {{1}}, we have released new platform updates for your workspace. You can now track live read rates and click conversions in real time.',
    footerText: 'ARCO Product Updates',
    buttons: [{ type: 'URL', text: "See What's New" }],
  },
  {
    id: 'tmpl_sample_06',
    name: 'Occasion Special 06',
    category: 'MARKETING',
    language: 'en_US',
    headerText: '🎉 Celebrate with Exclusive Savings!',
    bodyText: "Hi {{1}},\n\nTo make this celebration extra special, we're offering a flat 30% discount on all premium services. Use promo code CELEBRATE30 at checkout.",
    footerText: 'Valid till midnight tonight',
    buttons: [{ type: 'URL', text: 'Claim Special Offer' }, { type: 'QUICK_REPLY', text: 'Remind Me Later' }],
  },
  {
    id: 'tmpl_sample_07',
    name: 'Promotional Discount 07',
    category: 'MARKETING',
    language: 'en_US',
    headerText: 'Special Discount Offer',
    bodyText: "🎉 We appreciate your loyalty!\n\nEnjoy a special discount of {{1}}% off on your next purchase with code {{2}}. Don't miss out on this opportunity!\n\nShop now!",
    footerText: 'Valid for 48 hours only',
    buttons: [{ type: 'URL', text: 'Claim Discount' }],
  },
  {
    id: 'tmpl_sample_08',
    name: 'Service Alert 08',
    category: 'UTILITY',
    language: 'en_US',
    headerText: 'Security Alert Notice',
    bodyText: 'Security Alert: A new login was detected for your account {{1}} from IP {{2}} on {{3}}. If this was not you, please secure your account immediately.',
    footerText: 'ARCO Security Operations Center',
    buttons: [{ type: 'URL', text: 'Secure Account' }],
  },
  {
    id: 'tmpl_sample_09',
    name: 'Informative Tips 09',
    category: 'UTILITY',
    language: 'en_US',
    headerText: 'Pro Tip: Boost WhatsApp Conversions',
    bodyText: 'Hi {{1}}, did you know that personalized broadcasts achieve 3x higher response rates? Use dynamic custom attributes in your next campaign.',
    footerText: 'ARCO Growth Insights',
    buttons: [{ type: 'URL', text: 'Read Guide' }],
  },
  {
    id: 'tmpl_sample_10',
    name: 'Lead Qualification 10',
    category: 'UTILITY',
    language: 'en_US',
    headerText: 'Enterprise Demo Confirmation',
    bodyText: 'Hi {{1}}, we received your enterprise demo request for {{2}}. Our solution architect is ready to assist you. When is the best time for a quick 15-min call?',
    footerText: 'ARCO Sales Team',
    buttons: [{ type: 'URL', text: 'Book Demo Slot' }, { type: 'QUICK_REPLY', text: 'Call Me Today' }],
  },
  {
    id: 'tmpl_sample_11',
    name: 'Occasion Reminder 11',
    category: 'MARKETING',
    language: 'en_US',
    headerText: '✨ Wishing You a Happy Diwali!',
    bodyText: 'Dear {{1}}, may this festive season bring prosperity and joy to you and your family! Celebrate with our festive gift hamper.',
    footerText: 'Festive Greetings from ARCO',
    buttons: [{ type: 'URL', text: 'View Gift Hampers' }],
  },
  {
    id: 'tmpl_sample_12',
    name: 'Promotional Event 12',
    category: 'MARKETING',
    language: 'en_US',
    headerText: '🌟 Special Invitation Inside',
    bodyText: 'Hi {{1}},\n\nYou are cordially invited to our exclusive customer summit on {{2}} at {{3}}.\nReserve your VIP pass today!',
    footerText: 'Limited seats available',
    buttons: [{ type: 'URL', text: 'Reserve VIP Pass' }],
  },
  {
    id: 'tmpl_sample_13',
    name: 'Informative Service 13',
    category: 'UTILITY',
    language: 'en_US',
    headerText: 'Monthly Invoice Available',
    bodyText: 'Hello {{1}}, your monthly subscription invoice #{{2}} for the amount {{3}} is ready for download.',
    footerText: 'ARCO Billing',
    buttons: [{ type: 'URL', text: 'Download PDF' }],
  },
  {
    id: 'tmpl_sample_14',
    name: 'Transactional Ticket 14',
    category: 'UTILITY',
    language: 'en_US',
    headerText: 'Support Ticket Update',
    bodyText: 'Hi {{1}}, your support ticket #{{2}} regarding "{{3}}" has been marked as RESOLVED by our engineering team.',
    footerText: 'ARCO Customer Care',
    buttons: [{ type: 'QUICK_REPLY', text: 'Reopen Ticket' }, { type: 'QUICK_REPLY', text: 'Rate Support 5★' }],
  },
];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isScratch = searchParams.get('mode') === 'scratch' || searchParams.get('scratch') === 'true';
  const templateIdParam = searchParams.get('templateId');

  // Screen Mode: 'template_selection' (SCREEN 1) | 'builder' (SCREEN 2)
  const [screenMode, setScreenMode] = useState(isScratch || templateIdParam ? 'builder' : 'template_selection');

  // Campaign Header State
  const [campaignName, setCampaignName] = useState(isScratch ? 'New WhatsApp Broadcast' : 'Untitled Campaign');
  const [campaignCategory, setCampaignCategory] = useState('Marketing');
  const [campaignDescription, setCampaignDescription] = useState('');

  // Active Expanded Accordion Step (Default: 1)
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Step 1: Campaign Type ('onetime' | 'ongoing')
  const [campaignType, setCampaignType] = useState(
    searchParams.get('type') === 'ongoing' ? 'ongoing' : 'onetime'
  );

  // Step 2: Message Template
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    if (isScratch) {
      return {
        id: `custom_${Date.now()}`,
        name: 'Custom WhatsApp Campaign',
        category: 'MARKETING',
        language: 'en_US',
        headerText: 'Special Announcement',
        bodyText: 'Hi {{1}}, thank you for choosing ARCO! Here is your exclusive update: {{2}}.',
        footerText: 'ARCO Communication',
        buttons: [{ type: 'QUICK_REPLY', text: 'Talk to Support' }],
      };
    }
    if (templateIdParam) {
      const found = EXACT_14_INTERAKT_SAMPLES.find((t) => t.id === templateIdParam);
      if (found) return found;
    }
    return EXACT_14_INTERAKT_SAMPLES[0];
  });
  const [templateTab, setTemplateTab] = useState('active'); // 'active' (Meta Approved) | 'samples'
  const [searchTheme, setSearchTheme] = useState('');
  const [sampleTemplates, setSampleTemplates] = useState(EXACT_14_INTERAKT_SAMPLES);
  const [activeTemplates, setActiveTemplates] = useState([]);
  const [metaApprovedTemplates, setMetaApprovedTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [variableValues, setVariableValues] = useState({});

  // Dynamically detect variable placeholders {{1}}, {{2}}, etc. in selected template body
  const detectedVariables = React.useMemo(() => {
    if (!selectedTemplate) return [];
    if (Array.isArray(selectedTemplate.bodyVariables) && selectedTemplate.bodyVariables.length > 0) {
      return selectedTemplate.bodyVariables;
    }
    const text = selectedTemplate.bodyText || selectedTemplate.body || '';
    const matches = text.match(/\{\{(\d+)\}\}/g);
    if (!matches) return [];
    const vars = [];
    matches.forEach((m) => {
      const num = m.replace(/\D/g, '');
      if (!vars.includes(num)) vars.push(num);
    });
    return vars.sort((a, b) => Number(a) - Number(b));
  }, [selectedTemplate]);

  // Step 3: Audience
  const [audienceType, setAudienceType] = useState('segment'); // 'csv' | 'manual' | 'segment' | 'tag' | 'list'
  const [savedSegments, setSavedSegments] = useState([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState('');
  const [saveSegmentModalOpen, setSaveSegmentModalOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [manualPhoneNumbers, setManualPhoneNumbers] = useState('');
  const [csvFileName, setCsvFileName] = useState('');
  const [rawCsvRows, setRawCsvRows] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [columnMappingModalOpen, setColumnMappingModalOpen] = useState(false);
  const [columnMappings, setColumnMappings] = useState({});
  const [importedCsvContacts, setImportedCsvContacts] = useState([]);
  const [viewContactsModalOpen, setViewContactsModalOpen] = useState(false);
  const [contactsFilterTab, setContactsFilterTab] = useState('all');
  const [csvStats, setCsvStats] = useState({ total: 0, eligible: 0, invalid: 0, optedIn: 0 });
  const [whatsappOptedOnly, setWhatsappOptedOnly] = useState(true);
  const [audienceReach, setAudienceReach] = useState(1334);

  // Helper to parse CSV text
  const parseCsvText = (text) => {
    const lines = text.split(/\r\n|\n|\r/).filter((line) => line.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    const parseLine = (line) => {
      const result = [];
      let current = '';
      let insideQuote = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          result.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map((line) => {
      const vals = parseLine(line);
      const rowObj = {};
      headers.forEach((h, idx) => {
        rowObj[h] = vals[idx] !== undefined ? vals[idx] : '';
      });
      return rowObj;
    });

    return { headers, rows };
  };

  const normalizeClientPhone = ({ fullPhone, phone, countryCode }) => {
    const cleanFull = fullPhone ? String(fullPhone).trim() : '';
    const cleanPhone = phone ? String(phone).trim() : '';
    const cleanCc = countryCode ? String(countryCode).replace(/\D/g, '') : '91';

    // Scientific notation protection (e.g. 9.19748E+11)
    if (/[eE][+-]?\d+/.test(cleanFull) || /[eE][+-]?\d+/.test(cleanPhone)) {
      return {
        isValid: false,
        normalizedPhone: cleanFull || cleanPhone,
        display: cleanFull || cleanPhone,
        reason: 'Corrupted phone format: scientific notation detected (e.g. 9.19748E+11). Please format phone numbers as plain text in your CSV.',
      };
    }

    if (cleanFull) {
      const digits = cleanFull.replace(/\D/g, '');
      if (digits.length >= 9 && digits.length <= 15) {
        return { isValid: true, normalizedPhone: digits, display: `+${digits}` };
      }
    }

    if (cleanPhone) {
      let digits = cleanPhone.replace(/\D/g, '');
      if (cleanCc) {
        if (digits.startsWith(cleanCc) && digits.length >= cleanCc.length + 8) {
          return { isValid: true, normalizedPhone: digits, display: `+${digits}` };
        }
        const combined = `${cleanCc}${digits}`;
        if (combined.length >= 9 && combined.length <= 15) {
          return { isValid: true, normalizedPhone: combined, display: `+${combined}` };
        }
      }
      if (digits.length === 10 && /^[6-9]/.test(digits)) {
        return { isValid: true, normalizedPhone: `91${digits}`, display: `+91 ${digits}` };
      }
      if (digits.length >= 9 && digits.length <= 15) {
        return { isValid: true, normalizedPhone: digits, display: `+${digits}` };
      }
    }

    return { isValid: false, normalizedPhone: cleanFull || cleanPhone, display: cleanFull || cleanPhone, reason: 'Invalid phone format (must be 9-15 digits with country code)' };
  };

  const isOptedIn = (val) => {
    if (val === true) return true;
    if (val === false || val === null || val === undefined) return false;
    const str = String(val).trim().toLowerCase();
    return ['true', '1', 'yes', 'y', 'opted', 'opt-in', 'opted-in'].includes(str);
  };

  const handleCsvFileUpload = (file) => {
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const { headers, rows } = parseCsvText(text);
        if (headers.length === 0 || rows.length === 0) {
          showToast('CSV file appears to be empty or missing headers', 'error');
          return;
        }
        setCsvHeaders(headers);
        setRawCsvRows(rows);

        // Auto-guess column mappings based on headers
        const initialMap = {};
        headers.forEach((h) => {
          const lower = h.toLowerCase().trim();
          if (lower === 'full phone number' || lower === 'full phone' || lower === 'full_phone' || lower === 'mobile number (with country code)') {
            initialMap[h] = 'Full Phone Number';
          } else if (lower.includes('phone') || lower.includes('mobile') || lower.includes('contact')) {
            initialMap[h] = 'Phone Number';
          } else if (lower.includes('country') || lower.includes('code') || lower === 'cc') {
            initialMap[h] = 'Country Code';
          } else if (lower.includes('name')) {
            initialMap[h] = 'Name';
          } else if (lower.includes('email')) {
            initialMap[h] = 'Email';
          } else if (lower.includes('opted') || lower.includes('opt in') || lower.includes('opt-in') || lower.includes('whatsapp')) {
            initialMap[h] = 'WhatsApp Opted';
          } else {
            initialMap[h] = h; // Custom attribute
          }
        });
        setColumnMappings(initialMap);
        setColumnMappingModalOpen(true);
      } catch (err) {
        showToast('Failed to parse CSV file: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmColumnMapping = () => {
    let eligible = 0;
    let invalid = 0;
    let optedInTotal = 0;

    const processed = rawCsvRows.map((row, idx) => {
      let nameVal = '';
      let fullPhoneVal = '';
      let phoneVal = '';
      let countryCodeVal = '91';
      let emailVal = '';
      let optedVal = true;

      Object.entries(columnMappings).forEach(([colHeader, mappedTarget]) => {
        const val = row[colHeader];
        if (mappedTarget === 'Name') nameVal = val;
        else if (mappedTarget === 'Full Phone Number') fullPhoneVal = val;
        else if (mappedTarget === 'Phone Number') phoneVal = val;
        else if (mappedTarget === 'Country Code') countryCodeVal = val;
        else if (mappedTarget === 'Email') emailVal = val;
        else if (mappedTarget === 'WhatsApp Opted') optedVal = val;
      });

      const opted = isOptedIn(optedVal);
      if (opted) optedInTotal++;

      const phoneCheck = normalizeClientPhone({ fullPhone: fullPhoneVal, phone: phoneVal, countryCode: countryCodeVal });

      let status = 'Eligible';
      let reason = '';
      if (!phoneCheck.isValid) {
        status = 'Invalid';
        reason = phoneCheck.reason || 'Invalid phone';
        invalid++;
      } else if (whatsappOptedOnly && !opted) {
        status = 'Opted Out';
        reason = 'Customer not WhatsApp opted-in';
        invalid++;
      } else {
        eligible++;
      }

      return {
        id: `csv_row_${idx}`,
        name: nameVal || row.Name || `Customer ${idx + 1}`,
        phone: phoneCheck.normalizedPhone,
        displayPhone: phoneCheck.display,
        email: emailVal || row.Email || '',
        countryCode: countryCodeVal,
        whatsappOpted: opted,
        status,
        reason,
        raw: row,
      };
    });

    setImportedCsvContacts(processed);
    setCsvStats({
      total: rawCsvRows.length,
      eligible,
      invalid,
      optedIn: optedInTotal,
    });
    setAudienceReach(eligible);
    setColumnMappingModalOpen(false);
    showToast(`Mapped ${rawCsvRows.length} contacts (${eligible} eligible recipients)`, 'success');
  };

  // Step 4: Schedule
  const [scheduleMode, setScheduleMode] = useState('now'); // 'now' | 'custom'
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [scheduleTimezone, setScheduleTimezone] = useState('Asia/Kolkata');
  const [recurringFrequency, setRecurringFrequency] = useState('Daily');

  // Step 5: Advanced Reply Flows
  const [replyFlowOptOut, setReplyFlowOptOut] = useState(false);
  const [replyFlowProducts, setReplyFlowProducts] = useState(false);
  const [replyFlowInteractive, setReplyFlowInteractive] = useState(false);
  const [replyFlowCustom, setReplyFlowCustom] = useState(false);
  const [replyFlowWorkflow, setReplyFlowWorkflow] = useState(false);

  // Step 6: Retries
  const [activateRetries, setActivateRetries] = useState(true);

  // Step 7: Conversion Tracking
  const [trackUtm, setTrackUtm] = useState(false);
  const [trackCustomEvents, setTrackCustomEvents] = useState(false);
  const [conversionEvent, setConversionEvent] = useState('places_order'); // 'sends_cart' | 'places_order' | 'custom'
  const [conversionDeadlineVal, setConversionDeadlineVal] = useState(24);
  const [conversionDeadlineUnit, setConversionDeadlineUnit] = useState('Hours');

  // Step 8: Fallback Channels
  const [fallbackChannels, setFallbackChannels] = useState([
    { id: 'rcs', name: 'RCS (First Fallback Channel)', enabled: true },
    { id: 'sms', name: 'SMS (Second Fallback Channel)', enabled: false },
  ]);

  // Phone Mockup OS Selector
  const [phoneOs, setPhoneOs] = useState('android'); // 'android' | 'ios'

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Test Message State
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testPhone, setTestPhone] = useState('+91 ');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSendTestMessage = async () => {
    const rawPhone = testPhone ? testPhone.trim() : '';
    if (!rawPhone || rawPhone === '+91' || rawPhone.replace(/\D/g, '').length < 8) {
      showToast('Please enter a valid phone number with country code (e.g. +91 98765 43210)', 'error');
      return;
    }
    if (!selectedTemplate) {
      showToast('Please select a message template first', 'error');
      return;
    }

    setSendingTest(true);
    setTestResult(null);

    try {
      const payload = {
        recipientPhone: rawPhone,
        templateName: selectedTemplate.name || selectedTemplate.id,
        templateLanguage: selectedTemplate.language || 'en_US',
        variables: variableValues,
        headerText: selectedTemplate.headerText,
        buttons: selectedTemplate.buttons,
      };

      const res = await campaignsService.sendTestMessage(payload);
      if (res?.success) {
        setTestResult({
          success: true,
          wamid: res.data?.wamid || res.data?.metaMessageId,
          recipientPhone: res.data?.recipientPhone || rawPhone,
          templateName: res.data?.templateName || selectedTemplate.name,
          message: 'Test message delivered to Meta WhatsApp Cloud API!',
        });
        showToast('Test message sent successfully via Meta Cloud API!');
      } else {
        const errorText = res?.errorCode === 132001
          ? 'WhatsApp template not found for the selected language. Please select an approved template from your connected Meta WhatsApp Business account.'
          : (res?.error || res?.message || 'Meta API returned an error');

        setTestResult({
          success: false,
          error: errorText,
          errorCode: res?.errorCode,
          errorSubcode: res?.errorSubcode,
          missingFields: res?.missingFields,
        });
        showToast(errorText, 'error');
      }
    } catch (err) {
      setTestResult({
        success: false,
        error: err.message || 'Failed to connect to Meta WhatsApp Cloud API endpoint',
      });
      showToast(err.message || 'Failed to send test message', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  // Load Templates on Mount & Tab Change
  const loadTemplatesData = async () => {
    setLoadingTemplates(true);
    try {
      // 1. Fetch real Meta approved templates from connected WABA
      const metaRes = await campaignsService.getMetaTemplates();
      const realMetaApproved = metaRes?.success && Array.isArray(metaRes.approved) ? metaRes.approved : [];
      setMetaApprovedTemplates(realMetaApproved);

      if (templateTab === 'active' || templateTab === 'meta') {
        let list = realMetaApproved;
        if (list.length === 0) {
          const active = await campaignsService.getTemplates({ isSample: false, search: searchTheme });
          list = Array.isArray(active) ? active : [];
        }
        const filtered = searchTheme.trim()
          ? list.filter(
              (t) =>
                t.name.toLowerCase().includes(searchTheme.toLowerCase()) ||
                (t.category && t.category.toLowerCase().includes(searchTheme.toLowerCase()))
            )
          : list;
        setActiveTemplates(filtered);
        if (filtered.length > 0) {
          setSelectedTemplate((prev) => (prev && list.some((t) => t.id === prev.id) ? prev : filtered[0]));
        }
      } else {
        const samples = await campaignsService.getTemplates({ isSample: true, search: searchTheme });
        const list = Array.isArray(samples) && samples.length > 0 ? samples : EXACT_14_INTERAKT_SAMPLES;
        const filtered = searchTheme.trim()
          ? list.filter(
              (t) =>
                t.name.toLowerCase().includes(searchTheme.toLowerCase()) ||
                (t.theme && t.theme.toLowerCase().includes(searchTheme.toLowerCase())) ||
                t.category.toLowerCase().includes(searchTheme.toLowerCase())
            )
          : list;
        setSampleTemplates(filtered);
        if (filtered.length > 0 && !selectedTemplate) {
          setSelectedTemplate(filtered[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to load templates from API, using default exact 14 samples:', err);
      setSampleTemplates(EXACT_14_INTERAKT_SAMPLES);
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    loadTemplatesData();
  }, [templateTab, searchTheme]);

  // Load Saved Segments & Tags for Audience Selector
  const loadSegments = async () => {
    try {
      const segs = await segmentsService.getSegments();
      const safeSegs = Array.isArray(segs) ? segs : [];
      setSavedSegments(safeSegs);
      if (safeSegs.length > 0 && !selectedSegmentId) {
        setSelectedSegmentId(safeSegs[0].id);
      }
    } catch (err) {
      console.warn('Failed to load segments:', err);
    }
  };

  useEffect(() => {
    async function loadAudienceOptions() {
      await loadSegments();
      try {
        const meta = await segmentsService.getMetadata();
        if (meta?.tags) {
          setAvailableTags(meta.tags);
          if (meta.tags.length > 0 && !selectedTag) {
            setSelectedTag(meta.tags[0]);
          }
        }
      } catch (err) {
        console.warn('Failed to load metadata:', err);
      }
    }
    loadAudienceOptions();
  }, []);

  // Update Audience Reach calculation dynamically
  useEffect(() => {
    async function calculateReach() {
      try {
        const res = await campaignsService.getAudiences({
          audienceType,
          savedSegmentId: selectedSegmentId,
          tag: selectedTag,
          whatsapp_opted: whatsappOptedOnly ? 'true' : undefined,
        });
        if (res?.recipientCount !== undefined) {
          setAudienceReach(res.recipientCount);
        }
      } catch (err) {
        console.warn('Failed to calculate reach:', err);
      }
    }
    calculateReach();
  }, [audienceType, selectedSegmentId, selectedTag, whatsappOptedOnly]);

  // Select Sample Template & Advance to Full Builder (Screen 2)
  const handleUseSample = (tmpl) => {
    const templateToUse = tmpl || selectedTemplate || sampleTemplates[0] || EXACT_14_INTERAKT_SAMPLES[0];
    if (templateToUse) {
      setSelectedTemplate(templateToUse);
      setCampaignName(`${templateToUse.name} Broadcast`);
      setCampaignCategory(templateToUse.category === 'UTILITY' ? 'Utility' : 'Marketing');
      setCompletedSteps(new Set([...completedSteps, 2]));
    }
    setScreenMode('builder');
    setActiveStep(1);
  };

  // Create from Scratch (skips pre-picked sample & advances to Screen 2)
  const handleCreateFromScratch = () => {
    setSelectedTemplate({
      id: `custom_${Date.now()}`,
      name: 'Custom WhatsApp Campaign',
      category: 'MARKETING',
      language: 'en_US',
      headerText: 'Special Announcement',
      bodyText: 'Hi {{1}}, thank you for choosing ARCO! Here is your exclusive update: {{2}}.',
      footerText: 'ARCO Communication',
      buttons: [{ type: 'QUICK_REPLY', text: 'Talk to Support' }],
    });
    setCampaignName('New WhatsApp Broadcast');
    setCampaignCategory('Marketing');
    setScreenMode('builder');
    setActiveStep(1);
  };

  // Toggle Accordion Step
  const toggleStep = (stepNumber) => {
    setActiveStep(activeStep === stepNumber ? null : stepNumber);
  };

  const markStepComplete = (stepNumber, nextStep = null) => {
    setCompletedSteps(new Set([...completedSteps, stepNumber]));
    if (nextStep) {
      setActiveStep(nextStep);
    }
  };

  // Helper: Get Resolved Body Text for Live WhatsApp Preview
  const getRenderedBody = () => {
    if (!selectedTemplate) {
      return 'Select a message template from the library to preview your campaign broadcast here.';
    }
    let body = selectedTemplate.bodyText || selectedTemplate.body || '';
    Object.entries(variableValues || {}).forEach(([k, v]) => {
      body = body.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v || `{{${k}}}`);
    });
    return body;
  };

  // Validation: Check if all mandatory steps (1-4) are valid
  const isMandatoryValid = Boolean(
    campaignName.trim() &&
    selectedTemplate &&
    (audienceType !== 'segment' || selectedSegmentId || savedSegments.length > 0) &&
    (scheduleMode === 'now' || (scheduleDate && scheduleTime))
  );

  // Save as Draft or Go Live Submission Handler
  const handleSubmitCampaign = async (status = 'Scheduled') => {
    if (!campaignName.trim()) {
      showToast('Please enter a campaign name', 'error');
      return;
    }
    if (!selectedTemplate) {
      showToast('Please select a message template', 'error');
      setScreenMode('template_selection');
      return;
    }

    setIsSubmitting(true);

    const isCustomSchedule = scheduleMode === 'custom' && scheduleDate;
    const scheduledTimestamp = isCustomSchedule
      ? new Date(`${scheduleDate}T${scheduleTime || '10:00'}:00`).toISOString()
      : new Date().toISOString();

    const payload = {
      name: campaignName.trim(),
      description: campaignDescription.trim(),
      channel: 'whatsapp',
      type: campaignType,
      category: campaignCategory,
      recipients: audienceReach || 1334,
      scheduledFor: scheduledTimestamp,
      scheduleTimezone,
      audienceType,
      csvContacts: audienceType === 'csv' && importedCsvContacts.length > 0
        ? importedCsvContacts.map((c) => ({
            name: c.name,
            fullPhone: c.displayPhone,
            phone: c.phone,
            email: c.email,
            countryCode: c.countryCode,
            whatsappOpted: c.whatsappOpted,
            csvData: c.raw,
          }))
        : undefined,
      audienceFilter: {
        savedSegmentId: selectedSegmentId,
        tag: selectedTag,
        manualNumbers: manualPhoneNumbers,
        whatsappOptedOnly,
      },
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      templateLanguage: selectedTemplate.language || 'en_US',
      templateCategory: selectedTemplate.category || 'MARKETING',
      templatePayload: selectedTemplate,
      variableMapping: variableValues,
      recurringConfig: campaignType === 'ongoing' ? { frequency: recurringFrequency, time: scheduleTime, timezone: scheduleTimezone } : {},
      replyFlows: {
        optOut: replyFlowOptOut,
        products: replyFlowProducts,
        interactive: replyFlowInteractive,
        custom: replyFlowCustom,
        workflow: replyFlowWorkflow,
      },
      retries: activateRetries,
      conversionTracking: {
        utm: trackUtm,
        customEvents: trackCustomEvents,
        event: conversionEvent,
        deadline: `${conversionDeadlineVal} ${conversionDeadlineUnit}`,
      },
      fallbackChannels,
      status,
    };

    try {
      await campaignsService.createCampaign(payload);
      showToast(status === 'Draft' ? 'Campaign saved as draft!' : 'Campaign published and scheduled live!');
      setTimeout(() => {
        navigate('/campaigns');
      }, 700);
    } catch (err) {
      showToast(err.message || 'Failed to save campaign', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTemplateList = templateTab === 'samples' ? sampleTemplates : activeTemplates;

  return (
    <div className="min-h-screen bg-gray-900/60 backdrop-blur-2xs flex flex-col font-sans text-gray-800">
      
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-3.5 py-2.5 rounded-lg shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-200 ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-gray-900 text-white border-gray-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 1: INTERAKT TEMPLATE SELECTOR (EXACT MODAL REPLICA AS SCREENSHOT)  */}
      {/* ========================================================================= */}
      {screenMode === 'template_selection' ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-gray-950/60 backdrop-blur-2xs overflow-y-auto">
          
          {/* Modal Container */}
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-[940px] h-[550px] max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header: [icon] Create New Campaign | + Create from scratch (dark-green button) | (X) */}
            <header className="h-12 border-b border-gray-200 px-5 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-4 h-4 text-gray-700 stroke-[2]" />
                <h1 className="text-sm font-bold text-gray-900 tracking-tight">
                  Create New Campaign
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCreateFromScratch}
                  className="h-7 px-3 bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create from scratch</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/campaigns')}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </header>

            {/* Tabs / Sub-header bar: Left: Meta Approved | Sample Ideas | Right: Android/Apple Icons */}
            <div className="h-10 border-b border-gray-200 flex items-center justify-between px-0 bg-white shrink-0">
              <div className="flex items-center h-full text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setTemplateTab('active')}
                  className={`h-full px-5 flex items-center justify-center gap-1.5 border-r border-gray-200 transition-colors cursor-pointer ${
                    templateTab === 'active' || templateTab === 'meta'
                      ? 'bg-white text-[#0d3b30] font-bold border-b-2 border-b-[#0d3b30]'
                      : 'bg-gray-50/70 text-gray-600 hover:text-gray-900 border-b border-b-gray-200'
                  }`}
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Meta Approved</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {metaApprovedTemplates.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateTab('samples')}
                  className={`h-full px-5 flex items-center justify-center border-r border-gray-200 transition-colors cursor-pointer ${
                    templateTab === 'samples'
                      ? 'bg-white text-[#0d3b30] font-bold border-b-2 border-b-[#0d3b30]'
                      : 'bg-gray-50/70 text-gray-600 hover:text-gray-900 border-b border-b-gray-200'
                  }`}
                >
                  Sample Ideas ({sampleTemplates.length})
                </button>
              </div>

              {/* Top-right OS icons above preview */}
              <div className="flex items-center gap-1.5 pr-4">
                <button
                  type="button"
                  onClick={() => setPhoneOs('android')}
                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors ${
                    phoneOs === 'android'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                  }`}
                  title="Android View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPhoneOs('ios')}
                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors ${
                    phoneOs === 'ios'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                  }`}
                  title="iOS View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Content Split: Left (Compact Scrollable Template List) | Right (Fixed Phone Preview) */}
            <div className="flex-1 flex flex-row min-h-0 bg-white">
              
              {/* Left Column: Search Bar + Compact Template Rows (~46% width) */}
              <div className="w-[46%] border-r border-gray-200 flex flex-col bg-white">
                
                {/* Search & Refresh Row */}
                <div className="p-2.5 border-b border-gray-100 flex items-center gap-2 bg-white shrink-0">
                  <div className="relative flex-1">
                    <Search className="w-3 h-3 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by Template Name"
                      value={searchTheme}
                      onChange={(e) => setSearchTheme(e.target.value)}
                      className="w-full h-7 pl-7 pr-2 rounded border border-gray-300 bg-white text-[11px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={loadTemplatesData}
                    className="h-7 px-2 rounded border border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                    title="Refresh List"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${loadingTemplates ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Compact Template Items List (Independently Scrollable) */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 text-xs">
                  {loadingTemplates ? (
                    <div className="p-8 text-center text-gray-400 space-y-1.5">
                      <RefreshCw className="w-4 h-4 animate-spin mx-auto text-[#0d3b30]" />
                      <p className="text-[11px]">Loading approved Meta templates...</p>
                    </div>
                  ) : currentTemplateList.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-[11px]">
                      No approved templates found matching your search.
                    </div>
                  ) : (
                    currentTemplateList.map((tmpl) => {
                      const isSelected = selectedTemplate?.id === tmpl.id || selectedTemplate?.name === tmpl.name;
                      return (
                        <div
                          key={tmpl.id || tmpl.name}
                          onClick={() => setSelectedTemplate(tmpl)}
                          className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors border-b border-gray-100 ${
                            isSelected
                              ? 'bg-[#f0fdf4] border-l-4 border-[#0d3b30] pl-3'
                              : 'hover:bg-gray-50/80 border-l-4 border-transparent'
                          }`}
                        >
                          <div className="min-w-0 pr-2 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs leading-tight truncate ${isSelected ? 'text-gray-900 font-bold' : 'text-gray-800 font-semibold'}`}>
                                {tmpl.name}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                                {tmpl.status || 'APPROVED'}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono">
                              Language: <span className="font-semibold text-gray-700">{tmpl.language || 'en_US'}</span>
                            </div>
                          </div>

                          <div className="text-[11px] font-medium text-gray-500 capitalize shrink-0 self-center">
                            {tmpl.category?.toLowerCase() === 'utility' ? 'Utility' : 'Marketing'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>

              {/* Right Column: Fixed Centered WhatsApp Smartphone Preview (~54% width) */}
              <div className="w-[54%] bg-[#f8fafc] flex flex-col items-center justify-center p-3 relative overflow-hidden">
                
                {/* Smartphone Phone Mockup Frame */}
                <div className="w-[260px] sm:w-[280px] bg-black rounded-[32px] p-2 shadow-xl border-3 border-gray-800 relative flex flex-col my-auto">
                  
                  {/* Notch */}
                  <div className="w-16 h-3 bg-black rounded-b-lg mx-auto absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gray-900 border border-gray-700 mr-1" />
                    <div className="w-4 h-1 rounded-full bg-gray-800" />
                  </div>

                  {/* Phone Screen Container */}
                  <div className="w-full bg-[#efeae2] rounded-[24px] overflow-hidden flex flex-col h-[360px] relative text-[10px]">
                    
                    {/* WhatsApp Top Header Bar */}
                    <div className="bg-[#075e54] text-white px-2.5 pt-4 pb-1.5 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[9px] flex items-center justify-center border border-emerald-400">
                          A
                        </div>
                        <div>
                          <div className="font-semibold text-[11px] leading-tight">ARCO Business</div>
                          <div className="text-[8px] text-emerald-200">Verified Business Account</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-white/80">
                        <Video className="w-3 h-3" />
                        <Phone className="w-3 h-3" />
                        <MoreVertical className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 p-2 overflow-y-auto space-y-1.5 flex flex-col justify-start">
                      
                      {/* Security Notice */}
                      <div className="bg-[#ffeecd] border border-[#f5d998] text-[8px] text-amber-900 py-0.5 px-1 rounded text-center shadow-2xs">
                        Messages are end-to-end encrypted.
                      </div>

                      {/* WhatsApp Message Bubble */}
                      {selectedTemplate ? (
                        <div className="bg-white rounded-lg rounded-tl-none p-2 shadow-xs max-w-[94%] self-start space-y-1 text-gray-800 relative">
                          
                          {selectedTemplate.headerText && (
                            <div className="font-bold text-[10px] text-gray-900 border-b border-gray-100 pb-0.5">
                              {selectedTemplate.headerText}
                            </div>
                          )}

                          <div className="whitespace-pre-line leading-snug text-[10px] text-gray-800">
                            {getRenderedBody()}
                          </div>

                          <div className="flex items-center justify-between pt-0.5 text-[8px] text-gray-400">
                            <span>{selectedTemplate.footerText || ''}</span>
                            <span className="flex items-center gap-0.5 ml-auto">
                              05:08 pm
                              <Check className="w-2.5 h-2.5 text-blue-500 stroke-[2.5]" />
                            </span>
                          </div>

                          {Array.isArray(selectedTemplate.buttons) && selectedTemplate.buttons.length > 0 && (
                            <div className="pt-1 border-t border-gray-100 space-y-1">
                              {selectedTemplate.buttons.map((btn, idx) => (
                                <div
                                  key={idx}
                                  className="w-full py-0.5 text-center font-semibold text-blue-600 bg-blue-50/60 rounded text-[9px] border border-blue-100"
                                >
                                  {btn.text || 'View More'}
                                </div>
                              ))}
                            </div>
                          )}

                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-400 italic text-[10px]">
                          Select a template to preview
                        </div>
                      )}

                    </div>

                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer: [ Use this Sample ] Button */}
            <footer className="h-12 border-t border-gray-200 px-5 flex items-center justify-end bg-white shrink-0">
              <button
                type="button"
                onClick={() => handleUseSample(selectedTemplate)}
                className="h-8 px-5 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-semibold text-xs rounded shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Use this Sample</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </footer>

          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* SCREEN 2: FULL-PAGE 8-ACCORDION CAMPAIGN BUILDER VIEW                     */
        /* (PRESERVED EXACTLY AS IS - NO CHANGES TO BUILDER FLOW/FUNCTIONALITY)      */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc]">
          
          {/* Top Header: ← | Enter Campaign Name | Save as Draft | Go Live */}
          <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between shadow-2xs">
            
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <button
                type="button"
                onClick={() => setScreenMode('template_selection')}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                title="Back to Template Selection"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Enter Campaign Name"
                className="text-sm font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#0d3b30] focus:outline-none px-1 py-0.5 w-full max-w-sm transition-colors"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setTestResult(null);
                  setTestModalOpen(true);
                }}
                className="h-8 px-3 rounded border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-900 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-700" />
                <span>Send Test Message</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitCampaign('Draft')}
                className="h-8 px-3.5 rounded border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer shadow-2xs"
              >
                Save as Draft
              </button>

              <button
                type="button"
                disabled={isSubmitting || !isMandatoryValid}
                onClick={() => handleSubmitCampaign('Scheduled')}
                className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold text-xs rounded shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Go Live</span>
              </button>
            </div>

          </header>

          {/* 2-Column Main Content (65-70% Left / 30-35% Right) */}
          <div className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Left Column: 8 Accordion Settings (~65-70%) */}
            <div className="flex-1 w-full space-y-6">
              
              {/* SECTION A: BASIC SETTINGS (MANDATORY) */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Basic Settings (Mandatory)
                </h2>

                {/* 1. Choose your campaign type */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => toggleStep(1)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#0d3b30] text-white font-bold text-[11px] flex items-center justify-center">
                        1
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        Choose your campaign type
                      </span>
                      {completedSteps.has(1) && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {campaignType === 'onetime' ? 'One Time' : 'Ongoing'}
                        </span>
                      )}
                    </div>
                    {activeStep === 1 ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  {activeStep === 1 && (
                    <div className="p-4 border-t border-gray-100 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div
                          onClick={() => setCampaignType('onetime')}
                          className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                            campaignType === 'onetime'
                              ? 'border-[#0d3b30] bg-[#f2fbf6]'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[#0d3b30]" />
                              <span className="font-bold text-xs text-gray-900">ONE TIME CAMPAIGN</span>
                            </div>
                            <input
                              type="radio"
                              name="campaignType"
                              checked={campaignType === 'onetime'}
                              onChange={() => setCampaignType('onetime')}
                              className="text-[#0d3b30] focus:ring-0 cursor-pointer"
                            />
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                            Send a one-time broadcast notification to many customers at once.
                          </p>
                        </div>

                        <div
                          onClick={() => setCampaignType('ongoing')}
                          className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                            campaignType === 'ongoing'
                              ? 'border-[#0d3b30] bg-[#f2fbf6]'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Repeat className="w-4 h-4 text-[#0d3b30]" />
                              <span className="font-bold text-xs text-gray-900">ONGOING CAMPAIGN</span>
                            </div>
                            <input
                              type="radio"
                              name="campaignType"
                              checked={campaignType === 'ongoing'}
                              onChange={() => setCampaignType('ongoing')}
                              className="text-[#0d3b30] focus:ring-0 cursor-pointer"
                            />
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                            Set notifications to be sent upon the occurrence of an external pre-defined trigger.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => markStepComplete(1, 2)}
                          className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-semibold text-xs rounded shadow-xs transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Choose your message template */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => toggleStep(2)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#0d3b30] text-white font-bold text-[11px] flex items-center justify-center">
                        2
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        Choose your message template
                      </span>
                      {selectedTemplate && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 truncate max-w-xs">
                          {selectedTemplate.name}
                        </span>
                      )}
                    </div>
                    {activeStep === 2 ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  {activeStep === 2 && (
                    <div className="p-4 border-t border-gray-100 space-y-4">
                      {selectedTemplate ? (
                        <div className="space-y-4">
                          <div className="p-3.5 rounded-lg border border-emerald-200 bg-[#f2fbf6] flex items-center justify-between">
                            <div>
                              <div className="font-bold text-xs text-gray-900">{selectedTemplate.name}</div>
                              <div className="text-[11px] text-gray-500 mt-0.5">
                                Language: <span className="font-semibold text-gray-700">{selectedTemplate.language || 'English (en_US)'}</span> | Category: <span className="font-semibold text-gray-700 capitalize">{selectedTemplate.category?.toLowerCase() || 'marketing'}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setScreenMode('template_selection')}
                              className="h-7 px-2.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-[11px] font-semibold text-gray-700 cursor-pointer shadow-2xs"
                            >
                              Change Template
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-700">
                                Template Dynamic Variables ({detectedVariables.length > 0 ? detectedVariables.map(v => `{{${v}}}`).join(', ') : 'None'})
                              </span>
                              {csvHeaders.length > 0 && (
                                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                                  {csvHeaders.length} CSV Columns Available
                                </span>
                              )}
                            </div>

                            {detectedVariables.length === 0 ? (
                              <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                  <div className="font-bold text-emerald-900">No dynamic parameters required</div>
                                  <div className="text-[11px] text-emerald-700 mt-0.5">
                                    This approved Meta template contains pre-approved static text. It is ready for broadcast immediately without variable mapping.
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {detectedVariables.map((vNum) => (
                                  <div key={vNum} className="space-y-1.5 p-2.5 rounded-lg border border-gray-200 bg-gray-50/50">
                                    <label className="block text-[11px] font-bold text-gray-700 font-mono">
                                      &#123;&#123;{vNum}&#125;&#125; (Variable {vNum})
                                    </label>
                                    {csvHeaders.length > 0 && (
                                      <select
                                        value={variableValues[vNum] || (csvHeaders[parseInt(vNum, 10) - 1] || 'Name')}
                                        onChange={(e) => setVariableValues({ ...variableValues, [vNum]: e.target.value })}
                                        className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs bg-white focus:outline-none mb-1 font-semibold text-gray-800"
                                      >
                                        <optgroup label="Map to CSV Column">
                                          {csvHeaders.map((h) => (
                                            <option key={h} value={h}>CSV: {h}</option>
                                          ))}
                                        </optgroup>
                                        <optgroup label="Standard CRM Fields">
                                          <option value="Name">Name</option>
                                          <option value="Email">Email</option>
                                          <option value="Phone">Phone</option>
                                        </optgroup>
                                      </select>
                                    )}
                                    <input
                                      type="text"
                                      value={variableValues[vNum] || ''}
                                      onChange={(e) => setVariableValues({ ...variableValues, [vNum]: e.target.value })}
                                      placeholder={`Or enter static value for {{${vNum}}}`}
                                      className="w-full h-7 px-2.5 rounded border border-gray-300 text-xs bg-white focus:outline-none placeholder-gray-400"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => markStepComplete(2, 3)}
                              className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-semibold text-xs rounded shadow-xs transition-colors cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center space-y-3 bg-gray-50/40">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#0d3b30] flex items-center justify-center mx-auto">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-gray-800">
                              Select a message template from the library
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setScreenMode('template_selection')}
                            className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-semibold text-xs rounded shadow-xs cursor-pointer"
                          >
                            Choose template
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Choose your audience (REUSING SALES CRM CONTACTS & MARKET SEGMENTS LOGIC) */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => toggleStep(3)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#0d3b30] text-white font-bold text-[11px] flex items-center justify-center">
                        3
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        Choose your audience
                      </span>
                      {completedSteps.has(3) && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {audienceReach} Contacts
                        </span>
                      )}
                    </div>
                    {activeStep === 3 ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  {activeStep === 3 && (
                    <div className="p-4 border-t border-gray-100 space-y-4">
                      
                      {/* 5 Selectable Audience Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                        {[
                          { id: 'csv', title: 'Upload CSV', icon: Upload, desc: 'Import numbers file' },
                          { id: 'manual', title: 'Enter Manually', icon: FileText, desc: 'Type phone numbers' },
                          { id: 'segment', title: 'Select Segment', icon: Layers, desc: 'Saved CRM filter' },
                          { id: 'tag', title: 'Select Tag', icon: Tag, desc: 'Contacts by tag' },
                          { id: 'list', title: 'Select from list', icon: Users, desc: 'All CRM contacts' },
                        ].map((opt) => {
                          const Icon = opt.icon;
                          const isSelected = audienceType === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => setAudienceType(opt.id)}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between ${
                                isSelected
                                  ? 'border-[#0d3b30] bg-[#f2fbf6]'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#0d3b30]' : 'text-gray-400'}`} />
                                <input
                                  type="radio"
                                  name="audienceType"
                                  checked={isSelected}
                                  onChange={() => setAudienceType(opt.id)}
                                  className="text-[#0d3b30] focus:ring-0 cursor-pointer"
                                />
                              </div>
                              <div className="mt-2">
                                <div className="font-bold text-[11px] text-gray-900">{opt.title}</div>
                                <div className="text-[10px] text-gray-400">{opt.desc}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Contextual Sub-selector: Select Segment (REUSING SALES CRM CONTACTS & MARKET SEGMENTS LOGIC) */}
                      {audienceType === 'segment' && (
                        <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-gray-800">
                              Choose Saved Segment (Reusing Sales CRM & Market Segments)
                            </label>
                            <button
                              type="button"
                              onClick={() => setSaveSegmentModalOpen(true)}
                              className="text-[11px] font-semibold text-[#0d3b30] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Create New Segment</span>
                            </button>
                          </div>

                          <div className="space-y-2">
                            {savedSegments.map((s) => (
                              <label
                                key={s.id}
                                className={`p-2.5 rounded border flex items-center justify-between cursor-pointer transition-colors ${
                                  selectedSegmentId === s.id
                                    ? 'bg-[#f2fbf6] border-[#0d3b30]'
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <input
                                    type="radio"
                                    name="savedSegment"
                                    checked={selectedSegmentId === s.id}
                                    onChange={() => setSelectedSegmentId(s.id)}
                                    className="text-[#0d3b30] focus:ring-0 cursor-pointer"
                                  />
                                  <div>
                                    <span className="font-semibold text-xs text-gray-900">{s.name}</span>
                                    {s.description && (
                                      <p className="text-[10px] text-gray-400 line-clamp-1">{s.description}</p>
                                    )}
                                  </div>
                                </div>

                                <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                  {s.estimatedCount || 0} contacts
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {audienceType === 'tag' && (
                        <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                          <label className="block text-xs font-semibold text-gray-700">Select Contact Tag</label>
                          <select
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                            className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs bg-white focus:outline-none"
                          >
                            {availableTags.map((tag) => (
                              <option key={tag} value={tag}>{tag}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {audienceType === 'manual' && (
                        <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                          <label className="block text-xs font-semibold text-gray-700">Phone Numbers (comma separated)</label>
                          <textarea
                            rows={2}
                            value={manualPhoneNumbers}
                            onChange={(e) => setManualPhoneNumbers(e.target.value)}
                            placeholder="+919876543210, +919876543211..."
                            className="w-full p-2 rounded border border-gray-300 text-xs bg-white focus:outline-none"
                          />
                        </div>
                      )}

                      {audienceType === 'csv' && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-gray-800">
                              Upload WhatsApp Audience CSV File
                            </label>
                            {csvFileName && (
                              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {csvFileName}
                              </span>
                            )}
                          </div>

                          {importedCsvContacts.length === 0 ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center space-y-2 bg-white hover:bg-gray-50/50 transition-colors">
                              <Upload className="w-8 h-8 text-[#0d3b30] mx-auto stroke-[1.5]" />
                              <div>
                                <label className="inline-block px-3.5 py-1.5 bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-semibold rounded shadow-xs cursor-pointer">
                                  <span>Choose CSV File</span>
                                  <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleCsvFileUpload(file);
                                    }}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                              <p className="text-[11px] text-gray-500 leading-relaxed max-w-sm mx-auto">
                                Supports CSV files with Name, Full Phone Number (+91...), Phone Number, Country Code, Email, Appointment Time, WhatsApp Opted, etc.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3 bg-white p-3.5 rounded-lg border border-emerald-200 shadow-2xs">
                              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span className="font-bold text-xs text-gray-900">
                                    Audience CSV Mapped & Verified
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setColumnMappingModalOpen(true)}
                                    className="text-[11px] font-semibold text-[#0d3b30] hover:underline cursor-pointer"
                                  >
                                    Re-map Columns
                                  </button>
                                  <span className="text-gray-300">|</span>
                                  <label className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 cursor-pointer">
                                    <span>Upload New</span>
                                    <input
                                      type="file"
                                      accept=".csv"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleCsvFileUpload(file);
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </div>

                              {/* 4 Stat Badges */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
                                  <div className="text-[10px] text-gray-500">Total Detected</div>
                                  <div className="font-bold text-xs text-gray-900">{csvStats.total}</div>
                                </div>
                                <div className="bg-emerald-50 p-2 rounded border border-emerald-200 text-center">
                                  <div className="text-[10px] text-emerald-700 font-semibold">Eligible (Will Send)</div>
                                  <div className="font-bold text-xs text-emerald-900">{csvStats.eligible}</div>
                                </div>
                                <div className="bg-amber-50 p-2 rounded border border-amber-200 text-center">
                                  <div className="text-[10px] text-amber-700">Opted-In Contacts</div>
                                  <div className="font-bold text-xs text-amber-900">{csvStats.optedIn}</div>
                                </div>
                                <div className="bg-red-50 p-2 rounded border border-red-200 text-center">
                                  <div className="text-[10px] text-red-700">Invalid / Skipped</div>
                                  <div className="font-bold text-xs text-red-900">{csvStats.invalid}</div>
                                </div>
                              </div>

                              {/* View Contacts Button */}
                              <div className="pt-1 flex items-center justify-between">
                                <span className="text-[11px] text-gray-500">
                                  {csvStats.eligible} of {csvStats.total} contacts will receive this campaign.
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContactsFilterTab('all');
                                    setViewContactsModalOpen(true);
                                  }}
                                  className="h-7 px-3 bg-[#0d3b30] hover:bg-[#154d3f] text-white text-[11px] font-semibold rounded shadow-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Users className="w-3 h-3" />
                                  <span>View Contacts Table</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interakt Ads Help Banner */}
                      <div className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded border border-gray-200 flex items-center justify-between">
                        <span>Don't have an audience? Click here to build your WhatsApp audience via Ads.</span>
                        <a href="#ads" className="text-emerald-800 font-semibold hover:underline flex items-center gap-1">
                          <span>Build via Ads</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* WhatsApp Opt-in Consent Highlighted Strip */}
                      <div className="bg-[#f2fbf6] border border-[#d2edd8] rounded-md p-3 flex items-center justify-between">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={whatsappOptedOnly}
                            onChange={(e) => setWhatsappOptedOnly(e.target.checked)}
                            className="rounded text-[#0d3b30] focus:ring-0 cursor-pointer"
                          />
                          <span className="text-xs font-medium text-gray-800">
                            Only include customers whose 'WhatsApp opted' is true
                          </span>
                        </label>
                        <span className="bg-[#0d3b30] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="text-xs font-semibold text-emerald-800">
                          Eligible Audience: {audienceReach.toLocaleString()} contacts
                        </div>

                        <button
                          type="button"
                          onClick={() => markStepComplete(3, 4)}
                          className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-semibold text-xs rounded shadow-xs transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                      </div>

                    </div>
                  )}
                </div>

                {/* 4. Schedule your message */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => toggleStep(4)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#0d3b30] text-white font-bold text-[11px] flex items-center justify-center">
                        4
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        Schedule your message
                      </span>
                      {completedSteps.has(4) && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {scheduleMode === 'now' ? 'Immediately' : `${scheduleDate} ${scheduleTime}`}
                        </span>
                      )}
                    </div>
                    {activeStep === 4 ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  {activeStep === 4 && (
                    <div className="p-4 border-t border-gray-100 space-y-4">
                      <span className="text-xs font-bold text-gray-700">Start Sending</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div
                          onClick={() => setScheduleMode('now')}
                          className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                            scheduleMode === 'now'
                              ? 'border-[#0d3b30] bg-[#f2fbf6]'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-xs text-gray-900">IMMEDIATELY</span>
                            <input
                              type="radio"
                              name="scheduleMode"
                              checked={scheduleMode === 'now'}
                              onChange={() => setScheduleMode('now')}
                              className="text-[#0d3b30] focus:ring-0 cursor-pointer"
                            />
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                            Sends the message right away without any delay
                          </p>
                        </div>

                        <div
                          onClick={() => setScheduleMode('custom')}
                          className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                            scheduleMode === 'custom'
                              ? 'border-[#0d3b30] bg-[#f2fbf6]'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-xs text-gray-900">CUSTOM DATE</span>
                            <input
                              type="radio"
                              name="scheduleMode"
                              checked={scheduleMode === 'custom'}
                              onChange={() => setScheduleMode('custom')}
                              className="text-[#0d3b30] focus:ring-0 cursor-pointer"
                            />
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                            Allows you to schedule the message to be sent at a specific date and time.
                          </p>
                        </div>
                      </div>

                      {scheduleMode === 'custom' && (
                        <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Broadcast Date</label>
                            <input
                              type="date"
                              value={scheduleDate}
                              onChange={(e) => setScheduleDate(e.target.value)}
                              className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs bg-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Broadcast Time</label>
                            <input
                              type="time"
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs bg-white focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {campaignType === 'ongoing' && (
                        <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                          <label className="block text-xs font-semibold text-gray-700">Recurring Frequency</label>
                          <select
                            value={recurringFrequency}
                            onChange={(e) => setRecurringFrequency(e.target.value)}
                            className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs bg-white focus:outline-none"
                          >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                          </select>
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => markStepComplete(4, 5)}
                          className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-semibold text-xs rounded shadow-xs transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                      </div>

                    </div>
                  )}
                </div>

              </div>

              {/* SECTION B: ADVANCED SETTINGS (RECOMMENDED) */}
              <div className="space-y-3 pt-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Advanced Settings (Recommended)
                </h2>

                {/* 5. Set Post-Campaign Reply Flows */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => toggleStep(5)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 font-bold text-[11px] flex items-center justify-center">
                        5
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        Set Post-Campaign Reply Flows
                      </span>
                    </div>
                    {activeStep === 5 ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  {activeStep === 5 && (
                    <div className="p-4 border-t border-gray-100 space-y-3">
                      {[
                        { title: 'Opt-out the customer', desc: "Auto-update the WhatsApp Opted-in trait to false.", state: replyFlowOptOut, setter: setReplyFlowOptOut },
                        { title: 'Send your Products', desc: 'Auto-send your collection list / catalog.', state: replyFlowProducts, setter: setReplyFlowProducts },
                        { title: 'Send Interactive List Message', desc: 'Auto-send the list of FAQs set up here.', state: replyFlowInteractive, setter: setReplyFlowInteractive },
                        { title: 'Send Custom Reply', desc: 'Auto-send a custom message.', state: replyFlowCustom, setter: setReplyFlowCustom },
                        { title: 'Send a Workflow', desc: 'Auto-send an automated WhatsApp flow.', state: replyFlowWorkflow, setter: setReplyFlowWorkflow },
                      ].map((flow, i) => (
                        <div key={i} className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 flex items-center justify-between bg-gray-50/40">
                          <div>
                            <div className="font-semibold text-xs text-gray-900">{flow.title}</div>
                            <div className="text-[11px] text-gray-500 mt-0.5">{flow.desc}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => flow.setter(!flow.state)}
                            className={`h-7 px-3 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                              flow.state
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {flow.state ? 'Configured' : 'Setup'}
                          </button>
                        </div>
                      ))}

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => markStepComplete(5, 6)}
                          className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-semibold text-xs rounded shadow-xs transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Setup retries for Failed Messages */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => toggleStep(6)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 font-bold text-[11px] flex items-center justify-center">
                        6
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        Setup retries for Failed Messages
                      </span>
                    </div>
                    {activeStep === 6 ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  {activeStep === 6 && (
                    <div className="p-4 border-t border-gray-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-gray-900">Activate Retries</div>
                          <div className="text-[11px] text-gray-500">Automatically retry failed messages</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activateRetries}
                            onChange={(e) => setActivateRetries(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0d3b30]"></div>
                        </label>
                      </div>

                      <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-3 text-xs text-blue-900 space-y-1">
                        <p className="font-semibold">Retries don't add any extra cost to the campaign.</p>
                        <p className="text-[11px] text-blue-700">
                          Retries are done only for those messages which fail due to Meta's frequency capping.
                        </p>
                        <button type="button" className="text-[11px] text-blue-800 font-bold hover:underline cursor-pointer block pt-0.5">
                          Know more
                        </button>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => markStepComplete(6, 7)}
                          className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-semibold text-xs rounded shadow-xs transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 7. Add Conversion Tracking */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => toggleStep(7)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 font-bold text-[11px] flex items-center justify-center">
                        7
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        Add Conversion Tracking
                      </span>
                    </div>
                    {activeStep === 7 ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  {activeStep === 7 && (
                    <div className="p-4 border-t border-gray-100 space-y-4">
                      <span className="text-xs font-bold text-gray-700">Track Campaign Conversions</span>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={trackUtm}
                            onChange={(e) => setTrackUtm(e.target.checked)}
                            className="rounded text-[#0d3b30]"
                          />
                          <span>Via UTM Parameters</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={trackCustomEvents}
                            onChange={(e) => setTrackCustomEvents(e.target.checked)}
                            className="rounded text-[#0d3b30]"
                          />
                          <span>Via Custom Events</span>
                        </label>
                      </div>

                      {trackCustomEvents && (
                        <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                          <span className="text-xs font-bold text-gray-800">Conversion Event - 1</span>
                          
                          <div className="space-y-1.5">
                            {[
                              { id: 'sends_cart', label: 'Sends a WhatsApp Cart' },
                              { id: 'places_order', label: 'Places order on WhatsApp' },
                              { id: 'custom', label: 'Gets a particular custom event' },
                            ].map((evt) => (
                              <label key={evt.id} className="flex items-center gap-2 text-xs cursor-pointer">
                                <input
                                  type="radio"
                                  name="conversionEvent"
                                  checked={conversionEvent === evt.id}
                                  onChange={() => setConversionEvent(evt.id)}
                                  className="text-[#0d3b30] focus:ring-0"
                                />
                                <span>{evt.label}</span>
                              </label>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-gray-200">
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Conversion Deadline</label>
                            <div className="flex items-center gap-2 max-w-xs">
                              <input
                                type="number"
                                value={conversionDeadlineVal}
                                onChange={(e) => setConversionDeadlineVal(e.target.value)}
                                className="w-20 h-8 px-2 rounded border border-gray-300 text-xs bg-white"
                              />
                              <select
                                value={conversionDeadlineUnit}
                                onChange={(e) => setConversionDeadlineUnit(e.target.value)}
                                className="h-8 px-2 rounded border border-gray-300 text-xs bg-white"
                              >
                                <option value="Hours">Hours</option>
                                <option value="Days">Days</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => markStepComplete(7, 8)}
                          className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-semibold text-xs rounded shadow-xs transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 8. Setup Fallback Channels */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => toggleStep(8)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 font-bold text-[11px] flex items-center justify-center">
                        8
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        Setup Fallback Channels
                      </span>
                    </div>
                    {activeStep === 8 ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  {activeStep === 8 && (
                    <div className="p-4 border-t border-gray-100 space-y-3">
                      {fallbackChannels.map((ch, idx) => (
                        <div key={ch.id} className="p-3 rounded-lg border border-gray-200 bg-white flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                            <span className="text-xs font-semibold text-gray-900">{ch.name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={ch.enabled}
                                onChange={(e) => {
                                  const updated = [...fallbackChannels];
                                  updated[idx].enabled = e.target.checked;
                                  setFallbackChannels(updated);
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#0d3b30]"></div>
                            </label>
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => markStepComplete(8, null)}
                          className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-semibold text-xs rounded shadow-xs transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Right Column: Persistent WhatsApp Smartphone Mobile Preview (~30-35%) */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 sticky top-16">
              <div className="border border-gray-200 rounded-lg bg-white p-4 shadow-2xs space-y-3 flex flex-col items-center">
                
                {/* OS Toggle: Android | Apple */}
                <div className="bg-gray-100 p-0.5 rounded-lg flex items-center text-xs font-semibold text-gray-600 self-center">
                  <button
                    type="button"
                    onClick={() => setPhoneOs('android')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      phoneOs === 'android' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'hover:text-gray-900'
                    }`}
                  >
                    Android
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhoneOs('ios')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      phoneOs === 'ios' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'hover:text-gray-900'
                    }`}
                  >
                    Apple (iOS)
                  </button>
                </div>

                {/* Smartphone Outer Shell */}
                <div className="w-[300px] bg-black rounded-[38px] p-2.5 shadow-xl border-4 border-gray-800 relative flex flex-col">
                  
                  {/* Notch */}
                  <div className="w-20 h-3.5 bg-black rounded-b-xl mx-auto absolute top-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gray-900 border border-gray-700 mr-1.5" />
                    <div className="w-6 h-1 rounded-full bg-gray-800" />
                  </div>

                  {/* Phone Screen Container */}
                  <div className="w-full bg-[#efeae2] rounded-[30px] overflow-hidden flex flex-col h-[480px] relative text-[11px]">
                    
                    {/* WhatsApp Top Header Bar */}
                    <div className="bg-[#075e54] text-white px-3 pt-6 pb-2 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center border border-emerald-400">
                          A
                        </div>
                        <div>
                          <div className="font-semibold text-xs leading-tight">ARCO Business</div>
                          <div className="text-[9px] text-emerald-200">Verified WhatsApp Channel</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-white/80">
                        <Video className="w-3.5 h-3.5" />
                        <Phone className="w-3.5 h-3.5" />
                        <MoreVertical className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* WhatsApp Chat Area */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-2 flex flex-col justify-start">
                      
                      <div className="bg-[#ffeecd] border border-[#f5d998] text-[9px] text-amber-900 p-1.5 rounded text-center shadow-2xs">
                        Messages are end-to-end encrypted.
                      </div>

                      {/* WhatsApp Message Bubble */}
                      <div className="bg-white rounded-lg rounded-tl-none p-2.5 shadow-xs max-w-[92%] self-start space-y-1.5 text-gray-800 relative">
                        
                        {selectedTemplate?.headerText && (
                          <div className="font-bold text-xs text-gray-900 border-b border-gray-100 pb-1">
                            {selectedTemplate.headerText}
                          </div>
                        )}

                        <div className="whitespace-pre-line leading-relaxed text-[11px] text-gray-800">
                          {getRenderedBody()}
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[9px] text-gray-400">
                          <span>{selectedTemplate?.footerText || ''}</span>
                          <span className="flex items-center gap-0.5 ml-auto">
                            10:42 AM
                            <Check className="w-3 h-3 text-blue-500 stroke-[2.5]" />
                          </span>
                        </div>

                        {Array.isArray(selectedTemplate?.buttons) && selectedTemplate.buttons.length > 0 && (
                          <div className="pt-1.5 border-t border-gray-100 space-y-1">
                            {selectedTemplate.buttons.map((btn, idx) => (
                              <div
                                key={idx}
                                className="w-full py-1 text-center font-semibold text-blue-600 bg-blue-50/50 rounded text-[10px] border border-blue-100"
                              >
                                {btn.text || 'View Offer'}
                              </div>
                            ))}
                          </div>
                        )}

                      </div>

                    </div>

                    {/* Bottom Composer Bar */}
                    <div className="bg-[#f0f2f5] p-2 flex items-center gap-2 border-t border-gray-200">
                      <div className="flex-1 bg-white h-7 px-3 rounded-full text-[10px] text-gray-400 flex items-center border border-gray-200">
                        Type a message
                      </div>
                      <div className="w-7 h-7 rounded-full bg-[#075e54] text-white flex items-center justify-center shadow-xs">
                        <Send className="w-3 h-3" />
                      </div>
                    </div>

                  </div>

                </div>

                {/* Test Message Quick Action Under Smartphone */}
                <div className="w-full bg-[#f2fbf6] border border-[#c4e9d0] rounded-xl p-3.5 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#0d3b30]">
                      <WhatsAppIcon className="w-4 h-4 text-emerald-700" />
                      <span>Send a Real Test Message</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                      Meta Cloud API
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Verify real WhatsApp delivery directly to your physical phone before broadcasting to customers.
                  </p>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="flex-1 h-8 px-2.5 rounded border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#0d3b30]"
                    />
                    <button
                      type="button"
                      disabled={sendingTest}
                      onClick={handleSendTestMessage}
                      className="h-8 px-3 bg-[#0d3b30] hover:bg-[#154d3f] disabled:bg-gray-300 text-white text-xs font-semibold rounded shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {sendingTest ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      <span>{sendingTest ? 'Sending...' : 'Send Test'}</span>
                    </button>
                  </div>

                  {testResult && (
                    <div
                      className={`p-2.5 rounded-lg text-xs space-y-1 ${
                        testResult.success
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                          : 'bg-red-50 border border-red-200 text-red-900'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        {testResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                        <span>{testResult.success ? 'Meta API Accepted' : 'Meta API Error'}</span>
                      </div>
                      {testResult.wamid && (
                        <div className="text-[10px] font-mono break-all bg-white/70 p-1 rounded border border-emerald-200 text-emerald-800">
                          WAMID: {testResult.wamid}
                        </div>
                      )}
                      {testResult.error && (
                        <div className="text-[11px] leading-tight">
                          {testResult.error}
                          {testResult.missingFields?.length > 0 && (
                            <div className="mt-1 font-semibold text-[10px]">
                              Missing: {testResult.missingFields.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEND TEST MESSAGE MODAL                                                   */}
      {/* ========================================================================= */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <WhatsAppIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Send Real WhatsApp Test</h3>
                  <p className="text-[11px] text-gray-500">Delivered via Meta WhatsApp Cloud API</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs">
              
              {/* Selected Template Details */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                <div className="text-[11px] font-semibold text-gray-500 uppercase">Template Selected</div>
                <div className="font-bold text-gray-900 text-xs">{selectedTemplate?.name || 'Standard WhatsApp Promo'}</div>
                <div className="text-[11px] text-gray-600 font-mono">Language: {selectedTemplate?.language || 'en_US'}</div>
              </div>

              {/* Recipient Phone Input */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-gray-700">Test Recipient Phone Number</label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#0d3b30]"
                />
                <p className="text-[11px] text-gray-400">
                  Include international country code prefix (e.g. +91 for India, +1 for US).
                </p>
              </div>

              {/* Live Test Result */}
              {testResult && (
                <div
                  className={`p-3 rounded-lg text-xs space-y-1.5 ${
                    testResult.success
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border border-red-200 text-red-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{testResult.success ? 'Meta API Accepted & Dispatched' : 'Meta API Rejection'}</span>
                  </div>
                  {testResult.wamid && (
                    <div className="text-[10px] font-mono break-all bg-white/80 p-2 rounded border border-emerald-200 text-emerald-800">
                      <span className="font-bold">WhatsApp Message ID (wamid):</span>
                      <br />
                      {testResult.wamid}
                    </div>
                  )}
                  {testResult.error && (
                    <div className="text-[11px] leading-relaxed">
                      {testResult.error}
                      {testResult.missingFields?.length > 0 && (
                        <div className="mt-1 font-semibold text-[10px] text-red-700">
                          Missing credentials: {testResult.missingFields.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="h-8 px-3.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                disabled={sendingTest}
                onClick={handleSendTestMessage}
                className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] disabled:bg-gray-300 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {sendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{sendingTest ? 'Sending to Meta...' : 'Send Test Now'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. COLUMN MAPPING MODAL (INTERAKT-STYLE)                                  */}
      {/* ========================================================================= */}
      {columnMappingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="font-bold text-sm text-gray-900">
                  Map columns to attributes for successful upload
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  <span className="font-semibold text-gray-700">{csvFileName || 'CSV file'}</span> has {csvHeaders.length} columns & {rawCsvRows.length} rows
                </p>
              </div>
              <button
                type="button"
                onClick={() => setColumnMappingModalOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body / Mapping Table */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <p className="text-[11px] text-gray-600 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                Match each column from your CSV to a contact attribute. Full Phone Number (+91...) or Phone Number + Country Code will be automatically normalized to E.164.
              </p>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-600">
                      <th className="py-2.5 px-3">CSV Column Name</th>
                      <th className="py-2.5 px-3">Map to Attribute</th>
                      <th className="py-2.5 px-3">Sample Values (Preview)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {csvHeaders.map((header) => {
                      const sampleVals = rawCsvRows.slice(0, 3).map((r) => r[header]).filter(Boolean);
                      return (
                        <tr key={header} className="hover:bg-gray-50/50">
                          <td className="py-2.5 px-3 font-semibold text-gray-900">
                            {header}
                          </td>
                          <td className="py-2.5 px-3">
                            <select
                              value={columnMappings[header] || header}
                              onChange={(e) => setColumnMappings({ ...columnMappings, [header]: e.target.value })}
                              className="h-8 px-2.5 rounded border border-gray-300 bg-white text-xs text-gray-800 focus:outline-none focus:border-[#0d3b30] w-full font-medium"
                            >
                              <optgroup label="Standard Contact Attributes">
                                <option value="Name">Name</option>
                                <option value="Full Phone Number">Full Phone Number (+91...)</option>
                                <option value="Phone Number">Phone Number</option>
                                <option value="Country Code">Country Code</option>
                                <option value="Email">Email</option>
                                <option value="WhatsApp Opted">WhatsApp Opted</option>
                              </optgroup>
                              <optgroup label="Custom Template Variables">
                                <option value={header}>Use as {header} (Template variable)</option>
                              </optgroup>
                            </select>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-gray-500">
                            {sampleVals.length > 0 ? (
                              sampleVals.join(' • ')
                            ) : (
                              <span className="italic text-gray-400">Empty</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-[11px] text-gray-500">
                {rawCsvRows.length} contacts will be verified against phone & WhatsApp opt-in rules.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setColumnMappingModalOpen(false)}
                  className="h-8 px-3.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmColumnMapping}
                  className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Confirm & Validate Audience
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VIEW IMPORTED CONTACTS TABLE MODAL                                     */}
      {/* ========================================================================= */}
      {viewContactsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="font-bold text-sm text-gray-900">
                  Imported Audience Contacts ({importedCsvContacts.length})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verified for WhatsApp Cloud API campaign delivery
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewContactsModalOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 py-2 border-b border-gray-200 bg-white flex items-center gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setContactsFilterTab('all')}
                className={`pb-1.5 transition-colors cursor-pointer ${
                  contactsFilterTab === 'all'
                    ? 'border-b-2 border-[#0d3b30] text-[#0d3b30]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                All Contacts ({importedCsvContacts.length})
              </button>
              <button
                type="button"
                onClick={() => setContactsFilterTab('eligible')}
                className={`pb-1.5 transition-colors cursor-pointer ${
                  contactsFilterTab === 'eligible'
                    ? 'border-b-2 border-emerald-600 text-emerald-700'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Eligible ({csvStats.eligible})
              </button>
              <button
                type="button"
                onClick={() => setContactsFilterTab('invalid')}
                className={`pb-1.5 transition-colors cursor-pointer ${
                  contactsFilterTab === 'invalid'
                    ? 'border-b-2 border-red-600 text-red-700'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Invalid / Skipped ({csvStats.invalid})
              </button>
            </div>

            {/* Contacts Table */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-600">
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Phone (Normalized)</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">WhatsApp Opted</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {importedCsvContacts
                      .filter((c) => {
                        if (contactsFilterTab === 'eligible') return c.status === 'Eligible';
                        if (contactsFilterTab === 'invalid') return c.status !== 'Eligible';
                        return true;
                      })
                      .map((contact) => (
                        <tr key={contact.id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 px-3 font-semibold text-gray-900">
                            {contact.name}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {contact.displayPhone || contact.phone}
                          </td>
                          <td className="py-2.5 px-3 text-gray-500">
                            {contact.email || '-'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                contact.whatsappOpted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {contact.whatsappOpted ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                contact.status === 'Eligible'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : contact.status === 'Opted Out'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {contact.status}
                            </span>
                            {contact.reason && (
                              <span className="block text-[10px] text-gray-400 mt-0.5">
                                {contact.reason}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-end bg-gray-50/50">
              <button
                type="button"
                onClick={() => setViewContactsModalOpen(false)}
                className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                Close Table
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHARED SALES CRM SEGMENT CREATION MODAL REUSED                            */}
      {/* ========================================================================= */}
      {saveSegmentModalOpen && (
        <SaveSegmentModal
          isOpen={saveSegmentModalOpen}
          onClose={() => setSaveSegmentModalOpen(false)}
          onSegmentSaved={(newSegment) => {
            loadSegments();
            if (newSegment?.id) {
              setSelectedSegmentId(newSegment.id);
            }
            showToast(`Segment "${newSegment?.name || 'New Segment'}" saved and selected!`);
          }}
          conditions={[]}
          logic="AND"
          whatsappOpted="all"
          totalMatchingCount={audienceReach}
        />
      )}

    </div>
  );
}
