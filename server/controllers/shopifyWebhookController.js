import { query } from '../config/db.js';

export const shopifyWebhookController = {
  /**
   * Main router/dispatcher for all verified Shopify webhooks
   */
  handleWebhook: async (req, res) => {
    // Immediate 200 acknowledgment to avoid Shopify retry timeouts
    const { topic, shopDomain, webhookId } = req.shopifyWebhook || {};
    const payload = req.body;

    console.log(`[Shopify Webhook Received] Topic: "${topic}" | Shop: "${shopDomain}" | ID: ${webhookId}`);

    // Shopify requires 200 within 5 seconds; acknowledge then process asynchronously or synchronously
    res.status(200).json({ success: true, received: true });

    try {
      switch (topic) {
        case 'app/uninstalled':
          await handleAppUninstalled(shopDomain);
          break;

        case 'customers/create':
        case 'customers/update':
          await handleCustomerSync(shopDomain, payload);
          break;

        case 'products/create':
        case 'products/update':
          await handleProductSync(shopDomain, payload);
          break;

        case 'orders/create':
        case 'orders/updated':
          await handleOrderSync(shopDomain, payload);
          break;

        default:
          console.log(`[Shopify Webhook Unhandled Topic]: "${topic}"`);
          break;
      }
    } catch (err) {
      console.error(`[Shopify Webhook Handler Error] Topic: "${topic}" | Error:`, err.message);
    }
  },

  /**
   * Mandatory Compliance: Customers Data Request
   */
  handleCustomersDataRequest: (req, res) => {
    console.log('[Shopify Compliance: customers/data_request received]:', req.body?.customer?.id);
    res.status(200).json({ success: true, message: 'Data request recorded' });
  },

  /**
   * Mandatory Compliance: Customers Redact
   */
  handleCustomersRedact: async (req, res) => {
    console.log('[Shopify Compliance: customers/redact received]:', req.body?.customer?.id);
    try {
      const customerId = req.body?.customer?.id;
      if (customerId) {
        // Redact PII from matching contacts
        await query(
          `UPDATE contacts 
           SET name = 'Redacted Customer',
               phone = NULL,
               email = NULL,
               notes = 'Redacted per Shopify GDPR request',
               updated_at = CURRENT_TIMESTAMP 
           WHERE custom_attributes->>'shopify_customer_id' = $1`,
          [String(customerId)]
        );
      }
    } catch (err) {
      console.warn('[Shopify Customers Redact Error]:', err.message);
    }
    res.status(200).json({ success: true, message: 'Customer redacted successfully' });
  },

  /**
   * Mandatory Compliance: Shop Redact (48 hours after uninstall)
   */
  handleShopRedact: async (req, res) => {
    console.log('[Shopify Compliance: shop/redact received]:', req.body?.shop_domain);
    try {
      const shopDomain = req.body?.shop_domain;
      if (shopDomain) {
        await query(
          `UPDATE shopify_integrations 
           SET access_token = NULL,
               refresh_token = NULL,
               status = 'redacted',
               last_error = 'Store data redacted per Shopify compliance',
               updated_at = CURRENT_TIMESTAMP 
           WHERE shop_domain = $1`,
          [shopDomain.toLowerCase()]
        );
      }
    } catch (err) {
      console.warn('[Shopify Shop Redact Error]:', err.message);
    }
    res.status(200).json({ success: true, message: 'Shop redacted successfully' });
  },
};

/**
 * Handles app/uninstalled: revokes access tokens, updates status without deleting user or campaigns
 */
