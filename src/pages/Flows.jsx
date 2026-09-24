import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Workflow,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Send,
  Eye,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  LogOut,
  Copy,
  Check,
  ExternalLink,
  FileCode,
  X,
  Layers,
  ShieldCheck,
  Info,
  Sparkles,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { flowsService } from '../services/flowsService';
import { formatDate, formatDateTime } from '../utils/dateUtils';

export default function Flows() {
  const { user, businessSetup, logout, subscription, trialDaysRemaining } = useOnboarding();
  const userName = businessSetup?.companyName || user?.name || 'Business Owner';

  // Navigation Profile Dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Flows Data State
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Tabs & Broadcasts State
  const [activeTab, setActiveTab] = useState('flows'); // 'flows' | 'broadcasts'
  const [broadcasts, setBroadcasts] = useState([]);
  const [broadcastsLoading, setBroadcastsLoading] = useState(false);
  const [broadcastSearch, setBroadcastSearch] = useState('');
  const [broadcastStatusFilter, setBroadcastStatusFilter] = useState('all');

  // Modals
  const [selectedFlow, setSelectedFlow] = useState(null); // For Details Modal
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailedFlowData, setDetailedFlowData] = useState(null);

  const [sendTestModalOpen, setSendTestModalOpen] = useState(false);
  const [sendTestTarget, setSendTestTarget] = useState(null);
  const [testPhone, setTestPhone] = useState('+91 99208 58396');
  const [testCta, setTestCta] = useState('Give Feedback');
  const [sendingTest, setSendingTest] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowCategory, setNewFlowCategory] = useState('LEAD_GENERATION');
  const [creatingFlow, setCreatingFlow] = useState(false);

  // Row dropdown menus
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Copied indicator
  const [copiedId, setCopiedId] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Close profile dropdown and row menus on outside click
  useEffect(() => {
    function handleOutsideClick(e) {
      if (!e.target.closest('.profile-container')) {
        setProfileDropdownOpen(false);
      }
      if (!e.target.closest('.row-menu-container')) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Fetch Flows from backend
  const loadFlows = async () => {
    setLoading(true);
    try {
      const data = await flowsService.getFlows({
        search: searchQuery,
        status: statusFilter,
      });
      setFlows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load flows:', err);
      showToast(err.message || 'Failed to load flows from backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlows();
  }, [statusFilter]);

  // Fetch Flow Broadcasts from backend
  const loadBroadcasts = async () => {
    setBroadcastsLoading(true);
    try {
      const data = await flowsService.getFlowBroadcasts({
        search: broadcastSearch,
        status: broadcastStatusFilter,
      });
      setBroadcasts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load broadcasts:', err);
      showToast(err.message || 'Failed to load flow broadcasts', 'error');
    } finally {
      setBroadcastsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'broadcasts') {
      loadBroadcasts();
    }
  }, [activeTab, broadcastStatusFilter]);

  // Handle Search submit or clear
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (activeTab === 'flows') {
        loadFlows();
      } else {
        loadBroadcasts();
      }
    }
  };

  // Copy helper
  const copyToClipboard = (text, id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      showToast('Meta Flow ID copied to clipboard');
    }
  };

  // Open Details Modal
  const openFlowDetails = async (flow) => {
    setSelectedFlow(flow);
    setDetailsLoading(true);
    try {
      const targetId = flow.metaFlowId || flow.id;
      const details = await flowsService.getFlow(targetId);
      setDetailedFlowData(details);
    } catch (err) {
      console.warn('Could not fetch deep flow details:', err.message);
      setDetailedFlowData(flow);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Open Send Test Modal
  const openSendTestModal = (flow) => {
    setSendTestTarget(flow);
    setSendTestModalOpen(true);
    setActiveMenuId(null);
  };

  // Execute Send Test Flow
  const handleSendTestSubmit = async (e) => {
    e.preventDefault();
    if (!testPhone.trim()) {
      showToast('Please enter a recipient phone number', 'error');
      return;
    }
    if (!sendTestTarget) return;

    setSendingTest(true);
    try {
      const payload = {
        flowId: sendTestTarget.metaFlowId || sendTestTarget.id,
        recipientPhone: testPhone.trim(),
        ctaText: testCta.trim() || 'Give Feedback',
      };

      const result = await flowsService.sendTestFlow(payload);
      const wamid = result.data?.wamid || result.wamid || 'Sent';
      showToast(`Test flow dispatched successfully! WAMID: ${wamid.substring(0, 22)}...`);
      setSendTestModalOpen(false);
    } catch (err) {
      console.error('Send test failed:', err);
      showToast(err.message || 'Failed to dispatch test Flow', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  // Execute Create Flow
  const handleCreateFlowSubmit = async (e) => {
    e.preventDefault();
    if (!newFlowName.trim()) {
      showToast('Please provide a name for the Flow', 'error');
      return;
    }

    setCreatingFlow(true);
    try {
      const result = await flowsService.createFlow({
        name: newFlowName.trim(),
        category: newFlowCategory,
      });
      showToast(`Flow "${newFlowName.trim()}" created successfully!`);
      setCreateModalOpen(false);
      setNewFlowName('');
      await loadFlows();
    } catch (err) {
      console.error('Create flow failed:', err);
      showToast(err.message || 'Failed to create Flow', 'error');
    } finally {
      setCreatingFlow(false);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'published' || s === 'completed' || s === 'sent') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    }
    if (s === 'draft') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Draft
        </span>
      );
    }
    if (s === 'sending' || s === 'processing') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    }
    if (s === 'scheduled' || s === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    }
    if (s === 'deprecated' || s === 'failed' || s === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        {status}
      </span>
    );
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

      {/* Main Layout */}
      <div className="flex-1 flex flex-row min-w-0">
        <DashboardSidebar />

        {/* Workspace Content Shell */}
        <main className="flex-1 ml-14 min-w-0 flex flex-col bg-[#f8fafc] min-h-screen">
          {/* Top Header Navigation */}
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between shadow-2xs">
            {/* Breadcrumb: Dashboard / Market / Flows */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Link to="/dashboard" className="hover:text-gray-800 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-gray-500">Market</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">Flows</span>
            </div>

            {/* Profile & Controls */}
            <div className="flex items-center gap-3">
              {/* Trial Plan Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                <span className="font-bold">{subscription?.planName || 'Trial Plan'}</span>
                <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {trialDaysRemaining} Days Left
                </span>
              </div>

              <div className="relative profile-container">
                <button
                  type="button"
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
                      type="button"
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
          <div className="p-6 max-w-[1400px] w-full mx-auto space-y-4">
            {/* Header: Title + Subtitle + Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
                    Flows
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Meta Verified
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-normal mt-0.5">
                  Manage native Meta WhatsApp Flows, inspect schema details, and dispatch bulk interactive broadcasts
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="h-8 px-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-xs rounded shadow-2xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Create Flow</span>
                </button>
                <Link
                  to="/flows/broadcast"
                  className="h-8 px-3.5 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-medium text-xs rounded shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Create Flow Broadcast</span>
                </Link>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 gap-6 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('flows')}
                className={`pb-2.5 text-xs font-semibold cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'flows'
                    ? 'border-[#0d3b30] text-[#0d3b30]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Workflow className="w-3.5 h-3.5" />
                <span>Meta Flows</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-100 text-gray-600 font-medium">
                  {flows.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('broadcasts')}
                className={`pb-2.5 text-xs font-semibold cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'broadcasts'
                    ? 'border-[#0d3b30] text-[#0d3b30]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Flow Broadcasts</span>
                {broadcasts.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    {broadcasts.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === 'flows' ? (
              <>
                {/* Filter / Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search flows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="h-8 pl-8 pr-3 rounded border border-gray-300 bg-white text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 w-full"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-8 pl-2.5 pr-7 rounded border border-gray-300 bg-white text-xs text-gray-700 focus:outline-none focus:border-gray-400 cursor-pointer appearance-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="deprecated">Deprecated</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={loadFlows}
                className="h-8 px-3 rounded border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center gap-1.5 text-xs text-gray-600 cursor-pointer shadow-2xs self-end sm:self-auto"
                title="Refresh Flows from Meta"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0d3b30]' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Content: Loading | Empty State | Table */}
            {loading ? (
              <div className="border border-gray-200 rounded bg-white min-h-[360px] flex flex-col items-center justify-center p-12 space-y-3 shadow-2xs">
                <RefreshCw className="w-7 h-7 text-[#0d3b30] animate-spin" />
                <p className="text-xs font-semibold text-gray-600">Syncing flows with Meta WABA...</p>
              </div>
            ) : flows.length === 0 ? (
              <div className="border border-gray-200 rounded bg-white min-h-[400px] flex flex-col items-center justify-center p-12 text-center space-y-3.5 shadow-2xs">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0d3b30]">
                  <Workflow className="w-7 h-7 stroke-[1.75]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900">No Flows Found</h3>
                  <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                    {searchQuery || statusFilter !== 'all'
                      ? 'No flows match the specified search or filter criteria. Try clearing the filter.'
                      : 'Connect and configure WhatsApp Flows to capture interactive structured forms inside WhatsApp chats.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-medium text-xs rounded shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Create Flow</span>
                </button>
              </div>
            ) : (
              /* Flows Table */
              <div className="border border-gray-200 rounded overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-semibold text-gray-600">
                        <th className="py-3 px-4 font-semibold">Flow Name</th>
                        <th className="py-3 px-4 font-semibold">Category</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold">Meta Flow ID</th>
                        <th className="py-3 px-4 font-semibold">Last Updated</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                      {flows.map((flow) => (
                        <tr
                          key={flow.id || flow.metaFlowId}
                          className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                          onClick={() => openFlowDetails(flow)}
                        >
                          {/* Flow Name */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0d3b30] shrink-0">
                                <Workflow className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
                                  <span>{flow.name || flow.title}</span>
                                </div>
                                <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                                  JSON v{flow.jsonVersion || '7.3'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              {flow.category || 'Lead Generation'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {getStatusBadge(flow.status)}
                          </td>

                          {/* Meta Flow ID */}
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                              <span>{flow.metaFlowId || flow.id}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(flow.metaFlowId || flow.id, flow.id)}
                                className="text-gray-400 hover:text-gray-700 p-0.5 rounded transition-colors"
                                title="Copy Meta Flow ID"
                              >
                                {copiedId === flow.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Last Updated */}
                          <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                            {flow.updatedAt ? formatDate(flow.updatedAt) : 'Recently'}
                          </td>

                          {/* Actions */}
                          <td
                            className="py-3.5 px-4 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Send Test Button */}
                              <button
                                type="button"
                                onClick={() => openSendTestModal(flow)}
                                className="h-7 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#0d3b30] font-semibold text-[11px] rounded border border-emerald-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title="Send live interactive Flow to WhatsApp"
                              >
                                <Send className="w-3 h-3" />
                                <span>Send Test</span>
                              </button>

                              {/* View Details Button */}
                              <button
                                type="button"
                                onClick={() => openFlowDetails(flow)}
                                className="h-7 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-[11px] rounded border border-gray-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title="View Flow Details"
                              >
                                <Eye className="w-3 h-3 text-gray-500" />
                                <span className="hidden md:inline">Details</span>
                              </button>

                              {/* Row Dropdown Menu [⋮] */}
                              <div className="relative row-menu-container">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveMenuId(activeMenuId === flow.id ? null : flow.id)
                                  }
                                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                                  title="More options"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {activeMenuId === flow.id && (
                                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30 text-xs text-left">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        openFlowDetails(flow);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full px-3 py-1.5 text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                                      <span>View Details</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openSendTestModal(flow)}
                                      className="w-full px-3 py-1.5 text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                    >
                                      <Send className="w-3.5 h-3.5 text-[#0d3b30]" />
                                      <span>Send Test</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        copyToClipboard(flow.metaFlowId || flow.id, flow.id);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full px-3 py-1.5 text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                    >
                                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                                      <span>Copy Flow ID</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Broadcasts Filter / Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search broadcasts..."
                    value={broadcastSearch}
                    onChange={(e) => setBroadcastSearch(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="h-8 pl-8 pr-3 rounded border border-gray-300 bg-white text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 w-full"
                  />
                </div>

                {/* Broadcast Status Filter */}
                <div className="relative">
                  <select
                    value={broadcastStatusFilter}
                    onChange={(e) => setBroadcastStatusFilter(e.target.value)}
                    className="h-8 pl-2.5 pr-7 rounded border border-gray-300 bg-white text-xs text-gray-700 focus:outline-none focus:border-gray-400 cursor-pointer appearance-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="sending">Sending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="draft">Draft</option>
                    <option value="failed">Failed</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={loadBroadcasts}
                className="h-8 px-3 rounded border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center gap-1.5 text-xs text-gray-600 cursor-pointer shadow-2xs self-end sm:self-auto"
                title="Refresh Broadcasts"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${broadcastsLoading ? 'animate-spin text-[#0d3b30]' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Broadcasts Content: Loading | Empty State | Table */}
            {broadcastsLoading ? (
              <div className="border border-gray-200 rounded bg-white min-h-[360px] flex flex-col items-center justify-center p-12 space-y-3 shadow-2xs">
                <RefreshCw className="w-7 h-7 text-[#0d3b30] animate-spin" />
                <p className="text-xs font-semibold text-gray-600">Loading flow broadcasts...</p>
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="border border-gray-200 rounded bg-white min-h-[400px] flex flex-col items-center justify-center p-12 text-center space-y-3.5 shadow-2xs">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0d3b30]">
                  <Send className="w-7 h-7 stroke-[1.75]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900">No Flow Broadcasts Found</h3>
                  <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                    {broadcastSearch || broadcastStatusFilter !== 'all'
                      ? 'No broadcasts match the search or filter criteria. Try clearing your filters.'
                      : 'Broadcast native Meta WhatsApp Flows to your CSV audience with customizable fields and scheduled delivery.'}
                  </p>
                </div>
                <Link
                  to="/flows/broadcast"
                  className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-medium text-xs rounded shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Create Flow Broadcast</span>
                </Link>
              </div>
            ) : (
              <div className="border border-gray-200 rounded overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-semibold text-gray-600">
                        <th className="py-3 px-4 font-semibold">Broadcast Name</th>
                        <th className="py-3 px-4 font-semibold">Meta Flow</th>
                        <th className="py-3 px-4 font-semibold">Audience</th>
                        <th className="py-3 px-4 font-semibold">Delivery Progress</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold">Date</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                      {broadcasts.map((b) => {
                        const total = b.recipients || b.totalRecipients || 0;
                        const sent = b.sent || b.sentCount || 0;
                        const failed = b.failed || b.failedCount || 0;
                        const pct = typeof b.progressPercent === 'number' ? b.progressPercent : (parseInt(b.progressPercent, 10) || (total > 0 ? Math.round(((sent + failed) / total) * 100) : 0));
                        return (
                          <tr
                            key={b.id}
                            className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                            onClick={() => window.location.href = `/flows/broadcasts/${b.id}`}
                          >
                            <td className="py-3.5 px-4 font-semibold text-gray-900">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0d3b30] shrink-0">
                                  <Send className="w-3.5 h-3.5" />
                                </div>
                                <span>{b.name || 'Untitled Broadcast'}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-gray-800">{b.flowName || 'ARCO'}</span>
                              <span className="block text-[10px] text-gray-400 font-mono">ID: {b.flowId}</span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-gray-800">
                              {total} contacts
                            </td>
                            <td className="py-3.5 px-4 min-w-[140px]">
                              <div className="flex items-center justify-between text-[10px] font-semibold text-gray-600 mb-1">
                                <span>{sent} sent</span>
                                <span>{pct}%</span>
                              </div>
                              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden flex">
                                <div className="bg-emerald-500 h-full" style={{ width: `${total > 0 ? (sent / total) * 100 : 0}%` }} />
                                <div className="bg-red-500 h-full" style={{ width: `${total > 0 ? (failed / total) * 100 : 0}%` }} />
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              {getStatusBadge(b.status)}
                            </td>
                            <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                              {b.scheduledAt ? (
                                <span className="text-blue-600 font-medium">
                                  {formatDateTime(b.scheduledAt)}
                                </span>
                              ) : (
                                formatDate(b.createdAt)
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <Link
                                to={`/flows/broadcasts/${b.id}`}
                                className="h-7 px-2.5 bg-gray-50 hover:bg-gray-100 text-[#0d3b30] font-semibold text-[11px] rounded border border-gray-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3 text-gray-500" />
                                <span>Status</span>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
          </div>
        </main>
      </div>

      {/* =========================================================================
          MODAL 1: FLOW DETAILS
          ========================================================================= */}
      {selectedFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0d3b30]">
                  <Workflow className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 leading-tight">
                    {selectedFlow.name || selectedFlow.title}
                  </h2>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Meta ID: {selectedFlow.metaFlowId || selectedFlow.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFlow(null);
                  setDetailedFlowData(null);
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              {detailsLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2 text-gray-500">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#0d3b30]" />
                  <span>Loading live Meta Flow specifications...</span>
                </div>
              ) : (
                <>
                  {/* Status & Category Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/40">
                      <div className="text-[11px] text-gray-500 font-medium">Status</div>
                      <div className="mt-1">{getStatusBadge(detailedFlowData?.status || selectedFlow.status)}</div>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/40">
                      <div className="text-[11px] text-gray-500 font-medium">Category</div>
                      <div className="mt-1 font-semibold text-gray-800">
                        {detailedFlowData?.category || selectedFlow.category || 'Lead Generation'}
                      </div>
                    </div>
                  </div>

                  {/* Flow Specifications Table */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-3.5 py-2 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 text-[11px]">
                      Flow Specifications
                    </div>
                    <div className="divide-y divide-gray-100">
                      <div className="px-3.5 py-2.5 flex items-center justify-between">
                        <span className="text-gray-500">Meta Flow ID</span>
                        <span className="font-mono text-gray-800 font-medium">
                          {selectedFlow.metaFlowId || selectedFlow.id}
                        </span>
                      </div>
                      <div className="px-3.5 py-2.5 flex items-center justify-between">
                        <span className="text-gray-500">JSON Version</span>
                        <span className="font-mono text-gray-800">
                          v{detailedFlowData?.jsonVersion || selectedFlow.jsonVersion || '7.3'}
                        </span>
                      </div>
                      <div className="px-3.5 py-2.5 flex items-center justify-between">
                        <span className="text-gray-500">Data API Version</span>
                        <span className="font-mono text-gray-800">
                          {detailedFlowData?.dataApiVersion || '3.0'}
                        </span>
                      </div>
                      <div className="px-3.5 py-2.5 flex items-center justify-between">
                        <span className="text-gray-500">Validation Status</span>
                        {detailedFlowData?.validationErrors && detailedFlowData.validationErrors.length > 0 ? (
                          <span className="text-red-600 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {detailedFlowData.validationErrors.length} validation errors
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Valid (0 errors)
                          </span>
                        )}
                      </div>
                      <div className="px-3.5 py-2.5 flex items-center justify-between">
                        <span className="text-gray-500">Entry Screen</span>
                        <span className="font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          RECOMMEND
                        </span>
                      </div>
                      <div className="px-3.5 py-2.5 flex items-center justify-between">
                        <span className="text-gray-500">Created Date</span>
                        <span className="text-gray-700">
                          {selectedFlow.createdAt
                            ? formatDateTime(selectedFlow.createdAt)
                            : 'Verified'}
                        </span>
                      </div>
                      <div className="px-3.5 py-2.5 flex items-center justify-between">
                        <span className="text-gray-500">Last Updated / Published</span>
                        <span className="text-gray-700">
                          {selectedFlow.updatedAt
                            ? formatDateTime(selectedFlow.updatedAt)
                            : 'Current'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Meta Live Preview URL info if available */}
                  {detailedFlowData?.preview?.preview_url && (
                    <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-emerald-900 font-medium text-[11px]">
                          Interactive Meta Preview is ready for testing
                        </span>
                      </div>
                      <a
                        href={detailedFlowData.preview.preview_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 text-[11px]"
                      >
                        <span>Open Preview</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => openFlowDetails(selectedFlow)}
                className="h-8 px-3 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Specs</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFlow(null);
                    setDetailedFlowData(null);
                  }}
                  className="h-8 px-3.5 text-gray-600 hover:text-gray-800 text-xs font-medium cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = selectedFlow;
                    setSelectedFlow(null);
                    setDetailedFlowData(null);
                    openSendTestModal(target);
                  }}
                  className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-medium text-xs rounded shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: SEND TEST FLOW
          ========================================================================= */}
      {sendTestModalOpen && sendTestTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0d3b30]">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Send Test Flow</h2>
                  <p className="text-[11px] text-gray-500">
                    Dispatch live interactive Flow directly to WhatsApp
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSendTestModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendTestSubmit}>
              <div className="p-6 space-y-4 text-xs">
                {/* Selected Flow Summary */}
                <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1">
                  <div className="text-[11px] text-gray-500 font-medium">Selected Flow</div>
                  <div className="flex items-center justify-between font-semibold text-gray-900">
                    <span>{sendTestTarget.name || sendTestTarget.title}</span>
                    <span className="font-mono text-gray-500 text-[11px]">
                      {sendTestTarget.metaFlowId || sendTestTarget.id}
                    </span>
                  </div>
                </div>

                {/* Recipient Phone Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Recipient Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 99208 58396"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-gray-300 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0d3b30] focus:ring-1 focus:ring-[#0d3b30]"
                  />
                  <p className="text-[11px] text-gray-400">
                    Enter the phone number with country code (e.g. +91 99208 58396)
                  </p>
                </div>

                {/* Flow CTA Button Text */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Flow CTA Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="Give Feedback"
                    value={testCta}
                    onChange={(e) => setTestCta(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-gray-300 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0d3b30] focus:ring-1 focus:ring-[#0d3b30]"
                  />
                  <p className="text-[11px] text-gray-400">
                    Button label displayed on the WhatsApp message to open the flow
                  </p>
                </div>

                {/* Info Note */}
                <div className="p-2.5 rounded border border-blue-100 bg-blue-50/60 flex items-start gap-2 text-blue-800 text-[11px] leading-relaxed">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-600" />
                  <span>
                    This uses the verified backend flow dispatch endpoint. Submitting the form on WhatsApp will automatically trigger real-time lead capture in ARCO Inbox.
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50/50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSendTestModalOpen(false)}
                  className="h-8 px-3.5 text-gray-600 hover:text-gray-800 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingTest}
                  className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] disabled:opacity-60 text-white font-medium text-xs rounded shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {sendingTest ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending to WhatsApp...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Flow</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: CREATE FLOW (Minimal Phase 1 Creation)
          ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0d3b30]">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Create New Flow</h2>
                  <p className="text-[11px] text-gray-500">
                    Register a new Flow with connected Meta WhatsApp Business Account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateFlowSubmit}>
              <div className="p-6 space-y-4 text-xs">
                {/* Flow Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Flow Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Qualification, Customer Feedback"
                    value={newFlowName}
                    onChange={(e) => setNewFlowName(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-gray-300 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0d3b30] focus:ring-1 focus:ring-[#0d3b30]"
                  />
                  <p className="text-[11px] text-gray-400">
                    A unique, recognizable name for your Meta WhatsApp Flow
                  </p>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newFlowCategory}
                    onChange={(e) => setNewFlowCategory(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-gray-300 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#0d3b30] focus:ring-1 focus:ring-[#0d3b30]"
                  >
                    <option value="LEAD_GENERATION">Lead Generation</option>
                    <option value="APPOINTMENT_BOOKING">Appointment Booking</option>
                    <option value="CONTACT_US">Contact Us</option>
                    <option value="CUSTOMER_SUPPORT">Customer Support</option>
                    <option value="SURVEY">Survey & Feedback</option>
                  </select>
                  <p className="text-[11px] text-gray-400">
                    Meta Flow category defines the primary intent of this interactive form
                  </p>
                </div>

                {/* Notice */}
                <div className="p-2.5 rounded border border-gray-200 bg-gray-50 text-gray-600 text-[11px] leading-relaxed">
                  New flows are created in <span className="font-semibold text-amber-700">Draft</span> status on Meta Graph API and will automatically appear in your Flow list upon confirmation.
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50/50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="h-8 px-3.5 text-gray-600 hover:text-gray-800 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingFlow}
                  className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] disabled:opacity-60 text-white font-medium text-xs rounded shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {creatingFlow ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Flow...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Flow</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
