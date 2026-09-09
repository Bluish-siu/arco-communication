import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  Phone,
  ArrowUpRight,
  Sparkles,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Copy,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  MessageSquare,
  Upload,
  Link2,
  Play,
  Check,
  Eye,
  X,
  FileUp,
  RefreshCw,
  Film,
  Download,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { templateService } from '../services/templateService';

// Preset sample media assets for quick 1-click selection
const IMAGE_PRESETS = [
  {
    id: 'promo_banner',
    title: 'Mega Sale 50% Off Banner',
    desc: 'High-converting promotional e-commerce header',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
    tag: 'Promo 1.91:1',
  },
  {
    id: 'order_delivery',
    title: 'Order Confirmed & Dispatch',
    desc: 'E-commerce shipping & delivery notification',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    tag: 'Utility',
  },
  {
    id: 'vip_welcome',
    title: 'VIP Welcome & Loyalty Pass',
    desc: 'Customer onboarding & membership welcome',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
    tag: 'Welcome',
  },
  {
    id: 'event_invite',
    title: 'Exclusive Live Webinar / Event',
    desc: 'Conference & masterclass invitation visual',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    tag: 'Event',
  },
];

const VIDEO_PRESETS = [
  {
    id: 'product_tour',
    title: 'ARCO Platform Demo Video',
    desc: 'Interactive product walkthrough & motion demo',
    url: '/videos/hero-bg.mp4',
    tag: 'Local MP4 720p',
  },
  {
    id: 'motion_spotlight',
    title: 'Promotional Motion Showcase',
    desc: 'Fast-paced feature launch motion video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    tag: 'Stream MP4',
  },
  {
    id: 'getting_started',
    title: 'Customer Onboarding Reel',
    desc: 'Quick 15-second visual setup guide',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    tag: 'Quick Reel',
  },
];

const DOCUMENT_PRESETS = [
  {
    id: 'product_catalog',
    title: 'Official 2026 Product Catalog.pdf',
    desc: 'Complete product catalog & wholesale pricing',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    size: '420 KB',
  },
  {
    id: 'invoice_sample',
    title: 'Tax Invoice & Order Receipt.pdf',
    desc: 'Automated billing attachment for order confirmation',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    size: '180 KB',
  },
];

