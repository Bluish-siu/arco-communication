import { apiRequest } from './api';

export const inboxService = {
  getConversations: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '' && val !== 'all') {
          if (Array.isArray(val)) {
            if (val.length > 0) params.append(key, val.join(','));
          } else {
            params.append(key, val);
          }
        }
      });
      const qs = params.toString();
      const res = await apiRequest(`/inbox/conversations${qs ? `?${qs}` : ''}`);
      return res.data || [];
    } catch {
      return null;
    }
  },

  createConversation: async (conversationData) => {
    try {
      const res = await apiRequest('/inbox/conversations', {
        method: 'POST',
        body: JSON.stringify(conversationData),
      });
      return res.data;
    } catch {
      return null;
    }
  },

  sendMessage: async (conversationId, text, sender = 'me') => {
    try {
      const res = await apiRequest(`/inbox/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text, sender }),
      });
      return res.data;
    } catch {
      return null;
    }
  },

  markAsRead: async (conversationId) => {
    try {
      const res = await apiRequest(`/inbox/conversations/${conversationId}/read`, {
        method: 'PUT',
      });
      return res.data;
    } catch {
      return null;
    }
  },

  getConversation: async (conversationId) => {
    try {
      const res = await apiRequest(`/inbox/conversations/${conversationId}`);
      return res.data;
    } catch {
      return null;
    }
  },

  updateConversation: async (conversationId, updateData) => {
    try {
      const res = await apiRequest(`/inbox/conversations/${conversationId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      return res.data;
    } catch {
      return null;
    }
  },
};
