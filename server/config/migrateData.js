import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2004',
  database: process.env.DB_NAME || 'arco_communication',
});

async function migrateData() {
  const jsonPath = path.join(__dirname, '../data/database.json');
  if (!fs.existsSync(jsonPath)) {
    console.log('[WARN] No database.json found to migrate.');
    return;
  }

  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const jsonData = JSON.parse(raw);

  console.log('Migrating data from JSON to PostgreSQL...');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Migrate Users
    if (jsonData.users && Array.isArray(jsonData.users)) {
      for (const u of jsonData.users) {
        await client.query(
          `INSERT INTO users (id, name, email, company_name, phone, industry, role, trial_days_remaining, onboarding_completed, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             email = EXCLUDED.email,
             company_name = EXCLUDED.company_name,
             phone = EXCLUDED.phone,
             industry = EXCLUDED.industry,
             trial_days_remaining = EXCLUDED.trial_days_remaining,
             onboarding_completed = EXCLUDED.onboarding_completed,
             updated_at = CURRENT_TIMESTAMP`,
          [
            u.id,
            u.name,
            u.email,
            u.companyName || u.company_name,
            u.phone,
            u.industry,
            u.role || 'admin',
            u.trialDaysRemaining || u.trial_days_remaining || 14,
            u.onboardingCompleted !== undefined ? u.onboardingCompleted : true,
            u.createdAt || new Date().toISOString(),
          ]
        );
      }
      console.log(`[MIGRATED] ${jsonData.users.length} Users`);
    }

    // 2. Migrate Contacts
    if (jsonData.contacts && Array.isArray(jsonData.contacts)) {
      for (const c of jsonData.contacts) {
        await client.query(
          `INSERT INTO contacts (id, name, phone, email, tag, segment, status, owner, channel, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             phone = EXCLUDED.phone,
             email = EXCLUDED.email,
             tag = EXCLUDED.tag,
             segment = EXCLUDED.segment,
             status = EXCLUDED.status,
             owner = EXCLUDED.owner,
             channel = EXCLUDED.channel,
             updated_at = CURRENT_TIMESTAMP`,
          [
            c.id,
            c.name,
            c.phone,
            c.email || '—',
            c.tag || 'Lead',
            c.segment || 'High Intent',
            c.status || 'Open Lead',
            c.owner || 'Shraddha',
            c.channel || 'whatsapp',
            c.createdAt || new Date().toISOString(),
          ]
        );
      }
      console.log(`[MIGRATED] ${jsonData.contacts.length} Contacts`);
    }

    // 3. Migrate Campaigns
    if (jsonData.campaigns && Array.isArray(jsonData.campaigns)) {
      for (const cmp of jsonData.campaigns) {
        await client.query(
          `INSERT INTO campaigns (id, name, channel, type, category, status, recipients, delivered, read, replied, scheduled_for, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             channel = EXCLUDED.channel,
             type = EXCLUDED.type,
             category = EXCLUDED.category,
             status = EXCLUDED.status,
             recipients = EXCLUDED.recipients,
             delivered = EXCLUDED.delivered,
             read = EXCLUDED.read,
             replied = EXCLUDED.replied,
             scheduled_for = EXCLUDED.scheduled_for,
             updated_at = CURRENT_TIMESTAMP`,
          [
            cmp.id,
            cmp.name,
            cmp.channel || 'whatsapp',
            cmp.type || 'onetime',
            cmp.category || 'Marketing',
            cmp.status || 'Scheduled',
            cmp.recipients || 1450,
            cmp.delivered || 0,
            cmp.read || 0,
            cmp.replied || 0,
            cmp.scheduledFor || null,
            cmp.createdAt || new Date().toISOString(),
          ]
        );
      }
      console.log(`[MIGRATED] ${jsonData.campaigns.length} Campaigns`);
    }

    // 4. Migrate Conversations & Messages
    if (jsonData.conversations && Array.isArray(jsonData.conversations)) {
      for (const conv of jsonData.conversations) {
        await client.query(
          `INSERT INTO conversations (id, name, channel, status, phone, unread_count, last_message_time, tag, status_filter, assignee, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             channel = EXCLUDED.channel,
             status = EXCLUDED.status,
             phone = EXCLUDED.phone,
             unread_count = EXCLUDED.unread_count,
             last_message_time = EXCLUDED.last_message_time,
             tag = EXCLUDED.tag,
             status_filter = EXCLUDED.status_filter,
             assignee = EXCLUDED.assignee,
             updated_at = CURRENT_TIMESTAMP`,
          [
            conv.id,
            conv.name,
            conv.channel || 'whatsapp',
            conv.status || 'Online',
            conv.phone,
            conv.unreadCount || 0,
            conv.lastMessageTime || 'Just now',
            conv.tag || 'Lead',
            conv.statusFilter || 'open',
            conv.assignee || 'Me',
            conv.createdAt || new Date().toISOString(),
          ]
        );

        if (conv.messages && Array.isArray(conv.messages)) {
          for (const msg of conv.messages) {
            await client.query(
              `INSERT INTO messages (id, conversation_id, sender, text, time, timestamp)
               VALUES ($1, $2, $3, $4, $5, $6)
               ON CONFLICT (id) DO UPDATE SET
                 text = EXCLUDED.text,
                 time = EXCLUDED.time,
                 timestamp = EXCLUDED.timestamp`,
              [
                msg.id,
                conv.id,
                msg.sender,
                msg.text,
                msg.time,
                msg.timestamp || new Date().toISOString(),
              ]
            );
          }
        }
      }
      console.log(`[MIGRATED] ${jsonData.conversations.length} Conversations`);
    }

    // 5. Migrate Workflows
    if (jsonData.workflows && Array.isArray(jsonData.workflows)) {
      for (const wf of jsonData.workflows) {
        await client.query(
          `INSERT INTO workflows (id, name, trigger, action, status, executions, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             trigger = EXCLUDED.trigger,
             action = EXCLUDED.action,
             status = EXCLUDED.status,
             executions = EXCLUDED.executions,
             updated_at = CURRENT_TIMESTAMP`,
          [
            wf.id,
            wf.name,
            wf.trigger,
            wf.action,
            wf.status || 'active',
            wf.executions || 0,
            wf.createdAt || new Date().toISOString(),
          ]
        );
      }
      console.log(`[MIGRATED] ${jsonData.workflows.length} Workflows`);
    }

    // 6. Migrate AI Agents
    if (jsonData.aiAgents && Array.isArray(jsonData.aiAgents)) {
      for (const ai of jsonData.aiAgents) {
        await client.query(
          `INSERT INTO ai_agents (id, name, model, channels, status, system_prompt, accuracy_rate, conversations_handled, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             model = EXCLUDED.model,
             channels = EXCLUDED.channels,
             status = EXCLUDED.status,
             system_prompt = EXCLUDED.system_prompt,
             accuracy_rate = EXCLUDED.accuracy_rate,
             conversations_handled = EXCLUDED.conversations_handled,
             updated_at = CURRENT_TIMESTAMP`,
          [
            ai.id,
            ai.name,
            ai.model || 'ARCO-v2.0-IntentEngine',
            JSON.stringify(ai.channels || ['whatsapp', 'instagram']),
            ai.status || 'live',
            ai.systemPrompt || '',
            ai.accuracyRate || '98.4%',
            ai.conversationsHandled || 0,
            ai.createdAt || new Date().toISOString(),
          ]
        );
      }
      console.log(`[MIGRATED] ${jsonData.aiAgents.length} AI Agents`);
    }

    // 7. Migrate Integrations
    if (jsonData.integrations) {
      await client.query(
        `INSERT INTO integrations (id, config)
         VALUES ('main', $1)
         ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config, updated_at = CURRENT_TIMESTAMP`,
        [JSON.stringify(jsonData.integrations)]
      );
      console.log(`[MIGRATED] Integrations configuration`);
    }

    // 8. Migrate Analytics
    if (jsonData.analytics) {
      await client.query(
        `INSERT INTO analytics (id, metrics)
         VALUES ('main', $1)
         ON CONFLICT (id) DO UPDATE SET metrics = EXCLUDED.metrics, updated_at = CURRENT_TIMESTAMP`,
        [JSON.stringify(jsonData.analytics)]
      );
      console.log(`[MIGRATED] Analytics metrics`);
    }

    // 9. Migrate Settings
    if (jsonData.settings) {
      await client.query(
        `INSERT INTO settings (id, config)
         VALUES ('main', $1)
         ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config, updated_at = CURRENT_TIMESTAMP`,
        [JSON.stringify(jsonData.settings)]
      );
      console.log(`[MIGRATED] Settings configuration`);
    }

    await client.query('COMMIT');
    console.log('[SUCCESS] All data migrated cleanly to PostgreSQL 18!');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateData()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Migration Error]:', err);
    process.exit(1);
  });
