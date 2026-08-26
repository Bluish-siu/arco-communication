import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  ExternalLink,
  QrCode,
  Edit3,
  Code2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Ban,
  Users,
  DollarSign,
  Headphones,
  ShoppingBag,
  Smile,
  Utensils,
  Coffee,
  GraduationCap,
  Car,
  Compass,
  Salad,
  Download,
  Code,
  X,
  Send,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { apiRequest } from '../services/api';

// Official WhatsApp Logo SVG
function WhatsAppIcon({ className = 'w-5 h-5', fill = 'currentColor' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={fill} xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.415z" />
    </svg>
  );
}

// Shopify Shopping Bag Logo SVG
function ShopifyLogoSmall({ className = 'w-9 h-9' }) {
  return (
    <svg className={className} viewBox="0 0 109.4 124.5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M74.6 15.6c-.4-.3-1-.3-1.4 0-.4.3-15.6 11.6-15.6 11.6s-10.4-7.5-11.4-8.2c-1-.7-3-.5-3.8.3L37.1 24.5s-6.3-4.7-9.5-7.1c-.8-.6-1.9-.4-2.5.3L1.5 45.4c-.6.7-.7 1.8-.2 2.6l49.9 74.8c.4.6 1.1 1 1.9 1s1.5-.4 1.9-1l52.7-74.8c.5-.8.4-1.9-.2-2.6L74.6 15.6z" fill="#95BF47" />
      <path d="M62.6 123.8l45.1-64.1c.5-.8.4-1.9-.2-2.6L74.6 15.6c-.4-.3-1-.3-1.4 0-.4.3-15.6 11.6-15.6 11.6l4.2 96.3c.3.2.5.3.8.3z" fill="#5E8E3E" />
      <path d="M57.6 27.2L42.4 19.3c-1-.7-3-.5-3.8.3L33.3 24.7l24.3 99.1 4.2-96.6s-1.8-1.5-4.2 0z" fill="#95BF47" />
      <path d="M51.3 47.9c-1.3 0-2.3 1-2.3 2.3 0 6.6 4.7 10.3 10.3 10.3 6.9 0 10.9-4.8 10.9-10.8 0-8.8-8.1-10.5-12.8-13.4-3.3-2-5.4-4-5.4-7.5 0-4.5 3.5-7.7 8.3-7.7 3.9 0 6.8 1.8 8.1 4.5.4.9 1.5 1.3 2.4.9l4.5-2.2c.8-.4 1.1-1.4.7-2.2-2.4-5.1-7.7-8.3-15.7-8.3-9.5 0-16.1 6.5-16.1 15 0 9.1 7.6 12.4 12.7 15.3 3.6 2.1 5.9 4.3 5.9 7.8 0 4.1-3.6 6.7-7.7 6.7-4.7 0-8.3-2.6-8.9-6.3-.2-.9-1-1.6-2-1.6l-5 .5z" fill="#FFFFFF" />
    </svg>
  );
}

// WordPress Official Logo SVG
function WordPressLogoSmall({ className = 'w-9 h-9' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.9C5.99 22.9 1.1 18.01 1.1 12c0-2.18.64-4.22 1.74-5.94l6.02 16.5c.98.22 2.05.34 3.14.34zm6.65-15.71c.78.96 1.34 2.11 1.62 3.37L15.93 21.4c3.48-1.89 5.87-5.54 5.87-9.4 0-1.81-.53-3.49-1.45-4.91l-.7.1zm-8.81-.88c.68 0 1.25-.06 1.25-.06.57-.06.57-.91 0-.91 0 0-.85.06-1.77.06-.85 0-1.76-.06-1.76-.06-.57 0-.57.85 0 .91 0 0 .57.06 1.19.06l1.77 5.25-2.51 7.53-4.16-12.78c.68 0 1.25-.06 1.25-.06.57-.06.57-.91 0-.91 0 0-.85.06-1.77.06-.28 0-.62-.01-.97-.02C4.18 4.7 7.82 2.1 12 2.1c2.4 0 4.6.82 6.36 2.2-.28.02-.57.05-.83.17-1.14.51-1.94 1.54-1.94 2.85 0 1.03.46 1.94 1.03 2.97.46.85.97 1.88.97 3.42 0 1.09-.34 2.45-.91 4.16l-3.25 9.7L9.84 6.31z" fill="#21759B" />
    </svg>
  );
}

