import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Workflow,
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  XCircle,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Zap,
  Check,
  Send,
  ExternalLink,
  Info,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { flowsService } from '../services/flowsService';

// WhatsApp Contextual SVG Icon
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function FlowBroadcastDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, businessSetup, subscription, trialDaysRemaining } = useOnboarding();
  const userName = businessSetup?.companyName || user?.name || 'Business Owner';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [broadcast, setBroadcast] = useState(null);
  const [toast, setToast] = useState(null);

  // Recipient Queue & Delivery Log State
  const [recipientsList, setRecipientsList] = useState([]);
  const [recipientPage, setRecipientPage] = useState(1);
  const [recipientTotalPages, setRecipientTotalPages] = useState(1);
  const [recipientTotal, setRecipientTotal] = useState(0);
  const [recipientStatusFilter, setRecipientStatusFilter] = useState('all');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [statusCounts, setStatusCounts] = useState({});
  const [dispatchingNow, setDispatchingNow] = useState(false);
  const [selectedErrorRecipient, setSelectedErrorRecipient] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadBroadcast = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const data = await flowsService.getFlowBroadcast(id);
      if (data) {
        setBroadcast(data);
        if (data.metrics) {
          setStatusCounts(data.metrics);
        }
      } else {
        showToast('Broadcast not found', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to load broadcast details', 'error');
    } finally {
      setLoading(false);
      if (showSpinner) setRefreshing(false);
    }
  };

  const loadRecipients = async () => {
    try {
      const res = await flowsService.getFlowBroadcastRecipients(id, {
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
    loadBroadcast();
  }, [id]);

  useEffect(() => {
    loadRecipients();
  }, [id, recipientPage, recipientStatusFilter, recipientSearch]);

  // Polling for live status updates if status is Sending or Scheduled
  useEffect(() => {
    if (!broadcast) return;
    const status = (broadcast.status || '').toLowerCase();
    if (status === 'sending' || status === 'processing' || status === 'scheduled') {
      const interval = setInterval(() => {
        loadBroadcast();
        loadRecipients();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [broadcast?.status]);

  const handleSendNow = async () => {
    setDispatchingNow(true);
    try {
      const res = await flowsService.sendFlowBroadcastNow(id);
      showToast(res.message || 'Broadcast dispatch triggered successfully!');
      await loadBroadcast();
      await loadRecipients();
    } catch (err) {
      showToast(err.message || 'Failed to dispatch broadcast', 'error');
    } finally {
      setDispatchingNow(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'completed':
      case 'sent':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'scheduled':
      case 'active':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'sending':
      case 'processing':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'failed':
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRecipientStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'read':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-500" /> Read
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-500" /> Delivered
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <Send className="w-3 h-3 text-teal-500" /> Sent
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin text-amber-500" /> Processing
          </span>
        );
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-50 text-gray-600 border border-gray-200">
            <Clock className="w-3 h-3 text-gray-400" /> Queued
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-3 h-3 text-red-500" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex font-sans text-gray-800">
        <DashboardSidebar />
        <main className="flex-1 ml-14 min-w-0 p-8 flex items-center justify-center">
          <div className="flex items-center gap-3 text-xs text-gray-600 font-semibold">
            <RefreshCw className="w-5 h-5 animate-spin text-[#0d3b30]" />
            <span>Loading broadcast status & metrics...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!broadcast) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex font-sans text-gray-800">
        <DashboardSidebar />
        <main className="flex-1 ml-14 min-w-0 p-8 flex flex-col items-center justify-center space-y-4">
          <Workflow className="w-12 h-12 text-gray-300" />
          <h2 className="text-base font-bold text-gray-800">Flow Broadcast Not Found</h2>
          <Link
            to="/flows"
            className="px-3.5 py-1.5 bg-[#0d3b30] text-white rounded text-xs font-semibold hover:bg-[#154d3f] transition-colors"
          >
            Back to Flows
          </Link>
        </main>
      </div>
    );
  }

  const totalRecipients = broadcast.totalRecipients || broadcast.total_recipients || 0;
  const sentCount = statusCounts.sent || broadcast.sentCount || 0;
  const deliveredCount = statusCounts.delivered || broadcast.deliveredCount || 0;
  const readCount = statusCounts.read || broadcast.readCount || 0;
  const failedCount = statusCounts.failed || broadcast.failedCount || 0;
  const queuedCount = statusCounts.queued || 0;
  const progressPercent = totalRecipients > 0 ? Math.round(((sentCount + failedCount) / totalRecipients) * 100) : 0;
  const deliveryRate = sentCount > 0 ? Math.round(((deliveredCount + readCount) / sentCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-gray-800">
      {/* Toast */}
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

        <main className="flex-1 ml-14 min-w-0 flex flex-col bg-[#f8fafc] min-h-screen">
          {/* Top Header Navigation */}
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Link to="/dashboard" className="hover:text-gray-800 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-gray-500">Market</span>
              <span>/</span>
              <Link to="/flows" className="hover:text-gray-800 transition-colors">
                Flows
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium truncate max-w-[200px]">
                {broadcast.name || 'Broadcast Details'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  loadBroadcast(true);
                  loadRecipients();
                }}
                disabled={refreshing}
                className="h-8 px-3 rounded border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center gap-1.5 text-xs text-gray-600 cursor-pointer shadow-2xs"
                title="Refresh Status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#0d3b30]' : ''}`} />
                <span>Refresh</span>
              </button>

              <Link
                to="/flows"
                className="h-8 px-3 rounded border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center gap-1.5 text-xs text-gray-700 cursor-pointer shadow-2xs font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Link>
            </div>
          </header>

          {/* Page Body */}
          <div className="p-6 max-w-[1400px] w-full mx-auto space-y-5">
            {/* Broadcast Title Banner */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0d3b30] shrink-0 mt-0.5">
                  <Workflow className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                      {broadcast.name || 'Untitled Flow Broadcast'}
                    </h1>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                        broadcast.status
                      )}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {broadcast.status || 'Draft'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <WhatsAppIcon className="w-3 h-3 text-[#25D366]" />
                      Meta Flow Broadcast
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-3">
                    <span>Flow: <strong className="text-gray-700 font-semibold">{broadcast.flowName || 'ARCO'}</strong> (ID: {broadcast.flowId})</span>
                    <span>•</span>
                    <span>Created: {broadcast.createdAt ? new Date(broadcast.createdAt).toLocaleString() : 'Recently'}</span>
                    {broadcast.scheduledAt && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                          <Calendar className="w-3 h-3" /> Scheduled: {new Date(broadcast.scheduledAt).toLocaleString()}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start md:self-center">
                {((broadcast.status || '').toLowerCase() === 'scheduled' || (broadcast.status || '').toLowerCase() === 'draft') && (
                  <button
                    type="button"
                    onClick={handleSendNow}
                    disabled={dispatchingNow}
                    className="h-8 px-3.5 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-medium text-xs rounded shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${dispatchingNow ? 'animate-pulse' : ''}`} />
                    <span>{dispatchingNow ? 'Dispatching...' : 'Send Now'}</span>
                  </button>
                )}
                <Link
                  to="/flows/broadcast"
                  className="h-8 px-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-xs rounded shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Workflow className="w-3.5 h-3.5" />
                  <span>New Broadcast</span>
                </Link>
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-gray-700 flex items-center gap-2">
                  <span>Broadcast Delivery Progress</span>
                  {broadcast.status === 'Sending' && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 animate-pulse">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Live Dispatches
                    </span>
                  )}
                </span>
                <span className="text-gray-900 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${totalRecipients > 0 ? (sentCount / totalRecipients) * 100 : 0}%` }}
                  title={`Sent: ${sentCount}`}
                />
                <div
                  className="bg-red-500 h-full transition-all duration-500"
                  style={{ width: `${totalRecipients > 0 ? (failedCount / totalRecipients) * 100 : 0}%` }}
                  title={`Failed: ${failedCount}`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2">
                <span>{sentCount} of {totalRecipients} sent</span>
                {failedCount > 0 && <span className="text-red-600 font-semibold">{failedCount} failed</span>}
                <span>{totalRecipients - sentCount - failedCount} remaining in queue</span>
              </div>
            </div>

            {/* Metrics KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-2xs">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Audience</span>
                <div className="text-xl font-bold text-gray-900 mt-1">{totalRecipients}</div>
                <span className="text-[10px] text-gray-400">Total Valid CSV rows</span>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-2xs">
                <span className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider block">Dispatched</span>
                <div className="text-xl font-bold text-teal-700 mt-1">{sentCount}</div>
                <span className="text-[10px] text-teal-600 font-medium">Sent to WhatsApp</span>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-2xs">
                <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Delivered</span>
                <div className="text-xl font-bold text-emerald-700 mt-1">{deliveredCount}</div>
                <span className="text-[10px] text-emerald-600 font-medium">{deliveryRate}% Delivery Rate</span>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-2xs">
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">Read</span>
                <div className="text-xl font-bold text-blue-700 mt-1">{readCount}</div>
                <span className="text-[10px] text-blue-600 font-medium">Opened by User</span>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-2xs">
                <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider block">Failed</span>
                <div className="text-xl font-bold text-red-700 mt-1">{failedCount}</div>
                <span className="text-[10px] text-red-500">Error from Meta API</span>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-2xs">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Queued</span>
                <div className="text-xl font-bold text-gray-700 mt-1">{queuedCount}</div>
                <span className="text-[10px] text-gray-400">Awaiting processing</span>
              </div>
            </div>

            {/* Recipient Delivery Log Table Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gray-50/50">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Recipient Delivery Logs</h3>
                  <p className="text-[11px] text-gray-500">Inspect real-time dispatch state, Meta WAMID, and error details per recipient</p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2.5">
                  <div className="relative w-full sm:w-56">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search phone / name..."
                      value={recipientSearch}
                      onChange={(e) => {
                        setRecipientSearch(e.target.value);
                        setRecipientPage(1);
                      }}
                      className="h-8 pl-8 pr-3 rounded border border-gray-300 bg-white text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 w-full"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={recipientStatusFilter}
                      onChange={(e) => {
                        setRecipientStatusFilter(e.target.value);
                        setRecipientPage(1);
                      }}
                      className="h-8 pl-2.5 pr-7 rounded border border-gray-300 bg-white text-xs text-gray-700 focus:outline-none focus:border-gray-400 cursor-pointer appearance-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="queued">Queued</option>
                      <option value="processing">Processing</option>
                      <option value="sent">Sent</option>
                      <option value="delivered">Delivered</option>
                      <option value="read">Read</option>
                      <option value="failed">Failed</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-semibold text-gray-600">
                      <th className="py-3 px-4">Recipient Phone</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Delivery Status</th>
                      <th className="py-3 px-4">Meta Message ID (WAMID)</th>
                      <th className="py-3 px-4">Sent Time</th>
                      <th className="py-3 px-4">Error / Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                    {recipientsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400 text-xs">
                          No recipients found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      recipientsList.map((r) => {
                        const csvData = typeof r.csv_data === 'string' ? JSON.parse(r.csv_data || '{}') : r.csv_data || {};
                        return (
                          <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                            {/* Phone */}
                            <td className="py-3 px-4 font-mono font-semibold text-gray-900">
                              {r.phone_number}
                            </td>

                            {/* Contact Info */}
                            <td className="py-3 px-4">
                              <span className="text-gray-800 font-medium">
                                {r.contact_name || csvData.name || csvData.customer_name || '—'}
                              </span>
                              {csvData.email && (
                                <span className="block text-[11px] text-gray-400 font-normal">
                                  {csvData.email}
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4">
                              {getRecipientStatusBadge(r.status)}
                            </td>

                            {/* WAMID */}
                            <td className="py-3 px-4 font-mono text-[11px] text-gray-500 max-w-[180px] truncate" title={r.wamid || ''}>
                              {r.wamid ? r.wamid : '—'}
                            </td>

                            {/* Sent Time */}
                            <td className="py-3 px-4 text-[11px] text-gray-500">
                              {r.sent_at ? new Date(r.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                            </td>

                            {/* Error Details */}
                            <td className="py-3 px-4 text-[11px]">
                              {r.error_reason ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedErrorRecipient(r)}
                                  className="text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 px-2 py-1 rounded font-medium flex items-center gap-1.5 max-w-[280px] truncate cursor-pointer transition-colors text-left"
                                  title="Click to view full Meta diagnostic error details"
                                >
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                                  <span className="truncate">{r.error_reason}</span>
                                </button>
                              ) : r.status === 'sent' || r.status === 'delivered' || r.status === 'read' ? (
                                <span className="text-emerald-600 flex items-center gap-1 font-medium">
                                  <Check className="w-3 h-3" /> OK
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600 bg-gray-50/40">
                <span>Showing {recipientsList.length} of {recipientTotal} recipients</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={recipientPage <= 1}
                    onClick={() => setRecipientPage(prev => Math.max(1, prev - 1))}
                    className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 font-medium">Page {recipientPage} of {recipientTotalPages}</span>
                  <button
                    type="button"
                    disabled={recipientPage >= recipientTotalPages}
                    onClick={() => setRecipientPage(prev => Math.min(recipientTotalPages, prev + 1))}
                    className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Meta Error Diagnostics Modal */}
      {selectedErrorRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="text-sm font-bold text-gray-900">Meta API Error Diagnostics</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedErrorRecipient(null)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-gray-500 block mb-1 font-medium">Recipient Phone</span>
                <div className="font-mono bg-gray-50 p-2 rounded border border-gray-200 text-gray-900 font-semibold">
                  {selectedErrorRecipient.phone_number || selectedErrorRecipient.phone}
                </div>
              </div>

              <div>
                <span className="text-gray-500 block mb-1 font-medium">Full Meta Error Details</span>
                <div className="font-mono text-red-700 bg-red-50/60 p-3 rounded border border-red-100 leading-relaxed break-words">
                  {selectedErrorRecipient.error_reason || selectedErrorRecipient.error_message || 'Delivery failed'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500 block mb-1 font-medium">Error Code</span>
                  <div className="font-mono bg-gray-50 p-2 rounded border border-gray-200 text-gray-800">
                    {selectedErrorRecipient.error_code || '131005'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1 font-medium">Delivery Status</span>
                  <div className="font-mono bg-gray-50 p-2 rounded border border-gray-200 text-red-600 font-medium capitalize">
                    {selectedErrorRecipient.status}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-blue-800 leading-relaxed text-[11px]">
                <strong>Configuration Note:</strong> Error 131005 indicates Meta access permissions or WABA authorization restrictions. Check Meta Business Portfolio asset assignments and allowed phone numbers in Development mode.
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedErrorRecipient(null)}
                className="px-4 py-2 text-xs font-semibold bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-gray-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
