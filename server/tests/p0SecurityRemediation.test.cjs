/**
 * ARCO Communication - P0 Production Security Remediation Test Suite
 *
 * Verifies all 4 P0 Production Blockers:
 * 1. Authentication Middleware (missing, invalid, expired -> 401; valid -> next)
 * 2. Passwordless Email Login Elimination (arbitrary email cannot obtain JWT)
 * 3. Meta WhatsApp Webhook HMAC-SHA256 Signature Verification (valid, invalid, missing)
 * 4. Secure /api/meta/status (401 unauthenticated, strictly scoped to user, inaccessible to other users)
 */

const assert = require('assert');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Ensure test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_arco_2026_super_secure';
process.env.META_APP_SECRET = process.env.META_APP_SECRET || 'test_meta_app_secret_1234567890';
process.env.META_WEBHOOK_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'test_verify_token_arco';

let totalTests = 0;
let passedTests = 0;
const failures = [];

function test(name, fn) {
  totalTests++;
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      return result
        .then(() => {
          passedTests++;
          console.log(`  ✓ [PASS] ${name}`);
        })
        .catch((err) => {
          failures.push({ name, error: err });
          console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
        });
    } else {
      passedTests++;
      console.log(`  ✓ [PASS] ${name}`);
    }
  } catch (err) {
    failures.push({ name, error: err });
    console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
  }
}

// Mock Express req/res generator
function createMockHttp({ headers = {}, query = {}, body = {}, user = null, rawBody = null } = {}) {
  let statusCode = 200;
  let responseData = null;
  let rawResponse = null;
  let nextCalled = false;

  const req = {
    headers: { ...headers },
    query: { ...query },
    body: typeof body === 'object' ? { ...body } : body,
    user,
    rawBody,
  };

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    send(data) {
      rawResponse = data;
      return this;
    },
    getStatusCode: () => statusCode,
    getJSON: () => responseData,
    getRaw: () => rawResponse,
  };

  const next = () => {
    nextCalled = true;
  };

  return { req, res, next, isNextCalled: () => nextCalled };
}