// 12 Presets Palette
const COLOR_PRESETS = [
  { name: 'The Original', hex: '#25D366', colorDot: '#25D366' },
  { name: 'Teal Deal', hex: '#00B4D8', colorDot: '#00B4D8' },
  { name: 'Green Lime', hex: '#84CC16', colorDot: '#84CC16' },
  { name: 'Blue Lagoon', hex: '#3B82F6', colorDot: '#3B82F6' },
  { name: 'Red Cherry', hex: '#EF4444', colorDot: '#EF4444' },
  { name: 'Orange Sunset', hex: '#F97316', colorDot: '#F97316' },
  { name: 'Yellow Sand', hex: '#EAB308', colorDot: '#EAB308' },
  { name: 'Pink Margarita', hex: '#EC4899', colorDot: '#EC4899' },
  { name: 'Navy Suit', hex: '#1E3A8A', colorDot: '#1E3A8A' },
  { name: 'Purple Velvet', hex: '#8B5CF6', colorDot: '#8B5CF6' },
  { name: 'Silver Spoon', hex: '#9CA3AF', colorDot: '#9CA3AF' },
  { name: 'Dark Night', hex: '#1F2937', colorDot: '#1F2937' },
];

// 13 Messenger Theme Illustration Presets
const MESSENGER_IMAGES = [
  { id: 'none', label: 'None', icon: Ban },
  { id: 'team', label: 'Team', icon: Users, color: 'text-indigo-500' },
  { id: 'finance', label: 'Finance', icon: DollarSign, color: 'text-amber-500' },
  { id: 'support', label: 'Support', icon: Headphones, color: 'text-emerald-500' },
  { id: 'grocery', label: 'Grocery', icon: ShoppingBag, color: 'text-purple-500' },
  { id: 'happy_team', label: 'Happy Team', icon: Smile, color: 'text-blue-500' },
  { id: 'food_1', label: 'Food 1', icon: Utensils, color: 'text-orange-500' },
  { id: 'food_2', label: 'Food 2', icon: Coffee, color: 'text-amber-600' },
  { id: 'food_3', label: 'Food 3', icon: Utensils, color: 'text-red-500' },
  { id: 'education', label: 'Education', icon: GraduationCap, color: 'text-sky-500' },
  { id: 'automobile', label: 'Automobile', icon: Car, color: 'text-rose-500' },
  { id: 'adventure', label: 'Adventure', icon: Compass, color: 'text-teal-500' },
  { id: 'healthy_food', label: 'Healthy Food', icon: Salad, color: 'text-green-600' },
];

