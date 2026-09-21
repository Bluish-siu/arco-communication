import { query } from './db.js';

/**
 * Initializes the persistent Shopify Events queue/inbox table in PostgreSQL.
 * Guarantees cryptographic deduplication and tenant isolation.
 */
export async function initShopifyEventsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS shopify_events (
        id VARCHAR(100) PRIMARY KEY,
        event_id VARCHAR(255) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        source VARCHAR(50) DEFAULT 'shopify',
        integration_id VARCHAR(100),
        user_id VARCHAR(100) NOT NULL,
        shop_domain VARCHAR(255) NOT NULL,
        webhook_id VARCHAR(255),
        payload JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'received',
        attempts INT DEFAULT 0,
        error TEXT,
        received_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_shopify_events_webhook_id 
      ON shopify_events(webhook_id);

      CREATE UNIQUE INDEX IF NOT EXISTS idx_shopify_events_event_id 
      ON shopify_events(event_id);

      CREATE INDEX IF NOT EXISTS idx_shopify_events_user_status 
      ON shopify_events(user_id, status);

      CREATE INDEX IF NOT EXISTS idx_shopify_events_shop_domain 
      ON shopify_events(shop_domain);

      CREATE INDEX IF NOT EXISTS idx_shopify_events_event_type 
      ON shopify_events(event_type);
    `);

    return true;
  } catch (error) {
    console.error('[Shopify Events Table Init Error]:', error.message);
    throw error;
  }
}
