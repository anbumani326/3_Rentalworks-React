import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Animate bars
    const bars = document.querySelectorAll('.bar');
    bars.forEach(bar => {
      setTimeout(() => {
        bar.style.height = bar.dataset.height + 'px';
      }, 100);
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your stay and activities</p>
      </div>

      <div className="stay-banner">
        <h3><span className="material-icons-outlined" style={{fontSize: '24px'}}>home</span> Your Stay Information</h3>
        <div className="stay-grid">
          <div className="stay-item"><div className="stay-label">Property Name</div><div className="stay-value">Sunrise PG Residency</div></div>
          <div className="stay-item"><div className="stay-label">Room Number</div><div className="stay-value">A-204</div></div>
          <div className="stay-item"><div className="stay-label">Check-in Date</div><div className="stay-value">Jan 15, 2026</div></div>
          <div className="stay-item"><div className="stay-label">Check-out Date</div><div className="stay-value">Jul 14, 2026</div></div>
          <div className="stay-item"><div className="stay-label">Rent Due Date</div><div className="stay-value">Mar 10, 2026</div></div>
          <div className="stay-item"><div className="stay-label">Monthly Rent</div><div className="stay-value">₹12,000</div></div>
          <div className="stay-item"><div className="stay-label">Booking Status</div><div className="stay-value"><span className="badge-active">Active</span></div></div>
          <div className="stay-item">
            <div className="stay-label">Utilities</div>
            <div className="utility-icons">
              <span className="utility-icon"><span className="material-icons-outlined" style={{fontSize: '24px'}}>bolt</span></span>
              <span className="utility-icon">💧</span>
              <span className="utility-icon"><span className="material-icons-outlined" style={{fontSize: '24px'}}>wifi</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Active Complaints <span className="stat-icon"><span className="material-icons-outlined" style={{fontSize: '32px'}}>error</span></span></div><div className="stat-value">0</div><div className="stat-sub">Needs attention</div></div>
        <div className="stat-card"><div className="stat-label">Pending Services <span className="stat-icon"><span className="material-icons-outlined" style={{fontSize: '32px'}}>schedule</span></span></div><div className="stat-value">0</div><div className="stat-sub">In progress</div></div>
        <div className="stat-card"><div className="stat-label">Payment Due <span className="stat-icon">₹</span></div><div className="stat-value" style={{color: 'var(--primary)'}}>₹12,000</div><div className="stat-sub" style={{color: 'var(--danger)'}}>Due in 6 days</div></div>
        <div className="stat-card"><div className="stat-label">Days Remaining <span className="stat-icon"><span className="material-icons-outlined" style={{fontSize: '32px'}}>calendar_today</span></span></div><div className="stat-value">126</div><div className="stat-sub">Until check-out</div></div>
      </div>

      <div className="grid-2 mb-20" style={{ marginBottom: '20px' }}>
        <div className="card">
          <div className="card-body">
            <div className="card-title">Payment History</div>
            <div className="bar-chart mt-14" style={{ marginTop: '14px' }}>
              <div className="bar-wrapper"><div className="bar" data-height="110" style={{height: 0}}></div><div className="bar-label">Oct</div></div>
              <div className="bar-wrapper"><div className="bar" data-height="115" style={{height: 0}}></div><div className="bar-label">Nov</div></div>
              <div className="bar-wrapper"><div className="bar" data-height="120" style={{height: 0}}></div><div className="bar-label">Dec</div></div>
              <div className="bar-wrapper"><div className="bar" data-height="118" style={{height: 0}}></div><div className="bar-label">Jan</div></div>
              <div className="bar-wrapper"><div className="bar" data-height="122" style={{height: 0}}></div><div className="bar-label">Feb</div></div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="card-title">Expense Breakdown</div>
            <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginTop: '14px'}}>
              <div className="pie-chart"><div className="pie-center"></div></div>
              <div className="pie-legend">
                <div className="pie-legend-item"><span className="pie-dot" style={{background: 'var(--primary)'}}></span> Rent 75%</div>
                <div className="pie-legend-item"><span className="pie-dot" style={{background: '#f59e0b'}}></span> Services 9%</div>
                <div className="pie-legend-item"><span className="pie-dot" style={{background: '#3b82f6'}}></span> Utilities 16%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="payment-reminder">
        <div className="reminder-icon"><span className="material-icons-outlined" style={{fontSize: '24px'}}>schedule</span></div>
        <div className="reminder-text">Your monthly rent payment of <strong>₹12,000</strong> is due on <strong>Mar 10, 2026</strong>. Please make the payment before the due date to avoid penalties.</div>
        <div className="reminder-actions">
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/payments')}>Pay Rent Now</button>
          <button className="btn btn-outline btn-sm" onClick={() => alert('Reminder set for Mar 9, 2026')}>Set Reminder</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
