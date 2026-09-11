const assert = require('assert');

async function runTests() {
  console.log('\n=============================================================');
  console.log(' RUNNING SHOPIFY ORDER CURRENCY VERIFICATION SUITE');
  console.log('=============================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}:`, err.message);
    }
  }

  const { pool } = await import('../config/db.js');
  const { handleOrderSync, attemptOrderConfirmationNotification } = await import('../controllers/shopifyWebhookController.js');
  const { commerceOrderController } = await import('../controllers/commerceOrderController.js');
  const { initOrderCurrencySchema } = await import('../config/initOrderPanelTables.js');

  // Test 1: Database Schema Migration
  await test('1. initOrderCurrencySchema ensures currency column exists in checkout_orders', async () => {
    const res = await initOrderCurrencySchema();
    assert.strictEqual(res, true, 'Migration must succeed');

    const colCheck = await pool.query(`
      SELECT column_name, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'checkout_orders' AND column_name = 'currency'
    `);
    assert.ok(colCheck.rows.length > 0, 'currency column must exist in checkout_orders');
  });

  // Test 2: Inbound Shopify Order #1001 Sync Preserves USD
  await test('2. handleOrderSync preserves USD currency and amount without conversion', async () => {
    const originalQuery = pool.query;
    const executedQueries = [];

    pool.query = async (text, params) => {
      executedQueries.push({ text, params });
      if (text.includes('SELECT user_id FROM shopify_integrations')) return { rows: [{ user_id: 'usr_test_1' }] };
      if (text.includes('SELECT id, workflow_id, contact_id FROM checkout_orders')) return { rows: [] };
      if (text.includes('SELECT id FROM contacts')) return { rows: [] };
      if (text.includes('INSERT INTO checkout_orders')) return { rows: [] };
      return { rows: [] };
    };

    try {
      await handleOrderSync('arco-test.myshopify.com', {
        id: 1001,
        order_number: '1001',
        total_price: '10.00',
        subtotal_price: '10.00',
        currency: 'USD',
        financial_status: 'paid',
        fulfillment_status: 'unfulfilled',
      }, { isNewOrder: false });

      const insert = executedQueries.find((q) => q.text.includes('INSERT INTO checkout_orders'));
      assert.ok(insert, 'Must execute INSERT INTO checkout_orders');
      assert.strictEqual(insert.params[11], 10, 'Total amount must be exactly 10.00 without currency conversion');
      assert.strictEqual(insert.params[20], 'USD', 'Currency must be saved as USD');
      assert.ok(insert.text.includes('currency'), 'SQL must insert currency');
    } finally {
      pool.query = originalQuery;
    }
  });

  // Test 3: Order Update Preserves Currency
  await test('3. handleOrderSync preserves currency in UPDATE query for existing orders', async () => {
    const originalQuery = pool.query;
    const executedQueries = [];

    pool.query = async (text, params) => {
      executedQueries.push({ text, params });
      if (text.includes('SELECT user_id FROM shopify_integrations')) return { rows: [{ user_id: 'usr_test_1' }] };
      if (text.includes('SELECT id, workflow_id, contact_id FROM checkout_orders')) {
        return { rows: [{ id: 'ord_shp_1001', workflow_id: null, contact_id: 'cnt_1' }] };
      }
      if (text.includes('SELECT id FROM contacts')) return { rows: [] };
      if (text.includes('UPDATE checkout_orders')) return { rows: [] };
      return { rows: [] };
    };

    try {
      await handleOrderSync('arco-test.myshopify.com', {
        id: 1001,
        order_number: '1001',
        total_price: '10.00',
        currency: 'USD',
        financial_status: 'paid',
        fulfillment_status: 'fulfilled',
      }, { isNewOrder: false });

      const update = executedQueries.find((q) => q.text.includes('UPDATE checkout_orders'));
      assert.ok(update, 'Must execute UPDATE checkout_orders');
      assert.strictEqual(update.params[3], 10, 'Total amount must be preserved as 10');
      assert.strictEqual(update.params[5], 'USD', 'Currency must be updated to USD');
    } finally {
      pool.query = originalQuery;
    }
  });

  // Test 4: WhatsApp Confirmation Formats USD Appropriately
  await test('4. WhatsApp order confirmation notification formats USD as USD $10.00', async () => {
    const { metaWhatsAppService } = await import('../services/metaWhatsAppService.js');
    const originalGetCreds = metaWhatsAppService.getCredentials;
    const originalGetTmpls = metaWhatsAppService.getWhatsAppTemplates;
    const originalSend = metaWhatsAppService.sendTemplateMessage;
    const originalQuery = pool.query;

    let dispatchedPayload = null;

    metaWhatsAppService.getCredentials = async () => ({ isConfigured: true, phoneNumberId: '123' });
    metaWhatsAppService.getWhatsAppTemplates = async () => ({
      success: true,
      approved: [{ name: 'transactional_confirmation_02', status: 'APPROVED', language: 'en_US' }],
    });
    metaWhatsAppService.sendTemplateMessage = async (payload) => {
      dispatchedPayload = payload;
      return { success: true, wamid: 'wamid_test_usd' };
    };

    pool.query = async (text) => {
      if (text.includes('SELECT workflow_id FROM checkout_orders')) return { rows: [] };
      if (text.includes('SELECT id, phone, whatsapp_opted FROM contacts')) {
        return { rows: [{ id: 'cnt_1', phone: '+15551234567', whatsapp_opted: true }] };
      }
      if (text.includes('UPDATE checkout_orders SET workflow_id')) return { rows: [] };
      return { rows: [] };
    };

    try {
      await attemptOrderConfirmationNotification({
        shopDomain: 'arco-test.myshopify.com',
        order: { id: 1001, order_number: '1001' },
        orderId: 'ord_shp_1001',
        orderNumber: '1001',
        resolvedContactId: 'cnt_1',
        phoneNumber: '+15551234567',
        customerName: 'Alice Smith',
        totalAmount: 10,
        currency: 'USD',
      });

      assert.ok(dispatchedPayload, 'Notification should be dispatched');
      assert.strictEqual(dispatchedPayload.variables[0], '1001');
      assert.strictEqual(dispatchedPayload.variables[2], 'USD $10.00', 'Amount variable must be formatted as USD $10.00 and not ₹10');
    } finally {
      metaWhatsAppService.getCredentials = originalGetCreds;
      metaWhatsAppService.getWhatsAppTemplates = originalGetTmpls;
      metaWhatsAppService.sendTemplateMessage = originalSend;
      pool.query = originalQuery;
    }
  });

  // Test 5: CSV Export Includes Currency Header and USD Value
  await test('5. commerceOrderController.exportOrdersCsv includes Currency column and preserves USD', async () => {
    const originalQuery = pool.query;
    pool.query = async (text) => {
      if (text.includes('SELECT * FROM checkout_orders')) {
        return {
          rows: [
            {
              order_number: '1001',
              customer_name: 'Alice Smith',
              phone_number: '+15551234567',
              customer_email: 'alice@example.com',
              cart_date: new Date().toISOString(),
              created_at: new Date().toISOString(),
              items: JSON.stringify([{ title: 'Test Product', price: '10.00', qty: 1 }]),
              subtotal: '10.00',
              shipping_charge: '0.00',
              discount: '0.00',
              total_amount: '10.00',
              currency: 'USD',
              payment_method: 'Credit Card',
              payment_status: 'Paid',
              order_status: 'Confirmed',
              fulfillment_status: 'Unfulfilled',
              address: '123 Market St',
              city: 'San Francisco',
              state: 'CA',
              pincode: '94105',
            },
          ],
        };
      }
      return { rows: [] };
    };

    let sentCsv = '';
    const req = { user: { id: 'usr_1' }, query: {} };
    const res = {
      setHeader: () => {},
      send: (data) => { sentCsv = data; },
    };

    try {
      await commerceOrderController.exportOrdersCsv(req, res, () => {});
      assert.ok(sentCsv.includes('Order ID,Customer Name'), 'Headers must include Order ID');
      assert.ok(sentCsv.includes('Currency'), 'Headers must include Currency');
      assert.ok(sentCsv.includes('"USD"'), 'Row must contain "USD" currency');
      assert.ok(sentCsv.includes('10.00'), 'Row must contain 10.00 total amount');
    } finally {
      pool.query = originalQuery;
    }
  });

  console.log('\n-------------------------------------------------------------');
  console.log(` RESULTS: ${passed}/${total} Tests Passed`);
  console.log('-------------------------------------------------------------\n');

  try {
    await pool.end();
  } catch (_) {}

  process.exit(passed === total ? 0 : 1);
}

runTests().catch((err) => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
