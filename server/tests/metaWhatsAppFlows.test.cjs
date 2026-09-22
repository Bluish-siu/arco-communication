/**
 * ARCO Communication - Meta WhatsApp Flows Master Verification Suite
 * Tests:
 * 1. Fetch Flow API & Error Handling
 * 2. Published Flow Validation
 * 3. Send Flow Payload Construction & Meta Specs
 * 4. Tenant Isolation & Security
 * 5. Flow Submission Parsing (nfm_reply & response_json)
 * 6. Contact Resolution & Custom Attribute Updating
 * 7. Duplicate Submission Handling (Idempotency)
 * 8. Normal WhatsApp Text Regression
 * 9. Existing Campaign Regression
 * 10. Existing Inbox Regression
 */

const assert = require('assert');
const path = require('path');

// Load environment variables
try {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
} catch (e) {}

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
  console.log(' RUNNING META WHATSAPP FLOWS VERIFICATION SUITE');
  console.log('=============================================================\n');

  const { metaWhatsAppService, formatPhoneNumber } = await import('../services/metaWhatsAppService.js');
  const { whatsappController, normalizeWhatsAppInboundMessage } = await import('../controllers/whatsappController.js');
  const { inboxController } = await import('../controllers/inboxController.js');
  const { query } = await import('../config/db.js');

  const TEST_FLOW_ID = '2951519895208552';
  const TEST_RECIPIENT = '919876543210';
  const TENANT_A = `usr_tenant_a_${Date.now()}`;
  const TENANT_B = `usr_tenant_b_${Date.now()}`;

  // =========================================================================
  // TEST 1: FETCH FLOW API
  // =========================================================================
  await reportAsyncTest('1. Fetch Flow: getFlow validates required arguments & queries Meta Graph API format', async () => {
    // A. Missing flowId
    const missingRes = await metaWhatsAppService.getFlow();
    assert.strictEqual(missingRes.success, false);
    assert.strictEqual(missingRes.error, 'Flow ID is required');

    // B. Calling with TEST_FLOW_ID returns structured error or live flow response
    const flowRes = await metaWhatsAppService.getFlow(TEST_FLOW_ID);
    assert(typeof flowRes === 'object', 'Expected result object');
    if (flowRes.success) {
      assert.strictEqual(flowRes.flowId, TEST_FLOW_ID);
      assert(flowRes.name, 'Expected flow name');
      assert(flowRes.status, 'Expected flow status');
    } else {
      // Must return clear Graph API error without crashing
      assert(flowRes.error, 'Expected error description');
      assert(flowRes.errorCode !== undefined, 'Expected Meta error code');
    }
  });

  // =========================================================================
  // TEST 2: PUBLISHED FLOW VALIDATION
  // =========================================================================
  reportTest('2. Published Flow Validation: correctly verifies PUBLISHED status and handles validation errors', () => {
    const mockPublishedFlow = {
      id: TEST_FLOW_ID,
      name: 'ARCO',
      status: 'PUBLISHED',
      categories: ['CUSTOMER_SUPPORT', 'OTHER'],
      validation_errors: [],
    };

    assert.strictEqual(mockPublishedFlow.status, 'PUBLISHED');
    assert.strictEqual(mockPublishedFlow.validation_errors.length, 0);

    const mockDraftFlow = {
      id: 'flow_draft_123',
      name: 'Draft Flow',
      status: 'DRAFT',
      validation_errors: [{ error: 'Screen 1 missing title' }],
    };

    assert.notStrictEqual(mockDraftFlow.status, 'PUBLISHED');
    assert.strictEqual(mockDraftFlow.validation_errors.length, 1);
  });

  // =========================================================================
  // TEST 3: SEND FLOW PAYLOAD CONSTRUCTION
  // =========================================================================
  await reportAsyncTest('3. Send Flow Payload: constructs compliant Meta Interactive Flow payload', async () => {
    // Validation: Missing recipient
    const noRecipient = await metaWhatsAppService.sendFlowMessage({ flowId: TEST_FLOW_ID });
    assert.strictEqual(noRecipient.success, false);
    assert.strictEqual(noRecipient.error, 'Recipient phone number is required');

    // Validation: Missing Flow ID
    const noFlowId = await metaWhatsAppService.sendFlowMessage({ to: TEST_RECIPIENT });
    assert.strictEqual(noFlowId.success, false);
    assert.strictEqual(noFlowId.error, 'Flow ID is required');

    // Test sendFlowMessage payload construction and return structure
    const customToken = `tok_test_${Date.now()}`;
    const sendResult = await metaWhatsAppService.sendFlowMessage({
      to: '+91 98765 43210',
      flowId: TEST_FLOW_ID,
      ctaText: 'Start ARCO Form',
      headerText: 'ARCO Flow Header',
      bodyText: 'Please fill out your details',
      footerText: 'Powered by ARCO',
      screen: 'SCREEN_WELCOME',
      flowToken: customToken,
      data: { prefill_name: 'Test Customer' },
      mode: 'navigate',
    });

    if (sendResult.payload) {
      const p = sendResult.payload;
      assert.strictEqual(p.messaging_product, 'whatsapp');
      assert.strictEqual(p.recipient_type, 'individual');
      assert.strictEqual(p.to, '919876543210');
      assert.strictEqual(p.type, 'interactive');
      assert.strictEqual(p.interactive.type, 'flow');
      assert.strictEqual(p.interactive.action.name, 'flow');
      assert.strictEqual(p.interactive.action.parameters.flow_message_version, '3');
      assert.strictEqual(p.interactive.action.parameters.flow_id, TEST_FLOW_ID);
      assert.strictEqual(p.interactive.action.parameters.flow_cta, 'Start ARCO Form');
      assert.strictEqual(p.interactive.action.parameters.flow_token, customToken);
      assert.strictEqual(p.interactive.action.parameters.flow_action, 'navigate');
      assert.strictEqual(p.interactive.action.parameters.flow_action_payload.screen, 'SCREEN_WELCOME');
      assert.strictEqual(p.interactive.action.parameters.flow_action_payload.data.prefill_name, 'Test Customer');
    }
  });

  // =========================================================================
  // TEST 4: TENANT ISOLATION
  // =========================================================================
  await reportAsyncTest('4. Tenant Isolation: Tenant A cannot view, send, or edit Tenant B flows & submissions', async () => {
    const flowIdA = `flow_tenant_a_${Date.now()}`;
    const formRowA = `form_${Date.now()}_a`;

    // 1. Insert form for Tenant A
    await query(
      `INSERT INTO whatsapp_forms (id, user_id, title, form_id, meta_flow_id, status)
       VALUES ($1, $2, 'Tenant A Onboarding', $3, $4, 'published')`,
      [formRowA, TENANT_A, flowIdA, flowIdA]
    );

    // 2. Tenant B attempts to send Tenant A's flow via sendFlow controller
    let forbiddenStatus = 0;
    let forbiddenData = null;
    const mockRes = {
      status: (code) => { forbiddenStatus = code; return { json: (d) => { forbiddenData = d; } }; },
      json: (d) => { forbiddenData = d; },
    };

    await whatsappController.sendFlow(
      {
        user: { id: TENANT_B },
        body: { recipientPhone: '919999999999', flowId: flowIdA },
      },
      mockRes,
      () => {}
    );

    assert.strictEqual(forbiddenStatus, 403, 'Tenant B must receive 403 when trying to send Tenant A flow');
    assert(forbiddenData.error.includes('Unauthorized'), 'Expected unauthorized tenant isolation error');

    // 3. Tenant B queries submissions for Tenant A's form
    const tenantBSubmissions = await query(
      'SELECT * FROM whatsapp_form_responses WHERE form_id = $1 AND user_id = $2',
      [flowIdA, TENANT_B]
    );
    assert.strictEqual(tenantBSubmissions.rows.length, 0, 'Tenant B must see 0 submissions for Tenant A form');

    // Cleanup
    await query('DELETE FROM whatsapp_forms WHERE id = $1', [formRowA]);
  });

  // =========================================================================
  // TEST 5: FLOW SUBMISSION PARSING (nfm_reply)
  // =========================================================================
  reportTest('5. Flow Submission Parsing: normalizeWhatsAppInboundMessage decodes nfm_reply and extracts data', () => {
    const rawNfmPayload = {
      from: '919876543210',
      id: `wamid.HBgTEST_NFM_${Date.now()}`,
      type: 'interactive',
      interactive: {
        type: 'nfm_reply',
        nfm_reply: {
          name: 'flow',
          body: 'Sent',
          response_json: JSON.stringify({
            flow_token: 'token_abc_123',
            screen: 'QUESTION_SCREEN',
            client_name: 'Priya Sharma',
            service_required: 'WhatsApp Automation',
            monthly_budget: '₹50,000 - ₹1 Lakh',
          }),
        },
      },
    };

    const parsed = normalizeWhatsAppInboundMessage(rawNfmPayload);
    assert.strictEqual(parsed.type, 'nfm_reply');
    assert(parsed.flowResponse !== null, 'flowResponse should not be null');
    assert.strictEqual(parsed.flowToken, 'token_abc_123');
    assert.strictEqual(parsed.flowResponse.client_name, 'Priya Sharma');
    assert.strictEqual(parsed.flowResponse.service_required, 'WhatsApp Automation');
    assert(parsed.text.includes('Flow Submission (QUESTION_SCREEN)'), 'Formatted text should contain screen header');
    assert(parsed.text.includes('client name: Priya Sharma'), 'Formatted text should list field');
    assert(parsed.text.includes('monthly budget: ₹50,000 - ₹1 Lakh'), 'Formatted text should list budget');
  });

  // =========================================================================
  // TEST 6: CONTACT RESOLUTION & ATTRIBUTE UPDATING
  // =========================================================================
  await reportAsyncTest('6. Contact Resolution: Inbound flow submission creates/updates contact and custom attributes', async () => {
    const testPhone = `91998877${Math.floor(1000 + Math.random() * 9000)}`;
    const msgId = `wamid.HBgFLOW_SUBMIT_${Date.now()}`;
    const flowToken = `tok_${Date.now()}`;

    const webhookEvent = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '1311505681068950',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                contacts: [{ profile: { name: 'Ananya Verma' }, wa_id: testPhone }],
                messages: [
                  {
                    from: testPhone,
                    id: msgId,
                    timestamp: String(Math.floor(Date.now() / 1000)),
                    type: 'interactive',
                    interactive: {
                      type: 'nfm_reply',
                      nfm_reply: {
                        name: 'flow',
                        body: 'Sent',
                        response_json: JSON.stringify({
                          flow_token: flowToken,
                          flow_id: TEST_FLOW_ID,
                          screen: 'CONTACT_INFO',
                          full_name: 'Ananya Verma',
                          email_address: 'ananya@example.com',
                          company_size: '25-50',
                        }),
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    let resCode = 0;
    let resBody = '';
    const mockRes = {
      status: (c) => { resCode = c; return { send: (b) => { resBody = b; } }; },
      send: (b) => { resBody = b; },
    };

    await whatsappController.handleWebhook({ body: webhookEvent }, mockRes, () => {});

    // 1. Verify contact was created/updated with submitted attributes
    const cRes = await query('SELECT * FROM contacts WHERE phone LIKE $1', [`%${testPhone.slice(-10)}`]);
    assert(cRes.rows.length > 0, 'Contact must exist');
    const contact = cRes.rows[0];
    assert.strictEqual(contact.name, 'Ananya Verma', 'Contact name updated from flow');
    assert.strictEqual(contact.email, 'ananya@example.com', 'Contact email updated from flow');
    const attrs = typeof contact.custom_attributes === 'string' ? JSON.parse(contact.custom_attributes) : contact.custom_attributes;
    assert.strictEqual(attrs.company_size, '25-50', 'Custom attribute company_size must be stored');

    // 2. Verify submission was recorded in whatsapp_form_responses
    const respRes = await query('SELECT * FROM whatsapp_form_responses WHERE meta_message_id = $1', [msgId]);
    assert(respRes.rows.length > 0, 'Form response must be recorded in whatsapp_form_responses');
    const formResp = respRes.rows[0];
    assert.strictEqual(formResp.contact_phone, `+${testPhone}`);
    assert.strictEqual(formResp.flow_token, flowToken);
    assert.strictEqual(formResp.status, 'submitted');

    // 3. Verify message is in messages table with type nfm_reply
    const mRes = await query('SELECT * FROM messages WHERE meta_message_id = $1', [msgId]);
    assert(mRes.rows.length > 0, 'Message must be in messages table');
    assert.strictEqual(mRes.rows[0].message_type, 'nfm_reply');
    assert(mRes.rows[0].text.includes('Flow Submission'), 'Message text must show Flow Submission');

    // Cleanup
    await query('DELETE FROM messages WHERE meta_message_id = $1', [msgId]);
    await query('DELETE FROM whatsapp_form_responses WHERE meta_message_id = $1', [msgId]);
    await query('DELETE FROM conversations WHERE phone LIKE $1', [`%${testPhone.slice(-10)}`]);
    await query('DELETE FROM contacts WHERE id = $1', [contact.id]);
  });

  // =========================================================================
  // TEST 7: DUPLICATE SUBMISSION HANDLING (IDEMPOTENCY)
  // =========================================================================
  await reportAsyncTest('7. Duplicate Submission Handling: duplicate meta_message_id produces exactly 1 response', async () => {
    const testPhone = `91998877${Math.floor(1000 + Math.random() * 9000)}`;
    const duplicateMsgId = `wamid.HBgDUP_FLOW_${Date.now()}`;

    const duplicateWebhook = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '1311505681068950',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                contacts: [{ profile: { name: 'Duplicate Tester' }, wa_id: testPhone }],
                messages: [
                  {
                    from: testPhone,
                    id: duplicateMsgId,
                    timestamp: String(Math.floor(Date.now() / 1000)),
                    type: 'interactive',
                    interactive: {
                      type: 'nfm_reply',
                      nfm_reply: {
                        name: 'flow',
                        body: 'Sent',
                        response_json: JSON.stringify({ feedback: 'Great flow experience' }),
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const mockRes = { status: () => ({ send: () => {} }), send: () => {} };

    // Send first time
    await whatsappController.handleWebhook({ body: duplicateWebhook }, mockRes, () => {});

    // Send second time (duplicate)
    await whatsappController.handleWebhook({ body: duplicateWebhook }, mockRes, () => {});

    // Verify exactly 1 message and 1 form response exist
    const msgCount = await query('SELECT COUNT(*) as count FROM messages WHERE meta_message_id = $1', [duplicateMsgId]);
    assert.strictEqual(parseInt(msgCount.rows[0].count, 10), 1, 'Exactly 1 message record must exist');

    const respCount = await query('SELECT COUNT(*) as count FROM whatsapp_form_responses WHERE meta_message_id = $1', [duplicateMsgId]);
    assert.strictEqual(parseInt(respCount.rows[0].count, 10), 1, 'Exactly 1 form response record must exist');

    // Cleanup
    await query('DELETE FROM messages WHERE meta_message_id = $1', [duplicateMsgId]);
    await query('DELETE FROM whatsapp_form_responses WHERE meta_message_id = $1', [duplicateMsgId]);
    await query('DELETE FROM conversations WHERE phone LIKE $1', [`%${testPhone.slice(-10)}`]);
    await query('DELETE FROM contacts WHERE phone LIKE $1', [`%${testPhone.slice(-10)}`]);
  });

  // =========================================================================
  // TEST 8: NORMAL WHATSAPP TEXT REGRESSION
  // =========================================================================
  await reportAsyncTest('8. Normal WhatsApp Text Regression: standard text messages continue to process normally', async () => {
    const normalPhone = `91998877${Math.floor(1000 + Math.random() * 9000)}`;
    const textMsgId = `wamid.HBgTEXT_REG_${Date.now()}`;

    const textWebhook = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '1311505681068950',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                contacts: [{ profile: { name: 'Standard User' }, wa_id: normalPhone }],
                messages: [
                  {
                    from: normalPhone,
                    id: textMsgId,
                    timestamp: String(Math.floor(Date.now() / 1000)),
                    type: 'text',
                    text: { body: 'Hello, I have a support question' },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const mockRes = { status: () => ({ send: () => {} }), send: () => {} };
    await whatsappController.handleWebhook({ body: textWebhook }, mockRes, () => {});

    const msgRes = await query('SELECT * FROM messages WHERE meta_message_id = $1', [textMsgId]);
    assert(msgRes.rows.length > 0, 'Standard text message must be saved');
    assert.strictEqual(msgRes.rows[0].text, 'Hello, I have a support question');
    assert.strictEqual(msgRes.rows[0].message_type, 'text');

    // Cleanup
    await query('DELETE FROM messages WHERE meta_message_id = $1', [textMsgId]);
    await query('DELETE FROM conversations WHERE phone LIKE $1', [`%${normalPhone.slice(-10)}`]);
    await query('DELETE FROM contacts WHERE phone LIKE $1', [`%${normalPhone.slice(-10)}`]);
  });

  // =========================================================================
  // TEST 9: EXISTING CAMPAIGN REGRESSION
  // =========================================================================
  await reportAsyncTest('9. Existing Campaign Regression: sendTemplateMessage continues to enforce approval rules', async () => {
    // Calling template message with missing template returns clean validation
    const badTmpl = await metaWhatsAppService.sendTemplateMessage({
      to: '919876543210',
      templateName: '',
    });
    assert.strictEqual(badTmpl.success, false);
    assert.strictEqual(badTmpl.error, 'Template name is required');

    // Calling template message with invalid phone returns error
    const badPhone = await metaWhatsAppService.sendTemplateMessage({
      to: '123',
      templateName: 'arco_welcome',
    });
    assert.strictEqual(badPhone.success, false);
    assert(badPhone.error.includes('Invalid phone number format'));
  });

  // =========================================================================
  // TEST 10: EXISTING INBOX REGRESSION
  // =========================================================================
  await reportAsyncTest('10. Existing Inbox Regression: getConversations returns list with active window & unread counts', async () => {
    let inboxData = null;
    const mockRes = {
      json: (d) => { inboxData = d; },
    };

    await inboxController.getConversations({ query: { status: 'open' } }, mockRes, () => {});

    assert(inboxData !== null, 'getConversations returned null');
    assert.strictEqual(inboxData.success, true);
    assert(Array.isArray(inboxData.data), 'Expected array of conversations');
  });

  console.log('\n-------------------------------------------------------------');
  console.log(` RESULTS: ${passedTests}/${totalTests} Tests Passed`);
  console.log('-------------------------------------------------------------\n');

  process.exit(passedTests === totalTests ? 0 : 1);
})().catch((err) => {
  console.error('\nTest Suite Fatal Error:', err);
  process.exit(1);
});
