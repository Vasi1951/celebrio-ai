import React, { useState } from 'react';
import { EventProvider, useEvent } from './context/EventContext';
import { Navbar } from './components/layout/Navbar';
import { EventBanner } from './components/layout/EventBanner';
import { BudgetView } from './components/budget/BudgetView';
import { TimelineView } from './components/timeline/TimelineView';
import { VendorView } from './components/vendors/VendorView';
import { IdeasView } from './components/ideas/IdeasView';
import { AssistantDrawer } from './components/chat/AssistantDrawer';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Modals
import { EditEventModal } from './components/modals/EditEventModal';
import { AISettingsModal } from './components/modals/AISettingsModal';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { AddMilestoneModal } from './components/modals/AddMilestoneModal';
import { AddRunOfShowModal } from './components/modals/AddRunOfShowModal';
import { AddVendorModal } from './components/modals/AddVendorModal';

import { DollarSign, Clock, Store, Sparkles } from 'lucide-react';
import './App.css';

type ActiveTab = 'budget' | 'timeline' | 'vendors' | 'ideas';

const MainAppContent: React.FC = () => {
  const { plan } = useEvent();
  const [activeTab, setActiveTab] = useState<ActiveTab>('budget');

  // Modals state
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [isAddRunOfShowOpen, setIsAddRunOfShowOpen] = useState(false);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);

  // Assistant Drawer state
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [pendingAIPrompt, setPendingAIPrompt] = useState<string | undefined>();

  const handleAskAI = (prompt: string) => {
    setPendingAIPrompt(prompt);
    setIsAssistantOpen(true);
  };

  return (
    <div className="app-container">
      {/* Accessibility Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Top Navigation */}
      <Navbar
        onOpenSettings={() => setIsAISettingsOpen(true)}
        onOpenEditEvent={() => setIsEditEventOpen(true)}
      />

      <main id="main-content" className="main-content" role="main">
        {/* Event Header Banner */}
        <EventBanner onEdit={() => setIsEditEventOpen(true)} />

        {/* Primary Tab Navigation */}
        <nav className="main-nav-tabs" role="tablist" aria-label="Planning Sections">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'budget' ? 'active' : ''}`}
            onClick={() => setActiveTab('budget')}
            role="tab"
            aria-selected={activeTab === 'budget'}
            id="tab-btn-budget"
          >
            <DollarSign size={18} aria-hidden="true" />
            <span>Budget & Allocations ({plan.budgetItems.length})</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
            role="tab"
            aria-selected={activeTab === 'timeline'}
            id="tab-btn-timeline"
          >
            <Clock size={18} aria-hidden="true" />
            <span>Timeline & Run-of-Show ({plan.runOfShow.length})</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'vendors' ? 'active' : ''}`}
            onClick={() => setActiveTab('vendors')}
            role="tab"
            aria-selected={activeTab === 'vendors'}
            id="tab-btn-vendors"
          >
            <Store size={18} aria-hidden="true" />
            <span>Vendor Checklists & Bids ({plan.vendors.length})</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'ideas' ? 'active' : ''}`}
            onClick={() => setActiveTab('ideas')}
            role="tab"
            aria-selected={activeTab === 'ideas'}
            id="tab-btn-ideas"
          >
            <Sparkles size={18} aria-hidden="true" />
            <span>Personalized Ideas & Themes</span>
          </button>
        </nav>

        {/* Tab Panels */}
        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-btn-${activeTab}`}>
          {activeTab === 'budget' && (
            <BudgetView
              onAddExpense={() => setIsAddExpenseOpen(true)}
              onAskAI={handleAskAI}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineView
              onAddMilestone={() => setIsAddMilestoneOpen(true)}
              onAddRunOfShow={() => setIsAddRunOfShowOpen(true)}
              onAskAI={handleAskAI}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorView
              onAddVendor={() => setIsAddVendorOpen(true)}
              onAskAI={handleAskAI}
            />
          )}

          {activeTab === 'ideas' && (
            <IdeasView onAskAI={handleAskAI} />
          )}
        </div>
      </main>

      {/* Floating AI Assistant Trigger Button */}
      {!isAssistantOpen && (
        <button
          type="button"
          className="btn btn-primary floating-assistant-toggle"
          onClick={() => setIsAssistantOpen(true)}
          aria-label="Open Celebrio AI Planning Copilot"
          id="btn-open-assistant"
        >
          <Sparkles size={18} />
          <span>Ask Celebrio AI</span>
        </button>
      )}

      {/* Assistant Drawer */}
      <AssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        externalPrompt={pendingAIPrompt}
        onClearExternalPrompt={() => setPendingAIPrompt(undefined)}
      />

      {/* Application Modals */}
      <EditEventModal
        isOpen={isEditEventOpen}
        onClose={() => setIsEditEventOpen(false)}
      />

      <AISettingsModal
        isOpen={isAISettingsOpen}
        onClose={() => setIsAISettingsOpen(false)}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />

      <AddMilestoneModal
        isOpen={isAddMilestoneOpen}
        onClose={() => setIsAddMilestoneOpen(false)}
      />

      <AddRunOfShowModal
        isOpen={isAddRunOfShowOpen}
        onClose={() => setIsAddRunOfShowOpen(false)}
      />

      <AddVendorModal
        isOpen={isAddVendorOpen}
        onClose={() => setIsAddVendorOpen(false)}
      />

      {/* Footer */}
      <footer className="app-footer" role="contentinfo">
        <div className="footer-inner">
          <div>
            <strong>Celebrio AI</strong> • GenAI Celebration & Event Planner (Challenge 5)
          </div>
          <div className="flex-center gap-16 text-muted">
            <span>⚡ Dual Engine: Gemini Cloud & Local Heuristic</span>
            <span>🔒 Zero Data Leakage</span>
            <span>♿ WCAG 2.1 AA Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <EventProvider>
        <MainAppContent />
      </EventProvider>
    </ErrorBoundary>
  );
}
