
export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  theme, 
  toggleTheme, 
  notificationCount, 
  clearNotifications,
  onAddBookingClick,
  onHamburgerClick
}) {
  return (
    <header className="header">
      {/* Mobile Hamburger Menu Toggle */}
      <button 
        className="nav-mobile-toggle" 
        onClick={onHamburgerClick}
        style={{ marginRight: '16px', display: 'flex', alignItems: 'center' }}
      >
        <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Global Search Bar */}
      <div className="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input 
          type="text" 
          placeholder="Search bookings, clients, destinations..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Header Actions Area */}
      <div className="header-actions">
        {/* Quick Add Booking */}
        <button className="btn btn-primary" onClick={onAddBookingClick}>
          <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span style={{ display: 'inline-block' }}>New Booking</span>
        </button>

        {/* Theme Toggle Button */}
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            // Sun icon
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            // Moon icon
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Notification Bell with Badge */}
        <div 
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={clearNotifications}
          title="Notification inbox"
        >
          <button 
            className="theme-toggle" 
            style={{ 
              position: 'relative',
              borderColor: notificationCount > 0 ? 'var(--brand-primary)' : 'var(--border-color)',
            }}
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ animation: notificationCount > 0 ? 'wobble 1s infinite' : 'none' }}
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          
          {notificationCount > 0 && (
            <span 
              className="notification-badge"
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-primary)',
                color: 'var(--text-inverse)',
                fontSize: '10px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px var(--brand-primary)',
              }}
            >
              {notificationCount}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
