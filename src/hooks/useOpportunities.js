import { useState, useEffect, useRef, useCallback } from 'react';
import { opportunitiesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Deep comparison function for arrays
function deepEqual(arr1, arr2) {
  if (arr1 === arr2) return true;
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;
  
  for (let i = 0; i < arr1.length; i++) {
    const item1 = arr1[i];
    const item2 = arr2[i];
    if (item1._id !== item2._id || 
        item1.title !== item2.title ||
        item1.type !== item2.type ||
        item1.status !== item2.status ||
        item1.description !== item2.description ||
        item1.location !== item2.location ||
        item1.salary !== item2.salary ||
        item1.deadline !== item2.deadline ||
        item1.updatedAt !== item2.updatedAt ||
        item1.createdAt !== item2.createdAt) {
      return false;
    }
  }
  return true;
}

export const useOpportunities = (filters = {}) => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false); // Start with false to prevent flickering
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const abortControllerRef = useRef(null);
  const isInitialLoad = useRef(true);
  const opportunitiesRef = useRef([]);
  const lastFetchTime = useRef(0);
  const filtersRef = useRef(filters);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const hasLoadedOnce = useRef(false); // Track if we've loaded data at least once

  const fetchOpportunities = useCallback(async (params = {}) => {
    // Prevent multiple simultaneous requests
    if (loading && !isInitialLoad.current) {
      console.log('Skipping fetch - already loading');
      return;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      // Only set loading to true if we haven't loaded data yet or explicitly refetching
      if (!hasLoadedOnce.current || opportunitiesRef.current.length === 0) {
        setLoading(true);
      }
      setError(null);
      console.log('Fetching opportunities with filters:', filtersRef.current, 'params:', params);
      
      // Use axios timeout instead of custom timeout
      const response = await opportunitiesAPI.getAll({
        ...filtersRef.current,
        ...params,
        signal: abortControllerRef.current.signal
      });
      
      // Reset retry count on success
      retryCount.current = 0;
      console.log('Opportunities response:', response.data);
      // Handle both response formats: {opportunities: []} and {data: []}
      const newOpportunities = response.data.opportunities || response.data.data || [];
      
      // Only update state if data has actually changed
      if (!deepEqual(opportunitiesRef.current, newOpportunities)) {
        console.log('Opportunities data changed, updating state');
        setOpportunities(newOpportunities);
        opportunitiesRef.current = newOpportunities;
      } else {
        console.log('Opportunities data unchanged, skipping state update');
      }
      
      setPagination(response.data.pagination || {});
      isInitialLoad.current = false;
      hasLoadedOnce.current = true; // Mark that we've loaded data at least once
      lastFetchTime.current = Date.now();
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request was aborted or timed out');
        return;
      }
      
      // Increment retry count
      retryCount.current += 1;
      
      // Don't retry if we've exceeded max retries
      if (retryCount.current >= maxRetries) {
        setError('Failed to fetch opportunities after multiple attempts. Please refresh the page.');
        console.error('Max retries exceeded for opportunities fetch');
        return;
      }
      
      // Don't retry immediately on timeout errors
      if (err.message && err.message.includes('timeout')) {
        setError('Request timed out. Please try again later.');
        console.error('Timeout error fetching opportunities:', err);
        
        // Wait longer before retrying on timeout
        setTimeout(() => {
          if (retryCount.current < maxRetries) {
            console.log('Retrying after timeout...');
            fetchOpportunities();
          }
        }, 5000); // Wait 5 seconds before retry
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch opportunities');
        console.error('Error fetching opportunities:', err);
      }
      
      // Do NOT clear opportunities on error - keep existing data
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
      // Only fetch on initial load or if we haven't loaded data yet
      if (!hasLoadedOnce.current) {
        console.log('Initial opportunities fetch...');
        fetchOpportunities();
      } else {
        // For subsequent loads, use debouncing
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTime.current;
        const minInterval = 30000; // Increased to 30 seconds between fetches
        
        if (timeSinceLastFetch < minInterval) {
          console.log(`Skipping fetch, too soon since last fetch: ${timeSinceLastFetch}ms`);
          return;
        }
        
        console.log('Starting opportunities fetch...');
        const timer = setTimeout(() => {
          fetchOpportunities();
        }, 2000); // Increased delay to 2 seconds
        return () => clearTimeout(timer);
      }
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user?._id]); // Remove fetchOpportunities from dependencies to prevent infinite loops

  // Update filters ref when filters change
  useEffect(() => {
    const filtersChanged = JSON.stringify(filtersRef.current) !== JSON.stringify(filters);
    if (filtersChanged) {
      console.log('Filters changed, updating ref');
      filtersRef.current = filters;
      // Only refetch if we've already loaded data once
      if (hasLoadedOnce.current) {
        console.log('Filters changed, refetching opportunities');
        fetchOpportunities();
      }
    }
  }, [filters]);

  return {
    opportunities: opportunities,
    loading: loading && !hasLoadedOnce.current, // Only show loading if we haven't loaded data yet
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
    
    console.log('useOpportunity - Fetching opportunity with ID:', id);
    console.log('useOpportunity - ID type:', typeof id);
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await opportunitiesAPI.getById(id);
      console.log('useOpportunity - Response:', response.data);
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