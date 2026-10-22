import React, { useState } from 'react';
import { useEvent } from '../../context/EventContext';
import { sanitizePlainText } from '../../utils/security';
import { Clock, X } from 'lucide-react';

interface AddRunOfShowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddRunOfShowModal: React.FC<AddRunOfShowModalProps> = ({ isOpen, onClose }) => {
  const { addRunOfShowItem, plan } = useEvent();
  const { event } = plan;

  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('17:00');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState(event.venueName || '');
  const [leadPerson, setLeadPerson] = useState('');
  const [notes, setNotes] = useState('');
  const [isMilestone, setIsMilestone] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;

    addRunOfShowItem({
      startTime,
      endTime,
      title: sanitizePlainText(title),
      location: sanitizePlainText(location),
      leadPerson: sanitizePlainText(leadPerson || 'Lead Coordinator'),
      notes: sanitizePlainText(notes, 500) || undefined,
      isMilestone,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-ros-title">
      <div className="modal-card glass-panel">
        <div className="modal-header">
          <div className="flex-center gap-10">
            <Clock size={20} className="text-cyan" />
            <h3 id="add-ros-title">Add Day-of Run-of-Show Activity</h3>
          </div>
          <button type="button" className="btn-icon text-muted" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body mt-20">
          <div className="form-group">
            <label className="form-label">Activity Title</label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Grand Entrance of Newlyweds & Welcome Toast"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
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
              <label className="form-label">Location / Room</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. East Lawn Terrace"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lead Person / MC / Team</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. DJ Kai & Maid of Honor"
                value={leadPerson}
                onChange={e => setLeadPerson(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Execution Notes / Logistics Instructions</label>
            <textarea
              className="textarea-control"
              rows={2}
              placeholder="e.g. Ensure champagne is poured beforehand. Spotlight on center stage."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="form-group flex-center gap-10">
            <input
              type="checkbox"
              id="isMilestoneHighlight"
              checked={isMilestone}
              onChange={e => setIsMilestone(e.target.checked)}
            />
            <label htmlFor="isMilestoneHighlight" className="cursor-pointer text-sm">
              Mark as Key Ceremony / Program Highlight
            </label>
          </div>

          <div className="modal-footer mt-20 flex-end gap-10">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-submit-activity">
              Save Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
