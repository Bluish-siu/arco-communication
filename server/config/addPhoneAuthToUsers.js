import { query } from './db.js';

async function migratePhoneAuth() {
  try {
    console.log('Migrating users table for Firebase Phone Authentication...');
    await query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255);
      ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    `);
    console.log('[Migration SUCCESS] firebase_uid column and indexes added, email made nullable.');
  } catch (err) {
    console.error('[Migration ERROR]:', err);
  }
}

migratePhoneAuth();
