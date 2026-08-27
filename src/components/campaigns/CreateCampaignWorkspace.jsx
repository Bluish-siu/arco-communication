import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Search,
  RefreshCw,
  Plus,
  ChevronRight,
  Phone,
  Video,
  MoreVertical,
  Check,
  Megaphone,
  Smartphone,
} from 'lucide-react';
import { campaignsService } from '../../services/campaignsService';

// Exact 14 Interakt Samples
const EXACT_14_INTERAKT_SAMPLES = [
  {
    id: 'tmpl_sample_01',
    name: 'Promotional Offer 01',
    category: 'MARKETING',
    language: 'en_US',
    headerText: 'Exciting Offers Just for You!',
    bodyText: "🎉 Enjoy exclusive offers at ARCO!\nGet the best experiences with our services. Don't miss out!\n\nBook now to avail these deals! 🚀\n\nFor more details, click below:\n📞 Contact us: +919920858396",
    footerText: 'Reply STOP to opt-out',
    buttons: [{ type: 'URL', text: 'Book Now' }, { type: 'QUICK_REPLY', text: 'Talk to Support' }],
  },
  {
    id: 'tmpl_sample_02',
    name: 'Promotional Discount 02',
    category: 'MARKETING',
    language: 'en_US',
    headerText: 'Flash Sale: 30% Off All Plans',
    bodyText: 'Hey {{1}}! Unlock 30% instant discount on all ARCO Communication automation workflows this week.\nUse code: FLASH30 at checkout.\n\nVisit: https://arco.ai/pricing',
    footerText: 'ARCO Marketing',
    buttons: [{ type: 'URL', text: 'Claim 30% Off' }, { type: 'QUICK_REPLY', text: 'Not Interested' }],
  },
  {
    id: 'tmpl_sample_03',
    name: 'Product Launch 03',
    category: 'MARKETING',
    language: 'en_US',
    headerText: '🚀 Introducing Autonomous AI Agents',
    bodyText: 'Hi {{1}}, upgrade your customer support with 24/7 self-learning AI agents built on Meta Cloud API.\nZero waiting time for your customers.\n\nSchedule your live demo now!',
    footerText: 'ARCO Product Team',
    buttons: [{ type: 'URL', text: 'Schedule Demo' }],
  },
  {
    id: 'tmpl_sample_04',
    name: 'Webinar Invite 04',
    category: 'MARKETING',
    language: 'en_US',
    headerText: 'Exclusive Masterclass Invitation',
    bodyText: 'Hello {{1}}, join our expert-led webinar on "Scaling D2C Brand Revenue via WhatsApp Marketing" this Thursday at 5 PM IST.\n\nReserve your free seat today!',
    footerText: 'Limited Seats Available',
    buttons: [{ type: 'URL', text: 'Register Free' }],
  },
  {
    id: 'tmpl_sample_05',
    name: 'Cart Recovery 05',
    category: 'MARKETING',
    language: 'en_US',
    headerText: 'You left something in your cart! 🛒',
    bodyText: 'Hey {{1}}, your items are waiting for you! Complete your order now and enjoy complimentary express delivery.\n\nItems reserved for next 2 hours.',
    footerText: 'ARCO Commerce Bot',
    buttons: [{ type: 'URL', text: 'Complete Order' }, { type: 'QUICK_REPLY', text: 'Need Help?' }],
  },
  {
    id: 'tmpl_sample_06',
    name: 'Feedback Survey 06',
    category: 'UTILITY',
    language: 'en_US',
    headerText: 'How was your experience?',
    bodyText: 'Hi {{1}}, thank you for contacting ARCO support today! How would you rate the assistance provided by our technical team?',
    footerText: 'Your feedback matters',
    buttons: [{ type: 'QUICK_REPLY', text: '⭐⭐⭐⭐⭐ Great' }, { type: 'QUICK_REPLY', text: '⭐⭐ Needs Improvement' }],
  },
  {
    id: 'tmpl_sample_07',
    name: 'Payment Reminder 07',
    category: 'UTILITY',
    language: 'en_US',
    headerText: 'Subscription Renewal Reminder',
    bodyText: 'Hello {{1}}, your ARCO Growth Plan subscription is due for renewal on {{2}}. Renew today to maintain uninterrupted messaging automation.',
    footerText: 'ARCO Billing Desk',
    buttons: [{ type: 'URL', text: 'Pay Online' }],
  },
  {
    id: 'tmpl_sample_08',
    name: 'Order Confirmation 08',
    category: 'UTILITY',
    language: 'en_US',
    headerText: 'Order #{{1}} Confirmed! ✅',
    bodyText: 'Thank you for your order, {{2}}! We are preparing your shipment. Track your parcel live at https://arco.ai/track/{{1}}.',
    footerText: 'Thank you for shopping with us',
    buttons: [{ type: 'URL', text: 'Track Order' }],
  },
  {
    id: 'tmpl_sample_09',
    name: 'Re-engagement 09',
    category: 'MARKETING',
    language: 'en_US',
    headerText: 'We miss you, {{1}}! ✨',
    bodyText: "It's been a while since your last visit. Here is an exclusive ₹500 voucher valid on your next purchase: WELCOMEBACK500.",
    footerText: 'Valid for 7 days',
    buttons: [{ type: 'URL', text: 'Redeem Voucher' }],
  },
  {
    id: 'tmpl_sample_10',
    name: 'Consultation Booking 10',
    category: 'MARKETING',
    language: 'en_US',
    headerText: 'Free 1-on-1 Strategy Session',
    bodyText: 'Hi {{1}}, talk to our enterprise solution architects to discuss custom omnichannel integrations for your business.',
    footerText: 'ARCO Sales Team',
    buttons: [{ type: 'URL', text: 'Book Demo Slot' }, { type: 'QUICK_REPLY', text: 'Call Me Today' }],
  },
  {
    id: 'tmpl_sample_11',
    name: 'Occasion Reminder 11',
    category: 'MARKETING',
    language: 'en_US',
    headerText: '✨ Festive Greetings from ARCO',
    bodyText: 'Dear {{1}}, wishing you and your team prosperity and joy! Explore our festive gift hampers and special subscription discounts.',
    footerText: 'ARCO Corporate Gifting',
    buttons: [{ type: 'URL', text: 'View Gift Hampers' }],
  },
  {
    id: 'tmpl_sample_12',
    name: 'Promotional Event 12',
    category: 'MARKETING',
    language: 'en_US',
    headerText: '🌟 Special Invitation Inside',
    bodyText: 'Hi {{1}},\nYou are cordially invited to our exclusive customer summit. Reserve your VIP pass today!',
    footerText: 'Limited seats available',
    buttons: [{ type: 'URL', text: 'Reserve VIP Pass' }],
  },
  {
    id: 'tmpl_sample_13',
    name: 'Informative Service 13',
    category: 'UTILITY',
    language: 'en_US',
    headerText: 'Monthly Invoice Available',
    bodyText: 'Hello {{1}}, your monthly subscription invoice #{{2}} is ready for download.',
    footerText: 'ARCO Billing',
    buttons: [{ type: 'URL', text: 'Download PDF' }],
  },
  {
    id: 'tmpl_sample_14',
    name: 'Support Ticket Update 14',
    category: 'UTILITY',
    language: 'en_US',
    headerText: 'Support Ticket Update',
    bodyText: 'Hi {{1}}, your support ticket #{{2}} has been marked as RESOLVED by our engineering team.',
    footerText: 'ARCO Customer Care',
    buttons: [{ type: 'QUICK_REPLY', text: 'Reopen Ticket' }, { type: 'QUICK_REPLY', text: 'Rate Support 5★' }],
  },
];

