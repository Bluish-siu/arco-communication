import pg from 'pg';
const { Client } = pg;

async function check() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'postgres',
  });

  try {
    await client.connect();
    console.log('Connected with blank password');
    await client.end();
  } catch (err) {
    console.log('Error for 127.0.0.1:5432 user postgres:', err.message, 'code:', err.code);
  }
}

check();
