async function verifyCampaignsReplicaFlow() {
  const BASE_URL = 'http://localhost:5000/api';
  const results = [];

  console.log('Testing ARCO Market -> Campaigns Suite & PostgreSQL Flow...');

  // Helper login to get token
  let token = null;
  try {
    const authRes = await fetch(`${BASE_URL}/auth/demo-login`, { method: 'POST' });
    const authJson = await authRes.json();
    token = authJson.token;
  } catch (e) {}

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // 1. List One-Time Campaigns (GET /api/campaigns?type=onetime)
  let onetimeList = [];
  try {
    const res = await fetch(`${BASE_URL}/campaigns?type=onetime`, { headers: authHeaders });
    const json = await res.json();
    onetimeList = json.data || [];
    const passed = res.status === 200 && Array.isArray(onetimeList);

    results.push({
      test: '1. List One-Time Campaigns (GET /api/campaigns?type=onetime)',
      status: res.status,
      passed,
      details: `Loaded ${onetimeList.length} one-time campaigns`,
    });
  } catch (e) {
    results.push({ test: '1. List One-Time Campaigns', status: 'ERROR', passed: false, details: e.message });
  }

  // 2. List Ongoing Campaigns (GET /api/campaigns?type=ongoing)
  try {
    const res = await fetch(`${BASE_URL}/campaigns?type=ongoing`, { headers: authHeaders });
    const json = await res.json();
    const passed = res.status === 200 && Array.isArray(json.data || []);

    results.push({
      test: '2. List Ongoing Campaigns (GET /api/campaigns?type=ongoing)',
      status: res.status,
      passed,
      details: `Loaded ${json.data?.length || 0} ongoing campaigns`,
    });
  } catch (e) {
    results.push({ test: '2. List Ongoing Campaigns', status: 'ERROR', passed: false, details: e.message });
  }

  // 3. Dynamic Audience Calculation (GET /api/campaigns/audiences)
  let audience = null;
  try {
    const res = await fetch(`${BASE_URL}/campaigns/audiences?whatsapp_opted=true`, { headers: authHeaders });
    const json = await res.json();
    audience = json.data;
    const passed = res.status === 200 && audience?.recipientCount !== undefined;

    results.push({
      test: '3. Dynamic Audience Calculation (GET /api/campaigns/audiences)',
      status: res.status,
      passed,
      details: `Calculated ${audience?.recipientCount} eligible WhatsApp opted-in recipients across ${audience?.savedSegments?.length || 0} segments`,
    });
  } catch (e) {
    results.push({ test: '3. Audience Calculation', status: 'ERROR', passed: false, details: e.message });
  }

  // 4. Create Campaign in PostgreSQL (POST /api/campaigns)
  let createdCamp = null;
  try {
    const res = await fetch(`${BASE_URL}/campaigns`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: `Diwali VIP Broadcast ${Date.now().toString().slice(-4)}`,
        description: 'Special holiday campaign with 25% coupon code',
        channel: 'whatsapp',
        type: 'onetime',
        category: 'Marketing',
        recipients: audience?.recipientCount || 1450,
        scheduledFor: new Date().toISOString(),
        scheduleTimezone: 'Asia/Kolkata',
        audienceType: 'all',
        audienceFilter: { whatsappOptedOnly: true },
        templateName: 'Diwali Flash Offer',
        templateLanguage: 'en_US',
        templateCategory: 'MARKETING',
        status: 'Scheduled',
      }),
    });
    const json = await res.json();
    createdCamp = json.data;
    const passed = res.status === 201 && !!createdCamp?.id && createdCamp?.name?.includes('Diwali VIP Broadcast');

    results.push({
      test: '4. Create WhatsApp Campaign (POST /api/campaigns)',
      status: res.status,
      passed,
      details: `Created campaign "${createdCamp?.name}" (ID: ${createdCamp?.id}, Recipients: ${createdCamp?.recipients})`,
    });
  } catch (e) {
    results.push({ test: '4. Create Campaign', status: 'ERROR', passed: false, details: e.message });
  }

  // 5. Get Campaign Details (GET /api/campaigns/:id)
  if (createdCamp) {
    try {
      const res = await fetch(`${BASE_URL}/campaigns/${createdCamp.id}`, { headers: authHeaders });
      const json = await res.json();
      const passed = res.status === 200 && json.data?.id === createdCamp.id;

      results.push({
        test: '5. Get Campaign Details (GET /api/campaigns/:id)',
        status: res.status,
        passed,
        details: `Loaded campaign "${json.data?.name}" with status "${json.data?.status}"`,
      });
    } catch (e) {
      results.push({ test: '5. Get Campaign', status: 'ERROR', passed: false, details: e.message });
    }
  }

  // 6. Update Campaign Status (PATCH /api/campaigns/:id/status)
  if (createdCamp) {
    try {
      const res = await fetch(`${BASE_URL}/campaigns/${createdCamp.id}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status: 'Paused' }),
      });
      const json = await res.json();
      const passed = res.status === 200 && json.data?.status === 'Paused';

      results.push({
        test: '6. Update Campaign Status (PATCH /api/campaigns/:id/status)',
        status: res.status,
        passed,
        details: `Updated campaign status to "${json.data?.status}"`,
      });
    } catch (e) {
      results.push({ test: '6. Update Status', status: 'ERROR', passed: false, details: e.message });
    }
  }

  // 7. Cleanup Test Campaign (DELETE /api/campaigns/:id)
  if (createdCamp) {
    try {
      const res = await fetch(`${BASE_URL}/campaigns/${createdCamp.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const json = await res.json();
      const passed = res.status === 200 && json.success === true;

      results.push({
        test: '7. Delete Campaign (DELETE /api/campaigns/:id)',
        status: res.status,
        passed,
        details: `Cleaned up test campaign ${createdCamp.id}`,
      });
    } catch (e) {
      results.push({ test: '7. Delete Campaign', status: 'ERROR', passed: false, details: e.message });
    }
  }

  console.table(results);
  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of Market -> Campaigns tests passed!');
  } else {
    console.error('[FAILURES DETECTED]');
  }
}

verifyCampaignsReplicaFlow();
