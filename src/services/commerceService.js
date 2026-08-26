import { apiRequest } from './api';

export const commerceService = {
  // GET /api/commerce/settings
  getSettings: async () => {
    try {
      const response = await apiRequest('/commerce/settings');
      return response.data;
    } catch (error) {
      console.warn('[Commerce Service] getSettings failed:', error);
      return {
        catalogConnected: false,
        catalogId: null,
        catalogStatus: 'disconnected',
        productCount: 0,
        messageSettings: {
          title: 'Explore our Latest Products',
          body: 'Browse our complete store catalog and place orders directly on WhatsApp with free delivery.',
          cta: 'View Catalog',
          enabled: true,
        },
        campaignSettings: {
          catalogId: '',
          campaignName: 'Spring Launch Collection',
          enabled: true,
        },
        autoReplySettings: {
          keywords: ['catalog', 'products', 'price', 'menu', 'store', 'buy'],
          replyText: 'Here is our product catalogue! Tap below to view items and place your order.',
          enabled: true,
        },
        autocheckoutSettings: {
          enabled: true,
          paymentMode: 'cod_and_upi',
          orderConfirmationMsg: 'Thank you for your order! Our team will process and ship your items shortly.',
        },
      };
    }
  },

  // POST /api/commerce/catalog/connect
  connectCatalog: async (catalogId, catalogName) => {
    const response = await apiRequest('/commerce/catalog/connect', {
      method: 'POST',
      body: JSON.stringify({ catalogId, catalogName }),
    });
    return response.data;
  },

  // POST /api/commerce/catalog/disconnect
  disconnectCatalog: async () => {
    const response = await apiRequest('/commerce/catalog/disconnect', {
      method: 'POST',
    });
    return response.data;
  },

  // POST /api/commerce/catalog/upload-csv
  uploadCsv: async (csvContent) => {
    const response = await apiRequest('/commerce/catalog/upload-csv', {
      method: 'POST',
      body: JSON.stringify({ csvContent }),
    });
    return response;
  },

  // GET /api/commerce/products
  getProducts: async () => {
    try {
      const response = await apiRequest('/commerce/products');
      return response.data || [];
    } catch (error) {
      console.warn('[Commerce Service] getProducts failed:', error);
      return [];
    }
  },

  // DELETE /api/commerce/products/:id
  deleteProduct: async (id) => {
    const response = await apiRequest(`/commerce/products/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  },

  // PUT /api/commerce/settings
  updateSettings: async (settingsData) => {
    const response = await apiRequest('/commerce/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
    return response.data;
  },

  // --- ORDER PANEL METHODS ---
  // GET /api/commerce/orders
  getOrders: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiRequest(`/commerce/orders?${queryString}`);
      return response;
    } catch (error) {
      console.warn('[Commerce Service] getOrders failed:', error);
      return { success: false, orders: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
  },

  // GET /api/commerce/orders/:orderId
  getOrderById: async (orderId) => {
    const response = await apiRequest(`/commerce/orders/${orderId}`);
    return response.data;
  },

  // PATCH /api/commerce/orders/:orderId/status
  updateOrderStatus: async (orderId, statusData) => {
    const response = await apiRequest(`/commerce/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
    return response.data;
  },

  // GET /api/commerce/orders/webhooks
  getOrderWebhookConfig: async () => {
    try {
      const response = await apiRequest('/commerce/orders/webhooks');
      return response.data;
    } catch (error) {
      console.warn('[Commerce Service] getOrderWebhookConfig failed:', error);
      return {
        webhookUrl: 'https://api.arco-crm.com/v1/webhooks/orders',
        secretKey: 'whsec_arco_live_default_key',
        events: ['order.created', 'order.confirmed', 'order.paid'],
      };
    }
  },

  // POST /api/commerce/orders/webhooks/regenerate
  regenerateOrderWebhookSecret: async () => {
    const response = await apiRequest('/commerce/orders/webhooks/regenerate', {
      method: 'POST',
    });
    return response.data;
  },
};
