import { query } from './db.js';

async function inspectUsers() {
  console.log('=== USERS TABLE COLUMNS ===');
  const cols = await query(`
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    ORDER BY ordinal_position
  `);
  console.table(cols.rows);

  console.log('\n=== USERS TABLE INDEXES ===');
  const idx = await query(`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'users'
  `);
  console.table(idx.rows);

  console.log('\n=== USERS TABLE CONSTRAINTS ===');
  const constraints = await query(`
    SELECT conname, contype, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid = 'users'::regclass
  `);
  console.table(constraints.rows);

  process.exit(0);
}

inspectUsers();
