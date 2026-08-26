async function verifySalesCrmReportsFlow() {
  const BASE_URL = 'http://localhost:5000/api';
  const results = [];

  console.log('Testing ARCO Sales CRM Reports & Analytics Flow...');

  // 1. Fetch Default Reports (Last 30 Days)
  try {
    const res = await fetch(`${BASE_URL}/crm/reports?dateRange=Last%2030%20Days`);
    const json = await res.json();
    const data = json.data;

    const hasKpis = data?.kpis && data.kpis.totalLeads > 0 && data.kpis.conversionRate !== undefined;
    const has7StageFunnel = Array.isArray(data?.salesFunnel) && data.salesFunnel.length === 7;
    const hasAgentPerformance = Array.isArray(data?.agentPerformance) && data.agentPerformance.length >= 4;

    const passed = res.status === 200 && hasKpis && has7StageFunnel && hasAgentPerformance;

    results.push({
      test: '1. Load Default Reports (GET /api/crm/reports)',
      status: res.status,
      passed,
      details: `Loaded ${data?.kpis?.totalLeads} total leads (Won: ${data?.kpis?.wonLeads}, Won Rev: ₹${data?.kpis?.wonDealValue?.toLocaleString('en-IN')}). 7 Funnel stages & ${data?.agentPerformance?.length} agents verified.`,
    });
  } catch (e) {
    results.push({ test: '1. Load Default Reports', status: 'ERROR', passed: false, details: e.message });
  }

  // 2. Date Range: Last 7 Days
  try {
    const res = await fetch(`${BASE_URL}/crm/reports?dateRange=Last%207%20Days`);
    const json = await res.json();
    const passed = res.status === 200 && json.data?.kpis?.totalLeads !== undefined;

    results.push({
      test: '2. Date Range Filter ("Last 7 Days")',
      status: res.status,
      passed,
      details: `Filtered dataset returned ${json.data?.kpis?.totalLeads} leads in the last 7 days`,
    });
  } catch (e) {
    results.push({ test: '2. Date Range Filter', status: 'ERROR', passed: false, details: e.message });
  }

  // 3. Filter by Account Owner ("Rahul")
  try {
    const res = await fetch(`${BASE_URL}/crm/reports?owner=Rahul`);
    const json = await res.json();
    const count = json.data?.kpis?.totalLeads;
    const passed = res.status === 200 && count > 0;

    results.push({
      test: '3. Filter by Account Owner ("Rahul")',
      status: res.status,
      passed,
      details: `Found ${count} leads for owner "Rahul" (Won: ${json.data?.kpis?.wonLeads}, Conversion: ${json.data?.kpis?.conversionRate})`,
    });
  } catch (e) {
    results.push({ test: '3. Filter by Account Owner', status: 'ERROR', passed: false, details: e.message });
  }

  // 4. Filter by Pipeline Stage ("Closed Won")
  try {
    const res = await fetch(`${BASE_URL}/crm/reports?stage=Closed%20Won`);
    const json = await res.json();
    const wonCount = json.data?.kpis?.wonLeads;
    const totalCount = json.data?.kpis?.totalLeads;
    const passed = res.status === 200 && totalCount > 0 && wonCount === totalCount;

    results.push({
      test: '4. Filter by Stage ("Closed Won")',
      status: res.status,
      passed,
      details: `Returned ${totalCount} leads strictly in "Closed Won" stage (100% conversion)`,
    });
  } catch (e) {
    results.push({ test: '4. Filter by Stage', status: 'ERROR', passed: false, details: e.message });
  }

  // 5. Filter by Tag ("Repeat Buyers")
  try {
    const res = await fetch(`${BASE_URL}/crm/reports?tag=Repeat%20Buyers`);
    const json = await res.json();
    const count = json.data?.kpis?.totalLeads;
    const passed = res.status === 200 && count > 0;

    results.push({
      test: '5. Filter by Tag ("Repeat Buyers")',
      status: res.status,
      passed,
      details: `Calculated report metrics for ${count} contacts tagged "Repeat Buyers"`,
    });
  } catch (e) {
    results.push({ test: '5. Filter by Tag', status: 'ERROR', passed: false, details: e.message });
  }

  // 6. Filter by WhatsApp Opt-in Consent
  try {
    const res = await fetch(`${BASE_URL}/crm/reports?whatsapp_opted=true`);
    const json = await res.json();
    const count = json.data?.kpis?.totalLeads;
    const passed = res.status === 200 && count > 0;

    results.push({
      test: '6. Filter by WhatsApp Opt-in',
      status: res.status,
      passed,
      details: `Retrieved metrics for ${count} contacts with confirmed WhatsApp opt-in`,
    });
  } catch (e) {
    results.push({ test: '6. Filter by WhatsApp Opt-in', status: 'ERROR', passed: false, details: e.message });
  }

  // 7. Verify Data Consistency between KPIs and Funnel Sum
  try {
    const res = await fetch(`${BASE_URL}/crm/reports?dateRange=Last%2030%20Days`);
    const json = await res.json();
    const totalLeads = json.data?.kpis?.totalLeads;
    const funnelSum = (json.data?.salesFunnel || []).reduce((sum, s) => sum + s.count, 0);
    const agentSum = (json.data?.agentPerformance || []).reduce((sum, a) => sum + a.totalLeads, 0);

    const consistent = totalLeads === funnelSum && totalLeads === agentSum;
    const passed = res.status === 200 && consistent;

    results.push({
      test: '7. Funnel & Agent Data Consistency',
      status: res.status,
      passed,
      details: `Total: ${totalLeads} === Funnel Sum: ${funnelSum} === Agent Sum: ${agentSum} (100% Consistent)`,
    });
  } catch (e) {
    results.push({ test: '7. Data Consistency', status: 'ERROR', passed: false, details: e.message });
  }

  // 8. Verify Detailed Contacts for CSV Download
  try {
    const res = await fetch(`${BASE_URL}/crm/reports?dateRange=Last%2030%20Days`);
    const json = await res.json();
    const contacts = json.data?.detailedContacts;
    const passed = res.status === 200 && Array.isArray(contacts) && contacts.length > 0 && contacts[0].id && contacts[0].name;

    results.push({
      test: '8. Detailed Records for CSV Export',
      status: res.status,
      passed,
      details: `Successfully generated ${contacts?.length} detailed records ready for CSV download`,
    });
  } catch (e) {
    results.push({ test: '8. Detailed Records for CSV Export', status: 'ERROR', passed: false, details: e.message });
  }

  console.table(results);
  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of Sales CRM Reports tests passed!');
  } else {
    console.error('[FAILURES DETECTED]');
  }
}

verifySalesCrmReportsFlow();