async function handleAppUninstalled(shopDomain) {
  if (!shopDomain) return;

  console.log(`[Shopify Uninstall Processing]: Revoking integration for ${shopDomain}`);

  await query(
    `UPDATE shopify_integrations 
     SET status = 'uninstalled',
         uninstalled_at = CURRENT_TIMESTAMP,
         access_token = NULL,
         refresh_token = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE shop_domain = $1`,
    [shopDomain]
  );

  // Sync with global integrations table if main config exists
  try {
    const integRes = await query("SELECT config FROM integrations WHERE id = 'main'");
    if (integRes.rows.length > 0) {
      const currentConfig = integRes.rows[0].config || {};
      if (currentConfig.shopify) {
        currentConfig.shopify.status = 'Uninstalled';
        currentConfig.shopify.connected = false;
        currentConfig.shopify.uninstalledAt = new Date().toISOString();
        await query("UPDATE integrations SET config = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 'main'", [
          JSON.stringify(currentConfig),
        ]);
      }
    }
  } catch (err) {
    console.warn('[Shopify Uninstall Sync Warning]:', err.message);
  }
}

/**
 * Idempotently syncs customer data into ARCO contacts
 */
async function handleCustomerSync(shopDomain, customer) {
  if (!customer || !customer.id) return;

  // Retrieve user_id for this shop
  const integRes = await query('SELECT user_id FROM shopify_integrations WHERE shop_domain = $1 LIMIT 1', [shopDomain]);
  const userId = integRes.rows[0]?.user_id || 'usr_1';

  const shopifyCustomerId = String(customer.id);
  const firstName = customer.first_name || '';
  const lastName = customer.last_name || '';
  const name = `${firstName} ${lastName}`.trim() || customer.email || 'Shopify Customer';
  const email = customer.email || null;
  const phone = customer.phone || customer.default_address?.phone || null;
  const tags = customer.tags ? customer.tags.split(',').map((t) => t.trim()) : ['Shopify'];

  // Check if contact exists by shopify_customer_id or phone
  let existingContact = null;
  const checkRes = await query(
    `SELECT id FROM contacts WHERE custom_attributes->>'shopify_customer_id' = $1 LIMIT 1`,
    [shopifyCustomerId]
  );

  if (checkRes.rows.length > 0) {
    existingContact = checkRes.rows[0];
  } else if (phone) {
    const phoneCheck = await query(`SELECT id FROM contacts WHERE phone = $1 AND user_id = $2 LIMIT 1`, [phone, userId]);
    if (phoneCheck.rows.length > 0) existingContact = phoneCheck.rows[0];
  }

  const customAttributes = {
    shopify_customer_id: shopifyCustomerId,
    shopify_shop: shopDomain,
    orders_count: customer.orders_count || 0,
    total_spent: customer.total_spent || '0.00',
  };

  if (existingContact) {
    await query(
      `UPDATE contacts 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           tags = $4,
           custom_attributes = COALESCE(custom_attributes, '{}'::jsonb) || $5::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [name, email, phone, JSON.stringify(tags), JSON.stringify(customAttributes), existingContact.id]
    );
  } else {
    const contactId = `cnt_shp_${shopifyCustomerId}`;
    await query(
      `INSERT INTO contacts (
         id, user_id, name, email, phone, tags, channel, custom_attributes, whatsapp_opted, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, 'shopify', $7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE 
       SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, updated_at = CURRENT_TIMESTAMP`,
      [contactId, userId, name, email, phone, JSON.stringify(tags), JSON.stringify(customAttributes)]
    );
  }
}

/**
 * Idempotently syncs product data into ARCO catalog_products
 */
async function handleProductSync(shopDomain, product) {
  if (!product || !product.id) return;

  const integRes = await query('SELECT user_id FROM shopify_integrations WHERE shop_domain = $1 LIMIT 1', [shopDomain]);
  const userId = integRes.rows[0]?.user_id || 'usr_1';

  const externalId = String(product.id);
  const title = product.title || 'Untitled Product';
  const description = (product.body_html || '').replace(/<[^>]*>?/gm, '').trim();
  const price = parseFloat(product.variants?.[0]?.price || 0);
  const availability = product.status === 'active' ? 'in_stock' : 'out_of_stock';
  const imageLink = product.image?.src || product.images?.[0]?.src || null;
  const brand = product.vendor || 'Shopify';
  const isActive = product.status === 'active';

  const existingRes = await query(
    'SELECT id FROM catalog_products WHERE external_product_id = $1 AND user_id = $2 LIMIT 1',
    [externalId, userId]
  );

  if (existingRes.rows.length > 0) {
    await query(
      `UPDATE catalog_products 
       SET title = $1,
           description = $2,
           price = $3,
           availability = $4,
           image_link = $5,
           brand = $6,
           is_active = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8`,
      [title, description, price, availability, imageLink, brand, isActive, existingRes.rows[0].id]
    );
  } else {
    const catalogProductId = `cat_${externalId}`;
    await query(
      `INSERT INTO catalog_products (
         id, user_id, external_product_id, title, description, price, availability, image_link, brand, is_active, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE 
       SET title = EXCLUDED.title, price = EXCLUDED.price, availability = EXCLUDED.availability, updated_at = CURRENT_TIMESTAMP`,
      [catalogProductId, userId, externalId, title, description, price, availability, imageLink, brand, isActive]
    );
  }
}

/**
 * Idempotently syncs order data into ARCO checkout_orders
 */
async function handleOrderSync(shopDomain, order) {
  if (!order || !order.id) return;

  const integRes = await query('SELECT user_id FROM shopify_integrations WHERE shop_domain = $1 LIMIT 1', [shopDomain]);
  const userId = integRes.rows[0]?.user_id || 'usr_1';

  const orderNumber = String(order.order_number || order.name || order.id);
  const customerName = `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim() || order.shipping_address?.name || 'Customer';
  const customerEmail = order.email || order.customer?.email || null;
  const phoneNumber = order.phone || order.customer?.phone || order.shipping_address?.phone || null;
  const subtotal = parseFloat(order.subtotal_price || 0);
  const totalAmount = parseFloat(order.total_price || 0);
  const discount = parseFloat(order.total_discounts || 0);
  const tax = parseFloat(order.total_tax || 0);
  const paymentStatus = order.financial_status === 'paid' ? 'Paid' : (order.financial_status === 'refunded' ? 'Refunded' : 'Pending');
  const orderStatus = order.cancelled_at ? 'Cancelled' : (order.fulfillment_status === 'fulfilled' ? 'Delivered' : 'Confirmed');
  const fulfillmentStatus = order.fulfillment_status || 'unfulfilled';
  const shippingCountry = order.shipping_address?.country || null;
  const city = order.shipping_address?.city || null;
  const state = order.shipping_address?.province || null;
  const address = order.shipping_address?.address1 || null;
  const pincode = order.shipping_address?.zip || null;
  const items = JSON.stringify(order.line_items || []);

  const existingRes = await query(
    'SELECT id FROM checkout_orders WHERE order_number = $1 AND user_id = $2 LIMIT 1',
    [orderNumber, userId]
  );

  if (existingRes.rows.length > 0) {
    await query(
      `UPDATE checkout_orders 
       SET payment_status = $1,
           order_status = $2,
           fulfillment_status = $3,
           total_amount = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [paymentStatus, orderStatus, fulfillmentStatus, totalAmount, existingRes.rows[0].id]
    );
  } else {
    const orderId = `ord_shp_${order.id}`;
    await query(
      `INSERT INTO checkout_orders (
         id, order_number, user_id, customer_name, customer_email, phone_number,
         items, subtotal, discount, tax, total_amount, payment_status, order_status,
         fulfillment_status, shipping_country, city, state, address, pincode, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE 
       SET payment_status = EXCLUDED.payment_status, order_status = EXCLUDED.order_status, updated_at = CURRENT_TIMESTAMP`,
      [
        orderId, orderNumber, userId, customerName, customerEmail, phoneNumber,
        items, subtotal, discount, tax, totalAmount, paymentStatus, orderStatus,
        fulfillmentStatus, shippingCountry, city, state, address, pincode,
      ]
    );
  }
}
