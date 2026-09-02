import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Home, ArrowLeft, AlertCircle } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <div
        className="glass-panel animate-slide-up"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '3rem 2.5rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        {/* Church Logo Badge */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(15, 23, 42, 0.4))',
            border: '2px solid var(--gold-primary)',
            color: 'var(--gold-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <Shield size={40} />
        </div>

        <h1
          style={{
            fontSize: '4rem',
            fontWeight: 800,
            color: 'var(--gold-primary)',
            margin: 0,
            fontFamily: 'var(--font-heading)',
            lineHeight: 1
          }}
        >
          404
        </h1>

        <h2
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginTop: '0.5rem',
            marginBottom: '0.75rem',
            fontFamily: 'var(--font-heading)'
          }}
        >
          Page Not Found
        </h2>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            marginBottom: '2rem'
          }}
        >
          The page or system record you are searching for does not exist or may have been relocated in the Kings Heritage Chapel management directory.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>

          <Link
            to="/dashboard"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
          >
            <Home size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
