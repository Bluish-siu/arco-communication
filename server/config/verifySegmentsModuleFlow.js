async function verifySegmentsModuleFlow() {
  const BASE_URL = 'http://localhost:5000/api';
  const results = [];

  console.log('Testing ARCO Market -> Segments Suite & PostgreSQL Flow...');

  // Helper login to get token
  let token = null;
  try {
    const authRes = await fetch(`${BASE_URL}/auth/demo-login`, { method: 'POST' });
    const authJson = await authRes.json();
    token = authJson.token;
  } catch (e) {
    console.warn('Demo login failed, continuing with direct requests');
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // 1. Get Metadata (GET /api/segments/metadata)
  let metadata = null;
  try {
    const res = await fetch(`${BASE_URL}/segments/metadata`, { headers: authHeaders });
    const json = await res.json();
    metadata = json.data;
    const passed = res.status === 200 && Array.isArray(metadata?.tags) && metadata?.tags.length > 0 && Array.isArray(metadata?.fields);

    results.push({
      test: '1. Load Segments Metadata (GET /api/segments/metadata)',
      status: res.status,
      passed,
      details: `Retrieved ${metadata?.tags?.length} tags, ${metadata?.fields?.length} contact fields, and ${metadata?.events?.length} events`,
    });
  } catch (e) {
    results.push({ test: '1. Load Metadata', status: 'ERROR', passed: false, details: e.message });
  }

  // 2. Get All Segments (GET /api/segments)
  let segmentsList = [];
  try {
    const res = await fetch(`${BASE_URL}/segments`, { headers: authHeaders });
    const json = await res.json();
    segmentsList = json.data || [];
    const passed = res.status === 200 && Array.isArray(segmentsList);

    results.push({
      test: '2. List Saved Segments (GET /api/segments)',
      status: res.status,
      passed,
      details: `Loaded ${segmentsList.length} saved audience segments with live contact reach estimates`,
    });
  } catch (e) {
    results.push({ test: '2. List Segments', status: 'ERROR', passed: false, details: e.message });
  }

  // 3. Create Tag-based Segment with WhatsApp Opt-in (POST /api/segments)
  let createdSegment = null;
  try {
    const res = await fetch(`${BASE_URL}/segments`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: `VIP High-Intent Buyers ${Date.now().toString().slice(-4)}`,
        description: 'Audience segment for contacts tagged VIP with verified WhatsApp opt-in',
        filterType: 'tags',
        conditions: [
          { category: 'tag', field: 'tag', operator: 'is', value: 'VIP' },
        ],
        whatsappOpted: true,
      }),
    });
    const json = await res.json();
    createdSegment = json.data;
    const passed = res.status === 201 && !!createdSegment?.id && createdSegment?.name?.includes('VIP High-Intent');

    results.push({
      test: '3. Create Tag-based Segment (POST /api/segments)',
      status: res.status,
      passed,
      details: `Created segment "${createdSegment?.name}" (ID: ${createdSegment?.id}, Estimated Reach: ${createdSegment?.estimatedCount} contacts)`,
    });
  } catch (e) {
    results.push({ test: '3. Create Segment', status: 'ERROR', passed: false, details: e.message });
  }

  // 4. Create Field-based Segment (POST /api/segments)
  let createdFieldSegment = null;
  try {
    const res = await fetch(`${BASE_URL}/segments`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: `Mumbai High Value Deals ${Date.now().toString().slice(-4)}`,
        description: 'Audience segment for Mumbai contacts with deal value > 10000',
        filterType: 'fields',
        conditions: [
          { category: 'field', field: 'city', operator: 'is', value: 'Mumbai' },
          { category: 'field', field: 'value', operator: 'greater_than', value: '10000' },
        ],
        whatsappOpted: true,
      }),
    });
    const json = await res.json();
    createdFieldSegment = json.data;
    const passed = res.status === 201 && !!createdFieldSegment?.id;

    results.push({
      test: '4. Create Field-based Segment (POST /api/segments)',
      status: res.status,
      passed,
      details: `Created field segment "${createdFieldSegment?.name}" (ID: ${createdFieldSegment?.id})`,
    });
  } catch (e) {
    results.push({ test: '4. Create Field Segment', status: 'ERROR', passed: false, details: e.message });
  }

  // 5. Get Segment by ID (GET /api/segments/:id)
  if (createdSegment) {
    try {
      const res = await fetch(`${BASE_URL}/segments/${createdSegment.id}`, { headers: authHeaders });
      const json = await res.json();
      const passed = res.status === 200 && json.data?.id === createdSegment.id;

      results.push({
        test: '5. Get Single Segment (GET /api/segments/:id)',
        status: res.status,
        passed,
        details: `Loaded segment details with ${json.data?.conditions?.length || 1} filter conditions`,
      });
    } catch (e) {
      results.push({ test: '5. Get Segment', status: 'ERROR', passed: false, details: e.message });
    }
  }

  // 6. Update Segment (PUT /api/segments/:id)
  if (createdSegment) {
    try {
      const res = await fetch(`${BASE_URL}/segments/${createdSegment.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          name: `${createdSegment.name} (Updated)`,
          description: 'Updated description with extended VIP tag criteria',
        }),
      });
      const json = await res.json();
      const passed = res.status === 200 && json.data?.name?.includes('(Updated)');

      results.push({
        test: '6. Update Segment (PUT /api/segments/:id)',
        status: res.status,
        passed,
        details: `Updated segment name to "${json.data?.name}"`,
      });
    } catch (e) {
      results.push({ test: '6. Update Segment', status: 'ERROR', passed: false, details: e.message });
    }
  }

  // 7. Delete Test Segments (DELETE /api/segments/:id)
  if (createdSegment) {
    try {
      const res = await fetch(`${BASE_URL}/segments/${createdSegment.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const json = await res.json();
      const passed = res.status === 200 && json.success === true;

      results.push({
        test: '7. Delete Segment (DELETE /api/segments/:id)',
        status: res.status,
        passed,
        details: `Deleted test segment ${createdSegment.id}`,
      });
    } catch (e) {
      results.push({ test: '7. Delete Segment', status: 'ERROR', passed: false, details: e.message });
    }
  }

  if (createdFieldSegment) {
    try {
      await fetch(`${BASE_URL}/segments/${createdFieldSegment.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
    } catch (e) {}
  }

  console.table(results);
  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of Market -> Segments tests passed!');
  } else {
    console.error('[FAILURES DETECTED]');
  }
}

verifySegmentsModuleFlow();
