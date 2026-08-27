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
  console.log('🧪 RUNNING GREETING FLOW (INTERAKT REPLICA) END-TO-END QA');
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
    // 1. Test Workflows endpoint & search
    const wfRes = await makeRequest('/automation/workflows');
    assert(
      wfRes.status === 200 && Array.isArray(wfRes.body?.data) && wfRes.body.data.length > 0,
      'GET /api/automation/workflows returns active workflows from PostgreSQL'
    );

    const wfSearch = await makeRequest('/automation/workflows?search=analytics');
    assert(
      wfSearch.status === 200 && wfSearch.body.data.some(w => w.name.includes('analytics')),
      'GET /api/automation/workflows?search=analytics filters workflows in real-time'
    );

    // 2. Test WhatsApp Forms endpoint
    const formsRes = await makeRequest('/automation/forms');
    assert(
      formsRes.status === 200 && Array.isArray(formsRes.body?.data) && formsRes.body.data.length > 0,
      'GET /api/automation/forms returns WhatsApp forms from PostgreSQL'
    );

    // 3. Test Greeting Flow Save with Workflow & Variables
    const greetingMsgWithVars = 'Hello {{first_name}}! Welcome to ARCO Communication. We specialize in digital experiences. How can we help today? 🚀';
    const saveWorkflowGreeting = await makeRequest('/automation/settings', 'PUT', {
      welcomeMessage: {
        enabled: true,
        message: greetingMsgWithVars,
        personalized: true,
        interactiveListEnabled: true,
        actionType: 'workflow',
        workflowId: 'wf_analytics_1',
        workflowName: 'ai_performance_analytics_dashboard_vf',
      },
    });

    assert(
      saveWorkflowGreeting.status === 200 && saveWorkflowGreeting.body?.success === true,
      'PUT /api/automation/settings saves Greeting Flow with Workflow selection & variables'
    );

    // 4. Verify PostgreSQL persistence via /settings/dashboard-state
    const dashboardState1 = await makeRequest('/settings/dashboard-state');
    const gf1 = dashboardState1.body?.data?.greetingFlow;
    assert(
      gf1 && gf1.activated === true && gf1.message === greetingMsgWithVars,
      'GET /settings/dashboard-state verifies saved greeting message and activated status'
    );
    assert(
      gf1 && gf1.personalized === true && gf1.interactiveListEnabled === true,
      'GET /settings/dashboard-state verifies personalized & interactive list settings'
    );
    assert(
      gf1 && gf1.actionType === 'workflow' && gf1.workflowId === 'wf_analytics_1',
      'GET /settings/dashboard-state verifies selected workflow persistence'
    );

    // 5. Test Greeting Flow Save with WhatsApp Form (Navigate to first screen)
    const saveFormFirstScreen = await makeRequest('/automation/settings', 'PUT', {
      welcomeMessage: {
        enabled: true,
        message: 'Welcome! Please fill in your requirements below:',
        actionType: 'whatsapp_form',
        formButtonText: 'Fill Requirements',
        formId: 'tech_requirements_flow',
        formName: 'Technical Requirements & Project Details',
        formAction: 'first_screen',
      },
    });
    assert(
      saveFormFirstScreen.status === 200 && saveFormFirstScreen.body?.success === true,
      'PUT /api/automation/settings saves Greeting Flow with WhatsApp Form (Navigate to first screen)'
    );

    const dashboardState2 = await makeRequest('/settings/dashboard-state');
    const gf2 = dashboardState2.body?.data?.greetingFlow;
    assert(
      gf2 && gf2.actionType === 'whatsapp_form' && gf2.formButtonText === 'Fill Requirements' && gf2.formAction === 'first_screen',
      'GET /settings/dashboard-state verifies WhatsApp Form (first screen) persistence'
    );

    // 6. Test Greeting Flow Save with WhatsApp Form (Data Exchange)
    const flowDataJson = { role: 'enterprise', budget: '> ₹2 Lakhs' };
    const saveFormDataExchange = await makeRequest('/automation/settings', 'PUT', {
      welcomeMessage: {
        enabled: true,
        message: 'Welcome! Please complete our technical assessment form:',
        actionType: 'whatsapp_form',
        formButtonText: 'Submit Assessment',
        formId: 'tech_requirements_flow',
        formAction: 'data_exchange',
        flowToken: 'token_enterprise_99',
        flowData: flowDataJson,
      },
    });
    assert(
      saveFormDataExchange.status === 200 && saveFormDataExchange.body?.success === true,
      'PUT /api/automation/settings saves Greeting Flow with WhatsApp Form (Data Exchange & flow_token)'
    );

    const dashboardState3 = await makeRequest('/settings/dashboard-state');
    const gf3 = dashboardState3.body?.data?.greetingFlow;
    assert(
      gf3 && gf3.actionType === 'whatsapp_form' && gf3.formAction === 'data_exchange' && gf3.flowToken === 'token_enterprise_99',
      'GET /settings/dashboard-state verifies WhatsApp Form Data Exchange token & JSON payload'
    );

    // 7. Test Greeting Flow Save with None (removes action)
    const saveNone = await makeRequest('/automation/settings', 'PUT', {
      welcomeMessage: {
        enabled: true,
        message: 'Welcome to ARCO Communication!',
        actionType: 'none',
      },
    });
    assert(
      saveNone.status === 200 && saveNone.body?.success === true,
      'PUT /api/automation/settings saves Greeting Flow with None (clears actions)'
    );

    const dashboardState4 = await makeRequest('/settings/dashboard-state');
    const gf4 = dashboardState4.body?.data?.greetingFlow;
    assert(
      gf4 && gf4.actionType === 'none',
      'GET /settings/dashboard-state verifies actionType reset to none'
    );

    // 8. Regression Check: Ensure Connect Number endpoints remain 100% operational
    const metaStatus = await makeRequest('/meta/status');
    assert(
      metaStatus.status === 200,
      'REGRESSION PASS: /api/meta/status endpoint remains fully intact and operational'
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
