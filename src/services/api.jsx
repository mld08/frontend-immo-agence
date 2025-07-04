import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const biensAPI = {
  getAll: (params = {}) => api.get('/biens', { params }),
  getById: (id) => api.get(`/biens/${id}`),
  create: (data) => api.post('/biens', data),
  update: (id, data) => api.put(`/biens/${id}`, data),
  delete: (id) => api.delete(`/biens/${id}`),
  getStats: () => api.get('/stats'),
};

export default api;