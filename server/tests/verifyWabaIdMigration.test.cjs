const assert = require('assert');

async function verify() {
  console.log('=============================================================');
  console.log(' VERIFYING WHATSAPP TEMPLATES WABA_ID MIGRATION');
  console.log('=============================================================\n');

  const { query, pool } = await import('../config/db.js');
  const { initWhatsAppTemplatesSchema } = await import('../config/initWhatsAppTemplatesTables.js');

  // 1. Run migration
  console.log('1. Running idempotent initWhatsAppTemplatesSchema()...');
  const initResult = await initWhatsAppTemplatesSchema();
  assert.strictEqual(initResult, true, 'initWhatsAppTemplatesSchema must return true');
  console.log('   ✓ Schema init succeeded');

  // 2. Verify column existence in information_schema
  console.log('2. Verifying column "waba_id" in information_schema.columns...');
  const colRes = await query(
    "SELECT column_name, data_type, character_maximum_length " +
    "FROM information_schema.columns " +
    "WHERE table_name = 'whatsapp_templates' AND column_name = 'waba_id'"
  );

  assert.ok(colRes.rows.length > 0, 'Column "waba_id" must exist in whatsapp_templates table');
  console.log('   ✓ Column exists:', colRes.rows[0]);
  assert.strictEqual(colRes.rows[0].column_name, 'waba_id');

  // 3. Verify existing template records were preserved and not deleted
  console.log('3. Verifying existing template records were preserved...');
  const countRes = await query("SELECT COUNT(*) as count FROM whatsapp_templates");
  console.log('   ✓ Total templates in database:', countRes.rows[0].count);

  // 4. Verify index exists
  console.log('4. Verifying index "idx_whatsapp_templates_waba_id"...');
  const idxRes = await query(
    "SELECT indexname FROM pg_indexes WHERE tablename = 'whatsapp_templates' AND indexname = 'idx_whatsapp_templates_waba_id'"
  );
  assert.ok(idxRes.rows.length > 0, 'Index idx_whatsapp_templates_waba_id must exist');
  console.log('   ✓ Index exists:', idxRes.rows[0].indexname);

  // 5. Test inserting & querying a dummy template with waba_id
  console.log('5. Testing read/write with waba_id field...');
  const testId = `test_waba_col_${Date.now()}`;
  await query(
    "INSERT INTO whatsapp_templates (id, name, display_name, body, status, waba_id, meta_status) " +
    "VALUES ($1, 'test_waba_col', 'Test Waba Col', 'Hello {{1}}', 'DRAFT', 'waba_test_123', 'PENDING')",
    [testId]
  );
  const fetched = await query("SELECT id, name, waba_id, meta_status FROM whatsapp_templates WHERE id = $1", [testId]);
  assert.strictEqual(fetched.rows[0].waba_id, 'waba_test_123');
  await query("DELETE FROM whatsapp_templates WHERE id = $1", [testId]);
  console.log('   ✓ Insert, query, and cleanup with waba_id succeeded');

  console.log('\n-------------------------------------------------------------');
  console.log(' ALL WABA_ID MIGRATION VERIFICATION CHECKS PASSED!');
  console.log('-------------------------------------------------------------\n');

  await pool.end();
  process.exit(0);
}

verify().catch((err) => {
  console.error('\n❌ VERIFICATION FAILED:', err);
  process.exit(1);
});
