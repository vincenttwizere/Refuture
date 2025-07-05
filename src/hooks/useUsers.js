import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

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

  const updateUserStatus = useCallback(async (userId, status, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5001/api/users/${userId}/status`,
        { status, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, status, statusReason: reason }
            : user
        )
      );
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating user status');
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
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

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    updateUserStatus,
    deleteUser,
    getUserById
  };
}; 