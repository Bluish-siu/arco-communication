import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Layers,
  X,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  HelpCircle,
  Info,
  ShieldCheck,
  Store,
  Check,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { integrationService } from '../services/integrationService';

const ALL_CATEGORIES = [
  'All Categories',
  'e-Commerce Platform',
  'Payment Provider',
  'Marketing Automation',
  'Account Upgrades',
  'CRM Platform',
  'Others',
  'Connector Platform',
  'Data Storage',
  'Ads Platform',
  'Helpdesk Platform',
  'Billing Platform',
  'Product Review Platform',
  'Scheduling Automation Platform',
  'Accounting Software',
];

// Shopify Logo SVG
function ShopifyLogo({ className = 'w-9 h-9' }) {
  return (
    <svg className={className} viewBox="0 0 109.4 124.5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M74.6 15.6c-.4-.3-1-.3-1.4 0-.4.3-15.6 11.6-15.6 11.6s-10.4-7.5-11.4-8.2c-1-.7-3-.5-3.8.3L37.1 24.5s-6.3-4.7-9.5-7.1c-.8-.6-1.9-.4-2.5.3L1.5 45.4c-.6.7-.7 1.8-.2 2.6l49.9 74.8c.4.6 1.1 1 1.9 1s1.5-.4 1.9-1l52.7-74.8c.5-.8.4-1.9-.2-2.6L74.6 15.6z"
        fill="#95BF47"
      />
      <path
        d="M62.6 123.8l45.1-64.1c.5-.8.4-1.9-.2-2.6L74.6 15.6c-.4-.3-1-.3-1.4 0-.4.3-15.6 11.6-15.6 11.6l4.2 96.3c.3.2.5.3.8.3z"
        fill="#5E8E3E"
      />
      <path
        d="M57.6 27.2L42.4 19.3c-1-.7-3-.5-3.8.3L33.3 24.7l24.3 99.1 4.2-96.6s-1.8-1.5-4.2 0z"
        fill="#95BF47"
      />
      <path
        d="M51.3 47.9c-1.3 0-2.3 1-2.3 2.3 0 6.6 4.7 10.3 10.3 10.3 6.9 0 10.9-4.8 10.9-10.8 0-8.8-8.1-10.5-12.8-13.4-3.3-2-5.4-4-5.4-7.5 0-4.5 3.5-7.7 8.3-7.7 3.9 0 6.8 1.8 8.1 4.5.4.9 1.5 1.3 2.4.9l4.5-2.2c.8-.4 1.1-1.4.7-2.2-2.4-5.1-7.7-8.3-15.7-8.3-9.5 0-16.1 6.5-16.1 15 0 9.1 7.6 12.4 12.7 15.3 3.6 2.1 5.9 4.3 5.9 7.8 0 4.1-3.6 6.7-7.7 6.7-4.7 0-8.3-2.6-8.9-6.3-.2-.9-1-1.6-2-1.6l-5 .5z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export default function Integrations() {
  const [searchParams] = useSearchParams();
  const { user } = useOnboarding();

  // Filters State
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'free' | 'paid'
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Connection State
  const [loading, setLoading] = useState(true);
  const [shopifyStatus, setShopifyStatus] = useState({
    connected: false,
    shopDomain: null,
    shopName: null,
    status: 'disconnected',
    installedAt: null,
  });

  // Connect Modal State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [shopInput, setShopInput] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [toast, setToast] = useState(null);

  const categoryDropdownRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Shopify Integration Status from Backend
  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await integrationService.getShopifyStatus();
      setShopifyStatus(data);
    } catch (err) {
      console.warn('[Integrations] Load status error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();

    // Check if redirected from OAuth callback
    if (searchParams.get('shopify') === 'connected') {
      const shop = searchParams.get('shop');
      showToast(`Shopify Store ${shop ? `("${shop}")` : ''} connected successfully!`, 'success');
      loadStatus();
    } else if (searchParams.get('error')) {
      showToast(`Shopify connection failed: ${searchParams.get('error')}`, 'error');
    }
  }, [searchParams]);

  // Handle Connect Submission
  const handleConnectSubmit = async (e) => {
    e.preventDefault();
    if (!shopInput || !shopInput.trim()) {
      setModalError('Please enter your Shopify store domain');
      return;
    }

    setModalLoading(true);
    setModalError('');

    try {
      // 1. Get OAuth Authorization URL / validate shop
      const oauthRes = await integrationService.getShopifyOAuthUrl(shopInput.trim());
      if (!oauthRes.success) {
        setModalError(oauthRes.error || 'Failed to validate Shopify store domain');
        setModalLoading(false);
        return;
      }

      const { authUrl, shop } = oauthRes.data;

      // 2. If real OAuth redirect is configured, redirect browser to Shopify
      if (authUrl.startsWith('https://')) {
        window.location.href = authUrl;
        return;
      }

      // 3. Dev / Simulated direct OAuth exchange
      const connectRes = await integrationService.connectShopify({
        shop,
        shopName: shop.replace('.myshopify.com', ''),
      });

      if (connectRes.success) {
        setShopifyStatus({
          connected: true,
          shopDomain: shop,
          shopName: shop.replace('.myshopify.com', ''),
          status: 'connected',
          installedAt: new Date().toISOString(),
        });
        setIsConnectModalOpen(false);
        setShopInput('');
        showToast('Shopify Sales Channel connected successfully!', 'success');
      } else {
        setModalError(connectRes.error || 'Failed to complete Shopify connection');
      }
    } catch (err) {
      setModalError(err.message || 'Connection request failed. Please check the shop domain.');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Disconnect
  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Shopify Sales Channel? WhatsApp catalog sync and automated checkout will be paused.')) {
      return;
    }

    setLoading(true);
    try {
      const res = await integrationService.disconnectShopify();
      if (res.success) {
        setShopifyStatus({
          connected: false,
          shopDomain: null,
          shopName: null,
          status: 'disconnected',
          installedAt: null,
        });
        showToast('Shopify Sales Channel disconnected.', 'info');
      } else {
        showToast(res.error || 'Failed to disconnect', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Disconnect failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const matchesSearch =
    !searchQuery ||
    'shopify sales channel'.includes(searchQuery.toLowerCase().trim()) ||
    'e-commerce platform'.includes(searchQuery.toLowerCase().trim()) ||
    'whatsapp catalog store'.includes(searchQuery.toLowerCase().trim());

  const matchesCategory =
    selectedCategory === 'All Categories' ||
    selectedCategory === 'e-Commerce Platform';

  const matchesTab =
    activeTab === 'all' ||
    activeTab === 'free'; // Shopify is Free plan

  const showShopifyCard = matchesSearch && matchesCategory && matchesTab;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 relative">
      {/* 1. SIDEBAR NAVIGATION */}
      <DashboardSidebar />

      {/* 2. TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in slide-in-from-top-2 ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : toast.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 3. MAIN CONTENT */}
      <div className="flex-1 pl-14 sm:pl-16 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Integrations
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Connect ARCO with various applications
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadStatus}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors cursor-pointer"
                title="Refresh integration status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Top Filter & Search Controls (Interakt Reference Style) */}
          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Tabs: All Apps / Free Apps / Paid Apps */}
            <div className="flex items-center bg-slate-200/70 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Apps
                <span className="ml-1.5 px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[10px] rounded-full font-extrabold">
                  1
                </span>
              </button>
              <button
                onClick={() => setActiveTab('free')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'free'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Free Apps
                <span className="ml-1.5 px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] rounded-full font-extrabold">
                  1
                </span>
              </button>
              <button
                onClick={() => setActiveTab('paid')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'paid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paid Apps
                <span className="ml-1.5 px-1.5 py-0.2 bg-slate-100 text-slate-400 text-[10px] rounded-full font-extrabold">
                  0
                </span>
              </button>
            </div>

            {/* Right Controls: Category Dropdown & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              
              {/* Category Dropdown */}
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  type="button"
                  data-testid="category-dropdown-btn"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="w-full sm:w-56 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <span className="truncate">{selectedCategory}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-64 max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1.5 scrollbar-thin">
                    {ALL_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                          selectedCategory === cat ? 'bg-emerald-50/60 text-emerald-700 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search integration apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* 4. INTEGRATIONS GRID / CARDS */}
          <div className="mt-8">
            {showShopifyCard ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* SHOPIFY SALES CHANNEL CARD (Interakt Reference Replica) */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group">
                  
                  {/* Top Bar: Logo + Badges */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2.5 shadow-2xs">
                        <ShopifyLogo className="w-9 h-9" />
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider rounded-md border border-emerald-200/60">
                          Free
                        </span>

                        {shopifyStatus.connected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-full">
                            Disconnected
                          </span>
                        )}
                      </div>
                    </div>

                    {/* App Title & Category */}
                    <div className="mt-4">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        Shopify Sales Channel
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                        e-Commerce Platform
                      </p>
                    </div>

                    {/* Description */}
                    <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                      Auto-sync Shopify products & collections to WhatsApp, automate abandoned cart recovery drips, and process real-time catalog orders.
                    </p>

                    {/* Connected Store Metadata Box */}
                    {shopifyStatus.connected && shopifyStatus.shopDomain && (
                      <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900">
                          <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{shopifyStatus.shopDomain}</span>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-medium">
                          Status: Active Catalog & Order Webhooks
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Area */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    {shopifyStatus.connected ? (
                      <>
                        <a
                          href={`https://${shopifyStatus.shopDomain || 'myshopify.com'}/admin`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          Shopify Admin <ExternalLink className="w-3 h-3" />
                        </a>

                        <button
                          type="button"
                          onClick={handleDisconnect}
                          disabled={loading}
                          className="px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsConnectModalOpen(true)}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                          Know More
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsConnectModalOpen(true)}
                          disabled={loading}
                          className="inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer"
                        >
                          Connect
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>

                </div>

              </div>
            ) : (
              /* Empty State when non-matching filter is selected */
              <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-2xs">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-4">
                  No integrations found in this category
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {selectedCategory !== 'All Categories'
                    ? `There are no available integrations under "${selectedCategory}". Shopify is available under "e-Commerce Platform".`
                    : 'No integrations match your search criteria.'}
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('All Categories');
                      setActiveTab('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                  >
                    View All Apps
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 5. SHOPIFY CONNECT MODAL */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setIsConnectModalOpen(false);
                setModalError('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
                <ShopifyLogo className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Connect Shopify Store
                </h3>
                <p className="text-xs text-slate-500">
                  Enter your Shopify store domain to authorize ARCO
                </p>
              </div>
            </div>

            {/* Error Message */}
            {modalError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Connection Form */}
            <form onSubmit={handleConnectSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Shopify Store Domain <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="your-store-name.myshopify.com"
                    value={shopInput}
                    onChange={(e) => setShopInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Example: <span className="font-mono text-slate-600">brand-store.myshopify.com</span> or just <span className="font-mono text-slate-600">brand-store</span>
                </p>
              </div>

              {/* Information Highlights */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-slate-600 text-[11px]">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  What happens next?
                </div>
                <p className="leading-normal">
                  ARCO will redirect you to Shopify to securely authorize catalog syncing, order updates, and customer notifications.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsConnectModalOpen(false);
                    setModalError('');
                  }}
                  disabled={modalLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {modalLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Authorize & Connect
                      <ArrowRight className="w-3.5 h-3.5" />
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