// WhatsApp Contextual SVG Icon
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function CreateCampaignWorkspace({
  isOpen,
  onClose,
}) {
  const navigate = useNavigate();

  // Tabs in Screen 1: 'active' (Meta Approved) | 'samples' (Sample Ideas)
  const [templateTab, setTemplateTab] = useState('active');
  const [searchTheme, setSearchTheme] = useState('');
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [phoneOs, setPhoneOs] = useState('android'); // 'android' | 'ios'

  // Templates Data
  const [sampleTemplates, setSampleTemplates] = useState(EXACT_14_INTERAKT_SAMPLES);
  const [metaApprovedTemplates, setMetaApprovedTemplates] = useState([]);
  const [activeTemplates, setActiveTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(EXACT_14_INTERAKT_SAMPLES[0]);

  // Load Templates from API on mount & tab change
  const loadTemplatesData = async () => {
    setLoadingTemplates(true);
    try {
      // 1. Fetch real Meta approved templates from connected WABA or DB cache
      const metaRes = await campaignsService.getMetaTemplates();
      const realMetaApproved = metaRes?.success && Array.isArray(metaRes.approved) ? metaRes.approved : [];
      setMetaApprovedTemplates(realMetaApproved);

      // 2. Fetch Sample Ideas (28 templates)
      const samplesRes = await campaignsService.getTemplates({ isSample: true, search: searchTheme });
      const sampleList = Array.isArray(samplesRes) && samplesRes.length > 0 ? samplesRes : EXACT_14_INTERAKT_SAMPLES;
      const filteredSamples = searchTheme.trim()
        ? sampleList.filter(
            (t) =>
              t.name.toLowerCase().includes(searchTheme.toLowerCase()) ||
              (t.headerText && t.headerText.toLowerCase().includes(searchTheme.toLowerCase())) ||
              t.category.toLowerCase().includes(searchTheme.toLowerCase())
          )
        : sampleList;
      setSampleTemplates(filteredSamples);

      // 3. Populate current active list depending on active tab
      if (templateTab === 'active' || templateTab === 'meta') {
        let list = realMetaApproved;
        if (list.length === 0) {
          const fallbackActive = await campaignsService.getTemplates({ isSample: false, search: searchTheme });
          list = Array.isArray(fallbackActive) ? fallbackActive : [];
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
        if (filteredSamples.length > 0 && !selectedTemplate) {
          setSelectedTemplate(filteredSamples[0]);
        }
      }
    } catch {
      setSampleTemplates(EXACT_14_INTERAKT_SAMPLES);
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTemplatesData();
    }
  }, [isOpen, templateTab, searchTheme]);

  if (!isOpen) return null;

  // 1. Create from Scratch: cleanly closes modal & navigates to canonical builder
  const handleCreateFromScratch = () => {
    if (onClose) onClose();
    navigate('/campaigns/create?mode=scratch');
  };

  // 2. Use This Sample: cleanly closes modal & navigates to canonical builder preloaded with template
  const handleUseSample = (tmpl) => {
    const templateToUse = tmpl || selectedTemplate || activeTemplates[0] || sampleTemplates[0];
    if (onClose) onClose();
    if (templateToUse?.id) {
      navigate(`/campaigns/create?templateId=${encodeURIComponent(templateToUse.id)}`);
    } else {
      navigate('/campaigns/create');
    }
  };

  // Render variables inside message body preview
  const getRenderedBody = () => {
    if (!selectedTemplate) return 'Hi {{1}}, welcome to ARCO!';
    return selectedTemplate.bodyText || selectedTemplate.body || '';
  };

  const currentTemplateList = templateTab === 'samples' ? sampleTemplates : activeTemplates;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-gray-950/60 backdrop-blur-2xs overflow-y-auto animate-in fade-in duration-150">
      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-[940px] h-[560px] max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 font-sans text-xs">
        
        {/* ========================================================================= */}
        {/* TOP HEADER: [icon] Create New Campaign | + Create from scratch | (X)      */}
        {/* ========================================================================= */}
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
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* TABS BAR: Sample Ideas | Active Templates | OS switch                      */}
        {/* ========================================================================= */}
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
                {metaApprovedTemplates.length || activeTemplates.length}
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

          {/* OS Switcher */}
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

        {/* ========================================================================= */}
        {/* MAIN BODY SPLIT                                                           */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-row min-h-0 bg-white">
          
          {/* LEFT SIDE: Template/Sample List */}
          <div className="w-[50%] border-r border-gray-200 flex flex-col bg-white">
            
            {/* Search by Theme & Refresh List */}
            <div className="p-3 border-b border-gray-100 flex items-center justify-between gap-2 bg-white shrink-0">
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
                onClick={loadTemplatesData}
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
                      <div className="min-w-0 pr-2 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs leading-tight truncate ${isSelected ? 'text-gray-900 font-bold' : 'text-gray-800 font-semibold'}`}>
                            {tmpl.name}
                          </span>
                          {(tmpl.status === 'APPROVED' || templateTab === 'active') && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                              {tmpl.status || 'APPROVED'}
                            </span>
                          )}
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

          {/* RIGHT SIDE: Smartphone Phone Preview */}
          <div className="w-[50%] bg-[#f4f5f7] flex flex-col items-center justify-center p-4 relative overflow-y-auto">
            
            {/* Phone Mockup Frame */}
            <div className={`w-[290px] sm:w-[310px] bg-black p-2.5 shadow-2xl border-4 border-gray-800 relative flex flex-col ${
              phoneOs === 'ios' ? 'rounded-[44px]' : 'rounded-[36px]'
            }`}>
              
              {/* Speaker / Camera Notch */}
              <div className="w-24 h-4 bg-black rounded-b-xl mx-auto absolute top-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gray-900 border border-gray-700 mr-2" />
                <div className="w-8 h-1 rounded-full bg-gray-800" />
              </div>

              {/* Phone Screen Container */}
              <div className="w-full bg-[#efeae2] rounded-[26px] overflow-hidden flex flex-col h-[380px] relative text-[11px]">
                
                {/* WhatsApp Top Bar */}
                <div className="bg-[#075e54] text-white px-3 pt-5 pb-2 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-[9px] flex items-center justify-center border border-emerald-500">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-xs leading-tight">ARCO Business</div>
                      <div className="text-[8px] text-emerald-200">Verified Business Account</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-white/80">
                    <Video className="w-3 h-3" />
                    <Phone className="w-3 h-3" />
                    <MoreVertical className="w-3 h-3" />
                  </div>
                </div>

                {/* Chat Bubble Area */}
                <div className="flex-1 p-2.5 overflow-y-auto space-y-2 flex flex-col justify-start">
                  
                  <div className="bg-[#ffeecd] border border-[#f5d998] text-[8px] text-amber-900 p-1 rounded text-center shadow-2xs">
                    Messages are end-to-end encrypted.
                  </div>

                  {selectedTemplate ? (
                    <div className="bg-white rounded-lg rounded-tl-none p-2 shadow-xs max-w-[95%] self-start space-y-1 text-gray-800 relative">
                      
                      {selectedTemplate.headerText && (
                        <div className="font-bold text-[11px] text-gray-900 border-b border-gray-100 pb-0.5">
                          {selectedTemplate.headerText}
                        </div>
                      )}

                      <div className="whitespace-pre-line leading-relaxed text-[10px] text-gray-800">
                        {getRenderedBody()}
                      </div>

                      <div className="flex items-center justify-between pt-0.5 text-[8px] text-gray-400">
                        <span>{selectedTemplate.footerText || ''}</span>
                        <span className="flex items-center gap-0.5 ml-auto">
                          10:42 AM
                          <Check className="w-2.5 h-2.5 text-blue-500 stroke-[2.5]" />
                        </span>
                      </div>

                      {Array.isArray(selectedTemplate.buttons) && selectedTemplate.buttons.length > 0 && (
                        <div className="pt-1 border-t border-gray-100 space-y-1">
                          {selectedTemplate.buttons.map((btn, idx) => (
                            <div
                              key={idx}
                              className="w-full py-0.5 text-center font-semibold text-blue-600 bg-blue-50/50 hover:bg-blue-50 rounded text-[9px] border border-blue-100 cursor-pointer"
                            >
                              {btn.text || 'View Offer'}
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

            {/* Bottom Action inside preview column: [ Use this Sample ] */}
            <div className="w-full mt-3 flex items-center justify-end">
              <button
                type="button"
                onClick={() => handleUseSample(selectedTemplate)}
                className="h-7 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-semibold text-xs rounded shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Use this Sample</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
