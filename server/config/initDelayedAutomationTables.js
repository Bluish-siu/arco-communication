import { query } from './db.js';

export async function initDelayedAutomationSchema() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS delayed_automation_jobs (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        conversation_id VARCHAR(100) NOT NULL,
        contact_id VARCHAR(100),
        contact_phone VARCHAR(50) NOT NULL,
        triggering_wamid VARCHAR(255) NOT NULL,
        automation_type VARCHAR(50) DEFAULT 'delayed_response',
        message_text TEXT NOT NULL,
        scheduled_at TIMESTAMPTZ NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        cancellation_reason VARCHAR(255),
        error_message TEXT,
        meta_message_id VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        executed_at TIMESTAMPTZ,
        cancelled_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_delayed_jobs_due 
        ON delayed_automation_jobs (status, scheduled_at);

      CREATE INDEX IF NOT EXISTS idx_delayed_jobs_conv 
        ON delayed_automation_jobs (conversation_id, status);

      CREATE INDEX IF NOT EXISTS idx_delayed_jobs_wamid 
        ON delayed_automation_jobs (triggering_wamid, automation_type);
    `);
    console.log('[PostgreSQL] delayed_automation_jobs table and indexes verified.');
  } catch (err) {
    console.error('[PostgreSQL Error creating delayed_automation_jobs]:', err.message);
  }
}
