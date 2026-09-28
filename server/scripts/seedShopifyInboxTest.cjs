const { query } = require('../config/db.js');

async function seed() {
  const storeRes = await query('SELECT shop_domain, user_id FROM shopify_integrations LIMIT 1');
  const shop = storeRes.rows[0]?.shop_domain || 'arco-test-e2a1thrd.myshopify.com';
  const userId = storeRes.rows[0]?.user_id || 'usr_shopify_1790591271259';

  const vickyPhone = '+918355866239';
  const vickyOrder1 = {
    id: 'ord_shp_vicky_1007',
    order_number: '1007',
    user_id: userId,
    customer_name: 'Vicky Gupta',
    customer_email: 'vicky@gmail.com',
    phone_number: vickyPhone,
    items: JSON.stringify([
      { id: 'item_1', title: 'Classic Denim Oversized Jacket', variant_title: 'L / Indigo Vintage', quantity: 1, price: 1499 }
    ]),
    subtotal: 1499,
    discount: 0,
    tax: 0,
    total_amount: 1499,
    payment_status: 'Paid',
    order_status: 'Shipped',
    fulfillment_status: 'Shipped',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400053',
    shipping_country: 'India',
    currency: 'INR'
  };

  const vickyOrder2 = {
    id: 'ord_shp_vicky_1005',
    order_number: '1005',
    user_id: userId,
    customer_name: 'Vicky Gupta',
    customer_email: 'vicky@gmail.com',
    phone_number: vickyPhone,
    items: JSON.stringify([
      { id: 'item_2', title: 'Premium Heavyweight Boxy Tee', variant_title: 'M / Washed Black', quantity: 2, price: 699 }
    ]),
    subtotal: 1398,
    discount: 100,
    tax: 0,
    total_amount: 1298,
    payment_status: 'Paid',
    order_status: 'Delivered',
    fulfillment_status: 'Fulfilled',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400053',
    shipping_country: 'India',
    currency: 'INR'
  };

  const vickyAbandoned = {
    id: 'chk_vicky_88192',
    user_id: userId,
    shop_domain: shop,
    shopify_checkout_id: 'chk_88192031',
    checkout_token: 'tok_vicky_88192031',
    customer_name: 'Vicky Gupta',
    customer_email: 'vicky@gmail.com',
    phone: vickyPhone,
    total_price: 2499,
    currency: 'INR',
    items: JSON.stringify([
      { id: 'item_3', title: 'Retro High-Top Suede Sneakers', variant_title: 'UK 9 / Off-White', quantity: 1, price: 2499 }
    ]),
    abandoned_checkout_url: 'https://' + shop + '/checkouts/cn/c1-tok_vicky_88192031',
    status: 'abandoned'
  };

  const nileshPhone = '+919920858396';
  const nileshOrder = {
    id: 'ord_shp_nilesh_1006',
    order_number: '1006',
    user_id: userId,
    customer_name: 'Nilesh Patel',
    customer_email: 'mca25.patel.nilesh@gnims.com',
    phone_number: nileshPhone,
    items: JSON.stringify([
      { id: 'item_4', title: 'Minimalist Cotton Crewneck Tee (Pack of 3)', variant_title: 'XL / Multi-color', quantity: 1, price: 1299 }
    ]),
    subtotal: 1299,
    discount: 0,
    tax: 0,
    total_amount: 1299,
    payment_status: 'COD',
    order_status: 'Confirmed',
    fulfillment_status: 'Unfulfilled',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400019',
    shipping_country: 'India',
    currency: 'INR'
  };

  for (const ord of [vickyOrder1, vickyOrder2, nileshOrder]) {
    await query(`
      INSERT INTO checkout_orders (
        id, order_number, user_id, customer_name, customer_email, phone_number,
        items, subtotal, discount, tax, total_amount, payment_status, order_status,
        fulfillment_status, city, state, pincode, shipping_country, currency, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        total_amount = EXCLUDED.total_amount,
        phone_number = EXCLUDED.phone_number,
        updated_at = CURRENT_TIMESTAMP
    `, [
      ord.id, ord.order_number, ord.user_id, ord.customer_name, ord.customer_email, ord.phone_number,
      ord.items, ord.subtotal, ord.discount, ord.tax, ord.total_amount, ord.payment_status, ord.order_status,
      ord.fulfillment_status, ord.city, ord.state, ord.pincode, ord.shipping_country, ord.currency
    ]);
  }

  await query(`
    INSERT INTO shopify_abandoned_checkouts (
      id, user_id, shop_domain, shopify_checkout_id, checkout_token, customer_name,
      customer_email, phone, total_price, currency, items, abandoned_checkout_url,
      status, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO UPDATE SET
      total_price = EXCLUDED.total_price,
      phone = EXCLUDED.phone,
      updated_at = CURRENT_TIMESTAMP
  `, [
    vickyAbandoned.id, vickyAbandoned.user_id, vickyAbandoned.shop_domain, vickyAbandoned.shopify_checkout_id,
    vickyAbandoned.checkout_token, vickyAbandoned.customer_name, vickyAbandoned.customer_email,
    vickyAbandoned.phone, vickyAbandoned.total_price, vickyAbandoned.currency, vickyAbandoned.items,
    vickyAbandoned.abandoned_checkout_url, vickyAbandoned.status
  ]);

  console.log('Seeded realistic Shopify orders and abandoned carts successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
