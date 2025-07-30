import { useState, useEffect, useCallback, useRef } from 'react';
import { profilesAPI } from '../services/api';

export const useProfiles = (filters = {}) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);
  const lastFetchTime = useRef(0);

  const fetchProfiles = useCallback(async (params = {}, forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching profiles with filters:', filters, 'params:', params, 'forceRefresh:', forceRefresh);
      console.log('Full request params:', { ...filters, ...params });
      
      // Add cache buster for force refresh
      const requestParams = {
        ...filters,
        ...params,
        ...(forceRefresh && { _t: Date.now() }) // Add timestamp for cache busting
      };
      
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
        ...requestParams,
        signal: controller.signal
      });
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      console.log('Profiles response:', response.data);
      console.log('Profiles count:', response.data.profiles?.length || 0);
      setProfiles(response.data.profiles || []);
      lastFetchTime.current = Date.now();
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
      console.log('useProfiles - Updating profile:', { id, profileData });
      const response = await profilesAPI.update(id, profileData);
      console.log('useProfiles - Backend response:', response.data);
      
      // Update the local state
      setProfiles(prev => {
        const updated = prev.map(profile => 
          profile._id === id ? response.data.profile : profile
        );
        console.log('useProfiles - Updated profiles state:', updated);
        return updated;
      });
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
    // Only fetch once on mount or when filters change significantly
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime.current;
    const minInterval = 2000; // 2 seconds between fetches
    
    if (!hasFetched.current || (timeSinceLastFetch > minInterval && Object.keys(filters).length > 0)) {
      hasFetched.current = true;
      const timer = setTimeout(() => {
        fetchProfiles();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [JSON.stringify(filters)]); // Use JSON.stringify to compare filters object

  return {
    profiles: profiles, // Use current state instead of lastGoodProfiles
    loading,
    error,
    fetchProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
    refetch: () => fetchProfiles({}, true), // Force refresh with cache buster
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
