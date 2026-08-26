async function testRateLimiting() {
  console.log('================================================================');
  console.log('🧪 TESTING API RATE LIMITING (AUTH & GLOBAL LIMITERS)');
  console.log('================================================================\n');

  const BASE_URL = 'http://localhost:5000/api';

  // 1. Verify standard request
  console.log('--- 1. Testing Normal Auth Endpoint Request ---');
  const res1 = await fetch(`${BASE_URL}/auth/google/url`);
  console.log(`Initial Request Status: ${res1.status} ${res1.statusText}`);
  const rateLimitLimit = res1.headers.get('ratelimit-limit');
  const rateLimitRemaining = res1.headers.get('ratelimit-remaining');
  console.log(`RateLimit-Limit: ${rateLimitLimit}, RateLimit-Remaining: ${rateLimitRemaining}`);

  // 2. Deliberately trigger auth rate limit
  console.log('\n--- 2. Deliberately Exceeding Auth Rate Limit (10 req/min) ---');
  const statuses = [];
  let blockedResponse = null;

  for (let i = 1; i <= 12; i++) {
    const r = await fetch(`${BASE_URL}/auth/google/url`);
    statuses.push(r.status);
    if (r.status === 429 && !blockedResponse) {
      blockedResponse = await r.json();
    }
  }

  console.log(`Sequence of 12 requests HTTP statuses:`, statuses);
  console.log(`HTTP 429 Triggered successfully:`, statuses.includes(429));
  console.log(`HTTP 429 Response body:`, JSON.stringify(blockedResponse));

  // 3. Overall Verdict
  const passed = statuses.includes(429) && blockedResponse?.success === false && blockedResponse?.error.includes('Too many requests');
  console.log(`\nRATE LIMITER TEST RESULT: ${passed ? '🎉 PASS' : '❌ FAIL'}\n`);
  process.exit(passed ? 0 : 1);
}

testRateLimiting();
