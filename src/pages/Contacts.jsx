import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  ChevronDown,
  Plus,
  Send,
  SlidersHorizontal,
  Info,
  X,
  Clock,
  Bell,
  Settings,
  User,
  LogOut,
  Download,
  Upload,
  CheckCircle2,
  Trash2,
  Tag as TagIcon,
  Filter,
  Columns3,
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ExternalLink,
  Phone,
  Mail,
  ShieldCheck,
  Bookmark,
  PlusCircle,
  Megaphone,
  BookOpen,
  PieChart,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { contactsService } from '../services/contactsService';
import { segmentsService } from '../services/segmentsService';
import SelectSegmentDropdown from '../components/contacts/SelectSegmentDropdown';
import TagFilterDropdown from '../components/contacts/TagFilterDropdown';
import SaveSegmentModal from '../components/contacts/SaveSegmentModal';

// Available Tag Options for Bulk Tagging (Matching Interakt specification)
const BULK_TAG_OPTIONS = [
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

// WhatsApp Contextual SVG Icon
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function Contacts() {
  const navigate = useNavigate();
  const { user, businessSetup, logout } = useOnboarding();
  const userName = businessSetup.companyName || user.name || 'Business Owner';

  // Profile & Header State
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Pagination & Search
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contactsList, setContactsList] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [countsSummary, setCountsSummary] = useState({ total: 0, whatsappOpted: 0, whatsappNonOpted: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  // Top Bar Filters (Strictly Preserved Layout)
  const [selectedSavedSegment, setSelectedSavedSegment] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOpted, setSelectedOpted] = useState('all');

  // Active Applied Custom Conditions (for "Apply Filter Without Saving")
  const [activeCustomConditions, setActiveCustomConditions] = useState([]);
  const [activeLogic, setActiveLogic] = useState('AND');
  const [activeWhatsappOpted, setActiveWhatsappOpted] = useState('all');

  // Saved Segments List (Loaded dynamically from PostgreSQL)
  const [savedSegments, setSavedSegments] = useState([]);

  // Selection for Bulk Actions
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [modifyColumnsOpen, setModifyColumnsOpen] = useState(false);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [bulkTagModalOpen, setBulkTagModalOpen] = useState(false);
  const [selectedBulkTags, setSelectedBulkTags] = useState([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [isApplyingBulkTags, setIsApplyingBulkTags] = useState(false);

  // Save Segment Modal State
  const [saveSegmentModalOpen, setSaveSegmentModalOpen] = useState(false);
  const [isSavingSegment, setIsSavingSegment] = useState(false);
  const [modalAudienceCount, setModalAudienceCount] = useState(null);

  // Create Contacts Modal (Manual vs Bulk CSV)
  const [createContactModalOpen, setCreateContactModalOpen] = useState(false);
  const [createMode, setCreateMode] = useState('manual'); // 'manual' | 'csv'
  
  // Manual Create Fields
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactCountryCode, setNewContactCountryCode] = useState('+91');
  const [newContactUserId, setNewContactUserId] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactTag, setNewContactTag] = useState('Lead');
  const [newContactSegment, setNewContactSegment] = useState('High Intent');
  const [newContactStatus, setNewContactStatus] = useState('Open Lead');
  const [newContactOpted, setNewContactOpted] = useState(true);
  const [newContactValue, setNewContactValue] = useState('');
  const [newContactNotes, setNewContactNotes] = useState('');

  // Bulk CSV Upload State
  const fileInputRef = useRef(null);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreviewRows, setCsvPreviewRows] = useState([]);
  const [csvValidating, setCsvValidating] = useState(false);
  const [csvImportResult, setCsvImportResult] = useState(null);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    userId: true,
    phone: true,
    opted: true,
    email: true,
    segment: true,
    tag: true,
    status: true,
    value: true,
    createdAt: true,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load Saved Segments from Backend
  const loadSavedSegments = async () => {
    try {
      const segs = await segmentsService.getSegments();
      setSavedSegments(Array.isArray(segs) ? segs : []);
    } catch {
      console.warn('Failed to load saved segments');
    }
  };

  // Load Paginated Contacts from Backend
  const loadContacts = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery,
        tag: selectedTag !== 'all' ? selectedTag : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        whatsapp_opted: activeWhatsappOpted !== 'all' ? activeWhatsappOpted : (selectedOpted !== 'all' ? selectedOpted : undefined),
        savedSegmentId: selectedSavedSegment !== 'all' ? selectedSavedSegment : undefined,
        conditions: activeCustomConditions.length > 0 ? JSON.stringify(activeCustomConditions) : undefined,
        logic: activeLogic,
      };

      const res = await contactsService.getContacts(params);

      if (res && res.data) {
        setContactsList(Array.isArray(res.data) ? res.data : []);
        setTotalContacts(res.total || 0);
        setTotalPages(res.totalPages || 1);
        if (res.counts) setCountsSummary(res.counts);
      }
    } catch (err) {
      showToast('Failed to load contacts', 'error');
    } finally {
      setLoading(false);
      if (showSpinner) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSavedSegments();
  }, []);

  useEffect(() => {
    loadContacts();
  }, [page, limit, searchQuery, selectedSavedSegment, selectedTag, selectedStatus, selectedOpted, activeCustomConditions, activeLogic, activeWhatsappOpted]);

  // Handle "Select Segment" choice from custom dropdown
  const handleSelectSegment = (segmentId) => {
    setSelectedSavedSegment(segmentId);
    setActiveCustomConditions([]); // Clear temporary custom filter
    setPage(1);
    const seg = savedSegments.find((s) => s.id === segmentId);
    if (seg) {
      showToast(`Selected saved segment: "${seg.name}"`);
    } else {
      showToast('Showing all contacts');
    }
  };

  // Handle "Apply Filter Without Saving" from SaveSegmentModal
  const handleApplyFilterWithoutSaving = ({ conditions, logic, whatsappOpted }) => {
    setActiveCustomConditions(conditions);
    setActiveLogic(logic);
    setActiveWhatsappOpted(whatsappOpted ? 'true' : 'all');
    setSelectedSavedSegment('all'); // Clear saved segment selection
    setPage(1);
    setSaveSegmentModalOpen(false);
    showToast(`Applied custom filter (${conditions.length} conditions) without saving.`);
  };

  // Handle "Save Segment" submission from SaveSegmentModal
  const handleSaveSegmentSubmit = async ({ name, description, filterType, conditions, logic, whatsappOpted }) => {
    setIsSavingSegment(true);
    try {
      const payload = {
        name,
        description,
        filterType,
        conditions,
        logic,
      };

      const newSeg = await segmentsService.createSegment(payload);
      showToast(`Saved segment "${name}" created successfully!`);

      // 1. Refresh saved segments list from backend
      await loadSavedSegments();

      // 2. Automatically select the newly created segment
      if (newSeg && newSeg.id) {
        setSelectedSavedSegment(newSeg.id);
      }

      // 3. Clear temporary custom conditions, close modal, and refresh table
      setActiveCustomConditions([]);
      setSaveSegmentModalOpen(false);
      setPage(1);
    } catch (err) {
      showToast('Failed to save segment.', 'error');
    } finally {
      setIsSavingSegment(false);
    }
  };

  // Reset custom filter
  const handleResetFilters = () => {
    setActiveCustomConditions([]);
    setSelectedSavedSegment('all');
    setSelectedTag('all');
    setSelectedStatus('all');
    setSelectedOpted('all');
    setActiveWhatsappOpted('all');
    setSearchQuery('');
    setPage(1);
    showToast('Filters cleared.');
  };

  // Handle Manual Contact Creation
  const handleCreateContact = async (e) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) {
      showToast('Name and Phone Number are required', 'error');
      return;
    }

    try {
      const payload = {
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        countryCode: newContactCountryCode,
        userId: newContactUserId.trim() || undefined,
        email: newContactEmail.trim() || undefined,
        tag: newContactTag,
        tags: [newContactTag],
        segment: newContactSegment,
        status: newContactStatus,
        whatsappOpted: newContactOpted,
        value: newContactValue ? parseFloat(newContactValue) : 0,
        notes: newContactNotes.trim(),
      };

      await contactsService.createContact(payload);
      showToast(`Contact "${payload.name}" created successfully!`);
      setCreateContactModalOpen(false);
      resetManualForm();
      loadContacts();
    } catch (err) {
      showToast(err.message || 'Failed to create contact (duplicate phone number).', 'error');
    }
  };

  const resetManualForm = () => {
    setNewContactName('');
    setNewContactPhone('');
    setNewContactUserId('');
    setNewContactEmail('');
    setNewContactValue('');
    setNewContactNotes('');
    setNewContactTag('Lead');
    setNewContactSegment('High Intent');
    setNewContactOpted(true);
  };

  // CSV Parser helper
  const handleCsvFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setCsvValidating(true);
    setCsvImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          showToast('CSV file is empty or missing data rows.', 'error');
          setCsvValidating(false);
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          const rowObj = {};
          headers.forEach((h, idx) => {
            rowObj[h] = cols[idx] || '';
          });
          rows.push(rowObj);
        }

        setCsvPreviewRows(rows);
        showToast(`Parsed ${rows.length} rows from CSV file.`);
      } catch {
        showToast('Failed to parse CSV file.', 'error');
      } finally {
        setCsvValidating(false);
      }
    };
    reader.readAsText(file);
  };

  // Submit Bulk CSV Upload
  const handleUploadCsv = async () => {
    if (!csvPreviewRows || csvPreviewRows.length === 0) {
      showToast('No contact rows to upload.', 'error');
      return;
    }

    setCsvValidating(true);
    try {
      const res = await contactsService.bulkUpload(csvPreviewRows);
      setCsvImportResult(res.summary || res);
      showToast(`Bulk upload complete: ${res.summary?.importedCount || 0} imported!`);
      loadContacts();
    } catch (err) {
      showToast(err.message || 'Bulk upload failed.', 'error');
    } finally {
      setCsvValidating(false);
    }
  };

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const csvContent =
      'Name,Phone,Email,User ID,Tag,Segment,Status,WhatsApp Opted,Deal Value\n' +
      'Amit Sharma,+919876543210,amit.sharma@example.com,USR_1001,VIP,VIP Customers,Qualified,true,45000\n' +
      'Priya Patel,+919812345678,priya.patel@example.com,USR_1002,Lead,High Intent,Open Lead,true,25000\n' +
      'Rahul Verma,+919899887766,rahul.verma@example.com,USR_1003,Enterprise,VIP Customers,In Discussion,true,80000\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'arco_sample_contacts_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Current Filtered Contacts
  const handleExportCsv = () => {
    if (contactsList.length === 0) {
      showToast('No contacts to export.', 'error');
      return;
    }

    const headers = ['User ID', 'Name', 'Phone', 'Email', 'Tag', 'Segment', 'Status', 'WhatsApp Opted', 'Deal Value', 'Created At'];
    const rows = contactsList.map((c) => [
      c.userId,
      `"${c.name}"`,
      c.phone,
      c.email,
      c.tag,
      `"${c.segment}"`,
      c.status,
      c.whatsappOpted ? 'true' : 'false',
      c.value,
      new Date(c.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `arco_contacts_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${contactsList.length} contacts to CSV.`);
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedContactIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedContactIds.length} selected contacts?`)) return;

    try {
      await contactsService.bulkDelete(selectedContactIds);
      showToast(`Deleted ${selectedContactIds.length} contacts.`);
      setSelectedContactIds([]);
      loadContacts();
    } catch {
      showToast('Failed to delete contacts.', 'error');
    }
  };

  // Bulk Tag
  const handleBulkTagSubmit = async () => {
    if (selectedContactIds.length === 0 || !bulkTagValue) return;

    try {
      await contactsService.bulkTag(selectedContactIds, bulkTagValue);
      showToast(`Assigned tag "${bulkTagValue}" to ${selectedContactIds.length} contacts.`);
      setBulkTagModalOpen(false);
      setSelectedContactIds([]);
      loadContacts();
    } catch {
      showToast('Failed to assign tags.', 'error');
    }
  };

  // Select all toggle
  const toggleSelectAll = () => {
    if (selectedContactIds.length === contactsList.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(contactsList.map((c) => c.id));
    }
  };

  const toggleSelectContact = (id) => {
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter((i) => i !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800">
      
      {/* 0. SIDEBAR NAVIGATION */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-14 min-w-0 flex flex-col bg-slate-50/50 min-h-screen">
        
        {/* 1. TOP HEADER */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
          <div className="px-4 sm:px-8 h-16 sm:h-18 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CRM & Audience Hub</div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Contacts</h1>
              </div>
            </div>

            {/* Right Profile & Actions */}
            <div className="flex items-center gap-3">
              <Link
                to="/campaigns"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>Campaigns Hub</span>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{userName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-slate-100 font-semibold text-slate-900 truncate">
                      {userName}
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    >
                      Dashboard Home
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

          </div>
        </header>

        {/* 2. MAIN WORKSPACE */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-5 flex-1 flex flex-col">
          
          {/* Header Row: Contact Hub Title & Create Contacts Button (Matching Interakt) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#0d3b30] flex items-center justify-center text-white shrink-0 shadow-2xs">
                <BookOpen className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Contact Hub</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Seamlessly manage all your Contacts in one place for Sales, Support and Beyond.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setCreateMode('manual');
                setCreateContactModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              <span>Create Contacts</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* CONTACTS TOOLBAR (Matching Interakt Screenshot Layout & Exact Proportions) */}
          {/* 1. Search | 2. Select Segment | 3. Select Tag | 4. Send Campaign | 5. More Actions | 6. Modify Columns */}
          {/* ========================================================================= */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            
            {/* Left Controls Group */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* 1. Search */}
              <div className="relative w-60 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name or number"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 w-full pl-8 pr-7 text-xs rounded-lg border border-slate-300 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium shadow-2xs transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 2. Select Segment */}
              <SelectSegmentDropdown
                savedSegments={savedSegments}
                selectedSegmentId={selectedSavedSegment}
                onSelectSegment={handleSelectSegment}
                onOpenSaveSegmentModal={() => setSaveSegmentModalOpen(true)}
              />

              {/* 3. Select Tag */}
              <TagFilterDropdown
                selectedTag={selectedTag}
                onSelectTag={(tag) => {
                  setSelectedTag(tag);
                  setPage(1);
                }}
              />

              {/* 4. Send Campaign */}
              <button
                type="button"
                onClick={() => {
                  navigate('/campaigns');
                }}
                className="h-9 inline-flex items-center gap-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <Megaphone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Send Campaign</span>
              </button>

              {/* 5. More Actions */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoreActionsOpen(!moreActionsOpen)}
                  className="h-9 inline-flex items-center justify-between gap-1.5 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <span>More Actions</span>
                  <ChevronDown
                    className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-150 ${
                      moreActionsOpen ? 'rotate-180 text-slate-600' : ''
                    }`}
                  />
                </button>

                {moreActionsOpen && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => {
                        setMoreActionsOpen(false);
                        handleExportCsv();
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium cursor-pointer transition-colors"
                    >
                      <Download className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>Export Contacts</span>
                    </button>
                    <button
                      onClick={() => {
                        setMoreActionsOpen(false);
                        if (selectedContactIds.length === 0) {
                          showToast('Please select at least one contact to delete.', 'info');
                          return;
                        }
                        setDeleteConfirmModalOpen(true);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>Delete Contacts</span>
                    </button>
                    <button
                      onClick={() => {
                        setMoreActionsOpen(false);
                        if (selectedContactIds.length === 0) {
                          showToast('Please select at least one contact to add tags.', 'info');
                          return;
                        }
                        setSelectedBulkTags([]);
                        setBulkTagModalOpen(true);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium cursor-pointer transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>Add Tags</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Right Side: 6. Modify Columns */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setModifyColumnsOpen(!modifyColumnsOpen)}
                className="h-9 inline-flex items-center justify-between gap-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <div className="flex items-center gap-1.5">
                  <Columns3 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Modify Columns</span>
                </div>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-150 ${
                    modifyColumnsOpen ? 'rotate-180 text-slate-600' : ''
                  }`}
                />
              </button>

              {modifyColumnsOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-40 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-100">
                  <span className="font-extrabold text-slate-900 block pb-1 border-b border-slate-100">
                    Table Columns
                  </span>
                  {Object.entries(visibleColumns).map(([colKey, isVisible]) => (
                    <label key={colKey} className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium capitalize">
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => setVisibleColumns((prev) => ({ ...prev, [colKey]: !prev[colKey] }))}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span>{colKey === 'userId' ? 'User ID' : colKey === 'whatsappOpted' ? 'WhatsApp Opted' : colKey}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

          </div>

            {/* Active Filters / Applied Conditions Chip Bar */}
            {(activeCustomConditions.length > 0 || selectedSavedSegment !== 'all' || selectedTag !== 'all' || selectedOpted !== 'all' || selectedStatus !== 'all' || searchQuery) && (
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-red-50/60 border border-red-200/80 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-red-700">Active Filter:</span>
                  {selectedSavedSegment !== 'all' && (
                    <span className="bg-white text-red-800 font-bold px-2 py-0.5 rounded-lg border border-red-200">
                      Segment: {savedSegments.find((s) => s.id === selectedSavedSegment)?.name || selectedSavedSegment}
                    </span>
                  )}
                  {activeCustomConditions.length > 0 && (
                    <span className="bg-white text-red-800 font-bold px-2 py-0.5 rounded-lg border border-red-200">
                      Custom ({activeCustomConditions.length} conditions via {activeLogic})
                    </span>
                  )}
                  {selectedTag !== 'all' && (
                    <span className="bg-white text-slate-700 font-medium px-2 py-0.5 rounded-lg border border-slate-200">
                      Tag: {selectedTag}
                    </span>
                  )}
                  {selectedOpted !== 'all' && (
                    <span className="bg-white text-emerald-700 font-bold px-2 py-0.5 rounded-lg border border-emerald-200">
                      {selectedOpted === 'true' ? 'WhatsApp Opted' : 'Not Opted'}
                    </span>
                  )}
                  {selectedStatus !== 'all' && (
                    <span className="bg-white text-slate-700 font-medium px-2 py-0.5 rounded-lg border border-slate-200">
                      Status: {selectedStatus}
                    </span>
                  )}
                  {searchQuery && (
                    <span className="bg-white text-slate-700 font-medium px-2 py-0.5 rounded-lg border border-slate-200">
                      Query: "{searchQuery}"
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-red-700 hover:text-red-900 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            )}

          {/* 3. CONTACTS TABLE (Server-Side Paginated) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={contactsList.length > 0 && selectedContactIds.length === contactsList.length}
                        onChange={toggleSelectAll}
                        className="rounded text-red-600 focus:ring-red-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4">Contact Name</th>
                    {visibleColumns.phone && <th className="py-3.5 px-4">Phone Number</th>}
                    {visibleColumns.opted && <th className="py-3.5 px-4">WhatsApp Opt-in</th>}
                    {visibleColumns.email && <th className="py-3.5 px-4">Email Address</th>}
                    {visibleColumns.segment && <th className="py-3.5 px-4">Segment</th>}
                    {visibleColumns.tag && <th className="py-3.5 px-4">Tag</th>}
                    {visibleColumns.status && <th className="py-3.5 px-4">Status</th>}
                    {visibleColumns.value && <th className="py-3.5 px-4">Deal Value</th>}
                    {visibleColumns.createdAt && <th className="py-3.5 px-4">Created Date</th>}
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contactsList.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-16 text-center text-slate-400 font-medium">
                        <div className="max-w-xs mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                            <Users className="w-6 h-6" />
                          </div>
                          <p className="font-extrabold text-base text-slate-800">No Contacts Matching Filter</p>
                          <p className="text-xs text-slate-400">
                            Try adjusting your segment conditions or clear active filters.
                          </p>
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer shadow-sm"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Reset Filters</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    contactsList.map((c) => {
                      const isSelected = selectedContactIds.includes(c.id);
                      return (
                        <tr
                          key={c.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isSelected ? 'bg-red-50/30' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectContact(c.id)}
                              className="rounded text-red-600 focus:ring-red-500 cursor-pointer"
                            />
                          </td>

                          {/* Contact Name & User ID */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{c.name}</div>
                            {visibleColumns.userId && (
                              <div className="text-[10px] font-mono text-slate-400">{c.userId}</div>
                            )}
                          </td>

                          {/* Phone Number */}
                          {visibleColumns.phone && (
                            <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                              {c.phone}
                            </td>
                          )}

                          {/* WhatsApp Opt-in Badge */}
                          {visibleColumns.opted && (
                            <td className="py-3.5 px-4">
                              {c.whatsappOpted ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <WhatsAppIcon className="w-3 h-3 text-emerald-600" />
                                  <span>Opted In</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500">
                                  <span>Not Opted</span>
                                </span>
                              )}
                            </td>
                          )}

                          {/* Email */}
                          {visibleColumns.email && (
                            <td className="py-3.5 px-4 text-slate-600 truncate max-w-[180px]">
                              {c.email || '—'}
                            </td>
                          )}

                          {/* Segment */}
                          {visibleColumns.segment && (
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                                {c.segment}
                              </span>
                            </td>
                          )}

                          {/* Tag */}
                          {visibleColumns.tag && (
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-red-700 bg-red-50 border border-red-200/60 px-2 py-0.5 rounded-md text-[10px]">
                                {c.tag}
                              </span>
                            </td>
                          )}

                          {/* Status */}
                          {visibleColumns.status && (
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                                {c.status}
                              </span>
                            </td>
                          )}

                          {/* Deal Value */}
                          {visibleColumns.value && (
                            <td className="py-3.5 px-4 font-extrabold text-slate-900">
                              {c.value > 0 ? `₹${c.value.toLocaleString()}` : '—'}
                            </td>
                          )}

                          {/* Created Date */}
                          {visibleColumns.createdAt && (
                            <td className="py-3.5 px-4 text-slate-500 font-medium text-[11px]">
                              {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                            </td>
                          )}

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right space-x-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete contact "${c.name}"?`)) {
                                  contactsService.deleteContact(c.id).then(() => {
                                    showToast(`Contact "${c.name}" deleted.`);
                                    loadContacts();
                                  });
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                              title="Delete Contact"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 font-medium">
                Showing {contactsList.length} of {totalContacts.toLocaleString()} contacts (Page {page} of {totalPages})
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* ========================================================================= */}
      {/* 4. SAVE SEGMENT MODAL (Custom Interakt-style Component)                   */}
      {/* ========================================================================= */}
      <SaveSegmentModal
        isOpen={saveSegmentModalOpen}
        onClose={() => setSaveSegmentModalOpen(false)}
        onApplyWithoutSaving={handleApplyFilterWithoutSaving}
        onSaveSegment={handleSaveSegmentSubmit}
        liveMatchingCount={modalAudienceCount ?? totalContacts}
        isSaving={isSavingSegment}
      />

      {/* 5. CREATE CONTACTS MODAL (Manual & Bulk CSV Upload) */}
      {createContactModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Create Contacts</h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateContactModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setCreateMode('manual')}
                className={`text-xs font-bold pb-2 transition-colors cursor-pointer ${
                  createMode === 'manual'
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Manual Entry
              </button>
              <button
                type="button"
                onClick={() => setCreateMode('csv')}
                className={`text-xs font-bold pb-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  createMode === 'csv'
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Bulk CSV Upload</span>
              </button>
            </div>

            {/* TAB 1: MANUAL FORM */}
            {createMode === 'manual' && (
              <form onSubmit={handleCreateContact} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Country</label>
                    <select
                      value={newContactCountryCode}
                      onChange={(e) => setNewContactCountryCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                    >
                      <option value="+91">🇮🇳 +91 (IN)</option>
                      <option value="+1">🇺🇸 +1 (US)</option>
                      <option value="+44">🇬🇧 +44 (UK)</option>
                      <option value="+971">🇦🇪 +971 (UAE)</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">User ID</label>
                    <input
                      type="text"
                      placeholder="e.g. USR_104"
                      value={newContactUserId}
                      onChange={(e) => setNewContactUserId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="ramesh@example.com"
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tag</label>
                    <select
                      value={newContactTag}
                      onChange={(e) => setNewContactTag(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                    >
                      <option value="Lead">Lead</option>
                      <option value="VIP">VIP</option>
                      <option value="Enterprise">Enterprise</option>
                      <option value="Support">Support</option>
                      <option value="D2C Customer">D2C Customer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Segment</label>
                    <select
                      value={newContactSegment}
                      onChange={(e) => setNewContactSegment(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                    >
                      <option value="High Intent">High Intent</option>
                      <option value="VIP Customers">VIP Customers</option>
                      <option value="Cart Abandoners">Cart Abandoners</option>
                      <option value="New Visitors">New Visitors</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Deal Value (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newContactValue}
                      onChange={(e) => setNewContactValue(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>
                </div>

                {/* WhatsApp Opt-in Checkbox */}
                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newContactOpted}
                    onChange={(e) => setNewContactOpted(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-emerald-900 block">WhatsApp Opt-in Confirmed</span>
                    <span className="text-[10px] text-emerald-700">Contact has given consent to receive WhatsApp marketing broadcasts.</span>
                  </div>
                </label>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCreateContactModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Save Contact
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: BULK CSV UPLOAD */}
            {createMode === 'csv' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <h5 className="font-bold text-slate-900">Download CSV Template</h5>
                    <p className="text-[11px] text-slate-500">Includes standard headers: Name, Phone, Email, Tag, Segment, Opted.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadSampleCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Template</span>
                  </button>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-3xl border-2 border-dashed border-slate-300 hover:border-red-500 bg-slate-50/50 hover:bg-red-50/20 text-center cursor-pointer transition-all space-y-2"
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-800 text-xs">
                    {csvFile ? csvFile.name : 'Click or Drag & Drop contacts CSV file here'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Supports .csv files up to 50,000 rows. Duplicate phone numbers are automatically detected.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    onChange={handleCsvFileSelected}
                    className="hidden"
                  />
                </div>

                {csvPreviewRows.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Preview ({csvPreviewRows.length} rows loaded)</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Ready for Import
                      </span>
                    </div>

                    <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0">
                          <tr>
                            <th className="p-2">Name</th>
                            <th className="p-2">Phone</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Tag</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {csvPreviewRows.slice(0, 5).map((r, idx) => (
                            <tr key={idx}>
                              <td className="p-2 font-medium">{r.Name || r.name}</td>
                              <td className="p-2 font-mono">{r.Phone || r.phone}</td>
                              <td className="p-2 text-slate-500">{r.Email || r.email || '—'}</td>
                              <td className="p-2">{r.Tag || r.tag || 'Lead'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {csvImportResult && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                    <p className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Bulk Import Complete</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                      <div className="p-2 bg-white rounded-lg text-center">
                        <span className="text-slate-500 block">Total</span>
                        <strong className="text-slate-900">{csvImportResult.totalRows}</strong>
                      </div>
                      <div className="p-2 bg-white rounded-lg text-center">
                        <span className="text-emerald-600 block">Imported</span>
                        <strong className="text-emerald-700">{csvImportResult.importedCount}</strong>
                      </div>
                      <div className="p-2 bg-white rounded-lg text-center">
                        <span className="text-amber-600 block">Duplicates</span>
                        <strong className="text-amber-700">{csvImportResult.duplicateCount}</strong>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCreateContactModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    disabled={csvValidating || csvPreviewRows.length === 0}
                    onClick={handleUploadCsv}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {csvValidating ? 'Importing...' : `Import ${csvPreviewRows.length} Contacts`}
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* 6. DELETE CONTACTS CONFIRMATION MODAL (Matching Interakt) */}
      {deleteConfirmModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                <span>Delete Contacts</span>
              </h3>
              <button
                onClick={() => setDeleteConfirmModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 font-medium text-xs leading-relaxed">
              Are you sure you want to delete the selected contacts? This action cannot be undone.
            </p>

            <div className="p-3 bg-red-50 rounded-2xl border border-red-100 text-red-800 text-xs font-semibold flex items-center justify-between">
              <span>Contacts selected for deletion:</span>
              <span className="font-extrabold bg-white px-2.5 py-0.5 rounded-lg border border-red-200 text-red-700 shadow-2xs">
                {selectedContactIds.length} contact{selectedContactIds.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingBulk}
                onClick={async () => {
                  try {
                    setIsDeletingBulk(true);
                    await contactsService.bulkDelete(selectedContactIds);
                    showToast(`Deleted ${selectedContactIds.length} contacts.`);
                    setSelectedContactIds([]);
                    setDeleteConfirmModalOpen(false);
                    loadContacts();
                  } catch {
                    showToast('Failed to delete contacts.', 'error');
                  } finally {
                    setIsDeletingBulk(false);
                  }
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeletingBulk ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. ADD TAGS MODAL (Matching Interakt) */}
      {bulkTagModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Add Tags</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Apply tags to {selectedContactIds.length} selected contact{selectedContactIds.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setBulkTagModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                Select Tags to Apply
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1.5 border border-slate-200 rounded-2xl bg-slate-50/50">
                {BULK_TAG_OPTIONS.map((tag) => {
                  const isSelected = selectedBulkTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedBulkTags(selectedBulkTags.filter((t) => t !== tag));
                        } else {
                          setSelectedBulkTags([...selectedBulkTags, tag]);
                        }
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-left font-semibold text-xs border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-red-50 border-red-300 text-red-700 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{tag}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-red-600 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">
                {selectedBulkTags.length} tag{selectedBulkTags.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBulkTagModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isApplyingBulkTags || selectedBulkTags.length === 0}
                  onClick={async () => {
                    try {
                      setIsApplyingBulkTags(true);
                      await contactsService.bulkTag(selectedContactIds, selectedBulkTags);
                      showToast(`Applied ${selectedBulkTags.length} tag(s) to ${selectedContactIds.length} contact(s).`);
                      setBulkTagModalOpen(false);
                      setSelectedBulkTags([]);
                      setSelectedContactIds([]);
                      loadContacts();
                    } catch {
                      showToast('Failed to apply tags.', 'error');
                    } finally {
                      setIsApplyingBulkTags(false);
                    }
                  }}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isApplyingBulkTags ? 'Applying...' : 'Apply Tags'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
              toast.type === 'error'
                ? 'bg-red-900 text-white border-red-700 shadow-red-900/30'
                : 'bg-slate-900 text-white border-slate-800 shadow-slate-900/30'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
