import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  HelpCircle,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
  Send,
  Zap,
  DollarSign,
  Truck,
  MapPin,
  User,
  CreditCard,
  Package,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Edit3,
  Save,
  RotateCcw,
  ExternalLink,
  MessageSquare,
  Bot,
  Info,
  Layers,
  X,
  Plus,
  RefreshCw,
  ShoppingBag,
  IndianRupee,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { checkoutBotService } from '../services/checkoutBotService';

export default function CheckoutBot() {
  const { user, businessSetup } = useOnboarding();
  const navigate = useNavigate();

  // Workflow State
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [workflow, setWorkflow] = useState(null);
  const [statusInfo, setStatusInfo] = useState({
    catalogConnected: false,
    catalogId: null,
    catalogName: 'ARCO Catalog',
    workflowStatus: 'draft',
    isLive: false,
    remainingSteps: 3,
    totalSteps: 3,
    stats: { totalSessions: 0, completedOrders: 0, totalRevenue: 0 },
  });

  // Editable Message Templates & Settings
  const [cartConfirmationMsg, setCartConfirmationMsg] = useState('');
  const [cancellationMsg, setCancellationMsg] = useState('');
  const [orderConfirmationMsg, setOrderConfirmationMsg] = useState('');
  const [orderPlacedMsg, setOrderPlacedMsg] = useState('');
  const [shippingConfig, setShippingConfig] = useState({
    freeShippingThreshold: 0,
    defaultShippingCharge: 0,
    discountType: 'percentage',
    discountValue: 0,
  });
  const [paymentConfig, setPaymentConfig] = useState({
    codEnabled: true,
    onlineEnabled: false,
    paymentMode: 'COD',
  });

  // Active editing node
  const [activeEditingNode, setActiveEditingNode] = useState(null);

  // Modals
  const [whatsThisModalOpen, setWhatsThisModalOpen] = useState(false);
  const [sampleCartModalOpen, setSampleCartModalOpen] = useState(false);
  const [simulatorModalOpen, setSimulatorModalOpen] = useState(false);

  // Simulator State Machine
  const [simSessionId, setSimSessionId] = useState(null);
  const [simHistory, setSimHistory] = useState([]);
  const [simCurrentState, setSimCurrentState] = useState('');
  const [simOptions, setSimOptions] = useState([]);
  const [simInputText, setSimInputText] = useState('');
  const [simLoading, setSimLoading] = useState(false);
  const [simOrderResult, setSimOrderResult] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load Workflow and Status
  const loadData = async () => {
    setLoading(true);
    try {
      const [wfData, statData] = await Promise.all([
        checkoutBotService.getWorkflow(),
        checkoutBotService.getStatus(),
      ]);

      if (wfData) {
        setWorkflow(wfData);
        setCartConfirmationMsg(wfData.cartConfirmationMsg || '');
        setCancellationMsg(wfData.cancellationMsg || '');
        setOrderConfirmationMsg(wfData.orderConfirmationMsg || '');
        setOrderPlacedMsg(wfData.orderPlacedMsg || '');
        if (wfData.shippingConfig) setShippingConfig(wfData.shippingConfig);
        if (wfData.paymentConfig) setPaymentConfig(wfData.paymentConfig);
      }

      if (statData) {
        setStatusInfo(statData);
      }
    } catch (err) {
      console.error('Failed to load checkout bot:', err);
      showToast('Failed to load checkout workflow', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Workflow
  const handleSaveWorkflow = async () => {
    setIsSaving(true);
    try {
      const payload = {
        cartConfirmationMsg,
        cancellationMsg,
        shippingConfig,
        paymentConfig,
        orderConfirmationMsg,
        orderPlacedMsg,
      };
      await checkoutBotService.updateWorkflow(payload);
      showToast('Workflow configuration saved successfully');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save workflow', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Live / Pause Workflow
  const handleTogglePublish = async () => {
    setIsPublishing(true);
    try {
      if (statusInfo.isLive) {
        await checkoutBotService.unpublishWorkflow();
        showToast('Auto Checkout Flow paused');
      } else {
        await checkoutBotService.publishWorkflow();
        showToast('Auto Checkout Flow is now LIVE on WhatsApp!');
      }
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update workflow status', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Start Interactive Simulator
  const handleStartSimulator = async () => {
    setSimulatorModalOpen(true);
    setSimLoading(true);
    setSimOrderResult(null);
    try {
      const res = await checkoutBotService.testWorkflow({ action: 'START' });
      setSimSessionId(res.sessionId);
      setSimCurrentState(res.currentState);
      setSimOptions(res.options || []);
      setSimHistory([
        { sender: 'user', text: '🛒 Sent Cart (4 items — Estimated: ₹12,000.00)' },
        { sender: 'bot', text: res.botReply, options: res.options },
      ]);
    } catch (err) {
      showToast('Failed to start test simulator', 'error');
    } finally {
      setSimLoading(false);
    }
  };

  // Advance Interactive Simulator
  const handleSendSimulatorInput = async (inputText) => {
    const textToSend = inputText || simInputText;
    if (!textToSend.trim() || !simSessionId) return;

    const newHistory = [...simHistory, { sender: 'user', text: textToSend }];
    setSimHistory(newHistory);
    setSimInputText('');
    setSimLoading(true);

    try {
      const res = await checkoutBotService.testWorkflow({
        action: 'RESPOND',
        sessionId: simSessionId,
        customerInput: textToSend,
      });

      setSimCurrentState(res.currentState);
      setSimOptions(res.options || []);
      if (res.orderCreated) {
        setSimOrderResult(res.orderCreated);
      }

      setSimHistory([
        ...newHistory,
        { sender: 'bot', text: res.botReply, options: res.options },
      ]);
    } catch (err) {
      showToast('Simulator error: ' + err.message, 'error');
    } finally {
      setSimLoading(false);
    }
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

      {/* Main Container with ARCO Dashboard Sidebar */}
      <div className="flex-1 flex flex-row min-w-0">
        <DashboardSidebar />

        {/* Workspace Shell */}
        <main className="flex-1 ml-14 min-w-0 flex flex-col bg-slate-50/50 min-h-screen">
          
          {/* TOP HEADER */}
          <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-2xs">
            
            {/* Left: Back Button + Title + What's This Help */}
            <div className="flex items-center gap-3">
              <Link
                to="/commerce-settings"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Back to Commerce Settings"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                    Auto Checkout Flow
                  </h1>
                  <button
                    type="button"
                    onClick={() => setWhatsThisModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3 text-slate-500" />
                    <span>What's This?</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Automated cart processing, shipping collection & order placement on WhatsApp
                </p>
              </div>
            </div>

            {/* Right: Step Counter + Actions (Set Live / Test Workflow / Save) */}
            <div className="flex items-center gap-2.5">
              
              {/* Dynamic Step Counter */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>{statusInfo.remainingSteps}/{statusInfo.totalSteps} steps remaining</span>
              </div>

              {/* Test Simulator Button */}
              <button
                type="button"
                onClick={handleStartSimulator}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Test Workflow</span>
              </button>

              {/* Save Workflow Button */}
              <button
                type="button"
                onClick={handleSaveWorkflow}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>

              {/* Set Live / Pause Button */}
              <button
                type="button"
                onClick={handleTogglePublish}
                disabled={isPublishing || !statusInfo.catalogConnected}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 ${
                  statusInfo.isLive
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-[#0d3b30] hover:bg-[#154d3f] text-white'
                }`}
              >
                {statusInfo.isLive ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Live (Active)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Set Live</span>
                  </>
                )}
              </button>

            </div>

          </header>

          {/* CATALOG NOT CONNECTED WARNING BANNER */}
          {!statusInfo.catalogConnected && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  To use the workflow, Catalog should be connected to ARCO.{' '}
                  <Link to="/commerce-settings" className="font-bold underline text-amber-950 hover:text-black">
                    Connect from here
                  </Link>
                </span>
              </div>
            </div>
          )}

          {/* MAIN WORKFLOW BUILDER BODY */}
          <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col lg:flex-row gap-6 max-w-6xl w-full mx-auto">
            
            {/* LEFT CANVAS: Visual Workflow Nodes */}
            <div className="flex-1 space-y-4">
              
              {/* NODE 1: TRIGGER NODE */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600">
                        Trigger Point
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900">Customer sends a cart</h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSampleCartModalOpen(true)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 underline cursor-pointer"
                  >
                    View Sent Cart
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
                    <span>Sample Cart: 4 items</span>
                    <span className="text-emerald-700 font-bold">₹12,000.00 estimated total</span>
                  </div>
                  <p className="text-slate-600 italic bg-white p-2 rounded-xl border border-slate-200/60">
                    "Hey! I love these products. Would like to buy them"
                  </p>
                </div>
              </div>

              {/* CONNECTOR LINE */}
              <div className="flex justify-center -my-2">
                <div className="w-0.5 h-6 bg-slate-300" />
              </div>

              {/* NODE 2: CART CONFIRMATION NODE */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                        Cart Confirmation
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900">Confirm Order & Proceed</h3>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    WhatsApp Message Template
                  </label>
                  <textarea
                    rows={3}
                    value={cartConfirmationMsg}
                    onChange={(e) => setCartConfirmationMsg(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 font-medium resize-none focus:bg-white"
                  />
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                    <span>Variables:</span>
                    <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">{'{total_order_value}'}</span>
                    <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">{'{cart_item_count}'}</span>
                  </div>
                </div>

                {/* YES / NO BRANCHES PREVIEW */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>If Customer replies "YES"</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-1">
                      Proceeds to Shipping Details flow (Name, Pincode, Address).
                    </p>
                  </div>

                  <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs">
                    <div className="font-bold text-red-900 flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5 text-red-600" />
                      <span>If Customer replies "NO"</span>
                    </div>
                    <p className="text-[11px] text-red-700 mt-1">
                      Sends cancellation message and concludes session.
                    </p>
                  </div>
                </div>
              </div>

              {/* CONNECTOR LINE */}
              <div className="flex justify-center -my-2">
                <div className="w-0.5 h-6 bg-slate-300" />
              </div>

              {/* NODE 3: SHIPPING DETAILS COLLECTION */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">
                      Step 2: Shipping Collection
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900">Collect & Confirm Delivery Address</h3>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-700">1. Customer Name Prompt:</span>
                    <span className="text-slate-500 font-mono text-[11px]">"Please provide your full name."</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-700">2. Pincode Prompt:</span>
                    <span className="text-slate-500 font-mono text-[11px]">"Please provide the 6-digit Pincode..."</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-700">3. Street Address Prompt:</span>
                    <span className="text-slate-500 font-mono text-[11px]">"Please enter your street address, flat..."</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Address Confirmation Message
                  </label>
                  <textarea
                    rows={3}
                    value={orderConfirmationMsg}
                    onChange={(e) => setOrderConfirmationMsg(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 font-medium resize-none focus:bg-white"
                  />
                </div>
              </div>

              {/* CONNECTOR LINE */}
              <div className="flex justify-center -my-2">
                <div className="w-0.5 h-6 bg-slate-300" />
              </div>

              {/* NODE 4: SHIPPING COSTS & DISCOUNTS */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
                      Step 3: Shipping & Discounts
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900">Configure Shipping Charges</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Free Shipping Threshold (₹)
                    </label>
                    <input
                      type="number"
                      value={shippingConfig.freeShippingThreshold}
                      onChange={(e) =>
                        setShippingConfig({
                          ...shippingConfig,
                          freeShippingThreshold: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-medium"
                      placeholder="0 for always free"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Default Shipping Charge (₹)
                    </label>
                    <input
                      type="number"
                      value={shippingConfig.defaultShippingCharge}
                      onChange={(e) =>
                        setShippingConfig({
                          ...shippingConfig,
                          defaultShippingCharge: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* CONNECTOR LINE */}
              <div className="flex justify-center -my-2">
                <div className="w-0.5 h-6 bg-slate-300" />
              </div>

              {/* NODE 5: PAYMENT & ORDER PLACED */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600">
                      Step 4: Payment & Order Placed
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900">Payment Mode & Order Message</h3>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Order Placed WhatsApp Message
                  </label>
                  <textarea
                    rows={3}
                    value={orderPlacedMsg}
                    onChange={(e) => setOrderPlacedMsg(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 font-medium resize-none focus:bg-white"
                  />
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                    <span>Variables:</span>
                    <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">{'{customer_name}'}</span>
                    <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">{'{order_id}'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT SIDE: Live WhatsApp Chat Mockup Preview */}
            <div className="w-full lg:w-[340px] shrink-0">
              <div className="sticky top-20 bg-slate-900 rounded-3xl p-4 shadow-xl border border-slate-800 text-white space-y-3">
                
                {/* Phone Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center font-bold text-[10px]">
                      A
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">ARCO Commerce Bot</div>
                      <div className="text-[9px] text-emerald-400">Online</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">Preview</span>
                </div>

                {/* Chat Bubbles */}
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 text-[11px]">
                  
                  {/* User sent cart */}
                  <div className="flex justify-end">
                    <div className="bg-[#005c4b] text-emerald-50 p-2.5 rounded-2xl rounded-tr-none max-w-[85%] space-y-1 shadow-sm">
                      <div className="font-bold text-[10px] text-emerald-200">🛒 Cart Sent (4 items)</div>
                      <div>"Hey! I love these products. Would like to buy them"</div>
                      <div className="text-[9px] text-emerald-300 text-right">10:00 AM ✓✓</div>
                    </div>
                  </div>

                  {/* Bot confirmation message */}
                  <div className="flex justify-start">
                    <div className="bg-slate-800 text-slate-100 p-2.5 rounded-2xl rounded-tl-none max-w-[85%] space-y-1.5 shadow-sm">
                      <div className="whitespace-pre-line leading-relaxed">
                        {cartConfirmationMsg.replace('{total_order_value}', '₹12,000.00')}
                      </div>
                      <div className="pt-1.5 flex gap-1">
                        <span className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]">
                          Yes
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-slate-700 text-slate-300 font-bold text-[10px]">
                          No
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* User replies Yes */}
                  <div className="flex justify-end">
                    <div className="bg-[#005c4b] text-emerald-50 px-3 py-1 rounded-full text-[11px] font-bold">
                      Yes
                    </div>
                  </div>

                  {/* Bot asks name */}
                  <div className="flex justify-start">
                    <div className="bg-slate-800 text-slate-100 p-2 rounded-2xl rounded-tl-none max-w-[85%]">
                      Please provide your full name.
                    </div>
                  </div>

                  {/* Order Placed Example */}
                  <div className="flex justify-start">
                    <div className="bg-emerald-950/80 border border-emerald-700/60 text-emerald-100 p-2.5 rounded-2xl rounded-tl-none max-w-[85%] space-y-1">
                      <div className="whitespace-pre-line font-medium text-[10px]">
                        {orderPlacedMsg
                          .replace('{customer_name}', 'Aarav')
                          .replace('{order_id}', 'ORD-89210')}
                      </div>
                    </div>
                  </div>

                </div>

                <div className="pt-2 border-t border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={handleStartSimulator}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Open Live Interactive Simulator
                  </button>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODALS & POPUPS                                                           */}
      {/* ========================================================================= */}

      {/* 1. WHAT'S THIS MODAL */}
      {whatsThisModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Auto Checkout Flow</h3>
              </div>
              <button
                onClick={() => setWhatsThisModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              Auto Checkout Flow helps customers complete their WhatsApp purchase by collecting order, shipping and payment information automatically without manual intervention.
            </p>
            <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supports WhatsApp Native Carts</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Auto Resolves City/State from Pincode</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant PostgreSQL Order Logging</span>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setWhatsThisModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SAMPLE CART MODAL */}
      {sampleCartModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Sample WhatsApp Sent Cart</h3>
              <button onClick={() => setSampleCartModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Urban Runner Pro Sneakers</div>
                  <div className="text-[11px] text-slate-500">Qty: 1 × ₹3,499.00</div>
                </div>
                <div className="font-bold text-slate-900">₹3,499.00</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Organic Cotton Classic Tee</div>
                  <div className="text-[11px] text-slate-500">Qty: 2 × ₹899.00</div>
                </div>
                <div className="font-bold text-slate-900">₹1,798.00</div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-sm">
              <span>Estimated Subtotal:</span>
              <span className="text-emerald-700">₹5,297.00</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. INTERACTIVE SIMULATOR MODAL */}
      {simulatorModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 text-xs font-sans flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Checkout Bot Live Simulator</h3>
                  <p className="text-[10px] text-slate-400">Step-by-step state machine tester</p>
                </div>
              </div>
              <button
                onClick={() => setSimulatorModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Simulation Flow */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              {simHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      item.sender === 'user'
                        ? 'bg-[#0d3b30] text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs whitespace-pre-line'
                    }`}
                  >
                    <div>{item.text}</div>
                    {item.options && item.options.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {item.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSendSimulatorInput(opt)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {simLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-2.5 rounded-2xl border border-slate-200 text-slate-400 animate-pulse text-[11px]">
                    Bot is typing...
                  </div>
                </div>
              )}
            </div>

            {/* Order Result Banner if Order Placed */}
            {simOrderResult && (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">
                    Order #{simOrderResult.order_number} created in PostgreSQL!
                  </span>
                </div>
                <span className="font-extrabold text-emerald-800">
                  ₹{parseFloat(simOrderResult.total_amount).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {/* Input Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 shrink-0">
              <input
                type="text"
                value={simInputText}
                onChange={(e) => setSimInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendSimulatorInput()}
                placeholder={
                  simCurrentState === 'COLLECTING_NAME'
                    ? 'Enter full name (e.g. Aarav Sharma)...'
                    : simCurrentState === 'COLLECTING_PINCODE'
                    ? 'Enter 6-digit Pincode (e.g. 560001)...'
                    : simCurrentState === 'COLLECTING_ADDRESS'
                    ? 'Enter street & house details...'
                    : 'Type a reply or click options...'
                }
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="button"
                onClick={() => handleSendSimulatorInput()}
                disabled={simLoading || !simInputText.trim()}
                className="px-4 py-2 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Send
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
