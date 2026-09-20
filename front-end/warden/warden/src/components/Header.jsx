import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWardenData } from '../utils/dataStore';

export default function Header() {
  const navigate = useNavigate();
  
  // TODO: connect to dataStore in Phase 2
  const wardenUser = JSON.parse(sessionStorage.getItem('warden_user')) || {
    name: 'Warden',
    email: 'warden@pgrentals.com'
  };

  const handleLogout = () => {
    sessionStorage.removeItem('warden_user');
    sessionStorage.removeItem('pg_user'); // Required for central login architecture
    window.location.href = '../../login/login/login.html';
  };

  const { data } = useWardenData();
  const unreadCount = data.notifications.filter(n => !n.read).length;

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h4>Welcome back, {wardenUser.name.split(' ')[0]}</h4>
        <p>{wardenUser.email}</p>
      </div>
      <div className="navbar-right">
        <div className="nav-icon-btn" onClick={() => navigate('/notifications')}>
          <span className="material-icons-outlined" style={{ fontSize: '24px' }}>notifications</span>
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </div>
        <div className="nav-icon-btn" onClick={() => navigate('/profile')}>
          <span className="material-icons-outlined" style={{ fontSize: '24px' }}>person</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>↪ Logout</button>
      </div>
    </header>
  );
}
