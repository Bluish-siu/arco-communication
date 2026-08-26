import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import Container from '../components/common/Container';
import { useOnboarding, getNextOnboardingRoute } from '../context/OnboardingContext';
import { authService } from '../services/authService';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthenticatedUser } = useOnboarding();

  const [status, setStatus] = useState('INITIALIZING'); // 'INITIALIZING' | 'SUCCESS' | 'ERROR'
  const [errorMessage, setErrorMessage] = useState('');
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (processedRef.current) return;
    processedRef.current = true;

    async function processCallback() {
      try {
        const error = searchParams.get('error');
        if (error) {
          setStatus('ERROR');
          setErrorMessage(decodeURIComponent(error));
          return;
        }

        const token = searchParams.get('token');
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        const target = searchParams.get('target');
        const isCompletedParam = searchParams.get('onboardingCompleted') === 'true';

        // Case 1: Backend already exchanged and redirected with JWT token in URL query
        if (token) {
          const userObj = {
            email: email || '',
            name: name || email?.split('@')[0] || 'Business Owner',
            onboardingCompleted: isCompletedParam,
          };
          setAuthenticatedUser(userObj, token);
          setStatus('SUCCESS');
          const dest = isCompletedParam ? '/dashboard' : (target || getNextOnboardingRoute(userObj, null));
          setTimeout(() => {
            navigate(dest, { replace: true });
          }, 300);
          return;
        }

        // Case 2: Frontend received authorization code from Google OAuth
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code) {
          setStatus('ERROR');
          setErrorMessage('No authorization code or session token found in Google response.');
          return;
        }

        // Call backend server-side exchange
        const result = await authService.handleGoogleCallback(code, state);

        if (result?.token && result?.user) {
          setAuthenticatedUser(result.user, result.token);
          setStatus('SUCCESS');
          const isUserCompleted = !!(result.user.onboardingCompleted || result.user.onboarding_completed);
          const dest = isUserCompleted ? '/dashboard' : (result.targetRoute || getNextOnboardingRoute(result.user, null));
          setTimeout(() => {
            navigate(dest, { replace: true });
          }, 300);
        } else {
          setStatus('ERROR');
          setErrorMessage('Failed to complete Google authentication with ARCO server.');
        }
      } catch (err) {
        console.error('[GoogleCallback Error]:', err);
        setStatus('ERROR');
        setErrorMessage(err.message || 'An unexpected error occurred during Google authentication.');
      }
    }

    processCallback();
  }, [searchParams, navigate, setAuthenticatedUser]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <Container>
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link to="/" className="flex items-center group">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 leading-none">
                ARCO <span className="font-semibold text-slate-800">Communication</span>
              </span>
            </Link>
            <div className="text-xs font-semibold text-slate-400">
              Google Sign-In
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-8 text-center space-y-5">
          
          {status === 'INITIALIZING' && (
            <div className="space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0d3b30] flex items-center justify-center mx-auto shadow-2xs">
                <RefreshCw className="w-6 h-6 animate-spin text-[#0d3b30]" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Authenticating with Google...</h2>
                <p className="text-xs text-slate-500">
                  Verifying your account credentials securely. Please wait a moment.
                </p>
              </div>
            </div>
          )}

          {status === 'SUCCESS' && (
            <div className="space-y-4 py-4 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Authentication Successful!</h2>
                <p className="text-xs text-slate-500">
                  Redirecting you to your ARCO workspace...
                </p>
              </div>
            </div>
          )}

          {status === 'ERROR' && (
            <div className="space-y-4 py-4 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-2xs">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-slate-900">Sign-In Failed</h2>
                <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200 leading-relaxed font-medium">
                  {errorMessage}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/60 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} ARCO Communication. All rights reserved.
      </footer>
    </div>
  );
}
