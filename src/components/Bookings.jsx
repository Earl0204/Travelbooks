import { useState } from 'react';

export default function Bookings({ 
  bookings, 
  searchQuery, 
  onEditBookingClick, 
  onDeleteBooking,
  onImportBookings
}) {
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter logic
  const filteredBookings = bookings.filter((booking) => {
    // Status Filter
    const matchesStatus = statusFilter === 'All' || (booking.status || '').toLowerCase() === statusFilter.toLowerCase();
    
    // Search Query Filter
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      (booking.clientName || '').toLowerCase().includes(term) ||
      (booking.destination || '').toLowerCase().includes(term) ||
      (booking.email || '').toLowerCase().includes(term) ||
      (booking.phone || '').toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  // Export to CSV helper
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      alert("No bookings found to export!");
      return;
    }

    const headers = ["Booking ID", "Client Name", "FB Link", "Email", "Phone", "Destination", "Travel Dates", "Pax", "Total Amount", "Amount Paid", "Outstanding Balance", "Status", "Date Created"];
    const rows = filteredBookings.map(b => [
      b.id,
      `"${(b.clientName || '').replace(/"/g, '""')}"`,
      `"${(b.fbLink || '').replace(/"/g, '""')}"`,
      b.email || '',
      b.phone || '',
      `"${(b.destination || '').replace(/"/g, '""')}"`,
      `"${(b.travelDates || '').replace(/"/g, '""')}"`,
      b.pax || 1,
      b.totalAmount || 0,
      b.amountPaid || 0,
      b.balance || 0,
      b.status || 'Pending',
      b.createdAt || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Travelbooks_Bookings_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
          alert("CSV is empty or missing data rows!");
          return;
        }

        // CSV parsing helper that handles quoted strings correctly
        const parseCSVLine = (textLine) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < textLine.length; i++) {
            const char = textLine[i];
            if (char === '"') {
              if (inQuotes && textLine[i + 1] === '"') {
                current += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(current);
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current);
          return result;
        };

        const headers = parseCSVLine(lines[0]).map(h => h.trim());
        const importedData = [];

        // Map column indexes based on header titles to make it flexible
        const idIdx = headers.findIndex(h => h.toLowerCase().includes("id"));
        const nameIdx = headers.findIndex(h => h.toLowerCase().includes("name"));
        const fbIdx = headers.findIndex(h => h.toLowerCase().includes("fb") || h.toLowerCase().includes("link"));
        const emailIdx = headers.findIndex(h => h.toLowerCase().includes("email"));
        const phoneIdx = headers.findIndex(h => h.toLowerCase().includes("phone") || h.toLowerCase().includes("mobile"));
        const destIdx = headers.findIndex(h => h.toLowerCase().includes("destination") || h.toLowerCase().includes("package"));
        const datesIdx = headers.findIndex(h => h.toLowerCase().includes("dates") || h.toLowerCase().includes("schedule"));
        const paxIdx = headers.findIndex(h => h.toLowerCase().includes("pax") || h.toLowerCase().includes("headcount"));
        const totalIdx = headers.findIndex(h => h.toLowerCase().includes("total") || h.toLowerCase().includes("bill") || h.toLowerCase().includes("amount"));
        const paidIdx = headers.findIndex(h => h.toLowerCase().includes("paid") || h.toLowerCase().includes("deposit"));
        const statusIdx = headers.findIndex(h => h.toLowerCase().includes("status"));

        if (nameIdx === -1 || destIdx === -1) {
          alert("Missing essential columns in CSV! Ensure you have at least 'Client Name' and 'Destination' headers.");
          return;
        }

        for (let i = 1; i < lines.length; i++) {
          const cells = parseCSVLine(lines[i]);
          if (cells.length < headers.length) continue;

          const clientName = cells[nameIdx]?.trim() || '';
          const destination = cells[destIdx]?.trim() || '';
          if (!clientName || !destination) continue; // Skip invalid records

          const totalAmount = parseFloat((cells[totalIdx] || '0').replace(/[^0-9.]/g, '')) || 0;
          const amountPaid = parseFloat((cells[paidIdx] || '0').replace(/[^0-9.]/g, '')) || 0;
          const balance = Math.max(0, totalAmount - amountPaid);
          
          let status = cells[statusIdx]?.trim() || 'Pending';
          // Standardize status
          if (parseFloat(balance) === 0 && totalAmount > 0) {
            status = 'Paid';
          } else if (amountPaid > 0 && balance > 0) {
            status = 'Partial';
          }

          const id = cells[idIdx]?.trim() || `BK-LEGACY-${Math.floor(100000 + Math.random() * 900000)}`;

          importedData.push({
            id,
            clientName,
            fbLink: fbIdx !== -1 ? (cells[fbIdx]?.trim() || '') : '',
            email: emailIdx !== -1 ? (cells[emailIdx]?.trim() || '') : '',
            phone: phoneIdx !== -1 ? (cells[phoneIdx]?.trim() || '') : '',
            destination,
            travelDates: datesIdx !== -1 ? (cells[datesIdx]?.trim() || 'TBD') : 'TBD',
            pax: paxIdx !== -1 ? parseInt(cells[paxIdx]?.trim()) || 1 : 1,
            totalAmount,
            amountPaid,
            balance,
            status,
            createdAt: new Date().toISOString().slice(0, 10)
          });
        }

        if (importedData.length === 0) {
          alert("No valid bookings found to import!");
          return;
        }

        onImportBookings(importedData);
        alert(`Successfully imported ${importedData.length} legacy bookings!`);
      } catch (err) {
        console.error(err);
        alert("Error parsing CSV. Please check that the formatting is valid.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset selection
  };

  // Currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(val);
  };

  // Status Badge Class Selector
  const getBadgeClass = (status) => {
    switch(status.toLowerCase()) {
      case 'paid': return 'badge-paid';
      case 'partial': return 'badge-partial';
      case 'pending': return 'badge-pending';
      case 'cancelled': return 'badge-cancelled';
      default: return 'badge-pending';
    }
  };

  // Get Avatar Initials
  const getInitials = (name) => {
    if (!name) return 'TB';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="panel active">
      {/* Table Title and Actions */}
      <div className="table-header-row">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>Bookings Directory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Showing {filteredBookings.length} bookings matching filters</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Status Filter Tabs */}
          <div className="filter-group">
            {['All', 'Paid', 'Partial', 'Pending', 'Cancelled'].map((status) => (
              <button
                key={status}
                className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>

          {/* CSV Download Trigger */}
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>

          {/* CSV Import Trigger */}
          <button 
            className="btn btn-secondary" 
            onClick={() => document.getElementById('csv-import-file').click()}
            style={{ 
              backgroundColor: 'rgba(255, 162, 0, 0.08)', 
              borderColor: 'rgba(255, 162, 0, 0.3)', 
              color: 'var(--brand-primary)' 
            }}
          >
            <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import Excel/CSV
          </button>
          <input 
            type="file" 
            id="csv-import-file" 
            accept=".csv" 
            onChange={handleImportCSV} 
            style={{ display: 'none' }} 
          />
        </div>
      </div>

      {/* Bookings Table Card */}
      <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Client Details</th>
                <th>Destination</th>
                <th>Travel Dates</th>
                <th>Pax</th>
                <th>Total Bill</th>
                <th>Paid Amount</th>
                <th>Outstanding</th>
                <th>Payment Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '14px', marginBottom: '8px' }}>No bookings found</div>
                    <div style={{ fontSize: '12px' }}>Try adjusting your search query or filters.</div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    {/* Client Details Cell */}
                    <td>
                      <div className="client-cell">
                        <div className="client-avatar">
                          {getInitials(booking.clientName)}
                        </div>
                        <div className="client-info">
                          <span className="client-name">{booking.clientName}</span>
                          <span className="client-fb">
                            <svg style={{ width: '12px', height: '12px', fill: 'currentColor' }} viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            {booking.fbLink || 'Direct Lead'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Destination Cell */}
                    <td>
                      <span style={{ fontWeight: '500', color: '#ffffff' }}>{booking.destination}</span>
                    </td>

                    {/* Dates Cell */}
                    <td>
                      <span style={{ color: 'var(--text-muted)' }}>{booking.travelDates}</span>
                    </td>

                    {/* Pax Cell */}
                    <td>
                      <span style={{ fontWeight: '600', color: '#ffffff' }}>{booking.pax}</span>
                    </td>

                    {/* Total Cell */}
                    <td>
                      <span style={{ fontWeight: '600', color: '#ffffff' }}>{formatCurrency(booking.totalAmount)}</span>
                    </td>

                    {/* Paid Cell */}
                    <td>
                      <span style={{ color: 'var(--status-paid)', fontWeight: '500' }}>{formatCurrency(booking.amountPaid)}</span>
                    </td>

                    {/* Balance Cell */}
                    <td>
                      <span style={{ 
                        color: parseFloat(booking.balance) > 0 ? 'var(--status-partial)' : 'var(--text-muted)',
                        fontWeight: parseFloat(booking.balance) > 0 ? '600' : '400'
                      }}>
                        {formatCurrency(booking.balance)}
                      </span>
                    </td>

                    {/* Status Cell */}
                    <td>
                      <span className={`badge ${getBadgeClass(booking.status)}`}>
                        <span style={{
                          display: 'inline-block',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'currentColor'
                        }} />
                        {booking.status}
                      </span>
                    </td>

                    {/* Actions Cell */}
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {/* Edit Button */}
                        <button 
                          className="action-dots"
                          title="Edit Booking"
                          onClick={() => onEditBookingClick(booking)}
                          style={{ padding: '6px 8px' }}
                        >
                          <svg style={{ width: '15px', height: '15px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>

                        {/* Delete Button */}
                        <button 
                          className="action-dots"
                          title="Delete Booking"
                          onClick={() => onDeleteBooking(booking.id)}
                          style={{ padding: '6px 8px', color: 'rgba(239, 68, 68, 0.7)' }}
                        >
                          <svg style={{ width: '15px', height: '15px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
