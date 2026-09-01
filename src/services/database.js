// /home/caleb/Desktop/PROJECTS/KHC/src/services/database.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Clean URL for pg pool while enforcing SSL rejectUnauthorized: false for Aiven
const rawUrl = process.env.DATABASE_URL || '';
const connectionString = rawUrl.split('?')[0];

export const pool = new pg.Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL pool client:', err.message);
});

export const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[PostgreSQL DB] Executed query in ${duration}ms | Rows returned: ${res.rowCount}`);
    }
    return res;
  } catch (error) {
    console.error('[PostgreSQL DB Error]:', error.message);
    throw error;
  }
};

export default { query, pool };
