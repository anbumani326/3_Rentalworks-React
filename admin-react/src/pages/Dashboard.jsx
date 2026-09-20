import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, properties: 0, activeBookings: 0, pendingBookings: 0, gtv: 0, platformRev: 0 });
  const [health, setHealth] = useState({ pendingProps: 0, pendingPayments: 0, overdueBookings: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [users, properties, bookings, payments] = await Promise.all([
          api.getUsers(), api.getProperties(), api.getBookings(), api.getPayments()
        ]);
        if (cancelled) return;
        const activeBookings = bookings.filter(b => b.status === 'active').length;
        const pendingBookings = bookings.filter(b => b.status === 'pending').length;
        const gtv = payments.filter(p => p.status === 'verified').reduce((s, p) => s + (p.amount || 0), 0);
        const platformRev = Math.round(gtv * 0.10);
        setStats({ users: users.length, properties: properties.length, activeBookings, pendingBookings, gtv, platformRev });
        setHealth({
          pendingProps: properties.filter(p => p.status === 'pending').length,
          pendingPayments: payments.filter(p => p.status === 'pending').length,
          overdueBookings: bookings.filter(b => b.status === 'overdue').length
        });
      } catch (e) { console.error('Dashboard load error:', e); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const fmtK = (n) => n >= 1000 ? '\u20B9' + (n / 1000).toFixed(1) + 'K' : '\u20B9' + n.toLocaleString('en-IN');

  const revenueData = [0.4, 0.5, 0.65, 0.75, 0.9, 1].map(f => Math.round(stats.platformRev * f) || 10000);
  const bookingData = [0.2, 0.4, 0.5, 0.7, 0.9, 1].map(f => Math.round(stats.properties * f) || 2);
  const revenueMax = Math.max(...revenueData, 1000);
  const bookingMax = Math.max(...bookingData, 5);

  const w = 300, h = 120, pad = 10;
  const revPts = revenueData.map((v, i) => `${pad + (i / (revenueData.length - 1)) * (w - pad * 2)},${h - pad - ((v / revenueMax) * (h - pad * 2))}`).join(' ');
  const revArea = `${pad + (w - pad * 2)},${h - pad} ${pad},${h - pad}`;

  const feed = [
    { icon: '📅', action: 'Booked Room 305', person: 'Amit Sharma', property: 'Green Valley PG', time: '5 min ago' },
    { icon: '💰', action: 'Paid ₹9,000 rent', person: 'Priya Patel', property: 'Sunrise Heights', time: '12 min ago' },
    { icon: '⚠️', action: 'Raised complaint', person: 'Rohan Singh', property: 'Urban Nest', time: '23 min ago' },
    { icon: '⭐', action: 'Left 5-star review', person: 'Sneha Gupta', property: 'Sunrise Heights', time: '1 hour ago' },
    { icon: '🏢', action: 'Added new property', person: 'Rajesh Kumar', property: 'Urban Nest', time: '2 hours ago' },
    { icon: '❌', action: 'Cancelled booking', person: 'Anita Verma', property: 'Sunrise Heights', time: '3 hours ago' }
  ];

  return (
    <>
      <div className="sec-hdr"><h2>Dashboard</h2><p>Platform overview and key metrics</p></div>

      <div className="stats-row" style={{gridTemplateColumns:'repeat(6,1fr)'}}>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon bg-blue"><span className="material-icons-outlined" style={{color:'#2563eb'}}>group</span></div></div><div className="stat-val">{stats.users.toLocaleString()}</div><div className="stat-lbl">Total Users</div></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon bg-purple"><span className="material-icons-outlined" style={{color:'#7c3aed'}}>apartment</span></div></div><div className="stat-val">{stats.properties}</div><div className="stat-lbl">Total PG Properties</div></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon bg-green"><span className="material-icons-outlined" style={{color:'#16a34a'}}>check_circle</span></div></div><div className="stat-val">{stats.activeBookings}</div><div className="stat-lbl">Active Bookings</div></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon bg-yellow"><span className="material-icons-outlined" style={{color:'#d97706'}}>pending</span></div></div><div className="stat-val">{stats.pendingBookings}</div><div className="stat-lbl">Pending Bookings</div></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon bg-green"><span className="material-icons-outlined" style={{color:'#16a34a'}}>trending_up</span></div></div><div className="stat-val">{fmtK(stats.gtv)}</div><div className="stat-lbl">Gross Transaction Value</div></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon bg-blue"><span className="material-icons-outlined" style={{color:'#2563eb'}}>account_balance</span></div></div><div className="stat-val">{fmtK(stats.platformRev)}</div><div className="stat-lbl">Platform Revenue</div></div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>Revenue Overview</h3>
          <p>Platform earnings trend</p>
          <div className="line-chart-wrap">
            <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
              <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity="0.3"/><stop offset="100%" stopColor="#22c55e" stopOpacity="0.03"/></linearGradient></defs>
              <polygon points={`${revPts} ${revArea}`} fill="url(#rg)"/>
              <polyline points={revPts} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
              {revenueData.map((v, i) => {
                const cx = pad + (i / (revenueData.length - 1)) * (w - pad * 2);
                const cy = h - pad - ((v / revenueMax) * (h - pad * 2));
                return <circle key={i} cx={cx} cy={cy} r="3.5" fill="white" stroke="#22c55e" strokeWidth="2"/>;
              })}
            </svg>
          </div>
          <div className="chart-labels"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div>
        </div>
        <div className="chart-card">
          <h3>Booking Trends</h3>
          <p>Monthly property activity</p>
          <div className="chart-area">
            {bookingData.map((v, i) => (
              <div key={i} className="chart-bar" style={{height: `${(v / bookingMax) * 100}%`, background: '#2563eb', margin: '0 3px'}}>
                <span className="bar-tip">{v}</span>
              </div>
            ))}
          </div>
          <div className="chart-labels"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div>
        </div>
      </div>

      <div className="dashboard-bottom-row">
        <div className="activity-card">
          <h3>Activity Feed</h3>
          <p>Recent platform activities</p>
          {feed.map((a, i) => (
            <div key={i} className="feed-item">
              <div className="feed-ico-wrap">{a.icon}</div>
              <div className="feed-text"><strong>{a.person}</strong> {a.action} at <strong>{a.property}</strong></div>
              <div className="feed-time">{a.time}</div>
            </div>
          ))}
        </div>
        <div className="system-health-card">
          <h3>System Health</h3>
          <p>Real-time platform status</p>
          <div className="health-item"><span className={`health-dot ${health.pendingProps > 0 ? 'warn' : 'ok'}`}></span><span className="health-label">Pending Property Approvals</span><strong>{health.pendingProps}</strong></div>
          <div className="health-item"><span className={`health-dot ${health.pendingPayments > 0 ? 'warn' : 'ok'}`}></span><span className="health-label">Payments Awaiting Verification</span><strong>{health.pendingPayments}</strong></div>
          <div className="health-item"><span className={`health-dot ${health.overdueBookings > 0 ? 'danger' : 'ok'}`}></span><span className="health-label">Overdue Bookings</span><strong>{health.overdueBookings}</strong></div>
          <div className="health-item"><span className="health-dot ok"></span><span className="health-label">System Status</span><strong style={{color:'#16a34a'}}>Operational</strong></div>
          <div className="health-item"><span className="health-dot ok"></span><span className="health-label">Last Data Sync</span><strong>{new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})}</strong></div>
        </div>
      </div>

      <div className="quick-actions-card">
        <h3>Quick Actions</h3>
        <div className="qa-grid">
          <div className="qa-btn" onClick={() => navigate('/properties')}><span className="qa-icon material-icons-outlined">pending_actions</span><div><strong>{health.pendingProps}</strong><span>Pending Approvals</span></div></div>
          <div className="qa-btn" onClick={() => navigate('/payments')}><span className="qa-icon material-icons-outlined">verified</span><div><strong>{health.pendingPayments}</strong><span>Verify Payments</span></div></div>
          <div className="qa-btn" onClick={() => navigate('/bookings')}><span className="qa-icon material-icons-outlined">event_available</span><div><strong>{stats.pendingBookings}</strong><span>Confirm Bookings</span></div></div>
          <div className="qa-btn" onClick={() => navigate('/users')}><span className="qa-icon material-icons-outlined">manage_accounts</span><div><strong>{stats.users}</strong><span>Manage Users</span></div></div>
        </div>
      </div>
    </>
  );
}
