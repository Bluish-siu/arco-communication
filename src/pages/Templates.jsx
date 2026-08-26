import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  ChevronDown,
  LogOut,
  Send,
  Copy,
  Trash2,
  RotateCcw,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Phone,
  ArrowUpRight,
  Edit3,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { templateService } from '../services/templateService';
import TemplateCard from '../components/templates/TemplateCard';
import StatusFilter from '../components/templates/StatusFilter';
import CategoryFilter from '../components/templates/CategoryFilter';

export default function Templates() {
  const { user, businessSetup, logout } = useOnboarding();
  const userName = businessSetup?.companyName || user?.name || 'Business Owner';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab from Query (Default: 'library')
  const currentSegment = searchParams.get('segment') || 'library';
  const channelType = searchParams.get('channel_type') || 'whatsapp';

  // Navigation Profile Dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Data States
  const [loading, setLoading] = useState(true);
  const [libraryData, setLibraryData] = useState({});
  const [activeTemplates, setActiveTemplates] = useState([]);
  const [deletedTemplates, setDeletedTemplates] = useState([]);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Any');
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Modals
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testTemplate, setTestTemplate] = useState(null);
  const [testPhone, setTestPhone] = useState('+91 ');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const [infoModalOpen, setInfoModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e) {
      if (!e.target.closest('.profile-container')) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Switch Tab via Query Params
  const handleTabChange = (segment) => {
    setSearchParams({ channel_type: channelType, segment });
  };

  // Load Templates based on Active Tab
  const loadData = async () => {
    setLoading(true);
    try {
      if (currentSegment === 'library') {
        const res = await templateService.getLibraryTemplates({
          search: searchTerm,
          category: selectedCategories.length > 0 ? selectedCategories.join(',') : '',
        });
        if (res && res.data) {
          setLibraryData(res.data);
        }
      } else if (currentSegment === 'active') {
        const res = await templateService.getActiveTemplates({
          search: searchTerm,
          category: selectedCategories.length > 0 ? selectedCategories.join(',') : 'All',
          status: selectedStatus,
        });
        if (res && res.templates) {
          setActiveTemplates(res.templates);
        }
      } else if (currentSegment === 'deleted') {
        const res = await templateService.getDeletedTemplates();
        if (res && res.templates) {
          let filtered = res.templates;
          if (searchTerm) {
            filtered = filtered.filter(
              (t) =>
                t.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          if (selectedCategories.length > 0) {
            filtered = filtered.filter((t) =>
              selectedCategories.some((c) => c.toUpperCase() === t.category?.toUpperCase())
            );
          }
          if (selectedStatus && selectedStatus !== 'Any') {
            filtered = filtered.filter(
              (t) => t.status?.toUpperCase() === selectedStatus.toUpperCase()
            );
          }
          setDeletedTemplates(filtered);
        }
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
      showToast('Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSegment, searchTerm, selectedStatus, selectedCategories]);

  // Use Template from Library
  const handleUseTemplate = (template) => {
    navigate('/templates/new', { state: { prefilled: template } });
  };

  // Duplicate Template
  const handleDuplicateTemplate = async (template) => {
    try {
      await templateService.duplicateTemplate(template.id);
      showToast(`Duplicated "${template.display_name}"`);
      if (currentSegment !== 'active') {
        handleTabChange('active');
      } else {
        loadData();
      }
    } catch (err) {
      showToast('Failed to duplicate template', 'error');
    }
  };

  // Delete Template (Soft or Permanent)
  const handleDeleteTemplate = async (template, isPermanent = false) => {
    if (isPermanent) {
      setTemplateToDelete(template);
      setDeleteConfirmModalOpen(true);
      return;
    }

    try {
      await templateService.deleteTemplate(template.id);
      showToast('Template moved to Deleted tab');
      loadData();
    } catch (err) {
      showToast('Failed to delete template', 'error');
    }
  };

  // Confirm Permanent Delete
  const handleConfirmPermanentDelete = async () => {
    if (!templateToDelete) return;
    try {
      await templateService.deletePermanent(templateToDelete.id);
      showToast('Template permanently deleted');
      setDeleteConfirmModalOpen(false);
      setTemplateToDelete(null);
      loadData();
    } catch (err) {
      showToast('Failed to delete permanently', 'error');
    }
  };

  // Restore Template
  const handleRestoreTemplate = async (template) => {
    try {
      await templateService.restoreTemplate(template.id);
      showToast('Template restored to Active');
      loadData();
    } catch (err) {
      showToast('Failed to restore template', 'error');
    }
  };

  // Execute Test Send
  const handleExecuteTestSend = async () => {
    if (!testPhone.trim() || !testTemplate) return;
    setIsSendingTest(true);
    try {
      await templateService.testTemplate(testTemplate.id, {
        recipientPhone: testPhone,
      });
      showToast(`Test message dispatched to ${testPhone}`);
      setTestModalOpen(false);
    } catch (err) {
      showToast('Failed to send test message', 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  // Status badge styling
  const getStatusBadgeStyle = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'WAITING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'IN_APPEAL':
      case 'IN APPEAL':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'DISABLED':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'PENDING_DELETION':
      case 'PENDING DELETION':
        return 'bg-red-50 text-red-600 border-dashed border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-gray-800">
      
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

      {/* Main Container */}
      <div className="flex-1 flex flex-row min-w-0">
        <DashboardSidebar />

        {/* Workspace Shell */}
        <main className="flex-1 ml-14 min-w-0 flex flex-col bg-[#f8fafc] min-h-screen">
          
          {/* Top Navigation Header */}
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between shadow-2xs">
            
            {/* Breadcrumb: Dashboard / Market / Templates */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Link to="/dashboard" className="hover:text-gray-800 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-gray-500">Market</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">Templates</span>
            </div>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-3">
              <div className="relative profile-container">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0d3b30] text-emerald-300 font-bold text-xs flex items-center justify-center shadow-2xs">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 hidden sm:block max-w-[120px] truncate">
                    {userName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 border-b border-gray-100 font-semibold text-gray-900 truncate">
                      {userName}
                    </div>
                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 text-left font-semibold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>

          </header>

          {/* Page Body */}
          <div className="p-6 max-w-[1400px] w-full mx-auto space-y-3.5">
            
            {/* Header: Title + Subtitle + New Template Button */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
                  Templates
                </h1>
                <p className="text-xs text-gray-500 font-normal mt-0.5">
                  Managing WhatsApp Templates
                </p>
              </div>

              {/* + New Template Button */}
              <Link
                to="/templates/new"
                className="h-8 px-3.5 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-medium text-xs rounded shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>New Template</span>
              </Link>
            </div>

            {/* FULL-WIDTH TABS BAR */}
            <div className="border-b border-gray-200 flex items-center gap-8 text-sm">
              <button
                type="button"
                onClick={() => handleTabChange('library')}
                className={`pb-2.5 transition-colors cursor-pointer ${
                  currentSegment === 'library'
                    ? 'border-b-2 border-[#0d3b30] text-[#0d3b30] font-semibold -mb-[1px]'
                    : 'text-gray-500 hover:text-gray-800 font-medium'
                }`}
              >
                Template Library
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('active')}
                className={`pb-2.5 transition-colors cursor-pointer ${
                  currentSegment === 'active'
                    ? 'border-b-2 border-[#0d3b30] text-[#0d3b30] font-semibold -mb-[1px]'
                    : 'text-gray-500 hover:text-gray-800 font-medium'
                }`}
              >
                Active
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('deleted')}
                className={`pb-2.5 transition-colors cursor-pointer ${
                  currentSegment === 'deleted'
                    ? 'border-b-2 border-[#0d3b30] text-[#0d3b30] font-semibold -mb-[1px]'
                    : 'text-gray-500 hover:text-gray-800 font-medium'
                }`}
              >
                Deleted
              </button>
            </div>

            {/* YELLOW/AMBER WHATSAPP REVIEW ALERT BANNER */}
            {(currentSegment === 'active' || currentSegment === 'deleted') && (
              <div className="bg-[#fffbeb] border border-[#fde68a] text-amber-900 text-xs px-3.5 py-2.5 rounded flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    WhatsApp can take up to 24 hours to review (approve / reject) a template.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setInfoModalOpen(true)}
                  className="text-blue-600 hover:underline font-medium text-xs whitespace-nowrap cursor-pointer ml-1"
                >
                  See More
                </button>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SEGMENT 1: TEMPLATE LIBRARY TAB (6 Category Columns)                      */}
            {/* ========================================================================= */}
            {currentSegment === 'library' && (
              <div className="space-y-3.5 pt-1">
                
                {/* Search & Filter Toolbar */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search a template by name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8 pl-8 pr-3 rounded border border-gray-300 bg-white text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 w-full"
                      />
                    </div>

                    <CategoryFilter
                      value={selectedCategories}
                      onChange={setSelectedCategories}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={loadData}
                    className="h-8 w-8 rounded border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 cursor-pointer shadow-2xs"
                    title="Refresh Library"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {loading ? (
                  <div className="border border-gray-200 rounded bg-white min-h-[360px] flex flex-col items-center justify-center p-12 space-y-3">
                    <RefreshCw className="w-7 h-7 text-[#0d3b30] animate-spin" />
                    <p className="text-xs font-semibold text-gray-500">Loading Template Library...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-w-[1150px]">
                      
                      {[
                        { key: 'PROMOTIONAL', label: 'PROMOTIONAL' },
                        { key: 'TRANSACTIONAL', label: 'TRANSACTIONAL' },
                        { key: 'SERVICE_ALERTS', label: 'SERVICE ALERTS' },
                        { key: 'LEAD_QUALIFICATION', label: 'LEAD QUALIFICATION' },
                        { key: 'INFORMATIVE', label: 'INFORMATIVE' },
                        { key: 'OCCASION_BASED', label: 'OCCASION BASED' },
                      ].map((cat) => {
                        const templatesInCat = libraryData[cat.key] || [];

                        return (
                          <div key={cat.key} className="space-y-3 flex flex-col">
                            
                            {/* Category Header: CATEGORY NAME + X templates */}
                            <div className="pb-1.5 border-b border-gray-200">
                              <h3 className="font-bold text-[11px] uppercase tracking-wider text-gray-800">
                                {cat.label}
                              </h3>
                              <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                {templatesInCat.length} {templatesInCat.length === 1 ? 'template' : 'templates'}
                              </p>
                            </div>

                            {/* Cards Column */}
                            <div className="space-y-3 flex-1">
                              {templatesInCat.map((tmpl) => (
                                <TemplateCard
                                  key={tmpl.id}
                                  template={tmpl}
                                  onUseTemplate={handleUseTemplate}
                                  onDuplicate={handleDuplicateTemplate}
                                  onTestSend={(t) => {
                                    setTestTemplate(t);
                                    setTestModalOpen(true);
                                  }}
                                />
                              ))}

                              {templatesInCat.length === 0 && (
                                <div className="p-4 rounded bg-white border border-gray-200 text-center text-gray-400 text-xs font-normal">
                                  No templates
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      })}

                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ========================================================================= */}
            {/* SEGMENT 2: ACTIVE TAB (Exact Interakt Filter Bar & In-Table Empty State)   */}
            {/* ========================================================================= */}
            {currentSegment === 'active' && (
              <div className="space-y-3 pt-1">
                
                {/* Filter Row: Search a template by name | Status ▼ | Category ▼ | Refresh */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    
                    {/* Search Field */}
                    <div className="relative w-64">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search a template by name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8 pl-8 pr-3 rounded border border-gray-300 bg-white text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 w-full"
                      />
                    </div>

                    {/* Status Dropdown */}
                    <StatusFilter
                      value={selectedStatus}
                      onChange={setSelectedStatus}
                    />

                    {/* Category Dropdown */}
                    <CategoryFilter
                      value={selectedCategories}
                      onChange={setSelectedCategories}
                    />

                  </div>

                  <button
                    type="button"
                    onClick={loadData}
                    className="h-8 w-8 rounded border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 cursor-pointer shadow-2xs"
                    title="Refresh Active Templates"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Table Container */}
                <div className="border border-gray-200 rounded overflow-hidden bg-white shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-semibold text-gray-600">
                          <th className="py-2.5 px-4 font-semibold">Template Name</th>
                          <th className="py-2.5 px-4 font-semibold">Status</th>
                          <th className="py-2.5 px-4 font-semibold">Category</th>
                          <th className="py-2.5 px-4 font-semibold">Language(s)</th>
                          <th className="py-2.5 px-4 font-semibold">Created By</th>
                          <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      
                      {loading ? (
                        <tbody>
                          <tr>
                            <td colSpan={6} className="py-16 text-center">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <RefreshCw className="w-6 h-6 text-[#0d3b30] animate-spin" />
                                <p className="text-xs text-gray-500 font-medium">Loading templates...</p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      ) : activeTemplates.length === 0 ? (
                        <tbody>
                          <tr>
                            <td colSpan={6} className="py-24 text-center">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                  <Plus className="w-4 h-4 text-gray-400 stroke-[1.5]" />
                                </div>
                                <p className="text-sm font-normal text-gray-500">No result found</p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      ) : (
                        <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                          {activeTemplates.map((tmpl) => (
                            <tr
                              key={tmpl.id}
                              className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                              onClick={() => {
                                setPreviewTemplate(tmpl);
                                setPreviewModalOpen(true);
                              }}
                            >
                              <td className="py-2.5 px-4">
                                <div className="font-semibold text-gray-900 text-xs">
                                  {tmpl.display_name}
                                </div>
                                <div className="text-[10px] text-gray-400 font-mono">
                                  {tmpl.name}
                                </div>
                              </td>

                              <td className="py-2.5 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getStatusBadgeStyle(
                                    tmpl.status
                                  )}`}
                                >
                                  {tmpl.status || 'DRAFT'}
                                </span>
                              </td>

                              <td className="py-2.5 px-4 capitalize text-gray-800">
                                {tmpl.category?.toLowerCase()}
                              </td>

                              <td className="py-2.5 px-4 text-gray-600">
                                {tmpl.language === 'en_US'
                                  ? 'English (en_US)'
                                  : tmpl.language === 'hi_IN'
                                  ? 'Hindi (hi_IN)'
                                  : tmpl.language || 'English'}
                              </td>

                              <td className="py-2.5 px-4 text-gray-700">
                                {tmpl.created_by || 'Shraddha Sharma'}
                              </td>

                              <td
                                className="py-2.5 px-4 text-right"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-end gap-1">
                                  <Link
                                    to={`/templates/${tmpl.id}/edit`}
                                    className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                                    title="Edit Template"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() => handleDuplicateTemplate(tmpl)}
                                    className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                                    title="Duplicate Template"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTestTemplate(tmpl);
                                      setTestModalOpen(true);
                                    }}
                                    className="p-1.5 rounded hover:bg-gray-100 text-emerald-700 transition-colors cursor-pointer"
                                    title="Test Send"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTemplate(tmpl)}
                                    className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                    title="Delete Template"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      )}

                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* SEGMENT 3: DELETED TAB (Exact Interakt Filter Bar & In-Table Empty State)  */}
            {/* ========================================================================= */}
            {currentSegment === 'deleted' && (
              <div className="space-y-3 pt-1">
                
                {/* Filter Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    
                    {/* Search Field */}
                    <div className="relative w-64">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search a template by name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8 pl-8 pr-3 rounded border border-gray-300 bg-white text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 w-full"
                      />
                    </div>

                    {/* Status Dropdown */}
                    <StatusFilter
                      value={selectedStatus}
                      onChange={setSelectedStatus}
                    />

                    {/* Category Dropdown */}
                    <CategoryFilter
                      value={selectedCategories}
                      onChange={setSelectedCategories}
                    />

                  </div>

                  <button
                    type="button"
                    onClick={loadData}
                    className="h-8 w-8 rounded border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 cursor-pointer shadow-2xs"
                    title="Refresh Deleted"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Table Container */}
                <div className="border border-gray-200 rounded overflow-hidden bg-white shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-semibold text-gray-600">
                          <th className="py-2.5 px-4 font-semibold">Template Name</th>
                          <th className="py-2.5 px-4 font-semibold">Status</th>
                          <th className="py-2.5 px-4 font-semibold">Category</th>
                          <th className="py-2.5 px-4 font-semibold">Language(s)</th>
                          <th className="py-2.5 px-4 font-semibold">Created By</th>
                          <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      
                      {loading ? (
                        <tbody>
                          <tr>
                            <td colSpan={6} className="py-16 text-center">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <RefreshCw className="w-6 h-6 text-[#0d3b30] animate-spin" />
                                <p className="text-xs text-gray-500 font-medium">Loading templates...</p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      ) : deletedTemplates.length === 0 ? (
                        <tbody>
                          <tr>
                            <td colSpan={6} className="py-24 text-center">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                  <Plus className="w-4 h-4 text-gray-400 stroke-[1.5]" />
                                </div>
                                <p className="text-sm font-normal text-gray-500">No result found</p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      ) : (
                        <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                          {deletedTemplates.map((tmpl) => (
                            <tr key={tmpl.id} className="hover:bg-gray-50/70 transition-colors">
                              <td className="py-2.5 px-4">
                                <div className="font-semibold text-gray-900 text-xs">
                                  {tmpl.display_name}
                                </div>
                                <div className="text-[10px] text-gray-400 font-mono">
                                  {tmpl.name}
                                </div>
                              </td>

                              <td className="py-2.5 px-4">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase border bg-red-50 text-red-700 border-red-200">
                                  Deleted
                                </span>
                              </td>

                              <td className="py-2.5 px-4 capitalize text-gray-800">
                                {tmpl.category?.toLowerCase()}
                              </td>

                              <td className="py-2.5 px-4 text-gray-600">
                                {tmpl.language || 'English (en_US)'}
                              </td>

                              <td className="py-2.5 px-4 text-gray-700">
                                {tmpl.created_by || 'Shraddha Sharma'}
                              </td>

                              <td className="py-2.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleRestoreTemplate(tmpl)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium rounded transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Restore</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTemplate(tmpl, true)}
                                    className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                    title="Delete Permanently"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      )}

                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 1. TEST SEND WHATSAPP MESSAGE MODAL                                       */}
      {/* ========================================================================= */}
      {testModalOpen && testTemplate && (
        <div className="fixed inset-0 bg-gray-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 text-xs font-sans">
            
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Send Test WhatsApp</h3>
                  <p className="text-[10px] text-gray-500">Dispatch template to a verified phone number</p>
                </div>
              </div>
              <button
                onClick={() => setTestModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-2.5 bg-gray-50 rounded border border-gray-100">
                <div className="font-semibold text-gray-900">{testTemplate.display_name}</div>
                <div className="text-[10px] font-mono text-gray-500 mt-0.5">{testTemplate.name}</div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase text-gray-500 mb-1">
                  Recipient Phone Number (with Country Code)
                </label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="flex-1 h-8 px-2.5 rounded border border-gray-300 font-mono text-xs focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="h-8 px-3 rounded border border-gray-300 hover:bg-gray-50 font-medium text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSendingTest || !testPhone.trim()}
                onClick={handleExecuteTestSend}
                className="h-8 px-3.5 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-medium text-xs rounded shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>{isSendingTest ? 'Sending...' : 'Send Test'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TEMPLATE DETAILS PREVIEW MODAL                                         */}
      {/* ========================================================================= */}
      {previewModalOpen && previewTemplate && (
        <div className="fixed inset-0 bg-gray-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 space-y-3.5 text-xs font-sans">
            
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Template Overview
                </span>
                <h3 className="font-bold text-sm text-gray-900 font-mono">
                  {previewTemplate.display_name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Template Body Preview in WhatsApp bubble */}
            <div className="bg-[#e7f7ec] border border-[#d2edd8] rounded p-3 text-xs text-gray-800 space-y-1.5">
              {previewTemplate.header_type === 'TEXT' && previewTemplate.header_text && (
                <div className="font-bold text-gray-900 border-b border-emerald-200/60 pb-1">
                  {previewTemplate.header_text}
                </div>
              )}
              <div className="whitespace-pre-line leading-relaxed">
                {previewTemplate.body}
              </div>
              {previewTemplate.footer && (
                <div className="text-[10px] text-gray-500 font-normal italic pt-1 border-t border-emerald-200/40">
                  {previewTemplate.footer}
                </div>
              )}
            </div>

            {/* Metadata Information */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded bg-gray-50 border border-gray-200 text-[11px]">
              <div>
                <span className="text-gray-500 font-medium">Category:</span>{' '}
                <span className="font-semibold text-gray-800 capitalize">{previewTemplate.category?.toLowerCase()}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Status:</span>{' '}
                <span className="font-semibold text-emerald-800 uppercase">{previewTemplate.status}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Language:</span>{' '}
                <span className="font-semibold text-gray-800">{previewTemplate.language}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Created By:</span>{' '}
                <span className="font-semibold text-gray-800">{previewTemplate.created_by || 'Shraddha Sharma'}</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
              <Link
                to={`/templates/${previewTemplate.id}/edit`}
                className="h-8 px-3.5 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-medium text-xs rounded shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Template</span>
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PERMANENT DELETE CONFIRMATION MODAL                                    */}
      {/* ========================================================================= */}
      {deleteConfirmModalOpen && templateToDelete && (
        <div className="fixed inset-0 bg-gray-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-5 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 space-y-3 text-xs font-sans text-center">
            
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-bold text-sm text-gray-900">Permanently delete template?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to permanently delete <span className="font-semibold text-gray-800">"{templateToDelete.display_name}"</span>? This cannot be undone.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmModalOpen(false);
                  setTemplateToDelete(null);
                }}
                className="h-8 px-3 rounded border border-gray-300 hover:bg-gray-50 font-medium text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                className="h-8 px-3.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded shadow-xs transition-colors cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. WHATSAPP TEMPLATE REVIEW INFORMATION MODAL                             */}
      {/* ========================================================================= */}
      {infoModalOpen && (
        <div className="fixed inset-0 bg-gray-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 space-y-3.5 text-xs font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-gray-900">WhatsApp Template Guidelines</h3>
              </div>
              <button
                onClick={() => setInfoModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-gray-600 text-xs leading-relaxed">
              <p>
                Meta (WhatsApp) requires all message templates to be reviewed before they can be sent to customers.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-500">
                <li>Approval typically takes between a few minutes to 24 hours.</li>
                <li>Make sure variable parameters (e.g. &#123;&#123;1&#125;&#125;) have clear context.</li>
                <li>Avoid excessive capitalization, emoticons, or suspicious promotional links.</li>
              </ul>
            </div>

            <div className="pt-2 border-t border-gray-100 text-right">
              <button
                type="button"
                onClick={() => setInfoModalOpen(false)}
                className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-medium text-xs rounded shadow-xs cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
