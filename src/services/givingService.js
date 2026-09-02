import getApiUrl from './api';

const MOCK_GIVING = [
  {
    id: 'rec-1',
    member_id: 'elijah-manning-1111',
    amount: 500.00,
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days ago
    category: 'Tithes',
    payment_method: 'Bank Transfer',
    notes: 'Monthly tithe'
  },
  {
    id: 'rec-2',
    member_id: 'elijah-manning-1111',
    amount: 100.00,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
    category: 'Missions',
    payment_method: 'Online',
    notes: 'Support for overseas mission trips'
  },
  {
    id: 'rec-3',
    member_id: 'sarah-jenkins-2222',
    amount: 250.00,
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 days ago
    category: 'Tithes',
    payment_method: 'Online',
    notes: 'Worship leader tithe'
  },
  {
    id: 'rec-4',
    member_id: 'david-koffi-3333',
    amount: 1000.00,
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 days ago
    category: 'Building Fund',
    payment_method: 'Check',
    notes: 'Sanctuary remodeling donation'
  },
  {
    id: 'rec-5',
    member_id: 'hannah-peterson-4444',
    amount: 50.00,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
    category: 'Offering',
    payment_method: 'Cash',
    notes: 'Sunday morning offering'
  }
];

const getMockGiving = () => {
  const data = localStorage.getItem('khc_mock_giving');
  if (!data) {
    localStorage.setItem('khc_mock_giving', JSON.stringify(MOCK_GIVING));
    return MOCK_GIVING;
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to parse mock giving records from localStorage, resetting database:', err);
    localStorage.setItem('khc_mock_giving', JSON.stringify(MOCK_GIVING));
    return MOCK_GIVING;
  }
};

const saveMockGiving = (giving) => {
  localStorage.setItem('khc_mock_giving', JSON.stringify(giving));
};

