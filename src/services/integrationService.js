import { apiRequest } from './api';

export const integrationService = {
  // GET /api/integrations
  getIntegrations: async () => {
    try {
      const res = await apiRequest('/integrations');
      return res.data || [];
    } catch (err) {
      console.warn('[Integration Service] getIntegrations failed:', err.message);
      return [];
    }
  },

  // GET /api/integrations/shopify/status
  getShopifyStatus: async () => {
    try {
      const res = await apiRequest('/integrations/shopify/status');
      return res.data || { connected: false, status: 'disconnected', shopDomain: null };
    } catch (err) {
      console.warn('[Integration Service] getShopifyStatus failed:', err.message);
      return { connected: false, status: 'disconnected', shopDomain: null };
    }
  },

  // GET /api/integrations/shopify/oauth-url
  getShopifyOAuthUrl: async (shopDomain) => {
    const res = await apiRequest(`/integrations/shopify/oauth-url?shop=${encodeURIComponent(shopDomain)}`);
    return res;
  },

  // POST /api/integrations/shopify/connect
  connectShopify: async (payload) => {
    const res = await apiRequest('/integrations/shopify/connect', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res;
  },

  // POST /api/integrations/shopify/disconnect
  disconnectShopify: async () => {
    const res = await apiRequest('/integrations/shopify/disconnect', {
      method: 'POST',
    });
    return res;
  },
};
