import { apiRequest } from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.data?.token) {
        localStorage.setItem('arco_auth_token', res.data.token);
      }
      return res.data;
    } catch {
      return null;
    }
  },

  loginWithPhone: async (idToken) => {
    const res = await apiRequest('/auth/phone', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
    if (res.data?.token) {
      localStorage.setItem('arco_auth_token', res.data.token);
    }
    return res.data;
  },

  getCurrentUser: async () => {
    try {
      const res = await apiRequest('/auth/me');
      return res.data;
    } catch {
      return null;
    }
  },

  saveOnboarding: async (onboardingData) => {
    try {
      const res = await apiRequest('/auth/onboarding', {
        method: 'POST',
        body: JSON.stringify(onboardingData),
      });
      return res.data;
    } catch {
      return null;
    }
  },

  // Google OAuth 2.0 Helpers
  getGoogleAuthUrl: async () => {
    try {
      const res = await apiRequest('/auth/google/url');
      return res.data;
    } catch (err) {
      console.warn('[authService] getGoogleAuthUrl failed:', err);
      return null;
    }
  },

  handleGoogleCallback: async (code, state) => {
    const res = await apiRequest('/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
    if (res.data?.token) {
      localStorage.setItem('arco_auth_token', res.data.token);
    }
    return res.data;
  },
};
