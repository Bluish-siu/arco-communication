import { query } from './db.js';

async function checkTables() {
  try {
    const res = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const results = [];
    for (const r of res.rows) {
      const tableName = r.table_name;
      try {
        const countRes = await query(`SELECT count(*) FROM "${tableName}"`);
        results.push({ table: tableName, rowCount: parseInt(countRes.rows[0].count, 10) });
      } catch (err) {
        results.push({ table: tableName, rowCount: 'error: ' + err.message });
      }
    }
    console.log('=== POSTGRESQL TABLES & ROW COUNTS ===');
    console.table(results);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkTables();
