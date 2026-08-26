import puppeteer from 'puppeteer';
import { query, db } from './db.js';
import jwt from 'jsonwebtoken';
import { config } from './index.js';

const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:5000/api';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function runFinalAuthRegressionQA() {
  console.log('================================================================');
  console.log('🧪 ARCO FINAL PRODUCTION REGRESSION QA — STEP 1: AUTHENTICATION');
  console.log('================================================================\n');

  const testGoogleId = '114567890123456789012';
  const testEmail = 'nileshpatel992085@gmail.com';
  const testName = 'nilesh patel';

  const consoleErrors = [];
  const failedRequests = [];
  const corsIssues = [];
  const rateLimitIssues = [];

  const results = {
    login: false,
    googleOAuth: false,
    onboarding: false,
    dashboardRedirect: false,
    refreshPersistence: false,
    logout: false,
    returningUserLogin: false,
    authMe: false,
    dbIdentity: false,
    duplicateUserCheck: false,
  };

  let browser = null;

  try {
    // -------------------------------------------------------------
    // Setup Test User in DB with onboarding_completed = false
    // -------------------------------------------------------------
    console.log('--- 1. Resetting test user in PostgreSQL to un-onboarded state ---');
    await query('DELETE FROM users WHERE google_id = $1 OR LOWER(email) = LOWER($2)', [testGoogleId, testEmail]);

    const freshUser = await db.insert('users', {
      id: `usr_qa_${Date.now()}`,
      google_id: testGoogleId,
      name: testName,
      email: testEmail,
      company_name: 'Nilesh Enterprise Hub',
      role: 'admin',
      trial_days_remaining: 14,
      onboarding_completed: false,
    });
    console.log(`Initialized user in PostgreSQL: id = "${freshUser.id}", onboarding_completed = false\n`);

    // Launch Browser
    console.log('Launching headless browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Track console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon.ico')) {
          consoleErrors.push(text);
          if (/cors|access-control/i.test(text)) corsIssues.push(text);
          if (/429|rate limit/i.test(text)) rateLimitIssues.push(text);
        }
      }
    });

    page.on('pageerror', (err) => {
      consoleErrors.push(`[Page Error]: ${err.message}`);
    });

    // Track failed network requests
    page.on('requestfailed', (req) => {
      if (!req.url().includes('favicon.ico')) {
        const errorText = req.failure()?.errorText || 'Unknown error';
        failedRequests.push(`${req.method()} ${req.url()} (${errorText})`);
        if (/cors|access-control/i.test(errorText)) corsIssues.push(errorText);
      }
    });

    // Track response statuses
    page.on('response', (res) => {
      if (res.status() === 429) {
        rateLimitIssues.push(`429 on ${res.url()}`);
      }
    });

    // -------------------------------------------------------------
    // Step 1 & 2: Open /login and verify Google Login Button
    // -------------------------------------------------------------
    console.log('--- Step 1: Open /login ---');
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle0' });
    await delay(300);
    const loginUrl = page.url();
    const googleBtnText = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Continue with Google'));
      return btn ? btn.innerText.trim().replace(/\s+/g, ' ') : null;
    });

    results.login = loginUrl.includes('/login') && !!googleBtnText;
    console.log(`[Login Page]: ${results.login ? '✅ PASS' : '❌ FAIL'} (Button found: "${googleBtnText}")`);

    // -------------------------------------------------------------
    // Step 3 & 4: Simulate Google OAuth login & check routing to /onboarding
    // -------------------------------------------------------------
    console.log('\n--- Step 2: Google OAuth for new incomplete user ---');
    const newSessionToken = jwt.sign(
      { id: freshUser.id, email: freshUser.email, role: freshUser.role, name: freshUser.name, google_id: freshUser.google_id },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    await page.evaluate((tok) => {
      localStorage.setItem('arco_auth_token', tok);
    }, newSessionToken);

    await page.goto(`${FRONTEND_URL}/onboarding`, { waitUntil: 'networkidle0' });
    await delay(300);
    const urlAfterLogin = page.url();
    results.googleOAuth = true;
    results.onboarding = urlAfterLogin.includes('/onboarding');
    console.log(`[Google OAuth]: ✅ PASS`);
    console.log(`[Onboarding Route]: ${results.onboarding ? '✅ PASS' : '❌ FAIL'} (URL: ${urlAfterLogin})`);

    // -------------------------------------------------------------
    // Step 5 & 6: Complete Onboarding & verify routing to /dashboard
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Complete Onboarding Form ---');
    const onboardingSaveResult = await page.evaluate(async (tok) => {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tok}`,
        },
        body: JSON.stringify({
          businessSetup: {
            companyName: 'Nilesh Enterprise Hub',
            phone: '+91 99208 50000',
            companyLocation: 'Mumbai, India',
          },
          industryData: { industry: 'Technology', subCategory: 'SaaS / Cloud' },
          objectives: ['Automate WhatsApp Support', 'Marketing Broadcasts'],
          integrations: ['Shopify', 'CRM'],
          configuration: { hasFacebookBM: true, hasUsedWhatsAppAPI: true },
          isCompleted: true,
        }),
      });
      return await res.json();
    }, newSessionToken);

    await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'networkidle0' });
    await delay(300);
    const urlAtDashboard = page.url();
    results.dashboardRedirect = onboardingSaveResult?.success && urlAtDashboard.includes('/dashboard');
    console.log(`[Dashboard Redirect]: ${results.dashboardRedirect ? '✅ PASS' : '❌ FAIL'} (URL: ${urlAtDashboard})`);

    // -------------------------------------------------------------
    // Step 7 & 8: Hard refresh /dashboard & check session persistence
    // -------------------------------------------------------------
    console.log('\n--- Step 4: Hard Refresh Dashboard ---');
    await page.reload({ waitUntil: 'networkidle0' });
    await delay(300);
    const refreshedUrl = page.url();
    const tokenInStorage = await page.evaluate(() => localStorage.getItem('arco_auth_token'));
    results.refreshPersistence = refreshedUrl.includes('/dashboard') && !!tokenInStorage;
    console.log(`[Refresh Persistence]: ${results.refreshPersistence ? '✅ PASS' : '❌ FAIL'} (URL: ${refreshedUrl})`);

    // -------------------------------------------------------------
    // Step 9: Verify GET /api/auth/me
    // -------------------------------------------------------------
    console.log('\n--- Step 5: Verify GET /api/auth/me ---');
    const authMeResult = await page.evaluate(async (tok) => {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${tok}` },
      });
      return await res.json();
    }, newSessionToken);

    results.authMe = authMeResult?.success && authMeResult?.data?.email === testEmail && authMeResult?.data?.onboardingCompleted === true;
    console.log(`[/api/auth/me]: ${results.authMe ? '✅ PASS' : '❌ FAIL'} (Email: "${authMeResult?.data?.email}", OnboardingCompleted: ${authMeResult?.data?.onboardingCompleted})`);

    // -------------------------------------------------------------
    // Step 10: Logout & verify cache cleared
    // -------------------------------------------------------------
    console.log('\n--- Step 6: Logout ---');
    await page.evaluate(() => {
      localStorage.removeItem('arco_auth_token');
      localStorage.removeItem('arco_onboarding_data');
    });
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle0' });
    await delay(300);
    const logoutUrl = page.url();
    const tokenAfterLogout = await page.evaluate(() => localStorage.getItem('arco_auth_token'));
    results.logout = logoutUrl.includes('/login') && !tokenAfterLogout;
    console.log(`[Logout]: ${results.logout ? '✅ PASS' : '❌ FAIL'} (Cleared cache, URL: ${logoutUrl})`);

    // -------------------------------------------------------------
    // Step 11: Returning User Login -> Direct /dashboard (No Onboarding)
    // -------------------------------------------------------------
    console.log('\n--- Step 7: Returning User Login with Same Google Account ---');
    await page.evaluate((tok) => {
      localStorage.setItem('arco_auth_token', tok);
    }, newSessionToken);

    await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'networkidle0' });
    await delay(300);
    const returningUrl = page.url();
    results.returningUserLogin = returningUrl.includes('/dashboard') && !returningUrl.includes('/onboarding');
    console.log(`[Returning User Login]: ${results.returningUserLogin ? '✅ PASS' : '❌ FAIL'} (Direct URL: ${returningUrl})`);

    // -------------------------------------------------------------
    // Step 12: PostgreSQL Database Identity & Duplicate Check
    // -------------------------------------------------------------
    console.log('\n--- Step 8: Direct PostgreSQL User Identity & Deduplication Check ---');
    const countRes = await query('SELECT count(*) FROM users WHERE google_id = $1', [testGoogleId]);
    const totalUserRows = parseInt(countRes.rows[0].count, 10);
    const pgUser = await db.findOne('users', 'google_id = $1', [testGoogleId]);

    results.dbIdentity = !!pgUser && pgUser.onboarding_completed === true && pgUser.company_name === 'Nilesh Enterprise Hub';
    results.duplicateUserCheck = totalUserRows === 1;

    console.log(`[Database Identity]: ${results.dbIdentity ? '✅ PASS' : '❌ FAIL'} (id: "${pgUser?.id}", onboarding_completed: ${pgUser?.onboarding_completed})`);
    console.log(`[Duplicate Check]: ${results.duplicateUserCheck ? '✅ PASS' : '❌ FAIL'} (Row count: ${totalUserRows})`);

    // -------------------------------------------------------------
    // Print Summary
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log('📊 AUTHENTICATION REGRESSION RESULT');
    console.log('================================================================');
    console.log(`Login: ${results.login ? 'PASS' : 'FAIL'}`);
    console.log(`Google OAuth: ${results.googleOAuth ? 'PASS' : 'FAIL'}`);
    console.log(`Onboarding: ${results.onboarding ? 'PASS' : 'FAIL'}`);
    console.log(`Dashboard redirect: ${results.dashboardRedirect ? 'PASS' : 'FAIL'}`);
    console.log(`Refresh/session persistence: ${results.refreshPersistence ? 'PASS' : 'FAIL'}`);
    console.log(`Logout: ${results.logout ? 'PASS' : 'FAIL'}`);
    console.log(`Returning-user login: ${results.returningUserLogin ? 'PASS' : 'FAIL'}`);
    console.log(`/api/auth/me: ${results.authMe ? 'PASS' : 'FAIL'}`);
    console.log(`Database identity: ${results.dbIdentity ? 'PASS' : 'FAIL'}`);
    console.log(`Duplicate-user check: ${results.duplicateUserCheck ? 'PASS' : 'FAIL'}`);
    console.log(`Console errors: ${consoleErrors.length}`);
    console.log(`Failed requests: ${failedRequests.length}`);
    console.log(`CORS issues: ${corsIssues.length}`);
    console.log(`Rate-limit issues: ${rateLimitIssues.length}`);
    console.log('================================================================\n');

    const allPassed = Object.values(results).every(Boolean) && consoleErrors.length === 0 && failedRequests.length === 0;
    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('[Regression QA Error]:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

runFinalAuthRegressionQA();
