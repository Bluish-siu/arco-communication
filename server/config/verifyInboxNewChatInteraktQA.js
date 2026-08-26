import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import { config } from './index.js';

const FRONTEND_URL = 'http://localhost:5173';
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function runInboxNewChatQA() {
  console.log('================================================================');
  console.log('🧪 ARCO QA — INBOX NEW CHAT -> NEW CONTACT -> DRAWER FLOW AUDIT');
  console.log('================================================================\n');

  const token = jwt.sign(
    { id: 'usr_1', email: 'owner@arco.com', role: 'admin', name: 'Shraddha' },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  const results = {
    step1_plusOpensAttachedPanel: false,
    step1_panelHasSearchAndNewContact: false,
    step1_xButtonClosesPanel: false,
    step2_newContactOpensCenteredModal: false,
    step2_modalFieldsAndDisabledStartChat: false,
    step2_quickContactChatCreation: false,
    step3_addMoreDetailsOpensRightDrawer: false,
    step3_drawerStructureAndBulkSection: false,
    step3_drawerIndividualCreationAndChat: false,
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
    // STEP 1: TEST + BUTTON OPENS ATTACHED NEW CHAT PANEL
    // =============================================================
    console.log('--- 1. Testing Step 1: + Button & Attached New Chat Panel ---');
    await page.goto(`${FRONTEND_URL}/inbox`, { waitUntil: 'networkidle0' });
    await delay(600);

    // Click floating + button
    await page.evaluate(() => {
      const plusBtn = document.querySelector('button[title="Start New Chat"]');
      if (plusBtn) plusBtn.click();
    });
    await delay(300);

    const panelCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasNewChat = text.includes('New Chat');
      const hasSearch = !!document.querySelector('input[placeholder*="Search by name or number"]');
      const hasNewContactBtn = Array.from(document.querySelectorAll('button')).some((b) =>
        b.innerText.includes('New Contact')
      );
      // Ensure NOT large centered modal with Start New Conversation
      const hasOldModal = text.includes('Start New Conversation');
      return {
        hasNewChat,
        hasSearch,
        hasNewContactBtn,
        noOldModal: !hasOldModal,
      };
    });

    results.step1_plusOpensAttachedPanel = panelCheck.hasNewChat && panelCheck.noOldModal;
    results.step1_panelHasSearchAndNewContact = panelCheck.hasSearch && panelCheck.hasNewContactBtn;

    console.log(`[+ Button Opens Attached New Chat Panel]: ${results.step1_plusOpensAttachedPanel ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`[Panel Has Search & + New Contact Button]: ${results.step1_panelHasSearchAndNewContact ? '✅ PASS' : '❌ FAIL'}`);

    // Test X closes panel
    await page.evaluate(() => {
      const plusBtn = document.querySelector('button[title="Start New Chat"]');
      if (plusBtn) plusBtn.click();
    });
    await delay(200);

    const panelClosed = await page.evaluate(() => {
      return !document.querySelector('input[placeholder*="Search by name or number"]');
    });
    results.step1_xButtonClosesPanel = panelClosed;
    console.log(`[X Button / Toggle Closes Panel]: ${results.step1_xButtonClosesPanel ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // STEP 2: TEST "+ NEW CONTACT" OPENS CENTERED MODAL
    // =============================================================
    console.log('--- 2. Testing Step 2: "+ New Contact" Centered Modal ---');
    // Open panel again
    await page.evaluate(() => {
      const plusBtn = document.querySelector('button[title="Start New Chat"]');
      if (plusBtn) plusBtn.click();
    });
    await delay(300);

    // Click "+ New Contact"
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('New Contact')
      );
      if (btn) btn.click();
    });
    await delay(300);

    const modalCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasNewContactHeading = text.includes('New Contact');
      const hasContactNumber = text.includes('Contact Number');
      const hasContactName = text.includes('Contact Name');
      const hasAddMoreDetails = text.includes('+ Add More Details');
      const startChatBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Start Chat')
      );
      const isStartChatDisabled = startChatBtn ? startChatBtn.disabled : false;
      return {
        hasNewContactHeading,
        hasContactNumber,
        hasContactName,
        hasAddMoreDetails,
        isStartChatDisabled,
      };
    });

    results.step2_newContactOpensCenteredModal = modalCheck.hasNewContactHeading && modalCheck.hasAddMoreDetails;
    results.step2_modalFieldsAndDisabledStartChat =
      modalCheck.hasContactNumber && modalCheck.hasContactName && modalCheck.isStartChatDisabled;

    console.log(`[Centered New Contact Modal Opens]: ${results.step2_newContactOpensCenteredModal ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`[Fields & Disabled Start Chat Button Validated]: ${results.step2_modalFieldsAndDisabledStartChat ? '✅ PASS' : '❌ FAIL'}`);

    // Fill Quick Contact and Start Chat
    const testPhone1 = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const testPhone2 = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

    await page.evaluate((phone) => {
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

      const phoneInput = document.querySelector('input[placeholder="98765 43210"]');
      const nameInput = document.querySelector('input[placeholder="e.g. Rahul Sharma"]');

      if (phoneInput) setNativeValue(phoneInput, phone);
      if (nameInput) setNativeValue(nameInput, 'Aarav Sharma');
    }, testPhone1);
    await delay(300);

    // Click Start Chat
    await page.evaluate(() => {
      const startChatBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Start Chat')
      );
      if (startChatBtn) startChatBtn.click();
    });
    await delay(600);

    const quickChatCreated = await page.evaluate((phone) => {
      const text = document.body.innerText;
      return text.includes('Aarav Sharma') && text.includes(phone);
    }, testPhone1);
    results.step2_quickContactChatCreation = quickChatCreated;
    console.log(`[Quick Contact Created & Chat Started]: ${results.step2_quickContactChatCreation ? '✅ PASS' : '❌ FAIL'}\n`);

    // =============================================================
    // STEP 3: TEST "+ ADD MORE DETAILS" -> RIGHT-SIDE DRAWER
    // =============================================================
    console.log('--- 3. Testing Step 3: "+ Add More Details" & Create Contacts Drawer ---');
    // Open panel -> click + New Contact
    await page.evaluate(() => {
      const plusBtn = document.querySelector('button[title="Start New Chat"]');
      if (plusBtn) plusBtn.click();
    });
    await delay(300);

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('New Contact')
      );
      if (btn) btn.click();
    });
    await delay(300);

    // Click "+ Add More Details"
    await page.evaluate(() => {
      const addMoreBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Add More Details')
      );
      if (addMoreBtn) addMoreBtn.click();
    });
    await delay(300);

    const drawerCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasCreateContacts = text.includes('Create Contacts');
      const hasChooseMethod = text.includes('Choose a Method to Create Contacts.');
      const hasManualRadio = text.includes('Manual');
      const hasAutomatedRadio = text.includes('Automated');
      const hasBulkUpload = text.includes('Create Contacts Via Bulk Upload');
      const hasDashedBox = text.includes('Select a CSV file to upload');
      const hasInstructions = text.includes('Instructions to upload CSV');
      const hasIndividual = text.includes('Create Contact Individually');
      const hasOpted = text.includes('WhatsApp Opted');
      const hasSubmit = Array.from(document.querySelectorAll('button')).some((b) =>
        b.innerText.includes('Submit')
      );

      return {
        hasCreateContacts,
        hasChooseMethod,
        hasManualRadio,
        hasAutomatedRadio,
        hasBulkUpload,
        hasDashedBox,
        hasInstructions,
        hasIndividual,
        hasOpted,
        hasSubmit,
      };
    });

    results.step3_addMoreDetailsOpensRightDrawer = drawerCheck.hasCreateContacts && drawerCheck.hasChooseMethod;
    results.step3_drawerStructureAndBulkSection =
      drawerCheck.hasBulkUpload && drawerCheck.hasDashedBox && drawerCheck.hasInstructions && drawerCheck.hasIndividual;

    console.log(`[+ Add More Details Opens Right-Side Drawer]: ${results.step3_addMoreDetailsOpensRightDrawer ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`[Drawer Bulk Upload & Form Structure Validated]: ${results.step3_drawerStructureAndBulkSection ? '✅ PASS' : '❌ FAIL'}`);

    // Fill Individual Form in Drawer
    await page.evaluate((phone) => {
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

      const nameInput = document.querySelector('input[placeholder="e.g. Rahul Sharma"]');
      const phoneInput = document.querySelector('input[placeholder="9876543210"]');
      const emailInput = document.querySelector('input[placeholder="e.g. rahul@example.com"]');
      const dealInput = document.querySelector('input[placeholder="e.g. 15000"]');

      if (nameInput) setNativeValue(nameInput, 'Divya Kapoor');
      if (phoneInput) setNativeValue(phoneInput, phone);
      if (emailInput) setNativeValue(emailInput, 'divya.kapoor@example.com');
      if (dealInput) setNativeValue(dealInput, '25000');
    }, testPhone2);
    await delay(300);

    // Submit Drawer Form
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.trim() === 'Submit'
      );
      if (submitBtn) submitBtn.click();
    });
    await delay(600);

    const drawerCreatedChat = await page.evaluate((phone) => {
      const text = document.body.innerText;
      return text.includes('Divya Kapoor') && text.includes(phone);
    }, testPhone2);

    results.step3_drawerIndividualCreationAndChat = drawerCreatedChat;
    console.log(`[Drawer Contact Created & Live Chat Started]: ${results.step3_drawerIndividualCreationAndChat ? '✅ PASS' : '❌ FAIL'}\n`);

    results.zeroConsoleErrors = consoleErrors.length === 0;
    console.log(`[Zero Console Errors]: ${results.zeroConsoleErrors ? '✅ PASS' : '❌ FAIL'}`);
    if (consoleErrors.length > 0) {
      console.log('Detected Console Errors:', consoleErrors);
    }
    console.log('\n');

    // =============================================================
    // SUMMARY
    // =============================================================
    console.log('================================================================');
    console.log('📊 FINAL INBOX NEW CHAT FLOW QA SUMMARY');
    console.log('================================================================');
    console.table(results);

    const allPassed = Object.values(results).every(Boolean);
    console.log(`\nINBOX NEW CHAT RESULT: ${allPassed ? '🎉 100% PASS' : '❌ FAIL'}\n`);

    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('[Inbox New Chat QA Error]:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

runInboxNewChatQA();
