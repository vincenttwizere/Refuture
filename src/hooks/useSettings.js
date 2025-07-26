import { useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const applySettingsToApp = useCallback((settings) => {
    if (!settings) return;

    // Force light theme - disable dark mode completely
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-dark', 'theme-auto');
    root.classList.add('theme-light');

    // Store in localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }, []);

  const fetchSettings = useCallback(async () => {
    // Check if user is authenticated before making API call
    const token = localStorage.getItem('token');
    if (!token || !user?._id) {
      console.log('No token or user found, skipping settings fetch');
      // Apply default settings
      const defaultSettings = {
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      };
      setSettings(defaultSettings);
      applySettingsToApp(defaultSettings);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await settingsAPI.get();
      if (response.data.success) {
        setSettings(response.data.settings);
        applySettingsToApp(response.data.settings);
      } else {
        throw new Error(response.data.message || 'Failed to fetch settings');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      
      // Handle 401 Unauthorized gracefully
      if (err.response?.status === 401) {
        console.log('Unauthorized access to settings, using defaults');
        // Apply default settings instead of throwing error
        const defaultSettings = {
          preferences: {
            theme: 'light',
            language: 'en',
            notifications: {
              email: true,
              push: true,
              sms: false
            }
          }
        };
        setSettings(defaultSettings);
        applySettingsToApp(defaultSettings);
        return;
      }
      
      setError(err.response?.data?.message || err.message || 'Failed to fetch settings');
      
      // Apply default settings on error
      const defaultSettings = {
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      };
      setSettings(defaultSettings);
      applySettingsToApp(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, [user?._id, applySettingsToApp]);

  const updateSettings = useCallback(async (newSettings) => {
    // Check if user is authenticated before making API call
    const token = localStorage.getItem('token');
    if (!token || !user?._id) {
      console.log('No token or user found, skipping settings update');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await settingsAPI.update(newSettings);
      if (response.data.success) {
        setSettings(response.data.settings);
        applySettingsToApp(response.data.settings);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update settings');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?._id, applySettingsToApp]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings
  };
}; 