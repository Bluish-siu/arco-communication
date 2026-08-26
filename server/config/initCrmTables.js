import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2004',
  database: process.env.DB_NAME || 'arco_communication',
});

async function initCrmTables() {
  const client = await pool.connect();
  try {
    console.log('[PostgreSQL] Initializing Sales CRM & Tasks tables...');

    // 1. Alter contacts table to ensure value and notes columns exist
    await client.query(`
      ALTER TABLE contacts 
      ADD COLUMN IF NOT EXISTS value NUMERIC DEFAULT 0,
      ADD COLUMN IF NOT EXISTS notes TEXT;
    `);
    console.log('[PostgreSQL] contacts table updated with value and notes columns.');

    // 2. Normalize any existing status values
    await client.query(`
      UPDATE contacts SET status = 'Open' WHERE status = 'Open Lead';
    `);

    // 3. Create tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        contact_id VARCHAR(100) REFERENCES contacts(id) ON DELETE SET NULL,
        assigned_to VARCHAR(100) DEFAULT 'Shraddha',
        due_date TIMESTAMPTZ,
        priority VARCHAR(50) DEFAULT 'Medium',
        status VARCHAR(50) DEFAULT 'To Do',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[PostgreSQL] tasks table verified/created.');

    // 4. Update seed values for contacts if value is 0
    await client.query(`
      UPDATE contacts SET value = 25000, notes = 'High interest in WhatsApp marketing and team inbox.' WHERE name LIKE '%Rahul%' AND (value = 0 OR value IS NULL);
      UPDATE contacts SET value = 48000, notes = 'Requested custom automation workflow for lead qualification.' WHERE name LIKE '%Priya%' AND (value = 0 OR value IS NULL);
      UPDATE contacts SET value = 15000, notes = 'Inquiring about multi-agent chat assignment.' WHERE name LIKE '%Amit%' AND (value = 0 OR value IS NULL);
      UPDATE contacts SET value = 65000, notes = 'Enterprise plan demo scheduled with marketing team.' WHERE name LIKE '%Sneha%' AND (value = 0 OR value IS NULL);
      UPDATE contacts SET value = 32000, notes = 'Follow up required on WhatsApp Commerce integration.' WHERE name LIKE '%Vikram%' AND (value = 0 OR value IS NULL);
    `);

    // 5. Seed initial tasks if empty
    const taskCountRes = await client.query('SELECT COUNT(*) FROM tasks');
    if (parseInt(taskCountRes.rows[0].count) === 0) {
      const contactsRes = await client.query('SELECT id, name FROM contacts LIMIT 4');
      const contacts = contactsRes.rows;

      const seedTasks = [
        {
          id: 'tsk_101',
          title: 'Schedule WhatsApp API Demo',
          description: 'Walk through the WhatsApp Embedded Signup and broadcast dashboard with the client team.',
          contact_id: contacts[0]?.id || null,
          assigned_to: 'Shraddha',
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          priority: 'High',
          status: 'To Do',
        },
        {
          id: 'tsk_102',
          title: 'Send Enterprise Pricing Quotation',
          description: 'Prepare custom tier 2 pricing quotation with 10k messages/day allowance.',
          contact_id: contacts[1]?.id || null,
          assigned_to: 'Shraddha',
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'Medium',
          status: 'In Progress',
        },
        {
          id: 'tsk_103',
          title: 'Follow-up on Contract Approval',
          description: 'Check in regarding signed SLA agreement for the commerce add-on.',
          contact_id: contacts[2]?.id || null,
          assigned_to: 'Alex Morgan',
          due_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // overdue
          priority: 'High',
          status: 'In Progress',
        },
        {
          id: 'tsk_104',
          title: 'Complete Onboarding Verification',
          description: 'Verify Meta Business Portfolio status and green badge approval.',
          contact_id: contacts[3]?.id || null,
          assigned_to: 'Shraddha',
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'Low',
          status: 'Completed',
        },
      ];

      for (const t of seedTasks) {
        await client.query(
          `INSERT INTO tasks (id, title, description, contact_id, assigned_to, due_date, priority, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [t.id, t.title, t.description, t.contact_id, t.assigned_to, t.due_date, t.priority, t.status]
        );
      }
      console.log(`[PostgreSQL] Seeded ${seedTasks.length} initial tasks.`);
    }

    console.log('[SUCCESS] Sales CRM & Tasks tables successfully initialized in PostgreSQL!');
  } catch (error) {
    console.error('[ERROR] Failed to initialize CRM tables:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initCrmTables();
