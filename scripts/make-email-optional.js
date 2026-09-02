import { query } from '../src/services/database.js';

async function migrate() {
  console.log('Running Aiven PostgreSQL schema update: Making email column OPTIONAL...');
  try {
    // Drop NOT NULL constraint on email column
    await query('ALTER TABLE members ALTER COLUMN email DROP NOT NULL;');
    console.log('✅ Successfully dropped NOT NULL constraint on members.email column in Aiven PostgreSQL!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to update PostgreSQL schema:', err.message);
    process.exit(1);
  }
}

migrate();
