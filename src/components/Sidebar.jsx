import Logo from './Logo';

export default function Sidebar({ activeTab, setActiveTab, onLogout, isSidebarOpen, setIsSidebarOpen }) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    },
    {
      id: 'bookings',
      label: 'Bookings List',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    },
    {
      id: 'projects',
      label: 'Kanban Board',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M8 12h8" />
          <path d="M12 8v8" />
        </svg>
      )
    },
    {
      id: 'reports',
      label: 'Reports Generator',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    },
    {
      id: 'messenger',
      label: 'Messenger Hub',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      )
    },
    {
      id: 'destinations',
      label: 'Destinations Guide',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      )
    },
    {
      id: 'parser',
      label: 'FB DM Lead Parser',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    }
  ];

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Logo />
        </div>
        <h1 className="sidebar-title">
          Travel<span>books</span>
        </h1>
        {/* Mobile close toggle button if side drawer is open */}
        <button 
          className="nav-mobile-toggle" 
          onClick={() => setIsSidebarOpen(false)}
          style={{ marginLeft: 'auto', display: 'none' }} // Checked by CSS responsive media queries
        >
          <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.id} className={`menu-item ${activeTab === item.id ? 'active' : ''}`}>
            <a onClick={() => {
              setActiveTab(item.id);
              setIsSidebarOpen(false); // Auto close sidebar on mobile
            }}>
              {item.icon}
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <div className="user-profile-capsule">
          <div className="user-avatar">A</div>
          <div className="user-info-text">
            <span className="user-name">Travelbooks Admin</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>
        <button
          className="btn btn-secondary"
          onClick={onLogout}
          style={{
            width: '100%',
            justifyContent: 'center',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            borderColor: 'rgba(239, 68, 68, 0.2)',
            color: '#ef4444'
          }}
        >
          <svg
            style={{ width: '16px', height: '16px' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout Session
        </button>
      </div>
    </aside>
  );
}
