import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const getName = (val) => typeof val === 'object' ? (val?.name || 'Unknown') : (val || 'Unknown');

export default function Notifications() {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [notifHistory, setNotifHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [notifType, setNotifType] = useState('announcement');
  const [priority, setPriority] = useState('routine');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [targetPG, setTargetPG] = useState('all');
  const [targetUser, setTargetUser] = useState('all');
  const [showPG, setShowPG] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [scheduleDt, setScheduleDt] = useState('');

  const load = useCallback(async () => {
    try {
      const [u, p, n] = await Promise.all([api.getUsers(), api.getProperties(), api.getNotifications()]);
      setUsers(u); setProperties(p); setNotifHistory(n || []);
    } catch { toast('error', 'Error', 'Failed to load'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const counts = { all: users.length, tenants: users.filter(u => u.role === 'tenant').length, owners: users.filter(u => u.role === 'owner').length, wardens: users.filter(u => u.role === 'warden').length };

  const getFilteredRecipients = () => {
    let filtered = users;
    if (targetRole !== 'all') filtered = filtered.filter(u => u.role === targetRole);
    if (targetRole !== 'all' && targetPG !== 'all') filtered = filtered.filter(u => String(u.propertyId) === String(targetPG));
    if (targetPG !== 'all' && targetUser !== 'all') filtered = filtered.filter(u => u.id == targetUser);
    return filtered.length;
  };

  const recipientCount = getFilteredRecipients();

  const handleRoleChange = (val) => {
    setTargetRole(val);
    setTargetPG('all'); setTargetUser('all');
    setShowPG(val === 'tenant' || val === 'warden');
    setShowUser(false);
  };

  const handlePGChange = (val) => {
    setTargetPG(val);
    setTargetUser('all');
    setShowUser(val !== 'all');
  };

  const handleSend = async () => {
    if (!title.trim()) { toast('error', 'Missing Title', 'Enter an announcement title'); return; }
    if (!message.trim()) { toast('error', 'Missing Message', 'Enter an announcement message'); return; }
    if (recipientCount === 0) { toast('error', 'No Recipients', 'Select valid recipients'); return; }
    const payload = {
      title: title.trim(), message: message.trim(), type: notifType, priority,
      recipients: recipientCount, byUserId: 1,
    };
    try {
      const created = await api.createNotification(payload);
      setNotifHistory(prev => [created || { ...payload, id: Date.now(), sentAt: new Date().toISOString() }, ...prev]);
    } catch { toast('error', 'Error', 'Failed to send notification'); return; }
    setTitle(''); setMessage('');
    toast('success', 'Announcement Sent', `Broadcast to ${recipientCount} users`);
  };

  const handleSchedule = async () => {
    if (!title.trim()) { toast('error', 'Missing Title', 'Enter an announcement title'); return; }
    if (!message.trim()) { toast('error', 'Missing Message', 'Enter an announcement message'); return; }
    if (!scheduleDt) { toast('error', 'No Schedule Time', 'Pick a date and time'); return; }
    if (recipientCount === 0) { toast('error', 'No Recipients', 'Select valid recipients'); return; }
    const payload = {
      title: title.trim(), message: message.trim(), type: notifType, priority,
      recipients: recipientCount, byUserId: 1,
    };
    try {
      const created = await api.createNotification(payload);
      setNotifHistory(prev => [created || { ...payload, id: Date.now(), sentAt: new Date(scheduleDt).toISOString() }, ...prev]);
    } catch { toast('error', 'Error', 'Failed to schedule notification'); return; }
    setTitle(''); setMessage(''); setScheduleDt('');
    toast('info', 'Announcement Scheduled', `Will be sent to ${recipientCount} users`);
  };

  const priorityBg = (p) => p === 'urgent' ? '#fee2e2' : p === 'important' ? '#fef9c3' : '#f1f5f9';
  const priorityColor = (p) => p === 'urgent' ? '#dc2626' : p === 'important' ? '#b45309' : '#64748b';

  const totalSent = notifHistory.length;
  const totalReach = notifHistory.reduce((s, n) => s + (n.recipients || 0), 0);

  return (
    <>
      <div className="sec-hdr"><h2>Platform Announcements</h2><p>Broadcast system-wide updates to all users</p></div>
      <div className="notif-layout">
        <div className="notif-compose">
          <h3><span className="material-icons-outlined" style={{fontSize:24}}>outbox</span> Create Announcement</h3>
          <p>Compose and broadcast platform-level announcements</p>
          <div className="notif-type-btns">
            <button className={`type-btn ${notifType==='announcement'?'active':''}`} onClick={() => setNotifType('announcement')}><span className="material-icons-outlined" style={{fontSize:18}}>notifications</span> Announcement</button>
            <button className={`type-btn ${notifType==='alert'?'active':''}`} onClick={() => setNotifType('alert')}>✉️ Alert</button>
            <button className={`type-btn ${notifType==='update'?'active':''}`} onClick={() => setNotifType('update')}><span className="material-icons-outlined" style={{fontSize:18}}>outbox</span> Update</button>
          </div>
          <div className="notif-field">
            <label>Priority Level</label>
            <div className="priority-btns">
              <button className={`priority-btn ${priority==='routine'?'active':''}`} data-priority="routine" onClick={() => setPriority('routine')}>🟢 Routine</button>
              <button className={`priority-btn ${priority==='important'?'active':''}`} data-priority="important" onClick={() => setPriority('important')}>🟡 Important</button>
              <button className={`priority-btn ${priority==='urgent'?'active':''}`} data-priority="urgent" onClick={() => setPriority('urgent')}><span className="material-icons-outlined" style={{fontSize:16}}>error</span> Urgent</button>
            </div>
          </div>
          <div className="notif-field">
            <label>Target Audience *</label>
            <div style={{display:'flex',gap:10}}>
              <select value={targetRole} onChange={e => handleRoleChange(e.target.value)} style={{flex:1}}>
                <option value="all">Broadcast to All Users</option><option value="tenant">Tenants Only</option><option value="warden">Wardens Only</option><option value="owner">Owners Only</option>
              </select>
              {showPG && <select value={targetPG} onChange={e => handlePGChange(e.target.value)} style={{flex:1}}>
                <option value="all">All Properties</option>{properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>}
              {showUser && <select value={targetUser} onChange={e => setTargetUser(e.target.value)} style={{flex:1}}>
                <option value="all">All Members in this PG</option>
                {users.filter(u => u.role === targetRole).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>}
            </div>
          </div>
          <div className="notif-field"><label>Title *</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter announcement title..." /></div>
          <div className="notif-field"><label>Message *</label><textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Enter announcement message..." /></div>
          <div style={{display:'flex',gap:8,alignItems:'flex-start'}}>
            <button className="btn-send" style={{flex:1}} onClick={handleSend}><span className="material-icons-outlined" style={{fontSize:18}}>outbox</span> Send Now</button>
            <div style={{display:'flex',flexDirection:'column',gap:6,flex:1}}>
              <input type="datetime-local" value={scheduleDt} onChange={e => setScheduleDt(e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1.5px solid #e2e8f0',borderRadius:6,fontSize:12}} />
              <button className="btn-schedule" onClick={handleSchedule}><span className="material-icons-outlined" style={{fontSize:16}}>calendar_today</span> Schedule Send</button>
            </div>
          </div>
        </div>
        <div>
          <div className="recipients-card">
            <h4>Recipient Counts</h4>
            <div className="recipient-item selected" style={targetRole==='all'?{background:'#eff6ff',borderColor:'#2563eb'}:{}}>
              <div className="rec-left"><span className="material-icons-outlined" style={{fontSize:18,color:'#94a3b8'}}>group</span> All Users</div>
              <span className="rec-count">{counts.all}</span>
            </div>
            <div className="recipient-item">
              <div className="rec-left"><span className="material-icons-outlined" style={{fontSize:18,color:'#94a3b8'}}>person</span> All Tenants</div>
              <span className="rec-count" style={{color:'#16a34a'}}>{counts.tenants}</span>
            </div>
            <div className="recipient-item">
              <div className="rec-left"><span className="material-icons-outlined" style={{fontSize:18,color:'#94a3b8'}}>apartment</span> Property Owners</div>
              <span className="rec-count" style={{color:'#7c3aed'}}>{counts.owners}</span>
            </div>
            <div className="recipient-item">
              <div className="rec-left">👮 Wardens</div>
              <span className="rec-count" style={{color:'#16a34a'}}>{counts.wardens}</span>
            </div>
          </div>
          <div className="notif-stats-card">
            <h4>Announcement Stats</h4>
            <div className="ns-row"><span>Total Sent</span><strong>{totalSent}</strong></div>
            <div className="ns-row"><span>Total Reach</span><strong>{totalReach.toLocaleString()}</strong></div>
          </div>
        </div>
      </div>

      <div className="notif-history">
        <h3>Announcement History</h3>
        {notifHistory.length === 0 ? <p style={{color:'#94a3b8',textAlign:'center',padding:24,fontSize:13}}>No announcements sent yet</p> :
        notifHistory.map((n, i) => (
          <div key={n.id || i} className="nh-item">
            <div className={`nh-icon ${n.type}`}>{n.type === 'announcement' ? '🔔' : n.type === 'update' ? '📤' : '✉️'}</div>
            <div className="nh-content">
              <strong>{n.title}</strong>
              {n.priority && <span style={{fontSize:10,padding:'2px 6px',borderRadius:10,fontWeight:600,marginLeft:6,background:priorityBg(n.priority),color:priorityColor(n.priority)}}>{cap(n.priority)}</span>}
              <p>{n.message}</p>
              <div className="nh-meta">
                <span>👥 {(n.recipients||0).toLocaleString()} recipients</span>
                <span>Sent: {n.sentAt ? new Date(n.sentAt).toLocaleDateString('en-IN') : '-'}</span>
                <span>By: {getName(n.byUser) || 'Admin'}</span>
              </div>
            </div>
            <span className={`nh-type-badge ${n.type}`}>{cap(n.type)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
