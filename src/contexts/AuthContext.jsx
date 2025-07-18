import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:5001/api/auth/me');
          console.log('Auth check response:', response.data); // Debug log
          if (response.data.success && response.data.user) {
            setUser(response.data.user);
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password
      });

      console.log('Login response:', response.data); // Debug log
      const { token: newToken, user: userData, redirectTo } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);

      return { success: true, redirectTo, user: userData };
    } catch (error) {
      if (error.response) {
        const message = error.response.data?.message || 'Login failed';
        return { success: false, message };
      } else if (error.request) {
        return { success: false, message: 'Unable to reach server. Please try again later.' };
      } else {
        return { success: false, message: 'An unexpected error occurred.' };
      }
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5001/api/auth/signup', userData);
      
      const { token: newToken, user: newUser, redirectTo } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);

      return { success: true, redirectTo };
    } catch (error) {
      if (error.response) {
        const message = error.response.data?.message || 'Signup failed';
        return { success: false, message };
      } else if (error.request) {
        return { success: false, message: 'Unable to reach server. Please try again later.' };
      } else {
        return { success: false, message: 'An unexpected error occurred.' };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const response = await axios.get('http://localhost:5001/api/auth/me');
        if (response.data.success && response.data.user) {
          setUser(response.data.user);
          return { success: true, user: response.data.user };
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'No token available' };
  };

  // Function to check if user should be redirected based on their profile status
  const getRedirectPath = (user) => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'refugee':
        return user.hasProfile ? '/refugee-dashboard' : '/create-profile';
      case 'provider':
        return '/provider-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/';
    }
  };

  const value = {
    user,
    token,
    login,
    signup,
    logout,
    refreshUser,
    loading,
    isAuthenticated: !!user && !!token,
    getRedirectPath
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 