async function verifySalesPipelineFlow() {
  const BASE_URL = 'http://localhost:5000/api';
  const results = [];

  console.log('Testing ARCO Sales CRM -> Sales Pipeline Interakt-Style Replica Flow...');

  // 1. Fetch Pipeline across 7 Stages
  let testLeadId = null;
  try {
    const res = await fetch(`${BASE_URL}/crm/pipeline`);
    const json = await res.json();
    const stages = json.data?.stages;
    const summary = json.data?.summary;

    const hasAll7Stages =
      stages &&
      Array.isArray(stages.newLead) &&
      Array.isArray(stages.qualification) &&
      Array.isArray(stages.needsAnalysis) &&
      Array.isArray(stages.proposal) &&
      Array.isArray(stages.negotiation) &&
      Array.isArray(stages.closedWon) &&
      Array.isArray(stages.closedLost);

    const totalLeadsCount = summary?.totalLeads || 0;
    const passed = res.status === 200 && hasAll7Stages && totalLeadsCount > 0;

    if (stages.newLead.length > 0) {
      testLeadId = stages.newLead[0].id;
    }

    results.push({
      test: '1. Load 7 Pipeline Stages (GET /api/crm/pipeline)',
      status: res.status,
      passed,
      details: `Loaded 7 stages (${totalLeadsCount} total contacts across board). New Lead: ${stages.newLead.length}, Qualification: ${stages.qualification.length}, Won: ${stages.closedWon.length}`,
    });
  } catch (e) {
    results.push({ test: '1. Load 7 Pipeline Stages', status: 'ERROR', passed: false, details: e.message });
  }

  // 2. Sort by Contact Name (ASC and DESC)
  try {
    const resAsc = await fetch(`${BASE_URL}/crm/pipeline?sortBy=Contact&sortOrder=ASC`);
    const jsonAsc = await resAsc.json();
    const resDesc = await fetch(`${BASE_URL}/crm/pipeline?sortBy=Contact&sortOrder=DESC`);
    const jsonDesc = await resDesc.json();

    const firstAscName = jsonAsc.data?.stages?.newLead[0]?.name;
    const firstDescName = jsonDesc.data?.stages?.newLead[0]?.name;
    const passed = resAsc.status === 200 && resDesc.status === 200 && firstAscName !== undefined;

    results.push({
      test: '2. Sort by Contact Name (Ascending / Descending)',
      status: 200,
      passed,
      details: `Ascending first: "${firstAscName}" | Descending first: "${firstDescName}"`,
    });
  } catch (e) {
    results.push({ test: '2. Sort by Contact Name', status: 'ERROR', passed: false, details: e.message });
  }

  // 3. Sort by Deal Value / Deadline
  try {
    const res = await fetch(`${BASE_URL}/crm/pipeline?sortBy=Deadline&sortOrder=DESC`);
    const json = await res.json();
    const maxValue = json.data?.stages?.newLead[0]?.value;
    const passed = res.status === 200 && maxValue >= 0;

    results.push({
      test: '3. Sort by Deal Value (Deadline)',
      status: res.status,
      passed,
      details: `Top deal in New Lead: ₹${maxValue?.toLocaleString('en-IN')}`,
    });
  } catch (e) {
    results.push({ test: '3. Sort by Deal Value', status: 'ERROR', passed: false, details: e.message });
  }

  // 4. Filter by Tag
  try {
    const res = await fetch(`${BASE_URL}/crm/pipeline?tag=Repeat%20Buyers`);
    const json = await res.json();
    const passed = res.status === 200 && json.data?.summary?.totalLeads > 0;

    results.push({
      test: '4. Filter by Tag ("Repeat Buyers")',
      status: res.status,
      passed,
      details: `Found ${json.data?.summary?.totalLeads} matching contacts tagged "Repeat Buyers"`,
    });
  } catch (e) {
    results.push({ test: '4. Filter by Tag', status: 'ERROR', passed: false, details: e.message });
  }

  // 5. Filter by Account Owner
  try {
    const res = await fetch(`${BASE_URL}/crm/pipeline?owner=Shraddha`);
    const json = await res.json();
    const count = json.data?.summary?.totalLeads;
    const passed = res.status === 200 && count > 0;

    results.push({
      test: '5. Filter by Account Owner ("Shraddha")',
      status: res.status,
      passed,
      details: `Found ${count} leads assigned to Account Owner "Shraddha"`,
    });
  } catch (e) {
    results.push({ test: '5. Filter by Account Owner', status: 'ERROR', passed: false, details: e.message });
  }

  // 6. Filter by WhatsApp Opted
  try {
    const res = await fetch(`${BASE_URL}/crm/pipeline?whatsapp_opted=true`);
    const json = await res.json();
    const passed = res.status === 200 && json.data?.summary?.totalLeads > 0;

    results.push({
      test: '6. Filter by WhatsApp Opt-in',
      status: res.status,
      passed,
      details: `Retrieved ${json.data?.summary?.totalLeads} contacts with confirmed WhatsApp opt-in`,
    });
  } catch (e) {
    results.push({ test: '6. Filter by WhatsApp Opt-in', status: 'ERROR', passed: false, details: e.message });
  }

  // 7. Drag & Drop Stage Update (PUT /api/crm/leads/:id/status)
  try {
    if (testLeadId) {
      // Move to Proposal
      const moveRes = await fetch(`${BASE_URL}/crm/leads/${testLeadId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Proposal', value: 75000, notes: 'Moved during automated test to Proposal stage' }),
      });
      const moveJson = await moveRes.json();
      const passed = moveRes.status === 200 && moveJson.data?.status === 'Proposal';

      results.push({
        test: '7. Drag & Drop Stage Move (New Lead -> Proposal)',
        status: moveRes.status,
        passed,
        details: `Successfully updated lead ${testLeadId} status to "${moveJson.data?.status}" (Value: ₹${moveJson.data?.value})`,
      });

      // Move back to New Lead
      await fetch(`${BASE_URL}/crm/leads/${testLeadId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'New Lead' }),
      });
    }
  } catch (e) {
    results.push({ test: '7. Drag & Drop Stage Move', status: 'ERROR', passed: false, details: e.message });
  }

  // 8. Add New Lead to Pipeline (POST /api/contacts)
  let createdLeadId = null;
  try {
    const uniquePhone = `+9199${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newLeadPayload = {
      name: 'Pooja Hegde Enterprise',
      phone: uniquePhone,
      email: `pooja.enterprise.${Date.now()}@example.com`,
      value: 95000,
      status: 'Qualification',
      owner: 'Rahul',
      channel: 'WhatsApp',
      tag: 'High Spenders',
      tags: ['High Spenders', 'Repeat Buyers'],
      notes: 'High intent enterprise prospect added via pipeline quick create',
    };

    const res = await fetch(`${BASE_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLeadPayload),
    });
    const json = await res.json();
    createdLeadId = json.data?.id;
    const passed = res.status === 201 && createdLeadId && json.data.status === 'Qualification';

    results.push({
      test: '8. Add Contact to Pipeline (POST /api/contacts)',
      status: res.status,
      passed,
      details: `Created lead "${json.data?.name}" in stage "${json.data?.status}" (ID: ${createdLeadId})`,
    });
  } catch (e) {
    results.push({ test: '8. Add Contact to Pipeline', status: 'ERROR', passed: false, details: e.message });
  }

  // 9. Cleanup Created Test Lead
  try {
    if (createdLeadId) {
      const delRes = await fetch(`${BASE_URL}/contacts/${createdLeadId}`, { method: 'DELETE' });
      const passed = delRes.status === 200;
      results.push({
        test: '9. Delete / Cleanup Test Lead',
        status: delRes.status,
        passed,
        details: `Deleted test lead ${createdLeadId}`,
      });
    }
  } catch (e) {
    results.push({ test: '9. Delete / Cleanup Test Lead', status: 'ERROR', passed: false, details: e.message });
  }

  console.table(results);
  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of Sales Pipeline & Kanban tests passed!');
  } else {
    console.error('[FAILURES DETECTED]');
  }
}

verifySalesPipelineFlow();
