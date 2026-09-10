import { query } from '../config/db.js';
import { metaWhatsAppService, formatPhoneNumber } from '../services/metaWhatsAppService.js';

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
          await handleOrderSync(shopDomain, payload, { isNewOrder: true });
          break;

        case 'orders/updated':
          await handleOrderSync(shopDomain, payload, { isNewOrder: false });
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
 * Accurately maps Shopify marketing consent to whatsapp_opted without defaulting unknown to true.
 */
export async function handleCustomerSync(shopDomain, customer) {
  if (!customer || !customer.id) return null;

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
    `SELECT id, whatsapp_opted FROM contacts WHERE custom_attributes->>'shopify_customer_id' = $1 LIMIT 1`,
    [shopifyCustomerId]
  );

  if (checkRes.rows.length > 0) {
    existingContact = checkRes.rows[0];
  } else if (phone) {
    const phoneCheck = await query(`SELECT id, whatsapp_opted FROM contacts WHERE phone = $1 AND user_id = $2 LIMIT 1`, [phone, userId]);
    if (phoneCheck.rows.length > 0) existingContact = phoneCheck.rows[0];
  }

  // Determine whatsappOpted:
  // - Explicit opt-in: sms_marketing_consent.state === 'subscribed' OR accepts_marketing === true -> true
  // - Explicit opt-out: sms_marketing_consent.state === 'unsubscribed' OR accepts_marketing === false -> false
  // - Unknown / undefined:
  //   - If contact exists in ARCO -> preserve existingContact.whatsapp_opted
  //   - If new contact -> false (never convert unknown to true)
  let whatsappOpted = false;
  const smsConsentState = customer.sms_marketing_consent?.state ? String(customer.sms_marketing_consent.state).toLowerCase() : null;

  if (smsConsentState === 'subscribed') {
    whatsappOpted = true;
  } else if (smsConsentState === 'unsubscribed') {
    whatsappOpted = false;
  } else if (typeof customer.accepts_marketing === 'boolean') {
    whatsappOpted = customer.accepts_marketing;
  } else if (existingContact && typeof existingContact.whatsapp_opted === 'boolean') {
    whatsappOpted = existingContact.whatsapp_opted;
  } else {
    whatsappOpted = false;
  }

  const customAttributes = {
    shopify_customer_id: shopifyCustomerId,
    shopify_shop: shopDomain,
    orders_count: customer.orders_count || 0,
    total_spent: customer.total_spent || '0.00',
    ...(customer.last_order_id ? { last_order_id: String(customer.last_order_id) } : {}),
    ...(customer.last_order_name ? { last_order_name: customer.last_order_name } : {}),
    ...(customer.currency ? { currency: customer.currency } : {}),
    shopify_sms_consent: smsConsentState,
    shopify_accepts_marketing: typeof customer.accepts_marketing === 'boolean' ? customer.accepts_marketing : null,
  };

  if (existingContact) {
    await query(
      `UPDATE contacts 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           tags = $4,
           custom_attributes = COALESCE(custom_attributes, '{}'::jsonb) || $5::jsonb,
           whatsapp_opted = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [name, email, phone, JSON.stringify(tags), JSON.stringify(customAttributes), whatsappOpted, existingContact.id]
    );
    return existingContact.id;
  } else {
    const contactId = `cnt_shp_${shopifyCustomerId}`;
    const insertRes = await query(
      `INSERT INTO contacts (
         id, user_id, name, email, phone, tags, channel, custom_attributes, whatsapp_opted, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, 'shopify', $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE 
       SET name = EXCLUDED.name,
           email = EXCLUDED.email,
           phone = EXCLUDED.phone,
           tags = EXCLUDED.tags,
           custom_attributes = COALESCE(contacts.custom_attributes, '{}'::jsonb) || EXCLUDED.custom_attributes,
           whatsapp_opted = EXCLUDED.whatsapp_opted,
           updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [contactId, userId, name, email, phone, JSON.stringify(tags), JSON.stringify(customAttributes), whatsappOpted]
    );
    return insertRes.rows[0]?.id || contactId;
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
 * Idempotently syncs order data into ARCO checkout_orders and associates with contacts.
 */
export async function handleOrderSync(shopDomain, order, options = {}) {
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

  // Status mapping strictly matching src/pages/OrderPanel.jsx conventions
  let paymentStatus = 'Pending';
  const finStatus = (order.financial_status || '').toLowerCase();
  const isCod = (order.payment_gateway_names || []).some((n) => String(n).toLowerCase().includes('cash')) || order.gateway === 'cash_on_delivery';

  if (finStatus === 'paid') {
    paymentStatus = 'Paid';
  } else if (finStatus === 'refunded' || finStatus === 'partially_refunded') {
    paymentStatus = 'Refunded';
  } else if (finStatus === 'voided') {
    paymentStatus = 'Failed';
  } else if (isCod) {
    paymentStatus = 'COD';
  } else {
    paymentStatus = 'Pending';
  }

  let orderStatus = 'Confirmed';
  let fulfillmentStatus = 'Unfulfilled';
  const shopifyFulfillment = (order.fulfillment_status || '').toLowerCase();

  if (order.cancelled_at) {
    orderStatus = 'Cancelled';
    fulfillmentStatus = 'Cancelled';
  } else if (shopifyFulfillment === 'fulfilled') {
    orderStatus = 'Shipped';
    fulfillmentStatus = 'Shipped';
  } else if (shopifyFulfillment === 'partial') {
    orderStatus = 'Processing';
    fulfillmentStatus = 'Processing';
  } else {
    orderStatus = 'Confirmed';
    fulfillmentStatus = 'Unfulfilled';
  }

  const shippingCountry = order.shipping_address?.country || null;
  const city = order.shipping_address?.city || null;
  const state = order.shipping_address?.province || null;
  const address = order.shipping_address?.address1 || null;
  const pincode = order.shipping_address?.zip || null;
  const items = JSON.stringify(order.line_items || []);

  // Resolve contact_id according to matching priority:
  // 1. Shopify Customer ID stored in custom_attributes or cnt_shp_{id}
  // 2. Clean normalized phone match
  // 3. Clean email match
  // 4. Create/reuse Shopify contact mechanism
  let resolvedContactId = null;
  const shopifyCustomerId = order.customer?.id ? String(order.customer.id) : null;

  if (shopifyCustomerId) {
    const matchCustomer = await query(
      `SELECT id FROM contacts
       WHERE custom_attributes->>'shopify_customer_id' = $1
          OR id = $2
       LIMIT 1`,
      [shopifyCustomerId, `cnt_shp_${shopifyCustomerId}`]
    );
    if (matchCustomer.rows.length > 0) {
      resolvedContactId = matchCustomer.rows[0].id;
    }
  }

  if (!resolvedContactId && phoneNumber) {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const matchPhone = await query(
      `SELECT id FROM contacts
       WHERE phone = $1
          OR REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = $2
       LIMIT 1`,
      [phoneNumber, cleanPhone]
    );
    if (matchPhone.rows.length > 0) {
      resolvedContactId = matchPhone.rows[0].id;
    }
  }

  if (!resolvedContactId && customerEmail) {
    const matchEmail = await query(
      `SELECT id FROM contacts WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [customerEmail]
    );
    if (matchEmail.rows.length > 0) {
      resolvedContactId = matchEmail.rows[0].id;
    }
  }

  if (!resolvedContactId) {
    if (order.customer && order.customer.id) {
      try {
        resolvedContactId = await handleCustomerSync(shopDomain, order.customer);
      } catch (custErr) {
        console.warn('[Shopify Order Contact Sync Warning]:', custErr.message);
      }
    } else if (customerName || phoneNumber || customerEmail) {
      // Guest checkout with no customer object: create contact with whatsapp_opted = false (unknown consent)
      const guestContactId = `cnt_shp_ord_${order.id}`;
      const guestTags = ['Shopify', 'Shopify Order'];
      const guestAttrs = {
        shopify_shop: shopDomain,
        source_order_id: String(order.id),
        source_order_number: orderNumber,
        total_spent: String(totalAmount),
        orders_count: 1,
      };
      try {
        const guestRes = await query(
          `INSERT INTO contacts (
             id, user_id, name, email, phone, tags, channel, custom_attributes, whatsapp_opted, created_at, updated_at
           ) VALUES ($1, $2, $3, $4, $5, $6, 'shopify', $7, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
           RETURNING id`,
          [guestContactId, userId, customerName, customerEmail, phoneNumber, JSON.stringify(guestTags), JSON.stringify(guestAttrs)]
        );
        resolvedContactId = guestRes.rows[0]?.id || guestContactId;
      } catch (guestErr) {
        console.warn('[Shopify Guest Contact Creation Warning]:', guestErr.message);
      }
    }
  }

  // Persist order into checkout_orders with contact_id
  const orderId = `ord_shp_${order.id}`;
  const existingRes = await query(
    'SELECT id, workflow_id, contact_id FROM checkout_orders WHERE order_number = $1 AND user_id = $2 LIMIT 1',
    [orderNumber, userId]
  );

  if (existingRes.rows.length > 0) {
    await query(
      `UPDATE checkout_orders 
       SET payment_status = $1,
           order_status = $2,
           fulfillment_status = $3,
           total_amount = $4,
           contact_id = COALESCE(contact_id, $5),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [paymentStatus, orderStatus, fulfillmentStatus, totalAmount, resolvedContactId, existingRes.rows[0].id]
    );
  } else {
    await query(
      `INSERT INTO checkout_orders (
         id, order_number, user_id, contact_id, customer_name, customer_email, phone_number,
         items, subtotal, discount, tax, total_amount, payment_status, order_status,
         fulfillment_status, shipping_country, city, state, address, pincode, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE 
       SET payment_status = EXCLUDED.payment_status,
           order_status = EXCLUDED.order_status,
           fulfillment_status = EXCLUDED.fulfillment_status,
           contact_id = COALESCE(checkout_orders.contact_id, EXCLUDED.contact_id),
           updated_at = CURRENT_TIMESTAMP`,
      [
        orderId, orderNumber, userId, resolvedContactId, customerName, customerEmail, phoneNumber,
        items, subtotal, discount, tax, totalAmount, paymentStatus, orderStatus,
        fulfillmentStatus, shippingCountry, city, state, address, pincode,
      ]
    );
  }

  // WhatsApp Order Confirmation: only on orders/create (new orders)
  if (options.isNewOrder) {
    await attemptOrderConfirmationNotification({
      shopDomain,
      order,
      orderId,
      orderNumber,
      resolvedContactId,
      phoneNumber,
      customerName,
      totalAmount,
    });
  }
}

/**
 * Safely attempts WhatsApp order confirmation dispatch with order-level duplicate protection
 * and strict consent checking (whatsapp_opted === true ONLY).
 */
export async function attemptOrderConfirmationNotification({
  shopDomain,
  order,
  orderId,
  orderNumber,
  resolvedContactId,
  phoneNumber,
  customerName,
  totalAmount,
}) {
  try {
    // 1. DUPLICATE PROTECTION: Check if this specific order was already notified
    const orderCheck = await query(
      'SELECT workflow_id FROM checkout_orders WHERE id = $1 OR order_number = $2 LIMIT 1',
      [orderId, orderNumber]
    );
    const currentWorkflowId = orderCheck.rows[0]?.workflow_id || '';
    if (currentWorkflowId.startsWith('shopify_notified')) {
      console.log(`[Shopify WhatsApp Dispatch] Skipped: Order ${orderNumber} already notified (workflow_id: ${currentWorkflowId}).`);
      return;
    }

    // 2. WHATSAPP CONSENT CHECK:
    // Resolve actual contact record and strictly require whatsapp_opted === true
    if (!resolvedContactId) {
      console.log(`[Shopify WhatsApp Dispatch] Skipped for order ${orderNumber}: No contact resolved.`);
      return;
    }

    const contactRes = await query(
      'SELECT id, phone, whatsapp_opted FROM contacts WHERE id = $1 LIMIT 1',
      [resolvedContactId]
    );
    const contactRow = contactRes.rows[0];

    // Explicit check: only whatsapp_opted === true is eligible.
    // false, null, undefined, unknown are strictly skipped.
    if (!contactRow || contactRow.whatsapp_opted !== true) {
      console.log(
        `[Shopify WhatsApp Dispatch] Skipped for order ${orderNumber}: Contact ${resolvedContactId} is not opted in (whatsapp_opted: ${contactRow?.whatsapp_opted}).`
      );
      return;
    }

    // 3. PHONE NUMBER CHECK
    const targetPhone = phoneNumber || contactRow.phone;
    const cleanPhone = formatPhoneNumber(targetPhone);
    if (!cleanPhone || cleanPhone.length < 8) {
      console.log(`[Shopify WhatsApp Dispatch] Skipped for order ${orderNumber}: Invalid or missing phone ("${targetPhone}").`);
      return;
    }

    // 4. TEMPLATE SELECTION (Strictly no guessing):
    // Check Meta WhatsApp API credentials
    const creds = await metaWhatsAppService.getCredentials();
    if (!creds.isConfigured) {
      console.log(`[Shopify WhatsApp Dispatch] Skipped for order ${orderNumber}: Meta WhatsApp API not configured.`);
      return;
    }

    // Query live templates from WABA
    const templatesRes = await metaWhatsAppService.getWhatsAppTemplates();
    const approvedTemplates = templatesRes.approved || templatesRes.data?.filter((t) => (t.status || '').toUpperCase() === 'APPROVED') || [];

    // Find known compatible approved template
    let matchedTemplate = null;
    const configuredTemplateName = process.env.SHOPIFY_ORDER_CONFIRMATION_TEMPLATE;

    if (configuredTemplateName) {
      matchedTemplate = approvedTemplates.find((t) => t.name.toLowerCase() === configuredTemplateName.toLowerCase());
    }

    if (!matchedTemplate) {
      // Check for known exact template name in seed / active templates:
      // 'Transactional Confirmation 02' or 'transactional_confirmation_02'
      matchedTemplate = approvedTemplates.find((t) => {
        const n = t.name.toLowerCase();
        return n === 'transactional confirmation 02' || n === 'transactional_confirmation_02';
      });
    }

    if (!matchedTemplate) {
      console.log(`[Shopify WhatsApp Dispatch] Skipped for order ${orderNumber}: No compatible approved order confirmation template found in connected WABA.`);
      return;
    }

    console.log(`[Shopify WhatsApp Dispatch] Sending confirmation for order ${orderNumber} via approved template "${matchedTemplate.name}" to +${cleanPhone}...`);

    // 5. DISPATCH VIA META CLOUD API
    const sendResult = await metaWhatsAppService.sendTemplateMessage({
      to: cleanPhone,
      templateName: matchedTemplate.name,
      languageCode: matchedTemplate.language || 'en_US',
      variables: [orderNumber, 'Standard Delivery', `₹${totalAmount}`],
    });

    if (sendResult.success) {
      const wamid = sendResult.wamid || `wamid_${Date.now()}`;
      console.log(`[Shopify WhatsApp Dispatch SUCCESS] Order ${orderNumber} -> +${cleanPhone} | WAMID: ${wamid}`);

      // Set order-level duplicate protection flag
      await query(
        `UPDATE checkout_orders SET workflow_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [`shopify_notified:${wamid}`, orderId]
      );
    } else {
      // Safe error logging without token leakage
      console.warn(`[Shopify WhatsApp Dispatch Failed] Order ${orderNumber} -> +${cleanPhone} | Error: ${sendResult.error || 'Meta API error'}`);
      // Do NOT set workflow_id to notified on failure
    }
  } catch (notifErr) {
    // Isolated catch block: failure of notification never fails the order webhook
    console.warn(`[Shopify WhatsApp Dispatch Exception] Order ${orderNumber}:`, notifErr.message);
  }
}
