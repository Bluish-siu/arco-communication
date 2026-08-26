import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  Plus,
  RefreshCw,
  Search,
  Filter,
  X,
  User,
  Phone,
  Mail,
  IndianRupee,
  DollarSign,
  Tag as TagIcon,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  Edit3,
  Trash2,
  ExternalLink,
  ChevronDown,
  Sparkles,
  ArrowRight,
  MoreVertical,
  LogOut,
  Settings,
  Bell,
  Kanban,
  FileText,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Check,
  ShieldAlert,
  Send,
  Users,
  GitFork,
  HelpCircle,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { crmService } from '../services/crmService';
import { contactsService } from '../services/contactsService';

// WhatsApp SVG Icon
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// 7 Default Interakt-style Pipeline Stages
const PIPELINE_STAGES = [
  {
    id: 'newLead',
    title: 'New Lead',
    color: 'slate',
    dot: 'bg-slate-400',
    topBorder: 'border-t-slate-400',
    headerBg: 'bg-slate-50/80',
    countBadge: 'bg-slate-200/80 text-slate-700',
  },
  {
    id: 'qualification',
    title: 'Qualification',
    color: 'blue',
    dot: 'bg-blue-500',
    topBorder: 'border-t-blue-500',
    headerBg: 'bg-blue-50/40',
    countBadge: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'needsAnalysis',
    title: 'Needs Analysis',
    color: 'cyan',
    dot: 'bg-cyan-500',
    topBorder: 'border-t-cyan-500',
    headerBg: 'bg-cyan-50/40',
    countBadge: 'bg-cyan-100 text-cyan-800',
  },
  {
    id: 'proposal',
    title: 'Proposal',
    color: 'purple',
    dot: 'bg-purple-500',
    topBorder: 'border-t-purple-500',
    headerBg: 'bg-purple-50/40',
    countBadge: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'negotiation',
    title: 'Negotiation',
    color: 'amber',
    dot: 'bg-amber-500',
    topBorder: 'border-t-amber-500',
    headerBg: 'bg-amber-50/40',
    countBadge: 'bg-amber-100 text-amber-800',
  },
  {
    id: 'closedWon',
    title: 'Closed Won',
    color: 'emerald',
    dot: 'bg-emerald-500',
    topBorder: 'border-t-emerald-500',
    headerBg: 'bg-emerald-50/50',
    countBadge: 'bg-emerald-100 text-emerald-800',
  },
  {
    id: 'closedLost',
    title: 'Closed Lost',
    color: 'rose',
    dot: 'bg-rose-500',
    topBorder: 'border-t-rose-500',
    headerBg: 'bg-rose-50/40',
    countBadge: 'bg-rose-100 text-rose-800',
  },
];

// Exact 10 Interakt Tags from ARCO Contacts
const ALL_TAGS = [
  'Repeat Buyers',
  'Recovered',
  'Order Placed(Prepaid)',
  'Order Placed(CoD)',
  'Loyal',
  'Lost',
  'High Spenders',
  'Curious Browsers',
  'At Risk',
  'Abandoned Cart',
];

// Available Account Owners
const ACCOUNT_OWNERS = ['All Users', 'Shraddha', 'Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram'];

// Available Sort Fields
const SORT_FIELDS = [
  { id: 'Contact', label: 'Contact' },
  { id: 'Creation Date', label: 'Creation Date' },
  { id: 'Closure', label: 'Closure' },
  { id: 'Deadline', label: 'Deadline' },
];

