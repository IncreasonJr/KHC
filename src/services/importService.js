import apiFetch, { getApiUrl } from './api';

export const importService = {
  /**
   * Validate raw imported rows against database duplicates and schemas
   * @param {Array<Object>} rows 
   * @returns {Promise<Object>}
   */
  async validateFile(rows) {
    try {
      const res = await apiFetch('/api/members/import/validate', {
        method: 'POST',
        body: JSON.stringify({ rows })
      });
      if (!res.ok) throw new Error(`Validation HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[Import Service Warning]: Falling back to local validation:', err.message);
      const members = JSON.parse(localStorage.getItem('khc_mock_members') || '[]');
      const emails = new Set(members.map(m => (m.email || '').toLowerCase()));
      
      const validRows = [];
      const invalidRows = [];
      rows.forEach((r, idx) => {
        if (r.first_name && r.last_name) {
          validRows.push({ rowNum: idx + 1, data: { ...r, isDuplicateInDB: emails.has((r.email || '').toLowerCase()) } });
        } else {
          invalidRows.push({ rowNum: idx + 1, data: r, errors: ['Missing required fields'] });
        }
      });
      return {
        total: rows.length,
        validCount: validRows.length,
        invalidCount: invalidRows.length,
        validRows,
        invalidRows,
        errors: invalidRows.map(i => ({ rowNum: i.rowNum, email: i.data.email, error: i.errors.join(', ') }))
      };
    }
  },

  /**
   * Upload and process batch member rows
   * @param {Array<Object>} validRows 
   * @param {Object} options - { duplicateStrategy: 'skip' | 'update' }
   * @returns {Promise<Object>}
   */
  async uploadFile(validRows, options = { duplicateStrategy: 'update' }) {
    try {
      const res = await apiFetch('/api/members/import', {
        method: 'POST',
        body: JSON.stringify({ rows: validRows, duplicateStrategy: options.duplicateStrategy })
      });
      if (!res.ok) throw new Error(`Import HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[Import Service Warning]: Falling back to local storage import:', err.message);
      const members = JSON.parse(localStorage.getItem('khc_mock_members') || '[]');
      let inserted = 0;
      let updated = 0;

      validRows.forEach(item => {
        const row = item.data || item;
        const idx = members.findIndex(m => m.email.toLowerCase() === (row.email || '').toLowerCase());
        if (idx !== -1) {
          if (options.duplicateStrategy === 'update') {
            members[idx] = { ...members[idx], ...row, updated_at: new Date().toISOString() };
            updated++;
          }
        } else {
          members.push({ ...row, id: 'mem-' + Math.random().toString(36).substring(2, 10), created_at: new Date().toISOString() });
          inserted++;
        }
      });
      localStorage.setItem('khc_mock_members', JSON.stringify(members));
      return { success: true, total: validRows.length, inserted, updated, failed: 0, errors: [] };
    }
  },

  /**
   * Trigger CSV template download
   */
  downloadTemplate() {
    window.location.href = getApiUrl('/api/members/import/template');
  }
};

export default importService;
