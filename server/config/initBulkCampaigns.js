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

async function initBulkCampaigns() {
  const client = await pool.connect();
  try {
    console.log('[PostgreSQL] Initializing Bulk Campaign Architecture & Recipient Queue Table...');

    // 1. Create campaign_recipients table for tracking large-scale bulk delivery
    await client.query(`
      CREATE TABLE IF NOT EXISTS campaign_recipients (
        id VARCHAR(100) PRIMARY KEY,
        campaign_id VARCHAR(100) NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        contact_id VARCHAR(100) REFERENCES contacts(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        batch_number INT DEFAULT 1,
        error_message TEXT,
        sent_at TIMESTAMPTZ,
        delivered_at TIMESTAMPTZ,
        read_at TIMESTAMPTZ,
        replied_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[PostgreSQL] campaign_recipients table verified/created.');

    // 2. Add high-performance indexes for 50,000+ contact lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_contacts_segment ON contacts(segment);
      CREATE INDEX IF NOT EXISTS idx_contacts_tag ON contacts(tag);
      CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
      CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
      CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON campaign_recipients(campaign_id, status);
      CREATE INDEX IF NOT EXISTS idx_campaign_recipients_batch ON campaign_recipients(campaign_id, batch_number);
    `);
    console.log('[PostgreSQL] High-performance indexes verified on contacts and campaign_recipients.');

    // 3. Ensure initial campaign records exist
    const initialCampaigns = [
      {
        id: 'cmp_101',
        name: 'Festive Flash Sale Broadcast',
        channel: 'whatsapp',
        type: 'onetime',
        category: 'Marketing',
        status: 'Completed',
        recipients: 1450,
        delivered: 1412,
        read: 1198,
        replied: 342,
        scheduled_for: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        created_by: 'Shraddha',
        template_name: 'Exciting Promo Alert',
        sent_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 47 * 3600 * 1000).toISOString(),
      },
      {
        id: 'cmp_102',
        name: 'Product Update & AI Features Alert',
        channel: 'whatsapp',
        type: 'onetime',
        category: 'Utility',
        status: 'Scheduled',
        recipients: 850,
        delivered: 0,
        read: 0,
        replied: 0,
        scheduled_for: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        created_by: 'Shraddha',
        template_name: 'Project Update Alert',
      },
      {
        id: 'cmp_103',
        name: 'Daily Customer Welcome Drip',
        channel: 'whatsapp',
        type: 'ongoing',
        category: 'Marketing',
        status: 'Active',
        recipients: 320,
        delivered: 310,
        read: 275,
        replied: 88,
        scheduled_for: new Date().toISOString(),
        created_by: 'Shraddha',
        template_name: 'arco_welcome_onboarding',
        recurring_config: JSON.stringify({ frequency: 'Daily', time: '10:00 AM', timezone: 'Asia/Kolkata' }),
      },
      {
        id: 'cmp_104',
        name: 'Shopify Abandoned Cart API Trigger',
        channel: 'whatsapp',
        type: 'api',
        category: 'Marketing',
        status: 'Active',
        recipients: 540,
        delivered: 528,
        read: 462,
        replied: 140,
        scheduled_for: new Date().toISOString(),
        created_by: 'API Webhook',
        template_name: 'arco_abandoned_cart_recovery',
      },
    ];

    for (const c of initialCampaigns) {
      await client.query(
        `INSERT INTO campaigns (
           id, name, channel, type, category, status, recipients, delivered, read, replied, scheduled_for, created_by, template_name, sent_at, completed_at, recurring_config, created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET 
           recipients = EXCLUDED.recipients,
           delivered = EXCLUDED.delivered,
           read = EXCLUDED.read,
           replied = EXCLUDED.replied,
           status = EXCLUDED.status`,
        [
          c.id,
          c.name,
          c.channel,
          c.type,
          c.category,
          c.status,
          c.recipients,
          c.delivered,
          c.read,
          c.replied,
          c.scheduled_for,
          c.created_by,
          c.template_name,
          c.sent_at || null,
          c.completed_at || null,
          c.recurring_config || '{}',
        ]
      );
    }

    // 4. Populate sample recipients for campaign cmp_101
    const cmp101RecipientsRes = await client.query("SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id = 'cmp_101'");
    if (parseInt(cmp101RecipientsRes.rows[0].count, 10) === 0) {
      console.log('[PostgreSQL] Populating granular recipient queue records for campaign cmp_101...');
      await client.query(`
        INSERT INTO campaign_recipients (
          id, campaign_id, contact_id, name, phone, email, status, batch_number, sent_at, delivered_at, read_at, replied_at, created_at
        )
        SELECT 
          'rcp_101_' || id,
          'cmp_101',
          id,
          name,
          phone,
          email,
          CASE 
            WHEN ROW_NUMBER() OVER () % 10 = 0 THEN 'replied'
            WHEN ROW_NUMBER() OVER () % 4 = 0 THEN 'read'
            WHEN ROW_NUMBER() OVER () % 20 = 0 THEN 'failed'
            ELSE 'delivered'
          END,
          ((ROW_NUMBER() OVER () - 1) / 100) + 1,
          NOW() - INTERVAL '48 hours',
          NOW() - INTERVAL '48 hours' + INTERVAL '2 minutes',
          CASE WHEN ROW_NUMBER() OVER () % 4 = 0 OR ROW_NUMBER() OVER () % 10 = 0 THEN NOW() - INTERVAL '47 hours' ELSE NULL END,
          CASE WHEN ROW_NUMBER() OVER () % 10 = 0 THEN NOW() - INTERVAL '46 hours' ELSE NULL END,
          NOW() - INTERVAL '48 hours'
        FROM contacts
        LIMIT 1450
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('[PostgreSQL] Populated recipient tracking records for cmp_101.');
    }

    console.log('[SUCCESS] Bulk Campaign & Recipient Queue infrastructure ready!');
  } catch (error) {
    console.error('[ERROR] Failed to initialize bulk campaigns:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initBulkCampaigns();
