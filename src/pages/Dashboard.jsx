import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  Settings,
  Bell,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Info,
  ExternalLink,
  Coins,
  Heart,
  Grid,
  Users,
  BookUser,
  Headphones,
  Megaphone,
  FileSpreadsheet,
  FileText,
  BellRing,
  TrendingUp,
} from 'lucide-react';
import Container from '../components/common/Container';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { dashboardService } from '../services/dashboardService';
import { metaService } from '../services/metaService';

// Setup Modals
import ConnectWhatsAppModal from '../components/dashboard/ConnectWhatsAppModal';
import GreetingFlowModal from '../components/dashboard/GreetingFlowModal';
import FaqAutoRepliesModal from '../components/dashboard/FaqAutoRepliesModal';
import TeamMemberModal from '../components/dashboard/TeamMemberModal';
import AddContactsModal from '../components/dashboard/AddContactsModal';
import WhatsAppProfileModal from '../components/dashboard/WhatsAppProfileModal';
import SupportAutomationModal from '../components/dashboard/SupportAutomationModal';
import CreateCampaignWorkspace from '../components/campaigns/CreateCampaignWorkspace';
import GoogleSheetsModal from '../components/dashboard/GoogleSheetsModal';
import WhatsAppFormsModal from '../components/dashboard/WhatsAppFormsModal';
import AutomatedAlertsModal from '../components/dashboard/AutomatedAlertsModal';
import CtwaAdsModal from '../components/dashboard/CtwaAdsModal';
import AiAgentModal from '../components/dashboard/AiAgentModal';

