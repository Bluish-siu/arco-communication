import { db } from '../config/db.js';

export const aiAgentController = {
  // GET /api/ai-agents
  getAll: async (req, res, next) => {
    try {
      const agents = await db.getAll('ai_agents');
      const formatted = agents.map((a) => ({
        id: a.id,
        name: a.name,
        model: a.model,
        channels: a.channels,
        status: a.status,
        systemPrompt: a.system_prompt,
        accuracyRate: a.accuracy_rate,
        conversationsHandled: a.conversations_handled,
        createdAt: a.created_at,
      }));
      res.json({ success: true, count: formatted.length, data: formatted });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/ai-agents/query
  processQuery: async (req, res, next) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ success: false, error: 'Query is required' });

      // Simulated ARCO AI Intent Classifier & Response Generator
      const response = {
        intent: query.toLowerCase().includes('price') ? 'Pricing_Inquiry' : 'General_Support',
        confidence: 0.98,
        reply: `Thank you for asking about "${query}". ARCO AI has detected your interest and can instantly assist or transfer you to a live sales specialist.`,
        suggestedActions: ['View Pricing Plans', 'Schedule Live Demo', 'Connect with Rep'],
      };

      res.json({ success: true, data: response });
    } catch (error) {
      next(error);
    }
  },
};
