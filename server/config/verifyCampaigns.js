async function verifyCampaigns() {
  const BASE_URL = 'http://localhost:5000/api';
  const results = [];

  console.log('Testing Upgraded Campaigns & Templates Backend APIs in PostgreSQL...');

  // 1. GET /api/campaigns (all tabs & filters)
  try {
    const res = await fetch(`${BASE_URL}/campaigns?type=onetime`);
    const json = await res.json();
    const passed = json.success === true && Array.isArray(json.data) && json.data.length > 0;
    results.push({
      api: '1. GET /api/campaigns (One Time)',
      status: res.status,
      passed,
      details: `Retrieved ${json.count} one-time campaigns`,
    });
  } catch (e) {
    results.push({ api: '1. GET /api/campaigns (One Time)', status: 'ERROR', passed: false, details: e.message });
  }

  // 2. GET /api/campaigns (Ongoing tab)
  try {
    const res = await fetch(`${BASE_URL}/campaigns?type=ongoing`);
    const json = await res.json();
    const passed = json.success === true && Array.isArray(json.data);
    results.push({
      api: '2. GET /api/campaigns (Ongoing)',
      status: res.status,
      passed,
      details: `Retrieved ${json.count} ongoing campaigns`,
    });
  } catch (e) {
    results.push({ api: '2. GET /api/campaigns (Ongoing)', status: 'ERROR', passed: false, details: e.message });
  }

  // 3. GET /api/campaign-templates (Sample ideas)
  try {
    const res = await fetch(`${BASE_URL}/campaign-templates?isSample=true`);
    const json = await res.json();
    const passed = json.success === true && Array.isArray(json.data) && json.data.length >= 10;
    results.push({
      api: '3. GET /api/campaign-templates (10 Sample Ideas)',
      status: res.status,
      passed,
      details: `Retrieved ${json.count} sample ideas with buttons and variables`,
    });
  } catch (e) {
    results.push({ api: '3. GET /api/campaign-templates (10 Sample Ideas)', status: 'ERROR', passed: false, details: e.message });
  }

  // 4. GET /api/campaigns/audiences (Dynamic PostgreSQL recipient counter)
  try {
    const res = await fetch(`${BASE_URL}/campaigns/audiences?audienceType=all`);
    const json = await res.json();
    const passed = json.success === true && json.data.recipientCount !== undefined && Array.isArray(json.data.segments);
    results.push({
      api: '4. GET /api/campaigns/audiences (Dynamic Count)',
      status: res.status,
      passed,
      details: `Live recipients from contacts table: ${json.data?.recipientCount}`,
    });
  } catch (e) {
    results.push({ api: '4. GET /api/campaigns/audiences (Dynamic Count)', status: 'ERROR', passed: false, details: e.message });
  }

  // 5. POST /api/campaigns (Create Full Campaign)
  let createdCampId = null;
  try {
    const res = await fetch(`${BASE_URL}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated E2E Test Broadcast',
        description: 'Verifying PostgreSQL persistence and 7-step wizard payload.',
        channel: 'whatsapp',
        type: 'onetime',
        category: 'Marketing',
        recipients: 1200,
        templateName: 'Exciting Promo Alert',
        templateLanguage: 'en_US',
        templateCategory: 'MARKETING',
        variableMapping: { 1: 'Shraddha', 2: '40% OFF' },
        scheduledFor: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        scheduleTimezone: 'Asia/Kolkata',
      }),
    });
    const json = await res.json();
    createdCampId = json.data?.id;
    const passed = res.status === 201 && createdCampId && json.data.name === 'Automated E2E Test Broadcast';
    results.push({
      api: '5. POST /api/campaigns (Create)',
      status: res.status,
      passed,
      details: `Created campaign id: ${createdCampId}`,
    });
  } catch (e) {
    results.push({ api: '5. POST /api/campaigns (Create)', status: 'ERROR', passed: false, details: e.message });
  }

  // 6. GET /api/campaigns/:id (Details & Analytics)
  try {
    if (createdCampId) {
      const res = await fetch(`${BASE_URL}/campaigns/${createdCampId}`);
      const json = await res.json();
      const passed = res.status === 200 && json.data.id === createdCampId && json.data.rates;
      results.push({
        api: '6. GET /api/campaigns/:id',
        status: res.status,
        passed,
        details: `Loaded campaign "${json.data?.name}", deliveryRate: ${json.data?.rates?.deliveryRate}`,
      });
    }
  } catch (e) {
    results.push({ api: '6. GET /api/campaigns/:id', status: 'ERROR', passed: false, details: e.message });
  }

  // 7. PUT /api/campaigns/:id/status
  try {
    if (createdCampId) {
      const res = await fetch(`${BASE_URL}/campaigns/${createdCampId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Paused' }),
      });
      const json = await res.json();
      const passed = res.status === 200 && json.data.status === 'Paused';
      results.push({
        api: '7. PUT /api/campaigns/:id/status',
        status: res.status,
        passed,
        details: `Updated status to "${json.data?.status}"`,
      });
    }
  } catch (e) {
    results.push({ api: '7. PUT /api/campaigns/:id/status', status: 'ERROR', passed: false, details: e.message });
  }

  // 8. DELETE /api/campaigns/:id
  try {
    if (createdCampId) {
      const res = await fetch(`${BASE_URL}/campaigns/${createdCampId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      const passed = res.status === 200 && json.success === true;
      results.push({
        api: '8. DELETE /api/campaigns/:id',
        status: res.status,
        passed,
        details: `Deleted test campaign id ${createdCampId}`,
      });
    }
  } catch (e) {
    results.push({ api: '8. DELETE /api/campaigns/:id', status: 'ERROR', passed: false, details: e.message });
  }

  console.table(results);

  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of Upgraded Campaigns & Templates APIs passed in PostgreSQL!');
    process.exit(0);
  } else {
    console.error('[FAILURES DETECTED] Some tests failed.');
    process.exit(1);
  }
}

verifyCampaigns();