// WhatsApp Contextual SVG Icon
const WhatsAppIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Instagram Contextual SVG Icon
const InstagramIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, businessSetup, logout, subscription, trialDaysRemaining } = useOnboarding();
  const userName = businessSetup?.companyName || user?.name || 'PATEL';

  const [activeChannelTab, setActiveChannelTab] = useState('whatsapp'); // 'whatsapp' | 'instagram'
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Collapsible sections
  const [isQuickSetupExpanded, setIsQuickSetupExpanded] = useState(true);
  const [isObjectivesExpanded, setIsObjectivesExpanded] = useState(true);

  // Active modal name
  const [activeModal, setActiveModal] = useState(null);

  // Live Dashboard State
  const [dashboardState, setDashboardState] = useState({
    whatsappStatus: {
      connected: false,
      verified: false,
      businessName: 'ARCO Communication',
      displayPhoneNumber: '+91 98765 43210',
    },
    greetingFlow: {
      activated: true,
      aiGenerated: true,
      message: 'Welcome to ARCO Communication! How can our team assist you with your business goals today?',
      buttons: ['Explore Solutions', 'Pricing Plans', 'Chat with Agent'],
      workingHoursEnabled: true,
    },
    faqReplies: {
      activated: true,
      aiGenerated: true,
      count: 5,
    },
    teamMembersCount: 1,
    contactsCount: 248,
    whatsappProfile: {
      businessName: 'ARCO Communication',
      about: 'Leading WhatsApp & Omni-channel Marketing Automation platform.',
      category: 'Software & Technology',
      updated: true,
    },
    aiAgentStatus: {
      created: true,
      name: 'ARCO Autonomous AI Agent',
      status: 'live',
      accuracyRate: '98.4%',
    },
    objectives: {
      supportAutomation: { configured: false },
      bulkCampaigns: { active: true },
      googleSheets: { connected: false },
      whatsappForms: { configured: false },
      automatedAlerts: { configured: false },
      ctwaAds: { configured: false },
    },
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load aggregated dashboard state from backend
  const loadDashboardData = async () => {
    try {
      const data = await dashboardService.getDashboardState();
      if (data) {
        setDashboardState((prev) => ({
          ...prev,
          ...data,
        }));
      }
    } catch (err) {
      console.warn('[Dashboard] State load fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between text-slate-800 relative font-sans">
      {/* SIDEBAR NAVIGATION */}
      <DashboardSidebar />

      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold transition-all animate-in slide-in-from-top-2 ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : toast.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-700'
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

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col pl-14 sm:pl-16 transition-all duration-200">
        {/* 1. TOP NAVBAR */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
          <Container>
            <div className="flex items-center justify-between h-16">
              {/* Brand Logo */}
              <div className="flex items-center gap-3">
                <Link to="/dashboard" className="flex items-center gap-2 group">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
                    A
                  </div>
                  <span className="font-bold text-lg text-slate-900 tracking-tight">
                    ARCO
                  </span>
                </Link>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-3">
                {/* Trial Plan Badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                  <span className="font-bold">{subscription?.planName || 'Trial Plan'}</span>
                  <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {trialDaysRemaining} Days Left
                  </span>
                </div>

                {/* Subscribe Button */}
                <Link
                  to="/pricing"
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-colors"
                >
                  Subscribe
                </Link>

                {/* Notification Bell */}
                <button
                  type="button"
                  onClick={() => showToast('No new unread notifications', 'info')}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                </button>

                {/* Settings Gear */}
                <Link
                  to="/onboarding/integrations"
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Workspace Settings"
                >
                  <Settings className="w-4 h-4" />
                </Link>

                {/* User Avatar & Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer hover:ring-2 hover:ring-emerald-600/30 transition-all"
                  >
                    {userName.charAt(0).toUpperCase()}
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in">
                      <div className="px-3 py-2 border-b border-slate-100 text-xs">
                        <div className="font-bold text-slate-900">{userName}</div>
                        <div className="text-slate-400 truncate text-[11px]">{user?.email || 'user@company.com'}</div>
                      </div>
                      <Link
                        to="/onboarding/meta-whatsapp"
                        className="block px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        WhatsApp Settings
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Container>
        </header>

        {/* 2. MAIN PAGE BODY */}
        <main className="flex-1 py-6 sm:py-8">
          <Container>
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Welcome Header */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Welcome to ARCO, {userName.toUpperCase()}!
                </h1>
              </div>

              {/* WhatsApp / Instagram Pill Switcher */}
              <div className="inline-flex items-center gap-2 p-1 rounded-full bg-slate-200/70 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveChannelTab('whatsapp')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeChannelTab === 'whatsapp'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChannelTab('instagram')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeChannelTab === 'instagram'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </button>
              </div>

              {/* 3. HERO AI AGENT BANNER */}
              <div className="bg-[#eefcf4] rounded-2xl p-5 sm:p-6 border border-emerald-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Build Your AI Agent
                    </h2>
                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                      Create an AI agent to handle conversations, answer questions, qualify leads, and assist customers automatically.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/automation/whatsapp-ai-agent')}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
                >
                  Create Agent
                </button>
              </div>

              {/* 4. QUICK SETUP CARDS GRID (6 CARDS in 3x2) */}
              <div className="space-y-3">
                {isQuickSetupExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: Connect Number */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:shadow-xs transition-all relative">
                      {/* Optional Coin Badge */}
                      <div className="absolute -top-2.5 right-6 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs">
                        <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-[8px] font-black">₹</span>
                        <span>Rs. 400</span>
                        <Info className="w-2.5 h-2.5 text-amber-600" />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <WhatsAppIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Connect Number</h4>
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                            {dashboardState.whatsappStatus.connected ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" /> Verified & Active
                              </span>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                <span>Not Verified</span>
                                <Info className="w-3 h-3 text-slate-400" />
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveModal('connect_whatsapp')}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          dashboardState.whatsappStatus.connected
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                        }`}
                      >
                        {dashboardState.whatsappStatus.connected ? 'Manage' : 'Connect'}
                      </button>
                    </div>

                    {/* Card 2: Greeting Flow */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:shadow-xs transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                          <Heart className="w-5 h-5 fill-pink-500 text-pink-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Greeting Flow</h4>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <Check className="w-2.5 h-2.5 text-emerald-600" /> Activated
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                              <Sparkles className="w-2.5 h-2.5 text-slate-500" /> AI-generated
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveModal('greeting_flow')}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                      >
                        Edit Flow
                      </button>
                    </div>

                    {/* Card 3: FAQ Auto-replies */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:shadow-xs transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                          <Grid className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">FAQ Auto-replies</h4>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {dashboardState.faqReplies?.activated !== false ? (
                              <>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <Check className="w-2.5 h-2.5 text-emerald-600" /> Activated
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                                  <Sparkles className="w-2.5 h-2.5 text-slate-500" /> AI-generated
                                </span>
                              </>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('/automation/custom-reply')}
                        className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Card 4: Add team-members */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:shadow-xs transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Add team-members</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {dashboardState.teamMembersCount} member(s)
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveModal('team_members')}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                      >
                        Add More
                      </button>
                    </div>

                    {/* Card 5: Add Contacts */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:shadow-xs transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                          <BookUser className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Add Contacts</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            More contacts, more conversations
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveModal('add_contacts')}
                        className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                      >
                        Add
                      </button>
                    </div>

                    {/* Card 6: Update WhatsApp Profile */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:shadow-xs transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Update WhatsApp Profile</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Make a great first impression
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveModal('whatsapp_profile')}
                        className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                )}

                {/* Collapsible toggle */}
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIsQuickSetupExpanded(!isQuickSetupExpanded)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <span>{isQuickSetupExpanded ? 'Show Less' : 'Show More'}</span>
                    {isQuickSetupExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 5. OBJECTIVES SECTION (6 High-Fidelity Cards with Realistic Mockups) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    OBJECTIVES
                  </h3>
                </div>

                {isObjectivesExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Objective 1: Handle Technical Support & Queries */}
                    <div className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all bg-white shadow-2xs">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          Handle Technical Support & Queries
                        </h4>
                        <p className="text-xs text-slate-500">Via WhatsApp Chat Automation</p>
                      </div>

                      {/* Realistic Mockup Thumbnail: Support Chat */}
                      <div className="bg-slate-100 rounded-xl p-2.5 border border-slate-200 text-[10px] space-y-2 font-sans select-none">
                        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5 text-slate-600 font-semibold">
                          <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px]">A</div>
                          <span>ARCO Support Bot</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg shadow-2xs text-slate-700 space-y-1">
                          <p>Hi! Welcome to ARCO. How can we resolve your query today?</p>
                          <div className="bg-slate-50 p-1 rounded text-[9px] text-slate-500 border border-slate-200">
                            🔘 1. Bug / Error Report<br/>🔘 2. Talk to Tech Lead
                          </div>
                        </div>
                        <div className="bg-emerald-100 text-emerald-950 p-1.5 rounded-lg text-right text-[9px] font-medium">
                          Option 1: Bug Report
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('/automation/workflows')}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        Setup
                      </button>
                    </div>

                    {/* Objective 2: Promote Software Solutions & IT Services */}
                    <div className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all bg-white shadow-2xs">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          Promote Software Solutions & IT Services
                        </h4>
                        <p className="text-xs text-slate-500">Via WhatsApp Bulk Campaigns</p>
                      </div>

                      {/* Realistic Mockup Thumbnail: Promotional Discount Chat */}
                      <div className="bg-slate-100 rounded-xl p-2.5 border border-slate-200 text-[10px] space-y-2 font-sans select-none">
                        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5 text-slate-600 font-semibold">
                          <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[8px]">A</div>
                          <span>ARCO Marketing</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg shadow-2xs text-slate-700 space-y-1">
                          <div className="bg-amber-400 text-amber-950 font-black p-2 rounded text-center text-xs">
                            30% OFF
                          </div>
                          <p className="text-[9px] text-slate-600 mt-1">
                            Hey Lisa! Celebrate our new release with an exclusive 30% discount on all custom plans.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveModal('campaign_setup')}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        Setup
                      </button>
                    </div>

                    {/* Objective 3: Integrate with Google Sheets */}
                    <div className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all bg-white shadow-2xs">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          Integrate with Google Sheets
                        </h4>
                        <p className="text-xs text-slate-500">Auto-sync customer inquiries & leads</p>
                      </div>

                      {/* Mockup Thumbnail: ARCO 🔗 Google Sheets */}
                      <div className="bg-slate-100 rounded-xl p-6 border border-slate-200 flex items-center justify-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
                          A
                        </div>
                        <div className="text-slate-400 font-bold text-lg">🔗</div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
                          <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveModal('google_sheets')}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        {dashboardState.objectives?.googleSheets?.connected ? 'Manage' : 'Setup'}
                      </button>
                    </div>

                    {/* Objective 4: Collect Technical Requirements & Project Details */}
                    <div className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all bg-white shadow-2xs">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          Collect Technical Requirements & Project Details
                        </h4>
                        <p className="text-xs text-slate-500">Via WhatsApp Forms</p>
                      </div>

                      {/* Mockup Thumbnail: Interactive WhatsApp Form */}
                      <div className="bg-slate-100 rounded-xl p-2.5 border border-slate-200 text-[10px] space-y-1.5 font-sans select-none">
                        <div className="bg-white p-2 rounded-lg shadow-2xs space-y-1">
                          <div className="font-bold text-slate-800 text-[10px]">Your details</div>
                          <div className="bg-slate-50 p-1 border border-slate-200 rounded text-slate-600 text-[9px]">
                            Name: Alex Roy
                          </div>
                          <div className="bg-slate-50 p-1 border border-slate-200 rounded text-slate-600 text-[9px]">
                            Budget: $2,000 - $5,000
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('/automation/whatsapp-forms/view')}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        Setup
                      </button>
                    </div>

                    {/* Objective 5: Send Project Updates & Technical Alerts */}
                    <div className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all bg-white shadow-2xs">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          Send Project Updates & Technical Alerts
                        </h4>
                        <p className="text-xs text-slate-500">Via WhatsApp Automated Notifications</p>
                      </div>

                      {/* Mockup Thumbnail: Order Status Tracker Alert */}
                      <div className="bg-slate-100 rounded-xl p-2.5 border border-slate-200 text-[10px] space-y-1.5 font-sans select-none">
                        <div className="bg-white p-2 rounded-lg shadow-2xs space-y-1">
                          <div className="font-bold text-emerald-800 text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            ORDER SHIPPED
                          </div>
                          <p className="text-[9px] text-slate-600">
                            Your order #ARCO-9812 has been dispatched via Express Courier.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveModal('automated_alerts')}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        Setup
                      </button>
                    </div>

                    {/* Objective 6: Generate Software Development Leads */}
                    <div className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all bg-white shadow-2xs">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          Generate Software Development Leads
                        </h4>
                        <p className="text-xs text-slate-500">Via Click to WhatsApp Ads</p>
                      </div>

                      {/* Mockup Thumbnail: Meta Ad with WhatsApp CTA */}
                      <div className="bg-slate-100 rounded-xl p-2.5 border border-slate-200 text-[10px] space-y-1.5 font-sans select-none">
                        <div className="bg-white p-2 rounded-lg shadow-2xs space-y-1.5">
                          <div className="font-bold text-slate-800 text-[10px]">Digital Growth Solutions</div>
                          <div className="bg-slate-900 text-white p-1.5 rounded flex items-center justify-between">
                            <span className="text-[9px] font-bold">Meta Sponsored Ad</span>
                            <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[8px] font-black flex items-center gap-1">
                              <WhatsAppIcon className="w-2.5 h-2.5" /> WhatsApp
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('/analytics/ad-performance')}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        Setup
                      </button>
                    </div>
                  </div>
                )}

                {/* Collapsible toggle */}
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsObjectivesExpanded(!isObjectivesExpanded)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <span>{isObjectivesExpanded ? 'Show Less' : 'Show More'}</span>
                    {isObjectivesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
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

      {/* ========================================================================= */}
      {/* 12 INTERACTIVE MODALS & SETUP WIZARDS */}
      {/* ========================================================================= */}
      <ConnectWhatsAppModal
        isOpen={activeModal === 'connect_whatsapp'}
        onClose={() => setActiveModal(null)}
        currentStatus={dashboardState.whatsappStatus}
        onStatusChange={(status) => {
          setDashboardState((prev) => ({ ...prev, whatsappStatus: status }));
        }}
        showToast={showToast}
      />

      <GreetingFlowModal
        isOpen={activeModal === 'greeting_flow'}
        onClose={() => setActiveModal(null)}
        currentFlow={dashboardState.greetingFlow}
        onFlowChange={(flow) => {
          setDashboardState((prev) => ({ ...prev, greetingFlow: flow }));
        }}
        showToast={showToast}
      />

      <FaqAutoRepliesModal
        isOpen={activeModal === 'faq_replies'}
        onClose={() => setActiveModal(null)}
        currentFaqs={dashboardState.faqReplies}
        onFaqChange={(faq) => {
          setDashboardState((prev) => ({ ...prev, faqReplies: faq }));
        }}
        showToast={showToast}
      />

      <TeamMemberModal
        isOpen={activeModal === 'team_members'}
        onClose={() => setActiveModal(null)}
        currentCount={dashboardState.teamMembersCount}
        onCountChange={(count) => {
          setDashboardState((prev) => ({ ...prev, teamMembersCount: count }));
        }}
        showToast={showToast}
      />

      <AddContactsModal
        isOpen={activeModal === 'add_contacts'}
        onClose={() => setActiveModal(null)}
        currentCount={dashboardState.contactsCount}
        onCountChange={(count) => {
          setDashboardState((prev) => ({ ...prev, contactsCount: count }));
        }}
        showToast={showToast}
      />

      <WhatsAppProfileModal
        isOpen={activeModal === 'whatsapp_profile'}
        onClose={() => setActiveModal(null)}
        currentProfile={dashboardState.whatsappProfile}
        onProfileChange={(profile) => {
          setDashboardState((prev) => ({ ...prev, whatsappProfile: profile }));
        }}
        showToast={showToast}
      />

      <SupportAutomationModal
        isOpen={activeModal === 'support_automation'}
        onClose={() => setActiveModal(null)}
        currentConfig={dashboardState.objectives?.supportAutomation}
        onConfigChange={(config) => {
          setDashboardState((prev) => ({
            ...prev,
            objectives: { ...prev.objectives, supportAutomation: config },
          }));
        }}
        showToast={showToast}
      />

      <CreateCampaignWorkspace
        isOpen={activeModal === 'campaign_setup'}
        onClose={() => setActiveModal(null)}
        onSuccess={() => {
          setActiveModal(null);
          loadDashboardData();
          showToast('Campaign created and scheduled successfully!', 'success');
        }}
      />

      <GoogleSheetsModal
        isOpen={activeModal === 'google_sheets'}
        onClose={() => setActiveModal(null)}
        currentConfig={dashboardState.objectives?.googleSheets}
        onConfigChange={(config) => {
          setDashboardState((prev) => ({
            ...prev,
            objectives: { ...prev.objectives, googleSheets: config },
          }));
        }}
        showToast={showToast}
      />

      <WhatsAppFormsModal
        isOpen={activeModal === 'whatsapp_forms'}
        onClose={() => setActiveModal(null)}
        onFormCreated={() => {
          loadDashboardData();
        }}
        showToast={showToast}
      />

      <AutomatedAlertsModal
        isOpen={activeModal === 'automated_alerts'}
        onClose={() => setActiveModal(null)}
        currentConfig={dashboardState.objectives?.automatedAlerts}
        onConfigChange={(config) => {
          setDashboardState((prev) => ({
            ...prev,
            objectives: { ...prev.objectives, automatedAlerts: config },
          }));
        }}
        showToast={showToast}
      />

      <CtwaAdsModal
        isOpen={activeModal === 'ctwa_ads'}
        onClose={() => setActiveModal(null)}
        currentConfig={dashboardState.objectives?.ctwaAds}
        onConfigChange={(config) => {
          setDashboardState((prev) => ({
            ...prev,
            objectives: { ...prev.objectives, ctwaAds: config },
          }));
        }}
        showToast={showToast}
      />

      <AiAgentModal
        isOpen={activeModal === 'ai_agent'}
        onClose={() => setActiveModal(null)}
        currentAgent={dashboardState.aiAgentStatus}
        onAgentCreated={(agent) => {
          setDashboardState((prev) => ({ ...prev, aiAgentStatus: agent }));
        }}
        showToast={showToast}
      />
    </div>
  );
}
