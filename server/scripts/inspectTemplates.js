import { metaWhatsAppService } from '../services/metaWhatsAppService.js';
import { query } from '../config/db.js';

async function run() {
  const meta = await metaWhatsAppService.getWhatsAppTemplates();
  console.log('--- META TEMPLATES ---');
  const templates = meta.templates || meta.data || [];
  templates.forEach(t => {
    console.log(`- ${t.name} (${t.language}) [${t.status}] - ID: ${t.id} - Category: ${t.category}`);
    if (t.components) {
      console.log('  Components:', JSON.stringify(t.components));
    }
  });

  const dbRes = await query('SELECT id, name, display_name, status, meta_status, buttons FROM whatsapp_templates ORDER BY created_at DESC LIMIT 5');
  console.log('\n--- RECENT DB TEMPLATES ---');
  console.log(JSON.stringify(dbRes.rows, null, 2));

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
