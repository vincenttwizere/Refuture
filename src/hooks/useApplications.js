import { useState, useEffect } from 'react';
import { applicationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useApplications = (opportunityId = null, userRole = null) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (opportunityId) {
        // Fetch applications for a specific opportunity
        response = await applicationsAPI.getOpportunityApplications(opportunityId);
      } else if (userRole === 'refugee' || user?.role === 'refugee') {
        // Fetch applications for the current refugee user
        response = await applicationsAPI.getUserApplications();
      } else {
        // Fetch all applications for the current provider
        response = await applicationsAPI.getProviderApplications();
      }
      
      console.log('Applications API response:', response.data);
      setApplications(response.data.applications || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.response?.data?.message || 'Failed to fetch applications');
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
    applications,
    loading,
    error,
    refetch: fetchApplications,
    updateApplicationStatus
  };
}; 