async function verifyAll() {
  const BASE_URL = 'http://localhost:5000/api';
  const results = [];

  const testEndpoint = async (name, url, options = {}) => {
    try {
      const res = await fetch(url, options);
      const data = await res.json();
      const passed = res.ok && (data.success || data.status === 'healthy');
      results.push({ name, url, status: res.status, passed, dataPreview: JSON.stringify(data).slice(0, 80) + '...' });
    } catch (err) {
      results.push({ name, url, status: 'ERROR', passed: false, error: err.message });
    }
  };

  console.log('Testing PostgreSQL-backed API Endpoints...');

  // 1. Health
  await testEndpoint('Health Check', `${BASE_URL}/health`);

  // 2. Contacts
  await testEndpoint('Get Contacts', `${BASE_URL}/contacts`);
  await testEndpoint('Create Contact', `${BASE_URL}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Vikram Joshi', phone: '+91 91234 56789', email: 'vikram@example.com', tag: 'Lead', segment: 'High Intent' }),
  });

  // 3. Campaigns
  await testEndpoint('Get Campaigns', `${BASE_URL}/campaigns`);
  await testEndpoint('Create Campaign', `${BASE_URL}/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Spring Promo 2026', channel: 'whatsapp', type: 'onetime', category: 'Marketing' }),
  });

  // 4. Inbox
  await testEndpoint('Get Conversations', `${BASE_URL}/inbox/conversations`);

  // 5. Workflows
  await testEndpoint('Get Workflows', `${BASE_URL}/workflows`);

  // 6. CRM Pipeline
  await testEndpoint('Get CRM Pipeline', `${BASE_URL}/crm/pipeline`);

  // 7. Analytics Dashboard
  await testEndpoint('Get Analytics Dashboard', `${BASE_URL}/analytics/dashboard`);

  // 8. AI Agents
  await testEndpoint('Get AI Agents', `${BASE_URL}/ai-agents`);
  await testEndpoint('AI Agent Query', `${BASE_URL}/ai-agents/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'What are your WhatsApp marketing plan prices?' }),
  });

  // 9. WhatsApp Status
  await testEndpoint('Get WhatsApp Status', `${BASE_URL}/whatsapp/status`);

  // 10. Settings
  await testEndpoint('Get Settings', `${BASE_URL}/settings`);

  console.table(results);

  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of PostgreSQL endpoints passed successfully!');
    process.exit(0);
  } else {
    console.error('[FAILURES DETECTED] Some endpoints failed.');
    process.exit(1);
  }
}

verifyAll();
