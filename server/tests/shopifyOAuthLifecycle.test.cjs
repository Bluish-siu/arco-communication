/**
 * Phase 2: Complete Shopify OAuth Installation Lifecycle Test Suite
 * 
 * Verifies:
 * 1. OAuth callback exchanges code successfully
 * 2. Shop metadata is fetched and shopify_shop_id is persisted
 * 3. Real shop_name from Shopify is persisted
 * 4. OAuth callback invokes webhook reconciliation/registration
 * 5. Webhook registration is idempotent
 * 6. Existing webhook subscriptions are not duplicated (obsolete pruned)
 * 7. Shop metadata failure is handled safely
 * 8. Webhook registration failure does not produce a false "fully connected" success
 * 9. Existing Phase 1 tenant ownership protection remains intact
 */

const assert = require('assert');
const crypto = require('crypto');

let passedTests = 0;
let totalTests = 0;

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
    if (err.stack) console.error(err.stack);
  }
}

function createMocks({ query = {}, headers = {}, user = null } = {}) {
  let redirectUrl = null;
  let statusCode = 200;
  let jsonResponse = null;

  const req = {
    query,
    headers,
    user,
  };

  const res = {
    redirect(url) {
      redirectUrl = url;
      return this;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResponse = data;
      return this;
    },
  };

  return {
    req,
    res,
    getRedirectUrl: () => redirectUrl,
    getStatus: () => statusCode,
    getJson: () => jsonResponse,
  };
}

