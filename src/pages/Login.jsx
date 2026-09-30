import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  Phone,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Edit2,
  Smartphone,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import Container from '../components/common/Container';
import { useOnboarding } from '../context/OnboardingContext';
import { authService } from '../services/authService';
import { isShopifyEmbedded } from '../utils/shopifyAppBridge';
import { integrationService } from '../services/integrationService';
import {
  setupRecaptcha,
  sendFirebasePhoneOtp,
  confirmFirebaseOtp,
  clearRecaptcha,
} from '../config/firebase';

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: 'India (+91)' },
  { code: '+1', country: 'US', label: 'United States (+1)' },
  { code: '+44', country: 'GB', label: 'United Kingdom (+44)' },
  { code: '+971', country: 'AE', label: 'UAE (+971)' },
  { code: '+65', country: 'SG', label: 'Singapore (+65)' },
  { code: '+61', country: 'AU', label: 'Australia (+61)' },
  { code: '+49', country: 'DE', label: 'Germany (+49)' },
  { code: '+33', country: 'FR', label: 'France (+33)' },
  { code: '+81', country: 'JP', label: 'Japan (+81)' },
];

// Meta WhatsApp SVG Icon
const WhatsAppIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, demoLogin, setAuthenticatedUser } = useOnboarding();

  // Embedded Shopify App Detection & Auto-Login
  const isEmbedded = isShopifyEmbedded();
  const [isShopifyLoggingIn, setIsShopifyLoggingIn] = useState(isEmbedded);
  const [shopifyError, setShopifyError] = useState(null);

  useEffect(() => {
    if (!isEmbedded) return;

    let isMounted = true;
    async function autoAuthShopify() {
      try {
        setIsShopifyLoggingIn(true);
        setShopifyError(null);
        const sessionRes = await integrationService.getShopifySession();
        if (sessionRes?.token && sessionRes?.user && isMounted) {
          setAuthenticatedUser(sessionRes.user, sessionRes.token);

          const redirectParam = searchParams.get('redirect');
          let targetUrl = '/integrations';
          if (redirectParam) {
            try {
              const decoded = decodeURIComponent(redirectParam);
              targetUrl = decoded;
            } catch {
              targetUrl = redirectParam;
            }
          }
          navigate(targetUrl, { replace: true });
        } else if (isMounted) {
          throw new Error(sessionRes?.error || 'Failed to authenticate with Shopify store session');
        }
      } catch (err) {
        console.error('[Login] Embedded Shopify auto-auth error:', err);
        if (isMounted) {
          setShopifyError(err.message || 'Failed to authenticate your Shopify store.');
          setIsShopifyLoggingIn(false);
        }
      }
    }

    autoAuthShopify();
    return () => {
      isMounted = false;
    };
  }, [isEmbedded, navigate, searchParams, setAuthenticatedUser]);

  // Auth Modes: 'default' | 'phone_number' | 'phone_otp'
  const [authMode, setAuthMode] = useState('default');
  const [deliveryChannel, setDeliveryChannel] = useState('whatsapp'); // 'whatsapp' | 'sms'
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  // Standard Email/Password Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Phone / WhatsApp Auth State
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(30);
  const otpInputRefs = useRef([]);

  // Check URL query for errors returned from OAuth redirects
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  // Resend OTP Countdown Timer
  useEffect(() => {
    let timer = null;
    if (authMode === 'phone_otp' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [authMode, resendCooldown]);

  // Clean up recaptcha on unmount or mode switch
  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email address and password.');
      return;
    }
    const res = await login(email.trim(), password.trim());
    if (!res || !res.token) {
      setError(res?.error || 'Passwordless email login is disabled for security. Please sign in using Google Sign-In or Phone OTP below.');
      return;
    }
    if (res?.user?.onboardingCompleted) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
  };

  // 1-Click Instant Demo Login (For Presentations, Evaluations, and Team Testing)
  const handleDemoAccess = async () => {
    setError('');
    setIsDemoLoading(true);
    try {
      const res = await demoLogin();
      if (res?.token) {
        const redirectParam = searchParams.get('redirect');
        navigate(redirectParam ? decodeURIComponent(redirectParam) : '/dashboard');
      } else {
        setError(res?.error || 'Failed to start demo session. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Demo session failed.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  // Real Google OAuth 2.0 Flow
  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const authData = await authService.getGoogleAuthUrl();
      if (authData?.authUrl) {
        window.location.href = authData.authUrl;
      } else {
        window.location.href = `${window.location.origin}/api/auth/google`;
      }
    } catch (err) {
      setIsGoogleLoading(false);
      setError(err.message || 'Failed to initiate Google OAuth login.');
    }
  };

  // =========================================================================
  // FIREBASE PHONE + OTP AUTHENTICATION FLOW
  // =========================================================================

  const getFullPhoneNumber = () => {
    const cleanDigits = phoneNumber.replace(/[^0-9]/g, '');
    return `${countryCode}${cleanDigits}`;
  };

  // Step 1: Send OTP to Phone / WhatsApp
  const handleSendPhoneOtp = async (e, channelOverride) => {
    if (e) e.preventDefault();
    setError('');
    const cleanDigits = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanDigits || cleanDigits.length < 6) {
      setError('Please enter a valid phone number with your country code.');
      return;
    }

    const targetChannel = channelOverride || deliveryChannel;
    const fullPhone = getFullPhoneNumber();
    setIsSendingOtp(true);

    if (targetChannel === 'whatsapp') {
      try {
        const res = await authService.sendWhatsAppOtp(fullPhone);
        if (!res?.success) {
          throw new Error(res?.error || 'Failed to dispatch WhatsApp OTP.');
        }
        setDeliveryChannel('whatsapp');
        setAuthMode('phone_otp');
        setOtpDigits(['', '', '', '', '', '']);
        setResendCooldown(30);

        // Focus first OTP box
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } catch (err) {
        console.error('[WhatsApp OTP Send Error]:', err);
        setError(err.message || 'Failed to dispatch WhatsApp verification code. Please check your phone number.');
      } finally {
        setIsSendingOtp(false);
      }
    } else {
      // Firebase SMS flow fallback
      try {
        const appVerifier = setupRecaptcha('recaptcha-container');
        const res = await sendFirebasePhoneOtp(fullPhone, appVerifier);
        setConfirmationResult(res.confirmationResult);
        setDeliveryChannel('sms');
        setAuthMode('phone_otp');
        setOtpDigits(['', '', '', '', '', '']);
        setResendCooldown(30);

        // Focus first OTP box
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } catch (err) {
        console.error('[Firebase Phone Send Error]:', err);
        let userMsg = 'Failed to send verification code via SMS. Please try WhatsApp verification instead.';
        if (err.code === 'auth/invalid-phone-number') {
          userMsg = 'The phone number entered is invalid. Please verify country code and digits.';
        } else if (err.code === 'auth/too-many-requests') {
          userMsg = 'Too many attempts. Please wait a few minutes before requesting another code.';
        } else if (err.code === 'auth/quota-exceeded') {
          userMsg = 'SMS quota exceeded for today. Please use WhatsApp sign-in instead.';
        } else if (err.code === 'auth/captcha-check-failed') {
          userMsg = 'reCAPTCHA verification failed. Please try WhatsApp sign-in instead.';
        }
        setError(userMsg);
        clearRecaptcha();
      } finally {
        setIsSendingOtp(false);
      }
    }
  };

  // Step 2: Handle OTP Digits Input (Auto-advance & Backspace)
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (error) setError('');

    // If digit entered, auto-focus next input
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits entered
    const completeCode = newDigits.join('');
    if (completeCode.length === 6) {
      verifyOtpCode(completeCode);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pastedData) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setOtpDigits(newDigits);
      if (pastedData.length === 6) {
        verifyOtpCode(pastedData);
      } else if (otpInputRefs.current[pastedData.length]) {
        otpInputRefs.current[pastedData.length].focus();
      }
    }
  };

  // Step 3: Verify OTP with WhatsApp Backend or Firebase
  const verifyOtpCode = async (otpCode) => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setError('');
    setIsVerifyingOtp(true);

    try {
      const fullPhone = getFullPhoneNumber();
      let authUser = null;
      let authToken = null;
      let targetRoute = '/dashboard';

      if (deliveryChannel === 'whatsapp') {
        const res = await authService.verifyWhatsAppOtp(fullPhone, otpCode);
        if (!res?.token) {
          throw new Error(res?.error || 'WhatsApp authentication failed.');
        }
        authUser = res.user;
        authToken = res.token;
        targetRoute = res.targetRoute || (authUser?.onboardingCompleted ? '/dashboard' : '/onboarding');
      } else {
        if (!confirmationResult) {
          setError('Verification session expired. Please request a new code.');
          return;
        }
        const firebaseRes = await confirmFirebaseOtp(confirmationResult, otpCode);
        const idToken = firebaseRes.idToken;
        if (!idToken) {
          throw new Error('Firebase authentication succeeded but no ID token was provided.');
        }
        const backendRes = await authService.loginWithPhone(idToken);
        if (!backendRes?.token) {
          throw new Error(backendRes?.error || 'Authentication failed on server.');
        }
        authUser = backendRes.user;
        authToken = backendRes.token;
        targetRoute = backendRes.targetRoute || (authUser?.onboardingCompleted ? '/dashboard' : '/onboarding');
      }

      setAuthenticatedUser(authUser, authToken);
      console.log(`[AUTH SUCCESS] Channel: ${deliveryChannel} -> Navigating to: "${targetRoute}"`);
      navigate(targetRoute);
    } catch (err) {
      console.error('[Verify OTP Error]:', err);
      let userMsg = 'Invalid verification code. Please check and enter the code again.';
      if (err.code === 'auth/invalid-verification-code') {
        userMsg = 'Incorrect 6-digit verification code. Please try again.';
      } else if (err.code === 'auth/code-expired') {
        userMsg = 'This verification code has expired. Please click "Resend Code" below.';
      } else if (err.code === 'auth/session-expired') {
        userMsg = 'Verification session expired. Please request a new code.';
      } else if (err.message) {
        userMsg = err.message;
      }
      setError(userMsg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleManualVerifySubmit = (e) => {
    e.preventDefault();
    const completeCode = otpDigits.join('');
    verifyOtpCode(completeCode);
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    handleSendPhoneOtp(null, deliveryChannel);
  };

  if (isEmbedded && isShopifyLoggingIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-slate-800/95 border border-slate-700/80 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="h-0.5 w-6 bg-slate-700"></div>
            <div className="w-12 h-12 rounded-xl bg-[#95BF47]/20 border border-[#95BF47]/30 flex items-center justify-center text-[#95BF47]">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Connecting to Shopify Admin</h2>
          <p className="text-sm text-slate-400 mb-6">
            Signing you in via Shopify App Bridge. Your WhatsApp omnichannel dashboard is loading...
          </p>
          <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden mb-4">
            <div className="bg-gradient-to-r from-emerald-500 to-[#95BF47] h-full w-2/3 animate-pulse rounded-full"></div>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Verifying Shopify store session</span>
          </div>
        </div>
      </div>
    );
  }

  if (isEmbedded && shopifyError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-slate-800/90 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Shopify Authorization Needed</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {shopifyError}
          </p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('arco_shopify_embedded');
                setIsShopifyLoggingIn(false);
                setShopifyError(null);
              }}
              className="w-full py-2 px-4 bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition cursor-pointer"
            >
              Sign in with ARCO account instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <Container>
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center group">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 leading-none">
                ARCO <span className="font-semibold text-slate-800">Communication</span>
              </span>
            </Link>

            {/* Right Status */}
            <div className="text-xs font-semibold text-slate-400">
              Secure Sign In
            </div>
          </div>
        </Container>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 flex items-center justify-center py-10 sm:py-16 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-6 sm:p-10">
          
          {/* Header Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {authMode === 'phone_otp'
                ? deliveryChannel === 'whatsapp' ? 'Verify WhatsApp OTP' : 'Verify SMS OTP'
                : authMode === 'phone_number'
                ? deliveryChannel === 'whatsapp' ? 'Sign In with WhatsApp' : 'Sign In with Phone'
                : 'Sign In'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              {authMode === 'phone_otp'
                ? `Enter the 6-digit code sent to ${deliveryChannel === 'whatsapp' ? 'your WhatsApp on ' : ''}${countryCode} ${phoneNumber}`
                : authMode === 'phone_number'
                ? deliveryChannel === 'whatsapp'
                  ? 'Enter your mobile number to receive your OTP code on WhatsApp'
                  : 'Enter your mobile number to sign in via SMS'
                : 'Access your ARCO WhatsApp & omnichannel dashboard'}
            </p>
          </div>

          {/* Inline Validation Error */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in leading-relaxed">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Informational message */}
          {message && (
            <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold text-center animate-in fade-in">
              {message}
            </div>
          )}

          {/* Hidden Recaptcha Container (For SMS Fallback) */}
          <div id="recaptcha-container"></div>

          {/* ========================================================================= */}
          {/* VIEW 1: DEFAULT SOCIAL & EMAIL LOGIN */}
          {/* ========================================================================= */}
          {authMode === 'default' && (
            <div className="space-y-3">
              
              {/* 0. Instant 1-Click Demo Login */}
              <button
                type="button"
                disabled={isDemoLoading}
                onClick={handleDemoAccess}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 hover:from-amber-100 hover:to-orange-100 transition-all font-bold text-xs sm:text-sm text-amber-950 shadow-xs group cursor-pointer disabled:opacity-70"
              >
                <div className="flex items-center gap-2.5">
                  {isDemoLoading ? (
                    <RefreshCw className="w-4 h-4 text-amber-700 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>{isDemoLoading ? 'Launching Demo Workspace...' : 'Explore Demo Account (1-Click)'}</span>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded border border-amber-400">
                  Instant Access
                </span>
              </button>

              {/* 1. Google Social Login */}
              <button
                type="button"
                disabled={isGoogleLoading}
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 transition-all font-semibold text-xs sm:text-sm text-slate-700 shadow-2xs group cursor-pointer disabled:opacity-70"
              >
                <div className="flex items-center gap-3">
                  {isGoogleLoading ? (
                    <RefreshCw className="w-4 h-4 text-[#0d3b30] animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.34 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                  )}
                  <span>{isGoogleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Google SSO
                </span>
              </button>

              {/* 2. WhatsApp OTP Authentication Option (Primary) */}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setDeliveryChannel('whatsapp');
                  setAuthMode('phone_number');
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/70 transition-all font-semibold text-xs sm:text-sm text-slate-800 shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-slate-900 block leading-tight">Continue with WhatsApp</span>
                    <span className="text-[10px] text-emerald-800 font-medium block">Instant 1-tap OTP verification</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded border border-emerald-400">
                  Recommended
                </span>
              </button>

              {/* 3. Phone SMS Fallback Option */}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setDeliveryChannel('sms');
                  setAuthMode('phone_number');
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all font-medium text-xs text-slate-600 shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Continue with SMS OTP</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  SMS Text
                </span>
              </button>

              {/* OR Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  OR EMAIL SIGN IN
                </span>
              </div>

              {/* Standard Email/Password Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0d3b30] focus:border-[#0d3b30] outline-hidden placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0d3b30] focus:border-[#0d3b30] outline-hidden placeholder:text-slate-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0d3b30] hover:bg-[#092b23] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  Sign In with Email
                </button>
              </form>

            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: PHONE / WHATSAPP NUMBER ENTRY */}
          {/* ========================================================================= */}
          {authMode === 'phone_number' && (
            <form onSubmit={(e) => handleSendPhoneOtp(e, deliveryChannel)} className="space-y-4 animate-in fade-in duration-150">
              
              {/* Delivery Channel Switcher Tabs */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryChannel('whatsapp');
                    setError('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    deliveryChannel === 'whatsapp'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <WhatsAppIcon className={`w-3.5 h-3.5 ${deliveryChannel === 'whatsapp' ? 'text-[#25D366]' : 'text-slate-400'}`} />
                  <span>WhatsApp (Instant)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryChannel('sms');
                    setError('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    deliveryChannel === 'sms'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>SMS Fallback</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {deliveryChannel === 'whatsapp' ? 'WhatsApp Phone Number' : 'Mobile Phone Number'}
                </label>
                
                <div className="flex items-center gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-32 px-2.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#0d3b30] outline-hidden cursor-pointer"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    required
                    autoFocus
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="98765 43210"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold tracking-wide focus:ring-2 focus:ring-[#0d3b30] outline-hidden placeholder:text-slate-400"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {deliveryChannel === 'whatsapp'
                    ? "🟢 We'll dispatch a 6-digit code with 1-tap Copy Code to your WhatsApp."
                    : "We'll send a 6-digit SMS text code to verify your phone number."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className={`w-full py-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 ${
                    deliveryChannel === 'whatsapp'
                      ? 'bg-[#25D366] hover:bg-[#1fb857] shadow-emerald-500/20'
                      : 'bg-[#0d3b30] hover:bg-[#092b23]'
                  }`}
                >
                  {isSendingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>{deliveryChannel === 'whatsapp' ? 'Sending WhatsApp Code...' : 'Sending SMS Code...'}</span>
                    </>
                  ) : (
                    <>
                      {deliveryChannel === 'whatsapp' ? (
                        <WhatsAppIcon className="w-4 h-4 fill-white" />
                      ) : (
                        <Phone className="w-4 h-4" />
                      )}
                      <span>
                        {deliveryChannel === 'whatsapp'
                          ? 'Send Verification Code via WhatsApp'
                          : 'Send Verification Code via SMS'}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setAuthMode('default');
                  }}
                  className="w-full py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Use a different sign-in method</span>
                </button>
              </div>

            </form>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: 6-DIGIT OTP VERIFICATION */}
          {/* ========================================================================= */}
          {authMode === 'phone_otp' && (
            <form onSubmit={handleManualVerifySubmit} className="space-y-5 animate-in fade-in duration-150">
              
              {/* Delivery Channel Indicator / Tip Box */}
              {deliveryChannel === 'whatsapp' ? (
                <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-950">
                  <div className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                  </div>
                  <div className="space-y-0.5 leading-relaxed">
                    <p className="font-bold text-emerald-950">WhatsApp Verification Code Sent</p>
                    <p className="text-[11px] text-emerald-800">
                      Check your WhatsApp chat from ARCO. You can tap the <span className="font-bold underline">[Copy Code]</span> button on your phone to paste it here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-xs text-slate-600">
                  <Smartphone className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Enter the 6-digit SMS code sent to your phone.</span>
                </div>
              )}

              {/* Phone Display & Edit */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  {deliveryChannel === 'whatsapp' ? (
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                  ) : (
                    <Smartphone className="w-4 h-4 text-[#0d3b30]" />
                  )}
                  <span className="font-bold text-slate-800 font-mono">
                    {countryCode} {phoneNumber}
                  </span>
                  <span className="text-[10px] text-slate-400">({deliveryChannel.toUpperCase()})</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setAuthMode('phone_number');
                  }}
                  className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              {/* 6-Digit PIN Inputs */}
              <div className="space-y-2">
                <label className="block text-center text-xs font-bold text-slate-700">
                  Enter 6-digit {deliveryChannel === 'whatsapp' ? 'WhatsApp ' : ''}Verification Code
                </label>
                <div className="flex items-center justify-center gap-2" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`w-11 h-12 text-center text-lg font-extrabold rounded-xl border border-slate-300 bg-white text-slate-900 outline-hidden shadow-2xs transition-all ${
                        deliveryChannel === 'whatsapp'
                          ? 'focus:ring-2 focus:ring-[#25D366] focus:border-[#25D366]'
                          : 'focus:ring-2 focus:ring-[#0d3b30] focus:border-[#0d3b30]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Resend Cooldown & Actions */}
              <div className="text-center text-xs">
                {resendCooldown > 0 ? (
                  <span className="text-slate-400 font-medium">
                    Resend code in <span className="font-bold text-slate-700 font-mono">{resendCooldown}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isSendingOtp}
                    className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
                  >
                    Resend Code via {deliveryChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                  </button>
                )}
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="submit"
                  disabled={isVerifyingOtp || otpDigits.join('').length !== 6}
                  className={`w-full py-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                    deliveryChannel === 'whatsapp'
                      ? 'bg-[#25D366] hover:bg-[#1fb857] shadow-emerald-500/20'
                      : 'bg-[#0d3b30] hover:bg-[#092b23]'
                  }`}
                >
                  {isVerifyingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      {deliveryChannel === 'whatsapp' && <WhatsAppIcon className="w-4 h-4 fill-white" />}
                      <span>Verify & Continue</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setAuthMode('default');
                  }}
                  className="w-full py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </form>
          )}

          {/* Footer Signup Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an ARCO account?{' '}
            <Link to="/signup" className="text-[#0d3b30] font-bold hover:underline">
              Create account
            </Link>
          </div>

        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white">
        © 2026 ARCO Communication. All rights reserved. • Enterprise Messaging Suite
      </footer>
    </div>
  );
}
