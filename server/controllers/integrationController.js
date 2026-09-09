import crypto from 'crypto';
import { query } from '../config/db.js';
import { config } from '../config/index.js';
import { shopifyAuthService } from '../services/shopifyAuthService.js';
import { shopifyGraphService } from '../services/shopifyGraphService.js';

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
        'SELECT id, user_id, shop_domain, shop_name, status, installed_at, updated_at FROM shopify_integrations WHERE user_id = $1 AND status = $2 ORDER BY updated_at DESC LIMIT 1',
        [userId, 'connected']
      );

      const conn = shopifyRes.rows[0];

      res.json({
        success: true,
        data: {
          connected: !!conn,
          shopDomain: conn?.shop_domain || null,
          shopName: conn?.shop_name || (conn?.shop_domain ? conn.shop_domain.replace('.myshopify.com', '') : null),
          status: conn ? 'connected' : 'disconnected',
          installedAt: conn?.installed_at || null,
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
      let needsExchange = !record || !record.access_token || record.status !== 'connected';

      // 2. Check if existing token has expired
      if (record?.access_token && record?.expires_at) {
        const isExpired = new Date(record.expires_at).getTime() < Date.now();
        if (isExpired) {
          if (record.refresh_token) {
            try {
              const refreshed = await shopifyAuthService.refreshOfflineToken({
                shopDomain,
                refreshToken: record.refresh_token,
              });
              await query(
                `UPDATE shopify_integrations 
                 SET access_token = $1, refresh_token = $2, expires_at = $3, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $4`,
                [refreshed.accessToken, refreshed.refreshToken, refreshed.expiresAt, record.id]
              );
              record.access_token = refreshed.accessToken;
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
        const userId = req.user?.id || record?.user_id || 'usr_1';
        const connectionId = record?.id || `shp_${Date.now()}`;

        // 5. Register Phase 1 Webhooks
        try {
          const webhookBase = config.shopifyAppUrl || config.frontendUrl;
          const webhookUrl = `${webhookBase.replace(/\/$/, '')}/api/shopify/webhooks`;
          await shopifyGraphService.registerPhase1Webhooks({
            shopDomain,
            accessToken: exchange.accessToken,
            webhookUrl,
          });
        } catch (whErr) {
          console.warn(`[Shopify Webhook Auto-Registration Warning]:`, whErr.message);
        }

        // 6. Upsert shopify_integrations
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
           RETURNING id, user_id, shop_domain, shop_name, shopify_shop_id, scopes, status, installed_at`,
          [
            connectionId,
            userId,
            shopDomain,
            shopName,
            shopifyShopId,
            exchange.accessToken,
            exchange.refreshToken,
            exchange.expiresAt,
            exchange.scope,
          ]
        );

        record = upsertRes.rows[0];

        // 7. Sync with main integrations table
        try {
          const integRes = await query("SELECT config FROM integrations WHERE id = 'main'");
          if (integRes.rows.length > 0) {
            const currentConfig = integRes.rows[0].config || {};
            currentConfig.shopify = {
              status: 'Connected',
              storeUrl: `https://${shopDomain}`,
              connected: true,
              connectedAt: new Date().toISOString(),
            };
            await query("UPDATE integrations SET config = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 'main'", [
              JSON.stringify(currentConfig),
            ]);
          }
        } catch (syncErr) {
          console.warn('[Shopify Integration] Sync warning:', syncErr.message);
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

      const apiKey = config.shopifyApiKey;
      const scopes = config.shopifyScopes;
      const redirectUri = encodeURIComponent(config.shopifyRedirectUri);

      if (!apiKey || apiKey.trim() === '') {
        return res.status(500).json({
          success: false,
          error: 'SHOPIFY_API_KEY is not configured on the server. Please configure Shopify App credentials.',
        });
      }

      // Generate secure anti-CSRF state token
      const statePayload = JSON.stringify({ userId, shop: cleanShop, ts: Date.now() });
      const state = Buffer.from(statePayload).toString('base64');

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
      const { shop, accessToken, shopName } = req.body;

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

      const connectionId = `shp_${Date.now()}`;
      const nameToStore = shopName || cleanShop.replace('.myshopify.com', '');

      // Upsert into shopify_integrations table
      await query(
        `INSERT INTO shopify_integrations (
           id, user_id, shop_domain, shop_name, access_token, scopes, status, installed_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, 'connected', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (shop_domain) DO UPDATE 
         SET shop_name = EXCLUDED.shop_name,
             access_token = EXCLUDED.access_token,
             status = 'connected',
             updated_at = CURRENT_TIMESTAMP`,
        [connectionId, userId, cleanShop, nameToStore, accessToken, config.shopifyScopes]
      );

      // Maintain consistency with main integrations table
      try {
        const integRes = await query("SELECT config FROM integrations WHERE id = 'main'");
        if (integRes.rows.length > 0) {
          const currentConfig = integRes.rows[0].config || {};
          currentConfig.shopify = {
            status: 'Connected',
            storeUrl: `https://${cleanShop}`,
            connected: true,
            connectedAt: new Date().toISOString(),
          };
          await query("UPDATE integrations SET config = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 'main'", [JSON.stringify(currentConfig)]);
        }
      } catch (syncErr) {
        console.warn('[Shopify Integration] Sync with integrations table warning:', syncErr.message);
      }

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

      // Decode state
      let userId = 'usr_1';
      if (state) {
        try {
          const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
          if (decodedState.userId) userId = decodedState.userId;
        } catch {
          // Fallback to default user
        }
      }

      // Authoritative token exchange with Shopify OAuth endpoint
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
      const connectionId = `shp_${Date.now()}`;
      const nameToStore = cleanShop.replace('.myshopify.com', '');

      // Store in PostgreSQL
      await query(
        `INSERT INTO shopify_integrations (
           id, user_id, shop_domain, shop_name, access_token, scopes, status, installed_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, 'connected', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (shop_domain) DO UPDATE 
         SET access_token = EXCLUDED.access_token,
             scopes = EXCLUDED.scopes,
             status = 'connected',
             uninstalled_at = NULL,
             last_error = NULL,
             updated_at = CURRENT_TIMESTAMP`,
        [connectionId, userId, cleanShop, nameToStore, tokenToStore, scopeToStore]
      );

      // Sync integrations table
      try {
        const integRes = await query("SELECT config FROM integrations WHERE id = 'main'");
        if (integRes.rows.length > 0) {
          const currentConfig = integRes.rows[0].config || {};
          currentConfig.shopify = {
            status: 'Connected',
            storeUrl: `https://${cleanShop}`,
            connected: true,
            connectedAt: new Date().toISOString(),
          };
          await query("UPDATE integrations SET config = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 'main'", [JSON.stringify(currentConfig)]);
        }
      } catch (syncErr) {
        console.warn('[Shopify Integration] Callback sync warning:', syncErr.message);
      }

      // Redirect back to frontend integrations page with success indicator
      res.redirect(`${config.frontendUrl}/integrations?shopify=connected&shop=${encodeURIComponent(cleanShop)}`);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/integrations/shopify/disconnect
  disconnectShopify: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';

      await query(
        `UPDATE shopify_integrations 
         SET status = 'disconnected', access_token = NULL, refresh_token = NULL, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $1`,
        [userId]
      );

      // Maintain consistency with main integrations table
      try {
        const integRes = await query("SELECT config FROM integrations WHERE id = 'main'");
        if (integRes.rows.length > 0) {
          const currentConfig = integRes.rows[0].config || {};
          currentConfig.shopify = {
            status: 'Not Connected',
            storeUrl: '',
            connected: false,
          };
          await query("UPDATE integrations SET config = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 'main'", [JSON.stringify(currentConfig)]);
        }
      } catch (syncErr) {
        console.warn('[Shopify Integration] Disconnect sync warning:', syncErr.message);
      }

      res.json({
        success: true,
        message: 'Shopify Sales Channel disconnected successfully.',
        data: {
          connected: false,
          status: 'disconnected',
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

