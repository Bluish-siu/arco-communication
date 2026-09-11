import { db, query } from '../config/db.js';
import { evaluateAssignmentInternal } from './chatAssignmentController.js';

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
      const mode = (req.query['hub.mode'] || '').trim();
      const token = (req.query['hub.verify_token'] || '').trim().replace(/^["']|["']$/g, '');
      const challenge = req.query['hub.challenge'];

      const expectedToken = (process.env.META_WEBHOOK_VERIFY_TOKEN || '').trim().replace(/^["']|["']$/g, '');

      // Validate required parameters
      if (!mode || !token || !challenge) {
        return res.status(400).json({
          error: 'Missing required webhook verification parameters (hub.mode, hub.verify_token, hub.challenge)',
        });
      }

      // Validate mode and token
      if (mode === 'subscribe' && expectedToken && token === expectedToken) {
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

      // Standard Meta WhatsApp Webhook payload format
      const entry = body?.entry?.[0];
      const changes = entry?.changes || [];

      for (const changeItem of changes) {
        const change = changeItem?.value;
        if (!change) continue;

        // 1. Process Inbound Customer Messages
        const messages = change?.messages;
        if (Array.isArray(messages) && messages.length > 0) {
          for (const message of messages) {
            const messageId = message.id;
            const fromRaw = message.from;
            if (!messageId || !fromRaw) continue;

            const fromPhone = fromRaw.startsWith('+') ? fromRaw : `+${fromRaw}`;
            const clean10 = fromRaw.slice(-10);
            const senderProfileName =
              change?.contacts?.find((c) => c.wa_id === fromRaw)?.profile?.name ||
              change?.contacts?.[0]?.profile?.name ||
              null;
            const timestamp = message.timestamp
              ? new Date(parseInt(message.timestamp, 10) * 1000)
              : new Date();

            // Deduplication against messages table by meta_message_id
            const existingMsg = await query(
              'SELECT id FROM messages WHERE meta_message_id = $1 LIMIT 1',
              [messageId]
            );
            if (existingMsg.rows.length > 0) {
              console.log(`[WhatsApp Webhook] Duplicate inbound message ${messageId} already exists. Skipping.`);
              continue;
            }

            // A. Contact Lookup / Auto-Create
            let contact = null;
            const contactRes = await query(
              `SELECT * FROM contacts WHERE phone = $1 OR phone = $2 OR phone LIKE '%' || $3 LIMIT 1`,
              [fromPhone, fromRaw, clean10]
            );

            // Check for explicit opt-in / opt-out intent in message text
            const rawBody = (message.text?.body || '').trim().toLowerCase();
            const hasExplicitOptIn = ['start', 'unstop', 'optin', 'opt in'].includes(rawBody);
            const hasExplicitOptOut = ['stop', 'unsubscribe', 'optout', 'opt out'].includes(rawBody);

            if (contactRes.rows.length > 0) {
              contact = contactRes.rows[0];

              // Preserve existing consent value unless webhook contains an explicit consent change
              if (hasExplicitOptOut && contact.whatsapp_opted !== false) {
                await query('UPDATE contacts SET whatsapp_opted = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [contact.id]);
                contact.whatsapp_opted = false;
              } else if (hasExplicitOptIn && contact.whatsapp_opted !== true) {
                await query('UPDATE contacts SET whatsapp_opted = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [contact.id]);
                contact.whatsapp_opted = true;
              }

              if ((!contact.name || contact.name === 'Unknown' || contact.name === fromPhone) && senderProfileName) {
                await query('UPDATE contacts SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
                  senderProfileName,
                  contact.id,
                ]);
                contact.name = senderProfileName;
              }
            } else {
              const newContactId = `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
              const contactName = senderProfileName || `WhatsApp User (${clean10})`;

              // Compliance: An inbound message indicates customer initiated communication,
              // but must NOT automatically be treated as marketing opt-in.
              // If no explicit opt-in exists, default to false per ARCO consent conventions.
              const initialConsent = hasExplicitOptIn ? true : false;

              const newContactRes = await query(
                `INSERT INTO contacts (id, name, phone, email, whatsapp_opted, tag, status, owner, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 RETURNING *`,
                [
                  newContactId,
                  contactName,
                  fromPhone,
                  '',
                  initialConsent,
                  'Lead',
                  'Open Lead',
                  'Unassigned',
                ]
              );
              contact = newContactRes.rows[0];
            }

            // B. Conversation Lookup / Auto-Create
            let conv = null;
            const convRes = await query(
              `SELECT * FROM conversations WHERE (phone = $1 OR phone = $2 OR phone LIKE '%' || $3) AND channel = 'whatsapp' LIMIT 1`,
              [fromPhone, fromRaw, clean10]
            );

            const timeStr = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (convRes.rows.length > 0) {
              conv = convRes.rows[0];
              await query(
                `UPDATE conversations SET
                   unread_count = COALESCE(unread_count, 0) + 1,
                   last_message_time = 'Just now',
                   last_inbound_at = $1,
                   reply_status = 'unreplied',
                   status_filter = 'open',
                   response_window = 'active',
                   updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2`,
                [timestamp, conv.id]
              );
            } else {
              let assignedAgent = 'Unassigned';
              try {
                const assignResult = await evaluateAssignmentInternal({
                  contactName: contact?.name || senderProfileName,
                  contactPhone: fromPhone,
                  contactEmail: contact?.email || '',
                  tag: contact?.tag || 'Lead',
                  channel: 'whatsapp',
                  userId: contact?.user_id || 'usr_1',
                });
                if (assignResult?.assignedAgent && assignResult.assignedAgent !== 'Unassigned') {
                  assignedAgent = assignResult.assignedAgent;
                }
              } catch (assignErr) {
                console.warn('[WhatsApp Webhook] Agent assignment evaluation failed:', assignErr.message);
              }

              const newConvId = `cnv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
              const newConvRes = await query(
                `INSERT INTO conversations (
                   id, name, channel, status, phone, unread_count, last_message_time,
                   tag, status_filter, assignee, reply_status, response_window,
                   last_inbound_at, is_spam, created_at, updated_at
                 ) VALUES (
                   $1, $2, 'whatsapp', 'Online', $3, 1, 'Just now',
                   $4, 'open', $5, 'unreplied', 'active',
                   $6, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                 ) RETURNING *`,
                [
                  newConvId,
                  contact?.name || senderProfileName || fromPhone,
                  fromPhone,
                  contact?.tag || 'Lead',
                  assignedAgent,
                  timestamp,
                ]
              );
              conv = newConvRes.rows[0];
            }

            // C. Extract message text and type
            let messageText = '';
            let messageType = message.type || 'text';
            if (message.text?.body) {
              messageText = message.text.body;
            } else if (message.interactive?.button_reply?.title) {
              messageText = message.interactive.button_reply.title;
            } else if (message.interactive?.list_reply?.title) {
              messageText = message.interactive.list_reply.title;
            } else if (message.image) {
              messageText = message.image.caption || '[Image]';
            } else if (message.document) {
              messageText = message.document.filename || '[Document]';
            } else if (message.audio) {
              messageText = '[Audio message]';
            } else if (message.video) {
              messageText = message.video.caption || '[Video]';
            } else if (message.location) {
              messageText = `[Location: ${message.location.latitude}, ${message.location.longitude}]`;
            } else {
              messageText = '[Message]';
            }

            // D. Persist into messages table
            const newMsgId = `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            await query(
              `INSERT INTO messages (
                 id, conversation_id, sender, text, time, meta_message_id,
                 status, error_message, message_type, created_at
               ) VALUES (
                 $1, $2, 'contact', $3, $4, $5,
                 'delivered', NULL, $6, $7
               )`,
              [
                newMsgId,
                conv.id,
                messageText,
                timeStr,
                messageId,
                messageType,
                timestamp,
              ]
            );

            // E. Retain checkout bot session handling if active
            try {
              const activeSessionRes = await query(
                "SELECT * FROM checkout_sessions WHERE (phone_number = $1 OR phone_number LIKE '%' || $2) AND status = 'active' ORDER BY updated_at DESC LIMIT 1",
                [fromPhone, clean10]
              );

              if (activeSessionRes.rows.length > 0) {
                const session = activeSessionRes.rows[0];
                if (session.last_message_id !== messageId) {
                  console.log(`[Checkout Bot] Processing response from ${fromPhone}: "${messageText}" for session ${session.id}`);
                  const wfRes = await query('SELECT * FROM checkout_workflows WHERE id = $1', [session.workflow_id]);
                  if (wfRes.rows.length > 0 && wfRes.rows[0].status === 'live') {
                    await query('UPDATE checkout_sessions SET last_message_id = $1 WHERE id = $2', [messageId, session.id]);
                  }
                }
              }
            } catch (botErr) {
              console.warn('[Checkout Bot Webhook Session Error]:', botErr.message);
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
            const recipientPhone = st.recipient_id || '';
            const errMsg = st.errors?.[0]?.message || st.errors?.[0]?.title || null;
            const errCode = st.errors?.[0]?.code ? String(st.errors[0].code) : null;
            const errSubcode = st.errors?.[0]?.error_subcode ? String(st.errors[0].error_subcode) : null;

            if (wamid) {
              console.log(`[WhatsApp Webhook Status Event] WAMID: ${wamid} | Status: ${statusVal} | Phone: ${recipientPhone} | Error: ${errMsg || 'none'}`);

              // Update messages table with monotonic status progression
              try {
                await query(
                  `UPDATE messages SET
                     status = CASE
                       WHEN status = 'read' THEN 'read'
                       WHEN $1 = 'read' THEN 'read'
                       WHEN $1 = 'delivered' AND status != 'read' THEN 'delivered'
                       ELSE $1
                     END,
                     error_message = CASE
                       WHEN $1 = 'failed' THEN COALESCE($2, error_message)
                       ELSE error_message
                     END
                   WHERE meta_message_id = $3`,
                  [statusVal, errMsg, wamid]
                );
              } catch (msgErr) {
                console.warn('[WhatsApp Webhook] Failed to update message status in messages table:', msgErr.message);
              }

              // Update universal message log
              try {
                const updateLogRes = await query(
                  `UPDATE whatsapp_message_logs
                   SET status = $1::varchar,
                       sent_at = CASE WHEN $1::text = 'sent' THEN COALESCE(sent_at, $2::timestamptz) ELSE sent_at END,
                       delivered_at = CASE WHEN $1::text IN ('delivered', 'read') THEN COALESCE(delivered_at, $2::timestamptz) ELSE delivered_at END,
                       read_at = CASE WHEN $1::text = 'read' THEN COALESCE(read_at, $2::timestamptz) ELSE read_at END,
                       failed_at = CASE WHEN $1::text = 'failed' THEN COALESCE(failed_at, $2::timestamptz) ELSE failed_at END,
                       error_code = CASE WHEN $1::text = 'failed' THEN COALESCE($3::varchar, error_code) ELSE error_code END,
                       error_message = CASE WHEN $1::text = 'failed' THEN COALESCE($4::text, error_message) ELSE error_message END,
                       error_subcode = CASE WHEN $1::text = 'failed' THEN COALESCE($5::varchar, error_subcode) ELSE error_subcode END,
                       raw_webhook_events = COALESCE(raw_webhook_events, '[]'::jsonb) || $6::jsonb,
                       updated_at = CURRENT_TIMESTAMP
                   WHERE wamid = $7::varchar`,
                  [
                    statusVal,
                    timestamp,
                    errCode,
                    errMsg,
                    errSubcode,
                    JSON.stringify([st]),
                    wamid,
                  ]
                );

                if (updateLogRes.rowCount === 0) {
                  await query(
                    `INSERT INTO whatsapp_message_logs (
                       wamid, recipient_phone, status, error_code, error_message, error_subcode,
                       raw_webhook_events, accepted_at,
                       sent_at, delivered_at, read_at, failed_at, updated_at
                     ) VALUES (
                       $1::varchar, $2::varchar, $3::varchar, $4::varchar, $5::text, $6::varchar,
                       $7::jsonb, CURRENT_TIMESTAMP,
                       CASE WHEN $3::text = 'sent' THEN $8::timestamptz ELSE NULL END,
                       CASE WHEN $3::text IN ('delivered', 'read') THEN $8::timestamptz ELSE NULL END,
                       CASE WHEN $3::text = 'read' THEN $8::timestamptz ELSE NULL END,
                       CASE WHEN $3::text = 'failed' THEN $8::timestamptz ELSE NULL END,
                       CURRENT_TIMESTAMP
                     )
                     ON CONFLICT (wamid) DO NOTHING`,
                    [
                      wamid,
                      recipientPhone,
                      statusVal,
                      errCode,
                      errMsg,
                      errSubcode,
                      JSON.stringify([st]),
                      timestamp,
                    ]
                  );
                }
              } catch (logErr) {
                console.warn('[whatsappController] Failed to update whatsapp_message_logs:', logErr.message);
              }

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
                  const failMsg = errMsg || 'Meta delivery failed';
                  const failCode = errCode || 'META_DELIVERY_FAILURE';
                  await query(
                    `UPDATE campaign_recipients
                     SET status = 'failed',
                         failed_at = COALESCE(failed_at, $1),
                         error_message = $2,
                         error_code = $3,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $4`,
                    [timestamp, failMsg, failCode, rcp.id]
                  );
                }

                // Recalculate campaign statistics in real-time
                const statsRes = await query(
                  `SELECT
                     COUNT(*) as total,
                     COUNT(*) FILTER (WHERE status IN ('pending', 'processing')) as pending,
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
      }

      res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
      console.error('[WhatsApp Webhook Error]:', error);
      res.status(200).send('EVENT_RECEIVED'); // Always acknowledge Meta webhooks with 200
    }
  },

  // GET /api/whatsapp/message-status/:wamid or /api/campaigns/message-status/:wamid
  getMessageStatus: async (req, res, next) => {
    try {
      const { wamid } = req.params;
      if (!wamid) {
        return res.status(400).json({ success: false, error: 'wamid parameter is required' });
      }

      const result = await query(
        `SELECT id, wamid, recipient_phone, template_name, template_language, sender_phone_id,
                status, error_code, error_message, error_subcode, accepted_at, sent_at, delivered_at,
                read_at, failed_at, updated_at
         FROM whatsapp_message_logs
         WHERE wamid = $1 LIMIT 1`,
        [wamid]
      );

      if (result.rows.length === 0) {
        // Also fallback check in campaign_recipients
        const rcp = await query(
          'SELECT meta_message_id as wamid, phone as recipient_phone, status, error_message, error_code, sent_at, delivered_at, read_at, failed_at FROM campaign_recipients WHERE meta_message_id = $1 LIMIT 1',
          [wamid]
        );
        if (rcp.rows.length > 0) {
          return res.json({ success: true, data: rcp.rows[0] });
        }
        return res.status(404).json({ success: false, error: 'Message WAMID record not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
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
