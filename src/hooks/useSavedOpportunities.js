import { useState, useEffect } from 'react';
import { opportunitiesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useSavedOpportunities = () => {
  const { user } = useAuth();
  const [savedOpportunities, setSavedOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSavedOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await opportunitiesAPI.getSaved();
      setSavedOpportunities(response.data.opportunities);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch saved opportunities');
      console.error('Error fetching saved opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveOpportunity = async (opportunityId) => {
    try {
      await opportunitiesAPI.save(opportunityId);
      // Refresh the saved opportunities list
      await fetchSavedOpportunities();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save opportunity');
      throw err;
    }
  };

  const unsaveOpportunity = async (opportunityId) => {
    try {
      await opportunitiesAPI.unsave(opportunityId);
      // Remove from local state
      setSavedOpportunities(prev => prev.filter(opp => opp._id !== opportunityId));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unsave opportunity');
      throw err;
    }
  };

  const checkIfSaved = async (opportunityId) => {
    try {
      const response = await opportunitiesAPI.checkIfSaved(opportunityId);
      return response.data.isSaved;
    } catch (err) {
      console.error('Error checking if opportunity is saved:', err);
      return false;
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchSavedOpportunities();
    }
  }, [user?._id]);

  return {
    savedOpportunities,
    loading,
    error,
    saveOpportunity,
    unsaveOpportunity,
    checkIfSaved,
    refetch: fetchSavedOpportunities
  };
}; 