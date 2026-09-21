/**
 * Phase 1: Multi-Tenant Data Isolation Regression Test Suite
 * 
 * Verifies:
 * 1. Customer cross-tenant isolation (ID 123)
 * 2. Order -> contact linking cross-tenant isolation (shared email & phone)
 * 3. Order ID namespace isolation (Order ID 999)
 * 4. Product ID namespace isolation (Product ID 555)
 * 5. Guest contact ID namespace isolation (Order 888)
 * 6. Disconnected shop takeover prevention (Tenant B blocked from claiming Tenant A's disconnected shop)
 * 7. Reconnection allowed for original owning tenant (Tenant A)
 * 8. Elimination of legacy global singleton `integrations WHERE id = 'main'` from Shopify workflows
 * 9. Customer PII redaction GDPR webhook tenant scoping
 */

const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
    if (err.stack) console.error(err.stack);
  }
}

function createMocks({ body = {}, query = {}, params = {}, headers = {}, user = null, shopify = null } = {}) {
  let statusCode = 200;
  let jsonResponse = null;

  const req = {
    body,
    query,
    params,
    headers,
    user,
    shopify,
  };

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResponse = data;
      return this;
    },
  };

  return {
    req,
    res,
    getStatus: () => statusCode,
    getJson: () => jsonResponse,
  };
}

