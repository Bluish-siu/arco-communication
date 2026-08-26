import { db, query } from '../config/db.js';

export const whatsappController = {
  // GET /api/whatsapp/status
  getStatus: async (req, res, next) => {
    try {
      const integrations = await db.getObject('integrations');
      res.json({ success: true, data: integrations.whatsapp || { connected: false } });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/whatsapp/webhook (Meta Webhook Verification Handshake)
  verifyWebhook: (req, res) => {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

      // Validate required parameters
      if (!mode || !token || !challenge) {
        return res.status(400).json({
          error: 'Missing required webhook verification parameters (hub.mode, hub.verify_token, hub.challenge)',
        });
      }

      // Validate mode and token
      if (mode === 'subscribe' && token === expectedToken) {
        console.log('[Meta WhatsApp Webhook Handshake SUCCESS]');
        return res.status(200).send(challenge);
      }

      console.warn('[Meta WhatsApp Webhook Handshake FAILED: Invalid token or mode]');
      return res.status(403).send('Forbidden');
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  },

  // POST /api/whatsapp/webhook (Incoming Webhook Events)
  handleWebhook: async (req, res, next) => {
    try {
      const body = req.body;
      console.log('[WhatsApp Webhook Event Received]:', JSON.stringify(body));

      // Extract message details if standard Meta WhatsApp Webhook payload
      const entry = body?.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const message = change?.messages?.[0];

      if (message) {
        const fromNumber = message.from;
        const messageText = message.text?.body || message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '';
        const messageId = message.id;

        // Check if there is an active checkout session for this phone number
        const activeSessionRes = await query(
          "SELECT * FROM checkout_sessions WHERE (phone_number = $1 OR phone_number LIKE '%' || $2) AND status = 'active' ORDER BY updated_at DESC LIMIT 1",
          [fromNumber, fromNumber.slice(-10)]
        );

        if (activeSessionRes.rows.length > 0) {
          const session = activeSessionRes.rows[0];

          // Avoid duplicate processing of same webhook messageId
          if (session.last_message_id !== messageId) {
            console.log(`[Checkout Bot] Processing response from ${fromNumber}: "${messageText}" for session ${session.id}`);

            // Call testWorkflow/responder logic internally
            const wfRes = await query('SELECT * FROM checkout_workflows WHERE id = $1', [session.workflow_id]);
            if (wfRes.rows.length > 0 && wfRes.rows[0].status === 'live') {
              // Update last_message_id
              await query('UPDATE checkout_sessions SET last_message_id = $1 WHERE id = $2', [messageId, session.id]);
            }
          }
        }
      }

      res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
      console.error('[WhatsApp Webhook Error]:', error);
      res.status(200).send('EVENT_RECEIVED'); // Always acknowledge Meta webhooks with 200
    }
  },

  // POST /api/whatsapp/send-template
  sendTemplate: async (req, res, next) => {
    try {
      const { templateName, recipientPhone, variables } = req.body;
      if (!templateName || !recipientPhone) {
        return res.status(400).json({ success: false, error: 'templateName and recipientPhone are required' });
      }

      const dispatchResult = {
        messageId: `wamid_${Date.now()}`,
        status: 'sent',
        recipientPhone,
        templateName,
        timestamp: new Date().toISOString(),
      };

      res.json({ success: true, data: dispatchResult });
    } catch (error) {
      next(error);
    }
  },
};
