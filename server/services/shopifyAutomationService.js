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
};
