// /home/caleb/Desktop/PROJECTS/KHC/scripts/update-schema.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, pool } from '../src/services/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyIndexes() {
  console.log('⚡ Applying performance indexes to Aiven PostgreSQL...');
  try {
    const updatePath = path.join(__dirname, '../schema_update.sql');
    const sql = fs.readFileSync(updatePath, 'utf8');

    await query(sql);
    console.log('✅ Successfully applied indexes for member search and monthly giving queries!');
  } catch (error) {
    console.error('❌ Schema update error:', error.message);
  } finally {
    await pool.end();
  }
}

applyIndexes();
