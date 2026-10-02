import { query } from '../config/db.js';
import { metaWhatsAppService } from '../services/metaWhatsAppService.js';

async function main() {
  console.log('--- Submitting & Syncing 2 Follow-Up Templates to Meta & ARCO ---');

  const templates = [
    {
      name: 'ahmedabad_follow_up',
      display_name: 'Ahmedabad - Follow Up',
      category: 'MARKETING',
      language: 'en',
      header_type: 'NONE',
      body: `👋 *Namaste Ahmedabad!*

Aapko *Arco* ka message mila tha — bas ek quick follow-up. 😊

Ahmedabad ke *optical stores Arco ko explore kar rahe hain* apni billing, workshop jobs, stock aur customer WhatsApp updates ko manage karne ke liye.

Aap bhi *peeche na reh jaayein* — ek baar *FREE DEMO* dekh lijiye aur khud decide kijiye ki Arco aapke store ke liye useful hai ya nahi.

📱 *Koi extra hardware nahi — sirf Android phone.*

*“YES”* reply karein, hum aapke convenient time par demo arrange kar denge.`,
      buttons: [{ type: 'QUICK_REPLY', text: 'YES' }],
      variables: [],
    },
    {
      name: 'gandhinagar_follow_up',
      display_name: 'Gandhi Nagar - Follow Up',
      category: 'MARKETING',
      language: 'en',
      header_type: 'NONE',
      body: `👋 *Namaste Gandhinagar!*

Aapko *Arco* ka message mila tha — bas ek quick follow-up. 😊

Gandhinagar ke *optical stores Arco ko explore kar rahe hain* apni billing, workshop jobs, stock aur customer WhatsApp updates ko ek hi app mein manage karne ke liye.

Aap bhi *peeche na reh jaayein* — ek baar *FREE DEMO* dekh lijiye aur dekhiye Arco aapke optical store ka kaam kitna simple bana sakta hai.

📱 *Koi extra hardware nahi — sirf Android phone.*

*“YES”* reply karein, hum aapke convenient time par demo arrange kar denge.`,
      buttons: [{ type: 'QUICK_REPLY', text: 'YES' }],
      variables: [],
    },
  ];

  for (const t of templates) {
    console.log(`\nSubmitting "${t.display_name}" (${t.name}) to Meta...`);
    const metaRes = await metaWhatsAppService.createWhatsAppTemplate({ template: t });
    
    let metaId = metaRes.metaTemplateId;
    let metaStatus = metaRes.metaStatus || 'PENDING';

    if (!metaRes.success) {
      if ((metaRes.error && /already exists/i.test(metaRes.error)) || metaRes.errorSubcode === 2388024 || metaRes.errorCode === 100) {
        console.log(`Template already exists on Meta. Fetching existing Meta template ID...`);
        const allMeta = await metaWhatsAppService.getWhatsAppTemplates();
        const existing = (allMeta.templates || allMeta.data || []).find((m) => m.name === t.name);
        if (existing) {
          metaId = existing.id;
          metaStatus = existing.status;
          console.log(`Found existing Meta template: ID ${metaId}, Status: ${metaStatus}`);
        }
      } else {
        console.error(`Meta submission failed:`, metaRes.error);
        continue;
      }
    } else {
      console.log(`Successfully submitted to Meta! Meta Template ID: ${metaId}, Status: ${metaStatus}`);
    }

    // Upsert into ARCO PostgreSQL database
    const dbId = `tmpl_meta_${metaId || Date.now()}`;
    const upsertSql = `
      INSERT INTO whatsapp_templates (
        id, workspace_id, user_id, name, display_name, category, language,
        status, header_type, body, buttons, variables, is_library_template,
        meta_template_id, meta_status, waba_id, created_by, created_at, updated_at
      ) VALUES (
        $1, 'ws_default', 'usr_1', $2, $3, $4, $5,
        $6, 'NONE', $7, $8, '[]', false,
        $9, $10, '1311505681068950', 'Shraddha Sharma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        body = EXCLUDED.body,
        buttons = EXCLUDED.buttons,
        status = EXCLUDED.status,
        meta_status = EXCLUDED.meta_status,
        meta_template_id = EXCLUDED.meta_template_id,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    // Also check if already exists by name
    const existingDb = await query('SELECT id FROM whatsapp_templates WHERE name = $1 LIMIT 1', [t.name]);
    let targetDbId = dbId;
    if (existingDb.rows.length > 0) {
      targetDbId = existingDb.rows[0].id;
    }

    await query(
      `INSERT INTO whatsapp_templates (
        id, workspace_id, user_id, name, display_name, category, language,
        status, header_type, body, buttons, variables, is_library_template,
        meta_template_id, meta_status, waba_id, created_by, created_at, updated_at
      ) VALUES (
        $1, 'ws_default', 'usr_1', $2, $3, $4, $5,
        $6, 'NONE', $7, $8, '[]', false,
        $9, $10, '1311505681068950', 'Shraddha Sharma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        name = EXCLUDED.name,
        body = EXCLUDED.body,
        buttons = EXCLUDED.buttons,
        status = EXCLUDED.status,
        meta_status = EXCLUDED.meta_status,
        meta_template_id = EXCLUDED.meta_template_id,
        updated_at = CURRENT_TIMESTAMP`,
      [
        targetDbId,
        t.name,
        t.display_name,
        t.category,
        t.language,
        metaStatus,
        t.body,
        JSON.stringify(t.buttons),
        metaId,
        metaStatus,
      ]
    );

    console.log(`Saved to ARCO database: ${t.display_name} (ID: ${targetDbId})`);
  }

  // Final check: Poll Meta for both templates
  console.log('\n--- Checking Live Status on Meta Graph API ---');
  const allMeta = await metaWhatsAppService.getWhatsAppTemplates();
  const tNames = ['ahmedabad_follow_up', 'gandhinagar_follow_up'];
  for (const name of tNames) {
    const found = (allMeta.templates || allMeta.data || []).find((m) => m.name === name);
    if (found) {
      console.log(`[Meta] ${found.name}: Status = ${found.status}, ID = ${found.id}`);
      // Update DB with latest status
      await query(
        'UPDATE whatsapp_templates SET status = $1, meta_status = $2 WHERE meta_template_id = $3 OR name = $4',
        [found.status, found.status, found.id, found.name]
      );
    }
  }

  console.log('\nAll done!');
  setTimeout(() => process.exit(0), 100);
}

main().catch((err) => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
