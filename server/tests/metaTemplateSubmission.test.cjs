/**
 * ARCO Communication - Meta WhatsApp Template Submission & Approval Verification Suite
 * Tests:
 * 1. Template Payload Construction & Meta Specs
 * 2. Invalid Variables Validation (non-numeric, non-consecutive)
 * 3. Example Values Generation (body_text, header_text, button url)
 * 4. Header & Button Component Mapping
 * 5. Successful Meta Submission (Mocked Meta API returning PENDING)
 * 6. Meta Rejection & Error Handling (Mocked Meta API returning 400)
 * 7. Duplicate Template Name Handling
 * 8. Controller Submission & Database Persistence (Initial status is PENDING, NOT APPROVED)
 * 9. Tenant Isolation & Security
 * 10. No Token Leakage (Tokens never exposed in response or DB)
 * 11. Status Synchronization (syncTemplatesWithMeta)
 */

const assert = require('assert');
const path = require('path');

// Load environment variables
try {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
} catch (e) {}

let passedTests = 0;
let totalTests = 0;

function reportTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${totalTests}. ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${totalTests}. ${name}`);
    console.error(`    Error: ${err.message}`);
    throw err;
  }
}

async function reportAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ [PASS] ${totalTests}. ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${totalTests}. ${name}`);
    console.error(`    Error: ${err.message}`);
    throw err;
  }
}

