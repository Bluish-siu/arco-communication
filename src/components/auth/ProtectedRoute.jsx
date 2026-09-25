import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';

/**
 * Route guard that prevents unauthenticated access to protected workspace routes.
 * Redirects unauthenticated visitors to /login with redirect parameter.
 */
export default function ProtectedRoute({ children }) {
  const { user } = useOnboarding();
  const location = useLocation();

  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('arco_auth_token') || localStorage.getItem('token'))
    : null;

  if (!token && !user?.isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${returnUrl}`} replace />;
  }

  return children;
}
