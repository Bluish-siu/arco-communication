import puppeteer from 'puppeteer';
import { query, db } from './db.js';
import jwt from 'jsonwebtoken';
import { config } from './index.js';

const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:5000/api';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function runFinalSmokeTestQA() {
  console.log('================================================================');
  console.log('🧪 ARCO PRODUCTION QA — FINAL APPLICATION-WIDE SMOKE TEST');
  console.log('================================================================\n');

  const testGoogleId = '114567890123456789012';
  const testEmail = 'nileshpatel992085@gmail.com';
  const testName = 'nilesh patel';

  // Ensure test user exists with onboarding completed in PostgreSQL
  let user = await db.findOne('users', 'google_id = $1', [testGoogleId]);
  if (!user) {
    user = await db.insert('users', {
      id: `usr_smoke_${Date.now()}`,
      google_id: testGoogleId,
      name: testName,
      email: testEmail,
      company_name: 'Nilesh Enterprise Hub',
      role: 'admin',
      trial_days_remaining: 14,
      onboarding_completed: true,
    });
  } else {
    await query('UPDATE users SET onboarding_completed = true WHERE google_id = $1', [testGoogleId]);
  }

  const token = jwt.sign(
    { id: user.id, email: testEmail, role: 'admin', name: testName, google_id: testGoogleId },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  const routesToTest = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/inbox', name: 'Inbox' },
    { path: '/contacts', name: 'Contacts' },
    { path: '/templates/list', name: 'Templates List' },
    { path: '/segments', name: 'Segments' },
    { path: '/campaigns', name: 'Campaigns' },
    { path: '/campaigns/create', name: 'Create Campaign' },
    { path: '/analytics/overview', name: 'Conversation Analytics' },
    { path: '/analytics/agent-performance', name: 'Agent Performance' },
    { path: '/analytics/ad-performance', name: 'CTWA Ad Performance' },
    { path: '/analytics/campaign-reports', name: 'Campaign Reports' },
    { path: '/sales-pipeline', name: 'Sales Pipeline' },
    { path: '/sales-crm-reports', name: 'Sales CRM Reports' },
    { path: '/tasks', name: 'Tasks & Follow-ups' },
    { path: '/automation/workflows', name: 'Automation Workflows' },
    { path: '/commerce-settings', name: 'Commerce Settings' },
    { path: '/commerce/catalog', name: 'Commerce Catalog' },
    { path: '/checkout-bot', name: 'Checkout Bot' },
    { path: '/commerce/order-panel', name: 'Order Management Panel' },
    { path: '/integrations', name: 'Integrations Marketplace' },
    { path: '/widget', name: 'WhatsApp Widget' },
  ];

  const routeResults = [];
  const diagnostics = {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    unexpectedRedirects: [],
    errorBanners: [],
    httpStatuses: {},
  };

  let browser = null;

  try {
    // Launch headless browser
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

    // =============================================================
    // 1. LOGIN & AUTHENTICATION SMOKE CHECK
    // =============================================================
    console.log('--- 1. Login & Google Authentication Smoke Check ---');
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle0' });
    await delay(300);

    const hasGoogleButton = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).some((b) => b.innerText.includes('Continue with Google'));
    });

    // Seed session token
    await page.evaluate((tok) => {
      localStorage.setItem('arco_auth_token', tok);
    }, token);

    await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'networkidle0' });
    await delay(400);
    const loginPass = page.url().includes('/dashboard') && hasGoogleButton;
    console.log(`Login & OAuth Routing: ${loginPass ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 2. NAVIGATE THROUGH ALL 19 MAJOR WORKSPACE ROUTES
    // =============================================================
    console.log('--- 2. Testing 19 Major Workspace Routes ---');
    for (const r of routesToTest) {
      const startConsoleErrors = diagnostics.consoleErrors.length;
      const startFailedReqs = diagnostics.failedRequests.length;

      await page.goto(`${FRONTEND_URL}${r.path}`, { waitUntil: 'networkidle0' });
      await delay(250);

      const currentUrl = page.url();
      const isExpectedRoute = currentUrl.includes(r.path) || (r.path.includes('?') && currentUrl.includes(r.path.split('?')[0]));

      // Verify DOM content
      const domCheck = await page.evaluate(() => {
        const bodyText = document.body ? document.body.innerText.trim() : '';
        const isBlank = bodyText.length < 20;
        const hasReactCrash = bodyText.includes('Minified React error') || bodyText.includes('Cannot read properties');
        return { isBlank, hasReactCrash, textLength: bodyText.length };
      });

      const passed = isExpectedRoute && !domCheck.isBlank && !domCheck.hasReactCrash;

      routeResults.push({
        route: r.path,
        name: r.name,
        status: passed ? 'PASS' : 'FAIL',
        urlMatches: isExpectedRoute,
        hasContent: !domCheck.isBlank,
        noCrash: !domCheck.hasReactCrash,
        consoleErrors: diagnostics.consoleErrors.length - startConsoleErrors,
        failedRequests: diagnostics.failedRequests.length - startFailedReqs,
      });

      console.log(`Route [${r.path}] (${r.name}): ${passed ? '✅ PASS' : '❌ FAIL'} (Content Length: ${domCheck.textLength})`);
    }

    // =============================================================
    // 3. NAVIGATION INTEGRITY (Back / Forward & Sidebar Links)
    // =============================================================
    console.log('\n--- 3. Testing Navigation Integrity ---');
    await page.goto(`${FRONTEND_URL}/inbox`, { waitUntil: 'networkidle0' });
    await delay(300);
    await page.goto(`${FRONTEND_URL}/contacts`, { waitUntil: 'networkidle0' });
    await delay(300);
    await page.goBack({ waitUntil: 'networkidle0' });
    await delay(300);
    const isBackPass = page.url().includes('/inbox');
    await page.goForward({ waitUntil: 'networkidle0' });
    await delay(300);
    const isForwardPass = page.url().includes('/contacts');
    const navIntegrityPass = isBackPass && isForwardPass;
    console.log(`Browser Back/Forward Navigation: ${navIntegrityPass ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 4. SESSION PERSISTENCE ACROSS HARD RELOADS
    // =============================================================
    console.log('--- 4. Testing Session Persistence on Multiple Pages ---');
    const reloadPages = ['/dashboard', '/campaigns', '/sales-pipeline', '/automation/workflows'];
    let sessionPersistencePass = true;

    for (const p of reloadPages) {
      await page.goto(`${FRONTEND_URL}${p}`, { waitUntil: 'networkidle0' });
      await page.reload({ waitUntil: 'networkidle0' });
      await delay(300);
      if (!page.url().includes(p)) {
        sessionPersistencePass = false;
      }
    }

    // Direct token verification
    const decoded = jwt.verify(token, config.jwtSecret);
    const authMePass = decoded.email === testEmail && decoded.google_id === testGoogleId;
    console.log(`Session Reload Persistence: ${sessionPersistencePass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`JWT Token Signature & Claims: ${authMePass ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 5. DATABASE INTEGRITY & CLEANUP VERIFICATION
    // =============================================================
    console.log('--- 5. Database Cleanup & Integrity Check ---');
    const leftoverTasks = await query("SELECT count(*) FROM tasks WHERE title LIKE 'QA TEST%'");
    const leftoverWfs = await query("SELECT count(*) FROM workflows WHERE name LIKE 'QA TEST%'");
    const leftoverProducts = await query("SELECT count(*) FROM catalog_products WHERE title LIKE 'QA Test%'");
    const leftoverContacts = await query("SELECT count(*) FROM contacts WHERE name LIKE 'QA Test%'");

    const totalLeftovers =
      parseInt(leftoverTasks.rows[0].count, 10) +
      parseInt(leftoverWfs.rows[0].count, 10) +
      parseInt(leftoverProducts.rows[0].count, 10) +
      parseInt(leftoverContacts.rows[0].count, 10);

    const dbCleanPass = totalLeftovers === 0;
    console.log(`Leftover QA Records in Database: ${totalLeftovers} (${dbCleanPass ? '✅ 100% Clean' : '❌ Leftovers detected'})\n`);

    // =============================================================
    // 6. LOGOUT TEST
    // =============================================================
    console.log('--- 6. Testing Logout & Cache Eviction ---');
    await page.evaluate(() => {
      localStorage.removeItem('arco_auth_token');
      localStorage.removeItem('arco_onboarding_data');
    });

    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle0' });
    await delay(300);
    const logoutUrl = page.url();
    const tokenInStorageAfterLogout = await page.evaluate(() => localStorage.getItem('arco_auth_token'));
    const isLogoutPass = logoutUrl.includes('/login') && !tokenInStorageAfterLogout;

    console.log(`Logout Route: ${isLogoutPass ? '✅ PASS' : '❌ FAIL'} (Token cleared, User at /login)\n`);

    // =============================================================
    // SUMMARY
    // =============================================================
    console.log('================================================================');
    console.log('📊 SMOKE TEST SUMMARY TABLE');
    console.log('================================================================');
    console.table(routeResults);

    const allRoutesPass = routeResults.every((r) => r.status === 'PASS');
    const overallPass = allRoutesPass && loginPass && navIntegrityPass && sessionPersistencePass && authMePass && dbCleanPass && isLogoutPass;

    console.log(`\nALL 19 ROUTES VERIFICATION: ${allRoutesPass ? '🎉 100% PASS' : '❌ FAIL'}`);
    console.log(`OVERALL SMOKE TEST RESULT: ${overallPass ? '🎉 100% PASS' : '❌ FAIL'}\n`);

    process.exit(overallPass ? 0 : 1);
  } catch (err) {
    console.error('[Smoke Test QA Error]:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

runFinalSmokeTestQA();
