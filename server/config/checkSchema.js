import { pool } from './db.js';

async function inspect() {
  const r = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'contacts' ORDER BY ordinal_position");
  console.log('Contacts columns:', r.rows);

  const seg = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'segments'");
  console.log('Segments table exists:', seg.rows.length > 0);

  await pool.end();
}

inspect();
