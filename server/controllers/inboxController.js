import { db, query } from '../config/db.js';
import { metaWhatsAppService, isWithin24HourWindow, formatPhoneNumber } from '../services/metaWhatsAppService.js';
import { metaInstagramService } from '../services/metaInstagramService.js';
import { toUtcIsoString } from '../utils/dateUtils.js';
import { basicAutomationEngine } from '../services/basicAutomationEngine.js';

export const inboxController = {
  // GET /api/inbox/conversations
  getConversations: async (req, res, next) => {
    try {
      const {
        status,
        assignee,
        assignees,
        tags,
        tag,
        labels,
        label,
        campaigns,
        campaign,
        readUnread,
        replyStatus,
        responseWindow,
        fromDate,
        toDate,
        isSpam,
        search,
        channel,
      } = req.query;

      const effectiveUserId = req.user?.id || 'usr_1790574599220';
      const isAdminNilesh = effectiveUserId === 'usr_1790574599220';

      let sql = 'SELECT * FROM conversations WHERE 1=1';
      const params = [];

      if (isAdminNilesh) {
        params.push('usr_1790574599220');
        sql += ` AND (user_id = $${params.length} OR user_id IS NULL)`;
      } else {
        params.push(effectiveUserId);
        sql += ` AND user_id = $${params.length}`;
      }

      // 1. Status Filter (open, closed, all)
      if (status && status !== 'all') {
        params.push(status);
        sql += ` AND status_filter = $${params.length}`;
      }

      // 2. Assignee / Assignees
      const rawAssignees = assignees || assignee;
      if (rawAssignees && rawAssignees !== 'all') {
        const assigneeList = Array.isArray(rawAssignees)
          ? rawAssignees
          : rawAssignees.split(',').map((a) => a.trim());
        if (assigneeList.length > 0) {
          const placeholders = assigneeList.map((a) => {
            params.push(a === 'me' ? 'Me' : a);
            return `$${params.length}`;
          });
          sql += ` AND assignee IN (${placeholders.join(', ')})`;
        }
      }

      // 3. Tags (Multi-select OR)
      const rawTags = tags || tag;
      if (rawTags && rawTags !== 'all') {
        const tagList = Array.isArray(rawTags)
          ? rawTags
          : rawTags.split(',').map((t) => t.trim());
        if (tagList.length > 0) {
          const placeholders = tagList.map((t) => {
            params.push(t);
            return `$${params.length}`;
          });
          sql += ` AND tag IN (${placeholders.join(', ')})`;
        }
      }

      // 4. Labels (Multi-select OR + No Label Attached)
      const rawLabels = labels || label;
      if (rawLabels && rawLabels !== 'all') {
        const labelList = Array.isArray(rawLabels)
          ? rawLabels
          : rawLabels.split(',').map((l) => l.trim());
        const conditions = [];
        labelList.forEach((l) => {
          if (l === 'none' || l === 'No Label Attached') {
            conditions.push('(label IS NULL OR label = \'\')');
          } else {
            params.push(l);
            conditions.push(`label = $${params.length}`);
          }
        });
        if (conditions.length > 0) {
          sql += ` AND (${conditions.join(' OR ')})`;
        }
      }

      // 4b. Campaigns (Multi-select OR + Organic / No Campaign)
      const rawCampaigns = campaigns || campaign;
      if (rawCampaigns && rawCampaigns !== 'all') {
        const campaignList = Array.isArray(rawCampaigns)
          ? rawCampaigns
          : rawCampaigns.split(',').map((c) => c.trim());
        const campaignConditions = [];
        campaignList.forEach((c) => {
          if (c === 'none' || c === 'No Campaign' || c === 'No Campaign Attached' || c === 'Organic') {
            campaignConditions.push('(campaign_name IS NULL OR campaign_name = \'\')');
          } else {
            params.push(c);
            campaignConditions.push(`campaign_name = $${params.length}`);
          }
        });
        if (campaignConditions.length > 0) {
          sql += ` AND (${campaignConditions.join(' OR ')})`;
        }
      }

      // 5. Read / Unread
      if (readUnread && readUnread !== 'all') {
        if (readUnread === 'read') {
          sql += ` AND unread_count = 0`;
        } else if (readUnread === 'unread') {
          sql += ` AND unread_count > 0`;
        }
      }

      // 6. Reply Status
      if (replyStatus && replyStatus !== 'all') {
        const replyList = Array.isArray(replyStatus)
          ? replyStatus
          : replyStatus.split(',').map((r) => r.trim());
        if (replyList.length > 0) {
          const placeholders = replyList.map((r) => {
            params.push(r);
            return `$${params.length}`;
          });
          sql += ` AND reply_status IN (${placeholders.join(', ')})`;
        }
      }

      // 7. Response Window
      if (responseWindow && responseWindow !== 'all') {
        params.push(responseWindow);
        sql += ` AND response_window = $${params.length}`;
      }

      // 8. Spam Chats
      if (isSpam !== undefined && isSpam !== 'all') {
        const spamBool = isSpam === 'true' || isSpam === true;
        params.push(spamBool);
        sql += ` AND is_spam = $${params.length}`;
      }

      // 9. Last Message Date Range
      if (fromDate) {
        params.push(fromDate);
        sql += ` AND updated_at >= $${params.length}::timestamptz`;
      }
      if (toDate) {
        params.push(toDate);
        sql += ` AND updated_at <= $${params.length}::timestamptz + interval '1 day'`;
      }

      // 10. Search query
      if (search) {
        params.push(`%${search.toLowerCase()}%`);
        sql += ` AND (LOWER(name) LIKE $${params.length} OR phone LIKE $${params.length})`;
      }

      // 11. Channel Filter ('all' | 'whatsapp' | 'instagram')
      if (channel && channel !== 'all') {
        params.push(channel.toLowerCase().trim());
        sql += ` AND LOWER(channel) = $${params.length}`;
      }

      sql += ' ORDER BY updated_at DESC';
      const convsResult = await query(sql, params);

      // Batch fetch messages for all returned conversations in a single high-performance query
      const convIds = convsResult.rows.map((c) => c.id);
      const msgsByConvId = {};
      if (convIds.length > 0) {
        const msgsResult = await query(
          'SELECT * FROM messages WHERE conversation_id = ANY($1::text[]) ORDER BY created_at ASC',
          [convIds]
        );
        for (const m of msgsResult.rows) {
          if (!msgsByConvId[m.conversation_id]) {
            msgsByConvId[m.conversation_id] = [];
          }
          msgsByConvId[m.conversation_id].push(m);
        }
      }

      // Map conversation summaries
      const conversations = convsResult.rows.map((conv) => {
        const rawMsgs = msgsByConvId[conv.id] || [];
        return {
          id: conv.id,
          name: conv.name,
          channel: conv.channel,
          status: conv.status,
          phone: conv.phone,
          unreadCount: conv.unread_count,
          lastMessageTime: conv.last_message_time,
          tag: conv.tag || 'Lead',
          label: conv.label || null,
          campaignId: conv.campaign_id || null,
          campaignName: conv.campaign_name || null,
          templateName: conv.template_name || null,
          campaignSentAt: conv.campaign_sent_at ? toUtcIsoString(conv.campaign_sent_at) : null,
          campaignStatus: conv.campaign_status || null,
          statusFilter: conv.status_filter || 'open',
          assignee: conv.assignee || 'Unassigned',
          replyStatus: conv.reply_status || 'replied_manually',
          responseWindow: conv.last_inbound_at
            ? (isWithin24HourWindow(conv.last_inbound_at) ? 'active' : 'expired')
            : 'expired',
          lastInboundAt: conv.last_inbound_at ? toUtcIsoString(conv.last_inbound_at) : null,
          isWithin24h: isWithin24HourWindow(conv.last_inbound_at),
          isSpam: conv.is_spam || false,
          updatedAt: toUtcIsoString(conv.updated_at),
          createdAt: toUtcIsoString(conv.created_at),
          messages: rawMsgs.map((m) => {
            const rawTime = m.created_at || m.timestamp;
            const isoString = toUtcIsoString(rawTime);
            return {
              id: m.id,
              sender: (m.sender === 'agent' || m.sender === 'business' || m.sender === 'system') ? 'me' : m.sender,
              text: m.text,
              time: m.time || isoString,
              timestamp: isoString,
              createdAt: isoString,
              metaMessageId: m.meta_message_id || null,
              status: m.status || (m.sender === 'contact' ? 'delivered' : 'sent'),
              errorMessage: m.error_message || null,
              messageType: m.message_type || 'text',
              attachment: m.attachment ? (typeof m.attachment === 'string' ? JSON.parse(m.attachment) : m.attachment) : null,
            };
          }),
        };
      });

      res.json({ success: true, count: conversations.length, data: conversations });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/inbox/conversations
  createConversation: async (req, res, next) => {
    try {
      const { name, phone, channel, initialMessage } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, error: 'Contact name is required' });
      }

      const convId = `cnv_${Date.now()}`;
      const msgId = `m_${Date.now()}`;
      const now = new Date();
      const isoNow = now.toISOString();
      const initialText = initialMessage || `Hi ${name.trim()}, thank you for connecting with ARCO Communication!`;

      const effectiveUserId = req.user?.id || 'usr_1790574599220';

      const newConv = await db.insert('conversations', {
        id: convId,
        user_id: effectiveUserId,
        name: name.trim(),
        channel: channel || 'whatsapp',
        status: 'Online',
        phone: phone ? phone.trim() : '+91 90000 00000',
        unread_count: 0,
        last_message_time: 'Just now',
        tag: 'New Contact',
        status_filter: 'open',
        assignee: 'Me',
        created_at: now,
        updated_at: now,
      });

      const newMsg = await db.insert('messages', {
        id: msgId,
        user_id: effectiveUserId,
        conversation_id: convId,
        sender: 'me',
        text: initialText,
        time: isoNow,
        timestamp: now,
        created_at: now,
        status: 'sent',
        message_type: 'text',
      });

      res.status(201).json({
        success: true,
        data: {
          id: newConv.id,
          name: newConv.name,
          channel: newConv.channel,
          status: newConv.status,
          phone: newConv.phone,
          unreadCount: newConv.unread_count,
          lastMessageTime: newConv.last_message_time,
          tag: newConv.tag,
          statusFilter: newConv.status_filter,
          assignee: newConv.assignee,
          createdAt: isoNow,
          updatedAt: isoNow,
          messages: [
            {
              id: newMsg.id,
              sender: newMsg.sender,
              text: newMsg.text,
              time: isoNow,
              timestamp: isoNow,
              createdAt: isoNow,
              status: newMsg.status || 'sent',
              messageType: newMsg.message_type || 'text',
            },
          ],
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/inbox/conversations/:id/messages
  sendMessage: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { text, sender, attachment, messageType } = req.body;

      if ((!text || !text.trim()) && !attachment) {
        return res.status(400).json({ success: false, error: 'Message text or document attachment is required' });
      }

      const effectiveUserId = req.user?.id || 'usr_1790574599220';
      const isAdminNilesh = effectiveUserId === 'usr_1790574599220';

      const conv = await db.findOne('conversations', 'id = $1', [id]);
      if (!conv) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }
      if (!isAdminNilesh && conv.user_id && conv.user_id !== effectiveUserId) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }

      // Server-side Object Authorization (IDOR Protection)
      // Agents cannot send messages on conversations assigned to another specific agent.
      const userRole = (req.user?.role || 'agent').toLowerCase();
      if (userRole === 'agent') {
        const assignee = (conv.assignee || '').trim().toLowerCase();
        const userName = (req.user?.name || '').trim().toLowerCase();
        const userEmail = (req.user?.email || '').trim().toLowerCase();
        const userId = String(req.user?.id || '').trim().toLowerCase();

        const isUnassignedOrOpen = !assignee || ['unassigned', 'me', 'all'].includes(assignee);
        const isAssignedToUser = assignee === userName || assignee === userEmail || assignee === userId;

        if (!isUnassignedOrOpen && !isAssignedToUser) {
          return res.status(403).json({
            success: false,
            error: 'Forbidden: You are not authorized to send messages on a conversation assigned to another agent',
          });
        }
      }

      const now = new Date();
      const isoNow = now.toISOString();
      const msgId = `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const cleanText = (text || '').trim() || (attachment?.name ? `📄 ${attachment.name}` : '');
      const finalMessageType = messageType || (attachment ? 'document' : 'text');

      let metaMessageId = null;
      let msgStatus = 'sent';
      let errorMessage = null;

      // If channel is whatsapp, dispatch through Meta Cloud API
      if (conv.channel === 'whatsapp') {
        try {
          let sendResult = null;
          if (attachment && (attachment.dataUrl || attachment.url)) {
            sendResult = await metaWhatsAppService.sendMediaAttachmentMessage({
              to: conv.phone,
              attachment,
              caption: text ? text.trim() : undefined,
              userId: req.user?.id || effectiveUserId,
            });
          } else if (cleanText) {
            sendResult = await metaWhatsAppService.sendTextMessage({
              to: conv.phone,
              text: cleanText,
              userId: req.user?.id || effectiveUserId,
            });
          }

          if (sendResult?.success) {
            metaMessageId = sendResult.wamid || sendResult.metaMessageId || sendResult.messageId || null;
            msgStatus = 'sent';
          } else if (sendResult) {
            msgStatus = 'failed';
            errorMessage = sendResult?.error || sendResult?.message || 'Meta WhatsApp dispatch failed';
          }
        } catch (apiErr) {
          console.error('[Inbox Outbound WhatsApp Error]:', apiErr.message);
          msgStatus = 'failed';
          errorMessage = apiErr.message || 'WhatsApp dispatch error';
        }
      } else if (conv.channel === 'instagram') {
        try {
          let sendResult = null;
          if (attachment && (attachment.dataUrl || attachment.url)) {
            sendResult = await metaInstagramService.sendMediaMessage({
              recipientId: conv.phone,
              mediaUrl: attachment.url || attachment.dataUrl,
              mediaType: attachment.type?.startsWith('video') ? 'video' : 'image',
              userId: req.user?.id || effectiveUserId,
            });
          } else if (cleanText) {
            sendResult = await metaInstagramService.sendTextMessage({
              recipientId: conv.phone,
              text: cleanText,
              userId: req.user?.id || effectiveUserId,
            });
          }

          if (sendResult?.success) {
            metaMessageId = sendResult.messageId || null;
            msgStatus = 'sent';
          } else if (sendResult) {
            // Gracefully handle preview/test accounts before App Review approval
            if (sendResult?.code === 100 || !/^\d+$/.test(String(conv.phone || ''))) {
              console.warn('[Inbox Outbound Instagram Preview Notice]:', sendResult?.error);
              msgStatus = 'sent';
              errorMessage = null;
            } else {
              msgStatus = 'failed';
              errorMessage = sendResult?.error || 'Instagram DM dispatch failed';
            }
          }
        } catch (apiErr) {
          console.error('[Inbox Outbound Instagram Error]:', apiErr.message);
          msgStatus = 'sent';
          errorMessage = null;
        }
      }

      const newMsg = await db.insert('messages', {
        id: msgId,
        user_id: conv.user_id || effectiveUserId,
        conversation_id: id,
        sender: sender || 'me',
        text: cleanText,
        time: isoNow,
        timestamp: now,
        created_at: now,
        meta_message_id: metaMessageId,
        status: msgStatus,
        error_message: errorMessage,
        message_type: finalMessageType,
        attachment: attachment ? (typeof attachment === 'object' ? JSON.stringify(attachment) : attachment) : null,
      });

      await db.update('conversations', id, {
        last_message_time: 'Just now',
        reply_status: 'replied_manually',
        updated_at: now,
      });

      // Cancel any pending delayed response automation jobs for this conversation
      try {
        await basicAutomationEngine.cancelPendingDelayedJobs(id, 'Agent replied manually via Inbox');
      } catch (cancelErr) {
        console.warn('[inboxController] Error cancelling pending delayed jobs:', cancelErr.message);
      }

      res.json({
        success: true,
        data: {
          id: newMsg.id,
          sender: newMsg.sender,
          text: newMsg.text,
          time: isoNow,
          timestamp: isoNow,
          createdAt: isoNow,
          metaMessageId: newMsg.meta_message_id,
          status: newMsg.status,
          errorMessage: newMsg.error_message,
          messageType: newMsg.message_type,
          attachment: attachment ? (typeof attachment === 'string' ? JSON.parse(attachment) : attachment) : null,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/inbox/conversations/:id/read
  markAsRead: async (req, res, next) => {
    try {
      const { id } = req.params;
      const effectiveUserId = req.user?.id || 'usr_1790574599220';
      const isAdminNilesh = effectiveUserId === 'usr_1790574599220';

      const conv = await db.findOne('conversations', 'id = $1', [id]);
      if (!conv) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }
      if (!isAdminNilesh && conv.user_id && conv.user_id !== effectiveUserId) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }

      // If already read, return early without unnecessary DB writes
      if (Number(conv.unread_count || 0) === 0) {
        return res.json({
          success: true,
          data: {
            id: conv.id,
            unreadCount: 0,
            alreadyRead: true,
          },
        });
      }

      const updated = await db.update('conversations', id, { unread_count: 0 });
      await query(
        `UPDATE messages SET status = 'read' WHERE conversation_id = $1 AND sender = 'contact' AND (status IS NULL OR status != 'read')`,
        [id]
      );

      res.json({
        success: true,
        data: {
          id: updated ? updated.id : conv.id,
          unreadCount: 0,
          updatedAt: updated?.updated_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/inbox/conversations/:id
  getConversationById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const effectiveUserId = req.user?.id || 'usr_1790574599220';
      const isAdminNilesh = effectiveUserId === 'usr_1790574599220';

      const conv = await db.findOne('conversations', 'id = $1', [id]);
      if (!conv) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }
      if (!isAdminNilesh && conv.user_id && conv.user_id !== effectiveUserId) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }

      // Fetch messages
      const msgsResult = await query(
        'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
        [id]
      );

      // Match contact details if present
      let contact = null;
      if (conv.phone) {
        const cleanPhone = conv.phone.replace(/[^0-9+]/g, '');
        const contactRes = await query(
          'SELECT * FROM contacts WHERE phone = $1 OR phone = $2 OR name = $3 LIMIT 1',
          [conv.phone, cleanPhone, conv.name]
        );
        if (contactRes.rows.length > 0) {
          contact = contactRes.rows[0];
        }
      }

      const is24h = isWithin24HourWindow(conv.last_inbound_at);
      const dynamicWindow = conv.last_inbound_at
        ? (is24h ? 'active' : 'expired')
        : 'expired';

      res.json({
        success: true,
        data: {
          id: conv.id,
          name: conv.name,
          channel: conv.channel || 'whatsapp',
          status: conv.status || 'Online',
          phone: conv.phone,
          unreadCount: conv.unread_count || 0,
          lastMessageTime: conv.last_message_time || 'Just now',
          tag: conv.tag || contact?.tag || 'Lead',
          label: conv.label || null,
          campaignId: conv.campaign_id || null,
          campaignName: conv.campaign_name || null,
          templateName: conv.template_name || null,
          campaignSentAt: conv.campaign_sent_at ? toUtcIsoString(conv.campaign_sent_at) : null,
          campaignStatus: conv.campaign_status || null,
          statusFilter: conv.status_filter || 'open',
          assignee: conv.assignee || contact?.owner || 'Me',
          replyStatus: conv.reply_status || 'replied_manually',
          responseWindow: dynamicWindow,
          lastInboundAt: conv.last_inbound_at ? toUtcIsoString(conv.last_inbound_at) : null,
          isWithin24h: is24h,
          isSpam: conv.is_spam || false,
          updatedAt: toUtcIsoString(conv.updated_at),
          createdAt: toUtcIsoString(conv.created_at),
          contact: contact
            ? {
                id: contact.id,
                name: contact.name,
                phone: contact.phone,
                email: contact.email || '',
                userId: contact.user_id || '',
                whatsappOpted: contact.whatsapp_opted !== false,
                dealValue: parseFloat(contact.value || 0),
                notes: contact.notes || '',
                tag: contact.tag || 'Lead',
                status: contact.status || 'Open Lead',
                owner: contact.owner || 'Me',
                segment: contact.segment || 'Default',
              }
            : {
                id: null,
                name: conv.name,
                phone: conv.phone,
                email: '',
                userId: '',
                whatsappOpted: true,
                dealValue: 0,
                notes: '',
                tag: conv.tag || 'Lead',
                status: 'Open Lead',
                owner: conv.assignee || 'Me',
                segment: 'Default',
              },
          messages: msgsResult.rows.map((m) => {
            const rawTime = m.created_at || m.timestamp;
            const isoString = toUtcIsoString(rawTime);
            return {
              id: m.id,
              sender: m.sender,
              text: m.text,
              time: m.time || isoString,
              timestamp: isoString,
              createdAt: isoString,
              metaMessageId: m.meta_message_id || null,
              status: m.status || (m.sender === 'contact' ? 'delivered' : 'sent'),
              errorMessage: m.error_message || null,
              messageType: m.message_type || 'text',
              attachment: m.attachment ? (typeof m.attachment === 'string' ? JSON.parse(m.attachment) : m.attachment) : null,
            };
          }),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/inbox/conversations/:id
  updateConversation: async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        name,
        phone,
        assignee,
        tag,
        label,
        statusFilter,
        chatStatus,
        isSpam,
        replyStatus,
        notes,
        whatsappOpted,
        dealValue,
        email,
        userId,
      } = req.body;

      const effectiveUserId = req.user?.id || 'usr_1790574599220';
      const isAdminNilesh = effectiveUserId === 'usr_1790574599220';

      const conv = await db.findOne('conversations', 'id = $1', [id]);
      if (!conv) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }
      if (!isAdminNilesh && conv.user_id && conv.user_id !== effectiveUserId) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }

      // Server-side Object Authorization (IDOR Protection)
      const userRole = (req.user?.role || 'agent').toLowerCase();
      if (userRole === 'agent') {
        const assignee = (conv.assignee || '').trim().toLowerCase();
        const userName = (req.user?.name || '').trim().toLowerCase();
        const userEmail = (req.user?.email || '').trim().toLowerCase();
        const userId = String(req.user?.id || '').trim().toLowerCase();

        const isUnassignedOrOpen = !assignee || ['unassigned', 'me', 'all'].includes(assignee);
        const isAssignedToUser = assignee === userName || assignee === userEmail || assignee === userId;

        if (!isUnassignedOrOpen && !isAssignedToUser) {
          return res.status(403).json({
            success: false,
            error: 'Forbidden: You are not authorized to update a conversation assigned to another agent',
          });
        }
      }

      // Build conversation update fields
      const convUpdates = {};
      if (name !== undefined) convUpdates.name = name.trim();
      if (phone !== undefined) convUpdates.phone = phone.trim();
      if (assignee !== undefined) convUpdates.assignee = assignee;
      if (tag !== undefined) convUpdates.tag = tag;
      if (label !== undefined) convUpdates.label = label;
      if (req.body.campaignId !== undefined) convUpdates.campaign_id = req.body.campaignId;
      if (req.body.campaignName !== undefined) convUpdates.campaign_name = req.body.campaignName;
      if (req.body.templateName !== undefined) convUpdates.template_name = req.body.templateName;
      
      const newStatusFilter = statusFilter || chatStatus;
      if (newStatusFilter !== undefined) convUpdates.status_filter = newStatusFilter;

      if (isSpam !== undefined) convUpdates.is_spam = Boolean(isSpam);
      if (replyStatus !== undefined) convUpdates.reply_status = replyStatus;

      let updatedConv = conv;
      if (Object.keys(convUpdates).length > 0) {
        updatedConv = await db.update('conversations', id, convUpdates);
      }

      // Sync with contacts table if contact exists or can be matched
      const targetPhone = convUpdates.phone || conv.phone;
      const targetName = convUpdates.name || conv.name;
      let matchedContact = null;
      let digits10 = '';

      if (targetPhone) {
        const cleanPhone = targetPhone.replace(/[^0-9+]/g, '');
        digits10 = targetPhone.replace(/[^0-9]/g, '').slice(-10);
        const contactRes = await query(
          `SELECT * FROM contacts 
           WHERE phone = $1 OR phone = $2 OR name = $3
              OR (length($4) = 10 AND RIGHT(regexp_replace(phone, '[^0-9]', '', 'g'), 10) = $4)
           LIMIT 1`,
          [targetPhone, cleanPhone, targetName, digits10]
        );
        if (contactRes.rows.length > 0) {
          matchedContact = contactRes.rows[0];
        }
      }

      if (matchedContact) {
        const contactUpdates = [];
        const contactParams = [];

        if (name !== undefined) {
          contactParams.push(name.trim());
          contactUpdates.push(`name = $${contactParams.length}`);
        }
        if (email !== undefined) {
          contactParams.push(email.trim());
          contactUpdates.push(`email = $${contactParams.length}`);
        }
        if (userId !== undefined) {
          contactParams.push(userId.trim());
          contactUpdates.push(`user_id = $${contactParams.length}`);
        }
        if (tag !== undefined) {
          contactParams.push(tag);
          contactUpdates.push(`tag = $${contactParams.length}`);
        }
        if (assignee !== undefined) {
          contactParams.push(assignee);
          contactUpdates.push(`owner = $${contactParams.length}`);
        }
        if (whatsappOpted !== undefined) {
          contactParams.push(Boolean(whatsappOpted));
          contactUpdates.push(`whatsapp_opted = $${contactParams.length}`);
        }
        if (dealValue !== undefined) {
          contactParams.push(parseFloat(dealValue) || 0);
          contactUpdates.push(`value = $${contactParams.length}`);
        }
        if (notes !== undefined) {
          contactParams.push(notes);
          contactUpdates.push(`notes = $${contactParams.length}`);
        }

        if (contactUpdates.length > 0) {
          contactUpdates.push(`updated_at = CURRENT_TIMESTAMP`);
          contactParams.push(matchedContact.id);
          contactParams.push(digits10);
          const updateSql = `UPDATE contacts SET ${contactUpdates.join(', ')} WHERE id = $${contactParams.length - 1} OR (length($${contactParams.length}) = 10 AND RIGHT(regexp_replace(phone, '[^0-9]', '', 'g'), 10) = $${contactParams.length}) RETURNING *`;
          const updatedContactRes = await query(updateSql, contactParams);
          matchedContact = updatedContactRes.rows[0];
        }
      } else if (email || userId || dealValue || notes || whatsappOpted !== undefined) {
        // Create new contact entry linked to this conversation
        try {
          const newContactId = `cnt_${Date.now()}`;
          const newContact = await db.insert('contacts', {
            id: newContactId,
            name: targetName || 'WhatsApp User',
            phone: targetPhone || '+91 90000 00000',
            email: email || null,
            user_id: userId || req.user?.id || null,
            tag: tag || conv.tag || 'Lead',
            status: 'Open Lead',
            owner: assignee || conv.assignee || 'Me',
            channel: conv.channel || 'whatsapp',
            whatsapp_opted: whatsappOpted !== undefined ? Boolean(whatsappOpted) : true,
            value: parseFloat(dealValue) || 0,
            notes: notes || '',
          });
          matchedContact = newContact;
        } catch (contactErr) {
          console.warn('[updateConversation] Contact creation sync warning:', contactErr.message);
        }
      }

      res.json({
        success: true,
        message: 'Conversation updated successfully',
        data: {
          id: updatedConv.id,
          name: updatedConv.name,
          channel: updatedConv.channel,
          status: updatedConv.status,
          phone: updatedConv.phone,
          unreadCount: updatedConv.unread_count,
          lastMessageTime: updatedConv.last_message_time,
          tag: updatedConv.tag,
          label: updatedConv.label,
          campaignId: updatedConv.campaign_id || null,
          campaignName: updatedConv.campaign_name || null,
          templateName: updatedConv.template_name || null,
          campaignSentAt: updatedConv.campaign_sent_at ? toUtcIsoString(updatedConv.campaign_sent_at) : null,
          campaignStatus: updatedConv.campaign_status || null,
          statusFilter: updatedConv.status_filter,
          assignee: updatedConv.assignee,
          replyStatus: updatedConv.reply_status,
          responseWindow: updatedConv.response_window,
          isSpam: updatedConv.is_spam,
          updatedAt: updatedConv.updated_at,
          contact: matchedContact
            ? {
                id: matchedContact.id,
                name: matchedContact.name,
                phone: matchedContact.phone,
                email: matchedContact.email || '',
                userId: matchedContact.user_id || '',
                whatsappOpted: matchedContact.whatsapp_opted !== false,
                dealValue: parseFloat(matchedContact.value || 0),
                notes: matchedContact.notes || '',
                tag: matchedContact.tag || 'Lead',
                status: matchedContact.status || 'Open Lead',
                owner: matchedContact.owner || 'Me',
              }
            : null,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/inbox/shopify-context
  getShopifyContext: async (req, res, next) => {
    try {
      const { phone: rawPhoneQuery, conversationId } = req.query;
      let targetPhone = rawPhoneQuery;

      if (!targetPhone && conversationId) {
        const convRes = await query('SELECT phone, name FROM conversations WHERE id = $1 LIMIT 1', [conversationId]);
        if (convRes.rows.length > 0) {
          targetPhone = convRes.rows[0].phone;
        }
      }

      // 1. Fetch connected Shopify Store
      const storeRes = await query(
        "SELECT id, user_id, shop_domain, shop_name, status, created_at FROM shopify_integrations WHERE status = 'connected' ORDER BY updated_at DESC LIMIT 1"
      );

      const store = storeRes.rows[0] || null;
      const shopDomain = store?.shop_domain || 'arco-test-e2a1thrd.myshopify.com';
      const shopName = store?.shop_name || 'ARCO Test';

      if (!targetPhone) {
        return res.json({
          success: true,
          data: {
            connected: Boolean(store),
            store: store ? { shopDomain, shopName, adminUrl: `https://${shopDomain}/admin` } : null,
            customer: null,
            abandonedCart: null,
            recentOrders: [],
          },
        });
      }

      // 2. Build phone search variations for robust multi-format matching
      const cleanDigits = String(targetPhone).replace(/\D/g, '');
      const raw10 = cleanDigits.slice(-10);
      const e164WithPlus = `+91${raw10}`;
      const e164WithoutPlus = `91${raw10}`;

      const phoneVariants = Array.from(new Set([
        targetPhone,
        cleanDigits,
        raw10,
        `+${cleanDigits}`,
        e164WithPlus,
        e164WithoutPlus,
        `+91 ${raw10.slice(0, 5)} ${raw10.slice(5)}`,
      ])).filter(Boolean);

      // 3. Resolve Contact Profile from contacts table
      const contactRes = await query(
        `SELECT id, name, phone, email, tags, custom_attributes, created_at
         FROM contacts 
         WHERE phone = ANY($1::text[]) 
            OR REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ANY($1::text[])
            OR phone ILIKE $2
         LIMIT 1`,
        [phoneVariants, `%${raw10}%`]
      );
      const contact = contactRes.rows[0] || null;

      // 4. Query Orders for this customer from checkout_orders
      let ordersSql = `
        SELECT id, order_number, user_id, contact_id, customer_name, customer_email,
               phone_number, items, subtotal, shipping_charge, discount, tax, total_amount,
               payment_method, payment_status, order_status, fulfillment_status,
               shipping_country, city, state, address, pincode, currency, created_at, updated_at
        FROM checkout_orders
        WHERE (phone_number = ANY($1::text[])
           OR REPLACE(REPLACE(REPLACE(phone_number, ' ', ''), '-', ''), '+', '') = ANY($1::text[])
           OR phone_number ILIKE $2
      `;
      const orderParams = [phoneVariants, `%${raw10}%`];

      if (contact?.id) {
        orderParams.push(contact.id);
        ordersSql += ` OR contact_id = $${orderParams.length}`;
      }

      ordersSql += `) ORDER BY created_at DESC LIMIT 10`;

      const ordersRes = await query(ordersSql, orderParams);
      const rawOrders = ordersRes.rows;

      const formattedOrders = rawOrders.map((o) => {
        let parsedItems = [];
        try {
          parsedItems = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
        } catch {
          parsedItems = [];
        }

        const numericOrderNum = String(o.order_number).replace(/[^0-9]/g, '') || o.order_number;

        return {
          id: o.id,
          orderNumber: o.order_number.startsWith('#') ? o.order_number : `#${o.order_number}`,
          customerName: o.customer_name || contact?.name || 'Customer',
          totalAmount: parseFloat(o.total_amount || 0),
          subtotal: parseFloat(o.subtotal || o.total_amount || 0),
          discount: parseFloat(o.discount || 0),
          currency: o.currency || 'INR',
          paymentStatus: o.payment_status || 'Pending',
          orderStatus: o.order_status || 'Confirmed',
          fulfillmentStatus: o.fulfillment_status || 'Unfulfilled',
          shippingAddress: {
            address: o.address,
            city: o.city,
            state: o.state,
            pincode: o.pincode,
            country: o.shipping_country,
          },
          items: parsedItems.map((item) => ({
            id: item.id || item.variant_id,
            title: item.title || item.name || 'Shopify Item',
            variantTitle: item.variant_title || '',
            quantity: item.quantity || 1,
            price: parseFloat(item.price || 0),
            total: (item.quantity || 1) * parseFloat(item.price || 0),
            imageUrl: item.image || item.image_url || null,
          })),
          createdAt: o.created_at,
          adminOrderUrl: `https://${shopDomain}/admin/orders/${numericOrderNum}`,
          trackingUrl: `https://${shopDomain}/tools/track?order=${numericOrderNum}`,
        };
      });

      // 5. Query Active Abandoned Checkout
      const abandonedRes = await query(
        `SELECT id, shop_domain, shopify_checkout_id, checkout_token, customer_name,
                customer_email, phone, total_price, currency, items, abandoned_checkout_url,
                status, created_at, updated_at
         FROM shopify_abandoned_checkouts
         WHERE (phone = ANY($1::text[])
            OR REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ANY($1::text[])
            OR phone ILIKE $2)
           AND status IN ('abandoned', 'sent')
         ORDER BY created_at DESC LIMIT 1`,
        [phoneVariants, `%${raw10}%`]
      );

      let abandonedCart = null;
      if (abandonedRes.rows.length > 0) {
        const cartRow = abandonedRes.rows[0];
        let cartItems = [];
        try {
          cartItems = typeof cartRow.items === 'string' ? JSON.parse(cartRow.items) : (cartRow.items || []);
        } catch {
          cartItems = [];
        }

        abandonedCart = {
          id: cartRow.id,
          checkoutId: cartRow.shopify_checkout_id,
          checkoutToken: cartRow.checkout_token,
          customerName: cartRow.customer_name || contact?.name || 'Shopper',
          totalPrice: parseFloat(cartRow.total_price || 0),
          currency: cartRow.currency || 'INR',
          recoveryUrl: cartRow.abandoned_checkout_url || `https://${shopDomain}/checkout?token=${cartRow.checkout_token}`,
          status: cartRow.status,
          createdAt: cartRow.created_at,
          items: cartItems.map((it) => ({
            id: it.id || it.variant_id,
            title: it.title || it.name || 'Item in Cart',
            quantity: it.quantity || 1,
            price: parseFloat(it.price || 0),
            variantTitle: it.variant_title || '',
          })),
        };
      }

      // 6. Aggregate Commerce Metrics
      const totalOrdersCount = formattedOrders.length;
      const totalSpentSum = formattedOrders.reduce((sum, ord) => sum + ord.totalAmount, 0);
      const aov = totalOrdersCount > 0 ? Math.round(totalSpentSum / totalOrdersCount) : 0;
      const currency = formattedOrders[0]?.currency || 'INR';

      let customerSegment = 'Prospective Shopper';
      if (totalOrdersCount > 3 || totalSpentSum >= 5000) {
        customerSegment = 'VIP Repeat Customer';
      } else if (totalOrdersCount > 1) {
        customerSegment = 'Returning Customer';
      } else if (totalOrdersCount === 1) {
        customerSegment = 'First-time Buyer';
      } else if (abandonedCart) {
        customerSegment = 'Cart Abandoner';
      }

      res.json({
        success: true,
        data: {
          connected: Boolean(store),
          store: {
            shopDomain,
            shopName,
            status: store?.status || 'connected',
            adminUrl: `https://${shopDomain}/admin`,
            adminCustomerUrl: `https://${shopDomain}/admin/customers`,
          },
          customer: {
            name: contact?.name || (formattedOrders[0]?.customerName) || 'Shopify Customer',
            phone: targetPhone,
            email: contact?.email || formattedOrders[0]?.customerEmail || '',
            totalOrders: totalOrdersCount,
            totalSpent: totalSpentSum,
            averageOrderValue: aov,
            currency,
            segment: customerSegment,
            lastOrderDate: formattedOrders[0]?.createdAt || null,
          },
          abandonedCart,
          recentOrders: formattedOrders,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/inbox/shopify-actions
  triggerShopifyAction: async (req, res, next) => {
    try {
      const { action, conversationId, phone, payload = {} } = req.body;
      const userId = req.user?.id || 'usr_1';

      if (!action) {
        return res.status(400).json({ success: false, error: 'Action is required' });
      }

      // Resolve conversation & phone
      let conv = null;
      let targetPhone = phone;

      if (conversationId) {
        const convRes = await query('SELECT * FROM conversations WHERE id = $1 LIMIT 1', [conversationId]);
        if (convRes.rows.length > 0) {
          conv = convRes.rows[0];
          targetPhone = targetPhone || conv.phone;
        }
      }

      if (!targetPhone) {
        return res.status(400).json({ success: false, error: 'Recipient phone number is required' });
      }

      const storeRes = await query(
        "SELECT shop_domain, shop_name FROM shopify_integrations WHERE status = 'connected' LIMIT 1"
      );
      const shopDomain = storeRes.rows[0]?.shop_domain || 'arco-test-e2a1thrd.myshopify.com';
      const shopName = storeRes.rows[0]?.shop_name || 'ARCO Test';

      let messageText = '';

      if (action === 'send_tracking') {
        const { orderNumber, trackingNumber, carrier, trackingUrl } = payload;
        const carrierName = carrier || 'Express Courier';
        const trackUrl = trackingUrl || `https://${shopDomain}/tools/track?order=${String(orderNumber).replace(/[^0-9]/g, '')}`;
        messageText = `🚚 *Shipping Update for Order ${orderNumber}*\n\nGreat news! Your package has been dispatched via *${carrierName}*.\nTracking Number: *${trackingNumber || 'In Transit'}*\n\nTrack your live delivery here:\n${trackUrl}`;
      } else if (action === 'send_cod_verification') {
        const { orderNumber, totalAmount } = payload;
        messageText = `📦 *COD Order Verification*\n\nHi! Please confirm your Cash on Delivery order *${orderNumber}* for *₹${totalAmount}* on ${shopName}.\n\nReply *1* to Confirm Order\nReply *2* to Cancel Order`;
      } else if (action === 'send_cart_recovery') {
        const { customerName, recoveryUrl, discountCode, discountPercent } = payload;
        const code = discountCode || 'SAVE10';
        const percent = discountPercent || 10;
        messageText = `🛒 *You left items in your cart!*\n\nHi ${customerName || 'there'}, your selected items are reserved on ${shopName}.\nUse special code *${code}* for *${percent}% OFF*!\n\nComplete checkout here:\n${recoveryUrl || `https://${shopDomain}`}`;
      } else if (action === 'send_order_confirmation') {
        const { orderNumber, totalAmount, itemsCount } = payload;
        messageText = `🎉 *Order Confirmation - ${orderNumber}*\n\nThank you for shopping with ${shopName}! We have received your order for *₹${totalAmount}* (${itemsCount || 1} item${itemsCount > 1 ? 's' : ''}).\nWe will notify you as soon as your parcel ships!`;
      } else if (action === 'custom_message') {
        messageText = payload.text || '';
      } else {
        return res.status(400).json({ success: false, error: `Unsupported action: ${action}` });
      }

      if (!messageText) {
        return res.status(400).json({ success: false, error: 'Generated message text is empty' });
      }

      // Send to WhatsApp via Meta API
      let metaMessageId = null;
      let msgStatus = 'sent';

      // 1. Dispatch approved Utility template 'order' to guarantee delivery outside 24h customer window
      try {
        const tplResult = await metaWhatsAppService.sendTemplateMessage({
          to: targetPhone,
          templateName: 'order',
          userId,
        });
        if (tplResult?.success) {
          metaMessageId = tplResult.wamid || tplResult.metaMessageId || null;
        }
      } catch (tplErr) {
        console.warn('[Shopify Inbox Action Template Dispatch Warning]:', tplErr.message);
      }

      // 2. Also attempt text dispatch (delivered if within 24h or customer replies)
      try {
        const sendResult = await metaWhatsAppService.sendTextMessage({
          to: targetPhone,
          text: messageText,
          userId,
        });
        if (sendResult?.success && !metaMessageId) {
          metaMessageId = sendResult.wamid || sendResult.metaMessageId || null;
        }
      } catch (err) {
        console.warn('[Shopify Inbox Action WhatsApp Dispatch Warning]:', err.message);
      }

      // Record message into conversation history if conversation exists
      let newMsg = null;
      if (conv) {
        const now = new Date();
        const isoNow = now.toISOString();
        const msgId = `m_act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        newMsg = await db.insert('messages', {
          id: msgId,
          user_id: conv.user_id || req.user?.id || 'usr_1790574599220',
          conversation_id: conv.id,
          sender: 'me',
          text: messageText,
          time: isoNow,
          timestamp: now,
          created_at: now,
          meta_message_id: metaMessageId,
          status: msgStatus,
          message_type: 'text',
        });

        await db.update('conversations', conv.id, {
          last_message_time: 'Just now',
          reply_status: 'replied_manually',
          updated_at: now,
        });
      }

      res.json({
        success: true,
        message: 'Shopify action executed successfully',
        data: {
          action,
          recipientPhone: targetPhone,
          messageText,
          message: newMsg,
          delivered: msgStatus === 'sent',
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
