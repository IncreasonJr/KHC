// /home/caleb/Desktop/PROJECTS/KHC/src/components/giving/MonthlyGivingTable.jsx
import React from 'react';
import { formatCurrency } from '../../utils/helpers';

/**
 * Monthly Giving Ledger Table Component
 * @param {Object} props
 * @param {Array<Object>} props.monthlyData - Array of 12 month items { month, tithe, welfare, total, transactionCount }
 * @param {Object} props.yearToDate - Year-to-date summary object { tithe, welfare, total }
 */
export const MonthlyGivingTable = ({ monthlyData = [], yearToDate = {} }) => {
  const totalTithe = yearToDate.tithe || monthlyData.reduce((acc, m) => acc + (m.tithe || 0), 0);
  const totalWelfare = yearToDate.welfare || monthlyData.reduce((acc, m) => acc + (m.welfare || 0), 0);
  const totalOverall = yearToDate.total || monthlyData.reduce((acc, m) => acc + (m.total || 0), 0);
  const totalCount = monthlyData.reduce((acc, m) => acc + (m.transactionCount || 0), 0);

  return (
    <div className="table-container glass-panel" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <table className="custom-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Month</th>
            <th style={{ textAlign: 'right' }}>Tithe</th>
            <th style={{ textAlign: 'right' }}>Welfare / Offering</th>
            <th style={{ textAlign: 'right' }}>Monthly Total</th>
            <th style={{ textAlign: 'center', width: '120px' }}>Transactions</th>
          </tr>
        </thead>
        <tbody>
          {monthlyData.map((row, idx) => {
            const hasGiving = row.total > 0;
            return (
              <tr key={idx} style={{ backgroundColor: hasGiving ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                <td style={{ fontWeight: hasGiving ? '600' : '400', color: hasGiving ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {row.month}
                </td>
                <td style={{ textAlign: 'right', color: row.tithe > 0 ? 'var(--gold-primary)' : 'var(--text-muted)' }}>
                  {formatCurrency(row.tithe)}
                </td>
                <td style={{ textAlign: 'right', color: row.welfare > 0 ? 'var(--color-success)' : 'var(--text-muted)' }}>
                  {formatCurrency(row.welfare)}
                </td>
                <td style={{ textAlign: 'right', fontWeight: hasGiving ? '700' : '400', color: hasGiving ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {formatCurrency(row.total)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {row.transactionCount > 0 ? (
                    <span className="badge badge-active" style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
                      {row.transactionCount} {row.transactionCount === 1 ? 'tx' : 'txs'}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: 'rgba(37, 99, 235, 0.06)', fontWeight: '700', fontSize: '1.02rem', borderTop: '2px solid var(--border-color)' }}>
            <td style={{ color: 'var(--gold-primary)', fontFamily: 'var(--font-heading)' }}>TOTAL (YTD)</td>
            <td style={{ textAlign: 'right', color: 'var(--gold-primary)' }}>{formatCurrency(totalTithe)}</td>
            <td style={{ textAlign: 'right', color: 'var(--color-success)' }}>{formatCurrency(totalWelfare)}</td>
            <td style={{ textAlign: 'right', color: 'var(--text-primary)' }}>{formatCurrency(totalOverall)}</td>
            <td style={{ textAlign: 'center', color: 'var(--gold-primary)' }}>{totalCount} txs</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default MonthlyGivingTable;
