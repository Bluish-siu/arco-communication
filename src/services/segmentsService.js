import { apiRequest } from './api';

export const segmentsService = {
  // GET /api/segments
  getSegments: async () => {
    try {
      const res = await apiRequest('/segments');
      return res.data || [];
    } catch (err) {
      console.warn('[Segments Service] getSegments failed:', err);
      return [];
    }
  },

  // GET /api/segments/metadata
  getMetadata: async () => {
    try {
      const res = await apiRequest('/segments/metadata');
      return res.data || { tags: [], fields: [], events: [] };
    } catch (err) {
      console.warn('[Segments Service] getMetadata failed:', err);
      return { tags: [], fields: [], events: [] };
    }
  },

  // GET /api/segments/:id
  getSegment: async (id) => {
    const res = await apiRequest(`/segments/${id}`);
    return res.data;
  },

  // POST /api/segments
  createSegment: async (segmentData) => {
    const res = await apiRequest('/segments', {
      method: 'POST',
      body: JSON.stringify(segmentData),
    });
    return res.data;
  },

  // PUT /api/segments/:id
  updateSegment: async (id, segmentData) => {
    const res = await apiRequest(`/segments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(segmentData),
    });
    return res.data;
  },

  // DELETE /api/segments/:id
  deleteSegment: async (id) => {
    const res = await apiRequest(`/segments/${id}`, { method: 'DELETE' });
    return res.success;
  },
};
