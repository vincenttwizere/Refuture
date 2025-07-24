import { useState, useEffect, useRef, useCallback } from 'react';
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

  const fetchOpportunities = useCallback(async (params = {}) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching opportunities with filters:', filters, 'params:', params);
      
      // Add timeout logic
      const timeoutMs = 30000; // 30 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
          abortControllerRef.current.abort();
          reject(new Error('Request timed out after 30 seconds'));
        }, timeoutMs)
      );
      const fetchPromise = opportunitiesAPI.getAll({
        ...filters,
        ...params,
        signal: abortControllerRef.current.signal
      });
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      console.log('Opportunities response:', response.data);
      // Handle both response formats: {opportunities: []} and {data: []}
      const opportunities = response.data.opportunities || response.data.data || [];
      setOpportunities(opportunities);
      setPagination(response.data.pagination || {});
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request was aborted or timed out');
        return;
      }
      setError(err.response?.data?.message || err.message || 'Failed to fetch opportunities');
      // Do NOT clear opportunities on error - keep existing data
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

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

  const updateOpportunityStatus = async (id, status) => {
    try {
      const response = await opportunitiesAPI.updateStatus(id, { status });
      // Update the local state
      setOpportunities(prev =>
        prev.map(opp =>
          opp._id === id ? { ...opp, status } : opp
        )
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update opportunity status');
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
      // Add a small delay to prevent rapid re-fetching
      const timer = setTimeout(() => {
      fetchOpportunities();
      }, 100);
      return () => clearTimeout(timer);
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user?._id, fetchOpportunities]);

  return {
    opportunities: opportunities,
    loading,
    error,
    pagination,
    fetchOpportunities,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    updateOpportunityStatus,
    refetch: () => fetchOpportunities(),
    isTimeout: error && error.toLowerCase().includes('timeout')
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