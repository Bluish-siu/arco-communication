import { db, query } from '../config/db.js';

export const chatAssignmentController = {
  // GET /api/chat-assignment/settings
  getSettings: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';

      const result = await query(
        `SELECT * FROM chat_assignment_settings WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1`,
        [userId]
      );

      if (result.rows.length > 0) {
        const row = result.rows[0];
        return res.json({
          success: true,
          data: {
            id: row.id,
            defaultRule: row.default_rule || 'round_robin',
            assignOnlyOnline: !!row.assign_only_online,
            reassignOffline: !!row.reassign_offline,
            lastAssignedAgentId: row.last_assigned_agent_id,
            updatedAt: row.updated_at,
          },
        });
      }

      // Default settings fallback
      res.json({
        success: true,
        data: {
          id: 'cas_default',
          defaultRule: 'round_robin',
          assignOnlyOnline: true,
          reassignOffline: false,
          lastAssignedAgentId: null,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/chat-assignment/settings
  updateSettings: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { defaultRule, assignOnlyOnline, reassignOffline } = req.body;

      const validDefaultRule = ['round_robin', 'equal_load', 'none'].includes(defaultRule)
        ? defaultRule
        : 'round_robin';

      const existing = await query(
        `SELECT id FROM chat_assignment_settings WHERE user_id = $1 LIMIT 1`,
        [userId]
      );

      let resultRow;
      if (existing.rows.length > 0) {
        const updateRes = await query(
          `UPDATE chat_assignment_settings SET
             default_rule = $1,
             assign_only_online = $2,
             reassign_offline = $3,
             updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $4
           RETURNING *`,
          [validDefaultRule, !!assignOnlyOnline, !!reassignOffline, userId]
        );
        resultRow = updateRes.rows[0];
      } else {
        const insertRes = await query(
          `INSERT INTO chat_assignment_settings (
             id, user_id, default_rule, assign_only_online, reassign_offline, created_at, updated_at
           ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           RETURNING *`,
          [`cas_${Date.now()}`, userId, validDefaultRule, !!assignOnlyOnline, !!reassignOffline]
        );
        resultRow = insertRes.rows[0];
      }

      res.json({
        success: true,
        message: 'Chat assignment settings updated successfully',
        data: {
          id: resultRow.id,
          defaultRule: resultRow.default_rule,
          assignOnlyOnline: resultRow.assign_only_online,
          reassignOffline: resultRow.reassign_offline,
          updatedAt: resultRow.updated_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/chat-assignment/rules
  getRules: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';

      const result = await query(
        `SELECT id, name, trait, condition, values, assigned_agents, is_active, priority, created_at, updated_at
         FROM chat_assignment_rules
         WHERE user_id = $1
         ORDER BY priority ASC, created_at DESC`,
        [userId]
      );

      const rules = result.rows.map((r) => ({
        id: r.id,
        name: r.name,
        trait: r.trait,
        condition: r.condition,
        values: typeof r.values === 'string' ? JSON.parse(r.values) : r.values || [],
        assignedAgents: typeof r.assigned_agents === 'string' ? JSON.parse(r.assigned_agents) : r.assigned_agents || [],
        isActive: !!r.is_active,
        priority: r.priority || 0,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

      res.json({ success: true, count: rules.length, data: rules });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/chat-assignment/rules
  createRule: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { name, trait, condition, values, assignedAgents, isActive = true } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Chat Assignment Name is required' });
      }
      if (!trait) {
        return res.status(400).json({ success: false, message: 'User Trait is required' });
      }
      if (!condition) {
        return res.status(400).json({ success: false, message: 'Condition is required' });
      }
      if (!Array.isArray(values) || values.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one trait value is required' });
      }
      if (!Array.isArray(assignedAgents) || assignedAgents.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one assigned agent is required' });
      }

      const ruleId = `car_${Date.now()}`;

      const insertRes = await query(
        `INSERT INTO chat_assignment_rules (
           id, user_id, name, trait, condition, values, assigned_agents, is_active, priority, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          ruleId,
          userId,
          name.trim(),
          trait,
          condition,
          JSON.stringify(values),
          JSON.stringify(assignedAgents),
          isActive,
        ]
      );

      const r = insertRes.rows[0];

      res.status(201).json({
        success: true,
        message: 'Custom assignment rule created successfully',
        data: {
          id: r.id,
          name: r.name,
          trait: r.trait,
          condition: r.condition,
          values: typeof r.values === 'string' ? JSON.parse(r.values) : r.values,
          assignedAgents: typeof r.assigned_agents === 'string' ? JSON.parse(r.assigned_agents) : r.assigned_agents,
          isActive: r.is_active,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/chat-assignment/rules/:id
  updateRule: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const { name, trait, condition, values, assignedAgents, isActive } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Chat Assignment Name is required' });
      }
      if (!trait) {
        return res.status(400).json({ success: false, message: 'User Trait is required' });
      }
      if (!condition) {
        return res.status(400).json({ success: false, message: 'Condition is required' });
      }
      if (!Array.isArray(values) || values.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one trait value is required' });
      }
      if (!Array.isArray(assignedAgents) || assignedAgents.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one assigned agent is required' });
      }

      const updateRes = await query(
        `UPDATE chat_assignment_rules SET
           name = $1,
           trait = $2,
           condition = $3,
           values = $4,
           assigned_agents = $5,
           is_active = COALESCE($6, is_active),
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $7 AND user_id = $8
         RETURNING *`,
        [
          name.trim(),
          trait,
          condition,
          JSON.stringify(values),
          JSON.stringify(assignedAgents),
          isActive,
          id,
          userId,
        ]
      );

      if (updateRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Assignment rule not found' });
      }

      const r = updateRes.rows[0];

      res.json({
        success: true,
        message: 'Custom assignment rule updated successfully',
        data: {
          id: r.id,
          name: r.name,
          trait: r.trait,
          condition: r.condition,
          values: typeof r.values === 'string' ? JSON.parse(r.values) : r.values,
          assignedAgents: typeof r.assigned_agents === 'string' ? JSON.parse(r.assigned_agents) : r.assigned_agents,
          isActive: r.is_active,
          updatedAt: r.updated_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/chat-assignment/rules/:id
  deleteRule: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;

      const deleteRes = await query(
        `DELETE FROM chat_assignment_rules WHERE id = $1 AND user_id = $2 RETURNING id`,
        [id, userId]
      );

      if (deleteRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Assignment rule not found' });
      }

      res.json({
        success: true,
        message: 'Custom assignment rule deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/chat-assignment/agents
  getAgents: async (req, res, next) => {
    try {
      const usersResult = await query(
        `SELECT id, name, email, role FROM users ORDER BY created_at ASC`
      );

      const convsResult = await query(`SELECT assignee, status_filter FROM conversations WHERE status_filter = 'open'`);
      const openChats = convsResult.rows || [];

      const openCountMap = {};
      openChats.forEach((c) => {
        const a = c.assignee || 'Unassigned';
        openCountMap[a] = (openCountMap[a] || 0) + 1;
      });

      const agents = usersResult.rows.map((u, i) => ({
        id: u.id,
        name: u.name || 'ARCO Agent',
        email: u.email || 'agent@arco.com',
        role: u.role || 'agent',
        status: i === 3 ? 'away' : 'online',
        openChatsCount: openCountMap[u.name] || openCountMap[u.id] || (i === 0 ? 3 : i === 1 ? 1 : 0),
      }));

      res.json({ success: true, count: agents.length, data: agents });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/chat-assignment/evaluate
  // Evaluates a conversation / contact payload against Custom Rules -> Default Rule (Round Robin / Equal Load)
  evaluateAssignment: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { contactName, contactPhone, contactEmail, tag, channel, country, city } = req.body;

      // 1. Fetch active settings
      const setRes = await query(
        `SELECT default_rule, assign_only_online, reassign_offline, last_assigned_agent_id FROM chat_assignment_settings WHERE user_id = $1 LIMIT 1`,
        [userId]
      );
      const settings = setRes.rows[0] || {
        default_rule: 'round_robin',
        assign_only_online: true,
        reassign_offline: false,
        last_assigned_agent_id: null,
      };

      // 2. Fetch available agents
      const usersRes = await query(`SELECT id, name, email, role FROM users ORDER BY created_at ASC`);
      let availableAgents = usersRes.rows.map((u, idx) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        status: idx === 3 ? 'away' : 'online',
      }));

      if (settings.assign_only_online) {
        availableAgents = availableAgents.filter((a) => a.status === 'online');
      }

      if (availableAgents.length === 0) {
        return res.json({
          success: true,
          data: {
            assignedAgent: 'Unassigned',
            appliedRule: 'None (No Online Agents)',
            ruleType: 'none',
          },
        });
      }

      // 3. Evaluate Custom Assignment Rules first
      const rulesRes = await query(
        `SELECT * FROM chat_assignment_rules WHERE user_id = $1 AND is_active = true ORDER BY priority ASC, created_at DESC`,
        [userId]
      );
      const customRules = rulesRes.rows || [];

      for (const rule of customRules) {
        const values = typeof rule.values === 'string' ? JSON.parse(rule.values) : rule.values || [];
        const ruleAgents = typeof rule.assigned_agents === 'string' ? JSON.parse(rule.assigned_agents) : rule.assigned_agents || [];

        let traitValue = '';
        if (rule.trait === 'tag') traitValue = tag || '';
        else if (rule.trait === 'name') traitValue = contactName || '';
        else if (rule.trait === 'phone') traitValue = contactPhone || '';
        else if (rule.trait === 'email') traitValue = contactEmail || '';
        else if (rule.trait === 'channel') traitValue = channel || 'whatsapp';
        else if (rule.trait === 'country') traitValue = country || '';
        else if (rule.trait === 'city') traitValue = city || '';

        traitValue = String(traitValue).toLowerCase();

        let matches = false;
        for (const val of values) {
          const v = String(val).toLowerCase();
          if (rule.condition === 'equals' && traitValue === v) matches = true;
          else if (rule.condition === 'not_equals' && traitValue !== v) matches = true;
          else if (rule.condition === 'contains' && traitValue.includes(v)) matches = true;
          else if (rule.condition === 'does_not_contain' && !traitValue.includes(v)) matches = true;
          else if (rule.condition === 'starts_with' && traitValue.startsWith(v)) matches = true;
          else if (rule.condition === 'ends_with' && traitValue.endsWith(v)) matches = true;
        }

        if (matches && ruleAgents.length > 0) {
          let eligibleRuleAgents = availableAgents.filter((a) =>
            ruleAgents.some((ra) => ra.id === a.id || ra.name === a.name)
          );
          if (eligibleRuleAgents.length === 0) eligibleRuleAgents = availableAgents;

          const chosenAgent = eligibleRuleAgents[0];

          return res.json({
            success: true,
            data: {
              assignedAgent: chosenAgent.name,
              assignedAgentId: chosenAgent.id,
              appliedRule: rule.name,
              ruleType: 'custom_rule',
              matchedTrait: rule.trait,
            },
          });
        }
      }

      // 4. Default Assignment Rule Evaluation
      if (settings.default_rule === 'round_robin') {
        let nextIndex = 0;
        if (settings.last_assigned_agent_id) {
          const lastIdx = availableAgents.findIndex((a) => a.id === settings.last_assigned_agent_id);
          if (lastIdx !== -1) {
            nextIndex = (lastIdx + 1) % availableAgents.length;
          }
        }
        const chosen = availableAgents[nextIndex];

        // Persist last assigned agent in PostgreSQL
        await query(
          `UPDATE chat_assignment_settings SET last_assigned_agent_id = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
          [chosen.id, userId]
        );

        return res.json({
          success: true,
          data: {
            assignedAgent: chosen.name,
            assignedAgentId: chosen.id,
            appliedRule: 'Round Robin',
            ruleType: 'default_round_robin',
          },
        });
      } else if (settings.default_rule === 'equal_load') {
        const convsRes = await query(`SELECT assignee FROM conversations WHERE status_filter = 'open'`);
        const openChats = convsRes.rows || [];
        const countMap = {};
        availableAgents.forEach((a) => {
          countMap[a.name] = openChats.filter((c) => c.assignee === a.name).length;
        });

        // Find agent with lowest count
        let lowestCount = Infinity;
        let chosen = availableAgents[0];
        availableAgents.forEach((a) => {
          if (countMap[a.name] < lowestCount) {
            lowestCount = countMap[a.name];
            chosen = a;
          }
        });

        return res.json({
          success: true,
          data: {
            assignedAgent: chosen.name,
            assignedAgentId: chosen.id,
            appliedRule: 'Equal Load Balancing',
            ruleType: 'default_equal_load',
            currentLoad: lowestCount,
          },
        });
      }

      // None selected
      res.json({
        success: true,
        data: {
          assignedAgent: 'Unassigned',
          appliedRule: 'None (Unassigned)',
          ruleType: 'none',
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
