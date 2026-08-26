async function verifySaveSegmentFlow() {
  const BASE_URL = 'http://localhost:5000/api';
  const results = [];

  console.log('Testing Interakt-style Save Segment & Multi-Condition Filter System...');

  // 1. Fetch initial saved segments
  let initialCount = 0;
  try {
    const res = await fetch(`${BASE_URL}/segments`);
    const json = await res.json();
    initialCount = json.data?.length || 0;
    const passed = res.status === 200 && Array.isArray(json.data) && initialCount >= 4;
    results.push({
      test: '1. Load Saved Segments from Backend',
      status: res.status,
      passed,
      details: `Loaded ${initialCount} saved segments with real-time estimated counts`,
    });
  } catch (e) {
    results.push({ test: '1. Load Saved Segments from Backend', status: 'ERROR', passed: false, details: e.message });
  }

  // 2. Dynamic Count with Tags condition (Is VIP) + Field condition (Deal Value > 20,000) + WhatsApp Opted
  try {
    const conditions = [
      { category: 'tag', operator: 'is', value: 'Repeat Buyers' },
      { category: 'field', field: 'value', operator: 'greater_than', value: '20000' },
    ];
    const res = await fetch(`${BASE_URL}/contacts/count?conditions=${encodeURIComponent(JSON.stringify(conditions))}&logic=AND&whatsapp_opted=true`);
    const json = await res.json();
    const passed = res.status === 200 && json.count > 0;
    results.push({
      test: '2. Dynamic Audience Count (Tags + Fields)',
      status: res.status,
      passed,
      details: `Matching Audience: ${json.count} contacts`,
    });
  } catch (e) {
    results.push({ test: '2. Dynamic Audience Count (Tags + Fields)', status: 'ERROR', passed: false, details: e.message });
  }

  // 3. Apply Filter Without Saving (GET /api/contacts with structured conditions)
  try {
    const conditions = [
      { category: 'tag', operator: 'is', value: 'Repeat Buyers' },
    ];
    const res = await fetch(`${BASE_URL}/contacts?conditions=${encodeURIComponent(JSON.stringify(conditions))}&logic=AND&whatsapp_opted=true&page=1&limit=10`);
    const json = await res.json();
    const passed = res.status === 200 && json.data.length > 0 && json.total > 0;
    results.push({
      test: '3. Apply Filter Without Saving',
      status: res.status,
      passed,
      details: `Retrieved ${json.data.length} contacts (Total matching: ${json.total})`,
    });
  } catch (e) {
    results.push({ test: '3. Apply Filter Without Saving', status: 'ERROR', passed: false, details: e.message });
  }

  // 4. Create and Save a New Multi-Condition Segment (POST /api/segments)
  let newSegmentId = null;
  try {
    const payload = {
      name: 'High Value Repeat Buyers',
      description: 'Repeat Buyers tagged accounts with deal value > 30000 and confirmed WhatsApp opt-in',
      filterType: 'tags',
      conditions: [
        { category: 'tag', operator: 'is', value: 'Repeat Buyers' },
        { category: 'field', field: 'value', operator: 'greater_than', value: '30000' },
      ],
      logic: 'AND',
    };

    const res = await fetch(`${BASE_URL}/segments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    newSegmentId = json.data?.id;

    const passed = res.status === 201 && newSegmentId && json.data.estimated_count > 0;
    results.push({
      test: '4. Save Segment to Database (POST /api/segments)',
      status: res.status,
      passed,
      details: `Saved segment "${json.data?.name}" (ID: ${newSegmentId}) with ${json.data?.estimated_count} contacts`,
    });
  } catch (e) {
    results.push({ test: '4. Save Segment to Database (POST /api/segments)', status: 'ERROR', passed: false, details: e.message });
  }

  // 5. Query Contacts using Newly Saved Segment
  try {
    if (newSegmentId) {
      const res = await fetch(`${BASE_URL}/contacts?savedSegmentId=${newSegmentId}&page=1&limit=20`);
      const json = await res.json();
      const passed = res.status === 200 && json.data.length > 0 && json.total > 0;
      results.push({
        test: '5. Query Contacts by Saved Segment ID',
        status: res.status,
        passed,
        details: `Successfully fetched ${json.data.length} contacts for saved segment ${newSegmentId}`,
      });
    }
  } catch (e) {
    results.push({ test: '5. Query Contacts by Saved Segment ID', status: 'ERROR', passed: false, details: e.message });
  }

  // 6. Cleanup test segment
  try {
    if (newSegmentId) {
      const delRes = await fetch(`${BASE_URL}/segments/${newSegmentId}`, { method: 'DELETE' });
      const passed = delRes.status === 200;
      results.push({
        test: '6. Delete / Cleanup Test Segment',
        status: delRes.status,
        passed,
        details: `Deleted test segment ${newSegmentId}`,
      });
    }
  } catch (e) {
    results.push({ test: '6. Delete / Cleanup Test Segment', status: 'ERROR', passed: false, details: e.message });
  }

  console.table(results);

  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of Save Segment and Filter condition tests passed!');
  } else {
    console.error('[FAILURES DETECTED]');
  }
}

verifySaveSegmentFlow();
