import React, { useState } from 'react';
import { useEvent } from '../../context/EventContext';
import { VendorCategory, VendorStatus } from '../../types';
import { sanitizePlainText, sanitizeCurrencyAmount } from '../../utils/security';
import { Store, X } from 'lucide-react';

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddVendorModal: React.FC<AddVendorModalProps> = ({ isOpen, onClose }) => {
  const { addVendor } = useEvent();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<VendorCategory>('Catering & Bar');
  const [status, setStatus] = useState<VendorStatus>('quote_received');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [totalAgreedCost, setTotalAgreedCost] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [contractSigned, setContractSigned] = useState(false);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addVendor({
      name: sanitizePlainText(name),
      category,
      status,
      contactName: sanitizePlainText(contactName) || undefined,
      phone: sanitizePlainText(phone) || undefined,
      email: sanitizePlainText(email) || undefined,
      contractSigned,
      totalAgreedCost: totalAgreedCost ? sanitizeCurrencyAmount(totalAgreedCost) : undefined,
      depositAmount: depositAmount ? sanitizeCurrencyAmount(depositAmount) : undefined,
      notes: sanitizePlainText(notes, 500) || undefined,
      checklistTasks: [
        { id: `vt-${Date.now()}-1`, text: 'Confirm schedule and load-in timing', done: false },
        { id: `vt-${Date.now()}-2`, text: 'Verify liability certificate and contract signed', done: contractSigned },
      ],
      quotes: totalAgreedCost ? [{
        id: `q-${Date.now()}`,
        vendorName: name,
        amount: sanitizeCurrencyAmount(totalAgreedCost),
        receivedDate: new Date().toISOString().split('T')[0],
        includes: ['Base contracted service package'],
        isSelected: true,
      }] : [],
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-vendor-title">
      <div className="modal-card glass-panel">
        <div className="modal-header">
          <div className="flex-center gap-10">
            <Store size={20} className="text-indigo" />
            <h3 id="add-vendor-title">Add Vendor / Partner</h3>
          </div>
          <button type="button" className="btn-icon text-muted" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body mt-20">
          <div className="form-group">
            <label className="form-label">Vendor Company Name</label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Luminary Fine Art Photography"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Service Category</label>
              <select
                className="select-control"
                value={category}
                onChange={e => setCategory(e.target.value as VendorCategory)}
              >
                <option value="Venue">Venue</option>
                <option value="Catering & Bar">Catering & Bar</option>
                <option value="Photography & Video">Photography & Video</option>
                <option value="Floral & Decor">Floral & Decor</option>
                <option value="Music & DJ & AV">Music & DJ & AV</option>
                <option value="Officiant / MC">Officiant / MC</option>
                <option value="Cake & Desserts">Cake & Desserts</option>
                <option value="Hair & Makeup">Hair & Makeup</option>
                <option value="Attire & Styling">Attire & Styling</option>
                <option value="Security & First Aid">Security & First Aid</option>
                <option value="Permits & Sanitation">Permits & Sanitation</option>
                <option value="Rentals & Staging">Rentals & Staging</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Contract Status</label>
              <select
                className="select-control"
                value={status}
                onChange={e => setStatus(e.target.value as VendorStatus)}
              >
                <option value="researching">Researching</option>
                <option value="contacted">Contacted</option>
                <option value="quote_received">Quote Received</option>
                <option value="negotiating">Negotiating</option>
                <option value="contract_signed">Contract Signed</option>
                <option value="deposit_paid">Deposit Paid</option>
                <option value="fully_paid">Fully Paid</option>
              </select>
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Sarah Connor"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="input-control"
                placeholder="(555) 000-0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="input-control"
                placeholder="hello@vendor.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Total Agreed / Quoted Cost</label>
              <input
                type="number"
                className="input-control"
                placeholder="e.g. 3500"
                value={totalAgreedCost}
                onChange={e => setTotalAgreedCost(e.target.value)}
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Deposit Amount Paid</label>
              <input
                type="number"
                className="input-control"
                placeholder="e.g. 1500"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="form-group flex-center gap-10">
            <input
              type="checkbox"
              id="contractSignedCheck"
              checked={contractSigned}
              onChange={e => setContractSigned(e.target.checked)}
            />
            <label htmlFor="contractSignedCheck" className="cursor-pointer text-sm">
              Official Vendor Agreement / Contract is Signed
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Internal Coordination Notes</label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Requires 2 standard 120V wall outlets near the stage"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-footer mt-20 flex-end gap-10">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-submit-vendor">
              Save Vendor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
