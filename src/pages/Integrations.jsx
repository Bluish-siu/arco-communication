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
  Zap,
  MessageSquare,
  Send,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { integrationService } from '../services/integrationService';
import { isShopifyEmbedded, getShopifyParams } from '../utils/shopifyAppBridge';
import { launchInstagramConnect } from '../utils/metaSdk';
import ShopifyAutomationsManager from '../components/shopify/ShopifyAutomationsManager';
import ShopifyStorefrontWidgetManager from '../components/shopify/ShopifyStorefrontWidgetManager';

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

// Instagram Logo SVG
function InstagramLogo({ className = 'w-9 h-9' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// Facebook Icon SVG
function FacebookIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export default function Integrations() {
  const [searchParams] = useSearchParams();
  const { user } = useOnboarding();
  const isEmbedded = isShopifyEmbedded();
  const { shop: embeddedShop } = getShopifyParams();

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

  // Instagram Connection State
  const [instagramStatus, setInstagramStatus] = useState({
    connected: false,
    status: 'disconnected',
    pageId: null,
    pageName: null,
    instagramBusinessAccountId: null,
    instagramUsername: null,
    instagramName: null,
    profilePictureUrl: null,
  });
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);
  const [instagramModalTab, setInstagramModalTab] = useState('popup'); // 'popup' | 'direct' | 'test'
  const [igPageId, setIgPageId] = useState('');
  const [igPageName, setIgPageName] = useState('');
  const [igAccessToken, setIgAccessToken] = useState('');
  const [igAccountId, setIgAccountId] = useState('');
  const [igUsername, setIgUsername] = useState('');
  const [igTestRecipientId, setIgTestRecipientId] = useState('');
  const [igTestMessage, setIgTestMessage] = useState('Hello from ARCO Communication! 👋');
  const [igTestSending, setIgTestSending] = useState(false);
  const [igModalLoading, setIgModalLoading] = useState(false);
  const [igModalError, setIgModalError] = useState('');

  // Historical Sync State
  const [syncJob, setSyncJob] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);

  // Connect Modal State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isAutomationsModalOpen, setIsAutomationsModalOpen] = useState(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
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

  // Fetch Shopify & Instagram Integration Status from Backend
  const loadStatus = async () => {
    setLoading(true);
    try {
      const [shopifyData, igData] = await Promise.all([
        integrationService.getShopifyStatus().catch(() => null),
        integrationService.getInstagramStatus().catch(() => null),
      ]);
      if (shopifyData) setShopifyStatus(shopifyData);
      if (igData) setInstagramStatus(igData);
    } catch (err) {
      console.warn('[Integrations] Load status error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Shopify Historical Sync Progress from Backend
  const loadSyncStatus = async () => {
    try {
      const res = await integrationService.getShopifySyncStatus();
      if (res?.job) {
        setSyncJob(res.job);
      }
    } catch (err) {
      console.warn('[Integrations] Load sync status error:', err);
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

  // Load sync status when store is connected
  useEffect(() => {
    if (shopifyStatus.connected) {
      loadSyncStatus();
    }
  }, [shopifyStatus.connected]);

  // Poll sync progress while job is running or queued
  useEffect(() => {
    if (syncJob?.status === 'running' || syncJob?.status === 'queued') {
      const timer = setInterval(() => {
        loadSyncStatus();
      }, 2500);
      return () => clearInterval(timer);
    }
  }, [syncJob?.status]);

  // Trigger historical sync
  const handleStartSync = async (syncType = 'full') => {
    setSyncLoading(true);
    try {
      const res = await integrationService.startShopifySync(syncType);
      if (res?.success && res?.job) {
        setSyncJob(res.job);
        showToast(`Shopify ${syncType} sync started!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to start sync', 'error');
    } finally {
      setSyncLoading(false);
    }
  };

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

      // 2. Redirect browser to Shopify OAuth Authorization
      if (authUrl && authUrl.startsWith('https://')) {
        window.location.href = authUrl;
        return;
      }

      setModalError('Shopify API Key is not configured on the server. Please configure SHOPIFY_API_KEY in environment variables.');
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

  // Handle Connect Instagram via Facebook Login popup
  const handleConnectInstagramPopup = async () => {
    setIgModalLoading(true);
    setIgModalError('');
    try {
      const auth = await launchInstagramConnect();
      if (!auth?.accessToken) {
        throw new Error('No access token received from Facebook Login.');
      }
      const res = await integrationService.connectInstagramWithToken(auth.accessToken);
      if (res?.success) {
        showToast(`Connected Instagram account @${res.data?.instagramUsername || 'Business'}!`, 'success');
        setIsInstagramModalOpen(false);
        loadStatus();
      } else {
        setIgModalError(res?.error || 'Failed to link Instagram account.');
      }
    } catch (err) {
      if (err.code === 'USER_CANCELLED') {
        setIgModalError('Facebook Login popup was closed or cancelled.');
      } else {
        setIgModalError(err.message || 'Instagram connection failed. Please ensure your Instagram is connected to a Facebook Page.');
      }
    } finally {
      setIgModalLoading(false);
    }
  };

  // Handle Connect Instagram Direct (manual credentials)
  const handleConnectInstagramDirect = async (e) => {
    e.preventDefault();
    if (!igPageId.trim() || !igAccessToken.trim()) {
      setIgModalError('Page ID and Page Access Token are required.');
      return;
    }
    setIgModalLoading(true);
    setIgModalError('');
    try {
      const res = await integrationService.connectInstagramDirect({
        pageId: igPageId.trim(),
        pageName: igPageName.trim() || 'Connected Facebook Page',
        pageAccessToken: igAccessToken.trim(),
        igAccountId: igAccountId.trim() || undefined,
        igUsername: igUsername.trim() || undefined,
      });
      if (res?.success) {
        showToast(`Instagram account @${res.data?.instagramUsername || 'Business'} connected!`, 'success');
        setIsInstagramModalOpen(false);
        loadStatus();
      } else {
        setIgModalError(res?.error || 'Failed to connect direct credentials.');
      }
    } catch (err) {
      setIgModalError(err.message || 'Direct connection failed.');
    } finally {
      setIgModalLoading(false);
    }
  };

  // Handle Disconnect Instagram
  const handleDisconnectInstagram = async () => {
    if (!window.confirm('Are you sure you want to disconnect Instagram? Direct messages will no longer sync with your ARCO Team Inbox.')) {
      return;
    }
    setLoading(true);
    try {
      const res = await integrationService.disconnectInstagram();
      if (res.success) {
        setInstagramStatus({
          connected: false,
          status: 'disconnected',
          pageId: null,
          pageName: null,
          instagramBusinessAccountId: null,
          instagramUsername: null,
          instagramName: null,
          profilePictureUrl: null,
        });
        showToast('Instagram account disconnected.', 'info');
      } else {
        showToast(res.error || 'Failed to disconnect', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Disconnect failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Send Instagram Test DM
  const handleSendInstagramTestDM = async (e) => {
    e.preventDefault();
    if (!igTestRecipientId.trim() || !igTestMessage.trim()) {
      setIgModalError('Recipient ID (IGSID) and Message are required.');
      return;
    }
    setIgTestSending(true);
    setIgModalError('');
    try {
      const res = await integrationService.sendInstagramDirectTest(
        igTestRecipientId.trim(),
        igTestMessage.trim()
      );
      if (res?.success) {
        showToast('Instagram test DM dispatched successfully!', 'success');
        setIgTestRecipientId('');
      } else {
        setIgModalError(res?.error || 'Failed to dispatch Instagram test DM.');
      }
    } catch (err) {
      setIgModalError(err.message || 'Error dispatching Instagram test DM.');
    } finally {
      setIgTestSending(false);
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
    activeTab === 'free'; // Shopify & Instagram are Free plan

  const showShopifyCard = matchesSearch && matchesCategory && matchesTab;

  const matchesInstagramSearch =
    !searchQuery ||
    'instagram direct dm meta team inbox unified'.includes(searchQuery.toLowerCase().trim()) ||
    'marketing automation'.includes(searchQuery.toLowerCase().trim()) ||
    'helpdesk platform'.includes(searchQuery.toLowerCase().trim());

  const matchesInstagramCategory =
    selectedCategory === 'All Categories' ||
    selectedCategory === 'Marketing Automation' ||
    selectedCategory === 'Helpdesk Platform';

  const showInstagramCard = matchesInstagramSearch && matchesInstagramCategory && matchesTab;

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
                  2
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
                  2
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
            {(showShopifyCard || showInstagramCard) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* SHOPIFY SALES CHANNEL CARD */}
                {showShopifyCard && (
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

                        {loading ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full">
                            <RefreshCw className="w-2.5 h-2.5 animate-spin text-blue-600" />
                            Connecting...
                          </span>
                        ) : shopifyStatus.connected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Connected
                          </span>
                        ) : shopifyStatus.status === 'error' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-800 text-[11px] font-bold rounded-full">
                            <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                            Sync Needed
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

                    {/* Connected Store Metadata & Sync Box */}
                    {shopifyStatus.connected && (shopifyStatus.shopDomain || embeddedShop) && (
                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
                          <div className="flex items-center justify-between gap-1.5 text-[11px] font-bold text-emerald-900">
                            <div className="flex items-center gap-1.5 truncate">
                              <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{shopifyStatus.shopDomain || embeddedShop}</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0">
                              Shopify Connected
                            </span>
                          </div>
                          <div className="text-[10px] text-emerald-700 font-medium">
                            Status: Active Catalog & Order Webhooks
                          </div>
                        </div>

                        {/* Minimal Shopify Sync Progress Box */}
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span>Shopify Sync</span>
                              {syncJob?.status === 'running' && (
                                <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" />
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleStartSync('full')}
                              disabled={syncLoading || syncJob?.status === 'running'}
                              className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {syncLoading || syncJob?.status === 'running' ? 'Syncing...' : 'Sync Store'}
                            </button>
                          </div>

                          {/* Stage Progress Rows */}
                          <div className="space-y-1.5 text-[11px]">
                            {/* Customers */}
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="font-medium">Customers</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-700">
                                  {syncJob?.stage_progress?.customers?.processed ?? 0}
                                  {syncJob?.stage_progress?.customers?.total ? ` / ${syncJob.stage_progress.customers.total}` : ''}
                                </span>
                                {syncJob?.current_stage === 'customers' && syncJob?.status === 'running' ? (
                                  <span className="text-blue-600 font-semibold text-[10px]">Syncing...</span>
                                ) : (syncJob?.stage_progress?.customers?.processed > 0 || syncJob?.status === 'completed') ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </div>
                            </div>

                            {/* Products */}
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="font-medium">Products</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-700">
                                  {syncJob?.stage_progress?.products?.processed ?? 0}
                                  {syncJob?.stage_progress?.products?.total ? ` / ${syncJob.stage_progress.products.total}` : ''}
                                </span>
                                {syncJob?.current_stage === 'products' && syncJob?.status === 'running' ? (
                                  <span className="text-blue-600 font-semibold text-[10px]">Syncing...</span>
                                ) : (syncJob?.stage_progress?.products?.processed > 0 || syncJob?.status === 'completed') ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </div>
                            </div>

                            {/* Orders */}
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="font-medium">Orders</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-700">
                                  {syncJob?.stage_progress?.orders?.processed ?? 0}
                                  {syncJob?.stage_progress?.orders?.total ? ` / ${syncJob.stage_progress.orders.total}` : ''}
                                </span>
                                {syncJob?.current_stage === 'orders' && syncJob?.status === 'running' ? (
                                  <span className="text-blue-600 font-semibold text-[10px]">Syncing...</span>
                                ) : (syncJob?.stage_progress?.orders?.processed > 0 || syncJob?.status === 'completed') ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status footer line */}
                          <div className="pt-2 border-t border-slate-200/80 text-[10px]">
                            {syncJob?.status === 'running' ? (
                              <span className="text-blue-700 font-medium">
                                Status: Syncing {syncJob?.current_stage || 'data'}...
                              </span>
                            ) : syncJob?.status === 'completed' ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Shopify sync completed
                              </span>
                            ) : syncJob?.status === 'failed' ? (
                              <span className="text-red-600 font-medium truncate block">
                                Failed: {syncJob?.error || 'Sync encountered an error'}
                              </span>
                            ) : (
                              <span className="text-slate-500 font-medium">
                                Ready to import historical catalog & customer records
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Embedded Connecting Progress Box */}
                    {isEmbedded && loading && (
                      <div className="mt-4 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center gap-2 text-xs text-blue-800 font-medium">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
                        <span>Initializing session for {embeddedShop || 'Shopify Store'}...</span>
                      </div>
                    )}

                    {/* Embedded Session Error Box */}
                    {isEmbedded && !loading && !shopifyStatus.connected && (
                      <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{shopifyStatus.error || 'Shopify embedded handshake required'}</span>
                        </div>
                        <p className="text-[10px] text-amber-700 leading-tight">
                          Store: <span className="font-mono">{embeddedShop || shopifyStatus.shopDomain || 'Detected from Shopify Admin'}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Area */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    {shopifyStatus.connected ? (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setIsAutomationsModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>WhatsApp Automations</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsWidgetModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Storefront Widget</span>
                          </button>

                          <a
                            href={`https://${shopifyStatus.shopDomain || embeddedShop || 'myshopify.com'}/admin`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            Shopify Admin <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <button
                          type="button"
                          onClick={handleDisconnect}
                          disabled={loading}
                          className="px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : isEmbedded ? (
                      <>
                        <div className="text-[11px] font-medium text-slate-400">
                          {loading ? 'Authenticating...' : 'Embedded Mode'}
                        </div>

                        <button
                          type="button"
                          onClick={loadStatus}
                          disabled={loading}
                          className="inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-60"
                        >
                          {loading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3.5 h-3.5" />
                              Authorize & Sync
                            </>
                          )}
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
                )}

                {/* INSTAGRAM DIRECT & UNIFIED INBOX CARD */}
                {showInstagramCard && (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group">
                    {/* Top Bar: Logo + Badges */}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center p-2.5 shadow-2xs text-white">
                          <InstagramLogo className="w-9 h-9" />
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-extrabold uppercase tracking-wider rounded-md border border-purple-200/60">
                            Free
                          </span>

                          {loading ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin text-blue-600" />
                              Checking...
                            </span>
                          ) : instagramStatus.connected ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[11px] font-bold rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
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
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                          Instagram Direct & DMs
                        </h3>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                          Marketing Automation & Unified Inbox
                        </p>
                      </div>

                      {/* Description */}
                      <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                        Connect your Instagram Professional account via Facebook Login popup. Ingest customer direct messages and send replies straight from the Unified ARCO Team Inbox alongside WhatsApp.
                      </p>

                      {/* Connected Account Metadata Box */}
                      {instagramStatus.connected && (
                        <div className="mt-4 space-y-2.5">
                          <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-1">
                            <div className="flex items-center justify-between gap-1.5 text-[11px] font-bold text-purple-900">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="w-2 h-2 rounded-full bg-purple-600" />
                                <span className="truncate">@{instagramStatus.instagramUsername || 'Instagram Business'}</span>
                              </div>
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full shrink-0">
                                Meta Verified
                              </span>
                            </div>
                            <div className="text-[10px] text-purple-700 font-medium">
                              Page: {instagramStatus.pageName || 'Connected Facebook Page'}
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] space-y-1">
                            <div className="flex items-center justify-between text-slate-700 font-bold">
                              <span>Unified Inbox Live Sync</span>
                              <span className="text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Listening to DMs
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500">
                              Incoming customer DMs will automatically pop up in ARCO Team Inbox.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Area */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      {instagramStatus.connected ? (
                        <>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setInstagramModalTab('test');
                                setIsInstagramModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Test DM Dispatch</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setInstagramModalTab('popup');
                                setIsInstagramModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            >
                              <span>Settings</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={handleDisconnectInstagram}
                            disabled={loading}
                            className="px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="text-[11px] font-medium text-slate-400">
                            Official Meta Graph API
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setInstagramModalTab('popup');
                              setIgModalError('');
                              setIsInstagramModalOpen(true);
                            }}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 active:from-purple-800 active:to-rose-800 rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer"
                          >
                            Connect Instagram
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

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

      {/* 5. SHOPIFY CONNECT MODAL (STANDALONE ONLY) */}
      {!isEmbedded && isConnectModalOpen && (
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

      {/* Shopify WhatsApp Automations Modal */}
      {isAutomationsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-slate-50 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsAutomationsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <ShopifyAutomationsManager
              shopDomain={shopifyStatus.shopDomain || embeddedShop || 'arco-test-e2a1thrd.myshopify.com'}
              onToast={showToast}
            />
          </div>
        </div>
      )}

      {/* Shopify Storefront Widget & Buy Button Modal */}
      {isWidgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-slate-50 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsWidgetModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <ShopifyStorefrontWidgetManager
              shopDomain={shopifyStatus.shopDomain || embeddedShop || 'arco-test-e2a1thrd.myshopify.com'}
              onToast={showToast}
            />
          </div>
        </div>
      )}

      {/* Instagram Connect & Management Modal */}
      {isInstagramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => {
                setIsInstagramModalOpen(false);
                setIgModalError('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white p-2">
                <InstagramLogo className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {instagramStatus.connected ? 'Instagram Direct Settings' : 'Connect Instagram Professional'}
                </h3>
                <p className="text-xs text-slate-500">
                  Receive and reply to Instagram DMs inside ARCO Team Inbox
                </p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="mt-4 flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setInstagramModalTab('popup')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  instagramModalTab === 'popup'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Facebook Login
              </button>
              <button
                type="button"
                onClick={() => setInstagramModalTab('direct')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  instagramModalTab === 'direct'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Manual Token
              </button>
              {instagramStatus.connected && (
                <button
                  type="button"
                  onClick={() => setInstagramModalTab('test')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    instagramModalTab === 'test'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Test DM Dispatch
                </button>
              )}
            </div>

            {/* Error Banner */}
            {igModalError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{igModalError}</span>
              </div>
            )}

            {/* TAB 1: Facebook Login Popup */}
            {instagramModalTab === 'popup' && (
              <div className="mt-5 space-y-4">
                <div className="p-4 bg-blue-50/60 border border-blue-200/70 rounded-xl space-y-2 text-xs text-blue-900">
                  <div className="font-bold flex items-center gap-1.5">
                    <FacebookIcon className="w-4 h-4 text-[#1877F2]" />
                    <span>Official Facebook Login Popup</span>
                  </div>
                  <p className="text-blue-800 text-[11px] leading-relaxed">
                    Log in with Facebook to automatically detect your Facebook Pages and linked Instagram Business / Creator accounts with verified DM permissions.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[11px] text-slate-600">
                  <div className="font-bold text-slate-800">Requirements:</div>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Instagram account must be Professional (Business or Creator)</li>
                    <li>Connected to your Facebook Page in Instagram account settings</li>
                    <li>Message access allowed in Instagram App Settings &gt; Messages</li>
                  </ul>
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleConnectInstagramPopup}
                    disabled={igModalLoading}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] active:bg-[#1567d3] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {igModalLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Connecting with Facebook...</span>
                      </>
                    ) : (
                      <>
                        <FacebookIcon className="w-4 h-4" />
                        <span>Continue with Facebook</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Direct / Manual Credentials */}
            {instagramModalTab === 'direct' && (
              <form onSubmit={handleConnectInstagramDirect} className="mt-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Facebook Page ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 102938475610293"
                    value={igPageId}
                    onChange={(e) => setIgPageId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Page Access Token (Permanent or System User) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="EAAG..."
                    value={igAccessToken}
                    onChange={(e) => setIgAccessToken(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Instagram Business Account ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 178414000..."
                      value={igAccountId}
                      onChange={(e) => setIgAccountId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                    <span className="text-[10px] text-slate-400">Auto-detected if left empty</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Instagram Username (@handle)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. mybrand"
                      value={igUsername}
                      onChange={(e) => setIgUsername(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInstagramModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={igModalLoading}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {igModalLoading ? 'Saving...' : 'Verify & Connect'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: Test DM & Webhooks */}
            {instagramModalTab === 'test' && (
              <div className="mt-5 space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                  <div className="font-bold text-slate-800">ARCO Webhook URL for Meta App Dashboard:</div>
                  <div className="font-mono text-[11px] text-purple-700 break-all select-all bg-white p-2 rounded-lg border border-slate-200">
                    {window.location.origin}/api/instagram/webhook
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1">
                    Verify Token: <span className="font-mono font-bold text-slate-700">arco_meta_webhook_verify_secret_token</span>
                  </div>
                </div>

                <form onSubmit={handleSendInstagramTestDM} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Recipient Instagram-Scoped ID (IGSID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1234567890123456"
                      value={igTestRecipientId}
                      onChange={(e) => setIgTestRecipientId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                    <span className="text-[10px] text-slate-400">
                      Found in incoming webhook message when a user messages your account.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Message Text
                    </label>
                    <input
                      type="text"
                      value={igTestMessage}
                      onChange={(e) => setIgTestMessage(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={igTestSending}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {igTestSending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching DM...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Test DM</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
