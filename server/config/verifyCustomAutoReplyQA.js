import jwt from 'jsonwebtoken';
import http from 'http';
import { query, pool } from './db.js';
import { config } from './index.js';

const token = jwt.sign(
  { id: 'usr_1', email: 'owner@arco.com', role: 'admin' },
  config.jwtSecret,
  { expiresIn: '1h' }
);

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: config.port || 5000,
      path: `/api${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(dataString ? { 'Content-Length': Buffer.byteLength(dataString) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 RUNNING CUSTOM AUTO REPLY & FAQ REPLIES END-TO-END QA');
  console.log('===============================================================');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${details}`);
    }
  }

  try {
    // 1. Test Fetch WhatsApp Custom Replies
    const waRepliesRes = await makeRequest('/automation/custom-replies?channel=whatsapp');
    assert(
      waRepliesRes.status === 200 && Array.isArray(waRepliesRes.body?.data) && waRepliesRes.body.data.length >= 3,
      'GET /api/automation/custom-replies?channel=whatsapp returns seeded WhatsApp replies',
      JSON.stringify(waRepliesRes.body)
    );

    // 2. Test Fetch Instagram Custom Replies (Separate dataset)
    const igRepliesRes = await makeRequest('/automation/custom-replies?channel=instagram');
    assert(
      igRepliesRes.status === 200 && Array.isArray(igRepliesRes.body?.data) && igRepliesRes.body.data.length >= 1,
      'GET /api/automation/custom-replies?channel=instagram returns separate Instagram dataset',
      JSON.stringify(igRepliesRes.body)
    );

    // 3. Test Search Filtering (Case-insensitive)
    const searchRes = await makeRequest('/automation/custom-replies?search=digital');
    assert(
      searchRes.status === 200 && searchRes.body.data.some(r => r.trigger_keyword.toLowerCase().includes('digital')),
      'GET /api/automation/custom-replies?search=digital filters replies by keyword in real-time'
    );

    // 4. Test Create New Custom Reply
    const newReplyPayload = {
      trigger_keyword: 'What is your refund policy?',
      additional_triggers: ['refunds', 'money back', 'cancellation policy'],
      match_type: 'contains',
      action_type: 'auto_reply',
      response_message: 'We offer a 14-day hassle-free money back guarantee on all subscription plans. Contact billing@arco.ai for assistance.',
      channel: 'whatsapp',
      status: 'active',
    };

    const createRes = await makeRequest('/automation/custom-replies', 'POST', newReplyPayload);
    assert(
      createRes.status === 201 && createRes.body?.success === true && createRes.body?.data?.id,
      'POST /api/automation/custom-replies creates new custom auto reply in PostgreSQL',
      JSON.stringify(createRes.body)
    );
    const createdId = createRes.body?.data?.id;

    // 5. Test Update Existing Custom Reply
    const updateRes = await makeRequest(`/automation/custom-replies/${createdId}`, 'PUT', {
      response_message: 'Updated: 30-day money-back guarantee on all plans.',
      status: 'active',
    });
    assert(
      updateRes.status === 200 && updateRes.body?.success === true,
      'PUT /api/automation/custom-replies/:id updates custom reply in PostgreSQL'
    );

    // 6. Test Toggle Status (Active -> Inactive)
    const toggleRes = await makeRequest(`/automation/custom-replies/${createdId}/toggle`, 'PUT');
    assert(
      toggleRes.status === 200 && toggleRes.body?.data?.status === 'inactive',
      'PUT /api/automation/custom-replies/:id/toggle toggles status to inactive'
    );

    // 7. Test Duplicate Custom Reply
    const duplicateRes = await makeRequest(`/automation/custom-replies/${createdId}/duplicate`, 'POST');
    assert(
      duplicateRes.status === 201 && duplicateRes.body?.data?.trigger_keyword?.includes('(Copy)'),
      'POST /api/automation/custom-replies/:id/duplicate duplicates reply rule'
    );
    const duplicatedId = duplicateRes.body?.data?.id;

    // 8. Test Delete Custom Reply
    const deleteRes = await makeRequest(`/automation/custom-replies/${createdId}`, 'DELETE');
    assert(
      deleteRes.status === 200 && deleteRes.body?.success === true,
      'DELETE /api/automation/custom-replies/:id removes custom reply from PostgreSQL'
    );

    if (duplicatedId) {
      await makeRequest(`/automation/custom-replies/${duplicatedId}`, 'DELETE');
    }

    // 9. Test Master Toggle Switch OFF
    const masterOffRes = await makeRequest('/automation/settings', 'PUT', {
      customRepliesEnabled: false,
    });
    assert(
      masterOffRes.status === 200 && masterOffRes.body?.data?.custom_replies_enabled === false,
      'PUT /api/automation/settings toggles customRepliesEnabled to false'
    );

    const dashboardOffState = await makeRequest('/settings/dashboard-state');
    assert(
      dashboardOffState.body?.data?.faqReplies?.activated === false,
      'GET /settings/dashboard-state reflects FAQ Auto-replies inactive when master switch is off'
    );

    // 10. Test Master Toggle Switch ON
    const masterOnRes = await makeRequest('/automation/settings', 'PUT', {
      customRepliesEnabled: true,
    });
    assert(
      masterOnRes.status === 200 && masterOnRes.body?.data?.custom_replies_enabled === true,
      'PUT /api/automation/settings toggles customRepliesEnabled back to true'
    );

    const dashboardOnState = await makeRequest('/settings/dashboard-state');
    assert(
      dashboardOnState.body?.data?.faqReplies?.activated === true && dashboardOnState.body?.data?.faqReplies?.count >= 3,
      'GET /settings/dashboard-state reflects FAQ Auto-replies activated with active counts'
    );

    // 11. Regression Check: Meta Connect & Greeting Flow endpoints intact
    const metaStatus = await makeRequest('/meta/status');
    assert(
      metaStatus.status === 200,
      'REGRESSION PASS: /api/meta/status endpoint remains fully operational'
    );

    const greetingSettings = await makeRequest('/automation/settings');
    assert(
      greetingSettings.status === 200 && greetingSettings.body?.data?.welcome_message,
      'REGRESSION PASS: /api/automation/settings welcome_message remains fully operational'
    );

  } catch (err) {
    console.error('Fatal test error:', err);
  } finally {
    console.log('===============================================================');
    console.log(`📊 RESULTS: ${passed}/${total} QA TESTS PASSED`);
    console.log('===============================================================');
    await pool.end();
    process.exit(passed === total ? 0 : 1);
  }
}

runTests();
