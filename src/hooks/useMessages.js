import { useState, useEffect } from 'react';
import { messagesAPI } from '../services/api';

export const useMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messagesAPI.getAll();
      console.log('Messages API response:', response.data);
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Add real-time polling for messages (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages
  };
}; 