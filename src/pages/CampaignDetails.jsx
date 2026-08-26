import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Megaphone,
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  XCircle,
  Trash2,
  Edit3,
  Copy,
  ExternalLink,
  Layers,
  Send,
  MessageSquare,
  Sparkles,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Tag,
  Share2,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Zap,
  Check,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { campaignsService } from '../services/campaignsService';

// WhatsApp Contextual SVG Icon
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, businessSetup } = useOnboarding();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Recipient Queue & Delivery Log State
  const [recipientsList, setRecipientsList] = useState([]);
  const [recipientPage, setRecipientPage] = useState(1);
  const [recipientTotalPages, setRecipientTotalPages] = useState(1);
  const [recipientTotal, setRecipientTotal] = useState(0);
  const [recipientStatusFilter, setRecipientStatusFilter] = useState('all');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [statusCounts, setStatusCounts] = useState({});
  const [processingBatch, setProcessingBatch] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadCampaign = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const data = await campaignsService.getCampaign(id);
      if (data) {
        setCampaign(data);
      } else {
        showToast('Campaign not found', 'error');
      }
    } catch {
      showToast('Failed to load campaign details', 'error');
    } finally {
      setLoading(false);
      if (showSpinner) setRefreshing(false);
    }
  };

  const loadRecipients = async () => {
    try {
      const res = await campaignsService.getRecipients(id, {
        page: recipientPage,
        limit: 20,
        status: recipientStatusFilter,
        search: recipientSearch,
      });

      if (res && res.data) {
        setRecipientsList(res.data);
        setRecipientTotal(res.total || 0);
        setRecipientTotalPages(res.totalPages || 1);
        if (res.statusCounts) setStatusCounts(res.statusCounts);
      }
    } catch {
      console.warn('Failed to load recipients log');
    }
  };

  useEffect(() => {
    loadCampaign();
  }, [id]);

  useEffect(() => {
    loadRecipients();
  }, [id, recipientPage, recipientStatusFilter, recipientSearch]);

  const handleStatusChange = async (newStatus) => {
    try {
      await campaignsService.updateStatus(id, newStatus);
      setCampaign((prev) => ({ ...prev, status: newStatus }));
      showToast(`Campaign status updated to "${newStatus}"`);
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleProcessBatch = async () => {
    setProcessingBatch(true);
    try {
      const res = await campaignsService.processBatch(id, 100);
      showToast(res.message || 'Processed batch of 100 recipients.');
      await loadCampaign();
      await loadRecipients();
    } catch {
      showToast('Failed to process batch.', 'error');
    } finally {
      setProcessingBatch(false);
    }
  };

  const handleDelete = async () => {
    try {
      await campaignsService.deleteCampaign(id);
      showToast('Campaign deleted');
      navigate('/campaigns');
    } catch {
      showToast('Failed to delete campaign', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex font-sans text-slate-900">
        <DashboardSidebar />
        <main className="flex-1 ml-14 min-w-0 p-8 flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-slate-500 font-semibold">
            <RefreshCw className="w-5 h-5 animate-spin text-red-600" />
            <span>Loading campaign details...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex font-sans text-slate-900">
        <DashboardSidebar />
        <main className="flex-1 ml-14 min-w-0 p-8 flex flex-col items-center justify-center space-y-4">
          <Megaphone className="w-12 h-12 text-slate-300" />
          <h2 className="text-xl font-bold text-slate-800">Campaign Not Found</h2>
          <Link
            to="/campaigns"
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
          >
            Back to Campaigns
          </Link>
        </main>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
      case 'Sent':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Scheduled':
      case 'Active':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Sending':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'Paused':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Cancelled':
      case 'Failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRecipientStatusPill = (status) => {
    switch (status) {
      case 'replied':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'read':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'delivered':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'sent':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <DashboardSidebar />

      {/* 2. MAIN CONTAINER */}
      <main className="flex-1 ml-14 min-w-0 flex flex-col bg-slate-50/50 min-h-screen">
        
        {/* Top Header */}
        <header className="h-16 sm:h-18 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <Link
              to="/campaigns"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Back to Campaigns"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Campaign Hub</div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate max-w-md">
                {campaign.name}
              </h1>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadCampaign(true);
                loadRecipients();
              }}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Batch Dispatch Runner */}
            {campaign.pending > 0 && (
              <button
                onClick={handleProcessBatch}
                disabled={processingBatch}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 ${processingBatch ? 'animate-bounce' : ''}`} />
                <span>{processingBatch ? 'Dispatching...' : 'Dispatch Next Batch (100)'}</span>
              </button>
            )}

            {campaign.status === 'Active' || campaign.status === 'Scheduled' || campaign.status === 'Sending' ? (
              <button
                onClick={() => handleStatusChange('Paused')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <PauseCircle className="w-4 h-4 text-slate-500" />
                <span>Pause</span>
              </button>
            ) : campaign.status === 'Paused' ? (
              <button
                onClick={() => handleStatusChange('Active')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Resume</span>
              </button>
            ) : null}

            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Delete Campaign"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
          
          {/* Campaign Header Overview Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${getStatusBadge(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                    <WhatsAppIcon className="w-3 h-3 text-emerald-600" />
                    <span>WhatsApp Broadcast</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    {campaign.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 uppercase">
                    {campaign.type}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{campaign.name}</h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {campaign.description || 'WhatsApp bulk marketing broadcast campaign delivered to targeted audience in batches.'}
                </p>
              </div>

              {/* Created Meta Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5 shrink-0 min-w-[200px]">
                <div className="flex justify-between text-slate-500">
                  <span>Created by:</span>
                  <strong className="text-slate-800">{campaign.createdBy}</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Scheduled for:</span>
                  <strong className="text-slate-800">{new Date(campaign.scheduledFor).toLocaleDateString()}</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Timezone:</span>
                  <strong className="text-slate-800">{campaign.scheduleTimezone}</strong>
                </div>
              </div>
            </div>

            {/* Campaign Progress Bar */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span>Batch Delivery Progress</span>
                  <span className="text-slate-400 font-normal">
                    ({(campaign.recipients - (campaign.pending || 0)).toLocaleString()} of {campaign.recipients.toLocaleString()} sent)
                  </span>
                </span>
                <span className="text-red-600 font-extrabold">{campaign.progressPercent || '100%'}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                <div
                  style={{ width: campaign.progressPercent || '100%' }}
                  className="bg-red-600 h-full rounded-full transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Delivery & Engagement Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            
            {/* 1. Recipients */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Recipients</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">{campaign.recipients.toLocaleString()}</div>
              <div className="mt-1 text-[11px] text-slate-500 font-medium">PostgreSQL audience size</div>
            </div>

            {/* 2. Delivered */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs border-l-4 border-l-blue-500">
              <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Delivered</div>
              <div className="mt-1 text-2xl font-extrabold text-blue-900">{campaign.delivered.toLocaleString()}</div>
              <div className="mt-1 text-[11px] text-blue-700 font-semibold">{campaign.rates?.deliveryRate} Delivery Rate</div>
            </div>

            {/* 3. Read */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs border-l-4 border-l-emerald-500">
              <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Read</div>
              <div className="mt-1 text-2xl font-extrabold text-emerald-900">{campaign.read.toLocaleString()}</div>
              <div className="mt-1 text-[11px] text-emerald-700 font-semibold">{campaign.rates?.readRate} Read Rate</div>
            </div>

            {/* 4. Replied */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs border-l-4 border-l-purple-500">
              <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Replied</div>
              <div className="mt-1 text-2xl font-extrabold text-purple-900">{campaign.replied.toLocaleString()}</div>
              <div className="mt-1 text-[11px] text-purple-700 font-semibold">{campaign.rates?.replyRate} Reply Rate</div>
            </div>

            {/* 5. Failed */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Failed</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-800">{campaign.failureCount}</div>
              <div className="mt-1 text-[11px] text-slate-400">Undelivered / Bounced</div>
            </div>

            {/* 6. Pending in Queue */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Queue</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">{(campaign.pending || 0).toLocaleString()}</div>
              <div className="mt-1 text-[11px] text-slate-400">Batches remaining</div>
            </div>

          </div>

          {/* 3. PAGINATED RECIPIENT DELIVERY LOG & QUEUE TABLE (Interakt-style Bulk Recipient Explorer) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-red-600" />
                  <span>Recipient Delivery & Status Log</span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {recipientTotal.toLocaleString()} Total
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Server-side paginated breakdown of individual contact delivery statuses and timestamps.
                </p>
              </div>

              {/* Recipient Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search recipient name, phone..."
                  value={recipientSearch}
                  onChange={(e) => {
                    setRecipientSearch(e.target.value);
                    setRecipientPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Recipient Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setRecipientStatusFilter('all');
                  setRecipientPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  recipientStatusFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Recipients ({statusCounts.total || recipientTotal})
              </button>

              <button
                onClick={() => {
                  setRecipientStatusFilter('delivered');
                  setRecipientPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  recipientStatusFilter === 'delivered'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <span>Delivered</span>
                <span>({statusCounts.delivered || 0})</span>
              </button>

              <button
                onClick={() => {
                  setRecipientStatusFilter('read');
                  setRecipientPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  recipientStatusFilter === 'read'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <span>Read</span>
                <span>({statusCounts.read || 0})</span>
              </button>

              <button
                onClick={() => {
                  setRecipientStatusFilter('replied');
                  setRecipientPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  recipientStatusFilter === 'replied'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                <span>Replied</span>
                <span>({statusCounts.replied || 0})</span>
              </button>

              <button
                onClick={() => {
                  setRecipientStatusFilter('pending');
                  setRecipientPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  recipientStatusFilter === 'pending'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Pending Queue</span>
                <span>({statusCounts.pending || 0})</span>
              </button>

              <button
                onClick={() => {
                  setRecipientStatusFilter('failed');
                  setRecipientPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  recipientStatusFilter === 'failed'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                <span>Failed</span>
                <span>({statusCounts.failed || 0})</span>
              </button>
            </div>

            {/* Recipient Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Recipient Name</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Batch #</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Sent At</th>
                    <th className="py-3 px-4">Delivered At</th>
                    <th className="py-3 px-4">Read At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recipientsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                        No recipient records matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    recipientsList.map((rcp) => (
                      <tr key={rcp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{rcp.name}</td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-700">{rcp.phone}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px]">
                            Batch {rcp.batchNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getRecipientStatusPill(rcp.status)}`}>
                            {rcp.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {rcp.sentAt ? new Date(rcp.sentAt).toLocaleTimeString() : '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {rcp.deliveredAt ? new Date(rcp.deliveredAt).toLocaleTimeString() : '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {rcp.readAt ? new Date(rcp.readAt).toLocaleTimeString() : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500 font-medium">
                Showing {recipientsList.length} of {recipientTotal.toLocaleString()} recipients (Page {recipientPage} of {recipientTotalPages})
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRecipientPage((p) => Math.max(1, p - 1))}
                  disabled={recipientPage <= 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => setRecipientPage((p) => Math.min(recipientTotalPages, p + 1))}
                  disabled={recipientPage >= recipientTotalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Main Grid: Message Preview & Configuration Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column (2 Cols): Audience & Campaign Settings */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Audience Details Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-red-600" />
                    <span>Audience Configuration</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                    {campaign.recipients.toLocaleString()} Contacts Targeted
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                    <span className="text-slate-400 uppercase font-bold text-[10px]">Audience Type</span>
                    <p className="font-extrabold text-sm text-slate-900 capitalize">{campaign.audienceType} Contacts</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                    <span className="text-slate-400 uppercase font-bold text-[10px]">Target Filter</span>
                    <p className="font-bold text-sm text-slate-900">
                      {campaign.audienceFilter?.tag
                        ? `Tag: ${campaign.audienceFilter.tag}`
                        : campaign.audienceFilter?.segment
                        ? `Segment: ${campaign.audienceFilter.segment}`
                        : campaign.audienceFilter?.status
                        ? `Status: ${campaign.audienceFilter.status}`
                        : 'All Active Contacts'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Template Configuration & Variable Mappings */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-red-600" />
                    <span>WhatsApp Template & Variable Mapping</span>
                  </h3>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    Approved Template
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-600">Template Name:</span>
                    <span className="font-mono font-bold text-slate-900">{campaign.templateName || 'ARCO Promo Alert'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-600">Language:</span>
                    <span className="font-bold text-slate-900">{campaign.templateLanguage} (English)</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-600">Category:</span>
                    <span className="font-bold text-slate-900">{campaign.templateCategory}</span>
                  </div>
                </div>
              </div>

              {/* Timeline Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span>Campaign Timeline</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Created:</span>
                    <span className="font-semibold text-slate-800">{new Date(campaign.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Scheduled For:</span>
                    <span className="font-semibold text-slate-800">{new Date(campaign.scheduledFor).toLocaleString()}</span>
                  </div>
                  {campaign.sentAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Sent At:</span>
                      <span className="font-semibold text-emerald-700">{new Date(campaign.sentAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column (1 Col): Realistic WhatsApp Message Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900">Live WhatsApp Preview</h3>
                <span className="text-[11px] font-semibold text-slate-400">Sample Contact View</span>
              </div>

              {/* Realistic Phone Mockup Frame */}
              <div className="w-full max-w-[320px] mx-auto bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-800">
                {/* Phone Speaker & Notch */}
                <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2.5" />

                {/* Inner Screen */}
                <div className="bg-[#EFEAE2] rounded-[28px] overflow-hidden flex flex-col min-h-[460px] relative font-sans text-xs">
                  
                  {/* WhatsApp App Header */}
                  <div className="bg-[#075E54] text-white px-3.5 py-2.5 flex items-center gap-2.5 shadow-xs">
                    <div className="w-7 h-7 rounded-full bg-white text-[#075E54] font-extrabold flex items-center justify-center text-[10px]">
                      A
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[11px] truncate">ARCO Communication</div>
                      <div className="text-[9px] text-emerald-200">Official Business Account ✓</div>
                    </div>
                  </div>

                  {/* Message Body Area */}
                  <div className="p-3 flex-1 flex flex-col justify-end space-y-2">
                    
                    {/* Timestamp Pill */}
                    <div className="self-center bg-white/80 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[9px] font-semibold text-slate-600 shadow-2xs">
                      TODAY
                    </div>

                    {/* WhatsApp Message Bubble */}
                    <div className="bg-white rounded-2xl rounded-tl-xs p-3 shadow-sm border border-slate-200/40 text-slate-800 space-y-2 max-w-[95%]">
                      <div className="font-bold text-xs text-slate-900">
                        {campaign.templateName || 'Exciting Promo Alert'}
                      </div>
                      
                      <p className="text-[11px] leading-relaxed text-slate-700">
                        Hi Ramesh! We have an exclusive update for your business. Unlock high-conversion WhatsApp automation and broadcast campaigns today with promo code <strong>ARCO2026</strong>.
                      </p>

                      <div className="text-[9px] text-slate-400 border-t border-slate-100 pt-1">
                        ARCO Communication · Reply STOP to opt-out
                      </div>

                      <div className="text-[9px] text-slate-400 text-right">
                        10:30 AM ✓✓
                      </div>
                    </div>

                    {/* CTA Buttons in Preview */}
                    <div className="space-y-1">
                      <div className="bg-white rounded-xl py-2 px-3 text-center text-[11px] font-bold text-[#00A884] shadow-xs border border-slate-200/50 flex items-center justify-center gap-1.5">
                        <ExternalLink className="w-3 h-3" />
                        <span>Claim Offer</span>
                      </div>
                      <div className="bg-white rounded-xl py-2 px-3 text-center text-[11px] font-bold text-[#00A884] shadow-xs border border-slate-200/50 flex items-center justify-center gap-1.5">
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat with Sales</span>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">Delete Campaign?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <strong>"{campaign.name}"</strong>? This will permanently remove campaign records and queue logs from PostgreSQL.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                Yes, Delete
              </button>
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
