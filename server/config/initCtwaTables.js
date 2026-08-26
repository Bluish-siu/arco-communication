import { query } from './db.js';

export async function initCtwaTables() {
  console.log('[PostgreSQL] Initializing CTWA & Meta Ads database tables...');

  try {
    // 1. CTWA Integrations Table
    await query(`
      CREATE TABLE IF NOT EXISTS ctwa_integrations (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        facebook_page_id VARCHAR(100),
        facebook_page_name VARCHAR(255),
        meta_ad_account_id VARCHAR(100),
        meta_ad_account_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'not_connected',
        onboarding_step VARCHAR(50) DEFAULT 'FACEBOOK_PAGE_REQUIRED',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Facebook Pages Table (includes drafts and connected pages)
    await query(`
      CREATE TABLE IF NOT EXISTS facebook_pages (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        meta_page_id VARCHAR(100),
        page_name VARCHAR(255) NOT NULL,
        about TEXT,
        category VARCHAR(100),
        display_picture_url TEXT,
        cover_picture_url TEXT,
        country VARCHAR(100),
        address TEXT,
        status VARCHAR(50) DEFAULT 'connected',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Meta Ad Accounts Table
    await query(`
      CREATE TABLE IF NOT EXISTS meta_ad_accounts (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        meta_ad_account_id VARCHAR(100) NOT NULL,
        account_name VARCHAR(255) NOT NULL,
        account_status VARCHAR(50) DEFAULT 'ACTIVE',
        currency VARCHAR(10) DEFAULT 'INR',
        timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
        status VARCHAR(50) DEFAULT 'connected',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure index on user_id for isolation
    await query(`CREATE INDEX IF NOT EXISTS idx_ctwa_integrations_user ON ctwa_integrations(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_facebook_pages_user ON facebook_pages(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_meta_ad_accounts_user ON meta_ad_accounts(user_id);`);

    console.log('[PostgreSQL] CTWA & Meta Ads tables initialized successfully.');
  } catch (err) {
    console.error('[PostgreSQL Error initializing CTWA tables]:', err);
    throw err;
  }
}

if (process.argv[1]?.includes('initCtwaTables')) {
  initCtwaTables()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
