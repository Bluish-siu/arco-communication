import { query } from './db.js';

export async function initDripSequencesTable() {
  try {
    console.log('[PostgreSQL] Initializing drip_sequences schema...');

    await query(`
      CREATE TABLE IF NOT EXISTS drip_sequences (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'Draft',
        audience_type VARCHAR(100) DEFAULT 'all',
        audience_filter JSONB DEFAULT '{}',
        steps JSONB NOT NULL DEFAULT '[]',
        stats JSONB DEFAULT '{"enrolled": 0, "step1_sent": 0, "step2_sent": 0, "replied": 0, "moved_to_crm": 0}',
        user_id VARCHAR(100),
        created_by VARCHAR(100) DEFAULT 'Admin',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if sample wholesale sequence exists, seed if empty
    const countRes = await query('SELECT COUNT(*) FROM drip_sequences');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      const sampleSteps = [
        {
          id: 'step_1',
          day: 1,
          delayHours: 0,
          title: 'Day 1: Wholesale Catalog & Welcome',
          templateName: 'arco_wholesale',
          templateLanguage: 'gu',
          condition: 'always',
          actionType: 'send_template',
          description: 'Dispatches introductory wholesale catalog and ledger terms.',
        },
        {
          id: 'step_2',
          day: 3,
          delayHours: 48,
          title: 'Day 3: Follow-Up Reminder',
          templateName: 'gujarat_follow_up',
          templateLanguage: 'en',
          condition: 'if_no_reply',
          actionType: 'send_template',
          description: 'Automatically sends friendly follow-up only if lead has not replied after 48 hours.',
        },
        {
          id: 'step_3',
          day: 6,
          delayHours: 72,
          title: 'Day 6: Move to Sales CRM Pipeline',
          condition: 'if_replied',
          actionType: 'move_to_pipeline',
          targetStage: 'Qualified / Demo',
          assignee: 'Territory Sales Manager',
          fallbackAction: 'tag_cold',
          description: 'Moves engaged respondents to Sales Pipeline stages; tags non-respondents as Cold Leads.',
        },
      ];

      await query(
        `INSERT INTO drip_sequences (
           id, name, description, status, audience_type, audience_filter, steps, stats, created_by
         )
         VALUES ($1, $2, $3, 'Draft', 'optical_retailers', $4, $5, $6, 'Admin')
         ON CONFLICT (id) DO NOTHING`,
        [
          'drip_seq_sample_01',
          'Wholesale Lead Nurture & Pipeline Drip',
          '3-Stage Automated Nurture Journey: Day 1 Wholesale Catalog -> Day 3 Follow-Up if unreplied -> Day 6 Sales CRM Routing.',
          JSON.stringify({ tag: 'Optical Lead', territory: 'Gujarat' }),
          JSON.stringify(sampleSteps),
          JSON.stringify({ enrolled: 236, step1_sent: 236, step2_sent: 142, replied: 48, moved_to_crm: 38 }),
        ]
      );
      console.log('[PostgreSQL] Seeded sample Wholesale Drip Sequence (Draft/Paused mode).');
    }

    console.log('[SUCCESS] drip_sequences table ready!');
  } catch (err) {
    console.error('[ERROR] Failed to init drip_sequences table:', err);
  }
}

// Auto-run if executed directly
if (process.argv[1]?.includes('initDripSequencesTable')) {
  initDripSequencesTable().then(() => process.exit(0)).catch(() => process.exit(1));
}
