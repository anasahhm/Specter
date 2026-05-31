import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
 
  timeout: 120000
});


apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('specter_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('specter_token');
      localStorage.removeItem('specter_user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
