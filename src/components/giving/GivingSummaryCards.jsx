// /home/caleb/Desktop/PROJECTS/KHC/src/components/giving/GivingSummaryCards.jsx
import React from 'react';
import { DollarSign, Heart, TrendingUp, Calendar, Activity, Landmark } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';

/**
 * Summary cards component for member giving profile
 * @param {Object} props
 * @param {Object} props.summary - Summary metrics object
 */
export const GivingSummaryCards = ({ summary = {} }) => {
  const {
    totalTithes = 0,
    totalWelfare = 0,
    totalGiving = 0,
    averageMonthly = 0,
    thisYearTithes = 0,
    thisYearWelfare = 0,
    lastGivingDate = null
  } = summary;

  const thisYearTotal = thisYearTithes + thisYearWelfare;

  const cards = [
    {
      title: 'Total Tithes',
      value: formatCurrency(totalTithes),
      subtitle: 'All-time tithe contributions',
      icon: <Landmark size={20} />,
      color: 'var(--gold-primary)',
      bg: 'rgba(37, 99, 235, 0.08)'
    },
    {
      title: 'Total Welfare & Offering',
      value: formatCurrency(totalWelfare),
      subtitle: 'All-time welfare/offering',
      icon: <Heart size={20} />,
      color: 'var(--color-success)',
      bg: 'rgba(16, 185, 129, 0.08)'
    },
    {
      title: 'Total Contributions',
      value: formatCurrency(totalGiving),
      subtitle: 'Combined total contributions',
      icon: <DollarSign size={20} />,
      color: 'var(--gold-primary)',
      bg: 'rgba(197, 168, 128, 0.1)'
    },
    {
      title: 'This Year Giving',
      value: formatCurrency(thisYearTotal),
      subtitle: `Current year aggregate (${new Date().getFullYear()})`,
      icon: <TrendingUp size={20} />,
      color: 'var(--color-info)',
      bg: 'rgba(59, 130, 246, 0.08)'
    },
    {
      title: 'Average Monthly',
      value: formatCurrency(averageMonthly),
      subtitle: 'Average per active month',
      icon: <Activity size={20} />,
      color: 'var(--color-warning)',
      bg: 'rgba(245, 158, 11, 0.08)'
    },
    {
      title: 'Last Contribution',
      value: lastGivingDate ? formatDate(lastGivingDate) : 'No records',
      subtitle: 'Most recent payment date',
      icon: <Calendar size={20} />,
      color: 'var(--text-secondary)',
      bg: 'rgba(148, 163, 184, 0.1)'
    }
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}
    >
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="glass-panel"
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: card.bg,
              color: card.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {card.icon}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              {card.title}
            </p>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.15rem 0', fontFamily: 'var(--font-heading)' }}>
              {card.value}
            </h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {card.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GivingSummaryCards;
