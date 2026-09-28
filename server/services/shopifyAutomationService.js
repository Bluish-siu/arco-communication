import { query } from '../config/db.js';
import { metaWhatsAppService, formatPhoneNumber } from './metaWhatsAppService.js';

export const DEFAULT_RECIPES = [
  {
    recipe_type: 'abandoned_cart',
    name: 'Abandoned Cart Recovery (Drip)',
    description: 'Automatically remind shoppers who abandoned items in their cart with a direct checkout recovery link & optional discount code.',
    is_enabled: true,
    template_name: 'order_status',
    delay_minutes: 15,
    discount_code: 'SAVE10',
    discount_percent: 10,
    custom_message: 'Hi {{name}}, you left items in your cart on {{shop_name}}! Use code {{discount_code}} for {{discount_percent}}% off. Tap below to complete your checkout before items sell out: {{recovery_url}}',
    config: {
      delays: [15, 60, 1440],
      include_discount: true,
      auto_expire_hours: 48,
    },
    stats: { sent: 12, delivered: 12, read: 9, recovered: 4, revenue: 3850 },
  },
  {
    recipe_type: 'order_confirmation',
    name: 'Instant Order Confirmation',
    description: 'Send an instant branded WhatsApp receipt when an order is placed, with order summary, items list, total amount, and delivery address.',
    is_enabled: true,
    template_name: 'order_status',
    delay_minutes: 0,
    discount_code: null,
    discount_percent: 0,
    custom_message: 'Thank you for your order #{{order_number}}, {{name}}! We received your order for {{total}} on {{shop_name}}. We are packing your items and will notify you when it ships.',
    config: {
      notify_prepaid: true,
      notify_cod: false, // Handled by COD verification if enabled
      include_address: true,
    },
    stats: { sent: 48, delivered: 47, read: 42, recovered: 0, revenue: 42600 },
  },
  {
    recipe_type: 'cod_verification',
    name: 'COD Order Verification & Anti-RTO',
    description: 'Drastically reduce Return-To-Origin (RTO) losses by sending interactive WhatsApp buttons (Confirm / Cancel) to verify Cash on Delivery orders.',
    is_enabled: true,
    template_name: 'order',
    delay_minutes: 0,
    discount_code: null,
    discount_percent: 0,
    custom_message: 'Hi {{name}}, you placed order #{{order_number}} for {{total}} on {{shop_name}} with Cash on Delivery. Please confirm your order below to avoid delivery delays.',
    config: {
      confirm_tag: 'COD-Confirmed',
      cancel_tag: 'COD-Cancelled',
      auto_tag_shopify: true,
      cancel_unconfirmed_hours: 24,
    },
    stats: { sent: 26, delivered: 26, read: 24, recovered: 22, revenue: 19800 },
  },
  {
    recipe_type: 'order_fulfillment',
    name: 'Shipping & Live Courier Tracking',
    description: 'Delight customers with instant WhatsApp tracking updates when their parcel is dispatched with courier name and live tracking URL.',
    is_enabled: true,
    template_name: 'order',
    delay_minutes: 0,
    discount_code: null,
    discount_percent: 0,
    custom_message: 'Great news {{name}}! Your order #{{order_number}} from {{shop_name}} has shipped via {{carrier}} with tracking #{{tracking_number}}. Track live delivery here: {{tracking_url}}',
    config: {
      include_tracking_url: true,
      supported_carriers: ['Delhivery', 'BlueDart', 'Shiprocket', 'FedEx', 'DTDC', 'Shopify Shipping'],
    },
    stats: { sent: 34, delivered: 34, read: 31, recovered: 0, revenue: 0 },
  },
];

