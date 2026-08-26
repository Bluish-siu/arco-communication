import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import { config } from './index.js';

const FRONTEND_URL = 'http://localhost:5173';
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function runInboxLabelsFilterQA() {
  console.log('================================================================');
  console.log('🧪 ARCO QA — INBOX LABELS FILTER EXACT INTERAKT REPLICATION AUDIT');
  console.log('================================================================\n');

  const token = jwt.sign(
    { id: 'usr_1', email: 'owner@arco.com', role: 'admin', name: 'Shraddha' },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  const results = {
    labelsSelectedByDefault: false,
    noLabelAttachedPresent: false,
    noHardcodedStaticLabels: false,
    searchLabelsFieldFunctional: false,
    noLabelsFoundState: false,
    clearSearchRestoresList: false,
    noLabelAttachedSelectable: false,
    tabSwitchPreservesSelection: false,
    clearActionClearsOnlyLabels: false,
    applyFilterWorksWithNoLabelAttached: false,
    resetAllRestoresDefaults: false,
    otherCategoriesIntact: false,
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

    // 0. Seed session
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle0' });
    await page.evaluate((tok) => {
      localStorage.setItem('arco_auth_token', tok);
    }, token);

    // =============================================================
    // 1. OPEN /inbox & CLICK FUNNEL BUTTON
    // =============================================================
    console.log('--- 1. Testing Default Labels Selection & Layout ---');
    await page.goto(`${FRONTEND_URL}/inbox`, { waitUntil: 'networkidle0' });
    await delay(600);

    // Click Funnel button
    await page.evaluate(() => {
      const funnelBtn = document.querySelector('button[title="Open Filters"]');
      if (funnelBtn) funnelBtn.click();
    });
    await delay(300);

    const check1 = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const labelsBtn = buttons.find((b) => b.innerText.trim() === 'Labels');
      const isLabelsActive = labelsBtn?.className?.includes('bg-emerald-50') || labelsBtn?.className?.includes('text-emerald-800');
      const hasHeading = document.body.innerText.includes('Labels');
      const hasSearchInput = !!document.querySelector('input[placeholder="Search Labels"]');

      return isLabelsActive && hasHeading && hasSearchInput;
    });

    results.labelsSelectedByDefault = check1;
    console.log(`[Labels category selected by default with Search field]: ${results.labelsSelectedByDefault ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 2. CHECK "No Label Attached" & NO HARDCODED LABELS
    // =============================================================
    console.log('--- 2. Checking "No Label Attached" & Absence of Hardcoded Labels ---');
    const check2 = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('div.overflow-y-auto label')).map((l) => l.innerText.trim());
      const hasNoLabelAttached = labels.includes('No Label Attached');
      const hasHardcodedVIP = labels.includes('VIP');
      const hasHardcodedSupport = labels.includes('Support');
      const hasHardcodedSales = labels.includes('Sales');
      const hasHardcodedBilling = labels.includes('Billing');
      const hasHardcodedUrgent = labels.includes('Urgent');
      const hasHardcodedHighPriority = labels.includes('High Priority');

      const noHardcoded = !hasHardcodedVIP && !hasHardcodedSupport && !hasHardcodedSales && !hasHardcodedBilling && !hasHardcodedUrgent && !hasHardcodedHighPriority;

      return {
        hasNoLabelAttached,
        noHardcoded,
        renderedLabels: labels,
      };
    });

    results.noLabelAttachedPresent = check2.hasNoLabelAttached;
    results.noHardcodedStaticLabels = check2.noHardcoded;

    console.log(`["No Label Attached" option present]: ${results.noLabelAttachedPresent ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`[No hardcoded labels (VIP, Support, Sales, etc.) shown]: ${results.noHardcodedStaticLabels ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 3. SEARCH FIELD REAL-TIME FILTERING
    // =============================================================
    console.log('--- 3. Testing Search Field & Real-Time Filtering ---');
    await page.evaluate(() => {
      const setNativeValue = (element, value) => {
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
        if (prototypeValueSetter) {
          prototypeValueSetter.call(element, value);
        } else {
          element.value = value;
        }
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      };

      const input = document.querySelector('input[placeholder="Search Labels"]');
      if (input) setNativeValue(input, 'label attached');
    });
    await delay(200);

    const checkSearch = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('div.overflow-y-auto label')).map((l) => l.innerText.trim());
      return labels.includes('No Label Attached');
    });
    results.searchLabelsFieldFunctional = checkSearch;
    console.log(`[Search Labels filters list in real time]: ${results.searchLabelsFieldFunctional ? '✅ PASS' : '❌ FAIL'}`);

    // Search nonexistent query -> "No labels found"
    await page.evaluate(() => {
      const setNativeValue = (element, value) => {
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
        if (prototypeValueSetter) {
          prototypeValueSetter.call(element, value);
        } else {
          element.value = value;
        }
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      };

      const input = document.querySelector('input[placeholder="Search Labels"]');
      if (input) setNativeValue(input, 'nonexistentquery999');
    });
    await delay(200);

    const checkNoLabels = await page.evaluate(() => {
      return document.body.innerText.includes('No labels found');
    });
    results.noLabelsFoundState = checkNoLabels;
    console.log(`["No labels found" state displayed for unmatched search]: ${results.noLabelsFoundState ? '✅ PASS' : '❌ FAIL'}`);

    // Clear search input
    await page.evaluate(() => {
      const setNativeValue = (element, value) => {
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
        if (prototypeValueSetter) {
          prototypeValueSetter.call(element, value);
        } else {
          element.value = value;
        }
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      };

      const input = document.querySelector('input[placeholder="Search Labels"]');
      if (input) setNativeValue(input, '');
    });
    await delay(200);

    const checkRestored = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('div.overflow-y-auto label')).map((l) => l.innerText.trim());
      return labels.includes('No Label Attached');
    });
    results.clearSearchRestoresList = checkRestored;
    console.log(`[Clearing search restores label list]: ${results.clearSearchRestoresList ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 4. SELECT "No Label Attached" & VERIFY CHECKBOX SELECTION
    // =============================================================
    console.log('--- 4. Testing Multi-Select & Selection State ---');
    await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('div.overflow-y-auto label'));
      const noLabel = labels.find((l) => l.innerText.includes('No Label Attached'));
      const cb = noLabel?.querySelector('input[type="checkbox"]');
      if (cb) {
        cb.click();
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await delay(200);

    const checkSelected = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('div.overflow-y-auto label'));
      const noLabel = labels.find((l) => l.innerText.includes('No Label Attached'));
      const cb = noLabel?.querySelector('input[type="checkbox"]');
      return cb && cb.checked;
    });
    results.noLabelAttachedSelectable = checkSelected;
    console.log(`["No Label Attached" checkbox selected]: ${results.noLabelAttachedSelectable ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 5. TAB SWITCHING PRESERVES SELECTION
    // =============================================================
    console.log('--- 5. Testing Tab Switching Preserves Selection ---');
    // Switch to Tags
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tagsBtn = buttons.find((b) => b.innerText.trim() === 'Tags');
      if (tagsBtn) tagsBtn.click();
    });
    await delay(200);

    // Switch back to Labels
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const labelsBtn = buttons.find((b) => b.innerText.trim() === 'Labels');
      if (labelsBtn) labelsBtn.click();
    });
    await delay(200);

    const checkTabSwitch = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('div.overflow-y-auto label'));
      const noLabel = labels.find((l) => l.innerText.includes('No Label Attached'));
      const cb = noLabel?.querySelector('input[type="checkbox"]');
      return cb && cb.checked;
    });
    results.tabSwitchPreservesSelection = checkTabSwitch;
    console.log(`[Tab switching preserves selection]: ${results.tabSwitchPreservesSelection ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 6. CLEAR ACTION CLEARS ONLY LABELS
    // =============================================================
    console.log('--- 6. Testing Top-Right Clear Action ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const clearBtn = buttons.find((b) => b.innerText.trim() === 'Clear');
      if (clearBtn) clearBtn.click();
    });
    await delay(200);

    const checkClear = await page.evaluate(() => {
      const checkboxes = Array.from(document.querySelectorAll('div.overflow-y-auto input[type="checkbox"]'));
      return checkboxes.every((cb) => !cb.checked);
    });
    results.clearActionClearsOnlyLabels = checkClear;
    console.log(`[Clear button clears label selections]: ${results.clearActionClearsOnlyLabels ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 7. APPLY FILTER WITH "No Label Attached"
    // =============================================================
    console.log('--- 7. Testing Apply Filter with "No Label Attached" ---');
    // Select No Label Attached
    await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('div.overflow-y-auto label'));
      const noLabel = labels.find((l) => l.innerText.includes('No Label Attached'));
      const cb = noLabel?.querySelector('input[type="checkbox"]');
      if (cb) {
        cb.click();
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await delay(200);

    // Click Apply Filter
    await page.evaluate(() => {
      const applyBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.trim() === 'Apply Filter'
      );
      if (applyBtn) applyBtn.click();
    });
    await delay(600);

    const checkApplied = await page.evaluate(() => {
      const text = document.body.innerText;
      const funnelBtn = document.querySelector('button[title="Open Filters"]');
      const hasBadge = funnelBtn && funnelBtn.innerText.includes('1');
      const hasLabelChip = text.includes('1 Label');
      const hasConversations = text.includes('Rahul Sharma') || text.includes('Priya Mehta');
      return (hasBadge || hasLabelChip) && hasConversations;
    });
    results.applyFilterWorksWithNoLabelAttached = checkApplied;
    console.log(`[Apply Filter filters conversations & updates badge count]: ${results.applyFilterWorksWithNoLabelAttached ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 8. RESET ALL RESTORES DEFAULTS
    // =============================================================
    console.log('--- 8. Testing Reset All Action ---');
    // Reopen modal
    await page.evaluate(() => {
      const funnelBtn = document.querySelector('button[title="Open Filters"]');
      if (funnelBtn) funnelBtn.click();
    });
    await delay(300);

    // Click Reset All
    await page.evaluate(() => {
      const resetBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.trim() === 'Reset All'
      );
      if (resetBtn) resetBtn.click();
    });
    await delay(200);

    // Click Apply Filter
    await page.evaluate(() => {
      const applyBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.trim() === 'Apply Filter'
      );
      if (applyBtn) applyBtn.click();
    });
    await delay(500);

    const checkReset = await page.evaluate(() => {
      const funnelBtn = document.querySelector('button[title="Open Filters"]');
      const badgeSpan = funnelBtn?.querySelector('span');
      return !badgeSpan;
    });
    results.resetAllRestoresDefaults = checkReset;
    console.log(`[Reset All clears active badge]: ${results.resetAllRestoresDefaults ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 9. VERIFY OTHER FILTER CATEGORIES INTACT
    // =============================================================
    console.log('--- 9. Verifying Other 8 Filter Categories Unchanged ---');
    await page.evaluate(() => {
      const funnelBtn = document.querySelector('button[title="Open Filters"]');
      if (funnelBtn) funnelBtn.click();
    });
    await delay(300);

    const checkOtherCategories = await page.evaluate(() => {
      const text = document.body.innerText;
      const expected = [
        'Tags',
        'Chat Status',
        'Assignee',
        'Reply Status',
        'Read/Unread',
        'Response Window',
        'Last Message Time',
        'Spam Chats',
      ];
      return expected.every((cat) => text.includes(cat));
    });
    results.otherCategoriesIntact = checkOtherCategories;
    console.log(`[All other 8 filter categories intact & unchanged]: ${results.otherCategoriesIntact ? '✅ PASS' : '❌ FAIL'}\n`);

    // Close modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[title="Close filters"]');
      if (closeBtn) closeBtn.click();
    });
    await delay(200);

    results.zeroConsoleErrors = consoleErrors.length === 0;
    console.log(`[Zero Console Errors]: ${results.zeroConsoleErrors ? '✅ PASS' : '❌ FAIL'}`);
    if (consoleErrors.length > 0) {
      console.log('Console Errors found:', consoleErrors);
    }
    console.log('\n');

    // =============================================================
    // SUMMARY
    // =============================================================
    console.log('================================================================');
    console.log('📊 FINAL INBOX LABELS FILTER INTERAKT QA SUMMARY');
    console.log('================================================================');
    console.table(results);

    const allPassed = Object.values(results).every(Boolean);
    console.log(`\nINTERAKT LABELS FILTER RESULT: ${allPassed ? '🎉 100% PASS' : '❌ FAIL'}\n`);

    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('[Labels Filter QA Error]:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

runInboxLabelsFilterQA();
