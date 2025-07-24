import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        console.log('Found stored token, checking validity...');
        try {
          const response = await authAPI.getProfile();
          console.log('Auth check response:', response.data); // Debug log
          if (response.data.success && response.data.user) {
            setUser(response.data.user);
            setToken(storedToken);
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error) {
          console.error('Auth check failed, clearing invalid token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } else {
        console.log('No stored token found');
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email, password: '***' });
      const response = await authAPI.login({ email, password });

      console.log('Login response:', response.data); // Debug log
      const { token: newToken, user: userData, redirectTo } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);

      return { success: true, redirectTo, user: userData };
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: error.request
      });
      
      if (error.response) {
        const message = error.response.data?.message || 'Login failed';
        return { success: false, message };
      } else if (error.request) {
        console.error('Network error - unable to reach server');
        return { success: false, message: 'Unable to reach server. Please try again later.' };
      } else {
        console.error('Unexpected error:', error.message);
        return { success: false, message: 'An unexpected error occurred.' };
      }
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      
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

  // Set up token in API service when token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        // Use the configured API service instead of direct axios
        const response = await authAPI.getProfile();
        if (response.data.success && response.data.user) {
          setUser(response.data.user);
          return { success: true, user: response.data.user };
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
        // Don't log out on network errors, just return failure
        if (error.response?.status === 401) {
          // Only logout on authentication errors
          logout();
        }
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
        // Check if refugee has a profile
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