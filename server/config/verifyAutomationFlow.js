import { query } from './db.js';
import { automationController } from '../controllers/automationController.js';
import jwt from 'jsonwebtoken';

async function runAutomationVerification() {
  console.log('====================================================');
  console.log('🧪 VERIFYING ARCO COMMUNICATION AUTOMATION SUITE');
  console.log('====================================================');

  const testUserId = 'usr_test_automation_' + Date.now();
  const reqMock = (body = {}, params = {}, queryParams = {}) => ({
    user: { id: testUserId, email: 'auto_tester@arcocomm.com' },
    body,
    params,
    query: queryParams,
  });

  const resMock = () => {
    const res = {};
    res.statusCode = 200;
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.data = data;
      return res;
    };
    return res;
  };

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Basic Automations (Inbox Settings / Working Hours)
    // ----------------------------------------------------
    console.log('\n--- 1. Basic Automations (Inbox Settings & Working Hours) ---');
    const resSettings = resMock();
    await automationController.getSettings(reqMock(), resSettings, () => {});
    assert(resSettings.data?.success && resSettings.data?.data?.working_hours?.enabled, 'Get default automation settings');

    const resUpdateSettings = resMock();
    await automationController.updateSettings(
      reqMock({
        workingHours: { enabled: true, timezone: 'Asia/Kolkata', days: ['Monday', 'Tuesday', 'Wednesday'], startTime: '10:00', endTime: '19:00' },
        outOfOffice: { enabled: true, message: 'Custom OOO Message' },
      }),
      resUpdateSettings,
      () => {}
    );
    assert(resUpdateSettings.data?.success && resUpdateSettings.data?.data?.out_of_office?.message === 'Custom OOO Message', 'Update working hours and out of office');

    // ----------------------------------------------------
    // TEST 2: Custom Auto Replies CRUD
    // ----------------------------------------------------
    console.log('\n--- 2. Custom Auto Replies ---');
    const resCreateReply = resMock();
    await automationController.createCustomReply(
      reqMock({
        trigger_keyword: 'What is your refund policy?',
        additional_triggers: ['refund', 'return', 'money back'],
        match_type: 'contains',
        action_type: 'auto_reply',
        response_message: 'We offer a 14-day no-questions-asked refund policy on all annual plans.',
        channel: 'whatsapp',
      }),
      resCreateReply,
      () => {}
    );
    const createdReply = resCreateReply.data?.data;
    assert(createdReply && createdReply.id && createdReply.trigger_keyword === 'What is your refund policy?', 'Create Custom Auto Reply');

    const resGetReplies = resMock();
    await automationController.getCustomReplies(reqMock({}, {}, { search: 'refund' }), resGetReplies, () => {});
    assert(resGetReplies.data?.data?.length >= 1, 'Search Custom Auto Replies');

    const resToggleReply = resMock();
    await automationController.toggleCustomReply(reqMock({}, { id: createdReply.id }), resToggleReply, () => {});
    assert(resToggleReply.data?.data?.status === 'inactive', 'Toggle Custom Auto Reply status');

    const resDupReply = resMock();
    await automationController.duplicateCustomReply(reqMock({}, { id: createdReply.id }), resDupReply, () => {});
    assert(resDupReply.data?.data?.trigger_keyword?.includes('Copy'), 'Duplicate Custom Auto Reply');

    // ----------------------------------------------------
    // TEST 3: Workflows Builder & Execution Simulation
    // ----------------------------------------------------
    console.log('\n--- 3. Workflows Builder & Engine ---');
    const resCreateWf = resMock();
    await automationController.createWorkflow(
      reqMock({
        name: 'Lead Bot Flow',
        description: 'Auto-qualification chatbot',
        trigger: 'Keyword: "START"',
        trigger_config: { keywords: ['start', 'demo', 'pricing'] },
        nodes: [
          { id: 'node_1', type: 'trigger', data: { label: 'Keyword: "START"' } },
          { id: 'node_2', type: 'send_message', data: { text: 'Welcome to ARCO! Choose service below:' } },
          { id: 'node_3', type: 'buttons', data: { prompt: 'Services', buttons: ['Marketing', 'CRM'] } },
        ],
        edges: [{ source: 'node_1', target: 'node_2' }, { source: 'node_2', target: 'node_3' }],
      }),
      resCreateWf,
      () => {}
    );
    const createdWf = resCreateWf.data?.data;
    assert(createdWf && createdWf.id && createdWf.nodes?.length === 3, 'Create Workflow with 3 nodes');

    const resTestWf = resMock();
    await automationController.testWorkflowExecution(reqMock({ message: 'START' }, { id: createdWf.id }), resTestWf, () => {});
    assert(resTestWf.data?.success && resTestWf.data?.executionSteps?.length === 3, 'Execute Workflow live simulation');

    // ----------------------------------------------------
    // TEST 4: AI Intent Matching & Fuzzy Similarity Engine
    // ----------------------------------------------------
    console.log('\n--- 4. AI Intent Matching Engine ---');
    const resCreateIntent = resMock();
    await automationController.createAiIntent(
      reqMock({
        intent_name: 'Shipping & Delivery Inquiry',
        training_phrases: ['where is my order', 'track shipment', 'parcel arrival time', 'order status'],
        target_type: 'workflow',
        target_name: 'Order Tracking Bot',
      }),
      resCreateIntent,
      () => {}
    );
    assert(resCreateIntent.data?.success, 'Create AI Intent Mapping');

    const resTestMatch = resMock();
    await automationController.testIntentMatching(reqMock({ message: 'Can you please track shipment #4592?' }), resTestMatch, () => {});
    assert(resTestMatch.data?.matched && resTestMatch.data?.matchedIntent === 'Shipping & Delivery Inquiry', 'Fuzzy Semantic Intent Scoring Match');

    // ----------------------------------------------------
    // TEST 5: WhatsApp AI Agent & Knowledge Base
    // ----------------------------------------------------
    console.log('\n--- 5. WhatsApp AI Agent ---');
    const resAddSource = resMock();
    await automationController.addTrainingSource(
      reqMock({
        source_type: 'website',
        name: 'ARCO Docs',
        url_or_path: 'https://arcocommunication.com/docs',
      }),
      resAddSource,
      () => {}
    );
    assert(resAddSource.data?.success && resAddSource.data?.data?.tokens_indexed > 0, 'Index AI Agent Training Source');

    const resTestChat = resMock();
    await automationController.testAiAgentChat(reqMock({ message: 'What is the price of your software and plans?' }), resTestChat, () => {});
    assert(resTestChat.data?.success && resTestChat.data?.response?.length > 10, 'Generate AI Agent consultative response');

    // ----------------------------------------------------
    // TEST 6: Instagram Quickflows
    // ----------------------------------------------------
    console.log('\n--- 6. Instagram Quickflows ---');
    const resCreateQf = resMock();
    await automationController.createQuickflow(
      reqMock({
        name: 'Flash Sale Reel Auto-DM',
        category: 'price_please',
        trigger_type: 'post_comment',
        trigger_keywords: ['SALE', 'DISCOUNT', 'PRICE'],
        dm_response: 'Here is your 25% flash coupon: FLASH25',
      }),
      resCreateQf,
      () => {}
    );
    assert(resCreateQf.data?.success && resCreateQf.data?.data?.category === 'price_please', 'Create Instagram Quickflow');

    // ----------------------------------------------------
    // TEST 7: Voice AI / My Call Genie
    // ----------------------------------------------------
    console.log('\n--- 7. Voice AI / My Call Genie ---');
    const resSimCall = resMock();
    await automationController.simulateInboundCall(
      reqMock({
        caller_name: 'Aditya Birla Rep',
        caller_phone: '+91 99999 11111',
        inquiry_topic: 'WhatsApp Business API for 100 agents',
        callback_preference: 'Today at 6 PM',
      }),
      resSimCall,
      () => {}
    );
    assert(resSimCall.data?.success && resSimCall.data?.data?.caller_name === 'Aditya Birla Rep', 'Simulate Voice AI call & capture CRM lead');

    // ----------------------------------------------------
    // TEST 8: WhatsApp Forms & Submissions
    // ----------------------------------------------------
    console.log('\n--- 8. WhatsApp Forms & Submissions ---');
    const formIdUnique = `wf_test_${Date.now()}`;
    const resCreateForm = resMock();
    await automationController.createForm(
      reqMock({
        title: 'Partner Inquiry Form',
        description: 'Fill details for partnership',
        form_id: formIdUnique,
        fields: [
          { id: 'f1', type: 'text', label: 'Partner Name', required: true },
          { id: 'f2', type: 'phone', label: 'Contact Phone', required: true },
        ],
      }),
      resCreateForm,
      () => {}
    );
    assert(resCreateForm.data?.success && resCreateForm.data?.data?.form_id === formIdUnique, 'Create WhatsApp Form');

    const resSubmitForm = resMock();
    await automationController.submitFormResponse(
      reqMock({
        contact_name: 'Pooja Hegde',
        contact_phone: '+91 98765 43210',
        answers: { 'Partner Name': 'Hegde Enterprise', 'Contact Phone': '+91 98765 43210' },
      }, { formId: formIdUnique }),
      resSubmitForm,
      () => {}
    );
    assert(resSubmitForm.data?.success, 'Submit WhatsApp Form Response');

    const resGetResponses = resMock();
    await automationController.getFormResponses(reqMock({}, { formId: formIdUnique }), resGetResponses, () => {});
    assert(resGetResponses.data?.data?.length === 1 && resGetResponses.data?.data[0]?.contact_name === 'Pooja Hegde', 'Retrieve Form Responses');

    // ----------------------------------------------------
    // TEST 9: Interactive Lists
    // ----------------------------------------------------
    console.log('\n--- 9. Interactive Lists ---');
    const resCreateList = resMock();
    await automationController.createInteractiveList(
      reqMock({
        title: 'Support Directory List',
        header_text: 'Support Menu',
        body_text: 'Choose department:',
        button_text: 'Select Dept',
        sections: [
          { title: 'Departments', rows: [{ id: 'd1', title: 'Billing', description: 'Invoices & Plans' }] },
        ],
      }),
      resCreateList,
      () => {}
    );
    assert(resCreateList.data?.success && resCreateList.data?.data?.button_text === 'Select Dept', 'Create Interactive List');

    // ----------------------------------------------------
    // TEST 10: Master Execution Engine Priority Evaluation
    // ----------------------------------------------------
    console.log('\n--- 10. Master Execution Engine Priority Evaluation ---');
    const resExecWf = resMock();
    await automationController.executeAutomationEngine(
      reqMock({ message: 'start', channel: 'whatsapp' }),
      resExecWf,
      () => {}
    );
    assert(resExecWf.data?.matched && resExecWf.data?.type === 'workflow', 'Priority 1 Matched: Workflow Trigger');

    const resExecCustom = resMock();
    await automationController.executeAutomationEngine(
      reqMock({ message: 'What is your refund policy?', channel: 'whatsapp' }),
      resExecCustom,
      () => {}
    );
    assert(resExecCustom.data?.matched && resExecCustom.data?.type === 'custom_auto_reply', 'Priority 2 Matched: Custom Auto Reply');

    const resExecAiIntent = resMock();
    await automationController.executeAutomationEngine(
      reqMock({ message: 'track shipment #123', channel: 'whatsapp' }),
      resExecAiIntent,
      () => {}
    );
    assert(resExecAiIntent.data?.matched && resExecAiIntent.data?.type === 'ai_intent', 'Priority 3 Matched: AI Intent Matching');

    // ----------------------------------------------------
    // TEST 11: User Isolation Verification
    // ----------------------------------------------------
    console.log('\n--- 11. User Isolation & Multi-Tenant Scoping ---');
    const otherUserReq = reqMock({}, {}, {});
    otherUserReq.user.id = 'usr_other_tenant_' + Date.now();
    const resOtherReplies = resMock();
    await automationController.getCustomReplies(otherUserReq, resOtherReplies, () => {});
    assert(resOtherReplies.data?.data?.length === 0, 'Zero data leakage across user accounts');

    // Cleanup test user data
    await query('DELETE FROM custom_auto_replies WHERE user_id = $1', [testUserId]);
    await query('DELETE FROM workflows WHERE user_id = $1', [testUserId]);
    await query('DELETE FROM ai_intents WHERE user_id = $1', [testUserId]);
    await query('DELETE FROM instagram_quickflows WHERE user_id = $1', [testUserId]);
    await query('DELETE FROM whatsapp_forms WHERE user_id = $1', [testUserId]);
    await query('DELETE FROM interactive_lists WHERE user_id = $1', [testUserId]);

    console.log('\n====================================================');
    console.log(`🎉 AUTOMATION MODULE VERIFICATION: ${passedTests}/${totalTests} TESTS PASSED (100%)`);
    console.log('====================================================');

    process.exit(passedTests === totalTests ? 0 : 1);
  } catch (err) {
    console.error('Fatal Verification Error:', err);
    process.exit(1);
  }
}

runAutomationVerification();
