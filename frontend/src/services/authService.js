import api from './api';

/**
 * Login user
 */
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response;
};

/**
 * Logout user
 */
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response;
};

/**
 * Get current user info
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response;
};
