import { Router } from 'express';
import { integrationController } from '../controllers/integrationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public OAuth callback from Shopify
router.get('/shopify/callback', integrationController.handleShopifyCallback);

// Protected Integration routes (require auth)
router.get('/', authenticateToken, integrationController.getIntegrations);
router.get('/shopify/status', authenticateToken, integrationController.getShopifyStatus);
router.get('/shopify/oauth-url', authenticateToken, integrationController.getShopifyOAuthUrl);
router.post('/shopify/connect', authenticateToken, integrationController.connectShopify);
router.post('/shopify/disconnect', authenticateToken, integrationController.disconnectShopify);

export default router;
