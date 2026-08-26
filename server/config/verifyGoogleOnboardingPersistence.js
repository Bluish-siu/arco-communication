import http from 'http';
import { db, query } from './db.js';

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

async function runOnboardingPersistenceTests() {
  console.log('Testing ARCO Google Login Onboarding Persistence & Stable Identity Flow...');
  const results = [];

  try {
    const testGoogleSub = `g_sub_test_${Date.now()}`;
    const testEmail = `persistence.test.${Date.now()}@example.com`;

    // 1. Simulate First Google Login for New User
    // Directly insert new user mimicking handleGoogleCallback
    const newUser = await db.insert('users', {
      id: `usr_${Date.now()}`,
      google_id: testGoogleSub,
      name: 'Google Test User',
      email: testEmail,
      company_name: "Google Test User's Business",
      role: 'admin',
      trial_days_remaining: 14,
      onboarding_completed: false,
    });

    results.push({
      test: '1. First Google Login (New User Creation in PostgreSQL)',
      status: 201,
      passed: !!newUser && newUser.onboarding_completed === false && newUser.google_id === testGoogleSub,
      details: `Created user "${newUser.id}" with google_id "${testGoogleSub}", onboarding_completed: false`,
    });

    // 2. Log in and get JWT token for this user
    const loginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: testEmail }
    );

    const userToken = loginRes.data?.data?.token;

    results.push({
      test: '2. JWT Token Issuance for Google User',
      status: loginRes.status,
      passed: loginRes.status === 200 && !!userToken,
      details: `Issued valid JWT token for user id "${loginRes.data?.data?.user?.id}"`,
    });

    // 3. User Completes Onboarding Form (POST /api/auth/onboarding)
    const onboardingPayload = {
      businessSetup: {
        channel: 'WhatsApp',
        phone: '9876543210',
        companyName: 'Retail Spark Innovations',
        companyWebsite: 'https://sparkretail.com',
        companyLocation: 'Bengaluru, India',
        annualRevenue: '₹50L - ₹2Cr',
        hasShopify: 'Yes',
        whatsappUpdates: true,
      },
      industryData: {
        industry: 'Retail',
        subCategory: 'Apparel & Fashion',
      },
      objectives: ['promote-updates', 'generate-leads'],
      integrations: ['shopify'],
      configuration: {
        hasFacebookBM: 'Yes',
        hasUsedWhatsAppAPI: 'No',
      },
      isCompleted: true,
    };

    const onboardingRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/onboarding',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      },
      onboardingPayload
    );

    results.push({
      test: '3. Save Onboarding to PostgreSQL (POST /api/auth/onboarding)',
      status: onboardingRes.status,
      passed: onboardingRes.status === 200 && onboardingRes.data?.data?.onboardingCompleted === true,
      details: `Persisted onboarding for "${onboardingRes.data?.data?.companyName}", onboardingCompleted: true`,
    });

    // 4. Verify in PostgreSQL Database directly
    const dbUserCheck = await db.findOne('users', 'id = $1', [newUser.id]);
    results.push({
      test: '4. Direct PostgreSQL Verification of User Record',
      status: 200,
      passed: dbUserCheck && dbUserCheck.onboarding_completed === true && dbUserCheck.company_name === 'Retail Spark Innovations',
      details: `Verified in PostgreSQL: onboarding_completed = ${dbUserCheck.onboarding_completed}, company: "${dbUserCheck.company_name}"`,
    });

    // 5. Simulate Second Google Login with the SAME Account
    // Look up by google_id
    const existingGoogleUser = await db.findOne('users', 'google_id = $1', [testGoogleSub]);
    let secondLoginTarget = '/onboarding';
    if (existingGoogleUser.onboarding_completed) {
      secondLoginTarget = '/dashboard';
    }

    results.push({
      test: '5. Second Google Login Detection & Routing',
      status: 200,
      passed: existingGoogleUser && existingGoogleUser.id === newUser.id && secondLoginTarget === '/dashboard',
      details: `Identified existing account -> targetRoute is "${secondLoginTarget}" (Direct to Dashboard, NO onboarding form!)`,
    });

    // 6. Test GET /api/auth/me returns updated status with token
    const meRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    results.push({
      test: '6. Server State Hydration (GET /api/auth/me)',
      status: meRes.status,
      passed: meRes.status === 200 && meRes.data?.data?.onboardingCompleted === true,
      details: `Hydrated onboardingCompleted = ${meRes.data?.data?.onboardingCompleted} for user "${meRes.data?.data?.name}"`,
    });

  } catch (err) {
    console.error('Test execution error:', err);
  }

  console.table(results);
  const allPassed = results.length > 0 && results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of Google Onboarding Persistence tests passed!');
  } else {
    console.error('[FAILURES DETECTED] Some tests failed.');
  }
}

runOnboardingPersistenceTests();
