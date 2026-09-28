import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  ShoppingBag,
  Palette,
  Layout,
  Smartphone,
  Monitor,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Save,
  RefreshCw,
  Eye,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { integrationService } from '../../services/integrationService';

const WhatsAppIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const PRESET_COLORS = [
  { name: 'WhatsApp Emerald', hex: '#25D366' },
  { name: 'Forest Green', hex: '#075E54' },
  { name: 'Electric Indigo', hex: '#6366F1' },
  { name: 'Ocean Cyan', hex: '#0EA5E9' },
  { name: 'Midnight Slate', hex: '#0F172A' },
  { name: 'Rose Red', hex: '#E11D48' },
];

export default function ShopifyStorefrontWidgetManager({ shopDomain, onToast }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [activeTab, setActiveTab] = useState('widget'); // 'widget' | 'buy_button' | 'install'
  const [previewSimulatorTab, setPreviewSimulatorTab] = useState('chat'); // 'chat' | 'product'
  const [simulatorModalOpen, setSimulatorModalOpen] = useState(false);

  const cleanShop = shopDomain || 'arco-test-e2a1thrd.myshopify.com';
  const scriptUrl = `https://arco-backend-ecbl.onrender.com/api/storefront/widget.js?shop=${encodeURIComponent(cleanShop)}`;
  const embedSnippet = `<script src="${scriptUrl}" async></script>`;

  useEffect(() => {
    loadConfig();
  }, [cleanShop]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await integrationService.getShopifyWidgetConfig(cleanShop);
      setConfig(data);
    } catch (err) {
      console.warn('[ShopifyStorefrontWidgetManager] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const updated = await integrationService.updateShopifyWidgetConfig(config, cleanShop);
      setConfig(updated);
      if (onToast) onToast('Storefront widget settings saved successfully!', 'success');
    } catch (err) {
      if (onToast) onToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
    if (onToast) onToast('Script embed code copied to clipboard!', 'success');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" />
        <p className="text-slate-600 font-medium">Loading Storefront WhatsApp Widget settings...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <p className="text-slate-600">Failed to load widget configuration. Please refresh the page.</p>
        <button
          onClick={loadConfig}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0d2b24] to-slate-900 border border-emerald-500/20 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Step 2: Storefront Conversion Suite
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Storefront WhatsApp Widget & "Order on WhatsApp"
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl">
              Turn store visitors into customers with a floating WhatsApp chat button and 1-click "Order on WhatsApp" buttons directly on product pages.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10">
          <button
            onClick={() => setActiveTab('widget')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'widget'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Floating Chat Widget
          </button>
          <button
            onClick={() => setActiveTab('buy_button')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'buy_button'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            "Order on WhatsApp" Product Button
          </button>
          <button
            onClick={() => setActiveTab('install')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'install'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            Theme Installation & Status
          </button>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Live Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: Floating Chat Widget */}
          {activeTab === 'widget' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <WhatsAppIcon className="w-5 h-5 text-emerald-500" />
                    Floating WhatsApp Chat Widget
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Display a floating chat button on your Shopify storefront.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(config.is_enabled)}
                    onChange={(e) => setConfig({ ...config, is_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Recipient Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Recipient WhatsApp Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-mono text-sm">
                    📱
                  </span>
                  <input
                    type="text"
                    value={config.phone_number || ''}
                    onChange={(e) => setConfig({ ...config, phone_number: e.target.value })}
                    placeholder="+919920858396"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Customer chats will be sent to this WhatsApp number with international country code.
                </p>
              </div>

              {/* Brand Name & CTA Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Brand / Agent Name
                  </label>
                  <input
                    type="text"
                    value={config.brand_name || ''}
                    onChange={(e) => setConfig({ ...config, brand_name: e.target.value })}
                    placeholder="ARCO Support"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Call To Action Badge
                  </label>
                  <input
                    type="text"
                    value={config.call_to_action_badge || ''}
                    onChange={(e) => setConfig({ ...config, call_to_action_badge: e.target.value })}
                    placeholder="Chat on WhatsApp"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Position & Brand Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Widget Position
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, widget_position: 'bottom-right' })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                        config.widget_position === 'bottom-right'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Bottom Right
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, widget_position: 'bottom-left' })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                        config.widget_position === 'bottom-left'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Bottom Left
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.brand_color || '#25D366'}
                      onChange={(e) => setConfig({ ...config, brand_color: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setConfig({ ...config, brand_color: c.hex })}
                          title={c.name}
                          style={{ backgroundColor: c.hex }}
                          className={`w-6 h-6 rounded-full border-2 transition ${
                            config.brand_color === c.hex ? 'border-slate-900 scale-110' : 'border-white'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Welcome Popup Headings */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Popup Window Messages
                </h4>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Welcome Heading</label>
                  <input
                    type="text"
                    value={config.welcome_heading || ''}
                    onChange={(e) => setConfig({ ...config, welcome_heading: e.target.value })}
                    placeholder="Need Help? Chat with Us!"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Subheading / Status</label>
                  <input
                    type="text"
                    value={config.welcome_subheading || ''}
                    onChange={(e) => setConfig({ ...config, welcome_subheading: e.target.value })}
                    placeholder="Typically replies within a few minutes."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Pre-filled Chat Message</label>
                  <textarea
                    rows={2}
                    value={config.default_chat_message || ''}
                    onChange={(e) => setConfig({ ...config, default_chat_message: e.target.value })}
                    placeholder="Hello! I have a question about your products."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Device Visibility */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Device Display
                </span>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(config.show_on_mobile)}
                      onChange={(e) => setConfig({ ...config, show_on_mobile: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                    Mobile
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(config.show_on_desktop)}
                      onChange={(e) => setConfig({ ...config, show_on_desktop: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <Monitor className="w-3.5 h-3.5 text-slate-500" />
                    Desktop
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: "Order on WhatsApp" Product Button */}
          {activeTab === 'buy_button' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-500" />
                    "Order on WhatsApp" Product Page Button
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Automatically adds a high-converting WhatsApp buy button right next to "Add to Cart".
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(config.buy_button_enabled)}
                    onChange={(e) => setConfig({ ...config, buy_button_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Button Label & Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Button Label Text
                  </label>
                  <input
                    type="text"
                    value={config.buy_button_text || ''}
                    onChange={(e) => setConfig({ ...config, buy_button_text: e.target.value })}
                    placeholder="Order on WhatsApp"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Button Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, buy_button_style: 'solid' })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                        config.buy_button_style === 'solid'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Solid Green
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, buy_button_style: 'outline' })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                        config.buy_button_style === 'outline'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Outlined
                    </button>
                  </div>
                </div>
              </div>

              {/* Pre-filled Message Template */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    WhatsApp Message Template
                  </label>
                  <span className="text-[11px] text-slate-400">Variables auto-replaced</span>
                </div>
                <textarea
                  rows={3}
                  value={config.buy_button_template || ''}
                  onChange={(e) => setConfig({ ...config, buy_button_template: e.target.value })}
                  placeholder="Hi, I would like to order {{product_title}} (Price: {{product_price}}) from {{store_url}}. Please confirm availability!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                />
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-500 font-medium">Available tags:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                    {'{{product_title}}'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                    {'{{product_price}}'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                    {'{{store_url}}'}
                  </span>
                </div>
              </div>

              {/* Button Color Customization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Button Background Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.buy_button_bg_color || '#25D366'}
                      onChange={(e) => setConfig({ ...config, buy_button_bg_color: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                    />
                    <input
                      type="text"
                      value={config.buy_button_bg_color || '#25D366'}
                      onChange={(e) => setConfig({ ...config, buy_button_bg_color: e.target.value })}
                      className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Button Text Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.buy_button_text_color || '#FFFFFF'}
                      onChange={(e) => setConfig({ ...config, buy_button_text_color: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                    />
                    <input
                      type="text"
                      value={config.buy_button_text_color || '#FFFFFF'}
                      onChange={(e) => setConfig({ ...config, buy_button_text_color: e.target.value })}
                      className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Theme Installation & Status */}
          {activeTab === 'install' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Storefront Activation & Live Embed Snippet
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Easily embed the widget onto your live Shopify theme in 30 seconds.
                </p>
              </div>

              {/* Live Status Card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                    <WhatsAppIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">Storefront Script Active & Ready</h4>
                    <p className="text-xs text-emerald-700">
                      Target Store:{' '}
                      <span className="font-mono font-semibold">{cleanShop}</span>
                    </p>
                  </div>
                </div>

                <a
                  href={`https://${cleanShop}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Visit Store
                </a>
              </div>

              {/* 1-Click Code Snippet */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1-Line Embed Script Tag
                </label>
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
                    {embedSnippet}
                  </pre>
                  <button
                    type="button"
                    onClick={copyEmbedCode}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
                  >
                    {copiedSnippet ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5 text-xs text-slate-700">
                <p className="font-bold text-slate-900">How to add in Shopify (30 seconds):</p>
                <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                  <li>In your Shopify Admin, click <strong>Online Store</strong> &gt; <strong>Themes</strong>.</li>
                  <li>Click the three dots (<strong>...</strong>) next to your active theme &gt; <strong>Edit code</strong>.</li>
                  <li>Under <strong>Layout</strong>, open <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">theme.liquid</code>.</li>
                  <li>Paste the code right before the closing <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">&lt;/head&gt;</code> tag and click <strong>Save</strong>!</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Phone Simulator */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 bg-slate-950 rounded-3xl p-4 shadow-2xl border border-slate-800 text-white">
            {/* Simulator Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Live Interactive Mockup
                </span>
              </div>

              {/* Simulator view toggles */}
              <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewSimulatorTab('chat')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                    previewSimulatorTab === 'chat'
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Floating Chat
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSimulatorTab('product')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                    previewSimulatorTab === 'product'
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Product Page
                </button>
              </div>
            </div>

            {/* Mobile Screen Container */}
            <div className="mt-3 relative bg-slate-100 rounded-2xl overflow-hidden h-[510px] text-slate-900 border border-slate-800 shadow-inner flex flex-col justify-between">
              {/* Fake Storefront Top Bar */}
              <div className="bg-white px-3 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-800 tracking-tight font-bold">{cleanShop.replace('.myshopify.com', '')}</span>
                <span className="text-slate-400 text-[10px]">🛍️ Storefront</span>
              </div>

              {/* Simulator Screen Content */}
              {previewSimulatorTab === 'chat' ? (
                /* Chat Simulator Screen */
                <div className="p-4 flex-1 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100">
                  <div className="space-y-3">
                    {/* Simulated Store Hero */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
                      <div className="w-full h-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs font-medium">
                        🏪 Store Banner
                      </div>
                      <div className="mt-2 text-xs font-bold text-slate-800">Welcome to our Online Store</div>
                      <div className="text-[11px] text-slate-500">Fast shipping & 24/7 WhatsApp assistance.</div>
                    </div>
                  </div>

                  {/* Expandable Chat Modal Preview if clicked or toggle */}
                  {simulatorModalOpen && (
                    <div className="absolute inset-x-3 bottom-20 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-20 animate-fade-in">
                      <div
                        style={{ backgroundColor: config.brand_color || '#25D366' }}
                        className="p-3 text-white relative"
                      >
                        <button
                          onClick={() => setSimulatorModalOpen(false)}
                          className="absolute top-2 right-2.5 text-white/80 hover:text-white text-sm"
                        >
                          &times;
                        </button>
                        <h5 className="font-bold text-xs">{config.welcome_heading || 'Need Help? Chat with Us!'}</h5>
                        <p className="text-[10px] text-white/90">{config.welcome_subheading || 'Replies in minutes'}</p>
                      </div>
                      <div className="p-3 bg-amber-50/50">
                        <div className="bg-white p-2.5 rounded-lg text-xs text-slate-800 shadow-sm border border-slate-100">
                          {config.default_chat_message || 'Hello! I have a question.'}
                        </div>
                      </div>
                      <div className="p-2.5 bg-white border-t border-slate-100">
                        <a
                          href={`https://wa.me/${(config.phone_number || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                            config.default_chat_message || 'Hello!'
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ backgroundColor: config.brand_color || '#25D366' }}
                          className="w-full py-2 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                          {config.call_to_action_badge || 'Start Chat'}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Floating Widget Mockup */}
                  <div
                    className={`flex flex-col ${
                      config.widget_position === 'bottom-left' ? 'items-start' : 'items-end'
                    }`}
                  >
                    {config.call_to_action_badge && (
                      <div
                        onClick={() => setSimulatorModalOpen(!simulatorModalOpen)}
                        className="bg-white px-3 py-1 rounded-full text-slate-800 text-[11px] font-bold shadow-md border border-slate-200/80 mb-2 cursor-pointer flex items-center gap-1.5 hover:scale-105 transition"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {config.call_to_action_badge}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setSimulatorModalOpen(!simulatorModalOpen)}
                      style={{ backgroundColor: config.brand_color || '#25D366' }}
                      className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 hover:scale-110 transition"
                    >
                      <WhatsAppIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Product Page Simulator Screen */
                <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto bg-white">
                  <div className="space-y-3">
                    {/* Simulated Product Image */}
                    <div className="w-full h-36 bg-gradient-to-tr from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-4xl shadow-inner">
                      🎧
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        In Stock
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        Wireless Active Noise Cancelling Headphones
                      </h4>
                      <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                        ₹3,499{' '}
                        <span className="text-xs font-normal text-slate-400 line-through">₹5,999</span>
                      </p>
                    </div>

                    {/* Standard Add to Cart button */}
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold"
                    >
                      Add to Cart
                    </button>

                    {/* Injected "Order on WhatsApp" Button */}
                    {config.buy_button_enabled && (
                      <a
                        href={`https://wa.me/${(config.phone_number || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hi, I want to order Wireless Active Noise Cancelling Headphones (Price: ₹3,499) from ${cleanShop}. Please confirm availability!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor:
                            config.buy_button_style === 'outline'
                              ? 'transparent'
                              : config.buy_button_bg_color || '#25D366',
                          color:
                            config.buy_button_style === 'outline'
                              ? config.buy_button_bg_color || '#25D366'
                              : config.buy_button_text_color || '#FFFFFF',
                          borderColor: config.buy_button_bg_color || '#25D366',
                        }}
                        className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md transition hover:scale-[1.02] border ${
                          config.buy_button_style === 'outline' ? 'border-2' : 'border-transparent'
                        }`}
                      >
                        <WhatsAppIcon className="w-4 h-4" />
                        {config.buy_button_text || 'Order on WhatsApp'}
                      </a>
                    )}
                  </div>

                  <p className="text-[10px] text-center text-slate-400 mt-4">
                    💡 Clicking the button opens WhatsApp pre-filled with this product's title and price.
                  </p>
                </div>
              )}
            </div>

            {/* Hint below preview */}
            <p className="text-[11px] text-slate-400 text-center mt-2.5">
              Live preview dynamically reflects your settings in real time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
