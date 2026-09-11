/**
 * ARCO Communication - Campaign Dispatch Engine Verification Suite
 * Tests atomic recipient claiming (FOR UPDATE SKIP LOCKED), opt-in safety,
 * persistent background dispatcher, scheduled campaign poller, asynchronous sendNow,
 * safe processBatch, stale failure recovery, and campaign state transitions.
 * 
 * NOTE: All Meta API interactions are strictly mocked/stubbed. ZERO real WhatsApp messages sent.
 */

const assert = require('assert');
const path = require('path');
const { Pool } = require('pg');

// Load environment variables
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

async function runAllTests() {
  console.log('========================================================================');
  console.log('🚀 CAMPAIGN DISPATCH ENGINE VERIFICATION SUITE');
  console.log('========================================================================\n');

  // Dynamic import of ES modules
  const {
    claimNextRecipientBatch,
    dispatchBatch,
    recalculateCampaignStats,
    processCampaign,
    pollAndProcessDueCampaigns,
    recoverStaleProcessing,
    failNonOptedRecipients,
    activeCampaignRuns,
  } = await import('../services/campaignDispatcher.js');

  const { metaWhatsAppService } = await import('../services/metaWhatsAppService.js');
  const { campaignController } = await import('../controllers/campaignController.js');

  // Save original sendTemplateMessage to restore later
  const originalSendTemplateMessage = metaWhatsAppService.sendTemplateMessage;

  // Global mock to ensure ZERO real Meta network requests are ever made
  metaWhatsAppService.sendTemplateMessage = async ({ to }) => {
    return { success: true, wamid: `wamid_mock_${to || Date.now()}` };
  };

  try {
    // Initial cleanup of any lingering test records from interrupted runs
    await pool.query("DELETE FROM campaign_recipients WHERE id LIKE 'rcp_t%'");
    await pool.query("DELETE FROM campaigns WHERE id LIKE 'cmp_t%'");

    // -------------------------------------------------------------------------
    // TEST 1: Two simultaneous send-now attempts cannot start two dispatches
    // -------------------------------------------------------------------------
    await reportAsyncTest('TEST 1: Two simultaneous send-now attempts cannot start two dispatches', async () => {
      const campId = `cmp_t1_${Date.now()}`;
      await pool.query(`
        INSERT INTO campaigns (id, name, status, scheduled_for, created_at, updated_at)
        VALUES ($1, 'Test Simultaneous Send Now', 'Scheduled', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [campId]);

      const rcpId = `rcp_t1_${Date.now()}`;
      await pool.query(`
        INSERT INTO campaign_recipients (id, campaign_id, name, phone, status, whatsapp_opted)
        VALUES ($1, $2, 'User 1', '919876543210', 'pending', true)
      `, [rcpId, campId]);

      // Mock req/res for campaignController.sendNow
      let res1Status = 200;
      let res1Data = null;
      let res2Status = 200;
      let res2Data = null;

      const req1 = { params: { id: campId } };
      const res1 = {
        status: (code) => { res1Status = code; return res1; },
        json: (data) => { res1Data = data; return res1; },
      };

      const req2 = { params: { id: campId } };
      const res2 = {
        status: (code) => { res2Status = code; return res2; },
        json: (data) => { res2Data = data; return res2; },
      };

      // Fire both sendNow calls simultaneously
      await Promise.all([
        campaignController.sendNow(req1, res1, (err) => { if (err) throw err; }),
        campaignController.sendNow(req2, res2, (err) => { if (err) throw err; }),
      ]);

      const successCalls = [res1Data, res2Data].filter((d) => d && d.success === true);
      const conflictCalls = [
        { status: res1Status, data: res1Data },
        { status: res2Status, data: res2Data },
      ].filter((r) => r.status === 409 || (r.data && r.data.error === 'CAMPAIGN_ALREADY_SENDING'));

      assert.strictEqual(successCalls.length, 1, 'Exactly one sendNow call must succeed');
      assert.strictEqual(conflictCalls.length, 1, 'Second sendNow call must be rejected as CAMPAIGN_ALREADY_SENDING');

      // Wait a tick for background worker to settle
      await new Promise((r) => setTimeout(r, 100));

      // Cleanup
      await pool.query('DELETE FROM campaign_recipients WHERE campaign_id = $1', [campId]);
      await pool.query('DELETE FROM campaigns WHERE id = $1', [campId]);
    });

    // -------------------------------------------------------------------------
    // TEST 2: Two simultaneous process-batch calls cannot claim the same recipient
    // -------------------------------------------------------------------------
    await reportAsyncTest('TEST 2: Two simultaneous process-batch calls cannot claim the same recipient (FOR UPDATE SKIP LOCKED)', async () => {
      const campId = `cmp_t2_${Date.now()}`;
      await pool.query(`
        INSERT INTO campaigns (id, name, status, created_at, updated_at)
        VALUES ($1, 'Test Safe Process Batch', 'Sending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [campId]);

      // Seed 4 recipients
      for (let i = 1; i <= 4; i++) {
        await pool.query(`
          INSERT INTO campaign_recipients (id, campaign_id, name, phone, status, whatsapp_opted, batch_number)
          VALUES ($1, $2, $3, $4, 'pending', true, 1)
        `, [`rcp_t2_${i}`, campId, `User ${i}`, `91987654321${i}`]);
      }

      // Execute two simultaneous batch claims for 2 items each
      const [claimA, claimB] = await Promise.all([
        claimNextRecipientBatch(campId, 2),
        claimNextRecipientBatch(campId, 2),
      ]);

      const idsA = claimA.map((r) => r.id);
      const idsB = claimB.map((r) => r.id);

      assert.strictEqual(idsA.length, 2, 'Batch A must claim 2 rows');
      assert.strictEqual(idsB.length, 2, 'Batch B must claim 2 rows');

      // Verify zero overlap
      const overlap = idsA.filter((id) => idsB.includes(id));
      assert.strictEqual(overlap.length, 0, `There must be NO overlapping recipient claims! Found: ${overlap.join(', ')}`);

      // Verify all 4 rows are now 'processing'
      const checkRes = await pool.query(
        "SELECT COUNT(*) as cnt FROM campaign_recipients WHERE campaign_id = $1 AND status = 'processing'",
        [campId]
      );
      assert.strictEqual(parseInt(checkRes.rows[0].cnt, 10), 4, 'All 4 recipients must be marked processing');

      // Cleanup
      await pool.query('DELETE FROM campaign_recipients WHERE campaign_id = $1', [campId]);
      await pool.query('DELETE FROM campaigns WHERE id = $1', [campId]);
    });

    // -------------------------------------------------------------------------
    // TEST 3: Non-opted recipient never reaches Meta dispatch
    // -------------------------------------------------------------------------
    await reportAsyncTest('TEST 3: Non-opted recipient never reaches Meta dispatch', async () => {
      const campId = `cmp_t3_${Date.now()}`;
      const contactOptOutId = `cnt_t3_optout_${Date.now()}`;

      // Insert contact that has whatsapp_opted = false
      await pool.query(`
        INSERT INTO contacts (id, name, phone, whatsapp_opted, created_at, updated_at)
        VALUES ($1, 'Opted Out Contact', '919876500003', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [contactOptOutId]);

      await pool.query(`
        INSERT INTO campaigns (id, name, status, template_name, created_at, updated_at)
        VALUES ($1, 'Test Opt In Safety', 'Sending', 'promo_offer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [campId]);

      // Seed 3 recipients:
      // R1: opted in
      // R2: whatsapp_opted = false on recipient row
      // R3: whatsapp_opted = true on recipient, but linked contact has whatsapp_opted = false!
      await pool.query(`
        INSERT INTO campaign_recipients (id, campaign_id, name, phone, status, whatsapp_opted)
        VALUES ('rcp_t3_1', $1, 'User Opted', '919876500001', 'pending', true)
      `, [campId]);

      await pool.query(`
        INSERT INTO campaign_recipients (id, campaign_id, name, phone, status, whatsapp_opted)
        VALUES ('rcp_t3_2', $1, 'User Direct Non-Opt', '919876500002', 'pending', false)
      `, [campId]);

      await pool.query(`
        INSERT INTO campaign_recipients (id, campaign_id, contact_id, name, phone, status, whatsapp_opted)
        VALUES ('rcp_t3_3', $1, $2, 'User Contact Non-Opt', '919876500003', 'pending', true)
      `, [campId, contactOptOutId]);

      // Track calls to Meta
      const metaDispatchedPhones = [];
      metaWhatsAppService.sendTemplateMessage = async ({ to }) => {
        metaDispatchedPhones.push(to);
        return { success: true, wamid: `wamid_t3_${to}` };
      };

      // Claim batch
      const claimed = await claimNextRecipientBatch(campId, 10);

      // Only recipient 1 should have been claimed!
      assert.strictEqual(claimed.length, 1, 'Only the opted-in recipient should be claimed');
      assert.strictEqual(claimed[0].id, 'rcp_t3_1', 'Only rcp_t3_1 should be claimed');

      // Dispatch claimed batch
      await dispatchBatch({ template_name: 'promo_offer' }, claimed);

      // Verify calls to Meta API: ONLY 1 recipient dispatched
      assert.strictEqual(metaDispatchedPhones.length, 1, 'Meta API should only be called once');
      assert.strictEqual(metaDispatchedPhones[0], '919876500001', 'Meta API must only receive opted-in phone');

      // Check statuses in database for non-opted recipients
      const nonOptRes = await pool.query(
        "SELECT id, status, error_message, error_code FROM campaign_recipients WHERE campaign_id = $1 AND id IN ('rcp_t3_2', 'rcp_t3_3')",
        [campId]
      );

      assert.strictEqual(nonOptRes.rows.length, 2, 'Both non-opted rows must exist');
      for (const row of nonOptRes.rows) {
        assert.strictEqual(row.status, 'failed', `Recipient ${row.id} must be marked failed`);
        assert.strictEqual(row.error_message, 'WhatsApp opt-in missing', `Recipient ${row.id} must have opt-in missing message`);
        assert.strictEqual(row.error_code, 'OPT_IN_REQUIRED', `Recipient ${row.id} must have OPT_IN_REQUIRED code`);
      }

      // Cleanup
      await pool.query('DELETE FROM campaign_recipients WHERE campaign_id = $1', [campId]);
      await pool.query('DELETE FROM campaigns WHERE id = $1', [campId]);
      await pool.query('DELETE FROM contacts WHERE id = $1', [contactOptOutId]);
    });

    // -------------------------------------------------------------------------
    // TEST 4: Scheduled campaign whose scheduled_for is in the past gets picked up
    // -------------------------------------------------------------------------
    await reportAsyncTest('TEST 4: Scheduled campaign whose scheduled_for is in the past gets picked up', async () => {
      const campId = `cmp_t4_${Date.now()}`;
      await pool.query(`
        INSERT INTO campaigns (id, name, status, scheduled_for, created_at, updated_at)
        VALUES ($1, 'Test Past Schedule', 'Scheduled', CURRENT_TIMESTAMP - INTERVAL '5 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [campId]);

      // Seed 1 recipient
      await pool.query(`
        INSERT INTO campaign_recipients (id, campaign_id, name, phone, status, whatsapp_opted)
        VALUES ('rcp_t4_1', $1, 'User Past', '919876543244', 'pending', true)
      `, [campId]);

      metaWhatsAppService.sendTemplateMessage = async () => ({ success: true, wamid: 'wamid_t4' });

      // Run poller
      await pollAndProcessDueCampaigns();

      // Check campaign status transitioned
      const checkRes = await pool.query('SELECT status FROM campaigns WHERE id = $1', [campId]);
      assert(
        ['Sending', 'Completed'].includes(checkRes.rows[0].status),
        `Past scheduled campaign should transition to Sending or Completed (got: ${checkRes.rows[0].status})`
      );

      // Cleanup
      await pool.query('DELETE FROM campaign_recipients WHERE campaign_id = $1', [campId]);
      await pool.query('DELETE FROM campaigns WHERE id = $1', [campId]);
    });

    // -------------------------------------------------------------------------
    // TEST 5: Scheduled campaign whose scheduled_for is in the future does not get picked up
    // -------------------------------------------------------------------------
    await reportAsyncTest('TEST 5: Scheduled campaign whose scheduled_for is in the future does not get picked up', async () => {
      const campId = `cmp_t5_${Date.now()}`;
      await pool.query(`
        INSERT INTO campaigns (id, name, status, scheduled_for, created_at, updated_at)
        VALUES ($1, 'Test Future Schedule', 'Scheduled', CURRENT_TIMESTAMP + INTERVAL '2 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [campId]);

      // Run poller
      await pollAndProcessDueCampaigns();

      // Check campaign status remained Scheduled
      const checkRes = await pool.query('SELECT status FROM campaigns WHERE id = $1', [campId]);
      assert.strictEqual(checkRes.rows[0].status, 'Scheduled', 'Future scheduled campaign must remain Scheduled');

      // Cleanup
      await pool.query('DELETE FROM campaigns WHERE id = $1', [campId]);
    });

    // -------------------------------------------------------------------------
    // TEST 6: Successful Meta response stores WAMID and status=sent
    // -------------------------------------------------------------------------
    await reportAsyncTest('TEST 6: Successful Meta response stores WAMID and status=sent', async () => {
      const campId = `cmp_t6_${Date.now()}`;
      await pool.query(`
        INSERT INTO campaigns (id, name, status, created_at, updated_at)
        VALUES ($1, 'Test Meta Success', 'Sending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [campId]);

      await pool.query(`
        INSERT INTO campaign_recipients (id, campaign_id, name, phone, status, whatsapp_opted)
        VALUES ('rcp_t6_1', $1, 'Success User', '919876543266', 'pending', true)
      `, [campId]);

      const testWamid = `wamid.HBgM${Date.now()}TEST6`;
      metaWhatsAppService.sendTemplateMessage = async () => ({
        success: true,
        wamid: testWamid,
        status: 'accepted',
      });

      const batch = await claimNextRecipientBatch(campId, 1);
      await dispatchBatch({ template_name: 'promo' }, batch);

      const rcpRes = await pool.query(
        'SELECT status, meta_message_id, sent_at, error_message FROM campaign_recipients WHERE id = $1',
        ['rcp_t6_1']
      );

      assert.strictEqual(rcpRes.rows[0].status, 'sent', 'Recipient must be status=sent');
      assert.strictEqual(rcpRes.rows[0].meta_message_id, testWamid, 'Recipient must have stored WAMID');
      assert(rcpRes.rows[0].sent_at !== null, 'sent_at must be populated');
      assert.strictEqual(rcpRes.rows[0].error_message, null, 'error_message must be null');

      // Cleanup
      await pool.query('DELETE FROM campaign_recipients WHERE campaign_id = $1', [campId]);
      await pool.query('DELETE FROM campaigns WHERE id = $1', [campId]);
    });

    // -------------------------------------------------------------------------
    // TEST 7: Meta failure stores failed status/error
    // -------------------------------------------------------------------------
    await reportAsyncTest('TEST 7: Meta failure stores failed status/error', async () => {
      const campId = `cmp_t7_${Date.now()}`;
      await pool.query(`
        INSERT INTO campaigns (id, name, status, created_at, updated_at)
        VALUES ($1, 'Test Meta Failure', 'Sending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [campId]);

      await pool.query(`
        INSERT INTO campaign_recipients (id, campaign_id, name, phone, status, whatsapp_opted)
        VALUES ('rcp_t7_1', $1, 'Fail User', '919876543277', 'pending', true)
      `, [campId]);

      metaWhatsAppService.sendTemplateMessage = async () => ({
        success: false,
        error: 'Recipient phone not in Meta Allowed Numbers list',
        errorCode: '131030',
      });

      const batch = await claimNextRecipientBatch(campId, 1);
      await dispatchBatch({ template_name: 'promo' }, batch);

      const rcpRes = await pool.query(
        'SELECT status, failed_at, error_message, error_code FROM campaign_recipients WHERE id = $1',
        ['rcp_t7_1']
      );

      assert.strictEqual(rcpRes.rows[0].status, 'failed', 'Recipient must be status=failed');
      assert(rcpRes.rows[0].failed_at !== null, 'failed_at must be populated');
      assert.strictEqual(rcpRes.rows[0].error_code, '131030', 'error_code must be stored');
      assert(rcpRes.rows[0].error_message.includes('Allowed Numbers'), 'error_message must be stored');

      // Cleanup
      await pool.query('DELETE FROM campaign_recipients WHERE campaign_id = $1', [campId]);
      await pool.query('DELETE FROM campaigns WHERE id = $1', [campId]);
    });

    // -------------------------------------------------------------------------
    // TEST 8: Campaign does not become Completed while processing recipients remain
    // -------------------------------------------------------------------------
    await reportAsyncTest('TEST 8: Campaign does not become Completed while processing recipients remain', async () => {
      const campId = `cmp_t8_${Date.now()}`;
      await pool.query(`
        INSERT INTO campaigns (id, name, status, created_at, updated_at)
        VALUES ($1, 'Test Incomplete Status', 'Sending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [campId]);

      // 1 sent, 1 processing
      await pool.query(`
        INSERT INTO campaign_recipients (id, campaign_id, name, phone, status, whatsapp_opted)
        VALUES ('rcp_t8_1', $1, 'User Sent', '919876543281', 'sent', true),
               ('rcp_t8_2', $1, 'User Processing', '919876543282', 'processing', true)
      `, [campId]);

      const { isCompleted, finalStatus } = await recalculateCampaignStats(campId);

      assert.strictEqual(isCompleted, false, 'Campaign must not be marked completed while processing rows remain');
      assert.strictEqual(finalStatus, 'Sending', 'Campaign status must remain Sending');

      const campCheck = await pool.query('SELECT status FROM campaigns WHERE id = $1', [campId]);
      assert.strictEqual(campCheck.rows[0].status, 'Sending', 'DB campaign status must remain Sending');

      // Cleanup
      await pool.query('DELETE FROM campaign_recipients WHERE campaign_id = $1', [campId]);
      await pool.query('DELETE FROM campaigns WHERE id = $1', [campId]);
    });

    // -------------------------------------------------------------------------
    // TEST 9: Stale processing recipients can recover
    // -------------------------------------------------------------------------
    await reportAsyncTest('TEST 9: Stale processing recipients can recover', async () => {
      const campId = `cmp_t9_${Date.now()}`;
      await pool.query(`
        INSERT INTO campaigns (id, name, status, created_at, updated_at)
        VALUES ($1, 'Test Recovery', 'Sending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [campId]);

      // Stale processing recipient (updated_at 15 minutes ago)
      await pool.query(`
        INSERT INTO campaign_recipients (id, campaign_id, name, phone, status, whatsapp_opted, updated_at)
        VALUES ('rcp_t9_1', $1, 'User Stale', '919876543291', 'processing', true, CURRENT_TIMESTAMP - INTERVAL '15 minutes')
      `, [campId]);

      // Run recovery with 5 minute timeout
      const recoveredCount = await recoverStaleProcessing(campId, 5);
      assert.strictEqual(recoveredCount, 1, 'Exactly 1 stale row must be recovered');

      const checkRcp = await pool.query('SELECT status FROM campaign_recipients WHERE id = $1', ['rcp_t9_1']);
      assert.strictEqual(checkRcp.rows[0].status, 'pending', 'Stale recipient must be recovered back to pending');

      // Cleanup
      await pool.query('DELETE FROM campaign_recipients WHERE campaign_id = $1', [campId]);
      await pool.query('DELETE FROM campaigns WHERE id = $1', [campId]);
    });

    // -------------------------------------------------------------------------
    // TEST 10: Existing campaign API/frontend behavior remains compatible
    // -------------------------------------------------------------------------
    await reportAsyncTest('TEST 10: Existing campaign API/frontend behavior remains compatible', async () => {
      const campId = `cmp_t10_${Date.now()}`;
      await pool.query(`
        INSERT INTO campaigns (id, name, status, recipients, delivered, read, failure_count, created_at, updated_at)
        VALUES ($1, 'Test API Compatibility', 'Sending', 2, 0, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [campId]);

      await pool.query(`
        INSERT INTO campaign_recipients (id, campaign_id, name, phone, status, whatsapp_opted)
        VALUES ('rcp_t10_1', $1, 'User 1', '919876543201', 'pending', true),
               ('rcp_t10_2', $1, 'User 2', '919876543202', 'pending', true)
      `, [campId]);

      metaWhatsAppService.sendTemplateMessage = async () => ({
        success: true,
        wamid: 'wamid_t10',
      });

      // Test processBatch endpoint compatibility
      let resStatus = 200;
      let resData = null;
      const req = { params: { id: campId }, body: { batchSize: 10 } };
      const res = {
        status: (code) => { resStatus = code; return res; },
        json: (data) => { resData = data; return res; },
      };

      await campaignController.processBatch(req, res, (err) => { if (err) throw err; });

      assert.strictEqual(resData.success, true, 'processBatch response must have success: true');
      assert.strictEqual(resData.processedCount, 2, 'processBatch must have processed 2 recipients');
      assert.strictEqual(resData.remainingPending, 0, 'remainingPending must be 0');
      assert.strictEqual(resData.isCompleted, true, 'isCompleted must be true');
      assert(typeof resData.stats === 'object', 'stats object must be present');
      assert.strictEqual(resData.stats.sent, 2, 'stats.sent must be 2');

      // Test getById endpoint compatibility
      let getByIdData = null;
      const getReq = { params: { id: campId } };
      const getRes = {
        status: () => getRes,
        json: (data) => { getByIdData = data; return getRes; },
      };

      await campaignController.getById(getReq, getRes, (err) => { if (err) throw err; });
      assert.strictEqual(getByIdData.success, true, 'getById response must have success: true');
      assert.strictEqual(getByIdData.data.id, campId, 'getById data must match campaign ID');
      assert(getByIdData.data.rates !== undefined, 'getById data must contain rates object');

      // Cleanup
      await pool.query('DELETE FROM campaign_recipients WHERE campaign_id = $1', [campId]);
      await pool.query('DELETE FROM campaigns WHERE id = $1', [campId]);
    });

  } finally {
    // Restore original Meta service
    metaWhatsAppService.sendTemplateMessage = originalSendTemplateMessage;
    await pool.end();
  }

  console.log('\n========================================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} CAMPAIGN DISPATCH ENGINE TESTS PASSED!`);
  console.log('========================================================================\n');
  process.exit(0);
}

runAllTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
