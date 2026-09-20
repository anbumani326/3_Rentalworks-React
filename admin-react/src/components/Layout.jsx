import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { to: '/', icon: 'folder', label: 'Dashboard', end: true },
  { to: '/users', icon: 'group', label: 'User Management' },
  { to: '/properties', icon: 'apartment', label: 'PG Properties' },
  { to: '/bookings', icon: 'calendar_today', label: 'Bookings' },
  { to: '/payments', icon: 'credit_card', label: 'Payments' },
  { to: '/complaints', icon: 'feedback', label: 'Complaints' },
  { to: '/notifications', icon: 'notifications', label: 'Announcements' },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  return (
    <div className="layout">
      {sidebarOpen && <div className="sidebar-backdrop show" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sb-brand">
          <span className="b-ico"><span className="material-icons-outlined" style={{fontSize: 24}}>apartment</span></span>
          <div><h3>RentBro</h3><span>Admin Portal</span></div>
        </div>
        <nav className="sb-nav">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="n-ico"><span className="material-icons-outlined" style={{fontSize: 24}}>{item.icon}</span></span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main-wrap">
        <header className="navbar">
          <div className="nb-left">
            <button className="nb-icon sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span className="material-icons-outlined" style={{fontSize: 24}}>menu</span>
            </button>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <h4>Welcome back, Admin</h4>
              </div>
              <p>admin@pgrentals.com</p>
            </div>
          </div>
          <div className="nb-right">
            <NavLink to="/notifications" className="nb-icon"><span className="material-icons-outlined" style={{fontSize: 24}}>notifications</span><span className="nb-dot"></span></NavLink>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
