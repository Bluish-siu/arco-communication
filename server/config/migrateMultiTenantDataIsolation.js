import { query } from './db.js';

export async function migrateMultiTenantDataIsolation() {
  console.log('[Migration] Starting multi-tenant data isolation migration...');

  const OWNER_USER_ID = 'usr_1790574599220'; // Nilesh Patel (mca25.patel.nilesh@gnims.com)

  try {
    // 1. Ensure user_id column exists on contacts
    await query(`
      ALTER TABLE contacts ADD COLUMN IF NOT EXISTS user_id VARCHAR(100);
      CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
    `);

    // 2. Ensure user_id column exists on conversations
    await query(`
      ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_id VARCHAR(100);
      CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
    `);

    // 3. Ensure user_id column exists on messages
    await query(`
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS user_id VARCHAR(100);
      CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
    `);

    // 4. Ensure user_id column exists on campaigns
    await query(`
      ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS user_id VARCHAR(100);
      CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
    `);

    // 5. Ensure user_id column exists on tasks and segments
    await query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id VARCHAR(100);
      CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
      ALTER TABLE segments ADD COLUMN IF NOT EXISTS user_id VARCHAR(100);
      CREATE INDEX IF NOT EXISTS idx_segments_user_id ON segments(user_id);
    `);

    // 6. Assign all existing data where user_id IS NULL or legacy USR_ to Nilesh Patel (usr_1790574599220)
    const contactsRes = await query(
      "UPDATE contacts SET user_id = $1 WHERE user_id IS NULL OR user_id = '' OR user_id LIKE 'USR_%' RETURNING id",
      [OWNER_USER_ID]
    );

    const convsRes = await query(
      "UPDATE conversations SET user_id = $1 WHERE user_id IS NULL OR user_id = '' RETURNING id",
      [OWNER_USER_ID]
    );

    const messagesRes = await query(
      "UPDATE messages SET user_id = $1 WHERE user_id IS NULL OR user_id = '' RETURNING id",
      [OWNER_USER_ID]
    );

    const campaignsRes = await query(
      "UPDATE campaigns SET user_id = $1 WHERE user_id IS NULL OR user_id = '' RETURNING id",
      [OWNER_USER_ID]
    );

    const tasksRes = await query(
      "UPDATE tasks SET user_id = $1 WHERE user_id IS NULL OR user_id = '' RETURNING id",
      [OWNER_USER_ID]
    );

    const segmentsRes = await query(
      "UPDATE segments SET user_id = $1 WHERE user_id IS NULL OR user_id = '' RETURNING id",
      [OWNER_USER_ID]
    );

    // Verify final counts for Nilesh Patel
    const userContacts = await query("SELECT count(*) FROM contacts WHERE user_id = $1", [OWNER_USER_ID]);
    const userConvs = await query("SELECT count(*) FROM conversations WHERE user_id = $1", [OWNER_USER_ID]);
    const userMessages = await query("SELECT count(*) FROM messages WHERE user_id = $1", [OWNER_USER_ID]);

    console.log(`[Migration SUCCESS]`);
    console.log(`  - Contacts stamped for Nilesh: ${userContacts.rows[0].count} (Updated: ${contactsRes.rowCount})`);
    console.log(`  - Conversations stamped for Nilesh: ${userConvs.rows[0].count} (Updated: ${convsRes.rowCount})`);
    console.log(`  - Messages stamped for Nilesh: ${userMessages.rows[0].count} (Updated: ${messagesRes.rowCount})`);

    return {
      success: true,
      contacts: userContacts.rows[0].count,
      conversations: userConvs.rows[0].count,
      messages: userMessages.rows[0].count,
    };
  } catch (error) {
    console.error('[Migration FAILED]:', error.message);
    throw error;
  }
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith('migrateMultiTenantDataIsolation.js')) {
  migrateMultiTenantDataIsolation()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
