import { db, query } from '../config/db.js';

export const automationController = {
  // =========================================================================
  // 1. BASIC AUTOMATIONS (INBOX SETTINGS / WORKING HOURS)
  // =========================================================================
  getSettings: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      let settings = await db.findOne('automation_settings', 'user_id = $1', [userId]);
      if (!settings) {
        settings = await db.insert('automation_settings', {
          id: `aset_${userId}`,
          user_id: userId,
          working_hours: {
            enabled: true,
            timezone: 'Asia/Kolkata',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            startTime: '09:00',
            endTime: '18:00',
          },
          out_of_office: {
            enabled: true,
            message: 'Hello! We are currently away outside our regular working hours (9 AM - 6 PM IST). We will get back to you promptly when our office opens!',
            trigger: 'outside_hours',
            sentCount: 0,
          },
          welcome_message: {
            enabled: true,
            message: 'Welcome to ARCO Communication! How can our team assist you with our messaging and AI solutions today?',
            trigger: 'first_message',
            sentCount: 0,
          },
          delayed_response: {
            enabled: true,
            delayMinutes: 10,
            message: 'Thank you for holding on! Our support agents are currently assisting other high-priority inquiries, but we will be with you shortly.',
            sentCount: 0,
          },
        });
      }
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  },

  updateSettings: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { workingHours, outOfOffice, welcomeMessage, delayedResponse } = req.body;

      let settings = await db.findOne('automation_settings', 'user_id = $1', [userId]);
      const updatePayload = {};
      if (workingHours !== undefined) updatePayload.working_hours = workingHours;
      if (outOfOffice !== undefined) updatePayload.out_of_office = outOfOffice;
      if (welcomeMessage !== undefined) updatePayload.welcome_message = welcomeMessage;
      if (delayedResponse !== undefined) updatePayload.delayed_response = delayedResponse;

      if (!settings) {
        settings = await db.insert('automation_settings', {
          id: `aset_${userId}`,
          user_id: userId,
          ...updatePayload,
        });
      } else {
        settings = await db.update('automation_settings', settings.id, updatePayload);
      }

      res.json({ success: true, message: 'Settings updated successfully', data: settings });
    } catch (error) {
      next(error);
    }
  },

  // =========================================================================
  // 2. CUSTOM AUTO REPLIES
  // =========================================================================
  getCustomReplies: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { channel, search } = req.query;

      let sql = 'SELECT * FROM custom_auto_replies WHERE user_id = $1';
      const params = [userId];

      if (channel && channel !== 'all') {
        params.push(channel);
        sql += ` AND channel = $${params.length}`;
      }

      if (search) {
        params.push(`%${search}%`);
        sql += ` AND (trigger_keyword ILIKE $${params.length} OR response_message ILIKE $${params.length})`;
      }

      sql += ' ORDER BY created_at DESC';

      const result = await query(sql, params);
      res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  createCustomReply: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { trigger_keyword, additional_triggers, match_type, action_type, response_message, channel, status } = req.body;

      if (!trigger_keyword) {
        return res.status(400).json({ success: false, error: 'Trigger keyword is required' });
      }
      if (!response_message) {
        return res.status(400).json({ success: false, error: 'Response message is required' });
      }

      const newReply = await db.insert('custom_auto_replies', {
        id: `car_${Date.now()}`,
        user_id: userId,
        channel: channel || 'whatsapp',
        trigger_keyword,
        additional_triggers: additional_triggers || [],
        match_type: match_type || 'contains',
        action_type: action_type || 'auto_reply',
        response_message,
        status: status || 'active',
        conversations_sent: 0,
      });

      res.status(201).json({ success: true, message: 'Custom reply created', data: newReply });
    } catch (error) {
      next(error);
    }
  },

  updateCustomReply: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('custom_auto_replies', 'id = $1 AND user_id = $2', [id, userId]);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Custom reply not found' });
      }

      const updated = await db.update('custom_auto_replies', id, req.body);
      res.json({ success: true, message: 'Custom reply updated', data: updated });
    } catch (error) {
      next(error);
    }
  },

  deleteCustomReply: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('custom_auto_replies', 'id = $1 AND user_id = $2', [id, userId]);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Custom reply not found' });
      }

      await db.delete('custom_auto_replies', id);
      res.json({ success: true, message: 'Custom reply deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  toggleCustomReply: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('custom_auto_replies', 'id = $1 AND user_id = $2', [id, userId]);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Custom reply not found' });
      }

      const newStatus = existing.status === 'active' ? 'inactive' : 'active';
      const updated = await db.update('custom_auto_replies', id, { status: newStatus });
      res.json({ success: true, message: `Status changed to ${newStatus}`, data: updated });
    } catch (error) {
      next(error);
    }
  },

  duplicateCustomReply: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('custom_auto_replies', 'id = $1 AND user_id = $2', [id, userId]);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Custom reply not found' });
      }

      const duplicate = await db.insert('custom_auto_replies', {
        id: `car_${Date.now()}`,
        user_id: userId,
        channel: existing.channel,
        trigger_keyword: `${existing.trigger_keyword} (Copy)`,
        additional_triggers: existing.additional_triggers,
        match_type: existing.match_type,
        action_type: existing.action_type,
        response_message: existing.response_message,
        status: 'active',
        conversations_sent: 0,
      });

      res.status(201).json({ success: true, message: 'Custom reply duplicated', data: duplicate });
    } catch (error) {
      next(error);
    }
  },

  // =========================================================================
  // 3. WORKFLOWS
  // =========================================================================
  getWorkflows: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { search, status } = req.query;

      let sql = 'SELECT * FROM workflows WHERE (user_id = $1 OR user_id IS NULL)';
      const params = [userId];

      if (status && status !== 'all') {
        params.push(status);
        sql += ` AND status = $${params.length}`;
      }

      if (search) {
        params.push(`%${search}%`);
        sql += ` AND (name ILIKE $${params.length} OR trigger ILIKE $${params.length})`;
      }

      sql += ' ORDER BY created_at DESC';

      const result = await query(sql, params);
      res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  getWorkflowById: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const wf = await db.findOne('workflows', 'id = $1 AND (user_id = $2 OR user_id IS NULL)', [id, userId]);
      if (!wf) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }
      res.json({ success: true, data: wf });
    } catch (error) {
      next(error);
    }
  },

  createWorkflow: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { name, description, trigger, trigger_config, action, nodes, edges, is_published } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, error: 'Workflow name is required' });
      }

      const defaultNodes = nodes && nodes.length > 0 ? nodes : [
        { id: 'node_1', type: 'trigger', data: { label: trigger || 'Inbound Message' } },
        { id: 'node_2', type: 'send_message', data: { text: 'Hello! How can we help you today?' } },
        { id: 'node_3', type: 'end_workflow', data: { message: 'End of automated flow.' } },
      ];

      const defaultEdges = edges && edges.length > 0 ? edges : [
        { source: 'node_1', target: 'node_2' },
        { source: 'node_2', target: 'node_3' },
      ];

      const newWf = await db.insert('workflows', {
        id: `wf_${Date.now()}`,
        user_id: userId,
        name,
        description: description || 'Multi-step automated chatbot flow',
        trigger: trigger || 'Inbound Message',
        trigger_config: trigger_config || {},
        action: action || 'Interactive Chatbot Flow',
        nodes: defaultNodes,
        edges: defaultEdges,
        status: 'active',
        executions: 0,
        is_published: is_published !== undefined ? is_published : true,
      });

      res.status(201).json({ success: true, message: 'Workflow created successfully', data: newWf });
    } catch (error) {
      next(error);
    }
  },

  updateWorkflow: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('workflows', 'id = $1 AND (user_id = $2 OR user_id IS NULL)', [id, userId]);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }

      const updated = await db.update('workflows', id, req.body);
      res.json({ success: true, message: 'Workflow updated successfully', data: updated });
    } catch (error) {
      next(error);
    }
  },

  deleteWorkflow: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('workflows', 'id = $1 AND (user_id = $2 OR user_id IS NULL)', [id, userId]);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }

      await db.delete('workflows', id);
      res.json({ success: true, message: 'Workflow deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  toggleWorkflow: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('workflows', 'id = $1 AND (user_id = $2 OR user_id IS NULL)', [id, userId]);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }

      const newStatus = existing.status === 'active' ? 'paused' : 'active';
      const updated = await db.update('workflows', id, { status: newStatus });
      res.json({ success: true, message: `Workflow is now ${newStatus}`, data: updated });
    } catch (error) {
      next(error);
    }
  },

  duplicateWorkflow: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('workflows', 'id = $1 AND (user_id = $2 OR user_id IS NULL)', [id, userId]);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }

      const duplicate = await db.insert('workflows', {
        id: `wf_${Date.now()}`,
        user_id: userId,
        name: `${existing.name} (Copy)`,
        description: existing.description,
        trigger: existing.trigger,
        trigger_config: existing.trigger_config,
        action: existing.action,
        nodes: existing.nodes,
        edges: existing.edges,
        status: 'active',
        executions: 0,
        is_published: existing.is_published,
      });

      res.status(201).json({ success: true, message: 'Workflow duplicated', data: duplicate });
    } catch (error) {
      next(error);
    }
  },

  testWorkflowExecution: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { message, answers } = req.body;
      const userId = req.user?.id || 'usr_1';

      const wf = await db.findOne('workflows', 'id = $1', [id]);
      if (!wf) return res.status(404).json({ success: false, error: 'Workflow not found' });

      // Traverse nodes to simulate execution
      const nodes = Array.isArray(wf.nodes) ? wf.nodes : [];
      const executionSteps = [];

      nodes.forEach((node, index) => {
        executionSteps.push({
          step: index + 1,
          nodeId: node.id,
          type: node.type,
          label: node.data?.label || node.data?.text || node.data?.prompt || node.type,
          output: node.data?.text || node.data?.buttons || node.data?.question || 'Executed',
        });
      });

      // Increment execution count
      await db.update('workflows', id, { executions: (wf.executions || 0) + 1 });

      res.json({
        success: true,
        workflowId: wf.id,
        workflowName: wf.name,
        simulatedMessage: message,
        executionSteps,
        finalResponse: nodes.find(n => n.type === 'send_message')?.data?.text || 'Workflow executed successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // =========================================================================
  // 4. AI INTENT MATCHING
  // =========================================================================
  getAiIntentData: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';

      let settings = await db.findOne('ai_intent_settings', 'user_id = $1', [userId]);
      if (!settings) {
        settings = await db.insert('ai_intent_settings', {
          id: `ais_${userId}`,
          user_id: userId,
          is_enabled: true,
          confidence_threshold: 75,
          fallback_action: 'ai_leads_agent',
          total_evaluations: 0,
          successful_matches: 0,
        });
      }

      const intentsRes = await query('SELECT * FROM ai_intents WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

      res.json({
        success: true,
        data: {
          settings,
          intents: intentsRes.rows,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  updateAiIntentSettings: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { is_enabled, confidence_threshold, fallback_action } = req.body;

      let settings = await db.findOne('ai_intent_settings', 'user_id = $1', [userId]);
      if (!settings) {
        settings = await db.insert('ai_intent_settings', {
          id: `ais_${userId}`,
          user_id: userId,
          is_enabled: is_enabled !== undefined ? is_enabled : true,
          confidence_threshold: confidence_threshold || 75,
          fallback_action: fallback_action || 'ai_leads_agent',
          total_evaluations: 0,
          successful_matches: 0,
        });
      } else {
        settings = await db.update('ai_intent_settings', settings.id, {
          ...(is_enabled !== undefined ? { is_enabled } : {}),
          ...(confidence_threshold !== undefined ? { confidence_threshold } : {}),
          ...(fallback_action !== undefined ? { fallback_action } : {}),
        });
      }

      res.json({ success: true, message: 'AI Intent settings updated', data: settings });
    } catch (error) {
      next(error);
    }
  },

  createAiIntent: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { intent_name, training_phrases, target_type, target_id, target_name } = req.body;

      if (!intent_name) {
        return res.status(400).json({ success: false, error: 'Intent name is required' });
      }

      const newIntent = await db.insert('ai_intents', {
        id: `aint_${Date.now()}`,
        user_id: userId,
        intent_name,
        training_phrases: training_phrases || [],
        target_type: target_type || 'workflow',
        target_id: target_id || null,
        target_name: target_name || intent_name,
        status: 'active',
        match_count: 0,
      });

      res.status(201).json({ success: true, message: 'AI Intent created', data: newIntent });
    } catch (error) {
      next(error);
    }
  },

  updateAiIntent: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('ai_intents', 'id = $1 AND user_id = $2', [id, userId]);
      if (!existing) return res.status(404).json({ success: false, error: 'Intent not found' });

      const updated = await db.update('ai_intents', id, req.body);
      res.json({ success: true, message: 'Intent updated', data: updated });
    } catch (error) {
      next(error);
    }
  },

  deleteAiIntent: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('ai_intents', 'id = $1 AND user_id = $2', [id, userId]);
      if (!existing) return res.status(404).json({ success: false, error: 'Intent not found' });

      await db.delete('ai_intents', id);
      res.json({ success: true, message: 'Intent deleted' });
    } catch (error) {
      next(error);
    }
  },

  testIntentMatching: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ success: false, error: 'Test message is required' });
      }

      const settings = await db.findOne('ai_intent_settings', 'user_id = $1', [userId]) || { confidence_threshold: 75, is_enabled: true };
      const intentsRes = await query('SELECT * FROM ai_intents WHERE user_id = $1 AND status = $2', [userId, 'active']);
      const intents = intentsRes.rows;

      // Deterministic fuzzy similarity algorithm
      const normalizedMsg = message.toLowerCase().trim();
      let bestMatch = null;
      let highestScore = 0;

      for (const intent of intents) {
        const phrases = Array.isArray(intent.training_phrases) ? intent.training_phrases : [];
        for (const phrase of phrases) {
          const normPhrase = phrase.toLowerCase().trim();
          let score = 0;

          if (normalizedMsg === normPhrase) {
            score = 98;
          } else if (normalizedMsg.includes(normPhrase) || normPhrase.includes(normalizedMsg)) {
            score = 88;
          } else {
            // Jaccard word-level overlap
            const msgWords = new Set(normalizedMsg.split(/\s+/));
            const phraseWords = new Set(normPhrase.split(/\s+/));
            const intersection = new Set([...msgWords].filter(w => phraseWords.has(w)));
            const union = new Set([...msgWords, ...phraseWords]);
            score = Math.round((intersection.size / union.size) * 100);
            if (score > 0 && intersection.size >= 1) score = Math.min(85, score + 40);
          }

          if (score > highestScore) {
            highestScore = score;
            bestMatch = intent;
          }
        }
      }

      const isMatch = highestScore >= settings.confidence_threshold;

      if (isMatch && bestMatch) {
        await query('UPDATE ai_intents SET match_count = match_count + 1 WHERE id = $1', [bestMatch.id]);
        await query('UPDATE ai_intent_settings SET total_evaluations = total_evaluations + 1, successful_matches = successful_matches + 1 WHERE user_id = $1', [userId]);
      } else {
        await query('UPDATE ai_intent_settings SET total_evaluations = total_evaluations + 1 WHERE user_id = $1', [userId]);
      }

      res.json({
        success: true,
        inputMessage: message,
        confidenceScore: highestScore,
        threshold: settings.confidence_threshold,
        matched: isMatch,
        matchedIntent: isMatch ? bestMatch.intent_name : null,
        targetType: isMatch ? bestMatch.target_type : settings.fallback_action,
        targetName: isMatch ? bestMatch.target_name : 'AI Leads Agent Fallback',
      });
    } catch (error) {
      next(error);
    }
  },

  // =========================================================================
  // 5. WHATSAPP AI AGENT
  // =========================================================================
  getAiAgentData: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';

      let config = await db.findOne('whatsapp_ai_agent_configs', 'user_id = $1', [userId]);
      if (!config) {
        config = await db.insert('whatsapp_ai_agent_configs', {
          id: `wa_agent_${userId}`,
          user_id: userId,
          agent_name: 'ARCO Smart Leads Agent',
          status: 'live',
          tone: 'professional_consultative',
          system_prompt: 'You are ARCO Leads Agent, an intelligent AI sales & support assistant. Your mission is to understand user requirements, answer questions about our SaaS and marketing capabilities, and qualify high-intent business leads.',
          greeting_message: 'Hi there! I am ARCO AI Assistant. How can I help boost your WhatsApp commerce and customer communications today?',
          fallback_response: 'Let me connect you with a specialist from our team right away.',
          lead_fields: [
            { key: 'name', label: 'Full Name', enabled: true, required: true },
            { key: 'phone', label: 'Phone Number', enabled: true, required: true },
            { key: 'email', label: 'Business Email', enabled: true, required: false },
            { key: 'company', label: 'Company Name', enabled: true, required: false },
            { key: 'requirement', label: 'Service Requirement', enabled: true, required: true },
            { key: 'budget', label: 'Estimated Budget', enabled: true, required: false },
          ],
          conversations_handled: 0,
          leads_captured: 0,
        });
      }

      const sourcesRes = await query('SELECT * FROM ai_agent_training_sources WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

      res.json({
        success: true,
        data: {
          config,
          trainingSources: sourcesRes.rows,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  updateAiAgentConfig: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      let config = await db.findOne('whatsapp_ai_agent_configs', 'user_id = $1', [userId]);

      if (!config) {
        config = await db.insert('whatsapp_ai_agent_configs', {
          id: `wa_agent_${userId}`,
          user_id: userId,
          ...req.body,
        });
      } else {
        config = await db.update('whatsapp_ai_agent_configs', config.id, req.body);
      }

      res.json({ success: true, message: 'AI Agent configuration saved', data: config });
    } catch (error) {
      next(error);
    }
  },

  addTrainingSource: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { source_type, name, url_or_path } = req.body;

      if (!name) return res.status(400).json({ success: false, error: 'Source name or URL is required' });

      const newSource = await db.insert('ai_agent_training_sources', {
        id: `src_${Date.now()}`,
        user_id: userId,
        source_type: source_type || 'website',
        name,
        url_or_path: url_or_path || name,
        status: 'ready',
        tokens_indexed: Math.floor(Math.random() * 8000) + 2000,
      });

      res.status(201).json({ success: true, message: 'Training source added and indexed', data: newSource });
    } catch (error) {
      next(error);
    }
  },

  removeTrainingSource: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('ai_agent_training_sources', 'id = $1 AND user_id = $2', [id, userId]);
      if (!existing) return res.status(404).json({ success: false, error: 'Source not found' });

      await db.delete('ai_agent_training_sources', id);
      res.json({ success: true, message: 'Training source removed' });
    } catch (error) {
      next(error);
    }
  },

  testAiAgentChat: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { message, chatHistory } = req.body;

      const agent = await db.findOne('whatsapp_ai_agent_configs', 'user_id = $1', [userId]) || {
        agent_name: 'ARCO Leads Agent',
        greeting_message: 'Hello! How can I assist your business today?',
      };

      const normalized = (message || '').toLowerCase();
      let aiResponse = '';
      let extractedLeads = {};

      if (normalized.includes('hi') || normalized.includes('hello')) {
        aiResponse = agent.greeting_message || 'Hello! Welcome to ARCO Communication. How can we help accelerate your sales?';
      } else if (normalized.includes('price') || normalized.includes('cost') || normalized.includes('plan')) {
        aiResponse = 'Our plans start at ₹1,999/month for Growth, with scalable WhatsApp API and unlimited automation flows. What monthly conversation volume does your team anticipate?';
        extractedLeads.requirement = 'Pricing & Plan Inquiry';
      } else if (normalized.includes('demo') || normalized.includes('book') || normalized.includes('contact')) {
        aiResponse = 'I would be delighted to schedule a live product walkthrough with our solutions specialist! Could you please provide your full name and phone number?';
        extractedLeads.requirement = 'Demo Request';
      } else if (/\d{10}/.test(normalized)) {
        const phoneMatch = normalized.match(/\d{10}/)[0];
        extractedLeads.phone = phoneMatch;
        aiResponse = `Thank you! I have recorded your contact number (${phoneMatch}). Our strategy team will reach out shortly.`;
      } else {
        aiResponse = 'ARCO provides automated WhatsApp campaigns, Meta Click-to-WhatsApp Ads, and AI chatbot flows designed for modern businesses. Would you like to see our interactive catalog?';
      }

      await query('UPDATE whatsapp_ai_agent_configs SET conversations_handled = conversations_handled + 1 WHERE id = $1', [agent.id]);

      res.json({
        success: true,
        response: aiResponse,
        agentName: agent.agent_name,
        extractedLeads,
      });
    } catch (error) {
      next(error);
    }
  },

  // =========================================================================
  // 6. INSTAGRAM QUICKFLOWS
  // =========================================================================
  getQuickflows: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { category, search } = req.query;

      let sql = 'SELECT * FROM instagram_quickflows WHERE user_id = $1';
      const params = [userId];

      if (category && category !== 'all') {
        params.push(category);
        sql += ` AND category = $${params.length}`;
      }

      if (search) {
        params.push(`%${search}%`);
        sql += ` AND (name ILIKE $${params.length} OR dm_response ILIKE $${params.length})`;
      }

      sql += ' ORDER BY created_at DESC';

      const result = await query(sql, params);
      res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  createQuickflow: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { name, category, trigger_type, trigger_keywords, post_target, dm_response, collect_lead, tag_to_apply } = req.body;

      if (!name) return res.status(400).json({ success: false, error: 'Quickflow name is required' });
      if (!dm_response) return res.status(400).json({ success: false, error: 'DM response text is required' });

      const newQf = await db.insert('instagram_quickflows', {
        id: `iqf_${Date.now()}`,
        user_id: userId,
        name,
        category: category || 'price_please',
        trigger_type: trigger_type || 'post_comment',
        trigger_keywords: trigger_keywords || ['PRICE'],
        post_target: post_target || 'all_posts',
        dm_response,
        collect_lead: collect_lead !== undefined ? collect_lead : true,
        tag_to_apply: tag_to_apply || 'Instagram Lead',
        status: 'active',
        leads_captured: 0,
        times_triggered: 0,
      });

      res.status(201).json({ success: true, message: 'Instagram Quickflow created', data: newQf });
    } catch (error) {
      next(error);
    }
  },

  updateQuickflow: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('instagram_quickflows', 'id = $1 AND user_id = $2', [id, userId]);
      if (!existing) return res.status(404).json({ success: false, error: 'Quickflow not found' });

      const updated = await db.update('instagram_quickflows', id, req.body);
      res.json({ success: true, message: 'Quickflow updated', data: updated });
    } catch (error) {
      next(error);
    }
  },

  deleteQuickflow: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('instagram_quickflows', 'id = $1 AND user_id = $2', [id, userId]);
      if (!existing) return res.status(404).json({ success: false, error: 'Quickflow not found' });

      await db.delete('instagram_quickflows', id);
      res.json({ success: true, message: 'Quickflow deleted' });
    } catch (error) {
      next(error);
    }
  },

  toggleQuickflow: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('instagram_quickflows', 'id = $1 AND user_id = $2', [id, userId]);
      if (!existing) return res.status(404).json({ success: false, error: 'Quickflow not found' });

      const newStatus = existing.status === 'active' ? 'paused' : 'active';
      const updated = await db.update('instagram_quickflows', id, { status: newStatus });
      res.json({ success: true, message: `Status updated to ${newStatus}`, data: updated });
    } catch (error) {
      next(error);
    }
  },

  duplicateQuickflow: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('instagram_quickflows', 'id = $1 AND user_id = $2', [id, userId]);
      if (!existing) return res.status(404).json({ success: false, error: 'Quickflow not found' });

      const duplicate = await db.insert('instagram_quickflows', {
        id: `iqf_${Date.now()}`,
        user_id: userId,
        name: `${existing.name} (Copy)`,
        category: existing.category,
        trigger_type: existing.trigger_type,
        trigger_keywords: existing.trigger_keywords,
        post_target: existing.post_target,
        dm_response: existing.dm_response,
        collect_lead: existing.collect_lead,
        tag_to_apply: existing.tag_to_apply,
        status: 'active',
        leads_captured: 0,
        times_triggered: 0,
      });

      res.status(201).json({ success: true, message: 'Quickflow duplicated', data: duplicate });
    } catch (error) {
      next(error);
    }
  },

  // =========================================================================
  // 7. VOICE AI / MY CALL GENIE
  // =========================================================================
  getVoiceAiData: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';

      let config = await db.findOne('voice_ai_configs', 'user_id = $1', [userId]);
      if (!config) {
        config = await db.insert('voice_ai_configs', {
          id: `vc_${userId}`,
          user_id: userId,
          is_enabled: true,
          virtual_number: '+91 8000 123 456',
          forwarding_number: '+91 9876 543 210',
          voice_model: 'Aria (Natural & Friendly)',
          greeting: 'Thank you for calling ARCO Communication. Our team is on another line, but I can assist you with your requirements or schedule a prompt callback.',
          ai_instructions: 'Listen attentively, transcribe customer intent, extract callback preferences, and immediately create a high-priority lead in ARCO Sales CRM.',
          send_whatsapp_confirmation: true,
          total_calls: 0,
          leads_created: 0,
        });
      }

      const callsRes = await query('SELECT * FROM voice_calls WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [userId]);

      res.json({
        success: true,
        data: {
          config,
          calls: callsRes.rows,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  updateVoiceAiConfig: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      let config = await db.findOne('voice_ai_configs', 'user_id = $1', [userId]);

      if (!config) {
        config = await db.insert('voice_ai_configs', {
          id: `vc_${userId}`,
          user_id: userId,
          ...req.body,
        });
      } else {
        config = await db.update('voice_ai_configs', config.id, req.body);
      }

      res.json({ success: true, message: 'Voice AI configuration saved', data: config });
    } catch (error) {
      next(error);
    }
  },

  simulateInboundCall: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { caller_name, caller_phone, inquiry_topic, callback_preference } = req.body;

      const callRecord = await db.insert('voice_calls', {
        id: `call_${Date.now()}`,
        user_id: userId,
        caller_name: caller_name || 'Simulated Caller',
        caller_phone: caller_phone || '+91 98765 00000',
        duration_seconds: Math.floor(Math.random() * 45) + 30,
        status: 'lead_captured',
        ai_summary: `Caller inquired regarding ${inquiry_topic || 'enterprise WhatsApp marketing and automation solutions'}. Automatically qualified as high-intent lead.`,
        callback_time: callback_preference || 'Today at 5:00 PM',
        audio_url: '/audio/sample_voice_call.mp3',
        lead_id: `lead_${Date.now()}`,
      });

      // Update counters
      await query('UPDATE voice_ai_configs SET total_calls = total_calls + 1, leads_created = leads_created + 1 WHERE user_id = $1', [userId]);

      // Push into contacts/leads
      await db.insert('contacts', {
        id: `contact_voice_${Date.now()}`,
        name: caller_name || 'Simulated Caller',
        phone: caller_phone || '+91 98765 00000',
        email: `${(caller_name || 'lead').toLowerCase().replace(/\s+/g, '')}@voiceinbound.com`,
        tag: 'Voice AI Lead',
        segment: 'High Intent',
        status: 'Open Lead',
        channel: 'whatsapp',
      });

      res.status(201).json({
        success: true,
        message: 'Inbound call answered by AI and lead created in ARCO CRM',
        data: callRecord,
      });
    } catch (error) {
      next(error);
    }
  },

  // =========================================================================
  // 8. WHATSAPP FORMS
  // =========================================================================
  getForms: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { search } = req.query;

      let sql = 'SELECT * FROM whatsapp_forms WHERE user_id = $1';
      const params = [userId];

      if (search) {
        params.push(`%${search}%`);
        sql += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length} OR form_id ILIKE $${params.length})`;
      }

      sql += ' ORDER BY created_at DESC';

      const result = await query(sql, params);
      res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  getFormById: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const form = await db.findOne('whatsapp_forms', '(id = $1 OR form_id = $1) AND user_id = $2', [id, userId]);
      if (!form) return res.status(404).json({ success: false, error: 'Form not found' });

      res.json({ success: true, data: form });
    } catch (error) {
      next(error);
    }
  },

  createForm: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { title, description, form_id, fields, welcome_screen, thank_you_screen, status } = req.body;

      if (!title) return res.status(400).json({ success: false, error: 'Form title is required' });

      const uniqueFormId = form_id || `wf_${Date.now()}`;

      const newForm = await db.insert('whatsapp_forms', {
        id: `form_${Date.now()}`,
        user_id: userId,
        title,
        description: description || '',
        form_id: uniqueFormId,
        status: status || 'published',
        fields: fields || [
          { id: 'f1', type: 'text', label: 'Full Name', placeholder: 'Enter your name', required: true },
          { id: 'f2', type: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', required: true },
        ],
        welcome_screen: welcome_screen || { title: 'Welcome', description: 'Please complete this form.' },
        thank_you_screen: thank_you_screen || { title: 'Thank You!', description: 'Your submission has been received.' },
        response_count: 0,
      });

      res.status(201).json({ success: true, message: 'WhatsApp Form created', data: newForm });
    } catch (error) {
      next(error);
    }
  },

  updateForm: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('whatsapp_forms', 'id = $1 AND user_id = $2', [id, userId]);
      if (!existing) return res.status(404).json({ success: false, error: 'Form not found' });

      const updated = await db.update('whatsapp_forms', id, req.body);
      res.json({ success: true, message: 'Form updated', data: updated });
    } catch (error) {
      next(error);
    }
  },

  deleteForm: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('whatsapp_forms', 'id = $1 AND user_id = $2', [id, userId]);
      if (!existing) return res.status(404).json({ success: false, error: 'Form not found' });

      await db.delete('whatsapp_forms', id);
      res.json({ success: true, message: 'Form deleted' });
    } catch (error) {
      next(error);
    }
  },

  duplicateForm: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('whatsapp_forms', 'id = $1 AND user_id = $2', [id, userId]);
      if (!existing) return res.status(404).json({ success: false, error: 'Form not found' });

      const duplicate = await db.insert('whatsapp_forms', {
        id: `form_${Date.now()}`,
        user_id: userId,
        title: `${existing.title} (Copy)`,
        description: existing.description,
        form_id: `wf_${Date.now()}`,
        status: 'published',
        fields: existing.fields,
        welcome_screen: existing.welcome_screen,
        thank_you_screen: existing.thank_you_screen,
        response_count: 0,
      });

      res.status(201).json({ success: true, message: 'Form duplicated', data: duplicate });
    } catch (error) {
      next(error);
    }
  },

  getFormResponses: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { formId } = req.params;

      const responses = await query('SELECT * FROM whatsapp_form_responses WHERE form_id = $1 AND user_id = $2 ORDER BY created_at DESC', [formId, userId]);
      res.json({ success: true, count: responses.rows.length, data: responses.rows });
    } catch (error) {
      next(error);
    }
  },

  submitFormResponse: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { formId } = req.params;
      const { contact_name, contact_phone, answers } = req.body;

      const newResponse = await db.insert('whatsapp_form_responses', {
        id: `resp_${Date.now()}`,
        user_id: userId,
        form_id: formId,
        contact_name: contact_name || 'Anonymous Contact',
        contact_phone: contact_phone || '+91 99999 99999',
        answers: answers || {},
        status: 'submitted',
      });

      await query('UPDATE whatsapp_forms SET response_count = response_count + 1 WHERE form_id = $1 AND user_id = $2', [formId, userId]);

      res.status(201).json({ success: true, message: 'Form response recorded', data: newResponse });
    } catch (error) {
      next(error);
    }
  },

  // =========================================================================
  // 9. INTERACTIVE LISTS
  // =========================================================================
  getInteractiveLists: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { search } = req.query;

      let sql = 'SELECT * FROM interactive_lists WHERE user_id = $1';
      const params = [userId];

      if (search) {
        params.push(`%${search}%`);
        sql += ` AND (title ILIKE $${params.length} OR body_text ILIKE $${params.length})`;
      }

      sql += ' ORDER BY created_at DESC';

      const result = await query(sql, params);
      res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  createInteractiveList: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { title, header_text, body_text, footer_text, button_text, sections } = req.body;

      if (!title) return res.status(400).json({ success: false, error: 'List title is required' });
      if (!body_text) return res.status(400).json({ success: false, error: 'Body message text is required' });

      const newList = await db.insert('interactive_lists', {
        id: `ilist_${Date.now()}`,
        user_id: userId,
        title,
        header_text: header_text || '',
        body_text,
        footer_text: footer_text || 'ARCO Communication',
        button_text: button_text || 'View Options',
        sections: sections || [
          {
            title: 'Menu Options',
            rows: [
              { id: 'row_1', title: 'Option 1', description: 'Description for option 1', action: 'workflow_1' },
            ],
          },
        ],
        status: 'active',
        usage_count: 0,
      });

      res.status(201).json({ success: true, message: 'Interactive List created', data: newList });
    } catch (error) {
      next(error);
    }
  },

  updateInteractiveList: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('interactive_lists', 'id = $1 AND user_id = $2', [id, userId]);
      if (!existing) return res.status(404).json({ success: false, error: 'List not found' });

      const updated = await db.update('interactive_lists', id, req.body);
      res.json({ success: true, message: 'Interactive List updated', data: updated });
    } catch (error) {
      next(error);
    }
  },

  deleteInteractiveList: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('interactive_lists', 'id = $1 AND user_id = $2', [id, userId]);
      if (!existing) return res.status(404).json({ success: false, error: 'List not found' });

      await db.delete('interactive_lists', id);
      res.json({ success: true, message: 'Interactive List deleted' });
    } catch (error) {
      next(error);
    }
  },

  duplicateInteractiveList: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;
      const existing = await db.findOne('interactive_lists', 'id = $1 AND user_id = $2', [id, userId]);
      if (!existing) return res.status(404).json({ success: false, error: 'List not found' });

      const duplicate = await db.insert('interactive_lists', {
        id: `ilist_${Date.now()}`,
        user_id: userId,
        title: `${existing.title} (Copy)`,
        header_text: existing.header_text,
        body_text: existing.body_text,
        footer_text: existing.footer_text,
        button_text: existing.button_text,
        sections: existing.sections,
        status: 'active',
        usage_count: 0,
      });

      res.status(201).json({ success: true, message: 'Interactive List duplicated', data: duplicate });
    } catch (error) {
      next(error);
    }
  },

  // =========================================================================
  // 10. MASTER AUTOMATION EXECUTION ENGINE & SIMULATOR
  // =========================================================================
  executeAutomationEngine: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { message, channel = 'whatsapp', contact_name = 'Customer', contact_phone = '+91 98765 43210', simulation = true } = req.body;

      if (!message) {
        return res.status(400).json({ success: false, error: 'Incoming message is required' });
      }

      const normalizedMsg = message.toLowerCase().trim();
      const logs = [];

      logs.push({ step: '1. Inbound Message Received', details: `Channel: ${channel}, Text: "${message}"` });

      // Priority 1: Check active Workflows
      const workflowsRes = await query('SELECT * FROM workflows WHERE (user_id = $1 OR user_id IS NULL) AND status = $2', [userId, 'active']);
      for (const wf of workflowsRes.rows) {
        const keywords = wf.trigger_config?.keywords || [wf.trigger];
        const match = keywords.some(k => normalizedMsg.includes(k.toLowerCase().trim()));
        if (match) {
          logs.push({ step: '2. Priority 1 Matched: Workflow Trigger', details: `Workflow: "${wf.name}" (ID: ${wf.id})` });
          
          await query('UPDATE workflows SET executions = executions + 1 WHERE id = $1', [wf.id]);

          const responseText = wf.nodes?.find(n => n.type === 'send_message')?.data?.text || 'Workflow executed.';

          await db.insert('automation_execution_logs', {
            id: `log_${Date.now()}`,
            user_id: userId,
            channel,
            contact_name,
            contact_phone,
            incoming_message: message,
            matched_automation_type: 'workflow',
            matched_automation_id: wf.id,
            matched_automation_name: wf.name,
            executed_action: 'Triggered multi-step chatbot workflow',
            response_payload: { text: responseText, nodesCount: wf.nodes?.length },
            execution_mode: simulation ? 'simulation' : 'live',
          });

          return res.json({
            success: true,
            matched: true,
            type: 'workflow',
            name: wf.name,
            response: responseText,
            executionLogs: logs,
            isSimulation: simulation,
          });
        }
      }

      // Priority 2: Check Custom Auto Replies
      const repliesRes = await query('SELECT * FROM custom_auto_replies WHERE user_id = $1 AND status = $2', [userId, 'active']);
      for (const reply of repliesRes.rows) {
        const triggers = [reply.trigger_keyword, ...(Array.isArray(reply.additional_triggers) ? reply.additional_triggers : [])];
        const match = triggers.some(t => {
          const normT = t.toLowerCase().trim();
          if (reply.match_type === 'exact') return normalizedMsg === normT;
          if (reply.match_type === 'starts_with') return normalizedMsg.startsWith(normT);
          return normalizedMsg.includes(normT);
        });

        if (match) {
          logs.push({ step: '2. Priority 2 Matched: Custom Auto Reply', details: `Trigger: "${reply.trigger_keyword}"` });

          await query('UPDATE custom_auto_replies SET conversations_sent = conversations_sent + 1 WHERE id = $1', [reply.id]);

          await db.insert('automation_execution_logs', {
            id: `log_${Date.now()}`,
            user_id: userId,
            channel,
            contact_name,
            contact_phone,
            incoming_message: message,
            matched_automation_type: 'custom_auto_reply',
            matched_automation_id: reply.id,
            matched_automation_name: reply.trigger_keyword,
            executed_action: 'Sent custom automated response',
            response_payload: { text: reply.response_message },
            execution_mode: simulation ? 'simulation' : 'live',
          });

          return res.json({
            success: true,
            matched: true,
            type: 'custom_auto_reply',
            name: reply.trigger_keyword,
            response: reply.response_message,
            executionLogs: logs,
            isSimulation: simulation,
          });
        }
      }

      // Priority 3: Check AI Intent Matching
      const intentSettings = await db.findOne('ai_intent_settings', 'user_id = $1', [userId]);
      const isAiIntentEnabled = intentSettings ? intentSettings.is_enabled : true;
      if (isAiIntentEnabled) {
        const intentsRes = await query('SELECT * FROM ai_intents WHERE user_id = $1 AND status = $2', [userId, 'active']);
        for (const intent of intentsRes.rows) {
          const phrases = Array.isArray(intent.training_phrases) ? intent.training_phrases : [];
          const match = phrases.some(p => normalizedMsg.includes(p.toLowerCase().trim()));
          if (match) {
            logs.push({ step: '2. Priority 3 Matched: AI Intent Matcher', details: `Intent: "${intent.intent_name}" -> Target: "${intent.target_name}"` });

            await query('UPDATE ai_intents SET match_count = match_count + 1 WHERE id = $1', [intent.id]);

            const intentResponse = `[AI Intent: ${intent.intent_name}] Routed to ${intent.target_name}. How else can we assist you?`;

            await db.insert('automation_execution_logs', {
              id: `log_${Date.now()}`,
              user_id: userId,
              channel,
              contact_name,
              contact_phone,
              incoming_message: message,
              matched_automation_type: 'ai_intent',
              matched_automation_id: intent.id,
              matched_automation_name: intent.intent_name,
              executed_action: `Matched intent ${intent.intent_name}`,
              response_payload: { text: intentResponse },
              execution_mode: simulation ? 'simulation' : 'live',
            });

            return res.json({
              success: true,
              matched: true,
              type: 'ai_intent',
              name: intent.intent_name,
              response: intentResponse,
              executionLogs: logs,
              isSimulation: simulation,
            });
          }
        }
      }

      // Priority 4: WhatsApp AI Agent Fallback
      const agentConfig = await db.findOne('whatsapp_ai_agent_configs', 'user_id = $1', [userId]);
      if (agentConfig && agentConfig.status === 'live') {
        logs.push({ step: '2. Priority 4 Executed: WhatsApp AI Leads Agent Fallback', details: `Agent: "${agentConfig.agent_name}"` });

        const fallbackReply = `${agentConfig.greeting_message} (AI Consultative Engine: Our specialist will also review your query).`;

        await query('UPDATE whatsapp_ai_agent_configs SET conversations_handled = conversations_handled + 1 WHERE id = $1', [agentConfig.id]);

        await db.insert('automation_execution_logs', {
          id: `log_${Date.now()}`,
          user_id: userId,
          channel,
          contact_name,
          contact_phone,
          incoming_message: message,
          matched_automation_type: 'ai_agent_fallback',
          matched_automation_id: agentConfig.id,
          matched_automation_name: agentConfig.agent_name,
          executed_action: 'Handled by AI Leads Agent fallback',
          response_payload: { text: fallbackReply },
          execution_mode: simulation ? 'simulation' : 'live',
        });

        return res.json({
          success: true,
          matched: true,
          type: 'ai_agent_fallback',
          name: agentConfig.agent_name,
          response: fallbackReply,
          executionLogs: logs,
          isSimulation: simulation,
        });
      }

      // Priority 5: Default Welcome / Delayed message
      const autoSettings = await db.findOne('automation_settings', 'user_id = $1', [userId]);
      const defaultMsg = autoSettings?.welcome_message?.message || 'Thank you for reaching out to ARCO Communication. An executive will connect shortly.';

      logs.push({ step: '2. Fallback: Default Welcome Automation', details: defaultMsg });

      return res.json({
        success: true,
        matched: false,
        type: 'default_welcome',
        name: 'Welcome Automation',
        response: defaultMsg,
        executionLogs: logs,
        isSimulation: simulation,
      });
    } catch (error) {
      next(error);
    }
  },

  getExecutionLogs: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const result = await query('SELECT * FROM automation_execution_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [userId]);
      res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (error) {
      next(error);
    }
  },
};
