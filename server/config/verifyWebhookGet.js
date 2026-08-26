async function verifyWebhookEndpoint() {
  const BASE_URL = 'http://localhost:5000/api/whatsapp/webhook';
  const VERIFY_TOKEN = 'arco_meta_webhook_verify_token_2026';
  const TEST_CHALLENGE = '1158201444';

  const results = [];

  console.log('Testing Meta WhatsApp Webhook Verification Handshake...');

  // Test 1: Valid Verification Request
  try {
    const res = await fetch(`${BASE_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=${TEST_CHALLENGE}`);
    const text = await res.text();
    const passed = res.status === 200 && text === TEST_CHALLENGE;
    results.push({
      test: '1. Valid Verify Token & Mode',
      status: res.status,
      expectedStatus: 200,
      responseBody: text,
      passed,
    });
  } catch (e) {
    results.push({ test: '1. Valid Verify Token & Mode', status: 'ERROR', passed: false, error: e.message });
  }

  // Test 2: Invalid Verify Token
  try {
    const res = await fetch(`${BASE_URL}?hub.mode=subscribe&hub.verify_token=INVALID_TOKEN&hub.challenge=${TEST_CHALLENGE}`);
    const text = await res.text();
    const passed = res.status === 403;
    results.push({
      test: '2. Invalid Verify Token',
      status: res.status,
      expectedStatus: 403,
      responseBody: text,
      passed,
    });
  } catch (e) {
    results.push({ test: '2. Invalid Verify Token', status: 'ERROR', passed: false, error: e.message });
  }

  // Test 3: Invalid Mode
  try {
    const res = await fetch(`${BASE_URL}?hub.mode=unsubscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=${TEST_CHALLENGE}`);
    const text = await res.text();
    const passed = res.status === 403;
    results.push({
      test: '3. Invalid Mode',
      status: res.status,
      expectedStatus: 403,
      responseBody: text,
      passed,
    });
  } catch (e) {
    results.push({ test: '3. Invalid Mode', status: 'ERROR', passed: false, error: e.message });
  }

  // Test 4: Missing Parameters
  try {
    const res = await fetch(BASE_URL);
    const text = await res.text();
    const passed = res.status === 400;
    results.push({
      test: '4. Missing Parameters',
      status: res.status,
      expectedStatus: 400,
      responseBody: text,
      passed,
    });
  } catch (e) {
    results.push({ test: '4. Missing Parameters', status: 'ERROR', passed: false, error: e.message });
  }

  // Test 5: Existing POST Webhook Event
  try {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ object: 'whatsapp_business_account', entry: [] }),
    });
    const text = await res.text();
    const passed = res.status === 200 && text === 'EVENT_RECEIVED';
    results.push({
      test: '5. Existing POST Webhook Event',
      status: res.status,
      expectedStatus: 200,
      responseBody: text,
      passed,
    });
  } catch (e) {
    results.push({ test: '5. Existing POST Webhook Event', status: 'ERROR', passed: false, error: e.message });
  }

  console.table(results);

  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of Meta Webhook Verification tests passed successfully!');
    process.exit(0);
  } else {
    console.error('[FAILURES DETECTED] Some tests failed.');
    process.exit(1);
  }
}

verifyWebhookEndpoint();
