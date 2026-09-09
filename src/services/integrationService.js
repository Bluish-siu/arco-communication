import { apiRequest } from './api';
import { isShopifyEmbedded, getShopifyIdToken } from '../utils/shopifyAppBridge';

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

  // GET /api/integrations/shopify/session (App Bridge ID Token Authenticated)
  getShopifySession: async (idToken) => {
    const token = idToken || (await getShopifyIdToken());
    if (!token) throw new Error('Shopify session token not available');
    const res = await apiRequest('/integrations/shopify/session', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  // GET /api/integrations/shopify/status
  getShopifyStatus: async () => {
    try {
      // If running inside Shopify Admin iframe, authenticate with App Bridge Session Token
      if (isShopifyEmbedded()) {
        try {
          const idToken = await getShopifyIdToken();
          if (idToken) {
            const sessionData = await integrationService.getShopifySession(idToken);
            if (sessionData) return sessionData;
          } else {
            console.warn('[Integration Service] App Bridge ID token returned null in embedded frame');
          }
        } catch (embeddedErr) {
          console.warn('[Integration Service] Embedded session check error:', embeddedErr.message);
          return {
            connected: false,
            status: 'error',
            error: embeddedErr.message || 'Failed to initialize Shopify embedded session',
            shopDomain: new URLSearchParams(window.location.search).get('shop') || null,
          };
        }
      }

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
