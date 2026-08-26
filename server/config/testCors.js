async function testCorsConfig() {
  console.log('================================================================');
  console.log('🧪 TESTING PRODUCTION-SAFE CORS CONFIGURATION');
  console.log('================================================================\n');

  const BASE_URL = 'http://localhost:5000/api';

  // 1. Request with local frontend origin: http://localhost:5173
  console.log('--- 1. Testing Request with Origin: http://localhost:5173 ---');
  const res1 = await fetch(`${BASE_URL}/health`, {
    headers: {
      Origin: 'http://localhost:5173',
    },
  });
  const allowOrigin1 = res1.headers.get('access-control-allow-origin');
  const allowCreds1 = res1.headers.get('access-control-allow-credentials');
  console.log(`Status: ${res1.status}, Access-Control-Allow-Origin: ${allowOrigin1}, Access-Control-Allow-Credentials: ${allowCreds1}`);
  const pass1 = allowOrigin1 === 'http://localhost:5173' && allowCreds1 === 'true';

  // 2. Preflight OPTIONS request from http://localhost:5173
  console.log('\n--- 2. Testing Preflight OPTIONS Request from http://localhost:5173 ---');
  const resPreflight = await fetch(`${BASE_URL}/auth/me`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:5173',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Authorization',
    },
  });
  const allowOriginPreflight = resPreflight.headers.get('access-control-allow-origin');
  const allowHeadersPreflight = resPreflight.headers.get('access-control-allow-headers');
  console.log(`Preflight Status: ${resPreflight.status}, Allow-Origin: ${allowOriginPreflight}`);
  const passPreflight = allowOriginPreflight === 'http://localhost:5173';

  // 3. Request with NO origin header (server-to-server / curl / Postman)
  console.log('\n--- 3. Testing Request with NO Origin Header ---');
  const resNoOrigin = await fetch(`${BASE_URL}/health`);
  console.log(`No-Origin Status: ${resNoOrigin.status} (OK: ${resNoOrigin.ok})`);
  const passNoOrigin = resNoOrigin.ok;

  // 4. Summary
  const allPassed = pass1 && passPreflight && passNoOrigin;
  console.log(`\nCORS VERIFICATION RESULT: ${allPassed ? '🎉 100% PASS' : '❌ FAIL'}\n`);
  process.exit(allPassed ? 0 : 1);
}

testCorsConfig();
