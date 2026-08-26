async function verifySalesCrm() {
  const BASE_URL = 'http://localhost:5000/api';
  const results = [];

  console.log('Testing Sales CRM & Tasks Backend APIs in PostgreSQL...');

  // 1. GET /api/crm/pipeline
  try {
    const res = await fetch(`${BASE_URL}/crm/pipeline`);
    const json = await res.json();
    const passed = json.success === true && json.data.stages && json.data.summary;
    results.push({
      api: '1. GET /api/crm/pipeline',
      status: res.status,
      passed,
      details: `Total leads: ${json.data?.summary?.totalLeads}, Open: ${json.data?.stages?.open?.length}, Qualified: ${json.data?.stages?.qualified?.length}`,
    });
  } catch (e) {
    results.push({ api: '1. GET /api/crm/pipeline', status: 'ERROR', passed: false, details: e.message });
  }

  // 2. PUT /api/crm/leads/:id/status
  let testLeadId = null;
  try {
    const pipeRes = await fetch(`${BASE_URL}/crm/pipeline`);
    const pipeJson = await pipeRes.json();
    const firstLead = pipeJson.data.stages.open[0] || pipeJson.data.stages.qualified[0];
    if (firstLead) {
      testLeadId = firstLead.id;
      const updateRes = await fetch(`${BASE_URL}/crm/leads/${testLeadId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'In Discussion', value: 35000 }),
      });
      const updateJson = await updateRes.json();
      const passed = updateRes.status === 200 && updateJson.data.status === 'In Discussion';
      results.push({
        api: '2. PUT /api/crm/leads/:id/status',
        status: updateRes.status,
        passed,
        details: `Updated lead ${testLeadId} status to "In Discussion", value: ${updateJson.data?.value}`,
      });
    }
  } catch (e) {
    results.push({ api: '2. PUT /api/crm/leads/:id/status', status: 'ERROR', passed: false, details: e.message });
  }

  // 3. GET /api/crm/reports
  try {
    const res = await fetch(`${BASE_URL}/crm/reports`);
    const json = await res.json();
    const passed =
      json.success === true &&
      json.data.kpis &&
      Array.isArray(json.data.stageDistribution) &&
      Array.isArray(json.data.conversionFunnel) &&
      Array.isArray(json.data.performanceByOwner);
    results.push({
      api: '3. GET /api/crm/reports',
      status: res.status,
      passed,
      details: `Conversion Rate: ${json.data?.kpis?.conversionRate}, Funnel steps: ${json.data?.conversionFunnel?.length}, Owners: ${json.data?.performanceByOwner?.length}`,
    });
  } catch (e) {
    results.push({ api: '3. GET /api/crm/reports', status: 'ERROR', passed: false, details: e.message });
  }

  // 4. GET /api/tasks
  try {
    const res = await fetch(`${BASE_URL}/tasks`);
    const json = await res.json();
    const passed = json.success === true && Array.isArray(json.data) && json.summary;
    results.push({
      api: '4. GET /api/tasks',
      status: res.status,
      passed,
      details: `Total tasks: ${json.summary?.total}, To Do: ${json.summary?.todoCount}, In Progress: ${json.summary?.inProgressCount}`,
    });
  } catch (e) {
    results.push({ api: '4. GET /api/tasks', status: 'ERROR', passed: false, details: e.message });
  }

  // 5. POST /api/tasks (Create Task)
  let createdTaskId = null;
  try {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Follow-up on WhatsApp Enterprise SLA',
        description: 'Review SLA terms and message volume rate limits with security compliance officer.',
        assignedTo: 'Shraddha',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'High',
        status: 'To Do',
      }),
    });
    const json = await res.json();
    createdTaskId = json.data?.id;
    const passed = res.status === 201 && createdTaskId && json.data.title === 'Follow-up on WhatsApp Enterprise SLA';
    results.push({
      api: '5. POST /api/tasks (Create)',
      status: res.status,
      passed,
      details: `Created task id: ${createdTaskId}`,
    });
  } catch (e) {
    results.push({ api: '5. POST /api/tasks (Create)', status: 'ERROR', passed: false, details: e.message });
  }

  // 6. PUT /api/tasks/:id/status (Toggle status)
  try {
    if (createdTaskId) {
      const res = await fetch(`${BASE_URL}/tasks/${createdTaskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' }),
      });
      const json = await res.json();
      const passed = res.status === 200 && json.data.status === 'Completed';
      results.push({
        api: '6. PUT /api/tasks/:id/status',
        status: res.status,
        passed,
        details: `Updated task status to Completed`,
      });
    }
  } catch (e) {
    results.push({ api: '6. PUT /api/tasks/:id/status', status: 'ERROR', passed: false, details: e.message });
  }

  // 7. DELETE /api/tasks/:id
  try {
    if (createdTaskId) {
      const res = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      const passed = res.status === 200 && json.success === true;
      results.push({
        api: '7. DELETE /api/tasks/:id',
        status: res.status,
        passed,
        details: `Deleted task id ${createdTaskId}`,
      });
    }
  } catch (e) {
    results.push({ api: '7. DELETE /api/tasks/:id', status: 'ERROR', passed: false, details: e.message });
  }

  console.table(results);

  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of Sales CRM and Tasks APIs passed successfully in PostgreSQL!');
    process.exit(0);
  } else {
    console.error('[FAILURES DETECTED] Some tests failed.');
    process.exit(1);
  }
}

verifySalesCrm();
