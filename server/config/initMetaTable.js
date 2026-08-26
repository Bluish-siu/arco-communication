import { query } from './db.js';

export async function initMetaIntegrationsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS meta_integrations (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100),
        meta_business_id VARCHAR(100),
        waba_id VARCHAR(100),
        phone_number_id VARCHAR(100),
        display_phone_number VARCHAR(100),
        business_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'connected',
        access_token_encrypted TEXT,
        token_expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[PostgreSQL] meta_integrations table verified/created.');
  } catch (err) {
    console.error('[PostgreSQL Error creating meta_integrations]:', err.message);
  }
}

initMetaIntegrationsTable();
