import { apiRequest } from './api';

export const automationService = {
  // 1. Basic Automations (Settings / Working Hours)
  getSettings: async () => {
    return apiRequest('/automation/settings');
  },
  updateSettings: async (settingsData) => {
    return apiRequest('/automation/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  },

  // 2. Custom Auto Replies
  getCustomReplies: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/automation/custom-replies${query ? `?${query}` : ''}`);
  },
  createCustomReply: async (replyData) => {
    return apiRequest('/automation/custom-replies', {
      method: 'POST',
      body: JSON.stringify(replyData),
    });
  },
  updateCustomReply: async (id, replyData) => {
    return apiRequest(`/automation/custom-replies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(replyData),
    });
  },
  deleteCustomReply: async (id) => {
    return apiRequest(`/automation/custom-replies/${id}`, {
      method: 'DELETE',
    });
  },
  toggleCustomReply: async (id) => {
    return apiRequest(`/automation/custom-replies/${id}/toggle`, {
      method: 'PUT',
    });
  },
  duplicateCustomReply: async (id) => {
    return apiRequest(`/automation/custom-replies/${id}/duplicate`, {
      method: 'POST',
    });
  },

  // 3. Workflows
  getWorkflows: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/automation/workflows${query ? `?${query}` : ''}`);
  },
  getWorkflowById: async (id) => {
    return apiRequest(`/automation/workflows/${id}`);
  },
  createWorkflow: async (workflowData) => {
    return apiRequest('/automation/workflows', {
      method: 'POST',
      body: JSON.stringify(workflowData),
    });
  },
  updateWorkflow: async (id, workflowData) => {
    return apiRequest(`/automation/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workflowData),
    });
  },
  deleteWorkflow: async (id) => {
    return apiRequest(`/automation/workflows/${id}`, {
      method: 'DELETE',
    });
  },
  toggleWorkflow: async (id) => {
    return apiRequest(`/automation/workflows/${id}/toggle`, {
      method: 'PUT',
    });
  },
  duplicateWorkflow: async (id) => {
    return apiRequest(`/automation/workflows/${id}/duplicate`, {
      method: 'POST',
    });
  },
  testWorkflowExecution: async (id, testData) => {
    return apiRequest(`/automation/workflows/${id}/test`, {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  },

  // 4. AI Intent Matching
  getAiIntentData: async () => {
    return apiRequest('/automation/ai-intent');
  },
  updateAiIntentSettings: async (settingsData) => {
    return apiRequest('/automation/ai-intent/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  },
  createAiIntent: async (intentData) => {
    return apiRequest('/automation/ai-intent/intents', {
      method: 'POST',
      body: JSON.stringify(intentData),
    });
  },
  updateAiIntent: async (id, intentData) => {
    return apiRequest(`/automation/ai-intent/intents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(intentData),
    });
  },
  deleteAiIntent: async (id) => {
    return apiRequest(`/automation/ai-intent/intents/${id}`, {
      method: 'DELETE',
    });
  },
  testIntentMatching: async (message) => {
    return apiRequest('/automation/ai-intent/test', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // 5. WhatsApp AI Agent
  getAiAgentData: async () => {
    return apiRequest('/automation/ai-agent');
  },
  getWhatsAppAiAgentData: async () => {
    return apiRequest('/automation/ai-agent');
  },
  updateAiAgentConfig: async (configData) => {
    return apiRequest('/automation/ai-agent/config', {
      method: 'PUT',
      body: JSON.stringify(configData),
    });
  },
  saveWhatsAppAiAgentData: async (configData) => {
    return apiRequest('/automation/ai-agent/config', {
      method: 'PUT',
      body: JSON.stringify(configData),
    });
  },
  addTrainingSource: async (sourceData) => {
    return apiRequest('/automation/ai-agent/sources', {
      method: 'POST',
      body: JSON.stringify(sourceData),
    });
  },
  removeTrainingSource: async (id) => {
    return apiRequest(`/automation/ai-agent/sources/${id}`, {
      method: 'DELETE',
    });
  },
  testAiAgentChat: async (message, chatHistory = []) => {
    return apiRequest('/automation/ai-agent/chat', {
      method: 'POST',
      body: JSON.stringify({ message, chatHistory }),
    });
  },

  // 6. Instagram Quickflows
  getQuickflows: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/automation/quickflows${query ? `?${query}` : ''}`);
  },
  createQuickflow: async (flowData) => {
    return apiRequest('/automation/quickflows', {
      method: 'POST',
      body: JSON.stringify(flowData),
    });
  },
  updateQuickflow: async (id, flowData) => {
    return apiRequest(`/automation/quickflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(flowData),
    });
  },
  deleteQuickflow: async (id) => {
    return apiRequest(`/automation/quickflows/${id}`, {
      method: 'DELETE',
    });
  },
  toggleQuickflow: async (id) => {
    return apiRequest(`/automation/quickflows/${id}/toggle`, {
      method: 'PUT',
    });
  },
  duplicateQuickflow: async (id) => {
    return apiRequest(`/automation/quickflows/${id}/duplicate`, {
      method: 'POST',
    });
  },

  // 7. Voice AI / My Call Genie
  getVoiceAiData: async () => {
    return apiRequest('/automation/voice-ai');
  },
  updateVoiceAiConfig: async (configData) => {
    return apiRequest('/automation/voice-ai/config', {
      method: 'PUT',
      body: JSON.stringify(configData),
    });
  },
  simulateInboundCall: async (callData) => {
    return apiRequest('/automation/voice-ai/simulate-call', {
      method: 'POST',
      body: JSON.stringify(callData),
    });
  },

  // 8. WhatsApp Forms
  getForms: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/automation/forms${query ? `?${query}` : ''}`);
  },
  getWhatsAppForms: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/automation/forms${query ? `?${query}` : ''}`);
  },
  getFormById: async (id) => {
    return apiRequest(`/automation/forms/${id}`);
  },
  createForm: async (formData) => {
    return apiRequest('/automation/forms', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  },
  updateForm: async (id, formData) => {
    return apiRequest(`/automation/forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
    });
  },
  deleteForm: async (id) => {
    return apiRequest(`/automation/forms/${id}`, {
      method: 'DELETE',
    });
  },
  duplicateForm: async (id) => {
    return apiRequest(`/automation/forms/${id}/duplicate`, {
      method: 'POST',
    });
  },
  getFormResponses: async (formId) => {
    return apiRequest(`/automation/forms/${formId}/responses`);
  },
  submitFormResponse: async (formId, responseData) => {
    return apiRequest(`/automation/forms/${formId}/submit`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  },

  // 9. Interactive Lists
  getInteractiveLists: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/automation/interactive-lists${query ? `?${query}` : ''}`);
  },
  createInteractiveList: async (listData) => {
    return apiRequest('/automation/interactive-lists', {
      method: 'POST',
      body: JSON.stringify(listData),
    });
  },
  updateInteractiveList: async (id, listData) => {
    return apiRequest(`/automation/interactive-lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listData),
    });
  },
  deleteInteractiveList: async (id) => {
    return apiRequest(`/automation/interactive-lists/${id}`, {
      method: 'DELETE',
    });
  },
  duplicateInteractiveList: async (id) => {
    return apiRequest(`/automation/interactive-lists/${id}/duplicate`, {
      method: 'POST',
    });
  },

  // 10. Master Execution Engine & Logs
  executeEngine: async (payload) => {
    return apiRequest('/automation/execute', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getLogs: async () => {
    return apiRequest('/automation/logs');
  },
};
