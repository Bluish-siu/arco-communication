import { db, query } from '../config/db.js';

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
          responseWindow: conv.response_window || 'active',
          isSpam: conv.is_spam || false,
          updatedAt: conv.updated_at,
          createdAt: conv.created_at,
          messages: msgsResult.rows.map((m) => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            time: m.time,
            timestamp: m.timestamp,
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

      if (!text) {
        return res.status(400).json({ success: false, error: 'Message text is required' });
      }

      const conv = await db.findOne('conversations', 'id = $1', [id]);
      if (!conv) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }

      const msgId = `m_${Date.now()}`;
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newMsg = await db.insert('messages', {
        id: msgId,
        conversation_id: id,
        sender: sender || 'me',
        text: text.trim(),
        time: timeStr,
      });

      await db.update('conversations', id, {
        last_message_time: 'Just now',
      });

      res.json({
        success: true,
        data: {
          id: newMsg.id,
          sender: newMsg.sender,
          text: newMsg.text,
          time: newMsg.time,
          timestamp: newMsg.timestamp,
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
};
