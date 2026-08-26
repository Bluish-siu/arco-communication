import { query } from './db.js';

export async function initShopifyIntegrationsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS shopify_integrations (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        shop_domain VARCHAR(255) NOT NULL,
        shop_name VARCHAR(255),
        access_token TEXT,
        scopes VARCHAR(255),
        status VARCHAR(50) DEFAULT 'connected',
        installed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_shopify_integrations_user_id ON shopify_integrations(user_id);
    `);
    console.log('[PostgreSQL] shopify_integrations table initialized successfully.');
  } catch (err) {
    console.error('[PostgreSQL] Failed to initialize shopify_integrations table:', err);
  }
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith('initShopifyIntegrationsTable.js')) {
  initShopifyIntegrationsTable().then(() => process.exit(0));
}
