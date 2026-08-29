// /home/caleb/Desktop/PROJECTS/KHC/src/services/givingService.js
import { supabase, isSupabaseConfigured } from './supabase';

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
    if (isSupabaseConfigured) {
      let query = supabase
        .from('giving_records')
        .select(`
          *,
          members (
            first_name,
            last_name,
            email
          )
        `)
        .order('date', { ascending: false });

      if (memberId) {
        query = query.eq('member_id', memberId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 300));
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

  // Add giving record
  async createGiving(givingData) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('giving_records')
        .insert([givingData])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const giving = getMockGiving();
      const newRecord = {
        ...givingData,
        id: crypto.randomUUID ? crypto.randomUUID() : 'mock-giving-uuid-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      };
      giving.push(newRecord);
      saveMockGiving(giving);
      return newRecord;
    }
  },

  // Delete giving record
  async deleteGiving(id) {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('giving_records')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const giving = getMockGiving();
      const filtered = giving.filter((g) => g.id !== id);
      saveMockGiving(filtered);
      return true;
    }
  },

  // Calculate giving aggregate stats for the dashboard
  async getGivingStats() {
    if (isSupabaseConfigured) {
      // In a real application we would pull sums directly using Supabase functions or RPC,
      // but to ensure consistency we can pull all records and compute, 
      // or write query aggregates.
      // Let's retrieve recent giving records and calculate client-side for compatibility.
      const { data, error } = await supabase
        .from('giving_records')
        .select('amount, date, category');
      
      if (error) throw error;
      return this._calculateStatsFromRecords(data);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const giving = getMockGiving();
      return this._calculateStatsFromRecords(giving);
    }
  },

  // Private helper to calculate stats
  _calculateStatsFromRecords(records) {
    const totalGiving = records.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    
    // Group by category
    const categoryTotals = {};
    records.forEach(r => {
      categoryTotals[r.category] = (categoryTotals[r.category] || 0) + parseFloat(r.amount);
    });

    // Group by month (last 6 months)
    const monthTotals = {};
    records.forEach(r => {
      // Date structure: YYYY-MM-DD
      const monthStr = r.date.substring(0, 7); // YYYY-MM
      monthTotals[monthStr] = (monthTotals[monthStr] || 0) + parseFloat(r.amount);
    });

    // Order months
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
