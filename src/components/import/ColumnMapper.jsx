// /home/caleb/Desktop/PROJECTS/KHC/src/components/import/ColumnMapper.jsx
import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

/**
 * Column Header Mapper Component
 * @param {Object} props
 * @param {Array<string>} props.fileHeaders - Headers extracted from CSV
 * @param {Function} props.onMappingConfirmed - Callback when mapping confirmed
 */
export const ColumnMapper = ({ fileHeaders = [], onMappingConfirmed }) => {
  const schemaFields = [
    { key: 'first_name', label: 'First Name', required: true },
    { key: 'last_name', label: 'Last Name / Surname', required: true },
    { key: 'email', label: 'Email Address (Optional)', required: false },
    { key: 'phone', label: 'Phone Number', required: false },
    { key: 'address', label: 'Residential Address', required: false },
    { key: 'date_of_birth', label: 'Date of Birth (YYYY-MM-DD)', required: false },
    { key: 'join_date', label: 'Join / Membership Date', required: false },
    { key: 'status', label: 'Status (Active / Visitor)', required: false },
    { key: 'role', label: 'Ministry Role', required: false },
    { key: 'notes', label: 'Administrative Notes (Optional)', required: false }
  ];

  // Auto-detect mappings
  const initialMapping = {};
  schemaFields.forEach(field => {
    const match = fileHeaders.find(h => {
      const clean = h.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanKey = field.key.replace(/[^a-z0-9]/g, '');
      return clean === cleanKey || clean.includes(cleanKey) || cleanKey.includes(clean);
    });
    initialMapping[field.key] = match || '';
  });

  const [mapping, setMapping] = useState(initialMapping);

  const handleSelectChange = (key, val) => {
    setMapping(prev => ({ ...prev, [key]: val }));
  };

  const handleConfirm = () => {
    onMappingConfirmed(mapping);
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>
        Map Spreadsheet Columns to System Fields
      </h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Match each column from your file to the corresponding database field in Kings Heritage Chapel registry.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {schemaFields.map(field => (
          <div
            key={field.key}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 40px 1fr',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{field.label}</span>
              {field.required && <span style={{ color: 'var(--color-danger)', marginLeft: '0.25rem' }}>*</span>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <ArrowRight size={18} />
            </div>

            <div>
              <select
                className="form-control"
                value={mapping[field.key] || ''}
                onChange={(e) => handleSelectChange(field.key, e.target.value)}
                style={{ height: '38px', fontSize: '0.85rem' }}
              >
                <option value="">-- Ignore Field --</option>
                {fileHeaders.map(header => (
                  <option key={header} value={header}>{header}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleConfirm} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={16} />
          <span>Confirm Mapping & Continue</span>
        </button>
      </div>
    </div>
  );
};

export default ColumnMapper;
