import React, { useState } from 'react';
import { useWardenData } from '../utils/dataStore';
import Modal from '../components/Modal';

export default function RuleViolations() {
  const { data, updateData } = useWardenData();
  const [filter, setFilter] = useState('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const violations = data.violations || [];
  const tenants = data.tenants || [];
  const notifications = data.notifications || [];

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 3500);
  };

  const filteredViolations = filter === 'all' 
    ? violations 
    : violations.filter(v => v.severity === filter);

  const total = violations.length;
  const high = violations.filter(v => v.severity === 'high').length;
  const medium = violations.filter(v => v.severity === 'medium').length;
  const low = violations.filter(v => v.severity === 'low').length;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const openAddViolationModal = () => {
    setFormData({ severity: 'low' });
    setErrors({});
    setIsAddModalOpen(true);
  };

  const handleAddViolation = () => {
    let valid = true;
    const newErrors = {};

    if (!formData.tenantVal) {
      newErrors.tenantVal = 'Select a tenant';
      valid = false;
    }
    const type = (formData.type || '').trim();
    if (!type) {
      newErrors.type = 'Violation type is required';
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      return;
    }

    const [tenantName, room] = formData.tenantVal.split('|');

    const newViolation = {
      id: Date.now(),
      tenant: tenantName,
      room: room,
      type: type,
      severity: formData.severity || 'low',
      warnings: 1,
      date: new Date().toLocaleDateString()
    };

    updateData('violations', [newViolation, ...violations]);
    setIsAddModalOpen(false);
    showToast('success', 'Violation Added', `Added ${type} for ${tenantName}`);
  };

  const issueWarning = (id) => {
    const updatedViolations = violations.map(v => {
      if (String(v.id) === String(id)) {
        return { ...v, warnings: (v.warnings || 0) + 1 };
      }
      return v;
    });

    const v = violations.find(v => String(v.id) === String(id));
    if (v) {
      updateData('violations', updatedViolations);
      showToast('warning', 'Warning Issued', `Warning issued to ${v.tenant} for ${v.type}`);
    }
  };

  const escalateViolation = (id) => {
    const v = violations.find(v => String(v.id) === String(id));
    if (!v) return;

    showToast('warning', 'Escalated to Owner', `Violation by ${v.tenant} has been sent to the Property Owner.`);

    const newNotif = {
      id: Date.now(),
      title: 'Violation Escalated',
      message: `${v.tenant} (Room ${v.room}) details sent to owner.`,
      time: 'Just now',
      read: false,
      icon: 'warning'
    };

    updateData('notifications', [newNotif, ...notifications]);
  };

  const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1);

  return (
    <section id="violations-section" className="section active">
      <div className="section-header">
        <h2>Rule Violations Monitoring</h2>
        <p>Track and manage tenant rule violations</p>
      </div>

      <div className="violation-stats">
        <div className="stat-card">
          <div className="stat-icon orange"><span className="material-icons-outlined" style={{ fontSize: '32px' }}>warning</span></div>
          <div className="stat-label">Total Violations</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><span className="material-icons-outlined" style={{ fontSize: '32px' }}>warning</span></div>
          <div className="stat-label">High Severity</div>
          <div className="stat-value">{high}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><span className="material-icons-outlined" style={{ fontSize: '32px' }}>warning</span></div>
          <div className="stat-label">Medium Severity</div>
          <div className="stat-value">{medium}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><span className="material-icons-outlined" style={{ fontSize: '32px' }}>warning</span></div>
          <div className="stat-label">Low Severity</div>
          <div className="stat-value">{low}</div>
        </div>
      </div>

      <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <label>Filter by Severity:</label>
          <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Severity</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button className="btn-save" onClick={openAddViolationModal}>+ Add Violation</button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tenant Name</th>
              <th>Room Number</th>
              <th>Violation Type</th>
              <th>Severity</th>
              <th>Warning Count</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredViolations.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', color: '#6b7280', padding: '24px' }}>No violations found</td></tr>
            ) : (
              filteredViolations.map(v => (
                <tr key={v.id}>
                  <td>{v.tenant}</td>
                  <td><span className="room-badge">{v.room}</span></td>
                  <td>{v.type}</td>
                  <td><span className={`badge badge-${v.severity}`}>⚠️ {capitalize(v.severity)}</span></td>
                  <td>
                    <span className="badge-warnings badge" style={{ background: '#fef9c3', color: '#b45309' }}>
                      {v.warnings} warning{v.warnings > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td>{v.date}</td>
                  <td>
                    <div className="action-icons">
                      <button className="btn-issue-warning" onClick={() => issueWarning(v.id)}>Issue Warning</button>
                      <button className="btn-escalate" onClick={() => escalateViolation(v.id)}>↑ Escalate</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="violation-policy">
        <div className="policy-header"><span className="material-icons-outlined" style={{ fontSize: '24px' }}>warning</span> Violation Policy</div>
        <ul>
          <li>1st Warning: Verbal warning and notification</li>
          <li>2nd Warning: Written warning sent to tenant</li>
          <li>3rd Warning: Escalated to property owner for action</li>
          <li>Severe violations may result in immediate escalation</li>
        </ul>
      </div>

      {/* Add Violation Modal */}
      <Modal
        isOpen={isAddModalOpen}
        title="Add Rule Violation"
        onCancel={() => setIsAddModalOpen(false)}
        onConfirm={handleAddViolation}
      >
        <div className="form-group">
          <label>Tenant *</label>
          <select 
            className="filter-select" 
            style={{ width: '100%', boxSizing: 'border-box' }}
            value={formData.tenantVal || ''}
            onChange={(e) => handleInputChange('tenantVal', e.target.value)}
          >
            <option value="" disabled>Select a tenant</option>
            {tenants.map(t => (
              <option key={t.id} value={`${t.name}|${t.room}`}>{t.name} (Room {t.room})</option>
            ))}
            {tenants.length === 0 && <option disabled>No tenants available</option>}
          </select>
          {errors.tenantVal && <div className="error-msg show">{errors.tenantVal}</div>}
        </div>
        <div className="form-group">
          <label>Violation Type *</label>
          <div className="input-wrapper">
            <input 
              type="text" 
              placeholder="e.g. Late Night Entry, Noise Complaint" 
              value={formData.type || ''}
              onChange={(e) => handleInputChange('type', e.target.value)}
            />
          </div>
          {errors.type && <div className="error-msg show">{errors.type}</div>}
        </div>
        <div className="form-group">
          <label>Severity *</label>
          <select 
            className="filter-select" 
            style={{ width: '100%', boxSizing: 'border-box' }}
            value={formData.severity || 'low'}
            onChange={(e) => handleInputChange('severity', e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
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
