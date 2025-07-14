import { useState, useEffect, useRef } from 'react';
import { interviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useInterviews = (userRole = 'provider') => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    hasNext: false,
    hasPrev: false
  });
  const abortControllerRef = useRef(null);

  const fetchInterviews = async (params = {}) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (userRole === 'provider') {
        response = await interviewsAPI.getProviderInterviews(params);
      } else {
        response = await interviewsAPI.getTalentInterviews(params);
      }
      
      setInterviews(response.data.interviews || []);
      setPagination(response.data.pagination || {
        current: 1,
        total: 1,
        hasNext: false,
        hasPrev: false
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Request was cancelled
      }
      console.error('Error fetching interviews:', err);
      // Don't set error for 404 or empty results, just set empty array
      if (err.response?.status === 404 || err.response?.status === 401) {
        setInterviews([]);
        setError(null);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch interviews');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendInterviewInvite = async (inviteData) => {
    try {
      const response = await interviewsAPI.sendInvite(inviteData);
      // Refresh the list after sending invite
      await fetchInterviews();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send interview invite');
      throw err;
    }
  };

  const respondToInterview = async (interviewId, response) => {
    try {
      const result = await interviewsAPI.respondToInterview(interviewId, response);
      // Update the local state
      setInterviews(prev => 
        prev.map(interview => 
          interview._id === interviewId 
            ? { ...interview, ...result.data.interview }
            : interview
        )
      );
      return result.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to respond to interview');
      throw err;
    }
  };

  const updateInterview = async (interviewId, updateData) => {
    try {
      const response = await interviewsAPI.update(interviewId, updateData);
      // Update the local state
      setInterviews(prev => 
        prev.map(interview => 
          interview._id === interviewId ? response.data.interview : interview
        )
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update interview');
      throw err;
    }
  };

  const deleteInterview = async (interviewId) => {
    try {
      await interviewsAPI.delete(interviewId);
      // Remove from local state
      setInterviews(prev => prev.filter(interview => interview._id !== interviewId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete interview');
      throw err;
    }
  };

  const selectAvailabilitySlot = async (interviewId, slotIndex) => {
    try {
      const response = await interviewsAPI.selectSlot(interviewId, slotIndex);
      // Update the local state
      setInterviews(prev => 
        prev.map(interview => 
          interview._id === interviewId 
            ? { ...interview, ...response.data.interview }
            : interview
        )
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to select availability slot');
      throw err;
    }
  };

  const getAvailabilitySlots = async (interviewId) => {
    try {
      const response = await interviewsAPI.getAvailability(interviewId);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch availability slots');
      throw err;
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchInterviews();
    }
    
    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user?._id, userRole]);

  return {
    interviews,
    loading,
    error,
    pagination,
    fetchInterviews,
    sendInterviewInvite,
    respondToInterview,
    updateInterview,
    deleteInterview,
    selectAvailabilitySlot,
    getAvailabilitySlots,
    refetch: () => fetchInterviews()
  };
};

export const useInterview = (id) => {
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInterview = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await interviewsAPI.getById(id);
      setInterview(response.data.interview);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch interview');
      console.error('Error fetching interview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterview();
  }, [id]);

  return {
    interview,
    loading,
    error,
    refetch: fetchInterview
  };
}; 