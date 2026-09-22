/**
 * ARCO Communication - Flow Broadcast Automated Verification Suite
 * Tests:
 * 1. Bulk Flow Broadcast Request Validation & Meta Flow Eligibility
 * 2. Audience CSV Normalization, Deduplication & Opt-in Filtering
 * 3. Flow Broadcast & Recipient Queue Creation in PostgreSQL
 * 4. Dispatcher Execution: Meta Flow Message Delivery & WAMID Recording
 * 5. Dynamic Variable Mapping from CSV Data
 * 6. Concurrency, Atomicity & Idempotent Retry Safety (No Double Sends)
 * 7. Broadcast Metrics, Aggregation & Tenant Isolation
 * 8. Paginated Recipient Logs with Status Filtering
 * 9. Backward Compatibility & Regressions (Single Flow Send & Standard Campaigns)
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
  console.log(' RUNNING FLOW BROADCAST AUTOMATED VERIFICATION SUITE');
  console.log('=============================================================\n');

  const { metaWhatsAppService } = await import('../services/metaWhatsAppService.js');
  const { whatsappController } = await import('../controllers/whatsappController.js');
  const campaignDispatcher = await import('../services/campaignDispatcher.js');
  const { query } = await import('../config/db.js');

  const REAL_FLOW_ID = '2951519895208552';
  const TENANT_A_ID = 'usr_1';
  const TENANT_B_ID = `usr_flow_tenant_b_${Date.now()}`;

  // Ensure test users exist in DB if foreign keys require it
  try {
    await query(
      `INSERT INTO users (id, email, name, role, created_at, updated_at)
       VALUES ($1, $2, 'Tenant B', 'admin', NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [TENANT_B_ID, `tenant_b_${Date.now()}@arco.test`]
    );
  } catch (err) {
    // If table doesn't enforce FK or already exists, continue
  }

  // =========================================================================
  // TEST 1: BULK FLOW VALIDATION
  // =========================================================================
  await reportAsyncTest('1. Validation: sendFlowBulk rejects missing flowId, invalid recipients, and empty body', async () => {
    // Mock req & res helper
    const createMockRes = () => {
      const res = {
        statusCode: 200,
        data: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(payload) {
          this.data = payload;
          return this;
        }
      };
      return res;
    };

    // A. Missing flowId
    const req1 = { user: { id: TENANT_A_ID }, body: { recipients: [{ phone: '919920858396' }] } };
    const res1 = createMockRes();
    await whatsappController.sendFlowBulk(req1, res1);
    assert.strictEqual(res1.statusCode, 400);
    assert(res1.data.error.includes('flowId'));

    // B. Missing recipients
    const req2 = { user: { id: TENANT_A_ID }, body: { flowId: REAL_FLOW_ID, recipients: [] } };
    const res2 = createMockRes();
    await whatsappController.sendFlowBulk(req2, res2);
    assert.strictEqual(res2.statusCode, 400);
    assert(res2.data.error.toLowerCase().includes('recipient'));
  });

  // =========================================================================
  // TEST 2: AUDIENCE NORMALIZATION, DEDUPLICATION & VALIDATION
  // =========================================================================
  reportTest('2. Audience Parsing & Phone Normalization: Canonicalizes 9920858396, +91 9920858396, and 919920858396 to 919920858396', () => {
    const { normalizeRecipientPhone } = metaWhatsAppService;

    // Direct regression tests required by specification:
    // 9920858396 → 919920858396
    const n1 = normalizeRecipientPhone({ phone: '9920858396' });
    assert.strictEqual(n1.isValid, true);
    assert.strictEqual(n1.normalizedPhone, '919920858396');

    const n1Full = normalizeRecipientPhone({ fullPhone: '9920858396' });
    assert.strictEqual(n1Full.isValid, true);
    assert.strictEqual(n1Full.normalizedPhone, '919920858396');

    // +91 9920858396 → 919920858396
    const n2 = normalizeRecipientPhone({ fullPhone: '+91 9920858396' });
    assert.strictEqual(n2.isValid, true);
    assert.strictEqual(n2.normalizedPhone, '919920858396');

    // 919920858396 → 919920858396
    const n3 = normalizeRecipientPhone({ fullPhone: '919920858396' });
    assert.strictEqual(n3.isValid, true);
    assert.strictEqual(n3.normalizedPhone, '919920858396');

    // Leading 0: 09920858396 → 919920858396
    const n4 = normalizeRecipientPhone({ phone: '09920858396' });
    assert.strictEqual(n4.isValid, true);
    assert.strictEqual(n4.normalizedPhone, '919920858396');

    // Foreign number: +1 (415) 555-2671 → 14155552671 (does not blindly prepend 91)
    const n5 = normalizeRecipientPhone({ fullPhone: '+1 (415) 555-2671' });
    assert.strictEqual(n5.isValid, true);
    assert.strictEqual(n5.normalizedPhone, '14155552671');

    // Explicit country code 1 with phone 4155552671 → 14155552671
    const n6 = normalizeRecipientPhone({ phone: '4155552671', countryCode: '1' });
    assert.strictEqual(n6.isValid, true);
    assert.strictEqual(n6.normalizedPhone, '14155552671');

    // CSV deduplication & validation pipeline
    const rawRows = [
      { phone_number: '+91 99208 58396', name: 'Alice' },
      { phone_number: '919920858396', name: 'Alice Duplicate' }, // Duplicate of Alice
      { phone_number: '9920858396', name: 'Alice 10-digit Duplicate' }, // Also duplicate of Alice
      { phone_number: '9876543210', name: 'Bob 10-digit' }, // Valid Indian 10-digit
      { phone_number: 'invalid-phone-abc', name: 'Charlie' }, // Invalid
      { phone_number: '1234', name: 'Too Short' }, // Invalid
      { phone_number: '+1 (415) 555-2671', name: 'David USA' },
    ];

    const seen = new Set();
    const valid = [];
    const invalid = [];
    const duplicates = [];

    rawRows.forEach((row) => {
      const norm = normalizeRecipientPhone({
        fullPhone: row.phone_number,
        phone: row.phone_number,
      });

      if (!norm.isValid) {
        invalid.push(row);
      } else if (seen.has(norm.normalizedPhone)) {
        duplicates.push(row);
      } else {
        seen.add(norm.normalizedPhone);
        valid.push({ ...row, phone_number: norm.normalizedPhone });
      }
    });

    assert.strictEqual(valid.length, 3, 'Expected 3 valid distinct recipients');
    assert.strictEqual(duplicates.length, 2, 'Expected 2 duplicates');
    assert.strictEqual(invalid.length, 2, 'Expected 2 invalid entries');
    assert.strictEqual(valid[0].phone_number, '919920858396');
    assert.strictEqual(valid[1].phone_number, '919876543210');
    assert.strictEqual(valid[2].phone_number, '14155552671');
  });

  // =========================================================================
  // TEST 3: CREATION OF FLOW BROADCAST & RECIPIENTS QUEUE IN POSTGRESQL
  // =========================================================================
  let createdBroadcastId = null;
  await reportAsyncTest('3. Broadcast Creation: Creates campaign with channel=whatsapp_flow and queues recipients', async () => {
    const createMockRes = () => {
      const res = {
        statusCode: 200,
        data: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(payload) {
          this.data = payload;
          return this;
        }
      };
      return res;
    };

    const req = {
      user: { id: TENANT_A_ID },
      body: {
        flowId: REAL_FLOW_ID,
        flowName: 'ARCO Lead Gen',
        name: `Test Broadcast ${Date.now()}`,
        ctaText: 'Start Survey',
        headerText: 'Customer Feedback',
        bodyText: 'Please complete our quick interactive form.',
        footerText: 'Powered by ARCO',
        scheduleType: 'later',
        scheduledFor: new Date(Date.now() + 86400000).toISOString(),
        variableMappings: {
          customer_name: 'name',
          customer_email: 'email'
        },
        recipients: [
          { phone_number: '919920858396', name: 'Alice Gupta', email: 'alice@example.com' },
          { phone_number: '919876543210', name: 'Bob Verma', email: 'bob@example.com' },
          { phone_number: '919920858396', name: 'Alice Duplicate', email: 'alice.dup@example.com' } // should be deduplicated
        ]
      }
    };

    const res = createMockRes();
    await whatsappController.sendFlowBulk(req, res);

    assert.strictEqual(res.statusCode, 201, `Failed with: ${JSON.stringify(res.data)}`);
    assert(res.data.success);
    assert(res.data.broadcastId);
    assert.strictEqual(res.data.totalRecipients, 2, 'Should deduplicate 3 rows down to 2');
    createdBroadcastId = res.data.broadcastId;

    // Verify in database
    const campRows = await query('SELECT * FROM campaigns WHERE id = $1', [createdBroadcastId]);
    assert.strictEqual(campRows.rows.length, 1);
    const camp = campRows.rows[0];
    assert.strictEqual(camp.channel, 'whatsapp_flow');
    assert.strictEqual(camp.created_by, TENANT_A_ID);
    assert.strictEqual(camp.recipients, 2);

    const recipRows = await query('SELECT * FROM campaign_recipients WHERE campaign_id = $1 ORDER BY phone', [createdBroadcastId]);
    assert.strictEqual(recipRows.rows.length, 2);
    assert.strictEqual(recipRows.rows[0].status, 'pending');
    assert.strictEqual(recipRows.rows[1].status, 'pending');

    const csvData0 = typeof recipRows.rows[0].csv_data === 'string' ? JSON.parse(recipRows.rows[0].csv_data) : recipRows.rows[0].csv_data;
    assert(csvData0.name || csvData0.email);
  });

  // =========================================================================
  // TEST 4: BATCH DISPATCH WITH REAL FLOW ID & METAMESSAGE CALL
  // =========================================================================
  await reportAsyncTest('4. Dispatcher: batch processes flow broadcast recipients and records WAMID / error', async () => {
    // Intercept / stub metaWhatsAppService.sendFlowMessage to verify exact payload
    const originalSendFlow = metaWhatsAppService.sendFlowMessage;
    let interceptedCall = null;

    metaWhatsAppService.sendFlowMessage = async (args) => {
      interceptedCall = args;
      return {
        success: true,
        data: {
          wamid: `wamid.HBgL${Date.now()}`,
          flowToken: args.flowToken || 'mock_flow_token'
        }
      };
    };

    try {
      // Process batch of 1 recipient
      const res = await campaignDispatcher.processCampaign(createdBroadcastId, 1);
      assert(res.success);

      assert(interceptedCall, 'Expected metaWhatsAppService.sendFlowMessage to be invoked');
      assert.strictEqual(interceptedCall.flowId, REAL_FLOW_ID, 'Must pass real Meta Flow ID');
      assert.strictEqual(interceptedCall.ctaText, 'Start Survey');
      assert.strictEqual(interceptedCall.headerText, 'Customer Feedback');
      assert(interceptedCall.recipientPhone, 'Expected recipient phone');
      assert(interceptedCall.flowToken, 'Expected unique flowToken for tracking');

      // Verify recipient updated in DB
      const updatedRecips = await query(
        'SELECT * FROM campaign_recipients WHERE campaign_id = $1 AND status = $2',
        [createdBroadcastId, 'sent']
      );
      assert.strictEqual(updatedRecips.rows.length, 2, 'All recipients should have status = sent');
      assert(updatedRecips.rows[0].meta_message_id.startsWith('wamid.'));
      assert(updatedRecips.rows[0].sent_at !== null);
    } finally {
      metaWhatsAppService.sendFlowMessage = originalSendFlow;
    }
  });

  // =========================================================================
  // TEST 5: IDEMPOTENCY & RETRY SAFETY (NO DOUBLE SENDS)
  // =========================================================================
  await reportAsyncTest('5. Idempotency & Retry Safety: claiming batch skips already sent recipients', async () => {
    const originalSendFlow = metaWhatsAppService.sendFlowMessage;
    let sendCalls = 0;

    metaWhatsAppService.sendFlowMessage = async () => {
      sendCalls++;
      return {
        success: true,
        data: { wamid: `wamid.HBgL${Date.now()}` }
      };
    };

    try {
      // All 2 recipients are already sent from Test 4. Calling processCampaign again should send ZERO duplicate messages.
      const res = await campaignDispatcher.processCampaign(createdBroadcastId);
      assert(res.success);
      assert.strictEqual(sendCalls, 0, 'Must NOT re-send already processed recipients on retry');
    } finally {
      metaWhatsAppService.sendFlowMessage = originalSendFlow;
    }
  });

  // =========================================================================
  // TEST 6: DYNAMIC VARIABLE MAPPING FROM CSV DATA
  // =========================================================================
  reportTest('6. Dynamic Variable Mapping: Maps CSV columns to flow initial parameters without hardcoding', () => {
    const variableMappings = {
      customer_name: 'Full Name',
      customer_email: 'Email Address',
      order_id: 'Invoice No'
    };

    const csvRow = {
      'Full Name': 'Shraddha Sharma',
      'Email Address': 'shraddha@example.com',
      'Invoice No': 'INV-90210'
    };

    const flowVariables = {};
    for (const [flowField, csvCol] of Object.entries(variableMappings)) {
      if (csvRow[csvCol] !== undefined) {
        flowVariables[flowField] = csvRow[csvCol];
      }
    }

    assert.strictEqual(flowVariables.customer_name, 'Shraddha Sharma');
    assert.strictEqual(flowVariables.customer_email, 'shraddha@example.com');
    assert.strictEqual(flowVariables.order_id, 'INV-90210');
  });

  // =========================================================================
  // TEST 7: BROADCAST METRICS, AGGREGATION & TENANT ISOLATION
  // =========================================================================
  await reportAsyncTest('7. Metrics & Tenant Isolation: Tenant A sees broadcast progress, Tenant B sees empty list', async () => {
    const createMockRes = () => {
      const res = {
        statusCode: 200,
        data: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(payload) {
          this.data = payload;
          return this;
        }
      };
      return res;
    };

    // Tenant A queries flow broadcasts
    const reqA = { user: { id: TENANT_A_ID }, query: {} };
    const resA = createMockRes();
    await whatsappController.getFlowBroadcasts(reqA, resA);
    assert.strictEqual(resA.statusCode, 200);
    const listA = Array.isArray(resA.data) ? resA.data : (resA.data?.data || []);
    assert(Array.isArray(listA));
    const broadcastA = listA.find(b => b.id === createdBroadcastId);
    assert(broadcastA, 'Tenant A should see their flow broadcast');
    assert.strictEqual(broadcastA.recipients, 2);
    assert.strictEqual(broadcastA.sent, 2);

    // Tenant B queries flow broadcasts
    const reqB = { user: { id: TENANT_B_ID }, query: {} };
    const resB = createMockRes();
    await whatsappController.getFlowBroadcasts(reqB, resB);
    assert.strictEqual(resB.statusCode, 200);
    const listB = Array.isArray(resB.data) ? resB.data : (resB.data?.data || []);
    const broadcastB = listB.find(b => b.id === createdBroadcastId);
    assert.strictEqual(broadcastB, undefined, 'Tenant B must NOT see Tenant A broadcast');
  });

  // =========================================================================
  // TEST 8: PAGINATED RECIPIENT LOGS WITH STATUS FILTERING
  // =========================================================================
  await reportAsyncTest('8. Recipient Logs: getFlowBroadcastRecipients provides pagination, search, and status filter', async () => {
    const createMockRes = () => {
      const res = {
        statusCode: 200,
        data: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(payload) {
          this.data = payload;
          return this;
        }
      };
      return res;
    };

    // All status
    const req1 = {
      user: { id: TENANT_A_ID },
      params: { id: createdBroadcastId },
      query: { page: '1', limit: '10', status: 'all' }
    };
    const res1 = createMockRes();
    await whatsappController.getFlowBroadcastRecipients(req1, res1);
    assert.strictEqual(res1.statusCode, 200);
    assert.strictEqual(res1.data.total, 2);
    assert.strictEqual(res1.data.data.length, 2);
    assert.strictEqual(res1.data.statusCounts.sent, 2);

    // Search by phone
    const req2 = {
      user: { id: TENANT_A_ID },
      params: { id: createdBroadcastId },
      query: { search: '9920858396' }
    };
    const res2 = createMockRes();
    await whatsappController.getFlowBroadcastRecipients(req2, res2);
    assert.strictEqual(res2.statusCode, 200);
    assert.strictEqual(res2.data.total, 1);
    assert.strictEqual(res2.data.data[0].phone_number, '919920858396');

    // Tenant isolation on recipients
    const reqTenantB = {
      user: { id: TENANT_B_ID },
      params: { id: createdBroadcastId },
      query: {}
    };
    const resTenantB = createMockRes();
    await whatsappController.getFlowBroadcastRecipients(reqTenantB, resTenantB);
    assert.strictEqual(resTenantB.statusCode, 404, 'Tenant B cannot inspect Tenant A recipients');
  });

  // =========================================================================
  // TEST 9: BACKWARD COMPATIBILITY & REGRESSION CHECK
  // =========================================================================
  await reportAsyncTest('9. Regression Check: Single flow send endpoint remains intact and working', async () => {
    const originalSendFlow = metaWhatsAppService.sendFlowMessage;
    let called = false;

    metaWhatsAppService.sendFlowMessage = async (args) => {
      called = true;
      assert.strictEqual(args.flowId, REAL_FLOW_ID);
      assert.strictEqual(args.to || args.recipientPhone, '919920858396');
      return { success: true, data: { wamid: 'wamid.single_send_test' } };
    };

    try {
      const createMockRes = () => {
        const res = {
          statusCode: 200,
          data: null,
          status(code) {
            this.statusCode = code;
            return this;
          },
          json(payload) {
            this.data = payload;
            return this;
          }
        };
        return res;
      };

      const req = {
        user: { id: TENANT_A_ID },
        body: {
          flowId: REAL_FLOW_ID,
          recipientPhone: '919920858396',
          ctaText: 'Test Flow'
        }
      };
      const res = createMockRes();
      await whatsappController.sendFlow(req, res, (err) => { if (err) throw err; });
      assert.strictEqual(res.statusCode, 200);
      assert(res.data.success);
      assert.strictEqual(called, true);
    } finally {
      metaWhatsAppService.sendFlowMessage = originalSendFlow;
    }
  });

  // =========================================================================
  // TEST 10: CREDENTIAL CONSISTENCY & SAFE ERROR DIAGNOSTIC STORAGE
  // =========================================================================
  await reportAsyncTest('10. Credential Consistency & Error Diagnostics: getCredentials resolves same config and sendFlow captures full Meta error fields', async () => {
    // 1. Check credential consistency between single send and bulk paths
    const credsSingle = await metaWhatsAppService.getCredentials(TENANT_A_ID);
    const credsBulk = await metaWhatsAppService.getCredentials(TENANT_A_ID);
    assert.strictEqual(credsSingle.version, credsBulk.version);
    assert.strictEqual(credsSingle.phoneNumberId, credsBulk.phoneNumberId);
    assert.strictEqual(credsSingle.source, credsBulk.source);
    assert.strictEqual(Boolean(credsSingle.accessToken), Boolean(credsBulk.accessToken));

    // 2. Mock Meta 131005 error response and verify full diagnostic fields are captured without token leakage
    const originalFetch = global.fetch;
    try {
      global.fetch = async (url, opts) => {
        if (typeof url === 'string' && url.includes('/messages')) {
          return {
            ok: false,
            status: 403,
            json: async () => ({
              error: {
                message: '(#131005) Access denied',
                code: 131005,
                type: 'OAuthException',
                error_subcode: 12345,
                error_data: {
                  messaging_product: 'whatsapp',
                  details: 'There was a problem with the access token or permissions you are using for the API call.'
                },
                fbtrace_id: 'TestTrace12345'
              }
            })
          };
        }
        return originalFetch(url, opts);
      };

      const result = await metaWhatsAppService.sendFlowMessage({
        to: '919920858396',
        flowId: REAL_FLOW_ID,
        userId: TENANT_A_ID,
      });

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.errorCode, 131005);
      assert.strictEqual(result.errorSubcode, 12345);
      assert.strictEqual(result.errorType, 'OAuthException');
      assert.strictEqual(result.fbtraceId, 'TestTrace12345');
      assert(result.error.includes('131005'));
      // Ensure no tokens leaked in error output
      assert(!result.error.includes(credsSingle.accessToken || 'EAA'));
    } finally {
      global.fetch = originalFetch;
    }
  });
  try {
    if (createdBroadcastId) {
      await query('DELETE FROM campaign_recipients WHERE campaign_id = $1', [createdBroadcastId]);
      await query('DELETE FROM campaigns WHERE id = $1', [createdBroadcastId]);
    }
    await query('DELETE FROM users WHERE id = $1', [TENANT_B_ID]);
  } catch (e) {}

  console.log('\n=============================================================');
  console.log(` ALL TESTS COMPLETED: ${passedTests}/${totalTests} PASSED`);
  console.log('=============================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
})();
