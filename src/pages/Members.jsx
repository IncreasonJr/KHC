// /home/caleb/Desktop/PROJECTS/KHC/src/pages/Members.jsx
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, RefreshCw, AlertCircle, FileDown, FileUp } from 'lucide-react';
import { useMembers, useDeleteMember, useCreateMember } from '../hooks/useMembers';
import MemberTable from '../components/members/MemberTable';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const Members = () => {
  const { data: members = [], isLoading, error, refetch } = useMembers();
  const deleteMutation = useDeleteMember();
  const createMutation = useCreateMember();
  const fileInputRef = useRef(null);

  const handleDeleteMember = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.error('Failed to delete member registry record:', err);
      alert('Error occurred while deleting member: ' + err.message);
    }
  };

  // CSV EXPORT UTILITY
  const handleExportCSV = () => {
    if (members.length === 0) {
      alert('No member records available to export.');
      return;
    }

    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Address', 'DOB', 'Join Date', 'Status', 'Role', 'Notes'];
    
    // Map entries to row values escaping quotes
    const rows = members.map(m => [
      m.first_name || '',
      m.last_name || '',
      m.email || '',
      m.phone || '',
      m.address || '',
      m.date_of_birth || '',
      m.join_date || '',
      m.status || 'Active',
      m.role || 'Member',
      (m.notes || '').replace(/\n/g, ' ')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(val => `"${val.replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `khc_congregants_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV IMPORT UTILITY
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/);
      
      if (lines.length <= 1) {
        alert('The uploaded file appears to be empty or missing columns.');
        return;
      }

      // Parse headers from the first row (lowercase and clean)
      const rawHeaders = lines[0].split(',');
      const headers = rawHeaders.map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

      let successCount = 0;
      let skipCount = 0;

      // Iterate through records
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Split line parsing CSV rules (handling inner quotes)
        const values = [];
        let currentCell = '';
        let insideQuotes = false;

        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            values.push(currentCell.trim().replace(/^["']|["']$/g, ''));
            currentCell = '';
          } else {
            currentCell += char;
          }
        }
        values.push(currentCell.trim().replace(/^["']|["']$/g, ''));

        if (values.length < 2) continue; // Skip lines without basic values

        const record = {};
        
        // Map headers dynamically to member fields
        headers.forEach((header, idx) => {
          const cellVal = values[idx] || '';
          if (header.includes('first') || header === 'first_name') {
            record.first_name = cellVal;
          } else if (header.includes('last') || header === 'last_name') {
            record.last_name = cellVal;
          } else if (header === 'email') {
            record.email = cellVal;
          } else if (header === 'phone' || header.includes('tel')) {
            record.phone = cellVal;
          } else if (header === 'address') {
            record.address = cellVal;
          } else if (header.includes('birth') || header === 'dob' || header === 'date_of_birth') {
            record.date_of_birth = cellVal || null;
          } else if (header.includes('join') || header === 'join_date') {
            record.join_date = cellVal;
          } else if (header === 'status') {
            record.status = cellVal;
          } else if (header === 'role') {
            record.role = cellVal;
          } else if (header === 'notes') {
            record.notes = cellVal;
          }
        });

        // Skip lines missing primary identifiers
        if (!record.first_name || !record.last_name) {
          skipCount++;
          continue;
        }

        // Apply defaults
        if (!record.email) {
          // Generate deterministic email to prevent primary key constraints
          record.email = `${record.first_name.toLowerCase()}.${record.last_name.toLowerCase()}.${Math.floor(Math.random() * 1000)}@email.com`;
        }
        if (!record.join_date) record.join_date = new Date().toISOString().split('T')[0];
        if (!record.status) record.status = 'Active';
        if (!record.role) record.role = 'Member';

        try {
          await createMutation.mutateAsync(record);
          successCount++;
        } catch (err) {
          console.error(`Import skipped at row ${i}:`, err);
          skipCount++;
        }
      }

      alert(`CSV Ingestion Summary:\nSuccessfully registered: ${successCount} member(s).\nSkipped / Failed: ${skipCount} row(s).`);
      refetch();
      
      // Clear input element file select
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="animate-fade-in">
      
      {/* Page Header toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage congregation details, track assignments, and view profiles.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* CSV Import */}
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".csv" 
            onChange={handleImportCSV} 
            style={{ display: 'none' }} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            title="Import member data from CSV file"
          >
            <FileUp size={16} />
            <span className="sm-hide">Import CSV</span>
          </button>

          {/* CSV Export */}
          <button 
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            title="Export all members to CSV"
          >
            <FileDown size={16} />
            <span className="sm-hide">Export CSV</span>
          </button>

          {/* Sync DB */}
          <button 
            onClick={() => refetch()}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            title="Sync registry with database"
          >
            <RefreshCw size={16} />
            <span>Sync</span>
          </button>
          
          {/* Add member button link */}
          <Link to="/members/add" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={16} />
            <span>New Member</span>
          </Link>

        </div>
      </div>

      {/* Main Content Viewport */}
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="glass-panel" style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          color: 'var(--color-danger)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <AlertCircle size={40} />
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Database Sync Failed</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px' }}>
            {error.message || 'An error occurred while loading member directory registry.'}
          </p>
          <button onClick={() => refetch()} className="btn btn-secondary">Try Again</button>
        </div>
      ) : (
        <MemberTable 
          members={members} 
          onDelete={handleDeleteMember} 
        />
      )}

    </div>
  );
};

export default Members;
