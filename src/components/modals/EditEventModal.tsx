import React, { useState } from 'react';
import { useEvent } from '../../context/EventContext';
import { CurrencyCode } from '../../types';
import { sanitizePlainText, sanitizeCurrencyAmount } from '../../utils/security';
import { Edit3, X, Calendar, DollarSign, Users, MapPin } from 'lucide-react';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({ isOpen, onClose }) => {
  const { plan, updateEventDetails } = useEvent();
  const { event } = plan;

  const [title, setTitle] = useState(event.title);
  const [subType, setSubType] = useState(event.subType || '');
  const [targetDate, setTargetDate] = useState(event.targetDate);
  const [startTime, setStartTime] = useState(event.startTime);
  const [endTime, setEndTime] = useState(event.endTime);
  const [venueName, setVenueName] = useState(event.venueName);
  const [city, setCity] = useState(event.city);
  const [guestCount, setGuestCount] = useState(event.guestCount.toString());
  const [totalTargetBudget, setTotalTargetBudget] = useState(event.totalTargetBudget.toString());
  const [currency, setCurrency] = useState<CurrencyCode>(event.currency);
  const [contingencyPercent, setContingencyPercent] = useState(event.contingencyPercent.toString());
  const [description, setDescription] = useState(event.description);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEventDetails({
      title: sanitizePlainText(title),
      subType: sanitizePlainText(subType),
      targetDate,
      startTime,
      endTime,
      venueName: sanitizePlainText(venueName),
      city: sanitizePlainText(city),
      guestCount: Math.max(1, parseInt(guestCount, 10) || 50),
      totalTargetBudget: sanitizeCurrencyAmount(totalTargetBudget),
      currency,
      contingencyPercent: Math.max(0, Math.min(50, parseInt(contingencyPercent, 10) || 10)),
      description: sanitizePlainText(description, 1000),
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edit-event-title">
      <div className="modal-card glass-panel">
        <div className="modal-header">
          <div className="flex-center gap-10">
            <Edit3 size={20} className="text-indigo" />
            <h3 id="edit-event-title">Edit Event Profile</h3>
          </div>
          <button
            type="button"
            className="btn-icon text-muted"
            onClick={onClose}
            aria-label="Close edit event modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body mt-20">
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <input
              type="text"
              className="input-control"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Event Subtitle / Type Details</label>
              <input
                type="text"
                className="input-control"
                value={subType}
                onChange={e => setSubType(e.target.value)}
                placeholder="e.g. Milestone 40th Birthday"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Date</label>
              <input
                type="date"
                className="input-control"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                className="input-control"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                className="input-control"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Venue Name</label>
              <input
                type="text"
                className="input-control"
                value={venueName}
                onChange={e => setVenueName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="input-control"
                value={city}
                onChange={e => setCity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Guest Count</label>
              <input
                type="number"
                className="input-control"
                value={guestCount}
                onChange={e => setGuestCount(e.target.value)}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Budget</label>
              <input
                type="number"
                className="input-control"
                value={totalTargetBudget}
                onChange={e => setTotalTargetBudget(e.target.value)}
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select
                className="select-control"
                value={currency}
                onChange={e => setCurrency(e.target.value as any)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Event Description & Vision</label>
            <textarea
              className="textarea-control"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-footer mt-20 flex-end gap-10">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
