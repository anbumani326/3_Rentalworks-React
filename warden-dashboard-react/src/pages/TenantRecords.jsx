import React, { useState } from 'react';
import { useWardenData } from '../utils/dataStore';
import Modal from '../components/Modal';

export default function TenantRecords() {
  const { data, updateData } = useWardenData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'add', 'view', 'edit', 'delete'
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  // Toast state (simple local implementation)
  const [toast, setToast] = useState(null);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 3500);
  };

  const tenants = data.tenants || [];
  
  const filteredTenants = tenants.filter(t => {
    const matchSearch = !search || 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.room.includes(search) || 
      t.phone.includes(search);
    const matchStatus = statusFilter === 'all' || t.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const paid = tenants.filter(t => t.paymentStatus === 'paid').length;
  const pending = tenants.filter(t => t.paymentStatus === 'pending').length;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleAdd = () => {
    let valid = true;
    const newErrors = {};
    if (!formData.name) { newErrors.name = 'Name is required'; valid = false; }
    if (!formData.room) { newErrors.room = 'Room number is required'; valid = false; }
    if (!formData.phone || !/^\+?[\d\s\-]{9,}$/.test(formData.phone)) { newErrors.phone = 'Enter a valid phone number'; valid = false; }
    if (!formData.checkIn) { newErrors.checkIn = 'Check-in date is required'; valid = false; }
    if (!formData.rent || isNaN(formData.rent) || formData.rent <= 0) { newErrors.rent = 'Enter a valid rent amount'; valid = false; }
    
    if (!valid) {
      setErrors(newErrors);
      return;
    }

    const newId = tenants.length > 0 ? Math.max(...tenants.map(t => t.id)) + 1 : 1;
    const newTenant = {
      id: newId,
      name: formData.name.trim(),
      room: formData.room.trim(),
      phone: formData.phone.trim(),
      checkIn: formData.checkIn,
      rent: parseInt(formData.rent),
      paymentStatus: formData.paymentStatus || 'pending'
    };

    updateData('tenants', [...tenants, newTenant]);
    setActiveModal(null);
    showToast('success', 'Tenant Added', `${newTenant.name} has been added successfully`);
  };

  const handleEdit = () => {
    let valid = true;
    const newErrors = {};
    if (!formData.room) { newErrors.room = 'Room number is required'; valid = false; }
    if (!formData.phone || !/^\+?[\d\s\-]{9,}$/.test(formData.phone)) { newErrors.phone = 'Enter a valid phone number'; valid = false; }
    if (!formData.rent || isNaN(formData.rent) || formData.rent <= 0) { newErrors.rent = 'Enter a valid rent amount'; valid = false; }
    
    if (!valid) {
      setErrors(newErrors);
      return;
    }

    const updatedTenants = tenants.map(t => {
      if (t.id === selectedTenant.id) {
        return {
          ...t,
          room: formData.room.trim(),
          phone: formData.phone.trim(),
          rent: parseInt(formData.rent),
          paymentStatus: formData.paymentStatus
        };
      }
      return t;
    });

    updateData('tenants', updatedTenants);
    setActiveModal(null);
    showToast('success', 'Tenant Updated', 'Changes saved successfully');
  };

  const handleDelete = () => {
    const updatedTenants = tenants.filter(t => t.id !== selectedTenant.id);
    updateData('tenants', updatedTenants);
    setActiveModal(null);
    showToast('success', 'Tenant Removed', `${selectedTenant.name} has been removed`);
  };

  const openModal = (type, tenant = null) => {
    setSelectedTenant(tenant);
    setErrors({});
    if (type === 'add') {
      setFormData({ paymentStatus: 'pending' });
    } else if (tenant) {
      setFormData({ ...tenant });
    }
    setActiveModal(type);
  };

  return (
    <section id="tenants-section" className="section active">
      <div className="section-header">
        <h2>Tenant Records</h2>
        <p>View and manage all tenant information</p>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="s-label">Total Tenants</div>
          <div className="s-value" id="tenant-total">{tenants.length}</div>
        </div>
        <div className="summary-card">
          <div className="s-label">Payment Received</div>
          <div className="s-value green" id="tenant-paid">{paid}</div>
        </div>
        <div className="summary-card">
          <div className="s-label">Payment Pending</div>
          <div className="s-value red" id="tenant-pending">{pending}</div>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-header">
          <div className="search-box">
            <span className="search-icon">
              <span className="material-icons-outlined" style={{ fontSize: '20px' }}>search</span>
            </span>
            <input 
              type="text" 
              placeholder="Search by name, room, or contact..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select 
              className="filter-select" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <button 
              className="btn-login" 
              style={{ width: 'auto', padding: '6px 16px', margin: 0, background: 'var(--primary)' }} 
              onClick={() => openModal('add')}
            >
              + Add Tenant
            </button>
          </div>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Tenant Name</th>
              <th>Room Number</th>
              <th>Contact Number</th>
              <th>Check-in Date</th>
              <th>Rent</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', color: '#6b7280', padding: '24px' }}>No tenants found</td></tr>
            ) : (
              filteredTenants.map(t => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td><span className="room-badge">{t.room}</span></td>
                  <td>{t.phone}</td>
                  <td>{t.checkIn}</td>
                  <td>₹{t.rent.toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${t.paymentStatus}`}>
                      {t.paymentStatus === 'paid' ? '✓ Paid' : '✗ Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="action-icons">
                      <button className="icon-btn" onClick={() => openModal('view', t)} title="View">👁️</button>
                      <button className="icon-btn" onClick={() => openModal('edit', t)} title="Edit">✏️</button>
                      <button className="icon-btn" onClick={() => openModal('delete', t)} title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <Modal 
        isOpen={activeModal === 'add'} 
        title="Add New Tenant"
        onCancel={() => setActiveModal(null)}
        onConfirm={handleAdd}
      >
        <div className="form-group">
          <label>Full Name *</label>
          <div className="input-wrapper">
            <input type="text" placeholder="e.g. Rahul Kumar" value={formData.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} />
          </div>
          {errors.name && <div className="error-msg show">{errors.name}</div>}
        </div>
        <div className="form-group">
          <label>Room Number *</label>
          <div className="input-wrapper">
            <input type="text" placeholder="e.g. 204" value={formData.room || ''} onChange={(e) => handleInputChange('room', e.target.value)} />
          </div>
          {errors.room && <div className="error-msg show">{errors.room}</div>}
        </div>
        <div className="form-group">
          <label>Phone Number *</label>
          <div className="input-wrapper">
            <input type="text" placeholder="+91 98765 43210" value={formData.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} />
          </div>
          {errors.phone && <div className="error-msg show">{errors.phone}</div>}
        </div>
        <div className="form-group">
          <label>Check-In Date *</label>
          <div className="input-wrapper">
            <input type="date" value={formData.checkIn || ''} onChange={(e) => handleInputChange('checkIn', e.target.value)} />
          </div>
          {errors.checkIn && <div className="error-msg show">{errors.checkIn}</div>}
        </div>
        <div className="form-group">
          <label>Monthly Rent (₹) *</label>
          <div className="input-wrapper">
            <input type="number" placeholder="e.g. 8000" min="0" value={formData.rent || ''} onChange={(e) => handleInputChange('rent', e.target.value)} />
          </div>
          {errors.rent && <div className="error-msg show">{errors.rent}</div>}
        </div>
        <div className="form-group">
          <label>Payment Status</label>
          <select className="filter-select" style={{ width: '100%' }} value={formData.paymentStatus || 'pending'} onChange={(e) => handleInputChange('paymentStatus', e.target.value)}>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={activeModal === 'edit'} 
        title="Edit Tenant"
        onCancel={() => setActiveModal(null)}
        onConfirm={handleEdit}
      >
        <div className="form-group">
          <label>Room Number *</label>
          <div className="input-wrapper">
            <input type="text" placeholder="Room No" value={formData.room || ''} onChange={(e) => handleInputChange('room', e.target.value)} />
          </div>
          {errors.room && <div className="error-msg show">{errors.room}</div>}
        </div>
        <div className="form-group">
          <label>Phone Number *</label>
          <div className="input-wrapper">
            <input type="text" placeholder="Phone" value={formData.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} />
          </div>
          {errors.phone && <div className="error-msg show">{errors.phone}</div>}
        </div>
        <div className="form-group">
          <label>Monthly Rent (₹) *</label>
          <div className="input-wrapper">
            <input type="number" placeholder="Rent" min="0" value={formData.rent || ''} onChange={(e) => handleInputChange('rent', e.target.value)} />
          </div>
          {errors.rent && <div className="error-msg show">{errors.rent}</div>}
        </div>
        <div className="form-group">
          <label>Payment Status</label>
          <select className="filter-select" style={{ width: '100%' }} value={formData.paymentStatus || 'pending'} onChange={(e) => handleInputChange('paymentStatus', e.target.value)}>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal 
        isOpen={activeModal === 'view'} 
        title="Tenant Details"
        onCancel={() => setActiveModal(null)}
      >
        {selectedTenant && (
          <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
            <div><strong>Name:</strong> {selectedTenant.name}</div>
            <div><strong>Room:</strong> {selectedTenant.room}</div>
            <div><strong>Phone:</strong> {selectedTenant.phone}</div>
            <div><strong>Check-in:</strong> {selectedTenant.checkIn}</div>
            <div><strong>Monthly Rent:</strong> ₹{selectedTenant.rent.toLocaleString()}</div>
            <div>
              <strong>Payment Status:</strong> 
              <span className={`badge badge-${selectedTenant.paymentStatus}`} style={{ marginLeft: '8px' }}>
                {selectedTenant.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal 
        isOpen={activeModal === 'delete'} 
        title="Delete Tenant"
        onCancel={() => setActiveModal(null)}
        onConfirm={handleDelete}
        confirmText="Delete"
      >
        {selectedTenant && (
          <p style={{ fontSize: '14px', color: '#374151' }}>
            Are you sure you want to remove <strong>{selectedTenant.name}</strong> (Room {selectedTenant.room})? This action cannot be undone.
          </p>
        )}
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
