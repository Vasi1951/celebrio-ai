import { describe, it, expect } from 'vitest';
import { calculateBudgetSummary, formatCurrency, formatCategoryLabel } from '../utils/formatters';
import { BudgetItem } from '../types';

describe('Budget Engine & Calculation Suite', () => {
  const sampleItems: BudgetItem[] = [
    {
      id: '1',
      category: 'venue',
      name: 'Main Hall',
      estimatedCost: 5000,
      actualCost: 4800,
      paidAmount: 2400,
      paymentStatus: 'deposit_paid',
    },
    {
      id: '2',
      category: 'catering',
      name: 'Plated Dinner',
      estimatedCost: 6000,
      actualCost: 6200,
      paidAmount: 6200,
      paymentStatus: 'paid_in_full',
    },
    {
      id: '3',
      category: 'decor_and_floral',
      name: 'Floral Centerpieces',
      estimatedCost: 1500,
      actualCost: 1200,
      paidAmount: 0,
      paymentStatus: 'unpaid',
    },
  ];

  it('correctly calculates total estimated, actual, and paid amounts', () => {
    const summary = calculateBudgetSummary(sampleItems, 15000, 10);
    expect(summary.totalEstimated).toBe(12500); // 5000 + 6000 + 1500
    expect(summary.totalActual).toBe(12200);    // 4800 + 6200 + 1200
    expect(summary.totalPaid).toBe(8600);       // 2400 + 6200 + 0
  });

  it('calculates positive remaining budget and variance when within target', () => {
    const summary = calculateBudgetSummary(sampleItems, 15000, 10);
    expect(summary.remainingBudget).toBe(2800); // 15000 - 12200
    expect(summary.variance).toBe(300);         // 12500 estimated - 12200 actual (positive = under estimated)
  });

  it('flags negative remaining budget when expenses exceed target', () => {
    const tightSummary = calculateBudgetSummary(sampleItems, 10000, 10);
    expect(tightSummary.remainingBudget).toBe(-2200); // 10000 - 12200
    expect(tightSummary.remainingBudget < 0).toBe(true);
  });

  it('accurately computes contingency reserve according to percentage', () => {
    const summary10 = calculateBudgetSummary(sampleItems, 20000, 10);
    expect(summary10.contingencyFund).toBe(2000);

    const summary15 = calculateBudgetSummary(sampleItems, 20000, 15);
    expect(summary15.contingencyFund).toBe(3000);
  });

  it('aggregates category percentages and item counts properly', () => {
    const summary = calculateBudgetSummary(sampleItems, 20000, 10);
    expect(summary.byCategory.venue.actual).toBe(4800);
    expect(summary.byCategory.venue.itemCount).toBe(1);
    expect(summary.byCategory.venue.percentageOfBudget).toBe(24); // 4800 / 20000 = 24%
  });

  it('formats currency strings across international currency codes', () => {
    expect(formatCurrency(1250, 'USD')).toContain('1,250');
    expect(formatCurrency(2500, 'EUR')).toContain('2,500');
    expect(formatCurrency(50000, 'INR')).toContain('50,000');
  });

  it('formats category codes into human-friendly labels', () => {
    expect(formatCategoryLabel('venue')).toBe('Venue & Location');
    expect(formatCategoryLabel('decor_and_floral')).toBe('Decor & Florals');
    expect(formatCategoryLabel('permits_and_safety')).toBe('Permits, Safety & Security');
  });
});
