import React, { useState } from 'react';

const Payments = () => {
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  if (isPaying) {
    return (
      <div>
        <button className="btn btn-ghost btn-sm mb-16" onClick={() => setIsPaying(false)} style={{marginBottom: '16px'}}>← Cancel Payment</button>
        <div className="payment-flow-layout">
          <div>
            <div className="card mb-16" style={{marginBottom: '16px'}}>
              <div className="card-body">
                <div className="card-title">Select Payment Method</div>
                <div className="grid-3 mb-16" style={{marginTop: '14px', marginBottom: '16px'}}>
                  <div className={`payment-method-card ${paymentMethod === 'upi' ? 'active' : ''}`} onClick={() => setPaymentMethod('upi')}>
                    <div className="payment-method-icon"><span className="material-icons-outlined" style={{fontSize: '24px'}}>smartphone</span></div>
                    <div className="payment-method-name">UPI</div>
                  </div>
                  <div className={`payment-method-card ${paymentMethod === 'card' ? 'active' : ''}`} onClick={() => setPaymentMethod('card')}>
                    <div className="payment-method-icon"><span className="material-icons-outlined" style={{fontSize: '24px'}}>credit_card</span></div>
                    <div className="payment-method-name">Card</div>
                  </div>
                  <div className={`payment-method-card ${paymentMethod === 'netbanking' ? 'active' : ''}`} onClick={() => setPaymentMethod('netbanking')}>
                    <div className="payment-method-icon"><span className="material-icons-outlined" style={{fontSize: '24px'}}>account_balance</span></div>
                    <div className="payment-method-name">Net Banking</div>
                  </div>
                </div>
                
                {paymentMethod === 'upi' && (
                  <div className="payment-panel">
                    <div className="form-group">
                      <label>Your UPI ID</label>
                      <input type="text" placeholder="yourname@upi" />
                    </div>
                    <button className="btn btn-primary btn-full" onClick={() => {alert('Payment Processed'); setIsPaying(false);}}>Continue with UPI</button>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="payment-panel">
                    <div className="form-group">
                      <label>Card Number</label>
                      <input type="text" placeholder="1234 5678 9012 3456" />
                    </div>
                    <button className="btn btn-primary btn-full" onClick={() => {alert('Payment Processed'); setIsPaying(false);}}>Continue with Card</button>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="payment-panel">
                    <div className="form-group">
                      <label>Select Bank</label>
                      <select>
                        <option>State Bank of India</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                      </select>
                    </div>
                    <button className="btn btn-primary btn-full" onClick={() => {alert('Payment Processed'); setIsPaying(false);}}>Continue with Net Banking</button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="payment-details-card">
            <h3 className="card-title mb-16" style={{marginBottom: '16px'}}>Payment Details</h3>
            <div className="payment-detail-row" style={{display: 'flex', justifyContent: 'space-between'}}><span className="pd-label">Payment Type</span><span className="pd-value dyn-pay-type">Rent</span></div>
            <div className="payment-detail-row" style={{display: 'flex', justifyContent: 'space-between'}}><span className="pd-label">Due Date</span><span className="pd-value dyn-pay-due">Mar 10, 2026</span></div>
            <div className="payment-detail-row" style={{display: 'flex', justifyContent: 'space-between'}}><span className="pd-label">Processing Fee</span><span className="pd-value" style={{color: 'var(--success)'}}>₹0</span></div>
            <div className="payment-total" style={{display: 'flex', justifyContent: 'space-between', marginTop: '10px'}}><span className="pt-label">Total Amount</span><span className="pt-value dyn-pay-amount">₹12,000</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Payments</h1>
        <p>Manage your rent and utility payments</p>
      </div>
      
      <div className="grid-4 mb-20" style={{marginBottom: '20px'}}>
        <div className="stat-card"><div className="stat-label">Total Pending <span><span className="material-icons-outlined" style={{fontSize: '24px'}}>schedule</span></span></div><div className="stat-value" style={{color: 'var(--warning)'}}>₹12,000</div></div>
        <div className="stat-card"><div className="stat-label">Paid this Month <span><span className="material-icons-outlined" style={{fontSize: '24px'}}>check_circle</span></span></div><div className="stat-value" style={{color: 'var(--success)'}}>₹0</div></div>
        <div className="stat-card"><div className="stat-label">Monthly Rent <span>₹</span></div><div className="stat-value">₹12,000</div></div>
        <div className="stat-card"><div className="stat-label">Next Due Date <span><span className="material-icons-outlined" style={{fontSize: '24px'}}>calendar_today</span></span></div><div className="stat-value" style={{fontSize: '16px'}}>Mar 10, 2026</div></div>
      </div>

      <div className="card mb-20" style={{marginBottom: '20px'}}>
        <div className="card-body">
          <div className="card-title">Upcoming Payments</div>
          <div className="mt-14" style={{marginTop: '14px'}}>
            <div className="payment-item">
              <div className="payment-info">
                <div className="payment-type">Monthly Rent</div>
                <div className="payment-sub">Due: Mar 10, 2026</div>
              </div>
              <div className="payment-right">
                <div className="payment-amount">₹12,000</div>
                <button className="btn btn-primary btn-sm" style={{marginTop: '4px'}} onClick={() => setIsPaying(true)}>Pay Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="card-title">Payment History</div>
          <div className="mt-14" style={{marginTop: '14px', overflowX: 'auto'}}>
            <table className="payment-table">
              <thead><tr><th>Type</th><th>Amount</th><th>Date</th><th>Method</th><th>Status</th></tr></thead>
              <tbody>
                {/* Dynamic rows will go here */}
                <tr><td colSpan="5" style={{textAlign: 'center', color: 'var(--text-muted)'}}>No payment history.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
