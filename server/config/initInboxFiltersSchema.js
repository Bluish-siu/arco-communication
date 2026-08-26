import { pool } from './db.js';

export async function initInboxFiltersSchema() {
  console.log('[DB] Enhancing conversations table for comprehensive Funnel Filters...');
  try {
    await pool.query(`
      ALTER TABLE conversations 
      ADD COLUMN IF NOT EXISTS label VARCHAR(100),
      ADD COLUMN IF NOT EXISTS reply_status VARCHAR(50) DEFAULT 'replied_manually',
      ADD COLUMN IF NOT EXISTS response_window VARCHAR(50) DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS is_spam BOOLEAN DEFAULT false;
    `);

    // Ensure conversations have reply_statuses and response windows without any hardcoded labels
    await pool.query(`
      UPDATE conversations SET
        label = NULL,
        tag = CASE 
          WHEN id = 'cnv_1' THEN 'Repeat Buyers'
          WHEN id = 'cnv_2' THEN 'High Spenders'
          WHEN id = 'cnv_3' THEN 'Loyal'
          ELSE tag
        END,
        reply_status = CASE 
          WHEN id = 'cnv_1' THEN 'replied_manually'
          WHEN id = 'cnv_2' THEN 'replied_by_bot'
          WHEN id = 'cnv_3' THEN 'unreplied'
          ELSE reply_status
        END,
        response_window = CASE 
          WHEN id = 'cnv_3' THEN 'inactive'
          ELSE 'active'
        END
      WHERE id IN ('cnv_1', 'cnv_2', 'cnv_3');
    `);

    console.log('[DB] Conversations table successfully updated with Funnel Filters fields!');
    return true;
  } catch (err) {
    console.error('[DB Error in initInboxFiltersSchema]:', err.message);
    return false;
  }
}

if (process.argv[1].endsWith('initInboxFiltersSchema.js')) {
  initInboxFiltersSchema().then(() => process.exit(0));
}
