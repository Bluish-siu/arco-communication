import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const OnboardingContext = createContext(null);

const STORAGE_KEY = 'arco_onboarding_data';

const initialData = {
  user: {
    id: '',
    email: '',
    name: '',
    isAuthenticated: false,
  },
  subscription: {
    planName: 'Trial Plan',
    status: 'trial',
    trialDaysRemaining: 6,
    totalTrialDays: 14,
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  businessSetup: {
    channel: 'Both',
    phone: '',
    companyName: '',
    companyWebsite: '',
    companyLocation: '',
    annualRevenue: '₹10L - ₹50L',
    hasShopify: 'Yes',
    whatsappUpdates: true,
  },
  industryData: {
    industry: '',
    subCategory: '',
  },
  objectives: [],
  integrations: [],
  configuration: {
    hasFacebookBM: null,
    hasUsedWhatsAppAPI: null,
  },
  isCompleted: false,
};

export function getNextOnboardingRoute(userData, onboardingState) {
  // If user is already marked as completed in DB or state
  if (userData?.onboardingCompleted || userData?.onboarding_completed || onboardingState?.isCompleted) {
    return '/dashboard';
  }

  const business = userData?.business_setup || onboardingState?.businessSetup;
  if (!business?.companyName || !business?.phone || !business?.companyLocation) {
    return '/onboarding';
  }

  const industry = userData?.industry_data || onboardingState?.industryData;
  if (!industry?.industry || !industry?.subCategory) {
    return '/onboarding/industry';
  }

  const objectives = userData?.objectives || onboardingState?.objectives;
  if (!objectives || objectives.length === 0) {
    return '/onboarding/objectives';
  }

  const integrations = userData?.integrations || onboardingState?.integrations;
  if (!integrations || integrations.length === 0) {
    return '/onboarding/integrations';
  }

  const config = userData?.configuration || onboardingState?.configuration;
  if (!config || config.hasFacebookBM === null || config.hasFacebookBM === undefined) {
    return '/onboarding/configuration';
  }

  return '/dashboard';
}

export function OnboardingProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...initialData,
          ...parsed,
          user: { ...initialData.user, ...(parsed.user || {}) },
          subscription: { ...initialData.subscription, ...(parsed.subscription || {}) },
          businessSetup: { ...initialData.businessSetup, ...(parsed.businessSetup || {}) },
          industryData: { ...initialData.industryData, ...(parsed.industryData || {}) },
        };
      }
    } catch (e) {
      console.error('Failed to load onboarding state:', e);
    }
    return initialData;
  });

  // Hydrate authoritative user and onboarding state from PostgreSQL on mount
  useEffect(() => {
    async function loadServerUser() {
      const token = localStorage.getItem('arco_auth_token');
      if (token) {
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            setData((prev) => ({
              ...prev,
              user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                name: user.name || user.email?.split('@')[0] || (user.phone ? `User ${user.phone.slice(-4)}` : 'Business Owner'),
                isAuthenticated: true,
              },
              isCompleted: !!user.onboardingCompleted,
              businessSetup: user.business_setup || prev.businessSetup,
              industryData: user.industry_data || prev.industryData,
              objectives: user.objectives || prev.objectives,
              integrations: user.integrations || prev.integrations,
              configuration: user.configuration || prev.configuration,
            }));
          }
        } catch (err) {
          console.warn('[OnboardingContext] Server user hydration skipped:', err.message);
        }
      }
    }
    loadServerUser();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save onboarding state:', e);
    }
  }, [data]);

  const login = async (email, password) => {
    // Sync with backend
    const authResult = await authService.login(email, password);
    const userObj = authResult?.user || {
      email,
      name: email.split('@')[0] || 'Business Owner',
      onboardingCompleted: false,
    };

    setData((prev) => ({
      ...prev,
      user: {
        id: userObj.id,
        email: userObj.email,
        name: userObj.name || email.split('@')[0] || 'Business Owner',
        isAuthenticated: true,
      },
      isCompleted: !!userObj.onboardingCompleted,
      ...(userObj.business_setup ? { businessSetup: userObj.business_setup } : {}),
      ...(userObj.industry_data ? { industryData: userObj.industry_data } : {}),
      ...(userObj.objectives ? { objectives: userObj.objectives } : {}),
      ...(userObj.integrations ? { integrations: userObj.integrations } : {}),
      ...(userObj.configuration ? { configuration: userObj.configuration } : {}),
    }));

    return authResult;
  };

  const setAuthenticatedUser = (userData, token) => {
    if (token) {
      try {
        localStorage.setItem('arco_auth_token', token);
      } catch (e) {
        console.error('Failed to store auth token:', e);
      }
    }
    const isComp = !!(userData?.onboardingCompleted || userData?.onboarding_completed);
    setData((prev) => ({
      ...prev,
      user: {
        id: userData.id,
        email: userData.email,
        phone: userData.phone,
        name: userData.name || userData.email?.split('@')[0] || (userData.phone ? `User ${userData.phone.slice(-4)}` : 'Business Owner'),
        isAuthenticated: true,
      },
      isCompleted: isComp,
      ...(userData.business_setup ? { businessSetup: userData.business_setup } : {}),
      ...(userData.industry_data ? { industryData: userData.industry_data } : {}),
      ...(userData.objectives ? { objectives: userData.objectives } : {}),
      ...(userData.integrations ? { integrations: userData.integrations } : {}),
      ...(userData.configuration ? { configuration: userData.configuration } : {}),
    }));
  };

  const logout = () => {
    setData(initialData);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('arco_auth_token');
    } catch (e) {
      console.error('Failed to clear onboarding state:', e);
    }
  };

  const updateBusinessSetup = (setup) => {
    setData((prev) => ({
      ...prev,
      businessSetup: { ...prev.businessSetup, ...setup },
      user: {
        ...prev.user,
        name: setup.companyName || prev.user.name,
      },
    }));
  };

  const updateIndustry = (industryData) => {
    setData((prev) => ({
      ...prev,
      industryData: { ...prev.industryData, ...industryData },
    }));
  };

  const updateObjectives = (objectives) => {
    setData((prev) => ({
      ...prev,
      objectives,
    }));
  };

  const updateIntegrations = (integrations) => {
    setData((prev) => ({
      ...prev,
      integrations,
    }));
  };

  const updateConfiguration = (configuration) => {
    setData((prev) => ({
      ...prev,
      configuration: { ...prev.configuration, ...configuration },
    }));
  };

  const completeOnboarding = async (finalOverrides = {}) => {
    const updatedData = {
      ...data,
      ...finalOverrides,
      isCompleted: true,
    };
    setData(updatedData);

    // Sync authoritative complete state with backend PostgreSQL database
    try {
      await authService.saveOnboarding({
        businessSetup: updatedData.businessSetup,
        industryData: updatedData.industryData,
        objectives: updatedData.objectives,
        integrations: updatedData.integrations,
        configuration: updatedData.configuration,
        isCompleted: true,
      });
    } catch (err) {
      console.error('[OnboardingContext] Failed to save onboarding completion to server:', err);
    }
  };

  const resetOnboarding = () => {
    setData(initialData);
  };

  const updateSubscription = (subscriptionData) => {
    setData((prev) => ({
      ...prev,
      subscription: { ...(prev.subscription || initialData.subscription), ...subscriptionData },
    }));
  };

  const currentSubscription = data?.subscription || initialData.subscription;
  const trialDaysRemaining = currentSubscription?.trialDaysRemaining ?? 6;

  return (
    <OnboardingContext.Provider
      value={{
        ...data,
        subscription: currentSubscription,
        trialDaysRemaining,
        updateSubscription,
        login,
        setAuthenticatedUser,
        logout,
        updateBusinessSetup,
        updateIndustry,
        updateObjectives,
        updateIntegrations,
        updateConfiguration,
        completeOnboarding,
        resetOnboarding,
        getNextOnboardingRoute,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
