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
        number_type VARCHAR(50) DEFAULT 'wa_business',
        country VARCHAR(100) DEFAULT 'India',
        verification_status VARCHAR(50) DEFAULT 'unverified',
        verification_method VARCHAR(50) DEFAULT 'gst',
        gst_number VARCHAR(100),
        gst_file_url TEXT,
        gst_file_name VARCHAR(255),
        website_url TEXT,
        business_email VARCHAR(255),
        messaging_limit VARCHAR(100) DEFAULT '250 msgs/day',
        is_meta_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE meta_integrations ADD COLUMN IF NOT EXISTS number_type VARCHAR(50) DEFAULT 'wa_business';
      ALTER TABLE meta_integrations ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India';
      ALTER TABLE meta_integrations ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'unverified';
      ALTER TABLE meta_integrations ADD COLUMN IF NOT EXISTS verification_method VARCHAR(50) DEFAULT 'gst';
      ALTER TABLE meta_integrations ADD COLUMN IF NOT EXISTS gst_number VARCHAR(100);
      ALTER TABLE meta_integrations ADD COLUMN IF NOT EXISTS gst_file_url TEXT;
      ALTER TABLE meta_integrations ADD COLUMN IF NOT EXISTS gst_file_name VARCHAR(255);
      ALTER TABLE meta_integrations ADD COLUMN IF NOT EXISTS website_url TEXT;
      ALTER TABLE meta_integrations ADD COLUMN IF NOT EXISTS business_email VARCHAR(255);
      ALTER TABLE meta_integrations ADD COLUMN IF NOT EXISTS messaging_limit VARCHAR(100) DEFAULT '250 msgs/day';
      ALTER TABLE meta_integrations ADD COLUMN IF NOT EXISTS is_meta_verified BOOLEAN DEFAULT FALSE;
    `);
    console.log('[PostgreSQL] meta_integrations table verified/updated with full verification metadata.');
  } catch (err) {
    console.error('[PostgreSQL Error creating meta_integrations]:', err.message);
  }
}

initMetaIntegrationsTable();
