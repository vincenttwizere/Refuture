import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { apiRateLimiters } from '../utils/rateLimiter';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const fetchUsers = useCallback(async (params = {}) => {
    // Check rate limit before making request
    if (!apiRateLimiters.users.canMakeRequest()) {
      console.log('Rate limit exceeded for users API, skipping request');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/users', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserStatus = useCallback(async (userId, statusData, reason = '') => {
    // Check rate limit before making request
    if (!apiRateLimiters.users.canMakeRequest()) {
      console.log('Rate limit exceeded for users API, skipping request');
      throw new Error('Rate limit exceeded');
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5001/api/users/${userId}/status`,
        statusData, // Send the status data directly (isActive, isVerified)
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the user in the local state with the returned user data
      if (response.data.user) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId 
              ? { ...user, ...response.data.user }
              : user
          )
        );
      }
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating user status');
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    // Check rate limit before making request
    if (!apiRateLimiters.users.canMakeRequest()) {
      console.log('Rate limit exceeded for users API, skipping request');
      throw new Error('Rate limit exceeded');
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5001/api/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove the user from local state
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting user');
      throw err;
    }
  }, []);

  const getUserById = useCallback(async (userId) => {
    // Check rate limit before making request
    if (!apiRateLimiters.users.canMakeRequest()) {
      console.log('Rate limit exceeded for users API, skipping request');
      throw new Error('Rate limit exceeded');
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5001/api/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching user');
      throw err;
    }
  }, []);

  // Only fetch once on mount, not on every render
  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    updateUserStatus,
    deleteUser,
    getUserById,
    refetchUsers: fetchUsers
  };
}; 