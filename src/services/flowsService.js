import { apiRequest } from './api';

export const flowsService = {
  /**
   * Fetch all WhatsApp Flows for the current tenant.
   * Auto-syncs with live Meta WABA flows.
   */
  getFlows: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.search) query.append('search', params.search);
      if (params.status && params.status !== 'all') query.append('status', params.status);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await apiRequest(`/whatsapp/flows${qs}`);
      return res?.data || [];
    } catch (err) {
      console.warn('[flowsService] getFlows failed:', err.message);
      throw err;
    }
  },

  /**
   * Fetch details for a specific Flow (including validation errors, JSON version, assets).
   */
  getFlow: async (flowId) => {
    try {
      const res = await apiRequest(`/whatsapp/flows/${flowId}`);
      return res?.data || null;
    } catch (err) {
      console.warn(`[flowsService] getFlow(${flowId}) failed:`, err.message);
      throw err;
    }
  },

  /**
   * Create a new Flow on Meta WABA and sync locally.
   */
  createFlow: async ({ name, category }) => {
    try {
      const res = await apiRequest('/whatsapp/flows', {
        method: 'POST',
        body: JSON.stringify({ name, category }),
      });
      return res?.data || res;
    } catch (err) {
      console.warn('[flowsService] createFlow failed:', err.message);
      throw err;
    }
  },

  /**
   * Send a live test interactive Flow to a WhatsApp phone number.
   */
  sendTestFlow: async ({ flowId, recipientPhone, ctaText = 'Give Feedback', screen, data, flowToken }) => {
    try {
      const res = await apiRequest('/whatsapp/send-flow', {
        method: 'POST',
        body: JSON.stringify({
          flowId,
          recipientPhone,
          ctaText,
          screen,
          data,
          flowToken,
        }),
      });
      return res?.data || res;
    } catch (err) {
      console.warn('[flowsService] sendTestFlow failed:', err.message);
      throw err;
    }
  },

  /**
   * Create and queue a bulk Flow broadcast with CSV audience and scheduling.
   */
  createFlowBroadcast: async (broadcastPayload) => {
    try {
      const res = await apiRequest('/whatsapp/send-flow-bulk', {
        method: 'POST',
        body: JSON.stringify(broadcastPayload),
      });
      return res?.data || res;
    } catch (err) {
      console.warn('[flowsService] createFlowBroadcast failed:', err.message);
      throw err;
    }
  },

  /**
   * Get list of all Flow broadcasts for this tenant.
   */
  getFlowBroadcasts: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const qs = query ? `?${query}` : '';
      const res = await apiRequest(`/whatsapp/flow-broadcasts${qs}`);
      return res?.data || [];
    } catch (err) {
      console.warn('[flowsService] getFlowBroadcasts failed:', err.message);
      return [];
    }
  },

  /**
   * Get details and delivery statistics for a specific Flow broadcast.
   */
  getFlowBroadcast: async (id) => {
    try {
      const res = await apiRequest(`/whatsapp/flow-broadcasts/${id}`);
      return res?.data || null;
    } catch (err) {
      console.warn(`[flowsService] getFlowBroadcast(${id}) failed:`, err.message);
      throw err;
    }
  },

  /**
   * Get paginated recipient logs for a Flow broadcast.
   */
  getFlowBroadcastRecipients: async (id, params = {}) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== 'all' && v !== '') {
          query.append(k, v);
        }
      });
      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await apiRequest(`/whatsapp/flow-broadcasts/${id}/recipients${qs}`);
      return res || { data: [], total: 0, page: 1, totalPages: 1 };
    } catch (err) {
      console.warn(`[flowsService] getFlowBroadcastRecipients(${id}) failed:`, err.message);
      return { data: [], total: 0, page: 1, totalPages: 1 };
    }
  },

  /**
   * Trigger immediate sending for a scheduled or draft Flow broadcast.
   */
  sendFlowBroadcastNow: async (id) => {
    try {
      const res = await apiRequest(`/campaigns/${id}/send-now`, {
        method: 'POST',
      });
      return res;
    } catch (err) {
      console.warn(`[flowsService] sendFlowBroadcastNow(${id}) failed:`, err.message);
      throw err;
    }
  },
};
