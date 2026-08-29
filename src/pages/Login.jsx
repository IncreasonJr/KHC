// /home/caleb/Desktop/PROJECTS/KHC/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Church, Lock, Mail, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const { login, user, loading, error: authError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email || !password) {
      setValidationError('Please enter both administrative email and password.');
      return;
    }

    setLocalLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Error handled by useAuth state, but caught here to toggle loaders
      console.error('Authentication attempt rejected:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const loginPageStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    position: 'relative',
    backgroundColor: 'var(--bg-primary)'
  };

  const formCardStyle = {
    width: '100%',
    maxWidth: '500px',
    padding: '3.5rem 3rem',
    textAlign: 'center',
  };

  return (
    <div style={loginPageStyle}>
      {/* Decorative ambient background spots */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(197, 168, 128, 0.05) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '20%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(30, 45, 74, 0.4) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div className="glass-panel animate-slide-up" style={{ ...formCardStyle, zIndex: 1 }}>
        
        {/* Church Logo Icon */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          background: 'rgba(197, 168, 128, 0.1)',
          color: 'var(--gold-primary)',
          border: '1.5px solid var(--border-color)',
          marginBottom: '1.5rem'
        }}>
          <Church size={28} />
        </div>

        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: '700' }} className="gold-gradient-text">
          Kings Heritage Chapel
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Administrative Portal Login
        </p>

        {/* Display validation or system authentication errors */}
        {(validationError || authError) && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            textAlign: 'left',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{validationError || authError}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit}>
          
          {/* Email input field */}
          <div className="form-group" style={{ textAlign: 'left', position: 'relative' }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-control"
                placeholder="admin@church.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password input field */}
          <div className="form-group" style={{ textAlign: 'left', position: 'relative', marginBottom: '2rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
                tabIndex="-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={localLoading || loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem' }}
          >
            {localLoading || loading ? (
              <>
                <RefreshCw size={18} style={{ animation: 'spin 1.5s linear infinite' }} />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>

        </form>

        {/* Temporary credentials indicator */}
        <div style={{
          marginTop: '2rem',
          padding: '0.75rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(197, 168, 128, 0.04)',
          border: '1px solid rgba(197, 168, 128, 0.08)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}>
          <p style={{ fontWeight: '600', color: 'var(--gold-primary)', marginBottom: '0.25rem' }}>Demo Credentials</p>
          <p>Email: <span style={{ color: 'var(--text-primary)' }}>admin@church.com</span></p>
          <p>Password: <span style={{ color: 'var(--text-primary)' }}>admin123</span></p>
        </div>

      </div>
    </div>
  );
};

export default Login;