export const givingService = {
  // Fetch giving records, optionally filtered by member
  async getGivingRecords(memberId = null) {
    try {
      const url = memberId ? getApiUrl(`/api/giving?member_id=${encodeURIComponent(memberId)}`) : getApiUrl('/api/giving');
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[PostgreSQL DB Warning]: Falling back to local storage for getGivingRecords:', err.message);
      const giving = getMockGiving();
      const members = JSON.parse(localStorage.getItem('khc_mock_members') || '[]');
      
      const hydrated = giving.map(g => {
        const mem = members.find(m => m.id === g.member_id);
        return {
          ...g,
          members: mem ? { first_name: mem.first_name, last_name: mem.last_name, email: mem.email } : null
        };
      });

      if (memberId) {
        return hydrated.filter(g => g.member_id === memberId).sort((a, b) => b.date.localeCompare(a.date));
      }
      return hydrated.sort((a, b) => b.date.localeCompare(a.date));
    }
  },

  // Fetch monthly giving breakdown for member
  async getMonthlyGiving(memberId, year = new Date().getFullYear()) {
    try {
      const res = await fetch(getApiUrl(`/api/members/${memberId}/giving/monthly?year=${year}`));
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[PostgreSQL DB Warning]: Falling back to local storage for getMonthlyGiving:', err.message);
      const giving = getMockGiving().filter(g => g.member_id === memberId);
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const monthlyMap = {};
      months.forEach((name, i) => {
        monthlyMap[i + 1] = { month: name, monthNumber: i + 1, tithe: 0, welfare: 0, total: 0, transactionCount: 0 };
      });
      let ytdTithe = 0;
      let ytdWelfare = 0;
      giving.forEach(g => {
        const d = new Date(g.date);
        if (d.getFullYear() === parseInt(year)) {
          const mNum = d.getMonth() + 1;
          const amt = parseFloat(g.amount);
          monthlyMap[mNum].transactionCount += 1;
          monthlyMap[mNum].total += amt;
          if ((g.category || '').toLowerCase().includes('tithe')) {
            monthlyMap[mNum].tithe += amt;
            ytdTithe += amt;
          } else {
            monthlyMap[mNum].welfare += amt;
            ytdWelfare += amt;
          }
        }
      });
      return {
        memberId,
        year,
        monthlyGiving: Object.values(monthlyMap),
        yearToDate: { tithe: ytdTithe, welfare: ytdWelfare, total: ytdTithe + ytdWelfare }
      };
    }
  },

  // Fetch giving summary metrics for member
  async getGivingSummary(memberId) {
    try {
      const res = await fetch(getApiUrl(`/api/members/${memberId}/giving/summary`));
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[PostgreSQL DB Warning]: Falling back to local storage for getGivingSummary:', err.message);
      const giving = getMockGiving().filter(g => g.member_id === memberId);
      let totalTithes = 0;
      let totalWelfare = 0;
      let lastGivingDate = null;
      const activeMonths = new Set();
      const currentYear = new Date().getFullYear();
      let thisYearTithes = 0;
      let thisYearWelfare = 0;

      giving.forEach(g => {
        const amt = parseFloat(g.amount);
        const d = new Date(g.date);
        activeMonths.add(g.date.substring(0, 7));
        if (!lastGivingDate || g.date > lastGivingDate) lastGivingDate = g.date;
        if ((g.category || '').toLowerCase().includes('tithe')) {
          totalTithes += amt;
          if (d.getFullYear() === currentYear) thisYearTithes += amt;
        } else {
          totalWelfare += amt;
          if (d.getFullYear() === currentYear) thisYearWelfare += amt;
        }
      });
      const totalGiving = totalTithes + totalWelfare;
      return {
        totalTithes,
        totalWelfare,
        lastGivingDate,
        totalGiving,
        averageMonthly: activeMonths.size ? totalGiving / activeMonths.size : 0,
        thisYearTithes,
        thisYearWelfare
      };
    }
  },

  // Export member giving history to CSV file download
  async exportGivingHistory(memberId, format = 'csv') {
    const records = await this.getGivingRecords(memberId);
    if (!records || records.length === 0) {
      throw new Error('No giving records found to export for this member.');
    }
    const headers = ['Record ID', 'Date', 'Category', 'Amount (GH₵)', 'Payment Method', 'Notes'];
    const rows = records.map(r => [
      r.id,
      r.date,
      r.category,
      r.amount,
      r.payment_method,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `giving_history_${memberId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Add giving record
  async createGiving(givingData) {
    try {
      const res = await fetch(getApiUrl('/api/giving'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(givingData)
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[PostgreSQL DB Warning]: Falling back to local storage for createGiving:', err.message);
      const giving = getMockGiving();
      const newRecord = {
        ...givingData,
        id: givingData.id || 'mock-giving-uuid-' + Math.random().toString(36).substring(2, 10),
        created_at: new Date().toISOString()
      };
      giving.push(newRecord);
      saveMockGiving(giving);
      return newRecord;
    }
  },

  // Delete giving record
  async deleteGiving(id) {
    try {
      const res = await fetch(getApiUrl(`/api/giving/${id}`), { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return true;
    } catch (err) {
      console.warn('[PostgreSQL DB Warning]: Falling back to local storage for deleteGiving:', err.message);
      const giving = getMockGiving();
      const filtered = giving.filter((g) => g.id !== id);
      saveMockGiving(filtered);
      return true;
    }
  },

  // Calculate giving aggregate stats for the dashboard
  async getGivingStats() {
    try {
      const res = await fetch(getApiUrl('/api/giving/stats'));
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[PostgreSQL DB Warning]: Falling back to local storage for getGivingStats:', err.message);
      const giving = getMockGiving();
      return this._calculateStatsFromRecords(giving);
    }
  },

  // Private helper to calculate stats locally if fallback occurs
  _calculateStatsFromRecords(records) {
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
        month: this._formatMonthLabel(month),
        amount: monthTotals[month]
      }))
      .reverse();

    return {
      total: totalGiving,
      categoryBreakdown: categoryTotals,
      monthlyTrend: sortedMonths,
      averageTransaction: records.length ? totalGiving / records.length : 0,
      totalContributionsCount: records.length
    };
  },

  _formatMonthLabel(yearMonthStr) {
    const [year, month] = yearMonthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('default', { month: 'short', year: '2-digit' });
  }
};

export default givingService;
