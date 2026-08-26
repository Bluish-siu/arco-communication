import { query } from '../config/db.js';

// Helper to extract {{1}}, {{2}} variable numbers from body text
function extractVariables(bodyText) {
  const matches = (bodyText || '').match(/\{\{(\d+)\}\}/g) || [];
  const uniqueVars = Array.from(new Set(matches));
  return uniqueVars.map((v, i) => `Variable ${i + 1}`);
}

export const templateController = {
  // GET /api/templates/library (Grouped by 6 categories)
  getLibraryTemplates: async (req, res, next) => {
    try {
      const { search = '', category = '' } = req.query;

      let sql = 'SELECT * FROM whatsapp_templates WHERE is_library_template = true';
      const values = [];

      if (search && String(search).trim()) {
        values.push(`%${String(search).trim()}%`);
        sql += ` AND (display_name ILIKE $${values.length} OR name ILIKE $${values.length} OR body ILIKE $${values.length})`;
      }

      if (category && category !== 'All') {
        values.push(category.toUpperCase());
        sql += ` AND UPPER(library_category) = $${values.length}`;
      }

      sql += ' ORDER BY created_at ASC';

      const result = await query(sql, values);

      // Group by the 6 standard Interakt categories
      const categories = [
        'PROMOTIONAL',
        'TRANSACTIONAL',
        'SERVICE_ALERTS',
        'LEAD_QUALIFICATION',
        'INFORMATIVE',
        'OCCASION_BASED',
      ];

      const grouped = {};
      categories.forEach((cat) => {
        grouped[cat] = [];
      });

      result.rows.forEach((row) => {
        const cat = row.library_category || 'PROMOTIONAL';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push({
          ...row,
          buttons: typeof row.buttons === 'string' ? JSON.parse(row.buttons) : row.buttons,
          variables: typeof row.variables === 'string' ? JSON.parse(row.variables) : row.variables,
        });
      });

      res.json({
        success: true,
        categories,
        data: grouped,
        total: result.rows.length,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/templates (Active User Templates)
  getActiveTemplates: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { search = '', category = 'All', status = 'All', language = 'All' } = req.query;

      const conditions = ['user_id = $1', 'is_library_template = false', 'deleted_at IS NULL'];
      const values = [userId];

      // Search across name, display_name, body
      if (search && String(search).trim()) {
        values.push(`%${String(search).trim()}%`);
        conditions.push(`(display_name ILIKE $${values.length} OR name ILIKE $${values.length} OR body ILIKE $${values.length})`);
      }

      // Multi-Category Filter
      if (category && category !== 'All' && category !== 'Any') {
        const catList = category.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
        if (catList.length > 0) {
          const placeholders = catList.map((_, i) => `$${values.length + 1 + i}`).join(', ');
          conditions.push(`UPPER(category) IN (${placeholders})`);
          values.push(...catList);
        }
      }

      // Multi-Status Filter
      if (status && status !== 'All' && status !== 'Any') {
        const statusList = status.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
        if (statusList.length > 0) {
          const placeholders = statusList.map((_, i) => `$${values.length + 1 + i}`).join(', ');
          conditions.push(`UPPER(status) IN (${placeholders})`);
          values.push(...statusList);
        }
      }

      // Language Filter
      if (language && language !== 'All' && language !== 'Any') {
        values.push(language);
        conditions.push(`language = $${values.length}`);
      }

      const sql = `SELECT * FROM whatsapp_templates WHERE ${conditions.join(' AND ')} ORDER BY updated_at DESC`;
      const result = await query(sql, values);

      const formatted = result.rows.map((row) => ({
        ...row,
        buttons: typeof row.buttons === 'string' ? JSON.parse(row.buttons) : row.buttons,
        variables: typeof row.variables === 'string' ? JSON.parse(row.variables) : row.variables,
      }));

      res.json({
        success: true,
        templates: formatted,
        total: formatted.length,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/templates/deleted (Soft-deleted templates)
  getDeletedTemplates: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { search = '', category = 'All', language = 'All' } = req.query;

      const conditions = ['user_id = $1', 'is_library_template = false', 'deleted_at IS NOT NULL'];
      const values = [userId];

      if (search && String(search).trim()) {
        values.push(`%${String(search).trim()}%`);
        conditions.push(`(display_name ILIKE $${values.length} OR name ILIKE $${values.length} OR body ILIKE $${values.length})`);
      }

      if (category && category !== 'All' && category !== 'Any') {
        const catList = category.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
        if (catList.length > 0) {
          const placeholders = catList.map((_, i) => `$${values.length + 1 + i}`).join(', ');
          conditions.push(`UPPER(category) IN (${placeholders})`);
          values.push(...catList);
        }
      }

      if (language && language !== 'All' && language !== 'Any') {
        values.push(language);
        conditions.push(`language = $${values.length}`);
      }

      const sql = `SELECT * FROM whatsapp_templates WHERE ${conditions.join(' AND ')} ORDER BY deleted_at DESC`;
      const result = await query(sql, values);

      const formatted = result.rows.map((row) => ({
        ...row,
        buttons: typeof row.buttons === 'string' ? JSON.parse(row.buttons) : row.buttons,
        variables: typeof row.variables === 'string' ? JSON.parse(row.variables) : row.variables,
      }));

      res.json({
        success: true,
        templates: formatted,
        total: formatted.length,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/templates/:id (Single template)
  getTemplateById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await query('SELECT * FROM whatsapp_templates WHERE id = $1 LIMIT 1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      const row = result.rows[0];
      res.json({
        success: true,
        data: {
          ...row,
          buttons: typeof row.buttons === 'string' ? JSON.parse(row.buttons) : row.buttons,
          variables: typeof row.variables === 'string' ? JSON.parse(row.variables) : row.variables,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/templates (Create new template)
  createTemplate: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const {
        name,
        displayName,
        category = 'MARKETING',
        language = 'en_US',
        headerType = 'NONE',
        headerText = '',
        headerMediaUrl = '',
        body,
        footer = '',
        buttons = [],
        variables = [],
        status = 'PENDING',
        createdBy = 'Shraddha Sharma',
      } = req.body;

      if (!name || !body) {
        return res.status(400).json({ success: false, error: 'Template name and body are required' });
      }

      // Format name: lowercase and underscores
      const cleanName = String(name).trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const cleanDisplayName = displayName || name;
      const autoVars = variables && variables.length > 0 ? variables : extractVariables(body);
      const templateId = `tmpl_user_${Date.now()}`;

      const insertSql = `
        INSERT INTO whatsapp_templates (
          id, workspace_id, user_id, name, display_name, category, language,
          status, header_type, header_text, header_media_url, body, footer,
          buttons, variables, is_library_template, created_by
        ) VALUES ($1, 'ws_default', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, false, $15)
        RETURNING *
      `;

      const result = await query(insertSql, [
        templateId,
        userId,
        cleanName,
        cleanDisplayName,
        category.toUpperCase(),
        language,
        status.toUpperCase(),
        headerType.toUpperCase(),
        headerText || null,
        headerMediaUrl || null,
        body,
        footer || null,
        JSON.stringify(buttons),
        JSON.stringify(autoVars),
        createdBy || 'Shraddha Sharma',
      ]);

      res.status(201).json({
        success: true,
        message: 'WhatsApp template created successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/templates/:id (Update template)
  updateTemplate: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const {
        displayName,
        category,
        language,
        headerType,
        headerText,
        headerMediaUrl,
        body,
        footer,
        buttons,
        variables,
        status,
      } = req.body;

      const updates = [];
      const values = [];

      if (displayName !== undefined) {
        updates.push(`display_name = $${updates.length + 1}`);
        values.push(displayName);
      }
      if (category !== undefined) {
        updates.push(`category = $${updates.length + 1}`);
        values.push(category.toUpperCase());
      }
      if (language !== undefined) {
        updates.push(`language = $${updates.length + 1}`);
        values.push(language);
      }
      if (headerType !== undefined) {
        updates.push(`header_type = $${updates.length + 1}`);
        values.push(headerType.toUpperCase());
      }
      if (headerText !== undefined) {
        updates.push(`header_text = $${updates.length + 1}`);
        values.push(headerText);
      }
      if (headerMediaUrl !== undefined) {
        updates.push(`header_media_url = $${updates.length + 1}`);
        values.push(headerMediaUrl);
      }
      if (body !== undefined) {
        updates.push(`body = $${updates.length + 1}`);
        values.push(body);
        if (variables === undefined) {
          updates.push(`variables = $${updates.length + 1}`);
          values.push(JSON.stringify(extractVariables(body)));
        }
      }
      if (footer !== undefined) {
        updates.push(`footer = $${updates.length + 1}`);
        values.push(footer);
      }
      if (buttons !== undefined) {
        updates.push(`buttons = $${updates.length + 1}`);
        values.push(JSON.stringify(buttons));
      }
      if (variables !== undefined) {
        updates.push(`variables = $${updates.length + 1}`);
        values.push(JSON.stringify(variables));
      }
      if (status !== undefined) {
        updates.push(`status = $${updates.length + 1}`);
        values.push(status.toUpperCase());
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id, userId);

      const sql = `UPDATE whatsapp_templates SET ${updates.join(', ')} WHERE id = $${values.length - 1} AND user_id = $${values.length} RETURNING *`;
      const result = await query(sql, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Template not found or update unauthorized' });
      }

      res.json({
        success: true,
        message: 'Template updated successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/templates/:id (Soft delete)
  deleteTemplate: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;

      const result = await query(
        'UPDATE whatsapp_templates SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      res.json({
        success: true,
        message: 'Template moved to Deleted tab',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/templates/:id/restore
  restoreTemplate: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;

      const result = await query(
        'UPDATE whatsapp_templates SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      res.json({
        success: true,
        message: 'Template restored successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/templates/:id/duplicate
  duplicateTemplate: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;

      const originalRes = await query('SELECT * FROM whatsapp_templates WHERE id = $1 LIMIT 1', [id]);
      if (originalRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Original template not found' });
      }

      const orig = originalRes.rows[0];
      const newId = `tmpl_user_${Date.now()}`;
      const newName = `${orig.name}_copy_${Date.now().toString().slice(-4)}`;
      const newDisplayName = `${orig.display_name} (Copy)`;

      const insertSql = `
        INSERT INTO whatsapp_templates (
          id, workspace_id, user_id, name, display_name, category, language,
          status, header_type, header_text, header_media_url, body, footer,
          buttons, variables, is_library_template, created_by
        ) VALUES ($1, 'ws_default', $2, $3, $4, $5, $6, 'DRAFT', $7, $8, $9, $10, $11, $12, $13, false, $14)
        RETURNING *
      `;

      const result = await query(insertSql, [
        newId,
        userId,
        newName,
        newDisplayName,
        orig.category,
        orig.language,
        orig.header_type,
        orig.header_text,
        orig.header_media_url,
        orig.body,
        orig.footer,
        JSON.stringify(typeof orig.buttons === 'string' ? JSON.parse(orig.buttons) : (orig.buttons || [])),
        JSON.stringify(typeof orig.variables === 'string' ? JSON.parse(orig.variables) : (orig.variables || [])),
        orig.created_by || 'Shraddha Sharma',
      ]);

      res.json({
        success: true,
        message: 'Template duplicated successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/templates/:id/submit (Submit for Meta Approval)
  submitTemplate: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;

      // Update status to APPROVED
      const result = await query(
        `UPDATE whatsapp_templates 
         SET status = 'APPROVED', meta_status = 'APPROVED', meta_template_id = 'meta_tmpl_' || substr(md5(random()::text), 1, 10), updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 AND user_id = $2 
         RETURNING *`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      res.json({
        success: true,
        message: 'Template submitted and approved by Meta WhatsApp!',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/templates/:id/test (Send Test WhatsApp Message)
  testTemplate: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { recipientPhone, variables } = req.body;

      if (!recipientPhone) {
        return res.status(400).json({ success: false, error: 'Recipient phone number is required' });
      }

      const tmplRes = await query('SELECT * FROM whatsapp_templates WHERE id = $1 LIMIT 1', [id]);
      if (tmplRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      res.json({
        success: true,
        message: `Test template "${tmplRes.rows[0].display_name}" dispatched to ${recipientPhone}`,
        data: {
          messageId: `wamid_test_${Date.now()}`,
          recipientPhone,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/templates/:id/permanent (Permanent delete)
  deletePermanent: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;

      const result = await query('DELETE FROM whatsapp_templates WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      res.json({
        success: true,
        message: 'Template permanently deleted',
      });
    } catch (error) {
      next(error);
    }
  },
};
