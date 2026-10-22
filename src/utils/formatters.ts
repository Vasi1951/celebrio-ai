import { CurrencyCode, BudgetCategory, BudgetItem, BudgetSummary } from '../types';

/**
 * Format currency with internationalization
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString()}`;
  }
}

/**
 * Format date string into human-friendly format (e.g. Oct 24, 2026)
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return 'TBD';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Format time string (e.g. 14:30 -> 2:30 PM)
 */
export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${period}`;
  } catch {
    return timeStr;
  }
}

/**
 * Relative days remaining calculation
 */
export function getDaysUntil(dateStr: string): number {
  if (!dateStr) return 0;
  const [year, month, day] = dateStr.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatRelativeCountdown(dateStr: string): string {
  const days = getDaysUntil(dateStr);
  if (days === 0) return 'Today is the big day!';
  if (days === 1) return 'Tomorrow!';
  if (days > 1) return `${days} days to go`;
  if (days === -1) return 'Yesterday';
  return `${Math.abs(days)} days ago`;
}

/**
 * Format raw category codes into clean display labels
 */
export function formatCategoryLabel(cat: BudgetCategory | string): string {
  const labelMap: Record<string, string> = {
    venue: 'Venue & Location',
    catering: 'Catering & Beverages',
    photography: 'Photography & Videography',
    entertainment: 'Entertainment & Music',
    decor_and_floral: 'Decor & Florals',
    attire_and_beauty: 'Attire & Beauty',
    permits_and_safety: 'Permits, Safety & Security',
    marketing_and_invites: 'Invitations & Marketing',
    rentals: 'Equipment & Rentals',
    miscellaneous: 'Miscellaneous',
    contingency: 'Contingency Reserve',
  };
  return labelMap[cat] || cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Comprehensive Budget Computation Engine
 */
export function calculateBudgetSummary(
  items: BudgetItem[],
  totalTargetBudget: number,
  contingencyPercent: number = 10
): BudgetSummary {
  const contingencyFund = Math.round(totalTargetBudget * (contingencyPercent / 100));

  let totalEstimated = 0;
  let totalActual = 0;
  let totalPaid = 0;

  const categoryMap: Partial<Record<BudgetCategory, {
    category: BudgetCategory;
    estimated: number;
    actual: number;
    itemCount: number;
    percentageOfBudget: number;
  }>> = {};

  const categories: BudgetCategory[] = [
    'venue',
    'catering',
    'photography',
    'entertainment',
    'decor_and_floral',
    'attire_and_beauty',
    'permits_and_safety',
    'marketing_and_invites',
    'rentals',
    'miscellaneous',
    'contingency',
  ];

  categories.forEach(cat => {
    categoryMap[cat] = {
      category: cat,
      estimated: 0,
      actual: 0,
      itemCount: 0,
      percentageOfBudget: 0,
    };
  });

  items.forEach(item => {
    totalEstimated += item.estimatedCost;
    totalActual += item.actualCost;
    totalPaid += item.paidAmount;

    const catStats = categoryMap[item.category];
    if (catStats) {
      catStats.estimated += item.estimatedCost;
      catStats.actual += item.actualCost;
      catStats.itemCount += 1;
    }
  });

  // Calculate percentages
  categories.forEach(cat => {
    const catStats = categoryMap[cat]!;
    if (totalTargetBudget > 0) {
      catStats.percentageOfBudget = Math.round((catStats.actual / totalTargetBudget) * 100);
    }
  });

  const remainingBudget = totalTargetBudget - totalActual;
  const variance = totalEstimated - totalActual; // Positive if actual is less than estimated

  return {
    totalBudget: totalTargetBudget,
    totalEstimated,
    totalActual,
    totalPaid,
    remainingBudget,
    variance,
    contingencyFund,
    byCategory: categoryMap as Record<BudgetCategory, any>,
  };
}
