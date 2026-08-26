import { query } from './db.js';

async function inspect() {
  try {
    const metaRes = await query('SELECT * FROM meta_integrations LIMIT 5');
    console.log('meta_integrations rows:', metaRes.rows);

    const intRes = await query('SELECT * FROM integrations LIMIT 5');
    console.log('integrations rows:', intRes.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

inspect();
