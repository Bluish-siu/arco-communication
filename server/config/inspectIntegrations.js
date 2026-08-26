import { query } from './db.js';

async function inspectSettings() {
  const res = await query('SELECT * FROM settings');
  console.log('=== SETTINGS TABLE DATA ===');
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit(0);
}

inspectSettings();
