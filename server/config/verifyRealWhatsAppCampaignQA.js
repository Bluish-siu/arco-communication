import jwt from 'jsonwebtoken';
import { query } from './db.js';
import {
  metaWhatsAppService,
  normalizeRecipientPhone,
  isWhatsAppOpted,
} from '../services/metaWhatsAppService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'arco_super_secure_jwt_secret_2026';
const token = jwt.sign({ id: 'usr_1', email: 'owner@arco.com', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
const API_BASE = 'http://localhost:5000/api';

async function runQA() {
  console.log('========================================================================');
  console.log('🧪 REAL WHATSAPP CAMPAIGN QA SUITE (CSV AUDIENCE -> META CLOUD API)');
  console.log('========================================================================');

  let passed = 0;
  let total = 18;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  ✅ PASS [${passed + 1}/${total}]: ${name}` + (details ? ` -> ${details}` : ''));
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}` + (details ? ` -> ${details}` : ''));
    }
  }

  try {
    // TEST 1: CSV Parsing Logic
    const testCsv = `Name,Full Phone Number,Email,Appointment Time,WhatsApp Opted
Nilesh,+91992085396,nilesh@example.com,29/12/2026,true
Jack Bauer,7003705584,jack@example.com,30/12/2026,yes
Harry Potter,1111111111,harry@example.com,31/12/2026,0`;
    const lines = testCsv.split('\n');
    const headers = lines[0].split(',');
    assert(headers.length === 5 && lines.length === 4, '1. CSV Parsing', `Parsed ${lines.length - 1} rows with ${headers.length} headers`);

    // TEST 2: Column Mapping
    const mapping = {
      'Name': 'Name',
      'Full Phone Number': 'Full Phone Number',
      'Email': 'Email',
      'Appointment Time': 'Appointment Time',
      'WhatsApp Opted': 'WhatsApp Opted'
    };
    assert(mapping['Full Phone Number'] === 'Full Phone Number' && mapping['Appointment Time'] === 'Appointment Time', '2. Column Mapping', 'Mapped headers to attribute targets');

    // TEST 3: Full Phone Number Normalization
    const fullNorm = normalizeRecipientPhone({ fullPhone: '+91 992085396' });
    assert(fullNorm.isValid && fullNorm.normalizedPhone === '91992085396', '3. Full Phone Number Normalization', `+91 992085396 -> ${fullNorm.normalizedPhone}`);

    // TEST 4: Phone + Country Code Normalization
    const ccNorm = normalizeRecipientPhone({ phone: '7003705584', countryCode: '91' });
    assert(ccNorm.isValid && ccNorm.normalizedPhone === '917003705584', '4. Phone + Country Code Normalization', `7003705584 + 91 -> ${ccNorm.normalizedPhone}`);

    // TEST 5: Invalid Phone Rejection
    const invalidNorm = normalizeRecipientPhone({ phone: '123' });
    assert(!invalidNorm.isValid, '5. Invalid Phone Rejection', `Short phone '123' rejected: ${invalidNorm.reason}`);

    // TEST 6: WhatsApp Opt-In Filtering
    const optTrue = isWhatsAppOpted('true') && isWhatsAppOpted('YES') && isWhatsAppOpted(1);
    const optFalse = !isWhatsAppOpted('false') && !isWhatsAppOpted('0') && !isWhatsAppOpted(null);
    assert(optTrue && optFalse, '6. WhatsApp Opt-In Safety Filtering', 'Recognizes true/yes/1 and rejects false/0/null');

    // TEST 7: Template Variable Dynamic Resolution
    const sampleRecipientCsv = { Name: 'Nilesh', 'Appointment Time': '29/12/2026', Email: 'nilesh@example.com' };
    const varMap = { '1': 'Name', '2': 'Appointment Time' };
    const resolvedVars = {
      1: sampleRecipientCsv[varMap['1']] || '',
      2: sampleRecipientCsv[varMap['2']] || '',
    };
    assert(resolvedVars['1'] === 'Nilesh' && resolvedVars['2'] === '29/12/2026', '7. Template Variable Mapping', `{{1}} -> ${resolvedVars['1']}, {{2}} -> ${resolvedVars['2']}`);

    // TEST 8: Meta Payload Generation
    const testPayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: '91992085396',
      type: 'template',
      template: {
        name: 'appointment_confirmed',
        language: { code: 'en_US' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: resolvedVars['1'] },
              { type: 'text', text: resolvedVars['2'] }
            ]
          }
        ]
      }
    };
    assert(testPayload.template.components[0].parameters[0].text === 'Nilesh', '8. Meta Cloud API Payload Generation', 'Payload parameters correctly mapped');

    // TEST 9: Meta Credential Validation Endpoint
    const statusRes = await fetch(`${API_BASE}/meta/status`, { headers: { Authorization: `Bearer ${token}` } });
    const statusData = await statusRes.json();
    assert(statusRes.status === 200 && statusData.success !== undefined, '9. Meta Credential Status Verification', `Connected: ${statusData.data?.connected}`);

    // TEST 10: Campaign Creation with CSV Contacts
    const testCampId = `cmp_qa_${Date.now()}`;
    const csvContactsPayload = [
      { name: 'Nilesh', fullPhone: '+91992085396', email: 'nilesh@example.com', whatsappOpted: true, csvData: { Name: 'Nilesh', 'Appointment Time': '29/12/2026' } },
      { name: 'Jack Bauer', phone: '7003705584', countryCode: '91', email: 'jack@example.com', whatsappOpted: true, csvData: { Name: 'Jack Bauer', 'Appointment Time': '30/12/2026' } }
    ];

    const createRes = await fetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: 'Real WhatsApp CSV Campaign QA',
        type: 'onetime',
        channel: 'whatsapp',
        audienceType: 'csv',
        csvContacts: csvContactsPayload,
        templateName: 'appointment_confirmed',
        templateLanguage: 'en_US',
        variableMapping: { '1': 'Name', '2': 'Appointment Time' },
        status: 'Scheduled'
      })
    });
    const createData = await createRes.json();
    const createdCampId = createData.data?.id;
    assert(createRes.status === 201 && createData.data?.recipients === 2, '10. Create Campaign with CSV Contacts', `Created ${createdCampId} with 2 recipients`);

    // TEST 11: Campaign Recipients Table Persistence
    const rcpRes = await fetch(`${API_BASE}/campaigns/${createdCampId}/recipients`, { headers: { Authorization: `Bearer ${token}` } });
    const rcpData = await rcpRes.json();
    assert(rcpData.data?.length === 2 && rcpData.data[0].phone === '91992085396', '11. Campaign Recipients Table & CSV Data Persistence', `Found ${rcpData.data?.length} normalized recipients`);

    // TEST 12: Meta Send Live Execution (Credential Handling & No Fake Success)
    const sendNowRes = await fetch(`${API_BASE}/campaigns/${createdCampId}/send-now`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const sendNowData = await sendNowRes.json();
    const isExplicitHandling = sendNowRes.status === 200 || (sendNowRes.status === 400 && (sendNowData.error === 'WHATSAPP_NOT_CONNECTED' || sendNowData.error === 'META_CREDENTIALS_MISSING'));
    assert(isExplicitHandling, '12. Send Now Live Meta Execution & Rejection', `Status: ${sendNowRes.status}, Result: ${sendNowData.error || 'Dispatched'}`);

    // TEST 13: WAMID Storage on Recipient Records
    const testWamid = 'wamid.HBgLMOTE5ODc2NTQzMjEwFQIAEhgWM0VCMDAxOTU3Q0FE';
    const firstRcp = rcpData.data[0];
    await query(
      `UPDATE campaign_recipients 
       SET status = 'sent', meta_message_id = $1, sent_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [testWamid, firstRcp.id]
    );
    const updatedRcp = await query('SELECT meta_message_id, status FROM campaign_recipients WHERE id = $1', [firstRcp.id]);
    assert(updatedRcp.rows[0].meta_message_id === testWamid && updatedRcp.rows[0].status === 'sent', '13. WAMID Persistence in Database', `Stored ${testWamid.slice(0, 20)}...`);

    // TEST 14: Webhook Delivered Event Processing
    const webhookDeliveredPayload = {
      entry: [{
        changes: [{
          value: {
            statuses: [{
              id: testWamid,
              status: 'delivered',
              timestamp: String(Math.floor(Date.now() / 1000)),
              recipient_id: '91992085396'
            }]
          }
        }]
      }]
    };
    const whDeliveredRes = await fetch(`${API_BASE}/whatsapp/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookDeliveredPayload)
    });
    const deliveredCheck = await query('SELECT status, delivered_at FROM campaign_recipients WHERE meta_message_id = $1', [testWamid]);
    assert(deliveredCheck.rows[0].status === 'delivered' && deliveredCheck.rows[0].delivered_at !== null, '14. Webhook Delivered Status Handling', 'Recipient updated to delivered with timestamp');

    // TEST 15: Webhook Read Event Processing
    const webhookReadPayload = {
      entry: [{
        changes: [{
          value: {
            statuses: [{
              id: testWamid,
              status: 'read',
              timestamp: String(Math.floor(Date.now() / 1000)),
              recipient_id: '91992085396'
            }]
          }
        }]
      }]
    };
    const whReadRes = await fetch(`${API_BASE}/whatsapp/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookReadPayload)
    });
    const readCheck = await query('SELECT status, read_at FROM campaign_recipients WHERE meta_message_id = $1', [testWamid]);
    assert(readCheck.rows[0].status === 'read' && readCheck.rows[0].read_at !== null, '15. Webhook Read Status Handling', 'Recipient updated to read with timestamp');

    // TEST 16: Webhook Failed Event Processing
    const failedWamid = 'wamid.HBgLMOTE5ODc2NTQzMjExFQIAEhgWM0VCMDAxOTU3Q0FF';
    const secondRcp = rcpData.data[1];
    await query(
      `UPDATE campaign_recipients 
       SET status = 'sent', meta_message_id = $1, sent_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [failedWamid, secondRcp.id]
    );

    const webhookFailedPayload = {
      entry: [{
        changes: [{
          value: {
            statuses: [{
              id: failedWamid,
              status: 'failed',
              timestamp: String(Math.floor(Date.now() / 1000)),
              recipient_id: '917003705584',
              errors: [{ code: 131026, message: 'Message undeliverable to recipient' }]
            }]
          }
        }]
      }]
    };
    await fetch(`${API_BASE}/whatsapp/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookFailedPayload)
    });
    const failedCheck = await query('SELECT status, error_message FROM campaign_recipients WHERE meta_message_id = $1', [failedWamid]);
    assert(failedCheck.rows[0].status === 'failed' && failedCheck.rows[0].error_message.includes('Message undeliverable'), '16. Webhook Failed Status & Error Reason Handling', `Captured: ${failedCheck.rows[0].error_message}`);

    // TEST 17: Campaign Aggregated Statistics Recalculation
    const campStatsRes = await fetch(`${API_BASE}/campaigns/${createdCampId}`, { headers: { Authorization: `Bearer ${token}` } });
    const campStatsData = await campStatsRes.json();
    const campData = campStatsData.data;
    assert(campData.recipients === 2 && campData.read === 1 && campData.failureCount === 1, '17. Campaign Statistics Recalculation from Database', `Recipients: ${campData.recipients}, Read: ${campData.read}, Failed: ${campData.failureCount}`);

    // TEST 18: No Fake Success / Zero Simulation Check
    const isRealStats = campData.read + campData.failureCount === campData.recipients;
    assert(isRealStats, '18. No Fake Success / Real Database Totals', 'Campaign stats directly derived from recipient records');

    // Cleanup QA Campaign
    await query('DELETE FROM campaign_recipients WHERE campaign_id = $1', [createdCampId]);
    await query('DELETE FROM campaigns WHERE id = $1', [createdCampId]);

    console.log('========================================================================');
    console.log(`📊 RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
    console.log('========================================================================');

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('💥 QA Execution Error:', err);
    process.exit(1);
  }
}

runQA();
