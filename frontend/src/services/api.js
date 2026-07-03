import axios from 'axios';

const normalizeUrl = (url) => url.replace(/\/+$/, '');

const resolveApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL;

  if (configuredUrl) {
    const normalizedUrl = normalizeUrl(configuredUrl);
    return normalizedUrl.endsWith('/api') ? normalizedUrl : `${normalizedUrl}/api`;
  }

  if (typeof window !== 'undefined') {
    return `${normalizeUrl(window.location.origin)}/api`;
  }

  return 'http://localhost:5000/api';
};

const API_URL = resolveApiBaseUrl();
const BACKEND_BASE_URL = API_URL.replace(/\/api$/, '');

export const getBackendAssetUrl = (assetPath) => {
  if (!assetPath) {
    return '';
  }

  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  return `${BACKEND_BASE_URL}/${assetPath.replace(/^\/+/, '')}`;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me')
};

// Books API
export const booksAPI = {
  getAll: () => api.get('/books'),
  getById: (id) => api.get(`/books/${id}`),
  getPreview: (id) => api.get(`/books/${id}/preview`),
  getFull: (id) => api.get(`/books/${id}/full`),
  create: (formData) => api.post('/books', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/books/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/books/${id}`)
};

// Payments API
export const paymentsAPI = {
  submit: (formData) => api.post('/payments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getUserPayments: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  approve: (id) => api.put(`/payments/${id}/approve`),
  reject: (id, reason) => api.put(`/payments/${id}/reject`, { rejectionReason: reason }),
  getAll: (status) => api.get('/payments/all', { params: { status } })
};

// Referrals API
export const referralsAPI = {
  getMyNetwork: () => api.get('/referrals/my-network'),
  getStats: () => api.get('/referrals/stats'),
  getTree: (userId) => api.get('/referrals/tree', { params: { userId } })
};

// Admin API
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllBooks: () => api.get('/admin/books')
};

export default api;
