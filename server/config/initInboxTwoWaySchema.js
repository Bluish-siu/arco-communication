import { pool } from './db.js';

export async function initInboxTwoWaySchema() {
  console.log('[DB] Enhancing messages and conversations tables for Two-Way WhatsApp Inbox...');
  try {
    // 1. Add Two-Way WhatsApp fields to messages table
    await pool.query(`
      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS meta_message_id VARCHAR(120),
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'sent',
      ADD COLUMN IF NOT EXISTS error_message TEXT,
      ADD COLUMN IF NOT EXISTS message_type VARCHAR(50) DEFAULT 'text';
    `);

    // 2. Add 24-Hour WhatsApp Session Window tracking to conversations table
    await pool.query(`
      ALTER TABLE conversations 
      ADD COLUMN IF NOT EXISTS last_inbound_at TIMESTAMPTZ;
    `);

    // 3. Create high-performance indexes for webhook and phone lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_meta_message_id ON messages (meta_message_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_phone ON conversations (phone);
    `);

    console.log('[DB] Two-Way WhatsApp Inbox schema successfully initialized!');
    return true;
  } catch (err) {
    console.error('[DB Error in initInboxTwoWaySchema]:', err.message);
    return false;
  }
}

if (process.argv[1]?.endsWith('initInboxTwoWaySchema.js')) {
  initInboxTwoWaySchema().then(() => {
    if (pool) pool.end();
    process.exit(0);
  });
}
