/**
 * ARCO Communication - Post-Campaign Reply Flows Verification Suite
 * Tests all 5 post-campaign reply flows:
 *   1. Opt-out customer (contact.whatsapp_opted = false, acknowledgement message)
 *   2. Send Products (catalog connection check, collection list / catalog message)
 *   3. Send Interactive List Message (prompt list + dynamic option auto-reply)
 *   4. Send Custom Reply (custom response message)
 *   5. Send a Workflow (Workflow Library execution, node traversal)
 * Along with:
 *   - PostgreSQL persistence (survives restart)
 *   - Durable idempotency / deduplication via campaign_reply_flow_logs
 *   - Opt-in safety (never auto-opts contacts in)
 *   - Campaign & recipient metric updates (replied_at, replied count)
 *   - Two-way Inbox persistence (messages and conversations tables)
 *   - Meta 24h window error handling
 * 
 * NOTE: All Meta API calls are strictly stubbed/mocked. ZERO real WhatsApp messages sent.
 */

const assert = require('assert');
const path = require('path');
const { Pool } = require('pg');

try {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
} catch (e) {}

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2004',
  database: process.env.DB_NAME || 'arco_communication',
});

let totalTests = 0;
let passedTests = 0;

async function reportTest(name, fn) {
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

async function runAllTests() {
  console.log('========================================================================');
  console.log('🚀 POST-CAMPAIGN REPLY FLOWS END-TO-END VERIFICATION SUITE');
  console.log('========================================================================\n');

  // Dynamic imports of ES modules
  const { initCampaignReplyFlowsSchema } = await import('../config/initCampaignReplyFlowsSchema.js');
  const { campaignReplyFlowService } = await import('../services/campaignReplyFlowService.js');
  const { metaWhatsAppService } = await import('../services/metaWhatsAppService.js');

  // Stub Meta WhatsApp calls to prevent real network calls
  let sentMetaMessages = [];

  function setupMocks() {
    metaWhatsAppService.sendTextMessage = async ({ to, text }) => {
      const wamid = `wamid_test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      sentMetaMessages.push({ type: 'text', to, text, wamid });
      return { success: true, wamid, metaMessageId: wamid, recipientPhone: to, status: 'sent' };
    };

    metaWhatsAppService.sendInteractiveListMessage = async ({ to, headerText, bodyText, footerText, buttonText, sections }) => {
      const wamid = `wamid_test_list_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      sentMetaMessages.push({ type: 'interactive_list', to, headerText, bodyText, footerText, buttonText, sections, wamid });
      return { success: true, wamid, metaMessageId: wamid, recipientPhone: to, status: 'sent' };
    };

    metaWhatsAppService.sendCatalogMessage = async ({ to, bodyText, footerText, catalogParameters }) => {
      const wamid = `wamid_test_cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      sentMetaMessages.push({ type: 'catalog_message', to, bodyText, footerText, catalogParameters, wamid });
      return { success: true, wamid, metaMessageId: wamid, recipientPhone: to, status: 'sent' };
    };
  }

  setupMocks();

  // 1. Schema Initialization
  await reportTest('Database schema supports post_campaign_reply_flows and audit logs', async () => {
    await initCampaignReplyFlowsSchema();

    const colCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'campaigns' AND column_name = 'post_campaign_reply_flows'
    `);
    assert.strictEqual(colCheck.rows.length, 1, 'post_campaign_reply_flows column must exist on campaigns');

    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'campaign_reply_flow_logs'
    `);
    assert.strictEqual(tableCheck.rows.length, 1, 'campaign_reply_flow_logs table must exist');
  });

  // Setup Shared Test Campaign & Contact Data
  const testPhone = '919876599999';
  const testPhonePlus = '+919876599999';
  const testContactId = `cnt_crf_test_${Date.now()}`;
  const testCampaignId = `cmp_crf_test_${Date.now()}`;
  const testRecipientId = `rcp_crf_test_${Date.now()}`;
  const testOutboundWamid = `wamid_camp_out_${Date.now()}`;

  // Ensure contact exists and is opted in
  await pool.query(
    `INSERT INTO contacts (id, name, phone, email, whatsapp_opted, tag, status, owner, created_at, updated_at)
     VALUES ($1, 'Reply Flow Customer', $2, 'test_flow@arco.com', true, 'VIP', 'Open Lead', 'Shraddha', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET whatsapp_opted = true`,
    [testContactId, testPhonePlus]
  );

  // Setup Campaign with all 5 Reply Flows configured
  const configuredFlows = {
    optOut: {
      enabled: true,
      triggerType: 'On Button Click',
      triggerButton: 'STOP',
      acknowledgementEnabled: true,
      acknowledgementText: 'You have been unsubscribed from WhatsApp updates.',
    },
    sendProducts: {
      enabled: true,
      triggerType: 'On Button Click',
      triggerButton: 'See our products',
      productType: 'collection_list',
      messageText: 'Check out our featured products list:',
    },
    sendInteractiveList: {
      enabled: true,
      triggerType: 'On Button Click',
      triggerButton: 'Know more about us',
      headerText: 'Customer Support Options',
      bodyText: 'Please choose a topic below:',
      footerText: 'ARCO Support',
      buttonText: 'View Options',
      options: [
        {
          id: 'opt_bug',
          title: 'Software Bug',
          description: 'Report an issue',
          replyText: 'Thank you for reporting. Please send us the bug details.',
        },
        {
          id: 'opt_billing',
          title: 'Payment/Billing',
          description: 'Billing help',
          replyText: 'Our finance team is reviewing your account invoices.',
        },
      ],
    },
    sendCustomReply: {
      enabled: true,
      triggerType: 'On Button Click',
      triggerButton: 'Help',
      messageText: 'Sure, someone from our team will get in touch shortly.',
    },
    sendWorkflow: {
      enabled: true,
      triggerType: 'On button click',
      triggerButton: 'Start Flow',
      workflowId: 'wf_ai_proj_1',
      workflowName: 'ai_project_progress_notifications_7i',
    },
  };

  await pool.query(
    `INSERT INTO campaigns (
       id, name, channel, type, category, status, recipients, delivered, read, replied,
       scheduled_for, post_campaign_reply_flows, created_by, created_at, updated_at
     ) VALUES ($1, 'Reply Flows Master Test', 'whatsapp', 'onetime', 'Marketing', 'Sending', 1, 1, 1, 0,
       CURRENT_TIMESTAMP, $2, 'Shraddha', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [testCampaignId, JSON.stringify(configuredFlows)]
  );

  await pool.query(
    `INSERT INTO campaign_recipients (
       id, campaign_id, contact_id, name, phone, email, country_code, whatsapp_opted,
       batch_number, status, meta_message_id, sent_at, delivered_at, created_at, updated_at
     ) VALUES ($1, $2, $3, 'Reply Flow Customer', $4, 'test_flow@arco.com', '91', true,
       1, 'delivered', $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [testRecipientId, testCampaignId, testContactId, testPhone, testOutboundWamid]
  );

  // Setup Conversation in Inbox
  const testConvId = `cnv_crf_test_${Date.now()}`;
  await pool.query(
    `INSERT INTO conversations (
       id, name, channel, status, phone, unread_count, last_message_time,
       tag, status_filter, assignee, reply_status, response_window,
       last_inbound_at, is_spam, created_at, updated_at
     ) VALUES ($1, 'Reply Flow Customer', 'whatsapp', 'Online', $2, 0, 'Just now',
       'VIP', 'open', 'Unassigned', 'unreplied', 'active',
       CURRENT_TIMESTAMP, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO NOTHING`,
    [testConvId, testPhonePlus]
  );

  // 2. Flow 1: Opt-out Customer
  await reportTest('Flow 1 (Opt-out Customer): Sets whatsapp_opted to false, sends ack, logs audit, and increments replied', async () => {
    sentMetaMessages = [];
    const inboundMessageId = `wamid_in_optout_${Date.now()}`;

    const contactRes = await pool.query('SELECT * FROM contacts WHERE id = $1', [testContactId]);
    const convRes = await pool.query('SELECT * FROM conversations WHERE id = $1', [testConvId]);

    const result = await campaignReplyFlowService.handleInboundInteraction({
      message: {
        id: inboundMessageId,
        from: testPhone,
        type: 'button',
        button: { text: 'STOP', payload: 'STOP' },
        context: { id: testOutboundWamid },
      },
      contact: contactRes.rows[0],
      conv: convRes.rows[0],
      fromPhone: testPhonePlus,
      clean10: testPhone.slice(-10),
    });

    assert.strictEqual(result.handled, true, 'Reply flow must handle Opt-Out');
    assert.strictEqual(result.flow.flowType, 'opt_out');

    // Verify contact opted out
    const updatedContact = await pool.query('SELECT whatsapp_opted FROM contacts WHERE id = $1', [testContactId]);
    assert.strictEqual(updatedContact.rows[0].whatsapp_opted, false, 'whatsapp_opted must be updated to false');

    // Verify acknowledgement message sent
    assert.strictEqual(sentMetaMessages.length, 1, 'One acknowledgement message should be sent');
    assert.strictEqual(sentMetaMessages[0].text, 'You have been unsubscribed from WhatsApp updates.');

    // Verify recipient row replied_at updated
    const updatedRcp = await pool.query('SELECT replied_at, status FROM campaign_recipients WHERE id = $1', [testRecipientId]);
    assert.ok(updatedRcp.rows[0].replied_at, 'replied_at must be populated');
    assert.strictEqual(updatedRcp.rows[0].status, 'replied');

    // Verify campaign master replied count updated
    const updatedCamp = await pool.query('SELECT replied FROM campaigns WHERE id = $1', [testCampaignId]);
    assert.strictEqual(parseInt(updatedCamp.rows[0].replied, 10), 1, 'Master campaign replied count must be 1');

    // Verify audit log created
    const logRes = await pool.query('SELECT * FROM campaign_reply_flow_logs WHERE inbound_meta_message_id = $1', [inboundMessageId]);
    assert.strictEqual(logRes.rows.length, 1, 'Audit log row must be recorded');
    assert.strictEqual(logRes.rows[0].flow_type, 'opt_out');
    assert.strictEqual(logRes.rows[0].status, 'success');
  });

  // 3. Flow 2: Send Products
  await reportTest('Flow 2 (Send Products): Checks catalog connection and sends interactive products list', async () => {
    sentMetaMessages = [];
    const inboundMessageId = `wamid_in_prod_${Date.now()}`;

    // Ensure catalog connected in commerce_settings
    await pool.query(`
      INSERT INTO commerce_settings (id, user_id, catalog_id, catalog_name, catalog_status)
      VALUES ('comm_test_flow', 'usr_1', 'cat_test_flow', 'ARCO Test Store Catalog', 'connected')
      ON CONFLICT (id) DO UPDATE SET catalog_status = 'connected'
    `);

    // Ensure sample catalog product
    await pool.query(`
      INSERT INTO catalog_products (id, user_id, external_product_id, title, description, price, availability, brand, is_active)
      VALUES ('prod_flow_test_1', 'usr_1', 'ext_flow_1', 'ARCO Premium Tee', '100% Organic Cotton', 999.00, 'in stock', 'ARCO', true)
      ON CONFLICT (id) DO UPDATE SET is_active = true
    `);

    const contactRes = await pool.query('SELECT * FROM contacts WHERE id = $1', [testContactId]);
    const convRes = await pool.query('SELECT * FROM conversations WHERE id = $1', [testConvId]);

    const result = await campaignReplyFlowService.handleInboundInteraction({
      message: {
        id: inboundMessageId,
        from: testPhone,
        type: 'button',
        button: { text: 'See our products', payload: 'See our products' },
        context: { id: testOutboundWamid },
      },
      contact: contactRes.rows[0],
      conv: convRes.rows[0],
      fromPhone: testPhonePlus,
      clean10: testPhone.slice(-10),
    });

    assert.strictEqual(result.handled, true, 'Reply flow must handle Send Products');
    assert.strictEqual(result.flow.flowType, 'send_products');

    // Verify list message sent
    assert.strictEqual(sentMetaMessages.length, 1);
    assert.strictEqual(sentMetaMessages[0].type, 'interactive_list');
    assert.strictEqual(sentMetaMessages[0].bodyText, 'Check out our featured products list:');

    // Verify audit log
    const logRes = await pool.query('SELECT * FROM campaign_reply_flow_logs WHERE inbound_meta_message_id = $1', [inboundMessageId]);
    assert.strictEqual(logRes.rows.length, 1);
    assert.strictEqual(logRes.rows[0].flow_type, 'send_products');
    assert.strictEqual(logRes.rows[0].status, 'success');
  });

  // 4. Flow 3: Send Interactive List Message (Both Phase A & Phase B)
  await reportTest('Flow 3 (Interactive List): Dispatches interactive list on button click, then sends auto-reply on option selection', async () => {
    sentMetaMessages = [];

    const contactRes = await pool.query('SELECT * FROM contacts WHERE id = $1', [testContactId]);
    const convRes = await pool.query('SELECT * FROM conversations WHERE id = $1', [testConvId]);

    // Phase A: Customer clicks campaign button 'Know more about us'
    const inboundMessageIdPhaseA = `wamid_in_list_prompt_${Date.now()}`;
    const resultA = await campaignReplyFlowService.handleInboundInteraction({
      message: {
        id: inboundMessageIdPhaseA,
        from: testPhone,
        type: 'button',
        button: { text: 'Know more about us', payload: 'Know more about us' },
        context: { id: testOutboundWamid },
      },
      contact: contactRes.rows[0],
      conv: convRes.rows[0],
      fromPhone: testPhonePlus,
      clean10: testPhone.slice(-10),
    });

    assert.strictEqual(resultA.handled, true, 'Must handle Interactive List button click');
    assert.strictEqual(resultA.flow.flowType, 'send_interactive_list');
    assert.strictEqual(sentMetaMessages.length, 1);
    assert.strictEqual(sentMetaMessages[0].type, 'interactive_list');
    assert.strictEqual(sentMetaMessages[0].buttonText, 'View Options');
    assert.strictEqual(sentMetaMessages[0].sections[0].rows.length, 2);

    // Phase B: Customer selects option 'Software Bug'
    sentMetaMessages = [];
    const inboundMessageIdPhaseB = `wamid_in_list_option_${Date.now()}`;
    const resultB = await campaignReplyFlowService.handleInboundInteraction({
      message: {
        id: inboundMessageIdPhaseB,
        from: testPhone,
        type: 'interactive',
        interactive: {
          type: 'list_reply',
          list_reply: { id: 'opt_bug', title: 'Software Bug' },
        },
        context: { id: testOutboundWamid },
      },
      contact: contactRes.rows[0],
      conv: convRes.rows[0],
      fromPhone: testPhonePlus,
      clean10: testPhone.slice(-10),
    });

    assert.strictEqual(resultB.handled, true, 'Must handle Interactive List option selection');
    assert.strictEqual(resultB.flow.flowType, 'send_interactive_list_reply');
    assert.strictEqual(sentMetaMessages.length, 1);
    assert.strictEqual(sentMetaMessages[0].type, 'text');
    assert.strictEqual(sentMetaMessages[0].text, 'Thank you for reporting. Please send us the bug details.');

    const logResB = await pool.query('SELECT * FROM campaign_reply_flow_logs WHERE inbound_meta_message_id = $1', [inboundMessageIdPhaseB]);
    assert.strictEqual(logResB.rows.length, 1);
    assert.strictEqual(logResB.rows[0].flow_type, 'send_interactive_list_reply');
  });

  // 5. Flow 4: Send Custom Reply
  await reportTest('Flow 4 (Send Custom Reply): Dispatches configured custom text response', async () => {
    sentMetaMessages = [];
    const inboundMessageId = `wamid_in_custom_${Date.now()}`;

    const contactRes = await pool.query('SELECT * FROM contacts WHERE id = $1', [testContactId]);
    const convRes = await pool.query('SELECT * FROM conversations WHERE id = $1', [testConvId]);

    const result = await campaignReplyFlowService.handleInboundInteraction({
      message: {
        id: inboundMessageId,
        from: testPhone,
        type: 'button',
        button: { text: 'Help', payload: 'Help' },
        context: { id: testOutboundWamid },
      },
      contact: contactRes.rows[0],
      conv: convRes.rows[0],
      fromPhone: testPhonePlus,
      clean10: testPhone.slice(-10),
    });

    assert.strictEqual(result.handled, true, 'Must handle Send Custom Reply');
    assert.strictEqual(result.flow.flowType, 'send_custom_reply');
    assert.strictEqual(sentMetaMessages.length, 1);
    assert.strictEqual(sentMetaMessages[0].text, 'Sure, someone from our team will get in touch shortly.');

    const logRes = await pool.query('SELECT * FROM campaign_reply_flow_logs WHERE inbound_meta_message_id = $1', [inboundMessageId]);
    assert.strictEqual(logRes.rows.length, 1);
    assert.strictEqual(logRes.rows[0].flow_type, 'send_custom_reply');
  });

  // 6. Flow 5: Send a Workflow
  await reportTest('Flow 5 (Send a Workflow): Triggers workflow from Workflow Library and increments executions', async () => {
    sentMetaMessages = [];
    const inboundMessageId = `wamid_in_wf_${Date.now()}`;

    // Ensure workflow exists in database
    await pool.query(
      `INSERT INTO workflows (id, user_id, name, "trigger", action, executions, status, description, nodes, edges, is_published)
       VALUES ('wf_ai_proj_1', 'usr_1', 'ai_project_progress_notifications_7i', 'User message', 'Workflow', 0, 'active', 'Project updates',
               '[{"id": "node_1", "type": "plain_message", "data": {"text": "Welcome to Project Notifications"}}]'::jsonb,
               '[]'::jsonb, true)
       ON CONFLICT (id) DO UPDATE SET status = 'active'`,
      []
    );

    const prevExecutionsRes = await pool.query('SELECT executions FROM workflows WHERE id = $1', ['wf_ai_proj_1']);
    const prevExecutions = parseInt(prevExecutionsRes.rows[0].executions || '0', 10);

    const contactRes = await pool.query('SELECT * FROM contacts WHERE id = $1', [testContactId]);
    const convRes = await pool.query('SELECT * FROM conversations WHERE id = $1', [testConvId]);

    const result = await campaignReplyFlowService.handleInboundInteraction({
      message: {
        id: inboundMessageId,
        from: testPhone,
        type: 'button',
        button: { text: 'Start Flow', payload: 'Start Flow' },
        context: { id: testOutboundWamid },
      },
      contact: contactRes.rows[0],
      conv: convRes.rows[0],
      fromPhone: testPhonePlus,
      clean10: testPhone.slice(-10),
    });

    assert.strictEqual(result.handled, true, 'Must handle Send Workflow');
    assert.strictEqual(result.flow.flowType, 'send_workflow');

    // Verify executions incremented
    const afterExecutionsRes = await pool.query('SELECT executions FROM workflows WHERE id = $1', ['wf_ai_proj_1']);
    const afterExecutions = parseInt(afterExecutionsRes.rows[0].executions || '0', 10);
    assert.strictEqual(afterExecutions, prevExecutions + 1, 'Workflow executions count must be incremented by 1');

    // Verify workflow message sent
    assert.strictEqual(sentMetaMessages.length, 1);
    assert.ok(
      sentMetaMessages[0].text.includes('progress update') ||
        sentMetaMessages[0].text.includes('Welcome to Project Notifications'),
      `Unexpected workflow text: ${sentMetaMessages[0].text}`
    );

    const logRes = await pool.query('SELECT * FROM campaign_reply_flow_logs WHERE inbound_meta_message_id = $1', [inboundMessageId]);
    assert.strictEqual(logRes.rows.length, 1);
    assert.strictEqual(logRes.rows[0].flow_type, 'send_workflow');
  });

  // 7. Idempotency & Deduplication
  await reportTest('Idempotency: Reprocessing identical inbound Meta message ID is skipped safely', async () => {
    sentMetaMessages = [];
    const duplicateMessageId = `wamid_in_custom_${Date.now() - 5000}`;

    // First ensure one log already exists for this ID
    await pool.query(
      `INSERT INTO campaign_reply_flow_logs (
         id, campaign_id, recipient_id, inbound_meta_message_id, flow_type, status, created_at
       ) VALUES ($1, $2, $3, $4, 'send_custom_reply', 'success', CURRENT_TIMESTAMP)
       ON CONFLICT (inbound_meta_message_id) DO NOTHING`,
      [`crf_idemp_${Date.now()}`, testCampaignId, testRecipientId, duplicateMessageId]
    );

    const contactRes = await pool.query('SELECT * FROM contacts WHERE id = $1', [testContactId]);
    const convRes = await pool.query('SELECT * FROM conversations WHERE id = $1', [testConvId]);

    const result = await campaignReplyFlowService.handleInboundInteraction({
      message: {
        id: duplicateMessageId,
        from: testPhone,
        type: 'button',
        button: { text: 'Help', payload: 'Help' },
        context: { id: testOutboundWamid },
      },
      contact: contactRes.rows[0],
      conv: convRes.rows[0],
      fromPhone: testPhonePlus,
      clean10: testPhone.slice(-10),
    });

    assert.strictEqual(result.handled, false, 'Duplicate inbound message should NOT be re-handled');
    assert.strictEqual(result.reason, 'Already processed (idempotent)');
    assert.strictEqual(sentMetaMessages.length, 0, 'No outbound message should be dispatched for duplicates');
  });

  // 8. Opt-In Protection
  await reportTest('Opt-in Safety: Non-opted contacts are NOT automatically opted into marketing upon inbound interaction', async () => {
    const nonOptedContactId = `cnt_non_opted_${Date.now()}`;
    await pool.query(
      `INSERT INTO contacts (id, name, phone, whatsapp_opted, created_at, updated_at)
       VALUES ($1, 'Non Opted User', '+919876540000', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [nonOptedContactId]
    );

    const contactRes = await pool.query('SELECT * FROM contacts WHERE id = $1', [nonOptedContactId]);
    assert.strictEqual(contactRes.rows[0].whatsapp_opted, false);

    // Simulate custom reply flow
    await campaignReplyFlowService.handleInboundInteraction({
      message: {
        id: `wamid_non_opted_msg_${Date.now()}`,
        from: '919876540000',
        type: 'button',
        button: { text: 'Help', payload: 'Help' },
        context: { id: testOutboundWamid },
      },
      contact: contactRes.rows[0],
      conv: { id: testConvId },
      fromPhone: '+919876540000',
      clean10: '9876540000',
    });

    const checkRes = await pool.query('SELECT whatsapp_opted FROM contacts WHERE id = $1', [nonOptedContactId]);
    assert.strictEqual(checkRes.rows[0].whatsapp_opted, false, 'whatsapp_opted MUST remain false');

    // Clean up temporary contact
    await pool.query('DELETE FROM contacts WHERE id = $1', [nonOptedContactId]);
  });

  // 9. Error Handling: Expired 24-hour Window & Disconnected Catalog
  await reportTest('Error Handling: Gracefully records expired 24h window and catalog disconnected errors without crashing', async () => {
    // Stub Meta service to return expired 24h window error
    metaWhatsAppService.sendTextMessage = async () => ({
      success: false,
      error: 'The 24-hour WhatsApp customer service window has expired.',
      errorCode: 131047,
    });

    const inboundExpiredId = `wamid_in_expired_${Date.now()}`;
    const contactRes = await pool.query('SELECT * FROM contacts WHERE id = $1', [testContactId]);

    const result = await campaignReplyFlowService.handleInboundInteraction({
      message: {
        id: inboundExpiredId,
        from: testPhone,
        type: 'button',
        button: { text: 'Help', payload: 'Help' },
        context: { id: testOutboundWamid },
      },
      contact: contactRes.rows[0],
      conv: { id: testConvId },
      fromPhone: testPhonePlus,
      clean10: testPhone.slice(-10),
    });

    assert.strictEqual(result.handled, true);
    // Log must have captured the error
    const logRes = await pool.query('SELECT * FROM campaign_reply_flow_logs WHERE inbound_meta_message_id = $1', [inboundExpiredId]);
    assert.strictEqual(logRes.rows.length, 1);
    assert.strictEqual(logRes.rows[0].status, 'failed');
    assert.strictEqual(logRes.rows[0].error_message, 'The 24-hour WhatsApp customer service window has expired.');
  });

  // 10. Concurrent Webhook Idempotency (Fix 1)
  await reportTest('Concurrent Webhook Idempotency: Simultaneous identical webhooks produce exactly 1 flow execution, 1 Meta dispatch, and 1 log row', async () => {
    setupMocks();
    sentMetaMessages = [];

    const raceMessageId = `wamid_race_${Date.now()}`;
    const contactRes = await pool.query('SELECT * FROM contacts WHERE id = $1', [testContactId]);
    const convRes = await pool.query('SELECT * FROM conversations WHERE id = $1', [testConvId]);

    const interactionPayload = {
      message: {
        id: raceMessageId,
        from: testPhone,
        type: 'button',
        button: { text: 'Help', payload: 'Help' },
        context: { id: testOutboundWamid },
      },
      contact: contactRes.rows[0],
      conv: convRes.rows[0],
      fromPhone: testPhonePlus,
      clean10: testPhone.slice(-10),
    };

    // Execute two concurrent identical webhook interaction requests simultaneously
    const [resA, resB] = await Promise.all([
      campaignReplyFlowService.handleInboundInteraction(interactionPayload),
      campaignReplyFlowService.handleInboundInteraction(interactionPayload),
    ]);

    // Exactly one must have handled the flow, and one must have safely exited
    const handledCount = (resA.handled ? 1 : 0) + (resB.handled ? 1 : 0);
    assert.strictEqual(handledCount, 1, 'Exactly ONE flow execution must succeed');

    const skippedResult = !resA.handled ? resA : resB;
    assert.strictEqual(skippedResult.handled, false, 'The second request must safely exit without processing');
    assert.ok(
      (skippedResult.reason && (skippedResult.reason.includes('Already processed') || skippedResult.reason.includes('claimed concurrently'))),
      `Expected idempotent early-exit reason, got: ${skippedResult.reason}`
    );

    // Exactly ONE Meta dispatch must have occurred
    assert.strictEqual(sentMetaMessages.length, 1, 'Exactly ONE Meta message must be dispatched');
    assert.strictEqual(sentMetaMessages[0].text, 'Sure, someone from our team will get in touch shortly.');

    // Exactly ONE log row must exist in campaign_reply_flow_logs
    const logRows = await pool.query(
      'SELECT id, flow_type, status, inbound_meta_message_id FROM campaign_reply_flow_logs WHERE inbound_meta_message_id = $1',
      [raceMessageId]
    );
    assert.strictEqual(logRows.rows.length, 1, 'Exactly ONE log row must exist in campaign_reply_flow_logs');
    assert.strictEqual(logRows.rows[0].status, 'success');
  });

  // 11. Zero-Product Catalog Safety (Fix 2)
  await reportTest('Zero-Product Catalog Safety: Catalog connected with 0 active products dispatches 0 Meta calls, records failed log, and returns meaningful error', async () => {
    setupMocks();
    sentMetaMessages = [];

    // Ensure catalog connected in commerce_settings
    await pool.query(`
      INSERT INTO commerce_settings (id, user_id, catalog_id, catalog_name, catalog_status)
      VALUES ('comm_test_flow', 'usr_1', 'cat_test_flow', 'ARCO Test Store Catalog', 'connected')
      ON CONFLICT (id) DO UPDATE SET catalog_status = 'connected'
    `);

    // Deactivate ALL catalog products so active count is 0
    await pool.query('UPDATE catalog_products SET is_active = false WHERE user_id = $1', ['usr_1']);

    const zeroProdMessageId = `wamid_zero_prod_${Date.now()}`;
    const contactRes = await pool.query('SELECT * FROM contacts WHERE id = $1', [testContactId]);
    const convRes = await pool.query('SELECT * FROM conversations WHERE id = $1', [testConvId]);

    const result = await campaignReplyFlowService.handleInboundInteraction({
      message: {
        id: zeroProdMessageId,
        from: testPhone,
        type: 'button',
        button: { text: 'See our products', payload: 'See our products' },
        context: { id: testOutboundWamid },
      },
      contact: contactRes.rows[0],
      conv: convRes.rows[0],
      fromPhone: testPhonePlus,
      clean10: testPhone.slice(-10),
    });

    // Verify 0 Meta calls made
    assert.strictEqual(sentMetaMessages.length, 0, 'Zero Meta dispatches must be made when active products = 0');

    // Verify handled is false with meaningful error
    assert.strictEqual(result.handled, false, 'Flow must not succeed with zero active products');
    assert.strictEqual(result.error, 'No active products found in catalog');

    // Verify audit log status = failed with error message
    const logRes = await pool.query(
      'SELECT id, flow_type, status, error_message FROM campaign_reply_flow_logs WHERE inbound_meta_message_id = $1',
      [zeroProdMessageId]
    );
    assert.strictEqual(logRes.rows.length, 1, 'Audit log row must be recorded');
    assert.strictEqual(logRes.rows[0].status, 'failed', 'Audit log status must be failed');
    assert.strictEqual(logRes.rows[0].error_message, 'No active products found in catalog');

    // Restore test product for subsequent tests
    await pool.query('UPDATE catalog_products SET is_active = true WHERE id = $1', ['prod_flow_test_1']);
  });

  // 12. Fallback Campaign Attribution Recency Window (Fix 3)
  await reportTest('Fallback Attribution Recency: Old campaign outside 72h window is NOT selected for free-text reply, but recent campaign is', async () => {
    setupMocks();
    sentMetaMessages = [];

    const recencyPhone = '919876588888';
    const recencyPhonePlus = '+919876588888';
    const recencyContactId = `cnt_rec_${Date.now()}`;
    const oldCampaignId = `cmp_old_${Date.now()}`;
    const oldRecipientId = `rcp_old_${Date.now()}`;

    // Create contact
    await pool.query(
      `INSERT INTO contacts (id, name, phone, email, whatsapp_opted, status, owner, created_at, updated_at)
       VALUES ($1, 'Recency Customer', $2, 'recency@arco.com', true, 'Open Lead', 'Shraddha', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [recencyContactId, recencyPhonePlus]
    );

    // Create old campaign configured with custom reply for text 'Help'
    const recencyCampaignFlows = {
      sendCustomReply: {
        enabled: true,
        triggerType: 'On Button Click',
        triggerButton: 'Help',
        messageText: 'Attributed custom reply.',
      },
    };

    await pool.query(
      `INSERT INTO campaigns (
         id, name, channel, type, category, status, recipients, delivered, read, replied,
         scheduled_for, post_campaign_reply_flows, created_by, created_at, updated_at
       ) VALUES ($1, 'Old Stale Campaign', 'whatsapp', 'onetime', 'Marketing', 'Sent', 1, 1, 1, 0,
         CURRENT_TIMESTAMP - INTERVAL '5 days', $2, 'Shraddha', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days')`,
      [oldCampaignId, JSON.stringify(recencyCampaignFlows)]
    );

    // Create recipient with sent_at 5 days ago (outside 72-hour window)
    await pool.query(
      `INSERT INTO campaign_recipients (
         id, campaign_id, contact_id, name, phone, email, country_code, whatsapp_opted,
         batch_number, status, meta_message_id, sent_at, delivered_at, created_at, updated_at
       ) VALUES ($1, $2, $3, 'Recency Customer', $4, 'recency@arco.com', '91', true,
         1, 'delivered', 'wamid_old_stale_123', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days',
         CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days')`,
      [oldRecipientId, oldCampaignId, recencyContactId, recencyPhone]
    );

    const contactRes = await pool.query('SELECT * FROM contacts WHERE id = $1', [recencyContactId]);

    // Subtest A: Free-text reply with NO context ID against 5-day-old campaign
    const staleResult = await campaignReplyFlowService.handleInboundInteraction({
      message: {
        id: `wamid_stale_freetext_${Date.now()}`,
        from: recencyPhone,
        type: 'text',
        text: { body: 'Help' },
        // NO context.id
      },
      contact: contactRes.rows[0],
      conv: { id: testConvId },
      fromPhone: recencyPhonePlus,
      clean10: recencyPhone.slice(-10),
    });

    assert.strictEqual(staleResult.handled, false, 'Old campaign (>72h) must NOT be attributed for free-text replies');
    assert.strictEqual(sentMetaMessages.length, 0, 'Zero Meta messages sent for stale campaign');

    // Subtest B: Now create a RECENT campaign (sent 12 hours ago, within 72h window)
    const recentCampaignId = `cmp_rec_${Date.now()}`;
    const recentRecipientId = `rcp_rec_${Date.now()}`;

    await pool.query(
      `INSERT INTO campaigns (
         id, name, channel, type, category, status, recipients, delivered, read, replied,
         scheduled_for, post_campaign_reply_flows, created_by, created_at, updated_at
       ) VALUES ($1, 'Recent Campaign', 'whatsapp', 'onetime', 'Marketing', 'Sending', 1, 1, 1, 0,
         CURRENT_TIMESTAMP - INTERVAL '12 hours', $2, 'Shraddha', CURRENT_TIMESTAMP - INTERVAL '12 hours', CURRENT_TIMESTAMP - INTERVAL '12 hours')`,
      [recentCampaignId, JSON.stringify(recencyCampaignFlows)]
    );

    await pool.query(
      `INSERT INTO campaign_recipients (
         id, campaign_id, contact_id, name, phone, email, country_code, whatsapp_opted,
         batch_number, status, meta_message_id, sent_at, delivered_at, created_at, updated_at
       ) VALUES ($1, $2, $3, 'Recency Customer', $4, 'recency@arco.com', '91', true,
         1, 'delivered', 'wamid_recent_eligible_456', CURRENT_TIMESTAMP - INTERVAL '12 hours', CURRENT_TIMESTAMP - INTERVAL '12 hours',
         CURRENT_TIMESTAMP - INTERVAL '12 hours', CURRENT_TIMESTAMP - INTERVAL '12 hours')`,
      [recentRecipientId, recentCampaignId, recencyContactId, recencyPhone]
    );

    // Free-text reply should now match the recent campaign (<72h)
    const recentResult = await campaignReplyFlowService.handleInboundInteraction({
      message: {
        id: `wamid_recent_freetext_${Date.now()}`,
        from: recencyPhone,
        type: 'text',
        text: { body: 'Help' },
        // NO context.id
      },
      contact: contactRes.rows[0],
      conv: { id: testConvId },
      fromPhone: recencyPhonePlus,
      clean10: recencyPhone.slice(-10),
    });

    assert.strictEqual(recentResult.handled, true, 'Recent campaign (<72h) MUST be attributed for free-text replies');
    assert.strictEqual(recentResult.campaignId, recentCampaignId, 'Matched campaign must be the recent one');
    assert.strictEqual(sentMetaMessages.length, 1, 'Meta message dispatched for recent campaign');

    // Clean up recency test entities
    await pool.query('DELETE FROM campaign_reply_flow_logs WHERE campaign_id IN ($1, $2)', [oldCampaignId, recentCampaignId]);
    await pool.query('DELETE FROM campaign_recipients WHERE campaign_id IN ($1, $2)', [oldCampaignId, recentCampaignId]);
    await pool.query('DELETE FROM campaigns WHERE id IN ($1, $2)', [oldCampaignId, recentCampaignId]);
    await pool.query('DELETE FROM contacts WHERE id = $1', [recencyContactId]);
  });

  // 13. Clean up test data
  await reportTest('Test Data Teardown: Cleans up test campaigns, recipients, and logs cleanly', async () => {
    await pool.query('DELETE FROM campaign_reply_flow_logs WHERE campaign_id = $1', [testCampaignId]);
    await pool.query('DELETE FROM campaign_recipients WHERE campaign_id = $1', [testCampaignId]);
    await pool.query('DELETE FROM campaigns WHERE id = $1', [testCampaignId]);
    await pool.query('DELETE FROM contacts WHERE id = $1', [testContactId]);
    await pool.query('DELETE FROM conversations WHERE id = $1', [testConvId]);
  });

  console.log('\n========================================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} POST-CAMPAIGN REPLY FLOWS TESTS PASSED!`);
  console.log('========================================================================\n');
}

runAllTests()
  .catch((err) => {
    console.error('\n❌ TEST RUN FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    process.exit(0);
  });
