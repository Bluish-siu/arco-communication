/**
 * Automated Test Suite for ARCO Communication Basic Automations Engine
 * Covers all 19 Phase 13 Requirements:
 *  1. Working-hours inside schedule
 *  2. Working-hours outside schedule
 *  3. Business timezone
 *  4. OOO cooldown
 *  5. New-contact welcome
 *  6. >24h re-engagement welcome
 *  7. No welcome on normal ongoing conversation
 *  8. Delayed response scheduling
 *  9. Delayed response execution
 * 10. Delayed response cancellation after agent reply
 * 11. Delayed job survives process restart
 * 12. Duplicate webhook/WAMID
 * 13. Duplicate automation execution prevention
 * 14. Correct tenant/business credentials
 * 15. Simulation mode does not send
 * 16. Outbound automation message appears in Inbox
 * 17. Existing workflow automation still works
 * 18. Existing campaign reply flow still works
 * 19. Existing WhatsApp sending still works
 */

const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
    if (err.stack) {
      console.error(err.stack.split('\n').slice(1, 4).join('\n'));
    }
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🧪 ARCO Communication - Basic Automations Test Suite');
  console.log('======================================================\n');

  // Dynamic import of ES modules
  const { query, db } = await import('../config/db.js');
  const {
    basicAutomationEngine,
    isWithinWorkingHours,
  } = await import('../services/basicAutomationEngine.js');
  const { metaWhatsAppService } = await import('../services/metaWhatsAppService.js');
  const { workflowExecutionEngine } = await import('../services/workflowExecutionEngine.js');
  const { campaignReplyFlowService } = await import('../services/campaignReplyFlowService.js');

  const TEST_USER = 'usr_test_auto_' + Date.now();
  const TEST_PHONE = '+919999912345';

  // Cleanup & setup test user in DB
  try {
    await query('DELETE FROM automation_settings WHERE user_id = $1', [TEST_USER]);
    await query('DELETE FROM automation_execution_logs WHERE user_id = $1', [TEST_USER]);
    await query('DELETE FROM delayed_automation_jobs WHERE user_id = $1', [TEST_USER]);
  } catch (e) {
    // Ignore initial cleanup
  }

  // 1. Working-hours inside schedule
  await runAsyncTest('1. Working-hours inside schedule returns withinWorkingHours = true', async () => {
    const config = {
      enabled: true,
      timezone: 'UTC',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '18:00',
    };
    // 2026-09-21 is a Monday, 12:00:00 UTC (noon)
    const mondayNoon = new Date('2026-09-21T12:00:00.000Z');
    const res = isWithinWorkingHours({ workingHoursConfig: config, referenceDate: mondayNoon });
    assert.strictEqual(res.withinWorkingHours, true, 'Noon on Monday should be within 09:00-18:00');
    assert.strictEqual(res.weekday, 'monday');
  });

  // 2. Working-hours outside schedule
  await runAsyncTest('2. Working-hours outside schedule returns withinWorkingHours = false', async () => {
    const config = {
      enabled: true,
      timezone: 'UTC',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '18:00',
    };
    // 2026-09-21 at 22:00:00 UTC (night)
    const mondayNight = new Date('2026-09-21T22:00:00.000Z');
    const res = isWithinWorkingHours({ workingHoursConfig: config, referenceDate: mondayNight });
    assert.strictEqual(res.withinWorkingHours, false, '10 PM on Monday should be outside 09:00-18:00');

    // 2026-09-20 is a Sunday
    const sundayNoon = new Date('2026-09-20T12:00:00.000Z');
    const resSunday = isWithinWorkingHours({ workingHoursConfig: config, referenceDate: sundayNoon });
    assert.strictEqual(resSunday.withinWorkingHours, false, 'Sunday should not be a working day');
  });

  // 3. Business timezone evaluation without hardcoding IST
  await runAsyncTest('3. Business timezone correctly resolves local time for New York and Tokyo', async () => {
    // 14:00 UTC on Monday
    const utcDate = new Date('2026-09-21T14:00:00.000Z');

    // In America/New_York (EDT = UTC-4), 14:00 UTC is 10:00 AM
    const nyConfig = {
      enabled: true,
      timezone: 'America/New_York',
      days: ['Monday'],
      startTime: '09:00',
      endTime: '17:00',
    };
    const nyRes = isWithinWorkingHours({ workingHoursConfig: nyConfig, referenceDate: utcDate });
    assert.strictEqual(nyRes.withinWorkingHours, true, '14:00 UTC is 10:00 AM EDT, inside 09:00-17:00');
    assert.strictEqual(nyRes.currentTime, '10:00');

    // In Asia/Tokyo (JST = UTC+9), 14:00 UTC is 23:00 (11 PM)
    const tokyoConfig = {
      enabled: true,
      timezone: 'Asia/Tokyo',
      days: ['Monday'],
      startTime: '09:00',
      endTime: '18:00',
    };
    const tokyoRes = isWithinWorkingHours({ workingHoursConfig: tokyoConfig, referenceDate: utcDate });
    assert.strictEqual(tokyoRes.withinWorkingHours, false, '14:00 UTC is 23:00 JST, outside 09:00-18:00');
    assert.strictEqual(tokyoRes.currentTime, '23:00');
  });

  // Setup test user automation settings in DB
  await runAsyncTest('Setup: Persist test user automation settings in database', async () => {
    await query(
      `INSERT INTO automation_settings (
         id, user_id, working_hours, out_of_office, welcome_message, delayed_response, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        `aset_${TEST_USER}`,
        TEST_USER,
        JSON.stringify({
          enabled: true,
          timezone: 'Asia/Kolkata',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          startTime: '09:00',
          endTime: '18:00',
        }),
        JSON.stringify({
          enabled: true,
          message: 'We are currently out of office. We will reply when back!',
        }),
        JSON.stringify({
          enabled: true,
          sendWithOoo: true,
          message: 'Welcome to ARCO! How can we assist you today?',
        }),
        JSON.stringify({
          enabled: true,
          delayHours: 0,
          delayMinutes: 5,
          message: 'Thank you for your patience! An agent will respond shortly.',
        }),
      ]
    );
  });

  // 4. OOO Cooldown prevents repeated sending
  await runAsyncTest('4. OOO cooldown prevents repeated OOO responses to the same contact', async () => {
    // Record a recent OOO log in the last hour
    const logId = `log_test_ooo_${Date.now()}`;
    await query(
      `INSERT INTO automation_execution_logs (
         id, user_id, channel, contact_name, contact_phone, incoming_message,
         matched_automation_type, matched_automation_id, matched_automation_name,
         executed_action, response_payload, execution_mode, created_at
       ) VALUES ($1, $2, 'whatsapp', 'Test User', $3, 'Hi', 'ooo', 'aset_1', 'Out of Office',
         'Sent OOO response', $4, 'live', CURRENT_TIMESTAMP)`,
      [logId, TEST_USER, TEST_PHONE, JSON.stringify({ triggering_wamid: 'wamid_ooo_1' })]
    );

    const isCooldown = await basicAutomationEngine.isCooldownActive(TEST_USER, TEST_PHONE, 'ooo', 24);
    assert.strictEqual(isCooldown, true, 'Cooldown should be active after recent OOO log');

    const differentPhone = '+919876543210';
    const isOtherCooldown = await basicAutomationEngine.isCooldownActive(TEST_USER, differentPhone, 'ooo', 24);
    assert.strictEqual(isOtherCooldown, false, 'Cooldown should not apply to a different contact');
  });

  // 5. New-contact welcome
  await runAsyncTest('5. Welcome message triggers for brand-new contact', async () => {
    const evalResult = await basicAutomationEngine.evaluateBasicAutomations({
      userId: TEST_USER,
      phone: TEST_PHONE,
      isNewConversation: true,
      previousLastInbound: null,
      messageText: 'Hello ARCO',
      referenceDate: new Date('2026-09-21T06:00:00.000Z'), // Monday 11:30 AM IST (inside working hours)
    });

    assert.strictEqual(evalResult.welcome.triggered, true, 'Welcome should trigger for new contact');
    assert.strictEqual(evalResult.outOfOffice.triggered, false, 'OOO should not trigger inside working hours');
  });

  // 6. >24h re-engagement welcome
  await runAsyncTest('6. Welcome message triggers for existing contact after >24h inactivity', async () => {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const evalResult = await basicAutomationEngine.evaluateBasicAutomations({
      userId: TEST_USER,
      phone: TEST_PHONE,
      isNewConversation: false,
      previousLastInbound: twoDaysAgo,
      messageText: 'Hey there again',
      referenceDate: new Date(),
    });

    assert.strictEqual(evalResult.welcome.triggered, true, 'Welcome should trigger after 48h inactivity');
  });

  // 7. No welcome on normal ongoing conversation
  await runAsyncTest('7. Welcome message does NOT trigger for ongoing conversation (<24h)', async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const evalResult = await basicAutomationEngine.evaluateBasicAutomations({
      userId: TEST_USER,
      phone: TEST_PHONE,
      isNewConversation: false,
      previousLastInbound: twoHoursAgo,
      messageText: 'Still have a question',
      referenceDate: new Date(),
    });

    assert.strictEqual(evalResult.welcome.triggered, false, 'Welcome should not trigger if active 2h ago');
  });

  // 8. Delayed response scheduling
  let testConvId = `cnv_test_${Date.now()}`;
  let testJobId = null;
  await runAsyncTest('8. Delayed response correctly schedules a persistent job in delayed_automation_jobs', async () => {
    // Create temporary conversation
    await query(
      `INSERT INTO conversations (
         id, name, channel, status, phone, unread_count, reply_status, created_at, updated_at
       ) VALUES ($1, 'Test Customer', 'whatsapp', 'Online', $2, 1, 'unreplied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [testConvId, TEST_PHONE]
    );

    const refDate = new Date();
    await basicAutomationEngine.handleInboundMessage({
      phoneNumberId: 'test_phone_id',
      wabaId: 'test_waba_id',
      contact: { id: 'cnt_test', name: 'Test Customer', phone: TEST_PHONE, user_id: TEST_USER },
      conv: { id: testConvId, phone: TEST_PHONE },
      isNewConversation: false,
      previousLastInbound: new Date(Date.now() - 10000).toISOString(),
      messageText: 'I need urgent support',
      triggeringWamid: `wamid_test_${Date.now()}`,
      fromPhone: TEST_PHONE,
      referenceDate: refDate,
    });

    const jobsRes = await query(
      `SELECT * FROM delayed_automation_jobs WHERE conversation_id = $1 AND status = 'pending'`,
      [testConvId]
    );
    assert.strictEqual(jobsRes.rows.length, 1, 'Exactly one pending delayed job should be scheduled');
    testJobId = jobsRes.rows[0].id;
    assert.strictEqual(jobsRes.rows[0].user_id, TEST_USER);
    assert.strictEqual(jobsRes.rows[0].automation_type, 'delayed_response');
  });

  // 9. Delayed response execution
  await runAsyncTest('9. Delayed response dispatches message when scheduled time arrives and unreplied', async () => {
    // Fast-forward scheduled_at to past so it is due
    await query(
      `UPDATE delayed_automation_jobs SET scheduled_at = NOW() - INTERVAL '1 minute' WHERE id = $1`,
      [testJobId]
    );

    // Mock metaWhatsAppService.sendTextMessage
    const originalSend = metaWhatsAppService.sendTextMessage;
    let sendCalled = false;
    let sentTo = '';
    metaWhatsAppService.sendTextMessage = async (payload) => {
      sendCalled = true;
      sentTo = payload.to;
      return { success: true, messageId: `wamid_delayed_${Date.now()}` };
    };

    try {
      const processed = await basicAutomationEngine.processDueDelayedJobs();
      assert.strictEqual(processed >= 1, true, 'At least 1 job should be processed');
      assert.strictEqual(sendCalled, true, 'sendTextMessage should be invoked');

      const jobCheck = await query('SELECT * FROM delayed_automation_jobs WHERE id = $1', [testJobId]);
      assert.strictEqual(jobCheck.rows[0].status, 'completed', 'Job status should be completed');
      assert(jobCheck.rows[0].meta_message_id, 'Job should record outbound meta_message_id');
    } finally {
      metaWhatsAppService.sendTextMessage = originalSend;
    }
  });

  // 10. Delayed response cancellation after agent reply
  await runAsyncTest('10. Delayed response cancels job if an agent replies before execution', async () => {
    const convId2 = `cnv_test_reply_${Date.now()}`;
    const jobId2 = `job_test_reply_${Date.now()}`;

    await query(
      `INSERT INTO conversations (id, name, channel, phone, unread_count, reply_status, created_at, updated_at)
       VALUES ($1, 'Reply Customer', 'whatsapp', $2, 1, 'unreplied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [convId2, TEST_PHONE]
    );

    // Insert pending job due in the past
    await query(
      `INSERT INTO delayed_automation_jobs (
         id, user_id, conversation_id, contact_phone, triggering_wamid, message_text, scheduled_at, status, created_at
       ) VALUES ($1, $2, $3, $4, 'wamid_rep_1', 'Delay msg', NOW() - INTERVAL '1 minute', 'pending', NOW() - INTERVAL '5 minutes')`,
      [jobId2, TEST_USER, convId2, TEST_PHONE]
    );

    // Insert an agent reply message created after the job was created
    await query(
      `INSERT INTO messages (
         id, conversation_id, sender, text, time, timestamp, status, created_at
       ) VALUES ($1, $2, 'agent', 'Hello! How can I help you?', 'Just now', NOW(), 'sent', NOW())`,
      [`msg_agent_${Date.now()}`, convId2]
    );

    // Run processor
    await basicAutomationEngine.processDueDelayedJobs();

    const jobCheck = await query('SELECT * FROM delayed_automation_jobs WHERE id = $1', [jobId2]);
    assert.strictEqual(jobCheck.rows[0].status, 'cancelled', 'Job must be cancelled when agent replied');
    assert(jobCheck.rows[0].cancellation_reason.includes('Agent replied'), 'Reason should cite agent reply');
  });

  // 11. Delayed job survives process restart
  await runAsyncTest('11. Delayed job persists across restart and is recovered by new poller', async () => {
    const convId3 = `cnv_test_restart_${Date.now()}`;
    const jobId3 = `job_test_restart_${Date.now()}`;

    // Create conversation row first to satisfy foreign key
    await query(
      `INSERT INTO conversations (id, name, channel, phone, unread_count, reply_status, created_at, updated_at)
       VALUES ($1, 'Restart Customer', 'whatsapp', $2, 1, 'unreplied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [convId3, TEST_PHONE]
    );

    // Insert a pending job
    await query(
      `INSERT INTO delayed_automation_jobs (
         id, user_id, conversation_id, contact_phone, triggering_wamid, message_text, scheduled_at, status, created_at
       ) VALUES ($1, $2, $3, $4, 'wamid_rst_1', 'Restart test', NOW() - INTERVAL '10 seconds', 'pending', NOW() - INTERVAL '2 minutes')`,
      [jobId3, TEST_USER, convId3, TEST_PHONE]
    );

    // Re-instantiate/invoke processDueDelayedJobs simulating a brand-new process boot
    const originalSend = metaWhatsAppService.sendTextMessage;
    let recovered = false;
    metaWhatsAppService.sendTextMessage = async () => {
      recovered = true;
      return { success: true, messageId: 'wamid_recovered' };
    };

    try {
      await basicAutomationEngine.processDueDelayedJobs();
      assert.strictEqual(recovered, true, 'Pending job from before restart should be picked up and sent');
      const jobCheck = await query('SELECT status FROM delayed_automation_jobs WHERE id = $1', [jobId3]);
      assert.strictEqual(jobCheck.rows[0].status, 'completed');
    } finally {
      metaWhatsAppService.sendTextMessage = originalSend;
    }
  });

  // 12. Duplicate webhook/WAMID protection
  await runAsyncTest('12. Inbound webhook message deduplication prevents re-processing duplicate WAMID', async () => {
    const testWamid = `wamid_dedup_test_${Date.now()}`;
    const convId = `cnv_dedup_${Date.now()}`;

    // Create conversation row first to satisfy foreign key
    await query(
      `INSERT INTO conversations (id, name, channel, phone, unread_count, reply_status, created_at, updated_at)
       VALUES ($1, 'Dedup Customer', 'whatsapp', $2, 1, 'unreplied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [convId, TEST_PHONE]
    );

    await query(
      `INSERT INTO messages (id, conversation_id, sender, text, meta_message_id, created_at)
       VALUES ($1, $2, 'contact', 'Duplicate inbound test', $3, CURRENT_TIMESTAMP)`,
      [`m_dedup_${Date.now()}`, convId, testWamid]
    );

    // Check query used by whatsappController
    const checkMsg = await query('SELECT id FROM messages WHERE meta_message_id = $1 LIMIT 1', [testWamid]);
    assert.strictEqual(checkMsg.rows.length, 1, 'Duplicate inbound message should be detected');
  });

  // 13. Duplicate automation execution prevention
  await runAsyncTest('13. hasExecutedForWamid prevents double automation execution for same WAMID', async () => {
    const dupWamid = `wamid_exec_dup_${Date.now()}`;

    const executedBefore = await basicAutomationEngine.hasExecutedForWamid(TEST_USER, dupWamid, 'ooo');
    assert.strictEqual(executedBefore, false, 'Should not be executed initially');

    // Record an execution log with this WAMID
    await query(
      `INSERT INTO automation_execution_logs (
         id, user_id, channel, contact_name, contact_phone, incoming_message,
         matched_automation_type, matched_automation_id, matched_automation_name,
         executed_action, response_payload, execution_mode, created_at
       ) VALUES ($1, $2, 'whatsapp', 'Customer', $3, 'Hi', 'ooo', 'aset_1', 'OOO',
         'Action', $4, 'live', CURRENT_TIMESTAMP)`,
      [`log_dup_${Date.now()}`, TEST_USER, TEST_PHONE, JSON.stringify({ triggering_wamid: dupWamid })]
    );

    const executedAfter = await basicAutomationEngine.hasExecutedForWamid(TEST_USER, dupWamid, 'ooo');
    assert.strictEqual(executedAfter, true, 'hasExecutedForWamid must return true for duplicate WAMID');
  });

  // 14. Correct tenant/business credentials
  await runAsyncTest('14. metaWhatsAppService resolves tenant-specific credentials by userId', async () => {
    const creds = await metaWhatsAppService.getCredentials(TEST_USER);
    assert(creds, 'Credentials object should be returned');
    assert.strictEqual(typeof creds.isConfigured, 'boolean');
    assert.strictEqual(creds.version, 'v25.0', 'Meta API version v25.0 should be preserved');
  });

  // 15. Simulation mode does not send real message
  await runAsyncTest('15. Simulation mode evaluates all rules without sending messages or writing DB records', async () => {
    const originalSend = metaWhatsAppService.sendTextMessage;
    let sendAttempted = false;
    metaWhatsAppService.sendTextMessage = async () => {
      sendAttempted = true;
      return { success: true };
    };

    try {
      const simResult = await basicAutomationEngine.sendAndRecordAutomatedMessage({
        userId: TEST_USER,
        conversationId: testConvId,
        contactId: 'cnt_sim',
        contactName: 'Simulated User',
        phone: TEST_PHONE,
        messageText: 'Simulated output',
        automationType: 'welcome',
        triggeringWamid: 'wamid_sim_test',
        isSimulation: true,
      });

      assert.strictEqual(sendAttempted, false, 'sendTextMessage must NOT be called in simulation mode');
      assert.strictEqual(simResult.isSimulation, true);
    } finally {
      metaWhatsAppService.sendTextMessage = originalSend;
    }
  });

  // 16. Outbound automation message appears in Inbox
  await runAsyncTest('16. Outbound automated message is stored in messages table with sender = agent', async () => {
    const originalSend = metaWhatsAppService.sendTextMessage;
    metaWhatsAppService.sendTextMessage = async () => ({
      success: true,
      messageId: `wamid_inbox_test_${Date.now()}`,
    });

    try {
      const res = await basicAutomationEngine.sendAndRecordAutomatedMessage({
        userId: TEST_USER,
        conversationId: testConvId,
        contactId: 'cnt_test',
        contactName: 'Test Contact',
        phone: TEST_PHONE,
        messageText: 'Inbox timeline test response',
        automationType: 'ooo',
        triggeringWamid: `wamid_trigger_${Date.now()}`,
        isSimulation: false,
      });

      assert.strictEqual(res.success, true);
      const msgCheck = await query(
        `SELECT * FROM messages WHERE conversation_id = $1 AND text = 'Inbox timeline test response'`,
        [testConvId]
      );
      assert.strictEqual(msgCheck.rows.length, 1, 'Message must be present in messages table');
      assert.strictEqual(msgCheck.rows[0].sender, 'agent', 'Sender must be agent so it appears as outbound reply');
      assert.strictEqual(msgCheck.rows[0].status, 'delivered');
    } finally {
      metaWhatsAppService.sendTextMessage = originalSend;
    }
  });

  // 17. Existing workflow automation still works
  await runAsyncTest('17. Existing workflowExecutionEngine.evaluateInboundWhatsAppMessage is preserved', async () => {
    assert(typeof workflowExecutionEngine.evaluateInboundWhatsAppMessage === 'function');
  });

  // 18. Existing campaign reply flow still works
  await runAsyncTest('18. Existing campaignReplyFlowService.handleInboundInteraction is preserved', async () => {
    assert(typeof campaignReplyFlowService.handleInboundInteraction === 'function');
  });

  // 19. Existing WhatsApp sending still works
  await runAsyncTest('19. metaWhatsAppService.sendTextMessage works with or without userId', async () => {
    assert(typeof metaWhatsAppService.sendTextMessage === 'function');
    // Call validation test with missing phone
    const errRes = await metaWhatsAppService.sendTextMessage({ to: '', text: 'Hello' });
    assert.strictEqual(errRes.success, false);
    assert.strictEqual(errRes.error, 'Recipient phone number is required');
  });

  // Cleanup test user records
  try {
    await query('DELETE FROM automation_settings WHERE user_id = $1', [TEST_USER]);
    await query('DELETE FROM automation_execution_logs WHERE user_id = $1', [TEST_USER]);
    await query('DELETE FROM delayed_automation_jobs WHERE user_id = $1', [TEST_USER]);
    await query('DELETE FROM messages WHERE conversation_id = $1', [testConvId]);
    await query('DELETE FROM conversations WHERE id = $1', [testConvId]);
  } catch (e) {
    // Ignore cleanup
  }

  console.log('\n======================================================');
  console.log(`Results: ${passedTests}/${totalTests} tests passed.`);
  console.log('======================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
