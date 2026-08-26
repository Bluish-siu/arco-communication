import { apiRequest } from './api';

export const checkoutBotService = {
  // GET /api/checkout-bot
  getWorkflow: async () => {
    try {
      const res = await apiRequest('/checkout-bot');
      return res.data;
    } catch (err) {
      console.warn('[CheckoutBot Service] getWorkflow failed:', err);
      return null;
    }
  },

  // GET /api/checkout-bot/status
  getStatus: async () => {
    try {
      const res = await apiRequest('/checkout-bot/status');
      return res.data;
    } catch (err) {
      console.warn('[CheckoutBot Service] getStatus failed:', err);
      return {
        catalogConnected: false,
        workflowStatus: 'draft',
        isLive: false,
        remainingSteps: 3,
        totalSteps: 3,
        stats: { totalSessions: 0, completedOrders: 0, totalRevenue: 0 },
      };
    }
  },

  // PUT /api/checkout-bot
  updateWorkflow: async (workflowData) => {
    const res = await apiRequest('/checkout-bot', {
      method: 'PUT',
      body: JSON.stringify(workflowData),
    });
    return res.data;
  },

  // POST /api/checkout-bot/publish
  publishWorkflow: async () => {
    const res = await apiRequest('/checkout-bot/publish', {
      method: 'POST',
    });
    return res.data;
  },

  // POST /api/checkout-bot/unpublish
  unpublishWorkflow: async () => {
    const res = await apiRequest('/checkout-bot/unpublish', {
      method: 'POST',
    });
    return res.data;
  },

  // POST /api/checkout-bot/test
  testWorkflow: async (testPayload) => {
    const res = await apiRequest('/checkout-bot/test', {
      method: 'POST',
      body: JSON.stringify(testPayload),
    });
    return res.data;
  },

  // GET /api/checkout-bot/sessions
  getSessions: async () => {
    try {
      const res = await apiRequest('/checkout-bot/sessions');
      return res.data || [];
    } catch (err) {
      console.warn('[CheckoutBot Service] getSessions failed:', err);
      return [];
    }
  },

  // GET /api/checkout-bot/orders
  getOrders: async () => {
    try {
      const res = await apiRequest('/checkout-bot/orders');
      return res.data || [];
    } catch (err) {
      console.warn('[CheckoutBot Service] getOrders failed:', err);
      return [];
    }
  },
};
