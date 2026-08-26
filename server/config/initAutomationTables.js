import { query } from './db.js';

export async function initAutomationTables() {
  try {
    console.log('Initializing PostgreSQL Automation tables for ARCO Communication...');

    // 1. Basic Automation Settings
    await query(`
      CREATE TABLE IF NOT EXISTS automation_settings (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        working_hours JSONB DEFAULT '{
          "enabled": true,
          "timezone": "Asia/Kolkata",
          "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "startTime": "09:00",
          "endTime": "18:00"
        }',
        out_of_office JSONB DEFAULT '{
          "enabled": true,
          "message": "Hello! We are currently away outside our regular working hours (9 AM - 6 PM IST). We will get back to you promptly when we return!",
          "trigger": "outside_hours",
          "sentCount": 42
        }',
        welcome_message JSONB DEFAULT '{
          "enabled": true,
          "message": "Welcome to ARCO Communication! How can our team assist you today?",
          "trigger": "first_message",
          "sentCount": 128
        }',
        delayed_response JSONB DEFAULT '{
          "enabled": true,
          "delayMinutes": 10,
          "message": "Thank you for holding on! Our team is currently attending to other inquiries, but an agent will connect with you shortly.",
          "sentCount": 19
        }',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_automation_settings_user_id ON automation_settings(user_id);
    `);

    // 2. Custom Auto Replies Table
    await query(`
      CREATE TABLE IF NOT EXISTS custom_auto_replies (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        channel VARCHAR(50) DEFAULT 'whatsapp',
        trigger_keyword VARCHAR(255) NOT NULL,
        additional_triggers JSONB DEFAULT '[]',
        match_type VARCHAR(50) DEFAULT 'contains',
        action_type VARCHAR(100) DEFAULT 'auto_reply',
        response_message TEXT NOT NULL,
        rich_media JSONB DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'active',
        conversations_sent INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_custom_auto_replies_user_id ON custom_auto_replies(user_id);
      CREATE INDEX IF NOT EXISTS idx_custom_auto_replies_trigger ON custom_auto_replies(trigger_keyword);
    `);

    // 3. Workflows Table (Alter existing or create)
    await query(`
      CREATE TABLE IF NOT EXISTS workflows (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        trigger VARCHAR(255) NOT NULL,
        trigger_config JSONB DEFAULT '{}',
        action VARCHAR(255) DEFAULT 'Interactive Chatbot Flow',
        nodes JSONB DEFAULT '[]',
        edges JSONB DEFAULT '[]',
        status VARCHAR(50) DEFAULT 'active',
        executions INT DEFAULT 0,
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE workflows ADD COLUMN IF NOT EXISTS user_id VARCHAR(100);
      ALTER TABLE workflows ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE workflows ADD COLUMN IF NOT EXISTS trigger_config JSONB DEFAULT '{}';
      ALTER TABLE workflows ADD COLUMN IF NOT EXISTS nodes JSONB DEFAULT '[]';
      ALTER TABLE workflows ADD COLUMN IF NOT EXISTS edges JSONB DEFAULT '[]';
      ALTER TABLE workflows ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

      CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
    `);

    // 4. AI Intent Matching Settings & Mappings
    await query(`
      CREATE TABLE IF NOT EXISTS ai_intent_settings (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        is_enabled BOOLEAN DEFAULT true,
        confidence_threshold INT DEFAULT 75,
        fallback_action VARCHAR(100) DEFAULT 'ai_leads_agent',
        total_evaluations INT DEFAULT 184,
        successful_matches INT DEFAULT 168,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_ai_intent_settings_user_id ON ai_intent_settings(user_id);

      CREATE TABLE IF NOT EXISTS ai_intents (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        intent_name VARCHAR(255) NOT NULL,
        training_phrases JSONB DEFAULT '[]',
        target_type VARCHAR(50) DEFAULT 'workflow',
        target_id VARCHAR(100),
        target_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        match_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_ai_intents_user_id ON ai_intents(user_id);
    `);

    // 5. WhatsApp AI Agent Configurations & Knowledge Sources
    await query(`
      CREATE TABLE IF NOT EXISTS whatsapp_ai_agent_configs (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        agent_name VARCHAR(255) DEFAULT 'ARCO Leads Agent',
        status VARCHAR(50) DEFAULT 'live',
        tone VARCHAR(50) DEFAULT 'professional_consultative',
        system_prompt TEXT DEFAULT 'You are ARCO Leads Agent, an intelligent AI sales & support assistant. Your mission is to understand user requirements, answer questions about our SaaS and marketing capabilities, and qualify high-intent business leads.',
        greeting_message TEXT DEFAULT 'Hi there! I am ARCO AI Assistant. How can I help boost your WhatsApp commerce and customer communications today?',
        fallback_response TEXT DEFAULT 'Let me connect you with a specialist from our team right away.',
        lead_fields JSONB DEFAULT '[
          {"key": "name", "label": "Full Name", "enabled": true, "required": true},
          {"key": "phone", "label": "Phone Number", "enabled": true, "required": true},
          {"key": "email", "label": "Business Email", "enabled": true, "required": false},
          {"key": "company", "label": "Company Name", "enabled": true, "required": false},
          {"key": "requirement", "label": "Service Requirement", "enabled": true, "required": true},
          {"key": "budget", "label": "Estimated Budget", "enabled": true, "required": false}
        ]',
        conversations_handled INT DEFAULT 246,
        leads_captured INT DEFAULT 38,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_wa_ai_agent_configs_user_id ON whatsapp_ai_agent_configs(user_id);

      CREATE TABLE IF NOT EXISTS ai_agent_training_sources (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        source_type VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        url_or_path TEXT,
        status VARCHAR(50) DEFAULT 'ready',
        tokens_indexed INT DEFAULT 4500,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_training_sources_user_id ON ai_agent_training_sources(user_id);
    `);

    // 6. Instagram Quickflows Table
    await query(`
      CREATE TABLE IF NOT EXISTS instagram_quickflows (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) DEFAULT 'price_please',
        trigger_type VARCHAR(50) DEFAULT 'post_comment',
        trigger_keywords JSONB DEFAULT '["PRICE", "COST", "HOW MUCH"]',
        post_target VARCHAR(100) DEFAULT 'all_posts',
        dm_response TEXT NOT NULL,
        collect_lead BOOLEAN DEFAULT true,
        tag_to_apply VARCHAR(100) DEFAULT 'Instagram Lead',
        status VARCHAR(50) DEFAULT 'active',
        leads_captured INT DEFAULT 0,
        times_triggered INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_instagram_quickflows_user_id ON instagram_quickflows(user_id);
    `);

    // 7. Voice AI (My Call Genie) Config & Call Records
    await query(`
      CREATE TABLE IF NOT EXISTS voice_ai_configs (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        is_enabled BOOLEAN DEFAULT true,
        virtual_number VARCHAR(50) DEFAULT '+91 8000 123 456',
        forwarding_number VARCHAR(50) DEFAULT '+91 9876 543 210',
        voice_model VARCHAR(50) DEFAULT 'Aria (Natural & Friendly)',
        greeting TEXT DEFAULT 'Thank you for calling ARCO Communication. Our team is on another line, but I can assist you with your requirements or schedule a prompt callback. May I know your name and what you are looking for?',
        ai_instructions TEXT DEFAULT 'Listen attentively, transcribe customer intent, extract callback preferences, and immediately create a high-priority lead in ARCO Sales CRM.',
        send_whatsapp_confirmation BOOLEAN DEFAULT true,
        total_calls INT DEFAULT 54,
        leads_created INT DEFAULT 29,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_voice_ai_configs_user_id ON voice_ai_configs(user_id);

      CREATE TABLE IF NOT EXISTS voice_calls (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        caller_name VARCHAR(255) NOT NULL,
        caller_phone VARCHAR(50) NOT NULL,
        duration_seconds INT DEFAULT 45,
        status VARCHAR(50) DEFAULT 'lead_captured',
        ai_summary TEXT NOT NULL,
        callback_time VARCHAR(100) DEFAULT 'Today at 4:30 PM',
        audio_url TEXT,
        lead_id VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_voice_calls_user_id ON voice_calls(user_id);
    `);

    // 8. WhatsApp Forms & Responses
    await query(`
      CREATE TABLE IF NOT EXISTS whatsapp_forms (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        form_id VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'published',
        fields JSONB DEFAULT '[]',
        welcome_screen JSONB DEFAULT '{"title": "Welcome", "description": "Please complete this quick form."}',
        thank_you_screen JSONB DEFAULT '{"title": "Thank You!", "description": "We received your details."}',
        response_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_whatsapp_forms_user_id ON whatsapp_forms(user_id);
      CREATE INDEX IF NOT EXISTS idx_whatsapp_forms_form_id ON whatsapp_forms(form_id);

      CREATE TABLE IF NOT EXISTS whatsapp_form_responses (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        form_id VARCHAR(100) NOT NULL,
        contact_name VARCHAR(255) NOT NULL,
        contact_phone VARCHAR(50) NOT NULL,
        answers JSONB DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'submitted',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_form_responses_user_id ON whatsapp_form_responses(user_id);
      CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON whatsapp_form_responses(form_id);
    `);

    // 9. Interactive Lists Table
    await query(`
      CREATE TABLE IF NOT EXISTS interactive_lists (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        header_text VARCHAR(255),
        body_text TEXT NOT NULL,
        footer_text VARCHAR(255),
        button_text VARCHAR(100) DEFAULT 'View Options',
        sections JSONB DEFAULT '[]',
        status VARCHAR(50) DEFAULT 'active',
        usage_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_interactive_lists_user_id ON interactive_lists(user_id);
    `);

    // 10. Automation Execution Logs
    await query(`
      CREATE TABLE IF NOT EXISTS automation_execution_logs (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        channel VARCHAR(50) DEFAULT 'whatsapp',
        contact_name VARCHAR(255),
        contact_phone VARCHAR(50),
        incoming_message TEXT NOT NULL,
        matched_automation_type VARCHAR(100) NOT NULL,
        matched_automation_id VARCHAR(100),
        matched_automation_name VARCHAR(255),
        executed_action TEXT NOT NULL,
        response_payload JSONB DEFAULT '{}',
        execution_mode VARCHAR(50) DEFAULT 'live',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_exec_logs_user_id ON automation_execution_logs(user_id);
    `);

    console.log('[SUCCESS] All 10 Automation Module tables created and indexed in PostgreSQL!');
  } catch (error) {
    console.error('[Automation Tables Init Error]:', error);
    throw error;
  }
}

// Run if called directly
initAutomationTables()
  .then(() => {
    console.log('[Automation Initialization Complete]');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
