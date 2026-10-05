import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  User,
  ShoppingBag,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  Edit2,
  ShieldCheck,
} from 'lucide-react';
import Container from '../components/common/Container';
import { authService } from '../services/authService';
import { useOnboarding } from '../context/OnboardingContext';

// WhatsApp Official SVG Icon
const WhatsAppIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Meta / Facebook Official Icon
const FacebookIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// Instagram SVG Icon
const InstagramIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// Google 4-Color SVG Icon
const GoogleIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

// Shopify Official SVG Icon
const ShopifyIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.98 7.42c-.03-.23-.21-.4-.44-.41-.23 0-4.04-.26-4.04-.26s-2.69-2.67-2.98-2.96c-.29-.29-.86-.2-1.07-.11-.06.03-.35.15-.79.35-.49-.78-1.15-1.42-2.01-1.74-.3-.11-.64-.17-.98-.17-1.47 0-2.77.92-3.23 2.29-.93.38-1.57.65-1.63.67-.5.21-.52.23-.58.74L.8 19.33c-.07.56.32 1.05.88 1.12l13.62 1.76c.07.01.14.01.21.01.49 0 .91-.35.98-.85l3.49-13.95zm-6.22 11.23l-10.9-1.41 1.34-11.75 3.32-.82c.04.14.09.28.16.42.5 1.05 1.44 1.77 2.53 1.94l-1.05 4.21c-.08.3.09.61.39.69.3.08.61-.09.69-.39l1.09-4.36c.11.01.22.02.33.02.16 0 .32-.02.48-.05l-1.39 5.56c-.08.3.09.61.39.69.3.08.61-.09.69-.39l1.45-5.8c.64-.19 1.17-.6 1.5-1.15l-1.03 12.83zm-5.07-13.2c.32-.14.68-.21 1.05-.21.24 0 .47.04.7.11.58.19 1.02.63 1.25 1.2l-3.32.84c.08-.82.12-1.74.32-1.94zm2.14 8.78c-.08.3.09.61.39.69.05.01.1.02.15.02.25 0 .48-.16.54-.42l1.62-6.49c.12-.08.23-.16.34-.26l-3.04 6.46z"/>
  </svg>
);

// TallyPrime Icon
const TallyIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#0080FF" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#FFC800" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#E62E2D" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#00AA44" />
  </svg>
);

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi NCR',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Other',
];

