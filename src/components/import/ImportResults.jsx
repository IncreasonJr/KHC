// /home/caleb/Desktop/PROJECTS/KHC/src/components/import/ImportResults.jsx
import React from 'react';
import { CheckCircle2, AlertTriangle, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Import Final Results Summary Component
 * @param {Object} props
 * @param {Object} props.results - Final import stats { total, inserted, updated, failed, errors }
 * @param {Function} props.onReset
 */
export const ImportResults = ({ results = {}, onReset }) => {
  const navigate = useNavigate();
  const { total = 0, inserted = 0, updated = 0, failed = 0, errors = [] } = results;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner */}
      <div
        className="glass-panel animate-slide-up"
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-secondary)',
          textAlign: 'center',
          border: '1px solid var(--border-color)'
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}
        >
          <CheckCircle2 size={32} />
        </div>

        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)', margin: '0 0 0.5rem 0' }}>
          Bulk Member Import Complete!
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
          Your member records have been processed and synced with Kings Heritage Chapel database.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Processed Rows</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0 0 0' }}>{total}</h3>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', textTransform: 'uppercase' }}>New Members Created</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)', margin: '0.25rem 0 0 0' }}>{inserted}</h3>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-info)', textTransform: 'uppercase' }}>Records Updated</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-info)', margin: '0.25rem 0 0 0' }}>{updated}</h3>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: failed > 0 ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-secondary)', border: failed > 0 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: failed > 0 ? 'var(--color-danger)' : 'var(--text-muted)', textTransform: 'uppercase' }}>Failed Rows</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: failed > 0 ? 'var(--color-danger)' : 'var(--text-primary)', margin: '0.25rem 0 0 0' }}>{failed}</h3>
        </div>
      </div>

      {/* Errors list if any */}
      {errors.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h4 style={{ color: 'var(--color-danger)', fontSize: '0.95rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} />
            <span>Errors encountered during import:</span>
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {errors.map((err, idx) => (
              <li key={idx}>
                {err.email || 'Row'}: {err.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <button onClick={onReset} className="btn btn-secondary">
          Import Another File
        </button>

        <button
          onClick={() => navigate('/members')}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}
        >
          <Users size={18} />
          <span>View Members Directory</span>
          <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
};

export default ImportResults;
