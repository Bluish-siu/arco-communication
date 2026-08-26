import pg from 'pg';
const { Client } = pg;

const passwords = [
  'postgres',
  'admin',
  'root',
  '123456',
  '12345678',
  '1234',
  'password',
  'postgres18',
  'shraddha',
  'Shraddha',
  'Shraddha123',
  'Shraddha@123',
  'arco',
  'arcocomm',
  'saas',
  'pgadmin',
  'master',
];

async function test() {
  for (const pw of passwords) {
    const client = new Client({
      host: '127.0.0.1',
      port: 5432,
      user: 'postgres',
      password: pw,
      database: 'postgres',
    });

    try {
      await client.connect();
      console.log('SUCCESS! Password is:', pw);
      await client.end();
      return pw;
    } catch (e) {
      // console.log(`Failed for "${pw}":`, e.message);
    }
  }
  console.log('None of the common passwords matched.');
}

test();
