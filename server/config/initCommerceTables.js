import { query } from './db.js';

const INITIAL_SANDBOX_PRODUCTS = [
  {
    id: 'prod_101',
    external_product_id: 'SKU_SNK_01',
    title: 'Urban Runner Pro Sneakers',
    description: 'Lightweight breathable running shoes with high-traction rubber outsole and cushioned sole.',
    price: 3499.00,
    availability: 'in stock',
    image_link: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60',
    brand: 'ARCO Footwear',
  },
  {
    id: 'prod_102',
    external_product_id: 'SKU_HDP_02',
    title: 'Noise Cancelling Wireless Headphones',
    description: 'Over-ear Bluetooth headphones with active noise cancellation, 40h battery life, and spatial audio.',
    price: 5999.00,
    availability: 'in stock',
    image_link: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60',
    brand: 'ARCO Audio',
  },
  {
    id: 'prod_103',
    external_product_id: 'SKU_WCH_03',
    title: 'Aura AMOLED Smartwatch Elite',
    description: 'Always-on 1.43" AMOLED display, SpO2 blood oxygen monitor, GPS tracking, and IP68 water resistance.',
    price: 4299.00,
    availability: 'in stock',
    image_link: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60',
    brand: 'ARCO Wearables',
  },
  {
    id: 'prod_104',
    external_product_id: 'SKU_TSH_04',
    title: 'Organic Cotton Classic Tee (Onyx Black)',
    description: '100% combed ringspun organic cotton, pre-shrunk, ultra-soft breathable everyday fit.',
    price: 899.00,
    availability: 'in stock',
    image_link: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=60',
    brand: 'ARCO Apparel',
  },
  {
    id: 'prod_105',
    external_product_id: 'SKU_COF_05',
    title: 'Artisan Dark Roast Coffee Beans (500g)',
    description: 'Single-origin Arabica coffee beans from Chikmagalur estate with notes of cocoa and roasted hazelnut.',
    price: 650.00,
    availability: 'in stock',
    image_link: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=60',
    brand: 'ARCO Roasters',
  },
  {
    id: 'prod_106',
    external_product_id: 'SKU_BAG_06',
    title: 'Water-Resistant Commuter Backpack (25L)',
    description: 'Ergonomic laptop backpack with dedicated 16" compartment, USB charging port, and anti-theft zipper.',
    price: 2199.00,
    availability: 'in stock',
    image_link: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=60',
    brand: 'ARCO Gear',
  },
];

async function initCommerceTables() {
  try {
    console.log('[PostgreSQL] Initializing Commerce Settings & Catalog Tables...');

    // 1. Create commerce_settings table
    await query(`
      CREATE TABLE IF NOT EXISTS commerce_settings (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) DEFAULT 'usr_1',
        catalog_id VARCHAR(255),
        catalog_name VARCHAR(255),
        catalog_status VARCHAR(50) DEFAULT 'disconnected',
        connected_at TIMESTAMPTZ,
        message_settings JSONB DEFAULT '{"title": "Explore our Latest Products", "body": "Browse our complete store catalog and place orders directly on WhatsApp with free delivery.", "cta": "View Catalog", "enabled": true}',
        campaign_settings JSONB DEFAULT '{"catalogId": "", "campaignName": "Spring Launch Collection", "enabled": true}',
        auto_reply_settings JSONB DEFAULT '{"keywords": ["catalog", "products", "price", "menu", "store", "buy"], "replyText": "Here is our product catalogue! Tap below to view items and place your order.", "enabled": true}',
        autocheckout_settings JSONB DEFAULT '{"enabled": true, "paymentMode": "cod_and_upi", "orderConfirmationMsg": "Thank you for your order! Our team will process and ship your items shortly."}',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create catalog_products table
    await query(`
      CREATE TABLE IF NOT EXISTS catalog_products (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) DEFAULT 'usr_1',
        external_product_id VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(12, 2) DEFAULT 0,
        availability VARCHAR(50) DEFAULT 'in stock',
        image_link TEXT,
        brand VARCHAR(255) DEFAULT 'ARCO',
        catalog_id VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Ensure Default Setting Record exists
    const existingSettings = await query('SELECT * FROM commerce_settings WHERE id = $1', ['comm_settings_default']);
    if (existingSettings.rows.length === 0) {
      await query(`
        INSERT INTO commerce_settings (
          id, user_id, catalog_id, catalog_name, catalog_status, connected_at,
          message_settings, campaign_settings, auto_reply_settings, autocheckout_settings
        ) VALUES (
          'comm_settings_default',
          'usr_1',
          'cat_9082410291',
          'ARCO Official Storefront Catalog',
          'connected',
          CURRENT_TIMESTAMP,
          '{"title": "Explore our Latest Products", "body": "Browse our complete store catalog and place orders directly on WhatsApp with free delivery.", "cta": "View Catalog", "enabled": true}',
          '{"catalogId": "cat_9082410291", "campaignName": "Spring Launch Collection", "enabled": true}',
          '{"keywords": ["catalog", "products", "price", "menu", "store", "buy"], "replyText": "Here is our product catalogue! Tap below to view items and place your order.", "enabled": true}',
          '{"enabled": true, "paymentMode": "cod_and_upi", "orderConfirmationMsg": "Thank you for your order! Our team will process and ship your items shortly."}'
        )
      `);
      console.log('[PostgreSQL] Inserted default commerce settings record.');
    }

    // 4. Seed initial sandbox products if empty
    const productCountRes = await query('SELECT COUNT(*) FROM catalog_products');
    if (parseInt(productCountRes.rows[0].count, 10) === 0) {
      for (const p of INITIAL_SANDBOX_PRODUCTS) {
        await query(
          `INSERT INTO catalog_products (id, user_id, external_product_id, title, description, price, availability, image_link, brand, catalog_id, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
           ON CONFLICT (id) DO NOTHING`,
          [p.id, 'usr_1', p.external_product_id, p.title, p.description, p.price, p.availability, p.image_link, p.brand, 'cat_9082410291']
        );
      }
      console.log(`[PostgreSQL] Seeded ${INITIAL_SANDBOX_PRODUCTS.length} sandbox products.`);
    }

    console.log('[PostgreSQL] Commerce tables initialization complete!');
  } catch (err) {
    console.error('Error initializing commerce tables:', err);
  } finally {
    process.exit(0);
  }
}

initCommerceTables();
