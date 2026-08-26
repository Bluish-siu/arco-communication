import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  X,
  Search,
  RefreshCw,
  Plus,
  ChevronRight,
  CheckCircle2,
  Users,
  Clock,
  Phone,
  Video,
  MoreVertical,
  Check,
  Send,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { campaignsService } from '../../services/campaignsService';

// WhatsApp SVG Icon
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function CreateCampaignWorkspace({
  isOpen,
  onClose,
  onSuccess,
  currentCampaignType = 'onetime',
}) {
  if (!isOpen) return null;

  // Wizard Step:
  // 1: Interakt Template Selection Screen (Left: Sample/Active List, Right: Smartphone Preview)
  // 2: Campaign Details (Name, Category)
  // 3: Audience & Recipients (All, Segment, Tag, Saved Segment, Opt-in toggle)
  // 4: Configure Variables
  // 5: Schedule Broadcast
  // 6: Review & Launch
  // 7: Success confirmation
  const [step, setStep] = useState(1);

  // Tabs in Step 1: 'samples' | 'active'
  const [templateTab, setTemplateTab] = useState('samples');
  const [searchTheme, setSearchTheme] = useState('');
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Templates Data
  const [samplesList, setSamplesList] = useState([]);
  const [activeList, setActiveList] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Form State
  const [campaignName, setCampaignName] = useState('');
  const [campaignCategory, setCampaignCategory] = useState('Marketing');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [audienceType, setAudienceType] = useState('all');
  const [selectedSavedSegment, setSelectedSavedSegment] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [whatsappOptedOnly, setWhatsappOptedOnly] = useState(true);
  const [variableValues, setVariableValues] = useState({ 1: 'Customer', 2: 'Special Offer' });
  const [scheduleType, setScheduleType] = useState('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [scheduleTimezone, setScheduleTimezone] = useState('Asia/Kolkata');
  const [recurringFrequency, setRecurringFrequency] = useState('Daily');

  // Audience calculations from API
  const [audienceStats, setAudienceStats] = useState({
    recipientCount: 1450,
    savedSegments: [],
    tags: [],
    segments: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load Templates on mount & tab change
  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      if (templateTab === 'samples') {
        const data = await campaignsService.getTemplates({ isSample: true, search: searchTheme });
        const list = Array.isArray(data) ? data : [];
        setSamplesList(list);
        if (list.length > 0 && (!selectedTemplate || selectedTemplate.isSample === false)) {
          setSelectedTemplate(list[0]);
        }
      } else {
        const data = await campaignsService.getTemplates({ isSample: false, search: searchTheme });
        const list = Array.isArray(data) ? data : [];
        setActiveList(list);
        if (list.length > 0) {
          setSelectedTemplate(list[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to load templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [templateTab, searchTheme]);

  // Load Audience stats
  useEffect(() => {
    async function fetchAudience() {
      try {
        const res = await campaignsService.getAudiences({
          audienceType,
          segment: selectedSegment,
          tag: selectedTag,
          savedSegmentId: selectedSavedSegment,
          whatsapp_opted: whatsappOptedOnly ? 'true' : undefined,
        });
        if (res && res.recipientCount !== undefined) {
          setAudienceStats({
            recipientCount: res.recipientCount,
            savedSegments: res.savedSegments || [],
            tags: res.tags || [],
            segments: res.segments || [],
          });
        }
      } catch (err) {
        console.warn('Failed to fetch audience reach:', err);
      }
    }
    fetchAudience();
  }, [audienceType, selectedSegment, selectedTag, selectedSavedSegment, whatsappOptedOnly, step]);

  // Select template & proceed into campaign configuration
  const handleUseSample = (templateToUse) => {
    const tmpl = templateToUse || selectedTemplate;
    if (tmpl) {
      setSelectedTemplate(tmpl);
      setCampaignName(tmpl.name ? `${tmpl.name} Broadcast` : 'WhatsApp Campaign');
      setCampaignCategory(tmpl.category === 'UTILITY' ? 'Utility' : 'Marketing');
    }
    setStep(2);
  };

  // Create From Scratch (skips sample selection)
  const handleCreateFromScratch = () => {
    setSelectedTemplate({
      id: `custom_${Date.now()}`,
      name: 'Custom WhatsApp Campaign',
      category: 'MARKETING',
      language: 'en_US',
      headerText: 'Special Announcement',
      bodyText: 'Hi {{1}}, thank you for choosing ARCO! Here is an exclusive update for you: {{2}}.',
      footerText: 'ARCO Communication',
      buttons: [{ type: 'QUICK_REPLY', text: 'Talk to Support' }],
    });
    setCampaignName('New WhatsApp Broadcast');
    setCampaignCategory('Marketing');
    setStep(2);
  };

  // Submit Campaign
  const handleFinalize = async () => {
    if (!campaignName.trim()) {
      setErrorMessage('Please provide a campaign name');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const isSchedule = scheduleType === 'schedule' && scheduleDate;
    const scheduledTimestamp = isSchedule
      ? new Date(`${scheduleDate}T${scheduleTime || '10:00'}:00`).toISOString()
      : new Date().toISOString();

    const payload = {
      name: campaignName.trim(),
      description: campaignDescription.trim(),
      channel: 'whatsapp',
      type: currentCampaignType,
      category: campaignCategory,
      recipients: audienceStats?.recipientCount || 1450,
      scheduledFor: scheduledTimestamp,
      scheduleTimezone,
      audienceType,
      audienceFilter: {
        segment: selectedSegment,
        tag: selectedTag,
        savedSegmentId: selectedSavedSegment,
        whatsappOptedOnly,
      },
      templateId: selectedTemplate?.id,
      templateName: selectedTemplate?.name || 'WhatsApp Template',
      templateLanguage: selectedTemplate?.language || 'en_US',
      templateCategory: selectedTemplate?.category || 'MARKETING',
      templatePayload: selectedTemplate || {},
      variableMapping: variableValues,
      recurringConfig: currentCampaignType === 'ongoing' ? { frequency: recurringFrequency, time: scheduleTime, timezone: scheduleTimezone } : {},
      status: 'Scheduled',
    };

    try {
      await campaignsService.createCampaign(payload);
      setStep(7); // Show Success Screen
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render variables inside message body preview
  const getInterpolatedBody = () => {
    if (!selectedTemplate) return 'Hi {{1}}, welcome to ARCO!';
    let text = selectedTemplate.bodyText || selectedTemplate.body || '';
    Object.entries(variableValues || {}).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v || `{{${k}}}`);
    });
    return text;
  };

  const currentTemplateList = templateTab === 'samples' ? samplesList : activeList;

  return (
    <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-2xs z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      
      {/* Large Campaign Creation Container */}
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-5xl h-[92vh] max-h-[820px] flex flex-col font-sans overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
        
        {/* ========================================================================= */}
        {/* TOP HEADER: < Create New Campaign | + Create from scratch | X             */}
        {/* ========================================================================= */}
        <div className="h-12 border-b border-gray-200 px-5 flex items-center justify-between bg-white shrink-0">
          
          <div className="flex items-center gap-3">
            {step > 1 && step < 7 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">
              {step === 1 && 'Create New Campaign'}
              {step === 2 && 'Step 2: Campaign Details'}
              {step === 3 && 'Step 3: Audience & Recipients'}
              {step === 4 && 'Step 4: Configure Variables'}
              {step === 5 && 'Step 5: Schedule Broadcast'}
              {step === 6 && 'Step 6: Review & Launch'}
              {step === 7 && 'Campaign Scheduled!'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {step === 1 && (
              <button
                type="button"
                onClick={handleCreateFromScratch}
                className="text-xs font-semibold text-[#0d3b30] hover:text-[#154d3f] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create from scratch</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* MAIN BODY                                                                 */}
        {/* ========================================================================= */}
        <div className="flex-1 min-h-0 flex flex-col bg-[#fdfdfd]">
          
          {/* STEP 1: INTERAKT TEMPLATE SELECTION (LEFT: LIST, RIGHT: SMARTPHONE) */}
          {step === 1 && (
            <div className="flex-1 min-h-0 flex flex-col md:flex-row">
              
              {/* LEFT SIDE: Template/Sample List */}
              <div className="w-full md:w-[50%] lg:w-[48%] border-r border-gray-200 flex flex-col bg-white">
                
                {/* Tabs: Sample Ideas | Active Templates */}
                <div className="border-b border-gray-200 flex items-center px-4 pt-2 text-xs font-medium gap-6 bg-gray-50/50">
                  <button
                    type="button"
                    onClick={() => setTemplateTab('samples')}
                    className={`pb-2.5 transition-colors cursor-pointer ${
                      templateTab === 'samples'
                        ? 'border-b-2 border-[#0d3b30] text-[#0d3b30] font-semibold -mb-[1px]'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Sample Ideas
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemplateTab('active')}
                    className={`pb-2.5 transition-colors cursor-pointer ${
                      templateTab === 'active'
                        ? 'border-b-2 border-[#0d3b30] text-[#0d3b30] font-semibold -mb-[1px]'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Active Templates
                  </button>
                </div>

                {/* Search by Theme & Refresh List */}
                <div className="p-3 border-b border-gray-100 flex items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by Theme"
                      value={searchTheme}
                      onChange={(e) => setSearchTheme(e.target.value)}
                      className="w-full h-8 pl-8 pr-3 rounded border border-gray-300 bg-white text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={loadTemplates}
                    className="h-8 px-2.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                    title="Refresh List"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingTemplates ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh List</span>
                  </button>
                </div>

                {/* Template Rows List (Scrollable) */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                  {loadingTemplates ? (
                    <div className="p-12 text-center text-gray-400 space-y-2">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#0d3b30]" />
                      <p className="text-xs">Loading templates...</p>
                    </div>
                  ) : currentTemplateList.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                      No templates found matching your query
                    </div>
                  ) : (
                    currentTemplateList.map((tmpl) => {
                      const isSelected = selectedTemplate?.id === tmpl.id;
                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => setSelectedTemplate(tmpl)}
                          className={`p-3 transition-colors cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-50/70 border-l-4 border-[#0d3b30] pl-2.5'
                              : 'hover:bg-gray-50/80 border-l-4 border-transparent'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className={`font-semibold text-xs truncate ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                              {tmpl.name}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              ({tmpl.language === 'hi_IN' ? 'Hindi' : 'English'})
                            </div>
                          </div>

                          <div className="text-[11px] font-medium text-gray-500 capitalize shrink-0">
                            {tmpl.category?.toLowerCase() || 'marketing'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>

              {/* RIGHT SIDE: Smartphone Phone Preview */}
              <div className="w-full md:w-[50%] lg:w-[52%] bg-[#f4f5f7] flex flex-col items-center justify-center p-4 relative overflow-y-auto">
                
                {/* Phone Mockup Frame */}
                <div className="w-[300px] sm:w-[320px] bg-black rounded-[36px] p-2.5 shadow-2xl border-4 border-gray-800 relative flex flex-col">
                  
                  {/* Speaker / Camera Notch */}
                  <div className="w-24 h-4 bg-black rounded-b-xl mx-auto absolute top-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-gray-900 border border-gray-700 mr-2" />
                    <div className="w-8 h-1 rounded-full bg-gray-800" />
                  </div>

                  {/* Phone Screen Container */}
                  <div className="w-full bg-[#efeae2] rounded-[28px] overflow-hidden flex flex-col h-[460px] relative text-[11px]">
                    
                    {/* WhatsApp Top Bar */}
                    <div className="bg-[#075e54] text-white px-3 pt-6 pb-2 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center border border-emerald-500">
                          A
                        </div>
                        <div>
                          <div className="font-semibold text-xs leading-tight">ARCO Business</div>
                          <div className="text-[9px] text-emerald-200">Verified Business Account</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 text-white/80">
                        <Video className="w-3.5 h-3.5" />
                        <Phone className="w-3.5 h-3.5" />
                        <MoreVertical className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Chat Bubble Area with Wallpaper */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-2 flex flex-col justify-start">
                      
                      {/* Security Notice Pill */}
                      <div className="bg-[#ffeecd] border border-[#f5d998] text-[9px] text-amber-900 p-1.5 rounded text-center shadow-2xs">
                        Messages are end-to-end encrypted.
                      </div>

                      {/* WhatsApp Message Bubble */}
                      {selectedTemplate ? (
                        <div className="bg-white rounded-lg rounded-tl-none p-2.5 shadow-xs max-w-[92%] self-start space-y-1.5 text-gray-800 relative">
                          
                          {/* Header */}
                          {selectedTemplate.headerText && (
                            <div className="font-bold text-xs text-gray-900 border-b border-gray-100 pb-1">
                              {selectedTemplate.headerText}
                            </div>
                          )}

                          {/* Body with interpolated variables */}
                          <div className="whitespace-pre-line leading-relaxed text-[11px] text-gray-800">
                            {getInterpolatedBody()}
                          </div>

                          {/* Footer & Timestamp */}
                          <div className="flex items-center justify-between pt-1 text-[9px] text-gray-400">
                            <span>{selectedTemplate.footerText || ''}</span>
                            <span className="flex items-center gap-0.5 ml-auto">
                              10:42 AM
                              <Check className="w-3 h-3 text-blue-500 stroke-[2.5]" />
                            </span>
                          </div>

                          {/* Interactive Buttons */}
                          {Array.isArray(selectedTemplate.buttons) && selectedTemplate.buttons.length > 0 && (
                            <div className="pt-1.5 border-t border-gray-100 space-y-1">
                              {selectedTemplate.buttons.map((btn, idx) => (
                                <div
                                  key={idx}
                                  className="w-full py-1 text-center font-semibold text-blue-600 bg-blue-50/50 hover:bg-blue-50 rounded text-[10px] border border-blue-100 cursor-pointer"
                                >
                                  {btn.text || 'View Offer'}
                                </div>
                              ))}
                            </div>
                          )}

                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-400 italic">
                          Select a template to preview message
                        </div>
                      )}

                    </div>

                  </div>
                </div>

                {/* Bottom Action inside preview column: [ Use this Sample ] */}
                <div className="w-full mt-4 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleUseSample(selectedTemplate)}
                    className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-semibold text-xs rounded shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Use this Sample</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* STEP 2: CAMPAIGN DETAILS */}
          {step === 2 && (
            <div className="p-6 max-w-xl mx-auto w-full space-y-4">
              {errorMessage && (
                <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Diwali Mega Sale Announcement"
                  className="w-full h-9 px-3 rounded border border-gray-300 text-xs focus:outline-none focus:border-gray-400 bg-white"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={campaignCategory}
                    onChange={(e) => setCampaignCategory(e.target.value)}
                    className="w-full h-9 px-2.5 rounded border border-gray-300 text-xs bg-white focus:outline-none"
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Utility">Utility</option>
                    <option value="Authentication">Authentication</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Channel</label>
                  <input
                    type="text"
                    disabled
                    value="WhatsApp Business API"
                    className="w-full h-9 px-2.5 rounded border border-gray-200 bg-gray-50 text-xs text-gray-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
                  placeholder="Internal notes about goals, audience, or discount promo..."
                  className="w-full p-2.5 rounded border border-gray-300 text-xs focus:outline-none bg-white"
                />
              </div>
            </div>
          )}

          {/* STEP 3: AUDIENCE & RECIPIENTS */}
          {step === 3 && (
            <div className="p-6 max-w-xl mx-auto w-full space-y-4">
              <div className="p-3.5 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-between shadow-2xs">
                <div>
                  <div className="text-xs font-bold text-emerald-950">Targeted Audience Reach</div>
                  <div className="text-[11px] text-emerald-800 mt-0.5">Calculated in real-time from contacts</div>
                </div>
                <div className="text-xl font-bold text-[#0d3b30]">
                  {(audienceStats.recipientCount || 0).toLocaleString()} contacts
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700">Audience Segmentation</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'all', label: 'All Contacts' },
                    { id: 'saved_segment', label: 'Saved Segment' },
                    { id: 'tag', label: 'Filter by Tag' },
                    { id: 'segment', label: 'Lifecycle Segment' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAudienceType(opt.id)}
                      className={`p-3 rounded border text-left cursor-pointer transition-colors ${
                        audienceType === opt.id
                          ? 'border-[#0d3b30] bg-emerald-50/50 text-[#0d3b30] font-semibold'
                          : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="text-xs">{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {audienceType === 'saved_segment' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Choose Saved Segment</label>
                  <select
                    value={selectedSavedSegment}
                    onChange={(e) => setSelectedSavedSegment(e.target.value)}
                    className="w-full h-9 px-2.5 rounded border border-gray-300 text-xs bg-white"
                  >
                    <option value="">Select a saved segment...</option>
                    {audienceStats.savedSegments?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.estimated_count || s.estimatedCount || 0} contacts)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* WhatsApp Opt-in Filter Strip */}
              <div className="bg-[#f2fbf6] border border-[#d2edd8] rounded-md p-3 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappOptedOnly}
                    onChange={(e) => setWhatsappOptedOnly(e.target.checked)}
                    className="rounded text-[#0d3b30] focus:ring-0"
                  />
                  <span className="text-xs font-medium text-gray-800">
                    Only include customers whose 'WhatsApp opted' is true
                  </span>
                </label>
                <span className="bg-[#0d3b30] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Recommended
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIGURE VARIABLES */}
          {step === 4 && (
            <div className="p-6 max-w-2xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="font-semibold text-xs text-gray-800">Template Dynamic Variables</div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1 font-mono">&#123;&#123;1&#125;&#125; (Customer Name)</label>
                    <input
                      type="text"
                      value={variableValues[1] || ''}
                      onChange={(e) => setVariableValues({ ...variableValues, 1: e.target.value })}
                      className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1 font-mono">&#123;&#123;2&#125;&#125; (Offer / Key Detail)</label>
                    <input
                      type="text"
                      value={variableValues[2] || ''}
                      onChange={(e) => setVariableValues({ ...variableValues, 2: e.target.value })}
                      className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-xs text-gray-800">Live WhatsApp Preview</div>
                <div className="bg-[#e7f7ec] border border-[#d2edd8] rounded-lg p-3 text-xs text-gray-800 space-y-1.5 min-h-[140px]">
                  <div className="font-bold text-gray-900 border-b border-emerald-200/60 pb-1">
                    {selectedTemplate?.name}
                  </div>
                  <div className="whitespace-pre-line leading-relaxed text-[11px]">
                    {getInterpolatedBody()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SCHEDULE BROADCAST */}
          {step === 5 && (
            <div className="p-6 max-w-xl mx-auto w-full space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScheduleType('now')}
                  className={`p-3.5 rounded border text-left cursor-pointer transition-colors ${
                    scheduleType === 'now'
                      ? 'border-[#0d3b30] bg-emerald-50/50 text-[#0d3b30] font-semibold'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="text-xs">Send Immediately</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Broadcast once launched</div>
                </button>

                <button
                  type="button"
                  onClick={() => setScheduleType('schedule')}
                  className={`p-3.5 rounded border text-left cursor-pointer transition-colors ${
                    scheduleType === 'schedule'
                      ? 'border-[#0d3b30] bg-emerald-50/50 text-[#0d3b30] font-semibold'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="text-xs">Schedule for Later</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Select a future date & time</div>
                </button>
              </div>

              {scheduleType === 'schedule' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full h-9 px-2.5 rounded border border-gray-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full h-9 px-2.5 rounded border border-gray-300 text-xs bg-white"
                    />
                  </div>
                </div>
              )}

              {currentCampaignType === 'ongoing' && (
                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Recurring Frequency</label>
                  <select
                    value={recurringFrequency}
                    onChange={(e) => setRecurringFrequency(e.target.value)}
                    className="w-full h-9 px-2.5 rounded border border-gray-300 text-xs bg-white"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: REVIEW & LAUNCH */}
          {step === 6 && (
            <div className="p-6 max-w-xl mx-auto w-full space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-gray-200/60 pb-2">
                  <span className="text-gray-500">Campaign Name:</span>
                  <span className="font-bold text-gray-900">{campaignName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/60 pb-2">
                  <span className="text-gray-500">Channel:</span>
                  <span className="font-bold text-emerald-800">WhatsApp API</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/60 pb-2">
                  <span className="text-gray-500">Target Recipients:</span>
                  <span className="font-bold text-gray-900">{(audienceStats.recipientCount || 0).toLocaleString()} contacts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Broadcast Schedule:</span>
                  <span className="font-bold text-gray-900">
                    {scheduleType === 'now' ? 'Send Immediately' : `${scheduleDate} at ${scheduleTime}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: SUCCESS */}
          {step === 7 && (
            <div className="p-12 text-center space-y-3.5 max-w-md mx-auto my-auto">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Campaign Scheduled Successfully!</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                "{campaignName}" has been queued for broadcast to {(audienceStats.recipientCount || 0).toLocaleString()} contacts.
              </p>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* FOOTER ACTION BAR (For Steps 2 to 7)                                     */}
        {/* ========================================================================= */}
        {step > 1 && (
          <div className="h-12 border-t border-gray-200 px-5 flex items-center justify-between bg-white shrink-0">
            {step < 7 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="h-8 px-3 rounded border border-gray-300 hover:bg-gray-50 font-medium text-gray-700 cursor-pointer"
              >
                Back
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              {step < 6 && (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 2 && !campaignName.trim()) {
                      setErrorMessage('Please enter a campaign name');
                      return;
                    }
                    setStep(step + 1);
                  }}
                  className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-semibold text-xs rounded shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 6 && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalize}
                  className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] disabled:opacity-50 text-white font-semibold text-xs rounded shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Launching...' : 'Launch Campaign'}</span>
                </button>
              )}

              {step === 7 && (
                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-semibold text-xs rounded shadow-xs cursor-pointer"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
