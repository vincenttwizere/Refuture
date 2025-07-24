import { useState, useEffect, useCallback } from 'react';
import { profilesAPI } from '../services/api';

export const useProfiles = (filters = {}) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfiles = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching profiles with filters:', filters, 'params:', params);
      
      // Add timeout logic
      const timeoutMs = 30000; // 30 seconds
      const controller = new AbortController();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
          controller.abort();
          reject(new Error('Request timed out after 30 seconds'));
        }, timeoutMs)
      );
      const fetchPromise = profilesAPI.getAll({
        ...filters,
        ...params,
        signal: controller.signal
      });
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      console.log('Profiles response:', response.data);
      setProfiles(response.data.profiles || []);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request was aborted or timed out');
        return;
      }
      setError(err.response?.data?.message || err.message || 'Failed to fetch profiles');
      // Do NOT clear profiles on error - keep existing data
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createProfile = async (profileData) => {
    try {
      const response = await profilesAPI.create(profileData);
      // Refresh the list after creating
      await fetchProfiles();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create profile');
      throw err;
    }
  };

  const updateProfile = async (id, profileData) => {
    try {
      const response = await profilesAPI.update(id, profileData);
      // Update the local state
      setProfiles(prev => 
        prev.map(profile => 
          profile._id === id ? response.data.profile : profile
        )
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    }
  };

  const deleteProfile = async (id) => {
    try {
      await profilesAPI.delete(id);
      // Remove from local state
      setProfiles(prev => prev.filter(profile => profile._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete profile');
      throw err;
    }
  };

  useEffect(() => {
    // Add a small delay to prevent rapid re-fetching
    const timer = setTimeout(() => {
    fetchProfiles();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchProfiles]);

  return {
    profiles: profiles, // Use current state instead of lastGoodProfiles
    loading,
    error,
    fetchProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
    refetch: () => fetchProfiles(),
    // Add a helper for timeout
    isTimeout: error && error.toLowerCase().includes('timeout')
  };
};

export const useProfile = (id) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    if (!id) {
      setLoading(false);
      setProfile(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await profilesAPI.getById(id);
      setProfile(response.data.profile);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile
  };
}; 
