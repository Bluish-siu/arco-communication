import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// PostgreSQL Connection Pool
const isLocalDb = (urlStr) => {
  if (!urlStr) return true;
  return urlStr.includes('localhost') || urlStr.includes('127.0.0.1');
};

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' || (!isLocalDb(process.env.DATABASE_URL) && process.env.DB_SSL !== 'false')
        ? { rejectUnauthorized: false }
        : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '2004',
      database: process.env.DB_NAME || 'arco_communication',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]:', err.message);
});

// Test connection
export const testDbConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() as current_time, current_database() as db_name, version()');
    console.log(`[PostgreSQL 18 Connected] DB: "${res.rows[0].db_name}", Time: ${res.rows[0].current_time}`);
    return true;
  } catch (error) {
    console.error('[PostgreSQL Connection Failed]:', error.message);
    return false;
  }
};

// Database Query Helpers
export const query = (text, params) => pool.query(text, params);

export const db = {
  // Execute raw query
  query: (text, params) => pool.query(text, params),

  // Get all rows
  getAll: async (table, whereClause = '', params = []) => {
    try {
      const sql = `SELECT * FROM ${table} ${whereClause ? `WHERE ${whereClause}` : ''} ORDER BY created_at DESC`;
      const res = await pool.query(sql, params);
      return res.rows;
    } catch (err) {
      console.error(`Error querying ${table}:`, err.message);
      return [];
    }
  },

  // Find one row
  findOne: async (table, whereClause, params = []) => {
    try {
      const sql = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`;
      const res = await pool.query(sql, params);
      return res.rows[0] || null;
    } catch (err) {
      console.error(`Error querying one from ${table}:`, err.message);
      return null;
    }
  },

  // Insert row
  insert: async (table, data) => {
    try {
      const keys = Object.keys(data);
      const values = keys.map((k) => (typeof data[k] === 'object' && data[k] !== null ? JSON.stringify(data[k]) : data[k]));
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const columns = keys.map((k) => k.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)).join(', ');

      const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
      const res = await pool.query(sql, values);
      return res.rows[0];
    } catch (err) {
      console.error(`Error inserting into ${table}:`, err.message);
      throw err;
    }
  },

  // Update row
  update: async (table, id, data) => {
    try {
      const keys = Object.keys(data).filter((k) => k !== 'id' && k !== 'updated_at' && k !== 'updatedAt');
      if (keys.length === 0) return null;

      const setClause = keys
        .map((k, i) => `${k.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)} = $${i + 1}`)
        .join(', ');
      const values = keys.map((k) => (typeof data[k] === 'object' && data[k] !== null ? JSON.stringify(data[k]) : data[k]));

      const sql = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length + 1} RETURNING *`;
      const res = await pool.query(sql, [...values, id]);
      return res.rows[0] || null;
    } catch (err) {
      console.error(`Error updating ${table}:`, err.message);
      throw err;
    }
  },

  // Delete row
  delete: async (table, id) => {
    try {
      const res = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
      return (res.rowCount || 0) > 0;
    } catch (err) {
      console.error(`Error deleting from ${table}:`, err.message);
      return false;
    }
  },

  // Get JSON Object table (integrations, analytics, settings)
  getObject: async (table, id = 'main') => {
    try {
      const res = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
      if (res.rows[0]) {
        return res.rows[0].config || res.rows[0].metrics || res.rows[0];
      }
      return {};
    } catch (err) {
      console.error(`Error getting object from ${table}:`, err.message);
      return {};
    }
  },

  // Update JSON Object table
  updateObject: async (table, updates, id = 'main') => {
    try {
      const existing = await db.getObject(table, id);
      const merged = { ...existing, ...updates };
      const column = table === 'analytics' ? 'metrics' : 'config';

      const res = await pool.query(
        `INSERT INTO ${table} (id, ${column}, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET ${column} = EXCLUDED.${column}, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [id, JSON.stringify(merged)]
      );
      return merged;
    } catch (err) {
      console.error(`Error updating object in ${table}:`, err.message);
      throw err;
    }
  },
};
