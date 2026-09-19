import React, { useState } from 'react';

const Notifications = () => {
  const [unreadCount, setUnreadCount] = useState(2);
  const [total, setTotal] = useState(2);

  const markAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with all your activities</p>
        </div>
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          {unreadCount > 0 && <span className="badge badge-info">{unreadCount} Unread</span>}
          <button className="btn btn-outline btn-sm" onClick={markAllRead}>Mark All as Read</button>
        </div>
      </div>
      
      <div className="stats-grid mb-20" style={{marginBottom: '20px'}}>
        <div className="stat-card">
          <div className="stat-label">Total <span className="stat-icon"><span className="material-icons-outlined" style={{fontSize: '32px'}}>notifications</span></span></div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unread <span className="stat-icon"><span className="material-icons-outlined" style={{fontSize: '32px'}}>notifications</span></span></div>
          <div className="stat-value" style={{color: 'var(--primary)'}}>{unreadCount}</div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-body">
          <div className="card-title">All Notifications</div>
          <div className="mt-14" style={{marginTop: '14px', color: 'var(--text-muted)'}}>
            {/* Dynamic notifications will be listed here */}
            No new notifications.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