export default function NewTemplate() {
  const { user } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Template Form Fields
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState('MARKETING');
  const [language, setLanguage] = useState('en_US');
  const [headerType, setHeaderType] = useState('NONE');
  const [headerText, setHeaderText] = useState('');
  const [headerMediaUrl, setHeaderMediaUrl] = useState('');
  const [mediaFileName, setMediaFileName] = useState('');
  const [mediaFileSize, setMediaFileSize] = useState('');
  const [mediaSourceTab, setMediaSourceTab] = useState('UPLOAD'); // 'UPLOAD' | 'URL' | 'PRESET'
  const [customMediaUrlInput, setCustomMediaUrlInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const [body, setBody] = useState('');
  const [footer, setFooter] = useState('');
  const [buttons, setButtons] = useState([]);
  const [variables, setVariables] = useState([]);
  const [sampleVarValues, setSampleVarValues] = useState({});

  // Loading & Saving States
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Pre-fill from Library or existing template edit
  useEffect(() => {
    // 1. Check if opened via Library "Use this template"
    if (location.state?.prefilled) {
      const p = location.state.prefilled;
      setName(`${p.name}_custom_${Date.now().toString().slice(-4)}`);
      setDisplayName(p.display_name || p.name);
      setCategory(p.category || 'MARKETING');
      setLanguage(p.language || 'en_US');
      setHeaderType(p.header_type || 'NONE');
      setHeaderText(p.header_text || '');
      setHeaderMediaUrl(p.header_media_url || '');
      if (p.header_media_url) {
        setMediaFileName(p.header_media_url.split('/').pop() || 'media_asset');
      }
      setBody(p.body || '');
      setFooter(p.footer || '');
      setButtons(Array.isArray(p.buttons) ? p.buttons : JSON.parse(p.buttons || '[]'));
      setVariables(Array.isArray(p.variables) ? p.variables : JSON.parse(p.variables || '[]'));
    } else if (id) {
      // 2. Fetch existing template by ID
      const loadTemplate = async () => {
        setLoading(true);
        try {
          const t = await templateService.getTemplate(id);
          if (t) {
            setName(t.name);
            setDisplayName(t.display_name || t.name);
            setCategory(t.category || 'MARKETING');
            setLanguage(t.language || 'en_US');
            setHeaderType(t.header_type || 'NONE');
            setHeaderText(t.header_text || '');
            setHeaderMediaUrl(t.header_media_url || '');
            if (t.header_media_url) {
              setMediaFileName(t.header_media_url.split('/').pop() || 'media_asset');
            }
            setBody(t.body || '');
            setFooter(t.footer || '');
            setButtons(Array.isArray(t.buttons) ? t.buttons : JSON.parse(t.buttons || '[]'));
            setVariables(Array.isArray(t.variables) ? t.variables : JSON.parse(t.variables || '[]'));
          }
        } catch (err) {
          showToast('Failed to load template for edit', 'error');
        } finally {
          setLoading(false);
        }
      };
      loadTemplate();
    }
  }, [id, location.state]);

  // Extract variables whenever body changes
  useEffect(() => {
    const matches = (body || '').match(/\{\{(\d+)\}\}/g) || [];
    const uniqueNums = Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, ''))));
    
    // Auto-update variable list if count changed
    const currentVars = [...variables];
    const newVars = uniqueNums.map((num, i) => {
      return currentVars[i] || `Variable ${num}`;
    });
    setVariables(newVars);
  }, [body]);

  // Handle media file upload
  const handleMediaFileUpload = (file, type) => {
    if (!file) return;

    if (type === 'IMAGE') {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload a valid image file (PNG, JPG, JPEG, WEBP)', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size must be less than 5MB', 'error');
        return;
      }
    } else if (type === 'VIDEO') {
      if (!file.type.startsWith('video/')) {
        showToast('Please upload a valid video file (MP4, 3GPP)', 'error');
        return;
      }
      if (file.size > 16 * 1024 * 1024) {
        showToast('Video file size must be less than 16MB', 'error');
        return;
      }
    } else if (type === 'DOCUMENT') {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        showToast('Please upload a valid PDF document', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast('Document size must be less than 10MB', 'error');
        return;
      }
    }

    const readableSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    setMediaFileName(file.name);
    setMediaFileSize(readableSize);

    const reader = new FileReader();
    reader.onload = () => {
      setHeaderMediaUrl(reader.result);
      showToast(`${type} uploaded successfully!`);
    };
    reader.onerror = () => {
      showToast(`Failed to load ${type.toLowerCase()} file`, 'error');
    };
    reader.readAsDataURL(file);
  };

  // Apply custom media URL
  const handleApplyCustomUrl = () => {
    if (!customMediaUrlInput.trim()) {
      showToast('Please enter a valid media URL', 'error');
      return;
    }
    setHeaderMediaUrl(customMediaUrlInput.trim());
    setMediaFileName(customMediaUrlInput.split('/').pop() || `${headerType.toLowerCase()}_url`);
    setMediaFileSize('Remote URL');
    showToast(`${headerType} URL applied!`);
  };

  // Select Preset
  const handleSelectPreset = (preset) => {
    setHeaderMediaUrl(preset.url);
    setMediaFileName(preset.title);
    setMediaFileSize(preset.size || preset.tag || 'Sample Preset');
    showToast(`Selected "${preset.title}"`);
  };

  // Clear / Remove Media
  const handleRemoveMedia = () => {
    setHeaderMediaUrl('');
    setMediaFileName('');
    setMediaFileSize('');
    setCustomMediaUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast('Media header removed');
  };

  // Switch Header Type
  const handleSelectHeaderType = (type) => {
    setHeaderType(type);
    if (type === 'NONE') {
      setHeaderText('');
      setHeaderMediaUrl('');
    } else if (type === 'TEXT') {
      setHeaderMediaUrl('');
    } else if (type === 'IMAGE' || type === 'VIDEO' || type === 'DOCUMENT') {
      setHeaderText('');
    }
  };

  // Add variable {{X}} to body
  const handleAddVariable = () => {
    const matches = (body || '').match(/\{\{(\d+)\}\}/g) || [];
    const nextNum = matches.length + 1;
    setBody((prev) => `${prev} {{${nextNum}}}`);
  };

  // Add Button
  const handleAddButton = () => {
    if (buttons.length >= 3) {
      showToast('Maximum 3 buttons allowed', 'error');
      return;
    }
    setButtons([...buttons, { type: 'URL', text: 'Visit Website', url: 'https://' }]);
  };

  // Update Button
  const handleUpdateButton = (index, field, value) => {
    const updated = [...buttons];
    updated[index][field] = value;
    setButtons(updated);
  };

  // Remove Button
  const handleRemoveButton = (index) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  // Save as Draft
  const handleSave = async (status = 'DRAFT') => {
    if (!name.trim()) {
      showToast('Please enter a valid template name', 'error');
      return;
    }
    if (!body.trim()) {
      showToast('Please enter template message body', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name,
        displayName: displayName || name,
        category,
        language,
        headerType,
        headerText: headerType === 'TEXT' ? headerText : '',
        headerMediaUrl: ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerType) ? headerMediaUrl : '',
        body,
        footer,
        buttons,
        variables,
        status,
      };

      if (id) {
        await templateService.updateTemplate(id, payload);
        showToast('Template updated successfully');
      } else {
        await templateService.createTemplate(payload);
        showToast('Template created and saved in draft');
      }
      navigate('/templates/list?channel_type=whatsapp&segment=active');
    } catch (err) {
      showToast(err.message || 'Failed to save template', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit for Meta Approval
  const handleSubmitForApproval = async () => {
    if (!name.trim() || !body.trim()) {
      showToast('Please fill required fields before submitting', 'error');
      return;
    }

    if (headerType === 'TEXT' && !headerText.trim()) {
      showToast('Please enter Header Text or select NONE', 'error');
      return;
    }

    if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerType) && !headerMediaUrl) {
      showToast(`Please upload or select a sample ${headerType.toLowerCase()} header for Meta approval`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        displayName: displayName || name,
        category,
        language,
        headerType,
        headerText: headerType === 'TEXT' ? headerText : '',
        headerMediaUrl: ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerType) ? headerMediaUrl : '',
        body,
        footer,
        buttons,
        variables,
        status: 'APPROVED',
      };

      if (id) {
        await templateService.updateTemplate(id, payload);
        await templateService.submitTemplate(id);
      } else {
        const created = await templateService.createTemplate(payload);
        await templateService.submitTemplate(created.id);
      }
      showToast('Template submitted and APPROVED by Meta WhatsApp!');
      navigate('/templates/list?channel_type=whatsapp&segment=active');
    } catch (err) {
      showToast(err.message || 'Failed to submit template', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render live preview body replacing variables
  const renderPreviewBody = () => {
    if (!body) return 'Enter message body to see preview...';
    let text = body;
    variables.forEach((v, i) => {
      const val = sampleVarValues[`var_${i + 1}`] || `[${v}]`;
      const reg = new RegExp(`\\{\\{${i + 1}\\}\\}`, 'g');
      text = text.replace(reg, val);
    });
    return text;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800">
      
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top duration-200 ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-slate-900 text-white border-slate-800'
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

      <div className="flex-1 flex flex-row min-w-0">
        <DashboardSidebar />

        <main className="flex-1 ml-14 min-w-0 flex flex-col bg-slate-50/50 min-h-screen">
          
          {/* Header */}
          <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <Link
                to="/templates/list?channel_type=whatsapp&segment=library"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Back to Templates"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  {id ? 'Edit WhatsApp Template' : 'New WhatsApp Template'}
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  Design, preview, and submit Meta WhatsApp compliant message templates
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSave('DRAFT')}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitForApproval}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-xl bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit for Approval'}</span>
              </button>
            </div>
          </header>

          {/* Body Form + Live Preview */}
          <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col lg:flex-row gap-6 max-w-6xl w-full mx-auto">
            
            {/* LEFT FORM BUILDER */}
            <div className="flex-1 space-y-5">
              
              {/* 1. BASIC DETAILS CARD */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900">Template Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Template Identifier Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                      placeholder="e.g. order_status_update_v1"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-medium"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Lowercase, numbers, and underscores only
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Display Title
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Order Status Update"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white cursor-pointer"
                    >
                      <option value="MARKETING">Marketing</option>
                      <option value="UTILITY">Utility</option>
                      <option value="AUTHENTICATION">Authentication</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Language *
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white cursor-pointer"
                    >
                      <option value="en_US">English (en_US)</option>
                      <option value="hi_IN">Hindi (hi_IN)</option>
                      <option value="es_ES">Spanish (es_ES)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. HEADER CARD */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900">Header (Optional)</h3>
                  </div>

                  {headerType !== 'NONE' && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Active: {headerType}
                    </span>
                  )}
                </div>

                {/* Header Type Selection Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {[
                    { type: 'NONE', label: 'None', icon: null },
                    { type: 'TEXT', label: 'Text', icon: MessageSquare },
                    { type: 'IMAGE', label: 'Image', icon: ImageIcon },
                    { type: 'VIDEO', label: 'Video', icon: VideoIcon },
                    { type: 'DOCUMENT', label: 'Document', icon: FileText },
                  ].map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => handleSelectHeaderType(item.type)}
                        className={`p-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          headerType === item.type
                            ? 'bg-[#0d3b30] text-white border-[#0d3b30] shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {IconComp && <IconComp className="w-3.5 h-3.5 shrink-0" />}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 2.1 TEXT HEADER INPUT */}
                {headerType === 'TEXT' && (
                  <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-slate-700 text-xs">
                        Header Text (Max 60 characters) *
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {headerText.length} / 60
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={60}
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      placeholder="e.g. 🌟 Exclusive VIP Offer Inside"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400">
                      A prominent bold headline displayed at the very top of your WhatsApp message.
                    </p>
                  </div>
                )}

                {/* 2.2 IMAGE / VIDEO / DOCUMENT MEDIA SELECTION & UPLOAD */}
                {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerType) && (
                  <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                    
                    {/* Media Source Subtabs */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setMediaSourceTab('UPLOAD')}
                        className={`flex-1 py-1.5 px-3 rounded-xl font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                          mediaSourceTab === 'UPLOAD'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload {headerType === 'IMAGE' ? 'Image' : headerType === 'VIDEO' ? 'Video' : 'PDF'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMediaSourceTab('URL')}
                        className={`flex-1 py-1.5 px-3 rounded-xl font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                          mediaSourceTab === 'URL'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Direct URL</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMediaSourceTab('PRESET')}
                        className={`flex-1 py-1.5 px-3 rounded-xl font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                          mediaSourceTab === 'PRESET'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Sample Presets</span>
                      </button>
                    </div>

                    {/* SUBTAB 1: FILE UPLOAD (DRAG & DROP) */}
                    {mediaSourceTab === 'UPLOAD' && (
                      <div className="space-y-2">
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragOver(true);
                          }}
                          onDragLeave={() => setIsDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragOver(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleMediaFileUpload(file, headerType);
                          }}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                            isDragOver
                              ? 'border-emerald-500 bg-emerald-50/60'
                              : 'border-slate-300 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-400'
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={
                              headerType === 'IMAGE'
                                ? 'image/png,image/jpeg,image/jpg,image/webp'
                                : headerType === 'VIDEO'
                                ? 'video/mp4,video/3gpp,video/quicktime,video/webm'
                                : 'application/pdf,.pdf'
                            }
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleMediaFileUpload(file, headerType);
                            }}
                            className="hidden"
                          />

                          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                            {headerType === 'IMAGE' ? (
                              <ImageIcon className="w-5 h-5" />
                            ) : headerType === 'VIDEO' ? (
                              <VideoIcon className="w-5 h-5" />
                            ) : (
                              <FileText className="w-5 h-5" />
                            )}
                          </div>

                          <div className="font-extrabold text-xs text-slate-800">
                            Click to upload or drag and drop your {headerType.toLowerCase()}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {headerType === 'IMAGE' && 'Supported: JPG, PNG, WEBP (Max 5MB • 1.91:1 or 1:1 ratio)'}
                            {headerType === 'VIDEO' && 'Supported: MP4, 3GPP (Max 16MB • H.264 video codec)'}
                            {headerType === 'DOCUMENT' && 'Supported: PDF document (Max 10MB)'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* SUBTAB 2: DIRECT URL */}
                    {mediaSourceTab === 'URL' && (
                      <div className="space-y-2">
                        <label className="block font-bold text-slate-700 text-xs">
                          {headerType} Media URL (Public HTTPS link)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={customMediaUrlInput}
                            onChange={(e) => setCustomMediaUrlInput(e.target.value)}
                            placeholder={
                              headerType === 'IMAGE'
                                ? 'https://example.com/images/banner.jpg'
                                : headerType === 'VIDEO'
                                ? 'https://example.com/videos/promo.mp4'
                                : 'https://example.com/docs/catalog.pdf'
                            }
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCustomUrl}
                            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                          >
                            Apply URL
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Must be a publicly accessible direct media link (e.g. S3, Cloudinary, CDN).
                        </span>
                      </div>
                    )}

                    {/* SUBTAB 3: SAMPLE PRESETS */}
                    {mediaSourceTab === 'PRESET' && (
                      <div className="space-y-2.5">
                        <div className="text-[11px] font-bold text-slate-700">
                          Select a high-quality starter sample for instant testing:
                        </div>

                        {/* Image Presets */}
                        {headerType === 'IMAGE' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {IMAGE_PRESETS.map((preset) => {
                              const isSelected = headerMediaUrl === preset.url;
                              return (
                                <div
                                  key={preset.id}
                                  onClick={() => handleSelectPreset(preset)}
                                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                                    isSelected
                                      ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-2xs'
                                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  <img
                                    src={preset.url}
                                    alt={preset.title}
                                    className="w-14 h-12 object-cover rounded-xl shrink-0 border border-slate-200"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                      <h4 className="font-bold text-xs text-slate-900 truncate">
                                        {preset.title}
                                      </h4>
                                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded shrink-0">
                                        {preset.tag}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                      {preset.desc}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Video Presets */}
                        {headerType === 'VIDEO' && (
                          <div className="grid grid-cols-1 gap-2.5">
                            {VIDEO_PRESETS.map((preset) => {
                              const isSelected = headerMediaUrl === preset.url;
                              return (
                                <div
                                  key={preset.id}
                                  onClick={() => handleSelectPreset(preset)}
                                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                    isSelected
                                      ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-2xs'
                                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                                      <Play className="w-4 h-4 fill-current ml-0.5" />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-xs text-slate-900">
                                        {preset.title}
                                      </h4>
                                      <p className="text-[10px] text-slate-500">{preset.desc}</p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg shrink-0">
                                    {preset.tag}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Document Presets */}
                        {headerType === 'DOCUMENT' && (
                          <div className="grid grid-cols-1 gap-2.5">
                            {DOCUMENT_PRESETS.map((preset) => {
                              const isSelected = headerMediaUrl === preset.url;
                              return (
                                <div
                                  key={preset.id}
                                  onClick={() => handleSelectPreset(preset)}
                                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                    isSelected
                                      ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-2xs'
                                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-xs text-slate-900">
                                        {preset.title}
                                      </h4>
                                      <p className="text-[10px] text-slate-500">{preset.desc}</p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg shrink-0">
                                    {preset.size}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                      </div>
                    )}

                    {/* CURRENTLY SELECTED MEDIA ACTIVE BADGE & PREVIEW CARD */}
                    {headerMediaUrl && (
                      <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="font-extrabold text-xs text-emerald-900">
                              Selected {headerType} Header Ready
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveMedia}
                            className="text-[11px] text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>

                        {/* Visual Media Representation */}
                        {headerType === 'IMAGE' && (
                          <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-emerald-200/80">
                            <img
                              src={headerMediaUrl}
                              alt="Header Preview"
                              className="w-16 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-xs text-slate-900 truncate">
                                {mediaFileName || 'Selected Image Header'}
                              </div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                                <span>{mediaFileSize || 'Ready for WhatsApp'}</span>
                                <span>•</span>
                                <span className="text-emerald-700 font-semibold">Meta Compliant</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {headerType === 'VIDEO' && (
                          <div className="space-y-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-white">
                            <video
                              src={headerMediaUrl}
                              controls
                              className="w-full h-36 rounded-lg object-cover bg-black"
                            />
                            <div className="flex items-center justify-between text-[11px] px-1">
                              <span className="font-medium text-slate-300 truncate max-w-[200px]">
                                {mediaFileName || 'Selected Video Header'}
                              </span>
                              <span className="text-emerald-400 font-bold text-[10px]">
                                Playable Sample
                              </span>
                            </div>
                          </div>
                        )}

                        {headerType === 'DOCUMENT' && (
                          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-emerald-200/80">
                            <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-xs text-slate-900 truncate">
                                {mediaFileName || 'document.pdf'}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {mediaFileSize || 'PDF Document Attachment'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Meta Compliance Notice */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-2.5 text-[11px] text-slate-600">
                      <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800">Meta WhatsApp Requirement: </span>
                        When submitting a template with an image, video, or document header, Meta requires a sample media file so their review team can evaluate the message design and approval compliance.
                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* 3. MESSAGE BODY CARD */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900">Message Body *</h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddVariable}
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Variable</span>
                  </button>
                </div>

                <div>
                  <textarea
                    rows={6}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Hello {{1}}, your order #{{2}} has been confirmed..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>Variables detected: {variables.length}</span>
                    <span>{body.length} / 1024 chars</span>
                  </div>
                </div>

                {/* Variable Fallbacks */}
                {variables.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="font-bold text-xs text-slate-700">Sample Values for Preview</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {variables.map((v, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            {`{{${i + 1}}}`}
                          </span>
                          <input
                            type="text"
                            placeholder={v}
                            value={sampleVarValues[`var_${i + 1}`] || ''}
                            onChange={(e) =>
                              setSampleVarValues({
                                ...sampleVarValues,
                                [`var_${i + 1}`]: e.target.value,
                              })
                            }
                            className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. FOOTER CARD */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900">Footer (Optional)</h3>
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={60}
                    value={footer}
                    onChange={(e) => setFooter(e.target.value)}
                    placeholder="e.g. Reply STOP to opt-out"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>

              {/* 5. BUTTONS CARD */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      5
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900">Interactive Buttons</h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddButton}
                    disabled={buttons.length >= 3}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Button</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {buttons.map((btn, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs">
                      <select
                        value={btn.type}
                        onChange={(e) => handleUpdateButton(idx, 'type', e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
                      >
                        <option value="URL">Website URL</option>
                        <option value="PHONE_NUMBER">Phone Number</option>
                        <option value="QUICK_REPLY">Quick Reply</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Button Text"
                        value={btn.text}
                        onChange={(e) => handleUpdateButton(idx, 'text', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                      />

                      {btn.type === 'URL' && (
                        <input
                          type="text"
                          placeholder="https://example.com"
                          value={btn.url || ''}
                          onChange={(e) => handleUpdateButton(idx, 'url', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-[11px]"
                        />
                      )}

                      {btn.type === 'PHONE_NUMBER' && (
                        <input
                          type="text"
                          placeholder="+919876543210"
                          value={btn.phone_number || ''}
                          onChange={(e) => handleUpdateButton(idx, 'phone_number', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-[11px]"
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveButton(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {buttons.length === 0 && (
                    <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                      No buttons added (optional)
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT PHONE PREVIEW */}
            <div className="w-full lg:w-[360px] shrink-0">
              <div className="sticky top-20 bg-slate-900 rounded-3xl p-4 shadow-xl border border-slate-800 text-white space-y-3">
                
                {/* Phone Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center font-extrabold text-xs">
                      A
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">ARCO Official</div>
                      <div className="text-[9px] text-emerald-400">WhatsApp Business</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
                    Live Preview
                  </span>
                </div>

                {/* WhatsApp Message Preview Bubble */}
                <div className="bg-[#005c4b] text-emerald-50 rounded-2xl rounded-tr-none text-xs space-y-2.5 shadow-md overflow-hidden">
                  
                  {/* MEDIA HEADER (IMAGE) */}
                  {headerType === 'IMAGE' && (
                    headerMediaUrl ? (
                      <div className="relative group">
                        <img
                          src={headerMediaUrl}
                          alt="WhatsApp Header Preview"
                          className="w-full h-40 object-cover rounded-t-2xl"
                        />
                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          <span>IMAGE</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-emerald-900/60 border-b border-emerald-700/50 flex flex-col items-center justify-center gap-1 text-emerald-200/80 p-3 text-center">
                        <ImageIcon className="w-6 h-6 text-emerald-300" />
                        <span className="font-bold text-[11px]">Image Header Placeholder</span>
                        <span className="text-[9px] text-emerald-300/60">Select or upload an image in section 2</span>
                      </div>
                    )
                  )}

                  {/* MEDIA HEADER (VIDEO) */}
                  {headerType === 'VIDEO' && (
                    headerMediaUrl ? (
                      <div className="relative bg-black rounded-t-2xl overflow-hidden">
                        <video
                          src={headerMediaUrl}
                          controls
                          playsInline
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 pointer-events-none">
                          <VideoIcon className="w-3 h-3" />
                          <span>VIDEO</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-slate-950 border-b border-emerald-700/50 flex flex-col items-center justify-center gap-1 text-emerald-200/80 p-3 text-center">
                        <VideoIcon className="w-6 h-6 text-emerald-400" />
                        <span className="font-bold text-[11px]">Video Header Placeholder</span>
                        <span className="text-[9px] text-emerald-300/60">Select or upload a video in section 2</span>
                      </div>
                    )
                  )}

                  {/* MEDIA HEADER (DOCUMENT) */}
                  {headerType === 'DOCUMENT' && (
                    <div className="p-3 bg-emerald-900/80 border-b border-emerald-700/60 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-white truncate">
                          {mediaFileName || 'document_sample.pdf'}
                        </div>
                        <div className="text-[10px] text-emerald-300/70 flex items-center gap-1">
                          <span>{mediaFileSize || 'PDF Document'}</span>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-emerald-300 shrink-0" />
                    </div>
                  )}

                  {/* Inner text content container */}
                  <div className="p-3.5 space-y-2.5">
                    {/* TEXT Header */}
                    {headerType === 'TEXT' && headerText && (
                      <div className="font-extrabold text-emerald-100 text-xs border-b border-emerald-600/50 pb-1.5 leading-snug">
                        {headerText}
                      </div>
                    )}

                    {/* Body */}
                    <div className="whitespace-pre-line leading-relaxed text-[11px] text-emerald-50">
                      {renderPreviewBody()}
                    </div>

                    {/* Footer */}
                    {footer && (
                      <div className="text-[10px] text-emerald-300/80 pt-1 border-t border-emerald-600/40 italic">
                        {footer}
                      </div>
                    )}

                    {/* Time Stamp */}
                    <div className="text-[9px] text-emerald-300 text-right font-mono">10:45 AM ✓✓</div>
                  </div>

                </div>

                {/* Buttons Preview below bubble */}
                {buttons.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {buttons.map((btn, idx) => (
                      <div
                        key={idx}
                        className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        {btn.type === 'PHONE_NUMBER' ? (
                          <Phone className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        <span>{btn.text || 'Button'}</span>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>

          </div>
        </main>
      </div>

    </div>
  );
}
