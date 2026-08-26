import puppeteer from 'puppeteer';
import { query, db } from './db.js';
import jwt from 'jsonwebtoken';
import { config } from './index.js';

const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:5000/api';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function runShopifyIntegrationQA() {
  console.log('================================================================');
  console.log('🧪 ARCO PRODUCTION QA — SHOPIFY INTEGRATIONS REGRESSION TEST');
  console.log('================================================================\n');

  const testUserA = { id: 'usr_test_a', email: 'owner_a@arco.com', role: 'admin', name: 'User A' };
  const testUserB = { id: 'usr_test_b', email: 'owner_b@arco.com', role: 'admin', name: 'User B' };

  const tokenA = jwt.sign(testUserA, config.jwtSecret, { expiresIn: '7d' });
  const tokenB = jwt.sign(testUserB, config.jwtSecret, { expiresIn: '7d' });

  const testShopDomain = 'nilesh-fashion-hub.myshopify.com';

  const diagnostics = {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
  };

  const results = {
    pageLoad: false,
    headerAndTabs: false,
    singleShopifyCard: false,
    categoryFilterEmptyState: false,
    categoryFilterShopify: false,
    searchFilter: false,
    invalidDomainValidation: false,
    oauthUrlGeneration: false,
    connectAndPgPersistence: false,
    refreshPersistence: false,
    tenantIsolation: false,
    disconnectAndCleanup: false,
  };

  let browser = null;

  try {
    // Clean up any test records before start
    await query('DELETE FROM shopify_integrations WHERE user_id IN ($1, $2)', [testUserA.id, testUserB.id]);

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

    // Seed session token for User A
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle0' });
    await page.evaluate((tok) => {
      localStorage.setItem('arco_auth_token', tok);
    }, tokenA);

    // =============================================================
    // 1. OPEN /integrations PAGE & VERIFY UI
    // =============================================================
    console.log('--- 1. Testing /integrations Page Loading & Layout ---');
    await page.goto(`${FRONTEND_URL}/integrations`, { waitUntil: 'networkidle0' });
    await delay(500);

    const pageUrl = page.url();
    results.pageLoad = pageUrl.includes('/integrations');

    const domHeaderData = await page.evaluate(() => {
      const text = document.body ? document.body.innerText : '';
      const hasHeading = text.includes('Integrations');
      const hasSubtitle = text.includes('Connect ARCO with various applications');
      const hasAllApps = text.includes('All Apps');
      const hasFreeApps = text.includes('Free Apps');
      const hasPaidApps = text.includes('Paid Apps');
      const hasShopifyTitle = text.includes('Shopify Sales Channel');
      const hasCategory = /e-commerce platform/i.test(text);
      const hasDesc = text.includes('Auto-sync Shopify products & collections to WhatsApp');
      return {
        hasHeading,
        hasSubtitle,
        hasAllApps,
        hasFreeApps,
        hasPaidApps,
        hasShopifyTitle,
        hasCategory,
        hasDesc,
      };
    });

    results.headerAndTabs = domHeaderData.hasHeading && domHeaderData.hasSubtitle && domHeaderData.hasAllApps;
    results.singleShopifyCard = domHeaderData.hasShopifyTitle && domHeaderData.hasCategory && domHeaderData.hasDesc;

    console.log(`[Page Load]: ${results.pageLoad ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`[Header & Tabs]: ${results.headerAndTabs ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`[Shopify Card]: ${results.singleShopifyCard ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 2. FILTER & SEARCH BEHAVIOR
    // =============================================================
    console.log('--- 2. Testing Filters, Dropdowns & Empty State ---');

    // Click Category dropdown button
    await page.click('button[data-testid="category-dropdown-btn"]');
    await delay(300);

    // Click "CRM Platform" in the open menu
    const clickedCrm = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const crmBtn = buttons.find((b) => b.innerText.trim().startsWith('CRM Platform'));
      if (crmBtn) {
        crmBtn.click();
        return true;
      }
      return false;
    });
    await delay(300);

    const emptyStateResult = await page.evaluate(() => {
      return document.body ? document.body.innerText.includes('No integrations found in this category') : false;
    });
    results.categoryFilterEmptyState = clickedCrm && emptyStateResult;

    // Reset to All Apps
    const resetResult = await page.evaluate(() => {
      const resetBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('View All Apps'));
      if (resetBtn) {
        resetBtn.click();
        return true;
      }
      return false;
    });
    await delay(300);

    const hasCardAgain = await page.evaluate(() => document.body.innerText.includes('Shopify Sales Channel'));
    results.categoryFilterShopify = resetResult && hasCardAgain;

    // Search Test
    await page.type('input[placeholder*="Search integration apps"]', 'Shopify');
    await delay(300);
    const searchFound = await page.evaluate(() => document.body.innerText.includes('Shopify Sales Channel'));
    results.searchFilter = searchFound;

    // Clear search
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Search integration apps"]');
      if (input) input.value = '';
    });

    console.log(`[Category Empty State]: ${results.categoryFilterEmptyState ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`[e-Commerce Filter]: ${results.categoryFilterShopify ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`[Search Filter]: ${results.searchFilter ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 3. SHOPIFY CONNECTION MODAL & VALIDATION
    // =============================================================
    console.log('--- 3. Testing Shopify Connection Modal & OAuth Flow ---');

    // Open Connect Modal
    await page.evaluate(() => {
      const connectBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.trim().includes('Connect'));
      if (connectBtn) connectBtn.click();
    });
    await delay(400);

    // Test Invalid Domain Validation
    const invalidValidation = await page.evaluate(async (tok) => {
      const res = await fetch('/api/integrations/shopify/oauth-url?shop=invalid_domain_!@#$', {
        headers: { Authorization: `Bearer ${tok}` },
      });
      const data = await res.json();
      return res.status === 400 && data.success === false;
    }, tokenA);
    results.invalidDomainValidation = invalidValidation;

    // Test Valid OAuth URL generation
    const oauthUrlGen = await page.evaluate(async (tok, shop) => {
      const res = await fetch(`/api/integrations/shopify/oauth-url?shop=${shop}`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      const data = await res.json();
      return res.status === 200 && data.success === true && !!data.data?.authUrl;
    }, tokenA, testShopDomain);
    results.oauthUrlGeneration = oauthUrlGen;

    console.log(`[Invalid Domain Validation]: ${results.invalidDomainValidation ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`[OAuth URL Generation]: ${results.oauthUrlGeneration ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 4. CONNECT SHOPIFY & POSTGRESQL PERSISTENCE
    // =============================================================
    console.log('--- 4. Connecting Shopify & Verifying PostgreSQL Persistence ---');

    const connectResult = await page.evaluate(async (tok, shop) => {
      const res = await fetch('/api/integrations/shopify/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tok}`,
        },
        body: JSON.stringify({
          shop,
          shopName: 'Nilesh Fashion Hub',
        }),
      });
      const data = await res.json();
      return { success: res.ok && data.success, data: data.data };
    }, tokenA, testShopDomain);

    // Verify in PostgreSQL
    const pgRecord = await db.findOne('shopify_integrations', 'user_id = $1', [testUserA.id]);
    const isPgStored = !!pgRecord && pgRecord.shop_domain === testShopDomain && pgRecord.status === 'connected';

    results.connectAndPgPersistence = connectResult.success && isPgStored;
    console.log(`[Shopify Connected]: ${connectResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`[PostgreSQL Row Verified]: ${isPgStored ? '✅ PASS' : '❌ FAIL'} (shop_domain = "${pgRecord?.shop_domain}")\n`);

    // =============================================================
    // 5. HARD REFRESH & PERSISTENCE
    // =============================================================
    console.log('--- 5. Testing Refresh Persistence ---');
    await page.reload({ waitUntil: 'networkidle0' });
    await delay(400);

    const domAfterRefresh = await page.evaluate(() => {
      const text = document.body ? document.body.innerText : '';
      const hasConnectedBadge = text.includes('Connected');
      const hasShopDomain = text.includes('nilesh-fashion-hub.myshopify.com');
      const hasDisconnectBtn = text.includes('Disconnect');
      return { hasConnectedBadge, hasShopDomain, hasDisconnectBtn };
    });

    results.refreshPersistence = domAfterRefresh.hasConnectedBadge && domAfterRefresh.hasShopDomain && domAfterRefresh.hasDisconnectBtn;
    console.log(`[Refresh Persistence]: ${results.refreshPersistence ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 6. MULTI-TENANT ISOLATION (User B check)
    // =============================================================
    console.log('--- 6. Testing Tenant Isolation (User B Access) ---');
    const userBStatus = await page.evaluate(async (tokB) => {
      const res = await fetch('/api/integrations/shopify/status', {
        headers: { Authorization: `Bearer ${tokB}` },
      });
      const data = await res.json();
      return data.data;
    }, tokenB);

    results.tenantIsolation = userBStatus?.connected === false && userBStatus?.shopDomain === null;
    console.log(`[Tenant Isolation]: ${results.tenantIsolation ? '✅ PASS' : '❌ FAIL'} (User B sees: connected = ${userBStatus?.connected})\n`);

    // =============================================================
    // 7. DISCONNECT SHOPIFY & CLEANUP
    // =============================================================
    console.log('--- 7. Testing Disconnect & Deactivation ---');
    const disconnectResult = await page.evaluate(async (tokA) => {
      const res = await fetch('/api/integrations/shopify/disconnect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokA}` },
      });
      const data = await res.json();
      return { success: res.ok && data.success };
    }, tokenA);

    const pgAfterDisconnect = await db.findOne('shopify_integrations', 'user_id = $1', [testUserA.id]);
    const isPgClean = !pgAfterDisconnect;

    await page.reload({ waitUntil: 'networkidle0' });
    await delay(400);

    const domAfterDisconnect = await page.evaluate(() => {
      const text = document.body ? document.body.innerText : '';
      return text.includes('Connect') && !text.includes('nilesh-fashion-hub.myshopify.com');
    });

    results.disconnectAndCleanup = disconnectResult.success && isPgClean && domAfterDisconnect;
    console.log(`[Disconnect & Cleanup]: ${results.disconnectAndCleanup ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // SUMMARY
    // =============================================================
    console.log('================================================================');
    console.log('📊 FINAL SHOPIFY INTEGRATIONS QA SUMMARY');
    console.log('================================================================');
    console.log('Console Errors Caught:', diagnostics.consoleErrors);
    const allPassed = Object.values(results).every(Boolean);
    console.log(`\nSHOPIFY INTEGRATIONS QA RESULT: ${allPassed ? '🎉 100% PASS' : '❌ FAIL'}\n`);

    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('[Integrations QA Error]:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

runShopifyIntegrationQA();
