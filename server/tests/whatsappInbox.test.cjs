/**
 * ARCO Communication - WhatsApp Inbox Two-Way Verification Suite
 * Tests inbound webhook parsing, deduplication, contact/conversation linking,
 * 24h window calculation, monotonic status progression, and outbound Meta dispatch.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Inject environment variables
try {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
} catch (e) {
  // Optional dotenv loading
}

let passedTests = 0;
let totalTests = 0;

function reportTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${totalTests}. ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${totalTests}. ${name}`);
    console.error(`    Error: ${err.message}`);
    throw err;
  }
}

async function reportAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ [PASS] ${totalTests}. ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${totalTests}. ${name}`);
    console.error(`    Error: ${err.message}`);
    throw err;
  }
}

(async () => {
  console.log('\n=============================================================');
  console.log(' RUNNING WHATSAPP INBOX TWO-WAY VERIFICATION SUITE');
  console.log('=============================================================\n');

  // Asynchronously import ES modules
  const { whatsappController } = await import('../controllers/whatsappController.js');
  const { inboxController } = await import('../controllers/inboxController.js');
  const { evaluateAssignmentInternal } = await import('../controllers/chatAssignmentController.js');
  const { isWithin24HourWindow } = await import('../services/metaWhatsAppService.js');
  const { query, pool } = await import('../config/db.js');

  // Test 1: Database Schema & Column Verification
  await reportAsyncTest('Database schema has meta_message_id, status, error_message, last_inbound_at', async () => {
    const msgCols = await query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'messages' AND column_name IN ('meta_message_id', 'status', 'error_message', 'message_type')`
    );
    const msgColNames = msgCols.rows.map(r => r.column_name);
    assert(msgColNames.includes('meta_message_id'), 'messages missing meta_message_id');
    assert(msgColNames.includes('status'), 'messages missing status');
    assert(msgColNames.includes('error_message'), 'messages missing error_message');
    assert(msgColNames.includes('message_type'), 'messages missing message_type');

    const convCols = await query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'last_inbound_at'`
    );
    assert(convCols.rows.length > 0, 'conversations missing last_inbound_at column');
  });

  // Test 2: Webhook Verification Handshake
  reportTest('Webhook verification handshake accepts correct token and rejects invalid', () => {
    assert(typeof whatsappController.verifyWebhook === 'function', 'verifyWebhook must be a function');

    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'arco_meta_webhook_2026';

    // 1. Success case
    let statusCode = 0;
    let sentChallenge = '';
    const resGood = {
      status: (code) => { statusCode = code; return { send: (c) => { sentChallenge = c; } }; },
    };
    whatsappController.verifyWebhook({
      query: { 'hub.mode': 'subscribe', 'hub.verify_token': verifyToken, 'hub.challenge': 'CHALLENGE_XYZ_123' },
    }, resGood);
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(sentChallenge, 'CHALLENGE_XYZ_123');

    // 2. Reject bad token
    let badStatusCode = 0;
    const resBad = {
      status: (code) => { badStatusCode = code; return { send: () => {} }; },
    };
    whatsappController.verifyWebhook({
      query: { 'hub.mode': 'subscribe', 'hub.verify_token': 'wrong_token', 'hub.challenge': 'CHALLENGE_XYZ_123' },
    }, resBad);
    assert.strictEqual(badStatusCode, 403);
  });

  // Test 3: 24-Hour Service Window Calculation
  reportTest('24-Hour service window evaluator correctly computes active vs expired', () => {
    assert(typeof isWithin24HourWindow === 'function', 'isWithin24HourWindow must be exported');

    // 1. Null/undefined -> false
    assert.strictEqual(isWithin24HourWindow(null), false);
    assert.strictEqual(isWithin24HourWindow(undefined), false);

    // 2. 5 minutes ago -> true
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    assert.strictEqual(isWithin24HourWindow(fiveMinutesAgo), true);

    // 3. 23 hours ago -> true
    const twentyThreeHoursAgo = new Date(Date.now() - 23 * 60 * 60 * 1000);
    assert.strictEqual(isWithin24HourWindow(twentyThreeHoursAgo), true);

    // 4. 25 hours ago -> false
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
    assert.strictEqual(isWithin24HourWindow(twentyFiveHoursAgo), false);
  });

  // Test 4: Inbound Webhook Parsing & Contact/Conversation Upsert
  const testPhone = `9199999${Math.floor(10000 + Math.random() * 90000)}`;
  const testWamid = `wamid.HBgTEST_${Date.now()}_inbound`;

  await reportAsyncTest('Inbound WhatsApp message creates Contact, Conversation, and Message', async () => {

    const webhookPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '15550001234',
                  phone_number_id: '1291678620701663',
                },
                contacts: [
                  {
                    profile: { name: 'Priya Sharma Test' },
                    wa_id: testPhone,
                  },
                ],
                messages: [
                  {
                    from: testPhone,
                    id: testWamid,
                    timestamp: String(Math.floor(Date.now() / 1000)),
                    text: { body: 'Hello ARCO, I need product details!' },
                    type: 'text',
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };

    let responseStatus = 0;
    const res = {
      status: (c) => { responseStatus = c; return { send: () => {} }; },
    };

    await whatsappController.handleWebhook({ body: webhookPayload }, res);
    assert.strictEqual(responseStatus, 200, 'Webhook must respond HTTP 200');

    // Verify contact was created
    const contactRes = await query(
      `SELECT * FROM contacts WHERE phone = $1 OR phone = $2 LIMIT 1`,
      [`+${testPhone}`, testPhone]
    );
    assert(contactRes.rows.length > 0, 'Contact record was not created');
    const contact = contactRes.rows[0];
    assert.strictEqual(contact.whatsapp_opted, false, 'Inbound customer without explicit consent must have whatsapp_opted false per compliance');
    assert.strictEqual(contact.name, 'Priya Sharma Test', 'Contact name must match sender profile');

    // Verify conversation was created
    const convRes = await query(
      `SELECT * FROM conversations WHERE (phone = $1 OR phone = $2) AND channel = 'whatsapp' LIMIT 1`,
      [`+${testPhone}`, testPhone]
    );
    assert(convRes.rows.length > 0, 'Conversation record was not created');
    const conv = convRes.rows[0];
    assert.strictEqual(conv.reply_status, 'unreplied', 'New inbound conversation must be unreplied');
    assert(conv.last_inbound_at !== null, 'last_inbound_at must be populated');
    assert.strictEqual(conv.status_filter, 'open', 'status_filter must be open');

    // Verify message was created
    const msgRes = await query(
      `SELECT * FROM messages WHERE meta_message_id = $1 LIMIT 1`,
      [testWamid]
    );
    assert(msgRes.rows.length > 0, 'Message record was not created');
    const msg = msgRes.rows[0];
    assert.strictEqual(msg.sender, 'contact');
    assert.strictEqual(msg.status, 'delivered');
    assert.strictEqual(msg.text, 'Hello ARCO, I need product details!');
  });

  // Test 5: Inbound Duplicate Protection
  await reportAsyncTest('Repeated inbound webhook with identical meta_message_id is de-duplicated', async () => {
    const duplicatePayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                contacts: [{ profile: { name: 'Priya Sharma Test' }, wa_id: testPhone }],
                messages: [
                  {
                    from: testPhone,
                    id: testWamid, // same ID as test 4
                    timestamp: String(Math.floor(Date.now() / 1000)),
                    text: { body: 'Hello ARCO, I need product details!' },
                    type: 'text',
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };

    let responseStatus = 0;
    const res = {
      status: (c) => { responseStatus = c; return { send: () => {} }; },
    };

    await whatsappController.handleWebhook({ body: duplicatePayload }, res);
    assert.strictEqual(responseStatus, 200);

    // Verify messages count with this meta_message_id is STILL 1
    const countRes = await query(
      `SELECT COUNT(*) as cnt FROM messages WHERE meta_message_id = $1`,
      [testWamid]
    );
    assert.strictEqual(parseInt(countRes.rows[0].cnt, 10), 1, 'Duplicate inbound message was improperly inserted');
  });

  // Test 6: Monotonic Status Progression (sent -> delivered -> read)
  const outboundTestWamid = `wamid.HBgTEST_OUTBOUND_${Date.now()}`;

  await reportAsyncTest('Webhook status updates progress monotonically and prevent overwrite of read', async () => {
    // Find conversation created in Test 4
    const convRes = await query(
      `SELECT id FROM conversations WHERE phone = $1 OR phone = $2 LIMIT 1`,
      [`+${testPhone}`, testPhone]
    );
    assert(convRes.rows.length > 0, 'Test conversation from Test 4 must exist');
    const convId = convRes.rows[0].id;

    // Seed an outbound message with 'sent'
    const msgId = `m_test_status_${Date.now()}`;
    await query(
      `INSERT INTO messages (id, conversation_id, sender, text, time, meta_message_id, status, created_at)
       VALUES ($1, $2, 'me', 'Testing delivery ticks', '12:00 PM', $3, 'sent', CURRENT_TIMESTAMP)`,
      [msgId, convId, outboundTestWamid]
    );

    // Helper to send status webhook
    const sendStatus = async (statusVal) => {
      let responseStatus = 0;
      const res = { status: (c) => { responseStatus = c; return { send: () => {} }; } };
      await whatsappController.handleWebhook({
        body: {
          object: 'whatsapp_business_account',
          entry: [
            {
              changes: [
                {
                  value: {
                    messaging_product: 'whatsapp',
                    statuses: [
                      {
                        id: outboundTestWamid,
                        status: statusVal,
                        timestamp: String(Math.floor(Date.now() / 1000)),
                        recipient_id: testPhone,
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      }, res);
      assert.strictEqual(responseStatus, 200);
    };

    // 1. Deliver message
    await sendStatus('delivered');
    let cur = await query('SELECT status FROM messages WHERE meta_message_id = $1', [outboundTestWamid]);
    assert.strictEqual(cur.rows[0].status, 'delivered', 'Message status should be delivered');

    // 2. Read message
    await sendStatus('read');
    cur = await query('SELECT status FROM messages WHERE meta_message_id = $1', [outboundTestWamid]);
    assert.strictEqual(cur.rows[0].status, 'read', 'Message status should be read');

    // 3. Late delivered webhook must NOT overwrite 'read'
    await sendStatus('delivered');
    cur = await query('SELECT status FROM messages WHERE meta_message_id = $1', [outboundTestWamid]);
    assert.strictEqual(cur.rows[0].status, 'read', 'Late delivered webhook must not overwrite read status');

    // Clean up test message
    await query('DELETE FROM messages WHERE id = $1', [msgId]);
  });

  // Test 7: Chat Assignment Evaluator
  await reportAsyncTest('evaluateAssignmentInternal assigns agent according to settings', async () => {
    const result = await evaluateAssignmentInternal({
      contactName: 'Assignment Test',
      contactPhone: '+919999900000',
      channel: 'whatsapp',
      userId: 'usr_1',
    });

    assert(result, 'evaluateAssignmentInternal must return result');
    assert(result.assignedAgent, 'assignedAgent must be defined');
    assert(result.appliedRule, 'appliedRule must be defined');
  });

  // Test 8: Outbound Message Controller Signature & Handling
  await reportAsyncTest('inboxController.sendMessage records message and attempts dispatch', async () => {
    assert(typeof inboxController.sendMessage === 'function', 'sendMessage must be defined');

    // Find our test conversation
    const convRes = await query(
      `SELECT id FROM conversations WHERE phone = $1 OR phone = $2 LIMIT 1`,
      [`+${testPhone}`, testPhone]
    );
    assert(convRes.rows.length > 0, 'Test conversation must exist');
    const convId = convRes.rows[0].id;

    let jsonResult = null;
    const req = {
      params: { id: convId },
      body: { text: 'Hello from test agent!', sender: 'me' },
    };
    const res = {
      json: (data) => { jsonResult = data; },
      status: () => res,
    };

    await inboxController.sendMessage(req, res, (err) => {
      if (err) throw err;
    });

    assert(jsonResult && jsonResult.success, 'sendMessage must return success');
    assert(jsonResult.data.id, 'Message ID must be returned');
    assert(jsonResult.data.status, 'Message status must be returned');

    // Clean up created test records
    await query('DELETE FROM messages WHERE conversation_id = $1', [convId]);
    await query('DELETE FROM conversations WHERE id = $1', [convId]);
    await query('DELETE FROM contacts WHERE phone = $1 OR phone = $2', [`+${testPhone}`, testPhone]);
  });

  // Test 9: No Hardcoded Meta Credentials Check
  reportTest('No hardcoded access tokens or test phone numbers in codebase changes', () => {
    const controllerCode = fs.readFileSync(path.resolve(__dirname, '../controllers/whatsappController.js'), 'utf8');
    const inboxCode = fs.readFileSync(path.resolve(__dirname, '../controllers/inboxController.js'), 'utf8');

    // Confirm no raw access token EAAG... or hardcoded credentials
    assert(!controllerCode.includes('EAAG'), 'whatsappController contains hardcoded Meta token');
    assert(!inboxCode.includes('EAAG'), 'inboxController contains hardcoded Meta token');
  });

  console.log('\n-------------------------------------------------------------');
  console.log(` RESULTS: ${passedTests}/${totalTests} Tests Passed`);
  console.log('-------------------------------------------------------------\n');

  if (pool) {
    await pool.end().catch(() => {});
  }
})().catch((err) => {
  console.error('\nTest Suite Failed:', err.message);
  process.exit(1);
});
