import React, { useState } from 'react';
import { useEvent } from '../../context/EventContext';
import { MilestonePhase } from '../../types';
import { formatDate, formatTime } from '../../utils/formatters';
import { generateICalendarData, generateRunOfShowSheet, downloadFile } from '../../utils/export';
import confetti from 'canvas-confetti';
import { CheckCircle2, Circle, Clock, Plus, Download, FileText, Sparkles, MapPin, User, AlertTriangle, Trash2 } from 'lucide-react';

interface TimelineViewProps {
  onAddMilestone: () => void;
  onAddRunOfShow: () => void;
  onAskAI: (prompt: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  onAddMilestone,
  onAddRunOfShow,
  onAskAI,
}) => {
  const { plan, toggleMilestone, deleteMilestone, deleteRunOfShowItem } = useEvent();
  const { event, milestones, runOfShow } = plan;

  const [activeTab, setActiveTab] = useState<'run_of_show' | 'milestones'>('run_of_show');

  // Trigger celebratory confetti on milestone completion
  const handleToggle = (id: string, currentState: boolean) => {
    toggleMilestone(id);
    if (!currentState) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  // Group milestones by phase
  const phases: { key: MilestonePhase; label: string }[] = [
    { key: '12_to_9_months', label: '12 to 9 Months Prior' },
    { key: '8_to_6_months', label: '8 to 6 Months Prior' },
    { key: '5_to_3_months', label: '5 to 3 Months Prior' },
    { key: '2_to_1_months', label: '2 to 1 Months Prior' },
    { key: '2_weeks_prior', label: 'Final 2 Weeks' },
    { key: 'day_before', label: 'Day Before Rehearsal / Setup' },
    { key: 'day_of', label: 'Day-of Milestones' },
  ];

  // Conflict detection for Run of Show
  const conflicts = React.useMemo(() => {
    const list: string[] = [];
    for (let i = 0; i < runOfShow.length - 1; i++) {
      const current = runOfShow[i];
      const next = runOfShow[i + 1];
      if (current.endTime > next.startTime) {
        list.push(`Time overlap between "${current.title}" (${current.endTime}) and "${next.title}" (${next.startTime})`);
      }
    }
    return list;
  }, [runOfShow]);

  return (
    <div className="timeline-view-container">
      {/* View Switcher Header */}
      <div className="timeline-header-row">
        <div className="view-toggle-pills" role="tablist">
          <button
            type="button"
            className={`pill-btn ${activeTab === 'run_of_show' ? 'active' : ''}`}
            onClick={() => setActiveTab('run_of_show')}
            role="tab"
            aria-selected={activeTab === 'run_of_show'}
            id="tab-run-of-show"
          >
            <Clock size={16} />
            <span>Day-of Run of Show ({runOfShow.length})</span>
          </button>

          <button
            type="button"
            className={`pill-btn ${activeTab === 'milestones' ? 'active' : ''}`}
            onClick={() => setActiveTab('milestones')}
            role="tab"
            aria-selected={activeTab === 'milestones'}
            id="tab-milestones"
          >
            <CheckCircle2 size={16} />
            <span>Planning Milestones ({milestones.filter(m => m.completed).length}/{milestones.length})</span>
          </button>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              const ics = generateICalendarData(plan);
              downloadFile(ics, `${plan.event.title.replace(/ /g, '_')}_schedule.ics`, 'text/calendar');
            }}
            title="Download iCal file for Google Calendar / Apple Calendar"
          >
            <Download size={14} />
            <span>Sync iCal</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              const doc = generateRunOfShowSheet(plan);
              downloadFile(doc, `${plan.event.title.replace(/ /g, '_')}_coordinator_sheet.txt`, 'text/plain');
            }}
            title="Download printable Coordinator Run of Show"
          >
            <FileText size={14} />
            <span>Print Sheet</span>
          </button>

          {activeTab === 'run_of_show' ? (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onAddRunOfShow}
              id="btn-add-activity"
            >
              <Plus size={16} />
              <span>Add Activity</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onAddMilestone}
              id="btn-add-milestone"
            >
              <Plus size={16} />
              <span>Add Milestone</span>
            </button>
          )}
        </div>
      </div>

      {/* Timing Conflict Warning Banner */}
      {conflicts.length > 0 && activeTab === 'run_of_show' && (
        <div className="alert-banner alert-banner-warning mt-16" role="alert">
          <AlertTriangle size={20} className="text-warning flex-shrink-0" />
          <div className="alert-content">
            <strong>Schedule Warning Detected:</strong> {conflicts[0]}
          </div>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => onAskAI(`I have a timeline overlap: ${conflicts[0]}. How should I adjust the schedule?`)}
          >
            <Sparkles size={14} className="text-indigo" />
            <span>Fix with AI</span>
          </button>
        </div>
      )}

      {/* Tab 1: Day-of Run-of-Show Minute-by-Minute */}
      {activeTab === 'run_of_show' && (
        <div className="run-of-show-timeline mt-24">
          <div className="ros-track">
            {runOfShow.map((item) => (
              <div
                key={item.id}
                className={`ros-card glass-panel ${item.isMilestone ? 'border-accent-milestone' : ''}`}
              >
                <div className="ros-time-block">
                  <div className="time-start">{formatTime(item.startTime)}</div>
                  <div className="time-divider">to</div>
                  <div className="time-end">{formatTime(item.endTime)}</div>
                </div>

                <div className="ros-content">
                  <div className="ros-top-line">
                    <h4 className="ros-title">{item.title}</h4>
                    {item.isMilestone && (
                      <span className="badge badge-warning">Key Highlight</span>
                    )}
                  </div>

                  <div className="ros-meta-row">
                    <span className="meta-item">
                      <MapPin size={14} className="text-muted" />
                      <span>{item.location || event.venueName}</span>
                    </span>
                    <span className="meta-item">
                      <User size={14} className="text-muted" />
                      <span>Lead: <strong>{item.leadPerson}</strong></span>
                    </span>
                  </div>

                  {item.notes && (
                    <div className="ros-notes">
                      💡 <em>{item.notes}</em>
                    </div>
                  )}
                </div>

                <div className="ros-actions">
                  <button
                    type="button"
                    className="btn-icon text-muted hover-danger"
                    onClick={() => deleteRunOfShowItem(item.id)}
                    aria-label={`Delete activity: ${item.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="timeline-ai-banner glass-panel mt-24">
            <div className="ai-banner-content">
              <Sparkles size={22} className="text-indigo" />
              <div>
                <h4>Need buffer optimization?</h4>
                <p>Celebrio AI can scan your full schedule for photography daylight windows and catering service delays.</p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onAskAI('Audit my day-of schedule for realistic buffer times between stages')}
            >
              Audit Run-of-Show
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Planning Milestones by Phase */}
      {activeTab === 'milestones' && (
        <div className="milestones-container mt-24">
          {phases.map(phase => {
            const itemsInPhase = milestones.filter(m => m.phase === phase.key);
            if (itemsInPhase.length === 0) return null;

            return (
              <div key={phase.key} className="phase-group">
                <div className="phase-header">
                  <h3>{phase.label}</h3>
                  <span className="badge badge-subtle">
                    {itemsInPhase.filter(m => m.completed).length} / {itemsInPhase.length} done
                  </span>
                </div>

                <div className="milestones-list">
                  {itemsInPhase.map(milestone => (
                    <div
                      key={milestone.id}
                      className={`milestone-card glass-panel ${milestone.completed ? 'completed' : ''}`}
                    >
                      <button
                        type="button"
                        className="checkbox-btn"
                        onClick={() => handleToggle(milestone.id, milestone.completed)}
                        aria-label={`Mark "${milestone.title}" as ${milestone.completed ? 'incomplete' : 'complete'}`}
                        aria-pressed={milestone.completed}
                      >
                        {milestone.completed ? (
                          <CheckCircle2 size={22} className="text-emerald" />
                        ) : (
                          <Circle size={22} className="text-muted" />
                        )}
                      </button>

                      <div className="milestone-details">
                        <div className="milestone-title-row">
                          <span className={`milestone-title ${milestone.completed ? 'line-through text-muted' : ''}`}>
                            {milestone.title}
                          </span>
                          <span className={`badge ${
                            milestone.priority === 'critical' ? 'badge-danger' :
                            milestone.priority === 'high' ? 'badge-warning' : 'badge-subtle'
                          }`}>
                            {milestone.priority}
                          </span>
                        </div>

                        <div className="milestone-meta">
                          <span>Target: {formatDate(milestone.targetDate)}</span>
                          {milestone.category && <span>• {milestone.category}</span>}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-icon text-muted hover-danger"
                        onClick={() => deleteMilestone(milestone.id)}
                        aria-label={`Delete milestone: ${milestone.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
