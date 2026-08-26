import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import { config } from './index.js';

const FRONTEND_URL = 'http://localhost:5173';
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function verifySidebarIntegrations() {
  console.log('================================================================');
  console.log('🧪 VERIFYING DIRECT INTEGRATIONS SIDEBAR NAVIGATION');
  console.log('================================================================\n');

  const token = jwt.sign(
    { id: 'usr_1', email: 'owner@arco.com', role: 'admin', name: 'Shraddha' },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Seed token
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle0' });
    await page.evaluate((tok) => {
      localStorage.setItem('arco_auth_token', tok);
    }, token);

    // 1. Open Dashboard
    await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'networkidle0' });
    await delay(400);

    // Hover to expand sidebar
    await page.hover('aside');
    await delay(300);

    // Check sidebar content before click
    const sidebarItemsBefore = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      const text = aside ? aside.innerText : '';
      return {
        hasIntegrations: text.includes('Integrations'),
        hasAllIntegrationsSubmenu: text.includes('All Integrations'),
        hasShopifySubmenu: text.includes('Shopify Store Sync') || text.includes('Shopify Sales Channel'),
        hasApisWebhooksSubmenu: text.includes('APIs & Webhooks'),
      };
    });

    console.log('[Sidebar item "Integrations" present]:', sidebarItemsBefore.hasIntegrations ? '✅ PASS' : '❌ FAIL');
    console.log('[Submenu "All Integrations" removed]:', !sidebarItemsBefore.hasAllIntegrationsSubmenu ? '✅ PASS' : '❌ FAIL');
    console.log('[Submenu "Shopify Sales Channel" removed]:', !sidebarItemsBefore.hasShopifySubmenu ? '✅ PASS' : '❌ FAIL');
    console.log('[Submenu "APIs & Webhooks" removed]:', !sidebarItemsBefore.hasApisWebhooksSubmenu ? '✅ PASS' : '❌ FAIL');

    // 2. Click "Integrations" in the sidebar
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('aside a'));
      const integLink = links.find((l) => l.innerText.trim() === 'Integrations' || l.href.includes('/integrations'));
      if (integLink) integLink.click();
    });

    await delay(600);

    const currentUrl = page.url();
    const isDirectNavPass = currentUrl.includes('/integrations');
    console.log('[Direct navigation to /integrations]:', isDirectNavPass ? '✅ PASS' : '❌ FAIL', `(URL: ${currentUrl})`);

    // 3. Verify /integrations page content
    const pageContent = await page.evaluate(() => {
      const text = document.body ? document.body.innerText : '';
      return {
        hasHeading: text.includes('Integrations'),
        hasShopifyCard: text.includes('Shopify Sales Channel'),
        hasEcommerce: /e-commerce platform/i.test(text),
        hasConnectBtn: text.includes('Connect'),
      };
    });

    console.log('[/integrations page rendered]:', pageContent.hasHeading ? '✅ PASS' : '❌ FAIL');
    console.log('[Shopify Sales Channel present on page]:', pageContent.hasShopifyCard ? '✅ PASS' : '❌ FAIL');

    // 4. Verify Active Selected State on Integrations item
    await page.hover('aside');
    await delay(200);

    const activeStatePass = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      if (!aside) return false;
      const activeLink = aside.querySelector('a[href="/integrations"]');
      if (!activeLink) return false;
      const parentDiv = activeLink.closest('div');
      return (
        parentDiv?.className?.includes('text-red-600') ||
        parentDiv?.className?.includes('bg-red-50') ||
        activeLink.className?.includes('text-red-600')
      );
    });

    console.log('[Active sidebar highlight on /integrations]:', activeStatePass ? '✅ PASS' : '❌ FAIL');

    const allPassed =
      sidebarItemsBefore.hasIntegrations &&
      !sidebarItemsBefore.hasAllIntegrationsSubmenu &&
      !sidebarItemsBefore.hasShopifySubmenu &&
      !sidebarItemsBefore.hasApisWebhooksSubmenu &&
      isDirectNavPass &&
      pageContent.hasHeading &&
      pageContent.hasShopifyCard &&
      activeStatePass;

    console.log(`\nOVERALL DIRECT NAVIGATION TEST: ${allPassed ? '🎉 100% PASS' : '❌ FAIL'}\n`);
    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('[Verification Error]:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

verifySidebarIntegrations();
