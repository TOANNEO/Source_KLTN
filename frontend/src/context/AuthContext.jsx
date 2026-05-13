import { createContext, useState, useEffect } from 'react';
import { login as loginService, logout as logoutService } from '../services/authService';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginService(email, password);

      if (response.success) {
        const { token, user } = response.data;

        // Save to state
        setToken(token);
        setUser(user);

        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Return success without toast (LoginPage will handle success message)
        return { success: true };
      }
    } catch (error) {
      // Return error message without toast (LoginPage will display it)
      return {
        success: false,
        error: error.message || 'Đăng nhập thất bại'
      };
    }
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and localStorage
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Đã đăng xuất');
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    isLecturer: user?.role === 'lecturer'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
