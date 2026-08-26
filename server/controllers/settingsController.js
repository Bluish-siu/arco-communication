import { db } from '../config/db.js';

export const settingsController = {
  // GET /api/settings
  getSettings: async (req, res, next) => {
    try {
      const settings = await db.getObject('settings');
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/settings
  updateSettings: async (req, res, next) => {
    try {
      const updated = await db.updateObject('settings', req.body);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/settings/widget
  getWidgetSettings: async (req, res, next) => {
    try {
      const settings = await db.getObject('settings');
      const widget = settings?.widget || {
        enabled: true,
        phoneNumber: '+919876543210',
        businessName: 'ARCO Support',
        position: 'bottom-right',
        desktopPosition: 'right',
        desktopSideSpacing: 10,
        desktopBottomSpacing: 10,
        mobilePosition: 'right',
        mobileSideSpacing: 10,
        mobileBottomSpacing: 10,
        buttonType: 'with-text',
        buttonText: 'Chat with us',
        buttonColor: '#25D366',
        ctaText: 'Chat with us',
        greetingMessage: 'HI THERE!',
        greetingsText: 'HI THERE!',
        introMessage: 'We are here to help you! Chat with us on WhatsApp for any queries.',
        prefilledMessage: 'Hi ARCO team, I have a question regarding your services.',
        showAgentAvatar: true,
        responseTimeText: 'Typically replies within minutes',
      };
      res.json({ success: true, data: widget });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/settings/widget
  updateWidgetSettings: async (req, res, next) => {
    try {
      const current = await db.getObject('settings');
      const updated = await db.updateObject('settings', {
        ...current,
        widget: {
          ...(current?.widget || {}),
          ...req.body,
        },
      });
      res.json({ success: true, data: updated?.widget || req.body });
    } catch (error) {
      next(error);
    }
  },
};
