import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Client } = pg;

async function initPostgres() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || '2004';
  const dbName = process.env.DB_NAME || 'arco_communication';

  console.log(`[Connecting to PostgreSQL] host: ${host}, port: ${port}, user: ${user}`);

  // 1. Connect to default 'postgres' database to check/create 'arco_communication'
  const rootClient = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres',
  });

  await rootClient.connect();
  console.log(`[SUCCESS] Connected to PostgreSQL 18 server!`);

  const checkDbRes = await rootClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
  if (checkDbRes.rows.length === 0) {
    console.log(`Database "${dbName}" does not exist. Creating now...`);
    await rootClient.query(`CREATE DATABASE ${dbName}`);
    console.log(`[SUCCESS] Database "${dbName}" created successfully!`);
  } else {
    console.log(`[INFO] Database "${dbName}" already exists.`);
  }
  await rootClient.end();

  // 2. Connect to the 'arco_communication' database
  const appClient = new Client({
    host,
    port,
    user,
    password,
    database: dbName,
  });

  await appClient.connect();
  console.log(`[SUCCESS] Connected to "${dbName}" database!`);

  // 3. Create tables
  console.log(`Creating tables in "${dbName}"...`);
  await appClient.query(`
    -- 1. Users table
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      company_name VARCHAR(255),
      phone VARCHAR(50),
      industry VARCHAR(100),
      role VARCHAR(50) DEFAULT 'admin',
      trial_days_remaining INT DEFAULT 14,
      onboarding_completed BOOLEAN DEFAULT false,
      business_setup JSONB,
      industry_data JSONB,
      objectives JSONB,
      integrations JSONB,
      configuration JSONB,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Contacts table
    CREATE TABLE IF NOT EXISTS contacts (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255),
      tag VARCHAR(100) DEFAULT 'Lead',
      segment VARCHAR(100) DEFAULT 'High Intent',
      status VARCHAR(100) DEFAULT 'Open Lead',
      owner VARCHAR(100) DEFAULT 'Shraddha',
      channel VARCHAR(50) DEFAULT 'whatsapp',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Campaigns table
    CREATE TABLE IF NOT EXISTS campaigns (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      channel VARCHAR(50) DEFAULT 'whatsapp',
      type VARCHAR(50) DEFAULT 'onetime',
      category VARCHAR(100) DEFAULT 'Marketing',
      status VARCHAR(50) DEFAULT 'Scheduled',
      recipients INT DEFAULT 1450,
      delivered INT DEFAULT 0,
      read INT DEFAULT 0,
      replied INT DEFAULT 0,
      scheduled_for TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Conversations table
    CREATE TABLE IF NOT EXISTS conversations (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      channel VARCHAR(50) DEFAULT 'whatsapp',
      status VARCHAR(50) DEFAULT 'Online',
      phone VARCHAR(100),
      unread_count INT DEFAULT 0,
      last_message_time VARCHAR(50) DEFAULT 'Just now',
      tag VARCHAR(100) DEFAULT 'Lead',
      status_filter VARCHAR(50) DEFAULT 'open',
      assignee VARCHAR(100) DEFAULT 'Me',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. Messages table
    CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(100) PRIMARY KEY,
      conversation_id VARCHAR(100) REFERENCES conversations(id) ON DELETE CASCADE,
      sender VARCHAR(50) NOT NULL,
      text TEXT NOT NULL,
      time VARCHAR(50),
      timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. Workflows table
    CREATE TABLE IF NOT EXISTS workflows (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      trigger VARCHAR(255) NOT NULL,
      action VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'active',
      executions INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 7. AI Agents table
    CREATE TABLE IF NOT EXISTS ai_agents (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      model VARCHAR(100) DEFAULT 'ARCO-v2.0-IntentEngine',
      channels JSONB DEFAULT '["whatsapp", "instagram"]',
      status VARCHAR(50) DEFAULT 'live',
      system_prompt TEXT,
      accuracy_rate VARCHAR(50) DEFAULT '98.4%',
      conversations_handled INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. Integrations table
    CREATE TABLE IF NOT EXISTS integrations (
      id VARCHAR(50) PRIMARY KEY,
      config JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 9. Analytics table
    CREATE TABLE IF NOT EXISTS analytics (
      id VARCHAR(50) PRIMARY KEY,
      metrics JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 10. Settings table
    CREATE TABLE IF NOT EXISTS settings (
      id VARCHAR(50) PRIMARY KEY,
      config JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log(`[SUCCESS] All tables created successfully in PostgreSQL!`);

  await appClient.end();
}

initPostgres()
  .then(() => {
    console.log('[PostgreSQL Initialization Complete]');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[PostgreSQL Initialization Error]:', err);
    process.exit(1);
  });
