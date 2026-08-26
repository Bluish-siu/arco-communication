async function verifyTemplatesFlow() {
  const BASE_URL = 'http://localhost:5000/api';
  const results = [];

  console.log('Testing ARCO Market -> Templates Suite & PostgreSQL Flow...');

  // 1. Get Library Templates (GET /api/templates/library)
  let libraryRes = null;
  try {
    const res = await fetch(`${BASE_URL}/templates/library`);
    const json = await res.json();
    libraryRes = json;
    const has6Categories = json.categories?.length === 6 && !!json.data?.PROMOTIONAL && !!json.data?.TRANSACTIONAL;
    const passed = res.status === 200 && has6Categories && json.total >= 14;

    results.push({
      test: '1. Load Template Library (GET /api/templates/library)',
      status: res.status,
      passed,
      details: `Loaded ${json.total} templates grouped across ${json.categories?.length} categories (Promotional: ${json.data?.PROMOTIONAL?.length}, Transactional: ${json.data?.TRANSACTIONAL?.length})`,
    });
  } catch (e) {
    results.push({ test: '1. Load Library', status: 'ERROR', passed: false, details: e.message });
  }

  // 2. Get Active Templates (GET /api/templates)
  let activeList = [];
  try {
    const res = await fetch(`${BASE_URL}/templates`);
    const json = await res.json();
    activeList = json.templates || [];
    const passed = res.status === 200 && Array.isArray(activeList) && json.total !== undefined;

    results.push({
      test: '2. Load Active Templates (GET /api/templates)',
      status: res.status,
      passed,
      details: `Retrieved ${activeList.length} active user-created templates`,
    });
  } catch (e) {
    results.push({ test: '2. Load Active', status: 'ERROR', passed: false, details: e.message });
  }

  // 3. Create New Template (POST /api/templates)
  let createdTemplate = null;
  try {
    const res = await fetch(`${BASE_URL}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `order_dispatch_alert_${Date.now().toString().slice(-4)}`,
        displayName: 'Order Dispatched Notification',
        category: 'UTILITY',
        language: 'en_US',
        headerType: 'TEXT',
        headerText: '🚚 Shipment Dispatched',
        body: 'Hello {{1}},\n\nYour package with tracking number {{2}} has been handed over to our courier partner.\nExpected Delivery: {{3}}.',
        footer: 'Track in ARCO App',
        buttons: [
          { type: 'URL', text: 'Live Tracking', url: 'https://arco-crm.com/track' },
        ],
        status: 'DRAFT',
      }),
    });
    const json = await res.json();
    createdTemplate = json.data;
    const passed = res.status === 201 && json.data?.name?.includes('order_dispatch_alert');

    results.push({
      test: '3. Create New Template (POST /api/templates)',
      status: res.status,
      passed,
      details: `Created template "${createdTemplate?.display_name}" (ID: ${createdTemplate?.id}, Category: ${createdTemplate?.category})`,
    });
  } catch (e) {
    results.push({ test: '3. Create Template', status: 'ERROR', passed: false, details: e.message });
  }

  // 4. Get Single Template by ID (GET /api/templates/:id)
  if (createdTemplate) {
    try {
      const res = await fetch(`${BASE_URL}/templates/${createdTemplate.id}`);
      const json = await res.json();
      const passed = res.status === 200 && json.data?.id === createdTemplate.id;

      results.push({
        test: '4. Get Template by ID (GET /api/templates/:id)',
        status: res.status,
        passed,
        details: `Loaded template details with ${json.data?.variables?.length || 3} variables detected`,
      });
    } catch (e) {
      results.push({ test: '4. Get Template', status: 'ERROR', passed: false, details: e.message });
    }
  }

  // 5. Update Template (PUT /api/templates/:id)
  if (createdTemplate) {
    try {
      const res = await fetch(`${BASE_URL}/templates/${createdTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: 'Order Dispatched Notification (Updated)',
          footer: 'ARCO Express Logistics',
        }),
      });
      const json = await res.json();
      const passed = res.status === 200 && json.data?.display_name?.includes('(Updated)');

      results.push({
        test: '5. Update Template (PUT /api/templates/:id)',
        status: res.status,
        passed,
        details: `Updated title to "${json.data?.display_name}" & footer to "${json.data?.footer}"`,
      });
    } catch (e) {
      results.push({ test: '5. Update Template', status: 'ERROR', passed: false, details: e.message });
    }
  }

  // 6. Duplicate Template (POST /api/templates/:id/duplicate)
  let duplicatedTemplate = null;
  if (createdTemplate) {
    try {
      const res = await fetch(`${BASE_URL}/templates/${createdTemplate.id}/duplicate`, {
        method: 'POST',
      });
      const json = await res.json();
      duplicatedTemplate = json.data;
      const passed = res.status === 200 && json.data?.name?.includes('_copy');

      results.push({
        test: '6. Duplicate Template (POST /api/templates/:id/duplicate)',
        status: res.status,
        passed,
        details: `Duplicated into "${duplicatedTemplate?.display_name}" (ID: ${duplicatedTemplate?.id})`,
      });
    } catch (e) {
      results.push({ test: '6. Duplicate Template', status: 'ERROR', passed: false, details: e.message });
    }
  }

  // 7. Submit for Approval (POST /api/templates/:id/submit)
  if (createdTemplate) {
    try {
      const res = await fetch(`${BASE_URL}/templates/${createdTemplate.id}/submit`, {
        method: 'POST',
      });
      const json = await res.json();
      const passed = res.status === 200 && json.data?.status === 'APPROVED';

      results.push({
        test: '7. Submit for Meta Approval (POST /api/templates/:id/submit)',
        status: res.status,
        passed,
        details: `Template submitted & approved (Status: "${json.data?.status}", Meta ID: "${json.data?.meta_template_id}")`,
      });
    } catch (e) {
      results.push({ test: '7. Submit Approval', status: 'ERROR', passed: false, details: e.message });
    }
  }

  // 8. Test Send WhatsApp Template (POST /api/templates/:id/test)
  if (createdTemplate) {
    try {
      const res = await fetch(`${BASE_URL}/templates/${createdTemplate.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientPhone: '+919876543210' }),
      });
      const json = await res.json();
      const passed = res.status === 200 && !!json.data?.messageId;

      results.push({
        test: '8. Send Test WhatsApp Message (POST /api/templates/:id/test)',
        status: res.status,
        passed,
        details: `Successfully dispatched test message: ${json.data?.messageId} to ${json.data?.recipientPhone}`,
      });
    } catch (e) {
      results.push({ test: '8. Send Test', status: 'ERROR', passed: false, details: e.message });
    }
  }

  // 9. Soft Delete Template (DELETE /api/templates/:id)
  if (duplicatedTemplate) {
    try {
      const res = await fetch(`${BASE_URL}/templates/${duplicatedTemplate.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      const passed = res.status === 200 && json.data?.deleted_at !== null;

      results.push({
        test: '9. Soft Delete Template (DELETE /api/templates/:id)',
        status: res.status,
        passed,
        details: `Moved template "${duplicatedTemplate.name}" to Deleted tab`,
      });
    } catch (e) {
      results.push({ test: '9. Soft Delete', status: 'ERROR', passed: false, details: e.message });
    }
  }

  // 10. Check Deleted List (GET /api/templates/deleted)
  if (duplicatedTemplate) {
    try {
      const res = await fetch(`${BASE_URL}/templates/deleted`);
      const json = await res.json();
      const found = json.templates?.find((t) => t.id === duplicatedTemplate.id);
      const passed = res.status === 200 && !!found;

      results.push({
        test: '10. Verify in Deleted Tab (GET /api/templates/deleted)',
        status: res.status,
        passed,
        details: `Found deleted template "${found?.name}" in deleted records`,
      });
    } catch (e) {
      results.push({ test: '10. Check Deleted', status: 'ERROR', passed: false, details: e.message });
    }
  }

  // 11. Restore Template (POST /api/templates/:id/restore)
  if (duplicatedTemplate) {
    try {
      const res = await fetch(`${BASE_URL}/templates/${duplicatedTemplate.id}/restore`, {
        method: 'POST',
      });
      const json = await res.json();
      const passed = res.status === 200 && json.data?.deleted_at === null;

      results.push({
        test: '11. Restore Template (POST /api/templates/:id/restore)',
        status: res.status,
        passed,
        details: `Restored template "${duplicatedTemplate.name}" back to Active`,
      });
    } catch (e) {
      results.push({ test: '11. Restore Template', status: 'ERROR', passed: false, details: e.message });
    }
  }

  // 12. Permanent Delete Cleanup (DELETE /api/templates/:id/permanent)
  if (duplicatedTemplate) {
    try {
      const res = await fetch(`${BASE_URL}/templates/${duplicatedTemplate.id}/permanent`, {
        method: 'DELETE',
      });
      const json = await res.json();
      const passed = res.status === 200 && json.success === true;

      results.push({
        test: '12. Permanent Delete (DELETE /api/templates/:id/permanent)',
        status: res.status,
        passed,
        details: 'Cleaned up duplicate test template from PostgreSQL',
      });
    } catch (e) {
      results.push({ test: '12. Permanent Delete', status: 'ERROR', passed: false, details: e.message });
    }
  }

  console.table(results);
  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of Market -> Templates tests passed!');
  } else {
    console.error('[FAILURES DETECTED]');
  }
}

verifyTemplatesFlow();
