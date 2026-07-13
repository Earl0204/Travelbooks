import { useState } from 'react';

export default function Reports({ bookings }) {
  const [selectedReport, setSelectedReport] = useState('sales');

  // Currency formatter
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(val);
  };

  // 1. Sales & Revenue Compilation
  const salesBookings = bookings.filter(b => b.status !== 'Cancelled');
  const totalContractVal = salesBookings.reduce((s, b) => s + (parseFloat(b.totalAmount) || 0), 0);
  const totalReceivedVal = salesBookings.reduce((s, b) => s + (parseFloat(b.amountPaid) || 0), 0);
  const totalBalanceVal = salesBookings.reduce((s, b) => s + (parseFloat(b.balance) || 0), 0);

  // 2. Destination Demands Compilation
  const destinationStats = bookings.reduce((acc, b) => {
    if (b.status === 'Cancelled') return acc;
    const dest = b.destination || 'Unspecified';
    if (!acc[dest]) {
      acc[dest] = { name: dest, bookingsCount: 0, totalPax: 0, revenue: 0 };
    }
    acc[dest].bookingsCount += 1;
    acc[dest].totalPax += parseInt(b.pax) || 0;
    acc[dest].revenue += parseFloat(b.totalAmount) || 0;
    return acc;
  }, {});
  const destinationList = Object.values(destinationStats).sort((a, b) => b.revenue - a.revenue);

  // 3. Outstanding Balances Compilation
  const collectibleBookings = bookings.filter(b => b.status !== 'Cancelled' && parseFloat(b.balance) > 0);
  const totalOutstandingCollectibles = collectibleBookings.reduce((s, b) => s + (parseFloat(b.balance) || 0), 0);

  // Print helper
  const handlePrint = () => {
    window.print();
  };

  // Export report to CSV
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = '';

    if (selectedReport === 'sales') {
      filename = 'Sales_And_Revenue_Report';
      headers = ["Booking ID", "Client Name", "Destination", "Total Amount", "Amount Paid", "Balance", "Status", "Created At"];
      rows = salesBookings.map(b => [
        b.id,
        `"${(b.clientName || '').replace(/"/g, '""')}"`,
        `"${(b.destination || '').replace(/"/g, '""')}"`,
        b.totalAmount || 0,
        b.amountPaid || 0,
        b.balance || 0,
        b.status || 'Pending',
        b.createdAt || ''
      ]);
    } else if (selectedReport === 'demands') {
      filename = 'Destination_Demands_Report';
      headers = ["Destination", "Bookings Count", "Total Passengers (Pax)", "Gross Revenue"];
      rows = destinationList.map(d => [
        `"${(d.name || '').replace(/"/g, '""')}"`,
        d.bookingsCount,
        d.totalPax,
        d.revenue
      ]);
    } else if (selectedReport === 'collectibles') {
      filename = 'Collectibles_Report';
      headers = ["Booking ID", "Client Name", "Destination", "Travel Dates", "Total Bill", "Paid Amount", "Outstanding Balance"];
      rows = collectibleBookings.map(b => [
        b.id,
        `"${(b.clientName || '').replace(/"/g, '""')}"`,
        `"${(b.destination || '').replace(/"/g, '""')}"`,
        `"${(b.travelDates || '').replace(/"/g, '""')}"`,
        b.totalAmount || 0,
        b.amountPaid || 0,
        b.balance || 0
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Travelbooks_${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="panel active printable-area">
      {/* Print-only CSS style override to hide side nav and layout margins */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .card {
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            backdrop-filter: none !important;
            padding: 0 !important;
          }
          .btn, .report-controls, .no-print {
            display: none !important;
          }
          .custom-table th {
            color: #000000 !important;
            border-bottom: 2px solid #000000 !important;
          }
          .custom-table td {
            color: #000000 !important;
            border-bottom: 1px solid #dddddd !important;
          }
          h2, h3, span, td, th {
            color: #000000 !important;
          }
          .report-summary-box {
            border: 1px solid #cccccc !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
        }
      `}</style>

      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }} className="no-print">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>Financial & Booking Reports</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Summarized analytical statements and receivables tracking</p>
        </div>
      </div>

      <div className="reports-layout">
        {/* Left Side Control Panel */}
        <div className="report-controls card no-print">
          <h3 style={{ fontSize: '14px', color: '#ffffff', marginBottom: '8px' }}>Select Statement</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className={`btn ${selectedReport === 'sales' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => setSelectedReport('sales')}
            >
              Sales & Revenue Report
            </button>
            <button
              className={`btn ${selectedReport === 'demands' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => setSelectedReport('demands')}
            >
              Destination Demands
            </button>
            <button
              className={`btn ${selectedReport === 'collectibles' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => setSelectedReport('collectibles')}
            >
              Collectibles & Balances
            </button>
          </div>
        </div>

        {/* Right Side Preview Panel */}
        <div className="card report-preview-container">
          <div className="report-preview-header">
            <div>
              <h3 className="report-title-main">
                {selectedReport === 'sales' && 'Sales & Revenue Statement'}
                {selectedReport === 'demands' && 'Destination Demands Analysis'}
                {selectedReport === 'collectibles' && 'Outstanding Receivables Report'}
              </h3>
              <span className="report-meta-tag">
                Compiled on {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }} className="no-print">
              <button className="btn btn-secondary" onClick={handleExportCSV} title="Download Statement CSV">
                <svg style={{ width: '15px', height: '15px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                CSV
              </button>
              <button className="btn btn-primary" onClick={handlePrint} title="Print Statement">
                <svg style={{ width: '15px', height: '15px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print Report
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="report-summary-boxes">
            <div className="report-summary-box">
              <span className="report-summary-label">Total Bookings</span>
              <div className="report-summary-val">
                {selectedReport === 'sales' && salesBookings.length}
                {selectedReport === 'demands' && bookings.filter(b => b.status !== 'Cancelled').length}
                {selectedReport === 'collectibles' && collectibleBookings.length}
              </div>
            </div>

            <div className="report-summary-box">
              <span className="report-summary-label">Contract Worth</span>
              <div className="report-summary-val">
                {selectedReport === 'sales' && formatCurrency(totalContractVal)}
                {selectedReport === 'demands' && formatCurrency(destinationList.reduce((s, d) => s + d.revenue, 0))}
                {selectedReport === 'collectibles' && formatCurrency(collectibleBookings.reduce((s, b) => s + parseFloat(b.totalAmount), 0))}
              </div>
            </div>

            <div className="report-summary-box">
              <span className="report-summary-label">Cash Collected</span>
              <div className="report-summary-val">
                {selectedReport === 'sales' && formatCurrency(totalReceivedVal)}
                {selectedReport === 'demands' && 'N/A'}
                {selectedReport === 'collectibles' && formatCurrency(collectibleBookings.reduce((s, b) => s + parseFloat(b.amountPaid), 0))}
              </div>
            </div>

            <div className="report-summary-box">
              <span className="report-summary-label">Balances Due</span>
              <div className="report-summary-val" style={{ color: 'var(--brand-primary)' }}>
                {selectedReport === 'sales' && formatCurrency(totalBalanceVal)}
                {selectedReport === 'demands' && 'N/A'}
                {selectedReport === 'collectibles' && formatCurrency(totalOutstandingCollectibles)}
              </div>
            </div>
          </div>

          {/* Report Data Table */}
          <div className="table-container">
            {selectedReport === 'sales' && (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Client Name</th>
                    <th>Destination</th>
                    <th>Total Contract</th>
                    <th>Amount Paid</th>
                    <th>Balance Due</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {salesBookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No sales bookings recorded.</td>
                    </tr>
                  ) : (
                    salesBookings.map((b) => (
                      <tr key={b.id}>
                        <td style={{ color: 'var(--brand-primary)', fontWeight: '600' }}>{b.id}</td>
                        <td style={{ fontWeight: '500', color: '#ffffff' }}>{b.clientName}</td>
                        <td>{b.destination}</td>
                        <td>{formatCurrency(b.totalAmount)}</td>
                        <td style={{ color: 'var(--status-paid)' }}>{formatCurrency(b.amountPaid)}</td>
                        <td style={{ color: parseFloat(b.balance) > 0 ? 'var(--status-partial)' : 'var(--text-muted)' }}>{formatCurrency(b.balance)}</td>
                        <td>{b.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {selectedReport === 'demands' && (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Destination Location</th>
                    <th>Total Bookings</th>
                    <th>Headcount (Pax)</th>
                    <th>Gross Sales generated</th>
                  </tr>
                </thead>
                <tbody>
                  {destinationList.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No destination demand statistics compiled.</td>
                    </tr>
                  ) : (
                    destinationList.map((d, index) => (
                      <tr key={d.name}>
                        <td style={{ fontWeight: '600', color: 'var(--brand-primary)' }}>#{index + 1}</td>
                        <td style={{ fontWeight: '500', color: '#ffffff' }}>{d.name}</td>
                        <td>{d.bookingsCount} booking(s)</td>
                        <td>{d.totalPax} pax traveling</td>
                        <td style={{ fontWeight: '600', color: '#ffffff' }}>{formatCurrency(d.revenue)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {selectedReport === 'collectibles' && (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Debtor / Client Name</th>
                    <th>Destination</th>
                    <th>Travel Dates</th>
                    <th>Total Bill</th>
                    <th>Paid Amount</th>
                    <th>Remaining Bal</th>
                  </tr>
                </thead>
                <tbody>
                  {collectibleBookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--status-paid)', fontWeight: '600' }}>✓ All outstanding balances have been cleared!</td>
                    </tr>
                  ) : (
                    collectibleBookings.map((b) => (
                      <tr key={b.id}>
                        <td style={{ color: 'var(--brand-primary)', fontWeight: '600' }}>{b.id}</td>
                        <td style={{ fontWeight: '500', color: '#ffffff' }}>{b.clientName}</td>
                        <td>{b.destination}</td>
                        <td>{b.travelDates}</td>
                        <td>{formatCurrency(b.totalAmount)}</td>
                        <td>{formatCurrency(b.amountPaid)}</td>
                        <td style={{ color: 'var(--status-cancelled)', fontWeight: '600' }}>{formatCurrency(b.balance)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
