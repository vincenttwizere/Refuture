import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
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
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', error.response?.status, error.response?.data); // Debug log
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - clearing auth data'); // Debug log
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Opportunities API
export const opportunitiesAPI = {
  getAll: (params = {}) => api.get('/opportunities', { params }),
  getById: (id) => api.get(`/opportunities/${id}`),
  create: (data) => api.post('/opportunities', data),
  update: (id, data) => api.put(`/opportunities/${id}`, data),
  delete: (id) => api.delete(`/opportunities/${id}`),
  getByProvider: (providerId) => api.get(`/opportunities/provider/${providerId}`),
  // Saved opportunities
  getSaved: () => api.get('/opportunities/saved'),
  checkIfSaved: (id) => api.get(`/opportunities/${id}/saved`),
  save: (id) => api.post(`/opportunities/${id}/save`),
  unsave: (id) => api.delete(`/opportunities/${id}/save`)
};

// Profiles API
export const profilesAPI = {
  getAll: (params = {}) => api.get('/profiles', { params }),
  getById: (id) => api.get(`/profiles/${id}`),
  create: (data) => api.post('/profiles', data),
  update: (id, data) => api.put(`/profiles/${id}`, data),
  delete: (id) => api.delete(`/profiles/${id}`),
};

// Interviews API
export const interviewsAPI = {
  // Provider endpoints
  sendInvite: (data) => api.post('/interviews/invite', data),
  getProviderInterviews: (params = {}) => api.get('/interviews/provider', { params }),
  
  // Talent endpoints
  getTalentInterviews: (params = {}) => api.get('/interviews/talent', { params }),
  respondToInterview: (id, data) => api.put(`/interviews/${id}/respond`, data),
  
  // Common endpoints
  getById: (id) => api.get(`/interviews/${id}`),
  update: (id, data) => api.put(`/interviews/${id}`, data),
  delete: (id) => api.delete(`/interviews/${id}`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  create: (data) => api.post('/notifications', data),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`)
};

export const messagesAPI = {
  getAll: () => api.get('/messages'),
  send: (data) => api.post('/messages', data),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  delete: (id) => api.delete(`/messages/${id}`)
};

export default api; 