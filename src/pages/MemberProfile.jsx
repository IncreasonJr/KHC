// /home/caleb/Desktop/PROJECTS/KHC/src/pages/MemberProfile.jsx
import React, { useState } from 'react';
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
  DollarSign, 
  AlertCircle,
  Clock,
  BookOpen,
  DollarSign as MoneyIcon
} from 'lucide-react';
import { 
  useMember, 
  useGiving, 
  useCreateGiving, 
  useDeleteMember 
} from '../hooks/useMembers';
import { getInitials, getAvatarBg, formatDate, formatCurrency } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const MemberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Queries
  const { data: member, isLoading: memberLoading, error: memberError } = useMember(id);
  const { data: givingRecords = [], isLoading: givingLoading } = useGiving(id);
  
  // Mutations
  const createGivingMutation = useCreateGiving();
  const deleteMemberMutation = useDeleteMember();

  // Giving Form States
  const [logAmount, setLogAmount] = useState('');
  const [logCategory, setLogCategory] = useState('Tithes');
  const [logMethod, setLogMethod] = useState('Cash');
  const [logNotes, setLogNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [loggingProgress, setLoggingProgress] = useState(false);

  const isLoading = memberLoading || givingLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

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

  // Calculate stats
  const totalGiven = givingRecords.reduce((sum, r) => sum + parseFloat(r.amount), 0);

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

  const handleGivingSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    const parsedAmount = parseFloat(logAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid amount greater than $0.00');
      return;
    }

    setLoggingProgress(true);
    try {
      await createGivingMutation.mutateAsync({
        member_id: member.id,
        amount: parsedAmount,
        category: logCategory,
        payment_method: logMethod,
        notes: logNotes,
        date: new Date().toISOString().split('T')[0] // today's date
      });
      
      setLogAmount('');
      setLogNotes('');
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to log giving record:', err);
      setFormError('Failed to record transaction. Please try again.');
    } finally {
      setLoggingProgress(false);
    }
  };

  return (
    <div className="animate-fade-in">
      
      {/* Back & Actions header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/members')}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
        >
          <ArrowLeft size={16} />
          <span>Registry Directory</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to={`/members/${member.id}/edit`} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit2 size={14} />
            <span>Edit Profile</span>
          </Link>
          <button onClick={handleDeleteMember} className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trash2 size={14} />
            <span>Delete Member</span>
          </button>
        </div>
      </div>

      {/* Grid: Profile Details + Financials */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Personal info & Administration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Profile Card */}
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            {member.photo_url ? (
              <img
                src={member.photo_url}
                alt={`${member.first_name} avatar`}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--gold-primary)',
                  marginBottom: '1.25rem',
                  boxShadow: 'var(--shadow-md)'
                }}
              />
            ) : (
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: getAvatarBg(`${member.first_name} ${member.last_name}`),
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '2rem',
                fontFamily: 'var(--font-heading)',
                border: '1.5px solid rgba(255, 255, 255, 0.1)',
                margin: '0 auto 1.25rem auto',
                boxShadow: 'var(--shadow-md)'
              }}>
                {getInitials(member.first_name, member.last_name)}
              </div>
            )}

            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {member.first_name} {member.last_name}
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>{member.role}</span>
              <span className={`badge badge-${member.status.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>{member.status}</span>
            </div>

            {/* Profile Contact specifics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                <Mail size={16} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
                <span style={{ wordBreak: 'break-all' }}>{member.email}</span>
              </div>

              {member.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <Phone size={16} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
                  <span>{member.phone}</span>
                </div>
              )}

              {member.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <MapPin size={16} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
                  <span>{member.address}</span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                <Calendar size={16} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
                <span>Joined {formatDate(member.join_date)}</span>
              </div>

              {member.date_of_birth && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <Clock size={16} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
                  <span>DOB: {formatDate(member.date_of_birth)}</span>
                </div>
              )}

            </div>
          </div>

          {/* Admin Notes Box */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
              <BookOpen size={16} />
              <span>Administrative Notes</span>
            </h4>
            <p style={{ fontSize: '0.9rem', color: member.notes ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {member.notes || 'No administrative notes registered for this member.'}
            </p>
          </div>

        </div>

        {/* Right Column: Financial tracking */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Financial summary card */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(197, 168, 128, 0.1)',
              color: 'var(--gold-primary)',
              border: '1.5px solid var(--border-color)'
            }}>
              <MoneyIcon size={26} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cumulative Giving</span>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', margin: 0, fontFamily: 'var(--font-heading)' }} className="gold-gradient-text">
                {formatCurrency(totalGiven)}
              </h3>
            </div>
          </div>

          {/* Add Giving contribution */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
              <Plus size={16} />
              <span>Log Contribution</span>
            </h4>

            {formError && (
              <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.85rem' }}>
                <AlertCircle size={14} /> {formError}
              </p>
            )}
            {formSuccess && (
              <p style={{ color: 'var(--color-success)', fontSize: '0.8rem', marginBottom: '0.85rem' }}>
                ✓ Contribution logged successfully.
              </p>
            )}

            <form onSubmit={handleGivingSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
              
              <div style={{ flex: '1', minWidth: '120px' }}>
                <label className="form-label" style={{ marginBottom: '0.35rem' }}>Amount ($)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={14} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="100.00"
                    value={logAmount}
                    onChange={(e) => setLogAmount(e.target.value)}
                    style={{ paddingLeft: '1.5rem', paddingRight: '0.5rem', height: '38px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: '0.35rem' }}>Category</label>
                <select 
                  className="form-control" 
                  value={logCategory} 
                  onChange={(e) => setLogCategory(e.target.value)}
                  style={{ height: '38px', padding: '0 1rem', width: '130px' }}
                >
                  <option value="Tithes">Tithes</option>
                  <option value="Offering">Offering</option>
                  <option value="Building Fund">Building Fund</option>
                  <option value="Missions">Missions</option>
                  <option value="Charity">Charity</option>
                  <option value="Special Event">Special Event</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: '0.35rem' }}>Method</label>
                <select 
                  className="form-control" 
                  value={logMethod} 
                  onChange={(e) => setLogMethod(e.target.value)}
                  style={{ height: '38px', padding: '0 1rem', width: '110px' }}
                >
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Online">Online</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <div style={{ flex: '1 1 100%' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Notes (optional, e.g. check no, donor instructions)"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  style={{ height: '38px' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={loggingProgress} 
                className="btn btn-primary"
                style={{ padding: '0 1.25rem', height: '38px', width: '100%' }}
              >
                {loggingProgress ? 'Saving...' : 'Record Transaction'}
              </button>

            </form>
          </div>

          {/* Giving History Ledger */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
              <span>Giving History Ledger</span>
            </h4>

            {givingRecords.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                No contribution transactions logged for this member.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table" style={{ width: '100%', fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Method</th>
                      <th>Notes</th>
                      <th style={{ textAlignment: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {givingRecords.map((record) => (
                      <tr key={record.id}>
                        <td>{formatDate(record.date)}</td>
                        <td>{record.category}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{record.payment_method}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem', maxWidth: '120px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={record.notes}>
                          {record.notes || '-'}
                        </td>
                        <td style={{ fontWeight: '700', color: 'var(--gold-primary)', textAlign: 'right' }}>
                          {formatCurrency(record.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default MemberProfile;
