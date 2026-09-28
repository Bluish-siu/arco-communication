import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import { isShopifyEmbedded } from '../../utils/shopifyAppBridge';
import { integrationService } from '../../services/integrationService';
import { RefreshCw, AlertCircle, ShoppingBag, Sparkles } from 'lucide-react';

/**
 * Route guard that prevents unauthenticated access to protected workspace routes.
 * If running embedded inside Shopify Admin, automatically acquires session token via App Bridge
 * and provisions the session without redirecting to /login.
 */
export default function ProtectedRoute({ children }) {
  const { user, setAuthenticatedUser } = useOnboarding();
  const location = useLocation();

  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('arco_auth_token') || localStorage.getItem('token'))
    : null;

  const isEmbedded = isShopifyEmbedded();
  const [isShopifyAuthenticating, setIsShopifyAuthenticating] = useState(isEmbedded && !token && !user?.isAuthenticated);
  const [shopifyAuthError, setShopifyAuthError] = useState(null);

  useEffect(() => {
    if (!isEmbedded || token || user?.isAuthenticated) {
      return;
    }

    let isMounted = true;
    async function authenticateEmbedded() {
      try {
        setIsShopifyAuthenticating(true);
        setShopifyAuthError(null);
        const sessionRes = await integrationService.getShopifySession();
        if (sessionRes?.token && sessionRes?.user && isMounted) {
          setAuthenticatedUser(sessionRes.user, sessionRes.token);
          setIsShopifyAuthenticating(false);
        } else if (isMounted) {
          throw new Error(sessionRes?.error || 'Unable to authenticate Shopify store session.');
        }
      } catch (err) {
        console.error('[ProtectedRoute] Shopify auto-auth failed:', err);
        if (isMounted) {
          setShopifyAuthError(err.message || 'Failed to connect to Shopify Admin.');
          setIsShopifyAuthenticating(false);
        }
      }
    }

    authenticateEmbedded();
    return () => {
      isMounted = false;
    };
  }, [isEmbedded, token, user?.isAuthenticated, setAuthenticatedUser]);

  if (isShopifyAuthenticating) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-md">
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
            Authorizing ARCO Communication for your store. Seamlessly syncing your workspace...
          </p>
          <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden mb-4">
            <div className="bg-gradient-to-r from-emerald-500 to-[#95BF47] h-full w-2/3 animate-pulse rounded-full"></div>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Establishing App Bridge v4 session</span>
          </div>
        </div>
      </div>
    );
  }

  if (shopifyAuthError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-slate-800/90 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Shopify Connection Needed</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {shopifyAuthError}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!token && !user?.isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${returnUrl}`} replace />;
  }

  return children;
}
