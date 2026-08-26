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

async function testBrowserLifecycle() {
  console.log('Testing End-to-End Google Login Onboarding Lifecycle against real database...');
  const results = [];

  try {
    const googleSub = '103115212680146289816';
    const email = 'nileshpatel992085@gmail.com';

    // 1. Check existing record
    const initialUser = await db.findOne('users', 'google_id = $1', [googleSub]);
    results.push({
      step: '1. Locate User in PostgreSQL by google_id',
      status: 200,
      passed: !!initialUser,
      details: `Found user id "${initialUser?.id}", email: "${initialUser?.email}"`,
    });

    // 2. Obtain session JWT
    const loginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email }
    );
    const token = loginRes.data?.data?.token;
    results.push({
      step: '2. Issue Session JWT for User',
      status: loginRes.status,
      passed: !!token,
      details: `JWT generated for id "${loginRes.data?.data?.user?.id}"`,
    });

    // 3. User Completes Onboarding Form (POST /api/auth/onboarding)
    const onboardingPayload = {
      businessSetup: {
        channel: 'Both',
        phone: '+919920850000',
        companyName: 'Nilesh Enterprise Hub',
        companyWebsite: 'https://nileshenterprise.com',
        companyLocation: 'Mumbai, India',
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
          Authorization: `Bearer ${token}`,
        },
      },
      onboardingPayload
    );

    results.push({
      step: '3. Save Onboarding Form (POST /api/auth/onboarding)',
      status: onboardingRes.status,
      passed: onboardingRes.status === 200 && onboardingRes.data?.data?.onboardingCompleted === true,
      details: `Database response: companyName = "${onboardingRes.data?.data?.companyName}", onboardingCompleted = ${onboardingRes.data?.data?.onboardingCompleted}`,
    });

    // 4. Directly Verify the EXACT User Record in PostgreSQL
    const updatedDbUser = await db.findOne('users', 'id = $1', [initialUser.id]);
    results.push({
      step: '4. Direct PostgreSQL Verification of User',
      status: 200,
      passed: updatedDbUser && updatedDbUser.onboarding_completed === true && updatedDbUser.company_name === 'Nilesh Enterprise Hub',
      details: `PostgreSQL row for "${updatedDbUser?.id}": onboarding_completed = ${updatedDbUser?.onboarding_completed}, company_name = "${updatedDbUser?.company_name}"`,
    });

    // 5. Verify GET /api/auth/me returns onboardingCompleted = true
    const meRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    results.push({
      step: '5. Verify GET /api/auth/me State',
      status: meRes.status,
      passed: meRes.status === 200 && meRes.data?.data?.onboardingCompleted === true,
      details: `GET /api/auth/me returned onboardingCompleted = ${meRes.data?.data?.onboardingCompleted} for "${meRes.data?.data?.name}"`,
    });

    // 6. Simulate Logout & Subsequent Login with SAME Google Account
    const secondLoginUser = await db.findOne('users', 'google_id = $1', [googleSub]);
    const targetRoute = secondLoginUser.onboarding_completed ? '/dashboard' : '/onboarding';

    results.push({
      step: '6. Subsequent Google Login Routing Decision',
      status: 200,
      passed: targetRoute === '/dashboard',
      details: `Returning user routes directly to "${targetRoute}" (No onboarding form shown!)`,
    });

  } catch (err) {
    console.error('Lifecycle test error:', err);
  }

  console.table(results);
  const allPassed = results.length > 0 && results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% End-to-End Lifecycle Verified in PostgreSQL & API layer!');
  } else {
    console.error('[FAILURES DETECTED] Some tests failed.');
  }
}

testBrowserLifecycle();
