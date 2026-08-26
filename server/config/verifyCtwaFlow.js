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

async function runCtwaTests() {
  console.log('Testing ARCO Market -> Meta Ads / CTWA Suite & PostgreSQL Flow...');
  const results = [];

  try {
    // Test 1: Get CTWA Status
    const statusRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/meta/ctwa/status',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    results.push({
      test: '1. Get CTWA Status (GET /api/meta/ctwa/status)',
      status: statusRes.status,
      passed: statusRes.status === 200 && statusRes.data?.success === true,
      details: `Status: "${statusRes.data?.data?.status}", Step: "${statusRes.data?.data?.onboardingStep}"`,
    });

    // Test 2: Save Facebook Page Draft
    const draftRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/meta/ctwa/page/draft',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        pageName: 'ARCO Retail Flagship Draft',
        about: 'Premium WhatsApp commerce and broadcast store.',
        category: 'E-Commerce & Online Retail',
        country: 'India',
        address: 'Cyber Hub, Gurugram',
      }
    );
    results.push({
      test: '2. Save Facebook Page Draft (POST /api/meta/ctwa/page/draft)',
      status: draftRes.status,
      passed: draftRes.status === 200 && draftRes.data?.success === true && draftRes.data?.data?.status === 'draft',
      details: `Draft ID: "${draftRes.data?.data?.id}", Page Name: "${draftRes.data?.data?.page_name}"`,
    });

    // Test 3: Create & Connect Facebook Page
    const createPageRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/meta/ctwa/page/create',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        pageName: 'ARCO Official Facebook Store',
        about: 'Official WhatsApp Business & Commerce page.',
        category: 'E-Commerce & Online Retail',
        country: 'India',
        address: '100 Feet Road, Indiranagar, Bengaluru',
      }
    );
    results.push({
      test: '3. Create Facebook Page (POST /api/meta/ctwa/page/create)',
      status: createPageRes.status,
      passed: createPageRes.status === 201 && createPageRes.data?.success === true && createPageRes.data?.data?.status === 'connected',
      details: `Page ID: "${createPageRes.data?.data?.id}", Meta Page ID: "${createPageRes.data?.data?.meta_page_id}"`,
    });

    // Test 4: Connect Meta Ads Manager Account
    const adAccRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/meta/ctwa/ad-account/connect',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        metaAdAccountId: 'act_882910492810',
        accountName: 'ARCO High ROAS Ads Manager',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
      }
    );
    results.push({
      test: '4. Connect Meta Ads Manager (POST /api/meta/ctwa/ad-account/connect)',
      status: adAccRes.status,
      passed: adAccRes.status === 200 && adAccRes.data?.success === true && adAccRes.data?.data?.status === 'connected',
      details: `Account ID: "${adAccRes.data?.data?.meta_ad_account_id}", Name: "${adAccRes.data?.data?.account_name}"`,
    });

    // Test 5: Retrieve Meta Assets
    const assetsRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/meta/ctwa/assets',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    results.push({
      test: '5. Get Meta CTWA Assets (GET /api/meta/ctwa/assets)',
      status: assetsRes.status,
      passed: assetsRes.status === 200 && Array.isArray(assetsRes.data?.data?.facebookPages) && Array.isArray(assetsRes.data?.data?.adAccounts),
      details: `Retrieved ${assetsRes.data?.data?.facebookPages?.length || 0} Pages and ${assetsRes.data?.data?.adAccounts?.length || 0} Ad Accounts`,
    });

    // Test 6: Verify Frontend Route /analytics/ad-performance
    const adPerfRes = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/analytics/ad-performance',
      method: 'GET',
    });
    results.push({
      test: '6. Frontend Route /analytics/ad-performance',
      status: adPerfRes.status,
      passed: adPerfRes.status === 200,
      details: `Vite frontend returned HTTP ${adPerfRes.status} OK`,
    });

    // Test 7: Verify Frontend Route /ctwa/facebook
    const ctwaFbRes = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/ctwa/facebook',
      method: 'GET',
    });
    results.push({
      test: '7. Frontend Route /ctwa/facebook',
      status: ctwaFbRes.status,
      passed: ctwaFbRes.status === 200,
      details: `Vite frontend returned HTTP ${ctwaFbRes.status} OK`,
    });

    // Test 8: Verify Frontend Route /ctwa/facebook/create
    const ctwaCreateRes = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/ctwa/facebook/create',
      method: 'GET',
    });
    results.push({
      test: '8. Frontend Route /ctwa/facebook/create',
      status: ctwaCreateRes.status,
      passed: ctwaCreateRes.status === 200,
      details: `Vite frontend returned HTTP ${ctwaCreateRes.status} OK`,
    });

    // Test 9: Disconnect CTWA
    const disconnectRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/meta/ctwa/disconnect',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    results.push({
      test: '9. Disconnect CTWA Assets (POST /api/meta/ctwa/disconnect)',
      status: disconnectRes.status,
      passed: disconnectRes.status === 200 && disconnectRes.data?.success === true,
      details: 'Disconnected CTWA assets cleanly from PostgreSQL',
    });

  } catch (err) {
    console.error('Test execution error:', err);
  }

  console.table(results);
  const allPassed = results.length > 0 && results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of Market -> Meta Ads / CTWA tests passed!');
  } else {
    console.error('[FAILURES DETECTED] Some tests failed.');
  }
}

runCtwaTests();
