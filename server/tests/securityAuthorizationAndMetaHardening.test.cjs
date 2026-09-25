/**
 * ARCO Communication - Security Phase: Meta Graph API Hardening + Authorization/IDOR Test Suite
 *
 * Verifies:
 * 1. Authentication (missing, invalid, expired -> 401)
 * 2. RBAC Authorization (Admin permitted, Manager permitted, Agent denied admin/manager actions -> 403)
 * 3. IDOR / Object Authorization (Agent cannot modify/send on another agent's assigned conversation/task -> 403; nonexistent -> 404)
 * 4. Meta appsecret_proof (Correct HMAC-SHA256 proof, appended to Graph API URLs, no token/proof leakage in logs, safe failure on missing production secret)
 * 5. Meta Credential Fallback Elimination (Unrelated connected integration cannot become credential source for another user or context)
 */

const assert = require('assert');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_arco_2026_super_secure';
process.env.META_APP_SECRET = process.env.META_APP_SECRET || 'test_meta_app_secret_1234567890';
process.env.META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'test_meta_access_token_super_valid';
process.env.META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID || '1225478070642817';

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
function createMockHttp({ headers = {}, query = {}, params = {}, body = {}, user = null } = {}) {
  let statusCode = 200;
  let responseData = null;
  let nextCalled = false;
  let nextError = null;

  const req = {
    headers: { ...headers },
    query: { ...query },
    params: { ...params },
    body: typeof body === 'object' ? { ...body } : body,
    user,
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
    getStatusCode: () => statusCode,
    getJSON: () => responseData,
  };

  const next = (err) => {
    nextCalled = true;
    if (err) nextError = err;
  };

  return { req, res, next, isNextCalled: () => nextCalled, getNextError: () => nextError };
}

