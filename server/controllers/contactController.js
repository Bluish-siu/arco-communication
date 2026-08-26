import { db, query, pool } from '../config/db.js';

// Helper: Normalize phone numbers (e.g. +91 98765 43210 -> +919876543210)
export function normalizePhoneNumber(rawPhone, defaultCountryCode = '+91') {
  if (!rawPhone) return '';
  let cleaned = String(rawPhone).trim().replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    const countryDigits = defaultCountryCode.replace(/\D/g, '');
    if (cleaned.startsWith(countryDigits)) {
      cleaned = '+' + cleaned;
    } else {
      cleaned = defaultCountryCode + cleaned;
    }
  }
  return cleaned;
}

// Helper: Build SQL WHERE clause from structured conditions array and logic (AND / OR)
export function buildConditionClause(conditions, logic = 'AND', params = []) {
  if (!Array.isArray(conditions) || conditions.length === 0) {
    return { clause: '', params };
  }

  const parts = [];

  conditions.forEach((cond) => {
    if (!cond) return;
    const category = cond.category || (cond.field === 'tag' ? 'tag' : cond.event ? 'event' : 'field');
    const op = (cond.operator || 'is').toLowerCase();
    const val = cond.value !== undefined ? cond.value : cond.event;

    if (category === 'tag') {
      if (val && String(val).trim()) {
        params.push(String(val).trim());
        if (op === 'is_not') {
          parts.push(`(tag != $${params.length} AND NOT (tags @> jsonb_build_array($${params.length}::text)))`);
        } else {
          parts.push(`(tag = $${params.length} OR tags @> jsonb_build_array($${params.length}::text))`);
        }
      }
    } else if (category === 'field') {
      const fieldName = (cond.field || 'name').toLowerCase();
      
      // Numeric fields
      if (
        fieldName === 'value' || fieldName === 'deal_value' || fieldName === 'contact deal value' ||
        fieldName === 'row_number' || fieldName === 'row number'
      ) {
        const targetCol = (fieldName === 'row_number' || fieldName === 'row number') ? 'id' : 'value';
        const numVal = parseFloat(val);
        if (!isNaN(numVal)) {
          params.push(numVal);
          if (op === 'greater_than') parts.push(`${targetCol} > $${params.length}`);
          else if (op === 'less_than') parts.push(`${targetCol} < $${params.length}`);
          else if (op === 'greater_than_or_equal') parts.push(`${targetCol} >= $${params.length}`);
          else if (op === 'less_than_or_equal') parts.push(`${targetCol} <= $${params.length}`);
          else parts.push(`${targetCol} = $${params.length}`);
        }
      }
      // Date fields
      else if (
        fieldName === 'created_at' || fieldName === 'creation date' || fieldName === 'created' ||
        fieldName === 'status_updated_at' || fieldName === 'status updated at' ||
        fieldName === 'closure_deadline' || fieldName === 'closure deadline'
      ) {
        const targetCol = (fieldName.includes('status') || fieldName.includes('closure')) ? 'updated_at' : 'created_at';
        if (val) {
          params.push(val);
          if (op === 'before') parts.push(`${targetCol} < $${params.length}::timestamptz`);
          else if (op === 'after') parts.push(`${targetCol} > $${params.length}::timestamptz`);
          else parts.push(`DATE(${targetCol}) = DATE($${params.length})`);
        }
      }
      // Boolean fields
      else if (
        fieldName === 'whatsapp_opted' || fieldName === 'marked_as_spam' || fieldName === 'marked as spam?' ||
        fieldName === 'add_to_sales_cycle' || fieldName === 'add to sales cycle'
      ) {
        const targetCol = (fieldName.includes('spam') || fieldName.includes('sales')) ? 'whatsapp_opted' : 'whatsapp_opted';
        if (op === 'is_false' || String(val) === 'false' || String(val).toLowerCase() === 'no') {
          parts.push(`${targetCol} = false`);
        } else {
          parts.push(`${targetCol} = true`);
        }
      }
      // String fields (id, user_id, phone, email, name, country_code, source_id, ctwa_clid, source_url, company_name, status, owner, source, leadgen_workflow_trigger, failure_reason)
      else {
        const validFields = {
          id: 'id',
          user_id: 'user_id',
          userid: 'user_id',
          'user id': 'user_id',
          phone: 'phone',
          'phone number': 'phone',
          email: 'email',
          name: 'name',
          country_code: 'country_code',
          'country code': 'country_code',
          source_id: 'channel',
          'source id': 'channel',
          ctwa_clid: 'notes',
          'ctwa clid': 'notes',
          source_url: 'channel',
          'source url': 'channel',
          company_name: 'name',
          'company name': 'name',
          status: 'status',
          owner: 'owner',
          'account owner': 'owner',
          source: 'channel',
          leadgen_workflow_trigger: 'notes',
          'leadgen workflow trigger': 'notes',
          failure_reason: 'notes',
          'failure reason': 'notes',
          segment: 'segment',
        };
        const targetCol = validFields[fieldName] || 'name';

        if (val !== undefined && String(val).trim()) {
          const stringVal = String(val).trim();
          if (op === 'contains') {
            params.push(`%${stringVal.toLowerCase()}%`);
            parts.push(`LOWER(COALESCE(${targetCol}::text, '')) LIKE $${params.length}`);
          } else if (op === 'does_not_contain') {
            params.push(`%${stringVal.toLowerCase()}%`);
            parts.push(`LOWER(COALESCE(${targetCol}::text, '')) NOT LIKE $${params.length}`);
          } else if (op === 'starts_with') {
            params.push(`${stringVal.toLowerCase()}%`);
            parts.push(`LOWER(COALESCE(${targetCol}::text, '')) LIKE $${params.length}`);
          } else if (op === 'is_not') {
            params.push(stringVal.toLowerCase());
            parts.push(`LOWER(COALESCE(${targetCol}::text, '')) != $${params.length}`);
          } else {
            params.push(stringVal.toLowerCase());
            parts.push(`LOWER(COALESCE(${targetCol}::text, '')) = $${params.length}`);
          }
        }
      }
    } else if (category === 'event') {
      const eventName = cond.event || val;
      const traitName = cond.trait;
      const traitVal = cond.value;
      const traitOp = (cond.traitOperator || cond.operator || 'is').toLowerCase();

      if (traitName && traitVal !== undefined && String(traitVal).trim()) {
        const stringVal = String(traitVal).trim();
        params.push(`%${stringVal.toLowerCase()}%`);
        if (op === 'has_not_done' || traitOp === 'is_not' || traitOp === 'does_not_contain') {
          parts.push(`(LOWER(COALESCE(notes, '')) NOT LIKE $${params.length})`);
        } else {
          parts.push(`(LOWER(COALESCE(notes, '')) LIKE $${params.length} OR LOWER(COALESCE(status, '')) LIKE $${params.length})`);
        }
      } else if (eventName && String(eventName).trim()) {
        params.push(`%${String(eventName).trim().toLowerCase()}%`);
        if (op === 'has_not_done') {
          parts.push(`(LOWER(COALESCE(notes, '')) NOT LIKE $${params.length})`);
        } else {
          parts.push(`(LOWER(COALESCE(notes, '')) LIKE $${params.length} OR LOWER(COALESCE(status, '')) LIKE $${params.length})`);
        }
      }
    }
  });

  if (parts.length === 0) {
    return { clause: '', params };
  }

  const joiner = logic.toUpperCase() === 'OR' ? ' OR ' : ' AND ';
  return {
    clause: ` AND (${parts.join(joiner)})`,
    params,
  };
}

