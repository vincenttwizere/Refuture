import { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';

export const useNotifications = (userSettings = null) => {
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

  // Add real-time polling for notifications (respecting user settings)
  useEffect(() => {
    // Check if user has enabled notifications
    const notificationsEnabled = userSettings?.notifications?.push !== false;
    
    if (!notificationsEnabled) {
      return; // Don't poll if notifications are disabled
    }

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000); // Poll every 5 seconds for better real-time updates

    return () => clearInterval(interval);
  }, [userSettings?.notifications?.push]);

  // Filter notifications based on user preferences
  const filteredNotifications = notifications.filter(notification => {
    if (!userSettings?.notifications?.types) return true;
    
    const notificationType = notification.type;
    const typeSettings = userSettings.notifications.types;
    
    switch (notificationType) {
      case 'opportunity_posted':
        return typeSettings.opportunities !== false;
      case 'interview':
        return typeSettings.interviews !== false;
      case 'message':
        return typeSettings.messages !== false;
      case 'application':
        return typeSettings.applications !== false;
      default:
        return true;
    }
  });

  return {
    notifications: filteredNotifications,
    loading,
    error,
    refetch: fetchNotifications
  };
}; 