import { query } from './db.js';

export async function initAuthOtpsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS auth_otps (
        id VARCHAR(64) PRIMARY KEY,
        phone VARCHAR(32) NOT NULL,
        otp_code VARCHAR(16) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        attempts INT DEFAULT 0,
        is_used BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_auth_otps_phone ON auth_otps(phone);
      CREATE INDEX IF NOT EXISTS idx_auth_otps_expires ON auth_otps(expires_at);
    `);
    console.log('[PostgreSQL] auth_otps table initialized successfully.');
  } catch (err) {
    console.error('[PostgreSQL] Failed to initialize auth_otps table:', err.message);
  }
}
