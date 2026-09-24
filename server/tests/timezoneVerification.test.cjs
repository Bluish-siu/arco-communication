const assert = require('assert');
const path = require('path');

// Test utilities
const { toUtcIsoString, parseMetaWebhookTimestamp } = require('../utils/dateUtils.js');

// Dynamically import frontend dateUtils (ESM module)
async function getFrontendDateUtils() {
  const fileUrl = 'file://' + path.resolve(__dirname, '../../src/utils/dateUtils.js').replace(/\\/g, '/');
  return await import(fileUrl);
}

async function runTimezoneTests() {
  console.log('================================================================');
  console.log('🧪 ARCO COMMUNICATION - TIMEZONE & TIMESTAMP VERIFICATION SUITE');
  console.log('================================================================\n');

  const {
    parseToDate,
    formatTime,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    formatMessageTime,
    formatConversationTime,
  } = await getFrontendDateUtils();

  // -------------------------------------------------------------------------
  // TEST 1: End-to-End Real Production Message Verification
  // -------------------------------------------------------------------------
  console.log('Test 1: End-to-End Production WhatsApp Message Verification (WhatsApp Web: 10:37 AM)');
  
  // 1. Meta Webhook payload:
  const metaWebhookTimestamp = 1790226471; // 10-digit Unix epoch seconds
  const metaParsedDate = parseMetaWebhookTimestamp(metaWebhookTimestamp);
  assert(metaParsedDate instanceof Date, 'Meta timestamp must parse to a Date object');
  assert.strictEqual(metaParsedDate.toISOString(), '2026-09-24T05:07:51.000Z', 'Meta timestamp must be 05:07:51 UTC');

  // 2. Database stored timestamp (TIMESTAMPTZ):
  // In production DB: messages.timestamp = '2026-09-24 05:07:51.822+00' (or Date object in pg driver)
  const dbStoredDate = new Date('2026-09-24T05:07:51.822Z');

  // 3. Backend API JSON serialization (toUtcIsoString):
  const backendApiTimestamp = toUtcIsoString(dbStoredDate);
  assert.strictEqual(backendApiTimestamp, '2026-09-24T05:07:51.822Z', 'Backend API must serialize to ISO-8601 UTC string');

  // 4. Frontend displayed timestamp in user local timezone (Asia/Kolkata):
  const istFormattedTime = formatTime(backendApiTimestamp, { timeZone: 'Asia/Kolkata' });
  console.log(`   Meta Webhook:       ${metaWebhookTimestamp} (epoch seconds)`);
  console.log(`   Database Stored:    ${dbStoredDate.toISOString()} (UTC TIMESTAMPTZ)`);
  console.log(`   Backend API:        ${backendApiTimestamp}`);
  console.log(`   Frontend (IST):     ${istFormattedTime}`);
  
  assert.strictEqual(istFormattedTime, '10:37 AM', 'IST display must match WhatsApp Web exactly (10:37 AM)');
  console.log('   ✅ Proved: Exact same instant is preserved from Meta -> DB -> API -> Frontend (10:37 AM IST)\n');

  // -------------------------------------------------------------------------
  // TEST 2: Flow Submission Verification (Previous bug: 08:12 AM UTC = 01:42 PM IST)
  // -------------------------------------------------------------------------
  console.log('Test 2: Flow Submission Instant Verification');
  const flowDbDate = new Date('2026-09-23T08:12:14.821Z');
  const flowApiTimestamp = toUtcIsoString(flowDbDate);
  const flowIstFormatted = formatTime(flowApiTimestamp, { timeZone: 'Asia/Kolkata' });
  console.log(`   Flow Submission UTC: ${flowApiTimestamp}`);
  console.log(`   Flow Submission IST: ${flowIstFormatted}`);
  assert.strictEqual(flowIstFormatted, '01:42 PM', 'Flow submission at 08:12 UTC must display as 01:42 PM IST');
  console.log('   ✅ Proved: Flow submission accurately converted to 01:42 PM IST\n');

  // -------------------------------------------------------------------------
  // TEST 3: Verification of No Hardcoded Offset (Dynamic Multi-Timezone)
  // -------------------------------------------------------------------------
  console.log('Test 3: Dynamic Multi-Timezone Consistency (No Hardcoded +5:30)');
  const testInstant = '2026-09-24T05:07:51.822Z';
  const kolkataTime = formatTime(testInstant, { timeZone: 'Asia/Kolkata' });
  const nyTime = formatTime(testInstant, { timeZone: 'America/New_York' });
  const londonTime = formatTime(testInstant, { timeZone: 'Europe/London' });
  const tokyoTime = formatTime(testInstant, { timeZone: 'Asia/Tokyo' });
  
  console.log(`   UTC:      ${testInstant}`);
  console.log(`   Kolkata:  ${kolkataTime} (Expected 10:37 AM)`);
  console.log(`   New York: ${nyTime} (Expected 01:07 AM)`);
  console.log(`   London:   ${londonTime} (Expected 06:07 AM BST / UTC+1)`);
  console.log(`   Tokyo:    ${tokyoTime} (Expected 02:07 PM)`);

  assert.strictEqual(kolkataTime, '10:37 AM');
  assert.strictEqual(nyTime, '01:07 AM');
  assert.strictEqual(londonTime, '06:07 AM');
  assert.strictEqual(tokyoTime, '02:07 PM');
  console.log('   ✅ Proved: Formatting adapts dynamically to any client timezone without hardcoding\n');

  // -------------------------------------------------------------------------
  // TEST 4: Conversation List vs Conversation Detail Consistency
  // -------------------------------------------------------------------------
  console.log('Test 4: Conversation List & Conversation Detail Timezone Parity');
  const mockChat = {
    id: 'cnv_test_1',
    name: 'Acroo Shopify Test',
    updatedAt: '2026-09-24T05:07:51.822Z',
    messages: [
      {
        id: 'm_test_1',
        text: 'Hi',
        timestamp: '2026-09-24T05:07:51.822Z',
        createdAt: '2026-09-24T05:07:51.822Z',
      },
    ],
  };

  const detailTime = formatMessageTime(mockChat.messages[0], { timeZone: 'Asia/Kolkata' });
  const listTime = formatConversationTime(mockChat, { timeZone: 'Asia/Kolkata' });
  console.log(`   Conversation Detail Message Time: ${detailTime}`);
  console.log(`   Conversation List Last Message Time: ${listTime}`);
  assert.strictEqual(detailTime, '10:37 AM', 'Detail message must be 10:37 AM');
  assert.strictEqual(listTime, '10:37 AM', 'Sidebar conversation list must be 10:37 AM');
  console.log('   ✅ Proved: Conversation list and detail message use identical timezone conversion\n');

  // -------------------------------------------------------------------------
  // TEST 5: Lifecycle Timestamps (Inbound, Outbound, Flow, Campaign)
  // -------------------------------------------------------------------------
  console.log('Test 5: Full Lifecycle Timestamps');
  
  // Inbound WhatsApp Message
  const inboundMsg = {
    id: 'm_inbound',
    sender: 'them',
    text: 'Interested in product',
    timestamp: '2026-09-24T05:07:51.822Z',
  };
  assert.strictEqual(formatMessageTime(inboundMsg, { timeZone: 'Asia/Kolkata' }), '10:37 AM');

  // Outbound WhatsApp Message
  const outboundMsg = {
    id: 'm_outbound',
    sender: 'me',
    text: 'Hello! Here is the catalog.',
    timestamp: '2026-09-24T05:10:00.000Z',
  };
  assert.strictEqual(formatMessageTime(outboundMsg, { timeZone: 'Asia/Kolkata' }), '10:40 AM');

  // Campaign Sent, Delivered, Read timestamps
  const campaignRecipient = {
    id: 'rcp_1',
    phone: '919876543210',
    sentAt: '2026-09-24T04:30:00.000Z',     // 10:00 AM IST
    deliveredAt: '2026-09-24T04:30:15.000Z', // 10:00 AM IST
    readAt: '2026-09-24T04:35:00.000Z',      // 10:05 AM IST
  };
  assert.strictEqual(formatTime(campaignRecipient.sentAt, { timeZone: 'Asia/Kolkata' }), '10:00 AM');
  assert.strictEqual(formatTime(campaignRecipient.deliveredAt, { timeZone: 'Asia/Kolkata' }), '10:00 AM');
  assert.strictEqual(formatTime(campaignRecipient.readAt, { timeZone: 'Asia/Kolkata' }), '10:05 AM');

  // Campaign Scheduled For and Sent At date time
  const campaign = {
    scheduledFor: '2026-09-24T04:30:00.000Z',
    sentAt: '2026-09-24T04:30:00.000Z',
  };
  const formattedCampTime = formatDateTime(campaign.sentAt, { timeZone: 'Asia/Kolkata' });
  console.log(`   Campaign Sent At (IST): ${formattedCampTime}`);
  assert(formattedCampTime.includes('10:00 AM'), 'Campaign sent at must include 10:00 AM');
  console.log('   ✅ Proved: Inbound, outbound, campaign sent/delivered/read all format accurately\n');

  // -------------------------------------------------------------------------
  // TEST 6: Historical Fallback and Robust Parsing
  // -------------------------------------------------------------------------
  console.log('Test 6: Historical Messages & Graceful Fallbacks');
  // Legacy message with pre-existing string
  const legacyMsg = { id: 'm_legacy', text: 'Old message', time: '11:20 PM' };
  assert.strictEqual(formatMessageTime(legacyMsg), '11:20 PM', 'Legacy string time should fallback cleanly');

  // Stringified epoch seconds
  const stringEpoch = parseToDate('1790226471');
  assert.strictEqual(stringEpoch.toISOString(), '2026-09-24T05:07:51.000Z');

  // Milliseconds epoch number
  const msEpoch = parseToDate(1790226471822);
  assert.strictEqual(msEpoch.toISOString(), '2026-09-24T05:07:51.822Z');

  // Naive SQL timestamp string (e.g. "2026-09-24 05:07:51.822")
  const naiveSqlDate = parseToDate('2026-09-24 05:07:51.822');
  assert.strictEqual(naiveSqlDate.toISOString(), '2026-09-24T05:07:51.822Z', 'Naive SQL string must be parsed as UTC');

  // Invalid inputs
  assert.strictEqual(parseToDate(null), null);
  assert.strictEqual(parseToDate(undefined), null);
  assert.strictEqual(parseToDate('invalid'), null);
  assert.strictEqual(formatTime(null), '—');
  console.log('   ✅ Proved: Graceful fallback for legacy, invalid, and naive SQL timestamps\n');

  console.log('================================================================');
  console.log('🎉 ALL TIMEZONE & TIMESTAMP VERIFICATION TESTS PASSED!');
  console.log('================================================================\n');
}

runTimezoneTests().catch((err) => {
  console.error('❌ Timezone test failure:', err);
  process.exit(1);
});
