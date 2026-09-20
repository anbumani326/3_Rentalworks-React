const BASE = 'http://localhost:3000';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-role': 'admin',
    'x-user-id': '1',
  };
}

async function request(method, path, body) {
  const opts = { method, headers: getHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) throw new Error(`API ${method} ${path} failed: ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  // Users
  getUsers: () => request('GET', '/users'),
  createUser: (data) => request('POST', '/users', data),
  updateUser: (id, data) => request('PUT', `/users/${id}`, data),
  deleteUser: (id) => request('DELETE', `/users/${id}`),

  // Properties
  getProperties: () => request('GET', '/properties'),
  createProperty: (data) => request('POST', '/properties', data),
  updateProperty: (id, data) => request('PUT', `/properties/${id}`, data),
  deleteProperty: (id) => request('DELETE', `/properties/${id}`),

  // Bookings
  getBookings: () => request('GET', '/bookings'),
  createBooking: (data) => request('POST', '/bookings', data),
  updateBooking: (id, data) => request('PUT', `/bookings/${id}`, data),
  deleteBooking: (id) => request('DELETE', `/bookings/${id}`),

  // Payments
  getPayments: () => request('GET', '/payments'),
  createPayment: (data) => request('POST', '/payments', data),
  updatePayment: (id, data) => request('PUT', `/payments/${id}`, data),
  deletePayment: (id) => request('DELETE', `/payments/${id}`),

  // Notifications
  getNotifications: () => request('GET', '/notifications'),
  createNotification: (data) => request('POST', '/notifications', data),
  updateNotification: (id, data) => request('PUT', `/notifications/${id}`, data),
  deleteNotification: (id) => request('DELETE', `/notifications/${id}`),

  // Complaints
  getComplaints: () => request('GET', '/complaints'),
  createComplaint: (data) => request('POST', '/complaints', data),
  updateComplaint: (id, data) => request('PUT', `/complaints/${id}`, data),
  deleteComplaint: (id) => request('DELETE', `/complaints/${id}`),
};
