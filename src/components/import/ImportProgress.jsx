// /home/caleb/Desktop/PROJECTS/KHC/src/components/import/ImportProgress.jsx
import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Import Progress Status Component
 * @param {Object} props
 * @param {number} props.progress - Percentage integer (0 - 100)
 * @param {number} props.current - Processed rows count
 * @param {number} props.total - Total rows count
 */
export const ImportProgress = ({ progress = 0, current = 0, total = 0 }) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '3rem 2rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-secondary)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          color: 'var(--gold-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <RefreshCw size={32} style={{ animation: 'spin 1.5s linear infinite' }} />
      </div>

      <div>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-heading)', margin: '0 0 0.25rem 0' }}>
          Batch Importing Member Records...
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
          Writing rows to Aiven PostgreSQL cloud database ({current} of {total} processed)
        </p>
      </div>

      {/* Progress Bar Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          height: '10px',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '5px',
          overflow: 'hidden',
          border: '1px solid var(--border-color)'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: 'var(--gold-primary)',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gold-primary)' }}>
        {progress}% Completed
      </span>
    </div>
  );
};

export default ImportProgress;
