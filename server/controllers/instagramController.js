import crypto from 'crypto';
import { query } from '../config/db.js';
import { metaInstagramService } from '../services/metaInstagramService.js';

export const instagramController = {
  /**
   * Signature verification middleware for Instagram webhooks (X-Hub-Signature-256)
   */
  verifyWebhookSignature: (req, res, next) => {
    try {
      const signatureHeader = req.headers['x-hub-signature-256'] || req.headers['X-Hub-Signature-256'];
      const appSecret = process.env.META_APP_SECRET;

      if (!appSecret) {
        // App secret not configured; permit during setup/testing
        return next();
      }

      if (!signatureHeader || typeof signatureHeader !== 'string') {
        return res.status(401).json({ success: false, error: 'Missing X-Hub-Signature-256 header' });
      }

      const parts = signatureHeader.split('=');
      if (parts.length !== 2 || parts[0].toLowerCase() !== 'sha256') {
        return res.status(401).json({ success: false, error: 'Invalid X-Hub-Signature-256 format' });
      }

      const signatureHash = parts[1].trim();
      let rawPayload = req.rawBody;
      if (!rawPayload) {
        if (Buffer.isBuffer(req.body)) {
          rawPayload = req.body;
        } else if (typeof req.body === 'string') {
          rawPayload = Buffer.from(req.body, 'utf8');
        } else if (req.body && typeof req.body === 'object') {
          rawPayload = Buffer.from(JSON.stringify(req.body), 'utf8');
        } else {
          rawPayload = Buffer.from('', 'utf8');
        }
      }

      const expectedHash = crypto.createHmac('sha256', appSecret).update(rawPayload).digest('hex');
      const sigBuffer = Buffer.from(signatureHash, 'utf8');
      const expBuffer = Buffer.from(expectedHash, 'utf8');

      if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
        console.warn('[Instagram Webhook] Signature mismatch detected.');
        return res.status(401).json({ success: false, error: 'Invalid webhook signature' });
      }

      next();
    } catch (err) {
      console.error('[Instagram Webhook Signature Error]:', err.message);
      return res.status(401).json({ success: false, error: 'Webhook signature verification failed' });
    }
  },

  /**
   * GET /api/instagram/webhook (Meta Webhook Verification Handshake)
   */
  verifyWebhook: (req, res) => {
    try {
      const mode = (req.query['hub.mode'] || '').trim();
      const token = (req.query['hub.verify_token'] || '').trim().replace(/^["']|["']$/g, '');
      const challenge = req.query['hub.challenge'];

      const validTokens = [
        process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN,
        process.env.META_WEBHOOK_VERIFY_TOKEN,
        'arco_meta_webhook_verify_secret_token',
      ]
        .filter(Boolean)
        .map((t) => t.trim().replace(/^["']|["']$/g, ''));

      if (mode === 'subscribe' && validTokens.includes(token)) {
        console.log('[Instagram Webhook] Handshake verified successfully.');
        return res.status(200).send(challenge);
      }

      console.warn(`[Instagram Webhook] Verification token mismatch. Received token: ${token}`);
      return res.status(403).send('Forbidden: Token mismatch');
    } catch (err) {
      console.error('[Instagram Webhook Handshake Error]:', err.message);
      return res.status(500).send('Internal Server Error');
    }
  },

  /**
   * POST /api/instagram/webhook (Inbound Instagram DM Ingestion)
   */
  handleWebhook: async (req, res) => {
    // Immediate 200 OK acknowledgment to prevent Meta retries
    res.status(200).send('EVENT_RECEIVED');

    try {
      const body = req.body;
      if (!body || (body.object !== 'instagram' && body.object !== 'page')) {
        return;
      }

      const entries = body.entry || [];
      for (const entry of entries) {
        const messagingEvents = entry.messaging || [];
        for (const event of messagingEvents) {
          // Process incoming DM messages
          if (event.message && !event.message.is_echo) {
            const senderId = event.sender?.id;
            const recipientId = event.recipient?.id || entry.id;
            const messageId = event.message.mid;
            const messageText = event.message.text || '';
            const attachments = event.message.attachments || null;

            if (!senderId || !messageId) continue;

            // 1. Deduplication check
            const dupCheck = await query(
              'SELECT id FROM messages WHERE meta_message_id = $1 LIMIT 1',
              [messageId]
            );
            if (dupCheck.rows.length > 0) {
              continue;
            }

            // 2. Resolve tenant user ID
            let tenantUserId = 'usr_1790574599220';
            try {
              const intRes = await query(
                `SELECT user_id, instagram_username, instagram_name FROM instagram_integrations 
                 WHERE (instagram_business_account_id = $1 OR page_id = $1) AND status = 'connected'
                 ORDER BY updated_at DESC LIMIT 1`,
                [recipientId]
              );
              if (intRes.rows.length > 0 && intRes.rows[0].user_id) {
                tenantUserId = intRes.rows[0].user_id;
              }
            } catch (tenantErr) {
              console.warn('[Instagram Webhook] Tenant lookup notice:', tenantErr.message);
            }

            // 3. Fetch sender IG profile name if accessible
            let senderDisplayName = `Instagram User (${senderId.slice(-4)})`;
            let senderUsername = '';
            try {
              const profile = await metaInstagramService.getUserProfile({
                igScopedId: senderId,
                userId: tenantUserId,
              });
              if (profile?.name) {
                senderDisplayName = profile.name;
                senderUsername = profile.username || '';
              }
            } catch (profErr) {
              // Graceful profile lookup ignore
            }

            // 4. Contact Lookup or Auto-Creation
            let contact = null;
            const contactRes = await query(
              `SELECT * FROM contacts 
               WHERE phone = $1 AND (user_id = $2 OR user_id IS NULL) 
               LIMIT 1`,
              [senderId, tenantUserId]
            );

            if (contactRes.rows.length > 0) {
              contact = contactRes.rows[0];
            } else {
              const newContactId = `cnt_ig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
              const insContact = await query(
                `INSERT INTO contacts (
                   id, user_id, name, phone, email, whatsapp_opted, tag, status, owner, channel, created_at, updated_at
                 ) VALUES ($1, $2, $3, $4, $5, false, 'Instagram Lead', 'Open Lead', 'Unassigned', 'instagram', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 RETURNING *`,
                [
                  newContactId,
                  tenantUserId,
                  senderDisplayName,
                  senderId,
                  senderUsername ? `${senderUsername}@instagram.com` : null,
                ]
              );
              contact = insContact.rows[0];
            }

            // 5. Conversation Lookup or Auto-Creation
            let conv = null;
            const convRes = await query(
              `SELECT * FROM conversations 
               WHERE phone = $1 AND channel = 'instagram' AND (user_id = $2 OR user_id IS NULL)
               LIMIT 1`,
              [senderId, tenantUserId]
            );

            const displayPreview = messageText || (attachments ? '📷 [Photo/Media]' : '[Incoming Message]');
            const now = new Date();

            if (convRes.rows.length > 0) {
              conv = convRes.rows[0];
              await query(
                `UPDATE conversations SET
                   unread_count = COALESCE(unread_count, 0) + 1,
                   last_message_time = 'Just now',
                   last_inbound_at = $1,
                   reply_status = 'unreplied',
                   status_filter = 'open',
                   name = COALESCE($2, name),
                   updated_at = CURRENT_TIMESTAMP
                 WHERE id = $3`,
                [now, senderDisplayName, conv.id]
              );
            } else {
              const newConvId = `cnv_ig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
              const insConv = await query(
                `INSERT INTO conversations (
                   id, user_id, name, channel, status, phone, unread_count, last_message_time,
                   tag, status_filter, assignee, reply_status, last_inbound_at, created_at, updated_at
                 ) VALUES (
                   $1, $2, $3, 'instagram', 'Online', $4, 1, 'Just now',
                   'Instagram Lead', 'open', 'Unassigned', 'unreplied', $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                 ) RETURNING *`,
                [newConvId, tenantUserId, senderDisplayName, senderId, now]
              );
              conv = insConv.rows[0];
            }

            // 6. Insert inbound Message
            const newMsgId = `m_ig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const messageType = attachments ? 'image' : 'text';

            await query(
              `INSERT INTO messages (
                 id, conversation_id, user_id, sender, text, time, timestamp,
                 meta_message_id, status, message_type, attachment, created_at
               ) VALUES ($1, $2, $3, 'them', $4, $5, $6, $7, 'delivered', $8, $9, CURRENT_TIMESTAMP)`,
              [
                newMsgId,
                conv.id,
                tenantUserId,
                messageText || (attachments ? '[Photo/Media]' : ''),
                now.toISOString(),
                now,
                messageId,
                messageType,
                attachments ? JSON.stringify(attachments) : null,
              ]
            );

            console.log(`[Instagram Webhook] Successfully ingested DM from ${senderDisplayName} (IGSID: ${senderId})`);
          }
        }
      }
    } catch (err) {
      console.error('[Instagram Webhook Ingestion Error]:', err);
    }
  },

  /**
   * GET /api/instagram/status
   */
  getStatus: async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const creds = await metaInstagramService.getCredentials(userId);

      if (!creds) {
        return res.json({
          success: true,
          data: {
            connected: false,
            status: 'disconnected',
          },
        });
      }

      res.json({
        success: true,
        data: {
          connected: creds.status === 'connected',
          status: creds.status,
          pageId: creds.pageId,
          pageName: creds.pageName,
          instagramBusinessAccountId: creds.igAccountId,
          instagramUsername: creds.igUsername,
          instagramName: creds.igName,
          profilePictureUrl: creds.profilePictureUrl,
          updatedAt: creds.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/instagram/connect (Connect via Facebook Login popup user access token)
   */
  connect: async (req, res, next) => {
    try {
      const { userAccessToken } = req.body;
      const userId = req.user?.id;

      if (!userAccessToken) {
        return res.status(400).json({
          success: false,
          error: 'userAccessToken is required from Facebook Login.',
        });
      }

      const result = await metaInstagramService.connectWithToken({
        userAccessToken,
        userId,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/instagram/connect-direct (Manual / Developer credential setup)
   */
  connectDirect: async (req, res, next) => {
    try {
      const { pageId, pageName, pageAccessToken, igAccountId, igUsername } = req.body;
      const userId = req.user?.id;

      if (!pageId || !pageAccessToken) {
        return res.status(400).json({
          success: false,
          error: 'pageId and pageAccessToken are required for direct connection.',
        });
      }

      const result = await metaInstagramService.connectDirect({
        pageId,
        pageName,
        pageAccessToken,
        igAccountId,
        igUsername,
        userId,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/instagram/disconnect
   */
  disconnect: async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const result = await metaInstagramService.disconnect(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/instagram/send-direct
   */
  sendDirect: async (req, res, next) => {
    try {
      const { recipientId, text } = req.body;
      const userId = req.user?.id;

      if (!recipientId || !text) {
        return res.status(400).json({
          success: false,
          error: 'recipientId and text are required',
        });
      }

      const sendResult = await metaInstagramService.sendTextMessage({
        recipientId,
        text,
        userId,
      });

      if (!sendResult.success) {
        return res.status(400).json(sendResult);
      }

      res.json({
        success: true,
        data: sendResult,
      });
    } catch (error) {
      next(error);
    }
  },
};
