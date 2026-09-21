/**
 * Automated Test Suite for ARCO Communication Unified Workflow Execution Engine
 * Validates all 26 core requirements:
 *  1. Workflow saves successfully (persistence & column whitelisting)
 *  2. Workflow reloads with same nodes/edges
 *  3. Trigger node executes
 *  4. A -> B -> C graph executes in correct order
 *  5. Array order does not affect traversal
 *  6. Condition TRUE branch executes
 *  7. Condition FALSE branch executes
 *  8. Only selected condition branch executes
 *  9. Variable interpolation works
 * 10. Missing variables are handled safely
 * 11. Plain WhatsApp action calls the existing service correctly
 * 12. Unapproved template does not report fake success
 * 13. Update tag actually changes contact data
 * 14. Assign agent actually changes conversation assignment
 * 15. Invalid node fails safely
 * 16. Infinite loop protection works
 * 17. Execution logs record every executed node
 * 18. Failed node marks execution failed
 * 19. User A cannot execute User B workflow
 * 20. Default template cannot be modified by tenant
 * 21. Inbound WhatsApp message can trigger a real workflow
 * 22. Non-matching WhatsApp message does not trigger workflow
 * 23. Shopify event can trigger the SAME unified engine
 * 24. Shopify condition branch works through the unified engine
 * 25. Shopify variables interpolate through the unified engine
 * 26. Historical Shopify sync does NOT trigger workflows
 */

const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

function mockResponse() {
  const res = {
    statusCode: 200,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    },
  };
  return res;
}

