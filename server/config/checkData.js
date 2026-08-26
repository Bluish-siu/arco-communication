import { query } from './db.js';

async function check() {
  try {
    const tags = await query('SELECT DISTINCT tag FROM contacts');
    console.log('DISTINCT TAGS IN CONTACTS:', tags.rows.map(r => r.tag));

    const segs = await query('SELECT id, name, filter_type, conditions FROM segments');
    console.log('SAVED SEGMENTS IN DB:', segs.rows);

    const count = await query('SELECT COUNT(*) FROM contacts');
    console.log('TOTAL CONTACTS IN DB:', count.rows[0].count);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

check();
