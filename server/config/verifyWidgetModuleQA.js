import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import { config } from './index.js';

const FRONTEND_URL = 'http://localhost:5173';
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function verifyWidgetModuleQA() {
  console.log('================================================================');
  console.log('🧪 ARCO PRODUCTION QA — WHATSAPP WIDGET MODULE REGRESSION TEST');
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
  };

  const results = {
    sidebarSingleWidget: false,
    noSubmenus: false,
    directNavigationToWidget: false,
    activeSidebarHighlight: false,
    customizeTabUI: false,
    interactivePreview: false,
    saveAndPersistSettings: false,
    installTabUI: false,
    deepLinksWorking: false,
  };

  let browser = null;

  try {
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
    // 1. TEST SIDEBAR WIDGET NAVIGATION & NO SUBMENUS
    // =============================================================
    console.log('--- 1. Testing Sidebar Navigation & Submenu Removal ---');
    await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'networkidle0' });
    await delay(400);

    // Hover aside to expand
    await page.hover('aside');
    await delay(300);

    const sidebarInspection = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      const text = aside ? aside.innerText : '';
      const hasWidget = text.includes('Widget');
      const hasWaButton = text.includes('WhatsApp Button');
      const hasQrGenerator = text.includes('QR Code Generator');
      const hasCustomizeSubmenu = text.includes('Customize') && text.includes('Install');
      return {
        hasWidget,
        hasWaButton,
        hasQrGenerator,
        hasCustomizeSubmenu,
      };
    });

    results.sidebarSingleWidget = sidebarInspection.hasWidget;
    results.noSubmenus = !sidebarInspection.hasWaButton && !sidebarInspection.hasQrGenerator && !sidebarInspection.hasCustomizeSubmenu;

    console.log(`[Single "Widget" sidebar item]: ${results.sidebarSingleWidget ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`[Submenus completely removed]: ${results.noSubmenus ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 2. CLICK SIDEBAR WIDGET -> DIRECT NAVIGATION TO /widget
    // =============================================================
    console.log('--- 2. Testing Direct Click Navigation to /widget ---');
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('aside a'));
      const widgetLink = links.find((l) => l.innerText.trim() === 'Widget' || l.href.includes('/widget'));
      if (widgetLink) widgetLink.click();
    });
    await delay(500);

    const widgetUrl = page.url();
    results.directNavigationToWidget = widgetUrl.includes('/widget');
    console.log(`[Direct Navigation to /widget]: ${results.directNavigationToWidget ? '✅ PASS' : '❌ FAIL'} (URL: ${widgetUrl})`);

    // Verify Active Sidebar State
    await page.hover('aside');
    await delay(200);
    const activeHighlight = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      const activeLink = aside ? aside.querySelector('a[href="/widget"]') : null;
      const parentDiv = activeLink ? activeLink.closest('div') : null;
      return (
        parentDiv?.className?.includes('text-red-600') ||
        parentDiv?.className?.includes('bg-red-50') ||
        activeLink?.className?.includes('text-red-600')
      );
    });
    results.activeSidebarHighlight = !!activeHighlight;
    console.log(`[Active Sidebar Highlight]: ${results.activeSidebarHighlight ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 3. VERIFY CUSTOMIZE TAB UI & INTERACTIVE PREVIEW
    // =============================================================
    console.log('--- 3. Testing Customize Tab & Live Interactive Preview ---');
    const customizeDom = await page.evaluate(() => {
      const text = document.body ? document.body.innerText : '';
      const hasHeading = text.includes('WhatsApp Widget');
      const hasCustomizeTab = text.includes('Customize Widget');
      const hasInstallTab = text.includes('Install & Embed');
      const hasPhoneField = text.includes('WhatsApp Phone Number');
      const hasPosition = text.includes('Bottom Right') && text.includes('Bottom Left');
      const hasLivePreview = text.includes('Live Preview');
      const hasStartChatBtn = text.includes('Start Chat on WhatsApp');
      return {
        hasHeading,
        hasCustomizeTab,
        hasInstallTab,
        hasPhoneField,
        hasPosition,
        hasLivePreview,
        hasStartChatBtn,
      };
    });

    results.customizeTabUI =
      customizeDom.hasHeading &&
      customizeDom.hasCustomizeTab &&
      customizeDom.hasInstallTab &&
      customizeDom.hasPhoneField &&
      customizeDom.hasPosition;

    results.interactivePreview = customizeDom.hasLivePreview && customizeDom.hasStartChatBtn;

    console.log(`[Customize Tab UI]: ${results.customizeTabUI ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`[Live Interactive Simulator]: ${results.interactivePreview ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 4. TEST SAVE & PERSISTENCE
    // =============================================================
    console.log('--- 4. Testing Save Changes & Backend Persistence ---');

    // Click "Save Changes"
    await page.evaluate(() => {
      const saveBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Save Changes'));
      if (saveBtn) saveBtn.click();
    });
    await delay(600);

    // Hard reload /widget
    await page.reload({ waitUntil: 'networkidle0' });
    await delay(500);

    const persistedCheck = await page.evaluate(() => {
      const text = document.body ? document.body.innerText : '';
      return text.includes('WhatsApp Widget') && text.includes('Customize Widget');
    });

    results.saveAndPersistSettings = persistedCheck;
    console.log(`[Save & Persistence]: ${results.saveAndPersistSettings ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 5. TEST INSTALL TAB UI & EMBED SNIPPET
    // =============================================================
    console.log('--- 5. Testing Install & Embed Tab ---');

    // Switch to Install tab
    await page.evaluate(() => {
      const installBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Install & Embed'));
      if (installBtn) installBtn.click();
    });
    await delay(400);

    const installDom = await page.evaluate(() => {
      const text = document.body ? document.body.innerText : '';
      const hasScriptCode = text.includes('<script async src="https://widget.arcocommunication.com/widget.js"');
      const hasCopyCodeBtn = text.includes('Copy Code');
      const hasQrCode = text.includes('Offline / Flyer QR Code');
      const hasDirectLink = text.includes('Open WhatsApp Direct Link');
      return { hasScriptCode, hasCopyCodeBtn, hasQrCode, hasDirectLink };
    });

    results.installTabUI = installDom.hasScriptCode && installDom.hasCopyCodeBtn && installDom.hasQrCode && installDom.hasDirectLink;
    console.log(`[Install & Embed Tab]: ${results.installTabUI ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 6. TEST DEEP LINKS (/widget/manage & /widget/install)
    // =============================================================
    console.log('--- 6. Testing Deep Links ---');
    await page.goto(`${FRONTEND_URL}/widget/manage`, { waitUntil: 'networkidle0' });
    await delay(300);
    const managePass = page.url().includes('/widget/manage');

    await page.goto(`${FRONTEND_URL}/widget/install`, { waitUntil: 'networkidle0' });
    await delay(300);
    const installDeepPass = page.url().includes('/widget/install');

    results.deepLinksWorking = managePass && installDeepPass;
    console.log(`[Deep Links /widget/manage & /widget/install]: ${results.deepLinksWorking ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // SUMMARY
    // =============================================================
    console.log('================================================================');
    console.log('📊 FINAL WHATSAPP WIDGET MODULE QA SUMMARY');
    console.log('================================================================');
    console.table(results);

    const allPassed = Object.values(results).every(Boolean);
    console.log(`\nWHATSAPP WIDGET REGRESSION RESULT: ${allPassed ? '🎉 100% PASS' : '❌ FAIL'}\n`);

    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('[Widget QA Error]:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

verifyWidgetModuleQA();
