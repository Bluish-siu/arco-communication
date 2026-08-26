import { db } from '../config/db.js';

export const instagramController = {
  // GET /api/instagram/status
  getStatus: async (req, res, next) => {
    try {
      const integrations = await db.getObject('integrations');
      res.json({ success: true, data: integrations.instagram || { connected: false } });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/instagram/send-direct
  sendDirect: async (req, res, next) => {
    try {
      const { handle, message } = req.body;
      if (!handle || !message) {
        return res.status(400).json({ success: false, error: 'handle and message are required' });
      }

      res.json({
        success: true,
        data: {
          id: `ig_msg_${Date.now()}`,
          handle,
          status: 'delivered',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
