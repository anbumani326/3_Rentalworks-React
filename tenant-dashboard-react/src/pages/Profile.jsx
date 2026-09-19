import React, { useState } from 'react';

const Profile = () => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFA, setTwoFA] = useState(false);

  if (isChangingPassword) {
    return (
      <div style={{maxWidth: '500px', margin: '0 auto'}}>
        <button className="btn btn-ghost btn-sm mb-16" onClick={() => setIsChangingPassword(false)} style={{marginBottom: '16px'}}>← Back to Profile</button>
        <div className="card">
          <div className="card-body">
            <div className="card-title">Change Password</div>
            <div className="mt-14" style={{marginTop: '14px'}}>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" placeholder="Enter current password" />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" placeholder="Enter new password (min 6 chars)" />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" placeholder="Type new password again" />
              </div>
              <div style={{marginTop: '20px'}}>
                <button className="btn btn-primary btn-full" onClick={() => {alert('Password Updated'); setIsChangingPassword(false);}}>Update Password</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account information</p>
      </div>
      
      <div className="grid-2">
        <div className="profile-card">
          <div className="profile-avatar">R</div>
          <div className="profile-name">Rahul Sharma</div>
          <div className="profile-email">rahul.sharma@email.com</div>
          <span className="profile-badge">Tenant</span>
          <div className="profile-stats">
            <div className="profile-stat"><div className="profile-stat-label">Room Number</div><div className="profile-stat-value">A-204</div></div>
            <div className="profile-stat"><div className="profile-stat-label">Property</div><div className="profile-stat-value">Sunrise PG</div></div>
          </div>
        </div>
        
        <div>
          <div className="card mb-16" style={{marginBottom: '16px'}}>
            <div className="card-body">
              <div className="card-title">Personal Information</div>
              <div className="mt-14" style={{marginTop: '14px'}}>
                <div className="form-group"><label>Full Name</label><input type="text" defaultValue="Rahul Sharma" /></div>
                <div className="form-group"><label>Email Address</label><input type="email" defaultValue="rahul.sharma@email.com" readOnly style={{background: 'var(--bg-main)'}} /></div>
                <div className="form-group"><label>Phone Number</label><input type="tel" defaultValue="+91 98765 43210" /></div>
                <div className="form-group"><label>Property Assigned</label><input type="text" defaultValue="Sunrise PG Residency" readOnly style={{background: 'var(--bg-main)'}} /></div>
                <div className="form-group"><label>Address</label><textarea defaultValue="A-204, Sunrise PG Residency, Andheri West, Mumbai" style={{minHeight: '70px'}}></textarea></div>
                <button className="btn btn-primary" onClick={() => alert('Profile Saved')}><span className="material-icons-outlined" style={{fontSize: '24px'}}>save</span> Save Changes</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="card-title">Security</div>
              <div className="mt-14" style={{marginTop: '14px'}}>
                <div className="security-item">
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <div className="security-icon" style={{background: 'var(--primary-bg)'}}><span className="material-icons-outlined" style={{fontSize: '24px'}}>vpn_key</span></div>
                    <div className="security-info">
                      <div className="security-title">Password</div>
                      <div className="security-sub">Last changed 30 days ago</div>
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => setIsChangingPassword(true)}>Change Password</button>
                </div>
                <div className="security-item">
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <div className="security-icon" style={{background: '#f0fdf4'}}><span className="material-icons-outlined" style={{fontSize: '24px'}}>lock</span></div>
                    <div className="security-info">
                      <div className="security-title">Two-Factor Authentication</div>
                      <div className="security-sub">Add an extra layer of security</div>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => setTwoFA(!twoFA)}>{twoFA ? 'Disable' : 'Enable'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