async function main() {
  console.log('\n=============================================================');
  console.log(' RUNNING SHOPIFY OAUTH INSTALLATION LIFECYCLE TEST SUITE');
  console.log('=============================================================\n');

  const { pool } = await import('../config/db.js');
  const { config } = await import('../config/index.js');
  const { integrationController } = await import('../controllers/integrationController.js');
  const { shopifyGraphService } = await import('../services/shopifyGraphService.js');
  const { generateSignedOAuthState, decryptTokenWithFallback } = await import('../utils/crypto.js');

  const TEST_SHOP = 'test-lifecycle-store.myshopify.com';
  const TEST_USER = 'usr_tenant_test_1';
  const TEST_CODE = 'mock_auth_code_xyz123';
  const TEST_TOKEN = 'shpat_mock_live_token_77889900';
  const TEST_GRAPH_SHOP_ID = 'gid://shopify/Shop/987654321';
  const TEST_REAL_SHOP_NAME = 'Artisan Heritage Apparel';

  // Helper to construct a valid signed state
  function getValidState(shop = TEST_SHOP, userId = TEST_USER) {
    return generateSignedOAuthState({ userId, shop });
  }

  // Backup original globals and service methods
  const originalFetch = global.fetch;
  const originalGetShop = shopifyGraphService.getShop;
  const originalRegisterWebhooks = shopifyGraphService.registerPhase1Webhooks;
  const originalGetSubs = shopifyGraphService.getWebhookSubscriptions;
  const originalDeleteSub = shopifyGraphService.deleteWebhookSubscription;
  const originalRegSub = shopifyGraphService.registerWebhookSubscription;

  // -------------------------------------------------------------
  // Test 1: OAuth callback exchanges code successfully
  // -------------------------------------------------------------
  await runAsyncTest('1. OAuth callback exchanges authorization code successfully for offline access token', async () => {
    let tokenEndpointCalled = false;
    let tokenRequestBody = null;

    global.fetch = async (url, opts) => {
      if (url.includes('/admin/oauth/access_token')) {
        tokenEndpointCalled = true;
        tokenRequestBody = JSON.parse(opts.body);
        return {
          ok: true,
          json: async () => ({
            access_token: TEST_TOKEN,
            scope: 'read_orders,write_products',
          }),
        };
      }
      return { ok: true, json: async () => ({}) };
    };

    shopifyGraphService.getShop = async () => ({
      id: TEST_GRAPH_SHOP_ID,
      name: TEST_REAL_SHOP_NAME,
      myshopifyDomain: TEST_SHOP,
    });

    shopifyGraphService.registerPhase1Webhooks = async () => [
      { topic: 'APP_UNINSTALLED', success: true },
      { topic: 'ORDERS_CREATE', success: true },
    ];

    const originalQuery = pool.query;
    pool.query = async (text) => {
      if (text.includes('SELECT id, user_id, status FROM shopify_integrations WHERE shop_domain = $1')) {
        return { rows: [] };
      }
      return { rows: [{ id: 'shp_1' }] };
    };

    try {
      const state = getValidState();
      const { req, res, getRedirectUrl } = createMocks({
        query: { code: TEST_CODE, shop: TEST_SHOP, state },
      });

      await integrationController.handleShopifyCallback(req, res, () => {});

      assert.ok(tokenEndpointCalled, 'Must call Shopify token exchange endpoint');
      assert.strictEqual(tokenRequestBody.code, TEST_CODE, 'Must send authorization code');
      assert.ok(getRedirectUrl()?.includes('shopify=connected'), 'Must redirect with shopify=connected');
    } finally {
      global.fetch = originalFetch;
      shopifyGraphService.getShop = originalGetShop;
      shopifyGraphService.registerPhase1Webhooks = originalRegisterWebhooks;
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 2: Shop metadata is fetched and shopify_shop_id is persisted
  // -------------------------------------------------------------
  await runAsyncTest('2. Shop metadata is fetched via GraphQL and shopify_shop_id is persisted', async () => {
    let persistedShopId = null;

    global.fetch = async (url) => {
      if (url.includes('/admin/oauth/access_token')) {
        return { ok: true, json: async () => ({ access_token: TEST_TOKEN, scope: config.shopifyScopes }) };
      }
      return { ok: true, json: async () => ({}) };
    };

    shopifyGraphService.getShop = async ({ shopDomain, accessToken }) => {
      assert.strictEqual(shopDomain, TEST_SHOP);
      assert.strictEqual(accessToken, TEST_TOKEN);
      return {
        id: TEST_GRAPH_SHOP_ID,
        name: TEST_REAL_SHOP_NAME,
      };
    };

    shopifyGraphService.registerPhase1Webhooks = async () => [
      { topic: 'APP_UNINSTALLED', success: true },
    ];

    const originalQuery = pool.query;
    pool.query = async (text, params) => {
      if (text.includes('SELECT id, user_id, status FROM shopify_integrations WHERE shop_domain = $1')) {
        return { rows: [] };
      }
      if (text.includes('INSERT INTO shopify_integrations')) {
        persistedShopId = params[4]; // shopify_shop_id parameter
        return { rows: [{ id: 'shp_1' }] };
      }
      return { rows: [] };
    };

    try {
      const state = getValidState();
      const { req, res } = createMocks({
        query: { code: TEST_CODE, shop: TEST_SHOP, state },
      });

      await integrationController.handleShopifyCallback(req, res, () => {});

      assert.strictEqual(
        persistedShopId,
        TEST_GRAPH_SHOP_ID,
        'Must persist authoritative GraphQL shop ID (gid://shopify/Shop/...)'
      );
    } finally {
      global.fetch = originalFetch;
      shopifyGraphService.getShop = originalGetShop;
      shopifyGraphService.registerPhase1Webhooks = originalRegisterWebhooks;
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 3: Real shop_name from Shopify is persisted
  // -------------------------------------------------------------
  await runAsyncTest('3. Real shop_name from Shopify GraphQL response is persisted (not query param)', async () => {
    let persistedShopName = null;

    global.fetch = async (url) => {
      if (url.includes('/admin/oauth/access_token')) {
        return { ok: true, json: async () => ({ access_token: TEST_TOKEN, scope: config.shopifyScopes }) };
      }
      return { ok: true, json: async () => ({}) };
    };

    shopifyGraphService.getShop = async () => ({
      id: TEST_GRAPH_SHOP_ID,
      name: TEST_REAL_SHOP_NAME,
    });

    shopifyGraphService.registerPhase1Webhooks = async () => [
      { topic: 'APP_UNINSTALLED', success: true },
    ];

    const originalQuery = pool.query;
    pool.query = async (text, params) => {
      if (text.includes('SELECT id, user_id, status FROM shopify_integrations WHERE shop_domain = $1')) {
        return { rows: [] };
      }
      if (text.includes('INSERT INTO shopify_integrations')) {
        persistedShopName = params[3]; // shop_name parameter
        return { rows: [{ id: 'shp_1' }] };
      }
      return { rows: [] };
    };

    try {
      const state = getValidState();
      const { req, res } = createMocks({
        query: { code: TEST_CODE, shop: TEST_SHOP, state, shop_name: 'FakeUntrustedName' },
      });

      await integrationController.handleShopifyCallback(req, res, () => {});

      assert.strictEqual(
        persistedShopName,
        TEST_REAL_SHOP_NAME,
        'Must persist verified store name from Shopify GraphQL query'
      );
      assert.notStrictEqual(persistedShopName, 'FakeUntrustedName', 'Must NOT trust browser query string');
    } finally {
      global.fetch = originalFetch;
      shopifyGraphService.getShop = originalGetShop;
      shopifyGraphService.registerPhase1Webhooks = originalRegisterWebhooks;
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 4: OAuth callback invokes webhook reconciliation/registration
  // -------------------------------------------------------------
  await runAsyncTest('4. OAuth callback invokes registerPhase1Webhooks with decrypted token and backend destination', async () => {
    let webhookRegistrationCalled = false;
    let registrationParams = null;

    global.fetch = async (url) => {
      if (url.includes('/admin/oauth/access_token')) {
        return { ok: true, json: async () => ({ access_token: TEST_TOKEN, scope: config.shopifyScopes }) };
      }
      return { ok: true, json: async () => ({}) };
    };

    shopifyGraphService.getShop = async () => ({
      id: TEST_GRAPH_SHOP_ID,
      name: TEST_REAL_SHOP_NAME,
    });

    shopifyGraphService.registerPhase1Webhooks = async (params) => {
      webhookRegistrationCalled = true;
      registrationParams = params;
      return [
        { topic: 'APP_UNINSTALLED', success: true },
        { topic: 'CUSTOMERS_CREATE', success: true },
        { topic: 'CUSTOMERS_UPDATE', success: true },
        { topic: 'PRODUCTS_CREATE', success: true },
        { topic: 'PRODUCTS_UPDATE', success: true },
        { topic: 'ORDERS_CREATE', success: true },
        { topic: 'ORDERS_UPDATED', success: true },
      ];
    };

    const originalQuery = pool.query;
    pool.query = async (text) => {
      if (text.includes('SELECT id, user_id, status FROM shopify_integrations WHERE shop_domain = $1')) {
        return { rows: [] };
      }
      return { rows: [{ id: 'shp_1' }] };
    };

    try {
      const state = getValidState();
      const { req, res } = createMocks({
        query: { code: TEST_CODE, shop: TEST_SHOP, state },
      });

      await integrationController.handleShopifyCallback(req, res, () => {});

      assert.ok(webhookRegistrationCalled, 'Must call registerPhase1Webhooks');
      assert.strictEqual(registrationParams.shopDomain, TEST_SHOP);
      assert.strictEqual(registrationParams.accessToken, TEST_TOKEN);
      assert.ok(
        registrationParams.webhookUrl.includes('/api/shopify/webhooks'),
        'Webhook URL must point to /api/shopify/webhooks'
      );
    } finally {
      global.fetch = originalFetch;
      shopifyGraphService.getShop = originalGetShop;
      shopifyGraphService.registerPhase1Webhooks = originalRegisterWebhooks;
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 5: Webhook registration is idempotent
  // -------------------------------------------------------------
  await runAsyncTest('5. Webhook registration is idempotent (reuses already active subscriptions)', async () => {
    let createCount = 0;
    const targetUrl = 'https://arco-backend-ecbl.onrender.com/api/shopify/webhooks';

    // Mock existing subscriptions already active for targetUrl
    shopifyGraphService.getWebhookSubscriptions = async () => [
      { id: 'sub_1', topic: 'APP_UNINSTALLED', callbackUrl: targetUrl },
      { id: 'sub_2', topic: 'CUSTOMERS_CREATE', callbackUrl: targetUrl },
      { id: 'sub_3', topic: 'CUSTOMERS_UPDATE', callbackUrl: targetUrl },
      { id: 'sub_4', topic: 'PRODUCTS_CREATE', callbackUrl: targetUrl },
      { id: 'sub_5', topic: 'PRODUCTS_UPDATE', callbackUrl: targetUrl },
      { id: 'sub_6', topic: 'ORDERS_CREATE', callbackUrl: targetUrl },
      { id: 'sub_7', topic: 'ORDERS_UPDATED', callbackUrl: targetUrl },
    ];

    shopifyGraphService.deleteWebhookSubscription = async () => ({ success: true });
    shopifyGraphService.registerWebhookSubscription = async () => {
      createCount++;
      return { success: true };
    };

    try {
      const results = await shopifyGraphService.registerPhase1Webhooks({
        shopDomain: TEST_SHOP,
        accessToken: TEST_TOKEN,
        webhookUrl: targetUrl,
      });

      assert.strictEqual(results.length, 7, 'Must evaluate all 7 Phase 1 topics');
      assert.strictEqual(createCount, 0, 'Must NOT create new subscriptions when all 7 already exist');
      assert.ok(results.every((r) => r.success && r.reconciled), 'All topics must be flagged as reconciled');
    } finally {
      shopifyGraphService.getWebhookSubscriptions = originalGetSubs;
      shopifyGraphService.deleteWebhookSubscription = originalDeleteSub;
      shopifyGraphService.registerWebhookSubscription = originalRegSub;
    }
  });

  // -------------------------------------------------------------
  // Test 6: Existing webhook subscriptions are not duplicated
  // -------------------------------------------------------------
  await runAsyncTest('6. Existing obsolete/duplicate webhook subscriptions are pruned during reconciliation', async () => {
    const targetUrl = 'https://arco-backend-ecbl.onrender.com/api/shopify/webhooks';
    const obsoleteUrl = 'https://arco-communication.vercel.app/api/shopify/webhooks';
    const deletedSubIds = [];
    let createdCount = 0;

    // Subscriptions contain obsolete Vercel URLs and duplicate ORDERS_CREATE
    shopifyGraphService.getWebhookSubscriptions = async () => [
      { id: 'sub_obsolete_1', topic: 'PRODUCTS_CREATE', callbackUrl: obsoleteUrl },
      { id: 'sub_valid_order_1', topic: 'ORDERS_CREATE', callbackUrl: targetUrl },
      { id: 'sub_duplicate_order_2', topic: 'ORDERS_CREATE', callbackUrl: targetUrl },
    ];

    shopifyGraphService.deleteWebhookSubscription = async ({ id }) => {
      deletedSubIds.push(id);
      return { success: true };
    };

    shopifyGraphService.registerWebhookSubscription = async () => {
      createdCount++;
      return { success: true, subscription: { id: 'sub_new' } };
    };

    try {
      const results = await shopifyGraphService.registerPhase1Webhooks({
        shopDomain: TEST_SHOP,
        accessToken: TEST_TOKEN,
        webhookUrl: targetUrl,
      });

      // Must delete obsolete Vercel subscription and duplicate ORDERS_CREATE subscription
      assert.ok(deletedSubIds.includes('sub_obsolete_1'), 'Must delete obsolete Vercel subscription');
      assert.ok(deletedSubIds.includes('sub_duplicate_order_2'), 'Must delete duplicate ORDERS_CREATE subscription');
      assert.ok(!deletedSubIds.includes('sub_valid_order_1'), 'Must keep first valid subscription');

      // PRODUCTS_CREATE was obsolete so it must be re-registered pointing to targetUrl
      const prodCreateResult = results.find((r) => r.topic === 'PRODUCTS_CREATE');
      assert.ok(prodCreateResult?.success, 'PRODUCTS_CREATE must be registered successfully');
    } finally {
      shopifyGraphService.getWebhookSubscriptions = originalGetSubs;
      shopifyGraphService.deleteWebhookSubscription = originalDeleteSub;
      shopifyGraphService.registerWebhookSubscription = originalRegSub;
    }
  });

  // -------------------------------------------------------------
  // Test 7: Shop metadata failure is handled safely
  // -------------------------------------------------------------
  await runAsyncTest('7. Shop metadata failure fails installation safely without exposing access token', async () => {
    global.fetch = async (url) => {
      if (url.includes('/admin/oauth/access_token')) {
        return { ok: true, json: async () => ({ access_token: TEST_TOKEN, scope: config.shopifyScopes }) };
      }
      return { ok: true, json: async () => ({}) };
    };

    // Simulate getShop GraphQL failure (e.g. 500 error or permission denied)
    shopifyGraphService.getShop = async () => {
      throw new Error('GraphQL network timeout');
    };

    const originalQuery = pool.query;
    let updatedStatus = null;

    pool.query = async (text, params) => {
      if (text.includes('SELECT id, user_id, status FROM shopify_integrations WHERE shop_domain = $1')) {
        return { rows: [] };
      }
      if (text.includes('SET status =')) {
        updatedStatus = params[0];
      }
      return { rows: [] };
    };

    try {
      const state = getValidState();
      const { req, res, getRedirectUrl } = createMocks({
        query: { code: TEST_CODE, shop: TEST_SHOP, state },
      });

      await integrationController.handleShopifyCallback(req, res, () => {});

      const redirect = getRedirectUrl();
      assert.ok(redirect, 'Must redirect on metadata failure');
      assert.ok(redirect.includes('error='), 'Redirect must contain error parameter');
      assert.ok(!redirect.includes(TEST_TOKEN), 'Access token MUST NEVER be exposed in redirect URL');
      assert.ok(!redirect.includes('shopify=connected'), 'Must NOT report connected status when metadata fails');
      assert.notStrictEqual(updatedStatus, 'connected', 'Database status must NOT be set to connected');
    } finally {
      global.fetch = originalFetch;
      shopifyGraphService.getShop = originalGetShop;
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 8: Webhook registration failure does not produce a false "fully connected" success
  // -------------------------------------------------------------
  await runAsyncTest('8. Webhook registration failure marks status as action_required (never falsely connected)', async () => {
    global.fetch = async (url) => {
      if (url.includes('/admin/oauth/access_token')) {
        return { ok: true, json: async () => ({ access_token: TEST_TOKEN, scope: config.shopifyScopes }) };
      }
      return { ok: true, json: async () => ({}) };
    };

    shopifyGraphService.getShop = async () => ({
      id: TEST_GRAPH_SHOP_ID,
      name: TEST_REAL_SHOP_NAME,
    });

    // Simulate webhook registration failure
    shopifyGraphService.registerPhase1Webhooks = async () => [
      { topic: 'APP_UNINSTALLED', success: true },
      { topic: 'ORDERS_CREATE', success: false, error: 'Shopify internal webhook error' },
    ];

    const originalQuery = pool.query;
    let finalStatus = null;
    let recordedLastError = null;

    pool.query = async (text, params) => {
      if (text.includes('SELECT id, user_id, status FROM shopify_integrations WHERE shop_domain = $1')) {
        return { rows: [] };
      }
      if (text.includes('INSERT INTO shopify_integrations')) {
        return { rows: [{ id: 'shp_1' }] };
      }
      if (text.includes('UPDATE shopify_integrations') && text.includes("SET status = 'action_required'")) {
        finalStatus = 'action_required';
        recordedLastError = params[0];
        return { rows: [] };
      }
      return { rows: [] };
    };

    try {
      const state = getValidState();
      const { req, res, getRedirectUrl } = createMocks({
        query: { code: TEST_CODE, shop: TEST_SHOP, state },
      });

      await integrationController.handleShopifyCallback(req, res, () => {});

      const redirect = getRedirectUrl();
      assert.ok(redirect.includes('shopify=action_required'), 'Redirect must indicate action_required');
      assert.ok(redirect.includes('error='), 'Redirect must cite webhook failure');
      assert.ok(!redirect.includes('shopify=connected'), 'Must NOT report connected when webhooks fail');
      assert.strictEqual(finalStatus, 'action_required', 'Database status must be action_required');
      assert.ok(
        recordedLastError.includes('Webhook registration requires reconciliation'),
        'last_error must record webhook reconciliation requirement'
      );
    } finally {
      global.fetch = originalFetch;
      shopifyGraphService.getShop = originalGetShop;
      shopifyGraphService.registerPhase1Webhooks = originalRegisterWebhooks;
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 9: Existing Phase 1 tenant ownership protection remains intact
  // -------------------------------------------------------------
  await runAsyncTest('9. Existing Phase 1 tenant ownership protection blocks User B during OAuth callback', async () => {
    const originalQuery = pool.query;

    // Existing store belongs to Tenant Alpha ('usr_alpha')
    pool.query = async (text, params) => {
      if (text.includes('SELECT id, user_id, status FROM shopify_integrations WHERE shop_domain = $1')) {
        return {
          rows: [
            { id: 'shp_existing_alpha', user_id: 'usr_alpha', status: 'connected' },
          ],
        };
      }
      return { rows: [] };
    };

    try {
      // User Beta ('usr_beta') attempts OAuth callback for User Alpha's store
      const stateForUserBeta = getValidState(TEST_SHOP, 'usr_beta');
      const { req, res, getRedirectUrl } = createMocks({
        query: { code: TEST_CODE, shop: TEST_SHOP, state: stateForUserBeta },
      });

      await integrationController.handleShopifyCallback(req, res, () => {});

      const redirect = getRedirectUrl();
      assert.ok(redirect, 'Must redirect on cross-tenant collision');
      assert.ok(redirect.includes('error='), 'Must include error query param');
      assert.ok(
        redirect.includes(encodeURIComponent('This Shopify store is already connected to another ARCO account.')),
        'Error must cite store already connected to another ARCO account'
      );
    } finally {
      pool.query = originalQuery;
    }
  });

  console.log('\n-------------------------------------------------------------');
  console.log(` RESULTS: ${passedTests}/${totalTests} Tests Passed`);
  console.log('-------------------------------------------------------------\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error in OAuth lifecycle tests:', err);
  process.exit(1);
});
