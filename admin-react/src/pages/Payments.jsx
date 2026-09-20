import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const getName = (val) => typeof val === 'object' ? (val?.name || 'Unknown') : (val || 'Unknown');

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const toast = useToast();

  const load = useCallback(async () => {
    try { setPayments(await api.getPayments()); } catch { toast('error', 'Error', 'Failed to load payments'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = payments.filter(p => !search ||
    (getName(p.tenant) && getName(p.tenant).toLowerCase().includes(search.toLowerCase())) ||
    (getName(p.property) && getName(p.property).toLowerCase().includes(search.toLowerCase())) ||
    (p.transactionId && p.transactionId.toLowerCase().includes(search.toLowerCase()))
  );

  const verified = payments.filter(p => p.status === 'verified');
  const pending = payments.filter(p => p.status === 'pending');
  const gtv = verified.reduce((s, p) => s + (p.amount || 0), 0);
  const platformRev = Math.round(gtv * 0.10);
  const pendingAmt = pending.reduce((s, p) => s + (p.amount || 0), 0);

  const handleView = (p) => { setModal({ type: 'view', payment: p }); };

  const handleApproveClearance = async (p) => {
    try { await api.updatePayment(p.id, { clearance: 'Approved' }); setPayments(prev => prev.map(x => x.id === p.id ? { ...x, clearance: 'Approved' } : x)); toast('success', 'Clearance Approved', `Refund unlocked for ${getName(p.tenant)}`); } catch { toast('error', 'Error', 'Failed'); }
  };

  const handleIssueRefund = (p) => {
    if (p.clearance !== 'Approved') { toast('error', 'Clearance Required', 'Approval needed before refund'); return; }
    toast('info', 'Refund Initiated', `Refund of ₹${(p.amount||0).toLocaleString('en-IN')} to ${getName(p.tenant)} initiated`);
  };

  return (
    <>
      <div className="sec-hdr"><h2>Payments</h2><p>Payment ledger and transaction management</p></div>
      <div className="pay-summary">
        <div className="stat-card"><div className="stat-top"><div className="stat-icon bg-green"><span className="material-icons-outlined" style={{color:'#16a34a'}}>trending_up</span></div></div><div className="stat-val">₹{gtv.toLocaleString('en-IN')}</div><div className="stat-lbl">Gross Transaction Value</div></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon bg-blue"><span className="material-icons-outlined" style={{color:'#2563eb'}}>account_balance</span></div></div><div className="stat-val">₹{platformRev.toLocaleString('en-IN')}</div><div className="stat-lbl">Platform Revenue (10%)</div></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon bg-yellow"><span className="material-icons-outlined" style={{color:'#d97706'}}>pending</span></div></div><div className="stat-val">₹{pendingAmt.toLocaleString('en-IN')}</div><div className="stat-lbl">Pending Verification</div></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon bg-purple"><span className="material-icons-outlined" style={{color:'#7c3aed'}}>verified</span></div></div><div className="stat-val">{verified.length}</div><div className="stat-lbl">Verified Transactions</div></div>
      </div>
      <div className="tbl-wrap">
        <div className="tbl-hdr">
          <div className="search-wrap"><span className="s-ico material-icons-outlined">search</span><input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>
        <table className="data-tbl">
          <thead><tr><th>Tenant</th><th>Property</th><th>Room</th><th>Amount</th><th>Method</th><th>Transaction ID</th><th>Date</th><th>Status</th><th>Clearance</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="10" style={{textAlign:'center',padding:24,color:'#94a3b8'}}>Loading...</td></tr> :
            filtered.length === 0 ? <tr><td colSpan="10" style={{textAlign:'center',padding:24,color:'#94a3b8'}}>No transactions found</td></tr> :
            filtered.map(p => {
              const clearance = p.clearance || 'Pending';
              return (
                <tr key={p.id}>
                  <td><strong>{getName(p.tenant)}</strong></td>
                  <td style={{fontSize:12}}>{getName(p.property)}</td>
                  <td><span className="room-chip">{p.room || '-'}</span></td>
                  <td style={{fontWeight:600}}>₹{(p.amount||0).toLocaleString('en-IN')}</td>
                  <td style={{fontSize:12}}>{p.method || '-'}</td>
                  <td style={{fontSize:11,color:'#475569'}}>{p.transactionId || '-'}</td>
                  <td style={{fontSize:12}}>{p.paidDate || '-'}</td>
                  <td><span className={`badge badge-${p.status||'pending'}`}>{cap(p.status||'pending')}</span></td>
                  <td><span style={{fontSize:11,padding:'2px 8px',borderRadius:20,fontWeight:600,background:clearance==='Approved'?'#dcfce7':'#fef9c3',color:clearance==='Approved'?'#15803d':'#b45309'}}>{clearance}</span></td>
                  <td>
                    <div className="act-icons">
                      <button className="ico-btn" onClick={() => handleView(p)} title="View"><span className="material-icons-outlined" style={{fontSize:14}}>visibility</span></button>
                      {clearance !== 'Approved' && <button className="ico-btn" onClick={() => handleApproveClearance(p)} title="Approve Clearance"><span className="material-icons-outlined" style={{fontSize:14}}>check_circle</span></button>}
                      <button className="ico-btn" onClick={() => handleIssueRefund(p)} title="Refund" style={{opacity: clearance !== 'Approved' ? 0.4 : 1, pointerEvents: clearance !== 'Approved' ? 'none' : 'auto'}}><span className="material-icons-outlined" style={{fontSize:14}}>replay</span></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal show={!!modal} onClose={() => setModal(null)} title="Payment Details" subtitle={modal?.payment ? `Transaction: ${modal.payment.transactionId}` : ''}
        footer={<button className="btn-cancel" onClick={() => setModal(null)}>Close</button>}>
        {modal?.payment && (
          <div style={{display:'grid',gap:10,fontSize:13}}>
            <div><strong>Tenant:</strong> {getName(modal.payment.tenant)}</div>
            <div><strong>Property:</strong> {getName(modal.payment.property)}</div>
            <div><strong>Room:</strong> {modal.payment.room}</div>
            <div><strong>Amount:</strong> ₹{(modal.payment.amount||0).toLocaleString()}</div>
            <div><strong>Platform Commission (10%):</strong> ₹{Math.round((modal.payment.amount||0)*0.10).toLocaleString()}</div>
            <div><strong>Method:</strong> {modal.payment.method}</div>
            <div><strong>Transaction ID:</strong> {modal.payment.transactionId}</div>
            <div><strong>Date:</strong> {modal.payment.paidDate}</div>
            <div><strong>Status:</strong> <span className={`badge badge-${modal.payment.status}`}>{cap(modal.payment.status)}</span></div>
            <div><strong>Clearance:</strong> {modal.payment.clearance || 'Pending'}</div>
          </div>
        )}
      </Modal>
    </>
  );
}
