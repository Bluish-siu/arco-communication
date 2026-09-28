import { Router } from 'express';
import { shopifyWidgetController } from '../controllers/shopifyWidgetController.js';

const router = Router();

// Public Storefront endpoints (no auth required, served directly to Shopify visitors)
router.get('/config', shopifyWidgetController.getPublicConfig);
router.get('/widget.js', shopifyWidgetController.getWidgetScript);

export default router;
