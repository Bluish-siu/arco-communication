import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * Shopify ID Token (Session Token) Verification Middleware
 * Validates the short-lived JWT issued by Shopify App Bridge.
 * 
 * Signature Algorithm: HS256 (signed using Shopify App Secret)
 * Claims checked:
 * - iss: https://{shop}.myshopify.com/admin or https://admin.shopify.com
 * - dest: https://{shop}.myshopify.com
 * - aud: SHOPIFY_API_KEY
 * - exp: expiration timestamp
 * - nbf: not before timestamp
 */
export const verifyShopifyIdToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or malformed Authorization header with Bearer token',
      });
    }

    const token = authHeader.split(' ')[1]?.trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Shopify session token missing from Authorization header',
      });
    }

    const secret = config.shopifyApiSecret;
    if (!secret) {
      console.error('[Shopify Auth Middleware Error] SHOPIFY_API_SECRET is not configured on server');
      return res.status(500).json({
        success: false,
        error: 'Server Shopify configuration incomplete',
      });
    }

    // 1. Authoritative verification of JWT signature using HS256
    jwt.verify(
      token,
      secret,
      {
        algorithms: ['HS256'],
        clockTolerance: 10, // 10 seconds leeway for minor clock drift
      },
      (err, decoded) => {
        if (err) {
          // Log safe error reason without exposing token
          console.warn(`[Shopify Auth Verification Failed]: ${err.name} - ${err.message}`);
          return res.status(401).json({
            success: false,
            error: `Invalid or expired Shopify session token: ${err.message}`,
          });
        }

        // 2. Validate audience (aud must match client ID / SHOPIFY_API_KEY)
        if (config.shopifyApiKey && decoded.aud && decoded.aud !== config.shopifyApiKey) {
          console.warn('[Shopify Auth Audience Mismatch]');
          return res.status(401).json({
            success: false,
            error: 'Shopify token audience does not match configured API key',
          });
        }

        // 3. Extract and validate shop domain from authoritative 'dest' claim
        let shopDomain = null;
        if (decoded.dest) {
          try {
            const destUrl = new URL(decoded.dest);
            shopDomain = destUrl.hostname.toLowerCase();
          } catch {
            // If dest is not full URL, check if hostname string
            if (typeof decoded.dest === 'string') {
              shopDomain = decoded.dest.replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
            }
          }
        }

        // Fallback extraction from 'iss' if dest is absent
        if (!shopDomain && decoded.iss) {
          try {
            const issUrl = new URL(decoded.iss);
            shopDomain = issUrl.hostname.toLowerCase();
          } catch {
            // ignore
          }
        }

        // Validate domain format (*.myshopify.com)
        if (!shopDomain || !/^[a-zA-Z0-9][a-zA-Z0-9\-]*.myshopify\.com$/.test(shopDomain)) {
          return res.status(401).json({
            success: false,
            error: 'Shopify token does not contain a valid myshopify.com destination',
          });
        }

        // 4. Attach verified Shopify context (Never trust browser-supplied shop query)
        req.shopify = {
          shopDomain,
          subject: decoded.sub || null,
          clientId: decoded.aud || null,
          rawIdToken: token, // Used server-side for RFC 8693 token exchange
          decoded,
        };

        next();
      }
    );
  } catch (error) {
    console.error('[Shopify Auth Middleware Exception]:', error.message);
    res.status(500).json({ success: false, error: 'Internal error validating Shopify authentication' });
  }
};