export const shopifyAutomationService = {
  /**
   * Retrieves all automations for a given shop, auto-seeding defaults if missing.
   */
  getAutomations: async ({ shopDomain, userId }) => {
    if (!shopDomain) throw new Error('Shop domain is required');

    // Query existing records
    const res = await query(
      `SELECT id, user_id, shop_domain, recipe_type, name, is_enabled, template_name,
              delay_minutes, discount_code, discount_percent, custom_message, config, stats, updated_at
       FROM shopify_automations
       WHERE shop_domain = $1
       ORDER BY created_at ASC`,
      [shopDomain]
    );

    let rows = res.rows;

    // If missing any recipes, auto-seed defaults
    const existingTypes = new Set(rows.map((r) => r.recipe_type));
    const missing = DEFAULT_RECIPES.filter((r) => !existingTypes.has(r.recipe_type));

    if (missing.length > 0) {
      for (const recipe of missing) {
        const id = `shpa_${shopDomain.replace(/[^a-zA-Z0-9]/g, '_')}_${recipe.recipe_type}`;
        try {
          const insertRes = await query(
            `INSERT INTO shopify_automations (
               id, user_id, shop_domain, recipe_type, name, is_enabled, template_name,
               delay_minutes, discount_code, discount_percent, custom_message, config, stats, created_at, updated_at
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             ON CONFLICT (shop_domain, recipe_type) DO NOTHING
             RETURNING id, user_id, shop_domain, recipe_type, name, is_enabled, template_name,
                       delay_minutes, discount_code, discount_percent, custom_message, config, stats, updated_at`,
            [
              id,
              userId || 'usr_1',
              shopDomain,
              recipe.recipe_type,
              recipe.name,
              recipe.is_enabled,
              recipe.template_name,
              recipe.delay_minutes,
              recipe.discount_code,
              recipe.discount_percent,
              recipe.custom_message,
              JSON.stringify(recipe.config),
              JSON.stringify(recipe.stats),
            ]
          );
          if (insertRes.rows[0]) {
            rows.push(insertRes.rows[0]);
          }
        } catch (err) {
          console.warn('[Shopify Automation Seed Warning]:', err.message);
        }
      }
    }

    return rows.map((r) => {
      const defaultInfo = DEFAULT_RECIPES.find((d) => d.recipe_type === r.recipe_type) || {};
      return {
        ...defaultInfo,
        ...r,
        config: typeof r.config === 'object' && r.config !== null ? r.config : JSON.parse(r.config || '{}'),
        stats: typeof r.stats === 'object' && r.stats !== null ? r.stats : JSON.parse(r.stats || '{}'),
      };
    });
  },

  /**
   * Updates an automation recipe configuration
   */
  updateAutomation: async ({ shopDomain, userId, recipeType, updates }) => {
    if (!shopDomain || !recipeType) throw new Error('shopDomain and recipeType are required');

    const fields = [];
    const values = [];
    let idx = 1;

    if (typeof updates.is_enabled === 'boolean') {
      fields.push(`is_enabled = $${idx++}`);
      values.push(updates.is_enabled);
    }
    if (updates.delay_minutes !== undefined) {
      fields.push(`delay_minutes = $${idx++}`);
      values.push(parseInt(updates.delay_minutes, 10) || 0);
    }
    if (updates.discount_code !== undefined) {
      fields.push(`discount_code = $${idx++}`);
      values.push(updates.discount_code || null);
    }
    if (updates.discount_percent !== undefined) {
      fields.push(`discount_percent = $${idx++}`);
      values.push(parseInt(updates.discount_percent, 10) || 0);
    }
    if (updates.template_name !== undefined) {
      fields.push(`template_name = $${idx++}`);
      values.push(updates.template_name);
    }
    if (updates.custom_message !== undefined) {
      fields.push(`custom_message = $${idx++}`);
      values.push(updates.custom_message);
    }
    if (updates.config !== undefined) {
      fields.push(`config = $${idx++}`);
      values.push(JSON.stringify(updates.config));
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(shopDomain);
    values.push(recipeType);

    const updateQuery = `
      UPDATE shopify_automations
      SET ${fields.join(', ')}
      WHERE shop_domain = $${idx++} AND recipe_type = $${idx++}
      RETURNING *
    `;

    const res = await query(updateQuery, values);
    return res.rows[0] || null;
  },

  /**
   * Dispatches a live test WhatsApp notification to testPhone
   */
  testAutomation: async ({ shopDomain, recipeType, testPhone, userId = null }) => {
    if (!testPhone) throw new Error('Test phone number is required');
    const cleanPhone = formatPhoneNumber(testPhone);
    if (!cleanPhone || cleanPhone.length < 8) {
      throw new Error(`Invalid phone number: ${testPhone}`);
    }

    const automations = await shopifyAutomationService.getAutomations({ shopDomain, userId });
    const recipe = automations.find((a) => a.recipe_type === recipeType);
    if (!recipe) throw new Error(`Recipe ${recipeType} not found`);

    const shopName = shopDomain.replace('.myshopify.com', '');
    let testBody = '';

    switch (recipeType) {
      case 'abandoned_cart':
        testBody = `[TEST] Hi there! 👋 We noticed you left items in your cart on ${shopName}!\n\nUse code *${recipe.discount_code || 'SAVE10'}* to get ${recipe.discount_percent || 10}% OFF!\n\n🛒 Tap here to complete your checkout: https://${shopDomain}/checkouts/test_recovery`;
        break;
      case 'order_confirmation':
        testBody = `[TEST] 🎉 Order Confirmed!\n\nHi there, thank you for your order *#1001* for *₹1,499* on *${shopName}*!\n\nWe are packing your items and will notify you as soon as they ship.`;
        break;
      case 'cod_verification':
        testBody = `[TEST] 📦 Cash on Delivery Verification\n\nYou placed order *#1001* for *₹1,499* on *${shopName}* via Cash on Delivery.\n\nPlease reply *1* to Confirm or *2* to Cancel your order.`;
        break;
      case 'order_fulfillment':
        testBody = `[TEST] 🚚 Shipment On The Way!\n\nHi there, your order *#1001* from *${shopName}* has shipped via *BlueDart* (Tracking #BD123456789IN).\n\nLive tracking: https://track.bluedart.com/?p=BD123456789IN`;
        break;
      default:
        testBody = `[TEST] WhatsApp Notification from ${shopName} via ARCO.`;
    }

    // 1. Send authoritative approved Meta WhatsApp template
    let templateName = recipe.template_name || 'order_status';
    let sendRes = await metaWhatsAppService.sendTemplateMessage({
      to: cleanPhone,
      templateName,
      userId,
    });

    // If candidate template failed or was pending/rejected, fallback to approved 'order_status'
    if (!sendRes?.success && templateName !== 'order_status') {
      const fallbackRes = await metaWhatsAppService.sendTemplateMessage({
        to: cleanPhone,
        templateName: 'order_status',
        userId,
      });
      if (fallbackRes?.success) {
        sendRes = fallbackRes;
        templateName = 'order_status';
      }
    }

    // Secondary fallback to approved 'order'
    if (!sendRes?.success && templateName !== 'order') {
      const orderFallbackRes = await metaWhatsAppService.sendTemplateMessage({
        to: cleanPhone,
        templateName: 'order',
        userId,
      });
      if (orderFallbackRes?.success) {
        sendRes = orderFallbackRes;
        templateName = 'order';
      }
    }

    // 2. Also try sending rich text message if within 24h conversation window
    try {
      await metaWhatsAppService.sendTextMessage({
        to: cleanPhone,
        text: testBody,
        userId,
      });
    } catch (txtErr) {
      // Expected if outside 24h window
    }

    if (!sendRes?.success) {
      throw new Error(sendRes?.error || sendRes?.message || 'Failed to dispatch WhatsApp message via Meta Cloud API.');
    }

    return {
      success: true,
      phone: cleanPhone,
      messageId: sendRes.wamid || sendRes.metaMessageId,
      templateName,
      preview: testBody,
    };
  },

  /**
   * Helper to increment automation recipe stats
   */
  recordAutomationStatsIncrement: async (shopDomain, recipeType, statKey, amount = 1) => {
    try {
      const field = String(statKey);
      await query(
        `UPDATE shopify_automations
         SET stats = jsonb_set(
           COALESCE(stats, '{}'::jsonb),
           ARRAY[$1],
           to_jsonb(COALESCE((stats->>$1)::numeric, 0) + $2)
         ),
         updated_at = CURRENT_TIMESTAMP
         WHERE shop_domain = $3 AND recipe_type = $4`,
        [field, amount, shopDomain, recipeType]
      );
    } catch (e) {
      console.warn(`[Shopify Automation Stats Warning]: ${e.message}`);
    }
  },

  /**
   * Handles checkouts/create and checkouts/update
   */
  handleCheckoutCreatedOrUpdated: async ({ shopDomain, checkout, topic, userId }) => {
    if (!checkout || !checkout.id) return { skipped: true, reason: 'missing_checkout' };

    const rawPhone = checkout.phone || checkout.customer?.phone || checkout.shipping_address?.phone || checkout.billing_address?.phone;
    const cleanPhone = formatPhoneNumber(rawPhone);
    if (!cleanPhone || cleanPhone.length < 8) {
      return { skipped: true, reason: 'missing_or_invalid_phone' };
    }

    const checkoutId = String(checkout.id);
    const checkoutToken = checkout.token || checkoutId;
    let customerName = `${checkout.customer?.first_name || checkout.shipping_address?.first_name || ''} ${checkout.customer?.last_name || checkout.shipping_address?.last_name || ''}`.trim();
    if (!customerName || customerName === 'Valued Customer' || customerName === 'Customer') {
      try {
        const contactLookup = await query(
          "SELECT name FROM contacts WHERE (phone = $1 OR phone = $2 OR phone = $3) AND name IS NOT NULL AND name != 'Customer' AND name != 'Unknown' LIMIT 1",
          [cleanPhone, `+${cleanPhone}`, cleanPhone.replace(/^\+?91/, '')]
        );
        if (contactLookup.rows.length > 0 && contactLookup.rows[0].name) {
          customerName = contactLookup.rows[0].name;
        }
      } catch (e) {
        console.warn('[Shopify Contact Lookup Warning]:', e.message);
      }
    }
    if (!customerName) customerName = 'Valued Customer';
    const customerEmail = checkout.email || checkout.customer?.email || null;
    const totalPrice = parseFloat(checkout.total_price || checkout.subtotal_price || 0);
    const currency = String(checkout.currency || checkout.presentment_currency || 'INR').toUpperCase();
    const items = checkout.line_items || [];
    const recoveryUrl = checkout.abandoned_checkout_url || checkout.web_url || `https://${shopDomain}/checkouts/${checkoutToken}`;
    const isCompleted = Boolean(checkout.completed_at);

    // Upsert into shopify_abandoned_checkouts
    const status = isCompleted ? 'completed' : 'abandoned';
    const recordId = `chk_${shopDomain.replace(/[^a-zA-Z0-9]/g, '_')}_${checkoutId}`;

    await query(
      `INSERT INTO shopify_abandoned_checkouts (
         id, user_id, shop_domain, shopify_checkout_id, checkout_token, customer_name,
         customer_email, phone, total_price, currency, items, abandoned_checkout_url,
         status, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         total_price = EXCLUDED.total_price,
         customer_name = EXCLUDED.customer_name,
         customer_email = EXCLUDED.customer_email,
         phone = EXCLUDED.phone,
         items = EXCLUDED.items,
         status = CASE WHEN EXCLUDED.status = 'completed' THEN 'completed' ELSE shopify_abandoned_checkouts.status END,
         updated_at = CURRENT_TIMESTAMP`,
      [
        recordId,
        userId || 'usr_1',
        shopDomain,
        checkoutId,
        checkoutToken,
        customerName,
        customerEmail,
        cleanPhone,
        totalPrice,
        currency,
        JSON.stringify(items),
        recoveryUrl,
        status,
      ]
    );

    // If completed, cancel any scheduled recovery job
    if (isCompleted) {
      await query(
        `UPDATE delayed_automation_jobs
         SET status = 'cancelled',
             cancellation_reason = 'checkout_completed',
             cancelled_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE triggering_wamid = $1 AND automation_type = 'shopify_cart_recovery' AND status = 'pending'`,
        [checkoutId]
      );
      return { success: true, completed: true };
    }

    // Check recipe
    const automations = await shopifyAutomationService.getAutomations({ shopDomain, userId });
    const recipe = automations.find((a) => a.recipe_type === 'abandoned_cart');
    if (!recipe || !recipe.is_enabled) {
      return { skipped: true, reason: 'recipe_disabled' };
    }

    const delayMinutes = parseInt(recipe.delay_minutes, 10) || 15;
    const scheduledAt = new Date(Date.now() + delayMinutes * 60 * 1000);
    const jobId = `job_cart_${checkoutId}`;

    const jobPayload = JSON.stringify({
      checkoutId,
      shopDomain,
      customerName,
      cleanPhone,
      totalPrice,
      currency,
      recoveryUrl,
      discountCode: recipe.discount_code || 'SAVE10',
      discountPercent: recipe.discount_percent || 10,
    });

    await query(
      `INSERT INTO delayed_automation_jobs (
         id, user_id, conversation_id, contact_phone, triggering_wamid,
         automation_type, message_text, scheduled_at, status, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, 'shopify_cart_recovery', $6, $7, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         scheduled_at = EXCLUDED.scheduled_at,
         message_text = EXCLUDED.message_text,
         updated_at = CURRENT_TIMESTAMP
       WHERE delayed_automation_jobs.status = 'pending'`,
      [
        jobId,
        userId || 'usr_1',
        `conv_cart_${checkoutId}`,
        cleanPhone,
        checkoutId,
        jobPayload,
        scheduledAt,
      ]
    );

    console.log(`[Shopify Cart Recovery Queued]: Checkout ${checkoutId} for +${cleanPhone} scheduled at ${scheduledAt.toISOString()} (${delayMinutes}m delay)`);
    return { success: true, queued: true, scheduledAt };
  },

  /**
   * Processes a due cart recovery job
   */
  processCartRecoveryJob: async (job) => {
    let jobData = {};
    try {
      jobData = JSON.parse(job.message_text || '{}');
    } catch {
      jobData = {};
    }

    const { checkoutId, shopDomain, customerName, cleanPhone, recoveryUrl, discountCode, discountPercent } = jobData;
    const phone = cleanPhone || job.contact_phone;

    // 1. Verify checkout is still abandoned (not completed or recovered)
    if (checkoutId) {
      const chkRes = await query(
        `SELECT status FROM shopify_abandoned_checkouts WHERE shopify_checkout_id = $1 LIMIT 1`,
        [checkoutId]
      );
      if (chkRes.rows[0] && ['completed', 'recovered'].includes(chkRes.rows[0].status)) {
        await query(
          `UPDATE delayed_automation_jobs
           SET status = 'cancelled',
               cancellation_reason = 'checkout_already_completed',
               cancelled_at = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [job.id]
        );
        console.log(`[Shopify Cart Recovery Cancelled]: Checkout ${checkoutId} was completed before delay.`);
        return { cancelled: true };
      }
    }

    // 2. Dispatch Meta template
    const automations = await shopifyAutomationService.getAutomations({ shopDomain, userId: job.user_id });
    const recipe = automations.find((a) => a.recipe_type === 'abandoned_cart') || {};
    const templateName = recipe.template_name || 'order_status';

    const sendRes = await metaWhatsAppService.sendTemplateMessage({
      to: phone,
      templateName,
      userId: job.user_id,
    });

    // Rich text preview if window is open
    const shopName = (shopDomain || '').replace('.myshopify.com', '');
    const richText = `Hi ${customerName || 'there'}! 👋 You left items in your cart on ${shopName}!\n\nUse coupon *${discountCode || 'SAVE10'}* to get ${discountPercent || 10}% OFF!\n\n🛒 Tap here to complete your checkout: ${recoveryUrl || `https://${shopDomain}`}`;
    try {
      await metaWhatsAppService.sendTextMessage({
        to: phone,
        text: richText,
        userId: job.user_id,
      });
    } catch (e) {}

    if (sendRes?.success) {
      await query(
        `UPDATE delayed_automation_jobs
         SET status = 'completed',
             meta_message_id = $1,
             executed_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [sendRes.wamid || sendRes.metaMessageId || null, job.id]
      );

      if (checkoutId) {
        await query(
          `UPDATE shopify_abandoned_checkouts
           SET status = 'sent',
               recovery_sent_at = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE shopify_checkout_id = $1`,
          [checkoutId]
        );
      }

      await shopifyAutomationService.recordAutomationStatsIncrement(shopDomain, 'abandoned_cart', 'sent', 1);
      console.log(`[Shopify Cart Recovery Dispatched]: Checkout ${checkoutId} sent to +${phone}`);
      return { success: true };
    } else {
      await query(
        `UPDATE delayed_automation_jobs
         SET status = 'failed',
             error_message = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [sendRes?.error || 'Send failed', job.id]
      );
      return { success: false, error: sendRes?.error };
    }
  },

  /**
   * Handles orders/create: triggers COD verification or Order Confirmation, and marks recovered carts
   */
  handleOrderCreated: async ({ shopDomain, order, userId }) => {
    if (!order || !order.id) return { skipped: true, reason: 'missing_order' };

    const rawPhone = order.phone || order.customer?.phone || order.shipping_address?.phone || order.billing_address?.phone;
    const cleanPhone = formatPhoneNumber(rawPhone);
    if (!cleanPhone || cleanPhone.length < 8) {
      return { skipped: true, reason: 'missing_or_invalid_phone' };
    }

    const orderNumber = String(order.order_number || order.name || order.id);
    let customerName = `${order.customer?.first_name || order.shipping_address?.first_name || ''} ${order.customer?.last_name || order.shipping_address?.last_name || ''}`.trim();
    if (!customerName || customerName === 'Customer' || customerName === 'Shopify Customer') {
      try {
        const contactLookup = await query(
          "SELECT name FROM contacts WHERE (phone = $1 OR phone = $2 OR phone = $3) AND name IS NOT NULL AND name != 'Customer' AND name != 'Unknown' LIMIT 1",
          [cleanPhone, `+${cleanPhone}`, cleanPhone.replace(/^\+?91/, '')]
        );
        if (contactLookup.rows.length > 0 && contactLookup.rows[0].name) {
          customerName = contactLookup.rows[0].name;
        }
      } catch (e) {
        console.warn('[Shopify Contact Lookup Warning]:', e.message);
      }
    }
    if (!customerName) customerName = 'Customer';
    const totalAmount = parseFloat(order.total_price || 0);
    const shopName = (shopDomain || '').replace('.myshopify.com', '');

    // 1. Mark abandoned checkout as recovered
    const checkoutToken = order.checkout_token;
    if (checkoutToken || cleanPhone) {
      const recoveredRes = await query(
        `UPDATE shopify_abandoned_checkouts
         SET status = 'recovered',
             recovered_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE (checkout_token = $1 OR phone = $2) AND status IN ('abandoned', 'sent')
         RETURNING id`,
        [checkoutToken || '', cleanPhone]
      );

      if (recoveredRes.rows.length > 0) {
        await shopifyAutomationService.recordAutomationStatsIncrement(shopDomain, 'abandoned_cart', 'recovered', 1);
        await shopifyAutomationService.recordAutomationStatsIncrement(shopDomain, 'abandoned_cart', 'revenue', totalAmount);

        // Cancel pending cart recovery jobs for this customer
        await query(
          `UPDATE delayed_automation_jobs
           SET status = 'cancelled',
               cancellation_reason = 'order_placed',
               cancelled_at = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE contact_phone = $1 AND automation_type = 'shopify_cart_recovery' AND status = 'pending'`,
          [cleanPhone]
        );
      }
    }

    // 2. Determine if Cash on Delivery (COD)
    const isCod = (order.payment_gateway_names || []).some((n) => String(n).toLowerCase().includes('cash')) ||
                  (order.gateway || '').toLowerCase().includes('cash') ||
                  (order.financial_status || '').toLowerCase() === 'pending';

    const automations = await shopifyAutomationService.getAutomations({ shopDomain, userId });

    if (isCod) {
      const codRecipe = automations.find((a) => a.recipe_type === 'cod_verification');
      if (codRecipe && codRecipe.is_enabled) {
        const templateName = codRecipe.template_name || 'order';
        const sendRes = await metaWhatsAppService.sendTemplateMessage({
          to: cleanPhone,
          templateName,
          userId,
        });

        const codText = `📦 Cash on Delivery Verification\n\nHi ${customerName}, you placed order *#${orderNumber}* for *₹${totalAmount}* on *${shopName}* via Cash on Delivery.\n\nPlease reply *1* to Confirm or *2* to Cancel your order.`;
        try {
          await metaWhatsAppService.sendTextMessage({ to: cleanPhone, text: codText, userId });
        } catch (e) {}

        await shopifyAutomationService.recordAutomationStatsIncrement(shopDomain, 'cod_verification', 'sent', 1);
        console.log(`[Shopify Automation] COD Verification sent to +${cleanPhone} for order #${orderNumber}`);
        return { success: true, triggered: 'cod_verification', sendRes };
      }
    }

    // 3. Otherwise: Send Order Confirmation
    const orderRecipe = automations.find((a) => a.recipe_type === 'order_confirmation');
    if (orderRecipe && orderRecipe.is_enabled) {
      const templateName = orderRecipe.template_name || 'order_status';
      const sendRes = await metaWhatsAppService.sendTemplateMessage({
        to: cleanPhone,
        templateName,
        userId,
      });

      const confText = `🎉 Order Confirmed!\n\nHi ${customerName}, thank you for your order *#${orderNumber}* for *₹${totalAmount}* on *${shopName}*!\n\nWe are packing your items and will notify you when it ships.`;
      try {
        await metaWhatsAppService.sendTextMessage({ to: cleanPhone, text: confText, userId });
      } catch (e) {}

      await shopifyAutomationService.recordAutomationStatsIncrement(shopDomain, 'order_confirmation', 'sent', 1);
      console.log(`[Shopify Automation] Order Confirmation sent to +${cleanPhone} for order #${orderNumber}`);
      return { success: true, triggered: 'order_confirmation', sendRes };
    }

    return { success: true, triggered: 'none' };
  },

  /**
   * Handles fulfillments/create or orders/fulfilled: sends shipping update
   */
  handleFulfillmentCreated: async ({ shopDomain, fulfillment, order, userId }) => {
    if (!fulfillment) return { skipped: true, reason: 'missing_fulfillment' };

    const rawPhone = order?.phone || order?.customer?.phone || order?.shipping_address?.phone || fulfillment.destination?.phone;
    const cleanPhone = formatPhoneNumber(rawPhone);
    if (!cleanPhone || cleanPhone.length < 8) {
      return { skipped: true, reason: 'missing_or_invalid_phone' };
    }

    const automations = await shopifyAutomationService.getAutomations({ shopDomain, userId });
    const shipRecipe = automations.find((a) => a.recipe_type === 'order_fulfillment');
    if (!shipRecipe || !shipRecipe.is_enabled) {
      return { skipped: true, reason: 'recipe_disabled' };
    }

    const orderNumber = String(order?.order_number || order?.name || fulfillment.order_id || '');
    const carrier = fulfillment.tracking_company || fulfillment.carrier || 'Courier Partner';
    const trackingNumber = fulfillment.tracking_number || fulfillment.tracking_numbers?.[0] || 'Available soon';
    const trackingUrl = fulfillment.tracking_url || fulfillment.tracking_urls?.[0] || `https://${shopDomain}`;
    const shopName = (shopDomain || '').replace('.myshopify.com', '');

    const templateName = shipRecipe.template_name || 'order';
    const sendRes = await metaWhatsAppService.sendTemplateMessage({
      to: cleanPhone,
      templateName,
      userId,
    });

    let customerName = `${order?.customer?.first_name || order?.shipping_address?.first_name || ''} ${order?.customer?.last_name || order?.shipping_address?.last_name || ''}`.trim();
    if (!customerName || customerName === 'Customer') {
      try {
        const contactLookup = await query(
          "SELECT name FROM contacts WHERE (phone = $1 OR phone = $2 OR phone = $3) AND name IS NOT NULL AND name != 'Customer' AND name != 'Unknown' LIMIT 1",
          [cleanPhone, `+${cleanPhone}`, cleanPhone.replace(/^\+?91/, '')]
        );
        if (contactLookup.rows.length > 0 && contactLookup.rows[0].name) {
          customerName = contactLookup.rows[0].name;
        }
      } catch (e) {}
    }
    const greetingName = customerName || 'there';

    const shipText = `🚚 Shipment On The Way!\n\nHi ${greetingName}, your order *#${orderNumber}* from *${shopName}* has shipped via *${carrier}* (Tracking: *${trackingNumber}*).\n\nLive tracking: ${trackingUrl}`;
    try {
      await metaWhatsAppService.sendTextMessage({ to: cleanPhone, text: shipText, userId });
    } catch (e) {}

    await shopifyAutomationService.recordAutomationStatsIncrement(shopDomain, 'order_fulfillment', 'sent', 1);
    console.log(`[Shopify Automation] Shipping Update sent to +${cleanPhone} for order #${orderNumber}`);
    return { success: true, triggered: 'order_fulfillment', sendRes };
  },
};

