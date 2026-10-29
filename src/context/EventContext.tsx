import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  EventType,
  EventDetails,
  FullEventPlan,
  BudgetItem,
  MilestoneItem,
  RunOfShowItem,
  VendorItem,
  GeneratedIdea,
  EventTheme,
  ChatMessage,
  AISettings,
  ActionProposal,
} from '../types';
import { SEED_EVENTS } from '../data/seedEvents';
import { askGeminiAssistant } from '../services/geminiService';
import { validateActionProposal, checkRateLimit } from '../utils/security';

interface EventContextType {
  activeEventType: EventType;
  switchEventType: (type: EventType) => void;
  plan: FullEventPlan;
  updateEventDetails: (details: Partial<EventDetails>) => void;
  
  // Budget Operations
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;

  // Timeline Operations
  addMilestone: (milestone: Omit<MilestoneItem, 'id'>) => void;
  toggleMilestone: (id: string) => void;
  deleteMilestone: (id: string) => void;

  // Run of Show Operations
  addRunOfShowItem: (item: Omit<RunOfShowItem, 'id'>) => void;
  updateRunOfShowItem: (id: string, updates: Partial<RunOfShowItem>) => void;
  deleteRunOfShowItem: (id: string) => void;

  // Vendor Operations
  addVendor: (vendor: Omit<VendorItem, 'id'>) => void;
  updateVendor: (id: string, updates: Partial<VendorItem>) => void;
  deleteVendor: (id: string) => void;
  toggleVendorTask: (vendorId: string, taskId: string) => void;

  // Ideas & Themes
  saveIdea: (idea: GeneratedIdea) => void;
  removeIdea: (ideaId: string) => void;
  applyTheme: (theme: Partial<EventTheme>) => void;
  resetToSeed: (type: EventType) => void;

  // AI & Chat
  aiSettings: AISettings;
  updateAISettings: (settings: Partial<AISettings>) => void;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  sendChatMessage: (text: string) => Promise<void>;
  applyActionProposal: (proposal: ActionProposal) => void;
  clearChat: () => void;
}

const STORAGE_PREFIX = 'celebrio_plan_v1_';
const SETTINGS_KEY = 'celebrio_ai_settings_v1';

