import { query, db } from './db.js';
import jwt from 'jsonwebtoken';
import { config } from './index.js';

const BASE_URL = 'http://localhost:5000/api';

async function runExhaustivePhoneAuthTest() {
  console.log('====================================================');
  console.log('🧪 EXHAUSTIVE FIREBASE PHONE + OTP AUTH TEST SUITE');
  console.log('====================================================\n');

  const testUid = `firebase_test_uid_${Date.now()}`;
  const testPhone = '+919876543210';
  const existingPhoneOnly = '+919123456789';

  // Helper to generate mock Firebase ID tokens
  function createMockFirebaseToken(uid, phone) {
    return jwt.sign(
      {
        iss: 'https://securetoken.google.com/arco-communication',
        aud: 'arco-communication',
        sub: uid,
        uid: uid,
        phone_number: phone,
        auth_time: Math.floor(Date.now() / 1000),
      },
      'mock_firebase_secret',
      { expiresIn: '1h' }
    );
  }

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, label, details) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${label}`);
      if (details) console.log(`     ↳ ${details}`);
    } else {
      console.error(`  ❌ [FAIL] ${label}`);
      if (details) console.error(`     ↳ ${details}`);
    }
  }

  try {
    // Clean up test data
    await query('DELETE FROM users WHERE phone IN ($1, $2) OR firebase_uid = $3', [testPhone, existingPhoneOnly, testUid]);

    // -------------------------------------------------------------
    // Test Group 1: Token Security & Validation
    // -------------------------------------------------------------
    console.log('--- 1. Token Security & Validation ---');
    
    // Missing token
    const resNoToken = await fetch(`${BASE_URL}/auth/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(resNoToken.status === 400, 'Reject request with missing Firebase ID token', `HTTP ${resNoToken.status}`);

    // Empty string token
    const resEmptyToken = await fetch(`${BASE_URL}/auth/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: '' }),
    });
    assert(resEmptyToken.status === 400, 'Reject request with empty token string', `HTTP ${resEmptyToken.status}`);

    // -------------------------------------------------------------
    // Test Group 2: New Phone User First Login & Database Creation
    // -------------------------------------------------------------
    console.log('\n--- 2. New Phone User First Authentication ---');
    const token1 = createMockFirebaseToken(testUid, testPhone);
    const resFirstLogin = await fetch(`${BASE_URL}/auth/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token1 }),
    });

    const firstLoginData = await resFirstLogin.json();
    assert(resFirstLogin.status === 200 && firstLoginData.success, 'New phone login succeeds with 200 OK', `Token issued: ${!!firstLoginData.data?.token}`);
    assert(firstLoginData.data?.user?.email === null, 'Phone-only user has NULL email (strictly NO fake email)', `email = ${firstLoginData.data?.user?.email}`);
    assert(firstLoginData.data?.user?.phone === testPhone, 'Authoritative phone number returned from token', `phone = ${firstLoginData.data?.user?.phone}`);
    assert(firstLoginData.data?.user?.onboardingCompleted === false, 'New phone user starts with onboardingCompleted = false', `onboardingCompleted = ${firstLoginData.data?.user?.onboardingCompleted}`);
    assert(firstLoginData.data?.targetRoute === '/onboarding', 'New user targetRoute is "/onboarding"', `targetRoute = "${firstLoginData.data?.targetRoute}"`);

    const newUserId = firstLoginData.data?.user?.id;
    const sessionToken = firstLoginData.data?.token;

    // Direct PostgreSQL inspection
    const pgUser1 = await db.findOne('users', 'id = $1', [newUserId]);
    assert(!!pgUser1, 'User record created in PostgreSQL', `id: "${pgUser1?.id}"`);
    assert(pgUser1?.phone === testPhone, 'PostgreSQL column phone matches verified token', `phone: "${pgUser1?.phone}"`);
    assert(pgUser1?.firebase_uid === testUid, 'PostgreSQL column firebase_uid linked', `firebase_uid: "${pgUser1?.firebase_uid}"`);
    assert(pgUser1?.email === null, 'PostgreSQL column email is NULL', `email: ${pgUser1?.email}`);
    assert(pgUser1?.onboarding_completed === false, 'PostgreSQL column onboarding_completed is false', `onboarding_completed: ${pgUser1?.onboarding_completed}`);

    // -------------------------------------------------------------
    // Test Group 3: Session Hydration (/api/auth/me)
    // -------------------------------------------------------------
    console.log('\n--- 3. Session Hydration (/api/auth/me) ---');
    const resMe = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    const meData = await resMe.json();
    assert(resMe.status === 200 && meData.success, 'GET /api/auth/me succeeds with JWT session', `HTTP ${resMe.status}`);
    assert(meData.data?.id === newUserId, '/api/auth/me returns matching user ID', `id: "${meData.data?.id}"`);
    assert(meData.data?.phone === testPhone, '/api/auth/me returns user phone', `phone: "${meData.data?.phone}"`);
    assert(meData.data?.email === null, '/api/auth/me returns null email', `email: ${meData.data?.email}`);
    assert(meData.data?.onboardingCompleted === false, '/api/auth/me returns onboardingCompleted = false', `onboardingCompleted: ${meData.data?.onboardingCompleted}`);

    // -------------------------------------------------------------
    // Test Group 4: Complete Onboarding Lifecycle
    // -------------------------------------------------------------
    console.log('\n--- 4. Complete Onboarding Form ---');
    const resOnboarding = await fetch(`${BASE_URL}/auth/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        businessSetup: {
          companyName: 'Global Messaging Enterprise',
          phone: testPhone,
          companyLocation: 'Mumbai, India',
        },
        industryData: {
          industry: 'E-commerce',
          subCategory: 'Retail Brand',
        },
        objectives: ['Automate WhatsApp Support', 'WhatsApp Broadcasts'],
        integrations: ['Shopify', 'Salesforce'],
        configuration: {
          hasFacebookBM: true,
          hasUsedWhatsAppAPI: true,
        },
        isCompleted: true,
      }),
    });

    const onboardingData = await resOnboarding.json();
    assert(resOnboarding.status === 200 && onboardingData.success, 'POST /api/auth/onboarding succeeds', `HTTP ${resOnboarding.status}`);

    const pgUserAfterOnboarding = await db.findOne('users', 'id = $1', [newUserId]);
    assert(pgUserAfterOnboarding?.onboarding_completed === true, 'PostgreSQL record marked onboarding_completed = true', `onboarding_completed: ${pgUserAfterOnboarding?.onboarding_completed}`);
    assert(pgUserAfterOnboarding?.company_name === 'Global Messaging Enterprise', 'PostgreSQL company_name persisted', `company_name: "${pgUserAfterOnboarding?.company_name}"`);

    // -------------------------------------------------------------
    // Test Group 5: Returning Phone User (Direct Dashboard Route & Zero Duplicates)
    // -------------------------------------------------------------
    console.log('\n--- 5. Returning Phone User Authentication ---');
    const resSecondLogin = await fetch(`${BASE_URL}/auth/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token1 }),
    });

    const secondLoginData = await resSecondLogin.json();
    assert(resSecondLogin.status === 200 && secondLoginData.success, 'Returning phone login succeeds', `HTTP ${resSecondLogin.status}`);
    assert(secondLoginData.data?.user?.id === newUserId, 'Reuses exact same existing user ID (no duplicate created)', `id: "${secondLoginData.data?.user?.id}"`);
    assert(secondLoginData.data?.user?.onboardingCompleted === true, 'Recognizes onboarding_completed = true state', `onboardingCompleted = ${secondLoginData.data?.user?.onboardingCompleted}`);
    assert(secondLoginData.data?.targetRoute === '/dashboard', 'Returning user routes DIRECTLY to "/dashboard" (No onboarding form shown!)', `targetRoute: "${secondLoginData.data?.targetRoute}"`);

    // -------------------------------------------------------------
    // Test Group 6: Multiple Logins in a Row (Idempotency)
    // -------------------------------------------------------------
    console.log('\n--- 6. Idempotent Multiple Logins ---');
    for (let i = 1; i <= 3; i++) {
      const resMulti = await fetch(`${BASE_URL}/auth/phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token1 }),
      });
      const multiData = await resMulti.json();
      assert(multiData.data?.user?.id === newUserId, `Login #${i} returns same user ID`, `id: "${multiData.data?.user?.id}"`);
    }

    const countRes = await query('SELECT count(*) FROM users WHERE phone = $1', [testPhone]);
    assert(parseInt(countRes.rows[0].count, 10) === 1, 'Total rows in database for this phone number is strictly 1', `Count = ${countRes.rows[0].count}`);

    // -------------------------------------------------------------
    // Test Group 7: Safe Phone Linking (Existing phone without UID)
    // -------------------------------------------------------------
    console.log('\n--- 7. Safe Account Phone Linking ---');
    // Insert a pre-existing contact/user with phone but no firebase_uid
    const preExistingUser = await db.insert('users', {
      id: `usr_pre_${Date.now()}`,
      phone: existingPhoneOnly,
      email: null,
      name: 'Pre Existing Phone User',
      company_name: 'Pre Existing Co',
      role: 'admin',
      trial_days_remaining: 14,
      onboarding_completed: true,
    });

    const newUidForPhone = `firebase_link_uid_${Date.now()}`;
    const tokenLink = createMockFirebaseToken(newUidForPhone, existingPhoneOnly);

    const resLink = await fetch(`${BASE_URL}/auth/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: tokenLink }),
    });

    const linkData = await resLink.json();
    assert(linkData.data?.user?.id === preExistingUser.id, 'Links to existing user with matching phone number', `id: "${linkData.data?.user?.id}"`);

    const pgLinkedUser = await db.findOne('users', 'id = $1', [preExistingUser.id]);
    assert(pgLinkedUser?.firebase_uid === newUidForPhone, 'firebase_uid populated safely on existing user', `firebase_uid: "${pgLinkedUser?.firebase_uid}"`);

    const countResLink = await query('SELECT count(*) FROM users WHERE phone = $1', [existingPhoneOnly]);
    assert(parseInt(countResLink.rows[0].count, 10) === 1, 'Strictly 1 row in database after account linking', `Count = ${countResLink.rows[0].count}`);

    // Clean up test rows
    await query('DELETE FROM users WHERE id IN ($1, $2)', [newUserId, preExistingUser.id]);

    console.log('\n====================================================');
    console.log(`🎉 EXHAUSTIVE PHONE AUTH TEST: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('Test execution error:', error);
  }
}

runExhaustivePhoneAuthTest();
