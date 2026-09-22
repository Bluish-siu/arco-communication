import React, { Component, useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { OnboardingProvider } from './context/OnboardingContext';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[App Error Boundary Caught Error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-base font-bold text-slate-900">Something went wrong</h2>
            <p className="text-xs text-slate-500">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <OnboardingProvider>
          <ScrollToTop />
          <AppRoutes />
        </OnboardingProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
