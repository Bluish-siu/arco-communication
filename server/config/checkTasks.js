import { query } from './db.js';

async function checkTasks() {
  try {
    const res = await query('SELECT * FROM tasks');
    console.log(`TOTAL TASKS IN DB: ${res.rows.length}`);
    console.log(res.rows.slice(0, 5));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkTasks();
