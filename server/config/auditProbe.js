import { query, db } from './db.js';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:5000/api';

async function runComprehensiveAudit() {
  console.log('====================================================');
  console.log('🔍 RUNNING DEEP COMPREHENSIVE FUNCTIONALITY AUDIT');
  console.log('====================================================\n');

  const auditReport = [];

  // Generate test session token
  const testUserId = 'usr_audit_test_1787720000000';
  const testToken = jwt.sign(
    { id: testUserId, email: 'audit@arco.local', role: 'admin' },
    'arco_super_secure_jwt_secret_2026',
    { expiresIn: '7d' }
  );

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${testToken}`,
  };

  async function checkEndpoint(name, url, method = 'GET', body = null) {
    try {
      const opts = { method, headers: authHeaders };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(url, opts);
      const data = await res.json().catch(() => null);
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      return { ok: false, status: 'ERROR', error: err.message };
    }
  }

  // 1. Auth & Onboarding
  const r1 = await checkEndpoint('Auth Me', `${BASE_URL}/auth/me`);
  const r1b = await checkEndpoint('Auth Onboarding Save', `${BASE_URL}/auth/onboarding`, 'POST', {
    businessSetup: { companyName: 'Audit Corp' },
    isCompleted: true
  });

  // 2. Dashboard
  const r2 = await checkEndpoint('Dashboard Analytics', `${BASE_URL}/analytics/dashboard`);

  // 3. Support Inbox
  const r3 = await checkEndpoint('Inbox Conversations', `${BASE_URL}/inbox/conversations`);
  const r3b = await checkEndpoint('Inbox Send Message', `${BASE_URL}/inbox/messages`, 'POST', {
    conversationId: 'cnv_1',
    content: 'Audit test message',
    sender: 'agent'
  });

  // 4. Contacts
  const r4 = await checkEndpoint('Get Contacts', `${BASE_URL}/contacts`);
  const r4b = await checkEndpoint('Create Contact', `${BASE_URL}/contacts`, 'POST', {
    name: 'Audit Lead',
    phone: '+919999900001',
    tag: 'Lead'
  });
  const contactId = r4b.data?.data?.id;
  const r4c = contactId ? await checkEndpoint('Update Contact', `${BASE_URL}/contacts/${contactId}`, 'PUT', { tag: 'Qualified' }) : { ok: false };
  const r4d = contactId ? await checkEndpoint('Delete Contact', `${BASE_URL}/contacts/${contactId}`, 'DELETE') : { ok: false };

  // 5. Campaigns
  const r5 = await checkEndpoint('Get Campaigns', `${BASE_URL}/campaigns`);

  // 6. Campaign Creation
  const r6 = await checkEndpoint('Create Campaign', `${BASE_URL}/campaigns`, 'POST', {
    name: 'Audit Promo Blast',
    channel: 'whatsapp',
    type: 'onetime',
    category: 'Marketing'
  });

  // 7. Campaign Reports
  const r7 = await checkEndpoint('Campaign Reports Overview', `${BASE_URL}/analytics/overview`);

  // 8. Analytics Overview & Agent & Ad
  const r8a = await checkEndpoint('Analytics Overview', `${BASE_URL}/analytics/overview`);
  const r8b = await checkEndpoint('Agent Performance', `${BASE_URL}/analytics/agent-performance`);
  const r8c = await checkEndpoint('Ad Performance', `${BASE_URL}/analytics/ad-performance`);

  // 9. Sales Pipeline
  const r9 = await checkEndpoint('CRM Pipeline', `${BASE_URL}/crm/pipeline`);

  // 10. Sales CRM Reports
  const r10 = await checkEndpoint('CRM Reports', `${BASE_URL}/crm/reports`);

  // 11. Tasks
  const r11a = await checkEndpoint('Get Tasks', `${BASE_URL}/tasks`);
  const r11b = await checkEndpoint('Create Task', `${BASE_URL}/tasks`, 'POST', {
    title: 'Audit Follow-up Task',
    status: 'Todo',
    priority: 'High'
  });
  const taskId = r11b.data?.data?.id;
  const r11c = taskId ? await checkEndpoint('Update Task', `${BASE_URL}/tasks/${taskId}`, 'PUT', { status: 'Done' }) : { ok: false };
  const r11d = taskId ? await checkEndpoint('Delete Task', `${BASE_URL}/tasks/${taskId}`, 'DELETE') : { ok: false };

  // 12. Templates
  const r12a = await checkEndpoint('Get Templates', `${BASE_URL}/templates`);
  const r12b = await checkEndpoint('Create Template', `${BASE_URL}/templates`, 'POST', {
    name: `audit_template_${Date.now()}`,
    category: 'MARKETING',
    language: 'en_US',
    bodyText: 'Hello {{1}}, this is an audit test template.',
    status: 'APPROVED'
  });
  const templateId = r12b.data?.data?.id;
  const r12c = templateId ? await checkEndpoint('Delete Template', `${BASE_URL}/templates/${templateId}`, 'DELETE') : { ok: false };

  // 13. Segments
  const r13a = await checkEndpoint('Get Segments', `${BASE_URL}/segments`);
  const r13b = await checkEndpoint('Create Segment', `${BASE_URL}/segments`, 'POST', {
    name: 'Audit High Value Segment',
    type: 'dynamic',
    rules: [{ field: 'tag', operator: 'equals', value: 'VIP' }]
  });
  const segmentId = r13b.data?.data?.id;
  const r13c = segmentId ? await checkEndpoint('Delete Segment', `${BASE_URL}/segments/${segmentId}`, 'DELETE') : { ok: false };

  // 14. Chat Assignment
  const r14a = await checkEndpoint('Chat Assignment Rules', `${BASE_URL}/chat-assignment/rules`);
  const r14b = await checkEndpoint('Chat Assignment Settings', `${BASE_URL}/chat-assignment/settings`);

  // 15. Automation Inbox Settings
  const r15a = await checkEndpoint('Automation Settings', `${BASE_URL}/automation/settings`);
  const r15b = await checkEndpoint('Update Automation Settings', `${BASE_URL}/automation/settings`, 'PUT', {
    workingHoursEnabled: true,
    outOfOfficeMessage: 'Audit out of office reply'
  });

  // 16. Interactive Lists
  const r16a = await checkEndpoint('Get Interactive Lists', `${BASE_URL}/automation/interactive-lists`);
  const r16b = await checkEndpoint('Create Interactive List', `${BASE_URL}/automation/interactive-lists`, 'POST', {
    name: 'Audit Main Menu',
    headerText: 'Menu Header',
    bodyText: 'Please select an option:',
    sections: [{ title: 'Services', rows: [{ id: 'opt_1', title: 'Support', description: 'Help desk' }] }]
  });
  const listId = r16b.data?.data?.id;
  const r16c = listId ? await checkEndpoint('Delete Interactive List', `${BASE_URL}/automation/interactive-lists/${listId}`, 'DELETE') : { ok: false };

  // 17. WhatsApp Forms
  const r17a = await checkEndpoint('Get WhatsApp Forms', `${BASE_URL}/automation/whatsapp-forms`);
  const r17b = await checkEndpoint('Create WhatsApp Form', `${BASE_URL}/automation/whatsapp-forms`, 'POST', {
    name: 'Audit Lead Capture Form',
    questions: [{ id: 'q1', type: 'text', label: 'Company Name' }]
  });
  const formId = r17b.data?.data?.id;
  const r17c = formId ? await checkEndpoint('Delete WhatsApp Form', `${BASE_URL}/automation/whatsapp-forms/${formId}`, 'DELETE') : { ok: false };

  // 18. Workflows
  const r18a = await checkEndpoint('Get Workflows', `${BASE_URL}/automation/workflows`);
  const r18b = await checkEndpoint('Create Workflow', `${BASE_URL}/automation/workflows`, 'POST', {
    name: 'Audit Abandoned Cart Flow',
    trigger: 'cart_abandoned',
    nodes: [{ id: 'n1', type: 'message', content: 'You left items in your cart' }]
  });
  const wfId = r18b.data?.data?.id;
  const r18c = wfId ? await checkEndpoint('Delete Workflow', `${BASE_URL}/automation/workflows/${wfId}`, 'DELETE') : { ok: false };

  // 19. Custom Reply
  const r19a = await checkEndpoint('Get Custom Replies', `${BASE_URL}/automation/custom-replies`);
  const r19b = await checkEndpoint('Create Custom Reply', `${BASE_URL}/automation/custom-replies`, 'POST', {
    name: 'Audit Pricing Reply',
    keywords: ['price', 'pricing', 'quote'],
    replyText: 'Our starter plan is $29/mo.'
  });
  const crId = r19b.data?.data?.id;
  const r19c = crId ? await checkEndpoint('Delete Custom Reply', `${BASE_URL}/automation/custom-replies/${crId}`, 'DELETE') : { ok: false };

  // 20. AI Intent Matching
  const r20a = await checkEndpoint('Get AI Intents', `${BASE_URL}/automation/ai-intents`);
  const r20b = await checkEndpoint('Create AI Intent', `${BASE_URL}/automation/ai-intents`, 'POST', {
    name: 'Audit Refund Request',
    utterances: ['I want my money back', 'Cancel and refund', 'Need refund'],
    response: 'We process refunds within 3-5 business days.'
  });
  const intentId = r20b.data?.data?.id;
  const r20c = intentId ? await checkEndpoint('Delete AI Intent', `${BASE_URL}/automation/ai-intents/${intentId}`, 'DELETE') : { ok: false };

  // 21. WhatsApp AI Agent
  const r21a = await checkEndpoint('Get AI Agent Config', `${BASE_URL}/automation/whatsapp-ai-agent`);
  const r21b = await checkEndpoint('Create Training Source', `${BASE_URL}/automation/whatsapp-ai-agent/training-sources`, 'POST', {
    title: 'Audit Product Guide',
    type: 'text',
    content: 'ARCO Communication provides enterprise WhatsApp API solutions.'
  });
  const sourceId = r21b.data?.data?.id;
  const r21c = sourceId ? await checkEndpoint('Delete Training Source', `${BASE_URL}/automation/whatsapp-ai-agent/training-sources/${sourceId}`, 'DELETE') : { ok: false };

  // 22. Instagram Quickflows
  const r22a = await checkEndpoint('Get Quickflows', `${BASE_URL}/automation/quickflows`);
  const r22b = await checkEndpoint('Create Quickflow', `${BASE_URL}/automation/quickflows`, 'POST', {
    name: 'Audit Story Mention Quickflow',
    triggerType: 'story_mention',
    replyMessage: 'Thanks for mentioning us in your story!'
  });
  const qfId = r22b.data?.data?.id;
  const r22c = qfId ? await checkEndpoint('Delete Quickflow', `${BASE_URL}/automation/quickflows/${qfId}`, 'DELETE') : { ok: false };

  // 23. Call Genie (Voice AI)
  const r23a = await checkEndpoint('Get Voice AI Config', `${BASE_URL}/automation/voice-ai/config`);
  const r23b = await checkEndpoint('Get Voice AI Calls', `${BASE_URL}/automation/voice-ai/calls`);

  // 24. CTWA / Facebook
  const r24a = await checkEndpoint('Get Facebook Pages', `${BASE_URL}/meta/facebook-pages`);
  const r24b = await checkEndpoint('Get Ad Accounts', `${BASE_URL}/meta/ad-accounts`);

  // 25. Commerce (Settings, Catalog, Order Panel)
  const r25a = await checkEndpoint('Get Commerce Settings', `${BASE_URL}/commerce/settings`);
  const r25b = await checkEndpoint('Get Catalog Products', `${BASE_URL}/commerce/catalog`);
  const r25c = await checkEndpoint('Get Commerce Orders', `${BASE_URL}/commerce/orders`);

  // 26. Checkout Bot
  const r26a = await checkEndpoint('Get Checkout Bot Workflows', `${BASE_URL}/checkout-bot/workflows`);
  const r26b = await checkEndpoint('Get Checkout Sessions', `${BASE_URL}/checkout-bot/sessions`);

  // 27. Integrations
  const r27a = await checkEndpoint('Get Meta Integrations', `${BASE_URL}/meta/waba-accounts`);
  const r27b = await checkEndpoint('Get Global Settings', `${BASE_URL}/settings`);

  const summary = [
    { module: '1. Auth & Onboarding', status: r1b.ok ? 'PASS' : 'FAIL', details: `Save Onboarding: HTTP ${r1b.status}` },
    { module: '2. Dashboard', status: r2.ok ? 'PASS' : 'FAIL', details: `Dashboard KPI API: HTTP ${r2.status}` },
    { module: '3. Support Inbox', status: r3.ok && r3b.ok ? 'PASS' : 'FAIL', details: `Get & Send Message: HTTP ${r3b.status}` },
    { module: '4. Contacts', status: r4.ok && r4b.ok && r4c.ok && r4d.ok ? 'PASS' : 'FAIL', details: `CRUD complete: Create ${r4b.ok}, Read ${r4.ok}, Update ${r4c.ok}, Delete ${r4d.ok}` },
    { module: '5. Campaigns', status: r5.ok ? 'PASS' : 'FAIL', details: `Get Campaigns: HTTP ${r5.status}` },
    { module: '6. Campaign Creation', status: r6.ok ? 'PASS' : 'FAIL', details: `Create Campaign: HTTP ${r6.status}` },
    { module: '7. Campaign Reports', status: r7.ok ? 'PASS' : 'FAIL', details: `Reports Overview: HTTP ${r7.status}` },
    { module: '8. Analytics', status: r8a.ok && r8b.ok && r8c.ok ? 'PASS' : 'FAIL', details: `Overview, Agent, Ad: ${r8a.ok}/${r8b.ok}/${r8c.ok}` },
    { module: '9. Sales Pipeline', status: r9.ok ? 'PASS' : 'FAIL', details: `Pipeline Stages: HTTP ${r9.status}` },
    { module: '10. Sales CRM Reports', status: r10.ok ? 'PASS' : 'FAIL', details: `CRM Reports: HTTP ${r10.status}` },
    { module: '11. Tasks', status: r11a.ok && r11b.ok && r11c.ok && r11d.ok ? 'PASS' : 'FAIL', details: `Tasks CRUD: Create ${r11b.ok}, Read ${r11a.ok}, Update ${r11c.ok}, Delete ${r11d.ok}` },
    { module: '12. Templates', status: r12a.ok && r12b.ok && r12c.ok ? 'PASS' : 'FAIL', details: `Templates CRUD: Create ${r12b.ok}, Read ${r12a.ok}, Delete ${r12c.ok}` },
    { module: '13. Segments', status: r13a.ok && r13b.ok && r13c.ok ? 'PASS' : 'FAIL', details: `Segments CRUD: Create ${r13b.ok}, Read ${r13a.ok}, Delete ${r13c.ok}` },
    { module: '14. Chat Assignment', status: r14a.ok && r14b.ok ? 'PASS' : 'FAIL', details: `Rules & Settings: ${r14a.ok}/${r14b.ok}` },
    { module: '15. Automation Settings', status: r15a.ok && r15b.ok ? 'PASS' : 'FAIL', details: `Get & Update: ${r15a.ok}/${r15b.ok}` },
    { module: '16. Interactive Lists', status: r16a.ok && r16b.ok && r16c.ok ? 'PASS' : 'FAIL', details: `CRUD: Create ${r16b.ok}, Read ${r16a.ok}, Delete ${r16c.ok}` },
    { module: '17. WhatsApp Forms', status: r17a.ok && r17b.ok && r17c.ok ? 'PASS' : 'FAIL', details: `CRUD: Create ${r17b.ok}, Read ${r17a.ok}, Delete ${r17c.ok}` },
    { module: '18. Workflows', status: r18a.ok && r18b.ok && r18c.ok ? 'PASS' : 'FAIL', details: `CRUD: Create ${r18b.ok}, Read ${r18a.ok}, Delete ${r18c.ok}` },
    { module: '19. Custom Reply', status: r19a.ok && r19b.ok && r19c.ok ? 'PASS' : 'FAIL', details: `CRUD: Create ${r19b.ok}, Read ${r19a.ok}, Delete ${r19c.ok}` },
    { module: '20. AI Intent Matching', status: r20a.ok && r20b.ok && r20c.ok ? 'PASS' : 'FAIL', details: `CRUD: Create ${r20b.ok}, Read ${r20a.ok}, Delete ${r20c.ok}` },
    { module: '21. WhatsApp AI Agent', status: r21a.ok && r21b.ok && r21c.ok ? 'PASS' : 'FAIL', details: `Config & Sources: Create ${r21b.ok}, Read ${r21a.ok}, Delete ${r21c.ok}` },
    { module: '22. Instagram Quickflows', status: r22a.ok && r22b.ok && r22c.ok ? 'PASS' : 'FAIL', details: `CRUD: Create ${r22b.ok}, Read ${r22a.ok}, Delete ${r22c.ok}` },
    { module: '23. Call Genie', status: r23a.ok && r23b.ok ? 'PASS' : 'FAIL', details: `Config & Calls: ${r23a.ok}/${r23b.ok}` },
    { module: '24. CTWA / Facebook', status: r24a.ok && r24b.ok ? 'PASS' : 'FAIL', details: `Pages & Ad Accounts: ${r24a.ok}/${r24b.ok}` },
    { module: '25. Commerce', status: r25a.ok && r25b.ok && r25c.ok ? 'PASS' : 'FAIL', details: `Settings, Catalog, Orders: ${r25a.ok}/${r25b.ok}/${r25c.ok}` },
    { module: '26. Checkout Bot', status: r26a.ok && r26b.ok ? 'PASS' : 'FAIL', details: `Workflows & Sessions: ${r26a.ok}/${r26b.ok}` },
    { module: '27. Integrations', status: r27a.ok && r27b.ok ? 'PASS' : 'FAIL', details: `WABA & Global Settings: ${r27a.ok}/${r27b.ok}` },
  ];

  console.table(summary);
  process.exit(0);
}

runComprehensiveAudit();
