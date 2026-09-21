import { query } from './db.js';

/**
 * Initializes the shopify_sync_jobs table for tracking historical bulk imports.
 */
export async function initShopifySyncJobsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS shopify_sync_jobs (
        id VARCHAR(255) PRIMARY KEY,
        integration_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        shop_domain VARCHAR(255) NOT NULL,
        sync_type VARCHAR(50) DEFAULT 'full',
        status VARCHAR(50) DEFAULT 'queued',
        current_stage VARCHAR(50) DEFAULT 'customers',
        cursor VARCHAR(255) DEFAULT NULL,
        stage_progress JSONB DEFAULT '{"customers":{"processed":0,"total":null},"products":{"processed":0,"total":null},"orders":{"processed":0,"total":null}}'::jsonb,
        processed_count INTEGER DEFAULT 0,
        total_count INTEGER DEFAULT NULL,
        error TEXT DEFAULT NULL,
        started_at TIMESTAMPTZ DEFAULT NULL,
        completed_at TIMESTAMPTZ DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_shopify_sync_jobs_user_id ON shopify_sync_jobs(user_id);
      CREATE INDEX IF NOT EXISTS idx_shopify_sync_jobs_integration_id ON shopify_sync_jobs(integration_id);
      CREATE INDEX IF NOT EXISTS idx_shopify_sync_jobs_status ON shopify_sync_jobs(status);
      CREATE INDEX IF NOT EXISTS idx_shopify_sync_jobs_shop_domain ON shopify_sync_jobs(shop_domain);
    `);

    console.log('[PostgreSQL] shopify_sync_jobs schema initialized successfully.');
  } catch (error) {
    console.error('[PostgreSQL] Failed to initialize shopify_sync_jobs schema:', error.message);
    throw error;
  }
}