async function main() {
  console.log('\n=============================================================');
  console.log(' RUNNING SHOPIFY MULTI-TENANT DATA ISOLATION TEST SUITE');
  console.log('=============================================================\n');

  const { pool } = await import('../config/db.js');
  const {
    handleCustomerSync,
    handleOrderSync,
    handleProductSync,
    shopifyWebhookController,
  } = await import('../controllers/shopifyWebhookController.js');
  const { integrationController } = await import('../controllers/integrationController.js');

  const TENANT_A_ID = 'usr_tenant_alpha';
  const TENANT_B_ID = 'usr_tenant_beta';
  const SHOP_A = 'store-alpha.myshopify.com';
  const SHOP_B = 'store-beta.myshopify.com';

  // -------------------------------------------------------------
  // Test 1: Customer Cross-Tenant Isolation
  // Tenant A & Tenant B both have customer ID 123
  // B's webhook must NEVER see, modify, or overwrite A's contact
  // -------------------------------------------------------------
  await runAsyncTest('1. Tenant B customer webhook with Shopify ID 123 cannot modify Tenant A contact', async () => {
    const originalQuery = pool.query;
    const dbContacts = [];
    const executedQueries = [];

    // Pre-populate Tenant A's contact with Shopify ID 123
    dbContacts.push({
      id: `cnt_shp_${TENANT_A_ID}_123`,
      user_id: TENANT_A_ID,
      name: 'Alpha Customer',
      email: 'alpha@example.com',
      phone: '+1111111111',
      custom_attributes: { shopify_customer_id: '123' },
      whatsapp_opted: true,
    });

    pool.query = async (text, params) => {
      executedQueries.push({ text, params });

      // Resolve user_id from shop
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        const shop = params[0];
        if (shop === SHOP_A) return { rows: [{ user_id: TENANT_A_ID }] };
        if (shop === SHOP_B) return { rows: [{ user_id: TENANT_B_ID }] };
        return { rows: [] };
      }

      // Check contact by shopify_customer_id
      if (text.includes("WHERE custom_attributes->>'shopify_customer_id' = $1 AND user_id = $2")) {
        const [custId, userId] = params;
        const match = dbContacts.find(
          (c) => c.custom_attributes?.shopify_customer_id === custId && c.user_id === userId
        );
        return { rows: match ? [match] : [] };
      }

      // Check contact by phone
      if (text.includes('WHERE phone = $1 AND user_id = $2')) {
        const [phone, userId] = params;
        const match = dbContacts.find((c) => c.phone === phone && c.user_id === userId);
        return { rows: match ? [match] : [] };
      }

      // Insert contact
      if (text.includes('INSERT INTO contacts')) {
        const newContact = {
          id: params[0],
          user_id: params[1],
          name: params[2],
          email: params[3],
          phone: params[4],
          custom_attributes: JSON.parse(params[6] || '{}'),
          whatsapp_opted: params[7],
        };
        dbContacts.push(newContact);
        return { rows: [{ id: newContact.id }] };
      }

      // Update contact
      if (text.includes('UPDATE contacts')) {
        // Look up WHERE clause params
        const userId = params[7];
        const contactId = params[6];
        const contact = dbContacts.find((c) => c.id === contactId && c.user_id === userId);
        if (contact) {
          contact.name = params[0];
          contact.email = params[1];
        }
        return { rows: contact ? [contact] : [] };
      }

      return { rows: [] };
    };

    try {
      // Tenant B receives customer 123 payload
      const customerPayloadB = {
        id: '123',
        first_name: 'Beta',
        last_name: 'Customer',
        email: 'beta@example.com',
        phone: '+2222222222',
        sms_marketing_consent: { state: 'subscribed' },
      };

      const resolvedContactIdB = await handleCustomerSync(SHOP_B, customerPayloadB);

      // Verify Tenant B created their own contact namespaced to Tenant B
      assert.strictEqual(resolvedContactIdB, `cnt_shp_${TENANT_B_ID}_123`);

      // Verify Tenant A's contact was NOT modified
      const tenantAContact = dbContacts.find((c) => c.user_id === TENANT_A_ID);
      assert.ok(tenantAContact, 'Tenant A contact must exist');
      assert.strictEqual(tenantAContact.name, 'Alpha Customer', 'Tenant A contact name must not be overwritten');
      assert.strictEqual(tenantAContact.email, 'alpha@example.com', 'Tenant A email must not be overwritten');

      // Verify every query in the customer sync scoped to user_id
      const customerQueries = executedQueries.filter((q) => q.text.includes('contacts'));
      for (const q of customerQueries) {
        assert.ok(
          q.text.includes('user_id'),
          `Customer query must explicitly enforce user_id: ${q.text}`
        );
      }
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 2: Order -> Contact Linking Cross-Tenant Isolation
  // Tenant A & Tenant B both have a contact with email test@example.com
  // Tenant B's order MUST link to Tenant B's contact, NEVER Tenant A's
  // -------------------------------------------------------------
  await runAsyncTest('2. Tenant B order with matching email test@example.com never attaches to Tenant A contact', async () => {
    const originalQuery = pool.query;
    const executedQueries = [];

    const dbContacts = [
      { id: 'cnt_alpha_test', user_id: TENANT_A_ID, email: 'test@example.com', phone: '+15551234567' },
      { id: 'cnt_beta_test', user_id: TENANT_B_ID, email: 'test@example.com', phone: '+15551234567' },
    ];

    let insertedOrder = null;

    pool.query = async (text, params) => {
      executedQueries.push({ text, params });

      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        const shop = params[0];
        if (shop === SHOP_B) return { rows: [{ user_id: TENANT_B_ID }] };
        return { rows: [] };
      }

      // Match by custom_attributes shopify_customer_id
      if (text.includes("WHERE custom_attributes->>'shopify_customer_id' = $1 AND user_id = $2")) {
        return { rows: [] };
      }

      // Match by ID
      if (text.includes('WHERE (id = $1 OR id = $2) AND user_id = $3')) {
        return { rows: [] };
      }

      // Match by phone
      if (text.includes("AND user_id = $3")) {
        const userId = params[2];
        const match = dbContacts.find((c) => c.phone === params[0] && c.user_id === userId);
        return { rows: match ? [{ id: match.id }] : [] };
      }

      // Match by email: WHERE LOWER(email) = LOWER($1) AND user_id = $2
      if (text.includes('WHERE LOWER(email) = LOWER($1) AND user_id = $2')) {
        const [email, userId] = params;
        const match = dbContacts.find((c) => c.email.toLowerCase() === email.toLowerCase() && c.user_id === userId);
        return { rows: match ? [{ id: match.id }] : [] };
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
        };
        return { rows: [{ id: insertedOrder.id }] };
      }

      return { rows: [] };
    };

    try {
      const orderPayloadB = {
        id: 7001,
        order_number: '1001',
        email: 'test@example.com',
        total_price: '50.00',
        currency: 'USD',
        financial_status: 'paid',
        fulfillment_status: 'unfulfilled',
      };

      await handleOrderSync(SHOP_B, orderPayloadB, { isNewOrder: false });

      assert.ok(insertedOrder, 'Order must be inserted');
      assert.strictEqual(insertedOrder.user_id, TENANT_B_ID, 'Order must belong to Tenant B');
      assert.strictEqual(insertedOrder.contact_id, 'cnt_beta_test', 'Order must attach to Tenant B contact');
      assert.notStrictEqual(insertedOrder.contact_id, 'cnt_alpha_test', 'Order MUST NOT attach to Tenant A contact');

      // Verify email query had tenant scoping
      const emailQuery = executedQueries.find((q) => q.text.includes('LOWER(email)'));
      assert.ok(emailQuery, 'Must query contacts by email');
      assert.ok(emailQuery.text.includes('AND user_id = $2'), 'Email query must enforce tenant isolation');
      assert.strictEqual(emailQuery.params[1], TENANT_B_ID, 'Tenant B user_id must be passed to email query');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 3: Order ID Namespace Isolation (Shopify Order ID 999)
  // Both Tenant A and Tenant B receive Shopify Order ID 999
  // Verify their internal IDs are tenant-scoped and do not collide
  // -------------------------------------------------------------
  await runAsyncTest('3. Order ID namespace isolation: Shopify order ID 999 produces unique tenant-scoped IDs', async () => {
    const originalQuery = pool.query;
    const insertedOrders = [];

    pool.query = async (text, params) => {
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        const shop = params[0];
        if (shop === SHOP_A) return { rows: [{ user_id: TENANT_A_ID }] };
        if (shop === SHOP_B) return { rows: [{ user_id: TENANT_B_ID }] };
        return { rows: [] };
      }

      if (text.includes('SELECT id, workflow_id, contact_id FROM checkout_orders')) {
        return { rows: [] };
      }

      if (text.includes('INSERT INTO checkout_orders')) {
        insertedOrders.push({
          id: params[0],
          order_number: params[1],
          user_id: params[2],
        });
        return { rows: [{ id: params[0] }] };
      }

      return { rows: [] };
    };

    try {
      const orderPayload = {
        id: 999,
        order_number: '1099',
        total_price: '120.00',
        currency: 'USD',
        financial_status: 'paid',
        fulfillment_status: 'unfulfilled',
      };

      // Sync for Tenant A
      await handleOrderSync(SHOP_A, orderPayload, { isNewOrder: false });

      // Sync for Tenant B
      await handleOrderSync(SHOP_B, orderPayload, { isNewOrder: false });

      assert.strictEqual(insertedOrders.length, 2, 'Both orders must be inserted');
      assert.strictEqual(insertedOrders[0].id, `ord_shp_${TENANT_A_ID}_999`);
      assert.strictEqual(insertedOrders[0].user_id, TENANT_A_ID);

      assert.strictEqual(insertedOrders[1].id, `ord_shp_${TENANT_B_ID}_999`);
      assert.strictEqual(insertedOrders[1].user_id, TENANT_B_ID);

      assert.notStrictEqual(insertedOrders[0].id, insertedOrders[1].id, 'Internal order IDs must never collide');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 4: Product ID Namespace Isolation (Shopify Product ID 555)
  // Both Tenant A and Tenant B receive Shopify Product ID 555
  // Verify their catalog product IDs are tenant-scoped and do not collide
  // -------------------------------------------------------------
  await runAsyncTest('4. Product ID namespace isolation: Shopify product ID 555 produces unique tenant-scoped IDs', async () => {
    const originalQuery = pool.query;
    const insertedProducts = [];

    pool.query = async (text, params) => {
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        const shop = params[0];
        if (shop === SHOP_A) return { rows: [{ user_id: TENANT_A_ID }] };
        if (shop === SHOP_B) return { rows: [{ user_id: TENANT_B_ID }] };
        return { rows: [] };
      }

      if (text.includes('SELECT id FROM catalog_products')) {
        return { rows: [] };
      }

      if (text.includes('INSERT INTO catalog_products')) {
        insertedProducts.push({
          id: params[0],
          user_id: params[1],
          title: params[2],
        });
        return { rows: [{ id: params[0] }] };
      }

      return { rows: [] };
    };

    try {
      const productPayload = {
        id: 555,
        title: 'Premium Linen Shirt',
        variants: [{ id: 101, price: '49.99', sku: 'LINEN-01' }],
      };

      // Sync for Tenant A
      await handleProductSync(SHOP_A, productPayload);

      // Sync for Tenant B
      await handleProductSync(SHOP_B, productPayload);

      assert.strictEqual(insertedProducts.length, 2, 'Both products must be inserted');
      assert.strictEqual(insertedProducts[0].id, `cat_${TENANT_A_ID}_555`);
      assert.strictEqual(insertedProducts[0].user_id, TENANT_A_ID);

      assert.strictEqual(insertedProducts[1].id, `cat_${TENANT_B_ID}_555`);
      assert.strictEqual(insertedProducts[1].user_id, TENANT_B_ID);

      assert.notStrictEqual(insertedProducts[0].id, insertedProducts[1].id, 'Catalog product IDs must never collide');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 5: Guest Contact ID Namespace Isolation
  // Order 888 has no customer object (guest checkout)
  // Verify contact ID is scoped with user_id to prevent collision
  // -------------------------------------------------------------
  await runAsyncTest('5. Guest contact ID namespace isolation: guest checkout creates tenant-scoped contact IDs', async () => {
    const originalQuery = pool.query;
    const insertedContacts = [];

    pool.query = async (text, params) => {
      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        const shop = params[0];
        if (shop === SHOP_A) return { rows: [{ user_id: TENANT_A_ID }] };
        if (shop === SHOP_B) return { rows: [{ user_id: TENANT_B_ID }] };
        return { rows: [] };
      }

      if (text.includes('SELECT id FROM contacts')) {
        return { rows: [] };
      }

      if (text.includes('INSERT INTO contacts')) {
        insertedContacts.push({
          id: params[0],
          user_id: params[1],
          name: params[2],
        });
        return { rows: [{ id: params[0] }] };
      }

      if (text.includes('SELECT id, workflow_id, contact_id FROM checkout_orders')) {
        return { rows: [] };
      }

      if (text.includes('INSERT INTO checkout_orders')) {
        return { rows: [{ id: params[0] }] };
      }

      return { rows: [] };
    };

    try {
      const guestOrder = {
        id: 888,
        order_number: '1088',
        customer: null, // No customer object
        billing_address: { first_name: 'Guest', last_name: 'User' },
        total_price: '19.99',
        currency: 'USD',
      };

      await handleOrderSync(SHOP_A, guestOrder, { isNewOrder: false });
      await handleOrderSync(SHOP_B, guestOrder, { isNewOrder: false });

      assert.strictEqual(insertedContacts.length, 2, 'Both guest contacts must be created');
      assert.strictEqual(insertedContacts[0].id, `cnt_shp_ord_${TENANT_A_ID}_888`);
      assert.strictEqual(insertedContacts[0].user_id, TENANT_A_ID);

      assert.strictEqual(insertedContacts[1].id, `cnt_shp_ord_${TENANT_B_ID}_888`);
      assert.strictEqual(insertedContacts[1].user_id, TENANT_B_ID);

      assert.notStrictEqual(insertedContacts[0].id, insertedContacts[1].id, 'Guest contact IDs must never collide');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 6: Disconnected Shop Takeover Prevention
  // Tenant A disconnected store.myshopify.com (status: 'disconnected')
  // Tenant B attempts to connect or get OAuth URL for that same store
  // MUST be rejected with HTTP 409 Conflict
  // -------------------------------------------------------------
  await runAsyncTest('6. Disconnected shop takeover prevention: Tenant B cannot claim Tenant A disconnected shop', async () => {
    const originalQuery = pool.query;
    const DISCONNECTED_SHOP = 'alpha-store.myshopify.com';

    pool.query = async (text, params) => {
      // Return disconnected store owned by Tenant A
      if (text.includes('SELECT id, user_id, status FROM shopify_integrations WHERE shop_domain = $1')) {
        return {
          rows: [
            { id: 'integ_alpha_1', user_id: TENANT_A_ID, status: 'disconnected' },
          ],
        };
      }
      return { rows: [] };
    };

    try {
      // 6A: Tenant B attempts OAuth URL initiation
      const { req: reqOAuth, res: resOAuth, getStatus: getStatusOAuth, getJson: getJsonOAuth } = createMocks({
        query: { shop: DISCONNECTED_SHOP },
        user: { id: TENANT_B_ID },
      });

      await integrationController.getShopifyOAuthUrl(reqOAuth, resOAuth, () => {});
      assert.strictEqual(getStatusOAuth(), 409, 'Must return HTTP 409 Conflict for OAuth initiation on disconnected store');
      assert.ok(
        getJsonOAuth().error.includes('already connected') || getJsonOAuth().error.includes('already connected to another ARCO account'),
        'Must indicate store is owned by another account'
      );

      // 6B: Tenant B attempts direct connect endpoint
      const { req: reqConnect, res: resConnect, getStatus: getStatusConnect, getJson: getJsonConnect } = createMocks({
        body: { shopDomain: DISCONNECTED_SHOP, accessToken: 'shpat_fake_token_123' },
        user: { id: TENANT_B_ID },
      });

      await integrationController.connectShopify(reqConnect, resConnect, () => {});
      assert.strictEqual(getStatusConnect(), 409, 'Must return HTTP 409 Conflict for connectShopify on disconnected store');
      assert.ok(
        getJsonConnect().error.includes('already connected') || getJsonConnect().error.includes('already connected to another ARCO account'),
        'Must indicate store is owned by another account'
      );
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 7: Reconnection Allowed for Original Owning Tenant (Tenant A)
  // Tenant A reconnects their own disconnected store
  // MUST succeed without 409 conflict
  // -------------------------------------------------------------
  await runAsyncTest('7. Reconnection allowed for original owning tenant (Tenant A reconnects)', async () => {
    const originalQuery = pool.query;
    const DISCONNECTED_SHOP = 'alpha-store.myshopify.com';

    pool.query = async (text, params) => {
      if (text.includes('SELECT id, user_id, status FROM shopify_integrations WHERE shop_domain = $1')) {
        return {
          rows: [
            { id: 'integ_alpha_1', user_id: TENANT_A_ID, status: 'disconnected' },
          ],
        };
      }
      return { rows: [] };
    };

    try {
      const { req: reqOAuth, res: resOAuth, getStatus: getStatusOAuth, getJson: getJsonOAuth } = createMocks({
        query: { shop: DISCONNECTED_SHOP },
        user: { id: TENANT_A_ID },
      });

      await integrationController.getShopifyOAuthUrl(reqOAuth, resOAuth, () => {});
      assert.strictEqual(getStatusOAuth(), 200, 'Original owner must receive HTTP 200 with OAuth URL');
      assert.ok(getJsonOAuth().data?.authUrl, 'Response must include OAuth URL');
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 8: Elimination of Legacy Global integrations WHERE id = 'main'
  // Verify that neither connectShopify, getShopifySession, disconnect, nor webhooks touch id = 'main'
  // -------------------------------------------------------------
  await runAsyncTest('8. Elimination of legacy global integrations record: no Shopify queries touch id = main', async () => {
    const originalQuery = pool.query;
    const touchedQueries = [];

    pool.query = async (text, params) => {
      touchedQueries.push({ text, params });
      if (text.includes('shopify_integrations') && (text.includes('user_id = $1') || text.includes('shop_domain = $1'))) {
        return {
          rows: [
            {
              id: 'integ_1',
              user_id: TENANT_A_ID,
              shop_domain: SHOP_A,
              shop_name: 'Store Alpha',
              status: 'connected',
              access_token: 'test_token',
              expires_at: new Date(Date.now() + 86400000),
              installed_at: new Date(),
            },
          ],
        };
      }
      return { rows: [] };
    };

    try {
      // 8A: Test getShopifyStatus
      const { req: reqStatus, res: resStatus, getStatus: getStatusStatus } = createMocks({
        user: { id: TENANT_A_ID },
      });
      await integrationController.getShopifyStatus(reqStatus, resStatus, () => {});
      assert.strictEqual(getStatusStatus(), 200, 'getShopifyStatus must return 200');

      // 8B: Test getShopifySession
      const { req: reqSession, res: resSession, getStatus: getStatusSession, getJson: getJsonSession } = createMocks({
        shopify: { shopDomain: SHOP_A },
        user: { id: TENANT_A_ID },
      });
      await integrationController.getShopifySession(reqSession, resSession, () => {});
      assert.strictEqual(getStatusSession(), 200, 'getShopifySession must return 200');

      // Verify no executed query touched integrations WHERE id = 'main'
      for (const q of touchedQueries) {
        assert.ok(
          !q.text.includes("integrations WHERE id = 'main'") &&
          !q.text.includes('integrations WHERE id="main"') &&
          !q.text.includes("UPDATE integrations SET config = jsonb_set(config, '{shopify}'"),
          `Shopify operation must not touch global integrations singleton: ${q.text}`
        );
      }
    } finally {
      pool.query = originalQuery;
    }
  });

  // -------------------------------------------------------------
  // Test 9: Customer PII Redaction GDPR Webhook Tenant Scoping
  // handleCustomersRedact resolves shop_domain to tenant user_id
  // and only redacts contacts for that specific user_id
  // -------------------------------------------------------------
  await runAsyncTest('9. GDPR customers/redact webhook scopes redaction strictly to the store tenant user_id', async () => {
    const originalQuery = pool.query;
    const executedQueries = [];

    pool.query = async (text, params) => {
      executedQueries.push({ text, params });

      if (text.includes('SELECT user_id FROM shopify_integrations')) {
        return { rows: [{ user_id: TENANT_A_ID }] };
      }

      if (text.includes('UPDATE contacts SET')) {
        return { rows: [] };
      }

      return { rows: [] };
    };

    try {
      const { req, res, getStatus } = createMocks({
        body: {
          shop_domain: SHOP_A,
          customer: { id: '998877' },
          orders_to_redact: [],
        },
      });

      await shopifyWebhookController.handleCustomersRedact(req, res);
      assert.strictEqual(getStatus(), 200);

      const updateQuery = executedQueries.find((q) => q.text.includes('UPDATE contacts'));
      assert.ok(updateQuery, 'Must execute UPDATE contacts query for redaction');
      assert.ok(
        updateQuery.text.includes('AND user_id = $2'),
        'Redaction query must strictly include user_id filter'
      );
      assert.strictEqual(updateQuery.params[1], TENANT_A_ID, 'user_id param must match the store owner');
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
  console.error('Fatal error in multi-tenant isolation tests:', err);
  process.exit(1);
});
