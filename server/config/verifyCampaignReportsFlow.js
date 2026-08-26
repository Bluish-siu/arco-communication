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

async function runCampaignReportsTests() {
  console.log('Testing ARCO Market -> Custom Campaign Reports Suite & PostgreSQL Flow...');
  const results = [];

  try {
    // Test 1: Get Campaigns for Reports Selector
    const listRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/analytics/campaign-reports/campaigns',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    results.push({
      test: '1. Load Campaigns for Report Selector (GET /api/analytics/campaign-reports/campaigns)',
      status: listRes.status,
      passed: listRes.status === 200 && Array.isArray(listRes.data?.data),
      details: `Retrieved ${listRes.data?.data?.length || 0} campaigns from PostgreSQL database`,
    });

    // Test 2: Generate Campaign Summary Report (Last 7 Days)
    const summaryRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/analytics/campaign-reports/generate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        reportType: 'summary',
        dateRange: { type: 'last7days' },
        campaignType: 'all',
        campaignIds: [],
        email: 'owner@arco.com',
      }
    );
    results.push({
      test: '2. Generate Campaign Summary Report (POST /api/analytics/campaign-reports/generate)',
      status: summaryRes.status,
      passed: summaryRes.status === 200 && summaryRes.data?.success === true && summaryRes.data?.data?.reportType === 'summary',
      details: `Summary generated with ${summaryRes.data?.data?.totalRecords || 0} campaigns, Total Attempted: ${summaryRes.data?.data?.totals?.totalAttempted || 0}`,
    });

    // Test 3: Generate Campaign Detailed Report
    const detailedRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/analytics/campaign-reports/generate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        reportType: 'detailed',
        dateRange: { type: 'last30days' },
        campaignType: 'all',
        campaignIds: [],
        email: 'owner@arco.com',
      }
    );
    results.push({
      test: '3. Generate Campaign Detailed Report (POST /api/analytics/campaign-reports/generate)',
      status: detailedRes.status,
      passed: detailedRes.status === 200 && detailedRes.data?.success === true && detailedRes.data?.data?.reportType === 'detailed',
      details: `Detailed report generated with ${detailedRes.data?.data?.totalRecords || 0} customer delivery records & CSV`,
    });

    // Test 4: Generate CTWA Ad Campaign Detailed Report
    const ctwaRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/analytics/campaign-reports/generate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        reportType: 'ctwa',
        dateRange: { type: 'last7days' },
        campaignType: 'all',
        campaignIds: [],
        email: 'owner@arco.com',
      }
    );
    results.push({
      test: '4. Generate CTWA Ad Campaign Detailed Report (POST /api/analytics/campaign-reports/generate)',
      status: ctwaRes.status,
      passed: ctwaRes.status === 200 && ctwaRes.data?.success === true && ctwaRes.data?.data?.reportType === 'ctwa',
      details: `CTWA report generated with ${ctwaRes.data?.data?.totalRecords || 0} Meta CTWA records`,
    });

    // Test 5: Date Range Validation - Enforce Max 31 Days Limit
    const invalidDateRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/analytics/campaign-reports/generate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        reportType: 'summary',
        dateRange: {
          type: 'custom',
          from: '2026-01-01',
          to: '2026-03-01', // 59 days (exceeds 31 days)
        },
        campaignType: 'all',
        campaignIds: [],
        email: 'owner@arco.com',
      }
    );
    results.push({
      test: '5. Date Range Validation (Enforce 31-day maximum)',
      status: invalidDateRes.status,
      passed: invalidDateRes.status === 400 && invalidDateRes.data?.message?.includes('31 days'),
      details: `Rejected >31 days range with 400: "${invalidDateRes.data?.message}"`,
    });

    // Test 6: Verify Frontend Route /analytics/campaign-reports
    const frontendRes = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/analytics/campaign-reports',
      method: 'GET',
    });
    results.push({
      test: '6. Frontend Route /analytics/campaign-reports',
      status: frontendRes.status,
      passed: frontendRes.status === 200,
      details: `Vite frontend returned HTTP ${frontendRes.status} OK for /analytics/campaign-reports`,
    });

  } catch (err) {
    console.error('Test execution error:', err);
  }

  console.table(results);
  const allPassed = results.length > 0 && results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of Market -> Custom Campaign Reports tests passed!');
  } else {
    console.error('[FAILURES DETECTED] Some tests failed.');
  }
}

runCampaignReportsTests();
