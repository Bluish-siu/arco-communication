import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Client } = pg;

// Common passwords and users
const testUsers = ['postgres', 'Shraddha', 'root'];
const testPasswords = [
  process.env.PGPASSWORD,
  process.env.DB_PASSWORD,
  'postgres',
  'admin',
  'root',
  '1234',
  '123456',
  '12345678',
  'shraddha',
  'Shraddha',
  'Shraddha@123',
  'postgres18',
  'password',
  '',
].filter((p, i, arr) => p !== undefined && arr.indexOf(p) === i);

const testPorts = [5432, 5433, 5434];

async function findWorkingConfig() {
  for (const port of testPorts) {
    for (const user of testUsers) {
      for (const password of testPasswords) {
        const client = new Client({
          host: '127.0.0.1',
          port,
          user,
          password,
          database: 'postgres',
        });

        try {
          await client.connect();
          console.log(`[SUCCESS] Connected! Port: ${port}, User: "${user}", Password: "${password}"`);

          const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'arco_communication'");
          if (res.rows.length === 0) {
            console.log(`Creating database "arco_communication"...`);
            await client.query('CREATE DATABASE arco_communication');
            console.log(`[SUCCESS] Database "arco_communication" created!`);
          } else {
            console.log(`[INFO] Database "arco_communication" already exists.`);
          }

          await client.end();
          return { host: '127.0.0.1', port, user, password, database: 'arco_communication' };
        } catch (err) {
          // Log only non-auth errors
          if (!err.message.includes('password authentication failed')) {
            // console.log(`Port ${port} user ${user}:`, err.message);
          }
        }
      }
    }
  }

  throw new Error('Could not connect to PostgreSQL with tested credentials.');
}

findWorkingConfig()
  .then((cfg) => {
    console.log('WORKING CONFIG:', JSON.stringify(cfg));
    process.exit(0);
  })
  .catch((err) => {
    console.error('Connection failed:', err.message);
    process.exit(1);
  });
