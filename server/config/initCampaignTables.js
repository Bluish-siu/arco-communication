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

async function initCampaignTables() {
  const client = await pool.connect();
  try {
    console.log('[PostgreSQL] Initializing Campaign extensions & Templates table...');

    // 1. Extend campaigns table with rich metadata columns
    await client.query(`
      ALTER TABLE campaigns 
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS audience_type VARCHAR(100) DEFAULT 'all',
      ADD COLUMN IF NOT EXISTS audience_filter JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS template_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS template_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS template_language VARCHAR(50) DEFAULT 'en_US',
      ADD COLUMN IF NOT EXISTS template_category VARCHAR(100) DEFAULT 'MARKETING',
      ADD COLUMN IF NOT EXISTS template_payload JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS variable_mapping JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS schedule_timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
      ADD COLUMN IF NOT EXISTS recurring_config JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) DEFAULT 'Shraddha',
      ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS failure_count INT DEFAULT 0;
    `);
    console.log('[PostgreSQL] campaigns table schema safely extended.');

    // 2. Create campaign_templates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS campaign_templates (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'MARKETING',
        language VARCHAR(50) NOT NULL DEFAULT 'en_US',
        status VARCHAR(50) NOT NULL DEFAULT 'APPROVED',
        theme VARCHAR(100) DEFAULT 'General',
        is_sample BOOLEAN DEFAULT false,
        header_type VARCHAR(50) DEFAULT 'NONE',
        header_text TEXT,
        body_text TEXT NOT NULL,
        footer_text TEXT,
        buttons JSONB DEFAULT '[]',
        sample_variables JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[PostgreSQL] campaign_templates table verified/created.');

    // 3. Seed Sample Campaign Ideas & Active Approved Templates if empty
    const templateCountRes = await client.query('SELECT COUNT(*) FROM campaign_templates');
    if (parseInt(templateCountRes.rows[0].count) === 0) {
      const templates = [
        // 1. Project Update Alert
        {
          id: 'tmpl_sample_01',
          name: 'Project Update Alert',
          category: 'UTILITY',
          language: 'en_US',
          status: 'APPROVED',
          theme: 'Updates',
          is_sample: true,
          header_type: 'TEXT',
          header_text: 'ARCO Project Status Update',
          body_text: 'Hi {{1}}, here is an update on your project {{2}}. Our team has successfully completed the latest milestone. Click below to review your live dashboard.',
          footer_text: 'ARCO Communication Updates',
          buttons: JSON.stringify([
            { type: 'URL', text: 'View Dashboard', url: 'https://arcocommunication.com/dashboard' },
            { type: 'QUICK_REPLY', text: 'Talk to Support' },
          ]),
          sample_variables: JSON.stringify(['Ramesh', 'WhatsApp Integration v2']),
        },
        // 2. Maintenance Notification
        {
          id: 'tmpl_sample_02',
          name: 'Maintenance Notification',
          category: 'UTILITY',
          language: 'en_US',
          status: 'APPROVED',
          theme: 'Alerts',
          is_sample: true,
          header_type: 'TEXT',
          header_text: 'Scheduled Maintenance Notice',
          body_text: 'Dear {{1}}, we will be conducting a scheduled system upgrade on {{2}} from {{3}} to {{4}}. Your services will remain active with minimal disruption.',
          footer_text: 'ARCO Infrastructure Team',
          buttons: JSON.stringify([
            { type: 'URL', text: 'Status Page', url: 'https://status.arcocommunication.com' },
          ]),
          sample_variables: JSON.stringify(['Valued Customer', 'Sunday, Aug 24', '02:00 AM', '04:00 AM']),
        },
        // 3. Interested in ARCO?
        {
          id: 'tmpl_sample_03',
          name: 'Interested in ARCO?',
          category: 'MARKETING',
          language: 'en_US',
          status: 'APPROVED',
          theme: 'Sales',
          is_sample: true,
          header_type: 'TEXT',
          header_text: 'Supercharge Your Customer Engagement',
          body_text: 'Hi {{1}}! We noticed you checked out ARCO Communication. Ready to turn WhatsApp conversations into sales growth? Get started with our 14-day free trial.',
          footer_text: 'Reply STOP to unsubscribe',
          buttons: JSON.stringify([
            { type: 'URL', text: 'Start Free Trial', url: 'https://arcocommunication.com/signup' },
            { type: 'QUICK_REPLY', text: 'Book 1-on-1 Demo' },
          ]),
          sample_variables: JSON.stringify(['Priya']),
        },
        // 4. Insightful Knowledge
        {
          id: 'tmpl_sample_04',
          name: 'Insightful Knowledge',
          category: 'MARKETING',
          language: 'en_US',
          status: 'APPROVED',
          theme: 'Insights',
          is_sample: true,
          header_type: 'TEXT',
          header_text: 'WhatsApp Growth Playbook 2026',
          body_text: 'Hello {{1}}! Discover the top 5 automation workflows that leading D2C and SaaS brands use to achieve 45% higher conversion rates on WhatsApp.',
          footer_text: 'ARCO Weekly Insights',
          buttons: JSON.stringify([
            { type: 'URL', text: 'Read Full Guide', url: 'https://arcocommunication.com/resources' },
          ]),
          sample_variables: JSON.stringify(['Amit']),
        },
        // 5. Exciting Promo Alert
        {
          id: 'tmpl_sample_05',
          name: 'Exciting Promo Alert',
          category: 'MARKETING',
          language: 'en_US',
          status: 'APPROVED',
          theme: 'Promo',
          is_sample: true,
          header_type: 'TEXT',
          header_text: 'Flash Sale: 30% Off Today!',
          body_text: 'Hey {{1}}! Unlock a special {{2}}% discount on your next plan renewal with promo code {{3}}. Offer valid until midnight.',
          footer_text: 'Valid for next 24 hours',
          buttons: JSON.stringify([
            { type: 'URL', text: 'Claim Discount', url: 'https://arcocommunication.com/pricing' },
            { type: 'QUICK_REPLY', text: 'Chat with Sales' },
          ]),
          sample_variables: JSON.stringify(['Sneha', '30', 'ARCOFLASH30']),
        },
        // 6. ARCO Promo
        {
          id: 'tmpl_sample_06',
          name: 'ARCO Promo',
          category: 'MARKETING',
          language: 'en_US',
          status: 'APPROVED',
          theme: 'Promo',
          is_sample: true,
          header_type: 'TEXT',
          header_text: 'Festival Special Offer',
          body_text: 'Greetings {{1}}! Celebrate this season with ARCO Communication. Get up to {{2}} bonus message credits when you recharge your WhatsApp wallet today.',
          footer_text: 'Terms & Conditions apply',
          buttons: JSON.stringify([
            { type: 'URL', text: 'Recharge Now', url: 'https://arcocommunication.com/dashboard' },
          ]),
          sample_variables: JSON.stringify(['Vikram', '5,000']),
        },
        // 7. ARCO Service Update
        {
          id: 'tmpl_sample_07',
          name: 'ARCO Service Update',
          category: 'UTILITY',
          language: 'en_US',
          status: 'APPROVED',
          theme: 'Service',
          is_sample: true,
          header_type: 'TEXT',
          header_text: 'New Feature: AI Agents v2.0',
          body_text: 'Hi {{1}}, our new AI Agent Intent Engine is now live on your account {{2}}. Automate customer queries 24/7 with 98.4% accuracy.',
          footer_text: 'ARCO Product Announcements',
          buttons: JSON.stringify([
            { type: 'URL', text: 'Try AI Agents', url: 'https://arcocommunication.com/products/ai-agents' },
          ]),
          sample_variables: JSON.stringify(['Ananya', 'Workspace #419']),
        },
        // 8. ARCO Service Alert
        {
          id: 'tmpl_sample_08',
          name: 'ARCO Service Alert',
          category: 'UTILITY',
          language: 'en_US',
          status: 'APPROVED',
          theme: 'Alerts',
          is_sample: true,
          header_type: 'TEXT',
          header_text: 'Account Verification Action Required',
          body_text: 'Attention {{1}}: Your Meta WhatsApp Business verification for phone {{2}} requires your confirmation. Please review your account settings.',
          footer_text: 'ARCO Security & Compliance',
          buttons: JSON.stringify([
            { type: 'URL', text: 'Complete Setup', url: 'https://arcocommunication.com/onboarding/meta-whatsapp' },
          ]),
          sample_variables: JSON.stringify(['Karan', '+91 98765 43210']),
        },
        // 9. ARCO Follow-Up
        {
          id: 'tmpl_sample_09',
          name: 'ARCO Follow-Up',
          category: 'MARKETING',
          language: 'en_US',
          status: 'APPROVED',
          theme: 'Sales',
          is_sample: true,
          header_type: 'TEXT',
          header_text: 'Quick Follow-Up on Your Query',
          body_text: 'Hi {{1}}, this is {{2}} from ARCO Communication. We wanted to see if you had any questions regarding the proposal we sent over yesterday.',
          footer_text: 'Tap below to reply instantly',
          buttons: JSON.stringify([
            { type: 'QUICK_REPLY', text: 'Ready to proceed' },
            { type: 'QUICK_REPLY', text: 'Need more info' },
          ]),
          sample_variables: JSON.stringify(['Deepak', 'Shraddha']),
        },
        // 10. ARCO Insights
        {
          id: 'tmpl_sample_10',
          name: 'ARCO Insights',
          category: 'MARKETING',
          language: 'en_US',
          status: 'APPROVED',
          theme: 'Insights',
          is_sample: true,
          header_type: 'TEXT',
          header_text: 'Monthly Engagement Benchmark Report',
          body_text: 'Hello {{1}}, your monthly WhatsApp engagement report is ready! Your team achieved a {{2}}% open rate and handled {{3}} customer conversations last month.',
          footer_text: 'ARCO Analytics Hub',
          buttons: JSON.stringify([
            { type: 'URL', text: 'View Full Report', url: 'https://arcocommunication.com/sales-crm-reports' },
          ]),
          sample_variables: JSON.stringify(['Meera', '84.2', '1,420']),
        },
        // Active Custom Templates
        {
          id: 'tmpl_active_01',
          name: 'arco_welcome_onboarding',
          category: 'UTILITY',
          language: 'en_US',
          status: 'APPROVED',
          theme: 'Active Templates',
          is_sample: false,
          header_type: 'TEXT',
          header_text: 'Welcome to ARCO Communication!',
          body_text: 'Welcome {{1}}! Thank you for joining {{2}}. We are excited to help you scale your customer support and marketing campaigns on WhatsApp.',
          footer_text: 'Powered by ARCO Communication',
          buttons: JSON.stringify([
            { type: 'URL', text: 'Go to Workspace', url: 'https://arcocommunication.com/dashboard' },
            { type: 'QUICK_REPLY', text: 'Get Help' },
          ]),
          sample_variables: JSON.stringify(['Rohan', 'ARCO Enterprises']),
        },
        {
          id: 'tmpl_active_02',
          name: 'arco_abandoned_cart_recovery',
          category: 'MARKETING',
          language: 'en_US',
          status: 'APPROVED',
          theme: 'Active Templates',
          is_sample: false,
          header_type: 'TEXT',
          header_text: 'You Left Items in Your Cart!',
          body_text: 'Hi {{1}}, you left {{2}} in your cart. Complete your order in the next 2 hours and enjoy free express delivery with code {{3}}.',
          footer_text: 'ARCO Commerce Integration',
          buttons: JSON.stringify([
            { type: 'URL', text: 'Checkout Now', url: 'https://arcocommunication.com' },
          ]),
          sample_variables: JSON.stringify(['Neha', 'Premium Wireless Headphones', 'FREESHIP']),
        },
      ];

      for (const t of templates) {
        await client.query(
          `INSERT INTO campaign_templates (
             id, name, category, language, status, theme, is_sample, header_type, header_text, body_text, footer_text, buttons, sample_variables, created_at, updated_at
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            t.id,
            t.name,
            t.category,
            t.language,
            t.status,
            t.theme,
            t.is_sample,
            t.header_type,
            t.header_text,
            t.body_text,
            t.footer_text,
            t.buttons,
            t.sample_variables,
          ]
        );
      }
      console.log(`[PostgreSQL] Seeded ${templates.length} campaign templates (10 Sample Ideas + Active Templates).`);
    }

    // 4. Seed initial realistic campaign records if empty
    const campCount = await client.query('SELECT COUNT(*) FROM campaigns');
    if (parseInt(campCount.rows[0].count) <= 1) {
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
           ON CONFLICT (id) DO NOTHING`,
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
      console.log('[PostgreSQL] Seeded initial campaigns for One Time, Ongoing, and API tabs.');
    }

    console.log('[SUCCESS] Campaign extensions & Templates tables initialized in PostgreSQL!');
  } catch (error) {
    console.error('[ERROR] Failed to initialize campaign tables:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initCampaignTables();
