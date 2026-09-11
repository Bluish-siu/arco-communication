import { query } from './db.js';

async function initCheckoutBotTables() {
  try {
    console.log('[PostgreSQL] Initializing Checkout Bot & Orders Tables...');

    // 1. checkout_workflows table
    await query(`
      CREATE TABLE IF NOT EXISTS checkout_workflows (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) DEFAULT 'usr_1',
        name VARCHAR(255) DEFAULT 'Auto Checkout Flow',
        status VARCHAR(50) DEFAULT 'draft',
        published_at TIMESTAMPTZ,
        trigger_config JSONB DEFAULT '{"type": "cart_received", "sampleCartCount": 4, "sampleCartValue": 12000}',
        cart_confirmation_msg TEXT DEFAULT 'Thanks for your cart! We currently deliver for free all over India.\n\nYour total Order Value = {total_order_value}.\n\nWould you like to proceed?',
        cancellation_msg TEXT DEFAULT 'No problem! Your cart has not been placed. Let us know if you need any assistance.',
        shipping_config JSONB DEFAULT '{"freeShippingThreshold": 0, "defaultShippingCharge": 0, "discountType": "percentage", "discountValue": 0}',
        payment_config JSONB DEFAULT '{"codEnabled": true, "onlineEnabled": false, "paymentMode": "COD"}',
        order_confirmation_msg TEXT DEFAULT 'Thanks for providing the details!\n\nWe have noted your address as:\n{address}, {city}, {pincode}\n\nPayment Mode: {payment_method}\nTotal Amount: {total_order_value}\n\nWould you like to confirm your order?',
        order_placed_msg TEXT DEFAULT '🎉 Your Order is Placed!\n\nHey {customer_name},\nThanks for confirming! Order ID: #{order_id}.\n\nWe are getting your order ready and will send tracking details soon.',
        step_count INT DEFAULT 3,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. checkout_sessions table
    await query(`
      CREATE TABLE IF NOT EXISTS checkout_sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) DEFAULT 'usr_1',
        contact_id VARCHAR(255),
        phone_number VARCHAR(50) NOT NULL,
        cart_id VARCHAR(255),
        workflow_id VARCHAR(255),
        current_state VARCHAR(50) DEFAULT 'WAITING_CART_CONFIRMATION',
        cart_data JSONB DEFAULT '{"items": [], "subtotal": 0, "itemCount": 0}',
        collected_data JSONB DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'active',
        last_message_id VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMPTZ
      )
    `);

    // 3. checkout_orders table
    await query(`
      CREATE TABLE IF NOT EXISTS checkout_orders (
        id VARCHAR(255) PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL,
        user_id VARCHAR(255) DEFAULT 'usr_1',
        session_id VARCHAR(255),
        contact_id VARCHAR(255),
        customer_name VARCHAR(255),
        phone_number VARCHAR(50) NOT NULL,
        items JSONB DEFAULT '[]',
        subtotal NUMERIC(12, 2) DEFAULT 0,
        shipping_charge NUMERIC(12, 2) DEFAULT 0,
        discount NUMERIC(12, 2) DEFAULT 0,
        total_amount NUMERIC(12, 2) DEFAULT 0,
        pincode VARCHAR(20),
        city VARCHAR(100),
        state VARCHAR(100),
        address TEXT,
        payment_method VARCHAR(50) DEFAULT 'COD',
        payment_status VARCHAR(50) DEFAULT 'COD',
        order_status VARCHAR(50) DEFAULT 'CONFIRMED',
        workflow_id VARCHAR(255),
        currency VARCHAR(10) DEFAULT 'INR',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Ensure Default Workflow exists
    const existingWf = await query('SELECT * FROM checkout_workflows WHERE user_id = $1 LIMIT 1', ['usr_1']);
    if (existingWf.rows.length === 0) {
      await query(`
        INSERT INTO checkout_workflows (
          id, user_id, name, status, trigger_config,
          cart_confirmation_msg, cancellation_msg, shipping_config, payment_config,
          order_confirmation_msg, order_placed_msg, step_count
        ) VALUES (
          'wf_autocheckout_usr_1',
          'usr_1',
          'Auto Checkout Flow',
          'draft',
          '{"type": "cart_received", "sampleCartCount": 4, "sampleCartValue": 12000}',
          'Thanks for your cart! We currently deliver for free all over India.\n\nYour total Order Value = {total_order_value}.\n\nWould you like to proceed?',
          'No problem! Your cart has not been placed. Let us know if you need any assistance.',
          '{"freeShippingThreshold": 0, "defaultShippingCharge": 0, "discountType": "percentage", "discountValue": 0}',
          '{"codEnabled": true, "onlineEnabled": false, "paymentMode": "COD"}',
          'Thanks for providing the details!\n\nWe have noted your address as:\n{address}, {city}, {pincode}\n\nPayment Mode: {payment_method}\nTotal Amount: {total_order_value}\n\nWould you like to confirm your order?',
          '🎉 Your Order is Placed!\n\nHey {customer_name},\nThanks for confirming! Order ID: #{order_id}.\n\nWe are getting your order ready and will send tracking details soon.',
          3
        )
      `);
      console.log('[PostgreSQL] Inserted default checkout workflow.');
    }

    // 5. Seed 3 initial realistic orders if empty
    const orderCountRes = await query('SELECT COUNT(*) FROM checkout_orders');
    if (parseInt(orderCountRes.rows[0].count, 10) === 0) {
      const sampleOrders = [
        {
          id: 'ord_101',
          order_number: 'ORD-98012',
          customer_name: 'Aarav Sharma',
          phone_number: '+91 98765 43210',
          items: [
            { id: 'prod_101', title: 'Urban Runner Pro Sneakers', price: 3499, qty: 1 },
            { id: 'prod_104', title: 'Organic Cotton Classic Tee', price: 899, qty: 2 },
          ],
          subtotal: 5297,
          shipping_charge: 0,
          discount: 0,
          total_amount: 5297,
          pincode: '560001',
          city: 'Bengaluru',
          state: 'Karnataka',
          address: 'Flat 402, Prestige Towers, MG Road',
          payment_method: 'COD',
          payment_status: 'COD',
          order_status: 'CONFIRMED',
        },
        {
          id: 'ord_102',
          order_number: 'ORD-98013',
          customer_name: 'Priya Nair',
          phone_number: '+91 91234 56789',
          items: [
            { id: 'prod_102', title: 'Noise Cancelling Wireless Headphones', price: 5999, qty: 1 },
          ],
          subtotal: 5999,
          shipping_charge: 0,
          discount: 500,
          total_amount: 5499,
          pincode: '400050',
          city: 'Mumbai',
          state: 'Maharashtra',
          address: 'B-12 Sea View Apartments, Bandra West',
          payment_method: 'COD',
          payment_status: 'COD',
          order_status: 'PROCESSING',
        },
      ];

      for (const ord of sampleOrders) {
        await query(
          `INSERT INTO checkout_orders (
             id, order_number, user_id, customer_name, phone_number, items,
             subtotal, shipping_charge, discount, total_amount, pincode, city, state,
             address, payment_method, payment_status, order_status, workflow_id
           ) VALUES ($1, $2, 'usr_1', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'wf_autocheckout_usr_1')`,
          [
            ord.id,
            ord.order_number,
            ord.customer_name,
            ord.phone_number,
            JSON.stringify(ord.items),
            ord.subtotal,
            ord.shipping_charge,
            ord.discount,
            ord.total_amount,
            ord.pincode,
            ord.city,
            ord.state,
            ord.address,
            ord.payment_method,
            ord.payment_status,
            ord.order_status,
          ]
        );
      }
      console.log(`[PostgreSQL] Seeded ${sampleOrders.length} sample checkout orders.`);
    }

    console.log('[PostgreSQL] Checkout Bot initialization complete!');
  } catch (err) {
    console.error('Error initializing checkout bot tables:', err);
  } finally {
    process.exit(0);
  }
}

initCheckoutBotTables();
