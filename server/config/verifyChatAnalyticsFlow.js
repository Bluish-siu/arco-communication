import http from 'http';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runChatAnalyticsTests() {
  console.log('Testing ARCO Support -> Chat Analytics Suite & PostgreSQL Flow...');
  const results = [];

  try {
    // Test 1: Get Conversation Overview
    const overviewRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/analytics/overview?dateRange=last7days',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    results.push({
      test: '1. Get Conversation Overview (GET /api/analytics/overview)',
      status: overviewRes.status,
      passed: overviewRes.status === 200 && overviewRes.data?.success === true,
      details: `Total Convs: ${overviewRes.data?.data?.kpis?.totalConversations || 0}, Responded: ${overviewRes.data?.data?.kpis?.responded || 0}, Resolved: ${overviewRes.data?.data?.kpis?.resolved || 0}`,
    });

    // Test 2: Overview with Event Filter
    const eventRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/analytics/overview?event=ctwa',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    results.push({
      test: '2. Overview with Event Filter (GET /api/analytics/overview?event=ctwa)',
      status: eventRes.status,
      passed: eventRes.status === 200 && eventRes.data?.data?.filters?.event === 'ctwa',
      details: `Filtered by CTWA event: Total Convs: ${eventRes.data?.data?.kpis?.totalConversations || 0}`,
    });

    // Test 3: Overview with Tag Filter
    const tagRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/analytics/overview?tags=Recovered,Loyal,High%20Spenders',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    results.push({
      test: '3. Overview with Tag Filters (GET /api/analytics/overview?tags=...)',
      status: tagRes.status,
      passed: tagRes.status === 200 && tagRes.data?.data?.filters?.tags?.includes('Recovered'),
      details: `Filtered by tags: "${tagRes.data?.data?.filters?.tags}"`,
    });

    // Test 4: Get Agent Performance
    const agentRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/analytics/agent-performance?dateRange=last7days',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    results.push({
      test: '4. Get Agent Performance Table (GET /api/analytics/agent-performance)',
      status: agentRes.status,
      passed: agentRes.status === 200 && Array.isArray(agentRes.data?.data?.agents) && agentRes.data?.data?.agents?.length > 0,
      details: `Retrieved metrics for ${agentRes.data?.data?.agents?.length || 0} agents from PostgreSQL`,
    });

    // Test 5: Export Overview CSV
    const exportOverviewRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/analytics/export?type=overview',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    results.push({
      test: '5. Export Overview CSV (GET /api/analytics/export?type=overview)',
      status: exportOverviewRes.status,
      passed: exportOverviewRes.status === 200 && exportOverviewRes.data?.data?.csv?.includes('Total Conversations'),
      details: `Generated CSV file "${exportOverviewRes.data?.data?.filename}"`,
    });

    // Test 6: Export Agent Performance CSV
    const exportAgentRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/analytics/export?type=agent-performance',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    results.push({
      test: '6. Export Agent Performance CSV (GET /api/analytics/export?type=agent-performance)',
      status: exportAgentRes.status,
      passed: exportAgentRes.status === 200 && exportAgentRes.data?.data?.csv?.includes('1st Response Time'),
      details: `Generated CSV file "${exportAgentRes.data?.data?.filename}"`,
    });

    // Test 7: Verify Frontend Route /analytics/overview
    const frontendOverviewRes = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/analytics/overview',
      method: 'GET',
    });
    results.push({
      test: '7. Frontend Route /analytics/overview',
      status: frontendOverviewRes.status,
      passed: frontendOverviewRes.status === 200,
      details: `Vite frontend returned HTTP ${frontendOverviewRes.status} OK`,
    });

    // Test 8: Verify Frontend Route /analytics/agent-performance
    const frontendAgentRes = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/analytics/agent-performance',
      method: 'GET',
    });
    results.push({
      test: '8. Frontend Route /analytics/agent-performance',
      status: frontendAgentRes.status,
      passed: frontendAgentRes.status === 200,
      details: `Vite frontend returned HTTP ${frontendAgentRes.status} OK`,
    });

  } catch (err) {
    console.error('Test execution error:', err);
  }

  console.table(results);
  const allPassed = results.length > 0 && results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of Support -> Chat Analytics tests passed!');
  } else {
    console.error('[FAILURES DETECTED] Some tests failed.');
  }
}

runChatAnalyticsTests();
