import { apiRequest } from './api';

export const campaignsService = {
  // GET /api/campaigns?type=...&channel=...&status=...&category=...&creator=...&search=...
  getCampaigns: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== 'all' && val !== '') {
          params.append(key, val);
        }
      });
      const qs = params.toString();
      const res = await apiRequest(`/campaigns${qs ? `?${qs}` : ''}`);
      return res.data || [];
    } catch (err) {
      console.warn('[Campaigns Service] getCampaigns failed:', err);
      return [];
    }
  },

  // GET /api/campaigns/:id
  getCampaign: async (id) => {
    const res = await apiRequest(`/campaigns/${id}`);
    return res.data;
  },

  // POST /api/campaigns/send-test
  sendTestMessage: async (testPayload) => {
    const res = await apiRequest('/campaigns/send-test', {
      method: 'POST',
      body: JSON.stringify(testPayload),
    });
    return res;
  },

  // POST /api/campaigns
  createCampaign: async (campaignData) => {
    const res = await apiRequest('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
    return res.data;
  },

  // PUT /api/campaigns/:id
  updateCampaign: async (id, campaignData) => {
    const res = await apiRequest(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(campaignData),
    });
    return res.data;
  },

  // PUT /api/campaigns/:id/status
  updateStatus: async (id, status) => {
    const res = await apiRequest(`/campaigns/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  // DELETE /api/campaigns/:id
  deleteCampaign: async (id) => {
    const res = await apiRequest(`/campaigns/${id}`, {
      method: 'DELETE',
    });
    return res;
  },

  // GET /api/campaigns/:id/recipients?page=1&limit=20&status=...&search=...
  getRecipients: async (id, params = {}) => {
    try {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== 'all' && v !== '') {
          qs.append(k, v);
        }
      });
      const res = await apiRequest(`/campaigns/${id}/recipients?${qs.toString()}`);
      return res;
    } catch (err) {
      console.warn('[Campaigns Service] getRecipients failed:', err);
      return { data: [], total: 0, totalPages: 1, page: 1, statusCounts: {} };
    }
  },

  // POST /api/campaigns/:id/process-batch
  processBatch: async (id, batchSize = 10) => {
    const res = await apiRequest(`/campaigns/${id}/process-batch`, {
      method: 'POST',
      body: JSON.stringify({ batchSize }),
    });
    return res;
  },

  // POST /api/campaigns/:id/send-now (Real Meta WhatsApp Live Sending)
  sendNow: async (id) => {
    const res = await apiRequest(`/campaigns/${id}/send-now`, {
      method: 'POST',
    });
    return res;
  },

  // POST /api/campaigns/:id/retry-failed (Retry failed recipients)
  retryFailed: async (id) => {
    const res = await apiRequest(`/campaigns/${id}/retry-failed`, {
      method: 'POST',
    });
    return res;
  },

  // GET /api/campaigns/audiences?audienceType=...&segment=...&tag=...&status=...
  getAudiences: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await apiRequest(`/campaigns/audiences${query ? `?${query}` : ''}`);
      return res.data;
    } catch {
      return { recipientCount: 0, segments: [], tags: [], statuses: [] };
    }
  },

  // GET /api/campaign-templates?isSample=...&category=...&search=...
  getTemplates: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await apiRequest(`/campaign-templates${query ? `?${query}` : ''}`);
      return res.data || [];
    } catch {
      return [];
    }
  },

  // GET /api/campaign-templates/:id
  getTemplate: async (id) => {
    const res = await apiRequest(`/campaign-templates/${id}`);
    return res.data;
  },

  // GET /api/campaigns/meta-templates (Real approved WhatsApp templates from connected Meta WABA)
  getMetaTemplates: async () => {
    try {
      const res = await apiRequest('/campaigns/meta-templates');
      return res;
    } catch (err) {
      console.warn('[Campaigns Service] getMetaTemplates failed:', err);
      return { success: false, data: [], approved: [], error: err.message };
    }
  },

  // GET /api/campaigns/message-status/:wamid
  getMessageStatus: async (wamid) => {
    try {
      const res = await apiRequest(`/campaigns/message-status/${wamid}`);
      return res;
    } catch (err) {
      console.warn('[Campaigns Service] getMessageStatus failed:', err);
      return { success: false, error: err.message };
    }
  },

  // POST /api/campaigns/:id/retarget (1-Click Retargeting by Cohort)
  retargetCampaign: async (id, retargetPayload) => {
    const res = await apiRequest(`/campaigns/${id}/retarget`, {
      method: 'POST',
      body: JSON.stringify(retargetPayload),
    });
    return res;
  },

  // GET /api/campaigns/drip-sequences
  getDripSequences: async () => {
    try {
      const res = await apiRequest('/campaigns/drip-sequences');
      return res.data || [];
    } catch (err) {
      console.warn('[Campaigns Service] getDripSequences failed:', err);
      return [];
    }
  },

  // GET /api/campaigns/drip-sequences/:id
  getDripSequence: async (id) => {
    const res = await apiRequest(`/campaigns/drip-sequences/${id}`);
    return res.data;
  },

  // POST /api/campaigns/drip-sequences
  createDripSequence: async (sequenceData) => {
    const res = await apiRequest('/campaigns/drip-sequences', {
      method: 'POST',
      body: JSON.stringify(sequenceData),
    });
    return res;
  },

  // PUT /api/campaigns/drip-sequences/:id
  updateDripSequence: async (id, sequenceData) => {
    const res = await apiRequest(`/campaigns/drip-sequences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sequenceData),
    });
    return res;
  },

  // PATCH /api/campaigns/drip-sequences/:id/status
  updateDripSequenceStatus: async (id, status) => {
    const res = await apiRequest(`/campaigns/drip-sequences/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res;
  },

  // DELETE /api/campaigns/drip-sequences/:id
  deleteDripSequence: async (id) => {
    const res = await apiRequest(`/campaigns/drip-sequences/${id}`, {
      method: 'DELETE',
    });
    return res;
  },
};
