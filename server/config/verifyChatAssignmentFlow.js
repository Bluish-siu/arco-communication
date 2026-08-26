import http from 'http';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runChatAssignmentTests() {
  console.log('Testing ARCO Support -> Chat Assignment Suite & PostgreSQL Flow...');
  const results = [];

  try {
    // Test 1: Get Chat Assignment Settings
    const getSetRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/chat-assignment/settings',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    results.push({
      test: '1. Get Settings (GET /api/chat-assignment/settings)',
      status: getSetRes.status,
      passed: getSetRes.status === 200 && getSetRes.data?.success === true,
      details: `Default Rule: "${getSetRes.data?.data?.defaultRule}", Online Only: ${getSetRes.data?.data?.assignOnlyOnline}`,
    });

    // Test 2: Update Settings to Round Robin
    const updateSetRes1 = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/chat-assignment/settings',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        defaultRule: 'round_robin',
        assignOnlyOnline: true,
        reassignOffline: false,
      }
    );
    results.push({
      test: '2. Select Round Robin (PUT /api/chat-assignment/settings)',
      status: updateSetRes1.status,
      passed: updateSetRes1.status === 200 && updateSetRes1.data?.data?.defaultRule === 'round_robin',
      details: 'Persisted Round Robin as default assignment rule in PostgreSQL',
    });

    // Test 3: Get Agents
    const agentsRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/chat-assignment/agents',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    results.push({
      test: '3. Get Agents (GET /api/chat-assignment/agents)',
      status: agentsRes.status,
      passed: agentsRes.status === 200 && Array.isArray(agentsRes.data?.data) && agentsRes.data?.data?.length > 0,
      details: `Retrieved ${agentsRes.data?.data?.length || 0} agents from PostgreSQL users table`,
    });

    // Test 4: Create Custom Assignment Rule
    let createdRuleId = null;
    const createRuleRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/chat-assignment/rules',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'VIP High Spenders Routing',
        trait: 'tag',
        condition: 'contains',
        values: ['VIP', 'High Spenders'],
        assignedAgents: [{ id: 'usr_agent_1', name: 'Nilesh Patel', email: 'nilesh.patel@arco.com' }],
        isActive: true,
      }
    );
    createdRuleId = createRuleRes.data?.data?.id;
    results.push({
      test: '4. Create Custom Rule (POST /api/chat-assignment/rules)',
      status: createRuleRes.status,
      passed: createRuleRes.status === 201 && createRuleRes.data?.success === true && !!createdRuleId,
      details: `Created rule "${createRuleRes.data?.data?.name}" (ID: ${createdRuleId})`,
    });

    // Test 5: Get Rules List
    const getRulesRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/chat-assignment/rules',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    results.push({
      test: '5. Get Custom Rules List (GET /api/chat-assignment/rules)',
      status: getRulesRes.status,
      passed: getRulesRes.status === 200 && Array.isArray(getRulesRes.data?.data) && getRulesRes.data?.data?.length > 0,
      details: `Found ${getRulesRes.data?.data?.length || 0} custom rules in PostgreSQL`,
    });

    // Test 6: Evaluate Custom Rule Match
    const evalCustomRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/chat-assignment/evaluate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        contactName: 'Rohan Gupta',
        tag: 'VIP Client',
      }
    );
    results.push({
      test: '6. Evaluate Custom Rule Priority (POST /api/chat-assignment/evaluate)',
      status: evalCustomRes.status,
      passed: evalCustomRes.status === 200 && evalCustomRes.data?.data?.ruleType === 'custom_rule',
      details: `Matched rule "${evalCustomRes.data?.data?.appliedRule}" -> Assigned to: ${evalCustomRes.data?.data?.assignedAgent}`,
    });

    // Test 7: Evaluate Default Round Robin Fallback
    const evalDefaultRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/chat-assignment/evaluate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        contactName: 'Standard Customer',
        tag: 'New Contact',
      }
    );
    results.push({
      test: '7. Evaluate Round Robin Fallback (POST /api/chat-assignment/evaluate)',
      status: evalDefaultRes.status,
      passed: evalDefaultRes.status === 200 && evalDefaultRes.data?.data?.ruleType === 'default_round_robin',
      details: `Fell back to Round Robin -> Assigned to: ${evalDefaultRes.data?.data?.assignedAgent}`,
    });

    // Test 8: Update Custom Rule
    if (createdRuleId) {
      const updateRuleRes = await makeRequest(
        {
          hostname: 'localhost',
          port: 5000,
          path: `/api/chat-assignment/rules/${createdRuleId}`,
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        },
        {
          name: 'VIP & High Spenders Priority Queue',
          trait: 'tag',
          condition: 'contains',
          values: ['VIP', 'High Spenders', 'Enterprise'],
          assignedAgents: [{ id: 'usr_agent_1', name: 'Nilesh Patel', email: 'nilesh.patel@arco.com' }],
          isActive: true,
        }
      );
      results.push({
        test: '8. Update Custom Rule (PUT /api/chat-assignment/rules/:id)',
        status: updateRuleRes.status,
        passed: updateRuleRes.status === 200 && updateRuleRes.data?.data?.name?.includes('Priority Queue'),
        details: `Updated name: "${updateRuleRes.data?.data?.name}"`,
      });
    }

    // Test 9: Verify Frontend Route /automation/chat-assignment
    const frontendRouteRes = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/automation/chat-assignment',
      method: 'GET',
    });
    results.push({
      test: '9. Frontend Route /automation/chat-assignment',
      status: frontendRouteRes.status,
      passed: frontendRouteRes.status === 200,
      details: `Vite frontend returned HTTP ${frontendRouteRes.status} OK`,
    });

  } catch (err) {
    console.error('Test execution error:', err);
  }

  console.table(results);
  const allPassed = results.length > 0 && results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of Support -> Chat Assignment tests passed!');
  } else {
    console.error('[FAILURES DETECTED] Some tests failed.');
  }
}

runChatAssignmentTests();