(async () => {
  console.log('\n=============================================================');
  console.log(' RUNNING META WHATSAPP TEMPLATE SUBMISSION TEST SUITE');
  console.log('=============================================================\n');

  const { query } = await import('../config/db.js');
  const { metaWhatsAppService } = await import('../services/metaWhatsAppService.js');
  const { templateController } = await import('../controllers/templateController.js');

  const originalFetch = global.fetch;

  // 1. Template Payload Construction & Meta Specs
  reportTest('1. Template Payload Construction: Validates name, category, language, and casing', () => {
    const template = {
      name: 'Black Friday Sale 2026!',
      category: 'MARKETING',
      language: 'en_US',
      header_type: 'TEXT',
      header_text: 'Limited Time Deal',
      body: 'Hello {{1}}, get {{2}}% off your order today! Use coupon {{3}}.',
      footer: 'Reply STOP to opt out',
      buttons: [
        { type: 'URL', text: 'Shop Now', url: 'https://example.com/shop' },
        { type: 'QUICK_REPLY', text: 'Speak to Agent' },
      ],
    };

    const sampleValues = {
      var_1: 'Aarav',
      var_2: '50',
      var_3: 'BF50',
    };

    const payload = metaWhatsAppService.buildMetaTemplatePayload({
      template,
      sampleValues,
    });

    assert.strictEqual(payload.name, 'black_friday_sale_2026', 'Name must be converted to lowercase alphanumeric and underscores');
    assert.strictEqual(payload.category, 'MARKETING');
    assert.strictEqual(payload.language, 'en_US');
    assert.strictEqual(payload.displayTitle, undefined, 'UI-only displayTitle must NOT be in Meta payload');
    assert.strictEqual(payload.displayName, undefined, 'UI-only displayName must NOT be in Meta payload');

    const bodyComp = payload.components.find((c) => c.type === 'BODY');
    assert.ok(bodyComp, 'Must contain BODY component');
    assert.deepStrictEqual(bodyComp.example.body_text, [['Aarav', '50', 'BF50']], 'Example body_text must contain 1 row with 3 samples');

    const headerComp = payload.components.find((c) => c.type === 'HEADER');
    assert.ok(headerComp, 'Must contain HEADER component');
    assert.strictEqual(headerComp.format, 'TEXT');
    assert.strictEqual(headerComp.text, 'Limited Time Deal');

    const footerComp = payload.components.find((c) => c.type === 'FOOTER');
    assert.ok(footerComp, 'Must contain FOOTER component');
    assert.strictEqual(footerComp.text, 'Reply STOP to opt out');

    const buttonsComp = payload.components.find((c) => c.type === 'BUTTONS');
    assert.ok(buttonsComp, 'Must contain BUTTONS component');
    assert.strictEqual(buttonsComp.buttons.length, 2);
    assert.strictEqual(buttonsComp.buttons[0].type, 'URL');
    assert.strictEqual(buttonsComp.buttons[1].type, 'QUICK_REPLY');
  });

  // 2. Invalid Variables Validation (non-numeric, non-consecutive)
  reportTest('2. Invalid Variables Validation: Rejects non-numeric variables and non-consecutive sequences', () => {
    // Non-numeric variable
    const nonNumericCheck = metaWhatsAppService.validateTemplateVariables('Hello {{name}}, welcome to ARCO!');
    assert.strictEqual(nonNumericCheck.isValid, false);
    assert.ok(nonNumericCheck.error.includes('numeric variables like {{1}}'));

    // Gaps in numbering: 1 and 3 without 2
    const gapCheck = metaWhatsAppService.validateTemplateVariables('Order #{{1}} is dispatched to {{3}}.');
    assert.strictEqual(gapCheck.isValid, false);
    assert.ok(gapCheck.error.includes('consecutive numbers with no gaps'));

    // Starting at 2 instead of 1
    const startCheck = metaWhatsAppService.validateTemplateVariables('Welcome {{2}} to our service.');
    assert.strictEqual(startCheck.isValid, false);
    assert.ok(startCheck.error.includes('start with {{1}}'));

    // Valid consecutive sequence
    const validCheck = metaWhatsAppService.validateTemplateVariables('Hello {{1}}, your order {{2}} arrives on {{3}}.');
    assert.strictEqual(validCheck.isValid, true);
    assert.strictEqual(validCheck.count, 3);
  });

  // 3. Example Values Generation for Variables
  reportTest('3. Example Values Generation: Automatically provides fallback samples when none provided', () => {
    const template = {
      name: 'order_status_update',
      category: 'UTILITY',
      language: 'en_US',
      header_type: 'NONE',
      body: 'Your package {{1}} is out for delivery with tracking {{2}}.',
    };

    const payload = metaWhatsAppService.buildMetaTemplatePayload({
      template,
      sampleValues: {}, // empty sample values
    });

    const bodyComp = payload.components.find((c) => c.type === 'BODY');
    assert.ok(bodyComp.example, 'Example must be generated when variables are present');
    assert.deepStrictEqual(bodyComp.example.body_text, [['Sample_1', 'Sample_2']]);
  });

  // 4. Header & Button Component Mapping
  reportTest('4. Header & Button Mapping: Correctly maps media header handle and phone/URL buttons', () => {
    const template = {
      name: 'catalog_launch_2026',
      category: 'MARKETING',
      language: 'en_US',
      header_type: 'IMAGE',
      body: 'Explore our latest new arrivals for 2026.',
      buttons: [
        { type: 'PHONE_NUMBER', text: 'Call Us', phone_number: '+919988776655' },
        { type: 'URL', text: 'Track Order', url: 'https://example.com/track/{{1}}', sampleUrl: 'https://example.com/track/ORD123' },
      ],
    };

    const payload = metaWhatsAppService.buildMetaTemplatePayload({
      template,
      sampleValues: {},
      headerHandle: '4:h_mock_media_handle_xyz123',
    });

    const headerComp = payload.components.find((c) => c.type === 'HEADER');
    assert.strictEqual(headerComp.format, 'IMAGE');
    assert.deepStrictEqual(headerComp.example.header_handle, ['4:h_mock_media_handle_xyz123']);

    const btnComp = payload.components.find((c) => c.type === 'BUTTONS');
    assert.strictEqual(btnComp.buttons[0].type, 'PHONE_NUMBER');
    assert.strictEqual(btnComp.buttons[0].phone_number, '+919988776655');
    assert.strictEqual(btnComp.buttons[1].type, 'URL');
    assert.deepStrictEqual(btnComp.buttons[1].example, ['https://example.com/track/ORD123']);
  });

  // 5. Successful Meta Submission (Mocked Meta API returning PENDING)
  await reportAsyncTest('5. Successful Meta Submission: Returns PENDING status from Meta and passes WABA ID', async () => {
    let capturedUrl = '';
    let capturedHeaders = {};
    let capturedBody = null;

    global.fetch = async (url, options) => {
      capturedUrl = url;
      capturedHeaders = options?.headers || {};
      capturedBody = options?.body ? JSON.parse(options.body) : null;

      return {
        ok: true,
        status: 200,
        json: async () => ({
          id: 'meta_template_id_99887766',
          status: 'PENDING',
          category: 'MARKETING',
        }),
      };
    };

    const template = {
      name: 'promo_spring_2026',
      category: 'MARKETING',
      language: 'en_US',
      header_type: 'NONE',
      body: 'Hello {{1}}, spring deals are live now!',
    };

    const result = await metaWhatsAppService.createWhatsAppTemplate({
      template,
      sampleValues: { var_1: 'Vikram' },
      userId: 'usr_test_1',
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.metaTemplateId, 'meta_template_id_99887766');
    assert.strictEqual(result.metaStatus, 'PENDING');
    assert.ok(capturedUrl.includes('/message_templates'), 'Must POST to /message_templates');
    assert.ok(capturedHeaders['Authorization'].startsWith('Bearer '), 'Must use Bearer token');
    assert.strictEqual(capturedBody.name, 'promo_spring_2026');
  });

  // 6. Meta Rejection & Error Handling
  await reportAsyncTest('6. Meta Rejection Handling: Captures Meta error code & does NOT mark approved', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          message: 'The category UTILITY is not appropriate for this promotional message.',
          type: 'OAuthException',
          code: 100,
          error_subcode: 2388042,
          fbtrace_id: 'fbtrace_test_err_1',
        },
      }),
    });

    const template = {
      name: 'rejected_deal_template',
      category: 'UTILITY',
      language: 'en_US',
      header_type: 'NONE',
      body: 'Buy 1 Get 1 Free on all pizzas today!',
    };

    const result = await metaWhatsAppService.createWhatsAppTemplate({
      template,
      sampleValues: {},
      userId: 'usr_test_1',
    });

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('The category UTILITY is not appropriate'));
    assert.strictEqual(result.metaError.code, 100);
    assert.strictEqual(result.metaError.subcode, 2388042);
  });

  // 7. Duplicate Template Name Handling
  await reportAsyncTest('7. Duplicate Template: Provides safe and clear duplicate error message', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          message: 'A template with this name and language already exists.',
          type: 'OAuthException',
          code: 100,
          error_subcode: 2388001,
        },
      }),
    });

    const template = {
      name: 'existing_welcome_tmpl',
      category: 'MARKETING',
      language: 'en_US',
      header_type: 'NONE',
      body: 'Welcome to our platform!',
    };

    const result = await metaWhatsAppService.createWhatsAppTemplate({
      template,
      sampleValues: {},
      userId: 'usr_test_1',
    });

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('already exists in your connected WhatsApp Business Account'));
  });

  // 8. Controller Submission & Database Persistence
  await reportAsyncTest('8. Controller Submission: Updates DB record with PENDING status, WABA ID, and Meta ID', async () => {
    const testId = `tmpl_test_submit_${Date.now()}`;
    const testUserId = 'usr_test_submit_user';

    // Insert initial DRAFT template into DB
    await query(
      `INSERT INTO whatsapp_templates (
        id, workspace_id, user_id, name, display_name, category, language,
        status, header_type, body, is_library_template
      ) VALUES ($1, 'ws_default', $2, 'autumn_flash_sale', 'Autumn Flash Sale', 'MARKETING', 'en_US', 'DRAFT', 'NONE', 'Flash sale for {{1}}!', false)`,
      [testId, testUserId]
    );

    // Mock Meta returning PENDING
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'meta_id_live_submission_123',
        status: 'PENDING',
        category: 'MARKETING',
      }),
    });

    const req = {
      user: { id: testUserId },
      params: { id: testId },
      body: { sampleValues: { var_1: 'Priya' } },
    };

    let responseData = null;
    let statusCode = 200;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        responseData = data;
        return res;
      },
    };

    await templateController.submitTemplate(req, res, (err) => {
      if (err) throw err;
    });

    assert.strictEqual(responseData.success, true);
    assert.strictEqual(responseData.metaStatus, 'PENDING');
    assert.strictEqual(responseData.metaTemplateId, 'meta_id_live_submission_123');

    // Verify database row
    const dbRowRes = await query('SELECT * FROM whatsapp_templates WHERE id = $1', [testId]);
    const dbRow = dbRowRes.rows[0];

    assert.strictEqual(dbRow.status, 'PENDING', 'Database status must be PENDING, NOT APPROVED');
    assert.strictEqual(dbRow.meta_status, 'PENDING', 'Database meta_status must be PENDING');
    assert.strictEqual(dbRow.meta_template_id, 'meta_id_live_submission_123');
    assert.ok(dbRow.waba_id, 'waba_id must be stored on template record');

    // Cleanup
    await query('DELETE FROM whatsapp_templates WHERE id = $1', [testId]);
  });

  // 9. Tenant Isolation
  await reportAsyncTest('9. Tenant Isolation: Tenant B cannot submit or view Tenant A template', async () => {
    const templateAId = `tmpl_tenant_a_${Date.now()}`;
    await query(
      `INSERT INTO whatsapp_templates (
        id, workspace_id, user_id, name, display_name, category, language,
        status, header_type, body, is_library_template
      ) VALUES ($1, 'ws_default', 'tenant_A', 'private_tenant_tmpl', 'Private Template', 'MARKETING', 'en_US', 'DRAFT', 'NONE', 'Private', false)`,
      [templateAId]
    );

    // Tenant B attempts to submit Tenant A's template
    const req = {
      user: { id: 'tenant_B' },
      params: { id: templateAId },
      body: {},
    };

    let statusCode = 200;
    let responseData = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        responseData = data;
        return res;
      },
    };

    await templateController.submitTemplate(req, res, () => {});

    assert.strictEqual(statusCode, 404, 'Must return 404 unauthorized when tenant mismatch');
    assert.strictEqual(responseData.success, false);

    // Clean up
    await query('DELETE FROM whatsapp_templates WHERE id = $1', [templateAId]);
  });

  // 10. No Token Leakage
  await reportAsyncTest('10. Security: Access tokens are never returned in submit or sync responses', async () => {
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'meta_security_test_id',
        status: 'PENDING',
      }),
    });

    const template = {
      name: 'security_audit_tmpl',
      category: 'MARKETING',
      language: 'en_US',
      header_type: 'NONE',
      body: 'Security audit test message.',
    };

    const result = await metaWhatsAppService.createWhatsAppTemplate({
      template,
      userId: 'usr_sec_1',
    });

    const resultStr = JSON.stringify(result);
    assert.strictEqual(resultStr.includes(process.env.META_ACCESS_TOKEN || 'EAAo'), false, 'Access token must never appear in response object');
    assert.strictEqual(result.accessToken, undefined, 'accessToken field must not be present');
  });

  // 11. Status Synchronization (syncTemplatesWithMeta)
  await reportAsyncTest('11. Status Synchronization: Updates local PENDING template to APPROVED when Meta approves', async () => {
    const syncTestId = `tmpl_sync_test_${Date.now()}`;
    const syncTestName = `sync_order_update_${Date.now()}`;
    const syncMetaId = `meta_sync_${Date.now()}`;
    const testUserId = 'usr_sync_user';

    // Insert template in PENDING state
    await query(
      `INSERT INTO whatsapp_templates (
        id, workspace_id, user_id, name, display_name, category, language,
        status, meta_status, meta_template_id, header_type, body, is_library_template
      ) VALUES ($1, 'ws_default', $2, $3, 'Sync Test Template', 'MARKETING', 'en_US', 'PENDING', 'PENDING', $4, 'NONE', 'Order update', false)`,
      [syncTestId, testUserId, syncTestName, syncMetaId]
    );

    // Mock Meta GET message_templates returning APPROVED
    global.fetch = async (url) => {
      if (url.includes('/message_templates')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: [
              {
                id: syncMetaId,
                name: syncTestName,
                status: 'APPROVED',
                category: 'MARKETING',
                language: 'en_US',
              },
            ],
          }),
        };
      }
      return { ok: false, status: 404 };
    };

    const syncResult = await metaWhatsAppService.syncTemplatesWithMeta(testUserId);
    assert.strictEqual(syncResult.success, true);
    assert.ok(syncResult.syncedCount >= 1, 'Should have synced at least 1 template');

    // Check DB row updated to APPROVED
    const updatedRow = await query('SELECT * FROM whatsapp_templates WHERE id = $1', [syncTestId]);
    assert.strictEqual(updatedRow.rows[0].status, 'APPROVED');
    assert.strictEqual(updatedRow.rows[0].meta_status, 'APPROVED');

    // Cleanup
    await query('DELETE FROM whatsapp_templates WHERE id = $1', [syncTestId]);
  });

  // Restore fetch
  global.fetch = originalFetch;

  console.log('\n-------------------------------------------------------------');
  console.log(` RESULTS: ${passedTests}/${totalTests} Tests Passed`);
  console.log('-------------------------------------------------------------\n');
  process.exit(0);
})();
