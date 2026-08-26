import { query } from './db.js';

const PIPELINE_STAGES = [
  'New Lead',
  'Qualification',
  'Needs Analysis',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
];

const SAMPLE_NOTES = [
  'Interested in WhatsApp Marketing and automated chatbots for D2C store.',
  'Enterprise demo requested for multi-agent support inbox and CRM integration.',
  'High deal intent — reviewing pricing proposal for annual tier.',
  'Discussing custom CTWA ads workflow and Instagram DM automation.',
  'Ready to onboard team of 15 agents next week.',
  'Looking for WhatsApp Commerce catalog checkout and payment links.',
  'Follow-up scheduled on lead qualification workflows.',
];

const OWNERS = ['Shraddha', 'Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram'];

async function seedPipelineStages() {
  try {
    console.log('[PostgreSQL] Distributing contacts across 7 Interakt Pipeline Stages...');

    const contactsRes = await query('SELECT id, value, notes, owner FROM contacts ORDER BY created_at ASC');
    console.log(`Found ${contactsRes.rows.length} contacts to organize into pipeline stages.`);

    for (let i = 0; i < contactsRes.rows.length; i++) {
      const c = contactsRes.rows[i];
      const stage = PIPELINE_STAGES[i % PIPELINE_STAGES.length];
      const owner = OWNERS[i % OWNERS.length];
      const note = SAMPLE_NOTES[i % SAMPLE_NOTES.length];
      const dealValue = c.value && parseFloat(c.value) > 0 
        ? parseFloat(c.value) 
        : (Math.floor(Math.random() * 8) + 2) * 10000; // ₹20,000 - ₹90,000

      await query(
        `UPDATE contacts 
         SET status = $1, owner = $2, notes = COALESCE(NULLIF(notes, ''), $3), value = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [stage, owner, note, dealValue, c.id]
      );
    }

    console.log('[PostgreSQL] Pipeline stages distributed successfully.');

    // Print breakdown
    const breakdown = await query('SELECT status, COUNT(*), SUM(value) as total_val FROM contacts GROUP BY status ORDER BY count DESC');
    console.table(breakdown.rows);
  } catch (err) {
    console.error('Error seeding pipeline stages:', err);
  } finally {
    process.exit(0);
  }
}

seedPipelineStages();
