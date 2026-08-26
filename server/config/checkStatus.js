import { query } from './db.js';

async function checkStatus() {
  try {
    const statuses = await query('SELECT DISTINCT status, COUNT(*) FROM contacts GROUP BY status');
    console.log('STATUSES IN DB:', statuses.rows);

    const stages = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'contacts'
    `);
    console.log('CONTACTS COLUMNS:', stages.rows.map(r => r.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkStatus();
