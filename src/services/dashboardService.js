import { apiRequest } from './api';

export const dashboardService = {
  // Get aggregated dashboard state (cards & objectives)
  getDashboardState: async () => {
    try {
      const res = await apiRequest('/settings/dashboard-state');
      return res?.data || null;
    } catch (err) {
      console.warn('[dashboardService] getDashboardState error:', err.message);
      return null;
    }
  },

  // Team Member Invite
  inviteTeamMember: async ({ name, email, role }) => {
    return apiRequest('/settings/team-members', {
      method: 'POST',
      body: JSON.stringify({ name, email, role }),
    });
  },

  // WhatsApp Profile Update
  updateWhatsAppProfile: async (profileData) => {
    return apiRequest('/settings/whatsapp-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Greeting Flow Save
  saveGreetingFlow: async (flowPayload) => {
    return apiRequest('/automation/settings', {
      method: 'PUT',
      body: JSON.stringify({
        welcomeMessage: {
          enabled: true,
          ...flowPayload,
          updatedAt: new Date().toISOString(),
        },
      }),
    });
  },

  // Get Workflows for Greeting Flow
  getWorkflows: async (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await apiRequest(`/automation/workflows${query}`);
    return res?.data || [];
  },

  // Get WhatsApp Forms for Greeting Flow
  getWhatsAppForms: async (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await apiRequest(`/automation/forms${query}`);
    return res?.data || [];
  },

  // FAQ Auto-replies Save
  saveFaqReply: async ({ trigger, response, category }) => {
    return apiRequest('/automation/custom-replies', {
      method: 'POST',
      body: JSON.stringify({
        trigger,
        response,
        category: category || 'General Support',
        matchType: 'contains',
        channel: 'whatsapp',
        status: 'active',
      }),
    });
  },

  // Support Chat Automation
  saveSupportAutomation: async (supportData) => {
    return apiRequest('/settings/support-automation', {
      method: 'PUT',
      body: JSON.stringify(supportData),
    });
  },

  // Google Sheets Integration
  saveGoogleSheets: async ({ sheetId, sheetUrl, sheetName, autoSync }) => {
    return apiRequest('/settings/google-sheets', {
      method: 'POST',
      body: JSON.stringify({ sheetId, sheetUrl, sheetName, autoSync }),
    });
  },

  // Automated Notifications & Alerts
  saveAutomatedAlerts: async (alertsData) => {
    return apiRequest('/settings/automated-alerts', {
      method: 'POST',
      body: JSON.stringify(alertsData),
    });
  },

  // Add Contact
  createContact: async ({ name, phone, email, tag }) => {
    return apiRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        name,
        phone,
        email: email || `${phone.replace(/[^0-9]/g, '')}@lead.arco.com`,
        tag: tag || 'Inbound Lead',
        segment: 'High Intent',
        channel: 'whatsapp',
      }),
    });
  },

  // Quick Campaign Setup
  createQuickCampaign: async ({ name, templateName, audienceSegment, scheduledFor }) => {
    return apiRequest('/campaigns', {
      method: 'POST',
      body: JSON.stringify({
        name,
        channel: 'whatsapp',
        type: 'onetime',
        category: 'Marketing',
        templateName: templateName || 'promotional_discount_v1',
        audienceSegment: audienceSegment || 'All Contacts',
        recipients: 1250,
        scheduledFor: scheduledFor || new Date().toISOString(),
      }),
    });
  },

  // WhatsApp Interactive Form
  createWhatsAppForm: async ({ title, description, fields }) => {
    return apiRequest('/automation/forms', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        fields,
        channel: 'whatsapp',
        status: 'active',
      }),
    });
  },

  // AI Agent Setup
  createAiAgent: async ({ name, model, systemPrompt, personalityTone }) => {
    return apiRequest('/ai-agents', {
      method: 'POST',
      body: JSON.stringify({
        name,
        model: model || 'ARCO-v2.0-IntentEngine',
        systemPrompt,
        personalityTone: personalityTone || 'consultative',
        channels: ['whatsapp', 'instagram'],
        status: 'live',
      }),
    });
  },
};
