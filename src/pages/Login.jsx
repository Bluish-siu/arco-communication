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
} from 'lucide-react';
import Container from '../components/common/Container';
import { useOnboarding } from '../context/OnboardingContext';
import { authService } from '../services/authService';
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

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useOnboarding();

  // Auth Modes: 'default' | 'phone_number' | 'phone_otp'
  const [authMode, setAuthMode] = useState('default');

  // Standard Email/Password Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Phone Auth State
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
    if (res?.user?.onboardingCompleted) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
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

  // Step 1: Send OTP to Phone
  const handleSendPhoneOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    const cleanDigits = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanDigits || cleanDigits.length < 6) {
      setError('Please enter a valid phone number with your country code.');
      return;
    }

    const fullPhone = getFullPhoneNumber();
    setIsSendingOtp(true);

    try {
      // 1. Setup invisible Recaptcha Verifier
      const appVerifier = setupRecaptcha('recaptcha-container');

      // 2. Send SMS using Firebase signInWithPhoneNumber
      const res = await sendFirebasePhoneOtp(fullPhone, appVerifier);
      setConfirmationResult(res.confirmationResult);
      setAuthMode('phone_otp');
      setOtpDigits(['', '', '', '', '', '']);
      setResendCooldown(30);

      // Focus first OTP box
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err) {
      console.error('[Firebase Phone Send Error]:', err);
      let userMsg = 'Failed to send verification code. Please check your phone number and try again.';
      if (err.code === 'auth/invalid-phone-number') {
        userMsg = 'The phone number entered is invalid. Please verify country code and digits.';
      } else if (err.code === 'auth/too-many-requests') {
        userMsg = 'Too many attempts. Please wait a few minutes before requesting another code.';
      } else if (err.code === 'auth/quota-exceeded') {
        userMsg = 'SMS quota exceeded for today. Please try another sign-in method.';
      } else if (err.code === 'auth/captcha-check-failed') {
        userMsg = 'reCAPTCHA verification failed. Please try again.';
      }
      setError(userMsg);
      clearRecaptcha();
    } finally {
      setIsSendingOtp(false);
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

  // Step 3: Verify OTP with Firebase and obtain Authoritative ID Token
  const verifyOtpCode = async (otpCode) => {
    if (!confirmationResult) {
      setError('Verification session expired. Please request a new code.');
      return;
    }
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setError('');
    setIsVerifyingOtp(true);

    try {
      // 1. Confirm OTP with Firebase Auth
      const firebaseRes = await confirmFirebaseOtp(confirmationResult, otpCode);
      const idToken = firebaseRes.idToken;

      if (!idToken) {
        throw new Error('Firebase authentication succeeded but no ID token was provided.');
      }

      // 2. Send authoritative ID token to backend for verification & session establishment
      const backendRes = await authService.loginWithPhone(idToken);

      if (!backendRes?.token) {
        throw new Error(backendRes?.error || 'Authentication failed on server.');
      }

      // 3. Follow authoritative onboarding lifecycle routing
      const user = backendRes.user;
      const targetRoute = backendRes.targetRoute || (user?.onboardingCompleted ? '/dashboard' : '/onboarding');

      console.log(`[PHONE LOGIN SUCCESS] Navigating to target route: "${targetRoute}"`);
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
    handleSendPhoneOtp();
  };

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
              {authMode === 'phone_otp' ? 'Verify OTP' : 'Sign In'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              {authMode === 'phone_otp'
                ? `Enter the 6-digit code sent to ${countryCode} ${phoneNumber}`
                : authMode === 'phone_number'
                ? 'Enter your mobile number to sign in via OTP'
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

          {/* Hidden Recaptcha Container */}
          <div id="recaptcha-container"></div>

          {/* ========================================================================= */}
          {/* VIEW 1: DEFAULT SOCIAL & EMAIL LOGIN */}
          {/* ========================================================================= */}
          {authMode === 'default' && (
            <div className="space-y-4">
              
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
                  Recommended
                </span>
              </button>

              {/* 2. Phone OTP Authentication Option */}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setAuthMode('phone_number');
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 transition-all font-semibold text-xs sm:text-sm text-slate-700 shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#0d3b30] text-white flex items-center justify-center">
                    <Phone className="w-2.5 h-2.5" />
                  </div>
                  <span>Continue with Phone</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  OTP SMS
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
          {/* VIEW 2: PHONE NUMBER ENTRY */}
          {/* ========================================================================= */}
          {authMode === 'phone_number' && (
            <form onSubmit={handleSendPhoneOtp} className="space-y-5 animate-in fade-in duration-150">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Mobile Phone Number
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
                  We'll send a 6-digit OTP code to verify your phone number.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-3 rounded-xl bg-[#0d3b30] hover:bg-[#092b23] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isSendingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Sending OTP Code...</span>
                    </>
                  ) : (
                    <span>Send Verification Code</span>
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
            <form onSubmit={handleManualVerifySubmit} className="space-y-6 animate-in fade-in duration-150">
              
              {/* Phone Display & Edit */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#0d3b30]" />
                  <span className="font-bold text-slate-800 font-mono">
                    {countryCode} {phoneNumber}
                  </span>
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
                  Enter 6-digit OTP Code
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
                      className="w-11 h-12 text-center text-lg font-extrabold rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#0d3b30] focus:border-[#0d3b30] outline-hidden shadow-2xs"
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
                    Resend Code
                  </button>
                )}
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="submit"
                  disabled={isVerifyingOtp || otpDigits.join('').length !== 6}
                  className="w-full py-3 rounded-xl bg-[#0d3b30] hover:bg-[#092b23] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifyingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <span>Verify & Continue</span>
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
