import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Download,
  Webhook,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Truck,
  CreditCard,
  User,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  X,
  Store,
  Eye,
  SlidersHorizontal,
  FileSpreadsheet,
  LogOut,
  IndianRupee,
  Calendar,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { commerceService } from '../services/commerceService';

export default function OrderPanel() {
  const { user, businessSetup, logout } = useOnboarding();
  const userName = businessSetup?.companyName || user?.name || 'Business Owner';

  // Navigation Profile Dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Orders and Pagination State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Filter States
  const [dateRange, setDateRange] = useState('all');
  const [orderStatus, setOrderStatus] = useState('All');
  const [paymentStatus, setPaymentStatus] = useState('All');
  const [fulfillmentStatus, setFulfillmentStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Commerce & Bot Integration Status
  const [commerceStatus, setCommerceStatus] = useState({
    catalogConnected: false,
    workflowStatus: 'draft',
    isLive: false,
  });

  // Selected Order for Details Drawer
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Webhook Modal State
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [webhookConfig, setWebhookConfig] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleOutsideClick() {
      setProfileDropdownOpen(false);
    }
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Fetch Commerce & Bot Status
  const loadCommerceStatus = async () => {
    try {
      const commSettings = await commerceService.getSettings();
      setCommerceStatus({
        catalogConnected: commSettings?.catalogConnected || false,
        workflowStatus: commSettings?.autocheckoutSettings?.enabled ? 'live' : 'draft',
        isLive: commSettings?.autocheckoutSettings?.enabled || false,
      });
    } catch (err) {
      console.warn('Failed to fetch commerce status:', err);
    }
  };

  // Fetch Orders from Backend API with Filters
  const loadOrders = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 20,
        dateRange,
        orderStatus,
        paymentStatus,
        fulfillmentStatus,
        search: searchTerm,
      };

      const res = await commerceService.getOrders(params);
      if (res && res.orders) {
        setOrders(res.orders);
        setPagination(res.pagination || { page: 1, limit: 20, total: res.orders.length, totalPages: 1 });
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Unable to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommerceStatus();
    loadOrders(1);
  }, [dateRange, orderStatus, paymentStatus, fulfillmentStatus]);

  // Handle Search Input Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders(1);
  };

  // Update Order Status directly from Drawer
  const handleUpdateOrderStatus = async (field, value) => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    try {
      const payload = { [field]: value };
      const updated = await commerceService.updateOrderStatus(selectedOrder.id, payload);
      showToast('Order status updated successfully');
      setSelectedOrder(updated);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Export CSV Handler
  const handleExportCsv = async () => {
    try {
      const params = new URLSearchParams({
        dateRange,
        orderStatus,
        paymentStatus,
        fulfillmentStatus,
        search: searchTerm,
      }).toString();

      window.open(`/api/commerce/orders/export?${params}`, '_blank');
      showToast('Exporting orders CSV...');
    } catch (err) {
      showToast('Failed to export CSV', 'error');
    }
  };

  // Load Webhook Config
  const handleOpenWebhookModal = async () => {
    setWebhookModalOpen(true);
    try {
      const config = await commerceService.getOrderWebhookConfig();
      setWebhookConfig(config);
    } catch (err) {
      showToast('Failed to load webhook configuration', 'error');
    }
  };

  // Regenerate Webhook Secret
  const handleRegenerateSecret = async () => {
    setIsRegeneratingKey(true);
    try {
      const res = await commerceService.regenerateOrderWebhookSecret();
      showToast('Webhook secret key regenerated');
      setWebhookConfig((prev) => ({ ...prev, secretKey: res.secretKey }));
    } catch (err) {
      showToast('Failed to regenerate secret', 'error');
    } finally {
      setIsRegeneratingKey(false);
    }
  };

  // Copy to Clipboard Helper
  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Format Helper for Order Status Badge
  const getOrderStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivered':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  // Format Helper for Payment Status Badge
  const getPaymentStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cod':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'refunded':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  // Format Helper for Fulfillment Status Badge
  const getFulfillmentStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'delivered':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'packed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // Helper to resolve order currency strictly from persisted order record
  const resolveOrderCurrency = (ord) => {
    if (ord?.currency && String(ord.currency).trim()) {
      return String(ord.currency).trim().toUpperCase();
    }
    return 'INR';
  };

  // Helper to format currency accurately preserving source currency without conversion
  const formatOrderCurrency = (amount, currency = 'INR') => {
    const num = parseFloat(amount || 0);
    const curr = String(currency || 'INR').trim().toUpperCase();

    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: '$',
      AUD: '$',
      SGD: '$',
      AED: 'AED ',
      INR: '₹',
    };

    if (curr === 'INR') {
      return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: num % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
    }

    const symbol = symbols[curr] || '';
    const formattedNum = num.toFixed(2);
    return `${curr} ${symbol}${formattedNum}`;
  };

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

      {/* Main Layout Shell */}
      <div className="flex-1 flex flex-row min-w-0">
        <DashboardSidebar />

        {/* Workspace Shell */}
        <main className="flex-1 ml-14 min-w-0 flex flex-col bg-slate-50/50 min-h-screen">
          
          {/* Top Header Navigation */}
          <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-2xs">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Link to="/dashboard" className="hover:text-slate-600 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-500">WhatsApp Commerce</span>
              <span>/</span>
              <span className="text-slate-900 font-bold">Order Panel</span>
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
                      to="/checkout-bot"
                      className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50"
                    >
                      Checkout Bot
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

          {/* Page Content Container */}
          <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col max-w-7xl w-full mx-auto space-y-5">
            
            {/* Page Header (Your Orders / Track your orders) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Your Orders
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Track your orders
                </p>
              </div>

              {/* Top Right Quick Stats */}
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <span className="text-xs font-bold text-slate-500">
                  Total Orders: <span className="text-slate-900 font-extrabold">{pagination.total}</span>
                </span>
              </div>
            </div>

            {/* FILTER TOOLBAR (Date Range ▼, Order Status ▼, Payment Status ▼, Fulfillment Status ▼ + Webhooks & Export) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
              
              {/* Left Side: 4 Dropdowns + Search Bar */}
              <div className="flex flex-wrap items-center gap-2.5">
                
                {/* 1. Date Range Dropdown */}
                <div className="relative">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="last7">Last 7 Days</option>
                    <option value="last30">Last 30 Days</option>
                    <option value="all">All Time</option>
                  </select>
                </div>

                {/* 2. Order Status Dropdown */}
                <div className="relative">
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="All">Order Status: All</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* 3. Payment Status Dropdown */}
                <div className="relative">
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="All">Payment Status: All</option>
                    <option value="Paid">Paid</option>
                    <option value="COD">COD</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                {/* 4. Fulfillment Status Dropdown */}
                <div className="relative">
                  <select
                    value={fulfillmentStatus}
                    onChange={(e) => setFulfillmentStatus(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="All">Fulfillment: All</option>
                    <option value="Unfulfilled">Unfulfilled</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Search Box */}
                <form onSubmit={handleSearchSubmit} className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search name, phone, order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </form>

              </div>

              {/* Right Side: Actions (Get Order Webhooks & Export CSV) */}
              <div className="flex items-center gap-2 self-start lg:self-auto">
                <button
                  type="button"
                  onClick={handleOpenWebhookModal}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Webhook className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Get Order Webhooks</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV ↗</span>
                </button>

                <button
                  type="button"
                  onClick={() => loadOrders(pagination.page)}
                  className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  title="Refresh orders"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

            </div>

            {/* LOADING STATE */}
            {loading && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs min-h-[380px] flex flex-col items-center justify-center p-12 space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-xs font-bold text-slate-500">Loading orders...</p>
              </div>
            )}

            {/* ERROR STATE */}
            {!loading && error && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs min-h-[380px] flex flex-col items-center justify-center p-12 space-y-4 text-center">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{error}</h3>
                  <p className="text-xs text-slate-500 mt-1">Please check your connection and try again.</p>
                </div>
                <button
                  type="button"
                  onClick={() => loadOrders(1)}
                  className="px-4 py-2 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* EMPTY STATE (Reference Layout) */}
            {!loading && !error && orders.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs min-h-[440px] flex flex-col items-center justify-center p-8 sm:p-16 text-center animate-in fade-in duration-200">
                
                {/* Store Icon */}
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <Store className="w-7 h-7 stroke-[1.75]" />
                </div>

                {!commerceStatus.catalogConnected ? (
                  <>
                    <h2 className="text-sm sm:text-base font-semibold text-slate-800 max-w-sm mb-5 leading-relaxed">
                      To see orders, please connect a catalog to ARCO and set the Auto Checkout Workflow live.
                    </h2>
                    <Link
                      to="/commerce-settings"
                      className="px-5 py-2.5 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Commerce Settings</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </>
                ) : (
                  <>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                      No orders found
                    </h2>
                    <p className="text-xs text-slate-500 max-w-sm mb-5">
                      {searchTerm || orderStatus !== 'All' || dateRange !== 'all'
                        ? 'No orders match your filter criteria. Try resetting the filters.'
                        : 'Orders placed by customers through your WhatsApp Checkout Bot will appear here in real time.'}
                    </p>
                    <Link
                      to="/checkout-bot"
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Open Checkout Bot</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </>
                )}

              </div>
            )}

            {/* DATA TABLE (When Orders Exist) */}
            {!loading && !error && orders.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    
                    {/* Table Headers */}
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4 font-extrabold">Customer Name</th>
                        <th className="py-3.5 px-4 font-extrabold">Cart Date</th>
                        <th className="py-3.5 px-4 font-extrabold">Order ID</th>
                        <th className="py-3.5 px-4 font-extrabold">Order Details</th>
                        <th className="py-3.5 px-4 font-extrabold">Order Status</th>
                        <th className="py-3.5 px-4 font-extrabold">Payment Status</th>
                        <th className="py-3.5 px-4 font-extrabold">Fulfillment Status</th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {orders.map((ord) => {
                        const items = Array.isArray(ord.items) ? ord.items : JSON.parse(ord.items || '[]');
                        const totalQty = items.reduce((acc, i) => acc + (i.qty || i.quantity || 1), 0);
                        const formattedCartDate = new Date(ord.cart_date || ord.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        });
                        const orderCurrency = resolveOrderCurrency(ord);

                        return (
                          <tr
                            key={ord.id}
                            onClick={() => {
                              setSelectedOrder(ord);
                              setDetailsDrawerOpen(true);
                            }}
                            className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                          >
                            
                            {/* Customer Name */}
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                                  {(ord.customer_name || 'C').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 text-xs">{ord.customer_name || 'Guest Customer'}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{ord.phone_number}</div>
                                </div>
                              </div>
                            </td>

                            {/* Cart Date */}
                            <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                              {formattedCartDate}
                            </td>

                            {/* Order ID */}
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-xs">
                              {ord.order_number}
                            </td>

                            {/* Order Details (Items count + Price) */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 text-xs">
                                {totalQty} {totalQty === 1 ? 'item' : 'items'} • {formatOrderCurrency(ord.total_amount, orderCurrency)}
                              </div>
                            </td>

                            {/* Order Status Badge */}
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getOrderStatusBadge(ord.order_status)}`}>
                                {ord.order_status || 'Confirmed'}
                              </span>
                            </td>

                            {/* Payment Status Badge */}
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getPaymentStatusBadge(ord.payment_status)}`}>
                                {ord.payment_status || 'COD'}
                              </span>
                            </td>

                            {/* Fulfillment Status Badge */}
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getFulfillmentStatusBadge(ord.fulfillment_status)}`}>
                                {ord.fulfillment_status || 'Unfulfilled'}
                              </span>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>

                  </table>
                </div>

                {/* PAGINATION CONTROLS */}
                <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                  <span>
                    Showing {((pagination.page - 1) * pagination.limit) + 1}–
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={pagination.page <= 1}
                      onClick={() => loadOrders(pagination.page - 1)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <span className="px-3 py-1.5 bg-slate-100 rounded-xl font-bold text-slate-800">
                      {pagination.page} / {pagination.totalPages || 1}
                    </span>

                    <button
                      type="button"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => loadOrders(pagination.page + 1)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 1. ORDER DETAILS SLIDE-OVER DRAWER                                        */}
      {/* ========================================================================= */}
      {detailsDrawerOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-slate-200 flex flex-col text-xs font-sans animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Order Details
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 font-mono">
                  #{selectedOrder.order_number}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailsDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* Status Update Controls */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  Update Statuses
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Order Status</label>
                    <select
                      value={selectedOrder.order_status || 'Confirmed'}
                      disabled={isUpdatingStatus}
                      onChange={(e) => handleUpdateOrderStatus('orderStatus', e.target.value)}
                      className="w-full p-2 text-xs rounded-xl border border-slate-300 font-semibold bg-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Payment</label>
                    <select
                      value={selectedOrder.payment_status || 'COD'}
                      disabled={isUpdatingStatus}
                      onChange={(e) => handleUpdateOrderStatus('paymentStatus', e.target.value)}
                      className="w-full p-2 text-xs rounded-xl border border-slate-300 font-semibold bg-white"
                    >
                      <option value="Paid">Paid</option>
                      <option value="COD">COD</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Fulfillment</label>
                    <select
                      value={selectedOrder.fulfillment_status || 'Unfulfilled'}
                      disabled={isUpdatingStatus}
                      onChange={(e) => handleUpdateOrderStatus('fulfillmentStatus', e.target.value)}
                      className="w-full p-2 text-xs rounded-xl border border-slate-300 font-semibold bg-white"
                    >
                      <option value="Unfulfilled">Unfulfilled</option>
                      <option value="Processing">Processing</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-2">
                <div className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  Customer Information
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs">{selectedOrder.customer_name}</div>
                  <div className="text-slate-600 font-mono text-[11px]">Phone: {selectedOrder.phone_number}</div>
                  {selectedOrder.customer_email && (
                    <div className="text-slate-600 text-[11px]">Email: {selectedOrder.customer_email}</div>
                  )}
                </div>
              </div>

              {/* Products Ordered */}
              <div className="space-y-2">
                <div className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  Products ({Array.isArray(selectedOrder.items) ? selectedOrder.items.length : JSON.parse(selectedOrder.items || '[]').length})
                </div>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {(Array.isArray(selectedOrder.items) ? selectedOrder.items : JSON.parse(selectedOrder.items || '[]')).map((item, idx) => {
                    const itemQty = item.qty || item.quantity || 1;
                    const selectedCurrency = resolveOrderCurrency(selectedOrder);
                    return (
                      <div key={idx} className="p-3 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                            <div className="text-[10px] text-slate-400">Qty: {itemQty} × {formatOrderCurrency(item.price, selectedCurrency)}</div>
                          </div>
                        </div>
                        <div className="font-extrabold text-slate-900 text-xs">
                          {formatOrderCurrency(parseFloat(item.price || 0) * itemQty, selectedCurrency)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Summary */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatOrderCurrency(selectedOrder.subtotal, resolveOrderCurrency(selectedOrder))}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee</span>
                  <span>{formatOrderCurrency(selectedOrder.shipping_charge, resolveOrderCurrency(selectedOrder))}</span>
                </div>
                {parseFloat(selectedOrder.discount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount</span>
                    <span>-{formatOrderCurrency(selectedOrder.discount, resolveOrderCurrency(selectedOrder))}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-emerald-700">{formatOrderCurrency(selectedOrder.total_amount, resolveOrderCurrency(selectedOrder))}</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-2">
                <div className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  Delivery Address
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1 text-slate-700">
                  <div className="font-bold text-slate-900">{selectedOrder.customer_name}</div>
                  <div>{selectedOrder.address}</div>
                  <div>{selectedOrder.city}, {selectedOrder.state} — {selectedOrder.pincode}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{selectedOrder.shipping_country || 'India'}</div>
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50/50">
              <button
                type="button"
                onClick={() => setDetailsDrawerOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ORDER WEBHOOK CONFIGURATION MODAL                                      */}
      {/* ========================================================================= */}
      {webhookModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 text-xs font-sans">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Webhook className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Order Webhooks</h3>
                  <p className="text-[10px] text-slate-400">Stream real-time order events to your backend</p>
                </div>
              </div>
              <button onClick={() => setWebhookModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {webhookConfig ? (
              <div className="space-y-4">
                
                {/* Webhook Endpoint URL */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Webhook Endpoint URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={webhookConfig.webhookUrl}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(webhookConfig.webhookUrl, 'Webhook URL')}
                      className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedField === 'Webhook URL' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                    </button>
                  </div>
                </div>

                {/* Secret Key */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">
                      Signing Secret Key
                    </label>
                    <button
                      type="button"
                      disabled={isRegeneratingKey}
                      onClick={handleRegenerateSecret}
                      className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      {isRegeneratingKey ? 'Regenerating...' : 'Regenerate'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={webhookConfig.secretKey}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(webhookConfig.secretKey, 'Secret Key')}
                      className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 cursor-pointer"
                      title="Copy Secret"
                    >
                      {copiedField === 'Secret Key' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                    </button>
                  </div>
                </div>

                {/* Supported Events */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                    Subscribed Order Events
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['order.created', 'order.confirmed', 'order.cancelled', 'order.paid', 'order.shipped', 'order.delivered'].map((ev) => (
                      <span key={ev} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">Loading config...</div>
            )}

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setWebhookModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
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
