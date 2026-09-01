// /home/caleb/Desktop/PROJECTS/KHC/src/components/giving/GivingChart.jsx
import React from 'react';
import { formatCurrency } from '../../utils/helpers';

/**
 * Visual SVG / HTML Monthly Giving Trend Bar Chart
 * @param {Object} props
 * @param {Array<Object>} props.monthlyData - 12 month items { month, tithe, welfare, total }
 */
export const GivingChart = ({ monthlyData = [] }) => {
  const maxVal = Math.max(...monthlyData.map(m => m.total || 0), 100);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', margin: 0 }}>
            Monthly Contribution Trend
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Visual breakdown of Tithes vs Welfare & Offering
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--gold-primary)' }} />
            <span>Tithes</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--color-success)' }} />
            <span>Welfare / Offering</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '0.5rem',
          height: '180px',
          alignItems: 'end',
          paddingTop: '1rem',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        {monthlyData.map((m, idx) => {
          const tithePct = maxVal > 0 ? (m.tithe / maxVal) * 100 : 0;
          const welfarePct = maxVal > 0 ? (m.welfare / maxVal) * 100 : 0;
          const shortMonth = m.month.substring(0, 3);

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              {/* Stacked Bar */}
              <div
                title={`${m.month}: Total ${formatCurrency(m.total)} (Tithe: ${formatCurrency(m.tithe)}, Welfare: ${formatCurrency(m.welfare)})`}
                style={{
                  width: '100%',
                  maxWidth: '24px',
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  height: '100%',
                  justifyContent: 'flex-start',
                  borderRadius: '4px 4px 0 0',
                  overflow: 'hidden',
                  backgroundColor: 'rgba(0,0,0,0.03)'
                }}
              >
                {/* Welfare Portion */}
                <div
                  style={{
                    height: `${welfarePct}%`,
                    backgroundColor: 'var(--color-success)',
                    transition: 'height var(--transition-normal)'
                  }}
                />
                {/* Tithe Portion */}
                <div
                  style={{
                    height: `${tithePct}%`,
                    backgroundColor: 'var(--gold-primary)',
                    transition: 'height var(--transition-normal)'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Month Labels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '0.5rem',
          marginTop: '0.5rem',
          textAlign: 'center'
        }}
      >
        {monthlyData.map((m, idx) => (
          <span key={idx} style={{ fontSize: '0.7rem', color: m.total > 0 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: m.total > 0 ? '600' : '400' }}>
            {m.month.substring(0, 3)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default GivingChart;