export const contactController = {
  // GET /api/contacts (Server-side paginated contacts query)
  getAll: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
      const offset = (page - 1) * limit;

      const {
        search,
        tag,
        status,
        whatsapp_opted,
        owner,
        savedSegmentId,
        conditions: rawConditions,
        logic = 'AND',
        sortBy = 'created_at',
        sortOrder = 'DESC',
      } = req.query;

      let sql = 'SELECT * FROM contacts WHERE 1=1';
      let params = [];

      // 1. Search Query
      if (search && search.trim()) {
        params.push(`%${search.trim().toLowerCase()}%`);
        sql += ` AND (LOWER(name) LIKE $${params.length} OR phone LIKE $${params.length} OR LOWER(COALESCE(email, '')) LIKE $${params.length} OR LOWER(COALESCE(user_id, '')) LIKE $${params.length})`;
      }

      // 2. Saved Segment or Structured Conditions
      let conditionsToApply = [];
      if (savedSegmentId && savedSegmentId !== 'all') {
        const segRes = await query('SELECT conditions FROM segments WHERE id = $1', [savedSegmentId]);
        if (segRes.rows.length > 0 && Array.isArray(segRes.rows[0].conditions)) {
          conditionsToApply = segRes.rows[0].conditions;
        }
      } else if (rawConditions) {
        try {
          conditionsToApply = typeof rawConditions === 'string' ? JSON.parse(rawConditions) : rawConditions;
        } catch {
          conditionsToApply = [];
        }
      }

      if (Array.isArray(conditionsToApply) && conditionsToApply.length > 0) {
        const { clause, params: updatedParams } = buildConditionClause(conditionsToApply, logic, params);
        sql += clause;
        params = updatedParams;
      }

      // Simple tag filter
      if (tag && tag !== 'all') {
        params.push(tag);
        sql += ` AND (tag = $${params.length} OR tags @> jsonb_build_array($${params.length}::text))`;
      }

      // Status filter
      if (status && status !== 'all') {
        params.push(status);
        sql += ` AND status = $${params.length}`;
      }

      // WhatsApp Opted Flag
      if (whatsapp_opted !== undefined && whatsapp_opted !== 'all' && whatsapp_opted !== '') {
        const isOpted = String(whatsapp_opted) === 'true';
        params.push(isOpted);
        sql += ` AND whatsapp_opted = $${params.length}`;
      }

      if (owner && owner !== 'all') {
        params.push(owner);
        sql += ` AND owner = $${params.length}`;
      }

      // Count total matches
      const countSql = sql.replace('SELECT *', 'SELECT COUNT(*)');
      const countRes = await query(countSql, params);
      const total = parseInt(countRes.rows[0].count, 10);

      // Safe sorting column
      const validSortCols = ['created_at', 'name', 'phone', 'email', 'status', 'value', 'segment', 'tag'];
      const sortColumn = validSortCols.includes(sortBy) ? sortBy : 'created_at';
      const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      sql += ` ORDER BY ${sortColumn} ${sortDirection} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(sql, params);

      // Status breakdown & opt-in counts for filter pills
      const summaryRes = await query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE whatsapp_opted = true) as whatsapp_opted_count,
          COUNT(*) FILTER (WHERE whatsapp_opted = false) as whatsapp_non_opted_count
        FROM contacts
      `);

      const formatted = result.rows.map((c) => ({
        id: c.id,
        userId: c.user_id || `USR_${c.id}`,
        name: c.name,
        phone: c.phone,
        countryCode: c.country_code || '+91',
        email: c.email || '—',
        tag: c.tag || 'Lead',
        tags: Array.isArray(c.tags) ? c.tags : [c.tag || 'Lead'],
        segment: c.segment || 'General',
        status: c.status || 'Open',
        whatsappOpted: c.whatsapp_opted ?? true,
        value: c.value ? Number(c.value) : 0,
        owner: c.owner || 'Shraddha',
        channel: c.channel || 'whatsapp',
        notes: c.notes || '',
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));

      res.json({
        success: true,
        data: formatted,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        counts: {
          total: parseInt(summaryRes.rows[0].total, 10),
          whatsappOpted: parseInt(summaryRes.rows[0].whatsapp_opted_count, 10),
          whatsappNonOpted: parseInt(summaryRes.rows[0].whatsapp_non_opted_count, 10),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/contacts/count (Dynamic Audience Calculator from PostgreSQL)
  getCount: async (req, res, next) => {
    try {
      const {
        savedSegmentId,
        conditions: rawConditions,
        logic = 'AND',
        whatsapp_opted,
        tag,
        status,
      } = req.query;

      let sql = 'SELECT COUNT(*) FROM contacts WHERE 1=1';
      let params = [];

      let conditionsToApply = [];
      if (savedSegmentId && savedSegmentId !== 'all') {
        const segRes = await query('SELECT conditions FROM segments WHERE id = $1', [savedSegmentId]);
        if (segRes.rows.length > 0 && Array.isArray(segRes.rows[0].conditions)) {
          conditionsToApply = segRes.rows[0].conditions;
        }
      } else if (rawConditions) {
        try {
          conditionsToApply = typeof rawConditions === 'string' ? JSON.parse(rawConditions) : rawConditions;
        } catch {
          conditionsToApply = [];
        }
      }

      if (Array.isArray(conditionsToApply) && conditionsToApply.length > 0) {
        const { clause, params: updatedParams } = buildConditionClause(conditionsToApply, logic, params);
        sql += clause;
        params = updatedParams;
      } else {
        if (tag && tag !== 'all') {
          params.push(tag);
          sql += ` AND (tag = $${params.length} OR tags @> jsonb_build_array($${params.length}::text))`;
        }
        if (status && status !== 'all') {
          params.push(status);
          sql += ` AND status = $${params.length}`;
        }
      }

      if (whatsapp_opted !== undefined && whatsapp_opted !== 'all' && whatsapp_opted !== '') {
        const isOpted = String(whatsapp_opted) === 'true';
        params.push(isOpted);
        sql += ` AND whatsapp_opted = $${params.length}`;
      }

      const result = await query(sql, params);
      const count = parseInt(result.rows[0].count, 10);

      res.json({ success: true, count });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/contacts (Single Contact Creation with duplicate detection)
  create: async (req, res, next) => {
    try {
      const { name, phone, countryCode = '+91', userId, email, tag, tags, segment, status, whatsappOpted = true, value, notes, owner } = req.body;

      if (!name || !name.trim() || !phone || !phone.trim()) {
        return res.status(400).json({ success: false, error: 'Name and Phone Number are required' });
      }

      const normalizedPhone = normalizePhoneNumber(phone, countryCode);

      // Duplicate Check
      const existing = await query('SELECT id, name FROM contacts WHERE phone = $1', [normalizedPhone]);
      if (existing.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: `A contact with phone ${normalizedPhone} already exists (${existing.rows[0].name})`,
          existingContact: existing.rows[0],
        });
      }

      const contactId = `cnt_${Date.now()}`;
      const safeUserId = userId ? userId.trim() : `USR_${contactId.slice(4)}`;
      const safeTag = tag || (Array.isArray(tags) && tags.length > 0 ? tags[0] : 'Lead');
      const safeTags = Array.isArray(tags) && tags.length > 0 ? tags : [safeTag];

      const insertRes = await query(
        `INSERT INTO contacts (
           id, user_id, name, phone, country_code, email, tag, tags, segment, status,
           whatsapp_opted, value, notes, owner, channel, created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'whatsapp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          contactId,
          safeUserId,
          name.trim(),
          normalizedPhone,
          countryCode,
          email ? email.trim() : '—',
          safeTag,
          JSON.stringify(safeTags),
          segment || 'High Intent',
          status || 'Open Lead',
          whatsappOpted ?? true,
          value ? parseFloat(value) : 0,
          notes ? notes.trim() : '',
          owner || 'Shraddha',
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Contact created successfully',
        data: insertRes.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/contacts/bulk-upload (High-performance CSV bulk upload & duplicate validation)
  bulkUpload: async (req, res, next) => {
    const client = await pool.connect();
    try {
      const { rows } = req.body;

      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ success: false, error: 'No contact rows provided for bulk upload' });
      }

      const totalRows = rows.length;
      const validRows = [];
      const duplicateRows = [];
      const failedRows = [];
      const seenBatchPhones = new Set();

      // 1. Fetch all existing phones in database for fast O(1) set lookup
      const existingPhonesRes = await client.query('SELECT phone FROM contacts');
      const dbPhoneSet = new Set(existingPhonesRes.rows.map((r) => r.phone));

      // 2. Validate & deduplicate rows in memory
      rows.forEach((row, idx) => {
        const rowNum = idx + 1;
        const rawName = row.name || row.Name || row['Full Name'];
        const rawPhone = row.phone || row.Phone || row['Phone Number'] || row.mobile || row.Mobile;
        const rawEmail = row.email || row.Email || '';
        const rawUserId = row.userId || row.user_id || row['User ID'] || '';
        const rawTag = row.tag || row.Tag || row.tags || 'Lead';
        const rawSegment = row.segment || row.Segment || 'High Intent';
        const rawStatus = row.status || row.Status || 'Open Lead';
        const rawOpted = row.whatsapp_opted || row.whatsappOpted || row['WhatsApp Opted'] || true;
        const rawValue = row.value || row.Value || row['Deal Value'] || 0;

        if (!rawName || !rawPhone || !String(rawName).trim() || !String(rawPhone).trim()) {
          failedRows.push({ row: rowNum, data: row, reason: 'Missing required Name or Phone' });
          return;
        }

        const normalizedPhone = normalizePhoneNumber(rawPhone);

        // Check if phone already in DB
        if (dbPhoneSet.has(normalizedPhone)) {
          duplicateRows.push({ row: rowNum, name: rawName, phone: normalizedPhone, reason: 'Phone number already exists in database' });
          return;
        }

        // Check if phone duplicated inside current CSV batch
        if (seenBatchPhones.has(normalizedPhone)) {
          duplicateRows.push({ row: rowNum, name: rawName, phone: normalizedPhone, reason: 'Duplicate phone number inside CSV file' });
          return;
        }

        seenBatchPhones.add(normalizedPhone);

        const isOpted = typeof rawOpted === 'string' ? rawOpted.toLowerCase() !== 'false' && rawOpted.toLowerCase() !== 'no' : Boolean(rawOpted);
        const contactId = `cnt_csv_${Date.now()}_${idx}`;
        const userId = rawUserId || `USR_${contactId.slice(8)}`;

        validRows.push({
          id: contactId,
          userId,
          name: String(rawName).trim(),
          phone: normalizedPhone,
          countryCode: normalizedPhone.startsWith('+91') ? '+91' : '+1',
          email: String(rawEmail).trim() || '—',
          tag: String(rawTag).trim() || 'Lead',
          tags: JSON.stringify([String(rawTag).trim() || 'Lead']),
          segment: String(rawSegment).trim() || 'High Intent',
          status: String(rawStatus).trim() || 'Open Lead',
          whatsappOpted: isOpted,
          value: parseFloat(rawValue) || 0,
        });
      });

      // 3. Perform bulk insertion in transactional chunks of 100
      let importedCount = 0;
      if (validRows.length > 0) {
        await client.query('BEGIN');
        const chunkSize = 100;

        for (let i = 0; i < validRows.length; i += chunkSize) {
          const chunk = validRows.slice(i, i + chunkSize);
          const placeholders = [];
          const values = [];

          chunk.forEach((c, cIdx) => {
            const offset = cIdx * 12;
            placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`);
            values.push(
              c.id,
              c.userId,
              c.name,
              c.phone,
              c.countryCode,
              c.email,
              c.tag,
              c.tags,
              c.segment,
              c.status,
              c.whatsappOpted,
              c.value
            );
          });

          await client.query(
            `INSERT INTO contacts (
               id, user_id, name, phone, country_code, email, tag, tags, segment, status, whatsapp_opted, value, created_at, updated_at
             )
             VALUES ${placeholders.join(', ')}
             ON CONFLICT (id) DO NOTHING`,
            values
          );

          importedCount += chunk.length;
        }

        await client.query('COMMIT');
      }

      res.status(200).json({
        success: true,
        message: `Successfully processed ${totalRows} rows: ${importedCount} imported, ${duplicateRows.length} duplicates skipped, ${failedRows.length} invalid.`,
        summary: {
          totalRows,
          importedCount,
          duplicateCount: duplicateRows.length,
          failedCount: failedRows.length,
        },
        duplicates: duplicateRows.slice(0, 20),
        errors: failedRows.slice(0, 20),
      });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  },

  // PUT /api/contacts/:id
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, phone, email, tag, tags, segment, status, whatsappOpted, value, notes, owner } = req.body;

      const updates = [];
      const values = [];

      if (name !== undefined) {
        updates.push(`name = $${updates.length + 1}`);
        values.push(name.trim());
      }
      if (phone !== undefined) {
        updates.push(`phone = $${updates.length + 1}`);
        values.push(normalizePhoneNumber(phone));
      }
      if (email !== undefined) {
        updates.push(`email = $${updates.length + 1}`);
        values.push(email.trim());
      }
      if (tag !== undefined) {
        updates.push(`tag = $${updates.length + 1}`);
        values.push(tag);
      }
      if (tags !== undefined) {
        updates.push(`tags = $${updates.length + 1}`);
        values.push(JSON.stringify(Array.isArray(tags) ? tags : [tags]));
      }
      if (segment !== undefined) {
        updates.push(`segment = $${updates.length + 1}`);
        values.push(segment);
      }
      if (status !== undefined) {
        updates.push(`status = $${updates.length + 1}`);
        values.push(status);
      }
      if (whatsappOpted !== undefined) {
        updates.push(`whatsapp_opted = $${updates.length + 1}`);
        values.push(Boolean(whatsappOpted));
      }
      if (value !== undefined) {
        updates.push(`value = $${updates.length + 1}`);
        values.push(parseFloat(value) || 0);
      }
      if (notes !== undefined) {
        updates.push(`notes = $${updates.length + 1}`);
        values.push(notes);
      }
      if (owner !== undefined) {
        updates.push(`owner = $${updates.length + 1}`);
        values.push(owner);
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const sql = `UPDATE contacts SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`;
      const result = await query(sql, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Contact not found' });
      }

      res.json({ success: true, message: 'Contact updated', data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/contacts/:id
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await query('DELETE FROM contacts WHERE id = $1 RETURNING id', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Contact not found' });
      }
      res.json({ success: true, message: 'Contact deleted' });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/contacts/bulk-delete
  bulkDelete: async (req, res, next) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, error: 'ids array is required' });
      }

      await query('DELETE FROM contacts WHERE id = ANY($1::text[])', [ids]);
      res.json({ success: true, message: `Successfully deleted ${ids.length} contacts` });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/contacts/bulk-tag
  bulkTag: async (req, res, next) => {
    try {
      const { ids, tag, tags } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, error: 'ids array is required' });
      }

      const tagsToAdd = Array.isArray(tags) ? tags : (tag ? [tag] : []);
      if (tagsToAdd.length === 0) {
        return res.status(400).json({ success: false, error: 'At least one tag is required' });
      }

      for (const t of tagsToAdd) {
        await query(
          `UPDATE contacts 
           SET tag = $1, 
               tags = CASE 
                 WHEN tags @> jsonb_build_array($1::text) THEN tags 
                 ELSE tags || jsonb_build_array($1::text) 
               END,
               updated_at = CURRENT_TIMESTAMP 
           WHERE id = ANY($2::text[])`,
          [t, ids]
        );
      }

      res.json({ success: true, message: `Assigned ${tagsToAdd.length} tag(s) to ${ids.length} contacts` });
    } catch (error) {
      next(error);
    }
  },
};
