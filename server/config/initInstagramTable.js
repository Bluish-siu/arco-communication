import { query } from './db.js';

export async function initInstagramTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS instagram_integrations (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100),
        page_id VARCHAR(100),
        page_name VARCHAR(255),
        page_access_token TEXT,
        instagram_business_account_id VARCHAR(100),
        instagram_username VARCHAR(100),
        instagram_name VARCHAR(255),
        profile_picture_url TEXT,
        status VARCHAR(50) DEFAULT 'connected',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_instagram_integrations_user_id ON instagram_integrations(user_id);
      CREATE INDEX IF NOT EXISTS idx_instagram_integrations_ig_id ON instagram_integrations(instagram_business_account_id);
    `);
    console.log('[PostgreSQL] instagram_integrations table verified/ready.');
    return true;
  } catch (err) {
    console.error('[PostgreSQL Error creating instagram_integrations]:', err.message);
    return false;
  }
}

if (process.argv[1]?.endsWith('initInstagramTable.js')) {
  initInstagramTable().then(() => process.exit(0));
}
