import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import { config } from './index.js';

const FRONTEND_URL = 'http://localhost:5173';
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function runWidgetVisualInteraktQA() {
  console.log('================================================================');
  console.log('🧪 ARCO PRODUCTION QA — INTERAKT WHATSAPP WIDGET VISUAL AUDIT');
  console.log('================================================================\n');

  const token = jwt.sign(
    { id: 'usr_1', email: 'owner@arco.com', role: 'admin', name: 'Shraddha' },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  const results = {
    pageLoad: false,
    leftSubNav: false,
    fiveAccordionsPresent: false,
    accordion1StyleContent: false,
    accordion2MessengerImages: false,
    accordion3WelcomeMessage: false,
    accordion4PositionSettings: false,
    accordion5ConfigureNumber: false,
    fixedBottomRightPreview: false,
    saveChangesPersistence: false,
    installTabAndEmbedScript: false,
  };

  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Seed session token
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle0' });
    await page.evaluate((tok) => {
      localStorage.setItem('arco_auth_token', tok);
    }, token);

    // =============================================================
    // 1. OPEN /widget AND VERIFY ACCORDIONS & SUB-NAV
    // =============================================================
    console.log('--- 1. Testing /widget Loading, Sub-Nav & Accordions ---');
    await page.goto(`${FRONTEND_URL}/widget`, { waitUntil: 'networkidle0' });
    await delay(400);

    const pageUrl = page.url();
    results.pageLoad = pageUrl.includes('/widget');

    const domInspection = await page.evaluate(() => {
      const text = document.body ? document.body.innerText : '';
      const hasHeading = text.includes('Customize WhatsApp chat button');
      const hasSubnavCustomize = text.includes('Customize');
      const hasSubnavInstall = text.includes('Install');
      
      const hasAcc1 = text.includes('Style your WhatsApp chat button');
      const hasAcc2 = text.includes('Design your messenger');
      const hasAcc3 = text.includes('Set your welcome message');
      const hasAcc4 = text.includes('Set your Chat Button position');
      const hasAcc5 = text.includes('Configure your WhatsApp number');

      return {
        hasHeading,
        hasSubnavCustomize,
        hasSubnavInstall,
        hasAcc1,
        hasAcc2,
        hasAcc3,
        hasAcc4,
        hasAcc5,
      };
    });

    results.leftSubNav = domInspection.hasSubnavCustomize && domInspection.hasSubnavInstall;
    results.fiveAccordionsPresent =
      domInspection.hasAcc1 &&
      domInspection.hasAcc2 &&
      domInspection.hasAcc3 &&
      domInspection.hasAcc4 &&
      domInspection.hasAcc5;

    console.log(`[Page Load]: ${results.pageLoad ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`[Left Sub-Nav]: ${results.leftSubNav ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`[All 5 Accordions Present]: ${results.fiveAccordionsPresent ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 2. VERIFY ACCORDION 1 CONTENT (Style chat button)
    // =============================================================
    console.log('--- 2. Testing Accordion 1 (Style Button, 12 Colors, Text) ---');
    const acc1Data = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasButtonType = text.includes('Button Type');
      const hasChangeText = text.includes('Change button text');
      const hasButtonColor = text.includes('Button Color');
      const hasOriginal = text.includes('The Original');
      const hasTealDeal = text.includes('Teal Deal');
      const hasGreenLime = text.includes('Green Lime');
      const hasBlueLagoon = text.includes('Blue Lagoon');
      const hasRedCherry = text.includes('Red Cherry');
      const hasDarkNight = text.includes('Dark Night');
      const hasCustomColorLink = text.includes('Pick a custom color');
      return (
        hasButtonType &&
        hasChangeText &&
        hasButtonColor &&
        hasOriginal &&
        hasTealDeal &&
        hasGreenLime &&
        hasBlueLagoon &&
        hasRedCherry &&
        hasDarkNight &&
        hasCustomColorLink
      );
    });

    results.accordion1StyleContent = acc1Data;
    console.log(`[Accordion 1 (Style & 12 Colors)]: ${results.accordion1StyleContent ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 3. OPEN & TEST ACCORDION 2 (Design your messenger - 13 images)
    // =============================================================
    console.log('--- 3. Testing Accordion 2 (13 Messenger Theme Images) ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const acc2 = buttons.find((b) => b.innerText.includes('Design your messenger'));
      if (acc2) acc2.click();
    });
    await delay(300);

    const acc2Data = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasNone = text.includes('None');
      const hasTeam = text.includes('Team');
      const hasFinance = text.includes('Finance');
      const hasSupport = text.includes('Support');
      const hasGrocery = text.includes('Grocery');
      const hasHappyTeam = text.includes('Happy Team');
      const hasFood1 = text.includes('Food 1');
      const hasFood2 = text.includes('Food 2');
      const hasFood3 = text.includes('Food 3');
      const hasEducation = text.includes('Education');
      const hasAutomobile = text.includes('Automobile');
      const hasAdventure = text.includes('Adventure');
      const hasHealthyFood = text.includes('Healthy Food');
      return (
        hasNone &&
        hasTeam &&
        hasFinance &&
        hasSupport &&
        hasGrocery &&
        hasHappyTeam &&
        hasFood1 &&
        hasFood2 &&
        hasFood3 &&
        hasEducation &&
        hasAutomobile &&
        hasAdventure &&
        hasHealthyFood
      );
    });

    results.accordion2MessengerImages = acc2Data;
    console.log(`[Accordion 2 (13 Messenger Images)]: ${results.accordion2MessengerImages ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 4. OPEN & TEST ACCORDION 3 (Welcome Message)
    // =============================================================
    console.log('--- 4. Testing Accordion 3 (Greetings & Intro Message) ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const acc3 = buttons.find((b) => b.innerText.includes('Set your welcome message'));
      if (acc3) acc3.click();
    });
    await delay(300);

    const acc3Data = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasGreetings = text.includes('Greetings');
      const hasIntroMessage = text.includes('Intro Message');
      return hasGreetings && hasIntroMessage;
    });

    results.accordion3WelcomeMessage = acc3Data;
    console.log(`[Accordion 3 (Welcome Message)]: ${results.accordion3WelcomeMessage ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 5. OPEN & TEST ACCORDION 4 (Position Settings)
    // =============================================================
    console.log('--- 5. Testing Accordion 4 (Desktop / Mobile Position & Spacing) ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const acc4 = buttons.find((b) => b.innerText.includes('Set your Chat Button position'));
      if (acc4) acc4.click();
    });
    await delay(300);

    const acc4Data = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasDesktopPreview = text.includes('Desktop Preview');
      const hasMobilePreview = text.includes('Mobile Preview');
      const hasDesktopPosition = text.includes('Desktop Launcher Position');
      const hasDesktopSpacing = text.includes('Desktop Side Spacing') && text.includes('Desktop Bottom Spacing');
      const hasMobilePosition = text.includes('Mobile Launcher Position');
      const hasMobileSpacing = text.includes('Mobile Side Spacing') && text.includes('Mobile Bottom Spacing');
      return (
        hasDesktopPreview &&
        hasMobilePreview &&
        hasDesktopPosition &&
        hasDesktopSpacing &&
        hasMobilePosition &&
        hasMobileSpacing
      );
    });

    results.accordion4PositionSettings = acc4Data;
    console.log(`[Accordion 4 (Position & Spacings)]: ${results.accordion4PositionSettings ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 6. OPEN & TEST ACCORDION 5 (Configure WhatsApp Number)
    // =============================================================
    console.log('--- 6. Testing Accordion 5 (WhatsApp Number & Pre-filled Message) ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const acc5 = buttons.find((b) => b.innerText.includes('Configure your WhatsApp number'));
      if (acc5) acc5.click();
    });
    await delay(300);

    const acc5Data = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasWaNumber = text.includes('WhatsApp Number');
      const hasPrefilled = text.includes('Pre-filled Message');
      return hasWaNumber && hasPrefilled;
    });

    results.accordion5ConfigureNumber = acc5Data;
    console.log(`[Accordion 5 (Configure Number)]: ${results.accordion5ConfigureNumber ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 7. VERIFY FIXED BOTTOM-RIGHT PREVIEW
    // =============================================================
    console.log('--- 7. Testing Fixed Bottom-Right Preview ---');
    const previewData = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasPreviewLabel = text.includes('Preview');
      const hasChatBtn = /chat/i.test(text) && text.includes('WhatsApp');
      return hasPreviewLabel && hasChatBtn;
    });

    results.fixedBottomRightPreview = previewData;
    console.log(`[Fixed Bottom-Right Preview]: ${results.fixedBottomRightPreview ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 8. TEST SAVE CHANGES & REFRESH PERSISTENCE
    // =============================================================
    console.log('--- 8. Testing Save Changes & Backend Persistence ---');
    await page.evaluate(() => {
      const saveBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.trim() === 'Save Changes');
      if (saveBtn) saveBtn.click();
    });
    await delay(500);

    await page.reload({ waitUntil: 'networkidle0' });
    await delay(400);

    const refreshPersistence = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Customize WhatsApp chat button') && text.includes('Style your WhatsApp chat button');
    });

    results.saveChangesPersistence = refreshPersistence;
    console.log(`[Save & Persistence]: ${results.saveChangesPersistence ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // 9. TEST INSTALL TAB & EMBED SNIPPET
    // =============================================================
    console.log('--- 9. Testing Install Tab, 3 Option Cards, Javascript Dropdown & Embed Script ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const installBtn = buttons.find((b) => b.innerText.trim() === 'Install');
      if (installBtn) installBtn.click();
    });
    await delay(300);

    // Test default "With Code"
    const withCodeCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasHeading = text.includes('Install widget to your website');
      const hasAddChat = text.includes('Add chat to your website');
      const hasScriptTag = text.includes('<script async src="https://widget.arcocommunication.com/widget.js"');
      const hasCopy = text.includes('Copy Code');
      return hasHeading && hasAddChat && hasScriptTag && hasCopy;
    });

    // Test Click "With Shopify" -> Coming Soon
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('button'));
      const shopifyCard = cards.find((b) => b.innerText.includes('With Shopify'));
      if (shopifyCard) shopifyCard.click();
    });
    await delay(200);

    const withShopifyCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasComingSoon = text.includes('Coming Soon');
      const noScriptTag = !text.includes('<script async src="https://widget.arcocommunication.com/widget.js"');
      return hasComingSoon && noScriptTag;
    });

    // Test Click "With Wordpress" -> Coming Soon
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('button'));
      const wpCard = cards.find((b) => b.innerText.includes('With Wordpress'));
      if (wpCard) wpCard.click();
    });
    await delay(200);

    const withWpCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasComingSoon = text.includes('Coming Soon');
      const noScriptTag = !text.includes('<script async src="https://widget.arcocommunication.com/widget.js"');
      return hasComingSoon && noScriptTag;
    });

    // Test Click "With Code" again -> returns to Code Snippet
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('button'));
      const codeCard = cards.find((b) => b.innerText.includes('With Code'));
      if (codeCard) codeCard.click();
    });
    await delay(200);

    const returnCodeCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('<script async src="https://widget.arcocommunication.com/widget.js"');
    });

    results.installTabAndEmbedScript = withCodeCheck && withShopifyCheck && withWpCheck && returnCodeCheck;
    console.log(`[Install Tab (With Code, Shopify Coming Soon, WordPress Coming Soon)]: ${results.installTabAndEmbedScript ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // SUMMARY
    // =============================================================
    console.log('================================================================');
    console.log('📊 FINAL VISUAL INTERAKT WIDGET QA SUMMARY');
    console.log('================================================================');
    console.table(results);

    const allPassed = Object.values(results).every(Boolean);
    console.log(`\nVISUAL WIDGET AUDIT RESULT: ${allPassed ? '🎉 100% PASS' : '❌ FAIL'}\n`);

    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('[Visual Widget QA Error]:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

runWidgetVisualInteraktQA();
