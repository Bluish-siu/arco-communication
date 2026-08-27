import jwt from 'jsonwebtoken';
import http from 'http';
import { query, pool } from './db.js';
import { config } from './index.js';

const token = jwt.sign(
  { id: 'usr_1', email: 'owner@arco.com', role: 'admin' },
  config.jwtSecret,
  { expiresIn: '1h' }
);

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: config.port || 5000,
      path: `/api${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(dataString ? { 'Content-Length': Buffer.byteLength(dataString) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 RUNNING META CONNECT & BUSINESS VERIFICATION END-TO-END QA');
  console.log('===============================================================');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${details}`);
    }
  }

  try {
    // 0. Ensure clean initial state (disconnect if connected)
    await makeRequest('/meta/disconnect', 'POST');

    // 1. Verify initial disconnected state
    const initialStatus = await makeRequest('/meta/status');
    assert(
      initialStatus.status === 200 && initialStatus.body?.data?.connected === false,
      'Initial /meta/status reports connected: false'
    );

    const initialDashboard = await makeRequest('/settings/dashboard-state');
    assert(
      initialDashboard.status === 200 && initialDashboard.body?.data?.whatsappStatus?.connected === false,
      'Initial /settings/dashboard-state reports whatsappStatus.connected: false'
    );

    // 2. Test GST File Upload Validation - Invalid Extension Rejected
    const invalidUpload = await makeRequest('/meta/upload-gst', 'POST', {
      fileName: 'malicious_script.exe',
      fileType: 'application/x-msdownload',
      fileSize: 1024,
    });
    assert(
      invalidUpload.status === 400 && invalidUpload.body?.success === false,
      'POST /meta/upload-gst rejects invalid file formats (.exe, .txt)'
    );

    // 3. Test GST File Upload Validation - File Size Exceeded Rejected
    const oversizeUpload = await makeRequest('/meta/upload-gst', 'POST', {
      fileName: 'large_gst_cert.pdf',
      fileType: 'application/pdf',
      fileSize: 15 * 1024 * 1024, // 15MB
    });
    assert(
      oversizeUpload.status === 400 && oversizeUpload.body?.success === false,
      'POST /meta/upload-gst rejects file size > 10MB'
    );

    // 4. Test GST File Upload Validation - Valid PDF Accepted
    const validUpload = await makeRequest('/meta/upload-gst', 'POST', {
      fileName: 'arco_official_gst_certificate.pdf',
      fileType: 'application/pdf',
      fileSize: 524288, // 512KB
    });
    assert(
      validUpload.status === 200 && validUpload.body?.success === true && validUpload.body?.data?.fileUrl,
      'POST /meta/upload-gst successfully validates and uploads PDF certificate',
      JSON.stringify(validUpload.body)
    );

    // 5. Test Connect Number Missing Phone Number - Rejected
    const invalidConnect = await makeRequest('/meta/connect', 'POST', {
      displayPhoneNumber: '',
      businessName: 'ARCO Test Store',
    });
    assert(
      invalidConnect.status === 400 && invalidConnect.body?.success === false,
      'POST /meta/connect rejects submission with empty phone number'
    );

    // 6. Test Connect Number with GST Verification (Tier 2 limit: 1,000 msgs/day)
    const gstConnect = await makeRequest('/meta/connect', 'POST', {
      numberType: 'wa_business',
      country: 'India',
      isMetaVerified: false,
      verificationMethod: 'gst',
      gstNumber: '29ABCDE1234F1Z5',
      gstFileUrl: validUpload.body?.data?.fileUrl,
      gstFileName: 'arco_official_gst_certificate.pdf',
      displayPhoneNumber: '+91 98765 43210',
      businessName: 'ARCO Communication Retail',
      withoutVerification: false,
    });
    assert(
      gstConnect.status === 200 && gstConnect.body?.success === true,
      'POST /meta/connect connects WA Business number with GST verification',
      JSON.stringify(gstConnect.body)
    );

    // 7. Verify /meta/status returns real connected state with full metadata
    const verifiedStatus = await makeRequest('/meta/status');
    const vData = verifiedStatus.body?.data || {};
    assert(
      vData.connected === true && vData.displayPhoneNumber === '+91 98765 43210',
      'GET /meta/status confirms active connected phone number',
      JSON.stringify(vData)
    );
    assert(
      vData.verificationStatus === 'verified' && vData.messagingLimit === '1,000 msgs/day',
      'GET /meta/status confirms Tier 2 messaging limit (1,000 msgs/day) with verified status',
      JSON.stringify(vData)
    );
    assert(
      vData.gstNumber === '29ABCDE1234F1Z5' && vData.gstFileName === 'arco_official_gst_certificate.pdf',
      'GET /meta/status retrieves persisted GST number and filename from PostgreSQL',
      JSON.stringify(vData)
    );

    // 8. Verify /settings/dashboard-state reflects connected state
    const verifiedDashboard = await makeRequest('/settings/dashboard-state');
    const dWa = verifiedDashboard.body?.data?.whatsappStatus || {};
    assert(
      dWa.connected === true && dWa.verified === true && dWa.displayPhoneNumber === '+91 98765 43210',
      'GET /settings/dashboard-state reflects active verified WhatsApp connection on dashboard',
      JSON.stringify(dWa)
    );

    // 9. Test Disconnect
    const disconnectRes = await makeRequest('/meta/disconnect', 'POST');
    assert(
      disconnectRes.status === 200 && disconnectRes.body?.success === true,
      'POST /meta/disconnect successfully disconnects number from backend & DB'
    );

    const postDisconnectStatus = await makeRequest('/meta/status');
    assert(
      postDisconnectStatus.body?.data?.connected === false,
      'GET /meta/status confirms disconnected state after disconnect'
    );

    // 10. Test "Connect without Verification" flow (Tier 1 limit: 250 msgs/day)
    const unverifiedConnect = await makeRequest('/meta/connect', 'POST', {
      numberType: 'new_number',
      country: 'United States',
      displayPhoneNumber: '+1 415 555 2671',
      businessName: 'ARCO North America',
      withoutVerification: true,
    });
    assert(
      unverifiedConnect.status === 200 && unverifiedConnect.body?.success === true,
      'POST /meta/connect connects without verification (Tier 1 limit: 250 msgs/day)',
      JSON.stringify(unverifiedConnect.body)
    );

    const unverifiedStatus = await makeRequest('/meta/status');
    const uData = unverifiedStatus.body?.data || {};
    assert(
      uData.connected === true && uData.verificationStatus === 'unverified' && uData.messagingLimit === '250 msgs/day',
      'GET /meta/status confirms unverified connection with 250 msgs/day limit',
      JSON.stringify(uData)
    );

    // Clean up
    await makeRequest('/meta/disconnect', 'POST');

  } catch (err) {
    console.error('Fatal test error:', err);
  } finally {
    console.log('===============================================================');
    console.log(`📊 RESULTS: ${passed}/${total} QA TESTS PASSED`);
    console.log('===============================================================');
    await pool.end();
    process.exit(passed === total ? 0 : 1);
  }
}

runTests();
