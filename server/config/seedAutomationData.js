import { query } from './db.js';

export async function seedAutomationData() {
  try {
    console.log('Seeding initial realistic automation records in PostgreSQL...');

    // 1. Get all users or default
    const usersRes = await query('SELECT id FROM users LIMIT 10');
    const userIds = usersRes.rows.length > 0 ? usersRes.rows.map(r => r.id) : ['usr_1'];

    for (const userId of userIds) {
      // 1. Basic Automation Settings
      const existingSettings = await query('SELECT id FROM automation_settings WHERE user_id = $1', [userId]);
      if (existingSettings.rows.length === 0) {
        await query(`
          INSERT INTO automation_settings (id, user_id, working_hours, out_of_office, welcome_message, delayed_response)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          `aset_${userId}`,
          userId,
          JSON.stringify({
            enabled: true,
            timezone: 'Asia/Kolkata',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            startTime: '09:00',
            endTime: '18:00'
          }),
          JSON.stringify({
            enabled: true,
            message: 'Hello! We are currently away outside our regular working hours (9 AM - 6 PM IST). We will get back to you promptly when our office opens!',
            trigger: 'outside_hours',
            sentCount: 42
          }),
          JSON.stringify({
            enabled: true,
            message: 'Welcome to ARCO Communication! How can our team assist you with our AI-powered messaging solutions today?',
            trigger: 'first_message',
            sentCount: 128
          }),
          JSON.stringify({
            enabled: true,
            delayMinutes: 10,
            message: 'Thank you for holding on! Our support agents are currently assisting other high-priority inquiries, but we will be with you shortly.',
            sentCount: 19
          })
        ]);
      }

      // 2. Custom Auto Replies
      const existingReplies = await query('SELECT id FROM custom_auto_replies WHERE user_id = $1', [userId]);
      if (existingReplies.rows.length === 0) {
        const sampleReplies = [
          {
            id: `car_${Date.now()}_1`,
            user_id: userId,
            channel: 'whatsapp',
            trigger_keyword: 'What digital solutions do you provide?',
            additional_triggers: JSON.stringify(['services', 'solutions', 'offerings', 'what do you do', 'products']),
            match_type: 'contains',
            action_type: 'auto_reply',
            response_message: 'We provide end-to-end WhatsApp & Instagram Commerce, AI Lead Qualification Agents, Automated CTWA Click-to-WhatsApp Ads, and Omni-channel Support CRM.',
            status: 'active',
            conversations_sent: 84
          },
          {
            id: `car_${Date.now()}_2`,
            user_id: userId,
            channel: 'whatsapp',
            trigger_keyword: 'Pricing & Plans',
            additional_triggers: JSON.stringify(['pricing', 'plans', 'cost', 'subscription', 'how much']),
            match_type: 'contains',
            action_type: 'auto_reply',
            response_message: 'Our pricing plans start at ₹1,999/mo for Growth, ₹4,999/mo for Business, and custom Enterprise tiers with dedicated Meta WABA throughput.',
            status: 'active',
            conversations_sent: 142
          },
          {
            id: `car_${Date.now()}_3`,
            user_id: userId,
            channel: 'instagram',
            trigger_keyword: 'PRICE',
            additional_triggers: JSON.stringify(['cost', 'dm price', 'rate']),
            match_type: 'contains',
            action_type: 'auto_reply',
            response_message: 'Hey there! Thanks for your comment. Check your DMs for our full product catalog and exclusive 15% discount voucher!',
            status: 'active',
            conversations_sent: 56
          },
          {
            id: `car_${Date.now()}_4`,
            user_id: userId,
            channel: 'whatsapp',
            trigger_keyword: 'Speak with Human Agent',
            additional_triggers: JSON.stringify(['agent', 'human', 'representative', 'support executive', 'call me']),
            match_type: 'contains',
            action_type: 'auto_reply',
            response_message: 'Connecting you with an available senior representative from our customer success team. Please hold on!',
            status: 'active',
            conversations_sent: 31
          }
        ];

        for (const reply of sampleReplies) {
          await query(`
            INSERT INTO custom_auto_replies (id, user_id, channel, trigger_keyword, additional_triggers, match_type, action_type, response_message, status, conversations_sent)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [reply.id, reply.user_id, reply.channel, reply.trigger_keyword, reply.additional_triggers, reply.match_type, reply.action_type, reply.response_message, reply.status, reply.conversations_sent]);
        }
      }

      // 3. Workflows
      const existingWorkflows = await query('SELECT id FROM workflows WHERE user_id = $1', [userId]);
      if (existingWorkflows.rows.length === 0) {
        const sampleWorkflows = [
          {
            id: `wf_${Date.now()}_1`,
            user_id: userId,
            name: 'New Lead Qualification & Service Routing',
            description: 'Engages inbound leads, presents service options via interactive buttons, qualifies budget, and assigns to sales queue.',
            trigger: 'Keyword: "START" or "DEMO"',
            trigger_config: JSON.stringify({ keywords: ['start', 'demo', 'inquiry', 'hello', 'hi'] }),
            action: 'Interactive Chatbot Flow',
            nodes: JSON.stringify([
              { id: 'node_1', type: 'trigger', data: { label: 'Inbound Message contains "START" or "DEMO"' } },
              { id: 'node_2', type: 'send_message', data: { text: 'Welcome to ARCO! Which solution are you looking to scale today?' } },
              { id: 'node_3', type: 'buttons', data: { prompt: 'Select Solution Area', buttons: ['WhatsApp Marketing', 'Sales CRM & Chatbots', 'Voice AI Inbound'] } },
              { id: 'node_4', type: 'ask_question', data: { question: 'What is your estimated monthly messaging volume?', format: 'number' } },
              { id: 'node_5', type: 'assign_lead', data: { queue: 'round_robin', tag: 'High Intent Lead' } },
              { id: 'node_6', type: 'end_workflow', data: { message: 'Thank you! A dedicated account strategist has been assigned to your workspace.' } }
            ]),
            edges: JSON.stringify([
              { source: 'node_1', target: 'node_2' },
              { source: 'node_2', target: 'node_3' },
              { source: 'node_3', target: 'node_4' },
              { source: 'node_4', target: 'node_5' },
              { source: 'node_5', target: 'node_6' }
            ]),
            status: 'active',
            executions: 218,
            is_published: true
          },
          {
            id: `wf_${Date.now()}_2`,
            user_id: userId,
            name: 'CTWA Meta Ad Click-to-WhatsApp Welcome Flow',
            description: 'Instantly welcomes leads clicking Facebook / Instagram Click-to-WhatsApp Ads and provides discount codes.',
            trigger: 'CTWA Meta Ad Click',
            trigger_config: JSON.stringify({ event: 'ctwa_ad_click' }),
            action: 'Instant Welcome & Voucher',
            nodes: JSON.stringify([
              { id: 'n1', type: 'trigger', data: { label: 'CTWA Ad Referral Detected' } },
              { id: 'n2', type: 'send_message', data: { text: 'Thanks for clicking our ad! Here is your exclusive 20% discount code: ARCO20' } },
              { id: 'n3', type: 'buttons', data: { prompt: 'Would you like a live product walkthrough?', buttons: ['Book Demo', 'Browse Catalog', 'Chat with Agent'] } },
              { id: 'n4', type: 'add_tag', data: { tag: 'CTWA Converted' } }
            ]),
            edges: JSON.stringify([
              { source: 'n1', target: 'n2' },
              { source: 'n2', target: 'n3' },
              { source: 'n3', target: 'n4' }
            ]),
            status: 'active',
            executions: 154,
            is_published: true
          }
        ];

        for (const wf of sampleWorkflows) {
          await query(`
            INSERT INTO workflows (id, user_id, name, description, trigger, trigger_config, action, nodes, edges, status, executions, is_published)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `, [wf.id, wf.user_id, wf.name, wf.description, wf.trigger, wf.trigger_config, wf.action, wf.nodes, wf.edges, wf.status, wf.executions, wf.is_published]);
        }
      }

      // 4. AI Intent Matching
      const existingIntentSettings = await query('SELECT id FROM ai_intent_settings WHERE user_id = $1', [userId]);
      if (existingIntentSettings.rows.length === 0) {
        await query(`
          INSERT INTO ai_intent_settings (id, user_id, is_enabled, confidence_threshold, fallback_action, total_evaluations, successful_matches)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [`ais_${userId}`, userId, true, 75, 'ai_leads_agent', 248, 226]);
      }

      const existingIntents = await query('SELECT id FROM ai_intents WHERE user_id = $1', [userId]);
      if (existingIntents.rows.length === 0) {
        const sampleIntents = [
          {
            id: `aint_${Date.now()}_1`,
            user_id: userId,
            intent_name: 'Order & Shipping Tracking',
            training_phrases: JSON.stringify([
              'Where is my order?',
              'Track package',
              'Check delivery status',
              'When will my parcel arrive?',
              'Shipment tracking number'
            ]),
            target_type: 'workflow',
            target_id: 'wf_order_tracking',
            target_name: 'Order Status Bot',
            status: 'active',
            match_count: 89
          },
          {
            id: `aint_${Date.now()}_2`,
            user_id: userId,
            intent_name: 'Pricing & Quotation Request',
            training_phrases: JSON.stringify([
              'How much does this cost?',
              'Send quotation',
              'What are your package rates?',
              'Pricing details please',
              'Commercial quote'
            ]),
            target_type: 'custom_reply',
            target_id: 'car_pricing',
            target_name: 'Pricing & Plans Auto-Reply',
            status: 'active',
            match_count: 74
          },
          {
            id: `aint_${Date.now()}_3`,
            user_id: userId,
            intent_name: 'Human Support Handover',
            training_phrases: JSON.stringify([
              'Need to talk to someone',
              'Human agent please',
              'Can I speak with a representative?',
              'Connect with executive',
              'Customer care phone'
            ]),
            target_type: 'custom_reply',
            target_id: 'car_human_agent',
            target_name: 'Speak with Human Agent',
            status: 'active',
            match_count: 45
          }
        ];

        for (const intent of sampleIntents) {
          await query(`
            INSERT INTO ai_intents (id, user_id, intent_name, training_phrases, target_type, target_id, target_name, status, match_count)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [intent.id, intent.user_id, intent.intent_name, intent.training_phrases, intent.target_type, intent.target_id, intent.target_name, intent.status, intent.match_count]);
        }
      }

      // 5. WhatsApp AI Agent
      const existingAgent = await query('SELECT id FROM whatsapp_ai_agent_configs WHERE user_id = $1', [userId]);
      if (existingAgent.rows.length === 0) {
        await query(`
          INSERT INTO whatsapp_ai_agent_configs (id, user_id, agent_name, status, tone, system_prompt, greeting_message, fallback_response, lead_fields, conversations_handled, leads_captured)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          `wa_agent_${userId}`,
          userId,
          'ARCO Smart Leads Agent',
          'live',
          'professional_consultative',
          'You are ARCO Leads Agent, an intelligent AI sales & support assistant. Your mission is to understand user requirements, answer questions about our SaaS and marketing capabilities, and qualify high-intent business leads.',
          'Hi there! I am ARCO AI Assistant. How can I help boost your WhatsApp commerce and customer communications today?',
          'Let me connect you with a specialist from our team right away.',
          JSON.stringify([
            { key: 'name', label: 'Full Name', enabled: true, required: true },
            { key: 'phone', label: 'Phone Number', enabled: true, required: true },
            { key: 'email', label: 'Business Email', enabled: true, required: false },
            { key: 'company', label: 'Company Name', enabled: true, required: false },
            { key: 'requirement', label: 'Service Requirement', enabled: true, required: true },
            { key: 'budget', label: 'Estimated Budget', enabled: true, required: false }
          ]),
          312,
          48
        ]);

        const sampleSources = [
          {
            id: `src_${Date.now()}_1`,
            user_id: userId,
            source_type: 'website',
            name: 'ARCO Products & Features',
            url_or_path: 'https://arcocommunication.com/features',
            status: 'ready',
            tokens_indexed: 12400
          },
          {
            id: `src_${Date.now()}_2`,
            user_id: userId,
            source_type: 'document',
            name: 'arco_product_catalog_2026.pdf',
            url_or_path: '/uploads/knowledge/arco_catalog.pdf',
            status: 'ready',
            tokens_indexed: 8600
          }
        ];

        for (const src of sampleSources) {
          await query(`
            INSERT INTO ai_agent_training_sources (id, user_id, source_type, name, url_or_path, status, tokens_indexed)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [src.id, src.user_id, src.source_type, src.name, src.url_or_path, src.status, src.tokens_indexed]);
        }
      }

      // 6. Instagram Quickflows
      const existingQuickflows = await query('SELECT id FROM instagram_quickflows WHERE user_id = $1', [userId]);
      if (existingQuickflows.rows.length === 0) {
        const sampleQuickflows = [
          {
            id: `iqf_${Date.now()}_1`,
            user_id: userId,
            name: 'Reel Auto-DM Price & Catalog',
            category: 'price_please',
            trigger_type: 'post_comment',
            trigger_keywords: JSON.stringify(['PRICE', 'COST', 'HOW MUCH', 'DM PRICE']),
            post_target: 'all_posts',
            dm_response: 'Hey! Thanks for inquiring. Here is our complete digital solutions price breakdown & brochure: https://arco.to/pricing-2026',
            collect_lead: true,
            tag_to_apply: 'Instagram Price Inquiry',
            status: 'active',
            leads_captured: 24,
            times_triggered: 68
          },
          {
            id: `iqf_${Date.now()}_2`,
            user_id: userId,
            name: 'Mega Giveaway Entry Bot',
            category: 'giveaway',
            trigger_type: 'post_comment',
            trigger_keywords: JSON.stringify(['GIVEAWAY', 'ENTER', 'WIN']),
            post_target: 'selected_reels',
            dm_response: 'You are registered for our Monthly Growth Giveaway! Check your unique referral link to increase winning chances.',
            collect_lead: true,
            tag_to_apply: 'Giveaway Participant',
            status: 'active',
            leads_captured: 82,
            times_triggered: 195
          },
          {
            id: `iqf_${Date.now()}_3`,
            user_id: userId,
            name: 'Story Reaction Quick Response',
            category: 'story_replies',
            trigger_type: 'story_reply',
            trigger_keywords: JSON.stringify(['🔥', '❤️', 'INTERESTED', 'MORE INFO']),
            post_target: 'all_stories',
            dm_response: 'Thanks for engaging with our story! Would you like a personalized 10-minute demo of our WhatsApp automation tool?',
            collect_lead: true,
            tag_to_apply: 'Story Lead',
            status: 'active',
            leads_captured: 19,
            times_triggered: 41
          }
        ];

        for (const qf of sampleQuickflows) {
          await query(`
            INSERT INTO instagram_quickflows (id, user_id, name, category, trigger_type, trigger_keywords, post_target, dm_response, collect_lead, tag_to_apply, status, leads_captured, times_triggered)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          `, [qf.id, qf.user_id, qf.name, qf.category, qf.trigger_type, qf.trigger_keywords, qf.post_target, qf.dm_response, qf.collect_lead, qf.tag_to_apply, qf.status, qf.leads_captured, qf.times_triggered]);
        }
      }

      // 7. Voice AI (My Call Genie)
      const existingVoiceConfig = await query('SELECT id FROM voice_ai_configs WHERE user_id = $1', [userId]);
      if (existingVoiceConfig.rows.length === 0) {
        await query(`
          INSERT INTO voice_ai_configs (id, user_id, is_enabled, virtual_number, forwarding_number, voice_model, greeting, ai_instructions, send_whatsapp_confirmation, total_calls, leads_created)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          `vc_${userId}`,
          userId,
          true,
          '+91 8000 123 456',
          '+91 9876 543 210',
          'Aria (Natural & Friendly)',
          'Thank you for calling ARCO Communication. Our team is on another line, but I can assist you with your requirements or schedule a prompt callback. May I know your name and what you are looking for?',
          'Listen attentively, transcribe customer intent, extract callback preferences, and immediately create a high-priority lead in ARCO Sales CRM.',
          true,
          68,
          34
        ]);

        const sampleCalls = [
          {
            id: `call_${Date.now()}_1`,
            user_id: userId,
            caller_name: 'Vikram Mehta',
            caller_phone: '+91 98201 12345',
            duration_seconds: 52,
            status: 'lead_captured',
            ai_summary: 'Caller inquired about enterprise Meta WhatsApp API onboarding for 50 agents. Requested callback today after 4 PM.',
            callback_time: 'Today, 4:30 PM',
            audio_url: '/audio/sample_call_1.mp3',
            lead_id: 'lead_crm_101'
          },
          {
            id: `call_${Date.now()}_2`,
            user_id: userId,
            caller_name: 'Ananya Deshmukh',
            caller_phone: '+91 99302 67890',
            duration_seconds: 38,
            status: 'callback_scheduled',
            ai_summary: 'Interested in Instagram Quickflows for D2C fashion brand. Scheduled product demo for tomorrow morning.',
            callback_time: 'Tomorrow, 11:00 AM',
            audio_url: '/audio/sample_call_2.mp3',
            lead_id: 'lead_crm_102'
          },
          {
            id: `call_${Date.now()}_3`,
            user_id: userId,
            caller_name: 'Karan Malhotra',
            caller_phone: '+91 98110 54321',
            duration_seconds: 64,
            status: 'lead_captured',
            ai_summary: 'Requested technical documentation on Shopify checkout automation and webhook triggers. Contact details saved in CRM.',
            callback_time: 'Today, 6:00 PM',
            audio_url: '/audio/sample_call_3.mp3',
            lead_id: 'lead_crm_103'
          }
        ];

        for (const call of sampleCalls) {
          await query(`
            INSERT INTO voice_calls (id, user_id, caller_name, caller_phone, duration_seconds, status, ai_summary, callback_time, audio_url, lead_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [call.id, call.user_id, call.caller_name, call.caller_phone, call.duration_seconds, call.status, call.ai_summary, call.callback_time, call.audio_url, call.lead_id]);
        }
      }

      // 8. WhatsApp Forms & Responses
      const existingForms = await query('SELECT id FROM whatsapp_forms WHERE user_id = $1', [userId]);
      if (existingForms.rows.length === 0) {
        const sampleForms = [
          {
            id: `form_${Date.now()}_1`,
            user_id: userId,
            title: 'Enterprise Onboarding & Requirement Form',
            description: 'Collects business requirements, monthly chat volume, and CRM integration preferences.',
            form_id: 'wf_enterprise_req_2026',
            status: 'published',
            fields: JSON.stringify([
              { id: 'f1', type: 'text', label: 'Company Name', placeholder: 'e.g. Acme Corp', required: true },
              { id: 'f2', type: 'email', label: 'Work Email', placeholder: 'name@company.com', required: true },
              { id: 'f3', type: 'phone', label: 'WhatsApp Contact Number', placeholder: '+91 98765 43210', required: true },
              { id: 'f4', type: 'dropdown', label: 'Current Monthly Conversation Volume', options: ['< 5,000 / mo', '5,000 - 25,000 / mo', '25,000 - 100,000 / mo', '> 100,000 / mo'], required: true },
              { id: 'f5', type: 'checkbox', label: 'Required Integrations', options: ['Shopify', 'HubSpot / Salesforce', 'Zoho CRM', 'Custom API'], required: false },
              { id: 'f6', type: 'textarea', label: 'Specific Use Case or Challenges', placeholder: 'Tell us how we can help...', required: false }
            ]),
            welcome_screen: JSON.stringify({ title: 'Welcome to ARCO Enterprise', description: 'Please share your details so our solutions architect can prepare a tailored setup.' }),
            thank_you_screen: JSON.stringify({ title: 'Thank you!', description: 'Your requirements have been recorded. Our team will contact you within 2 business hours.' }),
            response_count: 27
          },
          {
            id: `form_${Date.now()}_2`,
            user_id: userId,
            title: 'Customer Feedback & Satisfaction Survey',
            description: 'Quick CSAT and Net Promoter Score survey for resolved support chats.',
            form_id: 'wf_csat_survey',
            status: 'published',
            fields: JSON.stringify([
              { id: 'f1', type: 'radio', label: 'How satisfied were you with our response today?', options: ['5 - Very Satisfied', '4 - Satisfied', '3 - Neutral', '2 - Dissatisfied', '1 - Very Dissatisfied'], required: true },
              { id: 'f2', type: 'radio', label: 'Was your query completely resolved?', options: ['Yes, fully resolved', 'Partially resolved', 'No, still pending'], required: true },
              { id: 'f3', type: 'textarea', label: 'Any additional comments for our team?', placeholder: 'Your feedback helps us improve...', required: false }
            ]),
            welcome_screen: JSON.stringify({ title: 'Rate Your Experience', description: 'Help us serve you better with a 30-second feedback.' }),
            thank_you_screen: JSON.stringify({ title: 'Appreciate Your Feedback!', description: 'Thank you for helping us elevate our customer experience.' }),
            response_count: 84
          }
        ];

        for (const f of sampleForms) {
          const scopedFormId = `${f.form_id}_${userId}`;
          await query(`
            INSERT INTO whatsapp_forms (id, user_id, title, description, form_id, status, fields, welcome_screen, thank_you_screen, response_count)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (form_id) DO NOTHING
          `, [f.id, f.user_id, f.title, f.description, scopedFormId, f.status, f.fields, f.welcome_screen, f.thank_you_screen, f.response_count]);

          await query(`
            INSERT INTO whatsapp_form_responses (id, user_id, form_id, contact_name, contact_phone, answers, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO NOTHING
          `, [
            `resp_${Date.now()}_${userId}_${f.id}`,
            userId,
            scopedFormId,
            'Siddharth Kapoor',
            '+91 98200 44556',
            JSON.stringify({
              'Company Name': 'Kapoor Luxury Retail',
              'Work Email': 'siddharth@kapoorluxury.in',
              'WhatsApp Contact Number': '+91 98200 44556',
              'Current Monthly Conversation Volume': '25,000 - 100,000 / mo',
              'Required Integrations': ['Shopify', 'Zoho CRM']
            }),
            'submitted'
          ]);
        }
      }

      // 9. Interactive Lists
      const existingLists = await query('SELECT id FROM interactive_lists WHERE user_id = $1', [userId]);
      if (existingLists.rows.length === 0) {
        const sampleLists = [
          {
            id: `ilist_${Date.now()}_1`,
            user_id: userId,
            title: 'Main Product & Service Menu',
            header_text: 'ARCO Solutions Explorer',
            body_text: 'Explore our business automation suite. Select an option below to learn more or trigger instant demo flows.',
            footer_text: 'ARCO Communication • Powered by Meta WABA',
            button_text: 'View Solutions',
            sections: JSON.stringify([
              {
                title: 'Core Marketing & Sales',
                rows: [
                  { id: 'row_1', title: 'WhatsApp Marketing', description: 'Broadcast campaigns, templates, catalog sales', action: 'workflow_marketing' },
                  { id: 'row_2', title: 'Sales CRM & Inbox', description: 'Unified multi-agent chat, pipeline tracking', action: 'workflow_crm' },
                  { id: 'row_3', title: 'Meta Ads / CTWA', description: 'Click-to-WhatsApp Ads with direct attribution', action: 'workflow_ctwa' }
                ]
              },
              {
                title: 'AI & Automation',
                rows: [
                  { id: 'row_4', title: 'WhatsApp AI Agent', description: 'Autonomous lead qualification & website crawling', action: 'workflow_ai_agent' },
                  { id: 'row_5', title: 'Instagram Quickflows', description: 'Post/Reel comment to DM automation', action: 'workflow_instagram' },
                  { id: 'row_6', title: 'Voice AI Inbound', description: 'Convert missed calls to CRM leads instantly', action: 'workflow_voice_ai' }
                ]
              }
            ]),
            status: 'active',
            usage_count: 142
          },
          {
            id: `ilist_${Date.now()}_2`,
            user_id: userId,
            title: 'Support & Help Desk Directory',
            header_text: 'Need Assistance?',
            body_text: 'Please choose the topic that best matches your query so we can connect you with the right specialist.',
            footer_text: '24/7 Dedicated Support',
            button_text: 'Select Department',
            sections: JSON.stringify([
              {
                title: 'Support Departments',
                rows: [
                  { id: 'sup_1', title: 'Billing & Subscriptions', description: 'Invoices, plan upgrades, payment help', action: 'reply_billing' },
                  { id: 'sup_2', title: 'Technical Integration', description: 'API keys, webhooks, Meta WABA setup', action: 'reply_tech' },
                  { id: 'sup_3', title: 'Feature Request', description: 'Suggest new automation capabilities', action: 'reply_feedback' }
                ]
              }
            ]),
            status: 'active',
            usage_count: 78
          }
        ];

        for (const list of sampleLists) {
          await query(`
            INSERT INTO interactive_lists (id, user_id, title, header_text, body_text, footer_text, button_text, sections, status, usage_count)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [list.id, list.user_id, list.title, list.header_text, list.body_text, list.footer_text, list.button_text, list.sections, list.status, list.usage_count]);
        }
      }
    }

    console.log('[SUCCESS] Automation initial sample records seeded cleanly into PostgreSQL!');
  } catch (error) {
    console.error('[Seed Error]:', error);
  }
}

seedAutomationData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
