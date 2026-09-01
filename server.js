// /home/caleb/Desktop/PROJECTS/KHC/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, pool } from './src/services/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// 1. HEALTH CHECK & DATABASE CONNECTION VERIFICATION
// ----------------------------------------------------
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await query('SELECT NOW() as current_time, current_database() as db_name');
    res.json({
      success: true,
      message: 'Successfully connected to Aiven PostgreSQL Database!',
      database: result.rows[0].db_name,
      timestamp: result.rows[0].current_time
    });
  } catch (error) {
    console.error('Database connection verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect to Aiven PostgreSQL Database',
      error: error.message
    });
  }
});

// ----------------------------------------------------
// 2. MEMBERS ENDPOINTS
// ----------------------------------------------------

// GET /api/members - Fetch all members
app.get('/api/members', async (req, res) => {
  try {
    const result = await query('SELECT * FROM members ORDER BY last_name ASC, first_name ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/members/:id - Fetch member by ID
app.get('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM members WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member record not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/members - Create new member
app.post('/api/members', async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      date_of_birth,
      join_date,
      status = 'Active',
      role = 'Member',
      photo_url = '',
      notes = ''
    } = req.body;

    const id = req.body.id || 'mem-' + Math.random().toString(36).substring(2, 10);
    const joinDate = join_date || new Date().toISOString().split('T')[0];

    const text = `
      INSERT INTO members (id, first_name, last_name, email, phone, address, date_of_birth, join_date, status, role, photo_url, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      id,
      first_name,
      last_name,
      email,
      phone || null,
      address || null,
      date_of_birth || null,
      joinDate,
      status,
      role,
      photo_url,
      notes
    ];

    const result = await query(text, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/members/:id - Update existing member
app.put('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      date_of_birth,
      join_date,
      status,
      role,
      photo_url,
      notes
    } = req.body;

    const text = `
      UPDATE members 
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          email = COALESCE($3, email),
          phone = COALESCE($4, phone),
          address = COALESCE($5, address),
          date_of_birth = COALESCE($6, date_of_birth),
          join_date = COALESCE($7, join_date),
          status = COALESCE($8, status),
          role = COALESCE($9, role),
          photo_url = COALESCE($10, photo_url),
          notes = COALESCE($11, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `;

    const values = [
      first_name,
      last_name,
      email,
      phone,
      address,
      date_of_birth,
      join_date,
      status,
      role,
      photo_url,
      notes,
      id
    ];

    const result = await query(text, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member record not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/members/:id - Delete member
app.delete('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM members WHERE id = $1', [id]);
    res.json({ success: true, message: 'Member record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// 3. GIVING ENDPOINTS
// ----------------------------------------------------

// GET /api/giving - Fetch giving records
app.get('/api/giving', async (req, res) => {
  try {
    const { member_id } = req.query;
    let text = `
      SELECT g.*, 
             json_build_object(
               'first_name', m.first_name, 
               'last_name', m.last_name, 
               'email', m.email
             ) as members
      FROM giving_records g
      LEFT JOIN members m ON g.member_id = m.id
    `;

    const values = [];
    if (member_id) {
      text += ` WHERE g.member_id = $1`;
      values.push(member_id);
    }
    text += ` ORDER BY g.date DESC`;

    const result = await query(text, values);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/giving - Record contribution
app.post('/api/giving', async (req, res) => {
  try {
    const { member_id, amount, date, category = 'Tithes', payment_method = 'Cash', notes = '' } = req.body;
    const id = req.body.id || 'rec-' + Math.random().toString(36).substring(2, 10);
    const giveDate = date || new Date().toISOString().split('T')[0];

    const text = `
      INSERT INTO giving_records (id, member_id, amount, date, category, payment_method, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await query(text, [id, member_id, amount, giveDate, category, payment_method, notes]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/giving/:id - Delete giving record
app.delete('/api/giving/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM giving_records WHERE id = $1', [id]);
    res.json({ success: true, message: 'Giving record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/giving/stats - Aggregate giving statistics
app.get('/api/giving/stats', async (req, res) => {
  try {
    const result = await query('SELECT amount, date, category FROM giving_records');
    const records = result.rows;

    const totalGiving = records.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const categoryTotals = {};
    records.forEach(r => {
      categoryTotals[r.category] = (categoryTotals[r.category] || 0) + parseFloat(r.amount);
    });

    const monthTotals = {};
    records.forEach(r => {
      const monthStr = (r.date instanceof Date ? r.date.toISOString() : String(r.date)).substring(0, 7);
      monthTotals[monthStr] = (monthTotals[monthStr] || 0) + parseFloat(r.amount);
    });

    const sortedMonths = Object.keys(monthTotals)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 6)
      .map(month => ({
        month: month,
        amount: monthTotals[month]
      }))
      .reverse();

    res.json({
      total: totalGiving,
      categoryBreakdown: categoryTotals,
      monthlyTrend: sortedMonths,
      averageTransaction: records.length ? totalGiving / records.length : 0,
      totalContributionsCount: records.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend build static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 KHC Backend Express API server running on http://localhost:${PORT}`);
  console.log(`📊 Aiven PostgreSQL DB health check: http://localhost:${PORT}/api/test-db`);
});
