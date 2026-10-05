import { metaWhatsAppService } from '../services/metaWhatsAppService.js';
import { query } from '../config/db.js';

async function main() {
  console.log('=== Submitting Gujarat Follow Up Template to Meta & ARCO DB ===\n');

  const templateData = {
    name: 'gujarat_follow_up',
    display_name: 'Gujarat - Follow Up',
    category: 'MARKETING',
    language: 'en',
    header_type: 'NONE',
    body: `Aapko *Arco* ka message mila tha — bas ek quick follow-up. 😊

Gujrat ke *optical stores Arco ko explore kar rahe hain* apni billing, workshop jobs, stock aur customer WhatsApp updates ko manage karne ke liye.

Aap bhi *peeche na reh jaayein* — ek baar *FREE DEMO* dekh lijiye aur khud decide kijiye ki Arco aapke store ke liye useful hai ya nahi.

📱 *Koi extra hardware nahi — sirf Android phone.*

*“YES”* reply karein, hum aapke convenient time par demo arrange kar denge.`,
    buttons: [
      {
        type: 'QUICK_REPLY',
        text: 'YES',
      },
    ],
    variables: [],
  };

  console.log('Template details to submit:');
  console.log('Name:', templateData.name);
  console.log('Display Name:', templateData.display_name);
  console.log('Category:', templateData.category);
  console.log('Language:', templateData.language);
  console.log('Buttons:', JSON.stringify(templateData.buttons, null, 2));

  console.log('\nSubmitting to Meta Graph API...');
  const metaRes = await metaWhatsAppService.createWhatsAppTemplate({ template: templateData });

  console.log('\nMeta API Response:', JSON.stringify(metaRes, null, 2));

  let metaId = metaRes.metaTemplateId;
  let metaStatus = metaRes.metaStatus || 'PENDING';

  if (!metaRes.success) {
    if ((metaRes.error && /already exists/i.test(metaRes.error)) || metaRes.errorSubcode === 2388024 || metaRes.errorCode === 100) {
      console.log('Template already exists on Meta. Fetching existing Meta template ID...');
      const allMeta = await metaWhatsAppService.getWhatsAppTemplates();
      const existing = (allMeta.templates || allMeta.data || []).find((m) => m.name === templateData.name);
      if (existing) {
        metaId = existing.id;
        metaStatus = existing.status;
        console.log(`Found existing Meta template: ID ${metaId}, Status: ${metaStatus}`);
      }
    } else {
      console.error('Meta submission failed with error:', metaRes.error);
      process.exit(1);
    }
  } else {
    console.log(`\n Successfully submitted to Meta! ID: ${metaId}, Status: ${metaStatus}`);
  }

  // Save/Upsert to PostgreSQL database
  const dbId = `tmpl_meta_${metaId || Date.now()}`;
  console.log(`\nUpserting to ARCO database (ID: ${dbId})...`);

  const existingDb = await query('SELECT id FROM whatsapp_templates WHERE name = $1 LIMIT 1', [templateData.name]);
  let targetDbId = dbId;
  if (existingDb.rows.length > 0) {
    targetDbId = existingDb.rows[0].id;
  }

  const upsertRes = await query(
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
      category = EXCLUDED.category,
      language = EXCLUDED.language,
      body = EXCLUDED.body,
      buttons = EXCLUDED.buttons,
      status = EXCLUDED.status,
      meta_status = EXCLUDED.meta_status,
      meta_template_id = EXCLUDED.meta_template_id,
      waba_id = EXCLUDED.waba_id,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *`,
    [
      targetDbId,
      templateData.name,
      templateData.display_name,
      templateData.category,
      templateData.language,
      metaStatus,
      templateData.body,
      JSON.stringify(templateData.buttons),
      metaId,
      metaStatus,
    ]
  );

  console.log('Saved to ARCO Database:', {
    id: upsertRes.rows[0].id,
    name: upsertRes.rows[0].name,
    display_name: upsertRes.rows[0].display_name,
    status: upsertRes.rows[0].status,
    meta_status: upsertRes.rows[0].meta_status,
    meta_template_id: upsertRes.rows[0].meta_template_id,
    buttons: upsertRes.rows[0].buttons,
  });

  // Verify live status from Meta
  console.log('\nChecking live status on Meta...');
  const allMeta = await metaWhatsAppService.getWhatsAppTemplates();
  const found = (allMeta.templates || allMeta.data || []).find((m) => m.name === templateData.name);
  if (found) {
    console.log(`[Meta Live Status] Name: ${found.name}, Status: ${found.status}, ID: ${found.id}`);
    if (found.status !== metaStatus) {
      await query(
        'UPDATE whatsapp_templates SET status = $1, meta_status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [found.status, found.status, targetDbId]
      );
      console.log(`Updated DB status to: ${found.status}`);
    }
  }

  console.log('\n--- Gujarat Follow-Up template submission complete! ---');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
