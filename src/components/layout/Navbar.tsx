import React, { useState } from 'react';
import { useEvent } from '../../context/EventContext';
import { EventType } from '../../types';
import { Sparkles, Calendar, Heart, PartyPopper, Users, Settings, Download, FileText, RotateCcw, Eye } from 'lucide-react';
import { generateICalendarData, downloadFile, generateRunOfShowSheet } from '../../utils/export';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenEditEvent: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings, onOpenEditEvent }) => {
  const { activeEventType, switchEventType, plan, resetToSeed } = useEvent();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const toggleHighContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    document.body.classList.toggle('high-contrast', next);
  };

  const handleExportICal = () => {
    const icsData = generateICalendarData(plan);
    const cleanTitle = plan.event.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadFile(icsData, `${cleanTitle}_timeline.ics`, 'text/calendar;charset=utf-8');
    setShowExportMenu(false);
  };

  const handleExportTextSheet = () => {
    const sheetData = generateRunOfShowSheet(plan);
    const cleanTitle = plan.event.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadFile(sheetData, `${cleanTitle}_run_of_show.txt`, 'text/plain;charset=utf-8');
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    const jsonData = JSON.stringify(plan, null, 2);
    const cleanTitle = plan.event.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadFile(jsonData, `${cleanTitle}_backup.json`, 'application/json');
    setShowExportMenu(false);
  };

  const handleReset = () => {
    if (window.confirm(`Reset "${plan.event.title}" back to sample template? Any custom changes will be restored to seed.`)) {
      resetToSeed(activeEventType);
    }
  };

  return (
    <header className="navbar-container" role="banner">
      <div className="navbar-inner">
        {/* Logo & Brand */}
        <div className="navbar-brand">
          <div className="brand-icon" aria-hidden="true">
            <Sparkles size={22} className="sparkle-svg" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Celebrio<span className="brand-accent">AI</span></span>
            <span className="brand-subtitle">GenAI Event Architect</span>
          </div>
        </div>

        {/* Persona Switcher Tabs */}
        <nav className="persona-switcher" aria-label="Event Type Selection">
          <button
            type="button"
            className={`persona-btn ${activeEventType === 'wedding' ? 'active-wedding' : ''}`}
            onClick={() => switchEventType('wedding')}
            aria-pressed={activeEventType === 'wedding'}
            id="tab-wedding"
          >
            <Heart size={16} aria-hidden="true" />
            <span>Weddings</span>
          </button>

          <button
            type="button"
            className={`persona-btn ${activeEventType === 'birthday' ? 'active-birthday' : ''}`}
            onClick={() => switchEventType('birthday')}
            aria-pressed={activeEventType === 'birthday'}
            id="tab-birthday"
          >
            <PartyPopper size={16} aria-hidden="true" />
            <span>Birthdays</span>
          </button>

          <button
            type="button"
            className={`persona-btn ${activeEventType === 'community' ? 'active-community' : ''}`}
            onClick={() => switchEventType('community')}
            aria-pressed={activeEventType === 'community'}
            id="tab-community"
          >
            <Users size={16} aria-hidden="true" />
            <span>Community</span>
          </button>
        </nav>

        {/* Global Controls & Actions */}
        <div className="navbar-actions">
          {/* High Contrast Mode Toggle */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={toggleHighContrast}
            title={highContrast ? 'Disable High Contrast' : 'Enable High Contrast'}
            aria-label="Toggle High Contrast Display Mode"
          >
            <Eye size={16} />
            <span className="hide-mobile">{highContrast ? 'Standard' : 'Contrast'}</span>
          </button>

          {/* Export Dropdown */}
          <div className="export-dropdown-wrapper">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
              aria-expanded={showExportMenu}
              aria-haspopup="true"
              id="export-dropdown-btn"
            >
              <Download size={15} />
              <span>Export</span>
            </button>

            {showExportMenu && (
              <div className="export-menu glass-panel" role="menu">
                <button
                  type="button"
                  className="export-menu-item"
                  onClick={handleExportICal}
                  role="menuitem"
                >
                  <Calendar size={15} />
                  <div>
                    <div className="item-title">iCalendar (.ics)</div>
                    <div className="item-desc">Import into Google, Apple, or Outlook Calendar</div>
                  </div>
                </button>
                <button
                  type="button"
                  className="export-menu-item"
                  onClick={handleExportTextSheet}
                  role="menuitem"
                >
                  <FileText size={15} />
                  <div>
                    <div className="item-title">Coordinator Run-of-Show</div>
                    <div className="item-desc">Printable schedule for day-of staff</div>
                  </div>
                </button>
                <button
                  type="button"
                  className="export-menu-item"
                  onClick={handleExportJSON}
                  role="menuitem"
                >
                  <Download size={15} />
                  <div>
                    <div className="item-title">JSON Plan Backup</div>
                    <div className="item-desc">Full machine-readable event state</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Reset Template */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleReset}
            title="Reset to Template Defaults"
            aria-label="Reset this event to sample template"
          >
            <RotateCcw size={15} />
            <span className="hide-mobile">Reset</span>
          </button>

          {/* AI Settings */}
          <button
            type="button"
            className="btn btn-primary btn-sm ai-settings-btn"
            onClick={onOpenSettings}
            aria-label="Open AI Engine and API Key Settings"
            id="ai-settings-btn"
          >
            <Settings size={15} />
            <span>AI Engine</span>
          </button>
        </div>
      </div>
    </header>
  );
};
