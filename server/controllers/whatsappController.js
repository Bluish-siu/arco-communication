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

      // 2. Handle Meta WhatsApp Status Updates (sent, delivered, read, failed)
      const statuses = change?.statuses;
      if (Array.isArray(statuses) && statuses.length > 0) {
        for (const st of statuses) {
          const wamid = st.id;
          const statusVal = st.status; // 'sent' | 'delivered' | 'read' | 'failed'
          const timestamp = st.timestamp ? new Date(parseInt(st.timestamp, 10) * 1000) : new Date();

          if (wamid) {
            console.log(`[WhatsApp Webhook Status Update] WAMID: ${wamid}, Status: ${statusVal}`);

            // Find campaign recipient with this meta_message_id
            const rcpRes = await query(
              'SELECT id, campaign_id, status FROM campaign_recipients WHERE meta_message_id = $1 LIMIT 1',
              [wamid]
            );

            if (rcpRes.rows.length > 0) {
              const rcp = rcpRes.rows[0];

              if (statusVal === 'delivered') {
                await query(
                  `UPDATE campaign_recipients 
                   SET status = CASE WHEN status IN ('read', 'replied') THEN status ELSE 'delivered' END,
                       delivered_at = COALESCE(delivered_at, $1),
                       updated_at = CURRENT_TIMESTAMP
                   WHERE id = $2`,
                  [timestamp, rcp.id]
                );
              } else if (statusVal === 'read') {
                await query(
                  `UPDATE campaign_recipients 
                   SET status = CASE WHEN status = 'replied' THEN status ELSE 'read' END,
                       read_at = COALESCE(read_at, $1),
                       delivered_at = COALESCE(delivered_at, $1),
                       updated_at = CURRENT_TIMESTAMP
                   WHERE id = $2`,
                  [timestamp, rcp.id]
                );
              } else if (statusVal === 'failed') {
                const errMsg = st.errors?.[0]?.message || st.errors?.[0]?.title || 'Meta delivery failed';
                const errCode = st.errors?.[0]?.code || 'META_DELIVERY_FAILURE';
                await query(
                  `UPDATE campaign_recipients 
                   SET status = 'failed',
                       failed_at = COALESCE(failed_at, $1),
                       error_message = $2,
                       error_code = $3,
                       updated_at = CURRENT_TIMESTAMP
                   WHERE id = $4`,
                  [timestamp, errMsg, String(errCode), rcp.id]
                );
              }

              // Recalculate campaign statistics in real-time
              const statsRes = await query(
                `SELECT 
                   COUNT(*) as total,
                   COUNT(*) FILTER (WHERE status = 'pending') as pending,
                   COUNT(*) FILTER (WHERE status = 'sent') as sent,
                   COUNT(*) FILTER (WHERE status IN ('delivered', 'read', 'replied')) as delivered,
                   COUNT(*) FILTER (WHERE status IN ('read', 'replied')) as read,
                   COUNT(*) FILTER (WHERE status = 'replied') as replied,
                   COUNT(*) FILTER (WHERE status = 'failed') as failed
                 FROM campaign_recipients WHERE campaign_id = $1`,
                [rcp.campaign_id]
              );

              const stats = statsRes.rows[0];
              const remainingPending = parseInt(stats.pending, 10);
              const failedCount = parseInt(stats.failed, 10);
              const totalCount = parseInt(stats.total, 10);

              const campStatus = remainingPending === 0
                ? (failedCount === totalCount ? 'Failed' : (failedCount > 0 ? 'Partially Completed' : 'Completed'))
                : 'Sending';

              await query(
                `UPDATE campaigns 
                 SET delivered = $1,
                     read = $2,
                     replied = $3,
                     failure_count = $4,
                     status = $5,
                     completed_at = CASE WHEN $6 = 'Completed' OR $6 = 'Partially Completed' THEN CURRENT_TIMESTAMP ELSE completed_at END,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $7`,
                [
                  parseInt(stats.delivered, 10),
                  parseInt(stats.read, 10),
                  parseInt(stats.replied, 10),
                  failedCount,
                  campStatus,
                  campStatus,
                  rcp.campaign_id,
                ]
              );
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
