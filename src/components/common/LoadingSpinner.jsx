// /home/caleb/Desktop/PROJECTS/KHC/src/components/common/LoadingSpinner.jsx
import React from 'react';

export const LoadingSpinner = ({ fullPage = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  const spinnerStyle = {
    width: size === 'sm' ? '24px' : size === 'lg' ? '64px' : '40px',
    height: size === 'sm' ? '24px' : size === 'lg' ? '64px' : '40px',
    borderRadius: '50%',
    border: '3px solid rgba(197, 168, 128, 0.1)',
    borderTopColor: 'var(--gold-primary)',
    animation: 'spin 1s linear infinite',
    display: 'inline-block'
  };

  const containerStyle = fullPage
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        gap: '1rem'
      }
    : {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 0',
        width: '100%',
        flexDirection: 'column',
        gap: '0.75rem'
      };

  return (
    <div style={containerStyle}>
      <span style={spinnerStyle} role="status" aria-label="loading"></span>
      {fullPage && (
        <p style={{ 
          color: 'var(--gold-primary)', 
          fontFamily: 'var(--font-heading)',
          fontWeight: 500,
          fontSize: '1rem',
          letterSpacing: '0.05em'
        }}>
          KHC CHURCH MANAGEMENT SYSTEM
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
