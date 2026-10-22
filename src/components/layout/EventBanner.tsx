import React from 'react';
import { useEvent } from '../../context/EventContext';
import { formatDate, formatCurrency, formatRelativeCountdown, calculateBudgetSummary } from '../../utils/formatters';
import { Calendar, MapPin, Users, DollarSign, Edit3, CheckCircle2 } from 'lucide-react';

interface EventBannerProps {
  onEdit: () => void;
}

export const EventBanner: React.FC<EventBannerProps> = ({ onEdit }) => {
  const { plan, activeEventType } = useEvent();
  const { event, milestones, budgetItems } = plan;

  const budgetSummary = calculateBudgetSummary(budgetItems, event.totalTargetBudget, event.contingencyPercent);
  const completedMilestones = milestones.filter(m => m.completed).length;
  const countdownText = formatRelativeCountdown(event.targetDate);

  const getPersonaBadgeClass = () => {
    if (activeEventType === 'wedding') return 'badge-wedding';
    if (activeEventType === 'birthday') return 'badge-birthday';
    return 'badge-community';
  };

  return (
    <section className="event-banner glass-panel" aria-label="Event Overview">
      <div className="banner-top-row">
        <div className="banner-title-area">
          <div className="banner-tags">
            <span className={`badge ${getPersonaBadgeClass()}`}>
              {event.eventType.toUpperCase()}
            </span>
            {event.subType && (
              <span className="badge badge-subtle">{event.subType}</span>
            )}
            <span className="badge badge-countdown" aria-label={`Countdown: ${countdownText}`}>
              <Calendar size={13} aria-hidden="true" />
              {countdownText}
            </span>
          </div>

          <h1 className="banner-heading">{event.title}</h1>
          <p className="banner-description">{event.description}</p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm edit-details-btn"
          onClick={onEdit}
          aria-label="Edit Event Details and Configuration"
          id="btn-edit-event-details"
        >
          <Edit3 size={15} />
          <span>Edit Event</span>
        </button>
      </div>

      <div className="banner-stats-grid">
        {/* Date & Location */}
        <div className="stat-card">
          <div className="stat-icon-wrapper text-indigo">
            <Calendar size={20} aria-hidden="true" />
          </div>
          <div>
            <div className="stat-label">Date & Time</div>
            <div className="stat-value">{formatDate(event.targetDate)}</div>
            <div className="stat-subtext">{event.startTime} - {event.endTime}</div>
          </div>
        </div>

        {/* Location */}
        <div className="stat-card">
          <div className="stat-icon-wrapper text-rose">
            <MapPin size={20} aria-hidden="true" />
          </div>
          <div>
            <div className="stat-label">Venue & City</div>
            <div className="stat-value truncate" title={`${event.venueName}, ${event.city}`}>
              {event.venueName}
            </div>
            <div className="stat-subtext">{event.city}, {event.stateOrCountry}</div>
          </div>
        </div>

        {/* Guests */}
        <div className="stat-card">
          <div className="stat-icon-wrapper text-emerald">
            <Users size={20} aria-hidden="true" />
          </div>
          <div>
            <div className="stat-label">Confirmed Guests</div>
            <div className="stat-value">{event.guestCount.toLocaleString()}</div>
            <div className="stat-subtext">Attending Persons</div>
          </div>
        </div>

        {/* Target Budget */}
        <div className="stat-card">
          <div className="stat-icon-wrapper text-amber">
            <DollarSign size={20} aria-hidden="true" />
          </div>
          <div>
            <div className="stat-label">Target Budget</div>
            <div className="stat-value">{formatCurrency(event.totalTargetBudget, event.currency)}</div>
            <div className="stat-subtext">
              {formatCurrency(budgetSummary.totalActual, event.currency)} committed
            </div>
          </div>
        </div>

        {/* Milestones Progress */}
        <div className="stat-card">
          <div className="stat-icon-wrapper text-cyan">
            <CheckCircle2 size={20} aria-hidden="true" />
          </div>
          <div>
            <div className="stat-label">Planning Milestones</div>
            <div className="stat-value">
              {completedMilestones} / {milestones.length}
            </div>
            <div className="stat-subtext">
              {Math.round((completedMilestones / (milestones.length || 1)) * 100)}% completed
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
