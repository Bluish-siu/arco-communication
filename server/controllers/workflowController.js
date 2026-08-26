import { db } from '../config/db.js';

export const workflowController = {
  getAll: async (req, res, next) => {
    try {
      const workflows = await db.getAll('workflows');
      res.json({ success: true, count: workflows.length, data: workflows });
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const { name, trigger, action } = req.body;
      if (!name) return res.status(400).json({ success: false, error: 'Name is required' });

      const newWf = await db.insert('workflows', {
        id: `wf_${Date.now()}`,
        name,
        trigger: trigger || 'Incoming message',
        action: action || 'Send automated response',
        status: 'active',
        executions: 0,
      });

      res.status(201).json({ success: true, data: newWf });
    } catch (error) {
      next(error);
    }
  },

  toggleStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const wf = await db.findOne('workflows', 'id = $1', [id]);
      if (!wf) return res.status(404).json({ success: false, error: 'Workflow not found' });

      const newStatus = wf.status === 'active' ? 'paused' : 'active';
      const updated = await db.update('workflows', id, { status: newStatus });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },
};
