// /home/caleb/Desktop/PROJECTS/KHC/src/pages/EditMember.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useMember, useUpdateMember } from '../hooks/useMembers';
import MemberForm from '../components/members/MemberForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const EditMember = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Queries & Mutations
  const { data: member, isLoading: memberLoading, error: fetchError } = useMember(id);
  const updateMutation = useUpdateMember();

  const handleEditSubmit = async (data) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data
      });
      // Redirect back to profile details
      navigate(`/members/${id}`);
    } catch (err) {
      console.error('Failed to update member registry record:', err);
    }
  };

  if (memberLoading) {
    return <LoadingSpinner />;
  }

  if (fetchError || !member) {
    return (
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--color-danger)' }}>
        <AlertCircle size={40} style={{ margin: '0 auto 1rem auto' }} />
        <h3>Failed to Load Profile</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          {fetchError?.message || 'Could not locate member details.'}
        </p>
        <button onClick={() => navigate('/members')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      
      {/* Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(`/members/${id}`)}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', padding: '0.5rem 1rem' }}
        >
          <ArrowLeft size={16} />
          <span>Cancel</span>
        </button>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>
            Edit Member: <span className="gold-gradient-text">{member.first_name} {member.last_name}</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Update contact numbers, roles, addresses, or status parameters in the database.
          </p>
        </div>
      </div>

      {/* Display update error triggers */}
      {updateMutation.isError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-danger)',
          fontSize: '0.9rem',
          marginBottom: '1.5rem'
        }}>
          <AlertCircle size={20} />
          <span>Failed to apply edits: {updateMutation.error.message}</span>
        </div>
      )}

      {/* Render member form with default loaded values */}
      <MemberForm 
        onSubmit={handleEditSubmit} 
        defaultValues={member}
        isLoading={updateMutation.isPending} 
      />

    </div>
  );
};

export default EditMember;
