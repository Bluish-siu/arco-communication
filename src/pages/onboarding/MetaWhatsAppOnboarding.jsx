import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  X,
  Check,
} from 'lucide-react';
import Container from '../../components/common/Container';
import { useOnboarding } from '../../context/OnboardingContext';
import { metaService } from '../../services/metaService';

// WhatsApp Contextual SVG Icon
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Meta / Facebook Contextual SVG Icon
const MetaIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export default function MetaWhatsAppOnboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { businessSetup, completeOnboarding } = useOnboarding();

  // Step state: 1 (Business Portfolio), 2 (WABA), 3 (Phone Number), 4 (Meta Auth/Complete), 5 (Connected Success)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data lists from Meta API
  const [businesses, setBusinesses] = useState([]);
  const [wabas, setWabas] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState([]);

  // Selected items
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedWaba, setSelectedWaba] = useState(null);
  const [selectedPhone, setSelectedPhone] = useState(null);

  // New WABA creation modal state
  const [createWabaModalOpen, setCreateWabaModalOpen] = useState(false);
  const [newWabaName, setNewWabaName] = useState('');

  // Connected integration result
  const [connectedIntegration, setConnectedIntegration] = useState(null);

  // Embedded Signup (Interakt flow) state & configuration
  const [metaConfig, setMetaConfig] = useState({
    appId: '2872862256446175',
    configId: '1131178462664882',
    isConfigured: true,
  });
  const [connectingViaEmbedded, setConnectingViaEmbedded] = useState(false);
  const [showManualSelect, setShowManualSelect] = useState(false);

  // Initialize Facebook JavaScript SDK for Embedded Signup
  useEffect(() => {
    const appId = metaConfig.appId || '2872862256446175';

    if (!window.FB) {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: 'v21.0',
        });
      };

      if (!document.getElementById('facebook-jssdk')) {
        const script = document.createElement('script');
        script.id = 'facebook-jssdk';
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    }
  }, [metaConfig.appId]);

  // Listen for Meta Embedded Signup message events (WABA ID & Phone Number ID)
  useEffect(() => {
    const handleMetaMessage = (event) => {
      if (
        event.origin !== 'https://www.facebook.com' &&
        event.origin !== 'https://web.facebook.com'
      ) {
        return;
      }

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('[Meta Embedded Signup Event]', data);
          if (data.data?.phone_number_id) {
            sessionStorage.setItem('meta_phone_number_id', data.data.phone_number_id);
          }
          if (data.data?.waba_id) {
            sessionStorage.setItem('meta_waba_id', data.data.waba_id);
          }
        }
      } catch (err) {
        // Non-JSON message from other extensions, ignore
      }
    };

    window.addEventListener('message', handleMetaMessage);
    return () => window.removeEventListener('message', handleMetaMessage);
  }, []);

  // Launch Meta Embedded Signup popup dialog (Interakt flow)
  const handleLaunchEmbeddedSignup = () => {
    setError('');
    setConnectingViaEmbedded(true);

    const configId = metaConfig.configId || '1131178462664882';
    const appId = metaConfig.appId || '2872862256446175';

    if (!window.FB) {
      // Fallback: If FB SDK is blocked by browser ad blocker, open Meta hosted onboarding page
      const hostedUrl = `https://business.facebook.com/messaging/whatsapp/onboard/?app_id=${appId}&config_id=${configId}`;
      window.open(hostedUrl, '_blank', 'width=750,height=800');
      setConnectingViaEmbedded(false);
      return;
    }

    window.FB.login(
      async (response) => {
        if (response.authResponse?.code) {
          const code = response.authResponse.code;
          const wabaId = sessionStorage.getItem('meta_waba_id') || null;
          const phoneNumberId = sessionStorage.getItem('meta_phone_number_id') || null;

          try {
            const result = await metaService.embeddedSignup({
              code,
              wabaId,
              phoneNumberId,
              businessName: businessSetup.companyName || 'ARCO Communication Retail',
            });

            setConnectedIntegration(result);
            completeOnboarding();
            setStep(5);
          } catch (err) {
            console.error('[Embedded Signup Error]', err);
            setError(err.message || 'WhatsApp authorization failed. Please try again.');
          } finally {
            setConnectingViaEmbedded(false);
          }
        } else {
          setConnectingViaEmbedded(false);
          if (response.status !== 'connected') {
            console.warn('[Embedded Signup] User cancelled or closed the login modal.');
          }
        }
      },
      {
        config_id: configId,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          feature: 'whatsapp_embedded_signup',
          version: 4,
          sessionInfoVersion: 3,
        },
      }
    );
  };

  // Load existing status and business portfolios on mount
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        // Check if already connected
        const statusRes = await metaService.getStatus();
        if (statusRes?.connected && searchParams.get('manage') !== 'true') {
          setConnectedIntegration(statusRes);
          setStep(5);
          setLoading(false);
          return;
        }

        // Fetch Meta Auth configuration (appId, configId)
        const authData = await metaService.getAuthUrl();
        if (authData) {
          setMetaConfig((prev) => ({
            ...prev,
            appId: authData.appId || prev.appId,
            configId: authData.configId || prev.configId,
            isConfigured: authData.isConfigured ?? prev.isConfigured,
          }));
        }

        // Fetch available business portfolios
        const businessList = await metaService.getBusinesses();
        setBusinesses(businessList);
        if (businessList.length > 0) {
          setSelectedBusiness(businessList[0]);
        }
      } catch (err) {
        console.warn('[MetaOnboarding] Failed to load Meta Business accounts:', err.message || err);
        setError('Failed to load Meta Business accounts. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [searchParams]);

  // When selectedBusiness changes, fetch its WABAs
  useEffect(() => {
    if (!selectedBusiness) return;
    async function loadWabas() {
      setLoading(true);
      try {
        const wabaList = await metaService.getWabas(selectedBusiness.id);
        setWabas(wabaList);
        if (wabaList.length > 0) {
          setSelectedWaba(wabaList[0]);
        } else {
          setSelectedWaba(null);
        }
      } catch (err) {
        console.warn('[MetaOnboarding] Failed to load WhatsApp Business Accounts:', err.message || err);
        setError('Failed to load WhatsApp Business Accounts.');
      } finally {
        setLoading(false);
      }
    }
    loadWabas();
  }, [selectedBusiness]);

  // When selectedWaba changes, fetch its Phone Numbers
  useEffect(() => {
    if (!selectedWaba) return;
    async function loadPhoneNumbers() {
      setLoading(true);
      try {
        const phoneList = await metaService.getPhoneNumbers(selectedWaba.id);
        setPhoneNumbers(phoneList);
        if (phoneList.length > 0) {
          setSelectedPhone(phoneList[0]);
        } else {
          setSelectedPhone(null);
        }
      } catch (err) {
        console.warn('[MetaOnboarding] Failed to load WhatsApp Business phone numbers:', err.message || err);
        setError('Failed to load WhatsApp Business phone numbers.');
      } finally {
        setLoading(false);
      }
    }
    loadPhoneNumbers();
  }, [selectedWaba]);

  // Step 1 -> Step 2
  const handleProceedToWaba = () => {
    if (!selectedBusiness) {
      setError('Please select a Meta Business Portfolio to continue.');
      return;
    }
    setError('');
    setStep(2);
  };

  // Step 2 -> Step 3
  const handleProceedToPhone = () => {
    if (!selectedWaba) {
      setError('Please select or create a WhatsApp Business Account (WABA).');
      return;
    }
    setError('');
    setStep(3);
  };

  // Step 3 -> Step 4
  const handleProceedToAuthorization = () => {
    if (!selectedPhone) {
      setError('Please select a verified WhatsApp Business phone number.');
      return;
    }
    setError('');
    setStep(4);
  };

  // Step 4: Finalize Meta Connection
  const handleCompleteMetaSetup = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        metaBusinessId: selectedBusiness?.id || 'mb_9018410291',
        wabaId: selectedWaba?.id || 'waba_9824901840',
        phoneNumberId: selectedPhone?.id || 'phone_1092837461',
        displayPhoneNumber: selectedPhone?.displayPhoneNumber || '+91 98765 43210',
        businessName: selectedBusiness?.name || businessSetup.companyName || 'ARCO Communication Retail',
      };

      const result = await metaService.connect(payload);
      setConnectedIntegration(result);
      completeOnboarding();
      setStep(5);
    } catch (err) {
      setError(err.message || 'Meta WhatsApp authorization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create WABA helper
  const handleCreateWaba = (e) => {
    e.preventDefault();
    if (!newWabaName.trim()) return;

    const createdWaba = {
      id: `waba_${Date.now()}`,
      name: newWabaName.trim(),
      businessId: selectedBusiness?.id,
      currency: 'INR',
      timezoneId: 'Asia/Kolkata',
      accountReviewStatus: 'APPROVED',
    };

    setWabas([createdWaba, ...wabas]);
    setSelectedWaba(createdWaba);
    setCreateWabaModalOpen(false);
    setNewWabaName('');
  };

  const stepsList = [
    { num: 1, label: 'Business Portfolio' },
    { num: 2, label: 'WhatsApp Account' },
    { num: 3, label: 'Phone Number' },
    { num: 4, label: 'Authorize & Connect' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800">
      {/* 1. TOP HEADER */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
        <Container>
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo & Section */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center group">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 leading-none">
                  ARCO <span className="font-semibold text-slate-800">Communication</span>
                </span>
              </Link>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                <WhatsAppIcon className="w-3 h-3 text-emerald-600" />
                <span>WhatsApp Business Onboarding</span>
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Official Meta Cloud API</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Skip to Dashboard
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* 2. PROGRESS STEPPER BAR (Visible on Steps 1 to 4) */}
      {step < 5 && (
        <div className="bg-white border-b border-slate-200/80 py-3.5">
          <Container>
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                {stepsList.map((s, idx) => {
                  const isCurrent = step === s.num;
                  const isPassed = step > s.num;

                  return (
                    <div key={s.num} className="flex items-center flex-1 last:flex-none">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-xl font-extrabold text-xs flex items-center justify-center transition-all ${
                            isPassed
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-red-600 text-white shadow-md shadow-red-600/25 ring-4 ring-red-100'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                        >
                          {isPassed ? <Check className="w-4 h-4" /> : s.num}
                        </div>
                        <span
                          className={`text-xs font-bold hidden sm:inline ${
                            isCurrent
                              ? 'text-slate-900'
                              : isPassed
                              ? 'text-emerald-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>

                      {idx < stepsList.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-3 sm:mx-4 rounded-full transition-all ${
                            isPassed ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Container>
        </div>
      )}

      {/* 3. MAIN WIZARD CONTENT */}
      <main className="flex-1 py-8 sm:py-12 px-4">
        <Container>
          <div className="max-w-2xl mx-auto">
            
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 1: INTERAKT-STYLE 1-CLICK EMBEDDED SIGNUP + MANUAL FALLBACK */}
            {/* ========================================================================= */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in">
                {/* 1. PRIMARY HERO: 1-CLICK META EMBEDDED SIGNUP */}
                <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-9 text-white shadow-2xl border border-indigo-500/20">
                  {/* Subtle ambient lighting */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

                  <div className="relative z-10 space-y-6">
                    {/* Badge Row */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Recommended • 1-Click Setup
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Official Meta Tech Provider
                      </span>
                    </div>

                    {/* Heading & Value Proposition */}
                    <div className="space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        Connect WhatsApp via Meta
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                        Log in with Facebook to automatically register or select your WhatsApp Business Account, verify your phone number via SMS OTP, and start messaging in under 2 minutes.
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button
                        type="button"
                        onClick={handleLaunchEmbeddedSignup}
                        disabled={connectingViaEmbedded}
                        className="px-8 py-4 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] active:scale-[0.99] text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {connectingViaEmbedded ? (
                          <>
                            <RotateCw className="w-4 h-4 animate-spin text-white" />
                            <span>Connecting WhatsApp with Meta...</span>
                          </>
                        ) : (
                          <>
                            <MetaIcon className="w-5 h-5 text-white" />
                            <span>Continue with Facebook / WhatsApp</span>
                            <ArrowRight className="w-4 h-4 text-blue-200" />
                          </>
                        )}
                      </button>

                      {/* Direct Hosted Link Fallback */}
                      <a
                        href={`https://business.facebook.com/messaging/whatsapp/onboard/?app_id=${metaConfig.appId}&config_id=${metaConfig.configId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 text-center text-xs text-slate-400 hover:text-slate-200 font-semibold underline underline-offset-4"
                      >
                        Popup blocked? Open direct link ↗
                      </a>
                    </div>

                    {/* Trust Guarantee Badges */}
                    <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-y-2 gap-x-6 text-[11px] text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Zero technical setup</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Built-in SMS OTP verification</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Retain 100% number ownership</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider / Toggle for Manual Portfolio Selector */}
                <div className="relative py-2 flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full" />
                  <button
                    type="button"
                    onClick={() => setShowManualSelect(!showManualSelect)}
                    className="absolute bg-slate-50 px-3 text-[11px] font-bold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
                  >
                    {showManualSelect ? 'Hide manual portfolio selector ▲' : 'Or select from existing portfolio manually ▼'}
                  </button>
                </div>

                {/* 2. MANUAL SELECTOR CARD (Shown when user wants manual flow) */}
                {showManualSelect && (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6 animate-in fade-in">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-2xs">
                        <Building2 className="w-5 h-5 text-red-500" />
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        Select Existing Portfolio
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                        Select an existing Meta Business Portfolio already linked to your Meta Developer Account.
                      </p>
                    </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Available Business Portfolios
                  </label>

                  {businesses.length === 0 ? (
                    <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                      <p className="text-xs font-semibold text-slate-600">No Business Portfolios found.</p>
                      <p className="text-xs text-slate-400">Ensure your Meta account has Business Manager access.</p>
                    </div>
                  ) : (
                    businesses.map((biz) => {
                      const isSelected = selectedBusiness?.id === biz.id;

                      return (
                        <div
                          key={biz.id}
                          onClick={() => setSelectedBusiness(biz)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-red-50/70 border-red-600 shadow-sm ring-1 ring-red-600/30'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{biz.name}</h4>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span className="font-mono text-[10px] text-slate-400">ID: {biz.id}</span>
                                <span>•</span>
                                <span className="text-emerald-600 font-semibold">{biz.verificationStatus}</span>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Meta Business Verification Protected</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedToWaba}
                    disabled={!selectedBusiness || loading}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next: WhatsApp Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

            {/* ========================================================================= */}
            {/* STEP 2: SELECT OR CREATE WHATSAPP BUSINESS ACCOUNT (WABA) */}
            {/* ========================================================================= */}
            {step === 2 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6 animate-in fade-in">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                    <WhatsAppIcon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Connect WhatsApp Business Account
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Select an existing WhatsApp Business Account (WABA) or create a new one under <span className="font-bold text-slate-800">{selectedBusiness?.name}</span>.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Available WhatsApp Business Accounts
                    </label>
                    <button
                      type="button"
                      onClick={() => setCreateWabaModalOpen(true)}
                      className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      + Create WhatsApp Business Account
                    </button>
                  </div>

                  {wabas.length === 0 ? (
                    <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
                      <p className="text-xs font-semibold text-slate-700">No WABA found under this Portfolio.</p>
                      <button
                        type="button"
                        onClick={() => setCreateWabaModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-xs"
                      >
                        Create WhatsApp Business Account
                      </button>
                    </div>
                  ) : (
                    wabas.map((waba) => {
                      const isSelected = selectedWaba?.id === waba.id;

                      return (
                        <div
                          key={waba.id}
                          onClick={() => setSelectedWaba(waba)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-red-50/70 border-red-600 shadow-sm ring-1 ring-red-600/30'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <WhatsAppIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{waba.name}</h4>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span className="font-mono text-[10px] text-slate-400">ID: {waba.id}</span>
                                <span>•</span>
                                <span className="text-slate-600 font-semibold">{waba.currency} ({waba.timezoneId})</span>
                                <span>•</span>
                                <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  {waba.accountReviewStatus}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToPhone}
                    disabled={!selectedWaba || loading}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next: Select Phone Number</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 3: SELECT WHATSAPP BUSINESS PHONE NUMBER */}
            {/* ========================================================================= */}
            {step === 3 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6 animate-in fade-in">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-2xs">
                    <Phone className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Select your WhatsApp Business number
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Choose the verified WhatsApp phone number you want to connect to ARCO for broadcast campaigns and customer support.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Available Phone Numbers for {selectedWaba?.name}
                  </label>

                  {phoneNumbers.length === 0 ? (
                    <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                      <p className="text-xs font-semibold text-slate-700">No phone numbers found.</p>
                      <p className="text-xs text-slate-400">You can register a new number during the Meta authorization step.</p>
                    </div>
                  ) : (
                    phoneNumbers.map((phone) => {
                      const isSelected = selectedPhone?.id === phone.id;

                      return (
                        <div
                          key={phone.id}
                          onClick={() => setSelectedPhone(phone)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-red-50/70 border-red-600 shadow-sm ring-1 ring-red-600/30'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <Phone className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{phone.displayPhoneNumber}</h4>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span className="font-semibold text-slate-800">{phone.verifiedName}</span>
                                <span>•</span>
                                <span className="text-emerald-600 font-semibold">{phone.qualityRating}</span>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToAuthorization}
                    disabled={!selectedPhone || loading}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next: Authorize Meta</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 4: COMPLETE META AUTHORIZATION / EMBEDDED SIGNUP */}
            {/* ========================================================================= */}
            {step === 4 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6 animate-in fade-in">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                    <MetaIcon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Complete Meta Authorization
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Review your configuration and authorize ARCO Communication with Meta's official WhatsApp Business Platform.
                  </p>
                </div>

                {/* Configuration Summary Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Connection Summary
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Business Portfolio</span>
                      <span className="font-bold text-slate-900">{selectedBusiness?.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">WhatsApp Account (WABA)</span>
                      <span className="font-bold text-slate-900">{selectedWaba?.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Connected Phone Number</span>
                      <span className="font-bold text-emerald-600 font-mono">{selectedPhone?.displayPhoneNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Verified Name</span>
                      <span className="font-bold text-slate-900">{selectedPhone?.verifiedName}</span>
                    </div>
                  </div>
                </div>

                {/* Permissions & Security Badge */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
                  <div className="font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Official Meta WhatsApp Cloud API Authorization</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed pl-6">
                    ARCO will securely manage message templates, inbound customer inquiries, and broadcast dispatches on your behalf.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCompleteMetaSetup}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Authorizing with Meta...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete Meta Setup & Connect</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 5: SUCCESS STATE (WhatsApp Connected ✓) */}
            {/* ========================================================================= */}
            {step === 5 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-12 text-center space-y-6 animate-in zoom-in-95">
                {/* Success Icon */}
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    WhatsApp Connected ✓
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    Your WhatsApp Business account is now successfully connected to ARCO Communication.
                  </p>
                </div>

                {/* Connection Details Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                    <span className="text-slate-500">Business:</span>
                    <span className="font-bold text-slate-900">
                      {connectedIntegration?.businessName || selectedBusiness?.name || 'ARCO Communication Retail'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                    <span className="text-slate-500">WhatsApp Business Account:</span>
                    <span className="font-bold text-slate-900">
                      {connectedIntegration?.wabaId || selectedWaba?.name || 'WABA_9824901840'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {connectedIntegration?.displayPhoneNumber || selectedPhone?.displayPhoneNumber || '+91 98765 43210'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500">Status:</span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      ✓ Connected
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-all"
                  >
                    <span>Manage Connection</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </Container>
      </main>

      {/* 4. CREATE WABA MODAL */}
      {createWabaModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create WhatsApp Business Account</h3>
              <button
                type="button"
                onClick={() => setCreateWabaModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWaba} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={newWabaName}
                  onChange={(e) => setNewWabaName(e.target.value)}
                  placeholder="e.g. ARCO Direct Sales WABA"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Parent Portfolio
                </label>
                <input
                  type="text"
                  value={selectedBusiness?.name || 'Selected Portfolio'}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-500 bg-slate-100"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateWabaModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/25 cursor-pointer"
                >
                  Create WABA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subtle Footer */}
      <footer className="py-6 border-t border-slate-200/60 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} ARCO Communication. Meta Official WhatsApp Cloud API Partner.
      </footer>
    </div>
  );
}
