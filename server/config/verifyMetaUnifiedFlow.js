async function verifyMetaUnifiedFlow() {
  const BASE_URL = 'http://localhost:5000/api';
  const results = [];

  const testEndpoint = async (name, url, options = {}) => {
    try {
      const res = await fetch(url, options);
      const data = await res.json();
      const passed = res.ok && (data.success || data.status === 'healthy');
      results.push({ name, status: res.status, passed, sample: JSON.stringify(data).slice(0, 90) + '...' });
    } catch (err) {
      results.push({ name, status: 'ERROR', passed: false, error: err.message });
    }
  };

  console.log('Testing Unified Meta WhatsApp Onboarding API Endpoints...');

  // 1. Health
  await testEndpoint('1. Health Check', `${BASE_URL}/health`);

  // 2. Meta Auth URL
  await testEndpoint('2. Meta Auth URL', `${BASE_URL}/meta/auth`);

  // 3. Meta Businesses (Portfolios)
  await testEndpoint('3. Get Meta Businesses', `${BASE_URL}/meta/businesses`);

  // 4. Meta WABAs
  await testEndpoint('4. Get WABAs for Business', `${BASE_URL}/meta/wabas?businessId=mb_9018410291`);

  // 5. Meta Phone Numbers
  await testEndpoint('5. Get Phone Numbers for WABA', `${BASE_URL}/meta/phone-numbers?wabaId=waba_9824901840`);

  // 6. Connect WhatsApp Business
  await testEndpoint('6. Connect WhatsApp Business (Save to PG)', `${BASE_URL}/meta/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metaBusinessId: 'mb_9018410291',
      wabaId: 'waba_9824901840',
      phoneNumberId: 'phone_1092837461',
      displayPhoneNumber: '+91 98765 43210',
      businessName: 'ARCO Communication Retail',
    }),
  });

  // 7. Meta Status (should be connected now)
  await testEndpoint('7. Get Meta Status (Connected)', `${BASE_URL}/meta/status`);

  // 8. Disconnect WhatsApp Business
  await testEndpoint('8. Disconnect WhatsApp Business', `${BASE_URL}/meta/disconnect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  // 9. Reconnect for permanent clean state
  await testEndpoint('9. Reconnect WhatsApp Business', `${BASE_URL}/meta/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metaBusinessId: 'mb_9018410291',
      wabaId: 'waba_9824901840',
      phoneNumberId: 'phone_1092837461',
      displayPhoneNumber: '+91 98765 43210',
      businessName: 'ARCO Communication Retail',
    }),
  });

  console.table(results);

  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of Meta WhatsApp Unified Flow endpoints passed successfully!');
    process.exit(0);
  } else {
    console.error('[FAILURES DETECTED] Some endpoints failed.');
    process.exit(1);
  }
}

verifyMetaUnifiedFlow();
