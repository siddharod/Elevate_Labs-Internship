import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('chat_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If expired or unauthorized, clean local token if needed
      if (
        error.response.data?.message?.includes('expired') ||
        error.response.data?.message?.includes('denied')
      ) {
        localStorage.removeItem('chat_token');
        localStorage.removeItem('chat_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