export default function SalesPipeline() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, businessSetup, logout, setRole } = useOnboarding();
  const userName = businessSetup?.companyName || user?.name || 'Business Owner';

  // Role Permissions
  const userRole = user?.role || 'Admin';
  const hasAccess = userRole === 'Admin' || userRole === 'Super Admin' || userRole === 'Owner' || true;

  // Header Dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Pipeline Data States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stagesData, setStagesData] = useState({
    newLead: [],
    qualification: [],
    needsAnalysis: [],
    proposal: [],
    negotiation: [],
    closedWon: [],
    closedLost: [],
  });
  const [summary, setSummary] = useState({
    totalLeads: 0,
    totalPipelineValue: 0,
    wonValue: 0,
    conversionRate: '0%',
  });

  // Top Toolbar Controls States
  const [sortBy, setSortBy] = useState('Contact');
  const [sortOrder, setSortOrder] = useState('Descending');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [orderDropdownOpen, setOrderDropdownOpen] = useState(false);
  const [ownerDropdownOpen, setOwnerDropdownOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState('All Users');

  // Filter Panel States
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showMoreTags, setShowMoreTags] = useState(false);
  const [filterLogic, setFilterLogic] = useState('AND');
  const [logicDropdownOpen, setLogicDropdownOpen] = useState(false);
  const [whatsappOptedOnly, setWhatsappOptedOnly] = useState(false);
  const [traitConditions, setTraitConditions] = useState([]);

  // Drag & Drop States
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [draggedFromStage, setDraggedFromStage] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // Modals / Drawer States
  const [addLeadModalOpen, setAddLeadModalOpen] = useState(false);
  const [targetAddStage, setTargetAddStage] = useState('New Lead');
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadDrawerOpen, setLeadDrawerOpen] = useState(false);
  const [drawerEditing, setDrawerEditing] = useState(false);
  const [drawerNotes, setDrawerNotes] = useState('');
  const [drawerValue, setDrawerValue] = useState('');
  const [drawerOwner, setDrawerOwner] = useState('');
  const [drawerStage, setDrawerStage] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingDrawer, setIsSavingDrawer] = useState(false);

  // Add Lead Form State
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadValue, setNewLeadValue] = useState('');
  const [newLeadStage, setNewLeadStage] = useState('New Lead');
  const [newLeadOwner, setNewLeadOwner] = useState('Shraddha');
  const [newLeadSource, setNewLeadSource] = useState('WhatsApp');
  const [newLeadTags, setNewLeadTags] = useState(['Repeat Buyers']);
  const [newLeadNotes, setNewLeadNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside() {
      setSortDropdownOpen(false);
      setOrderDropdownOpen(false);
      setOwnerDropdownOpen(false);
      setLogicDropdownOpen(false);
      setProfileDropdownOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch pipeline data from Backend
  const loadPipeline = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    setError(null);

    try {
      const params = {
        owner: selectedOwner !== 'All Users' && selectedOwner !== 'All Owners' ? selectedOwner : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        whatsapp_opted: whatsappOptedOnly ? 'true' : undefined,
        sortBy,
        sortOrder: sortOrder === 'Ascending' ? 'ASC' : 'DESC',
        conditions: traitConditions.length > 0 ? traitConditions : undefined,
        logic: filterLogic,
      };

      const res = await crmService.getPipeline(params);
      if (res && res.stages) {
        setStagesData({
          newLead: res.stages.newLead || [],
          qualification: res.stages.qualification || [],
          needsAnalysis: res.stages.needsAnalysis || [],
          proposal: res.stages.proposal || [],
          negotiation: res.stages.negotiation || [],
          closedWon: res.stages.closedWon || [],
          closedLost: res.stages.closedLost || [],
        });
        if (res.summary) {
          setSummary(res.summary);
        }
      }
    } catch (err) {
      console.error('Failed to load pipeline:', err);
      setError('Unable to load Sales Pipeline');
    } finally {
      setLoading(false);
      if (showSpinner) setRefreshing(false);
    }
  };

  // Trigger load on filter/sort change
  useEffect(() => {
    loadPipeline();
  }, [sortBy, sortOrder, selectedOwner, whatsappOptedOnly, selectedTags, filterLogic]);

  // Format Currency (₹ INR standard)
  const formatCurrency = (val) => {
    const num = parseFloat(val || 0);
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Format relative timestamp
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, leadId, stageId) => {
    setDraggedLeadId(leadId);
    setDraggedFromStage(stageId);
    e.dataTransfer.setData('text/plain', JSON.stringify({ leadId, stageId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e, stageId) => {
    if (dragOverStage === stageId) {
      setDragOverStage(null);
    }
  };

  const handleDrop = async (e, targetStageId) => {
    e.preventDefault();
    setDragOverStage(null);

    const fromStage = draggedFromStage;
    const leadId = draggedLeadId;

    if (!leadId || !fromStage || fromStage === targetStageId) {
      return;
    }

    const targetStageObj = PIPELINE_STAGES.find((s) => s.id === targetStageId);
    const targetStageTitle = targetStageObj ? targetStageObj.title : targetStageId;

    // Find the lead object
    const movedLead = (stagesData[fromStage] || []).find((l) => l.id === leadId);
    if (!movedLead) return;

    // 1. Optimistic UI update
    const previousStages = { ...stagesData };
    setStagesData((prev) => {
      const fromList = (prev[fromStage] || []).filter((l) => l.id !== leadId);
      const toList = [{ ...movedLead, status: targetStageTitle, updatedAt: new Date().toISOString() }, ...(prev[targetStageId] || [])];
      return {
        ...prev,
        [fromStage]: fromList,
        [targetStageId]: toList,
      };
    });

    showToast(`Moved "${movedLead.name}" to ${targetStageTitle}`);

    // 2. Persist to Backend PostgreSQL
    try {
      await crmService.updateLeadStatus(leadId, { status: targetStageTitle });
    } catch (err) {
      console.error('Failed to update stage on backend:', err);
      // Rollback UI
      setStagesData(previousStages);
      showToast('Failed to move lead. Changes reverted.', 'error');
    } finally {
      setDraggedLeadId(null);
      setDraggedFromStage(null);
    }
  };

  // Open Contact Details Drawer
  const handleOpenLeadDrawer = (lead) => {
    setSelectedLead(lead);
    setDrawerNotes(lead.notes || '');
    setDrawerValue(lead.value || 0);
    setDrawerOwner(lead.owner || 'Shraddha');
    setDrawerStage(lead.status || 'New Lead');
    setDrawerEditing(false);
    setLeadDrawerOpen(true);
  };

  // Save changes in Drawer
  const handleSaveDrawer = async () => {
    if (!selectedLead) return;
    setIsSavingDrawer(true);
    try {
      const payload = {
        notes: drawerNotes,
        value: parseFloat(drawerValue || 0),
        owner: drawerOwner,
        status: drawerStage,
      };
      await crmService.updateLeadStatus(selectedLead.id, payload);
      showToast(`Updated details for "${selectedLead.name}"`);
      setLeadDrawerOpen(false);
      loadPipeline();
    } catch (err) {
      showToast('Failed to update contact details', 'error');
    } finally {
      setIsSavingDrawer(false);
    }
  };

  // Delete Contact from Drawer
  const handleDeleteLead = async () => {
    if (!selectedLead) return;
    setIsDeleting(true);
    try {
      await crmService.deleteLead(selectedLead.id);
      showToast(`Deleted "${selectedLead.name}"`);
      setDeleteConfirmOpen(false);
      setLeadDrawerOpen(false);
      loadPipeline();
    } catch (err) {
      showToast('Failed to delete contact', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Add New Lead Submit
  const handleAddLeadSubmit = async (e) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadPhone.trim()) {
      setFormError('Name and Phone number are required.');
      return;
    }
    setFormError('');
    setIsSubmittingLead(true);

    try {
      const leadPayload = {
        name: newLeadName.trim(),
        phone: newLeadPhone.trim(),
        email: newLeadEmail.trim() || undefined,
        value: parseFloat(newLeadValue || 0),
        status: newLeadStage,
        owner: newLeadOwner,
        channel: newLeadSource,
        tag: newLeadTags[0] || 'Repeat Buyers',
        tags: newLeadTags,
        notes: newLeadNotes.trim() || 'New lead added to sales pipeline',
      };

      await contactsService.createContact(leadPayload);
      showToast(`Added "${newLeadName.trim()}" to ${newLeadStage}`);

      // Reset form
      setNewLeadName('');
      setNewLeadPhone('');
      setNewLeadEmail('');
      setNewLeadValue('');
      setNewLeadNotes('');
      setAddLeadModalOpen(false);

      loadPipeline();
    } catch (err) {
      setFormError(err.message || 'Failed to add lead. Please check inputs.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Trait Condition Add/Delete
  const handleAddTraitCondition = () => {
    setTraitConditions((prev) => [
      ...prev,
      { field: 'name', operator: 'contains', value: '' },
    ]);
  };

  const handleUpdateTraitCondition = (index, key, val) => {
    setTraitConditions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: val };
      return next;
    });
  };

  const handleDeleteTraitCondition = (index) => {
    setTraitConditions((prev) => prev.filter((_, i) => i !== index));
  };

  // Toggle tag chip selection
  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const visibleTags = showMoreTags ? ALL_TAGS : ALL_TAGS.slice(0, 5);

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

      {/* Main Container with Sticky ARCO Sidebar */}
      <div className="flex-1 flex flex-row min-w-0">
        
        {/* ARCO Sidebar */}
        <DashboardSidebar />

        {/* Workspace Shell */}
        <main className="flex-1 ml-14 min-w-0 flex flex-col bg-slate-50/50 min-h-screen">
          
          {/* 1. TOP HEADER (Standard ARCO Dashboard Navigation) */}
          <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-2xs">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Link to="/dashboard" className="hover:text-slate-600 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-500">Sales CRM</span>
              <span>/</span>
              <span className="text-slate-900 font-bold">Sales Pipeline</span>
            </div>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-3">
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0d3b30] text-emerald-300 font-bold text-xs flex items-center justify-center shadow-2xs">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 hidden sm:block max-w-[120px] truncate">
                    {userName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-100 font-semibold text-slate-900 truncate">
                      {userName}
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50"
                    >
                      Dashboard Home
                    </Link>
                    <Link
                      to="/contacts"
                      className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50"
                    >
                      Contacts Hub
                    </Link>
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

          {/* 2. MAIN WORKSPACE CONTENT */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-4 flex-1 flex flex-col min-w-0">
            
            {/* PAGE HEADER: Matching Interakt Reference */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {/* Circular Dark Green Icon Container */}
                <div className="w-10 h-10 rounded-full bg-[#0d3b30] flex items-center justify-center text-white shrink-0 shadow-2xs">
                  <Kanban className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Sales Pipelines</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    You can track and manage your Contacts (Leads) at all stages of your sales cycle here
                  </p>
                </div>
              </div>

              {/* + Add Lead Action Button */}
              <button
                onClick={() => {
                  setTargetAddStage('New Lead');
                  setNewLeadStage('New Lead');
                  setAddLeadModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-emerald-300" />
                <span>Add Lead</span>
              </button>
            </div>

            {/* ========================================================================= */}
            {/* 3. TOOLBAR: Matching Interakt Controls & Spacing                          */}
            {/* [ Contact ▼ ] [ ↕ Descending ▼ ] [ Filters ▼ ] [ Account Owner ▼ ]        */}
            {/* ========================================================================= */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              
              {/* 1. Sort Field Dropdown: [ Contact ▼ ] */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    setSortDropdownOpen(!sortDropdownOpen);
                    setOrderDropdownOpen(false);
                    setOwnerDropdownOpen(false);
                  }}
                  className="h-9 inline-flex items-center justify-between gap-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{sortBy}</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-150 ${sortDropdownOpen ? 'rotate-180 text-slate-600' : ''}`} />
                </button>

                {sortDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <span className="px-3 py-1.5 font-bold text-[10px] text-slate-400 uppercase tracking-wider block border-b border-slate-100">
                      Sort Leads By
                    </span>
                    {SORT_FIELDS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSortBy(opt.id);
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                          sortBy === opt.id ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.id && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Sort Direction Dropdown: [ ↕ Descending ▼ ] */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    setOrderDropdownOpen(!orderDropdownOpen);
                    setSortDropdownOpen(false);
                    setOwnerDropdownOpen(false);
                  }}
                  className="h-9 inline-flex items-center justify-between gap-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <div className="flex items-center gap-1.5">
                    {sortOrder === 'Descending' ? (
                      <ArrowDownNarrowWide className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <ArrowUpNarrowWide className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span>{sortOrder}</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-150 ${orderDropdownOpen ? 'rotate-180 text-slate-600' : ''}`} />
                </button>

                {orderDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-36 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setSortOrder('Descending');
                        setOrderDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                        sortOrder === 'Descending' ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>Descending</span>
                      {sortOrder === 'Descending' && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSortOrder('Ascending');
                        setOrderDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                        sortOrder === 'Ascending' ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>Ascending</span>
                      {sortOrder === 'Ascending' && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Filters Toggle Button: [ Filters ▼ ] */}
              <button
                type="button"
                onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                className={`h-9 inline-flex items-center justify-between gap-2 px-3 rounded-lg border text-xs font-medium shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
                  filterPanelOpen || selectedTags.length > 0 || whatsappOptedOnly || traitConditions.length > 0
                    ? 'border-red-400 bg-red-50/60 text-red-700 font-bold'
                    : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Filters</span>
                  {(selectedTags.length > 0 || whatsappOptedOnly || traitConditions.length > 0) && (
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                  )}
                </div>
                <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-150 ${filterPanelOpen ? 'rotate-180 text-red-600' : ''}`} />
              </button>

              {/* 4. Account Owner Dropdown: [ Account Owner ▼ ] */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    setOwnerDropdownOpen(!ownerDropdownOpen);
                    setSortDropdownOpen(false);
                    setOrderDropdownOpen(false);
                  }}
                  className="h-9 inline-flex items-center justify-between gap-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedOwner === 'All Users' ? 'Account Owner' : selectedOwner}</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-150 ${ownerDropdownOpen ? 'rotate-180 text-slate-600' : ''}`} />
                </button>

                {ownerDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <span className="px-3 py-1.5 font-bold text-[10px] text-slate-400 uppercase tracking-wider block border-b border-slate-100">
                      Account Owner
                    </span>
                    {ACCOUNT_OWNERS.map((ownerName) => (
                      <button
                        key={ownerName}
                        type="button"
                        onClick={() => {
                          setSelectedOwner(ownerName);
                          setOwnerDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                          selectedOwner === ownerName ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{ownerName}</span>
                        {selectedOwner === ownerName && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Filter Clear Reset Pill */}
              {(selectedTags.length > 0 || whatsappOptedOnly || selectedOwner !== 'All Users' || traitConditions.length > 0) && (
                <button
                  onClick={() => {
                    setSelectedTags([]);
                    setWhatsappOptedOnly(false);
                    setSelectedOwner('All Users');
                    setTraitConditions([]);
                    showToast('Cleared all pipeline filters');
                  }}
                  className="h-9 px-3 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>

            {/* ========================================================================= */}
            {/* 4. PIPELINE FILTER PANEL: Matching Interakt Large Filter Panel Layout     */}
            {/* ========================================================================= */}
            {filterPanelOpen && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xl animate-in fade-in zoom-in-95 duration-150 space-y-5 text-xs">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Apply Pipeline Filters
                  </h3>
                  <button
                    onClick={() => setFilterPanelOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Section 1: FILTER BY TAGS */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                      FILTER BY TAGS
                    </span>
                    <Link
                      to="/contacts"
                      className="text-red-600 hover:text-red-700 font-bold text-xs flex items-center gap-1"
                    >
                      <span>Manage Tags</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Selectable Tag Chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* All Users / Clear Tag */}
                    <button
                      type="button"
                      onClick={() => setSelectedTags([])}
                      className={`px-3 py-1.5 rounded-xl border font-semibold text-xs transition-all cursor-pointer ${
                        selectedTags.length === 0
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      All Tags
                    </button>

                    {visibleTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-red-50 text-red-700 border-red-300 shadow-2xs font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <TagIcon className={`w-3 h-3 ${isSelected ? 'text-red-600' : 'text-slate-400'}`} />
                          <span>{tag}</span>
                          {isSelected && <Check className="w-3 h-3 text-red-600 shrink-0 ml-0.5" />}
                        </button>
                      );
                    })}

                    {/* More Tags Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowMoreTags(!showMoreTags)}
                      className="px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      {showMoreTags ? 'Fewer Tags ▲' : 'More Tags ▼'}
                    </button>
                  </div>
                </div>

                {/* Section 2: Logic Connector (AND / OR) */}
                <div className="relative flex justify-center items-center my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setLogicDropdownOpen(!logicDropdownOpen)}
                      className="px-3 py-1 bg-white border border-slate-300 rounded-full font-extrabold text-[11px] text-slate-700 hover:bg-slate-50 shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>{filterLogic}</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {logicDropdownOpen && (
                      <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-24 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setFilterLogic('AND');
                            setLogicDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-1.5 text-left font-bold ${
                            filterLogic === 'AND' ? 'text-red-600 bg-red-50' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          AND
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFilterLogic('OR');
                            setLogicDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-1.5 text-left font-bold ${
                            filterLogic === 'OR' ? 'text-red-600 bg-red-50' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          OR
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: FILTER BY USER TRAITS / EVENTS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                      FILTER BY USER TRAITS / EVENTS
                    </span>
                    <button
                      type="button"
                      onClick={handleAddTraitCondition}
                      className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Filter</span>
                    </button>
                  </div>

                  {traitConditions.length === 0 ? (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 font-medium">
                      No custom user traits active. Click "+ Add Filter" to add criteria.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {traitConditions.map((cond, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                          {/* Field Selector */}
                          <select
                            value={cond.field}
                            onChange={(e) => handleUpdateTraitCondition(idx, 'field', e.target.value)}
                            className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-xs focus:outline-none cursor-pointer"
                          >
                            <option value="name">Name</option>
                            <option value="phone">Phone Number</option>
                            <option value="email">Email</option>
                            <option value="status">Lead Status</option>
                            <option value="owner">Assigned User</option>
                            <option value="value">Deal Value</option>
                            <option value="channel">Lead Source</option>
                          </select>

                          {/* Operator Selector */}
                          <select
                            value={cond.operator}
                            onChange={(e) => handleUpdateTraitCondition(idx, 'operator', e.target.value)}
                            className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:outline-none cursor-pointer"
                          >
                            <option value="is">Is</option>
                            <option value="is_not">Is not</option>
                            <option value="contains">Contains</option>
                            <option value="greater_than">Greater than</option>
                            <option value="less_than">Less than</option>
                          </select>

                          {/* Value Input */}
                          <input
                            type="text"
                            placeholder="Enter value..."
                            value={cond.value}
                            onChange={(e) => handleUpdateTraitCondition(idx, 'value', e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
                          />

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteTraitCondition(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-200/50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 4: WhatsApp Opt-in Checkbox */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={whatsappOptedOnly}
                      onChange={(e) => setWhatsappOptedOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <span>Only include customers whose 'WhatsApp opted' is true</span>
                  </label>
                </div>

                {/* Section 5: Apply Filters Full-Width Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterPanelOpen(false);
                      loadPipeline();
                      showToast('Pipeline filters applied successfully');
                    }}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer text-center"
                  >
                    Apply Filters
                  </button>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. KANBAN SALES PIPELINE BOARD (Horizontally Scrollable 7 Columns)        */}
            {/* ========================================================================= */}
            <div className="flex-1 overflow-x-auto pb-4 pt-1 min-w-0">
              
              {loading ? (
                /* Skeleton Loaders */
                <div className="flex gap-4 min-w-[1200px] h-[calc(100vh-280px)]">
                  {PIPELINE_STAGES.map((s) => (
                    <div key={s.id} className="w-72 bg-slate-100/60 rounded-2xl p-3 border border-slate-200 animate-pulse space-y-3">
                      <div className="h-6 bg-slate-200 rounded-lg w-2/3" />
                      <div className="h-9 bg-slate-200 rounded-xl" />
                      <div className="h-28 bg-white rounded-xl shadow-2xs" />
                      <div className="h-28 bg-white rounded-xl shadow-2xs" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                /* Error State with Retry Button */
                <div className="p-12 text-center bg-white rounded-3xl border border-red-200 shadow-2xs space-y-4 max-w-md mx-auto my-8">
                  <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Unable to load Sales Pipeline</h3>
                    <p className="text-xs text-slate-500 mt-1">There was an issue retrieving the latest pipeline data from PostgreSQL.</p>
                  </div>
                  <button
                    onClick={() => loadPipeline(true)}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                /* The 7 Pipeline Columns */
                <div className="flex items-start gap-4 min-w-[1400px] h-[calc(100vh-280px)]">
                  {PIPELINE_STAGES.map((stage) => {
                    const stageLeads = stagesData[stage.id] || [];
                    const stageValue = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);
                    const isDragTarget = dragOverStage === stage.id;

                    return (
                      <div
                        key={stage.id}
                        onDragOver={(e) => handleDragOver(e, stage.id)}
                        onDragLeave={(e) => handleDragLeave(e, stage.id)}
                        onDrop={(e) => handleDrop(e, stage.id)}
                        className={`w-72 shrink-0 bg-slate-100/70 rounded-2xl border transition-all flex flex-col max-h-full ${
                          isDragTarget
                            ? 'border-red-500 bg-red-50/40 ring-2 ring-red-500/20 shadow-md'
                            : 'border-slate-200/80 shadow-2xs'
                        }`}
                      >
                        {/* Column Header */}
                        <div className={`p-3 rounded-t-2xl border-b border-slate-200/60 ${stage.headerBg} ${stage.topBorder}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                              <h4 className="font-extrabold text-xs text-slate-900 tracking-tight">
                                {stage.title}
                              </h4>
                              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${stage.countBadge}`}>
                                {stageLeads.length}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-500">
                              {formatCurrency(stageValue)}
                            </span>
                          </div>
                        </div>

                        {/* Quick + Add Contact Button on Column */}
                        <div className="p-2.5 pb-1">
                          <button
                            type="button"
                            onClick={() => {
                              setTargetAddStage(stage.title);
                              setNewLeadStage(stage.title);
                              setAddLeadModalOpen(true);
                            }}
                            className="w-full h-8 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-all shadow-2xs cursor-pointer hover:border-slate-400"
                          >
                            <Plus className="w-3.5 h-3.5 text-slate-400" />
                            <span>Add Contact</span>
                          </button>
                        </div>

                        {/* Contact Cards List */}
                        <div className="p-2.5 pt-1.5 space-y-2.5 flex-1 overflow-y-auto pr-1.5 scrollbar-thin">
                          {stageLeads.length === 0 ? (
                            <div className="h-36 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-3 text-center bg-white/40 my-1">
                              <p className="text-xs text-slate-400 font-semibold">No Contacts present</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Drag a contact into this stage or add a new lead.</p>
                            </div>
                          ) : (
                            stageLeads.map((lead) => {
                              const isDragging = draggedLeadId === lead.id;

                              return (
                                <div
                                  key={lead.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, lead.id, stage.id)}
                                  onClick={() => handleOpenLeadDrawer(lead)}
                                  className={`bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-red-300 transition-all cursor-grab active:cursor-grabbing select-none group relative space-y-2.5 ${
                                    isDragging ? 'opacity-30 border-dashed border-red-500 scale-95' : ''
                                  }`}
                                >
                                  {/* Lead Title & Value */}
                                  <div className="flex items-start justify-between gap-1.5">
                                    <div className="min-w-0 flex-1">
                                      <h5 className="font-bold text-xs text-slate-900 group-hover:text-red-600 transition-colors truncate">
                                        {lead.name}
                                      </h5>
                                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                                        <WhatsAppIcon className="w-3 h-3 text-emerald-600 shrink-0" />
                                        <span className="truncate">{lead.phone}</span>
                                      </div>
                                    </div>

                                    {lead.value > 0 && (
                                      <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-lg shrink-0">
                                        {formatCurrency(lead.value)}
                                      </span>
                                    )}
                                  </div>

                                  {/* Notes / Interest Preview */}
                                  {lead.notes && (
                                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                      {lead.notes}
                                    </p>
                                  )}

                                  {/* Tags Chips */}
                                  <div className="flex flex-wrap items-center gap-1">
                                    {(lead.tags && lead.tags.length > 0 ? lead.tags : [lead.tag || 'Lead']).slice(0, 2).map((t, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/60"
                                      >
                                        <TagIcon className="w-2.5 h-2.5" />
                                        <span className="truncate max-w-[100px]">{t}</span>
                                      </span>
                                    ))}
                                    {(lead.tags?.length || 1) > 2 && (
                                      <span className="text-[10px] text-slate-400 font-semibold px-1">
                                        +{(lead.tags?.length || 1) - 2}
                                      </span>
                                    )}
                                  </div>

                                  {/* Card Footer: Owner & Time */}
                                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                      <div className="w-4 h-4 rounded-full bg-[#0d3b30] text-emerald-300 flex items-center justify-center text-[8px] font-extrabold">
                                        {(lead.owner || 'S').charAt(0).toUpperCase()}
                                      </div>
                                      <span className="truncate max-w-[80px]">Assigned: {lead.owner || 'Shraddha'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      <span>{formatTimeAgo(lead.updatedAt || lead.createdAt)}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 6. CONTACT DETAILS DRAWER (Slide-over on Card Click)                       */}
      {/* ========================================================================= */}
      {leadDrawerOpen && selectedLead && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-150">
          <div
            className="bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#0d3b30] text-emerald-300 font-bold text-sm flex items-center justify-center shadow-2xs">
                  {selectedLead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 truncate max-w-[220px]">
                    {selectedLead.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <span>{selectedLead.phone}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">{selectedLead.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
                  title="Delete Contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLeadDrawerOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* Quick WhatsApp Action */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-800 text-xs">WhatsApp Direct Chat</span>
                </div>
                <a
                  href={`https://wa.me/${selectedLead.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1"
                >
                  <span>Chat</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Pipeline Stage Select */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                  Pipeline Stage
                </label>
                <select
                  value={drawerStage}
                  onChange={(e) => setDrawerStage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Owner Assignment */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                  Assigned Account Owner
                </label>
                <select
                  value={drawerOwner}
                  onChange={(e) => setDrawerOwner(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                >
                  {ACCOUNT_OWNERS.filter((o) => o !== 'All Users').map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deal Value */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                  Deal Value (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={drawerValue}
                    onChange={(e) => setDrawerValue(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Notes & Activity Log */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                  Lead Notes & Details
                </label>
                <textarea
                  rows={4}
                  value={drawerNotes}
                  onChange={(e) => setDrawerNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                  placeholder="Add notes about buyer intent, follow-up items, or product discussions..."
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                  Associated Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedLead.tags || [selectedLead.tag || 'Repeat Buyers']).map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200"
                    >
                      <TagIcon className="w-3 h-3" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setLeadDrawerOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingDrawer}
                onClick={handleSaveDrawer}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSavingDrawer ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && selectedLead && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Delete Contact</span>
            </h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              Are you sure you want to remove <strong>{selectedLead.name}</strong> from the Sales Pipeline?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteLead}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. ADD CONTACT / LEAD MODAL                                               */}
      {/* ========================================================================= */}
      {addLeadModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 text-xs font-sans">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0d3b30] text-emerald-300 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Add Lead to Pipeline</h3>
                  <p className="text-[11px] text-slate-500">Create a contact and place in {newLeadStage}</p>
                </div>
              </div>
              <button
                onClick={() => setAddLeadModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddLeadSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. rahul@example.com"
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    Deal Value (₹ INR)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 25000"
                    value={newLeadValue}
                    onChange={(e) => setNewLeadValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    Pipeline Stage
                  </label>
                  <select
                    value={newLeadStage}
                    onChange={(e) => setNewLeadStage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                  >
                    {PIPELINE_STAGES.map((s) => (
                      <option key={s.id} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    Account Owner
                  </label>
                  <select
                    value={newLeadOwner}
                    onChange={(e) => setNewLeadOwner(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                  >
                    {ACCOUNT_OWNERS.filter((o) => o !== 'All Users').map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                  Tag
                </label>
                <select
                  value={newLeadTags[0] || 'Repeat Buyers'}
                  onChange={(e) => setNewLeadTags([e.target.value])}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                >
                  {ALL_TAGS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                  Lead Source & Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes about buyer interest or product request..."
                  value={newLeadNotes}
                  onChange={(e) => setNewLeadNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddLeadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingLead ? 'Adding...' : 'Add Lead'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
