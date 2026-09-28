import { shopifyWidgetService } from '../services/shopifyWidgetService.js';
import { query } from '../config/db.js';

// Helper to resolve shopDomain
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

  const devRes = await query("SELECT shop_domain FROM shopify_integrations WHERE status = 'connected' LIMIT 1");
  return devRes.rows[0]?.shop_domain || 'arco-test-e2a1thrd.myshopify.com';
}

export const shopifyWidgetController = {
  // GET /api/integrations/shopify/widget
  getConfig: async (req, res, next) => {
    try {
      const shopDomain = await resolveShopDomain(req);
      const userId = req.user?.id || req.shopify?.userId || 'usr_1';

      const config = await shopifyWidgetService.getWidgetConfig({ shopDomain, userId });
      res.json({
        success: true,
        shopDomain,
        data: config,
      });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/integrations/shopify/widget
  updateConfig: async (req, res, next) => {
    try {
      const shopDomain = await resolveShopDomain(req);
      const userId = req.user?.id || req.shopify?.userId || 'usr_1';
      const updates = req.body || {};

      const updated = await shopifyWidgetService.updateWidgetConfig({
        shopDomain,
        userId,
        updates,
      });

      res.json({
        success: true,
        shopDomain,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/storefront/config?shop=...
  getPublicConfig: async (req, res, next) => {
    try {
      const shopDomain = req.query.shop;
      if (!shopDomain) {
        return res.status(400).json({ success: false, error: 'shop parameter is required' });
      }

      const config = await shopifyWidgetService.getPublicConfig(shopDomain);
      if (!config) {
        return res.status(404).json({ success: false, error: 'Widget not configured for this shop' });
      }

      res.json({
        success: true,
        data: config,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/storefront/widget.js?shop=...
  getWidgetScript: async (req, res) => {
    try {
      const shopDomain = req.query.shop || 'arco-test-e2a1thrd.myshopify.com';
      const config = await shopifyWidgetService.getPublicConfig(shopDomain);

      const scriptContent = shopifyWidgetService.generateWidgetScript(shopDomain, config);

      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(scriptContent);
    } catch (err) {
      console.error('[Storefront Widget Script Error]:', err.message);
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.send(`/* Error generating ARCO widget script: ${err.message} */`);
    }
  },
};
