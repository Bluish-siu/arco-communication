import { db, query } from '../config/db.js';
import { metaWhatsAppService, isWithin24HourWindow } from '../services/metaWhatsAppService.js';

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
        readUnread,
        replyStatus,
        responseWindow,
        fromDate,
        toDate,
        isSpam,
        search,
      } = req.query;

      let sql = 'SELECT * FROM conversations WHERE 1=1';
      const params = [];

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

      sql += ' ORDER BY updated_at DESC';
      const convsResult = await query(sql, params);

      // Fetch messages for each conversation
      const conversations = [];
      for (const conv of convsResult.rows) {
        const msgsResult = await query(
          'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
          [conv.id]
        );

        conversations.push({
          id: conv.id,
          name: conv.name,
          channel: conv.channel,
          status: conv.status,
          phone: conv.phone,
          unreadCount: conv.unread_count,
          lastMessageTime: conv.last_message_time,
          tag: conv.tag || 'Lead',
          label: conv.label || null,
          statusFilter: conv.status_filter || 'open',
          assignee: conv.assignee || 'Unassigned',
          replyStatus: conv.reply_status || 'replied_manually',
          responseWindow: conv.last_inbound_at
            ? (isWithin24HourWindow(conv.last_inbound_at) ? 'active' : 'expired')
            : (conv.response_window || 'active'),
          lastInboundAt: conv.last_inbound_at,
          isWithin24h: isWithin24HourWindow(conv.last_inbound_at),
          isSpam: conv.is_spam || false,
          updatedAt: conv.updated_at,
          createdAt: conv.created_at,
          messages: msgsResult.rows.map((m) => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            time: m.time,
            timestamp: m.timestamp || m.created_at,
            metaMessageId: m.meta_message_id || null,
            status: m.status || (m.sender === 'contact' ? 'delivered' : 'sent'),
            errorMessage: m.error_message || null,
            messageType: m.message_type || 'text',
          })),
        });
      }

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
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const initialText = initialMessage || `Hi ${name.trim()}, thank you for connecting with ARCO Communication!`;

      const newConv = await db.insert('conversations', {
        id: convId,
        name: name.trim(),
        channel: channel || 'whatsapp',
        status: 'Online',
        phone: phone ? phone.trim() : '+91 90000 00000',
        unread_count: 0,
        last_message_time: 'Just now',
        tag: 'New Contact',
        status_filter: 'open',
        assignee: 'Me',
      });

      const newMsg = await db.insert('messages', {
        id: msgId,
        conversation_id: convId,
        sender: 'me',
        text: initialText,
        time: timeStr,
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
          messages: [
            {
              id: newMsg.id,
              sender: newMsg.sender,
              text: newMsg.text,
              time: newMsg.time,
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
      const { text, sender } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({ success: false, error: 'Message text is required' });
      }

      const conv = await db.findOne('conversations', 'id = $1', [id]);
      if (!conv) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }

      const msgId = `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const cleanText = text.trim();

      let metaMessageId = null;
      let msgStatus = 'sent';
      let errorMessage = null;

      // If channel is whatsapp, dispatch through Meta Cloud API
      if (conv.channel === 'whatsapp') {
        try {
          const sendResult = await metaWhatsAppService.sendTextMessage({
            to: conv.phone,
            text: cleanText,
          });

          if (sendResult?.success) {
            metaMessageId = sendResult.messageId || null;
            msgStatus = 'sent';
          } else {
            msgStatus = 'failed';
            errorMessage = sendResult?.error || sendResult?.message || 'Meta WhatsApp dispatch failed';
          }
        } catch (apiErr) {
          console.error('[Inbox Outbound WhatsApp Error]:', apiErr.message);
          msgStatus = 'failed';
          errorMessage = apiErr.message || 'WhatsApp dispatch error';
        }
      }

      const newMsg = await db.insert('messages', {
        id: msgId,
        conversation_id: id,
        sender: sender || 'me',
        text: cleanText,
        time: timeStr,
        meta_message_id: metaMessageId,
        status: msgStatus,
        error_message: errorMessage,
        message_type: 'text',
      });

      await db.update('conversations', id, {
        last_message_time: 'Just now',
        reply_status: 'replied_manually',
      });

      res.json({
        success: true,
        data: {
          id: newMsg.id,
          sender: newMsg.sender,
          text: newMsg.text,
          time: newMsg.time,
          timestamp: newMsg.timestamp || newMsg.created_at,
          metaMessageId: newMsg.meta_message_id,
          status: newMsg.status,
          errorMessage: newMsg.error_message,
          messageType: newMsg.message_type,
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
      const updated = await db.update('conversations', id, { unread_count: 0 });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/inbox/conversations/:id
  getConversationById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const conv = await db.findOne('conversations', 'id = $1', [id]);
      if (!conv) {
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
        : (conv.response_window || 'active');

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
          statusFilter: conv.status_filter || 'open',
          assignee: conv.assignee || contact?.owner || 'Me',
          replyStatus: conv.reply_status || 'replied_manually',
          responseWindow: dynamicWindow,
          lastInboundAt: conv.last_inbound_at,
          isWithin24h: is24h,
          isSpam: conv.is_spam || false,
          updatedAt: conv.updated_at,
          createdAt: conv.created_at,
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
          messages: msgsResult.rows.map((m) => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            time: m.time,
            timestamp: m.timestamp || m.created_at,
            metaMessageId: m.meta_message_id || null,
            status: m.status || (m.sender === 'contact' ? 'delivered' : 'sent'),
            errorMessage: m.error_message || null,
            messageType: m.message_type || 'text',
          })),
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

      const conv = await db.findOne('conversations', 'id = $1', [id]);
      if (!conv) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }

      // Build conversation update fields
      const convUpdates = {};
      if (name !== undefined) convUpdates.name = name.trim();
      if (phone !== undefined) convUpdates.phone = phone.trim();
      if (assignee !== undefined) convUpdates.assignee = assignee;
      if (tag !== undefined) convUpdates.tag = tag;
      if (label !== undefined) convUpdates.label = label;
      
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

      if (targetPhone) {
        const cleanPhone = targetPhone.replace(/[^0-9+]/g, '');
        const contactRes = await query(
          'SELECT * FROM contacts WHERE phone = $1 OR phone = $2 OR name = $3 LIMIT 1',
          [targetPhone, cleanPhone, targetName]
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
          const updateSql = `UPDATE contacts SET ${contactUpdates.join(', ')} WHERE id = $${contactParams.length} RETURNING *`;
          const updatedContactRes = await query(updateSql, contactParams);
          matchedContact = updatedContactRes.rows[0];
        }
      } else if (email || userId || dealValue || notes || whatsappOpted !== undefined) {
        // Create new contact entry linked to this conversation
        const newContactId = `cnt_${Date.now()}`;
        const newContact = await db.insert('contacts', {
          id: newContactId,
          name: targetName || 'WhatsApp User',
          phone: targetPhone || '+91 90000 00000',
          email: email || '',
          user_id: userId || '',
          tag: tag || conv.tag || 'Lead',
          status: 'Open Lead',
          owner: assignee || conv.assignee || 'Me',
          channel: conv.channel || 'whatsapp',
          whatsapp_opted: whatsappOpted !== undefined ? Boolean(whatsappOpted) : true,
          value: parseFloat(dealValue) || 0,
          notes: notes || '',
        });
        matchedContact = newContact;
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
};
