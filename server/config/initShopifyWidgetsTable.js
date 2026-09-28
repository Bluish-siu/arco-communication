import { query } from './db.js';

export async function initShopifyWidgetsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS shopify_storefront_widgets (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        shop_domain VARCHAR(255) NOT NULL UNIQUE,
        is_enabled BOOLEAN DEFAULT true,
        phone_number VARCHAR(50) DEFAULT '+919920858396',
        widget_position VARCHAR(20) DEFAULT 'bottom-right',
        brand_name VARCHAR(100) DEFAULT 'ARCO Support',
        brand_color VARCHAR(30) DEFAULT '#25D366',
        brand_avatar_url TEXT DEFAULT '',
        welcome_heading VARCHAR(150) DEFAULT 'Need Help? Chat with Us!',
        welcome_subheading VARCHAR(255) DEFAULT 'Typically replies within a few minutes.',
        default_chat_message TEXT DEFAULT 'Hello! I have a question about your products.',
        call_to_action_badge VARCHAR(100) DEFAULT 'Chat on WhatsApp',
        show_on_mobile BOOLEAN DEFAULT true,
        show_on_desktop BOOLEAN DEFAULT true,
        buy_button_enabled BOOLEAN DEFAULT true,
        buy_button_text VARCHAR(100) DEFAULT 'Order on WhatsApp',
        buy_button_style VARCHAR(50) DEFAULT 'solid',
        buy_button_bg_color VARCHAR(30) DEFAULT '#25D366',
        buy_button_text_color VARCHAR(30) DEFAULT '#FFFFFF',
        buy_button_template TEXT DEFAULT 'Hi, I would like to order {{product_title}} (Price: {{product_price}}) from {{store_url}}. Please confirm availability!',
        script_tag_id VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_shopify_storefront_widgets_shop ON shopify_storefront_widgets(shop_domain);
    `);
    console.log('[PostgreSQL] shopify_storefront_widgets table initialized successfully.');
  } catch (err) {
    console.error('[PostgreSQL] Failed to initialize shopify_storefront_widgets table:', err.message);
  }
}
