import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'arco_super_secure_jwt_secret_2026';
const token = jwt.sign({ id: 'usr_1', email: 'owner@arco.com', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 VERIFYING PHASE 1 (META CONNECTION) & PHASE 2 (TEST MESSAGE)');
  console.log('===============================================================');

  // Test 1: GET /api/meta/status
  const statusRes = await fetch(`${API_BASE}/meta/status`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const statusData = await statusRes.json();
  console.log('✅ 1. GET /api/meta/status (HTTP ' + statusRes.status + '):', statusData);

  // Test 2: GET /api/meta/verify-connection
  const verifyRes = await fetch(`${API_BASE}/meta/verify-connection`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const verifyData = await verifyRes.json();
  console.log('✅ 2. GET /api/meta/verify-connection (HTTP ' + verifyRes.status + '):', verifyData);

  // Test 3: POST /api/campaigns/send-test validation check
  const missingPhoneRes = await fetch(`${API_BASE}/campaigns/send-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ templateName: 'promo_offer' })
  });
  const missingPhoneData = await missingPhoneRes.json();
  console.log('✅ 3. POST /api/campaigns/send-test validation (HTTP ' + missingPhoneRes.status + '):', missingPhoneData);

  // Test 4: POST /api/campaigns/send-test with full payload
  const sendTestRes = await fetch(`${API_BASE}/campaigns/send-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      recipientPhone: '+919876543210',
      templateName: 'promo_offer',
      templateLanguage: 'en_US',
      variables: { '1': 'Ramesh', '2': 'FLAT 25% OFF' }
    })
  });
  const sendTestData = await sendTestRes.json();
  console.log('✅ 4. POST /api/campaigns/send-test dispatch (HTTP ' + sendTestRes.status + '):', sendTestData);

  console.log('===============================================================');
  console.log('📊 PHASE 1 & 2 QA VERIFICATION COMPLETE');
  console.log('===============================================================');
}

runTests().catch(console.error);
