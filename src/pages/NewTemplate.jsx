import React, { useState, useEffect } from 'react';
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
  Image,
  Video,
  FileText,
  MessageSquare,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { templateService } from '../services/templateService';

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
  const [body, setBody] = useState('');
  const [footer, setFooter] = useState('');
  const [buttons, setButtons] = useState([]);
  const [variables, setVariables] = useState([]);
  const [sampleVarValues, setSampleVarValues] = useState({});

  // Loading & Saving States
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        headerText,
        headerMediaUrl,
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

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        displayName: displayName || name,
        category,
        language,
        headerType,
        headerText,
        headerMediaUrl,
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
      
      {/* Toast */}
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
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900">Header (Optional)</h3>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  {['NONE', 'TEXT', 'IMAGE', 'VIDEO'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setHeaderType(type)}
                      className={`p-2 rounded-xl border font-bold text-xs transition-colors cursor-pointer ${
                        headerType === type
                          ? 'bg-[#0d3b30] text-white border-[#0d3b30]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {headerType === 'TEXT' && (
                  <div>
                    <label className="block font-bold text-slate-700 text-xs mb-1">
                      Header Text (Max 60 characters)
                    </label>
                    <input
                      type="text"
                      maxLength={60}
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      placeholder="e.g. 🌟 Exclusive VIP Offer Inside"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
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
            <div className="w-full lg:w-[350px] shrink-0">
              <div className="sticky top-20 bg-slate-900 rounded-3xl p-4 shadow-xl border border-slate-800 text-white space-y-3">
                
                {/* Phone Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center font-bold text-[10px]">
                      A
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">ARCO Official</div>
                      <div className="text-[9px] text-emerald-400">WhatsApp Business</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">Live Preview</span>
                </div>

                {/* WhatsApp Message Preview Bubble */}
                <div className="bg-[#005c4b] text-emerald-50 p-3.5 rounded-2xl rounded-tr-none text-xs space-y-2.5 shadow-md">
                  
                  {/* Header */}
                  {headerType === 'TEXT' && headerText && (
                    <div className="font-extrabold text-emerald-100 text-xs border-b border-emerald-600/50 pb-1.5">
                      {headerText}
                    </div>
                  )}

                  {/* Body */}
                  <div className="whitespace-pre-line leading-relaxed text-[11px]">
                    {renderPreviewBody()}
                  </div>

                  {/* Footer */}
                  {footer && (
                    <div className="text-[10px] text-emerald-300/80 pt-1 border-t border-emerald-600/40 italic">
                      {footer}
                    </div>
                  )}

                  {/* Time Stamp */}
                  <div className="text-[9px] text-emerald-300 text-right">10:45 AM ✓✓</div>
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
