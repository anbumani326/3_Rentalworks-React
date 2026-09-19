import React, { useState } from 'react';

const Complaints = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1>Complaints</h1>
          <p>Manage and track your complaints</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ File New Complaint</button>
      </div>

      <div className="stats-grid mb-20" style={{marginBottom: '20px'}}>
        <div className="stat-card"><div className="stat-label">Total Complaints</div><div className="stat-value">0</div></div>
        <div className="stat-card"><div className="stat-label">Open <span className="stat-icon"><span className="material-icons-outlined" style={{fontSize: '32px'}}>error</span></span></div><div className="stat-value" style={{color: 'var(--danger)'}}>0</div></div>
        <div className="stat-card"><div className="stat-label">In Progress <span className="stat-icon"><span className="material-icons-outlined" style={{fontSize: '32px'}}>schedule</span></span></div><div className="stat-value" style={{color: 'var(--warning)'}}>0</div></div>
        <div className="stat-card"><div className="stat-label">Resolved <span className="stat-icon"><span className="material-icons-outlined" style={{fontSize: '32px'}}>check_circle</span></span></div><div className="stat-value" style={{color: 'var(--success)'}}>0</div></div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="card-title">All Complaints</div>
          <div className="mt-14" style={{marginTop: '14px', color: 'var(--text-muted)'}}>
            No complaints filed yet.
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-icon"><span className="material-icons-outlined" style={{fontSize: '24px'}}>chat</span></div>
              <div>
                <div className="modal-title">File New Complaint</div>
                <div className="modal-sub">Report an issue to management</div>
              </div>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}><span className="material-icons-outlined" style={{fontSize: '24px'}}>close</span></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Complaint Title <span style={{color: 'var(--danger)'}}>*</span></label>
                <input type="text" placeholder="Brief title of your complaint" />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select defaultValue="medium">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description <span style={{color: 'var(--danger)'}}>*</span></label>
                <textarea placeholder="Describe your complaint in detail..."></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(false)}>Submit Complaint</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
