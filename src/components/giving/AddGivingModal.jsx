// /home/caleb/Desktop/PROJECTS/KHC/src/components/giving/AddGivingModal.jsx
import React, { useState } from 'react';
import { X, DollarSign, Calendar, Tag, CreditCard, FileText } from 'lucide-react';
import { givingService } from '../../services/givingService';

/**
 * Add Giving Contribution Record Modal Component
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {string} props.memberId
 * @param {Function} props.onSuccess
 */
export const AddGivingModal = ({ isOpen, onClose, memberId, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Tithes');
  const [paymentMethod, setPaymentMethod] = useState('Mobile Money');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid contribution amount.');
      return;
    }

    setLoading(true);
    try {
      await givingService.createGiving({
        member_id: memberId,
        amount: parseFloat(amount),
        category,
        payment_method: paymentMethod,
        date,
        notes
      });
      setAmount('');
      setNotes('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to submit giving contribution:', err);
      setError('Failed to record contribution. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xl)',
          padding: '2rem',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', margin: 0 }}>
              Record Contribution
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Add a new financial transaction for this member
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--color-danger)',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Amount */}
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
            <label className="form-label">Amount (GH₵)</label>
            <div style={{ position: 'relative' }}>
              <DollarSign size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                className="form-control"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
            <label className="form-label">Contribution Category</label>
            <div style={{ position: 'relative' }}>
              <Tag size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              >
                <option value="Tithes">Tithes</option>
                <option value="Welfare">Welfare</option>
                <option value="Offering">Offering</option>
                <option value="Missions">Missions</option>
                <option value="Building Fund">Building Fund</option>
                <option value="Special Seed">Special Seed</option>
              </select>
            </div>
          </div>

          {/* Date & Payment Method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ textAlign: 'left', margin: 0 }}>
              <label className="form-label">Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="date"
                  required
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ textAlign: 'left', margin: 0 }}>
              <label className="form-label">Payment Method</label>
              <div style={{ position: 'relative' }}>
                <CreditCard size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <select
                  className="form-control"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                >
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Online Card">Online Card</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes / Receipt No */}
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <label className="form-label">Notes / Receipt Reference (Optional)</label>
            <div style={{ position: 'relative' }}>
              <FileText size={16} style={{ position: 'absolute', left: '0.85rem', top: '0.85rem', color: 'var(--text-muted)' }} />
              <textarea
                className="form-control"
                placeholder="Optional transaction memo, receipt reference, or note..."
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Recording...' : 'Save Contribution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGivingModal;
