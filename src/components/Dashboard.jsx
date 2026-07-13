import { useState, useEffect } from 'react';

export default function Dashboard({ 
  bookings, 
  activities, 
  isSimulating, 
  setIsSimulating,
  onNavigateToTab,
  onScanUpcomingTours
}) {
  const [hoveredDot, setHoveredDot] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const [adminPhone, setAdminPhone] = useState(() => localStorage.getItem('travelbooks_alert_phone') || '+63 917 345 6789');
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem('travelbooks_alert_email') || 'admin@travelbooks.ph');
  const [smsEnabled, setSmsEnabled] = useState(() => localStorage.getItem('travelbooks_alert_sms_active') !== 'false');
  const [emailEnabled, setEmailEnabled] = useState(() => localStorage.getItem('travelbooks_alert_email_active') !== 'false');

  // Sync settings
  useEffect(() => {
    localStorage.setItem('travelbooks_alert_phone', adminPhone);
  }, [adminPhone]);

  useEffect(() => {
    localStorage.setItem('travelbooks_alert_email', adminEmail);
  }, [adminEmail]);

  useEffect(() => {
    localStorage.setItem('travelbooks_alert_sms_active', smsEnabled.toString());
  }, [smsEnabled]);

  useEffect(() => {
    localStorage.setItem('travelbooks_alert_email_active', emailEnabled.toString());
  }, [emailEnabled]);

  // Calculate Metrics
  const totalBookingsCount = bookings.filter(b => b.status !== 'Cancelled').length;
  
  // Total Revenue: Sum of amountPaid for all bookings (since that's cash-in-hand) or totalAmount of non-cancelled bookings.
  // Let's do cash-in-hand (Amount Paid) and contract value (Total Booking Value)
  const totalBookingValue = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);

  const totalCollected = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (parseFloat(b.amountPaid) || 0), 0);

  const totalOutstanding = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (parseFloat(b.balance) || 0), 0);

  // Formatting currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(val);
  };

  // Mock Sales over time for SVG chart
  // In a real application, we can group bookings by date.
  // Let's do a dynamic grouping of bookings by month, combined with baseline data to keep the graph looking rich.
  const monthlyDataBaseline = [
    { month: 'Jan', sales: 45000 },
    { month: 'Feb', sales: 58000 },
    { month: 'Mar', sales: 72000 },
    { month: 'Apr', sales: 65000 },
    { month: 'May', sales: 89000 },
    { month: 'Jun', sales: 120000 },
  ];

  // Let's dynamically add current month bookings value to the June/current month data
  // Filter bookings for June 2026 or generic current bookings
  const recentBookingsValue = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);
  
  // Adjust the last month's value dynamically based on actual active bookings in local storage
  const monthlyData = [...monthlyDataBaseline];
  monthlyData[monthlyData.length - 1].sales = Math.max(monthlyData[monthlyData.length - 1].sales, recentBookingsValue);

  const maxSales = Math.max(...monthlyData.map(d => d.sales), 10000);

  // SVG Chart Config
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Compute points
  const points = monthlyData.map((d, index) => {
    const x = paddingLeft + (index * (chartWidth / (monthlyData.length - 1)));
    const y = paddingTop + chartHeight - ((d.sales / maxSales) * chartHeight);
    return { x, y, label: d.month, value: d.sales };
  });

  // Generate SVG path for line
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Generate SVG path for gradient area
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  const handleDotMouseEnter = (e, dot, index) => {
    const rect = e.target.getBoundingClientRect();
    const svgElement = e.target.ownerSVGElement || e.target.closest('svg');
    const container = svgElement ? svgElement.parentNode.getBoundingClientRect() : { left: 0, top: 0 };
    
    setHoveredDot({
      label: dot.label,
      value: dot.value,
      index
    });
    
    setTooltipPos({
      x: rect.left - container.left + 10,
      y: rect.top - container.top - 40
    });
  };

  const handleDotMouseLeave = () => {
    setHoveredDot(null);
  };

  return (
    <div className="panel active">
      {/* Page Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>Dashboard Overview</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Real-time metrics and booking trends</p>
        </div>

        {/* Real-time simulation status toggle */}
        <div className="card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: isSimulating ? 'var(--status-paid)' : 'var(--text-muted)' }}>
            {isSimulating ? '● LIVE MONITOR ACTIVE' : '○ SIMULATOR PAUSED'}
          </span>
          <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px' }}>
            <input 
              type="checkbox" 
              checked={isSimulating}
              onChange={(e) => setIsSimulating(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              inset: 0,
              backgroundColor: isSimulating ? 'var(--brand-primary)' : 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              transition: '0.4s'
            }}>
              <span style={{
                position: 'absolute',
                content: '""',
                height: '14px',
                width: '14px',
                left: isSimulating ? '18px' : '3px',
                bottom: '3px',
                backgroundColor: isSimulating ? '#ffffff' : 'var(--text-muted)',
                borderRadius: '50%',
                transition: '0.4s'
              }} />
            </span>
          </label>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="dashboard-grid">
        {/* Total Bookings Card */}
        <div className="card stat-card" onClick={() => onNavigateToTab('bookings')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-glow" />
          <div className="stat-header">
            <span className="stat-title">Active Bookings</span>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{totalBookingsCount}</div>
          <div className="stat-trend">
            <span className="trend-up">↑ 12%</span>
            <span style={{ color: 'var(--text-muted)' }}>this week</span>
          </div>
        </div>

        {/* Contract Value Card */}
        <div className="card stat-card">
          <div className="stat-card-glow" />
          <div className="stat-header">
            <span className="stat-title">Total Sales</span>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{formatCurrency(totalBookingValue)}</div>
          <div className="stat-trend">
            <span className="trend-up">↑ 8.4%</span>
            <span style={{ color: 'var(--text-muted)' }}>gross value</span>
          </div>
        </div>

        {/* Revenue Collected Card */}
        <div className="card stat-card" onClick={() => onNavigateToTab('reports')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-glow" />
          <div className="stat-header">
            <span className="stat-title">Revenue Received</span>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{formatCurrency(totalCollected)}</div>
          <div className="stat-trend">
            <span className="trend-up" style={{ color: 'var(--status-paid)' }}>
              {totalBookingValue > 0 ? Math.round((totalCollected / totalBookingValue) * 100) : 0}% collected
            </span>
          </div>
        </div>

        {/* Pending Collections Card */}
        <div className="card stat-card">
          <div className="stat-card-glow" />
          <div className="stat-header">
            <span className="stat-title">Outstanding Balance</span>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{formatCurrency(totalOutstanding)}</div>
          <div className="stat-trend">
            <span className="trend-down" style={{ color: totalOutstanding > 0 ? 'var(--status-partial)' : 'var(--status-paid)' }}>
              {formatCurrency(totalOutstanding)} pending
            </span>
          </div>
        </div>
      </div>

      {/* Charts & Activities Row */}
      <div className="dashboard-main-row">
        {/* Sales Trend Chart Card */}
        <div className="card" style={{ position: 'relative' }}>
          <div className="chart-card-header">
            <div>
              <h3 style={{ fontSize: '16px', color: '#ffffff' }}>Booking & Sales Volume</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Monthly gross values in PHP</p>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span className="badge" style={{ backgroundColor: 'rgba(255,162,0,0.1)', color: 'var(--brand-primary)' }}>Monthly Report</span>
            </div>
          </div>

          <div className="chart-container">
            <svg className="svg-chart" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0"/>
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = paddingTop + (chartHeight * ratio);
                return (
                  <line 
                    key={index} 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={svgWidth - paddingRight} 
                    y2={y} 
                    className="chart-grid-line" 
                  />
                );
              })}

              {/* Y Axis Labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const val = maxSales * (1 - ratio);
                const y = paddingTop + (chartHeight * ratio) + 4;
                return (
                  <text 
                    key={index} 
                    x={paddingLeft - 8} 
                    y={y} 
                    textAnchor="end" 
                    fill="var(--text-muted)" 
                    style={{ fontSize: '10px', fontFamily: 'Inter' }}
                  >
                    {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  </text>
                );
              })}

              {/* Gradient Area under line */}
              {areaPath && <path d={areaPath} className="chart-area" />}

              {/* Stroke Line */}
              {linePath && <path d={linePath} className="chart-line" />}

              {/* Interactive Dots */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  className="chart-dot"
                  onMouseEnter={(e) => handleDotMouseEnter(e, p, i)}
                  onMouseLeave={handleDotMouseLeave}
                />
              ))}

              {/* X Axis Labels */}
              {points.map((p, i) => (
                <text
                  key={i}
                  x={p.x}
                  y={svgHeight - 15}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  style={{ fontSize: '11px', fontFamily: 'Inter' }}
                >
                  {p.label}
                </text>
              ))}
            </svg>

            {/* Custom Tooltip */}
            {hoveredDot && (
              <div 
                className="chart-tooltip" 
                style={{ 
                  opacity: 1, 
                  left: `${tooltipPos.x}px`, 
                  top: `${tooltipPos.y}px` 
                }}
              >
                <strong style={{ color: '#ffffff' }}>{hoveredDot.label}</strong>
                <div style={{ color: 'var(--brand-primary)', marginTop: '2px', fontWeight: 'bold' }}>
                  {formatCurrency(hoveredDot.value)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Recent Activity Log */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, maxHeight: '280px' }}>
            <h3 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '8px' }}>Recent Activity Logs</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '16px' }}>System actions history</p>
            
            <div className="activity-list" style={{ flexGrow: 1, overflowY: 'auto', maxHeight: '180px' }}>
              {activities.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '24px 0' }}>
                  No recent activities recorded.
                </div>
              ) : (
                activities.map((act) => (
                  <div className="activity-item" key={act.id}>
                    <div className="activity-dot">
                      {act.type === 'booking_created' && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <line x1="19" y1="8" x2="19" y2="14" />
                          <line x1="22" y1="11" x2="16" y2="11" />
                        </svg>
                      )}
                      {act.type === 'booking_updated' && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      )}
                      {act.type === 'booking_deleted' && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      )}
                      {act.type === 'task_moved' && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 11 12 14 22 4" />
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                      )}
                      {act.type === 'lead_parsed' && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="activity-content">
                      <div className="activity-text" dangerouslySetInnerHTML={{ __html: act.text }} />
                      <span className="activity-time">{act.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
 
          {/* Admin Alerts Panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: '15px', color: '#ffffff', marginBottom: '4px' }}>Admin Notification Alerts</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Send automatic SMS & Email alerts for nearing client tours</p>
            </div>
 
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '10px', marginBottom: '4px' }}>Admin Phone (Twilio SMS)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={adminPhone} 
                  onChange={(e) => setAdminPhone(e.target.value)} 
                  placeholder="+63 917 345 6789"
                  style={{ padding: '8px 12px', fontSize: '12px' }}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '10px', marginBottom: '4px' }}>Admin Email (SendGrid)</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={adminEmail} 
                  onChange={(e) => setAdminEmail(e.target.value)} 
                  placeholder="admin@travelbooks.ph"
                  style={{ padding: '8px 12px', fontSize: '12px' }}
                />
              </div>
 
              <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', cursor: 'pointer', color: 'var(--text-main)' }}>
                  <input 
                    type="checkbox" 
                    checked={smsEnabled} 
                    onChange={(e) => setSmsEnabled(e.target.checked)} 
                    style={{ accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                  />
                  SMS Gateway
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', cursor: 'pointer', color: 'var(--text-main)' }}>
                  <input 
                    type="checkbox" 
                    checked={emailEnabled} 
                    onChange={(e) => setEmailEnabled(e.target.checked)} 
                    style={{ accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                  />
                  Email Gateway
                </label>
              </div>
            </div>
 
            <button 
              className="btn btn-primary" 
              onClick={() => onScanUpcomingTours(adminPhone, adminEmail, smsEnabled, emailEnabled)}
              style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '10px 14px' }}
            >
              <svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Scan & Notify Upcoming Tours
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
