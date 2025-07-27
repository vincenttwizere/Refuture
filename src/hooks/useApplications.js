import { useState, useEffect, useRef } from 'react';
import { applicationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useApplications = (opportunityId = null, userRole = null) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);
  const lastFetchTime = useRef(0);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching applications - opportunityId:', opportunityId, 'userRole:', userRole, 'user:', user?.role);
      
      // Add timeout logic
      const timeoutMs = 10000; // 10 seconds
      const controller = new AbortController();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
          controller.abort();
          reject(new Error('Request timed out after 10 seconds'));
        }, timeoutMs)
      );
      let fetchPromise;
      if (opportunityId) {
        fetchPromise = applicationsAPI.getOpportunityApplications(opportunityId, { signal: controller.signal });
      } else if (userRole === 'refugee' || user?.role === 'refugee') {
        fetchPromise = applicationsAPI.getUserApplications({ signal: controller.signal });
      } else if (userRole === 'admin' || user?.role === 'admin') {
        fetchPromise = applicationsAPI.getAllApplications({ signal: controller.signal });
      } else {
        fetchPromise = applicationsAPI.getProviderApplications({ signal: controller.signal });
      }
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      console.log('Applications response:', response.data);
      setApplications(response.data.applications || []);
      lastFetchTime.current = Date.now();
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request was aborted or timed out');
        return;
      }
      setError(err.response?.data?.message || 'Failed to fetch applications');
      // Do NOT clear applications on error - keep existing data
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status, reviewNotes = '') => {
    try {
      const response = await applicationsAPI.updateStatus(applicationId, { status, reviewNotes });
      console.log('Application status updated:', response.data);
      
      // Refresh applications after update
      await fetchApplications();
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error updating application status:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to update application status' 
      };
    }
  };

  useEffect(() => {
    // Fetch on mount or when opportunityId/userRole changes
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime.current;
    const minInterval = 2000; // 2 seconds between fetches
    
    if (!hasFetched.current || (timeSinceLastFetch > minInterval && (opportunityId || userRole))) {
      hasFetched.current = true;
      const timer = setTimeout(() => {
        fetchApplications();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [opportunityId, userRole]);

  // Remove the aggressive polling - only poll if explicitly needed
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchApplications();
  //   }, 10000); // Poll every 10 seconds
  //   return () => clearInterval(interval);
  // }, [opportunityId]);

  return {
    applications: applications,
    loading,
    error,
    refetch: fetchApplications,
    updateApplicationStatus
  };
}; 