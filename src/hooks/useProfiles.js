import { useState, useEffect } from 'react';
import { profilesAPI } from '../services/api';

export const useProfiles = (filters = {}) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfiles = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await profilesAPI.getAll({
        ...filters,
        ...params
      });
      
      setProfiles(response.data.profiles || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profiles');
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

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
    fetchProfiles();
  }, [JSON.stringify(filters)]);

  return {
    profiles,
    loading,
    error,
    fetchProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
    refetch: () => fetchProfiles()
  };
};

export const useProfile = (id) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    if (!id) return;
    
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