import { query } from '../config/db.js';
import { buildConditionClause } from './contactController.js';

export const segmentController = {
  // GET /api/segments/metadata (Returns distinct tags, contact fields, and available events)
  getMetadata: async (req, res, next) => {
    try {
      // 1. Fetch distinct tags from contacts
      const tagsRes = await query(`
        SELECT DISTINCT jsonb_array_elements_text(tags) as tag_name 
        FROM contacts 
        WHERE tags IS NOT NULL AND tags != '[]'::jsonb
        UNION
        SELECT DISTINCT tag as tag_name 
        FROM contacts 
        WHERE tag IS NOT NULL AND tag != ''
      `);
      
      const defaultTags = ['VIP', 'Lead', 'Customer', 'High Intent', 'D2C', 'Enterprise', 'Monsoon Sale', 'Repeat Buyer'];
      const dbTags = tagsRes.rows.map((r) => r.tag_name).filter(Boolean);
      const combinedTags = Array.from(new Set([...defaultTags, ...dbTags])).sort();

      // 2. Standard Contact Fields
      const fields = [
        { id: 'name', label: 'Full Name', type: 'text' },
        { id: 'email', label: 'Email Address', type: 'text' },
        { id: 'phone', label: 'Phone Number', type: 'text' },
        { id: 'city', label: 'City', type: 'text' },
        { id: 'country_code', label: 'Country Code', type: 'text' },
        { id: 'value', label: 'Contact Deal Value', type: 'number' },
        { id: 'created_at', label: 'Creation Date', type: 'date' },
        { id: 'whatsapp_opted', label: 'WhatsApp Opted In', type: 'boolean' },
      ];

      // 3. Standard Events
      const events = [
        { id: 'order_placed', label: 'Order Placed' },
        { id: 'cart_abandoned', label: 'Cart Abandoned' },
        { id: 'message_sent', label: 'WhatsApp Message Sent' },
        { id: 'form_submitted', label: 'Lead Form Submitted' },
        { id: 'link_clicked', label: 'Campaign Link Clicked' },
      ];

      res.json({
        success: true,
        data: {
          tags: combinedTags,
          fields,
          events,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/segments (Fetches saved segments and calculates live recipient count for each)
  getAll: async (req, res, next) => {
    try {
      const effectiveUserId = req.user?.id || 'usr_1790574599220';
      const isAdminNilesh = effectiveUserId === 'usr_1790574599220';

      let sql = 'SELECT * FROM segments WHERE 1=1';
      const segParams = [];
      if (isAdminNilesh) {
        segParams.push('usr_1790574599220');
        sql += ` AND (user_id = $${segParams.length} OR user_id IS NULL)`;
      } else {
        segParams.push(effectiveUserId);
        sql += ` AND user_id = $${segParams.length}`;
      }
      sql += ' ORDER BY created_at DESC';

      const result = await query(sql, segParams);

      const segmentsWithLiveCount = await Promise.all(
        result.rows.map(async (s) => {
          let countSql = 'SELECT COUNT(*) FROM contacts WHERE 1=1';
          let params = [];

          if (isAdminNilesh) {
            params.push('usr_1790574599220');
            countSql += ` AND (user_id = $${params.length} OR user_id IS NULL)`;
          } else {
            params.push(effectiveUserId);
            countSql += ` AND user_id = $${params.length}`;
          }

          let conditions = s.conditions;
          if (typeof conditions === 'string') {
            try {
              conditions = JSON.parse(conditions);
            } catch (e) {
              conditions = [];
            }
          }

          if (Array.isArray(conditions) && conditions.length > 0) {
            const { clause, params: updatedParams } = buildConditionClause(conditions, s.logic || 'AND', params);
            countSql += clause;
            params = updatedParams;
          }

          const countRes = await query(countSql, params);
          const liveCount = parseInt(countRes.rows[0].count, 10);

          return {
            id: s.id,
            name: s.name,
            description: s.description || '',
            filterType: s.filter_type || 'custom',
            conditions: conditions || [],
            logic: s.logic || 'AND',
            estimatedCount: liveCount,
            whatsappOpted: s.whatsapp_opted !== false,
            createdBy: s.created_by || 'Shraddha Sharma',
            createdAt: s.created_at,
            updatedAt: s.updated_at,
          };
        })
      );

      res.json({ success: true, count: segmentsWithLiveCount.length, data: segmentsWithLiveCount });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/segments/:id
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const effectiveUserId = req.user?.id || 'usr_1790574599220';
      const isAdminNilesh = effectiveUserId === 'usr_1790574599220';

      const result = await query('SELECT * FROM segments WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Segment not found' });
      }

      const s = result.rows[0];
      if (!isAdminNilesh && s.user_id && s.user_id !== effectiveUserId) {
        return res.status(404).json({ success: false, error: 'Segment not found' });
      }
      let conditions = s.conditions;
      if (typeof conditions === 'string') {
        try {
          conditions = JSON.parse(conditions);
        } catch (e) {
          conditions = [];
        }
      }

      res.json({
        success: true,
        data: {
          id: s.id,
          name: s.name,
          description: s.description,
          filterType: s.filter_type,
          conditions,
          logic: s.logic || 'AND',
          estimatedCount: s.estimated_count,
          whatsappOpted: s.whatsapp_opted !== false,
          createdBy: s.created_by || 'Shraddha Sharma',
          createdAt: s.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/segments (Save audience filter as segment)
  create: async (req, res, next) => {
    try {
      const {
        name,
        description = '',
        filterType = 'custom',
        conditions = [],
        logic = 'AND',
        whatsappOpted = true,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Segment name is required' });
      }

      // If whatsappOpted is true, ensure whatsapp_opted condition is included if not already present
      const finalConditions = [...conditions];
      if (whatsappOpted) {
        const hasOptedCond = finalConditions.some(
          (c) => c.field === 'whatsapp_opted' && (c.value === 'true' || c.value === true)
        );
        if (!hasOptedCond) {
          finalConditions.push({
            category: 'field',
            field: 'whatsapp_opted',
            operator: 'is',
            value: 'true',
          });
        }
      }

      const effectiveUserId = req.user?.id || 'usr_1790574599220';
      const isAdminNilesh = effectiveUserId === 'usr_1790574599220';

      let countSql = 'SELECT COUNT(*) FROM contacts WHERE 1=1';
      let params = [];
      if (isAdminNilesh) {
        params.push('usr_1790574599220');
        countSql += ` AND (user_id = $${params.length} OR user_id IS NULL)`;
      } else {
        params.push(effectiveUserId);
        countSql += ` AND user_id = $${params.length}`;
      }

      if (Array.isArray(finalConditions) && finalConditions.length > 0) {
        const { clause, params: updatedParams } = buildConditionClause(finalConditions, logic, params);
        countSql += clause;
        params = updatedParams;
      }

      const countRes = await query(countSql, params);
      const estimatedCount = parseInt(countRes.rows[0].count, 10);

      const segmentId = `seg_${Date.now()}`;
      const result = await query(
        `INSERT INTO segments (id, user_id, name, description, filter_type, conditions, estimated_count, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          segmentId,
          effectiveUserId,
          name.trim(),
          description ? description.trim() : '',
          filterType,
          JSON.stringify(finalConditions),
          estimatedCount,
          req.user?.name || 'Shraddha Sharma',
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Saved audience segment created successfully',
        data: {
          ...result.rows[0],
          conditions: finalConditions,
          estimatedCount,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/segments/:id
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, conditions, logic = 'AND', whatsappOpted } = req.body;
      const effectiveUserId = req.user?.id || 'usr_1790574599220';
      const isAdminNilesh = effectiveUserId === 'usr_1790574599220';

      const existing = await query('SELECT * FROM segments WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Segment not found' });
      }
      if (!isAdminNilesh && existing.rows[0].user_id && existing.rows[0].user_id !== effectiveUserId) {
        return res.status(404).json({ success: false, error: 'Segment not found' });
      }

      const updates = [];
      const values = [];

      if (name !== undefined) {
        updates.push(`name = $${updates.length + 1}`);
        values.push(name.trim());
      }
      if (description !== undefined) {
        updates.push(`description = $${updates.length + 1}`);
        values.push(description.trim());
      }
      if (conditions !== undefined) {
        updates.push(`conditions = $${updates.length + 1}`);
        values.push(JSON.stringify(conditions));
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const sql = `UPDATE segments SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`;
      const result = await query(sql, values);

      res.json({ success: true, message: 'Segment updated', data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/segments/:id
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const effectiveUserId = req.user?.id || 'usr_1790574599220';
      const isAdminNilesh = effectiveUserId === 'usr_1790574599220';

      const existing = await query('SELECT * FROM segments WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Segment not found' });
      }
      if (!isAdminNilesh && existing.rows[0].user_id && existing.rows[0].user_id !== effectiveUserId) {
        return res.status(404).json({ success: false, error: 'Segment not found' });
      }

      await query('DELETE FROM segments WHERE id = $1', [id]);
      res.json({ success: true, message: 'Segment deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/segments/shopify (Fetches pre-built Shopify smart segments with live recipient counts)
  getShopifySegments: async (req, res, next) => {
    try {
      const storeRes = await query(
        "SELECT shop_domain, shop_name FROM shopify_integrations WHERE status = 'connected' LIMIT 1"
      );
      const connectedStore = storeRes.rows[0] || null;

      const baseWhere = `(channel = 'shopify' OR tags @> '["Shopify"]'::jsonb OR tags @> '["Shopify Order"]'::jsonb OR custom_attributes->>'shopify_shop' IS NOT NULL OR tag = 'Customer' OR tags @> '["Customer"]'::jsonb OR phone IN (SELECT phone FROM shopify_abandoned_checkouts WHERE phone IS NOT NULL))`;

      const smartSegmentDefs = [
        {
          id: 'shopify_all',
          name: 'All Shopify Customers',
          description: 'All synchronized buyers and store leads from your Shopify store',
          criteria: 'Purchased on Shopify OR opted-in via store',
          icon: 'ShoppingBag',
          badgeColor: 'emerald',
          where: baseWhere,
        },
        {
          id: 'shopify_vip',
          name: 'VIP & High Spenders',
          description: 'High-value shoppers with cumulative spend ≥ ₹5,000 or tagged VIP',
          criteria: 'Total Spent ≥ ₹5,000 OR Tagged "VIP"',
          icon: 'Crown',
          badgeColor: 'amber',
          where: `(${baseWhere}) AND (COALESCE((custom_attributes->>'total_spent')::numeric, value, 0) >= 5000 OR tags @> '["VIP"]'::jsonb OR tags @> '["High Spenders"]'::jsonb OR tag = 'VIP')`,
        },
        {
          id: 'shopify_repeat',
          name: 'Repeat Buyers',
          description: 'Loyal store customers with 2 or more successful orders',
          criteria: 'Orders Count > 1 OR Tagged "Repeat Buyers"',
          icon: 'Repeat',
          badgeColor: 'blue',
          where: `(${baseWhere}) AND (COALESCE((custom_attributes->>'orders_count')::int, 0) > 1 OR tags @> '["Repeat Buyers"]'::jsonb)`,
        },
        {
          id: 'shopify_first_time',
          name: 'First-Time Buyers',
          description: 'Customers who completed their first purchase and are prime for a 2nd order',
          criteria: 'Orders Count = 1 OR Single Order Tag',
          icon: 'Sparkles',
          badgeColor: 'purple',
          where: `(${baseWhere}) AND (COALESCE((custom_attributes->>'orders_count')::int, 0) = 1 OR tags @> '["Order Placed(Prepaid)"]'::jsonb OR tags @> '["Order Placed(CoD)"]'::jsonb OR tag = 'Customer')`,
        },
        {
          id: 'shopify_abandoned',
          name: 'Abandoned Cart Shoppers',
          description: 'Shoppers who started checkout but left before placing order',
          criteria: 'Unrecovered Checkout in last 30 days OR Tagged "Abandoned Cart"',
          icon: 'ShoppingCart',
          badgeColor: 'rose',
          where: `(tags @> '["Abandoned Cart"]'::jsonb OR phone IN (SELECT phone FROM shopify_abandoned_checkouts WHERE status = 'abandoned' AND phone IS NOT NULL))`,
        },
        {
          id: 'shopify_cod',
          name: 'Cash on Delivery (COD) Shoppers',
          description: 'Customers who prefer COD orders and need confirmation reminders',
          criteria: 'Payment Method = COD OR Tagged "Order Placed(CoD)"',
          icon: 'Banknote',
          badgeColor: 'teal',
          where: `(${baseWhere}) AND (tags @> '["Order Placed(CoD)"]'::jsonb OR custom_attributes->>'payment_gateway' ILIKE '%cod%')`,
        },
      ];

      const segmentsWithCounts = await Promise.all(
        smartSegmentDefs.map(async (def) => {
          const countRes = await query(`SELECT COUNT(*) FROM contacts WHERE ${def.where}`);
          const estimatedCount = parseInt(countRes.rows[0]?.count || 0, 10);
          return {
            id: def.id,
            name: def.name,
            description: def.description,
            criteria: def.criteria,
            icon: def.icon,
            badgeColor: def.badgeColor,
            filterType: 'shopify',
            isShopifySmartSegment: true,
            estimatedCount,
            shopDomain: connectedStore?.shop_domain || 'arco-test-e2a1thrd.myshopify.com',
            whatsappOpted: true,
            createdBy: 'Shopify Sync Engine',
          };
        })
      );

      res.json({
        success: true,
        connectedStore: connectedStore?.shop_domain || null,
        count: segmentsWithCounts.length,
        data: segmentsWithCounts,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/segments/shopify/:segmentType/contacts (Fetches contacts belonging to a specific Shopify segment for preview)
  getShopifySegmentContacts: async (req, res, next) => {
    try {
      const { segmentType } = req.params;
      const baseWhere = `(channel = 'shopify' OR tags @> '["Shopify"]'::jsonb OR tags @> '["Shopify Order"]'::jsonb OR custom_attributes->>'shopify_shop' IS NOT NULL OR tag = 'Customer' OR tags @> '["Customer"]'::jsonb OR phone IN (SELECT phone FROM shopify_abandoned_checkouts WHERE phone IS NOT NULL))`;

      let whereClause = baseWhere;
      switch (segmentType) {
        case 'shopify_vip':
          whereClause = `(${baseWhere}) AND (COALESCE((custom_attributes->>'total_spent')::numeric, value, 0) >= 5000 OR tags @> '["VIP"]'::jsonb OR tags @> '["High Spenders"]'::jsonb OR tag = 'VIP')`;
          break;
        case 'shopify_repeat':
          whereClause = `(${baseWhere}) AND (COALESCE((custom_attributes->>'orders_count')::int, 0) > 1 OR tags @> '["Repeat Buyers"]'::jsonb)`;
          break;
        case 'shopify_first_time':
          whereClause = `(${baseWhere}) AND (COALESCE((custom_attributes->>'orders_count')::int, 0) = 1 OR tags @> '["Order Placed(Prepaid)"]'::jsonb OR tags @> '["Order Placed(CoD)"]'::jsonb OR tag = 'Customer')`;
          break;
        case 'shopify_abandoned':
          whereClause = `(tags @> '["Abandoned Cart"]'::jsonb OR phone IN (SELECT phone FROM shopify_abandoned_checkouts WHERE status = 'abandoned' AND phone IS NOT NULL))`;
          break;
        case 'shopify_cod':
          whereClause = `(${baseWhere}) AND (tags @> '["Order Placed(CoD)"]'::jsonb OR custom_attributes->>'payment_gateway' ILIKE '%cod%')`;
          break;
        case 'shopify_all':
        default:
          whereClause = baseWhere;
          break;
      }

      const contactsRes = await query(
        `SELECT id, name, phone, email, tags, custom_attributes, value, created_at, updated_at 
         FROM contacts 
         WHERE ${whereClause} 
         ORDER BY updated_at DESC LIMIT 50`
      );

      const formattedContacts = contactsRes.rows.map((c) => {
        const attrs = c.custom_attributes || {};
        return {
          id: c.id,
          name: c.name || 'Shopify Customer',
          phone: c.phone,
          email: c.email,
          ordersCount: attrs.orders_count || 1,
          totalSpent: attrs.total_spent ? `₹${parseFloat(attrs.total_spent).toLocaleString('en-IN')}` : (c.value ? `₹${parseFloat(c.value).toLocaleString('en-IN')}` : '₹0'),
          currency: attrs.currency || 'INR',
          tags: Array.isArray(c.tags) ? c.tags : (c.tags ? [c.tags] : []),
          lastOrder: attrs.last_order_name || null,
          createdAt: c.created_at,
        };
      });

      res.json({
        success: true,
        segmentType,
        count: formattedContacts.length,
        contacts: formattedContacts,
      });
    } catch (error) {
      next(error);
    }
  },
};
