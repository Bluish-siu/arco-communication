import crypto from 'crypto';
import { db, query } from '../config/db.js';
import { evaluateAssignmentInternal } from './chatAssignmentController.js';
import { campaignReplyFlowService } from '../services/campaignReplyFlowService.js';
import { workflowExecutionEngine } from '../services/workflowExecutionEngine.js';
import {
  metaWhatsAppService,
  normalizeRecipientPhone,
  isWhatsAppOpted,
  appendAppSecretProof,
} from '../services/metaWhatsAppService.js';
import { processCampaign } from '../services/campaignDispatcher.js';
import { parseMetaWebhookTimestamp, toUtcIsoString } from '../utils/dateUtils.js';
import { basicAutomationEngine } from '../services/basicAutomationEngine.js';
/**
 * Normalizes an incoming WhatsApp message payload to extract clean text,
 * type, and interactive details (button_reply, list_reply, template buttons).
 *
 * @param {Object} message - Raw Meta WhatsApp message payload
 * @returns {{ text: string, type: string, replyId: string|null }}
 */
export function normalizeWhatsAppInboundMessage(message) {
  if (!message || typeof message !== 'object') {
    return { text: '[Incoming Message]', type: 'text', replyId: null };
  }

  let messageText = '';
  let messageType = message.type || 'text';
  let replyId = null;
  let flowResponse = null;
  let flowToken = null;

  // 1. Text message
  if (message.text?.body && typeof message.text.body === 'string' && message.text.body.trim()) {
    messageText = message.text.body.trim();
    messageType = 'text';
  }
  // 2. Interactive message (button_reply, list_reply, nfm_reply)
  else if (message.interactive) {
    const inter = message.interactive;
    if (inter.button_reply) {
      messageText = (inter.button_reply.title || inter.button_reply.text || inter.button_reply.id || '').trim();
      replyId = inter.button_reply.id || null;
      messageType = 'button_reply';
    } else if (inter.list_reply) {
      messageText = (inter.list_reply.title || inter.list_reply.text || inter.list_reply.id || '').trim();
      replyId = inter.list_reply.id || null;
      messageType = 'list_reply';
    } else if (inter.type === 'button_reply' && (inter.button_reply?.title || inter.button_reply?.id)) {
      messageText = (inter.button_reply.title || inter.button_reply.id || '').trim();
      replyId = inter.button_reply.id || null;
      messageType = 'button_reply';
    } else if (inter.type === 'list_reply' && (inter.list_reply?.title || inter.list_reply?.id)) {
      messageText = (inter.list_reply.title || inter.list_reply.id || '').trim();
      replyId = inter.list_reply.id || null;
      messageType = 'list_reply';
    } else if (inter.nfm_reply?.response_json) {
      messageType = 'nfm_reply';
      try {
        flowResponse = typeof inter.nfm_reply.response_json === 'string'
          ? JSON.parse(inter.nfm_reply.response_json)
          : inter.nfm_reply.response_json;
        flowToken = flowResponse?.flow_token || null;

        if (flowResponse && typeof flowResponse === 'object') {
          const keys = Object.keys(flowResponse).filter((k) => !['flow_token'].includes(k));
          if (keys.length > 0) {
            const lines = keys.map((k) => `• ${k.replace(/_/g, ' ')}: ${flowResponse[k]}`);
            const title = flowResponse.screen ? `Flow Submission (${flowResponse.screen})` : 'Flow Submission';
            messageText = `📋 ${title}:\n${lines.join('\n')}`;
          } else {
            messageText = flowResponse.title || flowResponse.name || (flowResponse.screen ? `[Flow: ${flowResponse.screen}]` : '[Flow Response]');
          }
        } else {
          messageText = inter.nfm_reply.body || '[Flow Response]';
        }
      } catch {
        messageText = inter.nfm_reply?.body || '[Flow Response]';
      }
    } else if (inter.title && typeof inter.title === 'string') {
      messageText = inter.title.trim();
      messageType = inter.type || 'interactive';
    } else if (inter.body?.text && typeof inter.body.text === 'string') {
      messageText = inter.body.text.trim();
      messageType = inter.type || 'interactive';
    } else {
      messageText = '[Interactive Reply]';
      messageType = 'interactive';
    }
  }
  // 3. Quick Reply button from template (e.g. "Book A Demo")
  else if (message.button || message.button_reply || message.type === 'button') {
    const btn = message.button || message.button_reply || {};
    const btnText = typeof btn === 'string'
      ? btn
      : (btn.text || btn.payload || btn.title || '');
    messageText = String(btnText).trim();
    replyId = (typeof btn === 'object' ? btn.payload : null) || null;
    messageType = 'button_reply';
    if (!messageText) {
      messageText = '[Button Reply]';
    }
  }
  // 4. Reactions
  else if (message.reaction || message.type === 'reaction') {
    const emoji = message.reaction?.emoji || '';
    messageText = emoji ? `Reacted ${emoji}` : '[Reaction]';
    messageType = 'reaction';
  }
  // 5. Stickers
  else if (message.sticker || message.type === 'sticker') {
    messageText = '[Sticker]';
    messageType = 'sticker';
  }
  // 6. Meta Unsupported Type / Unknown payload
  else if (message.type === 'unsupported') {
    const errTitle = message.errors?.[0]?.title || message.errors?.[0]?.message || null;
    const unsupType = message.unsupported?.type || null;
    messageText = errTitle
      ? `[${errTitle}]`
      : (unsupType ? `[Unsupported: ${unsupType}]` : '[Unsupported message format]');
    messageType = 'unsupported';
  }
  // 7. Media & other types
  else if (message.image) {
    messageText = message.image.caption || '[Image]';
    messageType = 'image';
  } else if (message.document) {
    messageText = message.document.filename || message.document.caption || '[Document]';
    messageType = 'document';
  } else if (message.audio) {
    messageText = message.audio.voice ? '[Voice message]' : '[Audio message]';
    messageType = 'audio';
  } else if (message.video) {
    messageText = message.video.caption || '[Video]';
    messageType = 'video';
  } else if (message.location) {
    messageText = `[Location: ${message.location.latitude}, ${message.location.longitude}]`;
    messageType = 'location';
  } else if (message.contacts && Array.isArray(message.contacts) && message.contacts.length > 0) {
    const cName = message.contacts[0]?.name?.formatted_name || 'Contact Card';
    messageText = `[Contact: ${cName}]`;
    messageType = 'contacts';
  } else {
    // Specific type-aware fallback rather than generic [Message]
    messageText = messageType && messageType !== 'text'
      ? `[${messageType.replace(/_/g, ' ')}]`
      : '[Incoming Message]';
  }

  return {
    text: messageText || '[Incoming Message]',
    type: messageType,
    replyId,
    flowResponse,
    flowToken,
  };
}

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

  // POST /api/whatsapp/webhook Signature Verification (X-Hub-Signature-256)
  verifyWebhookSignature: (req, res, next) => {
    try {
      const signatureHeader = req.headers['x-hub-signature-256'] || req.headers['X-Hub-Signature-256'];
      if (!signatureHeader || typeof signatureHeader !== 'string') {
        return res.status(401).json({
          success: false,
          error: 'Missing X-Hub-Signature-256 signature header',
        });
      }

      const appSecret = process.env.META_APP_SECRET;
      if (!appSecret) {
        console.error('[Meta Webhook] Signature verification failed: META_APP_SECRET is not configured on server');
        return res.status(500).json({
          success: false,
          error: 'Webhook verification secret is not configured on server',
        });
      }

      const parts = signatureHeader.split('=');
      if (parts.length !== 2 || parts[0].toLowerCase() !== 'sha256') {
        return res.status(401).json({
          success: false,
          error: 'Invalid X-Hub-Signature-256 format. Expected sha256=<hash>',
        });
      }

      const signatureHash = parts[1].trim();

      // Ensure raw request body is used for signature calculation before JSON parsing alterations
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

      const expectedHash = crypto
        .createHmac('sha256', appSecret)
        .update(rawPayload)
        .digest('hex');

      const sigBuffer = Buffer.from(signatureHash, 'utf8');
      const expBuffer = Buffer.from(expectedHash, 'utf8');

      if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
        // Safe logging: do NOT log META_APP_SECRET or complete webhook signature
        const masked = signatureHash.length > 8
          ? `${signatureHash.slice(0, 4)}...${signatureHash.slice(-4)}`
          : '***';
        console.warn(`[Meta Webhook] Signature mismatch. Provided prefix: ${masked}`);
        return res.status(401).json({
          success: false,
          error: 'Invalid webhook signature',
        });
      }

      next();
    } catch (err) {
      console.error('[Meta Webhook] Signature verification error:', err.message);
      return res.status(401).json({
        success: false,
        error: 'Webhook signature verification failed',
      });
    }
  },

  // Alias for flexible route wiring
  verifySignature: function (req, res, next) {
    return this.verifyWebhookSignature(req, res, next);
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

      // Standard Meta WhatsApp Webhook payload format (supporting multi-entry batches)
      const rawEntries = Array.isArray(body?.entry) ? body.entry : (body?.entry ? [body.entry] : []);

      for (const entry of rawEntries) {
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
              const cleanDigits = String(fromRaw).replace(/\D/g, '');
              const clean10 = cleanDigits.slice(-10);
              const senderProfileName =
                change?.contacts?.find((c) => c.wa_id === fromRaw)?.profile?.name ||
                change?.contacts?.[0]?.profile?.name ||
                null;
              const timestamp = parseMetaWebhookTimestamp(message.timestamp);

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
                `SELECT * FROM contacts
                 WHERE phone = $1
                    OR phone = $2
                    OR regexp_replace(phone, '[^0-9]', '', 'g') LIKE '%' || $3
                 LIMIT 1`,
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
                `SELECT * FROM conversations
                 WHERE (phone = $1 OR phone = $2 OR regexp_replace(phone, '[^0-9]', '', 'g') LIKE '%' || $3)
                   AND channel = 'whatsapp'
                 LIMIT 1`,
                [fromPhone, fromRaw, clean10]
              );

            const timeIso = timestamp.toISOString();
            const isNewConversation = convRes.rows.length === 0;
            const previousLastInbound = convRes.rows.length > 0 ? convRes.rows[0].last_inbound_at : null;

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

            // C. Extract message text and type (supporting text, interactive button/list replies, quick replies)
            const normalizedMsg = normalizeWhatsAppInboundMessage(message);
            const messageText = normalizedMsg.text;
            const messageType = normalizedMsg.type;

            // D. Persist into messages table
            const newMsgId = `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            await query(
              `INSERT INTO messages (
                 id, conversation_id, sender, text, time, timestamp, meta_message_id,
                 status, error_message, message_type, created_at
               ) VALUES (
                 $1, $2, 'contact', $3, $4, $5, $6,
                 'delivered', NULL, $7, $8
               )`,
              [
                newMsgId,
                conv.id,
                messageText,
                timeIso,
                timestamp,
                messageId,
                messageType,
                timestamp,
              ]
            );

            // D2. Persist Flow submission if messageType is 'nfm_reply'
            if (messageType === 'nfm_reply' && normalizedMsg.flowResponse) {
              try {
                const flowResp = normalizedMsg.flowResponse;
                const flowToken = normalizedMsg.flowToken || flowResp.flow_token || null;
                const flowId = flowResp.flow_id || null;
                const tenantUserId = contact?.user_id || 'usr_1';

                // 1. Record into whatsapp_form_responses
                const respId = `resp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                await query(
                  `INSERT INTO whatsapp_form_responses (
                     id, user_id, form_id, meta_flow_id, flow_token, contact_name, contact_phone,
                     answers, raw_submission, meta_message_id, status, created_at
                   ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'submitted', CURRENT_TIMESTAMP)`,
                  [
                    respId,
                    tenantUserId,
                    flowId || flowToken || 'meta_flow',
                    flowId,
                    flowToken,
                    contact?.name || senderProfileName || fromPhone,
                    fromPhone,
                    JSON.stringify(flowResp),
                    JSON.stringify(message.interactive?.nfm_reply || {}),
                    messageId,
                  ]
                );

                // 2. Increment response_count in whatsapp_forms if matching form exists
                if (flowId) {
                  await query(
                    `UPDATE whatsapp_forms
                     SET response_count = COALESCE(response_count, 0) + 1, updated_at = CURRENT_TIMESTAMP
                     WHERE (meta_flow_id = $1 OR form_id = $1) AND user_id = $2`,
                    [String(flowId), tenantUserId]
                  );
                }

                // 3. Update contact attributes / email / name if submitted
                if (contact) {
                  const customAttrs = { ...(contact.custom_attributes || {}) };
                  let contactUpdated = false;
                  let newEmail = contact.email || '';
                  let newName = contact.name || '';

                  for (const [key, val] of Object.entries(flowResp)) {
                    if (['flow_token', 'screen'].includes(key)) continue;
                    customAttrs[key] = val;
                    contactUpdated = true;

                    const lKey = key.toLowerCase();
                    if ((lKey.includes('email') || lKey === 'email_address') && (!newEmail || newEmail === '')) {
                      if (typeof val === 'string' && val.includes('@')) newEmail = val.trim();
                    }
                    if ((lKey.includes('name') || lKey === 'full_name' || lKey === 'client_name') && (!newName || newName === fromPhone || newName.startsWith('WhatsApp User'))) {
                      if (typeof val === 'string' && val.trim()) newName = val.trim();
                    }
                  }

                  if (contactUpdated) {
                    await query(
                      `UPDATE contacts
                       SET custom_attributes = $1,
                           name = COALESCE(NULLIF($2, ''), name),
                           email = COALESCE(NULLIF($3, ''), email),
                           updated_at = CURRENT_TIMESTAMP
                       WHERE id = $4`,
                      [JSON.stringify(customAttrs), newName, newEmail, contact.id]
                    );
                    contact.custom_attributes = customAttrs;
                    if (newName) contact.name = newName;
                    if (newEmail) contact.email = newEmail;
                  }
                }

                console.log(`[WhatsApp Webhook] Flow submission recorded for ${fromPhone} (flowToken: ${flowToken})`);
              } catch (respErr) {
                console.warn('[WhatsApp Webhook] Error recording Flow submission:', respErr.message);
              }
            }

            // E. Post-Campaign Reply Flow Evaluation
            let postCampaignHandled = false;
            try {
              const flowResult = await campaignReplyFlowService.handleInboundInteraction({
                message,
                contact,
                conv,
                fromPhone,
                clean10,
              });
              if (flowResult?.handled) {
                postCampaignHandled = true;
                console.log(`[WhatsApp Webhook] Post-Campaign reply flow executed successfully:`, flowResult);
              }
            } catch (flowErr) {
              console.warn('[WhatsApp Webhook] Post-Campaign reply flow error:', flowErr.message);
            }

            // F. Inbound WhatsApp Workflow Engine Evaluation (if not handled by campaign reply flow)
            if (!postCampaignHandled) {
              try {
                const wfResult = await workflowExecutionEngine.evaluateInboundWhatsAppMessage({
                  message,
                  contact,
                  conv,
                  fromPhone,
                  clean10,
                  text: messageText,
                });
                if (wfResult?.handled) {
                  console.log(`[WhatsApp Webhook] Inbound workflow executed successfully:`, wfResult);
                }
              } catch (wfErr) {
                console.warn('[WhatsApp Webhook] Inbound workflow evaluation error:', wfErr.message);
              }
            }

            // G. Retain checkout bot session handling if active
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

            // H. Basic Automations (Working Hours, Out of Office, Welcome, Delayed Response)
            try {
              await basicAutomationEngine.handleInboundMessage({
                phoneNumberId: change?.metadata?.phone_number_id || null,
                wabaId: entry?.id || null,
                contact,
                conv,
                isNewConversation,
                previousLastInbound,
                messageText,
                triggeringWamid: messageId,
                fromPhone,
                clean10,
                referenceDate: timestamp || new Date(),
                postCampaignHandled,
                workflowHandled: wfResult?.handled,
              });
            } catch (autoErr) {
              console.warn('[WhatsApp Webhook] Basic Automation evaluation warning:', autoErr.message);
            }
          }
        }

        // 2. Handle Meta WhatsApp Status Updates (sent, delivered, read, failed)
        const statuses = change?.statuses;
        if (Array.isArray(statuses) && statuses.length > 0) {
          for (const st of statuses) {
            const wamid = st.id;
            const statusVal = st.status; // 'sent' | 'delivered' | 'read' | 'failed'
            const timestamp = parseMetaWebhookTimestamp(st.timestamp);
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

  // GET /api/whatsapp/flows/:flowId
  getFlow: async (req, res, next) => {
    try {
      const { flowId } = req.params;
      const userId = req.user?.id || 'usr_1';

      if (!flowId) {
        return res.status(400).json({ success: false, error: 'Flow ID is required' });
      }

      // Query Meta Graph API via metaWhatsAppService
      const metaResult = await metaWhatsAppService.getFlow(flowId, userId);

      // Also check local database whatsapp_forms for cached/existing form
      const localForm = await query(
        `SELECT * FROM whatsapp_forms 
         WHERE (id = $1 OR meta_flow_id = $1 OR form_id = $1 OR form_id = $2) 
           AND user_id = $3 
         LIMIT 1`,
        [String(flowId), `flow_${flowId}`, userId]
      );

      // If Meta returned flow details, sync into local DB whatsapp_forms idempotently
      if (metaResult.success) {
        const flowData = metaResult;
        const targetId = localForm.rows.length > 0 ? localForm.rows[0].id : String(flowData.flowId);

        await query(
          `INSERT INTO whatsapp_forms (
             id, user_id, title, description, form_id, meta_flow_id, status,
             categories, validation_errors, json_version, data_api_version, endpoint_uri,
             created_at, updated_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE
           SET title = COALESCE(NULLIF(EXCLUDED.title, ''), whatsapp_forms.title),
               status = EXCLUDED.status,
               categories = EXCLUDED.categories,
               validation_errors = EXCLUDED.validation_errors,
               json_version = EXCLUDED.json_version,
               data_api_version = EXCLUDED.data_api_version,
               endpoint_uri = EXCLUDED.endpoint_uri,
               meta_flow_id = EXCLUDED.meta_flow_id,
               updated_at = CURRENT_TIMESTAMP
           WHERE whatsapp_forms.user_id = EXCLUDED.user_id`,
          [
            targetId,
            userId,
            flowData.name || 'WhatsApp Flow',
            `Meta Flow ${flowData.flowId}`,
            `flow_${flowData.flowId}`,
            String(flowData.flowId),
            (flowData.status || 'published').toLowerCase(),
            JSON.stringify(flowData.categories || []),
            JSON.stringify(flowData.validationErrors || []),
            flowData.jsonVersion,
            flowData.dataApiVersion,
            flowData.endpointUri,
          ]
        );
      }

      // Re-query fresh local form state
      const refreshedForm = await query(
        `SELECT * FROM whatsapp_forms 
         WHERE (id = $1 OR meta_flow_id = $1 OR form_id = $1 OR form_id = $2) 
           AND user_id = $3 
         LIMIT 1`,
        [String(flowId), `flow_${flowId}`, userId]
      );

      res.json({
        success: metaResult.success,
        data: metaResult.success ? metaResult : refreshedForm.rows[0] || null,
        error: metaResult.error || null,
        errorCode: metaResult.errorCode || null,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/whatsapp/send-flow
  sendFlow: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const {
        recipientPhone,
        flowId,
        ctaText = 'Open',
        headerText,
        bodyText,
        footerText,
        screen,
        data,
        flowToken,
        mode,
      } = req.body;

      if (!recipientPhone || !flowId) {
        return res.status(400).json({
          success: false,
          error: 'recipientPhone and flowId are required',
        });
      }

      // Tenant isolation: If this flow exists in whatsapp_forms, ensure it belongs to this tenant
      const existingForm = await query(
        `SELECT id, user_id, meta_flow_id, title FROM whatsapp_forms WHERE (meta_flow_id = $1 OR form_id = $1) LIMIT 1`,
        [String(flowId)]
      );
      if (existingForm.rows.length > 0 && existingForm.rows[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Flow belongs to another tenant',
        });
      }

      const dispatchResult = await metaWhatsAppService.sendFlowMessage({
        to: recipientPhone,
        flowId,
        ctaText,
        headerText,
        bodyText,
        footerText,
        screen,
        data,
        flowToken,
        mode,
        userId,
      });

      if (!dispatchResult.success) {
        return res.status(dispatchResult.errorCode === 190 ? 401 : 400).json(dispatchResult);
      }

      res.json({ success: true, data: dispatchResult });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/whatsapp/flows
  getFlows: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { search, status } = req.query;

      // 1. Fetch live flows from connected Meta WABA
      const creds = await metaWhatsAppService.getCredentials(userId);
      let metaFlows = [];
      if (creds.isConfigured && creds.wabaId) {
        try {
          const rawWabaFlowsUrl = `https://graph.facebook.com/${creds.version}/${creds.wabaId}/flows`;
          const wabaFlowsUrl = appendAppSecretProof(rawWabaFlowsUrl, creds.accessToken);
          const wabaFlowsResp = await fetch(wabaFlowsUrl, {
            headers: { Authorization: `Bearer ${creds.accessToken}` },
          });
          const wabaFlowsData = await wabaFlowsResp.json();
          if (Array.isArray(wabaFlowsData.data)) {
            metaFlows = wabaFlowsData.data;
          }
        } catch (wabaErr) {
          console.warn('[whatsappController] Could not fetch live WABA flows:', wabaErr.message);
        }
      }

      // 2. Query local whatsapp_forms for this tenant
      const localFormsRes = await query(
        `SELECT * FROM whatsapp_forms WHERE user_id = $1 ORDER BY updated_at DESC`,
        [userId]
      );

      // 3. Merge/Sync live Meta flows with local database records idempotently
      for (const mf of metaFlows) {
        if (!mf || !mf.id) continue;
        const flowId = String(mf.id);
        const normStatus = (mf.status || 'published').toLowerCase();
        const flowTitle = mf.name || 'ARCO Flow';
        const catsJson = JSON.stringify(mf.categories || []);
        const errsJson = JSON.stringify(mf.validation_errors || []);

        // Check if this tenant already has a record for this flow
        const existing = localFormsRes.rows.find(
          (r) =>
            String(r.id) === flowId ||
            String(r.meta_flow_id) === flowId ||
            String(r.form_id) === flowId ||
            String(r.form_id) === `flow_${flowId}`
        );

        if (existing) {
          // Idempotent UPDATE: update existing record in place
          await query(
            `UPDATE whatsapp_forms
             SET title = COALESCE(NULLIF($1, ''), title),
                 status = $2,
                 categories = $3,
                 validation_errors = $4,
                 meta_flow_id = $5,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 AND user_id = $7`,
            [
              flowTitle,
              normStatus,
              catsJson,
              errsJson,
              flowId,
              existing.id,
              userId,
            ]
          );
        } else {
          // Check if a global record exists for another tenant to preserve isolation
          const globalCheck = await query(
            `SELECT id, user_id FROM whatsapp_forms WHERE id = $1 OR meta_flow_id = $1 OR form_id = $1 OR form_id = $2 LIMIT 1`,
            [flowId, `flow_${flowId}`]
          );

          if (globalCheck.rows.length > 0 && globalCheck.rows[0].user_id === userId) {
            // Already exists for this tenant
            await query(
              `UPDATE whatsapp_forms
               SET title = COALESCE(NULLIF($1, ''), title),
                   status = $2,
                   categories = $3,
                   validation_errors = $4,
                   meta_flow_id = $5,
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = $6 AND user_id = $7`,
              [
                flowTitle,
                normStatus,
                catsJson,
                errsJson,
                flowId,
                globalCheck.rows[0].id,
                userId,
              ]
            );
          } else if (globalCheck.rows.length > 0 && globalCheck.rows[0].user_id !== userId) {
            // Belongs to a different tenant! Preserve tenant isolation:
            // Do NOT overwrite other tenant's record; scope tenant identifier
            const scopedId = `${userId}_${flowId}`;
            const scopedFormId = `flow_${userId}_${flowId}`;
            await query(
              `INSERT INTO whatsapp_forms (
                 id, user_id, title, description, form_id, meta_flow_id, status,
                 categories, validation_errors, created_at, updated_at
               ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
               ON CONFLICT (id) DO UPDATE
               SET title = EXCLUDED.title,
                   status = EXCLUDED.status,
                   categories = EXCLUDED.categories,
                   validation_errors = EXCLUDED.validation_errors,
                   meta_flow_id = EXCLUDED.meta_flow_id,
                   updated_at = CURRENT_TIMESTAMP
               WHERE whatsapp_forms.user_id = EXCLUDED.user_id`,
              [
                scopedId,
                userId,
                flowTitle,
                `Meta WhatsApp Flow (${flowId})`,
                scopedFormId,
                flowId,
                normStatus,
                catsJson,
                errsJson,
              ]
            );
          } else {
            // Brand new record: use the real Meta Flow ID as ID (requirement 8)
            // Use ON CONFLICT (id) DO UPDATE to prevent duplicate key race conditions
            await query(
              `INSERT INTO whatsapp_forms (
                 id, user_id, title, description, form_id, meta_flow_id, status,
                 categories, validation_errors, created_at, updated_at
               ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
               ON CONFLICT (id) DO UPDATE
               SET title = EXCLUDED.title,
                   status = EXCLUDED.status,
                   categories = EXCLUDED.categories,
                   validation_errors = EXCLUDED.validation_errors,
                   meta_flow_id = EXCLUDED.meta_flow_id,
                   updated_at = CURRENT_TIMESTAMP
               WHERE whatsapp_forms.user_id = EXCLUDED.user_id`,
              [
                flowId,
                userId,
                flowTitle,
                `Meta WhatsApp Flow (${flowId})`,
                `flow_${flowId}`,
                flowId,
                normStatus,
                catsJson,
                errsJson,
              ]
            );
          }
        }
      }

      // 4. Query fresh synced forms from database for this tenant
      const freshFormsRes = await query(
        `SELECT * FROM whatsapp_forms WHERE user_id = $1 ORDER BY updated_at DESC`,
        [userId]
      );

      // 5. Format flows response
      let flows = freshFormsRes.rows.map((row) => {
        const rawCats = Array.isArray(row.categories)
          ? row.categories
          : (typeof row.categories === 'string' ? JSON.parse(row.categories || '[]') : []);
        const catStr = rawCats.length > 0 ? rawCats.join(', ') : 'Lead Generation';
        return {
          id: row.id,
          name: row.title,
          title: row.title,
          category: catStr.replace(/_/g, ' '),
          categories: rawCats,
          status: (row.status || 'published').toLowerCase(),
          metaFlowId: row.meta_flow_id || (row.form_id?.startsWith('flow_') ? row.form_id.replace('flow_', '') : row.form_id),
          formId: row.form_id,
          responseCount: row.response_count || 0,
          validationErrors: row.validation_errors || [],
          jsonVersion: row.json_version || '7.3',
          endpointUri: row.endpoint_uri || null,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      });

      // Filter by search & status
      if (search && search.trim()) {
        const s = search.trim().toLowerCase();
        flows = flows.filter(
          (f) =>
            f.name.toLowerCase().includes(s) ||
            f.category.toLowerCase().includes(s) ||
            (f.metaFlowId && f.metaFlowId.toLowerCase().includes(s))
        );
      }

      if (status && status !== 'all') {
        flows = flows.filter((f) => f.status === status.toLowerCase());
      }

      res.json({ success: true, count: flows.length, data: flows });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/whatsapp/flows
  createFlow: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { name, category = 'LEAD_GENERATION' } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Flow name is required' });
      }

      const creds = await metaWhatsAppService.getCredentials(userId);
      let metaFlowId = null;
      let flowStatus = 'draft';

      // Attempt to register/create Flow in Meta WABA if connected
      if (creds.isConfigured && creds.wabaId) {
        try {
          const rawCreateUrl = `https://graph.facebook.com/${creds.version}/${creds.wabaId}/flows`;
          const createUrl = appendAppSecretProof(rawCreateUrl, creds.accessToken);
          const resp = await fetch(createUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${creds.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: name.trim(),
              categories: [category.toUpperCase()],
            }),
          });
          const metaData = await resp.json();
          if (metaData.id) {
            metaFlowId = String(metaData.id);
            flowStatus = 'draft';
          } else if (metaData.error) {
            console.warn('[whatsappController] Meta Flow creation API returned error:', metaData.error.message);
          }
        } catch (metaErr) {
          console.warn('[whatsappController] Meta Flow creation network error:', metaErr.message);
        }
      }

      // Save into whatsapp_forms table using real Meta Flow ID if available
      const targetId = metaFlowId ? String(metaFlowId) : `wf_${Date.now()}`;
      const uniqueFormCode = metaFlowId ? `flow_${metaFlowId}` : `wf_${Date.now()}`;

      await query(
        `INSERT INTO whatsapp_forms (
           id, user_id, title, description, form_id, meta_flow_id, status,
           categories, validation_errors, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE
         SET title = EXCLUDED.title,
             status = EXCLUDED.status,
             categories = EXCLUDED.categories,
             meta_flow_id = EXCLUDED.meta_flow_id,
             updated_at = CURRENT_TIMESTAMP
         WHERE whatsapp_forms.user_id = EXCLUDED.user_id`,
        [
          targetId,
          userId,
          name.trim(),
          `Flow ${name.trim()}`,
          uniqueFormCode,
          metaFlowId,
          flowStatus,
          JSON.stringify([category]),
          JSON.stringify([]),
        ]
      );

      res.status(201).json({
        success: true,
        data: {
          id: targetId,
          name: name.trim(),
          category,
          status: flowStatus,
          metaFlowId,
          formId: uniqueFormCode,
        },
      });
    } catch (error) {
      next(error);
    }
  },


  // POST /api/whatsapp/send-flow-bulk (Creates and queues bulk Flow broadcast)
  sendFlowBulk: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const {
        name,
        flowId,
        ctaText = 'Give Feedback',
        headerText,
        bodyText = 'Please complete our quick form',
        footerText,
        screen,
        csvContacts = [],
        recipients = [],
        variableMapping = {},
        scheduledFor,
        scheduleTimezone = 'Asia/Kolkata',
        whatsappOptedOnly = true,
        status = 'Scheduled',
      } = req.body;

      const broadcastName = (name && name.trim()) || `Flow Broadcast - ${new Date().toLocaleDateString()}`;

      if (!flowId) {
        return res.status(400).json({ success: false, error: 'Meta Flow ID (flowId) is required' });
      }

      // 1. Tenant isolation & Flow validation
      const existingForm = await query(
        `SELECT id, user_id, meta_flow_id, title, status FROM whatsapp_forms WHERE (meta_flow_id = $1 OR form_id = $1) LIMIT 1`,
        [String(flowId)]
      );

      if (existingForm.rows.length > 0 && existingForm.rows[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Selected Flow does not belong to your tenant account',
        });
      }

      // Verify Flow status with Meta if possible
      let flowTitle = existingForm.rows[0]?.title || 'ARCO Flow';
      let flowStatus = existingForm.rows[0]?.status || 'published';
      try {
        const metaFlowRes = await metaWhatsAppService.getFlow(flowId);
        if (metaFlowRes.success) {
          flowTitle = metaFlowRes.name || flowTitle;
          flowStatus = (metaFlowRes.status || 'published').toLowerCase();
          if (flowStatus !== 'published') {
            return res.status(400).json({
              success: false,
              error: `Flow "${flowTitle}" is currently in ${flowStatus.toUpperCase()} status. Only PUBLISHED flows can be broadcast.`,
            });
          }
        }
      } catch (checkErr) {
        console.warn('[whatsappController] Could not verify flow with Meta API:', checkErr.message);
      }

      // 2. Process & deduplicate recipient audience
      const rawContacts = Array.isArray(csvContacts) && csvContacts.length > 0
        ? csvContacts
        : (Array.isArray(recipients) && recipients.length > 0 ? recipients : []);

      const seenPhones = new Set();
      const eligibleRecipients = [];

      rawContacts.forEach((row, idx) => {
        const rawOpted = row.whatsappOpted ?? row.whatsapp_opted ?? row['WhatsApp Opted'] ?? row['whatsapp opted'] ?? true;
        const optedIn = isWhatsAppOpted(rawOpted);

        if (whatsappOptedOnly && !optedIn) return;

        const phoneNorm = normalizeRecipientPhone({
          fullPhone: row.fullPhone || row.full_phone || row['Full Phone Number'] || row['Full Phone'],
          phone: row.phone || row.phoneNumber || row['Phone Number'] || row.phone_number,
          countryCode: row.countryCode || row.country_code || row['Country Code'] || '91',
        });

        if (!phoneNorm.isValid || !phoneNorm.normalizedPhone) return;

        if (seenPhones.has(phoneNorm.normalizedPhone)) return;
        seenPhones.add(phoneNorm.normalizedPhone);

        const recipientName = row.name || row.Name || row['Full Name'] || 'Customer';
        const recipientEmail = row.email || row.Email || null;
        const countryCode = row.countryCode || row.country_code || row['Country Code'] || '91';

        eligibleRecipients.push({
          id: `rcp_flow_${Date.now()}_${idx}`,
          name: recipientName,
          phone: phoneNorm.normalizedPhone,
          email: recipientEmail,
          countryCode,
          whatsappOpted: optedIn,
          csvData: row.csvData || { ...row },
        });
      });

      if (status !== 'Draft' && eligibleRecipients.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid recipient phone numbers found in audience. Please check phone number formats.',
        });
      }

      const campaignId = `cmp_flow_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const campaignStatus = status === 'Draft' ? 'Draft' : 'Scheduled';
      const scheduledTimestamp = scheduledFor
        ? new Date(scheduledFor).toISOString()
        : new Date().toISOString();

      const templatePayload = {
        flow_id: String(flowId).trim(),
        flowId: String(flowId).trim(),
        cta_text: (ctaText || 'Give Feedback').trim().slice(0, 20),
        header_text: headerText ? headerText.trim().slice(0, 60) : null,
        body_text: (bodyText || 'Please complete our quick form').trim().slice(0, 1024),
        footer_text: footerText ? footerText.trim().slice(0, 60) : null,
        screen: screen || null,
      };

      // 3. Insert broadcast master record into campaigns
      await query(
        `INSERT INTO campaigns (
           id, name, description, channel, type, category, status, recipients, delivered, read, replied,
           scheduled_for, schedule_timezone, audience_type, audience_filter, template_id, template_name,
           template_language, template_category, template_payload, variable_mapping, recurring_config,
           post_campaign_reply_flows, created_by, created_at, updated_at
         ) VALUES ($1, $2, $3, 'whatsapp_flow', 'flow_broadcast', 'Marketing', $4, $5, 0, 0, 0, $6, $7, 'csv', $8, $9, $10, 'en_US', 'FLOW', $11, $12, '{}'::jsonb, '{}'::jsonb, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          campaignId,
          broadcastName,
          `Flow Broadcast (${flowTitle})`,
          campaignStatus,
          eligibleRecipients.length,
          scheduledTimestamp,
          scheduleTimezone,
          JSON.stringify({ whatsappOptedOnly, flowId }),
          String(flowId),
          flowTitle,
          JSON.stringify(templatePayload),
          JSON.stringify(variableMapping || {}),
          req.user?.id || req.user?.name || 'Shraddha',
        ]
      );

      // 4. Bulk insert recipients into campaign_recipients in chunks of 100
      if (eligibleRecipients.length > 0) {
        const batchChunkSize = 100;
        for (let i = 0; i < eligibleRecipients.length; i += batchChunkSize) {
          const chunk = eligibleRecipients.slice(i, i + batchChunkSize);
          const batchNum = Math.floor(i / batchChunkSize) + 1;
          const placeholders = [];
          const values = [];

          chunk.forEach((c, idx) => {
            const offset = idx * 10;
            placeholders.push(
              `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10})`
            );
            values.push(
              `rcp_${campaignId}_${i + idx}`,
              campaignId,
              null,
              c.name,
              c.phone,
              c.email || '',
              c.countryCode || '91',
              c.whatsappOpted,
              JSON.stringify(c.csvData || {}),
              batchNum
            );
          });

          await query(
            `INSERT INTO campaign_recipients (
               id, campaign_id, contact_id, name, phone, email, country_code, whatsapp_opted, csv_data, batch_number
             ) VALUES ${placeholders.join(', ')}
             ON CONFLICT (id) DO NOTHING`,
            values
          );
        }
      }

      // 5. Trigger dispatch if scheduled for now and not draft
      const shouldSendImmediately =
        campaignStatus !== 'Draft' &&
        new Date(scheduledTimestamp).getTime() <= Date.now() + 60000;

      if (shouldSendImmediately && eligibleRecipients.length > 0) {
        processCampaign(campaignId).catch((procErr) => {
          console.error(`[whatsappController] Background dispatch failed for ${campaignId}:`, procErr);
        });
      }

      res.status(201).json({
        success: true,
        broadcastId: campaignId,
        totalRecipients: eligibleRecipients.length,
        message: campaignStatus === 'Draft'
          ? 'Flow broadcast saved as draft'
          : (shouldSendImmediately ? 'Flow broadcast launched live' : 'Flow broadcast scheduled successfully'),
        data: {
          id: campaignId,
          broadcastId: campaignId,
          name: broadcastName,
          flowId,
          flowTitle,
          status: shouldSendImmediately ? 'Sending' : campaignStatus,
          recipients: eligibleRecipients.length,
          totalRecipients: eligibleRecipients.length,
          scheduledFor: scheduledTimestamp,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/whatsapp/flow-broadcasts (List all Flow broadcasts for tenant)
  getFlowBroadcasts: async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const params = [];
      let whereClause = `WHERE (c.channel = 'whatsapp_flow' OR c.type = 'flow_broadcast')`;
      if (userId) {
        params.push(userId);
        whereClause += ` AND c.created_by = $${params.length}`;
      }

      const sql = `
        SELECT
          c.*,
          COALESCE(r.total_recs, c.recipients) as calculated_recipients,
          COALESCE(r.sent_recs, 0) as calculated_sent,
          COALESCE(r.delivered_recs, c.delivered) as calculated_delivered,
          COALESCE(r.read_recs, c.read) as calculated_read,
          COALESCE(r.replied_recs, c.replied) as calculated_replied,
          COALESCE(r.failed_recs, c.failure_count) as calculated_failed
        FROM campaigns c
        LEFT JOIN (
          SELECT
            campaign_id,
            COUNT(*) as total_recs,
            COUNT(*) FILTER (WHERE status = 'sent') as sent_recs,
            COUNT(*) FILTER (WHERE status IN ('delivered', 'read', 'replied') OR delivered_at IS NOT NULL) as delivered_recs,
            COUNT(*) FILTER (WHERE status IN ('read', 'replied') OR read_at IS NOT NULL) as read_recs,
            COUNT(*) FILTER (WHERE status = 'replied') as replied_recs,
            COUNT(*) FILTER (WHERE status = 'failed') as failed_recs
          FROM campaign_recipients
          GROUP BY campaign_id
        ) r ON c.id = r.campaign_id
        ${whereClause}
        ORDER BY c.created_at DESC
      `;

      const result = await query(sql, params);
      const broadcasts = result.rows.map((row) => {
        const total = parseInt(row.calculated_recipients, 10) || 0;
        const sent = parseInt(row.calculated_sent, 10) || 0;
        const delivered = parseInt(row.calculated_delivered, 10) || 0;
        const read = parseInt(row.calculated_read, 10) || 0;
        const replied = parseInt(row.calculated_replied, 10) || 0;
        const failed = parseInt(row.calculated_failed, 10) || 0;

        const progressPercent = total > 0 ? Math.min(100, Math.round(((sent + delivered + read + failed) / total) * 100)) : 0;
        const payload = typeof row.template_payload === 'string' ? JSON.parse(row.template_payload || '{}') : (row.template_payload || {});

        return {
          id: row.id,
          name: row.name,
          flowId: row.template_id || payload.flow_id,
          flowTitle: row.template_name || 'ARCO Flow',
          status: row.status,
          recipients: total,
          sent,
          delivered,
          read,
          replied,
          failed,
          progressPercent,
          scheduledFor: row.scheduled_for ? toUtcIsoString(row.scheduled_for) : null,
          createdAt: row.created_at ? toUtcIsoString(row.created_at) : null,
          completedAt: row.completed_at ? toUtcIsoString(row.completed_at) : null,
        };
      });

      res.json({ success: true, count: broadcasts.length, data: broadcasts });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/whatsapp/flow-broadcasts/:id
  getFlowBroadcast: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const params = [id];
      let userFilter = '';
      if (userId) {
        params.push(userId);
        userFilter = ` AND c.created_by = $${params.length}`;
      }

      const sql = `
        SELECT
          c.*,
          COALESCE(r.total_recs, c.recipients) as calculated_recipients,
          COALESCE(r.sent_recs, 0) as calculated_sent,
          COALESCE(r.delivered_recs, c.delivered) as calculated_delivered,
          COALESCE(r.read_recs, c.read) as calculated_read,
          COALESCE(r.replied_recs, c.replied) as calculated_replied,
          COALESCE(r.failed_recs, c.failure_count) as calculated_failed,
          COALESCE(r.pending_recs, 0) as calculated_pending
        FROM campaigns c
        LEFT JOIN (
          SELECT
            campaign_id,
            COUNT(*) as total_recs,
            COUNT(*) FILTER (WHERE status = 'sent') as sent_recs,
            COUNT(*) FILTER (WHERE status IN ('delivered', 'read', 'replied') OR delivered_at IS NOT NULL) as delivered_recs,
            COUNT(*) FILTER (WHERE status IN ('read', 'replied') OR read_at IS NOT NULL) as read_recs,
            COUNT(*) FILTER (WHERE status = 'replied') as replied_recs,
            COUNT(*) FILTER (WHERE status = 'failed') as failed_recs,
            COUNT(*) FILTER (WHERE status = 'pending' OR status = 'queued') as pending_recs
          FROM campaign_recipients
          GROUP BY campaign_id
        ) r ON c.id = r.campaign_id
        WHERE c.id = $1 AND (c.channel = 'whatsapp_flow' OR c.type = 'flow_broadcast')${userFilter}
        LIMIT 1
      `;

      const result = await query(sql, params);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Flow broadcast not found' });
      }

      const row = result.rows[0];
      const total = parseInt(row.calculated_recipients, 10) || 0;
      const sent = parseInt(row.calculated_sent, 10) || 0;
      const delivered = parseInt(row.calculated_delivered, 10) || 0;
      const read = parseInt(row.calculated_read, 10) || 0;
      const replied = parseInt(row.calculated_replied, 10) || 0;
      const failed = parseInt(row.calculated_failed, 10) || 0;
      const pending = parseInt(row.calculated_pending, 10) || 0;

      const progressPercent = total > 0 ? Math.min(100, Math.round(((sent + delivered + read + failed) / total) * 100)) : 0;
      const deliveryRate = total > 0 ? Math.round(((delivered + read) / total) * 100) : 0;
      const readRate = delivered > 0 ? Math.round((read / delivered) * 100) : 0;
      const payload = typeof row.template_payload === 'string' ? JSON.parse(row.template_payload || '{}') : (row.template_payload || {});

      res.json({
        success: true,
        data: {
          id: row.id,
          name: row.name,
          flowId: row.template_id || payload.flow_id,
          flowTitle: row.template_name || 'ARCO Flow',
          status: row.status,
          recipients: total,
          sent,
          delivered,
          read,
          replied,
          failed,
          pending,
          progressPercent: `${progressPercent}%`,
          deliveryRate: `${deliveryRate}%`,
          readRate: `${readRate}%`,
          templatePayload: payload,
          variableMapping: typeof row.variable_mapping === 'string' ? JSON.parse(row.variable_mapping || '{}') : row.variable_mapping,
          scheduledFor: row.scheduled_for ? toUtcIsoString(row.scheduled_for) : null,
          createdAt: row.created_at ? toUtcIsoString(row.created_at) : null,
          sentAt: row.sent_at ? toUtcIsoString(row.sent_at) : null,
          completedAt: row.completed_at ? toUtcIsoString(row.completed_at) : null,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/whatsapp/flow-broadcasts/:id/recipients
  getFlowBroadcastRecipients: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const offset = (page - 1) * limit;
      const { status, search } = req.query;

      // Tenant isolation verification
      if (userId) {
        const campCheck = await query(`SELECT id, created_by FROM campaigns WHERE id = $1`, [id]);
        if (campCheck.rows.length === 0 || (campCheck.rows[0].created_by && campCheck.rows[0].created_by !== userId)) {
          return res.status(404).json({ success: false, error: 'Broadcast not found or access denied' });
        }
      }

      let countSql = 'SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id = $1';
      let dataSql = `
        SELECT id, name, phone, phone as phone_number, email, status, meta_message_id, meta_message_id as wamid, error_message, error_message as error_reason, error_code,
               sent_at, delivered_at, read_at, failed_at, created_at, csv_data
        FROM campaign_recipients
        WHERE campaign_id = $1
      `;
      const params = [id];

      if (status && status !== 'all') {
        params.push(status.toLowerCase());
        countSql += ` AND LOWER(status) = $${params.length}`;
        dataSql += ` AND LOWER(status) = $${params.length}`;
      }

      if (search && search.trim()) {
        params.push(`%${search.trim().toLowerCase()}%`);
        countSql += ` AND (LOWER(name) LIKE $${params.length} OR phone LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`;
        dataSql += ` AND (LOWER(name) LIKE $${params.length} OR phone LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`;
      }

      const totalRes = await query(countSql, params);
      const total = parseInt(totalRes.rows[0].count, 10);

      dataSql += ` ORDER BY id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      const dataRes = await query(dataSql, [...params, limit, offset]);

      // Aggregate status counts
      const statusCountsRes = await query(
        `SELECT status, COUNT(*) as count FROM campaign_recipients WHERE campaign_id = $1 GROUP BY status`,
        [id]
      );
      const statusCounts = {};
      statusCountsRes.rows.forEach(r => {
        statusCounts[r.status] = parseInt(r.count, 10);
      });

      res.json({
        success: true,
        data: dataRes.rows.map((r) => ({
          ...r,
          sent_at: r.sent_at ? toUtcIsoString(r.sent_at) : null,
          delivered_at: r.delivered_at ? toUtcIsoString(r.delivered_at) : null,
          read_at: r.read_at ? toUtcIsoString(r.read_at) : null,
          failed_at: r.failed_at ? toUtcIsoString(r.failed_at) : null,
          created_at: r.created_at ? toUtcIsoString(r.created_at) : null,
        })),
        statusCounts,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      });
    } catch (error) {
      next(error);
    }
  },
};
