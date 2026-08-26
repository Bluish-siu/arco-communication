import jwt from 'jsonwebtoken';
import { config } from './index.js';

async function testCrmReportsApi() {
  console.log('================================================================');
  console.log('🧪 TESTING CRM REPORTS DYNAMIC SQL & DATE FILTERING');
  console.log('================================================================\n');

  const BASE_URL = 'http://localhost:5000/api';
  const token = jwt.sign(
    { id: 'usr_1', email: 'owner@arco.com', role: 'admin', name: 'Shraddha' },
    config.jwtSecret,
    { expiresIn: '1h' }
  );

  const testCases = [
    { name: 'Default 30 Days', query: '' },
    { name: 'Today Filter', query: '?dateRange=today' },
    { name: 'Yesterday Filter', query: '?dateRange=yesterday' },
    { name: 'Last 7 Days Filter', query: '?dateRange=7days' },
    { name: 'This Month Filter', query: '?dateRange=thismonth' },
    { name: 'Last Month Filter', query: '?dateRange=lastmonth' },
    { name: 'Arbitrary Input (Fallback Test)', query: '?dateRange=invalid_input_test_123' },
    { name: 'SQL Injection Probe in dateRange', query: '?dateRange=today%27%20OR%201=1--' },
    { name: 'Custom Start & End Date', query: '?startDate=2026-01-01&endDate=2026-08-26' },
  ];

  const results = [];

  for (const tc of testCases) {
    const url = `${BASE_URL}/crm/reports${tc.query}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    const kpis = data.data?.kpis;
    const passed = res.status === 200 && data.success === true && typeof kpis?.totalLeads === 'number';

    results.push({
      test: tc.name,
      status: passed ? 'PASS' : 'FAIL',
      httpStatus: res.status,
      totalLeads: kpis?.totalLeads,
      conversionRate: kpis?.conversionRate,
      leadsGrowthPct: kpis?.leadsGrowthPct,
    });
  }

  console.table(results);
  const allPassed = results.every((r) => r.status === 'PASS');
  console.log(`\nCRM REPORTS VERIFICATION RESULT: ${allPassed ? '🎉 100% PASS' : '❌ FAIL'}\n`);
  process.exit(allPassed ? 0 : 1);
}

testCrmReportsApi();
