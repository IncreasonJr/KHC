// /home/caleb/Desktop/PROJECTS/KHC/src/pages/MemberProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit2, 
  Trash2, 
  Plus, 
  AlertCircle,
  Clock,
  BookOpen,
  DollarSign as MoneyIcon,
  Download,
  BarChart2,
  List
} from 'lucide-react';
import { useMember, useGiving, useDeleteMember } from '../hooks/useMembers';
import { getInitials, getAvatarBg, formatDate, formatCurrency } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import GivingSummaryCards from '../components/giving/GivingSummaryCards';
import MonthlyGivingTable from '../components/giving/MonthlyGivingTable';
import GivingChart from '../components/giving/GivingChart';
import AddGivingModal from '../components/giving/AddGivingModal';
import { givingService } from '../services/givingService';

export const MemberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Active Tab: 'overview' | 'giving'
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Queries
  const { data: member, isLoading: memberLoading, error: memberError } = useMember(id);
  const { data: givingRecords = [], isLoading: givingLoading, refetch: refetchGiving } = useGiving(id);
  const deleteMemberMutation = useDeleteMember();

  // Monthly breakdown & summary state
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearToDate, setYearToDate] = useState({});
  const [givingSummary, setGivingSummary] = useState({});
  const [fetchingBreakdown, setFetchingBreakdown] = useState(false);

  const fetchGivingAnalytics = async () => {
    if (!id) return;
    setFetchingBreakdown(true);
    try {
      const [monthlyRes, summaryRes] = await Promise.all([
        givingService.getMonthlyGiving(id, selectedYear),
        givingService.getGivingSummary(id)
      ]);
      setMonthlyData(monthlyRes.monthlyGiving || []);
      setYearToDate(monthlyRes.yearToDate || {});
      setGivingSummary(summaryRes || {});
    } catch (err) {
      console.error('Failed to fetch member giving analytics:', err);
    } finally {
      setFetchingBreakdown(false);
    }
  };

  useEffect(() => {
    fetchGivingAnalytics();
  }, [id, selectedYear]);

  const isLoading = memberLoading || givingLoading;

  if (isLoading) return <LoadingSpinner />;

  if (memberError || !member) {
    return (
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <AlertCircle size={40} style={{ color: 'var(--color-danger)', marginBottom: '1rem' }} />
        <h3>Member Profile Error</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Could not load the requested member. They may have been deleted.</p>
        <Link to="/members" className="btn btn-secondary" style={{ marginTop: '1rem' }}>Back to Directory</Link>
      </div>
    );
  }

  const handleDeleteMember = async () => {
    if (window.confirm('Are you sure you want to permanently delete this member? All associated financial records will also be deleted.')) {
      try {
        await deleteMemberMutation.mutateAsync(member.id);
        navigate('/members');
      } catch (err) {
        console.error('Failed to delete member:', err);
        alert('Could not delete member record: ' + err.message);
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      await givingService.exportGivingHistory(member.id, 'csv');
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      
      {/* Top Header Navigation & Profile Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button 
          onClick={() => navigate('/members')}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
        >
          <ArrowLeft size={16} />
          <span>Registry Directory</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} />
            <span>Record Giving</span>
          </button>

          <Link to={`/members/${member.id}/edit`} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit2 size={14} />
            <span>Edit Profile</span>
          </Link>

          <button onClick={handleDeleteMember} className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trash2 size={14} />
            <span className="sm-hide">Delete</span>
          </button>
        </div>
      </div>

      {/* Profile Header Header Card */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem 2rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}
      >
        {member.photo_url ? (
          <img
            src={member.photo_url}
            alt={`${member.first_name} avatar`}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--gold-primary)',
              boxShadow: 'var(--shadow-md)'
            }}
          />
        ) : (
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: getAvatarBg(`${member.first_name} ${member.last_name}`),
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '1.75rem',
            fontFamily: 'var(--font-heading)',
            border: '1.5px solid rgba(255, 255, 255, 0.1)',
            boxShadow: 'var(--shadow-md)'
          }}>
            {getInitials(member.first_name, member.last_name)}
          </div>
        )}

        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-heading)' }}>
              {member.first_name} {member.last_name}
            </h2>
            <span className="badge badge-active" style={{ fontSize: '0.75rem' }}>{member.role}</span>
            <span className={`badge badge-${member.status.toLowerCase()}`} style={{ fontSize: '0.75rem' }}>{member.status}</span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={14} style={{ color: 'var(--gold-primary)' }} /> {member.email}
            </span>
            {member.phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={14} style={{ color: 'var(--gold-primary)' }} /> {member.phone}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} style={{ color: 'var(--gold-primary)' }} /> Joined {formatDate(member.join_date)}
            </span>
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-primary)', padding: '0.35rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: activeTab === 'overview' ? 'var(--gold-primary)' : 'transparent',
              color: activeTab === 'overview' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            <List size={16} />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('giving')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: activeTab === 'giving' ? 'var(--gold-primary)' : 'transparent',
              color: activeTab === 'giving' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            <BarChart2 size={16} />
            <span>Giving History</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Left: Detailed Information */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--gold-primary)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Personal Details & Metadata
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Email Address</span>
                <span>{member.email}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Telephone / Mobile</span>
                <span>{member.phone || 'Not registered'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Residential Address</span>
                <span>{member.address || 'No residential address registered'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Date of Birth</span>
                <span>{member.date_of_birth ? formatDate(member.date_of_birth) : 'Unspecified'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Membership Role</span>
                <span>{member.role} ({member.status})</span>
              </div>
            </div>
          </div>

          {/* Right: Notes & Financial Snapshot */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Financial Summary Card */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.1)',
                color: 'var(--gold-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-color)'
              }}>
                <MoneyIcon size={26} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>All-Time Total Giving</span>
                <h3 style={{ fontSize: '1.85rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-heading)' }} className="gold-gradient-text">
                  {formatCurrency(givingSummary.totalGiving || 0)}
                </h3>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="glass-panel" style={{ padding: '1.75rem', flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--gold-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} />
                <span>Administrative Notes</span>
              </h3>
              <p style={{ fontSize: '0.92rem', color: member.notes ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {member.notes || 'No administrative notes registered for this member.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: GIVING HISTORY */}
      {activeTab === 'giving' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Top Actions: Year Filter & CSV Export */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter Year:</label>
              <select
                className="form-control"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                style={{ width: '120px', height: '38px', padding: '0 0.85rem' }}
              >
                {[2026, 2025, 2024, 2023].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleExportCSV}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '38px' }}
              >
                <Download size={16} />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '38px' }}
              >
                <Plus size={16} />
                <span>Add Giving Record</span>
              </button>
            </div>
          </div>

          {/* Quick Giving Metric Summary Cards */}
          <GivingSummaryCards summary={givingSummary} />

          {/* Monthly Giving Trend Visual Bar Chart */}
          <GivingChart monthlyData={monthlyData} />

          {/* Monthly Giving Ledger Table */}
          <div style={{ marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Church Book System Ledger - {selectedYear}
            </h3>
            {fetchingBreakdown ? (
              <LoadingSpinner />
            ) : (
              <MonthlyGivingTable monthlyData={monthlyData} yearToDate={yearToDate} />
            )}
          </div>

        </div>
      )}

      {/* Modal to add new contribution */}
      <AddGivingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        memberId={member.id}
        onSuccess={() => {
          refetchGiving();
          fetchGivingAnalytics();
        }}
      />

    </div>
  );
};

export default MemberProfile;
