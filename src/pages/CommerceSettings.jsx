import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Upload,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Play,
  X,
  FileSpreadsheet,
  Check,
  Search,
  Package,
  Layers,
  Sparkles,
  Info,
  MessageSquare,
  Send,
  Zap,
  Bot,
  Sliders,
  DollarSign,
  HelpCircle,
  ShoppingBag,
  Star,
  RefreshCw,
  LogOut,
  IndianRupee,
  Eye,
  Trash2,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { commerceService } from '../services/commerceService';

// WhatsApp SVG Icon
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function CommerceSettings() {
  const { user, businessSetup, logout } = useOnboarding();
  const userName = businessSetup?.companyName || user?.name || 'Business Owner';

  // Navigation profile dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Top Banner Dismissal State (Persisted in localStorage)
  const [bannerVisible, setBannerVisible] = useState(() => {
    return localStorage.getItem('arco_commerce_banner_dismissed') !== 'true';
  });

  // Accordions open/close state (Section 1 open by default)
  const [openSections, setOpenSections] = useState({
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  });

  const toggleSection = (num) => {
    if (num === 6) return; // Disabled Coming Soon
    setOpenSections((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  // Commerce Data State
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    catalogConnected: false,
    catalogId: '',
    catalogName: '',
    catalogStatus: 'disconnected',
    productCount: 0,
    connectedAt: null,
    messageSettings: {
      title: 'Explore our Latest Products',
      body: 'Browse our complete store catalog and place orders directly on WhatsApp with free delivery.',
      cta: 'View Catalog',
      enabled: true,
    },
    campaignSettings: {
      catalogId: '',
      campaignName: 'Spring Launch Collection',
      enabled: true,
    },
    autoReplySettings: {
      keywords: ['catalog', 'products', 'price', 'menu', 'store', 'buy'],
      replyText: 'Here is our product catalogue! Tap below to view items and place your order.',
      enabled: true,
    },
    autocheckoutSettings: {
      enabled: true,
      paymentMode: 'cod_and_upi',
      orderConfirmationMsg: 'Thank you for your order! Our team will process and ship your items shortly.',
    },
  });

  // Products State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Catalog ID Input State
  const [catalogIdInput, setCatalogIdInput] = useState('');
  const [isConnectingCatalog, setIsConnectingCatalog] = useState(false);
  const [isDisconnectingCatalog, setIsDisconnectingCatalog] = useState(false);

  // CSV Upload State
  const fileInputRef = useRef(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);

  // Message Configuration Form State
  const [msgTitle, setMsgTitle] = useState('Explore our Latest Products');
  const [msgBody, setMsgBody] = useState('Browse our complete store catalog and place orders directly on WhatsApp with free delivery.');
  const [msgCta, setMsgCta] = useState('View Catalog');
  const [msgEnabled, setMsgEnabled] = useState(true);
  const [isSavingMsg, setIsSavingMsg] = useState(false);

  // Auto Reply Form State
  const [autoReplyKeywords, setAutoReplyKeywords] = useState('catalog, products, price, menu, store, buy');
  const [autoReplyText, setAutoReplyText] = useState('Here is our product catalogue! Tap below to view items and place your order.');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [isSavingAutoReply, setIsSavingAutoReply] = useState(false);

  // Autocheckout Form State
  const [autocheckoutEnabled, setAutocheckoutEnabled] = useState(true);
  const [autocheckoutPaymentMode, setAutocheckoutPaymentMode] = useState('cod_and_upi');
  const [autocheckoutMsg, setAutocheckoutMsg] = useState('Thank you for your order! Our team will process and ship your items shortly.');
  const [isSavingAutocheckout, setIsSavingAutocheckout] = useState(false);

  // Modals
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Toast State
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside() {
      setProfileDropdownOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch initial Commerce Settings from Backend
  const loadCommerceSettings = async () => {
    try {
      const data = await commerceService.getSettings();
      if (data) {
        setSettings(data);
        setCatalogIdInput(data.catalogId || '');
        if (data.messageSettings) {
          setMsgTitle(data.messageSettings.title || 'Explore our Latest Products');
          setMsgBody(data.messageSettings.body || 'Browse our complete store catalog and place orders directly on WhatsApp with free delivery.');
          setMsgCta(data.messageSettings.cta || 'View Catalog');
          setMsgEnabled(data.messageSettings.enabled !== false);
        }
        if (data.autoReplySettings) {
          const kw = Array.isArray(data.autoReplySettings.keywords)
            ? data.autoReplySettings.keywords.join(', ')
            : 'catalog, products, price, menu, store, buy';
          setAutoReplyKeywords(kw);
          setAutoReplyText(data.autoReplySettings.replyText || 'Here is our product catalogue! Tap below to view items and place your order.');
          setAutoReplyEnabled(data.autoReplySettings.enabled !== false);
        }
        if (data.autocheckoutSettings) {
          setAutocheckoutEnabled(data.autocheckoutSettings.enabled !== false);
          setAutocheckoutPaymentMode(data.autocheckoutSettings.paymentMode || 'cod_and_upi');
          setAutocheckoutMsg(data.autocheckoutSettings.orderConfirmationMsg || 'Thank you for your order! Our team will process and ship your items shortly.');
        }
      }
    } catch (err) {
      console.error('Failed to load commerce settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Catalog Products
  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const prods = await commerceService.getProducts();
      setProducts(prods || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    loadCommerceSettings();
    loadProducts();
  }, []);

  // Dismiss Top Banner
  const handleDismissBanner = () => {
    setBannerVisible(false);
    localStorage.setItem('arco_commerce_banner_dismissed', 'true');
  };

  // Connect Catalog ID Handler
  const handleConnectCatalog = async (e) => {
    e.preventDefault();
    if (!catalogIdInput.trim()) {
      showToast('Please enter a valid Facebook Catalog ID', 'error');
      return;
    }

    setIsConnectingCatalog(true);
    try {
      const res = await commerceService.connectCatalog(catalogIdInput.trim());
      showToast('Catalog connected successfully');
      setSettings((prev) => ({
        ...prev,
        catalogConnected: true,
        catalogId: catalogIdInput.trim(),
        catalogStatus: 'connected',
        connectedAt: new Date().toISOString(),
      }));
    } catch (err) {
      showToast(err.message || 'Failed to connect catalog', 'error');
    } finally {
      setIsConnectingCatalog(false);
    }
  };

  // Disconnect Catalog Handler
  const handleDisconnectCatalog = async () => {
    setIsDisconnectingCatalog(true);
    try {
      await commerceService.disconnectCatalog();
      showToast('Catalog disconnected successfully');
      setCatalogIdInput('');
      setSettings((prev) => ({
        ...prev,
        catalogConnected: false,
        catalogId: null,
        catalogStatus: 'disconnected',
        connectedAt: null,
      }));
    } catch (err) {
      showToast('Failed to disconnect catalog', 'error');
    } finally {
      setIsDisconnectingCatalog(false);
    }
  };

  // Upload CSV Handler
  const handleCsvFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      showToast('Invalid file format. Please upload a .csv file.', 'error');
      e.target.value = null;
      return;
    }

    setUploadingCsv(true);
    try {
      const text = await file.text();
      const res = await commerceService.uploadCsv(text);
      showToast(`CSV uploaded successfully — ${res.data?.imported || 0} products imported.`);
      loadCommerceSettings();
      loadProducts();
    } catch (err) {
      showToast(err.message || 'Failed to upload CSV', 'error');
    } finally {
      setUploadingCsv(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  // Save Message Configuration
  const handleSaveMessageSettings = async (e) => {
    e.preventDefault();
    setIsSavingMsg(true);
    try {
      const payload = {
        messageSettings: {
          title: msgTitle.trim(),
          body: msgBody.trim(),
          cta: msgCta.trim(),
          enabled: msgEnabled,
        },
      };
      await commerceService.updateSettings(payload);
      showToast('Catalog message configuration saved successfully');
    } catch (err) {
      showToast('Failed to save message configuration', 'error');
    } finally {
      setIsSavingMsg(false);
    }
  };

  // Save Auto-Reply Settings
  const handleSaveAutoReplySettings = async (e) => {
    e.preventDefault();
    setIsSavingAutoReply(true);
    try {
      const keywordsArray = autoReplyKeywords
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k.length > 0);

      const payload = {
        autoReplySettings: {
          keywords: keywordsArray,
          replyText: autoReplyText.trim(),
          enabled: autoReplyEnabled,
        },
      };
      await commerceService.updateSettings(payload);
      showToast('Auto-reply catalog configuration saved successfully');
    } catch (err) {
      showToast('Failed to save auto-reply settings', 'error');
    } finally {
      setIsSavingAutoReply(false);
    }
  };

  // Save Autocheckout Settings
  const handleSaveAutocheckoutSettings = async (e) => {
    e.preventDefault();
    setIsSavingAutocheckout(true);
    try {
      const payload = {
        autocheckoutSettings: {
          enabled: autocheckoutEnabled,
          paymentMode: autocheckoutPaymentMode,
          orderConfirmationMsg: autocheckoutMsg.trim(),
        },
      };
      await commerceService.updateSettings(payload);
      showToast('Autocheckout settings saved successfully');
    } catch (err) {
      showToast('Failed to save autocheckout settings', 'error');
    } finally {
      setIsSavingAutocheckout(false);
    }
  };

  // Filtered Products for Catalog Modal
  const filteredProducts = products.filter((p) => {
    const q = catalogSearch.toLowerCase();
    return (
      (p.title || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.external_product_id || '').toLowerCase().includes(q)
    );
  });

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
              <span className="text-slate-500">WhatsApp Commerce</span>
              <span>/</span>
              <span className="text-slate-900 font-bold">Commerce Settings</span>
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
                      to="/tasks"
                      className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50"
                    >
                      Tasks
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

          {/* 2. GREEN INFORMATION BANNER (Dismissible + Persisted) */}
          {bannerVisible && (
            <div className="bg-emerald-50 border-b border-emerald-200/80 px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-xs text-emerald-900 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 font-medium">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  We've added sample products for you in sandbox mode. Please connect your own number to sync your own product catalogue
                </span>
              </div>
              <button
                onClick={handleDismissBanner}
                className="p-1 rounded-lg text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100/60 transition-colors cursor-pointer shrink-0"
                title="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 3. MAIN PAGE CONTENT */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 flex flex-col max-w-5xl w-full mx-auto">
            
            {/* PAGE HEADER: Commerce Settings + Feedback Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Commerce Settings
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Set up WhatsApp Catalog Messages for your account
                </p>
              </div>

              <button
                onClick={() => setFeedbackModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0d3b30] self-start sm:self-auto cursor-pointer"
              >
                <span>Give your Feedback</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* HERO SECTION: Start Selling on WhatsApp! + Instructional Video Preview */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Left Column: Heading + Description + Learn More Button */}
              <div className="md:col-span-7 space-y-3.5">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Start Selling on WhatsApp!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  You can send Catalogs to customers as part of campaigns & autoreplies. They can then place orders via Carts.
                </p>
                <div>
                  <button
                    onClick={() => setLearnMoreOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Learn More</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Instructional Video Card / Play Button */}
              <div className="md:col-span-5">
                <div
                  onClick={() => setVideoModalOpen(true)}
                  className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-200 shadow-md group cursor-pointer flex items-center justify-center"
                >
                  <img
                    src="https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=60"
                    alt="WhatsApp Catalog Tutorial"
                    className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute w-12 h-12 rounded-full bg-white/95 text-[#0d3b30] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
                    <span className="truncate">How to set up WhatsApp Commerce Catalog</span>
                    <span className="px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-semibold">2:45 min</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* 4. MAIN SETUP ACCORDIONS (6 Numbered Sections)                            */}
            {/* ========================================================================= */}
            <div className="space-y-4">
              
              {/* SECTION 1: 1 Add products to your WhatsApp Store (Expanded by default) */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden transition-all">
                
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(1)}
                  className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-[#0d3b30] text-emerald-300 flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
                      1
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                        Add products to your WhatsApp Store
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Import product CSV or connect your Meta Facebook Catalog
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {settings.catalogConnected && (
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Connected ({settings.productCount} products)</span>
                      </span>
                    )}
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                        openSections[1] ? 'rotate-180 text-slate-800' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Accordion Body */}
                {openSections[1] && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 space-y-6 border-t border-slate-100 animate-in fade-in duration-150">
                    
                    {/* CSV Upload Section */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                          Create your catalog
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Add your products to the CSV and upload it here
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept=".csv"
                          onChange={handleCsvFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingCsv}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingCsv ? 'Uploading...' : 'Upload CSV'}</span>
                        </button>
                      </div>
                    </div>

                    {/* OR Separator */}
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                      </div>
                      <span className="relative px-4 bg-white text-xs font-bold text-slate-400 uppercase tracking-wider">
                        OR
                      </span>
                    </div>

                    {/* Facebook Catalog Setup Options A, B, C, D */}
                    <div className="space-y-3.5 text-xs">
                      
                      {/* A. Set up FB Catalog & Collections */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors gap-3">
                        <div>
                          <div className="font-bold text-slate-900">
                            A. Set up FB Catalog & Collections
                          </div>
                          <div className="text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <span>via Google Sheets | Shopify</span>
                            <Play className="w-3 h-3 text-slate-400 fill-current" />
                          </div>
                        </div>
                        <a
                          href="https://business.facebook.com/commerce_manager/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold self-start sm:self-auto cursor-pointer"
                        >
                          <span>Go to FB</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>

                      {/* B. Give Catalog Access to ARCO Partner */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors gap-3">
                        <div>
                          <div className="font-bold text-slate-900">
                            B. Give Catalog Access to ARCO Partner
                          </div>
                          <div className="text-slate-500 mt-0.5">
                            Add ARCO Partner (928974617157828) as Catalog Partner
                          </div>
                        </div>
                        <a
                          href="https://business.facebook.com/settings/partners"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold self-start sm:self-auto cursor-pointer"
                        >
                          <span>Go to FB</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>

                      {/* C. Connect your Catalog to your WhatsApp account */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors gap-3">
                        <div>
                          <div className="font-bold text-slate-900">
                            C. Connect your Catalog to your WhatsApp account
                          </div>
                          <div className="text-slate-500 mt-0.5">
                            Go here and follow the steps shown in the video
                          </div>
                        </div>
                        <a
                          href="https://business.facebook.com/wa/manage/catalogs"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold self-start sm:self-auto cursor-pointer"
                        >
                          <span>Go to FB</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>

                      {/* D. Enter Facebook Catalog ID */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div>
                          <div className="font-bold text-slate-900">
                            D. Enter Facebook Catalog ID
                          </div>
                          <div className="text-slate-500 mt-0.5">
                            We will fetch products from this catalog
                          </div>
                        </div>

                        {settings.catalogConnected ? (
                          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-emerald-200">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <div>
                                <div className="font-bold text-slate-900 text-xs">
                                  Connected Catalog: <span className="font-mono text-emerald-800">{settings.catalogId}</span>
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {settings.productCount} active products in database
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleDisconnectCatalog}
                              disabled={isDisconnectingCatalog}
                              className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer"
                            >
                              {isDisconnectingCatalog ? 'Disconnecting...' : 'Disconnect'}
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleConnectCatalog} className="flex flex-wrap items-center gap-2">
                            <input
                              type="text"
                              required
                              placeholder="Enter Catalog ID (e.g. cat_9082410291)"
                              value={catalogIdInput}
                              onChange={(e) => setCatalogIdInput(e.target.value)}
                              className="flex-1 min-w-[200px] px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <button
                              type="submit"
                              disabled={isConnectingCatalog}
                              className="px-5 py-2 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isConnectingCatalog ? 'Connecting...' : 'Connect'}
                            </button>
                          </form>
                        )}
                      </div>

                    </div>

                    {/* View Catalog Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">
                        View your catalog here
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          loadProducts();
                          setCatalogModalOpen(true);
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Open Catalog ({settings.productCount})</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>

              {/* SECTION 2: 2 Setup Messages for Product Collections & Catalogs (Collapsed by default) */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleSection(2)}
                  className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-[#0d3b30] text-emerald-300 flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
                      2
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                        Setup Messages for Product Collections & Catalogs
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Customize WhatsApp interactive catalog message templates and button CTA
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                      openSections[2] ? 'rotate-180 text-slate-800' : ''
                    }`}
                  />
                </button>

                {openSections[2] && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-3">
                      
                      {/* Left: Message Settings Form */}
                      <form onSubmit={handleSaveMessageSettings} className="md:col-span-7 space-y-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                            Message Header / Title
                          </label>
                          <input
                            type="text"
                            value={msgTitle}
                            onChange={(e) => setMsgTitle(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                            Message Body
                          </label>
                          <textarea
                            rows={3}
                            value={msgBody}
                            onChange={(e) => setMsgBody(e.target.value)}
                            className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                              CTA Button Text
                            </label>
                            <input
                              type="text"
                              value={msgCta}
                              onChange={(e) => setMsgCta(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                              Collection
                            </label>
                            <select className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold">
                              <option value="all">All Products ({settings.productCount})</option>
                              <option value="featured">Featured Collection</option>
                              <option value="new">New Arrivals</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={msgEnabled}
                              onChange={(e) => setMsgEnabled(e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-bold text-slate-700">Enable Catalog Messages</span>
                          </label>

                          <button
                            type="submit"
                            disabled={isSavingMsg}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            {isSavingMsg ? 'Saving...' : 'Save Settings'}
                          </button>
                        </div>
                      </form>

                      {/* Right: WhatsApp Phone Preview Mockup */}
                      <div className="md:col-span-5 bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col justify-center items-center">
                        <div className="w-full max-w-[240px] bg-[#0b141a] p-3 rounded-2xl text-white shadow-xl space-y-2 text-[11px]">
                          <div className="bg-[#005c4b] p-3 rounded-xl rounded-tr-none space-y-1.5 shadow-sm text-emerald-50">
                            <div className="font-bold text-white text-xs">{msgTitle || 'Explore our Catalog'}</div>
                            <p className="text-[10px] text-emerald-100 leading-snug">{msgBody || 'Browse products and place orders...'}</p>
                            <div className="pt-2 border-t border-emerald-600/60 flex items-center justify-center gap-1 text-[11px] font-bold text-white bg-black/20 py-1.5 rounded-lg mt-1">
                              <ShoppingBag className="w-3 h-3" />
                              <span>{msgCta || 'View Catalog'}</span>
                            </div>
                          </div>
                          <div className="text-[9px] text-slate-400 text-right">12:30 PM ✓✓</div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold mt-2">Live WhatsApp Message Preview</span>
                      </div>

                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: 3 Send out Catalogs in Campaigns (Collapsed by default) */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleSection(3)}
                  className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-[#0d3b30] text-emerald-300 flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
                      3
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                        Send out Catalogs in Campaigns
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Broadcast interactive catalog messages to segmented audiences and customer tags
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                      openSections[3] ? 'rotate-180 text-slate-800' : ''
                    }`}
                  />
                </button>

                {openSections[3] && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 space-y-4 animate-in fade-in duration-150 text-xs">
                    <p className="text-slate-600 leading-relaxed font-medium">
                      You can include your complete WhatsApp product catalog or specific product collections when sending bulk broadcasts. Customers who receive your campaign can browse products, add items to cart, and checkout instantly.
                    </p>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">Active Catalog: {settings.catalogName}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">Ready to broadcast to {settings.productCount} catalog products</div>
                      </div>
                      <Link
                        to="/campaigns"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Create Catalog Campaign ↗</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 4: 4 Send out Catalogs in Auto Replies (Collapsed by default) */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleSection(4)}
                  className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-[#0d3b30] text-emerald-300 flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
                      4
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                        Send out Catalogs in Auto Replies
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Trigger automated catalog sharing when customers ask for prices or products
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                      openSections[4] ? 'rotate-180 text-slate-800' : ''
                    }`}
                  />
                </button>

                {openSections[4] && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 space-y-4 animate-in fade-in duration-150 text-xs">
                    <form onSubmit={handleSaveAutoReplySettings} className="space-y-4">
                      <div>
                        <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                          Keyword Triggers (comma separated)
                        </label>
                        <input
                          type="text"
                          value={autoReplyKeywords}
                          onChange={(e) => setAutoReplyKeywords(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                          placeholder="e.g. catalog, menu, price, products, buy"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                          Auto-Reply Message Text
                        </label>
                        <textarea
                          rows={2}
                          value={autoReplyText}
                          onChange={(e) => setAutoReplyText(e.target.value)}
                          className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={autoReplyEnabled}
                            onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-bold text-slate-700">Enable Catalog Auto-Reply</span>
                        </label>

                        <button
                          type="submit"
                          disabled={isSavingAutoReply}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          {isSavingAutoReply ? 'Saving...' : 'Save Auto-Reply Settings'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* SECTION 5: 5 Help customers place orders with ARCO's Autocheckout Workflow (Collapsed by default) */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleSection(5)}
                  className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-[#0d3b30] text-emerald-300 flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
                      5
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                          Help customers place orders with ARCO's Autocheckout Workflow
                        </h3>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-50 text-blue-600 border border-blue-200 uppercase">
                          New
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Automate cart checkout, address verification, and payment link generation
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                      openSections[5] ? 'rotate-180 text-slate-800' : ''
                    }`}
                  />
                </button>

                {openSections[5] && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 space-y-4 animate-in fade-in duration-150 text-xs">
                    <form onSubmit={handleSaveAutocheckoutSettings} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                            Accepted Payment Modes
                          </label>
                          <select
                            value={autocheckoutPaymentMode}
                            onChange={(e) => setAutocheckoutPaymentMode(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold"
                          >
                            <option value="cod_and_upi">Cash on Delivery (CoD) & Instant UPI</option>
                            <option value="upi_only">Instant UPI / Payment Gateway Only</option>
                            <option value="cod_only">Cash on Delivery Only</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                            Address Collection
                          </label>
                          <select className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold">
                            <option value="auto">Automated Chatbot Prompt</option>
                            <option value="form">One-Click WhatsApp Webview Form</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">
                          Order Confirmation Message
                        </label>
                        <textarea
                          rows={2}
                          value={autocheckoutMsg}
                          onChange={(e) => setAutocheckoutMsg(e.target.value)}
                          className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={autocheckoutEnabled}
                            onChange={(e) => setAutocheckoutEnabled(e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-bold text-slate-700">Enable Autocheckout Workflow</span>
                        </label>

                        <button
                          type="submit"
                          disabled={isSavingAutocheckout}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          {isSavingAutocheckout ? 'Saving...' : 'Save Autocheckout Settings'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* SECTION 6: 6 See all enquiries & orders you get from customers (Coming Soon) */}
              <div className="bg-slate-50/70 rounded-3xl border border-slate-200/80 overflow-hidden opacity-80">
                <div className="p-5 sm:p-6 flex items-center justify-between text-left">
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center font-extrabold text-xs shrink-0">
                      6
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-700">
                        See all enquiries & orders you get from customers
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Centralized order tracking, payment reconciliation, and delivery status updates
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-600 uppercase tracking-wider">
                    Coming Soon
                  </span>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 5. MODALS & POPUPS                                                        */}
      {/* ========================================================================= */}

      {/* A. PRODUCT CATALOG SHOWCASE MODAL */}
      {catalogModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 max-h-[85vh] flex flex-col text-xs font-sans">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0d3b30] text-emerald-300 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">WhatsApp Product Catalog</h3>
                  <p className="text-[11px] text-slate-500">
                    {products.length} products available in store database
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCatalogModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by name, SKU, or brand..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Products Grid */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Package className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-bold">No products available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100">
                          <img
                            src={prod.image_link || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=60'}
                            alt={prod.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=60';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{prod.brand || 'ARCO'}</div>
                          <div className="font-bold text-slate-900 text-xs truncate mt-0.5">{prod.title}</div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{prod.description}</p>
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between font-bold">
                        <span className="text-emerald-700 text-xs">
                          ₹{parseFloat(prod.price || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {prod.availability || 'in stock'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-slate-500 text-[11px]">
                Showing {filteredProducts.length} of {products.length} products
              </span>
              <button
                type="button"
                onClick={() => setCatalogModalOpen(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* B. LEARN MORE MODAL */}
      {learnMoreOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0d3b30] text-emerald-300 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Selling on WhatsApp</h3>
                  <p className="text-[11px] text-slate-500">How ARCO WhatsApp Commerce works</p>
                </div>
              </div>
              <button
                onClick={() => setLearnMoreOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-slate-600 leading-relaxed font-medium">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="font-bold text-slate-900 text-xs">1. WhatsApp Product Catalogs</div>
                <p>Showcase up to 10,000 products directly inside WhatsApp without requiring customers to leave the chat.</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="font-bold text-slate-900 text-xs">2. Collections & Interactive Messages</div>
                <p>Organize products into collections (e.g. Summer Arrivals, Festive Deals) and broadcast them to segmented audiences.</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="font-bold text-slate-900 text-xs">3. Instant Cart & Checkout</div>
                <p>Customers can add multiple items to their native WhatsApp Cart and send you the order with delivery address in one tap.</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setLearnMoreOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* C. VIDEO TUTORIAL MODAL */}
      {videoModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="font-extrabold text-base text-slate-900">
                How to set up WhatsApp Commerce Catalog
              </div>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden relative flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1000&auto=format&fit=crop&q=80"
                alt="Walkthrough Video"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute p-4 text-center text-white bg-black/60 rounded-2xl max-w-md space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-sm">Interactive Tutorial Guide</h4>
                <p className="text-[11px] text-slate-300">
                  Follow steps 1 to 4 above: upload your product CSV, connect your Meta Catalog ID, and enable WhatsApp Catalog messages.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Walkthrough
              </button>
            </div>
          </div>
        </div>
      )}

      {/* D. FEEDBACK MODAL */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Commerce Feedback</h3>
              <button
                onClick={() => setFeedbackModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Help us improve ARCO WhatsApp Commerce. What features or integrations would you like to see next?
            </p>
            <textarea
              rows={3}
              placeholder="Write your feedback or feature suggestions..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFeedbackModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Thank you for your valuable feedback!');
                  setFeedbackModalOpen(false);
                }}
                className="px-4 py-1.5 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-bold rounded-xl shadow-xs"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
