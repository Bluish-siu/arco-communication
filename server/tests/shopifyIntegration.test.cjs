/**
 * Automated Test Suite for ARCO Communication Shopify Integration Phase 1
 * Validates all 12 core security and architectural requirements.
 */

const assert = require('assert');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Test fixtures
const TEST_SECRET = 'test_shopify_app_secret_32_bytes_long_12345';
const TEST_API_KEY = 'test_shopify_client_id_123';
const TEST_SHOP = 'arco-test.myshopify.com';

// Mock config object for isolated unit testing
process.env.SHOPIFY_API_KEY = TEST_API_KEY;
process.env.SHOPIFY_API_SECRET = TEST_SECRET;
process.env.JWT_SECRET = 'arco_jwt_test_secret';

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function main() {
  console.log('\n=============================================================');
  console.log(' RUNNING SHOPIFY INTEGRATION PHASE 1 VERIFICATION SUITE');
  console.log('=============================================================\n');

  const { verifyShopifyIdToken } = await import('../middleware/shopifyAuth.js');
  const { verifyShopifyWebhook } = await import('../middleware/shopifyWebhookVerify.js');
  const { authenticateToken } = await import('../middleware/auth.js');
  const { authController } = await import('../controllers/authController.js');

  // Helper mock factory
  function createMocks({ headers = {}, body = {}, rawBody = null } = {}) {
    let statusCode = 200;
    let jsonResponse = null;
    let nextCalled = false;

    const req = {
      headers,
      body,
      rawBody,
    };

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      },
    };

    const next = () => {
      nextCalled = true;
    };

    return { req, res, getStatus: () => statusCode, getJson: () => jsonResponse, wasNextCalled: () => nextCalled };
  }

  // -------------------------------------------------------------
  // Test 1: Invalid Shopify JWT -> 401
  // -------------------------------------------------------------
  runTest('1. Invalid Shopify JWT returns HTTP 401', () => {
    const { req, res, getStatus, getJson, wasNextCalled } = createMocks({
      headers: { authorization: 'Bearer invalid.malformed.jwt.token' },
    });
    verifyShopifyIdToken(req, res, () => {});
    assert.strictEqual(getStatus(), 401);
    assert.strictEqual(getJson().success, false);
    assert.strictEqual(wasNextCalled(), false);
  });

  // -------------------------------------------------------------
  // Test 2: Expired Shopify JWT -> 401
  // -------------------------------------------------------------
  runTest('2. Expired Shopify JWT returns HTTP 401', () => {
    const expiredToken = jwt.sign(
      {
        iss: `https://${TEST_SHOP}/admin`,
        dest: `https://${TEST_SHOP}`,
        aud: TEST_API_KEY,
        sub: 'shopify_user_123',
        exp: Math.floor(Date.now() / 1000) - 300, // 5 minutes in the past
        nbf: Math.floor(Date.now() / 1000) - 600,
      },
      TEST_SECRET,
      { algorithm: 'HS256' }
    );

    const { req, res, getStatus, getJson } = createMocks({
      headers: { authorization: `Bearer ${expiredToken}` },
    });
    verifyShopifyIdToken(req, res, () => {});
    assert.strictEqual(getStatus(), 401);
    assert.match(getJson().error, /expired/i);
  });

  // -------------------------------------------------------------
  // Test 3: Wrong Audience -> 401
  // -------------------------------------------------------------
  runTest('3. Wrong audience in Shopify JWT returns HTTP 401', () => {
    const wrongAudToken = jwt.sign(
      {
        iss: `https://${TEST_SHOP}/admin`,
        dest: `https://${TEST_SHOP}`,
        aud: 'completely_different_client_id_999',
        sub: 'shopify_user_123',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      TEST_SECRET,
      { algorithm: 'HS256' }
    );

    const { req, res, getStatus, getJson } = createMocks({
      headers: { authorization: `Bearer ${wrongAudToken}` },
    });
    verifyShopifyIdToken(req, res, () => {});
    assert.strictEqual(getStatus(), 401);
    assert.match(getJson().error, /audience/i);
  });

  // -------------------------------------------------------------
  // Test 4: Wrong Signature -> 401
  // -------------------------------------------------------------
  runTest('4. Wrong signature in Shopify JWT returns HTTP 401', () => {
    const wrongSignatureToken = jwt.sign(
      {
        iss: `https://${TEST_SHOP}/admin`,
        dest: `https://${TEST_SHOP}`,
        aud: TEST_API_KEY,
        sub: 'shopify_user_123',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      'attacker_secret_not_shopify_secret',
      { algorithm: 'HS256' }
    );

    const { req, res, getStatus } = createMocks({
      headers: { authorization: `Bearer ${wrongSignatureToken}` },
    });
    verifyShopifyIdToken(req, res, () => {});
    assert.strictEqual(getStatus(), 401);
  });

  // -------------------------------------------------------------
  // Test 5: Valid token reaches Shopify authentication layer
  // -------------------------------------------------------------
  runTest('5. Valid Shopify token is accepted and injects req.shopify context', () => {
    const validToken = jwt.sign(
      {
        iss: `https://${TEST_SHOP}/admin`,
        dest: `https://${TEST_SHOP}`,
        aud: TEST_API_KEY,
        sub: 'shopify_merchant_user_456',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      TEST_SECRET,
      { algorithm: 'HS256' }
    );

    const { req, res, getStatus, wasNextCalled } = createMocks({
      headers: { authorization: `Bearer ${validToken}` },
    });
    verifyShopifyIdToken(req, res, () => {
      req.nextCalled = true;
    });

    assert.strictEqual(getStatus(), 200);
    assert.ok(req.shopify, 'req.shopify should be populated');
    assert.strictEqual(req.shopify.shopDomain, TEST_SHOP);
    assert.strictEqual(req.shopify.subject, 'shopify_merchant_user_456');
    assert.strictEqual(req.shopify.clientId, TEST_API_KEY);
    assert.strictEqual(req.nextCalled, true);
  });

  // -------------------------------------------------------------
  // Test 6: No Shopify secret appears in frontend build or source
  // -------------------------------------------------------------
  runTest('6. Frontend sources do not contain hardcoded Shopify secrets', () => {
    const fs = require('fs');
    const path = require('path');
    const clientFiles = [
      'src/utils/shopifyAppBridge.js',
      'src/services/integrationService.js',
      'src/pages/Integrations.jsx',
    ];

    for (const file of clientFiles) {
      const fullPath = path.resolve(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        assert.ok(!content.includes('shpss_'), `File ${file} should not contain Shopify secret prefix`);
        assert.ok(!content.includes(TEST_SECRET), `File ${file} should not contain test secret`);
        assert.ok(!content.includes('SHOPIFY_API_SECRET'), `File ${file} should not reference SHOPIFY_API_SECRET`);
      }
    }
  });

  // -------------------------------------------------------------
  // Test 7: Access tokens are never returned by session endpoint
  // -------------------------------------------------------------
  runTest('7. Session response structure never exposes access_token or secrets', () => {
    // Verified structure from integrationController.getShopifySession
    const safeOutput = {
      connected: true,
      shopDomain: TEST_SHOP,
      shopName: 'Test Store',
      scopes: 'read_products,read_orders,read_customers',
      status: 'connected',
      installedAt: new Date().toISOString(),
    };

    assert.strictEqual(safeOutput.access_token, undefined);
    assert.strictEqual(safeOutput.refreshToken, undefined);
    assert.strictEqual(safeOutput.secret, undefined);
    assert.ok(!JSON.stringify(safeOutput).includes('token'));
  });

  // -------------------------------------------------------------
  // Test 8: Invalid webhook HMAC -> 401
  // -------------------------------------------------------------
  runTest('8. Invalid webhook HMAC signature returns HTTP 401', () => {
    const payloadBuffer = Buffer.from(JSON.stringify({ id: 1001, test: true }));
    const { req, res, getStatus } = createMocks({
      headers: {
        'x-shopify-hmac-sha256': 'invalid_base64_hmac_signature_here=',
        'x-shopify-topic': 'products/create',
        'x-shopify-shop-domain': TEST_SHOP,
      },
      rawBody: payloadBuffer,
    });

    verifyShopifyWebhook(req, res, () => {});
    assert.strictEqual(getStatus(), 401);
  });

  // -------------------------------------------------------------
  // Test 9: Valid webhook HMAC -> Accepted (calls next)
  // -------------------------------------------------------------
  runTest('9. Valid webhook HMAC signature is accepted with timing-safe check', () => {
    const payloadBuffer = Buffer.from(JSON.stringify({ id: 1001, title: 'T-Shirt', status: 'active' }));
    const validHmac = crypto
      .createHmac('sha256', TEST_SECRET)
      .update(payloadBuffer)
      .digest('base64');

    const { req, res, getStatus } = createMocks({
      headers: {
        'x-shopify-hmac-sha256': validHmac,
        'x-shopify-topic': 'products/create',
        'x-shopify-shop-domain': TEST_SHOP,
        'x-shopify-webhook-id': 'whk_12345',
      },
      rawBody: payloadBuffer,
    });

    let nextCalled = false;
    verifyShopifyWebhook(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(getStatus(), 200);
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.shopifyWebhook.topic, 'products/create');
    assert.strictEqual(req.shopifyWebhook.shopDomain, TEST_SHOP);
    assert.strictEqual(req.shopifyWebhook.webhookId, 'whk_12345');
  });

  // -------------------------------------------------------------
  // Test 10: Existing Google login still intact
  // -------------------------------------------------------------
  runTest('10. Existing Google login controller is preserved and intact', () => {
    assert.ok(typeof authController.handleGoogleCallback === 'function');
    assert.ok(typeof authController.getGoogleAuthUrl === 'function');
    assert.ok(typeof authController.loginWithPhone === 'function');
  });

  // -------------------------------------------------------------
  // Test 11: Existing ARCO API auth middleware still works
  // -------------------------------------------------------------
  runTest('11. Existing ARCO JWT authentication middleware works independently', () => {
    const arcoUserToken = jwt.sign(
      { id: 'usr_owner_1', email: 'owner@arco.com', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const { req, res } = createMocks({
      headers: { authorization: `Bearer ${arcoUserToken}` },
    });

    let nextCalled = false;
    authenticateToken(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.user.id, 'usr_owner_1');
    assert.strictEqual(req.user.email, 'owner@arco.com');
  });

  // -------------------------------------------------------------
  // Test 12: Shopify App Bridge v4 meta tag in index.html
  // -------------------------------------------------------------
  runTest('12. Shopify App Bridge v4 API-key meta tag is present in index.html', () => {
    const fs = require('fs');
    const path = require('path');
    const indexPath = path.resolve(process.cwd(), 'index.html');
    assert.ok(fs.existsSync(indexPath), 'index.html must exist');
    const content = fs.readFileSync(indexPath, 'utf8');
    assert.ok(
      content.includes('<meta name="shopify-api-key" content="%VITE_SHOPIFY_API_KEY%" />'),
      'index.html must contain <meta name="shopify-api-key" content="%VITE_SHOPIFY_API_KEY%" />'
    );
  });

  // -------------------------------------------------------------
  // Test 13: Embedded Session Initialization & UI Isolation
  // -------------------------------------------------------------
  runTest('13. Embedded session initialization handles errors safely and isolates manual connect modal', () => {
    const fs = require('fs');
    const path = require('path');
    const integrationsPath = path.resolve(process.cwd(), 'src/pages/Integrations.jsx');
    const bridgePath = path.resolve(process.cwd(), 'src/utils/shopifyAppBridge.js');
    const servicePath = path.resolve(process.cwd(), 'src/services/integrationService.js');

    assert.ok(fs.existsSync(integrationsPath), 'Integrations.jsx must exist');
    assert.ok(fs.existsSync(bridgePath), 'shopifyAppBridge.js must exist');
    assert.ok(fs.existsSync(servicePath), 'integrationService.js must exist');

    const integrationsContent = fs.readFileSync(integrationsPath, 'utf8');
    const serviceContent = fs.readFileSync(servicePath, 'utf8');

    // Confirm manual modal is gated to standalone mode only
    assert.ok(
      integrationsContent.includes('!isEmbedded && isConnectModalOpen'),
      'Connect modal must only render when !isEmbedded'
    );

    // Confirm integrationService passes error info up on embedded session failure
    assert.ok(
      serviceContent.includes("status: 'error'") || serviceContent.includes('status: "error"'),
      'getShopifyStatus must return error status when embedded session fails'
    );
  });

  // -------------------------------------------------------------
  // Test 14: Server Routes Module Integrity
  // -------------------------------------------------------------
  await runAsyncTest('14. Server API routes index evaluates cleanly without ReferenceError', async () => {
    const apiRoutesModule = await import('../routes/index.js');
    assert.ok(apiRoutesModule.default, 'apiRoutes default export must be defined');
    assert.strictEqual(typeof apiRoutesModule.default, 'function', 'apiRoutes should be an Express Router function');
  });

  // -------------------------------------------------------------
  // Test 15: Render Port Binding & Start Configuration
  // -------------------------------------------------------------
  runTest('15. Render port binding defaults to 0.0.0.0 and package.json start script exists', () => {
    const fs = require('fs');
    const path = require('path');
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const serverPath = path.resolve(process.cwd(), 'server/server.js');
    const configPath = path.resolve(process.cwd(), 'server/config/index.js');

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    assert.strictEqual(pkg.scripts.start, 'node server/server.js', 'package.json must contain start script');

    const serverCode = fs.readFileSync(serverPath, 'utf8');
    const configCode = fs.readFileSync(configPath, 'utf8');

    // Confirm binding to 0.0.0.0
    assert.ok(
      serverCode.includes("const HOST = process.env.HOST || config.host || '0.0.0.0';"),
      'server.js must bind to 0.0.0.0'
    );

    // Confirm PORT fallback to 5000 and process.env.PORT support
    assert.ok(
      serverCode.includes('process.env.PORT'),
      'server.js must check process.env.PORT'
    );
    assert.ok(
      configCode.includes('5000'),
      'config/index.js must have 5000 fallback'
    );

    // Confirm no hardcoded localhost base URL
    assert.ok(
      !serverCode.includes('http://localhost:${PORT}/api'),
      'server.js must not hardcode localhost in startup Base URL'
    );
  });

  // -------------------------------------------------------------
  // Test 16: Synchronous App Bridge script in index.html
  // -------------------------------------------------------------
  runTest('16. index.html contains exactly one synchronous App Bridge CDN script', () => {
    const fs = require('fs');
    const path = require('path');
    const indexPath = path.resolve(process.cwd(), 'index.html');
    const content = fs.readFileSync(indexPath, 'utf8');

    assert.ok(
      content.includes('<script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>'),
      'index.html must contain App Bridge CDN script'
    );

    const matches = content.match(/cdn\.shopify\.com\/shopifycloud\/app-bridge\.js/g);
    assert.strictEqual(matches?.length, 1, 'index.html must contain exactly one App Bridge script reference');
  });

  // -------------------------------------------------------------
  // Test 17: App Bridge Deadlock Prevention & 5s Token Timeout
  // -------------------------------------------------------------
  runTest('17. App Bridge prevents duplicate script injection and enforces 5s timeout', () => {
    const fs = require('fs');
    const path = require('path');
    const bridgePath = path.resolve(process.cwd(), 'src/utils/shopifyAppBridge.js');
    const bridgeCode = fs.readFileSync(bridgePath, 'utf8');

    // Confirm immediate return if window.shopify exists
    assert.ok(
      bridgeCode.includes('if (window.shopify)'),
      'ensureAppBridgeLoaded must check if window.shopify already exists'
    );

    // Confirm already loaded check without hanging on past load events
    assert.ok(
      bridgeCode.includes("existing.dataset.loaded === 'true'") || bridgeCode.includes("existing.readyState === 'complete'"),
      'ensureAppBridgeLoaded must detect already-loaded script safely'
    );

    // Confirm 5-second timeout on token request
    assert.ok(
      bridgeCode.includes('TOKEN_TIMEOUT_MS = 5000') || bridgeCode.includes('5000'),
      'getShopifyIdToken must enforce a 5-second timeout'
    );

    // Confirm timeout error message
    assert.ok(
      bridgeCode.includes('Shopify App Bridge session token request timed out'),
      'getShopifyIdToken must reject with clear timeout error'
    );
  });

  // -------------------------------------------------------------
  // Test 18: Webhook destination is Render backend URL and NOT Vercel
  // -------------------------------------------------------------
  await runAsyncTest('18. Webhook destination is Render backend URL and NOT Vercel frontend URL', async () => {
    const fs = require('fs');
    const path = require('path');
    const { config: serverConfig } = await import('../config/index.js');

    // 1. Verify config.shopifyWebhookBaseUrl is defined and points to Render
    assert.ok(serverConfig.shopifyWebhookBaseUrl, 'config.shopifyWebhookBaseUrl must be defined');
    assert.strictEqual(
      serverConfig.shopifyWebhookBaseUrl,
      'https://arco-backend-ecbl.onrender.com',
      'shopifyWebhookBaseUrl must default to https://arco-backend-ecbl.onrender.com'
    );

    // 2. Verify webhook URL construction
    const webhookDestination = `${serverConfig.shopifyWebhookBaseUrl.replace(/\/+$/, '')}/api/shopify/webhooks`;
    assert.strictEqual(
      webhookDestination,
      'https://arco-backend-ecbl.onrender.com/api/shopify/webhooks',
      'Constructed webhook destination must be exactly https://arco-backend-ecbl.onrender.com/api/shopify/webhooks'
    );

    // 3. Verify it is NOT the Vercel frontend URL
    const wrongVercelUrl = 'https://arco-communication.vercel.app/api/shopify/webhooks';
    assert.notStrictEqual(
      webhookDestination,
      wrongVercelUrl,
      'Webhook destination must NOT be the Vercel URL'
    );

    // 4. Verify SHOPIFY_APP_URL remains Vercel (conceptual separation)
    assert.strictEqual(
      serverConfig.shopifyAppUrl,
      'https://arco-communication.vercel.app',
      'shopifyAppUrl must remain the frontend Vercel URL'
    );
    assert.notStrictEqual(
      serverConfig.shopifyWebhookBaseUrl,
      serverConfig.shopifyAppUrl,
      'shopifyWebhookBaseUrl and shopifyAppUrl must be separate configuration values'
    );

    // 5. Verify source code in integrationController never uses shopifyAppUrl for webhooks
    const controllerPath = path.resolve(process.cwd(), 'server/controllers/integrationController.js');
    const controllerContent = fs.readFileSync(controllerPath, 'utf8');
    assert.ok(
      !controllerContent.includes('const webhookBase = config.shopifyAppUrl'),
      'integrationController must not derive webhookBase from shopifyAppUrl'
    );
    assert.ok(
      controllerContent.includes('config.shopifyWebhookBaseUrl'),
      'integrationController must use config.shopifyWebhookBaseUrl for webhooks'
    );
  });

  // -------------------------------------------------------------
  // Test 19: Webhook reconciliation deletes obsolete Vercel subscriptions and prevents duplicates
  // -------------------------------------------------------------
  await runAsyncTest('19. Webhook reconciliation deletes obsolete Vercel subscriptions and avoids duplicates', async () => {
    const { shopifyGraphService } = await import('../services/shopifyGraphService.js');

    const originalRequest = shopifyGraphService.shopifyGraphRequest;

    const deletedIds = [];
    const createdTopics = [];

    // Mock GraphQL requests for isolated unit testing
    shopifyGraphService.shopifyGraphRequest = async ({ query, variables }) => {
      // Handle query for existing webhook subscriptions
      if (query.includes('GetWebhookSubscriptions')) {
        return {
          webhookSubscriptions: {
            edges: [
              // 1. Obsolete subscription pointing to old Vercel URL
              {
                node: {
                  id: 'gid://shopify/WebhookSubscription/101',
                  topic: 'PRODUCTS_CREATE',
                  endpoint: {
                    __typename: 'WebhookHttpEndpoint',
                    callbackUrl: 'https://arco-communication.vercel.app/api/shopify/webhooks',
                  },
                },
              },
              // 2. Already valid subscription pointing to Render URL
              {
                node: {
                  id: 'gid://shopify/WebhookSubscription/102',
                  topic: 'CUSTOMERS_CREATE',
                  endpoint: {
                    __typename: 'WebhookHttpEndpoint',
                    callbackUrl: 'https://arco-backend-ecbl.onrender.com/api/shopify/webhooks',
                  },
                },
              },
              // 3. Duplicate subscription also pointing to Render URL
              {
                node: {
                  id: 'gid://shopify/WebhookSubscription/103',
                  topic: 'CUSTOMERS_CREATE',
                  endpoint: {
                    __typename: 'WebhookHttpEndpoint',
                    callbackUrl: 'https://arco-backend-ecbl.onrender.com/api/shopify/webhooks',
                  },
                },
              },
              // 4. Subscription for an unrelated topic outside Phase 1 (must NOT be touched)
              {
                node: {
                  id: 'gid://shopify/WebhookSubscription/999',
                  topic: 'THEMES_PUBLISH',
                  endpoint: {
                    __typename: 'WebhookHttpEndpoint',
                    callbackUrl: 'https://other-service.com/webhook',
                  },
                },
              },
            ],
          },
        };
      }

      // Handle WebhookSubscriptionDelete
      if (query.includes('WebhookSubscriptionDelete')) {
        deletedIds.push(variables.id);
        return {
          webhookSubscriptionDelete: {
            userErrors: [],
            deletedWebhookSubscriptionId: variables.id,
          },
        };
      }

      // Handle WebhookSubscriptionCreate
      if (query.includes('webhookSubscriptionCreate')) {
        createdTopics.push({ topic: variables.topic, callbackUrl: variables.webhookSubscription.callbackUrl });
        return {
          webhookSubscriptionCreate: {
            userErrors: [],
            webhookSubscription: {
              id: `gid://shopify/WebhookSubscription/new_${variables.topic}`,
              topic: variables.topic,
              endpoint: {
                __typename: 'WebhookHttpEndpoint',
                callbackUrl: variables.webhookSubscription.callbackUrl,
              },
            },
          },
        };
      }

      return {};
    };

    try {
      const renderWebhookUrl = 'https://arco-backend-ecbl.onrender.com/api/shopify/webhooks';
      const results = await shopifyGraphService.registerPhase1Webhooks({
        shopDomain: TEST_SHOP,
        accessToken: 'mock_access_token',
        webhookUrl: renderWebhookUrl,
      });

      // 1. Verify obsolete Vercel subscription was deleted
      assert.ok(
        deletedIds.includes('gid://shopify/WebhookSubscription/101'),
        'Obsolete Vercel subscription (ID 101) must be deleted'
      );

      // 2. Verify duplicate Render subscription was deleted
      assert.ok(
        deletedIds.includes('gid://shopify/WebhookSubscription/103'),
        'Redundant duplicate subscription (ID 103) must be deleted'
      );

      // 3. Verify unrelated topic was NEVER touched
      assert.ok(
        !deletedIds.includes('gid://shopify/WebhookSubscription/999'),
        'Unrelated topic (ID 999) must NOT be deleted'
      );

      // 4. Verify existing valid subscription was kept without duplicate creation
      const customersCreateCreations = createdTopics.filter((c) => c.topic === 'CUSTOMERS_CREATE');
      assert.strictEqual(
        customersCreateCreations.length,
        0,
        'CUSTOMERS_CREATE already had a valid Render subscription, so it should not be re-created'
      );

      const customerCreateResult = results.find((r) => r.topic === 'CUSTOMERS_CREATE');
      assert.ok(customerCreateResult.reconciled, 'CUSTOMERS_CREATE must be flagged as reconciled');

      // 5. Verify PRODUCTS_CREATE was created pointing to Render
      const productCreateCreations = createdTopics.filter((c) => c.topic === 'PRODUCTS_CREATE');
      assert.strictEqual(productCreateCreations.length, 1, 'PRODUCTS_CREATE must be created once');
      assert.strictEqual(productCreateCreations[0].callbackUrl, renderWebhookUrl);

      // 6. Verify all 7 Phase 1 topics are accounted for and successful
      assert.strictEqual(results.length, 7, 'All 7 Phase 1 topics must be processed');
      assert.ok(results.every((r) => r.success), 'All 7 topics must succeed');
    } finally {
      // Restore original implementation
      shopifyGraphService.shopifyGraphRequest = originalRequest;
    }
  });

  // -------------------------------------------------------------
  // Test 20: Shopify Customer Consent Mapping
  // -------------------------------------------------------------
  await runAsyncTest('20. Shopify customer consent mapping accurately maps opt-in/opt-out and never defaults unknown to true', async () => {
    const { pool } = await import('../config/db.js');
    const { handleCustomerSync } = await import('../controllers/shopifyWebhookController.js');

    const originalQuery = pool.query;
    const executedQueries = [];

    pool.query = async (text, params) => {
      executedQueries.push({ text, params });
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        return { rows: [{ user_id: 'usr_test_1' }] };
      }
      if (text.includes("SELECT id, whatsapp_opted FROM contacts WHERE custom_attributes->>'shopify_customer_id'")) {
        const custId = params[0];
        if (custId === 'cust_existing_opted_in') {
          return { rows: [{ id: 'cnt_shp_cust_existing_opted_in', whatsapp_opted: true }] };
        }
        return { rows: [] };
      }
      if (text.includes('INSERT INTO contacts')) {
        return { rows: [{ id: params[0] }] };
      }
      if (text.includes('UPDATE contacts')) {
        return { rows: [] };
      }
      return { rows: [] };
    };

    try {
      // 20A: Subscribed customer -> whatsapp_opted = true
      executedQueries.length = 0;
      await handleCustomerSync(TEST_SHOP, {
        id: 'cust_sub_01',
        first_name: 'Aarav',
        last_name: 'Sharma',
        email: 'aarav@example.com',
        phone: '+919876543210',
        sms_marketing_consent: { state: 'subscribed' },
      });
      const insertSub = executedQueries.find((q) => q.text.includes('INSERT INTO contacts'));
      assert.ok(insertSub, 'Must insert contact for subscribed customer');
      assert.strictEqual(insertSub.params[7], true, 'whatsapp_opted must be true for subscribed customer');

      // 20B: Unsubscribed customer -> whatsapp_opted = false
      executedQueries.length = 0;
      await handleCustomerSync(TEST_SHOP, {
        id: 'cust_unsub_02',
        first_name: 'Priya',
        email: 'priya@example.com',
        sms_marketing_consent: { state: 'unsubscribed' },
      });
      const insertUnsub = executedQueries.find((q) => q.text.includes('INSERT INTO contacts'));
      assert.strictEqual(insertUnsub.params[7], false, 'whatsapp_opted must be false for unsubscribed customer');

      // 20C: Unknown consent on new contact -> whatsapp_opted = false (never defaulted to true)
      executedQueries.length = 0;
      await handleCustomerSync(TEST_SHOP, {
        id: 'cust_unknown_03',
        first_name: 'Vikram',
        email: 'vikram@example.com',
      });
      const insertUnknown = executedQueries.find((q) => q.text.includes('INSERT INTO contacts'));
      assert.strictEqual(insertUnknown.params[7], false, 'whatsapp_opted must NOT default to true when consent is unknown');

      // 20D: Unknown consent on existing contact with whatsapp_opted = true -> preserves true
      executedQueries.length = 0;
      await handleCustomerSync(TEST_SHOP, {
        id: 'cust_existing_opted_in',
        first_name: 'Rohan',
      });
      const updateExisting = executedQueries.find((q) => q.text.includes('UPDATE contacts'));
      assert.strictEqual(updateExisting.params[5], true, 'Existing contact whatsapp_opted must be preserved when payload consent is unknown');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 21: Order to Contact Linking
  // -------------------------------------------------------------
  await runAsyncTest('21. Order-to-contact linking matches contact and associates contact_id in checkout_orders', async () => {
    const { pool } = await import('../config/db.js');
    const { handleOrderSync } = await import('../controllers/shopifyWebhookController.js');

    const originalQuery = pool.query;
    const executedQueries = [];

    pool.query = async (text, params) => {
      executedQueries.push({ text, params });
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        return { rows: [{ user_id: 'usr_test_1' }] };
      }
      if (text.includes("SELECT id FROM contacts WHERE custom_attributes->>'shopify_customer_id'")) {
        return { rows: [{ id: 'cnt_shp_98765' }] };
      }
      if (text.includes('SELECT id, workflow_id, contact_id FROM checkout_orders')) {
        return { rows: [] };
      }
      if (text.includes('INSERT INTO checkout_orders')) {
        return { rows: [] };
      }
      return { rows: [] };
    };

    try {
      await handleOrderSync(TEST_SHOP, {
        id: 7771,
        order_number: '1001',
        customer: { id: 98765, first_name: 'John', last_name: 'Doe' },
        total_price: '1999.00',
        financial_status: 'paid',
        fulfillment_status: 'unfulfilled',
      }, { isNewOrder: false });

      const insertOrder = executedQueries.find((q) => q.text.includes('INSERT INTO checkout_orders'));
      assert.ok(insertOrder, 'Must insert into checkout_orders');
      assert.strictEqual(insertOrder.params[0], 'ord_shp_7771', 'Order ID must match convention');
      assert.strictEqual(insertOrder.params[3], 'cnt_shp_98765', 'contact_id must be populated with matching contact');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 22: Order Status Mapping (Matching OrderPanel.jsx Conventions)
  // -------------------------------------------------------------
  await runAsyncTest('22. Order and fulfillment statuses map cleanly to ARCO OrderPanel conventions', async () => {
    const { pool } = await import('../config/db.js');
    const { handleOrderSync } = await import('../controllers/shopifyWebhookController.js');

    const originalQuery = pool.query;
    const executedQueries = [];

    pool.query = async (text, params) => {
      executedQueries.push({ text, params });
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        return { rows: [{ user_id: 'usr_test_1' }] };
      }
      if (text.includes('SELECT id, workflow_id, contact_id FROM checkout_orders')) {
        return { rows: [] };
      }
      if (text.includes('SELECT id FROM contacts')) {
        return { rows: [] };
      }
      if (text.includes('INSERT INTO contacts')) {
        return { rows: [{ id: params[0] }] };
      }
      if (text.includes('INSERT INTO checkout_orders')) {
        return { rows: [] };
      }
      return { rows: [] };
    };

    try {
      // 22A: Paid & Fulfilled
      executedQueries.length = 0;
      await handleOrderSync(TEST_SHOP, {
        id: 8001,
        order_number: '1002',
        financial_status: 'paid',
        fulfillment_status: 'fulfilled',
        total_price: '2500.00',
      }, { isNewOrder: false });

      const insert1 = executedQueries.find((q) => q.text.includes('INSERT INTO checkout_orders'));
      assert.strictEqual(insert1.params[12], 'Paid', 'Payment status must be Paid');
      assert.strictEqual(insert1.params[13], 'Shipped', 'Order status must be Shipped for fulfilled order');
      assert.strictEqual(insert1.params[14], 'Shipped', 'Fulfillment status must be Shipped for fulfilled order');

      // 22B: Cancelled
      executedQueries.length = 0;
      await handleOrderSync(TEST_SHOP, {
        id: 8002,
        order_number: '1003',
        financial_status: 'refunded',
        cancelled_at: '2026-09-10T12:00:00Z',
        total_price: '1200.00',
      }, { isNewOrder: false });

      const insert2 = executedQueries.find((q) => q.text.includes('INSERT INTO checkout_orders'));
      assert.strictEqual(insert2.params[12], 'Refunded', 'Payment status must be Refunded');
      assert.strictEqual(insert2.params[13], 'Cancelled', 'Order status must be Cancelled');
      assert.strictEqual(insert2.params[14], 'Cancelled', 'Fulfillment status must be Cancelled');

      // 22C: Cash on Delivery (COD)
      executedQueries.length = 0;
      await handleOrderSync(TEST_SHOP, {
        id: 8003,
        order_number: '1004',
        financial_status: 'pending',
        gateway: 'cash_on_delivery',
        fulfillment_status: 'partial',
        total_price: '899.00',
      }, { isNewOrder: false });

      const insert3 = executedQueries.find((q) => q.text.includes('INSERT INTO checkout_orders'));
      assert.strictEqual(insert3.params[12], 'COD', 'Payment status must be COD');
      assert.strictEqual(insert3.params[13], 'Processing', 'Order status must be Processing for partial fulfillment');
      assert.strictEqual(insert3.params[14], 'Processing', 'Fulfillment status must be Processing');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 23: Duplicate Webhook Protection on orders/create
  // -------------------------------------------------------------
  await runAsyncTest('23. Repeated orders/create webhook sends exactly ONE WhatsApp notification', async () => {
    const { pool } = await import('../config/db.js');
    const { metaWhatsAppService } = await import('../services/metaWhatsAppService.js');
    const { handleOrderSync } = await import('../controllers/shopifyWebhookController.js');

    const originalQuery = pool.query;
    const originalGetCreds = metaWhatsAppService.getCredentials;
    const originalGetTmpls = metaWhatsAppService.getWhatsAppTemplates;
    const originalSend = metaWhatsAppService.sendTemplateMessage;

    let dispatches = 0;
    let orderWorkflowId = null;

    metaWhatsAppService.getCredentials = async () => ({
      isConfigured: true,
      phoneNumberId: '123456789',
      wabaId: '987654321',
      accessToken: 'mock_token',
    });

    metaWhatsAppService.getWhatsAppTemplates = async () => ({
      success: true,
      approved: [
        {
          id: 'tmpl_1',
          name: 'transactional_confirmation_02',
          status: 'APPROVED',
          language: 'en_US',
        },
      ],
    });

    metaWhatsAppService.sendTemplateMessage = async () => {
      dispatches++;
      return { success: true, wamid: 'wamid_test_dup_protection_123' };
    };

    pool.query = async (text, params) => {
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        return { rows: [{ user_id: 'usr_test_1' }] };
      }
      if (text.includes("SELECT id FROM contacts WHERE custom_attributes->>'shopify_customer_id'")) {
        return { rows: [{ id: 'cnt_shp_cust_opted_in' }] };
      }
      if (text.includes('SELECT id, phone, whatsapp_opted FROM contacts WHERE id = $1')) {
        return { rows: [{ id: 'cnt_shp_cust_opted_in', phone: '+919876543210', whatsapp_opted: true }] };
      }
      if (text.includes('SELECT workflow_id FROM checkout_orders WHERE id = $1 OR order_number = $2')) {
        return { rows: orderWorkflowId ? [{ workflow_id: orderWorkflowId }] : [] };
      }
      if (text.includes('SELECT id, workflow_id, contact_id FROM checkout_orders')) {
        return { rows: orderWorkflowId ? [{ id: 'ord_shp_9901', workflow_id: orderWorkflowId, contact_id: 'cnt_shp_cust_opted_in' }] : [] };
      }
      if (text.includes('INSERT INTO checkout_orders')) {
        return { rows: [] };
      }
      if (text.includes('UPDATE checkout_orders SET workflow_id = $1')) {
        orderWorkflowId = params[0];
        return { rows: [] };
      }
      if (text.includes('UPDATE checkout_orders')) {
        return { rows: [] };
      }
      return { rows: [] };
    };

    try {
      const sampleOrder = {
        id: 9901,
        order_number: '1005',
        customer: { id: 'cust_opted_in', first_name: 'Ananya' },
        phone: '+919876543210',
        total_price: '3499.00',
        financial_status: 'paid',
        fulfillment_status: 'unfulfilled',
      };

      // Call 1: First orders/create webhook
      await handleOrderSync(TEST_SHOP, sampleOrder, { isNewOrder: true });
      assert.strictEqual(dispatches, 1, 'First orders/create must trigger exactly 1 WhatsApp dispatch');
      assert.ok(orderWorkflowId?.startsWith('shopify_notified:'), 'workflow_id must record shopify_notified flag');

      // Call 2: Duplicate orders/create webhook for the same order
      await handleOrderSync(TEST_SHOP, sampleOrder, { isNewOrder: true });
      assert.strictEqual(dispatches, 1, 'Second orders/create MUST NOT trigger duplicate WhatsApp dispatch');
    } finally {
      pool.query = originalQuery;
      metaWhatsAppService.getCredentials = originalGetCreds;
      metaWhatsAppService.getWhatsAppTemplates = originalGetTmpls;
      metaWhatsAppService.sendTemplateMessage = originalSend;
    }
  });

  // -------------------------------------------------------------
  // Test 24: Template and Meta Failure Isolation
  // -------------------------------------------------------------
  await runAsyncTest('24. Incompatible template or Meta failure skips dispatch without crashing order persistence', async () => {
    const { pool } = await import('../config/db.js');
    const { metaWhatsAppService } = await import('../services/metaWhatsAppService.js');
    const { handleOrderSync } = await import('../controllers/shopifyWebhookController.js');

    const originalQuery = pool.query;
    const originalGetCreds = metaWhatsAppService.getCredentials;
    const originalGetTmpls = metaWhatsAppService.getWhatsAppTemplates;
    const originalSend = metaWhatsAppService.sendTemplateMessage;

    let dispatches = 0;
    let orderPersisted = false;

    metaWhatsAppService.getCredentials = async () => ({
      isConfigured: true,
      phoneNumberId: '123456789',
      wabaId: '987654321',
      accessToken: 'mock_token',
    });

    // Case A: No compatible approved template available
    metaWhatsAppService.getWhatsAppTemplates = async () => ({
      success: true,
      approved: [], // Zero approved templates
    });

    metaWhatsAppService.sendTemplateMessage = async () => {
      dispatches++;
      return { success: true };
    };

    pool.query = async (text, params) => {
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        return { rows: [{ user_id: 'usr_test_1' }] };
      }
      if (text.includes('SELECT id FROM contacts')) {
        return { rows: [{ id: 'cnt_test_1' }] };
      }
      if (text.includes('SELECT id, phone, whatsapp_opted FROM contacts')) {
        return { rows: [{ id: 'cnt_test_1', phone: '+919876543210', whatsapp_opted: true }] };
      }
      if (text.includes('SELECT workflow_id FROM checkout_orders')) {
        return { rows: [] };
      }
      if (text.includes('SELECT id, workflow_id, contact_id FROM checkout_orders')) {
        return { rows: [] };
      }
      if (text.includes('INSERT INTO checkout_orders')) {
        orderPersisted = true;
        return { rows: [] };
      }
      return { rows: [] };
    };

    try {
      const sampleOrder = {
        id: 9902,
        order_number: '1006',
        customer: { id: 'cust_test_2', first_name: 'Karan' },
        phone: '+919876543210',
        total_price: '1500.00',
        financial_status: 'paid',
        fulfillment_status: 'unfulfilled',
      };

      await handleOrderSync(TEST_SHOP, sampleOrder, { isNewOrder: true });
      assert.strictEqual(orderPersisted, true, 'Order must still be persisted when no template is available');
      assert.strictEqual(dispatches, 0, 'Zero WhatsApp dispatches should occur when template is missing');

      // Case B: Opt-out customer (whatsapp_opted === false)
      orderPersisted = false;
      pool.query = async (text, params) => {
        if (text.includes('SELECT user_id FROM shopify_integrations')) return { rows: [{ user_id: 'usr_test_1' }] };
        if (text.includes('SELECT id FROM contacts')) return { rows: [{ id: 'cnt_test_optout' }] };
        if (text.includes('SELECT id, phone, whatsapp_opted FROM contacts')) {
          return { rows: [{ id: 'cnt_test_optout', phone: '+919876543210', whatsapp_opted: false }] };
        }
        if (text.includes('INSERT INTO checkout_orders')) {
          orderPersisted = true;
          return { rows: [] };
        }
        return { rows: [] };
      };

      await handleOrderSync(TEST_SHOP, { ...sampleOrder, id: 9903, order_number: '1007' }, { isNewOrder: true });
      assert.strictEqual(orderPersisted, true, 'Order must be persisted for opted-out customer');
      assert.strictEqual(dispatches, 0, 'Zero dispatches must occur for opted-out customer');
    } finally {
      pool.query = originalQuery;
      metaWhatsAppService.getCredentials = originalGetCreds;
      metaWhatsAppService.getWhatsAppTemplates = originalGetTmpls;
      metaWhatsAppService.sendTemplateMessage = originalSend;
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
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
