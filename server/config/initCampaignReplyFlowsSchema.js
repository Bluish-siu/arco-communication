import { query } from './db.js';

/**
 * Initializes the database schema for Campaign Post-Campaign Reply Flows:
 * 1. Adds post_campaign_reply_flows JSONB column to campaigns table
 * 2. Creates campaign_reply_flow_logs table for idempotency and audit tracking
 */
export async function initCampaignReplyFlowsSchema() {
  console.log('[DB] Checking Campaign Post-Campaign Reply Flows schema...');

  // 1. Add post_campaign_reply_flows column to campaigns
  await query(`
    ALTER TABLE campaigns 
    ADD COLUMN IF NOT EXISTS post_campaign_reply_flows JSONB DEFAULT '{}'::jsonb;
  `);

  // 2. Create campaign_reply_flow_logs table for idempotency and audit tracking
  await query(`
    CREATE TABLE IF NOT EXISTS campaign_reply_flow_logs (
      id VARCHAR(100) PRIMARY KEY,
      campaign_id VARCHAR(100) REFERENCES campaigns(id) ON DELETE CASCADE,
      recipient_id VARCHAR(100),
      contact_id VARCHAR(100),
      phone VARCHAR(50),
      inbound_meta_message_id VARCHAR(255) UNIQUE,
      flow_type VARCHAR(50) NOT NULL,
      trigger_matched VARCHAR(255),
      action_executed VARCHAR(255),
      outbound_meta_message_id VARCHAR(255),
      status VARCHAR(50) DEFAULT 'success',
      error_message TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_crf_inbound_wamid 
    ON campaign_reply_flow_logs(inbound_meta_message_id);
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_crf_campaign_id 
    ON campaign_reply_flow_logs(campaign_id);
  `);

  console.log('[DB] Campaign Post-Campaign Reply Flows schema verified successfully.');
}
