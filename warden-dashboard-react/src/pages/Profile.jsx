import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';

export default function Profile() {
  const [user, setUser] = useState({});
  const [toast, setToast] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [property, setProperty] = useState('');

  // Password Modal State
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdErrors, setPwdErrors] = useState({});

  useEffect(() => {
    // Load from pg_user or warden_user to maintain single source of truth
    const sessionUser = JSON.parse(sessionStorage.getItem('pg_user')) || 
                        JSON.parse(sessionStorage.getItem('warden_user')) || 
                        { name: 'Warden', email: 'warden@pgrentals.com', phone: '+91 00000 00000', property: 'Sunrise PG', role: 'warden', username: 'warden' };
    setUser(sessionUser);
    setName(sessionUser.name || '');
    setEmail(sessionUser.email || '');
    setPhone(sessionUser.phone || '');
    setProperty(sessionUser.property || 'Sunrise PG');
  }, []);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveProfile = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      showToast('error', 'Validation Error', 'Please fill all required fields');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('error', 'Invalid Email', 'Please enter a valid email address');
      return;
    }
    if (!/^\+?[\d\s\-]{9,}$/.test(phone)) {
      showToast('error', 'Invalid Phone', 'Please enter a valid phone number');
      return;
    }

    const updatedUser = { ...user, name, email, phone };
    setUser(updatedUser);
    
    // Update session storage
    if (sessionStorage.getItem('pg_user')) {
      sessionStorage.setItem('pg_user', JSON.stringify(updatedUser));
    }
    sessionStorage.setItem('warden_user', JSON.stringify(updatedUser));
    
    showToast('success', 'Profile Saved', 'Your profile has been updated');
    
    // Force a small delay then reload so the Header picks up the new name without a complex state manager
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleChangePassword = () => {
    const errors = {};
    let valid = true;

    // Validate current password
    // The user object might hold the password from login.js
    if (!currentPwd) {
      errors.current = 'Current password is required';
      valid = false;
    } else if (user.password && currentPwd !== user.password) {
      // If we know the user's password, validate it strictly. 
      // If not, we allow it (for dummy default users without passwords).
      errors.current = 'Incorrect current password';
      valid = false;
    }

    // Validate new password rules (min 8 chars as per login.js)
    if (!newPwd || newPwd.length < 8) {
      errors.new = 'Password must be at least 8 characters';
      valid = false;
    }

    // Confirm new password
    if (newPwd !== confirmPwd) {
      errors.confirm = 'Passwords do not match';
      valid = false;
    }

    if (!valid) {
      setPwdErrors(errors);
      return;
    }

    // Save logic based on login.js (localStorage override)
    const usernameKey = user.username || user.email;
    if (usernameKey) {
      localStorage.setItem(`${usernameKey}_password`, newPwd);
    }
    
    // Also update current session object so the user doesn't have to log out to change it again
    const updatedUser = { ...user, password: newPwd };
    setUser(updatedUser);
    if (sessionStorage.getItem('pg_user')) {
      sessionStorage.setItem('pg_user', JSON.stringify(updatedUser));
    }
    sessionStorage.setItem('warden_user', JSON.stringify(updatedUser));

    // Reset Modal
    setIsPwdModalOpen(false);
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    setPwdErrors({});
    
    showToast('success', 'Password Changed', 'Your password was updated successfully. Please use it for your next login.');
  };

  const openPwdModal = () => {
    setIsPwdModalOpen(true);
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    setPwdErrors({});
  };

  return (
    <section id="profile-section" className="section active">
      <div className="section-header">
        <h2>Profile</h2>
        <p>Manage your account information</p>
      </div>

      <div className="profile-layout">
        {/* Left Card */}
        <div className="profile-card">
          <div className="profile-avatar">{name ? name.charAt(0).toUpperCase() : 'W'}</div>
          <h3>{name}</h3>
          <p>{email}</p>
          <div className="profile-role-badge">Warden</div>
          <div className="profile-meta">
            <div className="profile-meta-row"><span>Property</span><span>{property}</span></div>
            <div className="profile-meta-row"><span>Joined</span><span>1/15/2024</span></div>
            <div className="profile-meta-row"><span>Status</span><span style={{ color: '#16a34a' }}>Active</span></div>
          </div>
        </div>

        {/* Right Form */}
        <div className="profile-form-card">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <div className="form-field">
              <label>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
            </div>
            <div className="form-field">
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            </div>
            <div className="form-field">
              <label>Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
            </div>
            <div className="form-field">
              <label>Property Assigned</label>
              <input type="text" value={property} readOnly placeholder="Property" />
            </div>
            <div className="form-field full">
              <label>Address</label>
              <input type="text" placeholder="123 Main Street, Mumbai" />
            </div>
          </div>
          <button className="btn-save" onClick={handleSaveProfile}>
            <span className="material-icons-outlined" style={{ fontSize: '24px' }}>save</span> Save Changes
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="security-card">
        <h3>Security</h3>
        <div className="security-row">
          <div className="sec-info">
            <strong>Password</strong>
            <span>Last changed 30 days ago</span>
          </div>
          <button className="btn-change-password" onClick={openPwdModal}>Change Password</button>
        </div>
        <div className="security-row">
          <div className="sec-info">
            <strong>Two-Factor Authentication</strong>
            <span>Add an extra layer of security</span>
          </div>
          <button className="btn-enable-2fa" onClick={() => showToast('info', 'Coming Soon', '2FA will be available soon')}>Enable</button>
        </div>
      </div>

      {/* Password Modal */}
      <Modal 
        isOpen={isPwdModalOpen} 
        title="Change Password"
        onCancel={() => setIsPwdModalOpen(false)}
        onConfirm={handleChangePassword}
        confirmText="Update Password"
      >
        <div className="form-group">
          <label>Current Password *</label>
          <div className="input-wrapper">
            <input 
              type="password" 
              placeholder="Enter current password" 
              value={currentPwd}
              onChange={(e) => { setCurrentPwd(e.target.value); setPwdErrors(prev => ({ ...prev, current: null })); }}
            />
          </div>
          {pwdErrors.current && <div className="error-msg show">{pwdErrors.current}</div>}
        </div>
        <div className="form-group">
          <label>New Password *</label>
          <div className="input-wrapper">
            <input 
              type="password" 
              placeholder="Minimum 8 characters" 
              value={newPwd}
              onChange={(e) => { setNewPwd(e.target.value); setPwdErrors(prev => ({ ...prev, new: null })); }}
            />
          </div>
          {pwdErrors.new && <div className="error-msg show">{pwdErrors.new}</div>}
        </div>
        <div className="form-group">
          <label>Confirm New Password *</label>
          <div className="input-wrapper">
            <input 
              type="password" 
              placeholder="Re-enter new password" 
              value={confirmPwd}
              onChange={(e) => { setConfirmPwd(e.target.value); setPwdErrors(prev => ({ ...prev, confirm: null })); }}
            />
          </div>
          {pwdErrors.confirm && <div className="error-msg show">{pwdErrors.confirm}</div>}
        </div>
      </Modal>

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
