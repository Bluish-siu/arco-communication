/**
 * Phase 3: Shopify Webhook Lifecycle + Disconnect Cleanup Test Suite
 * 
 * Verifies:
 * 1. Connected store has ARCO webhook subscriptions
 * 2. Disconnect discovers ARCO webhooks
 * 3. Disconnect deletes ARCO webhooks
 * 4. Disconnect does not delete unrelated webhooks
 * 5. Credentials are cleared after successful disconnect
 * 6. Status becomes disconnected
 * 7. Original tenant retains ownership
 * 8. Another tenant cannot claim the disconnected store
 * 9. Original tenant can reconnect
 * 10. Reconnect does not duplicate webhooks (idempotency: 7 webhooks, not 14)
 * 11. APP_UNINSTALLED affects only the correct tenant
 * 12. Shopify API failure is handled safely
 * 13. Webhook deletion failure is surfaced safely
 */

const assert = require('assert');

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

function createMocks({ body = {}, query = {}, headers = {}, user = null } = {}) {
  let redirectUrl = null;
  let statusCode = 200;
  let jsonResponse = null;

  const req = {
    body,
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
  console.log(' RUNNING SHOPIFY WEBHOOK LIFECYCLE & DISCONNECT TESTS');
  console.log('=============================================================\n');

  const { pool } = await import('../config/db.js');
  const { config } = await import('../config/index.js');
  const { integrationController } = await import('../controllers/integrationController.js');
  const { shopifyWebhookController, handleAppUninstalled } = await import('../controllers/shopifyWebhookController.js');
  const { shopifyGraphService } = await import('../services/shopifyGraphService.js');
  const { encryptToken, generateSignedOAuthState } = await import('../utils/crypto.js');

  const TENANT_A = 'usr_tenant_alpha';
  const TENANT_B = 'usr_tenant_beta';
  const SHOP_A = 'store-alpha.myshopify.com';
  const SHOP_B = 'store-beta.myshopify.com';
  const SAMPLE_RAW_TOKEN = 'shpat_test_raw_token_11223344';
  const SAMPLE_ENC_TOKEN = encryptToken(SAMPLE_RAW_TOKEN);
  const TARGET_WEBHOOK_URL = 'https://arco-backend-ecbl.onrender.com/api/shopify/webhooks';

  // Backup original services
  const originalGetSubs = shopifyGraphService.getWebhookSubscriptions;
  const originalDeleteSub = shopifyGraphService.deleteWebhookSubscription;
  const originalRegisterPhase1 = shopifyGraphService.registerPhase1Webhooks;
  const originalFetch = global.fetch;
  const originalGetShop = shopifyGraphService.getShop;

  // -------------------------------------------------------------
  // Test 1: Connected store has ARCO webhook subscriptions
  // -------------------------------------------------------------
  await runAsyncTest('1. Connected store has ARCO webhook subscriptions registered', async () => {
    let queriedShop = null;

    shopifyGraphService.getWebhookSubscriptions = async ({ shopDomain }) => {
      queriedShop = shopDomain;
      return [];
    };

    const registeredTopics = [];
    shopifyGraphService.registerWebhookSubscription = async ({ topic, callbackUrl }) => {
      registeredTopics.push({ topic, callbackUrl });
      return { success: true, subscription: { id: `sub_${topic}` } };
    };

    try {
      const results = await shopifyGraphService.registerPhase1Webhooks({
        shopDomain: SHOP_A,
        accessToken: SAMPLE_RAW_TOKEN,
        webhookUrl: TARGET_WEBHOOK_URL,
      });

      assert.strictEqual(queriedShop, SHOP_A);
      assert.strictEqual(results.length, 7, 'Must register 7 Phase 1 webhook topics');
      assert.ok(results.every((r) => r.success), 'All 7 webhooks must report success');
      assert.ok(registeredTopics.every((r) => r.callbackUrl === TARGET_WEBHOOK_URL), 'All webhooks must target ARCO backend URL');
    } finally {
      shopifyGraphService.getWebhookSubscriptions = originalGetSubs;
      shopifyGraphService.registerWebhookSubscription = shopifyGraphService.registerWebhookSubscription;
    }
  });

  // -------------------------------------------------------------
  // Test 2: Disconnect discovers ARCO webhooks
  // -------------------------------------------------------------
  await runAsyncTest('2. Disconnect discovers ARCO-managed webhooks', async () => {
    let queriedShopDomain = null;

    shopifyGraphService.getWebhookSubscriptions = async ({ shopDomain }) => {
      queriedShopDomain = shopDomain;
      return [
        { id: 'gid://shopify/WebhookSubscription/101', topic: 'ORDERS_CREATE', callbackUrl: TARGET_WEBHOOK_URL },
        { id: 'gid://shopify/WebhookSubscription/102', topic: 'CUSTOMERS_CREATE', callbackUrl: TARGET_WEBHOOK_URL },
      ];
    };

    shopifyGraphService.deleteWebhookSubscription = async () => ({ success: true });

    const originalQuery = pool.query;
    pool.query = async (text) => {
      if (text.includes("SELECT id, user_id, shop_domain, shop_name, access_token, status FROM shopify_integrations WHERE user_id = $1")) {
        return {
          rows: [
            { id: 'shp_alpha_1', user_id: TENANT_A, shop_domain: SHOP_A, access_token: SAMPLE_ENC_TOKEN, status: 'connected' },
          ],
        };
      }
      return { rowCount: 1, rows: [] };
    };

    try {
      const { req, res } = createMocks({ user: { id: TENANT_A } });
      await integrationController.disconnectShopify(req, res, () => {});
      assert.strictEqual(queriedShopDomain, SHOP_A, 'Must query webhooks for Tenant A store');
    } finally {
      shopifyGraphService.getWebhookSubscriptions = originalGetSubs;
      shopifyGraphService.deleteWebhookSubscription = originalDeleteSub;
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 3: Disconnect deletes ARCO webhooks
  // -------------------------------------------------------------
  await runAsyncTest('3. Disconnect deletes discovered ARCO webhooks', async () => {
    const deletedIds = [];

    shopifyGraphService.getWebhookSubscriptions = async () => [
      { id: 'sub_del_101', topic: 'ORDERS_CREATE', callbackUrl: TARGET_WEBHOOK_URL },
      { id: 'sub_del_102', topic: 'CUSTOMERS_CREATE', callbackUrl: TARGET_WEBHOOK_URL },
    ];

    shopifyGraphService.deleteWebhookSubscription = async ({ id }) => {
      deletedIds.push(id);
      return { success: true };
    };

    const originalQuery = pool.query;
    pool.query = async (text) => {
      if (text.includes("SELECT id, user_id, shop_domain, shop_name, access_token, status FROM shopify_integrations WHERE user_id = $1")) {
        return {
          rows: [
            { id: 'shp_alpha_1', user_id: TENANT_A, shop_domain: SHOP_A, access_token: SAMPLE_ENC_TOKEN, status: 'connected' },
          ],
        };
      }
      return { rowCount: 1, rows: [] };
    };

    try {
      const { req, res, getJson } = createMocks({ user: { id: TENANT_A } });
      await integrationController.disconnectShopify(req, res, () => {});
      assert.strictEqual(deletedIds.length, 2, 'Must delete both ARCO webhooks');
      assert.ok(deletedIds.includes('sub_del_101'));
      assert.ok(deletedIds.includes('sub_del_102'));
      assert.strictEqual(getJson().data?.deletedWebhooks, 2);
    } finally {
      shopifyGraphService.getWebhookSubscriptions = originalGetSubs;
      shopifyGraphService.deleteWebhookSubscription = originalDeleteSub;
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 4: Disconnect does not delete unrelated webhooks
  // -------------------------------------------------------------
  await runAsyncTest('4. Disconnect does not delete unrelated merchant webhooks from other apps', async () => {
    const deletedIds = [];

    shopifyGraphService.getWebhookSubscriptions = async () => [
      { id: 'sub_arco_1', topic: 'ORDERS_CREATE', callbackUrl: TARGET_WEBHOOK_URL },
      { id: 'sub_klaviyo_2', topic: 'ORDERS_CREATE', callbackUrl: 'https://a.klaviyo.com/api/shopify/order' },
      { id: 'sub_zapier_3', topic: 'CUSTOMERS_CREATE', callbackUrl: 'https://hooks.zapier.com/hooks/catch/123/abc' },
      { id: 'sub_arco_4', topic: 'CUSTOMERS_CREATE', callbackUrl: 'https://arco-backend-ecbl.onrender.com/api/shopify/webhooks' },
    ];

    shopifyGraphService.deleteWebhookSubscription = async ({ id }) => {
      deletedIds.push(id);
      return { success: true };
    };

    const originalQuery = pool.query;
    pool.query = async (text) => {
      if (text.includes("SELECT id, user_id, shop_domain, shop_name, access_token, status FROM shopify_integrations WHERE user_id = $1")) {
        return {
          rows: [
            { id: 'shp_alpha_1', user_id: TENANT_A, shop_domain: SHOP_A, access_token: SAMPLE_ENC_TOKEN, status: 'connected' },
          ],
        };
      }
      return { rowCount: 1, rows: [] };
    };

    try {
      const { req, res } = createMocks({ user: { id: TENANT_A } });
      await integrationController.disconnectShopify(req, res, () => {});

      assert.strictEqual(deletedIds.length, 2, 'Must delete exactly the 2 ARCO webhooks');
      assert.ok(deletedIds.includes('sub_arco_1'));
      assert.ok(deletedIds.includes('sub_arco_4'));
      assert.ok(!deletedIds.includes('sub_klaviyo_2'), 'Must NEVER delete third-party Klaviyo webhook');
      assert.ok(!deletedIds.includes('sub_zapier_3'), 'Must NEVER delete third-party Zapier webhook');
    } finally {
      shopifyGraphService.getWebhookSubscriptions = originalGetSubs;
      shopifyGraphService.deleteWebhookSubscription = originalDeleteSub;
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 5: Credentials are cleared after successful disconnect
  // -------------------------------------------------------------
  await runAsyncTest('5. Credentials are cleared after successful disconnect', async () => {
    let updateQueryText = null;

    shopifyGraphService.getWebhookSubscriptions = async () => [];

    const originalQuery = pool.query;
    pool.query = async (text) => {
      if (text.includes("SELECT id, user_id, shop_domain, shop_name, access_token, status FROM shopify_integrations WHERE user_id = $1")) {
        return {
          rows: [
            { id: 'shp_alpha_1', user_id: TENANT_A, shop_domain: SHOP_A, access_token: SAMPLE_ENC_TOKEN, status: 'connected' },
          ],
        };
      }
      if (text.includes('UPDATE shopify_integrations')) {
        updateQueryText = text;
        return { rowCount: 1, rows: [] };
      }
      return { rows: [] };
    };

    try {
      const { req, res } = createMocks({ user: { id: TENANT_A } });
      await integrationController.disconnectShopify(req, res, () => {});

      assert.ok(updateQueryText.includes('access_token = NULL'), 'access_token must be set to NULL');
      assert.ok(updateQueryText.includes('refresh_token = NULL'), 'refresh_token must be set to NULL');
    } finally {
      shopifyGraphService.getWebhookSubscriptions = originalGetSubs;
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 6: Status becomes disconnected
  // -------------------------------------------------------------
  await runAsyncTest('6. Status becomes disconnected after disconnect', async () => {
    let updateQueryText = null;

    shopifyGraphService.getWebhookSubscriptions = async () => [];

    const originalQuery = pool.query;
    pool.query = async (text) => {
      if (text.includes("SELECT id, user_id, shop_domain, shop_name, access_token, status FROM shopify_integrations WHERE user_id = $1")) {
        return {
          rows: [
            { id: 'shp_alpha_1', user_id: TENANT_A, shop_domain: SHOP_A, access_token: SAMPLE_ENC_TOKEN, status: 'connected' },
          ],
        };
      }
      if (text.includes('UPDATE shopify_integrations')) {
        updateQueryText = text;
        return { rowCount: 1, rows: [] };
      }
      return { rows: [] };
    };

    try {
      const { req, res, getJson } = createMocks({ user: { id: TENANT_A } });
      await integrationController.disconnectShopify(req, res, () => {});

      assert.ok(updateQueryText.includes("status = 'disconnected'"), "SQL must set status = 'disconnected'");
      assert.strictEqual(getJson().data?.status, 'disconnected', 'Response must return status = disconnected');
    } finally {
      shopifyGraphService.getWebhookSubscriptions = originalGetSubs;
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 7: Original tenant retains ownership
  // -------------------------------------------------------------
  await runAsyncTest('7. Original tenant retains ownership after disconnect (metadata preserved)', async () => {
    let updateQueryText = null;
    let updateParams = null;

    shopifyGraphService.getWebhookSubscriptions = async () => [];

    const originalQuery = pool.query;
    pool.query = async (text, params) => {
      if (text.includes("SELECT id, user_id, shop_domain, shop_name, access_token, status FROM shopify_integrations WHERE user_id = $1")) {
        return {
          rows: [
            {
              id: 'shp_alpha_1',
              user_id: TENANT_A,
              shop_domain: SHOP_A,
              shop_name: 'Store Alpha',
              shopify_shop_id: 'gid://shopify/Shop/1001',
              access_token: SAMPLE_ENC_TOKEN,
              status: 'connected',
            },
          ],
        };
      }
      if (text.includes('UPDATE shopify_integrations')) {
        updateQueryText = text;
        updateParams = params;
        return { rowCount: 1, rows: [] };
      }
      return { rows: [] };
    };

    try {
      const { req, res } = createMocks({ user: { id: TENANT_A } });
      await integrationController.disconnectShopify(req, res, () => {});

      assert.ok(!updateQueryText.includes('DELETE FROM shopify_integrations'), 'Must NOT delete the record');
      assert.ok(!updateQueryText.includes('user_id = NULL'), 'Must NOT clear user_id');
      assert.ok(!updateQueryText.includes('shop_domain = NULL'), 'Must NOT clear shop_domain');
      assert.strictEqual(updateParams[0], TENANT_A, 'Update must be scoped to Tenant A user_id');
    } finally {
      shopifyGraphService.getWebhookSubscriptions = originalGetSubs;
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 8: Another tenant cannot claim the disconnected store
  // -------------------------------------------------------------
  await runAsyncTest('8. Another tenant cannot claim the disconnected store (anti-takeover blocks with 409)', async () => {
    const originalQuery = pool.query;

    pool.query = async (text) => {
      if (text.includes('SELECT id, user_id, status FROM shopify_integrations WHERE shop_domain = $1')) {
        return {
          rows: [
            { id: 'shp_alpha_1', user_id: TENANT_A, status: 'disconnected' },
          ],
        };
      }
      return { rows: [] };
    };

    try {
      // Tenant B tries to connect Tenant A's disconnected store via connectShopify
      const { req: reqConn, res: resConn, getStatus: getStatusConn, getJson: getJsonConn } = createMocks({
        body: { shop: SHOP_A, accessToken: 'shpat_attacker_token_xyz' },
        user: { id: TENANT_B },
      });

      await integrationController.connectShopify(reqConn, resConn, () => {});
      assert.strictEqual(getStatusConn(), 409, 'Must return 409 Conflict when Tenant B tries to connect Tenant A disconnected store');
      assert.ok(getJsonConn().error.includes('already connected to another ARCO account'));

      // Tenant B tries to get OAuth URL for Tenant A's disconnected store
      const { req: reqOAuth, res: resOAuth, getStatus: getStatusOAuth, getJson: getJsonOAuth } = createMocks({
        query: { shop: SHOP_A },
        user: { id: TENANT_B },
      });

      await integrationController.getShopifyOAuthUrl(reqOAuth, resOAuth, () => {});
      assert.strictEqual(getStatusOAuth(), 409, 'Must return 409 Conflict when Tenant B tries to initiate OAuth on Tenant A disconnected store');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 9: Original tenant can reconnect
  // -------------------------------------------------------------
  await runAsyncTest('9. Original tenant can reconnect to their disconnected store', async () => {
    global.fetch = async (url) => {
      if (url.includes('/admin/oauth/access_token')) {
        return { ok: true, json: async () => ({ access_token: 'shpat_reconnect_token', scope: config.shopifyScopes }) };
      }
      return { ok: true, json: async () => ({}) };
    };

    shopifyGraphService.getShop = async () => ({
      id: 'gid://shopify/Shop/1001',
      name: 'Store Alpha',
    });

    shopifyGraphService.registerPhase1Webhooks = async () => [
      { topic: 'APP_UNINSTALLED', success: true },
    ];

    const originalQuery = pool.query;
    let finalStatus = null;

    pool.query = async (text) => {
      if (text.includes('SELECT id, user_id, status FROM shopify_integrations WHERE shop_domain = $1')) {
        return {
          rows: [
            { id: 'shp_alpha_1', user_id: TENANT_A, status: 'disconnected' },
          ],
        };
      }
      if (text.includes('INSERT INTO shopify_integrations')) {
        return { rows: [{ id: 'shp_alpha_1' }] };
      }
      if (text.includes('UPDATE shopify_integrations') && text.includes("SET status = 'connected'")) {
        finalStatus = 'connected';
        return { rows: [] };
      }
      return { rows: [] };
    };

    try {
      const state = generateSignedOAuthState({ userId: TENANT_A, shop: SHOP_A });
      const { req, res, getRedirectUrl } = createMocks({
        query: { code: 'reconnect_code_123', shop: SHOP_A, state },
      });

      await integrationController.handleShopifyCallback(req, res, () => {});

      assert.strictEqual(finalStatus, 'connected', 'Status must transition to connected on reconnect');
      assert.ok(getRedirectUrl()?.includes('shopify=connected'), 'Must redirect with shopify=connected');
    } finally {
      global.fetch = originalFetch;
      shopifyGraphService.getShop = originalGetShop;
      shopifyGraphService.registerPhase1Webhooks = originalRegisterPhase1;
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 10: Reconnect does not duplicate webhooks
  // -------------------------------------------------------------
  await runAsyncTest('10. Reconnect does not duplicate webhooks (reconciles existing subscriptions)', async () => {
    let registeredSubCount = 0;
    let deletedSubCount = 0;

    // Simulate 3 subscriptions already exist on Shopify for target URL
    shopifyGraphService.getWebhookSubscriptions = async () => [
      { id: 'sub_exist_1', topic: 'APP_UNINSTALLED', callbackUrl: TARGET_WEBHOOK_URL },
      { id: 'sub_exist_2', topic: 'CUSTOMERS_CREATE', callbackUrl: TARGET_WEBHOOK_URL },
      { id: 'sub_exist_3', topic: 'ORDERS_CREATE', callbackUrl: TARGET_WEBHOOK_URL },
    ];

    shopifyGraphService.deleteWebhookSubscription = async () => {
      deletedSubCount++;
      return { success: true };
    };

    shopifyGraphService.registerWebhookSubscription = async () => {
      registeredSubCount++;
      return { success: true, subscription: { id: `sub_new_${registeredSubCount}` } };
    };

    try {
      const results = await shopifyGraphService.registerPhase1Webhooks({
        shopDomain: SHOP_A,
        accessToken: SAMPLE_RAW_TOKEN,
        webhookUrl: TARGET_WEBHOOK_URL,
      });

      // 3 existed, so exactly 4 missing webhooks must be registered (total 7, never 14)
      assert.strictEqual(results.length, 7, 'Must report all 7 topics');
      assert.strictEqual(registeredSubCount, 4, 'Exactly 4 missing webhooks must be registered');
      assert.strictEqual(deletedSubCount, 0, 'Valid existing subscriptions must not be deleted');
    } finally {
      shopifyGraphService.getWebhookSubscriptions = originalGetSubs;
      shopifyGraphService.deleteWebhookSubscription = originalDeleteSub;
      shopifyGraphService.registerWebhookSubscription = shopifyGraphService.registerWebhookSubscription;
    }
  });

  // -------------------------------------------------------------
  // Test 11: APP_UNINSTALLED affects only the correct tenant
  // -------------------------------------------------------------
  await runAsyncTest('11. APP_UNINSTALLED webhook marks status uninstalled only for the target store domain', async () => {
    let uninstalledShopParam = null;

    const originalQuery = pool.query;
    pool.query = async (text, params) => {
      if (text.includes('UPDATE shopify_integrations') && text.includes("SET status = 'uninstalled'")) {
        uninstalledShopParam = params[0];
        return { rowCount: 1, rows: [] };
      }
      return { rows: [] };
    };

    try {
      // Simulate app/uninstalled webhook for Store Alpha
      await handleAppUninstalled(SHOP_A);

      assert.strictEqual(uninstalledShopParam, SHOP_A, 'Must update store matching SHOP_A');
      assert.notStrictEqual(uninstalledShopParam, SHOP_B, 'Must NOT touch SHOP_B');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 12: Shopify API failure is handled safely
  // -------------------------------------------------------------
  await runAsyncTest('12. Shopify API failure during disconnect is handled safely without crashing', async () => {
    // Simulate Shopify GraphQL network failure during webhook discovery
    shopifyGraphService.getWebhookSubscriptions = async () => {
      throw new Error('Shopify 503 Service Unavailable');
    };

    const originalQuery = pool.query;
    let recordedLastError = null;

    pool.query = async (text, params) => {
      if (text.includes("SELECT id, user_id, shop_domain, shop_name, access_token, status FROM shopify_integrations WHERE user_id = $1")) {
        return {
          rows: [
            {
              id: 'shp_alpha_1',
              user_id: TENANT_A,
              shop_domain: SHOP_A,
              access_token: SAMPLE_ENC_TOKEN,
              status: 'connected',
            },
          ],
        };
      }
      if (text.includes('UPDATE shopify_integrations')) {
        recordedLastError = params[1]; // last_error parameter
        return { rowCount: 1, rows: [] };
      }
      return { rows: [] };
    };

    try {
      const { req, res, getStatus, getJson } = createMocks({
        user: { id: TENANT_A },
      });

      await integrationController.disconnectShopify(req, res, () => {});

      assert.strictEqual(getStatus(), 200, 'Must return 200 without throwing unhandled error');
      assert.strictEqual(getJson().data?.status, 'disconnected', 'Status must still become disconnected');
      assert.ok(
        recordedLastError?.includes('Webhook cleanup incomplete: Shopify 503 Service Unavailable'),
        'last_error must record the API failure reason for retry visibility'
      );
      assert.ok(getJson().data?.cleanupError?.includes('Shopify 503 Service Unavailable'));
    } finally {
      shopifyGraphService.getWebhookSubscriptions = originalGetSubs;
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 13: Webhook deletion failure is surfaced safely
  // -------------------------------------------------------------
  await runAsyncTest('13. Individual webhook deletion failure is surfaced safely in last_error and response', async () => {
    shopifyGraphService.getWebhookSubscriptions = async () => [
      { id: 'sub_arco_fail', topic: 'ORDERS_CREATE', callbackUrl: TARGET_WEBHOOK_URL },
    ];

    // Simulate individual webhook deletion error returned by Shopify
    shopifyGraphService.deleteWebhookSubscription = async () => ({
      success: false,
      errors: 'Webhook subscription does not exist or was already deleted',
    });

    const originalQuery = pool.query;
    let recordedLastError = null;

    pool.query = async (text, params) => {
      if (text.includes("SELECT id, user_id, shop_domain, shop_name, access_token, status FROM shopify_integrations WHERE user_id = $1")) {
        return {
          rows: [
            {
              id: 'shp_alpha_1',
              user_id: TENANT_A,
              shop_domain: SHOP_A,
              access_token: SAMPLE_ENC_TOKEN,
              status: 'connected',
            },
          ],
        };
      }
      if (text.includes('UPDATE shopify_integrations')) {
        recordedLastError = params[1];
        return { rowCount: 1, rows: [] };
      }
      return { rows: [] };
    };

    try {
      const { req, res, getStatus, getJson } = createMocks({
        user: { id: TENANT_A },
      });

      await integrationController.disconnectShopify(req, res, () => {});

      assert.strictEqual(getStatus(), 200);
      assert.strictEqual(getJson().data?.status, 'disconnected');
      assert.ok(
        recordedLastError?.includes('Webhook cleanup incomplete: Webhook subscription does not exist or was already deleted'),
        'last_error must capture individual webhook deletion warning'
      );
      assert.strictEqual(getJson().data?.deletedWebhooks, 0);
    } finally {
      shopifyGraphService.getWebhookSubscriptions = originalGetSubs;
      shopifyGraphService.deleteWebhookSubscription = originalDeleteSub;
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
  console.error('Fatal error in webhook lifecycle tests:', err);
  process.exit(1);
});
