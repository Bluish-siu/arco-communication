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
  console.log('🧪 RUNNING INTERAKT DASHBOARD & FUNCTIONAL UX QA SUITE');
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
    // 1. Test GET /api/settings/dashboard-state
    const stateRes = await makeRequest('/settings/dashboard-state');
    assert(
      stateRes.status === 200 && stateRes.body?.success,
      'GET /api/settings/dashboard-state returns 200 OK',
      JSON.stringify(stateRes)
    );

    const dState = stateRes.body?.data || {};
    assert(
      dState.whatsappStatus !== undefined && dState.greetingFlow !== undefined,
      'Dashboard state contains whatsappStatus and greetingFlow',
      JSON.stringify(dState)
    );
    assert(
      dState.faqReplies !== undefined && dState.teamMembersCount !== undefined,
      'Dashboard state contains faqReplies and teamMembersCount',
      JSON.stringify(dState)
    );
    assert(
      dState.objectives?.supportAutomation !== undefined && dState.objectives?.googleSheets !== undefined,
      'Dashboard state contains objectives hierarchy (supportAutomation, googleSheets, ctwaAds, etc.)',
      JSON.stringify(dState.objectives)
    );

    // 2. Test POST /api/settings/team-members
    const teamRes = await makeRequest('/settings/team-members', 'POST', {
      name: 'QA Test Agent',
      email: `test_agent_${Date.now()}@arco.com`,
      role: 'agent',
    });
    assert(
      teamRes.status === 201 && teamRes.body?.success,
      'POST /api/settings/team-members invites member and persists to DB',
      JSON.stringify(teamRes)
    );

    // 3. Test PUT /api/settings/whatsapp-profile
    const profileRes = await makeRequest('/settings/whatsapp-profile', 'PUT', {
      businessName: 'ARCO Official Enterprise',
      about: 'Omni-channel WhatsApp platform for tech & retail.',
      category: 'Software & Technology',
      address: 'Tech Park, Bangalore',
      website: 'https://arcocommunication.com',
      email: 'contact@arcocommunication.com',
    });
    assert(
      profileRes.status === 200 && profileRes.body?.success,
      'PUT /api/settings/whatsapp-profile updates business profile',
      JSON.stringify(profileRes)
    );

    // 4. Test POST /api/settings/google-sheets
    const sheetsRes = await makeRequest('/settings/google-sheets', 'POST', {
      sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      sheetName: 'Inbound Leads Q3',
      autoSync: true,
    });
    assert(
      sheetsRes.status === 200 && sheetsRes.body?.success,
      'POST /api/settings/google-sheets saves Google Sheets integration',
      JSON.stringify(sheetsRes)
    );

    // 5. Test PUT /api/settings/support-automation
    const supportRes = await makeRequest('/settings/support-automation', 'PUT', {
      configured: true,
      triagePrompt: 'Greet visitor and triage technical support issue with diagnostic questions.',
      escalationToHuman: true,
      category: 'Technical Support',
      assignedAgent: 'Support Agent 1',
    });
    assert(
      supportRes.status === 200 && supportRes.body?.success,
      'PUT /api/settings/support-automation saves support triage rules',
      JSON.stringify(supportRes)
    );

    // 6. Test POST /api/settings/automated-alerts
    const alertRes = await makeRequest('/settings/automated-alerts', 'POST', {
      configured: true,
      events: ['Order Shipped', 'Payment Received'],
      template: 'Hi {{name}}, your order #{{id}} is in transit.',
    });
    assert(
      alertRes.status === 200 && alertRes.body?.success,
      'POST /api/settings/automated-alerts saves automated notifications',
      JSON.stringify(alertRes)
    );

    // 7. Test PUT /api/automation/settings (Greeting Flow)
    const greetRes = await makeRequest('/automation/settings', 'PUT', {
      welcomeMessage: {
        enabled: true,
        message: 'Welcome to ARCO QA Test greeting!',
        buttons: ['Pricing', 'Contact Us'],
      },
      workingHours: {
        enabled: true,
      },
    });
    assert(
      greetRes.status === 200 && greetRes.body?.success,
      'PUT /api/automation/settings saves Greeting Flow & buttons',
      JSON.stringify(greetRes)
    );

    // 8. Test POST /api/automation/custom-replies (FAQ Auto-Replies)
    const faqRes = await makeRequest('/automation/custom-replies', 'POST', {
      trigger: 'refund policy',
      response: 'We offer a 14-day hassle free money back guarantee.',
      category: 'Support & Policies',
      matchType: 'contains',
      channel: 'whatsapp',
      status: 'active',
    });
    assert(
      faqRes.status === 201 || (faqRes.status === 200 && faqRes.body?.success),
      'POST /api/automation/custom-replies creates FAQ reply rule',
      JSON.stringify(faqRes)
    );

    // 9. Re-fetch GET /api/settings/dashboard-state to verify persisted state
    const verifiedStateRes = await makeRequest('/settings/dashboard-state');
    const vState = verifiedStateRes.body?.data || {};
    assert(
      vState.whatsappProfile?.businessName === 'ARCO Official Enterprise',
      'Verified state contains updated businessName',
      JSON.stringify(vState.whatsappProfile)
    );
    assert(
      vState.objectives?.googleSheets?.connected === true && vState.objectives?.googleSheets?.sheetName === 'Inbound Leads Q3',
      'Verified state contains updated Google Sheets connection',
      JSON.stringify(vState.objectives?.googleSheets)
    );
    assert(
      vState.objectives?.supportAutomation?.configured === true,
      'Verified state contains updated Support Automation status',
      JSON.stringify(vState.objectives?.supportAutomation)
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
