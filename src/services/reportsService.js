import { apiRequest } from './api';

export const reportsService = {
  // GET /api/analytics/campaign-reports/campaigns
  getCampaignsForReports: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.campaignType && filters.campaignType !== 'all') params.append('campaignType', filters.campaignType);
      
      const qs = params.toString();
      const res = await apiRequest(`/analytics/campaign-reports/campaigns${qs ? `?${qs}` : ''}`);
      return res.data || [];
    } catch (err) {
      console.warn('[Reports Service] getCampaignsForReports failed:', err);
      return [];
    }
  },

  // POST /api/analytics/campaign-reports/generate
  generateReport: async (payload) => {
    const res = await apiRequest('/analytics/campaign-reports/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res;
  },
};
