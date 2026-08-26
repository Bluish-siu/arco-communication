import { apiRequest } from './api';

export const crmService = {
  // GET /api/crm/pipeline?search=...&owner=...&tag=...&segment=...&dateRange=...&sortBy=...&sortOrder=...
  getPipeline: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.search) query.append('search', params.search);
      if (params.owner && params.owner !== 'all' && params.owner !== 'All Users') query.append('owner', params.owner);
      if (params.tag && params.tag !== 'all') query.append('tag', params.tag);
      if (params.tags && Array.isArray(params.tags) && params.tags.length > 0) {
        params.tags.forEach((t) => query.append('tags', t));
      }
      if (params.segment && params.segment !== 'all') query.append('segment', params.segment);
      if (params.source && params.source !== 'all') query.append('source', params.source);
      if (params.whatsapp_opted !== undefined && params.whatsapp_opted !== 'all' && params.whatsapp_opted !== '') {
        query.append('whatsapp_opted', params.whatsapp_opted);
      }
      if (params.dateRange && params.dateRange !== 'all') query.append('dateRange', params.dateRange);
      if (params.sortBy) query.append('sortBy', params.sortBy);
      if (params.sortOrder) query.append('sortOrder', params.sortOrder);
      if (params.conditions && params.conditions.length > 0) {
        query.append('conditions', JSON.stringify(params.conditions));
      }
      if (params.logic) query.append('logic', params.logic);

      const qs = query.toString();
      const response = await apiRequest(`/crm/pipeline${qs ? `?${qs}` : ''}`);
      return response.data;
    } catch (error) {
      console.warn('[CRM Service] getPipeline failed, falling back to local structure:', error);
      return {
        stages: {
          newLead: [],
          qualification: [],
          needsAnalysis: [],
          proposal: [],
          negotiation: [],
          closedWon: [],
          closedLost: [],
        },
        summary: {
          totalLeads: 0,
          newLeadCount: 0,
          qualificationCount: 0,
          needsAnalysisCount: 0,
          proposalCount: 0,
          negotiationCount: 0,
          closedWonCount: 0,
          closedLostCount: 0,
          totalPipelineValue: 0,
          wonValue: 0,
          conversionRate: '0%',
        },
      };
    }
  },

  // PUT /api/crm/leads/:id/status
  updateLeadStatus: async (leadId, payload) => {
    const body = typeof payload === 'string' ? { status: payload } : payload;
    const response = await apiRequest(`/crm/leads/${leadId}/status`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return response.data;
  },

  // GET /api/crm/reports?dateRange=...&owner=...&stage=...&tag=...&whatsapp_opted=...
  getReports: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.dateRange) query.append('dateRange', params.dateRange);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.owner && params.owner !== 'All Users' && params.owner !== 'all') query.append('owner', params.owner);
    if (params.stage && params.stage !== 'All Stages' && params.stage !== 'all') query.append('stage', params.stage);
    if (params.tag && params.tag !== 'All Tags' && params.tag !== 'all') query.append('tag', params.tag);
    if (params.tags && Array.isArray(params.tags) && params.tags.length > 0) {
      params.tags.forEach((t) => query.append('tags', t));
    }
    if (params.source && params.source !== 'All Sources' && params.source !== 'all') query.append('source', params.source);
    if (params.whatsapp_opted !== undefined && params.whatsapp_opted !== 'all' && params.whatsapp_opted !== '') {
      query.append('whatsapp_opted', params.whatsapp_opted);
    }

    const qs = query.toString();
    const response = await apiRequest(`/crm/reports${qs ? `?${qs}` : ''}`);
    return response.data;
  },

  // POST /api/contacts (Create Lead in CRM)
  createLead: async (leadData) => {
    const response = await apiRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
    return response.data;
  },

  // PUT /api/contacts/:id
  updateLead: async (leadId, leadData) => {
    const response = await apiRequest(`/contacts/${leadId}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    });
    return response.data;
  },

  // DELETE /api/contacts/:id
  deleteLead: async (leadId) => {
    const response = await apiRequest(`/contacts/${leadId}`, {
      method: 'DELETE',
    });
    return response;
  },
};
