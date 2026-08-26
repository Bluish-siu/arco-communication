import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Target,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  LogOut,
  Play,
  Share2,
  Sparkles,
  Zap,
  Layers,
  MessageSquare,
  BarChart3,
  RefreshCw,
  Plus,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { ctwaService } from '../services/ctwaService';

export default function AdPerformance() {
  const navigate = useNavigate();
  const { user, businessSetup, logout } = useOnboarding();
  const userName = businessSetup?.companyName || user?.name || 'Business Owner';

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ctwaStatus, setCtwaStatus] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await ctwaService.getCtwaStatus();
      setCtwaStatus(data);
    } catch (err) {
      console.warn('Failed to load CTWA status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const isPageConnected = ctwaStatus?.facebookPage?.connected;
  const isAdAccConnected = ctwaStatus?.adAccount?.connected;
  const isCtwaReady = isPageConnected && isAdAccConnected;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-gray-800">
      
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-3.5 py-2.5 rounded-lg shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-200 ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-gray-900 text-white border-gray-800'
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

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-row min-w-0">
        <DashboardSidebar />

        {/* Content Shell */}
        <main className="flex-1 ml-14 min-w-0 flex flex-col bg-[#f8fafc] min-h-screen">
          
          {/* Top Navigation Header */}
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between shadow-2xs">
            
            {/* Breadcrumb: Dashboard / Market / Meta Ads */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Link to="/dashboard" className="hover:text-gray-800 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-gray-500">Market</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">Meta Ads (Click-to-WhatsApp)</span>
            </div>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-3">
              <div className="relative profile-container">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0d3b30] text-emerald-300 font-bold text-xs flex items-center justify-center shadow-2xs">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 hidden sm:block max-w-[120px] truncate">
                    {userName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 border-b border-gray-100 font-semibold text-gray-900 truncate">
                      {userName}
                    </div>
                    <button
                      type="button"
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

          {/* Page Body */}
          <div className="p-6 max-w-[1400px] w-full mx-auto space-y-5">
            
            {/* Top Click to WhatsApp Ads Information Banner */}
            <div className="bg-gradient-to-r from-emerald-900 to-[#0d3b30] rounded-xl p-6 text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-700/60 text-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                    Meta CTWA Engine
                  </span>
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    Click to WhatsApp Ads
                  </h1>
                </div>
                <p className="text-xs text-emerald-100/90 max-w-2xl leading-relaxed">
                  Boost ROAS with Click-to-WhatsApp ads—set up in minutes, no Ads Manager needed. Send high-intent shoppers straight into interactive WhatsApp chats.
                </p>
              </div>

              <button
                type="button"
                onClick={() => showToast('Learn how: CTWA ads enable customers to click an Instagram or Facebook ad to instantly open a WhatsApp chat.')}
                className="h-8 px-4 bg-white text-[#0d3b30] hover:bg-emerald-50 text-xs font-bold rounded shadow-2xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <span>Learn how</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Main Content 2-Column Split (Left: Setup Cards | Right: Educational Card) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: 3 Action Cards (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Card 1: Create/Connect your Facebook Page */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs hover:border-gray-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-md">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-sm text-gray-900">
                        Create/Connect your Facebook Page
                      </h2>
                      {isPageConnected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {isPageConnected
                        ? `Connected Page: "${ctwaStatus?.facebookPage?.name || 'Official Business Page'}"`
                        : 'Create a new Facebook page or connect an existing one'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/ctwa/facebook')}
                    className={`h-8 px-4 text-xs font-semibold rounded shadow-2xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isPageConnected
                        ? 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                        : 'bg-[#0d3b30] hover:bg-[#154d3f] text-white'
                    }`}
                  >
                    <span>{isPageConnected ? 'Change Page' : 'Connect'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Card 2: Create/Connect your Meta Ads Manager account */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs hover:border-gray-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-md">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-sm text-gray-900">
                        Create/Connect your Meta Ads Manager account
                      </h2>
                      {isAdAccConnected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {isAdAccConnected
                        ? `Connected Ad Account: "${ctwaStatus?.adAccount?.name || 'ARCO Ads Manager'}"`
                        : 'Create a new Meta Ads Manager account or connect an existing one'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/ctwa/facebook')}
                    className={`h-8 px-4 text-xs font-semibold rounded shadow-2xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isAdAccConnected
                        ? 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                        : 'bg-[#0d3b30] hover:bg-[#154d3f] text-white'
                    }`}
                  >
                    <span>{isAdAccConnected ? 'Manage Account' : 'Connect'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Card 3: Create CTWA Ad Campaign */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs hover:border-gray-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-md">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-sm text-gray-900">
                        Create CTWA Ad Campaign
                      </h2>
                      {isCtwaReady && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          Ready to Launch
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Set live ads on Instagram & Facebook which direct straight to your WhatsApp chat
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isPageConnected) {
                        showToast('Please connect your Facebook Page first to launch CTWA ads.', 'error');
                        navigate('/ctwa/facebook');
                      } else {
                        navigate('/campaigns/create?category=CTWA');
                      }
                    }}
                    className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-semibold rounded shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Campaign</span>
                  </button>
                </div>

              </div>

              {/* Right Column: Informational / Video Section (5 Cols) */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
                
                {/* Visual Header / Mockup Preview */}
                <div className="relative rounded-lg overflow-hidden bg-gray-900 border border-gray-800 aspect-video flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center mb-2 shadow-lg">
                    <Play className="w-5 h-5 text-emerald-400 fill-emerald-400 ml-0.5" />
                  </div>
                  <h3 className="font-bold text-xs text-white">How Click-to-WhatsApp Ads Work</h3>
                  <p className="text-[10px] text-gray-300 mt-0.5">3-Minute Video Guide & Setup Tutorial</p>
                </div>

                {/* Educational Value Props */}
                <div className="space-y-3 pt-1">
                  <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
                    Key CTWA Advantages
                  </h3>

                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Zap className="w-2.5 h-2.5" />
                      </div>
                      <p className="leading-snug">
                        <strong className="text-gray-800">Direct Chat Conversions:</strong> Turn ad clicks directly into high-converting 1-on-1 WhatsApp conversations.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Target className="w-2.5 h-2.5" />
                      </div>
                      <p className="leading-snug">
                        <strong className="text-gray-800">Verified Contact Acquisition:</strong> Automatically capture customer phone numbers and names with zero form friction.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <MessageSquare className="w-2.5 h-2.5" />
                      </div>
                      <p className="leading-snug">
                        <strong className="text-gray-800">Automated Bot Follow-up:</strong> Trigger instant catalog messages and auto-checkout bots the moment an ad is clicked.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </main>
      </div>

    </div>
  );
}
