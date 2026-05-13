import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add JWT token to requests
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

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // For blob responses, return the full response object
    // Use optional chaining to safely check responseType
    if (response.config?.responseType === 'blob') {
      return response;
    }
    return response.data;
  },
  async (error) => {
    // Handle blob error responses
    if (error.config?.responseType === 'blob' && error.response?.data instanceof Blob) {
      // Try to parse blob error as JSON
      try {
        const text = await error.response.data.text();
        const errorData = JSON.parse(text);
        error.response.data = errorData;
      } catch (e) {
        // If parsing fails, keep original blob
        console.error('Failed to parse blob error:', e);
      }
    }

    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
