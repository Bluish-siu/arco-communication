import crypto from 'crypto';
import { config } from '../config/index.js';

/**
 * Shopify Webhook HMAC-SHA256 Signature Verification Middleware
 * Validates the authenticity of incoming webhooks using Shopify App Secret.
 */
export const verifyShopifyWebhook = (req, res, next) => {
  try {
    const hmacHeader = req.headers['x-shopify-hmac-sha256'];
    const topic = req.headers['x-shopify-topic'];
    const shopDomain = req.headers['x-shopify-shop-domain'];

    if (!hmacHeader) {
      console.warn('[Shopify Webhook Denied]: Missing x-shopify-hmac-sha256 header');
      return res.status(401).json({ success: false, error: 'Missing Shopify HMAC signature header' });
    }

    const secret = config.shopifyApiSecret;
    if (!secret) {
      console.error('[Shopify Webhook Error]: SHOPIFY_API_SECRET not configured on server');
      return res.status(500).json({ success: false, error: 'Server webhook configuration incomplete' });
    }

    const rawBody = req.rawBody;
    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      console.error('[Shopify Webhook Error]: Raw request body buffer not available. Ensure express.json verify is enabled.');
      return res.status(400).json({ success: false, error: 'Unable to verify webhook payload integrity' });
    }

    // Calculate expected HMAC-SHA256 signature in Base64
    const calculatedHmac = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('base64');

    const hmacBuffer = Buffer.from(hmacHeader, 'base64');
    const calculatedBuffer = Buffer.from(calculatedHmac, 'base64');

    // Timing-safe comparison to prevent timing attacks
    if (hmacBuffer.length !== calculatedBuffer.length || !crypto.timingSafeEqual(hmacBuffer, calculatedBuffer)) {
      console.warn(`[Shopify Webhook Signature Mismatch] Topic: "${topic}" Shop: "${shopDomain}"`);
      return res.status(401).json({ success: false, error: 'Invalid Shopify webhook signature' });
    }

    // Attach validated webhook context
    req.shopifyWebhook = {
      topic,
      shopDomain: shopDomain ? shopDomain.toLowerCase() : null,
      webhookId: req.headers['x-shopify-webhook-id'] || null,
      apiVersion: req.headers['x-shopify-api-version'] || null,
    };

    next();
  } catch (error) {
    console.error('[Shopify Webhook Middleware Exception]:', error.message);
    res.status(500).json({ success: false, error: 'Internal webhook verification error' });
  }
};
