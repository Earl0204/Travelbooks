import { useState } from 'react';

export default function BookingDrawer({ 
  isOpen, 
  onClose, 
  bookingToEdit, 
  prefilledData, 
  onSave 
}) {
  const [formData, setFormData] = useState(() => {
    if (bookingToEdit) {
      return {
        clientName: bookingToEdit.clientName || '',
        fbLink: bookingToEdit.fbLink || '',
        phone: bookingToEdit.phone || '',
        email: bookingToEdit.email || '',
        destination: bookingToEdit.destination || '',
        travelDates: bookingToEdit.travelDates || '',
        pax: bookingToEdit.pax || 1,
        totalAmount: bookingToEdit.totalAmount || 0,
        amountPaid: bookingToEdit.amountPaid || 0,
        status: bookingToEdit.status || 'Pending'
      };
    } else if (prefilledData) {
      return {
        clientName: prefilledData.clientName || '',
        fbLink: prefilledData.fbLink || '',
        phone: prefilledData.phone || '',
        email: prefilledData.email || '',
        destination: prefilledData.destination || '',
        travelDates: prefilledData.travelDates || '',
        pax: prefilledData.pax || 1,
        totalAmount: prefilledData.totalAmount || 0,
        amountPaid: prefilledData.amountPaid || 0,
        status: prefilledData.totalAmount 
          ? (prefilledData.amountPaid >= prefilledData.totalAmount 
              ? 'Paid' 
              : (prefilledData.amountPaid > 0 ? 'Partial' : 'Pending'))
          : 'Pending'
      };
    } else {
      return {
        clientName: '',
        fbLink: '',
        phone: '',
        email: '',
        destination: '',
        travelDates: '',
        pax: 1,
        totalAmount: '',
        amountPaid: '',
        status: 'Pending'
      };
    }
  });

  // Handle auto calculation of status when amount fields change
  const handleAmountChange = (field, value) => {
    const numericValue = parseFloat(value) || 0;
    const updatedForm = { ...formData, [field]: value };
    
    // Auto status calculation if not cancelled
    if (updatedForm.status !== 'Cancelled') {
      const total = parseFloat(field === 'totalAmount' ? numericValue : updatedForm.totalAmount) || 0;
      const paid = parseFloat(field === 'amountPaid' ? numericValue : updatedForm.amountPaid) || 0;
      
      if (total > 0) {
        if (paid >= total) {
          updatedForm.status = 'Paid';
        } else if (paid > 0) {
          updatedForm.status = 'Partial';
        } else {
          updatedForm.status = 'Pending';
        }
      }
    }
    
    setFormData(updatedForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.destination) {
      alert("Please fill in Client Name and Destination Location!");
      return;
    }

    const total = parseFloat(formData.totalAmount) || 0;
    const paid = parseFloat(formData.amountPaid) || 0;
    const balance = Math.max(0, total - paid);

    const bookingData = {
      ...formData,
      pax: parseInt(formData.pax) || 1,
      totalAmount: total,
      amountPaid: paid,
      balance: balance,
      id: bookingToEdit ? bookingToEdit.id : `BK-${Date.now().toString().slice(-6)}`,
      createdAt: bookingToEdit ? bookingToEdit.createdAt : new Date().toISOString().slice(0, 10)
    };

    onSave(bookingData);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Background Dimmed Overlay */}
      <div className="drawer-overlay open" onClick={onClose} />
      
      {/* Slide-out Sidebar Form Drawer */}
      <div className="drawer open">
        <div className="drawer-header">
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>
            {bookingToEdit ? 'Edit Booking Details' : 'Create New Booking'}
          </h2>
          <button className="drawer-close" onClick={onClose} title="Close drawer">
            <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 70px)' }}>
          <div className="drawer-body">
            {/* Client Name */}
            <div className="form-group">
              <label>Client Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter traveler primary contact name"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
              />
            </div>

            {/* FB Link */}
            <div className="form-group">
              <label>Facebook Profile Link</label>
              <input
                type="text"
                className="form-control"
                placeholder="facebook.com/username or direct"
                value={formData.fbLink}
                onChange={(e) => setFormData({ ...formData, fbLink: e.target.value })}
              />
            </div>

            {/* Contact Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="09XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Trip Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Destination Location *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Boracay, El Nido"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pax (Guests)</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={formData.pax}
                  onChange={(e) => setFormData({ ...formData, pax: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Travel Dates */}
            <div className="form-group">
              <label>Travel Dates / Schedule</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Dec 12 - Dec 15, 2026"
                value={formData.travelDates}
                onChange={(e) => setFormData({ ...formData, travelDates: e.target.value })}
              />
            </div>

            {/* Financial Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Total Price (PHP)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="Total Quote"
                  value={formData.totalAmount}
                  onChange={(e) => handleAmountChange('totalAmount', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Amount Paid (PHP)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="Deposit value"
                  value={formData.amountPaid}
                  onChange={(e) => handleAmountChange('amountPaid', e.target.value)}
                />
              </div>
            </div>

            {/* Auto calculated Balance display */}
            <div className="form-group" style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Calculated Balance</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: (formData.totalAmount - formData.amountPaid) > 0 ? 'var(--status-partial)' : 'var(--status-paid)' }}>
                ₱{Math.max(0, (formData.totalAmount - formData.amountPaid)).toLocaleString()} PHP
              </span>
            </div>

            {/* Status Selection */}
            <div className="form-group">
              <label>Payment Status Override</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Pending">Pending (No Deposit)</option>
                <option value="Partial">Partial (Downpayment Paid)</option>
                <option value="Paid">Paid in Full</option>
                <option value="Cancelled">Cancelled Booking</option>
              </select>
            </div>
          </div>

          <div className="drawer-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Discard Changes
            </button>
            <button type="submit" className="btn btn-primary">
              {bookingToEdit ? 'Save Booking Edits' : 'Confirm & Save Booking'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
