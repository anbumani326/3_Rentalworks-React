import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const getName = (val) => typeof val === 'object' ? (val?.name || 'Unknown') : (val || 'Unknown');

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const toast = useToast();

  const owners = users.filter(u => u.role === 'owner');

  const load = useCallback(async () => {
    try {
      const [p, u] = await Promise.all([api.getProperties(), api.getUsers()]);
      setProperties(p); setUsers(u);
    } catch { toast('error', 'Error', 'Failed to load properties'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = search ? properties.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) || p.location?.toLowerCase().includes(search.toLowerCase()) || getName(p.owner).toLowerCase().includes(search.toLowerCase())
  ) : properties;

  const counts = { total: properties.length, approved: properties.filter(p => p.status === 'approved').length, pending: properties.filter(p => p.status === 'pending').length, rejected: properties.filter(p => p.status === 'rejected').length };

  const updateProp = async (id, data) => {
    try { await api.updateProperty(id, data); setProperties(prev => prev.map(p => p.id === id ? { ...p, ...data } : p)); return true; } catch { toast('error', 'Error', 'Failed to update property'); return false; }
  };

  const handleApprove = async (id) => { if (await updateProp(id, { status: 'approved' })) toast('success', 'Property Approved', 'Property is now live'); };
  const handleReject = (p) => { setModal({ type: 'confirm', title: 'Reject Property', message: `Are you sure you want to reject <strong>${p.name}</strong>?`, action: async () => { if (await updateProp(p.id, { status: 'rejected' })) { toast('error', 'Property Rejected', `${p.name} has been rejected`); setModal(null); } }}); };
  const handleOffboard = (p) => { setModal({ type: 'confirm', title: 'Initiate Notice Period', message: `Begin offboarding for <strong>${p.name}</strong>?`, action: async () => { if (await updateProp(p.id, { status: 'offboarding' })) { toast('warning', 'Notice Period Initiated', `${p.name} entered offboarding`); setModal(null); } }}); };
  const handleFinalRemove = (p) => { setModal({ type: 'confirm', title: 'Finalize Removal', message: `Permanently remove <strong>${p.name}</strong>? This cannot be undone.`, action: async () => { try { await api.deleteProperty(p.id); setProperties(prev => prev.filter(x => x.id !== p.id)); toast('success', 'Property Removed', `${p.name} removed`); } catch { toast('error', 'Error', 'Failed to remove'); } setModal(null); }}); };
  const handleVerifyDocs = (p) => { setModal({ type: 'confirm', title: `Verify Docs: ${p.name}`, message: 'Approve all submitted documents?', action: async () => { if (await updateProp(p.id, { docsVerified: true })) { toast('success', 'Docs Verified', 'Documents marked as valid'); setModal(null); } }}); };
  const handlePassInspection = (p) => { setModal({ type: 'confirm', title: `Inspection: ${p.name}`, message: 'Submit inspection report and mark as passed?', action: async () => { if (await updateProp(p.id, { inspectionPassed: true })) { toast('success', 'Inspection Passed', 'Property cleared site audit'); setModal(null); } }}); };

  const handleAdd = () => { setModal({ type: 'add', fields: { name: '', location: '', ownerId: owners[0]?.id || '', rentMin: '', rentMax: '', rooms: '' } }); };
  const handleAddSave = async () => {
    const f = modal.fields;
    if (!f.name || !f.location || !f.ownerId) { toast('error', 'Validation', 'Fill required fields'); return; }
    try {
      const created = await api.createProperty({ name: f.name, location: f.location, ownerId: Number(f.ownerId), rentMin: Number(f.rentMin) || 0, rentMax: Number(f.rentMax) || 0, rooms: f.rooms || '1', amenities: ['WiFi'] });
      setProperties(prev => [...prev, created]);
      toast('success', 'Property Added', `${f.name} added and pending review`);
    } catch { toast('error', 'Error', 'Failed to add property'); }
    setModal(null);
  };

  return (
    <>
      <div className="sec-hdr"><h2>PG Properties</h2><p>Manage property listings and onboarding pipeline</p></div>
      <div className="prop-summary">
        <div className="u-sum-card"><div className="u-sum-label">Total Properties</div><div className="u-sum-val blue">{counts.total}</div></div>
        <div className="u-sum-card"><div className="u-sum-label">Approved</div><div className="u-sum-val green">{counts.approved}</div></div>
        <div className="u-sum-card"><div className="u-sum-label">Pending Pipeline</div><div className="u-sum-val" style={{color:'#d97706'}}>{counts.pending}</div></div>
        <div className="u-sum-card"><div className="u-sum-label">Rejected</div><div className="u-sum-val red">{counts.rejected}</div></div>
      </div>
      <div style={{marginBottom:16,display:'flex',gap:10}}>
        <div className="search-wrap" style={{maxWidth:400}}><span className="s-ico material-icons-outlined">search</span><input placeholder="Search properties..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <button className="btn-add" onClick={handleAdd}><span className="material-icons-outlined" style={{fontSize:16}}>add</span> Add Property</button>
      </div>
      <div className="prop-grid">
        {loading ? <div style={{textAlign:'center',color:'#94a3b8',padding:40,gridColumn:'1/-1'}}>Loading...</div> :
        filtered.length === 0 ? <div style={{textAlign:'center',color:'#94a3b8',padding:40,gridColumn:'1/-1'}}>No properties found</div> :
        filtered.map(p => {
          const ownerName = getName(p.owner);
          const docsOk = p.docsVerified || false;
          const inspectionOk = p.inspectionPassed || false;
          return (
            <div key={p.id} className="prop-card">
              <div className="prop-card-hdr">
                <h3>{p.name} {p.status === 'offboarding' && <span style={{fontSize:10,padding:'3px 8px',borderRadius:20,fontWeight:600,background:'#ffedd5',color:'#ea580c',marginLeft:6}}>Offboarding</span>}</h3>
                <span className={`badge badge-${p.status}`}>{cap(p.status)}</span>
              </div>
              <div className="prop-location">📍 {p.location}</div>
              <div className="prop-owner">Owner: <span>{ownerName}</span></div>
              {p.status === 'pending' && (
                <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
                  <span style={{fontSize:10,padding:'3px 8px',borderRadius:20,fontWeight:600,background:docsOk?'#dcfce7':'#fef9c3',color:docsOk?'#15803d':'#b45309'}}>{docsOk?'✓':'⏳'} Docs {docsOk?'Verified':'Pending'}</span>
                  <span style={{fontSize:10,padding:'3px 8px',borderRadius:20,fontWeight:600,background:inspectionOk?'#dcfce7':'#fef9c3',color:inspectionOk?'#15803d':'#b45309'}}>{inspectionOk?'✓':'⏳'} Inspection {inspectionOk?'Passed':'Pending'}</span>
                </div>
              )}
              <div className="prop-details">
                <div className="prop-detail"><div className="pd-lbl">Rent Range</div><div className="pd-val">₹{(p.rentMin||0).toLocaleString('en-IN')} – ₹{(p.rentMax||0).toLocaleString('en-IN')}</div></div>
                <div className="prop-detail"><div className="pd-lbl">Safety Score</div><div className="pd-val">{p.safetyScore || 0}/10</div><div className="safety-bar"><div className="safety-fill" style={{width:`${((p.safetyScore||0)/10)*100}%`}}></div></div></div>
                <div className="prop-detail"><div className="pd-lbl">Rooms</div><div className="pd-val">{p.rooms || '-'}</div></div>
                <div className="prop-detail"><div className="pd-lbl">Occupancy</div><div className="pd-val">{p.occupancy || 0}%</div></div>
                <div className="prop-detail"><div className="pd-lbl">Commission</div><div className="pd-val" style={{color:'#7c3aed'}}>{p.commissionRate || 10}%</div></div>
                <div className="prop-detail"><div className="pd-lbl">Compliance</div><div className="pd-val" style={{color:'#16a34a',fontSize:12}}>✓ {p.compliance || 'Verified'}</div></div>
              </div>
              <div style={{fontSize:11,color:'#475569',marginBottom:10}}>🔥 Fire Safety: {p.fireSafety || 'Yes'}</div>
              <div className="prop-amenities">{(p.amenities||[]).map((a,i) => <span key={i} className="amenity-tag">{a}</span>)}</div>
              <div className="prop-actions">
                {p.status === 'pending' && (docsOk && inspectionOk ? (
                  <><button className="btn-approve" onClick={() => handleApprove(p.id)}>✓ Approve</button><button className="btn-reject" onClick={() => handleReject(p)}>✗ Reject</button></>
                ) : (
                  <>{!docsOk && <button className="btn-verify-docs" onClick={() => handleVerifyDocs(p)}>📂 Verify Docs</button>}{docsOk && !inspectionOk && <button className="btn-inspection" onClick={() => handlePassInspection(p)}>📝 Inspection</button>}</>
                ))}
                {p.status === 'approved' && <><button className="btn-edit-prop" onClick={() => setModal({type:'edit',prop:p,fields:{name:p.name,ownerId:p.ownerId,safetyScore:p.safetyScore||0,occupancy:p.occupancy||0}})}>✏️ Edit</button><button className="btn-offboard" onClick={() => handleOffboard(p)}>⚠️ Notice Period</button></>}
                {p.status === 'offboarding' && <button className="btn-reject" onClick={() => handleFinalRemove(p)}>Finalize Removal</button>}
                {p.status === 'rejected' && <button className="btn-approve" onClick={() => handleApprove(p.id)}>Reconsider</button>}
              </div>
            </div>
          );
        })}
      </div>

      <Modal show={!!modal} onClose={() => setModal(null)} title={modal?.title || (modal?.type === 'add' ? 'Add New Property' : modal?.type === 'edit' ? 'Edit Property' : '')}
        footer={modal?.type === 'confirm' ? (
          <><button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button><button className="btn-confirm-red" onClick={modal.action}>Confirm</button></>
        ) : modal?.type === 'add' ? (
          <><button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button><button className="btn-confirm-blue" onClick={handleAddSave}>Add Property</button></>
        ) : modal?.type === 'edit' ? (
          <><button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button><button className="btn-confirm-blue" onClick={async () => { const f = modal.fields; if (await updateProp(modal.prop.id, { name: f.name, safetyScore: Number(f.safetyScore), occupancy: Number(f.occupancy) })) { toast('success', 'Property Updated', 'Changes saved'); setModal(null); } }}>Save Changes</button></>
        ) : <button className="btn-cancel" onClick={() => setModal(null)}>Close</button>}>
        {modal?.type === 'confirm' && <p style={{fontSize:13,lineHeight:1.6,color:'#475569'}} dangerouslySetInnerHTML={{__html: modal.message}} />}
        {(modal?.type === 'add' || modal?.type === 'edit') && (
          <div className="form-row">
            <div className="f-field"><label>Property Name *</label><input value={modal.fields.name} onChange={e => setModal({...modal, fields:{...modal.fields, name:e.target.value}})} /></div>
            {modal.type === 'add' && <div className="f-field"><label>Location *</label><input value={modal.fields.location} onChange={e => setModal({...modal, fields:{...modal.fields, location:e.target.value}})} /></div>}
            <div className="f-field"><label>Owner *</label>
              <select value={modal.fields.ownerId} onChange={e => setModal({...modal, fields:{...modal.fields, ownerId:e.target.value}})}>
                <option value="">Select Owner</option>{owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            {modal.type === 'add' && <><div className="f-field"><label>Min Rent (₹)</label><input type="number" value={modal.fields.rentMin} onChange={e => setModal({...modal, fields:{...modal.fields, rentMin:e.target.value}})} /></div>
            <div className="f-field"><label>Max Rent (₹)</label><input type="number" value={modal.fields.rentMax} onChange={e => setModal({...modal, fields:{...modal.fields, rentMax:e.target.value}})} /></div></>}
            {modal.type === 'edit' && <><div className="f-field"><label>Safety Score</label><input type="number" value={modal.fields.safetyScore} onChange={e => setModal({...modal, fields:{...modal.fields, safetyScore:e.target.value}})} /></div>
            <div className="f-field"><label>Occupancy %</label><input type="number" value={modal.fields.occupancy} onChange={e => setModal({...modal, fields:{...modal.fields, occupancy:e.target.value}})} /></div></>}
          </div>
        )}
      </Modal>
    </>
  );
}
