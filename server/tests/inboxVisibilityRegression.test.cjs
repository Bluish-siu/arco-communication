/**
 * End-to-End Regression Verification Suite for ARCO Inbox Sync & Message Visibility
 * Verifies:
 * 1. Template quick-reply "Book A Demo" button extraction (never [Message]).
 * 2. Normal text message arriving AFTER campaign button reply in the SAME conversation.
 * 3. Conversation preview showing actual message text rather than [Message].
 * 4. Batched multi-entry webhook delivery handling (body.entry[0] + body.entry[1]).
 * 5. Space-formatted phone number matching (+91 93114 31032 vs 919311431032).
 * 6. Unsupported Meta payload extraction (returns descriptive error title, not [Message]).
 * 7. Reaction & sticker normalization.
 * 8. Meta WhatsApp Flow (nfm_reply) submission remains intact and functional.
 */

const assert = require('assert');
const { query } = require('../config/db.js');
const { whatsappController, normalizeWhatsAppInboundMessage } = require('../controllers/whatsappController.js');
const { inboxController } = require('../controllers/inboxController.js');

function mockRes() {
  const res = {
    statusCode: 200,
    headersSent: false,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      this.headersSent = true;
      return this;
    },
    send(data) {
      this.body = data;
      this.headersSent = true;
      return this;
    },
  };
  return res;
}

async function reportTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

