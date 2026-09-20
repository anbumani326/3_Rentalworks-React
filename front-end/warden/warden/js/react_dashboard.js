const { useState, useEffect, Fragment } = React;

// Helper to get global variables safely
const getGlobalData = () => ({
  tenants: typeof tenants !== 'undefined' ? tenants : [],
  rooms: typeof rooms !== 'undefined' ? rooms : [],
  violations: typeof violations !== 'undefined' ? violations : [],
  complaints: typeof complaints !== 'undefined' ? complaints : [],
  notifications: typeof notifications !== 'undefined' ? notifications : []
});

function Sidebar({ currentSection }) {
  const navItems = [
    { id: 'dashboard', icon: 'folder', label: 'Dashboard' },
    { id: 'tenants', icon: 'group', label: 'Tenant Records' },
    { id: 'rooms', icon: 'home', label: 'Room Services' },
    { id: 'violations', icon: 'warning', label: 'Rule Violations' },
    { id: 'complaints', icon: 'chat', label: 'Complaints' },
    { id: 'notifications', icon: 'notifications', label: 'Notifications' },
    { id: 'profile', icon: 'person', label: 'Profile' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon"><span className="material-icons-outlined" style={{ fontSize: '32px' }}>apartment</span></span>
        <div className="brand-text">
          <h3>RentBro</h3>
          <span>Warden Portal</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <div
            key={item.id}
            className={`nav-item ${currentSection === item.id ? 'active' : ''}`}
            onClick={() => window.navigateTo && window.navigateTo(item.id)}
          >
            <span className="nav-icon"><span className="material-icons-outlined" style={{ fontSize: '24px' }}>{item.icon}</span></span> {item.label}
          </div>
        ))}
      </nav>
    </aside>
  );
}

function Header() {
  const user = JSON.parse(sessionStorage.getItem('pg_user') || '{}');

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h4 id="navbar-user-name">Welcome back, {user.name || 'Warden'}</h4>
        <p id="navbar-user-email">{user.email || 'warden@pgrentals.com'}</p>
      </div>
      <div className="navbar-right">
        <div className="nav-icon-btn" onClick={() => window.navigateTo && window.navigateTo('notifications')}>
          <span className="material-icons-outlined" style={{ fontSize: '24px' }}>notifications</span>
          <span className="notif-badge" id="notif-badge" style={{ display: 'none' }}></span>
        </div>
        <div className="nav-icon-btn" onClick={() => window.navigateTo && window.navigateTo('profile')}>
          <span className="material-icons-outlined" style={{ fontSize: '24px' }}>person</span>
        </div>
        <button className="btn-logout" id="logout-btn" onClick={() => window.handleLogout && window.handleLogout()}>
          ↪ Logout
        </button>
      </div>
    </header>
  );
}

