import { apiRequest } from './api';

export const metaService = {
  getAuthUrl: async () => {
    try {
      const res = await apiRequest('/meta/auth');
      return res.data;
    } catch {
      return null;
    }
  },

  getStatus: async () => {
    try {
      const res = await apiRequest('/meta/status');
      return res.data || { connected: false };
    } catch {
      return { connected: false };
    }
  },

  uploadGstCertificate: async ({ fileName, fileType, fileData, fileSize }) => {
    return apiRequest('/meta/upload-gst', {
      method: 'POST',
      body: JSON.stringify({ fileName, fileType, fileData, fileSize }),
    });
  },

  getBusinesses: async () => {
    try {
      const res = await apiRequest('/meta/businesses');
      return res.data || [];
    } catch {
      return [];
    }
  },

  getWabas: async (businessId) => {
    try {
      const query = businessId ? `?businessId=${encodeURIComponent(businessId)}` : '';
      const res = await apiRequest(`/meta/wabas${query}`);
      return res.data || [];
    } catch {
      return [];
    }
  },

  getPhoneNumbers: async (wabaId) => {
    try {
      const query = wabaId ? `?wabaId=${encodeURIComponent(wabaId)}` : '';
      const res = await apiRequest(`/meta/phone-numbers${query}`);
      return res.data || [];
    } catch {
      return [];
    }
  },

  connect: async (connectionData) => {
    try {
      const res = await apiRequest('/meta/connect', {
        method: 'POST',
        body: JSON.stringify(connectionData),
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  disconnect: async () => {
    try {
      const res = await apiRequest('/meta/disconnect', {
        method: 'POST',
      });
      return res.success;
    } catch {
      return false;
    }
  },
};
