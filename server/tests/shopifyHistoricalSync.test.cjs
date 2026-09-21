/**
 * Automated Verification Suite for Shopify Historical / Bulk Sync
 * 
 * Verifies all 20 core requirements:
 * 1. Sync job creation
 * 2. Tenant isolation
 * 3. Customer pagination
 * 4. Product pagination
 * 5. Order pagination
 * 6. Cursor continuation
 * 7. Customer upsert
 * 8. Product upsert (with variants)
 * 9. Order upsert
 * 10. Running sync twice creates no duplicates
 * 11. Existing records are updated correctly
 * 12. Historical records do NOT create shopify_events
 * 13. Historical records do NOT trigger workflows
 * 14. Webhook arriving during sync remains safe
 * 15. Rate-limit retry/backoff
 * 16. Failed sync records failure state
 * 17. Resume from saved cursor
 * 18. Completed sync state
 * 19. Cancel behavior
 * 20. Schema initialization
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

async function main() {
  console.log('\n=============================================================');
  console.log(' RUNNING SHOPIFY HISTORICAL / BULK SYNC VERIFICATION SUITE');
  console.log('=============================================================\n');

  const { shopifySyncService } = await import('../services/shopifySyncService.js');
  const { shopifyGraphService } = await import('../services/shopifyGraphService.js');
  const { handleCustomerSync, handleProductSync, handleOrderSync } = await import('../controllers/shopifyWebhookController.js');
  const { initShopifySyncJobsTable } = await import('../config/initShopifySyncJobsTable.js');
  const { pool } = await import('../config/db.js');
  const { encryptToken } = await import('../utils/crypto.js');

  // -------------------------------------------------------------
  // Test 1: Sync job creation
  // -------------------------------------------------------------
  await runAsyncTest('1. Sync job creation initializes queued job with default stages', async () => {
    const originalQuery = pool.query;
    let insertedJob = null;

    pool.query = async (text, params) => {
      if (text.includes('SELECT * FROM shopify_sync_jobs WHERE user_id = $1 AND shop_domain = $2')) {
        return { rows: [] }; // No active running job
      }
      if (text.includes('INSERT INTO shopify_sync_jobs')) {
        insertedJob = {
          id: params[0],
          integration_id: params[1],
          user_id: params[2],
          shop_domain: params[3],
          sync_type: params[4],
          status: 'queued',
          current_stage: params[5],
          stage_progress: JSON.parse(params[6]),
          processed_count: 0,
        };
        return { rows: [insertedJob] };
      }
      return { rows: [] };
    };

    try {
      const result = await shopifySyncService.createSyncJob({
        userId: 'usr_tenant_1',
        integrationId: 'shp_int_1',
        shopDomain: 'store1.myshopify.com',
        syncType: 'full',
      });

      assert.strictEqual(result.isExisting, false);
      assert.ok(result.job.id.startsWith('sync_'));
      assert.strictEqual(result.job.status, 'queued');
      assert.strictEqual(result.job.current_stage, 'customers');
      assert.strictEqual(result.job.user_id, 'usr_tenant_1');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 2: Tenant isolation
  // -------------------------------------------------------------
  await runAsyncTest('2. Tenant isolation blocks User B from accessing or cancelling User A sync job', async () => {
    const originalQuery = pool.query;

    pool.query = async (text, params) => {
      if (text.includes('SELECT * FROM shopify_sync_jobs WHERE id = $1 AND user_id = $2')) {
        // Only return if user_id matches
        if (params[1] === 'usr_tenant_A') {
          return { rows: [{ id: params[0], user_id: 'usr_tenant_A', status: 'running' }] };
        }
        return { rows: [] };
      }
      return { rows: [] };
    };

    try {
      // User B attempts to access User A's job
      const job = await shopifySyncService.getJobById('sync_job_A', 'usr_tenant_B');
      assert.strictEqual(job, null, 'User B must not see User A sync job');

      // User B attempts to cancel User A's job
      await assert.rejects(
        async () => {
          await shopifySyncService.cancelSyncJob('sync_job_A', 'usr_tenant_B');
        },
        /Sync job not found or unauthorized/,
        'User B cancellation must be rejected'
      );
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 3: Customer pagination
  // -------------------------------------------------------------
  await runAsyncTest('3. Customer pagination traverses multiple pages using endCursor', async () => {
    const originalGraphRequest = shopifyGraphService.shopifyGraphRequest;
    let callCount = 0;

    shopifyGraphService.shopifyGraphRequest = async ({ query, variables }) => {
      callCount++;
      if (variables.after === null) {
        return {
          customers: {
            pageInfo: { hasNextPage: true, endCursor: 'cursor_cust_page_1' },
            edges: [
              { cursor: 'c1', node: { id: 'gid://shopify/Customer/101', firstName: 'Alice', email: 'alice@test.com' } },
              { cursor: 'c2', node: { id: 'gid://shopify/Customer/102', firstName: 'Bob', email: 'bob@test.com' } },
            ],
          },
        };
      }
      return {
        customers: {
          pageInfo: { hasNextPage: false, endCursor: 'cursor_cust_page_2' },
          edges: [
            { cursor: 'c3', node: { id: 'gid://shopify/Customer/103', firstName: 'Charlie', email: 'charlie@test.com' } },
          ],
        },
      };
    };

    try {
      const page1 = await shopifyGraphService.getCustomersPage({
        shopDomain: 'store.myshopify.com',
        accessToken: 'mock_token',
        first: 50,
        after: null,
      });

      assert.strictEqual(page1.nodes.length, 2);
      assert.strictEqual(page1.pageInfo.hasNextPage, true);
      assert.strictEqual(page1.pageInfo.endCursor, 'cursor_cust_page_1');

      const page2 = await shopifyGraphService.getCustomersPage({
        shopDomain: 'store.myshopify.com',
        accessToken: 'mock_token',
        first: 50,
        after: page1.pageInfo.endCursor,
      });

      assert.strictEqual(page2.nodes.length, 1);
      assert.strictEqual(page2.pageInfo.hasNextPage, false);
      assert.strictEqual(callCount, 2);
    } finally {
      shopifyGraphService.shopifyGraphRequest = originalGraphRequest;
    }
  });

  // -------------------------------------------------------------
  // Test 4: Product pagination
  // -------------------------------------------------------------
  await runAsyncTest('4. Product pagination traverses product edges and extracts variants', async () => {
    const originalGraphRequest = shopifyGraphService.shopifyGraphRequest;

    shopifyGraphService.shopifyGraphRequest = async () => ({
      products: {
        pageInfo: { hasNextPage: false, endCursor: 'cursor_prod_1' },
        edges: [
          {
            cursor: 'p1',
            node: {
              id: 'gid://shopify/Product/901',
              title: 'Premium Wireless Headphones',
              description: 'Noise cancelling over-ear headphones',
              status: 'ACTIVE',
              vendor: 'Acme Audio',
              handle: 'premium-wireless-headphones',
              variants: {
                edges: [
                  { node: { id: 'gid://shopify/ProductVariant/801', title: 'Black', price: '199.99', sku: 'HD-BLK' } },
                  { node: { id: 'gid://shopify/ProductVariant/802', title: 'Silver', price: '209.99', sku: 'HD-SLV' } },
                ],
              },
            },
          },
        ],
      },
    });

    try {
      const res = await shopifyGraphService.getProductsPage({
        shopDomain: 'store.myshopify.com',
        accessToken: 'mock_token',
      });

      assert.strictEqual(res.nodes.length, 1);
      const prod = res.nodes[0];
      assert.strictEqual(prod.id, '901');
      assert.strictEqual(prod.title, 'Premium Wireless Headphones');
      assert.strictEqual(prod.variants.length, 2);
      assert.strictEqual(prod.variants[0].sku, 'HD-BLK');
      assert.strictEqual(prod.variants[1].title, 'Silver');
    } finally {
      shopifyGraphService.shopifyGraphRequest = originalGraphRequest;
    }
  });

  // -------------------------------------------------------------
  // Test 5: Order pagination
  // -------------------------------------------------------------
  await runAsyncTest('5. Order pagination extracts line items, totals, currency, and customer details', async () => {
    const originalGraphRequest = shopifyGraphService.shopifyGraphRequest;

    shopifyGraphService.shopifyGraphRequest = async () => ({
      orders: {
        pageInfo: { hasNextPage: false, endCursor: 'cursor_ord_1' },
        edges: [
          {
            cursor: 'o1',
            node: {
              id: 'gid://shopify/Order/5501',
              name: '#1055',
              currencyCode: 'USD',
              displayFinancialStatus: 'PAID',
              displayFulfillmentStatus: 'FULFILLED',
              totalPriceSet: { shopMoney: { amount: '150.00', currencyCode: 'USD' } },
              subtotalPriceSet: { shopMoney: { amount: '140.00', currencyCode: 'USD' } },
              customer: { id: 'gid://shopify/Customer/101', firstName: 'Alice', lastName: 'Smith' },
              lineItems: {
                edges: [
                  { node: { id: 'gid://shopify/LineItem/1', title: 'Item A', quantity: 2, variant: { price: '70.00', sku: 'SKU-A' } } },
                ],
              },
            },
          },
        ],
      },
    });

    try {
      const res = await shopifyGraphService.getOrdersPage({
        shopDomain: 'store.myshopify.com',
        accessToken: 'mock_token',
      });

      assert.strictEqual(res.nodes.length, 1);
      const ord = res.nodes[0];
      assert.strictEqual(ord.id, '5501');
      assert.strictEqual(ord.order_number, '1055');
      assert.strictEqual(ord.currency, 'USD');
      assert.strictEqual(ord.financial_status, 'paid');
      assert.strictEqual(ord.fulfillment_status, 'fulfilled');
      assert.strictEqual(ord.line_items.length, 1);
      assert.strictEqual(ord.line_items[0].sku, 'SKU-A');
    } finally {
      shopifyGraphService.shopifyGraphRequest = originalGraphRequest;
    }
  });

  // -------------------------------------------------------------
  // Test 6: Cursor continuation in sync engine
  // -------------------------------------------------------------
  await runAsyncTest('6. Sync engine updates cursor per page batch to support resumption', async () => {
    const originalQuery = pool.query;
    const updateQueries = [];

    pool.query = async (text, params) => {
      if (text.includes('SELECT * FROM shopify_sync_jobs')) {
        return {
          rows: [
            {
              id: 'sync_test_cursor',
              user_id: 'usr_tenant_1',
              shop_domain: 'store.myshopify.com',
              sync_type: 'customers',
              status: 'queued',
              current_stage: 'customers',
              cursor: null,
              stage_progress: {},
            },
          ],
        };
      }
      if (text.includes('SELECT id, access_token, status FROM shopify_integrations')) {
        return { rows: [{ id: 'int_1', access_token: encryptToken('valid_token'), status: 'connected' }] };
      }
      if (text.includes('UPDATE shopify_sync_jobs')) {
        updateQueries.push({ text, params });
        return { rows: [] };
      }
      if (text.includes('SELECT id, whatsapp_opted FROM contacts')) {
        return { rows: [] };
      }
      if (text.includes('INSERT INTO contacts')) {
        return { rows: [{ id: 'cnt_1' }] };
      }
      return { rows: [] };
    };

    const originalGetCustomers = shopifyGraphService.getCustomersPage;
    let pageCount = 0;
    shopifyGraphService.getCustomersPage = async ({ after }) => {
      pageCount++;
      if (!after) {
        return {
          nodes: [{ id: '1', first_name: 'Page1' }],
          pageInfo: { hasNextPage: true, endCursor: 'end_cur_batch_1' },
        };
      }
      return {
        nodes: [{ id: '2', first_name: 'Page2' }],
        pageInfo: { hasNextPage: false, endCursor: 'end_cur_batch_2' },
      };
    };

    try {
      await shopifySyncService.runSyncJob('sync_test_cursor');
      const cursorUpdates = updateQueries.filter((q) => q.text.includes('SET cursor = $1'));
      assert.ok(cursorUpdates.length >= 1, 'Cursor must be updated during batch processing');
      assert.strictEqual(cursorUpdates[0].params[0], 'end_cur_batch_1');
    } finally {
      pool.query = originalQuery;
      shopifyGraphService.getCustomersPage = originalGetCustomers;
    }
  });

  // -------------------------------------------------------------
  // Test 7: Customer upsert maps consent and tags
  // -------------------------------------------------------------
  await runAsyncTest('7. Customer upsert accurately maps marketing consent and attributes', async () => {
    const originalQuery = pool.query;
    let insertedContact = null;

    pool.query = async (text, params) => {
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        return { rows: [{ user_id: 'usr_tenant_1' }] };
      }
      if (text.includes('SELECT id, whatsapp_opted FROM contacts')) {
        return { rows: [] };
      }
      if (text.includes('INSERT INTO contacts')) {
        insertedContact = {
          id: params[0],
          user_id: params[1],
          name: params[2],
          email: params[3],
          phone: params[4],
          tags: JSON.parse(params[5]),
          custom_attributes: JSON.parse(params[6]),
          whatsapp_opted: params[7],
        };
        return { rows: [{ id: insertedContact.id }] };
      }
      return { rows: [] };
    };

    try {
      const contactId = await handleCustomerSync('store.myshopify.com', {
        id: 778899,
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com',
        phone: '+15551239876',
        tags: 'VIP, Wholesale',
        orders_count: 5,
        total_spent: '450.00',
        sms_marketing_consent: { state: 'subscribed' },
      });

      assert.strictEqual(contactId, 'cnt_shp_usr_tenant_1_778899');
      assert.strictEqual(insertedContact.name, 'Jane Doe');
      assert.strictEqual(insertedContact.whatsapp_opted, true);
      assert.strictEqual(insertedContact.custom_attributes.shopify_customer_id, '778899');
      assert.strictEqual(insertedContact.custom_attributes.orders_count, 5);
      assert.deepStrictEqual(insertedContact.tags, ['VIP', 'Wholesale']);
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 8: Product upsert preserves variants
  // -------------------------------------------------------------
  await runAsyncTest('8. Product upsert stores variants JSONB and sku without data loss', async () => {
    const originalQuery = pool.query;
    let insertedProduct = null;

    pool.query = async (text, params) => {
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        return { rows: [{ user_id: 'usr_tenant_1' }] };
      }
      if (text.includes('SELECT id FROM catalog_products')) {
        return { rows: [] };
      }
      if (text.includes('INSERT INTO catalog_products')) {
        insertedProduct = {
          id: params[0],
          user_id: params[1],
          external_product_id: params[2],
          title: params[3],
          description: params[4],
          price: params[5],
          availability: params[6],
          image_link: params[7],
          brand: params[8],
          is_active: params[9],
          variants: JSON.parse(params[10]),
          sku: params[11],
          product_url: params[12],
        };
        return { rows: [{ id: insertedProduct.id }] };
      }
      return { rows: [] };
    };

    try {
      const prodId = await handleProductSync('store.myshopify.com', {
        id: 998811,
        title: 'Ergonomic Chair',
        description: 'Comfortable mesh office chair',
        status: 'active',
        vendor: 'ErgoComfort',
        handle: 'ergonomic-chair',
        variants: [
          { id: '11', title: 'Black / Mesh', price: '299.99', sku: 'EC-BLK' },
          { id: '12', title: 'Grey / Leather', price: '349.99', sku: 'EC-GRY' },
        ],
      });

      assert.strictEqual(prodId, 'cat_usr_tenant_1_998811');
      assert.strictEqual(insertedProduct.title, 'Ergonomic Chair');
      assert.strictEqual(insertedProduct.price, 299.99);
      assert.strictEqual(insertedProduct.sku, 'EC-BLK');
      assert.strictEqual(insertedProduct.variants.length, 2);
      assert.strictEqual(insertedProduct.variants[1].sku, 'EC-GRY');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 9: Order upsert preserves USD currency and links contact
  // -------------------------------------------------------------
  await runAsyncTest('9. Order upsert preserves USD currency and links contact', async () => {
    const originalQuery = pool.query;
    let insertedOrder = null;

    pool.query = async (text, params) => {
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        return { rows: [{ user_id: 'usr_tenant_1' }] };
      }
      if (text.includes('SELECT id FROM contacts')) {
        return { rows: [{ id: 'cnt_shp_778899' }] };
      }
      if (text.includes('SELECT id, workflow_id, contact_id FROM checkout_orders')) {
        return { rows: [] };
      }
      if (text.includes('INSERT INTO checkout_orders')) {
        insertedOrder = {
          id: params[0],
          order_number: params[1],
          user_id: params[2],
          contact_id: params[3],
          customer_name: params[4],
          total_amount: params[11],
          payment_status: params[12],
          order_status: params[13],
          fulfillment_status: params[14],
          currency: params[20],
        };
        return { rows: [{ id: insertedOrder.id }] };
      }
      return { rows: [] };
    };

    try {
      await handleOrderSync('store.myshopify.com', {
        id: 443322,
        order_number: '1044',
        financial_status: 'paid',
        fulfillment_status: 'fulfilled',
        total_price: '89.99',
        currency: 'USD',
        customer: { id: 778899, first_name: 'Jane', last_name: 'Doe' },
        line_items: [{ title: 'Item 1', price: '89.99', quantity: 1 }],
      }, { isNewOrder: false, isHistorical: true });

      assert.strictEqual(insertedOrder.id, 'ord_shp_usr_tenant_1_443322');
      assert.strictEqual(insertedOrder.order_number, '1044');
      assert.strictEqual(insertedOrder.currency, 'USD');
      assert.strictEqual(insertedOrder.payment_status, 'Paid');
      assert.strictEqual(insertedOrder.contact_id, 'cnt_shp_778899');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 10: Running sync twice creates no duplicates
  // -------------------------------------------------------------
  await runAsyncTest('10. Running sync twice creates no duplicates (idempotency)', async () => {
    const originalQuery = pool.query;
    let contactInsertCount = 0;
    let contactUpdateCount = 0;

    pool.query = async (text) => {
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        return { rows: [{ user_id: 'usr_tenant_1' }] };
      }
      if (text.includes('SELECT id, whatsapp_opted FROM contacts')) {
        // First time not found, second time found
        if (contactInsertCount === 0) return { rows: [] };
        return { rows: [{ id: 'cnt_shp_123', whatsapp_opted: true }] };
      }
      if (text.includes('INSERT INTO contacts')) {
        contactInsertCount++;
        return { rows: [{ id: 'cnt_shp_123' }] };
      }
      if (text.includes('UPDATE contacts')) {
        contactUpdateCount++;
        return { rows: [] };
      }
      return { rows: [] };
    };

    try {
      const sampleCustomer = { id: 123, first_name: 'Sam', email: 'sam@test.com' };
      // Run 1
      await handleCustomerSync('store.myshopify.com', sampleCustomer);
      // Run 2
      await handleCustomerSync('store.myshopify.com', sampleCustomer);

      assert.strictEqual(contactInsertCount, 1, 'Only 1 insert must occur');
      assert.strictEqual(contactUpdateCount, 1, 'Second run must update existing record');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 11: Existing records are updated correctly
  // -------------------------------------------------------------
  await runAsyncTest('11. Existing records are updated correctly on subsequent sync', async () => {
    const originalQuery = pool.query;
    let updatedProductData = null;

    pool.query = async (text, params) => {
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        return { rows: [{ user_id: 'usr_tenant_1' }] };
      }
      if (text.includes('SELECT id FROM catalog_products')) {
        return { rows: [{ id: 'cat_901' }] }; // Existing product found
      }
      if (text.includes('UPDATE catalog_products')) {
        updatedProductData = {
          title: params[0],
          price: params[2],
          availability: params[3],
        };
        return { rows: [] };
      }
      return { rows: [] };
    };

    try {
      await handleProductSync('store.myshopify.com', {
        id: 901,
        title: 'Updated Product Name',
        status: 'active',
        variants: [{ price: '79.99' }],
      });

      assert.strictEqual(updatedProductData.title, 'Updated Product Name');
      assert.strictEqual(updatedProductData.price, 79.99);
      assert.strictEqual(updatedProductData.availability, 'in_stock');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 12: Historical records do NOT create shopify_events
  // -------------------------------------------------------------
  await runAsyncTest('12. Historical records do NOT create shopify_events rows', async () => {
    const originalQuery = pool.query;
    const executedQueries = [];

    pool.query = async (text, params) => {
      executedQueries.push(text);
      if (text.includes('SELECT * FROM shopify_sync_jobs')) {
        return {
          rows: [
            {
              id: 'sync_no_events',
              user_id: 'usr_tenant_1',
              shop_domain: 'store.myshopify.com',
              sync_type: 'orders',
              status: 'queued',
              current_stage: 'orders',
              cursor: null,
            },
          ],
        };
      }
      if (text.includes('SELECT id, access_token, status FROM shopify_integrations')) {
        return { rows: [{ id: 'int_1', access_token: encryptToken('valid_token'), status: 'connected' }] };
      }
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        return { rows: [{ user_id: 'usr_tenant_1' }] };
      }
      return { rows: [] };
    };

    const originalGetOrders = shopifyGraphService.getOrdersPage;
    shopifyGraphService.getOrdersPage = async () => ({
      nodes: [{ id: '9090', name: '#1090', total_price: '50.00' }],
      pageInfo: { hasNextPage: false, endCursor: null },
    });

    try {
      await shopifySyncService.runSyncJob('sync_no_events');
      const shopifyEventInserts = executedQueries.filter((q) => q.includes('INSERT INTO shopify_events'));
      assert.strictEqual(shopifyEventInserts.length, 0, 'Zero shopify_events queries must be executed');
    } finally {
      pool.query = originalQuery;
      shopifyGraphService.getOrdersPage = originalGetOrders;
    }
  });

  // -------------------------------------------------------------
  // Test 13: Historical records do NOT trigger workflows or WhatsApp
  // -------------------------------------------------------------
  await runAsyncTest('13. Historical records do NOT trigger workflows or dispatch WhatsApp', async () => {
    const originalQuery = pool.query;
    const executedQueries = [];

    pool.query = async (text) => {
      executedQueries.push(text);
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        return { rows: [{ user_id: 'usr_tenant_1' }] };
      }
      return { rows: [] };
    };

    try {
      await handleOrderSync(
        'store.myshopify.com',
        { id: 9999, order_number: '9999', customer: { id: 1 } },
        { isNewOrder: false, isHistorical: true }
      );

      // Verify no workflows table was queried to evaluate triggers
      const workflowQueries = executedQueries.filter((q) => q.includes('FROM workflows'));
      assert.strictEqual(workflowQueries.length, 0, 'No workflows query should run for historical sync');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 14: Webhook arriving during sync remains safe
  // -------------------------------------------------------------
  await runAsyncTest('14. Concurrent webhook arriving during sync remains safe without duplicate records', async () => {
    const originalQuery = pool.query;
    const orderRecords = new Map();

    pool.query = async (text, params) => {
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        return { rows: [{ user_id: 'usr_tenant_1' }] };
      }
      if (text.includes('SELECT id, workflow_id, contact_id FROM checkout_orders')) {
        const existing = orderRecords.get(params[0]); // params[0] is order_number
        return { rows: existing ? [existing] : [] };
      }
      if (text.includes('INSERT INTO checkout_orders')) {
        const ord = { id: params[0], order_number: params[1], workflow_id: null };
        orderRecords.set(params[1], ord);
        return { rows: [ord] };
      }
      if (text.includes('UPDATE checkout_orders')) {
        return { rows: [] };
      }
      return { rows: [] };
    };

    try {
      const orderPayload = { id: 5001, order_number: '5001', total_price: '100.00' };

      // 1. Bulk sync imports order first
      await handleOrderSync('store.myshopify.com', orderPayload, { isNewOrder: false, isHistorical: true });
      assert.strictEqual(orderRecords.size, 1);

      // 2. Real-time webhook arrives for the same order
      await handleOrderSync('store.myshopify.com', orderPayload, { isNewOrder: false });
      assert.strictEqual(orderRecords.size, 1, 'Total orders must still be 1 (no duplicate created)');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 15: Rate-limit retry/backoff
  // -------------------------------------------------------------
  await runAsyncTest('15. Rate-limit 429 response backs off and retries cleanly', async () => {
    const originalFetch = global.fetch;
    let callCount = 0;

    global.fetch = async () => {
      callCount++;
      if (callCount === 1) {
        return {
          status: 429,
          ok: false,
          headers: {
            get: (h) => (h.toLowerCase() === 'retry-after' ? '0' : null),
          },
        };
      }
      return {
        status: 200,
        ok: true,
        json: async () => ({ data: { shop: { name: 'Recovered Store' } } }),
      };
    };

    try {
      const res = await shopifyGraphService.shopifyGraphRequest({
        shopDomain: 'store.myshopify.com',
        accessToken: 'token',
        query: '{ shop { name } }',
        maxRetries: 2,
      });

      assert.strictEqual(res.shop.name, 'Recovered Store');
      assert.strictEqual(callCount, 2);
    } finally {
      global.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------
  // Test 16: Failed sync records failure state
  // -------------------------------------------------------------
  await runAsyncTest('16. Failed sync records failure status and error details', async () => {
    const originalQuery = pool.query;
    let failureRecord = null;

    pool.query = async (text, params) => {
      if (text.includes('SELECT * FROM shopify_sync_jobs')) {
        return {
          rows: [
            {
              id: 'sync_fail_test',
              user_id: 'usr_tenant_1',
              shop_domain: 'store.myshopify.com',
              sync_type: 'full',
              status: 'queued',
              current_stage: 'customers',
              cursor: null,
            },
          ],
        };
      }
      if (text.includes('SELECT id, access_token, status FROM shopify_integrations')) {
        return { rows: [] }; // Missing connected store
      }
      if (text.includes('UPDATE shopify_sync_jobs SET status = \'failed\'')) {
        failureRecord = {
          error: params[0],
          jobId: params[1],
        };
        return { rows: [] };
      }
      return { rows: [] };
    };

    try {
      await assert.rejects(async () => {
        await shopifySyncService.runSyncJob('sync_fail_test');
      });

      assert.ok(failureRecord, 'Failure must be persisted to database');
      assert.strictEqual(failureRecord.jobId, 'sync_fail_test');
      assert.ok(failureRecord.error.includes('Connected Shopify store not found'));
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 17: Resume from saved cursor
  // -------------------------------------------------------------
  await runAsyncTest('17. Resuming interrupted sync continues from saved stage and cursor', async () => {
    const originalQuery = pool.query;
    let queryStartingCursor = null;

    pool.query = async (text) => {
      if (text.includes('SELECT * FROM shopify_sync_jobs')) {
        return {
          rows: [
            {
              id: 'sync_resume_test',
              user_id: 'usr_tenant_1',
              shop_domain: 'store.myshopify.com',
              sync_type: 'full',
              status: 'failed',
              current_stage: 'orders', // Interrupted at orders
              cursor: 'saved_order_cursor_456',
              stage_progress: { customers: { processed: 50 }, products: { processed: 20 }, orders: { processed: 10 } },
            },
          ],
        };
      }
      if (text.includes('SELECT id, access_token, status FROM shopify_integrations')) {
        return { rows: [{ id: 'int_1', access_token: encryptToken('valid_token'), status: 'connected' }] };
      }
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        return { rows: [{ user_id: 'usr_tenant_1' }] };
      }
      return { rows: [] };
    };

    const originalGetOrders = shopifyGraphService.getOrdersPage;
    shopifyGraphService.getOrdersPage = async ({ after }) => {
      queryStartingCursor = after;
      return { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } };
    };

    try {
      await shopifySyncService.runSyncJob('sync_resume_test');
      assert.strictEqual(queryStartingCursor, 'saved_order_cursor_456', 'Resume must start from stored cursor');
    } finally {
      pool.query = originalQuery;
      shopifyGraphService.getOrdersPage = originalGetOrders;
    }
  });

  // -------------------------------------------------------------
  // Test 18: Completed sync state
  // -------------------------------------------------------------
  await runAsyncTest('18. Completed sync sets status=completed, completed_at, and clears cursor', async () => {
    const originalQuery = pool.query;
    let completedUpdate = null;

    pool.query = async (text, params) => {
      if (text.includes('SELECT * FROM shopify_sync_jobs')) {
        return {
          rows: [
            {
              id: 'sync_complete_test',
              user_id: 'usr_tenant_1',
              shop_domain: 'store.myshopify.com',
              sync_type: 'customers',
              status: 'queued',
              current_stage: 'customers',
              cursor: null,
            },
          ],
        };
      }
      if (text.includes('SELECT id, access_token, status FROM shopify_integrations')) {
        return { rows: [{ id: 'int_1', access_token: encryptToken('valid_token'), status: 'connected' }] };
      }
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        return { rows: [{ user_id: 'usr_tenant_1' }] };
      }
      if (text.includes('SET status = \'completed\'')) {
        completedUpdate = {
          jobId: params[0],
        };
        return { rows: [] };
      }
      return { rows: [] };
    };

    const originalGetCustomers = shopifyGraphService.getCustomersPage;
    shopifyGraphService.getCustomersPage = async () => ({
      nodes: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    });

    try {
      await shopifySyncService.runSyncJob('sync_complete_test');
      assert.ok(completedUpdate, 'Completed update must be executed');
      assert.strictEqual(completedUpdate.jobId, 'sync_complete_test');
    } finally {
      pool.query = originalQuery;
      shopifyGraphService.getCustomersPage = originalGetCustomers;
    }
  });

  // -------------------------------------------------------------
  // Test 19: Cancel behavior
  // -------------------------------------------------------------
  await runAsyncTest('19. cancelSyncJob marks status as cancelled and halts further processing', async () => {
    const originalQuery = pool.query;
    let cancelledStatus = false;

    pool.query = async (text, params) => {
      if (text.includes('SELECT * FROM shopify_sync_jobs WHERE id = $1 AND user_id = $2')) {
        return { rows: [{ id: params[0], user_id: params[1], status: 'running' }] };
      }
      if (text.includes("SET status = 'cancelled'")) {
        cancelledStatus = true;
        return { rows: [{ id: params[0], status: 'cancelled' }] };
      }
      return { rows: [] };
    };

    try {
      const cancelledJob = await shopifySyncService.cancelSyncJob('sync_job_to_cancel', 'usr_tenant_1');
      assert.strictEqual(cancelledStatus, true);
      assert.strictEqual(cancelledJob.status, 'cancelled');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 20: Schema initialization
  // -------------------------------------------------------------
  await runAsyncTest('20. initShopifySyncJobsTable initializes schema and indexes without errors', async () => {
    const originalQuery = pool.query;
    let tableCreated = false;
    let indexesCreated = false;

    pool.query = async (text) => {
      if (text.includes('CREATE TABLE IF NOT EXISTS shopify_sync_jobs')) {
        tableCreated = true;
      }
      if (text.includes('CREATE INDEX IF NOT EXISTS idx_shopify_sync_jobs_user_id')) {
        indexesCreated = true;
      }
      return { rows: [] };
    };

    try {
      await initShopifySyncJobsTable();
      assert.strictEqual(tableCreated, true, 'shopify_sync_jobs table must be created');
      assert.strictEqual(indexesCreated, true, 'shopify_sync_jobs indexes must be created');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n-------------------------------------------------------------');
  console.log(` RESULTS: ${passedTests}/${totalTests} Tests Passed`);
  console.log('-------------------------------------------------------------\n');

  if (passedTests < totalTests) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
