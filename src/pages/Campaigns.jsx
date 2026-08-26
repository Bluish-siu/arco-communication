import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Megaphone,
  Search,
  ChevronDown,
  Plus,
  RefreshCw,
  Eye,
  PauseCircle,
  PlayCircle,
  Users,
  LogOut,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { campaignsService } from '../services/campaignsService';
import CreateCampaignWorkspace from '../components/campaigns/CreateCampaignWorkspace';

// WhatsApp Contextual SVG Icon
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// RCS Contextual Icon
const RcsIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="8" cy="12" r="1" fill="currentColor" />
    <circle cx="16" cy="12" r="1" fill="currentColor" />
  </svg>
);

export default function Campaigns() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, businessSetup, logout } = useOnboarding();
  const userName = businessSetup?.companyName || user?.name || 'Business Owner';

  // Navigation & Filter Tabs from URL query parameters
  const currentTab = searchParams.get('campaign-type') || searchParams.get('type') || 'onetime';
  const channelType = searchParams.get('channel_type') || 'whatsapp';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCreator, setSelectedCreator] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Data Lists
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [campaignsList, setCampaignsList] = useState([]);

  // Modals & Workspaces
  const [createWhatsAppWorkspaceOpen, setCreateWhatsAppWorkspaceOpen] = useState(false);
  const [createRcsModalOpen, setCreateRcsModalOpen] = useState(false);

  // RCS Builder State
  const [rcsCampaignName, setRcsCampaignName] = useState('');
  const [rcsBody, setRcsBody] = useState('Experience next-gen RCS interactive messaging with verified ARCO sender badge.');

  // Notifications
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

  // Synchronize Tab Change with URL Query Parameter
  const handleTabChange = (type) => {
    setSearchParams({
      channel_type: channelType,
      'campaign-type': type,
    });
  };

  // Load Campaigns from PostgreSQL Backend
  const loadCampaigns = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const data = await campaignsService.getCampaigns({
        type: currentTab,
        channel: selectedChannel,
        status: selectedStatus,
        category: selectedCategory,
        creator: selectedCreator,
        search: searchQuery,
        dateRange: selectedDateFilter,
      });
      setCampaignsList(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
      if (showSpinner) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [currentTab, selectedChannel, selectedStatus, selectedCategory, selectedCreator, selectedDateFilter, searchQuery]);

  // Toggle Pause/Resume Campaign
  const handleToggleCampaignStatus = async (campaign) => {
    const newStatus = campaign.status === 'Active' || campaign.status === 'Scheduled' ? 'Paused' : 'Active';
    try {
      await campaignsService.updateStatus(campaign.id, newStatus);
      showToast(`Campaign status updated to ${newStatus}`);
      loadCampaigns();
    } catch {
      showToast('Failed to update campaign status', 'error');
    }
  };

  // RCS Campaign Create Handler
  const handleCreateRcsCampaign = async (e) => {
    e.preventDefault();
    if (!rcsCampaignName.trim()) return;

    try {
      await campaignsService.createCampaign({
        name: rcsCampaignName.trim(),
        channel: 'rcs',
        type: 'onetime',
        category: 'Marketing',
        recipients: 850,
        description: rcsBody,
        status: 'Scheduled',
      });
      showToast(`RCS Campaign "${rcsCampaignName}" created!`);
      setCreateRcsModalOpen(false);
      setRcsCampaignName('');
      loadCampaigns();
    } catch {
      showToast('Failed to create RCS campaign', 'error');
    }
  };

  // Status Badge Styling
  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'ACTIVE':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SCHEDULED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PAUSED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700 border-gray-200';
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

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-row min-w-0">
        <DashboardSidebar />

        {/* Content Shell */}
        <main className="flex-1 ml-14 min-w-0 flex flex-col bg-[#f8fafc] min-h-screen">
          
          {/* Top Navigation Header */}
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between shadow-2xs">
            
            {/* Breadcrumb: Dashboard / Market / Campaigns */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Link to="/dashboard" className="hover:text-gray-800 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-gray-500">Market</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">Campaigns</span>
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
          <div className="p-6 max-w-[1400px] w-full mx-auto space-y-4">
            
            {/* Header: Title + Action Buttons */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
                  Campaigns
                </h1>
                <p className="text-xs text-gray-500 font-normal mt-0.5">
                  Manage and monitor broadcast marketing campaigns
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCreateRcsModalOpen(true)}
                  className="h-8 px-3 rounded border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RcsIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Create RCS Campaign</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/campaigns/create')}
                  className="h-8 px-3.5 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-medium text-xs rounded shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Create Whatsapp Campaign</span>
                </button>
              </div>
            </div>

            {/* FULL-WIDTH TABS BAR */}
            <div className="border-b border-gray-200 flex items-center gap-8 text-sm">
              <button
                type="button"
                onClick={() => handleTabChange('onetime')}
                className={`pb-2.5 transition-colors cursor-pointer ${
                  currentTab === 'onetime'
                    ? 'border-b-2 border-[#0d3b30] text-[#0d3b30] font-semibold -mb-[1px]'
                    : 'text-gray-500 hover:text-gray-800 font-medium'
                }`}
              >
                One Time Campaigns
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('ongoing')}
                className={`pb-2.5 transition-colors cursor-pointer ${
                  currentTab === 'ongoing'
                    ? 'border-b-2 border-[#0d3b30] text-[#0d3b30] font-semibold -mb-[1px]'
                    : 'text-gray-500 hover:text-gray-800 font-medium'
                }`}
              >
                Ongoing Campaigns
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('api')}
                className={`pb-2.5 transition-colors cursor-pointer ${
                  currentTab === 'api'
                    ? 'border-b-2 border-[#0d3b30] text-[#0d3b30] font-semibold -mb-[1px]'
                    : 'text-gray-500 hover:text-gray-800 font-medium'
                }`}
              >
                API campaigns
              </button>
            </div>

            {/* FILTER BAR: Search by name 0/200 | WhatsApp ▼ | Status ▼ | Category ▼ | Created by ▼ | Date Set Live ▼ | Refresh */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Search Input with 0/200 Counter */}
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={200}
                    placeholder="Search by name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 pr-12 rounded border border-gray-300 bg-white text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 w-full"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400">
                    {searchQuery.length}/200
                  </span>
                </div>

                {/* Channel Filter */}
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="h-8 px-2.5 rounded border border-gray-300 bg-white text-xs font-normal text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">WhatsApp</option>
                  <option value="whatsapp">WhatsApp Only</option>
                  <option value="rcs">RCS Only</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-8 px-2.5 rounded border border-gray-300 bg-white text-xs font-normal text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Status: All</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="draft">Draft</option>
                </select>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-8 px-2.5 rounded border border-gray-300 bg-white text-xs font-normal text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Category: All</option>
                  <option value="marketing">Marketing</option>
                  <option value="utility">Utility</option>
                  <option value="authentication">Authentication</option>
                </select>

                {/* Created By Filter */}
                <select
                  value={selectedCreator}
                  onChange={(e) => setSelectedCreator(e.target.value)}
                  className="h-8 px-2.5 rounded border border-gray-300 bg-white text-xs font-normal text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Created by: All</option>
                  <option value="Shraddha">Shraddha Sharma</option>
                  <option value="System">System Bot</option>
                </select>

                {/* Date Set Live Filter */}
                <select
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                  className="h-8 px-2.5 rounded border border-gray-300 bg-white text-xs font-normal text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Date Set Live</option>
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="last_30_days">Last 30 Days</option>
                  <option value="this_month">This Month</option>
                </select>

              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={() => loadCampaigns(true)}
                className="h-8 w-8 rounded border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 cursor-pointer shadow-2xs"
                title="Refresh Campaigns"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing || loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* CONTENT AREA: Loading | Empty State | Table */}
            {loading ? (
              <div className="border border-gray-200 rounded bg-white min-h-[360px] flex flex-col items-center justify-center p-12 space-y-3">
                <RefreshCw className="w-7 h-7 text-[#0d3b30] animate-spin" />
                <p className="text-xs font-semibold text-gray-500">Loading campaigns...</p>
              </div>
            ) : campaignsList.length === 0 ? (
              /* Interakt Empty State */
              <div className="border border-gray-200 rounded bg-white min-h-[420px] flex flex-col items-center justify-center p-12 text-center space-y-3.5 shadow-2xs">
                
                {/* Centered circular campaign/megaphone icon */}
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0d3b30]">
                  <Megaphone className="w-7 h-7 stroke-[1.75]" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900">No Campaigns here</h3>
                  <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                    Click below to send a campaign
                  </p>
                </div>

                {/* + New Campaign Button */}
                <button
                  type="button"
                  onClick={() => navigate('/campaigns/create')}
                  className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-medium text-xs rounded shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>New Campaign</span>
                </button>

              </div>
            ) : (
              /* Campaigns Table */
              <div className="border border-gray-200 rounded overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-semibold text-gray-600">
                        <th className="py-2.5 px-4 font-semibold">Campaign Name</th>
                        <th className="py-2.5 px-4 font-semibold">Status</th>
                        <th className="py-2.5 px-4 font-semibold">Recipients</th>
                        <th className="py-2.5 px-4 font-semibold">Delivery Stats</th>
                        <th className="py-2.5 px-4 font-semibold">Scheduled / Sent At</th>
                        <th className="py-2.5 px-4 font-semibold">Created By</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                      {campaignsList.map((camp) => (
                        <tr key={camp.id} className="hover:bg-gray-50/70 transition-colors">
                          
                          {/* Campaign Name + Badges */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {camp.channel === 'rcs' ? (
                                <RcsIcon className="w-4 h-4 text-blue-600 shrink-0" />
                              ) : (
                                <WhatsAppIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                              <div>
                                <Link
                                  to={`/campaigns/${camp.id}`}
                                  className="font-semibold text-gray-900 hover:text-emerald-800 transition-colors text-xs"
                                >
                                  {camp.name}
                                </Link>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    {camp.id}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                    {camp.category || 'Marketing'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getStatusBadge(
                                camp.status
                              )}`}
                            >
                              {camp.status || 'SCHEDULED'}
                            </span>
                          </td>

                          {/* Recipients */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 font-semibold text-gray-800">
                              <Users className="w-3 h-3 text-gray-400" />
                              {(camp.recipients || 0).toLocaleString()}
                            </span>
                          </td>

                          {/* Delivery Stats */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="text-emerald-700 font-medium">
                                Delivered: {camp.delivered ?? camp.recipients ?? 0}
                              </span>
                              <span className="text-gray-300">|</span>
                              <span className="text-blue-700 font-medium">
                                Read: {camp.read ?? Math.round((camp.recipients || 0) * 0.72)}
                              </span>
                            </div>
                          </td>

                          {/* Scheduled / Sent At */}
                          <td className="py-3 px-4 text-gray-600 text-[11px]">
                            {camp.scheduledFor ? new Date(camp.scheduledFor).toLocaleString() : 'Immediate'}
                          </td>

                          {/* Created By */}
                          <td className="py-3 px-4 text-gray-700">
                            {camp.createdBy || 'Shraddha Sharma'}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                to={`/campaigns/${camp.id}`}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                                title="View Campaign Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>

                              <button
                                type="button"
                                onClick={() => handleToggleCampaignStatus(camp)}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-emerald-700 transition-colors cursor-pointer"
                                title={camp.status === 'Active' ? 'Pause Campaign' : 'Resume Campaign'}
                              >
                                {camp.status === 'Active' ? (
                                  <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                                ) : (
                                  <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                                )}
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 2. CREATE RCS CAMPAIGN MODAL                                              */}
      {/* ========================================================================= */}
      {createRcsModalOpen && (
        <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-md w-full p-5 space-y-4 text-xs font-sans animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <RcsIcon className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-gray-900">Create RCS Campaign</h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateRcsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRcsCampaign} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">RCS Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={rcsCampaignName}
                  onChange={(e) => setRcsCampaignName(e.target.value)}
                  placeholder="e.g. Diwali Interactive Card"
                  className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Card Message Body</label>
                <textarea
                  rows={3}
                  value={rcsBody}
                  onChange={(e) => setRcsBody(e.target.value)}
                  className="w-full p-2 rounded border border-gray-300 text-xs"
                />
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateRcsModalOpen(false)}
                  className="h-8 px-3 rounded border border-gray-300 hover:bg-gray-50 text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded shadow-xs cursor-pointer"
                >
                  Create RCS Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
