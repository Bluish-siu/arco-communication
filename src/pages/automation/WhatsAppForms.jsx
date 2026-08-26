import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Play,
  Edit2,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  X,
  Eye,
  Download,
  Smartphone,
  ChevronRight,
  List,
  CheckSquare,
  Calendar,
  Clock,
  Mail,
  Phone,
  Hash,
  AlignLeft,
  Type,
  Filter,
  Share2,
} from 'lucide-react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import AutomationSubNav from '../../components/automation/AutomationSubNav';
import AutomationSimulatorDrawer from '../../components/automation/AutomationSimulatorDrawer';
import { automationService } from '../../services/automationService';

const FIELD_TYPES = [
  { type: 'text', label: 'Short Text', icon: Type },
  { type: 'phone', label: 'Phone Number', icon: Phone },
  { type: 'email', label: 'Email Address', icon: Mail },
  { type: 'number', label: 'Numeric', icon: Hash },
  { type: 'dropdown', label: 'Dropdown Select', icon: List },
  { type: 'radio', label: 'Radio Choice', icon: CheckSquare },
  { type: 'checkbox', label: 'Multi-Checkbox', icon: CheckSquare },
  { type: 'date', label: 'Date Picker', icon: Calendar },
  { type: 'time', label: 'Time', icon: Clock },
  { type: 'textarea', label: 'Long Textarea', icon: AlignLeft },
];

