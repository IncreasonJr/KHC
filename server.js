// /home/caleb/Desktop/PROJECTS/KHC/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './src/services/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
// 2. MEMBER IMPORT & TEMPLATE ENDPOINTS (MUST BE BEFORE /api/members/:id)
// ----------------------------------------------------

// GET /api/members/import/template - Download sample CSV template
app.get('/api/members/import/template', (req, res) => {
  const headers = 'first_name,last_name,email,phone,address,date_of_birth,join_date,status,role,notes\n';
  const sample1 = 'Kwame,Mensah,kwame.m@example.com,024 123 4567,12 Airport Residential,1992-05-14,2024-01-10,Active,Member,Joined choir ministry\n';
  const sample2 = 'Abena,Osei,abena.o@example.com,020 987 6543,45 East Legon,1988-11-20,2023-06-15,Active,Ministry Leader,Worship team leader\n';
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=khc_members_template.csv');
  res.status(200).send(headers + sample1 + sample2);
});

// POST /api/members/import/validate - Preview validation before bulk import
app.post('/api/members/import/validate', async (req, res) => {
  try {
    const { rows = [] } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'No member rows provided for validation.' });
    }

    const existingDB = await query('SELECT email, phone FROM members');
    const existingEmails = new Set(existingDB.rows.map(m => (m.email || '').toLowerCase().trim()).filter(Boolean));
    const existingPhones = new Set(existingDB.rows.map(m => (m.phone || '').replace(/\s+/g, '')).filter(Boolean));

    const validRows = [];
    const invalidRows = [];
    const errors = [];
    const seenEmails = new Set();
    const seenPhones = new Set();

    rows.forEach((rawRow, index) => {
      const rowNum = index + 1;
      const first_name = rawRow.first_name || rawRow.firstname || '';
      const last_name = rawRow.last_name || rawRow.lastname || rawRow.surname || '';
      const email = (rawRow.email || rawRow.email_address || '').trim();
      const phone = (rawRow.phone || rawRow.phone_number || rawRow.mobile || '').trim();

      const rowErrors = [];
      if (!first_name) rowErrors.push('First name missing.');
      if (!last_name) rowErrors.push('Last name missing.');
      if (!email) {
        rowErrors.push('Email missing.');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        rowErrors.push('Invalid email format.');
      }

      if (email && seenEmails.has(email.toLowerCase())) {
        rowErrors.push('Duplicate email in file.');
      } else if (email) {
        seenEmails.add(email.toLowerCase());
      }

      const phoneKey = phone.replace(/\s+/g, '');
      if (phoneKey && seenPhones.has(phoneKey)) {
        rowErrors.push('Duplicate phone in file.');
      } else if (phoneKey) {
        seenPhones.add(phoneKey);
      }

      const isDuplicateInDB = (email && existingEmails.has(email.toLowerCase())) || (phoneKey && existingPhones.has(phoneKey));

      const normalized = {
        first_name,
        last_name,
        email,
        phone,
        address: rawRow.address || rawRow.home_address || '',
        date_of_birth: rawRow.date_of_birth || rawRow.dob || null,
        join_date: rawRow.join_date || new Date().toISOString().split('T')[0],
        status: rawRow.status || 'Active',
        role: rawRow.role || 'Member',
        notes: rawRow.notes || '',
        isDuplicateInDB
      };

      if (rowErrors.length > 0) {
        invalidRows.push({ rowNum, data: normalized, errors: rowErrors });
        errors.push({ rowNum, email, error: rowErrors.join(' ') });
      } else {
        validRows.push({ rowNum, data: normalized });
      }
    });

    res.json({
      total: rows.length,
      validCount: validRows.length,
      invalidCount: invalidRows.length,
      validRows,
      invalidRows,
      errors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/members/import - Perform batch member import
app.post('/api/members/import', async (req, res) => {
  try {
    const { rows = [], duplicateStrategy = 'update' } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'No valid rows provided for import.' });
    }

    let inserted = 0;
    let updated = 0;
    let failed = 0;
    const errors = [];

    // Batch chunk size of 100
    const chunkSize = 100;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);

      for (const item of chunk) {
        const row = item.data || item;
        const id = row.id || 'mem-' + Math.random().toString(36).substring(2, 10);
        const joinDate = row.join_date || new Date().toISOString().split('T')[0];

        try {
          if (duplicateStrategy === 'update') {
            const sql = `
              INSERT INTO members (id, first_name, last_name, email, phone, address, date_of_birth, join_date, status, role, notes)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
              ON CONFLICT (email) DO UPDATE SET
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                phone = EXCLUDED.phone,
                address = EXCLUDED.address,
                date_of_birth = EXCLUDED.date_of_birth,
                status = EXCLUDED.status,
                role = EXCLUDED.role,
                notes = EXCLUDED.notes,
                updated_at = CURRENT_TIMESTAMP
              RETURNING (xmax = 0) AS is_inserted;
            `;
            const result = await query(sql, [
              id,
              row.first_name,
              row.last_name,
              row.email,
              row.phone || null,
              row.address || null,
              row.date_of_birth || null,
              joinDate,
              row.status || 'Active',
              row.role || 'Member',
              row.notes || ''
            ]);

            if (result.rows[0].is_inserted) {
              inserted++;
            } else {
              updated++;
            }
          } else {
            // Skip duplicate Strategy
            const sql = `
              INSERT INTO members (id, first_name, last_name, email, phone, address, date_of_birth, join_date, status, role, notes)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
              ON CONFLICT (email) DO NOTHING
              RETURNING *;
            `;
            const result = await query(sql, [
              id,
              row.first_name,
              row.last_name,
              row.email,
              row.phone || null,
              row.address || null,
              row.date_of_birth || null,
              joinDate,
              row.status || 'Active',
              row.role || 'Member',
              row.notes || ''
            ]);

            if (result.rows.length > 0) {
              inserted++;
            } else {
              updated++; // Skipped duplicate counted in updated/processed
            }
          }
        } catch (err) {
          failed++;
          errors.push({ email: row.email, error: err.message });
        }
      }
    }

    res.json({
      success: true,
      total: rows.length,
      inserted,
      updated,
      failed,
      errors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// 3. CORE MEMBERS ENDPOINTS
// ----------------------------------------------------

// GET /api/members/stats - Member stats summary
app.get('/api/members/stats', async (req, res) => {
  try {
    const sql = `
      SELECT 
        COUNT(*) as total_members,
        COUNT(*) FILTER (WHERE status = 'Active') as active_members,
        COUNT(*) FILTER (WHERE status = 'Visitor') as visitors,
        COUNT(*) FILTER (WHERE role != 'Member') as ministry_leaders
      FROM members;
    `;
    const result = await query(sql);
    const row = result.rows[0] || {};

    res.json({
      totalMembers: parseInt(row.total_members || 0),
      activeMembers: parseInt(row.active_members || 0),
      visitors: parseInt(row.visitors || 0),
      ministryLeaders: parseInt(row.ministry_leaders || 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/members - Fetch all members
app.get('/api/members', async (req, res) => {
  try {
    const result = await query('SELECT * FROM members ORDER BY last_name ASC, first_name ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/members/:id/giving/monthly - Monthly breakdown by year
app.get('/api/members/:id/giving/monthly', async (req, res) => {
  try {
    const { id } = req.params;
    const year = parseInt(req.query.year || new Date().getFullYear());

    const sql = `
      SELECT 
        EXTRACT(MONTH FROM date) as month_num,
        category,
        SUM(amount) as total_amount,
        COUNT(*) as tx_count
      FROM giving_records
      WHERE member_id = $1 AND EXTRACT(YEAR FROM date) = $2
      GROUP BY month_num, category
      ORDER BY month_num ASC;
    `;

    const result = await query(sql, [id, year]);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthlyMap = {};
    monthNames.forEach((name, i) => {
      monthlyMap[i + 1] = {
        month: name,
        monthNumber: i + 1,
        tithe: 0,
        welfare: 0,
        total: 0,
        transactionCount: 0
      };
    });

    let ytdTithe = 0;
    let ytdWelfare = 0;

    result.rows.forEach(r => {
      const mNum = parseInt(r.month_num);
      const amt = parseFloat(r.total_amount);
      const count = parseInt(r.tx_count);
      const cat = (r.category || '').toLowerCase();

      if (monthlyMap[mNum]) {
        monthlyMap[mNum].transactionCount += count;
        monthlyMap[mNum].total += amt;

        if (cat.includes('tithe')) {
          monthlyMap[mNum].tithe += amt;
          ytdTithe += amt;
        } else {
          monthlyMap[mNum].welfare += amt;
          ytdWelfare += amt;
        }
      }
    });

    const monthlyGiving = Object.values(monthlyMap);

    res.json({
      memberId: id,
      year: year,
      monthlyGiving,
      yearToDate: {
        tithe: ytdTithe,
        welfare: ytdWelfare,
        total: ytdTithe + ytdWelfare
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/members/:id/giving/summary - Member giving quick summary cards
app.get('/api/members/:id/giving/summary', async (req, res) => {
  try {
    const { id } = req.params;
    const currentYear = new Date().getFullYear();

    const sql = `
      SELECT amount, date, category 
      FROM giving_records 
      WHERE member_id = $1 
      ORDER BY date DESC;
    `;

    const result = await query(sql, [id]);
    const records = result.rows;

    let totalTithes = 0;
    let totalWelfare = 0;
    let thisYearTithes = 0;
    let thisYearWelfare = 0;
    let lastGivingDate = null;
    const activeMonths = new Set();

    records.forEach(r => {
      const amt = parseFloat(r.amount);
      const rDate = new Date(r.date);
      const rYear = rDate.getFullYear();
      const monthKey = r.date.toString().substring(0, 7);
      const cat = (r.category || '').toLowerCase();

      activeMonths.add(monthKey);

      if (!lastGivingDate) {
        lastGivingDate = r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date).split('T')[0];
      }

      if (cat.includes('tithe')) {
        totalTithes += amt;
        if (rYear === currentYear) thisYearTithes += amt;
      } else {
        totalWelfare += amt;
        if (rYear === currentYear) thisYearWelfare += amt;
      }
    });

    const totalGiving = totalTithes + totalWelfare;
    const averageMonthly = activeMonths.size > 0 ? totalGiving / activeMonths.size : 0;

    res.json({
      totalTithes,
      totalWelfare,
      lastGivingDate,
      totalGiving,
      averageMonthly,
      thisYearTithes,
      thisYearWelfare
    });
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
          photo_url = CASE WHEN $10 IS NOT NULL AND $10 != '' THEN $10 ELSE photo_url END,
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
// 4. GIVING ENDPOINTS
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
