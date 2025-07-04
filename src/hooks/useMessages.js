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
      setMessages(response.data.messages || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages
  };
}; 