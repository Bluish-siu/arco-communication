import { metaWhatsAppService } from '../services/metaWhatsAppService.js';
import { query } from '../config/db.js';

async function checkStatus() {
  const allMeta = await metaWhatsAppService.getWhatsAppTemplates();
  const templates = allMeta.templates || allMeta.data || [];
  const targetNames = ['optic_expo_ahmedabad', 'gujarat_follow_up', 'ahmedabad_follow_up', 'gandhinagar_follow_up'];

  for (const name of targetNames) {
    const found = templates.find((m) => m.name === name);
    if (found) {
      console.log(`[Meta Status] ${found.name}: Status = ${found.status}, ID = ${found.id}`);
      const res = await query(
        'UPDATE whatsapp_templates SET status = $1, meta_status = $2, updated_at = CURRENT_TIMESTAMP WHERE meta_template_id = $3 OR name = $4 RETURNING id, name, display_name, status, meta_status',
        [found.status, found.status, found.id, found.name]
      );
      if (res.rows.length > 0) {
        console.log('  Updated in ARCO DB:', res.rows[0]);
      }
    } else {
      console.log(`[Meta Status] ${name}: Not found in Meta.`);
    }
  }
  process.exit(0);
}

checkStatus().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