async function main() {
  console.log('\n=============================================================');
  console.log(' RUNNING UNIFIED ARCO WORKFLOW EXECUTION ENGINE TEST SUITE');
  console.log('=============================================================\n');

  const {
    workflowExecutionEngine,
    resolveVariables,
    evaluateConditionRule,
  } = await import('../services/workflowExecutionEngine.js');

  const { automationController } = await import('../controllers/automationController.js');
  const { metaWhatsAppService } = await import('../services/metaWhatsAppService.js');
  const {
    dispatchShopifyEventToWorkflows,
    executeWorkflowForShopifyEvent,
  } = await import('../services/shopifyEventService.js');
  const { handleOrderSync } = await import('../controllers/shopifyWebhookController.js');
  const { initShopifyEventsTable } = await import('../config/initShopifyEventsTable.js');
  const { pool, query } = await import('../config/db.js');

  await initShopifyEventsTable();

  const testUserId = `usr_test_wf_${Date.now()}`;
  const testUserIdB = `usr_test_wf_b_${Date.now()}`;
  const createdWfIds = [];
  const createdContactIds = [];
  const createdConvIds = [];

  try {
    // -------------------------------------------------------------
    // Test 1: Workflow saves successfully with column whitelisting & normalization
    // -------------------------------------------------------------
    let savedWorkflowId = `wf_test_save_${Date.now()}`;
    await runAsyncTest('1. Workflow saves successfully with column whitelisting and is_active normalization', async () => {
      const req = {
        user: { id: testUserId },
        body: {
          id: savedWorkflowId,
          name: 'Customer Onboarding Workflow',
          description: 'Automated welcome flow for new leads',
          trigger: 'keyword',
          trigger_config: { keyword: 'onboard' },
          action: 'Send Welcome Flow',
          nodes: [
            { id: 'node_trigger', type: 'trigger', data: { label: 'Keyword: onboard' } },
            { id: 'node_msg', type: 'plain_message', data: { text: 'Welcome to ARCO {{name}}!' } },
          ],
          edges: [
            { id: 'e1', source: 'node_trigger', target: 'node_msg' },
          ],
          is_active: true, // Frontend sends is_active: true
          unauthorized_column: 'MALICIOUS_SQL_INJECTION', // Must be safely stripped
        },
      };
      const res = mockResponse();

      await automationController.createWorkflow(req, res, (err) => {
        if (err) throw err;
      });

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.jsonData?.success, true);
      assert.strictEqual(res.jsonData?.data?.status, 'active');
      assert.strictEqual(res.jsonData?.data?.is_published, true);
      createdWfIds.push(savedWorkflowId);

      // Verify in DB directly
      const dbCheck = await query('SELECT id, status, is_published FROM workflows WHERE id = $1', [savedWorkflowId]);
      assert.strictEqual(dbCheck.rows.length, 1);
      assert.strictEqual(dbCheck.rows[0].status, 'active');
      assert.strictEqual(dbCheck.rows[0].is_published, true);
    });

    // -------------------------------------------------------------
    // Test 2: Workflow reloads with same nodes/edges
    // -------------------------------------------------------------
    await runAsyncTest('2. Workflow reloads with same nodes/edges from persistence', async () => {
      const req = {
        user: { id: testUserId },
        params: { id: savedWorkflowId },
      };
      const res = mockResponse();

      await automationController.getWorkflowById(req, res, (err) => {
        if (err) throw err;
      });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.jsonData?.success, true);
      const wfData = res.jsonData?.data;
      assert.strictEqual(wfData.id, savedWorkflowId);
      assert.strictEqual(Array.isArray(wfData.nodes), true);
      assert.strictEqual(wfData.nodes.length, 2);
      assert.strictEqual(wfData.nodes[0].id, 'node_trigger');
      assert.strictEqual(wfData.nodes[1].id, 'node_msg');
      assert.strictEqual(wfData.edges.length, 1);
      assert.strictEqual(wfData.edges[0].source, 'node_trigger');
      assert.strictEqual(wfData.edges[0].target, 'node_msg');
    });

    // -------------------------------------------------------------
    // Test 3: Trigger node executes
    // -------------------------------------------------------------
    await runAsyncTest('3. Trigger node executes and records step completed', async () => {
      const wf = {
        id: `wf_trig_${Date.now()}`,
        name: 'Trigger Test',
        user_id: testUserId,
        nodes: [{ id: 'trig_1', type: 'trigger', data: { label: 'Start Trigger' } }],
        edges: [],
      };

      const result = await workflowExecutionEngine.executeWorkflow(wf, {
        userId: testUserId,
        isSimulation: true,
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.executionSteps.length, 1);
      assert.strictEqual(result.executionSteps[0].nodeId, 'trig_1');
      assert.strictEqual(result.executionSteps[0].nodeType, 'trigger');
      assert.strictEqual(result.executionSteps[0].status, 'completed');
    });

    // -------------------------------------------------------------
    // Test 4: A -> B -> C graph executes in correct order
    // -------------------------------------------------------------
    await runAsyncTest('4. A -> B -> C graph executes in correct sequential order', async () => {
      const wf = {
        id: `wf_abc_${Date.now()}`,
        name: 'Linear Pipeline',
        user_id: testUserId,
        nodes: [
          { id: 'node_a', type: 'trigger', data: { label: 'Start' } },
          { id: 'node_b', type: 'plain_message', data: { text: 'Step B Message' } },
          { id: 'node_c', type: 'plain_message', data: { text: 'Step C Message' } },
        ],
        edges: [
          { id: 'e1', source: 'node_a', target: 'node_b' },
          { id: 'e2', source: 'node_b', target: 'node_c' },
        ],
      };

      const result = await workflowExecutionEngine.executeWorkflow(wf, {
        userId: testUserId,
        isSimulation: true,
      });

      assert.strictEqual(result.success, true);
      const visitedOrder = result.executionSteps.map((s) => s.nodeId);
      assert.deepStrictEqual(visitedOrder, ['node_a', 'node_b', 'node_c']);
    });

    // -------------------------------------------------------------
    // Test 5: Array order does not affect traversal
    // -------------------------------------------------------------
    await runAsyncTest('5. Array order does not affect traversal (shuffled node array)', async () => {
      const wf = {
        id: `wf_shuffled_${Date.now()}`,
        name: 'Shuffled Array',
        user_id: testUserId,
        // Nodes array deliberately reversed / shuffled
        nodes: [
          { id: 'node_c', type: 'plain_message', data: { text: 'Step C' } },
          { id: 'node_a', type: 'trigger', data: { label: 'Start' } },
          { id: 'node_b', type: 'plain_message', data: { text: 'Step B' } },
        ],
        edges: [
          { id: 'e1', source: 'node_a', target: 'node_b' },
          { id: 'e2', source: 'node_b', target: 'node_c' },
        ],
      };

      const result = await workflowExecutionEngine.executeWorkflow(wf, {
        userId: testUserId,
        isSimulation: true,
      });

      assert.strictEqual(result.success, true);
      const visitedOrder = result.executionSteps.map((s) => s.nodeId);
      assert.deepStrictEqual(visitedOrder, ['node_a', 'node_b', 'node_c'], 'Must follow edges, not array indices');
    });

    // -------------------------------------------------------------
    // Test 6: Condition TRUE branch executes
    // -------------------------------------------------------------
    const conditionWorkflow = {
      id: `wf_cond_${Date.now()}`,
      name: 'Deal Value Branching',
      user_id: testUserId,
      nodes: [
        { id: 'trig', type: 'trigger' },
        {
          id: 'cond_val',
          type: 'condition',
          data: {
            conditions: [{ trait: 'deal_value', operator: 'Greater Than', value: '500' }],
          },
        },
        { id: 'node_true', type: 'plain_message', data: { text: 'High Value Deal' } },
        { id: 'node_false', type: 'plain_message', data: { text: 'Standard Value Deal' } },
      ],
      edges: [
        { id: 'e0', source: 'trig', target: 'cond_val' },
        { id: 'e_t', source: 'cond_val', sourcePort: 'true', target: 'node_true' },
        { id: 'e_f', source: 'cond_val', sourcePort: 'false', target: 'node_false' },
      ],
    };

    await runAsyncTest('6. Condition TRUE branch executes when condition evaluates true', async () => {
      const result = await workflowExecutionEngine.executeWorkflow(conditionWorkflow, {
        userId: testUserId,
        variables: { deal_value: 750 },
        isSimulation: true,
      });

      assert.strictEqual(result.success, true);
      const visitedIds = result.executionSteps.map((s) => s.nodeId);
      assert.strictEqual(visitedIds.includes('node_true'), true);
      assert.strictEqual(visitedIds.includes('node_false'), false);
    });

    // -------------------------------------------------------------
    // Test 7: Condition FALSE branch executes
    // -------------------------------------------------------------
    await runAsyncTest('7. Condition FALSE branch executes when condition evaluates false', async () => {
      const result = await workflowExecutionEngine.executeWorkflow(conditionWorkflow, {
        userId: testUserId,
        variables: { deal_value: 200 },
        isSimulation: true,
      });

      assert.strictEqual(result.success, true);
      const visitedIds = result.executionSteps.map((s) => s.nodeId);
      assert.strictEqual(visitedIds.includes('node_false'), true);
      assert.strictEqual(visitedIds.includes('node_true'), false);
    });

    // -------------------------------------------------------------
    // Test 8: Only selected condition branch executes (mutual exclusivity)
    // -------------------------------------------------------------
    await runAsyncTest('8. Only selected condition branch executes, never both branches', async () => {
      const resHigh = await workflowExecutionEngine.executeWorkflow(conditionWorkflow, {
        userId: testUserId,
        variables: { deal_value: 999 },
        isSimulation: true,
      });
      const highSteps = resHigh.executionSteps.map((s) => s.nodeId);
      assert.strictEqual(highSteps.includes('node_true'), true);
      assert.strictEqual(highSteps.includes('node_false'), false);

      const resLow = await workflowExecutionEngine.executeWorkflow(conditionWorkflow, {
        userId: testUserId,
        variables: { deal_value: 50 },
        isSimulation: true,
      });
      const lowSteps = resLow.executionSteps.map((s) => s.nodeId);
      assert.strictEqual(lowSteps.includes('node_false'), true);
      assert.strictEqual(lowSteps.includes('node_true'), false);
    });

    // -------------------------------------------------------------
    // Test 9: Variable interpolation works
    // -------------------------------------------------------------
    runTest('9. Variable interpolation dynamically resolves tokens across types', () => {
      const template = 'Hello {{name}}, order #{{order_number}} for {{currency}} {{total_amount}}!';
      const vars = {
        name: 'John Doe',
        order_number: '1099',
        currency: 'USD',
        total_amount: 149.5,
      };
      const resolved = resolveVariables(template, vars);
      assert.strictEqual(resolved, 'Hello John Doe, order #1099 for USD 149.50!');
    });

    // -------------------------------------------------------------
    // Test 10: Missing variables are handled safely
    // -------------------------------------------------------------
    runTest('10. Missing variables are handled safely without crash or undefined literals', () => {
      const template = 'Customer {{name}} requested {{item}} with note: {{note}}.';
      const vars = { name: 'Alice' }; // item and note are missing
      const resolved = resolveVariables(template, vars);
      assert.strictEqual(resolved, 'Customer Alice requested  with note: .');
      assert.strictEqual(resolved.includes('undefined'), false);
      assert.strictEqual(resolved.includes('{{'), false);
    });

    // -------------------------------------------------------------
    // Test 11: Plain WhatsApp action calls the existing service correctly
    // -------------------------------------------------------------
    await runAsyncTest('11. Plain WhatsApp action calls metaWhatsAppService.sendTextMessage correctly', async () => {
      const originalSend = metaWhatsAppService.sendTextMessage;
      let capturedPayload = null;

      metaWhatsAppService.sendTextMessage = async (payload) => {
        capturedPayload = payload;
        return { success: true, wamid: 'wamid_test_12345' };
      };

      try {
        const wf = {
          id: `wf_plain_${Date.now()}`,
          name: 'Send Plain WhatsApp',
          user_id: testUserId,
          nodes: [
            { id: 'trig', type: 'trigger' },
            { id: 'msg', type: 'plain_message', data: { text: 'Hi {{name}}, your balance is {{currency}} {{balance}}' } },
          ],
          edges: [{ source: 'trig', target: 'msg' }],
        };

        const execRes = await workflowExecutionEngine.executeWorkflow(wf, {
          userId: testUserId,
          contact: { phone: '+15550001111', name: 'Robert' },
          variables: { currency: 'EUR', balance: 45 },
          isSimulation: false,
        });

        assert.strictEqual(execRes.success, true);
        assert.notStrictEqual(capturedPayload, null);
        assert.strictEqual(capturedPayload.to, '+15550001111');
        assert.strictEqual(capturedPayload.text, 'Hi Robert, your balance is EUR 45');
      } finally {
        metaWhatsAppService.sendTextMessage = originalSend;
      }
    });

    // -------------------------------------------------------------
    // Test 12: Unapproved template does not report fake success
    // -------------------------------------------------------------
    await runAsyncTest('12. Unapproved template returns TEMPLATE_NOT_AVAILABLE and does NOT fake success', async () => {
      const originalSendTemplate = metaWhatsAppService.sendTemplateMessage;

      // Simulate Meta API returning template unavailable / unapproved
      metaWhatsAppService.sendTemplateMessage = async () => {
        return { success: false, error: 'Template not approved or does not exist in WABA' };
      };

      try {
        const wf = {
          id: `wf_tmpl_${Date.now()}`,
          name: 'Template WF',
          user_id: testUserId,
          nodes: [
            { id: 'trig', type: 'trigger' },
            { id: 'tmpl_node', type: 'template_message', data: { templateName: 'unapproved_promotional_sale' } },
          ],
          edges: [{ source: 'trig', target: 'tmpl_node' }],
        };

        const execRes = await workflowExecutionEngine.executeWorkflow(wf, {
          userId: testUserId,
          contact: { phone: '+15550002222', name: 'Sarah' },
          isSimulation: false,
        });

        assert.strictEqual(execRes.success, false, 'Execution must not report success for unapproved template');
        const tmplStep = execRes.executionSteps.find((s) => s.nodeId === 'tmpl_node');
        assert.strictEqual(tmplStep?.status, 'failed');
        assert.strictEqual(tmplStep?.error, 'TEMPLATE_NOT_AVAILABLE');
      } finally {
        metaWhatsAppService.sendTemplateMessage = originalSendTemplate;
      }
    });

    // -------------------------------------------------------------
    // Test 13: Update tag actually changes contact data in PostgreSQL
    // -------------------------------------------------------------
    await runAsyncTest('13. Update tag actually changes contact data in PostgreSQL', async () => {
      const testContactId = `cnt_tag_${Date.now()}`;
      const testPhone = `+1555${Math.floor(1000000 + Math.random() * 9000000)}`;
      createdContactIds.push(testContactId);

      await query(
        `INSERT INTO contacts (id, name, phone, email, tag, status, created_at, updated_at)
         VALUES ($1, 'Tag Test Contact', $2, 'tagtest@arco.internal', 'InitialLead', 'Open', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [testContactId, testPhone]
      );

      const wf = {
        id: `wf_tag_${Date.now()}`,
        name: 'Tag Mutation WF',
        user_id: testUserId,
        nodes: [
          { id: 'trig', type: 'trigger' },
          { id: 'tag_node', type: 'update_tag', data: { tag: 'VIP_Customer' } },
        ],
        edges: [{ source: 'trig', target: 'tag_node' }],
      };

      const result = await workflowExecutionEngine.executeWorkflow(wf, {
        userId: testUserId,
        contact: { id: testContactId, phone: testPhone },
        isSimulation: false,
      });

      assert.strictEqual(result.success, true);
      const dbCheck = await query('SELECT tag, tags FROM contacts WHERE id = $1', [testContactId]);
      assert.strictEqual(dbCheck.rows[0]?.tag, 'VIP_Customer', 'Contact tag in DB must be updated');
    });

    // -------------------------------------------------------------
    // Test 14: Assign agent actually changes conversation assignment
    // -------------------------------------------------------------
    await runAsyncTest('14. Assign agent actually changes conversation assignment in PostgreSQL', async () => {
      const testConvId = `cnv_asgn_${Date.now()}`;
      const testPhone = `+1555${Math.floor(1000000 + Math.random() * 9000000)}`;
      createdConvIds.push(testConvId);

      await query(
        `INSERT INTO conversations (id, name, channel, status, phone, assignee, reply_status, response_window, created_at, updated_at)
         VALUES ($1, 'Assign Test Conv', 'whatsapp', 'Online', $2, 'Unassigned', 'unreplied', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [testConvId, testPhone]
      );

      const wf = {
        id: `wf_asgn_${Date.now()}`,
        name: 'Assign Agent WF',
        user_id: testUserId,
        nodes: [
          { id: 'trig', type: 'trigger' },
          { id: 'asgn_node', type: 'assign_agent', data: { agent: 'Senior Specialist Priya' } },
        ],
        edges: [{ source: 'trig', target: 'asgn_node' }],
      };

      const result = await workflowExecutionEngine.executeWorkflow(wf, {
        userId: testUserId,
        conversation: { id: testConvId },
        contact: { phone: testPhone },
        isSimulation: false,
      });

      assert.strictEqual(result.success, true);
      const dbCheck = await query('SELECT assignee FROM conversations WHERE id = $1', [testConvId]);
      assert.strictEqual(dbCheck.rows[0]?.assignee, 'Senior Specialist Priya', 'Conversation assignee in DB must be updated');
    });

    // -------------------------------------------------------------
    // Test 15: Invalid node fails safely
    // -------------------------------------------------------------
    await runAsyncTest('15. Invalid or unsupported node type fails safely without uncaught exception', async () => {
      const wf = {
        id: `wf_inv_${Date.now()}`,
        name: 'Invalid Node WF',
        user_id: testUserId,
        nodes: [
          { id: 'trig', type: 'trigger' },
          { id: 'inv_node', type: 'future_unsupported_node_type', data: { param: 'xyz' } },
        ],
        edges: [{ source: 'trig', target: 'inv_node' }],
      };

      const result = await workflowExecutionEngine.executeWorkflow(wf, {
        userId: testUserId,
        isSimulation: true,
      });

      const invStep = result.executionSteps.find((s) => s.nodeId === 'inv_node');
      assert.strictEqual(invStep?.status, 'unsupported');
      assert.strictEqual(invStep?.detail.includes('Unsupported node type'), true);
    });

    // -------------------------------------------------------------
    // Test 16: Infinite loop protection works
    // -------------------------------------------------------------
    await runAsyncTest('16. Infinite loop protection terminates safely and records cycle failure', async () => {
      const wf = {
        id: `wf_loop_${Date.now()}`,
        name: 'Infinite Loop WF',
        user_id: testUserId,
        nodes: [
          { id: 'node_1', type: 'plain_message', data: { text: 'Hop 1' } },
          { id: 'node_2', type: 'plain_message', data: { text: 'Hop 2' } },
        ],
        // Circular loop: 1 -> 2 -> 1
        edges: [
          { source: 'node_1', target: 'node_2' },
          { source: 'node_2', target: 'node_1' },
        ],
      };

      const startTime = Date.now();
      const result = await workflowExecutionEngine.executeWorkflow(wf, {
        userId: testUserId,
        isSimulation: true,
      });
      const duration = Date.now() - startTime;

      assert.strictEqual(result.success, false, 'Infinite loop must be marked failed');
      assert.strictEqual(result.error?.includes('MAX_HOPS') || result.error?.includes('CYCLE_DETECTED'), true);
      assert.strictEqual(duration < 2000, true, 'Execution must terminate immediately, not hang');
    });

    // -------------------------------------------------------------
    // Test 17: Execution logs record every executed node
    // -------------------------------------------------------------
    await runAsyncTest('17. Execution logs record every executed node in automation_execution_logs', async () => {
      const wf = {
        id: `wf_log_${Date.now()}`,
        name: 'Execution Log Test',
        user_id: testUserId,
        nodes: [
          { id: 'trig', type: 'trigger' },
          { id: 'step_1', type: 'plain_message', data: { text: 'Step 1' } },
          { id: 'step_2', type: 'plain_message', data: { text: 'Step 2' } },
        ],
        edges: [
          { source: 'trig', target: 'step_1' },
          { source: 'step_1', target: 'step_2' },
        ],
      };

      const result = await workflowExecutionEngine.executeWorkflow(wf, {
        userId: testUserId,
        triggerType: 'webhook',
        isSimulation: false,
      });

      assert.strictEqual(result.success, true);
      const executionId = result.executionId;

      const logRow = await query('SELECT * FROM automation_execution_logs WHERE id = $1', [executionId]);
      assert.strictEqual(logRow.rows.length, 1);
      const log = logRow.rows[0];
      assert.strictEqual(log.matched_automation_id, wf.id);

      const payload = typeof log.response_payload === 'string' ? JSON.parse(log.response_payload) : log.response_payload;
      assert.strictEqual(payload.status, 'completed');
      const recordedNodeIds = payload.steps.map((a) => a.nodeId);
      assert.strictEqual(recordedNodeIds.includes('trig'), true);
      assert.strictEqual(recordedNodeIds.includes('step_1'), true);
      assert.strictEqual(recordedNodeIds.includes('step_2'), true);
    });

    // -------------------------------------------------------------
    // Test 18: Failed node marks execution failed
    // -------------------------------------------------------------
    await runAsyncTest('18. Failed node marks execution failed and persists error to database logs', async () => {
      const originalSendTemplate = metaWhatsAppService.sendTemplateMessage;
      metaWhatsAppService.sendTemplateMessage = async () => ({ success: false, error: 'Template rejected' });

      try {
        const wf = {
          id: `wf_fail_${Date.now()}`,
          name: 'Failing Node WF',
          user_id: testUserId,
          nodes: [
            { id: 'trig', type: 'trigger' },
            { id: 'failing_tmpl', type: 'template_message', data: { templateName: 'missing_tmpl' } },
          ],
          edges: [{ source: 'trig', target: 'failing_tmpl' }],
        };

        const result = await workflowExecutionEngine.executeWorkflow(wf, {
          userId: testUserId,
          contact: { phone: '+15559990000' },
          isSimulation: false,
        });

        assert.strictEqual(result.success, false);
        const logRow = await query('SELECT * FROM automation_execution_logs WHERE id = $1', [result.executionId]);
        const payload = typeof logRow.rows[0]?.response_payload === 'string' ? JSON.parse(logRow.rows[0].response_payload) : logRow.rows[0]?.response_payload;
        assert.strictEqual(payload?.status, 'failed');
        const failedStep = payload?.steps?.find((s) => s.status === 'failed');
        assert.strictEqual(failedStep?.error?.includes('TEMPLATE_NOT_AVAILABLE'), true);
      } finally {
        metaWhatsAppService.sendTemplateMessage = originalSendTemplate;
      }
    });

    // -------------------------------------------------------------
    // Test 19: User A cannot execute User B workflow
    // -------------------------------------------------------------
    await runAsyncTest('19. User A cannot execute User B workflow (tenant boundary protection)', async () => {
      const userBWorkflow = {
        id: `wf_user_b_${Date.now()}`,
        name: 'User B Private Workflow',
        user_id: testUserIdB,
        nodes: [{ id: 'trig', type: 'trigger' }],
        edges: [],
      };

      // User A attempts to execute User B's workflow
      const result = await workflowExecutionEngine.executeWorkflow(userBWorkflow, {
        userId: testUserId, // Mismatched tenant
        isSimulation: true,
      });

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error?.includes('UNAUTHORIZED_TENANT'), true);
    });

    // -------------------------------------------------------------
    // Test 20: Default template cannot be modified by tenant
    // -------------------------------------------------------------
    await runAsyncTest('20. Default template (user_id IS NULL) cannot be modified by tenant', async () => {
      const templateId = `wf_sys_tmpl_${Date.now()}`;
      createdWfIds.push(templateId);

      // Insert shared template with user_id IS NULL
      await query(
        `INSERT INTO workflows (id, user_id, name, description, trigger, trigger_config, action, nodes, edges, status, is_published, created_at, updated_at)
         VALUES ($1, NULL, 'Standard System Template', 'Read only template', 'keyword', '{}', 'Flow', '[]', '[]', 'active', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [templateId]
      );

      const req = {
        user: { id: testUserId },
        params: { id: templateId },
        body: { name: 'Attempted Hijacked Template Name' },
      };
      const res = mockResponse();

      await automationController.updateWorkflow(req, res, (err) => {
        if (err) throw err;
      });

      assert.strictEqual(res.statusCode, 403, 'Must return 403 Forbidden for default template edit');
      assert.strictEqual(res.jsonData?.error?.includes('Default templates cannot be modified'), true);
    });

    // -------------------------------------------------------------
    // Test 21: Inbound WhatsApp message can trigger a real workflow
    // -------------------------------------------------------------
    await runAsyncTest('21. Inbound WhatsApp message matches active workflow keyword and executes', async () => {
      const inboundWfId = `wf_inbound_${Date.now()}`;
      createdWfIds.push(inboundWfId);

      await query(
        `INSERT INTO workflows (id, user_id, name, description, trigger, trigger_config, action, nodes, edges, status, is_published, created_at, updated_at)
         VALUES ($1, $2, 'Inbound Demo Workflow', 'Handles demo inquiry', 'keyword', '{"keyword":"demo"}', 'Demo Flow',
         '[{"id":"trig","type":"trigger"},{"id":"msg","type":"plain_message","data":{"text":"Thank you for requesting a demo!"}}]',
         '[{"source":"trig","target":"msg"}]', 'active', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [inboundWfId, testUserId]
      );

      const inboundResult = await workflowExecutionEngine.evaluateInboundWhatsAppMessage({
        text: 'Hello, I would like to see a DEMO please',
        from: '+15554443333',
        userId: testUserId,
      });

      assert.strictEqual(inboundResult.matched, true);
      assert.strictEqual(inboundResult.workflowId, inboundWfId);
      assert.strictEqual(inboundResult.executionResult?.success, true);
    });

    // -------------------------------------------------------------
    // Test 22: Non-matching WhatsApp message does not trigger workflow
    // -------------------------------------------------------------
    await runAsyncTest('22. Non-matching WhatsApp message does not trigger workflow', async () => {
      const inboundResult = await workflowExecutionEngine.evaluateInboundWhatsAppMessage({
        text: 'Unrelated query about store opening times',
        from: '+15554443333',
        userId: testUserId,
      });

      assert.strictEqual(inboundResult.matched, false);
      assert.strictEqual(inboundResult.workflowId, undefined);
    });

    // -------------------------------------------------------------
    // Test 23: Shopify event can trigger the SAME unified engine
    // -------------------------------------------------------------
    await runAsyncTest('23. Shopify event triggers the SAME unified workflow execution engine', async () => {
      const shopifyWfId = `wf_shp_order_${Date.now()}`;
      createdWfIds.push(shopifyWfId);

      await query(
        `INSERT INTO workflows (id, user_id, name, description, trigger, trigger_config, action, nodes, edges, status, is_published, created_at, updated_at)
         VALUES ($1, $2, 'Shopify Order Handler', 'Unified Engine for Shopify', 'shopify', '{"event_type":"order.created"}', 'Order Flow',
         '[{"id":"trig","type":"trigger"},{"id":"msg","type":"plain_message","data":{"text":"Order #{{order_number}} received!"}}]',
         '[{"source":"trig","target":"msg"}]', 'active', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [shopifyWfId, testUserId]
      );

      const normalizedShopifyEvent = {
        eventId: `evt_shp_${Date.now()}`,
        eventType: 'order.created',
        source: 'shopify',
        shopDomain: 'test-store.myshopify.com',
        userId: testUserId,
        variables: {
          order_number: '8877',
          total_amount: 120.0,
          currency: 'USD',
          customer_name: 'David Miller',
          customer_phone: '+15558887777',
        },
      };

      const dispatchResult = await dispatchShopifyEventToWorkflows(normalizedShopifyEvent);

      assert.strictEqual(dispatchResult.matchedCount, 1);
      assert.strictEqual(dispatchResult.executedCount, 1);
      assert.strictEqual(dispatchResult.results[0]?.workflowId, shopifyWfId);
      assert.strictEqual(dispatchResult.results[0]?.executionResult?.success, true);
    });

    // -------------------------------------------------------------
    // Test 24: Shopify condition branch works through the unified engine
    // -------------------------------------------------------------
    await runAsyncTest('24. Shopify condition branch evaluates and executes through the unified engine', async () => {
      const shopifyBranchWfId = `wf_shp_cond_${Date.now()}`;
      createdWfIds.push(shopifyBranchWfId);

      const nodes = [
        { id: 'trig', type: 'trigger' },
        {
          id: 'cond_order',
          type: 'condition',
          data: { conditions: [{ trait: 'total_amount', operator: 'Greater Than', value: '100' }] },
        },
        { id: 'node_vip', type: 'plain_message', data: { text: 'VIP High Value Order' } },
        { id: 'node_standard', type: 'plain_message', data: { text: 'Standard Order' } },
      ];
      const edges = [
        { source: 'trig', target: 'cond_order' },
        { source: 'cond_order', sourcePort: 'true', target: 'node_vip' },
        { source: 'cond_order', sourcePort: 'false', target: 'node_standard' },
      ];

      await query(
        `INSERT INTO workflows (id, user_id, name, description, trigger, trigger_config, action, nodes, edges, status, is_published, created_at, updated_at)
         VALUES ($1, $2, 'Shopify Value Branch', 'Condition branching', 'shopify', '{"event_type":"order.created"}', 'Order Flow',
         $3, $4, 'active', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [shopifyBranchWfId, testUserId, JSON.stringify(nodes), JSON.stringify(edges)]
      );

      // High value ($150) -> VIP node
      const resHigh = await executeWorkflowForShopifyEvent(
        { id: shopifyBranchWfId, name: 'Shopify Value Branch', user_id: testUserId, nodes, edges },
        {
          eventId: 'evt_1',
          eventType: 'order.created',
          userId: testUserId,
          variables: { total_amount: 150.0, customer_phone: '+15551112222' },
        }
      );
      const highNodes = resHigh.executionSteps.map((s) => s.nodeId);
      assert.strictEqual(highNodes.includes('node_vip'), true);
      assert.strictEqual(highNodes.includes('node_standard'), false);

      // Low value ($50) -> Standard node
      const resLow = await executeWorkflowForShopifyEvent(
        { id: shopifyBranchWfId, name: 'Shopify Value Branch', user_id: testUserId, nodes, edges },
        {
          eventId: 'evt_2',
          eventType: 'order.created',
          userId: testUserId,
          variables: { total_amount: 50.0, customer_phone: '+15551112222' },
        }
      );
      const lowNodes = resLow.executionSteps.map((s) => s.nodeId);
      assert.strictEqual(lowNodes.includes('node_standard'), true);
      assert.strictEqual(lowNodes.includes('node_vip'), false);
    });

    // -------------------------------------------------------------
    // Test 25: Shopify variables interpolate through the unified engine
    // -------------------------------------------------------------
    await runAsyncTest('25. Shopify variables interpolate accurately into messages via unified engine', async () => {
      const wf = {
        id: `wf_shp_vars_${Date.now()}`,
        name: 'Shopify Variable Test',
        user_id: testUserId,
        nodes: [
          { id: 'trig', type: 'trigger' },
          {
            id: 'msg',
            type: 'plain_message',
            data: { text: 'Hi {{customer_name}}, order #{{order_number}} is confirmed for {{currency}} {{total_amount}}.' },
          },
        ],
        edges: [{ source: 'trig', target: 'msg' }],
      };

      const result = await workflowExecutionEngine.executeWorkflow(wf, {
        userId: testUserId,
        variables: {
          customer_name: 'Sophia',
          order_number: '7744',
          currency: 'CAD',
          total_amount: 89.95,
        },
        isSimulation: true,
      });

      assert.strictEqual(result.success, true);
      const msgStep = result.executionSteps.find((s) => s.nodeId === 'msg');
      assert.strictEqual(msgStep?.output, 'Hi Sophia, order #7744 is confirmed for CAD 89.95.');
    });

    // -------------------------------------------------------------
    // Test 26: Historical Shopify sync does NOT trigger workflows
    // -------------------------------------------------------------
    await runAsyncTest('26. Historical Shopify sync does NOT trigger workflows or create shopify_events', async () => {
      const originalQuery = pool.query;
      const executedQueries = [];

      pool.query = async (text, params) => {
        executedQueries.push({ text, params });
        if (text.includes('SELECT user_id FROM shopify_integrations')) {
          return { rows: [{ user_id: testUserId }] };
        }
        if (text.includes('SELECT id FROM contacts')) {
          return { rows: [{ id: 'cnt_shp_dummy' }] };
        }
        if (text.includes('SELECT id, workflow_id, contact_id FROM checkout_orders')) {
          return { rows: [] };
        }
        if (text.includes('INSERT INTO checkout_orders')) {
          return { rows: [{ id: 'ord_shp_hist_99' }] };
        }
        return { rows: [] };
      };

      try {
        await handleOrderSync(
          'store.myshopify.com',
          {
            id: 998877,
            order_number: 'HIST-101',
            financial_status: 'paid',
            fulfillment_status: 'fulfilled',
            total_price: '199.00',
            currency: 'USD',
            customer: { id: 554433, first_name: 'Historical', last_name: 'Customer' },
            line_items: [{ title: 'Legacy Item', price: '199.00', quantity: 1 }],
          },
          { isNewOrder: false, isHistorical: true }
        );

        // Verify no shopify_events were inserted
        const eventInserts = executedQueries.filter((q) => q.text.includes('INSERT INTO shopify_events'));
        assert.strictEqual(eventInserts.length, 0, 'Must NOT insert into shopify_events during historical sync');

        // Verify no workflows were queried to match or execute triggers
        const workflowQueries = executedQueries.filter((q) => q.text.includes('FROM workflows'));
        assert.strictEqual(workflowQueries.length, 0, 'Must NOT query workflows during historical sync');
      } finally {
        pool.query = originalQuery;
      }
    });

  } finally {
    // Teardown: Clean up test artifacts from PostgreSQL
    try {
      if (createdWfIds.length > 0) {
        await query(`DELETE FROM workflows WHERE id = ANY($1)`, [createdWfIds]);
      }
      if (createdContactIds.length > 0) {
        await query(`DELETE FROM contacts WHERE id = ANY($1)`, [createdContactIds]);
      }
      if (createdConvIds.length > 0) {
        await query(`DELETE FROM conversations WHERE id = ANY($1)`, [createdConvIds]);
      }
      await query(`DELETE FROM automation_execution_logs WHERE user_id = $1 OR user_id = $2`, [testUserId, testUserIdB]);
    } catch (cleanupErr) {
      console.warn('Test cleanup error (non-fatal):', cleanupErr.message);
    }
  }

  console.log('\n-------------------------------------------------------------');
  console.log(` RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('-------------------------------------------------------------\n');

  if (passedTests !== totalTests) {
    console.error(`❌ Suite failed: ${totalTests - passedTests} tests failed.`);
    process.exit(1);
  } else {
    console.log('🎉 ALL 26 CORE WORKFLOW EXECUTION ENGINE REQUIREMENTS VERIFIED!');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