async function runSuite() {
  console.log('========================================================================');
  console.log('🔒 ARCO COMMUNICATION — P0 SECURITY REMEDIATION VERIFICATION SUITE');
  console.log('========================================================================\n');

  // Load modules dynamically
  const { authenticateToken } = await import('../middleware/auth.js');
  const { authController } = await import('../controllers/authController.js');
  const { whatsappController } = await import('../controllers/whatsappController.js');
  const { metaController } = await import('../controllers/metaController.js');
  const { query, db } = await import('../config/db.js');

  // =========================================================================
  // GROUP 1: P0 FIX 1 — AUTHENTICATION MIDDLEWARE
  // =========================================================================
  console.log('--- P0 FIX 1: Authentication Middleware ---');

  test('1.1 Missing Authorization header returns HTTP 401 and never assigns demo user', () => {
    const { req, res, next, isNextCalled } = createMockHttp({
      headers: {},
    });

    authenticateToken(req, res, next);

    assert.strictEqual(isNextCalled(), false, 'next() must NOT be called on missing token');
    assert.strictEqual(res.getStatusCode(), 401, 'Status code must be 401');
    assert.strictEqual(res.getJSON()?.success, false);
    assert.strictEqual(req.user, null, 'req.user must NOT be populated with demo user');
  });

  test('1.2 Invalid JWT token returns HTTP 401 and never assigns demo user', () => {
    const { req, res, next, isNextCalled } = createMockHttp({
      headers: { authorization: 'Bearer invalid.tampered.token' },
    });

    authenticateToken(req, res, next);

    assert.strictEqual(isNextCalled(), false, 'next() must NOT be called on invalid token');
    assert.strictEqual(res.getStatusCode(), 401, 'Status code must be 401');
    assert.strictEqual(res.getJSON()?.success, false);
    assert.strictEqual(req.user, null, 'req.user must NOT be populated with demo user');
  });

  test('1.3 Expired JWT token returns HTTP 401 and never assigns demo user', () => {
    const expiredToken = jwt.sign(
      { id: 'usr_victim_1', email: 'victim@arco.com', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' } // Expired 1 second ago
    );

    const { req, res, next, isNextCalled } = createMockHttp({
      headers: { authorization: `Bearer ${expiredToken}` },
    });

    authenticateToken(req, res, next);

    assert.strictEqual(isNextCalled(), false, 'next() must NOT be called on expired token');
    assert.strictEqual(res.getStatusCode(), 401, 'Status code must be 401');
    assert.strictEqual(res.getJSON()?.success, false);
    assert.strictEqual(req.user, null, 'req.user must NOT be populated with demo user');
  });

  test('1.4 Valid JWT token populates req.user and proceeds to next middleware', () => {
    const validToken = jwt.sign(
      { id: 'usr_valid_user', email: 'verified@arco.com', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const { req, res, next, isNextCalled } = createMockHttp({
      headers: { authorization: `Bearer ${validToken}` },
    });

    authenticateToken(req, res, next);

    assert.strictEqual(isNextCalled(), true, 'next() must be called on valid token');
    assert.strictEqual(res.getStatusCode(), 200);
    assert.ok(req.user, 'req.user must be populated');
    assert.strictEqual(req.user.id, 'usr_valid_user');
    assert.strictEqual(req.user.email, 'verified@arco.com');
  });

  test('1.5 Case-insensitive Authorization header with Bearer token succeeds', () => {
    const validToken = jwt.sign(
      { id: 'usr_google_auth', email: 'google.user@arco.com', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    const { req, res, next, isNextCalled } = createMockHttp({
      headers: { Authorization: `bearer ${validToken}` },
    });

    authenticateToken(req, res, next);

    assert.strictEqual(isNextCalled(), true);
    assert.strictEqual(req.user.id, 'usr_google_auth');
  });

  // =========================================================================
  // GROUP 2: P0 FIX 2 — PASSWORDLESS EMAIL LOGIN ELIMINATION
  // =========================================================================
  console.log('\n--- P0 FIX 2: Passwordless Email Login Elimination ---');

  await test('2.1 Arbitrary email to POST /api/auth/login is rejected with HTTP 401 and returns NO token', async () => {
    const { req, res, next } = createMockHttp({
      body: { email: 'arbitrary-victim@example.com' },
    });

    await authController.login(req, res, next);

    assert.strictEqual(res.getStatusCode(), 401, 'Arbitrary email login must return 401');
    const json = res.getJSON();
    assert.strictEqual(json?.success, false);
    assert.strictEqual(json?.data?.token, undefined, 'Must NOT grant any JWT');
    assert.strictEqual(json?.token, undefined, 'Must NOT grant any JWT');
  });

  await test('2.2 Target admin email to POST /api/auth/login cannot take over account', async () => {
    const { req, res, next } = createMockHttp({
      body: { email: 'owner@arco.com' },
    });

    await authController.login(req, res, next);

    assert.strictEqual(res.getStatusCode(), 401);
    const json = res.getJSON();
    assert.strictEqual(json?.success, false);
    assert.strictEqual(json?.data?.token, undefined);
  });

  test('2.3 Existing Google OAuth and Phone authentication handlers are preserved', () => {
    assert.strictEqual(typeof authController.getGoogleAuthUrl, 'function', 'getGoogleAuthUrl must exist');
    assert.strictEqual(typeof authController.handleGoogleCallback, 'function', 'handleGoogleCallback must exist');
    assert.strictEqual(typeof authController.loginWithPhone, 'function', 'loginWithPhone must exist');
    assert.strictEqual(typeof authController.getCurrentUser, 'function', 'getCurrentUser must exist');
    assert.strictEqual(typeof authController.updateOnboarding, 'function', 'updateOnboarding must exist');
  });

  // =========================================================================
  // GROUP 3: P0 FIX 3 — META WHATSAPP WEBHOOK SIGNATURE VERIFICATION
  // =========================================================================
  console.log('\n--- P0 FIX 3: Meta WhatsApp Webhook HMAC-SHA256 Signature ---');

  test('3.1 Missing X-Hub-Signature-256 header rejects webhook with HTTP 401', () => {
    const { req, res, next, isNextCalled } = createMockHttp({
      headers: {},
      body: { object: 'whatsapp_business_account', entry: [] },
    });

    whatsappController.verifyWebhookSignature(req, res, next);

    assert.strictEqual(isNextCalled(), false, 'next() must NOT be called when signature is missing');
    assert.strictEqual(res.getStatusCode(), 401, 'Status code must be 401');
    assert.strictEqual(res.getJSON()?.success, false);
    assert.ok(res.getJSON()?.error.includes('Missing'));
  });

  test('3.2 Invalid X-Hub-Signature-256 signature rejects webhook with HTTP 401', () => {
    const payload = JSON.stringify({ object: 'whatsapp_business_account', entry: [{ id: '123' }] });
    const rawBuf = Buffer.from(payload, 'utf8');

    // Create signature with wrong secret
    const badSignature = 'sha256=' + crypto.createHmac('sha256', 'wrong_secret_attacker').update(rawBuf).digest('hex');

    const { req, res, next, isNextCalled } = createMockHttp({
      headers: { 'x-hub-signature-256': badSignature },
      rawBody: rawBuf,
      body: JSON.parse(payload),
    });

    whatsappController.verifyWebhookSignature(req, res, next);

    assert.strictEqual(isNextCalled(), false, 'next() must NOT be called on invalid signature');
    assert.strictEqual(res.getStatusCode(), 401, 'Status code must be 401');
    assert.strictEqual(res.getJSON()?.success, false);
    assert.ok(res.getJSON()?.error.includes('Invalid webhook signature'));
  });

  test('3.3 Malformed signature header format rejects webhook with HTTP 401', () => {
    const payload = JSON.stringify({ object: 'whatsapp_business_account' });
    const rawBuf = Buffer.from(payload, 'utf8');

    const { req, res, next, isNextCalled } = createMockHttp({
      headers: { 'x-hub-signature-256': 'not_sha256_format_without_prefix' },
      rawBody: rawBuf,
      body: JSON.parse(payload),
    });

    whatsappController.verifyWebhookSignature(req, res, next);

    assert.strictEqual(isNextCalled(), false);
    assert.strictEqual(res.getStatusCode(), 401);
  });

  test('3.4 Valid X-Hub-Signature-256 HMAC-SHA256 signature succeeds and calls next()', () => {
    const payload = JSON.stringify({
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'waba_test_123',
          changes: [{ value: { messaging_product: 'whatsapp', metadata: { phone_number_id: '12345' } } }],
        },
      ],
    });
    const rawBuf = Buffer.from(payload, 'utf8');

    // Compute legitimate HMAC-SHA256 using META_APP_SECRET
    const validSignature = 'sha256=' + crypto.createHmac('sha256', process.env.META_APP_SECRET).update(rawBuf).digest('hex');

    const { req, res, next, isNextCalled } = createMockHttp({
      headers: { 'x-hub-signature-256': validSignature },
      rawBody: rawBuf,
      body: JSON.parse(payload),
    });

    whatsappController.verifyWebhookSignature(req, res, next);

    assert.strictEqual(isNextCalled(), true, 'next() MUST be called on valid signature');
    assert.strictEqual(res.getStatusCode(), 200);
  });

  test('3.5 Existing GET webhook verification handshake is preserved', () => {
    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

    // A. Valid handshake
    const { req: reqGood, res: resGood } = createMockHttp({
      query: {
        'hub.mode': 'subscribe',
        'hub.verify_token': verifyToken,
        'hub.challenge': 'CHALLENGE_CODE_12345',
      },
    });
    whatsappController.verifyWebhook(reqGood, resGood);
    assert.strictEqual(resGood.getStatusCode(), 200);
    assert.strictEqual(resGood.getRaw(), 'CHALLENGE_CODE_12345');

    // B. Invalid verify token
    const { req: reqBad, res: resBad } = createMockHttp({
      query: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'wrong_verify_token',
        'hub.challenge': 'CHALLENGE_CODE_12345',
      },
    });
    whatsappController.verifyWebhook(reqBad, resBad);
    assert.strictEqual(resBad.getStatusCode(), 403);
  });

  // =========================================================================
  // GROUP 4: P0 FIX 4 — SECURE /api/meta/status
  // =========================================================================
  console.log('\n--- P0 FIX 4: Secure /api/meta/status ---');

  await test('4.1 Unauthenticated request to getStatus returns HTTP 401', async () => {
    const { req, res, next } = createMockHttp({
      user: null, // No authenticated user
    });

    await metaController.getStatus(req, res, next);

    assert.strictEqual(res.getStatusCode(), 401, 'Unauthenticated getStatus must return 401');
    assert.strictEqual(res.getJSON()?.success, false);
    assert.ok(res.getJSON()?.error.includes('Unauthorized'));
  });

  await test('4.2 Authenticated user with no integration returns connected: false', async () => {
    const { req, res, next } = createMockHttp({
      user: { id: 'usr_no_integration_999', email: 'empty@arco.com' },
    });

    await metaController.getStatus(req, res, next);

    assert.strictEqual(res.getStatusCode(), 200);
    const json = res.getJSON();
    assert.strictEqual(json?.success, true);
    assert.strictEqual(json?.data?.connected, false);
  });

  await test('4.3 Authenticated User A accesses only User A integration; User B cannot access it', async () => {
    const userA = `usr_tenant_a_${Date.now()}`;
    const userB = `usr_tenant_b_${Date.now()}`;
    const integrationA = `meta_int_a_${Date.now()}`;

    // Seed test integration owned strictly by User A
    await query(
      `INSERT INTO meta_integrations (
         id, user_id, meta_business_id, waba_id, phone_number_id, display_phone_number,
         business_name, status, access_token_encrypted, number_type, country,
         verification_status, gst_number, gst_file_url, website_url, business_email, updated_at
       ) VALUES ($1, $2, 'mb_user_a', 'waba_user_a', 'phone_user_a', '+91 99999 11111',
                 'User A Enterprise', 'connected', 'enc_token_a', 'wa_business', 'India',
                 'verified', '27AABCU9603R1ZN', 'https://secure.arco.com/gst/user_a_gst.pdf',
                 'https://usera.com', 'owner@usera.com', CURRENT_TIMESTAMP)`,
      [integrationA, userA]
    );

    try {
      // 1. User A requests status -> receives User A integration with data
      const { req: reqA, res: resA, next: nextA } = createMockHttp({
        user: { id: userA, email: 'usera@example.com' },
      });
      await metaController.getStatus(reqA, resA, nextA);

      assert.strictEqual(resA.getStatusCode(), 200);
      const jsonA = resA.getJSON();
      assert.strictEqual(jsonA?.success, true);
      assert.strictEqual(jsonA?.data?.connected, true);
      assert.strictEqual(jsonA?.data?.id, integrationA);
      assert.strictEqual(jsonA?.data?.businessName, 'User A Enterprise');
      assert.strictEqual(jsonA?.data?.wabaId, 'waba_user_a');
      assert.strictEqual(jsonA?.data?.gstNumber, '27AABCU9603R1ZN');

      // 2. User B requests status -> User A integration is INACCESSIBLE to User B
      const { req: reqB, res: resB, next: nextB } = createMockHttp({
        user: { id: userB, email: 'userb@example.com' },
      });
      await metaController.getStatus(reqB, resB, nextB);

      assert.strictEqual(resB.getStatusCode(), 200);
      const jsonB = resB.getJSON();
      assert.strictEqual(jsonB?.success, true);
      assert.strictEqual(jsonB?.data?.connected, false, 'User B must NOT see User A connected integration');
      assert.strictEqual(jsonB?.data?.wabaId, undefined, 'User B must NOT see User A WABA ID');
      assert.strictEqual(jsonB?.data?.gstNumber, undefined, 'User B must NOT see User A GST Number');
      assert.strictEqual(jsonB?.data?.gstFileUrl, undefined, 'User B must NOT see User A GST File URL');
    } finally {
      // Clean up test fixture
      await query(`DELETE FROM meta_integrations WHERE id = $1`, [integrationA]);
    }
  });

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n========================================================================');
  console.log(`RESULTS: ${passedTests} / ${totalTests} tests passed.`);
  if (failures.length > 0) {
    console.error(`FAILURES (${failures.length}):`);
    failures.forEach((f) => console.error(` - ${f.name}: ${f.error.message}`));
    process.exit(1);
  } else {
    console.log('🎉 ALL P0 SECURITY REMEDIATION REQUIREMENTS VERIFIED & PASSED!');
    console.log('========================================================================\n');
    process.exit(0);
  }
}

runSuite().catch((err) => {
  console.error('[UNCAUGHT TEST RUNNER EXCEPTION]:', err);
  process.exit(1);
});
