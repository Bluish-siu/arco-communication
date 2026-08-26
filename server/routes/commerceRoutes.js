import { Router } from 'express';
import { commerceController } from '../controllers/commerceController.js';
import { commerceOrderController } from '../controllers/commerceOrderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public Webhook ingest
router.post('/webhooks/orders', commerceOrderController.receiveOrderWebhook);

// Protected routes (require auth)
router.use(authenticateToken);

// GET /api/commerce/settings
router.get('/settings', commerceController.getSettings);

// PUT /api/commerce/settings
router.put('/settings', commerceController.updateSettings);

// POST /api/commerce/catalog/connect
router.post('/catalog/connect', commerceController.connectCatalog);

// POST /api/commerce/catalog/disconnect
router.post('/catalog/disconnect', commerceController.disconnectCatalog);

// POST /api/commerce/catalog/upload-csv
router.post('/catalog/upload-csv', commerceController.uploadCsv);

// GET /api/commerce/products
router.get('/products', commerceController.getProducts);

// DELETE /api/commerce/products/:id
router.delete('/products/:id', commerceController.deleteProduct);

// --- ORDER PANEL ENDPOINTS ---
// GET /api/commerce/orders (Pagination & Filters)
router.get('/orders', commerceOrderController.getOrders);

// GET /api/commerce/orders/export (CSV export)
router.get('/orders/export', commerceOrderController.exportOrdersCsv);

// GET /api/commerce/orders/webhooks (Webhook Config)
router.get('/orders/webhooks', commerceOrderController.getWebhookConfig);

// POST /api/commerce/orders/webhooks/regenerate
router.post('/orders/webhooks/regenerate', commerceOrderController.regenerateWebhookSecret);

// GET /api/commerce/orders/:orderId (Single Order Details)
router.get('/orders/:orderId', commerceOrderController.getOrderById);

// PATCH /api/commerce/orders/:orderId/status (Update Statuses)
router.patch('/orders/:orderId/status', commerceOrderController.updateOrderStatus);

export default router;
