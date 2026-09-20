import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const statusLabel = (s) => ({ active: 'Active', paid: 'Paid', pending: 'Pending', cancelled: 'Cancelled', completed: 'Completed' })[s] || cap(s);
const getName = (val) => typeof val === 'object' ? (val?.name || 'Unknown') : (val || 'Unknown');
const getPhone = (val) => typeof val === 'object' ? (val?.phone || '') : '';
const fmtINR = (n) => '\u20B9' + (n || 0).toLocaleString('en-IN');

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const toast = useToast();

  const load = useCallback(async () => {
    try { setBookings(await api.getBookings()); } catch { toast('error', 'Error', 'Failed to load bookings'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = bookings.filter(b => {
    const tenantName = getName(b.tenant);
    const propName = getName(b.property);
    const ms = !search || tenantName.toLowerCase().includes(search.toLowerCase()) || propName.toLowerCase().includes(search.toLowerCase()) || b.room?.includes(search);
    const mst = statusF === 'all' || b.status === statusF;
    return ms && mst;
  });

  const stats = { total: bookings.length, active: bookings.filter(b => b.status === 'active' || b.status === 'paid').length, pending: bookings.filter(b => b.status === 'pending').length, cancelled: bookings.filter(b => b.status === 'cancelled').length };

  const handleApprove = async (b) => {
    try { await api.updateBooking(b.id, { status: 'active' }); setBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: 'active' } : x)); toast('success', 'Booking Approved', `${getName(b.tenant)} booking approved`); } catch { toast('error', 'Error', 'Failed'); }
  };

  const handleReject = (b) => {
    setModal({ type: 'confirm', title: 'Reject Booking', message: `Reject booking for <strong>${getName(b.tenant)}</strong> at ${getName(b.property)}?`, action: async () => { try { await api.updateBooking(b.id, { status: 'cancelled' }); setBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: 'cancelled' } : x)); toast('error', 'Booking Rejected', `${getName(b.tenant)} booking cancelled`); } catch {} setModal(null); }});
  };

  const handleTerminate = (b) => {
    setModal({ type: 'confirm', title: 'Force Terminate', message: `Terminate <strong>${getName(b.tenant)}</strong>'s booking? This cannot be undone.`, action: async () => { try { await api.updateBooking(b.id, { status: 'cancelled' }); setBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: 'cancelled' } : x)); toast('warning', 'Booking Terminated', `${getName(b.tenant)} booking terminated`); } catch {} setModal(null); }});
  };

  const handleView = (b) => { setModal({ type: 'view', booking: b }); };

  return (
    <>
      <div className="sec-hdr"><h2>Bookings</h2><p>Manage tenant bookings and lifecycle</p></div>
      <div className="booking-summary">
        <div className="u-sum-card"><div className="u-sum-label">Total Bookings</div><div className="u-sum-val blue">{stats.total}</div></div>
        <div className="u-sum-card"><div className="u-sum-label">Active</div><div className="u-sum-val green">{stats.active}</div></div>
        <div className="u-sum-card"><div className="u-sum-label">Pending</div><div className="u-sum-val" style={{color:'#d97706'}}>{stats.pending}</div></div>
        <div className="u-sum-card"><div className="u-sum-label">Cancelled</div><div className="u-sum-val red">{stats.cancelled}</div></div>
      </div>
      <div className="tbl-wrap">
        <div className="tbl-hdr">
          <div className="search-wrap"><span className="s-ico material-icons-outlined">search</span><input placeholder="Search bookings..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <select className="sel" value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="all">All Status</option><option value="active">Active</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option>
          </select>
        </div>
        <table className="data-tbl">
          <thead><tr><th>Tenant</th><th>Property</th><th>Room</th><th>Check-in</th><th>Duration</th><th>Rent</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="8" style={{textAlign:'center',padding:24,color:'#94a3b8'}}>Loading...</td></tr> :
            filtered.length === 0 ? <tr><td colSpan="8" style={{textAlign:'center',padding:24,color:'#94a3b8'}}>No bookings found</td></tr> :
            filtered.map(b => (
              <tr key={b.id}>
                <td><strong>{getName(b.tenant)}</strong><div style={{fontSize:11,color:'#94a3b8'}}>{getPhone(b.tenant)}</div></td>
                <td style={{fontSize:12}}>{getName(b.property)}</td>
                <td><span className="room-chip">{b.room}</span></td>
                <td style={{fontSize:12}}>📅 {b.checkIn}</td>
                <td style={{fontSize:12}}>⏱ {b.duration}</td>
                <td style={{fontSize:12}}>₹{(b.rent || 0).toLocaleString('en-IN')}</td>
                <td><span className={`badge badge-${b.status}`}>{statusLabel(b.status)}</span></td>
                <td>
                  <div className="act-icons">
                    {b.status === 'pending' && <><button className="ico-btn" onClick={() => handleApprove(b)} title="Approve"><span className="material-icons-outlined" style={{fontSize:14}}>check</span></button>
                    <button className="ico-btn danger" onClick={() => handleReject(b)} title="Reject"><span className="material-icons-outlined" style={{fontSize:14}}>close</span></button></>}
                    {(b.status === 'active' || b.status === 'paid') && <><button className="ico-btn" onClick={() => handleView(b)} title="View"><span className="material-icons-outlined" style={{fontSize:14}}>visibility</span></button>
                    <button className="ico-btn danger" onClick={() => handleTerminate(b)} title="Terminate"><span className="material-icons-outlined" style={{fontSize:14}}>block</span></button></>}
                    {b.status === 'cancelled' && <button className="ico-btn" onClick={() => handleView(b)} title="View"><span className="material-icons-outlined" style={{fontSize:14}}>visibility</span></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="tbl-footer">Showing {filtered.length} of {bookings.length} bookings</div>
      </div>

      <Modal show={!!modal} onClose={() => setModal(null)} title={modal?.title || 'Booking Details'} subtitle={modal?.type === 'view' && modal.booking ? `Room ${modal.booking.room} at ${getName(modal.booking.property)}` : ''}
        footer={modal?.type === 'confirm' ? <><button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button><button className="btn-confirm-red" onClick={modal.action}>Confirm</button></> : <button className="btn-cancel" onClick={() => setModal(null)}>Close</button>}>
        {modal?.type === 'confirm' && <p style={{fontSize:13,lineHeight:1.6,color:'#475569'}} dangerouslySetInnerHTML={{__html: modal.message}} />}
        {modal?.type === 'view' && modal.booking && (
          <div style={{display:'grid',gap:10,fontSize:13}}>
            <div><strong>Tenant:</strong> {getName(modal.booking.tenant)}</div>
            <div><strong>Phone:</strong> {getPhone(modal.booking.tenant) || '-'}</div>
            <div><strong>Property:</strong> {getName(modal.booking.property)}</div>
            <div><strong>Room:</strong> {modal.booking.room}</div>
            <div><strong>Check-in:</strong> {modal.booking.checkIn}</div>
            <div><strong>Duration:</strong> {modal.booking.duration}</div>
            <div><strong>Monthly Rent:</strong> ₹{(modal.booking.rent||0).toLocaleString()}</div>
            <div><strong>Status:</strong> <span className={`badge badge-${modal.booking.status}`}>{statusLabel(modal.booking.status)}</span></div>
          </div>
        )}
      </Modal>
    </>
  );
}
