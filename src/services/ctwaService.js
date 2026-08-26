import { apiRequest } from './api';

export const ctwaService = {
  // GET /api/meta/ctwa/status
  getCtwaStatus: async () => {
    try {
      const res = await apiRequest('/meta/ctwa/status');
      return res.data || { status: 'not_connected', onboardingStep: 'FACEBOOK_PAGE_REQUIRED' };
    } catch (err) {
      console.warn('[CTWA Service] getCtwaStatus failed:', err);
      return { status: 'not_connected', onboardingStep: 'FACEBOOK_PAGE_REQUIRED' };
    }
  },

  // GET /api/meta/ctwa/assets
  getCtwaAssets: async () => {
    try {
      const res = await apiRequest('/meta/ctwa/assets');
      return res.data || { facebookPages: [], adAccounts: [] };
    } catch (err) {
      console.warn('[CTWA Service] getCtwaAssets failed:', err);
      return { facebookPages: [], adAccounts: [] };
    }
  },

  // POST /api/meta/ctwa/page/draft
  savePageDraft: async (draftData) => {
    const res = await apiRequest('/meta/ctwa/page/draft', {
      method: 'POST',
      body: JSON.stringify(draftData),
    });
    return res;
  },

  // POST /api/meta/ctwa/page/create
  createFacebookPage: async (pageData) => {
    const res = await apiRequest('/meta/ctwa/page/create', {
      method: 'POST',
      body: JSON.stringify(pageData),
    });
    return res;
  },

  // POST /api/meta/ctwa/ad-account/connect
  connectAdAccount: async (adAccountData) => {
    const res = await apiRequest('/meta/ctwa/ad-account/connect', {
      method: 'POST',
      body: JSON.stringify(adAccountData),
    });
    return res;
  },

  // POST /api/meta/ctwa/disconnect
  disconnectCtwa: async () => {
    const res = await apiRequest('/meta/ctwa/disconnect', {
      method: 'POST',
    });
    return res;
  },
};
