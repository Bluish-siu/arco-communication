import { query } from './db.js';

async function migrateUsersTable() {
  try {
    console.log('Migrating users table for Google OAuth stable identity...');
    await query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
    `);
    console.log('[Migration SUCCESS] google_id and avatar_url columns verified in users table.');
  } catch (err) {
    console.error('[Migration ERROR]:', err);
  }
}

migrateUsersTable();
