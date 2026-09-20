import React, { useState } from 'react';
import { useWardenData } from '../utils/dataStore';

export default function Notifications() {
  const { data, updateData } = useWardenData();
  const [toast, setToast] = useState(null);

  const notifications = data.notifications || [];

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 3500);
  };

  const total = notifications.length;
  const unread = notifications.filter(n => !n.read).length;
  const read = notifications.filter(n => n.read).length;

  const triggerStorageEvent = (key) => {
    const event = new Event('storage');
    event.key = key;
    window.dispatchEvent(event);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    updateData('notifications', updated);
    triggerStorageEvent('warden_notifications');
    showToast('success', 'All Read', 'All notifications marked as read');
  };

  const handleMarkAsRead = (id) => {
    const updated = notifications.map(n => 
      String(n.id) === String(id) ? { ...n, read: true } : n
    );
    updateData('notifications', updated);
    triggerStorageEvent('warden_notifications');
  };

  const handleDelete = (id) => {
    const updated = notifications.filter(n => String(n.id) !== String(id));
    updateData('notifications', updated);
    triggerStorageEvent('warden_notifications');
  };

  return (
    <section id="notifications-section" className="section active">
      <div className="section-header">
        <h2>Notifications</h2>
        <p>You have <span>{unread}</span> unread notifications</p>
      </div>

      <div className="notif-summary">
        <div className="summary-card">
          <div className="s-label">Total</div>
          <div className="s-value">{total}</div>
        </div>
        <div className="summary-card">
          <div className="s-label">Unread</div>
          <div className="s-value" style={{ color: '#f5a623' }}>{unread}</div>
        </div>
        <div className="summary-card">
          <div className="s-label">Read</div>
          <div className="s-value green">{read}</div>
        </div>
      </div>

      <div className="notif-list">
        <div className="notif-list-header">
          <h3>All Notifications</h3>
          <button className="btn-mark-all" onClick={handleMarkAllAsRead}>
            <span className="material-icons-outlined" style={{ fontSize: '24px' }}>check_circle</span> 
            Mark all as read
          </button>
        </div>
        <div id="notifications-list">
          {notifications.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '32px', fontSize: '13px' }}>
              No notifications yet
            </p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`}>
                <div className={`notif-icon-wrap ${n.icon}`}>
                  {n.icon === 'warning' ? '⚠️' : n.icon === 'check' ? '✅' : 'ℹ️'}
                </div>
                <div className="notif-content">
                  <strong>{n.title}</strong>
                  <p>{n.message}</p>
                  <time>{n.time}</time>
                </div>
                <div className="notif-actions">
                  {!n.read && (
                    <>
                      <div className="unread-dot" title="Unread"></div>
                      <span 
                        className="mark-read-notif" 
                        onClick={() => handleMarkAsRead(n.id)} 
                        title="Mark as Read"
                        style={{ cursor: 'pointer', fontSize: '12px', color: '#4f46e5', marginRight: '10px', textDecoration: 'underline' }}
                      >
                        Mark Read
                      </span>
                    </>
                  )}
                  <span 
                    className="delete-notif" 
                    onClick={() => handleDelete(n.id)} 
                    title="Delete"
                    style={{ cursor: 'pointer' }}
                  >
                    🗑️
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type} show`}>
          <span className="toast-icon">
            <span className="material-icons-outlined" style={{ fontSize: '24px' }}>
              {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'cancel' : 'info'}
            </span>
          </span>
          <div className="toast-text">
            <strong>{toast.title}</strong>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </section>
  );
}