export default function WhatsAppForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('view_all'); // 'view_all' | 'builder'

  // Submissions Modal
  const [responsesModal, setResponsesModal] = useState(null);
  const [responsesList, setResponsesList] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  // Form Builder State
  const [editingFormId, setEditingFormId] = useState(null);
  const [formTitle, setFormTitle] = useState('AI_feedback req_QQyz');
  const [formDescription, setFormDescription] = useState('Please submit your service feedback to help us serve you better.');
  const [formUniqueId, setFormUniqueId] = useState('');
  const [formFields, setFormFields] = useState([
    { id: 'f_1', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your name' },
    { id: 'f_2', type: 'phone', label: 'Phone Number', required: true, placeholder: '+91 98765 43210' },
    { id: 'f_3', type: 'dropdown', label: 'Service Rating', required: true, options: ['⭐⭐⭐⭐⭐ Excellent', '⭐⭐⭐⭐ Good', '⭐⭐⭐ Average'] },
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadForms = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await automationService.getWhatsAppForms(params);
      if (res?.data) {
        setForms(res.data);
      }
    } catch (err) {
      console.error('Failed to load forms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, [searchQuery]);

  const handleStartCreateNew = () => {
    setEditingFormId(null);
    setFormTitle(`AI_feedback_${Math.random().toString(36).substring(7)}`);
    setFormDescription('Collect user details and requirements via interactive WhatsApp Form');
    setFormUniqueId(`form_${Date.now()}`);
    setFormFields([
      { id: 'f_1', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your name' },
      { id: 'f_2', type: 'phone', label: 'Phone Number', required: true, placeholder: '+91 98765 43210' },
      { id: 'f_3', type: 'email', label: 'Work Email', required: false, placeholder: 'name@company.com' },
    ]);
    setActiveTab('builder');
  };

  const handleOpenEdit = (form) => {
    setEditingFormId(form.id);
    setFormTitle(form.title || '');
    setFormDescription(form.description || '');
    setFormUniqueId(form.form_id || '');
    setFormFields(Array.isArray(form.fields) && form.fields.length > 0 ? form.fields : [
      { id: 'f_1', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your name' },
    ]);
    setActiveTab('builder');
  };

  const handleAddField = (fieldType) => {
    const newField = {
      id: `f_${Date.now()}`,
      type: fieldType,
      label: `New ${fieldType.toUpperCase()} Field`,
      placeholder: 'Tap to input',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
    };
    setFormFields((prev) => [...prev, newField]);
  };

  const handleUpdateField = (index, key, value) => {
    setFormFields((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  const handleRemoveField = (index) => {
    setFormFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveForm = async () => {
    if (!formTitle.trim()) {
      alert('Please enter a form name');
      return;
    }

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      form_id: formUniqueId.trim() || `form_${Date.now()}`,
      fields: formFields,
      status: 'Draft',
    };

    try {
      if (editingFormId) {
        await automationService.updateWhatsAppForm(editingFormId, payload);
        showToast('WhatsApp Form updated!');
      } else {
        await automationService.createWhatsAppForm(payload);
        showToast('WhatsApp Form created!');
      }
      setActiveTab('view_all');
      loadForms();
    } catch (err) {
      alert(err.message || 'Failed to save form');
    }
  };

  const handleOpenResponses = async (form) => {
    setResponsesModal(form);
    setLoadingResponses(true);
    try {
      const res = await automationService.getFormResponses(form.form_id || form.id);
      setResponsesList(res?.data || []);
    } catch (err) {
      console.error('Failed to load responses:', err);
    } finally {
      setLoadingResponses(false);
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
            
            {/* Toast Notification */}
            {toastMessage && (
              <div className="p-3 rounded-lg bg-[#0d3b30] text-white text-xs font-bold flex items-center gap-2 shadow-md animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0d3b30] text-white flex items-center justify-center shadow-2xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-slate-900 leading-tight">WhatsApp Forms</h1>
                  <p className="text-xs text-slate-500">Transform leadgen via interaktive WhatsApp Forms</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsSimulatorOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Play className="w-3 h-3 fill-slate-700" />
                  <span>Test Simulator</span>
                </button>
              </div>
            </div>

            {/* Sub Tabs: Create New Form | View All Forms */}
            <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold pt-1">
              <button
                onClick={handleStartCreateNew}
                className={`pb-2.5 transition-colors cursor-pointer ${
                  activeTab === 'builder'
                    ? 'border-b-2 border-slate-900 text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Create New Form
              </button>

              <button
                onClick={() => setActiveTab('view_all')}
                className={`pb-2.5 transition-colors cursor-pointer ${
                  activeTab === 'view_all'
                    ? 'border-b-2 border-slate-900 text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                View All Forms
              </button>
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: VIEW ALL FORMS */}
            {/* ========================================================================= */}
            {activeTab === 'view_all' && (
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs space-y-0">
                
                {/* Search & Actions Bar inside Card */}
                <div className="p-4 bg-[#f8fdfa] border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name"
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:ring-1 focus:ring-[#0d3b30] outline-hidden placeholder:text-slate-400"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={loadForms}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-500" />
                      <span>Sync Data</span>
                    </button>

                    <button
                      onClick={() => alert('Filter applied')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Filter className="w-3 h-3 text-slate-500" />
                      <span>Filter</span>
                    </button>
                  </div>
                </div>

                {/* Table Container Header */}
                <div className="p-4 bg-white border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900">WhatsApp Forms Details</h3>
                </div>

                {/* Table */}
                {loading ? (
                  <div className="py-16 text-center space-y-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#0d3b30] mx-auto" />
                    <p className="text-xs text-slate-400">Loading forms...</p>
                  </div>
                ) : forms.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <p className="text-xs text-slate-500">No WhatsApp forms created yet.</p>
                    <button
                      onClick={handleStartCreateNew}
                      className="px-3 py-1 rounded bg-[#0d3b30] text-white text-xs font-bold cursor-pointer"
                    >
                      + Create New Form
                    </button>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 bg-slate-50/50">
                        <th className="py-3 px-4">Form Name</th>
                        <th className="py-3 px-4">Form ID</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Responses</th>
                        <th className="py-3 px-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {forms.map((form) => (
                        <tr key={form.id} className="hover:bg-slate-50/50 transition-colors">
                          
                          {/* Form Name */}
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                            {form.title}
                          </td>

                          {/* Form ID */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                            {form.form_id || '--'}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 font-medium text-slate-700">
                            {form.status || 'Draft'}
                          </td>

                          {/* Responses */}
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleOpenResponses(form)}
                              className="text-xs font-bold text-slate-800 hover:text-blue-600 hover:underline cursor-pointer"
                            >
                              {form.submissions_count || 0}
                            </button>
                          </td>

                          {/* Action Icons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEdit(form)}
                                title="Edit Form"
                                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenResponses(form)}
                                title="View Submissions"
                                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: FORM BUILDER & LIVE PHONE PREVIEW */}
            {/* ========================================================================= */}
            {activeTab === 'builder' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Form Settings & Field Builder */}
                <div className="lg:col-span-8 space-y-5">
                  <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-2xs space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Form Title *</label>
                        <input
                          type="text"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="e.g. Lead Qualification Form"
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-[#0d3b30] outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Unique Form Identifier</label>
                        <input
                          type="text"
                          value={formUniqueId}
                          onChange={(e) => setFormUniqueId(e.target.value)}
                          placeholder="e.g. form_sales_qualification"
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-[#0d3b30] outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Form Header Description</label>
                      <textarea
                        rows={2}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Explain what information you are collecting..."
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-[#0d3b30] outline-hidden resize-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Field Palette */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-2xs space-y-2">
                    <div className="text-xs font-bold text-slate-700">Add Field to Form</div>
                    <div className="flex flex-wrap gap-1.5">
                      {FIELD_TYPES.map((ft) => {
                        const Icon = ft.icon;
                        return (
                          <button
                            key={ft.type}
                            type="button"
                            onClick={() => handleAddField(ft.type)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Icon className="w-3 h-3 text-slate-500" />
                            <span>{ft.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Field List Editor */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-slate-700">Configured Fields ({formFields.length})</div>

                    {formFields.map((field, idx) => (
                      <div key={field.id || idx} className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            Field #{idx + 1} ({field.type.toUpperCase()})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveField(idx)}
                            className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Field Label</label>
                            <input
                              type="text"
                              value={field.label || ''}
                              onChange={(e) => handleUpdateField(idx, 'label', e.target.value)}
                              className="w-full p-1.5 rounded border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-[#0d3b30] outline-hidden"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Placeholder</label>
                            <input
                              type="text"
                              value={field.placeholder || ''}
                              onChange={(e) => handleUpdateField(idx, 'placeholder', e.target.value)}
                              className="w-full p-1.5 rounded border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-[#0d3b30] outline-hidden"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={field.required !== false}
                            onChange={(e) => handleUpdateField(idx, 'required', e.target.checked)}
                            className="w-3.5 h-3.5 accent-[#0d3b30] rounded-xs"
                          />
                          <span>Mandatory Field (Required)</span>
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('view_all')}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveForm}
                      className="px-5 py-2 rounded-lg bg-[#0d3b30] hover:bg-[#092b23] text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      Save & Publish Form
                    </button>
                  </div>
                </div>

                {/* Right Interactive Phone Preview */}
                <div className="lg:col-span-4 flex justify-center">
                  <div className="w-72 bg-[#0b141a] rounded-[36px] p-3 border-4 border-slate-800 shadow-2xl space-y-3 h-[520px] flex flex-col justify-between">
                    
                    {/* Phone Header */}
                    <div className="px-2 pt-1 flex items-center justify-between text-[10px] text-white border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[9px]">
                          A
                        </div>
                        <span className="font-bold">ARCO Communication</span>
                      </div>
                      <span className="text-slate-400">12:00 PM</span>
                    </div>

                    {/* WhatsApp Chat & Form Card */}
                    <div className="flex-1 overflow-y-auto space-y-2 p-1 text-xs">
                      <div className="bg-[#1f2c34] p-3 rounded-xl space-y-2 border border-slate-700 text-white shadow-md">
                        <h4 className="font-bold text-xs text-emerald-400">{formTitle}</h4>
                        <p className="text-[10px] text-slate-300 leading-relaxed">{formDescription}</p>

                        <div className="space-y-1.5 pt-2 border-t border-slate-700">
                          {formFields.map((f, i) => (
                            <div key={i} className="bg-[#111b21] p-1.5 rounded border border-slate-700 text-[10px]">
                              <div className="font-bold text-slate-400">
                                {f.label} {f.required && <span className="text-red-400">*</span>}
                              </div>
                              <div className="text-slate-200">{f.placeholder || 'Tap to fill'}</div>
                            </div>
                          ))}
                        </div>

                        <div className="w-full py-1.5 bg-emerald-600 text-white text-center rounded text-[11px] font-bold mt-2">
                          Submit Form
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-slate-500">
                      WhatsApp Native Form Mockup
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: VIEW RESPONSES */}
      {/* ========================================================================= */}
      {responsesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl max-h-[85vh] rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-xs text-slate-900">
                Submissions for "{responsesModal.title}"
              </h3>
              <button onClick={() => setResponsesModal(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {loadingResponses ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading submissions...</div>
              ) : responsesList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No responses recorded yet.</div>
              ) : (
                responsesList.map((resp) => (
                  <div key={resp.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{resp.contact_name || 'Anonymous User'}</span>
                      <span className="text-[10px] font-normal text-slate-400">{resp.contact_phone}</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-100 text-[11px] font-mono text-slate-700">
                      {JSON.stringify(resp.answers, null, 2)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setResponsesModal(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                Close
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
