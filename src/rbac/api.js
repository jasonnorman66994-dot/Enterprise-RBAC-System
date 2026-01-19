import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// Role API
export const roleAPI = {
  getAll: () => api.get('/roles').then(res => res.data),
  getById: (id) => api.get(`/roles/${id}`).then(res => res.data),
  create: (data) => api.post('/roles', data).then(res => res.data),
  update: (id, data) => api.put(`/roles/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/roles/${id}`).then(res => res.data),
  updatePermissions: (id, permissions) => 
    api.put(`/roles/${id}/permissions`, { permissions }).then(res => res.data),
};

// Permission API
export const permissionAPI = {
  getAll: () => api.get('/permissions').then(res => res.data),
  create: (data) => api.post('/permissions', data).then(res => res.data),
};

// User API
export const userAPI = {
  getAll: () => api.get('/users').then(res => res.data),
  updateRoles: (userId, roles) => 
    api.put(`/users/${userId}/roles`, { roles }).then(res => res.data),
};

// Audit Log API
export const auditAPI = {
  getAll: (params) => api.get('/audit-logs', { params }).then(res => res.data),
  create: (data) => api.post('/audit-logs', data).then(res => res.data),
};

export default api;
