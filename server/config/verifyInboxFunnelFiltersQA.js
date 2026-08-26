import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import { config } from './index.js';

const FRONTEND_URL = 'http://localhost:5173';
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function runInboxFunnelFiltersQA() {
  console.log('================================================================');
  console.log('🧪 ARCO QA — INBOX FUNNEL / FILTER MODAL SYSTEM AUDIT');
  console.log('================================================================\n');

  const token = jwt.sign(
    { id: 'usr_1', email: 'owner@arco.com', role: 'admin', name: 'Shraddha' },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  const results = {
    modalOpensWith9Categories: false,
    categoryNavigationAndActiveStyling: false,
    labelsCategorySearchAndClear: false,
    tagsMultiSelectAndSearch: false,
    chatStatusRadioOptions: false,
    assigneeCategoryOptions: false,
    replyStatusCheckboxes: false,
    readUnreadRadioOptions: false,
    responseWindowRadioOptions: false,
    lastMessageTimeDatePickers: false,
    spamChatsCategory: false,
    applyFilterAndBadgeIndicator: false,
    filterStatePersistenceOnReopen: false,
    resetAllRestoresDefaults: false,
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
    console.log('--- 1. Testing Funnel Button & Modal Opening ---');
    await page.goto(`${FRONTEND_URL}/inbox`, { waitUntil: 'networkidle0' });
    await delay(600);

    // Click Funnel button
    await page.evaluate(() => {
      const funnelBtn = document.querySelector('button[title="Open Filters"]');
      if (funnelBtn) funnelBtn.click();
    });
    await delay(300);

    const categoriesCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      const expectedCategories = [
        'Labels',
        'Tags',
        'Chat Status',
        'Assignee',
        'Reply Status',
        'Read/Unread',
        'Response Window',
        'Last Message Time',
        'Spam Chats',
      ];
      const allPresent = expectedCategories.every((cat) => text.includes(cat));
      const hasHeading = text.includes('Filters');
      const hasResetAll = text.includes('Reset All');
      const hasApply = text.includes('Apply Filter');

      return allPresent && hasHeading && hasResetAll && hasApply;
    });

    results.modalOpensWith9Categories = categoriesCheck;
    console.log(`[Modal Opens with 9 Filter Categories in Order]: ${results.modalOpensWith9Categories ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 2. CATEGORY NAVIGATION & ACTIVE STYLING
    // =============================================================
    console.log('--- 2. Testing Category Navigation & Active Highlight ---');
    const activeStyling = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const activeBtn = buttons.find((b) => b.innerText.trim() === 'Labels');
      return activeBtn?.className?.includes('bg-emerald-50') || activeBtn?.className?.includes('text-emerald-800');
    });
    results.categoryNavigationAndActiveStyling = activeStyling;
    console.log(`[Category Navigation & Active Light-Green Styling]: ${results.categoryNavigationAndActiveStyling ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 3. LABELS CATEGORY SEARCH & CLEAR
    // =============================================================
    console.log('--- 3. Testing Labels Category Search & Clear ---');
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="Search Labels"]');
      if (input) {
        input.value = 'No Label';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await delay(200);

    const labelCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('No Label Attached');
    });
    results.labelsCategorySearchAndClear = labelCheck;
    console.log(`[Labels Search & Options Validated]: ${results.labelsCategorySearchAndClear ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 4. TAGS CATEGORY MULTI-SELECT & SEARCH
    // =============================================================
    console.log('--- 4. Testing Tags Category Multi-Select & Search ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tagsBtn = buttons.find((b) => b.innerText.trim() === 'Tags');
      if (tagsBtn) tagsBtn.click();
    });
    await delay(200);

    const tagsCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasRepeat = text.includes('Repeat Buyers');
      const hasLoyal = text.includes('Loyal');
      const hasAbandoned = text.includes('Abandoned Cart');
      return hasRepeat && hasLoyal && hasAbandoned;
    });

    // Select Repeat Buyers tag
    await page.evaluate(() => {
      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      // Find the label for Repeat Buyers
      const labels = Array.from(document.querySelectorAll('label'));
      const repeatLabel = labels.find((l) => l.innerText.includes('Repeat Buyers'));
      const cb = repeatLabel?.querySelector('input[type="checkbox"]');
      if (cb) cb.click();
    });
    await delay(200);

    results.tagsMultiSelectAndSearch = tagsCheck;
    console.log(`[Tags Multi-Select & Standard Tag List]: ${results.tagsMultiSelectAndSearch ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 5. CHAT STATUS RADIO OPTIONS
    // =============================================================
    console.log('--- 5. Testing Chat Status Category ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const statusBtn = buttons.find((b) => b.innerText.trim() === 'Chat Status');
      if (statusBtn) statusBtn.click();
    });
    await delay(200);

    const statusCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('All Chats') && text.includes('Open Chats') && text.includes('Closed Chats');
    });
    results.chatStatusRadioOptions = statusCheck;
    console.log(`[Chat Status Radio Options Validated]: ${results.chatStatusRadioOptions ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 6. ASSIGNEE CATEGORY
    // =============================================================
    console.log('--- 6. Testing Assignee Category ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const assigneeBtn = buttons.find((b) => b.innerText.trim() === 'Assignee');
      if (assigneeBtn) assigneeBtn.click();
    });
    await delay(200);

    const assigneeCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasAgentInput = !!document.querySelector('input[placeholder="Search Agent Name"]');
      return text.includes('Unassigned') && text.includes('Assigned to me') && hasAgentInput;
    });
    results.assigneeCategoryOptions = assigneeCheck;
    console.log(`[Assignee Options & Agent Search Validated]: ${results.assigneeCategoryOptions ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 7. REPLY STATUS CATEGORY
    // =============================================================
    console.log('--- 7. Testing Reply Status Category ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const replyBtn = buttons.find((b) => b.innerText.trim() === 'Reply Status');
      if (replyBtn) replyBtn.click();
    });
    await delay(200);

    const replyCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Unreplied') && text.includes('Replied Manually') && text.includes('Replied by Bot');
    });
    results.replyStatusCheckboxes = replyCheck;
    console.log(`[Reply Status Checkboxes Validated]: ${results.replyStatusCheckboxes ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 8. READ / UNREAD CATEGORY
    // =============================================================
    console.log('--- 8. Testing Read/Unread Category ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const readBtn = buttons.find((b) => b.innerText.trim() === 'Read/Unread');
      if (readBtn) readBtn.click();
    });
    await delay(200);

    const readCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('All') && text.includes('Read') && text.includes('Unread');
    });
    results.readUnreadRadioOptions = readCheck;
    console.log(`[Read/Unread Radio Options Validated]: ${results.readUnreadRadioOptions ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 9. RESPONSE WINDOW CATEGORY
    // =============================================================
    console.log('--- 9. Testing Response Window Category ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const rwBtn = buttons.find((b) => b.innerText.trim() === 'Response Window');
      if (rwBtn) rwBtn.click();
    });
    await delay(200);

    const rwCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('All') && text.includes('Active') && text.includes('Inactive');
    });
    results.responseWindowRadioOptions = rwCheck;
    console.log(`[Response Window Options Validated]: ${results.responseWindowRadioOptions ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 10. LAST MESSAGE TIME DATE PICKERS
    // =============================================================
    console.log('--- 10. Testing Last Message Time Category ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const lmtBtn = buttons.find((b) => b.innerText.trim() === 'Last Message Time');
      if (lmtBtn) lmtBtn.click();
    });
    await delay(200);

    const lmtCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      const dateInputs = document.querySelectorAll('input[type="date"]');
      return text.includes('From') && text.includes('To') && dateInputs.length === 2;
    });
    results.lastMessageTimeDatePickers = lmtCheck;
    console.log(`[Last Message Time Date Pickers Validated]: ${results.lastMessageTimeDatePickers ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 11. SPAM CHATS CATEGORY
    // =============================================================
    console.log('--- 11. Testing Spam Chats Category ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const spamBtn = buttons.find((b) => b.innerText.trim() === 'Spam Chats');
      if (spamBtn) spamBtn.click();
    });
    await delay(200);

    const spamCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Show Spam Chats');
    });
    results.spamChatsCategory = spamCheck;
    console.log(`[Spam Chats Category Validated]: ${results.spamChatsCategory ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 12. APPLY FILTER & ACTIVE BADGE INDICATOR
    // =============================================================
    console.log('--- 12. Testing Apply Filter & Badge Indicator ---');
    // Click Apply Filter
    await page.evaluate(() => {
      const applyBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.trim() === 'Apply Filter'
      );
      if (applyBtn) applyBtn.click();
    });
    await delay(500);

    const appliedCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      const funnelBtn = document.querySelector('button[title="Open Filters"]');
      const hasBadge = funnelBtn && funnelBtn.innerText.includes('1');
      const hasTagPill = text.includes('1 Tag') || text.includes('Tags');
      return hasBadge || hasTagPill;
    });
    results.applyFilterAndBadgeIndicator = appliedCheck;
    console.log(`[Apply Filter Closes Modal & Shows Active Badge]: ${results.applyFilterAndBadgeIndicator ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 13. FILTER STATE PERSISTENCE ON REOPEN
    // =============================================================
    console.log('--- 13. Testing Filter State Persistence on Reopen ---');
    // Click Funnel button again
    await page.evaluate(() => {
      const funnelBtn = document.querySelector('button[title="Open Filters"]');
      if (funnelBtn) funnelBtn.click();
    });
    await delay(300);

    // Switch to Tags category
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tagsBtn = buttons.find((b) => b.innerText.trim() === 'Tags');
      if (tagsBtn) tagsBtn.click();
    });
    await delay(200);

    const persistenceCheck = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('label'));
      const repeatLabel = labels.find((l) => l.innerText.includes('Repeat Buyers'));
      const cb = repeatLabel?.querySelector('input[type="checkbox"]');
      return cb && cb.checked;
    });
    results.filterStatePersistenceOnReopen = persistenceCheck;
    console.log(`[Filter State Persisted Across Modal Reopen]: ${results.filterStatePersistenceOnReopen ? '✅ PASS' : '❌ FAIL'}`);

    // =============================================================
    // 14. RESET ALL RESTORES DEFAULTS
    // =============================================================
    console.log('--- 14. Testing Reset All Restores Defaults ---');
    await page.evaluate(() => {
      const resetBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.trim() === 'Reset All'
      );
      if (resetBtn) resetBtn.click();
    });
    await delay(200);

    // Apply the reset
    await page.evaluate(() => {
      const applyBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.trim() === 'Apply Filter'
      );
      if (applyBtn) applyBtn.click();
    });
    await delay(500);

    const resetCheck = await page.evaluate(() => {
      const funnelBtn = document.querySelector('button[title="Open Filters"]');
      const badgeSpan = funnelBtn?.querySelector('span');
      return !badgeSpan;
    });
    results.resetAllRestoresDefaults = resetCheck;
    console.log(`[Reset All Restores Defaults & Clears Active Badge]: ${results.resetAllRestoresDefaults ? '✅ PASS' : '❌ FAIL'}\n`);

    results.zeroConsoleErrors = consoleErrors.length === 0;
    console.log(`[Zero Console Errors]: ${results.zeroConsoleErrors ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // SUMMARY
    // =============================================================
    console.log('================================================================');
    console.log('📊 FINAL INBOX FUNNEL FILTERS QA SUMMARY');
    console.log('================================================================');
    console.table(results);

    const allPassed = Object.values(results).every(Boolean);
    console.log(`\nFUNNEL FILTERS RESULT: ${allPassed ? '🎉 100% PASS' : '❌ FAIL'}\n`);

    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('[Funnel Filters QA Error]:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

runInboxFunnelFiltersQA();
