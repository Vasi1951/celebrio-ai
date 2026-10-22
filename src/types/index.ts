export type EventType = 'wedding' | 'birthday' | 'community';

export type EventStatus = 'draft' | 'planning' | 'confirmed' | 'in_progress' | 'completed';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'INR' | 'JPY';

// --- Budget Interfaces ---
export type BudgetCategory = 
  | 'venue'
  | 'catering'
  | 'photography'
  | 'entertainment'
  | 'decor_and_floral'
  | 'attire_and_beauty'
  | 'permits_and_safety'
  | 'marketing_and_invites'
  | 'rentals'
  | 'miscellaneous'
  | 'contingency';

export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'paid_in_full' | 'refunded';

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  name: string;
  estimatedCost: number;
  actualCost: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  dueDate?: string;
  vendorId?: string;
  notes?: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalEstimated: number;
  totalActual: number;
  totalPaid: number;
  remainingBudget: number;
  variance: number; // positive = under budget, negative = over budget
  contingencyFund: number;
  byCategory: Record<BudgetCategory, {
    category: BudgetCategory;
    estimated: number;
    actual: number;
    itemCount: number;
    percentageOfBudget: number;
  }>;
}

// --- Timeline & Run-of-Show Interfaces ---
export type MilestonePhase = 
  | '12_to_9_months'
  | '8_to_6_months'
  | '5_to_3_months'
  | '2_to_1_months'
  | '2_weeks_prior'
  | 'day_before'
  | 'day_of'
  | 'post_event';

export type MilestonePriority = 'low' | 'medium' | 'high' | 'critical';

export interface MilestoneItem {
  id: string;
  title: string;
  description?: string;
  phase: MilestonePhase;
  targetDate: string; // YYYY-MM-DD
  completed: boolean;
  priority: MilestonePriority;
  assignedTo?: string;
  category?: string;
}

export interface RunOfShowItem {
  id: string;
  startTime: string; // HH:MM (24h)
  endTime: string;   // HH:MM (24h)
  title: string;
  location: string;
  leadPerson: string;
  notes?: string;
  isMilestone?: boolean;
}

// --- Vendor Checklist & Quotes Interfaces ---
export type VendorCategory = 
  | 'Venue'
  | 'Catering & Bar'
  | 'Photography & Video'
  | 'Floral & Decor'
  | 'Music & DJ & AV'
  | 'Officiant / MC'
  | 'Cake & Desserts'
  | 'Hair & Makeup'
  | 'Attire & Styling'
  | 'Security & First Aid'
  | 'Permits & Sanitation'
  | 'Rentals & Staging'
  | 'Transportation';

export type VendorStatus = 
  | 'researching'
  | 'contacted'
  | 'quote_received'
  | 'negotiating'
  | 'contract_signed'
  | 'deposit_paid'
  | 'fully_paid'
  | 'declined';

export interface VendorQuote {
  id: string;
  vendorName: string;
  amount: number;
  receivedDate: string;
  includes: string[];
  notes?: string;
  isSelected?: boolean;
}

export interface VendorItem {
  id: string;
  name: string;
  category: VendorCategory;
  status: VendorStatus;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  contractSigned: boolean;
  contractUrl?: string;
  totalAgreedCost?: number;
  depositAmount?: number;
  depositDueDate?: string;
  balanceDueDate?: string;
  rating?: number; // 1 to 5
  notes?: string;
  checklistTasks: { id: string; text: string; done: boolean }[];
  quotes: VendorQuote[];
}

// --- Personalized GenAI Ideas & Themes ---
export interface ColorPaletteItem {
  name: string;
  hex: string;
  role: 'primary' | 'secondary' | 'accent' | 'background' | 'text';
}

export interface EventTheme {
  title: string;
  tagline: string;
  vibe: string;
  colorPalette: ColorPaletteItem[];
  decorIdeas: string[];
  signatureDrinksOrDishes: string[];
  musicAndAtmosphere: string[];
  diyCostSavingTips: string[];
  dressCodePrompt: string;
}

export interface GeneratedIdea {
  id: string;
  category: 'theme' | 'menu' | 'entertainment' | 'speech' | 'diy_hack' | 'icebreaker';
  title: string;
  description: string;
  tags: string[];
  estimatedCostImpact?: 'free' | 'low' | 'medium' | 'high';
  saved: boolean;
}

// --- Event Profile & Meta ---
export interface EventDetails {
  id: string;
  title: string;
  eventType: EventType;
  subType?: string; // e.g. "Destination Wedding", "Milestone 40th Birthday", "Community Eco-Fair"
  theme: string;
  targetDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  venueName: string;
  city: string;
  stateOrCountry: string;
  guestCount: number;
  currency: CurrencyCode;
  totalTargetBudget: number;
  contingencyPercent: number; // default 10%
  description: string;
  vibeKeywords: string[];
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FullEventPlan {
  event: EventDetails;
  budgetItems: BudgetItem[];
  milestones: MilestoneItem[];
  runOfShow: RunOfShowItem[];
  vendors: VendorItem[];
  savedIdeas: GeneratedIdea[];
  themeProposal?: EventTheme;
}

// --- Chat & GenAI Assistant Interfaces ---
export type MessageSender = 'user' | 'assistant' | 'system';

export interface ActionProposal {
  actionType: 'add_budget_item' | 'add_milestone' | 'add_vendor' | 'update_budget' | 'apply_theme';
  label: string;
  payload: any;
  applied?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
  actionProposal?: ActionProposal;
  isStreaming?: boolean;
}

export interface AISettings {
  apiKey: string;
  model: 'gemini-1.5-flash' | 'gemini-2.0-flash' | 'gemini-1.5-pro' | 'heuristic_offline';
  temperature: number;
  useHeuristicFallback: boolean;
}
