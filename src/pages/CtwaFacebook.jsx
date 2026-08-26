import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Info,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  LogOut,
  Plus,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { ctwaService } from '../services/ctwaService';
import { metaService } from '../services/metaService';

// Facebook Contextual SVG Icon
const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function CtwaFacebook() {
  const navigate = useNavigate();
  const { user, businessSetup, logout } = useOnboarding();
  const userName = businessSetup?.companyName || user?.name || 'Business Owner';

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ctwaStatus, setCtwaStatus] = useState(null);
  const [toast, setToast] = useState(null);

  // Step 1: Has Facebook Page? ('yes' | 'no')
  const [hasFacebookPage, setHasFacebookPage] = useState('yes');
  
  // Current Step in the Onboarding Flow (1: Facebook Page question | 2: Ads Manager question)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 2: Has Meta Ads Manager Account? ('yes' | 'no')
  const [hasAdsManager, setHasAdsManager] = useState('yes');

  // Discovered Meta Assets (Pages & Ad Accounts)
  const [availablePages, setAvailablePages] = useState([]);
  const [availableAdAccounts, setAvailableAdAccounts] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [selectedAdAccountId, setSelectedAdAccountId] = useState('');
  const [isConnectingMeta, setIsConnectingMeta] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load Status and Discovered Assets
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [statusData, assetsData] = await Promise.all([
          ctwaService.getCtwaStatus(),
          ctwaService.getCtwaAssets(),
        ]);
        setCtwaStatus(statusData);
        setAvailablePages(assetsData?.facebookPages || []);
        setAvailableAdAccounts(assetsData?.adAccounts || []);

        if (assetsData?.facebookPages?.length > 0) {
          setSelectedPageId(assetsData.facebookPages[0].id);
        }
        if (assetsData?.adAccounts?.length > 0) {
          setSelectedAdAccountId(assetsData.adAccounts[0].meta_ad_account_id);
        }
      } catch (err) {
        console.warn('Failed to load CTWA setup data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle Step 1 Proceed
  const handleProceedStep1 = () => {
    if (hasFacebookPage === 'yes') {
      setCurrentStep(2);
    } else {
      navigate('/ctwa/facebook/create');
    }
  };

  // Handle Real Meta OAuth Connection & Asset Linking
  const handleConnectWithFacebook = async () => {
    setIsConnectingMeta(true);
    try {
      // 1. Check if Meta Auth URL is available from backend
      const authData = await metaService.getAuthUrl();
      if (authData?.authUrl && authData?.isConfigured) {
        window.location.href = authData.authUrl;
        return;
      }

      // 2. Connect selected page and ad account from verified assets
      if (selectedPageId) {
        const pageMatch = availablePages.find((p) => p.id === selectedPageId);
        await ctwaService.createFacebookPage({
          pageName: pageMatch?.page_name || 'ARCO Communication Official',
          category: pageMatch?.category || 'Retail & E-Commerce',
          country: 'India',
          address: 'ARCO HQ, Cyber City',
        });
      }

      if (selectedAdAccountId) {
        const accMatch = availableAdAccounts.find((a) => a.meta_ad_account_id === selectedAdAccountId);
        await ctwaService.connectAdAccount({
          metaAdAccountId: selectedAdAccountId,
          accountName: accMatch?.account_name || 'ARCO Main Growth Ads Manager',
          currency: accMatch?.currency || 'INR',
          timezone: accMatch?.timezone || 'Asia/Kolkata',
        });
      }

      showToast('Meta Ads Manager and Facebook Page connected successfully!');
      setTimeout(() => {
        navigate('/analytics/ad-performance');
      }, 700);
    } catch (err) {
      showToast(err.message || 'Failed to connect Meta account', 'error');
    } finally {
      setIsConnectingMeta(false);
    }
  };

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
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Link to="/dashboard" className="hover:text-gray-800 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <Link to="/analytics/ad-performance" className="hover:text-gray-800 transition-colors">
                Meta Ads
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Facebook Setup</span>
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
          <div className="p-6 max-w-[720px] w-full mx-auto space-y-5">
            
            {/* Card Container */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-6">
              
              {/* Card Header */}
              <div className="space-y-1 border-b border-gray-100 pb-4">
                <h1 className="text-base font-bold text-gray-900 tracking-tight">
                  Please provide some basic details
                </h1>
                <p className="text-xs text-gray-500">
                  Step {currentStep} of 2 — Configure your Meta Business assets to start running Click-to-WhatsApp ads.
                </p>
              </div>

              {/* STEP 1: Facebook Page Question */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold text-gray-900 leading-relaxed">
                      To run ads, it is mandatory to have a Facebook Page. Do you already have a Page for your business?
                    </h2>

                    <div className="space-y-2 pt-1">
                      <label
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          hasFacebookPage === 'yes'
                            ? 'border-[#0d3b30] bg-[#f2fbf6]'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="hasFacebookPage"
                          checked={hasFacebookPage === 'yes'}
                          onChange={() => setHasFacebookPage('yes')}
                          className="text-[#0d3b30] focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-gray-900">Yes</span>
                          <p className="text-[11px] text-gray-500 mt-0.5">I already have a Facebook Business Page</p>
                        </div>
                      </label>

                      <label
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          hasFacebookPage === 'no'
                            ? 'border-[#0d3b30] bg-[#f2fbf6]'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="hasFacebookPage"
                          checked={hasFacebookPage === 'no'}
                          onChange={() => setHasFacebookPage('no')}
                          className="text-[#0d3b30] focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-gray-900">No</span>
                          <p className="text-[11px] text-gray-500 mt-0.5">I want to create a new Facebook Page</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Buttons: Go Back | Proceed */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => navigate('/analytics/ad-performance')}
                      className="h-8 px-4 rounded border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                    >
                      Go Back
                    </button>

                    <button
                      type="button"
                      onClick={handleProceedStep1}
                      className="h-8 px-5 bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Proceed</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Meta Ads Manager Question */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold text-gray-900 leading-relaxed">
                      Do you already have a Meta Ads Manager Account, within which you want your ads to run?
                    </h2>

                    <div className="space-y-2 pt-1">
                      <label
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          hasAdsManager === 'yes'
                            ? 'border-[#0d3b30] bg-[#f2fbf6]'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="hasAdsManager"
                          checked={hasAdsManager === 'yes'}
                          onChange={() => setHasAdsManager('yes')}
                          className="text-[#0d3b30] focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-gray-900">Yes</span>
                          <p className="text-[11px] text-gray-500 mt-0.5">I have an active Meta Ads Manager account</p>
                        </div>
                      </label>

                      <label
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          hasAdsManager === 'no'
                            ? 'border-[#0d3b30] bg-[#f2fbf6]'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="hasAdsManager"
                          checked={hasAdsManager === 'no'}
                          onChange={() => setHasAdsManager('no')}
                          className="text-[#0d3b30] focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-gray-900">No</span>
                          <p className="text-[11px] text-gray-500 mt-0.5">I need ARCO to help create an Ads account</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Blue Informational Box for Meta Ads Manager = Yes */}
                  {hasAdsManager === 'yes' && (
                    <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-3.5 text-xs text-blue-900 space-y-2 animate-in fade-in duration-100">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                          Great! In that case, the ads you create on ARCO will be created within your existing Meta Ads Manager account. Click below to give us permissions for accessing your Ads Manager account & other permissions.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Asset Selectors (if authorized portfolio assets are available) */}
                  {availablePages.length > 0 && (
                    <div className="space-y-3 p-3.5 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-800">Select Facebook Page</label>
                        <select
                          value={selectedPageId}
                          onChange={(e) => setSelectedPageId(e.target.value)}
                          className="w-full h-8 px-2.5 rounded border border-gray-300 bg-white text-xs text-gray-800 focus:outline-none"
                        >
                          {availablePages.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.page_name} ({p.category || 'Business'})
                            </option>
                          ))}
                        </select>
                      </div>

                      {availableAdAccounts.length > 0 && (
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-gray-800">Select Meta Ad Account</label>
                          <select
                            value={selectedAdAccountId}
                            onChange={(e) => setSelectedAdAccountId(e.target.value)}
                            className="w-full h-8 px-2.5 rounded border border-gray-300 bg-white text-xs text-gray-800 focus:outline-none"
                          >
                            {availableAdAccounts.map((a) => (
                              <option key={a.meta_ad_account_id} value={a.meta_ad_account_id}>
                                {a.account_name} ({a.currency || 'INR'})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Buttons: Go Back | Continue with Facebook */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="h-8 px-4 rounded border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                    >
                      Go Back
                    </button>

                    <button
                      type="button"
                      disabled={isConnectingMeta}
                      onClick={handleConnectWithFacebook}
                      className="h-9 px-5 bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                    >
                      {isConnectingMeta ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Connecting Meta...</span>
                        </>
                      ) : (
                        <>
                          <FacebookIcon className="w-4 h-4 text-white" />
                          <span>Continue with Facebook</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </main>
      </div>

    </div>
  );
}
