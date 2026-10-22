import React, { useState } from 'react';
import { useEvent } from '../../context/EventContext';
import { MilestonePhase, MilestonePriority } from '../../types';
import { sanitizePlainText } from '../../utils/security';
import { CheckCircle2, X } from 'lucide-react';

interface AddMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMilestoneModal: React.FC<AddMilestoneModalProps> = ({ isOpen, onClose }) => {
  const { addMilestone } = useEvent();

  const [title, setTitle] = useState('');
  const [phase, setPhase] = useState<MilestonePhase>('2_to_1_months');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState<MilestonePriority>('high');
  const [category, setCategory] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDate) return;

    addMilestone({
      title: sanitizePlainText(title),
      phase,
      targetDate,
      completed: false,
      priority,
      category: sanitizePlainText(category) || undefined,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-milestone-title">
      <div className="modal-card glass-panel">
        <div className="modal-header">
          <div className="flex-center gap-10">
            <CheckCircle2 size={20} className="text-emerald" />
            <h3 id="add-milestone-title">Add Planning Milestone</h3>
          </div>
          <button type="button" className="btn-icon text-muted" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body mt-20">
          <div className="form-group">
            <label className="form-label">Milestone Title</label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Confirm Seating Chart & Print Escort Cards"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Planning Phase</label>
              <select
                className="select-control"
                value={phase}
                onChange={e => setPhase(e.target.value as MilestonePhase)}
              >
                <option value="12_to_9_months">12 to 9 Months Prior</option>
                <option value="8_to_6_months">8 to 6 Months Prior</option>
                <option value="5_to_3_months">5 to 3 Months Prior</option>
                <option value="2_to_1_months">2 to 1 Months Prior</option>
                <option value="2_weeks_prior">Final 2 Weeks</option>
                <option value="day_before">Day Before Rehearsal</option>
                <option value="day_of">Day Of</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Completion Date</label>
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
              <label className="form-label">Priority Level</label>
              <select
                className="select-control"
                value={priority}
                onChange={e => setPriority(e.target.value as MilestonePriority)}
              >
                <option value="critical">Critical (Must-Have)</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category / Department</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Decor, Catering, Permits"
                value={category}
                onChange={e => setCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer mt-20 flex-end gap-10">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-submit-milestone">
              Save Milestone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
