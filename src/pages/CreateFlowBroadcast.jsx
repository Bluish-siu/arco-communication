import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Check,
  Search,
  RefreshCw,
  Clock,
  Calendar,
  Layers,
  Users,
  Upload,
  FileText,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  X,
  Workflow,
  Sparkles,
  Send,
  Eye,
  ExternalLink,
  ShieldCheck,
  Info,
  HelpCircle,
  Copy,
  Trash2,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { flowsService } from '../services/flowsService';

// WhatsApp Contextual SVG Icon
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function CreateFlowBroadcast() {
  const navigate = useNavigate();
  const { subscription, trialDaysRemaining } = useOnboarding();

  // Accordion Steps: 1: Choose Flow, 2: Choose Audience, 3: Configure Flow, 4: Schedule
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Broadcast Meta
  const [broadcastName, setBroadcastName] = useState('New Flow Broadcast');

  // Step 1: Real Meta Flows
  const [availableFlows, setAvailableFlows] = useState([]);
  const [loadingFlows, setLoadingFlows] = useState(true);
  const [flowSearchQuery, setFlowSearchQuery] = useState('');
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [selectedFlowDetails, setSelectedFlowDetails] = useState(null);

  // Step 2: Audience CSV State
  const [csvFileName, setCsvFileName] = useState('');
  const [rawCsvText, setRawCsvText] = useState('');
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [rawCsvRows, setRawCsvRows] = useState([]);
  const [processedRecipients, setProcessedRecipients] = useState([]);
  const [csvStats, setCsvStats] = useState({ total: 0, eligible: 0, invalid: 0, duplicates: 0 });
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [whatsappOptedOnly, setWhatsappOptedOnly] = useState(true);

  // Step 3: Configure Flow
  const [ctaText, setCtaText] = useState('Give Feedback');
  const [headerText, setHeaderText] = useState('Feedback & Survey');
  const [bodyText, setBodyText] = useState('We would love to get your feedback. Please click below to complete our quick interactive form.');
  const [footerText, setFooterText] = useState('ARCO Communication');
  const [variableMappings, setVariableMappings] = useState({});

  // Step 4: Schedule
  const [scheduleMode, setScheduleMode] = useState('now'); // 'now' | 'custom'
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('14:00');
  const [scheduleTimezone, setScheduleTimezone] = useState('Asia/Kolkata');

  // Preview Phone Mockup OS
  const [phoneOs, setPhoneOs] = useState('android'); // 'android' | 'ios'

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Test Flow Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testPhone, setTestPhone] = useState('+91 99208 58396');
  const [sendingTest, setSendingTest] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Fetch Real Meta Flows from Backend
  const loadFlows = async () => {
    setLoadingFlows(true);
    try {
      const data = await flowsService.getFlows();
      const list = Array.isArray(data) ? data : [];
      setAvailableFlows(list);

      // Default select the published flow if none selected
      if (!selectedFlow && list.length > 0) {
        const published = list.find((f) => f.status === 'published') || list[0];
        handleSelectFlow(published);
      }
    } catch (err) {
      console.warn('Failed to load flows:', err.message);
      showToast('Failed to load published Flows from Meta', 'error');
    } finally {
      setLoadingFlows(false);
    }
  };

  useEffect(() => {
    loadFlows();
  }, []);

  // Handle Flow Selection
  const handleSelectFlow = async (flow) => {
    setSelectedFlow(flow);
    setBroadcastName(`${flow.name || flow.title} Broadcast`);
    setCtaText('Give Feedback');

    // Fetch deep flow specs if available
    try {
      const details = await flowsService.getFlow(flow.metaFlowId || flow.id);
      setSelectedFlowDetails(details);
    } catch {
      setSelectedFlowDetails(flow);
    }

    setCompletedSteps((prev) => new Set([...prev, 1]));
  };

  // Toggle Accordion Step
  const toggleStep = (stepNum) => {
    setActiveStep(activeStep === stepNum ? null : stepNum);
  };

  // CSV Text Parser
  const parseCsvText = (csvString) => {
    const lines = csvString
      .split(/\r\n|\n/)
      .map((l) => l.trim())
      .filter(Boolean);
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

  // Phone Normalizer
  const normalizeClientPhone = ({ fullPhone, phone, countryCode = '91' }) => {
    const cleanFull = fullPhone ? String(fullPhone).trim() : '';
    const cleanPhone = phone ? String(phone).trim() : '';
    const cleanCc = countryCode ? String(countryCode).replace(/\D/g, '') : '91';

    // Scientific notation protection (e.g. 9.19748E+11)
    if (/[eE][+-]?\d+/.test(cleanFull) || /[eE][+-]?\d+/.test(cleanPhone)) {
      return {
        isValid: false,
        normalizedPhone: cleanFull || cleanPhone,
        display: cleanFull || cleanPhone,
        reason: 'Corrupted phone number: spreadsheet scientific notation detected (e.g. 9.19748E+11).',
      };
    }

    const candidate = cleanFull || cleanPhone;
    if (!candidate) {
      return {
        isValid: false,
        normalizedPhone: '',
        display: '',
        reason: 'Missing phone number',
      };
    }

    const hasLeadingPlus = candidate.startsWith('+');
    let digits = candidate.replace(/\D/g, '');

    if (!digits) {
      return {
        isValid: false,
        normalizedPhone: '',
        display: '',
        reason: 'No digits found in phone number',
      };
    }

    // 1. Explicit leading '+'
    if (hasLeadingPlus) {
      if (digits.length >= 9 && digits.length <= 15) {
        return { isValid: true, normalizedPhone: digits, display: `+${digits}` };
      }
      return {
        isValid: false,
        normalizedPhone: digits,
        display: `+${digits}`,
        reason: 'Phone number with "+" must have between 9 and 15 digits',
      };
    }

    // 2. Explicit non-India country code
    if (cleanCc && cleanCc !== '91') {
      if (digits.startsWith(cleanCc) && digits.length >= cleanCc.length + 7 && digits.length <= 15) {
        return { isValid: true, normalizedPhone: digits, display: `+${digits}` };
      }
      const combined = `${cleanCc}${digits.replace(/^0+/, '')}`;
      if (combined.length >= 9 && combined.length <= 15) {
        return { isValid: true, normalizedPhone: combined, display: `+${combined}` };
      }
    }

    // 3. Indian number: 12 digits starting with 91 followed by [6-9]
    if (digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits.slice(2))) {
      return { isValid: true, normalizedPhone: digits, display: `+91 ${digits.slice(2)}` };
    }

    // 4. Indian number: 11 digits starting with 0 followed by [6-9]
    if (digits.length === 11 && digits.startsWith('0') && /^[6-9]/.test(digits.slice(1))) {
      return { isValid: true, normalizedPhone: `91${digits.slice(1)}`, display: `+91 ${digits.slice(1)}` };
    }

    // 5. Indian number: standard 10-digit mobile starting with [6-9]
    if (digits.length === 10 && /^[6-9]/.test(digits)) {
      return { isValid: true, normalizedPhone: `91${digits}`, display: `+91 ${digits}` };
    }

    // 6. Explicit CC 91 with 10 digits
    if (cleanCc === '91' && digits.length === 10) {
      return { isValid: true, normalizedPhone: `91${digits}`, display: `+91 ${digits}` };
    }

    // 7. General international digits
    if (digits.length >= 9 && digits.length <= 15) {
      return { isValid: true, normalizedPhone: digits, display: `+${digits}` };
    }

    return {
      isValid: false,
      normalizedPhone: digits,
      display: cleanFull || cleanPhone,
      reason: 'Invalid phone format (must be 9-15 digits with valid country code).',
    };
  };

  // CSV File Handler
  const handleCsvFileUpload = (file) => {
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        setRawCsvText(text);
        const { headers, rows } = parseCsvText(text);
        if (headers.length === 0 || rows.length === 0) {
          showToast('CSV file appears to be empty or missing header row', 'error');
          return;
        }

        setCsvHeaders(headers);
        setRawCsvRows(rows);

        // Identify key columns
        const phoneCol = headers.find((h) => {
          const l = h.toLowerCase();
          return l.includes('phone') || l.includes('mobile') || l.includes('contact') || l.includes('whatsapp');
        }) || headers[0];

        const nameCol = headers.find((h) => h.toLowerCase().includes('name')) || null;
        const emailCol = headers.find((h) => h.toLowerCase().includes('email')) || null;

        // Auto-seed initial variable mappings from headers
        const autoMap = {};
        headers.forEach((h) => {
          autoMap[h] = h;
        });
        setVariableMappings(autoMap);

        // Deduplicate and Validate
        let eligible = 0;
        let invalid = 0;
        let duplicates = 0;
        const seen = new Set();

        const processed = rows.map((row, idx) => {
          const rawPhone = row[phoneCol] || '';
          const rawName = nameCol ? row[nameCol] : `Customer ${idx + 1}`;
          const rawEmail = emailCol ? row[emailCol] : '';

          const phoneResult = normalizeClientPhone({ fullPhone: rawPhone, phone: rawPhone });

          let status = 'Eligible';
          let reason = '';

          if (!phoneResult.isValid) {
            status = 'Invalid';
            reason = phoneResult.reason;
            invalid++;
          } else if (seen.has(phoneResult.normalizedPhone)) {
            status = 'Duplicate';
            reason = 'Duplicate phone number already found earlier in this CSV';
            duplicates++;
          } else {
            seen.add(phoneResult.normalizedPhone);
            eligible++;
          }

          return {
            id: `row_${idx}`,
            name: rawName,
            phone: phoneResult.normalizedPhone,
            displayPhone: phoneResult.display,
            email: rawEmail,
            status,
            reason,
            csvData: row,
          };
        });

        setProcessedRecipients(processed);
        setCsvStats({
          total: rows.length,
          eligible,
          invalid,
          duplicates,
        });

        setCompletedSteps((prev) => new Set([...prev, 2]));
        setActiveStep(3); // Advance to Step 3
        showToast(`Parsed ${rows.length} rows (${eligible} eligible recipients)`, 'success');
      } catch (err) {
        showToast('Failed to parse CSV: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const sampleContent = 'phone_number,name,email\n919876543210,Sample Customer,customer@example.com\n919876543211,Aditya Roy,aditya@example.com\n';
    const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'arco_flow_broadcast_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Flow List
  const filteredFlows = availableFlows.filter((f) => {
    if (!flowSearchQuery.trim()) return true;
    const q = flowSearchQuery.toLowerCase();
    return (
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.category && f.category.toLowerCase().includes(q)) ||
      (f.metaFlowId && f.metaFlowId.includes(q))
    );
  });

  // Execute Send Test Flow
  const handleSendTestSubmit = async (e) => {
    e.preventDefault();
    if (!testPhone.trim()) {
      showToast('Please enter a recipient phone number', 'error');
      return;
    }
    if (!selectedFlow) {
      showToast('Please choose a Flow first', 'error');
      return;
    }

    setSendingTest(true);
    try {
      const res = await flowsService.sendTestFlow({
        flowId: selectedFlow.metaFlowId || selectedFlow.id,
        recipientPhone: testPhone.trim(),
        ctaText: ctaText.trim() || 'Give Feedback',
      });
      const wamid = res.data?.wamid || res.wamid || 'Dispatched';
      showToast(`Test flow dispatched to WhatsApp! WAMID: ${wamid.substring(0, 22)}...`);
      setTestModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to dispatch test Flow', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  // Final Go Live / Save as Draft
  const handleSubmitBroadcast = async (status = 'Scheduled') => {
    if (!broadcastName.trim()) {
      showToast('Please provide a name for this broadcast', 'error');
      return;
    }
    if (!selectedFlow) {
      showToast('Please select a Flow in Step 1', 'error');
      setActiveStep(1);
      return;
    }

    const eligibleList = processedRecipients.filter((r) => r.status === 'Eligible');
    if (status !== 'Draft' && eligibleList.length === 0) {
      showToast('Please upload a valid CSV audience in Step 2', 'error');
      setActiveStep(2);
      return;
    }

    setIsSubmitting(true);
    const isCustomSchedule = scheduleMode === 'custom' && scheduleDate;
    const scheduledTimestamp = isCustomSchedule
      ? new Date(`${scheduleDate}T${scheduleTime || '14:00'}:00`).toISOString()
      : new Date().toISOString();

    const payload = {
      name: broadcastName.trim(),
      flowId: selectedFlow.metaFlowId || selectedFlow.id,
      ctaText: ctaText.trim() || 'Give Feedback',
      headerText: headerText.trim() || null,
      bodyText: bodyText.trim() || 'Please complete our quick form',
      footerText: footerText.trim() || null,
      screen: selectedFlowDetails?.entryScreen || 'RECOMMEND',
      csvContacts: eligibleList.map((c) => ({
        name: c.name,
        fullPhone: c.displayPhone,
        phone: c.phone,
        email: c.email,
        whatsappOpted: true,
        csvData: c.csvData,
      })),
      variableMapping: variableMappings,
      scheduledFor: scheduledTimestamp,
      scheduleTimezone,
      whatsappOptedOnly,
      status,
    };

    try {
      const res = await flowsService.createFlowBroadcast(payload);
      const broadcastId = res.data?.id || res.id;
      showToast(status === 'Draft' ? 'Broadcast saved as draft!' : 'Flow broadcast launched live!');
      setTimeout(() => {
        if (broadcastId) {
          navigate(`/flows/broadcasts/${broadcastId}`);
        } else {
          navigate('/flows');
        }
      }, 700);
    } catch (err) {
      showToast(err.message || 'Failed to submit Flow broadcast', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-gray-800">
      {/* Toast */}
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

      {/* Main Layout */}
      <div className="flex-1 flex flex-row min-w-0">
        <DashboardSidebar />

        {/* Content Shell */}
        <main className="flex-1 ml-14 min-w-0 flex flex-col bg-[#f8fafc] min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2 text-xs">
              <Link
                to="/flows"
                className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Flows</span>
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-semibold truncate max-w-[200px] sm:max-w-xs">
                {broadcastName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTestModalOpen(true)}
                className="h-8 px-3 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Send className="w-3.5 h-3.5 text-[#0d3b30]" />
                <span className="hidden sm:inline">Send Test Flow</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmitBroadcast('Draft')}
                disabled={isSubmitting}
                className="h-8 px-3 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs cursor-pointer shadow-2xs"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSubmitBroadcast('Scheduled')}
                disabled={isSubmitting}
                className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] disabled:opacity-60 text-white font-semibold text-xs rounded shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>Go Live</span>
              </button>
            </div>
          </header>

          {/* Builder Workspace: Left Form Columns + Right Phone Preview */}
          <div className="p-6 max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Accordion Steps */}
            <div className="lg:col-span-7 space-y-4">
              {/* Broadcast Name Input Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Flow Broadcast Name
                </label>
                <input
                  type="text"
                  value={broadcastName}
                  onChange={(e) => setBroadcastName(e.target.value)}
                  placeholder="e.g. Q4 Customer Satisfaction Survey"
                  className="w-full h-9 px-3 rounded border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#0d3b30]"
                />
              </div>

              {/* =========================================================================
                  STEP 1: CHOOSE YOUR FLOW
                  ========================================================================= */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleStep(1)}
                  className="w-full px-5 py-3.5 flex items-center justify-between bg-white hover:bg-gray-50/70 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        completedSteps.has(1)
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeStep === 1
                          ? 'bg-[#0d3b30] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {completedSteps.has(1) ? <Check className="w-3.5 h-3.5" /> : '1'}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">Choose your Flow</h2>
                      <p className="text-[11px] text-gray-500">
                        {selectedFlow
                          ? `Selected: ${selectedFlow.name || selectedFlow.title} (${selectedFlow.metaFlowId})`
                          : 'Select a published Meta WhatsApp Flow for this broadcast'}
                      </p>
                    </div>
                  </div>
                  {activeStep === 1 ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {activeStep === 1 && (
                  <div className="px-5 pb-5 pt-1 border-t border-gray-100 space-y-3">
                    {/* Search & Refresh */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search published Flows..."
                          value={flowSearchQuery}
                          onChange={(e) => setFlowSearchQuery(e.target.value)}
                          className="w-full h-8 pl-8 pr-3 rounded border border-gray-300 bg-white text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0d3b30]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={loadFlows}
                        className="h-8 px-2.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 text-xs flex items-center gap-1 cursor-pointer"
                        title="Refresh Flows from Meta"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingFlows ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                      </button>
                    </div>

                    {/* Flow List Cards */}
                    {loadingFlows ? (
                      <div className="py-8 flex flex-col items-center justify-center space-y-2 text-gray-500 text-xs">
                        <RefreshCw className="w-5 h-5 animate-spin text-[#0d3b30]" />
                        <span>Loading published Meta Flows...</span>
                      </div>
                    ) : filteredFlows.length === 0 ? (
                      <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg p-6">
                        <Workflow className="w-8 h-8 text-gray-400 mx-auto stroke-[1.5]" />
                        <p className="text-xs font-semibold text-gray-700 mt-2">No Flows Found</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Make sure you have published Meta WhatsApp Flows in your connected account.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {filteredFlows.map((flow) => {
                          const isSelected = selectedFlow?.metaFlowId === flow.metaFlowId;
                          const isPublished = flow.status === 'published';

                          return (
                            <div
                              key={flow.metaFlowId || flow.id}
                              onClick={() => isPublished && handleSelectFlow(flow)}
                              className={`p-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'border-[#0d3b30] bg-emerald-50/40 ring-1 ring-[#0d3b30]'
                                  : isPublished
                                  ? 'border-gray-200 bg-white hover:border-gray-300'
                                  : 'border-gray-200 bg-gray-50/50 opacity-60 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? 'bg-[#0d3b30] text-white'
                                      : 'bg-emerald-50 text-[#0d3b30] border border-emerald-100'
                                  }`}
                                >
                                  <Workflow className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-gray-900 truncate">
                                      {flow.name || flow.title}
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 uppercase">
                                      {flow.category || 'Lead Gen'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 font-mono">
                                    <span>ID: {flow.metaFlowId || flow.id}</span>
                                    <span>•</span>
                                    <span>v{flow.jsonVersion || '7.3'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                    isPublished
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}
                                >
                                  {flow.status?.toUpperCase()}
                                </span>

                                <button
                                  type="button"
                                  disabled={!isPublished}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectFlow(flow);
                                  }}
                                  className={`h-7 px-2.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#0d3b30] text-white'
                                      : 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                                  }`}
                                >
                                  {isSelected ? (
                                    <>
                                      <Check className="w-3 h-3 stroke-[2.5]" />
                                      <span>Selected</span>
                                    </>
                                  ) : (
                                    <span>Select</span>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveStep(2)}
                        disabled={!selectedFlow}
                        className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] disabled:opacity-50 text-white text-xs font-semibold rounded shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Continue to Audience</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* =========================================================================
                  STEP 2: CHOOSE YOUR AUDIENCE
                  ========================================================================= */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleStep(2)}
                  className="w-full px-5 py-3.5 flex items-center justify-between bg-white hover:bg-gray-50/70 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        completedSteps.has(2)
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeStep === 2
                          ? 'bg-[#0d3b30] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {completedSteps.has(2) ? <Check className="w-3.5 h-3.5" /> : '2'}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">Choose your audience</h2>
                      <p className="text-[11px] text-gray-500">
                        {csvStats.eligible > 0
                          ? `${csvStats.eligible} eligible recipients loaded (${csvFileName})`
                          : 'Upload a CSV of WhatsApp phone numbers and customer details'}
                      </p>
                    </div>
                  </div>
                  {activeStep === 2 ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {activeStep === 2 && (
                  <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-4">
                    {/* CSV Upload Dropzone */}
                    {processedRecipients.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center space-y-2.5 bg-white hover:bg-gray-50/50 transition-colors">
                        <Upload className="w-8 h-8 text-[#0d3b30] mx-auto stroke-[1.5]" />
                        <div>
                          <label className="inline-block px-4 py-2 bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-semibold rounded shadow-xs cursor-pointer">
                            <span>Upload Audience CSV</span>
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
                        <p className="text-[11px] text-gray-500 max-w-md mx-auto leading-relaxed">
                          Accepts CSV files with <span className="font-mono font-semibold">phone_number</span> or <span className="font-mono font-semibold">phone</span>, and optional <span className="font-mono">name</span>, <span className="font-mono">email</span> columns.
                        </p>
                        <button
                          type="button"
                          onClick={handleDownloadSampleCsv}
                          className="text-[11px] text-[#0d3b30] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer pt-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Download Sample CSV Template</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 bg-white p-3.5 rounded-lg border border-emerald-200 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="font-bold text-xs text-gray-900">
                              Audience CSV Loaded ({csvFileName})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setValidationModalOpen(true)}
                              className="text-[11px] font-semibold text-[#0d3b30] hover:underline cursor-pointer"
                            >
                              View Validation
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
                          <div className="bg-gray-50 p-2.5 rounded border border-gray-200 text-center">
                            <div className="text-[10px] text-gray-500 font-medium">Total Rows</div>
                            <div className="font-bold text-sm text-gray-900 mt-0.5">{csvStats.total}</div>
                          </div>
                          <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200 text-center">
                            <div className="text-[10px] text-emerald-700 font-semibold">Valid (Will Send)</div>
                            <div className="font-bold text-sm text-emerald-900 mt-0.5">{csvStats.eligible}</div>
                          </div>
                          <div className="bg-red-50 p-2.5 rounded border border-red-200 text-center">
                            <div className="text-[10px] text-red-700 font-semibold">Invalid Phones</div>
                            <div className="font-bold text-sm text-red-900 mt-0.5">{csvStats.invalid}</div>
                          </div>
                          <div className="bg-amber-50 p-2.5 rounded border border-amber-200 text-center">
                            <div className="text-[10px] text-amber-700 font-semibold">Duplicates Removed</div>
                            <div className="font-bold text-sm text-amber-900 mt-0.5">{csvStats.duplicates}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveStep(3)}
                        disabled={csvStats.eligible === 0}
                        className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] disabled:opacity-50 text-white text-xs font-semibold rounded shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Configure Flow Message</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* =========================================================================
                  STEP 3: CONFIGURE FLOW
                  ========================================================================= */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleStep(3)}
                  className="w-full px-5 py-3.5 flex items-center justify-between bg-white hover:bg-gray-50/70 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        completedSteps.has(3)
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeStep === 3
                          ? 'bg-[#0d3b30] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {completedSteps.has(3) ? <Check className="w-3.5 h-3.5" /> : '3'}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">Configure Flow</h2>
                      <p className="text-[11px] text-gray-500">
                        Customize WhatsApp message copy, CTA label, and field mappings
                      </p>
                    </div>
                  </div>
                  {activeStep === 3 ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {activeStep === 3 && (
                  <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-4 text-xs">
                    {/* Header Text */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Header Text (Optional)
                      </label>
                      <input
                        type="text"
                        value={headerText}
                        onChange={(e) => setHeaderText(e.target.value)}
                        placeholder="e.g. Feedback & Survey"
                        maxLength={60}
                        className="w-full h-8 px-3 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#0d3b30]"
                      />
                    </div>

                    {/* Body Text */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Body Message Text <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={bodyText}
                        onChange={(e) => setBodyText(e.target.value)}
                        placeholder="Enter the message text introducing the Flow..."
                        maxLength={1024}
                        className="w-full p-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#0d3b30]"
                      />
                    </div>

                    {/* Flow CTA Button Text */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Flow CTA Button Text <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={ctaText}
                        onChange={(e) => setCtaText(e.target.value)}
                        placeholder="Give Feedback"
                        maxLength={20}
                        className="w-full h-8 px-3 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#0d3b30]"
                      />
                      <p className="text-[11px] text-gray-400">
                        Max 20 characters. Label displayed on the interactive WhatsApp Flow button.
                      </p>
                    </div>

                    {/* Footer Text */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Footer Text (Optional)
                      </label>
                      <input
                        type="text"
                        value={footerText}
                        onChange={(e) => setFooterText(e.target.value)}
                        placeholder="e.g. ARCO Communication"
                        maxLength={60}
                        className="w-full h-8 px-3 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#0d3b30]"
                      />
                    </div>

                    {/* Flow Variable Mapping */}
                    <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900">Flow Data & Variable Mapping</span>
                        <span className="text-[10px] text-gray-500">Auto-resolved</span>
                      </div>

                      {csvHeaders.length > 0 ? (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[11px] text-gray-500 leading-relaxed">
                            The following CSV columns will be passed to your Flow screens for personalization:
                          </p>
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            {csvHeaders.map((h) => (
                              <div
                                key={h}
                                className="px-2.5 py-1.5 rounded bg-white border border-gray-200 flex items-center justify-between text-[11px]"
                              >
                                <span className="font-mono text-gray-600">{h}</span>
                                <span className="text-gray-400">→</span>
                                <span className="font-mono font-semibold text-[#0d3b30]">{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded bg-blue-50 border border-blue-100 flex items-center gap-2 text-[11px] text-blue-800">
                          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>This Flow does not require additional data. The recipient phone number will be used.</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setCompletedSteps((prev) => new Set([...prev, 3]));
                          setActiveStep(4);
                        }}
                        className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-semibold rounded shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Schedule Broadcast</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* =========================================================================
                  STEP 4: SCHEDULE YOUR FLOW
                  ========================================================================= */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleStep(4)}
                  className="w-full px-5 py-3.5 flex items-center justify-between bg-white hover:bg-gray-50/70 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        completedSteps.has(4)
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeStep === 4
                          ? 'bg-[#0d3b30] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {completedSteps.has(4) ? <Check className="w-3.5 h-3.5" /> : '4'}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">Schedule your Flow</h2>
                      <p className="text-[11px] text-gray-500">
                        {scheduleMode === 'now'
                          ? 'Send immediately upon launch'
                          : `Scheduled for ${scheduleDate} at ${scheduleTime} (${scheduleTimezone})`}
                      </p>
                    </div>
                  </div>
                  {activeStep === 4 ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {activeStep === 4 && (
                  <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-4 text-xs">
                    {/* Radio Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition-colors ${
                          scheduleMode === 'now'
                            ? 'border-[#0d3b30] bg-emerald-50/30'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="scheduleMode"
                          checked={scheduleMode === 'now'}
                          onChange={() => setScheduleMode('now')}
                          className="mt-0.5 text-[#0d3b30] focus:ring-[#0d3b30]"
                        />
                        <div>
                          <div className="font-bold text-xs text-gray-900">Send immediately</div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Queue recipients and dispatch through Meta API immediately upon launch.
                          </p>
                        </div>
                      </label>

                      <label
                        className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition-colors ${
                          scheduleMode === 'custom'
                            ? 'border-[#0d3b30] bg-emerald-50/30'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="scheduleMode"
                          checked={scheduleMode === 'custom'}
                          onChange={() => setScheduleMode('custom')}
                          className="mt-0.5 text-[#0d3b30] focus:ring-[#0d3b30]"
                        />
                        <div>
                          <div className="font-bold text-xs text-gray-900">Schedule for later</div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Set a specific date, time, and timezone for automated background dispatch.
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Custom Schedule Pickers */}
                    {scheduleMode === 'custom' && (
                      <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full h-8 px-2.5 rounded border border-gray-300 bg-white text-xs text-gray-800 focus:outline-none focus:border-[#0d3b30]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            Time
                          </label>
                          <input
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="w-full h-8 px-2.5 rounded border border-gray-300 bg-white text-xs text-gray-800 focus:outline-none focus:border-[#0d3b30]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            Timezone
                          </label>
                          <select
                            value={scheduleTimezone}
                            onChange={(e) => setScheduleTimezone(e.target.value)}
                            className="w-full h-8 px-2 rounded border border-gray-300 bg-white text-xs text-gray-800 focus:outline-none focus:border-[#0d3b30]"
                          >
                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                            <option value="UTC">UTC (Universal)</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Summary Card */}
                    <div className="border border-emerald-200 bg-emerald-50/50 rounded-lg p-3.5 space-y-2">
                      <div className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Flow Broadcast Pre-Send Summary</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-gray-500">Selected Flow:</span>
                          <div className="font-bold text-gray-900 mt-0.5">
                            {selectedFlow?.name || selectedFlow?.title || 'None'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Recipients:</span>
                          <div className="font-bold text-emerald-800 mt-0.5">
                            {csvStats.eligible} contacts
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Filtered:</span>
                          <div className="font-bold text-gray-600 mt-0.5">
                            {csvStats.invalid + csvStats.duplicates} removed
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Dispatch Time:</span>
                          <div className="font-bold text-gray-900 mt-0.5">
                            {scheduleMode === 'now' ? 'Immediate' : `${scheduleDate} ${scheduleTime}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Live WhatsApp Phone Mockup */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="sticky top-20 w-full max-w-[340px] space-y-2.5">
                {/* OS Switcher */}
                <div className="flex items-center justify-between px-1">
                  <div className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>WhatsApp Phone Preview</span>
                  </div>
                  <div className="flex items-center bg-gray-200 p-0.5 rounded text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setPhoneOs('android')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        phoneOs === 'android' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600'
                      }`}
                    >
                      Android
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoneOs('ios')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        phoneOs === 'ios' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600'
                      }`}
                    >
                      iOS
                    </button>
                  </div>
                </div>

                {/* Phone Frame */}
                <div className="w-full bg-[#111b21] rounded-[36px] p-3 shadow-2xl border-4 border-gray-800">
                  {/* Speaker notch */}
                  <div className="w-20 h-3 bg-gray-800 rounded-full mx-auto mb-2" />

                  {/* Inner Screen */}
                  <div className="bg-[#0b141a] rounded-[26px] overflow-hidden flex flex-col h-[520px] relative">
                    {/* WhatsApp Chat Header */}
                    <div className="bg-[#1f2c34] px-3 py-2 flex items-center justify-between text-white border-b border-gray-700/50">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#0d3b30] flex items-center justify-center text-emerald-400 font-bold text-xs">
                          A
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight flex items-center gap-1">
                            <span>ARCO Communication</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                          </div>
                          <div className="text-[9px] text-gray-400">Official Business Account</div>
                        </div>
                      </div>
                      <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                    </div>

                    {/* WhatsApp Chat Wallpaper & Message Bubble */}
                    <div className="flex-1 p-3 flex flex-col justify-end bg-[#0b141a] bg-opacity-95 space-y-2">
                      {/* Interactive Flow Message Card */}
                      <div className="bg-[#1f2c34] text-white rounded-lg rounded-tl-none p-3 max-w-[270px] shadow-md border border-gray-700/40 space-y-2">
                        {/* Header text if present */}
                        {headerText && (
                          <div className="text-xs font-bold text-emerald-400 border-b border-gray-700/60 pb-1">
                            {headerText}
                          </div>
                        )}

                        {/* Body text */}
                        <div className="text-[11px] text-gray-200 leading-relaxed">
                          {bodyText || 'Please complete our quick interactive form.'}
                        </div>

                        {/* Footer text */}
                        {footerText && (
                          <div className="text-[9px] text-gray-400 pt-0.5">
                            {footerText}
                          </div>
                        )}

                        {/* Interactive Flow CTA Button */}
                        <div className="pt-1.5 border-t border-gray-700/80">
                          <div className="w-full py-1.5 px-3 rounded bg-[#0d3b30] hover:bg-[#154d3f] text-emerald-300 font-bold text-[11px] text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
                            <Workflow className="w-3.5 h-3.5" />
                            <span>{ctaText || 'Give Feedback'}</span>
                          </div>
                        </div>

                        {/* Timestamp & double check */}
                        <div className="flex items-center justify-end gap-1 text-[9px] text-gray-400 pt-0.5">
                          <span>14:00</span>
                          <span className="text-emerald-400">✓✓</span>
                        </div>
                      </div>

                      {/* Info Note on Preview */}
                      <div className="text-[10px] text-center text-gray-400 font-mono py-1">
                        Meta Flow ID: {selectedFlow?.metaFlowId || '2951519895208552'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* =========================================================================
          MODAL: VIEW CSV AUDIENCE VALIDATION
          ========================================================================= */}
      {validationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Audience CSV Validation</h2>
                <p className="text-[11px] text-gray-500">
                  Detailed inspection of all {processedRecipients.length} rows parsed from {csvFileName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setValidationModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-[11px] text-gray-600">
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Phone</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Validation Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {processedRecipients.slice(0, 100).map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/60">
                      <td className="py-2.5 px-3 font-semibold text-gray-900">{r.name}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-700">{r.displayPhone || r.phone}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            r.status === 'Eligible'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : r.status === 'Duplicate'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-gray-500">
                        {r.reason || 'Phone valid E.164'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {processedRecipients.length > 100 && (
                <div className="text-center text-[11px] text-gray-400 pt-3">
                  Showing first 100 of {processedRecipients.length} rows.
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setValidationModalOpen(false)}
                className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-semibold rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SEND TEST FLOW
          ========================================================================= */}
      {testModalOpen && selectedFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0d3b30]">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Send Test Flow</h2>
                  <p className="text-[11px] text-gray-500">Dispatch live to test phone number</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendTestSubmit}>
              <div className="p-6 space-y-4 text-xs">
                <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/50">
                  <span className="text-[11px] text-gray-500 font-medium">Selected Flow</span>
                  <div className="font-semibold text-gray-900 mt-0.5">
                    {selectedFlow.name || selectedFlow.title} ({selectedFlow.metaFlowId || selectedFlow.id})
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Recipient Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+91 99208 58396"
                    className="w-full h-9 px-3 rounded border border-gray-300 text-xs text-gray-800 focus:outline-none focus:border-[#0d3b30]"
                  />
                  <p className="text-[11px] text-gray-400">
                    Enter the phone number with country code (e.g. +91 99208 58396)
                  </p>
                </div>
              </div>

              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50/50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="h-8 px-3 text-xs text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingTest}
                  className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] disabled:opacity-60 text-white font-semibold text-xs rounded flex items-center gap-1"
                >
                  {sendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send Flow</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
