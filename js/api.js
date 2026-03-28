/* ============================================
   Nilambari Travels - API Client
   ============================================ */

const API_BASE = window.location.origin + '/api';

const ApiClient = {
  // ─── Search ───
  async search(source, destination, date) {
    const params = new URLSearchParams({ source, destination });
    if (date) params.append('date', date);
    const res = await fetch(`${API_BASE}/search?${params}`);
    return res.json();
  },

  async getSeatAvailability(busId, date, routeId) {
    const params = new URLSearchParams({ date });
    if (routeId) params.append('routeId', routeId);
    const res = await fetch(`${API_BASE}/search/${busId}/seats?${params}`);
    return res.json();
  },

  // ─── Bookings ───
  async createBooking(data) {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getBooking(bookingId) {
    const res = await fetch(`${API_BASE}/bookings/${bookingId}`);
    return res.json();
  },

  // ─── Admin Auth ───
  async adminLogin(username, password) {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  // ─── Token Management ───
  setToken(token) {
    localStorage.setItem('adminToken', token);
  },

  getToken() {
    return localStorage.getItem('adminToken');
  },

  clearToken() {
    localStorage.removeItem('adminToken');
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  // ─── Authenticated Fetch ───
  async authFetch(url, options = {}) {
    const token = this.getToken();
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    };
    const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
    return res.json();
  },

  // ─── Admin Dashboard ───
  async getDashboard() {
    return this.authFetch('/admin/dashboard');
  },

  async getAdminBookings(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.authFetch(`/admin/bookings${qs ? '?' + qs : ''}`);
  },
};
