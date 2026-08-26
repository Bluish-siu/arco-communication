import { db, query } from '../config/db.js';

export const taskController = {
  // GET /api/tasks
  getAll: async (req, res, next) => {
    try {
      const {
        search,
        status,
        deadline,
        contact_status,
        priority,
        assigned_to,
        contact_id,
        sort_by = 'due_date',
        sort_order = 'ASC',
      } = req.query;

      let sql = `
        SELECT t.*, 
               c.name as contact_name, 
               c.phone as contact_phone, 
               c.email as contact_email,
               c.status as contact_status,
               c.tag as contact_tag,
               c.owner as contact_owner,
               c.value as contact_value
        FROM tasks t
        LEFT JOIN contacts c ON t.contact_id = c.id
        WHERE 1=1
      `;
      const params = [];

      // 1. Search Query
      if (search && search.trim()) {
        params.push(`%${search.trim().toLowerCase()}%`);
        sql += ` AND (LOWER(t.title) LIKE $${params.length} 
                     OR LOWER(COALESCE(t.description, '')) LIKE $${params.length} 
                     OR LOWER(COALESCE(c.name, '')) LIKE $${params.length}
                     OR LOWER(COALESCE(c.phone, '')) LIKE $${params.length}
                     OR LOWER(COALESCE(t.assigned_to, '')) LIKE $${params.length})`;
      }

      // 2. Task Deadline Filter (Overdue Tasks, Due Today)
      if (deadline && deadline !== 'all') {
        const deadlines = Array.isArray(deadline) ? deadline : [deadline];
        const deadlineClauses = [];

        deadlines.forEach((d) => {
          const cleanD = String(d).toLowerCase().trim();
          if (cleanD === 'overdue' || cleanD === 'overdue tasks') {
            deadlineClauses.push(`(t.due_date < CURRENT_TIMESTAMP AND t.status NOT IN ('Completed', 'Done'))`);
          } else if (cleanD === 'today' || cleanD === 'due today') {
            deadlineClauses.push(`(t.due_date::date = CURRENT_DATE)`);
          } else if (cleanD === 'tomorrow') {
            deadlineClauses.push(`(t.due_date::date = CURRENT_DATE + INTERVAL '1 day')`);
          } else if (cleanD === 'this_week' || cleanD === 'week') {
            deadlineClauses.push(`(t.due_date >= CURRENT_DATE AND t.due_date <= CURRENT_DATE + INTERVAL '7 days')`);
          }
        });

        if (deadlineClauses.length > 0) {
          sql += ` AND (${deadlineClauses.join(' OR ')})`;
        }
      }

      // 3. Task Status Filter (Todo, In-Progress, Done)
      if (status && status !== 'all') {
        const statuses = Array.isArray(status) ? status : [status];
        const normalized = [];

        statuses.forEach((s) => {
          const cleanS = String(s).toLowerCase().trim();
          if (cleanS === 'todo' || cleanS === 'to do') {
            normalized.push('To Do', 'Todo');
          } else if (cleanS === 'in-progress' || cleanS === 'in progress') {
            normalized.push('In Progress', 'In-Progress');
          } else if (cleanS === 'done' || cleanS === 'completed') {
            normalized.push('Completed', 'Done');
          } else {
            normalized.push(s);
          }
        });

        if (normalized.length > 0) {
          params.push(normalized);
          sql += ` AND t.status = ANY($${params.length})`;
        }
      }

      // 4. Contact Status / Stage Filter (New Lead, Qualification, Needs Analysis, Proposal, Negotiation, Closed Won, Closed Lost)
      if (contact_status && contact_status !== 'all') {
        const cStatuses = Array.isArray(contact_status) ? contact_status : [contact_status];
        if (cStatuses.length > 0) {
          params.push(cStatuses);
          sql += ` AND c.status = ANY($${params.length})`;
        }
      }

      // 5. Priority Filter
      if (priority && priority !== 'all') {
        const priorities = Array.isArray(priority) ? priority : [priority];
        if (priorities.length > 0) {
          params.push(priorities);
          sql += ` AND t.priority = ANY($${params.length})`;
        }
      }

      // 6. Assigned To Filter
      if (assigned_to && assigned_to !== 'all' && assigned_to !== 'All Users') {
        params.push(assigned_to);
        sql += ` AND t.assigned_to = $${params.length}`;
      }

      // 7. Contact ID Filter
      if (contact_id) {
        params.push(contact_id);
        sql += ` AND t.contact_id = $${params.length}`;
      }

      // 8. Sorting
      let sortColumn = 't.due_date';
      const cleanSort = String(sort_by).toLowerCase().trim();
      if (cleanSort === 'created_at' || cleanSort === 'created date' || cleanSort === 'created') {
        sortColumn = 't.created_at';
      } else if (cleanSort === 'priority') {
        sortColumn = `CASE t.priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 ELSE 4 END`;
      } else if (cleanSort === 'title' || cleanSort === 'task name') {
        sortColumn = 't.title';
      } else {
        sortColumn = 't.due_date';
      }

      const direction = String(sort_order).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      sql += ` ORDER BY ${sortColumn} ${direction} NULLS LAST, t.created_at DESC`;

      const result = await query(sql, params);

      const now = new Date();
      const formatted = result.rows.map((t) => {
        const isOverdue = t.due_date && new Date(t.due_date) < now && t.status !== 'Completed' && t.status !== 'Done';
        return {
          id: t.id,
          title: t.title,
          description: t.description || '',
          contactId: t.contact_id,
          contactName: t.contact_name || '—',
          contactPhone: t.contact_phone || '',
          contactEmail: t.contact_email || '',
          contactStatus: t.contact_status || 'New Lead',
          contactTag: t.contact_tag || 'Lead',
          contactOwner: t.contact_owner || 'Shraddha',
          contactValue: parseFloat(t.contact_value || 0),
          assignedTo: t.assigned_to || 'Shraddha',
          dueDate: t.due_date,
          priority: t.priority || 'Medium',
          status: t.status || 'To Do',
          isOverdue,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        };
      });

      // Overall Summary Statistics (Independent of Status Filter for stable header KPIs)
      const summaryRes = await query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status IN ('To Do', 'Todo')) as todo,
          COUNT(*) FILTER (WHERE status IN ('In Progress', 'In-Progress')) as in_progress,
          COUNT(*) FILTER (WHERE status IN ('Completed', 'Done')) as completed,
          COUNT(*) FILTER (WHERE due_date < CURRENT_TIMESTAMP AND status NOT IN ('Completed', 'Done')) as overdue
        FROM tasks
      `);

      const sumRow = summaryRes.rows[0] || {};
      const summary = {
        total: parseInt(sumRow.total || 0, 10),
        todoCount: parseInt(sumRow.todo || 0, 10),
        inProgressCount: parseInt(sumRow.in_progress || 0, 10),
        completedCount: parseInt(sumRow.completed || 0, 10),
        overdueCount: parseInt(sumRow.overdue || 0, 10),
      };

      res.json({
        success: true,
        count: formatted.length,
        summary,
        data: formatted,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/tasks/:id
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await query(
        `SELECT t.*, 
                c.name as contact_name, 
                c.phone as contact_phone, 
                c.email as contact_email,
                c.status as contact_status,
                c.tag as contact_tag,
                c.owner as contact_owner,
                c.value as contact_value
         FROM tasks t
         LEFT JOIN contacts c ON t.contact_id = c.id
         WHERE t.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      const t = result.rows[0];
      const isOverdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Completed' && t.status !== 'Done';

      res.json({
        success: true,
        data: {
          id: t.id,
          title: t.title,
          description: t.description || '',
          contactId: t.contact_id,
          contactName: t.contact_name || '—',
          contactPhone: t.contact_phone || '',
          contactEmail: t.contact_email || '',
          contactStatus: t.contact_status || 'New Lead',
          contactTag: t.contact_tag || 'Lead',
          contactOwner: t.contact_owner || 'Shraddha',
          contactValue: parseFloat(t.contact_value || 0),
          assignedTo: t.assigned_to || 'Shraddha',
          dueDate: t.due_date,
          priority: t.priority || 'Medium',
          status: t.status || 'To Do',
          isOverdue,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/tasks
  create: async (req, res, next) => {
    try {
      const { title, description, contact_id, assigned_to, due_date, priority = 'Medium', status = 'To Do' } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Task title is required' });
      }

      const id = `tsk_${Date.now()}`;
      const result = await query(
        `INSERT INTO tasks (id, title, description, contact_id, assigned_to, due_date, priority, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [id, title.trim(), description || '', contact_id || null, assigned_to || 'Shraddha', due_date || null, priority, status]
      );

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/tasks/:id
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, description, contact_id, assigned_to, due_date, priority, status } = req.body;

      const existing = await query('SELECT * FROM tasks WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      const updates = [];
      const values = [];

      if (title !== undefined) {
        updates.push(`title = $${updates.length + 1}`);
        values.push(title.trim());
      }
      if (description !== undefined) {
        updates.push(`description = $${updates.length + 1}`);
        values.push(description);
      }
      if (contact_id !== undefined) {
        updates.push(`contact_id = $${updates.length + 1}`);
        values.push(contact_id || null);
      }
      if (assigned_to !== undefined) {
        updates.push(`assigned_to = $${updates.length + 1}`);
        values.push(assigned_to);
      }
      if (due_date !== undefined) {
        updates.push(`due_date = $${updates.length + 1}`);
        values.push(due_date || null);
      }
      if (priority !== undefined) {
        updates.push(`priority = $${updates.length + 1}`);
        values.push(priority);
      }
      if (status !== undefined) {
        updates.push(`status = $${updates.length + 1}`);
        values.push(status);
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`;
      const result = await query(sql, values);

      res.json({
        success: true,
        message: 'Task updated successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/tasks/:id/status
  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required' });
      }

      const result = await query(
        `UPDATE tasks 
         SET status = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 
         RETURNING *`,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      res.json({
        success: true,
        message: `Task status updated to ${status}`,
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/tasks/:id
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      res.json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
