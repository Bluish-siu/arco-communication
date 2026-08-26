import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import { config } from './index.js';

async function printErrors() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const token = jwt.sign({ id: 'usr_1', email: 'owner@arco.com', role: 'admin' }, config.jwtSecret);

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('Console Error:', msg.text());
    }
  });

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.evaluate((t) => localStorage.setItem('arco_auth_token', t), token);

  console.log('Navigating to overview...');
  await page.goto('http://localhost:5173/analytics/overview', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  console.log('Navigating to agent-performance...');
  await page.goto('http://localhost:5173/analytics/agent-performance', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  console.log('Navigating to ad-performance...');
  await page.goto('http://localhost:5173/analytics/ad-performance', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  await browser.close();
  process.exit(0);
}

printErrors();
