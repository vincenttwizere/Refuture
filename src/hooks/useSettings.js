import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Create API instance for settings
const settingsAPI = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Add auth token to requests
settingsAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const defaultSettings = {
    notifications: {
      email: true,
      push: true,
      types: {
        opportunities: true,
        interviews: true,
        messages: true,
        applications: true
      }
    },
    privacy: {
      profileVisibility: 'public',
      showContactInfo: true,
      allowMessages: true
    },
    preferences: {
      language: 'en',
      timezone: 'UTC',
      darkMode: false,
      theme: 'light'
    },
    application: {
      autoSave: true,
      defaultCoverLetter: '',
      preferredOpportunityTypes: []
    }
  };

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.get('/settings');
      if (response.data.success) {
        setSettings(response.data.data);
        applySettingsToApp(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setSettings(defaultSettings);
      applySettingsToApp(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates) => {
    try {
      setUpdating(true);
      const response = await settingsAPI.put('/settings', updates);
      if (response.data.success) {
        const updatedSettings = response.data.data;
        setSettings(updatedSettings);
        applySettingsToApp(updatedSettings);
        return { success: true, data: updatedSettings };
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, []);

  const applySettingsToApp = useCallback((settings) => {
    if (!settings) return;

    // Apply theme
    if (settings.preferences?.theme) {
      const root = document.documentElement;
      root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
      root.classList.add(`theme-${settings.preferences.theme}`);
      
      if (settings.preferences.theme === 'dark' || 
          (settings.preferences.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply dark mode
    if (settings.preferences?.darkMode !== undefined) {
      const root = document.documentElement;
      if (settings.preferences.darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Store in localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }, []);

  const getSetting = useCallback((path) => {
    if (!settings) return null;
    return path.split('.').reduce((obj, key) => obj?.[key], settings);
  }, [settings]);

  const isSettingEnabled = useCallback((path) => {
    const value = getSetting(path);
    return value === true || value === 'enabled';
  }, [getSetting]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings && !settings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        applySettingsToApp(parsedSettings);
      } catch (err) {
        console.error('Error parsing saved settings:', err);
      }
    }
  }, [settings, applySettingsToApp]);

  return {
    settings: settings || defaultSettings,
    loading,
    error,
    updating,
    fetchSettings,
    updateSettings,
    getSetting,
    isSettingEnabled
  };
}; 