export default function WhatsAppWidget() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialNav = searchParams.get('tab') === 'install' ? 'install' : 'customize';

  const [activeSubNav, setActiveSubNav] = useState(initialNav); // 'customize' | 'install'
  
  // Install Page State
  const [installPlatform, setInstallPlatform] = useState('code'); // 'code' | 'shopify' | 'wordpress'
  const [codeLanguage, setCodeLanguage] = useState('Javascript');

  // Accordion open states (1-5)
  const [openAccordions, setOpenAccordions] = useState({
    1: true,  // Style your WhatsApp chat button
    2: false, // Design your messenger
    3: false, // Set your welcome message
    4: false, // Set your Chat Button position
    5: false, // Configure your WhatsApp number
  });

  const toggleAccordion = (index) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Widget Configuration State
  const [buttonType, setButtonType] = useState('with-text'); // 'with-text' | 'icon-only'
  const [buttonText, setButtonText] = useState('Chat with us');
  const [buttonColor, setButtonColor] = useState('#25D366');
  const [isCustomColorOpen, setIsCustomColorOpen] = useState(false);
  const [customColor, setCustomColor] = useState('#25D366');

  const [selectedMessengerImage, setSelectedMessengerImage] = useState('team');
  const [greetingsText, setGreetingsText] = useState('HI THERE!');
  const [introMessage, setIntroMessage] = useState(
    'We are here to help you! Chat with us on WhatsApp for any queries.'
  );

  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' | 'mobile'
  const [desktopPosition, setDesktopPosition] = useState('right'); // 'left' | 'right'
  const [desktopSideSpacing, setDesktopSideSpacing] = useState('10');
  const [desktopBottomSpacing, setDesktopBottomSpacing] = useState('10');
  const [mobilePosition, setMobilePosition] = useState('right');
  const [mobileSideSpacing, setMobileSideSpacing] = useState('10');
  const [mobileBottomSpacing, setMobileBottomSpacing] = useState('10');

  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [prefilledMessage, setPrefilledMessage] = useState(
    'Hi, I have a question regarding your products.'
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isPreviewPopupOpen, setIsPreviewPopupOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load widget settings from backend API
  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/settings/widget');
      if (res.success && res.data) {
        const d = res.data;
        if (d.buttonType) setButtonType(d.buttonType);
        if (d.ctaText || d.buttonText) setButtonText(d.ctaText || d.buttonText);
        if (d.buttonColor) setButtonColor(d.buttonColor);
        if (d.messengerImage) setSelectedMessengerImage(d.messengerImage);
        if (d.greetingMessage || d.greetingsText) setGreetingsText(d.greetingMessage || d.greetingsText);
        if (d.introMessage) setIntroMessage(d.introMessage);
        if (d.desktopPosition) setDesktopPosition(d.desktopPosition);
        if (d.desktopSideSpacing) setDesktopSideSpacing(d.desktopSideSpacing);
        if (d.desktopBottomSpacing) setDesktopBottomSpacing(d.desktopBottomSpacing);
        if (d.mobilePosition) setMobilePosition(d.mobilePosition);
        if (d.mobileSideSpacing) setMobileSideSpacing(d.mobileSideSpacing);
        if (d.mobileBottomSpacing) setMobileBottomSpacing(d.mobileBottomSpacing);
        if (d.phoneNumber) {
          const raw = d.phoneNumber.replace(/[^0-9+]/g, '');
          if (raw.startsWith('+')) {
            setCountryCode(raw.slice(0, 3));
            setPhoneNumber(raw.slice(3));
          } else {
            setPhoneNumber(raw);
          }
        }
        if (d.prefilledMessage) setPrefilledMessage(d.prefilledMessage);
      }
    } catch (err) {
      console.warn('[WhatsApp Widget] Error loading widget settings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubNavChange = (nav) => {
    setActiveSubNav(nav);
    setSearchParams(nav === 'install' ? { tab: 'install' } : {});
  };

  // Save Settings to Backend
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        buttonType,
        buttonText,
        ctaText: buttonText,
        buttonColor,
        messengerImage: selectedMessengerImage,
        greetingsText,
        greetingMessage: greetingsText,
        introMessage,
        desktopPosition,
        desktopSideSpacing,
        desktopBottomSpacing,
        mobilePosition,
        mobileSideSpacing,
        mobileBottomSpacing,
        phoneNumber: `${countryCode}${phoneNumber}`,
        prefilledMessage,
      };

      const res = await apiRequest('/settings/widget', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        showToast('Widget settings saved successfully!', 'success');
      } else {
        showToast(res.error || 'Failed to save settings', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const cleanPhoneFull = `${countryCode.replace(/[^0-9]/g, '')}${phoneNumber.replace(/[^0-9]/g, '')}`;
  const embedScript = `<script async src="https://widget.arcocommunication.com/widget.js" data-arco-widget-id="arco_wgt_${cleanPhoneFull || 'demo'}"></script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedScript);
    setCopied(true);
    showToast('Code copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const waTestUrl = `https://wa.me/${cleanPhoneFull}?text=${encodeURIComponent(prefilledMessage)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(waTestUrl)}`;

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 relative font-sans">
      {/* 1. MAIN ARCO LEFT SIDEBAR */}
      <DashboardSidebar />

      {/* 2. TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold transition-all animate-in slide-in-from-top-2 ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 3. WIDGET INNER LAYOUT */}
      <div className="flex-1 pl-14 sm:pl-16 flex min-h-screen">
        
        {/* Left Secondary Sub-Panel (Interakt Sub-Navigation) */}
        <div className="w-48 sm:w-52 border-r border-slate-200 bg-white p-5 shrink-0 hidden md:block select-none">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-4">
            WhatsApp Widget
          </h2>
          <nav className="space-y-1">
            <button
              onClick={() => handleSubNavChange('customize')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeSubNav === 'customize'
                  ? 'bg-emerald-50/70 text-emerald-800 font-bold border-l-3 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Customize
            </button>
            <button
              onClick={() => handleSubNavChange('install')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeSubNav === 'install'
                  ? 'bg-emerald-50/70 text-emerald-800 font-bold border-l-3 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Install
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 sm:p-8 max-w-5xl overflow-y-auto pb-32">
          
          {/* Mobile Top Tabs (When < md) */}
          <div className="md:hidden flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
            <button
              onClick={() => handleSubNavChange('customize')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg ${
                activeSubNav === 'customize'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Customize
            </button>
            <button
              onClick={() => handleSubNavChange('install')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg ${
                activeSubNav === 'install'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Install
            </button>
          </div>

          {/* VIEW 1: CUSTOMIZE ACCORDION SUITE */}
          {activeSubNav === 'customize' && (
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                  <Edit3 className="w-4 h-4 text-slate-600" />
                  <span>Customize WhatsApp chat button</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Style WhatsApp chat button and messenger thats right for you.
                </p>
              </div>

              {/* 5 Accordion Cards */}
              <div className="space-y-4">
                
                {/* ------------------------------------------------------------- */}
                {/* ACCORDION 1: Style your WhatsApp chat button */}
                {/* ------------------------------------------------------------- */}
                <div
                  className={`bg-white rounded-lg transition-all border ${
                    openAccordions[1]
                      ? 'border-emerald-600 shadow-xs ring-1 ring-emerald-600/30'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(1)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        Style your WhatsApp chat button
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Pick a beautiful chat button designs what suits your website best
                      </p>
                    </div>
                    {openAccordions[1] ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {openAccordions[1] && (
                    <div className="px-5 pb-6 pt-2 border-t border-slate-100 space-y-6">
                      {/* Button Type Selection */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-0.5">
                          Button Type
                        </label>
                        <p className="text-[11px] text-slate-500 mb-3">
                          Pick chat button type that suits your business
                        </p>

                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                              type="radio"
                              name="buttonType"
                              value="with-text"
                              checked={buttonType === 'with-text'}
                              onChange={() => setButtonType('with-text')}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                            />
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold shadow-xs">
                              <WhatsAppIcon className="w-4 h-4" fill="white" />
                              <span>{buttonText || 'Chat With Us'}</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                              type="radio"
                              name="buttonType"
                              value="icon-only"
                              checked={buttonType === 'icon-only'}
                              onChange={() => setButtonType('icon-only')}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                            />
                            <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xs">
                              <WhatsAppIcon className="w-5 h-5" fill="white" />
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Change Button Text */}
                      {buttonType === 'with-text' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-0.5">
                            Change button text
                          </label>
                          <p className="text-[11px] text-slate-500 mb-2">
                            Customize the text which appears on your button
                          </p>
                          <input
                            type="text"
                            value={buttonText}
                            onChange={(e) => setButtonText(e.target.value)}
                            placeholder="Chat with us"
                            className="w-full max-w-xs px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                          />
                        </div>
                      )}

                      {/* Button Color Palette */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-0.5">
                          Button Color
                        </label>
                        <p className="text-[11px] text-slate-500 mb-3">
                          Pick one of the following beautiful colors or configure your own
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-2xl">
                          {COLOR_PRESETS.map((preset) => {
                            const isSelected = buttonColor.toLowerCase() === preset.hex.toLowerCase();
                            return (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => {
                                  setButtonColor(preset.hex);
                                  setIsCustomColorOpen(false);
                                }}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-purple-600 bg-white text-slate-900 shadow-2xs ring-1 ring-purple-500/20'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                <span
                                  className="w-4 h-4 rounded-full shrink-0 shadow-2xs"
                                  style={{ backgroundColor: preset.colorDot }}
                                />
                                <span className="truncate">{preset.name}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Color Option */}
                        <div className="mt-3 flex items-center justify-end max-w-2xl">
                          {isCustomColorOpen ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={customColor}
                                onChange={(e) => {
                                  setCustomColor(e.target.value);
                                  setButtonColor(e.target.value);
                                }}
                                className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={customColor}
                                onChange={(e) => {
                                  setCustomColor(e.target.value);
                                  setButtonColor(e.target.value);
                                }}
                                className="w-24 px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                              />
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setIsCustomColorOpen(true)}
                              className="text-xs text-sky-600 hover:text-sky-800 font-semibold cursor-pointer"
                            >
                              Pick a custom color
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* ACCORDION 2: Design your messenger */}
                {/* ------------------------------------------------------------- */}
                <div
                  className={`bg-white rounded-lg transition-all border ${
                    openAccordions[2]
                      ? 'border-emerald-600 shadow-xs ring-1 ring-emerald-600/30'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(2)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        Design your messenger
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Pick a beautiful image for your messenger
                      </p>
                    </div>
                    {openAccordions[2] ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {openAccordions[2] && (
                    <div className="px-5 pb-6 pt-2 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-800 mb-0.5">
                        Select Image
                      </label>
                      <p className="text-[11px] text-slate-500 mb-4">
                        Choose Image for your business
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                        {MESSENGER_IMAGES.map((img) => {
                          const Icon = img.icon;
                          const isSelected = selectedMessengerImage === img.id;
                          return (
                            <button
                              key={img.id}
                              type="button"
                              onClick={() => {
                                setSelectedMessengerImage(img.id);
                                setIsPreviewPopupOpen(true);
                              }}
                              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer h-28 ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-50/30 ring-2 ring-emerald-600/30 shadow-xs'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                                <Icon className={`w-6 h-6 ${img.color || 'text-slate-400'}`} />
                              </div>
                              <span className="text-xs font-semibold text-slate-700">
                                {img.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* ACCORDION 3: Set your welcome message */}
                {/* ------------------------------------------------------------- */}
                <div
                  className={`bg-white rounded-lg transition-all border ${
                    openAccordions[3]
                      ? 'border-emerald-600 shadow-xs ring-1 ring-emerald-600/30'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(3)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        Set your welcome message
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Welcome your customers
                      </p>
                    </div>
                    {openAccordions[3] ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {openAccordions[3] && (
                    <div className="px-5 pb-6 pt-2 border-t border-slate-100 space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-0.5">
                          Greetings
                        </label>
                        <p className="text-[11px] text-slate-500 mb-2">
                          Say Hi to your customers when they open messenger
                        </p>
                        <input
                          type="text"
                          value={greetingsText}
                          onChange={(e) => setGreetingsText(e.target.value)}
                          onFocus={() => setIsPreviewPopupOpen(true)}
                          placeholder="HI THERE!"
                          className="w-full max-w-xs px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-semibold uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-0.5">
                          Intro Message
                        </label>
                        <p className="text-[11px] text-slate-500 mb-2">
                          Introduce your business and tell customers how you can help
                        </p>
                        <textarea
                          rows={3}
                          value={introMessage}
                          onChange={(e) => setIntroMessage(e.target.value)}
                          onFocus={() => setIsPreviewPopupOpen(true)}
                          placeholder="We are here to help you! Chat with us on WhatsApp for any queries."
                          className="w-full max-w-md px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* ACCORDION 4: Set your Chat Button position */}
                {/* ------------------------------------------------------------- */}
                <div
                  className={`bg-white rounded-lg transition-all border ${
                    openAccordions[4]
                      ? 'border-emerald-600 shadow-xs ring-1 ring-emerald-600/30'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(4)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        Set your Chat Button position
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Adjust your button position on computers and mobile
                      </p>
                    </div>
                    {openAccordions[4] ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {openAccordions[4] && (
                    <div className="px-5 pb-6 pt-2 border-t border-slate-100 space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-2">
                          Chat Button Preview
                        </label>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                            <input
                              type="radio"
                              name="previewMode"
                              value="desktop"
                              checked={previewMode === 'desktop'}
                              onChange={() => setPreviewMode('desktop')}
                              className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                            />
                            Desktop Preview
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                            <input
                              type="radio"
                              name="previewMode"
                              value="mobile"
                              checked={previewMode === 'mobile'}
                              onChange={() => setPreviewMode('mobile')}
                              className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                            />
                            Mobile Preview
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-2">
                          Desktop Launcher Position
                        </label>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                            <input
                              type="radio"
                              name="desktopPosition"
                              value="left"
                              checked={desktopPosition === 'left'}
                              onChange={() => setDesktopPosition('left')}
                              className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                            />
                            Left
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                            <input
                              type="radio"
                              name="desktopPosition"
                              value="right"
                              checked={desktopPosition === 'right'}
                              onChange={() => setDesktopPosition('right')}
                              className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                            />
                            Right
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-8 text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <span>Desktop Side Spacing</span>
                          <input
                            type="number"
                            value={desktopSideSpacing}
                            onChange={(e) => setDesktopSideSpacing(e.target.value)}
                            className="w-16 px-2.5 py-1 bg-white border border-slate-300 rounded text-xs text-center font-mono"
                          />
                          <span>px</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span>Desktop Bottom Spacing</span>
                          <input
                            type="number"
                            value={desktopBottomSpacing}
                            onChange={(e) => setDesktopBottomSpacing(e.target.value)}
                            className="w-16 px-2.5 py-1 bg-white border border-slate-300 rounded text-xs text-center font-mono"
                          />
                          <span>px</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-2">
                          Mobile Launcher Position
                        </label>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                            <input
                              type="radio"
                              name="mobilePosition"
                              value="left"
                              checked={mobilePosition === 'left'}
                              onChange={() => setMobilePosition('left')}
                              className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                            />
                            Left
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                            <input
                              type="radio"
                              name="mobilePosition"
                              value="right"
                              checked={mobilePosition === 'right'}
                              onChange={() => setMobilePosition('right')}
                              className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                            />
                            Right
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-8 text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <span>Mobile Side Spacing</span>
                          <input
                            type="number"
                            value={mobileSideSpacing}
                            onChange={(e) => setMobileSideSpacing(e.target.value)}
                            className="w-16 px-2.5 py-1 bg-white border border-slate-300 rounded text-xs text-center font-mono"
                          />
                          <span>px</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span>Mobile Bottom Spacing</span>
                          <input
                            type="number"
                            value={mobileBottomSpacing}
                            onChange={(e) => setMobileBottomSpacing(e.target.value)}
                            className="w-16 px-2.5 py-1 bg-white border border-slate-300 rounded text-xs text-center font-mono"
                          />
                          <span>px</span>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* ACCORDION 5: Configure your WhatsApp number */}
                {/* ------------------------------------------------------------- */}
                <div
                  className={`bg-white rounded-lg transition-all border ${
                    openAccordions[5]
                      ? 'border-emerald-600 shadow-xs ring-1 ring-emerald-600/30'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(5)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        Configure your WhatsApp number
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Connect the WhatsApp number to the messenger
                      </p>
                    </div>
                    {openAccordions[5] ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {openAccordions[5] && (
                    <div className="px-5 pb-6 pt-2 border-t border-slate-100 space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-0.5">
                          WhatsApp Number
                        </label>
                        <p className="text-[11px] text-slate-500 mb-2">
                          Enter your WhatsApp business phone number
                        </p>
                        <div className="flex items-center gap-2 max-w-sm">
                          <input
                            type="text"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            placeholder="+91"
                            className="w-16 px-2.5 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-800 font-mono text-center"
                          />
                          <input
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="9876543210"
                            className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-800 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-0.5">
                          Pre-filled Message
                        </label>
                        <p className="text-[11px] text-slate-500 mb-2">
                          Message pre-filled in customer's WhatsApp chat
                        </p>
                        <input
                          type="text"
                          value={prefilledMessage}
                          onChange={(e) => setPrefilledMessage(e.target.value)}
                          placeholder="Hi, I have a question regarding..."
                          className="w-full max-w-md px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom Action Bar: Save Changes */}
              <div className="mt-8 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>

            </div>
          )}

          {/* VIEW 2: INSTALL & EMBED CODE (Interakt Screenshot 2 Replica) */}
          {activeSubNav === 'install' && (
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <Download className="w-4 h-4 text-slate-700" />
                  <span>Install widget to your website</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Install WhatsApp chat button and messenger
                </p>
              </div>

              {/* Section: Add chat to your website */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">
                  Add chat to your website
                </h3>

                {/* Three Option Cards Grid: With Code | With Shopify | With Wordpress */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl">
                  
                  {/* Card 1: With Code */}
                  <button
                    type="button"
                    onClick={() => setInstallPlatform('code')}
                    className={`relative p-8 rounded-lg border flex flex-col items-center justify-center gap-4 transition-all cursor-pointer h-36 bg-white ${
                      installPlatform === 'code'
                        ? 'border-blue-400 ring-2 ring-blue-400/30 shadow-xs'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {installPlatform === 'code' && (
                      <div className="absolute top-2.5 right-2.5 text-emerald-600">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    )}
                    <span className="text-2xl font-mono text-blue-600 font-bold select-none tracking-tight">
                      &lt;/&gt;
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      With Code
                    </span>
                  </button>

                  {/* Card 2: With Shopify */}
                  <button
                    type="button"
                    onClick={() => setInstallPlatform('shopify')}
                    className={`relative p-8 rounded-lg border flex flex-col items-center justify-center gap-3 transition-all cursor-pointer h-36 bg-white ${
                      installPlatform === 'shopify'
                        ? 'border-blue-400 ring-2 ring-blue-400/30 shadow-xs'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {installPlatform === 'shopify' && (
                      <div className="absolute top-2.5 right-2.5 text-emerald-600">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    )}
                    <ShopifyLogoSmall className="w-8 h-8" />
                    <span className="text-xs font-semibold text-slate-700">
                      With Shopify
                    </span>
                  </button>

                  {/* Card 3: With Wordpress */}
                  <button
                    type="button"
                    onClick={() => setInstallPlatform('wordpress')}
                    className={`relative p-8 rounded-lg border flex flex-col items-center justify-center gap-3 transition-all cursor-pointer h-36 bg-white ${
                      installPlatform === 'wordpress'
                        ? 'border-blue-400 ring-2 ring-blue-400/30 shadow-xs'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {installPlatform === 'wordpress' && (
                      <div className="absolute top-2.5 right-2.5 text-emerald-600">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    )}
                    <WordPressLogoSmall className="w-8 h-8" />
                    <span className="text-xs font-semibold text-slate-700">
                      With Wordpress
                    </span>
                  </button>

                </div>

                {/* Below Cards: Installation Content Box */}
                <div className="mt-8 max-w-4xl space-y-4">
                  
                  {/* PLATFORM 1: WITH CODE */}
                  {installPlatform === 'code' && (
                    <div className="space-y-4">
                      {/* Language Dropdown Selector */}
                      <div>
                        <select
                          value={codeLanguage}
                          onChange={(e) => setCodeLanguage(e.target.value)}
                          className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
                        >
                          <option value="Javascript">Javascript</option>
                          <option value="HTML">HTML</option>
                          <option value="React">React / Next.js</option>
                        </select>
                      </div>

                      {/* Instruction Line */}
                      <p className="text-xs text-slate-600">
                        1. Copy this code and paste it to your website
                      </p>

                      {/* Code Snippet Box (Matching Interakt screenshot format) */}
                      <div className="bg-white border border-slate-300 rounded-md p-5 shadow-2xs relative">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-mono text-slate-500">
                            Paste before &lt;/body&gt; tag
                          </span>
                          <button
                            type="button"
                            onClick={copyEmbedCode}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded text-xs font-bold border border-emerald-300/60 transition-colors cursor-pointer"
                          >
                            {copied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy Code
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3.5 bg-slate-900 text-slate-200 rounded font-mono text-xs overflow-x-auto leading-relaxed">
                          <code>{embedScript}</code>
                        </pre>
                      </div>

                      {/* Step-by-step Instructions */}
                      <div className="bg-white border border-slate-300 rounded-md p-5 shadow-2xs space-y-2.5">
                        <h4 className="text-xs font-bold text-slate-900">
                          Installation Instructions
                        </h4>
                        <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 leading-relaxed">
                          <li>Copy your 1-line script tag above.</li>
                          <li>Paste the snippet right before the closing <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">&lt;/body&gt;</code> tag of your website HTML or theme template.</li>
                          <li>Save and reload your website. The WhatsApp widget will appear immediately in your configured corner.</li>
                        </ol>
                      </div>

                      {/* Preserved ARCO Capability: Offline QR Code & Direct Chat Link */}
                      <div className="bg-white border border-slate-200/90 rounded-md p-5 shadow-2xs mt-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                            <QrCode className="w-4 h-4 text-emerald-600" />
                            <span>Direct QR Code & Mobile Testing</span>
                          </div>
                          <a
                            href={waTestUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                          >
                            Test on WhatsApp <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-5 pt-3">
                          <div className="w-28 h-28 p-1.5 bg-white border border-slate-200 rounded-lg shadow-xs shrink-0">
                            <img src={qrCodeUrl} alt="WhatsApp QR Code" className="w-full h-full object-contain" />
                          </div>
                          <div className="space-y-1 text-xs text-slate-600">
                            <p className="font-medium text-slate-800">Flyer & Print QR Code</p>
                            <p className="text-[11px] text-slate-500">
                              Scan to open WhatsApp directly with pre-filled message: <span className="font-mono text-slate-700">"{prefilledMessage}"</span>
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* PLATFORM 2: WITH SHOPIFY (COMING SOON) */}
                  {installPlatform === 'shopify' && (
                    <div className="bg-white border border-slate-300 rounded-md p-12 shadow-2xs flex flex-col items-center justify-center text-center space-y-3">
                      <ShopifyLogoSmall className="w-12 h-12 opacity-80" />
                      <h4 className="text-base font-bold text-slate-800">Coming Soon</h4>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Direct 1-click Shopify App Store installation is coming soon. In the meantime, select <strong className="text-slate-700 font-semibold">With Code</strong> to paste the embed script directly into your Shopify theme.
                      </p>
                    </div>
                  )}

                  {/* PLATFORM 3: WITH WORDPRESS (COMING SOON) */}
                  {installPlatform === 'wordpress' && (
                    <div className="bg-white border border-slate-300 rounded-md p-12 shadow-2xs flex flex-col items-center justify-center text-center space-y-3">
                      <WordPressLogoSmall className="w-12 h-12 opacity-80" />
                      <h4 className="text-base font-bold text-slate-800">Coming Soon</h4>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Direct WordPress plugin installation is coming soon. In the meantime, select <strong className="text-slate-700 font-semibold">With Code</strong> to paste the embed snippet into your WordPress theme footer.
                      </p>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* 4. FIXED FLOATING PREVIEW (Interakt Bottom-Right Style with Live Positioning & Messenger Preview) */}
      {(() => {
        const currentPos = previewMode === 'desktop' ? desktopPosition : mobilePosition;
        const currentSideNum = parseInt(previewMode === 'desktop' ? desktopSideSpacing : mobileSideSpacing, 10);
        const currentBottomNum = parseInt(previewMode === 'desktop' ? desktopBottomSpacing : mobileBottomSpacing, 10);
        const validSide = Number.isNaN(currentSideNum) ? 10 : Math.max(0, Math.min(300, currentSideNum));
        const validBottom = Number.isNaN(currentBottomNum) ? 10 : Math.max(0, Math.min(300, currentBottomNum));

        const activeImgObj = MESSENGER_IMAGES.find((m) => m.id === selectedMessengerImage) || MESSENGER_IMAGES[0];
        const ActiveImgIcon = activeImgObj.icon;

        return (
          <div
            className="fixed z-40 flex flex-col pointer-events-auto select-none transition-all duration-200"
            style={{
              bottom: `${validBottom + 16}px`,
              ...(currentPos === 'left'
                ? { left: `${validSide + 16}px`, alignItems: 'flex-start' }
                : { right: `${validSide + 16}px`, alignItems: 'flex-end' }
              ),
            }}
          >
            <span className="text-[11px] font-semibold text-slate-400 mb-1.5 px-1">
              Preview
            </span>

            {/* Live Interactive Messenger Popup Card */}
            {isPreviewPopupOpen && (
              <div className="mb-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header with Selected Messenger Image */}
                <div
                  className="p-3.5 text-white flex items-center justify-between transition-colors"
                  style={{ backgroundColor: buttonColor }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                      {selectedMessengerImage === 'none' ? (
                        <WhatsAppIcon className="w-4 h-4" fill="white" />
                      ) : (
                        <ActiveImgIcon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="leading-tight">
                      <div className="font-bold text-xs truncate max-w-[140px]">
                        ARCO Communication
                      </div>
                      <div className="text-[10px] text-white/80">
                        Typically replies in minutes
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPreviewPopupOpen(false)}
                    className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer transition-colors"
                    title="Close preview popup"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Messenger Body with Greetings, Intro Message & Pre-filled Message */}
                <div className="p-3.5 bg-slate-50/80 space-y-2.5">
                  {/* Greetings & Intro Message */}
                  <div className="bg-white p-3 rounded-xl shadow-2xs border border-slate-100 space-y-1">
                    <h4 className="text-[11px] font-bold text-slate-900 tracking-wide uppercase">
                      {greetingsText || 'HI THERE!'}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {introMessage || 'We are here to help you! Chat with us on WhatsApp for any queries.'}
                    </p>
                  </div>

                  {/* Pre-filled Message Snippet */}
                  <div className="p-2 bg-slate-100 rounded-lg text-[11px] text-slate-500 font-mono truncate">
                    {prefilledMessage || 'Hi, I have a question...'}
                  </div>

                  {/* Start Chat Button */}
                  <button
                    type="button"
                    onClick={() => window.open(waTestUrl, '_blank')}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-xs transition-opacity hover:opacity-95 cursor-pointer"
                    style={{ backgroundColor: buttonColor }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Start Chat on WhatsApp
                  </button>
                </div>
              </div>
            )}

            {/* Floating Trigger Button */}
            {buttonType === 'with-text' ? (
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 text-white font-bold text-xs rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
                style={{ backgroundColor: buttonColor }}
                onClick={() => setIsPreviewPopupOpen(!isPreviewPopupOpen)}
                title="Toggle WhatsApp preview"
              >
                <WhatsAppIcon className="w-4 h-4" fill="white" />
                <span>{buttonText || 'Chat with us'}</span>
              </button>
            ) : (
              <button
                type="button"
                className="w-12 h-12 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
                style={{ backgroundColor: buttonColor }}
                onClick={() => setIsPreviewPopupOpen(!isPreviewPopupOpen)}
                title="Toggle WhatsApp preview"
              >
                <WhatsAppIcon className="w-6 h-6" fill="white" />
              </button>
            )}
          </div>
        );
      })()}

    </div>
  );
}
