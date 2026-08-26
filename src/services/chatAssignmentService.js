import { apiRequest } from './api';

export const chatAssignmentService = {
  // GET /api/chat-assignment/settings
  getSettings: async () => {
    try {
      const res = await apiRequest('/chat-assignment/settings');
      return res.data || { defaultRule: 'round_robin', assignOnlyOnline: true, reassignOffline: false };
    } catch (err) {
      console.warn('[ChatAssignment Service] getSettings failed:', err);
      return { defaultRule: 'round_robin', assignOnlyOnline: true, reassignOffline: false };
    }
  },

  // PUT /api/chat-assignment/settings
  updateSettings: async (settings) => {
    const res = await apiRequest('/chat-assignment/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return res;
  },

  // GET /api/chat-assignment/rules
  getRules: async () => {
    try {
      const res = await apiRequest('/chat-assignment/rules');
      return res.data || [];
    } catch (err) {
      console.warn('[ChatAssignment Service] getRules failed:', err);
      return [];
    }
  },

  // POST /api/chat-assignment/rules
  createRule: async (ruleData) => {
    const res = await apiRequest('/chat-assignment/rules', {
      method: 'POST',
      body: JSON.stringify(ruleData),
    });
    return res;
  },

  // PUT /api/chat-assignment/rules/:id
  updateRule: async (id, ruleData) => {
    const res = await apiRequest(`/chat-assignment/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ruleData),
    });
    return res;
  },

  // DELETE /api/chat-assignment/rules/:id
  deleteRule: async (id) => {
    const res = await apiRequest(`/chat-assignment/rules/${id}`, {
      method: 'DELETE',
    });
    return res;
  },

  // GET /api/chat-assignment/agents
  getAgents: async () => {
    try {
      const res = await apiRequest('/chat-assignment/agents');
      return res.data || [];
    } catch (err) {
      console.warn('[ChatAssignment Service] getAgents failed:', err);
      return [];
    }
  },

  // POST /api/chat-assignment/evaluate
  evaluateAssignment: async (payload) => {
    const res = await apiRequest('/chat-assignment/evaluate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res;
  },
};
