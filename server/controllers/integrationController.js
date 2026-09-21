import crypto from 'crypto';
import { query } from '../config/db.js';
import { config } from '../config/index.js';
import { shopifyAuthService } from '../services/shopifyAuthService.js';
import { shopifyGraphService } from '../services/shopifyGraphService.js';
import { shopifySyncService } from '../services/shopifySyncService.js';
import {
  encryptToken,
  decryptTokenWithFallback,
  generateSignedOAuthState,
  verifySignedOAuthState,
} from '../utils/crypto.js';

// Helper to sanitize and normalize Shopify shop domain
function normalizeShopDomain(input) {
  if (!input || typeof input !== 'string') return null;
  let clean = input.trim().toLowerCase();
  clean = clean.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
  if (!clean.includes('.')) {
    clean = `${clean}.myshopify.com`;
  }
  // Validate regex for myshopify.com domain format
  const valid = /^[a-zA-Z0-9][a-zA-Z0-9\-]*.myshopify\.com$/.test(clean);
  return valid ? clean : null;
}

export const integrationController = {
  // GET /api/integrations (Returns only Shopify as requested)
  getIntegrations: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';

      const shopifyRes = await query(
        'SELECT * FROM shopify_integrations WHERE user_id = $1 AND status = $2 ORDER BY updated_at DESC LIMIT 1',
        [userId, 'connected']
      );

      const conn = shopifyRes.rows[0];
      const isConnected = !!conn;

      const shopifyIntegration = {
        id: 'shopify-sales',
        key: 'shopify',
        name: 'Shopify Sales Channel',
        category: 'e-Commerce Platform',
        plan: 'Free',
        badge: 'Free',
        logo: 'shopify',
        description: 'Auto-sync Shopify products & collections to WhatsApp',
        longDescription: 'Connect your Shopify storefront to automatically sync catalogs, recover abandoned carts with intelligent WhatsApp drip automations, and receive native in-chat checkout orders.',
        connected: isConnected,
        shopDomain: conn?.shop_domain || null,
        shopName: conn?.shop_name || (conn?.shop_domain ? conn.shop_domain.replace('.myshopify.com', '') : null),
        installedAt: conn?.installed_at || null,
        status: isConnected ? 'connected' : 'disconnected',
      };

      res.json({
        success: true,
        count: 1,
        data: [shopifyIntegration],
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/integrations/shopify/status
  getShopifyStatus: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';

      const shopifyRes = await query(
        'SELECT id, user_id, shop_domain, shop_name, shopify_shop_id, status, installed_at, last_error, updated_at FROM shopify_integrations WHERE user_id = $1 AND status != $2 ORDER BY updated_at DESC LIMIT 1',
        [userId, 'disconnected']
      );

      const conn = shopifyRes.rows[0];

      res.json({
        success: true,
        data: {
          connected: conn?.status === 'connected',
          shopDomain: conn?.shop_domain || null,
          shopName: conn?.shop_name || (conn?.shop_domain ? conn.shop_domain.replace('.myshopify.com', '') : null),
          shopifyShopId: conn?.shopify_shop_id || null,
          status: conn ? conn.status : 'disconnected',
          installedAt: conn?.installed_at || null,
          lastError: conn?.last_error || null,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/integrations/shopify/session (Shopify App Bridge Embedded Session)
  getShopifySession: async (req, res, next) => {
    try {
      const { shopDomain, rawIdToken } = req.shopify || {};
      if (!shopDomain) {
        return res.status(401).json({ success: false, error: 'Shop domain not verified in session' });
      }

      // 1. Look up existing integration by shop_domain
      const integRes = await query(
        `SELECT id, user_id, shop_domain, shop_name, shopify_shop_id, access_token, 
                refresh_token, expires_at, scopes, status, installed_at 
         FROM shopify_integrations 
         WHERE shop_domain = $1 
         LIMIT 1`,
        [shopDomain]
      );

      let record = integRes.rows[0];
      const userId = req.user?.id || record?.user_id || 'usr_1';

      // Anti-hijacking check: if store belongs to another user, reject
      if (record && record.user_id && record.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'This Shopify store is already connected to another ARCO account.',
        });
      }

      let needsExchange = !record || !record.access_token || record.status !== 'connected';

      // 2. Check if existing token has expired
      if (record?.access_token && record?.expires_at) {
        const isExpired = new Date(record.expires_at).getTime() < Date.now();
        if (isExpired) {
          if (record.refresh_token) {
            try {
              const rawRefreshToken = decryptTokenWithFallback(record.refresh_token);
              const refreshed = await shopifyAuthService.refreshOfflineToken({
                shopDomain,
                refreshToken: rawRefreshToken,
              });
              const encryptedAccess = encryptToken(refreshed.accessToken);
              const encryptedRefresh = encryptToken(refreshed.refreshToken);
              await query(
                `UPDATE shopify_integrations 
                 SET access_token = $1, refresh_token = $2, expires_at = $3, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $4`,
                [encryptedAccess, encryptedRefresh, refreshed.expiresAt, record.id]
              );
              record.access_token = encryptedAccess;
              record.expires_at = refreshed.expiresAt;
              needsExchange = false;
            } catch (refErr) {
              console.warn(`[Shopify Token Refresh Failed for ${shopDomain}]:`, refErr.message);
              needsExchange = true;
            }
          } else {
            needsExchange = true;
          }
        }
      }

      // 3. Perform Token Exchange if no valid offline token exists
      if (needsExchange) {
        if (!rawIdToken) {
          return res.status(401).json({ success: false, error: 'Cannot perform token exchange without ID token' });
        }

        const exchange = await shopifyAuthService.exchangeSessionTokenForOfflineToken({
          shopDomain,
          idToken: rawIdToken,
        });

        // 4. Query shop metadata via GraphQL
        let shopData = null;
        try {
          shopData = await shopifyGraphService.getShop({
            shopDomain,
            accessToken: exchange.accessToken,
          });
        } catch (graphErr) {
          console.warn(`[Shopify Shop Metadata Fetch Warning for ${shopDomain}]:`, graphErr.message);
        }

        const shopName = shopData?.name || shopDomain.replace('.myshopify.com', '');
        const shopifyShopId = shopData?.id || null;
        const connectionId = record?.id || `shp_${Date.now()}`;

        // 5. Register Phase 1 Webhooks
        try {
          const webhookBase = config.shopifyWebhookBaseUrl || 'https://arco-backend-ecbl.onrender.com';
          const webhookUrl = `${webhookBase.replace(/\/+$/, '')}/api/shopify/webhooks`;
          await shopifyGraphService.registerPhase1Webhooks({
            shopDomain,
            accessToken: exchange.accessToken,
            webhookUrl,
          });
        } catch (whErr) {
          console.warn(`[Shopify Webhook Auto-Registration Warning]:`, whErr.message);
        }

        // 6. Encrypt tokens before storing in PostgreSQL
        const encryptedAccessToken = encryptToken(exchange.accessToken);
        const encryptedRefreshToken = exchange.refreshToken ? encryptToken(exchange.refreshToken) : null;

        const upsertRes = await query(
          `INSERT INTO shopify_integrations (
             id, user_id, shop_domain, shop_name, shopify_shop_id, access_token, refresh_token,
             expires_at, scopes, status, installed_at, uninstalled_at, last_error, updated_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'connected', CURRENT_TIMESTAMP, NULL, NULL, CURRENT_TIMESTAMP)
           ON CONFLICT (shop_domain) DO UPDATE 
           SET access_token = EXCLUDED.access_token,
               refresh_token = EXCLUDED.refresh_token,
               expires_at = EXCLUDED.expires_at,
               shop_name = EXCLUDED.shop_name,
               shopify_shop_id = EXCLUDED.shopify_shop_id,
               scopes = EXCLUDED.scopes,
               status = 'connected',
               uninstalled_at = NULL,
               last_error = NULL,
               updated_at = CURRENT_TIMESTAMP
           WHERE shopify_integrations.user_id = EXCLUDED.user_id
           RETURNING id, user_id, shop_domain, shop_name, shopify_shop_id, scopes, status, installed_at`,
          [
            connectionId,
            userId,
            shopDomain,
            shopName,
            shopifyShopId,
            encryptedAccessToken,
            encryptedRefreshToken,
            exchange.expiresAt,
            exchange.scope,
          ]
        );

        record = upsertRes.rows[0];
      } else if (record?.access_token && (req.query?.reconcile === 'true' || req.query?.sync_webhooks === 'true')) {
        // Explicit on-demand webhook reconciliation for already-connected store
        try {
          const rawAccessToken = decryptTokenWithFallback(record.access_token);
          const webhookBase = config.shopifyWebhookBaseUrl || 'https://arco-backend-ecbl.onrender.com';
          const webhookUrl = `${webhookBase.replace(/\/+$/, '')}/api/shopify/webhooks`;
          await shopifyGraphService.registerPhase1Webhooks({
            shopDomain,
            accessToken: rawAccessToken,
            webhookUrl,
          });
        } catch (whErr) {
          console.warn(`[Shopify Webhook Session Reconcile Warning]:`, whErr.message);
        }
      }

      // Return ONLY strictly safe information to frontend (NEVER return access_token or secrets)
      res.json({
        success: true,
        data: {
          connected: record.status === 'connected',
          shopDomain: record.shop_domain,
          shopName: record.shop_name,
          scopes: record.scopes,
          status: record.status,
          installedAt: record.installed_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/integrations/shopify/oauth-url
  getShopifyOAuthUrl: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const rawShop = req.query.shop || req.body?.shop;

      const cleanShop = normalizeShopDomain(rawShop);
      if (!cleanShop) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Shopify store domain. Please provide a valid domain such as "your-store.myshopify.com".',
        });
      }

      // Check if this store domain is already actively connected to a different ARCO account
      const existingRes = await query(
        'SELECT id, user_id, status FROM shopify_integrations WHERE shop_domain = $1 LIMIT 1',
        [cleanShop]
      );
      const existingConn = existingRes.rows[0];
      if (existingConn && existingConn.user_id && existingConn.user_id !== userId) {
        return res.status(409).json({
          success: false,
          error: 'This Shopify store is already connected to another ARCO account. Please disconnect it from the other account first.',
        });
      }

      const apiKey = config.shopifyApiKey;
      const scopes = config.shopifyScopes;
      const redirectUri = encodeURIComponent(config.shopifyRedirectUri);

      if (!apiKey || apiKey.trim() === '') {
        return res.status(500).json({
          success: false,
          error: 'SHOPIFY_API_KEY is not configured on the server. Please configure Shopify App credentials.',
        });
      }

      // Generate cryptographically signed anti-CSRF state token bound to userId, shop, and timestamp
      const state = generateSignedOAuthState({ userId, shop: cleanShop });

      const authUrl = `https://${cleanShop}/admin/oauth/authorize?client_id=${apiKey}&scope=${encodeURIComponent(scopes)}&redirect_uri=${redirectUri}&state=${state}`;

      res.json({
        success: true,
        data: {
          authUrl,
          shop: cleanShop,
          state,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/integrations/shopify/connect (Direct connection handler with verified credentials)
  connectShopify: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const shop = req.body?.shop || req.body?.shopDomain;
      const { accessToken, shopName } = req.body || {};

      const cleanShop = normalizeShopDomain(shop);
      if (!cleanShop) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Shopify store domain. Format must be "your-store.myshopify.com".',
        });
      }

      if (!accessToken || typeof accessToken !== 'string' || accessToken.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Valid Shopify access token is required to complete connection.',
        });
      }

      // Anti-hijacking check: verify store is not currently connected to another account
      const existingRes = await query(
        'SELECT id, user_id, status FROM shopify_integrations WHERE shop_domain = $1 LIMIT 1',
        [cleanShop]
      );
      const existingConn = existingRes.rows[0];
      if (existingConn && existingConn.user_id && existingConn.user_id !== userId) {
        return res.status(409).json({
          success: false,
          error: 'This Shopify store is already connected to another ARCO account. Please disconnect it from the other account first.',
        });
      }

      const connectionId = existingConn?.id || `shp_${Date.now()}`;
      const nameToStore = shopName || cleanShop.replace('.myshopify.com', '');
      const encryptedAccessToken = encryptToken(accessToken);

      // Upsert into shopify_integrations table with encrypted token
      await query(
        `INSERT INTO shopify_integrations (
           id, user_id, shop_domain, shop_name, access_token, scopes, status, installed_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, 'connected', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (shop_domain) DO UPDATE 
         SET shop_name = EXCLUDED.shop_name,
             access_token = EXCLUDED.access_token,
             status = 'connected',
             uninstalled_at = NULL,
             last_error = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE shopify_integrations.user_id = EXCLUDED.user_id`,
        [connectionId, userId, cleanShop, nameToStore, encryptedAccessToken, config.shopifyScopes]
      );

      res.json({
        success: true,
        message: 'Shopify Sales Channel connected successfully.',
        data: {
          connected: true,
          shopDomain: cleanShop,
          shopName: nameToStore,
          status: 'connected',
          installedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/integrations/shopify/callback (OAuth Callback from Shopify with real token exchange)
  handleShopifyCallback: async (req, res, next) => {
    try {
      const { code, shop, state, error: oauthError } = req.query;

      if (oauthError) {
        return res.redirect(`${config.frontendUrl}/integrations?error=${encodeURIComponent(oauthError)}`);
      }

      if (!shop) {
        return res.redirect(`${config.frontendUrl}/integrations?error=missing_shop`);
      }

      const cleanShop = normalizeShopDomain(shop);
      if (!cleanShop) {
        return res.redirect(`${config.frontendUrl}/integrations?error=invalid_shop_domain`);
      }

      if (!code) {
        return res.redirect(`${config.frontendUrl}/integrations?error=missing_authorization_code`);
      }

      if (!config.shopifyApiKey || !config.shopifyApiSecret) {
        return res.redirect(`${config.frontendUrl}/integrations?error=missing_shopify_server_credentials`);
      }

      // 1. Cryptographic state verification
      if (!state) {
        return res.redirect(`${config.frontendUrl}/integrations?error=missing_oauth_state`);
      }

      const stateVerification = verifySignedOAuthState(state, cleanShop);
      if (!stateVerification.success) {
        console.warn(`[Shopify OAuth Security Failure]: ${stateVerification.error}`);
        return res.redirect(`${config.frontendUrl}/integrations?error=${encodeURIComponent(stateVerification.error)}`);
      }

      const verifiedUserId = stateVerification.userId;

      // 2. Anti-hijacking check: ensure store is not already connected to a DIFFERENT ARCO user
      const existingRes = await query(
        'SELECT id, user_id, status FROM shopify_integrations WHERE shop_domain = $1 LIMIT 1',
        [cleanShop]
      );
      const existingRecord = existingRes.rows[0];

      if (existingRecord && existingRecord.user_id && existingRecord.user_id !== verifiedUserId) {
        console.warn(`[Shopify Store Hijack Blocked]: User "${verifiedUserId}" attempted to connect store "${cleanShop}" owned by User "${existingRecord.user_id}"`);
        return res.redirect(`${config.frontendUrl}/integrations?error=${encodeURIComponent('This Shopify store is already connected to another ARCO account.')}`);
      }

      // 3. Authoritative token exchange with Shopify OAuth endpoint
      const tokenEndpoint = `https://${cleanShop}/admin/oauth/access_token`;
      const tokenResponse = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: config.shopifyApiKey,
          client_secret: config.shopifyApiSecret,
          code,
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok || tokenData.error) {
        const errMsg = tokenData.error_description || tokenData.error || 'Token exchange failed';
        console.warn('[Shopify OAuth Callback Token Exchange Failed]:', errMsg);
        return res.redirect(`${config.frontendUrl}/integrations?error=${encodeURIComponent(errMsg)}`);
      }

      const tokenToStore = tokenData.access_token;
      const scopeToStore = tokenData.scope || config.shopifyScopes;
      const connectionId = existingRecord?.id || `shp_${Date.now()}`;

      // 4. Fetch Shopify Shop Metadata via GraphQL (authoritative store identity)
      let shopData = null;
      try {
        shopData = await shopifyGraphService.getShop({
          shopDomain: cleanShop,
          accessToken: tokenToStore,
        });
      } catch (graphErr) {
        console.warn(`[Shopify OAuth Metadata Fetch Failed for ${cleanShop}]:`, graphErr.message);
      }

      if (!shopData || !shopData.id) {
        const fetchErrMsg = 'Failed to fetch Shopify store metadata. Installation cannot be confirmed.';
        console.warn(`[Shopify OAuth Metadata Validation Failed for ${cleanShop}]`);
        return res.redirect(`${config.frontendUrl}/integrations?error=${encodeURIComponent(fetchErrMsg)}`);
      }

      const realShopName = shopData.name || cleanShop.replace('.myshopify.com', '');
      const shopifyShopId = shopData.id; // e.g. gid://shopify/Shop/123456789

      // 5. Encrypt token before persisting to PostgreSQL
      const encryptedAccessToken = encryptToken(tokenToStore);

      // 6. Persist/update integration record in PostgreSQL with pending status before webhooks
      await query(
        `INSERT INTO shopify_integrations (
           id, user_id, shop_domain, shop_name, shopify_shop_id, access_token, scopes, status, installed_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (shop_domain) DO UPDATE 
         SET shop_name = EXCLUDED.shop_name,
             shopify_shop_id = EXCLUDED.shopify_shop_id,
             access_token = EXCLUDED.access_token,
             scopes = EXCLUDED.scopes,
             status = 'pending',
             uninstalled_at = NULL,
             last_error = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE shopify_integrations.user_id = EXCLUDED.user_id`,
        [connectionId, verifiedUserId, cleanShop, realShopName, shopifyShopId, encryptedAccessToken, scopeToStore]
      );

      // 7. Register & reconcile Phase 1 webhooks
      const webhookBase = config.shopifyWebhookBaseUrl || 'https://arco-backend-ecbl.onrender.com';
      const webhookUrl = `${webhookBase.replace(/\/+$/, '')}/api/shopify/webhooks`;

      let webhookResults = [];
      let webhookSuccess = false;
      let webhookErrorMsg = null;

      try {
        webhookResults = await shopifyGraphService.registerPhase1Webhooks({
          shopDomain: cleanShop,
          accessToken: tokenToStore,
          webhookUrl,
        });

        webhookSuccess = Array.isArray(webhookResults) &&
          webhookResults.length > 0 &&
          webhookResults.every((r) => r.success === true);

        if (!webhookSuccess) {
          const failedTopics = (webhookResults || [])
            .filter((r) => !r.success)
            .map((r) => `${r.topic}: ${r.error || 'failed'}`)
            .join('; ');
          webhookErrorMsg = failedTopics || 'Webhook registration incomplete';
        }
      } catch (whErr) {
        console.warn(`[Shopify OAuth Webhook Registration Error for ${cleanShop}]:`, whErr.message);
        webhookErrorMsg = whErr.message;
        webhookSuccess = false;
      }

      // 8. Confirm installation or set action required
      if (webhookSuccess) {
        await query(
          `UPDATE shopify_integrations 
           SET status = 'connected', last_error = NULL, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $1 AND user_id = $2`,
          [connectionId, verifiedUserId]
        );
        return res.redirect(`${config.frontendUrl}/integrations?shopify=connected&shop=${encodeURIComponent(cleanShop)}`);
      } else {
        const actionRequiredError = `Webhook registration requires reconciliation: ${webhookErrorMsg}`;
        await query(
          `UPDATE shopify_integrations 
           SET status = 'action_required', last_error = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2 AND user_id = $3`,
          [actionRequiredError, connectionId, verifiedUserId]
        );
        return res.redirect(
          `${config.frontendUrl}/integrations?shopify=action_required&shop=${encodeURIComponent(cleanShop)}&error=${encodeURIComponent(actionRequiredError)}`
        );
      }
    } catch (error) {
      next(error);
    }
  },

  // POST /api/integrations/shopify/disconnect
  disconnectShopify: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const shopDomainQuery = req.body?.shop || req.query?.shop;

      let integRes;
      if (shopDomainQuery) {
        const cleanShop = normalizeShopDomain(shopDomainQuery);
        integRes = await query(
          "SELECT id, user_id, shop_domain, shop_name, access_token, status FROM shopify_integrations WHERE user_id = $1 AND shop_domain = $2 AND status != 'disconnected' LIMIT 1",
          [userId, cleanShop]
        );
      } else {
        integRes = await query(
          "SELECT id, user_id, shop_domain, shop_name, access_token, status FROM shopify_integrations WHERE user_id = $1 AND status != 'disconnected' ORDER BY updated_at DESC LIMIT 1",
          [userId]
        );
      }

      const conn = integRes?.rows?.[0];
      let cleanupError = null;
      let deletedCount = 0;

      // 1. Discover and delete ARCO-managed webhook subscriptions from Shopify
      if (conn?.access_token && conn?.shop_domain) {
        try {
          const decryptedToken = decryptTokenWithFallback(conn.access_token);
          if (decryptedToken) {
            const webhookBase = config.shopifyWebhookBaseUrl || 'https://arco-backend-ecbl.onrender.com';
            const targetWebhookUrl = `${webhookBase.replace(/\/+$/, '')}/api/shopify/webhooks`;

            const existingSubs = await shopifyGraphService.getWebhookSubscriptions({
              shopDomain: conn.shop_domain,
              accessToken: decryptedToken,
            });

            // Filter strictly for ARCO-managed webhooks (/api/shopify/webhooks callback URL)
            const arcoSubs = (existingSubs || []).filter(
              (sub) =>
                sub.callbackUrl === targetWebhookUrl ||
                (sub.callbackUrl && sub.callbackUrl.includes('/api/shopify/webhooks'))
            );

            for (const sub of arcoSubs) {
              try {
                const delRes = await shopifyGraphService.deleteWebhookSubscription({
                  shopDomain: conn.shop_domain,
                  accessToken: decryptedToken,
                  id: sub.id,
                });
                if (delRes?.success) {
                  deletedCount++;
                } else {
                  console.warn(`[Shopify Disconnect Cleanup Warning for ${sub.id}]:`, delRes?.errors);
                  cleanupError = delRes?.errors || 'Some webhooks failed deletion';
                }
              } catch (delErr) {
                console.warn(`[Shopify Disconnect Cleanup Error for ${sub.id}]:`, delErr.message);
                cleanupError = delErr.message;
              }
            }
          }
        } catch (subQueryErr) {
          console.warn(`[Shopify Disconnect Webhook Discovery Error for ${conn.shop_domain}]:`, subQueryErr.message);
          cleanupError = subQueryErr.message;
        }
      }

      // 2. Safely clear credentials and update status to disconnected while preserving ownership metadata
      await query(
        `UPDATE shopify_integrations 
         SET status = 'disconnected', 
             access_token = NULL, 
             refresh_token = NULL, 
             last_error = $2, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $1 AND ($3::varchar IS NULL OR id = $3)`,
        [userId, cleanupError ? `Webhook cleanup incomplete: ${cleanupError}` : null, conn?.id || null]
      );

      res.json({
        success: true,
        message: cleanupError
          ? 'Shopify Sales Channel disconnected, but some webhook subscriptions could not be removed from Shopify.'
          : 'Shopify Sales Channel disconnected and webhooks removed successfully.',
        data: {
          connected: false,
          status: 'disconnected',
          deletedWebhooks: deletedCount,
          cleanupError: cleanupError || null,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/integrations/shopify/reconcile-webhooks
  reconcileShopifyWebhooks: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const shopDomainQuery = req.body?.shop || req.query?.shop;

      let integRes;
      if (shopDomainQuery) {
        const cleanShop = normalizeShopDomain(shopDomainQuery);
        // Strict tenant isolation: must match BOTH shop_domain AND user_id
        integRes = await query(
          'SELECT id, shop_domain, access_token, status FROM shopify_integrations WHERE shop_domain = $1 AND user_id = $2 AND status = $3 LIMIT 1',
          [cleanShop, userId, 'connected']
        );
      } else {
        integRes = await query(
          'SELECT id, shop_domain, access_token, status FROM shopify_integrations WHERE user_id = $1 AND status = $2 ORDER BY updated_at DESC LIMIT 1',
          [userId, 'connected']
        );
      }

      const conn = integRes.rows[0];
      if (!conn || !conn.access_token) {
        return res.status(404).json({
          success: false,
          error: 'No active connected Shopify integration found on your account to reconcile webhooks.',
        });
      }

      const decryptedToken = decryptTokenWithFallback(conn.access_token);
      if (!decryptedToken) {
        return res.status(500).json({
          success: false,
          error: 'Failed to access Shopify credentials for webhook reconciliation.',
        });
      }

      const webhookBase = config.shopifyWebhookBaseUrl || 'https://arco-backend-ecbl.onrender.com';
      const webhookUrl = `${webhookBase.replace(/\/+$/, '')}/api/shopify/webhooks`;

      const results = await shopifyGraphService.registerPhase1Webhooks({
        shopDomain: conn.shop_domain,
        accessToken: decryptedToken,
        webhookUrl,
      });

      res.json({
        success: true,
        message: 'Shopify Phase 1 webhooks reconciled successfully against Render.',
        shopDomain: conn.shop_domain,
        webhookUrl,
        results,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/integrations/shopify/sync (Trigger historical data sync)
  startShopifySync: async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const syncType = req.body?.syncType || 'full';
      const resumeJobId = req.body?.resumeJobId;

      // Check for user's connected store
      const integRes = await query(
        "SELECT id, user_id, shop_domain, status FROM shopify_integrations WHERE user_id = $1 AND status = 'connected' LIMIT 1",
        [userId]
      );

      if (!integRes.rows.length) {
        return res.status(400).json({
          success: false,
          error: 'No active connected Shopify store found. Please connect your store before starting sync.',
        });
      }

      const integration = integRes.rows[0];

      let syncJob;
      if (resumeJobId) {
        syncJob = await shopifySyncService.getJobById(resumeJobId, userId);
        if (!syncJob) {
          return res.status(404).json({ success: false, error: 'Sync job to resume not found' });
        }
      } else {
        const createResult = await shopifySyncService.createSyncJob({
          userId,
          integrationId: integration.id,
          shopDomain: integration.shop_domain,
          syncType,
        });
        syncJob = createResult.job;
      }

      // Launch background execution if job is queued or failed
      if (syncJob.status === 'queued' || syncJob.status === 'failed') {
        shopifySyncService.runSyncJob(syncJob.id).catch((err) => {
          console.error(`[Shopify Sync Background Execution Error on ${syncJob.id}]:`, err.message);
        });
      }

      res.status(202).json({
        success: true,
        message: `Shopify ${syncType} sync ${syncJob.status === 'running' ? 'already running' : 'started'}.`,
        job: syncJob,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/integrations/shopify/sync/status (Poll latest sync progress)
  getShopifySyncStatus: async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const latestJob = await shopifySyncService.getLatestJob(userId);

      res.json({
        success: true,
        job: latestJob,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/integrations/shopify/sync/:jobId/cancel (Cancel in-progress sync)
  cancelShopifySync: async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const { jobId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const cancelledJob = await shopifySyncService.cancelSyncJob(jobId, userId);

      res.json({
        success: true,
        message: 'Shopify sync job cancelled.',
        job: cancelledJob,
      });
    } catch (error) {
      next(error);
    }
  },
};


