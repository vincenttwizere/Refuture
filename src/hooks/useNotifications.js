import { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationsAPI.getAll();
      setNotifications(response.data.notifications || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Add real-time polling for notifications (every 5 seconds for better responsiveness)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000); // Poll every 5 seconds for better real-time updates

    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications
  };
}; 