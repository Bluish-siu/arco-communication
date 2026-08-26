import { pool } from './db.js';

async function check() {
  const r = await pool.query('SELECT id, name, buttons, typeof_buttons FROM (SELECT id, name, buttons, pg_typeof(buttons) as typeof_buttons FROM campaign_templates) s LIMIT 3');
  console.log('Query result:', r.rows);
  console.log('JS type:', typeof r.rows[0].buttons, 'Value:', r.rows[0].buttons, 'IsArray:', Array.isArray(r.rows[0].buttons));
  await pool.end();
}

check();
