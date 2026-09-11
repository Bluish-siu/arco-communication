import { query } from './db.js';

async function initOrderPanelTables() {
  try {
    console.log('[PostgreSQL] Initializing Order Panel enhancements...');

    // 1. Add missing columns to checkout_orders if they do not exist
    await query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checkout_orders' AND column_name = 'fulfillment_status') THEN
          ALTER TABLE checkout_orders ADD COLUMN fulfillment_status VARCHAR(50) DEFAULT 'Unfulfilled';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checkout_orders' AND column_name = 'customer_email') THEN
          ALTER TABLE checkout_orders ADD COLUMN customer_email VARCHAR(255);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checkout_orders' AND column_name = 'tax') THEN
          ALTER TABLE checkout_orders ADD COLUMN tax NUMERIC(12, 2) DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checkout_orders' AND column_name = 'cart_date') THEN
          ALTER TABLE checkout_orders ADD COLUMN cart_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checkout_orders' AND column_name = 'shipping_country') THEN
          ALTER TABLE checkout_orders ADD COLUMN shipping_country VARCHAR(100) DEFAULT 'India';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checkout_orders' AND column_name = 'currency') THEN
          ALTER TABLE checkout_orders ADD COLUMN currency VARCHAR(10) DEFAULT 'INR';
        END IF;
      END $$;
    `);

    // 2. Ensure unique constraint on session_id for duplicate protection if not already unique
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_checkout_orders_session_id 
      ON checkout_orders(session_id) 
      WHERE session_id IS NOT NULL;
    `);

    // 3. Create commerce_webhooks table for Order Webhooks configuration
    await query(`
      CREATE TABLE IF NOT EXISTS commerce_webhooks (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) DEFAULT 'usr_1',
        webhook_url TEXT NOT NULL,
        secret_key VARCHAR(255) NOT NULL,
        events JSONB DEFAULT '["order.created", "order.confirmed", "order.cancelled", "order.paid", "order.shipped", "order.delivered"]',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure default webhook record exists
    const webhookRes = await query('SELECT * FROM commerce_webhooks WHERE user_id = $1 LIMIT 1', ['usr_1']);
    if (webhookRes.rows.length === 0) {
      await query(`
        INSERT INTO commerce_webhooks (id, user_id, webhook_url, secret_key, events, is_active)
        VALUES (
          'whk_default_usr_1',
          'usr_1',
          'https://api.arco-crm.com/v1/webhooks/orders',
          'whsec_arco_live_89f92a10b84c3e107d91e',
          '["order.created", "order.confirmed", "order.cancelled", "order.paid", "order.shipped", "order.delivered"]',
          true
        )
      `);
      console.log('[PostgreSQL] Seeded default commerce webhook configuration.');
    }

    // 4. Seed realistic orders for demonstration if order count is low
    const countRes = await query('SELECT COUNT(*) FROM checkout_orders');
    const orderCount = parseInt(countRes.rows[0].count, 10);

    if (orderCount < 5) {
      const additionalOrders = [
        {
          id: 'ord_201',
          order_number: 'ARCO-20260821-0001',
          session_id: 'sess_seed_001',
          customer_name: 'Nilesh Patel',
          phone_number: '+91 98201 12345',
          customer_email: 'nilesh.patel@gmail.com',
          items: [
            { id: 'prod_101', title: 'Urban Runner Pro Sneakers', price: 3499, qty: 1, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
            { id: 'prod_104', title: 'Organic Cotton Classic Tee', price: 899, qty: 1, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400' },
          ],
          subtotal: 4398,
          shipping_charge: 0,
          discount: 399,
          tax: 0,
          total_amount: 3999,
          pincode: '400001',
          city: 'Mumbai',
          state: 'Maharashtra',
          address: '401 Palm Beach Residency, Nariman Point',
          payment_method: 'COD',
          payment_status: 'COD',
          order_status: 'Confirmed',
          fulfillment_status: 'Processing',
          cart_date: new Date(Date.now() - 2 * 3600000).toISOString(),
        },
        {
          id: 'ord_202',
          order_number: 'ARCO-20260821-0002',
          session_id: 'sess_seed_002',
          customer_name: 'Sneha Reddy',
          phone_number: '+91 97401 54321',
          customer_email: 'sneha.reddy@yahoo.com',
          items: [
            { id: 'prod_103', title: 'Aura AMOLED Smartwatch Elite', price: 4299, qty: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
          ],
          subtotal: 4299,
          shipping_charge: 0,
          discount: 0,
          tax: 0,
          total_amount: 4299,
          pincode: '560001',
          city: 'Bengaluru',
          state: 'Karnataka',
          address: '12-A Indiranagar 100ft Road',
          payment_method: 'UPI',
          payment_status: 'Paid',
          order_status: 'Processing',
          fulfillment_status: 'Packed',
          cart_date: new Date(Date.now() - 4 * 3600000).toISOString(),
        },
        {
          id: 'ord_203',
          order_number: 'ARCO-20260821-0003',
          session_id: 'sess_seed_003',
          customer_name: 'Vikram Mehta',
          phone_number: '+91 98112 99887',
          customer_email: 'vikram.mehta@outlook.com',
          items: [
            { id: 'prod_102', title: 'Noise Cancelling Wireless Headphones', price: 5999, qty: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
            { id: 'prod_105', title: 'Artisan Dark Roast Coffee Beans (500g)', price: 650, qty: 2, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400' },
          ],
          subtotal: 7299,
          shipping_charge: 0,
          discount: 500,
          tax: 0,
          total_amount: 6799,
          pincode: '110001',
          city: 'New Delhi',
          state: 'Delhi',
          address: '88 Connaught Place, Inner Circle',
          payment_method: 'COD',
          payment_status: 'COD',
          order_status: 'Shipped',
          fulfillment_status: 'Shipped',
          cart_date: new Date(Date.now() - 24 * 3600000).toISOString(),
        },
        {
          id: 'ord_204',
          order_number: 'ARCO-20260821-0004',
          session_id: 'sess_seed_004',
          customer_name: 'Ananya Deshmukh',
          phone_number: '+91 99881 22334',
          customer_email: 'ananya.d@gmail.com',
          items: [
            { id: 'prod_106', title: 'Water-Resistant Commuter Backpack', price: 2199, qty: 1, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' },
          ],
          subtotal: 2199,
          shipping_charge: 50,
          discount: 0,
          tax: 0,
          total_amount: 2249,
          pincode: '411001',
          city: 'Pune',
          state: 'Maharashtra',
          address: 'Flat 502, Green Meadows, Kalyani Nagar',
          payment_method: 'UPI',
          payment_status: 'Paid',
          order_status: 'Delivered',
          fulfillment_status: 'Delivered',
          cart_date: new Date(Date.now() - 48 * 3600000).toISOString(),
        },
      ];

      for (const ord of additionalOrders) {
        await query(
          `INSERT INTO checkout_orders (
             id, order_number, session_id, user_id, customer_name, phone_number, customer_email,
             items, subtotal, shipping_charge, discount, tax, total_amount, pincode, city, state,
             shipping_country, address, payment_method, payment_status, order_status, fulfillment_status,
             workflow_id, cart_date
           ) VALUES ($1, $2, $3, 'usr_1', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, 'wf_autocheckout_usr_1', $22)
           ON CONFLICT (id) DO NOTHING`,
          [
            ord.id,
            ord.order_number,
            ord.session_id,
            ord.customer_name,
            ord.phone_number,
            ord.customer_email,
            JSON.stringify(ord.items),
            ord.subtotal,
            ord.shipping_charge,
            ord.discount,
            ord.tax,
            ord.total_amount,
            ord.pincode,
            ord.city,
            ord.state,
            'India',
            ord.address,
            ord.payment_method,
            ord.payment_status,
            ord.order_status,
            ord.fulfillment_status,
            ord.cart_date,
          ]
        );
      }
      console.log(`[PostgreSQL] Seeded ${additionalOrders.length} realistic orders for Order Panel.`);
    }

    console.log('[PostgreSQL] Order Panel tables initialization complete!');
  } catch (err) {
    console.error('Error initializing order panel tables:', err);
  }
}

export async function initOrderCurrencySchema() {
  try {
    await query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checkout_orders' AND column_name = 'currency') THEN
          ALTER TABLE checkout_orders ADD COLUMN currency VARCHAR(10) DEFAULT 'INR';
        END IF;
      END $$;
    `);
    return true;
  } catch (err) {
    console.warn('[Order Currency Schema Initialization Warning]:', err.message);
    return false;
  }
}

export { initOrderPanelTables };

if (process.argv[1]?.endsWith('initOrderPanelTables.js')) {
  initOrderPanelTables().then(() => {
    process.exit(0);
  });
}
