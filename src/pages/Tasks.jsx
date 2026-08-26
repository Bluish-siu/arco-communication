import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Calendar,
  X,
  Edit3,
  Trash2,
  ChevronDown,
  MoreVertical,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Check,
  LogOut,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { tasksService } from '../services/tasksService';
import { contactsService } from '../services/contactsService';

// WhatsApp SVG Icon
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Account Owners List
const ACCOUNT_OWNERS = ['Shraddha', 'Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram'];

// 7 Contact Pipeline Stages
const CONTACT_STAGES = [
  'New Lead',
  'Qualification',
  'Needs Analysis',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
];

// Sort Options (Interakt Style: Task Due Date, Contact Closure, Deadline)
const SORT_OPTIONS = [
  { id: 'due_date', label: 'Task Due Date' },
  { id: 'contact_closure', label: 'Contact Closure' },
  { id: 'deadline', label: 'Deadline' },
  { id: 'created_at', label: 'Created Date' },
];

export default function Tasks() {
  const { user, businessSetup, logout } = useOnboarding();
  const userName = businessSetup?.companyName || user?.name || 'Shraddha';

  // Navigation profile dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Active Tab: 'my' (My Tasks) vs 'team' (Team's Tasks)
  const [activeTab, setActiveTab] = useState('team');

  // Task list & stats
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [tasksList, setTasksList] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    todoCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    overdueCount: 0,
  });

  // Contacts list for linking tasks
  const [contactsList, setContactsList] = useState([]);

  // Search & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('due_date');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Interakt Tasks Filter Panel States
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [filterDeadlines, setFilterDeadlines] = useState([]); // ['Overdue Tasks', 'Due Today']
  const [filterStatuses, setFilterStatuses] = useState([]); // ['Todo', 'In-Progress', 'Done']
  const [filterContactStatuses, setFilterContactStatuses] = useState([]); // ['New Lead', 'Qualification', ...]

  // Temporary staging filter states inside panel before "Apply"
  const [tempDeadlines, setTempDeadlines] = useState([]);
  const [tempStatuses, setTempStatuses] = useState([]);
  const [tempContactStatuses, setTempContactStatuses] = useState([]);

  // Active row action menu
  const [activeRowMenuId, setActiveRowMenuId] = useState(null);
  const [activeStatusMenuId, setActiveStatusMenuId] = useState(null);

  // Modals & Drawer States
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formContactId, setFormContactId] = useState('');
  const [formAssignedTo, setFormAssignedTo] = useState('Shraddha');
  const [formDueDate, setFormDueDate] = useState('');
  const [formDueTime, setFormDueTime] = useState('17:30');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formStatus, setFormStatus] = useState('To Do');
  const [formError, setFormError] = useState('');

  // Toast State
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside() {
      setSortDropdownOpen(false);
      setActiveRowMenuId(null);
      setActiveStatusMenuId(null);
      setProfileDropdownOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Sync staging filters when filter panel opens
  useEffect(() => {
    if (filterPanelOpen) {
      setTempDeadlines([...filterDeadlines]);
      setTempStatuses([...filterStatuses]);
      setTempContactStatuses([...filterContactStatuses]);
    }
  }, [filterPanelOpen]);

  // Load Contacts list for linking
  useEffect(() => {
    async function loadContacts() {
      try {
        const res = await contactsService.getContacts({ limit: 100 });
        if (res && res.data) {
          setContactsList(res.data);
        }
      } catch (e) {
        console.warn('Failed to load contacts for task linker:', e);
      }
    }
    loadContacts();
  }, []);

  // Fetch Tasks from PostgreSQL
  const loadTasks = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    setError(null);

    try {
      const params = {
        search: searchQuery || undefined,
        assigned_to: activeTab === 'my' ? userName : undefined,
        deadline: filterDeadlines.length > 0 ? filterDeadlines : undefined,
        status: filterStatuses.length > 0 ? filterStatuses : undefined,
        contact_status: filterContactStatuses.length > 0 ? filterContactStatuses : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      const res = await tasksService.getTasks(params);
      if (res && res.data) {
        setTasksList(res.data);
        if (res.summary) setSummary(res.summary);
      } else {
        setTasksList([]);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Unable to load tasks');
    } finally {
      setLoading(false);
      if (showSpinner) setRefreshing(false);
    }
  };

  // Fetch whenever filters/sorting/search/tab changes
  useEffect(() => {
    loadTasks();
  }, [activeTab, filterDeadlines, filterStatuses, filterContactStatuses, sortBy, sortOrder, searchQuery]);

  // Format Due Date & Calendar Badges
  const formatDueDisplay = (dateStr) => {
    if (!dateStr) return { text: 'No Due Date', isOverdue: false, isToday: false, dateFormatted: '—', timeStr: '' };
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateFormatted = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    let label = `${dateFormatted} at ${timeStr}`;
    let isToday = diffDays === 0;
    let isOverdue = diffDays < 0;

    return {
      text: label,
      diffDays,
      isToday,
      isOverdue,
      dateFormatted,
      timeStr,
    };
  };

  // Status Quick Update Handler
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      setTasksList((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t))
      );
      await tasksService.updateTaskStatus(taskId, newStatus);
      showToast(`Task status updated to "${newStatus}"`);
      loadTasks();
    } catch (err) {
      showToast('Failed to update task status', 'error');
      loadTasks();
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setFormId('');
    setFormTitle('');
    setFormDescription('');
    setFormContactId('');
    setFormAssignedTo('Shraddha');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormDueDate(tomorrow.toISOString().split('T')[0]);
    setFormDueTime('17:30');
    setFormPriority('Medium');
    setFormStatus('To Do');
    setFormError('');
    setTaskModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (task) => {
    setIsEditing(true);
    setFormId(task.id);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormContactId(task.contactId || '');
    setFormAssignedTo(task.assignedTo || 'Shraddha');
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      setFormDueDate(d.toISOString().split('T')[0]);
      setFormDueTime(d.toTimeString().slice(0, 5) || '17:30');
    } else {
      setFormDueDate('');
      setFormDueTime('17:30');
    }
    setFormPriority(task.priority || 'Medium');
    setFormStatus(task.status || 'To Do');
    setFormError('');
    setTaskModalOpen(true);
    setTaskDetailsOpen(false);
  };

  // Save / Submit Task (Create or Edit)
  const handleSaveTaskSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Task title is required.');
      return;
    }
    setFormError('');
    setIsSubmitting(true);

    try {
      let combinedDueDate = null;
      if (formDueDate) {
        combinedDueDate = new Date(`${formDueDate}T${formDueTime || '12:00'}:00`).toISOString();
      }

      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        contact_id: formContactId || null,
        assigned_to: formAssignedTo,
        due_date: combinedDueDate,
        priority: formPriority,
        status: formStatus,
      };

      if (isEditing && formId) {
        await tasksService.updateTask(formId, payload);
        showToast(`Task "${formTitle}" updated successfully`);
      } else {
        await tasksService.createTask(payload);
        showToast(`Task "${formTitle}" created successfully`);
      }

      setTaskModalOpen(false);
      loadTasks();
    } catch (err) {
      setFormError(err.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Task Handler
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await tasksService.deleteTask(taskToDelete.id);
      showToast(`Deleted task "${taskToDelete.title}"`);
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
      setTaskDetailsOpen(false);
      loadTasks();
    } catch (err) {
      showToast('Failed to delete task', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Apply Filters from Dropdown Panel
  const handleApplyFilters = () => {
    setFilterDeadlines([...tempDeadlines]);
    setFilterStatuses([...tempStatuses]);
    setFilterContactStatuses([...tempContactStatuses]);
    setFilterPanelOpen(false);
    showToast('Task filters applied');
  };

  // Reset Filters
  const handleResetFilters = () => {
    setTempDeadlines([]);
    setTempStatuses([]);
    setTempContactStatuses([]);
    setFilterDeadlines([]);
    setFilterStatuses([]);
    setFilterContactStatuses([]);
    setFilterPanelOpen(false);
    showToast('Reset all task filters');
  };

  // Total active filter count
  const activeFiltersCount = filterDeadlines.length + filterStatuses.length + filterContactStatuses.length;

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
              <span className="text-slate-900 font-bold">Tasks</span>
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
                      to="/sales-pipeline"
                      className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50"
                    >
                      Sales Pipeline
                    </Link>
                    <Link
                      to="/sales-crm-reports"
                      className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50"
                    >
                      Sales CRM Reports
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

          {/* 2. MAIN TASKS CONTENT */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-5 flex-1 flex flex-col min-w-0">
            
            {/* PAGE HEADER: Circular ARCO Dark-Green Icon + Title + + Create Task Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#0d3b30] flex items-center justify-center text-white shrink-0 shadow-2xs">
                  <CheckSquare className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Tasks</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    All your sales tasks in one place—track, follow up, and close deals faster.
                  </p>
                </div>
              </div>

              {/* Action: + Create Task */}
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-emerald-300" />
                <span>Create Task</span>
              </button>
            </div>

            {/* ========================================================================= */}
            {/* 3. TABS: [ My Tasks ]  [ Team's Tasks ]                                   */}
            {/* ========================================================================= */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-1">
              <div className="flex items-center gap-6 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('team')}
                  className={`pb-2.5 transition-all cursor-pointer relative ${
                    activeTab === 'team'
                      ? 'text-slate-900 border-b-2 border-red-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Team's Tasks</span>
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-bold">
                    {summary.total}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('my')}
                  className={`pb-2.5 transition-all cursor-pointer relative ${
                    activeTab === 'my'
                      ? 'text-slate-900 border-b-2 border-red-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>My Tasks</span>
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 4. TOOLBAR: [ Task Due Date ▼ ]  [ Filters ]  [ Search ]  [ Chips ]       */}
            {/* ========================================================================= */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                
                {/* 1. Task Due Date Sort Dropdown */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    className="h-9 inline-flex items-center gap-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  >
                    <span>{SORT_OPTIONS.find((f) => f.id === sortBy)?.label || 'Task Due Date'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {sortDropdownOpen && (
                    <div className="absolute left-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                      {SORT_OPTIONS.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            setSortBy(f.id);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                            sortBy === f.id ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{f.label}</span>
                          {sortBy === f.id && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Filters Button (Toggles Interakt Tasks Filter Panel) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                    className={`h-9 inline-flex items-center gap-2 px-3.5 rounded-lg border text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
                      activeFiltersCount > 0 || filterPanelOpen
                        ? 'border-red-400 bg-red-50/70 text-red-700 font-bold'
                        : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-extrabold flex items-center justify-center shrink-0">
                        {activeFiltersCount}
                      </span>
                    )}
                    <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-150 ${filterPanelOpen ? 'rotate-180 text-red-600' : ''}`} />
                  </button>

                  {/* Interakt Filter Panel Dropdown */}
                  {filterPanelOpen && (
                    <div
                      className="absolute left-0 mt-2 w-72 max-h-[460px] bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 px-4 z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col text-xs space-y-3.5 overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
                        <span className="font-extrabold text-xs text-slate-900">Filter Tasks</span>
                        <button
                          onClick={() => setFilterPanelOpen(false)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="overflow-y-auto max-h-[310px] space-y-4 pr-1 scrollbar-thin">
                        {/* 1. TASK DEADLINE */}
                        <div className="space-y-1.5">
                          <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block">
                            1. TASK DEADLINE
                          </span>
                          <div className="space-y-1.5 pl-0.5">
                            {['Overdue Tasks', 'Due Today'].map((d) => (
                              <label
                                key={d}
                                className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={tempDeadlines.includes(d)}
                                  onChange={() => {
                                    setTempDeadlines((prev) =>
                                      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
                                    );
                                  }}
                                  className="w-3.5 h-3.5 rounded text-red-600 focus:ring-red-500 border-slate-300 cursor-pointer"
                                />
                                <span>{d}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* 2. TASK STATUS */}
                        <div className="space-y-1.5">
                          <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block">
                            2. TASK STATUS
                          </span>
                          <div className="space-y-1.5 pl-0.5">
                            {['Todo', 'In-Progress', 'Done'].map((st) => (
                              <label
                                key={st}
                                className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={tempStatuses.includes(st)}
                                  onChange={() => {
                                    setTempStatuses((prev) =>
                                      prev.includes(st) ? prev.filter((x) => x !== st) : [...prev, st]
                                    );
                                  }}
                                  className="w-3.5 h-3.5 rounded text-red-600 focus:ring-red-500 border-slate-300 cursor-pointer"
                                />
                                <span>{st}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* 3. CONTACT STATUS */}
                        <div className="space-y-1.5">
                          <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block">
                            3. CONTACT STATUS
                          </span>
                          <div className="space-y-1.5 pl-0.5">
                            {CONTACT_STAGES.map((cs) => (
                              <label
                                key={cs}
                                className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={tempContactStatuses.includes(cs)}
                                  onChange={() => {
                                    setTempContactStatuses((prev) =>
                                      prev.includes(cs) ? prev.filter((x) => x !== cs) : [...prev, cs]
                                    );
                                  }}
                                  className="w-3.5 h-3.5 rounded text-red-600 focus:ring-red-500 border-slate-300 cursor-pointer"
                                />
                                <span>{cs}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyFilters}
                          className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Search Input */}
                <div className="relative min-w-[180px] max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={() => loadTasks(true)}
                disabled={refreshing}
                className="h-9 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                title="Refresh latest tasks"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Active Filter Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-[11px] font-bold text-slate-400">Active Filters:</span>
                {filterDeadlines.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
                  >
                    <span>{d}</span>
                    <button
                      onClick={() => setFilterDeadlines(filterDeadlines.filter((x) => x !== d))}
                      className="hover:text-rose-900 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filterStatuses.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    <span>Status: {s}</span>
                    <button
                      onClick={() => setFilterStatuses(filterStatuses.filter((x) => x !== s))}
                      className="hover:text-blue-900 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filterContactStatuses.map((cs) => (
                  <span
                    key={cs}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    <span>Contact: {cs}</span>
                    <button
                      onClick={() => setFilterContactStatuses(filterContactStatuses.filter((x) => x !== cs))}
                      className="hover:text-emerald-900 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-red-600 hover:text-red-700 underline cursor-pointer ml-1"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. SHOWING X TASKS COUNTER & MAIN TASK TABLE                              */}
            {/* ========================================================================= */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700">
                Showing {tasksList.length} Tasks
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex-1 flex flex-col min-h-[360px]">
              
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : error ? (
                <div className="p-12 text-center space-y-3 my-auto">
                  <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                  <h3 className="font-extrabold text-slate-900 text-base">{error}</h3>
                  <button
                    onClick={() => loadTasks(true)}
                    className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              ) : tasksList.length === 0 ? (
                <div className="p-12 text-center space-y-3 my-auto">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      No Tasks Found
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {activeFiltersCount > 0 || searchQuery
                        ? 'No tasks match your active filters. Try clearing your filters.'
                        : 'Create a task to start tracking and assigning activities for your sales team.'}
                    </p>
                  </div>
                  {activeFiltersCount > 0 || searchQuery ? (
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button
                      onClick={handleOpenCreateModal}
                      className="px-4 py-2 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      + Create Task
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Task</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Assigned To</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Created</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {tasksList.map((task) => {
                        const dueInfo = formatDueDisplay(task.dueDate);
                        const isTaskOverdue = task.isOverdue;

                        return (
                          <tr
                            key={task.id}
                            className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                            onClick={() => {
                              setSelectedTask(task);
                              setTaskDetailsOpen(true);
                            }}
                          >
                            <td className="py-3.5 px-4 max-w-[260px]">
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 group-hover:text-red-600 transition-colors truncate">
                                  {task.title}
                                </div>
                                {task.description && (
                                  <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-[240px]">
                                    {task.description}
                                  </p>
                                )}
                                {isTaskOverdue && (
                                  <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    <span>OVERDUE</span>
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 max-w-[180px]" onClick={(e) => e.stopPropagation()}>
                              {task.contactId ? (
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 hover:text-emerald-700 transition-colors truncate flex items-center gap-1">
                                    <span>{task.contactName}</span>
                                    <span className="text-[10px] text-slate-400 font-normal">({task.contactStatus})</span>
                                  </div>
                                  {task.contactPhone && (
                                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                                      <WhatsAppIcon className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span className="truncate">{task.contactPhone}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">—</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-[#0d3b30] text-emerald-300 flex items-center justify-center text-[10px] font-extrabold shadow-2xs shrink-0">
                                  {(task.assignedTo || 'S').charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold text-slate-800 truncate">{task.assignedTo || 'Shraddha'}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="min-w-0">
                                <div className={`font-semibold truncate flex items-center gap-1.5 ${isTaskOverdue ? 'text-rose-600 font-bold' : dueInfo.isToday ? 'text-amber-700 font-bold' : 'text-slate-700'}`}>
                                  <Calendar className="w-3 h-3 shrink-0" />
                                  <span>{dueInfo.dateFormatted || 'No Date'}</span>
                                </div>
                                {dueInfo.timeStr && (
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    {dueInfo.timeStr}
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                  task.priority === 'High'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : task.priority === 'Medium'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                {task.priority || 'Medium'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setActiveStatusMenuId(activeStatusMenuId === task.id ? null : task.id)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                    task.status === 'Completed' || task.status === 'Done'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : task.status === 'In Progress' || task.status === 'In-Progress'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  <span>{task.status}</span>
                                  <ChevronDown className="w-3 h-3 opacity-60" />
                                </button>

                                {activeStatusMenuId === task.id && (
                                  <div className="absolute left-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 text-xs">
                                    {['To Do', 'In Progress', 'Completed'].map((st) => (
                                      <button
                                        key={st}
                                        type="button"
                                        onClick={() => {
                                          handleUpdateStatus(task.id, st);
                                          setActiveStatusMenuId(null);
                                        }}
                                        className={`w-full px-3 py-1.5 text-left font-bold transition-colors cursor-pointer ${
                                          task.status === st ? 'text-red-600 bg-red-50' : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                      >
                                        {st}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                              {new Date(task.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </td>

                            <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="relative inline-block text-left">
                                <button
                                  type="button"
                                  onClick={() => setActiveRowMenuId(activeRowMenuId === task.id ? null : task.id)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {activeRowMenuId === task.id && (
                                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedTask(task);
                                        setTaskDetailsOpen(true);
                                        setActiveRowMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium text-left cursor-pointer"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                                      <span>View Details</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleUpdateStatus(task.id, task.status === 'Completed' ? 'To Do' : 'Completed');
                                        setActiveRowMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium text-left cursor-pointer"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>{task.status === 'Completed' ? 'Mark as Incomplete' : 'Mark as Completed'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleOpenEditModal(task);
                                        setActiveRowMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium text-left cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                                      <span>Edit Task</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTaskToDelete(task);
                                        setDeleteConfirmOpen(true);
                                        setActiveRowMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 font-bold text-left border-t border-slate-100 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                      <span>Delete Task</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 6. CREATE / EDIT TASK MODAL                                               */}
      {/* ========================================================================= */}
      {taskModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0d3b30] text-emerald-300 flex items-center justify-center font-bold">
                  {isEditing ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {isEditing ? 'Edit Task' : 'Create New Task'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isEditing ? 'Update task fields and assignment' : 'Assign task to team member with contact link'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTaskModalOpen(false)}
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

            <form onSubmit={handleSaveTaskSubmit} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule WhatsApp API Demo"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Add notes, agenda, or discussion points..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                  Associated Contact
                </label>
                <select
                  value={formContactId}
                  onChange={(e) => setFormContactId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                >
                  <option value="">No Contact Linked</option>
                  {contactsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) — {c.status || 'Lead'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    Assigned To
                  </label>
                  <select
                    value={formAssignedTo}
                    onChange={(e) => setFormAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-xs focus:outline-none cursor-pointer"
                  >
                    {ACCOUNT_OWNERS.map((owner) => (
                      <option key={owner} value={owner}>
                        {owner}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={formDueTime}
                    onChange={(e) => setFormDueTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TASK DETAILS MODAL / DRAWER                                            */}
      {/* ========================================================================= */}
      {taskDetailsOpen && selectedTask && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0d3b30] text-emerald-300 flex items-center justify-center font-bold">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedTask.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${selectedTask.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                      {selectedTask.status}
                    </span>
                    <span className="text-[10px] text-slate-400">Priority: {selectedTask.priority}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setTaskDetailsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedTask.description && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed font-medium">
                {selectedTask.description}
              </div>
            )}

            {selectedTask.contactId && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-xs">
                    Linked Contact: {selectedTask.contactName}
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {selectedTask.contactStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>{selectedTask.contactPhone}</span>
                  {selectedTask.contactPhone && (
                    <a
                      href={`https://wa.me/${selectedTask.contactPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1"
                    >
                      <WhatsAppIcon className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1 text-slate-600">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Assigned User</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedTask.assignedTo}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Due Date</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {formatDueDisplay(selectedTask.dueDate).text}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setTaskToDelete(selectedTask);
                  setDeleteConfirmOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                Delete
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(selectedTask)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer border border-slate-200"
                >
                  Edit Task
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateStatus(selectedTask.id, selectedTask.status === 'Completed' ? 'To Do' : 'Completed');
                    setTaskDetailsOpen(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {selectedTask.status === 'Completed' ? 'Mark Incomplete' : 'Mark Completed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. DELETE CONFIRMATION MODAL                                              */}
      {/* ========================================================================= */}
      {deleteConfirmOpen && taskToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Delete Task?</span>
            </h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              Are you sure you want to delete task <strong>"{taskToDelete.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteTask}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