async function runSuite() {
  console.log('\n=============================================================');
  console.log(' RUNNING INBOX VISIBILITY & MULTI-MESSAGE REGRESSION SUITE');
  console.log('=============================================================\n');

  const testPhone = '919311431032';
  const testPhoneWithPlus = '+919311431032';
  const testPhoneFormatted = '+91 93114 31032';

  // Cleanup past test data
  await query("DELETE FROM messages WHERE meta_message_id LIKE 'wamid.HBgREG_%'");
  await query("DELETE FROM conversations WHERE phone IN ($1, $2, $3)", [testPhone, testPhoneWithPlus, testPhoneFormatted]);
  await query("DELETE FROM contacts WHERE phone IN ($1, $2, $3)", [testPhone, testPhoneWithPlus, testPhoneFormatted]);

  // Test 1: Unit normalization for all types
  await reportTest('1. Unit: normalizeWhatsAppInboundMessage never defaults valid messages to raw "[Message]"', () => {
    // Quick reply button
    const btnNorm = normalizeWhatsAppInboundMessage({
      type: 'button',
      button: { text: 'Book A  Demo', payload: 'Book A  Demo' },
    });
    assert.strictEqual(btnNorm.text, 'Book A  Demo');
    assert.strictEqual(btnNorm.type, 'button_reply');

    // Quick reply with string button
    const strBtnNorm = normalizeWhatsAppInboundMessage({
      type: 'button',
      button: 'Book A Demo String',
    });
    assert.strictEqual(strBtnNorm.text, 'Book A Demo String');

    // Reaction
    const reactNorm = normalizeWhatsAppInboundMessage({
      type: 'reaction',
      reaction: { emoji: '👍', message_id: 'wamid_123' },
    });
    assert.strictEqual(reactNorm.text, 'Reacted 👍');
    assert.strictEqual(reactNorm.type, 'reaction');

    // Sticker
    const stickerNorm = normalizeWhatsAppInboundMessage({
      type: 'sticker',
      sticker: { id: 'stk_1' },
    });
    assert.strictEqual(stickerNorm.text, '[Sticker]');
    assert.strictEqual(stickerNorm.type, 'sticker');

    // Meta unsupported with error
    const unsupNorm = normalizeWhatsAppInboundMessage({
      type: 'unsupported',
      errors: [{ code: 131051, title: 'Message type unknown', message: 'Not supported' }],
    });
    assert.strictEqual(unsupNorm.text, '[Message type unknown]');
    assert.strictEqual(unsupNorm.type, 'unsupported');

    // Flow submission
    const flowNorm = normalizeWhatsAppInboundMessage({
      type: 'interactive',
      interactive: {
        type: 'nfm_reply',
        nfm_reply: {
          response_json: JSON.stringify({ flow_token: 'tok_1', screen: 'APPOINTMENT', time: '10:00 AM' }),
        },
      },
    });
    assert.ok(flowNorm.text.includes('Flow Submission (APPOINTMENT)'));
    assert.ok(flowNorm.text.includes('time: 10:00 AM'));
    assert.strictEqual(flowNorm.type, 'nfm_reply');
  });

  // Test 2: Inbound Campaign "Book A Demo" interaction persistence
  let createdConvId = null;
  await reportTest('2. E2E: Inbound Campaign button "Book A  Demo" creates conversation and stores actual text', async () => {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WABA_TEST_ID',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                contacts: [{ profile: { name: 'Dr. Rahul Mehta' }, wa_id: testPhone }],
                messages: [
                  {
                    from: testPhone,
                    id: 'wamid.HBgREG_BTN_001',
                    timestamp: String(Math.floor(Date.now() / 1000)),
                    type: 'button',
                    button: { text: 'Book A  Demo', payload: 'Book A  Demo' },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const res = mockRes();
    await whatsappController.handleWebhook({ body: payload }, res);
    assert.strictEqual(res.statusCode, 200);

    const msgRes = await query('SELECT * FROM messages WHERE meta_message_id = $1', ['wamid.HBgREG_BTN_001']);
    assert.strictEqual(msgRes.rows.length, 1);
    assert.strictEqual(msgRes.rows[0].text, 'Book A  Demo');
    assert.strictEqual(msgRes.rows[0].message_type, 'button_reply');
    assert.notStrictEqual(msgRes.rows[0].text, '[Message]');

    createdConvId = msgRes.rows[0].conversation_id;
    assert.ok(createdConvId);
  });

  // Test 3: Normal text message sent afterward lands in the SAME conversation
  await reportTest('3. E2E: Subsequent normal text message sent afterward is appended to the SAME conversation', async () => {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WABA_TEST_ID',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                contacts: [{ profile: { name: 'Dr. Rahul Mehta' }, wa_id: testPhone }],
                messages: [
                  {
                    from: testPhone,
                    id: 'wamid.HBgREG_TEXT_002',
                    timestamp: String(Math.floor(Date.now() / 1000) + 10),
                    type: 'text',
                    text: { body: 'When can your executive visit our clinic?' },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const res = mockRes();
    await whatsappController.handleWebhook({ body: payload }, res);
    assert.strictEqual(res.statusCode, 200);

    const msgRes = await query('SELECT * FROM messages WHERE meta_message_id = $1', ['wamid.HBgREG_TEXT_002']);
    assert.strictEqual(msgRes.rows.length, 1);
    assert.strictEqual(msgRes.rows[0].text, 'When can your executive visit our clinic?');
    assert.strictEqual(msgRes.rows[0].conversation_id, createdConvId, 'Must be linked to the same conversation ID');
  });

  // Test 4: Inbox API returns complete message history and latest message preview
  await reportTest('4. API: GET /api/inbox/conversations and :id return complete message history with actual bodies', async () => {
    // 1. Check getConversations
    const listReq = { query: { status: 'open' }, user: { id: 'usr_1' } };
    const listRes = mockRes();
    await inboxController.getConversations(listReq, listRes);
    assert.strictEqual(listRes.statusCode, 200);

    const conv = listRes.body.data.find((c) => c.id === createdConvId);
    assert.ok(conv, 'Conversation must be in list');
    assert.strictEqual(conv.messages.length, 2, 'Conversation must have both messages');

    const lastMsg = conv.messages[conv.messages.length - 1];
    assert.strictEqual(lastMsg.text, 'When can your executive visit our clinic?', 'Latest message must be actual text');
    assert.notStrictEqual(lastMsg.text, '[Message]');

    // 2. Check getConversationById
    const detailReq = { params: { id: createdConvId }, user: { id: 'usr_1' } };
    const detailRes = mockRes();
    await inboxController.getConversationById(detailReq, detailRes);
    assert.strictEqual(detailRes.statusCode, 200);

    const messages = detailRes.body.data.messages;
    assert.strictEqual(messages.length, 2);
    assert.strictEqual(messages[0].text, 'Book A  Demo');
    assert.strictEqual(messages[0].messageType, 'button_reply');
    assert.strictEqual(messages[1].text, 'When can your executive visit our clinic?');
    assert.strictEqual(messages[1].messageType, 'text');
  });

  // Test 5: Batched multi-entry webhook delivery handling (body.entry[0] + body.entry[1])
  await reportTest('5. E2E: Batched multi-entry webhook delivery ingests messages across all entries', async () => {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'ENTRY_0',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                messages: [
                  {
                    from: testPhone,
                    id: 'wamid.HBgREG_BATCH_003',
                    timestamp: String(Math.floor(Date.now() / 1000) + 20),
                    type: 'text',
                    text: { body: 'First message in batch entry 0' },
                  },
                ],
              },
            },
          ],
        },
        {
          id: 'ENTRY_1',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                messages: [
                  {
                    from: testPhone,
                    id: 'wamid.HBgREG_BATCH_004',
                    timestamp: String(Math.floor(Date.now() / 1000) + 25),
                    type: 'text',
                    text: { body: 'Second message in batch entry 1' },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const res = mockRes();
    await whatsappController.handleWebhook({ body: payload }, res);
    assert.strictEqual(res.statusCode, 200);

    const m3 = await query('SELECT * FROM messages WHERE meta_message_id = $1', ['wamid.HBgREG_BATCH_003']);
    assert.strictEqual(m3.rows.length, 1, 'Entry 0 message must exist');
    assert.strictEqual(m3.rows[0].text, 'First message in batch entry 0');

    const m4 = await query('SELECT * FROM messages WHERE meta_message_id = $1', ['wamid.HBgREG_BATCH_004']);
    assert.strictEqual(m4.rows.length, 1, 'Entry 1 message must NOT be dropped');
    assert.strictEqual(m4.rows[0].text, 'Second message in batch entry 1');
  });

  // Test 6: Space-formatted phone number matches existing conversation
  await reportTest('6. E2E: Space-formatted phone numbers match existing conversation seamlessly', async () => {
    // Manually format conversation phone with spaces
    await query("UPDATE conversations SET phone = '+91 93114 31032' WHERE id = $1", [createdConvId]);

    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WABA_TEST_ID',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                messages: [
                  {
                    from: '919311431032', // raw digits without spaces
                    id: 'wamid.HBgREG_SPACE_MATCH_005',
                    timestamp: String(Math.floor(Date.now() / 1000) + 30),
                    type: 'text',
                    text: { body: 'Matching spaced phone test' },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const res = mockRes();
    await whatsappController.handleWebhook({ body: payload }, res);
    assert.strictEqual(res.statusCode, 200);

    const msg = await query('SELECT * FROM messages WHERE meta_message_id = $1', ['wamid.HBgREG_SPACE_MATCH_005']);
    assert.strictEqual(msg.rows.length, 1);
    assert.strictEqual(msg.rows[0].conversation_id, createdConvId, 'Must resolve to existing spaced conversation');
  });

  // Cleanup test data
  await query("DELETE FROM messages WHERE meta_message_id LIKE 'wamid.HBgREG_%'");
  await query("DELETE FROM conversations WHERE phone IN ($1, $2, $3)", [testPhone, testPhoneWithPlus, testPhoneFormatted]);
  await query("DELETE FROM contacts WHERE phone IN ($1, $2, $3)", [testPhone, testPhoneWithPlus, testPhoneFormatted]);

  console.log('\n-------------------------------------------------------------');
  console.log(' ALL 6 REGRESSION SCENARIOS VERIFIED SUCCESSFULLY!');
  console.log('-------------------------------------------------------------\n');
  process.exit(0);
}

runSuite().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