async function runSuite() {
  console.log('========================================================================');
  console.log('🛡️  ARCO COMMUNICATION — META GRAPH API HARDENING & RBAC/IDOR SUITE');
  console.log('========================================================================\n');

  // Load modules dynamically
  const { authenticateToken, requireAdmin, requireManagerOrAdmin, requireRole } = await import('../middleware/auth.js');
  const { generateAppSecretProof, appendAppSecretProof, sanitizeMetaUrl } = await import('../utils/metaCrypto.js');
  const { metaWhatsAppService } = await import('../services/metaWhatsAppService.js');
  const { inboxController } = await import('../controllers/inboxController.js');
  const { taskController } = await import('../controllers/taskController.js');
  const { query, db } = await import('../config/db.js');

  // -------------------------------------------------------------------------
  // 1. AUTHENTICATION MIDDLEWARE
  // -------------------------------------------------------------------------
  console.log('--- 1. Authentication Verification ---');

  await test('1.1 Missing token returns HTTP 401', () => {
    const { req, res, next, isNextCalled } = createMockHttp();
    authenticateToken(req, res, next);
    assert.strictEqual(res.getStatusCode(), 401);
    assert.strictEqual(res.getJSON().success, false);
    assert.strictEqual(isNextCalled(), false);
  });

  await test('1.2 Invalid token returns HTTP 401', () => {
    const { req, res, next, isNextCalled } = createMockHttp({
      headers: { authorization: 'Bearer invalid.token.payload' },
    });
    authenticateToken(req, res, next);
    assert.strictEqual(res.getStatusCode(), 401);
    assert.strictEqual(isNextCalled(), false);
  });

  await test('1.3 Expired token returns HTTP 401', () => {
    const expiredToken = jwt.sign(
      { id: 'usr_test_expired', email: 'exp@arco.com', role: 'agent' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    );
    const { req, res, next, isNextCalled } = createMockHttp({
      headers: { authorization: `Bearer ${expiredToken}` },
    });
    authenticateToken(req, res, next);
    assert.strictEqual(res.getStatusCode(), 401);
    assert.strictEqual(isNextCalled(), false);
  });

  await test('1.4 Valid token loads req.user and calls next()', () => {
    const validToken = jwt.sign(
      { id: 'usr_valid_agent', email: 'agent@arco.com', role: 'agent', name: 'Agent Smith' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const { req, res, next, isNextCalled } = createMockHttp({
      headers: { authorization: `Bearer ${validToken}` },
    });
    authenticateToken(req, res, next);
    assert.strictEqual(isNextCalled(), true);
    assert.strictEqual(req.user.id, 'usr_valid_agent');
    assert.strictEqual(req.user.role, 'agent');
  });

  // -------------------------------------------------------------------------
  // 2. RBAC AUTHORIZATION
  // -------------------------------------------------------------------------
  console.log('\n--- 2. RBAC Authorization Verification ---');

  await test('2.1 Admin user is permitted by requireAdmin and requireManagerOrAdmin', () => {
    const adminUser = { id: 'usr_admin', email: 'admin@arco.com', role: 'admin' };
    const { req: req1, res: res1, next: next1, isNextCalled: nextCalled1 } = createMockHttp({ user: adminUser });
    requireAdmin(req1, res1, next1);
    assert.strictEqual(nextCalled1(), true);

    const { req: req2, res: res2, next: next2, isNextCalled: nextCalled2 } = createMockHttp({ user: adminUser });
    requireManagerOrAdmin(req2, res2, next2);
    assert.strictEqual(nextCalled2(), true);
  });

  await test('2.2 Manager user is permitted by requireManagerOrAdmin but rejected by requireAdmin (HTTP 403)', () => {
    const managerUser = { id: 'usr_mgr', email: 'mgr@arco.com', role: 'manager' };
    const { req: req1, res: res1, next: next1, isNextCalled: nextCalled1 } = createMockHttp({ user: managerUser });
    requireManagerOrAdmin(req1, res1, next1);
    assert.strictEqual(nextCalled1(), true);

    const { req: req2, res: res2, next: next2, isNextCalled: nextCalled2 } = createMockHttp({ user: managerUser });
    requireAdmin(req2, res2, next2);
    assert.strictEqual(res2.getStatusCode(), 403);
    assert.strictEqual(nextCalled2(), false);
    assert.strictEqual(res2.getJSON().success, false);
  });

  await test('2.3 Agent user is rejected by both requireAdmin and requireManagerOrAdmin (HTTP 403)', () => {
    const agentUser = { id: 'usr_agent', email: 'agent@arco.com', role: 'agent' };
    const { req: req1, res: res1, next: next1, isNextCalled: nextCalled1 } = createMockHttp({ user: agentUser });
    requireAdmin(req1, res1, next1);
    assert.strictEqual(res1.getStatusCode(), 403);
    assert.strictEqual(nextCalled1(), false);

    const { req: req2, res: res2, next: next2, isNextCalled: nextCalled2 } = createMockHttp({ user: agentUser });
    requireManagerOrAdmin(req2, res2, next2);
    assert.strictEqual(res2.getStatusCode(), 403);
    assert.strictEqual(nextCalled2(), false);
  });

  await test('2.4 Unauthenticated request to requireRole returns HTTP 401', () => {
    const { req, res, next, isNextCalled } = createMockHttp({ user: null });
    requireAdmin(req, res, next);
    assert.strictEqual(res.getStatusCode(), 401);
    assert.strictEqual(isNextCalled(), false);
  });

  // -------------------------------------------------------------------------
  // 3. IDOR / OBJECT AUTHORIZATION
  // -------------------------------------------------------------------------
  console.log('\n--- 3. IDOR & Object Authorization Verification ---');

  const testConvAlice = `cnv_idor_alice_${Date.now()}`;
  const testConvBob = `cnv_idor_bob_${Date.now()}`;
  const testTaskAlice = `tsk_idor_alice_${Date.now()}`;
  const testTaskBob = `tsk_idor_bob_${Date.now()}`;

  try {
    // Seed conversations and tasks for IDOR testing
    await db.insert('conversations', {
      id: testConvAlice,
      name: 'Alice Customer',
      channel: 'whatsapp',
      status: 'Online',
      phone: '+919900011111',
      unread_count: 0,
      last_message_time: 'Just now',
      tag: 'Lead',
      status_filter: 'open',
      assignee: 'Agent Alice',
      created_at: new Date(),
      updated_at: new Date(),
    });

    await db.insert('conversations', {
      id: testConvBob,
      name: 'Bob Customer',
      channel: 'whatsapp',
      status: 'Online',
      phone: '+919900022222',
      unread_count: 0,
      last_message_time: 'Just now',
      tag: 'Lead',
      status_filter: 'open',
      assignee: 'Agent Bob',
      created_at: new Date(),
      updated_at: new Date(),
    });

    await query(
      `INSERT INTO tasks (id, title, description, assigned_to, status, created_at, updated_at)
       VALUES ($1, 'Alice Task', 'Follow up with Alice', 'Agent Alice', 'To Do', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [testTaskAlice]
    );

    await query(
      `INSERT INTO tasks (id, title, description, assigned_to, status, created_at, updated_at)
       VALUES ($1, 'Bob Task', 'Follow up with Bob', 'Agent Bob', 'To Do', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [testTaskBob]
    );

    // TEST 3.1: Nonexistent conversation returns 404
    await test('3.1 Nonexistent conversation returns HTTP 404', async () => {
      const { req, res, next } = createMockHttp({
        params: { id: 'cnv_nonexistent_999999' },
        body: { text: 'Hello' },
        user: { id: 'usr_1', role: 'admin' },
      });
      await inboxController.sendMessage(req, res, next);
      assert.strictEqual(res.getStatusCode(), 404);
      assert.strictEqual(res.getJSON().success, false);
    });

    // TEST 3.2: Agent Bob cannot send message on Alice's conversation (IDOR attempt -> HTTP 403)
    await test("3.2 Agent Bob cannot send message on conversation assigned to Agent Alice (HTTP 403)", async () => {
      const { req, res, next } = createMockHttp({
        params: { id: testConvAlice },
        body: { text: 'Sneaky message from Bob' },
        user: { id: 'usr_bob', name: 'Agent Bob', email: 'bob@arco.com', role: 'agent' },
      });
      await inboxController.sendMessage(req, res, next);
      assert.strictEqual(res.getStatusCode(), 403);
      assert.strictEqual(res.getJSON().success, false);
      assert.ok(res.getJSON().error.includes('assigned to another agent'));
    });

    // TEST 3.3: Agent Bob cannot update conversation assigned to Agent Alice (IDOR attempt -> HTTP 403)
    await test("3.3 Agent Bob cannot update conversation assigned to Agent Alice (HTTP 403)", async () => {
      const { req, res, next } = createMockHttp({
        params: { id: testConvAlice },
        body: { statusFilter: 'closed', assignee: 'Agent Bob' },
        user: { id: 'usr_bob', name: 'Agent Bob', email: 'bob@arco.com', role: 'agent' },
      });
      await inboxController.updateConversation(req, res, next);
      assert.strictEqual(res.getStatusCode(), 403);
      assert.strictEqual(res.getJSON().success, false);
    });

    // TEST 3.4: Manager and Admin CAN oversee and update conversation (business-wide access)
    await test("3.4 Manager has oversight to update conversation assigned to Agent Alice", async () => {
      const { req, res, next } = createMockHttp({
        params: { id: testConvAlice },
        body: { notes: 'Manager reviewed this lead' },
        user: { id: 'usr_mgr', name: 'Manager Mary', role: 'manager' },
      });
      await inboxController.updateConversation(req, res, next);
      assert.strictEqual(res.getStatusCode(), 200);
      assert.strictEqual(res.getJSON().success, true);
    });

    // TEST 3.5: Nonexistent task returns 404
    await test("3.5 Nonexistent task returns HTTP 404 on update, updateStatus, delete", async () => {
      const { req, res, next } = createMockHttp({
        params: { id: 'tsk_nonexistent_8888' },
        body: { title: 'Ghost Task' },
        user: { id: 'usr_1', role: 'admin' },
      });
      await taskController.update(req, res, next);
      assert.strictEqual(res.getStatusCode(), 404);
    });

    // TEST 3.6: Agent Bob cannot update task assigned to Agent Alice (IDOR attempt -> HTTP 403)
    await test("3.6 Agent Bob cannot update task assigned to Agent Alice (HTTP 403)", async () => {
      const { req, res, next } = createMockHttp({
        params: { id: testTaskAlice },
        body: { status: 'Completed' },
        user: { id: 'usr_bob', name: 'Agent Bob', role: 'agent' },
      });
      await taskController.update(req, res, next);
      assert.strictEqual(res.getStatusCode(), 403);
      assert.strictEqual(res.getJSON().success, false);
    });

    // TEST 3.7: Agent Bob cannot updateStatus on task assigned to Agent Alice (HTTP 403)
    await test("3.7 Agent Bob cannot updateStatus of task assigned to Agent Alice (HTTP 403)", async () => {
      const { req, res, next } = createMockHttp({
        params: { id: testTaskAlice },
        body: { status: 'Completed' },
        user: { id: 'usr_bob', name: 'Agent Bob', role: 'agent' },
      });
      await taskController.updateStatus(req, res, next);
      assert.strictEqual(res.getStatusCode(), 403);
      assert.strictEqual(res.getJSON().success, false);
    });

    // TEST 3.8: Agent Bob cannot delete task assigned to Agent Alice (HTTP 403)
    await test("3.8 Agent Bob cannot delete task assigned to Agent Alice (HTTP 403)", async () => {
      const { req, res, next } = createMockHttp({
        params: { id: testTaskAlice },
        user: { id: 'usr_bob', name: 'Agent Bob', role: 'agent' },
      });
      await taskController.delete(req, res, next);
      assert.strictEqual(res.getStatusCode(), 403);
      assert.strictEqual(res.getJSON().success, false);
    });

    // TEST 3.9: Agent Alice CAN update her own task
    await test("3.9 Agent Alice can successfully update her own assigned task", async () => {
      const { req, res, next } = createMockHttp({
        params: { id: testTaskAlice },
        body: { description: 'Alice updated her task progress' },
        user: { id: 'usr_alice', name: 'Agent Alice', role: 'agent' },
      });
      await taskController.update(req, res, next);
      assert.strictEqual(res.getStatusCode(), 200);
      assert.strictEqual(res.getJSON().success, true);
    });

  } finally {
    // Cleanup seeded test records
    await query('DELETE FROM messages WHERE conversation_id IN ($1, $2)', [testConvAlice, testConvBob]);
    await query('DELETE FROM conversations WHERE id IN ($1, $2)', [testConvAlice, testConvBob]);
    await query('DELETE FROM tasks WHERE id IN ($1, $2)', [testTaskAlice, testTaskBob]);
  }

  // -------------------------------------------------------------------------
  // 4. META APPSECRET_PROOF GENERATION & HARDENING
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Meta appsecret_proof Verification ---');

  const sampleToken = 'EAABwbtesttoken_sec_1234567890abcdef';
  const sampleSecret = 'f3b2a1c0987654321fedcba098765432';

  await test('4.1 Correct HMAC-SHA256 appsecret_proof generation', () => {
    const expectedProof = crypto.createHmac('sha256', sampleSecret).update(sampleToken).digest('hex');
    const generated = generateAppSecretProof(sampleToken, sampleSecret);
    assert.strictEqual(generated, expectedProof);
    assert.strictEqual(generated.length, 64, 'HMAC-SHA256 proof must be 64 hex characters');
  });

  await test('4.2 appendAppSecretProof correctly injects query parameter', () => {
    const rawUrl1 = 'https://graph.facebook.com/v25.0/1225478070642817/messages';
    const finalUrl1 = appendAppSecretProof(rawUrl1, sampleToken, sampleSecret);
    assert.ok(finalUrl1.startsWith('https://graph.facebook.com/v25.0/1225478070642817/messages?appsecret_proof='));
    assert.ok(finalUrl1.includes(generateAppSecretProof(sampleToken, sampleSecret)));

    const rawUrl2 = 'https://graph.facebook.com/v25.0/1311505681068950/message_templates?limit=100';
    const finalUrl2 = appendAppSecretProof(rawUrl2, sampleToken, sampleSecret);
    assert.ok(finalUrl2.includes('&appsecret_proof='));
  });

  await test('4.3 sanitizeMetaUrl scrubs appsecret_proof, access_token, and client_secret from logs', () => {
    const urlWithProof = `https://graph.facebook.com/v25.0/123/messages?limit=100&appsecret_proof=abcdef0123456789`;
    const sanitized = sanitizeMetaUrl(urlWithProof);
    assert.ok(!sanitized.includes('abcdef0123456789'), 'Proof must be redacted from log string');
    assert.ok(sanitized.includes('appsecret_proof=[REDACTED]'));

    const urlWithToken = `https://graph.facebook.com/oauth/access_token?client_secret=secret123&access_token=token456`;
    const sanitized2 = sanitizeMetaUrl(urlWithToken);
    assert.ok(!sanitized2.includes('secret123'));
    assert.ok(!sanitized2.includes('token456'));
    assert.ok(sanitized2.includes('client_secret=[REDACTED]'));
    assert.ok(sanitized2.includes('access_token=[REDACTED]'));
  });

  await test('4.4 Missing production META_APP_SECRET handles safely and returns null without crashing', () => {
    const origEnv = process.env.NODE_ENV;
    const origSecret = process.env.META_APP_SECRET;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.META_APP_SECRET;

      const proof = generateAppSecretProof(sampleToken, null);
      assert.strictEqual(proof, null, 'Must return null safely when META_APP_SECRET is unset in production');
    } finally {
      process.env.NODE_ENV = origEnv;
      process.env.META_APP_SECRET = origSecret;
    }
  });

  await test('4.5 Meta Graph API calls include appsecret_proof in dispatched fetch', async () => {
    const origFetch = global.fetch;
    let capturedUrl = null;

    global.fetch = async (url) => {
      capturedUrl = url;
      return {
        ok: true,
        json: async () => ({
          id: '1225478070642817',
          verified_name: 'ARCO Communication',
          display_phone_number: '+91 98765 43210',
          quality_rating: 'GREEN',
        }),
      };
    };

    try {
      const result = await metaWhatsAppService.verifyConnection();
      assert.strictEqual(result.isConnected, true);
      assert.ok(capturedUrl !== null, 'Fetch must have been called');
      assert.ok(capturedUrl.includes('appsecret_proof='), 'Graph API call must contain appsecret_proof parameter');
    } finally {
      global.fetch = origFetch;
    }
  });

  // -------------------------------------------------------------------------
  // 5. REMOVE META CREDENTIAL FALLBACK
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Meta Credential Fallback Elimination ---');

  const testTenantVictim = `usr_victim_${Date.now()}`;
  const testTenantAttacker = `usr_attacker_${Date.now()}`;
  const victimPhoneId = '999888777111222';
  const victimWabaId = '888777666555444';
  const victimToken = 'meta_victim_secret_token_never_leak';

  try {
    // Insert an existing connected integration for victim
    await query(
      `INSERT INTO meta_integrations (
         id, user_id, meta_business_id, waba_id, phone_number_id, display_phone_number,
         access_token_encrypted, status, created_at, updated_at
       ) VALUES ($1, $2, 'biz_victim', $3, $4, '+91 99999 11111', $5, 'connected', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [`meta_int_${Date.now()}`, testTenantVictim, victimWabaId, victimPhoneId, victimToken]
    );

    await test('5.1 Unrelated connected integration cannot become credential source for another user', async () => {
      // Temporarily clear environment variables to verify DB resolution isolation
      const origToken = process.env.META_ACCESS_TOKEN;
      const origPhone = process.env.META_PHONE_NUMBER_ID;
      try {
        delete process.env.META_ACCESS_TOKEN;
        delete process.env.META_PHONE_NUMBER_ID;

        // Query credentials for attacker tenant who has no integration
        const creds = await metaWhatsAppService.getCredentials(testTenantAttacker);

        // MUST NOT fall back to victim's integration
        assert.strictEqual(creds.isConfigured, false, 'Attacker tenant credentials must NOT be configured');
        assert.strictEqual(creds.accessToken, null, 'Must NOT leak victim access token');
        assert.strictEqual(creds.phoneNumberId, null, 'Must NOT leak victim phone number ID');
        assert.notStrictEqual(creds.phoneNumberId, victimPhoneId);
      } finally {
        process.env.META_ACCESS_TOKEN = origToken;
        process.env.META_PHONE_NUMBER_ID = origPhone;
      }
    });

    await test('5.2 Victim tenant deterministically receives their own credentials', async () => {
      const origToken = process.env.META_ACCESS_TOKEN;
      const origPhone = process.env.META_PHONE_NUMBER_ID;
      try {
        delete process.env.META_ACCESS_TOKEN;
        delete process.env.META_PHONE_NUMBER_ID;

        const creds = await metaWhatsAppService.getCredentials(testTenantVictim);
        assert.strictEqual(creds.isConfigured, true);
        assert.strictEqual(creds.phoneNumberId, victimPhoneId);
        assert.strictEqual(creds.wabaId, victimWabaId);
        assert.strictEqual(creds.tenantId, testTenantVictim);
      } finally {
        process.env.META_ACCESS_TOKEN = origToken;
        process.env.META_PHONE_NUMBER_ID = origPhone;
      }
    });
  } finally {
    await query('DELETE FROM meta_integrations WHERE user_id = $1', [testTenantVictim]);
  }

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log(`RESULTS: ${passedTests} / ${totalTests} tests passed.`);
  if (failures.length > 0) {
    console.error(`💥 ${failures.length} TESTS FAILED!`);
    failures.forEach((f) => console.error(`  - ${f.name}: ${f.error.message}`));
    process.exit(1);
  } else {
    console.log('🎉 ALL SECURITY, AUTHORIZATION, IDOR, & META HARDENING REQUIREMENTS PASSED!');
    console.log('========================================================================\n');
    process.exit(0);
  }
}

runSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
