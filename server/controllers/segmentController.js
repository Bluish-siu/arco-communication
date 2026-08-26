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
      const result = await query('SELECT * FROM segments ORDER BY created_at DESC');

      const segmentsWithLiveCount = await Promise.all(
        result.rows.map(async (s) => {
          let countSql = 'SELECT COUNT(*) FROM contacts WHERE 1=1';
          let params = [];

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
      const result = await query('SELECT * FROM segments WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Segment not found' });
      }

      const s = result.rows[0];
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

      let countSql = 'SELECT COUNT(*) FROM contacts WHERE 1=1';
      let params = [];

      if (Array.isArray(finalConditions) && finalConditions.length > 0) {
        const { clause, params: updatedParams } = buildConditionClause(finalConditions, logic, params);
        countSql += clause;
        params = updatedParams;
      }

      const countRes = await query(countSql, params);
      const estimatedCount = parseInt(countRes.rows[0].count, 10);

      const segmentId = `seg_${Date.now()}`;
      const result = await query(
        `INSERT INTO segments (id, name, description, filter_type, conditions, estimated_count, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          segmentId,
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

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Segment not found' });
      }

      res.json({ success: true, message: 'Segment updated', data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/segments/:id
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await query('DELETE FROM segments WHERE id = $1 RETURNING id', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Segment not found' });
      }
      res.json({ success: true, message: 'Segment deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
