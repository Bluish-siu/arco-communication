import puppeteer from 'puppeteer';
import { query, db } from './db.js';
import jwt from 'jsonwebtoken';
import { config } from './index.js';

const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:5000/api';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function runWorkflowsRegressionQA() {
  console.log('================================================================');
  console.log('🧪 ARCO PRODUCTION QA — AUTOMATION & WORKFLOWS REGRESSION TEST');
  console.log('================================================================\n');

  const token = jwt.sign(
    { id: 'usr_1', email: 'owner@arco.com', role: 'admin', name: 'Shraddha' },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  const diagnostics = {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    unexpectedRedirects: [],
    errorBanners: [],
    pgErrors: [],
  };

  const report = {
    page: {
      status: 'FAIL',
      url: '/automation/workflows',
      api: 'GET /api/automation/workflows',
      table: 'workflows',
      existingLoaded: false,
    },
    create: {
      status: 'FAIL',
      workflowId: null,
      postApi: 'POST /api/automation/workflows',
      pgVerification: 'FAIL',
    },
    refreshPersistence: 'FAIL',
    edit: {
      status: 'FAIL',
      putApi: 'PUT /api/automation/workflows/:id',
      pgVerification: 'FAIL',
      refreshPersistence: 'FAIL',
    },
    enableDisable: {
      status: 'FAIL',
      toggleApi: 'PUT /api/automation/workflows/:id/toggle',
      pgStatus: '',
      refreshPersistence: 'FAIL',
    },
    workflowBuilder: {
      status: 'FAIL',
      getApi: 'GET /api/automation/workflows/:id',
      nodesAndEdgesLoaded: false,
    },
    delete: {
      status: 'FAIL',
      deleteApi: 'DELETE /api/automation/workflows/:id',
      uiRemoval: 'FAIL',
      pgRemoval: 'FAIL',
      refreshVerification: 'FAIL',
    },
    cleanup: {
      status: 'FAIL',
      qaRecordsRemaining: 0,
    },
  };

  let browser = null;
  let createdWfId = null;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon.ico')) {
          diagnostics.consoleErrors.push(text);
        }
      }
    });

    page.on('pageerror', (err) => {
      diagnostics.pageErrors.push(err.message);
    });

    page.on('requestfailed', (req) => {
      if (!req.url().includes('favicon.ico')) {
        diagnostics.failedRequests.push(`${req.method()} ${req.url()} (${req.failure()?.errorText})`);
      }
    });

    // Seed session token
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle0' });
    await page.evaluate((tok) => {
      localStorage.setItem('arco_auth_token', tok);
    }, token);

    // =============================================================
    // 1. OPEN AUTOMATION / WORKFLOWS PAGE
    // =============================================================
    console.log('--- 1. Testing Workflows Page (/automation/workflows) ---');
    await page.goto(`${FRONTEND_URL}/automation/workflows`, { waitUntil: 'networkidle0' });
    await delay(500);

    const wfUrl = page.url();
    const isWfPageLoaded = wfUrl.includes('/automation/workflows');

    const wfCountRes = await query('SELECT count(*) FROM workflows');
    const existingWfCount = parseInt(wfCountRes.rows[0].count, 10);

    const domHasWorkflows = await page.evaluate(() => {
      const text = document.body ? document.body.innerText : '';
      return text.includes('Workflow') || text.includes('Automation') || text.includes('Trigger') || text.includes('Active');
    });

    report.page.existingLoaded = isWfPageLoaded && existingWfCount > 0;
    report.page.status = isWfPageLoaded && domHasWorkflows ? 'PASS' : 'FAIL';

    console.log(`Workflows Page Status: ${report.page.status}, Existing DB Workflows: ${existingWfCount}\n`);

    // =============================================================
    // 2. CREATE TEMPORARY QA AUTOMATION
    // =============================================================
    console.log('--- 2. Creating Temporary QA Automation ---');
    const testWfPayload = {
      name: 'QA TEST AUTOMATION — DELETE AFTER TEST',
      description: 'Automated regression verification workflow for ARCO Production QA',
      trigger: 'Inbound Message',
      action: 'Interactive Chatbot Flow',
      status: 'active',
      is_published: true,
    };

    const createResult = await page.evaluate(async (tok, payload) => {
      const res = await fetch('/api/automation/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tok}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return { success: res.ok && data.success, data: data.data, status: res.status };
    }, token, testWfPayload);

    createdWfId = createResult.data?.id;
    report.create.workflowId = createdWfId;

    // Verify in PostgreSQL
    const pgWfCreated = await db.findOne('workflows', 'id = $1', [createdWfId]);
    const isPgCreated = !!pgWfCreated && pgWfCreated.name === testWfPayload.name;

    report.create.pgVerification = isPgCreated ? 'PASS' : 'FAIL';
    report.create.status = createResult.success && isPgCreated ? 'PASS' : 'FAIL';

    console.log(`Workflow Created: ID = "${createdWfId}", Status = ${report.create.status}\n`);

    // =============================================================
    // 3. REFRESH PERSISTENCE
    // =============================================================
    console.log('--- 3. Testing Refresh Persistence after Create ---');
    await page.reload({ waitUntil: 'networkidle0' });
    await delay(400);

    const pgWfAfterRefresh = await db.findOne('workflows', 'id = $1', [createdWfId]);
    report.refreshPersistence = !!pgWfAfterRefresh ? 'PASS' : 'FAIL';
    console.log(`Refresh Persistence Status: ${report.refreshPersistence}\n`);

    // =============================================================
    // 4. EDIT AUTOMATION
    // =============================================================
    console.log('--- 4. Editing Workflow (Name, Description) ---');
    const updatedName = 'QA TEST AUTOMATION — UPDATED NAME';
    const updatedDesc = 'Updated description for QA verification';

    const updateResult = await page.evaluate(async (tok, id, name, desc) => {
      const res = await fetch(`/api/automation/workflows/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tok}`,
        },
        body: JSON.stringify({ name, description: desc }),
      });
      const data = await res.json();
      return { success: res.ok && data.success, data: data.data };
    }, token, createdWfId, updatedName, updatedDesc);

    const pgWfAfterEdit = await db.findOne('workflows', 'id = $1', [createdWfId]);
    const isPgEdited = pgWfAfterEdit?.name === updatedName;

    report.edit.pgVerification = isPgEdited ? 'PASS' : 'FAIL';

    await page.reload({ waitUntil: 'networkidle0' });
    await delay(400);
    const pgWfAfterEditRefresh = await db.findOne('workflows', 'id = $1', [createdWfId]);
    report.edit.refreshPersistence = pgWfAfterEditRefresh?.name === updatedName ? 'PASS' : 'FAIL';
    report.edit.status = updateResult.success && isPgEdited && report.edit.refreshPersistence === 'PASS' ? 'PASS' : 'FAIL';

    console.log(`Workflow Edit Status: ${report.edit.status}\n`);

    // =============================================================
    // 5. ENABLE / DISABLE TEST
    // =============================================================
    console.log('--- 5. Testing Enable / Disable Status Toggling ---');
    const toggleResult = await page.evaluate(async (tok, id) => {
      const res = await fetch(`/api/automation/workflows/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tok}`,
        },
      });
      const data = await res.json();
      return { success: res.ok && data.success, data: data.data };
    }, token, createdWfId);

    const pgWfToggled = await db.findOne('workflows', 'id = $1', [createdWfId]);
    report.enableDisable.pgStatus = pgWfToggled?.status || 'Unknown';

    await page.reload({ waitUntil: 'networkidle0' });
    await delay(400);
    const pgWfToggledRefresh = await db.findOne('workflows', 'id = $1', [createdWfId]);
    report.enableDisable.refreshPersistence = pgWfToggledRefresh?.status === pgWfToggled?.status ? 'PASS' : 'FAIL';
    report.enableDisable.status = toggleResult.success && !!pgWfToggled ? 'PASS' : 'FAIL';

    console.log(`Toggle Status: ${report.enableDisable.status} (DB Status: "${report.enableDisable.pgStatus}")\n`);

    // =============================================================
    // 6. WORKFLOW DETAILS / BUILDER
    // =============================================================
    console.log('--- 6. Verifying Workflow Details & Nodes/Edges ---');
    const singleWfResult = await page.evaluate(async (tok, id) => {
      const res = await fetch(`/api/automation/workflows/${id}`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      const data = await res.json();
      return { success: res.ok && data.success, data: data.data };
    }, token, createdWfId);

    const hasNodesAndEdges = Array.isArray(singleWfResult.data?.nodes) && singleWfResult.data?.nodes.length > 0;
    report.workflowBuilder.nodesAndEdgesLoaded = hasNodesAndEdges;
    report.workflowBuilder.status = singleWfResult.success && hasNodesAndEdges ? 'PASS' : 'FAIL';
    console.log(`Workflow Builder / Details Status: ${report.workflowBuilder.status}\n`);

    // =============================================================
    // 7. DELETE AUTOMATION
    // =============================================================
    console.log('--- 7. Deleting Temporary QA Workflow & Sanitizing Database ---');
    const deleteResult = await page.evaluate(async (tok, id) => {
      const res = await fetch(`/api/automation/workflows/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tok}` },
      });
      const data = await res.json();
      return { success: res.ok && data.success };
    }, token, createdWfId);

    const pgWfAfterDelete = await db.findOne('workflows', 'id = $1', [createdWfId]);
    const isDeletedFromPg = !pgWfAfterDelete;

    await page.reload({ waitUntil: 'networkidle0' });
    await delay(400);

    const wfInUiAfterDelete = await page.evaluate((wfId) => {
      return document.body ? document.body.innerText.includes('QA TEST AUTOMATION') : false;
    }, createdWfId);

    report.delete.uiRemoval = !wfInUiAfterDelete ? 'PASS' : 'FAIL';
    report.delete.pgRemoval = isDeletedFromPg ? 'PASS' : 'FAIL';
    report.delete.refreshVerification = !wfInUiAfterDelete && isDeletedFromPg ? 'PASS' : 'FAIL';
    report.delete.status = deleteResult.success && isDeletedFromPg ? 'PASS' : 'FAIL';

    // Direct check for any leftover QA workflows in PostgreSQL
    const leftoverCheck = await query("SELECT count(*) FROM workflows WHERE name LIKE 'QA TEST%'");
    const leftoverCount = parseInt(leftoverCheck.rows[0].count, 10);
    report.cleanup.qaRecordsRemaining = leftoverCount;
    report.cleanup.status = leftoverCount === 0 ? 'PASS' : 'FAIL';

    console.log(`Workflow Delete Status: ${report.delete.status}, QA Leftovers: ${leftoverCount}\n`);

    // =============================================================
    // PRINT DETAILED SUMMARY
    // =============================================================
    console.log('================================================================');
    console.log('📊 FINAL AUTOMATION & WORKFLOWS QA SUMMARY');
    console.log('================================================================');
    console.log('Automation Page:', report.page.status);
    console.log('Create Automation:', report.create.status);
    console.log('API Persistence:', report.create.status);
    console.log('PostgreSQL Persistence:', report.create.pgVerification);
    console.log('Refresh Persistence:', report.refreshPersistence);
    console.log('Edit Automation:', report.edit.status);
    console.log('Enable/Disable:', report.enableDisable.status);
    console.log('Workflow Builder:', report.workflowBuilder.status);
    console.log('Delete Automation:', report.delete.status);
    console.log('Database Cleanup:', report.cleanup.status);
    console.log(`Diagnostics: Console Errors = ${diagnostics.consoleErrors.length}, Failed Requests = ${diagnostics.failedRequests.length}`);
    console.log('================================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[Workflows QA Error]:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

runWorkflowsRegressionQA();
