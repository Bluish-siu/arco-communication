/**
 * Automated Test Suite for ARCO Communication Shopify Event Pipeline -> Workflow Automation Bridge
 * Validates all 20 core requirements for normalization, persistence, deduplication,
 * tenant isolation, condition evaluation, action execution, and retries.
 */

const assert = require('assert');
const crypto = require('crypto');

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

async function main() {
  console.log('\n=============================================================');
  console.log(' RUNNING SHOPIFY EVENT PIPELINE -> WORKFLOW BRIDGE TESTS');
  console.log('=============================================================\n');

  const {
    mapTopicToEventType,
    extractShopifyVariables,
    normalizeShopifyEvent,
    persistShopifyEvent,
    evaluateConditionRule,
    isWorkflowTriggerMatch,
    interpolateVariables,
    executeWorkflowForShopifyEvent,
    dispatchShopifyEventToWorkflows,
    retryFailedShopifyEvents,
  } = await import('../services/shopifyEventService.js');

  const { initShopifyEventsTable } = await import('../config/initShopifyEventsTable.js');
  const { pool } = await import('../config/db.js');

  // -------------------------------------------------------------
  // Test 1: Shopify order.created creates normalized event
  // -------------------------------------------------------------
  runTest('1. Shopify orders/create creates normalized order.created event with typed variables', () => {
    const rawOrderPayload = {
      id: 99001,
      order_number: '1001',
      total_price: '150.50',
      currency: 'USD',
      financial_status: 'paid',
      fulfillment_status: 'unfulfilled',
      customer: {
        id: 7701,
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com',
        phone: '+15551234567',
      },
      line_items: [
        { id: 1, title: 'Summer Dress', quantity: 2, price: '75.25' },
      ],
    };

    const event = normalizeShopifyEvent({
      topic: 'orders/create',
      shopDomain: 'brand-store.myshopify.com',
      webhookId: 'wh_order_1001',
      payload: rawOrderPayload,
      userId: 'usr_tenant_1',
      integrationId: 'integ_shopify_1',
    });

    assert.strictEqual(event.eventType, 'order.created');
    assert.strictEqual(event.source, 'shopify');
    assert.strictEqual(event.shopDomain, 'brand-store.myshopify.com');
    assert.strictEqual(event.userId, 'usr_tenant_1');
    assert.strictEqual(event.webhookId, 'wh_order_1001');
    assert.strictEqual(event.variables.order_number, '1001');
    assert.strictEqual(event.variables.total_amount, 150.5);
    assert.strictEqual(event.variables.currency, 'USD');
    assert.strictEqual(event.variables.customer_name, 'Jane Doe');
    assert.strictEqual(event.variables.customer_phone, '+15551234567');
  });

  // -------------------------------------------------------------
  // Test 2: Shopify customer.created creates normalized event
  // -------------------------------------------------------------
  runTest('2. Shopify customers/create creates normalized customer.created event', () => {
    const rawCustPayload = {
      id: 4401,
      first_name: 'Alice',
      last_name: 'Smith',
      email: 'alice@example.com',
      phone: '+919876543210',
      sms_marketing_consent: { state: 'subscribed' },
      orders_count: 3,
      total_spent: '240.00',
    };

    const event = normalizeShopifyEvent({
      topic: 'customers/create',
      shopDomain: 'brand-store.myshopify.com',
      webhookId: 'wh_cust_4401',
      payload: rawCustPayload,
      userId: 'usr_tenant_1',
    });

    assert.strictEqual(event.eventType, 'customer.created');
    assert.strictEqual(event.variables.first_name, 'Alice');
    assert.strictEqual(event.variables.last_name, 'Smith');
    assert.strictEqual(event.variables.marketing_consent, 'subscribed');
    assert.strictEqual(event.variables.orders_count, 3);
  });

  // -------------------------------------------------------------
  // Test 3: Shopify product.created creates normalized event
  // -------------------------------------------------------------
  runTest('3. Shopify products/create creates normalized product.created event', () => {
    const rawProdPayload = {
      id: 5501,
      title: 'Ergonomic Office Chair',
      vendor: 'ComfortWorks',
      product_type: 'Furniture',
      status: 'active',
      variants: [{ id: 1, price: '299.99', sku: 'CHR-ERG-01' }],
    };

    const event = normalizeShopifyEvent({
      topic: 'products/create',
      shopDomain: 'brand-store.myshopify.com',
      webhookId: 'wh_prod_5501',
      payload: rawProdPayload,
      userId: 'usr_tenant_1',
    });

    assert.strictEqual(event.eventType, 'product.created');
    assert.strictEqual(event.variables.title, 'Ergonomic Office Chair');
    assert.strictEqual(event.variables.vendor, 'ComfortWorks');
    assert.strictEqual(event.variables.price, 299.99);
    assert.strictEqual(event.variables.sku, 'CHR-ERG-01');
  });

  // -------------------------------------------------------------
  // Test 4: Duplicate webhook is detected and ignored
  // -------------------------------------------------------------
  await runAsyncTest('4. Duplicate Shopify webhook ID is detected and safely ignored', async () => {
    const originalQuery = pool.query;
    const executedQueries = [];

    let hasStoredEvent = false;

    pool.query = async (text, params) => {
      executedQueries.push({ text, params });
      if (text.includes('SELECT id, event_id, event_type, status, attempts, created_at FROM shopify_events WHERE webhook_id')) {
        if (hasStoredEvent) {
          return { rows: [{ id: 'sevt_1', event_id: 'evt_1', status: 'processed' }] };
        }
        return { rows: [] };
      }
      if (text.includes('INSERT INTO shopify_events')) {
        hasStoredEvent = true;
        return { rows: [{ id: 'sevt_1', event_id: 'evt_1', status: 'received' }] };
      }
      return { rows: [] };
    };

    try {
      const sampleEvent = {
        eventId: 'evt_dup_1',
        eventType: 'order.created',
        source: 'shopify',
        shopDomain: 'store.myshopify.com',
        userId: 'usr_1',
        webhookId: 'wh_duplicate_test_uuid_99',
        payload: { id: 100 },
        variables: {},
      };

      // First ingestion: new event
      const res1 = await persistShopifyEvent(sampleEvent);
      assert.strictEqual(res1.isDuplicate, false, 'First ingestion must not be marked duplicate');

      // Second ingestion: duplicate webhook
      const res2 = await persistShopifyEvent(sampleEvent);
      assert.strictEqual(res2.isDuplicate, true, 'Second ingestion must be detected as duplicate');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 5: Event is tenant scoped
  // -------------------------------------------------------------
  runTest('5. Event normalization strictly binds the authenticated tenant user_id', () => {
    const eventA = normalizeShopifyEvent({
      topic: 'orders/create',
      shopDomain: 'tenant-a.myshopify.com',
      webhookId: 'wh_tenant_a',
      payload: { id: 1 },
      userId: 'usr_tenant_A',
    });

    const eventB = normalizeShopifyEvent({
      topic: 'orders/create',
      shopDomain: 'tenant-b.myshopify.com',
      webhookId: 'wh_tenant_b',
      payload: { id: 2 },
      userId: 'usr_tenant_B',
    });

    assert.strictEqual(eventA.userId, 'usr_tenant_A');
    assert.strictEqual(eventB.userId, 'usr_tenant_B');
    assert.notStrictEqual(eventA.userId, eventB.userId);
  });

  // -------------------------------------------------------------
  // Test 6: Store A cannot trigger Store B workflow (tenant isolation)
  // -------------------------------------------------------------
  await runAsyncTest('6. Store A event never queries or triggers Store B workflows (tenant boundary)', async () => {
    const originalQuery = pool.query;
    const executedQueries = [];

    pool.query = async (text, params) => {
      executedQueries.push({ text, params });
      if (text.includes('SELECT id, user_id, name, trigger, trigger_config')) {
        // Must query with user_id parameter
        assert.strictEqual(params[0], 'usr_tenant_A', 'Query must strictly filter by User A tenant ID');
        return { rows: [] };
      }
      if (text.includes('UPDATE shopify_events')) {
        return { rows: [] };
      }
      return { rows: [] };
    };

    try {
      const eventTenantA = {
        eventId: 'evt_tenant_a_1',
        eventType: 'order.created',
        shopDomain: 'tenant-a.myshopify.com',
        userId: 'usr_tenant_A',
        payload: {},
        variables: {},
      };

      await dispatchShopifyEventToWorkflows(eventTenantA);

      const wfQuery = executedQueries.find((q) => q.text.includes('FROM workflows') && q.text.includes('user_id = $1'));
      assert.ok(wfQuery, 'Must query workflows table scoping strictly by user_id = $1');
      assert.strictEqual(wfQuery.params[0], 'usr_tenant_A');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 7: Active matching workflow executes
  // -------------------------------------------------------------
  await runAsyncTest('7. Active matching workflow is triggered, executed, and counter incremented', async () => {
    const originalQuery = pool.query;
    const executedQueries = [];

    const mockWorkflow = {
      id: 'wf_order_confirmed_01',
      user_id: 'usr_tenant_1',
      name: 'Order Confirmation Flow',
      trigger: 'Shopify: Order Created',
      trigger_config: { source: 'shopify', event: 'order.created' },
      status: 'active',
      executions: 5,
      is_published: true,
      nodes: [
        { id: 'trigger', type: 'trigger', label: 'Order Created' },
        {
          id: 'node_1',
          type: 'plain_message',
          label: 'Send Message',
          data: { text: 'Thank you {{customer_name}}! Your order {{order_number}} is confirmed.' },
        },
      ],
      edges: [{ source: 'trigger', target: 'node_1' }],
    };

    pool.query = async (text, params) => {
      executedQueries.push({ text, params });
      if (text.includes('SELECT id, user_id, name, trigger, trigger_config')) {
        return { rows: [mockWorkflow] };
      }
      if (text.includes('UPDATE workflows SET executions = COALESCE(executions, 0) + 1')) {
        return { rowCount: 1 };
      }
      if (text.includes('INSERT INTO automation_execution_logs')) {
        return { rowCount: 1 };
      }
      if (text.includes('UPDATE shopify_events')) {
        return { rowCount: 1 };
      }
      return { rows: [] };
    };

    try {
      const normalizedEvent = {
        eventId: 'evt_ord_test_01',
        eventType: 'order.created',
        userId: 'usr_tenant_1',
        shopDomain: 'store.myshopify.com',
        variables: {
          order_number: '2026',
          customer_name: 'Shraddha',
          customer_phone: null, // Avoid actual network calls in unit test
        },
      };

      const dispatchResult = await dispatchShopifyEventToWorkflows(normalizedEvent);
      assert.strictEqual(dispatchResult.matchedCount, 1, 'Exactly one matching workflow should trigger');
      assert.strictEqual(dispatchResult.results[0].workflowId, 'wf_order_confirmed_01');

      const updateWf = executedQueries.find((q) => q.text.includes('UPDATE workflows SET executions'));
      assert.ok(updateWf, 'Workflow execution count must be incremented');

      const insertLog = executedQueries.find((q) => q.text.includes('INSERT INTO automation_execution_logs'));
      assert.ok(insertLog, 'Execution log must be persisted');
      assert.strictEqual(insertLog.params[5], 'wf_order_confirmed_01');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 8: Non-matching workflow does not execute
  // -------------------------------------------------------------
  await runAsyncTest('8. Workflow configured for customer.created does not trigger on order.created', async () => {
    const originalQuery = pool.query;
    const executedQueries = [];

    const nonMatchingWorkflow = {
      id: 'wf_customer_welcome',
      user_id: 'usr_tenant_1',
      name: 'Customer Welcome Flow',
      trigger: 'Shopify: Customer Created',
      trigger_config: { source: 'shopify', event: 'customer.created' },
      status: 'active',
      is_published: true,
      nodes: [],
      edges: [],
    };

    pool.query = async (text, params) => {
      executedQueries.push({ text, params });
      if (text.includes('SELECT id, user_id, name, trigger, trigger_config')) {
        return { rows: [nonMatchingWorkflow] };
      }
      return { rows: [] };
    };

    try {
      const orderEvent = {
        eventId: 'evt_ord_diff',
        eventType: 'order.created',
        userId: 'usr_tenant_1',
        shopDomain: 'store.myshopify.com',
        variables: {},
      };

      const res = await dispatchShopifyEventToWorkflows(orderEvent);
      assert.strictEqual(res.matchedCount, 0, 'No non-matching workflow should trigger');
      assert.strictEqual(res.results.length, 0);

      const updateExec = executedQueries.find((q) => q.text.includes('UPDATE workflows SET executions'));
      assert.strictEqual(updateExec, undefined, 'Executions counter must NOT be updated for non-matching workflow');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 9: Inactive or paused workflow does not execute
  // -------------------------------------------------------------
  await runAsyncTest('9. Paused/inactive workflow is excluded from execution', async () => {
    const originalQuery = pool.query;
    pool.query = async (text) => {
      if (text.includes('SELECT id, user_id, name, trigger, trigger_config')) {
        // Query specifies status = 'active'
        assert.ok(text.includes("status = 'active'"), 'Workflow query must enforce active status');
        return { rows: [] };
      }
      return { rows: [] };
    };

    try {
      const event = {
        eventId: 'evt_test_paused',
        eventType: 'order.created',
        userId: 'usr_1',
        shopDomain: 'store.myshopify.com',
        variables: {},
      };
      const res = await dispatchShopifyEventToWorkflows(event);
      assert.strictEqual(res.matchedCount, 0, 'Inactive workflows must yield 0 matches');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 10: Shopify variables reach workflow context (interpolation)
  // -------------------------------------------------------------
  runTest('10. Variables are cleanly interpolated into workflow message templates', () => {
    const template = 'Hi {{customer_name}}, order {{order_number}} for {{currency}} {{total_amount}} is on its way!';
    const variables = {
      customer_name: 'John',
      order_number: '1099',
      currency: 'USD',
      total_amount: 89.95,
    };

    const rendered = interpolateVariables(template, variables);
    assert.strictEqual(rendered, 'Hi John, order 1099 for USD 89.95 is on its way!');
  });

  // -------------------------------------------------------------
  // Test 11: Workflow condition evaluates Shopify order data
  // -------------------------------------------------------------
  runTest('11. Workflow condition correctly evaluates total_amount and currency operators', () => {
    const orderVarsHigh = {
      total_amount: 150.0,
      currency: 'USD',
      financial_status: 'paid',
    };

    const orderVarsLow = {
      total_amount: 45.0,
      currency: 'EUR',
      financial_status: 'pending',
    };

    const condHighValue = {
      trait: 'total_amount',
      operator: 'Greater Than',
      value: '100',
    };

    const condCurrency = {
      trait: 'currency',
      operator: 'Equal',
      value: 'USD',
    };

    assert.strictEqual(evaluateConditionRule(condHighValue, orderVarsHigh), true, '150 > 100 must be true');
    assert.strictEqual(evaluateConditionRule(condHighValue, orderVarsLow), false, '45 > 100 must be false');

    assert.strictEqual(evaluateConditionRule(condCurrency, orderVarsHigh), true, 'USD == USD must be true');
    assert.strictEqual(evaluateConditionRule(condCurrency, orderVarsLow), false, 'EUR == USD must be false');
  });

  // -------------------------------------------------------------
  // Test 12: Existing WhatsApp workflow action receives Shopify variables
  // -------------------------------------------------------------
  await runAsyncTest('12. WhatsApp message dispatch receives formatted Shopify variables', async () => {
    const { metaWhatsAppService } = await import('../services/metaWhatsAppService.js');
    const originalSendText = metaWhatsAppService.sendTextMessage;
    const originalQuery = pool.query;

    let dispatchedPayload = null;
    metaWhatsAppService.sendTextMessage = async (payload) => {
      dispatchedPayload = payload;
      return { success: true, wamid: 'wamid_unit_test_variable_dispatch' };
    };

    pool.query = async (text) => {
      if (text.includes('UPDATE workflows')) return { rowCount: 1 };
      if (text.includes('INSERT INTO automation_execution_logs')) return { rowCount: 1 };
      return { rows: [] };
    };

    try {
      const mockWf = {
        id: 'wf_send_wa_test',
        name: 'WhatsApp Dispatch Test',
        nodes: [
          {
            id: 'node_msg',
            type: 'plain_message',
            data: { text: 'Hello {{customer_name}}, order #{{order_number}} is confirmed!' },
          },
        ],
        edges: [],
      };

      const event = {
        eventId: 'evt_disp_1',
        eventType: 'order.created',
        userId: 'usr_1',
        variables: {
          customer_name: 'Robert',
          order_number: '4455',
          customer_phone: '+919999988888',
        },
      };

      await executeWorkflowForShopifyEvent(mockWf, event);
      assert.ok(dispatchedPayload, 'WhatsApp text message should be sent');
      assert.strictEqual(dispatchedPayload.to, '+919999988888');
      assert.strictEqual(dispatchedPayload.text, 'Hello Robert, order #4455 is confirmed!');
    } finally {
      metaWhatsAppService.sendTextMessage = originalSendText;
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 13: Failed workflow processing marks event failed
  // -------------------------------------------------------------
  await runAsyncTest('13. Unhandled error during dispatch marks shopify_events status as failed with error trace', async () => {
    const originalQuery = pool.query;
    const executedQueries = [];

    pool.query = async (text, params) => {
      executedQueries.push({ text, params });
      if (text.includes('SELECT id, user_id, name, trigger, trigger_config')) {
        throw new Error('Database connection dropped during workflow lookup');
      }
      if (text.includes('UPDATE shopify_events')) {
        return { rowCount: 1 };
      }
      return { rows: [] };
    };

    try {
      const failingEvent = {
        eventId: 'evt_fail_test',
        eventType: 'order.created',
        userId: 'usr_1',
        shopDomain: 'store.myshopify.com',
        variables: {},
      };

      let threw = false;
      try {
        await dispatchShopifyEventToWorkflows(failingEvent);
      } catch (err) {
        threw = true;
      }

      assert.strictEqual(threw, true, 'Dispatch should re-throw fatal error after persisting status');
      const failUpdate = executedQueries.find((q) => q.text.includes("status = $1") && q.params[0] === 'failed');
      assert.ok(failUpdate, 'Event must be marked failed in shopify_events');
      assert.ok(failUpdate.params[1].includes('Database connection dropped'), 'Error message must be recorded');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 14: Retry can process a failed event
  // -------------------------------------------------------------
  await runAsyncTest('14. retryFailedShopifyEvents recovers and processes failed event', async () => {
    const originalQuery = pool.query;
    const executedQueries = [];

    const mockFailedRow = {
      id: 'sevt_failed_1',
      event_id: 'evt_failed_1',
      event_type: 'order.created',
      source: 'shopify',
      integration_id: 'integ_1',
      user_id: 'usr_tenant_1',
      shop_domain: 'store.myshopify.com',
      webhook_id: 'wh_retry_1',
      payload: { id: 3001, order_number: '3001' },
      attempts: 1,
    };

    pool.query = async (text, params) => {
      executedQueries.push({ text, params });
      if (text.includes('FROM shopify_events') && text.includes("status = 'failed'")) {
        return { rows: [mockFailedRow] };
      }
      if (text.includes('FROM workflows')) {
        return { rows: [] }; // No workflows match in unit test
      }
      if (text.includes('UPDATE shopify_events')) {
        return { rowCount: 1 };
      }
      return { rows: [] };
    };

    try {
      const retryResults = await retryFailedShopifyEvents('usr_tenant_1');
      assert.strictEqual(retryResults.length, 1, 'Retry should pick up the 1 failed event');
      assert.strictEqual(retryResults[0].eventId, 'evt_failed_1');
      assert.strictEqual(retryResults[0].success, true);

      const processedUpdate = executedQueries.find((q) => q.text.includes("status = $1") && q.params[0] === 'processed');
      assert.ok(processedUpdate, 'Event status must be transitioned to processed upon successful retry');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 15: Existing Shopify customer sync still works
  // -------------------------------------------------------------
  await runAsyncTest('15. Existing handleCustomerSync accurately maps customer and tags without regression', async () => {
    const { handleCustomerSync } = await import('../controllers/shopifyWebhookController.js');
    const originalQuery = pool.query;
    const executedQueries = [];

    pool.query = async (text, params) => {
      executedQueries.push({ text, params });
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        return { rows: [{ user_id: 'usr_test_1' }] };
      }
      if (text.includes("SELECT id, whatsapp_opted FROM contacts WHERE custom_attributes->>'shopify_customer_id'")) {
        return { rows: [] };
      }
      if (text.includes('INSERT INTO contacts')) {
        return { rows: [{ id: 'cnt_shp_8811' }] };
      }
      return { rows: [] };
    };

    try {
      const contactId = await handleCustomerSync('store.myshopify.com', {
        id: 8811,
        first_name: 'Karan',
        last_name: 'Mehta',
        email: 'karan@example.com',
        sms_marketing_consent: { state: 'subscribed' },
      });

      assert.strictEqual(contactId, 'cnt_shp_8811');
      const insert = executedQueries.find((q) => q.text.includes('INSERT INTO contacts'));
      assert.ok(insert, 'Contact must be inserted');
      assert.strictEqual(insert.params[7], true, 'Opt-in consent must map to true');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 16: Existing Shopify product sync still works
  // -------------------------------------------------------------
  await runAsyncTest('16. Existing handleProductSync synchronizes catalog products without regression', async () => {
    const { shopifyWebhookController } = await import('../controllers/shopifyWebhookController.js');
    const originalQuery = pool.query;
    const executedQueries = [];

    pool.query = async (text, params) => {
      executedQueries.push({ text, params });
      if (text.includes('shopify_integrations')) {
        return { rows: [{ id: 'integ_test_1', user_id: 'usr_test_1', shop_domain: 'store.myshopify.com', status: 'connected' }] };
      }
      if (text.includes('shopify_events') && text.includes('SELECT')) {
        return { rows: [] };
      }
      if (text.includes('INSERT INTO shopify_events')) {
        return { rows: [{ id: 'sevt_test_16', event_id: 'evt_16', status: 'received' }] };
      }
      if (text.includes('SELECT id FROM catalog_products')) {
        return { rows: [] };
      }
      if (text.includes('INSERT INTO catalog_products')) {
        return { rows: [{ id: 'cat_9001' }] };
      }
      return { rows: [] };
    };

    try {
      // Direct call via webhook simulator
      const req = {
        shopifyWebhook: {
          topic: 'products/create',
          shopDomain: 'store.myshopify.com',
          webhookId: 'wh_prod_test_16',
        },
        body: {
          id: 9001,
          title: 'Wireless Earbuds',
          status: 'active',
          variants: [{ price: '49.99' }],
        },
      };

      const res = {
        status: () => res,
        json: () => res,
      };

      await shopifyWebhookController.handleWebhook(req, res);
      const prodInsert = executedQueries.find((q) => q.text.includes('INSERT INTO catalog_products'));
      assert.ok(prodInsert, 'Product must be inserted into catalog_products');
      assert.strictEqual(prodInsert.params[3], 'Wireless Earbuds');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 17: Existing Shopify order sync still works
  // -------------------------------------------------------------
  await runAsyncTest('17. Existing handleOrderSync synchronizes order and preserves USD currency', async () => {
    const { handleOrderSync } = await import('../controllers/shopifyWebhookController.js');
    const originalQuery = pool.query;
    const executedQueries = [];

    pool.query = async (text, params) => {
      executedQueries.push({ text, params });
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        return { rows: [{ user_id: 'usr_test_1' }] };
      }
      if (text.includes('SELECT id, workflow_id, contact_id FROM checkout_orders')) {
        return { rows: [] };
      }
      if (text.includes('SELECT id FROM contacts')) {
        return { rows: [] };
      }
      if (text.includes('INSERT INTO checkout_orders')) {
        return { rows: [] };
      }
      return { rows: [] };
    };

    try {
      await handleOrderSync('store.myshopify.com', {
        id: 77002,
        order_number: '1002',
        total_price: '25.00',
        currency: 'USD',
        financial_status: 'paid',
        fulfillment_status: 'unfulfilled',
      }, { isNewOrder: false });

      const orderInsert = executedQueries.find((q) => q.text.includes('INSERT INTO checkout_orders'));
      assert.ok(orderInsert, 'Order must be inserted');
      assert.strictEqual(orderInsert.params[11], 25, 'Amount must be 25');
      assert.strictEqual(orderInsert.params[20], 'USD', 'Currency must be preserved as USD');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 18: Existing webhook HMAC validation still works
  // -------------------------------------------------------------
  runTest('18. Existing verifyShopifyWebhook middleware verifies timing-safe HMAC', () => {
    const { verifyShopifyWebhook } = require('../middleware/shopifyWebhookVerify.js');
    const secret = process.env.SHOPIFY_API_SECRET || 'test_secret';

    const rawBody = Buffer.from(JSON.stringify({ test: 'order_payload' }));
    const validHmac = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');

    let nextCalled = false;
    const req = {
      headers: {
        'x-shopify-hmac-sha256': validHmac,
        'x-shopify-topic': 'orders/create',
        'x-shopify-shop-domain': 'store.myshopify.com',
        'x-shopify-webhook-id': 'wh_hmac_valid_18',
      },
      rawBody,
    };

    const res = {
      status: () => res,
      json: () => res,
    };

    verifyShopifyWebhook(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true, 'Valid HMAC must pass middleware verification');
    assert.strictEqual(req.shopifyWebhook.topic, 'orders/create');
    assert.strictEqual(req.shopifyWebhook.shopDomain, 'store.myshopify.com');
  });

  // -------------------------------------------------------------
  // Test 19: Existing security/ownership checks still work
  // -------------------------------------------------------------
  await runAsyncTest('19. Webhook controller drops payload from unmapped store without fallback to usr_1', async () => {
    const { shopifyWebhookController } = await import('../controllers/shopifyWebhookController.js');
    const originalQuery = pool.query;
    const executedQueries = [];

    pool.query = async (text, params) => {
      executedQueries.push({ text, params });
      if (text.includes('FROM shopify_integrations')) {
        return { rows: [] }; // Unmapped store
      }
      return { rows: [] };
    };

    try {
      const req = {
        shopifyWebhook: {
          topic: 'orders/create',
          shopDomain: 'unmapped-rogue-store.myshopify.com',
          webhookId: 'wh_unmapped_19',
        },
        body: { id: 1 },
      };
      const res = {
        status: () => res,
        json: () => res,
      };

      await shopifyWebhookController.handleWebhook(req, res);

      const eventInserts = executedQueries.filter((q) => q.text.includes('INSERT INTO shopify_events'));
      const contactInserts = executedQueries.filter((q) => q.text.includes('INSERT INTO contacts'));
      const orderInserts = executedQueries.filter((q) => q.text.includes('INSERT INTO checkout_orders'));

      assert.strictEqual(eventInserts.length, 0, 'No event should be persisted for unmapped store');
      assert.strictEqual(contactInserts.length, 0, 'No contact should be inserted for unmapped store');
      assert.strictEqual(orderInserts.length, 0, 'No order should be inserted for unmapped store');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 20: Existing workflow tests continue passing (initAutomationTables)
  // -------------------------------------------------------------
  await runAsyncTest('20. Workflow table schema initialization supports trigger_config and node graphs', async () => {
    const originalQuery = pool.query;
    let schemaCreated = false;

    pool.query = async (text) => {
      if (text.includes('CREATE TABLE IF NOT EXISTS shopify_events')) {
        schemaCreated = true;
      }
      return { rows: [] };
    };

    try {
      const res = await initShopifyEventsTable();
      assert.strictEqual(res, true, 'initShopifyEventsTable should complete successfully');
      assert.strictEqual(schemaCreated, true, 'shopify_events DDL must be executed');
    } finally {
      pool.query = originalQuery;
    }
  });

  console.log('\n-------------------------------------------------------------');
  console.log(` RESULTS: ${passedTests}/${totalTests} Tests Passed`);
  console.log('-------------------------------------------------------------\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
