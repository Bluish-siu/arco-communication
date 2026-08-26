import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import { config } from './index.js';

async function debugDom() {
  const token = jwt.sign({ id: 'usr_test_a', email: 'owner@arco.com', role: 'admin' }, config.jwtSecret);
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/login');
  await page.evaluate((t) => localStorage.setItem('arco_auth_token', t), token);

  await page.goto('http://localhost:5173/integrations', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  const text = await page.evaluate(() => document.body.innerText);
  console.log('--- BODY TEXT ---');
  console.log(text);
  await browser.close();
  process.exit(0);
}

debugDom();
