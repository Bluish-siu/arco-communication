import { apiRequest } from './api';

export const analyticsService = {
  // GET /api/analytics/overview
  getConversationOverview: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.event && filters.event !== 'all') params.append('event', filters.event);
      if (filters.tags && filters.tags.length > 0) params.append('tags', Array.isArray(filters.tags) ? filters.tags.join(',') : filters.tags);

      const qs = params.toString();
      const res = await apiRequest(`/analytics/overview${qs ? `?${qs}` : ''}`);
      return res.data || null;
    } catch (err) {
      console.warn('[Analytics Service] getConversationOverview failed:', err);
      return null;
    }
  },

  // GET /api/analytics/agent-performance
  getAgentPerformance: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const qs = params.toString();
      const res = await apiRequest(`/analytics/agent-performance${qs ? `?${qs}` : ''}`);
      return res.data || null;
    } catch (err) {
      console.warn('[Analytics Service] getAgentPerformance failed:', err);
      return null;
    }
  },

  // GET /api/analytics/export
  exportAnalytics: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.dateRange) params.append('dateRange', filters.dateRange);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.event) params.append('event', filters.event);
    if (filters.tags) params.append('tags', Array.isArray(filters.tags) ? filters.tags.join(',') : filters.tags);

    const qs = params.toString();
    const res = await apiRequest(`/analytics/export${qs ? `?${qs}` : ''}`);
    return res;
  },
};
