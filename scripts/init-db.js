// /home/caleb/Desktop/PROJECTS/KHC/scripts/init-db.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, pool } from '../src/services/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  console.log('⚡ Initializing Aiven PostgreSQL schema and seed data...');
  try {
    const schemaPath = path.join(__dirname, '../schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    await query(sql);
    console.log('✅ Successfully created members and giving_records tables in Aiven PostgreSQL!');
    
    const memberCount = await query('SELECT COUNT(*) FROM members');
    const givingCount = await query('SELECT COUNT(*) FROM giving_records');
    
    console.log(`📊 Current Aiven Database Records:`);
    console.log(`   - Members: ${memberCount.rows[0].count}`);
    console.log(`   - Giving Records: ${givingCount.rows[0].count}`);
  } catch (error) {
    console.error('❌ Database schema initialization error:', error.message);
  } finally {
    await pool.end();
  }
}

initDatabase();
