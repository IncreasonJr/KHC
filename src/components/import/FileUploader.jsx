// /home/caleb/Desktop/PROJECTS/KHC/src/components/import/FileUploader.jsx
import React, { useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Download, AlertCircle } from 'lucide-react';
import { parseCSV } from '../../utils/csvParser';
import importService from '../../services/importService';

/**
 * File Uploader Component for Bulk Member Import
 * @param {Object} props
 * @param {Function} props.onFileParsed - Callback with parsed raw rows array and filename
 */
export const FileUploader = ({ onFileParsed }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const processFile = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds maximum limit of 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsedRows = parseCSV(text);
      if (parsedRows.length === 0) {
        alert('Could not parse any rows from the selected file. Please check file format.');
        return;
      }
      onFileParsed(parsedRows, file.name);
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Download Template Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(37, 99, 235, 0.05)',
          border: '1px solid rgba(37, 99, 235, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileSpreadsheet size={24} style={{ color: 'var(--gold-primary)' }} />
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>
              Need a starting CSV template?
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Download our sample spreadsheet formatted with all standard member registry columns.
            </p>
          </div>
        </div>

        <button
          onClick={() => importService.downloadTemplate()}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Download size={16} />
          <span>Download Sample CSV</span>
        </button>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        className="glass-panel"
        style={{
          border: '2px dashed var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '4rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: 'var(--bg-secondary)',
          transition: 'all var(--transition-normal)'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt,.xlsx,.xls"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            color: 'var(--gold-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}
        >
          <UploadCloud size={32} />
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          Click or Drag & Drop Member File
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Supports CSV (.csv) or text files up to 10MB
        </p>

        <span className="badge badge-active" style={{ padding: '0.35rem 0.85rem' }}>
          Accepted columns: first_name, last_name, email, phone, address, date_of_birth, join_date, status, role
        </span>
      </div>

    </div>
  );
};

export default FileUploader;
