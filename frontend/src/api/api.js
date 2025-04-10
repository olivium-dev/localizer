import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API client setup
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Language API services
export const languageApi = {
  getAll: () => apiClient.get('/languages'),
  getById: (id) => apiClient.get(`/languages/${id}`),
  create: (language) => apiClient.post('/languages', language),
  update: (id, language) => apiClient.put(`/languages/${id}`, language),
  delete: (id) => apiClient.delete(`/languages/${id}`),
};

// Key API services
export const keyApi = {
  getAll: () => apiClient.get('/keys'),
  getById: (id) => apiClient.get(`/keys/${id}`),
  create: (key) => apiClient.post('/keys', key),
  update: (id, key) => apiClient.put(`/keys/${id}`, key),
  delete: (id) => apiClient.delete(`/keys/${id}`),
}; 