export default function Signup() {
  const navigate = useNavigate();
  const { setAuthenticatedUser, updateBusinessSetup } = useOnboarding();

  // Multi-step state: 1 = Initial Email & Name, 2 = Business Profile Form
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 Inputs
  const [workEmail, setWorkEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailTooltipVisible, setEmailTooltipVisible] = useState(true);

  // Step 2 Business Details Inputs
  const [selectedChannel, setSelectedChannel] = useState('Both');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [annualRevenue, setAnnualRevenue] = useState('₹10 Lakhs - ₹50 Lakhs');
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [captchaChecked, setCaptchaChecked] = useState(true);

  // Status & error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Handle Google OAuth 2.0
  const handleGoogleSignup = async () => {
    try {
      const authData = await authService.getGoogleAuthUrl();
      if (authData?.authUrl) {
        window.location.href = authData.authUrl;
      } else {
        window.location.href = '/api/auth/google';
      }
    } catch (err) {
      console.error('[Google Signup Error]:', err);
      window.location.href = '/api/auth/google';
    }
  };

  // Handle Shopify direct store signup
  const handleShopifySignup = () => {
    window.open('https://apps.shopify.com', '_blank', 'noopener,noreferrer');
  };

  // Step 1: Click "Next" -> Validate email & names, then switch to Step 2
  const handleStep1Next = (e) => {
    e.preventDefault();
    setFormError('');

    if (!workEmail.trim() || !workEmail.includes('@')) {
      setFormError('Please enter a valid work email address.');
      return;
    }

    if (!firstName.trim()) {
      setFormError('Please enter your first name.');
      return;
    }

    // Advance to Step 2 form in-place
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2: Click "Create Account" -> Register user + business setup, then navigate to onboarding process
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setFormError('');

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setFormError('Please enter a valid mobile phone number.');
      return;
    }

    if (!companyName.trim()) {
      setFormError('Please enter your company name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const businessPayload = {
        channel: selectedChannel,
        phone: `+91${cleanPhone.slice(-10)}`,
        companyName: companyName.trim(),
        companyWebsite: companyWebsite.trim(),
        country,
        state,
        annualRevenue,
        whatsappUpdates,
      };

      const res = await authService.register({
        email: workEmail.trim().toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ...businessPayload,
      });

      if (!res?.token && !res?.data?.token) {
        throw new Error(res?.error || 'Registration failed. Please check your details and try again.');
      }

      const userData = res.user || res.data?.user;
      const token = res.token || res.data?.token;

      // Update global authenticated user & business setup context
      if (userData && token) {
        setAuthenticatedUser(userData, token);
      }
      updateBusinessSetup(businessPayload);

      // Advance directly to the onboarding process (Step 1: Industry)
      navigate('/onboarding/industry');
    } catch (err) {
      console.error('[Create Account Exception]:', err);
      setFormError(err.message || 'Failed to create your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#052820] flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* 1. TOP WHITE HEADER (Exact match to Interakt top banner) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 leading-none">
                ARCO <span className="font-semibold text-emerald-700">Communication</span>
              </span>
            </Link>

            {/* Right Action: Sign In */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <span className="text-slate-500 hidden sm:inline">Already a user?</span>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl font-bold text-slate-800 hover:text-emerald-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER WITH DEEP FOREST GREEN PALETTE */}
      <main className="flex-1 py-8 sm:py-12 lg:py-14 relative overflow-hidden">
        {/* Subtle Ambient Emerald Lighting */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: Visual Showcase (Acquire & Engage Cards) (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-5 pt-2">
              
              {/* Title & Tagline */}
              <div>
                <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.15]">
                  <span className="text-[#25D366]">WhatsApp</span>{' '}
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                    & Instagram
                  </span>
                </h1>
                <p className="text-emerald-100/90 text-sm sm:text-base mt-2 font-medium">
                  Get a 14 day free trial | No Credit Card required
                </p>
              </div>

              {/* Visual Showcase: 2 Overlapping / Staggered Cards (Acquire & Engage) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4 pt-1">
                
                {/* CARD 1: ACQUIRE (Facebook Click-to-WhatsApp Ad) */}
                <div className="relative">
                  {/* Floating Pill Label */}
                  <div className="inline-block bg-[#f59e0b] text-slate-950 font-bold text-[11px] px-2.5 py-0.5 rounded-full mb-2 shadow-sm">
                    Acquire
                  </div>

                  {/* Facebook Floating Round Badge */}
                  <div className="absolute top-7 -left-2.5 z-20 w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg border-2 border-white">
                    <FacebookIcon className="w-4 h-4" />
                  </div>

                  {/* Ad Mockup Card */}
                  <div className="bg-white rounded-2xl p-3.5 shadow-xl border border-slate-100 text-slate-800 space-y-2 relative overflow-hidden">
                    <div className="pl-6">
                      <div className="font-extrabold text-xs text-slate-900 leading-tight">Acme Beauty</div>
                      <div className="text-[10px] text-slate-400">Sponsored</div>
                    </div>

                    <p className="text-[11px] text-slate-700 leading-snug line-clamp-2">
                      Explore radiant & relaxing skin care collection this summer.
                    </p>

                    {/* Skincare Product Image */}
                    <div className="rounded-xl overflow-hidden bg-slate-100 h-28 sm:h-32 w-full shadow-inner">
                      <img
                        src="/images/signup/skincare_ad.jpg"
                        alt="Acme Beauty Skincare"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="eager"
                      />
                    </div>

                    {/* Bottom CTA Bar */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-800">Send Message</span>
                      <div className="inline-flex items-center gap-1 bg-[#25D366] text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-xs">
                        <WhatsAppIcon className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 2: ENGAGE (WhatsApp Chat, Catalog, Smiling Customer) */}
                <div className="relative">
                  {/* Floating Pill Label */}
                  <div className="inline-block bg-[#f59e0b] text-slate-950 font-bold text-[11px] px-2.5 py-0.5 rounded-full mb-2 shadow-sm">
                    Engage
                  </div>

                  {/* WhatsApp Floating Round Badge */}
                  <div className="absolute top-7 -right-2.5 z-20 w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg border-2 border-white">
                    <WhatsAppIcon className="w-4 h-4" />
                  </div>

                  {/* Engage Card Body */}
                  <div className="bg-white rounded-2xl p-3.5 shadow-xl border border-slate-100 text-slate-800 space-y-2 relative overflow-hidden">
                    {/* Customer Inquiry Bubble */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-[10px] text-slate-700">
                      <div className="font-bold text-slate-900">Forest Essentials Facewash Set</div>
                      <div className="text-slate-500">Interested in your products.</div>
                    </div>

                    {/* Catalog Mini List */}
                    <div className="bg-slate-50/80 rounded-xl p-2 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-800">
                        <span>Catalog Collection</span>
                        <span className="text-slate-400 text-xs leading-none">×</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-100">
                        <span>Face Serum</span>
                        <span className="font-semibold text-emerald-600">Rs. 1500</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-100">
                        <span>Moisturiser</span>
                        <span className="font-semibold text-emerald-600">Rs. 500</span>
                      </div>
                    </div>

                    {/* Smiling Customer Portrait */}
                    <div className="rounded-xl overflow-hidden bg-slate-100 h-24 w-full shadow-inner">
                      <img
                        src="/images/signup/customer_smiling.jpg"
                        alt="Satisfied Customer"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="eager"
                      />
                    </div>

                    {/* Outgoing WhatsApp Payment Confirmation Bubble */}
                    <div className="bg-[#dcf8c6] rounded-xl p-1.5 text-[10px] text-slate-800 border border-emerald-200 flex items-center justify-between shadow-2xs">
                      <span className="truncate">Thank you, Here is the payment link</span>
                      <span className="text-emerald-700 font-bold ml-1 shrink-0">✓✓</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN: Interakt 2-Step Signup Container (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="w-full max-w-xl mx-auto space-y-4">
                
                {/* Integration Callout Box (Navy blue) - Visible on Both Steps */}
                <div className="bg-[#0e2a47] border border-[#1b4b7a] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 text-white shadow-lg">
                  <div className="text-xs text-slate-200">
                    <span className="font-semibold">For Tally Integration,</span>
                    <br />
                    <span className="text-slate-300 text-[11px]">signup directly with TallyPrime</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleShopifySignup}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
                  >
                    <TallyIcon className="w-3.5 h-3.5" />
                    <span>Sign up with TallyPrime</span>
                  </button>
                </div>

                {/* Validation Error Banner */}
                {formError && (
                  <div className="p-3 rounded-xl bg-red-900/60 border border-red-500/50 text-red-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* STEP 1: INITIAL REGISTRATION (Work Email, Name, Google/Shopify SSO, Next) */}
                {/* ========================================================================= */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      Start Your 14-Day Free Trial
                    </h2>

                    {/* SSO Buttons Grid (Google & Shopify) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleGoogleSignup}
                        className="w-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm py-3 px-3 rounded-xl flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer border border-slate-200"
                      >
                        <GoogleIcon className="w-4 h-4 shrink-0" />
                        <span>Signup with Google</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleShopifySignup}
                        className="w-full bg-[#5e8e3e] hover:bg-[#527d35] text-white font-bold text-xs sm:text-sm py-3 px-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <ShopifyIcon className="w-4 h-4 shrink-0" />
                        <span>Sign up with Shopify</span>
                      </button>
                    </div>

                    {/* Divider: OR, SIGN UP WITH EMAIL */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex-1 h-px bg-emerald-800/80" />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-200/70">
                        OR, SIGN UP WITH EMAIL
                      </span>
                      <div className="flex-1 h-px bg-emerald-800/80" />
                    </div>

                    {/* Email Registration Form */}
                    <form onSubmit={handleStep1Next} className="space-y-3.5">
                      {/* Work Email with Auto-Generated Password Tooltip (Exact Interakt behavior) */}
                      <div className="relative">
                        {/* Tooltip Bubble */}
                        {emailTooltipVisible && (
                          <div className="absolute -top-12 right-6 z-30 bg-white text-slate-800 text-[11px] font-medium py-1 px-3 rounded-lg shadow-xl border border-slate-200 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2">
                            <span>You'll receive an auto-generated password on this email</span>
                            {/* Downward triangle arrow */}
                            <div className="w-2.5 h-2.5 bg-white border-r border-b border-slate-200 rotate-45 absolute -bottom-1.5 right-6" />
                          </div>
                        )}

                        <input
                          type="email"
                          value={workEmail}
                          onChange={(e) => {
                            setWorkEmail(e.target.value);
                            if (formError) setFormError('');
                          }}
                          onFocus={() => setEmailTooltipVisible(true)}
                          placeholder="Work Email"
                          required
                          className="w-full bg-white text-slate-900 placeholder:text-slate-400 px-4 py-3.5 rounded-xl border border-transparent focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 text-sm font-medium transition-all shadow-sm"
                        />
                      </div>

                      {/* First Name & Last Name (2 columns) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            if (formError) setFormError('');
                          }}
                          placeholder="First Name"
                          required
                          className="w-full bg-white text-slate-900 placeholder:text-slate-400 px-4 py-3.5 rounded-xl border border-transparent focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 text-sm font-medium transition-all shadow-sm"
                        />
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            if (formError) setFormError('');
                          }}
                          placeholder="Last Name"
                          className="w-full bg-white text-slate-900 placeholder:text-slate-400 px-4 py-3.5 rounded-xl border border-transparent focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 text-sm font-medium transition-all shadow-sm"
                        />
                      </div>

                      {/* Interakt Warm Amber/Gold "Next" Button */}
                      <button
                        type="submit"
                        className="w-full py-3.5 px-6 rounded-xl bg-[#fbb03b] hover:bg-[#f39c12] active:scale-[0.99] text-slate-950 font-extrabold text-base shadow-lg shadow-black/20 hover:shadow-xl transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Next</span>
                        <ArrowRight className="w-4 h-4 text-slate-950" />
                      </button>

                      {/* Existing User Login Link */}
                      <div className="text-center pt-2">
                        <span className="text-xs text-emerald-100/90 font-medium">
                          Existing User?{' '}
                          <Link
                            to="/login"
                            className="text-white font-bold underline hover:text-emerald-300 transition-colors"
                          >
                            Login here
                          </Link>
                        </span>
                      </div>
                    </form>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* STEP 2: BUSINESS DETAILS FORM (Exact Interakt Screenshot 2)              */}
                {/* ========================================================================= */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    
                    {/* User Profile Badge Card (Shows registered name & email with edit option) */}
                    <div className="bg-white rounded-2xl p-3.5 sm:p-4 flex items-center justify-between border border-slate-200 shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm leading-tight">
                            {firstName} {lastName}
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            {workEmail}
                          </div>
                        </div>
                      </div>

                      {/* Edit Button to go back to Step 1 if needed */}
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer"
                        title="Edit email or name"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>

                    {/* Business Form Card */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4">
                      
                      {/* Select Channel */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-2">
                          Select Channel
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'WhatsApp', label: 'WhatsApp', icon: WhatsAppIcon, color: 'text-emerald-600' },
                            { id: 'Instagram', label: 'Instagram', icon: InstagramIcon, color: 'text-purple-600' },
                            { id: 'Both', label: 'Both', icon: WhatsAppIcon, color: 'text-emerald-700' },
                          ].map((ch) => {
                            const Icon = ch.icon;
                            const isSelected = selectedChannel === ch.id;
                            return (
                              <button
                                key={ch.id}
                                type="button"
                                onClick={() => setSelectedChannel(ch.id)}
                                className={`flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                                }`}
                              >
                                <Icon className={`w-3.5 h-3.5 ${ch.color}`} />
                                <span>{ch.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Business Form Grid */}
                      <form onSubmit={handleCreateAccount} className="space-y-3.5">
                        
                        {/* Row 1: Phone Number & Company Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Phone Number */}
                          <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-600 transition-all bg-white">
                            <span className="inline-flex items-center px-3 bg-slate-50 border-r border-slate-200 text-xs font-bold text-slate-600 select-none">
                              +91
                            </span>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => {
                                setPhone(e.target.value);
                                if (formError) setFormError('');
                              }}
                              placeholder="Phone Number"
                              required
                              className="w-full px-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                            />
                          </div>

                          {/* Company Name */}
                          <div>
                            <input
                              type="text"
                              value={companyName}
                              onChange={(e) => {
                                setCompanyName(e.target.value);
                                if (formError) setFormError('');
                              }}
                              placeholder="Company Name"
                              required
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-white"
                            />
                          </div>
                        </div>

                        {/* Row 2: Company Website & Country */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Company Website */}
                          <div>
                            <input
                              type="text"
                              value={companyWebsite}
                              onChange={(e) => setCompanyWebsite(e.target.value)}
                              placeholder="Company Website"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-white"
                            />
                          </div>

                          {/* Country Dropdown */}
                          <div className="relative">
                            <select
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all appearance-none cursor-pointer pr-8"
                            >
                              <option value="India">India</option>
                              <option value="United States">United States</option>
                              <option value="United Arab Emirates">United Arab Emirates</option>
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="Singapore">Singapore</option>
                              <option value="Other">Other</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Row 3: State & Annual Revenue (INR) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* State Dropdown */}
                          <div className="relative">
                            <select
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all appearance-none cursor-pointer pr-8"
                            >
                              <option value="">State</option>
                              {INDIAN_STATES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>

                          {/* Annual Revenue (INR) */}
                          <div className="relative">
                            <select
                              value={annualRevenue}
                              onChange={(e) => setAnnualRevenue(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all appearance-none cursor-pointer pr-8"
                            >
                              <option value="< ₹10 Lakhs">&lt; ₹10 Lakhs</option>
                              <option value="₹10 Lakhs - ₹50 Lakhs">₹10 Lakhs - ₹50 Lakhs</option>
                              <option value="₹50 Lakhs - ₹2 Crores">₹50 Lakhs - ₹2 Crores</option>
                              <option value="₹2 Crores - ₹10 Crores">₹2 Crores - ₹10 Crores</option>
                              <option value="> ₹10 Crores">&gt; ₹10 Crores</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* WhatsApp Updates Checkbox */}
                        <div className="flex items-start gap-2.5 pt-1">
                          <input
                            type="checkbox"
                            id="signupWaUpdates"
                            checked={whatsappUpdates}
                            onChange={(e) => setWhatsappUpdates(e.target.checked)}
                            className="accent-emerald-600 w-4 h-4 rounded mt-0.5 cursor-pointer"
                          />
                          <label htmlFor="signupWaUpdates" className="text-xs text-slate-600 leading-snug cursor-pointer flex items-center gap-1.5">
                            <span>Get updates regarding your ARCO account on WhatsApp</span>
                            <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          </label>
                        </div>

                        {/* Visual CAPTCHA Box */}
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-300 flex items-center justify-between">
                          <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={captchaChecked}
                              onChange={(e) => setCaptchaChecked(e.target.checked)}
                              className="w-5 h-5 rounded border-slate-300 accent-emerald-600 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-slate-700">I'm not a robot</span>
                          </label>
                          <div className="text-right text-[9px] text-slate-400 font-mono leading-tight">
                            <div>reCAPTCHA</div>
                            <span className="text-[8px]">Privacy · Terms</span>
                          </div>
                        </div>

                        {/* Primary CTA: Create Account (Vibrant Green Button) */}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3.5 px-6 rounded-xl bg-[#10b981] hover:bg-[#059669] active:scale-[0.99] text-white font-extrabold text-base shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin text-white" />
                              <span>Creating Account...</span>
                            </>
                          ) : (
                            <>
                              <span>Create Account</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>

                        {/* Legal Terms Disclaimer */}
                        <p className="text-[11px] text-slate-400 text-center leading-normal pt-1">
                          By clicking on “Create Account” you agree to our{' '}
                          <span className="text-emerald-700 font-semibold hover:underline cursor-pointer">terms and services</span>{' '}
                          and{' '}
                          <span className="text-emerald-700 font-semibold hover:underline cursor-pointer">privacy policy</span>.
                        </p>
                      </form>
                    </div>

                  </div>
                )}

              </div>
            </div>

          </div>
        </Container>
      </main>

      {/* 3. MINIMAL FOOTER */}
      <footer className="py-6 border-t border-emerald-900/60 bg-[#04201a] text-center text-xs text-emerald-300/60">
        © {new Date().getFullYear()} ARCO Communication. All rights reserved. • Meta Official Tech Provider
      </footer>
    </div>
  );
}
