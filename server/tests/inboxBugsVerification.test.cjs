/**
 * ARCO Communication - Inbox Production Bug Verification Suite
 * Verifies:
 * BUG 1: Unread count clearing, persistence, idempotency, isolation across conversations.
 * BUG 2: Dynamic button reply, list reply, quick reply template button extraction vs [Message].
 * REGRESSION: Normal text chat handling.
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
  console.log(' RUNNING INBOX BUG FIXES & REGRESSION VERIFICATION SUITE');
  console.log('=============================================================\n');

  const { query } = await import('../config/db.js');
  const { inboxController } = await import('../controllers/inboxController.js');
  const { whatsappController, normalizeWhatsAppInboundMessage } = await import('../controllers/whatsappController.js');

  const testSuffix = Date.now().toString().slice(-6);
  const phoneA = `+9198111${testSuffix}`;
  const phoneB = `+9198222${testSuffix}`;

  try {
    // -------------------------------------------------------------------------
    // BUG 2: UNIT LEVEL NORMALIZATION TESTS
    // -------------------------------------------------------------------------
    await reportAsyncTest('Unit: normalizeWhatsAppInboundMessage extracts button_reply, list_reply, template buttons, and text', async () => {
      // 1. Template quick reply button
      const templateBtn = normalizeWhatsAppInboundMessage({
        type: 'button',
        button: { text: 'Book A Demo', payload: 'payload_demo' },
      });
      assert.strictEqual(templateBtn.text, 'Book A Demo', 'Template button text should be Book A Demo');
      assert.strictEqual(templateBtn.type, 'button_reply');
      assert.strictEqual(templateBtn.replyId, 'payload_demo');

      // 2. Interactive button reply
      const interBtn = normalizeWhatsAppInboundMessage({
        type: 'interactive',
        interactive: {
          type: 'button_reply',
          button_reply: { id: 'btn_consult', title: 'Schedule Consultation' },
        },
      });
      assert.strictEqual(interBtn.text, 'Schedule Consultation');
      assert.strictEqual(interBtn.type, 'button_reply');
      assert.strictEqual(interBtn.replyId, 'btn_consult');

      // 3. Interactive list reply
      const interList = normalizeWhatsAppInboundMessage({
        type: 'interactive',
        interactive: {
          type: 'list_reply',
          list_reply: { id: 'item_pro', title: 'Professional Plan' },
        },
      });
      assert.strictEqual(interList.text, 'Professional Plan');
      assert.strictEqual(interList.type, 'list_reply');
      assert.strictEqual(interList.replyId, 'item_pro');

      // 4. Dynamic custom button title (ensure no hardcoding)
      const dynamicBtn = normalizeWhatsAppInboundMessage({
        type: 'button',
        button: { text: `Order Status #ORD-${testSuffix}`, payload: 'ord_status' },
      });
      assert.strictEqual(dynamicBtn.text, `Order Status #ORD-${testSuffix}`);

      // 5. Normal text message
      const textMsg = normalizeWhatsAppInboundMessage({
        type: 'text',
        text: { body: 'Can someone call me?' },
      });
      assert.strictEqual(textMsg.text, 'Can someone call me?');
      assert.strictEqual(textMsg.type, 'text');
    });

    // -------------------------------------------------------------------------
    // BUG 2: END-TO-END WEBHOOK INGESTION TESTS (BUTTON REPLY DOES NOT BECOME [Message])
    // -------------------------------------------------------------------------
    await reportAsyncTest('E2E: Inbound WhatsApp template button "Book A Demo" stores button text instead of [Message]', async () => {
      const wamidBtn = `wamid.HBgTEST_BTN_${Date.now()}`;
      const mockReq = {
        body: {
          object: 'whatsapp_business_account',
          entry: [
            {
              id: 'WABA_TEST_ID',
              changes: [
                {
                  field: 'messages',
                  value: {
                    messaging_product: 'whatsapp',
                    metadata: { display_phone_number: '15550001234', phone_number_id: '1291678620701663' },
                    contacts: [{ profile: { name: 'Acroo Shopify Test Updated' }, wa_id: phoneA.replace('+', '') }],
                    messages: [
                      {
                        from: phoneA.replace('+', ''),
                        id: wamidBtn,
                        timestamp: Math.floor(Date.now() / 1000).toString(),
                        type: 'button',
                        button: {
                          text: 'Book A Demo',
                          payload: 'btn_book_demo',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      };

      const mockRes = {
        status: () => ({ send: () => {} }),
      };

      await whatsappController.handleWebhook(mockReq, mockRes);

      // Verify message table
      const msgRes = await query('SELECT * FROM messages WHERE meta_message_id = $1', [wamidBtn]);
      assert.strictEqual(msgRes.rows.length, 1, 'Message must be persisted');
      const msg = msgRes.rows[0];
      assert.strictEqual(msg.text, 'Book A Demo', 'Message text must be "Book A Demo", NOT "[Message]"');
      assert.notStrictEqual(msg.text, '[Message]', 'Message text must NOT be "[Message]"');
      assert.strictEqual(msg.message_type, 'button_reply', 'Message type should be button_reply');

      // Verify conversation has unread_count = 1
      const convRes = await query('SELECT * FROM conversations WHERE id = $1', [msg.conversation_id]);
      assert.strictEqual(convRes.rows.length, 1);
      assert.strictEqual(Number(convRes.rows[0].unread_count), 1);
    });

    await reportAsyncTest('E2E: Inbound WhatsApp interactive list reply stores list title instead of [Message]', async () => {
      const wamidList = `wamid.HBgTEST_LIST_${Date.now()}`;
      const mockReq = {
        body: {
          object: 'whatsapp_business_account',
          entry: [
            {
              id: 'WABA_TEST_ID',
              changes: [
                {
                  field: 'messages',
                  value: {
                    messaging_product: 'whatsapp',
                    metadata: { display_phone_number: '15550001234', phone_number_id: '1291678620701663' },
                    contacts: [{ profile: { name: 'Acroo Shopify Test Updated' }, wa_id: phoneA.replace('+', '') }],
                    messages: [
                      {
                        from: phoneA.replace('+', ''),
                        id: wamidList,
                        timestamp: Math.floor(Date.now() / 1000).toString(),
                        type: 'interactive',
                        interactive: {
                          type: 'list_reply',
                          list_reply: {
                            id: 'opt_enterprise',
                            title: 'Enterprise Custom Setup',
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      };

      const mockRes = {
        status: () => ({ send: () => {} }),
      };

      await whatsappController.handleWebhook(mockReq, mockRes);

      const msgRes = await query('SELECT * FROM messages WHERE meta_message_id = $1', [wamidList]);
      assert.strictEqual(msgRes.rows.length, 1);
      assert.strictEqual(msgRes.rows[0].text, 'Enterprise Custom Setup', 'Must store "Enterprise Custom Setup"');
      assert.strictEqual(msgRes.rows[0].message_type, 'list_reply');

      // Conversation unread_count incremented to 2
      const convRes = await query('SELECT * FROM conversations WHERE id = $1', [msgRes.rows[0].conversation_id]);
      assert.strictEqual(Number(convRes.rows[0].unread_count), 2, 'Unread count should be 2 after second inbound message');
    });

    // -------------------------------------------------------------------------
    // BUG 1: UNREAD STATE PERSISTENCE & ISOLATION TESTS
    // -------------------------------------------------------------------------
    let convAId = null;
    let convBId = null;

    await reportAsyncTest('Setup: Create Conversation B with an unread message to test multi-conversation isolation', async () => {
      // Find Conversation A's ID
      const convARes = await query(
        `SELECT id, unread_count FROM conversations WHERE phone = $1 OR phone LIKE '%' || $2 LIMIT 1`,
        [phoneA, phoneA.replace('+', '')]
      );
      assert.strictEqual(convARes.rows.length, 1);
      convAId = convARes.rows[0].id;
      assert.strictEqual(Number(convARes.rows[0].unread_count), 2, 'Conv A must have unread_count = 2');

      // Send inbound message for Phone B
      const wamidB = `wamid.HBgTEST_CONVB_${Date.now()}`;
      const mockReqB = {
        body: {
          object: 'whatsapp_business_account',
          entry: [
            {
              id: 'WABA_TEST_ID',
              changes: [
                {
                  field: 'messages',
                  value: {
                    messaging_product: 'whatsapp',
                    metadata: { display_phone_number: '15550001234', phone_number_id: '1291678620701663' },
                    contacts: [{ profile: { name: 'Customer B Isolated' }, wa_id: phoneB.replace('+', '') }],
                    messages: [
                      {
                        from: phoneB.replace('+', ''),
                        id: wamidB,
                        timestamp: Math.floor(Date.now() / 1000).toString(),
                        type: 'text',
                        text: { body: 'Inquiry from customer B' },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      };

      await whatsappController.handleWebhook(mockReqB, { status: () => ({ send: () => {} }) });

      const convBRes = await query(
        `SELECT id, unread_count FROM conversations WHERE phone = $1 OR phone LIKE '%' || $2 LIMIT 1`,
        [phoneB, phoneB.replace('+', '')]
      );
      assert.strictEqual(convBRes.rows.length, 1);
      convBId = convBRes.rows[0].id;
      assert.strictEqual(Number(convBRes.rows[0].unread_count), 1, 'Conv B must have unread_count = 1');
    });

    await reportAsyncTest('E2E: markAsRead sets unread_count = 0 for Conversation A and marks messages read', async () => {
      let responseData = null;
      const mockRes = {
        json: (payload) => {
          responseData = payload;
        },
      };

      await inboxController.markAsRead({ params: { id: convAId } }, mockRes, (err) => {
        if (err) throw err;
      });

      assert(responseData && responseData.success, 'markAsRead must return success: true');
      assert.strictEqual(responseData.data.unreadCount, 0);

      // Verify DB persistence of unread_count = 0 for Conversation A
      const checkA = await query('SELECT unread_count FROM conversations WHERE id = $1', [convAId]);
      assert.strictEqual(Number(checkA.rows[0].unread_count), 0, 'Conv A unread_count in DB must be 0');

      // Verify incoming messages for Conv A are updated to 'read'
      const checkMsgs = await query('SELECT status FROM messages WHERE conversation_id = $1 AND sender = $2', [
        convAId,
        'contact',
      ]);
      assert(checkMsgs.rows.length > 0);
      assert(checkMsgs.rows.every((m) => m.status === 'read'), 'All contact messages must be marked read');
    });

    await reportAsyncTest('Isolation: Conversation B unread_count remains untouched at 1', async () => {
      const checkB = await query('SELECT unread_count FROM conversations WHERE id = $1', [convBId]);
      assert.strictEqual(Number(checkB.rows[0].unread_count), 1, 'Conv B unread_count must still be 1');
    });

    await reportAsyncTest('Persistence: getConversations returns unreadCount: 0 after polling/refresh', async () => {
      let convsList = null;
      const mockRes = {
        json: (payload) => {
          convsList = payload.data;
        },
      };

      await inboxController.getConversations({ query: {} }, mockRes, (err) => {
        if (err) throw err;
      });

      const fetchedA = convsList.find((c) => c.id === convAId);
      assert(fetchedA, 'Conversation A must be in list');
      assert.strictEqual(Number(fetchedA.unreadCount), 0, 'Fetched Conversation A unreadCount must be 0');

      const fetchedB = convsList.find((c) => c.id === convBId);
      assert(fetchedB, 'Conversation B must be in list');
      assert.strictEqual(Number(fetchedB.unreadCount), 1, 'Fetched Conversation B unreadCount must still be 1');
    });

    await reportAsyncTest('Idempotency: Repeated markAsRead on already-read conversation does not fail or duplicate writes', async () => {
      let repeatData = null;
      const mockRes = {
        json: (payload) => {
          repeatData = payload;
        },
      };

      await inboxController.markAsRead({ params: { id: convAId } }, mockRes, (err) => {
        if (err) throw err;
      });

      assert(repeatData && repeatData.success, 'Repeated call must succeed');
      assert.strictEqual(repeatData.data.alreadyRead, true, 'Should indicate alreadyRead: true without extra DB write');
      assert.strictEqual(repeatData.data.unreadCount, 0);
    });

    await reportAsyncTest('markAsRead returns 404 for nonexistent conversation ID', async () => {
      let errStatusCode = null;
      let errPayload = null;
      const mockRes = {
        status: (code) => {
          errStatusCode = code;
          return {
            json: (payload) => {
              errPayload = payload;
            },
          };
        },
      };

      await inboxController.markAsRead({ params: { id: 'cnv_nonexistent_999999' } }, mockRes, () => {});
      assert.strictEqual(errStatusCode, 404, 'Nonexistent conversation should return 404');
      assert.strictEqual(errPayload?.success, false);
    });

    // -------------------------------------------------------------------------
    // REGRESSION: NORMAL TEXT CHAT
    // -------------------------------------------------------------------------
    await reportAsyncTest('Regression: Normal text message continues to be stored and rendered correctly', async () => {
      const wamidText = `wamid.HBgTEST_NORMAL_TEXT_${Date.now()}`;
      const normalBody = 'Hello, can you send the product catalog?';

      const mockReq = {
        body: {
          object: 'whatsapp_business_account',
          entry: [
            {
              id: 'WABA_TEST_ID',
              changes: [
                {
                  field: 'messages',
                  value: {
                    messaging_product: 'whatsapp',
                    metadata: { display_phone_number: '15550001234', phone_number_id: '1291678620701663' },
                    contacts: [{ profile: { name: 'Normal User' }, wa_id: phoneA.replace('+', '') }],
                    messages: [
                      {
                        from: phoneA.replace('+', ''),
                        id: wamidText,
                        timestamp: Math.floor(Date.now() / 1000).toString(),
                        type: 'text',
                        text: { body: normalBody },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      };

      await whatsappController.handleWebhook(mockReq, { status: () => ({ send: () => {} }) });

      const textMsgRes = await query('SELECT * FROM messages WHERE meta_message_id = $1', [wamidText]);
      assert.strictEqual(textMsgRes.rows.length, 1);
      assert.strictEqual(textMsgRes.rows[0].text, normalBody);
      assert.strictEqual(textMsgRes.rows[0].message_type, 'text');
    });

    console.log(`\n-------------------------------------------------------------`);
    console.log(` RESULTS: ${passedTests}/${totalTests} Tests Passed`);
    console.log(`-------------------------------------------------------------\n`);
  } finally {
    // Teardown test conversations and messages
    try {
      await query(
        `DELETE FROM messages WHERE conversation_id IN (
           SELECT id FROM conversations WHERE phone IN ($1, $2)
         )`,
        [phoneA, phoneB]
      );
      await query(`DELETE FROM conversations WHERE phone IN ($1, $2)`, [phoneA, phoneB]);
      await query(`DELETE FROM contacts WHERE phone IN ($1, $2)`, [phoneA, phoneB]);
    } catch (cleanupErr) {
      console.warn('Test cleanup warning:', cleanupErr.message);
    }
    process.exit(passedTests === totalTests ? 0 : 1);
  }
})();
