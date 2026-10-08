import { query } from '../config/db.js';

async function migrateColumns() {
  try {
    console.log('Altering whatsapp_templates columns to TEXT...');
    await query(`
      ALTER TABLE whatsapp_templates ALTER COLUMN display_name TYPE text;
      ALTER TABLE whatsapp_templates ALTER COLUMN name TYPE text;
      ALTER TABLE whatsapp_templates ALTER COLUMN created_by TYPE text;
      ALTER TABLE whatsapp_templates ALTER COLUMN meta_template_id TYPE text;
      ALTER TABLE whatsapp_templates ALTER COLUMN waba_id TYPE text;
      ALTER TABLE whatsapp_templates ALTER COLUMN workspace_id TYPE text;
      ALTER TABLE whatsapp_templates ALTER COLUMN user_id TYPE text;
      ALTER TABLE whatsapp_templates ALTER COLUMN category TYPE text;
      ALTER TABLE whatsapp_templates ALTER COLUMN language TYPE text;
      ALTER TABLE whatsapp_templates ALTER COLUMN status TYPE text;
      ALTER TABLE whatsapp_templates ALTER COLUMN header_type TYPE text;
      ALTER TABLE whatsapp_templates ALTER COLUMN meta_status TYPE text;
    `);
    console.log('✓ whatsapp_templates columns updated to TEXT successfully.');

    console.log('Altering whatsapp_message_logs columns to TEXT...');
    await query(`
      ALTER TABLE whatsapp_message_logs ALTER COLUMN template_name TYPE text;
      ALTER TABLE whatsapp_message_logs ALTER COLUMN template_language TYPE text;
      ALTER TABLE whatsapp_message_logs ALTER COLUMN wamid TYPE text;
      ALTER TABLE whatsapp_message_logs ALTER COLUMN error_code TYPE text;
      ALTER TABLE whatsapp_message_logs ALTER COLUMN error_subcode TYPE text;
      ALTER TABLE whatsapp_message_logs ALTER COLUMN error_type TYPE text;
      ALTER TABLE whatsapp_message_logs ALTER COLUMN fbtrace_id TYPE text;
      ALTER TABLE whatsapp_message_logs ALTER COLUMN recipient_phone TYPE text;
      ALTER TABLE whatsapp_message_logs ALTER COLUMN sender_phone_id TYPE text;
    `);
    console.log('✓ whatsapp_message_logs columns updated to TEXT successfully.');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    process.exit(0);
  }
}

migrateColumns();
