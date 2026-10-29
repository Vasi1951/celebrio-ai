import React, { useState, useEffect } from 'react';
import { useEvent } from '../../context/EventContext';
import { BudgetCategory, PaymentStatus } from '../../types';
import { sanitizePlainText, sanitizeCurrencyAmount } from '../../utils/security';
import { X, DollarSign } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addBudgetItem, plan } = useEvent();
  const { event } = plan;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('catering');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addBudgetItem({
      name: sanitizePlainText(name),
      category,
      estimatedCost: sanitizeCurrencyAmount(estimatedCost),
      actualCost: sanitizeCurrencyAmount(actualCost || estimatedCost),
      paidAmount: sanitizeCurrencyAmount(paidAmount),
      paymentStatus,
      dueDate: dueDate || undefined,
      notes: sanitizePlainText(notes, 500),
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-expense-title">
      <div className="modal-card glass-panel">
        <div className="modal-header">
          <div className="flex-center gap-10">
            <DollarSign size={20} className="text-indigo" />
            <h3 id="add-expense-title">Add Budget Expense</h3>
          </div>
          <button
            type="button"
            className="btn-icon text-muted"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body mt-20">
          <div className="form-group">
            <label className="form-label">Expense Description</label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Vintage Champagne Toast Flutes Rental"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="select-control"
                value={category}
                onChange={e => setCategory(e.target.value as BudgetCategory)}
              >
                <option value="venue">Venue & Location</option>
                <option value="catering">Catering & Beverages</option>
                <option value="photography">Photography & Video</option>
                <option value="entertainment">Entertainment & Music</option>
                <option value="decor_and_floral">Decor & Florals</option>
                <option value="attire_and_beauty">Attire & Styling</option>
                <option value="permits_and_safety">Permits & Safety</option>
                <option value="marketing_and_invites">Invites & Marketing</option>
                <option value="rentals">Rentals & Equipment</option>
                <option value="miscellaneous">Miscellaneous</option>
                <option value="contingency">Contingency Reserve</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select
                className="select-control"
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
              >
                <option value="unpaid">Unpaid</option>
                <option value="deposit_paid">Deposit Paid</option>
                <option value="paid_in_full">Paid in Full</option>
              </select>
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Estimated ({event.currency})</label>
              <input
                type="number"
                className="input-control"
                placeholder="1000"
                value={estimatedCost}
                onChange={e => setEstimatedCost(e.target.value)}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Actual / Agreed</label>
              <input
                type="number"
                className="input-control"
                placeholder="Optional"
                value={actualCost}
                onChange={e => setActualCost(e.target.value)}
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amount Paid</label>
              <input
                type="number"
                className="input-control"
                value={paidAmount}
                onChange={e => setPaidAmount(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Payment Due Date (Optional)</label>
              <input
                type="date"
                className="input-control"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Internal Notes</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Refundable damage deposit included"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer mt-24 flex-end gap-10">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-submit-expense">
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
