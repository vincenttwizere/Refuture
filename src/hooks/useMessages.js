import { useState, useEffect } from 'react';
import { messagesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No authentication token found');
        setMessages([]);
        setError('Authentication required');
        return;
      }
      
      const response = await messagesAPI.getAll();
      console.log('Messages API response:', response.data);
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      
      // Handle different types of errors
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 404) {
        setError('Messages service not found');
      } else if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch messages');
      }
      
      // Set empty messages array on error
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch messages if user is authenticated
    if (user) {
      fetchMessages();
    } else {
      setLoading(false);
      setMessages([]);
    }
  }, [user]);

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages
  };
}; 