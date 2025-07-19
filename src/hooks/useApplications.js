import { useState, useEffect } from 'react';
import { applicationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useApplications = (opportunityId = null, userRole = null) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [lastGoodApplications, setLastGoodApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
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
      } else {
        fetchPromise = applicationsAPI.getProviderApplications({ signal: controller.signal });
      }
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      setApplications(response.data.applications || []);
      setLastGoodApplications(response.data.applications || []); // Only update on success
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request was aborted or timed out');
        return;
      }
      setError(err.response?.data?.message || 'Failed to fetch applications');
      // Do NOT clear lastGoodApplications
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
    fetchApplications();
  }, [opportunityId]);

  // Add real-time polling for applications (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchApplications();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [opportunityId]);

  return {
    applications: lastGoodApplications,
    loading,
    error,
    refetch: fetchApplications,
    updateApplicationStatus
  };
}; 