const DEFAULT_AI_SETTINGS: AISettings = {
  apiKey: '',
  model: 'heuristic_offline',
  temperature: 0.7,
  useHeuristicFallback: true,
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeEventType, setActiveEventType] = useState<EventType>('wedding');

  // Load initial plan from localStorage or seed
  const [plan, setPlan] = useState<FullEventPlan>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}wedding`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return SEED_EVENTS.wedding;
  });

  // AI Settings
  const [aiSettings, setAISettings] = useState<AISettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load AI settings', e);
    }
    return DEFAULT_AI_SETTINGS;
  });

  // Chat conversation
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: "👋 Welcome to **Celebrio AI**! I'm your GenAI Celebration & Event Planning Copilot. Ask me to balance your budget, review your timeline run-of-show, brainstorm themes, or craft heartfelt speeches.",
      timestamp: '10:00 AM',
      suggestedPrompts: [
        'How can I cut $1,500 from this budget?',
        'Review our day-of run-of-show schedule',
        'Suggest 3 signature cocktail recipes',
      ],
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Sync plan to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${activeEventType}`, JSON.stringify(plan));
    } catch (e) {
      console.warn('Failed saving plan to localStorage', e);
    }
  }, [plan, activeEventType]);

  // Sync AI settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(aiSettings));
    } catch (e) {
      console.warn('Failed saving settings to localStorage', e);
    }
  }, [aiSettings]);

  // Switch Event Type
  const switchEventType = useCallback((type: EventType) => {
    setActiveEventType(type);
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}${type}`);
      if (saved) {
        setPlan(JSON.parse(saved));
        return;
      }
    } catch (e) {
      console.warn('Error loading event type', e);
    }
    setPlan(SEED_EVENTS[type]);
  }, []);

  const resetToSeed = useCallback((type: EventType) => {
    setPlan(SEED_EVENTS[type]);
    localStorage.removeItem(`${STORAGE_PREFIX}${type}`);
  }, []);

  const updateEventDetails = useCallback((details: Partial<EventDetails>) => {
    setPlan(prev => ({
      ...prev,
      event: { ...prev.event, ...details, updatedAt: new Date().toISOString() },
    }));
  }, []);

  // Budget
  const addBudgetItem = useCallback((item: Omit<BudgetItem, 'id'>) => {
    const newItem: BudgetItem = { ...item, id: `b-${Date.now()}` };
    setPlan(prev => ({
      ...prev,
      budgetItems: [newItem, ...prev.budgetItems],
    }));
  }, []);

  const updateBudgetItem = useCallback((id: string, updates: Partial<BudgetItem>) => {
    setPlan(prev => ({
      ...prev,
      budgetItems: prev.budgetItems.map(item => (item.id === id ? { ...item, ...updates } : item)),
    }));
  }, []);

  const deleteBudgetItem = useCallback((id: string) => {
    setPlan(prev => ({
      ...prev,
      budgetItems: prev.budgetItems.filter(item => item.id !== id),
    }));
  }, []);

  // Milestones
  const addMilestone = useCallback((milestone: Omit<MilestoneItem, 'id'>) => {
    const newMilestone: MilestoneItem = { ...milestone, id: `m-${Date.now()}` };
    setPlan(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone],
    }));
  }, []);

  const toggleMilestone = useCallback((id: string) => {
    setPlan(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => (m.id === id ? { ...m, completed: !m.completed } : m)),
    }));
  }, []);

  const deleteMilestone = useCallback((id: string) => {
    setPlan(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== id),
    }));
  }, []);

  // Run of Show
  const addRunOfShowItem = useCallback((item: Omit<RunOfShowItem, 'id'>) => {
    const newItem: RunOfShowItem = { ...item, id: `ros-${Date.now()}` };
    setPlan(prev => {
      const updated = [...prev.runOfShow, newItem];
      // Sort by start time
      updated.sort((a, b) => a.startTime.localeCompare(b.startTime));
      return { ...prev, runOfShow: updated };
    });
  }, []);

  const updateRunOfShowItem = useCallback((id: string, updates: Partial<RunOfShowItem>) => {
    setPlan(prev => ({
      ...prev,
      runOfShow: prev.runOfShow.map(i => (i.id === id ? { ...i, ...updates } : i)),
    }));
  }, []);

  const deleteRunOfShowItem = useCallback((id: string) => {
    setPlan(prev => ({
      ...prev,
      runOfShow: prev.runOfShow.filter(i => i.id !== id),
    }));
  }, []);

  // Vendors
  const addVendor = useCallback((vendor: Omit<VendorItem, 'id'>) => {
    const newVendor: VendorItem = { ...vendor, id: `v-${Date.now()}` };
    setPlan(prev => ({
      ...prev,
      vendors: [newVendor, ...prev.vendors],
    }));
  }, []);

  const updateVendor = useCallback((id: string, updates: Partial<VendorItem>) => {
    setPlan(prev => ({
      ...prev,
      vendors: prev.vendors.map(v => (v.id === id ? { ...v, ...updates } : v)),
    }));
  }, []);

  const deleteVendor = useCallback((id: string) => {
    setPlan(prev => ({
      ...prev,
      vendors: prev.vendors.filter(v => v.id !== id),
    }));
  }, []);

  const toggleVendorTask = useCallback((vendorId: string, taskId: string) => {
    setPlan(prev => ({
      ...prev,
      vendors: prev.vendors.map(v => {
        if (v.id !== vendorId) return v;
        return {
          ...v,
          checklistTasks: v.checklistTasks.map(t => (t.id === taskId ? { ...t, done: !t.done } : t)),
        };
      }),
    }));
  }, []);

  // Ideas & Themes
  const saveIdea = useCallback((idea: GeneratedIdea) => {
    setPlan(prev => {
      const exists = prev.savedIdeas.some(i => i.id === idea.id);
      if (exists) return prev;
      return {
        ...prev,
        savedIdeas: [{ ...idea, saved: true }, ...prev.savedIdeas],
      };
    });
  }, []);

  const removeIdea = useCallback((ideaId: string) => {
    setPlan(prev => ({
      ...prev,
      savedIdeas: prev.savedIdeas.filter(i => i.id !== ideaId),
    }));
  }, []);

  const applyTheme = useCallback((theme: Partial<EventTheme>) => {
    setPlan(prev => ({
      ...prev,
      themeProposal: {
        ...(prev.themeProposal || SEED_EVENTS.wedding.themeProposal!),
        ...theme,
      },
      event: {
        ...prev.event,
        theme: theme.title || prev.event.theme,
      },
    }));
  }, []);

  const updateAISettings = useCallback((settings: Partial<AISettings>) => {
    setAISettings(prev => ({ ...prev, ...settings }));
  }, []);

  // Apply Structured Action Proposals from AI Assistant
  const applyActionProposal = useCallback((proposal: ActionProposal) => {
    const validation = validateActionProposal(proposal);
    if (!validation.valid) {
      console.warn('ActionProposal failed schema validation:', validation.reason);
      return;
    }

    if (proposal.actionType === 'add_budget_item' && proposal.payload) {
      addBudgetItem(proposal.payload);
    } else if (proposal.actionType === 'add_milestone' && proposal.payload) {
      addMilestone(proposal.payload);
    } else if (proposal.actionType === 'add_vendor' && proposal.payload) {
      addVendor(proposal.payload);
    } else if (proposal.actionType === 'apply_theme' && proposal.payload) {
      applyTheme(proposal.payload);
    }

    setChatMessages(prev =>
      prev.map(msg =>
        msg.actionProposal === proposal
          ? { ...msg, actionProposal: { ...proposal, applied: true } }
          : msg
      )
    );
  }, [addBudgetItem, addMilestone, addVendor, applyTheme]);

  // Chat message sender
  const sendChatMessage = useCallback(async (userText: string) => {
    if (!userText.trim()) return;

    // Rate-limit: max 30 messages per minute per client session
    const rateCheck = checkRateLimit('chat_messages', 30, 60000);
    if (!rateCheck.allowed) {
      const throttledMsg: ChatMessage = {
        id: `rate-limit-${Date.now()}`,
        sender: 'assistant',
        text: '⏳ Message rate limit reached. Please wait a few seconds before asking another question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, throttledMsg]);
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await askGeminiAssistant(
        userText,
        plan,
        aiSettings.apiKey,
        aiSettings.model
      );

      const aiMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: response.suggestedPrompts,
        actionProposal: response.actionProposal,
      };

      setChatMessages(prev => [...prev, aiMsg]);
    } catch (e: any) {
      const errMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ Error communicating with assistant: ${e?.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  }, [plan, aiSettings]);

  const clearChat = useCallback(() => {
    setChatMessages([
      {
        id: 'msg-welcome-reset',
        sender: 'assistant',
        text: `Chat reset. Ask me anything about planning your ${activeEventType}!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: [
          'What are our top cost-saving opportunities?',
          'Generate 3 personalized signature drink ideas',
          'Review the run-of-show schedule for timing conflicts',
        ],
      },
    ]);
  }, [activeEventType]);

  return (
    <EventContext.Provider
      value={{
        activeEventType,
        switchEventType,
        plan,
        updateEventDetails,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        addMilestone,
        toggleMilestone,
        deleteMilestone,
        addRunOfShowItem,
        updateRunOfShowItem,
        deleteRunOfShowItem,
        addVendor,
        updateVendor,
        deleteVendor,
        toggleVendorTask,
        saveIdea,
        removeIdea,
        applyTheme,
        resetToSeed,
        aiSettings,
        updateAISettings,
        chatMessages,
        isChatLoading,
        sendChatMessage,
        applyActionProposal,
        clearChat,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useEvent() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
}
