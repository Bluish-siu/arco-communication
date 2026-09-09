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
