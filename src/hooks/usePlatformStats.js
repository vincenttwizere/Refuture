import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const usePlatformStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://refuture-backend-1.onrender.com/api'}/users/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching platform statistics');
      console.error('Error fetching platform stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, []); // Empty dependency array

  return {
    stats,
    loading,
    error,
    refetchStats: fetchStats
  };
}; 