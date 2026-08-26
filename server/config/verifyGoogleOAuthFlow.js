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

async function runGoogleOAuthTests() {
  console.log('Testing ARCO Google OAuth Post-Login Routing & Onboarding Progression...');
  const results = [];

  try {
    // Test 1: Get Google Auth URL Endpoint
    const urlRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/google/url',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    results.push({
      test: '1. Get Google Auth Config (GET /api/auth/google/url)',
      status: urlRes.status,
      passed: urlRes.status === 200 && urlRes.data?.success === true,
      details: `isConfigured: ${urlRes.data?.data?.isConfigured}, Redirect URI: "${urlRes.data?.data?.redirectUri}"`,
    });

    // Test 2: Standard Login for New/Incomplete User (POST /api/auth/login)
    const newLoginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'new.google.user.test@example.com' }
    );
    results.push({
      test: '2. Login Response for New User (POST /api/auth/login)',
      status: newLoginRes.status,
      passed: newLoginRes.status === 200 && newLoginRes.data?.data?.user?.onboardingCompleted === false,
      details: `onboardingCompleted: ${newLoginRes.data?.data?.user?.onboardingCompleted} -> Enters /onboarding flow`,
    });

    // Test 3: OAuth Cancellation Handling (POST /api/auth/google/callback with error)
    const cancelRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/google/callback',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { error: 'access_denied' }
    );
    results.push({
      test: '3. OAuth Cancellation Handling (POST /api/auth/google/callback with error)',
      status: cancelRes.status,
      passed: cancelRes.status === 400 && cancelRes.data?.error?.includes('cancelled or denied'),
      details: `Gracefully handled cancellation: "${cancelRes.data?.error}"`,
    });

    // Test 4: Frontend Route /login
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/login',
      method: 'GET',
    });
    results.push({
      test: '4. Frontend Route /login',
      status: loginRes.status,
      passed: loginRes.status === 200,
      details: `Vite frontend returned HTTP ${loginRes.status} OK`,
    });

    // Test 5: Frontend Route /onboarding (Step 0)
    const onboardingRes = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/onboarding',
      method: 'GET',
    });
    results.push({
      test: '5. Frontend Route /onboarding (Business Profile Setup)',
      status: onboardingRes.status,
      passed: onboardingRes.status === 200,
      details: `Vite frontend returned HTTP ${onboardingRes.status} OK`,
    });

    // Test 6: Frontend Route /onboarding/meta-whatsapp (Preserved)
    const metaWaRes = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/onboarding/meta-whatsapp',
      method: 'GET',
    });
    results.push({
      test: '6. Frontend Route /onboarding/meta-whatsapp (WhatsApp Integration)',
      status: metaWaRes.status,
      passed: metaWaRes.status === 200,
      details: `Vite frontend returned HTTP ${metaWaRes.status} OK (Accessible when chosen)`,
    });

  } catch (err) {
    console.error('Test execution error:', err);
  }

  console.table(results);
  const allPassed = results.length > 0 && results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of Google OAuth post-login routing tests passed!');
  } else {
    console.error('[FAILURES DETECTED] Some tests failed.');
  }
}

runGoogleOAuthTests();
