import { query } from './db.js';

export async function initFlowSchema() {
  try {
    await query(`
      ALTER TABLE whatsapp_forms ADD COLUMN IF NOT EXISTS meta_flow_id VARCHAR(100);
      ALTER TABLE whatsapp_forms ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]';
      ALTER TABLE whatsapp_forms ADD COLUMN IF NOT EXISTS validation_errors JSONB DEFAULT '[]';
      ALTER TABLE whatsapp_forms ADD COLUMN IF NOT EXISTS json_version VARCHAR(20);
      ALTER TABLE whatsapp_forms ADD COLUMN IF NOT EXISTS data_api_version VARCHAR(20);
      ALTER TABLE whatsapp_forms ADD COLUMN IF NOT EXISTS endpoint_uri TEXT;

      CREATE INDEX IF NOT EXISTS idx_whatsapp_forms_meta_flow_id ON whatsapp_forms(meta_flow_id);

      ALTER TABLE whatsapp_form_responses ADD COLUMN IF NOT EXISTS meta_flow_id VARCHAR(100);
      ALTER TABLE whatsapp_form_responses ADD COLUMN IF NOT EXISTS flow_token VARCHAR(255);
      ALTER TABLE whatsapp_form_responses ADD COLUMN IF NOT EXISTS raw_submission JSONB DEFAULT '{}';
      ALTER TABLE whatsapp_form_responses ADD COLUMN IF NOT EXISTS meta_message_id VARCHAR(100);

      CREATE INDEX IF NOT EXISTS idx_whatsapp_form_responses_meta_flow_id ON whatsapp_form_responses(meta_flow_id);
      CREATE INDEX IF NOT EXISTS idx_whatsapp_form_responses_flow_token ON whatsapp_form_responses(flow_token);
      CREATE INDEX IF NOT EXISTS idx_whatsapp_form_responses_meta_msg_id ON whatsapp_form_responses(meta_message_id);
    `);
    console.log('[PostgreSQL] Flow integration columns and indexes verified.');
  } catch (err) {
    console.error('[PostgreSQL Error initializing Flow schema]:', err.message);
  }
}
