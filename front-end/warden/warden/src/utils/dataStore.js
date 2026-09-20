import { useState, useEffect, useCallback } from 'react';

const MOCK_DATA = {
  warden: { name: 'Warden', email: 'warden@pgrentals.com', phone: '+91 00000 00000', property: 'Default Property' },
  tenants: [],
  rooms: [],
  violations: [],
  complaints: [],
  notifications: []
};

// Extracted from main_warden.js
export function loadWardenData() {
  let tenants       = JSON.parse(localStorage.getItem('warden_tenants'))       || [];
  let rooms         = JSON.parse(localStorage.getItem('warden_rooms'))         || [];
  let violations    = JSON.parse(localStorage.getItem('warden_violations'))    || [];
  let notifications = JSON.parse(localStorage.getItem('warden_notifications')) || [];

  // Merge real tenants from global_bookings
  let globalBookings = JSON.parse(localStorage.getItem('global_bookings') || '[]');
  
  if (globalBookings.length === 0) {
      globalBookings = [
          {
              id: 'seed_001', tenant: 'Rahul Sharma', property: 'Sunrise PG', propertyId: 'prop_001', room: 'A-204',
              status: 'active', moveInDate: '2024-01-15', duration: '11 Months', rent: 8500, phone: '+91 9876543210'
          },
          {
              id: 'seed_002', tenant: 'Priya Nair', property: 'Sunrise PG', propertyId: 'prop_001', room: 'B-105',
              status: 'active', moveInDate: '2024-02-01', duration: '11 Months', rent: 8500, phone: '+91 9876543211'
          }
      ];
      localStorage.setItem('global_bookings', JSON.stringify(globalBookings));
  }

  globalBookings.forEach(b => {
      if (b.status === 'active' && !tenants.some(t => t.name === b.tenant)) {
          tenants.push({
              id: b.id, name: b.tenant, room: b.room || 'TBD', phone: 'Not Provided',
              checkIn: b.moveInDate, rent: b.rent || 0, paymentStatus: 'paid'
          });
      }
  });

  if (tenants.length === 0) tenants = [...MOCK_DATA.tenants];
  if (rooms.length === 0) rooms = [...MOCK_DATA.rooms];
  if (violations.length === 0) violations = [...MOCK_DATA.violations];
  if (notifications.length === 0) notifications = [...MOCK_DATA.notifications];

  // Merge global complaints, issues, and services
  let globalCmp = JSON.parse(localStorage.getItem('global_complaints')) || [];
  let globalIss = JSON.parse(localStorage.getItem('global_issues')) || [];
  let globalSrv = JSON.parse(localStorage.getItem('global_services')) || [];

  let complaints = [
    ...globalCmp.map(c => ({
      id: c.id, tenant: c.tenantName || 'Amit Sharma', room: c.room || 'A-204', type: 'Complaint', priority: c.priority || 'medium', status: c.status === 'in-progress' ? 'in_progress' : c.status, date: c.created || new Date().toLocaleDateString(), description: c.desc, _source: 'complaints'
    })),
    ...globalIss.map(i => ({
      id: i.id, tenant: i.tenantName || 'Amit Sharma', room: i.room || 'A-204', type: 'Issue: ' + i.category, priority: i.priority || 'medium', status: i.status === 'in-progress' ? 'in_progress' : i.status, date: new Date().toLocaleDateString(), description: i.desc, _source: 'issues'
    })),
    ...globalSrv.map(s => ({
      id: s.id, tenant: s.tenantName || 'Amit Sharma', room: s.room || 'A-204', type: 'Service: ' + s.name, priority: 'low', status: s.status === 'pending' ? 'open' : s.status, date: s.date, description: 'Requested ' + s.name, _source: 'services'
    }))
  ];

  if (complaints.length === 0) {
    complaints = JSON.parse(localStorage.getItem('warden_complaints')) || [...MOCK_DATA.complaints];
  }

  return { tenants, rooms, violations, complaints, notifications };
}

export function saveWardenData(data) {
  if (data.tenants) localStorage.setItem('warden_tenants', JSON.stringify(data.tenants));
  if (data.rooms) localStorage.setItem('warden_rooms', JSON.stringify(data.rooms));
  if (data.violations) localStorage.setItem('warden_violations', JSON.stringify(data.violations));
  if (data.notifications) localStorage.setItem('warden_notifications', JSON.stringify(data.notifications));

  if (data.complaints) {
    let globalCmp = JSON.parse(localStorage.getItem('global_complaints')) || [];
    let globalIss = JSON.parse(localStorage.getItem('global_issues')) || [];
    let globalSrv = JSON.parse(localStorage.getItem('global_services')) || [];

    data.complaints.forEach(wc => {
      if (wc._source === 'complaints') {
        let match = globalCmp.find(c => c.id === wc.id);
        if (match) match.status = wc.status === 'in_progress' ? 'in-progress' : wc.status;
      } else if (wc._source === 'issues') {
        let match = globalIss.find(i => String(i.id) === String(wc.id));
        if (match) match.status = wc.status === 'in_progress' ? 'in-progress' : wc.status;
      } else if (wc._source === 'services') {
        let match = globalSrv.find(s => String(s.id) === String(wc.id));
        if (match) match.status = wc.status === 'open' ? 'pending' : wc.status;
      }
    });

    localStorage.setItem('global_complaints', JSON.stringify(globalCmp));
    localStorage.setItem('global_issues', JSON.stringify(globalIss));
    localStorage.setItem('global_services', JSON.stringify(globalSrv));
    localStorage.setItem('warden_complaints', JSON.stringify(data.complaints));
  }
}

// Custom hook to automatically load and save state, and listen to cross-tab updates
export function useWardenData() {
  const [data, setData] = useState(loadWardenData());

  const updateData = useCallback((newDataKey, newValue) => {
    setData(prev => {
      const updated = { ...prev, [newDataKey]: newValue };
      saveWardenData(updated);
      return updated;
    });
  }, []);

  useEffect(() => {
    const handleStorage = (e) => {
      if (['warden_tenants', 'warden_rooms', 'warden_violations', 'warden_notifications', 'warden_complaints', 'global_complaints', 'global_issues', 'global_services', 'cross_notifications'].includes(e.key)) {
        setData(loadWardenData());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return { data, updateData };
}
