import { useState, useEffect, useRef } from 'react';
import { opportunitiesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useOpportunities = (filters = {}) => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const abortControllerRef = useRef(null);

  const fetchOpportunities = async (params = {}) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await opportunitiesAPI.getAll({
        ...filters,
        ...params
      });
      
      setOpportunities(response.data.opportunities);
      setPagination(response.data.pagination);
    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Request was cancelled
      }
      setError(err.response?.data?.message || 'Failed to fetch opportunities');
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const createOpportunity = async (opportunityData) => {
    try {
      const response = await opportunitiesAPI.create(opportunityData);
      // Refresh the list after creating
      await fetchOpportunities();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create opportunity');
      throw err;
    }
  };

  const updateOpportunity = async (id, opportunityData) => {
    try {
      const response = await opportunitiesAPI.update(id, opportunityData);
      // Update the local state
      setOpportunities(prev => 
        prev.map(opp => 
          opp._id === id ? response.data.opportunity : opp
        )
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update opportunity');
      throw err;
    }
  };

  const deleteOpportunity = async (id) => {
    try {
      await opportunitiesAPI.delete(id);
      // Remove from local state
      setOpportunities(prev => prev.filter(opp => opp._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete opportunity');
      throw err;
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchOpportunities();
    }
    
    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [JSON.stringify(filters), user?._id]);

  return {
    opportunities,
    loading,
    error,
    pagination,
    fetchOpportunities,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    refetch: () => fetchOpportunities()
  };
};

export const useOpportunity = (id) => {
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOpportunity = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await opportunitiesAPI.getById(id);
      setOpportunity(response.data.opportunity);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch opportunity');
      console.error('Error fetching opportunity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunity();
  }, [id]);

  return {
    opportunity,
    loading,
    error,
    refetch: fetchOpportunity
  };
}; 