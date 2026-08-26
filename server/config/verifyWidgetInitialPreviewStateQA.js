import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import { config } from './index.js';

const FRONTEND_URL = 'http://localhost:5173';
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function runInitialPreviewStateQA() {
  console.log('================================================================');
  console.log('🧪 ARCO QA — WIDGET INITIAL PREVIEW COMPACT STATE AUDIT');
  console.log('================================================================\n');

  const token = jwt.sign(
    { id: 'usr_1', email: 'owner@arco.com', role: 'admin', name: 'Shraddha' },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  const results = {
    initialCompactOnly: false,
    noLargeCardInitially: false,
    expandsOnImageSelect: false,
    closeXButtonClosesPopup: false,
    triggerButtonTogglesPopup: false,
    zeroConsoleErrors: false,
  };

  const consoleErrors = [];
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
          consoleErrors.push(text);
        }
      }
    });

    // Seed session token
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle0' });
    await page.evaluate((tok) => {
      localStorage.setItem('arco_auth_token', tok);
    }, token);

    // =============================================================
    // 1. OPEN /widget (INITIAL STATE CHECK)
    // =============================================================
    console.log('--- 1. Testing Initial Page Load Preview State ---');
    await page.goto(`${FRONTEND_URL}/widget`, { waitUntil: 'networkidle0' });
    await delay(500);

    const initialCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      const triggerBtn = document.querySelector('button[title="Toggle WhatsApp preview"]');
      const previewDiv = document.querySelector('div.fixed.z-40');
      const hasPreviewLabel = text.includes('Preview');
      const hasChatWithUsBtn = !!triggerBtn;
      const isRightAligned = previewDiv && !!previewDiv.style.right && !previewDiv.style.left;
      const isBottomAligned = previewDiv && !!previewDiv.style.bottom;
      // Look for the expanded messenger card elements
      const hasTypicallyReplies = text.includes('Typically replies in minutes');
      const hasStartChatBtn = text.includes('Start Chat on WhatsApp');
      return {
        hasPreviewLabel,
        hasChatWithUsBtn,
        isBottomRight: isRightAligned && isBottomAligned,
        isLargeCardVisible: hasTypicallyReplies || hasStartChatBtn,
      };
    });

    results.initialCompactOnly = initialCheck.hasPreviewLabel && initialCheck.hasChatWithUsBtn && initialCheck.isBottomRight;
    results.noLargeCardInitially = !initialCheck.isLargeCardVisible;

    console.log(`[Initial Compact WhatsApp Button Visible on Bottom-Right]: ${results.initialCompactOnly ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`[No Large Messenger Card Initially]: ${results.noLargeCardInitially ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 2. EXPAND ON IMAGE SELECT (Accordion 2)
    // =============================================================
    console.log('--- 2. Testing Expansion Upon Image Selection ---');
    // Open Accordion 2
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const acc2 = buttons.find((b) => b.innerText.includes('Design your messenger'));
      if (acc2) acc2.click();
    });
    await delay(300);

    // Click "Support" image
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const supportBtn = buttons.find((b) => b.innerText.trim() === 'Support');
      if (supportBtn) supportBtn.click();
    });
    await delay(300);

    const expandedCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasTypicallyReplies = text.includes('Typically replies in minutes');
      const hasStartChatBtn = text.includes('Start Chat on WhatsApp');
      return hasTypicallyReplies && hasStartChatBtn;
    });

    results.expandsOnImageSelect = expandedCheck;
    console.log(`[Expands On Image Select]: ${results.expandsOnImageSelect ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 3. CLOSE VIA X BUTTON
    // =============================================================
    console.log('--- 3. Testing Close (X) Button in Messenger Popup ---');
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[title="Close preview popup"]');
      if (closeBtn) closeBtn.click();
    });
    await delay(300);

    const closedCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasStartChatBtn = text.includes('Start Chat on WhatsApp');
      return !hasStartChatBtn;
    });

    results.closeXButtonClosesPopup = closedCheck;
    console.log(`[Close (X) Button Closes Popup]: ${results.closeXButtonClosesPopup ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 4. TOGGLE VIA FLOATING TRIGGER BUTTON
    // =============================================================
    console.log('--- 4. Testing Trigger Button Toggles Popup ---');
    await page.evaluate(() => {
      const triggerBtn = document.querySelector('button[title="Toggle WhatsApp preview"]');
      if (triggerBtn) triggerBtn.click();
    });
    await delay(300);

    const toggledCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Start Chat on WhatsApp');
    });

    results.triggerButtonTogglesPopup = toggledCheck;
    console.log(`[Trigger Button Toggles Popup]: ${results.triggerButtonTogglesPopup ? '✅ PASS' : '❌ FAIL'}\n`);

    results.zeroConsoleErrors = consoleErrors.length === 0;
    console.log(`[Zero Console Errors]: ${results.zeroConsoleErrors ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // SUMMARY
    // =============================================================
    console.log('================================================================');
    console.log('📊 FINAL PREVIEW STATE QA SUMMARY');
    console.log('================================================================');
    console.table(results);

    const allPassed = Object.values(results).every(Boolean);
    console.log(`\nPREVIEW STATE AUDIT RESULT: ${allPassed ? '🎉 100% PASS' : '❌ FAIL'}\n`);

    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('[Preview State QA Error]:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

runInitialPreviewStateQA();
