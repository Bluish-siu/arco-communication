import { query } from '../config/db.js';

export const DEFAULT_WIDGET_CONFIG = {
  is_enabled: true,
  phone_number: '+919920858396',
  widget_position: 'bottom-right',
  brand_name: 'ARCO Support',
  brand_color: '#25D366',
  brand_avatar_url: '',
  welcome_heading: 'Need Help? Chat with Us!',
  welcome_subheading: 'Typically replies within a few minutes.',
  default_chat_message: 'Hello! I have a question about your products.',
  call_to_action_badge: 'Chat on WhatsApp',
  show_on_mobile: true,
  show_on_desktop: true,
  buy_button_enabled: true,
  buy_button_text: 'Order on WhatsApp',
  buy_button_style: 'solid',
  buy_button_bg_color: '#25D366',
  buy_button_text_color: '#FFFFFF',
  buy_button_template: 'Hi, I would like to order {{product_title}} (Price: {{product_price}}) from {{store_url}}. Please confirm availability!',
};

export const shopifyWidgetService = {
  /**
   * Get or initialize widget config for a shop
   */
  getWidgetConfig: async ({ shopDomain, userId }) => {
    if (!shopDomain) throw new Error('shopDomain is required');

    const res = await query(
      `SELECT * FROM shopify_storefront_widgets WHERE shop_domain = $1 LIMIT 1`,
      [shopDomain]
    );

    if (res.rows.length > 0) {
      return res.rows[0];
    }

    // Try resolving phone number from meta integrations or user profile
    let defaultPhone = '+919920858396';
    if (userId) {
      try {
        const phoneRes = await query(
          `SELECT display_phone_number FROM meta_integrations WHERE user_id = $1 AND status = 'connected' LIMIT 1`,
          [userId]
        );
        if (phoneRes.rows[0]?.display_phone_number) {
          defaultPhone = phoneRes.rows[0].display_phone_number;
        }
      } catch (e) {}
    }

    const id = `shpw_${shopDomain.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const insertRes = await query(
      `INSERT INTO shopify_storefront_widgets (
         id, user_id, shop_domain, is_enabled, phone_number, widget_position,
         brand_name, brand_color, brand_avatar_url, welcome_heading, welcome_subheading,
         default_chat_message, call_to_action_badge, show_on_mobile, show_on_desktop,
         buy_button_enabled, buy_button_text, buy_button_style, buy_button_bg_color,
         buy_button_text_color, buy_button_template, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
       )
       ON CONFLICT (shop_domain) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        id,
        userId || 'usr_1',
        shopDomain,
        DEFAULT_WIDGET_CONFIG.is_enabled,
        defaultPhone,
        DEFAULT_WIDGET_CONFIG.widget_position,
        DEFAULT_WIDGET_CONFIG.brand_name,
        DEFAULT_WIDGET_CONFIG.brand_color,
        DEFAULT_WIDGET_CONFIG.brand_avatar_url,
        DEFAULT_WIDGET_CONFIG.welcome_heading,
        DEFAULT_WIDGET_CONFIG.welcome_subheading,
        DEFAULT_WIDGET_CONFIG.default_chat_message,
        DEFAULT_WIDGET_CONFIG.call_to_action_badge,
        DEFAULT_WIDGET_CONFIG.show_on_mobile,
        DEFAULT_WIDGET_CONFIG.show_on_desktop,
        DEFAULT_WIDGET_CONFIG.buy_button_enabled,
        DEFAULT_WIDGET_CONFIG.buy_button_text,
        DEFAULT_WIDGET_CONFIG.buy_button_style,
        DEFAULT_WIDGET_CONFIG.buy_button_bg_color,
        DEFAULT_WIDGET_CONFIG.buy_button_text_color,
        DEFAULT_WIDGET_CONFIG.buy_button_template,
      ]
    );

    return insertRes.rows[0];
  },

  /**
   * Update widget configuration
   */
  updateWidgetConfig: async ({ shopDomain, userId, updates }) => {
    if (!shopDomain) throw new Error('shopDomain is required');

    const allowed = [
      'is_enabled',
      'phone_number',
      'widget_position',
      'brand_name',
      'brand_color',
      'brand_avatar_url',
      'welcome_heading',
      'welcome_subheading',
      'default_chat_message',
      'call_to_action_badge',
      'show_on_mobile',
      'show_on_desktop',
      'buy_button_enabled',
      'buy_button_text',
      'buy_button_style',
      'buy_button_bg_color',
      'buy_button_text_color',
      'buy_button_template',
    ];

    const fields = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(updates[key]);
      }
    }

    if (fields.length === 0) {
      return shopifyWidgetService.getWidgetConfig({ shopDomain, userId });
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(shopDomain);

    const updateQuery = `
      UPDATE shopify_storefront_widgets
      SET ${fields.join(', ')}
      WHERE shop_domain = $${idx}
      RETURNING *
    `;

    const res = await query(updateQuery, values);
    return res.rows[0] || null;
  },

  /**
   * Public storefront config (sanitized)
   */
  getPublicConfig: async (shopDomain) => {
    if (!shopDomain) return null;
    const res = await query(
      `SELECT is_enabled, phone_number, widget_position, brand_name, brand_color,
              brand_avatar_url, welcome_heading, welcome_subheading, default_chat_message,
              call_to_action_badge, show_on_mobile, show_on_desktop, buy_button_enabled,
              buy_button_text, buy_button_style, buy_button_bg_color, buy_button_text_color,
              buy_button_template
       FROM shopify_storefront_widgets
       WHERE shop_domain = $1
       LIMIT 1`,
      [shopDomain]
    );

    return res.rows[0] || null;
  },

  /**
   * Generates the browser JavaScript widget bundle for the storefront
   */
  generateWidgetScript: (shopDomain, config) => {
    const cfg = config || DEFAULT_WIDGET_CONFIG;
    if (!cfg.is_enabled) {
      return `/* ARCO WhatsApp Widget is currently disabled for ${shopDomain} */`;
    }

    return `
/**
 * ARCO WhatsApp Storefront Widget & Buy on WhatsApp Button
 * Shop: ${shopDomain}
 */
(function() {
  if (window.__ARCO_WHATSAPP_LOADED__) return;
  window.__ARCO_WHATSAPP_LOADED__ = true;

  var config = ${JSON.stringify(cfg)};
  var cleanPhone = (config.phone_number || '').replace(/\\D/g, '');
  if (!cleanPhone) cleanPhone = '919920858396';

  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile && config.show_on_mobile === false) return;
  if (!isMobile && config.show_on_desktop === false) return;

  // 1. Inject Styles
  var style = document.createElement('style');
  style.id = 'arco-whatsapp-styles';
  style.textContent = \`
    .arco-wa-container {
      position: fixed;
      \${config.widget_position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
      bottom: 24px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: \${config.widget_position === 'bottom-left' ? 'flex-start' : 'flex-end'};
    }
    .arco-wa-badge {
      background: #ffffff;
      color: #1e293b;
      padding: 7px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      margin-bottom: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid rgba(0,0,0,0.06);
      transition: transform 0.2s, box-shadow 0.2s;
      animation: arco-fade-in 0.4s ease;
    }
    .arco-wa-badge:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.16);
    }
    .arco-wa-badge-dot {
      width: 8px;
      height: 8px;
      background: #25D366;
      border-radius: 50%;
      display: inline-block;
    }
    .arco-wa-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: \${config.brand_color || '#25D366'};
      color: white;
      border: none;
      box-shadow: 0 4px 20px rgba(37, 211, 102, 0.45);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s;
    }
    .arco-wa-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 8px 25px rgba(37, 211, 102, 0.55);
    }
    .arco-wa-btn svg {
      width: 32px;
      height: 32px;
      fill: currentColor;
    }
    .arco-wa-modal {
      display: none;
      position: fixed;
      \${config.widget_position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
      bottom: 96px;
      width: 340px;
      max-width: calc(100vw - 40px);
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 12px 35px rgba(0,0,0,0.18);
      overflow: hidden;
      z-index: 999999;
      font-family: inherit;
      animation: arco-scale-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid rgba(0,0,0,0.06);
    }
    .arco-wa-modal.open {
      display: block;
    }
    .arco-wa-modal-header {
      background: \${config.brand_color || '#075e54'};
      color: #ffffff;
      padding: 16px;
      position: relative;
    }
    .arco-wa-modal-title {
      font-size: 15px;
      font-weight: 700;
      margin: 0;
      line-height: 1.3;
    }
    .arco-wa-modal-sub {
      font-size: 12px;
      opacity: 0.9;
      margin: 4px 0 0 0;
    }
    .arco-wa-close-btn {
      position: absolute;
      top: 14px;
      right: 14px;
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      opacity: 0.8;
    }
    .arco-wa-close-btn:hover { opacity: 1; }
    .arco-wa-modal-body {
      background: #e5ddd5;
      padding: 16px;
      background-image: radial-gradient(#d4cbc2 1px, transparent 1px);
      background-size: 16px 16px;
    }
    .arco-wa-bubble {
      background: #ffffff;
      color: #111827;
      padding: 12px 14px;
      border-radius: 12px 12px 12px 2px;
      font-size: 13px;
      line-height: 1.45;
      box-shadow: 0 2px 5px rgba(0,0,0,0.08);
    }
    .arco-wa-modal-footer {
      background: #ffffff;
      padding: 12px 16px;
      border-top: 1px solid #f1f5f9;
    }
    .arco-wa-start-chat-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      background: \${config.brand_color || '#25D366'};
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 11px 16px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }
    .arco-wa-start-chat-btn:hover {
      filter: brightness(0.95);
      transform: translateY(-1px);
    }
    /* Order on WhatsApp Product Button */
    .arco-order-wa-btn {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 10px !important;
      width: 100% !important;
      box-sizing: border-box !important;
      margin-top: 12px !important;
      margin-bottom: 12px !important;
      padding: 13px 20px !important;
      border-radius: 8px !important;
      background-color: \${config.buy_button_bg_color || '#25D366'} !important;
      color: \${config.buy_button_text_color || '#FFFFFF'} !important;
      font-size: 15px !important;
      font-weight: 700 !important;
      text-decoration: none !important;
      cursor: pointer !important;
      border: \${config.buy_button_style === 'outline' ? '2px solid ' + (config.buy_button_bg_color || '#25D366') : 'none'} !important;
      box-shadow: 0 3px 12px rgba(37, 211, 102, 0.25) !important;
      transition: transform 0.2s, box-shadow 0.2s, filter 0.2s !important;
      font-family: inherit !important;
    }
    .arco-order-wa-btn:hover {
      filter: brightness(0.94);
      transform: translateY(-1px);
      box-shadow: 0 5px 16px rgba(37, 211, 102, 0.35) !important;
    }
    @keyframes arco-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes arco-scale-up { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
  \`;
  document.head.appendChild(style);

  // 2. Render Floating Widget
  var container = document.createElement('div');
  container.className = 'arco-wa-container';

  var waIconSvg = '<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

  if (config.call_to_action_badge) {
    var badge = document.createElement('div');
    badge.className = 'arco-wa-badge';
    badge.innerHTML = '<span class="arco-wa-badge-dot"></span> ' + config.call_to_action_badge;
    badge.onclick = toggleModal;
    container.appendChild(badge);
  }

  var btn = document.createElement('button');
  btn.className = 'arco-wa-btn';
  btn.setAttribute('aria-label', 'Chat on WhatsApp');
  btn.innerHTML = waIconSvg;
  btn.onclick = toggleModal;
  container.appendChild(btn);

  // Modal
  var modal = document.createElement('div');
  modal.className = 'arco-wa-modal';
  modal.innerHTML = \`
    <div class="arco-wa-modal-header">
      <h4 class="arco-wa-modal-title">\${config.welcome_heading || 'Need Help? Chat with Us!'}</h4>
      <div class="arco-wa-modal-sub">\${config.welcome_subheading || 'Typically replies within a few minutes.'}</div>
      <button class="arco-wa-close-btn" aria-label="Close">&times;</button>
    </div>
    <div class="arco-wa-modal-body">
      <div class="arco-wa-bubble">
        \${config.default_chat_message || 'Hello! I have a question about your products.'}
      </div>
    </div>
    <div class="arco-wa-modal-footer">
      <a class="arco-wa-start-chat-btn" target="_blank" rel="noopener noreferrer" href="https://wa.me/\${cleanPhone}?text=\${encodeURIComponent(config.default_chat_message || 'Hello!')}">
        \${waIconSvg} \${config.call_to_action_badge || 'Start Chat'}
      </a>
    </div>
  \`;
  document.body.appendChild(modal);
  document.body.appendChild(container);

  var closeBtn = modal.querySelector('.arco-wa-close-btn');
  if (closeBtn) closeBtn.onclick = function() { modal.classList.remove('open'); };

  function toggleModal() {
    modal.classList.toggle('open');
  }

  // 3. Inject "Order on WhatsApp" Button on Shopify Product Pages
  if (config.buy_button_enabled) {
    function injectOrderButton() {
      if (document.querySelector('.arco-order-wa-btn')) return;

      var isProductPage = window.location.pathname.indexOf('/products/') !== -1 ||
                          document.querySelector('meta[property="og:type"][content="product"]') ||
                          document.querySelector('form[action*="/cart/add"]');

      if (!isProductPage) return;

      // Locate Shopify product form or buy buttons container
      var target = document.querySelector('.shopify-payment-button') ||
                   document.querySelector('form[action*="/cart/add"] button[type="submit"]') ||
                   document.querySelector('form[action*="/cart/add"] .product-form__buttons') ||
                   document.querySelector('form[action*="/cart/add"]');

      if (!target) return;

      // Extract product details
      var productTitle = '';
      var titleEl = document.querySelector('.product__title, .product-single__title, h1.title, h1');
      if (titleEl) productTitle = titleEl.innerText.trim();
      if (!productTitle) productTitle = document.title.split('–')[0].split('-')[0].trim();

      var productPrice = '';
      var priceEl = document.querySelector('.price__regular .price-item--regular, .product-price, .price, .product__price');
      if (priceEl) productPrice = priceEl.innerText.trim();

      var productUrl = window.location.href;

      var template = config.buy_button_template || 'Hi, I would like to order {{product_title}} (Price: {{product_price}}) from {{store_url}}. Please confirm availability!';
      var message = template
        .replace(/{{product_title}}/g, productTitle)
        .replace(/{{product_price}}/g, productPrice || 'Listed Price')
        .replace(/{{store_url}}/g, productUrl);

      var buyBtn = document.createElement('a');
      buyBtn.className = 'arco-order-wa-btn';
      buyBtn.target = '_blank';
      buyBtn.rel = 'noopener noreferrer';
      buyBtn.href = 'https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(message);
      buyBtn.innerHTML = '<span style="display:inline-flex;width:20px;height:20px;">' + waIconSvg + '</span> ' + (config.buy_button_text || 'Order on WhatsApp');

      if (target.parentNode) {
        if (target.classList && target.classList.contains('shopify-payment-button')) {
          target.parentNode.insertBefore(buyBtn, target.nextSibling);
        } else if (target.tagName.toLowerCase() === 'form') {
          target.appendChild(buyBtn);
        } else {
          target.parentNode.insertBefore(buyBtn, target.nextSibling);
        }
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectOrderButton);
    } else {
      injectOrderButton();
    }
    // Re-check after 1.5s in case of dynamic liquid hydration
    setTimeout(injectOrderButton, 1500);
  }
})();
    `.trim();
  },
};
