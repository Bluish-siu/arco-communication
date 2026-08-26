import { apiRequest } from './api';

export const contactsService = {
  // GET /api/contacts?page=1&limit=20&search=...&segment=...&tag=...&status=...&whatsapp_opted=...
  getContacts: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== 'all' && val !== '') {
          params.append(key, val);
        }
      });
      const qs = params.toString();
      const res = await apiRequest(`/contacts${qs ? `?${qs}` : ''}`);
      return res;
    } catch (err) {
      console.warn('[Contacts Service] getContacts failed:', err);
      return { data: [], total: 0, page: 1, limit: 20, totalPages: 1, counts: {} };
    }
  },

  // GET /api/contacts/count?audienceType=...&segment=...&tag=...&status=...&whatsapp_opted=...
  getCount: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== 'all' && val !== '') {
          params.append(key, val);
        }
      });
      const res = await apiRequest(`/contacts/count?${params.toString()}`);
      return res.count || 0;
    } catch (err) {
      console.warn('[Contacts Service] getCount failed:', err);
      return 0;
    }
  },

  // POST /api/contacts
  createContact: async (contactData) => {
    const res = await apiRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
    return res.data;
  },

  // POST /api/contacts/bulk-upload
  bulkUpload: async (rows) => {
    const res = await apiRequest('/contacts/bulk-upload', {
      method: 'POST',
      body: JSON.stringify({ rows }),
    });
    return res;
  },

  // PUT /api/contacts/:id
  updateContact: async (id, data) => {
    const res = await apiRequest(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  // DELETE /api/contacts/:id
  deleteContact: async (id) => {
    const res = await apiRequest(`/contacts/${id}`, { method: 'DELETE' });
    return res.success;
  },

  // POST /api/contacts/bulk-delete
  bulkDelete: async (ids) => {
    const res = await apiRequest('/contacts/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
    return res;
  },

  // POST /api/contacts/bulk-tag
  bulkTag: async (ids, tags) => {
    const tagsArr = Array.isArray(tags) ? tags : [tags];
    const res = await apiRequest('/contacts/bulk-tag', {
      method: 'POST',
      body: JSON.stringify({ ids, tags: tagsArr, tag: tagsArr[0] }),
    });
    return res;
  },
};
