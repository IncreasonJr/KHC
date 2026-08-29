// /home/caleb/Desktop/PROJECTS/KHC/src/components/members/MemberCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Calendar, ArrowRight } from 'lucide-react';
import { getInitials, getAvatarBg, formatDate } from '../../utils/helpers';

export const MemberCard = ({ member }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/members/${member.id}`);
  };

  const cardStyle = {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    cursor: 'pointer',
    height: '100%'
  };

  return (
    <div 
      className="glass-panel animate-fade-in" 
      style={cardStyle}
      onClick={handleCardClick}
    >
      <div>
        {/* Profile Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          {member.photo_url ? (
            <img
              src={member.photo_url}
              alt={`${member.first_name} avatar`}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--gold-primary)'
              }}
            />
          ) : (
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: getAvatarBg(`${member.first_name} ${member.last_name}`),
              color: '#fff',
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

          <div>
            <h4 style={{ fontSize: '1rem', margin: 0, fontWeight: '600' }}>
              {member.first_name} {member.last_name}
            </h4>
            <span 
              className={`badge badge-${member.status.toLowerCase()}`}
              style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', marginTop: '0.25rem' }}
            >
              {member.status}
            </span>
          </div>
        </div>

        {/* Member contact points */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <Mail size={14} style={{ color: 'var(--gold-primary)' }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {member.email}
            </span>
          </div>

          {member.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Phone size={14} style={{ color: 'var(--gold-primary)' }} />
              <span>{member.phone}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <Calendar size={14} style={{ color: 'var(--gold-primary)' }} />
            <span>Joined {formatDate(member.join_date)}</span>
          </div>

        </div>
      </div>

      {/* Footer trigger */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '0.75rem',
        marginTop: '0.5rem'
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {member.role}
        </span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--gold-primary)', fontWeight: '500' }}>
          <span>View Profile</span>
          <ArrowRight size={14} />
        </div>
      </div>

    </div>
  );
};

export default MemberCard;
