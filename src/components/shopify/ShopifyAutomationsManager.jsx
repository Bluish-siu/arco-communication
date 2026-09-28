import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  ShieldCheck,
  Send,
  Eye,
  Sliders,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Tag,
  DollarSign,
  Package,
  Sparkles,
  Phone,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';
import { integrationService } from '../../services/integrationService';

// WhatsApp icon SVG
const WhatsAppIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ShopifyAutomationsManager({ shopDomain, onToast }) {
  const [automations, setAutomations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingRecipe, setUpdatingRecipe] = useState(null);
  const [expandedRecipe, setExpandedRecipe] = useState('abandoned_cart');

  // Test Modal State
  const [testModalRecipe, setTestModalRecipe] = useState(null);
  const [testPhone, setTestPhone] = useState('+91');
  const [sendingTest, setSendingTest] = useState(false);

  // Load Automations
  const loadData = async () => {
    setLoading(true);
    try {
      const [list, statsData] = await Promise.all([
        integrationService.getShopifyAutomations(shopDomain),
        integrationService.getShopifyAutomationStats(shopDomain),
      ]);
      setAutomations(list || []);
      setStats(statsData || {});
    } catch (err) {
      console.warn('[ShopifyAutomationsManager] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [shopDomain]);

  // Toggle Recipe ON / OFF
  const handleToggle = async (recipe) => {
    const newStatus = !recipe.is_enabled;
    setUpdatingRecipe(recipe.recipe_type);

    // Optimistic UI update
    setAutomations((prev) =>
      prev.map((a) =>
        a.recipe_type === recipe.recipe_type ? { ...a, is_enabled: newStatus } : a
      )
    );

    try {
      await integrationService.updateShopifyAutomation(
        recipe.recipe_type,
        { is_enabled: newStatus },
        shopDomain
      );
      if (onToast) {
        onToast(
          `${recipe.name} is now ${newStatus ? 'active' : 'paused'}`,
          'success'
        );
      }
    } catch (err) {
      // Rollback
      setAutomations((prev) =>
        prev.map((a) =>
          a.recipe_type === recipe.recipe_type ? { ...a, is_enabled: !newStatus } : a
        )
      );
      if (onToast) {
        onToast(`Failed to update ${recipe.name}: ${err.message}`, 'error');
      }
    } finally {
      setUpdatingRecipe(null);
    }
  };

  // Update Settings (delay, discount, etc.)
  const handleUpdateConfig = async (recipeType, updates) => {
    setUpdatingRecipe(recipeType);
    try {
      const updated = await integrationService.updateShopifyAutomation(
        recipeType,
        updates,
        shopDomain
      );
      setAutomations((prev) =>
        prev.map((a) => (a.recipe_type === recipeType ? { ...a, ...updated, ...updates } : a))
      );
      if (onToast) onToast('Settings saved successfully', 'success');
    } catch (err) {
      if (onToast) onToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setUpdatingRecipe(null);
    }
  };

  // Send Live Test to WhatsApp
  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testPhone || testPhone.length < 8) {
      if (onToast) onToast('Please enter a valid WhatsApp phone number with country code', 'error');
      return;
    }
    setSendingTest(true);
    try {
      const res = await integrationService.testShopifyAutomation(
        testModalRecipe.recipe_type,
        testPhone.trim(),
        shopDomain
      );
      if (onToast) {
        onToast(`Test message sent to ${testPhone} on WhatsApp!`, 'success');
      }
      setTestModalRecipe(null);
    } catch (err) {
      if (onToast) {
        onToast(`Failed to send test: ${err.message}`, 'error');
      }
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0d2b24] to-slate-900 border border-emerald-500/20 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
              <Zap className="w-3.5 h-3.5" />
              <span>Shopify ⚡ WhatsApp Automations</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Automated Notification Recipes
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Turn your Shopify store events into high-converting WhatsApp conversations. Recover abandoned carts, confirm orders instantly, and stop COD RTO losses.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Global Performance Bar */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Notifications Sent
              </div>
              <div className="text-xl font-extrabold text-white mt-0.5">
                {stats.totalSent || 0}
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Delivery Rate
              </div>
              <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
                {stats.deliveryRate || 100}%
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Carts / COD Verified
              </div>
              <div className="text-xl font-extrabold text-blue-400 mt-0.5">
                {stats.totalRecovered || 0}
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Recovered Revenue
              </div>
              <div className="text-xl font-extrabold text-amber-400 mt-0.5">
                ₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4 Automation Recipes Grid */}
      <div className="space-y-4">
        {automations.map((recipe) => {
          const isExpanded = expandedRecipe === recipe.recipe_type;
          const isToggling = updatingRecipe === recipe.recipe_type;

          return (
            <div
              key={recipe.recipe_type}
              className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm ${
                recipe.is_enabled
                  ? 'border-emerald-200/80 shadow-emerald-500/5'
                  : 'border-slate-200 opacity-90'
              }`}
            >
              {/* Recipe Header Row */}
              <div className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                      recipe.is_enabled
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  >
                    {recipe.recipe_type === 'abandoned_cart' && <ShoppingCart className="w-5 h-5" />}
                    {recipe.recipe_type === 'order_confirmation' && <CheckCircle2 className="w-5 h-5" />}
                    {recipe.recipe_type === 'cod_verification' && <ShieldCheck className="w-5 h-5" />}
                    {recipe.recipe_type === 'order_fulfillment' && <Package className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {recipe.name}
                      </h3>
                      {recipe.is_enabled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          Paused
                        </span>
                      )}
                      {recipe.recipe_type === 'cod_verification' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          Anti-RTO Shield
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl">
                      {recipe.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Test Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setTestModalRecipe(recipe);
                    }}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Send Test</span>
                  </button>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={recipe.is_enabled}
                    disabled={isToggling}
                    onClick={() => handleToggle(recipe)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      recipe.is_enabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        recipe.is_enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  {/* Expand / Collapse Button */}
                  <button
                    type="button"
                    onClick={() => setExpandedRecipe(isExpanded ? null : recipe.recipe_type)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: Recipe Controls & Config */}
                  <div className="lg:col-span-6 space-y-4">
                    {/* Specific settings for Abandoned Cart */}
                    {recipe.recipe_type === 'abandoned_cart' && (
                      <div className="space-y-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Trigger Timing & Delay</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[15, 60, 1440].map((mins) => (
                            <button
                              key={mins}
                              type="button"
                              onClick={() => handleUpdateConfig(recipe.recipe_type, { delay_minutes: mins })}
                              className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                                recipe.delay_minutes === mins
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {mins === 15 ? '15 Minutes' : mins === 60 ? '1 Hour' : '24 Hours'}
                            </button>
                          ))}
                        </div>

                        {/* Discount Code */}
                        <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                              Discount Coupon
                            </label>
                            <input
                              type="text"
                              defaultValue={recipe.discount_code || 'SAVE10'}
                              onBlur={(e) =>
                                handleUpdateConfig(recipe.recipe_type, {
                                  discount_code: e.target.value.trim().toUpperCase(),
                                })
                              }
                              className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 uppercase"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                              Discount Value
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                defaultValue={recipe.discount_percent || 10}
                                onBlur={(e) =>
                                  handleUpdateConfig(recipe.recipe_type, {
                                    discount_percent: parseInt(e.target.value, 10) || 10,
                                  })
                                }
                                className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                              />
                              <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-bold">%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Specific settings for COD Verification */}
                    {recipe.recipe_type === 'cod_verification' && (
                      <div className="space-y-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5">
                        <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Shopify Order Tagging Automation</span>
                        </div>
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                          When a customer clicks <span className="font-semibold text-emerald-700">"Confirm Order"</span> on WhatsApp, ARCO automatically tags the Shopify order with <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-900 font-mono text-[10px]">COD-Confirmed</code>. If they click <span className="font-semibold text-red-600">"Cancel"</span>, it tags <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-900 font-mono text-[10px]">COD-Cancelled</code>.
                        </p>
                      </div>
                    )}

                    {/* Specific settings for Order Fulfillment */}
                    {recipe.recipe_type === 'order_fulfillment' && (
                      <div className="space-y-2.5 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Courier Integrations Detected</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-slate-700">
                          {['Delhivery', 'BlueDart', 'Shiprocket', 'FedEx', 'DTDC', 'Shopify Shipping'].map((c) => (
                            <span key={c} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md">
                              {c}
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Automatically resolves live courier tracking links when an order is marked fulfilled in Shopify.
                        </p>
                      </div>
                    )}

                    {/* Stats Pill */}
                    <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-3">
                        <span>
                          Sent: <strong className="text-slate-900 font-mono">{recipe.stats?.sent || 0}</strong>
                        </span>
                        <span>
                          Delivered: <strong className="text-emerald-700 font-mono">{recipe.stats?.delivered || 0}</strong>
                        </span>
                        <span>
                          Read: <strong className="text-blue-700 font-mono">{recipe.stats?.read || 0}</strong>
                        </span>
                      </div>
                      {recipe.stats?.revenue > 0 && (
                        <span className="font-semibold text-emerald-700">
                          ₹{recipe.stats.revenue.toLocaleString('en-IN')} recovered
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Live WhatsApp Bubble Preview */}
                  <div className="lg:col-span-6 bg-slate-900/95 border border-slate-800 rounded-xl p-4 text-white relative">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                        <span className="text-[11px] font-bold text-slate-300">Live WhatsApp Preview</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Template: {recipe.template_name}</span>
                    </div>

                    {/* WhatsApp Chat Bubble */}
                    <div className="max-w-[85%] bg-[#005c4b] text-white rounded-2xl rounded-tl-sm p-3.5 shadow-md space-y-2 text-xs leading-relaxed">
                      {recipe.recipe_type === 'abandoned_cart' && (
                        <>
                          <p>
                            Hi <strong>Shraddha</strong>! 👋 We noticed you left items in your cart on <strong>{shopDomain.replace('.myshopify.com', '')}</strong>.
                          </p>
                          <p>
                            Use exclusive code <span className="bg-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold text-amber-300">{recipe.discount_code || 'SAVE10'}</span> to get <strong>{recipe.discount_percent || 10}% OFF</strong>!
                          </p>
                          <div className="pt-2 border-t border-emerald-600/40 text-center">
                            <span className="inline-block w-full py-1.5 px-3 rounded-lg bg-[#00a884] text-white font-bold text-[11px] shadow-sm">
                              🛒 Complete Your Order
                            </span>
                          </div>
                        </>
                      )}

                      {recipe.recipe_type === 'order_confirmation' && (
                        <>
                          <p className="font-bold text-emerald-200">🎉 Order Confirmed!</p>
                          <p>
                            Thank you for your order <strong>#1001</strong> for <strong>₹1,499</strong> on <strong>{shopDomain.replace('.myshopify.com', '')}</strong>!
                          </p>
                          <p className="text-[11px] text-slate-200">
                            We are packing your items and will notify you as soon as they ship.
                          </p>
                          <div className="pt-2 border-t border-emerald-600/40 text-center">
                            <span className="inline-block w-full py-1.5 px-3 rounded-lg bg-emerald-800/80 text-white font-semibold text-[11px]">
                              📦 Track Order Details
                            </span>
                          </div>
                        </>
                      )}

                      {recipe.recipe_type === 'cod_verification' && (
                        <>
                          <p className="font-bold text-amber-200">📦 Cash on Delivery Verification</p>
                          <p>
                            Hi <strong>Shraddha</strong>, you placed order <strong>#1001</strong> for <strong>₹1,499</strong> on <strong>{shopDomain.replace('.myshopify.com', '')}</strong> with Cash on Delivery.
                          </p>
                          <p className="text-[11px] text-slate-200">
                            Please confirm your order to prevent delivery delays:
                          </p>
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-600/40">
                            <span className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] text-center">
                              ✅ Confirm Order
                            </span>
                            <span className="py-1.5 px-2 rounded-lg bg-red-600/80 text-white font-bold text-[11px] text-center">
                              ❌ Cancel Order
                            </span>
                          </div>
                        </>
                      )}

                      {recipe.recipe_type === 'order_fulfillment' && (
                        <>
                          <p className="font-bold text-emerald-200">🚚 Shipment Dispatched!</p>
                          <p>
                            Great news! Your order <strong>#1001</strong> from <strong>{shopDomain.replace('.myshopify.com', '')}</strong> has shipped via <strong>BlueDart</strong>.
                          </p>
                          <p className="text-[11px] text-slate-200">
                            Tracking: <span className="font-mono text-amber-300">BD123456789IN</span>
                          </p>
                          <div className="pt-2 border-t border-emerald-600/40 text-center">
                            <span className="inline-block w-full py-1.5 px-3 rounded-lg bg-[#00a884] text-white font-bold text-[11px]">
                              🚚 Live Tracking Link
                            </span>
                          </div>
                        </>
                      )}

                      <div className="text-[9px] text-emerald-200/80 text-right pt-1">
                        12:00 PM • Verified WhatsApp Message
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setTestModalRecipe(recipe)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Test Message to Phone</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Test WhatsApp Modal */}
      {testModalRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setTestModalRecipe(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <WhatsAppIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Send Test Notification
                </h3>
                <p className="text-xs text-slate-500">{testModalRecipe.name}</p>
              </div>
            </div>

            <form onSubmit={handleSendTest} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Recipient WhatsApp Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter phone number with international country code (e.g. +91 for India).
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block text-[11px]">Test Preview:</span>
                <p className="text-[11px] italic">
                  A sample WhatsApp notification with live order/cart variables will be sent to your phone immediately.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTestModalRecipe(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingTest}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {sendingTest ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to WhatsApp Now</span>
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
