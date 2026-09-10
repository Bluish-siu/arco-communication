import { Router } from 'express';
import { integrationController } from '../controllers/integrationController.js';
import { authenticateToken } from '../middleware/auth.js';
import { verifyShopifyIdToken } from '../middleware/shopifyAuth.js';

const router = Router();

// Shopify App Bridge Embedded Session endpoint
router.get('/shopify/session', verifyShopifyIdToken, integrationController.getShopifySession);

// Public OAuth callback from Shopify
router.get('/shopify/callback', integrationController.handleShopifyCallback);

// Protected Integration routes (require ARCO auth)
router.get('/', authenticateToken, integrationController.getIntegrations);
router.get('/shopify/status', authenticateToken, integrationController.getShopifyStatus);
router.get('/shopify/oauth-url', authenticateToken, integrationController.getShopifyOAuthUrl);
router.post('/shopify/connect', authenticateToken, integrationController.connectShopify);
router.post('/shopify/disconnect', authenticateToken, integrationController.disconnectShopify);
router.post('/shopify/reconcile-webhooks', authenticateToken, integrationController.reconcileShopifyWebhooks);

export default router;
