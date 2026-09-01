// /home/caleb/Desktop/PROJECTS/KHC/src/components/common/Toast.jsx
import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

/**
 * Toast Notification Alert Component
 * @param {Object} props
 * @param {'success'|'error'|'warning'|'info'} props.type
 * @param {string} props.message
 * @param {Function} props.onClose
 * @param {number} props.duration - Auto close duration in ms
 */
export const Toast = ({ type = 'info', message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />,
    warning: <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} />,
    error: <XCircle size={20} style={{ color: 'var(--color-danger)' }} />,
    info: <Info size={20} style={{ color: 'var(--gold-primary)' }} />
  };

  const borderColors = {
    success: 'rgba(16, 185, 129, 0.3)',
    warning: 'rgba(245, 158, 11, 0.3)',
    error: 'rgba(239, 68, 68, 0.3)',
    info: 'rgba(37, 99, 235, 0.3)'
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem 1.25rem',
        backgroundColor: 'var(--bg-secondary)',
        border: `1px solid ${borderColors[type] || 'var(--border-color)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--text-primary)',
        fontSize: '0.9rem',
        maxWidth: '400px',
        animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      role="alert"
    >
      {icons[type] || icons.info}
      <span style={{ flex: 1, lineHeight: 1.4 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center'
          }}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Toast;
