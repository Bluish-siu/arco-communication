import { apiRequest } from './api';

export const templateService = {
  // GET /api/templates/library
  getLibraryTemplates: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const res = await apiRequest(`/templates/library?${queryString}`);
      return res;
    } catch (err) {
      console.warn('[Template Service] getLibraryTemplates failed:', err);
      return { success: false, categories: [], data: {}, total: 0 };
    }
  },

  // GET /api/templates (Active user templates)
  getActiveTemplates: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const res = await apiRequest(`/templates?${queryString}`);
      return res;
    } catch (err) {
      console.warn('[Template Service] getActiveTemplates failed:', err);
      return { success: false, templates: [], total: 0 };
    }
  },

  // GET /api/templates/deleted (Soft deleted templates)
  getDeletedTemplates: async () => {
    try {
      const res = await apiRequest('/templates/deleted');
      return res;
    } catch (err) {
      console.warn('[Template Service] getDeletedTemplates failed:', err);
      return { success: false, templates: [], total: 0 };
    }
  },

  // GET /api/templates/:id
  getTemplate: async (id) => {
    const res = await apiRequest(`/templates/${id}`);
    return res.data;
  },

  // POST /api/templates
  createTemplate: async (data) => {
    const res = await apiRequest('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  // PUT /api/templates/:id
  updateTemplate: async (id, data) => {
    const res = await apiRequest(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  // DELETE /api/templates/:id (Soft delete)
  deleteTemplate: async (id) => {
    const res = await apiRequest(`/templates/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  // DELETE /api/templates/:id/permanent
  deletePermanent: async (id) => {
    const res = await apiRequest(`/templates/${id}/permanent`, {
      method: 'DELETE',
    });
    return res;
  },

  // POST /api/templates/:id/restore
  restoreTemplate: async (id) => {
    const res = await apiRequest(`/templates/${id}/restore`, {
      method: 'POST',
    });
    return res.data;
  },

  // POST /api/templates/:id/duplicate
  duplicateTemplate: async (id) => {
    const res = await apiRequest(`/templates/${id}/duplicate`, {
      method: 'POST',
    });
    return res.data;
  },

  // POST /api/templates/:id/submit
  submitTemplate: async (id) => {
    const res = await apiRequest(`/templates/${id}/submit`, {
      method: 'POST',
    });
    return res.data;
  },

  // POST /api/templates/:id/test
  testTemplate: async (id, payload) => {
    const res = await apiRequest(`/templates/${id}/test`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res;
  },
};
