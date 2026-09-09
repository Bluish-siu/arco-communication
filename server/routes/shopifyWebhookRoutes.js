import express from 'express';
import { verifyShopifyWebhook } from '../middleware/shopifyWebhookVerify.js';
import { shopifyWebhookController } from '../controllers/shopifyWebhookController.js';

const router = express.Router();

/**
 * Main Webhook Ingest Endpoint
 * Receives all Shopify topic notifications (app/uninstalled, customers/*, products/*, orders/*)
 */
router.post('/webhooks', verifyShopifyWebhook, shopifyWebhookController.handleWebhook);

/**
 * Mandatory Shopify Compliance Webhook Endpoints
 * (customers/data_request, customers/redact, shop/redact)
 */
router.post('/webhooks/compliance/customers-data-request', verifyShopifyWebhook, shopifyWebhookController.handleCustomersDataRequest);
router.post('/webhooks/compliance/customers-redact', verifyShopifyWebhook, shopifyWebhookController.handleCustomersRedact);
router.post('/webhooks/compliance/shop-redact', verifyShopifyWebhook, shopifyWebhookController.handleShopRedact);

export default router;
