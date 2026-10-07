/**
 * ARCO Communication - Phase 1: Instagram Connect & Unified Inbox Verification Suite
 * Tests Instagram integration schema, webhook handshake, inbound DM ingestion,
 * conversation channel isolation, deduplication, and outbound DM dispatch.
 */

const assert = require('assert');
const path = require('path');

try {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
} catch (e) {}

let passedTests = 0;
let totalTests = 0;

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
  console.log(' RUNNING PHASE 1: INSTAGRAM CONNECT & UNIFIED INBOX TESTS');
  console.log('=============================================================\n');

  const { initInstagramTable } = await import('../config/initInstagramTable.js');
  const { metaInstagramService } = await import('../services/metaInstagramService.js');
  const { instagramController } = await import('../controllers/instagramController.js');
  const { inboxController } = await import('../controllers/inboxController.js');
  const { query, pool } = await import('../config/db.js');

  const TEST_USER_ID = 'usr_test_ig_' + Date.now();
  const TEST_PAGE_ID = 'page_ig_' + Date.now();
  const TEST_IG_ACCOUNT_ID = 'ig_acc_' + Date.now();
  const TEST_SENDER_IGSID = 'igsid_customer_' + Date.now();
  const TEST_MID = 'm_mid_ig_' + Date.now();

  try {
    // Test 1: Verify Table Initialization
    await reportAsyncTest('initInstagramTable creates instagram_integrations table', async () => {
      const ok = await initInstagramTable();
      assert.strictEqual(ok, true, 'initInstagramTable should return true');

      const cols = await query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'instagram_integrations'
      `);
      const colNames = cols.rows.map((r) => r.column_name);
      assert.ok(colNames.includes('user_id'), 'Table should have user_id');
      assert.ok(colNames.includes('page_id'), 'Table should have page_id');
      assert.ok(colNames.includes('page_access_token'), 'Table should have page_access_token');
      assert.ok(colNames.includes('instagram_business_account_id'), 'Table should have instagram_business_account_id');
      assert.ok(colNames.includes('instagram_username'), 'Table should have instagram_username');
      assert.ok(colNames.includes('status'), 'Table should have status');
    });

    // Test 2: Webhook Handshake Verification (hub.verify_token)
    await reportAsyncTest('verifyWebhook returns challenge on correct token and rejects invalid token', async () => {
      let challengeSent = null;
      let statusSent = null;

      const mockResValid = {
        status: (code) => {
          statusSent = code;
          return {
            send: (val) => {
              challengeSent = val;
            },
          };
        },
      };

      const validReq = {
        query: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'arco_meta_webhook_verify_secret_token',
          'hub.challenge': 'test_challenge_12345',
        },
      };

      instagramController.verifyWebhook(validReq, mockResValid);
      assert.strictEqual(statusSent, 200, 'Handshake should return HTTP 200');
      assert.strictEqual(challengeSent, 'test_challenge_12345', 'Handshake should return challenge string');

      // Invalid token
      let invalidStatus = null;
      const mockResInvalid = {
        status: (code) => {
          invalidStatus = code;
          return {
            send: () => {},
          };
        },
      };
      const invalidReq = {
        query: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'wrong_token',
          'hub.challenge': 'xyz',
        },
      };
      instagramController.verifyWebhook(invalidReq, mockResInvalid);
      assert.strictEqual(invalidStatus, 403, 'Invalid token should be rejected with HTTP 403');
    });

    // Test 3: Connect Direct & Credentials Retrieval
    await reportAsyncTest('connectDirect securely stores credentials and getCredentials retrieves them', async () => {
      const res = await metaInstagramService.connectDirect({
        pageId: TEST_PAGE_ID,
        pageName: 'ARCO Official Page',
        pageAccessToken: 'EAAG_test_mock_page_token_12345',
        igAccountId: TEST_IG_ACCOUNT_ID,
        igUsername: 'arco_test_store',
        userId: TEST_USER_ID,
      });

      assert.strictEqual(res.success, true, 'Direct connect should succeed');
      assert.strictEqual(res.data.instagramBusinessAccountId, TEST_IG_ACCOUNT_ID);
      assert.strictEqual(res.data.instagramUsername, 'arco_test_store');

      const creds = await metaInstagramService.getCredentials(TEST_USER_ID);
      assert.ok(creds, 'Credentials should be retrieved');
      assert.strictEqual(creds.pageId, TEST_PAGE_ID);
      assert.strictEqual(creds.igAccountId, TEST_IG_ACCOUNT_ID);
      assert.strictEqual(creds.pageAccessToken, 'EAAG_test_mock_page_token_12345');
      assert.strictEqual(creds.status, 'connected');
    });

    // Test 4: Inbound Instagram DM Webhook Ingestion
    await reportAsyncTest('handleWebhook ingests inbound DM and creates conversation with channel=instagram', async () => {
      const mockWebhookPayload = {
        object: 'instagram',
        entry: [
          {
            id: TEST_IG_ACCOUNT_ID,
            time: Date.now(),
            messaging: [
              {
                sender: { id: TEST_SENDER_IGSID },
                recipient: { id: TEST_IG_ACCOUNT_ID },
                timestamp: Date.now(),
                message: {
                  mid: TEST_MID,
                  text: 'Hi! Is this available in store?',
                },
              },
            ],
          },
        ],
      };

      const mockReq = { body: mockWebhookPayload };
      const mockRes = {
        status: () => ({ send: () => {} }),
      };

      await instagramController.handleWebhook(mockReq, mockRes);

      // Verify conversation exists with channel = 'instagram'
      const convRes = await query(
        `SELECT * FROM conversations WHERE phone = $1 AND channel = 'instagram'`,
        [TEST_SENDER_IGSID]
      );
      assert.strictEqual(convRes.rows.length, 1, 'Instagram conversation should be created');
      const conv = convRes.rows[0];
      assert.strictEqual(conv.channel, 'instagram', 'Channel should be instagram');
      assert.strictEqual(conv.reply_status, 'unreplied');
      assert.strictEqual(conv.unread_count, 1);

      // Verify message inserted with meta_message_id
      const msgRes = await query(
        `SELECT * FROM messages WHERE conversation_id = $1 AND meta_message_id = $2`,
        [conv.id, TEST_MID]
      );
      assert.strictEqual(msgRes.rows.length, 1, 'Inbound message should be stored');
      assert.strictEqual(msgRes.rows[0].text, 'Hi! Is this available in store?');
      assert.strictEqual(msgRes.rows[0].status, 'delivered');
      assert.strictEqual(msgRes.rows[0].sender, 'them');
    });

    // Test 5: Message Deduplication
    await reportAsyncTest('handleWebhook deduplicates identical inbound message by meta_message_id', async () => {
      const dupPayload = {
        object: 'instagram',
        entry: [
          {
            id: TEST_IG_ACCOUNT_ID,
            messaging: [
              {
                sender: { id: TEST_SENDER_IGSID },
                recipient: { id: TEST_IG_ACCOUNT_ID },
                timestamp: Date.now(),
                message: {
                  mid: TEST_MID, // Same mid
                  text: 'Hi! Is this available in store?',
                },
              },
            ],
          },
        ],
      };

      await instagramController.handleWebhook({ body: dupPayload }, { status: () => ({ send: () => {} }) });

      const countRes = await query(
        `SELECT COUNT(*) FROM messages WHERE meta_message_id = $1`,
        [TEST_MID]
      );
      assert.strictEqual(parseInt(countRes.rows[0].count, 10), 1, 'Should NOT create duplicate message');
    });

    // Test 6: Unified Inbox Channel Filtering
    await reportAsyncTest('inboxController.getConversations filters accurately by channel=instagram and channel=whatsapp', async () => {
      let igFound = false;
      let waFound = false;

      // 1. Channel = instagram
      const mockReqIg = {
        query: { channel: 'instagram' },
        user: { id: TEST_USER_ID },
      };
      const mockResIg = {
        json: (res) => {
          assert.strictEqual(res.success, true);
          igFound = res.data.some((c) => c.phone === TEST_SENDER_IGSID && c.channel === 'instagram');
          assert.ok(res.data.every((c) => c.channel === 'instagram'), 'All returned must be instagram channel');
        },
      };
      await inboxController.getConversations(mockReqIg, mockResIg, (e) => { throw e; });
      assert.strictEqual(igFound, true, 'Instagram conversation must be returned under channel=instagram');

      // 2. Channel = whatsapp
      const mockReqWa = {
        query: { channel: 'whatsapp' },
        user: { id: TEST_USER_ID },
      };
      const mockResWa = {
        json: (res) => {
          assert.strictEqual(res.success, true);
          const hasIg = res.data.some((c) => c.phone === TEST_SENDER_IGSID);
          assert.strictEqual(hasIg, false, 'Instagram conversation must NOT be returned under channel=whatsapp');
        },
      };
      await inboxController.getConversations(mockReqWa, mockResWa, (e) => { throw e; });
    });

    // Test 7: Outbound Agent Reply on Instagram Conversation
    await reportAsyncTest('inboxController.sendMessage dispatches reply on Instagram conversation', async () => {
      const convRes = await query(
        `SELECT * FROM conversations WHERE phone = $1 AND channel = 'instagram'`,
        [TEST_SENDER_IGSID]
      );
      assert.strictEqual(convRes.rows.length, 1);
      const conv = convRes.rows[0];

      let jsonSent = null;
      const sendReq = {
        params: { id: conv.id },
        body: {
          text: 'Yes! We have it in stock at our warehouse.',
          sender: 'me',
        },
        user: { id: TEST_USER_ID, name: 'Support Agent' },
      };
      const sendRes = {
        json: (data) => {
          jsonSent = data;
        },
        status: (code) => ({
          json: (err) => {
            jsonSent = { status: code, ...err };
          },
        }),
      };

      await inboxController.sendMessage(sendReq, sendRes, (e) => { throw e; });
      assert.ok(jsonSent, 'Response must be returned');
      assert.strictEqual(jsonSent.success, true, 'sendMessage should succeed');
      assert.strictEqual(jsonSent.data.sender, 'me');
      assert.strictEqual(jsonSent.data.text, 'Yes! We have it in stock at our warehouse.');

      // Check conversation updated
      const updatedConv = await query('SELECT * FROM conversations WHERE id = $1', [conv.id]);
      assert.strictEqual(updatedConv.rows[0].reply_status, 'replied_manually');
    });

    // Clean up test records
    await query(`DELETE FROM messages WHERE meta_message_id = $1`, [TEST_MID]);
    await query(`DELETE FROM conversations WHERE phone = $1`, [TEST_SENDER_IGSID]);
    await query(`DELETE FROM contacts WHERE phone = $1`, [TEST_SENDER_IGSID]);
    await query(`DELETE FROM instagram_integrations WHERE user_id = $1`, [TEST_USER_ID]);

    console.log(`\n=============================================================`);
    console.log(` ALL ${passedTests}/${totalTests} INSTAGRAM PHASE 1 TESTS PASSED SUCCESSFULLY!`);
    console.log(`=============================================================\n`);

    if (pool) await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('\nTest Suite Failed with error:', err);
    if (pool) await pool.end();
    process.exit(1);
  }
})();
