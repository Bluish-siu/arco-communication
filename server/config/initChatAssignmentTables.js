import { query } from './db.js';

export async function initChatAssignmentTables() {
  console.log('[PostgreSQL] Initializing Chat Assignment database tables...');

  try {
    // 1. Chat Assignment Settings Table
    await query(`
      CREATE TABLE IF NOT EXISTS chat_assignment_settings (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        default_rule VARCHAR(50) DEFAULT 'round_robin',
        assign_only_online BOOLEAN DEFAULT true,
        reassign_offline BOOLEAN DEFAULT false,
        last_assigned_agent_id VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Chat Assignment Custom Rules Table
    await query(`
      CREATE TABLE IF NOT EXISTS chat_assignment_rules (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        trait VARCHAR(100) NOT NULL,
        condition VARCHAR(50) NOT NULL,
        values JSONB NOT NULL DEFAULT '[]',
        assigned_agents JSONB NOT NULL DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        priority INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Indexes for fast querying
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_assignment_settings_user ON chat_assignment_settings(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_assignment_rules_user ON chat_assignment_rules(user_id);`);

    // Seed default settings row if not present
    const existingSettings = await query(`SELECT id FROM chat_assignment_settings WHERE user_id = 'usr_1' LIMIT 1`);
    if (existingSettings.rows.length === 0) {
      await query(`
        INSERT INTO chat_assignment_settings (id, user_id, default_rule, assign_only_online, reassign_offline, created_at, updated_at)
        VALUES ('cas_default', 'usr_1', 'round_robin', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
    }

    // Ensure agents exist in users table
    const agentsList = [
      { id: 'usr_agent_1', name: 'Nilesh Patel', email: 'nilesh.patel@arco.com', role: 'agent', status: 'online' },
      { id: 'usr_agent_2', name: 'Shraddha', email: 'shraddha@arco.com', role: 'admin', status: 'online' },
      { id: 'usr_agent_3', name: 'Priya Sharma', email: 'priya.sharma@arco.com', role: 'agent', status: 'online' },
      { id: 'usr_agent_4', name: 'Amit Verma', email: 'amit.verma@arco.com', role: 'agent', status: 'away' },
    ];

    for (const a of agentsList) {
      await query(`
        INSERT INTO users (id, name, email, role, created_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          role = EXCLUDED.role
      `, [a.id, a.name, a.email, a.role]);
    }

    console.log('[PostgreSQL] Chat Assignment tables and agent records initialized successfully.');
  } catch (err) {
    console.error('[PostgreSQL Error initializing Chat Assignment tables]:', err);
    throw err;
  }
}

if (process.argv[1]?.includes('initChatAssignmentTables')) {
  initChatAssignmentTables()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
