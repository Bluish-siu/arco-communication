import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Calendar,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  User,
  Clock,
  Sparkles,
  ChevronDown,
  Layers,
  ChevronRight,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  Tag as TagIcon,
  Phone,
  Mail,
  Search,
  SlidersHorizontal,
  X,
  Check,
  Percent,
  TrendingDown,
  Kanban,
  LogOut,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { crmService } from '../services/crmService';

// Available Date Range Presets
const DATE_RANGES = [
  'Today',
  'Yesterday',
  'Last 7 Days',
  'Last 14 Days',
  'Last 30 Days',
  'This Month',
  'Last Month',
  'Last 90 Days',
  'Custom Range',
];

// Available Pipeline Stages (7 Interakt Stages)
const STAGES_LIST = [
  'All Stages',
  'New Lead',
  'Qualification',
  'Needs Analysis',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
];

// Available Account Owners
const OWNERS_LIST = ['All Users', 'Shraddha', 'Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram'];

// Available Sources
const SOURCES_LIST = ['All Sources', 'WhatsApp', 'Website', 'Meta Ads', 'Manual', 'Referral'];

// Available 10 Interakt Tags
const TAGS_LIST = [
  'All Tags',
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

export default function SalesCrmReports() {
  const { user, businessSetup, logout } = useOnboarding();
  const userName = businessSetup?.companyName || user?.name || 'Business Owner';

  // Navigation profile dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);

  // Active Report Tab: 'agents' (Agent Performance) or 'funnel' (Sales Funnel)
  const [activeReportTab, setActiveReportTab] = useState('agents');

  // Filters State
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('All Users');
  const [ownerDropdownOpen, setOwnerDropdownOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState('All Stages');
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState('All Tags');
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState('All Sources');
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [whatsappOptedOnly, setWhatsappOptedOnly] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // Data State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [reportsData, setReportsData] = useState({
    kpis: {
      totalLeads: 0,
      openLeads: 0,
      wonLeads: 0,
      lostLeads: 0,
      conversionRate: '0%',
      totalDealValue: 0,
      wonDealValue: 0,
      openDealValue: 0,
      lostDealValue: 0,
      leadsGrowthPct: '+12.4',
      wonGrowthPct: '+15.2',
    },
    salesFunnel: [],
    agentPerformance: [],
    leadsOverTime: [],
    sourceBreakdown: [],
    tagBreakdown: [],
    recentActivity: [],
    detailedContacts: [],
  });

  // Table Search & Sort States
  const [agentSearch, setAgentSearch] = useState('');
  const [agentSortKey, setAgentSortKey] = useState('wonRevenue');
  const [agentSortOrder, setAgentSortOrder] = useState('desc');

  // Toast Notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside() {
      setDateDropdownOpen(false);
      setOwnerDropdownOpen(false);
      setStageDropdownOpen(false);
      setTagDropdownOpen(false);
      setSourceDropdownOpen(false);
      setDownloadDropdownOpen(false);
      setProfileDropdownOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch Report Data from Backend
  const fetchReports = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    setError(null);

    try {
      const params = {
        dateRange,
        startDate: dateRange === 'Custom Range' ? customStartDate : undefined,
        endDate: dateRange === 'Custom Range' ? customEndDate : undefined,
        owner: selectedOwner !== 'All Users' ? selectedOwner : undefined,
        stage: selectedStage !== 'All Stages' ? selectedStage : undefined,
        tag: selectedTag !== 'All Tags' ? selectedTag : undefined,
        source: selectedSource !== 'All Sources' ? selectedSource : undefined,
        whatsapp_opted: whatsappOptedOnly ? 'true' : undefined,
      };

      const data = await crmService.getReports(params);
      if (data) {
        setReportsData(data);
      }
    } catch (err) {
      console.error('Failed to load CRM reports:', err);
      setError('Unable to load Sales CRM Reports');
    } finally {
      setLoading(false);
      if (showSpinner) setRefreshing(false);
    }
  };

  // Initial Load and Filter Changes
  useEffect(() => {
    fetchReports();
  }, [dateRange, selectedOwner, selectedStage, selectedTag, selectedSource, whatsappOptedOnly]);

  // Format Currency
  const formatCurrency = (val) => {
    const num = parseFloat(val || 0);
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Relative Time Helper
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now - d) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  // Sorted and Filtered Agents
  const filteredAgents = useMemo(() => {
    let list = (reportsData.agentPerformance || []).filter((a) =>
      a.agent.toLowerCase().includes(agentSearch.toLowerCase())
    );

    list.sort((a, b) => {
      let valA = a[agentSortKey];
      let valB = b[agentSortKey];
      if (typeof valA === 'string' && valA.includes('%')) {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }
      if (agentSortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      }
      return valA < valB ? 1 : -1;
    });

    return list;
  }, [reportsData.agentPerformance, agentSearch, agentSortKey, agentSortOrder]);

  const handleSortAgent = (key) => {
    if (agentSortKey === key) {
      setAgentSortOrder(agentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setAgentSortKey(key);
      setAgentSortOrder('desc');
    }
  };

  // Export Summary Report CSV
  const handleExportSummaryCSV = () => {
    const { kpis, salesFunnel, agentPerformance } = reportsData;
    let csvContent = 'data:text/csv;charset=utf-8,';

    // 1. Report Metadata & KPIs
    csvContent += 'ARCO SALES CRM - SUMMARY REPORT\r\n';
    csvContent += `Generated At,${new Date().toLocaleString('en-IN')}\r\n`;
    csvContent += `Date Range,${dateRange}\r\n`;
    csvContent += `Filtered Account Owner,${selectedOwner}\r\n`;
    csvContent += `Filtered Stage,${selectedStage}\r\n\r\n`;

    csvContent += 'KEY PERFORMANCE INDICATORS\r\n';
    csvContent += `Total Leads,${kpis.totalLeads}\r\n`;
    csvContent += `Open Leads,${kpis.openLeads}\r\n`;
    csvContent += `Closed Won,${kpis.wonLeads}\r\n`;
    csvContent += `Closed Lost,${kpis.lostLeads}\r\n`;
    csvContent += `Conversion Rate,${kpis.conversionRate}\r\n`;
    csvContent += `Total Deal Value,₹${kpis.totalDealValue}\r\n`;
    csvContent += `Won Revenue,₹${kpis.wonDealValue}\r\n\r\n`;

    // 2. Sales Funnel Breakdown
    csvContent += 'SALES FUNNEL BY STAGE\r\n';
    csvContent += 'Stage Name,Contacts,Percentage (%),Deal Value (INR),Progression (%)\r\n';
    salesFunnel.forEach((s) => {
      csvContent += `"${s.stageName}",${s.count},${s.percentage}%,₹${s.dealValue},${s.convFromPrev}\r\n`;
    });
    csvContent += '\r\n';

    // 3. Agent Performance
    csvContent += 'AGENT PERFORMANCE BREAKDOWN\r\n';
    csvContent += 'Agent,Total Leads,Open Leads,Closed Won,Closed Lost,Won Revenue (INR),Conversion (%)\r\n';
    agentPerformance.forEach((a) => {
      csvContent += `"${a.agent}",${a.totalLeads},${a.openLeads},${a.wonLeads},${a.lostLeads},₹${a.wonRevenue},${a.conversionRate}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ARCO_CRM_Summary_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Summary CSV report downloaded successfully');
    setDownloadDropdownOpen(false);
  };

  // Export Detailed Report CSV
  const handleExportDetailedCSV = () => {
    const { detailedContacts } = reportsData;
    let csvContent = 'data:text/csv;charset=utf-8,';

    csvContent += 'Contact ID,Name,Phone,Email,Pipeline Stage,Account Owner,Deal Value (INR),Tag,Channel,WhatsApp Opted,Created At\r\n';
    (detailedContacts || []).forEach((c) => {
      csvContent += `"${c.id}","${c.name}","${c.phone}","${c.email}","${c.status}","${c.owner}",${c.value},"${c.tag}","${c.channel}",${c.whatsappOpted},"${c.createdAt}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ARCO_CRM_Detailed_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Detailed CSV report downloaded successfully');
    setDownloadDropdownOpen(false);
  };

  const { kpis, salesFunnel, leadsOverTime, sourceBreakdown, tagBreakdown, recentActivity } = reportsData;

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
              <span className="text-slate-900 font-bold">Sales CRM Reports</span>
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

          {/* 2. MAIN REPORT CONTENT */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 flex flex-col min-w-0">
            
            {/* PAGE HEADER: Circular ARCO Dark-Green Icon + Title + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#0d3b30] flex items-center justify-center text-white shrink-0 shadow-2xs">
                  <BarChart3 className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Sales CRM Reports</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Track your sales performance, pipeline activity and customer conversion metrics.
                  </p>
                </div>
              </div>

              {/* Action Buttons: [ Refresh ] and [ Download Report ▼ ] */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => fetchReports(true)}
                  disabled={refreshing}
                  className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  title="Refresh latest CRM analytics"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                {/* Download Report Dropdown */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setDownloadDropdownOpen(!downloadDropdownOpen)}
                    className="h-9 inline-flex items-center gap-1.5 px-4 rounded-lg bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Download Report</span>
                    <ChevronDown className="w-3 h-3 text-emerald-300 ml-0.5" />
                  </button>

                  {downloadDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                      <button
                        onClick={handleExportSummaryCSV}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">Summary Report</div>
                          <div className="text-[10px] text-slate-400">KPIs, Funnel & Agent metrics (CSV)</div>
                        </div>
                      </button>
                      <button
                        onClick={handleExportDetailedCSV}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-slate-700 hover:bg-slate-50 font-medium cursor-pointer border-t border-slate-100"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">Detailed Report</div>
                          <div className="text-[10px] text-slate-400">Full filtered contact records (CSV)</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 3. REPORT TYPE SELECTOR TABS + CONTROLS TOOLBAR                            */}
            {/* ========================================================================= */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
              
              {/* Tab Selector: [ Agent Performance ] [ Sales Funnel ] */}
              <div className="inline-flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 self-start">
                <button
                  type="button"
                  onClick={() => setActiveReportTab('agents')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeReportTab === 'agents'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Agent Performance
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReportTab('funnel')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeReportTab === 'funnel'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sales Funnel
                </button>
              </div>

              {/* Filters & Date Range Controls */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* 1. Date Range Dropdown: [ Date Range ▼ ] */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      setDateDropdownOpen(!dateDropdownOpen);
                      setOwnerDropdownOpen(false);
                      setStageDropdownOpen(false);
                      setTagDropdownOpen(false);
                      setSourceDropdownOpen(false);
                    }}
                    className="h-8.5 inline-flex items-center justify-between gap-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{dateRange}</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {dateDropdownOpen && (
                    <div className="absolute left-0 lg:right-0 lg:left-auto mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                      {DATE_RANGES.map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() => {
                            setDateRange(range);
                            setDateDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                            dateRange === range ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{range}</span>
                          {dateRange === range && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Date Range Inputs */}
                {dateRange === 'Custom Range' && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="h-8.5 px-2.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                    />
                    <span className="text-slate-400 text-xs">to</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="h-8.5 px-2.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => fetchReports()}
                      className="h-8.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-2xs cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {/* 2. Account Owner Filter */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      setOwnerDropdownOpen(!ownerDropdownOpen);
                      setDateDropdownOpen(false);
                      setStageDropdownOpen(false);
                      setTagDropdownOpen(false);
                      setSourceDropdownOpen(false);
                    }}
                    className="h-8.5 inline-flex items-center justify-between gap-1.5 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{selectedOwner}</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {ownerDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-40 text-xs">
                      {OWNERS_LIST.map((owner) => (
                        <button
                          key={owner}
                          type="button"
                          onClick={() => {
                            setSelectedOwner(owner);
                            setOwnerDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                            selectedOwner === owner ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">{owner}</span>
                          {selectedOwner === owner && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Pipeline Stage Filter */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      setStageDropdownOpen(!stageDropdownOpen);
                      setDateDropdownOpen(false);
                      setOwnerDropdownOpen(false);
                      setTagDropdownOpen(false);
                      setSourceDropdownOpen(false);
                    }}
                    className="h-8.5 inline-flex items-center justify-between gap-1.5 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                      <Kanban className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{selectedStage}</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {stageDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-40 text-xs">
                      {STAGES_LIST.map((stage) => (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => {
                            setSelectedStage(stage);
                            setStageDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                            selectedStage === stage ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">{stage}</span>
                          {selectedStage === stage && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Tags Filter */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      setTagDropdownOpen(!tagDropdownOpen);
                      setDateDropdownOpen(false);
                      setOwnerDropdownOpen(false);
                      setStageDropdownOpen(false);
                      setSourceDropdownOpen(false);
                    }}
                    className="h-8.5 inline-flex items-center justify-between gap-1.5 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                      <TagIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{selectedTag}</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {tagDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-40 text-xs max-h-60 overflow-y-auto">
                      {TAGS_LIST.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setSelectedTag(tag);
                            setTagDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                            selectedTag === tag ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">{tag}</span>
                          {selectedTag === tag && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clear Filter Reset Button */}
                {(selectedOwner !== 'All Users' || selectedStage !== 'All Stages' || selectedTag !== 'All Tags' || dateRange !== 'Last 30 Days' || whatsappOptedOnly) && (
                  <button
                    onClick={() => {
                      setSelectedOwner('All Users');
                      setSelectedStage('All Stages');
                      setSelectedTag('All Tags');
                      setSelectedSource('All Sources');
                      setDateRange('Last 30 Days');
                      setWhatsappOptedOnly(false);
                      showToast('Reset all report filters');
                    }}
                    className="h-8.5 px-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Reset to default filters"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 4. SUMMARY KPI CARDS (Real-time Calculations & Trends)                    */}
            {/* ========================================================================= */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs animate-pulse space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                    <div className="h-7 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-red-200 shadow-2xs space-y-3">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                <h3 className="font-extrabold text-slate-900">{error}</h3>
                <button
                  onClick={() => fetchReports(true)}
                  className="px-4 py-1.5 bg-red-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                
                {/* 1. Total Leads */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Leads</span>
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="mt-2">
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {kpis.totalLeads.toLocaleString('en-IN')}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>{kpis.leadsGrowthPct}% vs prev period</span>
                    </div>
                  </div>
                </div>

                {/* 2. Open Leads */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Open Leads</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="mt-2">
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {kpis.openLeads.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-1">
                      In active pipeline
                    </div>
                  </div>
                </div>

                {/* 3. Won Deals */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Closed Won</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="mt-2">
                    <div className="text-xl sm:text-2xl font-extrabold text-emerald-700">
                      {kpis.wonLeads.toLocaleString('en-IN')}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>{kpis.wonGrowthPct}% won growth</span>
                    </div>
                  </div>
                </div>

                {/* 4. Lost Deals */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Closed Lost</span>
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="mt-2">
                    <div className="text-xl sm:text-2xl font-extrabold text-rose-600">
                      {kpis.lostLeads.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-1">
                      Opportunities lost
                    </div>
                  </div>
                </div>

                {/* 5. Conversion Rate */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Conversion</span>
                    <Percent className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="mt-2">
                    <div className="text-xl sm:text-2xl font-extrabold text-purple-700">
                      {kpis.conversionRate}
                    </div>
                    <div className="text-[10px] text-purple-600 font-semibold mt-1">
                      Won / Total Leads
                    </div>
                  </div>
                </div>

                {/* 6. Won Revenue / Pipeline Value */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Won Revenue</span>
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="mt-2">
                    <div className="text-lg sm:text-xl font-extrabold text-emerald-700 truncate">
                      {formatCurrency(kpis.wonDealValue)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold mt-1 truncate">
                      Total: {formatCurrency(kpis.totalDealValue)}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. REPORT VIEW: TAB 1 (AGENT PERFORMANCE) OR TAB 2 (SALES FUNNEL)         */}
            {/* ========================================================================= */}
            {activeReportTab === 'agents' ? (
              
              /* TAB 1: AGENT PERFORMANCE VIEW */
              <div className="space-y-6">
                
                {/* Visual Agent Comparison Bar Chart */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">Agent Performance Overview</h3>
                      <p className="text-xs text-slate-500">Won Revenue and Closed Deals across sales account owners</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                      Top Performer: {filteredAgents[0]?.agent || 'Shraddha'}
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    {filteredAgents.map((a) => {
                      const maxRevenue = Math.max(...filteredAgents.map((x) => x.wonRevenue || 1), 1);
                      const barWidth = Math.max(Math.round((a.wonRevenue / maxRevenue) * 100), 8);

                      return (
                        <div key={a.agent} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-[#0d3b30] text-emerald-300 flex items-center justify-center text-[10px] font-extrabold">
                                {a.agent.charAt(0)}
                              </div>
                              <span className="text-slate-900">{a.agent}</span>
                              <span className="text-slate-400 font-normal">({a.totalLeads} leads • {a.wonLeads} won)</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-purple-700 font-bold">{a.conversionRate} conv.</span>
                              <span className="text-emerald-700 font-extrabold">{formatCurrency(a.wonRevenue)}</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                            <div
                              style={{ width: `${barWidth}%` }}
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed Agent Performance Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">Agent Performance Table</h3>
                      <p className="text-xs text-slate-500">Detailed breakdown by sales team member</p>
                    </div>

                    {/* Search Agent */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search agent name..."
                        value={agentSearch}
                        onChange={(e) => setAgentSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-4">Sales Agent</th>
                          <th onClick={() => handleSortAgent('totalLeads')} className="py-3 px-4 text-right cursor-pointer hover:text-slate-800">
                            Total Leads ↕
                          </th>
                          <th onClick={() => handleSortAgent('openLeads')} className="py-3 px-4 text-right cursor-pointer hover:text-slate-800">
                            Open Leads ↕
                          </th>
                          <th onClick={() => handleSortAgent('wonLeads')} className="py-3 px-4 text-right cursor-pointer hover:text-slate-800">
                            Closed Won ↕
                          </th>
                          <th onClick={() => handleSortAgent('lostLeads')} className="py-3 px-4 text-right cursor-pointer hover:text-slate-800">
                            Closed Lost ↕
                          </th>
                          <th onClick={() => handleSortAgent('wonRevenue')} className="py-3 px-4 text-right cursor-pointer hover:text-slate-800">
                            Won Revenue (₹) ↕
                          </th>
                          <th onClick={() => handleSortAgent('conversionRate')} className="py-3 px-4 text-right cursor-pointer hover:text-slate-800">
                            Conversion Rate ↕
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filteredAgents.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                              No agent performance data found.
                            </td>
                          </tr>
                        ) : (
                          filteredAgents.map((a) => (
                            <tr key={a.agent} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3 px-4 flex items-center gap-2.5 font-bold text-slate-900">
                                <div className="w-6 h-6 rounded-full bg-[#0d3b30] text-emerald-300 flex items-center justify-center text-[10px] font-extrabold shadow-2xs">
                                  {a.agent.charAt(0)}
                                </div>
                                <span>{a.agent}</span>
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-slate-800">{a.totalLeads}</td>
                              <td className="py-3 px-4 text-right text-slate-600">{a.openLeads}</td>
                              <td className="py-3 px-4 text-right font-bold text-emerald-700 bg-emerald-50/40">{a.wonLeads}</td>
                              <td className="py-3 px-4 text-right text-rose-600">{a.lostLeads}</td>
                              <td className="py-3 px-4 text-right font-extrabold text-emerald-700">{formatCurrency(a.wonRevenue)}</td>
                              <td className="py-3 px-4 text-right">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                                  {a.conversionRate}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            ) : (
              
              /* TAB 2: SALES FUNNEL VIEW */
              <div className="space-y-6">
                
                {/* Visual Sales Funnel Progression */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Pipeline Sales Funnel</h3>
                    <p className="text-xs text-slate-500">Contact volume and conversion progression across the 7 CRM stages</p>
                  </div>

                  {/* Funnel Horizontal Progression Bars */}
                  <div className="space-y-3.5 pt-2">
                    {salesFunnel.map((s, idx) => {
                      const maxStageCount = Math.max(...salesFunnel.map((x) => x.count || 1), 1);
                      const barWidth = Math.max(Math.round((s.count / maxStageCount) * 100), 6);

                      return (
                        <div key={s.stageName} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                              <span className="text-slate-900">{s.stageName}</span>
                              <span className="text-slate-400 font-normal">({s.count} contacts)</span>
                            </div>
                            <div className="flex items-center gap-3">
                              {idx > 0 && (
                                <span className="text-slate-400 font-medium text-[11px]">
                                  {s.convFromPrev} from prev stage
                                </span>
                              )}
                              <span className="text-slate-600 font-semibold">{s.percentage}% share</span>
                              <span className="text-slate-900 font-extrabold">{formatCurrency(s.dealValue)}</span>
                            </div>
                          </div>

                          {/* Progression Bar */}
                          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                            <div
                              style={{ width: `${barWidth}%`, backgroundColor: s.color }}
                              className="h-full rounded-full transition-all duration-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sales Funnel Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-slate-100">
                    <h3 className="font-extrabold text-sm text-slate-900">Sales Funnel Stage Table</h3>
                    <p className="text-xs text-slate-500">Stage-by-stage distribution and deal value calculations</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-4">Stage Name</th>
                          <th className="py-3 px-4 text-right">Contacts Count</th>
                          <th className="py-3 px-4 text-right">Percentage Share (%)</th>
                          <th className="py-3 px-4 text-right">Total Deal Value (₹)</th>
                          <th className="py-3 px-4 text-right">Progression Drop-off</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {salesFunnel.map((s) => (
                          <tr key={s.stageName} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 flex items-center gap-2.5 font-bold text-slate-900">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                              <span>{s.stageName}</span>
                            </td>
                            <td className="py-3 px-4 text-right font-extrabold text-slate-800">{s.count}</td>
                            <td className="py-3 px-4 text-right font-semibold text-slate-600">{s.percentage}%</td>
                            <td className="py-3 px-4 text-right font-extrabold text-slate-900">{formatCurrency(s.dealValue)}</td>
                            <td className="py-3 px-4 text-right">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">
                                {s.convFromPrev}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 6. SECONDARY ANALYTICS (Leads by Source, Tags, and Recent Activity)       */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 1. Leads by Source */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Leads by Source</h4>
                  <span className="text-[10px] text-slate-400 font-bold">{sourceBreakdown.length} channels</span>
                </div>
                <div className="space-y-2.5 pt-1">
                  {sourceBreakdown.map((s) => (
                    <div key={s.source} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-800">{s.source}</span>
                        <span className="text-slate-500 font-bold">{s.count} leads ({s.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${s.percentage}%` }}
                          className="h-full bg-[#0d3b30] rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Customer / Lead Tags Distribution */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Customer / Lead Tags</h4>
                  <span className="text-[10px] text-slate-400 font-bold">{tagBreakdown.length} active tags</span>
                </div>
                <div className="space-y-2 pt-1 max-h-56 overflow-y-auto pr-1">
                  {tagBreakdown.map((t) => (
                    <div key={t.tag} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-red-700 truncate">
                        <TagIcon className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="truncate">{t.tag}</span>
                      </div>
                      <div className="flex items-center gap-2 font-bold shrink-0 ml-2">
                        <span className="text-slate-800">{t.count} leads</span>
                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">{t.wonCount} won</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Recent Sales Activity */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Recent Sales Activity</h4>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="space-y-2.5 pt-1 max-h-56 overflow-y-auto pr-1 text-xs">
                  {recentActivity.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 font-medium">
                      No recent sales activity
                    </div>
                  ) : (
                    recentActivity.map((act) => (
                      <div key={act.id} className="p-2 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-900 truncate max-w-[140px]">{act.name}</span>
                          <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded">
                            {act.stage}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span>Assigned: {act.owner}</span>
                          <span>{formatTimeAgo(act.updatedAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>

    </div>
  );
}
