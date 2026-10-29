import React, { useState } from 'react';
import { useEvent } from '../../context/EventContext';
import { VendorCategory, VendorStatus } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Plus, CheckSquare, Square, FileCheck, Phone, Mail, Globe, Sparkles, Trash2, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface VendorViewProps {
  onAddVendor: () => void;
  onAskAI: (prompt: string) => void;
}

export const VendorView: React.FC<VendorViewProps> = ({ onAddVendor, onAskAI }) => {
  const { plan, toggleVendorTask, deleteVendor } = useEvent();
  const { event, vendors } = plan;

  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(vendors[0]?.id || null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories: VendorCategory[] = [
    'Venue',
    'Catering & Bar',
    'Photography & Video',
    'Floral & Decor',
    'Music & DJ & AV',
    'Officiant / MC',
    'Cake & Desserts',
    'Hair & Makeup',
    'Attire & Styling',
    'Security & First Aid',
    'Permits & Sanitation',
    'Rentals & Staging',
    'Transportation',
  ];

  const filteredVendors = vendors.filter(v => {
    if (filterCategory === 'all') return true;
    return v.category === filterCategory;
  });

  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'contract_signed':
        return <span className="badge badge-success">Contract Signed</span>;
      case 'deposit_paid':
        return <span className="badge badge-warning">Deposit Paid</span>;
      case 'quote_received':
        return <span className="badge badge-subtle">Quote Received</span>;
      case 'negotiating':
        return <span className="badge badge-subtle">Negotiating</span>;
      case 'researching':
        return <span className="badge badge-subtle">Researching</span>;
      case 'fully_paid':
        return <span className="badge badge-success">Fully Paid</span>;
      default:
        return <span className="badge badge-subtle">{status}</span>;
    }
  };

  return (
    <div className="vendors-view-container">
      {/* Top Header Controls */}
      <div className="vendors-header-row">
        <div>
          <h3>Vendor & Contractor Command Center</h3>
          <p className="subtext">
            Manage bids, contracts, subtask checklists, and emergency phone contacts
          </p>
        </div>

        <div className="header-actions">
          <select
            aria-label="Filter vendors by category"
            className="select-control select-sm"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="all">All Vendor Categories ({vendors.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat} ({vendors.filter(v => v.category === cat).length})
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onAddVendor}
            id="btn-add-vendor"
          >
            <Plus size={16} />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Vendor Cards List */}
      <div className="vendors-grid mt-24">
        {filteredVendors.length === 0 ? (
          <div className="glass-panel p-40 text-center text-muted">
            <Layers size={40} className="mx-auto mb-12 text-muted" />
            <p>No vendors found for the selected category.</p>
            <button
              type="button"
              className="btn btn-secondary btn-sm mt-12"
              onClick={onAddVendor}
            >
              Add First Vendor
            </button>
          </div>
        ) : (
          filteredVendors.map(vendor => {
            const isExpanded = expandedVendorId === vendor.id;
            const completedTasks = vendor.checklistTasks.filter(t => t.done).length;

            return (
              <div key={vendor.id} className="vendor-card glass-panel">
                {/* Vendor Header Summary */}
                <div
                  className="vendor-header-clickable"
                  onClick={() => setExpandedVendorId(isExpanded ? null : vendor.id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  aria-controls={`vendor-details-${vendor.id}`}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setExpandedVendorId(isExpanded ? null : vendor.id);
                    }
                  }}
                >
                  <div className="vendor-title-col">
                    <div className="badge-row">
                      <span className="badge badge-subtle">{vendor.category}</span>
                      {getStatusBadge(vendor.status)}
                      {vendor.contractSigned && (
                        <span className="badge badge-success flex-center gap-4">
                          <FileCheck size={12} /> Contract On File
                        </span>
                      )}
                    </div>
                    <h4 className="vendor-name">{vendor.name}</h4>
                    {vendor.contactName && (
                      <div className="contact-person">Primary Contact: {vendor.contactName}</div>
                    )}
                  </div>

                  <div className="vendor-cost-col">
                    <div className="cost-amount">
                      {vendor.totalAgreedCost
                        ? formatCurrency(vendor.totalAgreedCost, event.currency)
                        : 'Cost TBD'}
                    </div>
                    <div className="deposit-status">
                      {vendor.depositAmount
                        ? `Deposit: ${formatCurrency(vendor.depositAmount, event.currency)}`
                        : 'No deposit logged'}
                    </div>
                  </div>

                  <div className="vendor-toggle-icon">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {/* Collapsible Details Body */}
                {isExpanded && (
                  <div className="vendor-expanded-body" id={`vendor-details-${vendor.id}`}>
                    <div className="details-columns-grid">
                      {/* Contact Info & Notes */}
                      <div className="vendor-meta-block">
                        <h5>Contact & Details</h5>
                        <ul className="contact-list">
                          {vendor.phone && (
                            <li>
                              <Phone size={14} className="text-muted" />
                              <a href={`tel:${vendor.phone}`}>{vendor.phone}</a>
                            </li>
                          )}
                          {vendor.email && (
                            <li>
                              <Mail size={14} className="text-muted" />
                              <a href={`mailto:${vendor.email}`}>{vendor.email}</a>
                            </li>
                          )}
                          {vendor.website && (
                            <li>
                              <Globe size={14} className="text-muted" />
                              <a href={vendor.website} target="_blank" rel="noopener noreferrer">
                                {vendor.website.replace('https://', '')}
                              </a>
                            </li>
                          )}
                        </ul>

                        {vendor.notes && (
                          <div className="vendor-notes-box">
                            <strong>Internal Notes:</strong> {vendor.notes}
                          </div>
                        )}

                        <div className="vendor-ai-help mt-16">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm w-full"
                            onClick={() =>
                              onAskAI(`Generate a list of 5 crucial contract questions to verify with our ${vendor.category} vendor (${vendor.name}) before making final payment.`)
                            }
                          >
                            <Sparkles size={14} className="text-indigo" />
                            <span>AI Contract Questions</span>
                          </button>
                        </div>
                      </div>

                      {/* Subtasks Checklist */}
                      <div className="vendor-tasks-block">
                        <div className="tasks-header">
                          <h5>Checklist & Deliverables</h5>
                          <span className="badge badge-subtle">
                            {completedTasks} / {vendor.checklistTasks.length} done
                          </span>
                        </div>

                        {vendor.checklistTasks.length === 0 ? (
                          <p className="text-muted text-sm py-8">No subtasks logged for this vendor yet.</p>
                        ) : (
                          <ul className="subtasks-list">
                            {vendor.checklistTasks.map(task => (
                              <li key={task.id} className="subtask-item">
                                <button
                                  type="button"
                                  className="checkbox-mini-btn"
                                  onClick={() => toggleVendorTask(vendor.id, task.id)}
                                  aria-label={`Toggle checklist task: ${task.text}`}
                                  aria-pressed={task.done}
                                >
                                  {task.done ? (
                                    <CheckSquare size={18} className="text-emerald" />
                                  ) : (
                                    <Square size={18} className="text-muted" />
                                  )}
                                </button>
                                <span className={task.done ? 'line-through text-muted' : ''}>
                                  {task.text}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Quotes Comparison if available */}
                        {vendor.quotes && vendor.quotes.length > 0 && (
                          <div className="quotes-comparison-box mt-16">
                            <h6>Competitive Quotes Received:</h6>
                            <div className="quotes-list">
                              {vendor.quotes.map(q => (
                                <div
                                  key={q.id}
                                  className={`quote-item ${q.isSelected ? 'selected' : ''}`}
                                >
                                  <div className="quote-header">
                                    <span className="font-semibold">{q.vendorName}</span>
                                    <span className="quote-amount">
                                      {formatCurrency(q.amount, event.currency)}
                                    </span>
                                  </div>
                                  <ul className="quote-inclusions">
                                    {q.includes.map((inc, idx) => (
                                      <li key={idx}>✓ {inc}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="vendor-footer-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-danger"
                        onClick={() => deleteVendor(vendor.id)}
                        aria-label={`Delete vendor ${vendor.name}`}
                      >
                        <Trash2 size={14} />
                        <span>Remove Vendor</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