function StatCard({ icon, color, label, value, sub, materialIcon }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <span className="material-icons-outlined" style={{ fontSize: '32px' }}>{materialIcon}</span>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

function ComplaintsChart() {
  const data = [
    { label: 'Electrical', val: 12 },
    { label: 'Plumbing', val: 8 },
    { label: 'Others', val: 6 },
    { label: 'Cleanliness', val: 4 }
  ];
  const max = Math.max(...data.map(d => d.val)) || 1; // prevent div by zero

  return (
    <div className="chart-card">
      <h3>Complaints by Type</h3>
      <div className="bar-chart" id="bar-chart-canvas">
        {data.map(d => (
          <div key={d.label} className="bar-group">
            <div className="bar" style={{ height: `${(d.val / max) * 100}px` }} title={d.val}></div>
            <span className="bar-label">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="bar-legend">
        <div className="bar-legend-dot"></div>
        <span>Complaints</span>
      </div>
    </div>
  );
}

function RoomStatusChart({ rooms }) {
  const total = rooms.length || 1;
  const occupied = rooms.filter(r => r.occupancy === 'Occupied').length;
  const vacant = rooms.filter(r => r.occupancy === 'Vacant').length;
  const maintenance = rooms.filter(r => r.maintenance === 'Under Maintenance').length;

  const occPct = Math.round((occupied / total) * 100) || 0;
  const vacPct = Math.round((vacant / total) * 100) || 0;
  let mainPct = 100 - occPct - vacPct;
  if (mainPct < 0) mainPct = 0; // edge cases

  const data = [
    { label: `Occupied ${occPct}%`, value: occPct, color: '#2563eb' },
    { label: `Vacant ${vacPct}%`, value: vacPct, color: '#16a34a' },
    { label: `Maintenance ${mainPct}%`, value: mainPct, color: '#f5a623' }
  ];

  let startAngle = 0;
  const cx = 70, cy = 70, r = 60;

  return (
    <div className="chart-card">
      <h3>Room Status Distribution</h3>
      <div className="pie-wrapper">
        <svg className="pie-chart-svg" width="140" height="140" viewBox="0 0 140 140">
          {total > 1 || rooms.length > 0 ? data.map((d, i) => {
            const angle = (d.value / 100) * 2 * Math.PI;
            if (angle === 0) return null;
            
            // Handle full circle edge case
            if (angle >= 2 * Math.PI - 0.001) {
              return <circle key={i} cx={cx} cy={cy} r={r} fill={d.color} stroke="white" strokeWidth="2" />;
            }

            const endAngle = startAngle + angle;
            const x1 = cx + r * Math.sin(startAngle);
            const y1 = cy - r * Math.cos(startAngle);
            const x2 = cx + r * Math.sin(endAngle);
            const y2 = cy - r * Math.cos(endAngle);
            const large = angle > Math.PI ? 1 : 0;
            const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`;
            startAngle = endAngle;
            return <path key={i} d={path} fill={d.color} stroke="white" strokeWidth="2" />;
          }) : <circle cx={cx} cy={cy} r={r} fill="#e5e7eb" stroke="white" strokeWidth="2" />}
        </svg>
        <div className="pie-legend" id="pie-legend">
          {data.map((d, i) => (
            <div key={i} className="pie-legend-item">
              <div className="pie-dot" style={{ background: d.color }}></div>
              <span>{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecentComplaints({ complaints }) {
  if (complaints.length === 0) {
    return (
      <div id="recent-complaints">
        <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '16px' }}>No recent complaints</p>
      </div>
    );
  }

  const recent = complaints.slice(0, 3);
  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  return (
    <div id="recent-complaints">
      {recent.map((c, i) => (
        <div key={c.id || i} className="complaint-item">
          <div className="complaint-info">
            <strong>{c.type} issue</strong>
            <span>{c.tenant} - Room {c.room}</span>
          </div>
          <div className="complaint-meta">
            <span className={`badge badge-${c.priority}`}>{capitalize(c.priority)}</span>
            <div className="complaint-time">{c.date}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentActivity() {
  const items = [
    { id: 1, text: 'New tenant check-in', sub: 'Sneha Patil - Room 208', time: '1 day ago' },
    { id: 2, text: 'Room change request', sub: 'Anita Desai - Room 305', time: '3 days ago' }
  ];

  return (
    <div id="recent-activity">
      {items.map(item => (
        <div key={item.id} className="activity-item">
          <div className="activity-dot"></div>
          <div className="activity-info">
            <strong>{item.text}</strong>
            <span>{item.sub}</span>
          </div>
          <div className="activity-time">{item.time}</div>
        </div>
      ))}
    </div>
  );
}

function DashboardContent({ data }) {
  const { tenants, rooms, complaints, violations } = data;

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.occupancy === 'Occupied').length;
  const vacantRooms = rooms.filter(r => r.occupancy === 'Vacant').length;
  const activeComplaints = complaints.filter(c => c.status === 'open' || c.status === 'in_progress').length;
  const ruleViolations = violations.length;

  return (
    <section id="dashboard-section" className="section active">
      <div className="section-header">
        <h2>Warden Dashboard</h2>
        <p>Overview of PG operations and tenant management</p>
      </div>

      <div className="stats-grid">
        <StatCard icon="blue" color="blue" materialIcon="group" label="Total Tenants" value={tenants.length} sub="+0 this month" />
        <StatCard icon="green" color="green" materialIcon="home" label="Occupied Rooms" value={occupiedRooms} sub="of total rooms" />
        <StatCard icon="yellow" color="yellow" materialIcon="home" label="Vacant Rooms" value={vacantRooms} sub="Available" />
        <StatCard icon="red" color="red" materialIcon="schedule" label="Active Complaints" value={activeComplaints} sub="2 urgent" />
        <StatCard icon="orange" color="orange" materialIcon="warning" label="Rule Violations" value={ruleViolations} sub="2 this week" />
      </div>

      <div className="charts-row">
        <ComplaintsChart />
        <RoomStatusChart rooms={rooms} />
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => window.navigateTo && window.navigateTo('tenants')}>
            <span className="action-icon"><span className="material-icons-outlined" style={{ fontSize: '24px' }}>group</span></span>
            <div className="action-text">
              <strong>View Tenants</strong>
              <span>Manage tenant records</span>
            </div>
          </button>
          <button className="action-btn" onClick={() => window.navigateTo && window.navigateTo('violations')}>
            <span className="action-icon"><span className="material-icons-outlined" style={{ fontSize: '24px' }}>warning</span></span>
            <div className="action-text">
              <strong>Report Violation</strong>
              <span>Log rule violations</span>
            </div>
          </button>
          <button className="action-btn" onClick={() => window.navigateTo && window.navigateTo('rooms')}>
            <span className="action-icon"><span className="material-icons-outlined" style={{ fontSize: '24px' }}>check_circle</span></span>
            <div className="action-text">
              <strong>Update Room Status</strong>
              <span>Manage room services</span>
            </div>
          </button>
        </div>
      </div>

      <div className="bottom-row">
        <div className="bottom-card">
          <h3>Recent Complaints</h3>
          <RecentComplaints complaints={complaints} />
        </div>
        <div className="bottom-card">
          <h3>Recent Tenant Activity</h3>
          <RecentActivity />
        </div>
      </div>
    </section>
  );
}

function WardenApp() {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [appData, setAppData] = useState(getGlobalData());

  useEffect(() => {
    // 1. Intercept navigation
    const originalNavigateTo = window.navigateTo;
    if (originalNavigateTo && !originalNavigateTo.isReactIntercepted) {
      window.navigateTo = function(section) {
        setCurrentSection(section);
        if (section === 'dashboard') {
          window.currentSection = section;
          // React handles rendering, update nav classes in legacy just in case
          document.querySelectorAll('#legacy-dashboard-page .nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
          });
          // Update notification badge
          if (typeof window.updateNotifBadge === 'function') window.updateNotifBadge();
        } else {
          // Let vanilla JS handle other pages
          originalNavigateTo(section);
        }
      };
      window.navigateTo.isReactIntercepted = true;
    }

    // 2. Intercept renderDashboard to update data
    const originalRenderDashboard = window.renderDashboard;
    window.renderDashboard = () => {
      setAppData(getGlobalData());
      if (originalRenderDashboard) {
          // We don't need to call originalRenderDashboard because React re-renders it!
          // But if we did, it would try to update #stat-total-tenants etc.
          // Since our React components don't have those exact IDs (except where identical), it's safe to skip.
      }
    };

    // Initialize notification badge (this works perfectly because Header is already mounted)
    setTimeout(() => {
      if (typeof window.updateNotifBadge === 'function') window.updateNotifBadge();
      
      // Call updateNotifBadge globally when data changes
      const originalSaveToStorage = window.saveToStorage;
      if (originalSaveToStorage && !originalSaveToStorage.isReactIntercepted) {
          window.saveToStorage = function() {
              originalSaveToStorage();
              setAppData(getGlobalData());
          };
          window.saveToStorage.isReactIntercepted = true;
      }
    }, 100);

    return () => {
       if (originalNavigateTo) window.navigateTo = originalNavigateTo;
       if (originalRenderDashboard) window.renderDashboard = originalRenderDashboard;
    };
  }, []);

  return (
    <Fragment>
      <Sidebar currentSection={currentSection} />
      <div className="main-wrapper">
        <Header />
        <main className="content-area">
          {currentSection === 'dashboard' && <DashboardContent data={appData} />}
          <div id="main-content-target" style={{ display: currentSection === 'dashboard' ? 'none' : 'block' }}></div>
        </main>
      </div>
    </Fragment>
  );
}

const rootElement = document.getElementById('dashboard-page');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<WardenApp />);
}
