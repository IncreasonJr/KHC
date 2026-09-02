// /home/caleb/Desktop/PROJECTS/KHC/src/pages/Dashboard.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  Plus, 
  ArrowRight,
  UserPlus,
  Search,
  Shield,
  X,
  Mail
} from 'lucide-react';
import { useMembers } from '../hooks/useMembers';
import { formatDate, getAvatarBg, getInitials } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import getApiUrl from '../services/api';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  // Fetch all members query
  const { data: members = [], isLoading } = useMembers();

  const [dbStatus, setDbStatus] = useState(null);

  // Test database connection to Aiven PostgreSQL API
  useEffect(() => {
    fetch(getApiUrl('/api/test-db'))
      .then((res) => res.json())
      .then((data) => setDbStatus(data))
      .catch(() => setDbStatus({ success: false, message: 'Local Storage Fallback Mode' }));
  }, []);

  // Close search dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter members matching search query (moved above early return to satisfy Rules of Hooks)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return members.filter(m => {
      const fullName = `${m.first_name} ${m.last_name}`.toLowerCase();
      const email = (m.email || '').toLowerCase();
      return fullName.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
    }).slice(0, 5); // Limit dropdown to top 5 results for clean design
  }, [members, searchQuery]);

  const handleSearchResultClick = (id) => {
    setSearchQuery('');
    setIsDropdownOpen(false);
    navigate(`/members/${id}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Pre-calculate dashboard indicators
  const activeCount = members.filter(m => m.status === 'Active').length;
  const visitorCount = members.filter(m => m.status === 'Visitor').length;
  const leadersCount = members.filter(m => m.role !== 'Member').length;

  return (
    <div className="animate-fade-in">
      
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.25rem' }}>
            Welcome Back, <span className="gold-gradient-text">Pastor & Admin</span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Kings Heritage Chapel administrative management interface.
            </p>
            {dbStatus && (
              <span 
                style={{ 
                  backgroundColor: dbStatus.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                  color: dbStatus.success ? 'var(--color-success)' : 'var(--color-warning)',
                  border: `1px solid ${dbStatus.success ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: '600'
                }}
                title={dbStatus.message}
              >
                <span style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: dbStatus.success ? 'var(--color-success)' : 'var(--color-warning)' 
                }} />
                {dbStatus.success ? 'Aiven PostgreSQL Online' : 'Local Storage Fallback'}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/members/add" className="btn btn-primary">
            <Plus size={16} />
            <span>Add Member</span>
          </Link>
        </div>
      </div>

      {/* SEARCH UTILITY SECTION */}
      <div ref={searchRef} style={{ position: 'relative', marginBottom: '2.5rem', zIndex: 50 }}>
        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-secondary)' 
              }} 
            />
            <input
              type="text"
              className="form-control"
              placeholder="Type member name or email to search and view their profile..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              style={{ 
                paddingLeft: '3rem', 
                paddingRight: '3rem', 
                height: '52px', 
                borderRadius: 'var(--radius-md)', 
                fontSize: '1.02rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsDropdownOpen(false);
                }}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          <button
            onClick={() => {
              if (searchResults.length > 0) {
                handleSearchResultClick(searchResults[0].id);
              } else {
                setIsDropdownOpen(true);
              }
            }}
            className="btn btn-primary"
            style={{ 
              height: '52px', 
              borderRadius: 'var(--radius-md)', 
              padding: '0 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Search size={18} />
            <span className="sm-hide">Search</span>
          </button>
        </div>

        {/* Dynamic Search Results Dropdown Overlay */}
        {isDropdownOpen && searchQuery.trim() && (
          <div 
            className="glass-panel" 
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.5rem)',
              left: 0,
              right: 0,
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              maxHeight: '300px',
              overflowY: 'auto'
            }}
          >
            {searchResults.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No congregation members found matching "<span style={{ fontWeight: '600' }}>{searchQuery}</span>"
              </div>
            ) : (
              <div>
                <div style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                  Matching Members
                </div>
                {searchResults.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleSearchResultClick(m.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color var(--transition-fast)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {m.photo_url ? (
                      <img 
                        src={m.photo_url} 
                        alt="" 
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--gold-primary)' }} 
                      />
                    ) : (
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: getAvatarBg(`${m.first_name} ${m.last_name}`),
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        fontFamily: 'var(--font-heading)'
                      }}>
                        {getInitials(m.first_name, m.last_name)}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                        {m.first_name} {m.last_name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {m.email} • {m.role}
                      </p>
                    </div>
                    <ArrowRight size={16} style={{ color: 'var(--gold-primary)' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="stat-grid">
        
        {/* KPI: Total Members */}
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper">
            <Users size={22} />
          </div>
          <div>
            <p className="stat-label">Total Registry</p>
            <h3 className="stat-value">{members.length}</h3>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Congregation size
            </p>
          </div>
        </div>

        {/* KPI: Active Members */}
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.08)', color: 'var(--color-success)', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <p className="stat-label">Active Directory</p>
            <h3 className="stat-value">{activeCount}</h3>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {members.length > 0 ? Math.round((activeCount / members.length) * 100) : 0}% active status
            </p>
          </div>
        </div>

        {/* KPI: Regular Visitors */}
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.08)', color: 'var(--color-warning)', borderColor: 'rgba(245, 158, 11, 0.15)' }}>
            <UserPlus size={22} />
          </div>
          <div>
            <p className="stat-label">Regular Visitors</p>
            <h3 className="stat-value">{visitorCount}</h3>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Prospective members
            </p>
          </div>
        </div>

        {/* KPI: Ministry & Staff Leaders */}
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(37, 99, 235, 0.08)', color: 'var(--gold-primary)', borderColor: 'rgba(37, 99, 235, 0.15)' }}>
            <Shield size={22} />
          </div>
          <div>
            <p className="stat-label">Ministry & Staff</p>
            <h3 className="stat-value">{leadersCount}</h3>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Pastors, leaders & volunteers
            </p>
          </div>
        </div>

      </div>

      {/* Grid of Newest Members (Dashboard main focus area) */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', margin: 0 }}>
            Recent Registry Additions
          </h3>
          <Link to="/members" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--gold-primary)', textDecoration: 'none', fontWeight: '600' }}>
            <span>View Full Directory</span>
            <ArrowRight size={14} />
          </Link>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {members.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '3rem 2rem', textAlign: 'center' }}>
              <UserPlus size={40} style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Registered Members</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Get started by adding your first congregation member record.</p>
              <Link to="/members/add" className="btn btn-primary">
                Add Congregation Member
              </Link>
            </div>
          ) : (
            members
              .slice(0, 6)
              .map(member => (
                <div 
                  key={member.id}
                  onClick={() => navigate(`/members/${member.id}`)}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--gold-primary)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  {member.photo_url ? (
                    <img 
                      src={member.photo_url} 
                      alt="" 
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold-primary)' }} 
                    />
                  ) : (
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: getAvatarBg(`${member.first_name} ${member.last_name}`),
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '1rem',
                      fontFamily: 'var(--font-heading)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      {getInitials(member.first_name, member.last_name)}
                    </div>
                  )}
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.15rem 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {member.first_name} {member.last_name}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {member.role}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Joined {formatDate(member.join_date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
