import { query } from '../config/db.js';
import { workflowExecutionEngine } from '../services/workflowExecutionEngine.js';
import { metaWhatsAppService } from '../services/metaWhatsAppService.js';
import assert from 'assert';

async function runManualE2EVerification() {
  console.log('=============================================================');
  console.log(' PHASE 14: MANUAL END-TO-END WORKFLOW VERIFICATION');
  console.log('=============================================================\n');

  const testUserId = `usr_e2e_${Date.now()}`;
  const testContactId1 = `cnt_e2e_high_${Date.now()}`;
  const testContactId2 = `cnt_e2e_low_${Date.now()}`;
  const testContactId3 = `cnt_e2e_msg_${Date.now()}`;
  const testPhone1 = `+1555${Math.floor(1000000 + Math.random() * 9000000)}`;
  const testPhone2 = `+1555${Math.floor(1000000 + Math.random() * 9000000)}`;
  const testPhone3 = `+1555${Math.floor(1000000 + Math.random() * 9000000)}`;

  try {
    // -------------------------------------------------------------
    // PART 1: Condition branching Deal Value > 500
    // -------------------------------------------------------------
    console.log('1. Setting up Condition Workflow:');
    console.log('   Trigger -> Condition (deal_value > 500)');
    console.log('              ├── TRUE  -> Update Tag: high_value   -> END');
    console.log('              └── FALSE -> Update Tag: normal_value -> END\n');

    // Create 2 test contacts in PostgreSQL
    await query(
      `INSERT INTO contacts (id, name, phone, email, tag, status, value, created_at, updated_at)
       VALUES ($1, 'High Roller', $2, 'high@test.com', 'initial', 'Lead', 750, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [testContactId1, testPhone1]
    );

    await query(
      `INSERT INTO contacts (id, name, phone, email, tag, status, value, created_at, updated_at)
       VALUES ($1, 'Normal Customer', $2, 'normal@test.com', 'initial', 'Lead', 150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [testContactId2, testPhone2]
    );

    const conditionNodes = [
      { id: 'node_trigger', type: 'trigger', data: { label: 'Inbound Contact' } },
      {
        id: 'node_condition',
        type: 'condition',
        data: {
          conditions: [{ trait: 'deal_value', operator: 'Greater Than', value: '500' }],
        },
      },
      { id: 'node_tag_high', type: 'update_tag', data: { tag: 'high_value' } },
      { id: 'node_tag_normal', type: 'update_tag', data: { tag: 'normal_value' } },
      { id: 'node_end', type: 'end_workflow', data: { message: 'Flow finished' } },
    ];

    const conditionEdges = [
      { id: 'e1', source: 'node_trigger', target: 'node_condition' },
      { id: 'e_true', source: 'node_condition', sourcePort: 'true', target: 'node_tag_high' },
      { id: 'e_false', source: 'node_condition', sourcePort: 'false', target: 'node_tag_normal' },
      { id: 'e_end_1', source: 'node_tag_high', target: 'node_end' },
      { id: 'e_end_2', source: 'node_tag_normal', target: 'node_end' },
    ];

    const e2eWorkflow1 = {
      id: `wf_e2e_cond_${Date.now()}`,
      name: 'Deal Value Router',
      user_id: testUserId,
      nodes: conditionNodes,
      edges: conditionEdges,
    };

    // 1A. Execute for Contact 1 (deal_value = 750 -> TRUE branch)
    console.log('Executing Workflow for Contact 1 (deal_value: 750)...');
    const resultHigh = await workflowExecutionEngine.executeWorkflow(e2eWorkflow1, {
      userId: testUserId,
      contact: { id: testContactId1, phone: testPhone1, name: 'High Roller', value: 750 },
      isSimulation: false,
    });

    assert.strictEqual(resultHigh.success, true);
    const stepsHigh = resultHigh.executionSteps.map((s) => s.nodeId);
    console.log('Executed Steps for Contact 1:', stepsHigh);
    assert.strictEqual(stepsHigh.includes('node_tag_high'), true, 'High value tag node must execute');
    assert.strictEqual(stepsHigh.includes('node_tag_normal'), false, 'Normal value tag node must NOT execute');

    // Verify DB update for Contact 1
    const dbContact1 = await query('SELECT id, tag, tags FROM contacts WHERE id = $1', [testContactId1]);
    console.log('PostgreSQL Contact 1 tag in DB:', dbContact1.rows[0]?.tag);
    assert.strictEqual(dbContact1.rows[0]?.tag, 'high_value', 'PostgreSQL contact tag must be updated to high_value');
    console.log('✓ TRUE branch verified and confirmed in PostgreSQL database!\n');

    // 1B. Execute for Contact 2 (deal_value = 150 -> FALSE branch)
    console.log('Executing Workflow for Contact 2 (deal_value: 150)...');
    const resultNormal = await workflowExecutionEngine.executeWorkflow(e2eWorkflow1, {
      userId: testUserId,
      contact: { id: testContactId2, phone: testPhone2, name: 'Normal Customer', value: 150 },
      isSimulation: false,
    });

    assert.strictEqual(resultNormal.success, true);
    const stepsNormal = resultNormal.executionSteps.map((s) => s.nodeId);
    console.log('Executed Steps for Contact 2:', stepsNormal);
    assert.strictEqual(stepsNormal.includes('node_tag_normal'), true, 'Normal value tag node must execute');
    assert.strictEqual(stepsNormal.includes('node_tag_high'), false, 'High value tag node must NOT execute');

    // Verify DB update for Contact 2
    const dbContact2 = await query('SELECT id, tag, tags FROM contacts WHERE id = $1', [testContactId2]);
    console.log('PostgreSQL Contact 2 tag in DB:', dbContact2.rows[0]?.tag);
    assert.strictEqual(dbContact2.rows[0]?.tag, 'normal_value', 'PostgreSQL contact tag must be updated to normal_value');
    console.log('✓ FALSE branch verified and confirmed in PostgreSQL database!\n');

    // -------------------------------------------------------------
    // PART 2: Plain Message with variable interpolation via Meta boundary
    // -------------------------------------------------------------
    console.log('2. Setting up Plain Message Workflow:');
    console.log('   Trigger -> Plain Message -> END\n');

    const msgNodes = [
      { id: 'node_trigger', type: 'trigger', data: { label: 'Inbound Inquiry' } },
      {
        id: 'node_plain_msg',
        type: 'plain_message',
        data: { text: 'Hello {{customer_name}}, your order #{{order_number}} for {{currency}} {{total_amount}} is confirmed!' },
      },
      { id: 'node_end', type: 'end_workflow', data: { message: 'Done' } },
    ];
    const msgEdges = [
      { id: 'e1', source: 'node_trigger', target: 'node_plain_msg' },
      { id: 'e2', source: 'node_plain_msg', target: 'node_end' },
    ];

    const e2eWorkflow2 = {
      id: `wf_e2e_msg_${Date.now()}`,
      name: 'Order Confirmation Message Flow',
      user_id: testUserId,
      nodes: msgNodes,
      edges: msgEdges,
    };

    let metaDispatchedPayload = null;
    const originalSendTextMessage = metaWhatsAppService.sendTextMessage;
    metaWhatsAppService.sendTextMessage = async (payload) => {
      metaDispatchedPayload = payload;
      return { success: true, wamid: 'wamid_e2e_mock_998877' };
    };

    try {
      console.log('Executing Plain Message Workflow with variables...');
      const msgResult = await workflowExecutionEngine.executeWorkflow(e2eWorkflow2, {
        userId: testUserId,
        contact: { id: testContactId3, phone: testPhone3, name: 'Eleanor Vance' },
        variables: {
          customer_name: 'Eleanor Vance',
          order_number: '5544',
          currency: 'USD',
          total_amount: 349.99,
        },
        isSimulation: false,
      });

      assert.strictEqual(msgResult.success, true);
      console.log('Dispatched Meta API Payload:', metaDispatchedPayload);
      assert.notStrictEqual(metaDispatchedPayload, null);
      assert.strictEqual(metaDispatchedPayload.to, testPhone3);
      assert.strictEqual(
        metaDispatchedPayload.text,
        'Hello Eleanor Vance, your order #5544 for USD 349.99 is confirmed!'
      );
      console.log('✓ Plain Message node called Meta WhatsApp service with accurately interpolated text!\n');
    } finally {
      metaWhatsAppService.sendTextMessage = originalSendTextMessage;
    }

    console.log('=============================================================');
    console.log(' 🎉 PHASE 14 MANUAL END-TO-END VERIFICATION FULLY PASSED!');
    console.log('=============================================================\n');
    process.exit(0);
  } finally {
    // Cleanup
    await query('DELETE FROM contacts WHERE id IN ($1, $2, $3)', [testContactId1, testContactId2, testContactId3]);
    await query('DELETE FROM automation_execution_logs WHERE user_id = $1', [testUserId]);
  }
}

runManualE2EVerification().catch((err) => {
  console.error('Phase 14 Manual E2E Error:', err);
  process.exit(1);
});
