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

async function initContactsSegments() {
  const client = await pool.connect();
  try {
    console.log('[PostgreSQL] Extending Contacts Schema & Creating Segments Table...');

    // 1. Extend contacts table with extra enterprise CRM fields
    await client.query(`
      ALTER TABLE contacts
      ADD COLUMN IF NOT EXISTS user_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT '+91',
      ADD COLUMN IF NOT EXISTS whatsapp_opted BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS custom_attributes JSONB DEFAULT '{}';
    `);
    console.log('[PostgreSQL] contacts table columns safely extended.');

    // 2. Add high-performance indexes for large contact datasets (1,000 to 50,000+ contacts)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
      CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
      CREATE INDEX IF NOT EXISTS idx_contacts_whatsapp_opted ON contacts(whatsapp_opted);
      CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
      CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);
    `);
    console.log('[PostgreSQL] High-performance indexes verified on contacts table.');

    // 3. Create segments table for saved audience filters
    await client.query(`
      CREATE TABLE IF NOT EXISTS segments (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        filter_type VARCHAR(50) DEFAULT 'custom',
        conditions JSONB NOT NULL DEFAULT '[]',
        estimated_count INT DEFAULT 0,
        created_by VARCHAR(100) DEFAULT 'Shraddha',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[PostgreSQL] segments table created/verified.');

    // 4. Update existing contact rows with default user_id and tags if null
    await client.query(`
      UPDATE contacts
      SET user_id = COALESCE(user_id, 'USR_' || SUBSTRING(id FROM 5)),
          country_code = COALESCE(country_code, '+91'),
          whatsapp_opted = COALESCE(whatsapp_opted, true),
          tags = CASE WHEN tags IS NULL OR tags = '[]'::jsonb THEN jsonb_build_array(COALESCE(tag, 'Lead')) ELSE tags END
      WHERE user_id IS NULL OR country_code IS NULL OR whatsapp_opted IS NULL;
    `);

    // Set 10% of sample contacts to whatsapp_opted = false for realistic opt-in filtering
    await client.query(`
      UPDATE contacts
      SET whatsapp_opted = false
      WHERE RIGHT(phone, 1) = '8' AND whatsapp_opted = true;
    `);

    // 5. Seed default saved segments if segments table is empty
    const segCountRes = await client.query('SELECT COUNT(*) FROM segments');
    if (parseInt(segCountRes.rows[0].count, 10) === 0) {
      console.log('[PostgreSQL] Seeding default saved segments...');
      const defaultSegments = [
        {
          id: 'seg_repeat_buyers',
          name: 'Repeat Buyers',
          description: 'High-value customers with verified WhatsApp opt-in and deal value > 40k.',
          filter_type: 'custom',
          conditions: JSON.stringify([
            { field: 'segment', operator: 'is', value: 'VIP Customers' },
            { field: 'whatsapp_opted', operator: 'is', value: 'true' },
          ]),
          estimated_count: 280,
        },
        {
          id: 'seg_whatsapp_opted_all',
          name: 'WhatsApp Opted Leads',
          description: 'All verified contacts who have opted in to receive WhatsApp marketing broadcasts.',
          filter_type: 'whatsapp_opted',
          conditions: JSON.stringify([
            { field: 'whatsapp_opted', operator: 'is', value: 'true' },
          ]),
          estimated_count: 1305,
        },
        {
          id: 'seg_cart_abandoners',
          name: 'Cart Abandoners D2C',
          description: 'Customers with abandoned carts in the last 7 days ready for recovery broadcasts.',
          filter_type: 'segment',
          conditions: JSON.stringify([
            { field: 'segment', operator: 'is', value: 'Cart Abandoners' },
            { field: 'whatsapp_opted', operator: 'is', value: 'true' },
          ]),
          estimated_count: 290,
        },
        {
          id: 'seg_enterprise_hot_leads',
          name: 'Enterprise VIP Accounts',
          description: 'Enterprise tier tagged contacts with active deals in discussion.',
          filter_type: 'tag',
          conditions: JSON.stringify([
            { field: 'tag', operator: 'is', value: 'Enterprise' },
          ]),
          estimated_count: 245,
        },
      ];

      for (const s of defaultSegments) {
        await client.query(
          `INSERT INTO segments (id, name, description, filter_type, conditions, estimated_count, created_by, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'Shraddha', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO NOTHING`,
          [s.id, s.name, s.description, s.filter_type, s.conditions, s.estimated_count]
        );
      }
      console.log(`[PostgreSQL] Seeded ${defaultSegments.length} default saved segments.`);
    }

    console.log('[SUCCESS] Contacts & Segments schema successfully initialized in PostgreSQL 18!');
  } catch (error) {
    console.error('[ERROR] Failed to initialize contacts and segments:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initContactsSegments();
