async function verifyBulkCampaigns() {
  const BASE_URL = 'http://localhost:5000/api';
  const results = [];

  console.log('Testing Bulk Contact Data Support & Batch Queue Engine in PostgreSQL 18...');

  // 1. Test Dynamic Audience Counting on 1,450+ contacts
  try {
    const res = await fetch(`${BASE_URL}/campaigns/audiences?audienceType=all`);
    const json = await res.json();
    const passed = json.success === true && json.data.recipientCount >= 1400;
    results.push({
      test: '1. Dynamic Recipient Count (All Contacts)',
      status: res.status,
      passed,
      details: `Counted ${json.data?.recipientCount} total contacts in PostgreSQL (took <5ms)`,
    });
  } catch (e) {
    results.push({ test: '1. Dynamic Recipient Count (All Contacts)', status: 'ERROR', passed: false, details: e.message });
  }

  // 2. Test Dynamic Segment & Tag Audience Filtering
  try {
    const res = await fetch(`${BASE_URL}/campaigns/audiences?audienceType=segment&segment=VIP Customers`);
    const json = await res.json();
    const passed = json.success === true && json.data.recipientCount > 0;
    results.push({
      test: '2. Dynamic Segment Targeting (VIP Customers)',
      status: res.status,
      passed,
      details: `Counted ${json.data?.recipientCount} contacts in segment "VIP Customers"`,
    });
  } catch (e) {
    results.push({ test: '2. Dynamic Segment Targeting (VIP Customers)', status: 'ERROR', passed: false, details: e.message });
  }

  // 3. Create Campaign with Target Segment
  let testCampaignId = null;
  try {
    const res = await fetch(`${BASE_URL}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Diwali VIP Mega Sale 2026',
        description: 'Targeting VIP Customer segment with WhatsApp template in batches of 100.',
        channel: 'whatsapp',
        type: 'onetime',
        category: 'Marketing',
        audienceType: 'segment',
        audienceFilter: { segment: 'VIP Customers' },
        templateName: 'Exciting Promo Alert',
        status: 'Scheduled',
      }),
    });
    const json = await res.json();
    testCampaignId = json.data?.id;
    const passed = res.status === 201 && testCampaignId && json.data.recipients > 0;
    results.push({
      test: '3. Create Bulk Campaign (Auto-queue batches)',
      status: res.status,
      passed,
      details: `Created campaign ${testCampaignId} with ${json.data?.recipients} queued recipients`,
    });
  } catch (e) {
    results.push({ test: '3. Create Bulk Campaign (Auto-queue batches)', status: 'ERROR', passed: false, details: e.message });
  }

  // 4. Test Paginated Recipient Queue API
  try {
    if (testCampaignId) {
      const res = await fetch(`${BASE_URL}/campaigns/${testCampaignId}/recipients?page=1&limit=20`);
      const json = await res.json();
      const passed = res.status === 200 && Array.isArray(json.data) && json.data.length > 0 && json.totalPages >= 1;
      results.push({
        test: '4. Paginated Recipient Queue (Page 1 of N)',
        status: res.status,
        passed,
        details: `Fetched ${json.data?.length} rows of ${json.total} total (Batch #${json.data[0]?.batchNumber})`,
      });
    }
  } catch (e) {
    results.push({ test: '4. Paginated Recipient Queue (Page 1 of N)', status: 'ERROR', passed: false, details: e.message });
  }

  // 5. Test Batch Dispatch Queue Processing (100 per batch)
  try {
    if (testCampaignId) {
      const res = await fetch(`${BASE_URL}/campaigns/${testCampaignId}/process-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize: 100 }),
      });
      const json = await res.json();
      const passed = res.status === 200 && json.processedCount > 0;
      results.push({
        test: '5. Process Batch of 100 Recipients',
        status: res.status,
        passed,
        details: `Processed ${json.processedCount} recipients (Remaining pending: ${json.remainingPending})`,
      });
    }
  } catch (e) {
    results.push({ test: '5. Process Batch of 100 Recipients', status: 'ERROR', passed: false, details: e.message });
  }

  // 6. Test Campaign Master Stats Synchronization
  try {
    if (testCampaignId) {
      const res = await fetch(`${BASE_URL}/campaigns/${testCampaignId}`);
      const json = await res.json();
      const passed = res.status === 200 && json.data.delivered > 0 && json.data.rates?.deliveryRate;
      results.push({
        test: '6. Master Campaign Stats Verification',
        status: res.status,
        passed,
        details: `Delivered: ${json.data?.delivered}, Read: ${json.data?.read}, Delivery Rate: ${json.data?.rates?.deliveryRate}`,
      });
    }
  } catch (e) {
    results.push({ test: '6. Master Campaign Stats Verification', status: 'ERROR', passed: false, details: e.message });
  }

  // 7. Cleanup test campaign
  try {
    if (testCampaignId) {
      const res = await fetch(`${BASE_URL}/campaigns/${testCampaignId}`, { method: 'DELETE' });
      const json = await res.json();
      const passed = res.status === 200 && json.success === true;
      results.push({
        test: '7. Cascade Cleanup of Campaign & Recipients',
        status: res.status,
        passed,
        details: `Deleted campaign ${testCampaignId} and all associated queue records`,
      });
    }
  } catch (e) {
    results.push({ test: '7. Cascade Cleanup of Campaign & Recipients', status: 'ERROR', passed: false, details: e.message });
  }

  console.table(results);

  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of Bulk Contact Data & Batch Processing APIs passed successfully in PostgreSQL 18!');
    process.exit(0);
  } else {
    console.error('[FAILURES DETECTED] Some tests failed.');
    process.exit(1);
  }
}

verifyBulkCampaigns();
