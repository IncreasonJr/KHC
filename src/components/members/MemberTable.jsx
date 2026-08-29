// /home/caleb/Desktop/PROJECTS/KHC/src/components/members/MemberTable.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Edit2, Trash2, Filter, AlertCircle } from 'lucide-react';
import { getInitials, getAvatarBg, formatDate } from '../../utils/helpers';

export const MemberTable = ({ members = [], onDelete }) => {
  const navigate = useNavigate();
  
  // States for query, filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Handle row clicks to navigate to profile details page
  const handleRowClick = (id) => {
    navigate(`/members/${id}`);
  };

  const handleEditClick = (e, id) => {
    e.stopPropagation();
    navigate(`/members/${id}/edit`);
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this member? All associated financial records will also be deleted.')) {
      onDelete(id);
    }
  };

  // Filtered members list computations
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
      const email = (member.email || '').toLowerCase();
      const matchesSearch = 
        fullName.includes(searchQuery.toLowerCase()) || 
        email.includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter ? member.role === roleFilter : true;
      const matchesStatus = statusFilter ? member.status === statusFilter : true;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, searchQuery, roleFilter, statusFilter]);

  // Unique lists of roles and statuses for drop downs
  const roles = ['Pastor', 'Elder', 'Deacon', 'Ministry Leader', 'Volunteer', 'Staff', 'Member'];
  const statuses = ['Active', 'Inactive', 'Visitor', 'Archived'];

  return (
    <div className="animate-fade-in">
      
      {/* Search and Filters toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '260px', maxWidth: '400px' }}>
          <Search 
            size={18} 
            style={{ 
              position: 'absolute', 
              left: '0.85rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-muted)' 
            }} 
          />
          <input
            type="text"
            className="form-control"
            placeholder="Search members by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--gold-primary)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filters:</span>
          </div>

          {/* Role Filter */}
          <select
            className="form-control"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ width: '150px', padding: '0.5rem 1rem' }}
          >
            <option value="">All Roles</option>
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '140px', padding: '0.5rem 1rem' }}
          >
            <option value="">All Statuses</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

        </div>

      </div>

      {/* Interactive Table Grid */}
      {filteredMembers.length === 0 ? (
        <div className="glass-panel" style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <AlertCircle size={40} style={{ color: 'var(--gold-primary)' }} />
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>No Members Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px' }}>
            No records matched your search query or active filter settings. Try adjusting your search keywords.
          </p>
        </div>
      ) : (
        <div className="table-container glass-panel">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Profile</th>
                <th>Name</th>
                <th>Contact Info</th>
                <th className="sm-hide">Role</th>
                <th>Status</th>
                <th className="md-hide">Joined</th>
                <th style={{ width: '120px', textAlignment: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr 
                  key={member.id} 
                  onClick={() => handleRowClick(member.id)}
                  style={{ cursor: 'pointer' }}
                >
                  
                  {/* Photo/Avatar */}
                  <td>
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={`${member.first_name} avatar`}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1.5px solid var(--gold-primary)'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: getAvatarBg(`${member.first_name} ${member.last_name}`),
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-heading)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        {getInitials(member.first_name, member.last_name)}
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td style={{ fontWeight: '600', fontFamily: 'var(--font-heading)' }}>
                    {member.first_name} {member.last_name}
                  </td>

                  {/* Email & Phone */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{member.email}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{member.phone || 'No phone'}</span>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="sm-hide">
                    <span style={{ 
                      fontSize: '0.85rem', 
                      color: member.role === 'Pastor' || member.role === 'Elder' ? 'var(--gold-primary)' : 'var(--text-primary)',
                      fontWeight: member.role === 'Pastor' || member.role === 'Elder' ? '600' : '400'
                    }}>
                      {member.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`badge badge-${member.status.toLowerCase()}`}>
                      {member.status}
                    </span>
                  </td>

                  {/* Date Joined */}
                  <td className="md-hide" style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(member.join_date)}
                  </td>

                  {/* Actions */}
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-start' }}>
                      <button
                        onClick={() => handleRowClick(member.id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem', borderRadius: '4px' }}
                        title="View Profile"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={(e) => handleEditClick(e, member.id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem', borderRadius: '4px' }}
                        title="Edit Details"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, member.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.4rem', borderRadius: '4px' }}
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default MemberTable;
