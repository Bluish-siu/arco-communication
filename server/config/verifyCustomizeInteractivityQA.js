import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import { config } from './index.js';

const FRONTEND_URL = 'http://localhost:5173';
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function runCustomizeInteractivityQA() {
  console.log('================================================================');
  console.log('🧪 ARCO PRODUCTION QA — WIDGET CUSTOMIZE LIVE INTERACTIVITY AUDIT');
  console.log('================================================================\n');

  const token = jwt.sign(
    { id: 'usr_1', email: 'owner@arco.com', role: 'admin', name: 'Shraddha' },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  const results = {
    imageSelectionUpdatesPreview: false,
    greetingsAndIntroLiveUpdate: false,
    desktopPositionMoveLeft: false,
    desktopSpacingApplies: false,
    mobilePositionAndSpacing: false,
    saveAndFullPersistence: false,
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
    // 1. OPEN /widget
    // =============================================================
    console.log('--- 1. Loading /widget ---');
    await page.goto(`${FRONTEND_URL}/widget`, { waitUntil: 'networkidle0' });
    await delay(500);

    // =============================================================
    // 2. TEST ACCORDION 2: IMAGE SELECTION UPDATES PREVIEW
    // =============================================================
    console.log('--- 2. Testing Accordion 2: Messenger Image Live Preview ---');
    // Open Accordion 2
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const acc2 = buttons.find((b) => b.innerText.includes('Design your messenger'));
      if (acc2) acc2.click();
    });
    await delay(300);

    // Click "Support"
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const supportBtn = buttons.find((b) => b.innerText.trim() === 'Support');
      if (supportBtn) supportBtn.click();
    });
    await delay(200);

    const supportSelected = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const supportBtn = buttons.find((b) => b.innerText.trim() === 'Support');
      const isHighlighted = supportBtn?.className?.includes('border-emerald-600') || supportBtn?.className?.includes('ring-emerald-600');
      const previewText = document.body.innerText;
      const previewHasArco = previewText.includes('ARCO Communication');
      return isHighlighted && previewHasArco;
    });

    results.imageSelectionUpdatesPreview = supportSelected;
    console.log(`[Image Selection Updates Preview]: ${results.imageSelectionUpdatesPreview ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 3. TEST ACCORDION 3: GREETINGS & INTRO MESSAGE LIVE UPDATE
    // =============================================================
    console.log('--- 3. Testing Accordion 3: Welcome Message Live Update ---');
    // Open Accordion 3
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const acc3 = buttons.find((b) => b.innerText.includes('Set your welcome message'));
      if (acc3) acc3.click();
    });
    await delay(300);

    // Type custom greeting and intro message using standard React native setters
    await page.evaluate(() => {
      const setNativeValue = (element, value) => {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
        if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
          prototypeValueSetter.call(element, value);
        } else if (valueSetter) {
          valueSetter.call(element, value);
        } else {
          element.value = value;
        }
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      };

      const inputs = Array.from(document.querySelectorAll('input'));
      const greetingInput = inputs.find((i) => i.placeholder === 'HI THERE!' || i.value.includes('HI') || i.value.includes('THERE'));
      if (greetingInput) {
        setNativeValue(greetingInput, 'WELCOME TO ARCO QA!');
      }

      const textareas = Array.from(document.querySelectorAll('textarea'));
      const introArea = textareas[0];
      if (introArea) {
        setNativeValue(introArea, 'We are live and ready to assist your team immediately.');
      }
    });
    await delay(200);

    const welcomeUpdated = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasGreeting = text.includes('WELCOME TO ARCO QA!');
      const hasIntro = text.includes('We are live and ready to assist your team immediately.');
      return hasGreeting && hasIntro;
    });

    results.greetingsAndIntroLiveUpdate = welcomeUpdated;
    console.log(`[Greetings & Intro Live Update]: ${results.greetingsAndIntroLiveUpdate ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 4. TEST ACCORDION 4: POSITION & SPACING LIVE UPDATE
    // =============================================================
    console.log('--- 4. Testing Accordion 4: Position Left/Right & Spacings ---');
    // Open Accordion 4
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const acc4 = buttons.find((b) => b.innerText.includes('Set your Chat Button position'));
      if (acc4) acc4.click();
    });
    await delay(300);

    // Select Desktop Left Position
    await page.evaluate(() => {
      const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
      const leftRadio = radios.find((r) => r.name === 'desktopPosition' && r.value === 'left');
      if (leftRadio) {
        leftRadio.click();
        leftRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await delay(200);

    // Verify preview style shifted to left
    const leftMoved = await page.evaluate(() => {
      const previewDiv = document.querySelector('div.fixed.z-40');
      return previewDiv && previewDiv.style.left && !previewDiv.style.right;
    });
    results.desktopPositionMoveLeft = leftMoved;
    console.log(`[Desktop Position Move Left]: ${results.desktopPositionMoveLeft ? '✅ PASS' : '❌ FAIL'}`);

    // Update Desktop Spacing values: Side 45, Bottom 55
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

      const numberInputs = Array.from(document.querySelectorAll('input[type="number"]'));
      if (numberInputs[0]) setNativeValue(numberInputs[0], '45');
      if (numberInputs[1]) setNativeValue(numberInputs[1], '55');
    });
    await delay(200);

    // Verify spacing applied to preview style (45 + 16 = 61px, 55 + 16 = 71px)
    const spacingApplied = await page.evaluate(() => {
      const previewDiv = document.querySelector('div.fixed.z-40');
      if (!previewDiv) return false;
      const leftVal = previewDiv.style.left;
      const bottomVal = previewDiv.style.bottom;
      return leftVal.includes('61px') && bottomVal.includes('71px');
    });
    results.desktopSpacingApplies = spacingApplied;
    console.log(`[Desktop Spacing Applies Directly]: ${results.desktopSpacingApplies ? '✅ PASS' : '❌ FAIL'}`);

    // Switch to Mobile Preview Mode
    await page.evaluate(() => {
      const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
      const mobilePreviewRadio = radios.find((r) => r.name === 'previewMode' && r.value === 'mobile');
      if (mobilePreviewRadio) {
        mobilePreviewRadio.click();
        mobilePreviewRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await delay(200);

    const mobileCheck = await page.evaluate(() => {
      const previewDiv = document.querySelector('div.fixed.z-40');
      // default mobile is right with 10px -> 26px
      return previewDiv && previewDiv.style.right && previewDiv.style.right.includes('26px');
    });
    results.mobilePositionAndSpacing = mobileCheck;
    console.log(`[Mobile Preview Position & Spacing]: ${results.mobilePositionAndSpacing ? '✅ PASS' : '❌ FAIL'}\n`);

    // Switch back to Desktop preview for saving
    await page.evaluate(() => {
      const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
      const desktopRadio = radios.find((r) => r.name === 'previewMode' && r.value === 'desktop');
      if (desktopRadio) {
        desktopRadio.click();
        desktopRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await delay(200);

    // =============================================================
    // 5. TEST SAVE CHANGES & REFRESH PERSISTENCE
    // =============================================================
    console.log('--- 5. Testing Save Changes & Persistence Across Reload ---');
    // Click Save Changes
    await page.evaluate(() => {
      const saveBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Save Changes'));
      if (saveBtn) saveBtn.click();
    });
    await delay(600);

    // Hard Reload /widget
    await page.reload({ waitUntil: 'networkidle0' });
    await delay(500);

    const persistentData = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasGreeting = text.includes('WELCOME TO ARCO QA!');
      const hasIntro = text.includes('We are live and ready to assist your team immediately.');
      
      const previewDiv = document.querySelector('div.fixed.z-40');
      const isLeft = previewDiv && previewDiv.style.left && previewDiv.style.left.includes('61px');
      const isBottom = previewDiv && previewDiv.style.bottom && previewDiv.style.bottom.includes('71px');

      return hasGreeting && hasIntro && isLeft && isBottom;
    });

    results.saveAndFullPersistence = persistentData;
    console.log(`[Save & Full Persistence Across Reload]: ${results.saveAndFullPersistence ? '✅ PASS' : '❌ FAIL'}\n`);

    results.zeroConsoleErrors = consoleErrors.length === 0;
    console.log(`[Zero Console Errors]: ${results.zeroConsoleErrors ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // SUMMARY
    // =============================================================
    console.log('================================================================');
    console.log('📊 FINAL CUSTOMIZE INTERACTIVITY QA SUMMARY');
    console.log('================================================================');
    console.table(results);

    const allPassed = Object.values(results).every(Boolean);
    console.log(`\nCUSTOMIZE INTERACTIVITY RESULT: ${allPassed ? '🎉 100% PASS' : '❌ FAIL'}\n`);

    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('[Customize QA Error]:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

runCustomizeInteractivityQA();
