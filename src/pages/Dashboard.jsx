import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  PhoneCall,
  MessageSquare,
  TrendingUp,
  Settings,
  Bell,
  User,
  LogOut,
  ChevronRight,
  Plus,
  Zap,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ShieldAlert,
  Megaphone,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import Container from '../components/common/Container';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { metaService } from '../services/metaService';

// Custom Contextual Instagram Icon
const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// WhatsApp Contextual SVG Icon
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, businessSetup, industryData, objectives, integrations, logout, resetOnboarding } = useOnboarding();

  const [activeChannelTab, setActiveChannelTab] = useState('whatsapp');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [metaStatus, setMetaStatus] = useState(null);

  const userName = businessSetup.companyName || user.name || 'Business Owner';

  useEffect(() => {
    async function loadMetaStatus() {
      const st = await metaService.getStatus();
      setMetaStatus(st);
    }
    loadMetaStatus();
  }, []);

  const handleDisconnectWhatsApp = async () => {
    if (window.confirm('Are you sure you want to disconnect your WhatsApp Business Account?')) {
      await metaService.disconnect();
      setMetaStatus({ connected: false });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 relative">
      {/* 0. HOVER-EXPAND SIDEBAR NAVIGATION */}
      <DashboardSidebar />

      {/* Main Dashboard Wrapper with Left Offset for Compact Sidebar Trigger Rail */}
      <div className="flex-1 flex flex-col pl-14 sm:pl-16 transition-all duration-200">
        
        {/* 1. TOP DASHBOARD HEADER */}
        <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
          <Container>
            <div className="flex items-center justify-between h-16 sm:h-18">
              {/* Brand Logo & Workspace Tag */}
              <div className="flex items-center gap-3">
                <Link to="/" className="flex items-center group">
                  <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 leading-none">
                    ARCO <span className="font-semibold text-slate-800">Communication</span>
                  </span>
                </Link>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  Workspace
                </span>
              </div>

              {/* Right Controls: Trial, Notifications, Settings, Profile */}
              <div className="flex items-center gap-3">
                {/* Trial Badge */}
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                  <Clock className="w-3.5 h-3.5 text-red-600" />
                  <span>14 Days Trial Remaining</span>
                </div>

                {/* Notification Button */}
                <button
                  type="button"
                  onClick={() => setActiveModal(activeModal === 'notif' ? null : 'notif')}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors relative cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="w-2 h-2 rounded-full bg-red-600 absolute top-1.5 right-1.5" />
                </button>

                {/* Settings Button */}
                <Link
                  to="/onboarding/integrations"
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  aria-label="Settings"
                >
                  <Settings className="w-4 h-4" />
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">
                      {userName}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-2 border-b border-slate-100 text-xs">
                        <div className="font-bold text-slate-900">{userName}</div>
                        <div className="text-slate-400 truncate text-[11px]">{user.email || 'user@company.com'}</div>
                        <div className="text-[10px] text-red-600 font-semibold mt-0.5">
                          {industryData.industry || 'Business Plan'}
                        </div>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/onboarding"
                          className="block px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          Edit Business Profile
                        </Link>
                        <Link
                          to="/pricing"
                          className="block px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          Upgrade Subscription
                        </Link>
                      </div>
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </Container>
        </header>

        {/* 2. MAIN DASHBOARD CONTENT */}
        <main className="flex-1 py-8 sm:py-12">
          <Container>
            <div className="max-w-6xl mx-auto space-y-8">
              
              {/* Top Greeting & Channel Selector Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Welcome to ARCO, {userName}!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Manage your WhatsApp & Instagram conversations, AI agents, and marketing workflows.
                  </p>
                </div>

                {/* Channel Tabs */}
                <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-2xs self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setActiveChannelTab('whatsapp')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeChannelTab === 'whatsapp'
                        ? 'bg-red-50 text-red-700 border border-red-200/80 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveChannelTab('instagram')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeChannelTab === 'instagram'
                        ? 'bg-red-50 text-red-700 border border-red-200/80 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <InstagramIcon className="w-4 h-4 text-purple-600" />
                    <span>Instagram</span>
                  </button>
                </div>
              </div>

              {/* 3. HERO AI AGENT BUILDER PROMOTION (Dark Navy + ARCO Red Glow) */}
              <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-8 space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-red-400 border border-slate-800">
                      <Sparkles className="w-3.5 h-3.5 text-red-500" />
                      <span>AI Autonomous Agent</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      Build Your AI Agent
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                      Create an AI agent to handle conversations, answer customer questions, qualify leads, and assist customers automatically around the clock.
                    </p>
                  </div>

                  <div className="lg:col-span-4 flex justify-start lg:justify-end">
                    <Link
                      to="/products/ai-agents"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 hover:shadow-xl transition-all cursor-pointer"
                    >
                      <Bot className="w-4 h-4" />
                      <span>Create Agent</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 4. QUICK CHANNEL SETUP CARDS */}
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-4 px-1">
                  Quick Setup Actions
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Card 1: Connect Number / WhatsApp Connected */}
                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                    {metaStatus?.connected ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                              <WhatsAppIcon className="w-5 h-5" />
                            </div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              ✓ Connected
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900">WhatsApp Business</h4>
                          <div className="text-xs text-slate-600 space-y-0.5">
                            <p className="font-semibold text-slate-900">{metaStatus.businessName || 'ARCO Communication'}</p>
                            <p className="font-mono text-emerald-700 font-bold">{metaStatus.displayPhoneNumber || '+91 98765 43210'}</p>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center gap-2">
                          <Link
                            to="/onboarding/meta-whatsapp?manage=true"
                            className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center transition-colors"
                          >
                            Manage
                          </Link>
                          <button
                            type="button"
                            onClick={handleDisconnectWhatsApp}
                            className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Disconnect
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            <WhatsAppIcon className="w-5 h-5" />
                          </div>
                          <h4 className="text-base font-bold text-slate-900">Connect Number</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Link your verified phone number with Meta WhatsApp Business Cloud API.
                          </p>
                        </div>

                        <Link
                          to="/onboarding/meta-whatsapp"
                          className="mt-5 w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs text-center block transition-all shadow-sm shadow-red-600/20"
                        >
                          Connect WhatsApp
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Card 2: Greetings Flow */}
                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                        <Zap className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900">Greetings Flow</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Set up instant automated welcome replies & interactive button menus.
                      </p>
                    </div>

                    <Link
                      to="/products/whatsapp-chatbots"
                      className="mt-5 w-full py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 hover:bg-slate-50 transition-colors text-center block"
                    >
                      Edit Flow
                    </Link>
                  </div>

                  {/* Card 3: FAQ Auto-replies */}
                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900">FAQ Auto-replies</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Upload your product FAQs and policy documents for instant answer bot.
                      </p>
                    </div>

                    <Link
                      to="/products/customer-support"
                      className="mt-5 w-full py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 hover:bg-slate-50 transition-colors text-center block"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>

              {/* 5. ONBOARDING OBJECTIVES SECTION */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                      Your Selected Growth Objectives
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tailored playbooks configured for {industryData.industry || 'your business'}.
                    </p>
                  </div>

                  <Link
                    to="/features"
                    className="text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                  >
                    <span>View All Modules</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Objective Card 1 */}
                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          Campaigns
                        </span>
                        <Megaphone className="w-4 h-4 text-red-600" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900">
                        Promote Releases & Updates
                      </h4>
                      <p className="text-xs text-slate-500">
                        Broadcast rich templates with 98% open rates via WhatsApp Bulk Campaigns.
                      </p>
                    </div>

                    <Link
                      to="/products/whatsapp-marketing"
                      className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs text-center shadow-xs transition-all block"
                    >
                      Setup Campaign
                    </Link>
                  </div>

                  {/* Objective Card 2 */}
                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Lead Generation
                        </span>
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900">
                        Generate Inbound Leads
                      </h4>
                      <p className="text-xs text-slate-500">
                        Route Meta & Instagram ads straight to chat via Click to WhatsApp Ads.
                      </p>
                    </div>

                    <Link
                      to="/products/sales-crm"
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center shadow-xs transition-all block"
                    >
                      Setup Ads
                    </Link>
                  </div>

                  {/* Objective Card 3 */}
                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Integration
                        </span>
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900">
                        Integrate with Google Sheets
                      </h4>
                      <p className="text-xs text-slate-500">
                        Automatically sync new customer leads and conversation responses to spreadsheets.
                      </p>
                    </div>

                    <Link
                      to="/products/developer-platform"
                      className="w-full py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 hover:bg-slate-50 text-center transition-all block"
                    >
                      Setup Integration
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </Container>
        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-slate-200/60 bg-white text-center text-xs text-slate-400">
          © {new Date().getFullYear()} ARCO Communication. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
