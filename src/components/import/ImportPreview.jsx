// /home/caleb/Desktop/PROJECTS/KHC/src/components/import/ImportPreview.jsx
import React from 'react';
import { AlertTriangle, CheckCircle, Upload, Shield } from 'lucide-react';

/**
 * Pre-Import Data Validation & Preview Component
 * @param {Object} props
 * @param {Object} props.validationResult - Validation data object from importService
 * @param {string} props.duplicateStrategy - 'update' | 'skip'
 * @param {Function} props.onStrategyChange
 * @param {Function} props.onProceed
 * @param {Function} props.onBack
 */
export const ImportPreview = ({
  validationResult = {},
  duplicateStrategy = 'update',
  onStrategyChange,
  onProceed,
  onBack
}) => {
  const { total = 0, validCount = 0, invalidCount = 0, validRows = [], invalidRows = [] } = validationResult;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Overview Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total File Rows</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0 0 0' }}>{total}</h3>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', textTransform: 'uppercase' }}>Ready to Import</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)', margin: '0.25rem 0 0 0' }}>{validCount}</h3>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: invalidCount > 0 ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-secondary)', border: invalidCount > 0 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: invalidCount > 0 ? 'var(--color-danger)' : 'var(--text-muted)', textTransform: 'uppercase' }}>Validation Issues</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: invalidCount > 0 ? 'var(--color-danger)' : 'var(--text-primary)', margin: '0.25rem 0 0 0' }}>{invalidCount}</h3>
        </div>
      </div>

      {/* Duplicate Strategy Settings */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <Shield size={18} style={{ color: 'var(--gold-primary)' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-heading)' }}>
            Duplicate Resolution Rule
          </h4>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="radio"
              name="duplicateStrategy"
              value="update"
              checked={duplicateStrategy === 'update'}
              onChange={() => onStrategyChange('update')}
            />
            <span><strong>Update existing records</strong> (Overwrite matching email/phone in database)</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="radio"
              name="duplicateStrategy"
              value="skip"
              checked={duplicateStrategy === 'skip'}
              onChange={() => onStrategyChange('skip')}
            />
            <span><strong>Skip duplicates</strong> (Keep existing database records intact)</span>
          </label>
        </div>
      </div>

      {/* Preview Table */}
      <div className="table-container glass-panel" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '0.85rem' }}>
          Sample Data Preview (Showing top valid rows)
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Row</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email Address</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {validRows.slice(0, 10).map((item, idx) => {
              const row = item.data || item;
              return (
                <tr key={idx}>
                  <td style={{ fontWeight: '600', color: 'var(--text-muted)' }}>#{item.rowNum || idx + 1}</td>
                  <td style={{ fontWeight: '600' }}>{row.first_name}</td>
                  <td style={{ fontWeight: '600' }}>{row.last_name}</td>
                  <td>{row.email}</td>
                  <td>{row.phone || '-'}</td>
                  <td>{row.role || 'Member'}</td>
                  <td>
                    {row.isDuplicateInDB ? (
                      <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>Existing Record</span>
                    ) : (
                      <span className="badge badge-active" style={{ fontSize: '0.75rem' }}>New Member</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Invalid Rows Warning Box if any */}
      {invalidCount > 0 && (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h4 style={{ color: 'var(--color-danger)', fontSize: '0.95rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} />
            <span>{invalidCount} row(s) contain validation errors and will be skipped:</span>
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {invalidRows.slice(0, 5).map((inv, idx) => (
              <li key={idx}>
                Row #{inv.rowNum} ({inv.data.email || 'No email'}): {inv.errors.join(' ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <button onClick={onBack} className="btn btn-secondary">
          Back to Upload
        </button>

        <button
          onClick={onProceed}
          disabled={validCount === 0}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}
        >
          <Upload size={18} />
          <span>Execute Bulk Import ({validCount} Rows)</span>
        </button>
      </div>

    </div>
  );
};

export default ImportPreview;
