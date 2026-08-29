// /home/caleb/Desktop/PROJECTS/KHC/src/pages/AddMember.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useCreateMember } from '../hooks/useMembers';
import MemberForm from '../components/members/MemberForm';

export const AddMember = () => {
  const navigate = useNavigate();
  const createMutation = useCreateMember();

  const handleCreateSubmit = async (data) => {
    try {
      const newMember = await createMutation.mutateAsync(data);
      // Redirect to newly created member profile details
      navigate(`/members/${newMember.id}`);
    } catch (err) {
      console.error('Failed to create member:', err);
    }
  };

  return (
    <div className="animate-fade-in">
      
      {/* Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/members')}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', padding: '0.5rem 1rem' }}
        >
          <ArrowLeft size={16} />
          <span>Cancel</span>
        </button>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>
            Register <span className="gold-gradient-text">New Congregation Member</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Add personal profiles, administrative details, and set roles for KHC.
          </p>
        </div>
      </div>

      {/* Display mutation errors if any */}
      {createMutation.isError && (
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
          <span>Error registering member record: {createMutation.error.message}</span>
        </div>
      )}

      {/* Render member inputs editor form */}
      <MemberForm 
        onSubmit={handleCreateSubmit} 
        isLoading={createMutation.isPending} 
      />

    </div>
  );
};

export default AddMember;
