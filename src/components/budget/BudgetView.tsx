import React, { useState, useMemo } from 'react';
import { useEvent } from '../../context/EventContext';
import { calculateBudgetSummary, formatCurrency, formatCategoryLabel } from '../../utils/formatters';
import { PaymentStatus } from '../../types';
import { Plus, DollarSign, AlertCircle, CheckCircle, TrendingDown, TrendingUp, ShieldCheck, Sparkles, Trash2, Filter } from 'lucide-react';

interface BudgetViewProps {
  onAddExpense: () => void;
  onAskAI: (prompt: string) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({ onAddExpense, onAskAI }) => {
  const { plan, deleteBudgetItem } = useEvent();
  const { event, budgetItems } = plan;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const summary = useMemo(
    () => calculateBudgetSummary(budgetItems, event.totalTargetBudget, event.contingencyPercent),
    [budgetItems, event.totalTargetBudget, event.contingencyPercent]
  );

  const isOverBudget = summary.remainingBudget < 0;
  const percentSpent = event.totalTargetBudget > 0
    ? Math.min(100, Math.round((summary.totalActual / event.totalTargetBudget) * 100))
    : 0;

  // Filtered Items
  const filteredItems = useMemo(() => {
    return budgetItems.filter(item => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchStatus = selectedStatus === 'all' || item.paymentStatus === selectedStatus;
      return matchCat && matchStatus;
    });
  }, [budgetItems, selectedCategory, selectedStatus]);

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid_in_full':
        return <span className="badge badge-success">Paid in Full</span>;
      case 'deposit_paid':
        return <span className="badge badge-warning">Deposit Paid</span>;
      case 'unpaid':
        return <span className="badge badge-danger">Unpaid</span>;
      case 'refunded':
        return <span className="badge badge-subtle">Refunded</span>;
    }
  };

  return (
    <div className="budget-view-container">
      {/* KPI Cards Row */}
      <div className="kpi-grid">
        {/* Total Target Budget */}
        <div className="kpi-card glass-panel">
          <div className="kpi-header">
            <span className="kpi-title">Target Budget</span>
            <DollarSign size={18} className="text-indigo" aria-hidden="true" />
          </div>
          <div className="kpi-amount">{formatCurrency(summary.totalBudget, event.currency)}</div>
          <div className="kpi-subtext">Base Allocation Target</div>
        </div>

        {/* Total Actual Committed */}
        <div className="kpi-card glass-panel">
          <div className="kpi-header">
            <span className="kpi-title">Committed Actuals</span>
            <TrendingUp size={18} className="text-cyan" aria-hidden="true" />
          </div>
          <div className="kpi-amount">{formatCurrency(summary.totalActual, event.currency)}</div>
          <div className="kpi-subtext">{percentSpent}% of total budget</div>
        </div>

        {/* Remaining Budget */}
        <div className={`kpi-card glass-panel ${isOverBudget ? 'border-danger-glow' : ''}`}>
          <div className="kpi-header">
            <span className="kpi-title">Remaining Balance</span>
            {isOverBudget ? (
              <AlertCircle size={18} className="text-danger" aria-hidden="true" />
            ) : (
              <TrendingDown size={18} className="text-emerald" aria-hidden="true" />
            )}
          </div>
          <div className={`kpi-amount ${isOverBudget ? 'text-danger' : 'text-emerald'}`}>
            {formatCurrency(summary.remainingBudget, event.currency)}
          </div>
          <div className="kpi-subtext">
            {isOverBudget ? 'Over Budget - Action Needed' : 'Safe Surplus Buffer'}
          </div>
        </div>

        {/* Total Paid Out */}
        <div className="kpi-card glass-panel">
          <div className="kpi-header">
            <span className="kpi-title">Paid Out</span>
            <CheckCircle size={18} className="text-emerald" aria-hidden="true" />
          </div>
          <div className="kpi-amount">{formatCurrency(summary.totalPaid, event.currency)}</div>
          <div className="kpi-subtext">
            {formatCurrency(summary.totalActual - summary.totalPaid, event.currency)} pending balance
          </div>
        </div>

        {/* Contingency Fund */}
        <div className="kpi-card glass-panel">
          <div className="kpi-header">
            <span className="kpi-title">Contingency Fund</span>
            <ShieldCheck size={18} className="text-amber" aria-hidden="true" />
          </div>
          <div className="kpi-amount text-amber">{formatCurrency(summary.contingencyFund, event.currency)}</div>
          <div className="kpi-subtext">{event.contingencyPercent}% safety reserve included</div>
        </div>
      </div>

      {/* Over Budget Alert Banner if applicable */}
      {isOverBudget && (
        <div className="alert-banner alert-banner-danger" role="alert">
          <AlertCircle size={20} aria-hidden="true" />
          <div className="alert-content">
            <strong>Budget Exceeded Alert:</strong> You are currently{' '}
            {formatCurrency(Math.abs(summary.remainingBudget), event.currency)} over your target
            cap. Use the AI Advisor to find immediate reallocations and cost-saving tips.
          </div>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => onAskAI('How do I reduce my event budget to stay within the target cap?')}
          >
            <Sparkles size={14} />
            <span>AI Rebalance</span>
          </button>
        </div>
      )}

      {/* Main Budget Content: Category Progress Breakdown & Table */}
      <div className="budget-content-grid">
        {/* Left: Category Allocations */}
        <div className="glass-panel p-20 category-panel">
          <div className="panel-header">
            <h3>Category Allocations</h3>
            <span className="badge badge-subtle">{budgetItems.length} Expenses</span>
          </div>

          <div className="category-bars-list">
            {Object.values(summary.byCategory)
              .filter(cat => cat.actual > 0 || cat.estimated > 0)
              .sort((a, b) => b.actual - a.actual)
              .map(cat => (
                <div key={cat.category} className="category-bar-item">
                  <div className="cat-bar-header">
                    <span className="cat-name">{formatCategoryLabel(cat.category)}</span>
                    <span className="cat-cost">{formatCurrency(cat.actual, event.currency)}</span>
                  </div>
                  <div className="cat-progress-track">
                    <div
                      className="cat-progress-fill"
                      style={{
                        width: `${Math.min(100, Math.round((cat.actual / (summary.totalBudget || 1)) * 100))}%`,
                      }}
                      role="progressbar"
                      aria-valuenow={cat.percentageOfBudget}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <div className="cat-bar-footer">
                    <span>{cat.itemCount} items</span>
                    <span>{cat.percentageOfBudget}% of budget</span>
                  </div>
                </div>
              ))}
          </div>

          <div className="ai-budget-cta">
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={() => onAskAI('Analyze our budget category percentages and compare them to industry standards')}
            >
              <Sparkles size={16} className="text-indigo" />
              <span>Audit with AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Right: Itemized Expense Table */}
        <div className="glass-panel p-20 table-panel">
          <div className="table-controls-row">
            <div>
              <h3>Itemized Expenses</h3>
              <p className="subtext">Track quotes, committed contracts, and payment milestones</p>
            </div>

            <div className="action-buttons-group">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onAddExpense}
                id="btn-add-expense"
              >
                <Plus size={16} />
                <span>Add Expense</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="filters-bar">
            <div className="filter-item">
              <Filter size={14} className="text-muted" aria-hidden="true" />
              <select
                aria-label="Filter expenses by category"
                className="select-control select-sm"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="venue">Venue & Location</option>
                <option value="catering">Catering & Bar</option>
                <option value="photography">Photography & Video</option>
                <option value="entertainment">Entertainment & Music</option>
                <option value="decor_and_floral">Decor & Floral</option>
                <option value="attire_and_beauty">Attire & Beauty</option>
                <option value="permits_and_safety">Permits & Safety</option>
                <option value="marketing_and_invites">Invites & Marketing</option>
                <option value="rentals">Rentals</option>
                <option value="contingency">Contingency</option>
              </select>
            </div>

            <div className="filter-item">
              <select
                aria-label="Filter expenses by payment status"
                className="select-control select-sm"
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Payment Statuses</option>
                <option value="paid_in_full">Paid in Full</option>
                <option value="deposit_paid">Deposit Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>

            <span className="results-count">
              Showing {filteredItems.length} of {budgetItems.length}
            </span>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="custom-table" aria-label="Itemized Expenses List">
              <thead>
                <tr>
                  <th scope="col">Expense Name</th>
                  <th scope="col">Category</th>
                  <th scope="col">Estimated</th>
                  <th scope="col">Actual</th>
                  <th scope="col">Paid</th>
                  <th scope="col">Status</th>
                  <th scope="col" aria-label="Actions">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-20 text-muted">
                      No expenses match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id}>
                      <td className="font-semibold text-primary">
                        {item.name}
                        {item.notes && <div className="text-xs text-muted mt-1">{item.notes}</div>}
                      </td>
                      <td>
                        <span className="badge badge-subtle">{formatCategoryLabel(item.category)}</span>
                      </td>
                      <td>{formatCurrency(item.estimatedCost, event.currency)}</td>
                      <td className="font-semibold">{formatCurrency(item.actualCost, event.currency)}</td>
                      <td>{formatCurrency(item.paidAmount, event.currency)}</td>
                      <td>{getStatusBadge(item.paymentStatus)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-icon text-muted hover-danger"
                          onClick={() => deleteBudgetItem(item.id)}
                          aria-label={`Delete expense: ${item.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
