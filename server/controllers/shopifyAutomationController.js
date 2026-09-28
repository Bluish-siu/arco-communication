import { shopifyAutomationService } from '../services/shopifyAutomationService.js';
import { query } from '../config/db.js';

// Helper to resolve shopDomain for current user or request
async function resolveShopDomain(req) {
  if (req.query?.shop) return req.query.shop;
  if (req.shopify?.shopDomain) return req.shopify.shopDomain;

  const userId = req.user?.id;
  if (userId) {
    const res = await query(
      "SELECT shop_domain FROM shopify_integrations WHERE user_id = $1 AND status = 'connected' LIMIT 1",
      [userId]
    );
    if (res.rows[0]?.shop_domain) return res.rows[0].shop_domain;
  }

  // Fallback to any connected shop if single-tenant dev
  const devRes = await query("SELECT shop_domain FROM shopify_integrations WHERE status = 'connected' LIMIT 1");
  return devRes.rows[0]?.shop_domain || 'arco-test-e2a1thrd.myshopify.com';
}

export const shopifyAutomationController = {
  // GET /api/integrations/shopify/automations
  getAutomations: async (req, res, next) => {
    try {
      const shopDomain = await resolveShopDomain(req);
      const userId = req.user?.id || req.shopify?.userId || 'usr_1';

      const automations = await shopifyAutomationService.getAutomations({
        shopDomain,
        userId,
      });

      res.json({
        success: true,
        shopDomain,
        data: automations,
      });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/integrations/shopify/automations/:recipeType
  updateAutomation: async (req, res, next) => {
    try {
      const { recipeType } = req.params;
      const shopDomain = await resolveShopDomain(req);
      const userId = req.user?.id || 'usr_1';
      const updates = req.body || {};

      const updated = await shopifyAutomationService.updateAutomation({
        shopDomain,
        userId,
        recipeType,
        updates,
      });

      res.json({
        success: true,
        recipeType,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/integrations/shopify/automations/:recipeType/test
  testAutomation: async (req, res, next) => {
    try {
      const { recipeType } = req.params;
      const { testPhone } = req.body;
      const shopDomain = await resolveShopDomain(req);

      if (!testPhone) {
        return res.status(400).json({ success: false, error: 'testPhone is required' });
      }

      const userId = req.user?.id || req.shopify?.userId || null;

      const result = await shopifyAutomationService.testAutomation({
        shopDomain,
        recipeType,
        testPhone,
        userId,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/integrations/shopify/automations/stats
  getStats: async (req, res, next) => {
    try {
      const shopDomain = await resolveShopDomain(req);
      const automations = await shopifyAutomationService.getAutomations({ shopDomain });

      let totalSent = 0;
      let totalDelivered = 0;
      let totalRead = 0;
      let totalRecovered = 0;
      let totalRevenue = 0;

      automations.forEach((a) => {
        const s = a.stats || {};
        totalSent += Number(s.sent) || 0;
        totalDelivered += Number(s.delivered) || 0;
        totalRead += Number(s.read) || 0;
        totalRecovered += Number(s.recovered) || 0;
        totalRevenue += Number(s.revenue) || 0;
      });

      res.json({
        success: true,
        shopDomain,
        data: {
          totalSent,
          totalDelivered,
          totalRead,
          totalRecovered,
          totalRevenue,
          deliveryRate: totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 100,
          readRate: totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
