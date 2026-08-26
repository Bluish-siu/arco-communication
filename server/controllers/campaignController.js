import { db, query } from '../config/db.js';

export const campaignController = {
  // GET /api/campaigns
  getAll: async (req, res, next) => {
    try {
      const { type, channel, status, category, creator, search, dateRange } = req.query;
      let sql = 'SELECT * FROM campaigns WHERE 1=1';
      const params = [];

      if (type && type !== 'all') {
        params.push(type.toLowerCase());
        sql += ` AND LOWER(type) = $${params.length}`;
      }

      if (channel && channel !== 'all') {
        params.push(channel.toLowerCase());
        sql += ` AND LOWER(channel) = $${params.length}`;
      }

      if (status && status !== 'all') {
        params.push(status.toLowerCase());
        sql += ` AND LOWER(status) = $${params.length}`;
      }

      if (category && category !== 'all') {
        params.push(category.toLowerCase());
        sql += ` AND LOWER(category) = $${params.length}`;
      }

      if (creator && creator !== 'all') {
        params.push(creator);
        sql += ` AND created_by = $${params.length}`;
      }

      if (search && search.trim()) {
        params.push(`%${search.trim().toLowerCase()}%`);
        sql += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(COALESCE(template_name, '')) LIKE $${params.length})`;
      }

      if (dateRange && dateRange !== 'all') {
        if (dateRange === 'today') {
          sql += ` AND created_at >= CURRENT_DATE`;
        } else if (dateRange === 'week') {
          sql += ` AND created_at >= CURRENT_DATE - INTERVAL '7 days'`;
        } else if (dateRange === 'month') {
          sql += ` AND created_at >= CURRENT_DATE - INTERVAL '30 days'`;
        }
      }

      sql += ' ORDER BY created_at DESC';
      const result = await query(sql, params);

      const formatted = result.rows.map((c) => ({
        id: c.id,
        name: c.name,
        channel: c.channel || 'whatsapp',
        type: c.type || 'onetime',
        category: c.category || 'Marketing',
        status: c.status || 'Scheduled',
        recipients: parseInt(c.recipients || 0, 10),
        delivered: parseInt(c.delivered || 0, 10),
        read: parseInt(c.read || 0, 10),
        replied: parseInt(c.replied || 0, 10),
        failureCount: parseInt(c.failure_count || 0, 10),
        scheduledFor: c.scheduled_for,
        sentAt: c.sent_at,
        completedAt: c.completed_at,
        description: c.description || '',
        templateName: c.template_name || '',
        templateLanguage: c.template_language || 'en_US',
        audienceType: c.audience_type || 'all',
        recurringConfig: c.recurring_config || {},
        createdBy: c.created_by || 'Shraddha',
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));

      res.json({ success: true, count: formatted.length, data: formatted });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/campaigns/:id
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await query('SELECT * FROM campaigns WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Campaign not found' });
      }

      const c = result.rows[0];

      // Query live recipient breakdown from campaign_recipients if available
      const recipientStatsRes = await query(
        `SELECT 
           COUNT(*) as total,
           COUNT(*) FILTER (WHERE status = 'pending') as pending,
           COUNT(*) FILTER (WHERE status = 'sent') as sent,
           COUNT(*) FILTER (WHERE status IN ('delivered', 'read', 'replied')) as delivered,
           COUNT(*) FILTER (WHERE status IN ('read', 'replied')) as read,
           COUNT(*) FILTER (WHERE status = 'replied') as replied,
           COUNT(*) FILTER (WHERE status = 'failed') as failed
         FROM campaign_recipients 
         WHERE campaign_id = $1`,
        [id]
      );

      const recipientStats = recipientStatsRes.rows[0];
      const hasRecipientsTable = parseInt(recipientStats.total, 10) > 0;

      const recipients = hasRecipientsTable ? parseInt(recipientStats.total, 10) : parseInt(c.recipients || 0, 10);
      const delivered = hasRecipientsTable ? parseInt(recipientStats.delivered, 10) : parseInt(c.delivered || 0, 10);
      const read = hasRecipientsTable ? parseInt(recipientStats.read, 10) : parseInt(c.read || 0, 10);
      const replied = hasRecipientsTable ? parseInt(recipientStats.replied, 10) : parseInt(c.replied || 0, 10);
      const pending = hasRecipientsTable ? parseInt(recipientStats.pending, 10) : 0;
      const failureCount = hasRecipientsTable ? parseInt(recipientStats.failed, 10) : parseInt(c.failure_count || 0, 10);

      const deliveryRate = recipients > 0 ? ((delivered / recipients) * 100).toFixed(1) : '0.0';
      const readRate = delivered > 0 ? ((read / delivered) * 100).toFixed(1) : '0.0';
      const replyRate = delivered > 0 ? ((replied / delivered) * 100).toFixed(1) : '0.0';
      const progressPercent = recipients > 0 ? (((recipients - pending) / recipients) * 100).toFixed(0) : '100';

      res.json({
        success: true,
        data: {
          id: c.id,
          name: c.name,
          description: c.description || '',
          channel: c.channel || 'whatsapp',
          type: c.type || 'onetime',
          category: c.category || 'Marketing',
          status: c.status || 'Scheduled',
          recipients,
          delivered,
          read,
          replied,
          pending,
          failureCount,
          progressPercent: `${progressPercent}%`,
          rates: {
            deliveryRate: `${deliveryRate}%`,
            readRate: `${readRate}%`,
            replyRate: `${replyRate}%`,
          },
          scheduledFor: c.scheduled_for,
          scheduleTimezone: c.schedule_timezone || 'Asia/Kolkata',
          sentAt: c.sent_at,
          completedAt: c.completed_at,
          audienceType: c.audience_type || 'all',
          audienceFilter: c.audience_filter || {},
          templateId: c.template_id,
          templateName: c.template_name,
          templateLanguage: c.template_language || 'en_US',
          templateCategory: c.template_category || 'MARKETING',
          templatePayload: c.template_payload || {},
          variableMapping: c.variable_mapping || {},
          recurringConfig: c.recurring_config || {},
          createdBy: c.created_by || 'Shraddha',
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/campaigns (Creates campaign & populates recipient queue in batches)
  create: async (req, res, next) => {
    try {
      const {
        name,
        description,
        channel,
        type,
        category,
        recipients,
        scheduledFor,
        scheduleTimezone,
        audienceType,
        audienceFilter,
        templateId,
        templateName,
        templateLanguage,
        templateCategory,
        templatePayload,
        variableMapping,
        recurringConfig,
        status,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Campaign name is required' });
      }

      // 1. Build audience query to select contacts from PostgreSQL
      let audienceSql = 'SELECT id, name, phone, email FROM contacts WHERE 1=1';
      const audienceParams = [];

      if (audienceType === 'saved_segment' && audienceFilter?.savedSegmentId) {
        const segRes = await query('SELECT conditions FROM segments WHERE id = $1', [audienceFilter.savedSegmentId]);
        if (segRes.rows.length > 0 && Array.isArray(segRes.rows[0].conditions)) {
          segRes.rows[0].conditions.forEach((cond) => {
            if (cond.field === 'whatsapp_opted') {
              audienceParams.push(String(cond.value) === 'true');
              audienceSql += ` AND whatsapp_opted = $${audienceParams.length}`;
            } else if (cond.field === 'segment') {
              audienceParams.push(cond.value);
              audienceSql += ` AND segment = $${audienceParams.length}`;
            } else if (cond.field === 'tag') {
              audienceParams.push(cond.value);
              if (cond.operator === 'is_not') {
                audienceSql += ` AND (tag != $${audienceParams.length} AND NOT (tags @> jsonb_build_array($${audienceParams.length}::text)))`;
              } else {
                audienceSql += ` AND (tag = $${audienceParams.length} OR tags @> jsonb_build_array($${audienceParams.length}::text))`;
              }
            } else if (cond.field === 'status') {
              audienceParams.push(cond.value);
              audienceSql += ` AND status = $${audienceParams.length}`;
            }
          });
        }
      } else {
        if (audienceType === 'active') {
          audienceSql += " AND (status != 'Closed' AND status != 'Lost')";
        } else if (audienceType === 'segment' && audienceFilter?.segment && audienceFilter.segment !== 'all') {
          audienceParams.push(audienceFilter.segment);
          audienceSql += ` AND segment = $${audienceParams.length}`;
        } else if (audienceType === 'tag' && audienceFilter?.tag && audienceFilter.tag !== 'all') {
          audienceParams.push(audienceFilter.tag);
          audienceSql += ` AND (tag = $${audienceParams.length} OR tags @> jsonb_build_array($${audienceParams.length}::text))`;
        } else if (audienceType === 'status' && audienceFilter?.status && audienceFilter.status !== 'all') {
          audienceParams.push(audienceFilter.status);
          audienceSql += ` AND status = $${audienceParams.length}`;
        }

        if (audienceFilter?.whatsappOptedOnly) {
          audienceSql += ' AND whatsapp_opted = true';
        }
      }

      const targetedContactsRes = await query(audienceSql, audienceParams);
      const targetedContacts = targetedContactsRes.rows;
      const totalRecipientsCount = targetedContacts.length > 0 ? targetedContacts.length : (recipients || 1450);

      const campaignId = `cmp_${Date.now()}`;
      const campaignStatus = status || 'Scheduled';

      // 2. Insert campaign master record
      const result = await query(
        `INSERT INTO campaigns (
           id, name, description, channel, type, category, status, recipients, delivered, read, replied,
           scheduled_for, schedule_timezone, audience_type, audience_filter, template_id, template_name,
           template_language, template_category, template_payload, variable_mapping, recurring_config,
           created_by, created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 0, 0, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          campaignId,
          name.trim(),
          description ? description.trim() : '',
          channel || 'whatsapp',
          type || 'onetime',
          category || 'Marketing',
          campaignStatus,
          totalRecipientsCount,
          scheduledFor ? new Date(scheduledFor).toISOString() : new Date().toISOString(),
          scheduleTimezone || 'Asia/Kolkata',
          audienceType || 'all',
          JSON.stringify(audienceFilter || {}),
          templateId || null,
          templateName || 'ARCO Promo',
          templateLanguage || 'en_US',
          templateCategory || 'MARKETING',
          JSON.stringify(templatePayload || {}),
          JSON.stringify(variableMapping || {}),
          JSON.stringify(recurringConfig || {}),
          req.user?.name || 'Shraddha',
        ]
      );

      const newCampaign = result.rows[0];

      // 3. Populate recipient queue in bulk batches of 100
      if (targetedContacts.length > 0) {
        const batchChunkSize = 100;
        for (let i = 0; i < targetedContacts.length; i += batchChunkSize) {
          const chunk = targetedContacts.slice(i, i + batchChunkSize);
          const batchNum = Math.floor(i / batchChunkSize) + 1;
          const placeholders = [];
          const values = [];

          chunk.forEach((c, idx) => {
            const offset = idx * 6;
            placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`);
            values.push(
              `rcp_${campaignId}_${c.id || idx}`,
              campaignId,
              c.id || null,
              c.name || 'Valued Customer',
              c.phone || '+91 9876543210',
              batchNum
            );
          });

          await query(
            `INSERT INTO campaign_recipients (id, campaign_id, contact_id, name, phone, batch_number)
             VALUES ${placeholders.join(', ')}
             ON CONFLICT (id) DO NOTHING`,
            values
          );
        }
      }

      res.status(201).json({
        success: true,
        message: 'Campaign created and queued for delivery',
        data: {
          id: newCampaign.id,
          name: newCampaign.name,
          channel: newCampaign.channel,
          type: newCampaign.type,
          category: newCampaign.category,
          status: newCampaign.status,
          recipients: parseInt(newCampaign.recipients, 10),
          scheduledFor: newCampaign.scheduled_for,
          templateName: newCampaign.template_name,
          createdBy: newCampaign.created_by,
          createdAt: newCampaign.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/campaigns/:id/recipients (Server-side paginated recipient queue table)
  getRecipients: async (req, res, next) => {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page || '1', 10);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
      const offset = (page - 1) * limit;
      const { status, search } = req.query;

      let sql = 'SELECT * FROM campaign_recipients WHERE campaign_id = $1';
      const params = [id];

      if (status && status !== 'all') {
        params.push(status.toLowerCase());
        sql += ` AND LOWER(status) = $${params.length}`;
      }

      if (search && search.trim()) {
        params.push(`%${search.trim().toLowerCase()}%`);
        sql += ` AND (LOWER(name) LIKE $${params.length} OR phone LIKE $${params.length})`;
      }

      // Get count
      const countSql = sql.replace('SELECT *', 'SELECT COUNT(*)');
      const countRes = await query(countSql, params);
      const total = parseInt(countRes.rows[0].count, 10);

      // Order & Paginate
      sql += ` ORDER BY batch_number ASC, created_at ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(sql, params);

      // Summary status counts for tabs
      const statusCountsRes = await query(
        `SELECT 
           COUNT(*) as total,
           COUNT(*) FILTER (WHERE status = 'pending') as pending,
           COUNT(*) FILTER (WHERE status IN ('delivered', 'read', 'replied')) as delivered,
           COUNT(*) FILTER (WHERE status IN ('read', 'replied')) as read,
           COUNT(*) FILTER (WHERE status = 'replied') as replied,
           COUNT(*) FILTER (WHERE status = 'failed') as failed
         FROM campaign_recipients
         WHERE campaign_id = $1`,
        [id]
      );

      res.json({
        success: true,
        data: result.rows.map((r) => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          status: r.status,
          batchNumber: r.batch_number,
          sentAt: r.sent_at,
          deliveredAt: r.delivered_at,
          readAt: r.read_at,
          repliedAt: r.replied_at,
          errorMessage: r.error_message,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        statusCounts: statusCountsRes.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/campaigns/:id/process-batch (Batch queue delivery processor)
  processBatch: async (req, res, next) => {
    try {
      const { id } = req.params;
      const batchSize = parseInt(req.body.batchSize || '100', 10);

      // 1. Fetch next batch of pending recipients
      const pendingRes = await query(
        `SELECT id, phone, name FROM campaign_recipients 
         WHERE campaign_id = $1 AND status = 'pending' 
         ORDER BY batch_number ASC, id ASC 
         LIMIT $2`,
        [id, batchSize]
      );

      const pendingRows = pendingRes.rows;
      if (pendingRows.length === 0) {
        // Mark campaign as completed
        await query(
          "UPDATE campaigns SET status = 'Completed', completed_at = CURRENT_TIMESTAMP WHERE id = $1",
          [id]
        );

        return res.json({
          success: true,
          message: 'All recipients processed. Campaign is Completed.',
          processedCount: 0,
          remainingPending: 0,
          isCompleted: true,
        });
      }

      const idsToUpdate = pendingRows.map((r) => r.id);

      // 2. Mark recipients as delivered / read / replied (simulation/dispatch engine)
      await query(
        `UPDATE campaign_recipients
         SET status = CASE 
               WHEN RIGHT(id, 1) IN ('0', '5') THEN 'replied'
               WHEN RIGHT(id, 1) IN ('1', '2', '3', '7') THEN 'read'
               WHEN RIGHT(id, 1) = '9' THEN 'failed'
               ELSE 'delivered'
             END,
             sent_at = CURRENT_TIMESTAMP,
             delivered_at = CURRENT_TIMESTAMP + INTERVAL '1 second',
             read_at = CASE WHEN RIGHT(id, 1) IN ('0', '1', '2', '3', '5', '7') THEN CURRENT_TIMESTAMP + INTERVAL '10 seconds' ELSE NULL END,
             replied_at = CASE WHEN RIGHT(id, 1) IN ('0', '5') THEN CURRENT_TIMESTAMP + INTERVAL '45 seconds' ELSE NULL END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ANY($1)`,
        [idsToUpdate]
      );

      // 3. Recalculate campaign master statistics
      const statsRes = await query(
        `SELECT 
           COUNT(*) as total,
           COUNT(*) FILTER (WHERE status = 'pending') as pending,
           COUNT(*) FILTER (WHERE status IN ('delivered', 'read', 'replied')) as delivered,
           COUNT(*) FILTER (WHERE status IN ('read', 'replied')) as read,
           COUNT(*) FILTER (WHERE status = 'replied') as replied,
           COUNT(*) FILTER (WHERE status = 'failed') as failed
         FROM campaign_recipients 
         WHERE campaign_id = $1`,
        [id]
      );

      const stats = statsRes.rows[0];
      const remainingPending = parseInt(stats.pending, 10);
      const isCompleted = remainingPending === 0;

      await query(
        `UPDATE campaigns 
         SET delivered = $1, 
             read = $2, 
             replied = $3, 
             failure_count = $4,
             status = $5,
             sent_at = COALESCE(sent_at, CURRENT_TIMESTAMP),
             completed_at = CASE WHEN $6 THEN CURRENT_TIMESTAMP ELSE completed_at END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7`,
        [
          parseInt(stats.delivered, 10),
          parseInt(stats.read, 10),
          parseInt(stats.replied, 10),
          parseInt(stats.failed, 10),
          isCompleted ? 'Completed' : 'Sending',
          isCompleted,
          id,
        ]
      );

      res.json({
        success: true,
        message: `Processed batch of ${pendingRows.length} recipients.`,
        processedCount: pendingRows.length,
        remainingPending,
        isCompleted,
        stats: {
          delivered: parseInt(stats.delivered, 10),
          read: parseInt(stats.read, 10),
          replied: parseInt(stats.replied, 10),
          failed: parseInt(stats.failed, 10),
          pending: remainingPending,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/campaigns/:id
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        category,
        scheduledFor,
        status,
        recurringConfig,
        variableMapping,
      } = req.body;

      const existing = await query('SELECT * FROM campaigns WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Campaign not found' });
      }

      const updates = [];
      const values = [];

      if (name !== undefined) {
        updates.push(`name = $${updates.length + 1}`);
        values.push(name.trim());
      }
      if (description !== undefined) {
        updates.push(`description = $${updates.length + 1}`);
        values.push(description);
      }
      if (category !== undefined) {
        updates.push(`category = $${updates.length + 1}`);
        values.push(category);
      }
      if (scheduledFor !== undefined) {
        updates.push(`scheduled_for = $${updates.length + 1}`);
        values.push(scheduledFor ? new Date(scheduledFor).toISOString() : null);
      }
      if (status !== undefined) {
        updates.push(`status = $${updates.length + 1}`);
        values.push(status);
      }
      if (recurringConfig !== undefined) {
        updates.push(`recurring_config = $${updates.length + 1}`);
        values.push(JSON.stringify(recurringConfig));
      }
      if (variableMapping !== undefined) {
        updates.push(`variable_mapping = $${updates.length + 1}`);
        values.push(JSON.stringify(variableMapping));
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const sql = `UPDATE campaigns SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`;
      const result = await query(sql, values);

      res.json({
        success: true,
        message: 'Campaign updated successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/campaigns/:id/status
  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required' });
      }

      const result = await query(
        `UPDATE campaigns SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Campaign not found' });
      }

      res.json({
        success: true,
        message: `Campaign status updated to ${status}`,
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/campaigns/:id
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await query('DELETE FROM campaigns WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Campaign not found' });
      }

      res.json({ success: true, message: 'Campaign deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/campaigns/audiences (Dynamic recipient counter from PostgreSQL contacts)
  getAudiences: async (req, res, next) => {
    try {
      const { audienceType, segment, tag, status, whatsapp_opted, savedSegmentId } = req.query;
      let sql = 'SELECT COUNT(*) FROM contacts WHERE 1=1';
      const params = [];

      if (audienceType === 'saved_segment' && savedSegmentId && savedSegmentId !== 'all') {
        const segRes = await query('SELECT conditions FROM segments WHERE id = $1', [savedSegmentId]);
        if (segRes.rows.length > 0 && Array.isArray(segRes.rows[0].conditions)) {
          segRes.rows[0].conditions.forEach((cond) => {
            if (cond.field === 'whatsapp_opted') {
              params.push(String(cond.value) === 'true');
              sql += ` AND whatsapp_opted = $${params.length}`;
            } else if (cond.field === 'segment') {
              params.push(cond.value);
              sql += ` AND segment = $${params.length}`;
            } else if (cond.field === 'tag') {
              params.push(cond.value);
              if (cond.operator === 'is_not') {
                sql += ` AND (tag != $${params.length} AND NOT (tags @> jsonb_build_array($${params.length}::text)))`;
              } else {
                sql += ` AND (tag = $${params.length} OR tags @> jsonb_build_array($${params.length}::text))`;
              }
            } else if (cond.field === 'status') {
              params.push(cond.value);
              sql += ` AND status = $${params.length}`;
            }
          });
        }
      } else {
        if (audienceType === 'active') {
          sql += " AND (status != 'Closed' AND status != 'Lost')";
        } else if (audienceType === 'segment' && segment && segment !== 'all') {
          params.push(segment);
          sql += ` AND segment = $${params.length}`;
        } else if (audienceType === 'tag' && tag && tag !== 'all') {
          params.push(tag);
          sql += ` AND (tag = $${params.length} OR tags @> jsonb_build_array($${params.length}::text))`;
        } else if (audienceType === 'status' && status && status !== 'all') {
          params.push(status);
          sql += ` AND status = $${params.length}`;
        }

        if (whatsapp_opted !== undefined && whatsapp_opted !== 'all' && whatsapp_opted !== '') {
          params.push(String(whatsapp_opted) === 'true');
          sql += ` AND whatsapp_opted = $${params.length}`;
        }
      }

      const countResult = await query(sql, params);
      const totalCount = parseInt(countResult.rows[0].count, 10);

      // Breakdown of segments, tags, statuses, and saved segments for selector dropdowns
      const segmentsRes = await query(`
        SELECT segment, COUNT(*) as count 
        FROM contacts 
        WHERE segment IS NOT NULL AND segment != '' 
        GROUP BY segment 
        ORDER BY count DESC
      `);
      const tagsRes = await query(`
        SELECT tag, COUNT(*) as count 
        FROM contacts 
        WHERE tag IS NOT NULL AND tag != '' 
        GROUP BY tag 
        ORDER BY count DESC
      `);
      const statusesRes = await query(`
        SELECT status, COUNT(*) as count 
        FROM contacts 
        WHERE status IS NOT NULL AND status != '' 
        GROUP BY status 
        ORDER BY count DESC
      `);
      const savedSegmentsRes = await query(`
        SELECT id, name, description, estimated_count 
        FROM segments 
        ORDER BY name ASC
      `);

      res.json({
        success: true,
        data: {
          recipientCount: totalCount,
          segments: segmentsRes.rows.map((r) => ({ name: r.segment, count: parseInt(r.count, 10) })),
          tags: tagsRes.rows.map((r) => ({ name: r.tag, count: parseInt(r.count, 10) })),
          statuses: statusesRes.rows.map((r) => ({ name: r.status, count: parseInt(r.count, 10) })),
          savedSegments: savedSegmentsRes.rows.map((r) => ({ id: r.id, name: r.name, description: r.description, count: parseInt(r.estimated_count, 10) })),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/campaign-templates
  getTemplates: async (req, res, next) => {
    try {
      const { isSample, category, theme, search } = req.query;

      if (isSample === 'false') {
        // Query active approved templates from whatsapp_templates and campaign_templates
        let waSql = `
          SELECT id, display_name as name, category, language, status, header_type, header_text, body as body_text, footer as footer_text, buttons, variables as sample_variables, created_at
          FROM whatsapp_templates
          WHERE deleted_at IS NULL AND is_library_template = false
        `;
        const waParams = [];
        if (search && search.trim()) {
          waParams.push(`%${search.trim().toLowerCase()}%`);
          waSql += ` AND (LOWER(display_name) LIKE $${waParams.length} OR LOWER(body) LIKE $${waParams.length})`;
        }
        if (category && category !== 'all') {
          waParams.push(category.toUpperCase());
          waSql += ` AND UPPER(category) = $${waParams.length}`;
        }
        waSql += ' ORDER BY created_at DESC';

        const waRes = await query(waSql, waParams);
        const formattedWa = waRes.rows.map((t) => ({
          id: t.id,
          name: t.name,
          category: t.category || 'MARKETING',
          language: t.language || 'en_US',
          status: t.status || 'APPROVED',
          theme: 'Active',
          isSample: false,
          headerType: t.header_type || 'NONE',
          headerText: t.header_text || '',
          bodyText: t.body_text || '',
          footerText: t.footer_text || '',
          buttons: t.buttons || [],
          sampleVariables: t.sample_variables || [],
          createdAt: t.created_at,
        }));

        return res.json({ success: true, count: formattedWa.length, data: formattedWa });
      }

      // For isSample === 'true' or default, query campaign_templates + whatsapp_templates library
      let sql = 'SELECT * FROM campaign_templates WHERE 1=1';
      const params = [];

      if (isSample !== undefined) {
        params.push(isSample === 'true');
        sql += ` AND is_sample = $${params.length}`;
      }

      if (category && category !== 'all') {
        params.push(category.toUpperCase());
        sql += ` AND UPPER(category) = $${params.length}`;
      }

      if (theme && theme !== 'all') {
        params.push(theme);
        sql += ` AND theme = $${params.length}`;
      }

      if (search && search.trim()) {
        params.push(`%${search.trim().toLowerCase()}%`);
        sql += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(body_text) LIKE $${params.length})`;
      }

      sql += ' ORDER BY is_sample DESC, created_at ASC';
      const result = await query(sql, params);

      // Also get library templates from whatsapp_templates to provide the complete 14 Interakt samples
      let libSql = `
        SELECT id, display_name as name, category, language, status, header_type, header_text, body as body_text, footer as footer_text, buttons, variables as sample_variables, created_at
        FROM whatsapp_templates
        WHERE is_library_template = true
      `;
      const libParams = [];
      if (search && search.trim()) {
        libParams.push(`%${search.trim().toLowerCase()}%`);
        libSql += ` AND (LOWER(display_name) LIKE $${libParams.length} OR LOWER(body) LIKE $${libParams.length})`;
      }
      const libRes = await query(libSql, libParams);

      const combined = [
        ...result.rows.map((t) => ({
          id: t.id,
          name: t.name,
          category: t.category,
          language: t.language,
          status: t.status,
          theme: t.theme || 'Sample',
          isSample: true,
          headerType: t.header_type,
          headerText: t.header_text,
          bodyText: t.body_text,
          footerText: t.footer_text,
          buttons: t.buttons || [],
          sampleVariables: t.sample_variables || [],
          createdAt: t.created_at,
        })),
        ...libRes.rows.map((t) => ({
          id: t.id,
          name: t.name,
          category: t.category || 'MARKETING',
          language: t.language || 'en_US',
          status: t.status || 'APPROVED',
          theme: 'Library',
          isSample: true,
          headerType: t.header_type || 'NONE',
          headerText: t.header_text || '',
          bodyText: t.body_text || '',
          footerText: t.footer_text || '',
          buttons: t.buttons || [],
          sampleVariables: t.sample_variables || [],
          createdAt: t.created_at,
        })),
      ];

      // Deduplicate by name if needed
      const unique = [];
      const seenNames = new Set();
      for (const item of combined) {
        if (!seenNames.has(item.name)) {
          seenNames.add(item.name);
          unique.push(item);
        }
      }

      res.json({ success: true, count: unique.length, data: unique });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/campaign-templates/:id
  getTemplateById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await query('SELECT * FROM campaign_templates WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      const t = result.rows[0];
      res.json({
        success: true,
        data: {
          id: t.id,
          name: t.name,
          category: t.category,
          language: t.language,
          status: t.status,
          theme: t.theme,
          isSample: t.is_sample,
          headerType: t.header_type,
          headerText: t.header_text,
          bodyText: t.body_text,
          footerText: t.footer_text,
          buttons: t.buttons || [],
          sampleVariables: t.sample_variables || [],
          createdAt: t.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
